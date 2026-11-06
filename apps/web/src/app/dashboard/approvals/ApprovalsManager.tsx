'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { Alert, Badge, Button } from '@/components';
import { EmptyState } from '@/components/EmptyState';
import { Spinner } from '@/components/Spinner';

interface Approval {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
  matter: { id: string; name: string };
  file: { id: string; name: string };
}

function statusVariant(status: string): 'warning' | 'success' | 'danger' | 'secondary' {
  if (status === 'pending') return 'warning';
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'danger';
  return 'secondary';
}

export function ApprovalsManager() {
  const [rows, setRows] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await api<Approval[]>('/api/v1/approvals'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const decide = async (id: string, status: 'approved' | 'rejected') => {
    setBusyId(id);
    setError(null);
    try {
      await api(`/api/v1/approvals/${id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record the decision');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="sfx-title text-3xl">Approvals</h1>
        <p className="sfx-muted mt-2">Documents waiting for someone at the firm to release or refuse them.</p>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Spinner label="Loading approvals" />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Nothing waiting"
          description="Request approval from a document inside a matter."
          action={<Button href="/dashboard/matters">Open matters</Button>}
        />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row.id} className="sfx-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="sfx-title text-lg">{row.file.name}</h2>
                  <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                </div>
                <p className="sfx-muted mt-1 text-sm">
                  <Link href={`/dashboard/matters/${row.matter.id}`} className="text-cerulean hover:text-navy">{row.matter.name}</Link>
                  {' · '}
                  {formatDateTime(row.createdAt)}
                </p>
              </div>
              {row.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => void decide(row.id, 'approved')} isLoading={busyId === row.id}>Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => void decide(row.id, 'rejected')} disabled={busyId === row.id}>Reject</Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
