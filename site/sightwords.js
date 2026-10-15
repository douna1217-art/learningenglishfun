/* Sight words: stage 1 (18 short lessons for the Dolch pre-primer and primer words) and stage 2 (20 lessons for grade 1 and 2), then spaced review.
   Needs sightwords-data.js (stage 1) and sightwords-data2.js (stage 2): the words, one sentence per word, lessons; and the clips in sightwords/audio/.
   A lesson = meet 5 words, then practise them (listen and tap, find it in the sentence, build the sentence).
   What the child knows is kept in lef_words_v1 (synced like the pet, see state-sync.js):
     words    {word: {box 1-5, due "YYYY-MM-DD", n tries, ok right on the first try}}
     lessons  {lesson id: {t time, acc percent right on the first try}}
     rev      {date of the last review that earned its star}
   A word counts as "known" from box 3 (answered right on at least two different days).
   Written for old Android WebViews: no optional chaining, no spread, no let/const needed.
   中文说明：高频词小样：18 节小课（Dolch 学前和幼儿园词），先认词，再练习；学过的词按 1、2、4、7、15 天的间隔复习。 */
(function (root) {
  "use strict";

  // the clips are cached by phones and the CDN: bump this when site/sightwords/audio changes (the voice script says when)
  var AUDIO_V = "2",
    KEY = "lef_words_v1",
    INT = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 15 };

  /* ------------------------------------------------------------------ pure part (also used by the node tests) */
  function isObj(x) {
    return !!x && typeof x === "object" && !Array.isArray(x);
  }
  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function dayStr(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function addDays(n, from) {
    var d = from ? new Date(from.getTime()) : new Date();
    d.setDate(d.getDate() + n);
    return dayStr(d);
  }
  function wkey(w) {
    return String(w).toLowerCase().replace(/[^a-z]/g, "");
  }
  function cleanState(s) {
    s = isObj(s) ? s : {};
    return { words: isObj(s.words) ? s.words : {}, lessons: isObj(s.lessons) ? s.lessons : {}, rev: isObj(s.rev) ? s.rev : {} };
  }
  // one try on one word: first try right moves it up a box, a miss sends it back to box 1 and due tomorrow
  function applyResult(rec, right, today) {
    rec = isObj(rec) ? rec : { box: 0, n: 0, ok: 0 };
    var box = rec.box || 0;
    rec.n = (rec.n || 0) + 1;
    if (right) {
      rec.ok = (rec.ok || 0) + 1;
      box = box === 0 ? 2 : Math.min(5, box + 1); // a first lesson that went well starts at box 2
    } else box = 1;
    rec.box = box;
    rec.due = addDays(INT[box], today ? new Date(today + "T12:00:00") : null);
    return rec;
  }
  function isKnown(rec) {
    return !!rec && (rec.box || 0) >= 3;
  }
  function knownCount(state, words) {
    var n = 0;
    words.forEach(function (w) {
      if (isKnown(state.words[wkey(w)])) n++;
    });
    return n;
  }
  function dueWords(state, today) {
    var out = [];
    Object.keys(state.words).forEach(function (k) {
      var r = state.words[k];
      if (r && (r.box || 0) > 0 && (r.due || today) <= today) out.push(k);
    });
    return out.sort();
  }
  // all stored words of the lesson that came right, as a percent
  function accuracy(right, total) {
    return total ? Math.round((100 * right) / total) : 0;
  }
  // copies of the same word on two devices: the higher box wins; lessons keep the earlier time; the later review day wins
  function mergeWords(a, b) {
    var x = cleanState(a),
      y = cleanState(b),
      out = { words: {}, lessons: {}, rev: {} };
    [x, y].forEach(function (s) {
      Object.keys(s.words).forEach(function (k) {
        var r = s.words[k],
          o = out.words[k];
        if (!isObj(r)) return;
        if (!o || (r.box || 0) > (o.box || 0)) out.words[k] = JSON.parse(JSON.stringify(r));
        else if ((r.box || 0) === (o.box || 0)) {
          o.n = Math.max(o.n || 0, r.n || 0);
          o.ok = Math.max(o.ok || 0, r.ok || 0);
        }
      });
      Object.keys(s.lessons).forEach(function (id) {
        var l = s.lessons[id];
        if (!isObj(l)) return;
        var o = out.lessons[id];
        if (!o || (l.t || 0) < (o.t || 0)) out.lessons[id] = JSON.parse(JSON.stringify(l));
      });
      Object.keys(s.rev).forEach(function (k) {
        if (!out.rev[k] || s.rev[k] > out.rev[k]) out.rev[k] = s.rev[k];
      });
    });
    return out;
  }
  function seeded(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  function shuffle(list, rnd) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1)),
        t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }
  // words that sound the same: in a game where the child hears a word and taps it, they must never be offered together
  var SAME_SOUND = [["to", "too", "two"], ["for", "four"], ["no", "know"], ["by", "buy"], ["there", "their"], ["write", "right"], ["were", "where"]];
  function sameSound(a, b) {
    var x = wkey(a),
      y = wkey(b);
    if (x === y) return true;
    for (var i = 0; i < SAME_SOUND.length; i++) if (SAME_SOUND[i].indexOf(x) >= 0 && SAME_SOUND[i].indexOf(y) >= 0) return true;
    return false;
  }
  // how alike two words look: same first letter, same last letter, similar length
  function likeness(a, b) {
    var x = wkey(a),
      y = wkey(b),
      s = 0;
    if (x.charAt(0) === y.charAt(0)) s += 2;
    if (x.charAt(x.length - 1) === y.charAt(y.length - 1)) s += 1;
    if (Math.abs(x.length - y.length) <= 1) s += 1;
    return s;
  }
  // two other words that look a bit like the target (from words the child has met), the same two every time for the same seed;
  // words from the lesson being learned (prefer) count a little extra, so the choices are the words most likely to be mixed up
  function distractors(target, pool, rnd, prefer, count) {
    count = count || 2;
    var c = pool.filter(function (w) {
      return !sameSound(w, target);
    });
    function score(w) {
      return likeness(target, w) + (prefer && prefer.indexOf(w) >= 0 ? 2 : 0);
    }
    c = shuffle(c, rnd); // ties come out in a different order each time
    c.sort(function (a, b) {
      return score(b) - score(a);
    });
    var top = shuffle(c.slice(0, count + 2), rnd);
    return top.slice(0, count);
  }
  // the words for a game: the ones that are due first, then others, each at most once, n of them at most
  function pickWords(due, others, n, rnd) {
    var out = [],
      used = {};
    shuffle(due, rnd).concat(shuffle(others, rnd)).forEach(function (w) {
      var k = wkey(w);
      if (out.length < n && !used[k]) {
        used[k] = 1;
        out.push(w);
      }
    });
    return out;
  }
  // The words a game may show: the ones the child has learned, plus the game's own words. Before enough words are learned
  // (fewer than min), the first lessons' words are added, so the choices are never words that have not been taught yet.
  function gamePool(learned, targets, fallback, min) {
    var out = [],
      used = {};
    function add(w) {
      var k = wkey(w);
      if (!used[k]) {
        used[k] = 1;
        out.push(w);
      }
    }
    learned.forEach(add);
    targets.forEach(add);
    if (out.length < min) fallback.forEach(add);
    return out;
  }
  // one round per word: the word and `wrong` look-alikes, shuffled (balloons: 3 wrong, plates: 2 wrong)
  function roundsFor(words, pool, rnd, wrong) {
    return words.map(function (w) {
      return { w: w, opts: shuffle([w].concat(distractors(w, pool, rnd, words, wrong)), rnd) };
    });
  }
  // split a sentence into tappable pieces; words are pieces with a key, the rest (punctuation) is not tappable
  function pieces(sentence) {
    var out = [],
      re = /[A-Za-z]+(?:['\u2019][A-Za-z]+)*|[^A-Za-z]+/g,
      m;
    while ((m = re.exec(sentence))) {
      out.push(/[A-Za-z]/.test(m[0]) ? { t: m[0], k: wkey(m[0]) } : { t: m[0] });
    }
    return out;
  }

  // the words of a sentence, as lower-case keys
  function tokensOf(sentence) {
    return pieces(sentence).filter(function (p) {
      return p.k;
    }).map(function (p) {
      return p.k;
    });
  }
  function overlap(a, b) {
    var tb = tokensOf(b);
    return tokensOf(a).filter(function (k) {
      return tb.indexOf(k) >= 0;
    }).length;
  }
  // picture quiz: the right word plus two others whose sentences share the most words with it (the ones easiest to mix up);
  // sentences is {word: sentence}, pool the words the child has met; returns the three words, shuffled
  function sentenceChoices(target, pool, sentences, rnd, confusable) {
    var c = pool.filter(function (w) {
      return wkey(w) !== wkey(target) && sentences[w] && !(confusable && confusable(target, w));
    });
    c = shuffle(c, rnd);
    c.sort(function (a, b) {
      return overlap(sentences[target], sentences[b]) - overlap(sentences[target], sentences[a]);
    });
    var picks = shuffle(c.slice(0, 5), rnd).slice(0, 2);
    return shuffle([target].concat(picks), rnd);
  }
  // Could the sentence of one word also fit the picture of the other? Then they must not be shown together as a choice.
  // kindsOf(word) lists what the picture shows; nouns are the picture nouns the sentences may use.
  var PRON = { i: 1, you: 1, he: 1, she: 1, it: 1, we: 1, they: 1, me: 1 },
    ARTICLE = { a: 1, the: 1, my: 1, our: 1, this: 1, that: 1 };
  function shape(sentence) {
    return tokensOf(sentence).filter(function (k) {
      return !ARTICLE[k];
    }).map(function (k) {
      return PRON[k] ? "X" : k;
    }).join(" ");
  }
  function blockedTokens(kinds, nouns) {
    var out = {};
    kinds.forEach(function (k) {
      var cand = k === "kid" ? ["boy", "girl", "sam", "baby"] : k === "mom" ? ["mom"] : [k, k + "s"];
      cand.forEach(function (t) {
        if (nouns.indexOf(t) >= 0) out[t] = 1;
      });
    });
    return out;
  }
  function makeConfusable(sentences, kindsOf, nouns) {
    return function (a, b) {
      if (shape(sentences[a]) === shape(sentences[b])) return true;
      var ba = blockedTokens(kindsOf(a), nouns),
        bb = blockedTokens(kindsOf(b), nouns);
      return (
        tokensOf(sentences[a]).some(function (t) {
          return bb[t];
        }) ||
        tokensOf(sentences[b]).some(function (t) {
          return ba[t];
        })
      );
    };
  }
  // up to max words that cannot be mixed up with each other (at least min, adding the rest if need be)
  function compatibleSubset(words, confusable, max, min) {
    var out = [];
    words.forEach(function (w) {
      if (out.length < max && !out.some(function (x) { return confusable(x, w); })) out.push(w);
    });
    words.forEach(function (w) {
      if (out.length < min && out.indexOf(w) < 0) out.push(w);
    });
    return out;
  }
  // memory game: a picture card and a sentence card for each word, shuffled
  function memoryCards(words, rnd) {
    var cards = [];
    words.forEach(function (w) {
      cards.push({ id: wkey(w), kind: "pic", w: w });
      cards.push({ id: wkey(w), kind: "txt", w: w });
    });
    return shuffle(cards, rnd);
  }
  function isPair(a, b) {
    return !!a && !!b && a.id === b.id && a.kind !== b.kind;
  }

  /* ---- stages, units, today's plan and the word wall (pure) ---- */
  function findLesson(lessons, id) {
    for (var i = 0; i < lessons.length; i++) if (lessons[i].id === id) return lessons[i];
    return null;
  }
  // a unit is a few lessons: how many are done, its words and how many of them the child knows
  function unitProgress(unit, lessons, state) {
    var done = 0,
      words = [];
    unit.lessons.forEach(function (id) {
      var l = findLesson(lessons, id);
      if (l) words = words.concat(l.words);
      if (state.lessons[id]) done++;
    });
    return { done: done, total: unit.lessons.length, words: words, known: knownCount(state, words), complete: done === unit.lessons.length };
  }
  // the unit to show open: the first one that is not finished (the last one when all are)
  function currentUnit(units, lessons, state) {
    for (var i = 0; i < units.length; i++) if (!unitProgress(units[i], lessons, state).complete) return units[i];
    return units[units.length - 1];
  }
  function unitOf(units, lessonId) {
    for (var i = 0; i < units.length; i++) if (units[i].lessons.indexOf(lessonId) >= 0) return units[i];
    return null;
  }
  function nextLesson(lessons, state) {
    for (var i = 0; i < lessons.length; i++) if (!state.lessons[lessons[i].id]) return lessons[i].id;
    return 0;
  }
  // what "Today's words" does: review the words that are ready first (at most 10), then the next lesson; when every lesson is done, play
  function todayPlan(state, lessons, today) {
    var due = dueWords(state, today).length,
      next = nextLesson(lessons, state);
    return { kind: due ? "review" : next ? "lesson" : "done", due: due, review: Math.min(10, due), lesson: next };
  }
  // new = never met, learning = met but not yet known, known = box 3 or more; due = ready for review today
  function wordStatus(rec, today) {
    return { s: !rec ? "new" : isKnown(rec) ? "known" : "learning", due: !!rec && (rec.box || 0) > 0 && (rec.due || today) <= today };
  }

  // 1 to 3 stars for a finished lesson from how many words were right on the first try (0 when it is not done)
  function lessonStars(rec) {
    if (!rec) return 0;
    var a = rec.acc || 0;
    return a >= 90 ? 3 : a >= 70 ? 2 : 1;
  }

  // the dotted path through the nodes of a unit's trail: row i has its node at 26% (even rows) or 74% (odd rows) of the width,
  // 70 down from the top of the row; w is the width of the drawing and rowH the height of one row
  function trailPath(count, rowH, w) {
    var xs = [Math.round(0.26 * w), Math.round(0.74 * w)],
      d = "";
    for (var i = 0; i < count; i++) {
      var x = xs[i % 2],
        y = i * rowH + 70;
      if (!i) d += "M" + x + " " + y;
      else {
        var px = xs[(i - 1) % 2],
          py = (i - 1) * rowH + 70,
          my = Math.round((py + y) / 2);
        d += " C" + px + " " + my + " " + x + " " + my + " " + x + " " + y;
      }
    }
    return d;
  }

  // how the pet feels after `fed` of `total` bites: worried at first, then okay (a gentle smile), happy, in love, and excited when full.
  // It only ever gets better (the face is a function of the bites so far, never of the last answer).
  function feelFor(fed, total) {
    if (!(fed > 0)) return "hungry";
    if (fed >= total) return "excited";
    var step = Math.floor((3 * fed) / total);
    return step === 0 ? "okay" : step === 1 ? "happy" : "love";
  }

  // the chest of one unit of one island: opened the first time its challenge is finished (rev["chest<island>-<unit>"] holds when)
  function chestKey(island, unit) {
    return "chest" + island + "-" + unit;
  }
  function claimChest(state, island, unit, now) {
    var k = chestKey(island, unit),
      first = !state.rev[k];
    if (first) state.rev[k] = now || Date.now();
    return first;
  }

  /* ---- the spelling and speed games for older children (pure) ---- */
  // the letters of a word as typed: lower case, a curly apostrophe made straight
  function spellForm(w) {
    return String(w).toLowerCase().replace(/\u2019/g, "'");
  }
  // words a spelling game can use: at least two letters ("I" and "a" cannot be spelled)
  function spellable(words) {
    return words.filter(function (w) {
      return wkey(w).length >= 2;
    });
  }
  // Wordle-style marks for one try: "ok" = the right letter in the right place, "near" = the letter is in the word but elsewhere
  // (as many times as it is in the word), "no" = it is not in the word. Both words must have the same length.
  function spellCheck(guess, answer) {
    var g = spellForm(guess).split(""),
      a = spellForm(answer).split(""),
      out = [],
      left = {},
      i;
    for (i = 0; i < a.length; i++) out.push("no");
    for (i = 0; i < a.length; i++) {
      if (g[i] === a[i]) out[i] = "ok";
      else left[a[i]] = (left[a[i]] || 0) + 1;
    }
    for (i = 0; i < a.length; i++)
      if (out[i] !== "ok" && g[i] && left[g[i]] > 0) {
        out[i] = "near";
        left[g[i]]--;
      }
    return out;
  }
  // speed game: a right answer is worth 10 points times the multiplier of the streak (this answer included)
  function rushMult(streak) {
    return streak >= 15 ? 4 : streak >= 10 ? 3 : streak >= 5 ? 2 : 1;
  }
  function rushPoints(streak) {
    return 10 * rushMult(streak);
  }
  // the next word of the speed game: sometimes one that is due for review, never one of the last few (when there are enough words)
  function rushPick(pool, recent, rnd, due) {
    var src = due && due.length && rnd() < 0.4 ? due : pool,
      c = src.filter(function (w) {
        return recent.indexOf(wkey(w)) < 0;
      });
    if (!c.length) c = pool.filter(function (w) {
      return recent.indexOf(wkey(w)) < 0;
    });
    if (!c.length) c = pool;
    return c[Math.floor(rnd() * c.length)];
  }

  // the lessons of the later stages go after the ones of stage 1 (ids keep counting: 19-38 are stage 2, units 6-10) and that stage becomes ready
  function mergeData(d1, d2) {
    if (!d1 || !d2) return d1;
    var out = {}, k;
    for (k in d1) out[k] = d1[k];
    out.lessons = d1.lessons.concat(d2.lessons || []);
    out.units = d1.units.concat(d2.units || []);
    out.words = {};
    for (k in d1.words) out.words[k] = d1.words[k];
    for (k in d2.words || {}) out.words[k] = d2.words[k];
    out.nouns = (d1.nouns || []).concat((d2.nouns || []).filter(function (n) {
      return (d1.nouns || []).indexOf(n) < 0;
    }));
    out.stages = (d1.stages || []).map(function (st) {
      var o = {};
      for (var j in st) o[j] = st[j];
      if (o.id === d2.stage) o.ready = true;
      return o;
    });
    return out;
  }

  var core = {
    spellForm: spellForm,
    spellable: spellable,
    spellCheck: spellCheck,
    rushMult: rushMult,
    rushPoints: rushPoints,
    rushPick: rushPick,
    mergeData: mergeData,
    chestKey: chestKey,
    claimChest: claimChest,
    feelFor: feelFor,
    trailPath: trailPath,
    lessonStars: lessonStars,
    findLesson: findLesson,
    unitProgress: unitProgress,
    currentUnit: currentUnit,
    unitOf: unitOf,
    nextLesson: nextLesson,
    todayPlan: todayPlan,
    wordStatus: wordStatus,
    pickWords: pickWords,
    gamePool: gamePool,
    roundsFor: roundsFor,
    sentenceChoices: sentenceChoices,
    makeConfusable: makeConfusable,
    compatibleSubset: compatibleSubset,
    shape: shape,
    memoryCards: memoryCards,
    isPair: isPair,
    overlap: overlap,
    KEY: KEY,
    INT: INT,
    dayStr: dayStr,
    wkey: wkey,
    cleanState: cleanState,
    applyResult: applyResult,
    isKnown: isKnown,
    knownCount: knownCount,
    dueWords: dueWords,
    accuracy: accuracy,
    mergeWords: mergeWords,
    seeded: seeded,
    shuffle: shuffle,
    likeness: likeness,
    sameSound: sameSound,
    distractors: distractors,
    pieces: pieces,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = core;
  if (!root || !root.document) return;

  /* ------------------------------------------------------------------ browser part */
  var D = mergeData(root.SW_DATA, root.SW_DATA2),
    ls = null;
  try {
    ls = root.localStorage;
  } catch (e) {}
  var hooks = { award: null, toast: null, burst: null, openBook: null, pet: null, feedPet: null, gift: null, wear: null, track: null };
  var ov = null,
    box = null,
    audio = null,
    styled = false;

  function readState() {
    var raw = null;
    try {
      raw = JSON.parse(ls.getItem(KEY));
    } catch (e) {}
    return cleanState(raw);
  }
  function writeState(s) {
    try {
      ls.setItem(KEY, JSON.stringify(s));
    } catch (e) {}
  }
  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function allWords() {
    var out = [];
    D.lessons.forEach(function (l) {
      out = out.concat(l.words);
    });
    return out;
  }
  function lessonOf(id) {
    return D.lessons[id - 1];
  }
  // the little picture of a word's sentence (see sightwords-art.js); small = a smaller one for the practice screens
  function art(w, small) {
    return root.SWArt && root.SWArt.has(w) ? '<div class="sw-pic' + (small ? " sw-small" : "") + '">' + root.SWArt.scene(w) + "</div>" : "";
  }
  var conf = null;
  function confusable(a, b) {
    if (!conf) {
      var sents = {};
      D.lessons.forEach(function (l) {
        l.words.forEach(function (w) {
          sents[w] = D.words[w].s;
        });
      });
      conf = makeConfusable(sents, function (w) {
        return root.SWArt && root.SWArt.kinds ? root.SWArt.kinds(w) : [];
      }, D.nouns || []);
    }
    return conf(a, b);
  }
  var winfo = null;
  function wordInfo(w) {
    if (!winfo) {
      winfo = {};
      Object.keys(D.words).forEach(function (k) {
        winfo[wkey(k)] = D.words[k];
      });
    }
    return D.words[w] || winfo[wkey(w)] || null;
  }
  // stages: the lessons, units and words of one stage (a lesson without a stage is stage 1)
  function stageOfLesson(id) {
    var l = D.lessons[id - 1];
    return (l && l.stage) || 1;
  }
  function lessonsOf(sid) {
    return D.lessons.filter(function (l) {
      return (l.stage || 1) === sid;
    });
  }
  function unitsOf(sid) {
    return D.units.filter(function (u) {
      return (u.stage || 1) === sid;
    });
  }
  function stageWordsOf(sid) {
    var out = [];
    lessonsOf(sid).forEach(function (l) {
      out = out.concat(l.words);
    });
    return out;
  }
  function stageInfo(sid) {
    for (var i = 0; i < D.stages.length; i++) if (D.stages[i].id === sid) return D.stages[i];
    return D.stages[0];
  }
  var mapStage = 1; // the stage whose map is open

  // Anonymous usage numbers, written into the same table as the book opens (see stats.js): the name of the event, what it is about
  // (book_id column), a short detail (book_title) and a kind (category). Nothing here says who the child is.
  var gameTag = "game"; // "challenge" while a unit challenge (the chest) is being played
  function stageTag(sid) {
    return "s" + (sid || 1);
  }
  function lessonTag(id) {
    return stageTag(stageOfLesson(id)) + "-l" + id;
  }
  function trk(name, id, detail, kind) {
    try {
      if (hooks.track) hooks.track(name, { book_id: String(id).slice(0, 40), book_title: String(detail || "").slice(0, 40), category: kind || "" });
    } catch (e) {}
  }

  // the spelling and speed games keep a key listener or a clock: stop them when the child leaves, and say where the child left
  function stopRun() {
    if (run && run.stop) {
      var f = run.stop;
      run.stop = null;
      if (!run.done && (run.mode === "spell" || run.mode === "rush")) trk("sw_game_quit", run.mode, run.mode === "rush" ? (run.score || 0) + " pts" : "word " + ((run.at || 0) + 1), "game");
      run.done = true;
      try {
        f();
      } catch (e) {}
    }
  }

  /* ---- sound ---- */
  function play(kind, w, then) {
    var src = "sightwords/audio/" + (kind === "s" ? "s-" : "w-") + wkey(w) + ".mp3?v=" + AUDIO_V,
      text = kind === "s" ? (wordInfo(w) || {}).s || w : w;
    try {
      if (audio) {
        audio.onended = null;
        audio.pause();
      }
      audio = new Audio(src);
      audio.onerror = function () {
        speakFallback(text, then);
      };
      if (then) audio.onended = then;
      var p = audio.play();
      if (p && p.catch)
        p.catch(function () {
          speakFallback(text, then);
        });
    } catch (e) {
      speakFallback(text, then);
    }
  }
  function speakFallback(text, then) {
    var spoke = false;
    try {
      if (root.speechSynthesis && root.SpeechSynthesisUtterance) {
        root.speechSynthesis.cancel();
        var u = new root.SpeechSynthesisUtterance(text);
        u.lang = "en-US";
        u.rate = 0.85;
        if (then) u.onend = then;
        root.speechSynthesis.speak(u);
        spoke = true;
      }
    } catch (e) {}
    if (!spoke && then) setTimeout(then, 600);
  }
  // stop whatever is being said (when the child leaves a page)
  function stopSound() {
    try {
      if (audio) {
        audio.onended = null;
        audio.pause();
      }
      if (root.speechSynthesis) root.speechSynthesis.cancel();
    } catch (e) {}
  }
  // After the sentence is read to the child, go on only when the clip has finished (plus a short pause), never in the middle of it.
  // minMs keeps the green answer on screen for a moment even when the sentence is short; a clip that never ends does not leave the child stuck.
  function readThenNext(w, minMs) {
    var r0 = run,
      i0 = run.i,
      started = Date.now(),
      done = false,
      guard;
    function go() {
      if (done) return;
      done = true;
      clearTimeout(guard);
      var wait = Math.max(0, minMs - (Date.now() - started)) + 600;
      setTimeout(function () {
        if (run === r0 && run.i === i0 && ov && ov.style.display !== "none" && document.getElementById("swQuit")) nextStep();
      }, wait);
    }
    play("s", w, go);
    guard = setTimeout(go, 8000);
  }
  function sfx(name) {
    try {
      if (root.PetSound && root.PetSound.play) root.PetSound.play(name);
    } catch (e) {}
  }

  /* ---- style ---- */
  function injectStyle() {
    if (styled) return;
    styled = true;
    var st = document.createElement("style");
    st.textContent =
      "#swOverlay{position:fixed;inset:0;z-index:3400;background:#F4FAFF;overflow:auto;-webkit-overflow-scrolling:touch;display:none;font-family:'Nunito',ui-rounded,sans-serif;color:#1E2A4A}" +
      "#swOverlay *{box-sizing:border-box}" +
      "#swOverlay .sw-wrap{max-width:900px;margin:0 auto;padding:18px 18px 60px}" +
      "#swOverlay .sw-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}" +
      "#swOverlay button{font:inherit;color:inherit;cursor:pointer;border:0;background:none}" +
      "#swOverlay .sw-back{background:#fff;font-weight:800;padding:10px 18px;border-radius:999px;box-shadow:0 5px 0 #9FB6CC}" +
      "#swOverlay h1{font-family:'Fredoka',sans-serif;font-weight:700;font-size:34px;line-height:1.1;margin:0}" +
      "#swOverlay .sw-sub{font-weight:700;color:#4A5878;margin:4px 0 14px}" +
      "#swOverlay .sw-chips{display:flex;flex-wrap:wrap;gap:8px 10px;margin-bottom:16px}" +
      "#swOverlay .sw-chip{display:inline-flex;align-items:center;gap:6px;background:#FFF1C2;border:3px solid #FFC93C;border-radius:999px;padding:5px 14px;font-weight:800}" +
      "#swOverlay .sw-chip.sw-rev{background:#EFE9FF;border-color:#6A48E8;color:#4A2FB8;cursor:pointer;box-shadow:0 4px 0 #4A2FB8}" +
      "#swOverlay .sw-chip.sw-rev[disabled]{opacity:.5;box-shadow:none;cursor:default}" +
      "#swOverlay .sw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}" +
      "#swOverlay .sw-bar{height:12px;border-radius:99px;background:#E6EEF7;overflow:hidden;margin:4px 0 16px}" +
      "#swOverlay .sw-bar i{display:block;height:100%;background:#35B779;border-radius:99px;transition:width .3s}" +
      "#swOverlay .sw-card{background:#fff;border-radius:34px;padding:26px 22px 24px;box-shadow:0 8px 0 #C9D7E8;text-align:center}" +
      "#swOverlay .sw-kind{display:inline-block;background:#6A48E8;color:#fff;border-radius:999px;font-weight:800;font-size:13px;letter-spacing:.5px;text-transform:uppercase;padding:5px 16px;margin-bottom:10px}" +
      "#swOverlay .sw-big{font-family:'Fredoka',sans-serif;font-weight:700;font-size:88px;line-height:1.05;margin:6px 0 10px;word-break:break-word}" +
      "#swOverlay .sw-sent{font-weight:800;font-size:28px;line-height:1.5;margin:10px 0 6px}" +
      "#swOverlay .sw-sent b,#swOverlay .sw-sent .sw-hl{color:#D93B1E;background:#FFE9B0;border-radius:10px;padding:0 8px}" +
      "#swOverlay .sw-say{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#6A48E8;color:#fff;font-weight:800;font-size:18px;padding:12px 22px;border-radius:999px;box-shadow:0 5px 0 #4A2FB8;margin:6px 6px}" +
      "#swOverlay .sw-say.sw-alt{background:#fff;color:#4A2FB8;box-shadow:0 5px 0 #C9C0F5}" +
      "#swOverlay .sw-say svg{width:22px;height:22px}" +
      "#swOverlay .sw-go{background:#35B779;color:#fff;font-weight:800;font-size:20px;padding:14px 34px;border-radius:999px;box-shadow:0 6px 0 #1F8A55;margin-top:14px}" +
      "#swOverlay .sw-opts{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:16px}" +
      "#swOverlay .sw-opt{background:#F4FAFF;border:4px solid #D5E3F0;border-radius:24px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:40px;padding:12px 26px;min-width:110px;box-shadow:0 5px 0 #C9D7E8}" +
      "#swOverlay .sw-opt:hover{border-color:#6A48E8}" +
      "#swOverlay .sw-opt.sw-ok{background:#DFF5E7;border-color:#35B779}" +
      "#swOverlay .sw-opt.sw-bad{background:#FFE3DE;border-color:#FF6B4A;animation:swshake .35s}" +
      "#swOverlay .sw-tok{background:#F4FAFF;border:3px solid #D5E3F0;border-radius:16px;font-weight:800;font-size:30px;padding:6px 14px;margin:5px;box-shadow:0 4px 0 #C9D7E8}" +
      "#swOverlay .sw-tok.sw-used{opacity:.25;box-shadow:none}" +
      "#swOverlay .sw-slots{min-height:64px;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;border-bottom:4px dashed #C9D7E8;padding:8px 4px 12px;margin:10px 0}" +
      "#swOverlay .sw-slots .sw-tok{background:#EFE9FF;border-color:#6A48E8}" +
      "#swOverlay .sw-msg{min-height:30px;font-weight:800;font-size:18px;margin-top:12px;color:#4A5878}" +
      "#swOverlay .sw-msg.sw-good{color:#2E6B43}" +
      "#swOverlay .sw-msg.sw-bad{color:#B3361E}" +
      "#swOverlay .sw-words{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0}" +
      "#swOverlay .sw-words span{background:#DFF5E7;color:#2E6B43;border-radius:999px;padding:4px 14px;font-weight:800;font-size:18px}" +
      "#swOverlay .sw-words span.sw-miss{background:#FFE3DE;color:#B3361E}" +
      "#swOverlay .sw-books{margin-top:14px;text-align:left}" +
      "#swOverlay .sw-books a{display:block;background:#FFF6D6;border-radius:18px;padding:10px 16px;margin:8px 0;font-weight:800;color:#1E2A4A;text-decoration:none;box-shadow:0 4px 0 #E8B84A}" +
      "#swOverlay .sw-pic{max-width:340px;margin:2px auto 12px;border-radius:18px;overflow:hidden;box-shadow:0 5px 0 #C9D7E8;line-height:0}" +
      "#swOverlay .sw-pic.sw-small{max-width:250px;margin-bottom:8px}" +
      "#swOverlay .sw-pic svg{display:block;width:100%;height:auto}" +
      "#swOverlay .sw-orow{display:flex;align-items:stretch;gap:8px;margin:10px 0}" +
      "#swOverlay .sw-spk{flex:none;width:54px;border-radius:18px;background:#EFE9FF;color:#4A2FB8;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 0 #C9C0F5}" +
      "#swOverlay .sw-spk svg{width:24px;height:24px}" +
      "#swOverlay .sw-sopt{flex:1;text-align:left;background:#F4FAFF;border:4px solid #D5E3F0;border-radius:20px;font-weight:800;font-size:24px;padding:12px 18px;box-shadow:0 5px 0 #C9D7E8}" +
      "#swOverlay .sw-sopt:hover{border-color:#6A48E8}" +
      "#swOverlay .sw-sopt.sw-ok{background:#DFF5E7;border-color:#35B779}" +
      "#swOverlay .sw-sopt.sw-bad{background:#FFE3DE;border-color:#FF6B4A;animation:swshake .35s}" +
      "#swOverlay .sw-chip.sw-game{background:#FFE9B0;border-color:#E8B84A;cursor:pointer;box-shadow:0 4px 0 #E8B84A}" +
      "#swOverlay .sw-mem{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:14px 0 6px}" +
      "#swOverlay .sw-mem.sw-c5{grid-template-columns:repeat(5,minmax(0,1fr))}" +
      "#swOverlay .sw-mc{position:relative;height:118px;border-radius:16px;overflow:hidden;background:#6A48E8;box-shadow:0 5px 0 #4A2FB8;padding:0}" +
      "#swOverlay .sw-mc .sw-mback{display:flex;width:100%;height:100%;align-items:center;justify-content:center;color:#FFE066;font-family:'Fredoka',sans-serif;font-weight:700;font-size:40px;background:repeating-linear-gradient(45deg,#6A48E8 0 10px,#7A5AF0 10px 20px)}" +
      "#swOverlay .sw-mc .sw-mface{display:none;width:100%;height:100%;background:#fff;align-items:center;justify-content:center;text-align:center;font-weight:800;font-size:18px;line-height:1.25;padding:6px;color:#1E2A4A}" +
      "#swOverlay .sw-mc .sw-mface svg{width:100%;height:100%}" +
      "#swOverlay .sw-mc.sw-up .sw-mback{display:none}" +
      "#swOverlay .sw-mc.sw-up .sw-mface{display:flex}" +
      "#swOverlay .sw-mc.sw-up{box-shadow:0 0 0 4px #FFC93C}" +
      "#swOverlay .sw-mc.sw-pair{box-shadow:0 0 0 4px #35B779;animation:swpop .4s}" +
      "@keyframes swpop{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}" +
      "#swOverlay .sw-sky{position:relative;height:290px;border-radius:26px;background:linear-gradient(#BFE6FF,#EAF7FF 70%,#D5F0C8);overflow:hidden;margin:12px 0;box-shadow:inset 0 0 0 4px #fff}" +
      "#swOverlay .sw-bal{position:absolute;bottom:6px;width:22%;max-width:132px;padding:0;animation:swfloat 3.4s ease-in-out infinite alternate;transform-origin:50% 90%}" +
      "#swOverlay .sw-bal svg{display:block;width:100%;height:auto}" +
      "#swOverlay .sw-bw{position:absolute;left:0;right:0;top:25%;text-align:center;font-family:'Fredoka',sans-serif;font-weight:700;font-size:30px;line-height:1;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.28)}" +
      "#swOverlay .sw-bal.sw-pop{visibility:hidden;pointer-events:none}" +
      "#swOverlay .sw-boom{position:absolute;width:0;height:0;pointer-events:none;z-index:6}" +
      "#swOverlay .sw-boom .sw-flash{position:absolute;left:-70px;top:-70px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,#fff 0,#FFF3B0 38%,rgba(255,200,60,0) 70%)}" +
      "#swOverlay .sw-boom .sw-star{position:absolute;left:-62px;top:-62px;width:124px;height:124px}" +
      "#swOverlay .sw-boom .sw-ptxt{position:absolute;left:-70px;top:-30px;width:140px;text-align:center;font-family:'Fredoka',sans-serif;font-weight:700;font-size:40px;line-height:1;color:#FFE066;-webkit-text-stroke:2px #C0392B;text-shadow:0 3px 0 #C0392B}" +
      "#swOverlay .sw-boom .sw-shard{position:absolute;left:-14px;top:-14px;width:28px;height:28px}" +
      "#swOverlay .sw-sky.sw-shake{animation:swshake .22s}" +
      "#swOverlay .sw-bal.sw-away{animation:swaway .7s ease-in forwards !important;pointer-events:none}" +
      "#swOverlay .sw-bal.sw-wob{animation:swshake .35s !important}" +
      "#swOverlay .sw-bal.sw-hint{animation:swhint .6s ease-in-out infinite alternate !important}" +
      "@keyframes swfloat{from{transform:translateY(0) rotate(-2deg)}to{transform:translateY(-34px) rotate(2deg)}}" +
      "@keyframes swpopb{0%{transform:scale(1);opacity:1}60%{transform:scale(1.3);opacity:.9}100%{transform:scale(1.6);opacity:0}}" +
      "@keyframes swaway{to{transform:translateY(-300px);opacity:0}}" +
      "@keyframes swhint{from{transform:scale(1)}to{transform:scale(1.12)}}" +
      "@keyframes swrise{from{transform:translateY(300px)}to{transform:translateY(0)}}" +
      "#swOverlay .sw-sky.sw-new .sw-bal{animation:swrise .7s ease-out,swfloat 3.4s ease-in-out .7s infinite alternate}" +
      "#swOverlay .sw-pet{width:210px;margin:0 auto;transition:transform .25s}" +
      "#swOverlay .sw-pet svg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-pet.sw-jump{animation:swjump .5s}" +
      "@keyframes swjump{0%{transform:none}40%{transform:translateY(-22px) scale(1.04)}100%{transform:none}}" +
      "#swOverlay .sw-plates{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:14px}" +
      "#swOverlay .sw-plate{background:radial-gradient(ellipse at 50% 35%,#fff,#EEF3FA);border:5px solid #C9D7E8;border-radius:50%/42%;font-family:'Fredoka',sans-serif;font-weight:700;font-size:38px;padding:22px 34px;min-width:132px;box-shadow:0 8px 0 #C9D7E8,inset 0 -6px 0 rgba(150,170,200,.18);transition:transform .35s,opacity .35s}" +
      "#swOverlay .sw-plate:hover{border-color:#6A48E8}" +
      "#swOverlay .sw-plate.sw-ok{background:#DFF5E7;border-color:#35B779}" +
      "#swOverlay .sw-plate.sw-bad{background:#FFE3DE;border-color:#FF6B4A;animation:swshake .35s}" +
      "#swOverlay .sw-plate.sw-eaten{transform:translateY(-120px) scale(.2);opacity:0}" +
      "#swOverlay .sw-tummy{max-width:340px;margin:8px auto 4px}" +
      "#swOverlay .sw-stage{position:relative;width:100%;max-width:380px;margin:0 auto;padding-top:22px}" +
      "#swOverlay .sw-stage .sw-pet{position:relative;z-index:2}" +
      "#swOverlay .sw-pet.sw-dance{animation:swdance 1.5s ease-in-out 4}" +
      "#swOverlay .sw-pet.sw-hop{animation:swjump .6s ease-out 1}" +
      "#swOverlay .sw-pf{position:absolute;bottom:34px;width:26px;height:26px;opacity:0;z-index:1;animation:swup 2.6s ease-out infinite}" +
      "#swOverlay .sw-pf svg{display:block;width:100%;height:100%}" +
      "@keyframes swdance{0%{transform:translateY(0) rotate(0) scale(1,1)}12%{transform:translateY(0) rotate(-9deg) scale(1.06,.94)}25%{transform:translateY(-28px) rotate(0) scale(.96,1.06)}37%{transform:translateY(0) rotate(9deg) scale(1.06,.94)}50%{transform:translateY(-28px) rotate(0) scale(.96,1.06)}62%{transform:translateY(0) rotate(-8deg) scale(1.04,.96)}75%{transform:translateY(-16px) rotate(8deg)}88%{transform:translateY(0) rotate(0) scale(1.04,.96)}100%{transform:translateY(0) rotate(0) scale(1,1)}}" +
      "@keyframes swup{0%{transform:translateY(30px) scale(.5) rotate(0);opacity:0}18%{opacity:1}100%{transform:translateY(-190px) scale(1.15) rotate(24deg);opacity:0}}" +
      "@keyframes swshake{0%,100%{transform:none}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}" +
      "#swOverlay .sw-home{max-width:520px;margin:0 auto}" +
      "#swOverlay .sw-starpill{display:inline-flex;align-items:center;background:#FFF1C2;border:3px solid #FFC93C;border-radius:999px;padding:3px 14px 3px 8px;font-weight:800;font-size:17px}" +
      "#swOverlay .sw-starpill svg{width:22px;height:22px;color:#FFC93C;margin-right:5px}" +
      "#swOverlay .sw-ttl{display:flex;align-items:center;margin:2px 0 14px}" +
      "#swOverlay .sw-aa{flex:none;width:46px;height:46px;border-radius:15px;background:#6A48E8;color:#fff;display:grid;place-items:center;font-family:'Fredoka',sans-serif;font-weight:700;font-size:22px;box-shadow:0 5px 0 #4A2FB8;margin-right:12px;transform:rotate(-6deg)}" +
      "#swOverlay .sw-bkh{flex:none;width:48px;margin-right:12px}" +
      "#swOverlay .sw-bkh svg{display:block;width:100%;height:auto}" +
      "#swOverlay .sw-ttl h1{font-size:30px}" +
      "#swOverlay .sw-ttl .sw-sub{margin:2px 0 0;font-size:13px}" +
      "#swOverlay .sw-hero{position:relative;overflow:hidden;border-radius:32px;box-shadow:0 8px 0 #8FBCDD;padding:14px 14px 20px;min-height:340px;background:#BFE6FF;margin-bottom:24px}" +
      "#swOverlay .sw-herobg{position:absolute;left:0;top:0;right:0;bottom:0}" +
      "#swOverlay .sw-herobg svg{display:block;width:100%;height:100%}" +
      "#swOverlay .sw-hero>.sw-tpill,#swOverlay .sw-hero>.sw-hrow,#swOverlay .sw-hero>.sw-start{position:relative}" +
      "#swOverlay .sw-tpill{display:inline-block;background:#fff;border-radius:999px;padding:5px 14px;font-weight:800;font-size:13px;color:#4A2FB8}" +
      "#swOverlay .sw-hrow{display:flex;align-items:flex-end;margin-top:6px}" +
      "#swOverlay .sw-hpet{flex:none;width:44%;max-width:190px;transform-origin:50% 100%;animation:swbobp 3s ease-in-out infinite}" +
      "#swOverlay .sw-hpet svg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-hsay{flex:1;min-width:0;margin-left:14px;padding-bottom:26px}" +
      "#swOverlay .sw-bub{position:relative;background:#fff;border-radius:22px;padding:10px 16px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:19px;line-height:1.25}" +
      "#swOverlay .sw-bub:before{content:'';position:absolute;left:-10px;bottom:16px;border:10px solid transparent;border-left-width:0;border-right-color:#fff}" +
      "#swOverlay .sw-bub b{display:block;color:#D93B1E}" +
      "#swOverlay .sw-wchs{margin-top:10px}" +
      "#swOverlay .sw-wch{display:inline-block;border-radius:999px;padding:3px 12px;font-weight:800;font-size:14px;margin:0 6px 6px 0}" +
      "#swOverlay .sw-start{display:flex;align-items:center;justify-content:center;width:88%;margin:12px auto 0;background:#2FA865;color:#fff;font-family:'Fredoka',sans-serif;font-weight:700;font-size:22px;padding:12px 20px;border-radius:999px;border:4px solid #fff;box-shadow:0 6px 0 #1F7A4A;animation:swpulse 2.2s ease-in-out infinite}" +
      "#swOverlay .sw-start svg{width:22px;height:22px;margin-right:10px}" +
      "#swOverlay .sw-cl1{animation:swdrift 16s ease-in-out infinite alternate}" +
      "#swOverlay .sw-cl2{animation:swdrift 21s ease-in-out infinite alternate-reverse}" +
      "#swOverlay .sw-sect{font-family:'Fredoka',sans-serif;font-weight:700;font-size:21px;margin:6px 0 12px}" +
      "#swOverlay .sw-wst{font-size:18px;margin:18px 2px 8px}" +
      "#swOverlay .sw-chal{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:26px}" +
      "#swOverlay .sw-ct{display:block;text-align:center;border-radius:24px;padding:10px 6px 12px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:17px;line-height:1.15;color:#fff;background:linear-gradient(150deg,#34478F,#1E2A55);box-shadow:0 6px 0 #121A38;transition:transform .15s}" +
      "#swOverlay .sw-ct:hover{transform:translateY(-3px)}" +
      "#swOverlay .sw-ct small{display:block;font-size:13px;font-weight:700;margin-top:3px;color:#B7C5F5}" +
      "#swOverlay .sw-ct.sw-c2 small{color:#FFD23F}" +
      "#swOverlay .sw-ct .sw-gi{width:64%}" +
      "#swOverlay .sw-dk{background:linear-gradient(170deg,#26356F,#18224A);box-shadow:0 8px 0 #0E1533;color:#fff}" +
      "#swOverlay .sw-dk .sw-kind{background:#2DD4BF;color:#10264A}" +
      "#swOverlay .sw-dk .sw-big{color:#FFD23F}" +
      "#swOverlay .sw-dk .sw-sent{color:#DCE5FF}" +
      "#swOverlay .sw-dk .sw-msg{color:#C5D3FF}" +
      "#swOverlay .sw-dk .sw-msg.sw-good{color:#7CF0A8}" +
      "#swOverlay .sw-dk .sw-msg.sw-bad{color:#FFB199}" +
      "#swOverlay .sw-dk .sw-say.sw-alt{background:#2E3F7A;color:#DCE5FF;box-shadow:0 5px 0 #1A254F}" +
      "#swOverlay .sw-dk .sw-say{padding:9px 16px;font-size:16px}" +
      "#swOverlay .sw-ctx{font-weight:800;font-size:21px;line-height:1.5;color:#DCE5FF;margin:4px 4px 0}" +
      "#swOverlay .sw-blank{display:inline-block;height:1em;border-bottom:4px solid #2DD4BF;vertical-align:-0.1em;margin:0 3px}" +
      "#swOverlay .sw-spic{width:132px;margin:6px auto 0}" +
      "#swOverlay .sw-spic .sw-pic{margin:0}" +
      "#swOverlay .sw-sprow{display:flex;justify-content:center;margin:12px 0 4px}" +
      "#swOverlay .sw-sl{flex:1 1 0;max-width:48px;min-width:26px;margin:0 3.5px;height:56px;display:flex;align-items:center;justify-content:center;border-radius:13px;border:3px solid #4A5FA8;background:#1A2650;color:#fff;font-family:'Fredoka',sans-serif;font-weight:700;font-size:30px;text-transform:lowercase;box-shadow:0 4px 0 #0E1533}" +
      "#swOverlay .sw-sl.cur{border-color:#2DD4BF;animation:swblink 1s infinite}" +
      "#swOverlay .sw-sl.ok{background:#2FBF71;border-color:#7CF0A8}" +
      "#swOverlay .sw-sl.near{background:#F5B83D;border-color:#FFD98A;color:#3D2A00}" +
      "#swOverlay .sw-sl.no{background:#5B6788;border-color:#8493B8}" +
      "#swOverlay .sw-sl.rev{background:#3D8BF2;border-color:#9CC6FF}" +
      "#swOverlay .sw-sl.apo{background:transparent;border-color:transparent;box-shadow:none;max-width:22px;min-width:14px;color:#FFD23F}" +
      "#swOverlay #swHist .sw-sprow{margin:5px 0 0}" +
      "#swOverlay #swHist .sw-sl{height:36px;font-size:20px;border-radius:9px;box-shadow:none;border-width:2px}" +
      "@keyframes swblink{50%{border-color:#4A5FA8}}" +
      "#swOverlay .sw-kb{margin-top:10px}" +
      "#swOverlay .sw-kr{display:flex;justify-content:center;margin:5px 0}" +
      "#swOverlay .sw-key{flex:1 1 0;max-width:40px;margin:0 2.5px;height:46px;border-radius:10px;background:#3A4D8F;color:#fff;font-family:'Fredoka',sans-serif;font-weight:700;font-size:19px;box-shadow:0 3px 0 #1A254F;text-transform:uppercase}" +
      "#swOverlay .sw-key.sw-kw{max-width:62px;font-size:22px;background:#5B6788}" +
      "#swOverlay .sw-key:active{transform:translateY(2px);box-shadow:0 1px 0 #1A254F}" +
      "#swOverlay .sw-hud{display:flex;align-items:center;margin:4px 0}" +
      "#swOverlay .sw-tbar{flex:1;height:16px;border-radius:8px;background:#0E1533;overflow:hidden}" +
      "#swOverlay .sw-tbar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#2DD4BF,#7CF0A8);border-radius:8px;transition:width .1s linear}" +
      "#swOverlay .sw-tbar i.low{background:linear-gradient(90deg,#FF6B4A,#FFB199)}" +
      "#swOverlay .sw-secs{font-family:'Fredoka',sans-serif;font-weight:700;font-size:26px;min-width:44px;margin-left:12px;text-align:right}" +
      "#swOverlay .sw-hud2{display:flex;align-items:baseline;justify-content:space-between;margin:2px 4px 8px}" +
      "#swOverlay .sw-score{font-family:'Fredoka',sans-serif;font-weight:700;font-size:42px;color:#FFD23F;line-height:1;min-width:90px;text-align:left}" +
      "#swOverlay .sw-combo{flex:1;margin:0 10px;font-weight:800;font-size:17px;color:#7CF0A8}" +
      "#swOverlay .sw-bestl{font-weight:800;font-size:14px;color:#B7C5F5}" +
      "#swOverlay .sw-rwrap{position:relative;min-height:56px}" +
      "#swOverlay .sw-plus{position:absolute;right:6px;top:2px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:30px;color:#7CF0A8;opacity:0;pointer-events:none}" +
      "#swOverlay .sw-plus.sw-plgo{animation:swplus .8s ease-out}" +
      "#swOverlay .sw-plus.sw-plbad{color:#FF8C6B}" +
      "@keyframes swplus{0%{opacity:1;transform:translateY(10px) scale(.8)}30%{opacity:1;transform:translateY(0) scale(1.15)}100%{opacity:0;transform:translateY(-22px) scale(1)}}" +
      "#swOverlay .sw-rg{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:6px}" +
      "#swOverlay .sw-ro{position:relative;border-radius:20px;padding:20px 8px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:32px;color:#fff;background:#3A4D8F;box-shadow:0 6px 0 #1A254F}" +
      "#swOverlay .sw-ro small{position:absolute;left:12px;top:8px;font-size:13px;color:#9FB1EA}" +
      "#swOverlay .sw-ro:active{transform:translateY(3px);box-shadow:0 3px 0 #1A254F}" +
      "#swOverlay .sw-ro.sw-ok{background:#2FBF71;box-shadow:0 6px 0 #167A45}" +
      "#swOverlay .sw-ro.sw-bad{background:#E5593B;box-shadow:0 6px 0 #9E3520;animation:swshake .3s}" +
      "#swOverlay .sw-cd{font-size:110px;line-height:1.3;min-height:150px}" +
      "#swOverlay .sw-games{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:26px}" +
      "#swOverlay .sw-gt{display:block;text-align:center;border-radius:24px;padding:10px 6px 12px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;line-height:1.15;color:#1E2A4A;transition:transform .15s}" +
      "#swOverlay .sw-gt:hover{transform:translateY(-3px)}" +
      "#swOverlay .sw-gi{display:block;width:80%;margin:0 auto 6px}" +
      "#swOverlay .sw-gi svg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-g1{background:#FFE9B0;box-shadow:0 6px 0 #E8B84A}" +
      "#swOverlay .sw-g2{background:#D6EEFF;box-shadow:0 6px 0 #8FBCDD}" +
      "#swOverlay .sw-g3{background:#FFD9E6;box-shadow:0 6px 0 #E88FB1}" +
      "#swOverlay .sw-isl-wrap{position:relative;max-width:480px;margin:0 auto 26px}" +
      "#swOverlay .sw-isvg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-isvg text{font-family:'Fredoka',sans-serif;font-weight:700}" +
      "#swOverlay .sw-isvg:focus,#swOverlay .sw-isl-go:focus{outline:0}" +
      "#swOverlay .sw-isl-go{cursor:pointer}" +
      "#swOverlay .sw-isl-go .sw-ibody{animation:swbobi 2.8s ease-in-out infinite}" +
      "#swOverlay .sw-ipet{position:absolute;left:15%;top:9.4%;width:14.5%;pointer-events:none;transform-origin:50% 100%;animation:swbobp 3s ease-in-out infinite}" +
      "#swOverlay .sw-ipet svg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-album{display:flex;align-items:center;width:100%;text-align:left;background:#fff;border-radius:26px;padding:12px 14px;box-shadow:0 6px 0 #C9D7E8;margin-bottom:10px;transition:transform .15s}" +
      "#swOverlay .sw-album:hover{transform:translateY(-2px)}" +
      "#swOverlay .sw-album .sw-bk{flex:none;width:60px;margin-right:12px}" +
      "#swOverlay .sw-album .sw-bk svg{display:block;width:100%;height:auto}" +
      "#swOverlay .sw-at{flex:1;min-width:0;display:block}" +
      "#swOverlay .sw-at b{display:block;font-family:'Fredoka',sans-serif;font-weight:700;font-size:19px;line-height:1.2}" +
      "#swOverlay .sw-at span{display:block;font-weight:700;font-size:13px;color:#4A5878;margin-top:2px}" +
      "#swOverlay .sw-stk{flex:none;display:flex;margin-left:6px}" +
      "#swOverlay .sw-stk i{display:block;min-width:32px;height:32px;line-height:26px;text-align:center;border-radius:10px;border:3px solid;font-style:normal;font-weight:800;font-size:15px;padding:0 4px;margin-left:5px}" +
      "#swOverlay .sw-tw{display:block;margin-top:5px}" +
      "#swOverlay .sw-tw i{display:inline-block;font-style:normal;font-weight:800;font-size:13px;border-radius:999px;padding:1px 9px;margin:0 4px 4px 0}" +
      "#swOverlay .sw-ts{display:block;line-height:0;margin-top:2px}" +
      "#swOverlay .sw-ts svg{width:18px;height:18px;margin-right:2px}" +
      "#swOverlay .sw-ts span{display:inline-block}" +
      "#swOverlay .sw-dots{display:block;font-style:normal;line-height:0;margin:3px 0 4px}" +
      "#swOverlay .sw-dots i{display:inline-block;width:12px;height:12px;border-radius:50%;background:#E6EEF7;margin-right:5px}" +
      "#swOverlay .sw-dots i.sw-on{background:#35B779}" +
      "#swOverlay .sw-banner{position:relative;overflow:hidden;border-radius:30px;box-shadow:0 7px 0 #8FBCDD;min-height:200px;padding:14px;margin:4px 0 20px;background:#BFE6FF}" +
      "#swOverlay .sw-bncard{position:relative;display:inline-block;max-width:68%;background:rgba(255,255,255,.93);border-radius:20px;padding:8px 14px}" +
      "#swOverlay .sw-bncard h1{font-size:23px}" +
      "#swOverlay .sw-bncard .sw-sub{margin:2px 0 0;font-size:12px}" +
      "#swOverlay .sw-bnpet{position:absolute;right:12px;bottom:36px;width:27%;max-width:112px;transform-origin:50% 100%;animation:swbobp 3s ease-in-out infinite}" +
      "#swOverlay .sw-bnpet svg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-bnbar{position:absolute;left:14px;bottom:14px;right:34%;display:flex;align-items:center;background:rgba(255,255,255,.95);border-radius:999px;padding:6px 14px}" +
      "#swOverlay .sw-bnbar .sw-bar{flex:1;margin:0 10px 0 0;height:12px}" +
      "#swOverlay .sw-bnbar b{font-weight:800;font-size:14px;color:#2E6B43;white-space:nowrap}" +
      "#swOverlay .sw-unit{background:#fff;border-radius:28px;box-shadow:0 6px 0 #C9D7E8;margin:0 0 18px;overflow:hidden}" +
      "#swOverlay .sw-unit.sw-udone{box-shadow:0 6px 0 #E8B84A}" +
      "#swOverlay .sw-uh{position:relative;display:flex;align-items:center;width:100%;min-height:112px;padding:10px 12px;text-align:left}" +
      "#swOverlay .sw-ubg{position:absolute;left:0;top:0;right:0;bottom:0}" +
      "#swOverlay .sw-ubg svg{display:block;width:100%;height:100%}" +
      "#swOverlay .sw-uh>.sw-um,#swOverlay .sw-uh>.sw-ucard,#swOverlay .sw-uh>.sw-uc{position:relative}" +
      "#swOverlay .sw-um{flex:none;width:42px;height:52px}" +
      "#swOverlay .sw-um svg{display:block;width:100%;height:100%}" +
      "#swOverlay .sw-ucard{flex:0 1 auto;max-width:64%;min-width:0;display:block;background:rgba(255,255,255,.93);border-radius:18px;padding:6px 12px;margin:0 10px}" +
      "#swOverlay .sw-ucard b{display:block;font-family:'Fredoka',sans-serif;font-weight:700;font-size:21px;line-height:1.1}" +
      "#swOverlay .sw-ucard span{display:block;font-weight:700;font-size:13px;color:#4A5878}" +
      "#swOverlay .sw-uc{flex:none;margin-left:auto;width:34px;height:34px;border-radius:50%;background:#fff;color:#6B7A99;padding:5px;transition:transform .2s}" +
      "#swOverlay .sw-uopen .sw-uc{transform:rotate(180deg)}" +
      "#swOverlay .sw-trail{position:relative;overflow:hidden;padding:6px 8px}" +
      "#swOverlay .sw-tin{position:relative;max-width:380px;margin:0 auto}" +
      "#swOverlay .sw-tpath{position:absolute;left:0;top:0;width:100%;height:100%}" +
      "#swOverlay .sw-step{position:absolute;left:0;width:100%;height:132px;text-align:left;display:block}" +
      "#swOverlay .sw-node{position:absolute;left:26%;top:36px;margin-left:-34px;width:68px;height:68px;border-radius:50%;border:4px solid #fff;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Fredoka',sans-serif;font-weight:700;font-size:30px;transition:transform .15s}" +
      "#swOverlay .sw-sr .sw-node{left:74%}" +
      "#swOverlay .sw-sk2 .sw-node{border-color:#fff;outline:4px solid #FF6B4A;outline-offset:0}" +
      "#swOverlay .sw-sk3 .sw-node{border-radius:24px;border-color:#FFE066}" +
      "#swOverlay .sw-sk4 .sw-node{border-color:#D9DEFF;outline:4px solid rgba(160,170,255,.45);outline-offset:0}" +
      "#swOverlay button.sw-step:hover .sw-node{transform:scale(1.08)}" +
      "#swOverlay .sw-node svg{width:34px;height:34px}" +
      "#swOverlay .sw-node.sw-nx{animation:swpulse 2.2s ease-in-out infinite}" +
      "#swOverlay .sw-npet{position:absolute;left:26%;top:-18px;margin-left:-27px;width:54px;z-index:2;transform-origin:50% 100%;animation:swbobp 3s ease-in-out infinite}" +
      "#swOverlay .sw-sr .sw-npet{left:74%}" +
      "#swOverlay .sw-npet svg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-nst{position:absolute;left:26%;top:108px;margin-left:-28px;width:56px;line-height:0;text-align:center}" +
      "#swOverlay .sw-sr .sw-nst{left:74%}" +
      "#swOverlay .sw-nst svg{width:17px;height:17px}" +
      "#swOverlay .sw-nst span{display:inline-block}" +
      "#swOverlay .sw-slab{position:absolute;left:calc(26% + 46px);right:4px;top:30px;display:block;background:rgba(255,255,255,.95);border-radius:18px;padding:8px 10px;box-shadow:0 4px 0 rgba(30,42,74,.12)}" +
      "#swOverlay .sw-sr .sw-slab{left:4px;right:calc(26% + 46px);text-align:right}" +
      "#swOverlay .sw-slab b{display:block;font-family:'Fredoka',sans-serif;font-weight:700;font-size:17px;line-height:1.15}" +
      "#swOverlay .sw-slab .sw-tw{margin-top:4px}" +
      "#swOverlay .sw-slab small{display:block;font-weight:800;font-size:12px;line-height:1.3;color:#6B7A99;margin-top:2px}" +
      "#swOverlay .sw-tag{display:inline-block;background:#6A48E8;color:#fff;border-radius:999px;font-size:12px;font-weight:800;padding:1px 10px;margin-bottom:3px}" +
      "#swOverlay .sw-chest{position:absolute;left:26%;top:26px;margin-left:-42px;width:84px}" +
      "#swOverlay .sw-sr .sw-chest{left:74%}" +
      "#swOverlay .sw-chest svg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-copen{animation:swbobi 2.6s ease-in-out infinite}" +
      "#swOverlay{background:radial-gradient(circle at 10% 4%,#FFF4C6 0,rgba(255,244,198,0) 26%),radial-gradient(circle at 96% 10%,#DDEEFF 0,rgba(221,238,255,0) 30%),#F4FAFF}" +
      "#swOverlay .sw-ptrack{position:relative;margin:62px 30px 14px}" +
      "#swOverlay .sw-ptr{height:16px;border-radius:99px;background:#E3EDF8;box-shadow:inset 0 0 0 3px #CFDDEE;overflow:hidden}" +
      "#swOverlay .sw-ptr i{display:block;height:100%;background:linear-gradient(#5FD39A,#35B779);border-radius:99px;transition:width .6s ease}" +
      "#swOverlay .sw-pwalk{position:absolute;bottom:-5px;margin-left:-28px;width:56px;z-index:2;transition:left .6s ease}" +
      "#swOverlay .sw-pwalk svg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-pwalk.sw-wj{animation:swjump .6s}" +
      "#swOverlay .sw-pgoal{position:absolute;right:-18px;top:-17px;width:34px;height:34px;color:#FFC93C}" +
      "#swOverlay .sw-pgoal svg{display:block;width:100%;height:100%}" +
      "#swOverlay .sw-wordtile{display:inline-block;background:#FFF1C2;border:4px solid #FFC93C;border-radius:30px;padding:0 34px 6px;box-shadow:0 6px 0 #E0A800;transform:rotate(-2deg)}" +
      "#swOverlay .sw-pic{border:6px solid #fff;box-shadow:0 0 0 3px #E6EEF7,0 7px 0 #C9D7E8;transform:rotate(1.2deg)}" +
      "#swOverlay .sw-pets{width:150px}" +
      "#swOverlay .sw-bstars{margin:2px 0 4px;line-height:0}" +
      "#swOverlay .sw-bs{display:inline-block;width:52px;height:52px;margin:0 4px;color:#FFC93C;opacity:0;animation:swstarin .55s ease-out both}" +
      "#swOverlay .sw-bs svg{display:block;width:100%;height:100%}" +
      "@keyframes swstarin{0%{opacity:0;transform:scale(.2) rotate(-40deg)}70%{opacity:1;transform:scale(1.3) rotate(8deg)}100%{opacity:1;transform:scale(1) rotate(0)}}" +
      "#swOverlay .sw-opts .sw-opt:nth-child(5n+1){background:#FFD9E6;border-color:#FF8FB1;box-shadow:0 5px 0 #D9577F}" +
      "#swOverlay .sw-opts .sw-opt:nth-child(5n+2){background:#FFF1C2;border-color:#FFC93C;box-shadow:0 5px 0 #E0A800}" +
      "#swOverlay .sw-opts .sw-opt:nth-child(5n+3){background:#DFF5E7;border-color:#35B779;box-shadow:0 5px 0 #1F8A55}" +
      "#swOverlay .sw-opts .sw-opt:nth-child(5n+4){background:#D6EEFF;border-color:#3D8BF2;box-shadow:0 5px 0 #2A66C9}" +
      "#swOverlay .sw-opts .sw-opt:nth-child(5n+5){background:#EFE9FF;border-color:#8B6BE8;box-shadow:0 5px 0 #5B3FC4}" +
      "#swOverlay .sw-opts .sw-opt.sw-ok{background:#B9EBC9;border-color:#35B779;box-shadow:0 5px 0 #1F8A55;transform:scale(1.06)}" +
      "#swOverlay .sw-opts .sw-opt.sw-bad{background:#FFE3DE;border-color:#FF6B4A;box-shadow:0 5px 0 #D9462B;animation:swshake .35s}" +
      "#swOverlay .sw-orow:nth-child(5n+1) .sw-sopt{background:#FFD9E6;border-color:#FF8FB1;box-shadow:0 5px 0 #D9577F}" +
      "#swOverlay .sw-orow:nth-child(5n+2) .sw-sopt{background:#FFF1C2;border-color:#FFC93C;box-shadow:0 5px 0 #E0A800}" +
      "#swOverlay .sw-orow:nth-child(5n+3) .sw-sopt{background:#DFF5E7;border-color:#35B779;box-shadow:0 5px 0 #1F8A55}" +
      "#swOverlay .sw-orow:nth-child(5n+4) .sw-sopt{background:#D6EEFF;border-color:#3D8BF2;box-shadow:0 5px 0 #2A66C9}" +
      "#swOverlay .sw-orow .sw-sopt.sw-ok{background:#B9EBC9;border-color:#35B779;box-shadow:0 5px 0 #1F8A55}" +
      "#swOverlay .sw-orow .sw-sopt.sw-bad{background:#FFE3DE;border-color:#FF6B4A;box-shadow:0 5px 0 #D9462B;animation:swshake .35s}" +
      "#swOverlay button.sw-tok:nth-of-type(5n+1){background:#FFD9E6;border-color:#FF8FB1;box-shadow:0 4px 0 #D9577F}" +
      "#swOverlay button.sw-tok:nth-of-type(5n+2){background:#FFF1C2;border-color:#FFC93C;box-shadow:0 4px 0 #E0A800}" +
      "#swOverlay button.sw-tok:nth-of-type(5n+3){background:#DFF5E7;border-color:#35B779;box-shadow:0 4px 0 #1F8A55}" +
      "#swOverlay button.sw-tok:nth-of-type(5n+4){background:#D6EEFF;border-color:#3D8BF2;box-shadow:0 4px 0 #2A66C9}" +
      "#swOverlay button.sw-tok:nth-of-type(5n+5){background:#EFE9FF;border-color:#8B6BE8;box-shadow:0 4px 0 #5B3FC4}" +
      "#swOverlay button.sw-tok.sw-used{box-shadow:none}" +
      "#swOverlay .sw-pbody{margin:0 auto;transform-origin:50% 100%}" +
      "#swOverlay .sw-pbody svg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-pbody.sw-chew{animation:swchew .85s ease-in-out}" +
      "#swOverlay .sw-fstage{max-width:340px;padding-top:6px}" +
      "#swOverlay .sw-want{position:absolute;right:6%;top:2px;width:64px;height:64px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px #E6EEF7,0 4px 0 #C9D7E8;display:flex;align-items:center;justify-content:center;animation:swbobi 2.6s ease-in-out infinite}" +
      "#swOverlay .sw-want:after{content:'';position:absolute;left:-10px;bottom:-4px;width:12px;height:12px;border-radius:50%;background:#fff;box-shadow:0 0 0 2px #E6EEF7}" +
      "#swOverlay .sw-want span{display:block;width:44px;height:44px}" +
      "#swOverlay .sw-want svg,#swOverlay .sw-fly svg{display:block;width:100%;height:100%;overflow:visible}" +
      "#swOverlay .sw-fx{position:absolute;left:0;right:0;top:0;bottom:0;pointer-events:none;z-index:3}" +
      "#swOverlay .sw-fxi{position:absolute;display:block;opacity:0}" +
      "#swOverlay .sw-fxh{top:30%;width:24px;height:24px;animation:swup 1.3s ease-out both}" +
      "#swOverlay .sw-fxh svg{display:block;width:100%;height:100%}" +
      "#swOverlay .sw-fxc{top:44%;width:8px;height:8px;border-radius:50%;background:#E8B060;animation:swcrumb .9s ease-in both}" +
      "#swOverlay .sw-fly{position:fixed;width:56px;height:56px;z-index:3600;pointer-events:none}" +
      "#swOverlay .sw-tummy{position:relative;padding-right:30px}" +
      "#swOverlay .sw-tummy .sw-bar{height:18px;margin:6px 0 8px}" +
      "#swOverlay .sw-th{position:absolute;right:-2px;top:-1px;width:28px;height:28px}" +
      "#swOverlay .sw-th svg{display:block;width:100%;height:100%}" +
      "@keyframes swchew{0%{transform:scale(1,1)}18%{transform:scale(1.07,.93)}36%{transform:scale(.97,1.04)}54%{transform:scale(1.07,.93)}72%{transform:scale(.98,1.03)}100%{transform:scale(1,1)}}" +
      "@keyframes swcrumb{0%{transform:translate(0,0);opacity:0}15%{opacity:1}100%{transform:translate(18px,60px) rotate(120deg);opacity:0}}" +
      "#swOverlay .sw-fin{padding:16px 16px 14px}" +
      "#swOverlay .sw-fhead{display:flex;align-items:center;justify-content:center;margin:0 0 4px}" +
      "#swOverlay .sw-fst{flex:none;width:38%;max-width:150px;margin:0;padding-top:14px}" +
      "#swOverlay .sw-fst .sw-pet.sw-pets{width:100%}" +
      "#swOverlay .sw-ftxt{flex:1;min-width:0;text-align:left;margin-left:12px}" +
      "#swOverlay .sw-fin .sw-bstars{margin:0 0 2px}" +
      "#swOverlay .sw-fin .sw-bs{width:34px;height:34px;margin:0 4px 0 0}" +
      "#swOverlay .sw-big.sw-fbig{font-size:36px;margin:0 0 4px}" +
      "#swOverlay .sw-sent.sw-fsent{font-size:16px;margin:0}" +
      "#swOverlay .sw-fin .sw-words{margin:6px 0 2px}" +
      "#swOverlay .sw-fin .sw-words span{font-size:15px;padding:3px 12px}" +
      "#swOverlay .sw-fin .sw-msg{min-height:0;margin-top:4px;font-size:15px}" +
      "#swOverlay .sw-fin .sw-unitdone{margin:8px 0;padding:6px 14px;font-size:16px}" +
      "#swOverlay .sw-fin .sw-unitdone svg{width:26px;height:32px}" +
      "#swOverlay .sw-acts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:10px 0 2px}" +
      "#swOverlay .sw-acts .sw-a1{grid-column:1 / -1;margin:0;font-size:19px;padding:11px 16px;border-radius:26px}" +
      "#swOverlay .sw-acts .sw-gold{background:#FFC93C;color:#1E2A4A;box-shadow:0 6px 0 #E0A800}" +
      "#swOverlay .sw-acts .sw-gt{padding:8px 6px 10px}" +
      "#swOverlay .sw-acts .sw-gi{width:52%;margin-bottom:4px}" +
      "#swOverlay .sw-fl{margin-top:6px}" +
      "#swOverlay .sw-linkbtn{display:inline-block;font-weight:800;font-size:15px;color:#4A2FB8;padding:8px 12px;text-decoration:underline}" +
      "@media(min-width:720px){#swOverlay .sw-acts{grid-template-columns:repeat(3,minmax(0,1fr))}#swOverlay .sw-acts .sw-a1{grid-column:auto}}" +
      "#swOverlay .sw-ins{display:flex;align-items:center;margin-top:5px;font-weight:800;font-size:12px;line-height:1.2;color:#4A2FB8}" +
      "#swOverlay .sw-sr .sw-ins{justify-content:flex-end}" +
      "#swOverlay .sw-ith{display:inline-block;flex:none;width:46px;height:30px;margin-right:6px}" +
      "#swOverlay .sw-ith svg{display:block;width:100%;height:100%;overflow:visible}" +
      "#swOverlay .sw-cready{animation:swwig 2.4s ease-in-out infinite}" +
      "#swOverlay .sw-reveal{margin:0 0 6px}" +
      "#swOverlay .sw-rchest{width:76px;margin:0 auto;animation:swbobi 2.6s ease-in-out infinite}" +
      "#swOverlay .sw-rchest svg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-rt{font-family:'Fredoka',sans-serif;font-weight:700;font-size:26px;color:#B97A00;line-height:1.1}" +
      "#swOverlay .sw-rrow{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;margin:8px 0 2px}" +
      "#swOverlay .sw-rstar{display:inline-block;background:#FFF1C2;border:3px solid #FFC93C;border-radius:999px;padding:4px 16px;font-weight:800;font-size:20px;margin:4px 6px}" +
      "#swOverlay .sw-ritem{display:inline-flex;align-items:center;background:#EFE9FF;border:3px solid #8B6BE8;border-radius:999px;padding:3px 16px 3px 4px;margin:4px 6px;font-weight:800;font-size:17px}" +
      "#swOverlay .sw-ith.sw-rbig{width:56px;height:42px;margin-right:8px;background:#fff;border-radius:50%}" +
      "#swOverlay .sw-rpet{margin-top:-6px;padding-top:12px}" +
      "#swOverlay .sw-reveal + .sw-big{font-size:34px !important;margin:14px 0 4px}" +
      "#swOverlay .sw-reveal + .sw-big + .sw-sent{font-size:16px !important}" +
      "#swOverlay .sw-reveal .sw-go{margin-top:4px;padding:10px 28px;font-size:18px}" +
      "#swOverlay .sw-rpet .sw-pets{width:104px}" +
      "@keyframes swwig{0%,80%,100%{transform:rotate(0)}85%{transform:rotate(-7deg)}90%{transform:rotate(6deg)}95%{transform:rotate(-3deg)}}" +
      "@keyframes swbobp{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}" +
      "@keyframes swbobi{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}" +
      "@keyframes swpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}" +
      "@keyframes swdrift{from{transform:translateX(-14px)}to{transform:translateX(16px)}}" +
      "#swOverlay .sw-unitdone{display:flex;align-items:center;gap:12px;justify-content:center;background:#FFF6D6;border-radius:20px;padding:10px 16px;margin:12px 0;font-weight:800;font-size:18px;text-align:left}" +
      "#swOverlay .sw-unitdone svg{flex:none;width:34px;height:42px}" +
      "#swOverlay .sw-legend{display:flex;flex-wrap:wrap;gap:8px;margin:2px 0 12px}" +
      "#swOverlay .sw-legend .sw-wd{font-size:14px;padding:3px 12px}" +
      "#swOverlay .sw-find{width:100%;font:inherit;font-weight:700;font-size:18px;padding:12px 18px;border-radius:999px;border:3px solid #D5E3F0;background:#fff;color:#1E2A4A;margin:0 0 14px;outline:0}" +
      "#swOverlay .sw-find:focus{border-color:#6A48E8}" +
      "#swOverlay .sw-wg{margin:0 0 14px}" +
      "#swOverlay .sw-wh{display:inline-block;font-family:'Fredoka',sans-serif;font-weight:700;font-size:16px;border-radius:999px;padding:3px 14px;margin:0 0 10px}" +
      "#swOverlay .sw-wc{display:flex;flex-wrap:wrap;gap:8px}" +
      "#swOverlay .sw-wd{position:relative;display:inline-block;border-radius:999px;padding:6px 16px;font-weight:800;font-size:19px;line-height:1.2;border:3px solid transparent}" +
      "#swOverlay .sw-wc .sw-wd{cursor:pointer;box-shadow:0 3px 0 rgba(30,42,74,.14);transition:transform .12s}#swOverlay .sw-wc .sw-wd:hover{transform:translateY(-2px)}" +
      "#swOverlay .sw-w-known{background:#DFF5E7;color:#2E6B43;border-color:#35B779}" +
      "#swOverlay .sw-w-learning{background:#FFF1C2;color:#7A5200;border-color:#FFC93C}" +
      "#swOverlay .sw-w-new{background:#F1F5FA;color:#8A97AD;border-color:#C9D7E8;border-style:dashed}" +
      "#swOverlay .sw-wdue:after{content:'';position:absolute;right:-3px;top:-3px;width:13px;height:13px;border-radius:50%;background:#FF7A2F;border:2px solid #fff}" +
      "#swOverlay .sw-wd.sw-sel{box-shadow:0 0 0 4px #6A48E8}" +
      "#swOverlay .sw-sheet{position:fixed;left:12px;right:12px;bottom:12px;max-width:620px;margin:0 auto;z-index:5;background:#fff;border-radius:28px;box-shadow:0 0 0 3px #E6EEF7,0 14px 40px rgba(30,42,74,.28);padding:14px 16px 14px;gap:14px;align-items:center}" +
      "#swOverlay .sw-shp{flex:none;width:132px}" +
      "#swOverlay .sw-shp .sw-pic{max-width:none;margin:0;box-shadow:0 4px 0 #C9D7E8}" +
      "#swOverlay .sw-sht{flex:1;min-width:0;text-align:left}" +
      "#swOverlay .sw-shw{font-family:'Fredoka',sans-serif;font-weight:700;font-size:40px;line-height:1.05;display:inline-block;margin-right:10px;vertical-align:middle}" +
      "#swOverlay .sw-sht .sw-wd{font-size:13px;padding:1px 10px;vertical-align:middle}" +
      "#swOverlay .sw-shs{font-weight:800;font-size:18px;line-height:1.4;margin:6px 0 2px}" +
      "#swOverlay .sw-shs b{color:#D93B1E;background:#FFE9B0;border-radius:8px;padding:0 6px}" +
      "#swOverlay .sw-shn{font-weight:700;font-size:14px;color:#4A5878}" +
      "#swOverlay .sw-sht .sw-say{font-size:15px;padding:8px 16px;margin:6px 6px 0 0}" +
      "#swOverlay .sw-x{position:absolute;right:10px;top:6px;width:34px;height:34px;border-radius:50%;background:#F1F5FA;font-size:24px;line-height:1;font-weight:800;color:#6B7A99}" +
      "#swOverlay .sw-wg:last-child{margin-bottom:210px}" +
      "@media(max-width:560px){#swOverlay .sw-sky{height:235px}#swOverlay .sw-bal{width:23%}#swOverlay .sw-bw{font-size:22px}#swOverlay .sw-pet{width:170px}#swOverlay .sw-plate{font-size:28px;padding:14px 12px;min-width:86px}#swOverlay .sw-plates{gap:10px}#swOverlay .sw-mem,#swOverlay .sw-mem.sw-c5{grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}#swOverlay .sw-mc{height:104px}#swOverlay .sw-mc .sw-mface{font-size:16px;padding:4px}#swOverlay .sw-mc .sw-mface svg{width:100%;height:100%}#swOverlay .sw-sopt{font-size:20px;padding:10px 14px}#swOverlay h1{font-size:28px}#swOverlay .sw-big{font-size:68px}#swOverlay .sw-sent{font-size:23px}#swOverlay .sw-opt{font-size:32px;padding:10px 18px;min-width:90px}#swOverlay .sw-tok{font-size:24px}#swOverlay .sw-grid{grid-template-columns:1fr}#swOverlay .sw-ttl h1{font-size:26px}#swOverlay .sw-bncard h1{font-size:20px}#swOverlay .sw-slab b{font-size:16px}#swOverlay .sw-tw i{font-size:12px;padding:1px 8px}#swOverlay .sw-bub{font-size:17px;padding:9px 13px}#swOverlay .sw-start{font-size:20px}#swOverlay .sw-gt{font-size:13px}#swOverlay .sw-ct{font-size:15px}#swOverlay .sw-ro{font-size:26px;padding:16px 6px}#swOverlay .sw-sl{height:50px;font-size:26px}#swOverlay .sw-key{height:44px;font-size:17px}#swOverlay .sw-ctx{font-size:18px}#swOverlay .sw-sheet{left:8px;right:8px;bottom:8px;padding:12px}#swOverlay .sw-shp{width:96px}#swOverlay .sw-shw{font-size:32px}#swOverlay .sw-shs{font-size:16px}}" +
      "@media(prefers-reduced-motion:reduce){#swOverlay .sw-opt.sw-bad,#swOverlay .sw-sopt.sw-bad,#swOverlay .sw-mc.sw-pair,#swOverlay .sw-bal,#swOverlay .sw-plate.sw-bad,#swOverlay .sw-pet.sw-jump,#swOverlay .sw-pet.sw-dance,#swOverlay .sw-pet.sw-hop,#swOverlay .sw-sky.sw-shake{animation:none}#swOverlay .sw-pf{display:none}#swOverlay .sw-bs{animation:none;opacity:1}#swOverlay .sw-hpet,#swOverlay .sw-ipet,#swOverlay .sw-cready,#swOverlay .sw-rchest,#swOverlay .sw-pbody.sw-chew,#swOverlay .sw-want,#swOverlay .sw-pwalk.sw-wj,#swOverlay .sw-bnpet,#swOverlay .sw-npet,#swOverlay .sw-node.sw-nx,#swOverlay .sw-copen,#swOverlay .sw-start,#swOverlay .sw-tile.sw-next,#swOverlay .sw-isl-go .sw-ibody,#swOverlay .sw-cl1,#swOverlay .sw-cl2{animation:none}}";
    document.head.appendChild(st);
  }
  var SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>';

  function ensure() {
    if (ov) return;
    injectStyle();
    ov = document.createElement("div");
    ov.id = "swOverlay";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-label", "Sight words");
    ov.innerHTML = '<div class="sw-wrap" id="swBox"></div>';
    document.body.appendChild(ov);
    box = document.getElementById("swBox");
  }
  function openOverlay() {
    ensure();
    ov.style.display = "block";
    document.body.style.overflow = "hidden";
    ov.scrollTop = 0;
  }
  function closeOverlay() {
    if (!ov) return;
    stopRun();
    ov.style.display = "none";
    document.body.style.overflow = "";
    try {
      if (audio) audio.pause();
    } catch (e) {}
    refreshButton();
    try {
      if (root.Badges && root.Badges.soon) root.Badges.soon();
    } catch (e) {}
  }

  /* ---- the home button's small count ---- */
  function refreshButton() {
    var el = document.getElementById("swBadge");
    if (!el) return;
    var s = readState(),
      known = knownCount(s, allWords()),
      due = dueWords(s, dayStr()).length;
    el.textContent = due > 0 ? due + " to review" : known + " / " + allWords().length;
    el.style.background = "#fff";
    el.style.color = due > 0 ? "#D93B1E" : "#4A2FB8";
  }

  /* ---- where the back buttons go: lessons and unit games return to the stage map, the rest to the first page ---- */
  var back = showHome,
    openU = {},
    MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function goBack() {
    stopSound();
    stopRun();
    // leaving a lesson or a review before its end: say at which step
    if (run && !run.done && (run.mode === "lesson" || run.mode === "review") && run.steps && run.i < run.steps.length) {
      trk(run.mode === "lesson" ? "sw_lesson_quit" : "sw_review_quit", run.mode === "lesson" ? lessonTag(run.id) : "review", "step " + (run.i + 1) + "/" + run.steps.length, run.mode);
      run.done = true;
    }
    back();
  }
  function backLabel() {
    return back === showMap ? "Back to the lessons" : "Back to Sight words";
  }
  function niceDate(d) {
    var m = /^\d{4}-(\d\d)-(\d\d)$/.exec(d || "");
    return m ? MONTHS[+m[1] - 1] + " " + +m[2] : "";
  }
  function plural(n, one) {
    return n + " " + one + (n === 1 ? "" : "s");
  }
  // a small ribbon medal: gold when the unit is finished, grey before
  function medal(on) {
    return '<svg viewBox="0 0 40 48" aria-hidden="true"><path d="M9 2h9l6 15h-9zM31 2h-9l-6 15h9z" fill="' + (on ? "#E5483A" : "#C4D1E3") + '"/><circle cx="20" cy="31" r="14" fill="' + (on ? "#FFC93C" : "#E6EEF7") + '" stroke="' + (on ? "#E0A800" : "#B9C7DA") + '" stroke-width="3"/>' +
      (on ? '<path d="M20 22l2.7 5.5 6 .9-4.4 4.2 1 6L20 35.7l-5.3 2.9 1-6-4.4-4.2 6-.9z" fill="#fff"/>' : "") + "</svg>";
  }
  function stageWords(stage) {
    return stageWordsOf(stage.id);
  }

  /* ---- the first page: today's meadow, games, word islands and the word album ---- */
  var PAL = [
    { bg: "#FFD9E6", edge: "#FF8FB1", deep: "#D9577F", ink: "#8A1C4A" },
    { bg: "#FFF1C2", edge: "#FFC93C", deep: "#E0A800", ink: "#7A5200" },
    { bg: "#DFF5E7", edge: "#35B779", deep: "#1F8A55", ink: "#2E6B43" },
    { bg: "#D6EEFF", edge: "#3D8BF2", deep: "#2A66C9", ink: "#1B5E8F" },
    { bg: "#EFE9FF", edge: "#8B6BE8", deep: "#5B3FC4", ink: "#4A2FB8" },
  ];
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>';
  var CHEVRON = '<svg class="sw-uc" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function scenery(name, arg) {
    return root.SWScenery && root.SWScenery[name] ? root.SWScenery[name](arg) : "";
  }
  // the word as it is written in the lessons (the saved key is lower case)
  function shown(key) {
    var out = key;
    allWords().forEach(function (w) {
      if (wkey(w) === key) out = w;
    });
    return out;
  }
  function chipsHtml(list) {
    return list.map(function (w, i) {
      var c = PAL[i % PAL.length];
      return '<span class="sw-wch" style="background:' + c.bg + ";color:" + c.ink + '">' + esc(w) + "</span>";
    }).join("");
  }
  function lessonStarsHtml(rec) {
    var n = lessonStars(rec),
      h = "";
    for (var i = 0; i < 3; i++) h += '<span style="color:' + (i < n ? "#FFC93C" : "#D5E0EE") + '">' + scenery("star") + "</span>";
    return h;
  }
  // which islands have lessons (the others are shown grey and locked)
  function readyIslands() {
    var r = {};
    D.stages.forEach(function (st) {
      if (st.ready) r[st.id] = true;
    });
    return r;
  }
  // what each ready island shows under it: its name and how many of its words are known
  function islandInfo(s) {
    var out = {};
    D.stages.forEach(function (st) {
      if (st.ready) {
        var ws = stageWordsOf(st.id);
        out[st.id] = { title: st.title, known: knownCount(s, ws), total: ws.length };
      }
    });
    return out;
  }
  function showHome() {
    var s = readState(),
      words = allWords(),
      known = knownCount(s, words),
      today = dayStr(),
      plan = todayPlan(s, D.lessons, today),
      p = hooks.pet ? hooks.pet() : null,
      type = p && root.PETS && root.PETS[p.type] ? p.type : "cat",
      eq = p && p.eq ? p.eq : {},
      say1,
      say2,
      list = [],
      pill,
      btn;
    function pet(mood) {
      return typeof root.petSvg === "function" ? root.petSvg(type, mood, eq, "full", "width:100%;height:auto;overflow:visible") : "";
    }
    if (plan.kind === "review") {
      say1 = "Hi! Let’s review";
      say2 = plural(plan.review, "word") + "!";
      list = dueWords(s, today).slice(0, 5).map(function (k) {
        return shown(k);
      });
      pill = "Today · Review" + (plan.lesson ? " + Lesson " + plan.lesson : "");
      btn = "Start review";
    } else if (plan.kind === "lesson") {
      list = lessonOf(plan.lesson).words;
      say1 = "Hi! Let’s learn";
      say2 = plural(list.length, "new word") + "!";
      pill = "Today · Lesson " + plan.lesson;
      btn = "Start lesson " + plan.lesson;
    } else {
      say1 = "Wow! You finished";
      say2 = readyIslands()[2] ? "every stage!" : "Stage 1!";
      pill = "Today · All done";
      btn = "Play a game";
    }
    var learning = 0,
      seen = 0,
      picks = [];
    words.forEach(function (w) {
      var r = s.words[wkey(w)];
      if (r) seen++;
      if (r && !isKnown(r)) learning++;
    });
    ["known", "learning"].forEach(function (kind) {
      words.forEach(function (w) {
        if (picks.length < 3 && wordStatus(s.words[wkey(w)], today).s === kind) picks.push(w);
      });
    });
    var angles = [-10, 7, -5],
      stickers = "";
    for (var i = 0; i < 3; i++) {
      var c = PAL[(i * 2 + 1) % PAL.length];
      stickers += '<i style="transform:rotate(' + angles[i] + "deg);background:" + (picks[i] ? c.bg : "#F1F5FA") + ";border-color:" + (picks[i] ? c.edge : "#C9D7E8") + ";color:" + (picks[i] ? c.ink : "#8A97AD") + (picks[i] && picks[i].length > 3 ? ";font-size:12px" : "") + '">' + esc(picks[i] || "?") + "</i>";
    }
    var h = '<div class="sw-home"><div class="sw-top"><button class="sw-back" id="swClose">← Back</button>' + (p ? '<span class="sw-starpill">' + scenery("star") + (+p.stars || 0) + "</span>" : "") + "</div>" +
      '<div class="sw-ttl"><span class="sw-aa">Aa</span><div><h1>Sight words</h1><div class="sw-sub">The words you will see in almost every story · 高频词</div></div></div>' +
      '<div class="sw-hero"><div class="sw-herobg">' + scenery("hero") + '</div><span class="sw-tpill">' + esc(pill) + "</span>" +
      '<div class="sw-hrow"><div class="sw-hpet">' + pet("happy") + '</div><div class="sw-hsay"><div class="sw-bub">' + esc(say1) + "<b>" + esc(say2) + '</b></div><div class="sw-wchs">' + chipsHtml(list) + "</div></div></div>" +
      '<button class="sw-start" id="swToday">' + PLAY + esc(btn) + "</button></div>" +
      '<div class="sw-sect">Play with your words</div><div class="sw-games">' +
      '<button class="sw-gt sw-g1" id="swMem"><span class="sw-gi">' + scenery("game", "memory") + "</span>Memory match</button>" +
      '<button class="sw-gt sw-g2" id="swBal"><span class="sw-gi">' + scenery("game", "balloon") + "</span>Balloon pop</button>" +
      '<button class="sw-gt sw-g3" id="swFeed"><span class="sw-gi">' + scenery("game", "feed") + "</span>" + esc(feedLabel()) + "</button></div>" +
      '<div class="sw-sect">Challenges · 挑战</div><div class="sw-chal">' +
      '<button class="sw-ct sw-c1" id="swSpell"><span class="sw-gi">' + scenery("game", "spell") + "</span>Spell it<small>拼写挑战</small></button>" +
      '<button class="sw-ct sw-c2" id="swRush"><span class="sw-gi">' + scenery("game", "rush") + "</span>Word rush<small>" + (+s.rev.rushbest ? "Best " + (+s.rev.rushbest) + " pts" : "60 seconds · 竞速") + "</small></button></div>" +
      '<div class="sw-sect">Word islands</div><div class="sw-isl-wrap">' + scenery("islands", { known: known, total: words.length, title: D.stages[0].title, ready: readyIslands(), stages: islandInfo(s) }) + '<div class="sw-ipet">' + pet("happy") + "</div></div>" +
      '<div class="sw-sect">My words</div><button class="sw-album" id="swWall"><span class="sw-bk">' + scenery("book") + '</span><span class="sw-at"><b>My word album</b><span>' + known + " known · " + learning + " learning · " + (words.length - seen) + ' to meet</span></span><span class="sw-stk">' + stickers + "</span></button></div>";
    box.innerHTML = h;
    document.getElementById("swClose").onclick = closeOverlay;
    document.getElementById("swToday").onclick = function () {
      if (plan.kind === "review") startReview();
      else if (plan.kind === "lesson") startLesson(plan.lesson);
      else {
        back = showHome;
        startFeed(gameWords(s, 6, true));
      }
    };
    document.getElementById("swMem").onclick = function () {
      back = showHome;
      startMemory(memoryWords(s));
    };
    document.getElementById("swBal").onclick = function () {
      back = showHome;
      startBalloons(gameWords(s, 8));
    };
    document.getElementById("swFeed").onclick = function () {
      back = showHome;
      startFeed(gameWords(s, 6, true));
    };
    document.getElementById("swSpell").onclick = function () {
      back = showHome;
      startSpell(spellList(readState()));
    };
    document.getElementById("swRush").onclick = function () {
      back = showHome;
      startRush();
    };
    document.getElementById("swWall").onclick = showWall;
    Array.prototype.forEach.call(box.querySelectorAll(".sw-isl-go"), function (isl) {
      var n = +isl.getAttribute("data-s") || 1;
      isl.onclick = function () {
        showMap(false, n);
      };
      isl.onkeydown = function (e) {
        if (e.keyCode === 13 || e.keyCode === 32) showMap(false, n);
      };
    });
    ov.scrollTop = 0;
  }

  /* ---- a stage: its units, one open at a time (the finished ones fold away); each unit is a winding trail in its own little world ---- */
  var ROWH = 132,
    chestRun = null;
  var CHEST_STARS = root.SWPrizes ? root.SWPrizes.STARS : 5;
  function prizeFor(island, unit) {
    return root.SWPrizes ? root.SWPrizes.forUnit(island, unit) : null;
  }
  function prizeThumb(id) {
    return root.SWPrizes ? root.SWPrizes.thumb(id) : "";
  }
  function showMap(keep, sid) {
    if (sid) mapStage = sid;
    sid = mapStage;
    if (keep !== true) trk("sw_view", "stage", stageTag(sid), "screen");
    var y = keep === true ? ov.scrollTop : 0,
      s = readState(),
      words = stageWordsOf(sid),
      units = unitsOf(sid),
      known = knownCount(s, words),
      next = nextLesson(lessonsOf(sid), s),
      cu = currentUnit(units, D.lessons, s),
      st = stageInfo(sid),
      p = hooks.pet ? hooks.pet() : null,
      type = p && root.PETS && root.PETS[p.type] ? p.type : "cat",
      eq = p && p.eq ? p.eq : {};
    function pet(mood) {
      return typeof root.petSvg === "function" ? root.petSvg(type, mood, eq, "full", "width:100%;height:auto;overflow:visible") : "";
    }
    var h = '<div class="sw-home"><div class="sw-top"><button class="sw-back" id="swClose">← Back</button></div>' +
      '<div class="sw-banner"><div class="sw-herobg">' + scenery("banner", sid) + '</div><div class="sw-bncard"><h1>Stage ' + st.id + " · " + esc(st.title) + '</h1><div class="sw-sub">' + esc(st.source) + " · " + words.length + " words · Grades " + esc(st.grades) + "</div></div>" +
      '<div class="sw-bnpet">' + pet("happy") + '</div><div class="sw-bnbar"><div class="sw-bar"><i style="width:' + Math.round((100 * known) / words.length) + '%"></i></div><b>' + known + " / " + words.length + "</b></div></div>";
    units.forEach(function (u, ui) {
      var up = unitProgress(u, D.lessons, s),
        th = scenery("unitTheme", { s: sid, i: ui }) || { name: "", bg: "#F4FAFF", dash: "#C9D7E8" },
        open = openU[u.id] === undefined ? u.id === cu.id : openU[u.id],
        dots = "";
      for (var d = 0; d < up.total; d++) dots += "<i" + (d < up.done ? ' class="sw-on"' : "") + "></i>";
      h += '<div class="sw-unit' + (up.complete ? " sw-udone" : "") + (open ? " sw-uopen" : "") + '"><button class="sw-uh" data-u="' + u.id + '" aria-expanded="' + (open ? "true" : "false") + '"><span class="sw-ubg">' + scenery("unitArt", { s: sid, i: ui }) + '</span><span class="sw-um">' + medal(up.complete) + '</span><span class="sw-ucard"><b>Unit ' + u.id + '</b><em class="sw-dots">' + dots + "</em><span>" + esc(th.name) + " · " + up.words.length + " words</span></span>" + CHEVRON + "</button>";
      if (open) {
        var rows = u.lessons.length + 1,
          H = rows * ROWH;
        h += '<div class="sw-trail sw-sk' + sid + '" style="background:' + th.bg + '"><div class="sw-tin" style="height:' + H + 'px"><svg class="sw-tpath" viewBox="0 0 380 ' + H + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + trailPath(rows, ROWH, 380) + '" fill="none" stroke="' + th.dash + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="1 15"/></svg>';
        u.lessons.forEach(function (id, i) {
          var l = lessonOf(id),
            rec = s.lessons[id],
            pal = PAL[(id - 1) % PAL.length],
            isNext = id === next,
            style = rec ? "background:#35B779;box-shadow:0 6px 0 #1F8A55" : isNext ? "background:#6A48E8;box-shadow:0 6px 0 #4A2FB8" : "background:" + pal.edge + ";box-shadow:0 6px 0 " + pal.deep;
          h += '<button class="sw-step' + (i % 2 ? " sw-sr" : "") + '" data-l="' + id + '" style="top:' + i * ROWH + 'px"><span class="sw-node' + (isNext ? " sw-nx" : "") + '" style="' + style + '">' + (rec ? CHECK : id) + "</span>" +
            (isNext ? '<span class="sw-npet">' + pet("happy") + "</span>" : "") + (rec ? '<span class="sw-nst">' + lessonStarsHtml(rec) + "</span>" : "") +
            '<span class="sw-slab">' + (isNext ? '<span class="sw-tag">Start here</span>' : "") + "<b>Lesson " + id + '</b><span class="sw-tw">' +
            l.words.map(function (w) {
              return '<i style="background:' + pal.bg + ";color:" + pal.ink + '">' + esc(w) + "</i>";
            }).join("") + "</span></span></button>";
        });
        var ci = u.lessons.length,
          left = up.total - up.done,
          claimed = !!s.rev[chestKey(sid, u.id)],
          cst = claimed ? "open" : up.complete ? "ready" : "locked",
          prize = prizeFor(sid, u.id),
          tag = up.complete ? "button" : "div",
          inside = prize ? '<span class="sw-ins"><span class="sw-ith">' + prizeThumb(prize.id) + "</span>" + (claimed ? "" : CHEST_STARS + " ★ + ") + esc(prize.name) + "</span>" : claimed ? "" : '<span class="sw-ins">' + CHEST_STARS + " ★</span>";
        h += "<" + tag + ' class="sw-step' + (ci % 2 ? " sw-sr" : "") + '"' + (up.complete ? ' data-uc="' + u.id + '"' : "") + ' style="top:' + ci * ROWH + 'px"><span class="sw-chest' + (cst === "open" ? " sw-copen" : cst === "ready" ? " sw-cready" : "") + '">' + scenery("chest", { state: cst, s: sid }) + '</span><span class="sw-slab">' +
          (cst === "open" ? "<b>Chest opened ✓</b><small>Play the challenge again.</small>" : cst === "ready" ? "<b>Open the chest!</b><small>Pop balloons with this unit’s words.</small>" : "<b>Unit challenge</b><small>Finish " + plural(left, "more lesson") + " to open the chest.</small>") + inside + "</span></" + tag + ">";
        h += "</div></div>";
      }
      h += "</div>";
    });
    box.innerHTML = h + "</div>";
    document.getElementById("swClose").onclick = showHome;
    Array.prototype.forEach.call(box.querySelectorAll(".sw-uh"), function (b) {
      b.onclick = function () {
        var id = +b.getAttribute("data-u"),
          cur = openU[id] === undefined ? id === cu.id : openU[id];
        openU[id] = !cur;
        showMap(true);
      };
    });
    Array.prototype.forEach.call(box.querySelectorAll(".sw-step[data-uc]"), function (b) {
      b.onclick = function () {
        unitChallenge(+b.getAttribute("data-uc"));
      };
    });
    Array.prototype.forEach.call(box.querySelectorAll(".sw-step[data-l]"), function (b) {
      b.onclick = function () {
        startLesson(+b.getAttribute("data-l"));
      };
    });
    ov.scrollTop = y;
  }
  // the unit's boss: the balloon game with 8 of the unit's words
  function unitChallenge(id) {
    var u = null;
    D.units.forEach(function (x) {
      if (x.id === id) u = x;
    });
    if (!u) return;
    back = showMap;
    chestRun = { s: u.stage || 1, u: id };
    startBalloons(pickWords([], unitProgress(u, D.lessons, readState()).words, 8, seeded(Date.now() % 100003)));
  }

  /* ---- my words: every word of the stage, coloured by how well I know it; tap one to hear it ---- */
  function lessonWith(w) {
    var k = wkey(w),
      out = null;
    D.lessons.forEach(function (l) {
      l.words.forEach(function (x) {
        if (wkey(x) === k) out = l;
      });
    });
    return out;
  }
  function showWall() {
    trk("sw_view", "wall", "", "screen");
    var s = readState(),
      today = dayStr(),
      n = { known: 0, learning: 0, nw: 0 },
      h = '<div class="sw-top"><button class="sw-back" id="swClose">← Back</button></div>' +
        '<div class="sw-ttl"><span class="sw-bkh">' + scenery("book") + '</span><div><h1>My words</h1><div class="sw-sub">Tap a word to hear it</div></div></div><div class="sw-legend"><span class="sw-wd sw-w-known">I know it</span><span class="sw-wd sw-w-learning">Learning</span><span class="sw-wd sw-w-new">Not met yet</span><span class="sw-wd sw-w-known sw-wdue">Ready for review</span></div>' +
        '<input class="sw-find" id="swFind" type="text" placeholder="Find a word" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Find a word">';
    var wallStage = 0;
    D.units.forEach(function (u) {
      var up = unitProgress(u, D.lessons, s);
      var pal = PAL[(u.id - 1) % PAL.length];
      if ((u.stage || 1) !== wallStage) {
        wallStage = u.stage || 1;
        h += '<div class="sw-sect sw-wst">Stage ' + wallStage + " · " + esc(stageInfo(wallStage).title) + "</div>";
      }
      h += '<div class="sw-wg"><div class="sw-wh" style="background:' + pal.bg + ";color:" + pal.ink + '">Unit ' + u.id + " · " + up.known + " / " + up.words.length + ' known</div><div class="sw-wc">';
      up.words.forEach(function (w) {
        var r = s.words[wkey(w)],
          st = wordStatus(r, today);
        n[st.s === "new" ? "nw" : st.s]++;
        h += '<button class="sw-wd sw-w-' + st.s + (st.due ? " sw-wdue" : "") + '" data-w="' + esc(w) + '">' + esc(w) + "</button>";
      });
      h += "</div></div>";
    });
    box.innerHTML = h + '<div class="sw-sheet" id="swSheet" style="display:none"></div>';
    document.getElementById("swClose").onclick = showHome;
    var chips = box.querySelectorAll(".sw-wc .sw-wd"),
      sheet = document.getElementById("swSheet");
    Array.prototype.forEach.call(chips, function (c) {
      c.onclick = function () {
        Array.prototype.forEach.call(chips, function (o) {
          o.classList.remove("sw-sel");
        });
        c.classList.add("sw-sel");
        openSheet(sheet, c.getAttribute("data-w"));
      };
    });
    document.getElementById("swFind").oninput = function () {
      var q = wkey(this.value);
      Array.prototype.forEach.call(chips, function (c) {
        c.style.display = !q || wkey(c.getAttribute("data-w")).indexOf(q) >= 0 ? "" : "none";
      });
      Array.prototype.forEach.call(box.querySelectorAll(".sw-wg"), function (g) {
        var any = false;
        Array.prototype.forEach.call(g.querySelectorAll(".sw-wd"), function (c) {
          if (c.style.display !== "none") any = true;
        });
        g.style.display = any ? "" : "none";
      });
    };
    ov.scrollTop = 0;
  }
  function openSheet(sheet, w) {
    var s = readState(),
      rec = s.words[wkey(w)],
      st = wordStatus(rec, dayStr()),
      info = wordInfo(w),
      l = lessonWith(w),
      label = st.s === "known" ? "I know this word" : st.s === "learning" ? "Still learning" : "Not met yet",
      note = st.s === "new" ? "You will meet it in Lesson " + (l ? l.id : "") + "." : st.due ? "Ready for review today." : rec && rec.due ? "Next review: " + niceDate(rec.due) : "";
    sheet.innerHTML = '<button class="sw-x" id="swShX" aria-label="Close">×</button><div class="sw-shp">' + art(w, true) + '</div><div class="sw-sht"><div class="sw-shw">' + esc(w) + '</div><span class="sw-wd sw-w-' + st.s + '">' + label + "</span>" +
      '<div class="sw-shs">' + sentenceHtml(w, info ? info.s : w) + "</div>" + (note ? '<div class="sw-shn">' + esc(note) + "</div>" : "") +
      '<div><button class="sw-say" id="swShW">' + SPEAKER + ' Hear the word</button><button class="sw-say sw-alt" id="swShS">' + SPEAKER + " Hear the sentence</button></div></div>";
    sheet.style.display = "flex";
    document.getElementById("swShX").onclick = function () {
      sheet.style.display = "none";
      Array.prototype.forEach.call(box.querySelectorAll(".sw-sel"), function (o) {
        o.classList.remove("sw-sel");
      });
    };
    document.getElementById("swShW").onclick = function () {
      play("w", w);
    };
    document.getElementById("swShS").onclick = function () {
      play("s", w);
    };
    play("w", w);
  }

  /* ---- one lesson ---- */
  var run = null;

  function startLesson(id) {
    back = showMap;
    var l = lessonOf(id),
      met = [];
    D.lessons.forEach(function (x) {
      if (x.id <= id) met = met.concat(x.words);
    });
    run = { mode: "lesson", id: id, words: l.words, pool: met, steps: [], i: 0, first: {}, total: 0, right: 0, rnd: seeded(id * 7919 + Date.now() % 997) };
    trk("sw_lesson_start", lessonTag(id), "", "lesson");
    // meet each word, then practise: listen and tap, find it in the sentence, and build two sentences
    l.words.forEach(function (w) {
      run.steps.push({ t: "meet", w: w });
    });
    shuffle(l.words, run.rnd).forEach(function (w) {
      run.steps.push({ t: "listen", w: w });
    });
    shuffle(l.words, run.rnd).forEach(function (w) {
      run.steps.push({ t: "find", w: w });
    });
    shuffle(l.words, run.rnd).slice(0, 3).forEach(function (w) {
      run.steps.push({ t: "pic", w: w });
    });
    shuffle(l.words, run.rnd).slice(0, 2).forEach(function (w) {
      run.steps.push({ t: "build", w: w });
    });
    showStep();
  }
  function startReview() {
    back = showHome;
    var s = readState(),
      due = dueWords(s, dayStr());
    due = shuffle(due, seeded(Date.now() % 100000)).slice(0, 10);
    var words = allWords(),
      pool = words.filter(function (w) {
        return s.words[wkey(w)];
      });
    run = { mode: "review", words: due, pool: pool, steps: [], i: 0, first: {}, total: 0, right: 0, rnd: seeded(Date.now() % 9973) };
    due.forEach(function (k, n) {
      var w = words.filter(function (x) {
        return wkey(x) === k;
      })[0];
      if (w) run.steps.push({ t: n % 2 ? "find" : "listen", w: w });
    });
    if (!run.steps.length) {
      showHome();
      return;
    }
    trk("sw_review_start", "review", plural(run.steps.length, "word"), "review");
    showStep();
  }
  // the child's pet (a cat when there is none) in a mood, for the practice pages and end screens
  function petArt(mood, eqNow) {
    var p = hooks.pet ? hooks.pet() : null,
      type = p && root.PETS && root.PETS[p.type] ? p.type : "cat",
      eq = eqNow || (p && p.eq ? p.eq : {});
    return typeof root.petSvg === "function" ? root.petSvg(type, mood, eq, "full", "width:100%;height:auto;overflow:visible") : "";
  }
  // the pet walks along the progress bar toward a star; react() makes it cheer (with confetti) or look surprised
  function head() {
    var n = run.steps.length,
      pct = Math.round((100 * run.i) / n),
      from = run.shown == null ? pct : run.shown;
    run.shown = pct;
    setTimeout(function () {
      var w = document.getElementById("swWalk"),
        f = document.getElementById("swFill");
      if (w) w.style.left = pct + "%";
      if (f) f.style.width = pct + "%";
    }, 60);
    return '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">' + (run.mode === "review" ? "Review" : "Lesson " + run.id) + " · " + Math.min(run.i + 1, n) + " / " + n + "</span></div>" +
      '<div class="sw-ptrack"><div class="sw-ptr"><i id="swFill" style="width:' + from + '%"></i></div><span class="sw-pwalk" id="swWalk" style="left:' + from + '%">' + petArt("happy") + '</span><span class="sw-pgoal">' + scenery("star") + "</span></div>";
  }
  function react(good) {
    var w = document.getElementById("swWalk");
    if (!w) return;
    w.innerHTML = petArt(good ? "excited" : "surprised");
    w.classList.remove("sw-wj");
    if (good) {
      void w.offsetWidth;
      w.classList.add("sw-wj");
      try {
        var r = w.getBoundingClientRect();
        if (hooks.burst) hooks.burst(r.left + r.width / 2, r.top);
      } catch (e) {}
    }
    setTimeout(function () {
      if (document.getElementById("swWalk") === w) w.innerHTML = petArt("happy");
    }, 1400);
  }
  function bindQuit() {
    document.getElementById("swQuit").onclick = function () {
      goBack();
    };
  }
  function showStep() {
    if (run.i >= run.steps.length) {
      finish();
      return;
    }
    var st = run.steps[run.i];
    if (st.t === "meet") meet(st);
    else if (st.t === "listen") listenTap(st);
    else if (st.t === "find") findIt(st);
    else if (st.t === "pic") picSentence(st);
    else build(st);
  }
  function nextStep() {
    run.i++;
    showStep();
  }

  function sentenceHtml(w, sent) {
    return pieces(sent).map(function (p) {
      return p.k ? (p.k === wkey(w) ? "<b>" + esc(p.t) + "</b>" : esc(p.t)) : esc(p.t);
    }).join("");
  }
  function meet(st) {
    var info = wordInfo(st.w);
    box.innerHTML = head() + '<div class="sw-card"><div class="sw-kind" style="background:#D9577F">New word</div>' + art(st.w) + '<div class="sw-big sw-wordtile">' + esc(st.w) + '</div>' +
      '<button class="sw-say" id="swSayW">' + SPEAKER + ' Hear it</button>' +
      '<div class="sw-sent">' + sentenceHtml(st.w, info.s) + '</div><button class="sw-say sw-alt" id="swSayS">' + SPEAKER + ' Hear the sentence</button><br>' +
      '<button class="sw-go" id="swNext">' + (run.i < run.words.length - 1 ? "Next word →" : "Let’s practise →") + "</button></div>";
    bindQuit();
    document.getElementById("swSayW").onclick = function () {
      play("w", st.w);
    };
    document.getElementById("swSayS").onclick = function () {
      play("s", st.w);
    };
    document.getElementById("swNext").onclick = nextStep;
    play("w", st.w);
  }

  // record what happened to a word the first time it was tried in this run
  function note(w, right) {
    var k = wkey(w);
    if (run.first[k] === undefined) run.first[k] = right;
    else if (right === false) run.first[k] = false; // one slip anywhere in the lesson counts against the word
  }
  function tell(text, good) {
    var m = document.getElementById("swMsg");
    if (m) {
      m.textContent = text;
      m.className = "sw-msg " + (good ? "sw-good" : "sw-bad");
    }
    if (text) react(good);
  }
  function listenTap(st) {
    var opts = shuffle([st.w].concat(distractors(st.w, run.pool, run.rnd, run.words)), run.rnd),
      tried = false;
    box.innerHTML = head() + '<div class="sw-card"><div class="sw-kind" style="background:#2A66C9">Listen and tap</div><div class="sw-sent">Which word do you hear?</div>' +
      '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><div class="sw-opts" id="swOpts">' +
      opts.map(function (w) {
        return '<button class="sw-opt" data-w="' + esc(w) + '">' + esc(w) + "</button>";
      }).join("") + '</div><div class="sw-msg" id="swMsg"></div></div>';
    bindQuit();
    document.getElementById("swHear").onclick = function () {
      play("w", st.w);
    };
    Array.prototype.forEach.call(box.querySelectorAll(".sw-opt"), function (b) {
      b.onclick = function () {
        if (b.classList.contains("sw-ok")) return;
        var right = wkey(b.getAttribute("data-w")) === wkey(st.w);
        if (!tried) {
          note(st.w, right);
          tried = true;
        } else if (!right) note(st.w, false);
        if (right) {
          b.classList.add("sw-ok");
          sfx("cheer");
          tell("Yes! " + st.w, true);
          setTimeout(nextStep, 900);
        } else {
          b.classList.add("sw-bad");
          sfx("poke");
          tell("Listen again and try once more.", false);
          setTimeout(function () {
            b.classList.remove("sw-bad");
          }, 400);
        }
      };
    });
    setTimeout(function () {
      play("w", st.w);
    }, 150);
  }
  function findIt(st) {
    var info = wordInfo(st.w),
      tried = false;
    box.innerHTML = head() + '<div class="sw-card"><div class="sw-kind" style="background:#1F8A55">Find the word</div>' + art(st.w, true) + '<div class="sw-sent">Tap <span class="sw-hl">' + esc(st.w) + "</span></div>" +
      '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it</button><div class="sw-sent" id="swSent" style="margin-top:18px">' +
      pieces(info.s).map(function (p) {
        return p.k ? '<button class="sw-tok" data-k="' + p.k + '">' + esc(p.t) + "</button>" : "<span>" + esc(p.t) + "</span>";
      }).join("") + '</div><div class="sw-msg" id="swMsg"></div></div>';
    bindQuit();
    document.getElementById("swHear").onclick = function () {
      play("w", st.w);
    };
    Array.prototype.forEach.call(box.querySelectorAll(".sw-tok"), function (b) {
      b.onclick = function () {
        var right = b.getAttribute("data-k") === wkey(st.w);
        if (!tried) {
          note(st.w, right);
          tried = true;
        } else if (!right) note(st.w, false);
        if (right) {
          b.style.background = "#DFF5E7";
          b.style.borderColor = "#35B779";
          sfx("cheer");
          tell("You found it!", true);
          readThenNext(st.w, 1500);
        } else {
          b.style.background = "#FFE3DE";
          b.style.borderColor = "#FF6B4A";
          sfx("poke");
          tell("Not that one. Look again.", false);
        }
      };
    });
    play("w", st.w);
  }
  function build(st) {
    var info = wordInfo(st.w),
      ps = pieces(info.s),
      toks = ps.filter(function (p) {
        return p.k;
      }),
      order = [],
      want = toks.length,
      tried = false;
    var bag = shuffle(toks.map(function (p, i) {
      return { t: p.t, i: i };
    }), run.rnd);
    if (bag.map(function (x) {
      return x.i;
    }).join() === toks.map(function (p, i) {
      return i;
    }).join()) bag.reverse();
    box.innerHTML = head() + '<div class="sw-card"><div class="sw-kind" style="background:#5B3FC4">Build the sentence</div>' + art(st.w, true) + '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear the sentence</button>' +
      '<div class="sw-slots" id="swSlots"></div><div id="swBag"></div><div class="sw-msg" id="swMsg"></div>' +
      '<button class="sw-say sw-alt" id="swUndo">Start again</button></div>';
    bindQuit();
    function paint() {
      document.getElementById("swSlots").innerHTML = order.map(function (x) {
        return '<span class="sw-tok">' + esc(x.t) + "</span>";
      }).join("");
      document.getElementById("swBag").innerHTML = bag.map(function (x) {
        var used = order.indexOf(x) >= 0;
        return '<button class="sw-tok' + (used ? " sw-used" : "") + '" data-i="' + x.i + '"' + (used ? " disabled" : "") + ">" + esc(x.t) + "</button>";
      }).join("");
      Array.prototype.forEach.call(document.querySelectorAll("#swBag .sw-tok"), function (b) {
        b.onclick = function () {
          var x = bag.filter(function (y) {
            return y.i === +b.getAttribute("data-i");
          })[0];
          if (x.t === toks[order.length].t) {
            order.push(x);
            sfx("pop");
            if (order.length === want) {
              if (!tried) note(st.w, true);
              tell("You built it!", true);
              readThenNext(st.w, 1500);
              paint();
              return;
            }
            tell("", true);
          } else {
            if (!tried) {
              note(st.w, false);
              tried = true;
            }
            sfx("poke");
            tell("Not yet. What comes first? Listen again.", false);
          }
          paint();
        };
      });
    }
    document.getElementById("swHear").onclick = function () {
      play("s", st.w);
    };
    document.getElementById("swUndo").onclick = function () {
      order = [];
      tell("", true);
      paint();
    };
    paint();
    setTimeout(function () {
      play("s", st.w);
    }, 150);
  }

  /* ---- picture quiz: which sentence goes with the picture? ---- */
  function picSentence(st) {
    var sentences = {};
    D.lessons.forEach(function (l) {
      l.words.forEach(function (w) {
        sentences[w] = D.words[w].s;
      });
    });
    var ws = sentenceChoices(st.w, run.pool, sentences, run.rnd, confusable),
      tried = false;
    box.innerHTML = head() + '<div class="sw-card"><div class="sw-kind" style="background:#FFC93C;color:#1E2A4A">Picture quiz</div>' + art(st.w) + '<div class="sw-sent" style="font-size:22px">Which sentence goes with the picture?</div><div id="swOpts">' +
      ws.map(function (w) {
        return '<div class="sw-orow"><button class="sw-spk" data-w="' + esc(w) + '" aria-label="Hear it">' + SPEAKER + '</button><button class="sw-sopt" data-w="' + esc(w) + '">' + esc(sentences[w]) + "</button></div>";
      }).join("") + '</div><div class="sw-msg" id="swMsg"></div></div>';
    bindQuit();
    Array.prototype.forEach.call(box.querySelectorAll(".sw-spk"), function (b) {
      b.onclick = function () {
        play("s", b.getAttribute("data-w"));
      };
    });
    Array.prototype.forEach.call(box.querySelectorAll(".sw-sopt"), function (b) {
      b.onclick = function () {
        if (b.classList.contains("sw-ok")) return;
        var right = wkey(b.getAttribute("data-w")) === wkey(st.w);
        if (!tried) {
          note(st.w, right);
          tried = true;
        } else if (!right) note(st.w, false);
        if (right) {
          b.classList.add("sw-ok");
          sfx("cheer");
          tell("Yes, that is the picture!", true);
          readThenNext(st.w, 1500);
        } else {
          b.classList.add("sw-bad");
          sfx("poke");
          tell("Look at the picture again.", false);
          setTimeout(function () {
            b.classList.remove("sw-bad");
          }, 400);
        }
      };
    });
    setTimeout(function () {
      play("s", st.w);
    }, 150);
  }

  /* ---- memory match: turn over a picture and a sentence that belong together ---- */
  function memoryWords(s) {
    var seen = allWords().filter(function (w) {
      return s.words[wkey(w)];
    });
    if (seen.length < 4) seen = D.lessons[0].words.concat(D.lessons[1].words);
    return compatibleSubset(shuffle(seen, seeded(Date.now() % 100003)), confusable, 6, 4);
  }
  function startMemory(words) {
    trk("sw_game_start", "memory", "", "game");
    var rnd = seeded(Date.now() % 9973),
      cards = memoryCards(compatibleSubset(words, confusable, 6, 4), rnd),
      open = [],
      found = 0,
      tries = 0,
      lock = false,
      pairs = cards.length / 2;
    run = { mode: "memory", words: words, steps: [], i: 0, first: {}, rnd: rnd };
    function paint() {
      box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Memory match · ' + found + " / " + pairs + " pairs</span></div>" +
        '<div class="sw-card"><div class="sw-kind">Memory match</div><div class="sw-sent" style="font-size:20px">Turn over a picture and the sentence that goes with it.</div><div class="sw-mem ' + (cards.length === 10 ? "sw-c5" : "sw-c4") + '" id="swMem2">' +
        cards.map(function (c, i) {
          var face = c.kind === "pic" ? root.SWArt && root.SWArt.has(c.w) ? root.SWArt.scene(c.w) : "" : "<span>" + esc(wordInfo(c.w).s) + "</span>";
          return '<button class="sw-mc' + (c.done ? " sw-pair sw-up" : c.up ? " sw-up" : "") + '" data-i="' + i + '" aria-label="Card"><span class="sw-mback">?</span><span class="sw-mface">' + face + "</span></button>";
        }).join("") + '</div><div class="sw-msg" id="swMsg"></div></div>';
      bindQuit();
      Array.prototype.forEach.call(box.querySelectorAll(".sw-mc"), function (b) {
        b.onclick = function () {
          var c = cards[+b.getAttribute("data-i")];
          if (lock || c.up || c.done) return;
          c.up = true;
          b.classList.add("sw-up");
          if (c.kind === "txt") play("s", c.w);
          else sfx("pop");
          open.push(c);
          if (open.length < 2) return;
          tries++;
          if (isPair(open[0], open[1])) {
            open[0].done = open[1].done = true;
            found++;
            sfx("cheer");
            var o = open;
            open = [];
            if (found === pairs) setTimeout(function () {
              memoryDone(tries, pairs, words);
            }, 900);
            else paint();
          } else {
            lock = true;
            sfx("poke");
            setTimeout(function () {
              open[0].up = open[1].up = false;
              open = [];
              lock = false;
              paint();
            }, 1100);
          }
        };
      });
    }
    paint();
  }
  function memoryDone(tries, pairs, words) {
    var s = readState(),
      today = dayStr(),
      key = "g" + today,
      stars = 0,
      lines = [];
    if (!s.rev[key]) {
      s.rev[key] = Date.now();
      stars = 1;
      lines.push([1, "Played the memory game", "\u73a9\u4e86\u7ffb\u724c\u6e38\u620f"]);
    }
    writeState(s);
    var got = 0;
    if (stars && hooks.award) {
      try {
        got = hooks.award(stars);
        if (hooks.toast) hooks.toast(lines, got, got < stars);
      } catch (e) {}
    }
    sfx("big");
    try {
      if (hooks.burst) hooks.burst(root.innerWidth / 2, 160);
    } catch (e) {}
    var rating = tries <= pairs + 2 ? "Amazing memory!" : tries <= pairs * 2 ? "Great job!" : "You did it!";
    trk("sw_game_done", "memory", tries + " tries", "game");
    box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button></div><div class="sw-card"><div class="sw-kind">Memory match done</div><div class="sw-stage">' + party() + '<div class="sw-pet sw-pets sw-dance">' + petArt("excited") + '</div></div><div class="sw-big" style="font-size:54px">' + rating + "</div>" +
      '<div class="sw-sent" style="font-size:22px">You found all ' + pairs + " pairs in " + tries + " tries.</div>" +
      '<button class="sw-go" id="swAgain">Play again</button> <button class="sw-say sw-alt" id="swMap">' + backLabel() + '</button></div>';
    document.getElementById("swQuit").onclick = goBack;
    document.getElementById("swMap").onclick = goBack;
    document.getElementById("swAgain").onclick = function () {
      startMemory(words.length >= 4 ? shuffle(words, seeded(Date.now() % 7919)) : words);
    };
    refreshButton();
  }

  /* ---- shared by the balloon and feeding games ---- */
  function feedLabel() {
    var p = hooks.pet ? hooks.pet() : null;
    return "Feed " + (p && p.name ? p.name : "a pet");
  }
  function learnedWords(s) {
    return allWords().filter(function (w) {
      return s.words[wkey(w)];
    });
  }
  function firstLessonsWords() {
    return D.lessons[0].words.concat(D.lessons[1].words, D.lessons[2].words);
  }
  // n words for a game: the ones due for review first, then ones already met; before anything is learned, the first lessons
  function gameWords(s, n, dueFirst) {
    var all = allWords(),
      seen = all.filter(function (w) {
        return s.words[wkey(w)];
      }),
      due = dueWords(s, dayStr());
    due = all.filter(function (w) {
      return due.indexOf(wkey(w)) >= 0;
    });
    var others = seen.length >= 4 ? seen : firstLessonsWords();
    return pickWords(dueFirst ? due : [], others, n, seeded(Date.now() % 100003));
  }
  // the end of a game: what was right on the first try updates the word boxes; the first game of each kind each day earns a star
  function endGame(kind, firstTry, title, big, line, again, extra, after, opts) {
    var s = readState(),
      today = dayStr(),
      key = kind + today,
      stars = 0,
      lines = [],
      right = 0,
      total = 0;
    Object.keys(firstTry).forEach(function (k) {
      total++;
      if (firstTry[k]) right++;
      if (s.words[k] && !(opts && opts.keepMisses && !firstTry[k])) s.words[k] = applyResult(s.words[k], firstTry[k], today); // spelling does not send a word back: it only moves up
    });
    trk("sw_game_done", kind === "f" ? "feed" : kind === "s" ? "spell" : kind === "r" ? "rush" : "balloon", right + "/" + total, kind === "b" ? gameTag : "game");
    if (!s.rev[key]) {
      s.rev[key] = Date.now();
      stars = 1;
      lines.push([1, title, ""]);
    }
    writeState(s);
    var got = 0;
    if (stars && hooks.award) {
      try {
        got = hooks.award(stars);
        if (hooks.toast) hooks.toast(lines, got, got < stars);
      } catch (e) {}
    }
    sfx("big");
    try {
      if (hooks.burst) hooks.burst(root.innerWidth / 2, 160);
    } catch (e) {}
    box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button></div><div class="sw-card' + (opts && opts.dark ? " sw-dk" : "") + '"><div class="sw-kind">' + esc(title) + "</div>" + (extra || "") + '<div class="sw-big" style="font-size:54px">' + big(right, total) + "</div>" +
      '<div class="sw-sent" style="font-size:22px">' + line(right, total) + '</div><button class="sw-go" id="swAgain">Play again</button> <button class="sw-say sw-alt" id="swMap">' + backLabel() + '</button></div>';
    document.getElementById("swQuit").onclick = goBack;
    document.getElementById("swMap").onclick = goBack;
    document.getElementById("swAgain").onclick = again;
    refreshButton();
    if (after) after();
    return right;
  }

  /* ---- balloon pop: pop the balloon with the word you hear ---- */
  var BAL = ["#E5483A", "#3D8BF2", "#FFC93C", "#35B779", "#FF8FB1", "#8B6BE8"];
  function balloonSvg(c) {
    var inner = '<path d="M40 92 Q31 106 40 116 Q47 124 40 131" fill="none" stroke="#8795B4" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M35.5 94 L40 87 L44.5 94Z" fill="' + c + '"/>' +
      '<path d="M40 8 C12 8 4 34 10 54 C16 74 32 86 40 88 C48 86 64 74 70 54 C76 34 68 8 40 8Z" fill="' + c + '"/>' +
      '<ellipse cx="25" cy="30" rx="6" ry="11" transform="rotate(20 25 30)" fill="#FFFFFF" opacity=".4"/>';
    if (typeof root.softSvg === "function") inner = root.softSvg(inner); // the shading goes inside the svg, never around it
    return '<svg viewBox="0 0 80 132" aria-hidden="true">' + inner + "</svg>";
  }
  // a balloon bursts: a flash and a star, bits of the balloon flying out, a "POP!" and the knot and string falling
  function explode(b, color) {
    var sky = document.getElementById("swSky");
    if (!sky) return;
    var sr = sky.getBoundingClientRect(),
      br = b.getBoundingClientRect(),
      cx = br.left - sr.left + br.width / 2,
      cy = br.top - sr.top + br.height * 0.36,
      boom = document.createElement("div"),
      calm = false,
      i;
    try {
      calm = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {}
    boom.className = "sw-boom";
    boom.style.left = cx + "px";
    boom.style.top = cy + "px";
    var h = '<div class="sw-flash"></div>';
    var sp = "";
    for (i = 0; i < 16; i++) {
      var a = (i * Math.PI) / 8,
        r = i % 2 ? 34 : 60;
      sp += (i ? "L" : "M") + (62 + Math.cos(a) * r).toFixed(1) + " " + (62 + Math.sin(a) * r).toFixed(1);
    }
    h += '<svg class="sw-star" viewBox="0 0 124 124" aria-hidden="true"><path d="' + sp + 'Z" fill="#FFD23F" stroke="#FF8A1F" stroke-width="3" stroke-linejoin="round"/></svg>';
    h += '<div class="sw-ptxt">POP!</div>';
    for (i = 0; i < 12; i++)
      h += '<svg class="sw-shard" viewBox="0 0 20 20" aria-hidden="true"><path d="M2 15 Q6 1 18 5 Q14 15 2 15Z" fill="' + color + '"/><path d="M5 11 Q8 5 14 7" fill="none" stroke="#fff" stroke-width="1.6" opacity=".55" stroke-linecap="round"/></svg>';
    h += '<svg class="sw-shard sw-knot" viewBox="0 0 20 20" aria-hidden="true" style="top:14px"><path d="M10 3 L14 10 L6 10Z" fill="' + color + '"/><path d="M10 10 Q6 14 10 17" fill="none" stroke="#8795B4" stroke-width="1.6" stroke-linecap="round"/></svg>';
    boom.innerHTML = h;
    sky.appendChild(boom);
    sky.classList.remove("sw-shake");
    if (!calm) sky.classList.add("sw-shake");
    var kids = boom.children;
    if (!calm && kids[0] && kids[0].animate) {
      try {
        kids[0].animate([{ transform: "scale(.2)", opacity: 1 }, { transform: "scale(1.5)", opacity: 0 }], { duration: 380, easing: "ease-out", fill: "forwards" });
        kids[1].animate([{ transform: "scale(.3) rotate(-12deg)", opacity: 1 }, { transform: "scale(1.15) rotate(8deg)", opacity: 1, offset: 0.35 }, { transform: "scale(1.3) rotate(8deg)", opacity: 0 }], { duration: 520, easing: "ease-out", fill: "forwards" });
        kids[2].animate([{ transform: "scale(.2) rotate(-14deg)", opacity: 0 }, { transform: "scale(1.15) rotate(-8deg)", opacity: 1, offset: 0.3 }, { transform: "scale(1) rotate(-8deg) translateY(-18px)", opacity: 0 }], { duration: 900, easing: "ease-out", fill: "forwards", delay: 60 });
        for (i = 3; i < kids.length; i++) {
          var ang = Math.random() * 6.283,
            dist = 70 + Math.random() * 70,
            dx = Math.cos(ang) * dist,
            dy = Math.sin(ang) * dist,
            fall = kids[i].className.baseVal.indexOf("sw-knot") >= 0;
          kids[i].animate(
            fall
              ? [{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: "translate(" + (Math.random() * 30 - 15) + "px,150px) rotate(220deg)", opacity: 0 }]
              : [{ transform: "translate(0,0) rotate(0) scale(1)", opacity: 1 }, { transform: "translate(" + dx + "px," + (dy + 38) + "px) rotate(" + (Math.random() * 720 - 360) + "deg) scale(.5)", opacity: 0 }],
            { duration: fall ? 1000 : 800 + Math.random() * 300, easing: fall ? "ease-in" : "cubic-bezier(.15,.7,.3,1)", fill: "forwards" }
          );
        }
      } catch (e) {}
    }
    setTimeout(function () {
      if (boom.parentNode) boom.parentNode.removeChild(boom);
      sky.classList.remove("sw-shake");
    }, 1100);
  }
  // the unit's chest: the first time it is opened it gives stars and the unit's prize; the reveal goes into the end screen of the balloon game
  function chestReveal(cr) {
    var P = root.SWPrizes,
      prize = P ? P.forUnit(cr.s, cr.u) : null,
      s = readState(),
      first = claimChest(s, cr.s, cr.u),
      p = hooks.pet ? hooks.pet() : null,
      eq2 = {},
      k;
    if (first) {
      writeState(s);
      trk("sw_chest", stageTag(cr.s) + "-u" + cr.u, "", "chest");
      try {
        if (hooks.gift) hooks.gift(CHEST_STARS);
        if (hooks.toast) hooks.toast([[CHEST_STARS, "Treasure chest", "宝箱奖励"]], CHEST_STARS, false);
      } catch (e) {}
    }
    if (p && p.eq) for (k in p.eq) if (p.eq.hasOwnProperty(k)) eq2[k] = p.eq[k];
    if (prize) eq2[prize.slot] = prize.id;
    var chip = prize ? '<span class="sw-ritem"><span class="sw-ith sw-rbig">' + prizeThumb(prize.id) + "</span>" + esc(prize.name) + "</span>" : "",
      html = '<div class="sw-reveal"><div class="sw-rchest">' + scenery("chest", { state: "open", s: cr.s }) + '</div><div class="sw-rt">' + (first ? "Chest opened!" : "Chest opened before") + "</div>" +
        '<div class="sw-rrow">' + (first ? '<span class="sw-rstar">+' + CHEST_STARS + " ★</span>" : "") + chip + "</div>" +
        (first && prize && p ? '<div class="sw-stage sw-rpet"><div class="sw-pet sw-pets sw-dance">' + petArt("excited", eq2) + '</div></div><button class="sw-go" id="swWear">Wear it now</button>' : first && prize ? '<div class="sw-msg">Adopt a pet on the pet page to wear it.</div>' : "") + "</div>";
    return {
      html: html,
      after: function () {
        var b = document.getElementById("swWear");
        if (b)
          b.onclick = function () {
            var ok = false;
            try {
              ok = hooks.wear ? hooks.wear(prize.id) : false;
            } catch (e) {}
            b.textContent = ok ? "Wearing ✓" : "Open the pet page to wear it";
            b.disabled = true;
            if (ok) sfx("cheer");
          };
        setTimeout(function () {
          sfx(first ? "sparkle" : "cheer");
        }, 350);
      },
    };
  }
  function startBalloons(words) {
    var cr = chestRun;
    chestRun = null;
    gameTag = cr ? "challenge" : "game";
    trk("sw_game_start", "balloon", cr ? "unit " + cr.u : "", gameTag);
    var pool = gamePool(learnedWords(readState()), words, firstLessonsWords(), 4),
      rounds = roundsFor(words, pool, seeded(Date.now() % 9973), 3),
      first = {},
      i = 0;
    function show() {
      if (i >= rounds.length) {
        var rv = cr ? chestReveal(cr) : null;
        endGame("b", first, cr ? "Unit challenge" : "Popped the balloons", function (r, t) {
          return r >= t ? "Wow, all of them!" : "You popped them all!";
        }, function (r, t) {
          return r + " of " + t + " on the first try.";
        }, function () {
          startBalloons(gameWords(readState(), 8));
        }, cr ? rv.html : (function () {
          var ks = Object.keys(first),
            all = ks.length > 0 && ks.every(function (k) {
              return first[k];
            });
          return '<div class="sw-stage">' + (all ? party() : "") + '<div class="sw-pet sw-pets ' + (all ? "sw-dance" : "sw-hop") + '">' + petArt(all ? "excited" : "happy") + "</div></div>";
        })(), cr ? rv.after : null);
        return;
      }
      var r = rounds[i],
        k = wkey(r.w),
        tries = 0,
        off = i % BAL.length;
      box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Balloon pop · ' + (i + 1) + " / " + rounds.length + "</span></div>" +
        '<div class="sw-card"><div class="sw-kind">Balloon pop</div><div class="sw-sent" style="font-size:22px">Pop the balloon with the word you hear!</div>' +
        '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><div class="sw-sky sw-new" id="swSky">' +
        r.opts.map(function (w, n) {
          return '<button class="sw-bal" data-w="' + esc(w) + '" style="left:' + (3 + n * 24.5) + "%;animation-delay:" + (n * 0.5).toFixed(1) + 's" data-c="' + BAL[(off + n) % BAL.length] + '">' + balloonSvg(BAL[(off + n) % BAL.length]) + '<span class="sw-bw">' + esc(w) + "</span></button>";
        }).join("") + '</div><div class="sw-msg" id="swMsg"></div></div>';
      bindQuit();
      document.getElementById("swHear").onclick = function () {
        play("w", r.w);
      };
      Array.prototype.forEach.call(box.querySelectorAll(".sw-bal"), function (b) {
        b.onclick = function () {
          var right = wkey(b.getAttribute("data-w")) === k;
          if (first[k] === undefined) first[k] = right;
          else if (!right) first[k] = false;
          if (right) {
            var rc = b.getBoundingClientRect();
            explode(b, b.getAttribute("data-c") || "#E5483A");
            b.classList.add("sw-pop");
            Array.prototype.forEach.call(box.querySelectorAll(".sw-bal"), function (o) {
              if (o !== b) o.classList.add("sw-away");
            });
            sfx("bang");
            try {
              if (hooks.burst) hooks.burst(rc.left + rc.width / 2, rc.top + rc.height / 3);
            } catch (e) {}
            tell("Pop! " + r.w, true);
            setTimeout(function () {
              i++;
              show();
            }, 1250);
          } else {
            tries++;
            b.classList.add("sw-wob");
            sfx("poke");
            tell("Listen again and try once more.", false);
            setTimeout(function () {
              b.classList.remove("sw-wob");
            }, 400);
            if (tries >= 2)
              Array.prototype.forEach.call(box.querySelectorAll(".sw-bal"), function (o) {
                if (wkey(o.getAttribute("data-w")) === k) o.classList.add("sw-hint");
              });
          }
        };
      });
      setTimeout(function () {
        play("w", r.w);
      }, 600);
    }
    run = { mode: "balloons", steps: [], i: 0, first: first, rnd: seeded(1) };
    show();
  }

  // hearts, stars and music notes that float up around a dancing pet
  function party() {
    var heart = '<svg viewBox="-14 -14 28 28" aria-hidden="true"><path d="M0 9 C-15 -2 -13 -14 -5 -14 C-2 -14 0 -11 0 -11 C0 -11 2 -14 5 -14 C13 -14 15 -2 0 9Z" fill="#FF6B8A"/></svg>',
      note = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17V6l10-2v11" fill="none" stroke="#6A48E8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="6.5" cy="17.5" rx="3.6" ry="2.8" fill="#6A48E8"/><ellipse cx="16.5" cy="14.5" rx="3.6" ry="2.8" fill="#6A48E8"/></svg>',
      sp = "";
    for (var i = 0; i < 6; i++) {
      var a = -Math.PI / 2 + (i * Math.PI) / 3,
        r = 12;
      sp += (i ? "L" : "M") + (14 + Math.cos(a) * r).toFixed(1) + " " + (14 + Math.sin(a) * r).toFixed(1);
    }
    var star = '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 1 L17.5 10.5 L27 14 L17.5 17.5 L14 27 L10.5 17.5 L1 14 L10.5 10.5Z" fill="#FFD23F" stroke="#E0A800" stroke-width="1.4" stroke-linejoin="round"/></svg>',
      kinds = [note, heart, star, heart, note, star, heart, note, star, heart],
      h = "";
    kinds.forEach(function (k, n) {
      h += '<span class="sw-pf" style="left:' + (4 + n * 9.6).toFixed(1) + "%;animation-delay:" + ((n * 0.37) % 2.6).toFixed(2) + 's">' + k + "</span>";
    });
    return h;
  }

  /* ---- feed your pet words: the pet asks for a snack, you give it the right plate; every bite makes it feel better and it never goes back ---- */
  var HEARTSVG = '<svg viewBox="-14 -14 28 28" aria-hidden="true"><path d="M0 9 C-15 -2 -13 -14 -5 -14 C-2 -14 0 -11 0 -11 C0 -11 2 -14 5 -14 C13 -14 15 -2 0 9Z" fill="#FF6B8A"/></svg>';
  // a snack from the shop's art (viewBox 60 x 60), shaded like the pets
  function foodSvg(name) {
    var f = root.FOOD && root.FOOD[name];
    if (!f) return "";
    return '<svg viewBox="0 0 60 60" aria-hidden="true">' + (typeof root.softSvg === "function" ? root.softSvg(f) : f) + "</svg>";
  }
  function startFeed(words) {
    gameTag = "game";
    trk("sw_game_start", "feed", "", "game");
    var p = hooks.pet ? hooks.pet() : null,
      type = p && root.PETS && root.PETS[p.type] ? p.type : "cat",
      name = p && p.name ? p.name : "your pet",
      Name = p && p.name ? p.name : "Your pet", // the same name at the start of a sentence
      eq = p && p.eq ? p.eq : {},
      menu = root.MENU && root.MENU[type] ? root.MENU[type] : [],
      pool = gamePool(learnedWords(readState()), words, firstLessonsWords(), 4),
      rounds = roundsFor(words, pool, seeded(Date.now() % 7907), 2),
      first = {},
      i = 0,
      busy = false;
    function pet(mood) {
      return typeof root.petSvg === "function" ? root.petSvg(type, mood, eq, "full", "width:100%;height:auto;overflow:visible") : "";
    }
    // the pet gets a little rounder with every bite
    function body(n, mood) {
      return '<div class="sw-pbody" id="swBody" style="width:' + (100 + 3 * n) + '%">' + pet(mood) + "</div>";
    }
    function askLine(n) {
      var f = feelFor(n, rounds.length);
      return f === "hungry" ? Name + " is hungry! Which word is it asking for?" : f === "okay" ? Name + " feels a little better. Which word now?" : f === "happy" ? Name + " is happy! Which word next?" : Name + " is almost full! Which word next?";
    }
    function snack(n) {
      return menu.length ? menu[n % menu.length] : "";
    }
    // a few hearts or crumbs that float up or fall near the pet
    function fx(kind) {
      var holder = document.getElementById("swFx");
      if (!holder) return;
      for (var h = 0; h < 4; h++) {
        var el = document.createElement("span");
        el.className = "sw-fxi " + (kind === "heart" ? "sw-fxh" : "sw-fxc");
        el.style.left = 38 + h * 8 + "%";
        el.style.animationDelay = h * 0.12 + "s";
        if (kind === "heart") el.innerHTML = HEARTSVG;
        holder.appendChild(el);
        (function (x) {
          setTimeout(function () {
            if (x.parentNode) x.parentNode.removeChild(x);
          }, 1500);
        })(el);
      }
    }
    function show() {
      if (i >= rounds.length) {
        try {
          if (hooks.feedPet && p) hooks.feedPet(20 + 4 * Object.keys(first).filter(function (k) {
            return first[k];
          }).length);
        } catch (e) {}
        var ks = Object.keys(first),
          perfect = ks.length > 0 && ks.every(function (k) {
            return first[k];
          });
        endGame("f", first, "Fed " + name, function (r, t) {
          return perfect ? Name + " is dancing!" : r >= 5 ? Name + " is full!" : Name + " feels better!";
        }, function (r, t) {
          return (perfect ? "Perfect! " : "") + (p ? Name + " is not hungry any more. " : "Adopt a pet on the pet page to feed it for real. ") + r + " of " + t + " words right on the first try.";
        }, function () {
          startFeed(gameWords(readState(), 6, true));
        }, '<div class="sw-stage">' + (perfect ? party() : "") + '<div class="sw-pet ' + (perfect ? "sw-dance" : "sw-hop") + '" id="swPetEnd">' + body(rounds.length, perfect ? "excited" : "happy") + "</div></div>",
        function () {
          setTimeout(function () {
            sfx(perfect ? "sparkle" : "cheer");
            try {
              if (root.PetSound && root.PetSound.voice) root.PetSound.voice(type);
            } catch (e) {}
          }, 450);
        });
        return;
      }
      busy = false;
      var r = rounds[i],
        k = wkey(r.w),
        want = snack(i);
      box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Feed ' + esc(name) + " · " + (i + 1) + " / " + rounds.length + "</span></div>" +
        '<div class="sw-card"><div class="sw-kind">Feed ' + esc(name) + '</div><div class="sw-stage sw-fstage"><div class="sw-pet" id="swPet">' + body(i, feelFor(i, rounds.length)) + "</div>" +
        (want ? '<div class="sw-want" id="swWant"><span>' + foodSvg(want) + "</span></div>" : "") + '<div class="sw-fx" id="swFx"></div></div>' +
        '<div class="sw-tummy"><div class="sw-bar"><i id="swTum" style="width:' + Math.round((100 * i) / rounds.length) + '%"></i></div><span class="sw-th">' + HEARTSVG + "</span></div>" +
        '<div class="sw-sent" id="swAsk" style="font-size:22px">' + esc(askLine(i)) + '</div><button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button>' +
        '<div class="sw-plates" id="swPlates">' + r.opts.map(function (w) {
          return '<button class="sw-plate" data-w="' + esc(w) + '">' + esc(w) + "</button>";
        }).join("") + '</div><div class="sw-msg" id="swMsg"></div></div>';
      bindQuit();
      var petBox = document.getElementById("swPet");
      function setFeel(mood, n) {
        petBox.innerHTML = body(n, mood);
      }
      document.getElementById("swHear").onclick = function () {
        play("w", r.w);
      };
      Array.prototype.forEach.call(box.querySelectorAll(".sw-plate"), function (b) {
        b.onclick = function () {
          if (busy || b.classList.contains("sw-ok")) return;
          var right = wkey(b.getAttribute("data-w")) === k;
          if (first[k] === undefined) first[k] = right;
          else if (!right) first[k] = false;
          if (right) {
            busy = true;
            b.classList.add("sw-ok");
            Array.prototype.forEach.call(box.querySelectorAll(".sw-plate"), function (o) {
              o.disabled = true;
            });
            // 1. the snack lifts off the plate and flies into the pet's mouth
            setTimeout(function () {
              sfx("pop");
              var br = b.getBoundingClientRect(),
                pr = petBox.getBoundingClientRect(),
                mx = pr.left + pr.width / 2,
                my = pr.top + pr.height * 0.4,
                sx = br.left + br.width / 2,
                sy = br.top + br.height / 2,
                fly = document.createElement("div");
              b.classList.add("sw-eaten");
              fly.className = "sw-fly";
              fly.style.left = sx - 28 + "px";
              fly.style.top = sy - 28 + "px";
              fly.innerHTML = foodSvg(want) || HEARTSVG;
              ov.appendChild(fly);
              setFeel("surprised", i); // the mouth opens wide
              var done = false;
              function land() {
                if (done) return;
                done = true;
                if (fly.parentNode) fly.parentNode.removeChild(fly);
                // 2. chew a few times, crumbs and hearts; the face gets better for good
                var got = i + 1;
                setFeel("eat", got);
                var bodyEl = document.getElementById("swBody");
                if (bodyEl) bodyEl.classList.add("sw-chew");
                fx("crumb");
                sfx("pop");
                setTimeout(function () {
                  sfx("pop");
                }, 260);
                setTimeout(function () {
                  sfx("pop");
                }, 520);
                var tum = document.getElementById("swTum");
                if (tum) tum.style.width = Math.round((100 * got) / rounds.length) + "%";
                setTimeout(function () {
                  setFeel(feelFor(got, rounds.length), got);
                  fx("heart");
                  petBox.classList.add("sw-jump");
                  sfx("cheer");
                  try {
                    if (root.PetSound && root.PetSound.voice) root.PetSound.voice(type);
                  } catch (e) {}
                  var ask = document.getElementById("swAsk");
                  if (ask) ask.textContent = got >= rounds.length ? Name + " is full!" : askLine(got);
                  tell("Yum! " + r.w, true);
                }, 850);
                setTimeout(function () {
                  i++;
                  show();
                }, 1900);
              }
              var still = false;
              try {
                still = !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);
              } catch (e) {}
              try {
                if (still) throw new Error("reduced motion");
                var dx = mx - sx,
                  dy = my - sy,
                  anim = fly.animate([
                    { transform: "translate(0px,0px) scale(1)", opacity: 1 },
                    { transform: "translate(" + dx * 0.45 + "px," + (dy * 0.45 - 70) + "px) scale(1.25)", opacity: 1, offset: 0.5 },
                    { transform: "translate(" + dx + "px," + dy + "px) scale(.4)", opacity: 0.95 },
                  ], { duration: 650, easing: "ease-in-out", fill: "forwards" });
                anim.onfinish = land;
                setTimeout(land, 800);
              } catch (e) {
                setTimeout(land, 450);
              }
            }, 300);
          } else {
            b.classList.add("sw-bad");
            setFeel("surprised", i);
            sfx("poke");
            tell(Name + " says: not that one. Listen again!", false);
            setTimeout(function () {
              b.classList.remove("sw-bad");
              if (!busy) setFeel(feelFor(i, rounds.length), i); // back to how it felt, never worse
            }, 700);
          }
        };
      });
      setTimeout(function () {
        play("w", r.w);
      }, 500);
    }
    run = { mode: "feed", steps: [], i: 0, first: first, rnd: seeded(2) };
    show();
  }

  /* ---- challenges for older children: spell the word you hear, and a 60-second speed round ---- */
  var KEYROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  function gTop(label) {
    return '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">' + esc(label) + "</span></div>";
  }
  // the words of one spelling game: the ones due for review first, then ones already met, each with at least two letters
  function spellList(s) {
    return spellable(gameWords(s, 16, true)).slice(0, 8);
  }
  // what a key press means: a letter, "back" or "enter" ("" for anything else); old WebViews only have keyCode
  function keyOf(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return "";
    var k = e.key,
      c = e.keyCode || e.which;
    if (k && k.length === 1 && /[a-zA-Z]/.test(k)) return k.toLowerCase();
    if (k === "Backspace" || c === 8) return "back";
    if (k === "Enter" || c === 13) return "enter";
    if (c >= 65 && c <= 90) return String.fromCharCode(c + 32);
    return "";
  }
  function plusText(el, text, bad) {
    if (!el) return;
    el.textContent = text;
    el.className = "sw-plus";
    void el.offsetWidth;
    el.className = "sw-plus sw-plgo" + (bad ? " sw-plbad" : "");
  }

  // Spell it: hear the word, type it letter by letter (on the screen keyboard or a real one). Three tries: after a wrong one the right letters
  // stay in place (green), the others can be fixed; the first wrong try shows the picture. A miss never sends the word back to box 1.
  function startSpell(list) {
    gameTag = "game";
    if (!list.length) {
      showHome();
      return;
    }
    trk("sw_game_start", "spell", "", "game");
    var first = {},
      i = 0,
      handler = null;
    function stop() {
      if (handler) {
        document.removeEventListener("keydown", handler);
        handler = null;
      }
    }
    run = { mode: "spell", steps: [], i: 0, first: first, rnd: seeded(1), stop: stop, at: 0 };
    var me = run,
      kbHtml = KEYROWS.map(function (row, ri) {
        var h = row.split("").map(function (c) {
          return '<button class="sw-key" data-k="' + c + '">' + c + "</button>";
        }).join("");
        if (ri === 2) h += '<button class="sw-key sw-kw" data-k="back" aria-label="Delete a letter">←</button>';
        return '<div class="sw-kr">' + h + "</div>";
      }).join("");
    function round() {
      stop();
      if (run !== me) return;
      if (i >= list.length) {
        me.done = true;
        spellDone(first);
        return;
      }
      me.at = i;
      var w = list[i],
        k = wkey(w),
        info = wordInfo(w) || { s: w },
        ans = spellForm(w),
        n = ans.length,
        cur = [],
        lock = [],
        hist = [],
        tries = 0,
        done = false,
        result = "",
        advanced = false,
        q;
      for (q = 0; q < n; q++) {
        cur[q] = ans.charAt(q) === "'" ? "'" : "";
        lock[q] = ans.charAt(q) === "'";
      }
      function nextEmpty() {
        for (var j = 0; j < n; j++) if (!lock[j] && !cur[j]) return j;
        return -1;
      }
      function row(chars, marks, at) {
        var h = "";
        for (var j = 0; j < n; j++) {
          var apo = ans.charAt(j) === "'",
            m = apo ? "apo" : marks ? marks[j] : lock[j] ? "ok" : "";
          h += '<span class="sw-sl' + (m ? " " + m : "") + (j === at ? " cur" : "") + '">' + esc(apo ? "’" : chars[j] || "") + "</span>";
        }
        return h;
      }
      function draw() {
        var ne = nextEmpty(),
          marks = null;
        if (done) {
          marks = [];
          for (var j = 0; j < n; j++) marks.push(result);
        }
        document.getElementById("swSlots").innerHTML = row(cur, marks, done ? -1 : ne);
        document.getElementById("swHist").innerHTML = hist.map(function (h) {
          return '<div class="sw-sprow">' + row(h.g.split(""), h.r, -1) + "</div>";
        }).join("");
        document.getElementById("swCheck").disabled = done || ne >= 0;
      }
      function go() {
        if (advanced || run !== me || !document.getElementById("swKb")) return;
        advanced = true;
        i++;
        round();
      }
      function finishRound() {
        document.getElementById("swCheck").style.display = "none";
        document.getElementById("swNext").style.display = "";
        document.getElementById("swKb").style.display = "none";
        draw();
      }
      function check() {
        if (done || nextEmpty() >= 0) return;
        var guess = cur.join(""),
          marks = spellCheck(guess, ans),
          j;
        tries++;
        if (first[k] === undefined) first[k] = guess === ans;
        if (guess === ans) {
          done = true;
          result = "ok";
          sfx("cheer");
          tell((tries === 1 ? "Perfect! " : "You got it! ") + w, true);
          finishRound();
          try {
            var r = document.getElementById("swSlots").getBoundingClientRect();
            if (hooks.burst) hooks.burst(r.left + r.width / 2, r.top);
          } catch (e) {}
          var late = setTimeout(go, 9000);
          play("s", w, function () {
            clearTimeout(late);
            setTimeout(go, 900);
          });
          return;
        }
        for (j = 0; j < n; j++) if (ans.charAt(j) === "'") marks[j] = "apo";
        hist.push({ g: guess, r: marks });
        sfx("poke");
        if (tries >= 3) {
          done = true;
          result = "rev";
          for (j = 0; j < n; j++) cur[j] = ans.charAt(j);
          tell("It is “" + w + "”. Look at it once more!", false);
          finishRound();
          play("w", w);
          return;
        }
        for (j = 0; j < n; j++) {
          if (marks[j] === "ok") lock[j] = true;
          else if (!lock[j]) cur[j] = "";
        }
        if (tries === 1) document.getElementById("swPic").innerHTML = art(w, true);
        tell(tries === 1 ? "Not quite. Green letters are right, fix the rest!" : "Almost! Listen again and look at the picture.", false);
        draw();
        if (tries === 2) play("w", w);
      }
      function press(c) {
        if (done) return;
        if (c === "enter") {
          check();
          return;
        }
        if (c === "back") {
          for (var j = n - 1; j >= 0; j--)
            if (!lock[j] && cur[j]) {
              cur[j] = "";
              break;
            }
        } else {
          var ne = nextEmpty();
          if (ne < 0) return;
          cur[ne] = c;
        }
        draw();
      }
      var ctx = pieces(info.s).map(function (p) {
        return p.k && p.k === k ? '<span class="sw-blank" style="width:' + (n * 0.62 + 0.5).toFixed(1) + 'em"></span>' : esc(p.t);
      }).join("");
      box.innerHTML = gTop("Spell it · " + (i + 1) + " / " + list.length) +
        '<div class="sw-card sw-dk"><div class="sw-kind">Spell it</div><div class="sw-sent" style="font-size:19px;margin:6px 0 0">Listen, then spell the word.</div>' +
        '<div><button class="sw-say" id="swHear">' + SPEAKER + ' Hear the word</button><button class="sw-say sw-alt" id="swHearS">' + SPEAKER + " Hear the sentence</button></div>" +
        '<div class="sw-ctx">' + ctx + '</div><div class="sw-spic" id="swPic"></div><div id="swHist"></div><div class="sw-sprow" id="swSlots"></div><div class="sw-msg" id="swMsg"></div>' +
        '<div class="sw-kb" id="swKb">' + kbHtml + '</div><button class="sw-go" id="swCheck" disabled>Check</button><button class="sw-go" id="swNext" style="display:none">Next →</button></div>';
      bindQuit();
      document.getElementById("swHear").onclick = function () {
        play("w", w);
      };
      document.getElementById("swHearS").onclick = function () {
        play("s", w);
      };
      document.getElementById("swCheck").onclick = check;
      document.getElementById("swNext").onclick = go;
      Array.prototype.forEach.call(box.querySelectorAll(".sw-key"), function (b) {
        b.onclick = function () {
          press(b.getAttribute("data-k"));
          if (b.blur) b.blur();
        };
      });
      handler = function (e) {
        if (run !== me || !ov || ov.style.display === "none" || !document.getElementById("swKb")) return;
        var c = keyOf(e);
        if (!c) return;
        e.preventDefault();
        press(c);
      };
      document.addEventListener("keydown", handler);
      draw();
      setTimeout(function () {
        if (run === me && !advanced) play("w", w);
      }, 500);
    }
    round();
  }
  function spellDone(first) {
    var ks = Object.keys(first),
      all =
        ks.length > 0 &&
        ks.every(function (k) {
          return first[k];
        });
    endGame(
      "s",
      first,
      "Spell it",
      function (r, t) {
        return r + " / " + t;
      },
      function (r, t) {
        return r >= t ? "Every word spelled right on the first try!" : "words spelled right on the first try.";
      },
      function () {
        startSpell(spellList(readState()));
      },
      '<div class="sw-stage">' + (all ? party() : "") + '<div class="sw-pet sw-pets ' + (all ? "sw-dance" : "sw-hop") + '">' + petArt(all ? "excited" : "happy") + "</div></div>" +
        '<div class="sw-words">' + ks.map(function (k) {
          return '<span class="' + (first[k] ? "" : "sw-miss") + '">' + esc(shown(k)) + "</span>";
        }).join("") + "</div>",
      null,
      { keepMisses: true, dark: true }
    );
  }

  // Word rush: 60 seconds, hear a word and tap it. A streak multiplies the points (x2 from 5 in a row, x3 from 10, x4 from 15); a wrong tap
  // ends the streak and costs 2 seconds. The best score is kept in rev.rushbest (the higher one wins when two devices are merged).
  function startRush() {
    gameTag = "game";
    var s0 = readState(),
      pool = gamePool(learnedWords(s0), [], firstLessonsWords(), 8),
      dueKeys = dueWords(s0, dayStr()),
      dueList = pool.filter(function (w) {
        return dueKeys.indexOf(wkey(w)) >= 0;
      }),
      best = +s0.rev.rushbest || 0,
      first = {},
      rnd = seeded(Date.now() % 100003),
      timer = null,
      handler = null;
    trk("sw_game_start", "rush", "", "game");
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (handler) {
        document.removeEventListener("keydown", handler);
        handler = null;
      }
    }
    run = { mode: "rush", steps: [], i: 0, first: first, rnd: rnd, stop: stop, score: 0 };
    var me = run;
    box.innerHTML = gTop("Word rush") +
      '<div class="sw-card sw-dk"><div class="sw-kind">Word rush</div><div class="sw-big" style="font-size:64px">60 s</div>' +
      '<div class="sw-sent" style="font-size:19px">Hear the word and tap it as fast as you can.<br>A streak multiplies your points. A wrong tap costs 2 seconds.</div>' +
      '<div class="sw-msg">' + (best ? "Your best: " + best + " points" : "Set your first score!") + '</div><button class="sw-go" id="swGo">Go!</button></div>';
    bindQuit();
    document.getElementById("swGo").onclick = function () {
      var c = 3;
      box.innerHTML = gTop("Word rush") + '<div class="sw-card sw-dk"><div class="sw-big sw-cd" id="swCd">3</div></div>';
      bindQuit();
      function step() {
        var el = document.getElementById("swCd");
        if (run !== me || !el) return;
        c--;
        if (c > 0) {
          el.textContent = c;
          sfx("poke");
          setTimeout(step, 700);
        } else {
          el.textContent = "Go!";
          sfx("cheer");
          setTimeout(begin, 500);
        }
      }
      sfx("poke");
      setTimeout(step, 700);
    };
    function begin() {
      if (run !== me || !document.getElementById("swCd")) return;
      var score = 0,
        streak = 0,
        longest = 0,
        right = 0,
        recent = [],
        end = Date.now() + 60000,
        cur = null,
        lockIn = false;
      box.innerHTML = gTop("Word rush") +
        '<div class="sw-card sw-dk"><div class="sw-hud"><div class="sw-tbar"><i id="swTbar"></i></div><b class="sw-secs" id="swSecs">60</b></div>' +
        '<div class="sw-hud2"><span class="sw-score" id="swScore">0</span><span class="sw-combo" id="swCombo"></span><span class="sw-bestl">Best ' + best + "</span></div>" +
        '<div class="sw-rwrap"><button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><span class="sw-plus" id="swPlus"></span></div><div class="sw-rg" id="swOpts"></div></div>';
      bindQuit();
      function nextWord() {
        var w = rushPick(pool, recent, rnd, dueList);
        recent.push(wkey(w));
        if (recent.length > 4) recent.shift();
        cur = { w: w, k: wkey(w), opts: shuffle([w].concat(distractors(w, pool, rnd, [], 3)), rnd) };
        document.getElementById("swOpts").innerHTML = cur.opts.map(function (o, n) {
          return '<button class="sw-ro" data-w="' + esc(o) + '"><small>' + (n + 1) + "</small>" + esc(o) + "</button>";
        }).join("");
        Array.prototype.forEach.call(box.querySelectorAll(".sw-ro"), function (b) {
          b.onclick = function () {
            pick(b);
          };
        });
        play("w", w);
      }
      function hud() {
        document.getElementById("swScore").textContent = score;
        var m = rushMult(streak);
        document.getElementById("swCombo").textContent = streak >= 2 ? streak + " in a row" + (m > 1 ? " · ×" + m : "") : "";
      }
      function pick(b) {
        if (run !== me || lockIn || !cur) return;
        var good = wkey(b.getAttribute("data-w")) === cur.k;
        if (first[cur.k] === undefined) first[cur.k] = good;
        else if (!good) first[cur.k] = false;
        if (good) {
          streak++;
          right++;
          if (streak > longest) longest = streak;
          var pts = rushPoints(streak);
          score += pts;
          me.score = score;
          b.classList.add("sw-ok");
          sfx("pop");
          plusText(document.getElementById("swPlus"), "+" + pts, false);
          hud();
          lockIn = true;
          setTimeout(function () {
            lockIn = false;
            if (run === me && !me.done) nextWord();
          }, 140);
        } else {
          streak = 0;
          end -= 2000;
          b.classList.add("sw-bad");
          b.disabled = true;
          sfx("poke");
          plusText(document.getElementById("swPlus"), "−2 s", true);
          hud();
          tick();
        }
      }
      function tick() {
        if (run !== me || me.done) {
          stop();
          return;
        }
        var left = end - Date.now(),
          bar = document.getElementById("swTbar");
        if (left <= 0) {
          finishRush();
          return;
        }
        if (bar) {
          bar.style.width = Math.round((100 * left) / 60000) + "%";
          bar.className = left < 10000 ? "low" : "";
        }
        var sc = document.getElementById("swSecs");
        if (sc) sc.textContent = Math.ceil(left / 1000);
      }
      function finishRush() {
        stop();
        me.done = true;
        var s = readState(),
          newBest = score > (+s.rev.rushbest || 0);
        if (newBest) {
          s.rev.rushbest = score;
          writeState(s);
        }
        var ks = Object.keys(first),
          missed = ks.filter(function (k) {
            return !first[k];
          });
        sfx("big");
        endGame(
          "r",
          first,
          "Word rush",
          function () {
            return score + " points";
          },
          function () {
            return (newBest && score > 0 ? "New best! " : "Best " + Math.max(best, score) + ". ") + right + " right, longest streak " + longest + ".";
          },
          startRush,
          '<div class="sw-stage"><div class="sw-pet sw-pets ' + (score >= best && score > 0 ? "sw-dance" : "sw-hop") + '">' + petArt(score > 0 ? "excited" : "happy") + "</div></div>" +
            (missed.length ? '<div class="sw-msg">Words to practise:</div><div class="sw-words">' + missed.map(function (k) {
              return '<span class="sw-miss">' + esc(shown(k)) + "</span>";
            }).join("") + "</div>" : ""),
          null,
          { keepMisses: true, dark: true }
        );
      }
      document.getElementById("swHear").onclick = function () {
        if (cur) play("w", cur.w);
      };
      handler = function (e) {
        if (run !== me || !ov || ov.style.display === "none" || !document.getElementById("swOpts")) return;
        var n = +(e.key || String.fromCharCode(e.keyCode || 0));
        if (n >= 1 && n <= 4) {
          var bs = box.querySelectorAll(".sw-ro");
          if (bs[n - 1] && !bs[n - 1].disabled) {
            e.preventDefault();
            pick(bs[n - 1]);
          }
        }
      };
      document.addEventListener("keydown", handler);
      hud();
      nextWord();
      timer = setInterval(tick, 100);
    }
  }

  /* ---- the end of a lesson or a review ---- */
  function finish() {
    var s = readState(),
      today = dayStr(),
      lines = [],
      stars = 0,
      keys = Object.keys(run.first),
      misses = [];
    var unit = run.mode === "lesson" ? unitOf(D.units, run.id) : null,
      unitWas = unit ? unitProgress(unit, D.lessons, s).complete : true;
    run.total = keys.length;
    run.right = keys.filter(function (k) {
      return run.first[k];
    }).length;
    var pct = accuracy(run.right, run.total);
    run.done = true;
    trk(run.mode === "lesson" ? "sw_lesson_done" : "sw_review_done", run.mode === "lesson" ? lessonTag(run.id) : "review", pct + "%", run.mode);
    keys.forEach(function (k) {
      var ok = run.first[k];
      s.words[k] = applyResult(s.words[k], ok, today);
      if (!ok) misses.push(k);
    });
    if (run.mode === "lesson") {
      var firstTime = !s.lessons[run.id];
      if (firstTime) {
        s.lessons[run.id] = { t: Date.now(), acc: pct };
        stars += 1;
        lines.push([1, "Finished a word lesson", "完成一节单词课"]);
        if (pct >= 80) {
          stars += 1;
          lines.push([1, "80%+ on the first try", "一次答对 80% 以上"]);
        }
      }
    } else if (!s.rev[today] && keys.length >= 3) {
      s.rev[today] = Date.now();
      stars += 1;
      lines.push([1, "Reviewed your words", "复习单词"]);
    }
    writeState(s);
    var got = 0;
    if (stars && hooks.award) {
      try {
        got = hooks.award(stars);
        if (hooks.toast) hooks.toast(lines, got, got < stars);
      } catch (e) {}
    }
    sfx("big");
    try {
      if (hooks.burst) hooks.burst(root.innerWidth / 2, 160);
    } catch (e) {}
    var lesson = run.mode === "lesson" ? lessonOf(run.id) : null,
      known = knownCount(s, run.mode === "lesson" ? stageWordsOf(stageOfLesson(run.id)) : allWords()),
      unitNow = unit && !unitWas && unitProgress(unit, D.lessons, s).complete,
      nextL = (run.mode === "lesson" && nextLesson(lessonsOf(stageOfLesson(run.id)), s)) || nextLesson(D.lessons, s); // the next lesson of the same stage first
    var glad = pct >= 80,
      earned = run.mode === "lesson" ? lessonStars({ acc: pct }) : 0,
      bigStars = "",
      title = pct >= 80 ? "Great job!" : pct >= 50 ? "Good work!" : "Nice try!",
      memWords = lesson ? lesson.words : memoryWords(s),
      balWords = lesson ? pickWords(lesson.words, learnedWords(s), 8, seeded(Date.now() % 100003)) : gameWords(s, 8),
      hasBooks = !!(lesson && lesson.books && lesson.books.length);
    for (var si = 0; si < earned; si++) bigStars += '<span class="sw-bs" style="animation-delay:' + (0.5 + si * 0.3).toFixed(1) + 's">' + scenery("star") + "</span>";
    // everything fits on one screen: the pet and the result at the top, then the buttons (next lesson, the games), then the small things
    var h = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button></div><div class="sw-card sw-fin"><div class="sw-kind">' + (run.mode === "review" ? "Review done" : "Lesson " + run.id + " done") + "</div>" +
      '<div class="sw-fhead"><div class="sw-stage sw-fst">' + (glad ? party() : "") + '<div class="sw-pet sw-pets ' + (glad ? "sw-dance" : "sw-hop") + '">' + petArt(glad ? "excited" : "happy") + "</div></div>" +
      '<div class="sw-ftxt">' + (bigStars ? '<div class="sw-bstars">' + bigStars + "</div>" : "") + '<div class="sw-big sw-fbig">' + title + '</div><div class="sw-sent sw-fsent">' + run.right + " of " + run.total + " words right on the first try</div></div></div>" +
      '<div class="sw-words">' + keys.map(function (k) {
        return '<span class="' + (run.first[k] ? "" : "sw-miss") + '">' + esc(shown(k)) + "</span>";
      }).join("") + "</div>" +
      '<div class="sw-msg sw-good">Words I know: ' + known + " / " + (run.mode === "lesson" ? stageWordsOf(stageOfLesson(run.id)) : allWords()).length + "</div>" +
      (misses.length ? '<div class="sw-msg">The red ones will come back for review tomorrow.</div>' : "") +
      (unitNow ? '<div class="sw-unitdone">' + medal(true) + "<div><b>Unit " + unit.id + " complete!</b> Open the chest.</div></div>" : "") +
      '<div class="sw-acts">' + (unitNow ? '<button class="sw-go sw-a1 sw-gold" id="swUnit">Unit challenge · Balloon pop</button>' : "") + (nextL ? '<button class="sw-go sw-a1" id="swNextL">Next lesson →</button>' : "") +
      '<button class="sw-gt sw-g1" id="swMem"><span class="sw-gi">' + scenery("game", "memory") + '</span>Memory match</button><button class="sw-gt sw-g2" id="swBal"><span class="sw-gi">' + scenery("game", "balloon") + "</span>Balloon pop</button></div>" +
      '<div class="sw-fl"><button class="sw-linkbtn" id="swMap">' + backLabel() + "</button>" + (hasBooks ? '<button class="sw-linkbtn" id="swBooksBtn">Read these words in a story</button>' : "") + "</div>";
    if (hasBooks) {
      h += '<div class="sw-books" id="swBooks" style="display:none">' +
        lesson.books.map(function (b) {
          return '<a href="#" data-f="' + esc(b.file) + '" data-t="' + esc(b.title) + '">📖 ' + esc(b.title) + "</a>";
        }).join("") + "</div>";
    }
    box.innerHTML = h + "</div>";
    document.getElementById("swQuit").onclick = goBack;
    document.getElementById("swMap").onclick = goBack;
    document.getElementById("swMem").onclick = function () {
      startMemory(memWords);
    };
    document.getElementById("swBal").onclick = function () {
      startBalloons(balWords);
    };
    if (unitNow)
      document.getElementById("swUnit").onclick = function () {
        unitChallenge(unit.id);
      };
    if (nextL)
      document.getElementById("swNextL").onclick = function () {
        startLesson(nextL);
      };
    if (hasBooks)
      document.getElementById("swBooksBtn").onclick = function () {
        var bk = document.getElementById("swBooks");
        bk.style.display = bk.style.display === "none" ? "block" : "none";
        if (bk.style.display === "block") ov.scrollTop = ov.scrollHeight;
      };
    Array.prototype.forEach.call(box.querySelectorAll(".sw-books a"), function (a) {
      a.onclick = function (e) {
        e.preventDefault();
        var f = a.getAttribute("data-f"),
          t = a.getAttribute("data-t");
        if (hooks.openBook) {
          closeOverlay();
          hooks.openBook(f, t, (f.split("/")[1] || ""));
        }
      };
    });
    refreshButton();
  }

  /* ---- public ---- */
  root.SightWords = {
    init: function (h) {
      hooks.award = h.award || null;
      hooks.toast = h.toast || null;
      hooks.burst = h.burst || null;
      hooks.openBook = h.openBook || null;
      hooks.pet = h.pet || null;
      hooks.feedPet = h.feedPet || null;
      hooks.gift = h.gift || null;
      hooks.wear = h.wear || null;
      hooks.track = h.track || null;
      if (!D) return;
      refreshButton();
    },
    open: function () {
      if (!D) return;
      openOverlay();
      trk("sw_open", "home", "", "button");
      showHome();
    },
    refresh: refreshButton,
    knownCount: function () {
      return knownCount(readState(), D ? allWords() : []);
    },
    dueCount: function () {
      return dueWords(readState(), dayStr()).length;
    },
  };
})(typeof window !== "undefined" ? window : this);
