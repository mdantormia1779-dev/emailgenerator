'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ExternalLink,
  Mail,
  CheckCircle2,
  XCircle,
  Play,
  ArrowRight,
  ShieldCheck,
  Building2,
  Plus,
  Link2,
  Copy,
  Check,
  Globe,
  Radio,
  FileText,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  AlertCircle,
  Clock,
  Eye,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { NormalizedJobOpportunity, MatchTier, JobStatus } from '@/server/services/meta-job-scanner.service';

type ScanStep =
  | 'idle'
  | 'scanning'
  | 'searching'
  | 'fetching_next_page'
  | 'matching_jobs'
  | 'removing_duplicates'
  | 'complete';

const SCAN_STEP_LABELS: Record<ScanStep, string> = {
  idle: 'Scan Managed Page Jobs',
  scanning: 'Scanning...',
  searching: 'Searching supported sources...',
  fetching_next_page: 'Fetching next page...',
  matching_jobs: 'Matching jobs...',
  removing_duplicates: 'Removing duplicates...',
  complete: 'Complete',
};

export default function FacebookJobDiscoveryPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<NormalizedJobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanStep, setScanStep] = useState<ScanStep>('idle');
  const [isIngesting, setIsIngesting] = useState(false);
  const [generatingJobId, setGeneratingJobId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Meta Account & Pages State
  const [metaInfo, setMetaInfo] = useState<{
    isConnected: boolean;
    name?: string | null;
    email?: string | null;
    pages?: Array<{ id: string; name: string; category?: string }>;
  } | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>('ALL');

  // Sync Stats
  const [syncStats, setSyncStats] = useState<{
    scanned: number;
    newJobs: number;
    duplicates: number;
    matched: number;
    highMatch: number;
  } | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [scoreTierFilter, setScoreTierFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');

  // Modal States
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [inputTab, setInputTab] = useState<'links' | 'text'>('links');
  const [inputUrlsText, setInputUrlsText] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [pastedUrl, setPastedUrl] = useState('');

  // Job Details Modal
  const [selectedJob, setSelectedJob] = useState<NormalizedJobOpportunity | null>(null);

  // Link verification state map
  const [linkVerifications, setLinkVerifications] = useState<Record<string, any>>({});
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs/meta/search');
      const json = await res.json();
      if (json.success && Array.isArray(json.opportunities)) {
        setJobs(json.opportunities);
      } else {
        const fbRes = await fetch('/api/jobs/facebook/search');
        const fbJson = await fbRes.json();
        if (fbJson.success && Array.isArray(fbJson.data)) {
          setJobs(fbJson.data);
        }
      }
    } catch (err) {
      console.error('Failed to load discovered jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetaStatus = async () => {
    try {
      const res = await fetch('/api/integrations/meta/status');
      const json = await res.json();
      if (json.success && json.data) {
        setMetaInfo(json.data);
      }
    } catch (err) {
      console.warn('Failed to load Meta integration status:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchMetaStatus();
  }, []);

  // Multi-step Auto Discovery:
  // Scanning... -> Searching supported sources... -> Fetching next page... -> Matching jobs... -> Removing duplicates... -> Complete
  const handleScanFacebookJobs = async () => {
    setFeedback(null);
    setScanStep('scanning');

    const stepTimer1 = setTimeout(() => setScanStep('searching'), 400);
    const stepTimer2 = setTimeout(() => setScanStep('fetching_next_page'), 900);
    const stepTimer3 = setTimeout(() => setScanStep('matching_jobs'), 1400);
    const stepTimer4 = setTimeout(() => setScanStep('removing_duplicates'), 1900);

    try {
      const res = await fetch('/api/jobs/meta/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: selectedPageId !== 'ALL' ? selectedPageId : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to scan Meta opportunities');
      }

      setScanStep('complete');

      const highMatchCount = (json.jobs || []).filter((j: any) => (j.matchScore || 0) >= 75).length;

      setSyncStats({
        scanned: json.fetched || 0,
        newJobs: json.newJobs || 0,
        duplicates: json.duplicates || 0,
        matched: json.matched || 0,
        highMatch: highMatchCount,
      });

      setFeedback({
        type: 'success',
        message: `Job discovery completed: ${json.newJobs || 0} new jobs found, ${json.duplicates || 0} duplicates filtered, ${json.matched || 0} matched your profile.`,
      });

      fetchJobs();
      setTimeout(() => setScanStep('idle'), 3500);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
      setScanStep('idle');
      setFeedback({ type: 'error', message: err.message || 'Error scanning Meta jobs.' });
    }
  };

  // Ingest Real Job Links or Pasted Text
  const handleIngestInput = async () => {
    setIsIngesting(true);
    setFeedback(null);

    try {
      let payload: any = {};

      if (inputTab === 'links') {
        const urls = inputUrlsText
          .split('\n')
          .map(u => u.trim())
          .filter(u => u.length > 0);

        if (urls.length === 0) {
          throw new Error('Please enter at least one valid Facebook or job link URL.');
        }
        payload = { urls };
      } else {
        if (!pastedContent.trim()) {
          throw new Error('Please paste the scrolled Facebook job post text.');
        }
        payload = {
          posts: [
            {
              content: pastedContent.trim(),
              postUrl: pastedUrl.trim() || undefined,
            },
          ],
        };
      }

      const res = await fetch('/api/jobs/facebook/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to process job input');
      }

      setFeedback({ type: 'success', message: json.message });
      fetchJobs();
      setIsInputModalOpen(false);
      setInputUrlsText('');
      setPastedContent('');
      setPastedUrl('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error processing job input' });
    } finally {
      setIsIngesting(false);
    }
  };

  // Generate Email -> Generate -> Review -> Send pipeline
  const handleGenerateEmail = async (jobId: string) => {
    setGeneratingJobId(jobId);
    setFeedback(null);

    try {
      let res = await fetch(`/api/jobs/meta/${jobId}/generate-email`, { method: 'POST' });
      if (res.status === 404) {
        res = await fetch(`/api/jobs/facebook/${jobId}/generate-email`, { method: 'POST' });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate application email');
      }

      setFeedback({
        type: 'success',
        message: 'Personalized email draft created! Redirecting to Review Application...',
      });

      // Update local state
      setJobs(prev =>
        prev.map(j => (j.id === jobId ? { ...j, status: 'EMAIL_GENERATED' } : j))
      );

      // Redirect to review page for human-in-the-loop manual confirmation
      setTimeout(() => {
        router.push(`/applications/${json.applicationId}`);
      }, 1000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error generating email draft.' });
    } finally {
      setGeneratingJobId(null);
    }
  };

  // Reject Job Opportunity
  const handleRejectJob = async (jobId: string) => {
    try {
      let res = await fetch(`/api/jobs/meta/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      });
      if (res.status === 404) {
        res = await fetch(`/api/jobs/facebook/${jobId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'REJECTED' }),
        });
      }

      const json = await res.json();
      if (json.success) {
        setJobs(prev =>
          prev.map(j => (j.id === jobId ? { ...j, status: 'REJECTED' } : j))
        );
      }
    } catch (err) {
      console.error('Failed to reject job:', err);
    }
  };

  // Live Link Verification
  const handleVerifyLink = async (jobId: string, url: string) => {
    setLinkVerifications(prev => ({
      ...prev,
      [jobId]: { verifying: true },
    }));

    try {
      const res = await fetch('/api/facebook/verify-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setLinkVerifications(prev => ({
          ...prev,
          [jobId]: {
            verifying: false,
            isLive: json.data.isLive,
            status: json.data.status,
            title: json.data.title,
          },
        }));
      } else {
        setLinkVerifications(prev => ({
          ...prev,
          [jobId]: { verifying: false, isLive: false, status: 0 },
        }));
      }
    } catch {
      setLinkVerifications(prev => ({
        ...prev,
        [jobId]: { verifying: false, isLive: false, status: 0 },
      }));
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Filter Computation
  const filteredJobs = jobs.filter(job => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchText = `${job.title} ${job.company} ${(job.skills || []).join(' ')} ${job.description}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    if (statusFilter !== 'ALL' && job.status !== statusFilter) {
      return false;
    }

    if (scoreTierFilter === 'EXCELLENT' && job.matchScore < 90) return false;
    if (scoreTierFilter === 'STRONG' && (job.matchScore < 75 || job.matchScore >= 90)) return false;
    if (scoreTierFilter === 'POTENTIAL' && (job.matchScore < 60 || job.matchScore >= 75)) return false;
    if (scoreTierFilter === 'LOW' && job.matchScore >= 60) return false;

    if (locationFilter !== 'ALL' && !(job.location || '').toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }

    if (dateFilter !== 'ALL' && job.postedAt) {
      const posted = new Date(job.postedAt).getTime();
      const now = Date.now();
      const diffDays = (now - posted) / (1000 * 60 * 60 * 24);
      if (dateFilter === 'TODAY' && diffDays > 1) return false;
      if (dateFilter === 'WEEK' && diffDays > 7) return false;
      if (dateFilter === 'MONTH' && diffDays > 30) return false;
    }

    return true;
  });

  const getTierBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 75) return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    if (score >= 60) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const getTierLabel = (score: number) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 75) return 'Strong Match';
    if (score >= 60) return 'Potential Match';
    return 'Low Match';
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'MATCHED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Profile Matched</span>;
      case 'EMAIL_GENERATED':
      case 'REVIEW_REQUIRED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">Draft Ready</span>;
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Approved</span>;
      case 'SENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">Sent via Gmail</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">Discovered</span>;
    }
  };

  const isScanningActive = scanStep !== 'idle' && scanStep !== 'complete';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Meta Job Discovery
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Meta-supported Page Job Scanner</h1>
          <p className="text-blue-200 text-xs mt-1 max-w-xl">
            Officially compliant job discovery from connected Facebook Pages using Meta Graph API with cursor pagination. Evaluates transparent match scores for your developer profile and prepares customized drafts for human review.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Main "Scan Managed Page Jobs" Button with Multi-step Progress */}
          <Button
            size="md"
            onClick={handleScanFacebookJobs}
            disabled={isScanningActive}
            className={`font-semibold text-xs shadow transition-all ${
              isScanningActive
                ? 'bg-amber-600 text-white'
                : scanStep === 'complete'
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
            leftIcon={
              isScanningActive ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : scanStep === 'complete' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )
            }
          >
            {SCAN_STEP_LABELS[scanStep]}
          </Button>

          <Button
            size="md"
            variant="outline"
            onClick={() => setIsInputModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Import a Facebook Job Link/Post manually
          </Button>
        </div>
      </div>

      {/* Managed Page Selector & Connection Status */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div>
            <span className="font-semibold text-slate-800 block">
              {metaInfo?.isConnected ? `Connected: ${metaInfo.name || 'Meta Account'}` : 'Meta Account Not Connected'}
            </span>
            <span className="text-[11px] text-slate-500">
              {metaInfo?.isConnected
                ? `${metaInfo.pages?.length || 0} Managed Facebook Page(s) available for official scanning`
                : 'Connect your Meta account in Integrations to enable automated page scans'}
            </span>
          </div>
        </div>

        {metaInfo?.isConnected && metaInfo.pages && metaInfo.pages.length > 0 ? (
          <div className="flex items-center gap-2">
            <label htmlFor="page-select" className="text-slate-600 font-medium whitespace-nowrap">
              Target Page:
            </label>
            <select
              id="page-select"
              value={selectedPageId}
              onChange={e => setSelectedPageId(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Managed Pages ({metaInfo.pages.length})</option>
              {metaInfo.pages.map(page => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>
        ) : !metaInfo?.isConnected ? (
          <Link href="/integrations">
            <Button size="sm" variant="outline">
              Connect Meta in Integrations
            </Button>
          </Link>
        ) : (
          <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
            No managed Pages found on this Meta account. Use manual import below.
          </span>
        )}
      </div>

      {/* Meta API Capabilities & Compliance Transparency Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Meta Official API Boundaries &amp; Capabilities Matrix
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Graph API v26.0 Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Supported Section */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Supported Official Capabilities</span>
            </div>
            <ul className="space-y-1.5 text-emerald-950 pl-5 list-disc marker:text-emerald-500">
              <li>
                <strong>Managed Page Feed Ingestion:</strong> Query posts from Pages you manage using <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono text-[10px]">pages_show_list</code> and <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono text-[10px]">pages_read_engagement</code>.
              </li>
              <li>
                <strong>Automated Cursor Pagination:</strong> Traverses multi-page feeds via official <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono text-[10px]">paging.cursors.after</code> &amp; <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono text-[10px]">paging.next</code>.
              </li>
              <li>
                <strong>Deterministic SHA-256 Deduplication:</strong> Prevents importing duplicate job postings across multiple scans.
              </li>
              <li>
                <strong>Resume &amp; Skill Matching:</strong> Transparent scoring against Frontend, React, Next.js, Node.js &amp; target skills.
              </li>
              <li>
                <strong>Manual Post/Link Import:</strong> Compliant manual ingestion for developer jobs found across groups or external boards.
              </li>
            </ul>
          </div>

          {/* Unsupported Section */}
          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-800 font-bold">
              <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>Unsupported by Meta Platform (Honest Boundaries)</span>
            </div>
            <ul className="space-y-1.5 text-rose-950 pl-5 list-disc marker:text-rose-500">
              <li>
                <strong>Personal News Feed Search:</strong> Meta deprecated <code className="bg-rose-100/80 px-1 py-0.5 rounded font-mono text-[10px]">/me/home</code>; private user feeds cannot be searched automatically.
              </li>
              <li>
                <strong>Arbitrary Public Keyword Search:</strong> Meta shut down the public post search API (<code className="bg-rose-100/80 px-1 py-0.5 rounded font-mono text-[10px]">/search?type=post</code>).
              </li>
              <li>
                <strong>Facebook Groups API:</strong> Meta permanently deprecated &amp; shut down the Facebook Groups API on April 22, 2024.
              </li>
              <li>
                <strong>Arbitrary Third-Party Pages:</strong> Requires Meta Page Public Content Access (PPCA) with Business Verification.
              </li>
              <li>
                <strong>Native Facebook Jobs API:</strong> Retired by Meta globally in 2023.
              </li>
              <li>
                <strong>Browser Scraping / Session Theft:</strong> Strictly prohibited. Zero cookie extraction or bot automation used.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Discovery Step Indicator when scanning */}
      {isScanningActive && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold">
            <span>Automated Discovery in Progress:</span>
            <span className="text-blue-700 font-mono uppercase">{SCAN_STEP_LABELS[scanStep]}</span>
          </div>
          <div className="flex items-center gap-1 w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{
                width:
                  scanStep === 'scanning'
                    ? '20%'
                    : scanStep === 'searching'
                    ? '40%'
                    : scanStep === 'fetching_next_page'
                    ? '60%'
                    : scanStep === 'matching_jobs'
                    ? '80%'
                    : scanStep === 'removing_duplicates'
                    ? '95%'
                    : '100%',
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-blue-600">
            <span>Scanning</span>
            <span>Searching Sources</span>
            <span>Pagination/Cursors</span>
            <span>Resume Matching</span>
            <span>Deduplication</span>
          </div>
        </div>
      )}

      {/* Sync Statistics Dashboard */}
      {syncStats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
            <span className="block text-[11px] text-slate-500 font-medium">Jobs Scanned</span>
            <span className="text-lg font-bold text-slate-800">{syncStats.scanned}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
            <span className="block text-[11px] text-slate-500 font-medium">New Jobs</span>
            <span className="text-lg font-bold text-blue-600">+{syncStats.newJobs}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
            <span className="block text-[11px] text-slate-500 font-medium">Duplicates</span>
            <span className="text-lg font-bold text-slate-500">{syncStats.duplicates}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
            <span className="block text-[11px] text-slate-500 font-medium">Matched Jobs</span>
            <span className="text-lg font-bold text-indigo-600">{syncStats.matched}</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-center col-span-2 sm:col-span-1">
            <span className="block text-[11px] text-slate-500 font-medium">High-Match (75%+)</span>
            <span className="text-lg font-bold text-emerald-600">{syncStats.highMatch}</span>
          </div>
        </div>
      )}

      {/* Safety & Pipeline Invariant Banner */}
      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Generate &rarr; Review &rarr; Manual Send Pipeline:</strong> All discovered jobs generate <strong>DRAFT</strong> emails only. Emails are NEVER sent autonomously. Dispatch always requires your explicit human confirmation via your connected Gmail.
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search jobs by keyword, title, company, or skills (e.g. React, Next.js, Node.js)..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Score Tier Filter */}
            <select
              value={scoreTierFilter}
              onChange={e => setScoreTierFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Match Scores</option>
              <option value="EXCELLENT">Excellent Matches (90%+)</option>
              <option value="STRONG">Strong Matches (75-89%)</option>
              <option value="POTENTIAL">Potential Matches (60-74%)</option>
              <option value="LOW">Low Matches (&lt;60%)</option>
            </select>

            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Locations</option>
              <option value="Remote">Remote Only</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Posted Today</option>
              <option value="WEEK">Past 7 Days</option>
              <option value="MONTH">Past 30 Days</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="DISCOVERED">Discovered</option>
              <option value="MATCHED">Profile Matched</option>
              <option value="EMAIL_GENERATED">Email Generated</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Discovered Opportunities Feed */}
      <Card>
        <CardHeader
          title="Discovered Job Opportunities"
          subtitle={`Showing ${filteredJobs.length} opportunity(ies) matched against target developer skills`}
        />
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-800 text-sm">No job opportunities in this view</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click <strong>&quot;Scan Managed Page Jobs&quot;</strong> to query your connected Meta Pages via Graph API v26.0, or click <strong>&quot;Import a Facebook Job Link/Post manually&quot;</strong> to parse real developer job postings.
              </p>
              <Button
                size="sm"
                onClick={() => setIsInputModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Import a Facebook Job Link/Post manually
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredJobs.map(job => {
                const verification = linkVerifications[job.id];

                return (
                  <div key={job.id} className="p-5 hover:bg-slate-50/70 transition space-y-3">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-base">
                            {job.title}
                          </h3>

                          {/* Match Score Tier Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${getTierBadgeColor(
                              job.matchScore
                            )}`}
                          >
                            {job.matchScore}% &bull; {job.matchTier || getTierLabel(job.matchScore)}
                          </span>

                          {/* Status Badge */}
                          {getStatusBadge(job.status)}
                        </div>

                        {/* Metadata row */}
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {job.company}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {job.location}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            {job.employmentType}
                          </span>
                          {job.postedAt && (
                            <>
                              <span>&bull;</span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {new Date(job.postedAt).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Primary Action Buttons */}
                      <div className="flex items-center gap-2 pt-1 sm:pt-0">
                        {job.status === 'EMAIL_GENERATED' || job.status === 'REVIEW_REQUIRED' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => router.push('/applications')}
                            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                          >
                            Review Application
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleGenerateEmail(job.id)}
                            isLoading={generatingJobId === job.id}
                            disabled={job.status === 'REJECTED'}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                          >
                            Generate Email
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedJob(job)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View Job
                        </Button>

                        {job.status !== 'REJECTED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRejectJob(job.id)}
                            className="text-slate-400 hover:text-rose-600 text-xs"
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Transparent Match Reason */}
                    <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Resume Alignment: </strong>
                        <span>{job.matchReason}</span>
                      </div>
                    </div>

                    {/* Job Link Box when available */}
                    {job.postUrl && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <Link2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span className="font-semibold text-slate-700 flex-shrink-0">Source URL:</span>
                          <a
                            href={job.postUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-700 font-mono underline truncate hover:text-blue-900"
                          >
                            {job.postUrl}
                          </a>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(job.postUrl!)}
                            className="px-2 py-0.5 text-[11px] rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                          >
                            {copiedLink === job.postUrl ? 'Copied' : 'Copy'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerifyLink(job.id, job.postUrl!)}
                            disabled={verification?.verifying}
                            className="px-2 py-0.5 text-[11px] rounded bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold"
                          >
                            {verification?.verifying ? 'Checking...' : 'Check Link'}
                          </button>
                          <a
                            href={job.postUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded bg-blue-600 text-white hover:bg-blue-700"
                          >
                            <span>Open Post</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Verification Result */}
                    {verification && !verification.verifying && (
                      <div
                        className={`text-xs p-2 rounded-lg flex items-center gap-2 ${
                          verification.isLive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {verification.isLive ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>
                              <strong>Live Verified:</strong> HTTP {verification.status || 200}.
                              {verification.title ? ` Title: "${verification.title}"` : ''}
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span>Link unreachable or requires active login.</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Contact Email & Matched Skills */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {job.contactEmail && (
                        <a
                          href={`mailto:${job.contactEmail}`}
                          className="flex items-center gap-1.5 font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded"
                        >
                          <Mail className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{job.contactEmail}</span>
                        </a>
                      )}

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {job.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content Preview */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/50 p-2 rounded border border-slate-100 font-sans">
                      {job.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Job Opportunity Modal */}
      {selectedJob && (
        <Modal
          isOpen={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          title={selectedJob.title}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="font-bold text-sm text-slate-900">{selectedJob.company}</span>
                <span className="text-slate-500 block">{selectedJob.location} &bull; {selectedJob.employmentType}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full font-bold border ${getTierBadgeColor(selectedJob.matchScore)}`}>
                {selectedJob.matchScore}% Match
              </span>
            </div>

            <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-indigo-950 space-y-1">
              <strong className="block text-indigo-900">Why this job matched your resume:</strong>
              <p>{selectedJob.matchReason}</p>
            </div>

            <div>
              <strong className="block text-slate-700 mb-1">Target Skills Found:</strong>
              <div className="flex flex-wrap gap-1">
                {selectedJob.skills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {selectedJob.contactEmail && (
              <div>
                <strong className="block text-slate-700 mb-1">Contact Email:</strong>
                <a href={`mailto:${selectedJob.contactEmail}`} className="text-indigo-600 font-mono underline">
                  {selectedJob.contactEmail}
                </a>
              </div>
            )}

            <div>
              <strong className="block text-slate-700 mb-1">Full Description:</strong>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans">
                {selectedJob.description}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedJob(null)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedJob(null);
                  handleGenerateEmail(selectedJob.id);
                }}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Generate Email Draft
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Input Job Links / Posts Modal */}
      <Modal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        title="Import a Facebook Job Link/Post manually"
      >
        <div className="space-y-4 text-xs">
          {/* Explicit Manual Ingestion Notice */}
          <div className="p-3 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-semibold">Compliant Manual Ingestion:</strong>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                Meta Graph API v26.0 does not permit automated scraping of personal feeds or private Facebook groups. Use this manual tool to paste job URLs or post texts you have discovered. The system will extract recruiter contact emails, match skills against your profile, and draft application emails for your manual review.
              </p>
            </div>
          </div>

          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setInputTab('links')}
              className={`pb-2 px-3 font-semibold text-xs border-b-2 transition ${
                inputTab === 'links'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Real URLs / Links
            </button>
            <button
              type="button"
              onClick={() => setInputTab('text')}
              className={`pb-2 px-3 font-semibold text-xs border-b-2 transition ${
                inputTab === 'text'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Paste Scrolled Text
            </button>
          </div>

          {inputTab === 'links' ? (
            <div className="space-y-3">
              <p className="text-slate-600">
                Paste one or multiple <strong>Facebook post URLs</strong> or developer job links (one per line). The system will fetch page information, extract contact emails, compute transparent resume matches against your target skills, and save them:
              </p>
              <textarea
                rows={6}
                value={inputUrlsText}
                onChange={e => setInputUrlsText(e.target.value)}
                placeholder={`https://facebook.com/groups/reactjobs/posts/10192837461
https://facebook.com/company/posts/992817263`}
                className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-600">
                Paste the content of a job post scrolled from Facebook developer groups:
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facebook Post URL (Optional)
                </label>
                <input
                  type="url"
                  value={pastedUrl}
                  onChange={e => setPastedUrl(e.target.value)}
                  placeholder="https://facebook.com/groups/.../posts/..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Post Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={6}
                  value={pastedContent}
                  onChange={e => setPastedContent(e.target.value)}
                  placeholder="Paste job posting text..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsInputModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              isLoading={isIngesting}
              disabled={inputTab === 'links' ? !inputUrlsText.trim() : !pastedContent.trim()}
              onClick={handleIngestInput}
              leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            >
              Process &amp; Score Jobs
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
