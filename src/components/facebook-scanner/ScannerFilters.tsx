'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { ScannerSelectFilters } from './ScannerSelectFilters';

interface ScannerFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  scoreTierFilter: string;
  setScoreTierFilter: (val: string) => void;
  locationFilter: string;
  setLocationFilter: (val: string) => void;
  dateFilter: string;
  setDateFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

export const ScannerFilters: React.FC<ScannerFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  scoreTierFilter,
  setScoreTierFilter,
  locationFilter,
  setLocationFilter,
  dateFilter,
  setDateFilter,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search jobs by keyword, title, company, or skills (e.g. React, Next.js, Node.js)..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <ScannerSelectFilters
            scoreTierFilter={scoreTierFilter}
            setScoreTierFilter={setScoreTierFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>
      </CardContent>
    </Card>
  );
};
