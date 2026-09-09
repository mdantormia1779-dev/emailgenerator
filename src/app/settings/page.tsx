'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Key,
  Database,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function SettingsPage() {
  const [aiStatus, setAiStatus] = useState<{
    isConfigured: boolean;
    isValid: boolean;
    maskedKey: string | null;
    model: string;
    testError?: string;
  } | null>(null);

  const [loadingAi, setLoadingAi] = useState(true);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
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

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setSavingKey(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/settings/ai-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save Gemini API key');
      }

      setFeedback({ type: 'success', message: json.message });
      setApiKeyInput('');
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
          System Settings &amp; Real API Configuration
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Manage your Gemini AI credentials, verify live connectivity, and review security policies.
        </p>
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* System Health / Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Security Engine
              </span>
              <span className="text-sm font-bold text-slate-900">
                AES-256-GCM Active
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              aiStatus?.isValid ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                AI Service Status
              </span>
              <span className="text-sm font-bold text-slate-900">
                {loadingAi
                  ? 'Checking...'
                  : aiStatus?.isValid
                  ? 'Gemini 1.5 (Verified)'
                  : aiStatus?.isConfigured
                  ? 'Key Error / Reconnect'
                  : 'Key Needed'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Database ORM
              </span>
              <span className="text-sm font-bold text-slate-900">
                Neon PostgreSQL
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Real Gemini AI API Configuration Card */}
      <Card>
        <CardHeader
          title="Google Gemini AI Engine (Real API)"
          subtitle="Configure your official Gemini API Key for zero-hallucination job analysis and personalized email generation"
        />
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Current API Key Status:</span>
                <span className="text-xs text-slate-500">
                  {loadingAi ? (
                    'Checking status...'
                  ) : aiStatus?.isConfigured ? (
                    aiStatus.isValid ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Connected &amp; Live ({aiStatus.maskedKey}) • Model: {aiStatus.model}
                      </span>
                    ) : (
                      <span className="text-rose-700 font-semibold flex items-center gap-1.5 mt-0.5">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Key Configured but validation failed ({aiStatus.testError || 'Check quota or permissions'})
                      </span>
                    )
                  ) : (
                    <span className="text-amber-700 font-medium flex items-center gap-1.5 mt-0.5">
                      <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      No API Key set. Enter your key below to activate live Gemini AI.
                    </span>
                  )}
                </span>
              </div>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                <span>Get API Key from Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <form onSubmit={handleSaveApiKey} className="pt-2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enter / Update Gemini API Key:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  isLoading={savingKey}
                  disabled={!apiKeyInput.trim()}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Validate &amp; Save Gemini Key
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Security Policies */}
      <Card>
        <CardHeader
          title="Safe Sending &amp; Anti-Hallucination Policy"
          subtitle="Non-negotiable core invariants built into the system"
        />
        <CardContent className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              1. Strict Human-in-the-Loop Confirmation
            </h4>
            <p className="text-slate-600">
              The backend endpoint <code>POST /api/applications/:id/send</code> strictly validates that <strong>4 separate confirmation flags</strong> (reviewed recipient, reviewed email, reviewed attachment, confirm send) are explicitly set to true. Any request with false or missing confirmations is instantly rejected with HTTP 400.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              2. Zero-Hallucination Email Synthesis
            </h4>
            <p className="text-slate-600">
              The AI prompt is locked to factual profile data only. It is explicitly instructed never to invent employers, projects, years of experience, or certifications, and never to claim missing skills that are not present in your documented profile.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              3. Duplicate Send Blockade
            </h4>
            <p className="text-slate-600">
              Once an application has status <code>SENT</code>, the server enforces an atomic idempotency lock. Resending via the same application record is permanently disabled to safeguard against accidental repeated submissions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
