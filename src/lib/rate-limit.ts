/**
 * Minimal fixed-window rate limiter.
 *
 * In-memory and per-process: correct for a single Node deployment, and a
 * reasonable defence against naive credential stuffing. Behind a load balancer
 * with multiple instances each process counts independently, so for a real
 * multi-node deployment move this to Redis — the call sites do not change.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 10_000;

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the caller may retry. 0 when allowed. */
  retryAfterSec: number;
  remaining: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  // Opportunistic prune so a long-lived process cannot grow unbounded.
  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
    // Still over the cap? Drop oldest-inserted entries.
    while (buckets.size > MAX_TRACKED_KEYS) {
      const oldest = buckets.keys().next().value;
      if (oldest === undefined) break;
      buckets.delete(oldest);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      remaining: 0
    };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSec: 0, remaining: limit - bucket.count };
}

/** Best-effort client IP for rate-limit bucketing. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Build a rate-limit response, including a Retry-After header. */
export function rateLimitResponse(retryAfterSec: number): Response {
  return new Response(
    JSON.stringify({
      error: `Too many attempts. Please wait ${retryAfterSec} second${retryAfterSec === 1 ? '' : 's'} and try again.`
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSec)
      }
    }
  );
}
