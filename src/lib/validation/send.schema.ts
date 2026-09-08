import { z } from 'zod';

export const explicitConfirmationSchema = z.object({
  reviewedRecipient: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm you have reviewed the recipient email.' }),
  }),
  reviewedEmail: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm you have reviewed the email subject and body.' }),
  }),
  reviewedAttachment: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm you have reviewed the resume attachment.' }),
  }),
  confirmSend: z.literal(true, {
    errorMap: () => ({ message: 'You must explicitly confirm you want to send this application.' }),
  }),
});

export const sendApplicationSchema = z.object({
  recipientEmail: z.string().email('A valid recipient email is required to send.'),
  subject: z.string().min(1, 'Email subject cannot be empty.').max(250),
  emailBody: z.string().min(10, 'Email body is too short. Please provide a complete email.'),
  resumeId: z.string().nullable().optional(),
  confirmations: explicitConfirmationSchema,
});

export type ExplicitConfirmationInput = z.infer<typeof explicitConfirmationSchema>;
export type SendApplicationInput = z.infer<typeof sendApplicationSchema>;
