import { extractEmailsFromText } from '@/lib/email-parser';
import { ParsedFacebookJob, RawFacebookPostInput } from './facebook.types';

const HIRING_INDICATORS = [
  /hiring/i,
  /looking\s+for/i,
  /vacancy/i,
  /job\s+opening/i,
  /urgent\s+requirement/i,
  /we\s+are\s+looking/i,
  /we're\s+hiring/i,
  /need\s+a/i,
  /position/i,
  /developer\s+needed/i,
  /send\s+(?:your\s+)?(?:cv|resume)/i,
  /apply\s+(?:at|to|here)/i,
  /salary/i,
  /remuneration/i,
];

const KNOWN_TECH_KEYWORDS = [
  'React',
  'React.js',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Node',
  'Express',
  'Express.js',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Tailwind CSS',
  'Tailwind',
  'Redux',
  'GraphQL',
  'REST API',
  'Prisma',
  'Docker',
  'Git',
  'HTML',
  'CSS',
  'AWS',
  'Vue',
  'Vue.js',
  'Angular',
  'Python',
  'Django',
];

const ROLE_PATTERNS = [
  /(?:hiring|urgent(?:\s+need)?|looking for|needed)[:\s]+([^\r\n]{3,60}?(?:developer|engineer|lead|specialist))/i,
  /([^\r\n]{2,40}?(?:frontend|front-end|react|next\.js|mern|full[- ]?stack|backend|web|software)\s+(?:developer|engineer))/i,
  /(?:role|position|job title)[:\s]+([^\r\n]{3,40})/i,
];

/**
 * Parses raw Facebook post content into structured job post data.
 */
export function parseFacebookJobPost(post: RawFacebookPostInput): ParsedFacebookJob {
  const content = post.content || '';
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Check if post is actually a job posting
  const isJobPost = HIRING_INDICATORS.some(pattern => pattern.test(content));

  // 2. Extract Job Title
  let title = 'Software Developer';
  for (const pattern of ROLE_PATTERNS) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const cleaned = match[1].replace(/[:\-–—🚀📢🔥*]+/g, '').trim();
      if (cleaned.length >= 4 && cleaned.length <= 50) {
        title = cleaned;
        break;
      }
    }
  }

  // Fallback title detection from first 3 lines
  if (title === 'Software Developer') {
    for (const line of lines.slice(0, 3)) {
      if (/frontend|react|next|mern|full[- ]?stack|software engineer/i.test(line) && line.length < 60) {
        title = line.replace(/[:\-–—🚀📢🔥*#]+/g, '').trim();
        break;
      }
    }
  }

  // 3. Extract Company Name
  let company = post.author || 'Company (via Facebook)';
  for (const line of lines) {
    const compLineMatch = line.match(/^(?:company|organization)[:\s]+([^\r\n]+)$/i);
    if (compLineMatch) {
      const candidate = compLineMatch[1].replace(/[:\-–—*]+/g, '').trim();
      if (candidate.length >= 2) {
        company = candidate;
        break;
      }
    }
  }
  if (company === (post.author || 'Company (via Facebook)')) {
    const atMatch = content.match(/(?:at)\s+([A-Za-z0-9\s.&'-]{2,30})\b/i);
    if (atMatch && !/developer|remote|engineer|urgent/i.test(atMatch[1])) {
      company = atMatch[1].trim();
    }
  }

  // 4. Extract Contact Email(s)
  const emails = extractEmailsFromText(content);
  const recipientEmail = emails.length > 0 ? emails[0] : null;

  // 5. Extract Tech Skills
  const detectedSkills: string[] = [];
  for (const tech of KNOWN_TECH_KEYWORDS) {
    const reg = new RegExp(`\\b${tech.replace('.', '\\.')}\\b`, 'i');
    if (reg.test(content)) {
      detectedSkills.push(tech);
    }
  }

  // 6. Extract Work Type
  let workType: 'Remote' | 'Hybrid' | 'Onsite' | 'Unknown' = 'Unknown';
  if (/remote/i.test(content)) workType = 'Remote';
  else if (/hybrid/i.test(content)) workType = 'Hybrid';
  else if (/on-?site|office/i.test(content)) workType = 'Onsite';

  // 7. Extract Experience Requirement
  let experience = 'Not specified';
  const expMatch = content.match(/(\d+\+?\s*(?:-\s*\d+)?\s*(?:years?|yrs?)(?:\s+of\s+experience)?)/i);
  if (expMatch) {
    experience = expMatch[0];
  }

  return {
    title,
    company,
    description: content,
    requiredSkills: detectedSkills.slice(0, 8),
    preferredSkills: detectedSkills.slice(8),
    recipientEmail,
    location: workType === 'Remote' ? 'Remote' : 'Location in post',
    workType,
    experience,
    isJobPost,
  };
}
