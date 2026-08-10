-- Split photo delivery into highlight (1–2 weeks) and full album (30-day hard deadline).
-- Legacy photos_delivered remains: kept in sync when full album is marked (Phase H review cron).

alter table public.tour_bookings
  add column if not exists highlight_photos_delivered boolean not null default false;

alter table public.tour_bookings
  add column if not exists highlight_photos_delivered_at timestamptz null;

alter table public.tour_bookings
  add column if not exists full_photos_delivered boolean not null default false;

alter table public.tour_bookings
  add column if not exists full_photos_delivered_at timestamptz null;

comment on column public.tour_bookings.highlight_photos_delivered is
  'Highlight album delivered (business SLA: within 1–2 weeks of trip end).';

comment on column public.tour_bookings.full_photos_delivered is
  'Full album delivered (business SLA: within 14–30 days of trip end; 30 = hard deadline).';

-- Backfill from legacy single flag (already delivered = both stages done).
update public.tour_bookings
set
  highlight_photos_delivered = true,
  highlight_photos_delivered_at = coalesce(highlight_photos_delivered_at, photos_delivered_at, now()),
  full_photos_delivered = true,
  full_photos_delivered_at = coalesce(full_photos_delivered_at, photos_delivered_at, now())
where photos_delivered = true
  and (
    highlight_photos_delivered = false
    or full_photos_delivered = false
  );

create index if not exists tour_bookings_photos_stages_pending_idx
  on public.tour_bookings (trip_code)
  where cancelled_at is null
    and (
      highlight_photos_delivered = false
      or full_photos_delivered = false
    );
