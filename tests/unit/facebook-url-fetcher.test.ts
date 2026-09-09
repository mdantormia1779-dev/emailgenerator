import { describe, it, expect } from 'vitest';
import { fetchAndParseJobUrl, verifyUrlReachability } from '@/services/facebook/facebookUrlFetcher.service';

describe('Facebook & Job URL Fetcher', () => {
  it('handles malformed or unreachable URLs gracefully without throwing', async () => {
    const result = await fetchAndParseJobUrl('https://non-existent-domain-test-12345.xyz/job');
    expect(result.isLive).toBe(false);
    expect(result.url).toBe('https://non-existent-domain-test-12345.xyz/job');
    expect(result.title).toBeDefined();
    expect(result.rawContent).toBeDefined();
  });

  it('verifies reachability safely without throwing error', async () => {
    const verification = await verifyUrlReachability('https://non-existent-domain-test-12345.xyz');
    expect(verification.isLive).toBe(false);
    expect(verification.status).toBe(0);
    expect(verification.url).toBe('https://non-existent-domain-test-12345.xyz');
  });

  it('extracts Facebook group name from group URL pattern', async () => {
    const result = await fetchAndParseJobUrl('https://facebook.com/groups/reactjs-developers-bd/posts/10192837461');
    expect(result.url).toContain('facebook.com/groups/reactjs-developers-bd');
    expect(result.company.toLowerCase()).toContain('reactjs developers bd');
  });
});
