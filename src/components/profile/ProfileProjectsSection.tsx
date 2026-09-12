'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ProfileProjectsSectionProps {
  projects: any[];
  setProjects: React.Dispatch<React.SetStateAction<any[]>>;
  onAddProject: () => void;
  onRemoveProject: (index: number) => void;
}

export const ProfileProjectsSection: React.FC<ProfileProjectsSectionProps> = ({
  projects,
  setProjects,
  onAddProject,
  onRemoveProject,
}) => {
  return (
    <Card>
      <CardHeader
        title="Documented Projects"
        subtitle="Real projects the AI can highlight when relevant to the job"
        action={
          <Button type="button" size="sm" variant="outline" onClick={onAddProject} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Project
          </Button>
        }
      />
      <CardContent className="space-y-4">
        {projects.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">
            No projects added. Click &quot;Add Project&quot; to include portfolio projects.
          </p>
        ) : (
          projects.map((proj, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Project #{idx + 1}</span>
                <button type="button" onClick={() => onRemoveProject(idx)} className="text-rose-500 hover:text-rose-700 text-xs p-1 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Title</label>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={e => {
                      const updated = [...projects];
                      updated[idx].title = e.target.value;
                      setProjects(updated);
                    }}
                    placeholder="CloudCommerce"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack || ''}
                    onChange={e => {
                      const updated = [...projects];
                      updated[idx].techStack = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setProjects(updated);
                    }}
                    placeholder="Next.js, React, PostgreSQL"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Description</label>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={e => {
                    const updated = [...projects];
                    updated[idx].description = e.target.value;
                    setProjects(updated);
                  }}
                  placeholder="Brief description of what was built, problem solved, and results..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
