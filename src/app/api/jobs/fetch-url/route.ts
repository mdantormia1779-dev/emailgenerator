import { NextRequest, NextResponse } from 'next/server';
import { fetchAndParseJobUrl } from '@/services/facebook/facebookUrlFetcher.service';
import { formatErrorResponse } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { success: false, error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    const fetched = await fetchAndParseJobUrl(url.trim());

    return NextResponse.json({
      success: true,
      data: fetched,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
