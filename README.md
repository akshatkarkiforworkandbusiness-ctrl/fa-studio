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
#    1. paste a Postgres URL into DATABASE_URL — a free Neon database (the same
#       one you later hand to Vercel) or Postgres you run yourself
#    2. append a real AUTH_SECRET — production refuses to start without one
node -e "console.log('AUTH_SECRET=\"' + require('crypto').randomBytes(32).toString('hex') + '\"')" >> .env

npm run db:push     # create the schema
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
prisma/schema.prisma         PostgreSQL in dev and production
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

## Continuous integration

`.github/workflows/ci.yml` runs two parallel jobs on every push to `main` and
on every pull request:

| Job | Steps |
| --- | --- |
| **quality** | `npm ci` → `prisma generate` → `lint` → `tsc --noEmit` → `npm test` |
| **e2e** | `npm ci` → `prisma db push` → `next build` → start the production server → `smoke.mjs` (10 contract checks) → `reversal-test.mjs` (22 audit-trail checks) |

The e2e job runs against a `postgres:16-alpine` service container — the same
provider as production, so these tests exercise the real `Decimal` and
constraint behaviour rather than a SQLite stand-in.

## Production deployment (Vercel + Neon)

Postgres is used in **every** environment, local development included. Vercel's
filesystem is read-only and ephemeral: a SQLite file there is discarded on each
cold start, so every account and journal entry would silently vanish.

1. **Create a database.** A free [Neon](https://neon.tech) project — copy the
   *pooled* connection string (it ends in `?sslmode=require`). Use the same URL
   locally, and dev and production behave identically.

2. **Create the tables once**, against that URL:

   ```bash
   DATABASE_URL="<neon-pooled-url>" npx prisma db push
   ```

3. **Import the repo into Vercel** and set these environment variables:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | the Neon pooled connection string |
   | `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-app>.vercel.app` (used for `metadataBase`) |

4. **Deploy.** Vercel detects Next.js and runs `prisma generate && next build`
   from `package.json`. There is deliberately no `vercel.json` — no
   configuration is actually required, and adding one would only duplicate what
   Vercel already infers.

> **Serverless caveat:** the rate limiter in `src/lib/rate-limit.ts` is
> in-memory, so on Vercel its counters reset on every cold start and are not
> shared between instances. It still throttles a burst inside one instance, but
> it is not a global guarantee — swap in Upstash or Redis if you need a hard
> limit.

## Brand assets

- `public/brand/fa-studio-logo.jpg` — high-resolution logo.
- `public/brand/fa-studio-mark.svg` — vector mark, also wired as the favicon.

## Disclaimer

An independent study project. Not affiliated with, endorsed by, or connected to ACCA or the
IFRS Foundation. Standard references link to official sources.
