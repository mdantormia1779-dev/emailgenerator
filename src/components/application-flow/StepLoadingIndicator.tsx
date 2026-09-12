'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface StepLoadingIndicatorProps {
  title: string;
  description: string;
}

export const StepLoadingIndicator: React.FC<StepLoadingIndicatorProps> = ({
  title,
  description,
}) => {
  return (
    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
      <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto">{description}</p>
    </div>
  );
};
