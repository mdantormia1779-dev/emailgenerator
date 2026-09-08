import { NextResponse } from 'next/server';
import { getGmailAuthUrl } from '@/services/gmail.service';
import { formatErrorResponse } from '@/lib/errors';

export async function GET() {
  try {
    const authUrl = getGmailAuthUrl();
    return NextResponse.json({ success: true, authUrl });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
