-- Visitor regions: run this ONCE in Supabase -> SQL Editor, BEFORE the new
-- site version (stats.js with tz/lang/device) goes live. Safe to re-run.
--
-- Adds three coarse, non-identifying columns to app_events (no IP address, no
-- raw user-agent), plus a view you can open in Table Editor and a function the
-- Stats page uses. The existing get_public_stats() is not touched.

-- 1) New columns (nullable, so old rows and the old site keep working)
alter table public.app_events
  add column if not exists tz text,       -- device time zone, e.g. Asia/Shanghai
  add column if not exists lang text,     -- browser language, e.g. zh-CN
  add column if not exists device text;   -- wechat / mobile / tablet / desktop

-- 2) Time zone -> region label (single place, used by the view and the function)
create or replace function public.region_of(tz text)
returns text
language sql
immutable
as $$
  select case
    when tz is null or tz = '' then '未知（记录地区之前的访问）'
    when tz !~ '^[A-Za-z0-9_+/-]{1,64}$' then '其他（格式异常）'
    when tz in ('Asia/Shanghai','Asia/Chongqing','Asia/Harbin','Asia/Urumqi','Asia/Kashgar','PRC') then '中国大陆'
    when tz = 'Asia/Hong_Kong' then '香港'
    when tz = 'Asia/Macau' then '澳门'
    when tz = 'Asia/Taipei' then '台湾'
    when tz like 'US/%'
      or tz in ('America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
                'America/Phoenix','America/Anchorage','America/Detroit','America/Boise',
                'America/Juneau','America/Indiana/Indianapolis','America/Kentucky/Louisville',
                'Pacific/Honolulu') then '美国'
    when tz like 'America/%' then '美洲其他（加拿大、拉美等）'
    else '其他（' || tz || '）'
  end
$$;

-- 3) Owner-only view: Table Editor -> Views -> region_stats.
--    security_invoker + revoke = the website (anon key) can never read it.
create or replace view public.region_stats
with (security_invoker = true) as
select
  public.region_of(tz) as region,
  count(distinct visitor_id) filter (where event_type = 'page_view') as visitors,
  count(*) filter (where event_type = 'page_view') as visits,
  count(distinct visitor_id) filter (where event_type = 'book_open') as readers,
  count(*) filter (where event_type = 'book_open') as book_opens
from public.app_events
group by 1
order by visitors desc, visits desc;

revoke all on public.region_stats from anon, authenticated;

-- 4) Aggregate numbers for the Stats page (never returns individual rows)
create or replace function public.get_region_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'regions', (
      select coalesce(json_agg(t), '[]'::json) from (
        select public.region_of(tz) as region,
               count(distinct visitor_id) filter (where event_type = 'page_view') as visitors,
               count(*) filter (where event_type = 'page_view') as visits,
               count(distinct visitor_id) filter (where event_type = 'book_open') as readers,
               count(*) filter (where event_type = 'book_open') as book_opens
        from app_events
        group by 1
        order by visitors desc, visits desc
        limit 12
      ) t
    ),
    'devices', (
      select coalesce(json_agg(t), '[]'::json) from (
        select case
                 when device is null then '未知'
                 when device in ('wechat','mobile','tablet','desktop') then device
                 else '其他'
               end as device,
               count(distinct visitor_id) filter (where event_type = 'page_view') as visitors,
               count(*) filter (where event_type = 'page_view') as visits
        from app_events
        group by 1
        order by visitors desc, visits desc
      ) t
    ),
    'tracked_since', (select min(created_at) from app_events where tz is not null)
  );
$$;

grant execute on function public.get_region_stats() to anon, authenticated;
