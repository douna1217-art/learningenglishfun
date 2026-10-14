#!/usr/bin/env node
// Tests for the sight-word lessons: the data (92 words, 18 lessons, sentences, audio files), the box rules,
// the choices, and the merge in site/state-sync.js.
//   node tools/sightwords_test.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const SW = require(path.join(__dirname, "..", "site", "sightwords.js"));
const S = require(path.join(__dirname, "..", "site", "state-sync.js"));
const SITE = path.join(__dirname, "..", "site");

let passed = 0, failed = 0;
function ok(cond, name, extra) {
  if (cond) passed++; else { failed++; console.log("  FAIL:", name, extra === undefined ? "" : JSON.stringify(extra)); }
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- the data file
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(SITE, "sightwords-data.js"), "utf8"), ctx);
const D = ctx.window.SW_DATA;
const all = [].concat(...D.lessons.map((l) => l.words));
ok(all.length === 92 && new Set(all).size === 92, "92 different words in the lessons", all.length);
ok(D.lessons.length === 18 && eq(D.lessons.map((l) => l.words.length), [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6]), "18 lessons of 5 (the last two have 6)");
ok(D.lessons.slice(0, 8).every((l) => l.list === "pp") && D.lessons.slice(8).every((l) => l.list === "p"), "lessons 1-8 are the pre-primer, 9-18 the primer");
ok(Object.keys(D.words).length === 92 && all.every((w) => D.words[w] && D.words[w].s), "every word has a sentence");
const allowed = new Set(all.map((w) => w.toLowerCase()).concat(D.nouns));
let bad = [];
all.forEach((w) => {
  const toks = (D.words[w].s.match(/[A-Za-z]+/g) || []).map((t) => t.toLowerCase());
  if (toks.filter((t) => t === w.toLowerCase()).length !== 1) bad.push([w, "target not exactly once"]);
  toks.forEach((t) => { if (!allowed.has(t)) bad.push([w, t]); });
  if (toks.length > 6) bad.push([w, "too long"]);
});
ok(bad.length === 0, "sentences use only stage-1 words and picture nouns, the word once", bad);
const missing = [];
all.forEach((w) => ["w-", "s-"].forEach((p) => {
  const f = path.join(SITE, "sightwords", "audio", p + SW.wkey(w) + ".mp3");
  if (!fs.existsSync(f) || fs.statSync(f).size < 1500) missing.push(p + SW.wkey(w));
}));
ok(missing.length === 0, "an audio clip for every word and sentence", missing.slice(0, 5));
ok(new Set(all.map(SW.wkey)).size === 92, "no two words share an audio file name");
ok(D.lessons.every((l) => (l.books || []).every((b) => fs.existsSync(path.join(SITE, b.file)))), "every suggested story exists");


// ---- the pictures
const ART = require(path.join(SITE, "sightwords-art.js"));
ok(all.every((w) => ART.has(w)), "a picture for every word", all.filter((w) => !ART.has(w)));
const svgs = all.map((w) => ART.scene(w));
ok(svgs.every((x) => /^<svg viewBox="0 0 240 160"/.test(x) && /<\/svg>$/.test(x)), "every picture is one svg");
ok(svgs.every((x) => x.indexOf("undefined") < 0 && x.indexOf("NaN") < 0), "no undefined or NaN inside a picture");
const bal = (x, t) => (x.match(new RegExp("<" + t + "[ >/]", "g")) || []).length;
ok(svgs.every((x) => bal(x, "g") === (x.match(/<\/g>/g) || []).length), "every group is closed");
ok(new Set(svgs.map((x) => x.length)).size > 80, "the pictures differ from each other");

