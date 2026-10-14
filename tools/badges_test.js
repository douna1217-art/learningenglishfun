#!/usr/bin/env node
// Tests for site/badges.js (streak, badge rules, merges) and the matching merges in site/state-sync.js.
//   node tools/badges_test.js
const path = require("path");
const B = require(path.join(__dirname, "..", "site", "badges.js"));
const S = require(path.join(__dirname, "..", "site", "state-sync.js"));

let passed = 0, failed = 0;
function ok(cond, name, extra) {
  if (cond) passed++; else { failed++; console.log("  FAIL:", name, extra === undefined ? "" : JSON.stringify(extra)); }
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- day numbers and the streak
const d = (y, m, day) => B.dayNum(new Date(y, m - 1, day));
ok(d(2026, 10, 12) - d(2026, 10, 11) === 1, "consecutive dates are one day number apart");
ok(d(2026, 11, 1) - d(2026, 10, 31) === 1 && d(2027, 1, 1) - d(2026, 12, 31) === 1, "month and year ends stay consecutive");
ok(d(2026, 3, 9) - d(2026, 3, 8) === 1 && d(2026, 11, 2) - d(2026, 11, 1) === 1, "daylight-saving days stay one apart");
ok(B.streakOf([8, 9, 10], 10) === 3, "streak counts today");
ok(B.streakOf([8, 9, 10], 11) === 3, "streak stays alive until a whole day is missed");
ok(B.streakOf([8, 9, 10], 12) === 0, "a missed day ends the streak");
ok(B.streakOf([5, 6, 8, 9], 9) === 2, "a gap cuts the streak");
ok(B.streakOf([], 9) === 0, "no days, no streak");

// ---- stats cleaning and touching
let s = B.cleanStats({ days: [5, 3, 5, "x", NaN, 4], total: -4, reviews: "7" });
ok(eq(s, { days: [3, 4, 5], total: 0, reviews: 7 }), "junk is cleaned, days sorted and unique", s);
ok(eq(B.cleanStats(null), { days: [], total: 0, reviews: 0 }), "missing stats are empty");
s = B.touchDay({ days: [1, 2], total: 0, reviews: 0 }, 3);
ok(eq(s.days, [1, 2, 3]), "touchDay adds a new day");
s = B.touchDay(s, 3);
ok(eq(s.days, [1, 2, 3]), "touchDay twice does not repeat a day");
const many = { days: [], total: 0, reviews: 0 };
for (let i = 0; i < 450; i++) B.touchDay(many, i);
ok(many.days.length === 400 && many.days[399] === 449, "only the latest 400 days are kept", many.days.length);

// ---- badge rules
const none = { books: 0, subjects: 0, sharp: 0, streak: 0, stars: 0, owned: 0, reviews: 0 };
ok(B.evaluate(none, {}).fresh.length === 0, "nothing earned at zero");
let r = B.evaluate(Object.assign({}, none, { books: 5 }), {});
ok(eq(r.fresh, ["book1", "book5"]), "5 books earns the first two reading badges", r.fresh);
r = B.evaluate(Object.assign({}, none, { books: 5 }), { book1: 1 });
ok(eq(r.fresh, ["book5"]), "a badge already earned is not announced again", r.fresh);
r = B.evaluate(Object.assign({}, none, { books: 3 }), { book1: 1 });
const w = r.list.filter((x) => x.def.id === "book5")[0];
ok(w.cur === 3 && w.need === 5 && !w.have, "progress shows 3 of 5", w);
r = B.evaluate(Object.assign({}, none, { books: 99 }), {});
ok(r.list.filter((x) => x.def.id === "book50")[0].cur === 50, "progress never goes above the target");
r = B.evaluate(Object.assign({}, none, { streak: 7, stars: 60, subjects: 3 }), {});
ok(eq(r.fresh.sort(), ["day3", "day7", "star50", "sub3"]), "streak, stars and subjects badges", r.fresh);
ok(B.DEFS.every((x) => x.id && x.tier && x.glyph && x.need > 0 && x.en && x.zh && x.cn), "every badge has its texts and a target");
ok(new Set(B.DEFS.map((x) => x.id)).size === B.DEFS.length, "badge ids are unique");
const rewardIds = B.DEFS.filter((x) => x.reward).map((x) => x.reward).sort();
ok(eq(rewardIds, ["bd-medal", "bd-scholar", "bd-starglasses"]), "three badges unlock pet items", rewardIds);

// ---- merges (badges.js and state-sync.js must agree)
[["badges.js", B], ["state-sync.js", S]].forEach(([name, M]) => {
  let m = M.mergeStats({ days: [1, 2], total: 10, reviews: 1 }, { days: [2, 3], total: 25, reviews: 0 });
  ok(eq(m, { days: [1, 2, 3], total: 25, reviews: 1 }), name + ": stats keep every day and the larger counters", m);
  m = M.mergeStats({ days: [1] }, null);
  ok(eq(m.days, [1]) && m.total === 0, name + ": stats merge with a missing side", m);
  m = M.mergeBadges({ a: 500, b: 300 }, { b: 100, c: 700 });
  ok(eq(m, { a: 500, b: 100, c: 700 }), name + ": badges keep all, earlier time wins", m);
  ok(eq(M.mergeBadges(null, { a: 5 }), { a: 5 }) && eq(M.mergeBadges({ a: 5 }, undefined), { a: 5 }), name + ": badges merge with a missing side");
});
ok(S.isSyncKey("lef_stats_v1") && S.isSyncKey("lef_badges_v1"), "the two new keys are synced");
ok(eq(S.mergeValue("lef_badges_v1", { x: 3 }, { y: 4 }), { x: 3, y: 4 }), "mergeValue routes the badges key");
ok(S.mergeValue("lef_stats_v1", { days: [1], total: 1, reviews: 0 }, { days: [2], total: 2, reviews: 0 }).days.length === 2, "mergeValue routes the stats key");

// ---- the sight-word badges
const swSample = { words: { a: { box: 3 }, b: { box: 2 }, c: { box: 5 } }, lessons: { 1: { acc: 100 }, 2: { acc: 89 }, 3: { acc: 90 } },
  rev: { "2026-10-14": 123, "2026-10-15": 0, "g2026-10-14": 5, "b2026-10-14": 4, "chest1-1": 9, "chest1-2": 9 } };
ok(eq(B.swMetrics(swSample), { words: 2, stars3: 2, swrev: 1, chests: 2 }), "sight words: known words (box 3+), 3-star lessons, review days and opened chests are counted; game days are not", B.swMetrics(swSample));
ok(eq(B.swMetrics(null), { words: 0, stars3: 0, swrev: 0, chests: 0 }) && eq(B.swMetrics({ words: 5, rev: "x" }), { words: 0, stars3: 0, swrev: 0, chests: 0 }), "sight words: missing or broken progress counts as zero");
const swIds = ["sw10", "sw50", "sw92", "swstar3", "swrev5", "chest1", "chest5"];
ok(swIds.every((id) => B.DEFS.some((d) => d.id === id)) && B.DEFS.length === 20, "sight words: seven badges were added to the thirteen that were there");
let swr = B.evaluate({ words: 10, stars3: 0, swrev: 0, chests: 0 }, {});
ok(eq(swr.fresh, ["sw10"]), "sight words: ten known words earn First Words only", swr.fresh);
swr = B.evaluate({ words: 92, stars3: 3, swrev: 5, chests: 5 }, {});
ok(eq(swr.fresh.slice().sort(), swIds.slice().sort()), "sight words: every one of them can be earned", swr.fresh);
swr = B.evaluate({ chests: 1 }, { sw10: 5 });
ok(eq(swr.fresh, ["chest1"]), "sight words: one chest earns Treasure Hunter, nothing earned twice", swr.fresh);

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
