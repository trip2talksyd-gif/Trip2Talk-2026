-- Trip2Talk V6 — Supabase STORAGE policies only (Postgres tables retired)
-- Project: reuse V5 Supabase xwdtjwzjkqunewxjpimm (Trip2Talk_V5_Operations)
-- Run in Supabase Dashboard → SQL Editor
--
-- V5 already has: payment-slips, receipts, trip-photos — extend, don't drop.
-- Create if missing: passport-documents, expense-receipts

-- ─── trip-photos (PUBLIC READ — gallery + promo images) ──────────────────────
insert into storage.buckets (id, name, public)
values ('trip-photos', 'trip-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read trip photos" on storage.objects;
create policy "Public read trip photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'trip-photos');

drop policy if exists "No client write trip photos" on storage.objects;
create policy "No client write trip photos"
  on storage.objects for insert
  to anon, authenticated
  with check (false);

drop policy if exists "No client update trip photos" on storage.objects;
create policy "No client update trip photos"
  on storage.objects for update
  to anon, authenticated
  using (false);

drop policy if exists "No client delete trip photos" on storage.objects;
create policy "No client delete trip photos"
  on storage.objects for delete
  to anon, authenticated
  using (false);

-- ─── payment-slips (PRIVATE — service role only, V5 bucket) ─────────────────
insert into storage.buckets (id, name, public)
values ('payment-slips', 'payment-slips', false)
on conflict (id) do update set public = false;

drop policy if exists "Deny anon payment slips" on storage.objects;
create policy "Deny anon payment slips"
  on storage.objects to anon, authenticated
  using (bucket_id = 'payment-slips' and false);

-- ─── passport-documents (PRIVATE — most sensitive) ───────────────────────────
insert into storage.buckets (id, name, public)
values ('passport-documents', 'passport-documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Deny anon passport documents" on storage.objects;
create policy "Deny anon passport documents"
  on storage.objects to anon, authenticated
  using (bucket_id = 'passport-documents' and false);

-- ─── expense-receipts (PRIVATE — Owner/Cashier via signed URL) ───────────────
insert into storage.buckets (id, name, public)
values ('expense-receipts', 'expense-receipts', false)
on conflict (id) do update set public = false;

drop policy if exists "Deny anon expense receipts" on storage.objects;
create policy "Deny anon expense receipts"
  on storage.objects to anon, authenticated
  using (bucket_id = 'expense-receipts' and false);

-- Note: V5 `receipts` bucket left untouched — new uploads go to expense-receipts.

-- ─── booking-confirmations (PRIVATE — PDF with customer PII) ─────────────────
insert into storage.buckets (id, name, public)
values ('booking-confirmations', 'booking-confirmations', false)
on conflict (id) do update set public = false;

drop policy if exists "Deny anon booking confirmations" on storage.objects;
create policy "Deny anon booking confirmations"
  on storage.objects to anon, authenticated
  using (bucket_id = 'booking-confirmations' and false);
