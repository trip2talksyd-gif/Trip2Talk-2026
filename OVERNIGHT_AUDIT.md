# Overnight audit — Trip2Talk (14 Aug 2026)

**Branch:** `feature/overnight-audit` (cut from current `main` at `3de021c`).  
**Why not `feature/booking-flow-redesign`:** that branch is already merged (PR #1) and is far behind production. Building overnight work on it would drop Square Web Payments, T&C, and the positioning copy. Overnight commits stay off `main` for morning review.

**Hard rules followed:** no push, no merge to `main`, no Edge Function deploy, no migration run against `bljhnelgmkulxwuhedbi`.

Production checked: https://www.trip2talk.com.au (375px viewport + HTTP crawl). Local `.env.local` and `npm run build` used for config/types.

---

## 1. Console / runtime / routes

SPA rewrite means every public path returns HTTP **200** (including unknown trip codes). Real “not found” is in-app.

| Route | Result |
|-------|--------|
| `/` | Loads. No horizontal overflow at 375px. No broken `<img>` at fold. |
| `/trips` | Loads. Trip picker + list. 375px OK. |
| `/trips/PSP-1DAY` | Loads. Hero is **T2T gradient** (no cover). Highlights text talks about Blue Mountains / Three Sisters — likely wrong CMS copy for Port Stephens (flagged for Saen, not rewritten). |
| `/trips/KIA-1DAY` | Exists in DB, no cover (same class as PSP). |
| `/trips/BER-3D2N`, `/CAB-3D1N`, `/TAS-SU-4D3N`, `/NZ-6D5N` | HTTP 200 (SPA). **Those exact `trip_code` rows are not in production** (see §4). |
| `/gallery`, `/calendar`, `/pricing`, `/spots`, `/discover`, `/about`, `/photo-guide`, `/my-trip`, `/app` | HTTP 200, reachable. |
| `/booking?trip=PSP-1DAY` | Correctly **redirects to `/waiver?trip=PSP-1DAY`** until waiver is signed. |
| `/waiver?trip=PSP-1DAY` | Loads; bilingual clauses stacked EN then TH. Not edited (legal). |
| Staff `/app/*` | PIN gate only without a session. Not fully walked (needs PIN). |

Failed Storage **render** URLs on homepage (transform endpoint, transferSize 0 in DevTools) for some Uluru/NZ thumbs — images still displayed via original object URLs in several places. Not treated as a frontend 404.

No `href="#"` dead links found in `src/`.

---

## 2. Environment / project ref

**Live / local config points at production only:**

- `.env.local`: `VITE_SUPABASE_URL=https://bljhnelgmkulxwuhedbi.supabase.co`
- `vercel.json`: no project ref (cron + SPA rewrite only)
- `api/cron/daily.ts:42`: hardcoded fallback `https://bljhnelgmkulxwuhedbi.supabase.co`
- `vite.config.ts:61-62`: SW cache allowlist for `bljhnelgmkulxwuhedbi`

**Stale ref `xwdtjwzjkqunewxjpimm` (flagged, not silently “fixed”):**

| File:line | What it is |
|-----------|------------|
| `MEMORY.md:8` | Warning: do not use stale ref |
| `MEMORY.md:19` | **Outdated note** claiming CLI + `.env.local` still point at stale ref. **False today** — `.env.local` is production. |
| `scripts/_verify-pwa-update.mjs:137` | Test assertion that `sw.js` must **not** contain the stale ref |

No hardcoded stale ref in `src/`, Edge Functions, or migrations.

---

## 3. TypeScript / build

`npm run build` (`tsc -b && vite build`) — **PASS**, 0 type errors.

Warnings (not errors):

- Vite: some chunks > 500 kB after minify (`index-*.js` ~1.85 MB). Suggests code-splitting later; not a morning blocker.
- Plugin timing note from Rolldown (informational).

`tsc --noEmit` is covered by `tsc -b` in the build script.

---

## 4. Missing trip cover images

Queried `tours` on **`bljhnelgmkulxwuhedbi`** (read-only REST, anon key). 19 rows.

| Code asked | In production DB? | `cover_image_url` | UI today |
|------------|-------------------|-------------------|----------|
| **PSP-1DAY** | Yes (+ `PSP-1DAY-SEP1_1`) | **null** | `TripPhotoHero` **T2T** gradient. Gallery map is `nsw` but **zero** `nsw` photos in `galleryPhotos.ts`. |
| **KIA-1DAY** | Yes (+ `KIA-1DAY-OCT1_1`) | **null** | Same T2T / empty `nsw` pool. |
| **BER-3D2N** | **No row** | — | In-app missing trip if linked. Bermagui gallery photos exist for other codes. |
| **CAB-3D1N** | **No row** | — | No `CAB-` prefix in gallery fallback. |
| **TAS-SU-4D3N** | **No row** | — | Tasmania photos exist for other TAS codes. |
| **NZ-6D5N** | **No exact row** | — | Dated rows `NZ-6D5N-NOV` and `NZ-6D5N-NOV15_20` **have** production Storage covers. |

Places that show a broken/empty cover instead of a labelled fallback:

- `src/components/trips/TripPhotoHero.tsx:29-36` — “T2T” letters, `aria-hidden`
- `src/pages/public/BookingPage.tsx:337-340` and `:448-451` — `mini-trip-fallback` “T2T”
- `src/components/trips/TripPickerHero.tsx:100-101` — teal gradient, no label
- `src/components/trips/TripCard.tsx` / `HomeTripShowcase.tsx` — prefer `cover_image_url`; if that URL 404s there is **no `onError`**, so a broken icon is possible

Do **not** invent placeholder photos. Part 2 adds a bilingual “Photo coming soon” state only.

---

## 5. Bilingual / BiDisplayHeading violations

Pattern required: EN `font-display` (Fraunces) + Thai **sibling** `font-serif` / `font-thai` + `lang="th"`, both visible, **not** swapped by `lang`.

**Display headings that toggle (or EN-only):**

| File:line | Issue |
|-----------|--------|
| `src/pages/public/HomePage.tsx:76-80, 284-301` | Hero h1 **swaps** which language is primary |
| `src/pages/public/BookingPage.tsx:330-331, 437-441` | Title + `.th-sub` **swap** which line is EN vs TH |
| `src/pages/public/WaitlistPage.tsx:92-94, 114-116` | h1/h2 current-lang only |
| `src/pages/public/MyTripPage.tsx:87` | h1 via `t()` — one language |
| `src/components/trips/TestimonialSection.tsx:15-17` | h2 toggled |
| `src/pages/public/LegalSupportPages.tsx:501-507` | 404 h1 + body toggled |
| `src/pages/public/SpotDetailPage.tsx:149-152` | Missing-spot: EN in `font-display` h1, Thai in a `<p>` (close, but Thai not `lang="th"` / `font-serif` sibling via BiDisplayHeading) |
| `src/pages/public/LegalSupportPages.tsx:21, 34, 51, 62, 73, 85, 140, 152, 173, 185, 200, 212` | Terms/Privacy **section h2s English-only** (legal — **not auto-rewritten**) |

Chrome (buttons, badges, form labels) still uses `lang === 'th' ? …` across the app. That is the language toggle, not display-heading. Left alone except where it is an `h1`/`h2`.

Waiver clauses already stack EN then TH — **not touched**.

---

## 6. Payment / security

- **No client write to `booking_payments`.**
- **No client `.update()` on `tour_bookings` payment fields.** Status after Square is `markSquarePaid` (Edge) / `staff-api`.
- `BookingPage.tsx:246` inserts a new booking with `booking_status: 'pending_payment'` (create row after `book_seat`, not a post-payment write). Left as-is (payment flow).
- All `functions/v1/*` fetches in `toursApi.ts` and `callStaffApi` send **both** `apikey` and `Authorization: Bearer <anon>`. No regression of commit `4f409e2`.

**Needs Saen (not a code bug):** `GET square-create-payment` is live **503** `square_not_configured` — Edge secrets `SQUARE_*` still missing. Card form cannot charge until secrets are set. PayID unchanged.

---

## 7. Cron secret

`api/cron/daily.ts:61-62` passes `CRON_SECRET` as **`?secret=`** on the Edge URL.  
`Authorization` on that fetch is the **Supabase JWT** (anon/service), not CRON_SECRET — matches `cron-daily` `authorized()` (Bearer **or** `?secret=`).

Comment in `cron-daily/index.ts:5` still says “Auth: Authorization: Bearer CRON_SECRET” which is **misleading** (function also accepts query). Not changed overnight (docs only).

---

## 8. Accessibility (booking = highest stakes)

- Waiver → booking gate works; checkboxes have bilingual names.
- Booking back control: `BookingPage.tsx:433` `aria-label="Back"` **English-only**; circle likely **&lt; 44px**.
- Trip card favourite: `TripCard.tsx:135` **22×22px** (`h-[22px] w-[22px]`) — below 44px touch target.
- Tiny type (7–9px) on cards/chips — contrast on cream/teal is generally OK; 7px category pills are hard to read (flag, not a full type redesign).
- Keyboard: booking is mostly native `<form>` / `<input>` / `<button>`. Square iframe (when secrets exist) is vendor-controlled.

---

## 9. Mobile 375px

Homepage, `/trips`, `/trips/PSP-1DAY`, waiver: **`scrollWidth === 375`**, no overflow.

Hero hamburger (“Open menu”) appears at this width.

PSP-1DAY hero empty + T2T is the main visual gap, not overflow.

---

## 10. Migration `supabase/migrations/20260805150000_phases_g_to_n.sql`

Re-read in full. **No `DROP` / `drop table` / `drop column`.** Idempotent `IF NOT EXISTS` / `create or replace view` / guarded `DO $$` constraints.

**Adds (not run tonight):**

- `tour_bookings`: `reminder_7d_sent_at`, `reminder_1d_sent_at`, `review_requested_at`, `photos_delivered` (bool default false), `photos_delivered_at`, `gallery_link`, `referred_by_booking_id` (+ indexes)
- `waitlist_entries.notified_at`
- View `public.trip_waitlist` over `waitlist_entries`
- Table `staff_outbound_queue` (RLS on, revoke anon/authenticated) + kind/status checks
- `staff_sessions.ip_address`, `staff_sessions.user_agent`

Header says owner must apply via Dashboard. **Not applied in this session.**

---

## Part 2 plan (safe frontend only)

Will fix after this file is written:

1. Bilingual “Photo coming soon” cover fallback + `onError` (no fake photos)
2. Display headings listed above (not Terms/Privacy/Waiver legal bodies)
3. 44px favourite hit target; bilingual booking Back `aria-label`

**Will not touch:** PayID/Square charge logic, waiver/OSHC text, schema, secrets, push/deploy.
