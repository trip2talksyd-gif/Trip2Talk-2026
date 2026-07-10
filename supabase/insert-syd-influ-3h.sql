-- Trip #14: Sydney Influencer Photoshoot Package
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)
-- Safe to re-run only if SYD-INFLU-3H does not exist yet

INSERT INTO tours (
  trip_code,
  name_en,
  name_th,
  destination,
  duration_label,
  trip_type,
  price_standard,
  price_private,
  max_pax,
  min_pax,
  current_pax,
  deposit_amount,
  next_date,
  status,
  season,
  aurora_trip
) VALUES (
  'SYD-INFLU-3H',
  'Sydney 5 Best Locations Photoshoot',
  'แพ็กเกจถ่ายภาพอินฟลูเอนเซอร์ซิดนีย์',
  'Sydney',
  '3hrs',
  'oneday',
  680,
  NULL,
  1,
  1,
  0,
  100,
  '2026-08-01',
  'CONFIRMED',
  ARRAY['all seasons'],
  false
);
