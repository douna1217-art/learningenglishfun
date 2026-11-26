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
    tellHome(out);
    return out;
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
    total: total,
    readyCount: readyCount,
    winsToday: function (game) {
      return read().today.wins[game] || 0;
    },
    _pure: { step: step, nextDay: nextDay, isReady: isReady, GAP: GAP },
  };
  if (typeof module !== "undefined" && module.exports) module.exports = root.GameProgress;
})(typeof window !== "undefined" ? window : this);
