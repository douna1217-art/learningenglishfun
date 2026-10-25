/* Today's mini goals, and a streak saver.

   Three small goals every day: finish 1 book, answer 3 questions right, listen to 1 page to the end. Doing all three earns 2 bonus stars (they count against the
   normal 10-a-day star limit like every other star) and the pet celebrates. Small goals are easier to finish than one big one, so a child who only has five
   minutes still gets something to tick.

   The streak saver: the streak (badges.js) counts days on which the child earned something. If exactly ONE day was missed after a streak of at least two days,
   the next visit quietly fills that day in and tells the child the pet saved the streak. It can be used once every 7 days.

   Local to the device (lef_goal_v1, lef_repair_v1); the repaired day itself is written into lef_stats_v1, which is synced like before.
   DailyGoals.init({ booksToday: fn, award: fn(n) -> stars given, toast: fn(lines, total, capped), notice: fn(en, cn), celebrate: fn, streak: fn })
   DailyGoals.note("correct" | "listen", n) -> {fresh, got}     DailyGoals.check(quiet) -> {fresh, got}     DailyGoals.render()     DailyGoals.repair()
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";

  var KEY = "lef_goal_v1",
    KEY_REPAIR = "lef_repair_v1",
    KEY_STATS = "lef_stats_v1",
    BONUS = 2,
    COOLDOWN = 7,
    GOALS = [
      { id: "book", need: 1, ic: "📖", en: "Finish 1 book", cn: "读完 1 本书" },
      { id: "correct", need: 3, ic: "✅", en: "Get 3 questions right", cn: "答对 3 道题" },
      { id: "listen", need: 1, ic: "🎧", en: "Listen to 1 page to the end", cn: "听完 1 页" },
    ];

  /* ---- pure part (also used by the node tests) ---- */
  function blank(date) {
    return { date: date, correct: 0, listened: 0, done: false, shown: false };
  }
  function progress(g, books) {
    return GOALS.map(function (d) {
      var have = d.id === "book" ? books : d.id === "correct" ? g.correct : g.listened;
      have = Math.max(0, +have || 0);
      return { def: d, have: Math.min(have, d.need), need: d.need, ok: have >= d.need };
    });
  }
  function allDone(p) {
    return p.every(function (x) {
      return x.ok;
    });
  }
  // days: learning day numbers, today: today's day number, last: the day the saver was last used (or null).
  // Returns the day to fill in, or null.
  function repairPlan(days, last, today) {
    var set = {},
      n = 0,
      d;
    days.forEach(function (x) {
      set[x] = 1;
    });
    if (set[today] || set[today - 1] || !set[today - 2]) return null;
    if (last !== null && last !== undefined && today - last < COOLDOWN) return null;
    d = today - 2;
    while (set[d]) {
      n++;
      d--;
    }
    return n >= 2 ? today - 1 : null;
  }
  function cooldownLeft(last, today) {
    if (last === null || last === undefined) return 0;
    return Math.max(0, COOLDOWN - (today - last));
  }

  /* ---- browser part ---- */
  var cfg = null;
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
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }
  function dayNum() {
    return root.Badges && root.Badges.dayNum ? root.Badges.dayNum() : Math.floor(Date.now() / 86400000);
  }
  function state() {
    var g = readJ(KEY, null),
      t = todayStr();
    return g && g.date === t ? g : blank(t);
  }
  function books() {
    try {
      return cfg && cfg.booksToday ? cfg.booksToday() : 0;
    } catch (e) {
      return 0;
    }
  }

  function check(quiet) {
    var g = state(),
      p = progress(g, books());
    if (!allDone(p) || g.done) return { fresh: false, got: 0 };
    g.done = true;
    var got = 0;
    try {
      got = cfg.award(BONUS) || 0;
    } catch (e) {}
    writeJ(KEY, g);
    if (!quiet) {
      try {
        cfg.toast([[BONUS, "Daily goals done", "今日小目标完成"]], got, got < BONUS);
      } catch (e) {}
    }
    try {
      render();
    } catch (e) {}
    return { fresh: true, got: got };
  }
  function note(kind, n) {
    if (!cfg || !(n > 0)) return { fresh: false, got: 0 };
    var g = state();
    if (kind === "correct") g.correct += n;
    else if (kind === "listen") g.listened += n;
    else return { fresh: false, got: 0 };
    writeJ(KEY, g);
    var r = check(false);
    try {
      render();
    } catch (e) {}
    return r;
  }

  function repair() {
    var s = readJ(KEY_STATS, null),
      today = dayNum();
    if (!s || !Array.isArray(s.days)) return false;
    var last = readJ(KEY_REPAIR, null),
      fix = repairPlan(s.days, last && typeof last.last === "number" ? last.last : null, today);
    if (fix === null) return false;
    s.days.push(fix);
    s.days.sort(function (a, b) {
      return a - b;
    });
    writeJ(KEY_STATS, s);
    writeJ(KEY_REPAIR, { last: today });
    try {
      cfg.notice("Your pet saved your streak!", "宠物帮你保住了连续学习天数！");
    } catch (e) {}
    return true;
  }

  function style() {
    if (document.getElementById("dgStyle")) return;
    var s = document.createElement("style");
    s.id = "dgStyle";
    s.textContent =
      "#dailyGoals{padding:34px 48px 0}@media(max-width:700px){#dailyGoals{padding:26px 16px 0}}" +
      "#dailyGoals .dg{max-width:760px;margin:0 auto;background:#fff;border:3px solid #FFC93C;border-radius:26px;padding:16px 18px 14px;box-shadow:0 6px 0 rgba(255,201,60,.35)}" +
      "#dailyGoals .dgh{display:flex;align-items:center;gap:12px}" +
      "#dailyGoals .dgp{width:54px;height:54px;flex:none}" +
      "#dailyGoals.fin .dgp{animation:dgHop 1.1s ease-in-out 3}" +
      "@keyframes dgHop{0%,100%{transform:none}35%{transform:translateY(-9px) rotate(-5deg)}65%{transform:translateY(0) rotate(4deg)}}" +
      "@media(prefers-reduced-motion:reduce){#dailyGoals.fin .dgp{animation:none}}" +
      "#dailyGoals h3{margin:0;font-family:Fredoka,ui-rounded,'Trebuchet MS',Arial,sans-serif;font-size:1.3rem;line-height:1.15;color:#2D2250}" +
      "#dailyGoals h3 small{display:block;font-size:.85rem;font-weight:700;opacity:.6}" +
      "#dailyGoals .dgs{margin-left:auto;font-weight:900;background:#FFF3C4;border-radius:999px;padding:5px 12px;white-space:nowrap;color:#7A4A00}" +
      "#dailyGoals ul{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:8px}" +
      "#dailyGoals li{display:flex;align-items:center;gap:10px;background:#F7F3FF;border-radius:16px;padding:9px 12px;font-weight:800;color:#2D2250}" +
      "#dailyGoals li.ok{background:#E6F7EA;color:#1F6B3A}" +
      "#dailyGoals li .ic{font-size:1.3rem;width:1.6rem;text-align:center;flex:none}" +
      "#dailyGoals li .tx{flex:1;min-width:0;line-height:1.2}#dailyGoals li .tx small{display:block;font-weight:700;opacity:.65;font-size:.78rem}" +
      "#dailyGoals li .pg{font-weight:900;white-space:nowrap}" +
      "#dailyGoals .dgf{margin-top:10px;font-weight:800;font-size:.9rem;color:#4A3F7A;line-height:1.35}" +
      "#dailyGoals .dgf small{display:block;font-weight:700;opacity:.65}";
    document.head.appendChild(s);
  }

  function render() {
    var el = document.getElementById("dailyGoals");
    if (!el || !cfg) return;
    style();
    var g = state(),
      p = progress(g, books()),
      done = allDone(p),
      streak = 0,
      today = dayNum(),
      last = readJ(KEY_REPAIR, null),
      left = cooldownLeft(last && typeof last.last === "number" ? last.last : null, today),
      pet = "";
    try {
      streak = cfg.streak() || 0;
    } catch (e) {}
    try {
      pet = cfg.petIcon ? cfg.petIcon() : "";
    } catch (e) {}
    var rows = p
      .map(function (x) {
        return (
          '<li class="' + (x.ok ? "ok" : "") + '"><span class="ic">' + (x.ok ? "✓" : x.def.ic) + '</span><span class="tx">' + x.def.en + "<small>" + x.def.cn +
          '</small></span><span class="pg">' + (x.ok ? "Done" : x.have + "/" + x.need) + "</span></li>"
        );
      })
      .join("");
    var foot = done
      ? "All three done! +" + BONUS + " bonus stars 🎉<small>三个小目标都完成了，奖励 " + BONUS + " 颗星</small>"
      : "Do all three for " + BONUS + " bonus stars<small>三个都完成，奖励 " + BONUS + " 颗星</small>";
    var saver =
      streak >= 2
        ? left === 0
          ? "🛡️ Streak saver ready: if you miss one day, your pet keeps your streak.<small>连续天数保护已就绪：漏一天，宠物帮你保住</small>"
          : "🛡️ Streak saver is resting for " + left + (left === 1 ? " more day" : " more days") + ".<small>连续天数保护还要 " + left + " 天恢复</small>"
        : "";
    el.className = done ? "fin" : "";
    el.innerHTML =
      '<div class="dg"><div class="dgh"><span class="dgp">' + pet + "</span><h3>Today's mini goals<small>今日小目标</small></h3>" +
      (streak > 0 ? '<span class="dgs">🔥 ' + streak + (streak === 1 ? " day" : " days") + "</span>" : "") +
      "</div><ul>" + rows + '</ul><div class="dgf">' + foot + "</div>" + (saver ? '<div class="dgf">' + saver + "</div>" : "") + "</div>";
    if (done && !g.shown) {
      g.shown = true;
      writeJ(KEY, g);
      try {
        cfg.celebrate();
      } catch (e) {}
    }
  }

  root.DailyGoals = {
    GOALS: GOALS,
    BONUS: BONUS,
    COOLDOWN: COOLDOWN,
    init: function (c) {
      cfg = c;
    },
    note: note,
    check: check,
    render: render,
    repair: repair,
    _pure: { blank: blank, progress: progress, allDone: allDone, repairPlan: repairPlan, cooldownLeft: cooldownLeft },
  };
  if (typeof module !== "undefined" && module.exports) module.exports = root.DailyGoals;
})(typeof window !== "undefined" ? window : this);
