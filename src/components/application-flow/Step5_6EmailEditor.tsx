import React, { useState } from 'react';
import {
  Sparkles,
  Paperclip,
  RotateCcw,
  Save,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface EmailEditorProps {
  recipient: string;
  setRecipient: (val: string) => void;
  subject: string;
  setSubject: (val: string) => void;
  body: string;
  setBody: (val: string) => void;
  resumes: any[];
  selectedResumeId: string | null;
  setSelectedResumeId: (val: string | null) => void;
  onRegenerate: () => void;
  onSaveDraft: () => void;
  onContinueToReview: () => void;
  onBack: () => void;
  isRegenerating: boolean;
  isSavingDraft: boolean;
}

export const Step5_6EmailEditor: React.FC<EmailEditorProps> = ({
  recipient,
  setRecipient,
  subject,
  setSubject,
  body,
  setBody,
  resumes,
  selectedResumeId,
  setSelectedResumeId,
  onRegenerate,
  onSaveDraft,
  onContinueToReview,
  onBack,
  isRegenerating,
  isSavingDraft,
}) => {
  const [draftSavedAlert, setDraftSavedAlert] = useState(false);
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

  const handleSaveDraftClick = async () => {
    await onSaveDraft();
    setDraftSavedAlert(true);
    setTimeout(() => setDraftSavedAlert(false), 3000);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader
        title="Step 5 & 6: Email Generation & Editor"
        subtitle="Review, polish, and edit the factual tailored email. Attach your resume before proceeding to review."
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onRegenerate}
              isLoading={isRegenerating}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Regenerate
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSaveDraftClick}
              isLoading={isSavingDraft}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Draft
            </Button>
          </div>
        }
      />
      <CardContent className="space-y-4">
        {draftSavedAlert && (
          <Alert type="success" message="Draft successfully saved! You can resume anytime." />
        )}

        {/* Recipient Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Recipient Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            placeholder="recruiter@company.com"
            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>

        {/* Subject Line Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Subject Line <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Application for Senior Full Stack Engineer - Alex Morgan"
            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
          />
        </div>

        {/* Email Body Editor */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Email Body <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-xs ${
                wordCount >= 140 && wordCount <= 260
                  ? 'text-emerald-600 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              {wordCount} words (Target: 150-250 words)
            </span>
          </div>
          <textarea
            rows={13}
            value={body}
            onChange={e => setBody(e.target.value)}
            className="w-full px-3.5 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed text-slate-800"
          />
        </div>

        {/* Resume Attachment Selector */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <Paperclip className="w-4 h-4 text-slate-600" />
            Resume Attachment
          </label>
          {resumes.length === 0 ? (
            <p className="text-xs text-slate-500">
              No resumes uploaded yet. You can upload one under the <strong>Resumes</strong> section or proceed without attachment.
            </p>
          ) : (
            <select
              value={selectedResumeId || ''}
              onChange={e => setSelectedResumeId(e.target.value || null)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">-- No resume attached --</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.originalName} ({(r.fileSize / 1024).toFixed(0)} KB){r.isDefault ? ' - Default' : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        <Button
          onClick={onContinueToReview}
          disabled={!recipient || !subject || !body.trim()}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Continue to Review &rarr;
        </Button>
      </CardFooter>
    </Card>
  );
};
