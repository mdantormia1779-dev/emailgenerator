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
  Globe,
  Radio,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';

function IntegrationsContent() {
  const searchParams = useSearchParams();
  const [gmailStatus, setGmailStatus] = useState<any | null>(null);
  const [metaStatus, setMetaStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [metaActionLoading, setMetaActionLoading] = useState(false);
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
    } else if (searchParams?.get('meta_connected')) {
      setFeedback({
        type: 'success',
        message: `Successfully connected Meta / Facebook account: ${searchParams.get('name') || ''}`,
      });
    } else if (searchParams?.get('meta_error')) {
      setFeedback({
        type: 'error',
        message: `Meta OAuth error: ${searchParams.get('meta_error')}`,
      });
    }
  }, [searchParams]);

  const fetchStatuses = async () => {
    try {
      const [gmailRes, metaRes] = await Promise.all([
        fetch('/api/integrations/gmail/status'),
        fetch('/api/integrations/meta/status'),
      ]);

      const gmailJson = await gmailRes.json();
      if (gmailJson.success) {
        setGmailStatus(gmailJson.data);
      }

      const metaJson = await metaRes.json();
      if (metaJson.success) {
        setMetaStatus(metaJson.data);
      }
    } catch (err) {
      console.error('Failed to check integration statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // --- Gmail OAuth Handlers ---
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
        fetchStatuses();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to disconnect account.' });
    } finally {
      setActionLoading(false);
    }
  };

  // --- Meta / Facebook OAuth Handlers ---
  const handleConnectMeta = async () => {
    setMetaActionLoading(true);
    try {
      const res = await fetch('/api/integrations/meta/connect');
      const json = await res.json();
      if (json.success && json.authUrl) {
        window.location.href = json.authUrl;
      } else {
        throw new Error(json.error || 'Failed to initiate Meta OAuth');
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error connecting to Meta OAuth. Verify META_APP_ID in .env.',
      });
      setMetaActionLoading(false);
    }
  };

  const handleDisconnectMeta = async () => {
    if (!confirm('Are you sure you want to disconnect your Meta / Facebook account?')) return;
    setMetaActionLoading(true);
    try {
      const res = await fetch('/api/integrations/meta/disconnect', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: 'Meta account disconnected successfully.' });
        fetchStatuses();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to disconnect Meta account.' });
    } finally {
      setMetaActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Service Integrations
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Connect your authorized accounts to discover developer jobs and dispatch reviewed applications safely.
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
              <li><strong>Explicit Confirmation Only:</strong> The system will <em>never</em> dispatch an email autonomously. Every send requires manual review confirmation.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Meta / Facebook OAuth Integration Card */}
      <Card className="border-blue-100">
        <CardHeader
          title="Meta / Facebook Integration (OAuth 2.0)"
          subtitle="Official Meta Graph API connection for social job discovery, managed Page feeds, and developer opportunities"
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDisconnectMeta}
                    isLoading={metaActionLoading}
                    leftIcon={<Power className="w-3.5 h-3.5 text-rose-500" />}
                  >
                    Disconnect Meta
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleConnectMeta}
                    isLoading={metaActionLoading}
                    disabled={!metaStatus?.isConfigured}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    leftIcon={<Lock className="w-3.5 h-3.5" />}
                  >
                    Connect Facebook
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Meta Policy & API Capabilities Transparency Notice */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-950 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-blue-900">
              <Info className="w-4 h-4 text-blue-600" />
              Meta Platform Policy &amp; Official Capabilities
            </h4>
            <div className="space-y-1.5 text-slate-600 leading-relaxed">
              <p>
                <strong>What is officially supported:</strong> Meta OAuth 2.0 user consent, reading posts from Facebook Pages you manage (<code>pages_read_engagement</code>), and compliant structured job post ingestion.
              </p>
              <p>
                <strong>Meta Platform Restrictions:</strong> In accordance with Meta Platform Terms, global public feed scraping, cookie-stealth bypasses, and automated group crawling without admin app installation are strictly forbidden. All discovered opportunities undergo resume matching and remain in Draft mode until your explicit confirmation.
              </p>
            </div>
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
