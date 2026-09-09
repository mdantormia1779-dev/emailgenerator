'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Send,
  CalendarCheck,
  Award,
  XCircle,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface DashboardStats {
  total: number;
  sent: number;
  interviews: number;
  shortlisted: number;
  rejected: number;
  offers: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    sent: 0,
    interviews: 0,
    shortlisted: 0,
    rejected: 0,
    offers: 0,
    responseRate: 0,
    interviewRate: 0,
    offerRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const [facebookStats, setFacebookStats] = useState({
    totalScanned: 0,
    relevantJobs: 0,
    draftApplications: 0,
    ignored: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [appRes, fbRes] = await Promise.all([
          fetch('/api/applications'),
          fetch('/api/facebook/scanner'),
        ]);

        const json = await appRes.json();
        if (json.success && json.data) {
          const apps: any[] = json.data;
          setApplications(apps);

          const total = apps.length;
          const sent = apps.filter(a => ['SENT', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'REJECTED'].includes(a.status)).length;
          const shortlisted = apps.filter(a => a.status === 'SHORTLISTED').length;
          const interviews = apps.filter(a => a.status === 'INTERVIEW').length;
          const rejected = apps.filter(a => a.status === 'REJECTED').length;
          const offers = apps.filter(a => a.status === 'OFFER').length;

          // Conversion rates based on sent applications
          const responses = shortlisted + interviews + offers;
          const responseRate = sent > 0 ? Math.round((responses / sent) * 100) : 0;
          const interviewRate = sent > 0 ? Math.round((interviews / sent) * 100) : 0;
          const offerRate = sent > 0 ? Math.round((offers / sent) * 100) : 0;

          setStats({
            total,
            sent,
            interviews,
            shortlisted,
            rejected,
            offers,
            responseRate,
            interviewRate,
            offerRate,
          });
        }

        const fbJson = await fbRes.json();
        if (fbJson.success && fbJson.data?.stats) {
          setFacebookStats(fbJson.data.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const kpis = [
    { label: 'Total Applications', value: stats.total, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Sent Applications', value: stats.sent, icon: Send, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Interviews', value: stats.interviews, icon: CalendarCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Offers Received', value: stats.offers, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Shortlisted', value: stats.shortlisted, icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-indigo-300" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Welcome back
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">JobApply AI Dashboard</h1>
          <p className="text-indigo-200 text-sm mt-1 max-w-xl">
            Analyze job listings, match against your profile, generate factual emails, and safely dispatch with full review.
          </p>
        </div>
        <Link href="/applications/new">
          <Button
            size="lg"
            className="bg-indigo-50 font-semibold shadow"
            leftIcon={<PlusCircle className="w-5 h-5" />}
          >
            Start New Application
          </Button>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
                <div className={`w-7 h-7 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Conversion Rates */}
      <Card>
        <CardHeader
          title="Conversion & Success Metrics"
          subtitle="Real-time application pipeline performance"
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Response Rate</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.responseRate}%</p>
                <p className="text-xs text-slate-500 mt-0.5">Shortlisted / Interviews / Offers from sent</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500 flex items-center justify-center font-bold text-indigo-600 text-xs">
                {stats.responseRate}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interview Rate</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.interviewRate}%</p>
                <p className="text-xs text-slate-500 mt-0.5">Scheduled interviews from sent</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-amber-500 flex items-center justify-center font-bold text-amber-600 text-xs">
                {stats.interviewRate}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Offer Rate</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.offerRate}%</p>
                <p className="text-xs text-slate-500 mt-0.5">Formal offers converted</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-emerald-600 text-xs">
                {stats.offerRate}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facebook Job Scanner Section */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/30">
        <CardHeader
          title="Facebook Job Feed Scanner"
          subtitle="Automated post reader matching Frontend, React, Next.js, MERN & Full Stack roles"
          action={
            <Link href="/facebook-scanner">
              <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Open Facebook Scanner
              </Button>
            </Link>
          }
        />
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Scanned Posts
              </span>
              <span className="text-xl font-bold text-slate-800 mt-0.5 block">
                {facebookStats.totalScanned}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-indigo-200 shadow-2xs">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                Relevant Jobs
              </span>
              <span className="text-xl font-bold text-indigo-900 mt-0.5 block">
                {facebookStats.relevantJobs}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-emerald-200 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Draft Applications
              </span>
              <span className="text-xl font-bold text-emerald-900 mt-0.5 block">
                {facebookStats.draftApplications}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ignored
              </span>
              <span className="text-xl font-bold text-slate-600 mt-0.5 block">
                {facebookStats.ignored}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications & Quick Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent Applications"
              subtitle="Latest tracked opportunities and send statuses"
              action={
                <Link href="/applications" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : applications.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h4 className="font-medium text-slate-800 text-sm">No applications created yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Start by pasting a job description to extract details, match your skills, and generate your customized email.
                  </p>
                  <Link href="/applications/new">
                    <Button size="sm" className="mt-2">Create First Application</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {applications.slice(0, 5).map(app => (
                    <div key={app.id} className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900 text-sm truncate">{app.jobTitle}</h4>
                          <Badge status={app.status} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{app.companyName}</span>
                          <span>•</span>
                          <span>{app.recipientEmail || 'No recipient set'}</span>
                          {app.matchScore && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-indigo-600">{app.matchScore}% Match</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/applications/${app.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 10-Step Workflow Guide Card */}
        <div>
          <Card>
            <CardHeader
              title="Safe 10-Step Pipeline"
              subtitle="Enforced zero-hallucination workflow"
            />
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-2 rounded-lg bg-indigo-50/50">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  1-3
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Job Input &amp; Extraction</p>
                  <p className="text-slate-500">Extracts title, company, requirements, and detects recipient emails.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-lg bg-indigo-50/50">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  4
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Deterministic Matching</p>
                  <p className="text-slate-500">Scores technical fit (50%), experience (20%), and projects (20%).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-lg bg-indigo-50/50">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  5-6
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Factual Email &amp; Editor</p>
                  <p className="text-slate-500">Zero hallucination: uses only profile facts. Full manual editing freedom.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  7-10
                </span>
                <div>
                  <p className="font-semibold text-emerald-900">Review, 4 Confirmations &amp; Send</p>
                  <p className="text-emerald-700">Strict safety: Send requires explicit confirmation of all details.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
