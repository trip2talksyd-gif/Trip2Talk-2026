# Trip2Talk V7 — Supabase-only backend

Premium photography **trip** platform. Single-tenant. Repo: `trip2talk-v6-app`.

**Brand language:** Trip / Trip Leader only — never Tour / Guide.

## Architecture (4 services)

| Service | Role |
|---------|------|
| **Vercel** | Hosting + Next.js API routes + cron |
| **GitHub** | Source control (`Trip2Talk-2026`) |
| **Supabase** (`xwdtjwzjkqunewxjpimm`) | Postgres (all structured data) + Storage (files) |
| **Hostinger** | Domain DNS (outside this repo) |

```
Browser → Next.js API Routes (Vercel)
              └─► Supabase service role
                    ├─ Postgres (trips, bookings, admin data)
                    └─ Storage (signed upload/view URLs)
                        ↑
                 Stripe webhook (paymentStatus: paid)
```

**Do NOT use:** Firebase (removed in v7), Supabase Auth, Supabase Realtime from the browser for writes.

Public reads use RLS policies (active trips, departures, approved reviews). All writes go through API routes with the service role key.

Frontend CTA section (`src/components/cta/*`) is already built — do not modify unless asked.

## Getting started

```bash
npm install
cp .env.local.example .env.local
# Apply supabase/migrations/20260710100000_v7_schema.sql in Supabase SQL Editor
npm run build:seed-data
npm run seed:trips
npm run seed:reviews
npm run dev
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run test` | Seat-lock, match quiz, auth, PDF, pricing, catalog tests |
| `npm run build:seed-data` | Build `seed-data/trip2talk-v6-trip-data.json` |
| `npm run seed:trips` | Upsert `trip_templates` + `trip_departures` in Postgres |
| `npm run seed:reviews` | Insert approved reviews |

## Environment variables

Copy `.env.local.example` → `.env.local`.

### Supabase (Postgres + Storage)

From Supabase Dashboard → Project settings → API.

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | `https://xwdtjwzjkqunewxjpimm.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — DB writes, uploads, signed URLs |
| `NEXT_PUBLIC_SUPABASE_URL` | Public project URL (trip photo CDN) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key — RLS limits public reads |

Apply `supabase/migrations/20260710100000_v7_schema.sql` and `supabase/storage-policies.sql` in the SQL Editor.

### Admin PINs

| Variable | V5 default |
|----------|------------|
| `ADMIN_PIN_TRIP_LEADER` | 1111 |
| `ADMIN_PIN_CASHIER` | 4444 |
| `ADMIN_PIN_OWNER` | 9999 |
| `ADMIN_SESSION_SECRET` | Generate random string |

### Cron + email

`CRON_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `OWNER_ALERT_EMAIL`, `COMPANY_EMAIL`

### Stripe (TEST mode — use test keys only)

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Server — PaymentIntent + webhook |
| `STRIPE_WEBHOOK_SECRET` | Verify `/api/stripe/webhook` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client Payment Element |
| `NEXT_PUBLIC_APP_URL` | Return URLs + email links |

### Bank transfer display at checkout

`NEXT_PUBLIC_BANK_ACCOUNT_NAME`, `NEXT_PUBLIC_BANK_BSB`, `NEXT_PUBLIC_BANK_ACCOUNT_NUMBER`, `NEXT_PUBLIC_PROMPTPAY_ID`

### Confirm later

`ENABLE_DRIVE_SYNC`, `GOOGLE_DRIVE_*`, `TWILIO_*` (SMS)

## Vercel env vars to delete manually

After a successful v7 deploy, remove these from the Vercel project dashboard (they are no longer read):

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `OLD_SUPABASE_URL` (Phase 0 migration retired)
- `OLD_SUPABASE_SERVICE_ROLE_KEY`

## Upload pattern (Supabase Storage)

Avoids Vercel's ~4.5MB request body limit:

1. Client → API route → `createSignedUploadUrl()` (service role) → returns token
2. Client uploads **directly to Supabase** using the token
3. Client → confirm API route → writes storage path to Postgres (never writes `paymentStatus` client-side)

## Security

| Resource | Policy |
|----------|--------|
| `trip_templates` (active) | Public SELECT via RLS |
| `trip_departures` | Public SELECT via RLS |
| `reviews` (approved) | Public SELECT via RLS |
| `bookings`, admin tables | Service role only |
| `trip-photos` | Public read, service-role write |
| `payment-slips`, `passport-documents`, etc. | Service-role only, signed URLs |

Seat locking uses Postgres RPCs `reserve_seats` / `release_seats` (row-level lock on update).

## Data quality flags (review before go-live)

1. **TAS-3D2N** — seeded departure 16–21 Mar spans 6 days but trip is 3D2N
2. **BER-3D2N** — no confirmed max seats in source data
3. **TAS-LH-3D2N-WIN** — max seats confirmation pending

## Routes

| Path | Purpose |
|------|---------|
| `/` | Homepage + comparison table + trip finder promo |
| `/trip-finder` | Trip matcher quiz (no AI — pure tag scoring) |
| `/trips` | Public catalog |
| `/trips/[tripCode]` | Trip detail + checkout |
| `/trips/private` | Private 1-day inquiry (6 routes) |
| `/booking/[id]/upload-documents` | Post-payment compliance upload |
| `/admin/login` | PIN auth |
| `/admin` | Role-aware dashboard |

### API highlights

- `POST /api/bookings/create-card-intent` — seat lock + Stripe PaymentIntent
- `POST /api/bookings/create-slip-booking` — seat lock + signed slip upload
- `POST /api/stripe/webhook` — payment confirmed → PDF + email
- `POST /api/storage/signed-upload` + `confirm-upload` — all file flows
- `POST /api/admin/*` — protected by PIN session middleware

## Vercel Cron

**Live now** (`vercel.ts`) — once daily on Hobby:

| Schedule (UTC) | Route |
|----------------|-------|
| Daily 03:00 | `/api/cron/expire-pending-slips` |
| Daily 03:03 | `/api/cron/expire-pending-cards` |
| Daily 03:06 | `/api/cron/document-expiry-alerts` |

**Built but NOT scheduled** — enable after manual dry run:

```typescript
// Add to vercel.ts config.crons[] after review:
{
  path: "/api/cron/delete-compliance-docs",
  schedule: "9 3 * * *",
}
```

Dry run locally: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/delete-compliance-docs`

## Repo

GitHub: `trip2talksyd-gif/Trip2Talk-2026`
