import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { normalizeJobData, JobStatus } from '@/services/jobDiscovery.service';
import { formatErrorResponse } from '@/lib/errors';

export async function GET() {
  try {
    const userId = await getSessionUserId();

    const matches = await prisma.facebookPost.findMany({
      where: {
        userId,
        isIgnored: false,
        matchScore: { gte: 60 },
      },
      orderBy: [
        { matchScore: 'desc' },
        { scannedAt: 'desc' },
      ],
      take: 50,
    });

    const normalizedMatches = matches.map(post =>
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
        status: (post.status as JobStatus) || 'MATCHED',
      })
    );

    return NextResponse.json({
      success: true,
      count: normalizedMatches.length,
      data: normalizedMatches,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
