-- Audit log for staff "Edit Waiver" (typos / contact / opt-out only).
-- Does not store legal consent fields. DO NOT auto-apply — review in SQL Editor.

create table if not exists public.waiver_detail_edits (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid null references public.tour_bookings (id) on delete set null,
  waiver_signature_id uuid null,
  changes jsonb not null default '{}'::jsonb,
  edited_by_staff_id uuid null references public.staff_profiles (id) on delete set null,
  edited_by_staff_name text null,
  edited_by_role text null,
  edited_at timestamptz not null default now()
);

create index if not exists waiver_detail_edits_booking_id_idx
  on public.waiver_detail_edits (booking_id);

create index if not exists waiver_detail_edits_edited_at_idx
  on public.waiver_detail_edits (edited_at desc);

alter table public.waiver_detail_edits enable row level security;
-- Service role (staff-api) only.

comment on table public.waiver_detail_edits is
  'Staff edits to non-consent waiver/contact fields (old vs new). Agreed-terms checklist is never written here as an edit target.';
