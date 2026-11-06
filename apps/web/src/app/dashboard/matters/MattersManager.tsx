'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { Alert, Button, Input } from '@/components';
import { EmptyState } from '@/components/EmptyState';
import { Spinner } from '@/components/Spinner';

interface Matter {
  id: string;
  name: string;
  clientName: string;
  status: string;
  createdAt: string;
  fileCount: number;
  approvalCount: number;
}

export function MattersManager() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setMatters(await api<Matter[]>('/api/v1/matters'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load matters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await api('/api/v1/matters', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), clientName: clientName.trim() }),
      });
      setName('');
      setClientName('');
      setOpenForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the matter');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="sfx-title text-3xl">Matters</h1>
          <p className="sfx-muted mt-2">Cases and the documents that belong to them.</p>
        </div>
        <Button onClick={() => setOpenForm((open) => !open)}>Open matter</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {openForm && (
        <form className="sfx-panel grid gap-4 p-5 md:grid-cols-2" onSubmit={create}>
          <Input label="Matter" name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Hartwell acquisition" required />
          <Input label="Client" name="clientName" value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Hartwell Holdings" required />
          <div className="md:col-span-2">
            <Button type="submit" isLoading={creating}>Create matter</Button>
          </div>
        </form>
      )}

      {loading ? (
        <Spinner label="Loading matters" />
      ) : matters.length === 0 ? (
        <EmptyState
          title="No matters yet"
          description="Open a matter for a client, then add the documents that belong to that case."
          action={<Button onClick={() => setOpenForm(true)}>Open matter</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matters.map((matter) => (
            <Link key={matter.id} href={`/dashboard/matters/${matter.id}`} className="sfx-panel block p-5 hover:border-cerulean">
              <div className="flex items-start justify-between gap-3">
                <h2 className="sfx-title text-lg">{matter.name}</h2>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${matter.status === 'open' ? 'bg-cerulean/10 text-cerulean' : 'bg-navy/10 text-navy'}`}>
                  {matter.status === 'open' ? 'Open' : 'Closed'}
                </span>
              </div>
              <p className="sfx-muted mt-1 text-sm">{matter.clientName}</p>
              <p className="mt-4 text-sm text-navy">
                {matter.fileCount} documents · {matter.approvalCount} approvals
              </p>
              <p className="sfx-muted mt-1 font-mono text-xs">{formatDate(matter.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
