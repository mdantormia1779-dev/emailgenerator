'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const DashboardHeaderBanner: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 rounded-2xl text-white shadow-md">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-indigo-300" />
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
            Welcome back
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">JobApply AI Dashboard</h1>
        <p className="text-indigo-200 text-sm mt-1 max-w-xl">
          Analyze job listings, match against your profile, generate factual emails, and safely dispatch with full review.
        </p>
      </div>
      <Link href="/applications/new">
        <Button
          size="lg"
          className="bg-indigo-50 font-semibold shadow"
          leftIcon={<PlusCircle className="w-5 h-5" />}
        >
          Start New Application
        </Button>
      </Link>
    </div>
  );
};
