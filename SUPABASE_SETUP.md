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

## 阅读水平测评结果同步（可选）

首页新加的"不知道该看几年级？先测一下"入门测评，结果默认也是只存本地
（`localStorage`），不用配置任何东西就能正常使用。想让登录后换设备也能看到
同一份测评结果（推荐年级），在 SQL Editor 里再运行一次这段（跟上面
`review_progress` 是同一套写法）：

```sql
create table if not exists public.placement_results (
  user_id uuid primary key references auth.users(id) on delete cascade,
  result jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.placement_results enable row level security;

create policy "Users manage their own placement result"
  on public.placement_results
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

不运行这段也完全没问题——测评本身、推荐书单都正常工作，只是换设备/换浏览器
登录同一个邮箱时看不到之前测过的结果，需要重新测一次。

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

## 跨设备同步：宠物、星星、书的进度、阅读记录

登录（邮箱魔法链接）之后，除了 Smart Review 复习记录（`sync.js`）和阅读水平测评结果
（`placement-sync.js`），下面这些也会跟着账号走，换设备用同一个邮箱登录就能看到
（`site/state-sync.js`）：

- 宠物（种类、名字、星星、买到的衣服玩具）和今天已获得的星星
- 每本书的进度（哪几个标签已完成、答题次数）
- 阅读历史、最近打开的书、欢迎礼物是否已领

**不登录就不同步**：数据只存在这台设备的浏览器里，浏览器不知道"这是同一个孩子"，
邮箱是唯一能认出同一个人的办法。清除浏览器数据、换浏览器、无痕模式，没登录过的数据
都会丢。

**上线顺序**：先在 Supabase 的 SQL Editor 里运行 `supabase/user_state_sync.sql`
（可重复运行；会建 `user_state` 表，并把原本没建的 `placement_results` 表也建上，让
测评结果同步真正生效），再推送网站。万一顺序反了，同步会静默失败并稍后重试，网站其他
功能不受影响。

**两台设备都改过同一份数据怎么办**：不会互相覆盖，而是合并，原则是"宁可多留，绝不丢"。
- 书的进度：两边完成的标签都保持完成，计数取较大值。
- 宠物：第一次关联账号时，保留更丰富的那只（物品多的，其次星星多的）；同一种宠物时，
  两边买过的衣服玩具全部保留。
- 阅读历史：每本书一条，保留较新的、已知的测验结果。
- 只有一边改过时，直接用改过的那份，不触发合并；在一台设备上主动"重新开始练习"也会
  如实同步过去。
- 每一行有版本号 `rev`，数据库每次修改自动加一；上传时必须带着上次看到的版本号，别的设备
  在这期间改过就会被拒绝，下一轮重新读取并合并，不会静默覆盖。

**行为细节**：
- 页面打开、登录之后，如果从云端拿到了新数据，页面会自动**刷新一次**（让宠物和星星立刻显示
  新数据，一分钟内最多一次）。
- 平时每 4 秒检查一次本机数据有没有变化，只有真的变了（赚了星星、完成一个标签）才上传；
  宠物自己变饿、"最近活动时间"变化不算修改。切走标签页时也会检查一次。
- 同一台设备换另一个账号登录，会按"第一次关联"处理，旧账号的本机数据会并入新账号。
  共用一台设备的兄弟姐妹请各自用自己的浏览器资料夹或设备。

**隐私**：`user_state` 里是孩子的游戏和阅读进度，对应登录用的邮箱；每个账号只能读写
自己的行，网站前端读不到别人的。你在 Supabase 后台能看到所有行，对外的隐私说明里
应当写明会保存这些进度。

**测试**：`node tools/state_sync_test.js` 跑 61 项检查，包括两台设备先后改动、同时改动、
并发写入被拒、离线、换账号、异常云端数据等场景，不连真实数据库。

## 账号数量（Stats 页 "Accounts"）

Stats 页的 "Accounts (email sign-ins)" 显示真实的邮箱账号数：已确认的账号、近 7 天新增、
近 7 天活跃（登录且有新数据同步）、已备份宠物的人数，以及"输入了邮箱但没点登录链接"的人数。
只显示汇总数字，不返回任何邮箱。

先在 Supabase 的 SQL Editor 里运行一次 `supabase/account_stats.sql`（只创建一个函数
`get_account_stats()`，可重复运行）。没运行之前，Stats 页这一块只显示一条提示。

也可以直接在 Supabase 后台 **Authentication → Users** 里看账号列表。

## 让登录邮件可靠：自定义发件服务 + 验证码登录

**为什么要做**：Supabase 自带的邮件服务只是用来试用的。2026-10-10 在后台查到
Authentication → Rate Limits 里 "Rate limit for sending emails" 是 **2 封/小时**（整个项目共用，
灰色，不接自己的发件服务就改不了）；邮件模板也要先接自己的发件服务才能编辑（现在的模板只有
一个英文链接，没有验证码）。要收费、要让家长可靠登录，必须换成自己的发件服务。

**现状**：域名 `learning-english-fun.com` 的注册商和 DNS 都在 Cloudflare（没有 MX 记录，
目前没有收邮件）。

**步骤**（Resend 为例，具体界面以服务商当前文档为准；其他服务商如 Brevo、Postmark 同理）：
1. 注册发件服务（需要你本人注册，我不能代注册）；添加发件域名 `learning-english-fun.com`。
   服务商会给几条 DNS 记录（SPF、DKIM，建议再加 DMARC），去 Cloudflare 的 DNS 页面添加，
   等服务商显示 "Verified"。
2. 在服务商创建一个 SMTP 密码（Resend 是 API Key，用户名固定为 `resend`，主机
   `smtp.resend.com`，端口 465）。**这串密钥只填在 Supabase 的表单里，不要发在聊天里、
   不要写进代码。**
3. Supabase → Authentication → Emails → **SMTP Settings** → 打开 "Enable custom SMTP"，
   发件人填 `login@learning-english-fun.com`（名字 `learningenglishfun`），再填上一步的
   主机、端口、用户名、密码。
4. Authentication → Rate Limits：自定义 SMTP 之后 "emails per hour" 才能修改，调大。
5. Authentication → Emails → Templates → **Magic link or OTP**：主题用
   `supabase/email_templates/magic_link_subject.txt`，正文用 `magic_link.html`
   （中英文，同时有 6 位验证码 `{{ .Token }}` 和一键登录按钮 `{{ .ConfirmationURL }}`）。
6. 把 `site/supabase-config.js` 里的 `emailCode` 改成 `true` 并推送。此后点 "Send link" 会
   同时出现 6 位验证码输入框：在微信等内置浏览器里点邮件链接会跳到别的浏览器、登录状态接不上，
   输入验证码就不受影响。**第 5 步之前不要打开这个开关**，否则邮件里没有验证码。
7. 用你自己的邮箱试一次完整流程，再分别试 Gmail 和 QQ/163 邮箱，确认收得到、不在垃圾箱。

**没配好之前**：登录框遇到发送太频繁（2 封/小时的限制）会显示中英文的友好提示，不再显示
英文报错原文。

## 首页的登录按钮

首页导航栏最右边是一个紧凑的中英文按钮 **Save progress 保存进度**，点开才显示一句话说明和邮箱框，
不再常驻一大块输入框和提示：

- 说明："Keep your pet, stars and progress on every device. 换手机、换电脑，宠物、星星和进度都不会丢。"
- 输入框 "Parent email 家长邮箱"，按钮 **Send link 发送登录链接**（点它只是往邮箱发一封登录链接，
  点开邮件里的链接后同步才开始，所以按钮不再叫 Sync）。
- 孩子领养了宠物，或读完 3 本书之后，按钮右上角出现一个**小红点**；领养宠物的同一次访问里就会出现，
  不用刷新；点开面板后小红点消失，不再出现。
- 点按钮外面或按 Esc 关闭面板。
- 登录后按钮变成：云朵打勾 + 邮箱，下面一行小字 "已登录，自动同步 · Sign out 退出"。
- 手机宽度（≤620px）以前把整个登录框隐藏了，手机上根本没法登录；现在手机上也显示，是一行
  全宽的细条，点开后面板在条下面展开。

## 访客地区（时区 / 语言 / 设备）

每条 `app_events` 记录还会带三个很粗的字段：设备时区 `tz`（如 `Asia/Shanghai`）、
浏览器语言 `lang`（如 `zh-CN`）、设备类型 `device`（`wechat` / `mobile` /
`tablet` / `desktop`）。**不记录 IP，也不记录完整的浏览器标识。** 用时区估算
来源地区：`Asia/Shanghai` 记为中国大陆，`Asia/Hong_Kong` 记为香港，美国的几个主要
时区记为美国；用 VPN 不影响时区，但在国外使用中国时区设备的人会被算成大陆，
隐私模式（如 Tor）上报的 `UTC` 会落在"其他"。

**上线顺序**：先在 Supabase 的 **SQL Editor** 里运行 `supabase/visitor_regions.sql`
（可重复运行，加的列允许为空，不影响已有数据和已有统计），再推送网站。万一顺序反了，
`stats.js` 发现数据库还没有这三列，会自动改发不带这三个字段的旧格式，基础统计不会中断，
只是还没有地区数据。

**怎么看**：
- Supabase → **Table Editor → `app_events`**：每条记录多出 `tz` / `lang` / `device` 三列。
- Supabase → **Table Editor → Views → `region_stats`**：按地区汇总的现成表格
  （visitors / visits / readers / book_opens）。这个视图只有你在后台能看，网站前端读不到。
- `site/stats.html`：多了"Where visitors come from"和"Devices"两块，来自
  `get_region_stats()`（只返回汇总数字，不动已有的 `get_public_stats()`）。

只有首页会发统计事件（直接打开某本书的网址不会计入），记录地区之前的访问在
汇总里显示为"未知"，补不回来。

## 反馈按钮

同一个 Supabase 项目里，还建一张 `feedback` 表，配合右下角悬浮的"💬 Feedback"
按钮（`site/feedback.js`，已经加进首页和每一本书的页面）。跟 `app_events` 一
样是**只允许写入**，谁都读不到别人提交的内容——包括网站前端代码自己。你在
Supabase 的 **Table Editor** 里用自己的账号登录查看提交的反馈。

建表的 SQL（在 SQL Editor 里运行一次）：

```sql
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  message text not null,
  email text,
  page_url text,
  page_title text,
  visitor_id text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Allow insert for everyone" on public.feedback
  for insert
  to anon, authenticated
  with check (true);
```

**怎么看反馈**：打开 `site/stats.html`，往下滚动到"💬 Feedback"区块。这个区块
需要用**你自己的邮箱**登录（跟首页"parent/teacher email"同一套魔法链接登录
方式）——登录后只有邮箱匹配的人才能看到反馈内容，别人就算知道这个网址、甚至
知道你的 anon key，也读不到任何一条反馈。页面上方的访问统计数字（总访问量等）
本身是公开的，不需要登录也能看，登录只影响下面这个反馈区块。

这背后靠的是下面这个数据库函数（在 SQL Editor 里运行，紧接着上面建表的 SQL
之后）：

```sql
create or replace function public.get_all_feedback()
returns setof public.feedback
language sql
stable
security definer
set search_path = public
as $$
  select * from public.feedback
  where auth.jwt() ->> 'email' = '你的邮箱@example.com'
  order by created_at desc;
$$;

grant execute on function public.get_all_feedback() to authenticated;
```

记得把 `你的邮箱@example.com` 换成你自己登录用的真实邮箱——只有用这个邮箱登录
才能看到反馈，其他任何邮箱登录都只会看到空列表。
