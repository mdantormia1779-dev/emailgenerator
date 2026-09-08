import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { deleteResumeFile } from '@/services/storage.service';
import { formatErrorResponse, AppError } from '@/lib/errors';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();

    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    if (resume.userId !== userId) {
      throw new AppError('Unauthorized access to resume', 403);
    }

    // Delete file from disk
    await deleteResumeFile(resume.filePath);

    // Delete database record
    await prisma.resume.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
