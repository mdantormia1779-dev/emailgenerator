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
    const { status } = await req.json();

    const validStatuses = [
      'DISCOVERED',
      'MATCHED',
      'EMAIL_GENERATED',
      'REVIEW_REQUIRED',
      'APPROVED',
      'SENT',
      'REJECTED',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const post = await prisma.facebookPost.findFirst({
      where: { id, userId },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Job record not found.' },
        { status: 404 }
      );
    }

    const updated = await prisma.facebookPost.update({
      where: { id },
      data: {
        status,
        isIgnored: status === 'REJECTED',
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
