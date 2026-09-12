'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApplicationRow } from './ApplicationRow';

interface ApplicationsTableProps {
  applications: any[];
  loading: boolean;
  searchQuery: string;
  activeStatus: string;
}

export const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
  applications,
  loading,
  searchQuery,
  activeStatus,
}) => {
  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">No applications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || activeStatus !== 'ALL'
                ? 'No applications match your current filters. Try changing or clearing your search.'
                : 'You haven’t created any job applications yet. Start your first tailored application now.'}
            </p>
            <Link href="/applications/new">
              <Button size="sm" className="mt-2">Create Application</Button>
            </Link>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Company & Role</th>
                <th className="px-6 py-3.5">Recipient</th>
                <th className="px-6 py-3.5">Match Score</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Created / Sent</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map(app => (
                <ApplicationRow key={app.id} app={app} />
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
};
