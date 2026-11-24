import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FA Studio — Learn Financial Accounting by Doing the Close',
    template: '%s | FA Studio'
  },
  description:
    'Xero-style multi-company cloud accounting sandbox and ACCA FA (2025–2026) self-study platform with bank feed auto-matching, invoicing, fixed asset register, and live IFRS 18 / IAS 1 statements.',
  applicationName: 'FA Studio',
  icons: {
    icon: '/brand/fa-studio-mark.svg'
  },
  openGraph: {
    type: 'website',
    siteName: 'FA Studio',
    title: 'FA Studio — Learn Financial Accounting by Doing the Close',
    description:
      'A multi-company accounting sandbox and ACCA FA exam simulator with live IFRS statements.',
    url: SITE_URL
  },
  twitter: {
    card: 'summary',
    title: 'FA Studio — Learn Financial Accounting by Doing the Close',
    description:
      'A multi-company accounting sandbox and ACCA FA exam simulator with live IFRS statements.'
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  themeColor: '#0f766e',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
