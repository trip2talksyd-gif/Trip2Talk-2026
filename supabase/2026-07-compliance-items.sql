-- Trip2Talk V5 — Phase 4: automate insurance/rego/OSHC expiry alerts
-- Run once in Supabase Dashboard -> SQL Editor
--
-- Design note: this is a plain SQL function + pg_cron schedule, not a second
-- Edge Function — the check is pure "compare dates, upsert a row," which
-- Postgres can do natively without adding more Deno infrastructure on top of
-- Phase 1's verify-pin function. Keeps this phase genuinely fast to ship.
--
-- compliance_items is the source you maintain by hand (rego renewal dates,
-- public liability policy expiry, staff visa/OSHC expiry, etc). The
-- sync_compliance_alerts() function below turns "is anything within 30 days"
-- into rows in the existing insurance_alerts table the Owner Dashboard
-- already reads — no dashboard rewrite needed, just make it run daily.

create table if not exists public.compliance_items (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  item_type text not null,
  expiry_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.insurance_alerts
  add column if not exists source_item_id uuid references public.compliance_items(id);

create unique index if not exists insurance_alerts_source_item_id_key
  on public.insurance_alerts (source_item_id)
  where source_item_id is not null;

-- ─── RLS: zero anon/authenticated access — managed via staff-api only,
--     same pattern as every other protected table ──────────────────────────
alter table public.compliance_items enable row level security;

revoke all on public.compliance_items from anon;
revoke all on public.compliance_items from authenticated;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'compliance_items'
  loop
    execute format('drop policy if exists %I on public.compliance_items', pol.policyname);
  end loop;
end $$;

-- No policies created on purpose: RLS enabled + zero grants = unreachable
-- through PostgREST; sync_compliance_alerts() runs as security definer so
-- pg_cron can still call it regardless.

-- ─── Sync function: upsert alerts for anything expiring within 30 days ─────
create or replace function public.sync_compliance_alerts()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.insurance_alerts (item_name, item_type, expiry_date, is_active, source_item_id)
  select ci.item_name, ci.item_type, ci.expiry_date, true, ci.id
  from public.compliance_items ci
  where ci.is_active
    and ci.expiry_date - current_date <= 30
  on conflict (source_item_id) where source_item_id is not null
  do update set
    item_name = excluded.item_name,
    item_type = excluded.item_type,
    expiry_date = excluded.expiry_date,
    is_active = true;

  -- turn off alerts whose source item was resolved / deactivated / renewed past the window
  update public.insurance_alerts ia
  set is_active = false
  from public.compliance_items ci
  where ia.source_item_id = ci.id
    and (not ci.is_active or ci.expiry_date - current_date > 30);
end;
$$;

-- ─── Schedule: run daily at midnight UTC ───────────────────────────────────
-- If this errors with "extension pg_cron does not exist" and you can't
-- CREATE EXTENSION directly, enable pg_cron from the Dashboard first:
-- Database -> Extensions -> search "pg_cron" -> Enable, then re-run this block.
create extension if not exists pg_cron;

select cron.unschedule('trip2talk-compliance-expiry-check')
where exists (
  select 1 from cron.job where jobname = 'trip2talk-compliance-expiry-check'
);

select cron.schedule(
  'trip2talk-compliance-expiry-check',
  '0 0 * * *',
  $$select public.sync_compliance_alerts();$$
);

-- Run it once now so today's compliance_items rows are reflected immediately
-- (don't wait for the first midnight run):
select public.sync_compliance_alerts();
