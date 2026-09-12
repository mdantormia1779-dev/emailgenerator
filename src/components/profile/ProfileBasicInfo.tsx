'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface ProfileBasicInfoProps {
  fullName: string;
  setFullName: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  yearsOfExperience: number;
  setYearsOfExperience: (val: number) => void;
  summary: string;
  setSummary: (val: string) => void;
}

export const ProfileBasicInfo: React.FC<ProfileBasicInfoProps> = ({
  fullName,
  setFullName,
  title,
  setTitle,
  yearsOfExperience,
  setYearsOfExperience,
  summary,
  setSummary,
}) => {
  return (
    <Card>
      <CardHeader title="Personal & Professional Identity" subtitle="Your primary candidate information" />
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Alex Morgan"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Senior Full Stack Engineer"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Years of Experience <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              max={50}
              required
              value={yearsOfExperience}
              onChange={e => setYearsOfExperience(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Professional Summary <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="Highlight your core technical strengths, engineering philosophy, and measurable business impact..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
        </div>
      </CardContent>
    </Card>
  );
};
