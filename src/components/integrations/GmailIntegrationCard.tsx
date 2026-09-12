'use client';

import React from 'react';
import { Mail, CheckCircle2, ShieldCheck, Power, Lock } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface GmailIntegrationCardProps {
  gmailStatus: any | null;
  loading: boolean;
  actionLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const GmailIntegrationCard: React.FC<GmailIntegrationCardProps> = ({
  gmailStatus,
  loading,
  actionLoading,
  onConnect,
  onDisconnect,
}) => {
  return (
    <Card className="border-indigo-100">
      <CardHeader
        title="Gmail Integration (OAuth 2.0)"
        subtitle="Send confirmed application emails directly from your verified Google account"
      />
      <CardContent className="space-y-6">
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-indigo-600">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Google Gmail</span>
                  {gmailStatus?.isConnected ? (
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
                  {gmailStatus?.email || 'No account currently connected'}
                </p>
              </div>
            </div>

            <div>
              {gmailStatus?.isConnected ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDisconnect}
                  isLoading={actionLoading}
                  leftIcon={<Power className="w-3.5 h-3.5 text-rose-500" />}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={onConnect}
                  isLoading={actionLoading}
                  leftIcon={<Lock className="w-3.5 h-3.5" />}
                >
                  Connect Gmail
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 space-y-2">
          <h4 className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Security & Privacy Architecture
          </h4>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li><strong>Zero Password Storage:</strong> Authentication uses industry-standard OAuth 2.0 consent tokens.</li>
            <li><strong>Encrypted At Rest:</strong> Access and refresh tokens are encrypted using AES-256-GCM before database storage.</li>
            <li><strong>Server-side Secrets:</strong> Client ID and Client Secret are strictly confined to backend execution.</li>
            <li><strong>Explicit Confirmation Only:</strong> The system will <em>never</em> dispatch an email autonomously.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
