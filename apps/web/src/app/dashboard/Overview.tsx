'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDateTime, titleCaseAction } from '@/lib/format';
import type { ActivityLog } from '@/lib/types';
import { Alert, Badge } from '@/components';
import { StatsCard } from '@/components/StatsCard';
import { Spinner } from '@/components/Spinner';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/Table';

interface MatterSummary {
  openMatters: number;
  pendingApprovals: number;
  documentsThisMonth: number;
}

interface MatterRow {
  id: string;
  name: string;
  clientName: string;
  status: string;
  fileCount: number;
}

export function Overview() {
  const [stats, setStats] = useState<MatterSummary | null>(null);
  const [matters, setMatters] = useState<MatterRow[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      const [statsResult, mattersResult, activityResult] = await Promise.allSettled([
        api<MatterSummary>('/api/v1/matters/summary'),
        api<MatterRow[]>('/api/v1/matters'),
        api<ActivityLog[]>('/api/v1/dashboard/activity'),
      ]);

      if (cancelled) return;

      if (statsResult.status === 'fulfilled') setStats(statsResult.value);
      if (mattersResult.status === 'fulfilled') setMatters(mattersResult.value);
      if (activityResult.status === 'fulfilled') setActivity(activityResult.value);

      const failure = [statsResult, mattersResult, activityResult].find((result) => result.status === 'rejected');
      if (failure && failure.status === 'rejected') {
        setError(failure.reason instanceof Error ? failure.reason.message : 'Could not load the dashboard');
      }
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Spinner label="Loading dashboard" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="sfx-title text-3xl">Dashboard</h1>
        <p className="sfx-muted mt-2">Open matters, documents waiting for approval, and what the firm did.</p>
        <p className="sfx-muted mt-2 text-sm">
          Opening the first matter? Follow the{' '}
          <Link href="/guide" className="font-medium text-cerulean hover:text-navy">
            setup guide
          </Link>
          , including the checks people skip. The PDF is on that page if you need to send it to someone else.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Open matters" value={stats?.openMatters ?? 0} detail="Cases still being worked" />
        <StatsCard label="Pending approvals" value={stats?.pendingApprovals ?? 0} detail="Waiting for a decision" />
        <StatsCard label="Documents this month" value={stats?.documentsThisMonth ?? 0} detail="Filed since the first of the month" />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="sfx-title text-xl">Matters</h2>
          <Link href="/dashboard/matters" className="text-sm font-medium text-cerulean hover:text-navy">
            All matters
          </Link>
        </div>
        {matters.length === 0 ? (
          <p className="sfx-panel sfx-muted px-4 py-8 text-sm">No matters yet. Open one for a client.</p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Matter</TableHeaderCell>
                <TableHeaderCell>Client</TableHeaderCell>
                <TableHeaderCell>Documents</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matters.map((matter) => (
                <TableRow key={matter.id}>
                  <TableCell className="font-medium text-navy">
                    <Link href={`/dashboard/matters/${matter.id}`} className="hover:text-cerulean">{matter.name}</Link>
                  </TableCell>
                  <TableCell>{matter.clientName}</TableCell>
                  <TableCell className="font-mono">{matter.fileCount}</TableCell>
                  <TableCell>
                    <Badge variant={matter.status === 'open' ? 'success' : 'secondary'}>{matter.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Link href="/dashboard/matters" className="sfx-panel block p-6 text-navy hover:border-cerulean hover:text-navy">
          <h3 className="text-lg font-bold">Open a matter</h3>
          <p className="sfx-muted mt-2 text-sm">Start a case and file the documents that belong to it.</p>
        </Link>
        <Link href="/dashboard/approvals" className="sfx-panel block p-6 text-navy hover:border-cerulean hover:text-navy">
          <h3 className="text-lg font-bold">Review approvals</h3>
          <p className="sfx-muted mt-2 text-sm">Release a document or send it back.</p>
        </Link>
      </section>

      <section id="activity" className="scroll-mt-24">
        <h2 className="sfx-title mb-3 text-xl">Activity</h2>
        <div className="sfx-panel divide-y divide-navy/10">
          {activity.length === 0 ? (
            <p className="sfx-muted px-4 py-8 text-sm">No activity yet. Invites and setting changes will show up here.</p>
          ) : (
            activity.map((entry) => (
              <div key={entry.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-navy">{titleCaseAction(entry.action)}</p>
                  <p className="sfx-muted text-sm">
                    {entry.user?.name || entry.user?.email || 'System'}
                    {entry.details ? ` · ${entry.details}` : ''}
                  </p>
                </div>
                <p className="font-mono text-xs text-secondary-500">{formatDateTime(entry.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
