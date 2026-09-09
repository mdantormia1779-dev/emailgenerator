import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { disconnectMetaAccount } from '@/services/meta.service';
import { formatErrorResponse } from '@/lib/errors';

export async function POST() {
  try {
    const userId = await getSessionUserId();
    const disconnected = await disconnectMetaAccount(userId);

    return NextResponse.json({
      success: true,
      message: disconnected
        ? 'Meta account successfully disconnected.'
        : 'No connected Meta account found.',
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
