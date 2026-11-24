'use client';

import React, { useState } from 'react';
import {
  Briefcase, CheckCircle2, Circle, Mail, ArrowRight, RotateCcw,
  ChevronDown, ChevronUp, Award, Printer, Sparkles, BookOpen
} from 'lucide-react';
import type { CompanyInternshipMission, MissionStep } from '@/lib/internship-missions';

interface InternshipMissionViewProps {
  mission: CompanyInternshipMission;
  companyName: string;
  studentName: string;
  stepStatus: Record<string, boolean>;
  onNavigate: (tab: string) => void;
  onApplyBackOnTrack: (step: MissionStep) => Promise<void>;
  onResetCompany: () => Promise<void>;
}

export function InternshipMissionView({
  mission,
  companyName,
  studentName,
  stepStatus,
  onNavigate,
  onApplyBackOnTrack,
  onResetCompany
}: InternshipMissionViewProps) {
  const [expandedModel, setExpandedModel] = useState<Record<string, boolean>>({});
  const [showCert, setShowCert] = useState(false);
  const [busyStep, setBusyStep] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const completedCount = mission.steps.filter(s => stepStatus[s.id]).length;
  const totalSteps = mission.steps.length;
  const pct = Math.round((completedCount / totalSteps) * 100);
  const allDone = completedCount === totalSteps;

  async function handleBackOnTrack(step: MissionStep) {
    setBusyStep(step.id);
    try {
      await onApplyBackOnTrack(step);
    } finally {
      setBusyStep(null);
    }
  }

  async function handleReset() {
    setResetting(true);
    try {
      await onResetCompany();
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + Progress Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200 mb-2">
            <Briefcase className="w-3.5 h-3.5" /> Virtual Internship · Month-End Close Mission
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{mission.roleTitle}</h2>
          <p className="text-sm text-slate-600 mt-1">
            Complete the guided 6-step month-end close for <strong>{companyName}</strong>. Every workplace task maps directly to an ACCA FA (2025–2026) syllabus topic.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCert(!showCert)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${allDone ? 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800' : 'bg-white text-slate-700 border-slate-200 hover:border-brand-500'}`}
          >
            <Award className="w-4 h-4" />
            <span>{allDone ? 'View Completion Certificate' : 'Preview Certificate'}</span>
          </button>
          <button
            type="button"
            disabled={resetting}
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-rose-700 hover:border-rose-300 transition-colors disabled:opacity-60"
            title="Reset this company back to initial pre-close balances"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetting ? 'Resetting...' : 'Back-on-Track Reset'}</span>
          </button>
        </div>
      </div>

      {/* Close Progress Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900">Month-End Close Readiness</span>
          <span className="font-bold text-brand-700 tabular-nums">{completedCount} / {totalSteps} Steps Verified ({pct}%)</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-600 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {mission.competencies.map(comp => (
            <span key={comp} className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {comp}
            </span>
          ))}
        </div>
      </div>

      {/* Manager Briefing Email Card (Forage-style) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-brand-200" />
            </div>
            <div>
              <div className="text-xs font-bold">{mission.emailSubject}</div>
              <div className="text-[11px] text-slate-300">
                From: {mission.managerName} ({mission.managerTitle})
              </div>
            </div>
          </div>
          <span className="text-[11px] text-slate-300">{mission.emailDate}</span>
        </div>
        <div className="p-5 text-sm text-slate-700 space-y-2.5 leading-relaxed bg-slate-50/40">
          {mission.briefingParagraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </div>

      {/* Printable Certificate Preview / Unlocked View */}
      {showCert && (
        <div className="bg-white rounded-2xl border-2 border-brand-700 p-8 shadow-md space-y-6 print:border-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <img src="/brand/fa-studio-mark.svg" alt="FA Studio" className="w-10 h-10" />
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-brand-700">FA Studio Virtual Internship</div>
                <h3 className="text-xl font-extrabold text-slate-900">Certificate of Practical Completion</h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold print:hidden"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
          </div>

          <div className="text-center py-4 space-y-2">
            <p className="text-xs uppercase tracking-widest text-slate-500">This certifies that</p>
            <p className="text-2xl font-extrabold text-slate-900">{studentName}</p>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              has completed the <strong>{companyName}</strong> Year-End Close Virtual Internship ({completedCount}/{totalSteps} verified steps), applying double-entry bookkeeping and IFRS standards aligned with the ACCA Financial Accounting (2025–2026) syllabus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs pt-4 border-t border-slate-200">
            <div>
              <div className="font-bold text-slate-900">{mission.managerName}</div>
              <div className="text-slate-500">Reviewing Controller</div>
            </div>
            <div>
              <div className="font-bold text-slate-900">{allDone ? 'Verified Complete' : `In Progress (${pct}%)`}</div>
              <div className="text-slate-500">Audit Status</div>
            </div>
            <div>
              <div className="font-bold text-slate-900">FA Studio Cloud</div>
              <div className="text-slate-500">IFRS 18 &amp; ACCA FA Aligned</div>
            </div>
          </div>
        </div>
      )}

      {/* 6-Step Guided Month-End Close Checklist */}
      <div className="space-y-3">
        {mission.steps.map(step => {
          const done = !!stepStatus[step.id];
          const isOpen = !!expandedModel[step.id];

          return (
            <div
              key={step.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-colors ${done ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'}`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Step {step.order}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200">
                        {step.accaChapter}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {step.ifrsRef}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.workplaceTask}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 md:pl-4">
                  <button
                    type="button"
                    onClick={() => setExpandedModel(p => ({ ...p, [step.id]: !p[step.id] }))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-brand-700" />
                    <span>Model Answer</span>
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {!done && step.backOnTrackJournal && (
                    <button
                      type="button"
                      disabled={busyStep === step.id}
                      onClick={() => handleBackOnTrack(step)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-xs font-semibold disabled:opacity-60"
                      title="Perdisco-style Back-on-Track helper: automatically posts the verified model journal for this step"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{busyStep === step.id ? 'Applying...' : 'Back-on-Track'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onNavigate(step.targetTab)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs ${done ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100' : 'bg-brand-700 text-white hover:bg-brand-800'}`}
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950">
                    <div className="font-bold mb-1">Controller&apos;s Model Answer</div>
                    <p className="leading-relaxed">{step.modelAnswer}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950">
                    <div className="font-bold mb-1">ACCA FA Exam Connection</div>
                    <p className="leading-relaxed">{step.examConnection}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
