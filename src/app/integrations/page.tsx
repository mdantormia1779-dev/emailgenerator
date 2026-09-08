'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Power,
  Lock,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';

function IntegrationsContent() {
  const searchParams = useSearchParams();
  const [gmailStatus, setGmailStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Check url params for OAuth return
    if (searchParams?.get('connected')) {
      setFeedback({
        type: 'success',
        message: `Successfully connected Gmail account: ${searchParams.get('email') || ''}`,
      });
    } else if (searchParams?.get('error')) {
      setFeedback({
        type: 'error',
        message: `Gmail OAuth authorization error: ${searchParams.get('error')}`,
      });
    }
  }, [searchParams]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/integrations/gmail/status');
      const json = await res.json();
      if (json.success) {
        setGmailStatus(json.data);
      }
    } catch (err) {
      console.error('Failed to check Gmail status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnectGmail = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/integrations/gmail/connect');
      const json = await res.json();
      if (json.success && json.authUrl) {
        window.location.href = json.authUrl;
      } else {
        throw new Error(json.error || 'Failed to initiate Gmail OAuth');
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error connecting to Google OAuth service. Please verify your client credentials.',
      });
      setActionLoading(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!confirm('Are you sure you want to disconnect your Gmail integration?')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/integrations/gmail/disconnect', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: 'Gmail account successfully disconnected.' });
        fetchStatus();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to disconnect account.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Service Integrations
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Connect your authorized email accounts to safely dispatch reviewed job applications.
        </p>
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Gmail OAuth Integration Card */}
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
                    onClick={handleDisconnectGmail}
                    isLoading={actionLoading}
                    leftIcon={<Power className="w-3.5 h-3.5 text-rose-500" />}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleConnectGmail}
                    isLoading={actionLoading}
                    leftIcon={<Lock className="w-3.5 h-3.5" />}
                  >
                    Connect Gmail
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Security & Architecture Guarantees */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Security &amp; Privacy Architecture
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>Zero Password Storage:</strong> Authentication uses industry-standard OAuth 2.0 consent tokens.</li>
              <li><strong>Encrypted At Rest:</strong> Access and refresh tokens are encrypted using AES-256-GCM before database storage.</li>
              <li><strong>Server-side Secrets:</strong> Client ID and Client Secret are strictly confined to backend execution and never exposed to the client.</li>
              <li><strong>Explicit Confirmation Only:</strong> The system will <em>never</em> dispatch an email autonomously. Every send requires all 4 manual review confirmations.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="p-12"><Skeleton className="h-48 w-full" /></div>}>
      <IntegrationsContent />
    </Suspense>
  );
}
