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


// ---- Bubble spell and Monster battle (older children)
ok(SW.spellForm("Don\u2019t") === "don't" && SW.spellForm("The") === "the", "spelling: a curly apostrophe becomes a straight one, upper case becomes lower");
ok(eq(SW.spellable(["I", "a", "the", "go", "Don't"]), ["the", "go", "Don't"]), "spelling: words of one letter are left out");
let bubOk = true, bubDecoys = [];
["the", "three", "because", "always", "go", "Don\u2019t", "is"].forEach((w) => {
  for (let k = 0; k < 40; k++) {
    const set = SW.bubbleSet(w, SW.seeded(k + 7)), own = SW.spellForm(w).replace(/[^a-z]/g, "").split("");
    // every letter of the word is there (as many times as in the word) plus a few that are not in the word
    const rest = set.slice();
    own.forEach((c) => { const j = rest.indexOf(c); if (j < 0) bubOk = false; else rest.splice(j, 1); });
    if (rest.some((c) => own.indexOf(c) >= 0) || rest.length < 2 || rest.length > 4) bubOk = false;
    bubDecoys.push(rest.length);
  }
});
ok(bubOk, "bubbles: all the letters of the word and 2 to 4 more that are not in it", bubDecoys.slice(0, 5));
ok(eq(SW.bubbleSet("three", SW.seeded(3)), SW.bubbleSet("three", SW.seeded(3))) && SW.bubbleSet("three", SW.seeded(3)).length === 8 && SW.bubbleSet("because", SW.seeded(1)).length === 11, "bubbles: the same seed gives the same bubbles; 5 letters make 8 bubbles, 7 letters make 11");
ok(SW.battleDmg(1) === 1 && SW.battleDmg(2) === 1 && SW.battleDmg(3) === 2 && SW.battleDmg(4) === 2 && SW.battleDmg(5) === 3 && SW.battleDmg(40) === 3, "battle: a hit is 1 (one cannonball), 3 in a row 2 (a stream of cannonballs), 5 in a row 3 (the mega laser)");
ok(SW.monKey(3) === "mon3" && SW.monUnlocked({}, 1) && !SW.monUnlocked({}, 2) && SW.monUnlocked({ mon1: 5 }, 2) && !SW.monUnlocked({ mon1: 5 }, 3) && !SW.monUnlocked(null, 4), "battle: the first monster is open, each next one opens when the one before is beaten");
let repeats = 0, badPick = 0;
for (let k = 0; k < 200; k++) {
  const rnd = SW.seeded(k + 1), recent = [], pool = ["the", "and", "go", "see", "look", "big", "red", "blue", "run", "jump"];
  for (let n = 0; n < 30; n++) {
    const w = SW.battlePick(pool, recent, rnd, n % 3 === 0 ? ["go", "see"] : []);
    if (pool.indexOf(w) < 0) badPick++;
    if (recent.indexOf(SW.wkey(w)) >= 0) repeats++;
    recent.push(SW.wkey(w)); if (recent.length > 4) recent.shift();
  }
}
ok(repeats === 0 && badPick === 0, "battle: the next word is never one of the last four, always from the pool", [repeats, badPick]);
ok(SW.battlePick(["a"], ["a"], SW.seeded(3), []) === "a", "battle: with a tiny pool a word may come back instead of failing");
const MON = require(path.join(SITE, "sightwords-monsters.js"));
ok(MON.LIST.length === 5 && eq(MON.LIST.map((m) => m.id), [1, 2, 3, 4, 5]) && MON.LIST.every((m, i) => i === 0 || (m.hp > MON.LIST[i - 1].hp && m.charge <= MON.LIST[i - 1].charge)), "monsters: five, each with more hit points and a faster attack than the one before");
ok(MON.LIST.every((m) => ["idle", "hurt", "cheer"].every((md) => { const x = MON.art(m.id, md); return /^<svg viewBox="0 0 120 120"/.test(x) && /<\/svg>$/.test(x) && !/NaN|undefined/.test(x) && bal(x, "g") === (x.match(/<\/g>/g) || []).length; })), "monsters: every monster draws in all three moods");
const PZm = require(path.join(SITE, "sightwords-prizes.js"));
ok(MON.LIST.every((m) => PZm.forMonster(m.id) && PZm.forMonster(m.id).monster === m.id) && PZm.wonIn({ mon2: 1 }, PZm.forMonster(2).id) && !PZm.wonIn({ mon1: 1 }, PZm.forMonster(2).id) && !PZm.wonIn({ "chest1-2": 1 }, PZm.forMonster(2).id), "monsters: each drops one prize, won when that monster has been beaten (not by a chest)");

// ---- words that sound the same are never offered together when the child has to listen
ok(SW.sameSound("two", "to") && SW.sameSound("Too", "two") && SW.sameSound("their", "there") && SW.sameSound("were", "where") && SW.sameSound("know", "no") && !SW.sameSound("to", "go") && !SW.sameSound("an", "and"), "same sound: homophones are recognised, look-alikes are not");
const M0 = SW.mergeData(D, (() => { const c = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(SITE, "sightwords-data2.js"), "utf8"), c); return c.window.SW_DATA2; })());
const poolBoth = [].concat(...M0.lessons.map((l) => l.words));
const homGroups = [["to", "too", "two"], ["for", "four"], ["no", "know"], ["by", "buy"], ["there", "their"], ["write", "right"], ["were", "where"]];
let clash = [];
homGroups.forEach((g) => g.forEach((w) => {
  for (let k = 0; k < 60; k++) {
    SW.distractors(w, poolBoth, SW.seeded(k * 17 + 3), g, 3).forEach((x) => { if (SW.sameSound(w, x)) clash.push([w, x]); });
    SW.roundsFor([w], poolBoth, SW.seeded(k + 1), 3).forEach((r) => r.opts.filter((x) => x !== w).forEach((x) => { if (SW.sameSound(w, x)) clash.push([w, x, "round"]); }));
  }
}));
ok(clash.length === 0, "same sound: no listening choice has a word that sounds like the right one", clash.slice(0, 5));
ok(homGroups.every((g) => g.every((w) => poolBoth.indexOf(w) >= 0 || ["to", "too", "two"].indexOf(w) >= 0)) && homGroups.every((g) => g.filter((w) => poolBoth.indexOf(w) >= 0).length >= 2), "same sound: every group lists words that are really in the lessons", homGroups.map((g) => g.filter((w) => poolBoth.indexOf(w) < 0)));

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

// ---- the treasure chests: opened once, 5 stars, one prize per unit
const PZ = require("../site/sightwords-prizes.js");
const st0 = SW.cleanState(null);
ok(SW.claimChest(st0, 1, 2, 1000) === true && st0.rev["chest1-2"] === 1000 && SW.claimChest(st0, 1, 2, 2000) === false && st0.rev["chest1-2"] === 1000, "chest: the first opening counts, a second one does not and keeps the first time");
ok(SW.chestKey(1, 3) === "chest1-3", "chest: the key is made of the island and the unit");
ok(PZ.STARS === 5 && PZ.ids().length === 15 && new Set(PZ.ids()).size === 15, "prizes: fifteen different items (five per island chest set, five monster drops), 5 stars per chest");
ok(D.units.every((u) => PZ.forUnit(1, u.id) && PZ.forUnit(1, u.id).unit === u.id) && PZ.forUnit(2, 1) === null && PZ.forUnit(1, 6) === null, "prizes: every unit of island 1 has one; units of one island are not mixed up with the other");
ok(PZ.ids().every((id) => /^(ch|mn)-/.test(id) && ["hat", "face", "neck"].indexOf(PZ.get(id).slot) >= 0 && PZ.isPrize(id) && !PZ.isPrize("x" + id)), "prizes: ids and slots");
ok(!PZ.wonIn({}, "ch-flower") && PZ.wonIn({ "chest1-1": 5 }, "ch-flower") && !PZ.wonIn({ "chest1-1": 5 }, "ch-pine") && !PZ.wonIn({ "chest1-1": 5 }, "nope"), "prizes: won when the unit's chest has been opened");
const fakeG = (a, inner) => '<g transform="translate(' + a.hx + "," + a.hy + ") scale(" + a.hs + ')">' + inner + "</g>";
let artOk = true;
PZ.ids().forEach((id) => {
  const it = PZ.get(id), svg = it.draw(it.a, fakeG);
  if (!svg || /NaN|undefined/.test(svg) || (svg.match(/</g) || []).length !== (svg.match(/>/g) || []).length) artOk = false;
  [{ hx: 60, hy: 30, hs: 1.1, ey: 52, edx: 24, er: 11, ny: 100 }, { hx: 60, hy: 54, hs: 0.9, ey: 40, edx: 18, er: 8, ny: 106 }].forEach((a) => {
    const v = it.draw(a, fakeG);
    if (/NaN|undefined/.test(v)) artOk = false;
  });
});
ok(artOk, "prizes: every item draws with its own anchors and with other pets' anchors");

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


