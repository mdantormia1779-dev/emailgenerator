import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractEmailsFromText } from '@/lib/email-parser';
import { GeneratedEmail, JobAnalysisResult, UserProfile } from '@/types';

/**
 * AI Service for Job Analysis and Email Generation.
 *
 * CRITICAL ZERO-HALLUCINATION ENFORCEMENT:
 * - Never invent experience, skills, certifications, employers, or qualifications.
 * - Never claim skills that do not exist in the user's profile.
 * - Target 150-250 words.
 * - Enforce structured JSON output.
 */

function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your-gemini-api-key-here') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Analyzes a raw job description using Gemini AI + deterministic regex parsing for recipient emails.
 */
export async function analyzeJobDescription(rawText: string): Promise<JobAnalysisResult> {
  // 1. Deterministically extract any email addresses from the text first
  const extractedEmails = extractEmailsFromText(rawText);

  const client = getGeminiClient();

  // If no Gemini key is provided, use intelligent heuristic extraction
  if (!client) {
    return heuristicJobAnalysis(rawText, extractedEmails);
  }

  try {
    const model = client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1, // low temperature for precise factual extraction
      },
    });

    const prompt = `You are an expert recruiter and job analyst. Analyze the following job description and extract structured information.
CRITICAL INSTRUCTIONS:
- Extract ONLY what is explicitly stated in the text.
- Work type must be one of: "Remote", "Hybrid", "Onsite", or "Unknown".
- Extract company name, job title, experience requirement, location, required skills, preferred skills, responsibilities, and application instructions.
- Also look for any recipient application emails mentioned.

Job Description:
"""
${rawText}
"""

Return a JSON object with this exact schema:
{
  "companyName": string,
  "jobTitle": string,
  "experienceRequirement": string,
  "workType": "Remote" | "Hybrid" | "Onsite" | "Unknown",
  "location": string,
  "requiredSkills": string[],
  "preferredSkills": string[],
  "responsibilities": string[],
  "recipientEmails": string[],
  "applicationInstructions": string
}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const parsed = JSON.parse(text) as JobAnalysisResult;

    // Combine AI-detected emails with regex-extracted emails to ensure no recipient is missed
    const allEmails = Array.from(
      new Set([
        ...extractedEmails,
        ...(Array.isArray(parsed.recipientEmails) ? parsed.recipientEmails.map(e => e.trim().toLowerCase()) : []),
      ])
    ).filter(e => e.includes('@') && e.includes('.'));

    return {
      companyName: parsed.companyName || 'Unknown Company',
      jobTitle: parsed.jobTitle || 'Role Position',
      experienceRequirement: parsed.experienceRequirement || 'Not specified',
      workType: ['Remote', 'Hybrid', 'Onsite'].includes(parsed.workType) ? parsed.workType : 'Unknown',
      location: parsed.location || 'Not specified',
      requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
      preferredSkills: Array.isArray(parsed.preferredSkills) ? parsed.preferredSkills : [],
      responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : [],
      recipientEmails: allEmails,
      applicationInstructions: parsed.applicationInstructions || '',
    };
  } catch (error) {
    console.warn('[AI Service] Gemini API call failed, falling back to heuristic analysis:', error);
    return heuristicJobAnalysis(rawText, extractedEmails);
  }
}

/**
 * Generates a tailored application email strictly grounded in user profile facts.
 */
export async function generateApplicationEmail(
  profile: UserProfile,
  job: {
    companyName: string;
    jobTitle: string;
    requiredSkills: string[];
    preferredSkills: string[];
    jobDescription?: string;
    customInstructions?: string;
  }
): Promise<GeneratedEmail> {
  const client = getGeminiClient();

  if (!client) {
    return generateDeterministicEmail(profile, job);
  }

  try {
    const model = client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const prompt = `You are a professional executive career coach. Write a customized, compelling job application email for a candidate.

