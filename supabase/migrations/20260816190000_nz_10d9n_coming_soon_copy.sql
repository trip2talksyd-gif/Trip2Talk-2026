-- Align NZ-10D9N (already the Grand North + South Island template) with the
-- Facebook announcement: new public names, interest-gathering copy, still
-- published + null departure_date (browsable Coming soon, not online-bookable).
-- price_aud stays NOT NULL internally; public UI hides it until a dated clone exists.
-- Do not duplicate as NZ-NS-10D9N.

update public.tours
set
  name_en = 'Grand New Zealand Photo Road Trip — North & South Island',
  name_th = 'ปสานฝัน! นิวซีแลนด์ เหนือ-ใต้ 10 วันเต็ม',
  description_en = 'Private photo road trip, 4–6 people, 10 days / 9 nights. Fly into Auckland, depart Queenstown. Hobbiton, Mt. Taranaki, Lake Tekapo Milky Way, Aoraki/Mt. Cook, Milford Sound. Dates and public price TBA — gathering interest to vote on season. Inquire to join the waitlist. Flights and meals not included. Standard stay is shared dorm / backpacker-motel; private-room upgrade extra.',
  description_th = 'ทริปถ่ายภาพกลุ่มส่วนตัว 4–6 คน 10 วัน 9 คืน บินเข้า Auckland ออก Queenstown: Hobbiton Mt. Taranaki ทางช้างเผือก Lake Tekapo Aoraki/Mt. Cook และ Milford Sound วันเดินทางและราคารอประกาศ — กำลังรวบรวมความสนใจเพื่อโหวตซีซัน สอบถามเพื่อเข้า waitlist ไม่รวมตั๋วเครื่องบินและอาหาร ที่พักมาตรฐานห้องรวม / Backpackers-Motel อัปเกรดห้องส่วนตัวมีค่าใช้จ่ายเพิ่ม',
  duration_days = 10,
  duration_nights = 9,
  departure_date = null,
  max_seats = 6,
  status = 'published'
where trip_code = 'NZ-10D9N';

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
    'Grand New Zealand Photo Road Trip — North & South Island',
    'ปสานฝัน! นิวซีแลนด์ เหนือ-ใต้ 10 วันเต็ม',
    'Private photo road trip, 4–6 people, 10 days / 9 nights. Fly into Auckland, depart Queenstown. Hobbiton, Mt. Taranaki, Lake Tekapo Milky Way, Aoraki/Mt. Cook, Milford Sound. Dates and public price TBA — gathering interest to vote on season. Inquire to join the waitlist. Flights and meals not included. Standard stay is shared dorm / backpacker-motel; private-room upgrade extra.',
    'ทริปถ่ายภาพกลุ่มส่วนตัว 4–6 คน 10 วัน 9 คืน บินเข้า Auckland ออก Queenstown: Hobbiton Mt. Taranaki ทางช้างเผือก Lake Tekapo Aoraki/Mt. Cook และ Milford Sound วันเดินทางและราคารอประกาศ — กำลังรวบรวมความสนใจเพื่อโหวตซีซัน สอบถามเพื่อเข้า waitlist ไม่รวมตั๋วเครื่องบินและอาหาร ที่พักมาตรฐานห้องรวม / Backpackers-Motel อัปเกรดห้องส่วนตัวมีค่าใช้จ่ายเพิ่ม',
    10,
    9,
    null::date,
    0::numeric,
    200::numeric,
    6,
    0,
    'published',
    null::text
  )
) as v(
  trip_code, name_en, name_th, description_en, description_th,
  duration_days, duration_nights, departure_date, price_aud, deposit_aud,
  max_seats, booked_seats, status, cover_image_url
)
where not exists (
  select 1 from public.tours t where t.trip_code = v.trip_code
);
