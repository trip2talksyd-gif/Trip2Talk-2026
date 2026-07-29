-- =============================================================================
-- Seed: content_posts (3 test rows for Content Review + Make.com webhook)
--
-- DO NOT run from the agent / CI automatically.
-- Run manually in Supabase SQL Editor (project: trip2talk-official /
-- bljhnelgmkulxwuhedbi) OR via psql:
--
--   psql "$DATABASE_URL" -f supabase/seed-content-posts.sql
--
-- Or from repo root with the linked CLI (only after confirming project-ref
-- is bljhnelgmkulxwuhedbi):
--
--   npx supabase db query --linked -f supabase/seed-content-posts.sql
-- =============================================================================

-- page_id is used by Make.com after a successful Facebook Page post.
alter table public.content_posts
  add column if not exists page_id text;

insert into public.content_posts (
  post_type,
  trip_id,
  status,
  headline_options,
  selected_headline,
  caption_fb,
  photo_urls,
  page_id
)
values
  -- 1) trip_promo draft — uses the first tour row
  (
    'trip_promo',
    (select id from public.tours order by created_at asc nulls last, id asc limit 1),
    'draft',
    '["ล่าแสงใต้ Tasmania รอบสุดท้าย เหลือ 2 ที่นั่ง","อากาศเปิด กันยังไม่ทันตั้งตัว จองด่วน"]'::jsonb,
    null,
    $cap1$
รอบนี้แสงใต้ Tasmania สวยแบบไม่ต้องแต่ง — อากาศเปิด ไฟลากยาวไปถึงขอบฟ้า
ที่นั่งเหลือน้อยแล้ว ใครอยากไปกับทริปนี้ คุยพี่แสนได้เลยนะ
$cap1$,
    array['https://placehold.co/600x400']::text[],
    null
  ),

  -- 2) value_content draft — no trip
  (
    'value_content',
    null,
    'draft',
    '["ตอนที่กดชัตเตอร์นี้ ลมแรงกว่าที่คิด","เกร็ดเล็กๆ จากไฟเย็นหลังฝน"]'::jsonb,
    null,
    $cap2$
รูปนี้ถ่ายหลังฝนหยุด — ท้องฟ้ายังเปียก แสงสะท้อนบนหินชัดมาก
ตั้งค่าแบบง่ายๆ f/8 · 1/125 · ISO 400 แล้วจัดมุมต่ำนิดหน่อยให้เส้นนำสายตาวิ่งเข้าเฟรม

เพื่อนๆ ชอบถ่ายแนวไหนมากกว่ากัน — แสงอุ่นตอนเย็น หรือไฟเย็นหลังฝนแบบนี้?
$cap2$,
    array['https://placehold.co/600x400']::text[],
    null
  ),

  -- 3) approved + page_id — for Make.com end-to-end webhook test
  (
    'value_content',
    null,
    'approved',
    '["โมเมนต์เงียบๆ ก่อนพระอาทิตย์ขึ้น","ไฟแรกของวัน ที่ขอบทะเล"]'::jsonb,
    'โมเมนต์เงียบๆ ก่อนพระอาทิตย์ขึ้น',
    $cap3$
เช้านี้เงียบผิดปกติ — น้ำนิ่ง ฟ้าเริ่มไล่สีชมพูอ่อนๆ
Trip Leader ยืนดูเงาบนขอบฟ้าก่อนจะปลุกทุกคนให้พร้อมกดชัตเตอร์รอบแรก

ใครเคยตื่นมาลุ้นแสงแบบนี้บ้าง เล่าให้ฟังหน่อยได้ไหม?
$cap3$,
    array['https://placehold.co/600x400']::text[],
    'SEED_MAKE_TEST_PAGE_ID'
  );

-- Optional check after run:
-- select id, post_type, status, trip_id, page_id, left(caption_fb, 40) as caption_preview
-- from public.content_posts
-- order by created_at desc
-- limit 5;
