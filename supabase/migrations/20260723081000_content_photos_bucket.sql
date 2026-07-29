-- content-photos: public bucket for Quick Post / value_content drafts.
-- Browser uploads use anon insert (same pattern as payment-slips);
-- reads are public so Anthropic + Facebook can fetch the image URL.

insert into storage.buckets (id, name, public, file_size_limit)
values ('content-photos', 'content-photos', true, 20971520)
on conflict (id) do nothing;

drop policy if exists "public read content-photos" on storage.objects;
create policy "public read content-photos"
  on storage.objects for select
  using (bucket_id = 'content-photos');

drop policy if exists "anon upload content-photos" on storage.objects;
create policy "anon upload content-photos"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'content-photos');
