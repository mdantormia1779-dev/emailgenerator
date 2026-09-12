'use client';

import React from 'react';
import { Alert } from '@/components/ui/Alert';
import { ResumeUploadDropzone } from '@/components/resumes/ResumeUploadDropzone';
import { ResumeListTable } from '@/components/resumes/ResumeListTable';
import { useResumesWorkflow } from '@/hooks/useResumesWorkflow';

export default function ResumesPage() {
  const {
    resumes,
    loading,
    isUploading,
    error,
    setError,
    success,
    setSuccess,
    isDefaultCheckbox,
    setIsDefaultCheckbox,
    handleFileUpload,
    handleDelete,
  } = useResumesWorkflow();

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Resume Management</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Upload PDF and Word resumes. Select a default resume to automatically attach during application generation.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <ResumeUploadDropzone
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
        isDefaultCheckbox={isDefaultCheckbox}
        setIsDefaultCheckbox={setIsDefaultCheckbox}
      />

      <ResumeListTable
        resumes={resumes}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}
