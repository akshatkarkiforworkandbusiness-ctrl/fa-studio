import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateAnnualDepreciation } from '@/lib/accounting-engine';
import { ACCT } from '@/lib/account-codes';
import { guard, loadOwnedCompany, round2, RuleError, toNum } from '@/lib/company-rules';
import { serialize } from '@/lib/serialize';

const DepSchema = z.object({
  assetId: z.string().min(1),
  fiscalYear: z.number().int().min(2000).max(2100).default(2025)
});

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  const result = await guard(async () => {
    const company = await loadOwnedCompany(user.id, id);
    if (!company) throw new RuleError(404, 'Company not found');

    const body = await req.json();
    const parsed = DepSchema.safeParse(body);
    if (!parsed.success) throw new RuleError(400, 'Invalid depreciation request.');

    const asset = await prisma.fixedAsset.findFirst({
      where: { id: parsed.data.assetId, companyId: company.id }
    });
    if (!asset) throw new RuleError(404, 'Fixed asset not found.');

    // Idempotency guard. The UI disables the button once `lastDepYear` is set,
    // but the API must enforce it too — otherwise a repeat POST silently
    // double-charges depreciation and overstates accumulated depreciation.
    if (asset.lastDepYear === parsed.data.fiscalYear) {
      throw new RuleError(
        409,
        `Depreciation for ${parsed.data.fiscalYear} has already been posted for ${asset.assetTag}.`
      );
    }
    if (asset.lastDepYear !== null && asset.lastDepYear > parsed.data.fiscalYear) {
      throw new RuleError(
        409,
        `${asset.assetTag} is already depreciated through ${asset.lastDepYear}; ` +
          `cannot post an earlier year (${parsed.data.fiscalYear}).`
      );
    }

    const charge = calculateAnnualDepreciation({
      cost: toNum(asset.cost),
      residualValue: toNum(asset.residualValue),
      usefulLifeYrs: asset.usefulLifeYrs,
      method: asset.method as 'STRAIGHT_LINE' | 'REDUCING_BALANCE',
      ratePercent: asset.ratePercent,
      accumulatedDep: toNum(asset.accumulatedDep)
    });

    if (charge <= 0) {
      throw new RuleError(400, 'Asset is already fully depreciated to residual value.');
    }

    const updatedAsset = await prisma.fixedAsset.update({
      where: { id: asset.id },
      data: {
        accumulatedDep: round2(toNum(asset.accumulatedDep) + charge),
        lastDepYear: parsed.data.fiscalYear
      }
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
            { accountCode: ACCT.DEPRECIATION_EXPENSE, debit: charge, credit: 0 },
            { accountCode: asset.accumAccount, debit: 0, credit: charge }
          ]
        }
      },
      include: { lines: true }
    });

    return { asset: updatedAsset, journal, charge };
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(serialize(result.value));
}
