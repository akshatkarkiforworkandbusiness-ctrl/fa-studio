import { Prisma } from '@prisma/client';

/**
 * Convert Prisma `Decimal` fields into plain JavaScript numbers.
 *
 * Money columns are stored as Decimal so values round-trip exactly, but
 * Prisma hands them back as Decimal instances which JSON.stringify would
 * emit as strings ("7200"). The accounting engine, the charts and the
 * formatters all do arithmetic on these values, so a string would produce
 * concatenation bugs ("7200" + 1 === "72001") or NaN.
 *
 * Every API response that carries money goes through this before it is
 * returned, so the client always sees plain numbers.
 */
function revive(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;

  if (value instanceof Prisma.Decimal) {
    // toNumber() rather than parseFloat so 18-dp values are not truncated
    // by string conversion; callers round for display at the edge.
    return value.toNumber();
  }

  if (Array.isArray(value)) return value.map(revive);

  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    out[key] = revive(child);
  }
  return out;
}

/** Deep-copy `value`, replacing every Prisma Decimal with a number. */
export function serialize<T>(value: T): T {
  return revive(value) as T;
}
