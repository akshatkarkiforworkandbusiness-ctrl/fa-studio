import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { MULTI_COMPANY_SCENARIOS } from '@/lib/scenarios';

export async function POST(_req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  const company = await prisma.companyScenario.findFirst({ where: { id, userId: user.id } });
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  const seed = MULTI_COMPANY_SCENARIOS.find(s => s.slug === company.slug);
  if (!seed) return NextResponse.json({ error: 'Scenario template not found' }, { status: 404 });

  await prisma.$transaction([
    prisma.journalEntry.deleteMany({ where: { companyId: company.id } }),
    prisma.invoiceOrBill.deleteMany({ where: { companyId: company.id } }),
    prisma.bankTransaction.deleteMany({ where: { companyId: company.id } }),
    prisma.fixedAsset.deleteMany({ where: { companyId: company.id } }),
    prisma.companyScenario.update({
      where: { id: company.id },
      data: {
        invoices: { create: seed.invoices },
        bankTransactions: { create: seed.bankTransactions },
        fixedAssets: { create: seed.fixedAssets }
      }
    })
  ]);

  return NextResponse.json({ ok: true });
}
