'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { clearSession, readSession } from '@/lib/auth';
import type { Session } from '@/lib/types';
import { Sidebar } from './Sidebar';
import { Spinner } from './Spinner';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const current = readSession();
    if (!current) {
      clearSession();
      const redirect = encodeURIComponent(pathname || '/dashboard');
      window.location.assign(`/login?redirect=${redirect}`);
      return;
    }
    setSession(current);
    const stored = localStorage.getItem('sfx_theme');
    if (stored === 'dark' || stored === 'light') setTheme(stored);
    setReady(true);

    const refresh = () => {
      const next = readSession();
      if (next) setSession(next);
    };
    window.addEventListener('sfx-session', refresh);
    return () => window.removeEventListener('sfx-session', refresh);
  }, [pathname]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('sfx_theme', next);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-cream">
        <Spinner label="Opening your workspace" />
      </div>
    );
  }

  return (
    <div data-theme={theme} className="min-h-screen bg-cream text-ink lg:flex">
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-navy/40 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <Sidebar open={open} onNavigate={() => setOpen(false)} user={session?.user ?? null} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sfx-header sticky top-0 z-20 flex items-center justify-between border-b border-navy/10 bg-cream/95 px-4 py-3 backdrop-blur lg:px-8">
          <button
            type="button"
            className="rounded-lg border border-navy/15 px-3 py-2 text-sm font-medium text-navy lg:hidden"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
          <p className="sfx-muted hidden text-sm sm:block">
            {session?.organization.name || 'Your organization'}
          </p>
          <button type="button" onClick={toggleTheme} className="text-sm font-medium text-cerulean hover:text-navy">
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
