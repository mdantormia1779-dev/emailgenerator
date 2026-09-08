import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getApplicationById, logApplicationEvent } from '@/services/application.service';
import { updateApplicationSchema } from '@/lib/validation/application.schema';
import { formatErrorResponse } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const application = await getApplicationById(id, userId);

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const app = await getApplicationById(id, userId);
    const body = await req.json();
    const validated = updateApplicationSchema.parse(body);

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: {
        companyName: validated.companyName,
        jobTitle: validated.jobTitle,
        recipientEmail: validated.recipientEmail,
        subject: validated.subject,
        emailBody: validated.emailBody,
        resumeId: validated.resumeId,
        status: validated.status,
        matchScore: validated.matchScore,
        notes: validated.notes,
        updatedAt: new Date(),
      },
      include: {
        resume: true,
        emails: true,
        events: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (validated.status && validated.status !== app.status) {
      await logApplicationEvent({
        applicationId: id,
        eventType: 'STATUS_CHANGED',
        description: `Status changed from ${app.status} to ${validated.status}`,
        metadata: { oldStatus: app.status, newStatus: validated.status },
      });
    }

    if (validated.notes && validated.notes !== app.notes) {
      await logApplicationEvent({
        applicationId: id,
        eventType: 'NOTE_ADDED',
        description: 'Application notes updated',
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    await getApplicationById(id, userId);

    await prisma.jobApplication.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
