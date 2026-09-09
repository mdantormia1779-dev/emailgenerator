import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getConfiguredKeywords,
  getConfiguredLocations,
  computeJobHash,
  normalizeJob,
  calculateMatchScore,
  removeDuplicates,
  fetchNextPage,
  fetchWithBackoff,
  DEFAULT_SEARCH_KEYWORDS,
  DEFAULT_SEARCH_LOCATIONS,
  TARGET_DEVELOPER_SKILLS,
  TARGET_ROLE_KEYWORDS,
} from '@/server/services/meta-job-scanner.service';
import { UserProfile } from '@/types';

const mockProfile: UserProfile = {
  fullName: 'Alex Morgan',
  title: 'Full Stack React & Next.js Developer',
  yearsOfExperience: 5,
  summary: 'Full Stack developer specializing in React, Next.js, TypeScript, Node.js, and PostgreSQL.',
  skills: [
    'React',
    'Next.js',
    'TypeScript',
    'JavaScript',
    'Node.js',
    'PostgreSQL',
    'Prisma',
    'Tailwind CSS',
    'Git',
    'GitHub',
  ],
  projects: [],
  experiences: [],
  education: [],
};

describe('Meta Job Scanner Service - Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Configuration Parsers', () => {
    it('returns default keywords when env is unset', () => {
      delete process.env.META_JOB_SEARCH_KEYWORDS;
      const keywords = getConfiguredKeywords();
      expect(keywords).toEqual(DEFAULT_SEARCH_KEYWORDS);
    });

    it('parses JSON array from META_JOB_SEARCH_KEYWORDS', () => {
      process.env.META_JOB_SEARCH_KEYWORDS = '["React Developer", "Next.js Engineer"]';
      const keywords = getConfiguredKeywords();
      expect(keywords).toEqual(['React Developer', 'Next.js Engineer']);
    });

    it('parses comma-delimited string from META_JOB_SEARCH_KEYWORDS', () => {
      process.env.META_JOB_SEARCH_KEYWORDS = 'Frontend Developer, Full Stack Developer';
      const keywords = getConfiguredKeywords();
      expect(keywords).toEqual(['Frontend Developer', 'Full Stack Developer']);
    });

    it('returns default locations when env is unset', () => {
      delete process.env.META_JOB_LOCATIONS;
      const locations = getConfiguredLocations();
      expect(locations).toEqual(DEFAULT_SEARCH_LOCATIONS);
    });

    it('parses comma-delimited string from META_JOB_LOCATIONS', () => {
      process.env.META_JOB_LOCATIONS = 'Bangladesh, Remote, Europe';
      const locations = getConfiguredLocations();
      expect(locations).toEqual(['Bangladesh', 'Remote', 'Europe']);
    });
  });

  describe('computeJobHash', () => {
    it('generates consistent SHA-256 hash for identical content and url', () => {
      const h1 = computeJobHash('Hiring React Developer', 'https://facebook.com/post/1');
      const h2 = computeJobHash('Hiring React Developer', 'https://facebook.com/post/1');
      expect(h1).toBe(h2);
      expect(h1).toHaveLength(64);
    });

    it('normalizes whitespace and casing before hashing', () => {
      const h1 = computeJobHash('  HIRING   REACT  DEVELOPER  ', 'https://facebook.com/post/1');
      const h2 = computeJobHash('hiring react developer', 'https://facebook.com/post/1');
      expect(h1).toBe(h2);
    });
  });

  describe('normalizeJob', () => {
    it('extracts emails, location, and employment types correctly', () => {
      const raw = {
        content: 'We need a freelance React & Next.js Developer. 100% remote. Apply at jobs@techco.com.',
        title: 'React & Next.js Developer',
        company: 'TechCo',
        postUrl: 'https://facebook.com/post/100',
      };

      const normalized = normalizeJob(raw);
      expect(normalized.source).toBe('FACEBOOK');
      expect(normalized.title).toBe('React & Next.js Developer');
      expect(normalized.company).toBe('TechCo');
      expect(normalized.contactEmail).toBe('jobs@techco.com');
      expect(normalized.location).toBe('Remote');
      expect(normalized.employmentType).toBe('Contract');
      expect(normalized.skills).toContain('React');
      expect(normalized.skills).toContain('Next.js');
      expect(normalized.status).toBe('DISCOVERED');
    });

    it('detects Bangladesh location and internship employment type', () => {
      const raw = {
        content: 'Looking for a Web Development intern in Dhaka, Bangladesh. Send CV to hr@bdjobs.com.',
      };

      const normalized = normalizeJob(raw);
      expect(normalized.location).toBe('Bangladesh');
      expect(normalized.employmentType).toBe('Internship');
    });
  });

  describe('calculateMatchScore', () => {
    it('scores high and gives Excellent Match or Strong Match tier for target developer skills', () => {
      const job = {
        title: 'Frontend Developer',
        description: 'Requires React, Next.js, TypeScript, and Tailwind CSS experience.',
        skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      };

      const result = calculateMatchScore(job, mockProfile);
      expect(result.matchScore).toBeGreaterThanOrEqual(75);
      expect(['Excellent Match', 'Strong Match']).toContain(result.matchTier);
      expect(result.matchedSkills).toContain('React');
      expect(result.matchedSkills).toContain('Next.js');
      expect(result.matchedSkills).toContain('TypeScript');
      expect(result.matchReason).toContain('requires');
    });

    it('awards role bonus for target role keywords like Full Stack Developer', () => {
      const job = {
        title: 'Full Stack Developer',
        description: 'Node.js, PostgreSQL, and Express backend systems.',
        skills: ['Node.js', 'PostgreSQL'],
      };

      const result = calculateMatchScore(job, mockProfile);
      expect(result.matchScore).toBeGreaterThanOrEqual(70);
      expect(result.matchReason).toContain('targets Full Stack Developer');
    });

    it('assigns Low Match tier and clear explanation for non-matching jobs', () => {
      const job = {
        title: 'Civil Engineer',
        description: 'Structural surveying, AutoCAD, geotechnical inspection.',
        skills: ['AutoCAD'],
      };

      const result = calculateMatchScore(job, mockProfile);
      expect(result.matchScore).toBeLessThan(60);
      expect(result.matchTier).toBe('Low Match');
      expect(result.matchReason).toContain('Low match');
    });
  });

  describe('removeDuplicates', () => {
    it('filters out existing database hashes and in-batch duplicates', () => {
      const job1 = normalizeJob({ content: 'Job 1 React Developer', postUrl: 'https://fb.com/1', sourcePostId: 'p1' });
      const job2 = normalizeJob({ content: 'Job 2 Next.js Developer', postUrl: 'https://fb.com/2', sourcePostId: 'p2' });
      const job3 = normalizeJob({ content: 'Job 1 React Developer', postUrl: 'https://fb.com/1', sourcePostId: 'p1' }); // In-batch duplicate

      const existingHashes = new Set<string>(['p0', 'existing_hash_123']);
      existingHashes.add(job2.postHash); // job2 is already in DB

      const { uniqueJobs, duplicateCount } = removeDuplicates([job1, job2, job3], existingHashes);

      expect(uniqueJobs).toHaveLength(1);
      expect(uniqueJobs[0].sourcePostId).toBe('p1');
      expect(duplicateCount).toBe(2);
    });
  });

  describe('fetchNextPage and fetchWithBackoff', () => {
    it('returns empty result gracefully if URL is invalid', async () => {
      const res = await fetchNextPage('not-a-valid-url');
      expect(res.items).toEqual([]);
      expect(res.nextCursor).toBeNull();
    });

    it('retries on HTTP 429 and resolves when next attempt succeeds', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ status: 429, ok: false })
        .mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({ success: true }) });

      globalThis.fetch = mockFetch;

      const res = await fetchWithBackoff('https://example.com/api', {}, 3);
      expect(res.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
