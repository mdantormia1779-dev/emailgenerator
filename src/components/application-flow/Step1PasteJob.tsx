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

  const sampleJob = `Company: Stripe
Position: Senior Full Stack Engineer (Remote)
Location: Remote (US / Canada)
Experience: 4+ years of professional software engineering

About the Role:
We are looking for a Senior Full Stack Engineer to join our Payment Interfaces team.
You will design and build resilient APIs and user-facing dashboards.

Responsibilities:
- Build reliable, performant React and Next.js applications
- Design clean RESTful and GraphQL APIs in TypeScript and Node.js
- Collaborate with database engineers using PostgreSQL
- Ensure high code quality and mentor junior team members

Requirements:
- Strong proficiency in TypeScript, React, Node.js, and modern web frameworks
- Experience with relational databases like PostgreSQL
- 4+ years building production applications

Application Instructions:
Send your resume and portfolio directly to recruiting@stripe.com or careers-team@stripe.com with your thoughts on payment UX.`;

  const handleLoadSample = () => {
    setJobDescription(sampleJob);
    setJobUrl('https://stripe.com/jobs/senior-fullstack');
    setError(null);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader
        title="Step 1: Paste Job Posting"
        subtitle="Paste the job description or requirement to analyze responsibilities, skills, and recipient emails."
        action={
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Fill Sample Job
          </button>
        }
      />
      <CardContent className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Optional Job URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
            Job Posting URL (Optional)
          </label>
          <input
            type="url"
            value={jobUrl}
            onChange={e => setJobUrl(e.target.value)}
            placeholder="https://company.com/careers/software-engineer"
            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
          />
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
