import React from 'react';
import { Building2, MapPin, Briefcase, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { JobAnalysisResult } from '@/types';
import { RecipientEmailSelector } from './RecipientEmailSelector';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Company</span>
            <div className="flex items-center gap-2 mt-0.5 font-semibold text-slate-900 text-base">
              <Building2 className="w-4 h-4 text-indigo-600" />
              {jobAnalysis.companyName}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Job Title</span>
            <div className="flex items-center gap-2 mt-0.5 font-semibold text-slate-900 text-base">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              {jobAnalysis.jobTitle}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Location & Work</span>
            <div className="flex items-center gap-2 mt-0.5 text-sm text-slate-700">
              <MapPin className="w-4 h-4 text-slate-500" />
              {jobAnalysis.location || 'Not specified'} ({jobAnalysis.workType})
            </div>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Experience</span>
            <div className="mt-0.5 text-sm text-slate-700 font-medium">{jobAnalysis.experienceRequirement}</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Required & Preferred Skills</h4>
          <div className="flex flex-wrap gap-2">
            {jobAnalysis.requiredSkills.map((skill, idx) => (
              <Badge key={idx} variant="primary">{skill}</Badge>
            ))}
            {jobAnalysis.preferredSkills.map((skill, idx) => (
              <Badge key={`pref-${idx}`} variant="secondary">{skill} (Preferred)</Badge>
            ))}
          </div>
        </div>

        <RecipientEmailSelector
          recipientEmails={recipientEmails}
          selectedEmail={selectedEmail}
          setSelectedEmail={setSelectedEmail}
          customRecipientEmail={customRecipientEmail}
          setCustomRecipientEmail={setCustomRecipientEmail}
        />
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        <Button onClick={onContinue} disabled={!isRecipientValid}>
          Continue to Matching Score
        </Button>
      </CardFooter>
    </Card>
  );
};
