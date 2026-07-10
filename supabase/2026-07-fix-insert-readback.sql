-- Trip2Talk V5 — fix: insertBooking()/insertWaiverSignature() call
-- .select().single() after .insert() to get the row back (e.g. for the
-- booking id used to redirect/confirm). The RLS lockdown granted INSERT
-- only, so PostgREST can't return a representation -> 401.
--
-- Fix: grant SELECT on a narrow, non-sensitive column set only (id,
-- trip_code, booked_at / signed_at) so the client can confirm success
-- without exposing passport/phone/email/medical_conditions/clauses to
-- anon. Do NOT grant select on all columns.
--
-- Run once in Supabase Dashboard -> SQL Editor (after 2026-07-rls-lockdown.sql
-- and 2026-07-waiver-signatures.sql). Safe to re-run: drops policies first.

-- ─── tour_bookings: allow reading back only inert columns ─────────────────
grant select (id, trip_code, booked_at) on public.tour_bookings to anon;

drop policy if exists "Public read back own-insert-safe columns"
  on public.tour_bookings;

create policy "Public read back own-insert-safe columns"
  on public.tour_bookings
  for select
  to anon
  using (true);

-- ─── waiver_signatures: same pattern ───────────────────────────────────────
grant select (id, trip_code, signed_at) on public.waiver_signatures to anon;

drop policy if exists "Public read back own-insert-safe columns"
  on public.waiver_signatures;

create policy "Public read back own-insert-safe columns"
  on public.waiver_signatures
  for select
  to anon
  using (true);
