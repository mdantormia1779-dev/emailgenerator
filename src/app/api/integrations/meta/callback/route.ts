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
  const errorDescription = url.searchParams.get('error_description');

  const redirectBase = new URL('/integrations', req.url);

  // 1. Handle user cancellation or denial
  if (errorParam) {
    redirectBase.searchParams.set('meta_error', errorDescription || errorParam);
    return NextResponse.redirect(redirectBase);
  }

  if (!code || !state) {
    redirectBase.searchParams.set('meta_error', 'Missing authorization code or state parameter.');
    return NextResponse.redirect(redirectBase);
  }

  // 2. Validate CSRF state
  const cookieState = req.cookies.get('meta_oauth_state')?.value;
  if (!cookieState || cookieState !== state) {
    redirectBase.searchParams.set('meta_error', 'Invalid OAuth state. Potential CSRF detected.');
    return NextResponse.redirect(redirectBase);
  }

  try {
    const userId = await getSessionUserId();

    // 3. Exchange code for long-lived access token
    const { accessToken, expiresInSeconds } = await exchangeCodeForLongLivedToken(code);

    // 4. Fetch profile from Meta Graph API
    const profile = await getMetaUserProfile(accessToken);

    // 5. Store account with AES-256-GCM encrypted token
    await saveMetaAccount(userId, profile, accessToken, expiresInSeconds);

    redirectBase.searchParams.set('meta_connected', 'true');
    redirectBase.searchParams.set('name', profile.name);

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
    console.error('[Meta OAuth Callback Error]:', err);
    redirectBase.searchParams.set('meta_error', err.message || 'Failed to complete Meta authentication.');
    return NextResponse.redirect(redirectBase);
  }
}
