'use client';

import React, { useState, useEffect } from 'react';
import { Stepper } from '@/components/application-flow/Stepper';
import { Step1PasteJob } from '@/components/application-flow/Step1PasteJob';
import { Step3ReviewJob } from '@/components/application-flow/Step3ReviewJob';
import { Step4MatchScore } from '@/components/application-flow/Step4MatchScore';
import { Step5_6EmailEditor } from '@/components/application-flow/Step5_6EmailEditor';
import { Step7_9ReviewSend } from '@/components/application-flow/Step7_9ReviewSend';
import { Step10Success } from '@/components/application-flow/Step10Success';
import { Alert } from '@/components/ui/Alert';
import { Loader2 } from 'lucide-react';
import { JobAnalysisResult, MatchBreakdown, GeneratedEmail } from '@/types';

export default function NewApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Workflow State
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<JobAnalysisResult | null>(null);

  // Recipient selection
  const [selectedRecipientEmail, setSelectedRecipientEmail] = useState('');
  const [customRecipientEmail, setCustomRecipientEmail] = useState('');

  // Match State
  const [matchBreakdown, setMatchBreakdown] = useState<MatchBreakdown | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  // Email Generation & Editing
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Resumes
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  // Application ID in DB
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // Gmail Sender Account Info
  const [senderGmail, setSenderGmail] = useState<string>('');

  // Sending State
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccessData, setSendSuccessData] = useState<{
    messageId: string;
    sentAt: string;
  } | null>(null);

  // General error banner
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Load Resumes & Gmail Account Status on Mount
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [resumesRes, gmailRes] = await Promise.all([
          fetch('/api/resumes'),
          fetch('/api/integrations/gmail/status'),
        ]);

        const resumesJson = await resumesRes.json();
        if (resumesJson.success && resumesJson.data) {
          setResumes(resumesJson.data);
          const defaultResume = resumesJson.data.find((r: any) => r.isDefault);
          if (defaultResume) {
            setSelectedResumeId(defaultResume.id);
          }
        }

        const gmailJson = await gmailRes.json();
        if (gmailJson.success && gmailJson.data) {
          setSenderGmail(gmailJson.data.email || 'Connected Gmail');
        }
      } catch (err) {
        console.warn('Initial data load warning:', err);
      }
    }
    fetchInitialData();
  }, []);

  // Step 2: Trigger Job Analysis
  const handleAnalyzeJob = async () => {
    setIsAnalyzing(true);
    setGeneralError(null);
    setCurrentStep(2); // Step 2 is Analysis in progress

    try {
      const res = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, jobUrl: jobUrl || null }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to analyze job description.');
      }

      const analysis: JobAnalysisResult = json.data;
      setAnalysisResult(analysis);

      // Pre-select first email if available
      if (analysis.recipientEmails && analysis.recipientEmails.length > 0) {
        setSelectedRecipientEmail(analysis.recipientEmails[0]);
      } else {
        setSelectedRecipientEmail('custom');
      }

      // Transition to Step 3: Review Job
      setCurrentStep(3);
    } catch (err: any) {
      setGeneralError(err.message || 'Unable to analyze job description. Please try again.');
      setCurrentStep(1);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Transition from Step 3 to Step 4: Calculate Match Score
  const handleCalculateMatch = async () => {
    if (!analysisResult) return;
    setIsMatching(true);
    setGeneralError(null);

    try {
      const res = await fetch('/api/jobs/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobAnalysis: analysisResult }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to calculate job match.');
      }

      setMatchBreakdown(json.data);
      setCurrentStep(4);
    } catch (err: any) {
      setGeneralError(err.message || 'Unable to calculate match. Please verify your profile.');
    } finally {
      setIsMatching(false);
    }
  };

  // Step 5: Trigger Email Generation
  const handleGenerateEmail = async () => {
    if (!analysisResult) return;
    setIsGeneratingEmail(true);
    setGeneralError(null);
    setCurrentStep(5); // Generating email

    const effectiveRecipient =
      selectedRecipientEmail === 'custom' ? customRecipientEmail : selectedRecipientEmail;

    try {
      const res = await fetch('/api/jobs/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: analysisResult.companyName,
          jobTitle: analysisResult.jobTitle,
          requiredSkills: analysisResult.requiredSkills,
          preferredSkills: analysisResult.preferredSkills,
          jobDescription,
          recipientEmail: effectiveRecipient,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate tailored email.');
      }

      const generated: GeneratedEmail = json.data;
      setEmailSubject(generated.subject);
      setEmailBody(`${generated.greeting}\n\n${generated.body}\n\n${generated.closing}\n${generated.signature}`);

      // Also persist or create draft application in database
      await saveDraftApplication(generated.subject, `${generated.greeting}\n\n${generated.body}\n\n${generated.closing}\n${generated.signature}`);

      setCurrentStep(6); // Step 6: Edit Email
    } catch (err: any) {
      setGeneralError(err.message || 'Unable to generate email. Please try again.');
      setCurrentStep(4);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  // Helper: Persist Draft Application to Database
  const saveDraftApplication = async (subjectToSave?: string, bodyToSave?: string) => {
    if (!analysisResult) return;
    setIsSavingDraft(true);

    const effectiveRecipient =
      selectedRecipientEmail === 'custom' ? customRecipientEmail : selectedRecipientEmail;

    try {
      if (!applicationId) {
        // Create new
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: analysisResult.companyName,
            jobTitle: analysisResult.jobTitle,
            jobUrl: jobUrl || null,
            jobDescription,
            workType: analysisResult.workType,
            location: analysisResult.location,
            recipientEmail: effectiveRecipient || null,
            subject: subjectToSave || emailSubject || null,
            emailBody: bodyToSave || emailBody || null,
            resumeId: selectedResumeId || null,
            matchScore: matchBreakdown?.overallScore || null,
            matchBreakdown: matchBreakdown || undefined,
            status: 'DRAFT',
          }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setApplicationId(json.data.id);
        }
      } else {
        // Update existing draft
        await fetch(`/api/applications/${applicationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: effectiveRecipient || null,
            subject: subjectToSave || emailSubject || null,
            emailBody: bodyToSave || emailBody || null,
            resumeId: selectedResumeId || null,
            status: 'DRAFT',
          }),
        });
      }
    } catch (err) {
      console.warn('Draft save notice:', err);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Step 7: Proceed to Review & Confirmation Screen
  const handleContinueToReview = async () => {
    await saveDraftApplication();
    setCurrentStep(7); // Displays Review (Step 7) & Confirm Checkboxes (Step 8)
  };

  // Step 9: Send Application (with the 4 explicit user confirmations)
  const handleSendApplication = async (confirmations: {
    reviewedRecipient: boolean;
    reviewedEmail: boolean;
    reviewedAttachment: boolean;
    confirmSend: boolean;
  }) => {
    if (!applicationId) {
      setSendError('Application record not found. Please save as draft first.');
      return;
    }

    setIsSending(true);
    setSendError(null);
    setCurrentStep(9); // Sending

    const effectiveRecipient =
      selectedRecipientEmail === 'custom' ? customRecipientEmail : selectedRecipientEmail;

    try {
      const res = await fetch(`/api/applications/${applicationId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: effectiveRecipient,
          subject: emailSubject,
          emailBody: emailBody,
          resumeId: selectedResumeId,
          confirmations, // All 4 MUST be true
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to send application.');
      }

      setSendSuccessData({
        messageId: json.data.messageId,
        sentAt: json.data.application.sentAt,
      });

      // Advance to Step 10: Saved & Dispatched!
      setCurrentStep(10);
    } catch (err: any) {
      setSendError(err.message || 'Error occurred while sending email.');
      setCurrentStep(7); // Stay on review screen to resolve error
    } finally {
      setIsSending(false);
    }
  };

  const effectiveRecipient =
    selectedRecipientEmail === 'custom' ? customRecipientEmail : selectedRecipientEmail;

  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* 10-Step Visual Stepper */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs">
        <Stepper
          currentStep={currentStep}
          onStepClick={step => {
            // Allow clicking back to earlier completed steps
            if (step < currentStep && currentStep !== 10) {
              setCurrentStep(step);
            }
          }}
        />
      </div>

      {generalError && (
        <Alert type="error" message={generalError} onClose={() => setGeneralError(null)} />
      )}

      {/* Step 1: Input */}
      {currentStep === 1 && (
        <Step1PasteJob
          jobDescription={jobDescription}
          jobUrl={jobUrl}
          setJobDescription={setJobDescription}
          setJobUrl={setJobUrl}
          onAnalyze={handleAnalyzeJob}
          isLoading={isAnalyzing}
        />
      )}

      {/* Step 2: Analysis in Progress */}
      {currentStep === 2 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">Analyzing Job Posting...</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Extracting job title, company, requirements, required skills, and detecting recipient application emails...
          </p>
        </div>
      )}

      {/* Step 3: Review Job Details & Recipient Selection */}
      {currentStep === 3 && analysisResult && (
        <Step3ReviewJob
          jobAnalysis={analysisResult}
          selectedEmail={selectedRecipientEmail}
          setSelectedEmail={setSelectedRecipientEmail}
          customRecipientEmail={customRecipientEmail}
          setCustomRecipientEmail={setCustomRecipientEmail}
          onContinue={handleCalculateMatch}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {/* Step 4: Deterministic Match Breakdown */}
      {currentStep === 4 && matchBreakdown && (
        <Step4MatchScore
          matchBreakdown={matchBreakdown}
          onContinue={handleGenerateEmail}
          onBack={() => setCurrentStep(3)}
          isLoading={isGeneratingEmail}
        />
      )}

      {/* Step 5: Email Generation in Progress */}
      {currentStep === 5 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">Generating Factual Tailored Email...</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Grounded in your real profile facts. Strictly zero hallucination. Never claiming missing skills...
          </p>
        </div>
      )}

      {/* Step 6: Email Editor */}
      {currentStep === 6 && (
        <Step5_6EmailEditor
          recipient={effectiveRecipient}
          setRecipient={val => {
            setSelectedRecipientEmail('custom');
            setCustomRecipientEmail(val);
          }}
          subject={emailSubject}
          setSubject={setEmailSubject}
          body={emailBody}
          setBody={setEmailBody}
          resumes={resumes}
          selectedResumeId={selectedResumeId}
          setSelectedResumeId={setSelectedResumeId}
          onRegenerate={handleGenerateEmail}
          onSaveDraft={() => saveDraftApplication()}
          onContinueToReview={handleContinueToReview}
          onBack={() => setCurrentStep(4)}
          isRegenerating={isGeneratingEmail}
          isSavingDraft={isSavingDraft}
        />
      )}

      {/* Step 7, 8, 9: Review, Explicit Confirmation & Send */}
      {(currentStep === 7 || currentStep === 8 || currentStep === 9) && (
        <Step7_9ReviewSend
          recipient={effectiveRecipient}
          senderGmail={senderGmail}
          subject={emailSubject}
          body={emailBody}
          attachmentName={selectedResume ? selectedResume.originalName : null}
          onSend={handleSendApplication}
          onBackToEdit={() => setCurrentStep(6)}
          isSending={isSending}
          sendError={sendError}
        />
      )}

      {/* Step 10: Application Saved & Dispatched */}
      {currentStep === 10 && sendSuccessData && analysisResult && (
        <Step10Success
          applicationId={applicationId || ''}
          recipient={effectiveRecipient}
          messageId={sendSuccessData.messageId}
          sentAt={sendSuccessData.sentAt}
          companyName={analysisResult.companyName}
          jobTitle={analysisResult.jobTitle}
        />
      )}
    </div>
  );
}
