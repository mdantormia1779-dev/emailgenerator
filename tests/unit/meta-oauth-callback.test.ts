import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/integrations/meta/callback/route';
import * as auth from '@/lib/auth';
import * as metaService from '@/services/meta.service';

describe('Meta OAuth Callback Route - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(auth, 'getSessionUserId').mockResolvedValue('test-user-123');
  });

  it('handles user cancellation / denial cleanly and redirects with descriptive error', async () => {
    const req = new NextRequest(
      'https://personalemailgenerator.vercel.app/api/integrations/meta/callback?error=access_denied&error_reason=user_denied&error_description=Permissions+error&state=some_state'
    );

    const res = await GET(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/integrations');
    expect(location).toContain('meta_error=Meta+authorization+was+cancelled+or+denied+by+the+user.');
  });

  it('redirects with error when authorization code is missing', async () => {
    const req = new NextRequest(
      'https://personalemailgenerator.vercel.app/api/integrations/meta/callback?state=some_state'
    );

    const res = await GET(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/integrations');
    expect(location).toContain('Missing+authorization+code');
  });

  it('redirects with error when state parameter is missing', async () => {
    const req = new NextRequest(
      'https://personalemailgenerator.vercel.app/api/integrations/meta/callback?code=mock_code_123'
    );

    const res = await GET(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/integrations');
    expect(location).toContain('Missing+state+parameter');
  });

  it('redirects with CSRF error when cookie state does not match query state', async () => {
    const req = new NextRequest(
      'https://personalemailgenerator.vercel.app/api/integrations/meta/callback?code=mock_code_123&state=attacker_state',
      {
        headers: {
          cookie: 'meta_oauth_state=genuine_state',
        },
      }
    );

    const res = await GET(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/integrations');
    expect(location).toContain('Invalid+or+expired+OAuth+state');
  });

  it('successfully exchanges code, retrieves profile with email, saves account, and redirects', async () => {
    vi.spyOn(metaService, 'exchangeCodeForLongLivedToken').mockResolvedValue({
      accessToken: 'long_lived_token_xyz',
      expiresInSeconds: 5184000,
    });

    vi.spyOn(metaService, 'getMetaUserProfile').mockResolvedValue({
      id: 'fb_user_001',
      name: 'John Developer',
      email: 'john@example.com',
    });

    const saveSpy = vi.spyOn(metaService, 'saveMetaAccount').mockResolvedValue({} as any);

    const req = new NextRequest(
      'https://personalemailgenerator.vercel.app/api/integrations/meta/callback?code=valid_code_123&state=valid_state',
      {
        headers: {
          cookie: 'meta_oauth_state=valid_state',
        },
      }
    );

    const res = await GET(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/integrations');
    expect(location).toContain('meta_connected=true');
    expect(location).toContain('name=John+Developer');

    // Verify token saved with existing integration architecture
    expect(saveSpy).toHaveBeenCalledWith(
      'test-user-123',
      expect.objectContaining({ id: 'fb_user_001', email: 'john@example.com' }),
      'long_lived_token_xyz',
      5184000
    );

    // Verify state cookie is cleared
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('meta_oauth_state=;');
  });

  it('handles missing profile email gracefully without failing connection', async () => {
    vi.spyOn(metaService, 'exchangeCodeForLongLivedToken').mockResolvedValue({
      accessToken: 'long_lived_token_xyz',
      expiresInSeconds: 5184000,
    });

    // Profile without email (e.g. phone-only account)
    vi.spyOn(metaService, 'getMetaUserProfile').mockResolvedValue({
      id: 'fb_user_002',
      name: 'Phone User',
    });

    const saveSpy = vi.spyOn(metaService, 'saveMetaAccount').mockResolvedValue({} as any);

    const req = new NextRequest(
      'https://personalemailgenerator.vercel.app/api/integrations/meta/callback?code=valid_code_123&state=valid_state',
      {
        headers: {
          cookie: 'meta_oauth_state=valid_state',
        },
      }
    );

    const res = await GET(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('meta_connected=true');
    expect(location).toContain('meta_notice=email_not_provided');

    expect(saveSpy).toHaveBeenCalledWith(
      'test-user-123',
      expect.objectContaining({ id: 'fb_user_002' }),
      'long_lived_token_xyz',
      5184000
    );
  });

  it('redirects with error when token exchange fails', async () => {
    vi.spyOn(metaService, 'exchangeCodeForLongLivedToken').mockRejectedValue(
      new Error('Code has expired or is invalid')
    );

    const req = new NextRequest(
      'https://personalemailgenerator.vercel.app/api/integrations/meta/callback?code=bad_code&state=valid_state',
      {
        headers: {
          cookie: 'meta_oauth_state=valid_state',
        },
      }
    );

    const res = await GET(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/integrations');
    expect(location).toContain('meta_error=Code+has+expired+or+is+invalid');
  });
});
