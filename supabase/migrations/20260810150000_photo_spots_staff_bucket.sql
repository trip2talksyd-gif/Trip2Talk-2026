-- Photo Spots staff library: dedicated public image bucket + gallery URLs column.
-- Browser uploads use anon insert (same pattern as content-photos); row writes go via staff-api.

insert into storage.buckets (id, name, public, file_size_limit)
values ('photo-spots', 'photo-spots', true, 15728640) -- 15 MB
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists "public read photo-spots" on storage.objects;
create policy "public read photo-spots"
  on storage.objects for select
  using (bucket_id = 'photo-spots');

drop policy if exists "anon upload photo-spots" on storage.objects;
create policy "anon upload photo-spots"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'photo-spots');

drop policy if exists "anon update photo-spots" on storage.objects;
create policy "anon update photo-spots"
  on storage.objects for update
  to anon
  using (bucket_id = 'photo-spots')
  with check (bucket_id = 'photo-spots');

alter table public.photo_spots
  add column if not exists gallery_image_urls text[] not null default '{}';

comment on column public.photo_spots.gallery_image_urls is
  'Up to 4 extra public image URLs (hero is hero_image_url). Staff UI enforces max 5 images total.';
