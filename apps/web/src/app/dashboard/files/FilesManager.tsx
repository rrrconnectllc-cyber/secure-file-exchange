'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { fileStatus, formatBytes, formatDate, formatExpiresIn } from '@/lib/format';
import type { FileRecord } from '@/lib/types';
import { Alert, Badge, Button } from '@/components';
import { EmptyState } from '@/components/EmptyState';
import { Modal } from '@/components/Modal';
import { Spinner } from '@/components/Spinner';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/Table';

interface RawFile {
  id: string;
  name: string;
  size: number | string;
  mimeType: string;
  createdAt: string;
  expiresAt: string;
  downloadCount: number;
  maxDownloads: number;
  requirePassword: boolean;
}

type SortKey = 'name' | 'size' | 'createdAt' | 'downloadCount' | 'expiresAt';

function toFile(raw: RawFile): FileRecord {
  return {
    id: raw.id,
    name: raw.name,
    size: Number(raw.size),
    mimeType: raw.mimeType,
    createdAt: raw.createdAt,
    expiresAt: raw.expiresAt,
    downloadCount: raw.downloadCount,
    maxDownloads: raw.maxDownloads,
    requirePassword: Boolean(raw.requirePassword),
  };
}

export function FilesManager() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [viewing, setViewing] = useState<FileRecord | null>(null);
  const [shareTargets, setShareTargets] = useState<FileRecord[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<RawFile[]>('/api/v1/files');
      setFiles(data.map(toFile));
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load files');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(() => {
    const next = [...files];
    next.sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      if (typeof left === 'number' && typeof right === 'number') {
        return sortAsc ? left - right : right - left;
      }
      return sortAsc
        ? String(left).localeCompare(String(right))
        : String(right).localeCompare(String(left));
    });
    return next;
  }, [files, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((current) => !current);
      return;
    }
    setSortKey(key);
    setSortAsc(true);
  };

  const toggleOne = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleAll = () => {
    setSelected((current) => (current.length === sorted.length ? [] : sorted.map((file) => file.id)));
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await Promise.all(pendingDelete.map((id) => api(`/api/v1/files/${id}`, { method: 'DELETE' })));
      setNotice(pendingDelete.length === 1 ? 'File deleted.' : `${pendingDelete.length} files deleted.`);
      setPendingDelete([]);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the file');
    } finally {
      setDeleting(false);
    }
  };

  const closeUpload = () => {
    setUploadOpen(false);
    setPickedFile(null);
  };

  const readAsBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const comma = result.indexOf(',');
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.onerror = () => reject(reader.error || new Error('Could not read the file'));
      reader.readAsDataURL(file);
    });

  const uploadFile = async () => {
    if (!pickedFile) {
      setError('Choose a file first.');
      return;
    }
    if (pickedFile.size > 6 * 1024 * 1024) {
      setError('Files must be 6 MB or smaller.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const encryptedContent = await readAsBase64(pickedFile);
      await api('/api/v1/uploads/upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: pickedFile.name,
          fileSize: pickedFile.size,
          encryptedContent,
        }),
      });
      setNotice(`${pickedFile.name} is stored.`);
      closeUpload();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload the file');
    } finally {
      setUploading(false);
    }
  };

  const downloadFile = async (file: FileRecord) => {
    setDownloadingId(file.id);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`/api/v1/uploads/download/${file.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const text = await response.text();
        let message = 'Could not download the file';
        try {
          const payload = JSON.parse(text) as { error?: string };
          if (payload.error) message = payload.error;
        } catch {
          if (text) message = text;
        }
        throw new Error(message);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setNotice(`Downloaded ${file.name}.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not download the file');
    } finally {
      setDownloadingId(null);
    }
  };

  const sendInvite = async () => {
    setShareError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shareEmail)) {
      setShareError('Enter a valid email address.');
      return;
    }
    setSharing(true);
    try {
      await api<{ message?: string }>('/api/v1/team/invite', {
        method: 'POST',
        body: JSON.stringify({ email: shareEmail, role: 'member' }),
      });
      const names = shareTargets.map((file) => file.name).join(', ');
      setNotice(`Invite sent to ${shareEmail}. A separate download link for ${names} was not created.`);
      setShareTargets([]);
      setShareEmail('');
    } catch (err) {
      setShareError(err instanceof Error ? err.message : 'Could not send the invite');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="sfx-title text-3xl">Files</h1>
          <p className="sfx-muted mt-2">Everything this organization has stored.</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>Upload New File</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {notice && (
        <Alert variant="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {loading ? (
        <Spinner label="Loading files" />
      ) : files.length === 0 ? (
        <EmptyState
          title="No files yet"
          description="When a file is stored for this organization, it will show up here with its expiration and download count."
          action={<Button onClick={() => setUploadOpen(true)}>Upload New File</Button>}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>
                <input
                  type="checkbox"
                  aria-label="Select all files"
                  checked={selected.length === sorted.length && sorted.length > 0}
                  onChange={toggleAll}
                />
              </TableHeaderCell>
              <TableHeaderCell onSort={() => toggleSort('name')}>Name</TableHeaderCell>
              <TableHeaderCell onSort={() => toggleSort('size')}>Size</TableHeaderCell>
              <TableHeaderCell onSort={() => toggleSort('createdAt')}>Uploaded</TableHeaderCell>
              <TableHeaderCell onSort={() => toggleSort('downloadCount')}>Downloads</TableHeaderCell>
              <TableHeaderCell onSort={() => toggleSort('expiresAt')}>Expires in</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((file) => {
              const status = fileStatus(file.expiresAt);
              return (
                <TableRow key={file.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Select ${file.name}`}
                      checked={selected.includes(file.id)}
                      onChange={() => toggleOne(file.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-navy">{file.name}</TableCell>
                  <TableCell className="font-mono">{formatBytes(file.size)}</TableCell>
                  <TableCell>{formatDate(file.createdAt)}</TableCell>
                  <TableCell className="font-mono">
                    {file.downloadCount}/{file.maxDownloads}
                  </TableCell>
                  <TableCell>{formatExpiresIn(file.expiresAt)}</TableCell>
                  <TableCell>
                    <Badge variant={status === 'Active' ? 'success' : 'warning'}>{status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="text-sm font-medium text-cerulean hover:text-navy" onClick={() => setViewing(file)}>
                        View
                      </button>
                      <button
                        type="button"
                        className="text-sm font-medium text-cerulean hover:text-navy"
                        disabled={downloadingId === file.id}
                        onClick={() => void downloadFile(file)}
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        className="text-sm font-medium text-cerulean hover:text-navy"
                        onClick={() => {
                          setShareError(null);
                          setShareTargets([file]);
                        }}
                      >
                        Share
                      </button>
                      <button
                        type="button"
                        className="text-sm font-medium text-danger-600 hover:text-danger-700"
                        onClick={() => setPendingDelete([file.id])}
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {selected.length > 0 && (
        <div className="sfx-panel sticky bottom-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3 shadow-lg">
          <p className="text-sm font-medium text-navy">{selected.length} selected</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShareError(null);
                setShareTargets(files.filter((file) => selected.includes(file.id)));
              }}
            >
              Share Selected
            </Button>
            <Button variant="danger" size="sm" onClick={() => setPendingDelete(selected)}>
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={uploadOpen}
        title="Upload a file"
        onClose={closeUpload}
        footer={
          <>
            <Button variant="outline" onClick={closeUpload}>Cancel</Button>
            <Button onClick={() => void uploadFile()} isLoading={uploading} disabled={!pickedFile}>
              Upload
            </Button>
          </>
        }
      >
        <p>The file is stored for this organization and expires in 30 days. Maximum size is 6 MB.</p>
        <label className="mt-4 block">
          <span className="form-label">File</span>
          <input
            type="file"
            className="form-input"
            onChange={(event) => setPickedFile(event.target.files?.[0] ?? null)}
          />
        </label>
        {pickedFile && (
          <p className="mt-3 font-mono text-xs text-navy">
            {pickedFile.name} · {formatBytes(pickedFile.size)}
          </p>
        )}
      </Modal>

      <Modal
        open={viewing !== null}
        title={viewing?.name || 'File'}
        onClose={() => setViewing(null)}
        footer={<Button variant="outline" onClick={() => setViewing(null)}>Close</Button>}
      >
        {viewing && (
          <dl className="space-y-2">
            <div className="flex justify-between gap-4"><dt>Size</dt><dd className="font-mono">{formatBytes(viewing.size)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Type</dt><dd className="font-mono">{viewing.mimeType}</dd></div>
            <div className="flex justify-between gap-4"><dt>Uploaded</dt><dd>{formatDate(viewing.createdAt)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Expires</dt><dd>{formatDate(viewing.expiresAt)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Downloads</dt><dd className="font-mono">{viewing.downloadCount} of {viewing.maxDownloads}</dd></div>
            <div className="flex justify-between gap-4"><dt>Password</dt><dd>{viewing.requirePassword ? 'Required' : 'Not required'}</dd></div>
          </dl>
        )}
      </Modal>

      <Modal
        open={shareTargets.length > 0}
        title="Share access"
        onClose={() => setShareTargets([])}
        footer={
          <>
            <Button variant="outline" onClick={() => setShareTargets([])}>Cancel</Button>
            <Button onClick={() => void sendInvite()} isLoading={sharing}>Send invite</Button>
          </>
        }
      >
        <p>
          This invites someone to the organization as a member. The API does not issue a separate file link.
        </p>
        <p className="mt-2 font-medium text-navy">{shareTargets.map((file) => file.name).join(', ')}</p>
        <label className="mt-4 block">
          <span className="form-label">Email</span>
          <input
            type="email"
            className="form-input"
            value={shareEmail}
            onChange={(event) => setShareEmail(event.target.value)}
            placeholder="person@firm.com"
          />
        </label>
        {shareError && <p className="form-error">{shareError}</p>}
      </Modal>

      <Modal
        open={pendingDelete.length > 0}
        title={pendingDelete.length === 1 ? 'Delete this file?' : `Delete ${pendingDelete.length} files?`}
        onClose={() => setPendingDelete([])}
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingDelete([])}>Cancel</Button>
            <Button variant="danger" onClick={() => void confirmDelete()} isLoading={deleting}>Delete</Button>
          </>
        }
      >
        <p>Deleted files are removed for the whole organization. This cannot be undone from the app.</p>
      </Modal>
    </div>
  );
}
