'use client';

import React from 'react';
import { Save } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface DetailNotesCardProps {
  notes: string;
  setNotes: (val: string) => void;
  onSaveNotes: () => void;
  isSavingNotes: boolean;
}

export const DetailNotesCard: React.FC<DetailNotesCardProps> = ({
  notes,
  setNotes,
  onSaveNotes,
  isSavingNotes,
}) => {
  return (
    <Card>
      <CardHeader
        title="Interviewer & Follow-up Notes"
        subtitle="Keep track of responses, recruiter calls, salary notes, and interview prep"
        action={
          <Button
            size="sm"
            variant="secondary"
            onClick={onSaveNotes}
            isLoading={isSavingNotes}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Notes
          </Button>
        }
      />
      <CardContent>
        <textarea
          rows={5}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Log notes about screening calls, questions asked, salary ranges discussed, or interview dates..."
          className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </CardContent>
    </Card>
  );
};
