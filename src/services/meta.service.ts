import prisma from '@/lib/prisma';
import { encryptToken, decryptToken } from '@/lib/crypto';
import { AppError } from '@/lib/errors';

export interface MetaConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

export interface MetaUserProfile {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

export interface MetaPageItem {
  id: string;
  name: string;
  accessToken: string;
  category?: string;
}

export interface MetaPostItem {
  id: string;
  message?: string;
  createdTime?: string;
  permalinkUrl?: string;
  from?: {
    id: string;
    name: string;
  };
}

export function getGraphApiVersion(): string {
  return process.env.META_GRAPH_API_VERSION || 'v26.0';
}

export function getGraphBaseUrl(): string {
  return `https://graph.facebook.com/${getGraphApiVersion()}`;
}

export function getOAuthDialogUrl(): string {
  return `https://www.facebook.com/${getGraphApiVersion()}/dialog/oauth`;
}

/**
 * Initial Meta OAuth login scopes.
 * Standard scopes supported by default for all Meta apps without App Review.
 */
export const META_DEFAULT_SCOPES = [
  'public_profile',
  'email',
];

/**
 * Extended page scopes required for automated Page feed reading.
 * Kept ready so Page permissions can be added or requested incrementally
 * once configured in the Meta Developer Dashboard.
 */
export const META_PAGE_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
];

/**
 * Active scopes used for initial Meta Login authorization requests.
 * Restricted to valid permissions: public_profile, email.
 */
export const META_SCOPES = [
  'public_profile',
  'email',
];

export function getMetaConfig(): MetaConfig {
  const appId = process.env.META_APP_ID || '';
  const appSecret = process.env.META_APP_SECRET || '';
  const redirectUri =
    process.env.META_REDIRECT_URI ||
    'https://personalemailgenerator.vercel.app/api/integrations/meta/callback';

  return { appId, appSecret, redirectUri };
}

/**
 * Builds the official Meta OAuth 2.0 authorization URL.
 * Defaults to initial login scopes ['public_profile', 'email'].
 * Supports passing custom/extended scopes when configured.
 */
export function getMetaAuthUrl(state: string, scopes: string[] = META_SCOPES): string {
  const { appId, redirectUri } = getMetaConfig();

  if (!appId) {
    throw new AppError(
      'Meta App ID (META_APP_ID) is not configured in environment variables. Please configure your Meta App credentials.',
      400
    );
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    response_type: 'code',
    scope: scopes.join(','),
  });

  return `${getOAuthDialogUrl()}?${params.toString()}`;
}

/**
 * Exchanges the OAuth authorization code for a short-lived token,
 * then exchanges it for a 60-day long-lived access token.
 */
export async function exchangeCodeForLongLivedToken(code: string): Promise<{
  accessToken: string;
  expiresInSeconds: number;
}> {
  const { appId, appSecret, redirectUri } = getMetaConfig();

  if (!appId || !appSecret) {
    throw new AppError('Meta App credentials are not configured.', 400);
  }

  // 1. Exchange code for short-lived token
  const tokenUrl = new URL(`${getGraphBaseUrl()}/oauth/access_token`);
  tokenUrl.searchParams.set('client_id', appId);
  tokenUrl.searchParams.set('client_secret', appSecret);
  tokenUrl.searchParams.set('redirect_uri', redirectUri);
  tokenUrl.searchParams.set('code', code);

  const res = await fetch(tokenUrl.toString(), { method: 'GET' });
  const data = await res.json();

  if (!res.ok || data.error) {
    throw handleMetaApiError(data.error || { message: 'Failed to exchange authorization code.' });
  }

  const shortLivedToken = data.access_token;
  const initialExpiresIn = data.expires_in || 3600;

  // 2. Exchange short-lived token for long-lived (60 days) token
  const exchangeUrl = new URL(`${getGraphBaseUrl()}/oauth/access_token`);
  exchangeUrl.searchParams.set('grant_type', 'fb_exchange_token');
  exchangeUrl.searchParams.set('client_id', appId);
  exchangeUrl.searchParams.set('client_secret', appSecret);
  exchangeUrl.searchParams.set('fb_exchange_token', shortLivedToken);

  const exchangeRes = await fetch(exchangeUrl.toString(), { method: 'GET' });
  const exchangeData = await exchangeRes.json();

  if (exchangeRes.ok && exchangeData.access_token) {
    return {
      accessToken: exchangeData.access_token,
      expiresInSeconds: exchangeData.expires_in || 60 * 60 * 24 * 60, // 60 days default
    };
  }

  // Fallback to short-lived token if long-lived exchange is unavailable
  return {
    accessToken: shortLivedToken,
    expiresInSeconds: initialExpiresIn,
  };
}

/**
 * Fetches user profile data from Meta Graph API /me.
 */
