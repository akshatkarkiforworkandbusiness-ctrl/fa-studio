import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { validateJournalBalance } from '@/lib/accounting-engine';
import {
  accountCodeSet,
  assertAccountCodes,
  assertControlAccounts,
  guard,
  loadOwnedCompany,
  RuleError
} from '@/lib/company-rules';
import { serialize } from '@/lib/serialize';

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

  const result = await guard(async () => {
    const company = await loadOwnedCompany(user.id, id);
    if (!company) throw new RuleError(404, 'Company not found');

    const body = await req.json();
    const parsed = JournalSchema.safeParse(body);
    if (!parsed.success) throw new RuleError(400, 'Invalid journal payload.');

    const check = validateJournalBalance(parsed.data.lines);
    if (!check.valid) throw new RuleError(400, check.error ?? 'Journal does not balance.');

    // Every referenced account must exist in THIS company's chart of accounts.
    // Without this, computeGeneralLedger silently drops the unknown line and
    // the trial balance ends up out of balance with no error raised.
    const available = accountCodeSet(company.accounts);
    assertAccountCodes(parsed.data.lines.map(l => l.accountCode), available);

    // The source account codes that automatic postings rely on must exist too,
    // otherwise a later invoice/bank/depreciation posting would half-succeed.
    if (parsed.data.sourceType !== 'MANUAL') assertControlAccounts(available);

    return prisma.journalEntry.create({
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
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(serialize({ journal: result.value }), { status: 201 });
}
