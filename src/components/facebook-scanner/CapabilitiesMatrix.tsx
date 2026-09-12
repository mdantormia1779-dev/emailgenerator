'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

export const CapabilitiesMatrix: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Meta Official API Boundaries & Capabilities Matrix
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Graph API v26.0 Compliant
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Supported Official Capabilities</span>
          </div>
          <ul className="space-y-1.5 text-emerald-950 pl-5 list-disc marker:text-emerald-500">
            <li>
              <strong>Managed Page Feed Ingestion:</strong> Query posts from Pages you manage using <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono text-[10px]">pages_show_list</code> and <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono text-[10px]">pages_read_engagement</code>.
            </li>
            <li>
              <strong>Automated Cursor Pagination:</strong> Traverses multi-page feeds via official <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono text-[10px]">paging.cursors.after</code> &amp; <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono text-[10px]">paging.next</code>.
            </li>
            <li>
              <strong>Deterministic SHA-256 Deduplication:</strong> Prevents duplicate job imports across multiple scans.
            </li>
            <li>
              <strong>Resume & Skill Matching:</strong> Transparent scoring against Frontend, React, Next.js, Node.js & target skills.
            </li>
          </ul>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-2.5">
          <div className="flex items-center gap-2 text-rose-800 font-bold">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Unsupported by Meta Platform (Honest Boundaries)</span>
          </div>
          <ul className="space-y-1.5 text-rose-950 pl-5 list-disc marker:text-rose-500">
            <li>
              <strong>Personal News Feed Search:</strong> Meta deprecated <code className="bg-rose-100/80 px-1 py-0.5 rounded font-mono text-[10px]">/me/home</code>; private user feeds cannot be searched automatically.
            </li>
            <li>
              <strong>Arbitrary Public Keyword Search:</strong> Meta shut down the public post search API (<code className="bg-rose-100/80 px-1 py-0.5 rounded font-mono text-[10px]">/search?type=post</code>).
            </li>
            <li>
              <strong>Facebook Groups API:</strong> Shut down by Meta on April 22, 2024.
            </li>
            <li>
              <strong>Zero Scraping / Session Theft:</strong> Strictly prohibited. Zero cookie extraction or bot automation used.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
