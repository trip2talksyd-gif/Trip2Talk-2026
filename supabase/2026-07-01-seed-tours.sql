-- Trip2Talk V5 — re-seed the 13 tours from the Master Trip Dataset
-- Run AFTER 2026-07-00-base-schema.sql, before or after insert-syd-influ-3h.sql
-- Safe to re-run: skips rows that already exist by trip_code.

insert into public.tours (trip_code, name_en, name_th, destination, duration_label, trip_type, price_standard, price_private, max_pax, min_pax, current_pax, deposit_amount, next_date, status, season, aurora_trip)
select * from (values
  ('MEL-4D3N', 'Victoria Photo Trip: Sydney to Melbourne', 'ทริปถ่ายภาพ 4 วัน 3 คืน: จากซิดนีย์สู่เมลเบิร์น', 'Melbourne', '4D3N', 'multiday', 1550::numeric, 2300::numeric, 5, 4, 0, 100::numeric, '2026-02-22'::date, 'CONFIRMED', array['all seasons'], false),
  ('ULU-4D3N', 'Uluru–Kata Tjuta Outback Photo Trip (4 Days 3 Nights)', 'ทริปถ่ายภาพ 4 วัน 3 คืน: ดินแดน Outback อุลูรู', 'Uluru', '4D3N', 'multiday', 1690::numeric, null, 5, 4, 0, 100::numeric, '2026-09-20'::date, 'CONFIRMED', array['all seasons'], true),
  ('NZ-6D5N', 'New Zealand South Island Photo Road Trip', 'ทริปถ่ายภาพนิวซีแลนด์เกาะใต้ 6 วัน', 'New Zealand', '6D5N', 'multiday', 2300::numeric, null, 5, 4, 0, 100::numeric, '2026-04-12'::date, 'CONFIRMED', array['all seasons'], false),
  ('TAS-3D2N', 'Tasmania Mini Aurora Hunt (Hobart)', 'ทริปพร้อมช่างภาพ สัมผัสประวัติศาสตร์ ศิลปะ และตามล่าแสงใต้เมือง Hobart', 'Tasmania', '3D2N', 'overnight', 1350::numeric, 1600::numeric, 6, 4, 0, 100::numeric, '2026-03-16'::date, 'CONFIRMED', array['all seasons'], true),
  ('TAS-LH-4D3N', 'Tasmania Summer: Launceston - Hobart', 'ทริปพร้อมช่างภาพ สัมผัสประวัติศาสตร์ ศิลปะ และตามล่าแสงใต้', 'Tasmania', '4D3N', 'multiday', 1650::numeric, 1850::numeric, 6, 4, 0, 100::numeric, '2026-03-18'::date, 'CONFIRMED', array['summer'], true),
  ('KIA-1DAY', 'Sydney - Kiama One Day Photo Trip', 'ทริปถ่ายภาพวันเดียว ซิดนีย์ - คิอามา', 'Kiama', '1 Day', 'oneday', 250::numeric, null, 4, 4, 0, 100::numeric, null, 'CONFIRMED', array['winter'], false),
  ('CAN-2D1N', 'Cowra & Canowindra Canola Fields Photo Trip', 'ทริปถ่ายภาพทุ่งคาโนล่า 2 วัน 1 คืน', 'Cowra & Canowindra', '2D1N', 'overnight', 380::numeric, null, 4, 4, 0, 100::numeric, '2026-10-05'::date, 'CONFIRMED', array['spring'], false),
  ('SYD-1DAY', 'One Day Trip in Sydney & Photoshoot Packages', 'แพ็กเกจทริปถ่ายภาพซิดนีย์ 1 วันเต็ม', 'Sydney', '1 Day', 'oneday', 250::numeric, null, 4, 4, 0, 100::numeric, null, 'CONFIRMED', array['all seasons'], false),
  ('PSP-1DAY', 'Sydney - Port Stephens One Day Photo Trip', 'ทริปถ่ายภาพวันเดียว ซิดนีย์ - พอร์ตสเตเฟนส์', 'Port Stephens', '1 Day', 'oneday', 260::numeric, null, 6, 4, 0, 100::numeric, null, 'CONFIRMED', array['all seasons'], false),
  ('SYD-MW-WIN', 'Sydney Milky Way Hunt', 'ทริปถ่ายภาพตามล่าทางช้างเผือกใกล้ซิดนีย์', 'Sydney', 'Evening', 'oneday', 120::numeric, null, 6, 4, 0, 100::numeric, null, 'CONFIRMED', array['winter'], false),
  ('LAV-ANB-1D', 'Lavender Farm & Anna Bay One Day Trip', 'One Day Trip ถ่ายรูปสุดปัง! Lavender Farm & Anna Bay', 'Anna Bay', '1 Day', 'oneday', 299::numeric, null, 4, 4, 0, 100::numeric, '2026-12-05'::date, 'CONFIRMED', array['summer'], false),
  ('TAS-SU-4D3N', 'Tasmania Summer Photo Trip', 'ทริปถ่ายภาพแทสเมเนียฤดูร้อน 4 วัน 3 คืน', 'Tasmania', '4D3N', 'multiday', 1450::numeric, null, 5, 4, 0, 100::numeric, '2026-01-13'::date, 'CONFIRMED', array['summer'], true),
  ('BER-3D2N', 'Bermagui Photo Expedition', 'ทริปตามล่า "หินหัวม้า" แห่ง Bermagui', 'Bermagui', '3D2N', 'overnight', 390::numeric, null, 6, 4, 0, 100::numeric, '2026-01-01'::date, 'CONFIRMED', array['summer'], false)
) as v(trip_code, name_en, name_th, destination, duration_label, trip_type, price_standard, price_private, max_pax, min_pax, current_pax, deposit_amount, next_date, status, season, aurora_trip)
where not exists (select 1 from public.tours t where t.trip_code = v.trip_code);
