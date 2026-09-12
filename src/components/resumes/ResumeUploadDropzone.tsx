'use client';

import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface ResumeUploadDropzoneProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  isDefaultCheckbox: boolean;
  setIsDefaultCheckbox: (val: boolean) => void;
}

export const ResumeUploadDropzone: React.FC<ResumeUploadDropzoneProps> = ({
  onFileUpload,
  isUploading,
  isDefaultCheckbox,
  setIsDefaultCheckbox,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader
        title="Upload New Resume"
        subtitle="Supported formats: PDF (.pdf), Microsoft Word (.docx) • Maximum size: 5MB"
      />
      <CardContent>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/20 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            disabled={isUploading}
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                onFileUpload(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 group-hover:scale-110 flex items-center justify-center mx-auto transition-transform mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            {isUploading ? 'Uploading & Validating File...' : 'Click to select or drag and drop your resume file'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Strictly validated: Magic header byte verification, MIME check, and safe sanitization
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefaultCheckbox}
              onChange={e => setIsDefaultCheckbox(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Set as default application resume</span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
};
