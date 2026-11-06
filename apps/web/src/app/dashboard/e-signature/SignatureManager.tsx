'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { Alert, Badge, Button } from '@/components';
import { EmptyState } from '@/components/EmptyState';
import { Spinner } from '@/components/Spinner';

interface SignatureRow {
  id: string;
  status: string;
  signerName: string;
  signerEmail: string;
  signedName: string | null;
  signedAt: string | null;
  createdAt: string;
  matter: { id: string; name: string };
  file: { id: string; name: string };
}

export function SignatureManager() {
  const [rows, setRows] = useState<SignatureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api<SignatureRow[]>('/api/v1/signatures');
        if (!cancelled) setRows(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load signature requests');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const copy = async (id: string) => {
    const link = `${window.location.origin}/sign/${id}`;
    await navigator.clipboard.writeText(link);
    setNotice('Acceptance link copied.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="sfx-title text-3xl">Signature requests</h1>
        <p className="sfx-muted mt-2">Ask a client to type their name and accept a document. DocuSign is not connected.</p>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {notice && <Alert variant="success" onClose={() => setNotice(null)}>{notice}</Alert>}
      {loading ? (
        <Spinner label="Loading signature requests" />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No signature requests"
          description="Open a matter and ask someone to accept a document. The link can be copied from there."
          action={<Button href="/dashboard/matters">Open matters</Button>}
        />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row.id} className="sfx-panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="sfx-title text-lg">{row.file.name}</h2>
                  <Badge variant={row.status === 'signed' ? 'success' : 'warning'}>{row.status}</Badge>
                </div>
                <p className="sfx-muted mt-1 text-sm">
                  {row.signerName} · {row.signerEmail}
                  {' · '}
                  <Link href={`/dashboard/matters/${row.matter.id}`} className="text-cerulean hover:text-navy">{row.matter.name}</Link>
                </p>
                <p className="sfx-muted mt-1 font-mono text-xs">
                  {row.signedAt ? `Accepted ${formatDateTime(row.signedAt)} as ${row.signedName}` : `Requested ${formatDateTime(row.createdAt)}`}
                </p>
              </div>
              {row.status === 'pending' && (
                <Button size="sm" variant="outline" onClick={() => void copy(row.id)}>Copy link</Button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
