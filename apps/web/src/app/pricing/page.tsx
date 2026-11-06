import Link from 'next/link';
import { Header, Footer, Button, Card } from '@/components';

export const metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for secure file exchange.',
};

export default function PricingPage() {
  return (
    <>
      <Header />

      <main className="py-12 md:py-20">
        <div className="container-max">
          <div className="text-center mb-12">
            <h1 className="h1 mb-4">Transparent Pricing</h1>
            <p className="text-lg text-secondary-600">
              Solo is free for one person and one matter. Paid plans add people. Canceling returns the firm to Solo.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto mb-12">
            <Card className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200">
                    <th className="text-left px-6 py-4 font-semibold bg-secondary-50">Feature</th>
                    <th className="text-center px-6 py-4 font-semibold bg-secondary-50">Solo</th>
                    <th className="text-center px-6 py-4 font-semibold bg-secondary-50">Starter</th>
                    <th className="text-center px-6 py-4 font-semibold bg-secondary-50">Business</th>
                    <th className="text-center px-6 py-4 font-semibold bg-secondary-50">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-secondary-200">
                    <td className="px-6 py-4">Price/month</td>
                    <td className="text-center px-6 py-4">$0</td>
                    <td className="text-center px-6 py-4">$29</td>
                    <td className="text-center px-6 py-4">$149</td>
                    <td className="text-center px-6 py-4">Custom</td>
                  </tr>
                  <tr className="border-b border-secondary-200 bg-secondary-50">
                    <td className="px-6 py-4">Team members</td>
                    <td className="text-center px-6 py-4">1</td>
                    <td className="text-center px-6 py-4">Up to 3</td>
                    <td className="text-center px-6 py-4">Up to 15</td>
                    <td className="text-center px-6 py-4">Unlimited</td>
                  </tr>
                  <tr className="border-b border-secondary-200">
                    <td className="px-6 py-4">Open matters</td>
                    <td className="text-center px-6 py-4">1</td>
                    <td className="text-center px-6 py-4">As needed</td>
                    <td className="text-center px-6 py-4">As needed</td>
                    <td className="text-center px-6 py-4">As arranged</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/signup">
              <Button variant="primary" size="lg">
                Start on Solo
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
