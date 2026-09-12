'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ProfileSkillsProps {
  skills: string[];
  newSkillInput: string;
  setNewSkillInput: (val: string) => void;
  onAddSkill: (e: React.KeyboardEvent | React.MouseEvent) => void;
  onRemoveSkill: (skill: string) => void;
}

export const ProfileSkills: React.FC<ProfileSkillsProps> = ({
  skills,
  newSkillInput,
  setNewSkillInput,
  onAddSkill,
  onRemoveSkill,
}) => {
  return (
    <Card>
      <CardHeader
        title="Documented Skills Inventory"
        subtitle="The AI will ONLY claim and highlight skills from this verified list"
      />
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkillInput}
            onChange={e => setNewSkillInput(e.target.value)}
            onKeyDown={onAddSkill}
            placeholder="Type a skill and press Enter (e.g. TypeScript, React, Docker)..."
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <Button type="button" size="sm" onClick={onAddSkill} leftIcon={<Plus className="w-4 h-4" />}>
            Add Skill
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              {skill}
              <button
                type="button"
                onClick={() => onRemoveSkill(skill)}
                className="text-indigo-400 hover:text-indigo-600 focus:outline-none cursor-pointer"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
