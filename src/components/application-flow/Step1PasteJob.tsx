import React, { useState } from 'react';
import { Sparkles, Link as LinkIcon, FileText } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface Step1Props {
  jobDescription: string;
  jobUrl: string;
  setJobDescription: (val: string) => void;
  setJobUrl: (val: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const Step1PasteJob: React.FC<Step1Props> = ({
  jobDescription,
  jobUrl,
  setJobDescription,
  setJobUrl,
  onAnalyze,
  isLoading,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleStartAnalysis = () => {
    if (!jobDescription || jobDescription.trim().length < 20) {
      setError('Please paste a complete job description with at least 20 characters.');
      return;
    }
    setError(null);
    onAnalyze();
  };

  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  const handleFetchFromUrl = async () => {
    if (!jobUrl || !jobUrl.trim().startsWith('http')) {
      setError('Please enter a valid job URL starting with http:// or https://');
      return;
    }

    setIsFetchingUrl(true);
    setError(null);

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
        setJobDescription(json.data.rawContent);
      } else {
        setError('Could not extract text from this URL. Please copy and paste the job description directly.');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching URL content');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader
        title="Step 1: Paste Job Posting"
        subtitle="Paste the job description or enter a real job URL to analyze responsibilities, skills, and recipient emails."
      />
      <CardContent className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Optional Job URL */}
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

        {/* Job Description Text */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Complete Job Description <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {jobDescription.length} characters
            </span>
          </div>
          <textarea
            rows={12}
            value={jobDescription}
            onChange={e => {
              setJobDescription(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste the entire job posting here, including title, requirements, tech stack, and any contact / application email instructions..."
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400 font-mono text-xs leading-relaxed"
          />
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 text-xs text-slate-500 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span>
            The analyzer will extract structured job information, detect recipient emails, and prepare a factual match against your profile.
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <span className="text-xs text-slate-400">Step 1 of 10</span>
        <Button
          onClick={handleStartAnalysis}
          isLoading={isLoading}
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Analyze Job &rarr;
        </Button>
      </CardFooter>
    </Card>
  );
};
