import { NextRequest, NextResponse } from 'next/server';
import { jobAnalysisInputSchema } from '@/lib/validation/job.schema';
import { analyzeJobDescription } from '@/services/ai.service';
import { formatErrorResponse } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobDescription } = jobAnalysisInputSchema.parse(body);

    const result = await analyzeJobDescription(jobDescription);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
