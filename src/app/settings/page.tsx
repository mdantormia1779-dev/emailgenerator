'use client';

import React, { useState } from 'react';
import {
  Settings,
  Key,
  Database,
  Lock,
  Sparkles,
  Server,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          System Settings &amp; Architecture
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Configuration overview, security policies, and environment status.
        </p>
      </div>

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
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                AI Service
              </span>
              <span className="text-sm font-bold text-slate-900">
                Gemini 1.5 + Fallback
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
                Prisma + PostgreSQL
              </span>
            </div>
          </div>
        </Card>
      </div>

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
