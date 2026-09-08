'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Search,
  Filter,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApplicationStatus } from '@/types';

const STATUS_TABS = [
  'ALL',
  'DRAFT',
  'SENT',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

export default function ApplicationsTrackerPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let url = '/api/applications';
      const params = new URLSearchParams();
      if (activeStatus !== 'ALL') {
        params.append('status', activeStatus);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setApplications(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Application Tracker
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Monitor submission statuses, interviews, notes, and timelines.
          </p>
        </div>
        <Link href="/applications/new">
          <Button leftIcon={<PlusCircle className="w-4 h-4" />}>
            New Application
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {STATUS_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveStatus(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeStatus === tab
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-72">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search company, title..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <Button type="submit" size="sm" variant="secondary">
                Search
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
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
                <Button size="sm" className="mt-2">
                  Create Application
                </Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Company &amp; Role</th>
                  <th className="px-6 py-3.5">Recipient</th>
                  <th className="px-6 py-3.5">Match Score</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created / Sent</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 text-sm">
                        {app.jobTitle}
                      </div>
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
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${app.matchScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-900">{app.matchScore}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={app.status} />
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {app.sentAt ? (
                        <div>
                          <span className="text-emerald-700 font-medium block">
                            Sent {new Date(app.sentAt).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(app.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link href={`/applications/${app.id}`}>
                        <Button size="sm" variant="outline" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                          Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
