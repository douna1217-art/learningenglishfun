// node tools/report_card_test.js
var RC = require("../site/report-card.js"), PR = require("../site/parent-report.js"), n = 0, bad = 0;
function ok(c, m) { n++; if (!c) { bad++; console.log("FAIL: " + m); } }
var DAY = 86400000, today = PR.dayNum(new Date(2026, 10, 13));
var s = PR.summarize({ stats: { days: [today, today - 1, today - 3], total: 42 }, books: { a: { fin: 1 }, b: { fin: 1 } },
  hist: [{ slug: "a", t: (today - 1) * DAY + 1, quiz: true }, { slug: "b", t: today * DAY + 1, quiz: false }] }, today, function (x) { return "Book " + x; });
var m = RC.model("Lily", s, new Date(2026, 10, 13));
ok(m.title === "Lily’s week", "title");
ok(m.range === "Nov 7 – Nov 13", "range " + m.range);
ok(m.week.length === 7 && m.week[6].on && m.week[5].on && !m.week[4].on && m.week[3].on, "dots");
ok(m.week[6].label === "Fri" && m.week[0].label === "Sat", "weekday labels");
ok(m.tiles[0].num === "3 / 7" && m.tiles[2].num === "2" && m.tiles[3].num === "50%", "tiles " + JSON.stringify(m.tiles.map(function (t) { return t.num; })));
ok(m.total.indexOf("2 books finished") === 0 && m.total.indexOf("42 stars") > 0, "total");
ok(m.recent.length === 2 && m.recent[0] === "Book b", "recent");
ok(RC.model("  ", s).title === "This week", "blank name");
ok(RC.model("A\nB  C", s).title === "A B C’s week", "name cleaned");
ok(RC.model("x".repeat(60), s).title.length <= 31, "name capped");
var e = RC.model("Kid", PR.summarize({}, today), new Date(2026, 10, 13));
ok(e.empty && e.tiles[3].num === "–" && e.recent.length === 0, "empty week");
// draw against a recording context
var calls = 0, texts = [], ctx = new Proxy({}, { get: function (t, k) {
  if (k === "measureText") return function (x) { return { width: x.length * 18 }; };
  if (k === "createLinearGradient") return function () { return { addColorStop: function () {} }; };
  return function (a) { calls++; if (k === "fillText") texts.push(a); }; }, set: function () { return true; } });
RC.draw(ctx, m);
ok(calls > 50, "draws");
ok(texts.indexOf("Lily’s week") >= 0 && texts.some(function (t) { return /learning-english-fun\.com/.test(t); }), "text drawn");
ok(texts.every(function (t) { return typeof t === "string"; }), "all strings");
console.log(n + " checks, " + bad + " failed"); process.exit(bad ? 1 : 0);
