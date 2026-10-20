/* Sight words: stage 1 (18 short lessons for the Dolch pre-primer and primer words), stage 2 (20 lessons for grade 1 and 2), stage 3 (30 lessons for grade 3 and the nouns), stage 4 (30 lessons of common Fry words), stage 5 (30 more lessons of Fry words), stage 6 (30 lessons on the deep-sea island), stage 7 (30 lessons on the desert island) and stage 8 (30 lessons on the polar island), then spaced review.
   Needs sightwords-data.js (stage 1), sightwords-data2.js (stage 2) and sightwords-data3.js (stage 3), sightwords-data4.js (stage 4), sightwords-data5.js (stage 5) sightwords-data6.js (stage 6), sightwords-data7.js (stage 7) and sightwords-data8.js (stage 8): the words, one sentence per word, lessons; and the clips in sightwords/audio/.
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
  var AUDIO_V = "4",
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
    if (!rec || rec.pl) return 0; // (a lesson skipped by the quick check has no stars: they are earned by playing it)
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

  /* ---- the spelling and monster games for older children (pure) ---- */
  // the letters of a word as typed: lower case, a curly apostrophe made straight
  function spellForm(w) {
    return String(w).toLowerCase().replace(/\u2019/g, "'");
  }
  // words the spelling game can use: at least two letters ("I" and "a" cannot be spelled)
  function spellable(words) {
    return words.filter(function (w) {
      return wkey(w).length >= 2;
    });
  }
  // the letters on the bubbles of one word: its own letters plus a few that are not in it, shuffled (a word with two e's has two e bubbles)
  function bubbleSet(word, rnd) {
    var ans = spellForm(word).replace(/[^a-z]/g, ""),
      n = ans.length,
      extra = n <= 3 ? 2 : n <= 5 ? 3 : 4,
      abc = "abcdefghijklmnopqrstuvwxyz",
      pool = [],
      out = ans.split(""),
      i;
    for (i = 0; i < abc.length; i++) if (ans.indexOf(abc.charAt(i)) < 0) pool.push(abc.charAt(i));
    pool = shuffle(pool, rnd);
    for (i = 0; i < extra && i < pool.length; i++) out.push(pool[i]);
    return shuffle(out, rnd);
  }
  // Monster battle: a right answer is a hit worth 1 hit point (one cannonball); 3 in a row make a stream of cannonballs (2), 5 in a row the mega laser (3)
  function battleDmg(streak) {
    return streak >= 5 ? 3 : streak >= 3 ? 2 : 1;
  }
  // the beaten monsters are in rev["mon<id>"]; a monster opens when the one before it has been beaten (the first is always open)
  function monKey(id) {
    return "mon" + id;
  }
  function monUnlocked(rev, id) {
    return id <= 1 || !!(rev && rev[monKey(id - 1)]);
  }
  // the next word of a battle: sometimes one that is due for review, never one of the last few (when there are enough words)
  function battlePick(pool, recent, rnd, due) {
    var src = due && due.length && rnd() < 0.4 ? due : pool,
      c = src.filter(function (w) {
        return recent.indexOf(wkey(w)) < 0;
      });
    if (!c.length)
      c = pool.filter(function (w) {
        return recent.indexOf(wkey(w)) < 0;
      });
    if (!c.length) c = pool;
    return c[Math.floor(rnd() * c.length)];
  }

  /* the quick check before an island: the child hears a word and taps it. Two words from each lesson, in order: both right = the child knows that lesson;
     two lessons in a row with a miss = stop there (the rest is learnt the normal way). It only ever adds: nothing goes down and nothing is taken away. */
  var PLACE_ASK = 2,
    PLACE_STOP = 2;
  function placeKey(sid) {
    return "place" + sid;
  }
  function placeSkipKey(sid) {
    return "pskip" + sid;
  }
  // the lessons still to be tested (one that is already finished is not asked again), with the words that will be asked
  function placeInit(lessons, state, rnd) {
    var order = [],
      pick = {};
    lessons.forEach(function (l) {
      if (!state.lessons[l.id]) {
        order.push(l.id);
        pick[l.id] = shuffle(l.words, rnd).slice(0, PLACE_ASK);
      }
    });
    return { order: order, pick: pick, i: 0, k: 0, ok: 0, misses: 0, passed: [], failed: [], good: [], done: order.length === 0 };
  }
  function placeWord(ps) {
    return ps.done ? null : ps.pick[ps.order[ps.i]][ps.k];
  }
  function placeAnswer(ps, right) {
    if (ps.done) return ps;
    var id = ps.order[ps.i],
      w = ps.pick[id][ps.k];
    if (right) {
      ps.ok++;
      ps.good.push(wkey(w));
    }
    ps.k++;
    if (ps.k >= ps.pick[id].length) {
      if (ps.ok === ps.pick[id].length) {
        ps.passed.push(id);
        ps.misses = 0;
      } else {
        ps.failed.push(id);
        ps.misses++;
      }
      ps.i++;
      ps.k = 0;
      ps.ok = 0;
      if (ps.i >= ps.order.length || ps.misses >= PLACE_STOP) ps.done = true;
    }
    return ps;
  }
  // what the check changes: a passed lesson counts as done (no stars and no chest: those are still earned by playing); every word answered right is known
  // (box 3, back for review in 4 days), and so are the other words of a passed lesson, but they come back sooner (2 days) to be checked for real. Nothing goes down.
  function placeApply(state, lessons, ps, sid, today, now) {
    function lift(key, dueBox) {
      var rec = isObj(state.words[key]) ? state.words[key] : { box: 0, n: 0, ok: 0 };
      if ((rec.box || 0) < 3) {
        rec.box = 3;
        rec.due = addDays(INT[dueBox], today ? new Date(today + "T12:00:00") : null);
      }
      state.words[key] = rec;
    }
    ps.good.forEach(function (k) {
      lift(k, 3);
    });
    ps.passed.forEach(function (id) {
      var l = findLesson(lessons, id);
      if (!l) return;
      if (!state.lessons[id]) state.lessons[id] = { t: now, acc: 0, pl: 1 };
      l.words.forEach(function (w) {
        lift(wkey(w), 2);
      });
    });
    state.rev[placeKey(sid)] = now;
    return state;
  }

  // the lessons of the later stages go after the ones of the stage before (ids keep counting: 19-38 are stage 2, units 6-10; 39-68 are stage 3, units 11-15; 69-98 are stage 4, units 16-20; 99-128 are stage 5, units 21-25; 129-158 are stage 6, units 26-30; 159-188 are stage 7, units 31-35; 189-218 are stage 8, units 36-40)
  // and that stage becomes ready. mergeData(d1, d2, d3...) adds the later data in order; a later data set that is missing is skipped.
  function mergeOne(d1, d2) {
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
  function mergeData(d1) {
    var out = d1;
    for (var i = 1; i < arguments.length; i++) out = mergeOne(out, arguments[i]);
    return out;
  }

  var core = {
    spellForm: spellForm,
    spellable: spellable,
    bubbleSet: bubbleSet,
    battleDmg: battleDmg,
    monKey: monKey,
    monUnlocked: monUnlocked,
    battlePick: battlePick,
    mergeData: mergeData,
    chestKey: chestKey,
    claimChest: claimChest,
    feelFor: feelFor,
    trailPath: trailPath,
    lessonStars: lessonStars,
    placeKey: placeKey,
    placeSkipKey: placeSkipKey,
    placeInit: placeInit,
    placeWord: placeWord,
    placeAnswer: placeAnswer,
    placeApply: placeApply,
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
  var D = mergeData(root.SW_DATA, root.SW_DATA2, root.SW_DATA3, root.SW_DATA4, root.SW_DATA5, root.SW_DATA6, root.SW_DATA7, root.SW_DATA8),
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
      if (!run.done && (run.mode === "spell" || run.mode === "battle")) trk("sw_game_quit", run.mode, run.mode === "battle" ? "monster " + run.at : "word " + ((run.at || 0) + 1), "game");
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
      "#swOverlay .sw-ct{display:block;text-align:center;border-radius:24px;padding:10px 6px 12px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:17px;line-height:1.15;color:#1E2A4A;transition:transform .15s}" +
      "#swOverlay .sw-ct:hover{transform:translateY(-3px)}" +
      "#swOverlay .sw-ct small{display:block;font-size:13px;font-weight:700;margin-top:3px;opacity:.7}" +
      "#swOverlay .sw-ct .sw-gi{width:62%}" +
      "#swOverlay .sw-c1{background:#D4F3FF;box-shadow:0 6px 0 #8FCBE6}" +
      "#swOverlay .sw-c2{background:#FFE2C9;box-shadow:0 6px 0 #EBA877}" +
      "#swOverlay .sw-ct.sw-cp{background:#C2EEF2;box-shadow:0 6px 0 #7BC6D0}" +
      "#swOverlay .sw-ct.sw-cd{background:#FFE6A8;box-shadow:0 6px 0 #E0B24A}" +
      "#swOverlay .sw-ct.sw-cs{background:#D9D6FF;box-shadow:0 6px 0 #9E97E6}" +
      "#swOverlay .sw-bbs{padding:16px 14px 18px}" +
      "#swOverlay .sw-bhead{display:flex;align-items:center;text-align:left}" +
      "#swOverlay .sw-bpet{flex:none;width:84px;margin-right:10px}" +
      "#swOverlay .sw-bq{flex:1;min-width:0}" +
      "#swOverlay .sw-bq .sw-say{padding:7px 14px;font-size:15px;margin:4px 6px 0 0}" +
      "#swOverlay .sw-ctx{font-weight:800;font-size:20px;line-height:1.4;color:#1E2A4A}" +
      "#swOverlay .sw-blank{display:inline-block;height:1em;border-bottom:4px solid #6A48E8;vertical-align:-0.1em;margin:0 3px}" +
      "#swOverlay .sw-spic{width:120px;margin:8px auto 0}" +
      "#swOverlay .sw-spic .sw-pic{margin:0}" +
      "#swOverlay .sw-sprow{display:flex;justify-content:center;margin:10px 0 4px}" +
      "#swOverlay .sw-sl{flex:1 1 0;max-width:48px;min-width:26px;margin:0 3.5px;height:54px;display:flex;align-items:center;justify-content:center;border-radius:13px;border:3px solid #C9D7E8;background:#fff;color:#1E2A4A;font-family:'Fredoka',sans-serif;font-weight:700;font-size:30px;box-shadow:0 4px 0 #C9D7E8}" +
      "#swOverlay .sw-sl.cur{border-color:#6A48E8;animation:swblink 1s infinite}" +
      "#swOverlay .sw-sl.ok{background:#B9EBC9;border-color:#35B779;box-shadow:0 4px 0 #1F8A55}" +
      "#swOverlay .sw-sl.apo{background:transparent;border-color:transparent;box-shadow:none;max-width:20px;min-width:12px;color:#E0A800}" +
      "@keyframes swblink{50%{border-color:#C9C0F5}}" +
      "#swOverlay .sw-bsky{margin:8px 0 4px}" +
      "#swOverlay .sw-lb{position:absolute;width:62px;height:62px;margin:-31px 0 0 -31px;border-radius:50%;border:3px solid;color:#fff;font-family:'Fredoka',sans-serif;font-weight:700;font-size:32px;line-height:1;animation:swbob 3s ease-in-out infinite;box-shadow:inset -5px -7px 0 rgba(0,0,0,.09),0 5px 0 rgba(0,0,0,.12)}" +
      "#swOverlay .sw-lb span{text-shadow:0 2px 0 rgba(0,0,0,.22)}" +
      "#swOverlay .sw-lb.sw-gone{visibility:hidden}" +
      "#swOverlay .sw-lb.sw-wob{animation:swshake .35s !important}" +
      "#swOverlay .sw-lb.sw-hint{animation:swhint .5s infinite alternate !important;box-shadow:0 0 0 6px rgba(255,235,120,.95),0 5px 0 rgba(0,0,0,.12)}" +
      "#swOverlay .sw-lb.sw-away{animation:swaway .8s ease-in forwards}" +
      "@keyframes swbob{0%,100%{transform:translateY(-5px)}50%{transform:translateY(5px)}}" +
      "#swOverlay .sw-rst svg{width:30px;height:30px;display:inline-block}" +
      "#swOverlay .sw-bt{padding:14px 12px 18px}" +
      "#swOverlay .sw-arena{position:relative;height:216px;border-radius:22px;overflow:hidden;background:linear-gradient(#9ED8FF 0,#D8F1FF 58%,#8BD36A 58%,#6CBF55 100%)}" +
      "#swOverlay .sw-abg{position:absolute;left:0;top:0;right:0;bottom:0}" +
      "#swOverlay .sw-abg svg{display:block;width:100%;height:100%}" +
      "#swOverlay .sw-apet{position:absolute;left:3%;bottom:8px;width:116px;z-index:2}" +
      "#swOverlay .sw-amon{position:absolute;right:4%;bottom:6px;width:138px;z-index:1}" +
      "#swOverlay .sw-apet svg,#swOverlay .sw-amon svg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-turn{position:relative;transform-origin:50% 100%;transform-style:preserve-3d}" +
      "#swOverlay .sw-ly{position:absolute;left:0;top:0;width:100%;height:auto;transform-origin:50% 100%;pointer-events:none}" +
      "#swOverlay .sw-apet svg{transform:scaleX(-1) rotate(-5deg);transform-origin:50% 100%}" +
      "#swOverlay .sw-amon svg{transform:rotate(-5deg);transform-origin:50% 100%}" +
      "#swOverlay .sw-amon svg.sw-rig{transform:none}" +
      "#swOverlay .sw-apet svg.sw-rig{transform:scaleX(-1)}" +
      "#swOverlay .sw-shd{position:absolute;left:12%;right:12%;bottom:-5px;height:13px;border-radius:50%;background:radial-gradient(ellipse,rgba(20,10,50,.34),rgba(20,10,50,0) 70%);transition:left .3s,right .3s;pointer-events:none;z-index:-1}" +
      "#swOverlay .sw-turn.sw-turned + .sw-shd{left:26%;right:26%}" +
      "#swOverlay .sw-apet .sw-turn.sw-in{animation:swturnin .4s cubic-bezier(.25,.8,.3,1) forwards}" +
      "#swOverlay .sw-apet .sw-turn.sw-out{animation:swturnout .32s ease-in-out forwards}" +
      "#swOverlay .sw-amon .sw-turn.sw-in{animation:swturninm .4s cubic-bezier(.25,.8,.3,1) forwards}" +
      "#swOverlay .sw-amon .sw-turn.sw-out{animation:swturnoutm .32s ease-in-out forwards}" +
      "@keyframes swturnin{0%{transform:perspective(520px) rotateY(0) scale(1,1)}22%{transform:perspective(520px) rotateY(0) scale(1.07,.9)}62%{transform:perspective(520px) rotateY(66deg) scale(.97,1.07)}100%{transform:perspective(520px) rotateY(54deg) scale(1,1)}}" +
      "@keyframes swturnout{0%{transform:perspective(520px) rotateY(54deg) scale(1,1)}60%{transform:perspective(520px) rotateY(-8deg) scale(1.03,.96)}100%{transform:perspective(520px) rotateY(0) scale(1,1)}}" +
      "@keyframes swturninm{0%{transform:perspective(520px) rotateY(0) scale(1,1)}22%{transform:perspective(520px) rotateY(0) scale(1.07,.9)}62%{transform:perspective(520px) rotateY(-66deg) scale(.97,1.07)}100%{transform:perspective(520px) rotateY(-54deg) scale(1,1)}}" +
      "@keyframes swturnoutm{0%{transform:perspective(520px) rotateY(-54deg) scale(1,1)}60%{transform:perspective(520px) rotateY(8deg) scale(1.03,.96)}100%{transform:perspective(520px) rotateY(0) scale(1,1)}}" +
      "#swOverlay .sw-apet.sw-pow:before{content:'';position:absolute;left:-6%;top:6%;width:112%;height:92%;border-radius:50%;background:radial-gradient(circle,rgba(255,226,90,.85),rgba(255,226,90,0) 68%);z-index:-1;animation:swaura .9s ease-in-out infinite alternate}" +
      "@keyframes swaura{from{transform:scale(.88);opacity:.6}to{transform:scale(1.08);opacity:1}}" +
      "#swOverlay .sw-php{position:absolute;left:10px;top:8px;display:flex;z-index:4}" +
      "#swOverlay .sw-php i{display:block;width:26px;height:26px;margin-right:3px}" +
      "#swOverlay .sw-php i svg{display:block;width:100%;height:100%}" +
      "#swOverlay .sw-php i.sw-lost{opacity:.22}" +
      "#swOverlay .sw-mhp{position:absolute;right:10px;top:8px;width:46%;text-align:right;font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:#fff;text-shadow:0 2px 0 #2B2250,0 0 6px #2B2250;z-index:4}" +
      "#swOverlay .sw-hpbar{height:14px;border-radius:7px;background:rgba(255,255,255,.85);border:2px solid #2B2250;overflow:hidden;margin-top:2px}" +
      "#swOverlay .sw-hpbar i{display:block;height:100%;background:linear-gradient(90deg,#FF6B6B,#FFA24D);transition:width .35s}" +
      "#swOverlay .sw-bfx{position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;z-index:5}" +
      "#swOverlay .sw-banner2{position:absolute;left:0;right:0;top:42%;text-align:center;font-family:'Fredoka',sans-serif;font-weight:700;font-size:30px;color:#fff;text-shadow:0 3px 0 #2B2250,0 0 10px #2B2250;animation:swpopb2 .5s}" +
      "@keyframes swpopb2{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}" +
      "#swOverlay .sw-dmg{position:absolute;font-family:'Fredoka',sans-serif;font-weight:700;font-size:30px;color:#fff;text-shadow:0 3px 0 #2B2250,0 0 6px #2B2250;white-space:nowrap;animation:swdmg 1.1s ease-out forwards}" +
      "#swOverlay .sw-dmg.sw-d2{color:#FFD23F;font-size:34px}" +
      "#swOverlay .sw-dmg.sw-d3{color:#FF9A4D;font-size:40px}" +
      "#swOverlay .sw-dmg.sw-dbad{color:#FFB0C4}" +
      "@keyframes swdmg{0%{opacity:0;transform:translateY(20px) scale(.6)}20%{opacity:1;transform:translateY(0) scale(1.2)}100%{opacity:0;transform:translateY(-50px) scale(1)}}" +
      "#swOverlay .sw-shot{position:absolute;pointer-events:none;z-index:6;transform:translate(-50%,-50%)}" +
      "#swOverlay .sw-ball i{position:relative;display:block;width:32px;height:32px;border-radius:50%;box-shadow:0 0 12px 4px rgba(255,255,255,.8)}" +
      "#swOverlay .sw-ball i:before{content:'';position:absolute;right:70%;top:22%;width:46px;height:56%;border-radius:8px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.8))}" +
      "#swOverlay .sw-ball0{background:radial-gradient(circle at 32% 30%,#fff 0,#FFE3EE 16%,#FF8FB1 55%,#D9577F 100%)}" +
      "#swOverlay .sw-ball1{background:radial-gradient(circle at 32% 30%,#fff 0,#FFF6C9 16%,#FFD23F 55%,#E0A800 100%)}" +
      "#swOverlay .sw-ball2{background:radial-gradient(circle at 32% 30%,#fff 0,#E3F0FF 16%,#6AA7FF 55%,#2F6FD6 100%)}" +
      "#swOverlay .sw-ball3{background:radial-gradient(circle at 32% 30%,#fff 0,#E5FAD8 16%,#7BD65A 55%,#3F9A3A 100%)}" +
      "#swOverlay .sw-mshot{width:46px;height:46px}" +
      "#swOverlay .sw-mshot svg{display:block;width:100%;height:100%;animation:swspin .55s linear infinite}" +
      "@keyframes swspin{to{transform:rotate(360deg)}}" +
      "#swOverlay .sw-imp{position:absolute;width:0;height:0;pointer-events:none;z-index:6}" +
      "#swOverlay .sw-ring{position:absolute;left:-10px;top:-10px;width:20px;height:20px;border-radius:50%;border:5px solid #fff;animation:swring .5s ease-out forwards}" +
      "@keyframes swring{to{transform:scale(5);opacity:0}}" +
      "#swOverlay .sw-spk{position:absolute;left:-6px;top:-6px;width:12px;height:12px;border-radius:4px;transition:transform .55s ease-out,opacity .55s}" +
      "#swOverlay .sw-muz{position:absolute;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:radial-gradient(circle,#fff 0,#FFF3B0 38%,rgba(255,200,60,0) 70%);animation:swmuz .38s ease-out forwards;z-index:6}" +
      "@keyframes swmuz{from{transform:scale(.4);opacity:1}to{transform:scale(1.6);opacity:0}}" +
      "#swOverlay .sw-beam{position:absolute;height:30px;margin-top:-15px;transform-origin:0 50%;pointer-events:none;z-index:6}" +
      "#swOverlay .sw-beami{display:block;width:100%;height:100%;border-radius:15px;background:linear-gradient(#FF8FD8,#FFD23F 22%,#FFFFFF 42%,#FFFFFF 58%,#7DE3FF 78%,#6AA7FF);box-shadow:0 0 22px 8px rgba(160,225,255,.85);transform-origin:0 50%;animation:swbeam .85s ease-out forwards}" +
      "@keyframes swbeam{0%{transform:scaleX(0);opacity:1}18%{transform:scaleX(1);opacity:1}65%{transform:scaleX(1) scaleY(1.2);opacity:1}100%{transform:scaleX(1) scaleY(.15);opacity:0}}" +
      "#swOverlay .sw-recoil{animation:swrecoil .42s}" +
      "@keyframes swrecoil{0%{transform:none}30%{transform:translateX(-14px) scale(1.06)}100%{transform:none}}" +
      "#swOverlay .sw-recoil2{animation:swrecoil2 .46s}" +
      "@keyframes swrecoil2{0%{transform:none}25%{transform:translateX(16px) rotate(6deg)}55%{transform:translateX(-5px) rotate(-3deg)}100%{transform:none}}" +
      "#swOverlay .sw-wind{animation:swwind .44s}" +
      "@keyframes swwind{0%{transform:none}60%{transform:scale(1.16) translateX(12px)}100%{transform:none}}" +
      "#swOverlay .sw-knock{animation:swknock .52s}" +
      "@keyframes swknock{0%{transform:none}30%{transform:translateX(-22px) rotate(-8deg)}100%{transform:none}}" +
      "#swOverlay .sw-ashake{animation:swshake .3s}" +
      "#swOverlay .sw-fade{animation:swfade .9s forwards}" +
      "@keyframes swfade{to{opacity:0;transform:scale(.25) rotate(24deg)}}" +
      "#swOverlay .sw-charge{height:12px;border-radius:6px;background:#E3EAF5;overflow:hidden;margin:12px 4px 0}" +
      "#swOverlay .sw-charge i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#FFB020,#FF6B4A);border-radius:6px}" +
      "#swOverlay .sw-streak{min-height:22px;font-weight:800;font-size:15px;color:#E5683A;margin:4px 0 0}" +
      "#swOverlay .sw-bg{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px}" +
      "#swOverlay .sw-bo{position:relative;border-radius:20px;padding:18px 8px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:30px;color:#1E2A4A;border:3px solid}" +
      "#swOverlay .sw-bo small{position:absolute;left:12px;top:6px;font-size:13px;opacity:.5}" +
      "#swOverlay .sw-bo:nth-child(4n+1){background:#FFD9E6;border-color:#FF8FB1;box-shadow:0 6px 0 #D9577F}" +
      "#swOverlay .sw-bo:nth-child(4n+2){background:#FFF1C2;border-color:#FFC93C;box-shadow:0 6px 0 #E0A800}" +
      "#swOverlay .sw-bo:nth-child(4n+3){background:#DFF5E7;border-color:#35B779;box-shadow:0 6px 0 #1F8A55}" +
      "#swOverlay .sw-bo:nth-child(4n+4){background:#D6EEFF;border-color:#3D8BF2;box-shadow:0 6px 0 #2A66C9}" +
      "#swOverlay .sw-bo:last-child:nth-child(odd){grid-column:1/-1}" +
      "#swOverlay .sw-bo:active{transform:translateY(3px)}" +
      "#swOverlay .sw-bo.sw-ok{background:#B9EBC9;border-color:#35B779;box-shadow:0 6px 0 #1F8A55;transform:scale(1.05)}" +
      "#swOverlay .sw-bo.sw-bad{background:#FFE3DE;border-color:#FF6B4A;box-shadow:0 6px 0 #D9462B;animation:swshake .35s}" +
      "#swOverlay .sw-bo.sw-hint{box-shadow:0 0 0 6px rgba(255,235,120,.95),0 6px 0 #1F8A55}" +
      "#swOverlay .sw-mons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}" +
      "#swOverlay .sw-mcard{position:relative;display:block;text-align:center;border-radius:24px;padding:12px 8px 14px;background:#fff;box-shadow:0 6px 0 #C9D7E8;font-family:'Fredoka',sans-serif;color:#1E2A4A}" +
      "#swOverlay .sw-mcard:last-child:nth-child(odd){grid-column:1/-1}" +
      "#swOverlay .sw-mcard .sw-mart{width:78%;margin:0 auto}" +
      "#swOverlay .sw-mcard:last-child:nth-child(odd) .sw-mart{width:36%}" +
      "#swOverlay .sw-mart{display:block}" +
      "#swOverlay .sw-mart svg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-mcard b{display:block;font-size:20px}" +
      "#swOverlay .sw-mcard small{display:block;font-size:13px;opacity:.7}" +
      "#swOverlay .sw-mlock{background:#EEF2F8;box-shadow:0 6px 0 #D0D8E6}" +
      "#swOverlay .sw-mlock .sw-mart{opacity:.28}" +
      "#swOverlay .sw-mlk{position:absolute;right:10px;top:10px;width:28px}" +
      "#swOverlay .sw-mwon{background:#F0FBF1;box-shadow:0 6px 0 #9AD3A8}" +
      "#swOverlay .sw-mdrop{display:inline-flex;align-items:center;margin-top:6px;background:#FFF1C2;border-radius:999px;padding:3px 12px 3px 4px;font-size:13px;font-weight:700}" +
      "#swOverlay .sw-mbig{width:150px;margin:0 auto 6px}" +
      "#swOverlay .sw-mhead{display:block;flex:none;width:72px;margin-right:12px}" +
      "#swOverlay .sw-mhead svg{display:block;width:100%;height:auto}" +
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
      "#swOverlay .sw-ipet{position:absolute;left:15%;top:4.8%;width:14.5%;pointer-events:none;transform-origin:50% 100%;animation:swbobp 3s ease-in-out infinite}" +
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
      "#swOverlay .sw-qcard{display:flex;align-items:center;background:#FFF8EA;border:4px solid #FFB020;border-radius:26px;box-shadow:0 6px 0 #E0A800;padding:12px 16px;margin:14px 0}" +
      "#swOverlay .sw-bolt{display:inline-block;width:22px;height:28px;vertical-align:-6px;margin-right:6px;flex:none}" +
      "#swOverlay .sw-qgo{background:#FF8A3D;box-shadow:0 6px 0 #C4501F;animation:swqpulse 1.6s ease-in-out infinite}#swOverlay .sw-qgo .sw-bolt{width:18px;height:22px;vertical-align:-4px}" +
      "@keyframes swqpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}" +
      "#swOverlay .sw-qbar{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;width:100%;background:#FFF8EA;border:3px solid #FFB020;border-radius:20px;box-shadow:0 4px 0 #E0A800;padding:9px 14px;margin:12px 0;font-size:16px;color:#7A4A00}" +
      "#swOverlay .sw-qbar b{font-family:'Fredoka',sans-serif;font-size:18px;margin-right:10px}#swOverlay .sw-qbar span{font-weight:700;font-size:14px;color:#9A6A1C}" +
      "#swOverlay .sw-qcpet{width:84px;flex:none;margin-right:14px}#swOverlay .sw-qcpet svg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-qct{flex:1;min-width:0;text-align:left}#swOverlay .sw-qct b{display:block;font-family:'Fredoka',sans-serif;font-size:22px}" +
      "#swOverlay .sw-qct span{display:block;font-weight:700;font-size:14px;color:#4A5878;margin:2px 0 6px}" +
      "#swOverlay .sw-qcb{display:flex;align-items:center;flex-wrap:wrap}#swOverlay .sw-qcb .sw-go{font-size:17px;padding:10px 20px;margin:0 6px 0 0}" +
      "#swOverlay .sw-qlr{text-align:center;margin:6px 0}" +
      "#swOverlay .sw-qtrack{display:flex;flex-wrap:wrap;justify-content:center;margin:6px 0 0}" +
      "#swOverlay .sw-qd{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;margin:3px;font-style:normal;font-weight:800;font-size:12px;background:#E3EAF5;color:#8A97AD;border:2px solid #D2DCEB}" +
      "#swOverlay .sw-qd.sw-qp{background:#35B779;color:#fff;border-color:#1F8A55}#swOverlay .sw-qd.sw-qf{background:#EDEFF4;color:#B2BACB;border-color:#E1E5EE}" +
      "#swOverlay .sw-qd.sw-qn{background:#6A48E8;color:#fff;border-color:#4A2FB8;transform:scale(1.2)}" +
      "#swOverlay .sw-qpet{width:84px;margin:0 auto 2px}#swOverlay .sw-qpet svg{display:block;width:100%;height:auto;overflow:visible}#swOverlay .sw-qpet.sw-qbig{width:130px}" +
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
      "#swOverlay .sw-g4{background:#CFF1F7;box-shadow:0 6px 0 #7CC4D4}" +
      "#swOverlay .sw-games.sw-g4s{grid-template-columns:repeat(2,minmax(0,1fr))}" +
      "#swOverlay .sw-sea{position:relative;height:370px;border-radius:26px;overflow:hidden;margin:12px 0;box-shadow:inset 0 0 0 4px #fff;background:linear-gradient(#BFE6FF 0,#EAF7FF 21%,#4FB8EE 21%,#2A86D6 100%)}" +
      "#swOverlay .sw-sea:before{content:'';position:absolute;left:0;right:0;top:72px;height:12px;background:radial-gradient(circle at 10px 12px,#EAF7FF 9px,transparent 10px) 0 0/20px 12px repeat-x;z-index:1}" +
      "#swOverlay .sw-fsh{position:absolute;width:112px;padding:0;background:none;z-index:2}" +
      "#swOverlay .sw-fr{animation:swfr linear infinite}" +
      "#swOverlay .sw-fl{animation:swfl linear infinite}" +
      "@keyframes swfr{from{left:-130px}to{left:calc(100% + 20px)}}" +
      "@keyframes swfl{from{left:calc(100% + 20px)}to{left:-130px}}" +
      "#swOverlay .sw-fbob{display:block;position:relative;animation:swbob 1.6s ease-in-out infinite alternate}" +
      "@keyframes swbob{from{transform:translateY(-4px)}to{transform:translateY(5px)}}" +
      "#swOverlay .sw-fbody{display:block}" +
      "#swOverlay .sw-fbody svg{display:block;width:100%;height:auto}" +
      "#swOverlay .sw-flip{transform:scaleX(-1)}" +
      "#swOverlay .sw-fw{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;color:#1E2A4A;background:rgba(255,255,255,.94);border-radius:999px;padding:1px 9px 2px;box-shadow:0 2px 0 rgba(0,0,0,.2);white-space:nowrap;pointer-events:none}" +
      "#swOverlay .sw-fsh.sw-wob .sw-fbody{animation:swshake .4s}" +
      "#swOverlay .sw-fsh.sw-hint .sw-fbob{animation:swhint .6s ease-in-out infinite alternate;filter:drop-shadow(0 0 8px #FFE066)}" +
      "#swOverlay .sw-fgone{opacity:0;transition:opacity .4s;pointer-events:none}" +
      "#swOverlay .sw-boat{position:absolute;left:50%;top:6px;transform:translateX(-50%);width:130px;z-index:3;pointer-events:none}" +
      "#swOverlay .sw-boat svg{display:block;width:100%;height:auto}" +
      "#swOverlay .sw-fpet{width:74px;margin:0 auto -16px;position:relative;z-index:1}" +
      "#swOverlay .sw-fpet svg{display:block;width:100%;height:auto;overflow:visible}" +
      "#swOverlay .sw-fpet.sw-fwig{transform-origin:50% 90%;animation:swwig 1.4s ease-in-out}" +
      "@keyframes swwig{0%{transform:none}12%{transform:rotate(-14deg) translateY(-10px)}26%{transform:rotate(14deg) translateY(0)}40%{transform:rotate(-12deg) translateY(-12px)}54%{transform:rotate(12deg) translateY(0)}70%{transform:rotate(-7deg) translateY(-6px)}100%{transform:none}}" +
      "#swOverlay .sw-hs{position:absolute;width:22px;height:22px;z-index:7;pointer-events:none}" +
      "#swOverlay .sw-hs svg{display:block;width:100%;height:100%}" +
      "#swOverlay .sw-fline{position:absolute;width:3px;margin-left:-1.5px;background:#fff;opacity:.9;transform-origin:50% 0;z-index:1;border-radius:2px}" +
      "#swOverlay .sw-bk{position:absolute;left:10px;top:8px;background:#fff;border-radius:999px;padding:4px 14px;font-weight:800;font-size:18px;z-index:4}" +
      "#swOverlay .sw-drop{position:absolute;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:#EAF7FF;border:2px solid #fff;z-index:5;pointer-events:none}" +
      "#swOverlay .sw-frev{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);text-align:center;z-index:6;background:rgba(255,255,255,.95);border-radius:26px;padding:12px 24px 14px;box-shadow:0 6px 0 rgba(30,42,74,.18);animation:swpopin .45s cubic-bezier(.2,1.4,.4,1)}" +
      "@keyframes swpopin{from{transform:translate(-50%,-50%) scale(.2);opacity:0}to{transform:translate(-50%,-50%) scale(1);opacity:1}}" +
      "#swOverlay .sw-frs{width:150px}" +
      "#swOverlay .sw-frs svg{display:block;width:100%;height:auto}" +
      "#swOverlay .sw-frn{white-space:nowrap;font-family:'Fredoka',sans-serif;font-weight:700;font-size:24px;line-height:1.2}" +
      "#swOverlay .sw-frr{display:inline-block;color:#fff;font-weight:800;font-size:13px;border-radius:999px;padding:3px 12px;margin-top:4px}" +
      "#swOverlay .sw-fcatch{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:10px 0}" +
      "#swOverlay .sw-fth{position:relative;width:66px;display:block}" +
      "#swOverlay .sw-fth svg{display:block;width:100%;height:auto}" +
      "#swOverlay .sw-fnew{position:absolute;top:-6px;right:-8px;background:#FF6B4A;color:#fff;font-size:10px;border-radius:999px;padding:2px 7px}" +
      "#swOverlay .sw-tank{position:relative;height:104px;border-radius:22px;overflow:hidden;margin-top:10px;background:linear-gradient(#DDF3FF,#9ADBF5);box-shadow:inset 0 0 0 4px #fff,0 5px 0 #9FB6CC}" +
      "#swOverlay .sw-tank:after{content:'';position:absolute;left:0;right:0;bottom:0;height:16px;background:linear-gradient(#F3DDA0,#E3C57A);z-index:0}" +
      "#swOverlay .sw-tkl{position:absolute;left:12px;top:6px;font-weight:800;font-size:13px;color:#2B6A8F;z-index:3;background:rgba(255,255,255,.75);border-radius:999px;padding:1px 10px}" +
      "#swOverlay .sw-pl{position:absolute;bottom:3px;font-size:22px;z-index:1}" +
      "#swOverlay .sw-tf{position:absolute;width:64px;left:0;z-index:2;animation:swtank linear infinite}" +
      "@keyframes swtank{0%{left:2%}50%{left:calc(100% - 68px)}100%{left:2%}}" +
      "#swOverlay .sw-tfi{display:block;animation:swturn linear infinite}" +
      "@keyframes swturn{0%,49.9%{transform:scaleX(1)}50%,100%{transform:scaleX(-1)}}" +
      "#swOverlay .sw-tfi svg{display:block;width:100%;height:auto}" +
      "#swOverlay .sw-tfw{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;color:#1E2A4A;background:rgba(255,255,255,.94);border-radius:999px;padding:0 6px 1px;line-height:1.25;white-space:nowrap;pointer-events:none}" +
      "#swOverlay .sw-tin .sw-tfi svg{animation:swtin .9s ease-out}" +
      "@keyframes swtin{from{transform:translateY(-80px) scale(.3);opacity:0}60%{opacity:1}to{transform:none;opacity:1}}" +
      "#swOverlay .sw-tank.sw-tglow{animation:swglow 1.1s}" +
      "@keyframes swglow{0%,100%{box-shadow:inset 0 0 0 4px #fff,0 5px 0 #9FB6CC}50%{box-shadow:inset 0 0 0 4px #FFE066,0 0 22px #FFE066}}" +
      "#swOverlay .sw-fcount{font-weight:800;margin:6px 0 10px}" +
      "#swOverlay .sw-aq{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:30px}" +
      "#swOverlay .sw-aqc{background:#fff;border-radius:22px;padding:14px 10px;text-align:center;box-shadow:0 6px 0 #C9D7E8}" +
      "#swOverlay .sw-aqf{width:100px;margin:0 auto}" +
      "#swOverlay .sw-aqf svg{display:block;width:100%;height:auto}" +
      "#swOverlay .sw-aqn{font-family:'Fredoka',sans-serif;font-weight:700;font-size:18px;margin-top:6px}" +
      "#swOverlay .sw-aqr{font-weight:800;font-size:12px}" +
      "@media(max-width:560px){#swOverlay .sw-sea{height:330px}#swOverlay .sw-fsh{width:96px}#swOverlay .sw-boat{width:112px}#swOverlay .sw-fpet{width:62px}#swOverlay .sw-frs{width:120px}}" +
      "@media(prefers-reduced-motion:reduce){#swOverlay .sw-fbob,#swOverlay .sw-fpet.sw-fwig{animation:none}}" +
      "#swOverlay .sw-g5{background:#DDEFC5;box-shadow:0 6px 0 #9CC57A}" +
      "#swOverlay .sw-games.sw-g2c{grid-template-columns:repeat(2,minmax(0,1fr))}" +
      "#swOverlay .sw-gt,#swOverlay .sw-ct{position:relative}" +
      "#swOverlay .sw-qm{position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;background:#fff;color:#4A2FB8;font:800 14px/22px 'Fredoka',sans-serif;text-align:center;box-shadow:0 2px 0 #C9C0F5}" +
      "#swOverlay .sw-how{text-align:center}#swOverlay .sw-how .sw-start{margin:18px auto 0}" +
      "#swOverlay .sw-more{display:block;margin:-12px auto 22px;background:#fff;border-radius:999px;padding:8px 20px;font-weight:800;font-size:14px;color:#4A2FB8;box-shadow:0 4px 0 #C9C0F5}" +
      "#swOverlay .sw-moreg{margin-top:-8px}" +
      "#swOverlay .sw-mhud{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px 14px;margin:10px 0 0;font-weight:800;font-size:18px}" +
      "#swOverlay .sw-mpet{width:54px;margin:0}" +
      "#swOverlay .sw-mcb{color:#E5683A;min-width:96px;text-align:left}" +
      "#swOverlay .sw-spd{font-size:13px;color:#4A5878;letter-spacing:1px}" +
      "#swOverlay .sw-field{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px 8px;background:linear-gradient(#BDE7A0,#8FCF74);border-radius:26px;padding:10px 10px 6px;box-shadow:inset 0 0 0 4px #fff;margin:10px 0}" +
      "#swOverlay .sw-hl{position:relative;height:122px}" +
      "#swOverlay .sw-hole{position:absolute;left:8%;right:8%;bottom:10px;height:36px;border-radius:50%;background:#3E2A18}" +
      "#swOverlay .sw-mclip{position:absolute;left:0;right:0;top:0;bottom:30px;overflow:hidden;z-index:1}" +
      "#swOverlay .sw-mole{position:absolute;left:50%;bottom:0;width:100px;max-width:100%;margin-left:-50px;padding:0;background:none;transform:translateY(110%);transition:transform var(--mt,.22s) ease-out;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
      "#swOverlay .sw-mole.sw-up{transform:translateY(0)}" +
      "#swOverlay .sw-mole svg{display:block;width:100%;height:auto;pointer-events:none}" +
      "#swOverlay .sw-mw{position:absolute;left:50%;top:58%;transform:translateX(-50%);background:#FFF6D8;border:3px solid #B87333;border-radius:10px;padding:0 8px 1px;font-family:'Fredoka',sans-serif;font-weight:700;color:#1E2A4A;white-space:nowrap;pointer-events:none;line-height:1.3}" +
      "#swOverlay .sw-mw.sw-mg{background:#FFE680;border-color:#E0A800;font-size:15px}" +
      "#swOverlay .sw-dirt{position:absolute;left:3%;right:3%;bottom:0;height:34px;border-radius:50%;background:radial-gradient(ellipse at 50% 20%,#A57A52,#7B5535);z-index:2;pointer-events:none}" +
      "#swOverlay .sw-mole.sw-oops{animation:swshake .4s}" +
      "#swOverlay .sw-mole.sw-hint{animation:swgoldb .45s ease-in-out infinite alternate}" +
      "@keyframes swgoldb{from{filter:drop-shadow(0 0 5px #FFC400) brightness(1)}to{filter:drop-shadow(0 0 18px #FFF08A) brightness(1.4)}}" +
      "#swOverlay .sw-hmr{position:absolute;left:50%;top:-6px;width:64px;height:64px;transform-origin:50% 90%;z-index:5;pointer-events:none}" +
      "#swOverlay .sw-hmr svg{display:block;width:100%;height:100%}" +
      "#swOverlay .sw-bonk{position:absolute;left:50%;top:6px;z-index:6;font-family:'Fredoka',sans-serif;font-weight:700;font-size:20px;color:#FFE066;-webkit-text-stroke:2px #C0392B;paint-order:stroke fill;white-space:nowrap;pointer-events:none}" +
      "@media(max-width:560px){#swOverlay .sw-hl{height:104px}#swOverlay .sw-mole{width:84px;margin-left:-42px}#swOverlay .sw-field{gap:0 4px;padding:8px 6px 4px}#swOverlay .sw-mw{font-size:14px!important}}" +
      "#swOverlay .sw-g6{background:#D8F1D2;box-shadow:0 6px 0 #8CCB86}" +
      "#swOverlay .sw-snk{display:block;margin:10px auto;border-radius:20px;box-shadow:0 0 0 4px #fff,0 6px 0 4px #9FB6CC;touch-action:none;cursor:pointer}" +
      "#swOverlay .sw-dpad{display:grid;grid-template-columns:repeat(3,58px);gap:6px;justify-content:center;margin:12px 0 4px}" +
      "#swOverlay .sw-dp{height:48px;border-radius:16px;background:#fff;box-shadow:0 4px 0 #C9D7E8;font-size:22px;color:#4A2FB8;-webkit-tap-highlight-color:transparent}" +
      "#swOverlay .sw-dp:active{transform:translateY(2px);box-shadow:0 2px 0 #C9D7E8}" +
      "#swOverlay .sw-g7{background:#FFE3C2;box-shadow:0 6px 0 #E8A86A}" +
      "#swOverlay .sw-rwrap{position:relative;margin:10px auto}" +
      "#swOverlay .sw-rwrap .sw-snk{margin:0}" +
      "#swOverlay .sw-rlr{display:flex;justify-content:center;gap:22px;margin:12px 0 4px}" +
      "#swOverlay .sw-dpw{width:110px}" +
      "#swOverlay .sw-g8{background:#E4D9FF;box-shadow:0 6px 0 #AE97F0}" +
      "#swOverlay .sw-g9{background:#FBE9C6;box-shadow:0 6px 0 #E3B96A}" +
      "#swOverlay .sw-dcase{display:flex;align-items:center;justify-content:center;gap:16px;margin:10px 0 0}" +
      "#swOverlay .sw-dcase .sw-mpet{width:54px;margin:0}" +
      "#swOverlay .sw-dsil{font-size:46px;line-height:1;filter:brightness(0) opacity(.55)}" +
      "#swOverlay .sw-dslots{display:flex;gap:6px}" +
      "#swOverlay .sw-dslot{font-style:normal;font-size:22px;background:#EEF2F8;border-radius:12px;padding:4px 8px;filter:grayscale(1) opacity(.45)}" +
      "#swOverlay .sw-dslot.sw-on{filter:none;background:#FFF1C2;box-shadow:0 0 0 2px #FFC93C}" +
      "#swOverlay .sw-desk{display:flex;flex-wrap:wrap;gap:14px 12px;justify-content:center;margin:14px 0 4px;padding:14px 10px;border-radius:22px;background:linear-gradient(#C99A66,#A87846);box-shadow:inset 0 0 0 4px #E0BC8A}" +
      "#swOverlay .sw-fold{position:relative;width:104px;height:78px;background:#F4D58A;border-radius:6px 12px 10px 10px;box-shadow:0 5px 0 #C9A04A;transition:transform .2s}" +
      "#swOverlay .sw-fold:hover{transform:translateY(-3px)}" +
      "#swOverlay .sw-ftab{position:absolute;left:0;top:-9px;width:42px;height:12px;background:#F4D58A;border-radius:6px 6px 0 0}" +
      "#swOverlay .sw-flb{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:#fff;border:2.5px solid #C9A04A;border-radius:10px;padding:2px 10px 3px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:20px;color:#1E2A4A;white-space:nowrap}" +
      "#swOverlay .sw-fold.sw-empty{background:#D8D2C4;box-shadow:0 2px 0 #A8A090;transform:rotate(-4deg);animation:swshake .4s}" +
      "#swOverlay .sw-fold.sw-empty .sw-flb{opacity:.45}" +
      "#swOverlay .sw-fold.sw-open{background:#9EE0A8;box-shadow:0 2px 0 #4FA864;transform:translateY(-6px) scale(1.06)}" +
      "#swOverlay .sw-fold.sw-hint{animation:swgoldb .45s ease-in-out infinite alternate;background:#FFD84A}" +
      "#swOverlay .sw-dpol{position:relative;display:inline-block;background:#fff;border-radius:10px;padding:8px 8px 10px;box-shadow:0 5px 0 #C9D7E8;transform:rotate(-2deg);animation:swpopin2 .45s cubic-bezier(.2,1.4,.4,1)}" +
      "@keyframes swpopin2{from{transform:rotate(-2deg) scale(.3);opacity:0}to{transform:rotate(-2deg) scale(1);opacity:1}}" +
      "#swOverlay .sw-dpol .sw-pic{width:200px;max-width:100%}" +
      "#swOverlay .sw-dcap{font-weight:800;font-size:16px;margin-top:6px;max-width:230px}" +
      "#swOverlay .sw-dstamp{position:absolute;right:-10px;top:-12px;background:#E5483A;color:#fff;font-weight:800;font-size:14px;padding:2px 10px;border-radius:8px;transform:rotate(8deg);z-index:2}" +
      "#swOverlay .sw-dfound{min-height:6px;margin-top:10px}" +
      "#swOverlay .sw-dbig{font-size:90px;line-height:1.1;margin:6px 0}" +
      "#swOverlay .sw-dpop{animation:swpopin2 .6s cubic-bezier(.2,1.4,.4,1)}" +
      "#swOverlay .sw-fnew2{display:inline-block;background:#FF6B4A;color:#fff;font-size:13px;border-radius:999px;padding:2px 9px;vertical-align:middle}" +
      "#swOverlay .sw-dth{position:relative;font-size:38px}" +
      "#swOverlay .sw-dgal{font-size:54px;line-height:1.2}" +
      "#swOverlay .sw-dsilh{filter:brightness(0) opacity(.4)}" +
      "#swOverlay .sw-g10{background:#FFE3C2;box-shadow:0 6px 0 #E8A86A}" +
      "#swOverlay .sw-c3{background:#E7DAFF;box-shadow:0 6px 0 #B49CEB}" +
      "#swOverlay .sw-chal.sw-chal1{grid-template-columns:minmax(0,1fr);max-width:300px;margin:0 auto 14px}" +
      "#swOverlay .sw-chal.sw-morec{margin-top:-4px}" +
      "#swOverlay .sw-cas{display:block;width:100%}" +
      "@media(max-width:560px){#swOverlay .sw-sky{height:235px}#swOverlay .sw-bal{width:23%}#swOverlay .sw-bw{font-size:22px}#swOverlay .sw-pet{width:170px}#swOverlay .sw-plate{font-size:28px;padding:14px 12px;min-width:86px}#swOverlay .sw-plates{gap:10px}#swOverlay .sw-mem,#swOverlay .sw-mem.sw-c5{grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}#swOverlay .sw-mc{height:104px}#swOverlay .sw-mc .sw-mface{font-size:16px;padding:4px}#swOverlay .sw-mc .sw-mface svg{width:100%;height:100%}#swOverlay .sw-sopt{font-size:20px;padding:10px 14px}#swOverlay h1{font-size:28px}#swOverlay .sw-big{font-size:68px}#swOverlay .sw-sent{font-size:23px}#swOverlay .sw-opt{font-size:32px;padding:10px 18px;min-width:90px}#swOverlay .sw-tok{font-size:24px}#swOverlay .sw-grid{grid-template-columns:1fr}#swOverlay .sw-ttl h1{font-size:26px}#swOverlay .sw-bncard h1{font-size:20px}#swOverlay .sw-slab b{font-size:16px}#swOverlay .sw-tw i{font-size:12px;padding:1px 8px}#swOverlay .sw-bub{font-size:17px;padding:9px 13px}#swOverlay .sw-start{font-size:20px}#swOverlay .sw-gt{font-size:13px}#swOverlay .sw-ct{font-size:15px}#swOverlay .sw-bo{font-size:25px;padding:14px 6px}#swOverlay .sw-sl{height:48px;font-size:26px}#swOverlay .sw-ctx{font-size:18px}#swOverlay .sw-arena{height:184px}#swOverlay .sw-apet{width:92px}#swOverlay .sw-amon{width:108px}#swOverlay .sw-lb{width:54px;height:54px;margin:-27px 0 0 -27px;font-size:28px}#swOverlay .sw-bpet{width:70px}#swOverlay .sw-sheet{left:8px;right:8px;bottom:8px;padding:12px}#swOverlay .sw-shp{width:96px}#swOverlay .sw-shw{font-size:32px}#swOverlay .sw-shs{font-size:16px}}" +
      "@media(prefers-reduced-motion:reduce){#swOverlay .sw-qgo,#swOverlay .sw-opt.sw-bad,#swOverlay .sw-sopt.sw-bad,#swOverlay .sw-mc.sw-pair,#swOverlay .sw-bal,#swOverlay .sw-plate.sw-bad,#swOverlay .sw-pet.sw-jump,#swOverlay .sw-pet.sw-dance,#swOverlay .sw-pet.sw-hop,#swOverlay .sw-sky.sw-shake{animation:none}#swOverlay .sw-pf{display:none}#swOverlay .sw-bs{animation:none;opacity:1}#swOverlay .sw-hpet,#swOverlay .sw-ipet,#swOverlay .sw-cready,#swOverlay .sw-rchest,#swOverlay .sw-pbody.sw-chew,#swOverlay .sw-want,#swOverlay .sw-pwalk.sw-wj,#swOverlay .sw-bnpet,#swOverlay .sw-npet,#swOverlay .sw-node.sw-nx,#swOverlay .sw-copen,#swOverlay .sw-start,#swOverlay .sw-tile.sw-next,#swOverlay .sw-isl-go .sw-ibody,#swOverlay .sw-cl1,#swOverlay .sw-cl2{animation:none}}";
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
    return back === showMap ? "Back to the lessons" : back === showBattle ? "Back to the monsters" : "Back to Sight words";
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
  var BOLT = '<svg class="sw-bolt" viewBox="-8 -10 16 20" aria-hidden="true"><path d="M2 -9L-6 2H-1L-3 9L6 -2H1Z" fill="#FFC93C" stroke="#B26A00" stroke-width="1.4" stroke-linejoin="round"/></svg>';
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
    if (rec && rec.pl) return "";
    var n = lessonStars(rec),
      h = "";
    for (var i = 0; i < 3; i++) h += '<span style="color:' + (i < n ? "#FFC93C" : "#D5E0EE") + '">' + scenery("star") + "</span>";
    return h;
  }
  // which islands have lessons (the others are shown grey and locked)
  // the highest stage the child has started a lesson in
  function reachedStage(s) {
    var top = 1;
    D.stages.forEach(function (st) {
      if (
        lessonsOf(st.id).some(function (l) {
          return s.lessons[l.id];
        })
      )
        top = Math.max(top, st.id);
    });
    return top;
  }
  // the games on show on the home page: two for each pair of stages (the others are under "More games"); ?stage=N tries another stage
  var GAMESETS = [["bal", "fish"], ["mole", "feed"], ["snake", "runner"], ["slash", "basket"]];
  function gameSetNo(s) {
    var m = /[?&]stage=(\d)/.exec((root.location && root.location.search) || ""),
      st = m ? +m[1] : reachedStage(s);
    return Math.max(1, Math.min(GAMESETS.length, Math.ceil(st / 2)));
  }
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
        out[st.id] = { title: st.title, known: knownCount(s, ws), total: ws.length, check: checkOffered(s, st.id) };
      }
    });
    return out;
  }
  // the quick check is on offer for an island with lessons left where no lesson has been done yet and the check has not been taken
  function checkOffered(s, sid) {
    var ls = lessonsOf(sid);
    return !s.rev[placeKey(sid)] && !ls.some(function (l) {
      return s.lessons[l.id];
    }) && ls.length > 0;
  }
  // how many of the five monsters have been beaten
  function monsDone(s) {
    var n = 0;
    for (var m = 1; m <= 5; m++) if (s.rev[monKey(m)]) n++;
    return n;
  }
  // how to play: shown the first time a game is opened, and any time from the little ? on its tile
  var HOWTO = {
    swMem: ["Memory match", "记忆配对", "Flip two cards. Match each picture with its sentence.", "翻开两张牌，把图片和它的句子配成一对。"],
    swBal: ["Balloon pop", "戳气球", "Listen to the word, then pop the balloon that has it.", "听单词，戳破写着这个词的气球。"],
    swFeed: ["Feed your pet", "喂宠物", "Read the sentence and pick the missing word to feed your pet.", "读句子，选出缺的那个词来喂宠物。"],
    swFish: ["Word fishing", "钓单词", "Drag the hook to the fish that wears the word you hear. Tap or hold to drop the line.", "听单词，把鱼钩放到写着这个词的鱼那里去钓。"],
    swMole: ["Whack-a-word", "打地鼠", "Tap the mole holding the word you hear. Watch for the golden one!", "听单词，点举着这个词的地鼠。留意金色的那只！"],
    swSnake: ["Word snake", "词汇蛇", "Steer the snake with your finger or the arrow keys. Eat the apple with the right word.", "用手指或方向键控制蛇，吃掉有正确单词的苹果。"],
    swRunner: ["Word racer", "单词赛车", "Slide left or right to pick a lane. Drive through the gate with the right word.", "左右滑动换车道，从有正确单词的门穿过去。"],
    swSlash2: ["Word slash", "切水果", "Swipe across the fruit with the right word. Do not touch the bombs!", "划过有正确单词的水果。不要碰炸弹！"],
    swDet: ["Word detective", "单词神探", "Read the clues and open the folder with the right word to catch the culprit.", "读线索，打开写着正确单词的档案夹，抓住嫌疑人。"],
    swHoop: ["Word basketball", "单词投篮", "Flick the ball up at the hoop that shows the right word.", "把球往上弹，投进有正确单词的篮筐。"],
    swSpell: ["Bubble spell", "泡泡拼词", "Listen, then tap the letter bubbles in the right order to spell the word.", "听单词，按顺序点字母泡泡，把它拼出来。"],
    swBattle: ["Monster battle", "打怪兽", "Answer the word questions to power up your pet and beat the monster.", "回答单词题，给宠物加油，打败怪兽。"],
    swDeep: ["Deep sea treasure", "深海寻宝", "Drag up and down to swim. Swim into the treasure chest that has the word you hear. Keep away from the jellyfish, they take your air!", "上下拖动小宠物游泳，游进写着你听到的单词的宝箱。躲开水母，被它电到会少一格空气！"],
    swDungeon: ["Word dungeon", "词汇地牢", "Drag to walk through the maze. Find the treasure chest that has the word you hear. A ghost floats around: if it touches you, you go back to the start!", "拖动宠物在迷宫里走路，找到写着你听到的单词的宝箱。小心幽灵，被它碰到会回到起点！"],
    swSpace: ["Space shooter", "太空射手", "Drag left and right to fly your rocket. It fires by itself. Shoot the saucer that has the word you hear. Do not let it get past you!", "左右拖动飞船，它会自动开火。打中写着你听到的单词的飞碟，别让它飞过去！"],
    swSiege2: ["Castle siege", "弹弓攻城", "Pull the sling back and let go. Hit the sign with the right word to knock the tower down. Pull further to shoot further. A faint dotted line shows the path.", "向后拉弹弓再松手，打中写着正确单词的牌子，塔就会倒。拉得越远飞得越远，虚线是飞行路线。"],
  };
  function howSeen() {
    try {
      return JSON.parse(localStorage.getItem("lef_howto_v1") || "{}");
    } catch (e) {
      return {};
    }
  }
  function howSet(id) {
    try {
      var m = howSeen();
      m[id] = 1;
      localStorage.setItem("lef_howto_v1", JSON.stringify(m));
    } catch (e) {}
  }
  // shows the card for a game, then calls go()
  function howTo(id, go) {
    var t = HOWTO[id];
    if (!t) return go();
    howSet(id);
    box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button></div><div class="sw-card sw-how"><div class="sw-kind">How to play · 玩法</div><h1>' + esc(t[0]) + " · " + esc(t[1]) + '</h1><div class="sw-sent" style="font-size:20px">' + esc(t[2]) + '</div><div class="sw-sent" style="font-size:18px;color:#5B6B8C">' + esc(t[3]) + '</div><button class="sw-start" id="swHowGo">' + PLAY + "Let’s play! · 开始</button></div>";
    document.getElementById("swQuit").onclick = showHome;
    document.getElementById("swHowGo").onclick = go;
    ov.scrollTop = 0;
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
    var GM = {
        bal: { id: "swBal", cls: "sw-g2", icon: "balloon", label: "Balloon pop" },
        fish: { id: "swFish", cls: "sw-g4", icon: "fish", label: "Word fishing" },
        mole: { id: "swMole", cls: "sw-g5", icon: "mole", label: "Whack-a-word" },
        feed: { id: "swFeed", cls: "sw-g3", icon: "feed", label: feedLabel() },
        mem: { id: "swMem", cls: "sw-g1", icon: "memory", label: "Memory match" },
        snake: { id: "swSnake", cls: "sw-g6", icon: "snake", label: "Word snake" },
        runner: { id: "swRunner", cls: "sw-g7", icon: "runner", label: "Word racer" },
        slash: { id: "swSlash2", cls: "sw-g8", icon: "slash", label: "Word slash" },
        detective: { id: "swDet", cls: "sw-g9", icon: "detective", label: "Word detective" },
        basket: { id: "swHoop", cls: "sw-g10", icon: "hoop", label: "Word basketball" },
      },
      mainG = GAMESETS[gameSetNo(s) - 1],
      moreG = Object.keys(GM).filter(function (k) {
        return mainG.indexOf(k) < 0;
      });
    // one challenge for each stage (the island's own); a stage without one of its own yet shows the latest, and all of them are under "All challenges"
    var CHS = {
        battle: { id: "swBattle", cls: "sw-c2", label: "Monster battle", sub: "打怪兽 · " + monsDone(s) + " / 5", art: monArt(1, "cheer") },
        spell: { id: "swSpell", cls: "sw-c1", label: "Bubble spell", sub: "泡泡拼词", art: scenery("game", "spell") },
        siege: { id: "swSiege2", cls: "sw-c3", label: "Castle siege", sub: "弹弓攻城 · " + castlesDone(readSling()) + " / " + CASTLES.length, art: scenery("game", "castle") },
        space: { id: "swSpace", cls: "sw-cs", label: "Space shooter", sub: "太空射手 · best " + readSpace().best, art: scenery("game", "space") },
        dungeon: { id: "swDungeon", cls: "sw-cd", label: "Word dungeon", sub: "词汇地牢 · best " + readDungeon().best, art: scenery("game", "dungeon") },
        deep: { id: "swDeep", cls: "sw-cp", label: "Deep sea treasure", sub: "深海寻宝 · best " + readDeep().best, art: scenery("game", "deep") },
      },
      chOrder = ["battle", "spell", "siege", "space", "dungeon", "deep"],
      mainCh = chOrder[Math.min(chOrder.length, (/[?&]stage=(\d)/.exec((root.location && root.location.search) || "") ? +/[?&]stage=(\d)/.exec(root.location.search)[1] : reachedStage(s))) - 1],
      moreCh = chOrder.filter(function (k) {
        return k !== mainCh;
      });
    function chTile(k) {
      return '<button class="sw-ct ' + CHS[k].cls + '" id="' + CHS[k].id + '"><span class="sw-gi">' + CHS[k].art + "</span>" + CHS[k].label + "<small>" + CHS[k].sub + '</small><span class="sw-qm" data-q="' + CHS[k].id + '">?</span></button>';
    }
    function gameTile(k) {
      return '<button class="sw-gt ' + GM[k].cls + '" id="' + GM[k].id + '"><span class="sw-gi">' + scenery("game", GM[k].icon) + "</span>" + esc(GM[k].label) + '<span class="sw-qm" data-q="' + GM[k].id + '">?</span></button>';
    }
    var h = '<div class="sw-home"><div class="sw-top"><button class="sw-back" id="swClose">← Back</button>' + (p ? '<span class="sw-starpill">' + scenery("star") + (+p.stars || 0) + "</span>" : "") + "</div>" +
      '<div class="sw-ttl"><span class="sw-aa">Aa</span><div><h1>Sight words</h1><div class="sw-sub">The words you will see in almost every story · 高频词</div></div></div>' +
      '<div class="sw-hero"><div class="sw-herobg">' + scenery("hero") + '</div><span class="sw-tpill">' + esc(pill) + "</span>" +
      '<div class="sw-hrow"><div class="sw-hpet">' + pet("happy") + '</div><div class="sw-hsay"><div class="sw-bub">' + esc(say1) + "<b>" + esc(say2) + '</b></div><div class="sw-wchs">' + chipsHtml(list) + "</div></div></div>" +
      '<button class="sw-start" id="swToday">' + PLAY + esc(btn) + "</button></div>" +
      '<div class="sw-sect">Play with your words</div><div class="sw-games sw-g2c">' + mainG.map(gameTile).join("") + '</div><button class="sw-more" id="swMore">More games · 更多游戏 ▾</button><div class="sw-games sw-moreg" id="swMoreG" style="display:none">' + moreG.map(gameTile).join("") + "</div>" +
      '<div class="sw-sect">Challenge · 挑战</div><div class="sw-chal sw-chal1">' + chTile(mainCh) + '</div><button class="sw-more" id="swMoreC">All challenges · 所有挑战 ▾</button><div class="sw-chal sw-morec" id="swMoreCG" style="display:none">' + moreCh.map(chTile).join("") + "</div>" +
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
    var starters = {
      swMem: function () {
        startMemory(memoryWords(s));
      },
      swBal: function () {
        startBalloons(gameWords(s, 8));
      },
      swFeed: function () {
        startFeed(gameWords(s, 6, true));
      },
      swFish: function () {
        startFishing(gameWords(s, 8));
      },
      swMole: function () {
        startWhack(gameWords(s, 8));
      },
      swSnake: function () {
        startSnake(gameWords(s, 6));
      },
      swRunner: function () {
        startRunner(gameWords(s, 6));
      },
      swSlash2: function () {
        startSlash(gameWords(s, 8));
      },
      swDet: function () {
        startDetective(gameWords(s, 8));
      },
      swHoop: function () {
        startBasket(gameWords(s, 8));
      },
    };
    Object.keys(starters).forEach(function (id) {
      var b = document.getElementById(id);
      if (b)
        b.onclick = function () {
          back = showHome;
          if (howSeen()[id]) starters[id]();
          else howTo(id, starters[id]);
        };
    });
    document.getElementById("swMore").onclick = function () {
      var g = document.getElementById("swMoreG"),
        open = g.style.display === "none";
      g.style.display = open ? "" : "none";
      this.textContent = open ? "Fewer games ▴" : "More games · 更多游戏 ▾";
    };
    var chStart = {
      swSpell: function () {
        startSpell(spellList(readState()));
      },
      swBattle: function () {
        showBattle();
      },
      swSiege2: function () {
        showCastles();
      },
      swSpace: function () {
        startSpace(gameWords(readState(), 8));
      },
      swDungeon: function () {
        startDungeon(gameWords(readState(), 8));
      },
      swDeep: function () {
        startDeep(gameWords(readState(), 8));
      },
    };
    Object.keys(chStart).forEach(function (id) {
      var b = document.getElementById(id);
      if (b)
        b.onclick = function () {
          back = showHome;
          if (howSeen()[id]) chStart[id]();
          else howTo(id, chStart[id]);
        };
    });
    document.getElementById("swMoreC").onclick = function () {
      var g = document.getElementById("swMoreCG"),
        open = g.style.display === "none";
      g.style.display = open ? "" : "none";
      this.textContent = open ? "Fewer challenges ▴" : "All challenges · 所有挑战 ▾";
    };
    Array.prototype.forEach.call(box.querySelectorAll(".sw-qm"), function (q) {
      q.onclick = function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var id = q.getAttribute("data-q");
        back = showHome;
        howTo(id, starters[id] || chStart[id]);
      };
    });
    document.getElementById("swWall").onclick = showWall;
    Array.prototype.forEach.call(box.querySelectorAll(".sw-isl-qc"), function (q) {
      var n = +q.getAttribute("data-s") || 1;
      q.onclick = function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        startPlacement(n);
      };
      q.onkeydown = function (e) {
        if (e.keyCode === 13 || e.keyCode === 32) {
          if (e.stopPropagation) e.stopPropagation();
          startPlacement(n);
        }
      };
    });
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
    // the quick check: offered on an island the child has not started (and not taken or turned down), and as a small link while there are lessons left
    var qleft = placeInit(lessonsOf(sid), s, seeded(1)).order.length,
      qdone = lessonsOf(sid).filter(function (l) {
        return s.lessons[l.id];
      }).length;
    if (qleft && !qdone && !s.rev[placeKey(sid)] && !s.rev[placeSkipKey(sid)])
      h += '<div class="sw-qcard"><div class="sw-qcpet">' + pet("excited") + '</div><div class="sw-qct"><b>' + BOLT + 'Already know some words?</b><span>Take a quick check and start in the right place. 小测一下，从合适的地方开始</span><div class="sw-qcb"><button class="sw-go sw-qgo" id="swQGo">' + BOLT + 'Start the check</button><button class="sw-linkbtn" id="swQNot">Not now</button></div></div></div>';
    else if (qleft) h += '<button class="sw-qbar" id="swQLink">' + BOLT + "<b>Quick check · 小测</b><span>Skip the words you already know</span></button>";
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
    var qgo = document.getElementById("swQGo") || document.getElementById("swQLink"),
      qno = document.getElementById("swQNot");
    if (qgo)
      qgo.onclick = function () {
        startPlacement(sid);
      };
    if (qno)
      qno.onclick = function () {
        var s2 = readState();
        s2.rev[placeSkipKey(sid)] = Date.now();
        writeState(s2);
        trk("sw_place_skip", stageTag(sid), "", "game");
        showMap(true);
      };
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
  /* ---- the quick check before an island: hear a word, tap it ("I'm not sure" is fine and counts as a miss, so nobody has to guess) ---- */
  function startPlacement(sid) {
    back = showMap;
    mapStage = sid;
    var s = readState(),
      pool = stageWordsOf(sid),
      rnd = seeded(sid * 104729 + (Date.now() % 9973)),
      ps = placeInit(lessonsOf(sid), s, rnd),
      timer = null,
      locked = false,
      finished = false;
    if (ps.done) {
      showMap(false, sid);
      return;
    }
    gameTag = "game";
    var me = { mode: "place", sid: sid, ps: ps, done: false, steps: [] };
    run = me;
    // leaving half way keeps what was shown so far (it only ever adds)
    me.stop = function () {
      clearTimeout(timer);
      if (!finished && (ps.passed.length || ps.good.length)) {
        var s2 = readState();
        placeApply(s2, D.lessons, ps, sid, dayStr(), Date.now());
        writeState(s2);
        refreshButton();
      }
    };
    trk("sw_place_start", stageTag(sid), ps.order.length + " lessons", "game");
    function trail() {
      var h = "";
      ps.order.forEach(function (id, n) {
        var st = ps.passed.indexOf(id) >= 0 ? " sw-qp" : ps.failed.indexOf(id) >= 0 ? " sw-qf" : n === ps.i ? " sw-qn" : "";
        h += '<i class="sw-qd' + st + '">' + (st === " sw-qp" ? "✓" : id) + "</i>";
      });
      return '<div class="sw-qtrack">' + h + "</div>";
    }
    function qReact(good) {
      var e = document.getElementById("swQPet");
      if (!e) return;
      e.innerHTML = petArt(good ? "excited" : "surprised");
      setTimeout(function () {
        if (document.getElementById("swQPet") === e) e.innerHTML = petArt("happy");
      }, 1000);
    }
    function ask() {
      if (run !== me || me.done) return;
      var w = placeWord(ps);
      if (!w) {
        finishCheck();
        return;
      }
      locked = false;
      var opts = shuffle([w].concat(distractors(w, pool, rnd, [], 3)), rnd);
      box.innerHTML = gTop("Quick check · Stage " + sid) + '<div class="sw-card sw-qc"><div class="sw-kind" style="background:#2A66C9">Quick check</div><div class="sw-qpet" id="swQPet">' + petArt("happy") + "</div>" +
        trail() + '<div class="sw-sent">Which word do you hear?</div><button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><div class="sw-opts" id="swOpts">' +
        opts.map(function (o) {
          return '<button class="sw-opt" data-w="' + esc(o) + '">' + esc(o) + "</button>";
        }).join("") + '</div><button class="sw-linkbtn" id="swQNo">I’m not sure</button><div class="sw-msg" id="swMsg"></div></div>';
      bindQuit();
      document.getElementById("swHear").onclick = function () {
        play("w", w);
      };
      function pick(b) {
        if (locked) return;
        locked = true;
        var right = !!b && wkey(b.getAttribute("data-w")) === wkey(w),
          all = box.querySelectorAll(".sw-opt");
        placeAnswer(ps, right);
        if (b) b.classList.add(right ? "sw-ok" : "sw-bad");
        if (!right)
          Array.prototype.forEach.call(all, function (o) {
            if (wkey(o.getAttribute("data-w")) === wkey(w)) o.classList.add("sw-ok");
          });
        sfx(right ? "cheer" : "poke");
        qReact(right);
        var m = document.getElementById("swMsg");
        if (m) m.textContent = right ? "Yes!" : b ? "It was “" + w + "”." : "That’s okay. It was “" + w + "”.";
        timer = setTimeout(ask, right ? 750 : 1500);
      }
      Array.prototype.forEach.call(box.querySelectorAll(".sw-opt"), function (b) {
        b.onclick = function () {
          pick(b);
        };
      });
      document.getElementById("swQNo").onclick = function () {
        pick(null);
      };
      timer = setTimeout(function () {
        play("w", w);
      }, 200);
    }
    function finishCheck() {
      finished = true;
      me.done = true;
      var s2 = readState(),
        had = !!s2.rev[placeKey(sid)];
      placeApply(s2, D.lessons, ps, sid, dayStr(), Date.now());
      writeState(s2);
      var stars = had ? 0 : 2,
        got = 0;
      if (stars && hooks.award) {
        try {
          got = hooks.award(stars);
          if (hooks.toast) hooks.toast([[2, "Took the quick check", "完成入岛小测"]], got, got < stars);
        } catch (e) {}
      }
      trk("sw_place_done", stageTag(sid), ps.passed.length + " of " + ps.order.length + " lessons", "game");
      refreshButton();
      var lessons = lessonsOf(sid),
        next = nextLesson(lessons, s2),
        n = ps.passed.length,
        title,
        line,
        known = [];
      ps.passed.forEach(function (id) {
        known = known.concat(lessonOf(id).words);
      });
      if (!next) {
        title = "You know this whole island!";
        line = "Play the unit challenges to open the treasure chests.";
      } else if (n) {
        title = "You already know " + plural(n, "lesson") + "!";
        line = "Start at Lesson " + next + ". The words you know will come back in your reviews.";
      } else {
        title = "Let’s start at the beginning!";
        line = "You will learn the words one step at a time. Lesson " + next + " is first.";
      }
      sfx(n ? "big" : "cheer");
      if (n)
        try {
          if (hooks.burst) hooks.burst(root.innerWidth / 2, 180);
        } catch (e) {}
      box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button></div><div class="sw-card sw-fin"><div class="sw-kind" style="background:#2A66C9">Quick check</div>' +
        '<div class="sw-qpet sw-qbig">' + petArt(n ? "excited" : "happy") + '</div><div class="sw-big" style="font-size:40px">' + esc(title) + '</div><div class="sw-sent" style="font-size:19px">' + esc(line) + "</div>" +
        (known.length ? '<div class="sw-wchs">' + chipsHtml(known.slice(0, 12)) + (known.length > 12 ? '<span class="sw-wch" style="background:#F1F5FA;color:#4A5878">+' + (known.length - 12) + "</span>" : "") + "</div>" : "") +
        (next ? '<button class="sw-go" id="swQStart">Start lesson ' + next + '</button> ' : "") +
        '<button class="sw-say sw-alt" id="swQMap">' + (next ? "See the map" : "Go to the map") + "</button>" + (got ? '<div class="sw-msg">+' + got + " ★</div>" : "") + "</div>";
      document.getElementById("swQuit").onclick = goBack;
      document.getElementById("swQMap").onclick = function () {
        showMap(false, sid);
      };
      var go = document.getElementById("swQStart");
      if (go)
        go.onclick = function () {
          startLesson(next);
        };
    }
    ask();
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
  // which pet and what it wears, for drawing it as a living rig in the battle
  function petRigArgs() {
    var p = hooks.pet ? hooks.pet() : null;
    return { type: p && root.PETS && root.PETS[p.type] ? p.type : "cat", eq: p && p.eq ? p.eq : {} };
  }
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
    trk("sw_game_done", kind === "f" ? "feed" : kind === "s" ? "spell" : kind === "m" ? "battle" : kind === "h" ? "fishing" : kind === "w" ? "whack" : kind === "n" ? "snake" : kind === "r" ? "runner" : kind === "l" ? "slash" : kind === "d" ? "detective" : kind === "k" ? "basketball" : kind === "c" ? "siege" : kind === "p" ? "space" : kind === "g" ? "dungeon" : kind === "q" ? "deepsea" : "balloon", right + "/" + total, kind === "b" ? gameTag : "game");
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

  /* ---- Word fishing: hear a word, catch the fish that carries it; every catch is a surprise fish for the aquarium ---- */
  var FISHKEY = "lef_fish_v1";
  var RARITY = ["Common", "Special", "Rare", "Legendary"],
    RARCOL = ["#6B7B93", "#2E9E5B", "#6A48E8", "#E0A800"];
  var SPECIES = [
    { id: "clown", name: "Clown fish", rar: 0, body: "#FF8A3D", fin: "#FFC79A", pat: "stripe" },
    { id: "tang", name: "Blue tang", rar: 0, body: "#3D8BF2", fin: "#FFD23F", pat: "none" },
    { id: "lime", name: "Lime guppy", rar: 0, body: "#7ED957", fin: "#C9F2A8", pat: "dots" },
    { id: "puffy", name: "Pink puffer", rar: 0, body: "#FF8FB1", fin: "#FFD0E0", pat: "dots" },
    { id: "angel", name: "Purple angel", rar: 1, body: "#8B6BE8", fin: "#D8CCFF", pat: "stripe" },
    { id: "zebra", name: "Zebra fish", rar: 1, body: "#F4F7FB", fin: "#C9D7E8", pat: "black" },
    { id: "sunny", name: "Sunny fish", rar: 1, body: "#FFD23F", fin: "#FF9F1C", pat: "dots" },
    { id: "gold", name: "Golden fish", rar: 2, body: "#FFC400", fin: "#FFE680", pat: "shine" },
    { id: "rainbow", name: "Rainbow fish", rar: 2, body: "url(#swRb)", fin: "#9BE7FF", pat: "shine" },
    { id: "moon", name: "Moon fish", rar: 3, body: "#DDE6FF", fin: "#FFF3B0", pat: "star" },
  ];
  function readFish() {
    var o = null;
    try {
      o = JSON.parse(ls.getItem(FISHKEY));
    } catch (e) {}
    return o && typeof o === "object" && !Array.isArray(o) ? o : {};
  }
  function writeFish(o) {
    try {
      ls.setItem(FISHKEY, JSON.stringify(o));
    } catch (e) {}
  }
  // the fish swimming in the tank, with the word each one was caught with (the last 12 catches)
  var FISHLIST = "lef_fishlist_v1",
    TANKMAX = 12;
  function readFishList() {
    var a = null;
    try {
      a = JSON.parse(ls.getItem(FISHLIST));
    } catch (e) {}
    return Array.isArray(a) ? a : [];
  }
  function writeFishList(items) {
    try {
      ls.setItem(
        FISHLIST,
        JSON.stringify(
          items.map(function (it) {
            return { s: it.sp.id, w: it.w };
          })
        )
      );
    } catch (e) {}
  }
  function fishFound(o) {
    return SPECIES.filter(function (sp) {
      return o[sp.id] > 0;
    }).length;
  }
  // the surprise: mostly common fish, now and then a special, a rare or a legendary one
  function rollFish() {
    var r = Math.random() * 100,
      rar = r < 62 ? 0 : r < 88 ? 1 : r < 98 ? 2 : 3,
      list = SPECIES.filter(function (f) {
        return f.rar === rar;
      });
    return list[Math.floor(Math.random() * list.length)];
  }
  // a fish facing right (viewBox 100 x 64); dark = a silhouette for a fish not found yet
  function fishSvg(sp, dark) {
    var b = dark ? "#9FB0C8" : sp.body,
      f = dark ? "#B8C5D8" : sp.fin,
      inner = '<path d="M24 32 L3 12 Q10 32 3 52Z" fill="' + f + '"/><path d="M38 13 Q52 -2 68 13Z" fill="' + f + '"/><path d="M48 50 Q54 62 62 50Z" fill="' + f + '"/><ellipse cx="56" cy="32" rx="38" ry="24" fill="' + b + '"/>';
    if (!dark) {
      if (sp.pat === "stripe") inner += '<path d="M48 10 Q58 32 48 54" fill="none" stroke="#fff" stroke-width="8" opacity=".9"/>';
      else if (sp.pat === "black") inner += '<path d="M40 10 Q48 32 40 54 M58 8 Q66 32 58 56" fill="none" stroke="#1E2A4A" stroke-width="6" opacity=".85"/>';
      else if (sp.pat === "dots") inner += '<circle cx="44" cy="24" r="4" fill="#fff" opacity=".85"/><circle cx="56" cy="38" r="4.5" fill="#fff" opacity=".85"/><circle cx="68" cy="22" r="3.4" fill="#fff" opacity=".85"/>';
      else if (sp.pat === "shine") inner += '<ellipse cx="46" cy="20" rx="12" ry="5" fill="#fff" opacity=".55" transform="rotate(-18 46 20)"/><path d="M60 40 l2 4 4 .6 -3 3 .8 4 -3.8 -2 -3.8 2 .8 -4 -3 -3 4 -.6z" fill="#fff" opacity=".8"/>';
      else if (sp.pat === "star") inner += '<path d="M50 24 l3 7 7.5 .8 -5.6 5 1.7 7.4 -6.6 -3.9 -6.6 3.9 1.7 -7.4 -5.6 -5 7.5 -.8z" fill="#FFD23F"/>';
      inner += '<circle cx="80" cy="26" r="5.4" fill="#fff"/><circle cx="81.6" cy="26.4" r="2.8" fill="#1E2A4A"/><path d="M90 38 Q86 43 81 41" fill="none" stroke="#1E2A4A" stroke-width="2" stroke-linecap="round" opacity=".7"/>';
    } else inner += '<text x="62" y="42" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="28" fill="#fff">?</text>';
    if (!dark && sp.body.indexOf("url") < 0 && typeof root.softSvg === "function") inner = root.softSvg(inner);
    var defs = !dark && sp.body.indexOf("url") === 0 ? '<defs><linearGradient id="swRb" x1="0" x2="1"><stop offset="0" stop-color="#FF6B6B"/><stop offset=".25" stop-color="#FFD23F"/><stop offset=".5" stop-color="#7ED957"/><stop offset=".75" stop-color="#3D8BF2"/><stop offset="1" stop-color="#8B6BE8"/></linearGradient></defs>' : "";
    return '<svg viewBox="-2 -4 104 70" aria-hidden="true">' + defs + inner + "</svg>";
  }
  var BOATSVG = '<svg viewBox="0 0 120 40" aria-hidden="true"><path d="M6 10 L114 10 Q108 36 86 36 L34 36 Q12 36 6 10Z" fill="#E5483A"/><path d="M10 16 L110 16" stroke="#fff" stroke-width="3" opacity=".7"/><path d="M6 10 L114 10" stroke="#B3361E" stroke-width="3" stroke-linecap="round"/></svg>';
  // a little splash of water drops at (x, y) of the sea
  function splash(sea, x, y) {
    var calm = false,
      i;
    try {
      calm = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {}
    if (calm) return;
    for (i = 0; i < 9; i++) {
      var d = document.createElement("i"),
        a = -Math.PI * (0.1 + (0.8 * i) / 8),
        dist = 38 + Math.random() * 34;
      d.className = "sw-drop";
      d.style.left = x + "px";
      d.style.top = y + "px";
      sea.appendChild(d);
      if (d.animate) {
        try {
          d.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: "translate(" + Math.cos(a) * dist + "px," + (Math.sin(a) * dist + 30) + "px) scale(.4)", opacity: 0 }], { duration: 700, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" });
        } catch (e2) {}
      }
      setTimeout(
        (function (n) {
          return function () {
            if (n.parentNode) n.parentNode.removeChild(n);
          };
        })(d),
        760
      );
    }
  }
  function startFishing(words) {
    gameTag = "game";
    trk("sw_game_start", "fishing", "", "game");
    var pool = gamePool(learnedWords(readState()), words, firstLessonsWords(), 4),
      rounds = roundsFor(words, pool, seeded(Date.now() % 9973), 3),
      first = {},
      caught = [],
      i = 0,
      my = null,
      tank = [],
      t0 = Date.now();
    // the fish caught before swim in the tank from the start, each with its word (fish found before words were kept get a word they know)
    readFishList().forEach(function (it) {
      SPECIES.forEach(function (sp) {
        if (it && sp.id === it.s && typeof it.w === "string") tank.push({ sp: sp, w: it.w });
      });
    });
    if (!tank.length) {
      var f0 = readFish();
      SPECIES.forEach(function (sp, n) {
        if (f0[sp.id] > 0 && pool.length) tank.push({ sp: sp, w: pool[n % pool.length] });
      });
    }
    tank = tank.slice(-TANKMAX);
    // the child's own aquarium, always on the screen: every fish found so far, swimming; the newest one drops in
    function tankHtml(newIdx) {
      var el = (Date.now() - t0) / 1000;
      return '<div class="sw-tkl">🐠 My aquarium · ' + fishFound(readFish()) + " / " + SPECIES.length + '</div><span class="sw-pl" style="left:5%">🌿</span><span class="sw-pl" style="left:90%">🐚</span>' +
        tank.map(function (it, n) {
          var dur = 80 + (n % 4) * 16,
            delay = (-((el + n * 7.3) % dur)).toFixed(1),
            w = it.w;
          return '<span class="sw-tf' + (n === newIdx ? " sw-tin" : "") + '" style="top:' + (24 + (n % 3) * 17) + "px;animation-duration:" + dur + "s;animation-delay:" + delay + 's"><span class="sw-tfi" style="animation-duration:' + dur + "s;animation-delay:" + delay + 's">' + fishSvg(it.sp) + '</span><span class="sw-tfw" style="font-size:' + (w.length > 8 ? 9 : w.length > 6 ? 10 : 12) + 'px">' + esc(w) + "</span></span>";
        }).join("");
    }
    // a catch: the pet wiggles with joy and hearts and stars fly out of the boat
    function cheer(sea) {
      var pe = sea.querySelector(".sw-fpet"),
        i,
        calm = false;
      try {
        calm = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
      } catch (e) {}
      if (pe) {
        pe.innerHTML = petArt("excited");
        pe.classList.remove("sw-fwig");
        void pe.offsetWidth;
        pe.classList.add("sw-fwig");
        setTimeout(function () {
          if (run === my && pe.parentNode) {
            pe.classList.remove("sw-fwig");
            pe.innerHTML = petArt("happy");
          }
        }, 1500);
      }
      if (calm) return;
      var star = '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 1 L17.5 10.5 L27 14 L17.5 17.5 L14 27 L10.5 17.5 L1 14 L10.5 10.5Z" fill="#FFD23F" stroke="#E0A800" stroke-width="1.4" stroke-linejoin="round"/></svg>';
      for (i = 0; i < 10; i++) {
        var d = document.createElement("i"),
          a = -Math.PI * (0.05 + (0.9 * i) / 9),
          dist = 60 + Math.random() * 60;
        d.className = "sw-hs";
        d.innerHTML = i % 2 ? star : HEARTSVG;
        d.style.left = sea.clientWidth / 2 + "px";
        d.style.top = "46px";
        sea.appendChild(d);
        if (d.animate) {
          try {
            d.animate([{ transform: "translate(-50%,-50%) scale(.3)", opacity: 1 }, { transform: "translate(calc(-50% + " + Math.cos(a) * dist + "px),calc(-50% + " + Math.sin(a) * dist * 0.7 + "px)) scale(1) rotate(" + (Math.random() * 60 - 30) + "deg)", opacity: 1, offset: 0.6 }, { transform: "translate(calc(-50% + " + Math.cos(a) * dist * 1.15 + "px),calc(-50% + " + (Math.sin(a) * dist * 0.7 + 18) + "px)) scale(.8)", opacity: 0 }], { duration: 1200, easing: "ease-out", fill: "forwards", delay: i * 40 });
          } catch (e2) {}
        }
        setTimeout(
          (function (n) {
            return function () {
              if (n.parentNode) n.parentNode.removeChild(n);
            };
          })(d),
          1500
        );
      }
    }
    function finish() {
      var found = readFish(),
        thumbs = caught
          .map(function (c) {
            return '<span class="sw-fth">' + fishSvg(c.sp) + (c.isNew ? '<b class="sw-fnew">NEW</b>' : "") + "</span>";
          })
          .join(""),
        extra = '<div class="sw-fcatch">' + thumbs + '</div><div class="sw-fcount">Aquarium: ' + fishFound(found) + " / " + SPECIES.length + ' fish</div><button class="sw-say sw-alt" id="swAqua">Look at my aquarium</button>' +
          '<div class="sw-stage"><div class="sw-pet sw-pets sw-hop">' + petArt("happy") + "</div></div>";
      endGame("h", first, "Word fishing", function (r, t) {
        return r >= t ? "Perfect fishing!" : "What a catch!";
      }, function (r, t) {
        return r + " of " + t + " on the first try.";
      }, function () {
        startFishing(gameWords(readState(), 8));
      }, extra, function () {
        var b = document.getElementById("swAqua");
        if (b) b.onclick = showAquarium;
      });
    }
    function show() {
      if (run !== my) return;
      if (i >= rounds.length) {
        finish();
        return;
      }
      var r = rounds[i],
        k = wkey(r.w),
        tries = 0,
        busy = false,
        off = i % 4,
        lanes = shuffle([0, 1, 2, 3], seeded(i * 7 + 3)),
        fish = r.opts
          .map(function (w, n) {
            var right = (n + i) % 2 === 0,
              dur = 12 + ((n * 3 + i) % 5) * 2,
              delay = -((n * 2.9 + i * 1.7) % dur);
            return '<button class="sw-fsh ' + (right ? "sw-fr" : "sw-fl") + '" data-w="' + esc(w) + '" style="top:' + (96 + lanes[n] * 50) + "px;animation-duration:" + dur + "s;animation-delay:" + delay.toFixed(1) + 's">' +
              '<span class="sw-fbob"><span class="sw-fbody' + (right ? "" : " sw-flip") + '">' + fishSvg(SPECIES[(n + off) % 4]) + '</span><span class="sw-fw" style="font-size:' + (w.length > 8 ? 14 : w.length > 6 ? 17 : 21) + 'px">' + esc(w) + "</span></span></button>";
          })
          .join("");
      box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Word fishing · ' + (i + 1) + " / " + rounds.length + "</span></div>" +
        '<div class="sw-card"><div class="sw-kind">Word fishing</div><div class="sw-sent" style="font-size:22px">Catch the fish with the word you hear!</div>' +
        '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><div class="sw-sea" id="swSea"><div class="sw-boat"><div class="sw-fpet">' + petArt("happy") + "</div>" + BOATSVG + '</div><div class="sw-bk" id="swBk">🐟 ' + caught.length + "</div>" + fish +
        '</div><div class="sw-tank" id="swTank">' + tankHtml(-1) + '</div><div class="sw-msg" id="swMsg"></div></div>';
      bindQuit();
      document.getElementById("swHear").onclick = function () {
        play("w", r.w);
      };
      Array.prototype.forEach.call(box.querySelectorAll(".sw-fsh"), function (b) {
        b.onclick = function () {
          if (busy) return;
          var right = wkey(b.getAttribute("data-w")) === k;
          if (first[k] === undefined) first[k] = right;
          else if (!right) first[k] = false;
          if (!right) {
            tries++;
            b.classList.add("sw-wob");
            sfx("poke");
            tell("Not that one. Listen again!", false);
            setTimeout(function () {
              b.classList.remove("sw-wob");
            }, 450);
            if (tries >= 2)
              Array.prototype.forEach.call(box.querySelectorAll(".sw-fsh"), function (o) {
                if (wkey(o.getAttribute("data-w")) === k) o.classList.add("sw-hint");
              });
            return;
          }
          busy = true;
          var sea = document.getElementById("swSea"),
            sr = sea.getBoundingClientRect(),
            br = b.getBoundingClientRect(),
            fx = br.left - sr.left + br.width / 2,
            fy = br.top - sr.top + br.height / 2,
            hx = sr.width / 2,
            hy = 78,
            len = Math.sqrt((fx - hx) * (fx - hx) + (fy - hy) * (fy - hy)),
            ang = (Math.atan2(fx - hx, fy - hy) * 180) / Math.PI,
            line = document.createElement("div"),
            sp = rollFish(),
            found = readFish(),
            isNew = !(found[sp.id] > 0);
          found[sp.id] = (found[sp.id] || 0) + 1;
          writeFish(found);
          caught.push({ sp: sp, isNew: isNew });
          Array.prototype.forEach.call(box.querySelectorAll(".sw-fsh"), function (o) {
            if (o !== b) o.classList.add("sw-fgone");
          });
          b.style.left = br.left - sr.left + "px";
          b.style.animation = "none";
          line.className = "sw-fline";
          line.style.cssText = "left:" + hx + "px;top:" + hy + "px;height:" + len + "px;transform:rotate(" + -ang + "deg)";
          sea.appendChild(line);
          sfx("pew");
          var land = function () {
            splash(sea, fx, fy);
            if (line.parentNode) line.parentNode.removeChild(line);
            var flyDone = function () {
              if (b.parentNode) b.parentNode.removeChild(b);
              var bk = document.getElementById("swBk");
              if (bk) bk.textContent = "🐟 " + caught.length;
              cheer(sea);
              reveal();
            };
            if (b.animate) {
              try {
                var an = b.animate(
                  [{ transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 }, { transform: "translate(" + (hx - fx) * 0.5 + "px," + (hy - fy - 70) + "px) scale(1.2) rotate(-16deg)", opacity: 1, offset: 0.55 }, { transform: "translate(" + (hx - fx) + "px," + (hy - fy + 6) + "px) scale(.3) rotate(-30deg)", opacity: 0.1 }],
                  { duration: 760, easing: "ease-in-out", fill: "forwards" }
                );
                an.onfinish = flyDone;
                return;
              } catch (e) {}
            }
            flyDone();
          };
          if (line.animate) {
            try {
              var la = line.animate([{ transform: "rotate(" + -ang + "deg) scaleY(0)" }, { transform: "rotate(" + -ang + "deg) scaleY(1)" }], { duration: 220, easing: "ease-out", fill: "forwards" });
              la.onfinish = land;
            } catch (e) {
              land();
            }
          } else land();
          // the surprise: the caught fish pops up in the middle of the sea, with its name
          function reveal() {
            if (run !== my) return;
            var card = document.createElement("div");
            card.className = "sw-frev";
            card.innerHTML = '<div class="sw-frs">' + fishSvg(sp) + '</div><div class="sw-frn">' + esc(sp.name) + '</div><div class="sw-frr" style="background:' + RARCOL[sp.rar] + '">' + RARITY[sp.rar] + (isNew ? " · NEW!" : "") + "</div>";
            sea.appendChild(card);
            sfx(sp.rar >= 2 ? "big" : isNew ? "sparkle" : "cheer");
            setTimeout(function () {
              var tk = document.getElementById("swTank");
              if (run !== my || !tk) return;
              tank.push({ sp: sp, w: r.w });
              if (tank.length > TANKMAX) tank.shift();
              writeFishList(tank);
              tk.innerHTML = tankHtml(tank.length - 1);
              tk.classList.remove("sw-tglow");
              void tk.offsetWidth;
              tk.classList.add("sw-tglow");
            }, 500);
            try {
              if (hooks.burst && sp.rar >= 1) hooks.burst(root.innerWidth / 2, 220);
            } catch (e) {}
            tell("Caught! " + r.w, true);
            setTimeout(function () {
              i++;
              show();
            }, sp.rar >= 2 ? 2300 : 1700);
          }
        };
      });
      setTimeout(function () {
        if (run === my) play("w", r.w);
      }, 600);
    }
    my = run = { mode: "fishing", steps: [], i: 0, first: first, rnd: seeded(1) };
    my.stop = function () {
      my = null; // leaving the game: the pending next round does nothing
    };
    show();
  }
  // every fish found so far, and the ones still to find
  function showAquarium() {
    trk("sw_view", "aquarium", "", "screen");
    var found = readFish(),
      n = fishFound(found),
      h = '<div class="sw-top"><button class="sw-back" id="swClose">← Back</button></div><div class="sw-ttl"><span class="sw-aa">🐠</span><div><h1>My aquarium</h1><div class="sw-sub">' + n + " of " + SPECIES.length + ' fish found · catch fish in Word fishing</div></div></div><div class="sw-aq">';
    SPECIES.forEach(function (sp) {
      var have = found[sp.id] > 0;
      h += '<div class="sw-aqc' + (have ? "" : " sw-aqno") + '"><div class="sw-aqf">' + fishSvg(sp, !have) + '</div><div class="sw-aqn">' + (have ? esc(sp.name) : "???") + '</div><div class="sw-aqr" style="color:' + RARCOL[sp.rar] + '">' + RARITY[sp.rar] + (have ? " · ×" + found[sp.id] : "") + "</div></div>";
    });
    box.innerHTML = h + "</div>";
    document.getElementById("swClose").onclick = showHome;
  }

  /* ---- Whack-a-word: moles pop up holding words; hear a word and whack the right mole. Quick hands, combos, a golden bonus mole, a best score ---- */
  var MOLEKEY = "lef_mole_v1";
  function readMole() {
    var o = null;
    try {
      o = JSON.parse(ls.getItem(MOLEKEY));
    } catch (e) {}
    o = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    return { best: +o.best || 0, golden: +o.golden || 0, lvl: o.lvl === undefined ? 3.5 : Math.max(0, Math.min(8, +o.lvl || 0)) };
  }
  function writeMole(o) {
    try {
      ls.setItem(MOLEKEY, JSON.stringify(o));
    } catch (e) {}
  }
  // a mole popping out of its hole: gold = the bonus mole; hit = dizzy after a whack
  function moleSvg(gold, hit) {
    var fur = gold ? "#FFC400" : "#8B5E3C",
      head = gold ? "#FFD84A" : "#9C6B45",
      inner = '<ellipse cx="50" cy="66" rx="36" ry="30" fill="' + fur + '"/><circle cx="21" cy="30" r="10" fill="' + head + '"/><circle cx="79" cy="30" r="10" fill="' + head + '"/><circle cx="21" cy="30" r="5" fill="#F4A9A9"/><circle cx="79" cy="30" r="5" fill="#F4A9A9"/><ellipse cx="50" cy="44" rx="33" ry="29" fill="' + head + '"/>';
    if (hit) inner += '<path d="M31 35 l12 12 M43 35 l-12 12 M57 35 l12 12 M69 35 l-12 12" stroke="#1E2A4A" stroke-width="4" stroke-linecap="round"/><path d="M42 62 Q50 56 58 62" fill="none" stroke="#1E2A4A" stroke-width="3" stroke-linecap="round"/>';
    else inner += '<circle cx="38" cy="38" r="7" fill="#fff"/><circle cx="62" cy="38" r="7" fill="#fff"/><circle cx="39.5" cy="39" r="3.6" fill="#1E2A4A"/><circle cx="63.5" cy="39" r="3.6" fill="#1E2A4A"/><circle cx="41" cy="37" r="1.4" fill="#fff"/><circle cx="65" cy="37" r="1.4" fill="#fff"/><rect x="45" y="58" width="10" height="9" rx="2.5" fill="#fff" stroke="#C9B8A8" stroke-width="1.2"/>';
    inner += '<ellipse cx="50" cy="51" rx="9" ry="6" fill="#FF8FB1"/><ellipse cx="47" cy="49" rx="3" ry="1.8" fill="#fff" opacity=".6"/><circle cx="27" cy="54" r="5" fill="#FF8FB1" opacity=".45"/><circle cx="73" cy="54" r="5" fill="#FF8FB1" opacity=".45"/><ellipse cx="22" cy="86" rx="10" ry="6.5" fill="' + (gold ? "#E0A800" : "#7A4E2D") + '"/><ellipse cx="78" cy="86" rx="10" ry="6.5" fill="' + (gold ? "#E0A800" : "#7A4E2D") + '"/>';
    if (typeof root.softSvg === "function") inner = root.softSvg(inner);
    return '<svg viewBox="0 0 100 96" aria-hidden="true">' + inner + "</svg>";
  }
  // the bonus: a golden egg (not a mole, so it is never mistaken for the gold hint mole); cracked = after a whack
  function eggSvg(cracked) {
    var inner = '<path d="M50 14 C74 14 82 44 82 62 C82 82 68 92 50 92 C32 92 18 82 18 62 C18 44 26 14 50 14Z" fill="#FFC400"/><path d="M50 14 C74 14 82 44 82 62 C82 82 68 92 50 92 Z" fill="#E0A800" opacity=".35"/><ellipse cx="38" cy="38" rx="7" ry="13" fill="#fff" opacity=".6" transform="rotate(18 38 38)"/>';
    if (cracked) inner += '<path d="M24 56 L36 48 L44 60 L54 46 L64 58 L76 50" fill="none" stroke="#7A4E2D" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M16 22 l2.4 5 5.6 .7 -4.1 3.8 1 5.5 -4.9 -2.7 -4.9 2.7 1 -5.5 -4.1 -3.8 5.6 -.7z M84 30 l2 4 4.6 .6 -3.4 3.1 .8 4.5 -4 -2.2 -4 2.2 .8 -4.5 -3.4 -3.1 4.6 -.6z" fill="#FFE066" stroke="#E0A800" stroke-width="1.2"/>';
    else inner += '<path d="M30 52 l5 -7 5 7 5 -7 5 7 5 -7 5 7" fill="none" stroke="#FFF3B0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/><path d="M50 62 l3 6.5 7 .9 -5.2 4.8 1.4 7 -6.2 -3.5 -6.2 3.5 1.4 -7 -5.2 -4.8 7 -.9z" fill="#FFF3B0"/>';
    if (typeof root.softSvg === "function") inner = root.softSvg(inner);
    return '<svg viewBox="0 0 100 96" aria-hidden="true">' + inner + "</svg>";
  }
  var HAMMER = '<svg viewBox="0 0 70 70" aria-hidden="true"><rect x="32" y="26" width="8" height="42" rx="3" fill="#B87333" transform="rotate(20 36 47)"/><rect x="8" y="6" width="46" height="24" rx="7" fill="#8A97AD" stroke="#5A6B84" stroke-width="2.4" transform="rotate(20 31 18)"/></svg>';
  function startWhack(words) {
    gameTag = "game";
    trk("sw_game_start", "whack", "", "game");
    var pool = gamePool(learnedWords(readState()), words, firstLessonsWords(), 4),
      rounds = roundsFor(words, pool, seeded(Date.now() % 9973), 3),
      rnd = seeded((Date.now() % 7919) + 5),
      store = readMole(),
      lvl = store.lvl, // the speed level: it goes up after clean rounds and down after slips or missed moles, and is kept for the next game
      first = {},
      timers = [],
      i = 0,
      score = 0,
      combo = 0,
      bestCombo = 0,
      golden = 0,
      help = 0, // rounds with only one wrong mole after repeated slips
      lastWrong = false, // the round before had a slip
      spdNote = "",
      my = null;
    function later(fn, ms) {
      var t = setTimeout(function () {
        if (my && run === my) fn();
      }, ms);
      timers.push(t);
      return t;
    }
    function finish() {
      var best = Math.max(store.best, score),
        newBest = score > store.best;
      store.best = best;
      store.golden += golden;
      store.lvl = lvl;
      writeMole(store);
      var extra = '<div class="sw-fcount">' + (newBest ? "New best score! " : "Best score: " + best + ". ") + (golden ? "Golden eggs today: " + golden + ". " : "") + "Golden eggs found: " + store.golden + '</div><div class="sw-stage"><div class="sw-pet sw-pets ' + (newBest ? "sw-dance" : "sw-hop") + '">' + petArt(newBest ? "excited" : "happy") + "</div></div>";
      endGame("w", first, "Whack-a-word", function () {
        return score + " points!";
      }, function (r, t) {
        return r + " of " + t + " on the first try · best combo ×" + bestCombo;
      }, function () {
        startWhack(gameWords(readState(), 8));
      }, extra, null);
    }
    function show() {
      if (i >= rounds.length) {
        finish();
        return;
      }
      var r = rounds[i],
        k = wkey(r.w),
        tries = 0,
        laps = 0,
        busy = false,
        upTimer = null,
        mist = 0,
        popAt = 0,
        upMs = 5000,
        easy = help > 0,
        holes = "",
        n;
      if (help > 0) help--;
      for (n = 0; n < 6; n++) holes += '<div class="sw-hl" data-h="' + n + '"><div class="sw-hole"></div><div class="sw-mclip"><button class="sw-mole" tabindex="-1"></button></div><div class="sw-dirt"></div></div>';
      box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Whack-a-word · ' + (i + 1) + " / " + rounds.length + "</span></div>" +
        '<div class="sw-card"><div class="sw-kind">Whack-a-word</div><div class="sw-sent" style="font-size:22px">Whack the mole with the word you hear!</div>' +
        '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><div class="sw-mhud"><div class="sw-fpet sw-mpet" id="swMpet">' + petArt("happy") + '</div><span class="sw-msc" id="swMsc">Score ' + score + '</span><span class="sw-mcb" id="swMcb"></span><span class="sw-spd" id="swSpd"></span></div><div class="sw-field" id="swField">' + holes + '</div><div class="sw-msg" id="swMsg"></div></div>';
      bindQuit();
      var field = document.getElementById("swField");
      function hud() {
        var a = document.getElementById("swMsc"),
          b = document.getElementById("swMcb");
        if (a) a.textContent = "Score " + score;
        if (b) b.textContent = combo >= 2 ? "Combo ×" + combo + " 🔥" : "";
        var sp = document.getElementById("swSpd"),
          dots = 1 + Math.round(lvl / 2);
        if (sp) sp.textContent = "Speed " + new Array(dots + 1).join("●") + new Array(6 - dots).join("○") + spdNote;
        field.style.setProperty("--mt", Math.max(0.12, 0.22 - lvl * 0.012) + "s");
      }
      function hole(h) {
        return field.children[h];
      }
      function down(list, then) {
        list.forEach(function (h) {
          hole(h).querySelector(".sw-mole").classList.remove("sw-up");
        });
        if (then) later(then, 320);
      }
      function say(text) {
        var m = document.getElementById("swMsg");
        if (m) {
          m.textContent = text;
          m.className = "sw-msg";
        }
      }
      // the speed changed: a little turtle or rabbit beside the speed dots for a moment
      function pace(up) {
        spdNote = up ? " 🐇" : " 🐢";
        later(function () {
          spdNote = "";
          hud();
        }, 1800);
      }
      function hammer(h) {
        var hm = document.createElement("div");
        hm.className = "sw-hmr";
        hm.innerHTML = HAMMER;
        hole(h).appendChild(hm);
        if (hm.animate) {
          try {
            hm.animate([{ transform: "translateX(-50%) rotate(-70deg)", opacity: 1 }, { transform: "translateX(-50%) rotate(14deg) translateY(20px)", opacity: 1, offset: 0.45 }, { transform: "translateX(-50%) rotate(14deg) translateY(20px)", opacity: 0 }], { duration: 480, easing: "ease-out", fill: "forwards" });
          } catch (e) {}
        }
        setTimeout(function () {
          if (hm.parentNode) hm.parentNode.removeChild(hm);
        }, 520);
      }
      // the hint: the right mole turns gold and blinks
      function goldHint(m) {
        var w = m.getAttribute("data-w") || "";
        m.innerHTML = moleSvg(true, false) + '<span class="sw-mw" style="font-size:' + (w.length > 8 ? 12 : w.length > 6 ? 14 : 17) + 'px">' + esc(w) + "</span>";
        m.classList.add("sw-hint");
      }
      function sparks(h, txt) {
        var c = hole(h),
          t = document.createElement("div");
        t.className = "sw-bonk";
        t.textContent = txt;
        c.appendChild(t);
        if (t.animate) {
          try {
            t.animate([{ transform: "translate(-50%,0) scale(.4)", opacity: 0 }, { transform: "translate(-50%,-14px) scale(1.15)", opacity: 1, offset: 0.3 }, { transform: "translate(-50%,-34px) scale(1)", opacity: 0 }], { duration: 900, easing: "ease-out", fill: "forwards" });
          } catch (e) {}
        }
        setTimeout(function () {
          if (t.parentNode) t.parentNode.removeChild(t);
        }, 960);
      }
      function wiggle() {
        var pe = document.getElementById("swMpet");
        if (!pe) return;
        pe.innerHTML = petArt("excited");
        pe.classList.remove("sw-fwig");
        void pe.offsetWidth;
        pe.classList.add("sw-fwig");
        later(function () {
          var p2 = document.getElementById("swMpet");
          if (p2) {
            p2.classList.remove("sw-fwig");
            p2.innerHTML = petArt("happy");
          }
        }, 1200);
      }
      var shown = [];
      function pop() {
        if (busy) return;
        var order = shuffle([0, 1, 2, 3, 4, 5], rnd),
          others = r.opts.filter(function (w) {
            return wkey(w) !== k;
          }).slice(0, easy ? 1 : 2),
          ws = shuffle([r.w].concat(others), rnd),
          gold = rnd() < 0.3,
          up = 7200 - lvl * 550,
          stag = Math.max(70, 160 - lvl * 12);
        upMs = up;
        popAt = Date.now() + 120 + 2 * stag;
        shown = [];
        ws.forEach(function (w, j) {
          var h = order[j],
            m = hole(h).querySelector(".sw-mole");
          m.className = "sw-mole";
          m.setAttribute("data-w", w);
          m.removeAttribute("data-g");
          m.innerHTML = moleSvg(false, false) + '<span class="sw-mw" style="font-size:' + (w.length > 8 ? 12 : w.length > 6 ? 14 : 17) + 'px">' + esc(w) + "</span>";
          if (tries >= 2 && wkey(w) === k) goldHint(m);
          shown.push(h);
          later(function () {
            m.classList.add("sw-up");
          }, 120 + j * stag);
        });
        if (gold) {
          var gm = hole(order[3]).querySelector(".sw-mole");
          gm.className = "sw-mole";
          gm.setAttribute("data-g", "1");
          gm.removeAttribute("data-w");
          gm.innerHTML = eggSvg(false) + '<span class="sw-mw sw-mg">★ +25</span>';
          later(function () {
            gm.classList.add("sw-up");
          }, 700);
          later(function () {
            gm.classList.remove("sw-up");
          }, 3000);
        }
        later(function () {
          play("w", r.w);
        }, 380);
        upTimer = later(function () {
          if (busy) return;
          laps++;
          combo = 0;
          mist++;
          lvl = Math.max(0, lvl - 0.8);
          pace(false);
          hud();
          say("Too slow! Slowing down a little. Listen again.");
          Array.prototype.forEach.call(field.querySelectorAll(".sw-mole"), function (mm) {
            mm.classList.remove("sw-up");
          });
          if (laps >= 2) tries = Math.max(tries, 2);
          later(pop, 700);
        }, 120 + up);
      }
      document.getElementById("swHear").onclick = function () {
        play("w", r.w);
      };
      field.onclick = function (e) {
        var el = e.target;
        while (el && el !== field && !(el.classList && el.classList.contains("sw-mole"))) el = el.parentNode;
        if (!el || el === field || busy || !el.classList.contains("sw-up")) return;
        var hl = el.parentNode.parentNode,
          h = +hl.getAttribute("data-h");
        hammer(h);
        if (el.getAttribute("data-g")) {
          el.innerHTML = eggSvg(true) + '<span class="sw-mw sw-mg">★ +25</span>';
          el.setAttribute("data-g", "");
          later(function () {
            el.classList.remove("sw-up");
          }, 380);
          score += 25;
          golden++;
          hud();
          sfx("sparkle");
          sparks(h, "+25 ★");
          try {
            var gr = hl.getBoundingClientRect();
            if (hooks.burst) hooks.burst(gr.left + gr.width / 2, gr.top + gr.height / 3);
          } catch (e2) {}
          return;
        }
        var right = wkey(el.getAttribute("data-w")) === k;
        if (first[k] === undefined) first[k] = right;
        else if (!right) first[k] = false;
        if (!right) {
          el.classList.add("sw-oops");
          sfx("poke");
          combo = 0;
          mist++;
          lvl = Math.max(0, lvl - 0.6);
          if (tries + 1 >= 2 || lastWrong) help = 2; // wrong twice in a round, or in two rounds in a row: the next rounds have fewer wrong moles
          later(function () {
            play("w", r.w); // the word is read again
          }, 700);
          pace(false);
          hud();
          tries++;
          say("Not that one! Listen again.");
          later(function () {
            el.classList.remove("sw-oops");
          }, 450);
          if (tries >= 2)
            Array.prototype.forEach.call(field.querySelectorAll(".sw-mole"), function (mm) {
              if (wkey(mm.getAttribute("data-w") || "") === k) goldHint(mm);
            });
          return;
        }
        busy = true;
        clearTimeout(upTimer);
        lastWrong = mist > 0;
        if (mist === 0) {
          lvl = Math.min(8, lvl + 0.7 + (Date.now() - popAt < upMs * 0.35 ? 0.4 : 0)); // a clean, quick whack: a little faster next time
          pace(true);
        }
        combo++;
        if (combo > bestCombo) bestCombo = combo;
        var pts = 10 + Math.min(combo, 6) * 3;
        score += pts;
        el.innerHTML = moleSvg(false, true) + '<span class="sw-mw">' + esc(r.w) + "</span>";
        el.classList.add("sw-hit");
        sfx("bang");
        sparks(h, "BONK! +" + pts);
        hud();
        wiggle();
        say(combo >= 3 ? "Combo ×" + combo + "! " + r.w : "Bonk! " + r.w);
        try {
          var br = hl.getBoundingClientRect();
          if (hooks.burst && combo >= 3) hooks.burst(br.left + br.width / 2, br.top + br.height / 3);
        } catch (e3) {}
        later(function () {
          Array.prototype.forEach.call(field.querySelectorAll(".sw-mole"), function (mm) {
            mm.classList.remove("sw-up");
          });
        }, 800);
        later(function () {
          i++;
          show();
        }, Math.max(800, 1300 - lvl * 60));
      };
      hud();
      pop();
    }
    my = run = { mode: "whack", steps: [], i: 0, first: first, rnd: seeded(1) };
    my.stop = function () {
      timers.forEach(clearTimeout);
      my = null;
    };
    show();
  }

  /* ---- Word snake: a snake on a grid; hear a word and eat the apple that carries it. A wrong apple makes the snake shorter, it never ends in a crash;
     the speed follows the child's accuracy. Arrow keys, swipes or the on-screen arrows ---- */
  var SNAKEKEY = "lef_snake_v1";
  function readSnake() {
    var o = null;
    try {
      o = JSON.parse(ls.getItem(SNAKEKEY));
    } catch (e) {}
    o = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    return { best: +o.best || 0, len: +o.len || 0, lvl: o.lvl === undefined ? 1 : Math.max(0, Math.min(8, +o.lvl || 0)) };
  }
  function writeSnake(o) {
    try {
      ls.setItem(SNAKEKEY, JSON.stringify(o));
    } catch (e) {}
  }
  function startSnake(words) {
    gameTag = "game";
    trk("sw_game_start", "snake", "", "game");
    var COLS = 12,
      ROWS = 12,
      pool = gamePool(learnedWords(readState()), words, firstLessonsWords(), 4),
      rounds = roundsFor(words, pool, seeded(Date.now() % 9973), 3),
      rnd = seeded((Date.now() % 6151) + 11),
      store = readSnake(),
      lvl = store.lvl,
      first = {},
      i = 0,
      score = 0,
      combo = 0,
      bestCombo = 0,
      mist = 0,
      wrongTries = 0,
      snake = [],
      dir = { x: 1, y: 0 },
      nextDir = null,
      started = false,
      done = false,
      apples = [],
      target = null,
      fx = [],
      my = null,
      help = 0, // rounds with only one wrong apple: after repeated slips the next rounds are easier
      lastWrong = false, // the round before had a wrong apple
      spdNote = "",
      tick = null,
      raf = null,
      keyH = null,
      cv = null,
      ctx = null,
      size = 300,
      cell = 25,
      note = "";
    function alive() {
      return !!my && run === my && !done;
    }
    function wrap(v, n) {
      return (v + n) % n;
    }
    function cdist(a, b) {
      var dx = Math.abs(a.x - b.x),
        dy = Math.abs(a.y - b.y);
      return Math.min(dx, COLS - dx) + Math.min(dy, ROWS - dy);
    }
    function onSnake(x, y) {
      return snake.some(function (c) {
        return c.x === x && c.y === y;
      });
    }
    function layApples(ws) {
      apples = [];
      ws.forEach(function (w) {
        var t = 0,
          c;
        do {
          c = { x: Math.floor(rnd() * COLS), y: Math.floor(rnd() * ROWS) };
          t++;
        } while (
          t < 300 &&
          (onSnake(c.x, c.y) ||
            cdist(c, snake[0]) < 4 ||
            apples.some(function (a) {
              return cdist(a, c) < 4;
            }))
        );
        apples.push({ x: c.x, y: c.y, w: w });
      });
    }
    function newRound() {
      if (!alive()) return;
      var r = rounds[i];
      target = r;
      mist = 0;
      wrongTries = 0;
      var others = r.opts
        .filter(function (w) {
          return wkey(w) !== wkey(r.w);
        })
        .slice(0, help > 0 ? 1 : 2);
      if (help > 0) help--;
      layApples(shuffle([r.w].concat(others), rnd));
      note = "";
      var ms = document.getElementById("swMsg");
      if (ms) ms.textContent = "";
      setTimeout(function () {
        if (alive()) play("w", r.w);
      }, 300);
    }
    function hud() {
      var a = document.getElementById("swSc"),
        b = document.getElementById("swLen"),
        c = document.getElementById("swSpd"),
        d = document.getElementById("swCmb"),
        dots = 1 + Math.round(lvl / 2);
      if (a) a.textContent = "Score " + score;
      if (b) b.textContent = "Length " + (snake.length || 3);
      if (c) c.textContent = "Speed " + new Array(dots + 1).join("●") + new Array(6 - dots).join("○") + spdNote;
      if (d) d.textContent = combo >= 2 ? "Combo ×" + combo + " 🔥" : "";
    }
    function say(t) {
      var m = document.getElementById("swMsg");
      if (m) m.textContent = t;
    }
    // the speed changed: a little turtle or rabbit beside the speed dots for a moment
    function pace(up) {
      spdNote = up ? " 🐇" : " 🐢";
      setTimeout(function () {
        spdNote = "";
        if (alive()) hud();
      }, 1800);
    }
    function pop(x, y, text, color) {
      fx.push({ x: x, y: y, t: Date.now(), text: text, c: color });
    }
    function cleanup() {
      done = true;
      clearTimeout(tick);
      if (raf && root.cancelAnimationFrame) root.cancelAnimationFrame(raf);
      if (keyH) document.removeEventListener("keydown", keyH);
      keyH = null;
    }
    function finish() {
      cleanup();
      var newBest = score > store.best,
        len = snake.length;
      store.best = Math.max(store.best, score);
      store.len = Math.max(store.len, len);
      store.lvl = lvl;
      writeSnake(store);
      var extra = '<div class="sw-fcount">' + (newBest ? "New best score! " : "Best score: " + store.best + ". ") + "Longest snake: " + store.len + '</div><div class="sw-stage"><div class="sw-pet sw-pets ' + (newBest ? "sw-dance" : "sw-hop") + '">' + petArt(newBest ? "excited" : "happy") + "</div></div>";
      endGame("n", first, "Word snake", function () {
        return score + " points!";
      }, function (r, t) {
        return r + " of " + t + " on the first try · snake length " + len;
      }, function () {
        startSnake(gameWords(readState(), 6));
      }, extra, null);
    }
    function setDir(dx, dy) {
      if (!alive()) return;
      if (!started) {
        // the first arrow starts the snake: its body is laid out straight behind the head
        var cx = Math.floor(COLS / 2),
          cy = Math.floor(ROWS / 2);
        dir = { x: dx, y: dy };
        snake = [0, 1, 2].map(function (k) {
          return { x: wrap(cx - dx * k, COLS), y: wrap(cy - dy * k, ROWS) };
        });
        started = true;
        newRound();
        hud();
        return;
      }
      if (dx === -dir.x && dy === -dir.y) return; // no turning back on itself
      nextDir = { x: dx, y: dy };
    }
    function eat(ap) {
      var right = wkey(ap.w) === wkey(target.w),
        k = wkey(target.w);
      apples.splice(apples.indexOf(ap), 1);
      if (right) {
        if (first[k] === undefined) first[k] = true;
        lastWrong = mist > 0;
        if (mist === 0) {
          lvl = Math.min(8, lvl + 0.6); // a clean apple: faster
          pace(true);
        }
        combo++;
        if (combo > bestCombo) bestCombo = combo;
        var pts = 10 + Math.min(combo, 6) * 3;
        score += pts;
        apples = [];
        pop(ap.x, ap.y, "+" + pts, "#FFD23F");
        sfx("sparkle");
        say((combo >= 3 ? "Combo ×" + combo + "! " : "Yum! ") + target.w + (mist === 0 && combo >= 2 ? " · Faster!" : ""));
        try {
          if (hooks.burst && combo >= 3) {
            var br = cv.getBoundingClientRect();
            hooks.burst(br.left + (ap.x + 0.5) * cell, br.top + (ap.y + 0.5) * cell);
          }
        } catch (e) {}
        i++;
        if (i >= rounds.length) {
          done = true;
          clearTimeout(tick);
          setTimeout(function () {
            if (my && run === my) finish();
          }, 900);
        } else
          setTimeout(newRound, 800);
      } else {
        first[k] = false;
        mist++;
        wrongTries++;
        lvl = Math.max(0, lvl - 0.8); // a wrong apple: a little slower
        if (wrongTries >= 2 || lastWrong) help = 2; // wrong twice in a round, or in two rounds in a row: the next rounds have fewer wrong apples
        pace(false);
        setTimeout(function () {
          if (alive() && target) play("w", target.w); // the word is read again
        }, 700);
        combo = 0;
        snake.pop();
        if (snake.length > 3) snake.pop(); // a wrong apple: the snake gets one shorter
        pop(ap.x, ap.y, "oops", "#FF6B4A");
        sfx("poke");
        say("Not that one! Listen again. Slowing down a little.");
      }
      hud();
    }
    function step() {
      tick = null;
      if (!alive()) return;
      if (started) {
        if (nextDir) {
          dir = nextDir;
          nextDir = null;
        }
        var hx = wrap(snake[0].x + dir.x, COLS),
          hy = wrap(snake[0].y + dir.y, ROWS),
          blocked = snake.slice(0, -1).some(function (c) {
            return c.x === hx && c.y === hy;
          });
        if (blocked) {
          if (note !== "bump") {
            note = "bump";
            mist++;
            lvl = Math.max(0, lvl - 0.5); // running into its own tail: a control slip, so slower
            pace(false);
            hud();
            say("Careful, your tail! Turn another way.");
          }
        } else {
          note = "";
          snake.unshift({ x: hx, y: hy });
          var ap = apples.filter(function (a) {
            return a.x === hx && a.y === hy;
          })[0];
          if (ap) eat(ap); // a right apple: the tail stays, the snake is one longer
          else snake.pop();
        }
      }
      if (alive()) tick = setTimeout(step, Math.round(720 * Math.pow(0.9, lvl))); // each level is 10% faster: 0.72 s a step at level 0, 0.31 s at level 8
    }
    function pill(text, x, y) {
      var fs = Math.max(12, Math.round(cell * 0.56));
      ctx.font = "700 " + fs + "px Fredoka, sans-serif";
      var w = ctx.measureText(text).width + 12,
        h = fs + 6,
        px = Math.max(2, Math.min(size - w - 2, x - w / 2)),
        py = y - h / 2;
      ctx.fillStyle = "rgba(255,255,255,.95)";
      ctx.strokeStyle = "rgba(30,42,74,.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(px, py, w, h, h / 2);
      else ctx.rect(px, py, w, h);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1E2A4A";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, px + w / 2, py + h / 2 + 1);
    }
    function draw(ts) {
      if (!cv || done) return;
      var x,
        y;
      ctx.clearRect(0, 0, size, size);
      for (y = 0; y < ROWS; y++) for (x = 0; x < COLS; x++) {
        ctx.fillStyle = (x + y) % 2 ? "#B6E89A" : "#A6DE87";
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
      apples.forEach(function (a) {
        var cx = (a.x + 0.5) * cell,
          cy = (a.y + 0.5) * cell;
        var hint = wrongTries >= 2 && target && wkey(a.w) === wkey(target.w),
          blink = hint && Math.sin(ts / 120) > 0, // the hint: the apple turns gold and blinks between gold and bright yellow, with a glow and little stars
          pulse = hint ? 1 + 0.12 * Math.sin(ts / 120) : 1;
        if (hint) {
          var gl = ctx.createRadialGradient(cx, cy, cell * 0.2, cx, cy, cell * 1.3);
          gl.addColorStop(0, blink ? "rgba(255,240,120,.95)" : "rgba(255,214,64,.55)");
          gl.addColorStop(1, "rgba(255,214,64,0)");
          ctx.fillStyle = gl;
          ctx.beginPath();
          ctx.arc(cx, cy, cell * 1.3, 0, 6.283);
          ctx.fill();
        }
        ctx.fillStyle = hint ? (blink ? "#FFF08A" : "#FFC400") : "#E5483A";
        ctx.beginPath();
        ctx.arc(cx, cy + 1, cell * (hint ? 0.46 : 0.4) * pulse, 0, 6.283);
        ctx.fill();
        if (hint) {
          ctx.strokeStyle = "#E0A800";
          ctx.lineWidth = 2.5;
          ctx.stroke();
          for (var q = 0; q < 4; q++) {
            var ang = ts / 400 + (q * Math.PI) / 2,
              rr = cell * (0.75 + 0.1 * Math.sin(ts / 150 + q));
            ctx.fillStyle = blink ? "#FFFFFF" : "#FFE066";
            ctx.beginPath();
            ctx.arc(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, cell * 0.09, 0, 6.283);
            ctx.fill();
          }
        }
        ctx.fillStyle = "rgba(255,255,255,.55)";
        ctx.beginPath();
        ctx.ellipse(cx - cell * 0.14, cy - cell * 0.1, cell * 0.09, cell * 0.14, -0.5, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = "#35B779";
        ctx.beginPath();
        ctx.ellipse(cx + cell * 0.12, cy - cell * 0.42, cell * 0.16, cell * 0.08, -0.6, 0, 6.283);
        ctx.fill();
      });
      var sn = snake.length ? snake : [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }, { x: Math.floor(COLS / 2) - 1, y: Math.floor(ROWS / 2) }, { x: Math.floor(COLS / 2) - 2, y: Math.floor(ROWS / 2) }];
      for (var k = sn.length - 1; k >= 0; k--) {
        var s0 = sn[k],
          inset = k === 0 ? 0.02 : 0.08;
        ctx.fillStyle = k === 0 ? "#2E9E5B" : k % 2 ? "#4CD08A" : "#3DBE78";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(s0.x * cell + cell * inset, s0.y * cell + cell * inset, cell * (1 - inset * 2), cell * (1 - inset * 2), cell * 0.32);
        else ctx.rect(s0.x * cell + cell * inset, s0.y * cell + cell * inset, cell * (1 - inset * 2), cell * (1 - inset * 2));
        ctx.fill();
      }
      var hd = sn[0],
        hx0 = (hd.x + 0.5) * cell,
        hy0 = (hd.y + 0.5) * cell,
        px = -dir.y,
        py = dir.x;
      [-1, 1].forEach(function (sd) {
        var ex = hx0 + dir.x * cell * 0.14 + px * sd * cell * 0.22,
          ey = hy0 + dir.y * cell * 0.14 + py * sd * cell * 0.22;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(ex, ey, cell * 0.15, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = "#1E2A4A";
        ctx.beginPath();
        ctx.arc(ex + dir.x * cell * 0.04, ey + dir.y * cell * 0.04, cell * 0.075, 0, 6.283);
        ctx.fill();
      });
      apples.forEach(function (a) {
        var below = a.y === 0;
        pill(a.w, (a.x + 0.5) * cell, below ? (a.y + 1.35) * cell : (a.y - 0.3) * cell);
      });
      var now = Date.now();
      fx = fx.filter(function (f) {
        return now - f.t < 900;
      });
      fx.forEach(function (f) {
        var a = (now - f.t) / 900;
        ctx.globalAlpha = 1 - a;
        ctx.fillStyle = f.c;
        ctx.font = "700 " + Math.round(cell * 0.8) + "px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.strokeStyle = "rgba(30,42,74,.6)";
        ctx.lineWidth = 3;
        ctx.strokeText(f.text, (f.x + 0.5) * cell, (f.y - 0.2) * cell - a * cell * 1.2);
        ctx.fillText(f.text, (f.x + 0.5) * cell, (f.y - 0.2) * cell - a * cell * 1.2);
        ctx.globalAlpha = 1;
      });
      if (!started) {
        ctx.fillStyle = "rgba(30,42,74,.62)";
        ctx.fillRect(0, size / 2 - cell * 1.6, size, cell * 3.2);
        ctx.fillStyle = "#fff";
        ctx.font = "700 " + Math.round(cell * 0.78) + "px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Press an arrow or swipe to start!", size / 2, size / 2);
      }
      raf = root.requestAnimationFrame ? root.requestAnimationFrame(draw) : null;
    }
    box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Word snake</span></div>' +
      '<div class="sw-card"><div class="sw-kind">Word snake</div><div class="sw-sent" style="font-size:22px">Eat the apple with the word you hear!</div>' +
      '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><div class="sw-mhud"><span class="sw-msc" id="swSc"></span><span class="sw-msc" id="swLen"></span><span class="sw-mcb" id="swCmb"></span><span class="sw-spd" id="swSpd"></span></div>' +
      '<canvas class="sw-snk" id="swSnk"></canvas><div class="sw-dpad"><i></i><button class="sw-dp" data-d="0,-1" aria-label="Up">▲</button><i></i><button class="sw-dp" data-d="-1,0" aria-label="Left">◀</button><button class="sw-dp" data-d="0,1" aria-label="Down">▼</button><button class="sw-dp" data-d="1,0" aria-label="Right">▶</button></div><div class="sw-msg" id="swMsg"></div></div>';
    bindQuit();
    cv = document.getElementById("swSnk");
    size = Math.max(240, Math.min(420, Math.floor((cv.parentNode.clientWidth || 340) - 56)));
    cell = Math.floor(size / COLS);
    size = cell * COLS;
    var dpr = root.devicePixelRatio || 1;
    cv.style.width = size + "px";
    cv.style.height = size + "px";
    cv.width = Math.round(size * dpr);
    cv.height = Math.round(size * dpr);
    ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    document.getElementById("swHear").onclick = function () {
      if (target) play("w", target.w);
      else say("Press an arrow to start, then listen!");
    };
    Array.prototype.forEach.call(box.querySelectorAll(".sw-dp"), function (b) {
      b.onclick = function () {
        var d = b.getAttribute("data-d").split(",");
        setDir(+d[0], +d[1]);
      };
    });
    keyH = function (e) {
      var m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }[e.key];
      if (m) {
        e.preventDefault();
        setDir(m[0], m[1]);
      }
    };
    document.addEventListener("keydown", keyH);
    var sx = null,
      sy = null;
    cv.addEventListener("pointerdown", function (e) {
      sx = e.clientX;
      sy = e.clientY;
    });
    cv.addEventListener("pointermove", function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx,
        dy = e.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 22) {
        if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
        else setDir(0, dy > 0 ? 1 : -1);
        sx = e.clientX;
        sy = e.clientY;
      }
    });
    cv.addEventListener("pointerup", function () {
      sx = null;
    });
    cv.addEventListener("pointercancel", function () {
      sx = null;
    });
    my = run = { mode: "snake", steps: [], i: 0, first: first, rnd: seeded(1) };
    my.stop = function () {
      cleanup();
      my = null;
    };
    hud();
    tick = setTimeout(step, 600);
    draw(Date.now());
  }

  /* ---- Word racer: a race car drives straight ahead down a road with three lanes (seen from behind); hear a word and drive through the gate whose sign
     has it. Coins in the lanes, a wrong gate = a bump. The speed follows the child's accuracy. Arrow keys, swipes, taps on the sides or the two buttons ---- */
  var RUNKEY = "lef_runner_v1";
  function readRunner() {
    var o = null;
    try {
      o = JSON.parse(ls.getItem(RUNKEY));
    } catch (e) {}
    o = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    return { best: +o.best || 0, coins: +o.coins || 0, lvl: o.lvl === undefined ? 1 : Math.max(0, Math.min(8, +o.lvl || 0)) };
  }
  function writeRunner(o) {
    try {
      ls.setItem(RUNKEY, JSON.stringify(o));
    } catch (e) {}
  }
  function startRunner(words) {
    gameTag = "game";
    trk("sw_game_start", "runner", "", "game");
    var pool = gamePool(learnedWords(readState()), words, firstLessonsWords(), 4),
      rounds = roundsFor(words, pool, seeded(Date.now() % 9973), 3),
      rnd = seeded((Date.now() % 5003) + 17),
      store = readRunner(),
      lvl = store.lvl,
      first = {},
      i = 0,
      score = 0,
      coinN = 0,
      combo = 0,
      bestCombo = 0,
      tries = 0,
      lastWrong = false,
      help = 0,
      spdNote = "",
      lane = 1,
      started = false,
      done = false,
      gate = null,
      coins = [],
      wait = 0, // seconds until the next gate
      scroll = 0,
      t0 = 0,
      last = 0,
      my = null,
      raf = null,
      keyH = null,
      cv = null,
      ctx = null,
      carX = 0,
      boostUntil = 0,
      shakeUntil = 0,
      puffs = [],
      puffAt = 0,
      W = 340,
      H = 400,
      HOR = 110,
      PL = 330,
      note = "";
    function alive() {
      return !!my && run === my && !done;
    }
    function speedT() {
      return 7.5 * Math.pow(0.92, lvl); // seconds for a gate to run from the horizon to the pet
    }
    function Y(p) {
      return HOR + (PL - HOR) * Math.pow(Math.max(p, 0), 1.6);
    }
    function frac(p) {
      return (Y(p) - HOR) / (H - HOR);
    }
    function roadW(f) {
      return W * 0.24 + W * 0.72 * f;
    }
    function X(p, ln) {
      return W / 2 + (ln - 1) * (roadW(frac(p)) / 3);
    }
    function say(t) {
      var m = document.getElementById("swMsg");
      if (m) m.textContent = t;
    }
    function hud() {
      var a = document.getElementById("swRsc"),
        b = document.getElementById("swRco"),
        c = document.getElementById("swRsp"),
        d = document.getElementById("swRcb"),
        dots = 1 + Math.round(lvl / 2);
      if (a) a.textContent = "Score " + score;
      if (b) b.textContent = "🪙 " + coinN;
      if (d) d.textContent = combo >= 2 ? "Combo ×" + combo + " 🔥" : "";
      if (c) c.textContent = "Speed " + new Array(dots + 1).join("●") + new Array(6 - dots).join("○") + spdNote;
    }
    function pace(up) {
      spdNote = up ? " 🐇" : " 🐢";
      setTimeout(function () {
        spdNote = "";
        if (alive()) hud();
      }, 1800);
    }
    function cleanup() {
      done = true;
      if (raf && root.cancelAnimationFrame) root.cancelAnimationFrame(raf);
      if (keyH) document.removeEventListener("keydown", keyH);
      keyH = null;
    }
    function finish() {
      cleanup();
      var newBest = score > store.best;
      store.best = Math.max(store.best, score);
      store.coins += coinN;
      store.lvl = lvl;
      writeRunner(store);
      var extra = '<div class="sw-fcount">' + (newBest ? "New best score! " : "Best score: " + store.best + ". ") + "Coins today: " + coinN + ". Coins in all: " + store.coins + '</div><div class="sw-stage"><div class="sw-pet sw-pets ' + (newBest ? "sw-dance" : "sw-hop") + '">' + petArt(newBest ? "excited" : "happy") + "</div></div>";
      endGame("r", first, "Word racer", function () {
        return score + " points!";
      }, function (r, t) {
        return r + " of " + t + " on the first try · best combo ×" + bestCombo;
      }, function () {
        startRunner(gameWords(readState(), 6));
      }, extra, null);
    }
    function newGate() {
      var r = rounds[i],
        k = wkey(r.w),
        others = r.opts
          .filter(function (w) {
            return wkey(w) !== k;
          })
          .slice(0, help > 0 ? 1 : 2),
        lanes = shuffle([0, 1, 2], rnd),
        signs = [{ w: r.w, lane: lanes[0], target: true }];
      if (help > 0) help--;
      others.forEach(function (w, j) {
        signs.push({ w: w, lane: lanes[j + 1], target: false });
      });
      gate = { p: 0, signs: signs, r: r, k: k };
      // a short row of coins after the gate, in a lane of its own
      var cl = Math.floor(rnd() * 3);
      for (var c = 0; c < 4; c++) coins.push({ p: -0.5 - c * 0.07, lane: cl, got: false });
      setTimeout(function () {
        if (alive() && gate && gate.r === r) play("w", r.w);
      }, 350);
    }
    function setLane(n) {
      if (!alive()) return;
      if (!started) {
        started = true;
        wait = 0.4;
        last = Date.now();
      }
      lane = Math.max(0, Math.min(2, n));
    }
    function resolve() {
      var g = gate,
        ok = g.signs.some(function (sg) {
          return sg.target && sg.lane === lane;
        }),
        k = g.k;
      gate = null;
      if (ok) {
        if (first[k] === undefined) first[k] = true;
        lastWrong = tries > 0;
        if (tries === 0) {
          lvl = Math.min(8, lvl + 0.6);
          pace(true);
        }
        combo++;
        if (combo > bestCombo) bestCombo = combo;
        var pts = 10 + Math.min(combo, 6) * 3;
        score += pts;
        sfx("sparkle");
        say((combo >= 3 ? "Combo ×" + combo + "! " : "Yes! ") + g.r.w + (tries === 0 && combo >= 2 ? " · Faster!" : ""));
        boostUntil = Date.now() + 1300;
        try {
          if (hooks.burst && combo >= 3) {
            var br = cv.getBoundingClientRect();
            hooks.burst(br.left + X(1, lane), br.top + PL - 30);
          }
        } catch (e) {}
        tries = 0;
        i++;
        if (i >= rounds.length) {
          done = true;
          setTimeout(function () {
            if (my && run === my) finish();
          }, 1000);
          return;
        }
        wait = 1.1;
      } else {
        first[k] = false;
        tries++;
        combo = 0;
        lvl = Math.max(0, lvl - 0.8);
        if (tries >= 2 || lastWrong) help = 2;
        pace(false);
        sfx("poke");
        stumble();
        say("Oops, not that gate! Listen again. Slowing down a little.");
        wait = 1.3; // the same word comes back
        setTimeout(function () {
          if (alive()) play("w", g.r.w);
        }, 800);
      }
      hud();
    }
    // a bump: the car shakes and a cloud of smoke comes up
    function stumble() {
      shakeUntil = Date.now() + 700;
      for (var q = 0; q < 7; q++) puffs.push({ x: carX - 24 + q * 8, y: PL - 20, vx: (q - 3) * 14, vy: 18 + q * 3, t: Date.now(), r: 7, c: "235,240,250" });
    }
    // the car, seen from behind (u = its size; the road narrows with distance, but the car stays at the front)
    function drawCar(now) {
      var u = W * 0.085,
        sh = now < shakeUntil ? Math.sin(now / 25) * 3 : 0,
        bob = started ? Math.sin(scroll * 160) * 1.4 : 0,
        cx = carX + sh,
        gy = PL + bob,
        k;
      ctx.fillStyle = "rgba(20,25,50,.3)";
      ctx.beginPath();
      ctx.ellipse(cx, PL + 3, u * 1.55, u * 0.3, 0, 0, 6.283);
      ctx.fill();
      // flames when boosted
      if (now < boostUntil) {
        var fl = 0.7 + 0.3 * Math.sin(now / 40);
        [-0.55, 0.55].forEach(function (ex) {
          ctx.fillStyle = "#FF8A1F";
          ctx.beginPath();
          ctx.moveTo(cx + ex * u - u * 0.2, gy - u * 0.2);
          ctx.lineTo(cx + ex * u, gy + u * 1.3 * fl);
          ctx.lineTo(cx + ex * u + u * 0.2, gy - u * 0.2);
          ctx.fill();
          ctx.fillStyle = "#FFE066";
          ctx.beginPath();
          ctx.moveTo(cx + ex * u - u * 0.1, gy - u * 0.2);
          ctx.lineTo(cx + ex * u, gy + u * 0.7 * fl);
          ctx.lineTo(cx + ex * u + u * 0.1, gy - u * 0.2);
          ctx.fill();
        });
      }
      // wheels with tread that runs
      [-1, 1].forEach(function (sd) {
        var wx = cx + sd * u * 1.2,
          wy = gy - u * 0.8;
        ctx.fillStyle = "#2B3347";
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(wx - u * 0.26, wy, u * 0.52, u * 0.8, u * 0.12);
          ctx.fill();
        } else ctx.fillRect(wx - u * 0.26, wy, u * 0.52, u * 0.8);
        ctx.strokeStyle = "#5A6B84";
        ctx.lineWidth = Math.max(1.5, u * 0.07);
        for (k = 0; k < 3; k++) {
          var ty = wy + (((k / 3 + scroll * 14) % 1) + 1) % 1 * u * 0.8;
          ctx.beginPath();
          ctx.moveTo(wx - u * 0.24, ty);
          ctx.lineTo(wx + u * 0.24, ty);
          ctx.stroke();
        }
      });
      // body
      ctx.fillStyle = "#E5483A";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cx - u * 1.2, gy - u * 1.15, u * 2.4, u * 0.95, u * 0.3);
      else ctx.rect(cx - u * 1.2, gy - u * 1.15, u * 2.4, u * 0.95);
      ctx.fill();
      ctx.fillStyle = "#C93A2E";
      ctx.beginPath();
      ctx.moveTo(cx - u * 0.95, gy - u * 1.1);
      ctx.lineTo(cx - u * 0.65, gy - u * 1.95);
      ctx.lineTo(cx + u * 0.65, gy - u * 1.95);
      ctx.lineTo(cx + u * 0.95, gy - u * 1.1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#CFEFFF";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cx - u * 0.52, gy - u * 1.85, u * 1.04, u * 0.6, u * 0.16);
      else ctx.rect(cx - u * 0.52, gy - u * 1.85, u * 1.04, u * 0.6);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.55)";
      ctx.beginPath();
      ctx.moveTo(cx - u * 0.35, gy - u * 1.85);
      ctx.lineTo(cx - u * 0.1, gy - u * 1.85);
      ctx.lineTo(cx - u * 0.3, gy - u * 1.25);
      ctx.lineTo(cx - u * 0.52, gy - u * 1.25);
      ctx.fill();
      // racing stripe, tail lights, bumper, spoiler, exhausts
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(cx - u * 0.14, gy - u * 1.15, u * 0.28, u * 0.5);
      ctx.fillStyle = "#FF6B4A";
      ctx.fillRect(cx - u * 1.1, gy - u * 0.95, u * 0.42, u * 0.22);
      ctx.fillRect(cx + u * 0.68, gy - u * 0.95, u * 0.42, u * 0.22);
      ctx.fillStyle = "#FFE066";
      ctx.fillRect(cx - u * 1.0, gy - u * 0.9, u * 0.22, u * 0.1);
      ctx.fillRect(cx + u * 0.78, gy - u * 0.9, u * 0.22, u * 0.1);
      ctx.fillStyle = "#2B3347";
      ctx.fillRect(cx - u * 1.1, gy - u * 0.38, u * 2.2, u * 0.18);
      ctx.fillRect(cx - u * 0.9, gy - u * 2.15, u * 0.12, u * 0.45);
      ctx.fillRect(cx + u * 0.78, gy - u * 2.15, u * 0.12, u * 0.45);
      ctx.fillRect(cx - u * 1.15, gy - u * 2.3, u * 2.3, u * 0.2);
      ctx.fillStyle = "#6C7A93";
      [-0.55, 0.55].forEach(function (ex) {
        ctx.beginPath();
        ctx.arc(cx + ex * u, gy - u * 0.2, u * 0.13, 0, 6.283);
        ctx.fill();
      });
    }
    function pill(text, x, y, w, h, hint, blink) {
      ctx.fillStyle = hint ? (blink ? "#FFF08A" : "#FFC400") : "#FFFFFF";
      ctx.strokeStyle = hint ? "#E0A800" : "#4A5878";
      ctx.lineWidth = Math.max(1.5, h * 0.08);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x - w / 2, y - h / 2, w, h, h * 0.3);
      else ctx.rect(x - w / 2, y - h / 2, w, h);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1E2A4A";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var fs = Math.max(9, h * 0.58);
      ctx.font = "700 " + fs + "px Fredoka, sans-serif";
      while (ctx.measureText(text).width > w * 0.88 && fs > 8) {
        fs -= 1;
        ctx.font = "700 " + fs + "px Fredoka, sans-serif";
      }
      ctx.fillText(text, x, y + 1);
    }
    function draw(now) {
      if (!cv || done) return;
      var ts = Date.now(),
        dt = Math.min(0.05, Math.max(0, (ts - last) / 1000));
      last = ts;
      var T = speedT(),
        k;
      if (started) {
        // movement
        if (gate) {
          gate.p += dt / T;
          if (gate.p >= 1) resolve();
        } else if (!done) {
          wait -= dt;
          if (wait <= 0 && i < rounds.length) newGate();
        }
        coins.forEach(function (c) {
          c.p += dt / T;
          if (!c.got && c.p >= 1 && c.p < 1.15 && c.lane === lane) {
            c.got = true;
            coinN++;
            score += 2;
            if (coinN % 3 === 0) sfx("pew");
            hud();
          }
        });
        coins = coins.filter(function (c) {
          return c.p < 1.2;
        });
      }
      if (started) scroll += dt / T;
      var phase = scroll;
      carX += (X(1, lane) - carX) * Math.min(1, dt * 14);
      if (started && ts - puffAt > 70) {
        puffAt = ts;
        puffs.push({ x: carX - 5 + rnd() * 10, y: PL - 12, vx: (rnd() - 0.5) * 20, vy: 40, t: ts, r: 3 + W * 0.01, c: "235,240,250" });
      }
      puffs = puffs.filter(function (p) {
        return ts - p.t < 600;
      });
      ctx.clearRect(0, 0, W, H);
      // sky, sun, grass, road
      var g1 = ctx.createLinearGradient(0, 0, 0, HOR);
      g1.addColorStop(0, "#BFE6FF");
      g1.addColorStop(1, "#EAF7FF");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, HOR + 2);
      ctx.fillStyle = "#FFE066";
      ctx.beginPath();
      ctx.arc(W * 0.8, HOR * 0.45, HOR * 0.22, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = "#9ADF8A";
      ctx.fillRect(0, HOR, W, H - HOR);
      for (k = 0; k < 8; k++) {
        var pp = (((phase * 2 + k / 8) % 1) + 1) % 1,
          y1 = Y(pp),
          y2 = Y(pp + 0.06);
        if (k % 2) {
          ctx.fillStyle = "rgba(255,255,255,.12)";
          ctx.fillRect(0, y1, W, Math.max(1, y2 - y1));
        }
      }
      ctx.fillStyle = "#6C7A93";
      ctx.beginPath();
      ctx.moveTo(W / 2 - roadW(0) / 2, HOR);
      ctx.lineTo(W / 2 + roadW(0) / 2, HOR);
      ctx.lineTo(W / 2 + roadW(1.0) / 2, H);
      ctx.lineTo(W / 2 - roadW(1.0) / 2, H);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      [-1, 1].forEach(function (sd) {
        ctx.beginPath();
        ctx.moveTo(W / 2 + (sd * roadW(0)) / 2, HOR);
        ctx.lineTo(W / 2 + (sd * roadW(1.0)) / 2, H);
        ctx.stroke();
      });
      // lane dashes
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      for (k = 0; k < 10; k++) {
        var q = (((phase * 3 + k / 10) % 1) + 1) % 1,
          a = Math.pow(q, 1) * 1,
          ya = Y(a),
          yb = Y(a + 0.045),
          fa = (ya - HOR) / (H - HOR),
          fb = (yb - HOR) / (H - HOR);
        ctx.lineWidth = 1 + 3 * fa;
        [-1, 1].forEach(function (sd) {
          ctx.beginPath();
          ctx.moveTo(W / 2 + (sd * roadW(fa)) / 6, ya);
          ctx.lineTo(W / 2 + (sd * roadW(fb)) / 6, yb);
          ctx.stroke();
        });
      }
      // trees at the sides
      for (k = 0; k < 6; k++) {
        var tp = (((phase * 1 + k / 6) % 1) + 1) % 1,
          side = k % 2 ? 1 : -1,
          ty = Y(tp),
          tf = (ty - HOR) / (H - HOR),
          tx = W / 2 + side * (roadW(tf) / 2 + W * 0.09 + W * 0.1 * tf),
          sc = 0.12 + 1.0 * tf;
        ctx.fillStyle = "#8A5A2B";
        ctx.fillRect(tx - 3 * sc * 3, ty - 12 * sc * 3, 6 * sc * 3, 14 * sc * 3);
        ctx.fillStyle = "#35B779";
        ctx.beginPath();
        ctx.arc(tx, ty - 20 * sc * 3, 14 * sc * 3, 0, 6.283);
        ctx.fill();
      }
      // coins
      coins.forEach(function (c) {
        if (c.p < 0 || c.got) return;
        var cy = Y(c.p),
          cf = (cy - HOR) / (H - HOR),
          cx = X(c.p, c.lane),
          rr = 3 + 12 * cf;
        ctx.fillStyle = "#FFC400";
        ctx.beginPath();
        ctx.arc(cx, cy - rr, rr, 0, 6.283);
        ctx.fill();
        ctx.strokeStyle = "#E0A800";
        ctx.lineWidth = Math.max(1, rr * 0.18);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.6)";
        ctx.beginPath();
        ctx.arc(cx - rr * 0.3, cy - rr * 1.3, rr * 0.28, 0, 6.283);
        ctx.fill();
      });
      // the gate
      if (gate) {
        var gy = Y(gate.p),
          gf = (gy - HOR) / (H - HOR),
          lw = roadW(gf) / 3,
          sh = Math.max(16, lw * 0.6),
          sw = lw * 0.96,
          blink = Math.sin(ts / 120) > 0;
        gate.signs.forEach(function (sg) {
          var sx = X(gate.p, sg.lane),
            hint = tries >= 2 && sg.target,
            top = gy - lw * 0.95;
          ctx.strokeStyle = "#5A4A3A";
          ctx.lineWidth = Math.max(2, lw * 0.07);
          ctx.beginPath();
          ctx.moveTo(sx - sw * 0.42, top + sh / 2);
          ctx.lineTo(sx - sw * 0.42, gy);
          ctx.moveTo(sx + sw * 0.42, top + sh / 2);
          ctx.lineTo(sx + sw * 0.42, gy);
          ctx.stroke();
          if (hint) {
            var gl = ctx.createRadialGradient(sx, top + sh / 2, sh * 0.3, sx, top + sh / 2, sw * 0.9);
            gl.addColorStop(0, blink ? "rgba(255,240,120,.95)" : "rgba(255,214,64,.55)");
            gl.addColorStop(1, "rgba(255,214,64,0)");
            ctx.fillStyle = gl;
            ctx.beginPath();
            ctx.arc(sx, top + sh / 2, sw * 0.9, 0, 6.283);
            ctx.fill();
          }
          pill(sg.w, sx, top + sh / 2, sw, sh, hint, blink);
        });
      }
      puffs.forEach(function (p) {
        var age = (ts - p.t) / 600;
        ctx.fillStyle = "rgba(" + p.c + "," + (0.7 * (1 - age)).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(p.x + (p.vx * (ts - p.t)) / 1000, p.y + (p.vy * (ts - p.t)) / 1000, p.r * (1 + age * 1.4), 0, 6.283);
        ctx.fill();
      });
      drawCar(ts);
      if (!started) {
        ctx.fillStyle = "rgba(30,42,74,.62)";
        ctx.fillRect(0, H * 0.4, W, 56);
        ctx.fillStyle = "#fff";
        ctx.font = "700 " + Math.round(W * 0.052) + "px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Press ◀ ▶ or swipe to start the engine!", W / 2, H * 0.4 + 28);
      }
      raf = root.requestAnimationFrame ? root.requestAnimationFrame(draw) : null;
    }
    box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Word racer</span></div>' +
      '<div class="sw-card"><div class="sw-kind">Word racer</div><div class="sw-sent" style="font-size:22px">Drive through the gate with the word you hear!</div>' +
      '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><div class="sw-mhud"><span class="sw-msc" id="swRsc"></span><span class="sw-msc" id="swRco"></span><span class="sw-mcb" id="swRcb"></span><span class="sw-spd" id="swRsp"></span></div>' +
      '<div class="sw-rwrap" id="swRw"><canvas class="sw-snk" id="swRun"></canvas></div><div class="sw-rlr"><button class="sw-dp sw-dpw" id="swRl" aria-label="Left">◀</button><button class="sw-dp sw-dpw" id="swRr" aria-label="Right">▶</button></div><div class="sw-msg" id="swMsg"></div></div>';
    bindQuit();
    cv = document.getElementById("swRun");
    W = Math.max(240, Math.min(420, Math.floor((cv.parentNode.parentNode.clientWidth || 340) - 56)));
    H = Math.round(W * 1.15);
    HOR = Math.round(H * 0.27);
    PL = Math.round(H * 0.86);
    var dpr = root.devicePixelRatio || 1;
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    document.getElementById("swRw").style.width = W + "px";
    carX = X(1, 1);
    document.getElementById("swHear").onclick = function () {
      if (gate) play("w", gate.r.w);
      else if (rounds[i]) play("w", rounds[i].w);
    };
    document.getElementById("swRl").onclick = function () {
      setLane(lane - 1);
    };
    document.getElementById("swRr").onclick = function () {
      setLane(lane + 1);
    };
    keyH = function (e) {
      var m = { ArrowLeft: -1, ArrowRight: 1, a: -1, d: 1 }[e.key];
      if (m) {
        e.preventDefault();
        setLane(lane + m);
      }
    };
    document.addEventListener("keydown", keyH);
    var sx = null;
    cv.addEventListener("pointerdown", function (e) {
      sx = e.clientX;
    });
    cv.addEventListener("pointermove", function (e) {
      if (sx === null) return;
      if (Math.abs(e.clientX - sx) > 24) {
        setLane(lane + (e.clientX > sx ? 1 : -1));
        sx = e.clientX;
      }
    });
    cv.addEventListener("pointerup", function (e) {
      if (sx !== null && Math.abs(e.clientX - sx) <= 24) {
        var r = cv.getBoundingClientRect(),
          x = e.clientX - r.left;
        setLane(x < r.width / 3 ? lane - 1 : x > (r.width * 2) / 3 ? lane + 1 : lane);
      }
      sx = null;
    });
    cv.addEventListener("pointercancel", function () {
      sx = null;
    });
    my = run = { mode: "runner", steps: [], i: 0, first: first, rnd: seeded(1) };
    my.stop = function () {
      cleanup();
      my = null;
    };
    t0 = Date.now();
    last = Date.now();
    hud();
    draw(Date.now());
  }

  /* ---- Word slash: word orbs fly up from the bottom of the picture; hear a word and slash the orb that carries it (drag a finger or the mouse through it, or tap it).
     A wrong orb breaks sadly, a bomb costs a few points; a right slash sprays juice. The speed follows the child's accuracy ---- */
  var SLASHKEY = "lef_slash_v1";
  function readSlash() {
    var o = null;
    try {
      o = JSON.parse(ls.getItem(SLASHKEY));
    } catch (e) {}
    o = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    return { best: +o.best || 0, cuts: +o.cuts || 0, lvl: o.lvl === undefined ? 1.5 : Math.max(0, Math.min(8, +o.lvl || 0)) };
  }
  function writeSlash(o) {
    try {
      ls.setItem(SLASHKEY, JSON.stringify(o));
    } catch (e) {}
  }
  // the fruits that fly: the colours of the skin (light, middle, dark) and of the inside (which shows when it is sliced)
  var FRUITS = [
    { n: "apple", hi: "#FF9C8A", skin: "#E5483A", lo: "#9E2320", rind: "", flesh: "#FFF4D2", seed: "#6B3E1E" },
    { n: "orange", hi: "#FFD08A", skin: "#FF8A1F", lo: "#CC6208", rind: "#FFB35C", flesh: "#FFB84A", seed: "" },
    { n: "melon", hi: "#7ED08F", skin: "#2E9E5B", lo: "#17673A", rind: "#F2FFE6", flesh: "#FF4D63", seed: "#1E2A4A" },
    { n: "peach", hi: "#FFE0C8", skin: "#FF9A7A", lo: "#E0604A", rind: "", flesh: "#FFD79A", seed: "#7A4A2A" },
    { n: "lemon", hi: "#FFF59A", skin: "#FFD60A", lo: "#CFA000", rind: "#FFF07A", flesh: "#FFF8B0", seed: "" },
    { n: "berry", hi: "#FF8A99", skin: "#E8283E", lo: "#9E1226", rind: "", flesh: "#FF8896", seed: "" },
    { n: "kiwi", hi: "#C99A66", skin: "#8A5F35", lo: "#5A3C20", rind: "", flesh: "#8FD65A", seed: "#1E2A4A" },
  ];
  // the body of a fruit, centre at (0, 0), r = its size; gold = the hint paints it gold
  function fruitBody(c, f, r, gold) {
    var k,
      hi = gold ? "#FFF6B0" : f.hi,
      mid = gold ? gold : f.skin,
      lo = gold ? "#D9A100" : f.lo,
      gr = c.createRadialGradient(-r * 0.35, -r * 0.42, r * 0.12, 0, 0, r * 1.25);
    gr.addColorStop(0, hi);
    gr.addColorStop(0.45, mid);
    gr.addColorStop(1, lo);
    c.fillStyle = gr;
    c.strokeStyle = "rgba(30,42,74,.35)";
    c.lineWidth = 2.2;
    c.beginPath();
    if (f.n === "berry") {
      c.moveTo(0, r * 1.08);
      c.bezierCurveTo(r * 0.55, r * 0.85, r * 1.1, r * 0.2, r * 1.0, -r * 0.45);
      c.bezierCurveTo(r * 0.85, -r * 0.95, r * 0.2, -r * 0.85, 0, -r * 0.7);
      c.bezierCurveTo(-r * 0.2, -r * 0.85, -r * 0.85, -r * 0.95, -r * 1.0, -r * 0.45);
      c.bezierCurveTo(-r * 1.1, r * 0.2, -r * 0.55, r * 0.85, 0, r * 1.08);
    } else if (f.n === "lemon") {
      c.moveTo(-r * 1.28, 0);
      c.quadraticCurveTo(-r * 1.05, -r * 0.2, -r * 0.8, -r * 0.55);
      c.bezierCurveTo(-r * 0.3, -r * 0.98, r * 0.3, -r * 0.98, r * 0.8, -r * 0.55);
      c.quadraticCurveTo(r * 1.05, -r * 0.2, r * 1.28, 0);
      c.quadraticCurveTo(r * 1.05, r * 0.2, r * 0.8, r * 0.55);
      c.bezierCurveTo(r * 0.3, r * 0.98, -r * 0.3, r * 0.98, -r * 0.8, r * 0.55);
      c.quadraticCurveTo(-r * 1.05, r * 0.2, -r * 1.28, 0);
    } else if (f.n === "melon") {
      c.ellipse(0, 0, r * 1.08, r * 0.92, 0, 0, 6.283);
    } else if (f.n === "apple") {
      c.moveTo(0, -r * 0.66);
      c.bezierCurveTo(r * 0.25, -r * 1.0, r * 1.02, -r * 0.92, r * 1.0, -r * 0.1);
      c.bezierCurveTo(r * 0.98, r * 0.7, r * 0.5, r * 1.08, 0, r * 0.92);
      c.bezierCurveTo(-r * 0.5, r * 1.08, -r * 0.98, r * 0.7, -r * 1.0, -r * 0.1);
      c.bezierCurveTo(-r * 1.02, -r * 0.92, -r * 0.25, -r * 1.0, 0, -r * 0.66);
    } else if (f.n === "peach") {
      c.ellipse(0, r * 0.04, r * 0.98, r * 0.96, 0, 0, 6.283);
    } else if (f.n === "kiwi") {
      c.ellipse(0, 0, r * 1.02, r * 0.9, 0, 0, 6.283);
    } else c.arc(0, 0, r, 0, 6.283);
    c.fill();
    c.stroke();
    c.save();
    c.clip();
    if (f.n === "melon") {
      c.strokeStyle = gold ? "#D9A100" : "#17673A";
      c.lineWidth = r * 0.2;
      for (k = -2; k <= 2; k++) {
        c.beginPath();
        c.moveTo(k * r * 0.42, -r);
        c.quadraticCurveTo(k * r * 0.75, 0, k * r * 0.42, r);
        c.stroke();
      }
      c.strokeStyle = "rgba(190,240,170,.55)";
      c.lineWidth = r * 0.05;
      for (k = -2; k <= 2; k++) {
        c.beginPath();
        c.moveTo(k * r * 0.42 + r * 0.21, -r);
        c.quadraticCurveTo(k * r * 0.75 + r * 0.3, 0, k * r * 0.42 + r * 0.21, r);
        c.stroke();
      }
    } else if (f.n === "orange" || f.n === "lemon") {
      c.fillStyle = "rgba(120,50,0,.22)";
      for (k = 0; k < 26; k++) {
        c.beginPath();
        c.arc(Math.cos(k * 2.4) * r * (0.15 + 0.78 * ((k * 0.37) % 1)), Math.sin(k * 2.4) * r * 0.8 * (0.15 + 0.78 * ((k * 0.37) % 1)), r * 0.035, 0, 6.283);
        c.fill();
      }
    } else if (f.n === "peach") {
      var pb = c.createRadialGradient(r * 0.45, r * 0.1, r * 0.1, r * 0.45, r * 0.1, r * 0.9);
      pb.addColorStop(0, "rgba(255,90,80,.55)");
      pb.addColorStop(1, "rgba(255,90,80,0)");
      c.fillStyle = pb;
      c.fillRect(-r, -r, r * 2, r * 2);
      c.strokeStyle = "rgba(190,80,60,.55)";
      c.lineWidth = r * 0.06;
      c.beginPath();
      c.moveTo(0, -r * 0.92);
      c.quadraticCurveTo(r * 0.28, 0, 0, r * 0.95);
      c.stroke();
    } else if (f.n === "berry") {
      for (k = 0; k < 14; k++) {
        var bx = (((k * 5) % 5) - 2) * r * 0.34 + ((Math.floor(k / 5) % 2) * r * 0.17),
          by = -r * 0.35 + Math.floor(k / 5) * r * 0.5 + (k % 2) * r * 0.1;
        c.fillStyle = "rgba(130,10,25,.45)";
        c.beginPath();
        c.ellipse(bx, by + 1, r * 0.075, r * 0.11, 0, 0, 6.283);
        c.fill();
        c.fillStyle = "#FFE680";
        c.beginPath();
        c.ellipse(bx, by, r * 0.05, r * 0.08, 0, 0, 6.283);
        c.fill();
      }
    } else if (f.n === "kiwi") {
      c.strokeStyle = "rgba(60,38,20,.45)";
      c.lineWidth = 1.2;
      for (k = 0; k < 40; k++) {
        var ka = k * 2.399,
          kr = r * 0.9 * (0.2 + ((k * 0.61) % 0.8));
        c.beginPath();
        c.moveTo(Math.cos(ka) * kr, Math.sin(ka) * kr * 0.9);
        c.lineTo(Math.cos(ka) * kr + 2.5, Math.sin(ka) * kr * 0.9 + 1.5);
        c.stroke();
      }
    }
    c.restore();
    if (f.n === "berry") {
      c.fillStyle = "#2E9E5B";
      for (k = 0; k < 7; k++) {
        var la = -Math.PI / 2 + (k - 3) * 0.5;
        c.beginPath();
        c.ellipse(Math.cos(la) * r * 0.32, -r * 0.7 + Math.sin(la) * r * 0.18 + r * 0.12, r * 0.32, r * 0.1, la, 0, 6.283);
        c.fill();
      }
      c.strokeStyle = "#2E9E5B";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(0, -r * 0.72);
      c.lineTo(0, -r * 1.12);
      c.stroke();
    } else if (f.n === "apple" || f.n === "peach" || f.n === "orange") {
      c.strokeStyle = "#6B3E1E";
      c.lineWidth = 3.2;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(0, f.n === "apple" ? -r * 0.62 : -r * 0.9);
      c.quadraticCurveTo(r * 0.05, -r * 1.05, r * 0.16, -r * 1.2);
      c.stroke();
      var lf = c.createLinearGradient(0, -r * 1.2, r * 0.6, -r * 0.9);
      lf.addColorStop(0, "#6BD27E");
      lf.addColorStop(1, "#2E9E5B");
      c.fillStyle = lf;
      c.beginPath();
      c.ellipse(r * 0.42, -r * 1.02, r * 0.34, r * 0.14, -0.45, 0, 6.283);
      c.fill();
    }
    // a shine
    c.fillStyle = "rgba(255,255,255,.5)";
    c.beginPath();
    c.ellipse(-r * 0.42, -r * 0.4, r * 0.15, r * 0.28, 0.7, 0, 6.283);
    c.fill();
  }
  // the inside of a half fruit (a half disc from angle a0), centre at (0, 0)
  function fruitHalf(c, f, r, a0) {
    var k;
    c.fillStyle = f.skin;
    c.beginPath();
    c.arc(0, 0, r, a0, a0 + Math.PI);
    c.closePath();
    c.fill();
    if (f.rind) {
      c.fillStyle = f.rind;
      c.beginPath();
      c.arc(0, 0, r * 0.9, a0, a0 + Math.PI);
      c.closePath();
      c.fill();
    }
    c.fillStyle = f.flesh;
    c.beginPath();
    c.arc(0, 0, r * (f.rind ? 0.8 : 0.88), a0, a0 + Math.PI);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.55)";
    c.lineWidth = 1.6;
    if (f.n === "orange" || f.n === "lemon") {
      for (k = 1; k < 6; k++) {
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(Math.cos(a0 + (k * Math.PI) / 6) * r * 0.78, Math.sin(a0 + (k * Math.PI) / 6) * r * 0.78);
        c.stroke();
      }
    } else if (f.n === "apple") {
      c.fillStyle = "rgba(190,160,110,.45)";
      c.beginPath();
      c.ellipse(0, 0, r * 0.2, r * 0.32, a0 + Math.PI / 2, 0, 6.283);
      c.fill();
    } else if (f.n === "peach") {
      c.fillStyle = "#B4743E";
      c.beginPath();
      c.ellipse(0, 0, r * 0.3, r * 0.42, a0 + Math.PI / 2, 0, 6.283);
      c.fill();
    } else if (f.n === "berry") {
      c.fillStyle = "#FFD0D6";
      c.beginPath();
      c.arc(0, 0, r * 0.28, a0, a0 + Math.PI);
      c.fill();
    } else if (f.n === "kiwi") {
      c.fillStyle = "#F4FFD8";
      c.beginPath();
      c.arc(0, 0, r * 0.26, a0, a0 + Math.PI);
      c.fill();
    }
    if (f.seed) {
      c.fillStyle = f.seed;
      for (k = 0; k < 6; k++) {
        var sa = a0 + 0.3 + k * 0.5,
          sr = r * (f.n === "kiwi" ? 0.38 : 0.45 + 0.14 * (k % 2));
        c.beginPath();
        c.ellipse(Math.cos(sa) * sr, Math.sin(sa) * sr, 2, 3.2, sa, 0, 6.283);
        c.fill();
      }
    }
  }
  function startSlash(words) {
    gameTag = "game";
    trk("sw_game_start", "slash", "", "game");
    var pool = gamePool(learnedWords(readState()), words, firstLessonsWords(), 4),
      rounds = roundsFor(words, pool, seeded(Date.now() % 9973), 3),
      rnd = seeded((Date.now() % 4909) + 23),
      store = readSlash(),
      lvl = store.lvl,
      first = {},
      i = 0,
      score = 0,
      combo = 0,
      bestCombo = 0,
      cutsN = 0,
      tries = 0,
      lastWrong = false,
      help = 0,
      spdNote = "",
      done = false,
      busy = false,
      wait = 0.5,
      orbs = [],
      halves = [],
      parts = [],
      texts = [],
      trail = [],
      cur = null,
      shakeUntil = 0,
      last = 0,
      my = null,
      raf = null,
      cv = null,
      ctx = null,
      W = 340,
      H = 360,
      R = 36,
      ptr = null,
      mist = 0;
    function alive() {
      return !!my && run === my && !done;
    }
    function grav() {
      return 360 * Math.pow(1.1, lvl);
    }
    function say(t) {
      var m = document.getElementById("swMsg");
      if (m) m.textContent = t;
    }
    function hud() {
      var a = document.getElementById("swLsc"),
        d = document.getElementById("swLcb"),
        c = document.getElementById("swLsp"),
        dots = 1 + Math.round(lvl / 2);
      if (a) a.textContent = "Score " + score;
      if (d) d.textContent = combo >= 2 ? "Combo ×" + combo + " 🔥" : "";
      if (c) c.textContent = "Speed " + new Array(dots + 1).join("●") + new Array(6 - dots).join("○") + spdNote;
    }
    function pace(up) {
      spdNote = up ? " 🐇" : " 🐢";
      setTimeout(function () {
        spdNote = "";
        if (alive()) hud();
      }, 1800);
    }
    function cleanup() {
      done = true;
      if (raf && root.cancelAnimationFrame) root.cancelAnimationFrame(raf);
    }
    function finish() {
      cleanup();
      var newBest = score > store.best;
      store.best = Math.max(store.best, score);
      store.cuts += cutsN;
      store.lvl = lvl;
      writeSlash(store);
      var extra = '<div class="sw-fcount">' + (newBest ? "New best score! " : "Best score: " + store.best + ". ") + "Words sliced in all: " + store.cuts + '</div><div class="sw-stage"><div class="sw-pet sw-pets ' + (newBest ? "sw-dance" : "sw-hop") + '">' + petArt(newBest ? "excited" : "happy") + "</div></div>";
      endGame("l", first, "Word slash", function () {
        return score + " points!";
      }, function (r, t) {
        return r + " of " + t + " on the first try · best combo ×" + bestCombo;
      }, function () {
        startSlash(gameWords(readState(), 8));
      }, extra, null);
    }
    // launch the orbs for this word: the right one and one or two wrong ones, now and then a bomb
    function launch() {
      var r = rounds[i],
        k = wkey(r.w),
        others = r.opts
          .filter(function (w) {
            return wkey(w) !== k;
          })
          .slice(0, help > 0 ? 1 : 2),
        list = shuffle([{ w: r.w, target: true }].concat(
          others.map(function (w) {
            return { w: w, target: false };
          })
        ), rnd),
        g = grav();
      if (help > 0) help--;
      if (i >= 2 && rnd() < 0.4) list.splice(Math.floor(rnd() * (list.length + 1)), 0, { bomb: true });
      cur = { r: r, k: k, launched: 0, total: list.length };
      mist = mist; // the slips of this word are kept between launches
      list.forEach(function (it, j) {
        setTimeout(function () {
          if (!alive() || !cur || cur.r !== r) return;
          var h = H * (0.5 + rnd() * 0.22),
            vy = -Math.sqrt(2 * g * h),
            x0 = W * (0.2 + 0.6 * ((j + 0.5) / list.length)) + (rnd() - 0.5) * W * 0.08,
            T = (2 * -vy) / g,
            x1 = W * (0.22 + rnd() * 0.56);
          orbs.push({ x: x0, y: H + R, vx: (x1 - x0) / T, vy: vy, w: it.w, bomb: !!it.bomb, target: !!it.target, f: FRUITS[Math.floor(rnd() * FRUITS.length)], rot: rnd() * 6, vr: (rnd() - 0.5) * 2, seen: false, gone: false });
          cur.launched++;
        }, 180 + j * 260);
      });
      setTimeout(function () {
        if (alive() && cur && cur.r === r) play("w", r.w);
      }, 300);
    }
    function splashAt(o, col, n) {
      for (var q = 0; q < n; q++) {
        var a = rnd() * 6.283,
          sp = 80 + rnd() * 160;
        parts.push({ x: o.x, y: o.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, t: Date.now(), c: col, r: 2 + rnd() * 3 });
      }
    }
    function cutOrb(o, ang) {
      if (o.gone || !alive()) return;
      o.gone = true;
      var now = Date.now();
      halves.push({ x: o.x, y: o.y, vx: -80 * Math.cos(ang + 1.57) + o.vx * 0.3, vy: -80 * Math.sin(ang + 1.57) + o.vy * 0.2, ang: ang, rot: 0, vr: -2, c: o.bomb ? "#4A5878" : o.f.skin, f: o.bomb ? null : o.f, side: 0, t: now, w: o.w });
      halves.push({ x: o.x, y: o.y, vx: 80 * Math.cos(ang + 1.57) + o.vx * 0.3, vy: 80 * Math.sin(ang + 1.57) + o.vy * 0.2, ang: ang, rot: 0, vr: 2, c: o.bomb ? "#4A5878" : o.f.skin, f: o.bomb ? null : o.f, side: 1, t: now, w: o.w });
      if (o.bomb) {
        splashAt(o, "#FFB84A", 14);
        score = Math.max(0, score - 5);
        combo = 0;
        lvl = Math.max(0, lvl - 0.3);
        shakeUntil = now + 450;
        texts.push({ x: o.x, y: o.y, t: now, s: "−5 💥", c: "#FF6B4A" });
        sfx("poke");
        say("Oops, a bomb! Slice only the word you hear.");
        hud();
        return;
      }
      var k = cur.k;
      if (o.target) {
        splashAt(o, o.f.flesh, 18);
        if (first[k] === undefined) first[k] = true;
        lastWrong = mist > 0;
        if (mist === 0) {
          lvl = Math.min(8, lvl + 0.6);
          pace(true);
        }
        combo++;
        if (combo > bestCombo) bestCombo = combo;
        cutsN++;
        var pts = 10 + Math.min(combo, 6) * 3;
        score += pts;
        texts.push({ x: o.x, y: o.y, t: now, s: "+" + pts, c: "#FFE066" });
        sfx("bang");
        say((combo >= 3 ? "Combo ×" + combo + "! " : "Slash! ") + cur.r.w + (mist === 0 && combo >= 2 ? " · Faster!" : ""));
        try {
          if (hooks.burst && combo >= 3) {
            var br = cv.getBoundingClientRect();
            hooks.burst(br.left + o.x, br.top + o.y);
          }
        } catch (e) {}
        busy = true;
        orbs.forEach(function (x) {
          if (x !== o) x.gone = true; // the others drop away
        });
        mist = 0;
        tries = 0;
        i++;
        if (i >= rounds.length) {
          done = true;
          setTimeout(function () {
            if (my && run === my) finish();
          }, 1100);
        } else {
          wait = 1.0;
          cur = null;
          busy = false;
        }
        hud();
      } else {
        splashAt(o, "#9FB0C8", 8);
        first[k] = false;
        mist++;
        tries++;
        combo = 0;
        lvl = Math.max(0, lvl - 0.6);
        if (tries >= 2 || lastWrong) help = 2;
        pace(false);
        sfx("poke");
        say("Not that one! Listen again. Slowing down a little.");
        texts.push({ x: o.x, y: o.y, t: now, s: "oops", c: "#FF6B4A" });
        var rr = cur.r;
        setTimeout(function () {
          if (alive() && cur && cur.r === rr) play("w", rr.w);
        }, 700);
        hud();
      }
    }
    // the right orb fell off the picture without being sliced: the word comes back
    function missed() {
      var rr = cur.r;
      mist++;
      tries++;
      combo = 0;
      lvl = Math.max(0, lvl - 0.8);
      pace(false);
      say("Too slow! Listen again. Slowing down a little.");
      orbs.forEach(function (x) {
        x.gone = true;
      });
      cur = null;
      wait = 0.9;
      var again = rr;
      setTimeout(function () {
        if (alive()) play("w", again.w);
      }, 500);
      hud();
    }
    function hitTest(x1, y1, x2, y2) {
      var dx = x2 - x1,
        dy = y2 - y1,
        len2 = dx * dx + dy * dy,
        ang = Math.atan2(dy, dx);
      orbs.slice().forEach(function (o) {
        if (o.gone || o.y > H + R) return;
        var t = len2 ? Math.max(0, Math.min(1, ((o.x - x1) * dx + (o.y - y1) * dy) / len2)) : 0,
          px = x1 + t * dx,
          py = y1 + t * dy;
        if ((o.x - px) * (o.x - px) + (o.y - py) * (o.y - py) <= (R * 1.05) * (R * 1.05)) cutOrb(o, len2 ? ang : 0.5);
      });
    }
    function drawOrb(o, ts) {
      var hint = tries >= 2 && o.target && !o.bomb,
        blink = Math.sin(ts / 120) > 0;
      ctx.save();
      ctx.translate(o.x, o.y);
      if (hint) {
        var gl = ctx.createRadialGradient(0, 0, R * 0.5, 0, 0, R * 1.8);
        gl.addColorStop(0, blink ? "rgba(255,240,120,.95)" : "rgba(255,214,64,.55)");
        gl.addColorStop(1, "rgba(255,214,64,0)");
        ctx.fillStyle = gl;
        ctx.beginPath();
        ctx.arc(0, 0, R * 1.8, 0, 6.283);
        ctx.fill();
      }
      var base = o.bomb ? "#3B4663" : hint ? (blink ? "#FFF08A" : "#FFC400") : o.f.skin;
      if (o.bomb) {
        ctx.fillStyle = base;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, 6.283);
        ctx.fill();
        ctx.strokeStyle = "rgba(30,42,74,.35)";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else fruitBody(ctx, o.f, R, hint ? (blink ? "#FFF08A" : "#FFC400") : null);
      if (o.bomb) {
        ctx.fillStyle = "#fff";
        ctx.font = "700 " + Math.round(R * 0.9) + "px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("💣", 0, 2);
        ctx.strokeStyle = "#FFB84A";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -R);
        ctx.quadraticCurveTo(R * 0.3, -R * 1.3, R * 0.5, -R * 1.25);
        ctx.stroke();
      } else {
        var fs = Math.round(R * 0.62),
          tw;
        ctx.font = "700 " + fs + "px Fredoka, sans-serif";
        while ((tw = ctx.measureText(o.w).width) > R * 1.6 && fs > 9) {
          fs--;
          ctx.font = "700 " + fs + "px Fredoka, sans-serif";
        }
        ctx.fillStyle = "rgba(255,255,255,.95)";
        ctx.strokeStyle = "rgba(30,42,74,.45)";
        ctx.lineWidth = 1.5;
        var pw = tw + 12,
          ph = fs + 8;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2);
        else ctx.rect(-pw / 2, -ph / 2, pw, ph);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#1E2A4A";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(o.w, 0, 1);
      }
      ctx.restore();
    }
    function draw() {
      if (!cv || done) return;
      var ts = Date.now(),
        dt = Math.min(0.05, Math.max(0, (ts - last) / 1000)),
        g = grav(),
        k;
      last = ts;
      // movement
      if (!cur && !busy && wait > 0) {
        wait -= dt;
        if (wait <= 0 && i < rounds.length) launch();
      }
      orbs.forEach(function (o) {
        o.vy += g * dt;
        o.x += o.vx * dt;
        o.y += o.vy * dt;
        o.rot += o.vr * dt;
        if (o.y < H) o.seen = true;
      });
      halves.forEach(function (h) {
        h.vy += g * 1.3 * dt;
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        h.rot += h.vr * dt;
      });
      parts.forEach(function (p) {
        p.vy += 500 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      });
      if (cur && !busy) {
        var tgt = orbs.filter(function (o) {
          return o.target && !o.gone;
        })[0];
        var left = orbs.filter(function (o) {
          return !o.gone;
        });
        // the right orb has fallen off the bottom (after it was seen), or never showed up: the word comes back
        if (cur.launched >= cur.total && (!tgt || (tgt.seen && tgt.y > H + R * 1.5 && tgt.vy > 0))) missed();
        else if (cur.launched >= cur.total && !left.length) missed();
      }
      orbs = orbs.filter(function (o) {
        return !o.gone && !(o.seen && o.y > H + R * 2);
      });
      halves = halves.filter(function (h) {
        return ts - h.t < 1400;
      });
      parts = parts.filter(function (p) {
        return ts - p.t < 800;
      });
      texts = texts.filter(function (t) {
        return ts - t.t < 900;
      });
      trail = trail.filter(function (p) {
        return ts - p.t < 220;
      });
      // drawing
      var sh = ts < shakeUntil ? Math.sin(ts / 20) * 4 : 0;
      ctx.save();
      ctx.translate(sh, 0);
      var bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#6EC1F2");
      bg.addColorStop(0.7, "#BFE6FF");
      bg.addColorStop(1, "#EAF7FF");
      ctx.fillStyle = bg;
      ctx.fillRect(-10, 0, W + 20, H);
      ctx.fillStyle = "#FFE066";
      ctx.beginPath();
      ctx.arc(W * 0.8, H * 0.14, W * 0.07, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.92)";
      [[0.2, 0.2, 1], [0.62, 0.34, 0.8], [0.9, 0.5, 0.6]].forEach(function (cl, n) {
        var cx2 = ((cl[0] * W + ts * 0.006 * (n + 1)) % (W + 120)) - 60,
          cy2 = cl[1] * H * 0.7 + 6,
          ks = cl[2];
        ctx.beginPath();
        ctx.ellipse(cx2, cy2, 34 * ks, 11 * ks, 0, 0, 6.283);
        ctx.ellipse(cx2 + 20 * ks, cy2 - 8 * ks, 20 * ks, 12 * ks, 0, 0, 6.283);
        ctx.fill();
      });
      ctx.fillStyle = "#A6DE87";
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H * 0.84);
      for (k = 0; k <= W; k += 8) ctx.lineTo(k, H * 0.86 - 10 * Math.sin((k / W) * 6) - 6 * Math.sin((k / W) * 13));
      ctx.lineTo(W, H);
      ctx.fill();
      ctx.fillStyle = "#79C96A";
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H * 0.92);
      for (k = 0; k <= W; k += 8) ctx.lineTo(k, H * 0.93 - 6 * Math.sin((k / W) * 8 + 1));
      ctx.lineTo(W, H);
      ctx.fill();
      halves.forEach(function (h) {
        var age = (ts - h.t) / 1400;
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rot);
        ctx.globalAlpha = Math.max(0, 1 - age * 0.9);
        var a0 = h.ang + h.side * Math.PI;
        if (h.f) fruitHalf(ctx, h.f, R, a0);
        else {
          ctx.fillStyle = h.c;
          ctx.beginPath();
          ctx.arc(0, 0, R, a0, a0 + Math.PI);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });
      parts.forEach(function (p) {
        ctx.globalAlpha = Math.max(0, 1 - (ts - p.t) / 800);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      orbs.forEach(function (o) {
        drawOrb(o, ts);
      });
      // the slash trail
      if (trail.length > 1) {
        for (k = 1; k < trail.length; k++) {
          var a = 1 - (ts - trail[k].t) / 220;
          ctx.strokeStyle = "rgba(255,255,255," + Math.max(0, a).toFixed(2) + ")";
          ctx.lineWidth = 2 + 7 * Math.max(0, a);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(trail[k - 1].x, trail[k - 1].y);
          ctx.lineTo(trail[k].x, trail[k].y);
          ctx.stroke();
        }
      }
      texts.forEach(function (t) {
        var age = (ts - t.t) / 900;
        ctx.globalAlpha = Math.max(0, 1 - age);
        ctx.fillStyle = t.c;
        ctx.strokeStyle = "rgba(30,42,74,.92)";
        ctx.lineWidth = 4.5;
        ctx.lineJoin = "round";
        ctx.font = "700 " + Math.round(W * 0.075) + "px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(t.s, t.x, t.y - age * 40);
        ctx.fillText(t.s, t.x, t.y - age * 40);
        ctx.globalAlpha = 1;
      });
      ctx.restore();
      raf = root.requestAnimationFrame ? root.requestAnimationFrame(draw) : null;
    }
    box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Word slash</span></div>' +
      '<div class="sw-card"><div class="sw-kind">Word slash</div><div class="sw-sent" style="font-size:22px">Slice the orb with the word you hear!</div>' +
      '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><div class="sw-mhud"><span class="sw-msc" id="swLsc"></span><span class="sw-mcb" id="swLcb"></span><span class="sw-spd" id="swLsp"></span></div>' +
      '<canvas class="sw-snk" id="swSlash"></canvas><div class="sw-msg" id="swMsg">Swipe through the word, or tap it!</div></div>';
    bindQuit();
    cv = document.getElementById("swSlash");
    W = Math.max(260, Math.min(440, Math.floor((cv.parentNode.clientWidth || 340) - 56)));
    H = Math.round(W * 1.0);
    R = Math.round(W * 0.105);
    var dpr = root.devicePixelRatio || 1;
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    document.getElementById("swHear").onclick = function () {
      if (cur) play("w", cur.r.w);
      else if (rounds[i]) play("w", rounds[i].w);
    };
    function pos(e) {
      var r = cv.getBoundingClientRect();
      return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
    }
    cv.addEventListener("pointerdown", function (e) {
      ptr = pos(e);
      trail.push({ x: ptr.x, y: ptr.y, t: Date.now() });
      hitTest(ptr.x, ptr.y, ptr.x, ptr.y);
    });
    cv.addEventListener("pointermove", function (e) {
      if (!ptr) return;
      var p = pos(e);
      trail.push({ x: p.x, y: p.y, t: Date.now() });
      hitTest(ptr.x, ptr.y, p.x, p.y);
      ptr = p;
    });
    cv.addEventListener("pointerup", function () {
      ptr = null;
    });
    cv.addEventListener("pointercancel", function () {
      ptr = null;
    });
    cv.addEventListener("pointerleave", function () {
      ptr = null;
    });
    my = run = { mode: "slash", steps: [], i: 0, first: first, rnd: seeded(1) };
    my.stop = function () {
      cleanup();
      my = null;
    };
    last = Date.now();
    hud();
    draw();
  }

  /* ---- Word detective: a case has four clues. Each clue is a row of folders with words on them: hear a word and open the folder that has it. A right folder shows a photo
     (the picture of the word) and the clue is read out; four clues solve the case and unmask the culprit, who joins the gallery. Wrong folders are empty.
     The more the child gets right, the more folders (and look-alike words) there are ---- */
  var DETKEY = "lef_detective_v1",
    DETCASES = [
      { id: "raccoon", e: "🦝", name: "Rascal Raccoon", q: "Who took the cookies?", did: "He took the cookies from the jar." },
      { id: "fox", e: "🦊", name: "Sly Fox", q: "Who hid the red hat?", did: "She hid the hat under the bed." },
      { id: "owl", e: "🦉", name: "Night Owl", q: "Who borrowed the book?", did: "He read the book all night long." },
      { id: "pig", e: "🐷", name: "Muddy Pig", q: "Who splashed the paint?", did: "He jumped in the paint, splash!" },
      { id: "parrot", e: "🦜", name: "Chatty Parrot", q: "Who told the secret?", did: "She could not keep a secret." },
      { id: "monkey", e: "🐵", name: "Cheeky Monkey", q: "Who ran off with the banana?", did: "He swung away with the banana." },
      { id: "croc", e: "🐊", name: "Snappy Croc", q: "Who snapped the ribbon?", did: "He snapped the ribbon with his teeth." },
      { id: "rex", e: "🦖", name: "Tiny Rex", q: "Who stomped the garden?", did: "He stomped on the flowers." },
    ];
  function readDet() {
    var o = null;
    try {
      o = JSON.parse(ls.getItem(DETKEY));
    } catch (e) {}
    o = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    return { got: o.got && typeof o.got === "object" ? o.got : {}, lvl: o.lvl === undefined ? 1 : Math.max(0, Math.min(8, +o.lvl || 0)) };
  }
  function writeDet(o) {
    try {
      ls.setItem(DETKEY, JSON.stringify(o));
    } catch (e) {}
  }
  function detFound(o) {
    return DETCASES.filter(function (c) {
      return o.got[c.id] > 0;
    }).length;
  }
  function startDetective(words) {
    gameTag = "game";
    trk("sw_game_start", "detective", "", "game");
    var pool = gamePool(learnedWords(readState()), words, firstLessonsWords(), 6),
      rnd = seeded((Date.now() % 4421) + 31),
      store = readDet(),
      lvl = store.lvl,
      first = {},
      solved = [],
      i = 0,
      score = 0,
      combo = 0,
      bestCombo = 0,
      clues = 0,
      help = 0,
      lastWrong = false,
      spdNote = "",
      cs = null,
      my = null,
      timers = [];
    var CASELEN = 4;
    function alive() {
      return !!my && run === my;
    }
    function later(fn, ms) {
      var t = setTimeout(function () {
        if (alive()) fn();
      }, ms);
      timers.push(t);
      return t;
    }
    function pickCase() {
      var fresh = DETCASES.filter(function (c) {
          return !(store.got[c.id] > 0) && solved.indexOf(c) < 0;
        }),
        any = DETCASES.filter(function (c) {
          return solved.indexOf(c) < 0;
        }),
        list = fresh.length && rnd() < 0.8 ? fresh : any;
      return list[Math.floor(rnd() * list.length)];
    }
    function folders() {
      return Math.max(2, 3 + (lvl >= 3 ? 1 : 0) + (lvl >= 6 ? 1 : 0) - (help > 0 ? 1 : 0));
    }
    function dots() {
      var d = 1 + Math.round(lvl / 2);
      return "Level " + new Array(d + 1).join("●") + new Array(6 - d).join("○") + spdNote;
    }
    function hud() {
      var a = document.getElementById("swDsc"),
        b = document.getElementById("swDcb"),
        c = document.getElementById("swDlv");
      if (a) a.textContent = "Score " + score;
      if (b) b.textContent = combo >= 2 ? "Combo ×" + combo + " 🔥" : "";
      if (c) c.textContent = dots();
    }
    function pace(up) {
      spdNote = up ? " 🔼" : " 🔽";
      later(function () {
        spdNote = "";
        hud();
      }, 1800);
    }
    function finish() {
      var found = readDet();
      solved.forEach(function (c) {
        found.got[c.id] = (found.got[c.id] || 0) + 1;
      });
      found.lvl = lvl;
      writeDet(found);
      var thumbs = solved
          .map(function (c) {
            return '<span class="sw-dth">' + c.e + (store.got[c.id] > 0 ? "" : '<b class="sw-fnew">NEW</b>') + "</span>";
          })
          .join(""),
        extra = '<div class="sw-fcatch">' + thumbs + '</div><div class="sw-fcount">Culprit gallery: ' + detFound(found) + " / " + DETCASES.length + ' culprits</div><button class="sw-say sw-alt" id="swGal">Look at the gallery</button>' +
          '<div class="sw-stage"><div class="sw-pet sw-pets sw-hop">' + petArt("happy") + "</div></div>";
      endGame("d", first, "Word detective", function (r, t) {
        return r >= t ? "Super detective!" : "Cases solved!";
      }, function (r, t) {
        return r + " of " + t + " on the first try · best combo ×" + bestCombo;
      }, function () {
        startDetective(gameWords(readState(), 8));
      }, extra, function () {
        var b = document.getElementById("swGal");
        if (b) b.onclick = showGallery;
      });
    }
    function show() {
      if (!alive()) return;
      if (i >= words.length) {
        finish();
        return;
      }
      if (clues === 0 || !cs) cs = pickCase();
      var w = words[i],
        k = wkey(w),
        n = folders(),
        opts = shuffle([w].concat(distractors(w, pool, rnd, words, n - 1)).slice(0, n), rnd),
        tries = 0,
        busy = false,
        caseNo = Math.floor(i / CASELEN) + 1,
        slots = "";
      if (help > 0) help--;
      for (var q = 0; q < CASELEN; q++) slots += '<i class="sw-dslot' + (q < clues ? " sw-on" : "") + '">🔍</i>';
      box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Case ' + caseNo + " · clue " + (clues + 1) + " / " + CASELEN + "</span></div>" +
        '<div class="sw-card"><div class="sw-kind">Word detective</div><div class="sw-sent" style="font-size:21px">Who did it? Find all four clues!<br><small>Open the folder with the word you hear.</small></div>' +
        '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button>' +
        '<div class="sw-dcase"><div class="sw-fpet sw-mpet" id="swDpet">' + petArt("happy") + '</div><div class="sw-dsil" id="swDsil">' + cs.e + '</div><div class="sw-dslots">' + slots + '</div></div>' +
        '<div class="sw-mhud"><span class="sw-msc" id="swDsc"></span><span class="sw-mcb" id="swDcb"></span><span class="sw-spd" id="swDlv"></span></div>' +
        '<div class="sw-desk" id="swDesk">' + opts.map(function (o) {
          return '<button class="sw-fold" data-w="' + esc(o) + '"><span class="sw-ftab"></span><span class="sw-flb">' + esc(o) + "</span></button>";
        }).join("") + '</div><div class="sw-dfound" id="swDfound"></div><div class="sw-msg" id="swMsg"></div></div>';
      bindQuit();
      hud();
      function say(t) {
        var m = document.getElementById("swMsg");
        if (m) m.textContent = t;
      }
      function wiggle() {
        var pe = document.getElementById("swDpet");
        if (!pe) return;
        pe.innerHTML = petArt("excited");
        pe.classList.remove("sw-fwig");
        void pe.offsetWidth;
        pe.classList.add("sw-fwig");
        later(function () {
          var p2 = document.getElementById("swDpet");
          if (p2) {
            p2.classList.remove("sw-fwig");
            p2.innerHTML = petArt("happy");
          }
        }, 1300);
      }
      document.getElementById("swHear").onclick = function () {
        play("w", w);
      };
      Array.prototype.forEach.call(box.querySelectorAll(".sw-fold"), function (b) {
        b.onclick = function () {
          if (busy || b.classList.contains("sw-open") || b.classList.contains("sw-empty")) return;
          var right = wkey(b.getAttribute("data-w")) === k;
          if (first[k] === undefined) first[k] = right;
          else if (!right) first[k] = false;
          if (!right) {
            tries++;
            combo = 0;
            lvl = Math.max(0, lvl - 0.8);
            if (tries >= 2 || lastWrong) help = 2;
            pace(false);
            b.classList.add("sw-empty");
            sfx("poke");
            say("This folder is empty! Listen again.");
            hud();
            later(function () {
              play("w", w);
            }, 700);
            if (tries >= 2)
              Array.prototype.forEach.call(box.querySelectorAll(".sw-fold"), function (o) {
                if (wkey(o.getAttribute("data-w")) === k) o.classList.add("sw-hint");
              });
            return;
          }
          busy = true;
          b.classList.add("sw-open");
          lastWrong = tries > 0;
          if (tries === 0) {
            lvl = Math.min(8, lvl + 0.6);
            pace(true);
          }
          combo++;
          if (combo > bestCombo) bestCombo = combo;
          var pts = 10 + Math.min(combo, 6) * 3;
          score += pts;
          clues++;
          sfx("sparkle");
          wiggle();
          hud();
          try {
            if (hooks.burst && combo >= 3) {
              var br = b.getBoundingClientRect();
              hooks.burst(br.left + br.width / 2, br.top);
            }
          } catch (e) {}
          var f = document.getElementById("swDfound");
          f.innerHTML = '<div class="sw-dpol"><div class="sw-dstamp">CLUE!</div>' + art(w, true) + '<div class="sw-dcap">' + esc((wordInfo(w) || {}).s || w) + "</div></div>";
          var sl = box.querySelectorAll(".sw-dslot")[clues - 1];
          if (sl) sl.classList.add("sw-on");
          say((combo >= 3 ? "Combo ×" + combo + "! " : "Clue found! ") + "+" + pts);
          var moved = false;
          function next() {
            if (moved || !alive()) return;
            moved = true;
            i++;
            if (clues >= CASELEN) solve();
            else show();
          }
          play("s", w, function () {
            later(next, 700);
          });
          later(next, 7500);
        };
      });
      later(function () {
        play("w", w);
      }, 500);
    }
    // four clues: the culprit is unmasked
    function solve() {
      var c = cs;
      solved.push(c);
      clues = 0;
      cs = null;
      score += 30;
      sfx("big");
      try {
        if (hooks.burst) hooks.burst(root.innerWidth / 2, 240);
      } catch (e) {}
      var isNew = !(store.got[c.id] > 0) && !solved.slice(0, -1).some(function (x) {
          return x.id === c.id;
        });
      box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Case solved!</span></div>' +
        '<div class="sw-card"><div class="sw-kind">Case solved!</div><div class="sw-dbig sw-dpop">' + c.e + '</div><div class="sw-big" style="font-size:38px">' + esc(c.name) + (isNew ? ' <small class="sw-fnew2">NEW</small>' : "") + '</div><div class="sw-sent" style="font-size:20px">' + esc(c.did) + '</div><div class="sw-fcount">+30 for solving the case</div><button class="sw-go" id="swDnext">' + (i >= words.length ? "Finish" : "Next case →") + "</button></div>";
      bindQuit();
      document.getElementById("swDnext").onclick = function () {
        if (i >= words.length) finish();
        else show();
      };
    }
    my = run = { mode: "detective", steps: [], i: 0, first: first, rnd: seeded(1) };
    my.stop = function () {
      timers.forEach(clearTimeout);
      my = null;
    };
    show();
  }
  // the culprits caught so far, and the ones still on the run
  function showGallery() {
    trk("sw_view", "gallery", "", "screen");
    var found = readDet(),
      h = '<div class="sw-top"><button class="sw-back" id="swClose">← Back</button></div><div class="sw-ttl"><span class="sw-aa">🕵️</span><div><h1>Culprit gallery</h1><div class="sw-sub">' + detFound(found) + " of " + DETCASES.length + ' culprits caught · solve cases in Word detective</div></div></div><div class="sw-aq">';
    DETCASES.forEach(function (c) {
      var have = found.got[c.id] > 0;
      h += '<div class="sw-aqc' + (have ? "" : " sw-aqno") + '"><div class="sw-dgal' + (have ? "" : " sw-dsilh") + '">' + c.e + '</div><div class="sw-aqn">' + (have ? esc(c.name) : "???") + '</div><div class="sw-aqr" style="color:#6A48E8">' + (have ? "Caught ×" + found.got[c.id] : "Still on the run") + "</div></div>";
    });
    box.innerHTML = h + "</div>";
    document.getElementById("swClose").onclick = showHome;
  }

  /* ---- Word basketball: hoops with words on their boards slide to and fro near the top; hear a word and flick the ball up toward the hoop that has it
     (or tap the hoop). A swish in the right hoop scores; the wrong hoop spits the ball out; an air ball is just tried again. The hoops move faster and
     further when the child gets it right ---- */
  var HOOPKEY = "lef_hoops_v1";
  function readHoops() {
    var o = null;
    try {
      o = JSON.parse(ls.getItem(HOOPKEY));
    } catch (e) {}
    o = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    return { best: +o.best || 0, swish: +o.swish || 0, lvl: o.lvl === undefined ? 1 : Math.max(0, Math.min(8, +o.lvl || 0)) };
  }
  function writeHoops(o) {
    try {
      ls.setItem(HOOPKEY, JSON.stringify(o));
    } catch (e) {}
  }
  function startBasket(words) {
    gameTag = "game";
    trk("sw_game_start", "basketball", "", "game");
    var pool = gamePool(learnedWords(readState()), words, firstLessonsWords(), 4),
      rounds = roundsFor(words, pool, seeded(Date.now() % 9973), 3),
      rnd = seeded((Date.now() % 3989) + 41),
      store = readHoops(),
      lvl = store.lvl,
      first = {},
      i = 0,
      score = 0,
      combo = 0,
      bestCombo = 0,
      swishN = 0,
      tries = 0,
      lastWrong = false,
      help = 0,
      spdNote = "",
      done = false,
      hoops = [],
      ball = null,
      cur = null,
      fx = [],
      texts = [],
      shakeUntil = 0,
      wait = 0.5,
      last = 0,
      clock = 0,
      my = null,
      raf = null,
      cv = null,
      ctx = null,
      W = 340,
      H = 400,
      RR = 28,
      BR = 20,
      BX = 170,
      BY = 340,
      G = 800,
      down = null;
    function alive() {
      return !!my && run === my && !done;
    }
    function say(t) {
      var m = document.getElementById("swMsg");
      if (m) m.textContent = t;
    }
    function hud() {
      var a = document.getElementById("swKsc"),
        b = document.getElementById("swKcb"),
        c = document.getElementById("swKlv"),
        d = 1 + Math.round(lvl / 2);
      if (a) a.textContent = "Score " + score;
      if (b) b.textContent = combo >= 2 ? "Combo ×" + combo + " 🔥" : "";
      if (c) c.textContent = "Speed " + new Array(d + 1).join("●") + new Array(6 - d).join("○") + spdNote;
    }
    function pace(up) {
      spdNote = up ? " 🐇" : " 🐢";
      setTimeout(function () {
        spdNote = "";
        if (alive()) hud();
      }, 1800);
    }
    function cleanup() {
      done = true;
      if (raf && root.cancelAnimationFrame) root.cancelAnimationFrame(raf);
    }
    function finish() {
      cleanup();
      var newBest = score > store.best;
      store.best = Math.max(store.best, score);
      store.swish += swishN;
      store.lvl = lvl;
      writeHoops(store);
      var extra = '<div class="sw-fcount">' + (newBest ? "New best score! " : "Best score: " + store.best + ". ") + "Swishes in all: " + store.swish + '</div><div class="sw-stage"><div class="sw-pet sw-pets ' + (newBest ? "sw-dance" : "sw-hop") + '">' + petArt(newBest ? "excited" : "happy") + "</div></div>";
      endGame("k", first, "Word basketball", function () {
        return score + " points!";
      }, function (r, t) {
        return r + " of " + t + " on the first try · best combo ×" + bestCombo;
      }, function () {
        startBasket(gameWords(readState(), 8));
      }, extra, null);
    }
    // where a hoop is now: it slides to and fro; the more the child gets right, the faster and further
    function hx(h, t) {
      var amp = W * Math.min(0.075, 0.015 + 0.007 * lvl),
        om = 0.7 + lvl * 0.16;
      return h.cx + amp * Math.sin(om * t + h.ph);
    }
    function newRound() {
      var r = rounds[i],
        k = wkey(r.w),
        others = r.opts
          .filter(function (w) {
            return wkey(w) !== k;
          })
          .slice(0, help > 0 ? 1 : 2),
        list = shuffle([{ w: r.w, target: true }].concat(
          others.map(function (w) {
            return { w: w, target: false };
          })
        ), rnd),
        n = list.length;
      if (help > 0) help--;
      hoops = list.map(function (it, j) {
        return { w: it.w, target: it.target, cx: W * (n === 2 ? 0.3 + 0.4 * j : 0.17 + (0.66 * j) / (n - 1)), y: H * (j % 2 ? 0.34 : 0.22), ph: rnd() * 6.283, net: 0, shake: 0 };
      });
      cur = { r: r, k: k };
      ball = null;
      setTimeout(function () {
        if (alive() && cur && cur.r === r) play("w", r.w);
      }, 350);
    }
    function nextBall() {
      ball = { x: BX, y: BY, vx: 0, vy: 0, fly: false, scored: false, t: 0, rot: 0, hit: false };
    }
    // shoot toward x (where the ball should be when it comes down to the hoops' height)
    function shoot(tx) {
      if (!alive() || !ball || ball.fly || !cur) return;
      var hyRef = H * 0.28,
        d = BY - hyRef,
        vy0 = Math.sqrt(2 * G * d * 1.22),
        tc = (vy0 + Math.sqrt(Math.max(0, vy0 * vy0 - 2 * G * d))) / G;
      tx = Math.max(W * 0.04, Math.min(W * 0.96, tx));
      ball.vx = (tx - BX) / tc;
      ball.vy = -vy0;
      ball.fly = true;
      ball.t = 0;
      sfx("pew");
    }
    function result(h, ok) {
      var k = cur.k,
        now = Date.now();
      h.net = 1;
      if (ok) {
        if (first[k] === undefined) first[k] = true;
        lastWrong = tries > 0;
        if (tries === 0) {
          lvl = Math.min(8, lvl + 0.6);
          pace(true);
        }
        combo++;
        if (combo > bestCombo) bestCombo = combo;
        swishN++;
        var pts = 10 + Math.min(combo, 6) * 3;
        score += pts;
        texts.push({ x: hx(h, clock), y: h.y - RR * 2.3, t: now, s: "SWISH! +" + pts, c: "#FFE066" });
        for (var q = 0; q < 14; q++) {
          var a = rnd() * 6.283,
            sp = 90 + rnd() * 140;
          fx.push({ x: hx(h, clock), y: h.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, t: now, c: ["#FFD23F", "#FF8A3D", "#fff", "#E5483A"][q % 4] });
        }
        sfx("big");
        say((combo >= 3 ? "Combo ×" + combo + "! " : "Swish! ") + cur.r.w + (tries === 0 && combo >= 2 ? " · Faster!" : ""));
        try {
          if (hooks.burst && combo >= 3) {
            var br = cv.getBoundingClientRect();
            hooks.burst(br.left + hx(h, clock), br.top + h.y);
          }
        } catch (e) {}
        tries = 0;
        i++;
        cur = null;
        if (i >= rounds.length) {
          done = true;
          setTimeout(function () {
            if (my && run === my) finish();
          }, 1300);
        } else {
          wait = 1.3;
          hoops.forEach(function (x) {
            x.out = true;
          });
        }
      } else {
        first[k] = false;
        tries++;
        combo = 0;
        lvl = Math.max(0, lvl - 0.8);
        if (tries >= 2 || lastWrong) help = 2;
        pace(false);
        h.shake = now;
        sfx("poke");
        ball.vy = -Math.abs(ball.vy) * 0.45;
        ball.vx = (rnd() < 0.5 ? -1 : 1) * 110;
        ball.hit = true;
        say("Not that hoop! Listen again. Slowing down a little.");
        var rr = cur.r;
        setTimeout(function () {
          if (alive() && cur && cur.r === rr) play("w", rr.w);
        }, 700);
      }
      hud();
    }
    function drawHoop(h, ts, front) {
      var x = hx(h, clock),
        y = h.y,
        hint = tries >= 2 && h.target,
        blink = Math.sin(ts / 120) > 0,
        bw = RR * 3.1,
        bh = RR * 1.15,
        swing = h.net ? Math.sin((ts - (h.netT || ts)) / 60) * 4 * Math.max(0, h.net) : 0,
        k;
      if (!front) {
        ctx.save();
        if (ts - h.shake < 350) ctx.translate(Math.sin(ts / 25) * 3, 0);
        // the board with the word
        if (hint) {
          var gl = ctx.createRadialGradient(x, y - RR * 1.4, RR * 0.3, x, y - RR * 1.4, RR * 2.4);
          gl.addColorStop(0, blink ? "rgba(255,240,120,.95)" : "rgba(255,214,64,.55)");
          gl.addColorStop(1, "rgba(255,214,64,0)");
          ctx.fillStyle = gl;
          ctx.beginPath();
          ctx.arc(x, y - RR * 1.4, RR * 2.4, 0, 6.283);
          ctx.fill();
        }
        ctx.fillStyle = hint ? (blink ? "#FFF08A" : "#FFC400") : "#FFFFFF";
        ctx.strokeStyle = "#E5483A";
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x - bw / 2, y - RR * 1.25 - bh, bw, bh, 8);
        else ctx.rect(x - bw / 2, y - RR * 1.25 - bh, bw, bh);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#1E2A4A";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var fs = Math.round(bh * 0.62);
        ctx.font = "700 " + fs + "px Fredoka, sans-serif";
        while (ctx.measureText(h.w).width > bw * 0.86 && fs > 9) {
          fs--;
          ctx.font = "700 " + fs + "px Fredoka, sans-serif";
        }
        ctx.fillText(h.w, x, y - RR * 1.25 - bh / 2 + 1);
        // the back of the rim
        ctx.strokeStyle = "#E5483A";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(x, y, RR, RR * 0.28, 0, Math.PI, 6.283);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.save();
        if (ts - h.shake < 350) ctx.translate(Math.sin(ts / 25) * 3, 0);
        // the net, in front of the ball
        ctx.strokeStyle = "rgba(255,255,255,.9)";
        ctx.lineWidth = 1.6;
        for (k = -3; k <= 3; k++) {
          ctx.beginPath();
          ctx.moveTo(x + (k / 3) * RR, y);
          ctx.lineTo(x + (k / 3) * RR * 0.55 + swing, y + RR * 1.15);
          ctx.stroke();
        }
        for (k = 1; k <= 3; k++) {
          var yy = y + (RR * 1.15 * k) / 4,
            ww = RR * (1 - 0.45 * (k / 4));
          ctx.beginPath();
          ctx.moveTo(x - ww + swing * (k / 4), yy);
          ctx.lineTo(x + ww + swing * (k / 4), yy);
          ctx.stroke();
        }
        ctx.strokeStyle = "#FF6B4A";
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.ellipse(x, y, RR, RR * 0.28, 0, 0, Math.PI);
        ctx.stroke();
        ctx.restore();
      }
    }
    function drawBall(b, ts) {
      var f = Math.max(0, Math.min(1, (BY - b.y) / (BY - H * 0.2))),
        s = 1 - 0.42 * f,
        r = BR * s;
      ctx.fillStyle = "rgba(20,25,50,.25)";
      ctx.beginPath();
      ctx.ellipse(b.fly ? b.x : BX, BY + BR * 0.95, BR * 0.9, BR * 0.22, 0, 0, 6.283);
      ctx.fill();
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      var g2 = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.1);
      g2.addColorStop(0, "#FFB066");
      g2.addColorStop(0.5, "#F2761F");
      g2.addColorStop(1, "#A8480B");
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = "#5A2A06";
      ctx.lineWidth = Math.max(1.4, r * 0.09);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, 6.283);
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.moveTo(0, -r);
      ctx.lineTo(0, r);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-r * 1.15, 0, r * 0.85, -0.9, 0.9);
      ctx.moveTo(r * 1.15 + r * 0.85 * Math.cos(Math.PI - 0.9), 0);
      ctx.arc(r * 1.15, 0, r * 0.85, Math.PI - 0.9, Math.PI + 0.9);
      ctx.stroke();
      ctx.restore();
    }
    function draw() {
      if (!cv || done) return;
      var ts = Date.now(),
        dt = Math.min(0.05, Math.max(0, (ts - last) / 1000)),
        k;
      last = ts;
      clock += dt;
      if (!cur && wait > 0 && i < rounds.length) {
        wait -= dt;
        if (wait <= 0) {
          newRound();
          nextBall();
        }
      }
      // the ball
      if (ball && ball.fly) {
        var py = ball.y;
        ball.t += dt;
        ball.vy += G * dt;
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        ball.rot += ball.vx * dt * 0.02 + 0.1;
        if (cur && ball.vy > 0 && !ball.scored && !ball.hit) {
          hoops.forEach(function (h) {
            var x = hx(h, clock);
            if (!ball.scored && !ball.hit && py < h.y && ball.y >= h.y && Math.abs(ball.x - x) < RR * 1.3) {
              ball.scored = h.target;
              ball.x = x;
              ball.vx = 0;
              h.netT = ts;
              result(h, h.target);
            }
          });
        }
        if (ball.y > BY + BR * 2.5 || ball.x < -BR * 3 || ball.x > W + BR * 3) {
          var wasHit = ball.hit || ball.scored;
          if (cur) {
            if (!wasHit) say("Air ball! Try again.");
            nextBall();
          } else ball = null;
        }
      }
      hoops.forEach(function (h) {
        if (h.net > 0) h.net = Math.max(0, h.net - dt * 0.9);
        if (h.out) h.cx += 0;
      });
      fx.forEach(function (p) {
        p.vy += 500 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      });
      fx = fx.filter(function (p) {
        return ts - p.t < 800;
      });
      texts = texts.filter(function (t) {
        return ts - t.t < 1000;
      });
      // drawing: gym, hoops, ball, nets
      var bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#9FD3F2");
      bg.addColorStop(0.62, "#DFF1FF");
      bg.addColorStop(0.62, "#E0B070");
      bg.addColorStop(1, "#B8864A");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.62);
      ctx.lineTo(W, H * 0.62);
      ctx.stroke();
      for (k = 0; k < 6; k++) {
        ctx.strokeStyle = "rgba(120,70,20,.18)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(((k + 0.5) * W) / 6 - (k - 2.5) * 6, H * 0.62);
        ctx.lineTo(((k + 0.5) * W) / 6 + (k - 2.5) * 40, H);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,.7)";
      ctx.lineWidth = 3;
      ctx.arc(W / 2, H * 0.97, W * 0.3, Math.PI, 6.283);
      ctx.stroke();
      // the crowd's flags
      ["#E5483A", "#3D8BF2", "#FFC93C", "#35B779", "#8B6BE8", "#FF6FA0", "#FF8A3D"].forEach(function (c, n) {
        ctx.fillStyle = c;
        var fx0 = (n + 0.5) * (W / 7);
        ctx.beginPath();
        ctx.moveTo(fx0 - 9, 0);
        ctx.lineTo(fx0 + 9, 0);
        ctx.lineTo(fx0, 14);
        ctx.fill();
      });
      var sh = ts < shakeUntil ? Math.sin(ts / 20) * 3 : 0;
      ctx.save();
      ctx.translate(sh, 0);
      hoops.forEach(function (h) {
        drawHoop(h, ts, false);
      });
      if (ball) drawBall(ball, ts);
      hoops.forEach(function (h) {
        drawHoop(h, ts, true);
      });
      fx.forEach(function (p) {
        ctx.globalAlpha = Math.max(0, 1 - (ts - p.t) / 800);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.4, 0, 6.283);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      texts.forEach(function (t) {
        var age = (ts - t.t) / 1000;
        ctx.globalAlpha = Math.max(0, 1 - age);
        ctx.fillStyle = t.c;
        ctx.strokeStyle = "rgba(30,42,74,.92)";
        ctx.lineWidth = 4.5;
        ctx.lineJoin = "round";
        ctx.font = "700 " + Math.round(W * 0.07) + "px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(t.s, t.x, t.y - age * 34);
        ctx.fillText(t.s, t.x, t.y - age * 34);
        ctx.globalAlpha = 1;
      });
      if (ball && !ball.fly && cur) {
        ctx.fillStyle = "rgba(30,42,74,.55)";
        ctx.font = "700 " + Math.round(W * 0.042) + "px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Flick the ball up toward the hoop!", W / 2, H * 0.52);
      }
      ctx.restore();
      raf = root.requestAnimationFrame ? root.requestAnimationFrame(draw) : null;
    }
    box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Word basketball</span></div>' +
      '<div class="sw-card"><div class="sw-kind">Word basketball</div><div class="sw-sent" style="font-size:22px">Shoot into the hoop with the word you hear!</div>' +
      '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><div class="sw-mhud"><span class="sw-msc" id="swKsc"></span><span class="sw-mcb" id="swKcb"></span><span class="sw-spd" id="swKlv"></span></div>' +
      '<canvas class="sw-snk" id="swHoopCv"></canvas><div class="sw-msg" id="swMsg">Swipe up toward a hoop, or tap a hoop!</div></div>';
    bindQuit();
    cv = document.getElementById("swHoopCv");
    W = Math.max(260, Math.min(440, Math.floor((cv.parentNode.clientWidth || 340) - 56)));
    H = Math.round(W * 1.15);
    RR = Math.round(W * 0.085);
    BR = Math.round(W * 0.062);
    BX = Math.round(W / 2);
    BY = Math.round(H * 0.86);
    G = H * 2.2;
    var dpr = root.devicePixelRatio || 1;
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    document.getElementById("swHear").onclick = function () {
      if (cur) play("w", cur.r.w);
      else if (rounds[i]) play("w", rounds[i].w);
    };
    function pos(e) {
      var r = cv.getBoundingClientRect();
      return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
    }
    cv.addEventListener("pointerdown", function (e) {
      var p = pos(e);
      down = { x: p.x, y: p.y, t: Date.now() };
    });
    cv.addEventListener("pointerup", function (e) {
      if (!down) return;
      var p = pos(e),
        dx = p.x - down.x,
        dy = p.y - down.y;
      down = null;
      if (!ball || ball.fly) return;
      if (Math.abs(dx) < 14 && Math.abs(dy) < 14) {
        // a tap on a hoop: the ball flies there
        var best = null;
        hoops.forEach(function (h) {
          var x = hx(h, clock);
          if (Math.abs(p.x - x) < RR * 1.9 && p.y < H * 0.55 && (!best || Math.abs(p.x - x) < Math.abs(p.x - hx(best, clock)))) best = h;
        });
        if (best) {
          var hyRef = H * 0.28,
            d = BY - hyRef,
            vy0 = Math.sqrt(2 * G * d * 1.22),
            tc = (vy0 + Math.sqrt(Math.max(0, vy0 * vy0 - 2 * G * d))) / G;
          var savedClock = clock;
          clock = savedClock + tc; // where the hoop will be when the ball gets there
          var tx = hx(best, clock);
          clock = savedClock;
          shoot(tx);
        }
        return;
      }
      if (dy < -22) shoot(BX + (dx / Math.abs(dy)) * W * 0.6);
    });
    cv.addEventListener("pointercancel", function () {
      down = null;
    });
    my = run = { mode: "basket", steps: [], i: 0, first: first, rnd: seeded(1) };
    my.stop = function () {
      cleanup();
      my = null;
    };
    last = Date.now();
    hud();
    draw();
  }

  /* ---- Deep sea treasure (the challenge of stage 6): the pet dives with a helmet and swims up and down (drag, or the arrow keys) while treasure chests drift by.
     Hear a word and swim into the chest that has it. Jellyfish drift about: a zap costs one of three air tanks. Slow, steady and gentle, a little quicker as the child gets it right ---- */
  var DEEPKEY = "lef_deep_v1";
  function readDeep() {
    var o = null;
    try {
      o = JSON.parse(ls.getItem(DEEPKEY));
    } catch (e) {}
    o = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    return { best: +o.best || 0, found: +o.found || 0, lvl: o.lvl === undefined ? 1 : Math.max(0, Math.min(8, +o.lvl || 0)) };
  }
  function writeDeep(o) {
    try {
      ls.setItem(DEEPKEY, JSON.stringify(o));
    } catch (e) {}
  }
  function startDeep(words) {
    gameTag = "game";
    trk("sw_game_start", "deepsea", "", "game");
    var pool = gamePool(learnedWords(readState()), words, firstLessonsWords(), 4),
      rounds = roundsFor(words, pool, seeded(Date.now() % 9973), 3),
      rnd = seeded((Date.now() % 6151) + 23),
      store = readDeep(),
      lvl = store.lvl,
      first = {},
      i = 0,
      score = 0,
      combo = 0,
      bestCombo = 0,
      foundN = 0,
      tries = 0,
      lastWrong = false,
      lives = 3,
      help = 0,
      spdNote = "",
      done = false,
      items = [],
      jellies = [],
      bubbles = [],
      reef = [],
      fx = [],
      texts = [],
      imgs = {},
      cur = null,
      mood = "happy",
      moved = false,
      keys = { u: false, d: false },
      keyH = null,
      keyU = null,
      py = 0,
      ty = 0,
      vy = 0,
      hurt = 0,
      shake = 0,
      wait = 0.4,
      last = 0,
      clock = 0,
      my = null,
      raf = null,
      cv = null,
      ctx = null,
      W = 340,
      H = 420,
      PX = 68,
      PR = 24,
      CH = 56;
    function alive() {
      return !!my && run === my && !done;
    }
    function say(t) {
      var m = document.getElementById("swMsg");
      if (m) m.textContent = t;
    }
    function hud() {
      var a = document.getElementById("swKsc"),
        b = document.getElementById("swKcb"),
        c = document.getElementById("swKlv");
      if (a) a.textContent = "Score " + score;
      if (b) b.textContent = combo >= 2 ? "Combo ×" + combo + " 🔥" : "";
      if (c) c.innerHTML = '<span style="color:#3D8BF2">' + new Array(lives + 1).join("●") + '</span><span style="color:#B9C4D8">' + new Array(4 - lives).join("●") + "</span> air" + spdNote;
    }
    function pace(up) {
      spdNote = up ? " 🐇" : " 🐢";
      setTimeout(function () {
        spdNote = "";
        if (alive()) hud();
      }, 1800);
    }
    function petImg(m) {
      if (imgs[m]) return imgs[m];
      var svg = petArt(m);
      if (!svg) return null;
      svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="288" height="428" ');
      var im = new Image();
      im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      imgs[m] = im;
      return im;
    }
    function cleanup() {
      done = true;
      if (raf && root.cancelAnimationFrame) root.cancelAnimationFrame(raf);
      if (keyH) document.removeEventListener("keydown", keyH);
      if (keyU) document.removeEventListener("keyup", keyU);
      keyH = keyU = null;
    }
    function finish() {
      cleanup();
      var newBest = score > store.best,
        won = lives > 0;
      store.best = Math.max(store.best, score);
      store.found += foundN;
      store.lvl = lvl;
      writeDeep(store);
      var extra = '<div class="sw-fcount">' + (won ? "Treasure hunt complete! " : "The air ran out, but good dive! ") + (newBest ? "New best score! " : "Best score: " + store.best + ". ") + "Treasures found in all: " + store.found + '</div><div class="sw-stage"><div class="sw-pet sw-pets ' + (won && newBest ? "sw-dance" : "sw-hop") + '">' + petArt(won ? "excited" : "happy") + "</div></div>";
      endGame("q", first, "Deep sea treasure", function () {
        return score + " points!";
      }, function (r, t) {
        return r + " of " + t + " on the first try · best combo ×" + bestCombo;
      }, function () {
        startDeep(gameWords(readState(), 8));
      }, extra, null);
    }
    function speed() {
      return W * (0.11 + 0.012 * lvl);
    }
    function burst(x, y, cols, n, sp) {
      var now = Date.now(),
        q;
      for (q = 0; q < n; q++) {
        var a = rnd() * 6.283,
          s = sp * (0.4 + rnd());
        fx.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: now, c: cols[q % cols.length], r: 2 + rnd() * 2.6 });
      }
    }
    // a new line of treasure for the word in hand
    function spawn() {
      var r = rounds[i],
        k = wkey(r.w),
        others = r.opts
          .filter(function (w) {
            return wkey(w) !== k;
          })
          .slice(0, help > 0 ? 1 : 2),
        list = shuffle([{ w: r.w, target: true }].concat(
          others.map(function (w) {
            return { w: w, target: false };
          })
        ), rnd),
        n = list.length,
        lanes = shuffle(n === 2 ? [0.3, 0.7] : [0.2, 0.5, 0.8], rnd),
        j;
      if (help > 0) help--;
      items = list.map(function (it, q) {
        return { w: it.w, target: it.target, x: W + CH * 0.9 + q * W * 0.15, y0: H * lanes[q], y: H * lanes[q], ph: rnd() * 6.283, flash: 0, open: 0, done: false, lock: 0 };
      });
      jellies = [];
      var nj = lvl < 2 ? 1 : lvl < 5 ? 2 : 3;
      for (j = 0; j < nj; j++)
        jellies.push({ x: W + CH * 0.9 + W * 0.075 + j * W * 0.13, y0: H * (0.18 + rnd() * 0.64), amp: H * (0.07 + rnd() * 0.06), om: 0.7 + rnd() * 0.5, ph: rnd() * 6.283, y: 0 });
      cur = { r: r, k: k };
      setTimeout(function () {
        if (alive() && cur && cur.r === r) play("w", r.w);
      }, 350);
    }
    function wave(ok) {
      wait = 1.3;
      if (ok) {
        i++;
        if (i >= rounds.length) {
          done = true;
          setTimeout(function () {
            if (my && run === my) finish();
          }, 1400);
        }
      }
      cur = null;
    }
    function got(it, now) {
      var k = cur.k;
      if (first[k] === undefined) first[k] = true;
      lastWrong = tries > 0;
      if (tries === 0) {
        lvl = Math.min(8, lvl + 0.6);
        pace(true);
      }
      combo++;
      if (combo > bestCombo) bestCombo = combo;
      foundN++;
      var pts = 10 + Math.min(combo, 6) * 3;
      score += pts;
      it.open = now;
      it.done = true;
      texts.push({ x: it.x, y: it.y - CH * 0.9, t: now, s: "+" + pts, c: "#FFE066" });
      burst(it.x, it.y, ["#FFD23F", "#FFFFFF", "#FFB6D9", "#9EE7FF"], 26, 170);
      sfx("big");
      mood = "excited";
      say((combo >= 3 ? "Combo ×" + combo + "! " : "Treasure! ") + cur.r.w + (tries === 0 && combo >= 2 ? " · Faster!" : ""));
      try {
        if (hooks.burst && combo >= 3) {
          var br = cv.getBoundingClientRect();
          hooks.burst(br.left + it.x, br.top + it.y);
        }
      } catch (e) {}
      tries = 0;
      items.forEach(function (o) {
        if (o !== it) o.sink = now;
      });
      wave(true);
      hud();
    }
    function wrong(it, now) {
      first[cur.k] = false;
      tries++;
      combo = 0;
      lvl = Math.max(0, lvl - 0.8);
      if (tries >= 2 || lastWrong) help = 2;
      pace(false);
      it.flash = now;
      it.lock = now + 900;
      sfx("poke");
      mood = "happy";
      say("Not that one! Listen again. Slowing down a little.");
      var rr = cur.r;
      setTimeout(function () {
        if (alive() && cur && cur.r === rr) play("w", rr.w);
      }, 700);
      hud();
    }
    function missed(now) {
      first[cur.k] = false;
      tries++;
      combo = 0;
      lvl = Math.max(0, lvl - 0.8);
      help = 2;
      pace(false);
      say("It floated by! Listen again and swim to it.");
      var rr = cur.r;
      wave(false);
      setTimeout(function () {
        if (alive()) play("w", rr.w);
      }, 700);
      hud();
    }
    function zap(now) {
      lives--;
      hurt = now + 1500;
      shake = now + 400;
      lvl = Math.max(0, lvl - 0.4);
      sfx("poke");
      burst(PX, py, ["#FFB6D9", "#FFFFFF", "#9EE7FF"], 14, 120);
      texts.push({ x: PX, y: py - PR * 1.4, t: now, s: "Zap!", c: "#FFB6D9" });
      if (lives <= 0) {
        say("The air ran out!");
        cur = null;
        done = true;
        setTimeout(function () {
          if (my && run === my) finish();
        }, 1300);
      } else say("Ouch, a jellyfish! You lost some air.");
      hud();
    }
    function drawChest(it, ts) {
      var x = it.x,
        y = it.y,
        hint = tries >= 2 && it.target,
        blink = Math.sin(ts / 120) > 0,
        pw = CH * 1.4,
        ph = CH * 0.46,
        w = CH * 0.9,
        h = CH * 0.55,
        openAmt = it.open ? Math.min(1, (ts - it.open) / 250) : 0,
        sink = it.sink ? Math.min(1, (ts - it.sink) / 900) : 0;
      ctx.save();
      if (sink) {
        ctx.globalAlpha = 1 - sink;
        ctx.translate(0, sink * H * 0.15);
      }
      if (ts - it.flash < 350) ctx.translate(Math.sin(ts / 25) * 3, 0);
      if (hint) {
        var gl = ctx.createRadialGradient(x, y - CH * 0.3, CH * 0.2, x, y - CH * 0.3, CH * 1.4);
        gl.addColorStop(0, blink ? "rgba(255,240,120,.95)" : "rgba(255,214,64,.55)");
        gl.addColorStop(1, "rgba(255,214,64,0)");
        ctx.fillStyle = gl;
        ctx.beginPath();
        ctx.arc(x, y - CH * 0.3, CH * 1.4, 0, 6.283);
        ctx.fill();
      }
      ctx.fillStyle = "#B5762C";
      ctx.strokeStyle = "#6B3F18";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.rect(x - w / 2, y - h / 2 + h * 0.15, w, h * 0.85);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#C98F4E";
      ctx.beginPath();
      ctx.ellipse(x, y - h * 0.35 - openAmt * h * 0.5, w / 2, h * 0.42, 0, Math.PI, 6.283);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FFD23F";
      ctx.fillRect(x - w * 0.07, y - h * 0.05, w * 0.14, h * 0.4);
      if (openAmt) {
        ctx.fillStyle = "#FFE066";
        ctx.beginPath();
        ctx.ellipse(x, y - h * 0.2, w * 0.4, h * 0.2, 0, 0, 6.283);
        ctx.fill();
      }
      var px = x - pw / 2,
        pyy = y - h * 0.5 - ph - CH * 0.12;
      ctx.fillStyle = hint ? (blink ? "#FFF08A" : "#FFC400") : "#FFFFFF";
      ctx.strokeStyle = "#E5483A";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(px, pyy, pw, ph, 8);
      else ctx.rect(px, pyy, pw, ph);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1E2A4A";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var fs = Math.round(ph * 0.66);
      ctx.font = "700 " + fs + "px Fredoka, sans-serif";
      while (ctx.measureText(it.w).width > pw * 0.86 && fs > 8) {
        fs--;
        ctx.font = "700 " + fs + "px Fredoka, sans-serif";
      }
      ctx.fillText(it.w, x, pyy + ph / 2 + 1);
      ctx.restore();
    }
    function drawJelly(j, ts) {
      var r = CH * 0.36;
      ctx.save();
      ctx.translate(j.x, j.y);
      ctx.strokeStyle = "rgba(255,182,217,.9)";
      ctx.lineWidth = 2.6;
      ctx.lineCap = "round";
      for (var t = -2; t <= 2; t++) {
        ctx.beginPath();
        ctx.moveTo(t * r * 0.36, r * 0.2);
        ctx.quadraticCurveTo(t * r * 0.36 + Math.sin(ts / 200 + t) * 5, r * 1.1, t * r * 0.36 + Math.sin(ts / 170 + t * 2) * 4, r * 1.9);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,160,205,.92)";
      ctx.strokeStyle = "#E86AA6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.85, 0, Math.PI, 6.283);
      ctx.lineTo(r, r * 0.2);
      ctx.lineTo(-r, r * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.ellipse(-r * 0.35, -r * 0.4, r * 0.25, r * 0.12, -0.5, 0, 6.283);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#1E2A4A";
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.1, r * 0.09, 0, 6.283);
      ctx.arc(r * 0.3, -r * 0.1, r * 0.09, 0, 6.283);
      ctx.fill();
      ctx.restore();
    }
    function drawDiver(ts) {
      var x = PX,
        y = py,
        im = petImg(mood),
        blinkOut = ts < hurt && Math.sin(ts / 70) > 0;
      if (blinkOut) return;
      var tilt = Math.max(-0.4, Math.min(0.4, vy / (H * 2)));
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tilt);
      // the air tank and flippers
      ctx.fillStyle = "#3D8BF2";
      ctx.strokeStyle = "#1F5FB5";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-PR * 1.55, -PR * 0.5, PR * 0.8, PR * 1.1, 6);
      else ctx.rect(-PR * 1.55, -PR * 0.5, PR * 0.8, PR * 1.1);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FF8A3D";
      ctx.beginPath();
      ctx.ellipse(-PR * 1.1, PR * 0.95 + Math.sin(ts / 120) * 3, PR * 0.7, PR * 0.22, 0.3, 0, 6.283);
      ctx.fill();
      // the pet inside the helmet
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, PR, 0, 6.283);
      ctx.fillStyle = "#FFD9A8";
      ctx.fill();
      ctx.clip();
      if (im && im.complete && im.naturalWidth) {
        var dw = PR * 2 * 1.55,
          dh = dw * (428 / 288);
        ctx.drawImage(im, -dw / 2, -dh * 0.325, dw, dh);
      }
      ctx.restore();
      ctx.fillStyle = "rgba(190,235,255,.28)";
      ctx.beginPath();
      ctx.arc(0, 0, PR, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = "#CFEFFF";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, PR + 1, 0, 6.283);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.8)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, PR * 0.78, 3.6, 4.5);
      ctx.stroke();
      ctx.restore();
    }
    function draw() {
      if (!alive() || !ctx) return;
      var ts = Date.now(),
        dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      clock += dt;
      // steering
      if (keys.u) ty -= H * 0.8 * dt;
      if (keys.d) ty += H * 0.8 * dt;
      ty = Math.max(PR * 1.2, Math.min(H - PR * 1.5, ty));
      var oy = py;
      py += (ty - py) * Math.min(1, dt * 8);
      vy = dt > 0 ? (py - oy) / dt : 0;
      if (!cur && !done) {
        wait -= dt;
        if (wait <= 0 && i < rounds.length) spawn();
      }
      var sp = speed();
      if (cur) {
        items.forEach(function (it) {
          it.x -= sp * dt;
          it.y = it.y0 + Math.sin(clock * 1.3 + it.ph) * H * 0.012;
          if (it.done || it.sink) return;
          if (it.x < W + CH * 0.2 && Math.abs(it.x - PX) < CH * 0.6 && Math.abs(it.y - py) < CH * 0.6) {
            if (it.target) got(it, ts);
            else if (ts > it.lock && Math.abs(vy) < H * 0.45) wrong(it, ts);
          }
        });
        if (cur) {
          var tg = items.filter(function (o) {
            return o.target;
          })[0];
          if (tg && tg.x < PX - CH * 1.1) missed(ts);
        }
        if (cur)
          jellies.forEach(function (j) {
            j.x -= sp * dt * 1.0;
            j.y = j.y0 + Math.sin(clock * j.om + j.ph) * j.amp;
            var dx = j.x - PX,
              dy = j.y - py;
            if (ts > hurt && dx * dx + dy * dy < Math.pow(CH * 0.34 + PR * 0.8, 2)) zap(ts);
          });
      }
      fx.forEach(function (p) {
        p.vy -= 40 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.98;
      });
      fx = fx.filter(function (p) {
        return ts - p.t < 800;
      });
      texts = texts.filter(function (t) {
        return ts - t.t < 1000;
      });
      bubbles.forEach(function (b) {
        b.y -= b.v * dt;
        b.x -= sp * 0.2 * dt;
        if (b.y < -6 || b.x < -6) {
          b.y = H + 6;
          b.x = rnd() * W;
        }
      });
      reef.forEach(function (r) {
        r.x -= sp * 0.5 * dt;
        if (r.x < -r.w) r.x += W + r.w * 2;
      });
      // drawing
      var bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#7FD6F0");
      bg.addColorStop(0.5, "#2C8FCB");
      bg.addColorStop(1, "#0B3B73");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,.07)";
      for (var rr = 0; rr < 4; rr++) {
        ctx.beginPath();
        ctx.moveTo(W * (0.1 + rr * 0.26), 0);
        ctx.lineTo(W * (0.18 + rr * 0.26), 0);
        ctx.lineTo(W * (0.05 + rr * 0.26), H);
        ctx.lineTo(W * (-0.1 + rr * 0.26), H);
        ctx.fill();
      }
      var sh = ts < shake ? Math.sin(ts / 20) * 3 : 0;
      ctx.save();
      ctx.translate(sh, 0);
      reef.forEach(function (r) {
        ctx.fillStyle = r.c;
        ctx.beginPath();
        ctx.moveTo(r.x, H);
        ctx.quadraticCurveTo(r.x + r.w * 0.2, H - r.h, r.x + r.w * 0.5, H - r.h * 0.6);
        ctx.quadraticCurveTo(r.x + r.w * 0.8, H - r.h * 1.1, r.x + r.w, H);
        ctx.fill();
      });
      ctx.fillStyle = "#E8C98A";
      ctx.fillRect(-4, H - H * 0.03, W + 8, H * 0.03);
      bubbles.forEach(function (b) {
        ctx.strokeStyle = "rgba(255,255,255,.55)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, 6.283);
        ctx.stroke();
      });
      items.forEach(function (it) {
        drawChest(it, ts);
      });
      jellies.forEach(function (j) {
        if (cur) drawJelly(j, ts);
      });
      drawDiver(ts);
      fx.forEach(function (p) {
        ctx.globalAlpha = Math.max(0, 1 - (ts - p.t) / 800);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      texts.forEach(function (t) {
        var age = (ts - t.t) / 1000;
        ctx.globalAlpha = Math.max(0, 1 - age);
        ctx.fillStyle = t.c;
        ctx.strokeStyle = "rgba(11,59,115,.92)";
        ctx.lineWidth = 4.5;
        ctx.lineJoin = "round";
        ctx.font = "700 " + Math.round(W * 0.07) + "px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(t.s, t.x, t.y - age * 30);
        ctx.fillText(t.s, t.x, t.y - age * 30);
        ctx.globalAlpha = 1;
      });
      if (!moved) {
        ctx.fillStyle = "rgba(255,255,255,.9)";
        ctx.font = "700 " + Math.round(W * 0.042) + "px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Drag up and down to swim · 上下拖动游泳", W / 2, H * 0.94);
      }
      ctx.restore();
      raf = root.requestAnimationFrame ? root.requestAnimationFrame(draw) : null;
    }
    box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Deep sea treasure</span></div>' +
      '<div class="sw-card"><div class="sw-kind">Deep sea treasure</div><div class="sw-sent" style="font-size:22px">Swim to the treasure chest with the word you hear!</div>' +
      '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><div class="sw-mhud"><span class="sw-msc" id="swKsc"></span><span class="sw-mcb" id="swKcb"></span><span class="sw-spd" id="swKlv"></span></div>' +
      '<canvas class="sw-snk" id="swDeepCv"></canvas><div class="sw-msg" id="swMsg">Drag up and down to swim. Keep away from the jellyfish!</div></div>';
    bindQuit();
    cv = document.getElementById("swDeepCv");
    W = Math.max(280, Math.min(460, Math.floor((cv.parentNode.clientWidth || 340) - 56)));
    H = Math.round(W * 1.1);
    PX = Math.round(W * 0.2);
    PR = Math.round(W * 0.068);
    CH = Math.round(W * 0.15);
    py = ty = H / 2;
    var q;
    for (q = 0; q < 16; q++) bubbles.push({ x: rnd() * W, y: rnd() * H, v: 14 + rnd() * 30, r: 2 + rnd() * 4 });
    for (q = 0; q < 7; q++) reef.push({ x: (q * (W + 60)) / 6, w: W * (0.18 + rnd() * 0.12), h: H * (0.07 + rnd() * 0.08), c: q % 2 ? "#0F5A8F" : "#0B4777" });
    var dpr = root.devicePixelRatio || 1;
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    document.getElementById("swHear").onclick = function () {
      if (cur) play("w", cur.r.w);
      else if (rounds[i]) play("w", rounds[i].w);
    };
    var dragging = false;
    function steer(e) {
      var r = cv.getBoundingClientRect();
      ty = ((e.clientY - r.top) * H) / r.height;
      moved = true;
    }
    cv.addEventListener("pointerdown", function (e) {
      dragging = true;
      steer(e);
      try {
        cv.setPointerCapture(e.pointerId);
      } catch (e2) {}
    });
    cv.addEventListener("pointermove", function (e) {
      if (dragging) steer(e);
    });
    cv.addEventListener("pointerup", function () {
      dragging = false;
    });
    cv.addEventListener("pointercancel", function () {
      dragging = false;
    });
    keyH = function (e) {
      var c = e.keyCode;
      if (c === 38 || c === 87) keys.u = moved = true;
      if (c === 40 || c === 83) keys.d = moved = true;
      if ((c === 38 || c === 40) && e.preventDefault) e.preventDefault();
    };
    keyU = function (e) {
      var c = e.keyCode;
      if (c === 38 || c === 87) keys.u = false;
      if (c === 40 || c === 83) keys.d = false;
    };
    document.addEventListener("keydown", keyH);
    document.addEventListener("keyup", keyU);
    my = run = { mode: "deep", steps: [], i: 0, first: first, rnd: seeded(1) };
    my.stop = function () {
      cleanup();
      my = null;
    };
    last = Date.now();
    hud();
    draw();
  }

  /* ---- Word dungeon (the challenge of stage 5): the pet explores a maze of rooms. Hear a word and walk to the treasure chest that has it. A ghost drifts about the maze
     (it sends you back to the start, nothing worse). Bigger mazes and a quicker ghost as the child gets it right, smaller ones and a gold hint as they miss ---- */
  var DUNKEY = "lef_dungeon_v1";
  function readDungeon() {
    var o = null;
    try {
      o = JSON.parse(ls.getItem(DUNKEY));
    } catch (e) {}
    o = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    return { best: +o.best || 0, chests: +o.chests || 0, lvl: o.lvl === undefined ? 1 : Math.max(0, Math.min(8, +o.lvl || 0)) };
  }
  function writeDungeon(o) {
    try {
      ls.setItem(DUNKEY, JSON.stringify(o));
    } catch (e) {}
  }
  function startDungeon(words) {
    gameTag = "game";
    trk("sw_game_start", "dungeon", "", "game");
    var pool = gamePool(learnedWords(readState()), words, firstLessonsWords(), 4),
      rounds = roundsFor(words, pool, seeded(Date.now() % 9973), 3),
      rnd = seeded((Date.now() % 5113) + 29),
      store = readDungeon(),
      lvl = store.lvl,
      first = {},
      i = 0,
      score = 0,
      combo = 0,
      bestCombo = 0,
      chestN = 0,
      tries = 0,
      lastWrong = false,
      help = 0,
      spdNote = "",
      done = false,
      cols = 5,
      rows = 6,
      CELL = 60,
      W = 340,
      H = 360,
      open = [],
      start = { c: 0, r: 0 },
      chests = [],
      ghost = null,
      pet = null,
      want = { x: 0, y: 0 },
      ghostCells = [],
      ptr = null,
      keys = {},
      keyH = null,
      keyU = null,
      imgs = {},
      fx = [],
      texts = [],
      cur = null,
      grace = 0,
      shake = 0,
      wait = 0.2,
      moved = false,
      mood = "happy",
      last = 0,
      clock = 0,
      my = null,
      raf = null,
      cv = null,
      ctx = null,
      DIRS = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];
    function alive() {
      return !!my && run === my && !done;
    }
    function say(t) {
      var m = document.getElementById("swMsg");
      if (m) m.textContent = t;
    }
    function hud() {
      var a = document.getElementById("swKsc"),
        b = document.getElementById("swKcb"),
        c = document.getElementById("swKlv");
      if (a) a.textContent = "Score " + score;
      if (b) b.textContent = combo >= 2 ? "Combo ×" + combo + " 🔥" : "";
      if (c) c.textContent = "Room " + Math.min(i + 1, rounds.length) + " / " + rounds.length + spdNote;
    }
    function pace(up) {
      spdNote = up ? " 🐇" : " 🐢";
      setTimeout(function () {
        spdNote = "";
        if (alive()) hud();
      }, 1800);
    }
    function petImg(m) {
      if (imgs[m]) return imgs[m];
      var svg = petArt(m);
      if (!svg) return null;
      svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="288" height="428" ');
      var im = new Image();
      im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      imgs[m] = im;
      return im;
    }
    function cleanup() {
      done = true;
      if (raf && root.cancelAnimationFrame) root.cancelAnimationFrame(raf);
      if (keyH) document.removeEventListener("keydown", keyH);
      if (keyU) document.removeEventListener("keyup", keyU);
      keyH = keyU = null;
    }
    function finish() {
      cleanup();
      var newBest = score > store.best;
      store.best = Math.max(store.best, score);
      store.chests += chestN;
      store.lvl = lvl;
      writeDungeon(store);
      var extra = '<div class="sw-fcount">' + (newBest ? "New best score! " : "Best score: " + store.best + ". ") + "Chests opened in all: " + store.chests + '</div><div class="sw-stage"><div class="sw-pet sw-pets ' + (newBest ? "sw-dance" : "sw-hop") + '">' + petArt(newBest ? "excited" : "happy") + "</div></div>";
      endGame("g", first, "Word dungeon", function () {
        return score + " points!";
      }, function (r, t) {
        return r + " of " + t + " on the first try · best combo ×" + bestCombo;
      }, function () {
        startDungeon(gameWords(readState(), 8));
      }, extra, null);
    }
    function layout() {
      var dpr = root.devicePixelRatio || 1;
      cols = lvl < 3 ? 5 : lvl < 6 ? 6 : 7;
      rows = cols + 1;
      CELL = Math.floor(W / cols);
      H = CELL * rows;
      cv.style.width = CELL * cols + "px";
      cv.style.height = H + "px";
      cv.width = Math.round(CELL * cols * dpr);
      cv.height = Math.round(H * dpr);
      ctx = cv.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function nbrs(c, r) {
      var out = [];
      DIRS.forEach(function (d, n) {
        if (open[r][c] & d[2]) out.push({ c: c + d[0], r: r + d[1], n: n });
      });
      return out;
    }
    function dists(c0, r0) {
      var d = [],
        q = [[c0, r0]],
        x,
        y;
      for (y = 0; y < rows; y++) {
        d.push([]);
        for (x = 0; x < cols; x++) d[y].push(-1);
      }
      d[r0][c0] = 0;
      while (q.length) {
        var p = q.shift();
        nbrs(p[0], p[1]).forEach(function (n) {
          if (d[n.r][n.c] < 0) {
            d[n.r][n.c] = d[p[1]][p[0]] + 1;
            q.push([n.c, n.r]);
          }
        });
      }
      return d;
    }
    function carve() {
      var x,
        y,
        seen = [];
      open = [];
      for (y = 0; y < rows; y++) {
        open.push([]);
        seen.push([]);
        for (x = 0; x < cols; x++) {
          open[y].push(0);
          seen[y].push(false);
        }
      }
      var stack = [[Math.floor(cols / 2), rows - 1]];
      seen[rows - 1][Math.floor(cols / 2)] = true;
      while (stack.length) {
        var t = stack[stack.length - 1],
          opts = [];
        DIRS.forEach(function (d) {
          var nx = t[0] + d[0],
            ny = t[1] + d[1];
          if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && !seen[ny][nx]) opts.push([nx, ny, d]);
        });
        if (!opts.length) {
          stack.pop();
          continue;
        }
        var o = opts[Math.floor(rnd() * opts.length)];
        open[t[1]][t[0]] |= o[2][2];
        open[o[1]][o[0]] |= o[2][3];
        seen[o[1]][o[0]] = true;
        stack.push([o[0], o[1]]);
      }
      // a few extra doors, so there are loops to run round
      var extra = Math.round(cols * rows * 0.05);
      while (extra-- > 0) {
        var ex = Math.floor(rnd() * cols),
          ey = Math.floor(rnd() * rows),
          d2 = DIRS[Math.floor(rnd() * 4)],
          fx2 = ex + d2[0],
          fy2 = ey + d2[1];
        if (fx2 >= 0 && fy2 >= 0 && fx2 < cols && fy2 < rows) {
          open[ey][ex] |= d2[2];
          open[fy2][fx2] |= d2[3];
        }
      }
      start = { c: Math.floor(cols / 2), r: rows - 1 };
    }
    // a new room for the word in hand
    function enter() {
      var r = rounds[i],
        k = wkey(r.w),
        others = r.opts
          .filter(function (w) {
            return wkey(w) !== k;
          })
          .slice(0, help > 0 ? 1 : 2),
        list = shuffle([{ w: r.w, target: true }].concat(
          others.map(function (w) {
            return { w: w, target: false };
          })
        ), rnd);
      if (help > 0) help--;
      layout();
      carve();
      var d = dists(start.c, start.r),
        maxd = 0,
        cells = [],
        x,
        y;
      for (y = 0; y < rows; y++)
        for (x = 0; x < cols; x++) {
          if (d[y][x] > maxd) maxd = d[y][x];
          cells.push({ c: x, r: y, d: d[y][x] });
        }
      // the chests sit at dead ends, so walking past one never opens it by accident
      var ends = shuffle(
          cells.filter(function (q) {
            return q.d >= 3 && nbrs(q.c, q.r).length === 1;
          }),
          rnd
        ),
        far = ends.concat(
          shuffle(
            cells.filter(function (q) {
              return q.d >= Math.max(3, maxd * 0.45) && ends.indexOf(q) < 0;
            }),
            rnd
          )
        );
      chests = [];
      far.forEach(function (q) {
        if (chests.length >= list.length) return;
        var okSpot = chests.every(function (o) {
          return Math.abs(o.c - q.c) + Math.abs(o.r - q.r) >= 3;
        });
        if (okSpot) chests.push({ c: q.c, r: q.r, w: list[chests.length].w, target: list[chests.length].target, flash: 0, open: 0 });
      });
      // (a tiny maze might not have room for them all)
      while (chests.length < list.length) {
        var q2 = far[chests.length] || cells[Math.floor(rnd() * cells.length)];
        chests.push({ c: q2.c, r: q2.r, w: list[chests.length].w, target: list[chests.length].target, flash: 0, open: 0 });
      }
      var gc = shuffle(
        cells.filter(function (q) {
          return q.d >= maxd * 0.5 && !chests.some(function (o) {
            return o.c === q.c && o.r === q.r;
          });
        }),
        rnd
      )[0] || cells[0];
      ghostCells = shuffle(
        cells.filter(function (q) {
          return q.d >= maxd * 0.5 && !chests.some(function (o) {
            return o.c === q.c && o.r === q.r;
          });
        }),
        rnd
      );
      ghost = { c: gc.c, r: gc.r, nc: gc.c, nr: gc.r, t: 1, last: -1, hc: gc.c, hr: gc.r };
      pet = { c: start.c, r: start.r, nc: start.c, nr: start.r, t: 1, moving: false };
      cur = { r: r, k: k };
      grace = 2.2;
      fx = [];
      setTimeout(function () {
        if (alive() && cur && cur.r === r) play("w", r.w);
      }, 350);
    }
    function dirOf(wx, wy) {
      for (var n = 0; n < 4; n++) if (DIRS[n][0] === wx && DIRS[n][1] === wy) return n;
      return -1;
    }
    function ghostStep(dt) {
      var spd = 0.8 + lvl * 0.12;
      if (ghost.t >= 1) {
        ghost.c = ghost.nc;
        ghost.r = ghost.nr;
        var opts = nbrs(ghost.c, ghost.r),
          fwd = opts.filter(function (o) {
            return o.n !== ((ghost.last + 2) % 4);
          });
        if (fwd.length) opts = fwd;
        var pick;
        if (rnd() < 0.03 * lvl && pet) {
          var best = 1e9;
          opts.forEach(function (o) {
            var dd = Math.abs(o.c - pet.c) + Math.abs(o.r - pet.r);
            if (dd < best) {
              best = dd;
              pick = o;
            }
          });
        } else pick = opts[Math.floor(rnd() * opts.length)];
        if (pick) {
          ghost.nc = pick.c;
          ghost.nr = pick.r;
          ghost.last = pick.n;
          ghost.t = 0;
        }
      }
      if (ghost.t < 1) ghost.t = Math.min(1, ghost.t + dt * spd);
    }
    function pos(o) {
      return { x: (o.c + (o.nc - o.c) * Math.min(1, o.t) + 0.5) * CELL, y: (o.r + (o.nr - o.r) * Math.min(1, o.t) + 0.5) * CELL };
    }
    function arrive() {
      for (var q = 0; q < chests.length; q++) {
        var ch = chests[q];
        if (ch.c === pet.c && ch.r === pet.r && !ch.done) {
          var now = Date.now();
          if (ch.target) openChest(ch, now);
          else wrongChest(ch, now);
          return;
        }
      }
    }
    function openChest(ch, now) {
      var k = cur.k;
      if (first[k] === undefined) first[k] = true;
      lastWrong = tries > 0;
      if (tries === 0) {
        lvl = Math.min(8, lvl + 0.6);
        pace(true);
      }
      combo++;
      if (combo > bestCombo) bestCombo = combo;
      chestN++;
      var pts = 10 + Math.min(combo, 6) * 3;
      score += pts;
      ch.open = now;
      ch.done = true;
      var p = pos(pet);
      texts.push({ x: p.x, y: p.y - CELL * 0.6, t: now, s: "+" + pts, c: "#FFE066" });
      for (var q = 0; q < 26; q++) {
        var a = rnd() * 6.283,
          sp = 70 + rnd() * 170;
        fx.push({ x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, t: now, c: ["#FFD23F", "#FF8A3D", "#fff", "#7EDD6B"][q % 4], r: 2 + rnd() * 2.4 });
      }
      sfx("big");
      mood = "excited";
      say((combo >= 3 ? "Combo ×" + combo + "! " : "Treasure! ") + cur.r.w + (tries === 0 && combo >= 2 ? " · Bigger maze!" : ""));
      try {
        if (hooks.burst && combo >= 3) {
          var br = cv.getBoundingClientRect();
          hooks.burst(br.left + p.x, br.top + p.y);
        }
      } catch (e) {}
      tries = 0;
      i++;
      cur = null;
      wait = 1.3;
      if (i >= rounds.length) {
        done = true;
        setTimeout(function () {
          if (my && run === my) finish();
        }, 1400);
      }
      hud();
    }
    function wrongChest(ch, now) {
      first[cur.k] = false;
      tries++;
      combo = 0;
      lvl = Math.max(0, lvl - 0.8);
      if (tries >= 2 || lastWrong) help = 2;
      pace(false);
      ch.flash = now;
      sfx("poke");
      mood = "happy";
      shake = now + 300;
      say("Not that chest! Listen again. Slowing down a little.");
      var rr = cur.r;
      setTimeout(function () {
        if (alive() && cur && cur.r === rr) play("w", rr.w);
      }, 700);
      hud();
    }
    function caught(now) {
      sfx("poke");
      shake = now + 350;
      var p = pos(pet);
      texts.push({ x: p.x, y: p.y - CELL * 0.6, t: now, s: "Boo!", c: "#FFFFFF" });
      pet = { c: start.c, r: start.r, nc: start.c, nr: start.r, t: 1, moving: false };
      var gn = ghostCells[Math.floor(rnd() * ghostCells.length)] || { c: ghost.hc, r: ghost.hr };
      ghost.c = ghost.nc = gn.c;
      ghost.r = ghost.nr = gn.r;
      ghost.t = 1;
      ghost.last = -1;
      grace = 2.5;
      say("The ghost sent you back to the start! Find the chest with the word.");
    }
    function petStep(dt) {
      var wx = want.x,
        wy = want.y,
        guard = 0;
      if (keys.l) {
        wx = -1;
        wy = 0;
      } else if (keys.r) {
        wx = 1;
        wy = 0;
      } else if (keys.u) {
        wx = 0;
        wy = -1;
      } else if (keys.d) {
        wx = 0;
        wy = 1;
      }
      var left = dt;
      while (left > 0 && guard++ < 4) {
        if (!pet.moving) {
          var n = dirOf(wx, wy);
          if (n < 0 || !(open[pet.r][pet.c] & DIRS[n][2])) return;
          pet.nc = pet.c + wx;
          pet.nr = pet.r + wy;
          pet.t = 0;
          pet.moving = true;
          moved = true;
        } else {
          // turning back half way is allowed
          if (wx === pet.c - pet.nc && wy === pet.r - pet.nr && (wx || wy)) {
            var oc = pet.c,
              or = pet.r;
            pet.c = pet.nc;
            pet.r = pet.nr;
            pet.nc = oc;
            pet.nr = or;
            pet.t = 1 - pet.t;
          }
        }
        var need = (1 - pet.t) / 4.4;
        if (left >= need) {
          left -= need;
          pet.c = pet.nc;
          pet.r = pet.nr;
          pet.t = 1;
          pet.moving = false;
          arrive();
          if (done || !cur) return;
        } else {
          pet.t += left * 4.4;
          left = 0;
        }
      }
    }
    function drawChest(ch, ts) {
      var x = ch.c * CELL,
        y = ch.r * CELL,
        hint = tries >= 2 && ch.target,
        blink = Math.sin(ts / 120) > 0,
        pw = CELL * 0.94,
        ph = CELL * 0.34,
        cx = x + CELL / 2,
        cy = y + CELL * 0.72,
        w = CELL * 0.62,
        h = CELL * 0.34,
        openAmt = ch.open ? Math.min(1, (ts - ch.open) / 250) : 0;
      ctx.save();
      if (ts - ch.flash < 350) ctx.translate(Math.sin(ts / 25) * 3, 0);
      if (hint) {
        var gl = ctx.createRadialGradient(cx, y + CELL * 0.5, CELL * 0.1, cx, y + CELL * 0.5, CELL * 0.8);
        gl.addColorStop(0, blink ? "rgba(255,240,120,.95)" : "rgba(255,214,64,.55)");
        gl.addColorStop(1, "rgba(255,214,64,0)");
        ctx.fillStyle = gl;
        ctx.beginPath();
        ctx.arc(cx, y + CELL * 0.5, CELL * 0.8, 0, 6.283);
        ctx.fill();
      }
      // the chest
      ctx.fillStyle = "#B5762C";
      ctx.strokeStyle = "#6B3F18";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.rect(cx - w / 2, cy - h / 2 + h * 0.18, w, h * 0.82);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#C98F4E";
      ctx.beginPath();
      ctx.ellipse(cx, cy - h * 0.32 - openAmt * h * 0.45, w / 2, h * 0.38, 0, Math.PI, 6.283);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FFD23F";
      ctx.fillRect(cx - w * 0.07, cy - h * 0.05, w * 0.14, h * 0.4);
      if (openAmt) {
        ctx.fillStyle = "#FFE066";
        ctx.beginPath();
        ctx.ellipse(cx, cy - h * 0.2, w * 0.4, h * 0.2, 0, 0, 6.283);
        ctx.fill();
      }
      // the word on a plate above it
      var px = cx - pw / 2,
        py = y + CELL * 0.04;
      ctx.fillStyle = hint ? (blink ? "#FFF08A" : "#FFC400") : "#FFFFFF";
      ctx.strokeStyle = "#E5483A";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 7);
      else ctx.rect(px, py, pw, ph);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1E2A4A";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var fs = Math.round(ph * 0.66);
      ctx.font = "700 " + fs + "px Fredoka, sans-serif";
      while (ctx.measureText(ch.w).width > pw * 0.86 && fs > 8) {
        fs--;
        ctx.font = "700 " + fs + "px Fredoka, sans-serif";
      }
      ctx.fillText(ch.w, cx, py + ph / 2 + 1);
      ctx.restore();
    }
    function draw() {
      if (!alive() || !ctx) return;
      var ts = Date.now(),
        dt = Math.min(0.05, (ts - last) / 1000),
        x,
        y;
      last = ts;
      clock += dt;
      if (!cur && !done) {
        wait -= dt;
        if (wait <= 0 && i < rounds.length) enter();
      }
      if (cur && pet) {
        petStep(dt);
        if (cur && ghost) {
          if (grace > 0) grace -= dt;
          if (moved) ghostStep(dt);
          var pp = pos(pet),
            gp = pos(ghost);
          if (grace <= 0 && Math.abs(pp.x - gp.x) + Math.abs(pp.y - gp.y) < CELL * 0.6) caught(ts);
        }
      }
      fx.forEach(function (p) {
        p.vy += 260 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      });
      fx = fx.filter(function (p) {
        return ts - p.t < 900;
      });
      texts = texts.filter(function (t) {
        return ts - t.t < 1000;
      });
      var Wc = CELL * cols,
        sh = ts < shake ? Math.sin(ts / 20) * 3 : 0;
      ctx.save();
      ctx.translate(sh, 0);
      // floor
      for (y = 0; y < rows; y++)
        for (x = 0; x < cols; x++) {
          ctx.fillStyle = (x + y) % 2 ? "#E6DDF6" : "#DDD1F0";
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        }
      // the way in
      ctx.fillStyle = "rgba(106,72,232,.18)";
      ctx.fillRect(start.c * CELL, start.r * CELL, CELL, CELL);
      // walls
      ctx.strokeStyle = "#4B3F72";
      ctx.lineWidth = Math.max(5, CELL * 0.1);
      ctx.lineCap = "round";
      ctx.beginPath();
      for (y = 0; y < rows; y++)
        for (x = 0; x < cols; x++) {
          var m = open[y][x],
            x0 = x * CELL,
            y0 = y * CELL;
          if (!(m & 1)) {
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + CELL, y0);
          }
          if (!(m & 8)) {
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0, y0 + CELL);
          }
          if (y === rows - 1 && !(m & 4)) {
            ctx.moveTo(x0, y0 + CELL);
            ctx.lineTo(x0 + CELL, y0 + CELL);
          }
          if (x === cols - 1 && !(m & 2)) {
            ctx.moveTo(x0 + CELL, y0);
            ctx.lineTo(x0 + CELL, y0 + CELL);
          }
        }
      ctx.stroke();
      chests.forEach(function (ch) {
        drawChest(ch, ts);
      });
      // the ghost
      if (ghost) {
        var g = pos(ghost),
          gr = CELL * 0.3,
          bob = Math.sin(ts / 200) * 3;
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#8795B4";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(g.x, g.y + bob - gr * 0.2, gr, Math.PI, 6.283);
        ctx.lineTo(g.x + gr, g.y + bob + gr * 0.8);
        for (var w = 3; w >= 0; w--) ctx.lineTo(g.x + ((w - 1.5) * gr) / 1.5, g.y + bob + gr * (w % 2 ? 0.8 : 0.45));
        ctx.lineTo(g.x - gr, g.y + bob + gr * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#1E2A4A";
        ctx.beginPath();
        ctx.arc(g.x - gr * 0.38, g.y + bob - gr * 0.2, gr * 0.14, 0, 6.283);
        ctx.arc(g.x + gr * 0.38, g.y + bob - gr * 0.2, gr * 0.14, 0, 6.283);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      // the pet
      if (pet) {
        var pp2 = pos(pet),
          pr = CELL * 0.34,
          im = petImg(mood);
        ctx.fillStyle = "rgba(30,20,60,.25)";
        ctx.beginPath();
        ctx.ellipse(pp2.x, pp2.y + pr * 0.95, pr * 0.8, pr * 0.22, 0, 0, 6.283);
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(pp2.x, pp2.y, pr, 0, 6.283);
        ctx.fillStyle = "#FFD9A8";
        ctx.fill();
        ctx.clip();
        if (im && im.complete && im.naturalWidth) {
          var dw = pr * 2 * 1.55,
            dh = dw * (428 / 288);
          ctx.drawImage(im, pp2.x - dw / 2, pp2.y - dh * 0.325, dw, dh);
        }
        ctx.restore();
        ctx.strokeStyle = "#8A5A2B";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(pp2.x, pp2.y, pr, 0, 6.283);
        ctx.stroke();
      }
      fx.forEach(function (p) {
        ctx.globalAlpha = Math.max(0, 1 - (ts - p.t) / 900);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      texts.forEach(function (t) {
        var age = (ts - t.t) / 1000;
        ctx.globalAlpha = Math.max(0, 1 - age);
        ctx.fillStyle = t.c;
        ctx.strokeStyle = "rgba(30,42,74,.92)";
        ctx.lineWidth = 4.5;
        ctx.lineJoin = "round";
        ctx.font = "700 " + Math.round(Wc * 0.07) + "px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(t.s, t.x, t.y - age * 30);
        ctx.fillText(t.s, t.x, t.y - age * 30);
        ctx.globalAlpha = 1;
      });
      if (!moved && cur) {
        ctx.fillStyle = "rgba(30,20,60,.8)";
        ctx.font = "700 " + Math.round(Wc * 0.04) + "px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Drag to walk · 拖动走路", Wc / 2, start.r * CELL - CELL * 0.1);
      }
      ctx.restore();
      raf = root.requestAnimationFrame ? root.requestAnimationFrame(draw) : null;
    }
    box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Word dungeon</span></div>' +
      '<div class="sw-card"><div class="sw-kind">Word dungeon</div><div class="sw-sent" style="font-size:22px">Find the treasure chest with the word you hear!</div>' +
      '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><div class="sw-mhud"><span class="sw-msc" id="swKsc"></span><span class="sw-mcb" id="swKcb"></span><span class="sw-spd" id="swKlv"></span></div>' +
      '<canvas class="sw-snk" id="swDunCv"></canvas><div class="sw-msg" id="swMsg">Drag to walk through the maze. Watch out for the ghost!</div></div>';
    bindQuit();
    cv = document.getElementById("swDunCv");
    W = Math.max(260, Math.min(420, Math.floor((cv.parentNode.clientWidth || 340) - 56)));
    layout();
    document.getElementById("swHear").onclick = function () {
      if (cur) play("w", cur.r.w);
      else if (rounds[i]) play("w", rounds[i].w);
    };
    function steer(e) {
      if (!pet) return;
      var r = cv.getBoundingClientRect(),
        px = ((e.clientX - r.left) * CELL * cols) / r.width,
        py = ((e.clientY - r.top) * H) / r.height,
        p = pos(pet),
        dx = px - p.x,
        dy = py - p.y;
      if (Math.abs(dx) < CELL * 0.25 && Math.abs(dy) < CELL * 0.25) {
        want = { x: 0, y: 0 };
        return;
      }
      if (Math.abs(dx) >= Math.abs(dy)) want = { x: dx > 0 ? 1 : -1, y: 0 };
      else want = { x: 0, y: dy > 0 ? 1 : -1 };
    }
    cv.addEventListener("pointerdown", function (e) {
      ptr = true;
      steer(e);
      try {
        cv.setPointerCapture(e.pointerId);
      } catch (e2) {}
    });
    cv.addEventListener("pointermove", function (e) {
      if (ptr) steer(e);
    });
    function release() {
      ptr = null;
      want = { x: 0, y: 0 };
    }
    cv.addEventListener("pointerup", release);
    cv.addEventListener("pointercancel", release);
    keyH = function (e) {
      var c = e.keyCode;
      if (c === 37 || c === 65) keys.l = true;
      if (c === 39 || c === 68) keys.r = true;
      if (c === 38 || c === 87) keys.u = true;
      if (c === 40 || c === 83) keys.d = true;
      if (c >= 37 && c <= 40 && e.preventDefault) e.preventDefault();
    };
    keyU = function (e) {
      var c = e.keyCode;
      if (c === 37 || c === 65) keys.l = false;
      if (c === 39 || c === 68) keys.r = false;
      if (c === 38 || c === 87) keys.u = false;
      if (c === 40 || c === 83) keys.d = false;
    };
    document.addEventListener("keydown", keyH);
    document.addEventListener("keyup", keyU);
    my = run = { mode: "dungeon", steps: [], i: 0, first: first, rnd: seeded(1) };
    my.stop = function () {
      cleanup();
      my = null;
    };
    last = Date.now();
    enter();
    hud();
    draw();
  }

  /* ---- Space shooter (the challenge of stage 4): fly your pet's rocket (drag to steer, it fires by itself) and shoot the saucer that carries the word you hear.
     Saucers drift down; one that gets through the target costs a shield heart. Faster and trickier as the child gets it right, gentler and with a gold hint as they miss ---- */
  var SPACEKEY = "lef_space_v1";
  function readSpace() {
    var o = null;
    try {
      o = JSON.parse(ls.getItem(SPACEKEY));
    } catch (e) {}
    o = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    return { best: +o.best || 0, boom: +o.boom || 0, lvl: o.lvl === undefined ? 1 : Math.max(0, Math.min(8, +o.lvl || 0)) };
  }
  function writeSpace(o) {
    try {
      ls.setItem(SPACEKEY, JSON.stringify(o));
    } catch (e) {}
  }
  function startSpace(words) {
    gameTag = "game";
    trk("sw_game_start", "space", "", "game");
    var pool = gamePool(learnedWords(readState()), words, firstLessonsWords(), 4),
      rounds = roundsFor(words, pool, seeded(Date.now() % 9973), 3),
      rnd = seeded((Date.now() % 4421) + 17),
      store = readSpace(),
      lvl = store.lvl,
      first = {},
      i = 0,
      score = 0,
      combo = 0,
      bestCombo = 0,
      boomN = 0,
      tries = 0,
      lastWrong = false,
      lives = 3,
      help = 0,
      spdNote = "",
      done = false,
      ufos = [],
      shots = [],
      stars = [],
      fx = [],
      texts = [],
      imgs = {},
      cur = null,
      mood = "happy",
      moved = false,
      keys = { l: false, r: false },
      keyH = null,
      keyU = null,
      sx = 0,
      tx = 0,
      fire = 0,
      shake = 0,
      wait = 0.5,
      last = 0,
      clock = 0,
      my = null,
      raf = null,
      cv = null,
      ctx = null,
      W = 340,
      H = 420,
      SY = 360,
      UW = 80,
      UH = 44,
      SAUCER = ["#6AA7FF", "#FF8FB1", "#FFC93C", "#35B779", "#B79BFF"];
    function alive() {
      return !!my && run === my && !done;
    }
    function say(t) {
      var m = document.getElementById("swMsg");
      if (m) m.textContent = t;
    }
    function hud() {
      var a = document.getElementById("swKsc"),
        b = document.getElementById("swKcb"),
        c = document.getElementById("swKlv");
      if (a) a.textContent = "Score " + score;
      if (b) b.textContent = combo >= 2 ? "Combo ×" + combo + " 🔥" : "";
      if (c) c.innerHTML = '<span style="color:#E5483A">' + new Array(lives + 1).join("♥") + '</span><span style="color:#B9C4D8">' + new Array(4 - lives).join("♥") + "</span>" + spdNote;
    }
    function pace(up) {
      spdNote = up ? " 🐇" : " 🐢";
      setTimeout(function () {
        spdNote = "";
        if (alive()) hud();
      }, 1800);
    }
    function petImg(m) {
      if (imgs[m]) return imgs[m];
      var svg = petArt(m);
      if (!svg) return null;
      svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="288" height="428" ');
      var im = new Image();
      im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      imgs[m] = im;
      return im;
    }
    function cleanup() {
      done = true;
      if (raf && root.cancelAnimationFrame) root.cancelAnimationFrame(raf);
      if (keyH) document.removeEventListener("keydown", keyH);
      if (keyU) document.removeEventListener("keyup", keyU);
      keyH = keyU = null;
    }
    function finish() {
      cleanup();
      var newBest = score > store.best;
      store.best = Math.max(store.best, score);
      store.boom += boomN;
      store.lvl = lvl;
      writeSpace(store);
      var won = lives > 0;
      var extra = '<div class="sw-fcount">' + (won ? "Mission complete! " : "The shield is gone, but good try! ") + (newBest ? "New best score! " : "Best score: " + store.best + ". ") + "Saucers zapped in all: " + store.boom + '</div><div class="sw-stage"><div class="sw-pet sw-pets ' + (won && newBest ? "sw-dance" : "sw-hop") + '">' + petArt(won ? "excited" : "happy") + "</div></div>";
      endGame("p", first, "Space shooter", function () {
        return score + " points!";
      }, function (r, t) {
        return r + " of " + t + " on the first try · best combo ×" + bestCombo;
      }, function () {
        startSpace(gameWords(readState(), 8));
      }, extra, null);
    }
    function burst(x, y, cols, n, sp) {
      var now = Date.now(),
        q;
      for (q = 0; q < n; q++) {
        var a = rnd() * 6.283,
          s = sp * (0.4 + rnd());
        fx.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: now, c: cols[q % cols.length], r: 2 + rnd() * 2.6 });
      }
    }
    // a new wave of saucers for the word in hand
    function spawn() {
      var r = rounds[i],
        k = wkey(r.w),
        others = r.opts
          .filter(function (w) {
            return wkey(w) !== k;
          })
          .slice(0, help > 0 ? 1 : 2),
        list = shuffle([{ w: r.w, target: true }].concat(
          others.map(function (w) {
            return { w: w, target: false };
          })
        ), rnd),
        n = list.length,
        order = shuffle([0, 1, 2].slice(0, n), rnd);
      if (help > 0) help--;
      ufos = list.map(function (it, j) {
        var lane = W * (n === 2 ? 0.3 + 0.4 * j : 0.2 + 0.3 * j);
        return { w: it.w, target: it.target, x0: lane, x: lane, y: UH * 0.7 + order[j] * UH * 0.35, ph: rnd() * 6.283, c: SAUCER[(j + i) % SAUCER.length], flash: 0, dead: 0, bump: 0 };
      });
      cur = { r: r, k: k, ready: false, cd: null };
      setTimeout(function () {
        if (alive() && cur && cur.r === r) play("w", r.w);
      }, 350);
    }
    function fall() {
      return H * (0.05 + 0.0085 * lvl);
    }
    function wave(ok) {
      // the wave is over: move on (or try the same word again)
      wait = 1.2;
      if (ok) {
        i++;
        cur = null;
        if (i >= rounds.length) {
          done = true;
          setTimeout(function () {
            if (my && run === my) finish();
          }, 1400);
        }
      } else {
        cur = null;
      }
    }
    function hitTarget(u, now) {
      var k = cur.k;
      if (first[k] === undefined) first[k] = true;
      lastWrong = tries > 0;
      if (tries === 0) {
        lvl = Math.min(8, lvl + 0.6);
        pace(true);
      }
      combo++;
      if (combo > bestCombo) bestCombo = combo;
      boomN++;
      var pts = 10 + Math.min(combo, 6) * 3;
      score += pts;
      u.dead = now;
      texts.push({ x: u.x, y: u.y - UH * 0.8, t: now, s: "BOOM! +" + pts, c: "#FFE066" });
      burst(u.x, u.y, ["#FFD23F", "#FF8A3D", "#fff", "#E5483A", u.c], 26, 190);
      sfx("big");
      mood = "excited";
      shake = now + 260;
      say((combo >= 3 ? "Combo ×" + combo + "! " : "Zap! ") + cur.r.w + (tries === 0 && combo >= 2 ? " · Faster!" : ""));
      try {
        if (hooks.burst && combo >= 3) {
          var br = cv.getBoundingClientRect();
          hooks.burst(br.left + u.x, br.top + u.y);
        }
      } catch (e) {}
      tries = 0;
      ufos.forEach(function (o) {
        if (!o.dead) o.dead = -now; // the others zoom off
      });
      wave(true);
      hud();
    }
    function hitWrong(u, now) {
      first[cur.k] = false;
      tries++;
      combo = 0;
      lvl = Math.max(0, lvl - 0.8);
      if (tries >= 2 || lastWrong) help = 2;
      pace(false);
      u.flash = now;
      u.bump = H * 0.05;
      sfx("poke");
      mood = "happy";
      say("Not that one! Listen again. Slowing down a little.");
      var rr = cur.r;
      setTimeout(function () {
        if (alive() && cur && cur.r === rr) play("w", rr.w);
      }, 700);
      hud();
    }
    function lostLife(now) {
      first[cur.k] = false;
      lives--;
      combo = 0;
      tries++;
      lvl = Math.max(0, lvl - 0.8);
      help = 2;
      pace(false);
      shake = now + 500;
      sfx("poke");
      mood = "happy";
      ufos.forEach(function (o) {
        if (!o.dead) o.dead = -now;
      });
      burst(sx, SY, ["#FF8A3D", "#E5483A", "#fff"], 16, 140);
      if (lives <= 0) {
        say("The shield is gone!");
        cur = null;
        done = true;
        setTimeout(function () {
          if (my && run === my) finish();
        }, 1300);
      } else {
        say("Oh no, the shield took a hit! Listen again and shoot it.");
        var rr = cur.r;
        wave(false);
        cur = null;
        wait = 1.3;
        setTimeout(function () {
          if (alive()) play("w", rr.w);
        }, 600);
      }
      hud();
    }
    function drawUfo(u, ts) {
      var x = u.x,
        y = u.y,
        gone = u.dead < 0 ? (ts - -u.dead) / 700 : 0,
        hint = tries >= 2 && u.target,
        blink = Math.sin(ts / 120) > 0,
        w = UW,
        h = UH;
      if (u.dead > 0) return;
      ctx.save();
      if (gone) {
        ctx.globalAlpha = Math.max(0, 1 - gone);
        ctx.translate(0, -gone * H * 0.2);
      }
      if (ts - u.flash < 350) ctx.translate(Math.sin(ts / 25) * 3, 0);
      if (hint) {
        var gl = ctx.createRadialGradient(x, y, h * 0.3, x, y, w * 0.95);
        gl.addColorStop(0, blink ? "rgba(255,240,120,.95)" : "rgba(255,214,64,.55)");
        gl.addColorStop(1, "rgba(255,214,64,0)");
        ctx.fillStyle = gl;
        ctx.beginPath();
        ctx.arc(x, y, w * 0.95, 0, 6.283);
        ctx.fill();
      }
      // dome with a little alien
      ctx.fillStyle = "rgba(190,235,255,.85)";
      ctx.beginPath();
      ctx.ellipse(x, y - h * 0.18, w * 0.22, h * 0.36, 0, Math.PI, 6.283);
      ctx.fill();
      ctx.fillStyle = "#7EDD6B";
      ctx.beginPath();
      ctx.arc(x, y - h * 0.2, w * 0.1, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = "#1E2A4A";
      ctx.beginPath();
      ctx.arc(x - w * 0.035, y - h * 0.22, w * 0.018, 0, 6.283);
      ctx.arc(x + w * 0.035, y - h * 0.22, w * 0.018, 0, 6.283);
      ctx.fill();
      // saucer body with the word
      ctx.fillStyle = hint ? (blink ? "#FFF08A" : "#FFC400") : ts - u.flash < 350 ? "#FFB3AA" : "#F4F7FC";
      ctx.strokeStyle = u.c;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(x, y + h * 0.05, w * 0.5, h * 0.36, 0, 0, 6.283);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = u.c;
      [-0.34, 0, 0.34].forEach(function (d, n) {
        ctx.beginPath();
        ctx.arc(x + d * w, y + h * 0.36 + (n === 1 ? 2 : 0) - Math.abs(d) * 6, 3, 0, 6.283);
        ctx.fill();
      });
      ctx.fillStyle = "#1E2A4A";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var fs = Math.round(h * 0.46);
      ctx.font = "700 " + fs + "px Fredoka, sans-serif";
      while (ctx.measureText(u.w).width > w * 0.7 && fs > 8) {
        fs--;
        ctx.font = "700 " + fs + "px Fredoka, sans-serif";
      }
      ctx.fillText(u.w, x, y + h * 0.07);
      ctx.restore();
    }
    function drawShip(ts) {
      var R = W * 0.075,
        x = sx,
        y = SY,
        im = petImg(mood);
      // flame
      ctx.fillStyle = Math.sin(ts / 60) > 0 ? "#FFB703" : "#FF7A1F";
      ctx.beginPath();
      ctx.moveTo(x - R * 0.42, y + R * 1.05);
      ctx.lineTo(x, y + R * (1.9 + 0.35 * Math.sin(ts / 45)));
      ctx.lineTo(x + R * 0.42, y + R * 1.05);
      ctx.fill();
      // fins
      ctx.fillStyle = "#E5483A";
      ctx.beginPath();
      ctx.moveTo(x - R * 0.7, y + R * 0.2);
      ctx.lineTo(x - R * 1.3, y + R * 1.2);
      ctx.lineTo(x - R * 0.55, y + R * 1.0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + R * 0.7, y + R * 0.2);
      ctx.lineTo(x + R * 1.3, y + R * 1.2);
      ctx.lineTo(x + R * 0.55, y + R * 1.0);
      ctx.fill();
      // body
      ctx.fillStyle = "#F4F7FC";
      ctx.strokeStyle = "#8795B4";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x, y - R * 1.7);
      ctx.bezierCurveTo(x + R * 1.0, y - R * 0.9, x + R * 0.85, y + R * 0.5, x + R * 0.6, y + R * 1.1);
      ctx.lineTo(x - R * 0.6, y + R * 1.1);
      ctx.bezierCurveTo(x - R * 0.85, y + R * 0.5, x - R * 1.0, y - R * 0.9, x, y - R * 1.7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#E5483A";
      ctx.beginPath();
      ctx.moveTo(x, y - R * 1.7);
      ctx.bezierCurveTo(x + R * 0.38, y - R * 1.4, x + R * 0.55, y - R * 1.1, x + R * 0.6, y - R * 0.95);
      ctx.lineTo(x - R * 0.6, y - R * 0.95);
      ctx.bezierCurveTo(x - R * 0.55, y - R * 1.1, x - R * 0.38, y - R * 1.4, x, y - R * 1.7);
      ctx.fill();
      // the pet in the window
      var pr = R * 0.62;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y - R * 0.1, pr, 0, 6.283);
      ctx.fillStyle = "#FFD9A8";
      ctx.fill();
      ctx.clip();
      if (im && im.complete && im.naturalWidth) {
        var dw = pr * 2 * 1.55,
          dh = dw * (428 / 288);
        ctx.drawImage(im, x - dw / 2, y - R * 0.1 - dh * 0.325, dw, dh);
      }
      ctx.restore();
      ctx.strokeStyle = "#6AA7FF";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y - R * 0.1, pr, 0, 6.283);
      ctx.stroke();
    }
    function draw() {
      if (!alive() || !ctx) return;
      var ts = Date.now(),
        dt = Math.min(0.05, (ts - last) / 1000),
        k;
      last = ts;
      clock += dt;
      // steering
      if (keys.l) tx -= W * 0.9 * dt;
      if (keys.r) tx += W * 0.9 * dt;
      tx = Math.max(W * 0.06, Math.min(W * 0.94, tx));
      sx += (tx - sx) * Math.min(1, dt * 12);
      // waves
      if (!cur && !done) {
        wait -= dt;
        if (wait <= 0 && i < rounds.length) spawn();
      }
      var fy = fall();
      ufos.forEach(function (u) {
        if (u.dead) return;
        u.y += fy * dt;
        if (u.bump > 0) {
          var d = Math.min(u.bump, H * 0.3 * dt);
          u.y -= d;
          u.bump -= d;
        }
        var amp = W * Math.min(0.07, 0.01 + 0.008 * lvl);
        u.x = u.x0 + amp * Math.sin(clock * (0.8 + lvl * 0.12) + u.ph);
        if (cur && cur.ready && u.y > SY - UH * 0.4) {
          if (u.target && cur) lostLife(ts);
          else {
            u.dead = -ts;
            burst(u.x, SY, ["#9FB6CC", "#fff"], 8, 70);
          }
        }
      });
      if (cur && !cur.ready) {
        // every saucer is in view from the start; a short beat to see them, then the lasers begin
        if (cur.cd === null) cur.cd = 0.6;
        cur.cd -= dt;
        if (cur.cd <= 0) {
          cur.ready = true;
          fire = 0.2;
        }
      }
      ufos = ufos.filter(function (u) {
        return !(u.dead < 0 && ts - -u.dead > 700) && !(u.dead > 0 && ts - u.dead > 80);
      });
      // firing: a laser every so often while a wave is on
      fire -= dt;
      var seen = ufos.some(function (u) {
        return !u.dead && u.y > UH * 0.55;
      });
      if (fire <= 0 && cur && cur.ready && seen) {
        fire = 0.45;
        shots.push({ x: sx, y: SY - W * 0.12 });
        sfx("pew");
      }
      shots.forEach(function (s) {
        s.y -= H * 0.85 * dt;
        if (!cur || !cur.ready) return;
        ufos.forEach(function (u) {
          if (s.dead || u.dead) return;
          if (u.y > UH * 0.55 && Math.abs(s.x - u.x) < UW * 0.5 && Math.abs(s.y - u.y) < UH * 0.45) { // only a saucer you can see (and read) can be hit
            s.dead = true;
            if (u.target) hitTarget(u, ts);
            else if (ts - u.flash > 600) hitWrong(u, ts);
            else u.bump = Math.max(u.bump, H * 0.02);
          }
        });
      });
      shots = shots.filter(function (s) {
        return !s.dead && s.y > -20;
      });
      fx.forEach(function (p) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.985;
        p.vy *= 0.985;
      });
      fx = fx.filter(function (p) {
        return ts - p.t < 800;
      });
      texts = texts.filter(function (t) {
        return ts - t.t < 1000;
      });
      stars.forEach(function (s) {
        s.y += s.v * dt * (1 + lvl * 0.05);
        if (s.y > H) {
          s.y = 0;
          s.x = rnd() * W;
        }
      });
      // drawing
      var bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#0E1240");
      bg.addColorStop(0.6, "#2B2A78");
      bg.addColorStop(1, "#5B3A9E");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      // a ringed planet and a moon
      ctx.fillStyle = "#FF8FB1";
      ctx.beginPath();
      ctx.arc(W * 0.84, H * 0.16, W * 0.075, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,230,160,.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(W * 0.84, H * 0.16, W * 0.13, W * 0.035, -0.3, 0, 6.283);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.85)";
      ctx.beginPath();
      ctx.arc(W * 0.12, H * 0.62, W * 0.035, 0, 6.283);
      ctx.fill();
      stars.forEach(function (s) {
        ctx.globalAlpha = s.a;
        ctx.fillStyle = "#fff";
        ctx.fillRect(s.x, s.y, s.r, s.r);
      });
      ctx.globalAlpha = 1;
      var sh = ts < shake ? Math.sin(ts / 20) * 3 : 0;
      ctx.save();
      ctx.translate(sh, 0);
      ufos.forEach(function (u) {
        drawUfo(u, ts);
      });
      shots.forEach(function (s) {
        ctx.fillStyle = "#FFE066";
        ctx.strokeStyle = "#FFB703";
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(s.x - 3, s.y - 10, 6, 20, 3);
        else ctx.rect(s.x - 3, s.y - 10, 6, 20);
        ctx.fill();
        ctx.stroke();
      });
      drawShip(ts);
      fx.forEach(function (p) {
        ctx.globalAlpha = Math.max(0, 1 - (ts - p.t) / 800);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      texts.forEach(function (t) {
        var age = (ts - t.t) / 1000;
        ctx.globalAlpha = Math.max(0, 1 - age);
        ctx.fillStyle = t.c;
        ctx.strokeStyle = "rgba(30,42,74,.92)";
        ctx.lineWidth = 4.5;
        ctx.lineJoin = "round";
        ctx.font = "700 " + Math.round(W * 0.07) + "px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(t.s, t.x, t.y - age * 34);
        ctx.fillText(t.s, t.x, t.y - age * 34);
        ctx.globalAlpha = 1;
      });
      if (!moved) {
        ctx.fillStyle = "rgba(255,255,255,.85)";
        ctx.font = "700 " + Math.round(W * 0.042) + "px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Drag to fly · it shoots by itself!", W / 2, SY - W * 0.28);
        ctx.fillText("拖动飞船 · 自动开火", W / 2, SY - W * 0.28 + W * 0.06);
      }
      ctx.restore();
      raf = root.requestAnimationFrame ? root.requestAnimationFrame(draw) : null;
    }
    box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Space shooter</span></div>' +
      '<div class="sw-card"><div class="sw-kind">Space shooter</div><div class="sw-sent" style="font-size:22px">Shoot the saucer with the word you hear!</div>' +
      '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><div class="sw-mhud"><span class="sw-msc" id="swKsc"></span><span class="sw-mcb" id="swKcb"></span><span class="sw-spd" id="swKlv"></span></div>' +
      '<canvas class="sw-snk" id="swSpaceCv"></canvas><div class="sw-msg" id="swMsg">Drag left and right. Your rocket fires by itself!</div></div>';
    bindQuit();
    cv = document.getElementById("swSpaceCv");
    W = Math.max(260, Math.min(440, Math.floor((cv.parentNode.clientWidth || 340) - 56)));
    H = Math.round(W * 1.2);
    SY = Math.round(H * 0.86);
    UW = Math.round(W * 0.27);
    UH = Math.round(UW * 0.56);
    sx = tx = W / 2;
    for (var q = 0; q < 46; q++) stars.push({ x: rnd() * W, y: rnd() * H, v: 10 + rnd() * 40, r: rnd() < 0.2 ? 2.4 : 1.4, a: 0.4 + rnd() * 0.6 });
    var dpr = root.devicePixelRatio || 1;
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    document.getElementById("swHear").onclick = function () {
      if (cur) play("w", cur.r.w);
      else if (rounds[i]) play("w", rounds[i].w);
    };
    function pos(e) {
      var r = cv.getBoundingClientRect();
      return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
    }
    var dragging = false;
    cv.addEventListener("pointerdown", function (e) {
      dragging = true;
      moved = true;
      tx = pos(e).x;
      try {
        cv.setPointerCapture(e.pointerId);
      } catch (e2) {}
    });
    cv.addEventListener("pointermove", function (e) {
      if (dragging || e.pointerType === "mouse") {
        tx = pos(e).x;
        if (dragging) moved = true;
      }
    });
    cv.addEventListener("pointerup", function () {
      dragging = false;
    });
    cv.addEventListener("pointercancel", function () {
      dragging = false;
    });
    keyH = function (e) {
      if (e.keyCode === 37 || e.keyCode === 65) keys.l = moved = true;
      if (e.keyCode === 39 || e.keyCode === 68) keys.r = moved = true;
    };
    keyU = function (e) {
      if (e.keyCode === 37 || e.keyCode === 65) keys.l = false;
      if (e.keyCode === 39 || e.keyCode === 68) keys.r = false;
    };
    document.addEventListener("keydown", keyH);
    document.addEventListener("keyup", keyU);
    my = run = { mode: "space", steps: [], i: 0, first: first, rnd: seeded(1) };
    my.stop = function () {
      cleanup();
      my = null;
    };
    last = Date.now();
    hud();
    draw();
  }

  /* ---- Castle siege (the challenge of stage 3): pull your pet back on the slingshot and let it fly at the towers of a castle. Each tower holds a sign with a word;
     hear a word and hit the sign that has it: the tower crumbles. A castle is a level (a few words); beat it to open the next one. The signs get smaller, the towers
     sway more and the aim help gets shorter as the levels go up and the child gets it right ---- */
  var SLINGKEY = "lef_sling_v1",
    CASTLES = [
      { n: "Wooden Fort", rounds: 4, sw: 0.2, sway: 0 },
      { n: "Stone Tower", rounds: 4, sw: 0.18, sway: 0.02 },
      { n: "Windy Keep", rounds: 5, sw: 0.17, sway: 0.035 },
      { n: "Royal Castle", rounds: 5, sw: 0.155, sway: 0.05 },
      { n: "Dragon's Castle", rounds: 6, sw: 0.14, sway: 0.06 },
    ];
  function readSling() {
    var o = null;
    try {
      o = JSON.parse(ls.getItem(SLINGKEY));
    } catch (e) {}
    o = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    return { done: o.done && typeof o.done === "object" ? o.done : {}, best: o.best && typeof o.best === "object" ? o.best : {}, lvl: o.lvl === undefined ? 1 : Math.max(0, Math.min(8, +o.lvl || 0)) };
  }
  function writeSling(o) {
    try {
      ls.setItem(SLINGKEY, JSON.stringify(o));
    } catch (e) {}
  }
  function castlesDone(o) {
    var n = 0;
    for (var k = 1; k <= CASTLES.length; k++) if (o.done[k]) n++;
    return n;
  }
  // the castles to choose from (a castle opens when the one before it has fallen)
  function showCastles() {
    trk("sw_view", "castles", "", "screen");
    var st = readSling(),
      h = '<div class="sw-top"><button class="sw-back" id="swClose">← Back</button></div><div class="sw-ttl"><span class="sw-aa">🏰</span><div><h1>Castle siege</h1><div class="sw-sub">' + castlesDone(st) + " of " + CASTLES.length + ' castles fallen · pull the pet back and hit the word!</div></div></div><div class="sw-aq">';
    CASTLES.forEach(function (c, n) {
      var open = n === 0 || st.done[n],
        won = !!st.done[n + 1];
      h += '<button class="sw-aqc sw-cas' + (open ? "" : " sw-aqno") + '" data-l="' + (n + 1) + '"' + (open ? "" : " disabled") + '><div class="sw-dgal">' + (won ? "🏳️" : open ? "🏰" : "🔒") + '</div><div class="sw-aqn">Level ' + (n + 1) + " · " + esc(c.n) + '</div><div class="sw-aqr" style="color:#6A48E8">' + (won ? "Fallen ✓ · best " + (st.best[n + 1] || 0) : open ? c.rounds + " words" : "Beat the one before") + "</div></button>";
    });
    box.innerHTML = h + "</div>";
    document.getElementById("swClose").onclick = showHome;
    Array.prototype.forEach.call(box.querySelectorAll(".sw-cas"), function (b) {
      b.onclick = function () {
        back = showCastles;
        startSling(+b.getAttribute("data-l"));
      };
    });
  }
  function startSling(level) {
    gameTag = "game";
    trk("sw_game_start", "siege", "level " + level, "game");
    var C = CASTLES[level - 1],
      words = gameWords(readState(), C.rounds),
      pool = gamePool(learnedWords(readState()), words, firstLessonsWords(), 4),
      rounds = roundsFor(words, pool, seeded(Date.now() % 9973), 2),
      rnd = seeded((Date.now() % 3181) + 53),
      store = readSling(),
      lvl = store.lvl,
      first = {},
      i = 0,
      score = 0,
      combo = 0,
      bestCombo = 0,
      shots = 0,
      tries = 0,
      fails = 0,
      lastWrong = false,
      help = 0,
      spdNote = "",
      done = false,
      cur = null,
      towers = [],
      ball = null,
      debris = [],
      parts = [],
      texts = [],
      imgs = {},
      mood = "happy",
      pull = null,
      wait = 0.4,
      last = 0,
      clock = 0,
      my = null,
      raf = null,
      cv = null,
      ctx = null,
      W = 340,
      H = 300,
      GY = 270,
      AX = 50,
      AY = 190,
      BR = 14,
      G = 500,
      KV = 6,
      RMAX = 60;
    function alive() {
      return !!my && run === my && !done;
    }
    function say(t) {
      var m = document.getElementById("swMsg");
      if (m) m.textContent = t;
    }
    function hud() {
      var a = document.getElementById("swGsc"),
        b = document.getElementById("swGcb"),
        c = document.getElementById("swGlv");
      if (a) a.textContent = "Score " + score;
      if (b) b.textContent = combo >= 2 ? "Combo ×" + combo + " 🔥" : "";
      if (c) c.textContent = "Tower " + Math.min(i + 1, rounds.length) + " / " + rounds.length + spdNote;
    }
    function pace(up) {
      spdNote = up ? " 🔼" : " 🔽";
      setTimeout(function () {
        spdNote = "";
        if (alive()) hud();
      }, 1800);
    }
    function petImg(m) {
      if (imgs[m]) return imgs[m];
      var svg = petArt(m);
      if (!svg) return null;
      svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="288" height="428" ');
      var im = new Image();
      im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      imgs[m] = im;
      return im;
    }
    function cleanup() {
      done = true;
      if (raf && root.cancelAnimationFrame) root.cancelAnimationFrame(raf);
    }
    function finish() {
      cleanup();
      var st = readSling(),
        newlyWon = !st.done[level];
      st.done[level] = 1;
      st.best[level] = Math.max(st.best[level] || 0, score);
      st.lvl = lvl;
      writeSling(st);
      var hasNext = level < CASTLES.length,
        extra = '<div class="sw-dbig sw-dpop">🏰💥</div><div class="sw-fcount">' + esc(C.n) + " has fallen!" + (newlyWon && hasNext ? " Level " + (level + 1) + " is open." : "") + " Castles fallen: " + castlesDone(st) + " / " + CASTLES.length + '</div>' +
          (hasNext ? '<button class="sw-go" id="swNextL">Next castle →</button>' : "") + '<div class="sw-stage"><div class="sw-pet sw-pets sw-hop">' + petArt("happy") + "</div></div>";
      endGame("c", first, "Castle siege · level " + level, function () {
        return score + " points!";
      }, function (r, t) {
        return r + " of " + t + " on the first try · " + shots + " shots";
      }, function () {
        startSling(level);
      }, extra, function () {
        var b = document.getElementById("swNextL");
        if (b)
          b.onclick = function () {
            back = showCastles;
            startSling(level + 1);
          };
      });
    }
    // ---- the towers of one round: three towers, each with a sign on top; the right one is the word we hear
    function newRound() {
      var r = rounds[i],
        k = wkey(r.w),
        others = r.opts
          .filter(function (w) {
            return wkey(w) !== k;
          })
          .slice(0, help > 0 ? 1 : 2),
        list = shuffle([{ w: r.w, target: true }].concat(
          others.map(function (w) {
            return { w: w, target: false };
          })
        ), rnd),
        n = list.length,
        hs = n === 2 ? [2, 4] : [1, 3, 5], // taller the further away, so no tower hides another's sign
        sw = W * Math.max(0.11, C.sw - 0.006 * lvl + 0.008 * (lvl < 2 ? 2 - lvl : 0)),
        bw = W * 0.075,
        bh = H * 0.075;
      if (help > 0) help--;
      towers = list.map(function (it, j) {
        var cx = W * (n === 2 ? 0.62 + 0.22 * j : 0.55 + (0.34 * j) / (n - 1)),
          nb = hs[j],
          t = { x0: cx, cx: cx, w: it.w, target: it.target, blocks: [], sign: null, ph: rnd() * 6.283, shake: 0, dead: false };
        for (var q = 0; q < nb; q++) t.blocks.push({ dx: 0, y: GY - bh * (q + 1), w: bw, h: bh, dead: false });
        t.sign = { dx: 0, y: GY - bh * nb - H * 0.075, w: sw, h: H * 0.075, dead: false };
        return t;
      });
      cur = { r: r, k: k };
      shots = shots;
      fails = 0;
      ball = null;
      setTimeout(function () {
        if (alive() && cur && cur.r === r) play("w", r.w);
      }, 350);
    }
    function sway(t) {
      var amp = W * (C.sway + 0.004 * lvl);
      return amp ? amp * Math.sin(clock * 1.1 + t.ph) : 0;
    }
    function nextBall() {
      ball = { x: AX, y: AY, vx: 0, vy: 0, fly: false, t: 0, rot: 0, stuck: 0, hitDone: false, hit: false };
      mood = "happy";
    }
    // does a shot with this speed get to (tx, ty) without knocking into another tower first?
    function pathClear(x, y, vx, vy, tx, ty, selfT) {
      var
        a = vx,
        b = vy,
        k;
      for (k = 0; k < 480; k++) {
        b += G * 0.01;
        x += a * 0.01;
        y += b * 0.01;
        for (var q = 0; q < towers.length; q++) {
          var t = towers[q];
          if (t.dead) continue;
          var off = sway(t),
            r = [];
          t.blocks.forEach(function (bl) {
            r.push([t.cx + off - bl.w / 2, bl.y, bl.w, bl.h]);
          });
          if (t !== selfT) r.push([t.cx + off - t.sign.w / 2, t.sign.y, t.sign.w, t.sign.h]);
          for (var w = 0; w < r.length; w++) {
            var cx = Math.max(r[w][0], Math.min(x, r[w][0] + r[w][2])),
              cy = Math.max(r[w][1], Math.min(y, r[w][1] + r[w][3]));
            if ((x - cx) * (x - cx) + (y - cy) * (y - cy) < BR * 0.8 * BR * 0.8) return false;
          }
        }
        if (x >= tx) return Math.abs(y - ty) < BR * 0.8;
        if (y > GY) return false;
      }
      return false;
    }
    // the pull that sends the ball through the middle of a tower's sign (a flat shot if the way is free, a lob over the others if not): the point to pull the ball back to, or null
    function solve(t) {
      var tx = t.cx + sway(t),
        ty = t.sign.y + t.sign.h / 2,
        vmax = KV * RMAX,
        dx = tx - AX,
        dy = AY - ty,
        deg,
        firstOk = null;
      if (dx <= 10) return null;
      for (deg = 38; deg <= 72; deg += 6) {
        var th = (deg * Math.PI) / 180,
          sx = AX,
          sy = AY,
          v = 0,
          it;
        // the ball leaves from the pulled-back point, which depends on how hard the pull is
        for (it = 0; it < 8; it++) {
          var ddx = tx - sx,
            ddy = sy - ty,
            den = 2 * Math.cos(th) * Math.cos(th) * (ddx * Math.tan(th) - ddy);
          if (den <= 0 || ddx <= 5) {
            v = 0;
            break;
          }
          v = Math.sqrt((G * ddx * ddx) / den);
          sx = AX - (v / KV) * Math.cos(th);
          sy = AY + (v / KV) * Math.sin(th);
        }
        if (!v || v > vmax * 0.98) continue;
        var res = { x: sx, y: sy, v: v, th: th };
        if (!firstOk) firstOk = res;
        if (pathClear(sx, sy, v * Math.cos(th), -v * Math.sin(th), tx, ty, t)) return res;
      }
      return firstOk;
    }
    function results(t, ok) {
      var k = cur.k,
        now = Date.now();
      if (ok) {
        if (first[k] === undefined) first[k] = true;
        lastWrong = tries > 0 || fails >= 3;
        if (tries === 0 && fails < 2) {
          lvl = Math.min(8, lvl + 0.6);
          pace(true);
        }
        combo++;
        if (combo > bestCombo) bestCombo = combo;
        var pts = 10 + Math.min(combo, 6) * 3 + (fails === 0 && tries === 0 ? 10 : 0);
        score += pts;
        collapse(t);
        texts.push({ x: t.cx + sway(t), y: t.sign.y, t: now, s: "+" + pts, c: "#FFE066" });
        sfx("bang");
        say((combo >= 3 ? "Combo ×" + combo + "! " : "Boom! ") + cur.r.w);
        try {
          if (hooks.burst && combo >= 3) {
            var br = cv.getBoundingClientRect();
            hooks.burst(br.left + t.cx, br.top + t.sign.y);
          }
        } catch (e) {}
        tries = 0;
        mood = "excited";
        i++;
        cur = null;
        if (i >= rounds.length) {
          // the whole castle falls
          towers.forEach(function (x) {
            if (!x.dead) collapse(x);
          });
          sfx("big");
          done = true;
          setTimeout(function () {
            if (my && run === my) finish();
          }, 1800);
        } else wait = 1.3;
        hud();
      } else {
        first[k] = false;
        tries++;
        combo = 0;
        lvl = Math.max(0, lvl - 0.8);
        if (tries >= 2 || lastWrong) help = 2;
        pace(false);
        t.shake = now;
        sfx("poke");
        mood = "surprised";
        say("Not that sign! Listen again. A little easier now.");
        var rr = cur.r;
        setTimeout(function () {
          if (alive() && cur && cur.r === rr) play("w", rr.w);
        }, 700);
        hud();
      }
    }
    function collapse(t) {
      t.dead = true;
      var now = Date.now(),
        x = t.cx + sway(t);
      t.blocks.forEach(function (b) {
        debris.push({ x: x, y: b.y, w: b.w, h: b.h, vx: (rnd() - 0.5) * 160, vy: -rnd() * 160, rot: 0, vr: (rnd() - 0.5) * 6, c: "#C98F4E", t: now });
      });
      debris.push({ x: x, y: t.sign.y, w: t.sign.w, h: t.sign.h, vx: (rnd() - 0.5) * 120, vy: -200, rot: 0, vr: (rnd() - 0.5) * 5, c: "#fff", w2: t.w, t: now });
      for (var q = 0; q < 18; q++) {
        var a = rnd() * 6.283,
          sp = 80 + rnd() * 180;
        parts.push({ x: x, y: t.sign.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 100, t: now, c: ["#FFD23F", "#FF8A3D", "#fff", "#C98F4E"][q % 4], r: 2 + rnd() * 3 });
      }
    }
    function hitRect(rx, ry, rw, rh) {
      var cx = Math.max(rx, Math.min(ball.x, rx + rw)),
        cy = Math.max(ry, Math.min(ball.y, ry + rh)),
        dx = ball.x - cx,
        dy = ball.y - cy,
        d2 = dx * dx + dy * dy;
      if (d2 > BR * BR) return null;
      var d = Math.sqrt(d2) || 0.001;
      return { nx: d2 ? dx / d : 0, ny: d2 ? dy / d : -1, pen: BR - d };
    }
    function bounce(h, e) {
      ball.x += h.nx * h.pen;
      ball.y += h.ny * h.pen;
      var vn = ball.vx * h.nx + ball.vy * h.ny;
      if (vn < 0) {
        ball.vx -= (1 + e) * vn * h.nx;
        ball.vy -= (1 + e) * vn * h.ny;
      }
    }
    function physics(dt) {
      var sub = 3,
        s;
      for (s = 0; s < sub; s++) {
        var d = dt / sub;
        ball.vy += G * d;
        ball.x += ball.vx * d;
        ball.y += ball.vy * d;
        if (ball.y > GY - BR) {
          ball.y = GY - BR;
          ball.vy *= -0.3;
          ball.vx *= 0.7;
          if (Math.abs(ball.vy) < 30) ball.vy = 0;
        }
        towers.forEach(function (t) {
          if (t.dead) return;
          var off = sway(t),
            hh;
          t.blocks.forEach(function (b) {
            if (b.dead) return;
            hh = hitRect(t.cx + off - b.w / 2, b.y, b.w, b.h);
            if (hh) bounce(hh, 0.35);
          });
          var sg = t.sign;
          hh = hitRect(t.cx + off - sg.w / 2, sg.y, sg.w, sg.h);
          if (hh && !ball.hitDone) {
            ball.hitDone = true;
            ball.hit = true;
            bounce(hh, 0.5);
            results(t, t.target);
          } else if (hh) bounce(hh, 0.3);
        });
      }
    }
    function drawBall(b, ts) {
      var im = petImg(mood),
        D = BR * 2;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.beginPath();
      ctx.arc(0, 0, BR, 0, 6.283);
      ctx.fillStyle = "#FFD9A8";
      ctx.fill();
      ctx.clip();
      if (im && im.complete && im.naturalWidth) {
        var dw = D * 1.55,
          dh = dw * (428 / 288);
        ctx.drawImage(im, -dw / 2, -dh * 0.325, dw, dh);
      }
      ctx.restore();
      ctx.strokeStyle = "#8A5A2B";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, BR, 0, 6.283);
      ctx.stroke();
    }
    function trajectory(vx, vy, upTo, colour) {
      var x = AX,
        y = AY,
        a = vx,
        b2 = vy,
        k,
        n = 0;
      ctx.fillStyle = colour;
      for (k = 0; k < 90 && n < upTo; k++) {
        b2 += G * 0.05;
        x += a * 0.05;
        y += b2 * 0.05;
        if (y > GY || x > W) break;
        if (k % 2 === 0) {
          ctx.beginPath();
          ctx.arc(x, y, 2.6, 0, 6.283);
          ctx.fill();
          n++;
        }
      }
    }
    function draw() {
      if (!cv || done) return;
      var ts = Date.now(),
        dt = Math.min(0.05, Math.max(0, (ts - last) / 1000)),
        k;
      last = ts;
      clock += dt;
      if (!cur && !done && wait > 0 && i < rounds.length) {
        wait -= dt;
        if (wait <= 0) {
          newRound();
          nextBall();
        }
      }
      if (ball && ball.fly) {
        ball.t += dt;
        physics(dt);
        ball.rot += ball.vx * dt * 0.02;
        var speed = Math.abs(ball.vx) + Math.abs(ball.vy);
        ball.stuck = speed < 40 && ball.t > 0.4 ? ball.stuck + dt : 0; // resting on the ground or on a tower
        if (ball.x > W + BR * 3 || ball.x < -BR * 3 || ball.stuck > 0.5 || ball.t > 6) {
          if (cur) {
            if (!ball.hit) {
              fails++;
              say(fails >= 3 ? "Follow the gold dots for a hint!" : "Missed! Pull back and try again.");
            }
            nextBall();
          } else ball = null;
        }
      }
      debris.forEach(function (d) {
        d.vy += G * 1.2 * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.rot += d.vr * dt;
        if (d.y > GY - d.h / 2) {
          d.y = GY - d.h / 2;
          d.vy *= -0.3;
          d.vx *= 0.6;
          d.vr *= 0.6;
        }
      });
      debris = debris.filter(function (d) {
        return ts - d.t < 2200;
      });
      parts.forEach(function (p) {
        p.vy += 500 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      });
      parts = parts.filter(function (p) {
        return ts - p.t < 900;
      });
      texts = texts.filter(function (t) {
        return ts - t.t < 1000;
      });
      // sky, sun, clouds, hills, ground
      var bg = ctx.createLinearGradient(0, 0, 0, GY);
      bg.addColorStop(0, "#6EC1F2");
      bg.addColorStop(1, "#DFF1FF");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#FFE066";
      ctx.beginPath();
      ctx.arc(W * 0.82, H * 0.14, W * 0.06, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.92)";
      [[0.25, 0.2, 1], [0.6, 0.12, 0.7]].forEach(function (cl, n) {
        var cx2 = ((cl[0] * W + ts * 0.005 * (n + 1)) % (W + 120)) - 60,
          cy2 = cl[1] * H;
        ctx.beginPath();
        ctx.ellipse(cx2, cy2, 30 * cl[2], 10 * cl[2], 0, 0, 6.283);
        ctx.ellipse(cx2 + 18 * cl[2], cy2 - 7 * cl[2], 18 * cl[2], 11 * cl[2], 0, 0, 6.283);
        ctx.fill();
      });
      ctx.fillStyle = "#A6DE87";
      ctx.beginPath();
      ctx.moveTo(0, GY);
      for (k = 0; k <= W; k += 8) ctx.lineTo(k, GY - 24 - 10 * Math.sin((k / W) * 5) - 6 * Math.sin((k / W) * 11));
      ctx.lineTo(W, GY);
      ctx.fill();
      ctx.fillStyle = "#79C96A";
      ctx.fillRect(0, GY, W, H - GY);
      // the towers
      towers.forEach(function (t) {
        if (t.dead) return;
        var off = sway(t),
          shk = ts - t.shake < 350 ? Math.sin(ts / 22) * 3 : 0;
        ctx.save();
        ctx.translate(off + shk, 0);
        t.blocks.forEach(function (b) {
          ctx.fillStyle = "#C98F4E";
          ctx.strokeStyle = "#8A5A2B";
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(t.cx - b.w / 2, b.y, b.w, b.h, 3);
          else ctx.rect(t.cx - b.w / 2, b.y, b.w, b.h);
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = "rgba(120,70,20,.35)";
          ctx.beginPath();
          ctx.moveTo(t.cx - b.w * 0.3, b.y + b.h * 0.35);
          ctx.lineTo(t.cx + b.w * 0.3, b.y + b.h * 0.35);
          ctx.moveTo(t.cx - b.w * 0.3, b.y + b.h * 0.7);
          ctx.lineTo(t.cx + b.w * 0.15, b.y + b.h * 0.7);
          ctx.stroke();
        });
        var sg = t.sign,
          hint = fails >= 3 && t.target,
          blink = Math.sin(ts / 120) > 0;
        if (hint) {
          var gl = ctx.createRadialGradient(t.cx, sg.y + sg.h / 2, sg.h * 0.3, t.cx, sg.y + sg.h / 2, sg.w * 0.9);
          gl.addColorStop(0, blink ? "rgba(255,240,120,.95)" : "rgba(255,214,64,.55)");
          gl.addColorStop(1, "rgba(255,214,64,0)");
          ctx.fillStyle = gl;
          ctx.beginPath();
          ctx.arc(t.cx, sg.y + sg.h / 2, sg.w * 0.9, 0, 6.283);
          ctx.fill();
        }
        ctx.fillStyle = hint ? (blink ? "#FFF08A" : "#FFC400") : "#FFFFFF";
        ctx.strokeStyle = "#E5483A";
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(t.cx - sg.w / 2, sg.y, sg.w, sg.h, 6);
        else ctx.rect(t.cx - sg.w / 2, sg.y, sg.w, sg.h);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#1E2A4A";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var fs = Math.round(sg.h * 0.66);
        ctx.font = "700 " + fs + "px Fredoka, sans-serif";
        while (ctx.measureText(t.w).width > sg.w * 0.88 && fs > 8) {
          fs--;
          ctx.font = "700 " + fs + "px Fredoka, sans-serif";
        }
        ctx.fillText(t.w, t.cx, sg.y + sg.h / 2 + 1);
        ctx.restore();
      });
      // the slingshot: a wooden Y with an elastic band (behind and in front of the pet)
      var FY = AY + 30,
        FT = AY - 22,
        FW = 22;
      function fork(side) {
        ctx.lineCap = "round";
        ctx.strokeStyle = "#6B3F18";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(AX, FY);
        ctx.lineTo(AX + side * FW, FT);
        ctx.stroke();
        ctx.strokeStyle = "#A8713A";
        ctx.lineWidth = 6;
        ctx.stroke();
      }
      ctx.lineCap = "round";
      ctx.strokeStyle = "#6B3F18";
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(AX, GY + 4);
      ctx.lineTo(AX, FY);
      ctx.stroke();
      ctx.strokeStyle = "#A8713A";
      ctx.lineWidth = 8;
      ctx.stroke();
      fork(-1);
      var bx = ball ? ball.x : AX,
        by = ball ? ball.y : AY;
      if (pull) {
        // the aim: dotted arc (it gets shorter on the higher levels), the gold one is a hint
        var lvx = (AX - pull.x) * KV,
          lvy = (AY - pull.y) * KV,
          keep = Math.max(5, Math.round(28 - lvl * 2.2 - level * 2));
        trajectory(lvx, lvy, keep, "rgba(30,42,74,.55)");
      }
      if (fails >= 3 && ball && !ball.fly && cur) {
        var tg = towers.filter(function (t) {
            return t.target && !t.dead;
          })[0],
          sol = tg && solve(tg);
        if (sol) trajectory((AX - sol.x) * KV, (AY - sol.y) * KV, 40, "rgba(255,196,0,.9)");
      }
      if (ball && !ball.fly) {
        ctx.strokeStyle = "#D8452E";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(AX - FW, FT);
        ctx.lineTo(bx - BR * 0.4, by + BR * 0.5);
        ctx.moveTo(AX + FW, FT);
        ctx.lineTo(bx + BR * 0.4, by + BR * 0.5);
        ctx.stroke();
      }
      if (ball) drawBall(ball, ts);
      fork(1);
      // before the first shot: show how to pull it
      if (!shots && !pull && ball && !ball.fly) {
        var wob = Math.sin(ts / 260) * 6;
        ctx.save();
        ctx.fillStyle = "rgba(30,42,74,.85)";
        ctx.strokeStyle = "rgba(30,42,74,.85)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        var ay = AY,
          ax1 = AX - BR * 1.5 - wob * 0.5,
          ax0 = ax1 - Math.min(40, AX - BR * 1.5 - 24);
        ctx.beginPath();
        ctx.moveTo(ax1, ay);
        ctx.lineTo(ax0, ay);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax0 - 8, ay);
        ctx.lineTo(ax0 + 4, ay - 8);
        ctx.lineTo(ax0 + 4, ay + 8);
        ctx.closePath();
        ctx.fill();
        ctx.font = "700 13px Fredoka, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(255,255,255,.9)";
        ctx.strokeText("Pull back", Math.max(4, ax0 - 8), ay + 20);
        ctx.strokeText("往后拉", Math.max(4, ax0 - 8), ay + 36);
        ctx.fillText("Pull back", Math.max(4, ax0 - 8), ay + 20);
        ctx.fillText("往后拉", Math.max(4, ax0 - 8), ay + 36);
        ctx.restore();
      }
      debris.forEach(function (d) {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);
        ctx.globalAlpha = Math.max(0, 1 - (ts - d.t) / 2200);
        ctx.fillStyle = d.c;
        ctx.strokeStyle = d.c === "#fff" ? "#E5483A" : "#8A5A2B";
        ctx.lineWidth = 2;
        ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h);
        ctx.strokeRect(-d.w / 2, -d.h / 2, d.w, d.h);
        if (d.w2) {
          ctx.fillStyle = "#1E2A4A";
          ctx.font = "700 " + Math.round(d.h * 0.6) + "px Fredoka, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(d.w2, 0, 1);
        }
        ctx.restore();
      });
      parts.forEach(function (p) {
        ctx.globalAlpha = Math.max(0, 1 - (ts - p.t) / 900);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      texts.forEach(function (t) {
        var age = (ts - t.t) / 1000;
        ctx.globalAlpha = Math.max(0, 1 - age);
        ctx.fillStyle = t.c;
        ctx.strokeStyle = "rgba(30,42,74,.92)";
        ctx.lineWidth = 4.5;
        ctx.lineJoin = "round";
        ctx.font = "700 " + Math.round(W * 0.075) + "px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(t.s, t.x, t.y - age * 36);
        ctx.fillText(t.s, t.x, t.y - age * 36);
        ctx.globalAlpha = 1;
      });
      if (ball && !ball.fly && !pull && cur && shots === 0) {
        ctx.fillStyle = "rgba(30,42,74,.62)";
        ctx.font = "700 " + Math.round(W * 0.042) + "px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Pull the pet back, then let go!", W * 0.45, H * 0.1);
      }
      raf = root.requestAnimationFrame ? root.requestAnimationFrame(draw) : null;
    }
    box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">Castle ' + level + " · " + esc(C.n) + "</span></div>" +
      '<div class="sw-card"><div class="sw-kind">Castle siege</div><div class="sw-sent" style="font-size:21px">Hit the sign with the word you hear!</div>' +
      '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><div class="sw-mhud"><span class="sw-msc" id="swGsc"></span><span class="sw-mcb" id="swGcb"></span><span class="sw-spd" id="swGlv"></span></div>' +
      '<canvas class="sw-snk" id="swSiege"></canvas><div class="sw-msg" id="swMsg">Pull back and let go!</div></div>';
    bindQuit();
    cv = document.getElementById("swSiege");
    W = Math.max(280, Math.min(440, Math.floor((cv.parentNode.clientWidth || 340) - 56)));
    H = Math.round(W * 0.82);
    GY = Math.round(H * 0.9);
    AX = Math.round(W * 0.15);
    AY = Math.round(H * 0.66);
    BR = Math.max(12, Math.round(W * 0.042));
    G = H * 1.5;
    RMAX = Math.round(W * 0.17);
    KV = (Math.sqrt(W * 0.98 * G) * 1.3) / RMAX; // a full pull can lob over a tower
    var dpr = root.devicePixelRatio || 1;
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    petImg("happy");
    petImg("excited");
    petImg("surprised");
    document.getElementById("swHear").onclick = function () {
      if (cur) play("w", cur.r.w);
    };
    function pos(e) {
      var r = cv.getBoundingClientRect();
      return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
    }
    cv.addEventListener("pointerdown", function (e) {
      if (!ball || ball.fly) return;
      var p = pos(e);
      if (Math.abs(p.x - ball.x) < BR * 3 && Math.abs(p.y - ball.y) < BR * 3) {
        pull = { x: ball.x, y: ball.y };
        try {
          cv.setPointerCapture(e.pointerId);
        } catch (e2) {}
      }
    });
    cv.addEventListener("pointermove", function (e) {
      if (!pull || !ball) return;
      var p = pos(e),
        dx = p.x - AX,
        dy = p.y - AY,
        d = Math.sqrt(dx * dx + dy * dy);
      if (d > RMAX) {
        dx = (dx / d) * RMAX;
        dy = (dy / d) * RMAX;
      }
      pull = { x: AX + dx, y: AY + dy };
      ball.x = pull.x;
      ball.y = pull.y;
    });
    function release() {
      if (!pull || !ball) {
        pull = null;
        return;
      }
      var vx = (AX - pull.x) * KV,
        vy = (AY - pull.y) * KV;
      pull = null;
      if (vx < 30) {
        ball.x = AX;
        ball.y = AY;
        return;
      }
      ball.vx = vx;
      ball.vy = vy;
      ball.fly = true;
      ball.t = 0;
      shots++;
      mood = "excited";
      sfx("pew");
    }
    cv.addEventListener("pointerup", release);
    cv.addEventListener("pointercancel", release);
    my = run = { mode: "siege", steps: [], i: 0, first: first, rnd: seeded(1) };
    my.stop = function () {
      cleanup();
      my = null;
    };
    last = Date.now();
    hud();
    draw();
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

  /* ---- two games for older children: Bubble spell and Monster battle ---- */
  function gTop(label) {
    return '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button><span class="sw-chip">' + esc(label) + "</span></div>";
  }
  // what a key press means: a letter, "back" or "enter" ("" for anything else); old WebViews only have keyCode
  function keyOf(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return "";
    var k = e.key,
      c = e.keyCode || e.which;
    if (k && k.length === 1 && /[a-zA-Z]/.test(k)) return k.toLowerCase();
    if (c >= 65 && c <= 90) return String.fromCharCode(c + 32);
    return "";
  }
  var BUB = [
    ["#FF8FB1", "#E5547F"], ["#6AA7FF", "#2F6FD6"], ["#FFD23F", "#E09A00"], ["#4CC76A", "#1F8A55"], ["#B58CFF", "#6A48E8"], ["#FF9E5E", "#E5683A"],
  ];
  // the words of one Bubble spell round set: the ones due for review first, then ones already met, each with at least two letters
  function spellList(s) {
    return spellable(gameWords(s, 12, true)).slice(0, 6);
  }

  // Bubble spell: a picture and a sentence with a gap, letter bubbles floating below: tap the letters in the right order to spell the missing word.
  // A wrong bubble wobbles (after two slips the right ones glow); a word with no slips is a perfect word and builds the streak.
  // Slips never send a word back to box 1; a right word moves up.
  function startSpell(list) {
    gameTag = "game";
    if (!list.length) {
      showHome();
      return;
    }
    trk("sw_game_start", "spell", "", "game");
    var first = {},
      i = 0,
      perfect = 0,
      handler = null,
      rnd = seeded(Date.now() % 100003);
    function stop() {
      if (handler) {
        document.removeEventListener("keydown", handler);
        handler = null;
      }
    }
    run = { mode: "spell", steps: [], i: 0, first: first, rnd: rnd, stop: stop, at: 0 };
    var me = run;
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
        pos = 0,
        slips = 0,
        done = false,
        advanced = false,
        letters = bubbleSet(w, rnd),
        cols = letters.length <= 8 ? 4 : 5,
        rows = Math.ceil(letters.length / cols),
        cells = [],
        q;
      for (q = 0; q < n; q++) cur[q] = ans.charAt(q) === "'" ? "'" : "";
      function skipApo() {
        while (pos < n && ans.charAt(pos) === "'") pos++;
      }
      skipApo();
      for (q = 0; q < letters.length; q++) cells.push(q);
      cells = shuffle(cells, rnd);
      var bubHtml = letters.map(function (ch, bi) {
        var cell = cells[bi],
          col = cell % cols,
          row = Math.floor(cell / cols),
          c = BUB[(bi + i) % BUB.length],
          x = ((col + 0.5) * 100) / cols + (rnd() - 0.5) * 5,
          y = ((row + 0.5) * 100) / rows + (rnd() - 0.5) * 6;
        return '<button class="sw-lb" data-c="' + ch + '" data-col="' + c[0] + '" style="left:' + x.toFixed(1) + "%;top:" + y.toFixed(1) + "%;animation-delay:-" + (rnd() * 3).toFixed(1) + "s;background:radial-gradient(circle at 32% 28%,#FFFFFF 0,rgba(255,255,255,0) 22%)," + c[0] + ";border-color:" + c[1] + '"><span>' + ch + "</span></button>";
      }).join("");
      var ctx = pieces(info.s).map(function (p) {
        return p.k && p.k === k ? '<span class="sw-blank" style="width:' + (n * 0.62 + 0.5).toFixed(1) + 'em"></span>' : esc(p.t);
      }).join("");
      function slotsHtml(all) {
        var h = "";
        for (var j = 0; j < n; j++) {
          var apo = ans.charAt(j) === "'";
          h += '<span class="sw-sl' + (apo ? " apo" : cur[j] ? " ok" : j === pos && !all ? " cur" : "") + '">' + esc(apo ? "’" : cur[j] || "") + "</span>";
        }
        return h;
      }
      box.innerHTML = gTop("Bubble spell · " + (i + 1) + " / " + list.length) +
        '<div class="sw-card sw-bbs"><div class="sw-bhead"><div class="sw-bpet" id="swBpet">' + petArt("happy") + '</div><div class="sw-bq"><div class="sw-ctx">' + ctx + "</div>" +
        '<div><button class="sw-say" id="swHear">' + SPEAKER + ' Hear it</button><button class="sw-say sw-alt" id="swHearS">' + SPEAKER + " Sentence</button></div></div></div>" +
        '<div class="sw-spic" id="swPic">' + art(w, true) + '</div><div class="sw-sprow" id="swSlots"></div><div class="sw-sky sw-bsky sw-new" id="swSky" style="height:' + (rows * (root.innerWidth <= 560 ? 76 : 90) + 30) + 'px">' + bubHtml + "</div>" +
        '<div class="sw-msg" id="swMsg">' + (perfect >= 2 ? "Perfect streak: " + perfect + "!" : "Tap the letters in order.") + '</div><button class="sw-go" id="swNext" style="display:none">Next →</button></div>';
      document.getElementById("swSlots").innerHTML = slotsHtml(false);
      bindQuit();
      function mood(m) {
        var el = document.getElementById("swBpet");
        if (!el) return;
        el.innerHTML = petArt(m);
        if (m !== "happy")
          setTimeout(function () {
            if (document.getElementById("swBpet") === el && !done) el.innerHTML = petArt("happy");
          }, 900);
      }
      function go() {
        if (advanced || run !== me || !document.getElementById("swSlots")) return;
        advanced = true;
        i++;
        round();
      }
      function tap(b) {
        if (done || b.classList.contains("sw-gone")) return;
        var ch = b.getAttribute("data-c");
        if (ch === ans.charAt(pos)) {
          cur[pos] = ch;
          pos++;
          skipApo();
          b.classList.add("sw-gone");
          explode(b, b.getAttribute("data-col") || "#6AA7FF");
          sfx("pop");
          mood("excited");
          Array.prototype.forEach.call(box.querySelectorAll(".sw-lb.sw-hint"), function (o) {
            o.classList.remove("sw-hint");
          });
          if (pos >= n) {
            done = true;
            if (first[k] === undefined) first[k] = slips === 0;
            perfect = slips === 0 ? perfect + 1 : 0;
            document.getElementById("swSlots").innerHTML = slotsHtml(true);
            Array.prototype.forEach.call(box.querySelectorAll(".sw-lb:not(.sw-gone)"), function (o) {
              o.classList.add("sw-away");
            });
            var sk = document.getElementById("swSky");
            setTimeout(function () {
              if (sk) sk.style.display = "none"; // this round's sky folds away so the Next button is on the screen (a new round has a new sky)
            }, 1300);
            var stars = slips === 0 ? 3 : slips <= 2 ? 2 : 1,
              sh = "";
            for (var si = 0; si < 3; si++) sh += '<span style="color:' + (si < stars ? "#FFC93C" : "#D5E0EE") + '">' + scenery("star") + "</span>";
            var m = document.getElementById("swMsg");
            m.className = "sw-msg sw-good";
            m.innerHTML = '<span class="sw-rst">' + sh + "</span><br>" + (slips === 0 ? (perfect >= 3 ? "Perfect streak: " + perfect + "!" : "Perfect!") : "You spelled it!") + " " + esc(w);
            sfx(slips === 0 ? "cheer" : "pop");
            document.getElementById("swBpet").innerHTML = petArt("excited");
            try {
              var r = document.getElementById("swSlots").getBoundingClientRect();
              if (hooks.burst) hooks.burst(r.left + r.width / 2, r.top);
            } catch (e) {}
            document.getElementById("swNext").style.display = "";
            var late = setTimeout(go, 9000);
            play("s", w, function () {
              clearTimeout(late);
              setTimeout(go, 1100);
            });
          } else document.getElementById("swSlots").innerHTML = slotsHtml(false);
        } else {
          slips++;
          if (first[k] === undefined) first[k] = false;
          perfect = 0;
          b.classList.add("sw-wob");
          sfx("poke");
          mood("surprised");
          setTimeout(function () {
            b.classList.remove("sw-wob");
          }, 400);
          if (slips >= 2)
            Array.prototype.forEach.call(box.querySelectorAll(".sw-lb"), function (o) {
              if (!o.classList.contains("sw-gone") && o.getAttribute("data-c") === ans.charAt(pos)) o.classList.add("sw-hint");
            });
          tell(slips >= 2 ? "The glowing bubble is next!" : "Not that one. Listen again!", false);
          if (slips === 1) play("w", w);
        }
      }
      Array.prototype.forEach.call(box.querySelectorAll(".sw-lb"), function (b) {
        b.onclick = function () {
          tap(b);
        };
      });
      document.getElementById("swHear").onclick = function () {
        play("w", w);
      };
      document.getElementById("swHearS").onclick = function () {
        play("s", w);
      };
      document.getElementById("swNext").onclick = go;
      handler = function (e) {
        if (run !== me || !ov || ov.style.display === "none" || !document.getElementById("swSlots") || done) return;
        var c = keyOf(e);
        if (!c) return;
        var bs = box.querySelectorAll(".sw-lb"),
          pick = null;
        for (var j = 0; j < bs.length; j++) if (!bs[j].classList.contains("sw-gone") && bs[j].getAttribute("data-c") === c) pick = pick || bs[j];
        if (pick) {
          e.preventDefault();
          tap(pick);
        }
      };
      document.addEventListener("keydown", handler);
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
      "Bubble spell",
      function (r, t) {
        return r + " / " + t;
      },
      function (r, t) {
        return r >= t ? "Every word perfect, no slips!" : "words with no slips.";
      },
      function () {
        startSpell(spellList(readState()));
      },
      '<div class="sw-stage">' + (all ? party() : "") + '<div class="sw-pet sw-pets ' + (all ? "sw-dance" : "sw-hop") + '">' + petArt(all ? "excited" : "happy") + "</div></div>" +
        '<div class="sw-words">' + ks.map(function (k) {
          return '<span class="' + (first[k] ? "" : "sw-miss") + '">' + esc(shown(k)) + "</span>";
        }).join("") + "</div>",
      null,
      { keepMisses: true }
    );
  }

  /* ---- Monster battle: your pet fights a monster. Hear a word and tap it: a right answer is a hit (3 in a row = power hit, 6 = mega hit), a wrong
     answer or a slow one lets the monster hit back. Beat the monster before the pet runs out of hearts. Each monster is unlocked by the one before. ---- */
  function monArt(id, mood, gaze) {
    return root.SWMonsters ? root.SWMonsters.art(id, mood, gaze) : "";
  }
  function monById(id) {
    return root.SWMonsters ? root.SWMonsters.byId(id) : null;
  }
  function showBattle() {
    trk("sw_view", "battle", "", "screen");
    var s = readState(),
      p = hooks.pet ? hooks.pet() : null,
      list = root.SWMonsters ? root.SWMonsters.LIST : [],
      beaten = 0,
      h = "";
    list.forEach(function (m) {
      var open = monUnlocked(s.rev, m.id),
        won = !!s.rev[monKey(m.id)],
        prize = root.SWPrizes ? root.SWPrizes.forMonster(m.id) : null;
      if (won) beaten++;
      h += '<button class="sw-mcard' + (open ? "" : " sw-mlock") + (won ? " sw-mwon" : "") + '" data-m="' + m.id + '"' + (open ? "" : " disabled") + '><span class="sw-mart">' + monArt(m.id, "idle") + '</span><b>' + esc(m.name) + "</b><small>" +
        (open ? esc(m.cn) + " · " + m.hp + " HP" : "Beat the one before") + "</small>" +
        (prize ? '<span class="sw-mdrop"><span class="sw-ith">' + prizeThumb(prize.id) + "</span>" + (won ? "Got it ✓" : esc(prize.name)) + "</span>" : "") + (open ? "" : '<span class="sw-mlk">' + LOCK + "</span>") + "</button>";
    });
    box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swClose">← Back</button>' + (p ? '<span class="sw-starpill">' + scenery("star") + (+p.stars || 0) + "</span>" : "") + "</div>" +
      '<div class="sw-ttl"><span class="sw-mhead">' + monArt(1, "cheer") + '</span><div><h1>Monster battle</h1><div class="sw-sub">Beat the monsters with your words! · 打怪兽 · ' + beaten + " / " + list.length + "</div></div></div>" +
      '<div class="sw-mons">' + h + "</div>";
    document.getElementById("swClose").onclick = showHome;
    Array.prototype.forEach.call(box.querySelectorAll(".sw-mcard"), function (b) {
      b.onclick = function () {
        if (b.disabled) return;
        back = showBattle;
        startBattle(+b.getAttribute("data-m"));
      };
    });
    ov.scrollTop = 0;
  }
  var LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="3" fill="#8A97AD"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="#8A97AD" stroke-width="2.6" stroke-linecap="round"/></svg>';
  function heartsHtml(n) {
    var h = "";
    for (var j = 0; j < 3; j++) h += '<i class="' + (j < n ? "" : "sw-lost") + '">' + HEARTSVG + "</i>";
    return h;
  }
  // the first time a monster is beaten: 5 stars and the prize it drops (with the pet wearing it)
  function monsterReveal(m) {
    var P = root.SWPrizes,
      prize = P ? P.forMonster(m.id) : null,
      s = readState(),
      k = monKey(m.id),
      first = !s.rev[k],
      p = hooks.pet ? hooks.pet() : null,
      eq2 = {},
      q;
    if (first) {
      s.rev[k] = Date.now();
      writeState(s);
      trk("sw_monster", "m" + m.id, "", "monster");
      try {
        if (hooks.gift) hooks.gift(CHEST_STARS);
        if (hooks.toast) hooks.toast([[CHEST_STARS, "Monster beaten", "打败怪兽"]], CHEST_STARS, false);
      } catch (e) {}
    }
    if (p && p.eq) for (q in p.eq) if (p.eq.hasOwnProperty(q)) eq2[q] = p.eq[q];
    if (prize && first) eq2[prize.slot] = prize.id;
    var chip = prize ? '<span class="sw-ritem"><span class="sw-ith sw-rbig">' + prizeThumb(prize.id) + "</span>" + esc(prize.name) + "</span>" : "";
    return {
      html: '<div class="sw-reveal"><div class="sw-mart sw-mbig">' + monArt(m.id, "hurt") + '</div><div class="sw-rt">' + (first ? m.name + " is beaten!" : "You beat " + m.name + " again!") + "</div>" +
        (first ? '<div class="sw-rrow"><span class="sw-rstar">+' + CHEST_STARS + " ★</span>" + chip + "</div>" : "") +
        (first && prize && p ? '<div class="sw-stage sw-rpet"><div class="sw-pet sw-pets sw-dance">' + petArt("excited", eq2) + '</div></div><button class="sw-go" id="swWear">Wear it now</button>' : first && prize ? '<div class="sw-msg">Adopt a pet on the pet page to wear it.</div>' : "") + "</div>",
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
  var LAYERS = 6; // pictures stacked behind a fighter while it turns, to give it thickness
  function startBattle(id) {
    var m = monById(id);
    if (!m) {
      showBattle();
      return;
    }
    gameTag = "game";
    var s0 = readState(),
      pool = gamePool(learnedWords(s0), [], firstLessonsWords(), 8),
      dueKeys = dueWords(s0, dayStr()),
      dueList = pool.filter(function (w) {
        return dueKeys.indexOf(wkey(w)) >= 0;
      }),
      first = {},
      rnd = seeded(Date.now() % 100003),
      timers = [],
      qT = null,
      handler = null;
    trk("sw_game_start", "battle", "monster " + id, "game");
    function stop() {
      clearTimeout(qT);
      timers.forEach(clearTimeout);
      timers = [];
      if (handler) {
        document.removeEventListener("keydown", handler);
        handler = null;
      }
    }
    run = { mode: "battle", steps: [], i: 0, first: first, rnd: rnd, stop: stop, at: id };
    var me = run,
      hp = m.hp,
      hearts = 3,
      streak = 0,
      recent = [],
      cur = null,
      busy = true,
      shots = 0;
    function later(fn, ms) {
      timers.push(
        setTimeout(function () {
          if (run === me && !me.done) fn();
        }, ms)
      );
    }
    function el(x) {
      return document.getElementById(x);
    }
    // inside the fight both look at each other: the pet (drawn flipped, so its tail is behind it) and the monster glance at the other side
    function pA(mood) {
      root.__petGaze = -1;
      var h = petArt(mood);
      root.__petGaze = 0;
      return h;
    }
    function mA(mood) {
      return monArt(id, mood, -1);
    }
    var canRig = !!(root.SWMonsters && root.SWMonsters.mount),
      rig = null,
      canPet = !!(root.PetRig && root.PetRig.mount && root.petSvg),
      prig = null;
    box.innerHTML = gTop("Monster battle · " + m.name) +
      '<div class="sw-card sw-bt"><div class="sw-arena" id="swArena"><div class="sw-abg">' + (root.SWMonsters ? root.SWMonsters.arena(id) : "") + '</div><div class="sw-php" id="swHearts">' + heartsHtml(3) + '</div>' +
      '<div class="sw-mhp"><b id="swMname">' + esc(m.name) + " " + hp + "/" + m.hp + '</b><div class="sw-hpbar"><i id="swMhp" style="width:100%"></i></div></div>' +
      '<div class="sw-apet" id="swApet"><div class="sw-turn" id="swPetHost">' + (canPet ? "" : pA("happy")) + "</div>" + (canPet ? "" : '<i class="sw-shd"></i>') + '</div><div class="sw-amon" id="swAmon"><div class="sw-turn" id="swMonHost">' + (canRig ? "" : mA("idle")) + "</div>" + (canRig ? "" : '<i class="sw-shd"></i>') + '</div><div class="sw-bfx" id="swFx"><div class="sw-banner2" id="swBan">' + esc(m.name) + " appears!</div></div></div>" +
      '<div class="sw-charge"><i id="swCharge"></i></div><div class="sw-streak" id="swStreak"> </div>' +
      '<button class="sw-say" id="swHear">' + SPEAKER + ' Hear it again</button><div class="sw-bg" id="swOpts"></div></div>';
    bindQuit();
    // the monster is a living rig (parts that breathe, blink, turn, charge, attack, get hit and are beaten); if that can't be drawn, a still picture is used instead
    if (canRig) {
      try {
        rig = root.SWMonsters.mount(el("swMonHost"), id, { gaze: -1, lean: -4 });
      } catch (e) {
        rig = null;
      }
      if (!rig) el("swMonHost").innerHTML = mA("idle");
    }
    // the pet is a living rig too: the very same drawing it has everywhere else (clothes and all), moved part by part
    if (canPet) {
      try {
        var pa = petRigArgs();
        prig = root.PetRig.mount(el("swPetHost"), pa.type, pa.eq, { gaze: -1, lean: -4, flip: true, faces: ["asleep", "excited", "surprised"], defer: 60 });
      } catch (e) {
        prig = null;
      }
      if (!prig) el("swPetHost").innerHTML = pA("happy") + '<i class="sw-shd"></i>';
    }
    document.getElementById("swHear").onclick = function () {
      if (cur) play("w", cur.w);
    };
    function setArt(target, html) {
      var node = el(target),
        t = node && node.firstChild;
      if (t) t.innerHTML = html;
    }
    // swing a fighter from the front view round to the side (on = true) or back to the front. A flat picture looks like paper when it turns, so for
    // the turn it gets some thickness: copies of the same picture are stacked behind it, each a little deeper and darker (CSS 3D), and the turn has a
    // crouch before it, an overshoot and a settle, and the shadow on the ground gets narrower.
    function side(target, on) {
      var node = el(target),
        t = node && node.firstChild;
      if (!t) return;
      var flip = target === "swApet";
      function clearLayers() {
        Array.prototype.forEach.call(t.querySelectorAll(".sw-ly"), function (n) {
          t.removeChild(n);
        });
      }
      if (on) {
        clearTimeout(t.__off);
        clearLayers();
        var svg = t.querySelector("svg");
        if (svg) {
          var xml = svg.outerHTML.indexOf("xmlns=") < 0 ? svg.outerHTML.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ') : svg.outerHTML,
            uri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
          for (var k = 1; k <= LAYERS; k++) {
            var im = document.createElement("img");
            im.className = "sw-ly";
            im.alt = "";
            im.src = uri;
            im.style.transform = "translateZ(-" + (k * 3) + "px) " + (flip ? "scaleX(-1) " : "") + "rotate(-5deg)";
            im.style.filter = "brightness(" + (0.9 - k * 0.05).toFixed(2) + ")";
            t.insertBefore(im, t.firstChild);
          }
        }
        t.classList.remove("sw-out");
        t.classList.add("sw-turned", "sw-in");
      } else {
        t.classList.remove("sw-in");
        t.classList.add("sw-out");
        t.__off = setTimeout(function () {
          t.classList.remove("sw-out", "sw-turned");
          clearLayers();
        }, 340);
      }
    }
    function anim(node, cls, ms) {
      if (!node) return;
      node.classList.remove(cls);
      void node.offsetWidth;
      node.classList.add(cls);
      setTimeout(function () {
        node.classList.remove(cls);
      }, ms);
    }
    // where things are, in pixels inside the arena: the pet's front, the pet's middle, the monster's middle and its front
    function geo() {
      var ar = el("swArena").getBoundingClientRect(),
        pr = el("swApet").getBoundingClientRect(),
        mr = el("swAmon").getBoundingClientRect(),
        mz = rig ? rig.muzzle() : { x: 0.2, y: 0.5 },
        pz = prig ? prig.muzzle() : { x: 0.86, y: 0.5 };
      return {
        p: { x: pr.left - ar.left + pr.width * pz.x, y: pr.top - ar.top + pr.height * pz.y },
        pc: { x: pr.left - ar.left + pr.width * 0.5, y: pr.top - ar.top + pr.height * 0.5 },
        m: { x: mr.left - ar.left + mr.width * 0.5, y: mr.top - ar.top + mr.height * 0.52 },
        mf: { x: mr.left - ar.left + mr.width * mz.x, y: mr.top - ar.top + mr.height * mz.y },
      };
    }
    function fxAdd(html, cls, x, y, life) {
      var fx = el("swFx");
      if (!fx) return null;
      var d = document.createElement("div");
      d.className = cls;
      d.innerHTML = html || "";
      d.style.left = x + "px";
      d.style.top = y + "px";
      fx.appendChild(d);
      setTimeout(function () {
        if (d.parentNode) d.parentNode.removeChild(d);
      }, life || 1000);
      return d;
    }
    function floatText(txt, cls, where) {
      var d = fxAdd(esc(txt), "sw-dmg " + cls, 0, 0, 1000);
      if (d) {
        d.style.left = where + "%";
        d.style.top = "22%";
      }
    }
    // something flying from one point to another (a cannonball, or the monster's shot)
    function fly(html, cls, from, to, ms, delay, cb) {
      later(function () {
        var d = fxAdd(html, "sw-shot " + cls, from.x, from.y, ms + 250);
        if (!d) return;
        d.style.transform = "translate(-50%,-50%) scale(.55)";
        void d.offsetWidth;
        d.style.transition = "left " + ms + "ms linear,top " + ms + "ms linear,transform " + ms + "ms ease-out";
        d.style.left = to.x + "px";
        d.style.top = to.y + "px";
        d.style.transform = "translate(-50%,-50%) scale(1)";
        sfx("pew");
      }, delay);
      later(cb || function () {}, delay + ms);
    }
    // a burst where something lands: a ring and a few candy-coloured sparks
    function impact(pt, n, colors) {
      var d = fxAdd('<i class="sw-ring"></i>', "sw-imp", pt.x, pt.y, 900);
      if (!d) return;
      for (var q = 0; q < n; q++) {
        var sp = document.createElement("b");
        sp.className = "sw-spk";
        sp.style.background = colors[q % colors.length];
        d.appendChild(sp);
        (function (node, ang, dist) {
          setTimeout(function () {
            node.style.transform = "translate(" + (Math.cos(ang) * dist).toFixed(0) + "px," + (Math.sin(ang) * dist).toFixed(0) + "px) scale(.3)";
            node.style.opacity = "0";
          }, 25);
        })(sp, (q / n) * 6.283 + 0.4, 36 + (q % 3) * 14);
      }
    }
    function muzzle(pt) {
      fxAdd("", "sw-muz", pt.x, pt.y, 450);
    }
    // the big laser: a rainbow beam from the pet to the monster
    function beam(from, to) {
      var dx = to.x - from.x,
        dy = to.y - from.y,
        d = fxAdd('<i class="sw-beami"></i>', "sw-beam", from.x, from.y, 950);
      if (!d) return;
      d.style.width = Math.sqrt(dx * dx + dy * dy) + "px";
      d.style.transform = "rotate(" + ((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(1) + "deg)";
      sfx("zap");
    }
    function hud() {
      var b = el("swMhp");
      if (b) b.style.width = Math.round((100 * hp) / m.hp) + "%";
      var nm = el("swMname");
      if (nm) nm.textContent = m.name + " " + hp + "/" + m.hp;
      var he = el("swHearts");
      if (he) he.innerHTML = heartsHtml(hearts);
      var st = el("swStreak");
      if (st) st.textContent = streak >= 2 ? "Streak " + streak + (streak >= 5 ? " · MEGA laser!" : streak >= 3 ? " · cannon stream!" : "") : " ";
      var pe = el("swApet");
      if (pe) {
        if (streak >= 3) pe.classList.add("sw-pow");
        else pe.classList.remove("sw-pow");
      }
    }
    var BALLS = ["sw-ball0", "sw-ball1", "sw-ball2", "sw-ball3"],
      SPARK = ["#FF8FB1", "#FFD23F", "#6AA7FF", "#7BD65A", "#FFFFFF"];
    // the pet fires: 1 hit = one cannonball, a power hit = a stream of four, a mega hit = the laser. Returns how long it all takes.
    function petAttack(d) {
      var g = geo(),
        landed = 0;
      if (prig) prig.turn(true);
      else {
        setArt("swApet", pA("excited"));
        side("swApet", true);
        anim(el("swApet"), "sw-recoil", 420);
      }
      function land(big, last) {
        if (landed === 0) {
          if (!rig) setArt("swAmon", mA("hurt"));
          floatText((d >= 3 ? "MEGA LASER " : d === 2 ? "CANNON STREAM " : "") + "-" + d, d >= 3 ? "sw-d3" : d === 2 ? "sw-d2" : "sw-d1", d >= 3 ? 18 : 40);
          hud();
        }
        landed++;
        if (rig) rig.play("hit", null, big ? 1.7 : 1);
        else anim(el("swAmon"), "sw-recoil2", 460);
        impact(g.m, big ? 16 : 8, SPARK);
        sfx(big ? "thud" : "pop");
        if (big) anim(el("swArena"), "sw-ashake", 320);
        try {
          var r = el("swAmon").getBoundingClientRect();
          if (hooks.burst && (big || last)) hooks.burst(r.left + r.width / 2, r.top + r.height / 2);
        } catch (e) {}
      }
      // with the rig the pet first turns to the side (0.3 s), then fires: its kick is 0.14 s into the move, so the shot leaves 0.14 s after the move starts
      var lead = prig ? 120 : 0;
      if (d === 1) {
        if (prig)
          later(function () {
            prig.play("fire");
          }, lead);
        later(function () {
          muzzle(g.p);
        }, lead + (prig ? 140 : 150));
        fly('<i class="' + BALLS[shots++ % 4] + '"></i>', "sw-ball", g.p, g.m, 330, lead + (prig ? 150 : 170), function () {
          land(false, true);
        });
      } else if (d === 2) {
        for (var k = 0; k < 4; k++)
          (function (k) {
            var at = prig ? lead + k * 130 : 120 + k * 120;
            if (prig)
              later(function () {
                prig.play("fire");
              }, at);
            later(function () {
              muzzle(g.p);
            }, at + (prig ? 140 : 0));
            fly('<i class="' + BALLS[(shots + k) % 4] + '"></i>', "sw-ball", g.p, g.m, 300, at + (prig ? 150 : 20), function () {
              land(false, k === 3);
            });
          })(k);
        shots += 4;
      } else {
        if (prig)
          later(function () {
            prig.play("fire", null, 2);
          }, 100);
        later(function () {
          muzzle(g.p);
          if (!prig) anim(el("swApet"), "sw-recoil", 420);
        }, prig ? 400 : 150);
        later(function () {
          beam(g.p, g.m);
        }, prig ? 430 : 300);
        later(function () {
          land(true, true);
        }, prig ? 560 : 430);
        later(function () {
          impact(g.m, 10, SPARK);
        }, prig ? 830 : 700);
      }
      later(function () {
        if (!rig) setArt("swAmon", mA("idle"));
        if (prig) prig.turn(false);
        else {
          setArt("swApet", pA("happy"));
          side("swApet", false);
        }
      }, prig ? (d === 1 ? 800 : d === 2 ? 1150 : 1400) : d === 1 ? 800 : d === 2 ? 1150 : 1250);
      return prig ? (d === 1 ? 1100 : d === 2 ? 1450 : 1700) : d === 1 ? 850 : d === 2 ? 1200 : 1300;
    }
    // the pet gets bumped by the monster's shot, never hurt for real
    function bump(g, slow) {
      if (prig) prig.play("hit");
      else {
        setArt("swApet", pA("surprised"));
        anim(el("swApet"), "sw-knock", 520);
      }
      impact(g.pc, 8, ["#FFFFFF", "#FFE066", "#FF8FB1"]);
      floatText(slow ? "Too slow!" : "Oops!", "sw-dbad", 12);
      sfx("thud");
      hud();
    }
    // the monster shoots back (its own cartoon shot): it turns to the side, gathers a glowing ball, throws itself forward, fires, and turns back
    function monAttack(slow) {
      var g = geo();
      if (rig) {
        rig.turn(true);
        rig.charge(0.35);
        later(function () {
          rig.play("attack");
        }, 330);
        later(function () {
          muzzle(g.mf);
        }, 630);
        fly(root.SWMonsters.shot(id), "sw-mshot", g.mf, g.pc, 400, 640, function () {
          bump(g, slow);
        });
        later(function () {
          rig.calm();
          rig.turn(false);
          if (!prig) setArt("swApet", pA("happy"));
        }, 1080);
        return 1450;
      }
      setArt("swAmon", mA("cheer"));
      side("swAmon", true);
      anim(el("swAmon"), "sw-wind", 440);
      later(function () {
        muzzle(g.mf);
      }, 250);
      fly(root.SWMonsters ? root.SWMonsters.shot(id) : "", "sw-mshot", g.mf, g.pc, 400, 300, function () {
        bump(g, slow);
      });
      later(function () {
        setArt("swAmon", mA("idle"));
        setArt("swApet", pA("happy"));
        side("swAmon", false);
      }, 1150);
      return 1150;
    }
    function ask() {
      if (run !== me || me.done) return;
      var w = battlePick(pool, recent, rnd, dueList);
      recent.push(wkey(w));
      if (recent.length > 4) recent.shift();
      cur = { w: w, k: wkey(w), done: false };
      var opts = shuffle([w].concat(distractors(w, pool, rnd, [], m.opts - 1)), rnd);
      el("swOpts").innerHTML = opts.map(function (o, n) {
        return '<button class="sw-bo" data-w="' + esc(o) + '"><small>' + (n + 1) + "</small>" + esc(o) + "</button>";
      }).join("");
      Array.prototype.forEach.call(box.querySelectorAll(".sw-bo"), function (b) {
        b.onclick = function () {
          answer(b);
        };
      });
      var bar = el("swCharge");
      if (bar) {
        bar.style.transition = "none";
        bar.style.width = "100%";
        void bar.offsetWidth;
        bar.style.transition = "width " + m.charge + "s linear";
        bar.style.width = "0%";
      }
      if (rig) rig.charge(m.charge); // the monster gets more and more worked up while the bar runs down
      if (prig) prig.charge(m.charge); // and the pet gets ready, bouncing a little
      clearTimeout(qT);
      qT = setTimeout(function () {
        if (run === me && !me.done) answer(null);
      }, m.charge * 1000);
      busy = false;
      play("w", w);
    }
    function answer(b) {
      if (busy || !cur || cur.done) return;
      busy = true;
      cur.done = true;
      clearTimeout(qT);
      if (rig) rig.calm();
      if (prig) prig.calm();
      var bar = el("swCharge");
      if (bar) {
        bar.style.width = getComputedStyle(bar).width;
        bar.style.transition = "none";
      }
      var good = !!b && wkey(b.getAttribute("data-w")) === cur.k;
      if (first[cur.k] === undefined) first[cur.k] = good;
      else if (!good) first[cur.k] = false;
      var wait;
      if (good) {
        streak++;
        var d = battleDmg(streak);
        hp = Math.max(0, hp - d);
        b.classList.add("sw-ok");
        wait = petAttack(d);
        if (hp <= 0) later(win, wait);
        else later(ask, wait);
      } else {
        streak = 0;
        hearts--;
        if (b) {
          b.classList.add("sw-bad");
          b.disabled = true;
        }
        Array.prototype.forEach.call(box.querySelectorAll(".sw-bo"), function (o) {
          if (wkey(o.getAttribute("data-w")) === cur.k) o.classList.add("sw-hint");
        });
        play("w", cur.w);
        wait = monAttack(!b);
        var pe = el("swApet");
        if (pe) pe.classList.remove("sw-pow");
        if (hearts <= 0) later(lose, wait + 500);
        else later(ask, wait + 500);
      }
    }
    function win() {
      me.done = true;
      stop();
      var g = geo();
      if (rig) rig.play("defeat");
      else anim(el("swAmon"), "sw-fade", 900);
      if (prig) {
        prig.turn(false);
        prig.play("cheer");
      }
      impact(g.m, 16, SPARK);
      try {
        var r = el("swAmon").getBoundingClientRect();
        if (hooks.burst) hooks.burst(r.left + r.width / 2, r.top + r.height / 2);
      } catch (e) {}
      sfx("big");
      setTimeout(function () {
        if (run !== me) return;
        var rv = monsterReveal(m);
        endGame(
          "m",
          first,
          "Monster battle",
          function () {
            return hearts >= 3 ? "Flawless!" : "You win!";
          },
          function (r, t) {
            return "Hearts left: " + hearts + " · " + r + " of " + t + " words right first time.";
          },
          function () {
            startBattle(id);
          },
          rv.html,
          rv.after,
          { keepMisses: true }
        );
      }, 1000);
    }
    function lose() {
      me.done = true;
      stop();
      var s = readState(),
        today = dayStr(),
        miss = [];
      Object.keys(first).forEach(function (k) {
        if (first[k] && s.words[k]) s.words[k] = applyResult(s.words[k], true, today);
        if (!first[k]) miss.push(k);
      });
      writeState(s);
      trk("sw_game_done", "battle", "lost m" + id, "game");
      sfx("poke");
      box.innerHTML = '<div class="sw-top"><button class="sw-back" id="swQuit">← Back</button></div><div class="sw-card"><div class="sw-kind" style="background:#E5483A">Monster battle</div>' +
        '<div class="sw-mart sw-mbig" id="swLoseMon">' + monArt(id, "cheer") + '</div><div class="sw-big" style="font-size:44px">' + esc(m.name) + " won this time!</div>" +
        '<div class="sw-sent" style="font-size:19px">Practise these words and try again. You can do it!</div>' +
        '<div class="sw-words">' + miss.map(function (k) {
          return '<span class="sw-miss">' + esc(shown(k)) + "</span>";
        }).join("") + '</div><button class="sw-go" id="swAgain">Try again</button> <button class="sw-say sw-alt" id="swMap">' + backLabel() + "</button></div>";
      document.getElementById("swQuit").onclick = goBack;
      document.getElementById("swMap").onclick = goBack;
      document.getElementById("swAgain").onclick = function () {
        startBattle(id);
      };
      if (canRig) {
        try {
          root.SWMonsters.mount(document.getElementById("swLoseMon"), id, { mode: "cheer" });
        } catch (e) {
          document.getElementById("swLoseMon").innerHTML = monArt(id, "cheer");
        }
      }
      refreshButton();
    }
    handler = function (e) {
      if (run !== me || !ov || ov.style.display === "none" || !el("swOpts")) return;
      var n = +(e.key || String.fromCharCode(e.keyCode || 0));
      if (n >= 1 && n <= 4) {
        var bs = box.querySelectorAll(".sw-bo");
        if (bs[n - 1] && !bs[n - 1].disabled) {
          e.preventDefault();
          answer(bs[n - 1]);
        }
      }
    };
    document.addEventListener("keydown", handler);
    sfx("sparkle");
    later(function () {
      var ban = el("swBan");
      if (ban) ban.textContent = "Fight!";
      sfx("poke");
    }, 1100);
    later(function () {
      var ban = el("swBan");
      if (ban && ban.parentNode) ban.parentNode.removeChild(ban);
      ask();
    }, 1700);
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
