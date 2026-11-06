import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const APP_NAME = 'SFX for Legal';
const APP_DESCRIPTION = 'Document management and approval for law firms. File documents on a matter, approve release, and keep an activity record.';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  keywords: [
    'secure file transfer',
    'file sharing',
    'document exchange',
    'encryption',
    'confidential',
    'enterprise',
  ],
  authors: [{ name: 'Secure File Exchange Team' }],
  creator: 'Secure File Exchange',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://example.com',
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
    googleBot: 'snippet, archive',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFBF4' },
    { media: '(prefers-color-scheme: dark)', color: '#1D2749' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1D2749" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
      </head>
      <body className="bg-cream font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
