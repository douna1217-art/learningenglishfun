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
