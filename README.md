# Trip2Talk V6

Fresh rebuild of Trip2Talk — Next.js App Router, Firebase Firestore + Storage, Stripe payments, Vercel hosting.

**Brand language:** Always **Trip** (never Tour) and **Trip Leader** (never Guide).

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (Vercel serverless) |
| Database | Firebase Firestore |
| Storage | Firebase Cloud Storage |
| Payments | Stripe Payment Element |
| Cron | Vercel Cron |

## Getting started

```bash
npm install
cp .env.local.example .env.local
# Fill in .env.local (see Environment variables below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run test` | Run Vitest (includes seat-lock overbooking test) |
| `npm run migrate:supabase` | One-time V5 → V6 data migration (manual CLI only) |
| `npm run seed:trips` | Seed Firestore `trips` from catalog templates (requires Firebase env) |
| `npm run build:catalog` | Export assembled catalog to `src/data/trip-catalog.full.json` |

## Environment variables

Copy `.env.local.example` to `.env.local` and fill each value.

### Firebase Admin (server-only)

Used by API routes, cron jobs, and the migration script. From Firebase Console → Project settings → Service accounts → Generate new private key.

| Variable | Purpose |
|----------|---------|
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key (paste with `\n` for newlines) |
| `FIREBASE_STORAGE_BUCKET` | e.g. `your-project.appspot.com` |

### Firebase Client (public — safe for browser)

From Firebase Console → Project settings → Your apps → Web app config.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID |

### Phase 0 migration (one-time, not deployed)

Read-only access to Trip2Talk V5 Supabase project `xwdtjwzjkqunewxjpimm`.

| Variable | Purpose |
|----------|---------|
| `OLD_SUPABASE_URL` | V5 Supabase URL |
| `OLD_SUPABASE_SERVICE_ROLE_KEY` | V5 service role key (read-only usage) |

### Admin authentication (server-only)

| Variable | Purpose |
|----------|---------|
| `ADMIN_PIN_TRIP_LEADER` | PIN for Trip Leader dashboard (V5 default: 1111) |
| `ADMIN_PIN_CASHIER` | PIN for Cashier dashboard (V5 default: 4444) |
| `ADMIN_PIN_OWNER` | PIN for Owner dashboard (V5 default: 9999) |
| `ADMIN_SESSION_SECRET` | Secret for signing short-lived admin session cookies |

### Vercel Cron

| Variable | Purpose |
|----------|---------|
| `CRON_SECRET` | Bearer token Vercel sends on cron requests; set the same value in Vercel env vars |

### Stripe (payments phase)

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Server-side Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe.js |

### Bank transfer checkout display

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_BANK_ACCOUNT_NAME` | Account name shown at checkout |
| `NEXT_PUBLIC_BANK_BSB` | BSB |
| `NEXT_PUBLIC_BANK_ACCOUNT_NUMBER` | Account number |
| `NEXT_PUBLIC_PROMPTPAY_ID` | PromptPay ID (if applicable) |

## Critical business rule — atomic seat lock

All booking writes **must** go through `createBookingWithSeatLock()` in `src/lib/bookSeat.ts` via a Next.js API route. Never write `seatsBooked` or booking fields from the client.

- `fixedDate === null` → trip is not bookable (show "Date TBA")
- Transaction rejects when `seatsBooked + requestedSeats > maxSeats`
- Admin seat +/- uses `adjustTripSeats()` with the same guards

Run the overbooking test:

```bash
npm run test
```

## Phase 0 — data migration

Standalone script — **not** wired into the app or Vercel Cron.

```bash
# Requires FIREBASE_* and OLD_SUPABASE_* in .env.local
npm run migrate:supabase
```

- Reads: `tours`, `tour_bookings`, `staff_profiles`, `staff_commission_ledger`, `expenses`, `insurance_alerts`
- Writes to Firestore using Supabase row UUIDs as doc IDs (idempotent re-runs)
- Logs per-collection counts; transform errors go to `migration-errors.log`

## Firebase security rules

| Path | Access |
|------|--------|
| Firestore (all) | Deny client read/write — Admin SDK via API routes only |
| `trip-photos/*` | Public read |
| `passport-documents/*` | Deny all — Admin SDK + signed URLs only |
| `payment-slips/*` | Deny all — Admin SDK + signed URLs only |

Deploy rules:

```bash
firebase deploy --only firestore:rules,storage
```

## Vercel Cron jobs

Defined in `vercel.json`:

| Schedule | Route | Purpose |
|----------|-------|---------|
| Daily 03:00 UTC | `/api/cron/delete-compliance-docs` | Delete passport docs 7+ days after trip date |
| Hourly | `/api/cron/expire-pending-slips` | Release seats for unverified bank slips after 48h |

## Trip catalog

Canonical trip content lives in `src/data/trip-catalog/`:

| Path | Purpose |
|------|---------|
| `company.json` | Email, ABN, brand rules |
| `templates/*.json` | One file per trip code (13 templates) |
| `private-one-day-custom.json` | Inquire-then-quote private routes |

**Brand rule:** UI copy must use **Trip** / **Trip Leader** — never Tour / Guide. Source templates may contain legacy wording in Thai marketing copy; the seed script logs brand violations for review but does not alter source text.

**Firestore expansion:** One `trips` doc = one departure date. Templates with `knownDepartures` expand to multiple docs (e.g. `CAN-2D1N__2026-10-05`). Seasonal/on-request trips with no dates become a single Date TBA doc (`{tripCode}__tba`, `fixedDate: null` → not bookable).

After Firebase credentials are in `.env.local`:

```bash
npm run seed:trips
```

This writes **14 trip documents** (8 dated departures + 6 Date TBA) plus `config/company` and `config/privateOneDayCustom`.

## Trip codes (V5 seed)

TAS-3D2N, MEL-4D3N, ULU-4D3N, NZ-6D5N, TAS-LH-4D3N, KIA-1DAY, CAN-2D1N, SYD-1DAY, PSP-1DAY, TAS-SU-4D3N, SYD-MW-WIN, BER-3D2N, LAV-ANB-1D

## Repo

GitHub: `trip2talk-v6-app`
