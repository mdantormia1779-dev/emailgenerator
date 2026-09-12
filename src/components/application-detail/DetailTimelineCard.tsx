'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export const DetailTimelineCard: React.FC<{ events?: any[] }> = ({ events }) => {
  return (
    <Card>
      <CardHeader title="Application Timeline" subtitle="Chronological audit history" />
      <CardContent className="p-4">
        {events && events.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {events.map((evt: any) => (
              <div key={evt.id} className="relative">
                <div className="absolute -left-[19px] top-0.5 w-3 h-3 rounded-full border-2 border-white bg-indigo-600 ring-2 ring-indigo-100" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">{evt.description}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {new Date(evt.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No timeline events recorded yet.</p>
        )}
      </CardContent>
    </Card>
  );
};
