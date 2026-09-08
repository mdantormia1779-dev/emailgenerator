import { describe, it, expect } from 'vitest';
import { sendApplicationSchema } from '@/lib/validation/send.schema';
import { resumeUploadMetadataSchema } from '@/lib/validation/resume.schema';

describe('Zod Validation Schemas', () => {
  describe('Send Application Explicit Confirmations', () => {
    it('accepts valid payload when all 4 confirmation checkboxes are strictly true', () => {
      const validPayload = {
        recipientEmail: 'recruiter@company.com',
        subject: 'Application for Senior Engineer',
        emailBody: 'Dear Hiring Manager, please find my application attached.',
        resumeId: 'resume-123',
        confirmations: {
          reviewedRecipient: true,
          reviewedEmail: true,
          reviewedAttachment: true,
          confirmSend: true,
        },
      };

      const result = sendApplicationSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects if ANY of the 4 confirmation checkboxes is false or missing', () => {
      const invalidPayload = {
        recipientEmail: 'recruiter@company.com',
        subject: 'Application for Senior Engineer',
        emailBody: 'Dear Hiring Manager, please find my application attached.',
        confirmations: {
          reviewedRecipient: true,
          reviewedEmail: true,
          reviewedAttachment: false, // FALSE!
          confirmSend: true,
        },
      };

      const result = sendApplicationSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('reviewedAttachment');
      }
    });

    it('rejects invalid recipient emails', () => {
      const invalidEmailPayload = {
        recipientEmail: 'not-an-email',
        subject: 'Application',
        emailBody: 'Dear Hiring Manager, hello.',
        confirmations: {
          reviewedRecipient: true,
          reviewedEmail: true,
          reviewedAttachment: true,
          confirmSend: true,
        },
      };

      const result = sendApplicationSchema.safeParse(invalidEmailPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('Resume Upload Constraints', () => {
    it('rejects file sizes greater than 5MB', () => {
      const result = resumeUploadMetadataSchema.safeParse({
        originalName: 'resume.pdf',
        mimeType: 'application/pdf',
        fileSize: 6 * 1024 * 1024, // 6MB
        isDefault: false,
      });

      expect(result.success).toBe(false);
    });

    it('rejects unsupported file MIME types like executable or image', () => {
      const result = resumeUploadMetadataSchema.safeParse({
        originalName: 'virus.exe',
        mimeType: 'application/x-msdownload',
        fileSize: 1024,
        isDefault: false,
      });

      expect(result.success).toBe(false);
    });
  });
});
