'use client';

import React from 'react';
import { Briefcase, Plus } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { NormalizedJobOpportunity } from '@/server/services/meta-job-scanner.service';
import { JobOpportunityCard } from './JobOpportunityCard';

interface JobFeedListProps {
  jobs: NormalizedJobOpportunity[];
  loading: boolean;
  linkVerifications: Record<string, any>;
  generatingJobId: string | null;
  copiedLink: string | null;
  onGenerateEmail: (id: string) => void;
  onViewJob: (job: NormalizedJobOpportunity) => void;
  onRejectJob: (id: string) => void;
  onVerifyLink: (id: string, url: string) => void;
  onCopyLink: (url: string) => void;
  onOpenImport: () => void;
}

export const JobFeedList: React.FC<JobFeedListProps> = ({
  jobs,
  loading,
  linkVerifications,
  generatingJobId,
  copiedLink,
  onGenerateEmail,
  onViewJob,
  onRejectJob,
  onVerifyLink,
  onCopyLink,
  onOpenImport,
}) => {
  return (
    <Card>
      <CardHeader
        title="Discovered Job Opportunities"
        subtitle={`Showing ${jobs.length} opportunity(ies) matched against target developer skills`}
      />
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">No job opportunities in this view</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click &quot;Scan Managed Page Jobs&quot; to query your connected Meta Pages via Graph API, or import manually.
            </p>
            <Button size="sm" onClick={onOpenImport} leftIcon={<Plus className="w-4 h-4" />}>
              Import a Facebook Job Link/Post manually
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.map(job => (
              <JobOpportunityCard
                key={job.id}
                job={job}
                verification={linkVerifications[job.id]}
                isGenerating={generatingJobId === job.id}
                copiedLink={copiedLink}
                onGenerateEmail={onGenerateEmail}
                onViewJob={onViewJob}
                onRejectJob={onRejectJob}
                onVerifyLink={onVerifyLink}
                onCopyLink={onCopyLink}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
