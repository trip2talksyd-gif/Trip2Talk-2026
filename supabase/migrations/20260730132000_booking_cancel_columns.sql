-- Soft-cancel columns for tour_bookings — never delete rows on cancel.
-- Staff cancel via staff-api action cancel_booking; keeps tax/audit history.

alter table public.tour_bookings
  add column if not exists cancelled_at timestamptz null;

alter table public.tour_bookings
  add column if not exists cancelled_by text null;

alter table public.tour_bookings
  add column if not exists cancel_reason text null;

comment on column public.tour_bookings.cancelled_at is
  'When staff soft-cancelled this booking; null = active.';
comment on column public.tour_bookings.cancelled_by is
  'Staff full_name (or id) who cancelled.';
comment on column public.tour_bookings.cancel_reason is
  'Optional free-text reason entered at cancel time.';
