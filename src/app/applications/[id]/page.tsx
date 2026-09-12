'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { DetailHeader } from '@/components/application-detail/DetailHeader';
import { DetailEmailCard } from '@/components/application-detail/DetailEmailCard';
import { DetailNotesCard } from '@/components/application-detail/DetailNotesCard';
import { DetailTimelineCard } from '@/components/application-detail/DetailTimelineCard';
import { DetailRoleCard } from '@/components/application-detail/DetailRoleCard';
import { useApplicationDetail } from '@/hooks/useApplicationDetail';

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const {
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
  } = useApplicationDetail(id);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-4">
        <Alert type="error" message={error || 'Application not found.'} />
        <Link href="/applications">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>Back to Applications</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <DetailHeader
        application={application}
        currentStatus={currentStatus}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={isUpdatingStatus}
        onDelete={handleDelete}
      />

      {feedbackMsg && <Alert type="success" message={feedbackMsg} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DetailEmailCard application={application} />
          <DetailNotesCard
            notes={notes}
            setNotes={setNotes}
            onSaveNotes={handleSaveNotes}
            isSavingNotes={isSavingNotes}
          />
        </div>

        <div className="space-y-6">
          <DetailTimelineCard events={application.events} />
          <DetailRoleCard application={application} />
        </div>
      </div>
    </div>
  );
}
