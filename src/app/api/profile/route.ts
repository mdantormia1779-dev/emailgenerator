import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { getUserProfile, upsertUserProfile } from '@/services/profile.service';
import { profileSchema } from '@/lib/validation/profile.schema';
import { formatErrorResponse } from '@/lib/errors';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const profile = await getUserProfile(userId);
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();
    const validatedData = profileSchema.parse(body);
    const updated = await upsertUserProfile(userId, validatedData);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
