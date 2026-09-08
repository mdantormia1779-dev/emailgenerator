'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Mail,
  Send,
  Paperclip,
  Clock,
  ShieldCheck,
  Save,
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApplicationStatus } from '@/types';

const STATUS_OPTIONS: ApplicationStatus[] = [
  'DRAFT',
  'ANALYZED',
  'GENERATED',
  'REVIEWED',
  'SENT',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [application, setApplication] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status & Notes Editing
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus>('DRAFT');
  const [notes, setNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/applications/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load application');
      }
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
    } catch (err) {
      console.error('Failed to update status:', err);
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
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application record?')) return;
    try {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        router.push('/applications');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

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
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Applications
          </Button>
        </Link>
      </div>
    );
  }

  const isSent = application.status === 'SENT' || !!application.sentAt;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/applications">
            <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {application.jobTitle}
              <Badge status={application.status} />
            </h1>
            <p className="text-xs text-slate-500">{application.companyName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={currentStatus}
            onChange={e => handleStatusChange(e.target.value as ApplicationStatus)}
            disabled={isUpdatingStatus}
            className="text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-xs"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt} value={opt}>
                Status: {opt}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {feedbackMsg && <Alert type="success" message={feedbackMsg} />}

      {/* DUPLICATE PROTECTION LOCK BANNER */}
      {isSent && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Application Sent via Gmail (Duplicate Protection Active)</p>
            <p className="mt-0.5 text-emerald-700">
              Dispatched at {new Date(application.sentAt).toLocaleString()} with Gmail Message ID{' '}
              <code className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded text-[11px]">
                {application.providerMessageId}
              </code>
              . Repeated direct sending on this record is locked to prevent accidental spam.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Details & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Email and Job info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Content Card */}
          <Card>
            <CardHeader
              title="Tailored Application Email"
              subtitle={`Recipient: ${application.recipientEmail || 'Not set'}`}
              action={
                application.matchScore && (
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                    {application.matchScore}% Match Score
                  </span>
                )
              }
            />
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Subject:</span>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900">
                  {application.subject || <span className="text-slate-400 italic">No subject</span>}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Body:</span>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-sans whitespace-pre-wrap leading-relaxed text-slate-800 max-h-96 overflow-y-auto">
                  {application.emailBody || (
                    <span className="text-slate-400 italic">No email body generated</span>
                  )}
                </div>
              </div>

              {application.resume && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900">
                  <Paperclip className="w-4 h-4 text-indigo-600" />
                  <span>
                    Attached Resume: <strong>{application.resume.originalName}</strong>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card>
            <CardHeader
              title="Interviewer &amp; Follow-up Notes"
              subtitle="Keep track of responses, recruiter calls, salary notes, and interview prep"
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSaveNotes}
                  isLoading={isSavingNotes}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Notes
                </Button>
              }
            />
            <CardContent>
              <textarea
                rows={5}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Log notes about screening calls, questions asked, salary ranges discussed, or interview dates..."
                className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Timeline & Audit Events */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Application Timeline"
              subtitle="Chronological audit history"
            />
            <CardContent className="p-4">
              {application.events && application.events.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {application.events.map((evt: any) => (
                    <div key={evt.id} className="relative">
                      <div className="absolute -left-[19px] top-0.5 w-3 h-3 rounded-full border-2 border-white bg-indigo-600 ring-2 ring-indigo-100" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          {evt.description}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {new Date(evt.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No timeline events recorded yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Job Overview details */}
          <Card>
            <CardHeader title="Role Overview" />
            <CardContent className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-400 block text-[10px] uppercase">
                  Location &amp; Type
                </span>
                <p className="text-slate-800 font-medium">
                  {application.location || 'Not specified'} ({application.workType || 'Unknown'})
                </p>
              </div>

              {application.jobUrl && (
                <div>
                  <span className="font-semibold text-slate-400 block text-[10px] uppercase">
                    Job Link
                  </span>
                  <a
                    href={application.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline break-all"
                  >
                    {application.jobUrl}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
