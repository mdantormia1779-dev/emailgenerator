import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useIntegrationsWorkflow() {
  const searchParams = useSearchParams();
  const [gmailStatus, setGmailStatus] = useState<any | null>(null);
  const [metaStatus, setMetaStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [metaActionLoading, setMetaActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (searchParams?.get('connected')) {
      setFeedback({ type: 'success', message: `Connected Gmail: ${searchParams.get('email') || ''}` });
    } else if (searchParams?.get('error')) {
      setFeedback({ type: 'error', message: `Gmail OAuth error: ${searchParams.get('error')}` });
    } else if (searchParams?.get('meta_connected')) {
      setFeedback({ type: 'success', message: `Connected Meta: ${searchParams.get('name') || ''}` });
    } else if (searchParams?.get('meta_error')) {
      setFeedback({ type: 'error', message: `Meta OAuth error: ${searchParams.get('meta_error')}` });
    }
  }, [searchParams]);

  const fetchStatuses = async () => {
    try {
      const [gmailRes, metaRes] = await Promise.all([
        fetch('/api/integrations/gmail/status'),
        fetch('/api/integrations/meta/status'),
      ]);
      const gmailJson = await gmailRes.json();
      if (gmailJson.success) setGmailStatus(gmailJson.data);
      const metaJson = await metaRes.json();
      if (metaJson.success) setMetaStatus(metaJson.data);
    } catch (err) {
      console.error('Failed to check integration statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleConnectGmail = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/integrations/gmail/connect');
      const json = await res.json();
      if (json.success && json.authUrl) window.location.href = json.authUrl;
      else throw new Error(json.error || 'Failed to initiate Gmail OAuth');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error connecting to Gmail' });
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
        setFeedback({ type: 'success', message: 'Gmail account disconnected.' });
        fetchStatuses();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to disconnect account.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConnectMeta = async () => {
    setMetaActionLoading(true);
    try {
      const res = await fetch('/api/integrations/meta/connect');
      const json = await res.json();
      if (json.success && json.authUrl) window.location.href = json.authUrl;
      else throw new Error(json.error || 'Failed to initiate Meta OAuth');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error connecting to Meta' });
      setMetaActionLoading(false);
    }
  };

  const handleDisconnectMeta = async () => {
    if (!confirm('Are you sure you want to disconnect Meta?')) return;
    setMetaActionLoading(true);
    try {
      const res = await fetch('/api/integrations/meta/disconnect', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', message: 'Meta account disconnected.' });
        fetchStatuses();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to disconnect Meta.' });
    } finally {
      setMetaActionLoading(false);
    }
  };

  return {
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
  };
}
