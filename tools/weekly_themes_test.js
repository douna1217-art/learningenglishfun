// node tools/weekly_themes_test.js : weekly theme collections (week index, picking, progress, data file)
const fs = require("fs"), path = require("path"), vm = require("vm");
const WT = require("../site/weekly-themes.js");
const win = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../site/weekly-themes-data.js"), "utf8"), { window: win });
const THEMES = win.LEF_THEMES;
let pass = 0, fail = 0;
const ok = (c, m) => (c ? pass++ : (fail++, console.log("FAIL", m)));
// weeks start on Monday: 1970-01-05 (day 4) was a Monday
ok(WT.weekIndex(4) === 1 && WT.weekIndex(3) === 0 && WT.weekIndex(10) === 1 && WT.weekIndex(11) === 2, "weeks start on Monday");
ok(WT.daysLeft(4) === 6 && WT.daysLeft(10) === 0, "days left: 6 on Monday, 0 on Sunday");
ok(WT.themeFor(THEMES, 0).id === THEMES[0].id && WT.themeFor(THEMES, THEMES.length).id === THEMES[0].id && WT.themeFor(THEMES, -1).id === THEMES[THEMES.length - 1].id, "rotation wraps");
ok(WT.themeFor([], 3) === null, "no themes");
ok(THEMES.length === 9 && THEMES.every((t) => t.id && t.en && t.cn && t.ic && t.c1 && t.c2 && (t.subject || t.books)), "theme data shape");
// a fake catalog from the real theme data
const subjects = { "Computer Science": 40, SEL: 40, Math: 40, "Social Studies": 40 };
const all = [];
THEMES.forEach((t) => {
  if (t.books) Object.keys(t.books).forEach((g) => t.books[g].forEach((s) => all.push({ slug: s, grade: g === "K" ? "Kindergarten" : "Grade " + g, subject: "Fiction", title: s })));
});
Object.keys(subjects).forEach((sj) => {
  for (let i = 0; i < subjects[sj]; i++) all.push({ slug: sj + i, grade: i % 7 === 0 ? "Kindergarten" : "Grade " + (i % 7), subject: sj, title: sj + i });
});
const seenSlug = new Set();
for (let i = all.length - 1; i >= 0; i--) { if (seenSlug.has(all[i].slug)) all.splice(i, 1); else seenSlug.add(all[i].slug); } // a book can sit in two themes
const uniq = seenSlug;
ok(uniq.size > 100, "catalog built");
const noFin = () => false;
// every theme gives 5 distinct books for every grade
THEMES.forEach((t) => {
  for (let r = 0; r <= 6; r++) {
    const s = WT.pick(all, t, r, 7, noFin);
    ok(s.length === 5 && new Set(s).size === 5, t.id + " grade " + r + " gives 5 distinct, got " + s.length);
  }
});
// same inputs, same books (every device picks the same)
const t0 = THEMES[0];
ok(JSON.stringify(WT.pick(all, t0, 2, 5, noFin)) === JSON.stringify(WT.pick(all, t0, 2, 5, noFin)), "deterministic");
ok(JSON.stringify(WT.pick(all, THEMES[5], 2, 5, noFin)) !== JSON.stringify(WT.pick(all, THEMES[5], 2, 6, noFin)), "a different week picks different books");
// books stay near the child's level
const near = WT.pick(all, THEMES[5], 3, 5, noFin).map((s) => WT.gradeRank(all.find((b) => b.slug === s).grade));
ok(near.every((g) => Math.abs(g - 3) <= 1), "within one grade of the child: " + near);
// unread books come first
const seen = new Set(WT.pick(all, THEMES[6], 3, 9, noFin).slice(0, 2));
const again = WT.pick(all, THEMES[6], 3, 9, (s) => seen.has(s));
ok(again.every((s, i) => i >= 3 || !seen.has(s)) && !again.slice(0, 3).some((s) => seen.has(s)), "finished books are put behind unread ones");
// widening: a sparse theme at a far grade still gives 5
const sparse = WT.pick(all, THEMES[3], 6, 3, noFin);
ok(sparse.length === 5, "sparse theme widens: " + sparse.length);
// no slug from the theme list is missing from the real catalog files
const real = new Set();
for (const d of fs.readdirSync(path.join(__dirname, "../site/books"))) {
  const f = path.join(__dirname, "../site/books", d, "books.js");
  if (fs.existsSync(f)) (fs.readFileSync(f, "utf8").match(/"slug":"([^"]+)"/g) || []).forEach((m) => real.add(m.slice(8, -1)));
}
THEMES.forEach((t) => t.books && Object.keys(t.books).forEach((g) => t.books[g].forEach((s) => ok(real.has(s), "unknown slug in theme " + t.id + ": " + s))));
ok(WT.progress(["a", "b", "c"], (s) => s !== "b") === 2 && WT.progress(null, noFin) === 0, "progress");
console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
