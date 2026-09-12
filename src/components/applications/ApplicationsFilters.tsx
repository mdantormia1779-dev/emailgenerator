'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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

interface ApplicationsFiltersProps {
  activeStatus: string;
  setActiveStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export const ApplicationsFilters: React.FC<ApplicationsFiltersProps> = ({
  activeStatus,
  setActiveStatus,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
}) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
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

          <form onSubmit={onSearchSubmit} className="flex gap-2 w-full sm:w-72">
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
  );
};
