'use client';

import React, { Suspense } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { GmailIntegrationCard } from '@/components/integrations/GmailIntegrationCard';
import { MetaIntegrationCard } from '@/components/integrations/MetaIntegrationCard';
import { useIntegrationsWorkflow } from '@/hooks/useIntegrationsWorkflow';

function IntegrationsContent() {
  const {
    gmailStatus,
    metaStatus,
    loading,
    actionLoading,
    metaActionLoading,
    feedback,
    setFeedback,
    handleConnectGmail,
    handleDisconnectGmail,
    handleConnectMeta,
    handleDisconnectMeta,
  } = useIntegrationsWorkflow();

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Service Integrations</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Connect your authorized accounts to discover developer jobs and dispatch reviewed applications safely.
        </p>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} />}

      <GmailIntegrationCard
        gmailStatus={gmailStatus}
        loading={loading}
        actionLoading={actionLoading}
        onConnect={handleConnectGmail}
        onDisconnect={handleDisconnectGmail}
      />

      <MetaIntegrationCard
        metaStatus={metaStatus}
        loading={loading}
        metaActionLoading={metaActionLoading}
        onConnect={handleConnectMeta}
        onDisconnect={handleDisconnectMeta}
      />
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
