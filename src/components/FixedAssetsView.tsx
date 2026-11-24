'use client';

import React, { useState } from 'react';
import { Play, HardDrive } from 'lucide-react';
import { calculateAnnualDepreciation } from '@/lib/accounting-engine';

export interface FixedAssetRecord {
  id: string;
  assetTag: string;
  name: string;
  assetClass: string;
  costAccount: string;
  accumAccount: string;
  purchaseDate: string;
  cost: number;
  residualValue: number;
  usefulLifeYrs: number;
  method: 'STRAIGHT_LINE' | 'REDUCING_BALANCE';
  ratePercent: number;
  accumulatedDep: number;
  lastDepYear?: number | null;
}

interface FixedAssetsViewProps {
  assets: FixedAssetRecord[];
  onRunDepreciation: (assetId: string) => Promise<void>;
}

const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export function FixedAssetsView({ assets, onRunDepreciation }: FixedAssetsViewProps) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function run(id: string) {
    setBusyId(id);
    try {
      await onRunDepreciation(id);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Fixed Asset Register (IAS 16 &amp; IAS 38)</h2>
        <p className="text-sm text-slate-600 mt-1">
          Inspect carrying amounts (NBV), depreciation policies (Straight-Line vs. Reducing Balance), and post annual depreciation journals directly into the General Ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map(a => {
          const nbv = Math.max(0, a.cost - a.accumulatedDep);
          const nextCharge = calculateAnnualDepreciation(a);
          const depDone = a.lastDepYear === 2025;

          return (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700">
                    <HardDrive className="w-4 h-4" /> {a.assetTag}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {a.method === 'STRAIGHT_LINE' ? `Straight-Line (${a.usefulLifeYrs} yrs)` : `Reducing Balance (${a.ratePercent}%)`}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{a.name}</h3>
                <div className="grid grid-cols-3 gap-2 pt-2 text-xs tabular-nums">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">Cost</div>
                    <div className="font-bold text-slate-900 mt-0.5">{fmt(a.cost)}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">Accum. Dep</div>
                    <div className="font-bold text-rose-700 mt-0.5">{fmt(a.accumulatedDep)}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-brand-50/70 border border-brand-200">
                    <div className="text-[10px] uppercase font-semibold text-brand-700">Net Book Value</div>
                    <div className="font-bold text-brand-900 mt-0.5">{fmt(nbv)}</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-600 tabular-nums">
                  2025 Charge: <strong className="text-slate-900">{fmt(nextCharge)}</strong>
                </div>
                <button
                  type="button"
                  disabled={depDone || nextCharge <= 0 || busyId === a.id}
                  onClick={() => run(a.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{depDone ? '2025 Posted' : busyId === a.id ? 'Posting...' : 'Run 2025 Depreciation'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
