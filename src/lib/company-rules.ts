import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { REQUIRED_CONTROL_CODES } from './account-codes';

/**
 * A failure that is the caller's fault (bad payload, unknown account),
 * expressed as an HTTP status + message. Routes translate it into a response
 * so validation logic stays in one place instead of being re-written per route.
 */
export class RuleError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'RuleError';
    this.status = status;
  }
}

type Result<T> = { ok: true; value: T } | { ok: false; status: number; error: string };

/** Wrap a handler that may throw RuleError into a uniform result. */
export async function guard<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, value: await fn() };
  } catch (err) {
    if (err instanceof RuleError) {
      return { ok: false, status: err.status, error: err.message };
    }
    throw err;
  }
}

/**
 * Load a company only if it belongs to `userId`.
 *
 * Returns null for both "does not exist" and "belongs to someone else", so a
 * caller cannot probe for the existence of another student's company.
 *
 * The chart of accounts is always included: every posting route needs it to
 * validate account codes, and it is a single small relation either way.
 */
export function loadOwnedCompany(userId: string, companyId: string) {
  return prisma.companyScenario.findFirst({
    where: { id: companyId, userId },
    include: { accounts: { select: { code: true, category: true } } }
  });
}

/** Set of account codes available in a company, for O(1) membership checks. */
export function accountCodeSet(accounts: Array<{ code: string }> | undefined): Set<string> {
  return new Set((accounts ?? []).map(a => a.code));
}

/**
 * Throw a 400 if any referenced account code is absent from the company.
 *
 * This is the fix for the "ghost account" bug: an unknown code used to be
 * accepted and then silently skipped by `computeGeneralLedger`, which left the
 * trial balance out of balance with no error surfaced anywhere.
 */
export function assertAccountCodes(
  codes: string[],
  available: Set<string>,
  label = 'account'
): void {
  const missing = [...new Set(codes)].filter(c => !available.has(c));
  if (missing.length > 0) {
    throw new RuleError(
      400,
      `Unknown ${label} code${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. ` +
        'Choose an account from this company\'s chart of accounts.'
    );
  }
}

/**
 * Assert that the automatic-posting control accounts all exist, so invoice,
 * bank-feed and depreciation postings cannot half-succeed.
 */
export function assertControlAccounts(available: Set<string>): void {
  const missing = REQUIRED_CONTROL_CODES.filter(c => !available.has(c));
  if (missing.length > 0) {
    throw new RuleError(
      500,
      `This company's chart of accounts is missing required control account(s): ${missing.join(', ')}.`
    );
  }
}

/**
 * Coerce a Prisma `Decimal` (or anything numeric) to a JS number.
 *
 * Money is stored as Decimal for exact round-tripping, but Prisma returns
 * Decimal instances which do not coerce with `+`, `>` or `Math.abs`.
 * Server-side arithmetic goes through this helper; values are re-serialised
 * to plain numbers before they reach the client.
 */
export function toNum(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined) return 0;
  if (value instanceof Prisma.Decimal) return value.toNumber();
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Round to 2 decimal places — the single source of truth for money math. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** True when two money amounts agree to within one cent. */
export function amountsMatch(a: number, b: number): boolean {
  return Math.abs(Math.abs(a) - Math.abs(b)) < 0.005;
}
