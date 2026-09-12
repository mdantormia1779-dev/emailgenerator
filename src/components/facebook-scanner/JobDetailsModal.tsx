'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { NormalizedJobOpportunity } from '@/server/services/meta-job-scanner.service';

interface JobDetailsModalProps {
  selectedJob: NormalizedJobOpportunity | null;
  onClose: () => void;
  onGenerateEmail: (id: string) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  selectedJob,
  onClose,
  onGenerateEmail,
}) => {
  if (!selectedJob) return null;

  return (
    <Modal isOpen={Boolean(selectedJob)} onClose={onClose} title={selectedJob.title}>
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <span className="font-bold text-sm text-slate-900">{selectedJob.company}</span>
            <span className="text-slate-500 block">{selectedJob.location} • {selectedJob.employmentType}</span>
          </div>
          <span className="px-2.5 py-1 rounded-full font-bold border bg-indigo-50 text-indigo-700 border-indigo-200">
            {selectedJob.matchScore}% Match
          </span>
        </div>

        <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-indigo-950 space-y-1">
          <strong className="block text-indigo-900">Why this job matched your resume:</strong>
          <p>{selectedJob.matchReason}</p>
        </div>

        <div>
          <strong className="block text-slate-700 mb-1">Target Skills Found:</strong>
          <div className="flex flex-wrap gap-1">
            {selectedJob.skills.map((s, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium text-[11px]">
                {s}
              </span>
            ))}
          </div>
        </div>

        {selectedJob.contactEmail && (
          <div>
            <strong className="block text-slate-700 mb-1">Contact Email:</strong>
            <a href={`mailto:${selectedJob.contactEmail}`} className="text-indigo-600 font-mono underline">
              {selectedJob.contactEmail}
            </a>
          </div>
        )}

        <div>
          <strong className="block text-slate-700 mb-1">Full Description:</strong>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans">
            {selectedJob.description}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onClose();
              onGenerateEmail(selectedJob.id);
            }}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Generate Email Draft
          </Button>
        </div>
      </div>
    </Modal>
  );
};
