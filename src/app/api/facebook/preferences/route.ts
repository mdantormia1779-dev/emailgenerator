import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { getScannerPreferences, upsertScannerPreferences } from '@/services/facebook/facebookScanner.service';
import { scannerPreferenceSchema } from '@/services/facebook/facebook.schemas';
import { formatErrorResponse } from '@/lib/errors';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const prefs = await getScannerPreferences(userId);
    return NextResponse.json({ success: true, data: prefs });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();
    const validated = scannerPreferenceSchema.parse(body);

    const updated = await upsertScannerPreferences(userId, validated);
    return NextResponse.json({
      success: true,
      message: 'Scanner matching preferences updated successfully.',
      data: updated,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
