-- Cross-device sync of pets, stars, reading progress and history.
-- Run this ONCE in Supabase -> SQL Editor, BEFORE the site version that
-- contains site/state-sync.js goes live. Safe to re-run.
--
-- One row per signed-in reader per piece of data (pet, today's stars, one
-- book's progress ...). Each reader can only ever see and change their own
-- rows. `rev` goes up by one on every update; the site uses it to notice that
-- another device changed a row, so one device never silently overwrites the
-- other's newer data.

create table if not exists public.user_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null check (char_length(key) between 1 and 160),
  value jsonb not null check (pg_column_size(value) <= 200000),
  rev bigint not null default 1,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_state enable row level security;

drop policy if exists "Users manage their own state" on public.user_state;
create policy "Users manage their own state"
  on public.user_state
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.user_state_bump()
returns trigger
language plpgsql
as $$
begin
  new.rev := old.rev + 1;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists user_state_bump on public.user_state;
create trigger user_state_bump
  before update on public.user_state
  for each row execute function public.user_state_bump();

-- The reading-level test result sync (site/placement-sync.js) has been in the
-- site for a while but its table was never created, so it did nothing. This
-- turns it on.
create table if not exists public.placement_results (
  user_id uuid primary key references auth.users(id) on delete cascade,
  result jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.placement_results enable row level security;

drop policy if exists "Users manage their own placement result" on public.placement_results;
create policy "Users manage their own placement result"
  on public.placement_results
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
