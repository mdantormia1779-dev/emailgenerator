'use client';

import React from 'react';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ScannerPageSelectorProps {
  metaInfo: {
    isConnected: boolean;
    name?: string | null;
    pages?: Array<{ id: string; name: string }>;
  } | null;
  selectedPageId: string;
  setSelectedPageId: (id: string) => void;
}

export const ScannerPageSelector: React.FC<ScannerPageSelectorProps> = ({
  metaInfo,
  selectedPageId,
  setSelectedPageId,
}) => {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <div>
          <span className="font-semibold text-slate-800 block">
            {metaInfo?.isConnected ? `Connected: ${metaInfo.name || 'Meta Account'}` : 'Meta Account Not Connected'}
          </span>
          <span className="text-[11px] text-slate-500">
            {metaInfo?.isConnected
              ? `${metaInfo.pages?.length || 0} Managed Facebook Page(s) available for official scanning`
              : 'Connect your Meta account in Integrations to enable automated page scans'}
          </span>
        </div>
      </div>

      {metaInfo?.isConnected && metaInfo.pages && metaInfo.pages.length > 0 ? (
        <div className="flex items-center gap-2">
          <label htmlFor="page-select" className="text-slate-600 font-medium whitespace-nowrap">
            Target Page:
          </label>
          <select
            id="page-select"
            value={selectedPageId}
            onChange={e => setSelectedPageId(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">All Managed Pages ({metaInfo.pages.length})</option>
            {metaInfo.pages.map(page => (
              <option key={page.id} value={page.id}>
                {page.name}
              </option>
            ))}
          </select>
        </div>
      ) : !metaInfo?.isConnected ? (
        <Link href="/integrations">
          <Button size="sm" variant="outline">
            Connect Meta in Integrations
          </Button>
        </Link>
      ) : (
        <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
          No managed Pages found on this Meta account. Use manual import below.
        </span>
      )}
    </div>
  );
};
