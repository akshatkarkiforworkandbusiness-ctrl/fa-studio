'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Briefcase, Landmark, FileText, HardDrive, BookOpen, BarChart3,
  GraduationCap, ClipboardCheck, LogIn, LogOut, Building2, Menu
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { AuthModal, type AuthUser } from './AuthModal';
import { DashboardView } from './DashboardView';
import { InternshipMissionView } from './InternshipMissionView';
import { BankFeedView } from './BankFeedView';
import { InvoicesBillsView, type InvoiceRecord } from './InvoicesBillsView';
import { FixedAssetsView, type FixedAssetRecord } from './FixedAssetsView';
import { LedgerWorkbenchView } from './LedgerWorkbenchView';
import { FinancialStatementsView } from './FinancialStatementsView';
import { StudyExamView } from './StudyExamView';
import {
  computeGeneralLedger, computeFinancialStatements, calculateAnnualDepreciation,
  type AccountDef, type BankFeedItem, type JournalEntryRecord
} from '@/lib/accounting-engine';
import { MULTI_COMPANY_SCENARIOS } from '@/lib/scenarios';
import { INTERNSHIP_MISSIONS, evaluateMissionSteps, type MissionStep } from '@/lib/internship-missions';

interface CompanyWorkspace {
  id: string;
  slug: string;
  name: string;
  industry: string;
  description: string;
  accounts: AccountDef[];
  journals: JournalEntryRecord[];
  invoices: InvoiceRecord[];
  bankTransactions: BankFeedItem[];
  fixedAssets: FixedAssetRecord[];
}

function buildGuestWorkspaces(): CompanyWorkspace[] {
  return MULTI_COMPANY_SCENARIOS.map((s, idx) => ({
    id: `guest-${idx + 1}`,
    slug: s.slug,
    name: s.name,
    industry: s.industry,
    description: s.description,
    accounts: s.accounts,
    journals: [],
    invoices: s.invoices.map((inv, i) => ({ ...inv, id: `inv-${idx}-${i}` })),
    bankTransactions: s.bankTransactions.map((tx, i) => ({ ...tx, id: `btx-${idx}-${i}` })),
    fixedAssets: s.fixedAssets.map((fa, i) => ({ ...fa, id: `fa-${idx}-${i}`, lastDepYear: null }))
  }));
}

