-- Owner dashboard insurance_alerts action (staff-api).
-- Table was referenced in staff-api but never created in production migrations.

create table if not exists public.insurance_alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  note text null,
  is_active boolean not null default true,
  expiry_date date null,
  created_at timestamptz not null default now()
);

create index if not exists insurance_alerts_active_expiry_idx
  on public.insurance_alerts (is_active, expiry_date)
  where is_active = true;

alter table public.insurance_alerts enable row level security;
revoke all on public.insurance_alerts from anon, authenticated;

comment on table public.insurance_alerts is
  'Staff-only insurance expiry alerts (service-role via staff-api).';
