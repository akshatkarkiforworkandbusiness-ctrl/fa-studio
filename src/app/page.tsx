import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Landmark,
  RefreshCw,
  FileSpreadsheet,
  Briefcase,
  ClipboardCheck,
  BookOpen,
  CheckCircle2,
  Layers,
  TrendingUp
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export const metadata: Metadata = {
  title: 'FA Studio — Learn Financial Accounting by Doing the Close',
  description:
    'A multi-company accounting sandbox and ACCA FA (2025–2026) exam simulator. Post journals, reconcile a live bank feed, depreciate plant assets, and read IFRS 18 statements that update as you type.',
  keywords: [
    'ACCA FA',
    'financial accounting',
    'double entry',
    'IFRS',
    'IAS 16',
    'bank reconciliation',
    'accounting sandbox',
    'CBE practice'
  ],
  openGraph: {
    title: 'FA Studio — Learn Financial Accounting by Doing the Close',
    description:
      'A multi-company accounting sandbox and ACCA FA exam simulator with live IFRS statements.',
    type: 'website'
  }
};

const FEATURES = [
  {
    icon: Layers,
    title: 'Three companies, one workspace',
    body: 'Switch between a retailer, a SaaS business and a manufacturer — each with its own chart of accounts, bank feed, invoices, and asset register. The ledgers never touch each other.',
    detail: 'Retail · B2B SaaS · Manufacturing'
  },
  {
    icon: RefreshCw,
    title: 'Bank feed auto-matching',
    body: 'Incoming statement lines are matched against open invoices and bills, with one-click coding for bank fees and standing orders. Mismatches are refused rather than silently accepted.',
    detail: 'Xero-style reconciliation'
  },
  {
    icon: FileSpreadsheet,
    title: 'Statements that reconcile',
    body: 'Every posting flows through a real double-entry engine, so the trial balance, profit or loss, and financial position stay in step. Toggle between IAS 1 and the IFRS 18 presentation.',
    detail: 'IAS 1 ⇄ IFRS 18'
  }
];

const STEPS = [
  {
    n: '01',
    title: 'Read the manager’s brief',
    body: 'Each company starts with an internship mission — a realistic email from the finance manager describing what needs doing before year-end close.'
  },
  {
    n: '02',
    title: 'Do the work',
    body: 'Reconcile the bank, issue invoices, run IAS 16 depreciation, post adjusting journals. Six guided steps, each tied to an ACCA chapter.'
  },
  {
    n: '03',
    title: 'Get unstuck properly',
    body: 'Stuck on accruals? A “back-on-track” entry posts the correct double entry and explains the reasoning, so you learn from the fix instead of copying it.'
  },
  {
    n: '04',
    title: 'Prove it in the exam',
    body: 'Sit the ACCA FA CBE mock — 10 objective questions plus a group consolidation task — graded server-side with worked solutions on submission.'
  }
];

const STANDARDS = [
  'IFRS 18',
  'IAS 1',
  'IAS 2',
  'IAS 7',
  'IAS 10',
  'IAS 16',
  'IAS 37',
  'IAS 38',
  'IFRS 3',
  'IFRS 10',
  'IFRS 15'
];

