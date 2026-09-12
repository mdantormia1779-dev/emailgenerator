'use client';

import React from 'react';
import { ScanStep, SCAN_STEP_LABELS } from '@/hooks/useFacebookScannerWorkflow';

export const ScanStepProgress: React.FC<{ scanStep: ScanStep }> = ({ scanStep }) => {
  return (
    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-2">
      <div className="flex items-center justify-between font-semibold">
        <span>Automated Discovery in Progress:</span>
        <span className="text-blue-700 font-mono uppercase">{SCAN_STEP_LABELS[scanStep]}</span>
      </div>
      <div className="flex items-center gap-1 w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{
            width:
              scanStep === 'scanning'
                ? '20%'
                : scanStep === 'searching'
                ? '40%'
                : scanStep === 'fetching_next_page'
                ? '60%'
                : scanStep === 'matching_jobs'
                ? '80%'
                : scanStep === 'removing_duplicates'
                ? '95%'
                : '100%',
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-blue-600">
        <span>Scanning</span>
        <span>Searching Sources</span>
        <span>Pagination/Cursors</span>
        <span>Resume Matching</span>
        <span>Deduplication</span>
      </div>
    </div>
  );
};
