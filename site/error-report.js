// A light error log (optional): when the page breaks or a word cannot be played, one small anonymous event goes to the same table as the usage
// stats (stats.js, through window.__trackEvent): event_type "js_error"; book_id = the kind (error / promise / audio), book_title = the message (at most 120
// characters, links and e-mail addresses cut out), category = file:line and a coarse browser name (Safari / Chrome / ...). No user-agent string, no IP address,
// nothing about the child. At most 6 different errors are sent for each page load. The numbers come back through get_error_stats() (supabase/error_stats.sql) on stats.html.
//
// 中文说明：页面出错、或者单词发不出声时，往统计表里写一条很小的匿名记录：哪种错误、出错信息（最多 120 字，网址和邮箱会被去掉）、
// 哪个文件第几行、大致是哪种浏览器（Safari / Chrome …）。不记录完整浏览器标识、IP，也不记录孩子的任何信息；每次打开页面最多发 6 条不同的错误。
(function (root) {
  "use strict";

  var MAX = 6,
    sent = 0,
    seen = {},
    queue = [],
    tries = 0,
    timer = null;

  // coarse: the family of the browser, never the full string
  function browser(ua) {
    ua = String(ua || "");
    if (/MicroMessenger/i.test(ua)) return "WeChat";
    if (/Edg\//.test(ua)) return "Edge";
    if (/Firefox\//.test(ua)) return "Firefox";
    if (/CriOS|Chrome\//.test(ua)) return "Chrome";
    if (/Safari\//.test(ua)) return "Safari";
    return "other";
  }
  function clean(msg) {
    return String(msg === undefined || msg === null ? "" : msg)
      .replace(/https?:\/\/\S+/g, "[link]")
      .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
  }
  // the file name only (no folders, no query string) and the line
  function where(src, line) {
    var f = String(src || "").split("?")[0].split("#")[0].split("/").pop();
    return (f || "page") + (line ? ":" + line : "");
  }
  // errors that say nothing we could fix
  function noise(msg, src) {
    return !msg || /^Script error\.?$/i.test(msg) || /ResizeObserver loop/i.test(msg) || /^(chrome|moz|safari)-extension:/i.test(String(src || ""));
  }
  function make(kind, msg, src, line, ua) {
    var m = clean(msg);
    if (noise(m, src)) return null;
    var w = where(src, line);
    return { kind: kind, msg: m, where: w + " · " + browser(ua), key: kind + "|" + m + "|" + w };
  }

  function deliver(r) {
    if (root.__trackEvent) {
      try {
        root.__trackEvent("js_error", { book_id: r.kind, book_title: r.msg, category: r.where });
      } catch (e) {}
      return;
    }
    // stats.js is loaded later in the page: wait for it a few times
    queue.push(r);
    if (!timer && root.setInterval)
      timer = root.setInterval(function () {
        if (root.__trackEvent || ++tries > 10) {
          root.clearInterval(timer);
          timer = null;
          var q = queue;
          queue = [];
          if (root.__trackEvent) q.forEach(deliver);
        }
      }, 2000);
  }

  function report(kind, msg, src, line) {
    if (sent >= MAX) return false;
    var r = make(kind, msg, src, line, root.navigator && root.navigator.userAgent);
    if (!r || seen[r.key]) return false;
    seen[r.key] = 1;
    sent++;
    deliver(r);
    return true;
  }

  var core = { browser: browser, clean: clean, where: where, noise: noise, make: make, MAX: MAX };
  if (typeof module !== "undefined" && module.exports) module.exports = core;
  if (!root.addEventListener) return;

  root.addEventListener("error", function (e) {
    if (e && e.target && e.target !== root) return; // a picture or script that did not load, not a code error
    report("error", e && e.message, e && e.filename, e && e.lineno);
  });
  root.addEventListener("unhandledrejection", function (e) {
    var r = e && e.reason;
    report("promise", r && r.message ? r.message : r, "", 0);
  });
  // the games call this when a word cannot be played
  root.__reportError = function (kind, msg) {
    report(kind || "error", msg, "", 0);
  };
})(typeof window !== "undefined" ? window : globalThis);
