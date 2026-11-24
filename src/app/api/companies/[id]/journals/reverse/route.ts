import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ACCT } from '@/lib/account-codes';
import { guard, loadOwnedCompany, round2, RuleError, toNum } from '@/lib/company-rules';
import { serialize } from '@/lib/serialize';

const ReverseSchema = z.object({ journalId: z.string().min(1) });

/**
 * Cancel a journal entry by posting the contra.
 *
 * The previous implementation DELETEd the row, which silently punched a hole
 * in the audit trail — and left the invoice, bank line or asset register it
 * had created pointing at a posting that no longer existed. Reversing keeps
 * the original, adds an equal-and-opposite entry, and rolls back whatever the
 * original did to its linked record.
 */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  const result = await guard(async () => {
    const company = await loadOwnedCompany(user.id, id);
    if (!company) throw new RuleError(404, 'Company not found');

    const body = await req.json();
    const parsed = ReverseSchema.safeParse(body);
    if (!parsed.success) throw new RuleError(400, 'Missing journalId.');

    return prisma.$transaction(async tx => {
      const original = await tx.journalEntry.findFirst({
        where: { id: parsed.data.journalId, companyId: company.id },
        include: { lines: true }
      });
      if (!original) throw new RuleError(404, 'Journal entry not found');
      if (original.reversalOf) {
        throw new RuleError(409, 'This entry is already a reversal — post a new journal instead.');
      }
      if (original.reversedBy) {
        throw new RuleError(409, 'This entry has already been reversed.');
      }

      // Swap every debit and credit: the contra nets the original to zero
      // while both remain visible in the ledger.
      const contraLines = original.lines.map(l => ({
        accountCode: l.accountCode,
        debit: toNum(l.credit),
        credit: toNum(l.debit)
      }));

      const reversal = await tx.journalEntry.create({
        data: {
          companyId: company.id,
          reference: `REV-${original.reference}`.slice(0, 40),
          date: original.date,
          description: `Reversal of ${original.reference} — ${original.description}`,
          sourceType: 'REVERSAL',
          reversalOf: original.id,
          lines: { create: contraLines }
        },
        include: { lines: true }
      });

      await tx.journalEntry.update({
        where: { id: original.id },
        data: { reversedBy: reversal.id }
      });

      await restoreLinkedRecord(tx, company.id, original);

      return {
        original: { ...original, reversedBy: reversal.id },
        reversal
      };
    });
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(serialize(result.value));
}

type Tx = Prisma.TransactionClient;

/**
 * Undo the side effect the original posting had outside the general ledger:
 * a settled invoice goes back to OPEN, a reconciled bank line back to
 * UNMATCHED, and accumulated depreciation is written back down.
 */
async function restoreLinkedRecord(
  tx: Tx,
  companyId: string,
  original: { sourceType: string; reference: string; date: string; id: string; lines: Array<{ accountCode: string; debit: unknown }> }
) {
  switch (original.sourceType) {
    case 'INVOICE':
    case 'BILL': {
      const doc = await tx.invoiceOrBill.findFirst({
        where: { companyId, number: original.reference, status: 'PAID' }
      });
      if (doc) {
        await tx.invoiceOrBill.update({ where: { id: doc.id }, data: { status: 'OPEN' } });
      }
      break;
    }

    case 'BANK_FEED': {
      const bankTx = await tx.bankTransaction.findFirst({
        where: { companyId, reference: original.reference, status: 'RECONCILED' }
      });
      if (bankTx) {
        await tx.bankTransaction.update({
          where: { id: bankTx.id },
          data: { status: 'UNMATCHED', matchedDocId: null, matchedAccount: null }
        });
      }
      break;
    }

    case 'DEPRECIATION': {
      const tag = original.reference.startsWith('DEP-')
        ? original.reference.slice(4)
        : original.reference;
      const asset = await tx.fixedAsset.findFirst({ where: { companyId, assetTag: tag } });
      if (!asset) break;

      const charge = original.lines
        .filter(l => l.accountCode === ACCT.DEPRECIATION_EXPENSE)
        .reduce((sum, l) => sum + toNum(l.debit), 0);

      // Restore the previous depreciation year (if any) rather than clearing
      // it outright, so a 2024 charge cannot be re-posted when only 2025 is
      // being reversed.
      const prior = await tx.journalEntry.findFirst({
        where: {
          companyId,
          sourceType: 'DEPRECIATION',
          reference: original.reference,
          id: { not: original.id },
          date: { lte: original.date }
        },
        orderBy: { date: 'desc' }
      });

      await tx.fixedAsset.update({
        where: { id: asset.id },
        data: {
          accumulatedDep: round2(Math.max(0, toNum(asset.accumulatedDep) - charge)),
          lastDepYear: prior ? Number(prior.date.slice(0, 4)) : null
        }
      });
      break;
    }

    default:
      // MANUAL / CLOSING / REVERSAL entries have no linked record.
      break;
  }
}
