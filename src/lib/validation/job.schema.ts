import { z } from 'zod';

export const jobAnalysisInputSchema = z.object({
  jobDescription: z.string().min(20, 'Job description must be at least 20 characters').max(20000),
  jobUrl: z.string().url('Invalid URL format').or(z.literal('')).optional().nullable(),
});

export const jobMatchInputSchema = z.object({
  jobAnalysis: z.object({
    companyName: z.string().default('Company'),
    jobTitle: z.string().default('Position'),
    experienceRequirement: z.string().default('Not specified'),
    workType: z.string().default('Unknown'),
    location: z.string().optional(),
    requiredSkills: z.array(z.string()).default([]),
    preferredSkills: z.array(z.string()).default([]),
    responsibilities: z.array(z.string()).default([]),
    recipientEmails: z.array(z.string()).default([]),
  }),
});

export const emailGenerationInputSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  jobDescription: z.string().optional(),
  recipientEmail: z.string().email('Invalid recipient email').optional(),
  customInstructions: z.string().max(500).optional(),
});

export type JobAnalysisInput = z.infer<typeof jobAnalysisInputSchema>;
export type JobMatchInput = z.infer<typeof jobMatchInputSchema>;
export type EmailGenerationInput = z.infer<typeof emailGenerationInputSchema>;
