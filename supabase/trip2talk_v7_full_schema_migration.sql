-- ============================================================================
-- Trip2Talk V7 — Full Schema Migration (Fresh Start)
-- Project: (new Supabase project under trip2talksyd@gmail.com only)
-- Run once on a brand-new project via Supabase SQL Editor or `supabase db push`
-- ============================================================================
-- หลักการออกแบบ (สำคัญ อ่านก่อนรัน):
-- 1. ทุกตาราง เปิด RLS เสมอ ไม่มีข้อยกเว้น
-- 2. anon (ผู้ใช้ทั่วไป ไม่ล็อกอิน) ได้แค่: อ่าน tours, insert booking/waiver
--    การ readback หลัง insert ถูกจำกัด column ให้ตรงกับที่โค้ด frontend เรียกจริง
--    เพื่อป้องกัน 401/permission error ที่เคยเกิดจาก .select('*') เกินสิทธิ์
-- 3. ข้อมูลอ่อนไหว (passport, medical, payment) อ่านได้เฉพาะ staff ที่ authenticate
--    ผ่าน RPC เท่านั้น ไม่เปิด direct table select ให้ anon
-- 4. ที่นั่งทริป (seats) ควบคุมด้วย atomic function ระดับ DB ป้องกัน race condition
--    ห้ามใช้ frontend คำนวณที่นั่งเอง
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS (ต้องเปิดก่อน verify_staff_pin ที่ใช้ crypt())
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto;


-- ----------------------------------------------------------------------------
-- 1. TOURS — ข้อมูลทริป (public read)
-- ----------------------------------------------------------------------------
create table public.tours (
  id uuid primary key default gen_random_uuid(),
  trip_code text unique not null,
  name_th text not null,
  name_en text not null,
  description_th text,
  description_en text,
  duration_days int,
  duration_nights int,
  departure_date date,           -- null = unbookable (date gate ตาม business rule)
  price_aud numeric(10,2) not null,
  deposit_aud numeric(10,2) not null,
  max_seats int not null,
  booked_seats int not null default 0,
  status text not null default 'draft' check (status in ('draft','published','confirmed','completed','cancelled')),
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booked_seats_within_limit check (booked_seats <= max_seats),
  constraint booked_seats_non_negative check (booked_seats >= 0)
);

create index tours_status_idx on public.tours (status);
create index tours_departure_date_idx on public.tours (departure_date);

alter table public.tours enable row level security;

-- anon อ่านได้เฉพาะทริปที่ published/confirmed เท่านั้น (ไม่เห็น draft)
create policy "anon can read published tours"
  on public.tours for select
  to anon
  using (status in ('published','confirmed','completed'));

-- staff (authenticated) อ่านได้ทุกสถานะ
create policy "authenticated staff can read all tours"
  on public.tours for select
  to authenticated
  using (true);

create policy "authenticated staff can manage tours"
  on public.tours for all
  to authenticated
  using (true)
  with check (true);

comment on table public.tours is 'ข้อมูลทริป - anon อ่านได้เฉพาะ published/confirmed, ไม่มี insert/update/delete จาก anon';


-- ----------------------------------------------------------------------------
-- 2. TOUR_BOOKINGS — การจอง (sensitive, insert-only สำหรับ anon)
-- ----------------------------------------------------------------------------
create table public.tour_bookings (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete restrict,
  trip_code text not null,
  first_name_th text not null,
  last_name_th text not null,
  first_name_en text not null,
  last_name_en text not null,
  passport_number text not null,
  email text not null,
  phone text not null,
  dietary_requirements text,
  medical_conditions text,
  oshc_provider text,
  oshc_expiry date,
  waiver_signed boolean not null default false,
  waiver_signed_at timestamptz,
  booking_status text not null default 'pending_payment'
    check (booking_status in ('pending_payment','deposit_paid','fully_paid','cancelled','no_show')),
  amount_paid_aud numeric(10,2) not null default 0,
  payment_method text,
  slip_url text,
  booked_at timestamptz not null default now()
);

create index tour_bookings_tour_id_idx on public.tour_bookings (tour_id);
create index tour_bookings_status_idx on public.tour_bookings (booking_status);
create index tour_bookings_trip_code_idx on public.tour_bookings (trip_code);

alter table public.tour_bookings enable row level security;

-- anon insert ได้อย่างเดียว ห้าม update/delete โดยตรง
create policy "anon can insert bookings"
  on public.tour_bookings for insert
  to anon
  with check (true);

