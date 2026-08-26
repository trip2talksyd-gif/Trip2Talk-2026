-- DRAFT ONLY — do not apply until 20260826140000_tours_luxury_price_aud.sql
-- has been run on bljhnelgmkulxwuhedbi.
-- Exact trip_code matches only. Live check 2026-08-26 (anon, published rows).
--
-- MATCHED:
--   MEL-4D3N              published  price_aud 1550
--   ULU-4D3N              published  price_aud 1690
--   TAS-3D2N              published  price_aud 1350
--   NZ-10D9N              published  price_aud 3790  departure_date NULL (UI TBA)
--   NZ-6D5N-NOV           published  price_aud 2350
--   NZ-6D5N-NOV15_20      published  price_aud 2350
--
-- NO EXACT ROW (not updated):
--   NZ-6D5N               template code does not exist as its own tours row
--   TAS-LH-4D3N           no row; do NOT use TAS-LH-3D2N-WIN / TAS-LH-3D2N-DEC

update public.tours set luxury_price_aud = 2900 where trip_code = 'MEL-4D3N';
update public.tours set luxury_price_aud = 3040 where trip_code = 'ULU-4D3N';
update public.tours set luxury_price_aud = 2250 where trip_code = 'TAS-3D2N';
update public.tours set luxury_price_aud = 6100 where trip_code = 'NZ-10D9N';

-- NZ-6D5N package: no `NZ-6D5N` row. Same 3600 on both Nov published clones.
update public.tours set luxury_price_aud = 3600
where trip_code in ('NZ-6D5N-NOV', 'NZ-6D5N-NOV15_20');

-- TAS-LH-4D3N: skipped — no matching live trip_code.
