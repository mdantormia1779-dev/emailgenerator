import { cookies, headers } from 'next/headers';
import { AUTH_COOKIE_NAME, verifyToken, AuthUserPayload } from './auth-jwt';
import { DEFAULT_USER_ID } from '@/services/profile.service';
import { UnauthorizedError } from './errors';

/**
 * Resolves the currently authenticated user session from cookie or Authorization header.
 * Returns null if no valid token is present.
 */
export async function getSessionUser(): Promise<AuthUserPayload | null> {
  try {
    // 1. Try reading HTTP-only auth cookie
    const cookieStore = await cookies();
    const tokenFromCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (tokenFromCookie) {
      const payload = verifyToken(tokenFromCookie);
      if (payload) return payload;
    }

    // 2. Try Authorization: Bearer header
    const headersList = await headers();
    const authHeader = headersList.get('authorization') || headersList.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const tokenFromHeader = authHeader.slice(7).trim();
      const payload = verifyToken(tokenFromHeader);
      if (payload) return payload;
    }
  } catch {
    // In static rendering or test environments without request context
    return null;
  }

  return null;
}


/**
 * Resolves current authenticated user ID.
 * Returns the authenticated userId if signed in.
 * Throws UnauthorizedError if not signed in.
 */
export async function getSessionUserId(): Promise<string> {
  const sessionUser = await getSessionUser();
  if (sessionUser?.userId) {
    return sessionUser.userId;
  }

  throw new UnauthorizedError('Authentication required. Please sign in to continue.');
}
