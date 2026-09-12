'use client';

import React from 'react';
import { Mail, User, Paperclip } from 'lucide-react';

interface DispatchPreviewCardProps {
  senderGmail: string;
  recipient: string;
  subject: string;
  attachmentName: string | null;
  body: string;
}

export const DispatchPreviewCard: React.FC<DispatchPreviewCardProps> = ({
  senderGmail,
  recipient,
  subject,
  attachmentName,
  body,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
      <div className="bg-slate-50/80 p-4 border-b border-slate-200 space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-500 flex items-center gap-1.5 w-24">
            <User className="w-3.5 h-3.5 text-slate-400" />
            From (Gmail):
          </span>
          <span className="font-mono text-slate-800 font-medium flex-1">
            {senderGmail || 'Connected Gmail Account'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-500 flex items-center gap-1.5 w-24">
            <Mail className="w-3.5 h-3.5 text-indigo-600" />
            To (Recipient):
          </span>
          <span className="font-mono text-indigo-900 font-bold flex-1 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
            {recipient}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-500 flex items-center gap-1.5 w-24">
            Subject:
          </span>
          <span className="font-semibold text-slate-900 flex-1">
            {subject}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-500 flex items-center gap-1.5 w-24">
            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
            Attachment:
          </span>
          <span className="text-slate-700 flex-1">
            {attachmentName ? (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {attachmentName}
              </span>
            ) : (
              <span className="text-slate-400 italic">None attached</span>
            )}
          </span>
        </div>
      </div>

      <div className="p-5 text-sm whitespace-pre-wrap font-sans text-slate-800 leading-relaxed max-h-72 overflow-y-auto bg-white">
        {body}
      </div>
    </div>
  );
};
