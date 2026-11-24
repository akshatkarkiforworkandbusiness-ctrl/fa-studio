'use client';

import React, { useState } from 'react';
import { CheckCircle2, Sparkles, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { suggestBankFeedMatches, type BankFeedItem, type OpenDocCandidate, type AccountDef } from '@/lib/accounting-engine';

interface BankFeedViewProps {
  bankTransactions: BankFeedItem[];
  invoices: OpenDocCandidate[];
  accounts: AccountDef[];
  onReconcile: (payload: { bankTxId: string; mode: 'MATCH_DOC' | 'CREATE_TX'; docId?: string; accountCode?: string }) => Promise<void>;
}

const fmt = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;

export function BankFeedView({ bankTransactions, invoices, accounts, onReconcile }: BankFeedViewProps) {
  const suggestions = suggestBankFeedMatches(bankTransactions, invoices);
  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const unmatched = bankTransactions.filter(t => t.status === 'UNMATCHED');
  const reconciled = bankTransactions.filter(t => t.status === 'RECONCILED');

  async function handleAction(txId: string, mode: 'MATCH_DOC' | 'CREATE_TX', docId?: string, accountCode?: string) {
    setBusyId(txId);
    try {
      await onReconcile({ bankTxId: txId, mode, docId, accountCode });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Xero-Style Bank Feed Auto-Matching</h2>
          <p className="text-sm text-slate-600 mt-1">
            Review incoming bank statement lines, accept green auto-matched AR/AP documents, or code direct bank fees and interest directly to the General Ledger.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 tabular-nums">
            {unmatched.length} Unmatched
          </span>
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 tabular-nums">
            {reconciled.length} Reconciled
          </span>
        </div>
      </div>

      {/* Unmatched Feed Cards */}
      <div className="space-y-3">
        {unmatched.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-emerald-950">Bank Feed 100% Reconciled!</h3>
            <p className="text-xs text-emerald-800 mt-1">Every bank statement line has been matched or coded to the General Ledger.</p>
          </div>
        ) : (
          unmatched.map(tx => {
            const sug = suggestions[tx.id];
            const isInflow = tx.amount > 0;
            const chosenAcc = selectedAccounts[tx.id] || (isInflow ? '4100' : '5500');

            return (
              <div key={tx.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Left: Bank Statement Line */}
                <div className="lg:col-span-5 flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isInflow ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {isInflow ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">{tx.date}</span>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{tx.reference}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{tx.description}</p>
                    <p className={`text-sm font-extrabold tabular-nums mt-0.5 ${isInflow ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isInflow ? '+' : '−'}{fmt(tx.amount)} ({isInflow ? 'Spent / Received: Cash In' : 'Cash Out'})
                    </p>
                  </div>
                </div>

                {/* Right: Auto-Match Suggestion OR Create Transaction */}
                <div className="lg:col-span-7">
                  {sug ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                          <Sparkles className="w-3.5 h-3.5" /> Auto-Match Found ({sug.confidence})
                        </div>
                        <p className="text-xs font-semibold text-slate-900 mt-0.5">{sug.docType}: {sug.docNumber} — {sug.counterparty}</p>
                        <p className="text-[11px] text-emerald-900">{sug.reason}</p>
                      </div>
                      <button
                        type="button"
                        disabled={busyId === tx.id}
                        onClick={() => handleAction(tx.id, 'MATCH_DOC', sug.docId)}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs shrink-0 disabled:opacity-60"
                      >
                        {busyId === tx.id ? 'Posting...' : 'OK — Match & Post'}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                          Create &amp; Code Direct Bank Entry
                        </label>
                        <select
                          value={chosenAcc}
                          onChange={e => setSelectedAccounts(prev => ({ ...prev, [tx.id]: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          {accounts.filter(a => a.code !== '1200').map(a => (
                            <option key={a.code} value={a.code}>{a.code} — {a.name} ({a.category})</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        disabled={busyId === tx.id}
                        onClick={() => handleAction(tx.id, 'CREATE_TX', undefined, chosenAcc)}
                        className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-xs shrink-0 disabled:opacity-60"
                      >
                        {busyId === tx.id ? 'Posting...' : 'Post to Ledger'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reconciled History */}
      {reconciled.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
            <h3 className="text-sm font-bold text-slate-900">Reconciled Bank Feed Lines</h3>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {reconciled.map(tx => (
              <div key={tx.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-slate-900">{tx.description}</span>
                  <span className="ml-2 text-slate-400">{tx.date} · Ref {tx.reference}</span>
                </div>
                <div className="flex items-center gap-3 tabular-nums">
                  <span className="font-bold text-slate-900">{tx.amount > 0 ? '+' : '−'}{fmt(tx.amount)}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">Reconciled</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
