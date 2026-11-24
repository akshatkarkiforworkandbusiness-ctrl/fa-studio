import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateAnnualDepreciation } from '@/lib/accounting-engine';

const DepSchema = z.object({ assetId: z.string().min(1), fiscalYear: z.number().int().default(2025) });

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const company = await prisma.companyScenario.findFirst({ where: { id, userId: user.id } });
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  const body = await req.json();
  const parsed = DepSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid depreciation request.' }, { status: 400 });

  const asset = await prisma.fixedAsset.findFirst({ where: { id: parsed.data.assetId, companyId: company.id } });
  if (!asset) return NextResponse.json({ error: 'Fixed asset not found.' }, { status: 404 });

  const charge = calculateAnnualDepreciation({
    cost: asset.cost,
    residualValue: asset.residualValue,
    usefulLifeYrs: asset.usefulLifeYrs,
    method: asset.method as 'STRAIGHT_LINE' | 'REDUCING_BALANCE',
    ratePercent: asset.ratePercent,
    accumulatedDep: asset.accumulatedDep
  });

  if (charge <= 0) {
    return NextResponse.json({ error: 'Asset is already fully depreciated to residual value.' }, { status: 400 });
  }

  const updatedAsset = await prisma.fixedAsset.update({
    where: { id: asset.id },
    data: { accumulatedDep: asset.accumulatedDep + charge, lastDepYear: parsed.data.fiscalYear }
  });

  const journal = await prisma.journalEntry.create({
    data: {
      companyId: company.id,
      reference: `DEP-${asset.assetTag}`,
      date: `${parsed.data.fiscalYear}-12-31`,
      description: `IAS 16 Annual Depreciation — ${asset.name} (${asset.method})`,
      sourceType: 'DEPRECIATION',
      lines: {
        create: [
          { accountCode: '5400', debit: charge, credit: 0 },
          { accountCode: asset.accumAccount, debit: 0, credit: charge }
        ]
      }
    },
    include: { lines: true }
  });

  return NextResponse.json({ asset: updatedAsset, journal, charge });
}
