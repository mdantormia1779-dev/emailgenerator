'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface ExperienceItemCardProps {
  exp: any;
  idx: number;
  onRemove: (idx: number) => void;
  onUpdate: (field: string, value: any) => void;
}

export const ExperienceItemCard: React.FC<ExperienceItemCardProps> = ({
  exp,
  idx,
  onRemove,
  onUpdate,
}) => {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Role #{idx + 1}</span>
        <button type="button" onClick={() => onRemove(idx)} className="text-rose-500 hover:text-rose-700 text-xs p-1 cursor-pointer">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Company</label>
          <input
            type="text"
            value={exp.company}
            onChange={e => onUpdate('company', e.target.value)}
            placeholder="TechCorp Inc."
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Role Title</label>
          <input
            type="text"
            value={exp.role}
            onChange={e => onUpdate('role', e.target.value)}
            placeholder="Senior Software Engineer"
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Start Date</label>
          <input
            type="text"
            value={exp.startDate}
            onChange={e => onUpdate('startDate', e.target.value)}
            placeholder="2021-03"
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">End Date</label>
          <input
            type="text"
            disabled={exp.isCurrent}
            value={exp.endDate || ''}
            onChange={e => onUpdate('endDate', e.target.value)}
            placeholder={exp.isCurrent ? 'Present' : '2023-11'}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white disabled:bg-slate-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Description</label>
        <textarea
          rows={3}
          value={exp.description}
          onChange={e => onUpdate('description', e.target.value)}
          placeholder="Describe main responsibilities, team size, and architectural achievements..."
          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
        />
      </div>
    </div>
  );
};
