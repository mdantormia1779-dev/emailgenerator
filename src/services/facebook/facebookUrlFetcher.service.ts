import { extractEmailsFromText } from '@/lib/email-parser';

export interface FetchedJobResult {
  url: string;
  isLive: boolean;
  httpStatus: number;
  title: string;
  company: string;
  recipientEmail: string | null;
  skills: string[];
  rawContent: string;
  location?: string;
  workType?: 'Remote' | 'Hybrid' | 'Onsite' | 'Unknown';
  errorMessage?: string;
}

const COMMON_TECH_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Express',
  'MongoDB', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Redux', 'REST API',
  'GraphQL', 'Docker', 'AWS', 'Python', 'Django', 'FastAPI', 'Vue.js',
  'Angular', 'PHP', 'Laravel', 'Java', 'Spring Boot', 'C#', '.NET', 'SQL',
  'Git', 'CI/CD', 'Kubernetes', 'Redis'
];

/**
 * Fetches and parses a real job URL (Facebook post, Facebook group URL, or external job posting).
 */
export async function fetchAndParseJobUrl(rawUrl: string): Promise<FetchedJobResult> {
  let normalizedUrl = rawUrl.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const headers: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
    };

    const res = await fetch(normalizedUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    const httpStatus = res.status;
    const isLive = res.ok;
    const html = await res.text();

    // Extract OpenGraph and Meta tags
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
      html.match(/<meta\s+content=["'](.*?)["']\s+property=["']og:title["']/i);
    const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) ||
      html.match(/<meta\s+content=["'](.*?)["']\s+property=["']og:description["']/i);
    const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) ||
      html.match(/<meta\s+content=["'](.*?)["']\s+name=["']description["']/i);
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);

    const ogTitle = ogTitleMatch ? decodeHtmlEntities(ogTitleMatch[1]) : '';
    const ogDesc = ogDescMatch ? decodeHtmlEntities(ogDescMatch[1]) : '';
    const metaDesc = metaDescMatch ? decodeHtmlEntities(metaDescMatch[1]) : '';
    const pageTitle = titleMatch ? decodeHtmlEntities(titleMatch[1]) : '';

    // Strip HTML tags for clean body text
    const cleanBodyText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Prioritize high-signal content
    const combinedContent = [ogTitle, pageTitle, ogDesc, metaDesc, cleanBodyText.slice(0, 3000)]
      .filter(Boolean)
      .join('\n\n');

    // Extract emails from all text
    const extractedEmails = extractEmailsFromText(combinedContent);
    const recipientEmail = extractedEmails.length > 0 ? extractedEmails[0] : null;

    // Detect skills
    const detectedSkills = COMMON_TECH_SKILLS.filter(skill => {
      const reg = new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i');
      return reg.test(combinedContent);
    });

    // Detect Title
    let title = 'Software Position';
    if (ogTitle && !ogTitle.toLowerCase().includes('log in') && !ogTitle.toLowerCase().includes('facebook')) {
      title = ogTitle.split('|')[0].split('-')[0].trim();
    } else if (pageTitle && !pageTitle.toLowerCase().includes('log in') && !pageTitle.toLowerCase().includes('facebook')) {
      title = pageTitle.split('|')[0].split('-')[0].trim();
    } else {
      // Heuristic title match from text
      const titlePattern = /(?:MERN|Full Stack|Frontend|Backend|React|Next\.js|Software|Web|Node\.js)\s+(?:Developer|Engineer|Architect)/i;
      const match = combinedContent.match(titlePattern);
      if (match) title = match[0];
    }

    // Detect Company
    let company = 'Company (via Link)';
    const domainMatch = normalizedUrl.match(/https?:\/\/(?:www\.)?([^\/]+)/i);
    const domain = domainMatch ? domainMatch[1] : '';

    if (domain.includes('facebook.com')) {
      // Try to extract group or page name from URL
      const groupMatch = normalizedUrl.match(/facebook\.com\/groups\/([^\/\?]+)/i);
      if (groupMatch) {
        company = decodeURIComponent(groupMatch[1]).replace(/[-_]/g, ' ') + ' (FB Group)';
      } else {
        company = 'Facebook Hiring Post';
      }
    } else if (domain) {
      company = domain.split('.')[0].toUpperCase();
    }

    // Work type
    let workType: 'Remote' | 'Hybrid' | 'Onsite' | 'Unknown' = 'Unknown';
    if (/remote/i.test(combinedContent)) workType = 'Remote';
    else if (/hybrid/i.test(combinedContent)) workType = 'Hybrid';
    else if (/on-?site|office/i.test(combinedContent)) workType = 'Onsite';

    // Summary representation
    const rawContent = (ogDesc || metaDesc || cleanBodyText.slice(0, 1500) || `Job opportunity at ${normalizedUrl}`)
      .trim();

    return {
      url: normalizedUrl,
      isLive,
      httpStatus,
      title: title || 'Developer Position',
      company,
      recipientEmail,
      skills: detectedSkills,
      rawContent,
      workType,
    };
  } catch (err: any) {
    return {
      url: normalizedUrl,
      isLive: false,
      httpStatus: 0,
      title: 'Job Link',
      company: 'External Link',
      recipientEmail: null,
      skills: [],
      rawContent: `Link provided: ${normalizedUrl}`,
      errorMessage: err.message || 'Failed to reach link',
    };
  }
}

/**
 * Validates whether a job URL is currently live and reachable.
 */
export async function verifyUrlReachability(url: string): Promise<{
  isLive: boolean;
  status: number;
  url: string;
  title?: string;
  errorMessage?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/123.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    let title = '';
    if (res.ok) {
      const text = await res.text();
      const match = text.match(/<title>(.*?)<\/title>/i);
      if (match) title = decodeHtmlEntities(match[1]).trim();
    }

    return {
      isLive: res.ok,
      status: res.status,
      url,
      title: title || undefined,
    };
  } catch (err: any) {
    return {
      isLive: false,
      status: 0,
      url,
      errorMessage: err.message || 'Connection failed',
    };
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}