// ---- boxes
const day = (d) => d;
let r = SW.applyResult(null, true, "2026-10-14");
ok(r.box === 2 && r.due === "2026-10-16" && r.n === 1 && r.ok === 1, "first try right: box 2, due in 2 days", r);
r = SW.applyResult(null, false, "2026-10-14");
ok(r.box === 1 && r.due === "2026-10-15", "first try wrong: box 1, due tomorrow", r);
r = SW.applyResult({ box: 2, n: 1, ok: 1 }, true, "2026-10-16");
ok(r.box === 3 && r.due === "2026-10-20", "right again: box 3, due in 4 days", r);
r = SW.applyResult({ box: 5, n: 9, ok: 9 }, true, "2026-10-16");
ok(r.box === 5 && r.due === "2026-10-31", "box never goes above 5");
r = SW.applyResult({ box: 4, n: 3, ok: 3 }, false, "2026-10-16");
ok(r.box === 1, "a miss sends the word back to box 1");
ok(SW.applyResult(null, true, "2026-12-30").due === "2027-01-01", "due dates roll over the year end");
ok(SW.isKnown({ box: 3 }) && !SW.isKnown({ box: 2 }) && !SW.isKnown(null), "known means box 3 or more");
const st = { words: { the: { box: 3, due: "2026-10-10" }, a: { box: 1, due: "2026-10-20" }, big: { box: 2, due: "2026-10-14" }, red: { box: 0 } }, lessons: {}, rev: {} };
ok(eq(SW.dueWords(st, "2026-10-14"), ["big", "the"]), "due words are the seen ones whose day has come", SW.dueWords(st, "2026-10-14"));
ok(SW.knownCount(st, ["The", "a", "big"]) === 1, "known count ignores case", SW.knownCount(st, ["The", "a", "big"]));
ok(SW.wkey("I") === "i" && SW.wkey("Don't") === "dont", "word keys are lower case letters");

// ---- choices and pieces
const rnd = SW.seeded(5);
const d = SW.distractors("big", ["big", "bed", "blue", "go", "up", "boy"], rnd);
ok(d.length === 2 && d.indexOf("big") < 0 && new Set(d).size === 2, "two other words, never the target", d);
ok(eq(SW.distractors("big", ["big", "bed", "blue", "go", "up", "boy"], SW.seeded(5)), d), "the same seed gives the same choices");
ok(SW.likeness("big", "bag") > SW.likeness("big", "yellow"), "a look-alike scores higher");
const ps = SW.pieces("Look at me, Sam!");
ok(ps.filter((p) => p.k).map((p) => p.k).join(" ") === "look at me sam" && ps.map((p) => p.t).join("") === "Look at me, Sam!", "a sentence splits into words and punctuation", ps);
ok(eq(SW.shuffle([1, 2, 3, 4, 5], SW.seeded(3)).slice().sort(), [1, 2, 3, 4, 5]), "shuffle keeps every item");
ok(SW.accuracy(4, 5) === 80 && SW.accuracy(0, 0) === 0, "accuracy percent");


