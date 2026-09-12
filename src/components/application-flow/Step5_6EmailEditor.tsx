import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { EmailEditorToolbar } from './EmailEditorToolbar';
import { EmailFieldsEditor } from './EmailFieldsEditor';
import { ResumeAttachmentSelector } from './ResumeAttachmentSelector';

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

export const Step5_6EmailEditor: React.FC<EmailEditorProps> = (props) => {
  const [draftSavedAlert, setDraftSavedAlert] = useState(false);

  const handleSaveDraftClick = async () => {
    await props.onSaveDraft();
    setDraftSavedAlert(true);
    setTimeout(() => setDraftSavedAlert(false), 3000);
  };

  const isContinueDisabled = !props.recipient || !props.subject || !props.body.trim();

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader
        title="Step 5 & 6: Email Generation & Editor"
        subtitle="Review, polish, and edit the factual tailored email. Attach your resume before proceeding to review."
        action={
          <EmailEditorToolbar
            onRegenerate={props.onRegenerate}
            onSaveDraft={handleSaveDraftClick}
            isRegenerating={props.isRegenerating}
            isSavingDraft={props.isSavingDraft}
          />
        }
      />
      <CardContent className="space-y-4">
        {draftSavedAlert && <Alert type="success" message="Draft successfully saved! You can resume anytime." />}
        <EmailFieldsEditor
          recipient={props.recipient}
          setRecipient={props.setRecipient}
          subject={props.subject}
          setSubject={props.setSubject}
          body={props.body}
          setBody={props.setBody}
        />
        <ResumeAttachmentSelector
          resumes={props.resumes}
          selectedResumeId={props.selectedResumeId}
          setSelectedResumeId={props.setSelectedResumeId}
        />
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={props.onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
        <Button onClick={props.onContinueToReview} disabled={isContinueDisabled} rightIcon={<ArrowRight className="w-4 h-4" />}>
          Continue to Review &rarr;
        </Button>
      </CardFooter>
    </Card>
  );
};
