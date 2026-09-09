import { NextRequest, NextResponse } from 'next/server';
import { verifyUrlReachability } from '@/services/facebook/facebookUrlFetcher.service';
import { formatErrorResponse } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    const verification = await verifyUrlReachability(url);

    return NextResponse.json({
      success: true,
      data: verification,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
