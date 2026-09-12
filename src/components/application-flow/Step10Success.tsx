import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, ArrowRight, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Step10Props {
  applicationId: string;
  recipient?: string;
  recipientEmail?: string;
  messageId: string;
  sentAt: string;
  companyName: string;
  jobTitle: string;
}

export const Step10Success: React.FC<Step10Props> = ({
  applicationId,
  recipient,
  recipientEmail,
  messageId,
  sentAt,
  companyName,
  jobTitle,
}) => {
  const displayRecipient = recipientEmail || recipient || '';

  return (
    <Card className="max-w-2xl mx-auto text-center border-emerald-200">
      <CardContent className="p-8 space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Step 10: Application Dispatched &amp; Saved
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">Application Sent Successfully!</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Your customized application for <strong>{jobTitle}</strong> at <strong>{companyName}</strong> has been transmitted via Gmail.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Recipient:</span>
            <span className="text-slate-800 font-bold">{displayRecipient}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Gmail Message ID:</span>
            <span className="text-indigo-600 truncate max-w-xs">{messageId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Sent At:</span>
            <span className="text-slate-700">{new Date(sentAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-800 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span><strong>Duplicate Protection Active:</strong> Accidental re-sending of this application is locked.</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href={`/applications/${applicationId}`}>
            <Button variant="primary" leftIcon={<Briefcase className="w-4 h-4" />}>View Application Detail</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>Return to Dashboard</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
