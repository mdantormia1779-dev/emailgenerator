import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { getUserProfile } from '@/services/profile.service';
import { generateApplicationEmail } from '@/services/ai.service';
import { emailGenerationInputSchema } from '@/lib/validation/job.schema';
import { formatErrorResponse, AppError } from '@/lib/errors';
import { UserProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();
    const input = emailGenerationInputSchema.parse(body);

    const profileData = await getUserProfile(userId);
    if (!profileData) {
      throw new AppError('User profile not found. Please complete your profile first.', 404);
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
      github: profileData.github,
      linkedin: profileData.linkedin,
      phone: profileData.phone,
      location: profileData.location,
    };

    const generatedEmail = await generateApplicationEmail(profile, {
      companyName: input.companyName,
      jobTitle: input.jobTitle,
      requiredSkills: input.requiredSkills,
      preferredSkills: input.preferredSkills,
      jobDescription: input.jobDescription,
      customInstructions: input.customInstructions,
    });

    return NextResponse.json({
      success: true,
      data: generatedEmail,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
