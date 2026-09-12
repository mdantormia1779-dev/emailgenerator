'use client';

import React from 'react';

interface ScannerSelectFiltersProps {
  scoreTierFilter: string;
  setScoreTierFilter: (val: string) => void;
  locationFilter: string;
  setLocationFilter: (val: string) => void;
  dateFilter: string;
  setDateFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

export const ScannerSelectFilters: React.FC<ScannerSelectFiltersProps> = ({
  scoreTierFilter,
  setScoreTierFilter,
  locationFilter,
  setLocationFilter,
  dateFilter,
  setDateFilter,
  statusFilter,
  setStatusFilter,
}) => {
  const selectClass =
    'px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500';

  return (
    <>
      <select value={scoreTierFilter} onChange={e => setScoreTierFilter(e.target.value)} className={selectClass}>
        <option value="ALL">All Match Scores</option>
        <option value="EXCELLENT">Excellent Matches (90%+)</option>
        <option value="STRONG">Strong Matches (75-89%)</option>
        <option value="POTENTIAL">Potential Matches (60-74%)</option>
        <option value="LOW">Low Matches (&lt;60%)</option>
      </select>

      <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className={selectClass}>
        <option value="ALL">All Locations</option>
        <option value="Remote">Remote Only</option>
        <option value="Bangladesh">Bangladesh</option>
        <option value="Hybrid">Hybrid</option>
        <option value="Onsite">Onsite</option>
      </select>

      <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className={selectClass}>
        <option value="ALL">All Dates</option>
        <option value="TODAY">Posted Today</option>
        <option value="WEEK">Past 7 Days</option>
        <option value="MONTH">Past 30 Days</option>
      </select>

      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectClass}>
        <option value="ALL">All Statuses</option>
        <option value="DISCOVERED">Discovered</option>
        <option value="MATCHED">Profile Matched</option>
        <option value="EMAIL_GENERATED">Email Generated</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </select>
    </>
  );
};
