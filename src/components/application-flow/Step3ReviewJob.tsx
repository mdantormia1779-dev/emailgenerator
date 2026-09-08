import React from 'react';
import { Building2, MapPin, Briefcase, Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { JobAnalysisResult } from '@/types';

interface Step3Props {
  jobAnalysis: JobAnalysisResult;
  selectedEmail: string;
  setSelectedEmail: (email: string) => void;
  customRecipientEmail: string;
  setCustomRecipientEmail: (email: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const Step3ReviewJob: React.FC<Step3Props> = ({
  jobAnalysis,
  selectedEmail,
  setSelectedEmail,
  customRecipientEmail,
  setCustomRecipientEmail,
  onContinue,
  onBack,
}) => {
  const recipientEmails = jobAnalysis.recipientEmails || [];
  const effectiveRecipient = selectedEmail === 'custom' ? customRecipientEmail : selectedEmail;
  const isRecipientValid = effectiveRecipient && effectiveRecipient.includes('@') && effectiveRecipient.includes('.');

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader
        title="Step 3: Review Extracted Job Information"
        subtitle="Verify the extracted role details and explicitly select or specify the recipient application email."
      />
      <CardContent className="space-y-6">
        {/* Core Job Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Company
            </span>
            <div className="flex items-center gap-2 mt-0.5 font-semibold text-slate-900 text-base">
              <Building2 className="w-4 h-4 text-indigo-600" />
              {jobAnalysis.companyName}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Job Title
            </span>
            <div className="flex items-center gap-2 mt-0.5 font-semibold text-slate-900 text-base">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              {jobAnalysis.jobTitle}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Location &amp; Work Type
            </span>
            <div className="flex items-center gap-2 mt-0.5 text-sm text-slate-700">
              <MapPin className="w-4 h-4 text-slate-500" />
              {jobAnalysis.location || 'Not specified'} ({jobAnalysis.workType})
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Experience Requirement
            </span>
            <div className="mt-0.5 text-sm text-slate-700 font-medium">
              {jobAnalysis.experienceRequirement}
            </div>
          </div>
        </div>

        {/* Required & Preferred Skills */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Required &amp; Preferred Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {jobAnalysis.requiredSkills.map((skill, idx) => (
              <Badge key={idx} variant="primary">
                {skill}
              </Badge>
            ))}
            {jobAnalysis.preferredSkills.map((skill, idx) => (
              <Badge key={`pref-${idx}`} variant="secondary">
                {skill} (Preferred)
              </Badge>
            ))}
          </div>
        </div>

        {/* RECIPIENT EMAIL SELECTION - CRITICAL REQUIREMENT */}
        <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Mail className="w-4 h-4 text-indigo-600" />
              Application Recipient Email <span className="text-rose-500">*</span>
            </label>
            {recipientEmails.length > 1 && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Multiple recipient emails found - Please select one
              </span>
            )}
          </div>

          {recipientEmails.length === 0 ? (
            <div className="space-y-2">
              <Alert
                type="warning"
                message="No application email found automatically in the job posting. Please enter the recipient email manually below."
              />
              <input
                type="email"
                value={customRecipientEmail}
                onChange={e => {
                  setCustomRecipientEmail(e.target.value);
                  setSelectedEmail('custom');
                }}
                placeholder="recruiter@company.com"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-600">
                Select which recipient email should receive your application:
              </p>
              <div className="space-y-2">
                {recipientEmails.map(email => (
                  <label
                    key={email}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition ${
                      selectedEmail === email
                        ? 'border-indigo-600 bg-white shadow-xs font-semibold text-indigo-950'
                        : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recipientEmail"
                      value={email}
                      checked={selectedEmail === email}
                      onChange={() => setSelectedEmail(email)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-mono text-xs">{email}</span>
                  </label>
                ))}

                {/* Custom Email Option */}
                <label
                  className={`flex flex-col gap-2 p-3 rounded-lg border text-sm cursor-pointer transition ${
                    selectedEmail === 'custom'
                      ? 'border-indigo-600 bg-white shadow-xs font-semibold text-indigo-950'
                      : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="recipientEmail"
                      value="custom"
                      checked={selectedEmail === 'custom'}
                      onChange={() => setSelectedEmail('custom')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Enter a different email manually</span>
                  </div>
                  {selectedEmail === 'custom' && (
                    <input
                      type="email"
                      value={customRecipientEmail}
                      onChange={e => setCustomRecipientEmail(e.target.value)}
                      placeholder="hiring.manager@company.com"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 mt-1"
                    />
                  )}
                </label>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        <Button onClick={onContinue} disabled={!isRecipientValid}>
          View Match Score &rarr;
        </Button>
      </CardFooter>
    </Card>
  );
};
