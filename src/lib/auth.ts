import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const COOKIE_NAME = 'fa_studio_session';
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

/** Local-only fallback used when NODE_ENV is not "production". */
const DEV_SECRET = 'fa-studio-dev-secret-change-in-production';

/**
 * Values that must never sign a production session. The first is the old
 * hard-coded fallback; the second is the placeholder shipped in .env.example.
 * Signing with either would let anyone forge a valid session for any user.
 */
const PLACEHOLDER_SECRETS = new Set([
  DEV_SECRET,
  'replace-with-a-strong-64-char-random-secret'
]);

let resolvedSecret: string | null = null;

/**
 * Resolve AUTH_SECRET, failing loudly rather than silently downgrading to a
 * publicly-known key.
 *
 * Deliberately lazy: `next build` imports this module but never signs or
 * verifies a token, so a missing secret surfaces on the first real request
 * instead of breaking the build.
 */
function getSecret(): string {
  if (resolvedSecret) return resolvedSecret;

  const raw = process.env.AUTH_SECRET;
  const isProd = process.env.NODE_ENV === 'production';

  if (!raw || PLACEHOLDER_SECRETS.has(raw)) {
    if (isProd) {
      throw new Error(
        'AUTH_SECRET is missing or still set to a placeholder value. ' +
          'Generate one with `openssl rand -hex 32` (or `node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"`) ' +
          'and set it in your production environment before starting the server.'
      );
    }
    resolvedSecret = DEV_SECRET;
    return resolvedSecret;
  }

  if (isProd && raw.length < 32) {
    throw new Error(
      `AUTH_SECRET is only ${raw.length} characters; production requires at least 32.`
    );
  }

  resolvedSecret = raw;
  return resolvedSecret;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

interface TokenPayload {
  userId: string;
  /** Bumped on logout so outstanding cookies are invalidated server-side. */
  v: number;
  exp: number;
}

export function signSessionToken(userId: string, sessionVersion: number): string {
  const payload: TokenPayload = {
    userId,
    v: sessionVersion,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifySessionToken(token: string): { userId: string; version: number } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;

  // Length check first so timingSafeEqual is never given mismatched buffers.
  const expectedSig = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Partial<TokenPayload>;
    if (
      !parsed.userId ||
      typeof parsed.exp !== 'number' ||
      parsed.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return { userId: parsed.userId, version: typeof parsed.v === 'number' ? parsed.v : 0 };
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string, sessionVersion = 0): Promise<void> {
  const token = signSessionToken(userId, sessionVersion);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SEC
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const verified = verifySessionToken(token);
  if (!verified) return null;

  const user = await prisma.user.findUnique({
    where: { id: verified.userId },
    select: { id: true, email: true, name: true, createdAt: true, sessionVersion: true }
  });
  if (!user) return null;

  // Reject cookies issued before the most recent logout.
  if (user.sessionVersion !== verified.version) return null;

  const { sessionVersion: _ignored, ...safe } = user;
  return safe;
}
