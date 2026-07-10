-- Public booking insert (anon key — no Supabase Auth session)
-- Run in Supabase Dashboard → SQL Editor BEFORE enabling live bookings
-- Or run supabase/apply-all-policies.sql for booking + dashboard policies together.

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
