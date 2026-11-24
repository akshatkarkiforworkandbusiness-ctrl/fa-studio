import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ACCT } from '@/lib/account-codes';
import {
  accountCodeSet,
  assertAccountCodes,
  assertControlAccounts,
  guard,
  loadOwnedCompany,
  RuleError,
  round2
} from '@/lib/company-rules';
import { serialize } from '@/lib/serialize';

const InvoiceSchema = z.object({
  type: z.enum(['INVOICE', 'BILL']),
  number: z.string().min(1).max(40),
  counterparty: z.string().min(1).max(120),
  issueDate: z.string().min(8).max(20),
  dueDate: z.string().min(8).max(20),
  netAmount: z.number().positive().max(1_000_000_000),
  taxRate: z.number().min(0).max(50),
  accountCode: z.string().min(1)
});

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  const result = await guard(async () => {
    const company = await loadOwnedCompany(user.id, id);
    if (!company) throw new RuleError(404, 'Company not found');

    const body = await req.json();
    const parsed = InvoiceSchema.safeParse(body);
    if (!parsed.success) throw new RuleError(400, 'Invalid invoice/bill data.');

    const { type, number, counterparty, issueDate, dueDate, netAmount, taxRate, accountCode } = parsed.data;

    const available = accountCodeSet(company.accounts);
    // The revenue/expense account the user picked, plus the control accounts
    // this posting writes to, must all exist — otherwise the journal would be
    // created with lines that computeGeneralLedger later drops on the floor.
    assertControlAccounts(available);
    assertAccountCodes(
      [accountCode, ACCT.RECEIVABLES, ACCT.PAYABLES, ACCT.SALES_TAX],
      available,
      'ledger'
    );

    const expectedCategory = type === 'INVOICE' ? 'Income' : 'Expense';
    const chosen = await prisma.ledgerAccount.findFirst({
      where: { companyId: company.id, code: accountCode }
    });
    if (chosen && chosen.category !== expectedCategory) {
      throw new RuleError(
        400,
        `${type === 'INVOICE' ? 'Sales invoices' : 'Supplier bills'} must post to an ` +
          `${expectedCategory} account — ${accountCode} is a ${chosen.category} account.`
      );
    }

    const taxAmount = round2(netAmount * (taxRate / 100));
    const totalAmount = round2(netAmount + taxAmount);

    const doc = await prisma.invoiceOrBill.create({
      data: {
        companyId: company.id,
        type,
        number,
        counterparty,
        issueDate,
        dueDate,
        netAmount,
        taxRate,
        taxAmount,
        totalAmount,
        accountCode,
        status: 'OPEN'
      }
    });

    // Auto-post double-entry journal to General Ledger
    const lines = type === 'INVOICE'
      ? [
          { accountCode: ACCT.RECEIVABLES, debit: totalAmount, credit: 0 },
          { accountCode, debit: 0, credit: netAmount },
          ...(taxAmount > 0 ? [{ accountCode: ACCT.SALES_TAX, debit: 0, credit: taxAmount }] : [])
        ]
      : [
          { accountCode, debit: netAmount, credit: 0 },
          ...(taxAmount > 0 ? [{ accountCode: ACCT.SALES_TAX, debit: taxAmount, credit: 0 }] : []),
          { accountCode: ACCT.PAYABLES, debit: 0, credit: totalAmount }
        ];

    const journal = await prisma.journalEntry.create({
      data: {
        companyId: company.id,
        reference: number,
        date: issueDate,
        description: `${type === 'INVOICE' ? 'Sales Invoice' : 'Supplier Bill'} — ${counterparty}`,
        sourceType: type,
        lines: { create: lines }
      },
      include: { lines: true }
    });

    return { invoice: doc, journal };
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(serialize(result.value), { status: 201 });
}
