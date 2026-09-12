'use client';

import React from 'react';
import { Briefcase, Send, CalendarCheck, Award, TrendingUp, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { DashboardStats } from '@/hooks/useDashboardData';

export const DashboardKpiCards: React.FC<{ stats: DashboardStats; loading: boolean }> = ({
  stats,
  loading,
}) => {
  const kpis = [
    { label: 'Total Applications', value: stats.total, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Sent Applications', value: stats.sent, icon: Send, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Interviews', value: stats.interviews, icon: CalendarCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Offers Received', value: stats.offers, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Shortlisted', value: stats.shortlisted, icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
              <div className={`w-7 h-7 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