export function AppShell() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('internship');
  const [companies, setCompanies] = useState<CompanyWorkspace[]>(() => buildGuestWorkspaces());
  const [activeCompanyId, setActiveCompanyId] = useState<string>('guest-1');
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});
  const [reviewedStatementsByCompany, setReviewedStatementsByCompany] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  function navigateTab(tab: string) {
    setActiveTab(tab);
    setMobileOpen(false);
    if (tab === 'statements') {
      setReviewedStatementsByCompany(prev => ({ ...prev, [activeCompanyId]: true }));
    }
  }

  async function syncFromServer() {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.user) {
        setUser(meData.user);
        const [compRes, progRes] = await Promise.all([fetch('/api/companies'), fetch('/api/progress')]);
        if (compRes.ok) {
          const cData = await compRes.json();
          if (cData.companies?.length) {
            setCompanies(cData.companies);
            setActiveCompanyId(prev => (cData.companies.some((c: CompanyWorkspace) => c.id === prev) ? prev : cData.companies[0].id));
          }
        }
        if (progRes.ok) {
          const pData = await progRes.json();
          const map: Record<string, boolean> = {};
          for (const item of pData.progress || []) map[item.topicCode] = item.completed;
          setCompletedTopics(map);
        }
      }
    } catch {
      /* Offline/Guest fallback works seamlessly */
    }
  }

  useEffect(() => {
    syncFromServer();
  }, []);

  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0];
  const ledger = useMemo(() => computeGeneralLedger(activeCompany.accounts, activeCompany.journals), [activeCompany]);
  const statements = useMemo(() => computeFinancialStatements(ledger), [ledger]);

  const activeMission = INTERNSHIP_MISSIONS[activeCompany.slug] || INTERNSHIP_MISSIONS['meridian-retail'];
  const missionStepStatus = useMemo(
    () =>
      evaluateMissionSteps({
        slug: activeCompany.slug,
        journals: activeCompany.journals,
        bankTransactions: activeCompany.bankTransactions,
        invoices: activeCompany.invoices,
        fixedAssets: activeCompany.fixedAssets,
        statements,
        statementsReviewed: !!reviewedStatementsByCompany[activeCompany.id]
      }),
    [activeCompany, statements, reviewedStatementsByCompany]
  );
  const completedCloseSteps = Object.values(missionStepStatus).filter(Boolean).length;

  async function handleReconcileBank(payload: { bankTxId: string; mode: 'MATCH_DOC' | 'CREATE_TX'; docId?: string; accountCode?: string }) {
    if (user) {
      const res = await fetch(`/api/companies/${activeCompany.id}/bank-feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await syncFromServer();
        notify('Bank feed line reconciled & posted to General Ledger.');
        return;
      }
    }
    setCompanies(prev => prev.map(c => {
      if (c.id !== activeCompany.id) return c;
      const tx = c.bankTransactions.find(t => t.id === payload.bankTxId);
      if (!tx) return c;
      const absAmt = Math.abs(tx.amount);
      const isInflow = tx.amount > 0;
      let counterAcc = payload.accountCode || (isInflow ? '4100' : '5500');
      const nextInvoices = c.invoices.map(inv => {
        if (payload.mode === 'MATCH_DOC' && inv.id === payload.docId) {
          counterAcc = inv.type === 'INVOICE' ? '1210' : '2100';
          return { ...inv, status: 'PAID' as const };
        }
        return inv;
      });
      const newJournal: JournalEntryRecord = {
        id: `jrn-${Date.now()}`,
        reference: tx.reference,
        date: tx.date,
        description: `Bank Feed Reconciled: ${tx.description}`,
        sourceType: 'BANK_FEED',
        lines: isInflow
          ? [{ accountCode: '1200', debit: absAmt, credit: 0 }, { accountCode: counterAcc, debit: 0, credit: absAmt }]
          : [{ accountCode: counterAcc, debit: absAmt, credit: 0 }, { accountCode: '1200', debit: 0, credit: absAmt }]
      };
      return {
        ...c,
        invoices: nextInvoices,
        journals: [newJournal, ...c.journals],
        bankTransactions: c.bankTransactions.map(t => t.id === tx.id ? { ...t, status: 'RECONCILED' } : t)
      };
    }));
    notify('Bank feed line reconciled & posted to General Ledger.');
  }

  async function handleCreateDoc(payload: { type: 'INVOICE' | 'BILL'; number: string; counterparty: string; issueDate: string; dueDate: string; netAmount: number; taxRate: number; accountCode: string }) {
    if (user) {
      const res = await fetch(`/api/companies/${activeCompany.id}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await syncFromServer();
        notify(`${payload.type} ${payload.number} created & posted to GL.`);
        return;
      }
    }
    const taxAmount = Math.round(payload.netAmount * (payload.taxRate / 100) * 100) / 100;
    const totalAmount = payload.netAmount + taxAmount;
    const newDoc: InvoiceRecord = { ...payload, id: `doc-${Date.now()}`, taxAmount, totalAmount, status: 'OPEN' };
    const lines = payload.type === 'INVOICE'
      ? [{ accountCode: '1210', debit: totalAmount, credit: 0 }, { accountCode: payload.accountCode, debit: 0, credit: payload.netAmount }, ...(taxAmount > 0 ? [{ accountCode: '2110', debit: 0, credit: taxAmount }] : [])]
      : [{ accountCode: payload.accountCode, debit: payload.netAmount, credit: 0 }, ...(taxAmount > 0 ? [{ accountCode: '2110', debit: taxAmount, credit: 0 }] : []), { accountCode: '2100', debit: 0, credit: totalAmount }];
    const newJournal: JournalEntryRecord = {
      id: `jrn-${Date.now()}`,
      reference: payload.number,
      date: payload.issueDate,
      description: `${payload.type} — ${payload.counterparty}`,
      sourceType: payload.type,
      lines
    };
    setCompanies(prev => prev.map(c => c.id === activeCompany.id ? { ...c, invoices: [newDoc, ...c.invoices], journals: [newJournal, ...c.journals] } : c));
    notify(`${payload.type} ${payload.number} created & posted to GL.`);
  }

  async function handleRunDepreciation(assetId: string) {
    if (user) {
      const res = await fetch(`/api/companies/${activeCompany.id}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, fiscalYear: 2025 })
      });
      if (res.ok) {
        await syncFromServer();
        notify('IAS 16 annual depreciation posted to General Ledger.');
        return;
      }
    }
    setCompanies(prev => prev.map(c => {
      if (c.id !== activeCompany.id) return c;
      const asset = c.fixedAssets.find(a => a.id === assetId);
      if (!asset) return c;
      const charge = calculateAnnualDepreciation(asset);
      if (charge <= 0) return c;
      const newJournal: JournalEntryRecord = {
        id: `jrn-${Date.now()}`,
        reference: `DEP-${asset.assetTag}`,
        date: '2025-12-31',
        description: `IAS 16 Depreciation — ${asset.name}`,
        sourceType: 'DEPRECIATION',
        lines: [{ accountCode: '5400', debit: charge, credit: 0 }, { accountCode: asset.accumAccount, debit: 0, credit: charge }]
      };
      return {
        ...c,
        journals: [newJournal, ...c.journals],
        fixedAssets: c.fixedAssets.map(a => a.id === assetId ? { ...a, accumulatedDep: a.accumulatedDep + charge, lastDepYear: 2025 } : a)
      };
    }));
    notify('IAS 16 annual depreciation posted to General Ledger.');
  }

  async function handlePostJournal(payload: { reference: string; date: string; description: string; lines: Array<{ accountCode: string; debit: number; credit: number }> }) {
    if (user) {
      const res = await fetch(`/api/companies/${activeCompany.id}/journals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await syncFromServer();
        notify('Journal posted to General Ledger.');
        return;
      }
    }
    const newJ: JournalEntryRecord = { ...payload, id: `jrn-${Date.now()}`, sourceType: 'MANUAL' };
    setCompanies(prev => prev.map(c => c.id === activeCompany.id ? { ...c, journals: [newJ, ...c.journals] } : c));
    notify('Journal posted to General Ledger.');
  }

  async function handleReverseJournal(journalId: string) {
    if (user) {
      await fetch(`/api/companies/${activeCompany.id}/journals?journalId=${journalId}`, { method: 'DELETE' });
      await syncFromServer();
    } else {
      setCompanies(prev => prev.map(c => c.id === activeCompany.id ? { ...c, journals: c.journals.filter(j => j.id !== journalId) } : c));
    }
    notify('Journal entry reversed.');
  }

  async function handleApplyBackOnTrack(step: MissionStep) {
    if (!step.backOnTrackJournal) return;
    await handlePostJournal(step.backOnTrackJournal);
    notify(`Back-on-Track applied: ${step.backOnTrackJournal.reference} posted!`);
  }

  async function handleResetCompany() {
    if (user) {
      const res = await fetch(`/api/companies/${activeCompany.id}/reset`, { method: 'POST' });
      if (res.ok) {
        await syncFromServer();
        setReviewedStatementsByCompany(prev => ({ ...prev, [activeCompany.id]: false }));
        notify(`${activeCompany.name} reset to clean pre-close baseline.`);
        return;
      }
    }
    const seedIdx = MULTI_COMPANY_SCENARIOS.findIndex(s => s.slug === activeCompany.slug);
    const seed = MULTI_COMPANY_SCENARIOS[seedIdx >= 0 ? seedIdx : 0];
    setCompanies(prev => prev.map(c => c.id === activeCompany.id ? {
      ...c,
      journals: [],
      invoices: seed.invoices.map((inv, i) => ({ ...inv, id: `inv-reset-${Date.now()}-${i}` })),
      bankTransactions: seed.bankTransactions.map((tx, i) => ({ ...tx, id: `btx-reset-${Date.now()}-${i}` })),
      fixedAssets: seed.fixedAssets.map((fa, i) => ({ ...fa, id: `fa-reset-${Date.now()}-${i}`, lastDepYear: null }))
    } : c));
    setReviewedStatementsByCompany(prev => ({ ...prev, [activeCompany.id]: false }));
    notify(`${activeCompany.name} reset to clean pre-close baseline.`);
  }

  async function handleToggleTopic(code: string, completed: boolean) {
    setCompletedTopics(prev => ({ ...prev, [code]: completed }));
    if (user) {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicCode: code, completed })
      });
    }
  }

  async function handleSubmitExam(answersA: Record<string, number>, answersB: Record<string, string>) {
    // Always graded server-side. The previous fallback graded in the browser,
    // which meant a failed request silently produced a locally-forged score.
    const res = await fetch('/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answersA, answersB })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || 'Could not submit the exam. Please try again.');
    }
    return await res.json();
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setCompanies(buildGuestWorkspaces());
    setActiveCompanyId('guest-1');
    notify('Signed out — switched to Guest Sandbox.');
  }

  const navItems = [
    { id: 'internship', label: 'Internship & Close', icon: Briefcase, badge: `${completedCloseSteps}/6` },
    { id: 'dashboard', label: 'Command Dashboard', icon: LayoutDashboard },
    { id: 'bank-feed', label: 'Bank Feed Match', icon: Landmark },
    { id: 'invoices', label: 'Invoices & Bills', icon: FileText },
    { id: 'assets', label: 'Fixed Assets (IAS 16)', icon: HardDrive },
    { id: 'ledger', label: 'Journals & Ledger', icon: BookOpen },
    { id: 'statements', label: 'IFRS 18 Statements', icon: BarChart3 },
    { id: 'study', label: 'IFRS Study Hub', icon: GraduationCap },
    { id: 'exam', label: 'ACCA FA CBE Exam', icon: ClipboardCheck }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <Menu className="w-5 h-5" />
          </button>
          <BrandLogo />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl px-2.5 py-1.5 border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-brand-700 shrink-0" />
            <select
              value={activeCompany.id}
              onChange={e => setActiveCompanyId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none pr-1"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.industry})</option>
              ))}
            </select>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-xs font-semibold text-slate-700">{user.name}</span>
              <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setAuthOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold">
              <LogIn className="w-3.5 h-3.5" /> Student Login
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className={`${mobileOpen ? 'fixed inset-y-0 left-0 z-40 pt-16' : 'hidden'} lg:flex lg:static w-64 bg-white border-r border-slate-200 flex-col justify-between py-4 print:hidden`}>
          <nav className="space-y-0.5 px-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTab(item.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-colors ${active ? 'bg-brand-50 text-brand-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums ${completedCloseSteps === 6 ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-100 text-brand-800'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="px-4 pt-4 border-t border-slate-100">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              <div className="font-bold text-slate-800 mb-0.5">{user ? 'Cloud Sync Active' : 'Guest Sandbox Mode'}</div>
              {user ? 'Your close progress, ledgers & CBE scores sync to Prisma DB.' : 'Sign in to persist your 3 internship missions & exam history.'}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {toast && (
            <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg print:hidden">
              {toast}
            </div>
          )}

          {activeTab === 'internship' && (
            <InternshipMissionView
              mission={activeMission}
              companyName={activeCompany.name}
              studentName={user ? user.name : 'FA Studio Student'}
              stepStatus={missionStepStatus}
              onNavigate={navigateTab}
              onApplyBackOnTrack={handleApplyBackOnTrack}
              onResetCompany={handleResetCompany}
            />
          )}
          {activeTab === 'dashboard' && (
            <DashboardView
              companyName={activeCompany.name}
              industry={activeCompany.industry}
              description={activeCompany.description}
              statements={statements}
              unmatchedBankCount={activeCompany.bankTransactions.filter(t => t.status === 'UNMATCHED').length}
              openInvoicesCount={activeCompany.invoices.filter(i => i.status === 'OPEN').length}
              onNavigate={navigateTab}
            />
          )}
          {activeTab === 'bank-feed' && (
            <BankFeedView
              bankTransactions={activeCompany.bankTransactions}
              invoices={activeCompany.invoices}
              accounts={activeCompany.accounts}
              onReconcile={handleReconcileBank}
            />
          )}
          {activeTab === 'invoices' && (
            <InvoicesBillsView
              invoices={activeCompany.invoices}
              accounts={activeCompany.accounts}
              onCreateDoc={handleCreateDoc}
            />
          )}
          {activeTab === 'assets' && (
            <FixedAssetsView
              assets={activeCompany.fixedAssets}
              onRunDepreciation={handleRunDepreciation}
            />
          )}
          {activeTab === 'ledger' && (
            <LedgerWorkbenchView
              accounts={activeCompany.accounts}
              ledger={ledger}
              journals={activeCompany.journals}
              onPostJournal={handlePostJournal}
              onReverseJournal={handleReverseJournal}
            />
          )}
          {activeTab === 'statements' && (
            <FinancialStatementsView companyName={activeCompany.name} statements={statements} />
          )}
          {(activeTab === 'study' || activeTab === 'exam') && (
            <StudyExamView
              mode={activeTab}
              completedTopics={completedTopics}
              onToggleTopic={handleToggleTopic}
              onSubmitExam={handleSubmitExam}
            />
          )}
        </main>
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={u => {
          setUser(u);
          syncFromServer();
          notify(`Welcome back, ${u.name}!`);
        }}
      />
    </div>
  );
}
