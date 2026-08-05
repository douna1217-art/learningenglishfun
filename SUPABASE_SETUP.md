# 开启跨设备同步（Supabase）

网站默认完全离线可用——阅读进度、Smart Review 的复习记录都存在浏览器本地
（`localStorage`）。想让同一个人换设备/换浏览器也能看到一样的复习进度，
按下面的步骤接入 Supabase 就行，大概 5 分钟。

## 1. 建 Supabase 项目

1. 打开 https://supabase.com ，注册/登录，New project 建一个新项目（选免费的
   Free 套餐就够用）。
2. 项目建好后（首次初始化要等 1-2 分钟），进左侧菜单 **SQL Editor** → New
   query，粘贴下面这段并运行：

   ```sql
   create table if not exists public.review_progress (
     user_id uuid primary key references auth.users(id) on delete cascade,
     items jsonb not null default '{}'::jsonb,
     updated_at timestamptz not null default now()
   );

   alter table public.review_progress enable row level security;

   create policy "Users manage their own review progress"
     on public.review_progress
     for all
     to authenticated
     using (auth.uid() = user_id)
     with check (auth.uid() = user_id);
   ```

   这条 RLS 规则保证每个人只能读写自己名下的那一行数据，就算拿到 anon key
   也看不到别人的复习记录。

## 2. 填配置

去 Supabase 项目 → **Settings → API**，复制：

- **Project URL**
- **anon / public key**（不是 `service_role`，那个绝对不能填进前端代码）

打开 [`site/supabase-config.js`](site/supabase-config.js)，把里面的占位符换成
你复制的这两个值：

```js
window.SUPABASE_CONFIG = {
  url: "https://你的项目.supabase.co",
  anonKey: "你的anon或publishable key",
};
```

在你填真实值之前，网站会自动跳过这一步，其它功能（看书、答题、复习）完全
不受影响。

## 3. 允许邮箱登录链接跳回你的网址

Supabase 项目 → **Authentication → URL Configuration**，把 **Site URL**（以及
如果用了 **Redirect URLs** 白名单）设置成你实际的网站地址（比如 Netlify 给的
域名，或你自己的域名）。不设置的话，用户点击登录邮件里的链接可能跳不回你的
网站。

## 4. 试一下

1. 部署更新后的网站（或者本地起个静态服务器打开 `site/index.html`）。
2. 网站顶部会出现一个"输入邮箱 → Sync progress"的小框。输入邮箱，点按钮。
3. 去邮箱里点收到的登录链接，会跳回网站，顶部变成"☁️ 你的邮箱"，说明登录成功。
4. 读一本书、答错一道题，再去 Supabase 的 **Table Editor** 里看
   `review_progress` 表，应该能看到多了一行，`items` 字段里有刚才的记录。
5. 换个浏览器（或无痕模式）用同一个邮箱再登录一次，应该能看到同样的复习进度。

## 说明

- 登录方式是"邮箱魔法链接"（Magic Link），不需要设密码，对家长/老师来说更省心，
  网站本身也不用存密码。
- 同步策略跟"整表覆盖"类似：每次本地复习记录变化后，会把整份记录重新写一遍到
  云端；登录时会把本地和云端的记录按"进度更靠前的那份为准"合并一次，不会因为
  换设备登录就把已有进度冲掉。
- 没有配置 `supabase-config.js` 或者没登录时，一切跟以前完全一样，只存本地。

## 使用统计（访问量 / 阅读量 / 复习正确率）

跟上面同一个 Supabase 项目里，还建了一张 `app_events` 表，记录三类轻量事件：
打开首页、打开某本书（附书名和主题）、Smart Review 答对/答错。这张表**只允许
写入，不允许任何人直接读取**——就算拿到 anon key 也读不到任何一条原始访问记录。

建表 + 汇总函数的 SQL（在 SQL Editor 里运行一次）：

```sql
create table if not exists public.app_events (
  id bigint generated always as identity primary key,
  event_type text not null,
  book_id text,
  book_title text,
  category text,
  source text,
  visitor_id text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.app_events enable row level security;

create policy "Allow insert for everyone" on public.app_events
  for insert
  to anon, authenticated
  with check (true);

create or replace function public.get_public_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'total_visits', (select count(*) from app_events where event_type = 'page_view'),
    'unique_visitors', (select count(distinct visitor_id) from app_events where event_type = 'page_view' and visitor_id is not null),
    'signed_in_visitors', (select count(distinct user_id) from app_events where event_type = 'page_view' and user_id is not null),
    'total_book_opens', (select count(*) from app_events where event_type = 'book_open'),
    'unique_readers', (select count(distinct visitor_id) from app_events where event_type = 'book_open' and visitor_id is not null),
    'review_correct', (select count(*) from app_events where event_type = 'review_correct'),
    'review_wrong', (select count(*) from app_events where event_type = 'review_wrong'),
    'top_books', (
      select coalesce(json_agg(t), '[]'::json) from (
        select book_id, book_title, count(*) as opens
        from app_events
        where event_type = 'book_open' and book_id is not null
        group by book_id, book_title
        order by opens desc
        limit 10
      ) t
    ),
    'top_categories', (
      select coalesce(json_agg(t), '[]'::json) from (
        select category, count(*) as opens
        from app_events
        where event_type = 'book_open' and category is not null
        group by category
        order by opens desc
        limit 10
      ) t
    ),
    'top_sources', (
      select coalesce(json_agg(t), '[]'::json) from (
        select coalesce(source, 'direct') as source, count(*) as visits
        from app_events
        where event_type = 'page_view'
        group by coalesce(source, 'direct')
        order by visits desc
        limit 10
      ) t
    ),
    'daily_visits', (
      select coalesce(json_agg(t), '[]'::json) from (
        select to_char(d.day, 'YYYY-MM-DD') as date, count(e.id) as visits
        from generate_series(current_date - interval '13 days', current_date, interval '1 day') as d(day)
        left join app_events e
          on e.event_type = 'page_view' and date_trunc('day', e.created_at) = d.day
        group by d.day
        order by d.day
      ) t
    ),
    'last_updated', now()
  );
$$;

grant execute on function public.get_public_stats() to anon, authenticated;
```

`get_public_stats()` 是 `SECURITY DEFINER` 函数，只对外返回算好的汇总数字（总
访问量、独立访客数、阅读次数、最受欢迎的书/主题、复习正确率、近 14 天每日
访问趋势、流量来源、登录同步的采用率），从不暴露单条记录——这是唯一一个能
从前端读到统计数字的入口。

流量来源（`source`）的判定逻辑：URL 带 `?src=xxx` 或 `?utm_source=xxx` 时优先
用这个值（比如给二维码海报的链接加 `?src=qr-poster`，就能在统计里单独看到这
条来源的访问量）；否则看 `document.referrer` 的域名；都没有就记成 `direct`。

**怎么看统计**：打开 `site/stats.html`（没有放进导航栏，自己收藏这个网址就
行），或者直接在 Supabase 的 SQL Editor 里运行 `select public.get_public_stats();`。