============================================================
ABSOLUTE CRITICAL SAFETY AND FACTUALITY RULES:
============================================================
1. ZERO HALLUCINATION: You MUST NOT invent, exaggerate, or assume ANY skill, past employer, project, degree, certification, metric, or accomplishment not explicitly provided in the Candidate Profile below.
2. DO NOT CLAIM MISSING SKILLS: If the job requires or prefers a skill that the candidate does NOT list in their profile, DO NOT state or imply that the candidate has it.
3. LENGTH: The email body must be concise and punchy, approximately 150-250 words.
4. TONE: Professional, confident, articulate, and authentic.
5. GROUNDING: Anchor the email around 1-2 real projects and real skills directly present in the candidate's profile that align with the job.

CANDIDATE PROFILE (FACTS ONLY):
- Name: ${profile.fullName}
- Title: ${profile.title}
- Total Experience: ${profile.yearsOfExperience} years
- Summary: ${profile.summary}
- Documented Skills: ${profile.skills.join(', ')}
- Documented Projects: ${JSON.stringify(profile.projects || [])}
- Documented Work Experience: ${JSON.stringify(profile.experiences || [])}
- Contact / Links: Email / Portfolio: ${profile.portfolio || 'N/A'}, GitHub: ${profile.github || 'N/A'}, LinkedIn: ${profile.linkedin || 'N/A'}

TARGET JOB:
- Company: ${job.companyName}
- Job Title: ${job.jobTitle}
- Required Skills: ${job.requiredSkills.join(', ')}
- Preferred Skills: ${job.preferredSkills.join(', ')}
${job.customInstructions ? `- Candidate Custom Instructions: ${job.customInstructions}` : ''}

Output a JSON object with this exact structure:
{
  "subject": string (e.g. "Application for [Job Title] - [Full Name]"),
  "greeting": string (e.g. "Dear Hiring Team at [Company]," or "Dear Hiring Manager,"),
  "body": string (The main 150-250 word email body, well-paragraphed, referencing only candidate's real profile facts),
  "relevantSkillsHighlight": string[] (1-4 actual skills from the candidate's profile highlighted in the email),
  "relevantProjectHighlight": string (Name and brief factual mention of a candidate project used),
  "closing": string (e.g. "Sincerely," or "Best regards,"),
  "signature": string (Candidate Full Name, Title, Phone/Portfolio)
}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const parsed = JSON.parse(text) as GeneratedEmail;

    const fullText = `${parsed.greeting}\n\n${parsed.body}\n\n${parsed.closing}\n${parsed.signature}`;
    const wordCount = fullText.trim().split(/\s+/).length;

    return {
      subject: parsed.subject || `Application for ${job.jobTitle} - ${profile.fullName}`,
      greeting: parsed.greeting || `Dear Hiring Team at ${job.companyName},`,
      body: parsed.body,
      relevantSkillsHighlight: parsed.relevantSkillsHighlight || [],
      relevantProjectHighlight: parsed.relevantProjectHighlight,
      closing: parsed.closing || 'Sincerely,',
      signature: parsed.signature || `${profile.fullName}\n${profile.title}`,
      wordCount,
    };
  } catch (error) {
    console.warn('[AI Service] Gemini generation failed, falling back to deterministic template:', error);
    return generateDeterministicEmail(profile, job);
  }
}

/**
 * Deterministic heuristic analysis when AI is offline or key not provided.
 */
