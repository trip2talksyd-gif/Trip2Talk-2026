-- Trip2Talk V5 — Phase 2: durable audit trail for signed waivers
-- Run once in Supabase Dashboard -> SQL Editor

create table if not exists public.waiver_signatures (
  id uuid primary key default gen_random_uuid(),
  trip_code text not null,
  signed_name text not null,
  signed_at timestamptz not null,
  clauses jsonb not null,
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

create index if not exists waiver_signatures_trip_code_idx on public.waiver_signatures (trip_code);

alter table public.waiver_signatures enable row level security;

-- Public can insert (waiver is signed before login), but never read back —
-- staff reads go through the staff-api Edge Function (service-role key,
-- bypasses RLS) after validating a staff_sessions token, same as every
-- other protected table. No direct authenticated grant needed.
revoke all on public.waiver_signatures from anon;
revoke all on public.waiver_signatures from authenticated;
grant insert on public.waiver_signatures to anon;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'waiver_signatures'
  loop
    execute format('drop policy if exists %I on public.waiver_signatures', pol.policyname);
  end loop;
end $$;

create policy "Public insert waiver signatures"
  on public.waiver_signatures
  for insert
  to anon
  with check (
    trip_code is not null and trip_code <> ''
    and signed_name is not null and length(trim(signed_name)) >= 3
  );
