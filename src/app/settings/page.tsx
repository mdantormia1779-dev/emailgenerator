'use client';

import React, { useEffect, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { SettingsSystemInfoCards } from '@/components/settings/SettingsSystemInfoCards';
import { SettingsApiKeyCard } from '@/components/settings/SettingsApiKeyCard';
import { SettingsSecurityPoliciesCard } from '@/components/settings/SettingsSecurityPoliciesCard';

export default function SettingsPage() {
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(true);
  const [savingKey, setSavingKey] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadAiStatus = async () => {
    try {
      const res = await fetch('/api/settings/ai-key');
      const json = await res.json();
      if (json.success && json.data) {
        setAiStatus(json.data);
      }
    } catch (err) {
      console.error('Failed to load AI status:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    loadAiStatus();
  }, []);

  const handleSaveApiKey = async (apiKey: string) => {
    setSavingKey(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings/ai-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save Gemini API key');
      setFeedback({ type: 'success', message: json.message });
      loadAiStatus();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error saving API key' });
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          System Settings & Real API Configuration
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Manage your Gemini AI credentials, verify live connectivity, and review security policies.
        </p>
      </div>

      {feedback && (
        <Alert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} />
      )}

      <SettingsSystemInfoCards aiStatus={aiStatus} loadingAi={loadingAi} />

      <SettingsApiKeyCard
        aiStatus={aiStatus}
        loadingAi={loadingAi}
        onSaveKey={handleSaveApiKey}
        savingKey={savingKey}
      />

      <SettingsSecurityPoliciesCard />
    </div>
  );
}
