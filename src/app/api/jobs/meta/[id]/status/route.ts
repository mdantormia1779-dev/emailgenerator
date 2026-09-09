import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatErrorResponse } from '@/lib/errors';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    const { id } = await params;
    const body = await req.json();

    const { status } = body;
    const validStatuses = [
      'DISCOVERED',
      'MATCHED',
      'EMAIL_GENERATED',
      'REVIEW_REQUIRED',
      'APPROVED',
      'SENT',
      'REJECTED',
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const opportunity = await prisma.jobOpportunity.findFirst({
      where: { id, userId },
    });

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: 'Job opportunity not found.' },
        { status: 404 }
      );
    }

    const updated = await prisma.jobOpportunity.update({
      where: { id },
      data: { status },
    });

    // Mirror update if postHash exists
    if (opportunity.postHash) {
      try {
        await prisma.facebookPost.update({
          where: { postHash: opportunity.postHash },
          data: { status },
        });
      } catch {
        // Non-critical mirror
      }
    }

    return NextResponse.json({
      success: true,
      status: updated.status,
      opportunity: updated,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