-- readback หลัง insert — ต้องมีทั้ง column grant และ RLS policy (เรียนรู้จาก V5)
create policy "anon read back safe booking columns"
  on public.tour_bookings for select
  to anon
  using (true);

-- staff เท่านั้นที่ select เต็มตาราง (สำหรับ manifest/dashboard)
create policy "authenticated staff can read all bookings"
  on public.tour_bookings for select
  to authenticated
  using (true);

create policy "authenticated staff can update bookings"
  on public.tour_bookings for update
  to authenticated
  using (true);

-- *** สำคัญ: column-level grant สำหรับ readback หลัง insert ***
-- ต้องตรงกับ .select() ใน insertBooking() ใน src/lib/toursApi.ts เป๊ะๆ
-- ถ้าจะเพิ่ม field ใน .select() ต้อง grant column เพิ่มที่นี่ด้วยเสมอ ไม่งั้นจะ 401 อีก
grant insert (
  tour_id, trip_code, first_name_th, last_name_th, first_name_en, last_name_en,
  passport_number, email, phone, dietary_requirements, medical_conditions,
  oshc_provider, oshc_expiry, waiver_signed, waiver_signed_at,
  booking_status, amount_paid_aud, payment_method, slip_url
) on public.tour_bookings to anon;

grant select (id, trip_code, booked_at) on public.tour_bookings to anon;

comment on table public.tour_bookings is 'การจอง - anon insert ได้อย่างเดียว, readback จำกัดแค่ id/trip_code/booked_at';


-- ----------------------------------------------------------------------------
-- 3. WAIVER_SIGNATURES — ลายเซ็น waiver (insert-only สำหรับ anon)
-- ----------------------------------------------------------------------------
create table public.waiver_signatures (
  id uuid primary key default gen_random_uuid(),
  trip_code text not null,
  signed_name text not null,
  signed_at timestamptz not null default now(),
  clauses jsonb not null,
  locale text not null default 'th' check (locale in ('th','en')),
  created_at timestamptz not null default now()
);

create index waiver_signatures_trip_code_idx on public.waiver_signatures (trip_code);

alter table public.waiver_signatures enable row level security;

create policy "anon can insert waiver signatures"
  on public.waiver_signatures for insert
  to anon
  with check (true);

create policy "anon read back safe waiver columns"
  on public.waiver_signatures for select
  to anon
  using (true);

create policy "authenticated staff can read waivers"
  on public.waiver_signatures for select
  to authenticated
  using (true);

grant insert (trip_code, signed_name, clauses, locale) on public.waiver_signatures to anon;
grant select (id, trip_code, signed_at) on public.waiver_signatures to anon;

comment on table public.waiver_signatures is 'ลายเซ็น waiver - anon insert ได้อย่างเดียว, readback จำกัดแค่ id/trip_code/signed_at';


-- ----------------------------------------------------------------------------
-- 4. STAFF_PROFILES — พนักงาน + PIN (ห้าม anon เข้าถึงตรงๆ เด็ดขาด)
-- ----------------------------------------------------------------------------
create table public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role text not null check (role in ('OWNER','MANAGER','CASHIER','GUIDE')),
  pin_hash text not null,          -- เก็บ hash เท่านั้น ห้ามเก็บ PIN ตรงๆ
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.staff_profiles enable row level security;

revoke all on public.staff_profiles from anon;
revoke all on public.staff_profiles from authenticated;

-- ไม่มี policy ให้ anon/authenticated เลย = เข้าไม่ได้ทั้งหมด (default deny)
-- ต้องผ่าน RPC verify_staff_pin() เท่านั้น

comment on table public.staff_profiles is 'ข้อมูลพนักงาน - เข้าถึงได้เฉพาะผ่าน RPC verify_staff_pin() เท่านั้น ห้าม select ตรง';

