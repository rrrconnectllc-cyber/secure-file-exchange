import { Header, Footer } from '@/components';

export const metadata = {
  title: 'Careers',
  description: 'Write to SFX for Legal about product engineering or working with law firms.',
};

const roles = [
  {
    title: 'Product engineering',
    body: 'The matter workflow, approvals, and the acceptance record. Next.js on the front, the API behind it.',
  },
  {
    title: 'Working with firms',
    body: 'Help a practice open its first matters, invite the team, and use the approval record.',
  },
];

export default function CareersPage() {
  return (
    <>
      <Header />
      <main className="py-16 lg:py-24">
        <div className="container-max max-w-3xl">
          <h1 className="font-display text-5xl font-medium tracking-tight text-navy sm:text-6xl">Careers</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink">
            SFX for Legal is a small team building software a law firm can rely on.
          </p>
          <h2 className="mt-12 text-2xl font-semibold text-navy">What we hire for</h2>
          <p className="mt-3 max-w-xl text-ink">There are no posted openings today. Write if you do one of these.</p>
          <ul className="mt-8 border-t border-navy/15">
            {roles.map((role) => (
              <li key={role.title} className="border-b border-navy/15 py-6">
                <h3 className="text-lg font-semibold text-navy">{role.title}</h3>
                <p className="mt-2 max-w-xl text-ink">{role.body}</p>
              </li>
            ))}
          </ul>
          <h2 className="mt-12 text-2xl font-semibold text-navy">How to write</h2>
          <p className="mt-3 max-w-xl leading-7 text-ink">
            Email{' '}
            <a href="mailto:careers@securefileexchange.com" className="font-medium text-cerulean">
              careers@securefileexchange.com
            </a>
            . Say what you have built, and which of the two you want to do. We read every note.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
