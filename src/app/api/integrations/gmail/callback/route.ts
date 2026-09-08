import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { handleOAuthCallback } from '@/services/gmail.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (error || !code) {
      return NextResponse.redirect(`${appUrl}/integrations?error=${encodeURIComponent(error || 'No code provided')}`);
    }

    const userId = await getSessionUserId();
    const gmailEmail = await handleOAuthCallback(userId, code);

    return NextResponse.redirect(
      `${appUrl}/integrations?connected=true&email=${encodeURIComponent(gmailEmail)}`
    );
  } catch (err: any) {
    console.error('OAuth callback error:', err);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${appUrl}/integrations?error=${encodeURIComponent(err.message || 'OAuth failure')}`
    );
  }
}
