import { useState, useEffect } from 'react';
import { JobAnalysisResult, MatchBreakdown, GeneratedEmail } from '@/types';

export function useNewApplicationWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<JobAnalysisResult | null>(null);

  const [selectedRecipientEmail, setSelectedRecipientEmail] = useState('');
  const [customRecipientEmail, setCustomRecipientEmail] = useState('');

  const [matchBreakdown, setMatchBreakdown] = useState<MatchBreakdown | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [senderGmail, setSenderGmail] = useState<string>('');

  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccessData, setSendSuccessData] = useState<{ messageId: string; sentAt: string } | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

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
          if (defaultResume) setSelectedResumeId(defaultResume.id);
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

  const effectiveRecipient = selectedRecipientEmail === 'custom' ? customRecipientEmail : selectedRecipientEmail;

  const handleAnalyzeJob = async () => {
    setIsAnalyzing(true);
    setGeneralError(null);
    setCurrentStep(2);
    try {
      const res = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, jobUrl: jobUrl || null }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to analyze job description.');
      const analysis: JobAnalysisResult = json.data;
      setAnalysisResult(analysis);
      setSelectedRecipientEmail(analysis.recipientEmails?.length ? analysis.recipientEmails[0] : 'custom');
      setCurrentStep(3);
    } catch (err: any) {
      setGeneralError(err.message || 'Unable to analyze job description. Please try again.');
      setCurrentStep(1);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to calculate job match.');
      setMatchBreakdown(json.data);
      setCurrentStep(4);
    } catch (err: any) {
      setGeneralError(err.message || 'Unable to calculate match. Please verify your profile.');
    } finally {
      setIsMatching(false);
    }
  };

  const saveDraftApplication = async (subjectToSave?: string, bodyToSave?: string) => {
    if (!analysisResult) return;
    setIsSavingDraft(true);
    try {
      if (!applicationId) {
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
        if (json.success && json.data) setApplicationId(json.data.id);
      } else {
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

  const handleGenerateEmail = async () => {
    if (!analysisResult) return;
    setIsGeneratingEmail(true);
    setGeneralError(null);
    setCurrentStep(5);
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
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to generate tailored email.');
      const generated: GeneratedEmail = json.data;
      setEmailSubject(generated.subject);
      const combined = `${generated.greeting}\n\n${generated.body}\n\n${generated.closing}\n${generated.signature}`;
      setEmailBody(combined);
      await saveDraftApplication(generated.subject, combined);
      setCurrentStep(6);
    } catch (err: any) {
      setGeneralError(err.message || 'Unable to generate email. Please try again.');
      setCurrentStep(4);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleContinueToReview = async () => {
    await saveDraftApplication();
    setCurrentStep(7);
  };

  const handleSendApplication = async (confirmations: any) => {
    if (!applicationId) {
      setSendError('Application record not found. Please save as draft first.');
      return;
    }
    setIsSending(true);
    setSendError(null);
    setCurrentStep(9);
    try {
      const res = await fetch(`/api/applications/${applicationId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: effectiveRecipient,
          subject: emailSubject,
          emailBody,
          resumeId: selectedResumeId,
          confirmations,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to send application.');
      setSendSuccessData({ messageId: json.data.messageId, sentAt: json.data.application.sentAt });
      setCurrentStep(10);
    } catch (err: any) {
      setSendError(err.message || 'Error occurred while sending email.');
      setCurrentStep(7);
    } finally {
      setIsSending(false);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    jobDescription,
    setJobDescription,
    jobUrl,
    setJobUrl,
    isAnalyzing,
    analysisResult,
    selectedRecipientEmail,
    setSelectedRecipientEmail,
    customRecipientEmail,
    setCustomRecipientEmail,
    effectiveRecipient,
    matchBreakdown,
    emailSubject,
    setEmailSubject,
    emailBody,
    setEmailBody,
    isGeneratingEmail,
    isSavingDraft,
    resumes,
    selectedResumeId,
    setSelectedResumeId,
    applicationId,
    senderGmail,
    isSending,
    sendError,
    sendSuccessData,
    generalError,
    setGeneralError,
    handleAnalyzeJob,
    handleCalculateMatch,
    handleGenerateEmail,
    saveDraftApplication,
    handleContinueToReview,
    handleSendApplication,
  };
}
