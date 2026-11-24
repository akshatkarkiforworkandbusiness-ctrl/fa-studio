import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';
import { MULTI_COMPANY_SCENARIOS } from '../src/lib/scenarios';

const prisma = new PrismaClient();

export async function provisionUserScenarios(userId: string) {
  for (const s of MULTI_COMPANY_SCENARIOS) {
    const existing = await prisma.companyScenario.findUnique({
      where: { userId_slug: { userId, slug: s.slug } }
    });
    if (existing) continue;

    await prisma.companyScenario.create({
      data: {
        userId,
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
}

async function main() {
  const demoEmail = 'student@fastudio.app';
  let user = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: demoEmail,
        name: 'Alex Rivera (ACCA Student)',
        passwordHash: hashPassword('fastudio2025')
      }
    });
  }
  await provisionUserScenarios(user.id);
  console.log('FA Studio seed completed! Demo login: student@fastudio.app / fastudio2025');
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
