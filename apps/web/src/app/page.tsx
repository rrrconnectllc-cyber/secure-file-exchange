import { Footer, Header } from '@/components';
import { HeroSection } from '@/components/HeroSection';
import { WorkflowChart } from '@/components/WorkflowChart';
import { Button } from '@/components/Button';

const record = [
  {
    term: 'The matter',
    detail: 'The case name and the client sit beside every document, so a file is never loose.',
  },
  {
    term: 'The decision',
    detail: 'Pending, approved, and rejected stay visible. A document does not leave while it is still pending.',
  },
  {
    term: 'The acceptance',
    detail: 'The client’s typed name and the time are stored with the document they accepted.',
  },
  {
    term: 'The report',
    detail: 'The activity report lists who opened the matter, who approved, and who accepted, in order.',
  },
];

const plans = [
  { name: 'Solo', price: '$0', cadence: '', people: '1 person', fit: 'One open matter. The record stays if the firm later subscribes.' },
  { name: 'Starter', price: '$29', cadence: 'a month', people: '3 people', fit: 'A small practice opening its first matters.' },
  { name: 'Business', price: '$149', cadence: 'a month', people: '15 people', fit: 'A firm filing and approving documents every day.' },
  { name: 'Enterprise', price: 'Custom', cadence: '', people: 'As arranged', fit: 'Retention, review, and a named contact.' },
];

export default function HomePage() {
  return (
    <div className="bg-cream">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <HeroSection />

        <section id="how" className="scroll-mt-20 border-t border-navy/10 py-16 lg:py-24">
          <div className="container-max grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
            <h2 className="max-w-[12ch] font-display text-4xl font-medium leading-tight tracking-tight text-navy sm:text-5xl">
              How a document moves through the firm
            </h2>
            <WorkflowChart />
          </div>
        </section>

        <section className="border-t border-navy/10 py-16 lg:py-24">
          <div className="container-max">
            <h2 className="max-w-xl font-display text-4xl font-medium leading-tight tracking-tight text-navy sm:text-5xl">
              What the firm can point to later
            </h2>
            <dl className="mt-12 grid gap-x-16 gap-y-10 sm:grid-cols-2">
              {record.map((item) => (
                <div key={item.term}>
                  <dt className="border-t-2 border-cerulean pt-3 text-lg font-semibold text-navy">{item.term}</dt>
                  <dd className="mt-3 max-w-md leading-7 text-ink">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-20 border-t border-navy/10 py-16 lg:py-24">
          <div className="container-max">
            <h2 className="font-display text-4xl font-medium tracking-tight text-navy sm:text-5xl">Pricing</h2>
            <p className="mt-3 max-w-xl text-ink">Solo stays free for one person and one matter. A paid plan is for a second person, or more than one open matter. Canceling a paid plan returns the firm to Solo and leaves the files in place.</p>
            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[52rem] border-t border-navy/15 text-left">
                <caption className="sr-only">Plans for SFX for Legal</caption>
                <thead>
                  <tr className="border-b border-navy/15 text-navy">
                    <th scope="col" className="py-4 pr-6 font-medium">
                      <span className="sr-only">Plan</span>
                    </th>
                    {plans.map((plan) => (
                      <th key={plan.name} scope="col" className="py-4 pr-6 text-lg font-semibold">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-ink">
                  <tr className="border-b border-navy/10">
                    <th scope="row" className="py-4 pr-6 font-medium text-navy">
                      Price
                    </th>
                    {plans.map((plan) => (
                      <td key={plan.name} className="py-4 pr-6 align-top">
                        <span className="font-display text-3xl font-medium text-navy">{plan.price}</span>
                        {plan.cadence && <span className="mt-1 block text-sm">{plan.cadence}</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-navy/10">
                    <th scope="row" className="py-4 pr-6 font-medium text-navy">
                      People
                    </th>
                    {plans.map((plan) => (
                      <td key={plan.name} className="py-4 pr-6">
                        {plan.people}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-navy/15">
                    <th scope="row" className="py-4 pr-6 font-medium text-navy">
                      Built for
                    </th>
                    {plans.map((plan) => (
                      <td key={plan.name} className="max-w-[14rem] py-4 pr-6 leading-6">
                        {plan.fit}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/signup">Start on Solo</Button>
              <Button href="/demo" variant="outline">
                Talk about Enterprise
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-navy py-16 text-white lg:py-20">
          <div className="container-max">
            <h2 className="max-w-xl font-display text-4xl font-medium leading-tight tracking-tight text-white sm:text-5xl">
              Open the first matter.
            </h2>
            <p className="mt-4 max-w-xl text-white/80">
              Name the client, file one document, and ask a colleague to approve it.
            </p>
            <div className="mt-8">
              <Button href="/signup" variant="secondary">
                Open a matter
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
