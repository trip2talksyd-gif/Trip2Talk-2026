# Trip2Talk V7 — Session handoff

**Last updated:** 2026-07-17
**Project path:** `F:\Web PWA_App2026\Trip2Talk\Trip2Talk V7`
**Production:** `trip2-talk-2026.vercel.app` · GitHub `trip2talksyd-gif/Trip2Talk-2026` (branch `main`) · Vercel team `trip2talksyd-3251` (separate account, not reachable via this session's Vercel MCP) · Supabase project `bljhnelgmkulxwuhedbi` ("trip2talk-official", org `trip2talksyd-gif's Org`)

This file supersedes the old V5 handoff notes (V5/V6 folders are not the live codebase — V7 is).

---

## ✅ Done today (2026-07-17)

1. **Booking/seat-reservation system** — root cause was a migration (`20260711132000_fix_release_seat_type.sql`) that was written but never actually run against production. Applied it in 3 chunks via SQL Editor. Verified with a real live test booking.
2. **Calendar page redesign** — new `CalendarPhotographerBanner` component + photo-card trip grid, highlighting "every trip includes a photographer + wardrobe/styling." `CalendarValueProps` comparison section was added then **removed again per explicit user feedback** ("ตัดตรงนี้ออกพี่ไม่ชอบ") — do not re-add without asking.
3. **Trips page oneday/overnight filter showing empty** — confirmed NOT a bug. All 7 live tours are 3+ days; no oneday/overnight tours have been created yet.
4. **Staff PIN login was fully broken, multiple compounding causes, all found live via Chrome console + fixed one by one:**
   - `pgcrypto` extension existed but was installed in the `extensions` schema, not visible to `verify_staff_pin`'s `search_path = public`. Fixed via `alter function public.verify_staff_pin(text) set search_path = public, extensions;` (also ran `create extension if not exists pgcrypto;` first).
   - Seeded real staff PINs into `staff_profiles` (owner PIN `4444`, manager PIN `9999` — **change these before going live for real, they were sent in plaintext during this session**).
   - `staff-api` Edge Function had never been deployed to production at all (only existed in the repo). Deployed via Supabase Dashboard → Edge Functions → Via Editor (pasted `supabase/functions/staff-api/index.ts`).
   - **Deeper architecture bug**: the frontend's login flow called the `verify_staff_pin` RPC (PIN check only, returns no session) and then sent the raw `staff_id` to `staff-api` pretending it was a session token. `staff_sessions` was never populated, so every `staff-api` call 401'd regardless of PIN correctness. Fixed by rewriting `verifyStaffPin()` in `src/lib/toursApi.ts` to call the `verify-pin` Edge Function instead (which bcrypt-verifies the PIN server-side AND mints a real opaque token in `staff_sessions`). Updated `src/lib/supabaseStaff.ts` and `src/pages/app/PinGatePage.tsx` to match. Committed + pushed (`dcbed2a`).
   - `verify-pin` Edge Function also had never been deployed — deployed it, and had to turn **off** "Verify JWT with legacy secret" (was ON by default, blocked the request before it reached the function code since the frontend doesn't send an Authorization header).
   - `staff_sessions` table itself had never been created in production (same pattern as everything else this session — SQL written in the repo, never actually run). Ran `supabase/2026-07-staff-sessions.sql` content directly in SQL Editor + `notify pgrst, 'reload schema';`.

## ⚠️ Not fully confirmed yet — pick up here next session

After all the above fixes, PIN login succeeds and lands on Staff/Owner Dashboard correctly (confirmed staff role shows right). But `staff-api` calls (loading actual booking/expense data on Owner Dashboard) were **still returning 401** in the last check. Was mid-debugging when the session ended — most likely a **stale token in `sessionStorage`** left over from before the fix deployed (user was told to log out via "← PIN" and log back in with a fresh PIN entry, to get a session token minted by the *new* code — outcome not yet confirmed).

**Next step:** have the user (or drive via Chrome tooling) log out fully, PIN back in fresh, and check whether Owner Dashboard now loads booking/expense data without 401. If still 401, check Network tab → the `staff-api` POST request payload's `token` value, and cross-check it exists as a row in `staff_sessions` (Table Editor).

---

## 🔑 Recurring pattern to remember for this repo

**Nothing in `supabase/*.sql` or `supabase/functions/*` is live until someone manually runs/deploys it.** This repo has repeatedly had migrations and Edge Functions fully written and committed to git, referenced by working frontend code, and simply never applied to the actual production Supabase project. When something "should work" per the code but fails live, check first: (1) does the SQL in `supabase/migrations/` or `supabase/*.sql` actually match what's live (SQL Editor), (2) does the Edge Function in `supabase/functions/*` actually appear under Edge Functions in the dashboard, (3) for any Edge Function, is "Verify JWT with legacy secret" set correctly (should be OFF for all of ours — we do custom auth in-function).

## 🔧 Environment quirks (this sandbox specifically)

- The mounted filesystem intermittently corrupts writes to this folder — either truncates a file mid-write or appends trailing null bytes. Always verify a file's byte count / null-byte count after Write or Edit tool calls on this repo, especially for larger files. The most reliable write method found was `cat > file << 'EOF' ... EOF` via bash, not the Write/Edit tools.
- `.git/*.lock` files frequently can't be `rm`'d (`Operation not permitted`) but can always be `mv`'d out of the way — do this before every git command that failed with a lock error.
- No git credentials in the sandbox — cannot `git push` directly. Push via the user's own machine: **Cursor** (already logged into the correct `trip2talksyd-gif` GitHub account) → Source Control panel → "Sync Changes". GitHub Desktop on this machine is signed into `chapter99info-cell` instead (correct for the Chapter99 repo, wrong for this one) — don't use GitHub Desktop for this repo unless the signed-in account changes.
- This session's browser automation (Claude in Chrome) was, at various points, logged into Supabase as `chapter99info-cell` (wrong account, only sees Chapter99 projects) even though the user's own tabs were logged in as `trip2talksyd-gif`. Always verify which org/project is active before assuming a dashboard action will land in the right place — when in doubt, ask the user to do dashboard actions themselves in their own already-authenticated tab.
