-- Numbers for the error log, shown in site/stats.html.
-- The site writes one anonymous event, js_error, when a page breaks or a word cannot be played (site/error-report.js):
--   book_id = the kind (error / promise / audio), book_title = the message (at most 120 characters, links and e-mail addresses removed),
--   category = file:line and a coarse browser name. Nothing says who the child is. This function only returns totals, never a single row.
-- Run it once in the Supabase SQL Editor (safe to run again).

create or replace function public.get_error_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  with e as (
    select book_id as kind, book_title as msg, category as spot, visitor_id, tz, created_at
    from app_events
    where event_type = 'js_error' and created_at > now() - interval '30 days'
  )
  select json_build_object(
    'errors_7d',    (select count(*) from e where created_at > now() - interval '7 days'),
    'errors_30d',   (select count(*) from e),
    'browsers_7d',  (select count(distinct visitor_id) from e where created_at > now() - interval '7 days'),
    'by_message', (
      select coalesce(json_agg(t), '[]'::json) from (
        select kind, msg, spot, count(*) as n, count(distinct visitor_id) as browsers, max(created_at) as last_seen
        from e
        where created_at > now() - interval '7 days'
        group by kind, msg, spot
        order by n desc
        limit 20
      ) t
    ),
    'by_browser', (
      select coalesce(json_agg(t), '[]'::json) from (
        select split_part(spot, ' · ', 2) as browser, count(*) as n
        from e
        where created_at > now() - interval '7 days'
        group by split_part(spot, ' · ', 2)
        order by n desc
      ) t
    ),
    'daily', (
      select coalesce(json_agg(t order by t.date), '[]'::json) from (
        select to_char(d::date, 'YYYY-MM-DD') as date,
               (select count(*) from e where created_at::date = d::date) as visits
        from generate_series((now() - interval '13 days')::date, now()::date, interval '1 day') d
      ) t
    ),
    'last_updated', now()
  );
$$;

grant execute on function public.get_error_stats() to anon, authenticated;
