import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { sendApplication } from '@/services/application.service';
import { sendApplicationSchema } from '@/lib/validation/send.schema';
import { formatErrorResponse } from '@/lib/errors';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();

    // 1. Parse & validate body with Zod
    const body = await req.json();
    const validatedPayload = sendApplicationSchema.parse(body);

    // 2. Delegate to application service for pre-send verification & atomic dispatch
    const result = await sendApplication(id, userId, validatedPayload);

    return NextResponse.json({
      success: true,
      message: 'Application email sent successfully via Gmail.',
      data: result,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
