'use client';

import React from 'react';
import { Building2, MapPin, Briefcase, Clock, Sparkles, Mail } from 'lucide-react';
import { NormalizedJobOpportunity } from '@/server/services/meta-job-scanner.service';
import { JobCardSourceLink } from './JobCardSourceLink';
import { JobCardActions } from './JobCardActions';

interface JobOpportunityCardProps {
  job: NormalizedJobOpportunity;
  verification?: any;
  isGenerating: boolean;
  copiedLink: string | null;
  onGenerateEmail: (id: string) => void;
  onViewJob: (job: NormalizedJobOpportunity) => void;
  onRejectJob: (id: string) => void;
  onVerifyLink: (id: string, url: string) => void;
  onCopyLink: (url: string) => void;
}

export const JobOpportunityCard: React.FC<JobOpportunityCardProps> = ({
  job,
  verification,
  isGenerating,
  copiedLink,
  onGenerateEmail,
  onViewJob,
  onRejectJob,
  onVerifyLink,
  onCopyLink,
}) => {
  const getTierBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 75) return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    if (score >= 60) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="p-5 hover:bg-slate-50/70 transition space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 text-base">{job.title}</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${getTierBadgeColor(job.matchScore)}`}>
              {job.matchScore}% • {job.matchTier || `${job.matchScore}% Match`}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">{job.status}</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
            <span className="font-semibold text-slate-700 flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {job.company}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600"><MapPin className="w-3 h-3 text-slate-400" /> {job.location}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600"><Briefcase className="w-3 h-3 text-slate-400" /> {job.employmentType}</span>
            {job.postedAt && <><span>•</span><span className="flex items-center gap-1 text-slate-500"><Clock className="w-3 h-3 text-slate-400" /> {new Date(job.postedAt).toLocaleDateString()}</span></>}
          </div>
        </div>

        <JobCardActions
          job={job}
          isGenerating={isGenerating}
          onGenerateEmail={onGenerateEmail}
          onViewJob={onViewJob}
          onRejectJob={onRejectJob}
        />
      </div>

      <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div><strong>Resume Alignment: </strong><span>{job.matchReason}</span></div>
      </div>

      {job.postUrl && (
        <JobCardSourceLink postUrl={job.postUrl} jobId={job.id} verification={verification} copiedLink={copiedLink} onCopyLink={onCopyLink} onVerifyLink={onVerifyLink} />
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {job.contactEmail && (
          <a href={`mailto:${job.contactEmail}`} className="flex items-center gap-1.5 font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
            <Mail className="w-3.5 h-3.5 text-indigo-600" />
            <span>{job.contactEmail}</span>
          </a>
        )}
        {job.skills && job.skills.map((skill, idx) => (
          <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">{skill}</span>
        ))}
      </div>
      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/50 p-2 rounded border border-slate-100 font-sans">{job.description}</p>
    </div>
  );
};
