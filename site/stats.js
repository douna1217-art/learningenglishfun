// Lightweight, privacy-friendly usage stats (optional).
//
// What this does:
// - Fires small "insert-only" events into the Supabase `app_events` table:
//   page_view (once per browser tab session), book_open (when a book is
//   opened, with its title + topic), review_correct / review_wrong (Smart
//   Review answers).
// - Nobody — including this site's own frontend code — can read other
//   people's raw rows back out (the table has no SELECT policy). The only
//   way to get numbers back out is the get_public_stats() database function,
//   which only ever returns pre-computed totals, never individual rows.
// - If supabase-config.js still has placeholder values, this file quietly
//   does nothing: no tracking, no errors, no network calls.
//
// 中文说明：这里只是往 Supabase 的 app_events 表里"写"几条很小的记录（打开了首页 /
// 打开了哪本书 / 复习答对答错），没有开放"读"的权限，谁都读不到别人的原始记录；
// 唯一能拿到数字的方式是 get_public_stats() 这个数据库函数，它只返回汇总统计，
// 不会泄露任何一条具体记录。没配置 Supabase 项目之前，这个文件什么都不做。
(function () {
  var cfg = window.SUPABASE_CONFIG;
  var configured =
    window.supabase &&
    cfg &&
    cfg.url &&
    cfg.anonKey &&
    cfg.url.indexOf("YOUR-PROJECT") === -1 &&
    cfg.anonKey.indexOf("YOUR-ANON-KEY") === -1;
  if (!configured) return;

  // Reuse the same client sync.js creates, if it already ran.
  var sb = window.__lesSupabaseClient;
  if (!sb) {
    sb = window.supabase.createClient(cfg.url, cfg.anonKey);
    window.__lesSupabaseClient = sb;
  }

  function visitorId() {
    try {
      var id = localStorage.getItem("les_visitor_id");
      if (!id) {
        id =
          window.crypto && window.crypto.randomUUID
            ? window.crypto.randomUUID()
            : Date.now() + "-" + Math.random().toString(16).slice(2);
        localStorage.setItem("les_visitor_id", id);
      }
      return id;
    } catch (e) {
      return null;
    }
  }

  async function track(eventType, extra) {
    try {
      var session = sb.auth ? (await sb.auth.getSession()).data.session : null;
      var row = Object.assign(
        {
          event_type: eventType,
          visitor_id: visitorId(),
          user_id: session ? session.user.id : null,
        },
        extra || {}
      );
      // Fire-and-forget: never block the UI, never surface errors to the user.
      sb.from("app_events")
        .insert(row)
        .then(function () {}, function () {});
    } catch (e) {}
  }

  window.__trackEvent = track;

  try {
    if (!sessionStorage.getItem("les_pv_sent")) {
      sessionStorage.setItem("les_pv_sent", "1");
      track("page_view");
    }
  } catch (e) {
    track("page_view");
  }
})();
