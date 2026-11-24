import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ACCT } from '@/lib/account-codes';
import {
  accountCodeSet,
  amountsMatch,
  assertAccountCodes,
  assertControlAccounts,
  guard,
  loadOwnedCompany,
  RuleError,
  toNum
} from '@/lib/company-rules';
import { serialize } from '@/lib/serialize';

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

  const result = await guard(async () => {
    const company = await loadOwnedCompany(user.id, id);
    if (!company) throw new RuleError(404, 'Company not found');

    const body = await req.json();
    const parsed = ReconcileSchema.safeParse(body);
    if (!parsed.success) throw new RuleError(400, 'Invalid bank reconciliation payload.');

    const available = accountCodeSet(company.accounts);
    assertControlAccounts(available);

    const tx = await prisma.bankTransaction.findFirst({
      where: { id: parsed.data.bankTxId, companyId: company.id }
    });
    if (!tx) throw new RuleError(404, 'Bank transaction not found.');
    if (tx.status === 'RECONCILED') throw new RuleError(409, 'This bank line is already reconciled.');

    const txAmount = toNum(tx.amount);
    const absAmt = Math.abs(txAmount);
    const isInflow = txAmount > 0;
    let counterAccount = parsed.data.accountCode || (isInflow ? ACCT.DEFAULT_INCOME : ACCT.BANK_CHARGES);

    if (parsed.data.mode === 'MATCH_DOC') {
      if (!parsed.data.docId) throw new RuleError(400, 'Matching requires a document id.');

      const doc = await prisma.invoiceOrBill.findFirst({
        where: { id: parsed.data.docId, companyId: company.id }
      });
      if (!doc) throw new RuleError(404, 'Invoice or bill not found.');
      if (doc.status === 'PAID') throw new RuleError(409, `${doc.number} is already settled.`);

      // The document must settle the bank line. Matching a $7,200 receipt
      // against a $4,500 bill used to be accepted, which both overstated cash
      // and marked the wrong document paid.
      const docIsInflow = doc.type === 'INVOICE';
      if (docIsInflow !== isInflow) {
        throw new RuleError(
          400,
          `Cannot match a ${isInflow ? 'bank receipt' : 'bank payment'} to a ` +
            `${doc.type === 'INVOICE' ? 'sales invoice (money in)' : 'supplier bill (money out)'}.`
        );
      }
      const docTotal = toNum(doc.totalAmount);
      if (!amountsMatch(txAmount, docTotal)) {
        throw new RuleError(
          400,
          `Amount mismatch: bank line is $${absAmt.toFixed(2)} but ${doc.number} is ` +
            `$${docTotal.toFixed(2)}. Post this line with a manual account code instead.`
        );
      }

      counterAccount = doc.type === 'INVOICE' ? ACCT.RECEIVABLES : ACCT.PAYABLES;
      await prisma.invoiceOrBill.update({ where: { id: doc.id }, data: { status: 'PAID' } });
    } else {
      // Direct coding: the chosen account must belong to this company.
      assertAccountCodes([counterAccount], available);
      if (counterAccount === ACCT.CASH) {
        throw new RuleError(400, 'Cannot code a bank line against Cash at Bank itself.');
      }
    }

    const lines = isInflow
      ? [{ accountCode: ACCT.CASH, debit: absAmt, credit: 0 }, { accountCode: counterAccount, debit: 0, credit: absAmt }]
      : [{ accountCode: counterAccount, debit: absAmt, credit: 0 }, { accountCode: ACCT.CASH, debit: 0, credit: absAmt }];

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

    return { bankTransaction: updatedTx, journal };
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(serialize(result.value));
}
