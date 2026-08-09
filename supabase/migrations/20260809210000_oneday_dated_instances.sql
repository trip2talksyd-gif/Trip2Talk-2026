-- Split bare one-day SKUs (…-1DAY / …-1D) into:
--   1) dated bookable instances (day-window suffix, e.g. KIA-1DAY-OCT1_1)
--   2) non-bookable template rows kept under the bare code for CMS / Trip Manager clone source
--
-- Why not rename in place:
--   - trip_code is UNIQUE and used as the CMS template key (tripDetails, packing, risks,
--     gallery prefix maps, photo-spot soft-sell, Trip Manager templateTripCode).
--   - tour_bookings.tour_id references tours(id) ON DELETE CASCADE; SYD-1DAY already has
--     booked_seats > 0, so the bookable row must keep those seats under a new code while
--     bookings are remapped.
--   - isGenericOneDaySku() correctly rejects bare -1DAY/-1D; dated siblings pass through.
--
-- Audit (live catalog at write time): three published bare SKUs with departure dates and
-- NO dated siblings — KIA-1DAY (2026-10-01), SYD-1DAY (2026-08-01), PSP-1DAY (2026-09-01).
-- Codes match deriveDatedTripCode(base, departure_date, 1).
--
-- Single transaction: insert → remap dependents → demote templates.
-- If any step fails, the whole migration rolls back (no half-migrated bookings).

begin;

-- ---------------------------------------------------------------------------
-- 1) Insert dated instances (clone from bare template row; copy seat counts)
-- ---------------------------------------------------------------------------
insert into public.tours (
  trip_code,
  name_en,
  name_th,
  description_en,
  description_th,
  duration_days,
  duration_nights,
  departure_date,
  price_aud,
  deposit_aud,
  max_seats,
  booked_seats,
  status,
  cover_image_url,
  itinerary
)
select
  v.dated_code,
  t.name_en,
  t.name_th,
  t.description_en,
  t.description_th,
  t.duration_days,
  t.duration_nights,
  t.departure_date,
  t.price_aud,
  t.deposit_aud,
  t.max_seats,
  t.booked_seats,
  t.status,
  t.cover_image_url,
  t.itinerary
from (
  values
    ('KIA-1DAY', 'KIA-1DAY-OCT1_1'),
    ('SYD-1DAY', 'SYD-1DAY-AUG1_1'),
    ('PSP-1DAY', 'PSP-1DAY-SEP1_1')
) as v(template_code, dated_code)
join public.tours t on t.trip_code = v.template_code
where t.departure_date is not null
  and not exists (
    select 1 from public.tours x where x.trip_code = v.dated_code
  );

-- ---------------------------------------------------------------------------
-- 2) Remap dependent rows from template → dated instance
-- ---------------------------------------------------------------------------
-- Bookings (tour_id + trip_code)
update public.tour_bookings b
set
  tour_id = inst.id,
  trip_code = inst.trip_code
from public.tours tmpl
join (
  values
    ('KIA-1DAY', 'KIA-1DAY-OCT1_1'),
    ('SYD-1DAY', 'SYD-1DAY-AUG1_1'),
    ('PSP-1DAY', 'PSP-1DAY-SEP1_1')
) as v(template_code, dated_code) on tmpl.trip_code = v.template_code
join public.tours inst on inst.trip_code = v.dated_code
where b.tour_id = tmpl.id
   or b.trip_code = tmpl.trip_code;

-- Waivers (trip_code only when column exists)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'waiver_signatures'
      and column_name = 'trip_code'
  ) then
    update public.waiver_signatures w
    set trip_code = v.dated_code
    from (
      values
        ('KIA-1DAY', 'KIA-1DAY-OCT1_1'),
        ('SYD-1DAY', 'SYD-1DAY-AUG1_1'),
        ('PSP-1DAY', 'PSP-1DAY-SEP1_1')
    ) as v(template_code, dated_code)
    where w.trip_code = v.template_code;
  end if;
end $$;

-- Expenses linked by trip_code (nullable)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'expenses'
      and column_name = 'trip_code'
  ) then
    update public.expenses e
    set trip_code = v.dated_code
    from (
      values
        ('KIA-1DAY', 'KIA-1DAY-OCT1_1'),
        ('SYD-1DAY', 'SYD-1DAY-AUG1_1'),
        ('PSP-1DAY', 'PSP-1DAY-SEP1_1')
    ) as v(template_code, dated_code)
    where e.trip_code = v.template_code;
  end if;
end $$;

-- Waitlist entries (if table present)
do $$
begin
  if to_regclass('public.waitlist_entries') is not null then
    update public.waitlist_entries w
    set trip_code = v.dated_code
    from (
      values
        ('KIA-1DAY', 'KIA-1DAY-OCT1_1'),
        ('SYD-1DAY', 'SYD-1DAY-AUG1_1'),
        ('PSP-1DAY', 'PSP-1DAY-SEP1_1')
    ) as v(template_code, dated_code)
    where w.trip_code = v.template_code;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3) Demote bare codes to non-bookable templates
--    (clear departure_date + reset seats; keep row for CMS / clone source)
-- ---------------------------------------------------------------------------
update public.tours t
set
  departure_date = null,
  booked_seats = 0,
  updated_at = now()
where t.trip_code in ('KIA-1DAY', 'SYD-1DAY', 'PSP-1DAY')
  and exists (
    select 1
    from (
      values
        ('KIA-1DAY', 'KIA-1DAY-OCT1_1'),
        ('SYD-1DAY', 'SYD-1DAY-AUG1_1'),
        ('PSP-1DAY', 'PSP-1DAY-SEP1_1')
    ) as v(template_code, dated_code)
    where v.template_code = t.trip_code
      and exists (select 1 from public.tours x where x.trip_code = v.dated_code)
  );

commit;
