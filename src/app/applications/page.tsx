'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ApplicationsFilters } from '@/components/applications/ApplicationsFilters';
import { ApplicationsTable } from '@/components/applications/ApplicationsTable';

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
      if (activeStatus !== 'ALL') params.append('status', activeStatus);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (params.toString()) url += `?${params.toString()}`;

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Application Tracker</h1>
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

      <ApplicationsFilters
        activeStatus={activeStatus}
        setActiveStatus={setActiveStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      <ApplicationsTable
        applications={applications}
        loading={loading}
        searchQuery={searchQuery}
        activeStatus={activeStatus}
      />
    </div>
  );
}
