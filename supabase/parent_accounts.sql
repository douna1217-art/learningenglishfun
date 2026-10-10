-- Parent accounts, child profiles (at most 2 per parent) and per-child progress.
-- Run ONCE in Supabase -> SQL Editor, BEFORE the site version that contains
-- site/account.js goes live. Safe to re-run. Existing rows are not changed or
-- deleted; the old account-level sync rows stay as a backup.
--
-- Design notes
--  * parent_accounts : one row per parent who accepted the terms (version + time),
--                      including the acknowledgement that data is stored outside
--                      mainland China.
--  * profiles        : the children. Nickname + picture + optional grade only (no
--                      real name, no birthday). A trigger allows at most 2 per parent.
--  * user_state      : each child's progress is stored in the same table under the
--                      key "<profile id>:<name>", for example
--                      "3f2c...:lef_pet_v1". The table structure does not change, so
--                      the site version that is live today keeps working. Rows
--                      without a ":" are the old account-level rows.
--  * deleting a child deletes all of that child's rows.

-- ---------------------------------------------------------------- parents
create table if not exists public.parent_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  terms_version text not null check (char_length(terms_version) between 1 and 64),
  terms_accepted_at timestamptz not null default now(),
  overseas_storage_ack boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.parent_accounts enable row level security;

drop policy if exists "Parents manage their own account" on public.parent_accounts;
create policy "Parents manage their own account"
  on public.parent_accounts
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------- children
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 1 and 20),
  avatar text not null default 'cat' check (avatar in ('cat','dog','lizard','monkey','bunny','dino')),
  grade text check (grade is null or grade in ('K','1','2','3','4','5','6')),
  created_at timestamptz not null default now()
);

create index if not exists profiles_parent_idx on public.profiles (parent_id);

alter table public.profiles enable row level security;

drop policy if exists "Parents manage their own children" on public.profiles;
create policy "Parents manage their own children"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);

-- at most 2 children per parent (the lock stops two simultaneous requests
-- from both slipping through)
create or replace function public.profiles_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.parent_id::text));
  if (select count(*) from public.profiles where parent_id = new.parent_id) >= 2 then
    raise exception 'A parent account can have at most 2 children' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_limit on public.profiles;
create trigger profiles_limit
  before insert on public.profiles
  for each row execute function public.profiles_limit();

-- deleting a child deletes that child's progress rows
create or replace function public.profiles_delete_state()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  delete from public.user_state
   where user_id = old.parent_id
     and left(key, 37) = old.id::text || ':';
  return old;
end;
$$;

drop trigger if exists profiles_delete_state on public.profiles;
create trigger profiles_delete_state
  after delete on public.profiles
  for each row execute function public.profiles_delete_state();

-- ---------------------------------------------------------------- progress rows
-- longer keys now (36-character child id + ":" + the old name)
alter table public.user_state drop constraint if exists user_state_key_check;
alter table public.user_state
  add constraint user_state_key_check check (char_length(key) between 1 and 200);

-- a "<child id>:<name>" row may only be written for one of your own children
drop policy if exists "Users manage their own state" on public.user_state;
create policy "Users manage their own state"
  on public.user_state
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      position(':' in key) = 0
      or exists (
        select 1 from public.profiles p
         where p.parent_id = auth.uid()
           and p.id::text = split_part(key, ':', 1)
      )
    )
  );

-- ---------------------------------------------------------------- moving the old data
-- Called once, right after a parent creates their FIRST child: copies the old
-- account-level progress (pet, stars, book progress, review records, level test)
-- under that child. Does nothing for a second child. Old rows are left in place.
create or replace function public.adopt_legacy_state(p_profile uuid)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  copied integer := 0;
  n integer;
begin
  if not exists (
    select 1 from public.profiles where id = p_profile and parent_id = auth.uid()
  ) then
    raise exception 'That child does not belong to you';
  end if;

  if (select count(*) from public.profiles where parent_id = auth.uid()) <> 1 then
    return 0;
  end if;

  insert into public.user_state (user_id, key, value)
    select s.user_id, p_profile::text || ':' || s.key, s.value
      from public.user_state s
     where s.user_id = auth.uid() and position(':' in s.key) = 0
    on conflict (user_id, key) do nothing;
  get diagnostics n = row_count;
  copied := copied + n;

  insert into public.user_state (user_id, key, value)
    select r.user_id, p_profile::text || ':les_review_v1', jsonb_build_object('items', r.items)
      from public.review_progress r
     where r.user_id = auth.uid()
    on conflict (user_id, key) do nothing;
  get diagnostics n = row_count;
  copied := copied + n;

  insert into public.user_state (user_id, key, value)
    select pr.user_id, p_profile::text || ':les_placement_v1', pr.result
      from public.placement_results pr
     where pr.user_id = auth.uid()
    on conflict (user_id, key) do nothing;
  get diagnostics n = row_count;
  copied := copied + n;

  return copied;
end;
$$;

revoke execute on function public.adopt_legacy_state(uuid) from public, anon;
grant execute on function public.adopt_legacy_state(uuid) to authenticated;
