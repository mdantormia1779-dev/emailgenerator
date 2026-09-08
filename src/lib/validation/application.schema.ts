import { z } from 'zod';

export const applicationStatusEnum = z.enum([
  'DRAFT',
  'ANALYZED',
  'GENERATED',
  'REVIEWED',
  'SENT',
  'SHORTLISTED',
  'INTERVIEW',
  'REJECTED',
  'OFFER',
  'WITHDRAWN',
]);

export const createApplicationSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  jobUrl: z.string().url('Invalid URL').or(z.literal('')).nullable().optional(),
  jobDescription: z.string().min(1, 'Job description is required'),
  workType: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  recipientEmail: z.string().email('Invalid email').or(z.literal('')).nullable().optional(),
  subject: z.string().nullable().optional(),
  emailBody: z.string().nullable().optional(),
  resumeId: z.string().nullable().optional(),
  status: applicationStatusEnum.default('DRAFT'),
  matchScore: z.number().min(0).max(100).nullable().optional(),
  matchBreakdown: z.any().optional(),
  notes: z.string().nullable().optional(),
});

export const updateApplicationSchema = z.object({
  companyName: z.string().min(1).optional(),
  jobTitle: z.string().min(1).optional(),
  recipientEmail: z.string().email('Invalid email').or(z.literal('')).nullable().optional(),
  subject: z.string().nullable().optional(),
  emailBody: z.string().nullable().optional(),
  resumeId: z.string().nullable().optional(),
  status: applicationStatusEnum.optional(),
  matchScore: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
