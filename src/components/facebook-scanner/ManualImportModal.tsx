'use client';

import React from 'react';
import { AlertCircle, Play } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ManualImportFormTabs } from './ManualImportFormTabs';

interface ManualImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputTab: 'links' | 'text';
  setInputTab: (tab: 'links' | 'text') => void;
  inputUrlsText: string;
  setInputUrlsText: (val: string) => void;
  pastedContent: string;
  setPastedContent: (val: string) => void;
  pastedUrl: string;
  setPastedUrl: (val: string) => void;
  isIngesting: boolean;
  onIngest: () => void;
}

export const ManualImportModal: React.FC<ManualImportModalProps> = ({
  isOpen,
  onClose,
  inputTab,
  setInputTab,
  inputUrlsText,
  setInputUrlsText,
  pastedContent,
  setPastedContent,
  pastedUrl,
  setPastedUrl,
  isIngesting,
  onIngest,
}) => {
  const isSubmitDisabled = inputTab === 'links' ? !inputUrlsText.trim() : !pastedContent.trim();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import a Facebook Job Link/Post manually">
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-semibold">Compliant Manual Ingestion:</strong>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              Meta Graph API v26.0 does not permit automated scraping of personal feeds or private groups. Use this manual tool to paste job URLs or post texts you have discovered.
            </p>
          </div>
        </div>

        <ManualImportFormTabs
          inputTab={inputTab}
          setInputTab={setInputTab}
          inputUrlsText={inputUrlsText}
          setInputUrlsText={setInputUrlsText}
          pastedContent={pastedContent}
          setPastedContent={setPastedContent}
          pastedUrl={pastedUrl}
          setPastedUrl={setPastedUrl}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            isLoading={isIngesting}
            disabled={isSubmitDisabled}
            onClick={onIngest}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
          >
            Process & Score Jobs
          </Button>
        </div>
      </div>
    </Modal>
  );
};
