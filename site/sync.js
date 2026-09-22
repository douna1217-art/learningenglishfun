// Cloud sync for Smart Review progress (optional).
//
// How it works:
// - Review progress is always kept in localStorage under the key "les_review_v1"
//   (same as before — nothing about that changes, the site still works offline).
// - If supabase-config.js has real project values, signing in with an email link
//   will additionally back up that data to Supabase and pull it back down on any
//   other device signed in with the same email — so progress follows the reader.
// - If supabase-config.js still has placeholder values, this file quietly does
//   nothing (no errors, no UI, no network calls).
//
// 中文说明：登录后会把本地的复习进度（les_review_v1）同步到 Supabase，换设备用同一个
// 邮箱登录也能看到一样的复习进度。没配置 Supabase 项目之前，这个文件什么都不做，
// 网站照常只用本地浏览器存储，不受任何影响。
(function () {
  var cfg = window.SUPABASE_CONFIG;
  var configured =
    window.supabase &&
    cfg &&
    cfg.url &&
    cfg.anonKey &&
    cfg.url.indexOf("YOUR-PROJECT") === -1 &&
    cfg.anonKey.indexOf("YOUR-ANON-KEY") === -1;

  if (!configured) return; // stay silent until a real Supabase project is configured

  // Shared with stats.js so the page only ever creates one GoTrueClient.
  var sb = window.__lesSupabaseClient || (window.__lesSupabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey));
  var K = "les_review_v1";
  var pushTimer = null;

  function loadLocal() {
    try {
      var db = JSON.parse(localStorage.getItem(K) || "{}");
      db.items = db.items || {};
      return db;
    } catch (e) {
      return { items: {} };
    }
  }
  function saveLocal(db) {
    try {
      localStorage.setItem(K, JSON.stringify(db));
    } catch (e) {}
  }

  function schedulePush() {
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(pushNow, 1500);
  }

  async function pushNow() {
    var session = (await sb.auth.getSession()).data.session;
    if (!session) return;
    var db = loadLocal();
    await sb.from("review_progress").upsert({
      user_id: session.user.id,
      items: db.items,
      updated_at: new Date().toISOString(),
    });
  }

  // Keep whichever copy of each card shows more progress (higher box number).
  function mergeItems(localItems, remoteItems) {
    var out = {},
      k;
    for (k in remoteItems) out[k] = remoteItems[k];
    for (k in localItems) {
      var l = localItems[k],
        r = out[k];
      if (!r || (l.box || 1) >= (r.box || 1)) out[k] = l;
    }
    return out;
  }

  async function pullAndMerge() {
    var session = (await sb.auth.getSession()).data.session;
    if (!session) return;
    var res = await sb
      .from("review_progress")
      .select("items")
      .eq("user_id", session.user.id)
      .maybeSingle();
    var db = loadLocal();
    var remoteItems = (res.data && res.data.items) || {};
    db.items = mergeItems(db.items, remoteItems);
    saveLocal(db);
    if (window.__updateReviewBadge) window.__updateReviewBadge();
    await pushNow(); // write the merged result back so both sides match
  }

  // Catch writes made by index.html's own review script (same document —
  // the native "storage" event does NOT fire for same-document writes).
  var origSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key, value) {
    origSetItem(key, value);
    if (key === K) schedulePush();
  };

  // Catch writes made inside a book page's <iframe> — same-origin iframes
  // DO fire a native "storage" event on the parent window automatically.
  window.addEventListener("storage", function (e) {
    if (e.key === K) schedulePush();
  });

  // Soft reminder: once a reader has finished a few whole books on this
  // device, gently suggest saving progress by email -- not a gate, just a
  // friendlier nudge shown above the always-available sync form. Counts
  // distinct books where every tab (comprehension/grammar/vocabulary) is
  // marked complete, by scanning the per-book "les-<slug>-v1" keys that
  // every book page already writes via saveProgress() (see
  // tools/templates/human_book_tail.js and the Math/Science/CS template).
  var HINT_THRESHOLD = 3;
  var HINT_DISMISSED_KEY = "les_sync_hint_dismissed";

  function countCompletedBooks() {
    var n = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (!key || !/^les-.+-v1$/.test(key)) continue;
        var data = JSON.parse(localStorage.getItem(key) || "{}");
        var c = data.completed;
        if (c && c.comprehension && c.grammar && c.vocabulary) n++;
      }
    } catch (e) {}
    return n;
  }

  function renderAuthUI(session) {
    var box = document.getElementById("syncBox");
    if (!box) return;
    if (session) {
      box.innerHTML =
        '<span style="font-weight:800">☁️ ' +
        (session.user.email || "Synced") +
        '</span> <button id="syncOut" style="margin-left:8px;border:0;background:transparent;color:var(--green);font-weight:900;cursor:pointer;text-decoration:underline">Sign out</button>';
      document.getElementById("syncOut").onclick = function () {
        sb.auth.signOut();
      };
    } else {
      var hintHtml = "";
      var showHint = false;
      try {
        showHint =
          countCompletedBooks() >= HINT_THRESHOLD &&
          !localStorage.getItem(HINT_DISMISSED_KEY);
      } catch (e) {}
      if (showHint) {
        hintHtml =
          '<div id="syncHint" style="background:#fff6e0;border:1px solid #f0d896;border-radius:12px;padding:10px 12px;margin-bottom:8px;font-size:.82rem;line-height:1.5;position:relative">' +
          '<button id="syncHintClose" aria-label="关闭" style="position:absolute;top:6px;right:8px;border:0;background:transparent;color:var(--muted);cursor:pointer;font-size:1rem;line-height:1">×</button>' +
          '<span style="padding-right:16px;display:inline-block">🎉 孩子已经读完好几本书啦！留个邮箱，换设备也能接着读，进度不会丢。</span>' +
          "</div>";
      }
      box.innerHTML =
        hintHtml +
        '<form id="syncForm" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">' +
        '<input id="syncEmail" type="email" placeholder="parent/teacher email" required style="border:1px solid var(--line);border-radius:10px;padding:8px 10px;font-size:.85rem;width:180px">' +
        '<button type="submit" style="border:0;background:var(--green);color:#fff;border-radius:10px;padding:8px 12px;font-weight:900;cursor:pointer">Sync progress</button>' +
        '</form><span id="syncMsg" style="font-size:.78rem;color:var(--muted);display:block;margin-top:4px"></span>';
      if (showHint) {
        document.getElementById("syncHintClose").onclick = function () {
          try {
            localStorage.setItem(HINT_DISMISSED_KEY, "1");
          } catch (e) {}
          var hint = document.getElementById("syncHint");
          if (hint) hint.remove();
        };
      }
      document.getElementById("syncForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        var email = document.getElementById("syncEmail").value.trim();
        var msg = document.getElementById("syncMsg");
        msg.textContent = "Sending link…";
        var res = await sb.auth.signInWithOtp({
          email: email,
          options: { emailRedirectTo: window.location.href },
        });
        msg.textContent = res.error
          ? "Error: " + res.error.message
          : "Check your email for a sign-in link ✉️ 请查收邮箱里的登录链接";
      });
    }
  }

  sb.auth.onAuthStateChange(function (event, session) {
    renderAuthUI(session);
    if (session) pullAndMerge();
  });

  document.addEventListener("DOMContentLoaded", async function () {
    var session = (await sb.auth.getSession()).data.session;
    renderAuthUI(session);
    if (session) pullAndMerge();
  });
})();
