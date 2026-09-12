'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { DashboardStats } from '@/hooks/useDashboardData';

export const DashboardConversionCards: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  return (
    <Card>
      <CardHeader
        title="Conversion & Success Metrics"
        subtitle="Real-time application pipeline performance"
      />
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Response Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.responseRate}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Shortlisted / Interviews / Offers</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-indigo-500 flex items-center justify-center font-bold text-indigo-600 text-xs">
              {stats.responseRate}%
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interview Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.interviewRate}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Scheduled interviews from sent</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-amber-500 flex items-center justify-center font-bold text-amber-600 text-xs">
              {stats.interviewRate}%
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Offer Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.offerRate}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Formal offers converted</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-emerald-600 text-xs">
              {stats.offerRate}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
