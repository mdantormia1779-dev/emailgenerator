'use client';

import React from 'react';
import { DashboardHeaderBanner } from '@/components/dashboard/DashboardHeaderBanner';
import { DashboardKpiCards } from '@/components/dashboard/DashboardKpiCards';
import { DashboardConversionCards } from '@/components/dashboard/DashboardConversionCards';
import { DashboardScannerSummary } from '@/components/dashboard/DashboardScannerSummary';
import { DashboardRecentApplications } from '@/components/dashboard/DashboardRecentApplications';
import { DashboardWorkflowGuideCard } from '@/components/dashboard/DashboardWorkflowGuideCard';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function DashboardPage() {
  const { applications, stats, loading, facebookStats } = useDashboardData();

  return (
    <div className="space-y-8">
      <DashboardHeaderBanner />
      <DashboardKpiCards stats={stats} loading={loading} />
      <DashboardConversionCards stats={stats} />
      <DashboardScannerSummary facebookStats={facebookStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardRecentApplications applications={applications} loading={loading} />
        </div>
        <div>
          <DashboardWorkflowGuideCard />
        </div>
      </div>
    </div>
  );
}
