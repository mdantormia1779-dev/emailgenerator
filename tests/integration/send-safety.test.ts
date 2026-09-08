import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendApplication } from '@/services/application.service';
import * as gmailService from '@/services/gmail.service';
import prisma from '@/lib/prisma';

// Mock Gmail service send function to spy on whether it gets called
vi.mock('@/services/gmail.service', () => ({
  sendGmailEmail: vi.fn().mockResolvedValue({
    messageId: 'mock_message_id_123',
    senderEmail: 'test.applicant@gmail.com',
  }),
}));

describe('Send Email Safety & Confirmation Enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAppId = 'app-123';
  const mockUserId = 'user-123';

  it('CRITICAL: MUST reject request and MUST NOT send email if confirmSend is false', async () => {
    // Mock application in REVIEWED state
    vi.spyOn(prisma.jobApplication, 'findUnique').mockResolvedValue({
      id: mockAppId,
      userId: mockUserId,
      companyName: 'Stripe',
      jobTitle: 'Senior Software Engineer',
      status: 'REVIEWED',
      recipientEmail: 'recruiting@stripe.com',
      subject: 'Application - Senior Software Engineer',
      emailBody: 'Dear Stripe Team, I am excited to apply...',
      sentAt: null,
      providerMessageId: null,
      resumeId: null,
      resume: null,
      emails: [],
      events: [],
    } as any);

    const unconfirmedPayload = {
      recipientEmail: 'recruiting@stripe.com',
      subject: 'Application - Senior Software Engineer',
      emailBody: 'Dear Stripe Team, I am excited to apply...',
      confirmations: {
        reviewedRecipient: true,
        reviewedEmail: true,
        reviewedAttachment: true,
        confirmSend: false, // CRITICAL: User did NOT confirm sending!
      },
    };

    await expect(
      sendApplication(mockAppId, mockUserId, unconfirmedPayload as any)
    ).rejects.toThrow('Explicit user confirmation required');

    // VERIFY: Gmail send function MUST NEVER have been called!
    expect(gmailService.sendGmailEmail).not.toHaveBeenCalled();
  });

  it('CRITICAL: MUST reject request and MUST NOT send email if reviewedRecipient is false', async () => {
    vi.spyOn(prisma.jobApplication, 'findUnique').mockResolvedValue({
      id: mockAppId,
      userId: mockUserId,
      companyName: 'Stripe',
      jobTitle: 'Senior Software Engineer',
      status: 'REVIEWED',
      recipientEmail: 'recruiting@stripe.com',
      subject: 'Application',
      emailBody: 'Dear Stripe Team...',
      sentAt: null,
      providerMessageId: null,
      resumeId: null,
      resume: null,
      emails: [],
      events: [],
    } as any);

    const payload = {
      recipientEmail: 'recruiting@stripe.com',
      subject: 'Application',
      emailBody: 'Dear Stripe Team...',
      confirmations: {
        reviewedRecipient: false, // NOT confirmed!
        reviewedEmail: true,
        reviewedAttachment: true,
        confirmSend: true,
      },
    };

    await expect(
      sendApplication(mockAppId, mockUserId, payload as any)
    ).rejects.toThrow('Explicit user confirmation required');

    expect(gmailService.sendGmailEmail).not.toHaveBeenCalled();
  });

  it('DUPLICATE PROTECTION: MUST block sending an application that has already been SENT', async () => {
    // Mock application already in SENT state
    vi.spyOn(prisma.jobApplication, 'findUnique').mockResolvedValue({
      id: mockAppId,
      userId: mockUserId,
      companyName: 'Stripe',
      jobTitle: 'Senior Software Engineer',
      status: 'SENT', // Already sent!
      recipientEmail: 'recruiting@stripe.com',
      subject: 'Application',
      emailBody: 'Dear Stripe Team...',
      sentAt: new Date('2026-09-01T10:00:00Z'),
      providerMessageId: 'gmail_msg_existing_456',
      resumeId: null,
      resume: null,
      emails: [],
      events: [],
    } as any);

    const validPayload = {
      recipientEmail: 'recruiting@stripe.com',
      subject: 'Application',
      emailBody: 'Dear Stripe Team...',
      confirmations: {
        reviewedRecipient: true,
        reviewedEmail: true,
        reviewedAttachment: true,
        confirmSend: true,
      },
    };

    await expect(
      sendApplication(mockAppId, mockUserId, validPayload)
    ).rejects.toThrow('This application has already been sent! Duplicate sending is blocked for safety.');

    // Gmail send function MUST NEVER have been called!
    expect(gmailService.sendGmailEmail).not.toHaveBeenCalled();
  });

  it('DISPATCHES EMAIL and updates state atomically when all rules and confirmations are satisfied', async () => {
    vi.spyOn(prisma.jobApplication, 'findUnique').mockResolvedValue({
      id: mockAppId,
      userId: mockUserId,
      companyName: 'Stripe',
      jobTitle: 'Senior Software Engineer',
      status: 'REVIEWED',
      recipientEmail: 'recruiting@stripe.com',
      subject: 'Application',
      emailBody: 'Dear Stripe Team, this is a complete application.',
      sentAt: null,
      providerMessageId: null,
      resumeId: null,
      resume: null,
      emails: [],
      events: [],
    } as any);

    vi.spyOn(prisma, '$transaction').mockResolvedValue([
      { id: mockAppId, status: 'SENT', providerMessageId: 'mock_message_id_123' },
      { id: 'email-1', toEmail: 'recruiting@stripe.com' },
      { id: 'event-1', eventType: 'EMAIL_SENT' },
    ] as any);

    const validConfirmedPayload = {
      recipientEmail: 'recruiting@stripe.com',
      subject: 'Application - Senior Software Engineer',
      emailBody: 'Dear Stripe Team, this is a complete application.',
      confirmations: {
        reviewedRecipient: true,
        reviewedEmail: true,
        reviewedAttachment: true,
        confirmSend: true,
      },
    };

    const result = await sendApplication(mockAppId, mockUserId, validConfirmedPayload);

    expect(result.success).toBe(true);
    expect(gmailService.sendGmailEmail).toHaveBeenCalledTimes(1);
    expect(result.messageId).toBe('mock_message_id_123');
  });
});
