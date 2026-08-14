-- Lengthen Cache-Control on public media so browsers/CDN can reuse bytes.
-- Upload API stores seconds in metadata.cacheControl (Storage prefixes max-age=).
-- Existing objects were served as Cache-Control: no-cache, which forced a
-- re-download of full originals on every visit (including 1–8 MB cover PNGs).

update storage.objects
set metadata = coalesce(metadata, '{}'::jsonb)
  || jsonb_build_object('cacheControl', '31536000')
where bucket_id in ('trip-photos', 'photo-spots', 'public-media', 'content-photos');
