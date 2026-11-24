import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { MULTI_COMPANY_SCENARIOS } from '@/lib/scenarios';

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please provide a valid name, email, and password (8+ chars).' }, { status: 400 });
    }
    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash: hashPassword(parsed.data.password)
      },
      select: { id: true, name: true, email: true }
    });

    // Provision the 3 multi-company scenarios (Retail, SaaS, Manufacturing) for the new student
    for (const s of MULTI_COMPANY_SCENARIOS) {
      await prisma.companyScenario.create({
        data: {
          userId: user.id,
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

    await setSessionCookie(user.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Unable to create account.' }, { status: 500 });
  }
}
