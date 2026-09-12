'use client';

import React from 'react';
import { Alert } from '@/components/ui/Alert';
import { ScannerHeader } from '@/components/facebook-scanner/ScannerHeader';
import { ScannerPageSelector } from '@/components/facebook-scanner/ScannerPageSelector';
import { CapabilitiesMatrix } from '@/components/facebook-scanner/CapabilitiesMatrix';
import { ScanStepProgress } from '@/components/facebook-scanner/ScanStepProgress';
import { ScannerStatsCards } from '@/components/facebook-scanner/ScannerStatsCards';
import { ScannerFilters } from '@/components/facebook-scanner/ScannerFilters';
import { JobFeedList } from '@/components/facebook-scanner/JobFeedList';
import { JobDetailsModal } from '@/components/facebook-scanner/JobDetailsModal';
import { ManualImportModal } from '@/components/facebook-scanner/ManualImportModal';
import { useFacebookScannerWorkflow } from '@/hooks/useFacebookScannerWorkflow';

export default function FacebookJobDiscoveryPage() {
  const fw = useFacebookScannerWorkflow();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <ScannerHeader
        scanStep={fw.scanStep}
        isScanningActive={fw.isScanningActive}
        onScan={fw.handleScanFacebookJobs}
        onOpenImport={() => fw.setIsInputModalOpen(true)}
      />

      <ScannerPageSelector
        metaInfo={fw.metaInfo}
        selectedPageId={fw.selectedPageId}
        setSelectedPageId={fw.setSelectedPageId}
      />

      <CapabilitiesMatrix />

      {fw.feedback && (
        <Alert type={fw.feedback.type} message={fw.feedback.message} onClose={() => fw.setFeedback(null)} />
      )}

      {fw.isScanningActive && <ScanStepProgress scanStep={fw.scanStep} />}

      <ScannerStatsCards syncStats={fw.syncStats} />

      <ScannerFilters
        searchQuery={fw.searchQuery}
        setSearchQuery={fw.setSearchQuery}
        scoreTierFilter={fw.scoreTierFilter}
        setScoreTierFilter={fw.setScoreTierFilter}
        locationFilter={fw.locationFilter}
        setLocationFilter={fw.setLocationFilter}
        dateFilter={fw.dateFilter}
        setDateFilter={fw.setDateFilter}
        statusFilter={fw.statusFilter}
        setStatusFilter={fw.setStatusFilter}
      />

      <JobFeedList
        jobs={fw.filteredJobs}
        loading={fw.loading}
        linkVerifications={fw.linkVerifications}
        generatingJobId={fw.generatingJobId}
        copiedLink={fw.copiedLink}
        onGenerateEmail={fw.handleGenerateEmail}
        onViewJob={job => fw.setSelectedJob(job)}
        onRejectJob={fw.handleRejectJob}
        onVerifyLink={fw.handleVerifyLink}
        onCopyLink={fw.handleCopyLink}
        onOpenImport={() => fw.setIsInputModalOpen(true)}
      />

      <JobDetailsModal
        selectedJob={fw.selectedJob}
        onClose={() => fw.setSelectedJob(null)}
        onGenerateEmail={fw.handleGenerateEmail}
      />

      <ManualImportModal
        isOpen={fw.isInputModalOpen}
        onClose={() => fw.setIsInputModalOpen(false)}
        inputTab={fw.inputTab}
        setInputTab={fw.setInputTab}
        inputUrlsText={fw.inputUrlsText}
        setInputUrlsText={fw.setInputUrlsText}
        pastedContent={fw.pastedContent}
        setPastedContent={fw.setPastedContent}
        pastedUrl={fw.pastedUrl}
        setPastedUrl={fw.setPastedUrl}
        isIngesting={fw.isIngesting}
        onIngest={fw.handleIngestInput}
      />
    </div>
  );
}
