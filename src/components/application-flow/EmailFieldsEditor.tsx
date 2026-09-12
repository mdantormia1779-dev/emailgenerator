'use client';

import React from 'react';

interface EmailFieldsEditorProps {
  recipient: string;
  setRecipient: (val: string) => void;
  subject: string;
  setSubject: (val: string) => void;
  body: string;
  setBody: (val: string) => void;
}

export const EmailFieldsEditor: React.FC<EmailFieldsEditorProps> = ({
  recipient,
  setRecipient,
  subject,
  setSubject,
  body,
  setBody,
}) => {
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Recipient Email <span className="text-rose-500">*</span>
        </label>
        <input
          type="email"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          placeholder="recruiter@company.com"
          className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Subject Line <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Application for Senior Full Stack Engineer - Alex Morgan"
          className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-slate-700">
            Email Body <span className="text-rose-500">*</span>
          </label>
          <span
            className={`text-xs ${
              wordCount >= 140 && wordCount <= 260 ? 'text-emerald-600 font-semibold' : 'text-slate-400'
            }`}
          >
            {wordCount} words (Target: 150-250 words)
          </span>
        </div>
        <textarea
          rows={12}
          value={body}
          onChange={e => setBody(e.target.value)}
          className="w-full px-3.5 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed text-slate-800"
        />
      </div>
    </>
  );
};
