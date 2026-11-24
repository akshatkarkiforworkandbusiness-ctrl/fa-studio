'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Lock, Mail, User as UserIcon } from 'lucide-react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (user: AuthUser) => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function AuthModal({ open, onClose, onAuthenticated }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('student@fastudio.app');
  const [password, setPassword] = useState('fastudio2025');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  // Move focus into the dialog when it opens, and hand focus back to whatever
  // opened it when it closes — otherwise keyboard users are stranded.
  useEffect(() => {
    if (!open) return;
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    return () => {
      restoreFocusTo.current?.focus?.();
    };
  }, [open]);

  // Escape dismisses; Tab cycles within the dialog instead of escaping into
  // the page behind it.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const root = dialogRef.current;
      if (!root) return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active ? root.contains(active) : false;

      if (!inside || (e.shiftKey && active === first)) {
        e.preventDefault();
        (e.shiftKey && inside ? last : first).focus();
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'register' ? { name, email, password } : { email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed.');
      } else {
        onAuthenticated(data.user);
        onClose();
      }
    } catch {
      setError('Network error. Ensure the Next.js server & Prisma DB are running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      onMouseDown={e => {
        // Only dismiss when the backdrop itself is the target, not a click
        // that started inside the dialog and dragged out.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 id="auth-dialog-title" className="text-lg font-bold text-slate-900">
              {mode === 'login' ? 'Sign in to FA Studio' : 'Create Student Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Save your multi-company ledgers, bank reconciliations, and CBE exam history.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" aria-hidden="true" />
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  autoComplete="name"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700 mb-1">
              Student Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" aria-hidden="true" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" aria-hidden="true" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {error && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-60"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account & Provision 3 Companies'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
          {mode === 'login' ? (
            <>
              New to FA Studio?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="font-semibold text-brand-700 hover:underline"
              >
                Create a free student account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="font-semibold text-brand-700 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
