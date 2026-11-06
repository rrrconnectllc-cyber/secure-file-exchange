'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { clearSession, readSession, updateOrganizationName } from '@/lib/auth';
import type { OrgSettings } from '@/lib/types';
import { Alert, Button, Input } from '@/components';
import { Modal } from '@/components/Modal';
import { Spinner } from '@/components/Spinner';
import { SettingsNav } from '@/components/SettingsNav';
import { Toggle } from '@/components/Toggle';

export function SettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState('');
  const [defaultExpiration, setDefaultExpiration] = useState('30');
  const [maxDownloads, setMaxDownloads] = useState('100');
  const [requirePassword, setRequirePassword] = useState(true);
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const session = readSession();
    if (session?.organization.name) setOrganizationName(session.organization.name);

    let cancelled = false;
    const load = async () => {
      try {
        const settings = await api<OrgSettings>('/api/v1/settings');
        if (cancelled) return;
        if (settings.organizationName) {
          setOrganizationName(settings.organizationName);
          updateOrganizationName(settings.organizationName);
        }
        setDefaultExpiration(String(settings.defaultExpiration));
        setMaxDownloads(String(settings.maxDownloads));
        setRequirePassword(settings.requirePassword);
        setEnableTwoFactor(settings.enableTwoFactor);
        setEmailNotifications(settings.enableEmailNotify);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setError(null);
    setNotice(null);
    const expiration = Number(defaultExpiration);
    const downloads = Number(maxDownloads);
    if (!organizationName.trim()) {
      setError('Organization name is required.');
      return;
    }
    if (!Number.isInteger(expiration) || expiration < 1 || expiration > 365) {
      setError('Default expiration must be a whole number from 1 to 365.');
      return;
    }
    if (!Number.isInteger(downloads) || downloads < 1) {
      setError('Max downloads must be a whole number of at least 1.');
      return;
    }

    setSaving(true);
    try {
      await api('/api/v1/settings', {
        method: 'PUT',
        body: JSON.stringify({
          organizationName: organizationName.trim(),
          defaultExpiration: expiration,
          maxDownloads: downloads,
          requirePassword,
          enableEmailNotifications: emailNotifications,
          enableTwoFactor,
        }),
      });
      updateOrganizationName(organizationName.trim());
      setNotice('Settings saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading settings" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="sfx-title text-3xl">Settings</h1>
        <p className="sfx-muted mt-2">Defaults for new files and how the organization is notified.</p>
      </div>
      <SettingsNav />

      {error && <Alert variant="danger">{error}</Alert>}
      {notice && (
        <Alert variant="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <section className="sfx-panel space-y-4 p-5">
          <h2 className="sfx-title text-lg">Organization</h2>
          <Input
            label="Organization name"
            name="organizationName"
            value={organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
            required
          />
          <Input
            label="Default expiration days"
            name="defaultExpiration"
            type="number"
            min={1}
            max={365}
            value={defaultExpiration}
            onChange={(event) => setDefaultExpiration(event.target.value)}
            helperText="From 1 to 365 days"
            required
          />
          <Input
            label="Max downloads per file"
            name="maxDownloads"
            type="number"
            min={1}
            value={maxDownloads}
            onChange={(event) => setMaxDownloads(event.target.value)}
            required
          />
        </section>

        <section className="sfx-panel px-5 py-2">
          <h2 className="sfx-title pt-3 text-lg">Security</h2>
          <Toggle
            label="Require password protection"
            description="New files ask for a password before they can be downloaded."
            checked={requirePassword}
            onChange={setRequirePassword}
          />
          <Toggle
            label="Enable two-factor auth"
            description="Ask for a second factor when members sign in."
            checked={enableTwoFactor}
            onChange={setEnableTwoFactor}
          />
        </section>

        <section className="sfx-panel px-5 py-2">
          <h2 className="sfx-title pt-3 text-lg">Notifications</h2>
          <Toggle
            label="Email notifications"
            description="Send email when files are shared or downloaded."
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
        </section>

        <section className="rounded-xl border border-danger-500 bg-white p-5">
          <h2 className="text-lg font-bold text-danger-700">Danger zone</h2>
          <p className="mt-2 text-sm text-ink">Delete this organization and the files stored under it.</p>
          <Button variant="danger" className="mt-4" onClick={() => setDeleteOpen(true)}>
            Delete Organization
          </Button>
        </section>

        <Button type="submit" className="w-full" isLoading={saving}>
          Save changes
        </Button>
      </form>

      <Modal
        open={deleteOpen}
        title="Delete organization"
        onClose={() => {
          setDeleteOpen(false);
          setConfirmText('');
        }}
        footer={
          <Button
            variant="danger"
            disabled={confirmText !== 'DELETE'}
            isLoading={deleting}
            onClick={() => {
              setDeleting(true);
              setError(null);
              void api('/api/v1/organizations', {
                method: 'DELETE',
                body: JSON.stringify({ confirmDelete: 'DELETE' }),
              })
                .then(() => {
                  clearSession();
                  window.location.assign('/login');
                })
                .catch((err: unknown) => {
                  setDeleting(false);
                  setDeleteOpen(false);
                  setConfirmText('');
                  setError(err instanceof Error ? err.message : 'Could not delete the organization');
                });
            }}
          >
            Delete Organization
          </Button>
        }
      >
        <p>Type DELETE to confirm. This removes the organization, its files, and its members.</p>
        <input
          className="form-input mt-4"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          aria-label="Type DELETE to confirm"
        />
      </Modal>
    </div>
  );
}
