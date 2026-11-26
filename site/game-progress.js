/* Skill crowns for the practice games, and what was played today.

   Every level of every game (practice rounds aside) can earn up to 3 crowns, one at a time, on different days:
     crown 1  a perfect run (3 stars: no heart lost)
     crown 2  another perfect run, at least 1 day after crown 1
     crown 3  another perfect run, at least 3 days after crown 2
   Coming back after a gap and still getting it all right is what shows a skill is really learned (spaced practice), and a crown that is
   "ready" gives the child a reason to come back.

   Kept in localStorage "lef_gameprog_v1" (synced with the account like the games):
     { g: { game: { level: { c: crowns, t: day number of the last crown, n: level name } } },
       today: { day: day number, wins: { game: levels won today } } }
   The games run in the reader's frame on the same site, so they read and write the same storage as the home page.

   GameProgress.report({game, level, name, won, stars, correct, total, best, practice}) -> {crown, next}
       records the end of a level, sends game_level_end to the site's event log, shows a little crown note in the game,
       and tells the home page (parent.__gameDone) so today's goals can tick.
   GameProgress.start(game, level)          sends game_level_start
   GameProgress.crowns(game, level) -> 0..3      .ready(game, level) -> true when the next crown can be won today
   GameProgress.badge(game, level) -> html (the crowns for a level on a game's map)
   GameProgress.total(game) -> crowns in a game     .readyCount(game)     .winsToday(game)
   GameProgress.card(info) -> a promise of a PNG data URL: the picture a crown makes (the pet, the crown, the skill, the game, the site),
       and after a new crown the result screen of the game (#rSub) gets a "Share" button that shows it to save or send.
   GameProgress._pure: the crown rule, for the node tests.
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";
  var STORE = "lef_gameprog_v1",
    GAP = [0, 1, 3]; // days to wait after crown 1 for crown 2, after crown 2 for crown 3

  /* ---- pure part ---- */
  // cur: {c, t} or null; perfect: the run had no mistakes; day: today's day number. Returns the new {c, t} and whether a crown was won.
  function step(cur, perfect, day) {
    var c = cur && cur.c ? cur.c : 0,
      t = cur && typeof cur.t === "number" ? cur.t : null;
    if (!perfect || c >= 3) return { c: c, t: t, won: false };
    if (c === 0 || day - t >= GAP[c]) return { c: c + 1, t: day, won: true };
    return { c: c, t: t, won: false };
  }
  function nextDay(cur) {
    if (!cur || !cur.c || cur.c >= 3) return null;
    return cur.t + GAP[cur.c];
  }
  function isReady(cur, day) {
    var n = nextDay(cur);
    return n !== null && day >= n;
  }

  /* ---- browser part ---- */
  function dayNum() {
    var d = new Date();
    return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }
  function read() {
    var s = null;
    try {
      s = JSON.parse(root.localStorage.getItem(STORE));
    } catch (e) {}
    if (!s || typeof s !== "object") s = {};
    if (!s.g || typeof s.g !== "object") s.g = {};
    var d = dayNum();
    if (!s.today || s.today.day !== d) s.today = { day: d, wins: {} };
    return s;
  }
  function write(s) {
    try {
      root.localStorage.setItem(STORE, JSON.stringify(s));
    } catch (e) {}
  }
  function lv(game, level) {
    var g = read().g[game];
    return g && g[level] ? g[level] : null;
  }
  function track(name, payload) {
    var t = null;
    try {
      if (root.parent && root.parent !== root && root.parent.__trackEvent) t = root.parent.__trackEvent;
    } catch (e) {}
    if (!t) t = root.__trackEvent;
    if (typeof t === "function") {
      try {
        t(name, payload);
      } catch (e) {}
    }
  }
  function tellHome(r) {
    try {
      if (root.parent && root.parent !== root && typeof root.parent.__gameDone === "function") root.parent.__gameDone(r);
      else if (typeof root.__gameDone === "function") root.__gameDone(r);
    } catch (e) {}
  }

  function css() {
    if (!root.document || root.document.getElementById("gpStyle")) return;
    var s = root.document.createElement("style");
    s.id = "gpStyle";
    s.textContent =
      ".gpc{display:inline-flex;gap:1px;font-size:.8rem;line-height:1;vertical-align:middle;margin-left:4px}.gpc i{font-style:normal}.gpc i.off{filter:grayscale(1);opacity:.28}" +
      ".gpc.ready{animation:gpPulse 1.4s ease-in-out infinite}.gpc .rd{font-size:.68rem;font-weight:900;color:#B86B00;margin-left:3px;font-style:normal}" +
      "@keyframes gpPulse{0%,100%{transform:none}50%{transform:scale(1.12)}}@media(prefers-reduced-motion:reduce){.gpc.ready{animation:none}}" +
      "#gpNote{position:fixed;left:50%;top:14px;transform:translateX(-50%) translateY(-140%);z-index:60;background:#FFF7D6;border:3px solid #FFC93C;border-radius:18px;" +
      "padding:10px 16px;font-weight:900;color:#5A3A00;box-shadow:0 6px 0 rgba(255,201,60,.35);text-align:center;max-width:92vw;transition:transform .45s cubic-bezier(.2,1.4,.4,1);font-family:inherit}" +
      ".gpShare{display:block;margin:10px auto 0;border:0;border-radius:999px;padding:10px 20px;font:inherit;font-weight:900;background:#FFC93C;color:#5A3A00;cursor:pointer;box-shadow:0 4px 0 #D9A21E}.gpShare small{font-weight:800;opacity:.75}" +
      ".gpCard{position:fixed;inset:0;z-index:70;background:rgba(20,10,40,.6);display:flex;align-items:center;justify-content:center;padding:14px}" +
      ".gpIn{background:#fff;border-radius:24px;padding:14px;max-width:420px;width:100%;max-height:96vh;overflow:auto;text-align:center}.gpIn img{width:100%;border-radius:16px;display:block}" +
      ".gpTip{font-weight:800;font-size:.85rem;color:#5A4F86;margin:10px 0}.gpTip small{display:block;opacity:.8}.gpRow{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}" +
      ".gpB{border:0;border-radius:999px;padding:10px 16px;font:inherit;font-weight:900;background:#EEE8FF;color:#3A2C6B;text-decoration:none;cursor:pointer}" +
      "#gpNote.on{transform:translateX(-50%) translateY(0)}#gpNote b{font-size:1.15rem;display:block}#gpNote small{display:block;font-weight:800;opacity:.75;margin-top:2px}";
    root.document.head.appendChild(s);
  }
  function note(html) {
    if (!root.document || !root.document.body) return;
    css();
    var n = root.document.getElementById("gpNote");
    if (!n) {
      n = root.document.createElement("div");
      n.id = "gpNote";
      root.document.body.appendChild(n);
    }
    n.innerHTML = html;
    setTimeout(function () {
      n.classList.add("on");
    }, 400);
    clearTimeout(n._h);
    n._h = setTimeout(function () {
      n.classList.remove("on");
    }, 5200);
  }
  var NAMES = ["", "Bronze crown", "Silver crown", "Gold crown"],
    CN = ["", "铜皇冠", "银皇冠", "金皇冠"];

  function report(r) {
    if (!r || !r.game) return { crown: 0, next: null };
    track("game_level_end", { game: r.game, level: r.level, won: !!r.won, stars: r.stars || 0, correct: r.correct || 0, total: r.total || 0, best: r.best || 0 });
    var s = read(),
      day = s.today.day,
      out = { crown: 0, next: null, game: r.game, level: r.level, won: !!r.won };
    if (r.won) s.today.wins[r.game] = (s.today.wins[r.game] || 0) + 1;
    if (!r.practice && r.level !== undefined && r.level !== null) {
      var g = s.g[r.game] || (s.g[r.game] = {}),
        cur = g[r.level] || null,
        nx = step(cur, !!r.won && (r.stars || 0) >= 3, day);
      if (nx.c) g[r.level] = { c: nx.c, t: nx.t, n: r.name || (cur && cur.n) || "" };
      out.crown = nx.won ? nx.c : 0;
      out.next = nextDay(g[r.level]);
      var wait = out.next === null ? null : out.next - day;
      if (out.crown) {
        note(
          "<b>" + new Array(out.crown + 1).join("👑") + " " + NAMES[out.crown] + "!</b>" + (r.name ? r.name : "") +
            "<small>" + (out.crown < 3 ? "Play it perfectly again " + (wait <= 1 ? "tomorrow" : "in " + wait + " days") + " for the next crown · " + (wait <= 1 ? "明天" : wait + " 天后") + "再全对一次，赢下一顶皇冠" : "This skill is mastered! 这个技能已经完全掌握！") + "</small>"
        );
      } else if (r.won && cur && cur.c && cur.c < 3 && (r.stars || 0) >= 3 && wait > 0) {
        note("<b>Perfect! 👑</b><small>The next crown can be won " + (wait === 1 ? "tomorrow" : "in " + wait + " days") + " · 下一顶皇冠" + (wait === 1 ? "明天" : wait + " 天后") + "可以赢</small>");
      }
    }
    write(s);
    try {
      shareButton({ crown: out.crown, game: r.game, level: r.level, name: r.name, title: r.title || (root.document && root.document.title) || "" });
    } catch (e) {}
    tellHome(out);
    return out;
  }
  /* ---- the crown card: a picture to save or send to family ---- */
  var TONES = [null, ["#F6C79A", "#C9773A", "#7A3E12"], ["#E9EEF5", "#A8B4C6", "#3E4C63"], ["#FFE9A0", "#F2B705", "#6A4A00"]];
  function petPicture() {
    // the pet as drawn on the home page (the games run in the home page's reader frame)
    try {
      var P = root.parent && root.parent !== root ? root.parent : root,
        pet = P.__petBridge ? P.__petBridge.pet() : null;
      if (pet && typeof P.petSvg === "function") return { name: pet.name, svg: P.petSvg(pet.type, "excited", pet.eq || {}, "icon", "width:100%;height:100%") };
    } catch (e) {}
    return null;
  }
  function svgImage(svg) {
    return new Promise(function (ok) {
      if (!svg) return ok(null);
      var m = svg.match(/<svg[^>]*>/), s = svg;
      if (m && m[0].indexOf("xmlns") < 0) s = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      s = s.replace(/style="[^"]*"/, 'width="420" height="420"');
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = function () { ok(null); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
    });
  }
  function roundRect(x, l, t, w, h, r) {
    x.beginPath(); x.moveTo(l + r, t); x.arcTo(l + w, t, l + w, t + h, r); x.arcTo(l + w, t + h, l, t + h, r); x.arcTo(l, t + h, l, t, r); x.arcTo(l, t, l + w, t, r); x.closePath();
  }
  function card(info) {
    var c = Math.max(1, Math.min(3, info.crown || 1)), T = TONES[c], pet = petPicture();
    return svgImage(pet && pet.svg).then(function (img) {
      var W = 900, H = 1125, cv = root.document.createElement("canvas"), x;
      cv.width = W; cv.height = H; x = cv.getContext("2d");
      var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, T[0]); g.addColorStop(1, "#FFFFFF");
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      // a few soft rays behind the crown
      x.save(); x.translate(W / 2, 330); x.fillStyle = "rgba(255,255,255,.45)";
      for (var i = 0; i < 12; i++) { x.rotate(Math.PI / 6); x.beginPath(); x.moveTo(0, 0); x.lineTo(-40, -520); x.lineTo(40, -520); x.closePath(); x.fill(); }
      x.restore();
      roundRect(x, 40, 40, W - 80, H - 80, 48); x.lineWidth = 14; x.strokeStyle = T[1]; x.stroke();
      var F = "Fredoka, 'Trebuchet MS', Arial, sans-serif";
      x.textAlign = "center"; x.textBaseline = "middle";
      x.font = "150px serif"; x.fillText(new Array(c + 1).join("👑"), W / 2, 150);
      if (img) x.drawImage(img, W / 2 - 210, 220, 420, 420);
      else { x.font = "260px serif"; x.fillText("🏆", W / 2, 430); }
      x.fillStyle = T[2]; x.font = "bold 78px " + F;
      x.fillText(["", "Bronze Crown!", "Silver Crown!", "Gold Crown!"][c], W / 2, 700);
      x.font = "bold 52px " + F; x.fillStyle = "#2D2250";
      x.fillText(info.name || "", W / 2, 790, W - 140);
      x.font = "bold 40px " + F; x.fillStyle = "#5A4F86";
      x.fillText((info.title || "") + (pet && pet.name ? "  ·  with " + pet.name : ""), W / 2, 860, W - 140);
      x.font = "bold 34px " + F; x.fillStyle = "#7A6FA6";
      x.fillText(["", "Perfect on the first day", "Perfect again on another day", "Perfect 3 times: mastered!"][c], W / 2, 920, W - 140);
      var d = new Date();
      x.font = "bold 30px " + F; x.fillStyle = "#8A84A8";
      x.fillText(d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(), W / 2, 985);
      x.fillStyle = T[1]; roundRect(x, W / 2 - 280, 1010, 560, 60, 30); x.fill();
      x.fillStyle = "#fff"; x.font = "bold 32px " + F; x.fillText("learning-english-fun.com", W / 2, 1041);
      return cv.toDataURL("image/png");
    });
  }
  function shareButton(info) {
    var doc = root.document, sub = doc.getElementById("rSub"), old = doc.getElementById("gpShare");
    if (old) old.parentNode.removeChild(old);
    if (!sub || !info.crown) return;
    css();
    var b = doc.createElement("button");
    b.type = "button"; b.id = "gpShare"; b.className = "gpShare";
    b.innerHTML = "📤 Share my crown <small>分享我的皇冠</small>";
    sub.parentNode.insertBefore(b, sub.nextSibling);
    b.onclick = function () {
      b.disabled = true;
      card(info).then(function (url) {
        b.disabled = false;
        showCard(url, info);
        track("game_crown_share", { game: info.game, level: info.level, crown: info.crown });
      });
    };
  }
  function showCard(url, info) {
    var doc = root.document, box = doc.createElement("div");
    box.className = "gpCard";
    box.innerHTML = '<div class="gpIn"><img alt="Crown card" src="' + url + '"><div class="gpTip">Press and hold the picture to save it, or use the buttons. <small>长按图片可以保存，也可以用下面的按钮</small></div>' +
      '<div class="gpRow"><a class="gpB" download="crown.png" href="' + url + '">💾 Save 保存</a><button type="button" class="gpB" id="gpSend" hidden>📤 Send 发送</button><button type="button" class="gpB gpX">Close 关闭</button></div></div>';
    doc.body.appendChild(box);
    function close() { if (box.parentNode) box.parentNode.removeChild(box); }
    box.querySelector(".gpX").onclick = close;
    box.onclick = function (e) { if (e.target === box) close(); };
    try {
      var bin = atob(url.split(",")[1]), arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      var file = new File([arr], "crown.png", { type: "image/png" }), send = box.querySelector("#gpSend");
      if (root.navigator.canShare && root.navigator.canShare({ files: [file] })) {
        send.hidden = false;
        send.onclick = function () { root.navigator.share({ files: [file], title: "A new crown!", text: (info.name || "") + " · learning-english-fun.com" }).catch(function () {}); };
      }
    } catch (e) {}
  }

  function badge(game, level) {
    var cur = lv(game, level),
      c = cur ? cur.c : 0;
    if (!c) return "";
    css();
    var ready = isReady(cur, dayNum()),
      h = "";
    for (var i = 1; i <= 3; i++) h += "<i" + (i <= c ? "" : ' class="off"') + ">👑</i>";
    return '<span class="gpc' + (ready ? " ready" : "") + '" title="' + c + ' of 3 crowns' + (ready ? ", next one ready today" : "") + '">' + h + (ready ? '<em class="rd">ready!</em>' : "") + "</span>";
  }
  function total(game) {
    var g = read().g[game] || {},
      n = 0;
    Object.keys(g).forEach(function (k) {
      n += g[k].c || 0;
    });
    return n;
  }
  function readyCount(game) {
    var g = read().g[game] || {},
      d = dayNum(),
      n = 0;
    Object.keys(g).forEach(function (k) {
      if (isReady(g[k], d)) n++;
    });
    return n;
  }

  root.GameProgress = {
    STORE: STORE,
    report: report,
    start: function (game, level) {
      track("game_level_start", { game: game, level: level });
    },
    crowns: function (game, level) {
      var c = lv(game, level);
      return c ? c.c : 0;
    },
    ready: function (game, level) {
      return isReady(lv(game, level), dayNum());
    },
    badge: badge,
    card: card,
    total: total,
    readyCount: readyCount,
    winsToday: function (game) {
      return read().today.wins[game] || 0;
    },
    _pure: { step: step, nextDay: nextDay, isReady: isReady, GAP: GAP },
  };
  if (typeof module !== "undefined" && module.exports) module.exports = root.GameProgress;
})(typeof window !== "undefined" ? window : this);
