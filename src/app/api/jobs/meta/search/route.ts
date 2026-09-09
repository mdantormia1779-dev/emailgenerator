import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatErrorResponse } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const { searchParams } = new URL(req.url);

    const keyword = searchParams.get('keyword');
    const location = searchParams.get('location');
    const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!, 10) : undefined;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20', 10));
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
        { company: { contains: keyword, mode: 'insensitive' } },
        { skills: { has: keyword } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (minScore !== undefined && !isNaN(minScore)) {
      where.matchScore = { gte: minScore };
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [total, opportunities] = await Promise.all([
      prisma.jobOpportunity.count({ where }),
      prisma.jobOpportunity.findMany({
        where,
        orderBy: [{ matchScore: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          application: {
            select: { id: true, status: true, recipientEmail: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      opportunities,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
