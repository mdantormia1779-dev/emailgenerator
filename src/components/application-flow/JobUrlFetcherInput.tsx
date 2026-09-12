'use client';

import React, { useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface JobUrlFetcherInputProps {
  jobUrl: string;
  setJobUrl: (val: string) => void;
  onContentFetched: (content: string) => void;
  onError: (err: string) => void;
}

export const JobUrlFetcherInput: React.FC<JobUrlFetcherInputProps> = ({
  jobUrl,
  setJobUrl,
  onContentFetched,
  onError,
}) => {
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  const handleFetchFromUrl = async () => {
    if (!jobUrl || !jobUrl.trim().startsWith('http')) {
      onError('Please enter a valid job URL starting with http:// or https://');
      return;
    }

    setIsFetchingUrl(true);
    try {
      const res = await fetch('/api/jobs/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch job content from URL');
      }

      if (json.data && json.data.rawContent) {
        onContentFetched(json.data.rawContent);
      } else {
        onError('Could not extract text from this URL. Please copy and paste the job description directly.');
      }
    } catch (err: any) {
      onError(err.message || 'Error fetching URL content');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
        <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
        Job Posting URL (Facebook Post, Career Site, or Job Link)
      </label>
      <div className="flex gap-2">
        <input
          type="url"
          value={jobUrl}
          onChange={e => setJobUrl(e.target.value)}
          placeholder="https://facebook.com/groups/.../posts/... or https://company.com/jobs/..."
          className="flex-1 px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleFetchFromUrl}
          isLoading={isFetchingUrl}
          disabled={!jobUrl.trim()}
        >
          Fetch URL
        </Button>
      </div>
    </div>
  );
};
