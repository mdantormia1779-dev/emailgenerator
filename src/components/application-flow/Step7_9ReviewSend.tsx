import React, { useState } from 'react';
import {
  ShieldAlert,
  Send,
  Mail,
  User,
  Paperclip,
  CheckSquare,
  Square,
  ArrowLeft,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface ReviewSendProps {
  recipient: string;
  senderGmail: string;
  subject: string;
  body: string;
  attachmentName: string | null;
  onSend: (confirmations: {
    reviewedRecipient: boolean;
    reviewedEmail: boolean;
    reviewedAttachment: boolean;
    confirmSend: boolean;
  }) => void;
  onBackToEdit: () => void;
  isSending: boolean;
  sendError: string | null;
}

export const Step7_9ReviewSend: React.FC<ReviewSendProps> = ({
  recipient,
  senderGmail,
  subject,
  body,
  attachmentName,
  onSend,
  onBackToEdit,
  isSending,
  sendError,
}) => {
  // The 4 mandatory explicit confirmation checkboxes
  const [reviewedRecipient, setReviewedRecipient] = useState(false);
  const [reviewedEmail, setReviewedEmail] = useState(false);
  const [reviewedAttachment, setReviewedAttachment] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);

  // All 4 MUST be true to enable the Send button
  const allConfirmed =
    reviewedRecipient && reviewedEmail && reviewedAttachment && confirmSend;

  const handleSendClick = () => {
    if (!allConfirmed) return;
    onSend({
      reviewedRecipient,
      reviewedEmail,
      reviewedAttachment,
      confirmSend,
    });
  };

  return (
    <Card className="max-w-3xl mx-auto border-indigo-200">
      <CardHeader
        title="Step 7 & 8: Review & Explicit Confirmation"
        subtitle="MANDATORY SAFETY REVIEW: Verify all outbound email fields and provide explicit confirmation before dispatch."
      />
      <CardContent className="space-y-6">
        {sendError && <Alert type="error" message={sendError} />}

        {/* Dispatch Preview Box */}
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
          {/* Header metadata */}
          <div className="bg-slate-50/80 p-4 border-b border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1.5 w-24">
                <User className="w-3.5 h-3.5 text-slate-400" />
                From (Gmail):
              </span>
              <span className="font-mono text-slate-800 font-medium flex-1">
                {senderGmail || 'Connected Gmail Account'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1.5 w-24">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                To (Recipient):
              </span>
              <span className="font-mono text-indigo-900 font-bold flex-1 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {recipient}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1.5 w-24">
                Subject:
              </span>
              <span className="font-semibold text-slate-900 flex-1">
                {subject}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1.5 w-24">
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                Attachment:
              </span>
              <span className="text-slate-700 flex-1">
                {attachmentName ? (
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {attachmentName}
                  </span>
                ) : (
                  <span className="text-slate-400 italic">None attached</span>
                )}
              </span>
            </div>
          </div>

          {/* Email Body Preview */}
          <div className="p-5 text-sm whitespace-pre-wrap font-sans text-slate-800 leading-relaxed max-h-72 overflow-y-auto bg-white">
            {body}
          </div>
        </div>

        {/* 4 MANDATORY CONFIRMATION CHECKBOXES */}
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Explicit Confirmation Required
              </h4>
              <p className="text-[11px] text-amber-800">
                You must review and explicitly verify all 4 confirmation statements below. Emails are never sent automatically.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-800 font-medium select-none">
              <input
                type="checkbox"
                checked={reviewedRecipient}
                onChange={e => setReviewedRecipient(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>
                1. <strong>I reviewed the recipient email</strong> (<code className="text-indigo-900 bg-indigo-100/70 px-1 py-0.5 rounded">{recipient}</code>) and confirm it is the intended recipient.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-800 font-medium select-none">
              <input
                type="checkbox"
                checked={reviewedEmail}
                onChange={e => setReviewedEmail(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>
                2. <strong>I reviewed the email subject and body</strong>, and confirm all facts and statements are accurate.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-800 font-medium select-none">
              <input
                type="checkbox"
                checked={reviewedAttachment}
                onChange={e => setReviewedAttachment(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>
                3. <strong>I reviewed the attachment</strong> ({attachmentName || 'no attachment confirmed'}) and approve sending it.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group text-xs text-slate-800 font-medium select-none">
              <input
                type="checkbox"
                checked={confirmSend}
                onChange={e => setConfirmSend(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>
                4. <strong>I want to send this application</strong> via Gmail immediately.
              </span>
            </label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBackToEdit} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Edit Email
        </Button>
        <Button
          onClick={handleSendClick}
          disabled={!allConfirmed}
          isLoading={isSending}
          variant={allConfirmed ? 'success' : 'primary'}
          leftIcon={allConfirmed ? <Send className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        >
          {allConfirmed ? 'SEND APPLICATION VIA GMAIL' : 'Complete 4 Confirmations to Send'}
        </Button>
      </CardFooter>
    </Card>
  );
};
