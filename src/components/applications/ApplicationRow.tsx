'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const ApplicationRow: React.FC<{ app: any }> = ({ app }) => {
  return (
    <tr className="hover:bg-slate-50/80 transition">
      <td className="px-6 py-4">
        <div className="font-semibold text-slate-900 text-sm">{app.jobTitle}</div>
        <div className="text-slate-500 text-xs font-medium mt-0.5 flex items-center gap-1.5">
          <span>{app.companyName}</span>
          {app.workType && <span>• {app.workType}</span>}
        </div>
      </td>
      <td className="px-6 py-4 font-mono text-slate-700">
        {app.recipientEmail || <span className="text-slate-400 italic">Not set</span>}
      </td>
      <td className="px-6 py-4">
        {app.matchScore !== null ? (
          <div className="flex items-center gap-2">
            <div className="w-10 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${app.matchScore}%` }} />
            </div>
            <span className="font-bold text-slate-900">{app.matchScore}%</span>
          </div>
        ) : <span className="text-slate-400">N/A</span>}
      </td>
      <td className="px-6 py-4"><Badge status={app.status} /></td>
      <td className="px-6 py-4 text-slate-500">
        {app.sentAt ? (
          <div>
            <span className="text-emerald-700 font-medium block">Sent {new Date(app.sentAt).toLocaleDateString()}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {new Date(app.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ) : <span>{new Date(app.createdAt).toLocaleDateString()}</span>}
      </td>
      <td className="px-6 py-4 text-right">
        <Link href={`/applications/${app.id}`}>
          <Button size="sm" variant="outline" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
            Details
          </Button>
        </Link>
      </td>
    </tr>
  );
};
