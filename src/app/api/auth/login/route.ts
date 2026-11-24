import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword, setSessionCookie } from '@/lib/auth';
import { clientIp, rateLimit, rateLimitResponse } from '@/lib/rate-limit';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// 10 attempts per 15 minutes per IP+email pair. scrypt is deliberately slow,
// so this caps brute-force throughput without needing an external store.
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const limited = rateLimit(`login:${clientIp(req)}:${email}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
    if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    // Bind the cookie to the user's current session version so that a later
    // logout (which increments it) invalidates this cookie server-side.
    await setSessionCookie(user.id, user.sessionVersion);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Unable to sign in.' }, { status: 500 });
  }
}
