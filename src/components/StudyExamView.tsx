'use client';

import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, Award } from 'lucide-react';
import { IFRS_STANDARDS, ACCA_EXAM_SECTION_A, ACCA_EXAM_SECTION_B } from '@/lib/curriculum';

interface StudyExamViewProps {
  mode: 'study' | 'exam';
  completedTopics: Record<string, boolean>;
  onToggleTopic: (code: string, completed: boolean) => Promise<void>;
  onSubmitExam: (answersA: Record<string, number>, answersB: Record<string, string>) => Promise<{ sectionAScore: number; sectionBScore: number; totalScore: number; maxScore: number; passed: boolean }>;
}

export function StudyExamView({ mode, completedTopics, onToggleTopic, onSubmitExam }: StudyExamViewProps) {
  const [answersA, setAnswersA] = useState<Record<string, number>>({});
  const [answersB, setAnswersB] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ sectionAScore: number; sectionBScore: number; totalScore: number; maxScore: number; passed: boolean } | null>(null);
  const [examSec, setExamSec] = useState<'A' | 'B'>('A');

  if (mode === 'study') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">IFRS Standards &amp; ACCA FA (2025–2026) Study Hub</h2>
            <p className="text-sm text-slate-600 mt-1">Track your syllabus mastery and jump straight to official IFRS Foundation and ACCA Global documentation.</p>
          </div>
          <div className="flex gap-2">
            <a href="https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/studyguides/FA%20FFA%20S25-A26%20syllabus%20and%20study%20guide%20-%20final.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-brand-500">
              ACCA FA 2025–26 Syllabus <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a href="https://www.accaglobal.com/gb/en/student/practical-experience-per.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-brand-500">
              ACCA PER (36 Mos) <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {IFRS_STANDARDS.map(s => {
            const done = !!completedTopics[s.code];
            return (
              <div key={s.code} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-brand-700 text-white">{s.code}</span>
                    <button
                      type="button"
                      onClick={() => onToggleTopic(s.code, !done)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${done ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-500'}`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {done ? 'Mastered' : 'Mark Studied'}
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.summary}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950"><strong>Practice:</strong> {s.practicalTip}</div>
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950"><strong>Exam Tip:</strong> {s.examTip}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-3 text-xs">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline inline-flex items-center gap-1">
                    IFRS Official Page <ExternalLink className="w-3 h-3" />
                  </a>
                  {s.extraUrl && (
                    <a href={s.extraUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline inline-flex items-center gap-1">
                      {s.extraLabel} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  async function grade() {
    const res = await onSubmitExam(answersA, answersB);
    setResult(res);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">ACCA FA CBE Exam Simulator</h2>
          <p className="text-sm text-slate-600 mt-1">Section A (10 × 2-mark OTQs) + Section B (15-mark Meridian Group Consolidation MTQ). Pass mark: 50%.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
            <button type="button" onClick={() => setExamSec('A')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${examSec === 'A' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Section A (20m)</button>
            <button type="button" onClick={() => setExamSec('B')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${examSec === 'B' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Section B MTQ (15m)</button>
          </div>
          <button type="button" onClick={grade} className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold shadow-xs">
            Submit &amp; Grade
          </button>
        </div>
      </div>

      {result && (
        <div className={`p-5 rounded-2xl border flex items-center justify-between ${result.passed ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6" />
            <div>
              <h3 className="text-sm font-bold">{result.passed ? 'PASS — ACCA FA Benchmark Achieved!' : 'Below 50% Pass Mark'}</h3>
              <p className="text-xs">Total: {result.totalScore}/{result.maxScore} ({Math.round((result.totalScore / result.maxScore) * 100)}%) · Sec A: {result.sectionAScore}/20 · Sec B: {result.sectionBScore}/15</p>
            </div>
          </div>
          <button type="button" onClick={() => { setResult(null); setAnswersA({}); setAnswersB({}); }} className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800">Retake</button>
        </div>
      )}

      {examSec === 'A' ? (
        <div className="space-y-4">
          {ACCA_EXAM_SECTION_A.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="text-xs font-bold text-brand-700">Q{idx + 1} · {q.topic} (2 Marks)</div>
              <p className="text-sm font-medium text-slate-900">{q.q}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => {
                  const chosen = answersA[q.id] === oIdx;
                  let cls = chosen ? 'border-brand-700 bg-brand-50 text-brand-900 font-semibold' : 'border-slate-200 hover:border-brand-500';
                  if (result) {
                    if (oIdx === q.answer) cls = 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold';
                    else if (chosen) cls = 'border-rose-500 bg-rose-50 text-rose-900';
                  }
                  return (
                    <button key={oIdx} type="button" onClick={() => !result && setAnswersA(p => ({ ...p, [q.id]: oIdx }))} className={`text-left px-3.5 py-2.5 rounded-xl border text-xs ${cls}`}>
                      <strong className="mr-1.5">{String.fromCharCode(65 + oIdx)}.</strong>{opt}
                    </button>
                  );
                })}
              </div>
              {result && <div className="p-2.5 rounded-xl bg-slate-50 text-xs text-slate-700"><strong>Working:</strong> {q.explanation}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Meridian Group — Consolidated SOFP (15 Marks)</h3>
          <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
            On 1 Jan 2025, Apex Co acquired 80% of Nova Co for $420,000. At acquisition, Nova Co had Share Capital $200,000, Retained Earnings $150,000, Land FV uplift $50,000, and NCI FV $95,000. During 2025, Nova earned $80,000 profit (Apex individual closing RE $310,000). Apex sold goods to Nova for $40,000 at 25% markup on cost (50% unsold at year-end). Year-end Receivables: Apex $90,000, Nova $60,000 (includes $15,000 intra-group).
          </p>
          <div className="space-y-3">
            {ACCA_EXAM_SECTION_B.map(t => (
              <div key={t.id} className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-900">{t.label}</label>
                  <input
                    type="number"
                    value={answersB[t.id] || ''}
                    onChange={e => setAnswersB(p => ({ ...p, [t.id]: e.target.value }))}
                    placeholder="Amount ($)"
                    className="w-36 px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-right tabular-nums"
                  />
                </div>
                {result && <div className="text-xs text-slate-700"><strong>Expected ${t.expected.toLocaleString()}:</strong> {t.working}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
