import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatErrorResponse } from '@/lib/errors';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const account = await prisma.gmailAccount.findUnique({
      where: { userId },
      select: {
        email: true,
        isConnected: true,
        connectedAt: true,
        tokenExpiry: true,
      },
    });

    const isDemo = process.env.DEMO_MODE === 'true';

    return NextResponse.json({
      success: true,
      data: account
        ? {
            isConnected: account.isConnected,
            email: account.email,
            connectedAt: account.connectedAt,
            isExpired: account.tokenExpiry ? new Date() > account.tokenExpiry : false,
            isDemo: false,
          }
        : {
            isConnected: isDemo,
            email: isDemo ? 'demo.applicant@gmail.com (Simulation Mode)' : null,
            connectedAt: isDemo ? new Date() : null,
            isExpired: false,
            isDemo,
          },
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
