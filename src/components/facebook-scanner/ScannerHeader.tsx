'use client';

import React from 'react';
import { Globe, RefreshCw, CheckCircle2, Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ScanStep, SCAN_STEP_LABELS } from '@/hooks/useFacebookScannerWorkflow';

interface ScannerHeaderProps {
  scanStep: ScanStep;
  isScanningActive: boolean;
  onScan: () => void;
  onOpenImport: () => void;
}

export const ScannerHeader: React.FC<ScannerHeaderProps> = ({
  scanStep,
  isScanningActive,
  onScan,
  onOpenImport,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-md">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> Meta Job Discovery
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Meta-supported Page Job Scanner</h1>
        <p className="text-blue-200 text-xs mt-1 max-w-xl">
          Officially compliant job discovery from connected Facebook Pages using Meta Graph API with cursor pagination.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="md"
          onClick={onScan}
          disabled={isScanningActive}
          className={`font-semibold text-xs shadow transition-all ${
            isScanningActive
              ? 'bg-amber-600 text-white'
              : scanStep === 'complete'
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
          leftIcon={
            isScanningActive ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : scanStep === 'complete' ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )
          }
        >
          {SCAN_STEP_LABELS[scanStep]}
        </Button>

        <Button
          size="md"
          variant="outline"
          onClick={onOpenImport}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Import a Facebook Job Link/Post manually
        </Button>
      </div>
    </div>
  );
};
