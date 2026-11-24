'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { ArrowRight, CheckCircle2, Layers, TrendingUp, Wallet, Landmark } from 'lucide-react';
import type { FinancialStatements } from '@/lib/accounting-engine';

interface DashboardViewProps {
  companyName: string;
  industry: string;
  description: string;
  statements: FinancialStatements;
  unmatchedBankCount: number;
  openInvoicesCount: number;
  onNavigate: (tab: string) => void;
}

const fmt = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;
const PIE_COLORS = ['#0f766e', '#0d9488', '#0284c7', '#6366f1', '#f59e0b', '#94a3b8'];

export function DashboardView({
  companyName,
  industry,
  description,
  statements,
  unmatchedBankCount,
  openInvoicesCount,
  onNavigate
}: DashboardViewProps) {
  const cashAcc = statements.currentAssets.find(a => a.code === '1200')?.amount ?? 0;

  const pnlData = [
    { name: 'Revenue', value: Math.round(statements.revenue) },
    { name: 'Cost of Sales', value: Math.round(statements.cos) },
    { name: 'Gross Profit', value: Math.round(statements.grossProfit) },
    { name: 'OpEx', value: Math.round(statements.totalOpex) },
    { name: 'Net Profit', value: Math.round(statements.netProfit) }
  ];

  const assetMix = [
    ...statements.nonCurrentAssets.map(a => ({ name: a.name, value: Math.max(0, Math.round(a.nbv)) })),
    ...statements.currentAssets.filter(a => a.amount > 0).map(a => ({ name: a.name, value: Math.round(a.amount) }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200 mb-2">
            {industry} Cloud Sandbox · FY Ending 31 Dec 2025
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{companyName}</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('bank-feed')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold shadow-sm transition-colors shrink-0"
        >
          <Landmark className="w-4 h-4" />
          <span>Reconcile Bank Feed ({unmatchedBankCount})</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Assets</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center"><Layers className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{fmt(statements.totalAssets)}</p>
          <p className="text-xs text-slate-500 mt-1">NCA {fmt(statements.totalNCA)} · CA {fmt(statements.totalCA)}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Net Profit (YTD)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{fmt(statements.netProfit)}</p>
          <p className="text-xs text-slate-500 mt-1">Gross Margin {statements.ratios.grossMargin.toFixed(1)}% · Op {statements.ratios.operatingMargin.toFixed(1)}%</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cash at Bank</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center"><Wallet className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{fmt(cashAcc)}</p>
          <p className="text-xs text-slate-500 mt-1">{unmatchedBankCount} bank feed lines awaiting match</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Open AR / AP Docs</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{openInvoicesCount}</p>
          <button type="button" onClick={() => onNavigate('invoices')} className="text-xs font-semibold text-brand-700 hover:underline mt-1 inline-flex items-center gap-1">
            Manage invoices &amp; bills <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Live Accounting Equation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Real-Time Accounting Equation</h3>
            <p className="text-xs text-slate-500">Every invoice, bill, bank match, and depreciation run automatically enforces double-entry balance.</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statements.isBalanced ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {statements.isBalanced ? 'Balanced ($0 Diff)' : 'Out of Balance'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-semibold uppercase text-slate-500">Assets</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{fmt(statements.totalAssets)}</div>
          </div>
          <div className="text-xl font-bold text-slate-500">=</div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-semibold uppercase text-slate-500">Liabilities</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{fmt(statements.totalLiabilities)}</div>
          </div>
          <div className="text-xl font-bold text-slate-500">+</div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-semibold uppercase text-slate-500">Equity</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{fmt(statements.totalEquity)}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Profit &amp; Loss Performance</h3>
          <p className="text-xs text-slate-500 mb-4">Live Statement of Profit or Loss components (USD)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(val: number) => fmt(val)} />
                <Bar dataKey="value" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Asset Composition</h3>
          <p className="text-xs text-slate-500 mb-4">Net Book Value of Non-Current &amp; Current Assets</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={assetMix} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {assetMix.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => fmt(val)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
