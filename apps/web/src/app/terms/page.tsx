import { Header, Footer } from '@/components';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for Secure File Exchange.',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="py-12 md:py-20">
        <div className="container-max max-w-3xl">
          <h1 className="h1 mb-8">Terms of Service</h1>
          <div className="prose max-w-none">
            <p className="text-secondary-600 mb-6">
              These Terms of Service govern your access to and use of Secure File Exchange.
            </p>

            <h2 className="h3 mt-8 mb-4">Acceptance of Terms</h2>
            <p className="text-secondary-600 mb-6">
              By accessing and using this service, you accept and agree to be bound by these terms and conditions.
            </p>

            <h2 className="h3 mt-8 mb-4">Use License</h2>
            <p className="text-secondary-600 mb-6">
              Permission is granted to temporarily download material from Secure File Exchange for personal, non-commercial transitory viewing only.
            </p>

            <h2 className="h3 mt-8 mb-4">Disclaimer</h2>
            <p className="text-secondary-600 mb-6">
              The materials on Secure File Exchange are provided on an "as is" basis.
            </p>

            <p className="text-sm text-secondary-500 mt-12">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
