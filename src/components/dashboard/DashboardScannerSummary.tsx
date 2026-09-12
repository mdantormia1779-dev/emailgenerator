'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface DashboardScannerSummaryProps {
  facebookStats: {
    totalScanned: number;
    relevantJobs: number;
    draftApplications: number;
    ignored: number;
  };
}

export const DashboardScannerSummary: React.FC<DashboardScannerSummaryProps> = ({ facebookStats }) => {
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/30">
      <CardHeader
        title="Meta-supported Page Job Scanner"
        subtitle="Official Graph API v26.0 discovery for Frontend, React, Next.js, MERN & Full Stack roles"
        action={
          <Link href="/facebook-scanner">
            <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Page Scanner
            </Button>
          </Link>
        }
      />
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scanned Posts</span>
            <span className="text-xl font-bold text-slate-800 mt-0.5 block">{facebookStats.totalScanned}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-indigo-200 shadow-2xs">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Relevant Jobs</span>
            <span className="text-xl font-bold text-indigo-900 mt-0.5 block">{facebookStats.relevantJobs}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-emerald-200 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Draft Applications</span>
            <span className="text-xl font-bold text-emerald-900 mt-0.5 block">{facebookStats.draftApplications}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ignored</span>
            <span className="text-xl font-bold text-slate-600 mt-0.5 block">{facebookStats.ignored}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
