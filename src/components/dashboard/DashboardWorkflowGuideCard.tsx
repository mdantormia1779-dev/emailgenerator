'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export const DashboardWorkflowGuideCard: React.FC = () => {
  return (
    <Card>
      <CardHeader
        title="Safe 10-Step Pipeline"
        subtitle="Enforced zero-hallucination workflow"
      />
      <CardContent className="space-y-3 text-xs">
        <div className="flex items-start gap-3 p-2 rounded-lg bg-indigo-50/50">
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
            1-3
          </span>
          <div>
            <p className="font-semibold text-slate-900">Job Input & Extraction</p>
            <p className="text-slate-500">Extracts title, company, requirements, and detects recipient emails.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2 rounded-lg bg-indigo-50/50">
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
            4
          </span>
          <div>
            <p className="font-semibold text-slate-900">Deterministic Matching</p>
            <p className="text-slate-500">Scores technical fit (50%), experience (20%), and projects (20%).</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2 rounded-lg bg-indigo-50/50">
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
            5-6
          </span>
          <div>
            <p className="font-semibold text-slate-900">Factual Email & Editor</p>
            <p className="text-slate-500">Zero hallucination: uses only profile facts. Full manual editing freedom.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
            7-10
          </span>
          <div>
            <p className="font-semibold text-emerald-900">Review, 4 Confirmations & Send</p>
            <p className="text-emerald-700">Strict safety: Send requires explicit confirmation of all details.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
