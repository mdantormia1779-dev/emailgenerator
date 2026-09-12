'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface MatchScoreSkillsListProps {
  strongMatches: string[];
  missingSkills: string[];
}

export const MatchScoreSkillsList: React.FC<MatchScoreSkillsListProps> = ({
  strongMatches,
  missingSkills,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Documented Strong Matches ({strongMatches.length})
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {strongMatches.map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Missing or Unmatched Skills ({missingSkills.length})
        </div>
        <p className="text-[11px] text-amber-800">
          Per zero-hallucination rules, these will <strong>never</strong> be claimed in your generated email:
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {missingSkills.length === 0 ? (
            <span className="text-xs text-slate-500 italic">No missing skills detected!</span>
          ) : (
            missingSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"
              >
                {skill}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
