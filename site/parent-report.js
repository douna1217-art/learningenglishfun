/* Parent report: a one-screen summary of how a child is doing, built from the progress the site already keeps.
   Input is one child's data: {stats: lef_stats_v1, books: lef_books_v1, hist: lef_hist_v1}.
   Nothing new is recorded; for the child playing on this device the numbers come from localStorage, for the other child
   from the synced rows (account.js fetches them). The pure part (summarize / text / html) is also used by the node tests.
   Written for old Android WebViews: no optional chaining, no spread, no let/const.
   中文说明：家长报告只读已有的学习记录，不新增任何数据收集。 */
(function (root) {
  "use strict";

  var DAY = 86400000;
  var SUBJECTS = {
    fiction: "Stories 故事",
    science: "Science 科学",
    "math-stories": "Math 数学",
    math: "Math 数学",
    sel: "Feelings 情感",
    "social-studies": "Social studies 社会",
    cs: "Computers 计算机",
  };

  function isObj(x) {
    return !!x && typeof x === "object" && !Array.isArray(x);
  }
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function dayNum(d) {
    d = d || new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
  }
  function streakOf(days, today) {
    var set = {},
      d,
      n = 0;
    days.forEach(function (x) {
      set[x] = 1;
    });
    d = set[today] ? today : today - 1;
    while (set[d]) {
      n++;
      d--;
    }
    return n;
  }

  // titleOf(slug) -> book title or "" ; today = day number (default: today)
  function summarize(data, today, titleOf) {
    data = isObj(data) ? data : {};
    today = typeof today === "number" ? today : dayNum();
    var stats = isObj(data.stats) ? data.stats : {},
      days = Array.isArray(stats.days) ? stats.days.filter(function (d) { return typeof d === "number"; }) : [],
      books = isObj(data.books) ? data.books : {},
      hist = Array.isArray(data.hist) ? data.hist.filter(isObj) : [],
      set = {},
      week = [],
      i,
      k;
    days.forEach(function (d) {
      set[d] = 1;
    });
    for (i = 6; i >= 0; i--) week.push(!!set[today - i]);
    var weekCount = week.filter(Boolean).length,
      fin = 0;
    for (k in books) if (isObj(books[k]) && books[k].fin) fin++;
    var weekStart = (today - 6) * DAY,
      booksWeek = hist.filter(function (h) {
        return typeof h.t === "number" && h.t >= weekStart;
      }).length,
      qn = 0,
      qok = 0,
      subj = {};
    hist.forEach(function (h) {
      if (h.quiz === true || h.quiz === false) {
        qn++;
        if (h.quiz) qok++;
      }
      if (h.subject) subj[h.subject] = (subj[h.subject] || 0) + 1;
    });
    var subjects = [];
    for (k in subj) subjects.push({ s: k, n: subj[k] });
    subjects.sort(function (a, b) {
      return b.n - a.n;
    });
    var recent = hist
      .filter(function (h) {
        return h.slug;
      })
      .slice(-5)
      .reverse()
      .map(function (h) {
        return { slug: h.slug, title: (titleOf && titleOf(h.slug)) || h.slug, t: h.t || 0 };
      });
    var last = days.length ? Math.max.apply(null, days) : null;
    return {
      week: week,
      weekDays: weekCount,
      streak: streakOf(days, today),
      stars: Math.max(0, +stats.total || 0),
      booksFinished: fin,
      booksWeek: booksWeek,
      quizN: qn,
      quizOk: qok,
      quizPct: qn ? Math.round((100 * qok) / qn) : null,
      subjects: subjects.slice(0, 4),
      recent: recent.slice(0, 5),
      lastDaysAgo: last === null ? null : Math.max(0, today - last),
      empty: !days.length && !fin && !hist.length,
    };
  }

  // a short bilingual message a parent can paste into WeChat or iMessage
  function text(name, s, site) {
    if (s.empty) return name + " has not started yet. " + name + " 还没开始学习。";
    var quiz = s.quizPct === null ? "" : "; " + s.quizPct + "% of quiz answers right the first time 一次答对 " + s.quizPct + "%";
    return (
      name + " this week 本周: learned on " + s.weekDays + " of 7 days 学习 " + s.weekDays + " 天; " +
      s.booksWeek + " book" + (s.booksWeek === 1 ? "" : "s") + " read 读了 " + s.booksWeek + " 本" + quiz +
      "; streak " + s.streak + " day" + (s.streak === 1 ? "" : "s") + " 连续 " + s.streak + " 天. " + (site || "learning-english-fun.com")
    );
  }

  function tile(num, en, zh) {
    return (
      '<div style="flex:1 1 40%;min-width:110px;background:#F3F8F4;border-radius:14px;padding:10px 8px;text-align:center">' +
      '<div style="font-size:22px;font-weight:900;color:#1E2A4A;line-height:1.1">' + num + "</div>" +
      '<div style="font-size:11px;font-weight:800;color:#4A5878;line-height:1.25">' + en + "<br>" + zh + "</div></div>"
    );
  }

  function html(s) {
    if (s.empty)
      return '<p class="ac-p">No reading yet. Once this child reads a book, the week shows up here.<small>还没有学习记录。读完第一本书后，这里就会显示本周情况。</small></p>';
    var names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      today = new Date().getDay(), // 0 = Sunday
      dots = s.week
        .map(function (on, i) {
          var dow = (today - (6 - i) + 14) % 7, // JS weekday of that day
            nm = names[(dow + 6) % 7];
          return (
            '<div style="flex:1;text-align:center;font-size:11px;font-weight:800;color:#4A5878"><div style="width:26px;height:26px;margin:0 auto 3px;border-radius:99px;background:' +
            (on ? "#35B779" : "#E6EEF7") + ";color:#fff;line-height:26px;font-size:14px\">" + (on ? "✓" : "") + "</div>" + nm + "</div>"
          );
        })
        .join("");
    var quiz = s.quizPct === null ? "–" : s.quizPct + "%",
      ago = s.lastDaysAgo === null ? "" : s.lastDaysAgo === 0 ? "Last learned today 今天学过" : "Last learned " + s.lastDaysAgo + " day" + (s.lastDaysAgo === 1 ? "" : "s") + " ago 上次学习在 " + s.lastDaysAgo + " 天前";
    var subj = "",
      max = s.subjects.length ? s.subjects[0].n : 1;
    s.subjects.forEach(function (x) {
      subj +=
        '<div style="display:flex;align-items:center;gap:8px;margin:5px 0;font-size:13px;font-weight:800"><span style="flex:0 0 120px">' + esc(SUBJECTS[x.s] || x.s) +
        '</span><span style="flex:1;height:8px;border-radius:99px;background:#E6EEF7;overflow:hidden"><i style="display:block;height:100%;width:' + Math.round((100 * x.n) / max) +
        '%;background:#6AA7FF"></i></span><span style="flex:0 0 26px;text-align:right">' + x.n + "</span></div>";
    });
    var recent = s.recent
      .map(function (r) {
        return '<div style="font-size:13px;font-weight:700;padding:3px 0;border-bottom:1px solid #EEF2F7">' + esc(r.title) + "</div>";
      })
      .join("");
    return (
      '<span class="ac-lab">This week 本周</span>' +
      '<div style="display:flex;gap:4px;margin:6px 0 10px">' + dots + "</div>" +
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
      tile(s.weekDays + " / 7", "days learned", "学习天数") +
      tile(s.booksWeek, "books read", "读的书") +
      tile(s.streak, "day streak", "连续天数") +
      tile(quiz, "right first time", "一次答对") +
      "</div>" +
      (ago ? '<p class="ac-note" style="margin-top:8px">' + ago + "</p>" : "") +
      '<span class="ac-lab">All time 累计</span><div style="display:flex;flex-wrap:wrap;gap:8px">' +
      tile(s.booksFinished, "books finished", "读完的书") + tile(s.stars, "stars earned", "获得星星") + "</div>" +
      (subj ? '<span class="ac-lab">What they read 读了什么</span>' + subj : "") +
      (recent ? '<span class="ac-lab">Recent books 最近读的书</span>' + recent : "")
    );
  }

  var api = { summarize: summarize, text: text, html: html, streakOf: streakOf, dayNum: dayNum };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ParentReport = api;
})(typeof window !== "undefined" ? window : this);
