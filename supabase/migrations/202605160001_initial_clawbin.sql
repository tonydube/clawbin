create extension if not exists citext;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username citext not null unique,
  display_name text not null,
  avatar_url text,
  bio text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_username_length check (char_length(username::text) between 3 and 32),
  constraint profiles_display_name_length check (char_length(display_name) between 1 and 64),
  constraint profiles_bio_length check (char_length(bio) <= 280),
  constraint profiles_username_format check (username::text ~ '^[a-z0-9_]+$')
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  content text not null,
  description text,
  tags text[] not null default '{}',
  is_public boolean not null default true,
  upvote_count integer not null default 0,
  downvote_count integer not null default 0,
  comments_count integer not null default 0,
  runs_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint prompts_title_length check (char_length(title) between 5 and 120),
  constraint prompts_content_length check (char_length(content) between 20 and 12000),
  constraint prompts_description_length check (description is null or char_length(description) <= 200),
  constraint prompts_tags_size check (coalesce(array_length(tags, 1), 0) <= 5)
);

create table if not exists public.prompt_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  prompt_id uuid not null references public.prompts (id) on delete cascade,
  value smallint not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint prompt_votes_value_check check (value in (-1, 1)),
  constraint prompt_votes_unique_user_prompt unique (user_id, prompt_id)
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  prompt_id uuid not null references public.prompts (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint bookmarks_unique_user_prompt unique (user_id, prompt_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  prompt_id uuid not null references public.prompts (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint comments_content_length check (char_length(trim(content)) between 1 and 2000)
);

create table if not exists public.prompt_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  prompt_id uuid not null references public.prompts (id) on delete cascade,
  model text not null,
  input text,
  output text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint prompt_runs_model_length check (char_length(model) between 2 and 64),
  constraint prompt_runs_output_length check (char_length(output) between 1 and 12000)
);

create index if not exists prompts_public_created_idx
  on public.prompts (is_public, created_at desc);

create index if not exists prompts_user_created_idx
  on public.prompts (user_id, created_at desc);

create index if not exists prompts_tags_gin_idx
  on public.prompts using gin (tags);

create index if not exists prompt_votes_prompt_idx
  on public.prompt_votes (prompt_id);

create index if not exists prompt_votes_user_idx
  on public.prompt_votes (user_id);

create index if not exists bookmarks_user_created_idx
  on public.bookmarks (user_id, created_at desc);

create index if not exists bookmarks_prompt_idx
  on public.bookmarks (prompt_id);

create index if not exists comments_prompt_created_idx
  on public.comments (prompt_id, created_at desc);

create index if not exists prompt_runs_prompt_created_idx
  on public.prompt_runs (prompt_id, created_at desc);

create index if not exists prompt_runs_user_created_idx
  on public.prompt_runs (user_id, created_at desc);

create or replace function public.generate_profile_username(email_value text, user_identifier uuid)
returns citext
language plpgsql
as $$
declare
  raw_username text;
  candidate text;
  suffix integer := 0;
begin
  raw_username := lower(coalesce(split_part(email_value, '@', 1), 'user'));
  raw_username := regexp_replace(raw_username, '[^a-z0-9_]+', '_', 'g');
  raw_username := regexp_replace(raw_username, '_{2,}', '_', 'g');
  raw_username := trim(both '_' from raw_username);

  if raw_username = '' then
    raw_username := 'user';
  end if;

  candidate := left(raw_username, 24);

  while exists (
    select 1
    from public.profiles
    where username = candidate::citext
      and id <> user_identifier
  ) loop
    suffix := suffix + 1;
    candidate := left(raw_username, greatest(1, 24 - char_length(suffix::text) - 1)) || '_' || suffix::text;
  end loop;

  return candidate::citext;
end;
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  derived_display_name text;
begin
  derived_display_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'Clawbin User'
  );

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    public.generate_profile_username(new.email, new.id),
    left(derived_display_name, 64),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do update
  set
    username = excluded.username,
    display_name = excluded.display_name,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user_profile();

