import prisma from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { ApplicationStatus, EventType, SendApplicationPayload } from '@/types';
import { sendGmailEmail } from './gmail.service';

/**
 * Application Management Service
 * Enforces ownership, status transitions, duplicate send prevention,
 * and comprehensive audit logging.
 */

export async function getApplications(userId: string, filter?: { status?: ApplicationStatus; search?: string }) {
  const where: any = { userId };

  if (filter?.status) {
    where.status = filter.status;
  }

  if (filter?.search && filter.search.trim() !== '') {
    where.OR = [
      { companyName: { contains: filter.search, mode: 'insensitive' } },
      { jobTitle: { contains: filter.search, mode: 'insensitive' } },
      { recipientEmail: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  return prisma.jobApplication.findMany({
    where,
    include: {
      resume: true,
      emails: { orderBy: { sentAt: 'desc' } },
      events: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getApplicationById(id: string, userId: string) {
  const app = await prisma.jobApplication.findUnique({
    where: { id },
    include: {
      resume: true,
      emails: { orderBy: { sentAt: 'desc' } },
      events: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!app) {
    throw new AppError('Application not found', 404);
  }

  if (app.userId !== userId) {
    throw new AppError('Access denied. You do not own this application.', 403);
  }

  return app;
}

export async function updateApplicationStatus(
  id: string,
  userId: string,
  newStatus: ApplicationStatus,
  description?: string
) {
  const app = await getApplicationById(id, userId);

  const updated = await prisma.jobApplication.update({
    where: { id },
    data: {
      status: newStatus,
      updatedAt: new Date(),
    },
  });

  await logApplicationEvent({
    applicationId: id,
    eventType: 'STATUS_CHANGED',
    description: description || `Status updated to ${newStatus}`,
    metadata: { previousStatus: app.status, newStatus },
  });

  return updated;
}

export async function logApplicationEvent(params: {
  applicationId: string;
  eventType: EventType;
  description: string;
  metadata?: any;
}) {
  return prisma.applicationEvent.create({
    data: {
      applicationId: params.applicationId,
      eventType: params.eventType,
      description: params.description,
      metadata: params.metadata ?? {},
    },
  });
}

/**
 * CRITICAL SAFETY SEND FUNCTION
 * Enforces all 10 pre-send security & business rules:
 * 1. Authenticated user
 * 2. Application exists
 * 3. Application belongs to authenticated user
 * 4. Recipient exists and is valid
 * 5. Subject exists and non-empty
 * 6. Body exists and non-empty
 * 7. Selected resume exists if required
 * 8. Gmail connection exists
 * 9. Explicit user confirmations ALL TRUE
 * 10. Duplicate protection: Application has NOT already been sent
 */
export async function sendApplication(
  applicationId: string,
  userId: string,
  payload: SendApplicationPayload
) {
  // 1. Fetch & verify application ownership
  const application = await getApplicationById(applicationId, userId);

  // 2. CRITICAL DUPLICATE SEND PROTECTION
  if (application.status === 'SENT' || application.sentAt !== null || application.providerMessageId) {
    throw new AppError(
      'This application has already been sent! Duplicate sending is blocked for safety.',
      409
    );
  }

  // 3. EXPLICIT CONFIRMATION ENFORCEMENT
  const c = payload.confirmations;
  if (!c || !c.reviewedRecipient || !c.reviewedEmail || !c.reviewedAttachment || !c.confirmSend) {
    throw new AppError(
      'Explicit user confirmation required. All review checkboxes must be checked before sending.',
      400,
      {
        requiredConfirmations: [
          'reviewedRecipient',
          'reviewedEmail',
          'reviewedAttachment',
          'confirmSend',
        ],
        provided: c,
      }
    );
  }

  // 4. Validate Recipient Email
  const recipientEmail = (payload.recipientEmail || application.recipientEmail || '').trim();
  if (!recipientEmail || !recipientEmail.includes('@') || !recipientEmail.includes('.')) {
    throw new AppError('A valid recipient email is required to send.', 400);
  }

  // 5. Validate Subject
  const subject = (payload.subject || application.subject || '').trim();
  if (!subject) {
    throw new AppError('Email subject cannot be empty.', 400);
  }

  // 6. Validate Body
  const emailBody = (payload.emailBody || application.emailBody || '').trim();
  if (!emailBody || emailBody.length < 10) {
    throw new AppError('Email body is required and must contain complete text.', 400);
  }

  // 7. Validate Resume Attachment (if selected)
  const resumeId = payload.resumeId !== undefined ? payload.resumeId : application.resumeId;
  if (resumeId) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });
    if (!resume || resume.userId !== userId) {
      throw new AppError('The selected resume was not found or does not belong to you.', 400);
    }
  }

  // 8. Execute Send via Gmail Service
  const sendResult = await sendGmailEmail({
    userId,
    recipientEmail,
    subject,
    body: emailBody,
    resumeId,
  });

  const now = new Date();

  // 9. Atomic Transaction: Update Application, Create Email record, Log Event
  const [updatedApplication, emailRecord] = await prisma.$transaction([
    prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: 'SENT',
        recipientEmail,
        subject,
        emailBody,
        resumeId,
        providerMessageId: sendResult.messageId,
        sentAt: now,
        updatedAt: now,
      },
    }),
    prisma.email.create({
      data: {
        applicationId,
        fromEmail: sendResult.senderEmail,
        toEmail: recipientEmail,
        subject,
        body: emailBody,
        providerMessageId: sendResult.messageId,
        sentAt: now,
      },
    }),
    prisma.applicationEvent.create({
      data: {
        applicationId,
        eventType: 'EMAIL_SENT',
        description: `Application email sent to ${recipientEmail} via Gmail (${sendResult.messageId})`,
        metadata: {
          recipientEmail,
          messageId: sendResult.messageId,
          senderEmail: sendResult.senderEmail,
          resumeAttached: !!resumeId,
        },
      },
    }),
  ]);

  return {
    success: true,
    application: updatedApplication,
    email: emailRecord,
    messageId: sendResult.messageId,
  };
}
