import { useState, useEffect } from 'react';

export interface DashboardStats {
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

export function useDashboardData() {
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

  return { applications, stats, loading, facebookStats };
}
