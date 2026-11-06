'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { formatBytes, formatDate } from '@/lib/format';
import { Alert, Button, Input } from '@/components';
import { Spinner } from '@/components/Spinner';

interface MatterFile {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  downloadCount: number;
}

interface Matter {
  id: string;
  name: string;
  clientName: string;
  status: string;
  files: MatterFile[];
}

function readAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });
}

export function MatterDetail() {
  const params = useParams<{ id: string }>();
  const matterId = params.id;
  const [matter, setMatter] = useState<Matter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signFileId, setSignFileId] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<Matter>(`/api/v1/matters/${matterId}`);
      setMatter(data);
      setSignFileId((current) => current || data.files[0]?.id || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the matter');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [matterId]);

  const upload = async () => {
    if (!file) {
      setError('Choose a document first.');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError('Documents must be 6 MB or smaller.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await api('/api/v1/uploads/upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          encryptedContent: await readAsBase64(file),
          matterId,
        }),
      });
      setNotice(`${file.name} is filed on this matter.`);
      setFile(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload the document');
    } finally {
      setUploading(false);
    }
  };

  const requestApproval = async (fileId: string, fileName: string) => {
    setError(null);
    try {
      await api('/api/v1/approvals', {
        method: 'POST',
        body: JSON.stringify({ matterId, fileId }),
      });
      setNotice(`Approval requested for ${fileName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not request approval');
    }
  };

  const requestSignature = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const request = await api<{ id: string }>('/api/v1/signatures', {
        method: 'POST',
        body: JSON.stringify({ matterId, fileId: signFileId, signerName, signerEmail }),
      });
      const link = `${window.location.origin}/sign/${request.id}`;
      try {
        await navigator.clipboard.writeText(link);
        setNotice(`Acceptance link copied for ${signerEmail}.`);
      } catch {
        setNotice(`Acceptance link for ${signerEmail}: ${link}`);
      }
      setSignerName('');
      setSignerEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the signature request');
    }
  };

  const download = async (item: MatterFile) => {
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`/api/v1/uploads/download/${item.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Could not download the document');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = item.name;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not download the document');
    }
  };

  if (loading) return <Spinner label="Loading matter" />;
  if (!matter) return <Alert variant="danger">{error || 'Matter not found'}</Alert>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/matters" className="text-sm font-medium text-cerulean hover:text-navy">
          All matters
        </Link>
        <h1 className="sfx-title mt-2 text-3xl">{matter.name}</h1>
        <p className="sfx-muted mt-2">{matter.clientName}</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {notice && (
        <Alert variant="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      <section className="sfx-panel space-y-4 p-5">
        <h2 className="sfx-title text-lg">Add a document</h2>
        <input type="file" className="form-input" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        {file && <p className="font-mono text-xs text-navy">{file.name} · {formatBytes(file.size)}</p>}
        <Button onClick={() => void upload()} isLoading={uploading} disabled={!file}>File on this matter</Button>
      </section>

      <section className="space-y-3">
        <h2 className="sfx-title text-lg">Documents</h2>
        {matter.files.length === 0 ? (
          <p className="sfx-panel sfx-muted px-4 py-8 text-sm">No documents on this matter yet.</p>
        ) : (
          matter.files.map((item) => (
            <article key={item.id} className="sfx-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-navy">{item.name}</p>
                <p className="sfx-muted mt-1 font-mono text-xs">{formatBytes(item.size)} · {formatDate(item.createdAt)} · {item.downloadCount} downloads</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => void download(item)}>Download</Button>
                <Button size="sm" onClick={() => void requestApproval(item.id, item.name)}>Request approval</Button>
              </div>
            </article>
          ))
        )}
      </section>

      <form className="sfx-panel space-y-4 p-5" onSubmit={requestSignature}>
        <h2 className="sfx-title text-lg">Ask someone to accept a document</h2>
        <p className="sfx-muted text-sm">This records a typed acceptance. It does not send the document to DocuSign.</p>
        <label className="block text-sm">
          <span className="form-label">Document</span>
          <select className="form-input" value={signFileId} onChange={(event) => setSignFileId(event.target.value)} required>
            <option value="">Select a document</option>
            {matter.files.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Signer name" name="signerName" value={signerName} onChange={(event) => setSignerName(event.target.value)} required />
          <Input label="Signer email" name="signerEmail" type="email" value={signerEmail} onChange={(event) => setSignerEmail(event.target.value)} required />
        </div>
        <Button type="submit" disabled={!signFileId}>Copy acceptance link</Button>
      </form>
    </div>
  );
}
