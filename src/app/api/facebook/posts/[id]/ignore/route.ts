import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatErrorResponse, AppError } from '@/lib/errors';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();

    const post = await prisma.facebookPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new AppError('Scanned post not found.', 404);
    }

    if (post.userId !== userId) {
      throw new AppError('Unauthorized access to this post.', 403);
    }

    const updated = await prisma.facebookPost.update({
      where: { id },
      data: {
        isIgnored: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Post marked as ignored.',
      data: updated,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
