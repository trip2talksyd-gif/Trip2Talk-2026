-- DRAFT ONLY — apply after 20260826190000_tours_price_luxury_aud.sql
-- Exact live trip_code matches (anon catalog 2026-08-26).
-- Does not set Luxury on 1-day SKUs or other published rows.

update public.tours
set price_luxury_aud = 3200, luxury_price_aud = 3200
where trip_code = 'MEL-4D3N';

update public.tours
set price_luxury_aud = 3340, luxury_price_aud = 3340
where trip_code = 'ULU-4D3N-SEP26_29';

update public.tours
set price_luxury_aud = 2450, luxury_price_aud = 2450
where trip_code = 'TAS-3D2N';

update public.tours
set price_luxury_aud = 4100, luxury_price_aud = 4100
where trip_code = 'NZ-6D5N-NOV15_20';

update public.tours
set price_luxury_aud = 730, luxury_price_aud = 730
where trip_code = 'CAN-2D1N-SEP5_6';
