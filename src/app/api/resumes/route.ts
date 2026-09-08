import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { saveResumeFile } from '@/services/storage.service';
import { formatErrorResponse, AppError } from '@/lib/errors';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { uploadedAt: 'desc' }],
    });
    return NextResponse.json({ success: true, data: resumes });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const isDefault = formData.get('isDefault') === 'true';

    if (!file) {
      throw new AppError('No file provided in upload request', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await saveResumeFile(buffer, file.name, file.type);

    // If marked as default, unset existing default resumes
    if (isDefault) {
      await prisma.resume.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const resumeRecord = await prisma.resume.create({
      data: {
        userId,
        fileName: saved.fileName,
        originalName: saved.originalName,
        mimeType: saved.mimeType,
        fileSize: saved.fileSize,
        filePath: saved.filePath,
        isDefault,
      },
    });

    return NextResponse.json({ success: true, data: resumeRecord }, { status: 201 });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
