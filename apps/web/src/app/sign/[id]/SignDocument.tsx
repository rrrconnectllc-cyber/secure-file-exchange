'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, Button, Card, CardBody, CardHeader, Input } from '@/components';
import { Logo } from '@/components/Logo';
import { api } from '@/lib/api';

interface SignatureView {
  id: string;
  status: string;
  signerName: string;
  documentName: string;
  matterName: string;
  clientName: string;
  organizationName: string;
  signedName: string | null;
}

export function SignDocument() {
  const params = useParams<{ id: string }>();
  const [request, setRequest] = useState<SignatureView | null>(null);
  const [signedName, setSignedName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Accept document | SFX for Legal';
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api<SignatureView>(`/api/v1/sign/${params.id}`, {}, false);
        if (cancelled) return;
        setRequest(data);
        setSignedName(data.signerName);
        if (data.status === 'signed') setDone(true);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this request');
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const accept = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api(`/api/v1/sign/${params.id}`, {
        method: 'POST',
        body: JSON.stringify({ signedName }),
      }, false);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record acceptance');
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6"><Logo /></div>
        <Card variant="outline">
          <CardHeader>
            <h1 className="text-2xl font-bold text-navy">Accept this document</h1>
            {request && (
              <p className="mt-1 text-sm text-secondary-600">
                {request.organizationName} asks you to accept {request.documentName} on {request.matterName} for {request.clientName}.
              </p>
            )}
          </CardHeader>
          <CardBody>
            {error && <Alert variant="danger" className="mb-6">{error}</Alert>}
            {done ? (
              <Alert variant="success">Your acceptance is recorded.</Alert>
            ) : request ? (
              <form className="space-y-4" onSubmit={accept}>
                <Input label="Type your name" name="signedName" value={signedName} onChange={(event) => setSignedName(event.target.value)} required />
                <p className="text-sm text-secondary-600">Typing your name records that you reviewed and accept this document. It is not a DocuSign ceremony.</p>
                <Button type="submit" className="w-full" isLoading={saving}>Record acceptance</Button>
              </form>
            ) : (
              !error && <p className="text-sm text-secondary-600">Loading the request…</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
