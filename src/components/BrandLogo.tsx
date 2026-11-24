'use client';

import React from 'react';

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
        <img
          src="/brand/fa-studio-mark.svg"
          alt="FA Studio Logo"
          className="w-8 h-8 object-contain"
        />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-slate-900">FA Studio</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
              Cloud
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Financial Accounting Sandbox</p>
        </div>
      )}
    </div>
  );
}
