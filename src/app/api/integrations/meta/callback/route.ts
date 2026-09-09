import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import {
  exchangeCodeForLongLivedToken,
  getMetaUserProfile,
  saveMetaAccount,
} from '@/services/meta.service';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');
  const errorReason = url.searchParams.get('error_reason');
  const errorDescription = url.searchParams.get('error_description');

  const redirectBase = new URL('/integrations', req.url);

  // 1. Handle user cancellation or denial
  if (errorParam || errorReason) {
    let message = errorDescription || errorParam || 'Meta authorization was cancelled or denied.';
    if (errorReason === 'user_denied' || errorParam === 'access_denied') {
      message = 'Meta authorization was cancelled or denied by the user.';
    }
    redirectBase.searchParams.set('meta_error', message);
    return NextResponse.redirect(redirectBase);
  }

  // 2. Handle missing OAuth code or state
  if (!code || !state) {
    const missingField = !code && !state ? 'code and state' : !code ? 'authorization code' : 'state parameter';
    redirectBase.searchParams.set('meta_error', `Missing ${missingField} from Meta.`);
    return NextResponse.redirect(redirectBase);
  }

  // 3. Validate CSRF state
  const cookieState = req.cookies.get('meta_oauth_state')?.value;
  if (!cookieState || cookieState !== state) {
    redirectBase.searchParams.set('meta_error', 'Invalid or expired OAuth state. Potential CSRF detected. Please try connecting again.');
    return NextResponse.redirect(redirectBase);
  }

  try {
    const userId = await getSessionUserId();

    // 4. Exchange code for long-lived access token
    const { accessToken, expiresInSeconds } = await exchangeCodeForLongLivedToken(code);

    // 5. Fetch profile from Meta Graph API
    const profile = await getMetaUserProfile(accessToken);

    // 6. Store account with AES-256-GCM encrypted token using existing MetaAccount model
    await saveMetaAccount(userId, profile, accessToken, expiresInSeconds);

    redirectBase.searchParams.set('meta_connected', 'true');
    redirectBase.searchParams.set('name', profile.name);

    if (!profile.email) {
      redirectBase.searchParams.set('meta_notice', 'email_not_provided');
    }

    const response = NextResponse.redirect(redirectBase);
    // Clear state cookie
    response.cookies.set({
      name: 'meta_oauth_state',
      value: '',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (err: any) {
    // Sanitize log: NEVER log tokens, secrets, authorization codes, or sensitive objects
    console.error('[Meta OAuth Callback Error]:', err?.message || 'Authentication failed');
    redirectBase.searchParams.set('meta_error', err?.message || 'Failed to complete Meta authentication.');
    return NextResponse.redirect(redirectBase);
  }
}
