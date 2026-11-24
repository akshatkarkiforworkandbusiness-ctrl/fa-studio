import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { serialize } from '@/lib/serialize';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companies = await prisma.companyScenario.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    include: {
      accounts: { orderBy: { code: 'asc' } },
      journals: { include: { lines: true }, orderBy: { createdAt: 'desc' } },
      invoices: { orderBy: { createdAt: 'desc' } },
      bankTransactions: { orderBy: { date: 'desc' } },
      fixedAssets: { orderBy: { assetTag: 'asc' } }
    }
  });
  return NextResponse.json(serialize({ companies }));
}
