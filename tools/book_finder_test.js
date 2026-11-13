// node tools/book_finder_test.js : filtering and search on the book finder
const BF = require("../site/book-finder.js");
let pass = 0, fail = 0;
const ok = (c, m) => (c ? pass++ : (fail++, console.log("FAIL", m)));
const mk = (slug, title, grade, band, minutes, subject, subtitle) => ({ slug, title, subtitle: subtitle || "", grade, band, minutes, subject });
const all = [
  mk("a", "The Moon Bed", "Kindergarten", "Early Reader", "6 min", "Fiction", "A sleepy story"),
  mk("b", "Counting to Ten", "Kindergarten", "Early Reader", "6 min", "Math"),
  mk("c", "Why the Moon Glows", "Grade 2", "Growing Reader", "9 min", "Science", "Moon and light"),
  mk("d", "Big Ideas", "Grade 5", "Fluent Reader", "12 min", "Social Studies", "About the moon landing"),
  mk("e", "Feelings Day", "Grade 2", "Growing Reader", "7 min", "SEL"),
  mk("f", "Robots at Work", "Grade 5", "Fluent Reader", "11 min", "Computer Science & AI"),
];
const slugs = (f, c) => BF.filterBooks(all, f, c).map((b) => b.slug).join("");
ok(slugs({}) === "abcefdf".slice(0, 4) + "df" , "grade order then original order: " + slugs({}));
ok(slugs({ subject: "Science" }) === "c", "subject");
ok(slugs({ grade: "Grade 2" }) === "ce", "grade");
ok(slugs({ band: "Fluent Reader" }) === "df", "band");
ok(slugs({ time: "short" }) === "abe", "short = up to 7 min, got " + slugs({ time: "short" }));
ok(slugs({ time: "medium" }) === "c", "medium 8-10");
ok(slugs({ time: "long" }) === "df", "long 11+");
ok(slugs({ q: "moon" }) === "acd", "search finds title and subtitle: " + slugs({ q: "moon" }));
ok(slugs({ q: "moon" }).indexOf("d") === 2, "subtitle matches rank after title matches");
ok(slugs({ q: "MOON  bed" }) === "a", "all words must match, case and spaces ignored");
ok(slugs({ q: "robots" }) === "f", "search");
ok(slugs({ q: "computer" }) === "f", "subject name is searchable");
ok(slugs({ q: "zzz" }) === "", "no match");
ok(slugs({ q: "moon", grade: "Grade 2" }) === "c", "search + filter");
ok(slugs({ fresh: true }, { seen: { a: 1, c: 1 } }) === "bedf", "not read yet");
ok(slugs({ fresh: true }, { seen: { a: 1, c: 1 } }).indexOf("a") < 0 && slugs({ fresh: true }, { seen: { a: 1, c: 1 } }).indexOf("c") < 0, "seen books hidden");
ok(slugs({ mine: true }, { myGrade: "Grade 5" }) === "df", "right for me = placement grade");
ok(slugs({ mine: true }, {}) === slugs({}), "right for me ignored without a placement result");
ok(BF.filterBooks([], { q: "x" }).length === 0 && BF.filterBooks(all, null, null).length === 6, "empty / null input");
ok(BF.minutesOf({ minutes: "12 min" }) === 12 && BF.minutesOf({}) === 0, "minutes");
console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
