// node tools/next_book_test.js
var NB = require("../site/next-book.js"), n = 0, bad = 0;
function ok(c, m) { n++; if (!c) { bad++; console.log("FAIL: " + m); } }
function B(slug, subject, grade) { return { slug: slug, subject: subject, grade: grade, title: slug }; }
var all = [B("f1", "Fiction", "Grade 2"), B("f2", "Fiction", "Grade 2"), B("f3", "Fiction", "Grade 2"),
  B("s1", "Science", "Grade 2"), B("s2", "Science", "Grade 2"), B("m1", "Math", "Grade 2"),
  B("f4", "Fiction", "Grade 3"), B("g1", "Fiction", "Grade 1")];
var none = { isFin: function () { return false; }, isOpened: function () { return false; }, day: 0 };
var r = NB.pick(all[0], all, none);
ok(r.more && r.more.slug === "f2" && !r.harder, "more = next fiction in the grade");
ok(r.fresh && r.fresh.subject !== "Fiction" && r.fresh.grade === "Grade 2", "fresh = other subject, same grade");
// finished books are never offered
var fin = { f2: 1, f3: 1, s1: 1 };
r = NB.pick(all[0], all, { isFin: function (s) { return !!fin[s]; }, isOpened: none.isOpened, day: 0 });
ok(r.more && r.more.slug === "f4" && r.harder, "grade exhausted: a little harder");
ok(r.fresh && r.fresh.slug !== "s1", "fresh skips finished");
// the subject read least wins
var f2 = { s1: 1, s2: 1 };
r = NB.pick(all[0], all, { isFin: function (s) { return !!f2[s]; }, isOpened: none.isOpened, day: 0 });
ok(r.fresh && r.fresh.slug === "m1", "fresh = subject with fewest finished (Math)");
// unopened before opened
r = NB.pick(all[0], all, { isFin: none.isFin, isOpened: function (s) { return s === "f2"; }, day: 0 });
ok(r.more.slug === "f3", "unopened first");
// wraps around the shelf
r = NB.pick(all[2], all, none);
ok(r.more.slug === "f1", "wraps to the start of the shelf");
// nothing left
var every = {}; all.forEach(function (b) { every[b.slug] = 1; });
r = NB.pick(all[0], all, { isFin: function (s) { return s !== "f1" && !!every[s]; }, isOpened: none.isOpened, day: 0 });
ok(r.more === null && r.fresh === null, "nothing left: nulls");
// the book just read is never offered
r = NB.pick(all[3], all, none);
ok(r.more.slug !== "s1" && (!r.fresh || r.fresh.slug !== "s1"), "never the same book");
// tie rotation by day
var a = NB.pick(all[0], all, { isFin: none.isFin, isOpened: none.isOpened, day: 0 }).fresh.subject,
  b = NB.pick(all[0], all, { isFin: none.isFin, isOpened: none.isOpened, day: 1 }).fresh.subject;
ok(a !== b, "ties rotate with the day");
console.log(n + " checks, " + bad + " failed"); process.exit(bad ? 1 : 0);
