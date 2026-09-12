'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface DashboardRecentApplicationsProps {
  applications: any[];
  loading: boolean;
}

export const DashboardRecentApplications: React.FC<DashboardRecentApplicationsProps> = ({
  applications,
  loading,
}) => {
  return (
    <Card>
      <CardHeader
        title="Recent Applications"
        subtitle="Latest tracked opportunities and send statuses"
        action={
          <Link href="/applications" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="font-medium text-slate-800 text-sm">No applications created yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start by pasting a job description to extract details, match your skills, and generate your customized email.
            </p>
            <Link href="/applications/new">
              <Button size="sm" className="mt-2">Create First Application</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.slice(0, 5).map(app => (
              <div key={app.id} className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 text-sm truncate">{app.jobTitle}</h4>
                    <Badge status={app.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{app.companyName}</span>
                    <span>•</span>
                    <span>{app.recipientEmail || 'No recipient set'}</span>
                    {app.matchScore && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-indigo-600">{app.matchScore}% Match</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/applications/${app.id}`}>
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
