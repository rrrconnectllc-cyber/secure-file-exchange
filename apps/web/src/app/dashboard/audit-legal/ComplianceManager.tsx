'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDateTime, titleCaseAction } from '@/lib/format';
import type { ActivityLog } from '@/lib/types';
import { Alert } from '@/components';
import { Spinner } from '@/components/Spinner';

export function ComplianceManager() {
  const [rows, setRows] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api<ActivityLog[]>('/api/v1/dashboard/activity');
        if (!cancelled) setRows(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load the report');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="sfx-title text-3xl">Compliance reports</h1>
        <p className="sfx-muted mt-2">Who opened a matter, requested approval, and accepted a document. This is the firm&apos;s activity record, not a certification.</p>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Spinner label="Loading the report" />
      ) : rows.length === 0 ? (
        <p className="sfx-panel sfx-muted px-4 py-8 text-sm">No activity yet.</p>
      ) : (
        <div className="sfx-panel divide-y divide-navy/10">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-navy">{titleCaseAction(row.action)}</p>
                <p className="sfx-muted text-sm">
                  {row.user?.name || row.user?.email || 'System'}
                  {row.details ? ` · ${row.details}` : ''}
                </p>
              </div>
              <p className="font-mono text-xs text-secondary-500">{formatDateTime(row.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
