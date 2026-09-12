import React from 'react';
import { ArrowLeft, Layers, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MatchBreakdown } from '@/types';
import { MatchScoreOverallBanner } from './MatchScoreOverallBanner';
import { MatchScoreBreakdownCards } from './MatchScoreBreakdownCards';
import { MatchScoreSkillsList } from './MatchScoreSkillsList';

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

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader
        title="Step 4: Deterministic Profile Match"
        subtitle="Objective comparison of your factual profile against the extracted job requirements."
      />
      <CardContent className="space-y-6">
        <MatchScoreOverallBanner overallScore={overallScore} explanation={explanation} />

        <MatchScoreBreakdownCards
          technicalSkillScore={technicalSkillScore}
          experienceScore={experienceScore}
          projectScore={projectScore}
          otherScore={otherScore}
        />

        <MatchScoreSkillsList strongMatches={strongMatches} missingSkills={missingSkills} />

        {relevantProjects && relevantProjects.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Relevant Profile Projects to Highlight
            </h4>
            <div className="space-y-2">
              {relevantProjects.map((p, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{p.title}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Matched:</span>
                    {p.matchedSkills.map((s, i) => (
                      <Badge key={i} variant="primary" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
        <Button onClick={onContinue} isLoading={isLoading} rightIcon={<Sparkles className="w-4 h-4" />}>
          Generate Tailored Email &rarr;
        </Button>
      </CardFooter>
    </Card>
  );
};
