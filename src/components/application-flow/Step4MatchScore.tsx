import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MatchBreakdown } from '@/types';

interface Step4Props {
  matchBreakdown: MatchBreakdown;
  onContinue: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const Step4MatchScore: React.FC<Step4Props> = ({
  matchBreakdown,
  onContinue,
  onBack,
  isLoading,
}) => {
  const {
    overallScore,
    technicalSkillScore,
    experienceScore,
    projectScore,
    otherScore,
    strongMatches,
    missingSkills,
    relevantProjects,
    explanation,
  } = matchBreakdown;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader
        title="Step 4: Deterministic Profile Match"
        subtitle="Objective comparison of your factual profile against the extracted job requirements."
      />
      <CardContent className="space-y-6">
        {/* Overall Score Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Overall Compatibility
              </span>
            </div>
            <h3 className="text-xl font-bold">
              {overallScore >= 80
                ? 'Strong Alignment'
                : overallScore >= 60
                ? 'Moderate Alignment'
                : 'Partial Alignment'}
            </h3>
            <p className="text-xs text-indigo-200 mt-1 max-w-md leading-relaxed">
              {explanation}
            </p>
          </div>

          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-400 bg-indigo-900/50 flex flex-col items-center justify-center shadow-inner">
              <span className="text-3xl font-extrabold text-white">{overallScore}%</span>
              <span className="text-[10px] text-indigo-300 uppercase tracking-widest font-semibold">
                Match
              </span>
            </div>
          </div>
        </div>

        {/* 4-Part Deterministic Weighting Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Tech Skills (50%)
            </span>
            <span className="text-lg font-extrabold text-slate-900 mt-1 block">
              {technicalSkillScore}%
            </span>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${technicalSkillScore}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Experience (20%)
            </span>
            <span className="text-lg font-extrabold text-slate-900 mt-1 block">
              {experienceScore}%
            </span>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${experienceScore}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Projects (20%)
            </span>
            <span className="text-lg font-extrabold text-slate-900 mt-1 block">
              {projectScore}%
            </span>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${projectScore}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Other Fit (10%)
            </span>
            <span className="text-lg font-extrabold text-slate-900 mt-1 block">
              {otherScore}%
            </span>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${otherScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Strong Matches & Missing Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Documented Strong Matches ({strongMatches.length})
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {strongMatches.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Missing or Unmatched Skills ({missingSkills.length})
            </div>
            <p className="text-[11px] text-amber-800">
              Per zero-hallucination rules, these will <strong>never</strong> be claimed in your generated email:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {missingSkills.length === 0 ? (
                <span className="text-xs text-slate-500 italic">No missing skills detected!</span>
              ) : (
                missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"
                  >
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Relevant Candidate Projects */}
        {relevantProjects && relevantProjects.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Relevant Profile Projects to Highlight
            </h4>
            <div className="space-y-2">
              {relevantProjects.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800">{p.title}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Matched:</span>
                    {p.matchedSkills.map((s, i) => (
                      <Badge key={i} variant="primary" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        <Button
          onClick={onContinue}
          isLoading={isLoading}
          rightIcon={<Sparkles className="w-4 h-4" />}
        >
          Generate Tailored Email &rarr;
        </Button>
      </CardFooter>
    </Card>
  );
};
