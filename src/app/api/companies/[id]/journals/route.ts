import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { validateJournalBalance } from '@/lib/accounting-engine';

const JournalSchema = z.object({
  reference: z.string().min(1).max(40),
  date: z.string().min(8).max(20),
  description: z.string().min(1).max(240),
  sourceType: z.string().optional().default('MANUAL'),
  lines: z.array(z.object({
    accountCode: z.string().min(1),
    debit: z.number().min(0),
    credit: z.number().min(0)
  })).min(2)
});

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  const company = await prisma.companyScenario.findFirst({ where: { id, userId: user.id } });
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  const body = await req.json();
  const parsed = JournalSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid journal payload.' }, { status: 400 });

  const check = validateJournalBalance(parsed.data.lines);
  if (!check.valid) return NextResponse.json({ error: check.error }, { status: 400 });

  const entry = await prisma.journalEntry.create({
    data: {
      companyId: company.id,
      reference: parsed.data.reference,
      date: parsed.data.date,
      description: parsed.data.description,
      sourceType: parsed.data.sourceType,
      lines: { create: parsed.data.lines }
    },
    include: { lines: true }
  });
  return NextResponse.json({ journal: entry }, { status: 201 });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const { searchParams } = new URL(req.url);
  const journalId = searchParams.get('journalId');
  if (!journalId) return NextResponse.json({ error: 'Missing journalId' }, { status: 400 });

  const company = await prisma.companyScenario.findFirst({ where: { id, userId: user.id } });
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  await prisma.journalEntry.deleteMany({ where: { id: journalId, companyId: company.id } });
  return NextResponse.json({ ok: true });
}
