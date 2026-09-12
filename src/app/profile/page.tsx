'use client';

import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProfileBasicInfo } from '@/components/profile/ProfileBasicInfo';
import { ProfileSocialLinks } from '@/components/profile/ProfileSocialLinks';
import { ProfileSkills } from '@/components/profile/ProfileSkills';
import { ProfileExperienceSection } from '@/components/profile/ProfileExperienceSection';
import { ProfileProjectsSection } from '@/components/profile/ProfileProjectsSection';
import { useProfileWorkflow } from '@/hooks/useProfileWorkflow';

export default function ProfilePage() {
  const pw = useProfileWorkflow();

  if (pw.loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={pw.handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Factual User Profile</h1>
          <p className="text-slate-500 text-xs mt-0.5 max-w-2xl">
            This profile is your single source of truth. The AI assistant strictly derives skills, projects, and experiences from here.
          </p>
        </div>
        <Button type="submit" isLoading={pw.isSaving} leftIcon={<Save className="w-4 h-4" />}>
          Save Profile
        </Button>
      </div>

      {pw.feedback && <Alert type={pw.feedback.type} message={pw.feedback.message} onClose={() => pw.setFeedback(null)} />}

      <ProfileBasicInfo fullName={pw.fullName} setFullName={pw.setFullName} title={pw.title} setTitle={pw.setTitle} yearsOfExperience={pw.yearsOfExperience} setYearsOfExperience={pw.setYearsOfExperience} summary={pw.summary} setSummary={pw.setSummary} />
      <ProfileSocialLinks location={pw.location} setLocation={pw.setLocation} phone={pw.phone} setPhone={pw.setPhone} portfolio={pw.portfolio} setPortfolio={pw.setPortfolio} github={pw.github} setGithub={pw.setGithub} linkedin={pw.linkedin} setLinkedin={pw.setLinkedin} />
      <ProfileSkills skills={pw.skills} newSkillInput={pw.newSkillInput} setNewSkillInput={pw.setNewSkillInput} onAddSkill={pw.handleAddSkill} onRemoveSkill={pw.handleRemoveSkill} />
      <ProfileExperienceSection experiences={pw.experiences} setExperiences={pw.setExperiences} onAddExperience={pw.handleAddExperience} onRemoveExperience={pw.handleRemoveExperience} />
      <ProfileProjectsSection projects={pw.projects} setProjects={pw.setProjects} onAddProject={pw.handleAddProject} onRemoveProject={pw.handleRemoveProject} />

      <div className="flex justify-end gap-3 sticky bottom-4 p-4 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-md">
        <Button type="submit" size="lg" isLoading={pw.isSaving} leftIcon={<Save className="w-5 h-5" />}>
          Save Complete Profile
        </Button>
      </div>
    </form>
  );
}