create or replace function public.recalculate_prompt_vote_totals(prompt_identifier uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.prompts
  set
    upvote_count = coalesce((
      select count(*)
      from public.prompt_votes
      where prompt_id = prompt_identifier and value = 1
    ), 0),
    downvote_count = coalesce((
      select count(*)
      from public.prompt_votes
      where prompt_id = prompt_identifier and value = -1
    ), 0),
    updated_at = timezone('utc', now())
  where id = prompt_identifier;
$$;

create or replace function public.recalculate_prompt_comment_totals(prompt_identifier uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.prompts
  set
    comments_count = coalesce((
      select count(*)
      from public.comments
      where prompt_id = prompt_identifier
    ), 0),
    updated_at = timezone('utc', now())
  where id = prompt_identifier;
$$;

create or replace function public.recalculate_prompt_run_totals(prompt_identifier uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.prompts
  set
    runs_count = coalesce((
      select count(*)
      from public.prompt_runs
      where prompt_id = prompt_identifier
    ), 0),
    updated_at = timezone('utc', now())
  where id = prompt_identifier;
$$;

create or replace function public.handle_prompt_vote_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_prompt_vote_totals(old.prompt_id);
    return old;
  end if;

  perform public.recalculate_prompt_vote_totals(new.prompt_id);

  if tg_op = 'UPDATE' and old.prompt_id <> new.prompt_id then
    perform public.recalculate_prompt_vote_totals(old.prompt_id);
  end if;

  return new;
end;
$$;

create or replace function public.handle_comment_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_prompt_comment_totals(old.prompt_id);
    return old;
  end if;

  perform public.recalculate_prompt_comment_totals(new.prompt_id);

  if tg_op = 'UPDATE' and old.prompt_id <> new.prompt_id then
    perform public.recalculate_prompt_comment_totals(old.prompt_id);
  end if;

  return new;
end;
$$;

create or replace function public.handle_prompt_run_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_prompt_run_totals(old.prompt_id);
    return old;
  end if;

  perform public.recalculate_prompt_run_totals(new.prompt_id);

  if tg_op = 'UPDATE' and old.prompt_id <> new.prompt_id then
    perform public.recalculate_prompt_run_totals(old.prompt_id);
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.handle_updated_at();

drop trigger if exists prompts_set_updated_at on public.prompts;
create trigger prompts_set_updated_at
before update on public.prompts
for each row
execute procedure public.handle_updated_at();

drop trigger if exists prompt_votes_set_updated_at on public.prompt_votes;
create trigger prompt_votes_set_updated_at
before update on public.prompt_votes
for each row
execute procedure public.handle_updated_at();

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
before update on public.comments
for each row
execute procedure public.handle_updated_at();

drop trigger if exists prompt_votes_after_change on public.prompt_votes;
create trigger prompt_votes_after_change
after insert or update or delete on public.prompt_votes
for each row
execute procedure public.handle_prompt_vote_change();

drop trigger if exists comments_after_change on public.comments;
create trigger comments_after_change
after insert or update or delete on public.comments
for each row
execute procedure public.handle_comment_change();

drop trigger if exists prompt_runs_after_change on public.prompt_runs;
create trigger prompt_runs_after_change
after insert or update or delete on public.prompt_runs
for each row
execute procedure public.handle_prompt_run_change();

create or replace view public.prompt_overview
with (security_invoker = on)
as
select
  p.id,
  p.user_id,
  p.title,
  p.content,
  p.description,
  p.tags,
  p.is_public,
  p.upvote_count,
  p.downvote_count,
  p.comments_count,
  p.runs_count,
  p.created_at,
  p.updated_at,
  (p.upvote_count - p.downvote_count) as vote_score,
  (p.upvote_count + p.downvote_count) as rating_count,
  case
    when (p.upvote_count + p.downvote_count) = 0 then 0::numeric(3,1)
    else round((1 + ((p.upvote_count::numeric / (p.upvote_count + p.downvote_count)::numeric) * 4))::numeric, 1)
  end as rating,
  round(
    ((p.upvote_count - p.downvote_count)::numeric /
      power(greatest(extract(epoch from timezone('utc', now()) - p.created_at) / 3600, 1), 0.8)
    )::numeric,
    4
  ) as trending_score,
  pr.username::text as username,
  pr.display_name,
  pr.avatar_url,
  pr.bio
from public.prompts p
join public.profiles pr
  on pr.id = p.user_id;

create or replace view public.tag_stats
with (security_invoker = on)
as
select
  tag,
  count(*)::bigint as prompt_count
from (
  select unnest(tags) as tag
  from public.prompts
  where is_public or auth.uid() = user_id
) tags_expanded
group by tag
order by prompt_count desc, tag asc;

alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_votes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.comments enable row level security;
alter table public.prompt_runs enable row level security;

drop policy if exists "profiles are public readable" on public.profiles;
create policy "profiles are public readable"
on public.profiles
for select
using (true);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "public prompts visible" on public.prompts;
create policy "public prompts visible"
on public.prompts
for select
using (is_public or auth.uid() = user_id);

drop policy if exists "users create own prompts" on public.prompts;
create policy "users create own prompts"
on public.prompts
for insert
with check (
  auth.role() = 'authenticated'
  and auth.uid() = user_id
);

drop policy if exists "users update own prompts" on public.prompts;
create policy "users update own prompts"
on public.prompts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users delete own prompts" on public.prompts;
create policy "users delete own prompts"
on public.prompts
for delete
using (auth.uid() = user_id);

drop policy if exists "users read own votes" on public.prompt_votes;
create policy "users read own votes"
on public.prompt_votes
for select
using (auth.uid() = user_id);

drop policy if exists "users create own votes" on public.prompt_votes;
create policy "users create own votes"
on public.prompt_votes
for insert
with check (
  auth.role() = 'authenticated'
  and auth.uid() = user_id
  and exists (
    select 1
    from public.prompts
    where prompts.id = prompt_id
      and (prompts.is_public or prompts.user_id = auth.uid())
  )
);

drop policy if exists "users update own votes" on public.prompt_votes;
create policy "users update own votes"
on public.prompt_votes
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.prompts
    where prompts.id = prompt_id
      and (prompts.is_public or prompts.user_id = auth.uid())
  )
);

drop policy if exists "users delete own votes" on public.prompt_votes;
create policy "users delete own votes"
on public.prompt_votes
for delete
using (auth.uid() = user_id);

drop policy if exists "users read own bookmarks" on public.bookmarks;
create policy "users read own bookmarks"
on public.bookmarks
for select
using (auth.uid() = user_id);

drop policy if exists "users create own bookmarks" on public.bookmarks;
create policy "users create own bookmarks"
on public.bookmarks
for insert
with check (
  auth.role() = 'authenticated'
  and auth.uid() = user_id
  and exists (
    select 1
    from public.prompts
    where prompts.id = prompt_id
      and (prompts.is_public or prompts.user_id = auth.uid())
  )
);

drop policy if exists "users delete own bookmarks" on public.bookmarks;
create policy "users delete own bookmarks"
on public.bookmarks
for delete
using (auth.uid() = user_id);

drop policy if exists "comments visible on readable prompts" on public.comments;
create policy "comments visible on readable prompts"
on public.comments
for select
using (
  exists (
    select 1
    from public.prompts
    where prompts.id = prompt_id
      and (prompts.is_public or prompts.user_id = auth.uid())
  )
);

drop policy if exists "users create comments" on public.comments;
create policy "users create comments"
on public.comments
for insert
with check (
  auth.role() = 'authenticated'
  and auth.uid() = user_id
  and exists (
    select 1
    from public.prompts
    where prompts.id = prompt_id
      and (prompts.is_public or prompts.user_id = auth.uid())
  )
);

drop policy if exists "users update own comments" on public.comments;
create policy "users update own comments"
on public.comments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users delete own comments" on public.comments;
create policy "users delete own comments"
on public.comments
for delete
using (auth.uid() = user_id);

drop policy if exists "users read own runs" on public.prompt_runs;
create policy "users read own runs"
on public.prompt_runs
for select
using (auth.uid() = user_id);

drop policy if exists "users create own runs" on public.prompt_runs;
create policy "users create own runs"
on public.prompt_runs
for insert
with check (
  auth.role() = 'authenticated'
  and auth.uid() = user_id
  and exists (
    select 1
    from public.prompts
    where prompts.id = prompt_id
      and (prompts.is_public or prompts.user_id = auth.uid())
  )
);

drop policy if exists "users delete own runs" on public.prompt_runs;
create policy "users delete own runs"
on public.prompt_runs
for delete
using (auth.uid() = user_id);

-- Table grants: required because prompt_overview and tag_stats use
-- security_invoker = on, which means the query runs as the calling role.
-- Without these, anon/authenticated can't read the underlying tables and
-- the views return a 42501 permission denied error.
grant select on public.prompts        to anon, authenticated;
grant select on public.profiles       to anon, authenticated;
grant select on public.prompt_votes   to authenticated;
grant select on public.bookmarks      to authenticated;
grant select on public.prompt_runs    to authenticated;
grant select on public.comments       to authenticated;

-- Write grants for authenticated users
grant insert, update, delete on public.prompts       to authenticated;
grant insert, update, delete on public.prompt_votes  to authenticated;
grant insert, update, delete on public.bookmarks     to authenticated;
grant insert, update, delete on public.prompt_runs   to authenticated;
grant insert, update, delete on public.comments      to authenticated;
grant update                  on public.profiles      to authenticated;

-- View grants
grant select on public.prompt_overview to anon, authenticated;
grant select on public.tag_stats       to anon, authenticated;
