import { describe, it, expect } from 'vitest';
import { calculateJobMatch } from '@/services/match.service';
import { JobAnalysisResult, UserProfile } from '@/types';

describe('calculateJobMatch', () => {
  const mockProfile: UserProfile = {
    fullName: 'Alex Morgan',
    title: 'Senior Full Stack Engineer',
    yearsOfExperience: 5,
    summary: 'Full stack developer with extensive React and Node.js experience.',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    projects: [
      {
        title: 'Ecommerce Platform',
        description: 'Built scalable store with React, TypeScript, and PostgreSQL',
        techStack: ['React', 'TypeScript', 'PostgreSQL'],
      },
    ],
    experiences: [
      {
        company: 'TechFlow',
        role: 'Senior Full Stack Engineer',
        startDate: '2021-01',
        isCurrent: true,
        description: 'Building microservices and modern frontend interfaces.',
        achievements: [],
      },
    ],
  };

  it('calculates deterministic match score based on 50% tech, 20% exp, 20% projects, 10% other', () => {
    const jobAnalysis: JobAnalysisResult = {
      companyName: 'Acme SaaS',
      jobTitle: 'Senior Full Stack Engineer',
      experienceRequirement: '4+ years of experience',
      workType: 'Remote',
      requiredSkills: ['TypeScript', 'React', 'Node.js'],
      preferredSkills: ['PostgreSQL'],
      responsibilities: ['Build modern web applications'],
      recipientEmails: ['jobs@acmesaas.com'],
    };

    const match = calculateJobMatch(mockProfile, jobAnalysis);

    expect(match.overallScore).toBeGreaterThanOrEqual(85);
    expect(match.technicalSkillScore).toBe(100);
    expect(match.experienceScore).toBe(100);
    expect(match.strongMatches).toContain('TypeScript');
    expect(match.strongMatches).toContain('React');
    expect(match.strongMatches).toContain('Node.js');
    expect(match.missingSkills).toHaveLength(0);
    expect(match.relevantProjects).toHaveLength(1);
    expect(match.relevantProjects[0].title).toBe('Ecommerce Platform');
  });

  it('accurately identifies missing skills without claiming the user has them', () => {
    const jobWithMissingSkills: JobAnalysisResult = {
      companyName: 'Cloud Corp',
      jobTitle: 'Data Engineer',
      experienceRequirement: '3+ years',
      workType: 'Hybrid',
      requiredSkills: ['TypeScript', 'Apache Spark', 'Snowflake', 'Scala'],
      preferredSkills: ['Kubernetes'],
      responsibilities: ['Build data pipelines'],
      recipientEmails: ['careers@cloudcorp.io'],
    };

    const match = calculateJobMatch(mockProfile, jobWithMissingSkills);

    expect(match.strongMatches).toContain('TypeScript');
    expect(match.missingSkills).toContain('Apache Spark');
    expect(match.missingSkills).toContain('Snowflake');
    expect(match.missingSkills).toContain('Scala');
    expect(match.missingSkills).toContain('Kubernetes');

    // Score should reflect missing skills appropriately
    expect(match.technicalSkillScore).toBeLessThan(60);
    expect(match.overallScore).toBeLessThan(75);
    expect(match.explanation).toContain('Apache Spark');
  });
});
