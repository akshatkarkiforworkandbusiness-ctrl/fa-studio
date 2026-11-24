import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { MULTI_COMPANY_SCENARIOS } from '@/lib/scenarios';
import { clientIp, rateLimit, rateLimitResponse } from '@/lib/rate-limit';

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

// 5 sign-ups per hour per IP — enough for a classroom, too few for scripted
// account farming.
const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please provide a valid name, email, and password (8+ chars).' },
        { status: 400 }
      );
    }

    const limited = rateLimit(`register:${clientIp(req)}`, REGISTER_LIMIT, REGISTER_WINDOW_MS);
    if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

    const email = parsed.data.email.toLowerCase();

    // Provision the user and all 3 scenarios atomically. Previously this ran
    // as separate creates, so a failure part-way left an account with only
    // some companies and no way to repair it.
    const user = await prisma.$transaction(async tx => {
      const created = await tx.user.create({
        data: {
          name: parsed.data.name,
          email,
          passwordHash: hashPassword(parsed.data.password)
        },
        select: { id: true, name: true, email: true }
      });

      // Retail, SaaS and Manufacturing workspaces for the new student.
      for (const s of MULTI_COMPANY_SCENARIOS) {
        await tx.companyScenario.create({
          data: {
            userId: created.id,
            slug: s.slug,
            name: s.name,
            industry: s.industry,
            currency: s.currency,
            fiscalYearEnd: s.fiscalYearEnd,
            description: s.description,
            accounts: { create: s.accounts },
            invoices: { create: s.invoices },
            bankTransactions: { create: s.bankTransactions },
            fixedAssets: { create: s.fixedAssets }
          }
        });
      }
      return created;
    });

    await setSessionCookie(user.id, 0);
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    // Concurrent sign-ups with the same email race past the pre-check; the
    // unique index is the real guarantee.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Unable to create account.' }, { status: 500 });
  }
}
