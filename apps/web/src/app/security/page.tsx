import { Header, Footer, Card } from '@/components';

export const metadata = {
  title: 'Security',
  description: 'Security architecture and practices at Secure File Exchange.',
};

export default function SecurityPage() {
  return (
    <>
      <Header />
      <main className="py-12 md:py-20">
        <div className="container-max">
          <h1 className="h1 mb-4 text-center">Security First</h1>
          <p className="text-lg text-secondary-600 text-center mb-12 max-w-2xl mx-auto">
            Built with enterprise security architecture from day one.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">🔐 Encryption</h3>
              <p className="text-secondary-600 text-sm">
                End-to-end encryption for all files. TLS for transit. KMS for key management.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">🔍 Threat Model</h3>
              <p className="text-secondary-600 text-sm">
                STRIDE threat model covers attack vectors with documented mitigations.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">📋 Audit Logging</h3>
              <p className="text-secondary-600 text-sm">
                Comprehensive audit trails. Tamper-evident logging. Full accountability.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">✅ OWASP ASVS</h3>
              <p className="text-secondary-600 text-sm">
                Controls mapped to OWASP ASVS 5.0 and NIST Cybersecurity Framework.
              </p>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-secondary-600 mb-4">
              For detailed security information, see our Security Review Package.
            </p>
            <a href="/security-review" className="text-primary-600 hover:underline font-medium">
              Download Security Review Package →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
