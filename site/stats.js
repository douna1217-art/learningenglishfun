// Lightweight, privacy-friendly usage stats (optional).
//
// What this does:
// - Fires small "insert-only" events into the Supabase `app_events` table:
//   page_view (once per browser tab session), book_open (when a book is
//   opened, with its title + topic), review_correct / review_wrong (Smart
//   Review answers).
// - Every event also carries three coarse, non-identifying fields: the
//   device time zone (e.g. "Asia/Shanghai"), the browser language, and a
//   device class (wechat / mobile / tablet / desktop). No IP address and no
//   raw user-agent string is sent or stored. They let the owner see roughly
//   where visitors come from (mainland China / Hong Kong / USA ...).
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
// 每条记录还会带上设备时区、浏览器语言、设备类型（微信/手机/平板/电脑）三个很粗的
// 字段，用来估算访客大致来自哪里；不记录 IP，也不记录完整的浏览器标识。
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

  // Coarse visitor context, computed once. Deliberately NOT an IP and NOT the
  // full user-agent: just the time zone, the language and a device class.
  function deviceClass() {
    var ua = navigator.userAgent || "";
    if (/MicroMessenger/i.test(ua)) return "wechat";
    if (/iPad|Tablet/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "tablet";
    if (/Android/i.test(ua)) return /Mobile/i.test(ua) ? "mobile" : "tablet";
    if (/iPhone|iPod|Mobi/i.test(ua)) return "mobile";
    return "desktop";
  }
  var ctx = null;
  function context() {
    if (ctx) return ctx;
    ctx = {};
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) ctx.tz = String(tz).slice(0, 64);
    } catch (e) {}
    try {
      if (navigator.language) ctx.lang = String(navigator.language).slice(0, 16);
    } catch (e) {}
    try {
      ctx.device = deviceClass();
    } catch (e) {}
    return ctx;
  }

  // If the tz / lang / device columns do not exist in Supabase yet (the SQL
  // in SUPABASE_SETUP.md has not been run), the database rejects the whole
  // row. In that case resend it without the extra fields so the basic
  // stats never go dark.
  var extrasOk = true;
  function isMissingColumn(err) {
    return !!err && (err.code === "PGRST204" || err.code === "42703" || /column/i.test(err.message || ""));
  }

  async function track(eventType, extra) {
    try {
      var session = sb.auth ? (await sb.auth.getSession()).data.session : null;
      var base = Object.assign(
        {
          event_type: eventType,
          visitor_id: visitorId(),
          user_id: session ? session.user.id : null,
        },
        extra || {}
      );
      var row = extrasOk ? Object.assign({}, context(), base) : base;
      // Fire-and-forget: never block the UI, never surface errors to the user.
      sb.from("app_events")
        .insert(row)
        .then(
          function (res) {
            if (extrasOk && res && isMissingColumn(res.error)) {
              extrasOk = false;
              sb.from("app_events").insert(base).then(function () {}, function () {});
            }
          },
          function () {}
        );
    } catch (e) {}
  }

  window.__trackEvent = track;

  // Where did this visit come from? ?src=/?utm_source= wins (e.g. the QR
  // poster can link to /?src=qr-poster); otherwise the referring site's
  // domain; otherwise "direct".
  function pageSource() {
    try {
      var params = new URLSearchParams(location.search);
      var tagged = params.get("src") || params.get("utm_source");
      if (tagged) return tagged;
      if (document.referrer) {
        var refHost = new URL(document.referrer).hostname;
        if (refHost && refHost !== location.hostname) return refHost;
      }
      return "direct";
    } catch (e) {
      return "direct";
    }
  }

  try {
    if (!sessionStorage.getItem("les_pv_sent")) {
      sessionStorage.setItem("les_pv_sent", "1");
      track("page_view", { source: pageSource() });
    }
  } catch (e) {
    track("page_view", { source: pageSource() });
  }
})();
