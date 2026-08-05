-- Phases G–N schema extensions (combined).
-- DO NOT auto-deploy — owner reviews and applies via Dashboard SQL or CLI.
--
-- G/H: reminder + review tracking columns + staff outbound queue (free-tier
--      notification channel — staff send via Messenger/Gmail deep links)
-- I:   extend waitlist_entries + trip_waitlist view (no duplicate table)
-- J:   photos_delivered fields on tour_bookings
-- K:   referred_by_booking_id
-- N:   staff_sessions login audit (ip / user_agent)

-- ─── G/H tracking on bookings ───────────────────────────────────────────────

alter table public.tour_bookings
  add column if not exists reminder_7d_sent_at timestamptz null;

alter table public.tour_bookings
  add column if not exists reminder_1d_sent_at timestamptz null;

alter table public.tour_bookings
  add column if not exists review_requested_at timestamptz null;

-- ─── J photo delivery ─────────────────────────────────────────────────────

alter table public.tour_bookings
  add column if not exists photos_delivered boolean not null default false;

alter table public.tour_bookings
  add column if not exists photos_delivered_at timestamptz null;

alter table public.tour_bookings
  add column if not exists gallery_link text null;

-- ─── K referral ───────────────────────────────────────────────────────────

alter table public.tour_bookings
  add column if not exists referred_by_booking_id uuid null
    references public.tour_bookings (id) on delete set null;

create index if not exists tour_bookings_referred_by_idx
  on public.tour_bookings (referred_by_booking_id)
  where referred_by_booking_id is not null;

create index if not exists tour_bookings_photos_pending_idx
  on public.tour_bookings (photos_delivered, trip_code)
  where photos_delivered = false;

-- ─── I waitlist notified_at + compatibility view ──────────────────────────
-- Existing table is waitlist_entries (already in production). Add notified_at
-- and expose a trip_waitlist view matching the Phase I naming.

alter table public.waitlist_entries
  add column if not exists notified_at timestamptz null;

create or replace view public.trip_waitlist as
select
  id,
  tour_id as trip_id,
  trip_code,
  name,
  email,
  phone,
  created_at as joined_at,
  notified_at,
  contacted,
  note
from public.waitlist_entries;

comment on view public.trip_waitlist is
  'Compatibility view over waitlist_entries for Phase I naming (trip_waitlist).';

-- ─── G/H outbound queue (staff-facing free-tier "notification channel") ───

create table if not exists public.staff_outbound_queue (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  booking_id uuid null references public.tour_bookings (id) on delete set null,
  waitlist_id uuid null references public.waitlist_entries (id) on delete set null,
  trip_code text null,
  customer_name text null,
  customer_email text null,
  customer_phone text null,
  subject text not null,
  body_en text not null,
  body_th text null,
  deep_link text null,
  messenger_url text null,
  gmail_url text null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  completed_at timestamptz null,
  completed_by text null
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'staff_outbound_queue_kind_check'
  ) then
    alter table public.staff_outbound_queue
      add constraint staff_outbound_queue_kind_check
      check (kind in (
        'trip_reminder_7d',
        'trip_reminder_1d',
        'review_request',
        'waitlist_spot'
      ));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'staff_outbound_queue_status_check'
  ) then
    alter table public.staff_outbound_queue
      add constraint staff_outbound_queue_status_check
      check (status in ('pending', 'done', 'skipped'));
  end if;
end $$;

create index if not exists staff_outbound_queue_pending_idx
  on public.staff_outbound_queue (status, created_at desc)
  where status = 'pending';

alter table public.staff_outbound_queue enable row level security;
revoke all on public.staff_outbound_queue from anon, authenticated;

comment on table public.staff_outbound_queue is
  'Free-tier notification channel: cron enqueues tasks; staff sends via Messenger/Gmail (no paid ESP).';

-- ─── N staff session audit ────────────────────────────────────────────────

alter table public.staff_sessions
  add column if not exists ip_address text null;

alter table public.staff_sessions
  add column if not exists user_agent text null;

comment on column public.staff_sessions.ip_address is
  'Best-effort client IP from verify-pin request headers.';
comment on column public.staff_sessions.user_agent is
  'Best-effort User-Agent from verify-pin request.';
