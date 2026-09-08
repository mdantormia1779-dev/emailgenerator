import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const resumeUploadMetadataSchema = z.object({
  originalName: z.string().min(1, 'File name is required').max(255),
  mimeType: z.enum(
    ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    {
      errorMap: () => ({ message: 'Only PDF (.pdf) and Microsoft Word (.docx) files are supported.' }),
    }
  ),
  fileSize: z.number().max(MAX_FILE_SIZE, 'File size must not exceed 5MB.'),
  isDefault: z.boolean().default(false),
});

export type ResumeUploadMetadata = z.infer<typeof resumeUploadMetadataSchema>;
