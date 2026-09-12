import React from 'react';

interface MatchScoreOverallBannerProps {
  overallScore: number;
  explanation: string;
}

export const MatchScoreOverallBanner: React.FC<MatchScoreOverallBannerProps> = ({
  overallScore,
  explanation,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 block mb-1">
          Overall Compatibility
        </span>
        <h3 className="text-xl font-bold">
          {overallScore >= 80 ? 'Strong Alignment' : overallScore >= 60 ? 'Moderate Alignment' : 'Partial Alignment'}
        </h3>
        <p className="text-xs text-indigo-200 mt-1 max-w-md leading-relaxed">{explanation}</p>
      </div>
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-24 h-24 rounded-full border-4 border-indigo-400 bg-indigo-900/50 flex flex-col items-center justify-center shadow-inner">
          <span className="text-3xl font-extrabold text-white">{overallScore}%</span>
          <span className="text-[10px] text-indigo-300 uppercase tracking-widest font-semibold">Match</span>
        </div>
      </div>
    </div>
  );
};
