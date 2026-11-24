import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ progress: [], attempts: [] });
  const [progress, attempts] = await Promise.all([
    prisma.studyProgress.findMany({ where: { userId: user.id } }),
    prisma.examAttempt.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 10 })
  ]);
  return NextResponse.json({ progress, attempts });
}

const ProgressSchema = z.object({ topicCode: z.string().min(1), completed: z.boolean() });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const parsed = ProgressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });

  const item = await prisma.studyProgress.upsert({
    where: { userId_topicCode: { userId: user.id, topicCode: parsed.data.topicCode } },
    update: { completed: parsed.data.completed },
    create: { userId: user.id, topicCode: parsed.data.topicCode, completed: parsed.data.completed }
  });
  return NextResponse.json({ progress: item });
}
