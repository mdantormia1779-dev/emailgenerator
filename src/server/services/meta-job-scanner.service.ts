import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { extractEmailsFromText } from '@/lib/email-parser';
import { getUserProfile } from '@/services/profile.service';
import { getDecryptedMetaToken, getMetaUserPages, fetchPageFeedPosts, getGraphApiVersion } from '@/services/meta.service';
import { UserProfile } from '@/types';
import { AppError } from '@/lib/errors';

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
  source: 'FACEBOOK';
  sourcePostId?: string;
  postHash: string;
  title: string;
  company: string;
  description: string;
  location: string;
  employmentType: string;
  salary?: string;
  postUrl?: string;
  contactEmail?: string;
  requirements: string[];
  skills: string[];
  postedAt?: string;
  discoveredAt: string;
  matchScore: number;
  matchTier?: MatchTier;
  matchedSkills: string[];
  matchReason: string;
  status: JobStatus;
}

export interface SyncResult {
  success: boolean;
  searched: number;
  fetched: number;
  newJobs: number;
  duplicates: number;
  matched: number;
  jobs?: NormalizedJobOpportunity[];
  error?: string;
}

export const DEFAULT_SEARCH_KEYWORDS = [
  'Frontend Developer',
  'React Developer',
  'Next.js Developer',
  'MERN Stack Developer',
  'Full Stack Developer',
  'JavaScript Developer',
  'TypeScript Developer',
  'Node.js Developer',
  'Software Engineer',
  'Web Developer',
];

export const DEFAULT_SEARCH_LOCATIONS = [
  'Bangladesh',
  'Remote',
];

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
  'Git',
  'GitHub',
  'Docker',
  'AWS',
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
  'Software Engineer',
  'Web Developer',
];

/**
 * Loads configurable keywords from environment or defaults.
 */
export function getConfiguredKeywords(): string[] {
  const envKeywords = process.env.META_JOB_SEARCH_KEYWORDS;
  if (!envKeywords) return DEFAULT_SEARCH_KEYWORDS;

  try {
    const parsed = JSON.parse(envKeywords);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // Treat as comma-delimited
    const split = envKeywords.split(',').map(s => s.trim()).filter(Boolean);
    if (split.length > 0) return split;
  }
  return DEFAULT_SEARCH_KEYWORDS;
}

/**
 * Loads configurable locations from environment or defaults.
 */
export function getConfiguredLocations(): string[] {
  const envLocations = process.env.META_JOB_LOCATIONS;
  if (!envLocations) return DEFAULT_SEARCH_LOCATIONS;

  try {
    const parsed = JSON.parse(envLocations);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    const split = envLocations.split(',').map(s => s.trim()).filter(Boolean);
    if (split.length > 0) return split;
  }
  return DEFAULT_SEARCH_LOCATIONS;
}

/**
 * Computes deterministic SHA-256 content hash for duplicate detection.
 */
