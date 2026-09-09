import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getUserProfile } from '@/services/profile.service';
import { generateApplicationEmail } from '@/services/ai.service';
import { logApplicationEvent } from '@/services/application.service';
import { formatErrorResponse } from '@/lib/errors';
import { UserProfile } from '@/types';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    const { id } = await params;

    const post = await prisma.facebookPost.findFirst({
      where: { id, userId },
      include: { application: true },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Job record not found.' },
        { status: 404 }
      );
    }

    // If application draft already exists, return existing id
    if (post.applicationId && post.application) {
      return NextResponse.json({
        success: true,
        message: 'Application draft already exists for this job.',
        applicationId: post.applicationId,
      });
    }

    const profileData = await getUserProfile(userId);
    if (!profileData) {
      return NextResponse.json(
        { success: false, error: 'Profile not found. Please complete your profile before generating emails.' },
        { status: 400 }
      );
    }

    const profile: UserProfile = {
      fullName: profileData.fullName,
      title: profileData.title,
      yearsOfExperience: profileData.yearsOfExperience,
      summary: profileData.summary,
      skills: profileData.skills,
      projects: profileData.projects || [],
      experiences: profileData.experiences || [],
      education: profileData.education || [],
      portfolio: profileData.portfolio,
      phone: profileData.phone,
    };

    // Synthesize personalized application email adhering to zero-hallucination policy
    const companyName = post.extractedCompany || 'Hiring Team';
    const jobTitle = post.extractedTitle || 'Software Engineer';

    const emailDraft = await generateApplicationEmail(profile, {
      companyName,
      jobTitle,
      requiredSkills: post.extractedSkills,
      preferredSkills: [],
      jobDescription: post.rawContent,
    });

    const fullEmailBody = `${emailDraft.greeting}\n\n${emailDraft.body}\n\n${emailDraft.closing}\n${emailDraft.signature}`;

    // STRICTLY CREATE IN DRAFT STATE - NEVER AUTONOMOUSLY SENT
    const application = await prisma.jobApplication.create({
      data: {
        userId,
        companyName,
        jobTitle,
        jobUrl: post.postUrl || null,
        jobDescription: post.rawContent,
        workType: post.location === 'Remote' ? 'Remote' : 'Onsite',
        location: post.location || null,
        recipientEmail: post.extractedEmail,
        subject: emailDraft.subject,
        emailBody: fullEmailBody,
        status: 'DRAFT', // STRICT INVARIANT: DRAFT ONLY
        matchScore: post.matchScore,
        notes: `Discovered from Meta/Facebook.\nMatch Reason: ${post.matchReason || 'Target skill match'}`,
      },
    });

    // Update FacebookPost with linked application and status
    await prisma.facebookPost.update({
      where: { id },
      data: {
        applicationId: application.id,
        status: 'EMAIL_GENERATED',
      },
    });

    // Log event
    await logApplicationEvent({
      applicationId: application.id,
      eventType: 'DRAFT_GENERATED_FROM_FACEBOOK',
      description: `Draft application generated for Facebook job (${jobTitle} at ${companyName})`,
      metadata: {
        facebookPostId: post.id,
        postUrl: post.postUrl,
        matchScore: post.matchScore,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Application email draft generated successfully. Ready for manual review.',
      applicationId: application.id,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
