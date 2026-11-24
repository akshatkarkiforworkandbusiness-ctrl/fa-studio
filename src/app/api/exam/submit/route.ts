import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ACCA_EXAM_SECTION_A, ACCA_EXAM_SECTION_B } from '@/lib/curriculum';

const ExamSchema = z.object({
  answersA: z.record(z.number()),
  answersB: z.record(z.union([z.number(), z.string()]))
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ExamSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid exam submission.' }, { status: 400 });

  let sectionAScore = 0;
  for (const q of ACCA_EXAM_SECTION_A) {
    if (parsed.data.answersA[q.id] === q.answer) sectionAScore += 2;
  }
  let sectionBScore = 0;
  for (const t of ACCA_EXAM_SECTION_B) {
    if (Math.round(Number(parsed.data.answersB[t.id])) === t.expected) sectionBScore += t.marks;
  }
  const totalScore = sectionAScore + sectionBScore;
  const maxScore = 35;
  const passed = totalScore / maxScore >= 0.5;

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

  return NextResponse.json({ sectionAScore, sectionBScore, totalScore, maxScore, passed, attempt });
}
