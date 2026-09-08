import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { disconnectGmail } from '@/services/gmail.service';
import { formatErrorResponse } from '@/lib/errors';

export async function POST() {
  try {
    const userId = await getSessionUserId();
    await disconnectGmail(userId);
    return NextResponse.json({ success: true, message: 'Gmail disconnected successfully' });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
