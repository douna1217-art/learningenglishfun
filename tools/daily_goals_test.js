/* node tools/daily_goals_test.js : the pure rules of daily-goals.js, and its flow against a fake localStorage */
var assert = require("assert"), n = 0;
function t(name, fn) { fn(); n++; }
var DG = require("../site/daily-goals.js"), P = DG._pure;

t("goals list", function () { assert.deepStrictEqual(DG.GOALS.map(function (g) { return g.id + g.need; }), ["book1", "correct3", "listen1"]); });
t("progress caps at need and flags ok", function () {
  var p = P.progress({ correct: 5, listened: 0 }, 1);
  assert.deepStrictEqual(p.map(function (x) { return x.have + "/" + x.need + (x.ok ? "y" : "n"); }), ["1/1y", "3/3y", "0/1n"]);
  assert.strictEqual(P.allDone(p), false);
  assert.strictEqual(P.allDone(P.progress({ correct: 3, listened: 1 }, 1)), true);
});
t("repairPlan: one missed day after a streak of 2+", function () {
  assert.strictEqual(P.repairPlan([8, 9], null, 11), 10);
  assert.strictEqual(P.repairPlan([5, 6, 7, 8, 9], null, 11), 10);
});
t("repairPlan: nothing to save", function () {
  assert.strictEqual(P.repairPlan([9], null, 11), null, "a streak of 1 is not worth saving");
  assert.strictEqual(P.repairPlan([8, 9], null, 12), null, "two days missed");
  assert.strictEqual(P.repairPlan([8, 9, 10], null, 11), null, "yesterday was done");
  assert.strictEqual(P.repairPlan([8, 9, 11], null, 11), null, "today is done");
  assert.strictEqual(P.repairPlan([], null, 11), null);
});
t("repairPlan: once every 7 days", function () {
  assert.strictEqual(P.repairPlan([8, 9], 5, 11), null, "used 6 days ago");
  assert.strictEqual(P.repairPlan([8, 9], 4, 11), 10, "used 7 days ago");
  assert.strictEqual(P.cooldownLeft(5, 11), 1);
  assert.strictEqual(P.cooldownLeft(null, 11), 0);
});

/* the flow, against a fake window */
var store = {}, awarded = 0, toasts = [], notices = [], booksToday = 0, today = 100;
var fake = {
  localStorage: { getItem: function (k) { return k in store ? store[k] : null; }, setItem: function (k, v) { store[k] = String(v); } },
  Badges: { dayNum: function () { return today; } },
  document: { getElementById: function () { return null; } },
};
global.window = fake; global.document = fake.document; global.localStorage = fake.localStorage;
delete require.cache[require.resolve("../site/daily-goals.js")];
var D2 = require("../site/daily-goals.js");
function init() {
  D2.init({ booksToday: function () { return booksToday; }, award: function (k) { awarded += k; return k; }, toast: function (l, tt) { toasts.push(tt); },
    notice: function (en) { notices.push(en); }, celebrate: function () {}, streak: function () { return 0; } });
}
// the module attached itself to the fake window only under a browser; here it is exported
t("flow: bonus is paid once, when the last goal lands", function () {
  init(); fake.DailyGoals = D2;
  assert.strictEqual(D2.note("correct", 2).fresh, false);
  booksToday = 1;
  assert.strictEqual(D2.note("listen", 1).fresh, false, "3rd question still missing");
  var r = D2.note("correct", 1);
  assert.strictEqual(r.fresh, true); assert.strictEqual(r.got, 2); assert.strictEqual(awarded, 2);
  assert.strictEqual(D2.note("correct", 5).fresh, false, "no second payout"); assert.strictEqual(awarded, 2);
  assert.strictEqual(toasts.length, 1);
});
t("flow: quiet check (the ceremony adds the line itself)", function () {
  store = {}; awarded = 0; toasts = []; booksToday = 1; init();
  D2.note("correct", 3); // book done + 3 right, but nothing heard yet
  assert.strictEqual(D2.check(true).fresh, false);
  D2.note("listen", 1);
  assert.strictEqual(awarded, 2);
  store = {}; awarded = 0; toasts = []; booksToday = 0; init(); D2.note("correct", 3); D2.note("listen", 1);
  booksToday = 1; var c = D2.check(true);
  assert.strictEqual(c.fresh, true); assert.strictEqual(toasts.length, 0, "quiet means no toast"); assert.strictEqual(awarded, 2);
});
t("flow: a new day starts again from zero", function () {
  store = {}; awarded = 0; booksToday = 0; init(); D2.note("correct", 3);
  var g = JSON.parse(store.lef_goal_v1); assert.strictEqual(g.correct, 3);
  g.date = "1999-1-1"; store.lef_goal_v1 = JSON.stringify(g);
  D2.note("listen", 1); g = JSON.parse(store.lef_goal_v1); assert.strictEqual(g.correct, 0); assert.strictEqual(g.listened, 1);
});
t("repair(): fills yesterday into the stats once", function () {
  store = { lef_stats_v1: JSON.stringify({ days: [97, 98], total: 10, reviews: 0 }) }; notices = []; today = 100; init();
  assert.strictEqual(D2.repair(), true);
  assert.deepStrictEqual(JSON.parse(store.lef_stats_v1).days, [97, 98, 99]);
  assert.strictEqual(JSON.parse(store.lef_repair_v1).last, 100); assert.strictEqual(notices.length, 1);
  assert.strictEqual(D2.repair(), false, "already repaired");
  // missing again 3 days later: the saver is resting
  store.lef_stats_v1 = JSON.stringify({ days: [99, 100, 101], total: 10, reviews: 0 }); today = 103;
  assert.strictEqual(D2.repair(), false);
  today = 110; store.lef_stats_v1 = JSON.stringify({ days: [107, 108], total: 10, reviews: 0 });
  assert.strictEqual(D2.repair(), true, "ready again after 7 days");
});
t("repair(): no stats yet means nothing to do", function () { store = {}; init(); assert.strictEqual(D2.repair(), false); });

console.log(n + " passed, 0 failed");
