// Supabase 项目配置 —— 上线前请替换成你自己项目的值。
//
// 1) 去 https://supabase.com 注册/登录，New project 建一个新项目。
// 2) 项目建好后，去左侧菜单 Settings → API，能看到：
//      Project URL          -> 填到下面的 url
//      anon / public key    -> 填到下面的 anonKey
// 3) 这两个值本来就是设计给浏览器用的，前端代码里能看到也没关系——
//    真正的安全性由 Supabase 数据库的 Row Level Security（行级安全）规则保证。
//    不要把 service_role key 填在这里！那个 key 能绕过所有权限，绝对不能出现在前端代码里。
// 4) 别忘了在 Supabase 的 SQL Editor 里运行 SUPABASE_SETUP.md 里的建表语句。
//
// 在你填好真实值之前，网站会自动跳过云同步这一步，一切照常在本地浏览器里工作，
// 不会报错，也不会影响看书、答题、复习等任何现有功能。
window.SUPABASE_CONFIG = {
  url: "https://thdktsiyuelogqqgzbex.supabase.co",
  anonKey: "sb_publishable_DyvuuXQL2Qq8d7UaT2ODYg_HpeU9VG3"
};
