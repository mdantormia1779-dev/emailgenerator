import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { extractEmailsFromText } from '@/lib/email-parser';
import { getUserProfile } from '@/services/profile.service';
import { UserProfile } from '@/types';

export type JobStatus =
  | 'DISCOVERED'
  | 'MATCHED'
  | 'EMAIL_GENERATED'
  | 'REVIEW_REQUIRED'
  | 'APPROVED'
  | 'SENT'
  | 'REJECTED';

export type MatchTier = 'Excellent Match' | 'Strong Match' | 'Potential Match' | 'Low Match';

export interface NormalizedJobOpportunity {
  id: string;
  source: 'FACEBOOK' | 'WEB';
  title: string;
  company: string;
  description: string;
  location: string;
  employmentType: string;
  salary?: string;
  postUrl?: string;
  sourcePostId?: string;
  postedAt?: string;
  discoveredAt: string;
  contactEmail?: string;
  requirements: string[];
  skills: string[];
  matchScore: number;
  matchTier: MatchTier;
  matchReason: string;
  status: JobStatus;
}

export const TARGET_DEVELOPER_SKILLS = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express.js',
  'MongoDB',
  'PostgreSQL',
  'Prisma',
  'REST API',
  'Tailwind CSS',
  'Git/GitHub',
  'AWS',
  'Docker',
];

export const TARGET_ROLE_KEYWORDS = [
  'Frontend Developer',
  'React Developer',
  'Next.js Developer',
  'MERN Stack Developer',
  'Full Stack Developer',
  'JavaScript Developer',
  'TypeScript Developer',
  'Node.js Developer',
];

/**
 * Computes deterministic SHA-256 content hash for duplicate detection.
 */
export function computeJobHash(content: string, postUrl?: string): string {
  const normalized = `${(content || '').replace(/\s+/g, ' ').trim().toLowerCase()}_${(postUrl || '').trim().toLowerCase()}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Matches a job description and detected skills against a candidate profile.
 * Generates transparent match score and human-readable reasoning.
 */
export function evaluateResumeMatch(
  job: {
    title: string;
    description: string;
    skills: string[];
    requirements?: string[];
  },
  profile: UserProfile
): {
  matchScore: number;
  matchTier: MatchTier;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
} {
  const candidateSkillsLower = profile.skills.map(s => s.toLowerCase());
  const combinedJobText = `${job.title} ${job.description} ${job.skills.join(' ')} ${job.requirements?.join(' ') || ''}`.toLowerCase();

  // 1. Detect target skills mentioned in the job posting
  const detectedTargetSkills = TARGET_DEVELOPER_SKILLS.filter(skill => {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return pattern.test(combinedJobText);
  });

  // Combine with explicitly parsed skills
  const allJobSkills = Array.from(new Set([...job.skills, ...detectedTargetSkills]));

  // 2. Identify intersection with candidate profile skills
  const matchedSkills = allJobSkills.filter(skill =>
    candidateSkillsLower.some(cs => cs === skill.toLowerCase() || cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
  );

  const missingSkills = allJobSkills.filter(skill => !matchedSkills.includes(skill));

  // 3. Role Title match bonus
  let titleBonus = 0;
  const matchedRole = TARGET_ROLE_KEYWORDS.find(role =>
    combinedJobText.includes(role.toLowerCase()) || job.title.toLowerCase().includes(role.toLowerCase())
  );
  if (matchedRole) {
    titleBonus = 20;
  }

  // 4. Skills Match Calculation
  let skillsScore = 50;
  if (allJobSkills.length > 0) {
    const ratio = matchedSkills.length / allJobSkills.length;
    skillsScore = Math.round(ratio * 70);
  }

  // Raw combined score capped at 98
  let rawScore = Math.min(98, Math.max(30, skillsScore + titleBonus));

  // If candidate matches core skills (React, Next.js, Node.js or TypeScript), grant natural alignment
  const hasCoreMatch = matchedSkills.some(s =>
    ['react', 'next.js', 'typescript', 'node.js', 'javascript'].includes(s.toLowerCase())
  );
  if (hasCoreMatch && rawScore < 70) {
    rawScore = 72;
  }

  // Tier categorization
  let matchTier: MatchTier = 'Low Match';
  if (rawScore >= 90) matchTier = 'Excellent Match';
  else if (rawScore >= 75) matchTier = 'Strong Match';
  else if (rawScore >= 60) matchTier = 'Potential Match';

  // Human-readable transparent explanation
  let matchReason = '';
  if (matchedSkills.length > 0) {
    const skillsList = matchedSkills.slice(0, 4).join(', ');
    matchReason = `${matchTier} because the job requires ${skillsList}${matchedRole ? ` and targets ${matchedRole}` : ''}.`;
    if (missingSkills.length > 0) {
      matchReason += ` (Note: ${missingSkills.slice(0, 2).join(', ')} not listed in profile).`;
    }
  } else {
    matchReason = `Low match: job requirements do not clearly align with candidate's primary skills (${profile.skills.slice(0, 4).join(', ')}).`;
  }

  return {
    matchScore: rawScore,
    matchTier,
    matchReason,
    matchedSkills,
    missingSkills,
  };
}

