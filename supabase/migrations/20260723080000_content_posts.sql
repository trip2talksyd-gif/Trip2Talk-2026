-- content_posts: draft Facebook/content copy awaiting OWNER review.
-- Make.com inserts drafts and watches status → 'approved' via Database Webhook.
-- Staff UI updates go through staff-api (service role); revoke anon/authenticated.
--
-- post_type:
--   trip_promo     — trip-attached promo (trip_id required)
--   value_content  — page-growth story (no trip, no booking CTA)

create table if not exists public.content_posts (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.tours (id) on delete cascade,
  post_type text not null default 'trip_promo'
    check (post_type in ('trip_promo', 'value_content')),
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'rejected', 'posted')),
  headline_options jsonb not null default '[]'::jsonb,
  selected_headline text,
  caption_fb text,
  photo_urls text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_posts_trip_required_for_promo
    check (
      (post_type = 'value_content' and trip_id is null)
      or (post_type = 'trip_promo' and trip_id is not null)
    )
);

create index if not exists content_posts_status_created_at_idx
  on public.content_posts (status, created_at desc);

create index if not exists content_posts_trip_id_idx
  on public.content_posts (trip_id);

create index if not exists content_posts_post_type_idx
  on public.content_posts (post_type);

alter table public.content_posts enable row level security;

revoke all on public.content_posts from anon;
revoke all on public.content_posts from authenticated;

-- updated_at touch
create or replace function public.content_posts_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists content_posts_set_updated_at on public.content_posts;
create trigger content_posts_set_updated_at
  before update on public.content_posts
  for each row execute function public.content_posts_set_updated_at();
