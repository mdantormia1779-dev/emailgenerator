import React, { useState } from 'react';
import { Send, ArrowLeft, Lock } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { DispatchPreviewCard } from './DispatchPreviewCard';
import { SendSafetyCheckboxes } from './SendSafetyCheckboxes';

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

export const Step7_9ReviewSend: React.FC<ReviewSendProps> = (props) => {
  const [reviewedRecipient, setReviewedRecipient] = useState(false);
  const [reviewedEmail, setReviewedEmail] = useState(false);
  const [reviewedAttachment, setReviewedAttachment] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);

  const allConfirmed = reviewedRecipient && reviewedEmail && reviewedAttachment && confirmSend;

  const handleSendClick = () => {
    if (!allConfirmed) return;
    props.onSend({ reviewedRecipient, reviewedEmail, reviewedAttachment, confirmSend });
  };

  return (
    <Card className="max-w-3xl mx-auto border-indigo-200">
      <CardHeader
        title="Step 7 & 8: Review & Explicit Confirmation"
        subtitle="MANDATORY SAFETY REVIEW: Verify all outbound email fields and provide explicit confirmation before dispatch."
      />
      <CardContent className="space-y-6">
        {props.sendError && <Alert type="error" message={props.sendError} />}
        <DispatchPreviewCard
          senderGmail={props.senderGmail}
          recipient={props.recipient}
          subject={props.subject}
          attachmentName={props.attachmentName}
          body={props.body}
        />
        <SendSafetyCheckboxes
          recipient={props.recipient}
          attachmentName={props.attachmentName}
          reviewedRecipient={reviewedRecipient}
          setReviewedRecipient={setReviewedRecipient}
          reviewedEmail={reviewedEmail}
          setReviewedEmail={setReviewedEmail}
          reviewedAttachment={reviewedAttachment}
          setReviewedAttachment={setReviewedAttachment}
          confirmSend={confirmSend}
          setConfirmSend={setConfirmSend}
        />
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={props.onBackToEdit} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Edit Email
        </Button>
        <Button
          variant="primary"
          onClick={handleSendClick}
          disabled={!allConfirmed}
          isLoading={props.isSending}
          leftIcon={allConfirmed ? <Send className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          className={allConfirmed ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          {allConfirmed ? 'Confirm & Send Application Now' : 'Check All 4 Boxes to Unlock Send'}
        </Button>
      </CardFooter>
    </Card>
  );
};
