'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface SendSafetyCheckboxesProps {
  recipient: string;
  attachmentName: string | null;
  reviewedRecipient: boolean;
  setReviewedRecipient: (val: boolean) => void;
  reviewedEmail: boolean;
  setReviewedEmail: (val: boolean) => void;
  reviewedAttachment: boolean;
  setReviewedAttachment: (val: boolean) => void;
  confirmSend: boolean;
  setConfirmSend: (val: boolean) => void;
}

export const SendSafetyCheckboxes: React.FC<SendSafetyCheckboxesProps> = ({
  recipient,
  attachmentName,
  reviewedRecipient,
  setReviewedRecipient,
  reviewedEmail,
  setReviewedEmail,
  reviewedAttachment,
  setReviewedAttachment,
  confirmSend,
  setConfirmSend,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Explicit Confirmation Required
          </h4>
          <p className="text-[11px] text-amber-800">
            You must review and explicitly verify all 4 confirmation statements below. Emails are never sent automatically.
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-800 font-medium select-none">
          <input
            type="checkbox"
            checked={reviewedRecipient}
            onChange={e => setReviewedRecipient(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          <span>
            1. <strong>I reviewed the recipient email</strong> (<code className="text-indigo-900 bg-indigo-100/70 px-1 py-0.5 rounded">{recipient}</code>) and confirm it is the intended recipient.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-800 font-medium select-none">
          <input
            type="checkbox"
            checked={reviewedEmail}
            onChange={e => setReviewedEmail(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          <span>
            2. <strong>I reviewed the email subject and body</strong>, and confirm all facts and statements are accurate.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-800 font-medium select-none">
          <input
            type="checkbox"
            checked={reviewedAttachment}
            onChange={e => setReviewedAttachment(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          <span>
            3. <strong>I reviewed the attachment</strong> ({attachmentName || 'no attachment confirmed'}) and approve sending it.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-800 font-medium select-none">
          <input
            type="checkbox"
            checked={confirmSend}
            onChange={e => setConfirmSend(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          <span>
            4. <strong>I want to send this application</strong> via Gmail immediately.
          </span>
        </label>
      </div>
    </div>
  );
};
