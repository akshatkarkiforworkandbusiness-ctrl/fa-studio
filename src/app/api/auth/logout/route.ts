import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, clearSessionCookie } from '@/lib/auth';

export async function POST() {
  const user = await getCurrentUser();

  if (user) {
    // Invalidate every outstanding cookie for this account. Without this, a
    // stolen session token stayed valid for its full 7-day lifetime even after
    // the user clicked "Sign Out".
    await prisma.user.update({
      where: { id: user.id },
      data: { sessionVersion: { increment: 1 } }
    });
  }

  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
