'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { clearSession } from '@/lib/auth';
import type { SessionUser } from '@/lib/types';

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
  user: SessionUser | null;
}

const items = [
  { label: 'Dashboard', href: '/dashboard', icon: 'grid' },
  { label: 'Matters', href: '/dashboard/matters', icon: 'briefcase' },
  { label: 'Approvals', href: '/dashboard/approvals', icon: 'check' },
  { label: 'Signature requests', href: '/dashboard/e-signature', icon: 'pen' },
  { label: 'Compliance reports', href: '/dashboard/audit-legal', icon: 'audit' },
  { label: 'Team & client access', href: '/dashboard/team', icon: 'people' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'gear' },
];

function NavIcon({ name }: { name: string }) {
  const common = 'h-5 w-5';
  if (name === 'briefcase') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V6a2 2 0 012-2h4a2 2 0 012 2v1M4.5 7h15v11a2 2 0 01-2 2h-11a2 2 0 01-2-2V7z" />
      </svg>
    );
  }
  if (name === 'check') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.5l2.2 2.2L15.5 10" />
        <rect x="4" y="4" width="16" height="16" rx="2" />
      </svg>
    );
  }
  if (name === 'pen') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l4.2-.8L19 8.4 15.6 5 4.8 15.8 4 20z" />
      </svg>
    );
  }
  if (name === 'audit') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h8l4 4v12H7zM15 4v4h4M9 12h6M9 16h6" />
      </svg>
    );
  }
  if (name === 'folder') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 7.5A2 2 0 015.5 5.5h4l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2h-13a2 2 0 01-2-2v-8z" />
      </svg>
    );
  }
  if (name === 'people') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 19v-1.2A3.8 3.8 0 0012.2 14H7.8A3.8 3.8 0 004 17.8V19M10 11a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
    );
  }
  if (name === 'gear') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 13a7.7 7.7 0 00.1-2l2-1.2-2-3.4-2.3.6a7.8 7.8 0 00-1.7-1L15 3h-4l-.5 2.9a7.8 7.8 0 00-1.7 1L6.5 6.4l-2 3.4L6.5 11a7.7 7.7 0 000 2l-2 1.2 2 3.4 2.3-.6a7.8 7.8 0 001.7 1L11 21h4l.5-2.9a7.8 7.8 0 001.7-1l2.3.6 2-3.4-2-1.3z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
    </svg>
  );
}

export function Sidebar({ open, onNavigate, user }: SidebarProps) {
  const pathname = usePathname();
  const displayName = user?.name || user?.email.split('@')[0] || 'Account';
  const initial = displayName.charAt(0).toUpperCase();

  const logout = () => {
    clearSession();
    window.location.assign('/login');
  };

  return (
    <aside
      className={`${open ? 'fixed inset-y-0 left-0 z-40 flex' : 'hidden'} h-screen w-64 flex-col bg-navy text-white lg:sticky lg:top-0 lg:z-auto lg:flex`}
    >
      <div className="border-b border-white/10 px-5 py-5">
        <Logo href="/dashboard" inverted />
      </div>
      <nav className="flex-1 px-3 py-4" aria-label="Dashboard">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium ${
                    active
                      ? 'border-[#7ec8e3] bg-white/10 text-white'
                      : 'border-transparent text-[#e8eef8] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cerulean text-sm font-bold">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-[#d5deee]">{user?.email}</p>
          </div>
        </div>
        <button type="button" onClick={logout} className="mt-4 text-sm text-[#e8eef8] hover:text-white">
          Log out
        </button>
      </div>
    </aside>
  );
}
