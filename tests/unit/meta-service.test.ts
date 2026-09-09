import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getMetaConfig,
  getMetaAuthUrl,
  getGraphApiVersion,
  getGraphBaseUrl,
  getOAuthDialogUrl,
  handleMetaApiError,
  exchangeCodeForLongLivedToken,
  getMetaUserProfile,
  getMetaUserPages,
  fetchPageFeedPosts,
  META_SCOPES,
  META_DEFAULT_SCOPES,
  META_PAGE_SCOPES,
} from '@/services/meta.service';
import { AppError } from '@/lib/errors';

describe('Meta Service - Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Graph API Version and URLs', () => {
    it('defaults to v26.0 when META_GRAPH_API_VERSION is unset', () => {
      delete process.env.META_GRAPH_API_VERSION;
      expect(getGraphApiVersion()).toBe('v26.0');
      expect(getGraphBaseUrl()).toBe('https://graph.facebook.com/v26.0');
      expect(getOAuthDialogUrl()).toBe('https://www.facebook.com/v26.0/dialog/oauth');
    });

    it('respects configured META_GRAPH_API_VERSION from environment', () => {
      process.env.META_GRAPH_API_VERSION = 'v26.0';
      expect(getGraphApiVersion()).toBe('v26.0');
      expect(getGraphBaseUrl()).toBe('https://graph.facebook.com/v26.0');
      expect(getOAuthDialogUrl()).toBe('https://www.facebook.com/v26.0/dialog/oauth');

      process.env.META_GRAPH_API_VERSION = 'v27.0';
      expect(getGraphApiVersion()).toBe('v27.0');
      expect(getGraphBaseUrl()).toBe('https://graph.facebook.com/v27.0');
      expect(getOAuthDialogUrl()).toBe('https://www.facebook.com/v27.0/dialog/oauth');
    });
  });

  describe('getMetaConfig', () => {
    it('returns configured environment variables', () => {
      process.env.META_APP_ID = 'test-meta-app-id';
      process.env.META_APP_SECRET = 'test-meta-app-secret';
      process.env.META_REDIRECT_URI = 'https://myapp.com/api/integrations/meta/callback';

      const config = getMetaConfig();
      expect(config.appId).toBe('test-meta-app-id');
      expect(config.appSecret).toBe('test-meta-app-secret');
      expect(config.redirectUri).toBe('https://myapp.com/api/integrations/meta/callback');
    });

    it('falls back to default redirect URI when not specified', () => {
      delete process.env.META_REDIRECT_URI;
      const config = getMetaConfig();
      expect(config.redirectUri).toBe('https://personalemailgenerator.vercel.app/api/integrations/meta/callback');
    });
  });

  describe('Meta OAuth Scopes Configuration', () => {
    it('configures initial login scopes to only public_profile and email', () => {
      expect(META_SCOPES).toEqual(['public_profile', 'email']);
      expect(META_DEFAULT_SCOPES).toEqual(['public_profile', 'email']);
      expect(META_SCOPES).not.toContain('pages_show_list');
      expect(META_SCOPES).not.toContain('pages_read_engagement');
    });

    it('keeps page scopes ready for future extension without rewriting OAuth', () => {
      expect(META_PAGE_SCOPES).toEqual(['pages_show_list', 'pages_read_engagement']);
    });
  });

  describe('getMetaAuthUrl', () => {
    it('throws AppError if META_APP_ID is missing', () => {
      delete process.env.META_APP_ID;
      expect(() => getMetaAuthUrl('csrf_token_123')).toThrow(AppError);
    });

    it('generates a valid OAuth URL requesting ONLY public_profile and email by default', () => {
      process.env.META_APP_ID = '1234567890';
      process.env.META_REDIRECT_URI = 'https://personalemailgenerator.vercel.app/api/integrations/meta/callback';
      delete process.env.META_GRAPH_API_VERSION;

      const url = getMetaAuthUrl('secure_random_state');
      expect(url).toContain('https://www.facebook.com/v26.0/dialog/oauth');
      expect(url).toContain('client_id=1234567890');
      expect(url).toContain('redirect_uri=https%3A%2F%2Fpersonalemailgenerator.vercel.app%2Fapi%2Fintegrations%2Fmeta%2Fcallback');
      expect(url).toContain('state=secure_random_state');
      expect(url).toContain('response_type=code');
      // Verify scope parameter is URL-encoded public_profile,email
      expect(url).toContain('scope=public_profile%2Cemail');
      // Crucial: Must NOT contain page scopes
      expect(url).not.toContain('pages_show_list');
      expect(url).not.toContain('pages_read_engagement');
    });

    it('supports extensible custom/page scopes when explicitly passed', () => {
      process.env.META_APP_ID = '1234567890';
      const url = getMetaAuthUrl('custom_state', ['public_profile', 'email', 'pages_show_list']);
      expect(url).toContain('scope=public_profile%2Cemail%2Cpages_show_list');
    });
  });

  describe('handleMetaApiError', () => {
    it('maps rate limit error codes (4, 17, 32, 613) to 429 status', () => {
      const err = handleMetaApiError({ code: 4, message: 'Application request limit reached' });
      expect(err.statusCode).toBe(429);
      expect(err.message).toContain('rate limit reached');

      const err2 = handleMetaApiError({ code: 613, message: 'Calls to this api have exceeded the rate limit' });
      expect(err2.statusCode).toBe(429);
    });

    it('maps token expiration codes (190, 102) to 401 status', () => {
      const err = handleMetaApiError({ code: 190, message: 'Error validating access token: Session has expired' });
      expect(err.statusCode).toBe(401);
      expect(err.message).toContain('expired or been revoked');
    });

    it('maps permission restriction codes (200, 10, 210) to 403 status', () => {
      const err = handleMetaApiError({ code: 200, message: 'Permissions error: requires pages_read_engagement' });
      expect(err.statusCode).toBe(403);
      expect(err.message).toContain('permission restriction');
    });

    it('defaults to 400 for generic Meta errors', () => {
      const err = handleMetaApiError({ code: 500, message: 'Internal Graph API failure' });
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('Internal Graph API failure');
    });
  });

  describe('exchangeCodeForLongLivedToken', () => {
    it('throws AppError if credentials are not configured', async () => {
      delete process.env.META_APP_ID;
      delete process.env.META_APP_SECRET;

      await expect(exchangeCodeForLongLivedToken('mock_code')).rejects.toThrow(AppError);
    });

    it('successfully fetches short-lived token and exchanges for long-lived token', async () => {
      process.env.META_APP_ID = '12345';
      process.env.META_APP_SECRET = 'secret_abc';

      const mockFetch = vi.fn()
        // 1st call: code to short-lived token
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'short_lived_123', expires_in: 3600 }),
        })
        // 2nd call: fb_exchange_token to 60-day long-lived token
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'long_lived_60_days_xyz', expires_in: 5184000 }),
        });

      globalThis.fetch = mockFetch;

      const result = await exchangeCodeForLongLivedToken('auth_code_test');
      expect(result.accessToken).toBe('long_lived_60_days_xyz');
      expect(result.expiresInSeconds).toBe(5184000);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getMetaUserProfile', () => {
    it('fetches and maps profile fields correctly', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'fb_user_999',
          name: 'Jane Developer',
          email: 'jane@example.com',
          picture: { data: { url: 'https://cdn.facebook.com/pic.jpg' } },
        }),
      });
      globalThis.fetch = mockFetch;

      const profile = await getMetaUserProfile('valid_token');
      expect(profile.id).toBe('fb_user_999');
      expect(profile.name).toBe('Jane Developer');
      expect(profile.email).toBe('jane@example.com');
      expect(profile.picture?.data?.url).toBe('https://cdn.facebook.com/pic.jpg');
    });

    it('throws AppError when Graph API returns error', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { code: 190, message: 'Invalid OAuth access token.' },
        }),
      });
      globalThis.fetch = mockFetch;

      await expect(getMetaUserProfile('invalid_token')).rejects.toThrow(AppError);
    });
  });

  describe('getMetaUserPages and fetchPageFeedPosts', () => {
    it('returns mapped pages with page access tokens', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 'page_123',
              name: 'Tech Jobs Community',
              access_token: 'page_token_abc',
              category: 'Community',
            },
          ],
        }),
      });
      globalThis.fetch = mockFetch;

      const pages = await getMetaUserPages('user_token');
      expect(pages).toHaveLength(1);
      expect(pages[0].id).toBe('page_123');
      expect(pages[0].name).toBe('Tech Jobs Community');
      expect(pages[0].accessToken).toBe('page_token_abc');
    });

    it('returns empty array gracefully on error without throwing', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { code: 200, message: 'Permission not granted' },
        }),
      });
      globalThis.fetch = mockFetch;

      const pages = await getMetaUserPages('restricted_token');
      expect(pages).toEqual([]);
    });

    it('fetches page feed posts and maps them', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 'post_001',
              message: 'Hiring React Developer! Remote position. Contact: jobs@agency.com',
              created_time: '2026-09-08T12:00:00Z',
              permalink_url: 'https://facebook.com/page_123/posts/post_001',
              from: { id: 'page_123', name: 'Tech Agency' },
            },
          ],
        }),
      });
      globalThis.fetch = mockFetch;

      const posts = await fetchPageFeedPosts('page_123', 'page_token');
      expect(posts).toHaveLength(1);
      expect(posts[0].id).toBe('post_001');
      expect(posts[0].message).toContain('Hiring React Developer');
      expect(posts[0].permalinkUrl).toBe('https://facebook.com/page_123/posts/post_001');
    });
  });
});
