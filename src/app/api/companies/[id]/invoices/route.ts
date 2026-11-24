import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const InvoiceSchema = z.object({
  type: z.enum(['INVOICE', 'BILL']),
  number: z.string().min(1),
  counterparty: z.string().min(1),
  issueDate: z.string(),
  dueDate: z.string(),
  netAmount: z.number().positive(),
  taxRate: z.number().min(0).max(50),
  accountCode: z.string().min(1)
});

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const company = await prisma.companyScenario.findFirst({ where: { id, userId: user.id } });
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  const body = await req.json();
  const parsed = InvoiceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid invoice/bill data.' }, { status: 400 });

  const { type, number, counterparty, issueDate, dueDate, netAmount, taxRate, accountCode } = parsed.data;
  const taxAmount = Math.round(netAmount * (taxRate / 100) * 100) / 100;
  const totalAmount = Math.round((netAmount + taxAmount) * 100) / 100;

  const doc = await prisma.invoiceOrBill.create({
    data: { companyId: company.id, type, number, counterparty, issueDate, dueDate, netAmount, taxRate, taxAmount, totalAmount, accountCode, status: 'OPEN' }
  });

  // Auto-post double-entry journal to General Ledger
  const lines = type === 'INVOICE'
    ? [
        { accountCode: '1210', debit: totalAmount, credit: 0 },
        { accountCode, debit: 0, credit: netAmount },
        ...(taxAmount > 0 ? [{ accountCode: '2110', debit: 0, credit: taxAmount }] : [])
      ]
    : [
        { accountCode, debit: netAmount, credit: 0 },
        ...(taxAmount > 0 ? [{ accountCode: '2110', debit: taxAmount, credit: 0 }] : []),
        { accountCode: '2100', debit: 0, credit: totalAmount }
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

  return NextResponse.json({ invoice: doc, journal }, { status: 201 });
}
