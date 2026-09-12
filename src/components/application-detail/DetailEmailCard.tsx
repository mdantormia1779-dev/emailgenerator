'use client';

import React from 'react';
import { Paperclip, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export const DetailEmailCard: React.FC<{ application: any }> = ({ application }) => {
  const isSent = application.status === 'SENT' || !!application.sentAt;

  return (
    <div className="space-y-6">
      {isSent && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Application Sent via Gmail (Duplicate Protection Active)</p>
            <p className="mt-0.5 text-emerald-700">
              Dispatched at {new Date(application.sentAt).toLocaleString()} with Gmail Message ID{' '}
              <code className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded text-[11px]">
                {application.providerMessageId}
              </code>
              . Repeated direct sending on this record is locked.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader
          title="Tailored Application Email"
          subtitle={`Recipient: ${application.recipientEmail || 'Not set'}`}
          action={
            application.matchScore && (
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                {application.matchScore}% Match Score
              </span>
            )
          }
        />
        <CardContent className="space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">Subject:</span>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900">
              {application.subject || <span className="text-slate-400 italic">No subject</span>}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">Body:</span>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-sans whitespace-pre-wrap leading-relaxed text-slate-800 max-h-96 overflow-y-auto">
              {application.emailBody || <span className="text-slate-400 italic">No email body generated</span>}
            </div>
          </div>

          {application.resume && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900">
              <Paperclip className="w-4 h-4 text-indigo-600" />
              <span>
                Attached Resume: <strong>{application.resume.originalName}</strong>
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