// ---- picture quiz and memory game
const sents = {}; all.forEach((w) => { sents[w] = D.words[w].s; });
const pool1 = D.lessons[0].words;
const ch = SW.sentenceChoices("a", pool1, sents, SW.seeded(7));
ok(ch.length === 3 && ch.indexOf("a") >= 0 && new Set(ch).size === 3 && ch.every((w) => pool1.indexOf(w) >= 0), "picture quiz: the right word and two others from the words met", ch);
const poolAll = all;
let sharedBest = true;
for (let k = 0; k < 20; k++) {
  const c = SW.sentenceChoices("on", poolAll, sents, SW.seeded(k));
  const others = c.filter((w) => w !== "on");
  const best = Math.max.apply(null, poolAll.filter((w) => w !== "on").map((w) => SW.overlap(sents.on, sents[w])));
  if (!others.some((w) => SW.overlap(sents.on, sents[w]) >= Math.min(best, 2))) sharedBest = false;
}
ok(sharedBest, "picture quiz: at least one look-alike sentence among the wrong ones");
ok(eq(SW.sentenceChoices("a", pool1, sents, SW.seeded(3)), SW.sentenceChoices("a", pool1, sents, SW.seeded(3))), "picture quiz: the same seed gives the same choices");
const cards = SW.memoryCards(D.lessons[0].words, SW.seeded(2));
ok(cards.length === 10 && cards.filter((c) => c.kind === "pic").length === 5 && cards.filter((c) => c.kind === "txt").length === 5, "memory: a picture card and a sentence card for each of 5 words");
const byId = {}; cards.forEach((c) => { byId[c.id] = (byId[c.id] || 0) + 1; });
ok(Object.keys(byId).length === 5 && Object.keys(byId).every((k) => byId[k] === 2), "memory: every word is on exactly two cards", byId);
const pic = cards.filter((c) => c.kind === "pic")[0], txt = cards.filter((c) => c.id === pic.id && c.kind === "txt")[0], other = cards.filter((c) => c.id !== pic.id && c.kind === "txt")[0];
ok(SW.isPair(pic, txt) && !SW.isPair(pic, other) && !SW.isPair(pic, pic) && !SW.isPair(null, pic), "memory: only a picture and its own sentence make a pair");


// ---- never offer a sentence that would also fit the picture
const conf = SW.makeConfusable(sents, (w) => ART.kinds(w), D.nouns);
ok(ART.kinds("come").indexOf("kid") >= 0 && ART.kinds("said").indexOf("frog") >= 0 && ART.kinds("in").indexOf("fish") >= 0, "a picture lists what it shows, also inside boxes and bubbles", [ART.kinds("come"), ART.kinds("in")]);
ok(conf("come", "my") && conf("the", "my") && conf("he", "I") && conf("a", "and"), "same dog or cat in both pictures, or only the pronoun differs: confusable");
ok(!conf("jump", "red") && !conf("run", "blue"), "different pictures: not confusable", [conf("jump", "red"), conf("run", "blue")]);
let badChoice = [], fewChoice = [];
all.forEach((w) => {
  for (let k = 0; k < 12; k++) {
    const c = SW.sentenceChoices(w, all, sents, SW.seeded(k * 31 + 1), conf);
    if (c.length !== 3) fewChoice.push(w);
    c.filter((x) => x !== w).forEach((x) => { if (conf(w, x)) badChoice.push([w, x]); });
  }
});
ok(badChoice.length === 0, "picture quiz: no wrong sentence fits the picture", badChoice.slice(0, 5));
ok(fewChoice.length === 0, "picture quiz: always three choices", fewChoice.slice(0, 5));
let shortLessons = [];
D.lessons.forEach((l) => {
  const sub = SW.compatibleSubset(l.words, conf, 6, 4);
  if (sub.length < 4) shortLessons.push(l.id);
  for (let i = 0; i < sub.length; i++) for (let j = i + 1; j < sub.length; j++) if (conf(sub[i], sub[j]) && sub.length > 4) shortLessons.push([l.id, sub[i], sub[j]]);
});
ok(shortLessons.length === 0, "memory: each lesson gives 4 to 6 pairs that cannot be mixed up", shortLessons);
console.log("   memory pairs per lesson:", D.lessons.map((l) => SW.compatibleSubset(l.words, conf, 6, 4).length).join(" "));


