-- OWNER overrides of tours.max_seats (e.g. one extra seat for a named customer).
-- staff-api writes via service role; no anon/authenticated grants.

create table if not exists public.trip_capacity_changes (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  old_max_seats int not null,
  new_max_seats int not null,
  reason text not null,
  changed_by uuid null references public.staff_profiles (id) on delete set null,
  changed_by_name text null,
  changed_by_role text null,
  changed_at timestamptz not null default now(),
  constraint trip_capacity_changes_reason_nonempty check (char_length(btrim(reason)) >= 8)
);

create index if not exists trip_capacity_changes_tour_id_idx
  on public.trip_capacity_changes (tour_id, changed_at desc);

alter table public.trip_capacity_changes enable row level security;

comment on table public.trip_capacity_changes is
  'Audit log when OWNER changes tours.max_seats after publish. Service role / staff-api only.';
comment on column public.trip_capacity_changes.reason is
  'Required short note, e.g. extra seat for a named customer.';
comment on column public.trip_capacity_changes.changed_by is
  'staff_profiles.id of the owner who saved the change.';
comment on column public.trip_capacity_changes.changed_by_name is
  'Staff full_name snapshot at change time (survives profile edits).';
