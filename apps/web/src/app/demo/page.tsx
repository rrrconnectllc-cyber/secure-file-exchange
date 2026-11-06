import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer, Button } from '@/components';

export const metadata: Metadata = {
  title: 'Setup before a walkthrough',
  description: 'Read the setup guide before requesting a walkthrough.',
};

export default function DemoPage() {
  return (
    <>
      <Header />
      <main className="bg-cream py-14 md:py-20">
        <div className="container-max max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-cerulean">Before a call</p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-navy md:text-5xl">
            Set the firm up from the guide.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink">
            The setup guide shows every screen, including the checks people skip. Follow it before you ask for a walkthrough. A call is for a step that does not match the picture.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/guide">Read the setup guide</Button>
            <Button href="/guides/SFX-for-Legal-setup-guide.pdf" variant="outline">
              Download the PDF
            </Button>
          </div>

          <section className="mt-12 border-t border-navy/10 pt-8">
            <h2 className="font-display text-2xl font-medium text-navy">A walkthrough is for a mismatch</h2>
            <p className="mt-3 max-w-2xl leading-7 text-ink">
              Email hello@securefileexchange.com with the step number and what your screen shows. Do not book time for a short password, a missing client name, a gray File on this matter button, a pending invite, or a link that has not been copied. Those are in the guide.
            </p>
            <p className="mt-6">
              <Link
                href="mailto:hello@securefileexchange.com?subject=Setup%20guide%20step%20does%20not%20match"
                className="font-medium text-cerulean hover:text-navy"
              >
                Email the step that does not match
              </Link>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