// ---- stage 2 (Dolch grade 1 + 2): its own data file, merged after stage 1
const c2 = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(SITE, "sightwords-data2.js"), "utf8"), c2);
const D2 = c2.window.SW_DATA2;
const w2 = [].concat(...D2.lessons.map((l) => l.words));
ok(w2.length === 87 && new Set(w2).size === 87 && w2.every((w) => all.indexOf(w) < 0), "stage 2: 87 different words, none of them in stage 1", w2.length);
ok(Object.keys(D2.words).length === 87 && w2.every((w) => D2.words[w] && D2.words[w].s), "stage 2: every word has a sentence");
ok(w2.filter((w) => D2.words[w].list === "g1").length === 41 && w2.filter((w) => D2.words[w].list === "g2").length === 46, "stage 2: 41 grade-1 words and 46 grade-2 words");
ok(eq(D2.lessons.map((l) => l.id), Array.from({ length: 20 }, (_, i) => 19 + i)) && D2.lessons.every((l) => l.stage === 2), "stage 2: lessons 19 to 38");
ok(eq(D2.lessons.map((l) => l.words.length), [4, 4, 5, 4, 5, 4, 4, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 5, 4, 5]), "stage 2: lessons of 4 or 5 words");
ok(eq(D2.units.map((u) => u.id), [6, 7, 8, 9, 10]) && D2.units.every((u) => u.stage === 2 && u.lessons.length === 4) && eq([].concat(...D2.units.map((u) => u.lessons)), D2.lessons.map((l) => l.id)), "stage 2: units 6 to 10, four lessons each, every lesson once, in order");
const M = SW.mergeData(D, D2);
ok(M.lessons.length === 38 && M.units.length === 10 && Object.keys(M.words).length === 179 && M.stages.length === 4, "merge: 38 lessons, 10 units, 179 words");
ok(M.stages[0].ready && M.stages[1].ready && !M.stages[2].ready && !M.stages[3].ready && !D.stages[1].ready, "merge: stage 2 becomes ready; stage 1's own data is not changed");
ok(M.lessons.every((l, i) => l.id === i + 1), "merge: lesson ids count on, so D.lessons[id - 1] is the lesson");
ok(SW.mergeData(D, null) === D, "merge: without stage 2 the data stays as it is");
ok(SW.unitOf(M.units, 19).id === 6 && SW.unitOf(M.units, 38).id === 10 && SW.unitOf(M.units, 18).id === 5, "stage 2: the unit of a lesson");
const s1done = SW.cleanState({ lessons: Object.fromEntries(D.lessons.map((l) => [l.id, { t: 1, acc: 80 }])) });
ok(SW.nextLesson(M.lessons, s1done) === 19 && SW.nextLesson(M.lessons.filter((l) => l.stage === 2), SW.cleanState(null)) === 19, "stage 2: next lesson after stage 1 is lesson 19; a new child on the stage 2 map starts at 19");
ok(SW.currentUnit(M.units.filter((u) => u.stage === 2), M.lessons, s1done).id === 6, "stage 2: its map opens unit 6 first");
const allowed2 = new Set(w2.concat(all).map((w) => w.toLowerCase().replace(/’/g, "'")).concat(D.nouns, D2.nouns));
let bad2 = [];
w2.forEach((w) => {
  const toks = (D2.words[w].s.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g) || []).map((t) => t.toLowerCase().replace(/’/g, "'"));
  if (toks.filter((t) => t === w.toLowerCase()).length !== 1) bad2.push([w, "target not exactly once"]);
  toks.forEach((t) => { if (!allowed2.has(t)) bad2.push([w, t]); });
  if (toks.length > 7) bad2.push([w, "too long"]);
});
ok(bad2.length === 0, "stage 2: sentences use only words of the two stages and picture nouns, the word once", bad2);
ok(SW.wkey("don't") === "dont" && SW.wkey("Don’t") === "dont", "a word with an apostrophe has a key without it");
const dps = SW.pieces("Don’t jump on the bed.");
ok(dps.map((p) => p.t).join("") === "Don’t jump on the bed." && dps[0].k === "dont" && dps.filter((p) => p.k).length === 5, "a word with an apostrophe stays one piece", dps);
const miss2 = [];
w2.forEach((w) => ["w-", "s-"].forEach((p) => {
  const f = path.join(SITE, "sightwords", "audio", p + SW.wkey(w) + ".mp3");
  if (!fs.existsSync(f) || fs.statSync(f).size < 1500) miss2.push(p + SW.wkey(w));
}));
ok(miss2.length === 0, "stage 2: an audio clip for every word and sentence", miss2.slice(0, 5));
ok(new Set(w2.concat(all).map(SW.wkey)).size === 179, "no two words of the two stages share an audio file name");
ok(D2.lessons.every((l) => (l.books || []).every((b) => fs.existsSync(path.join(SITE, b.file)))), "stage 2: every suggested story exists");
ok(w2.every((w) => ART.has(w)), "stage 2: a picture for every word", w2.filter((w) => !ART.has(w)));
const svgs2 = w2.map((w) => ART.scene(w));
ok(svgs2.every((x) => /^<svg viewBox="0 0 240 160"/.test(x) && /<\/svg>$/.test(x) && x.indexOf("undefined") < 0 && x.indexOf("NaN") < 0 && bal(x, "g") === (x.match(/<\/g>/g) || []).length), "stage 2: every picture is one clean svg");
ok(new Set(svgs2.map((x) => x.length)).size > 80, "stage 2: the pictures differ from each other");
// the picture quiz and the memory game over both stages
const sentsM = {}; Object.keys(M.words).forEach((w) => { sentsM[w] = M.words[w].s; });
const allM = [].concat(...M.lessons.map((l) => l.words));
const confM = SW.makeConfusable(sentsM, (w) => ART.kinds(w), M.nouns);
let badChoice2 = [], fewChoice2 = [];
w2.forEach((w) => {
  for (let k = 0; k < 12; k++) {
    const c = SW.sentenceChoices(w, allM, sentsM, SW.seeded(k * 31 + 1), confM);
    if (c.length !== 3) fewChoice2.push(w);
    c.filter((x) => x !== w).forEach((x) => { if (confM(w, x)) badChoice2.push([w, x]); });
  }
});
ok(badChoice2.length === 0, "stage 2 picture quiz: no wrong sentence fits the picture", badChoice2.slice(0, 5));
ok(fewChoice2.length === 0, "stage 2 picture quiz: always three choices", fewChoice2.slice(0, 5));
const short2 = [];
D2.lessons.forEach((l) => {
  const sub = SW.compatibleSubset(l.words, confM, 6, 4);
  if (sub.length < Math.min(4, l.words.length)) short2.push([l.id, sub.length]);
});
ok(short2.length === 0, "stage 2 memory: every lesson gives at least 4 pairs that cannot be mixed up", short2);
console.log("   stage 2 memory pairs per lesson:", D2.lessons.map((l) => SW.compatibleSubset(l.words, confM, 6, 4).length).join(" "));
// the prizes of island 2
ok(M.units.filter((u) => u.stage === 2).every((u) => PZ.forUnit(2, u.id) && PZ.forUnit(2, u.id).unit === u.id), "prizes: every unit of island 2 has one");
ok(PZ.wonIn({ "chest2-6": 5 }, "ch-sunhat") && !PZ.wonIn({ "chest1-1": 5 }, "ch-sunhat") && !PZ.wonIn({ "chest2-6": 5 }, "ch-flower"), "prizes: island 2 prizes are won by island 2 chests");
const SCN = require("../site/sightwords-scenery.js");
const isl = SCN.islands({ known: 0, total: 1, ready: { 1: true, 2: true }, stages: { 1: { title: "First words", known: 30, total: 92 }, 2: { title: "Growing readers", known: 5, total: 87 } } });
ok((isl.match(/sw-isl-go/g) || []).length === 2 && /30 of 92 words known/.test(isl) && /5 of 87 words known/.test(isl) && /Growing readers/.test(isl), "islands: each ready island shows its own name and count", isl.length);

