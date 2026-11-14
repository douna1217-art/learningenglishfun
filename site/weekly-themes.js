/* Weekly theme collections: every Monday a new theme (space, ocean, animals ...) with 5 books picked for the child's level.
   Finish 3 of the 5 and the theme's stamp goes into the stamp passport, with a few bonus stars.
   - lef_themes_v1       {theme id: time the stamp was earned}   (synced by state-sync.js like the badges: stamps from both devices stay)
   - lef_theme_week_v1   {week, theme, slugs}                    the 5 books of this week, kept for the week so they do not change under the child (local only)
   Progress is read from the finished books the site already keeps, nothing new is recorded about the child.
   The pure part (weekIndex / pick / progress) is also used by the node tests.
   Written for old Android WebViews: no optional chaining, no spread, no let/const needed.
   中文说明：每周一换一个主题，从孩子的年级里挑 5 本书；读完 3 本就得到这个主题的印章，并有几颗奖励星星。 */
(function (root) {
  "use strict";

  var KEY_STAMPS = "lef_themes_v1",
    KEY_WEEK = "lef_theme_week_v1",
    NEED = 3,
    SIZE = 5,
    BONUS = 3,
    cfg = null;

  /* ------------------------------------------------------------------ pure part */
  function isObj(x) {
    return !!x && typeof x === "object" && !Array.isArray(x);
  }
  // weeks start on Monday (day 0, 1970-01-01, was a Thursday)
  function weekIndex(dayNum) {
    return Math.floor((dayNum + 3) / 7);
  }
  function daysLeft(dayNum) {
    return 7 - ((dayNum + 3) % 7) - 1; // 0 on Sunday
  }
  function themeFor(themes, week) {
    return themes.length ? themes[((week % themes.length) + themes.length) % themes.length] : null;
  }
  function gradeRank(g) {
    return /kindergarten/i.test(g) ? 0 : parseInt((String(g).match(/\d+/) || [])[0], 10) || 0;
  }
  function hash(s) {
    var h = 5381,
      i;
    s = String(s);
    for (i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return Math.abs(h) % 400;
  }
  function inTheme(theme, b) {
    if (theme.subject) return b.subject === theme.subject;
    var key = gradeRank(b.grade) === 0 ? "K" : String(gradeRank(b.grade)),
      list = (theme.books && theme.books[key]) || [];
    return list.indexOf(b.slug) > -1;
  }
  /* the week's books for a child reading at grade rank `rank`: nearest grades first, unread books before read ones,
     the rest decided by a fixed hash of (week, book) so every device picks the same 5 */
  function pick(all, theme, rank, week, finished, n) {
    n = n || SIZE;
    var pool = all.filter(function (b) {
        return inTheme(theme, b);
      }),
      spread,
      cand;
    for (spread = 1; spread <= 6; spread++) {
      cand = pool.filter(function (b) {
        return Math.abs(gradeRank(b.grade) - rank) <= spread;
      });
      if (cand.length >= n) break;
    }
    cand = (cand || []).map(function (b) {
      var d = Math.abs(gradeRank(b.grade) - rank),
        fin = finished && finished(b.slug) ? 1 : 0;
      return { b: b, s: d * 1000 + fin * 500 + hash(week + ":" + b.slug) };
    });
    cand.sort(function (x, y) {
      return x.s - y.s;
    });
    return cand.slice(0, n).map(function (x) {
      return x.b.slug;
    });
  }
  function progress(slugs, finished) {
    var n = 0;
    (slugs || []).forEach(function (s) {
      if (finished(s)) n++;
    });
    return n;
  }

  var api = { weekIndex: weekIndex, daysLeft: daysLeft, themeFor: themeFor, pick: pick, progress: progress, gradeRank: gradeRank, NEED: NEED, SIZE: SIZE, BONUS: BONUS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.WeeklyThemes = api;
  if (typeof document === "undefined" || !root.document) return;

  /* ------------------------------------------------------------------ screen */
  var doc = root.document;

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
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function today() {
    var d = new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }
  function bySlug() {
    var m = {};
    ((cfg && cfg.all) || []).forEach(function (b) {
      if (b.slug && !m[b.slug]) m[b.slug] = b;
    });
    return m;
  }
  function fin(slug) {
    try {
      return !!(cfg && cfg.finished && cfg.finished(slug));
    } catch (e) {
      return false;
    }
  }

  // this week's theme and its 5 books (kept for the week)
  function current() {
    var themes = root.LEF_THEMES || [],
      w = weekIndex(today()),
      theme = themeFor(themes, w);
    if (!theme || !cfg) return null;
    var g = "",
      rank,
      W = readJ(KEY_WEEK, null),
      m = bySlug();
    try {
      g = cfg.grade ? cfg.grade() : "";
    } catch (e) {}
    rank = typeof g === "number" ? g : gradeRank(g || "Grade 2");
    // kept for the week; only re-picked early if the child's level turned out different and nothing was finished yet
    if (!isObj(W) || W.week !== w || W.theme !== theme.id || !Array.isArray(W.slugs) || W.slugs.some(function (s) { return !m[s]; }) || (W.rank !== rank && progress(W.slugs, fin) === 0)) {
      W = { week: w, theme: theme.id, rank: rank, slugs: pick(cfg.all || [], theme, rank, w, fin) };
      writeJ(KEY_WEEK, W);
    }
    return { theme: theme, week: w, slugs: W.slugs, have: progress(W.slugs, fin) };
  }
  function stamps() {
    var s = readJ(KEY_STAMPS, {});
    return isObj(s) ? s : {};
  }

  // earn the stamp once 3 of the 5 are finished
  function check(quiet) {
    var cur = current();
    if (!cur || cur.have < NEED) return { fresh: false, got: 0 };
    var S = stamps();
    if (S[cur.theme.id]) return { fresh: false, got: 0 };
    S[cur.theme.id] = Date.now();
    writeJ(KEY_STAMPS, S);
    var got = 0;
    try {
      got = cfg.award ? cfg.award(BONUS) || 0 : 0;
    } catch (e) {}
    if (!quiet) {
      try {
        cfg.toast([[BONUS, cur.theme.en + " stamp", cur.theme.cn + "印章"]], got, got < BONUS);
      } catch (e) {}
    }
    return { fresh: true, got: got };
  }

  function css() {
    if (doc.getElementById("wtStyle")) return;
    var s = doc.createElement("style");
    s.id = "wtStyle";
    s.textContent =
      "#weeklyTheme{padding:26px 48px 0}@media(max-width:700px){#weeklyTheme{padding:18px 16px 0}}" +
      ".wt{max-width:1264px;margin:0 auto;border-radius:34px;padding:22px 26px 24px;color:#fff;box-shadow:0 8px 0 rgba(0,0,0,.16);position:relative;overflow:hidden}" +
      ".wt:before{content:'';position:absolute;right:-60px;top:-70px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,.14)}" +
      ".wt .wth{position:relative;display:flex;align-items:center;gap:14px;flex-wrap:wrap}" +
      ".wt .wti{font-size:46px;line-height:1;filter:drop-shadow(0 3px 0 rgba(0,0,0,.18))}" +
      ".wt .wtt{flex:1 1 220px;min-width:0}.wt .wtk{font-size:12px;font-weight:900;letter-spacing:.6px;opacity:.9}" +
      ".wt h3{margin:2px 0 0;font-family:Fredoka,ui-rounded,'Trebuchet MS',Arial,sans-serif;font-size:30px;line-height:1.05}" +
      ".wt h3 small{font-size:16px;font-weight:800;opacity:.92;margin-left:6px}" +
      ".wt .wtp{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.2);border-radius:999px;padding:7px 14px;font-weight:900;font-size:14px;white-space:nowrap}" +
      ".wt .wtp i{width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,.35);display:inline-block}.wt .wtp i.on{background:#FFE066;box-shadow:0 0 0 2px #fff inset}" +
      ".wt .wtb{position:relative;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-top:16px}" +
      "@media(max-width:700px){.wt .wtb{grid-template-columns:repeat(3,minmax(0,1fr))}.wt h3{font-size:25px}}" +
      ".wt .wtc{position:relative;border:0;padding:0;border-radius:20px;overflow:hidden;background:#fff;color:#1E2A4A;cursor:pointer;font:inherit;text-align:left;box-shadow:0 5px 0 rgba(0,0,0,.18);transition:transform .15s}" +
      ".wt .wtc:hover{transform:translateY(-4px)}" +
      ".wt .wtc img,.wt .wtc .wtn{width:100%;aspect-ratio:700/520;object-fit:cover;display:block;background:#E6EEF7}" +
      ".wt .wtc span.t{display:block;padding:7px 10px 9px;font-weight:800;font-size:13px;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
      ".wt .wtc .ok{position:absolute;right:8px;top:8px;background:#35B779;color:#fff;border-radius:999px;padding:3px 10px;font-weight:900;font-size:12px;box-shadow:0 2px 0 #1F7F50}" +
      ".wt .wtf{position:relative;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:14px;font-weight:800;font-size:14px}" +
      ".wt .wtf small{display:block;font-weight:700;opacity:.9}" +
      ".wt button.wtpass{border:0;border-radius:999px;background:#fff;color:#1E2A4A;font:inherit;font-weight:900;padding:9px 18px;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,.2)}" +
      ".wt.done .wtp{background:#FFE066;color:#5A3A00}";
    doc.head.appendChild(s);
  }

  function render() {
    var el = doc.getElementById("weeklyTheme");
    if (!el || !cfg) return;
    var cur = current();
    if (!cur) {
      el.innerHTML = "";
      return;
    }
    css();
    check(false);
    var m = bySlug(),
      S = stamps(),
      earned = !!S[cur.theme.id],
      th = cur.theme,
      pips = "",
      i,
      left = daysLeft(today()),
      n = Object.keys(S).length;
    for (i = 0; i < NEED; i++) pips += '<i class="' + (i < cur.have ? "on" : "") + '"></i>';
    var books = cur.slugs
      .map(function (s, i) {
        var b = m[s];
        if (!b) return "";
        return (
          '<button type="button" class="wtc" data-wt="' + i + '">' +
          (b.cover ? '<img loading="lazy" src="' + esc(b.cover) + '" alt="' + esc(b.title) + ' cover">' : '<div class="wtn"></div>') +
          (fin(s) ? '<span class="ok">&#10003;</span>' : "") + '<span class="t">' + esc(b.title) + "</span></button>"
        );
      })
      .join("");
    el.innerHTML =
      '<div class="wt' + (earned ? " done" : "") + '" style="background:linear-gradient(115deg,' + th.c1 + ' 0%,' + th.c2 + ' 100%)">' +
      '<div class="wth"><span class="wti" aria-hidden="true">' + th.ic + '</span><div class="wtt"><div class="wtk">THIS WEEK\'S THEME 本周主题</div><h3>' + esc(th.en) + "<small>" + esc(th.cn) + "</small></h3></div>" +
      '<span class="wtp">' + pips + " " + (earned ? "Stamp earned 已集章" : cur.have + " of " + NEED + " books 读完 " + NEED + " 本集章") + "</span></div>" +
      '<div class="wtb">' + books + "</div>" +
      '<div class="wtf"><span>' +
      (earned ? "Stamp earned! Keep reading, there is a new theme on Monday." : "Finish " + NEED + " of these 5 books to earn the stamp and " + BONUS + " bonus stars.") +
      "<small>" + (earned ? "已集章！周一会有新主题。" : "读完这 5 本中的 " + NEED + " 本，得到印章和 " + BONUS + " 颗奖励星星。") + "</small></span>" +
      '<button type="button" class="wtpass" id="wtPass">Stamp passport 集章册 · ' + n + " / " + (root.LEF_THEMES || []).length + "</button></div></div>";
    Array.prototype.forEach.call(el.querySelectorAll("[data-wt]"), function (b) {
      b.onclick = function () {
        var bk = m[cur.slugs[+b.getAttribute("data-wt")]];
        if (!bk) return;
        try {
          cfg.openBook(bk);
        } catch (e) {}
      };
    });
    var pass = doc.getElementById("wtPass");
    if (pass) pass.onclick = passport;
  }

  function passport() {
    var themes = root.LEF_THEMES || [],
      S = stamps(),
      w = weekIndex(today()),
      cur = themeFor(themes, w),
      cells = themes
        .map(function (t, i) {
          var got = S[t.id],
            here = cur && cur.id === t.id;
          return (
            '<div style="border-radius:20px;padding:12px 8px;text-align:center;background:' + (got ? "linear-gradient(135deg," + t.c1 + "," + t.c2 + ")" : "#EEF2F7") + ";color:" + (got ? "#fff" : "#7C8BA3") +
            ';box-shadow:0 4px 0 rgba(0,0,0,.12);font-weight:800;line-height:1.2"><div style="font-size:34px;' + (got ? "" : "filter:grayscale(1);opacity:.55") + '">' + t.ic + '</div><div style="font-size:13px;margin-top:4px">' + esc(t.en) +
            '</div><div style="font-size:11px;font-weight:700;opacity:.9">' + esc(t.cn) + '</div><div style="font-size:11px;margin-top:4px">' + (got ? "&#10003; Stamped 已集章" : here ? "This week 本周" : "Not yet 还没集章") + "</div></div>"
          );
        })
        .join("");
    if (!cfg || !cfg.modal) return;
    cfg.modal(
      '<h2>Stamp passport <span style="font-size:20px;color:#4A5878">集章册</span></h2><p style="margin:4px 0 12px;font-weight:700;color:#4A5878">One new theme every Monday. Finish ' + NEED + " of its 5 books to collect the stamp.<br>每周一换新主题，读完其中 " + NEED + " 本就能集一枚印章。</p>" +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px">' + cells + "</div>"
    );
  }

  api.init = function (c) {
    cfg = c;
  };
  api.render = render;
  api.check = check;
  api.passport = passport;
  api.current = current;
})(typeof window !== "undefined" ? window : this);
