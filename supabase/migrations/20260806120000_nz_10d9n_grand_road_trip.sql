-- Grand New Zealand Photo Road Trip (North + South Island) — template listing.
-- No fixed departure date yet: published + null departure_date → public TBA /
-- "Inquire for dates" (not online-bookable until a dated clone is added).
-- Single listed price = Standard Rate (4–6 pax). Private Guarantee is inquire-only text on the trip page.
-- No internal revenue/profit/cost tables in public fields.

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
    'NZ-10D9N',
    'Grand New Zealand Photo Road Trip (10D9N) — North + South Island',
    'ทริปถ่ายภาพใหญ่ New Zealand 10 วัน 9 คืน — เกาะเหนือ + เกาะใต้',
    'Auckland → Christchurch → Queenstown grand photo road trip: Hobbiton, Mt. Taranaki / Pouakai Tarns, Lake Tekapo Milky Way, Aoraki/Mt. Cook, That Wanaka Tree, Milford Sound and Queenstown. Listed Standard Rate for groups of 4–6. Prefer a smaller private group of 2–3? Contact us for private guaranteed departure pricing. Departure dates TBA — inquire to join the next round. Flights and meals not included.',
    'ทริปถ่ายภาพใหญ่ Auckland → Christchurch → Queenstown: Hobbiton Mt. Taranaki / Pouakai Tarns ทางช้างเผือก Lake Tekapo Aoraki/Mt. Cook That Wanaka Tree Milford Sound และ Queenstown ราคามาตรฐานสำหรับกลุ่ม 4–6 ท่าน อยากกลุ่มเล็กส่วนตัว 2–3 ท่าน? ติดต่อเราสำหรับราคา Private Guarantee วันเดินทางยังไม่ประกาศ — สอบถามเพื่อเข้ารอบถัดไป ไม่รวมตั๋วเครื่องบินและอาหาร',
    10,
    9,
    null::date,
    3790::numeric,
    200::numeric,
    6,
    0,
    'published',
    'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/trip-photos/Photos/New%20Zealand/Cover/470182542_10234872686868355_880215646511301034_n.jpg'
  )
) as v(
  trip_code, name_en, name_th, description_en, description_th,
  duration_days, duration_nights, departure_date, price_aud, deposit_aud,
  max_seats, booked_seats, status, cover_image_url
)
where not exists (
  select 1 from public.tours t where t.trip_code = v.trip_code
);