export function computeJobHash(content: string, postUrl?: string): string {
  const normalized = `${(content || '').replace(/\s+/g, ' ').trim().toLowerCase()}_${(postUrl || '').trim().toLowerCase()}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Fetch with safe exponential backoff handling HTTP 429 and Meta rate limit errors.
 */
export async function fetchWithBackoff(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<Response> {
  let attempt = 0;
  let delay = 1000;

  while (attempt < maxRetries) {
    try {
      const res = await fetch(url, options);

      // Handle HTTP 429
      if (res.status === 429) {
        attempt++;
        if (attempt >= maxRetries) {
          throw new AppError('Meta API rate limit reached (HTTP 429). Please wait a few minutes before trying again.', 429);
        }
        const jitter = Math.random() * 300;
        await new Promise(r => setTimeout(r, delay + jitter));
        delay *= 2;
        continue;
      }

      return res;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      attempt++;
      if (attempt >= maxRetries) throw err;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }

  throw new AppError('Max retries exceeded while communicating with Meta Graph API.', 500);
}

/**
 * Searches jobs across authorized Facebook sources for a specific keyword.
 * Uses cursor pagination where supported by Graph API.
 */
export async function searchJobs(
  keyword: string,
  options: {
    location?: string;
    limit?: number;
    cursor?: string;
    pageAccessToken?: string;
    pageId?: string;
    token?: string;
  } = {}
): Promise<{
  items: Array<{
    id: string;
    message?: string;
    created_time?: string;
    permalink_url?: string;
    from?: { id: string; name: string };
  }>;
  nextCursor: string | null;
  nextUrl: string | null;
}> {
  const apiVersion = getGraphApiVersion();
  const limit = options.limit || 25;

  // If a specific page ID and token are provided, query its feed
  if (options.pageId && options.pageAccessToken) {
    const endpoint = new URL(`https://graph.facebook.com/${apiVersion}/${encodeURIComponent(options.pageId)}/feed`);
    endpoint.searchParams.set('fields', 'id,message,created_time,permalink_url,from');
    endpoint.searchParams.set('limit', String(limit));
    endpoint.searchParams.set('access_token', options.pageAccessToken);

    if (options.cursor) {
      endpoint.searchParams.set('after', options.cursor);
    }

    const res = await fetchWithBackoff(endpoint.toString());
    const data = await res.json();

    if (!res.ok || data.error) {
      console.warn(`[Meta Job Scanner] Error fetching page feed for ${options.pageId}:`, data.error?.message);
      return { items: [], nextCursor: null, nextUrl: null };
    }

    const rawItems = Array.isArray(data.data) ? data.data : [];
    // Filter posts that match keyword or target skills
    const lowerKeyword = keyword.toLowerCase();
    const filtered = rawItems.filter((item: any) => {
      const msg = (item.message || '').toLowerCase();
      return msg.includes(lowerKeyword);
    });

    const nextCursor = data.paging?.cursors?.after || null;
    const nextUrl = data.paging?.next || null;

    return { items: filtered.length > 0 ? filtered : rawItems, nextCursor, nextUrl };
  }

  // Fallback: return empty result if no live page credentials
  return { items: [], nextCursor: null, nextUrl: null };
}

/**
 * Fetches the next page of results using cursor-based pagination.
 */
export async function fetchNextPage(
  nextCursorOrUrl: string,
  accessToken?: string
): Promise<{
  items: any[];
  nextCursor: string | null;
  nextUrl: string | null;
}> {
  if (!nextCursorOrUrl) {
    return { items: [], nextCursor: null, nextUrl: null };
  }

  let fetchUrl = nextCursorOrUrl;
  // If nextCursorOrUrl is just a cursor string, we can't construct full url without endpoint context
  if (!nextCursorOrUrl.startsWith('http')) {
    return { items: [], nextCursor: null, nextUrl: null };
  }

  // Ensure access token is present
  if (accessToken && !fetchUrl.includes('access_token')) {
    const parsed = new URL(fetchUrl);
    parsed.searchParams.set('access_token', accessToken);
    fetchUrl = parsed.toString();
  }

  const res = await fetchWithBackoff(fetchUrl);
  const data = await res.json();

  if (!res.ok || data.error) {
    console.warn('[Meta Job Scanner] Error fetching next page:', data.error?.message);
    return { items: [], nextCursor: null, nextUrl: null };
  }

  return {
    items: Array.isArray(data.data) ? data.data : [],
    nextCursor: data.paging?.cursors?.after || null,
    nextUrl: data.paging?.next || null,
  };
}

/**
 * Normalizes raw Facebook/Meta post data into standard NormalizedJobOpportunity.
 */
