'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export const SettingsSecurityPoliciesCard: React.FC = () => {
  return (
    <Card>
      <CardHeader
        title="Safe Sending & Anti-Hallucination Policy"
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
  );
};
