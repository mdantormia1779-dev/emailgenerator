export type ApplicationStatus =
  | 'DRAFT'
  | 'ANALYZED'
  | 'GENERATED'
  | 'REVIEWED'
  | 'SENT'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'OFFER'
  | 'WITHDRAWN';

export type EventType =
  | 'STATUS_CHANGED'
  | 'EMAIL_GENERATED'
  | 'EMAIL_EDITED'
  | 'EMAIL_SENT'
  | 'NOTE_ADDED'
  | 'RESUME_ATTACHED'
  | 'DRAFT_GENERATED_FROM_FACEBOOK';

export interface UserProfile {
  id?: string;
  fullName: string;
  title: string;
  yearsOfExperience: number;
  summary: string;
  skills: string[];
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  phone?: string | null;
  location?: string | null;
  projects?: UserProject[];
  experiences?: UserExperience[];
  education?: UserEducation[];
}

export interface UserProject {
  id?: string;
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string | null;
  githubUrl?: string | null;
}

export interface UserExperience {
  id?: string;
  company: string;
  role: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description: string;
  achievements: string[];
}

export interface UserEducation {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number | null;
}

export interface JobAnalysisResult {
  companyName: string;
  jobTitle: string;
  experienceRequirement: string;
  workType: 'Remote' | 'Hybrid' | 'Onsite' | 'Unknown';
  location?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  recipientEmails: string[];
  applicationInstructions?: string;
}

export interface MatchBreakdown {
  overallScore: number; // 0-100
  technicalSkillScore: number; // 0-100 (50% weight)
  experienceScore: number; // 0-100 (20% weight)
  projectScore: number; // 0-100 (20% weight)
  otherScore: number; // 0-100 (10% weight)
  strongMatches: string[];
  missingSkills: string[];
  relevantProjects: Array<{
    title: string;
    matchedSkills: string[];
  }>;
  explanation: string;
}

export interface GeneratedEmail {
  subject: string;
  greeting: string;
  body: string;
  relevantSkillsHighlight: string[];
  relevantProjectHighlight?: string;
  closing: string;
  signature: string;
  wordCount: number;
}

export interface ExplicitConfirmation {
  reviewedRecipient: boolean;
  reviewedEmail: boolean;
  reviewedAttachment: boolean;
  confirmSend: boolean;
}

export interface SendApplicationPayload {
  recipientEmail: string;
  subject: string;
  emailBody: string;
  resumeId?: string | null;
  confirmations: ExplicitConfirmation;
}
