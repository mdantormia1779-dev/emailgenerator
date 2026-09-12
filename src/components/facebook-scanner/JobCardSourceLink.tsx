'use client';

import React from 'react';
import { Link2, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

interface JobCardSourceLinkProps {
  postUrl: string;
  jobId: string;
  verification?: any;
  copiedLink: string | null;
  onCopyLink: (url: string) => void;
  onVerifyLink: (id: string, url: string) => void;
}

export const JobCardSourceLink: React.FC<JobCardSourceLinkProps> = ({
  postUrl,
  jobId,
  verification,
  copiedLink,
  onCopyLink,
  onVerifyLink,
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Link2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <a href={postUrl} target="_blank" rel="noreferrer" className="text-blue-700 font-mono underline truncate hover:text-blue-900">
            {postUrl}
          </a>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button type="button" onClick={() => onCopyLink(postUrl)} className="px-2 py-0.5 text-[11px] rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
            {copiedLink === postUrl ? 'Copied' : 'Copy'}
          </button>
          <button type="button" onClick={() => onVerifyLink(jobId, postUrl)} disabled={verification?.verifying} className="px-2 py-0.5 text-[11px] rounded bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold cursor-pointer">
            {verification?.verifying ? 'Checking...' : 'Check Link'}
          </button>
          <a href={postUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded bg-blue-600 text-white hover:bg-blue-700">
            <span>Open Post</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {verification && !verification.verifying && (
        <div className={`text-xs p-2 rounded-lg flex items-center gap-2 ${verification.isLive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {verification.isLive ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
          <span>{verification.isLive ? `Live Verified: HTTP ${verification.status || 200}` : 'Link unreachable or requires active login.'}</span>
        </div>
      )}
    </>
  );
};
