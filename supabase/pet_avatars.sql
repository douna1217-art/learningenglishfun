-- New pets (2026-10): the lizard was replaced by the dino, and the duck, penguin and giant panda joined.
-- Run this ONCE in the Supabase SQL editor BEFORE the new homepage goes live. It is safe for the old homepage too:
-- 'lizard' stays a valid value, so children already saved with it keep working (the new pages show them as the dino),
-- and the old picker can still save until the new site replaces it. Nothing is deleted or rewritten.
alter table public.profiles drop constraint if exists profiles_avatar_check;
alter table public.profiles
  add constraint profiles_avatar_check
  check (avatar in ('cat','dog','lizard','monkey','bunny','dino','duck','penguin','panda'));
