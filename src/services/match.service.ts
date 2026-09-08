import { JobAnalysisResult, MatchBreakdown, UserProfile } from '@/types';

/**
 * Deterministic Matching Engine
 * Compares Job Requirements against User Profile:
 * - Technical Skills: 50%
 * - Experience: 20%
 * - Projects: 20%
 * - Other Fit (Work type, location, title alignment): 10%
 *
 * CRITICAL RULE: AI and engine must NEVER invent skills or claim missing skills.
 */
export function calculateJobMatch(
  profile: UserProfile,
  jobAnalysis: JobAnalysisResult
): MatchBreakdown {
  const profileSkillsLower = (profile.skills || []).map(s => s.toLowerCase().trim());
  const requiredSkills = jobAnalysis.requiredSkills || [];
  const preferredSkills = jobAnalysis.preferredSkills || [];

  // 1. Technical Skills Match (50% Weight)
  const strongMatches: string[] = [];
  const missingSkills: string[] = [];

  const allJobSkills = [...requiredSkills, ...preferredSkills];
  const uniqueJobSkills = Array.from(new Set(allJobSkills.map(s => s.toLowerCase().trim())));

  if (uniqueJobSkills.length === 0) {
    // If no specific skills listed, default to profile base match
    strongMatches.push(...(profile.skills || []).slice(0, 5));
  } else {
    for (const jobSkill of uniqueJobSkills) {
      const isMatched = profileSkillsLower.some(ps => {
        return (
          ps === jobSkill ||
          ps.includes(jobSkill) ||
          jobSkill.includes(ps) ||
          normalizeTechName(ps) === normalizeTechName(jobSkill)
        );
      });

      // Find original casing
      const originalName = allJobSkills.find(s => s.toLowerCase().trim() === jobSkill) || jobSkill;

      if (isMatched) {
        strongMatches.push(originalName);
      } else {
        missingSkills.push(originalName);
      }
    }
  }

  // Weight required skills more heavily than preferred
  let skillScore = 70; // baseline
  if (uniqueJobSkills.length > 0) {
    const requiredLower = requiredSkills.map(s => s.toLowerCase().trim());
    let reqMatches = 0;
    for (const r of requiredLower) {
      if (profileSkillsLower.some(ps => ps.includes(r) || r.includes(ps))) {
        reqMatches++;
      }
    }
    const reqRatio = requiredLower.length > 0 ? reqMatches / requiredLower.length : 1;
    const allRatio = strongMatches.length / uniqueJobSkills.length;
    skillScore = Math.round((reqRatio * 0.7 + allRatio * 0.3) * 100);
  }

  // 2. Experience Match (20% Weight)
  let expScore = 80;
  const userExpYears = profile.yearsOfExperience || 0;
  const jobExpStr = (jobAnalysis.experienceRequirement || '').toLowerCase();

  // Extract years from string e.g. "3+ years", "5-7 years"
  const expMatch = jobExpStr.match(/(\d+)\s*\+?\s*(?:year|yr)/i);
  if (expMatch) {
    const requiredYears = parseInt(expMatch[1], 10);
    if (userExpYears >= requiredYears) {
      expScore = 100;
    } else if (userExpYears >= requiredYears - 1) {
      expScore = 85;
    } else if (userExpYears >= requiredYears - 2) {
      expScore = 65;
    } else {
      expScore = Math.max(30, Math.round((userExpYears / requiredYears) * 70));
    }
  } else {
    // General experience heuristic
    expScore = userExpYears >= 3 ? 95 : userExpYears >= 1 ? 80 : 65;
  }

  // 3. Projects Match (20% Weight)
  const relevantProjects: Array<{ title: string; matchedSkills: string[] }> = [];
  const userProjects = profile.projects || [];

  for (const proj of userProjects) {
    const projTechLower = (proj.techStack || []).map(t => t.toLowerCase().trim());
    const matched = strongMatches.filter(sm =>
      projTechLower.some(pt => pt.includes(sm.toLowerCase()) || sm.toLowerCase().includes(pt))
    );

    if (matched.length > 0) {
      relevantProjects.push({
        title: proj.title,
        matchedSkills: matched,
      });
    }
  }

  let projectScore = 50;
  if (userProjects.length > 0) {
    projectScore = relevantProjects.length >= 2 ? 100 : relevantProjects.length === 1 ? 85 : 65;
  }

  // 4. Other Requirements / Fit Match (10% Weight)
  let otherScore = 85;
  const userTitleLower = (profile.title || '').toLowerCase();
  const jobTitleLower = (jobAnalysis.jobTitle || '').toLowerCase();

  if (
    userTitleLower &&
    jobTitleLower &&
    (userTitleLower.includes(jobTitleLower) || jobTitleLower.includes(userTitleLower))
  ) {
    otherScore += 15;
  }
  otherScore = Math.min(100, otherScore);

  // Overall Score = 50% Tech + 20% Exp + 20% Project + 10% Other
  const overallScore = Math.min(
    100,
    Math.round(
      skillScore * 0.5 +
        expScore * 0.2 +
        projectScore * 0.2 +
        otherScore * 0.1
    )
  );

  // Build human-readable factual explanation
  const explanation = `Your profile shows a ${overallScore}% overall match for ${jobAnalysis.jobTitle} at ${jobAnalysis.companyName}. You possess ${strongMatches.length} matching skills (${strongMatches.slice(0, 4).join(', ')}${strongMatches.length > 4 ? ', ...' : ''}) and have ${userExpYears} years of documented experience. ${
    missingSkills.length > 0
      ? `Skills required or preferred by the job that are not in your profile: ${missingSkills.slice(0, 5).join(', ')}.`
      : 'You cover all specified core skills.'
  }`;

  return {
    overallScore,
    technicalSkillScore: skillScore,
    experienceScore: expScore,
    projectScore: projectScore,
    otherScore: otherScore,
    strongMatches,
    missingSkills,
    relevantProjects,
    explanation,
  };
}

function normalizeTechName(tech: string): string {
  return tech
    .replace(/\.js$/i, '')
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}
