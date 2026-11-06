import React from 'react';
import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const defaultSections: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { label: 'Workflow', href: '/#how' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Security', href: '/security' },
      { label: 'Setup guide', href: '/guide' },
      { label: 'Request a walkthrough', href: '/demo' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/company' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Security', href: '/security' },
    ],
  },
];

interface FooterProps {
  sections?: FooterSection[];
  copyright?: string;
}

export const Footer: React.FC<FooterProps> = ({
  sections = defaultSections,
  copyright = '© 2026 SFX for Legal.',
}) => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary-950 text-secondary-100">
      <div className="container-max py-12">
        <div className="mb-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-semibold text-white">SFX for Legal</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-secondary-400">
              Document management and approval for law firms.
            </p>
            <Link href="/signup" className="mt-4 inline-block text-sm text-white hover:text-primary-200">
              Open a matter
            </Link>
          </div>
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white">{section.title}</h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-secondary-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          {/* Bottom Footer */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p className="text-secondary-400 text-sm">
              {copyright.replace(/\d{4}/, year.toString())}
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link href="/privacy" className="text-secondary-400 hover:text-primary-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-secondary-400 hover:text-primary-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/security" className="text-secondary-400 hover:text-primary-400 transition-colors">
                Security
              </Link>
              <Link href="/contact" className="text-secondary-400 hover:text-primary-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
