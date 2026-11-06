import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer, Button } from '@/components';
import guide from '@/content/setup-guide.json';

export const metadata: Metadata = {
  title: 'Setup guide',
  description: 'How a firm opens its first matter, approves a document, and asks a client to accept it.',
};

export default function GuidePage() {
  return (
    <>
      <Header />
      <main className="bg-cream">
        <header className="border-b border-navy/10">
          <div className="container-max max-w-5xl py-14 md:py-20">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-cerulean">SFX for Legal · {guide.edition}</p>
            <h1 className="mt-3 max-w-[16ch] font-display text-4xl font-medium leading-tight text-navy md:text-6xl">
              Setup guide
            </h1>
            <p className="mt-5 max-w-2xl font-display text-2xl italic leading-snug text-navy">
              For the person opening the firm&apos;s first matter.
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink">
              Read this before you request a walkthrough. Each step has the screen beside it, including the checks people skip.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/guides/SFX-for-Legal-setup-guide.pdf">Download the PDF</Button>
              <Button href="/signup" variant="outline">
                Open a matter
              </Button>
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-6 text-secondary-700">{guide.example}</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-secondary-700">{guide.video}</p>
          </div>
        </header>

        <div className="container-max max-w-5xl py-12">
          <div className="grid gap-10 lg:grid-cols-2">
            {guide.front.map((section) => (
              <section key={section.id}>
                <h2 className="font-display text-2xl font-medium text-navy">{section.title}</h2>
                {section.paragraphs?.map((text) => (
                  <p key={text} className="mt-3 leading-7 text-ink">
                    {text}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 space-y-2">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex gap-3 leading-6 text-ink">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cerulean" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <ol className="mt-16 space-y-16">
            {guide.steps.map((step) => (
              <li key={step.n} id={`step-${step.n}`} className="scroll-mt-24 border-t border-navy/10 pt-10">
                <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-cerulean">
                      Step {step.n} · Frame {step.frame}
                    </p>
                    <h2 className="mt-2 font-display text-3xl font-medium leading-tight text-navy">{step.title}</h2>
                    {step.paragraphs.map((text) => (
                      <p key={text} className="mt-4 leading-7 text-ink">
                        {text}
                      </p>
                    ))}
                    <aside className="mt-5 border-l-4 border-warning-700 bg-warning-50 px-4 py-3">
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-warning-800">Easy to miss</p>
                      <p className="mt-1 leading-6 text-ink">{step.miss}</p>
                    </aside>
                    <p className="mt-4 text-sm leading-6 text-secondary-700">On the picture: {step.look}</p>
                  </div>
                  <figure className="overflow-hidden rounded-md border border-navy/10 bg-white">
                    {/* The screenshots are the product screens, already cropped in the PDF. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/guides/figures/${step.image}`} alt={step.alt} className="h-auto w-full" />
                    <figcaption className="border-t border-navy/10 px-3 py-2 font-mono text-xs text-secondary-700">
                      Frame {step.frame}
                    </figcaption>
                  </figure>
                </div>
              </li>
            ))}
          </ol>

          <section className="mt-16 border-t border-navy/10 py-12">
            <h2 className="font-display text-3xl font-medium text-navy">{guide.clientNote.title}</h2>
            {guide.clientNote.paragraphs.map((text) => (
              <p key={text} className="mt-4 max-w-3xl text-lg leading-8 text-ink">
                {text}
              </p>
            ))}
          </section>

          <section className="border-t border-navy/10 py-12">
            <h2 className="font-display text-3xl font-medium text-navy">If a step does not match</h2>
            <p className="mt-4 max-w-3xl leading-7 text-ink">
              Email{' '}
              <Link href="mailto:hello@securefileexchange.com?subject=Setup%20guide%20step%20does%20not%20match" className="font-medium text-cerulean hover:text-navy">
                hello@securefileexchange.com
              </Link>{' '}
              with the step number. That is the walkthrough. The guide is the path for everything it already shows.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
