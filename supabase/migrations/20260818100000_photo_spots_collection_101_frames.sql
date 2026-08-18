-- Curated 101 Frames flags on photo_spots.
-- Idempotent. Not applied to production yet — frontend hides the badge until live.

alter table public.photo_spots
  add column if not exists collection_101_frames boolean not null default false,
  add column if not exists collection_rank int null;

create index if not exists photo_spots_collection_101_frames_idx
  on public.photo_spots (collection_101_frames)
  where collection_101_frames = true;

comment on column public.photo_spots.collection_101_frames is
  'True when this spot is part of the homepage 101 Frames set.';

comment on column public.photo_spots.collection_rank is
  'Optional #N of 101 display order. Null when not in the set.';
