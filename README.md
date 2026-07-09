# Trip2Talk V6 — Hybrid Backend (Firestore + Supabase Storage)

Premium photography **trip** platform. Single-tenant. Repo: `trip2talk-v6-app`.

**Brand language:** Trip / Trip Leader only — never Tour / Guide.

## Hybrid architecture (v2)

Two services, two jobs — do not mix them up:

| Service | Job | What lives here |
|---------|-----|-----------------|
| **Firebase Firestore** | Structured, queryable text data | `tripTemplates`, `tripDepartures`, `bookings`, staff, expenses |
| **Supabase Storage** | Files only | `trip-photos`, `payment-slips`, `passport-documents`, `expense-receipts`, `booking-confirmations` |

**Assumption (confirm with Saen):** Reuse the existing V5 Supabase project (`xwdtjwzjkqunewxjpimm`) for Storage buckets only. Its Postgres tables are retired — Phase 0 migration reads them one last time, then all writes go to Firestore.

```
Browser → Next.js API Routes (Vercel)
              ├─► Firestore Admin SDK  (text)
              └─► Supabase service role (files — signed upload/view URLs)
                        ↑
                 Stripe webhook (paymentStatus: paid)
```

**Do NOT use:** Firebase Storage, Supabase Postgres (after migration), Supabase Auth, Supabase Realtime.

Frontend CTA section (`src/components/cta/*`) is already built — do not modify unless asked.

## Getting started

```bash
npm install
cp .env.local.example .env.local
npm run build:seed-data
npm run dev
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run test` | Seat-lock, auth, PDF, pricing, catalog tests |
| `npm run build:seed-data` | Build `seed-data/trip2talk-v6-trip-data.json` |
| `npm run seed:trips` | Write `tripTemplates` + `tripDepartures` to Firestore |
| `npm run migrate:supabase` | Phase 0: V5 Postgres → Firestore (one-time) |

## Environment variables

Copy `.env.local.example` → `.env.local`.

### Firebase group (Firestore text data)

From Firebase Console → Project settings → Service accounts → Generate private key.

| Variable | Purpose |
|----------|---------|
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key |
| `NEXT_PUBLIC_FIREBASE_*` | Client SDK (5 vars) for optional real-time catalog reads |

### Supabase group (Storage only — same V5 project)

From Supabase Dashboard → Project settings → API.

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | `https://xwdtjwzjkqunewxjpimm.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — uploads, signed URLs, deletes |
| `NEXT_PUBLIC_SUPABASE_URL` | Public project URL (for `trip-photos` public URLs) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key — RLS blocks all storage writes from browser |

Then run `supabase/storage-policies.sql` in the SQL Editor.

### Phase 0 migration (same V5 project, Postgres read-only)

| Variable | Purpose |
|----------|---------|
| `OLD_SUPABASE_URL` | Same as `SUPABASE_URL` |
| `OLD_SUPABASE_SERVICE_ROLE_KEY` | Same as `SUPABASE_SERVICE_ROLE_KEY` |

Existing files in `payment-slips` bucket are **left in place** — migration carries the storage path into Firestore `slipUrl`.

### Admin PINs

| Variable | V5 default |
|----------|------------|
| `ADMIN_PIN_TRIP_LEADER` | 1111 |
| `ADMIN_PIN_CASHIER` | 4444 |
| `ADMIN_PIN_OWNER` | 9999 |
| `ADMIN_SESSION_SECRET` | Generate random string |

### Cron + email

`CRON_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `OWNER_ALERT_EMAIL`

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

## Upload pattern (Supabase Storage)

Avoids Vercel's ~4.5MB request body limit:

1. Client → API route → `createSignedUploadUrl()` (service role) → returns token
2. Client uploads **directly to Supabase** using the token
3. Client → confirm API route → writes storage path to Firestore (never writes `paymentStatus` client-side)

## Security

| Resource | Policy |
|----------|--------|
| Firestore `tripTemplates` / `tripDepartures` | Client **read-only** |
| Firestore everything else | Client **deny** |
| `trip-photos` | Public read, service-role write |
| `payment-slips`, `passport-documents`, `expense-receipts`, `booking-confirmations` | Service-role only, 5-min signed URLs |

Deploy Firestore rules: `firebase deploy --only firestore:rules`

## Data quality flags (review before go-live)

1. **TAS-3D2N** — seeded departure 16–21 Mar spans 6 days but trip is 3D2N
2. **BER-3D2N** — no confirmed max seats in source data

## Routes (Phase 2–4)

| Path | Purpose |
|------|---------|
| `/trips` | Public catalog |
| `/trips/[tripCode]` | Trip detail + checkout |
| `/trips/private` | Private 1-day inquiry (6 routes) |
| `/booking/[id]/upload-documents` | Post-payment compliance upload |
| `/admin/login` | PIN auth |
| `/admin` | Role-aware dashboard (owner / cashier / trip leader) |

### API highlights

- `POST /api/bookings/create-card-intent` — seat lock + Stripe PaymentIntent
- `POST /api/bookings/create-slip-booking` — seat lock + signed slip upload
- `POST /api/stripe/webhook` — payment confirmed → PDF + email
- `POST /api/storage/signed-upload` + `confirm-upload` — all file flows
- `POST /api/admin/*` — protected by PIN session middleware

## Vercel Cron

**Live now** (`vercel.json`):

| Schedule | Route |
|----------|-------|
| Hourly | `/api/cron/expire-pending-slips` (48h bank slip expiry) |
| Every 15 min | `/api/cron/expire-pending-cards` (30min card expiry) |
| Daily 04:00 UTC | `/api/cron/document-expiry-alerts` |

**Built + tested but NOT scheduled** — enable only after manual dry run:

```json
// Add to vercel.json crons[] after Saen reviews dry run:
// "Enable only after Saen reviews a manual dry run — this permanently deletes customer ID documents."
{
  "path": "/api/cron/delete-compliance-docs",
  "schedule": "0 3 * * *"
}
```

Dry run locally: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/delete-compliance-docs`

## Repo

GitHub: `trip2talk-v6-app`