// ---- the monsters as living rigs: parts with pivots that breathe, blink, turn, charge, attack, get hit and are beaten
//      (these need jsdom:  NODE_PATH=<dir with jsdom> node tools/sightwords_test.js)
let JSD = null;
try { JSD = require("jsdom"); } catch (e) {}
if (!JSD) console.log("   (monster rig tests skipped: jsdom not found)");
else {
  const rdoc = new JSD.JSDOM("<!doctype html><body></body>").window.document;
  const mk = (id, opts) => { const h = rdoc.createElement("div"); rdoc.body.appendChild(h); return MON.mount(h, id, Object.assign({ manual: true }, opts || {})); };
  const nodeOf = (c, view, name) => c.nodes[view].find((n) => n.pt.n === name);
  const tf = (c, view, name) => nodeOf(c, view, name).el.getAttribute("transform") || "";
  const rot = (t) => { const m = /rotate\((-?[\d.]+)\)/.exec(t); return m ? +m[1] : 0; };
  const dx = (t) => { const m = /^translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(t); return m ? +m[1] - 60 : 0; };
  const shown = (c, view, name) => { const n = nodeOf(c, view, name); let v = null; Object.keys(n.vs).forEach((k) => { if (!n.vs[k].getAttribute("display")) v = k; }); return v; };
  const visible = (c, view, name) => !nodeOf(c, view, name).el.getAttribute("display");
  const KINDS = ["none", "root", "shadow", "spin", "body", "arm", "foot", "deco", "flame", "tail", "wing", "hem", "face", "star", "orb"];
  let badStruct = [], badNum = [], badAct = [];
  MON.LIST.forEach((m) => {
    const c = mk(m.id);
    ["front", "side"].forEach((view) => {
      const parts = c.nodes[view].map((n) => n.pt), names = parts.map((q) => q.n);
      if (new Set(names).size !== names.length) badStruct.push([m.id, view, "duplicate part names"]);
      ["root", "shadow", "spin", "body", "eyes", "mouth", "cheeks"].forEach((q) => { if (names.indexOf(q) < 0) badStruct.push([m.id, view, "missing " + q]); });
      (view === "front" ? ["armL", "armR", "footL", "footR"] : ["arm1", "arm2", "foot1", "foot2"]).filter((q) => m.id !== 2 || !/foot/.test(q)).forEach((q) => { if (names.indexOf(q) < 0) badStruct.push([m.id, view, "missing " + q]); });
      parts.forEach((q) => {
        if (q.p !== null && names.indexOf(q.p) < 0) badStruct.push([m.id, view, q.n, "parent " + q.p + " is not a part"]);
        if (q.p === null && q.n !== "root") badStruct.push([m.id, view, q.n, "no parent"]);
        if (!(q.o.length === 2 && isFinite(q.o[0]) && isFinite(q.o[1]))) badStruct.push([m.id, view, q.n, "pivot"]);
        if (KINDS.indexOf(q.mo.k) < 0) badStruct.push([m.id, view, q.n, "motion " + q.mo.k]);
        if (q.mo.k === "face" && !q.v) badStruct.push([m.id, view, q.n, "face part without variants"]);
      });
      if (!(["open", "blink", "hurt", "cheer"].every((k) => nodeOf(c, view, "eyes").vs[k]) && ["smile", "open", "ouch"].every((k) => nodeOf(c, view, "mouth").vs[k]))) badStruct.push([m.id, view, "eye or mouth variants"]);
    });
    if (!(c.muzzle().x > 0 && c.muzzle().x < 0.5 && c.muzzle().y > 0.4 && c.muzzle().y < 0.95)) badStruct.push([m.id, "muzzle", c.muzzle()]);
    // run every move one after the other and look for broken numbers anywhere
    const c2 = mk(m.id, { gaze: -1, lean: -4 });
    const acts = { 1: () => c2.turn(true), 2: () => c2.charge(2), 3: () => c2.play("attack"), 4: () => c2.play("hit", null, 1.7), 5: () => c2.calm(), 6: () => c2.turn(false), 7: () => c2.play("defeat") };
    for (let T = 0; T <= 9; T += 0.05) {
      T = Math.round(T * 100) / 100;
      Object.keys(acts).forEach((k) => { if (Math.abs(T - k) < 1e-9) acts[k](); });
      c2.at(T);
      ["front", "side"].forEach((view) => c2.nodes[view].forEach((n) => {
        const a = (n.el.getAttribute("transform") || "") + (n.el.getAttribute("opacity") || "") + (n.el.getAttribute("display") || "");
        if (/NaN|undefined|Infinity/.test(a)) badNum.push([m.id, T, view, n.pt.n, a]);
      }));
    }
    // still deterministic: the same time draws the same picture
    c2.at(3.3); const a1 = c2.nodes[c2.view()].map((n) => n.el.getAttribute("transform")).join("|");
    c2.at(6.1); c2.at(3.3); const a2 = c2.nodes[c2.view()].map((n) => n.el.getAttribute("transform")).join("|");
    // (the view that is showing may differ between the two visits, so compare the part list that exists in both)
    if (c2.view() === "front" && a1 !== a2) badNum.push([m.id, "not deterministic"]);
  });
  ok(badStruct.length === 0, "rigs: every monster has the same set of parts in both views, parents exist, pivots and motions are valid", badStruct.slice(0, 5));
  ok(badNum.length === 0, "rigs: no broken numbers in any part during idle, turn, charge, attack, hit and defeat", badNum.slice(0, 3));

  // breathing, blinking, gaze
  const b1 = mk(1);
  b1.at(0.3); const s1 = tf(b1, "front", "body"); b1.at(1.2); const s2 = tf(b1, "front", "body");
  ok(s1 !== s2 && s1 !== "" , "rigs: it breathes (the body's scale changes over time)");
  let blinks = 0, openSeen = 0;
  for (let T = 0; T < 12; T += 0.04) { b1.at(T); const e = shown(b1, "front", "eyes"); if (e === "blink") blinks++; if (e === "open") openSeen++; }
  ok(blinks >= 4 && blinks < openSeen / 8, "rigs: it blinks now and then but keeps its eyes open nearly all the time", [blinks, openSeen]);

  // turning to the side and back
  MON.LIST.forEach((m) => {
    const c = mk(m.id);
    c.at(0); c.turn(true);
    c.at(0.1); const early = c.view(); c.at(0.2); const mid = c.view(); const midW = /scale\(([\d.]+) /.exec(tf(c, "side", "root"));
    c.at(0.5);
    ok(early === "front" && mid === "side" && c.view() === "side" && visible(c, "side", "root") === true && c.svg.querySelector('[data-view="front"]').getAttribute("display") === "none" && !c.svg.querySelector('[data-view="side"]').getAttribute("display"), "rigs: monster " + m.id + " swaps from the front to the side view half way through the turn", [early, mid]);
    ok(midW && +midW[1] < 0.6, "rigs: monster " + m.id + " squeezes narrow at the middle of the turn (like a card turning over)", midW && midW[1]);
    c.turn(false); c.at(0.5 + 0.1); c.at(0.5 + 0.2); c.at(1);
    ok(c.view() === "front" && !c.svg.querySelector('[data-view="front"]').getAttribute("display"), "rigs: monster " + m.id + " turns back to the front", c.view());
  });

  // worked up: arms lift (left arm turns one way, right arm the other), it crouches and shakes
  MON.LIST.forEach((m) => {
    const c = mk(m.id);
    // (it breathes faster while worked up, so judge the crouch by its average over a second)
    const avgSy = (from) => { let t = 0, n = 0; for (let T = from; T < from + 1; T += 0.05) { c.at(T); const q = /scale\(([\d.]+) ([\d.]+)\)/.exec(tf(c, "front", "body")); t += q ? +q[2] : 1; n++; } return [{ 2: t / n }, t / n]; };
    c.at(0.2); const calmL = rot(tf(c, "front", "armL")), calmR = rot(tf(c, "front", "armR")), calmSy = avgSy(0.2)[0];
    c.charge(0.01); c.at(2.2); c.at(3.2);
    const wL = rot(tf(c, "front", "armL")), wR = rot(tf(c, "front", "armR")), sy = avgSy(3.2)[0];
    ok(wL > calmL + 15 && wR < calmR - 15, "rigs: monster " + m.id + " lifts both arms when it is worked up", [calmL, wL, calmR, wR]);
    ok(sy && calmSy && +sy[2] < 0.97 && Math.abs(+sy[2] - +calmSy[2]) > 0.03, "rigs: monster " + m.id + " crouches when it is worked up", [calmSy && calmSy[2], sy && sy[2]]);
  });

  // attacking: the glowing ball grows (side view only), mouth opens when it fires, it lunges forward, arm reaches
  MON.LIST.forEach((m) => {
    const c = mk(m.id, { view: "side" });
    c.at(0); c.play("attack");
    c.at(0.05); const o0 = visible(c, "side", "orb");
    c.at(0.22); const oMid = visible(c, "side", "orb"), mouthWind = shown(c, "side", "mouth"), backX = dx(tf(c, "side", "root"));
    c.at(0.45); const mouthFire = shown(c, "side", "mouth"), eyesFire = shown(c, "side", "eyes"), oFire = visible(c, "side", "orb"), fwdX = dx(tf(c, "side", "root"));
    c.at(1.1); const mouthEnd = shown(c, "side", "mouth"), oEnd = visible(c, "side", "orb");
    badAct.push(...(oMid && !oFire && !oEnd ? [] : [[m.id, "orb", o0, oMid, oFire, oEnd]]));
    badAct.push(...(mouthWind === "smile" && mouthFire === "open" && eyesFire === "cheer" && mouthEnd === "smile" ? [] : [[m.id, "face", mouthWind, mouthFire, eyesFire, mouthEnd]]));
    badAct.push(...(backX > 0.5 && fwdX < -3 ? [] : [[m.id, "lunge", backX, fwdX]]));
    const fr = mk(m.id); fr.at(0); fr.play("attack"); fr.at(0.22);
    badAct.push(...(fr.nodes.front.every((n) => n.pt.n !== "orb") ? [] : [[m.id, "orb in front view"]]));
  });
  ok(badAct.length === 0, "rigs: attack = gathers a glowing ball, leans back, opens its mouth and lunges forward as it fires, then settles", badAct.slice(0, 3));

  // getting hit: knocked back (away from the pet), squashed, hurt face and dizzy stars, then back to normal
  let badHit = [];
  MON.LIST.forEach((m) => {
    const c = mk(m.id, { gaze: -1 });
    c.at(1); c.play("hit");
    c.at(1.1); const e1 = shown(c, "front", "eyes"), m1 = shown(c, "front", "mouth"), st1 = visible(c, "front", "star0"), kx = dx(tf(c, "front", "root"));
    c.at(1.8); const e2 = shown(c, "front", "eyes"), st2 = visible(c, "front", "star0");
    if (!(e1 === "hurt" && m1 === "ouch" && st1 && kx > 1 && e2 !== "hurt" && !st2)) badHit.push([m.id, e1, m1, st1, kx, e2, st2]);
  });
  ok(badHit.length === 0, "rigs: a hit knocks it back, shows the hurt face and the dizzy stars, then it recovers", badHit.slice(0, 3));
  const hv = mk(3), hw = mk(1);
  hv.at(0); hv.play("hit"); hv.at(0.05); hw.at(0); hw.play("hit"); hw.at(0.05);
  ok(dx(tf(hv, "front", "root")) < dx(tf(hw, "front", "root")), "rigs: heavy Rocky is pushed back less than wobbly Gloop");
  const bigH = mk(1), smallH = mk(1);
  bigH.at(0); bigH.play("hit", null, 1.7); bigH.at(0.05); smallH.at(0); smallH.play("hit"); smallH.at(0.05);
  ok(dx(tf(bigH, "front", "root")) > dx(tf(smallH, "front", "root")), "rigs: a big hit (the mega laser) pushes it back further");
  // the hit move ends: callbacks run, and a callback given to play() runs once
  let cbN = 0; const cbm = mk(2); cbm.at(0); cbm.play("hit", () => cbN++); cbm.at(0.3); const early2 = cbN; cbm.at(0.7); cbm.at(0.9);
  ok(early2 === 0 && cbN === 1, "rigs: the callback of a move runs once, when the move is over", [early2, cbN]);

  // beaten: spins, shrinks, floats up and fades out, and stays gone
  let badDead = [];
  MON.LIST.forEach((m) => {
    const c = mk(m.id);
    c.at(0); c.play("defeat");
    c.at(0.1); const start = tf(c, "front", "spin");
    c.at(0.6); const spin = rot(tf(c, "front", "spin")), mid = nodeOf(c, "front", "spin").el.getAttribute("opacity");
    c.at(1.05); const end = rot(tf(c, "front", "spin")), gone = !visible(c, "front", "spin") || +nodeOf(c, "front", "spin").el.getAttribute("opacity") < 0.05, sc = /scale\(([\d.]+) /.exec(tf(c, "front", "spin"));
    c.at(5); const later = !visible(c, "front", "spin") || +nodeOf(c, "front", "spin").el.getAttribute("opacity") < 0.05;
    if (!(spin > 150 && end >= 700 && sc && +sc[1] < 0.25 && gone && later && mid !== null && +mid < 1)) badDead.push([m.id, spin, end, sc && sc[1], gone, later, mid]);
  });
  ok(badDead.length === 0, "rigs: beaten = spins round, shrinks, floats up, fades out and stays gone", badDead.slice(0, 3));

  // cheering: hops with its arms up
  const ch = mk(4, { mode: "cheer" }); let minY = 0, armUp = true;
  for (let T = 0; T < 2; T += 0.05) { ch.at(T); const m = /^translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(tf(ch, "front", "root")); if (m) minY = Math.min(minY, +m[2] - 108); if (rot(tf(ch, "front", "armL")) < 60) armUp = false; }
  ok(minY < -8 && armUp && shown(ch, "front", "eyes") === "cheer", "rigs: a cheering monster hops, keeps its arms up and shows the happy face", [minY, armUp]);
  // the still pictures come from the same drawings
  const st = MON.art(2, "idle"), sth = MON.art(2, "hurt");
  ok(!/data-p|data-v/.test(st) && sth.length > st.length && /#E0A800/.test(sth) && !/#E0A800/.test(st), "monsters: the still pictures are plain drawings; the hurt one has dizzy stars");

  // ---- the pets as living rigs (pet-art.js marks the parts of every pet; pet-rig.js moves them)
  const PW = new JSD.JSDOM("<!doctype html><body></body>", { runScripts: "outside-only" }).window;
  PW.eval(fs.readFileSync(path.join(SITE, "pet-art.js"), "utf8"));
  PW.eval(fs.readFileSync(path.join(SITE, "pet-rig.js"), "utf8"));
  const PR = PW.PetRig, pdoc = PW.document;
  const PETS = ["cat", "dog", "monkey", "bunny", "dino", "duck", "penguin", "panda"];
  const EQS = [{}, { hat: "party", face: "glasses", neck: "scarf", body: "tshirt" }, { hat: "crown", face: "shades", neck: "bowtie", body: "dress" }, { body: "cape", neck: "bandana" }, { body: "astro", hat: "flower" }];
  const mkp = (t, eq, opts) => { const h = pdoc.createElement("div"); pdoc.body.appendChild(h); return PR.mount(h, t, eq || {}, Object.assign({ manual: true, gaze: -1, lean: -4 }, opts || {})); };
  const tfp = (c, n) => (c.byName[n] ? c.byName[n].el.getAttribute("transform") || "" : null);
  const tx = (t) => { const m = /^translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(t || ""); return m ? +m[1] : null; };
  const rotp = (t) => { const m = /rotate\((-?[\d.]+)\)/.exec(t || ""); return m ? +m[1] : 0; };
  const sxp = (t) => { const m = /scale\((-?[\d.]+) (-?[\d.]+)\)/.exec(t || ""); return m ? +m[1] : 1; };
  const shownp = (c, name) => { const e = c.svg.querySelector('[data-rg="' + name + '"]'); let v = null; if (e) for (const ch of Array.from(e.children)) if (ch.getAttribute("data-v") && !ch.getAttribute("display")) v = ch.getAttribute("data-v"); return v; };
  // the markers: every pet and every outfit keeps its drawing and adds these named parts
  let badMark = [];
  PETS.forEach((t) => EQS.forEach((eq, i) => {
    const x = PW.petSvg(t, "happy", eq, "full"), has = (n) => x.indexOf('data-rg="' + n + '"') >= 0;
    ["armL", "armR", "eyeL", "eyeR", "face", "mouth", "blush"].forEach((n) => { if (!has(n)) badMark.push([t, i, n]); });
    if (t !== "penguin" && !has("footL")) badMark.push([t, i, "footL"]);
    if (t === "penguin" && !(has("pw") && has("bw") && has("bs") && has("ps") && has("footL"))) badMark.push([t, i, "penguin whites"]);
    if (eq.hat && !has("ihat")) badMark.push([t, i, "ihat"]);
    if (eq.face && !has("iface")) badMark.push([t, i, "iface"]);
    if (eq.neck && !has("ineck")) badMark.push([t, i, "ineck"]);
    if (/tshirt|dress|astro/.test(eq.body || "") && t !== "duck" && t !== "penguin" && !has("sleeveL") && eq.body !== "dress") badMark.push([t, i, "sleeveL"]);
  }));
  ok(badMark.length === 0, "pets: every pet, with every kind of clothes, marks its parts (arms, feet, eyes, face, mouth, hat, glasses, scarf, sleeves)", badMark.slice(0, 4));
  let badP = [], badPn = [];
  PETS.forEach((t) => EQS.forEach((eq, i) => {
    const c = mkp(t, eq);
    if (!c) { badP.push([t, i, "no rig"]); return; }
    const acts = { 1: () => c.turn(true), 2: () => c.charge(1.5), 3: () => c.play("fire"), 4: () => c.play("fire", null, 2), 5: () => c.turn(false), 6: () => c.play("hit"), 7: () => c.play("hit", null, 1.7), 8: () => c.play("cheer") };
    for (let T = 0; T <= 10; T += 0.1) {
      T = Math.round(T * 100) / 100;
      Object.keys(acts).forEach((k) => { if (Math.abs(T - k) < 1e-9) acts[k](); });
      c.at(T);
      c.nodes.forEach((n) => { const a = (n.el.getAttribute("transform") || "") + (n.el.getAttribute("display") || ""); if (/NaN|undefined|Infinity/.test(a)) badPn.push([t, i, T, n.n, a]); });
    }
  }));
  ok(badP.length === 0, "pet rigs: every pet in every outfit builds a rig", badP.slice(0, 3));
  ok(badPn.length === 0, "pet rigs: no broken numbers in any part during turn, tense, fire, laser, hit and cheer", badPn.slice(0, 3));
  // behaviour
  PETS.forEach((t) => {
    const c = mkp(t, EQS[1]);
    c.at(0.4); const body0 = tfp(c, "body"), face0 = tfp(c, "face"), head0 = tfp(c, "head");
    c.at(1.3); const body1 = tfp(c, "body");
    ok(body0 !== body1, "pet rigs: " + t + " breathes");
    ok(face0 === "" || tx(face0) === null || Math.abs(tx(face0) - 60) < 0.01, "pet rigs: " + t + " looks straight ahead until it turns");
    c.at(2); c.turn(true); c.at(2.1); const midT = tx(tfp(c, "face")); c.at(2.5); const faceS = tfp(c, "face");
    ok(tx(faceS) < 60 - 12 && sxp(faceS) < 0.92, "pet rigs: " + t + " slides its face toward the front and narrows it when it turns", faceS);
    ok(midT > tx(faceS) && midT < 60, "pet rigs: " + t + " turns smoothly (the face is part way across half way through)", [midT, tx(faceS)]);
    ok(sxp(tfp(c, "body")) < 0.9, "pet rigs: " + t + " gets narrower when it turns");
    const gl = tfp(c, "iface");
    if (gl !== null) ok(Math.abs(tx(gl) - tx(faceS)) < 0.01, "pet rigs: " + t + "'s glasses slide with its face");
    const eL = sxp(tfp(c, "eyeL")), eR = sxp(tfp(c, "eyeR"));
    ok(eL < 0.8 && eR > 1, "pet rigs: " + t + ": the far eye is smaller, the near eye bigger, when turned", [eL, eR]);
    c.at(3); c.turn(false); c.at(3.5);
    ok(c.view() === 0 && (tfp(c, "face") === "" || Math.abs(tx(tfp(c, "face")) - 60) < 0.01), "pet rigs: " + t + " turns back to the front");
  });
  { // faces: excited when it fires, surprised when it is hit, a blink now and then
    const c = mkp("cat", {});
    c.at(1); c.play("fire"); c.at(1.2); const fireFace = shownp(c, "mouth") + "/" + shownp(c, "eyeL") + "/" + shownp(c, "blush");
    c.at(2); const after = shownp(c, "mouth");
    c.play("hit"); c.at(2.1); const hitFace = shownp(c, "mouth") + "/" + shownp(c, "eyeR");
    c.at(3); const calm = shownp(c, "mouth");
    ok(fireFace === "excited/excited/excited" && after === "happy" && hitFace === "surprised/surprised" && calm === "happy", "pet rigs: the face is excited when it fires and surprised when it is hit, then happy again", [fireFace, after, hitFace, calm]);
    let blink = 0, open = 0;
    for (let T = 0; T < 12; T += 0.04) { c.at(T); const e = shownp(c, "eyeL"); if (e === "asleep") blink++; if (e === "happy") open++; }
    ok(blink >= 4 && blink < open / 8, "pet rigs: it blinks now and then, with its eyes open nearly all the time", [blink, open]);
  }
  { // fire: a kick back (away from the monster = the drawing's right) and the arm swings; the laser holds longer; a hit pushes it back
    const c = mkp("dog", {}), c2 = mkp("dog", {}), c3 = mkp("dog", {});
    c.at(0); c.play("fire"); c.at(0.16); const kick = tx(tfp(c, "root")); c.at(0.14); const armUp = rotp(tfp(c, "armR"));
    c2.at(0); c2.play("fire", null, 2); c2.at(0.6); const holdFace = shownp(c2, "mouth"); c2.at(1.6); const doneFace = shownp(c2, "mouth");
    c3.at(0); c3.play("hit"); c3.at(0.05); const push = tx(tfp(c3, "root")) - 60; c3.at(1.5); const back = tx(tfp(c3, "root"));
    ok(kick > 60.3 && armUp < -20, "pet rigs: firing kicks the pet back and swings its arm", [kick, armUp]);
    ok(holdFace === "excited" && doneFace === "happy", "pet rigs: the laser keeps the pet's mouth open while the beam runs, then it settles", [holdFace, doneFace]);
    ok(push > 0.5 && Math.abs(back - 60) < 0.5, "pet rigs: a hit pushes the pet away from the monster and it comes back", [push, back]);
    let cb = 0; const c4 = mkp("duck", {}); c4.at(0); c4.play("fire", () => cb++); c4.at(0.3); const e1 = cb; c4.at(0.6);
    ok(e1 === 0 && cb === 1, "pet rigs: the callback of a move runs once, when it is over", [e1, cb]);
  }
  { // clothes keep pace: sleeves move with the arms, a cape swings with the body, the far arm goes behind the body when the pet is turned
    const c = mkp("cat", { body: "tshirt" });
    c.at(0); c.charge(0.01); c.at(1.2);
    ok(Math.abs(rotp(tfp(c, "sleeveL")) - rotp(tfp(c, "armL"))) < 0.001 && Math.abs(rotp(tfp(c, "sleeveR")) - rotp(tfp(c, "armR"))) < 0.001, "pet rigs: sleeves move exactly with the arms");
    const d = mkp("cat", {}); const torso = d.svg.querySelector(".rg-torso");
    const before = Array.from(torso.parentNode.children).indexOf(d.byName.armL.el) > Array.from(torso.parentNode.children).indexOf(torso);
    d.at(0); d.turn(true); d.at(0.5);
    const after = Array.from(torso.parentNode.children).indexOf(d.byName.armL.el) < Array.from(torso.parentNode.children).indexOf(torso);
    d.turn(false); d.at(1); d.at(1.5);
    const back = Array.from(torso.parentNode.children).indexOf(d.byName.armL.el) > Array.from(torso.parentNode.children).indexOf(torso);
    ok(before && after && back, "pet rigs: the far arm goes behind the body when the pet is turned and comes back in front when it turns back", [before, after, back]);
  }
  { // the muzzle (where the shot leaves) is inside the picture, in front of the pet (right of the middle once mirrored)
    const bad = [];
    PETS.forEach((t) => { const c = mkp(t, {}), m = c.muzzle(); if (!(m.x > 0.5 && m.x < 0.9 && m.y > 0.2 && m.y < 0.6)) bad.push([t, m]); });
    ok(bad.length === 0, "pet rigs: the shot leaves from the mouth, in front of the pet", bad);
  }
  ok(PR.mount(null, "cat", {}) === null && PR.mount(pdoc.createElement("div"), "dragon", {}) === null, "pet rigs: mounting nothing, or an unknown pet, gives null");

  // ---- the quick check on screen: the island card, the questions, the result (a page of its own for each try, with the audio and the timers driven by the test)
  const SWFILES = ["sightwords-prizes.js", "sightwords-data.js", "sightwords-data2.js", "sightwords-art.js", "sightwords-scenery.js", "pet-art.js", "sightwords-monsters.js", "sightwords.js"];
  const world = (saved) => {
    const dom = new JSD.JSDOM("<!doctype html><body></body>", { url: "https://example.test/", runScripts: "outside-only" }), w = dom.window, played = [], timers = [], awarded = [];
    w.setTimeout = (fn) => { timers.push(fn); return timers.length; };
    w.clearTimeout = (id) => { if (id > 0 && id <= timers.length) timers[id - 1] = null; };
    w.Audio = function (src) { played.push(src); this.play = () => ({ catch() {} }); this.pause = () => {}; };
    if (saved) w.localStorage.setItem("lef_words_v1", JSON.stringify(saved));
    SWFILES.forEach((f) => w.eval(fs.readFileSync(path.join(SITE, f), "utf8")));
    w.SightWords.init({ award: (n) => { awarded.push(n); return n; }, toast() {}, burst() {}, pet: () => ({ type: "cat", eq: {}, stars: 0 }) });
    const flush = () => { for (let i = 0; i < 400 && timers.some((t) => t); i++) { const t = timers.find((x) => x); timers[timers.indexOf(t)] = null; t(); } };
    const d = w.document, state = () => JSON.parse(w.localStorage.getItem("lef_words_v1") || "{}");
    const word = () => { const m = /w-([a-z]+)\.mp3/.exec(played[played.length - 1] || ""); return m && m[1]; };
    const answer = (right) => {
      const opts = Array.from(d.querySelectorAll(".sw-opt")), good = opts.find((o) => SW.wkey(o.getAttribute("data-w")) === word());
      (right ? good : opts.find((o) => o !== good)).click(); flush();
    };
    return { w, d, flush, state, word, answer, played, awarded, ask: () => { flush(); } };
  };
  const toMap = (W) => { W.w.SightWords.open(); W.flush(); W.d.querySelector('.sw-isl-go[data-s="1"]').dispatchEvent(new W.w.MouseEvent("click", { bubbles: true })); W.flush(); return W; };
  { // the card shows on an island that has not been started; "Not now" removes it and leaves a small link
    const W = world(); toMap(W);
    ok(!!W.d.getElementById("swQGo") && /Already know some words/.test(W.d.body.textContent), "quick check: an island that has not been started offers the check");
    W.d.getElementById("swQNot").click(); W.flush();
    const sk = W.state().rev;
    ok(!W.d.getElementById("swQGo") && !!W.d.getElementById("swQLink") && sk.pskip1 > 0, "quick check: \"Not now\" is remembered; the island keeps a small link to the check", sk);
    // from the link: answer everything right
    W.d.getElementById("swQLink").click(); W.flush();
    let n = 0; while (W.d.querySelector(".sw-opt") && n < 80) { W.answer(true); n++; }
    const st = W.state();
    ok(n === 36 && Object.keys(st.lessons).length === 18 && Object.keys(st.lessons).every((k) => st.lessons[k].pl === 1), "quick check on screen: all right = 36 questions, every lesson done", [n, Object.keys(st.lessons).length]);
    ok(/You know this whole island/.test(W.d.body.textContent) && !W.d.getElementById("swQStart") && !!W.d.getElementById("swQMap"), "quick check on screen: knowing everything says so and goes to the map");
    ok(W.awarded.length === 1 && W.awarded[0] === 2 && st.rev.place1 > 0, "quick check on screen: two stars for taking it, once", W.awarded);
    W.d.getElementById("swQMap").click(); W.flush();
    ok(!W.d.getElementById("swQGo") && !W.d.getElementById("swQLink"), "quick check on screen: with nothing left to learn, no card and no link");
  }
  { // the home page shows an orange "Quick check" tag next to "Open" on each island that has not been started; it starts the check straight away
    const W = world(); W.w.SightWords.open(); W.flush();
    const tags = W.d.querySelectorAll(".sw-isl-qc");
    ok(tags.length === 2 && /Quick check/.test(tags[0].textContent) && tags[0].getAttribute("role") === "button", "quick check: each open island on the home page has a \"Quick check\" tag", tags.length);
    tags[1].dispatchEvent(new W.w.MouseEvent("click", { bubbles: true })); W.flush();
    ok(!!W.d.querySelector(".sw-opt") && /Stage 2/.test(W.d.body.textContent) && !W.d.getElementById("swQGo"), "quick check: the tag starts island 2's check straight away (not the map)");
    W.d.getElementById("swQuit").click(); W.flush();
    // once a lesson has been done on island 1 its tag goes, island 2 keeps its tag
    const W2 = world({ words: {}, lessons: { 1: { t: 1, acc: 100 } }, rev: {} }); W2.w.SightWords.open(); W2.flush();
    const t2 = W2.d.querySelectorAll(".sw-isl-qc");
    ok(t2.length === 1 && t2[0].getAttribute("data-s") === "2", "quick check: an island that has been started loses its tag", t2.length);
    const W3 = world({ words: {}, lessons: {}, rev: { place1: 5, place2: 5 } }); W3.w.SightWords.open(); W3.flush();
    ok(W3.d.querySelectorAll(".sw-isl-qc").length === 0, "quick check: after the check the tags are gone");
    // on the map: the first time a card with the bolt, afterwards a bar (not a small link)
    const W4 = world(); toMap(W4);
    ok(/sw-bolt/.test(W4.d.querySelector(".sw-qcard").innerHTML), "quick check: the card on the map has the bolt sign");
    W4.d.getElementById("swQNot").click(); W4.flush();
    ok(!!W4.d.querySelector("button.sw-qbar") && /Skip the words you already know/.test(W4.d.querySelector(".sw-qbar").textContent), "quick check: after \"Not now\" the island keeps a clear bar for it, not a small link");
  }
  { // the beach island has its own check: its own lessons and words, and nothing on island 1 changes
    const W = world(); W.w.SightWords.open(); W.flush();
    W.d.querySelector('.sw-isl-go[data-s="2"]').dispatchEvent(new W.w.MouseEvent("click", { bubbles: true })); W.flush();
    ok(!!W.d.getElementById("swQGo"), "quick check on screen: the beach island offers it too");
    W.d.getElementById("swQGo").click(); W.flush();
    let n = 0; const seen = {}; while (W.d.querySelector(".sw-opt") && n < 100) { seen[W.word()] = 1; W.answer(true); n++; }
    const st = W.state(), ids = Object.keys(st.lessons).map(Number).sort((a, b) => a - b);
    const stage2 = [].concat(...M.lessons.filter((l) => l.id >= 19).map((l) => l.words)).map((x) => SW.wkey(x));
    ok(n === 40 && ids.length === 20 && ids[0] === 19 && ids[19] === 38 && st.rev.place2 > 0 && !st.rev.place1, "quick check on screen: island 2 = 40 questions, lessons 19 to 38 done, island 1 untouched", [n, ids.length, ids[0]]);
    ok(Object.keys(seen).every((k) => stage2.indexOf(k) >= 0), "quick check on screen: island 2 only asks island 2's words");
  }
  {
    const W = world(); toMap(W);
    W.d.getElementById("swQGo").click(); W.flush();
    // lessons 1-3 right, then two lessons with slips
    [true, true, true, true, true, true, false, true, true, false].forEach((r) => W.answer(r)); // 4: wrong first; 5: right then wrong -> stop
    const st = W.state();
    ok(!W.d.querySelector(".sw-opt") && Object.keys(st.lessons).join() === "1,2,3" && /You already know 3 lessons/.test(W.d.body.textContent) && /Start at Lesson 4/.test(W.d.body.textContent), "quick check on screen: it stops after two lessons in a row with a miss and says where to start", Object.keys(st.lessons));
    ok(!!W.d.getElementById("swQStart") && /Start lesson 4/.test(W.d.getElementById("swQStart").textContent), "quick check on screen: a button starts the first lesson that is not known");
    W.d.getElementById("swQStart").click(); W.flush();
    ok(/Lesson 4/.test(W.d.body.textContent), "quick check on screen: that button opens the lesson");
  }
  {
    const W = world(); toMap(W);
    W.d.getElementById("swQGo").click(); W.flush();
    // "I'm not sure" counts as a miss and shows the answer
    const first = W.word(); W.d.getElementById("swQNo").click();
    const msg = W.d.getElementById("swMsg").textContent, okN = W.d.querySelectorAll(".sw-opt.sw-ok").length, badN = W.d.querySelectorAll(".sw-opt.sw-bad").length, okW = W.d.querySelector(".sw-opt.sw-ok");
    ok(/It was/.test(msg) && okN === 1 && badN === 0 && okW && SW.wkey(okW.getAttribute("data-w")) === first, "quick check on screen: \"I'm not sure\" is fine: it shows the right word, no red, and counts as a miss", [msg, okN, badN]);
    W.flush();
    // right on the first lesson's second word? (it was already a miss, so lesson 1 fails)  ... then leave half way after a passed lesson
    const W2 = world(); toMap(W2);
    W2.d.getElementById("swQGo").click(); W2.flush();
    W2.answer(true); W2.answer(true); // lesson 1 passed
    W2.d.getElementById("swQuit").click(); W2.flush();
    const st = W2.state();
    ok(Object.keys(st.lessons).join() === "1" && st.rev.place1 > 0 && !!W2.d.querySelector(".sw-unit"), "quick check on screen: leaving half way keeps the lessons already passed and goes back to the map", Object.keys(st.lessons));
    const W3 = world(); toMap(W3);
    W3.d.getElementById("swQGo").click(); W3.flush();
    W3.d.getElementById("swQuit").click(); W3.flush();
    ok(Object.keys(W3.state().lessons || {}).length === 0, "quick check on screen: leaving before answering anything changes nothing");
  }

  { // festival clothes (Halloween, Thanksgiving) work with the rig too: their back layers (the turkey's feathers, capes) move with the body
    PW.eval(fs.readFileSync(path.join(SITE, "pet-fest.js"), "utf8"));
    const bad = [], fest = PW.FEST.list.filter((f) => f.outfits.length);
    fest.forEach((f) => PETS.forEach((t) => f.outfits.concat(f.hats).forEach((it) => {
      const eq = it.slot === "body" ? { body: it.id } : { hat: it.id };
      const c = mkp(t, eq);
      if (!c) { bad.push([t, it.id, "no rig"]); return; }
      c.at(0); c.turn(true);
      for (let T = 0; T < 1.5; T += 0.1) { c.at(T); c.nodes.forEach((n) => { if (/NaN|undefined|Infinity/.test(n.el.getAttribute("transform") || "")) bad.push([t, it.id, n.n]); }); }
      if (it.slot === "hat" && !c.byName.ihat) bad.push([t, it.id, "hat not found"]);
      if (it.slot === "body" && it.id === "tg-turkey" && !c.svg.querySelector('[data-rg="oback"] path')) bad.push([t, it.id, "feathers not drawn"]);
    })));
    ok(bad.length === 0 && fest.length === 2, "pet rigs: every Halloween and Thanksgiving outfit and hat works on every pet when it turns", bad.slice(0, 3));
  }
  // ---- the same rig on the adoption page (look, hover, hello hop, still) and in the home scene (faces, walking, sleeping, eating...)
  { // looking to either side
    const bad = [];
    PETS.forEach((t) => {
      const c = mkp(t, {});
      c.at(0); c.look(-1); c.at(0.5);
      const fr = tfp(c, "face"), eL = sxp(tfp(c, "eyeL")), eR = sxp(tfp(c, "eyeR"));
      const farR = Array.from(c.byName.armR.el.parentNode.children).indexOf(c.byName.armR.el) < Array.from(c.byName.armR.el.parentNode.children).indexOf(c.svg.querySelector(".rg-torso"));
      if (!(tx(fr) > 60 + 12 && sxp(fr) < 0.92 && eR < 0.8 && eL > 1 && farR)) bad.push([t, fr, eL, eR, farR]);
      c.look(0); c.at(1.2);
      if (c.view() !== 0) bad.push([t, "view", c.view()]);
    });
    ok(bad.length === 0, "pet rigs: looking to the right slides the face to the right, the near eye is then the left one and the right arm goes behind the body", bad.slice(0, 3));
  }
  { // faces: every one of the ten, lazily built, no broken drawing; a bunny's ears flop when it is sleepy
    const c = mkp("bunny", {}, {});
    const bad = [];
    ["happy", "excited", "surprised", "asleep", "sleepy", "bored", "yawn", "hungry", "eat", "love"].forEach((f, i) => {
      c.setFace(f); c.at(i + 1);
      if (shownp(c, "mouth") !== f || shownp(c, "eyeL") !== (f === "happy" || f === "excited" || f === "surprised" || f === "hungry" || f === "love" ? shownp(c, "eyeL") : f)) bad.push([f, shownp(c, "mouth"), shownp(c, "eyeL")]);
    });
    ok(bad.length === 0, "pet rigs: it can wear every one of the ten faces", bad);
    c.setFace("happy"); c.at(20); const up = rotp(tfp(c, "earL"));
    c.setFace("sleepy"); c.at(21); const down = rotp(tfp(c, "earL")), downR = rotp(tfp(c, "earR"));
    ok(down < up - 60 && downR > 60, "pet rigs: a sleepy bunny's ears flop to both sides", [up, down, downR]);
    const dg = mkp("dog", {}); dg.setFace("sleepy"); dg.at(3);
    ok(Math.abs(rotp(tfp(dg, "earL"))) < 30, "pet rigs: only the bunny's ears flop");
  }
  { // what it is doing
    const acts = {};
    const run = (act, opts, T) => { const c = mkp("cat", {}); c.at(0); c.setAct(act, opts || {}); c.at(T); return c; };
    const w = run("walk", { dir: 1 }, 0.2);
    ok(rotp(tfp(w, "armL")) * rotp(tfp(w, "armR")) < 0 || Math.abs(rotp(tfp(w, "armL"))) > 10, "pet rigs: walking swings the arms", [rotp(tfp(w, "armL")), rotp(tfp(w, "armR"))]);
    ok(tx(tfp(w, "face")) > 60, "pet rigs: walking to the right it looks to the right", tfp(w, "face"));
    const wl = run("walk", { dir: -1 }, 0.2);
    ok(tx(tfp(wl, "face")) < 60, "pet rigs: walking to the left it looks to the left");
    const sl = run("sleep", {}, 2), idle = mkp("cat", {}); idle.at(2);
    ok(rotp(tfp(sl, "head")) > rotp(tfp(idle, "head")) + 5 && tx(tfp(sl, "head")) > tx(tfp(idle, "head")), "pet rigs: asleep, the head droops", [tfp(sl, "head"), tfp(idle, "head")]);
    let hy = [];
    const ea = run("eat", {}, 0); for (let T = 0; T < 0.8; T += 0.05) { ea.at(T); const m = /^translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(tfp(ea, "head")); hy.push(m ? +m[2] : 100); }
    ok(Math.max.apply(null, hy) - Math.min.apply(null, hy) > 2, "pet rigs: eating, the head moves up and down", hy);
    const ch = mkp("cat", {}); ch.at(0); ch.setAct("cheer", { small: false }); let hi = 0, hs = [];
    for (let T = 0; T < 2.4; T += 0.05) { ch.at(T); const m = /^translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(tfp(ch, "root")); hs.push(m ? +m[2] - 177 : 0); }
    for (let i = 1; i < hs.length - 1; i++) if (hs[i] < hs[i - 1] && hs[i] <= hs[i + 1] && hs[i] < -15) hi++;
    ok(hi === 3, "pet rigs: a big cheer is three hops", hi);
    const sm = mkp("cat", {}); sm.at(0); sm.setAct("cheer", { small: true }); let sh = 0; for (let T = 0; T < 2; T += 0.05) { sm.at(T); const m = /^translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(tfp(sm, "root")); if (m && +m[2] - 177 < -12) sh++; }
    ok(sh > 0 && sh < 14, "pet rigs: a small cheer is one hop", sh);
    const tw = mkp("duck", {}); tw.at(0); tw.setAct("twirl"); let lo = 99, hiX = -99; for (let T = 0; T < 2; T += 0.05) { tw.at(T); const x = tx(tfp(tw, "face")); lo = Math.min(lo, x); hiX = Math.max(hiX, x); }
    ok(lo < 60 - 12 && hiX > 60 + 12, "pet rigs: twirling, it looks to one side and then to the other", [lo, hiX]);
    const hg = mkp("cat", {}); hg.at(0); hg.setFlags({ hungry: true, rumble: true }); hg.at(0.013); const x1 = tx(tfp(hg, "root")); hg.at(0.05); const x2 = tx(tfp(hg, "root"));
    ok(x1 !== x2, "pet rigs: a rumbling tummy shakes it");
    const st1 = mkp("cat", {}); st1.at(0); st1.setAct("walk", { dir: 1 }); st1.at(0.1); const a1 = tfp(st1, "armL"); st1.setAct("idle"); st1.at(0.12); const a2 = tfp(st1, "armL"); st1.at(0.9);
    ok(a1 !== a2 && Math.abs(rotp(tfp(st1, "armL"))) < 8, "pet rigs: changing what it does blends smoothly and ends calm");
  }
  { // a tail hangs from the body and never slides off it; a dino's back ridge is part of its back, not of its tail
    const bad = [];
    PETS.forEach((t) => {
      const c = mkp(t, {});
      if (!c.byName.tail) return;
      const piv = c.byName.tail.o[0];
      c.at(0); c.turn(true); c.setAct("walk", { dir: 1 });
      for (let T = 0; T < 4; T += 0.05) {
        c.at(T);
        const tf2 = tfp(c, "tail"), x = tx(tf2);
        if (x !== null && Math.abs(x - piv) > 6) bad.push([t, T, "tail slid off the body", x - piv]);
        if (sxp(tf2) < 0.999 || sxp(tf2) > 1.3) bad.push([t, T, "tail stretch", sxp(tf2)]);
      }
    });
    const dn = mkp("dino", {});
    ok(!!dn.byName.spikes && !!dn.byName.tail && dn.byName.spikes.el !== dn.byName.tail.el && !dn.byName.tail.el.contains(dn.byName.spikes.el), "pet rigs: the dino's back spikes and its tail are separate parts");
    dn.at(0); dn.turn(true); dn.setAct("walk", { dir: 1 });
    for (let T = 0; T < 3; T += 0.05) { dn.at(T); if (tfp(dn, "spikes") !== "") bad.push(["dino spikes moved on their own", T, tfp(dn, "spikes")]); }
    ok(bad.length === 0, "pet rigs: every tail stays attached to the body when it wags and the pet turns, and the dino's spikes stay on its back", bad.slice(0, 3));
  }
  { // the adoption page: hello hop now and then, hover, a picture that is drawn once for people who ask for less motion
    const h = mkp("dog", {}, { face: "excited", gaze: 0, hello: { first: 1, every: 4.4 }, fps: 30 });
    h.at(0.5); const rest = tx(tfp(h, "root")); h.at(1.4); const up = tfp(h, "root"); let my = 0; for (let T = 1; T < 1.9; T += 0.05) { h.at(T); const m = /^translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(tfp(h, "root")); if (m) my = Math.min(my, +m[2] - 177); }
    let again = 0; for (let T = 5.4; T < 5.9; T += 0.05) { h.at(T); const m = /^translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(tfp(h, "root")); if (m) again = Math.min(again, +m[2] - 177); }
    ok(my < -10 && again < -10, "pet rigs: the adoption page's pets hop hello now and then", [my, again]);
    ok(shownp(h, "mouth") === "excited", "pet rigs: they start with the excited face");
    h.hover(true); h.at(8.2); const hv = shownp(h, "mouth"); h.hover(false); h.at(9); const hv2 = shownp(h, "mouth");
    ok(hv === "excited" && hv2 === "excited", "pet rigs: hover keeps the excited face");
    const k = mkp("dog", {}, { still: true, face: "excited" });
    ok(k.state.cbs.length === 0 && PR.mount(pdoc.createElement("div"), "dog", {}, { still: true }) !== null, "pet rigs: a still rig is drawn once");
    const hello = mkp("cat", {}); hello.at(0); hello.play("hello"); hello.at(0.4); const hy2 = tfp(hello, "root"); let cb2 = 0; hello.play("hello", () => cb2++); hello.at(1.5);
    ok(/translate\(60 (16[0-9]|17[0-5])/.test(hy2) && cb2 === 1, "pet rigs: asked to hello it jumps, and says when it is done", [hy2, cb2]);
  }
  { // in the home scene the pet is a group inside a bigger picture
    const sceneHost = pdoc.createElement("div");
    sceneHost.innerHTML = '<svg id="scene" viewBox="0 0 360 300"><g id="psTest">' + PW.petGroup("panda", "happy", { hat: "crown", body: "tshirt" }) + "</g></svg>";
    pdoc.body.appendChild(sceneHost);
    const g = pdoc.getElementById("psTest"), r = PR.mountGroup(g, "panda", { hat: "crown", body: "tshirt" }, { face: "happy", gaze: 0, noShadow: true, manual: true });
    r.at(0); r.setAct("sleep"); r.setFace("asleep"); r.at(2);
    ok(!!r && g.querySelector(".torso") === null && g.querySelector(".headg") === null && g.querySelector(".blink") === null, "pet rigs: in the home scene the page's own CSS motion classes are taken off the pet (the rig moves it)");
    ok(!g.querySelector("ellipse[fill='#2B1B52']") && /rotate/.test(tfp(r, "head") || ""), "pet rigs: the home scene's own shadow is used, and the pet sleeps with its head down", tfp(r, "head"));
    ok(PR.mountGroup(null, "cat", {}) === null, "pet rigs: mounting into nothing gives null");
  }
  { // the home scene's life (pet-life.js) hands the pet's state to the rig
    PW.eval(fs.readFileSync(path.join(SITE, "pet-life.js"), "utf8"));
    PW.eval("window.FEST = undefined; window.HOMES = window.HOMES;");
    const hostDiv = pdoc.createElement("div"); hostDiv.style.width = "800px"; pdoc.body.appendChild(hostDiv);
    const stt = { type: "cat", name: "Mochi", hunger: 80, stars: 3, eq: { hat: "party" }, home: {}, toys: [] };
    let threw = null;
    try {
      PW.PetLife.start(hostDiv, stt);
      const sc = pdoc.getElementById("petScene");
      ok(!!sc && /rigged/.test(sc.getAttribute("class")) && sc.querySelectorAll("#psIn [data-rg]").length > 10, "pet life: the home scene draws the pet as a rig", sc && sc.getAttribute("class"));
      PW.PetLife.cheer("Yay", true, "star", "excited");
      ok(/a-cheer/.test(pdoc.getElementById("petScene").getAttribute("class")) && /rigged/.test(pdoc.getElementById("petScene").getAttribute("class")), "pet life: a cheer is handed to the rig");
      stt.eq = { hat: "crown" }; PW.PetLife.refresh();
      ok(pdoc.querySelectorAll("#psIn [data-rg='ihat']").length === 1, "pet life: new clothes rebuild the rig");
      PW.PetLife.twirl("Wheee");
      ok(/a-twirl/.test(pdoc.getElementById("petScene").getAttribute("class")), "pet life: a twirl is handed to the rig");
    } catch (e) { threw = e; }
    try { PW.PetLife.stop(); } catch (e) {}
    ok(threw === null, "pet life: no errors while the rig runs the home scene", threw && threw.message);
  }
  // a controller leaves the page quietly: a host that is not in the document draws once and does not keep a timer going
  ok(MON.mount(null, 1) === null && MON.mount(rdoc.createElement("div"), 99) === null, "rigs: mounting nothing, or an unknown monster, gives null");
}

// ---- the quick check before an island (pure parts)
{
  const lessons1 = D.lessons;
  const st0 = SW.cleanState({});
  const ps = SW.placeInit(lessons1, st0, SW.seeded(5));
  ok(ps.order.length === 18 && lessons1.every((l) => ps.pick[l.id].length === 2 && ps.pick[l.id].every((w) => l.words.indexOf(w) >= 0)), "quick check: two words are asked from each lesson, from that lesson", ps.order.length);
  const stDone = SW.cleanState({ lessons: { 1: { t: 1, acc: 100 }, 2: { t: 1, acc: 80 } } });
  ok(!SW.placeInit(lessons1, stDone, SW.seeded(5)).order.some((id) => id <= 2), "quick check: a lesson that is already finished is not asked again");
  ok(eq(SW.placeInit(lessons1, st0, SW.seeded(5)).pick, SW.placeInit(lessons1, st0, SW.seeded(5)).pick), "quick check: the same seed asks the same words");
  // all right
  const all1 = SW.placeInit(lessons1, st0, SW.seeded(7));
  let asked = 0;
  while (!all1.done) { SW.placeAnswer(all1, true); asked++; }
  ok(asked === 36 && all1.passed.length === 18 && all1.failed.length === 0, "quick check: all right = 36 questions and every lesson passed", [asked, all1.passed.length]);
  // one slip in a lesson fails it; two failed lessons in a row stop the check, and nothing after them is asked
  const mix = SW.placeInit(lessons1, st0, SW.seeded(7));
  [true, true, true, true, true, true, true, false, false, true].forEach((r) => SW.placeAnswer(mix, r)); // lessons 1, 2, 3 pass; 4: right then wrong = fail; 5: wrong then right = fail -> stop
  ok(eq(mix.passed, [1, 2, 3]) && eq(mix.failed, [4, 5]) && mix.done, "quick check: both right passes a lesson, a slip fails it", [mix.passed, mix.failed]);
  const stopT = SW.placeInit(lessons1, st0, SW.seeded(7));
  [true, true, false, false, false, false, true, true].forEach((r) => SW.placeAnswer(stopT, r));
  ok(stopT.done && eq(stopT.passed, [1]) && eq(stopT.failed, [2, 3]) && SW.placeWord(stopT) === null, "quick check: two failed lessons in a row stop it (the rest is not asked)", [stopT.passed, stopT.failed, stopT.done]);
  const gap = SW.placeInit(lessons1, st0, SW.seeded(7));
  [false, false, true, true, false, false, true, true].forEach((r) => SW.placeAnswer(gap, r));
  ok(!gap.done && eq(gap.failed, [1, 3]) && eq(gap.passed, [2, 4]), "quick check: a lesson passed between two failed ones keeps it going", [gap.passed, gap.failed, gap.done]);
  // what it changes
  const stA = SW.cleanState({ words: { the: { box: 5, n: 9, ok: 9, due: "2099-01-01" } } });
  const run1 = SW.placeInit(lessons1, stA, SW.seeded(7));
  [true, true, true, true, false, true, false, false].forEach((r) => SW.placeAnswer(run1, r)); // lessons 1 and 2 pass; 3: one slip (fail), 4: two wrong (fail) -> stop
  const nowT = 1700000000000;
  SW.placeApply(stA, lessons1, run1, 1, "2026-10-15", nowT);
  const l1 = lessons1[0], l3 = lessons1[2];
  ok(run1.passed.length === 2 && stA.lessons[1] && stA.lessons[1].pl === 1 && stA.lessons[1].acc === 0 && stA.lessons[2] && !stA.lessons[3] && !stA.lessons[4], "quick check: passed lessons are marked done (as skipped), the others are left alone", [run1.passed, Object.keys(stA.lessons)]);
  const dueOf = (w) => stA.words[SW.wkey(w)].due, untested1 = l1.words.filter((w) => run1.pick[1].indexOf(w) < 0);
  ok(l1.words.every((w) => stA.words[SW.wkey(w)].box >= 3) && lessons1[1].words.every((w) => stA.words[SW.wkey(w)].box >= 3), "quick check: every word of a passed lesson is known (box 3)");
  ok(untested1.length > 0 && untested1.every((w) => dueOf(w) < dueOf(run1.pick[1][0])), "quick check: the words that were not asked come back for review sooner than the ones that were answered right", [untested1.map(dueOf), dueOf(run1.pick[1][0])]);
  ok(stA.words.the.box === 5 && stA.words.the.due === "2099-01-01", "quick check: it never lowers a word that is already further on");
  const missed = run1.pick[3].filter((w) => run1.good.indexOf(SW.wkey(w)) < 0).concat(run1.pick[4].filter((w) => run1.good.indexOf(SW.wkey(w)) < 0));
  ok(missed.every((w) => !stA.words[SW.wkey(w)]), "quick check: a word answered wrong is left as it was (not met)");
  ok(run1.pick[3].filter((w) => run1.good.indexOf(SW.wkey(w)) >= 0).every((w) => stA.words[SW.wkey(w)].box >= 3), "quick check: a word answered right in a lesson that failed still counts as known");
  ok(stA.rev.place1 === nowT && !stA.rev[SW.chestKey(1, 1)], "quick check: it remembers it was taken, and no treasure chest is opened by it");
  ok(SW.lessonStars(stA.lessons[1]) === 0 && SW.nextLesson(lessons1, stA) === 3, "quick check: a skipped lesson has no stars, and the next lesson to learn is the first one not passed", [SW.lessonStars(stA.lessons[1]), SW.nextLesson(lessons1, stA)]);
  // the result is plain data that the sync can merge
  ok(JSON.stringify(stA).indexOf("undefined") < 0 && stA.words.the.box === 5, "quick check: the saved result is plain data");
}

// ---- the motion guard: a phone that cannot keep up is slowed to 30 pictures a second, then nearly still
{
  const loadGuard = (opts) => {
    opts = opts || {};
    const store = opts.store || {}, doc = { hidden: false };
    const win = { location: { search: opts.search || "" }, document: doc, localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } } };
    vm.runInNewContext(fs.readFileSync(path.join(SITE, "motion-guard.js"), "utf8"), { window: win, Date, JSON });
    return { g: win.MotionGuard, store, doc };
  };
  const feed = (g, ms, seconds, start) => { let t = start || 1000; const end = t + seconds * 1000; while (t < end) { g.note(t); t += ms; } return t; };
  { const { g } = loadGuard(); feed(g, 16.7, 12); ok(g.level() === 0, "motion guard: a phone that keeps up (60 frames a second) stays at full speed", g.level()); }
  { const { g, store } = loadGuard(); const t = feed(g, 33.3, 12); ok(g.level() === 1 && JSON.parse(store.lef_motion_v1).l === 1, "motion guard: a phone that manages 30 frames a second goes to level 1 and stays there (and remembers it)", g.level()); }
  { const { g } = loadGuard(); feed(g, 55, 14); ok(g.level() === 2, "motion guard: a phone that manages only about 18 frames a second ends nearly still", g.level()); }
  { const { g } = loadGuard(); let t = feed(g, 60, 2.4); feed(g, 16.7, 10, t); ok(g.level() === 0, "motion guard: slow frames while the page is starting do not count", g.level()); }
  { const { g } = loadGuard(); let t = 1000; for (let i = 0; i < 700; i++) { g.note(t); t += i % 90 === 89 ? 1500 : 16.7; } ok(g.level() === 0, "motion guard: a long pause (phone asleep or busy) is not counted as slow frames", g.level()); }
  { const { g, doc } = loadGuard(); doc.hidden = true; feed(g, 80, 12); ok(g.level() === 0, "motion guard: a hidden page is not counted", g.level()); }
  { const { g } = loadGuard(); let t = 1000, n = 0; while (t < 13000) { for (let k = 0; k < 8; k++) g.note(t); t += 16.7; n++; } ok(g.level() === 0, "motion guard: eight pets in the same frame count as one frame", g.level()); }
  { const { g } = loadGuard(); let t = 1000; while (t < 14000) { g.note(t); g.note(t + 0.4); g.note(t + 1.1); t += 55; } ok(g.level() === 2, "motion guard: loops that get stamps a hair apart in the same frame still count as one frame", g.level()); }
  { const { g } = loadGuard(); feed(g, 55, 14); const was = g.level(); feed(g, 16.7, 20, 40000); ok(was === 2 && g.level() === 2, "motion guard: it never speeds up again by itself", g.level()); }
  { const a = loadGuard(); feed(a.g, 33.3, 12); const b = loadGuard({ store: a.store }); ok(b.g.level() === 1, "motion guard: the level is remembered on the device");
    const old = JSON.parse(a.store.lef_motion_v1); old.t = Date.now() - 4 * 24 * 3600 * 1000; a.store.lef_motion_v1 = JSON.stringify(old); const c = loadGuard({ store: a.store });
    ok(c.g.level() === 0, "motion guard: after three days it tries full speed again"); }
  { const { g, store } = loadGuard({ search: "?x=1&motion=2" }); feed(g, 16.7, 12); ok(g.level() === 2 && !store.lef_motion_v1, "motion guard: ?motion=2 in the address forces a level (to try it) and remembers nothing", g.level()); }
  { const { g } = loadGuard(); const a = g.gap(0); g.force(1); const b = g.gap(0), b2 = g.gap(0.05); g.force(2); const c = g.gap(0); g.force(null);
    ok(a === 0 && b > 0.028 && b < 0.034 && b2 === 0.05 && c >= 0.3 && g.level() === 0, "motion guard: gaps between pictures: none, about 1/30 s, about 0.4 s", [a, b, c]); }
}
// ---- the pets and the monsters hold still at the lowest level and are drawn less often at the other levels
if (JSD) {
  const gw = new JSD.JSDOM("<!doctype html><body></body>", { runScripts: "outside-only" }).window;
  ["motion-guard.js", "pet-art.js", "pet-rig.js", "sightwords-monsters.js"].forEach((f) => gw.eval(fs.readFileSync(path.join(SITE, f), "utf8")));
  const gdoc = gw.document, GG = gw.MotionGuard;
  const mkg = (kind, id, opts) => { const h = gdoc.createElement("div"); gdoc.body.appendChild(h); return kind === "pet" ? gw.PetRig.mount(h, id, {}, Object.assign({ manual: true }, opts || {})) : gw.SWMonsters.mount(h, id, Object.assign({ manual: true }, opts || {})); };
  const sample = (c, names, times) => times.map((T) => { c.at(T); return names.map((n) => (c.byName ? (c.byName[n] ? c.byName[n].el.getAttribute("transform") : "") : c.nodes[c.view()].filter((x) => x.pt.n === n).map((x) => x.el.getAttribute("transform")).join(""))).join("|"); });
  const bad = [];
  ["cat", "bunny", "dino", "penguin"].forEach((t) => {
    GG.force(0); const live = mkg("pet", t); const a = sample(live, ["body", "head", "armL", "tail", "earL"], [1.0, 2.3, 3.1]);
    GG.force(2); const calm = mkg("pet", t); const b = sample(calm, ["body", "head", "armL", "tail", "earL"], [1.0, 2.3, 3.1]);
    if (new Set(a).size < 2) bad.push([t, "full speed does not move", a]);
    if (new Set(b).size !== 1) bad.push([t, "level 2 still moves", b]);
    calm.play("hit"); calm.at(3.2); const h1 = calm.byName.root.el.getAttribute("transform"); calm.at(3.3); const h2 = calm.byName.root.el.getAttribute("transform");
    if (!(h1 && h1 !== h2)) bad.push([t, "a hit does not show at level 2", h1, h2]);
  });
  ok(bad.length === 0, "motion guard: at level 2 a pet stops breathing, swaying and waving, but what happens (a hit) still shows; at full speed it moves", bad.slice(0, 2));
  const badM = [];
  [1, 2, 3, 4, 5].forEach((id) => {
    GG.force(0); const live = mkg("mon", id); const a = sample(live, ["body", "arm" + (id === 5 || true ? "L" : ""), "foot" + "L"], [1.0, 2.3, 3.1]);
    GG.force(2); const calm = mkg("mon", id); const b = sample(calm, ["body", "armL", "footL"], [1.0, 2.3, 3.1]);
    if (new Set(a).size < 2) badM.push([id, "full speed does not move", a]);
    if (new Set(b).size !== 1) badM.push([id, "level 2 still moves", b]);
    calm.play("hit"); calm.at(3.2); const h1 = calm.nodes[calm.view()].filter((x) => x.pt.n === "root")[0].el.getAttribute("transform"); calm.at(3.3); const h2 = calm.nodes[calm.view()].filter((x) => x.pt.n === "root")[0].el.getAttribute("transform");
    if (!(h1 && h1 !== h2)) badM.push([id, "a hit does not show at level 2", h1, h2]);
  });
  GG.force(null);
  ok(badM.length === 0, "motion guard: at level 2 a monster stops breathing, swaying and waving, but a hit still shows; at full speed it moves", badM.slice(0, 2));
  // the loop: pictures drawn in 60 frames at each level
  const loopCount = (level) => {
    const w = new JSD.JSDOM("<!doctype html><body></body>", { runScripts: "outside-only" }).window, q = [];
    let now = 100000;
    w.requestAnimationFrame = (f) => { q.push(f); return q.length; };
    w.Date.now = () => now;
    ["motion-guard.js", "pet-art.js", "pet-rig.js"].forEach((f) => w.eval(fs.readFileSync(path.join(SITE, f), "utf8")));
    w.MotionGuard.force(level);
    const h = w.document.createElement("div"); w.document.body.appendChild(h);
    Object.defineProperty(w.document, "hidden", { value: false });
    h.getClientRects = () => [1];
    const c = w.PetRig.mount(h, "cat", {}, {});
    c.play("hit", null, 1.7); // (something that keeps changing the picture, so that every picture drawn can be counted)
    let n = 0; const root = c.byName.root.el, orig = root.setAttribute.bind(root); root.setAttribute = (k, v) => { if (k === "transform") n++; return orig(k, v); };
    for (let i = 0; i < 60; i++) { now += 16.7; const f = q.shift(); if (f) f(now); }
    c.stop();
    return n;
  };
  const n0 = loopCount(0), n1 = loopCount(1), n2 = loopCount(2);
  ok(n0 >= 50 && n1 >= n0 * 0.4 && n1 <= n0 * 0.6 && n2 >= 1 && n2 <= 4, "motion guard: in one second the loop draws every picture at level 0, every other one (30 a second) at level 1 and only a few at level 2", [n0, n1, n2]);
}

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
