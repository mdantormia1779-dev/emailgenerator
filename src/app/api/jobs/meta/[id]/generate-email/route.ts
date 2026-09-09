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

    const opportunity = await prisma.jobOpportunity.findFirst({
      where: { id, userId },
      include: { application: true },
    });

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: 'Job opportunity not found.' },
        { status: 404 }
      );
    }

    // If application draft already exists, return existing id
    if (opportunity.applicationId && opportunity.application) {
      return NextResponse.json({
        success: true,
        message: 'Application draft already exists for this job.',
        applicationId: opportunity.applicationId,
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

    const companyName = opportunity.company || 'Hiring Team';
    const jobTitle = opportunity.title || 'Software Developer';

    const emailDraft = await generateApplicationEmail(profile, {
      companyName,
      jobTitle,
      requiredSkills: opportunity.skills,
      preferredSkills: [],
      jobDescription: opportunity.description,
    });

    const fullEmailBody = `${emailDraft.greeting}\n\n${emailDraft.body}\n\n${emailDraft.closing}\n${emailDraft.signature}`;

    // STRICT INVARIANT: CREATED AS DRAFT ONLY - NEVER AUTONOMOUSLY SENT
    const application = await prisma.jobApplication.create({
      data: {
        userId,
        companyName,
        jobTitle,
        jobUrl: opportunity.postUrl || null,
        jobDescription: opportunity.description,
        workType: opportunity.location === 'Remote' ? 'Remote' : 'Onsite',
        location: opportunity.location || null,
        recipientEmail: opportunity.contactEmail,
        subject: emailDraft.subject,
        emailBody: fullEmailBody,
        status: 'DRAFT', // STRICTLY DRAFT
        matchScore: opportunity.matchScore,
        notes: `Discovered from Meta Job Discovery.\nMatch Reason: ${opportunity.matchReason || 'Target skill match'}`,
      },
    });

    // Link application and update status to EMAIL_GENERATED
    await prisma.jobOpportunity.update({
      where: { id },
      data: {
        applicationId: application.id,
        status: 'EMAIL_GENERATED',
      },
    });

    // Also update FacebookPost if mirrored
    if (opportunity.postHash) {
      try {
        await prisma.facebookPost.update({
          where: { postHash: opportunity.postHash },
          data: {
            applicationId: application.id,
            status: 'EMAIL_GENERATED',
          },
        });
      } catch {
        // Non-critical mirror update
      }
    }

    await logApplicationEvent({
      applicationId: application.id,
      eventType: 'DRAFT_GENERATED_FROM_FACEBOOK',
      description: `Draft application generated for Meta job (${jobTitle} at ${companyName})`,
      metadata: {
        jobOpportunityId: opportunity.id,
        postUrl: opportunity.postUrl,
        matchScore: opportunity.matchScore,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Application email draft generated successfully. Ready for review.',
      applicationId: application.id,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
