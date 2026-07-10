# Trip2Talk V5 — Session handoff

**Last updated:** 2026-07-05 (before shutdown)  
**Project path:** `F:\Web PWA_App2026\Trip2Talk\Trip2talk V5`  
**Production:** `trip2talk-v5-app.vercel.app` · GitHub `chapter99solutions-web/trip2talk-v5-app` · Supabase ref `xwdtjwzjkqunewxjpimm`

---

## ✅ Done

1. **401 on booking/waiver submit (DB side)** — Migration `supabase/2026-07-fix-insert-readback.sql` created and **run in Supabase SQL Editor**. Grants column-level `SELECT` on safe columns (`tour_bookings`: id, trip_code, booked_at; `waiver_signatures`: id, trip_code, signed_at) + RLS select policies for `anon`. Verified with `has_table_privilege` — DB grants look correct.
2. **TripPricingCard** — Dark studio-rate card on trip detail page (price standard/private display, checklist, deposit/date/seats, TripBookButton). Deployed.
3. **TripCard restyle** — Studio-rate pricing section on `/trips` list cards. Deployed.
4. **PinGatePage** — Aurora background + liquid-glass UI. Deployed.
5. **Calendar page** — Liquid-glass/gold theme applied (see note below on CalendarValueProps).

---

## ❌ Blocker — still broken in production

**`/trips` and booking flow show "เกิดข้อผิดพลาด" (generic error)** despite:

- RLS/grants confirmed correct in Supabase (`has_table_privilege`)
- Vercel redeploy **without build cache** × 2
- **Not yet tried:** delete and recreate `VITE_SUPABASE_ANON_KEY` in Vercel

**Most likely cause:** `VITE_SUPABASE_ANON_KEY` in Vercel is wrong/corrupted (shows "Updated just now" when inspected — was touched earlier for unknown reason). Sensitive flag hides the value; cannot compare to Supabase without re-pasting.

**Secondary checks if anon key fix fails:**

- Browser: Clear site data via padlock icon on URL (faster than DevTools)
- Vercel rollback: Deployments → find last known-good deployment → Promote to Production → fix root cause separately
- Client code: `insertBooking()` / `fetchAllTours()` in `src/lib/toursApi.ts` — `.select()` after insert may still request all columns; column grants only allow safe subset (may need `.select('id,trip_code,booked_at')` explicitly)
- `src/lib/supabase.ts` graceful fallback when env missing — confirm production bundle actually has env vars (not empty client)

---

## 🔜 Next session — do in order

1. **Vercel** (`chapter99solutions-6839s-projects` → `trip2talk-v5-app`):
   - Delete `VITE_SUPABASE_ANON_KEY`
   - Create new → paste **Legacy anon key** from Supabase (`Trip2Talk_V5_Operations` → Settings → API → Copy button, do not type manually)
   - Confirm `VITE_SUPABASE_URL` = `https://xwdtjwzjkqunewxjpimm.supabase.co`
   - Redeploy **without cache**
2. Hard refresh / clear site data → test `/trips`, waiver, booking submit
3. If still broken → **rollback** Vercel to last working deployment, then debug with Network tab (Supabase request status + response body)
4. If 401 persists after good key → check whether app needs `.select('id,trip_code,booked_at')` instead of `.select()` on insert

---

## 📝 Repo notes (code vs memory)

| Topic | Status |
|-------|--------|
| `2026-07-fix-insert-readback.sql` | Exists locally; **not committed** to git yet (as of last check) |
| CalendarValueProps | User wanted section removed; repo **re-added** it with branded liquid-glass in commit `2133bbe`. Remove again if still unwanted. |
| `git remote` | Must be `chapter99solutions-web/trip2talk-v5-app` before push |

---

## Infra pointer

Canonical infra rules: `.cursor/rules/trip2talk-v5-infra.mdc` (always applied).  
This file (`MEMORY.md`) holds **session status / handoff** only — update at end of each working session.
