import { Header, Footer } from '@/components';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Secure File Exchange.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="py-12 md:py-20">
        <div className="container-max max-w-3xl">
          <h1 className="h1 mb-8">Privacy Policy</h1>
          <div className="prose max-w-none">
            <p className="text-secondary-600 mb-6">
              This Privacy Policy explains how Secure File Exchange collects, uses, discloses, and safeguards your information.
            </p>

            <h2 className="h3 mt-8 mb-4">Information We Collect</h2>
            <p className="text-secondary-600 mb-6">
              We collect information you provide (account registration, files, communications) and information collected automatically (usage data, IP addresses).
            </p>

            <h2 className="h3 mt-8 mb-4">How We Use Your Information</h2>
            <p className="text-secondary-600 mb-6">
              We use your information to provide and improve our service, communicate with you, and comply with legal obligations.
            </p>

            <h2 className="h3 mt-8 mb-4">Data Protection</h2>
            <p className="text-secondary-600 mb-6">
              Your information is protected with industry-standard encryption and security practices.
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
