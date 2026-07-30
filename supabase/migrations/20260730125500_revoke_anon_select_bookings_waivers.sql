-- Option C: remove anon SELECT on guest PII tables (insert-only for anon).
-- Keep B: My Trip continues via lookup-my-trip Edge Function (service role) — unchanged.
-- Do NOT drop INSERT policies. Do NOT touch authenticated policies.

-- ---------------------------------------------------------------------------
-- tour_bookings — drop every known anon SELECT policy variant
-- ---------------------------------------------------------------------------
drop policy if exists "anon can read own booking after insert"
  on public.tour_bookings;

drop policy if exists "anon read back safe booking columns"
  on public.tour_bookings;

drop policy if exists "Public read back own-insert-safe columns"
  on public.tour_bookings;

drop policy if exists "Public read tour_bookings"
  on public.tour_bookings;

-- ---------------------------------------------------------------------------
-- waiver_signatures — drop every known anon SELECT policy variant
-- ---------------------------------------------------------------------------
drop policy if exists "anon can read own waiver signature after insert"
  on public.waiver_signatures;

drop policy if exists "anon read back safe waiver columns"
  on public.waiver_signatures;

-- ---------------------------------------------------------------------------
-- Revoke table-level SELECT (and residual column-level SELECT grants)
-- ---------------------------------------------------------------------------
revoke select on public.tour_bookings from anon;
revoke select (id, trip_code, booked_at) on public.tour_bookings from anon;

revoke select on public.waiver_signatures from anon;
revoke select (id, trip_code, signed_at) on public.waiver_signatures from anon;

comment on table public.tour_bookings is
  'การจอง - anon insert ได้อย่างเดียว; guest readback ปิดแล้ว — My Trip ใช้ lookup-my-trip';

comment on table public.waiver_signatures is
  'ลายเซ็น waiver - anon insert ได้อย่างเดียว; ไม่มี anon SELECT readback';
