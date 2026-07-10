-- Trip2Talk V5 — Phase 1 (revised): opaque session tokens instead of custom JWTs
--
-- Why: RLS policies keyed on a custom Supabase JWT claim require signing tokens
-- with the project's real JWT secret, which turned out to be unretrievable
-- (Vercel masks "Sensitive" env vars permanently, no way to view the value that
-- was pasted in months ago). Rather than rotate the project's JWT secret
-- (which would invalidate the live anon/service-role keys currently in use —
-- too risky on a production app), staff auth uses a random opaque session
-- token stored in this table instead. verify-pin mints it; staff-api validates
-- it on every request. Neither depends on Supabase's own JWT secret at all.
--
-- Run once in Supabase Dashboard -> SQL Editor

create table if not exists public.staff_sessions (
  token uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_profiles(id),
  role text not null,
  full_name text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists staff_sessions_expires_at_idx on public.staff_sessions (expires_at);

-- RLS enabled with ZERO grants/policies to anon or authenticated — this table
-- is reachable only via the service-role key inside Edge Functions, which
-- bypasses RLS entirely by design. No API access from the browser, ever.
alter table public.staff_sessions enable row level security;
revoke all on public.staff_sessions from anon;
revoke all on public.staff_sessions from authenticated;

-- Optional cleanup: run manually now and then, or wire to the same pg_cron
-- job as sync_compliance_alerts() if you want it automatic.
create or replace function public.purge_expired_staff_sessions()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.staff_sessions where expires_at < now();
$$;
