import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { normalizeJobData, JobStatus } from '@/services/jobDiscovery.service';
import { formatErrorResponse } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const url = new URL(req.url);

    const query = url.searchParams.get('query')?.trim() || '';
    const skillParam = url.searchParams.get('skills')?.trim() || '';
    const minScore = parseInt(url.searchParams.get('minScore') || '0', 10);
    const status = url.searchParams.get('status')?.trim() || '';
    const location = url.searchParams.get('location')?.trim() || '';

    const where: any = { userId };

    if (query) {
      where.OR = [
        { extractedTitle: { contains: query, mode: 'insensitive' } },
        { extractedCompany: { contains: query, mode: 'insensitive' } },
        { rawContent: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (minScore > 0) {
      where.matchScore = { gte: minScore };
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (location && location !== 'ALL') {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (skillParam) {
      const skills = skillParam.split(',').map(s => s.trim()).filter(Boolean);
      if (skills.length > 0) {
        where.extractedSkills = { hasSome: skills };
      }
    }

    const posts = await prisma.facebookPost.findMany({
      where,
      orderBy: [
        { matchScore: 'desc' },
        { scannedAt: 'desc' },
      ],
      take: 100,
    });

    const normalizedJobs = posts.map(post =>
      normalizeJobData({
        id: post.id,
        sourcePostId: post.sourcePostId || undefined,
        content: post.rawContent,
        title: post.extractedTitle || undefined,
        company: post.extractedCompany || undefined,
        postUrl: post.postUrl || undefined,
        location: post.location || undefined,
        employmentType: post.employmentType || undefined,
        salary: post.salary || undefined,
        postedAt: post.postedAt || undefined,
        discoveredAt: post.discoveredAt,
        recipientEmail: post.extractedEmail,
        skills: post.extractedSkills,
        requirements: post.requirements,
        matchScore: post.matchScore || 0,
        matchReason: post.matchReason || undefined,
        status: (post.status as JobStatus) || 'DISCOVERED',
      })
    );

    return NextResponse.json({
      success: true,
      count: normalizedJobs.length,
      data: normalizedJobs,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
