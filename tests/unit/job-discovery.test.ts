import { describe, it, expect } from 'vitest';
import {
  computeJobHash,
  evaluateResumeMatch,
  normalizeJobData,
  TARGET_DEVELOPER_SKILLS,
  TARGET_ROLE_KEYWORDS,
} from '@/services/jobDiscovery.service';
import { UserProfile } from '@/types';

const mockProfile: UserProfile = {
  fullName: 'John Doe',
  title: 'Full Stack React & Next.js Developer',
  yearsOfExperience: 4,
  summary: 'Experienced JavaScript and TypeScript developer specializing in React, Next.js, and Node.js.',
  skills: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Git/GitHub'],
  projects: [],
  experiences: [],
  education: [],
};

describe('Job Discovery Service - Unit Tests', () => {
  describe('computeJobHash', () => {
    it('produces deterministic SHA-256 hash for matching content and URL', () => {
      const content = 'We are hiring a React Developer with Next.js skills.';
      const url = 'https://facebook.com/groups/reactjobs/posts/12345';
      const hash1 = computeJobHash(content, url);
      const hash2 = computeJobHash(content, url);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('normalizes whitespace and casing before hashing', () => {
      const hash1 = computeJobHash('  Hiring   React  Developer   ', 'https://facebook.com/post/1');
      const hash2 = computeJobHash('hiring react developer', 'https://facebook.com/post/1');
      expect(hash1).toBe(hash2);
    });

    it('produces different hashes for different URLs or content', () => {
      const hash1 = computeJobHash('Hiring React Developer', 'https://facebook.com/post/1');
      const hash2 = computeJobHash('Hiring React Developer', 'https://facebook.com/post/2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('evaluateResumeMatch', () => {
    it('awards high score and Excellent or Strong Match tier for target developer profile', () => {
      const job = {
        title: 'Senior Frontend Developer (React / Next.js)',
        description: 'Looking for a skilled Frontend Developer proficient in React, Next.js, TypeScript, and Tailwind CSS.',
        skills: ['React', 'Next.js', 'TypeScript'],
      };

      const result = evaluateResumeMatch(job, mockProfile);
      expect(result.matchScore).toBeGreaterThanOrEqual(75);
      expect(['Excellent Match', 'Strong Match']).toContain(result.matchTier);
      expect(result.matchedSkills).toContain('React');
      expect(result.matchedSkills).toContain('Next.js');
      expect(result.matchedSkills).toContain('TypeScript');
      expect(result.matchReason).toContain('requires');
    });

    it('includes role title bonus when matching target role keywords', () => {
      const jobWithRole = {
        title: 'Full Stack Developer',
        description: 'Node.js and PostgreSQL backend tasks.',
        skills: ['Node.js', 'PostgreSQL'],
      };

      const result = evaluateResumeMatch(jobWithRole, mockProfile);
      expect(result.matchScore).toBeGreaterThanOrEqual(70);
      expect(result.matchReason).toContain('targets Full Stack Developer');
    });

    it('assigns Low Match tier and transparent explanation for unrelated jobs', () => {
      const unrelatedJob = {
        title: 'Senior Civil Engineer',
        description: 'AutoCAD design, construction site management, geotechnical analysis, and structural surveying.',
        skills: ['AutoCAD', 'Civil Engineering'],
      };

      const result = evaluateResumeMatch(unrelatedJob, mockProfile);
      expect(result.matchScore).toBeLessThan(60);
      expect(result.matchTier).toBe('Low Match');
      expect(result.matchedSkills.length).toBe(0);
      expect(result.matchReason).toContain('Low match');
    });

    it('identifies missing skills that candidate does not possess', () => {
      const jobWithExtraSkills = {
        title: 'Frontend Developer',
        description: 'Must know React, Next.js, AWS, and Docker.',
        skills: ['React', 'Next.js', 'AWS', 'Docker'],
      };

      const result = evaluateResumeMatch(jobWithExtraSkills, mockProfile);
      expect(result.matchedSkills).toContain('React');
      expect(result.matchedSkills).toContain('Next.js');
      expect(result.missingSkills).toContain('AWS');
      expect(result.missingSkills).toContain('Docker');
      expect(result.matchReason).toContain('Note:');
    });
  });

  describe('normalizeJobData', () => {
    it('correctly extracts email, detects remote location, and employment type', () => {
      const raw = {
        content: 'We need a freelance React Developer! Work is 100% remote. Send resume to hr@techcorp.com.',
        title: 'React Developer',
        company: 'TechCorp',
        postUrl: 'https://facebook.com/post/999',
      };

      const normalized = normalizeJobData(raw);

      expect(normalized.title).toBe('React Developer');
      expect(normalized.company).toBe('TechCorp');
      expect(normalized.contactEmail).toBe('hr@techcorp.com');
      expect(normalized.location).toBe('Remote');
      expect(normalized.employmentType).toBe('Contract');
      expect(normalized.source).toBe('FACEBOOK');
      expect(normalized.status).toBe('DISCOVERED');
    });

    it('detects internship and onsite locations', () => {
      const raw = {
        content: 'Looking for a Web Development intern. Office is on-site in Dhaka.',
      };

      const normalized = normalizeJobData(raw);

      expect(normalized.employmentType).toBe('Internship');
      expect(normalized.location).toBe('Onsite');
    });

    it('preserves existing status and match scores when supplied', () => {
      const raw = {
        content: 'TypeScript and Node.js Developer needed.',
        matchScore: 92,
        status: 'MATCHED' as const,
      };

      const normalized = normalizeJobData(raw);

      expect(normalized.matchScore).toBe(92);
      expect(normalized.matchTier).toBe('Excellent Match');
      expect(normalized.status).toBe('MATCHED');
    });
  });

  describe('Target Skills and Roles Constants', () => {
    it('contains all required developer skills', () => {
      expect(TARGET_DEVELOPER_SKILLS).toContain('React');
      expect(TARGET_DEVELOPER_SKILLS).toContain('Next.js');
      expect(TARGET_DEVELOPER_SKILLS).toContain('TypeScript');
      expect(TARGET_DEVELOPER_SKILLS).toContain('Node.js');
      expect(TARGET_DEVELOPER_SKILLS).toContain('PostgreSQL');
    });

    it('contains target developer roles', () => {
      expect(TARGET_ROLE_KEYWORDS).toContain('Frontend Developer');
      expect(TARGET_ROLE_KEYWORDS).toContain('React Developer');
      expect(TARGET_ROLE_KEYWORDS).toContain('Next.js Developer');
      expect(TARGET_ROLE_KEYWORDS).toContain('Full Stack Developer');
    });
  });
});
