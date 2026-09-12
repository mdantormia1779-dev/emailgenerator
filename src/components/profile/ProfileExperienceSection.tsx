'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExperienceItemCard } from './ExperienceItemCard';

interface ProfileExperienceSectionProps {
  experiences: any[];
  setExperiences: React.Dispatch<React.SetStateAction<any[]>>;
  onAddExperience: () => void;
  onRemoveExperience: (index: number) => void;
}

export const ProfileExperienceSection: React.FC<ProfileExperienceSectionProps> = ({
  experiences,
  setExperiences,
  onAddExperience,
  onRemoveExperience,
}) => {
  const handleUpdate = (index: number, field: string, value: any) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  return (
    <Card>
      <CardHeader
        title="Work Experience"
        subtitle="Documented positions used to factualize application emails"
        action={
          <Button type="button" size="sm" variant="outline" onClick={onAddExperience} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Experience
          </Button>
        }
      />
      <CardContent className="space-y-6">
        {experiences.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">
            No work experience added yet. Click &quot;Add Experience&quot; to add positions.
          </p>
        ) : (
          experiences.map((exp, idx) => (
            <ExperienceItemCard
              key={idx}
              exp={exp}
              idx={idx}
              onRemove={onRemoveExperience}
              onUpdate={(field, val) => handleUpdate(idx, field, val)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};
