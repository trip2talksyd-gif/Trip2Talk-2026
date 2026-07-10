-- Owner dashboard read policies (anon key / PIN gate — no Supabase Auth session)
-- Run in Supabase Dashboard → SQL Editor

alter table public.expenses enable row level security;
alter table public.staff_commission_ledger enable row level security;
alter table public.insurance_alerts enable row level security;

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