// ---- balloon pop and feeding: the words and the choices
const due = ["the", "big"].map((w) => w), others = ["a", "I", "you", "see", "look", "can", "go", "up"];
const pw = SW.pickWords(["the", "big"], others, 6, SW.seeded(4));
ok(pw.length === 6 && new Set(pw.map(SW.wkey)).size === 6 && pw.indexOf("the") >= 0 && pw.indexOf("big") >= 0, "game words: the due ones first, no repeats", pw);
ok(SW.pickWords([], ["a", "A", "an"], 5, SW.seeded(1)).length === 2, "game words: a word is never used twice (case ignored)");
const rds = SW.roundsFor(["see", "look", "can", "go"], all, SW.seeded(9), 3);
ok(rds.length === 4 && rds.every((r) => r.opts.length === 4 && r.opts.indexOf(r.w) >= 0 && new Set(r.opts.map(SW.wkey)).size === 4), "balloon rounds: the word and three others, all different", rds);
const rds2 = SW.roundsFor(["see", "look", "can"], all, SW.seeded(9), 2);
ok(rds2.every((r) => r.opts.length === 3 && r.opts.indexOf(r.w) >= 0), "feeding rounds: the word and two others");
ok(eq(SW.roundsFor(["see"], all, SW.seeded(5), 3), SW.roundsFor(["see"], all, SW.seeded(5), 3)), "rounds: the same seed gives the same choices");

// the choices only use words the child has learned (plus the game's own words); few learned words fall back to the first lessons
const fb = ["I", "a", "the", "and", "you", "see", "look"];
const gp = SW.gamePool(["a", "the", "see", "look", "can"], ["go", "the"], fb, 4);
ok(eq(gp, ["a", "the", "see", "look", "can", "go"]), "game pool: learned words plus the game's words, no repeats", gp);
const gp2 = SW.gamePool(["a"], ["go", "up"], fb, 4);
ok(gp2.length >= 4 && gp2.indexOf("go") >= 0 && gp2.indexOf("up") >= 0 && gp2.indexOf("a") >= 0 && gp2.every((w) => ["go", "up"].concat(fb).indexOf(w) >= 0), "game pool: too few learned words, the first lessons fill in", gp2);
ok(new Set(gp2.map(SW.wkey)).size === gp2.length, "game pool: the fallback never repeats a word");
const unlearned = all.filter((w) => ["see", "look", "can", "go", "a", "the", "I", "and"].indexOf(w) < 0);
const gp3 = SW.gamePool(["a", "the", "I", "and", "you", "see"], ["look", "can", "go"], fb, 4);
let leak = 0;
for (let sd = 1; sd <= 40; sd++) {
  SW.roundsFor(["look", "can", "go"], gp3, SW.seeded(sd), 3).forEach((r) => r.opts.forEach((w) => { if (gp3.indexOf(w) < 0) leak++; }));
}
ok(leak === 0 && unlearned.length > 0, "game pool: the wrong choices never come from words that were not learned or not in the game", leak);

