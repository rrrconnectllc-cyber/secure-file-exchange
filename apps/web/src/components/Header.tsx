'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { Logo } from './Logo';
import { readSession } from '@/lib/auth';

interface NavItem {
  label: string;
  href: string;
}

interface HeaderProps {
  navItems?: NavItem[];
  logoHref?: string;
  logoText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  navItems = [
    { label: 'Workflow', href: '/#how' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Setup guide', href: '/guide' },
  ],
  logoHref = '/',
  logoText = 'SFX',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(Boolean(readSession()));
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-cream">
      <nav className="container-max flex items-center justify-between h-16">
        {/* Logo */}
        <Logo href={logoHref} wordmark={logoText} />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-secondary-700 hover:text-primary-600 transition-colors text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {signedIn ? (
            <Button href="/dashboard" size="sm">Dashboard</Button>
          ) : (
            <>
              <Button href="/login" variant="outline" size="sm">Sign In</Button>
              <Button href="/signup" size="sm">Open a matter</Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-secondary-700 hover:text-secondary-900"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-secondary-200">
          <div className="container-max py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block py-2 text-sm font-medium text-secondary-700 hover:text-cerulean"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex gap-3 border-t border-secondary-100 pt-3">
              {signedIn ? (
                <Button href="/dashboard" size="sm" className="w-full">Dashboard</Button>
              ) : (
                <>
                  <Button href="/login" variant="outline" size="sm" className="w-full">Sign In</Button>
                  <Button href="/signup" size="sm" className="w-full">Open a matter</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

Header.displayName = 'Header';
