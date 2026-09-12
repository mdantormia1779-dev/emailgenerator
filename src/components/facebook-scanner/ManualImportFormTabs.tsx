'use client';

import React from 'react';

interface ManualImportFormTabsProps {
  inputTab: 'links' | 'text';
  setInputTab: (tab: 'links' | 'text') => void;
  inputUrlsText: string;
  setInputUrlsText: (val: string) => void;
  pastedContent: string;
  setPastedContent: (val: string) => void;
  pastedUrl: string;
  setPastedUrl: (val: string) => void;
}

export const ManualImportFormTabs: React.FC<ManualImportFormTabsProps> = ({
  inputTab,
  setInputTab,
  inputUrlsText,
  setInputUrlsText,
  pastedContent,
  setPastedContent,
  pastedUrl,
  setPastedUrl,
}) => {
  return (
    <>
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setInputTab('links')}
          className={`pb-2 px-3 font-semibold text-xs border-b-2 transition ${
            inputTab === 'links'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Real URLs / Links
        </button>
        <button
          type="button"
          onClick={() => setInputTab('text')}
          className={`pb-2 px-3 font-semibold text-xs border-b-2 transition ${
            inputTab === 'text'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Paste Scrolled Text
        </button>
      </div>

      {inputTab === 'links' ? (
        <div className="space-y-3">
          <p className="text-slate-600">
            Paste one or multiple <strong>Facebook post URLs</strong> or job links (one per line):
          </p>
          <textarea
            rows={6}
            value={inputUrlsText}
            onChange={e => setInputUrlsText(e.target.value)}
            placeholder={`https://facebook.com/groups/reactjobs/posts/10192837461\nhttps://facebook.com/company/posts/992817263`}
            className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-slate-600">Paste the content of a job post scrolled from Facebook groups:</p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Facebook Post URL (Optional)</label>
            <input
              type="url"
              value={pastedUrl}
              onChange={e => setPastedUrl(e.target.value)}
              placeholder="https://facebook.com/groups/.../posts/..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Post Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={6}
              value={pastedContent}
              onChange={e => setPastedContent(e.target.value)}
              placeholder="Paste job posting text..."
              className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
            />
          </div>
        </div>
      )}
    </>
  );
};
