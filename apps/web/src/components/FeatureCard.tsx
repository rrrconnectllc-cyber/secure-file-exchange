import type { ReactNode } from 'react';

export type FeatureIcon = 'lock' | 'people' | 'audit' | 'bolt' | 'check' | 'chart';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: FeatureIcon;
}

function Icon({ name }: { name: FeatureIcon }) {
  const paths: Record<FeatureIcon, ReactNode> = {
    lock: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V8a4 4 0 118 0v3M6.5 11h11a1.5 1.5 0 011.5 1.5v6A1.5 1.5 0 0117.5 20h-11A1.5 1.5 0 015 18.5v-6A1.5 1.5 0 016.5 11z" />
    ),
    people: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 19v-1.2A3.8 3.8 0 0012.2 14H7.8A3.8 3.8 0 004 17.8V19M10 11a3 3 0 100-6 3 3 0 000 6zM20 19v-1.1A3.4 3.4 0 0017.2 14.6M16 5.2a2.6 2.6 0 010 5" />
    ),
    audit: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4.5h6.2L19 9.2V19a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 017 19V6A1.5 1.5 0 018.5 4.5H8zM14 4.5V9h4.5M9 13h6M9 16.5h4" />
    ),
    bolt: <path strokeLinecap="round" strokeLinejoin="round" d="M13 3L6 13h5l-1 8 8-12h-5l0-6z" />,
    check: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM8.5 12.2l2.3 2.3 4.7-5" />
    ),
    chart: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 19V5M5 19h14M8.5 15.5v-3M12 15.5V9M15.5 15.5v-5" />
    ),
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <article className="rounded-xl border border-navy/10 bg-white p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cerulean/10 text-cerulean">
        <Icon name={icon} />
      </div>
      <h3 className="text-lg font-bold text-navy">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink">{description}</p>
    </article>
  );
}
