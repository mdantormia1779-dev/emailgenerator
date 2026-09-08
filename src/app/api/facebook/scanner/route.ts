import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getScannerStats } from '@/services/facebook/facebookScanner.service';
import { formatErrorResponse } from '@/lib/errors';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const stats = await getScannerStats(userId);

    const posts = await prisma.facebookPost.findMany({
      where: { userId },
      include: {
        application: {
          select: {
            id: true,
            status: true,
            subject: true,
            recipientEmail: true,
            createdAt: true,
          },
        },
      },
      orderBy: { scannedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: {
        stats,
        posts,
      },
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
