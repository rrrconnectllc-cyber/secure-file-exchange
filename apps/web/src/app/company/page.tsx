import Link from 'next/link';
import { Header, Footer } from '@/components';

export const metadata = {
  title: 'Company',
  description: 'SFX for Legal builds document management and approval for law firms.',
};

export default function CompanyPage() {
  return (
    <>
      <Header />
      <main className="py-16 lg:py-24">
        <div className="container-max max-w-3xl">
          <h1 className="font-display text-5xl font-medium tracking-tight text-navy sm:text-6xl">Company</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink">
            SFX for Legal is document management and approval for law firms.
          </p>
          <p className="mt-4 max-w-xl leading-7 text-ink">
            A firm opens a matter, files the documents on it, and requires a colleague to approve before a client is asked to accept. The activity report keeps who did each of those.
          </p>
          <ul className="mt-10 space-y-3 text-navy">
            <li>
              <Link href="/contact" className="font-medium text-navy hover:text-cerulean">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/careers" className="font-medium text-navy hover:text-cerulean">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/demo" className="font-medium text-navy hover:text-cerulean">
                Request a walkthrough
              </Link>
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