/**
 * Normalizes raw Facebook/Meta post into standard NormalizedJobOpportunity.
 */
export function normalizeJobData(raw: {
  id?: string;
  sourcePostId?: string;
  content: string;
  title?: string;
  company?: string;
  postUrl?: string;
  location?: string;
  employmentType?: string;
  salary?: string;
  postedAt?: Date | string;
  discoveredAt?: Date | string;
  recipientEmail?: string | null;
  skills?: string[];
  requirements?: string[];
  matchScore?: number;
  matchReason?: string;
  status?: JobStatus;
}): NormalizedJobOpportunity {
  const extractedEmails = extractEmailsFromText(raw.content);
  const contactEmail = raw.recipientEmail || (extractedEmails.length > 0 ? extractedEmails[0] : undefined);

  // Extract skills if not provided
  let skills = raw.skills || [];
  if (skills.length === 0) {
    skills = TARGET_DEVELOPER_SKILLS.filter(skill => {
      const reg = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return reg.test(raw.content);
    });
  }

  // Work type detection
  let employmentType = raw.employmentType || 'Full-time';
  if (/contract|freelance/i.test(raw.content)) employmentType = 'Contract';
  else if (/part-?time/i.test(raw.content)) employmentType = 'Part-time';
  else if (/intern/i.test(raw.content)) employmentType = 'Internship';

  let location = raw.location || 'Remote';
  if (/remote/i.test(raw.content)) location = 'Remote';
  else if (/hybrid/i.test(raw.content)) location = 'Hybrid';
  else if (/on-?site|dhaka|san francisco|new york/i.test(raw.content)) location = 'Onsite';

  const score = raw.matchScore ?? 0;
  let matchTier: MatchTier = 'Low Match';
  if (score >= 90) matchTier = 'Excellent Match';
  else if (score >= 75) matchTier = 'Strong Match';
  else if (score >= 60) matchTier = 'Potential Match';

  return {
    id: raw.id || `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    source: 'FACEBOOK',
    title: raw.title || 'Software Developer',
    company: raw.company || 'Company (via Meta)',
    description: raw.content,
    location,
    employmentType,
    salary: raw.salary,
    postUrl: raw.postUrl,
    sourcePostId: raw.sourcePostId,
    postedAt: raw.postedAt ? new Date(raw.postedAt).toISOString() : undefined,
    discoveredAt: raw.discoveredAt ? new Date(raw.discoveredAt).toISOString() : new Date().toISOString(),
    contactEmail,
    requirements: raw.requirements || [],
    skills,
    matchScore: score,
    matchTier,
    matchReason: raw.matchReason || 'Processed through Meta Job Discovery pipeline.',
    status: raw.status || (score >= 70 ? 'MATCHED' : 'DISCOVERED'),
  };
}

/**
 * Ingests, evaluates, deduplicates, and saves discovered jobs to the database.
 */
export async function ingestDiscoveredJobs(
  userId: string,
  rawJobs: Array<{
    sourcePostId?: string;
    content: string;
    title?: string;
    company?: string;
    postUrl?: string;
    location?: string;
    employmentType?: string;
    salary?: string;
    postedAt?: Date;
  }>
): Promise<{
  totalProcessed: number;
  newDiscovered: number;
  matchedCount: number;
  jobs: NormalizedJobOpportunity[];
}> {
  const profileData = await getUserProfile(userId);
  if (!profileData) {
    throw new Error('User profile not found. Please complete profile before discovering jobs.');
  }

  const profile: UserProfile = {
    fullName: profileData.fullName,
    title: profileData.title,
    yearsOfExperience: profileData.yearsOfExperience,
    summary: profileData.summary,
    skills: profileData.skills,
    projects: profileData.projects || [],
    experiences: profileData.experiences || [],
    education: profileData.education || [],
  };

  let newDiscovered = 0;
  let matchedCount = 0;
  const processedJobs: NormalizedJobOpportunity[] = [];

  for (const raw of rawJobs) {
    if (!raw.content || raw.content.trim().length < 10) continue;

    const postHash = computeJobHash(raw.content, raw.postUrl);

    // Duplicate Detection: Check if already stored by postHash or sourcePostId
    const existing = await prisma.facebookPost.findFirst({
      where: {
        OR: [
          { postHash },
          ...(raw.sourcePostId ? [{ sourcePostId: raw.sourcePostId }] : []),
        ],
      },
    });

    if (existing) {
      // Map existing record
      processedJobs.push(
        normalizeJobData({
          id: existing.id,
          sourcePostId: existing.sourcePostId || undefined,
          content: existing.rawContent,
          title: existing.extractedTitle || undefined,
          company: existing.extractedCompany || undefined,
          postUrl: existing.postUrl || undefined,
          location: existing.location || undefined,
          employmentType: existing.employmentType || undefined,
          salary: existing.salary || undefined,
          postedAt: existing.postedAt || undefined,
          discoveredAt: existing.discoveredAt,
          recipientEmail: existing.extractedEmail,
          skills: existing.extractedSkills,
          requirements: existing.requirements,
          matchScore: existing.matchScore || 0,
          matchReason: existing.matchReason || undefined,
          status: (existing.status as JobStatus) || 'DISCOVERED',
        })
      );
      continue;
    }

    // 1. Evaluate Resume Match
    const evaluation = evaluateResumeMatch(
      {
        title: raw.title || 'Software Developer',
        description: raw.content,
        skills: [],
      },
      profile
    );

    const isRelevant = evaluation.matchScore >= 70;
    const initialStatus: JobStatus = isRelevant ? 'MATCHED' : 'DISCOVERED';

    if (isRelevant) matchedCount++;
    newDiscovered++;

    const extractedEmails = extractEmailsFromText(raw.content);
    const contactEmail = extractedEmails.length > 0 ? extractedEmails[0] : null;

    // 2. Persist in Database
    const saved = await prisma.facebookPost.create({
      data: {
        userId,
        source: 'FACEBOOK',
        sourcePostId: raw.sourcePostId || null,
        postUrl: raw.postUrl || null,
        postHash,
        rawContent: raw.content,
        extractedTitle: raw.title || (evaluation.matchedSkills[0] ? `${evaluation.matchedSkills[0]} Developer` : 'Software Developer'),
        extractedCompany: raw.company || 'Hiring Company',
        extractedEmail: contactEmail,
        extractedSkills: evaluation.matchedSkills,
        location: raw.location || 'Remote',
        employmentType: raw.employmentType || 'Full-time',
        salary: raw.salary || null,
        requirements: evaluation.missingSkills,
        matchScore: evaluation.matchScore,
        matchReason: evaluation.matchReason,
        status: initialStatus,
        isRelevant,
        isIgnored: false,
        postedAt: raw.postedAt || null,
      },
    });

    processedJobs.push(
      normalizeJobData({
        id: saved.id,
        sourcePostId: saved.sourcePostId || undefined,
        content: saved.rawContent,
        title: saved.extractedTitle || undefined,
        company: saved.extractedCompany || undefined,
        postUrl: saved.postUrl || undefined,
        location: saved.location || undefined,
        employmentType: saved.employmentType || undefined,
        salary: saved.salary || undefined,
        postedAt: saved.postedAt || undefined,
        discoveredAt: saved.discoveredAt,
        recipientEmail: saved.extractedEmail,
        skills: saved.extractedSkills,
        requirements: saved.requirements,
        matchScore: saved.matchScore || 0,
        matchReason: saved.matchReason || undefined,
        status: initialStatus,
      })
    );
  }

  return {
    totalProcessed: rawJobs.length,
    newDiscovered,
    matchedCount,
    jobs: processedJobs,
  };
}
