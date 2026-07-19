-- Update ULU-4D3N listing fields for Trips list / Trip Detail.
-- Production tours table uses legacy columns (next_date / price_standard / max_pax / deposit_amount).
-- Also sets V7-aligned aliases if those columns exist.
-- Safe to re-run.

update public.tours
set
  name_en = 'Uluru–Kata Tjuta Outback Photo Trip (4 Days 3 Nights)',
  name_th = 'ทริปถ่ายภาพ 4 วัน 3 คืน: ดินแดน Outback อุลูรู',
  destination = coalesce(destination, 'Uluru'),
  -- listing / booking numbers
  next_date = '2026-09-20',
  price_standard = 1690,
  deposit_amount = 100,
  max_pax = 5,
  min_pax = 4
where trip_code = 'ULU-4D3N';

-- V7 column names (no-op if columns do not exist on this project)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tours' and column_name = 'departure_date'
  ) then
    update public.tours
    set departure_date = '2026-09-20'
    where trip_code = 'ULU-4D3N';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tours' and column_name = 'price_aud'
  ) then
    update public.tours
    set price_aud = 1690
    where trip_code = 'ULU-4D3N';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tours' and column_name = 'deposit_aud'
  ) then
    update public.tours
    set deposit_aud = 100
    where trip_code = 'ULU-4D3N';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tours' and column_name = 'max_seats'
  ) then
    update public.tours
    set max_seats = 5
    where trip_code = 'ULU-4D3N';
  end if;
end $$;
