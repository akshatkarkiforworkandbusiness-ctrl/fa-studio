import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center">
          <Compass className="w-6 h-6 text-brand-700" aria-hidden="true" />
        </div>
        <p className="text-sm font-bold uppercase tracking-wider text-brand-700">404</p>
        <h1 className="text-xl font-bold text-slate-900">Page not found</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to FA Studio
        </Link>
      </div>
    </main>
  );
}