function HeroDashboard() {
  const kpis = [
    { label: 'Revenue', value: '$600,000', tone: 'text-slate-900' },
    { label: 'Gross profit', value: '$240,000', tone: 'text-slate-900' },
    { label: 'Operating profit', value: '$145,000', tone: 'text-brand-700' },
    { label: 'Cash at bank', value: '$40,000', tone: 'text-slate-900' }
  ];

  const rows = [
    { code: '1200', name: 'Cash at Bank', dr: '40,000', cr: '' },
    { code: '1210', name: 'Trade Receivables', dr: '72,000', cr: '' },
    { code: '1220', name: 'Inventory', dr: '48,000', cr: '' },
    { code: '2100', name: 'Trade Payables', dr: '', cr: '65,000' },
    { code: '3000', name: 'Ordinary Share Capital', dr: '', cr: '300,000' },
    { code: '4000', name: 'Sales Revenue', dr: '', cr: '600,000' }
  ];

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
        <span className="ml-3 text-xs font-medium text-slate-500 truncate">
          Meridian Retail Ltd — Year-end close
        </span>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
          Balanced
        </span>
      </div>

      <div className="p-4 sm:p-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {k.label}
            </div>
            <div className={`mt-1 text-lg font-bold tabular-nums ${k.tone}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="px-4 sm:px-5 pb-5">
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-[64px_1fr_84px_84px] bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            <div className="px-3 py-2">Code</div>
            <div className="px-3 py-2">Account</div>
            <div className="px-3 py-2 text-right">Debit</div>
            <div className="px-3 py-2 text-right">Credit</div>
          </div>
          {rows.map(r => (
            <div
              key={r.code}
              className="grid grid-cols-[64px_1fr_84px_84px] border-b border-slate-100 last:border-0 text-xs"
            >
              <div className="px-3 py-2 font-mono text-slate-500">{r.code}</div>
              <div className="px-3 py-2 text-slate-700 truncate">{r.name}</div>
              <div className="px-3 py-2 text-right tabular-nums text-slate-900">{r.dr}</div>
              <div className="px-3 py-2 text-right tabular-nums text-slate-900">{r.cr}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-500">
          Opening trial balance · debits equal credits · every figure recomputes from the ledger
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <BrandLogo />
          <nav aria-label="Primary" className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#exam" className="hover:text-slate-900">Exam prep</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold shadow-xs"
            >
              Open sandbox
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -top-40 -right-32 w-[36rem] h-[36rem] rounded-full bg-brand-200/40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-48 -left-40 w-[32rem] h-[32rem] rounded-full bg-sky-200/40 blur-3xl"
          />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-24 grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600" aria-hidden="true" />
                ACCA FA (2025–2026) syllabus aligned
              </span>

              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.05]">
                Learn accounting by
                <span className="text-brand-700"> doing the close</span>.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                FA Studio is a multi-company accounting sandbox. Post journals, reconcile a live
                bank feed, depreciate plant under IAS 16, and read statements that update as you
                type — then sit the ACCA FA mock exam against the same numbers.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold shadow-sm"
                >
                  Open the sandbox — no setup
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300"
                >
                  See how it works
                </a>
              </div>

              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
                {['Runs in guest mode instantly', 'Three seeded companies', 'Double-entry validated'].map(
                  t => (
                    <li key={t} className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" aria-hidden="true" />
                      {t}
                    </li>
                  )
                )}
              </ul>
            </div>

            <HeroDashboard />
          </div>
        </section>

        {/* ── Standards strip ──────────────────────────────────── */}
        <section aria-label="Standards covered" className="border-y border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Standards covered
            </span>
            {STANDARDS.map(s => (
              <span
                key={s}
                className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 scroll-mt-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">What you get</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
              A working accounting system, not a quiz
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Most study tools ask you to recall facts. FA Studio makes you produce numbers that
              have to balance — and shows you the financial statements they generate.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <article
                  key={f.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-700" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed flex-1">{f.body}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 pt-2 border-t border-slate-100">
                    {f.detail}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section id="how" className="bg-white border-y border-slate-200 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
                The internship mission
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
                Four steps from brief to exam
              </h2>
            </div>

            <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map(s => (
                <li key={s.n} className="relative">
                  <div className="text-sm font-extrabold text-brand-700 tabular-nums">{s.n}</div>
                  <div className="mt-3 h-px bg-slate-200" aria-hidden="true" />
                  <h3 className="mt-4 text-sm font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 grid sm:grid-cols-3 gap-6">
              {[
                { icon: Briefcase, k: '3', v: 'company missions with manager briefs' },
                { icon: TrendingUp, k: '6', v: 'guided close steps per company' },
                { icon: Landmark, k: '24', v: 'accounts in every chart of accounts' }
              ].map(m => {
                const Icon = m.icon;
                return (
                  <div key={m.v} className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-brand-700 mt-0.5 shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-2xl font-extrabold tabular-nums">{m.k}</div>
                      <div className="text-sm text-slate-600">{m.v}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Exam ─────────────────────────────────────────────── */}
        <section id="exam" className="scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-400">
                  Exam preparation
                </p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Sit the ACCA FA mock, get worked solutions
                </h2>
                <p className="mt-4 text-slate-300 leading-relaxed">
                  Ten two-mark objective questions plus a fifteen-mark group consolidation task,
                  covering inventory, depreciation, accruals, intangibles, provisions, bank
                  reconciliation, suspense accounts, events after the reporting period, cash flows
                  and ratios.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-slate-300">
                  {[
                    'Graded on the server — the answer key never reaches your browser',
                    'Worked solutions revealed only after you submit',
                    'Pass mark set at 50%, matching the real paper'
                  ].map(t => (
                    <li key={t} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/app"
                  className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100"
                >
                  <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
                  Open the exam simulator
                </Link>
              </div>

              <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Study hub
                  </span>
                  <BookOpen className="w-4 h-4 text-slate-400" aria-hidden="true" />
                </div>
                {[
                  { c: 'IAS 16', t: 'Property, plant & equipment', d: 'Straight-line vs reducing balance' },
                  { c: 'IAS 38', t: 'Intangible assets', d: 'Research vs development spend' },
                  { c: 'IFRS 18', t: 'Presentation & disclosure', d: 'Operating / investing / financing' },
                  { c: 'IAS 37', t: 'Provisions & contingencies', d: 'Probable vs possible obligations' }
                ].map(s => (
                  <div key={s.c} className="flex items-start gap-3 border-b border-slate-700 pb-3 last:border-0 last:pb-0">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-600 text-white shrink-0">
                      {s.c}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{s.t}</div>
                      <div className="text-xs text-slate-400">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section className="border-t border-slate-200 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Open it and start posting entries
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              The sandbox runs immediately in guest mode. Create an account when you want your
              ledgers, close progress and exam history to persist.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold shadow-sm"
              >
                Launch FA Studio
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300"
              >
                Review the features
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <BrandLogo />
          <p className="text-xs text-slate-500 text-center sm:text-right max-w-md">
            An independent study project. Not affiliated with, endorsed by, or connected to ACCA
            or the IFRS Foundation. Standard references link to official sources.
          </p>
        </div>
      </footer>
    </div>
  );
}