-- RPC สำหรับตรวจ PIN แบบปลอดภัย (SECURITY DEFINER) — คืนแค่ role, ไม่คืน pin_hash
create or replace function public.verify_staff_pin(input_pin text)
returns table (staff_id uuid, full_name text, role text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select s.id, s.full_name, s.role
    from public.staff_profiles s
    where s.pin_hash = crypt(input_pin, s.pin_hash)
      and s.active = true;
end;
$$;

grant execute on function public.verify_staff_pin(text) to anon, authenticated;

comment on function public.verify_staff_pin is 'ตรวจ PIN staff แบบปลอดภัย ใช้ pgcrypto crypt() เทียบ hash, คืนแค่ id/name/role';


-- ----------------------------------------------------------------------------
-- 5. EXPENSES — ค่าใช้จ่ายธุรกิจ (staff only)
-- ----------------------------------------------------------------------------
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount_aud numeric(10,2) not null,
  gst_amount_aud numeric(10,2) not null default 0,
  ato_category text not null,
  expense_date date not null,
  receipt_url text,
  created_by uuid references public.staff_profiles(id),
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;

create policy "authenticated staff full access to expenses"
  on public.expenses for all
  to authenticated
  using (true)
  with check (true);

comment on table public.expenses is 'ค่าใช้จ่าย ATO - staff (authenticated) เท่านั้น anon เข้าไม่ได้';


-- ----------------------------------------------------------------------------
-- 6. COMPLIANCE_ITEMS — รายการ compliance (staff only)
-- ----------------------------------------------------------------------------
create table public.compliance_items (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  due_date date,
  status text not null default 'pending' check (status in ('pending','done','overdue')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.compliance_items enable row level security;

create policy "authenticated staff full access to compliance"
  on public.compliance_items for all
  to authenticated
  using (true)
  with check (true);

comment on table public.compliance_items is 'compliance tracking - staff (authenticated) เท่านั้น';


-- ----------------------------------------------------------------------------
-- 7. ATOMIC SEAT BOOKING — ป้องกัน race condition ตอนจองพร้อมกันหลายคน
-- ----------------------------------------------------------------------------
-- Business rule (ตามที่ตกลงไว้): ที่นั่งคุมที่ระดับ DB เท่านั้น
-- ห้าม frontend เช็ค/ลดที่นั่งเอง ต้องเรียกฟังก์ชันนี้เสมอ
create or replace function public.book_seat(p_tour_id uuid, p_seats_requested int default 1)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_success boolean;
begin
  update public.tours
  set booked_seats = booked_seats + p_seats_requested,
      updated_at = now()
  where id = p_tour_id
    and booked_seats + p_seats_requested <= max_seats
    and status in ('published','confirmed');

  get diagnostics v_success = row_count;
  return v_success > 0;
end;
$$;

grant execute on function public.book_seat(uuid, int) to anon;

comment on function public.book_seat is
  'จองที่นั่งแบบ atomic - คืน true ถ้าจองสำเร็จ, false ถ้าที่นั่งเต็มแล้ว. เรียกก่อน insert booking เสมอ';


-- ----------------------------------------------------------------------------
-- 8. STORAGE BUCKETS
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('trip-photos', 'trip-photos', true, 52428800),           -- public: แสดงบนหน้าเว็บ
  ('payment-slips', 'payment-slips', false, 52428800),      -- private: หลักฐานโอนเงิน
  ('passport-documents', 'passport-documents', false, 52428800), -- private: ข้อมูลอ่อนไหว
  ('expense-receipts', 'expense-receipts', false, 52428800),     -- private: staff only
  ('booking-confirmations', 'booking-confirmations', false, 52428800) -- private
on conflict (id) do nothing;

-- trip-photos: ใครก็อ่านได้ (public bucket), แต่ insert/update/delete เฉพาะ staff
create policy "public read trip-photos"
  on storage.objects for select
  using (bucket_id = 'trip-photos');

create policy "staff manage trip-photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'trip-photos');

create policy "staff update trip-photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'trip-photos')
  with check (bucket_id = 'trip-photos');

create policy "staff delete trip-photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'trip-photos');

-- payment-slips: anon upload ได้ (ตอนจอง), อ่านได้เฉพาะ staff
create policy "anon upload payment-slips"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'payment-slips');

create policy "staff read payment-slips"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'payment-slips');

-- passport-documents: anon upload ได้ (ตอนจอง), อ่านได้เฉพาะ staff — ข้อมูลอ่อนไหวมาก
create policy "anon upload passport-documents"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'passport-documents');

create policy "staff read passport-documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'passport-documents');

-- expense-receipts, booking-confirmations: staff only ทั้งหมด
create policy "staff manage expense-receipts"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'expense-receipts')
  with check (bucket_id = 'expense-receipts');

create policy "staff manage booking-confirmations"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'booking-confirmations')
  with check (bucket_id = 'booking-confirmations');

-- ============================================================================
-- END OF MIGRATION
-- หลังรันเสร็จ: ทดสอบด้วย SELECT * FROM public.tours; (ควรว่างเปล่า - ปกติ ยังไม่ seed data)
-- ขั้นตอนถัดไป: seed ข้อมูลทริป 14 trip codes ผ่าน authenticated/service_role เท่านั้น
-- ============================================================================
