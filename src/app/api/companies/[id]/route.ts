import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  const company = await prisma.companyScenario.findFirst({
    where: { id, userId: user.id },
    include: {
      accounts: { orderBy: { code: 'asc' } },
      journals: { include: { lines: true }, orderBy: { createdAt: 'desc' } },
      invoices: { orderBy: { createdAt: 'desc' } },
      bankTransactions: { orderBy: { date: 'desc' } },
      fixedAssets: { orderBy: { assetTag: 'asc' } }
    }
  });
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  return NextResponse.json({ company });
}
