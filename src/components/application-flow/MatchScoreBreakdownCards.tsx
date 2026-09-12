'use client';

import React from 'react';

interface MatchScoreBreakdownCardsProps {
  technicalSkillScore: number;
  experienceScore: number;
  projectScore: number;
  otherScore: number;
}

export const MatchScoreBreakdownCards: React.FC<MatchScoreBreakdownCardsProps> = ({
  technicalSkillScore,
  experienceScore,
  projectScore,
  otherScore,
}) => {
  const metrics = [
    { label: 'Tech Skills (50%)', score: technicalSkillScore },
    { label: 'Experience (20%)', score: experienceScore },
    { label: 'Projects (20%)', score: projectScore },
    { label: 'Other Fit (10%)', score: otherScore },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {metrics.map(m => (
        <div key={m.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            {m.label}
          </span>
          <span className="text-lg font-extrabold text-slate-900 mt-1 block">
            {m.score}%
          </span>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${m.score}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};
