import Link from 'next/link';
import { Logo } from '@/components/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="border-b border-navy/10">
        <div className="container-max py-5">
          <Logo />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="border-t border-navy/10 py-6">
        <div className="container-max text-center text-sm text-secondary-600">
          <div className="mb-4 flex justify-center gap-6">
            <Link href="/privacy" className="hover:text-navy">Privacy</Link>
            <Link href="/terms" className="hover:text-navy">Terms</Link>
            <Link href="/security" className="hover:text-navy">Security</Link>
            <Link href="/contact" className="hover:text-navy">Contact</Link>
          </div>
          <p>© {new Date().getFullYear()} Secure File Exchange. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
