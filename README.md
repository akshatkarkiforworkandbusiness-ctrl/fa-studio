# FA Studio — Financial Accounting Cloud Simulation & ACCA FA Prep

A **Next.js (App Router) + TypeScript + Tailwind CSS + Prisma** application that pairs a
multi-company double-entry accounting sandbox with an ACCA FA (2025–2026) IFRS reference hub
and CBE exam simulator.

Inspired by [Xero](https://www.xero.com/za/educators/students/) cloud bookkeeping workflows and
the [ACCA Study Hub](https://www.accaglobal.com/gb/en/student/your-study-options/studyhub.html).

> **Routes:** `/` is the landing page · `/app` is the workspace.

## Key features

- **3 multi-company scenarios** — Meridian Retail Ltd (Retail), CloudPulse SaaS Inc. (B2B SaaS —
  IFRS 15 deferred revenue, IAS 38 software capitalisation) and Atlas Precision Manufacturing Co.
  (IAS 16 heavy plant, IAS 37 warranty provisions). Each has its own chart of accounts, bank feed,
  invoices and asset register.
- **Xero-style bank feed auto-matching** — match incoming statement lines against open AR
  invoices / AP bills, plus one-click coding for bank fees, standing orders and interest.
- **Invoicing (AR) & supplier bills (AP)** — automatic sales tax and double-entry posting.
- **Fixed asset register (IAS 16 / IAS 38)** — cost, accumulated depreciation, NBV, straight-line
  vs reducing balance, one-click annual depreciation runs.
- **Live financial statements** — profit or loss with an **IAS 1 ⇄ [IFRS 18](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/)**
  (operating / investing / financing) toggle, statement of financial position, and ratio analysis.
- **Internship missions** — each company opens with a manager's brief and six guided close steps,
  each tied to an ACCA chapter, with "back-on-track" journals that post the correct entry and
  explain the reasoning.
- **ACCA FA study hub & CBE simulator** — grounded in the
  [ACCA FA/FFA 2025–2026 syllabus](https://www.accaglobal.com/content/dam/acca/global/PDF-students/fia/studyguides/FA%20FFA%20S25-A26%20syllabus%20and%20study%20guide%20-%20final.pdf)
  and official IFRS Foundation standards.

## Quick start

```bash
npm install
cp .env.example .env

# generate a real secret — production refuses to start without one
node -e "console.log('AUTH_SECRET=\"' + require('crypto').randomBytes(32).toString('hex') + '\"')" >> .env

npm run db:push     # create the SQLite schema
npm run db:seed     # demo student + 3 companies
npm test            # accounting engine unit tests
npm run dev         # http://localhost:3000
```

Demo login: `student@fastudio.app` / `fastudio2025`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev, production build, production server |
| `npm test` | Accounting engine unit tests (`node --test`) |
| `npm run lint` | ESLint via `next/core-web-vitals` + `next/typescript` |
| `npm run db:push` / `db:seed` / `db:studio` | Prisma schema, seed data, database GUI |
| `node scripts/smoke.mjs` | Live API contract test — run against a started server |
| `node scripts/reversal-test.mjs` | Reversal / audit-trail test — run against a started server |

## Architecture

```
src/
  app/
    page.tsx                 landing page (static, no app bundle)
    app/page.tsx             the workspace
    error.tsx                render error boundary
    not-found.tsx            404
    api/                     route handlers (auth, companies, exam, progress)
  components/                AppShell + one component per view
  lib/
    accounting-engine.ts     double-entry ledger, statements, ratios, depreciation
    exam-bank.ts             SERVER-ONLY question bank + marking key
    company-rules.ts         ownership checks, account-code validation, money helpers
    account-codes.ts         control-account registry (no scattered magic numbers)
    rate-limit.ts            fixed-window limiter
    serialize.ts             Decimal → number at the API boundary
prisma/schema.prisma         SQLite (switch provider to postgresql for production)
```

**Money is stored as `Decimal`** and converted to plain numbers only at the API boundary, so
values round-trip exactly and the client always receives a `number`.

**Every company-scoped route** loads through `loadOwnedCompany()`, which scopes the query to the
authenticated user — a foreign company id returns 404 rather than leaking its existence.

## Accounting integrity

The sandbox refuses to produce wrong numbers rather than silently accepting them:

- **Account codes are validated** against the company's chart of accounts before a journal is
  created. Previously an unknown code was accepted and then dropped by the ledger, leaving the
  trial balance out of balance with no error raised.
- **Bank reconciliation checks amounts.** Matching a $7,200 receipt to a $4,500 bill is rejected —
  it would have overstated cash while marking the wrong document paid. Wrong-direction matches
  (a receipt against a supplier bill) are rejected too.
- **Depreciation is idempotent.** `lastDepYear` is enforced server-side; a repeat POST for the
  same fiscal year returns `409` instead of double-charging.
- **Entries are reversed, never deleted.** `POST /journals/reverse` posts an equal-and-opposite
  contra entry, records the link both ways, and rolls back the linked record (PAID → OPEN,
  RECONCILED → UNMATCHED, accumulated depreciation written back down). The audit trail has no
  holes.

## Security

- **`AUTH_SECRET` is required in production.** Missing, placeholder, or under 32 characters
  raises a clear error on first use instead of silently signing sessions with a known string.
- **Server-side session invalidation.** Cookies carry a `sessionVersion` that is incremented on
  logout, so a stolen token dies with the session rather than surviving its 7-day expiry.
- **Rate limiting** on login (10 / 15 min), register (5 / hour) and exam submission (20 / hour),
  keyed by IP. In-memory and per-process — swap `rate-limit.ts` for Redis behind multiple nodes.
- **Exam answers never reach the browser.** The marking key lives in a server-only module;
  `/api/exam/questions` serves a stripped copy and `/api/exam/submit` grades server-side and
  returns worked solutions only after submission.
- **`scrypt` password hashing** with per-user salt and `timingSafeEqual` comparison; HMAC-SHA256
  signed HTTP-only `SameSite=Lax` cookies.
- **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, HSTS,
  `Permissions-Policy`.

## Production deployment (Vercel + PostgreSQL)

1. Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`.
2. Set `DATABASE_URL` and a 64-character `AUTH_SECRET`, plus `NEXT_PUBLIC_SITE_URL` for
   `metadataBase`.
3. `npx prisma db push && npm run build`.

## Brand assets

- `public/brand/fa-studio-logo.jpg` — high-resolution logo.
- `public/brand/fa-studio-mark.svg` — vector mark, also wired as the favicon.

## Disclaimer

An independent study project. Not affiliated with, endorsed by, or connected to ACCA or the
IFRS Foundation. Standard references link to official sources.
