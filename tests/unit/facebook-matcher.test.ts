import { describe, it, expect } from 'vitest';
import { evaluateFacebookJobMatch, DEFAULT_TARGET_KEYWORDS } from '@/services/facebook/facebookMatcher.service';
import { ParsedFacebookJob } from '@/services/facebook/facebook.types';
import { UserProfile } from '@/types';

describe('Facebook Job Matcher', () => {
  const mockProfile: UserProfile = {
    fullName: 'Alex Morgan',
    title: 'Senior Full Stack Engineer',
    yearsOfExperience: 6,
    summary: 'Full stack engineer with React, Next.js, TypeScript, Node.js, and PostgreSQL.',
    skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'MongoDB', 'Express'],
    projects: [
      {
        title: 'MERN Platform',
        description: 'E-commerce web app built with MongoDB, Express, React, and Node.js',
        techStack: ['React', 'Node.js', 'MongoDB', 'Express'],
      },
    ],
    experiences: [],
  };

  it('evaluates relevant MERN/Frontend developer post above 70% threshold', () => {
    const parsedMernJob: ParsedFacebookJob = {
      title: 'MERN Stack Developer',
      company: 'TechFlow Solutions',
      description: 'Hiring MERN Stack Developer with React, Node, Express, and MongoDB.',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express'],
      preferredSkills: ['TypeScript'],
      recipientEmail: 'jobs@techflow.io',
      workType: 'Remote',
      isJobPost: true,
    };

    const evaluation = evaluateFacebookJobMatch(parsedMernJob, mockProfile, DEFAULT_TARGET_KEYWORDS, 70);

    expect(evaluation.isRelevant).toBe(true);
    expect(evaluation.matchScore).toBeGreaterThanOrEqual(70);
    expect(evaluation.matchedKeyword).toBe('MERN Stack Developer');
    expect(evaluation.strongMatches).toContain('React');
    expect(evaluation.strongMatches).toContain('Node.js');
  });

  it('rejects unrelated roles like Graphic Designer or Non-Job posts', () => {
    const unrelatedJob: ParsedFacebookJob = {
      title: 'Graphic Designer',
      company: 'Design Studio',
      description: 'Need Graphic Designer with Adobe Photoshop and Illustrator.',
      requiredSkills: [],
      preferredSkills: [],
      recipientEmail: 'design@studio.com',
      workType: 'Onsite',
      isJobPost: true,
    };

    const evaluation = evaluateFacebookJobMatch(unrelatedJob, mockProfile, DEFAULT_TARGET_KEYWORDS, 70);

    expect(evaluation.isRelevant).toBe(false);
    expect(evaluation.matchScore).toBeLessThan(50);
  });
});
