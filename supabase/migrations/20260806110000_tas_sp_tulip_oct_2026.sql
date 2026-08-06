-- Tasmania Spring Tulip private photo trip — two October 2026 departures.
-- Public fields only (no internal cost/profit figures).
-- Codes follow dated-suffix convention (e.g. ULU-4D3N-SEP26_29).

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
  cover_image_url
)
select * from (values
  (
    'TAS-SP-3D2N-OCT11_13',
    'Tasmania Spring Tulips (Peak Bloom) — Launceston to Hobart',
    'ทริปทิวลิปฤดูใบไม้ผลิแทสเมเนีย (บานเต็มที่) — Launceston ถึง Hobart',
    'Private photo trip (max 5): Launceston → North-West Coast → Hobart. Table Cape tulips, Cradle Mountain, Sheffield, Ross & Richmond Bridges, Mt Wellington and Port Arthur. Flights and meals not included — arrive Launceston before 08:30 Day 1; depart Hobart after 18:30 Day 3.',
    'ทริปถ่ายภาพส่วนตัว (สูงสุด 5 ท่าน): Launceston → ชายฝั่งตะวันตกเฉียงเหนือ → Hobart ทิวลิป Table Cape Cradle Mountain Sheffield สะพาน Ross และ Richmond Mt Wellington และ Port Arthur ไม่รวมตั๋วเครื่องบินและอาหาร — ถึง Launceston ก่อน 08:30 วัน 1 ออกจาก Hobart หลัง 18:30 วัน 3',
    3,
    2,
    '2026-10-11'::date,
    1550::numeric,
    100::numeric,
    5,
    0,
    'published',
    'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/trip-photos/Photos/Tasmania/Cover/728212910_1604105381714557_7801578432892347457_n.jpg'
  ),
  (
    'TAS-SP-3D2N-OCT18_20',
    'Tasmania Spring Tulips (Late Bloom) — Launceston to Hobart',
    'ทริปทิวลิปฤดูใบไม้ผลิแทสเมเนีย (บานช่วงท้าย) — Launceston ถึง Hobart',
    'Private photo trip (max 5): Launceston → North-West Coast → Hobart. Table Cape tulips, Cradle Mountain, Sheffield, Ross & Richmond Bridges, Mt Wellington and Port Arthur. Flights and meals not included — arrive Launceston before 08:30 Day 1; depart Hobart after 18:30 Day 3.',
    'ทริปถ่ายภาพส่วนตัว (สูงสุด 5 ท่าน): Launceston → ชายฝั่งตะวันตกเฉียงเหนือ → Hobart ทิวลิป Table Cape Cradle Mountain Sheffield สะพาน Ross และ Richmond Mt Wellington และ Port Arthur ไม่รวมตั๋วเครื่องบินและอาหาร — ถึง Launceston ก่อน 08:30 วัน 1 ออกจาก Hobart หลัง 18:30 วัน 3',
    3,
    2,
    '2026-10-18'::date,
    1550::numeric,
    100::numeric,
    5,
    0,
    'published',
    'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/trip-photos/Photos/Tasmania/Cover/728212910_1604105381714557_7801578432892347457_n.jpg'
  )
) as v(
  trip_code, name_en, name_th, description_en, description_th,
  duration_days, duration_nights, departure_date, price_aud, deposit_aud,
  max_seats, booked_seats, status, cover_image_url
)
where not exists (
  select 1 from public.tours t where t.trip_code = v.trip_code
);
