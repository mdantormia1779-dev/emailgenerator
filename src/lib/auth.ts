import { DEFAULT_USER_ID } from '@/services/profile.service';

/**
 * Resolves current authenticated user session.
 * For production, hooks into session cookies or NextAuth.
 * Falls back to DEFAULT_USER_ID for seamless local development.
 */
export async function getSessionUserId(): Promise<string> {
  // Can be extended with cookies() or JWT token verification
  return DEFAULT_USER_ID;
}
