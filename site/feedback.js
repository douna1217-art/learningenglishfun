// Floating feedback button (optional, Supabase-backed).
//
// What this does:
// - Adds a small "💬 Feedback" button fixed in the bottom-right corner of
//   every page (homepage and every book reader).
// - Clicking it opens a tiny form: just a message textarea, nothing else
//   required — no email, no sign-in — to keep the bar to giving feedback
//   as low as possible.
// - Submitting inserts one row into the Supabase `feedback` table, tagged
//   with the page URL/title it was sent from, a random per-browser
//   visitor id, and — only if the reader already happens to be signed in
//   for Smart Review sync — their email/user id, so a reply is still
//   possible without ever asking for it. Nobody — including this site's
//   own frontend code — can read feedback back out through the anon key
//   (insert-only table, same pattern as app_events in stats.js). Read
//   submissions in the "💬 Feedback" section of stats.html (sign in there
//   with the owner's email).
// - If supabase-config.js still has placeholder values, this file quietly
//   does nothing: no button, no errors, no network calls.
//
// 中文说明：右下角悬浮的反馈按钮，点开只有一个留言框，不用填邮箱、不用登录，
// 尽量降低填写门槛。提交后写进 Supabase 的 feedback 表。这张表只允许"写入"，
// 任何人（包括本网站前端代码自己）都读不出别人提交的内容——只有你自己登录
// stats.html 里的"反馈"区块才能看到。没配置 Supabase 项目之前，这个文件什么都不做，
// 不会显示按钮。
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

  var css =
    "#lesFbBtn{position:fixed;right:18px;bottom:18px;z-index:999;border:0;border-radius:999px;" +
    "background:#e2483f;color:#fff;font-weight:900;font-family:Inter,ui-rounded,\"Trebuchet MS\",Arial,sans-serif;" +
    "padding:13px 18px;font-size:.92rem;cursor:pointer;box-shadow:0 10px 28px rgba(226,72,63,.38);" +
    "display:flex;align-items:center;gap:7px;transition:transform .15s}" +
    "#lesFbBtn:hover{transform:translateY(-2px)}" +
    "#lesFbOverlay{position:fixed;inset:0;z-index:3000;background:rgba(30,20,20,.4);display:none;" +
    "align-items:center;justify-content:center;padding:18px;font-family:Inter,ui-rounded,\"Trebuchet MS\",Arial,sans-serif}" +
    "#lesFbCard{background:#fff;border-radius:22px;max-width:420px;width:100%;padding:24px;" +
    "box-shadow:0 26px 60px rgba(0,0,0,.28)}" +
    "#lesFbCard h3{margin:0 0 6px;font-size:1.25rem;color:#2c2933}" +
    "#lesFbCard p{margin:0 0 16px;color:#766f80;font-size:.9rem;line-height:1.5}" +
    "#lesFbCard textarea{width:100%;min-height:100px;border:1.5px solid #e9e1ef;border-radius:13px;" +
    "padding:11px 13px;font:inherit;font-size:.95rem;resize:vertical;box-sizing:border-box}" +
    "#lesFbCard input[type=email]{width:100%;border:1.5px solid #e9e1ef;border-radius:13px;" +
    "padding:11px 13px;font:inherit;font-size:.95rem;margin-top:10px;box-sizing:border-box}" +
    "#lesFbCard label{display:block;font-size:.78rem;font-weight:800;color:#766f80;margin:12px 0 4px}" +
    "#lesFbActions{display:flex;gap:10px;margin-top:18px}" +
    "#lesFbActions button{flex:1;border:0;border-radius:12px;padding:12px;font-weight:900;cursor:pointer;font-size:.92rem}" +
    "#lesFbCancel{background:#f1edf7;color:#4a4552}" +
    "#lesFbSubmit{background:#4d9b52;color:#fff}" +
    "#lesFbSubmit:disabled{opacity:.55;cursor:not-allowed}" +
    "#lesFbStatus{margin-top:10px;font-size:.85rem;font-weight:800;min-height:1.2em}" +
    "#lesFbStatus.good{color:#2f7c34}#lesFbStatus.bad{color:#c0392b}";
  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  var btn = document.createElement("button");
  btn.id = "lesFbBtn";
  btn.innerHTML = "💬 Feedback";
  document.body.appendChild(btn);

  var overlay = document.createElement("div");
  overlay.id = "lesFbOverlay";
  overlay.innerHTML =
    '<div id="lesFbCard">' +
    "<h3>Send feedback</h3>" +
    "<p>Found a problem, or have an idea? Tell us — thank you!</p>" +
    '<textarea id="lesFbMsg" placeholder="What\'s on your mind..."></textarea>' +
    '<div id="lesFbActions">' +
    '<button id="lesFbCancel" type="button">Cancel</button>' +
    '<button id="lesFbSubmit" type="button">Send</button>' +
    "</div>" +
    '<div id="lesFbStatus"></div>' +
    "</div>";
  document.body.appendChild(overlay);

  var msgEl = overlay.querySelector("#lesFbMsg");
  var statusEl = overlay.querySelector("#lesFbStatus");
  var submitBtn = overlay.querySelector("#lesFbSubmit");

  function openModal() {
    overlay.style.display = "flex";
    statusEl.textContent = "";
    statusEl.className = "";
    setTimeout(function () {
      msgEl.focus();
    }, 30);
  }
  function closeModal() {
    overlay.style.display = "none";
  }

  btn.addEventListener("click", openModal);
  overlay.querySelector("#lesFbCancel").addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });

  submitBtn.addEventListener("click", function () {
    var message = (msgEl.value || "").trim();
    if (!message) {
      statusEl.textContent = "Please write a message first.";
      statusEl.className = "bad";
      return;
    }
    submitBtn.disabled = true;
    statusEl.textContent = "Sending...";
    statusEl.className = "";

    sb.auth.getSession().then(function (res) {
      var user = res && res.data && res.data.session && res.data.session.user;
      // No email field in the form (kept the bar to submitting as low as
      // possible) — if the visitor happens to already be signed in for
      // Smart Review sync, tag their email automatically so a reply is
      // still possible; otherwise it's just left blank.
      return sb.from("feedback").insert({
        message: message,
        email: user ? user.email : null,
        page_url: location.href,
        page_title: document.title,
        visitor_id: visitorId(),
        user_id: user ? user.id : null,
      });
    }).then(function (res) {
      if (res && res.error) throw res.error;
      statusEl.textContent = "Thank you! Your feedback was sent. 🎉";
      statusEl.className = "good";
      msgEl.value = "";
      setTimeout(closeModal, 1600);
    }).catch(function (err) {
      statusEl.textContent = "Could not send — please try again.";
      statusEl.className = "bad";
    }).finally(function () {
      submitBtn.disabled = false;
    });
  });
})();
