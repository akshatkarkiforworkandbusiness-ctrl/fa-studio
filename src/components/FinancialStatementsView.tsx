'use client';

import React, { useState } from 'react';
import type { FinancialStatements } from '@/lib/accounting-engine';

const fmt = (n: number) => (n < 0 ? `($${Math.abs(Math.round(n)).toLocaleString('en-US')})` : `$${Math.round(n).toLocaleString('en-US')}`);

export function FinancialStatementsView({ companyName, statements }: { companyName: string; statements: FinancialStatements }) {
  const [mode, setMode] = useState<'ias1' | 'ifrs18'>('ifrs18');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Live Financial Statements &amp; Ratios</h2>
          <p className="text-sm text-slate-600 mt-1">{companyName} — Toggle between classic IAS 1 and the upcoming IFRS 18 Operating / Investing / Financing presentation.</p>
        </div>
        <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
          <button type="button" onClick={() => setMode('ias1')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'ias1' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>IAS 1 (ACCA FA)</button>
          <button type="button" onClick={() => setMode('ifrs18')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'ifrs18' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>IFRS 18 (2027)</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P&L */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2 text-xs tabular-nums">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Statement of Profit or Loss</h3>
              <p className="text-[11px] text-slate-500">Year ended 31 December 2025</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 font-bold">{mode === 'ifrs18' ? 'IFRS 18' : 'IAS 1'}</span>
          </div>

          {mode === 'ifrs18' && <div className="text-[11px] font-bold uppercase text-brand-700 pt-1">Operating Category</div>}
          <div className="flex justify-between"><span>Revenue</span><span>{fmt(statements.revenue)}</span></div>
          <div className="flex justify-between"><span>Cost of Sales</span><span>{fmt(-statements.cos)}</span></div>
          <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200"><span>Gross Profit</span><span>{fmt(statements.grossProfit)}</span></div>

          {statements.operatingExpenses.map(e => (
            <div key={e.code} className="flex justify-between pl-4 text-slate-600"><span>{e.name}</span><span>{fmt(-e.amount)}</span></div>
          ))}
          <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
            <span>{mode === 'ifrs18' ? 'Operating Profit (IFRS 18 Subtotal)' : 'Profit from Operations'}</span>
            <span>{fmt(statements.operatingProfit)}</span>
          </div>

          {mode === 'ifrs18' && <div className="text-[11px] font-bold uppercase text-sky-700 pt-2">Investing Category</div>}
          <div className="flex justify-between pl-4 text-slate-600"><span>Investment / Interest Income</span><span>{fmt(statements.investIncome)}</span></div>
          {mode === 'ifrs18' && (
            <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>Profit Before Financing &amp; Income Taxes</span><span>{fmt(statements.profitBeforeFinancing)}</span>
            </div>
          )}

          {mode === 'ifrs18' && <div className="text-[11px] font-bold uppercase text-amber-700 pt-2">Financing Category</div>}
          <div className="flex justify-between pl-4 text-slate-600"><span>Finance Costs</span><span>{fmt(-statements.financeCosts)}</span></div>

          <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 mt-2 border-t-2 border-slate-900">
            <span>Profit for the Year</span><span>{fmt(statements.netProfit)}</span>
          </div>
        </div>

        {/* SOFP */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2 text-xs tabular-nums">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Statement of Financial Position</h3>
              <p className="text-[11px] text-slate-500">As at 31 December 2025</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Balanced</span>
          </div>

          <div className="text-[11px] font-bold uppercase text-slate-500">Non-Current Assets (NBV)</div>
          {statements.nonCurrentAssets.map(a => (
            <div key={a.name} className="flex justify-between pl-4 text-slate-700"><span>{a.name}</span><span>{fmt(a.nbv)}</span></div>
          ))}
          <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200"><span>Total Non-Current Assets</span><span>{fmt(statements.totalNCA)}</span></div>

          <div className="text-[11px] font-bold uppercase text-slate-500 pt-2">Current Assets</div>
          {statements.currentAssets.map(a => (
            <div key={a.code} className="flex justify-between pl-4 text-slate-700"><span>{a.name}</span><span>{fmt(a.amount)}</span></div>
          ))}
          <div className="flex justify-between font-extrabold text-sm text-brand-800 py-1.5 px-2 rounded bg-brand-50/50 border-y border-brand-200">
            <span>TOTAL ASSETS</span><span>{fmt(statements.totalAssets)}</span>
          </div>

          <div className="text-[11px] font-bold uppercase text-slate-500 pt-2">Equity &amp; Liabilities</div>
          <div className="flex justify-between pl-4"><span>Ordinary Share Capital</span><span>{fmt(statements.shareCapital)}</span></div>
          <div className="flex justify-between pl-4"><span>Retained Earnings (Closing)</span><span>{fmt(statements.retainedEarningsClose)}</span></div>
          <div className="flex justify-between pl-4"><span>Non-Current Liabilities</span><span>{fmt(statements.totalNCL)}</span></div>
          <div className="flex justify-between pl-4"><span>Current Liabilities</span><span>{fmt(statements.totalCL)}</span></div>
          <div className="flex justify-between font-extrabold text-sm text-brand-800 py-1.5 px-2 rounded bg-brand-50/50 border-y border-brand-200">
            <span>TOTAL EQUITY &amp; LIABILITIES</span><span>{fmt(statements.totalEquityAndLiabilities)}</span>
          </div>
        </div>
      </div>

      {/* Ratios Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Key Financial Ratios (ACCA FA Chapter 18)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 tabular-nums">
          {[
            ['Gross Margin', `${statements.ratios.grossMargin.toFixed(1)}%`],
            ['Operating Margin', `${statements.ratios.operatingMargin.toFixed(1)}%`],
            ['ROCE', `${statements.ratios.roce.toFixed(1)}%`],
            ['Current Ratio', `${statements.ratios.currentRatio.toFixed(2)}x`],
            ['Quick Ratio', `${statements.ratios.quickRatio.toFixed(2)}x`],
            ['Gearing', `${statements.ratios.gearing.toFixed(1)}%`]
          ].map(([k, v]) => (
            <div key={k} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500">{k}</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
