-- Numbers for the sight words (the "Aa" button on the home page), shown in site/stats.html.
-- The site writes anonymous events into app_events (stats.js): sw_open, sw_view, sw_lesson_start / _done / _quit,
-- sw_review_start / _done / _quit, sw_game_start / _done, sw_chest. Nothing in them says who the child is.
-- This function only returns totals, like get_public_stats(); it never returns a single row.
-- Run it once in the Supabase SQL Editor (safe to run again).

create or replace function public.get_sw_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  with sw as (
    select event_type, book_id, book_title, category, visitor_id, created_at
    from app_events
    where event_type like 'sw\_%'
  )
  select json_build_object(
    'visitors',       (select count(distinct visitor_id) from sw where event_type = 'sw_open'),
    'opens',          (select count(*) from sw where event_type = 'sw_open'),
    'visitors_7d',    (select count(distinct visitor_id) from sw where event_type = 'sw_open' and created_at > now() - interval '7 days'),
    'learners',       (select count(distinct visitor_id) from sw where event_type = 'sw_lesson_start'),
    'finishers',      (select count(distinct visitor_id) from sw where event_type = 'sw_lesson_done'),
    'lesson_starts',  (select count(*) from sw where event_type = 'sw_lesson_start'),
    'lesson_done',    (select count(*) from sw where event_type = 'sw_lesson_done'),
    'lesson_quits',   (select count(*) from sw where event_type = 'sw_lesson_quit'),
    'chests',         (select count(*) from sw where event_type = 'sw_chest'),
    'by_lesson', (
      select coalesce(json_agg(t order by t.n), '[]'::json) from (
        select book_id as lesson,
               coalesce(nullif(regexp_replace(split_part(book_id, '-l', 2), '\D', '', 'g'), '')::int, 0) as n,
               count(*) filter (where event_type = 'sw_lesson_start') as starts,
               count(*) filter (where event_type = 'sw_lesson_done') as done,
               count(*) filter (where event_type = 'sw_lesson_quit') as quits,
               count(distinct visitor_id) as kids
        from sw
        where event_type in ('sw_lesson_start', 'sw_lesson_done', 'sw_lesson_quit') and book_id like 's%-l%'
        group by book_id
      ) t
    ),
    'quit_steps', (
      select coalesce(json_agg(t), '[]'::json) from (
        select book_id as lesson, book_title as step, count(*) as quits
        from sw
        where event_type = 'sw_lesson_quit'
        group by book_id, book_title
        order by quits desc
        limit 10
      ) t
    ),
    'games', (
      select coalesce(json_agg(t), '[]'::json) from (
        select book_id as game, coalesce(category, '') as kind,
               count(*) filter (where event_type = 'sw_game_start') as starts,
               count(*) filter (where event_type = 'sw_game_done') as done
        from sw
        where event_type in ('sw_game_start', 'sw_game_done')
        group by book_id, coalesce(category, '')
        order by starts desc
      ) t
    ),
    'views', (
      select coalesce(json_agg(t), '[]'::json) from (
        select book_id as screen, count(*) as n
        from sw
        where event_type = 'sw_view'
        group by book_id
        order by n desc
      ) t
    ),
    'daily', (
      select coalesce(json_agg(t), '[]'::json) from (
        select to_char(d.day, 'YYYY-MM-DD') as date, count(distinct e.visitor_id) as visits
        from generate_series(current_date - interval '13 days', current_date, interval '1 day') as d(day)
        left join sw e on date_trunc('day', e.created_at) = d.day
        group by d.day
        order by d.day
      ) t
    ),
    'last_updated', now()
  );
$$;

grant execute on function public.get_sw_stats() to anon, authenticated;
