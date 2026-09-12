'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NormalizedJobOpportunity } from '@/server/services/meta-job-scanner.service';

interface JobCardActionsProps {
  job: NormalizedJobOpportunity;
  isGenerating: boolean;
  onGenerateEmail: (id: string) => void;
  onViewJob: (job: NormalizedJobOpportunity) => void;
  onRejectJob: (id: string) => void;
}

export const JobCardActions: React.FC<JobCardActionsProps> = ({
  job,
  isGenerating,
  onGenerateEmail,
  onViewJob,
  onRejectJob,
}) => {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 pt-1 sm:pt-0">
      {job.status === 'EMAIL_GENERATED' || job.status === 'REVIEW_REQUIRED' ? (
        <Button
          size="sm"
          variant="primary"
          onClick={() => router.push('/applications')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Review Application
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={() => onGenerateEmail(job.id)}
          isLoading={isGenerating}
          disabled={job.status === 'REJECTED'}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
        >
          Generate Email
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => onViewJob(job)}
        leftIcon={<Eye className="w-3.5 h-3.5" />}
      >
        View Job
      </Button>
      {job.status !== 'REJECTED' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRejectJob(job.id)}
          className="text-slate-400 hover:text-rose-600 text-xs"
        >
          Reject
        </Button>
      )}
    </div>
  );
};
