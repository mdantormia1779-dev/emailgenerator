'use client';

import React from 'react';
import { Stepper } from '@/components/application-flow/Stepper';
import { ApplicationStepRenderer } from '@/components/application-flow/ApplicationStepRenderer';
import { Alert } from '@/components/ui/Alert';
import { useNewApplicationWorkflow } from '@/hooks/useNewApplicationWorkflow';

export default function NewApplicationPage() {
  const wf = useNewApplicationWorkflow();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs">
        <Stepper
          currentStep={wf.currentStep}
          onStepClick={step => {
            if (step < wf.currentStep && wf.currentStep !== 10) {
              wf.setCurrentStep(step);
            }
          }}
        />
      </div>

      {wf.generalError && (
        <Alert type="error" message={wf.generalError} onClose={() => wf.setGeneralError(null)} />
      )}

      <ApplicationStepRenderer wf={wf} />
    </div>
  );
}
