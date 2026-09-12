'use client';

import React, { useState } from 'react';
import { Key, Sparkles, CheckCircle2, XCircle, Eye, EyeOff, Radio, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SettingsApiKeyCardProps {
  aiStatus: { isConfigured: boolean; isValid: boolean; maskedKey: string | null; model: string; testError?: string } | null;
  loadingAi: boolean;
  onSaveKey: (key: string) => Promise<void>;
  savingKey: boolean;
}

export const SettingsApiKeyCard: React.FC<SettingsApiKeyCardProps> = ({ aiStatus, loadingAi, onSaveKey, savingKey }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    await onSaveKey(apiKeyInput.trim());
    setApiKeyInput('');
  };

  return (
    <Card>
      <CardHeader title="Google Gemini AI Engine (Real API)" subtitle="Configure your official Gemini API Key for zero-hallucination analysis" />
      <CardContent className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Current API Key Status:</span>
              <span className="text-xs text-slate-500">
                {loadingAi ? 'Checking status...' : aiStatus?.isConfigured ? (
                  aiStatus.isValid ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Connected & Live ({aiStatus.maskedKey}) • Model: {aiStatus.model}
                    </span>
                  ) : (
                    <span className="text-rose-700 font-semibold flex items-center gap-1.5 mt-0.5">
                      <XCircle className="w-4 h-4 text-rose-600" /> Key validation failed ({aiStatus.testError || 'Check quota'})
                    </span>
                  )
                ) : (
                  <span className="text-amber-700 font-medium flex items-center gap-1.5 mt-0.5">
                    <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> No API Key set. Enter key below.
                  </span>
                )}
              </span>
            </div>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
              <span>Get API Key from Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <form onSubmit={handleSubmit} className="pt-2 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Enter / Update Gemini API Key:</label>
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
                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" isLoading={savingKey} disabled={!apiKeyInput.trim()} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                Validate & Save Gemini Key
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
