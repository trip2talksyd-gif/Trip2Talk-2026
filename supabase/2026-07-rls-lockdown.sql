-- Trip2Talk V5 — Phase 1 step 2 (revised): lock every staff-only table down to
-- zero anon/authenticated access. All staff reads/writes now go through the
-- staff-api Edge Function, which uses the service-role key (bypasses RLS by
-- design) after validating the caller's session token against
-- staff_sessions. Nothing outside an Edge Function can reach these tables.
--
-- Run once in Supabase Dashboard -> SQL Editor, AFTER verify-pin and
-- staff-api are deployed and you've confirmed staff can log in and load
-- their dashboards through them — flipping this first will just look like
-- everything is broken with no way to tell why.
--
-- Supersedes: apply-all-policies.sql, rls-booking-insert.sql, rls-owner-dashboard-read.sql

-- ─── tour_bookings: public can still insert (booking form has no login);
--     select/update now go through staff-api only ───────────────────────────
alter table public.tour_bookings enable row level security;

revoke select, update on public.tour_bookings from anon;
revoke all on public.tour_bookings from authenticated;
grant insert on public.tour_bookings to anon;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'tour_bookings'
  loop
    execute format('drop policy if exists %I on public.tour_bookings', pol.policyname);
  end loop;
end $$;

create policy "Public insert bookings"
  on public.tour_bookings
  for insert
  to anon
  with check (true);

-- ─── expenses / staff_commission_ledger / insurance_alerts / compliance_items:
--     zero anon/authenticated access — staff-api only ──────────────────────
alter table public.expenses enable row level security;
alter table public.staff_commission_ledger enable row level security;
alter table public.insurance_alerts enable row level security;

revoke all on public.expenses from anon;
revoke all on public.expenses from authenticated;
revoke all on public.staff_commission_ledger from anon;
revoke all on public.staff_commission_ledger from authenticated;
revoke all on public.insurance_alerts from anon;
revoke all on public.insurance_alerts from authenticated;

do $$
declare pol record; t text;
begin
  foreach t in array array['expenses', 'staff_commission_ledger', 'insurance_alerts']
  loop
    for pol in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
  end loop;
end $$;

-- ─── staff_profiles: nobody via the API, not even authenticated — only the
--     verify-pin Edge Function (service-role key) can read it ─────────────
alter table public.staff_profiles enable row level security;

revoke all on public.staff_profiles from anon;
revoke all on public.staff_profiles from authenticated;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'staff_profiles'
  loop
    execute format('drop policy if exists %I on public.staff_profiles', pol.policyname);
  end loop;
end $$;

-- No policies created on purpose: RLS enabled + zero grants = unreachable
-- through PostgREST entirely, for every table above.
