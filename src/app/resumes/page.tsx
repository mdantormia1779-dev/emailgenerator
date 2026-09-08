'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Star,
  Download,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDefaultCheckbox, setIsDefaultCheckbox] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResumes = async () => {
    try {
      const res = await fetch('/api/resumes');
      const json = await res.json();
      if (json.success && json.data) {
        setResumes(json.data);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setSuccess(null);

    // Client-side quick checks
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx') {
      setError('Only PDF (.pdf) and Microsoft Word (.docx) files are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(`File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB).`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('isDefault', String(isDefaultCheckbox));

      const res = await fetch('/api/resumes', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upload resume.');
      }

      setSuccess(`Resume "${file.name}" uploaded successfully.`);
      fetchResumes();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.message || 'Error uploading file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setSuccess(`Resume deleted.`);
        fetchResumes();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete resume.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Resume Management
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Upload PDF and Word resumes. Select a default resume to automatically attach during application generation.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Upload Dropzone Card */}
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
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 group-hover:scale-110 flex items-center justify-center mx-auto transition-transform mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Click to select or drag and drop your resume file
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

      {/* Resumes List Card */}
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
                      onClick={() => handleDelete(resume.id, resume.originalName)}
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
    </div>
  );
}
