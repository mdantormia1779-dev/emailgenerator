'use client';

import React from 'react';
import { FileText, Star, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface ResumeListTableProps {
  resumes: any[];
  loading: boolean;
  onDelete: (id: string, name: string) => void;
}

export const ResumeListTable: React.FC<ResumeListTableProps> = ({
  resumes,
  loading,
  onDelete,
}) => {
  return (
    <Card>
      <CardHeader
        title="Your Stored Resumes"
        subtitle={`${resumes.length} document(s) registered`}
      />
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-slate-400 text-xs">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p>No resumes uploaded yet. Upload your primary resume above.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resumes.map(resume => (
              <div
                key={resume.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        {resume.originalName}
                      </span>
                      {resume.isDefault && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                      <span>{(resume.fileSize / 1024).toFixed(0)} KB</span>
                      <span>•</span>
                      <span>{resume.mimeType === 'application/pdf' ? 'PDF' : 'DOCX'}</span>
                      <span>•</span>
                      <span>Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(resume.id, resume.originalName)}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
