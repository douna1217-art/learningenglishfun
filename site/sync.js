// Sign-in box (optional): email link or 6-digit code, via Supabase.
//
// How it works:
// - One compact button, "Save progress 保存进度", opens a short explanation and the
//   email form. After sign-in, account.js takes over the box (the child's name,
//   a switcher between the 2 children, the parent area).
// - What gets synced (pet, stars, book progress, Smart Review, level test) lives
//   in state-sync.js and is stored per child. This file no longer syncs anything.
// - If supabase-config.js still has placeholder values, this file quietly does
//   nothing (no errors, no UI, no network calls).
//
// 中文说明：这个文件只负责首页右上角的登录框（邮箱链接或 6 位验证码）。登录之后，孩子档案和
// 切换由 account.js 负责，宠物、星星、进度、复习记录的同步由 state-sync.js 负责（按孩子分开存）。
// 没配置 Supabase 项目之前，这个文件什么都不做。
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
  // Sign-in box. By default it is one compact button, "Save progress 保存进度";
  // clicking it opens a short explanation and the email form. A small red dot
  // on the button nudges the reader once the child has something worth saving
  // (an adopted pet, or a few finished books). Counts distinct books where every
  // tab (comprehension/grammar/vocabulary) is marked complete, by scanning the
  // per-book "les-<slug>-v1" keys that every book page already writes via
  // saveProgress() (see tools/templates/human_book_tail.js and the
  // Math/Science/CS template). Opening the panel counts as having seen the nudge.
  var HINT_THRESHOLD = 3;
  var HINT_DISMISSED_KEY = "les_sync_hint_dismissed";

  function hasPet() {
    try {
      var p = JSON.parse(localStorage.getItem("lef_pet_v1") || "null");
      return !!(p && p.type);
    } catch (e) {
      return false;
    }
  }
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
  function shouldShowHint() {
    try {
      if (localStorage.getItem(HINT_DISMISSED_KEY)) return false;
    } catch (e) {}
    return hasPet() || countCompletedBooks() >= HINT_THRESHOLD;
  }

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var ICON_CLOUD =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17.2 9.4 4.3 4.3 0 0 1 17 18H7z"/><path d="M12 16v-5M9.6 13.2 12 10.8l2.4 2.4"/></svg>';
  var ICON_CHECK =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17.2 9.4 4.3 4.3 0 0 1 17 18H7z"/><path d="M9.5 13.6l2.1 2.1 3.9-3.9"/></svg>';
  var ICON_CHEV = '<svg class="sy-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  function injectStyle() {
    if (document.getElementById("syncStyle")) return;
    var st = document.createElement("style");
    st.id = "syncStyle";
    st.textContent =
      "#syncBox.teacher.sync2{position:relative;padding:6px 14px;white-space:normal;font-weight:700}" +
      ".sync2 .sy-pill{display:flex;align-items:center;gap:9px;width:100%;margin:0;padding:0;border:0;background:none;color:#1E2A4A;font:inherit;text-align:left;cursor:pointer}" +
      ".sync2 .sy-static{cursor:default}" +
      ".sync2 .sy-pill:focus-visible,.sync2 .sy-go:focus-visible,.sync2 .sy-link:focus-visible{outline:3px solid rgba(49,95,71,.4);outline-offset:3px;border-radius:8px}" +
      ".sync2 .sy-t{display:block;font-weight:800;font-size:15px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:210px}" +
      ".sync2 .sy-c{display:block;font-weight:700;font-size:12px;line-height:1.25;color:#4A5878;white-space:nowrap}" +
      ".sync2 svg{flex:none;width:22px;height:22px;stroke:#315f47;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}" +
      ".sync2 .sy-chev{width:16px;height:16px;stroke:#4A5878;transition:transform .15s}" +
      ".sync2 .sy-pill[aria-expanded=true] .sy-chev{transform:rotate(180deg)}" +
      ".sync2 .sy-dot{display:none;position:absolute;top:-5px;right:-5px;width:12px;height:12px;border-radius:50%;background:#e2483f;border:2px solid #fff}" +
      ".sync2 .sy-dot.on{display:block}" +
      ".sync2 .sy-panel{position:absolute;right:0;top:calc(100% + 8px);z-index:30;box-sizing:border-box;width:330px;max-width:calc(100vw - 28px);padding:12px 14px;background:#fff;border:1px solid var(--line,#dfe8e1);border-radius:15px;box-shadow:0 12px 30px rgba(30,42,74,.14);white-space:normal;font-weight:700}" +
      ".sync2 .sy-panel.sy-l{right:auto;left:0}" +
      ".sync2 .sy-panel[hidden]{display:none}" +
      ".sync2 .sy-p{margin:0 0 9px;font-size:13px;line-height:1.45;color:#1E2A4A}" +
      ".sync2 .sy-p span{display:block;font-size:12px;color:#4A5878}" +
      ".sync2 .sy-row{display:flex;gap:8px;flex-wrap:wrap;margin:0}" +
      ".sync2 .sy-row[hidden]{display:none}" +
      ".sync2 #syncCodeForm{margin-top:8px}" +
      ".sync2 #syncCode{letter-spacing:3px;font-weight:800}" +
      ".sync2 .sy-row input{flex:1 1 140px;min-width:0;box-sizing:border-box;border:1px solid var(--line,#dfe8e1);border-radius:10px;padding:9px 10px;font-size:14px;color:#1E2A4A;background:#fff}" +
      ".sync2 .sy-go{border:0;border-radius:10px;padding:6px 14px;background:var(--green,#315f47);color:#fff;font:inherit;line-height:1.2;cursor:pointer}" +
      ".sync2 .sy-go b{display:block;font-size:13px;font-weight:800}" +
      ".sync2 .sy-go s{display:block;text-decoration:none;font-size:11px;font-weight:700;opacity:.92}" +
      ".sync2 .sy-msg{display:block;margin-top:6px;font-size:12px;color:#4A5878}" +
      ".sync2 .sy-link{border:0;background:none;padding:0;color:var(--green,#315f47);font:inherit;font-weight:800;text-decoration:underline;cursor:pointer}" +
      "@media(max-width:620px){#syncBox.teacher.sync2{width:100%;box-sizing:border-box;padding:8px 14px}" +
      ".sync2 .sy-pill{width:100%}.sync2 .sy-chev{margin-left:auto}" +
      ".sync2 .sy-panel,.sync2 .sy-panel.sy-l{position:static;width:auto;max-width:none;margin-top:10px;padding:10px 0 0;border:0;border-top:1px solid var(--line,#dfe8e1);border-radius:0;box-shadow:none}" +
      ".sync2 .sy-dot{right:10px}}";
    document.head.appendChild(st);
  }

  var shownSession = null;
  var outsideBound = false;
  var pendingEmail = null;
  // supabase-config.js: `emailCode: true` once the "Magic link or OTP" email
  // template in Supabase contains {{ .Token }}. Then the panel also asks for the
  // 6-digit code from the email (works when the link opens in a different
  // browser, e.g. inside WeChat). Off by default: with the stock template there
  // is no code in the email.
  var useCode = !!(cfg && cfg.emailCode);

  function friendlyError(err) {
    var m = (err && err.message) || "";
    if ((err && (err.status === 429 || err.code === "over_email_send_rate_limit")) || /rate limit/i.test(m)) {
      return "Too many emails right now. Please try again in a little while. 发送太频繁，请稍后再试。";
    }
    return "Couldn't send the email. Please try again. 发送失败，请稍后重试。";
  }

  function closeSync() {
    var p = document.getElementById("syncPanel");
    var t = document.getElementById("syncToggle");
    if (p && !p.hidden) {
      p.hidden = true;
      if (t) t.setAttribute("aria-expanded", "false");
    }
  }
  function bindOutside() {
    if (outsideBound) return;
    outsideBound = true;
    document.addEventListener("click", function (e) {
      var box = document.getElementById("syncBox");
      if (box && !box.contains(e.target)) closeSync();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSync();
    });
  }

  // red dot on the button: only while signed out and the child has something to save
  function updateDot() {
    var d = document.getElementById("syncDot");
    if (!d) return;
    var on = false;
    try {
      on = !shownSession && shouldShowHint();
    } catch (e) {}
    d.className = "sy-dot" + (on ? " on" : "");
    var t = document.getElementById("syncToggle");
    if (t) t.title = on ? "Keep your pet and stars on every device 登录后换设备，宠物和星星不会丢" : "";
  }

  function renderAuthUI(session) {
    var box = document.getElementById("syncBox");
    if (!box) return;
    shownSession = session;
    injectStyle();
    box.classList.add("sync2");

    if (session) {
      if (window.__lesAccount && window.__lesAccount.renderHeader) {
        window.__lesAccount.renderHeader(box, session);
        return;
      }
      var email = esc(session.user.email || "Signed in");
      box.innerHTML =
        '<div class="sy-pill sy-static">' + ICON_CHECK +
        '<span><span class="sy-t" title="' + email + '">' + email + "</span>" +
        '<span class="sy-c">已登录，自动同步 · <button type="button" id="syncOut" class="sy-link">Sign out 退出</button></span></span></div>';
      document.getElementById("syncOut").onclick = function () {
        sb.auth.signOut();
      };
      return;
    }

    box.innerHTML =
      '<button type="button" id="syncToggle" class="sy-pill" aria-expanded="false" aria-controls="syncPanel">' +
      ICON_CLOUD +
      '<span><span class="sy-t">Save progress</span><span class="sy-c">保存进度</span></span>' +
      ICON_CHEV +
      "</button>" +
      '<span id="syncDot" class="sy-dot" aria-hidden="true"></span>' +
      '<div id="syncPanel" class="sy-panel" hidden>' +
      '<p class="sy-p">Keep your pet, stars and progress on every device.<span>换手机、换电脑，宠物、星星和进度都不会丢。</span></p>' +
      '<form id="syncForm" class="sy-row">' +
      '<input id="syncEmail" type="email" placeholder="Parent email 家长邮箱" aria-label="Parent email 家长邮箱" autocomplete="email" required>' +
      '<button type="submit" class="sy-go"><b>Send link</b><s>发送登录链接</s></button>' +
      "</form>" +
      '<span id="syncMsg" class="sy-msg" role="status"></span>' +
      (useCode
        ? '<form id="syncCodeForm" class="sy-row" hidden>' +
          '<input id="syncCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" placeholder="6-digit code 6位验证码" aria-label="6-digit code 6位验证码" required>' +
          '<button type="submit" class="sy-go"><b>Verify</b><s>验证</s></button>' +
          "</form>"
        : "") +
      "</div>";

    var toggle = document.getElementById("syncToggle");
    var panel = document.getElementById("syncPanel");
    toggle.onclick = function () {
      if (!panel.hidden) {
        closeSync();
        return;
      }
      var r = box.getBoundingClientRect();
      // open towards the left (the box usually sits at the right of the nav); if
      // there is no room on the left, open towards the right instead
      panel.className = "sy-panel" + (r.right < 344 ? " sy-l" : "");
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      try {
        localStorage.setItem(HINT_DISMISSED_KEY, "1");
      } catch (e) {}
      updateDot();
      try {
        document.getElementById("syncEmail").focus({ preventScroll: true });
      } catch (e) {}
    };
    bindOutside();

    document.getElementById("syncForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      var email = document.getElementById("syncEmail").value.trim();
      var msg = document.getElementById("syncMsg");
      msg.textContent = "Sending… 发送中…";
      var res = await sb.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: window.location.href },
      });
      if (res.error) {
        msg.textContent = friendlyError(res.error);
        return;
      }
      pendingEmail = email;
      if (useCode) {
        msg.textContent = "We emailed you a 6-digit code. 我们发了一封带 6 位验证码的邮件。";
        var cf = document.getElementById("syncCodeForm");
        cf.hidden = false;
        try {
          document.getElementById("syncCode").focus({ preventScroll: true });
        } catch (e2) {}
      } else {
        msg.textContent = "Check your email for the link ✉️ 请查收邮箱里的登录链接";
      }
    });

    if (useCode) {
      document.getElementById("syncCodeForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        var msg = document.getElementById("syncMsg");
        var token = document.getElementById("syncCode").value.replace(/\D/g, "");
        msg.textContent = "Checking… 验证中…";
        var res = await sb.auth.verifyOtp({ email: pendingEmail, token: token, type: "email" });
        msg.textContent = res.error
          ? "That code didn't work. Check it, or send a new one. 验证码不对或已过期，请检查或重新发送。"
          : "Signed in 登录成功";
      });
    }
    updateDot();
  }

  sb.auth.onAuthStateChange(function (event, session) {
    renderAuthUI(session);
  });

  // Adopting a pet during this visit should light the dot straight away, not on
  // the next page load. This only toggles the dot; it never redraws the box.
  setInterval(function () {
    if (!document.hidden) updateDot();
  }, 4000);

  document.addEventListener("DOMContentLoaded", async function () {
    var session = (await sb.auth.getSession()).data.session;
    renderAuthUI(session);
  });
})();
