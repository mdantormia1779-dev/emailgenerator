'use client';

import { useState, useEffect } from 'react';

export function useResumesWorkflow() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDefaultCheckbox, setIsDefaultCheckbox] = useState(false);

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

      const res = await fetch('/api/resumes', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to upload resume.');

      setSuccess(`Resume "${file.name}" uploaded successfully.`);
      fetchResumes();
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

  return {
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
  };
}
