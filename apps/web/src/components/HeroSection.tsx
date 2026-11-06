import Link from 'next/link';
import { Button } from './Button';

const documents = [
  {
    name: 'engagement-letter.txt',
    status: 'Approved',
    note: 'Avery Hartwell accepted',
    tone: 'text-success-800',
    mark: 'approved' as const,
  },
  {
    name: 'purchase-agreement.pdf',
    status: 'Pending approval',
    note: 'Waiting on a partner',
    tone: 'text-warning-800',
    mark: 'pending' as const,
  },
];

function StatusMark({ kind }: { kind: 'approved' | 'pending' }) {
  if (kind === 'approved') {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0 text-success-800" aria-hidden="true">
        <circle cx="16" cy="16" r="13.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="16" cy="16" r="10.4" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path d="M10 16.4l3.6 3.6 8.2-8.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0 text-warning-800" aria-hidden="true">
      <circle cx="16" cy="16" r="13.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M16 9.5V16l4.2 2.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SheetLines() {
  return (
    <div className="px-8 pt-5" aria-hidden="true">
      <div className="h-2 w-24 bg-navy/15" />
      <div className="mt-4 space-y-2">
        <div className="h-px w-full bg-navy/10" />
        <div className="h-px w-11/12 bg-navy/10" />
        <div className="h-px w-10/12 bg-navy/10" />
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative">
      <ol
        className="pointer-events-none absolute bottom-8 left-4 top-16 hidden font-mono text-[11px] leading-6 text-navy/20 lg:block"
        aria-hidden="true"
      >
        {Array.from({ length: 26 }, (_, index) => (
          <li key={index}>{index + 1}</li>
        ))}
      </ol>
      <div className="container-max grid items-center gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,34rem)] lg:gap-8 lg:py-20">
        <div>
          <h1 className="max-w-[12ch] font-display text-5xl font-medium leading-[1.02] tracking-tight text-navy sm:text-6xl">
            Nothing leaves the firm until someone here has signed off.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink">
            Open a matter, file the documents on it, and require a colleague to approve before a client is asked to accept.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/signup">Open a matter</Button>
            <Button href="/guide" variant="outline">
              Read the setup guide
            </Button>
          </div>
          <p className="mt-4 text-sm text-secondary-700">
            The guide walks through every screen. If a numbered step does not match, then{' '}
            <Link href="/demo" className="font-medium text-cerulean hover:text-navy">
              request a walkthrough
            </Link>
            .
          </p>
          <p className="mt-2 text-sm text-secondary-700">Solo is free. One person, one matter. No card.</p>
        </div>

        <div className="matter-scene">
          <div className="matter-floor" aria-hidden="true" />
          <div className="matter-stack">
            <div className="matter-sheet matter-sheet-back" aria-hidden="true">
              <SheetLines />
            </div>
            <div className="matter-sheet matter-sheet-mid" aria-hidden="true">
              <p className="px-8 pt-4 font-mono text-xs text-navy/45">board-minutes.pdf</p>
              <SheetLines />
            </div>
            <aside aria-label="Example matter file for Hartwell acquisition" className="matter-sheet">
              <div className="w-3 shrink-0 bg-navy" aria-hidden="true" />
              <div className="w-1 shrink-0 bg-cerulean" aria-hidden="true" />
              <div className="relative min-w-0 flex-1 px-6 py-7 sm:px-7">
                <svg viewBox="0 0 40 40" className="absolute right-0 top-0 h-10 w-10" aria-hidden="true">
                  <polygon points="0,0 40,0 40,40" fill="#d7e6ec" />
                  <polygon points="0,0 0,40 40,40" fill="#ffffff" />
                  <line x1="0" y1="0" x2="40" y2="40" stroke="rgba(29,39,73,0.18)" />
                </svg>
                <p className="text-sm text-ink">Northline Counsel</p>
                <p className="mt-2 pr-6 font-display text-3xl font-medium italic leading-tight text-navy">Hartwell acquisition</p>
                <p className="mt-1 text-sm text-ink">Open matter for Hartwell Holdings</p>
                <ol className="mt-5 border-t border-navy/15">
                  {documents.map((document) => (
                    <li key={document.name} className="flex gap-3 border-b border-navy/10 py-4 last:border-b-0">
                      <StatusMark kind={document.mark} />
                      <div>
                        <p className="font-mono text-sm text-navy">{document.name}</p>
                        <p className={`mt-1 text-sm font-medium ${document.tone}`}>{document.status}</p>
                        <p className="text-sm text-ink">{document.note}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
