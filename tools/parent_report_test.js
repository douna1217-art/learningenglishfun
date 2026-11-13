// node tools/parent_report_test.js : the numbers on the parent report
const PR = require("../site/parent-report.js");
let pass = 0, fail = 0;
const ok = (c, m) => (c ? pass++ : (fail++, console.log("FAIL", m)));
const today = 20000, D = 86400000;
const s = PR.summarize({
  stats: { days: [19999, 20000, 19998, 19990, 19800], total: 120 },
  books: { a: { fin: 1 }, b: { fin: 0 }, c: { fin: 2 } },
  hist: [
    { slug: "x", subject: "science", quiz: true, t: (today - 1) * D },
    { slug: "y", subject: "science", quiz: false, t: (today - 2) * D },
    { slug: "z", subject: "fiction", quiz: true, t: (today - 30) * D },
    { slug: "w", subject: "math-stories", quiz: null, t: today * D },
  ],
}, today, (sl) => ({ x: "Book X" }[sl] || ""));
ok(s.weekDays === 3, "3 days this week, got " + s.weekDays);
ok(JSON.stringify(s.week) === JSON.stringify([false, false, false, false, true, true, true]), "week flags " + s.week);
ok(s.streak === 3, "streak 3");
ok(s.stars === 120, "stars");
ok(s.booksFinished === 2, "finished");
ok(s.booksWeek === 3, "books this week " + s.booksWeek);
ok(s.quizN === 3 && s.quizOk === 2 && s.quizPct === 67, "quiz " + s.quizPct);
ok(s.subjects[0].s === "science" && s.subjects[0].n === 2, "top subject");
ok(s.recent[0].slug === "w" && s.recent[3].title === "Book X", "recent order/titles " + JSON.stringify(s.recent));
ok(s.lastDaysAgo === 0, "last learned today");
// streak survives an unfinished today
ok(PR.streakOf([19998, 19999], 20000) === 2, "streak alive without today");
ok(PR.streakOf([19990], 20000) === 0, "streak broken");
// empty / garbage input never throws
["", null, undefined, {}, { stats: 5, books: [], hist: "x" }].forEach((d) => {
  const e = PR.summarize(d, today);
  ok(e.empty === true && e.weekDays === 0 && e.quizPct === null, "empty " + JSON.stringify(d));
  ok(typeof PR.html(e) === "string" && /No reading yet/.test(PR.html(e)), "empty html");
  ok(/not started/.test(PR.text("Mia", e)), "empty text");
});
ok(/Mia this week/.test(PR.text("Mia", s)) && /3 of 7/.test(PR.text("Mia", s)) && /67%/.test(PR.text("Mia", s)), "text " + PR.text("Mia", s));
ok(!/<script/i.test(PR.html(PR.summarize({ hist: [{ slug: "<script>", subject: "<b>", t: today * D }] }, today))), "escaped");
console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
