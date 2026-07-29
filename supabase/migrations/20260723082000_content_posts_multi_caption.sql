-- caption_ig / caption_line for multi-channel trip promo drafts (generate-trip-post).
-- page_id already added in seed-content-posts.sql; ensure here too.

alter table public.content_posts
  add column if not exists page_id text;

alter table public.content_posts
  add column if not exists caption_ig text;

alter table public.content_posts
  add column if not exists caption_line text;
