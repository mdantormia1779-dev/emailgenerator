import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { syncJobs } from '@/server/services/meta-job-scanner.service';
import { formatErrorResponse } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const result = await syncJobs(userId, {
      pageId: body.pageId,
      customKeywords: body.keywords,
      customLocations: body.locations,
      maxPagesPerKeyword: body.maxPages,
      mockJobsForTesting: body.mockJobs,
    });

    return NextResponse.json({
      success: true,
      searched: result.searched,
      fetched: result.fetched,
      newJobs: result.newJobs,
      duplicates: result.duplicates,
      matched: result.matched,
      jobs: result.jobs,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
