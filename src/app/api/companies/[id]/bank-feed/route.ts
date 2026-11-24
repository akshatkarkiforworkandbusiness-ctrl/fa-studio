import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const ReconcileSchema = z.object({
  bankTxId: z.string().min(1),
  mode: z.enum(['MATCH_DOC', 'CREATE_TX']),
  docId: z.string().optional(),
  accountCode: z.string().optional()
});

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const company = await prisma.companyScenario.findFirst({ where: { id, userId: user.id } });
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  const body = await req.json();
  const parsed = ReconcileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid bank reconciliation payload.' }, { status: 400 });

  const tx = await prisma.bankTransaction.findFirst({ where: { id: parsed.data.bankTxId, companyId: company.id } });
  if (!tx) return NextResponse.json({ error: 'Bank transaction not found.' }, { status: 404 });

  const absAmt = Math.abs(tx.amount);
  const isInflow = tx.amount > 0;
  let counterAccount = parsed.data.accountCode || (isInflow ? '4100' : '5500');

  if (parsed.data.mode === 'MATCH_DOC' && parsed.data.docId) {
    const doc = await prisma.invoiceOrBill.findFirst({ where: { id: parsed.data.docId, companyId: company.id } });
    if (doc) {
      await prisma.invoiceOrBill.update({ where: { id: doc.id }, data: { status: 'PAID' } });
      counterAccount = doc.type === 'INVOICE' ? '1210' : '2100';
    }
  }

  const lines = isInflow
    ? [{ accountCode: '1200', debit: absAmt, credit: 0 }, { accountCode: counterAccount, debit: 0, credit: absAmt }]
    : [{ accountCode: counterAccount, debit: absAmt, credit: 0 }, { accountCode: '1200', debit: 0, credit: absAmt }];

  const journal = await prisma.journalEntry.create({
    data: {
      companyId: company.id,
      reference: tx.reference,
      date: tx.date,
      description: `Bank Feed Reconciled: ${tx.description}`,
      sourceType: 'BANK_FEED',
      lines: { create: lines }
    },
    include: { lines: true }
  });

  const updatedTx = await prisma.bankTransaction.update({
    where: { id: tx.id },
    data: { status: 'RECONCILED', matchedDocId: parsed.data.docId || null, matchedAccount: counterAccount }
  });

  return NextResponse.json({ bankTransaction: updatedTx, journal });
}
