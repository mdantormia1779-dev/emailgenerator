import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NormalizedJobOpportunity } from '@/server/services/meta-job-scanner.service';

export type ScanStep =
  | 'idle'
  | 'scanning'
  | 'searching'
  | 'fetching_next_page'
  | 'matching_jobs'
  | 'removing_duplicates'
  | 'complete';

export const SCAN_STEP_LABELS: Record<ScanStep, string> = {
  idle: 'Scan Managed Page Jobs',
  scanning: 'Scanning...',
  searching: 'Searching supported sources...',
  fetching_next_page: 'Fetching next page...',
  matching_jobs: 'Matching jobs...',
  removing_duplicates: 'Removing duplicates...',
  complete: 'Complete',
};

export function useFacebookScannerWorkflow() {
  const router = useRouter();
  const [jobs, setJobs] = useState<NormalizedJobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanStep, setScanStep] = useState<ScanStep>('idle');
  const [isIngesting, setIsIngesting] = useState(false);
  const [generatingJobId, setGeneratingJobId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [metaInfo, setMetaInfo] = useState<{
    isConnected: boolean;
    name?: string | null;
    email?: string | null;
    pages?: Array<{ id: string; name: string; category?: string }>;
  } | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>('ALL');

  const [syncStats, setSyncStats] = useState<{
    scanned: number;
    newJobs: number;
    duplicates: number;
    matched: number;
    highMatch: number;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [scoreTierFilter, setScoreTierFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');

  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [inputTab, setInputTab] = useState<'links' | 'text'>('links');
  const [inputUrlsText, setInputUrlsText] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [pastedUrl, setPastedUrl] = useState('');

  const [selectedJob, setSelectedJob] = useState<NormalizedJobOpportunity | null>(null);
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
      if (json.success && json.data) setMetaInfo(json.data);
    } catch (err) {
      console.warn('Failed to load Meta status:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchMetaStatus();
  }, []);

  const handleScanFacebookJobs = async () => {
    setFeedback(null);
    setScanStep('scanning');

    const t1 = setTimeout(() => setScanStep('searching'), 400);
    const t2 = setTimeout(() => setScanStep('fetching_next_page'), 900);
    const t3 = setTimeout(() => setScanStep('matching_jobs'), 1400);
    const t4 = setTimeout(() => setScanStep('removing_duplicates'), 1900);

    try {
      const res = await fetch('/api/jobs/meta/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: selectedPageId !== 'ALL' ? selectedPageId : undefined }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to scan Meta opportunities');

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
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      setScanStep('idle');
      setFeedback({ type: 'error', message: err.message || 'Error scanning Meta jobs.' });
    }
  };

  const handleIngestInput = async () => {
    setIsIngesting(true);
    setFeedback(null);
    try {
      let payload: any = {};
      if (inputTab === 'links') {
        const urls = inputUrlsText.split('\n').map(u => u.trim()).filter(Boolean);
        if (urls.length === 0) throw new Error('Please enter at least one valid URL.');
        payload = { urls };
      } else {
        if (!pastedContent.trim()) throw new Error('Please paste job post text.');
        payload = { posts: [{ content: pastedContent.trim(), postUrl: pastedUrl.trim() || undefined }] };
      }
      const res = await fetch('/api/jobs/facebook/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to process job input');
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

  const handleGenerateEmail = async (jobId: string) => {
    setGeneratingJobId(jobId);
    setFeedback(null);
    try {
      let res = await fetch(`/api/jobs/meta/${jobId}/generate-email`, { method: 'POST' });
      if (res.status === 404) res = await fetch(`/api/jobs/facebook/${jobId}/generate-email`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to generate email');
      setFeedback({ type: 'success', message: 'Email draft created! Redirecting...' });
      setJobs(prev => prev.map(j => (j.id === jobId ? { ...j, status: 'EMAIL_GENERATED' } : j)));
      setTimeout(() => router.push(`/applications/${json.applicationId}`), 1000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error generating email draft.' });
    } finally {
      setGeneratingJobId(null);
    }
  };

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
      if (json.success) setJobs(prev => prev.map(j => (j.id === jobId ? { ...j, status: 'REJECTED' } : j)));
    } catch (err) {
      console.error('Failed to reject job:', err);
    }
  };

  const handleVerifyLink = async (jobId: string, url: string) => {
    setLinkVerifications(prev => ({ ...prev, [jobId]: { verifying: true } }));
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
          [jobId]: { verifying: false, isLive: json.data.isLive, status: json.data.status, title: json.data.title },
        }));
      } else {
        setLinkVerifications(prev => ({ ...prev, [jobId]: { verifying: false, isLive: false, status: 0 } }));
      }
    } catch {
      setLinkVerifications(prev => ({ ...prev, [jobId]: { verifying: false, isLive: false, status: 0 } }));
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const filteredJobs = jobs.filter(job => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchText = `${job.title} ${job.company} ${(job.skills || []).join(' ')} ${job.description}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    if (statusFilter !== 'ALL' && job.status !== statusFilter) return false;
    if (scoreTierFilter === 'EXCELLENT' && job.matchScore < 90) return false;
    if (scoreTierFilter === 'STRONG' && (job.matchScore < 75 || job.matchScore >= 90)) return false;
    if (scoreTierFilter === 'POTENTIAL' && (job.matchScore < 60 || job.matchScore >= 75)) return false;
    if (scoreTierFilter === 'LOW' && job.matchScore >= 60) return false;
    if (locationFilter !== 'ALL' && !(job.location || '').toLowerCase().includes(locationFilter.toLowerCase())) return false;
    if (dateFilter !== 'ALL' && job.postedAt) {
      const diffDays = (Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (dateFilter === 'TODAY' && diffDays > 1) return false;
      if (dateFilter === 'WEEK' && diffDays > 7) return false;
      if (dateFilter === 'MONTH' && diffDays > 30) return false;
    }
    return true;
  });

  const isScanningActive = scanStep !== 'idle' && scanStep !== 'complete';

  return {
    jobs,
    filteredJobs,
    loading,
    scanStep,
    isScanningActive,
    isIngesting,
    generatingJobId,
    feedback,
    setFeedback,
    metaInfo,
    selectedPageId,
    setSelectedPageId,
    syncStats,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    scoreTierFilter,
    setScoreTierFilter,
    locationFilter,
    setLocationFilter,
    dateFilter,
    setDateFilter,
    isInputModalOpen,
    setIsInputModalOpen,
    inputTab,
    setInputTab,
    inputUrlsText,
    setInputUrlsText,
    pastedContent,
    setPastedContent,
    pastedUrl,
    setPastedUrl,
    selectedJob,
    setSelectedJob,
    linkVerifications,
    copiedLink,
    handleScanFacebookJobs,
    handleIngestInput,
    handleGenerateEmail,
    handleRejectJob,
    handleVerifyLink,
    handleCopyLink,
  };
}
