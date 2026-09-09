import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSessionUserId } from '@/lib/auth';
import { getMetaAuthUrl } from '@/services/meta.service';
import { formatErrorResponse } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    await getSessionUserId();

    // Generate random CSRF state
    const state = crypto.randomBytes(24).toString('hex');
    const authUrl = getMetaAuthUrl(state);

    const isHttps =
      req.nextUrl.protocol === 'https:' ||
      req.headers.get('x-forwarded-proto') === 'https';

    const response = NextResponse.json({
      success: true,
      authUrl,
    });

    // Store state in secure HTTP-only cookie for callback validation
    response.cookies.set({
      name: 'meta_oauth_state',
      value: state,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15, // 15 minutes
    });

    return response;
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
