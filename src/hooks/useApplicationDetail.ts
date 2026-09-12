import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApplicationStatus } from '@/types';

export function useApplicationDetail(id: string) {
  const router = useRouter();
  const [application, setApplication] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus>('DRAFT');
  const [notes, setNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/applications/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load application');
      setApplication(json.data);
      setCurrentStatus(json.data.status);
      setNotes(json.data.notes || '');
    } catch (err: any) {
      setError(err.message || 'Error fetching application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchApplication();
  }, [id]);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentStatus(newStatus);
        setFeedbackMsg(`Status successfully updated to ${newStatus}`);
        fetchApplication();
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedbackMsg('Notes saved successfully');
        fetchApplication();
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application record?')) return;
    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) router.push('/applications');
  };

  return {
    application,
    loading,
    error,
    currentStatus,
    notes,
    setNotes,
    isUpdatingStatus,
    isSavingNotes,
    feedbackMsg,
    handleStatusChange,
    handleSaveNotes,
    handleDelete,
  };
}
