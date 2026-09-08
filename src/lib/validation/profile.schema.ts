import { z } from 'zod';

export const userProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Project title is required').max(100),
  description: z.string().min(1, 'Project description is required').max(1000),
  techStack: z.array(z.string().min(1)).default([]),
  liveUrl: z.string().url('Invalid URL').or(z.literal('')).nullable().optional(),
  githubUrl: z.string().url('Invalid GitHub URL').or(z.literal('')).nullable().optional(),
});

export const userExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, 'Company name is required').max(100),
  role: z.string().min(1, 'Job title is required').max(100),
  location: z.string().max(100).nullable().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().nullable().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().min(1, 'Description is required').max(2000),
  achievements: z.array(z.string()).default([]),
});

export const userEducationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, 'Institution is required').max(150),
  degree: z.string().min(1, 'Degree is required').max(100),
  fieldOfStudy: z.string().min(1, 'Field of study is required').max(100),
  startYear: z.number().int().min(1950).max(2100),
  endYear: z.number().int().min(1950).max(2100).nullable().optional(),
});

export const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  title: z.string().min(1, 'Professional title is required').max(100),
  yearsOfExperience: z.coerce.number().min(0, 'Years of experience must be 0 or more').max(50),
  summary: z.string().min(10, 'Summary should be at least 10 characters').max(3000),
  skills: z.array(z.string().min(1)).min(1, 'Add at least one skill'),
  github: z.string().url('Invalid GitHub URL').or(z.literal('')).nullable().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').or(z.literal('')).nullable().optional(),
  portfolio: z.string().url('Invalid Portfolio URL').or(z.literal('')).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  projects: z.array(userProjectSchema).default([]),
  experiences: z.array(userExperienceSchema).default([]),
  education: z.array(userEducationSchema).default([]),
});

export type ProfileInput = z.infer<typeof profileSchema>;
