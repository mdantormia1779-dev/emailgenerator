'use client';

import React from 'react';
import { CheckCircle2, Power, Lock, Info } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface MetaIntegrationCardProps {
  metaStatus: any | null;
  loading: boolean;
  metaActionLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const MetaIntegrationCard: React.FC<MetaIntegrationCardProps> = ({
  metaStatus,
  loading,
  metaActionLoading,
  onConnect,
  onDisconnect,
}) => {
  return (
    <Card className="border-blue-100">
      <CardHeader
        title="Meta / Facebook Integration (OAuth 2.0)"
        subtitle="Official Meta Graph API connection for social job discovery and developer opportunities"
      />
      <CardContent className="space-y-6">
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-blue-600 font-extrabold text-xl">
                f
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Meta / Facebook</span>
                  {metaStatus?.isConnected ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                      Disconnected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {metaStatus?.isConnected
                    ? `${metaStatus.name || 'Facebook User'} (${metaStatus.email || 'OAuth Token Active'})`
                    : metaStatus?.isConfigured
                    ? 'Ready to connect'
                    : 'META_APP_ID not configured in .env'}
                </p>
              </div>
            </div>

            <div>
              {metaStatus?.isConnected ? (
                <Button size="sm" variant="outline" onClick={onDisconnect} isLoading={metaActionLoading} leftIcon={<Power className="w-3.5 h-3.5 text-rose-500" />}>
                  Disconnect Meta
                </Button>
              ) : (
                <Button size="sm" onClick={onConnect} isLoading={metaActionLoading} disabled={!metaStatus?.isConfigured} className="bg-blue-600 hover:bg-blue-700 text-white" leftIcon={<Lock className="w-3.5 h-3.5" />}>
                  Connect Facebook
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-950 space-y-2">
          <h4 className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-blue-900">
            <Info className="w-4 h-4 text-blue-600" />
            Meta Platform Policy & Official Capabilities
          </h4>
          <p className="text-slate-600 leading-relaxed">
            <strong>Supported:</strong> Meta OAuth 2.0 user consent, reading posts from Facebook Pages you manage (<code>pages_read_engagement</code>), and compliant job post ingestion. Global feed scraping without consent is forbidden.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