export function normalizeJob(raw: {
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
  matchedSkills?: string[];
  matchReason?: string;
  status?: JobStatus;
}): NormalizedJobOpportunity {
  const content = raw.content || '';
  const postUrl = raw.postUrl;
  const postHash = computeJobHash(content, postUrl);

  const extractedEmails = extractEmailsFromText(content);
  const contactEmail = raw.recipientEmail || (extractedEmails.length > 0 ? extractedEmails[0] : undefined);

  // Extract skills from content if not explicitly provided
  let skills = raw.skills || [];
  if (skills.length === 0) {
    skills = TARGET_DEVELOPER_SKILLS.filter(skill => {
      const reg = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return reg.test(content);
    });
  }

  // Detect title if not provided
  let title = raw.title;
  if (!title) {
    const matchedRole = TARGET_ROLE_KEYWORDS.find(r => new RegExp(`\\b${r}\\b`, 'i').test(content));
    title = matchedRole || (skills[0] ? `${skills[0]} Developer` : 'Software Developer');
  }

  // Work type detection
  let employmentType = raw.employmentType || 'Full-time';
  if (/contract|freelance/i.test(content)) employmentType = 'Contract';
  else if (/part-?time/i.test(content)) employmentType = 'Part-time';
  else if (/intern/i.test(content)) employmentType = 'Internship';

  // Location detection
  let location = raw.location || 'Remote';
  if (/remote/i.test(content)) location = 'Remote';
  else if (/hybrid/i.test(content)) location = 'Hybrid';
  else if (/bangladesh|dhaka/i.test(content)) location = 'Bangladesh';
  else if (/on-?site/i.test(content)) location = 'Onsite';

  const score = raw.matchScore ?? 0;
  const tier: MatchTier = score >= 90 ? 'Excellent Match' : score >= 75 ? 'Strong Match' : score >= 60 ? 'Potential Match' : 'Low Match';

  return {
    id: raw.id || `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    source: 'FACEBOOK',
    sourcePostId: raw.sourcePostId,
    postHash,
    title,
    company: raw.company || 'Company (via Meta)',
    description: content,
    location,
    employmentType,
    salary: raw.salary,
    postUrl,
    contactEmail,
    requirements: raw.requirements || [],
    skills,
    postedAt: raw.postedAt ? new Date(raw.postedAt).toISOString() : undefined,
    discoveredAt: raw.discoveredAt ? new Date(raw.discoveredAt).toISOString() : new Date().toISOString(),
    matchScore: score,
    matchTier: tier,
    matchedSkills: raw.matchedSkills || [],
    matchReason: raw.matchReason || 'Discovered via Meta Job Discovery system.',
    status: raw.status || (score >= 70 ? 'MATCHED' : 'DISCOVERED'),
  };
}

/**
 * Evaluates candidate profile skills and target roles against a job posting.
 * Scoring Tiers:
 * 90-100 = Excellent Match
 * 75-89 = Strong Match
 * 60-74 = Potential Match
 * Below 60 = Low Match
 */
export function calculateMatchScore(
  job: {
    title: string;
    description: string;
    skills?: string[];
    requirements?: string[];
  },
  profile: UserProfile
): {
  matchScore: number;
  matchedSkills: string[];
  matchReason: string;
  matchTier: MatchTier;
  missingSkills: string[];
} {
  const candidateSkillsLower = (profile.skills || []).map(s => s.toLowerCase());
  const combinedJobText = `${job.title} ${job.description} ${(job.skills || []).join(' ')} ${(job.requirements || []).join(' ')}`.toLowerCase();

  // 1. Detect target skills present in the posting
  const detectedTargetSkills = TARGET_DEVELOPER_SKILLS.filter(skill => {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return pattern.test(combinedJobText);
  });

  const allJobSkills = Array.from(new Set([...(job.skills || []), ...detectedTargetSkills]));

  // 2. Identify candidate skill overlap
  const matchedSkills = allJobSkills.filter(skill =>
    candidateSkillsLower.some(cs => cs === skill.toLowerCase() || cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
  );

  const missingSkills = allJobSkills.filter(skill => !matchedSkills.includes(skill));

  // 3. Match Role Keywords for Title Alignment Bonus (+20)
  let titleBonus = 0;
  const matchedRole = TARGET_ROLE_KEYWORDS.find(role =>
    combinedJobText.includes(role.toLowerCase()) || job.title.toLowerCase().includes(role.toLowerCase())
  );
  if (matchedRole) {
    titleBonus = 20;
  }

  // 4. Skills match calculation
  let skillsScore = 50;
  if (allJobSkills.length > 0) {
    const ratio = matchedSkills.length / allJobSkills.length;
    skillsScore = Math.round(ratio * 70);
  }

  let rawScore = Math.min(98, Math.max(30, skillsScore + titleBonus));

  // Core skills boost (React, Next.js, TypeScript, Node.js)
  const hasCoreMatch = matchedSkills.some(s =>
    ['react', 'next.js', 'typescript', 'node.js', 'javascript'].includes(s.toLowerCase())
  );
  if (hasCoreMatch && rawScore < 70) {
    rawScore = 72;
  }

  // Categorize Tier
  let matchTier: MatchTier = 'Low Match';
  if (rawScore >= 90) matchTier = 'Excellent Match';
  else if (rawScore >= 75) matchTier = 'Strong Match';
  else if (rawScore >= 60) matchTier = 'Potential Match';

  // Build transparent human-readable explanation
  let matchReason = '';
  if (matchedSkills.length > 0) {
    const skillsList = matchedSkills.slice(0, 4).join(', ');
    matchReason = `${matchTier === 'Excellent Match' ? 'Excellent' : matchTier === 'Strong Match' ? 'Strong' : 'Potential'} match because the job requires ${skillsList}${matchedRole ? ` and targets ${matchedRole}` : ''}.`;
    if (missingSkills.length > 0) {
      matchReason += ` (Missing: ${missingSkills.slice(0, 2).join(', ')})`;
    }
  } else {
    matchReason = `Low match: job requirements do not clearly align with candidate skills (${(profile.skills || []).slice(0, 3).join(', ')}).`;
  }

  return {
    matchScore: rawScore,
    matchedSkills,
    matchReason,
    matchTier,
    missingSkills,
  };
}

/**
 * Removes duplicates from candidate jobs using deterministic SHA-256 hashes and source IDs.
 */
export function removeDuplicates(
  jobs: NormalizedJobOpportunity[],
  existingHashesOrIds: Set<string>
): {
  uniqueJobs: NormalizedJobOpportunity[];
  duplicateCount: number;
} {
  const seenInBatch = new Set<string>();
  const uniqueJobs: NormalizedJobOpportunity[] = [];
  let duplicateCount = 0;

  for (const job of jobs) {
    const hash = job.postHash;
    const sourceId = job.sourcePostId;

    if (
      existingHashesOrIds.has(hash) ||
      (sourceId && existingHashesOrIds.has(sourceId)) ||
      seenInBatch.has(hash) ||
      (sourceId && seenInBatch.has(sourceId))
    ) {
      duplicateCount++;
      continue;
    }

    seenInBatch.add(hash);
    if (sourceId) seenInBatch.add(sourceId);
    uniqueJobs.push(job);
  }

  return { uniqueJobs, duplicateCount };
}

/**
 * Executes full automatic job discovery sync against configured keywords and Meta sources.
 * Adheres strictly to official API capabilities, uses cursor pagination,
 * removes duplicates, matches against resume profile, and persists to database.
 */
export async function syncJobs(
  userId: string,
  options: {
    pageId?: string;
    customKeywords?: string[];
    customLocations?: string[];
    maxPagesPerKeyword?: number;
    mockJobsForTesting?: Array<{
      content: string;
      title?: string;
      company?: string;
      postUrl?: string;
      sourcePostId?: string;
      location?: string;
      postedAt?: Date;
    }>;
  } = {}
): Promise<SyncResult> {
  const profileData = await getUserProfile(userId);
  if (!profileData) {
    throw new AppError('User profile not found. Please complete your developer profile first.', 400);
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

  const keywords = options.customKeywords || getConfiguredKeywords();
  const maxPages = options.maxPagesPerKeyword || 2;

  // Retrieve user's connected Meta token if present
  const accessToken = await getDecryptedMetaToken(userId);
  let managedPages: Array<{ id: string; name: string; accessToken: string }> = [];

  if (accessToken) {
    try {
      managedPages = await getMetaUserPages(accessToken);
      if (options.pageId) {
        managedPages = managedPages.filter(p => p.id === options.pageId);
      }
    } catch (e: any) {
      console.warn('[Meta Job Scanner] Could not list user pages:', e.message);
    }
  }

  // Load existing post hashes and source IDs from database for deduplication
  const existingJobOpportunities = await prisma.jobOpportunity.findMany({
    where: { userId },
    select: { postHash: true, sourcePostId: true },
  });

  const existingHashes = new Set<string>();
  existingJobOpportunities.forEach(j => {
    if (j.postHash) existingHashes.add(j.postHash);
    if (j.sourcePostId) existingHashes.add(j.sourcePostId);
  });

  const fetchedRaw: Array<{
    content: string;
    title?: string;
    company?: string;
    postUrl?: string;
    sourcePostId?: string;
    location?: string;
    postedAt?: Date;
  }> = [];

  let searchedCount = 0;

  // 1. Fetch from connected Meta Pages via Graph API (Cursor-based pagination)
  for (const keyword of keywords) {
    searchedCount++;

    for (const page of managedPages) {
      let pageCount = 0;
      let nextCursor: string | null = null;
      let nextUrl: string | null = null;

      while (pageCount < maxPages) {
        pageCount++;

        let searchResult;
        if (nextUrl) {
          searchResult = await fetchNextPage(nextUrl, page.accessToken);
        } else {
          searchResult = await searchJobs(keyword, {
            pageId: page.id,
            pageAccessToken: page.accessToken,
            cursor: nextCursor || undefined,
          });
        }

        if (!searchResult.items || searchResult.items.length === 0) break;

        for (const item of searchResult.items) {
          if (item.message && item.message.trim().length > 15) {
            fetchedRaw.push({
              content: item.message,
              title: keyword,
              company: page.name,
              postUrl: item.permalink_url,
              sourcePostId: item.id,
              postedAt: item.created_time ? new Date(item.created_time) : undefined,
            });
          }
        }

        nextCursor = searchResult.nextCursor;
        nextUrl = searchResult.nextUrl;
        if (!nextCursor && !nextUrl) break;
      }
    }
  }

  // 2. Add test mock or structured test feeds if passed (for test suites and verified inputs)
  if (options.mockJobsForTesting && options.mockJobsForTesting.length > 0) {
    fetchedRaw.push(...options.mockJobsForTesting);
  }

  // 3. Normalize all fetched opportunities
  const normalizedOpportunities: NormalizedJobOpportunity[] = fetchedRaw.map(raw =>
    normalizeJob({
      content: raw.content,
      title: raw.title,
      company: raw.company,
      postUrl: raw.postUrl,
      sourcePostId: raw.sourcePostId,
      location: raw.location,
      postedAt: raw.postedAt,
    })
  );

  // 4. Remove Duplicates
  const { uniqueJobs, duplicateCount } = removeDuplicates(normalizedOpportunities, existingHashes);

  let matchedCount = 0;
  let newJobsCount = 0;
  const savedOpportunities: NormalizedJobOpportunity[] = [];

  // 5. Match against Resume & Persist
  for (const job of uniqueJobs) {
    const match = calculateMatchScore(
      {
        title: job.title,
        description: job.description,
        skills: job.skills,
      },
      profile
    );

    const isRelevant = match.matchScore >= 70;
    const status: JobStatus = isRelevant ? 'MATCHED' : 'DISCOVERED';

    if (isRelevant) matchedCount++;
    newJobsCount++;

    // Persist to JobOpportunity table
    const saved = await prisma.jobOpportunity.create({
      data: {
        userId,
        source: 'FACEBOOK',
        sourcePostId: job.sourcePostId || null,
        postHash: job.postHash,
        title: job.title,
        company: job.company,
        description: job.description,
        location: job.location,
        employmentType: job.employmentType,
        salary: job.salary || null,
        postUrl: job.postUrl || null,
        contactEmail: job.contactEmail || null,
        requirements: match.missingSkills,
        skills: match.matchedSkills,
        postedAt: job.postedAt ? new Date(job.postedAt) : null,
        discoveredAt: new Date(job.discoveredAt),
        matchScore: match.matchScore,
        matchedSkills: match.matchedSkills,
        matchReason: match.matchReason,
        status,
      },
    });

    // Also persist to FacebookPost for backwards compatibility
    try {
      await prisma.facebookPost.upsert({
        where: { postHash: job.postHash },
        update: {},
        create: {
          userId,
          source: 'FACEBOOK',
          sourcePostId: job.sourcePostId || null,
          postUrl: job.postUrl || null,
          postHash: job.postHash,
          rawContent: job.description,
          extractedTitle: job.title,
          extractedCompany: job.company,
          extractedEmail: job.contactEmail || null,
          extractedSkills: match.matchedSkills,
          location: job.location,
          employmentType: job.employmentType,
          salary: job.salary || null,
          requirements: match.missingSkills,
          matchScore: match.matchScore,
          matchReason: match.matchReason,
          status,
          isRelevant,
          isIgnored: false,
          postedAt: job.postedAt ? new Date(job.postedAt) : null,
        },
      });
    } catch {
      // Non-critical mirror write
    }

    savedOpportunities.push({
      ...job,
      id: saved.id,
      matchScore: match.matchScore,
      matchedSkills: match.matchedSkills,
      matchReason: match.matchReason,
      status,
    });
  }

  return {
    success: true,
    searched: searchedCount,
    fetched: fetchedRaw.length,
    newJobs: newJobsCount,
    duplicates: duplicateCount,
    matched: matchedCount,
    jobs: savedOpportunities,
  };
}
