'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export const DetailRoleCard: React.FC<{ application: any }> = ({ application }) => {
  return (
    <Card>
      <CardHeader title="Role Overview" />
      <CardContent className="space-y-3 text-xs text-slate-600">
        <div>
          <span className="font-semibold text-slate-400 block text-[10px] uppercase">
            Location & Type
          </span>
          <p className="text-slate-800 font-medium">
            {application.location || 'Not specified'} ({application.workType || 'Unknown'})
          </p>
        </div>

        {application.jobUrl && (
          <div>
            <span className="font-semibold text-slate-400 block text-[10px] uppercase">
              Job Link
            </span>
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline break-all"
            >
              {application.jobUrl}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
