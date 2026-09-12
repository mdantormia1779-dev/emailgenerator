'use client';

import React from 'react';
import { Database, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface SettingsSystemInfoCardsProps {
  aiStatus: { isValid: boolean; isConfigured: boolean } | null;
  loadingAi: boolean;
}

export const SettingsSystemInfoCards: React.FC<SettingsSystemInfoCardsProps> = ({
  aiStatus,
  loadingAi,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Security Engine</span>
            <span className="text-sm font-bold text-slate-900">AES-256-GCM Active</span>
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">AI Service Status</span>
            <span className="text-sm font-bold text-slate-900">
              {loadingAi ? 'Checking...' : aiStatus?.isValid ? 'Gemini 1.5 (Verified)' : aiStatus?.isConfigured ? 'Key Error / Reconnect' : 'Key Needed'}
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Database ORM</span>
            <span className="text-sm font-bold text-slate-900">Neon PostgreSQL</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
