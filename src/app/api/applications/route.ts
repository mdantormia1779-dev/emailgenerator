import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getApplications, logApplicationEvent } from '@/services/application.service';
import { createApplicationSchema } from '@/lib/validation/application.schema';
import { formatErrorResponse } from '@/lib/errors';
import { ApplicationStatus } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as ApplicationStatus | undefined;
    const search = searchParams.get('search') || undefined;

    const applications = await getApplications(userId, { status, search });
    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();
    const validated = createApplicationSchema.parse(body);

    const application = await prisma.jobApplication.create({
      data: {
        userId,
        companyName: validated.companyName,
        jobTitle: validated.jobTitle,
        jobUrl: validated.jobUrl || null,
        jobDescription: validated.jobDescription,
        workType: validated.workType || null,
        location: validated.location || null,
        recipientEmail: validated.recipientEmail || null,
        subject: validated.subject || null,
        emailBody: validated.emailBody || null,
        resumeId: validated.resumeId || null,
        status: validated.status || 'DRAFT',
        matchScore: validated.matchScore || null,
        matchBreakdown: validated.matchBreakdown || undefined,
        notes: validated.notes || null,
      },
      include: {
        resume: true,
      },
    });

    await logApplicationEvent({
      applicationId: application.id,
      eventType: 'STATUS_CHANGED',
      description: `Application created with status ${application.status}`,
      metadata: { initialStatus: application.status },
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