export async function getMetaUserProfile(accessToken: string): Promise<MetaUserProfile> {
  const url = `${getGraphBaseUrl()}/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();

  if (!res.ok || data.error) {
    throw handleMetaApiError(data.error || { message: 'Failed to fetch Meta profile.' });
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    picture: data.picture,
  };
}

/**
 * Fetches Facebook Pages managed by the user where job posts can be published or read.
 */
export async function getMetaUserPages(accessToken: string): Promise<MetaPageItem[]> {
  const url = `${getGraphBaseUrl()}/me/accounts?fields=id,name,access_token,category&access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();

  if (!res.ok || data.error) {
    // If user has no page permissions, return empty list rather than throwing hard error
    console.warn('[Meta API] Could not fetch user pages:', data.error?.message);
    return [];
  }

  if (!Array.isArray(data.data)) {
    return [];
  }

  return data.data.map((item: any) => ({
    id: item.id,
    name: item.name,
    accessToken: item.access_token,
    category: item.category,
  }));
}

/**
 * Fetches published posts from a specific Facebook Page feed using its access token.
 */
export async function fetchPageFeedPosts(
  pageId: string,
  pageAccessToken: string
): Promise<MetaPostItem[]> {
  const url = `${getGraphBaseUrl()}/${encodeURIComponent(pageId)}/feed?fields=id,message,created_time,permalink_url,from&limit=25&access_token=${encodeURIComponent(pageAccessToken)}`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();

  if (!res.ok || data.error) {
    console.warn(`[Meta API] Could not fetch posts for page ${pageId}:`, data.error?.message);
    return [];
  }

  if (!Array.isArray(data.data)) {
    return [];
  }

  return data.data.map((p: any) => ({
    id: p.id,
    message: p.message,
    createdTime: p.created_time,
    permalinkUrl: p.permalink_url,
    from: p.from,
  }));
}

/**
 * Stores or updates the connected Meta account with AES-256-GCM encrypted tokens.
 */
export async function saveMetaAccount(
  userId: string,
  profile: MetaUserProfile,
  accessToken: string,
  expiresInSeconds: number,
  scopes: string[] = META_SCOPES
) {
  const encryptedAccessToken = encryptToken(accessToken);
  const tokenExpiry = new Date(Date.now() + expiresInSeconds * 1000);

  return prisma.metaAccount.upsert({
    where: { userId },
    update: {
      metaUserId: profile.id,
      name: profile.name,
      email: profile.email || null,
      encryptedAccessToken,
      tokenExpiry,
      scopes,
      isConnected: true,
      updatedAt: new Date(),
    },
    create: {
      userId,
      metaUserId: profile.id,
      name: profile.name,
      email: profile.email || null,
      encryptedAccessToken,
      tokenExpiry,
      scopes,
      isConnected: true,
    },
  });
}

/**
 * Retrieves the current user's Meta account connection status.
 */
export async function getMetaAccountStatus(userId: string): Promise<{
  isConnected: boolean;
  name?: string | null;
  email?: string | null;
  metaUserId?: string | null;
  scopes?: string[];
  expiresAt?: Date | null;
  isExpired?: boolean;
}> {
  const account = await prisma.metaAccount.findUnique({
    where: { userId },
  });

  if (!account || !account.isConnected) {
    return { isConnected: false };
  }

  const isExpired = account.tokenExpiry ? account.tokenExpiry < new Date() : false;

  return {
    isConnected: true,
    name: account.name,
    email: account.email,
    metaUserId: account.metaUserId,
    scopes: account.scopes,
    expiresAt: account.tokenExpiry,
    isExpired,
  };
}

/**
 * Retrieves decrypted access token for backend operations.
 */
export async function getDecryptedMetaToken(userId: string): Promise<string | null> {
  const account = await prisma.metaAccount.findUnique({
    where: { userId },
  });

  if (!account || !account.isConnected || !account.encryptedAccessToken) {
    return null;
  }

  return decryptToken(account.encryptedAccessToken);
}

/**
 * Disconnects the Meta integration for a user.
 */
export async function disconnectMetaAccount(userId: string): Promise<boolean> {
  const account = await prisma.metaAccount.findUnique({
    where: { userId },
  });

  if (!account) return false;

  await prisma.metaAccount.update({
    where: { userId },
    data: {
      isConnected: false,
      updatedAt: new Date(),
    },
  });

  return true;
}

/**
 * Translates Meta Graph API errors into structured user-friendly AppError.
 */
export function handleMetaApiError(error: { message?: string; code?: number; error_subcode?: number }): AppError {
  const code = error.code;
  const message = error.message || 'Unknown Meta API error';

  // Rate Limiting (Codes: 4, 17, 32, 613)
  if (code === 4 || code === 17 || code === 32 || code === 613) {
    return new AppError(
      'Meta API rate limit reached. Please wait a few minutes before trying again.',
      429,
      error
    );
  }

  // Token Expired / Invalidated (Codes: 190, 102)
  if (code === 190 || code === 102) {
    return new AppError(
      'Meta authorization token has expired or been revoked. Please reconnect your Facebook/Meta account in Integrations.',
      401,
      error
    );
  }

  // Permission / Capability restrictions (Codes: 200, 10, 210)
  if (code === 200 || code === 10 || code === 210) {
    return new AppError(
      `Meta permission restriction: ${message}. Ensure your app has approved permissions from Meta App Review.`,
      403,
      error
    );
  }

  return new AppError(`Meta Graph API error: ${message}`, 400, error);
}