// ---- stages, units, today's plan and the word wall
ok(eq(D.units.map((u) => u.lessons.length), [4, 4, 4, 4, 2]) && D.units.every((u) => u.stage === 1), "units: five units of four lessons (the last has two)");
ok(eq([].concat(...D.units.map((u) => u.lessons)), D.lessons.map((l) => l.id)), "units: every lesson is in exactly one unit, in order");
ok(D.stages.length === 4 && D.stages[0].ready && D.stages[0].words === all.length && D.stages.slice(1).every((x) => !x.ready), "stages: stage 1 is ready and its size matches; the rest are coming soon", D.stages);
const empty = SW.cleanState(null), today = "2026-10-14";
const up0 = SW.unitProgress(D.units[0], D.lessons, empty);
ok(up0.done === 0 && up0.total === 4 && up0.words.length === 20 && !up0.complete && up0.known === 0, "unit progress: a new unit has nothing done", up0);
const st1 = SW.cleanState({ words: { i: { box: 3 }, a: { box: 2 } }, lessons: { 1: { t: 1 }, 2: { t: 2 }, 3: { t: 3 }, 4: { t: 4 }, 5: { t: 5 } } });
const up1 = SW.unitProgress(D.units[0], D.lessons, st1), up2 = SW.unitProgress(D.units[1], D.lessons, st1);
ok(up1.complete && up1.done === 4 && up1.known === 1 && !up2.complete && up2.done === 1, "unit progress: counts done lessons and known words", [up1, up2]);
ok(SW.currentUnit(D.units, D.lessons, empty).id === 1 && SW.currentUnit(D.units, D.lessons, st1).id === 2, "current unit: the first one that is not finished");
const allDone = SW.cleanState({ lessons: Object.fromEntries(D.lessons.map((l) => [l.id, { t: 1 }])) });
ok(SW.currentUnit(D.units, D.lessons, allDone).id === 5, "current unit: the last one when everything is finished");
ok(SW.unitOf(D.units, 7).id === 2 && SW.unitOf(D.units, 18).id === 5 && SW.unitOf(D.units, 99) === null, "unit of a lesson");
ok(SW.nextLesson(D.lessons, empty) === 1 && SW.nextLesson(D.lessons, st1) === 6 && SW.nextLesson(D.lessons, allDone) === 0, "next lesson: the first one not done, 0 when all are done");
let pl = SW.todayPlan(empty, D.lessons, today);
ok(pl.kind === "lesson" && pl.lesson === 1 && pl.due === 0, "today: a new child starts lesson 1", pl);
const dueSt = SW.cleanState({ words: { i: { box: 2, due: "2026-10-13" }, a: { box: 2, due: "2026-10-14" }, the: { box: 2, due: "2026-10-20" } }, lessons: { 1: { t: 1 } } });
pl = SW.todayPlan(dueSt, D.lessons, today);
ok(pl.kind === "review" && pl.due === 2 && pl.review === 2 && pl.lesson === 2, "today: words that are due come first, the next lesson after", pl);
const manyDue = SW.cleanState({ words: Object.fromEntries(all.slice(0, 14).map((w) => [SW.wkey(w), { box: 1, due: "2026-10-01" }])) });
ok(SW.todayPlan(manyDue, D.lessons, today).review === 10, "today: a review is at most 10 words");
pl = SW.todayPlan(allDone, D.lessons, today);
ok(pl.kind === "done" && pl.lesson === 0, "today: when every lesson is done and nothing is due, play a game", pl);
ok(eq(SW.wordStatus(undefined, today), { s: "new", due: false }) && eq(SW.wordStatus({ box: 1, due: "2026-10-15" }, today), { s: "learning", due: false }) &&
  eq(SW.wordStatus({ box: 3, due: "2026-10-14" }, today), { s: "known", due: true }) && SW.wordStatus({ box: 2, due: "2026-10-13" }, today).due, "word status: new, learning, known and due");

ok(SW.lessonStars(null) === 0 && SW.lessonStars({ acc: 100 }) === 3 && SW.lessonStars({ acc: 90 }) === 3 && SW.lessonStars({ acc: 80 }) === 2 && SW.lessonStars({ acc: 70 }) === 2 && SW.lessonStars({ acc: 40 }) === 1 && SW.lessonStars({}) === 1, "lesson stars: 3 from 90%, 2 from 70%, 1 for any finished lesson, 0 when not done");

const tp = SW.trailPath(5, 132, 380);
ok(tp.indexOf("M99 70") === 0 && (tp.match(/C/g) || []).length === 4, "trail path: starts at the first node and has one curve between each pair", tp);
ok(/ 281 202$/.test(SW.trailPath(2, 132, 380)) && /^M99 70 C99 136 281 136 281 202$/.test(SW.trailPath(2, 132, 380)), "trail path: the second node is on the right, one row down");

