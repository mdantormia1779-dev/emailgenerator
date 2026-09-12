'use client';

import React from 'react';
import { Step1PasteJob } from './Step1PasteJob';
import { Step3ReviewJob } from './Step3ReviewJob';
import { Step4MatchScore } from './Step4MatchScore';
import { Step5_6EmailEditor } from './Step5_6EmailEditor';
import { Step7_9ReviewSend } from './Step7_9ReviewSend';
import { Step10Success } from './Step10Success';
import { StepLoadingIndicator } from './StepLoadingIndicator';

export const ApplicationStepRenderer: React.FC<{ wf: any }> = ({ wf }) => {
  const selectedResume = wf.resumes.find((r: any) => r.id === wf.selectedResumeId);

  if (wf.currentStep === 1) {
    return (
      <Step1PasteJob
        jobDescription={wf.jobDescription}
        jobUrl={wf.jobUrl}
        setJobDescription={wf.setJobDescription}
        setJobUrl={wf.setJobUrl}
        onAnalyze={wf.handleAnalyzeJob}
        isLoading={wf.isAnalyzing}
      />
    );
  }
  if (wf.currentStep === 2) {
    return <StepLoadingIndicator title="Analyzing Job Posting..." description="Extracting requirements, skills, and recipient emails..." />;
  }
  if (wf.currentStep === 3 && wf.analysisResult) {
    return (
      <Step3ReviewJob
        jobAnalysis={wf.analysisResult}
        selectedEmail={wf.selectedRecipientEmail}
        setSelectedEmail={wf.setSelectedRecipientEmail}
        customRecipientEmail={wf.customRecipientEmail}
        setCustomRecipientEmail={wf.setCustomRecipientEmail}
        onContinue={wf.handleCalculateMatch}
        onBack={() => wf.setCurrentStep(1)}
      />
    );
  }
  if (wf.currentStep === 4 && wf.matchBreakdown) {
    return <Step4MatchScore matchBreakdown={wf.matchBreakdown} onContinue={wf.handleGenerateEmail} onBack={() => wf.setCurrentStep(3)} isLoading={wf.isGeneratingEmail} />;
  }
  if (wf.currentStep === 5) {
    return <StepLoadingIndicator title="Generating Factual Tailored Email..." description="Grounded in your real profile facts. Strictly zero hallucination..." />;
  }
  if (wf.currentStep === 6) {
    return (
      <Step5_6EmailEditor
        recipient={wf.effectiveRecipient}
        setRecipient={(val: string) => { wf.setSelectedRecipientEmail('custom'); wf.setCustomRecipientEmail(val); }}
        subject={wf.emailSubject}
        setSubject={wf.setEmailSubject}
        body={wf.emailBody}
        setBody={wf.setEmailBody}
        resumes={wf.resumes}
        selectedResumeId={wf.selectedResumeId}
        setSelectedResumeId={wf.setSelectedResumeId}
        onRegenerate={wf.handleGenerateEmail}
        onSaveDraft={() => wf.saveDraftApplication()}
        onContinueToReview={wf.handleContinueToReview}
        onBack={() => wf.setCurrentStep(4)}
        isRegenerating={wf.isGeneratingEmail}
        isSavingDraft={wf.isSavingDraft}
      />
    );
  }
  if (wf.currentStep === 7 || wf.currentStep === 9) {
    return (
      <Step7_9ReviewSend
        recipient={wf.effectiveRecipient}
        senderGmail={wf.senderGmail}
        subject={wf.emailSubject}
        body={wf.emailBody}
        attachmentName={selectedResume?.originalName || null}
        onSend={wf.handleSendApplication}
        onBackToEdit={() => wf.setCurrentStep(6)}
        isSending={wf.isSending}
        sendError={wf.sendError}
      />
    );
  }
  if (wf.currentStep === 10 && wf.sendSuccessData) {
    return (
      <Step10Success
        companyName={wf.analysisResult?.companyName || 'Employer'}
        jobTitle={wf.analysisResult?.jobTitle || 'Role'}
        recipient={wf.effectiveRecipient}
        messageId={wf.sendSuccessData.messageId}
        sentAt={wf.sendSuccessData.sentAt}
        applicationId={wf.applicationId}
      />
    );
  }
  return null;
};
