-- Account numbers for the Stats page (site/stats.html "Accounts" section).
-- Run this ONCE in Supabase -> SQL Editor. Safe to re-run. Only creates a
-- function; nothing else is touched.
--
-- Returns counts only, never an email address or any individual row.
--  * total_accounts   people who confirmed an email sign-in link
--  * pending          typed an email but never clicked the link
--  * new_7d / new_30d confirmed accounts created in the last 7 / 30 days
--  * active_7d        accounts whose synced data changed in the last 7 days
--                     (= signed in AND actually used the site)
--  * synced_pets      accounts that have a pet backed up
--  * daily_new        confirmed accounts created per day, last 14 days

create or replace function public.get_account_stats()
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'total_accounts', (select count(*) from auth.users where email_confirmed_at is not null),
    'pending', (select count(*) from auth.users where email_confirmed_at is null),
    'new_7d', (select count(*) from auth.users where email_confirmed_at is not null and created_at >= now() - interval '7 days'),
    'new_30d', (select count(*) from auth.users where email_confirmed_at is not null and created_at >= now() - interval '30 days'),
    'active_7d', (
      select count(distinct uid) from (
        select user_id as uid from public.user_state where updated_at >= now() - interval '7 days'
        union all
        select user_id from public.review_progress where updated_at >= now() - interval '7 days'
      ) a
    ),
    'synced_pets', (select count(distinct user_id) from public.user_state where key = 'lef_pet_v1'),
    'daily_new', (
      select coalesce(json_agg(t order by t.date), '[]'::json) from (
        select to_char(d.day, 'YYYY-MM-DD') as date, count(u.id) as accounts
        from generate_series(current_date - interval '13 days', current_date, interval '1 day') as d(day)
        left join auth.users u
          on u.email_confirmed_at is not null and date_trunc('day', u.created_at) = d.day
        group by d.day
      ) t
    )
  );
$$;

grant execute on function public.get_account_stats() to anon, authenticated;
