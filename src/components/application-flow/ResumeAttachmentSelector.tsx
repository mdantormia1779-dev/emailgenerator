'use client';

import React from 'react';
import { Paperclip } from 'lucide-react';

interface ResumeAttachmentSelectorProps {
  resumes: any[];
  selectedResumeId: string | null;
  setSelectedResumeId: (val: string | null) => void;
}

export const ResumeAttachmentSelector: React.FC<ResumeAttachmentSelectorProps> = ({
  resumes,
  selectedResumeId,
  setSelectedResumeId,
}) => {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
        <Paperclip className="w-4 h-4 text-slate-600" />
        Resume Attachment
      </label>
      {resumes.length === 0 ? (
        <p className="text-xs text-slate-500">
          No resumes uploaded yet. You can upload one under the <strong>Resumes</strong> section or proceed without attachment.
        </p>
      ) : (
        <select
          value={selectedResumeId || ''}
          onChange={e => setSelectedResumeId(e.target.value || null)}
          className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">-- No resume attached --</option>
          {resumes.map(r => (
            <option key={r.id} value={r.id}>
              {r.originalName} ({(r.fileSize / 1024).toFixed(0)} KB){r.isDefault ? ' - Default' : ''}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
