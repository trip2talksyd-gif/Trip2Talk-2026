-- Trip2Talk V5 — run once in Supabase Dashboard → SQL Editor
-- Enables public booking inserts + owner dashboard reads (anon key, no Auth session)

-- ─── tour_bookings: public insert + read ───────────────────────────────────
alter table public.tour_bookings enable row level security;

grant insert, select on public.tour_bookings to anon;

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

create policy "Public read tour_bookings"
  on public.tour_bookings
  for select
  to anon
  using (true);

-- ─── Owner dashboard reads ─────────────────────────────────────────────────
alter table public.expenses enable row level security;
alter table public.staff_commission_ledger enable row level security;
alter table public.insurance_alerts enable row level security;

grant select on public.expenses to anon;
grant select on public.staff_commission_ledger to anon;
grant select on public.insurance_alerts to anon;

drop policy if exists "Public read expenses" on public.expenses;
create policy "Public read expenses"
  on public.expenses
  for select
  to anon
  using (true);

drop policy if exists "Public read commission" on public.staff_commission_ledger;
create policy "Public read commission"
  on public.staff_commission_ledger
  for select
  to anon
  using (true);

drop policy if exists "Public read insurance public" on public.insurance_alerts;
create policy "Public read insurance public"
  on public.insurance_alerts
  for select
  to anon
  using (true);
