import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  ACCA_EXAM_SECTION_A,
  ACCA_EXAM_SECTION_B,
  EXAM_MAX_SCORE,
  EXAM_PASS_MARK
} from '@/lib/exam-bank';
import { clientIp, rateLimit, rateLimitResponse } from '@/lib/rate-limit';

const ExamSchema = z.object({
  answersA: z.record(z.number().int().min(0).max(10)),
  answersB: z.record(z.union([z.number(), z.string()]))
});

// 20 submissions per hour per IP — allows a retake, blocks answer farming.
const SUBMIT_LIMIT = 20;
const SUBMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ExamSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid exam submission.' }, { status: 400 });

  const limited = rateLimit(`exam:${clientIp(req)}`, SUBMIT_LIMIT, SUBMIT_WINDOW_MS);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  // Grade against the server-side bank. The browser only ever received the
  // stripped copy, so a client cannot alter `answer` or `expected`.
  let sectionAScore = 0;
  for (const q of ACCA_EXAM_SECTION_A) {
    if (parsed.data.answersA[q.id] === q.answer) sectionAScore += 2;
  }

  let sectionBScore = 0;
  for (const t of ACCA_EXAM_SECTION_B) {
    const raw = parsed.data.answersB[t.id];
    if (raw === undefined || raw === null || raw === '') continue;
    const value = Number(raw);
    if (Number.isFinite(value) && Math.round(value) === t.expected) sectionBScore += t.marks;
  }

  const totalScore = sectionAScore + sectionBScore;
  const maxScore = EXAM_MAX_SCORE;
  const passed = totalScore / maxScore >= EXAM_PASS_MARK;

  const user = await getCurrentUser();
  let attempt = null;
  if (user) {
    attempt = await prisma.examAttempt.create({
      data: {
        userId: user.id,
        sectionAScore,
        sectionBScore,
        totalScore,
        maxScore,
        passed,
        answersJson: JSON.stringify(parsed.data)
      }
    });
  }

  // Return the worked solutions only now that grading is done.
  const solutions = {
    sectionA: ACCA_EXAM_SECTION_A.map(q => ({ id: q.id, answer: q.answer, explanation: q.explanation })),
    sectionB: ACCA_EXAM_SECTION_B.map(t => ({ id: t.id, expected: t.expected, working: t.working }))
  };

  return NextResponse.json({ sectionAScore, sectionBScore, totalScore, maxScore, passed, attempt, solutions });
}
