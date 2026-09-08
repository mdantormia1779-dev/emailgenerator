import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatErrorResponse } from '@/lib/errors';

export async function GET() {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json({
        success: true,
        user: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            title: true,
            fullName: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        user: null,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        title: user.profile?.title || 'Developer',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
