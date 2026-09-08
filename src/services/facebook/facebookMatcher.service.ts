import { calculateJobMatch } from '@/services/match.service';
import { JobAnalysisResult, UserProfile } from '@/types';
import { FacebookMatchEvaluation, ParsedFacebookJob } from './facebook.types';

export const DEFAULT_TARGET_KEYWORDS = [
  'Frontend Developer',
  'Frontend Engineer',
  'React Developer',
  'React.js Developer',
  'Next.js Developer',
  'MERN Stack Developer',
  'MERN Developer',
  'Full Stack Developer',
  'Full-Stack Developer',
  'JavaScript Developer',
  'TypeScript Developer',
  'Web Developer',
  'Software Engineer',
];

/**
 * Evaluates whether a Facebook post matches candidate profile & target role keywords.
 */
export function evaluateFacebookJobMatch(
  parsedJob: ParsedFacebookJob,
  profile: UserProfile,
  targetKeywords: string[] = DEFAULT_TARGET_KEYWORDS,
  minMatchScore = 70
): FacebookMatchEvaluation {
  // 1. If post is not a job opening at all, instantly reject
  if (!parsedJob.isJobPost) {
    return {
      isRelevant: false,
      matchScore: 0,
      matchedKeyword: null,
      strongMatches: [],
      missingSkills: [],
      reason: 'Post was classified as non-job social discussion.',
    };
  }

  // 2. Check Role Keywords Alignment
  const postTitleLower = parsedJob.title.toLowerCase();
  const postDescLower = parsedJob.description.toLowerCase();

  let matchedKeyword: string | null = null;
  for (const kw of targetKeywords) {
    const kwLower = kw.toLowerCase().trim();
    if (postTitleLower.includes(kwLower) || postDescLower.includes(kwLower)) {
      matchedKeyword = kw;
      break;
    }
  }

  // If completely unrelated role (e.g. "Graphic Designer", "SEO Specialist", "Accountant")
  const nonTargetRoles = ['graphic designer', 'ui/ux designer', 'seo', 'content writer', 'accountant', 'sales', 'marketing'];
  const hasNonTargetRole = nonTargetRoles.some(r => postTitleLower.includes(r));
  if (hasNonTargetRole && !matchedKeyword) {
    return {
      isRelevant: false,
      matchScore: 15,
      matchedKeyword: null,
      strongMatches: [],
      missingSkills: [],
      reason: `Post title "${parsedJob.title}" does not match technical target roles.`,
    };
  }

  // 3. Format as JobAnalysisResult for the deterministic matching engine
  const jobAnalysis: JobAnalysisResult = {
    companyName: parsedJob.company,
    jobTitle: parsedJob.title,
    experienceRequirement: parsedJob.experience || 'Not specified',
    workType: parsedJob.workType || 'Unknown',
    location: parsedJob.location,
    requiredSkills: parsedJob.requiredSkills,
    preferredSkills: parsedJob.preferredSkills,
    responsibilities: [],
    recipientEmails: parsedJob.recipientEmail ? [parsedJob.recipientEmail] : [],
  };

  const matchBreakdown = calculateJobMatch(profile, jobAnalysis);

  // Bonus for explicit keyword match in title
  let adjustedScore = matchBreakdown.overallScore;
  if (matchedKeyword) {
    adjustedScore = Math.min(100, adjustedScore + 5);
  }

  const isRelevant = adjustedScore >= minMatchScore && (matchedKeyword !== null || parsedJob.requiredSkills.length > 0);

  return {
    isRelevant,
    matchScore: adjustedScore,
    matchedKeyword,
    strongMatches: matchBreakdown.strongMatches,
    missingSkills: matchBreakdown.missingSkills,
    reason: isRelevant
      ? `High profile compatibility (${adjustedScore}%) matching target role "${matchedKeyword || parsedJob.title}".`
      : `Score of ${adjustedScore}% is below required threshold (${minMatchScore}%).`,
  };
}
