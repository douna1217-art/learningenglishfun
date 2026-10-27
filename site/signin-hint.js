/* Tells parents plainly whether the child's progress is being saved to an account.

   Why: pet, stars and progress are kept on the device until a parent signs in AND has finished setting up a child (consent + a child profile, see account.js).
   Before this, signed out visitors only saw a small "Save progress" button with a red dot, so a parent could believe it was saved and lose everything
   when the browser cleared its data or when they changed device.

   Three states, shown as a card on the homepage (above today's goals) and on the sight-words home:
     out    not signed in, and there is something worth keeping  ->  "only on this device", button "Save progress"
     setup  signed in, but no child profile yet (nothing is synced)  ->  "one more step", button "Finish setup"
     ok     signed in with a child: nothing is shown; one short "saved to your account" note appears right after signing in
   The "out" card can be put away for a day (x); the "setup" card cannot, because nothing is being saved while it shows.

   SignInHint.html(where) -> the card as html ("" when nothing should be shown)      SignInHint.render()      SignInHint.state()
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";

  var KEY_OFF = "lef_signin_hint_off",
    KEY_TOAST = "lef_signin_toast_at",
    DAY = 24 * 3600 * 1000,
    TOAST_EVERY = 12 * 3600 * 1000,
    pendingToast = false,
    lastSig = "";

  function readJ(k, d) {
    try {
      var v = JSON.parse(root.localStorage.getItem(k));
      return v === null || v === undefined ? d : v;
    } catch (e) {
      return d;
    }
  }
  function writeJ(k, v) {
    try {
      root.localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }

  // is there anything on this device worth keeping: a pet, a finished or started book, or sight words learned
  function hasProgress() {
    try {
      var p = readJ("lef_pet_v1", null);
      if (p && p.type) return true;
      var B = readJ("lef_books_v1", {}),
        k;
      for (k in B) if (B[k] && B[k].fin) return true;
      var W = readJ("lef_words_v1", null);
      if (W && W.words) for (k in W.words) return true;
      for (var i = 0; i < root.localStorage.length; i++) {
        var key = root.localStorage.key(i);
        if (key && /^les-.+-v1$/.test(key)) return true;
      }
    } catch (e) {}
    return false;
  }

  // "out", "setup", "ok" or "wait" (signed in, the account is still loading)
  function state() {
    var A = root.__lesAccount && root.__lesAccount.state ? root.__lesAccount.state() : null;
    if (!A || !A.session) return "out";
    if (!A.loaded) return "wait";
    if (!A.consent || !A.profiles || !A.profiles.length || !A.active) return "setup";
    return "ok";
  }

  function css() {
    if (root.document.getElementById("sihStyle")) return;
    var s = root.document.createElement("style");
    s.id = "sihStyle";
    s.textContent =
      "#signinHint{padding:22px 48px 0}@media(max-width:700px){#signinHint{padding:16px 16px 0}}" +
      ".sih{position:relative;max-width:760px;margin:0 auto;display:flex;gap:12px;align-items:center;flex-wrap:wrap;background:#FFF6E0;border:3px solid #FFB636;border-radius:22px;padding:12px 16px;color:#4A3200;font-weight:800;line-height:1.3}" +
      ".sih.setup{background:#EAF3FF;border-color:#6AA7FF;color:#12315F}" +
      ".sih .ic{font-size:1.5rem;flex:none}" +
      ".sih .tx{flex:1 1 220px;min-width:0;font-size:.95rem}.sih .tx small{display:block;font-weight:700;opacity:.75;font-size:.82rem;margin-top:2px}" +
      ".sih button.go{border:0;border-radius:999px;background:#D93B1E;color:#fff;font:inherit;font-weight:900;padding:10px 18px;cursor:pointer;box-shadow:0 3px 0 #9E2810;white-space:nowrap}" +
      ".sih.setup button.go{background:#2F6FD6;box-shadow:0 3px 0 #1C4A99}" +
      ".sih button.x{position:absolute;top:2px;right:6px;border:0;background:none;font-size:1.3rem;line-height:1;color:inherit;opacity:.55;cursor:pointer;padding:4px 8px}" +
      ".sih.sw{margin:0 0 12px;max-width:none}";
    root.document.head.appendChild(s);
  }

  function html(where) {
    var st = state(),
      sw = where === "sw";
    if (st === "wait" || st === "ok") return "";
    if (st === "out") {
      if (!hasProgress()) return "";
      if (!sw && Date.now() - (+readJ(KEY_OFF, 0) || 0) < DAY) return "";
      return (
        '<div class="sih out' + (sw ? " sw" : "") + '" role="status"><span class="ic" aria-hidden="true">☁️</span><span class="tx">Want to keep your child’s progress? Please sign up with your email. Once you do, their pet, stars and progress are never lost, even on a new phone or tablet.' +
        "<small>想保存孩子的学习进度，需要先用邮箱注册。注册后，宠物、星星和进度不会丢，换手机、换平板也能接着玩。</small></span>" +
        '<button type="button" class="go" data-sih="signin" data-where="' + (sw ? "sw" : "home") + '">Sign up to save 注册保存</button>' +
        (sw ? "" : '<button type="button" class="x" data-sih="off" aria-label="Hide for a day 今天不再提示">×</button>') +
        "</div>"
      );
    }
    // setup: signed in but nothing is being synced yet
    return (
      '<div class="sih setup' + (sw ? " sw" : "") + '" role="status"><span class="ic" aria-hidden="true">📝</span><span class="tx">Almost there! Finish setting up your child and your progress will be saved to your account.' +
      "<small>快好了！完成孩子的设置，进度就会保存到账号里。</small></span>" +
      '<button type="button" class="go" data-sih="setup">Finish setup 完成设置</button></div>'
    );
  }

  function render() {
    var el = root.document.getElementById("signinHint");
    if (!el) return;
    css();
    el.innerHTML = html("home");
    maybeToast();
  }

  function note(en, cn) {
    var t = root.document.getElementById("toast");
    if (!t) return;
    t.innerHTML = '<div class="tt">' + en + " <small>" + cn + "</small></div>";
    t.classList.add("on");
    clearTimeout(t._h);
    t._h = setTimeout(function () {
      t.classList.remove("on");
    }, 6000);
  }
  // right after signing in with a child ready: say that the progress is now saved
  function maybeToast() {
    if (!pendingToast || state() !== "ok") return;
    pendingToast = false;
    writeJ(KEY_TOAST, Date.now());
    note("Signed in. Your progress is saved to your account and will show on any device you sign in on.", "登录成功，进度已保存到账号，换设备登录也能看到。");
  }

  function openSignin(where) {
    if (where === "sw") {
      var c = root.document.getElementById("swClose");
      if (c) c.click();
    }
    setTimeout(function () {
      try {
        root.scrollTo(0, 0);
      } catch (e) {}
      var t = root.document.getElementById("syncToggle");
      if (t && t.getAttribute("aria-expanded") !== "true") t.click();
    }, where === "sw" ? 150 : 0);
  }

  function bind() {
    root.document.addEventListener("click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest("[data-sih]") : null;
      if (!b) return;
      var k = b.getAttribute("data-sih");
      if (k === "signin") openSignin(b.getAttribute("data-where"));
      else if (k === "setup") {
        var sw = root.document.getElementById("swClose");
        if (sw && b.parentNode && b.parentNode.className.indexOf(" sw") > -1) sw.click();
        if (root.__lesAccount && root.__lesAccount.route) root.__lesAccount.route();
      } else if (k === "off") {
        writeJ(KEY_OFF, Date.now());
        render();
      }
    });
  }

  function start() {
    var sb = root.__lesSupabaseClient;
    bind();
    if (sb && sb.auth && sb.auth.onAuthStateChange) {
      sb.auth.onAuthStateChange(function (event) {
        if (event === "SIGNED_IN" && Date.now() - (+readJ(KEY_TOAST, 0) || 0) > TOAST_EVERY) pendingToast = true;
        setTimeout(render, 400);
      });
    }
    render();
    // the account loads a moment after the page; follow its state without redrawing when nothing changed
    setInterval(function () {
      if (root.document.hidden) return;
      var sig = state() + (hasProgress() ? "1" : "0");
      if (sig !== lastSig) {
        lastSig = sig;
        render();
      }
    }, 1500);
  }

  root.SignInHint = {
    html: html,
    render: render,
    state: state,
    hasProgress: hasProgress,
    _arm: function () {
      pendingToast = true; // (tests) pretend a sign-in just happened
      maybeToast();
    },
  };
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})(typeof window !== "undefined" ? window : this);
