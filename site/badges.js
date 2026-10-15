/* Badges, learning streak and star totals (sample).
   - lef_stats_v1   {days:[day numbers], total:stars earned in total, reviews:questions reviewed}
   - lef_badges_v1  {badge id: time it was earned}
   Both live in localStorage first and are backed up / merged by state-sync.js like the pet.
   Badges are rules over data the site already keeps (books finished, first-try quiz marks, pet items) plus the two
   counters above. Three badges unlock a pet item that cannot be bought. Nothing here is public or compared between children.
   Written for old Android WebViews: no optional chaining, no spread, no let/const needed.
   中文说明：徽章只看已有的学习记录（读完的书、一次答对的题、宠物物品）加两个新计数器（连续天数、累计星星）。
   有三枚徽章会送一件商店里买不到的宠物物品。 */
(function (root) {
  "use strict";

  var KEY_STATS = "lef_stats_v1",
    KEY_BADGES = "lef_badges_v1";

  /* ------------------------------------------------------------------ pure part (also used by the node tests) */
  function isObj(x) {
    return !!x && typeof x === "object" && !Array.isArray(x);
  }
  function dayNum(d) {
    d = d || new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }
  function cleanStats(s) {
    s = isObj(s) ? s : {};
    var seen = {},
      days = [];
    (Array.isArray(s.days) ? s.days : []).forEach(function (d) {
      if (typeof d === "number" && isFinite(d) && !seen[d]) {
        seen[d] = 1;
        days.push(d);
      }
    });
    days.sort(function (a, b) {
      return a - b;
    });
    return {
      days: days.slice(-400),
      total: Math.max(0, +s.total || 0),
      reviews: Math.max(0, +s.reviews || 0),
    };
  }
  function touchDay(stats, today) {
    if (stats.days.indexOf(today) < 0) {
      stats.days.push(today);
      stats.days.sort(function (a, b) {
        return a - b;
      });
      if (stats.days.length > 400) stats.days = stats.days.slice(-400);
    }
    return stats;
  }
  // Days in a row. Today does not have to be done yet: the streak stays alive until a whole day is missed.
  function streakOf(days, today) {
    var set = {};
    days.forEach(function (d) {
      set[d] = 1;
    });
    var d = set[today] ? today : today - 1,
      n = 0;
    while (set[d]) {
      n++;
      d--;
    }
    return n;
  }
  function mergeStats(a, b) {
    var x = cleanStats(a),
      y = cleanStats(b);
    return cleanStats({
      days: x.days.concat(y.days),
      total: Math.max(x.total, y.total),
      reviews: Math.max(x.reviews, y.reviews),
    });
  }
  // keep every badge either device earned, with the earlier time
  function mergeBadges(a, b) {
    var out = {};
    [a, b].forEach(function (m) {
      if (!isObj(m)) return;
      Object.keys(m).forEach(function (id) {
        var t = +m[id] || 0;
        if (out[id] === undefined || (t && t < out[id])) out[id] = t || out[id] || 1;
      });
    });
    return out;
  }

  var TIERS = {
    bronze: { a: "#EBA96A", b: "#9A5A1E" },
    silver: { a: "#DDE5EF", b: "#7C8BA3" },
    gold: { a: "#FFD54A", b: "#B8860B" },
    diamond: { a: "#A6E3FF", b: "#2A7FB8" },
  };
  // metric: what is counted; need: how many for the badge; reward: pet item unlocked by it (see REWARDS below)
  var DEFS = [
    { id: "book1", tier: "bronze", glyph: "book", name: "First Book", cn: "第一本书", metric: "books", need: 1, en: "Finish 1 book", zh: "读完 1 本书" },
    { id: "book5", tier: "silver", glyph: "book", name: "Bookworm", cn: "小书虫", metric: "books", need: 5, en: "Finish 5 books", zh: "读完 5 本书", reward: "bd-scholar" },
    { id: "book15", tier: "gold", glyph: "book", name: "Book Star", cn: "阅读之星", metric: "books", need: 15, en: "Finish 15 books", zh: "读完 15 本书" },
    { id: "book50", tier: "diamond", glyph: "book", name: "Reading Champion", cn: "阅读冠军", metric: "books", need: 50, en: "Finish 50 books", zh: "读完 50 本书" },
    { id: "sub3", tier: "silver", glyph: "globe", name: "Explorer", cn: "小探险家", metric: "subjects", need: 3, en: "Finish books in 3 different subjects", zh: "读完 3 个不同科目的书" },
    { id: "sub6", tier: "gold", glyph: "globe", name: "World Traveler", cn: "环游世界", metric: "subjects", need: 6, en: "Finish books in all 6 subjects", zh: "读完全部 6 个科目的书" },
    { id: "sharp5", tier: "silver", glyph: "bulb", name: "Sharp Mind", cn: "小聪明", metric: "sharp", need: 5, en: "Get 80% or more on the first try in 5 books", zh: "5 本书一次答对 80% 以上" },
    { id: "day3", tier: "bronze", glyph: "flame", name: "3-Day Streak", cn: "连续 3 天", metric: "streak", need: 3, en: "Learn 3 days in a row", zh: "连续学习 3 天" },
    { id: "day7", tier: "gold", glyph: "flame", name: "7-Day Streak", cn: "连续 7 天", metric: "streak", need: 7, en: "Learn 7 days in a row", zh: "连续学习 7 天", reward: "bd-medal" },
    { id: "star50", tier: "silver", glyph: "star", name: "Star Collector", cn: "星星收集家", metric: "stars", need: 50, en: "Earn 50 stars in total", zh: "累计赚到 50 颗星", reward: "bd-starglasses" },
    { id: "star200", tier: "gold", glyph: "star", name: "Star Master", cn: "星星大师", metric: "stars", need: 200, en: "Earn 200 stars in total", zh: "累计赚到 200 颗星" },
    { id: "pet5", tier: "silver", glyph: "heart", name: "Pet's Best Friend", cn: "宠物好朋友", metric: "owned", need: 5, en: "Own 5 things for your pet", zh: "为宠物拥有 5 件物品" },
    { id: "rev20", tier: "silver", glyph: "check", name: "Mistake Fixer", cn: "错题小能手", metric: "reviews", need: 20, en: "Review 20 questions", zh: "复习 20 道题" },
    // the sight words (see sightwords.js): what is counted comes from lef_words_v1, see swMetrics()
    { id: "sw10", tier: "bronze", glyph: "aa", name: "First Words", cn: "第一批单词", metric: "words", need: 10, en: "Know 10 sight words", zh: "认识 10 个高频词" },
    { id: "sw50", tier: "silver", glyph: "aa", name: "Word Collector", cn: "单词收集家", metric: "words", need: 50, en: "Know 50 sight words", zh: "认识 50 个高频词" },
    { id: "sw92", tier: "gold", glyph: "aa", name: "Word Master", cn: "单词大师", metric: "words1", need: 92, en: "Know all 92 words of Stage 1", zh: "认识第一阶段的全部 92 个词" },
    { id: "sw179", tier: "diamond", glyph: "aa", name: "Word Wizard", cn: "单词魔法师", metric: "words", need: 179, en: "Know all 179 words of Stage 1 and 2", zh: "认识第一、二阶段的全部 179 个词" },
    { id: "swstar3", tier: "silver", glyph: "star", name: "Lesson Star", cn: "课程之星", metric: "stars3", need: 3, en: "Get 3 stars on 3 word lessons", zh: "3 节单词课拿到 3 颗星" },
    { id: "swrev5", tier: "silver", glyph: "check", name: "Memory Keeper", cn: "记忆守护者", metric: "swrev", need: 5, en: "Review your words on 5 different days", zh: "在 5 个不同的日子复习单词" },
    { id: "chest1", tier: "bronze", glyph: "chest", name: "Treasure Hunter", cn: "寻宝小能手", metric: "chests", need: 1, en: "Open a treasure chest", zh: "打开 1 个宝箱" },
    { id: "chest5", tier: "diamond", glyph: "mountain", name: "Mountain Master", cn: "高山大师", metric: "chests1", need: 5, en: "Open all 5 chests on the mountain island", zh: "打开山岛上的全部 5 个宝箱" },
    { id: "mon1", tier: "bronze", glyph: "monster", name: "Monster Hunter", cn: "怪兽猎人", metric: "monsters", need: 1, en: "Beat a monster", zh: "打败 1 只怪兽" },
    { id: "mon5", tier: "gold", glyph: "monster", name: "Monster Master", cn: "怪兽大师", metric: "monsters", need: 5, en: "Beat all 5 monsters", zh: "打败全部 5 只怪兽" },
    { id: "chest10", tier: "diamond", glyph: "beach", name: "Beach Master", cn: "海滩大师", metric: "chests2", need: 5, en: "Open all 5 chests on the beach island", zh: "打开沙滩岛上的全部 5 个宝箱" },
  ];
  var DEF_BY = {};
  DEFS.forEach(function (d) {
    DEF_BY[d.id] = d;
  });

  function evaluate(ctx, have) {
    have = have || {};
    var list = [],
      fresh = [];
    DEFS.forEach(function (d) {
      var cur = Math.max(0, +ctx[d.metric] || 0),
        done = cur >= d.need;
      list.push({ def: d, cur: Math.min(cur, d.need), need: d.need, have: !!have[d.id] || done, was: !!have[d.id] });
      if (done && !have[d.id]) fresh.push(d.id);
    });
    return { list: list, fresh: fresh };
  }

  // What the sight-word badges count, from lef_words_v1 ({words:{key:{box}}, lessons:{id:{acc}}, rev:{...}}):
  // words = known words (box 3 or more), stars3 = lessons with 3 stars (90% right on the first try), swrev = days a review earned its star,
  // chests = treasure chests opened (rev keys "chest<island>-<unit>"), chests1 and chests2 = those of the mountain and the beach island;
  // words1 = known words of stage 1 (stage1 = the lower-case keys of its words; without it every known word counts)
  function swMetrics(sw, stage1) {
    sw = isObj(sw) ? sw : {};
    var words = 0,
      words1 = 0,
      stars3 = 0,
      swrev = 0,
      chests = 0,
      chests1 = 0,
      chests2 = 0,
      monsters = 0;
    if (isObj(sw.words))
      Object.keys(sw.words).forEach(function (k) {
        var r = sw.words[k];
        if (isObj(r) && (r.box || 0) >= 3) {
          words++;
          if (!stage1 || stage1.indexOf(k) >= 0) words1++;
        }
      });
    if (isObj(sw.lessons))
      Object.keys(sw.lessons).forEach(function (k) {
        var l = sw.lessons[k];
        if (isObj(l) && (l.acc || 0) >= 90) stars3++;
      });
    if (isObj(sw.rev))
      Object.keys(sw.rev).forEach(function (k) {
        if (/^\d{4}-\d\d-\d\d$/.test(k) && sw.rev[k]) swrev++;
        else if (/^mon[1-9]\d*$/.test(k) && sw.rev[k]) monsters++;
        else if (/^chest\d+-\d+$/.test(k) && sw.rev[k]) {
          chests++;
          if (/^chest1-/.test(k)) chests1++;
          if (/^chest2-/.test(k)) chests2++;
        }
      });
    return { words: words, words1: words1, stars3: stars3, swrev: swrev, chests: chests, chests1: chests1, chests2: chests2, monsters: monsters };
  }

  var core = {
    swMetrics: swMetrics,
    DEFS: DEFS,
    dayNum: dayNum,
    cleanStats: cleanStats,
    touchDay: touchDay,
    streakOf: streakOf,
    mergeStats: mergeStats,
    mergeBadges: mergeBadges,
    evaluate: evaluate,
    KEY_STATS: KEY_STATS,
    KEY_BADGES: KEY_BADGES,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = core;
  if (!root || !root.document) return;

  /* ------------------------------------------------------------------ browser part */
  var ls = null;
  try {
    ls = root.localStorage;
  } catch (e) {}
  var cfg = { subjectOf: null, ownedCount: null, seed: null };

  function readJ(k, d) {
    try {
      var v = JSON.parse(ls.getItem(k));
      return v === null || v === undefined ? d : v;
    } catch (e) {
      return d;
    }
  }
  function writeJ(k, v) {
    try {
      ls.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }

  /* ---- counters ---- */
  function readStats() {
    var raw = readJ(KEY_STATS, null);
    if (raw === null && cfg.seed) {
      // first time on this device: start from what the site already knows, so nobody begins at zero
      var sd = null;
      try {
        sd = cfg.seed();
      } catch (e) {}
      raw = { days: (sd && sd.days) || [], total: (sd && sd.total) || 0, reviews: 0 };
      writeJ(KEY_STATS, cleanStats(raw));
    }
    return cleanStats(raw);
  }
  function recordStars(n) {
    if (!(n > 0)) return;
    var s = readStats();
    s.total += n;
    touchDay(s, dayNum());
    writeJ(KEY_STATS, s);
  }
  function recordReview() {
    var s = readStats();
    s.reviews += 1;
    touchDay(s, dayNum());
    writeJ(KEY_STATS, s);
  }

  function context() {
    var B = readJ("lef_books_v1", {}),
      fin = 0,
      sharp = 0,
      subj = {},
      subjects = 0,
      S = readStats();
    Object.keys(B).forEach(function (slug) {
      var b = B[slug];
      if (!isObj(b)) return;
      if (b.fin) {
        fin++;
        var sj = cfg.subjectOf ? cfg.subjectOf(slug) : null;
        if (sj) subj[sj] = 1;
      }
      if (b.quiz) sharp++;
    });
    Object.keys(subj).forEach(function () {
      subjects++;
    });
    var owned = 0;
    try {
      owned = cfg.ownedCount ? cfg.ownedCount() : 0;
    } catch (e) {}
    var st1 = null;
    try {
      if (root.SW_DATA && root.SW_DATA.words)
        st1 = Object.keys(root.SW_DATA.words).map(function (w) {
          return w.toLowerCase().replace(/[^a-z]/g, "");
        });
    } catch (e) {}
    var sm = swMetrics(readJ("lef_words_v1", null), st1);
    return {
      books: fin,
      subjects: subjects,
      sharp: sharp,
      streak: streakOf(S.days, dayNum()),
      stars: S.total,
      owned: owned,
      reviews: S.reviews,
      words: sm.words,
      words1: sm.words1,
      stars3: sm.stars3,
      swrev: sm.swrev,
      chests: sm.chests,
      chests1: sm.chests1,
      chests2: sm.chests2,
      monsters: sm.monsters,
    };
  }

  /* ---- the medal pictures ---- */
  function starPath(r) {
    var p = "";
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + (i * Math.PI) / 5,
        rr = i % 2 ? r * 0.45 : r;
      p += (i ? "L" : "M") + (Math.cos(a) * rr).toFixed(1) + " " + (Math.sin(a) * rr).toFixed(1);
    }
    return p + "Z";
  }
  function glyph(g, on, dark) {
    var F = function (c) {
        return on ? c : "#C9D2DE";
      },
      S = on ? dark : "#93A0B4",
      sw = ' stroke="' + S + '" stroke-linejoin="round" stroke-linecap="round"';
    if (g === "book")
      return '<path d="M-14 -9Q-7 -12 0 -7Q7 -12 14 -9V10Q7 7 0 12Q-7 7 -14 10Z" fill="' + F("#8FD3FF") + '"' + sw + ' stroke-width="2.4"/><path d="M0 -7V12" stroke="' + S + '" stroke-width="2.2"/>';
    if (g === "star") return '<path d="' + starPath(14) + '" fill="' + F("#FFD54A") + '"' + sw + ' stroke-width="2.4"/>';
    if (g === "globe")
      return '<circle r="13" fill="' + F("#7DD3FC") + '"' + sw + ' stroke-width="2.4"/><ellipse rx="6" ry="13" fill="none"' + sw + ' stroke-width="1.8"/><path d="M-13 0H13M-11 -6.5H11M-11 6.5H11" fill="none"' + sw + ' stroke-width="1.6"/>';
    if (g === "flame")
      return '<path d="M0 -15C4 -8 12 -4 12 5C12 12 6 15 0 15C-6 15 -12 12 -12 5C-12 -1 -7 -3 -6 -10C-3 -8 -1 -5 -1 -2C2 -5 3 -10 0 -15Z" fill="' + F("#FF8A1F") + '"' + sw + ' stroke-width="2.2"/><path d="M0 4C3 7 5 9 4 12C3 14 -3 14 -4 12C-5 9 -2 7 0 4Z" fill="' + F("#FFD54A") + '"/>';
    if (g === "bulb")
      return '<circle cy="-3" r="10" fill="' + F("#FFE066") + '"' + sw + ' stroke-width="2.4"/><path d="M-5 6H5V11Q5 13 3 13H-3Q-5 13 -5 11Z" fill="' + F("#D3DBE5") + '"' + sw + ' stroke-width="2"/><path d="M-3 -2L0 2L3 -2" fill="none"' + sw + ' stroke-width="1.8"/>';
    if (g === "heart") return '<path d="M0 12C-15 2 -14 -11 -6 -11C-2 -11 0 -7 0 -7C0 -7 2 -11 6 -11C14 -11 15 2 0 12Z" fill="' + F("#FF8FB1") + '"' + sw + ' stroke-width="2.4"/>';
    if (g === "aa")
      return '<text y="6.5" text-anchor="middle" font-family="Fredoka,Nunito,sans-serif" font-weight="700" font-size="19" fill="' + F("#6A48E8") + '">Aa</text><path d="M-11 11H11" stroke="' + F("#FFC93C") + '" stroke-width="2.6" stroke-linecap="round"/>';
    if (g === "chest")
      return '<path d="M-13 -1H13V10Q13 12 11 12H-11Q-13 12 -13 10Z" fill="' + F("#C98B5A") + '"' + sw + ' stroke-width="2.2"/><path d="M-13 -1V-5Q-13 -13 0 -13Q13 -13 13 -5V-1Z" fill="' + F("#E0A06A") + '"' + sw + ' stroke-width="2.2"/><rect x="-2.2" y="-13" width="4.4" height="25" fill="' + F("#FFC93C") + '"' + sw + ' stroke-width="1.4"/><rect x="-3.6" y="-4" width="7.2" height="6.4" rx="1.6" fill="' + F("#FFE066") + '"' + sw + ' stroke-width="1.6"/>';
    if (g === "mountain")
      return '<path d="M-16 11L-5 -8L3 3L8 -12L16 11Z" fill="' + F("#8FA3C7") + '"' + sw + ' stroke-width="2.2"/><path d="M8 -12L4.5 -5L8 -7.5L11.5 -4.5Z" fill="' + F("#FFFFFF") + '"' + sw + ' stroke-width="1.2"/><path d="M-5 -8L-8 -2L-5 -4L-2 -1.6Z" fill="' + F("#FFFFFF") + '"' + sw + ' stroke-width="1.2"/>';
    if (g === "monster")
      return '<path d="M-13 12Q-17 -2 -8 -9Q0 -14 8 -9Q17 -2 13 12Z" fill="' + F("#7BD65A") + '"' + sw + ' stroke-width="2.2"/><circle cx="-4.5" cy="-1" r="3.4" fill="#fff"/><circle cx="4.5" cy="-1" r="3.4" fill="#fff"/><circle cx="-4" cy="-0.5" r="1.7" fill="' + F("#3A2A5E") + '"/><circle cx="5" cy="-0.5" r="1.7" fill="' + F("#3A2A5E") + '"/><path d="M-4 6Q0 9.5 4 6" fill="none" stroke="' + F("#3A2A5E") + '" stroke-width="1.8" stroke-linecap="round"/><path d="M0 -13Q-3 -19 2 -19" fill="none"' + sw + ' stroke-width="1.8"/>';
    if (g === "beach")
      return '<path d="M-15 11Q-9 6 -3 11T9 11T16 9V13H-15Z" fill="' + F("#7DD3FC") + '"' + sw + ' stroke-width="2"/><path d="M-14 3Q0 -18 14 3Z" fill="' + F("#FF8FB1") + '"' + sw + ' stroke-width="2.2"/><path d="M0 -11V11" stroke="' + S + '" stroke-width="2.4" stroke-linecap="round"/><circle cx="11" cy="-10" r="3.6" fill="' + F("#FFD54A") + '"' + sw + ' stroke-width="1.6"/>';
    if (g === "check") return '<circle r="13" fill="' + F("#7ED957") + '"' + sw + ' stroke-width="2.4"/><path d="M-6 0L-1.5 5L7 -5" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>';
    return "";
  }
  // one medal: a ribbon, a ring in the tier colour and a small picture; grey with a padlock until it is earned
  function medal(def, on) {
    var t = TIERS[def.tier] || TIERS.silver,
      ring = on ? t.a : "#E3E9F1",
      edge = on ? t.b : "#B4C0D0",
      rib = on ? "#E8456A" : "#CBD5E1",
      ribEdge = on ? "#9E1F3E" : "#9AA8BC",
      s = '<svg viewBox="0 0 80 96" aria-hidden="true">';
    s += '<path d="M22 55L12 88L26 82L33 93L43 60Z" fill="' + rib + '" stroke="' + ribEdge + '" stroke-width="2.4" stroke-linejoin="round"/>';
    s += '<path d="M58 55L68 88L54 82L47 93L37 60Z" fill="' + rib + '" stroke="' + ribEdge + '" stroke-width="2.4" stroke-linejoin="round"/>';
    s += '<circle cx="40" cy="38" r="31" fill="' + ring + '" stroke="' + edge + '" stroke-width="3.2"/>';
    s += '<circle cx="40" cy="38" r="23.5" fill="' + (on ? "#FFFDF2" : "#F3F6FA") + '" stroke="' + edge + '" stroke-width="1.8"/>';
    s += '<g transform="translate(40,38)">' + glyph(def.glyph, on, t.b) + "</g>";
    if (on && def.tier === "diamond") s += '<path d="M12 12L14 7L16 12L21 14L16 16L14 21L12 16L7 14Z" fill="#fff" stroke="' + edge + '" stroke-width="1"/><path d="M66 22L67.5 18.5L69 22L72.5 23.5L69 25L67.5 28.5L66 25L62.5 23.5Z" fill="#fff" stroke="' + edge + '" stroke-width="1"/>';
    if (!on) s += '<g transform="translate(58,60)"><rect x="-8" y="-3" width="16" height="12" rx="3" fill="#8E9BB0" stroke="#fff" stroke-width="2"/><path d="M-4.5 -3V-6.5A4.5 4.5 0 0 1 4.5 -6.5V-3" fill="none" stroke="#8E9BB0" stroke-width="2.6"/></g>';
    return s + "</svg>";
  }

  /* ---- pet items that only a badge can give ---- */
  var REWARDS = {};
  function registerRewards() {
    var K = root.PetKit;
    if (!K || !root.ITEMS || !K.G) return;
    var G = K.G,
      star5 = K.star5;
    var list = [
      {
        id: "bd-scholar", slot: "hat", name: "Scholar cap", cn: "学士帽", badge: "book5", vb: "22 14 76 52", a: { hx: 60, hy: 46, hs: 1 },
        draw: function (a) {
          return G(a, '<path d="M-15 3L-15 -8Q0 -2 15 -8L15 3Q0 8 -15 3Z" fill="#2B3A67" stroke="#141C3A" stroke-width="3" stroke-linejoin="round"/><path d="M-31 -13L0 -25L31 -13L0 -1Z" fill="#33477F" stroke="#141C3A" stroke-width="3" stroke-linejoin="round"/><circle cx="0" cy="-13" r="3.2" fill="#FFC93C" stroke="#B26A00" stroke-width="1.8"/><path d="M0 -13Q19 -10 25 -4L25 6" fill="none" stroke="#FFC93C" stroke-width="2.6" stroke-linecap="round"/><path d="M25 5L22 13M25 5L25 14M25 5L28 13" fill="none" stroke="#FFC93C" stroke-width="2.6" stroke-linecap="round"/>');
        },
      },
      {
        id: "bd-medal", slot: "neck", name: "Gold medal", cn: "金牌", badge: "day7", behind: true, nx: 1, vb: "26 98 68 50", a: { ny: 104 },
        draw: function (a) {
          // drawn UNDER the head (behind: true), so the cord comes up from behind the chin and the part at the back of the neck is
          // never visible; it runs down to a medal that rests on the chest
          return '<g transform="translate(0,' + (a.ny - 104 + (a.nd || 0)) + ')" fill="none" stroke-linejoin="round">' +
            '<path d="M36 90Q40 118 60 129M84 90Q80 118 60 129" stroke="#9E1F3E" stroke-width="7.4" stroke-linecap="butt"/><path d="M36 90Q40 118 60 129M84 90Q80 118 60 129" stroke="#E8456A" stroke-width="4.2" stroke-linecap="butt"/>' +
            '<circle cx="60" cy="136" r="10.5" fill="#FFD54A" stroke="#B8860B" stroke-width="3"/><path d="' + starPathAt(60, 136, 5.8) + '" fill="#fff" stroke="#B8860B" stroke-width="1.6"/></g>';
        },
      },
      {
        id: "bd-starglasses", slot: "face", name: "Star glasses", cn: "星星眼镜", badge: "star50", vb: "20 20 80 40", a: { ey: 40, edx: 20, er: 10 },
        draw: function (a) {
          var x1 = 60 - a.edx, x2 = 60 + a.edx, r = a.er + 5;
          return '<g stroke="#B8860B" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"><path d="' + starPathAt(x1, a.ey, r) + '" fill="rgba(255,213,74,.62)"/><path d="' + starPathAt(x2, a.ey, r) + '" fill="rgba(255,213,74,.62)"/><path d="M' + (x1 + r * 0.45) + " " + a.ey + "H" + (x2 - r * 0.45) + "M" + (x1 - r * 0.6) + " " + a.ey + "L" + (x1 - r - 7) + " " + (a.ey - 3) + "M" + (x2 + r * 0.6) + " " + a.ey + "L" + (x2 + r + 7) + " " + (a.ey - 3) + '" fill="none"/></g>';
        },
      },
    ];
    list.forEach(function (it) {
      REWARDS[it.id] = it;
      root.ITEMS[it.id] = it; // lets the pet picture and the small thumbnails draw it like any other accessory
    });
  }
  function starPathAt(x, y, r) {
    var p = "";
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + (i * Math.PI) / 5,
        rr = i % 2 ? r * 0.45 : r;
      p += (i ? "L" : "M") + (x + Math.cos(a) * rr).toFixed(1) + " " + (y + Math.sin(a) * rr).toFixed(1);
    }
    return p + "Z";
  }
  function earnedMap() {
    var m = readJ(KEY_BADGES, {});
    return isObj(m) ? m : {};
  }
  function isReward(id) {
    return !!REWARDS[id];
  }
  function unlocked(id) {
    var r = REWARDS[id];
    return !!r && !!earnedMap()[r.badge];
  }
  function rewardIds() {
    return Object.keys(REWARDS);
  }
  function badgeName(id) {
    return DEF_BY[id] ? DEF_BY[id].name + " " + DEF_BY[id].cn : id;
  }

  /* ---- styles ---- */
  var styled = false;
  function injectStyle() {
    if (styled) return;
    styled = true;
    var st = document.createElement("style");
    st.textContent =
      "#viewPets .bdhead{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;font-weight:800;font-size:15px;margin-bottom:2px}" +
      "#viewPets .bdchip{display:inline-flex;align-items:center;gap:6px;background:#FFF1C2;border:3px solid #FFC93C;border-radius:999px;padding:4px 12px}" +
      "#viewPets .bdchip small{font-weight:700;color:#4A5878}" +
      "#viewPets .bdc{position:relative;background:#F4FAFF;border:3px solid #D5E3F0;border-radius:24px;padding:10px 6px 10px;text-align:center;font-weight:800;color:#1E2A4A}" +
      "#viewPets .bdc.on{background:#FFFBEA;border-color:#FFC93C}" +
      "#viewPets .bdc.new{box-shadow:0 0 0 3px rgba(106,72,232,.35)}" +
      "#viewPets .bdc svg{display:block;width:62px;height:auto;margin:0 auto 4px}" +
      "#viewPets .bdc .bn{font-size:14px;line-height:1.15}" +
      "#viewPets .bdc .bc{font-size:12px;color:#4A5878;font-weight:700}" +
      "#viewPets .bdc .bh{font-size:11.5px;color:#4A5878;font-weight:700;margin-top:4px;line-height:1.25}" +
      "#viewPets .bdc .bbar{height:8px;border-radius:99px;background:#E6EEF7;margin:6px 10px 0;overflow:hidden}" +
      "#viewPets .bdc .bbar i{display:block;height:100%;background:#35B779;border-radius:99px}" +
      "#viewPets .bdc .bgift{display:inline-block;margin-top:6px;background:#EFE9FF;color:#4A2FB8;border-radius:999px;padding:2px 9px;font-size:11.5px}" +
      "#viewPets .bdc .bgift.got{background:#DFF5E7;color:#2E6B43}" +
      "#bdToast{position:fixed;left:50%;bottom:96px;transform:translateX(-50%) translateY(30px);opacity:0;z-index:3600;pointer-events:none;display:flex;align-items:center;gap:14px;background:#fff;border:3px solid #6A48E8;border-radius:26px;padding:10px 20px 10px 12px;box-shadow:0 8px 0 #4A2FB8,0 14px 30px rgba(30,42,74,.3);transition:.35s;max-width:calc(100vw - 24px);font-family:'Nunito',sans-serif;color:#1E2A4A}" +
      "#bdToast.on{opacity:1;transform:translateX(-50%) translateY(0)}" +
      "#bdToast svg{width:58px;height:auto;flex:none}" +
      "#bdToast .k{font-weight:800;font-size:13px;color:#6A48E8;letter-spacing:.3px}" +
      "#bdToast .n{font-family:'Fredoka',sans-serif;font-weight:700;font-size:22px;line-height:1.1}" +
      "#bdToast .g{font-weight:800;font-size:14px;color:#2E6B43;margin-top:2px}" +
      "@media(prefers-reduced-motion:reduce){#bdToast{transition:none}}";
    document.head.appendChild(st);
  }

  /* ---- the Badges tab of the pet shop ---- */
  var FLAME_SM = '<svg viewBox="-14 -17 28 33" width="18" height="21" aria-hidden="true">' + glyph("flame", true, "#C25A00") + "</svg>";
  var STAR_SM = '<svg viewBox="-15 -15 30 30" width="18" height="18" aria-hidden="true">' + glyph("star", true, "#B8860B") + "</svg>";
  function renderTab(el) {
    injectStyle();
    var ctx = context(),
      have = earnedMap(),
      res = evaluate(ctx, have),
      got = 0;
    res.list.forEach(function (r) {
      if (r.have) got++;
    });
    var h = '<div class="bdhead"><span class="bdchip">' + FLAME_SM + " Streak 连续 " + ctx.streak + ' <small>day' + (ctx.streak === 1 ? "" : "s") + "</small></span>" +
      '<span class="bdchip">' + STAR_SM + " " + ctx.stars + ' <small>stars earned in total 累计赚到</small></span>' +
      '<span class="bdchip">Badges 徽章 ' + got + " / " + res.list.length + "</span></div>";
    res.list.forEach(function (r) {
      var d = r.def,
        pct = Math.round((r.cur / r.need) * 100),
        rw = d.reward && REWARDS[d.reward];
      h += '<div class="bdc' + (r.have ? " on" : "") + '"><div>' + medal(d, r.have) + '</div><div class="bn">' + d.name + '</div><div class="bc">' + d.cn + "</div>" +
        (r.have ? "" : '<div class="bbar"><i style="width:' + pct + '%"></i></div>') +
        '<div class="bh">' + (r.have ? "" : r.cur + " / " + r.need + " · ") + d.en + "<br>" + d.zh + "</div>" +
        (rw ? '<span class="bgift' + (r.have ? " got" : "") + '">' + (r.have ? "Unlocked 已解锁: " : "Unlocks 解锁: ") + rw.name + " " + rw.cn + "</span>" : "") + "</div>";
    });
    el.innerHTML = h;
  }

  /* ---- announcing a new badge ---- */
  var queue = [],
    showing = false;
  function sfx() {
    try {
      if (root.PetSound && root.PetSound.play) root.PetSound.play("big");
    } catch (e) {}
  }
  function announce(ids) {
    // several at once (the first visit after badges arrived, or after signing in on a new device): one note, not a long queue
    if (ids.length > 2) queue.push({ many: ids });
    else
      ids.forEach(function (id) {
        queue.push(id);
      });
    if (!showing) next();
  }
  function next() {
    var id = queue.shift();
    if (!id) {
      showing = false;
      return;
    }
    showing = true;
    injectStyle();
    var many = id && id.many,
      d = many ? null : DEF_BY[id],
      rw = d && d.reward && REWARDS[d.reward],
      el = document.getElementById("bdToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "bdToast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    if (many) {
      var best = many.slice(-3).map(function (x) {
        return medal(DEF_BY[x], true);
      });
      el.innerHTML = best.join("") + '<div><div class="k">New badges! 新徽章</div><div class="n">You have ' + many.length + ' new badges!</div><div class="g">Open the Badges tab to see them. 打开“徽章”看看。</div></div>';
    } else
      el.innerHTML = medal(d, true) + '<div><div class="k">New badge! 新徽章</div><div class="n">' + d.name + ' <span style="font-size:15px;color:#4A5878">' + d.cn + "</span></div>" +
        (rw ? '<div class="g">Unlocked 已解锁: ' + rw.name + " " + rw.cn + " (Dress-up 服饰)</div>" : "") + "</div>";
    el.classList.add("on");
    sfx();
    try {
      if (typeof root.burst === "function") root.burst(root.innerWidth / 2, root.innerHeight - 120);
    } catch (e) {}
    setTimeout(function () {
      el.classList.remove("on");
      setTimeout(next, 500);
    }, 4600);
  }

  /* ---- checking ---- */
  function check() {
    var raw = readJ(KEY_BADGES, null),
      first = raw === null,
      have = isObj(raw) ? raw : {},
      res = evaluate(context(), have);
    if (!res.fresh.length) {
      if (first) writeJ(KEY_BADGES, {});
      return [];
    }
    var now = Date.now();
    res.fresh.forEach(function (id) {
      have[id] = now;
    });
    writeJ(KEY_BADGES, have);
    announce(res.fresh);
    return res.fresh;
  }
  var soonT = null;
  function soon(ms) {
    clearTimeout(soonT);
    soonT = setTimeout(check, ms || 1400); // later than the "+stars" note, so the two do not cover each other
  }

  root.Badges = {
    DEFS: DEFS,
    REWARDS: REWARDS,
    init: function (c) {
      cfg = { subjectOf: c.subjectOf || null, ownedCount: c.ownedCount || null, seed: c.seed || null };
      registerRewards();
      readStats();
    },
    recordStars: recordStars,
    recordReview: recordReview,
    context: context,
    stats: readStats,
    earned: earnedMap,
    check: check,
    soon: soon,
    renderTab: renderTab,
    medal: medal,
    tabIcon: function () {
      return medal(DEF_BY.star200, true); // the small picture on the shop's Badges tab
    },
    isReward: isReward,
    unlocked: unlocked,
    rewardIds: rewardIds,
    badgeName: badgeName,
    dayNum: dayNum,
  };
})(typeof window !== "undefined" ? window : this);
