'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { Alert, Button, Modal } from '@/components';
import { SettingsNav } from '@/components/SettingsNav';
import { Spinner } from '@/components/Spinner';

interface OrganizationAccount {
  id: string;
  name: string;
  plan: string;
  createdAt: string;
  memberCount: number;
  fileCount: number;
  role: string;
}

const plans = [
  {
    id: 'solo',
    name: 'Solo',
    price: '$0',
    cadence: '',
    detail: '1 person · 1 open matter',
    description: 'For one lawyer and one matter. No card. Documents stay if you later subscribe.',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    cadence: '/mo',
    detail: '3 team members',
    description: 'For a small practice sending a handful of confidential files.',
  },
  {
    id: 'business',
    name: 'Business',
    price: '$149',
    cadence: '/mo',
    detail: '15 team members',
    description: 'For firms that exchange documents with clients every day.',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    cadence: '',
    detail: 'Unlimited team members',
    description: 'For organizations that need retention, review, and a named contact.',
  },
];

function planLabel(plan: string): string {
  if (plan === 'trial') return 'Trial';
  if (plan === 'solo') return 'Solo';
  return plans.find((item) => item.id === plan)?.name || plan;
}

function trialEnds(createdAt: string): Date {
  const end = new Date(createdAt);
  end.setDate(end.getDate() + 14);
  return end;
}

export function BillingManager() {
  const [account, setAccount] = useState<OrganizationAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        if (sessionId) {
          const confirmed = await api<{ plan: string }>('/api/v1/billing/confirm', {
            method: 'POST',
            body: JSON.stringify({ sessionId }),
          });
          if (!cancelled) setNotice(`${planLabel(confirmed.plan)} is now the plan.`);
          window.history.replaceState({}, '', '/dashboard/settings/billing');
        }
        const data = await api<OrganizationAccount>('/api/v1/organizations');
        if (!cancelled) setAccount(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load billing');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const moveToSolo = async () => {
    setSaving('solo');
    setError(null);
    setNotice(null);
    try {
      const result = await api<{ plan: string }>('/api/v1/billing/cancel', { method: 'POST' });
      setAccount((current) => (current ? { ...current, plan: result.plan } : current));
      setNotice('Solo is now the plan. No further charge is made. Documents already filed stay on the matter.');
      setCancelOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change the plan');
    } finally {
      setSaving(null);
    }
  };

  const choosePlan = async (planId: string) => {
    setSaving(planId);
    setError(null);
    setNotice(null);
    try {
      const result = await api<{ url: string }>('/api/v1/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan: planId }),
      });
      window.location.assign(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout');
      setSaving(null);
    }
  };

  if (loading) return <Spinner label="Loading billing" />;

  const canChange = account?.role === 'owner' || account?.role === 'admin';
  const onTrial = account?.plan === 'trial';
  const paid = account?.plan === 'starter' || account?.plan === 'business';
  const ends = account ? trialEnds(account.createdAt) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="sfx-title text-3xl">Settings</h1>
        <p className="sfx-muted mt-2">The plan for this organization.</p>
      </div>
      <SettingsNav />

      {error && <Alert variant="danger">{error}</Alert>}
      {notice && (
        <Alert variant="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      <section className="sfx-panel p-5">
        <p className="sfx-muted text-sm">{account?.name || 'Organization'}</p>
        <p className="sfx-title mt-1 text-2xl">{planLabel(account?.plan || 'trial')}</p>
        {account?.plan === 'solo' && (
          <p className="sfx-muted mt-2 text-sm">Solo is free. One person, one open matter. No card is on file.</p>
        )}
        {onTrial && ends && (
          <p className="sfx-muted mt-2 text-sm">Trial ends {formatDate(ends.toISOString())}. No card is on file. Solo stays free after that.</p>
        )}
        {paid && (
          <p className="sfx-muted mt-2 text-sm">A card is on file. Canceling stops the next charge and moves the firm to Solo.</p>
        )}
        <p className="mt-4 font-mono text-sm text-navy">
          {account?.memberCount ?? 0} members · {account?.fileCount ?? 0} files
        </p>
      </section>

      <div className="space-y-3">
        {plans.map((plan) => {
          const current = account?.plan === plan.id;
          return (
            <article key={plan.id} className="sfx-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="sfx-title text-lg">{plan.name}</h2>
                  {current && <span className="rounded-full bg-cerulean/10 px-2.5 py-1 text-xs font-medium text-cerulean">Current</span>}
                </div>
                <p className="sfx-muted mt-1 text-sm">{plan.description}</p>
                <p className="mt-2 text-sm text-navy">{plan.detail}</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <p className="font-mono text-2xl font-semibold text-navy">
                  {plan.price}
                  {plan.cadence && <span className="ml-1 font-sans text-sm font-medium text-secondary-600">{plan.cadence}</span>}
                </p>
                {current ? (
                  <Button size="sm" variant="outline" disabled>
                    Current plan
                  </Button>
                ) : plan.id === 'enterprise' ? (
                  <Button size="sm" href="/contact" variant="outline">Contact us</Button>
                ) : plan.id === 'solo' ? (
                  <Button size="sm" variant="outline" onClick={() => setCancelOpen(true)} disabled={!canChange || saving !== null}>
                    {paid ? 'Cancel subscription' : 'Use Solo'}
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => void choosePlan(plan.id)} isLoading={saving === plan.id} disabled={!canChange || saving !== null}>
                    Subscribe
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {paid && canChange && (
        <div className="sfx-panel p-5">
          <h2 className="sfx-title text-lg">Cancel subscription</h2>
          <p className="sfx-muted mt-2 text-sm">
            The firm moves to Solo. Documents and the current matter stay. No further charge is made. Solo allows one person and one open matter, so a new invite or a second matter waits until you subscribe again.
          </p>
          <Button className="mt-4" variant="danger" onClick={() => setCancelOpen(true)} disabled={saving !== null}>
            Cancel subscription
          </Button>
        </div>
      )}

      <Modal
        open={cancelOpen}
        title={paid ? 'Cancel subscription' : 'Move to Solo'}
        onClose={() => setCancelOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelOpen(false)} disabled={saving === 'solo'}>
              Keep this plan
            </Button>
            <Button variant="danger" onClick={() => void moveToSolo()} isLoading={saving === 'solo'}>
              {paid ? 'Cancel subscription' : 'Use Solo'}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-ink">
          {paid
            ? 'This stops the subscription. The firm moves to Solo, which is free. Files already on a matter stay. You cannot invite another person or open a second matter until you subscribe again.'
            : 'Solo is free for one person and one open matter. No card is taken. Files already on a matter stay.'}
        </p>
      </Modal>

      {!canChange && <p className="sfx-muted text-sm">An owner or admin chooses the plan.</p>}
      <p className="sfx-muted text-sm">
        Questions about Enterprise? <Link href="/contact" className="font-medium text-cerulean hover:text-navy">Contact us</Link>.
      </p>
    </div>
  );
}
