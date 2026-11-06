'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard/settings', label: 'General' },
  { href: '/dashboard/settings/billing', label: 'Billing' },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings sections" className="flex gap-6 border-b border-navy/10">
      {links.map((link) => {
        const active = link.href === '/dashboard/settings' ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium ${
              active ? 'border-cerulean text-cerulean' : 'border-transparent sfx-muted hover:text-cerulean'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
