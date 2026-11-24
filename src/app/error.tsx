'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Root error boundary. Without it, a single thrown error during render
 * unmounts the whole tree and the user gets a blank page with no way back.
 */
export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the console so browser error reporting can pick it up.
    console.error('FA Studio render error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-rose-600" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          An unexpected error interrupted this screen. Your data is unaffected —
          try reloading, or head back to the dashboard.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-500 font-mono">Reference: {error.digest}</p>
        )}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold shadow-xs"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Back to start
          </Link>
        </div>
      </div>
    </main>
  );
}
