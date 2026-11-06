'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, CardBody, CardHeader, Input } from '@/components';
import { PasswordInput } from '@/components/Input';
import { Logo } from '@/components/Logo';
import { api } from '@/lib/api';
import { saveSession } from '@/lib/auth';
import type { AuthResponse } from '@/lib/types';

interface Invitation {
  memberId: string;
  email: string;
  role: string;
  organizationName: string;
  status: 'pending' | 'active' | string;
}

export default function AcceptInvitePage() {
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [memberId, setMemberId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Accept invitation | Secure File Exchange';
    const id = new URLSearchParams(window.location.search).get('memberId') || '';
    setMemberId(id);
    if (!id) {
      setError('This invitation link is missing a member id.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const data = await api<Invitation>(`/api/v1/invitations/${id}`, {}, false);
        if (!cancelled) setInvitation(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load the invitation');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const accept = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const pending = invitation?.status !== 'active';
    if (pending && password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    if (pending && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const result = await api<AuthResponse>(
        `/api/v1/invitations/${memberId}/accept`,
        {
          method: 'POST',
          body: JSON.stringify({ password, name: name.trim() }),
        },
        false
      );
      saveSession(result, true);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept the invitation');
      setSaving(false);
    }
  };

  const pending = invitation?.status !== 'active';

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Logo />
        </div>
        <Card variant="outline">
          <CardHeader>
            <h1 className="text-2xl font-bold text-navy">Accept invitation</h1>
            {invitation && (
              <p className="mt-1 text-sm text-secondary-600">
                {invitation.organizationName} invited {invitation.email} as {invitation.role}.
              </p>
            )}
          </CardHeader>
          <CardBody>
            {error && (
              <Alert variant="danger" className="mb-6">
                {error}
              </Alert>
            )}
            {loading ? (
              <p className="text-sm text-secondary-600">Loading the invitation…</p>
            ) : invitation ? (
              <form method="post" onSubmit={accept} className="space-y-4">
                {pending && (
                  <Input label="Your name" name="name" value={name} onChange={(event) => setName(event.target.value)} />
                )}
                <PasswordInput
                  label={pending ? 'Create a password' : 'Password'}
                  name="password"
                  autoComplete={pending ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                {pending && <p className="text-sm text-secondary-500">Minimum 12 characters</p>}
                {pending && (
                  <PasswordInput
                    label="Confirm password"
                    name="confirm"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    required
                  />
                )}
                <Button type="submit" className="w-full" isLoading={saving}>
                  {pending ? 'Create account and join' : 'Join organization'}
                </Button>
              </form>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
