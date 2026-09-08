import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { step: 1, name: 'Paste Job' },
  { step: 2, name: 'Analyze' },
  { step: 3, name: 'Review Job' },
  { step: 4, name: 'Match Score' },
  { step: 5, name: 'Generate' },
  { step: 6, name: 'Edit Email' },
  { step: 7, name: 'Review' },
  { step: 8, name: 'Confirm' },
  { step: 9, name: 'Send' },
  { step: 10, name: 'Saved' },
];

export const Stepper: React.FC<StepperProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="w-full py-4 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[720px] px-2">
        {STEPS.map((s, idx) => {
          const isCompleted = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          const isClickable = onStepClick && isCompleted;

          return (
            <React.Fragment key={s.step}>
              {/* Step Node */}
              <div
                onClick={() => isClickable && onStepClick(s.step)}
                className={`flex flex-col items-center gap-1.5 relative group ${
                  isClickable ? 'cursor-pointer' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-sm'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.step}
                </div>
                <span
                  className={`text-[11px] font-medium whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'text-indigo-700 font-semibold'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {s.name}
                </span>
              </div>

              {/* Connecting Line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1.5 transition-colors ${
                    currentStep > s.step ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
