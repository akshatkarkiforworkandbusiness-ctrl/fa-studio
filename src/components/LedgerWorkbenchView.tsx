'use client';

import React, { useState } from 'react';
import { Plus, RotateCcw, CheckCircle2 } from 'lucide-react';
import { validateJournalBalance, type AccountDef, type ComputedAccount, type JournalEntryRecord } from '@/lib/accounting-engine';

interface LedgerWorkbenchViewProps {
  accounts: AccountDef[];
  ledger: Record<string, ComputedAccount>;
  journals: JournalEntryRecord[];
  onPostJournal: (payload: { reference: string; date: string; description: string; lines: Array<{ accountCode: string; debit: number; credit: number }> }) => Promise<void>;
  onReverseJournal: (journalId: string) => Promise<void>;
}

const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export function LedgerWorkbenchView({ accounts, ledger, journals, onPostJournal, onReverseJournal }: LedgerWorkbenchViewProps) {
  const [subtab, setSubtab] = useState<'journal' | 'taccounts' | 'tb'>('journal');
  const [desc, setDesc] = useState('Year-end adjusting journal');
  const [lines, setLines] = useState([
    { accountCode: accounts[0]?.code || '5300', debit: '', credit: '' },
    { accountCode: accounts[1]?.code || '2120', debit: '', credit: '' }
  ]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const numericLines = lines.map(l => ({ accountCode: l.accountCode, debit: Number(l.debit) || 0, credit: Number(l.credit) || 0 }));
  const check = validateJournalBalance(numericLines);

  async function submitJournal(e: React.FormEvent) {
    e.preventDefault();
    if (!check.valid) {
      setFeedback(check.error || 'Journal must balance.');
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await onPostJournal({
        reference: `JRN-${journals.length + 101}`,
        date: '2025-12-31',
        description: desc.trim() || 'Manual Journal Entry',
        lines: numericLines.filter(l => l.debit > 0 || l.credit > 0)
      });
      setLines([
        { accountCode: accounts[0]?.code || '5300', debit: '', credit: '' },
        { accountCode: accounts[1]?.code || '2120', debit: '', credit: '' }
      ]);
      setFeedback('Journal posted to General Ledger!');
    } finally {
      setBusy(false);
    }
  }

  const tbAccounts = Object.values(ledger).filter(a => a.closingDr > 0 || a.closingCr > 0);
  const tbTotalDr = tbAccounts.reduce((s, a) => s + a.closingDr, 0);
  const tbTotalCr = tbAccounts.reduce((s, a) => s + a.closingCr, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">General Ledger, Journals &amp; Trial Balance</h2>
          <p className="text-sm text-slate-600 mt-1">Post manual adjusting journals, inspect live T-Accounts, and verify Trial Balance agreement.</p>
        </div>
        <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
          <button type="button" onClick={() => setSubtab('journal')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${subtab === 'journal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Manual Journal</button>
          <button type="button" onClick={() => setSubtab('taccounts')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${subtab === 'taccounts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>T-Accounts</button>
          <button type="button" onClick={() => setSubtab('tb')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${subtab === 'tb' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Trial Balance</button>
        </div>
      </div>

      {subtab === 'journal' && (
        <div className="space-y-6">
          <form onSubmit={submitJournal} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Journal Narration</label>
                <input value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs" />
              </div>
              <div className="flex items-end justify-end text-xs tabular-nums">
                <span className={`px-3 py-1.5 rounded-full font-semibold ${check.valid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                  Dr {fmt(check.totalDr)} · Cr {fmt(check.totalCr)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <select
                    value={line.accountCode}
                    onChange={e => setLines(prev => prev.map((l, idx) => idx === i ? { ...l, accountCode: e.target.value } : l))}
                    className="col-span-6 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    {accounts.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
                  </select>
                  <input
                    type="number"
                    placeholder="Debit"
                    value={line.debit}
                    onChange={e => setLines(prev => prev.map((l, idx) => idx === i ? { ...l, debit: e.target.value, credit: '' } : l))}
                    className="col-span-3 px-3 py-2 rounded-xl border border-slate-300 text-xs text-right tabular-nums"
                  />
                  <input
                    type="number"
                    placeholder="Credit"
                    value={line.credit}
                    onChange={e => setLines(prev => prev.map((l, idx) => idx === i ? { ...l, credit: e.target.value, debit: '' } : l))}
                    className="col-span-3 px-3 py-2 rounded-xl border border-slate-300 text-xs text-right tabular-nums"
                  />
                </div>
              ))}
            </div>

            {feedback && <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-xs font-medium text-brand-900">{feedback}</div>}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLines(prev => [...prev, { accountCode: accounts[0]?.code || '1200', debit: '', credit: '' }])}
                className="text-xs font-semibold text-brand-700 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line
              </button>
              <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>{busy ? 'Posting...' : 'Post Balanced Journal'}</span>
              </button>
            </div>
          </form>

          {/* Posted Journals Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Posted Audit Trail ({journals.length})</h3>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {journals.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No entries posted yet in this scenario.</div>
              ) : (
                journals.map(j => {
                  const isReversal = !!j.reversalOf;
                  const isReversed = !!j.reversedBy;
                  const canReverse = !isReversal && !isReversed;
                  return (
                    <div
                      key={j.id}
                      className={`px-5 py-3 flex flex-wrap items-center justify-between gap-3 ${
                        isReversed ? 'bg-slate-50/60' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-bold ${isReversed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                            {j.reference}
                          </span>
                          {isReversal && (
                            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                              Reversal
                            </span>
                          )}
                          {isReversed && (
                            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 border border-slate-300">
                              Reversed
                            </span>
                          )}
                          <span className={`text-slate-600 ${isReversed ? 'text-slate-400' : ''}`}>{j.description}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {j.lines.map((l, idx) => (
                            <span key={idx} className="mr-3">
                              {Number(l.debit) > 0 ? `Dr ${l.accountCode} ${fmt(Number(l.debit))}` : `Cr ${l.accountCode} ${fmt(Number(l.credit))}`}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onReverseJournal(j.id)}
                        disabled={!canReverse}
                        title={
                          isReversed
                            ? 'Already reversed'
                            : isReversal
                              ? 'A reversal cannot itself be reversed — post a new journal'
                              : 'Post an equal-and-opposite contra entry (the original is kept)'
                        }
                        className="text-rose-600 hover:text-rose-800 inline-flex items-center gap-1 font-semibold disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Reverse
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {subtab === 'taccounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(ledger).map(acc => (
            <div key={acc.code} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{acc.code} — {acc.name}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-800 tabular-nums">
                  {acc.closingDr > 0 ? `Dr ${fmt(acc.closingDr)}` : acc.closingCr > 0 ? `Cr ${fmt(acc.closingCr)}` : '$0'}
                </span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-200 text-[11px] tabular-nums">
                <div className="p-3 space-y-1">
                  <div className="font-bold text-emerald-700 border-b border-slate-100 pb-1">Debit</div>
                  {acc.entries.filter(e => e.debit > 0).map((e, idx) => (
                    <div key={idx} className="flex justify-between"><span>{e.reference}</span><span>{fmt(e.debit)}</span></div>
                  ))}
                </div>
                <div className="p-3 space-y-1">
                  <div className="font-bold text-sky-700 border-b border-slate-100 pb-1">Credit</div>
                  {acc.entries.filter(e => e.credit > 0).map((e, idx) => (
                    <div key={idx} className="flex justify-between"><span>{e.reference}</span><span>{fmt(e.credit)}</span></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {subtab === 'tb' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-xs tabular-nums">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left">Code</th>
                <th className="py-3 px-4 text-left">Account</th>
                <th className="py-3 px-4 text-right">Debit ($)</th>
                <th className="py-3 px-4 text-right">Credit ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tbAccounts.map(a => (
                <tr key={a.code} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-500 font-medium">{a.code}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-800">{a.name}</td>
                  <td className="py-2.5 px-4 text-right">{a.closingDr > 0 ? fmt(a.closingDr) : ''}</td>
                  <td className="py-2.5 px-4 text-right">{a.closingCr > 0 ? fmt(a.closingCr) : ''}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="py-3 px-4">TRIAL BALANCE TOTALS</td>
                <td className="py-3 px-4 text-right">{fmt(tbTotalDr)}</td>
                <td className="py-3 px-4 text-right">{fmt(tbTotalCr)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
