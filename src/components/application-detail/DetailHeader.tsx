'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ApplicationStatus } from '@/types';

const STATUS_OPTIONS: ApplicationStatus[] = [
  'DRAFT',
  'ANALYZED',
  'GENERATED',
  'REVIEWED',
  'SENT',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

interface DetailHeaderProps {
  application: any;
  currentStatus: ApplicationStatus;
  onStatusChange: (status: ApplicationStatus) => void;
  isUpdatingStatus: boolean;
  onDelete: () => void;
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({
  application,
  currentStatus,
  onStatusChange,
  isUpdatingStatus,
  onDelete,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Link href="/applications">
          <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {application.jobTitle}
            <Badge status={application.status} />
          </h1>
          <p className="text-xs text-slate-500">{application.companyName}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={currentStatus}
          onChange={e => onStatusChange(e.target.value as ApplicationStatus)}
          disabled={isUpdatingStatus}
          className="text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-xs"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt} value={opt}>
              Status: {opt}
            </option>
          ))}
        </select>

        <Button size="sm" variant="ghost" onClick={onDelete} className="text-rose-600 hover:bg-rose-50">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
