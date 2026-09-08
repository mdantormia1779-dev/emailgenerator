import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { getUserProfile } from '@/services/profile.service';
import { calculateJobMatch } from '@/services/match.service';
import { jobMatchInputSchema } from '@/lib/validation/job.schema';
import { formatErrorResponse, AppError } from '@/lib/errors';
import { JobAnalysisResult, UserProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();
    const { jobAnalysis } = jobMatchInputSchema.parse(body);

    const profileData = await getUserProfile(userId);
    if (!profileData) {
      throw new AppError('User profile not found. Please complete your profile first.', 404);
    }

    // Format profile for matching
    const profile: UserProfile = {
      fullName: profileData.fullName,
      title: profileData.title,
      yearsOfExperience: profileData.yearsOfExperience,
      summary: profileData.summary,
      skills: profileData.skills,
      projects: profileData.projects || [],
      experiences: profileData.experiences || [],
      education: profileData.education || [],
    };

    const matchBreakdown = calculateJobMatch(profile, jobAnalysis as JobAnalysisResult);

    return NextResponse.json({
      success: true,
      data: matchBreakdown,
    });
  } catch (error) {
    const err = formatErrorResponse(error);
    return NextResponse.json(err, { status: err.statusCode });
  }
}
