-- Optional compressed clip for Discover spot cards (3-thumb strip / hero).
-- App must only autoplay URLs that end with _web.mp4 — never Storage masters.

alter table public.photo_spots
  add column if not exists video_url text null;

comment on column public.photo_spots.video_url is
  'Optional compressed spot clip. Site must use *_web.mp4 only — never the Storage master.';
