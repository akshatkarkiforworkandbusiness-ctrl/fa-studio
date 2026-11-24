import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FA Studio — Financial Accounting Cloud Simulation & ACCA FA Prep',
  description:
    'Xero-style multi-company cloud accounting sandbox and ACCA FA (2025–2026) self-study platform with bank feed auto-matching, invoicing, fixed asset register, and live IFRS 18 / IAS 1 statements.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
