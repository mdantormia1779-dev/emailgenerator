'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ScannerStatsCardsProps {
  syncStats: {
    scanned: number;
    newJobs: number;
    duplicates: number;
    matched: number;
    highMatch: number;
  } | null;
}

export const ScannerStatsCards: React.FC<ScannerStatsCardsProps> = ({ syncStats }) => {
  return (
    <div className="space-y-4">
      {syncStats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
            <span className="block text-[11px] text-slate-500 font-medium">Jobs Scanned</span>
            <span className="text-lg font-bold text-slate-800">{syncStats.scanned}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
            <span className="block text-[11px] text-slate-500 font-medium">New Jobs</span>
            <span className="text-lg font-bold text-blue-600">+{syncStats.newJobs}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
            <span className="block text-[11px] text-slate-500 font-medium">Duplicates</span>
            <span className="text-lg font-bold text-slate-500">{syncStats.duplicates}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
            <span className="block text-[11px] text-slate-500 font-medium">Matched Jobs</span>
            <span className="text-lg font-bold text-indigo-600">{syncStats.matched}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-center col-span-2 sm:col-span-1">
            <span className="block text-[11px] text-slate-500 font-medium">High-Match (75%+)</span>
            <span className="text-lg font-bold text-emerald-600">{syncStats.highMatch}</span>
          </div>
        </div>
      )}

      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Generate &rarr; Review &rarr; Manual Send Pipeline:</strong> All discovered jobs generate <strong>DRAFT</strong> emails only. Emails are NEVER sent autonomously. Dispatch always requires your explicit human confirmation via your connected Gmail.
          </span>
        </div>
      </div>
    </div>
  );
};
