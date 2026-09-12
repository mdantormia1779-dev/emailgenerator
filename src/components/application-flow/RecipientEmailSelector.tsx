'use client';

import React from 'react';
import { Mail } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';

interface RecipientEmailSelectorProps {
  recipientEmails: string[];
  selectedEmail: string;
  setSelectedEmail: (email: string) => void;
  customRecipientEmail: string;
  setCustomRecipientEmail: (email: string) => void;
}

export const RecipientEmailSelector: React.FC<RecipientEmailSelectorProps> = ({
  recipientEmails,
  selectedEmail,
  setSelectedEmail,
  customRecipientEmail,
  setCustomRecipientEmail,
}) => {
  return (
    <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
          <Mail className="w-4 h-4 text-indigo-600" />
          Application Recipient Email <span className="text-rose-500">*</span>
        </label>
        {recipientEmails.length > 1 && (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
            Multiple recipient emails found - Please select one
          </span>
        )}
      </div>

      {recipientEmails.length === 0 ? (
        <div className="space-y-2">
          <Alert type="warning" message="No application email found automatically. Please enter recipient email manually." />
          <input
            type="email"
            value={customRecipientEmail}
            onChange={e => { setCustomRecipientEmail(e.target.value); setSelectedEmail('custom'); }}
            placeholder="recruiter@company.com"
            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-600">Select which recipient email should receive your application:</p>
          <div className="space-y-2">
            {recipientEmails.map(email => (
              <label key={email} className={`flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition ${selectedEmail === email ? 'border-indigo-600 bg-white shadow-xs font-semibold text-indigo-950' : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'}`}>
                <input type="radio" name="recipientEmail" value={email} checked={selectedEmail === email} onChange={() => setSelectedEmail(email)} className="text-indigo-600 focus:ring-indigo-500" />
                <span className="font-mono text-xs">{email}</span>
              </label>
            ))}

            <label className={`flex flex-col gap-2 p-3 rounded-lg border text-sm cursor-pointer transition ${selectedEmail === 'custom' ? 'border-indigo-600 bg-white shadow-xs font-semibold text-indigo-950' : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'}`}>
              <div className="flex items-center gap-3">
                <input type="radio" name="recipientEmail" value="custom" checked={selectedEmail === 'custom'} onChange={() => setSelectedEmail('custom')} className="text-indigo-600 focus:ring-indigo-500" />
                <span>Enter a different email manually</span>
              </div>
              {selectedEmail === 'custom' && (
                <input type="email" value={customRecipientEmail} onChange={e => setCustomRecipientEmail(e.target.value)} placeholder="hiring.manager@company.com" className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 mt-1" />
              )}
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