// ---- the island scenery: every island has a banner, five different worlds and a chest of its own
const SC = require("../site/sightwords-scenery.js");
const names = new Set();
let sceneryOk = true;
for (let st = 1; st <= 4; st++) {
  const parts = [SC.banner(st), SC.chest({ open: true, s: st }), SC.chest({ open: false, s: st })];
  for (let i = 0; i < 5; i++) {
    parts.push(SC.unitArt({ s: st, i }));
    const th = SC.unitTheme({ s: st, i });
    names.add(st + ":" + th.name);
    if (!th.name || !/^#[0-9A-F]{6}$/i.test(th.bg) || !/^#[0-9A-F]{6}$/i.test(th.dash)) sceneryOk = false;
  }
  parts.forEach((x) => {
    if (!/^<svg [^>]*viewBox="[^"]+"/.test(x) || !/<\/svg>$/.test(x) || (x.match(/<svg/g) || []).length !== 1 || /undefined|NaN/.test(x)) sceneryOk = false;
  });
}
ok(sceneryOk && names.size === 20, "island scenery: 4 islands x (banner, chests, 5 worlds), each world named, no broken drawings", [...names].length);
ok(SC.unitTheme({ s: 2, i: 7 }).name === SC.unitTheme({ s: 2, i: 2 }).name && SC.unitTheme({ s: 9, i: 0 }).name === SC.unitTheme({ s: 1, i: 0 }).name, "island scenery: more units than worlds repeat the worlds; an unknown island uses the first");
ok(/sw-isl-go/.test(SC.islands({ known: 1, total: 92, ready: { 1: true } })) && (SC.islands({ known: 1, total: 92, ready: { 1: true, 2: true } }).match(/sw-isl-go/g) || []).length === 2, "islands: every ready island is a click target, the others are locked");

// ---- feeding: the face is a function of the bites so far, and only gets better
const feels = [0, 1, 2, 3, 4, 5, 6].map((n) => SW.feelFor(n, 6));
ok(eq(feels, ["hungry", "okay", "happy", "happy", "love", "love", "excited"]), "feeding: hungry, a little better, happy, in love, then excited when full (6 bites)", feels);
const rank = { hungry: 0, okay: 1, happy: 2, love: 3, excited: 4 };
let neverWorse = true;
[3, 4, 5, 6, 8].forEach((total) => {
  let prev = -1;
  for (let n = 0; n <= total; n++) {
    const r = rank[SW.feelFor(n, total)];
    if (r < prev) neverWorse = false;
    prev = r;
  }
});
ok(neverWorse && SW.feelFor(0, 3) === "hungry" && SW.feelFor(3, 3) === "excited" && SW.feelFor(undefined, 6) === "hungry", "feeding: with any number of rounds the face never gets worse as bites are added");

// ---- merges (sightwords.js and state-sync.js must agree)
[["sightwords.js", SW], ["state-sync.js", S]].forEach(([name, M]) => {
  let m = M.mergeWords(
    { words: { the: { box: 3, n: 4, ok: 3, due: "2026-10-20" }, a: { box: 1, n: 1, ok: 0 } }, lessons: { 1: { t: 500, acc: 80 } }, rev: { "2026-10-14": 9 } },
    { words: { the: { box: 2, n: 5, ok: 4 }, big: { box: 4, n: 2, ok: 2 }, a: { box: 2, n: 1, ok: 1 } }, lessons: { 1: { t: 300, acc: 100 }, 2: { t: 800, acc: 60 } }, rev: { "2026-10-14": 12, "2026-10-15": 3 } });
  ok(m.words.the.box === 3 && m.words.big.box === 4 && m.words.a.box === 2, name + ": the higher box of each word wins", m.words);
  ok(eq(Object.keys(m.lessons).sort(), ["1", "2"]) && m.lessons[1].t === 300, name + ": lessons from both, the earlier time", m.lessons);
  ok(m.rev["2026-10-14"] === 12 && m.rev["2026-10-15"] === 3, name + ": the later review time wins", m.rev);
  m = M.mergeWords(null, { words: { to: { box: 2 } } });
  ok(m.words.to.box === 2 && eq(m.lessons, {}), name + ": merges with a missing side", m);
});
ok(S.isSyncKey("lef_words_v1"), "the words key is synced");
ok(eq(S.mergeValue("lef_words_v1", { words: { a: { box: 1 } } }, { words: { a: { box: 3 } } }).words.a.box, 3), "mergeValue routes the words key");

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
