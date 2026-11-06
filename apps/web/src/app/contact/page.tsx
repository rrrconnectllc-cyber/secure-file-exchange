import { Header, Footer } from '@/components';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Secure File Exchange team.',
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="py-12 md:py-20">
        <div className="container-max max-w-3xl">
          <h1 className="h1 mb-4 text-center">Get in Touch</h1>
          <p className="text-lg text-secondary-600 text-center mb-12">
            Have questions? We're here to help.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="font-semibold mb-2">General</h3>
              <a href="mailto:hello@securefileexchange.com" className="text-primary-600 hover:underline">
                hello@securefileexchange.com
              </a>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Support</h3>
              <a href="mailto:support@securefileexchange.com" className="text-primary-600 hover:underline">
                support@securefileexchange.com
              </a>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Sales</h3>
              <a href="mailto:sales@securefileexchange.com" className="text-primary-600 hover:underline">
                sales@securefileexchange.com
              </a>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Security</h3>
              <a href="mailto:security@securefileexchange.com" className="text-primary-600 hover:underline">
                security@securefileexchange.com
              </a>
            </div>
          </div>

          <div className="text-center">
            <h2 className="h3 mb-4">Want a demo?</h2>
            <a href="/demo" className="text-primary-600 hover:underline font-medium">
              Schedule a demo →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
