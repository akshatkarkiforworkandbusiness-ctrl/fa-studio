# FA Studio — Full-Stack Financial Accounting Cloud Simulation & ACCA FA (2025–2026) Platform

**FA Studio** is a production-ready **Next.js (App Router) + TypeScript + Tailwind CSS + Prisma** web application built for self-study accounting students. Inspired by [Xero](https://www.xero.com/za/educators/students/) cloud bookkeeping workflows and the [ACCA Study Hub](https://www.accaglobal.com/gb/en/student/your-study-options/studyhub.html), it pairs a multi-company double-entry accounting sandbox with an ACCA FA (2025–2026) IFRS reference hub and CBE exam simulator.

## Key Features
- **3 Multi-Company Cloud Scenarios**: Switch seamlessly between **Meridian Retail Ltd** (Retail), **CloudPulse SaaS Inc.** (B2B SaaS — IFRS 15 deferred revenue & IAS 38 software capitalisation), and **Atlas Precision Manufacturing Co.** (Manufacturing — IAS 16 heavy plant & IAS 37 warranty provisions).
- **Xero-Style Bank Feed Auto-Matching**: Automatic match suggestions between incoming bank statement lines and open AR invoices / AP bills, plus one-click ledger coding for bank fees, standing orders, and interest.
- **Invoicing (AR) & Supplier Bills (AP)**: Issue invoices and supplier bills with automatic Sales Tax and double-entry journal posting.
- **Fixed Asset Register (IAS 16 / IAS 38)**: Track cost, accumulated depreciation, Net Book Value, Straight-Line vs. Reducing Balance policies, and one-click annual depreciation runs.
- **Live Financial Statements & Ratios**: Real-time Statement of Profit or Loss with **IAS 1** vs. **[IFRS 18](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/)** (Operating / Investing / Financing) toggle, Statement of Financial Position, and Ratio Analyzer.
- **Student Auth & Persistent Progress**: Secure `scrypt` password hashing + HMAC-SHA256 HTTP-only session cookies backed by Prisma ORM (SQLite local dev, 1-line PostgreSQL switch for production).
- **ACCA FA (2025–2026) Study Hub & CBE Simulator**: Grounded in the [ACCA FA/FFA 2025–2026 Syllabus](https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/studyguides/FA%20FFA%20S25-A26%20syllabus%20and%20study%20guide%20-%20final.pdf), [ACCA PER](https://www.accaglobal.com/gb/en/student/practical-experience-per.html), and official IFRS Foundation standards ([IAS 2](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/), [IAS 7](https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/), [IAS 10](https://www.ifrs.org/issued-standards/list-of-standards/ias-10-events-after-the-reporting-period/), [IAS 16](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/), [IAS 37](https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/), [IAS 38](https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/), [IFRS 15](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/), [IFRS 3](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-3-business-combinations/), [IFRS 10](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-10-consolidated-financial-statements/)).

## Brand Assets
- `public/brand/fa-studio-logo.jpg` — High-resolution FA Studio brand logo.
- `public/brand/fa-studio-mark.svg` — Scalable vector icon mark used in the application header.

## Quick Start (Local Development)
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Push Prisma schema to SQLite & seed demo student + 3 companies
npm run db:push
npm run db:seed

# 4. Run accounting engine tests
npm test

# 5. Start Next.js dev server
npm run dev
```
Open **http://localhost:3000** and sign in with the seeded demo account (`student@fastudio.app` / `fastudio2025`) or register a fresh student account.

## Production Deployment (Vercel + PostgreSQL)
1. Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`.
2. Set `DATABASE_URL` (Neon, Supabase, or Vercel Postgres) and a 64-char `AUTH_SECRET` in your hosting environment variables.
3. Run `npx prisma db push && npm run build`.
