'use client';

import React, { useState } from 'react';
import { Plus, FileText, Receipt } from 'lucide-react';
import type { AccountDef } from '@/lib/accounting-engine';

export interface InvoiceRecord {
  id: string;
  type: 'INVOICE' | 'BILL';
  number: string;
  counterparty: string;
  issueDate: string;
  dueDate: string;
  netAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  accountCode: string;
  status: 'OPEN' | 'PAID';
}

interface InvoicesBillsViewProps {
  invoices: InvoiceRecord[];
  accounts: AccountDef[];
  onCreateDoc: (payload: {
    type: 'INVOICE' | 'BILL';
    number: string;
    counterparty: string;
    issueDate: string;
    dueDate: string;
    netAmount: number;
    taxRate: number;
    accountCode: string;
  }) => Promise<void>;
}

const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export function InvoicesBillsView({ invoices, accounts, onCreateDoc }: InvoicesBillsViewProps) {
  const [type, setType] = useState<'INVOICE' | 'BILL'>('INVOICE');
  const [number, setNumber] = useState('INV-2025-505');
  const [counterparty, setCounterparty] = useState('');
  const [netAmount, setNetAmount] = useState('5000');
  const [taxRate, setTaxRate] = useState('20');
  const [accountCode, setAccountCode] = useState('4000');
  const [busy, setBusy] = useState(false);

  const filteredAccounts = accounts.filter(a => (type === 'INVOICE' ? a.category === 'Income' : a.category === 'Expense' || a.code === '1220'));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!counterparty.trim() || Number(netAmount) <= 0) return;
    setBusy(true);
    try {
      await onCreateDoc({
        type,
        number: number.trim() || `${type}-${Date.now().toString().slice(-4)}`,
        counterparty: counterparty.trim(),
        issueDate: '2025-12-30',
        dueDate: '2026-01-29',
        netAmount: Number(netAmount),
        taxRate: Number(taxRate) || 0,
        accountCode
      });
      setCounterparty('');
      setNumber(type === 'INVOICE' ? `INV-2025-${Math.floor(510 + Math.random() * 400)}` : `BILL-${Math.floor(900 + Math.random() * 99)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Invoicing (AR) &amp; Supplier Bills (AP)</h2>
        <p className="text-sm text-slate-600 mt-1">
          Issue sales invoices or record supplier bills—FA Studio automatically posts the IFRS 15 / Sales Tax double-entry journal to the General Ledger.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900">Create New Document (Auto-Posts to GL)</h3>
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => { setType('INVOICE'); setAccountCode('4000'); setNumber('INV-2025-505'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${type === 'INVOICE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Sales Invoice (AR)
            </button>
            <button
              type="button"
              onClick={() => { setType('BILL'); setAccountCode('5000'); setNumber('BILL-905'); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${type === 'BILL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Supplier Bill (AP)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Document #</label>
            <input value={number} onChange={e => setNumber(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">{type === 'INVOICE' ? 'Customer Name' : 'Supplier Name'}</label>
            <input value={counterparty} onChange={e => setCounterparty(e.target.value)} placeholder="e.g. Acme Corp" required className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Net Amount ($)</label>
            <input type="number" min="1" value={netAmount} onChange={e => setNetAmount(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs tabular-nums" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sales Tax (%)</label>
            <input type="number" min="0" max="50" value={taxRate} onChange={e => setTaxRate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs tabular-nums" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Ledger Account</label>
            <select value={accountCode} onChange={e => setAccountCode(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white">
              {filteredAccounts.map(a => <option key={a.code} value={a.code}>{a.code} {a.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-600 tabular-nums">
            Gross Total: <strong className="text-slate-900">{fmt(Number(netAmount || 0) * (1 + Number(taxRate || 0) / 100))}</strong>
          </div>
          <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold shadow-xs disabled:opacity-60">
            <Plus className="w-4 h-4" />
            <span>{busy ? 'Posting...' : `Issue ${type === 'INVOICE' ? 'Invoice' : 'Bill'} & Post Journal`}</span>
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left">Type / Ref</th>
                <th className="py-3 px-4 text-left">Counterparty</th>
                <th className="py-3 px-4 text-left">Due Date</th>
                <th className="py-3 px-4 text-right">Net</th>
                <th className="py-3 px-4 text-right">Tax</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {invoices.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    {doc.type === 'INVOICE' ? <FileText className="w-3.5 h-3.5 text-brand-700" /> : <Receipt className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{doc.number}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{doc.counterparty}</td>
                  <td className="py-3 px-4 text-slate-500">{doc.dueDate}</td>
                  <td className="py-3 px-4 text-right">{fmt(doc.netAmount)}</td>
                  <td className="py-3 px-4 text-right text-slate-500">{fmt(doc.taxAmount)}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{fmt(doc.totalAmount)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${doc.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