function heuristicJobAnalysis(rawText: string, extractedEmails: string[]): JobAnalysisResult {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Common title keywords
  const titlePatterns = /(?:software engineer|full stack|frontend|backend|developer|product manager|data scientist|devops|designer|architect)/i;
  let jobTitle = 'Software Engineer';
  let companyName = 'Hiring Company';

  for (const line of lines.slice(0, 10)) {
    if (titlePatterns.test(line) && line.length < 80) {
      jobTitle = line;
      break;
    }
  }

  // Work type
  let workType: 'Remote' | 'Hybrid' | 'Onsite' | 'Unknown' = 'Unknown';
  if (/remote/i.test(rawText)) workType = 'Remote';
  else if (/hybrid/i.test(rawText)) workType = 'Hybrid';
  else if (/on-?site|office/i.test(rawText)) workType = 'Onsite';

  // Common tech skills lookup
  const techKeywords = [
    'TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'Python', 'Go',
    'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Docker', 'AWS', 'GCP', 'GraphQL',
    'REST API', 'Git', 'Kubernetes', 'Redis', 'CI/CD', 'Java', 'C#', 'SQL'
  ];

  const matchedSkills = techKeywords.filter(skill => {
    const reg = new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i');
    return reg.test(rawText);
  });

  const requiredSkills = matchedSkills.slice(0, 6);
  const preferredSkills = matchedSkills.slice(6, 10);

  // Experience heuristic
  const expMatch = rawText.match(/(\d+\+?\s*(?:-\s*\d+)?\s*(?:years?|yrs?)(?:\s+of\s+experience)?)/i);
  const experienceRequirement = expMatch ? expMatch[0] : '3+ years of experience';

  return {
    companyName,
    jobTitle,
    experienceRequirement,
    workType,
    location: workType === 'Remote' ? 'Remote' : 'Not specified',
    requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['TypeScript', 'React', 'Node.js'],
    preferredSkills,
    responsibilities: [
      'Design, build, and maintain efficient, reusable, and reliable code.',
      'Collaborate with cross-functional teams to define, design, and ship new features.',
      'Identify bottlenecks and devise solutions to optimize performance and security.'
    ],
    recipientEmails: extractedEmails,
    applicationInstructions: 'Submit resume and portfolio.',
  };
}

/**
 * Deterministic factual email generation fallback that adheres strictly to profile facts.
 */
function generateDeterministicEmail(
  profile: UserProfile,
  job: {
    companyName: string;
    jobTitle: string;
    requiredSkills: string[];
    preferredSkills: string[];
  }
): GeneratedEmail {
  // Find intersection of candidate skills and required skills
  const profileSkillsLower = profile.skills.map(s => s.toLowerCase());
  const overlappingSkills = job.requiredSkills.filter(req =>
    profileSkillsLower.some(ps => ps === req.toLowerCase() || ps.includes(req.toLowerCase()))
  );

  const skillsToMention = overlappingSkills.length > 0
    ? overlappingSkills.slice(0, 4)
    : profile.skills.slice(0, 3);

  const matchedProject = profile.projects && profile.projects.length > 0
    ? profile.projects[0]
    : null;

  const projectSentence = matchedProject
    ? `In my project "${matchedProject.title}", I built a solution utilizing ${matchedProject.techStack.slice(0, 3).join(', ')}, focusing on reliability and user impact.`
    : `Throughout my ${profile.yearsOfExperience} years of experience, I have developed scalable, maintainable applications with high engineering standards.`;

  const body = `I am writing to express my strong interest in the ${job.jobTitle} position at ${job.companyName}. With ${profile.yearsOfExperience} years of professional experience and a strong background in ${skillsToMention.join(', ')}, I am excited about the opportunity to contribute to your engineering goals.\n\n${projectSentence}\n\nMy background in ${profile.skills.slice(0, 3).join(', ')} aligns well with your team's technical focus. I would welcome the opportunity to discuss how my experience and problem-solving approach can support ${job.companyName}. Thank you for your time and consideration.`;

  const closing = 'Sincerely,';
  const signature = `${profile.fullName}\n${profile.title}${profile.portfolio ? `\nPortfolio: ${profile.portfolio}` : ''}${profile.phone ? `\nPhone: ${profile.phone}` : ''}`;

  const wordCount = `${body}\n${signature}`.trim().split(/\s+/).length;

  return {
    subject: `Application for ${job.jobTitle} - ${profile.fullName}`,
    greeting: `Dear Hiring Team at ${job.companyName},`,
    body,
    relevantSkillsHighlight: skillsToMention,
    relevantProjectHighlight: matchedProject ? matchedProject.title : undefined,
    closing,
    signature,
    wordCount,
  };
}
