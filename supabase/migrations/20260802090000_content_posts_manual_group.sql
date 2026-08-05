-- content_posts.target_account: which FB destination receives the post.
-- Page accounts auto-publish via Graph on approve.
-- group_thaiaus stays manual (approved_pending_manual_post). No personal-profile option.

do $$ begin
  create type public.content_target_account as enum (
    'trip2talk_page',
    'chapter99_page',
    'group_thaiaus'
  );
exception
  when duplicate_object then null;
end $$;

-- If an older enum with saen_personal already exists, recreate without it
do $$ begin
  if exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'content_target_account'
      and e.enumlabel = 'saen_personal'
  ) then
    -- Map any saen_personal rows away before dropping the value (via text cast rebuild)
    alter table public.content_posts
      alter column target_account drop default;

    alter table public.content_posts
      alter column target_account type text using target_account::text;

    drop type public.content_target_account;

    create type public.content_target_account as enum (
      'trip2talk_page',
      'chapter99_page',
      'group_thaiaus'
    );

    update public.content_posts
    set target_account = 'group_thaiaus'
    where target_account = 'saen_personal';

    alter table public.content_posts
      alter column target_account type public.content_target_account
      using target_account::public.content_target_account;
  end if;
end $$;

alter table public.content_posts
  add column if not exists target_account public.content_target_account;

-- Backfill from legacy target_destination if present
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'content_posts'
      and column_name = 'target_destination'
  ) then
    update public.content_posts
    set target_account = case
      when target_destination::text in ('facebook_group', 'group_thaiaus')
        then 'group_thaiaus'::public.content_target_account
      when target_destination::text = 'chapter99_page'
        then 'chapter99_page'::public.content_target_account
      else 'trip2talk_page'::public.content_target_account
    end
    where target_account is null;
  else
    update public.content_posts
    set target_account = 'trip2talk_page'::public.content_target_account
    where target_account is null;
  end if;
end $$;

-- Drop any leftover saen_personal text values if column is still text
update public.content_posts
set target_account = 'group_thaiaus'
where target_account::text = 'saen_personal';

alter table public.content_posts
  alter column target_account set default 'trip2talk_page'::public.content_target_account;

alter table public.content_posts
  alter column target_account set not null;

alter table public.content_posts
  add column if not exists group_id text;

alter table public.content_posts
  add column if not exists posted_at timestamptz;

alter table public.content_posts
  add column if not exists facebook_post_id text;

alter table public.content_posts
  add column if not exists facebook_post_url text;

alter table public.content_posts drop constraint if exists content_posts_status_check;
alter table public.content_posts
  add constraint content_posts_status_check
  check (status in (
    'draft',
    'approved',
    'approved_pending_manual_post',
    'rejected',
    'posted'
  ));

create index if not exists content_posts_target_account_idx
  on public.content_posts (target_account);

create index if not exists content_posts_status_account_idx
  on public.content_posts (status, target_account);

comment on column public.content_posts.target_account is
  'trip2talk_page|chapter99_page = Graph auto-publish; group_thaiaus = manual only (no personal profile)';

comment on column public.content_posts.group_id is
  'Facebook Group id when target_account = group_thaiaus (default 1631889741218502)';
