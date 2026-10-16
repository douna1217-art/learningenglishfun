/* A guard for the moving pets and monsters (pet-rig.js, sightwords-monsters.js): on a phone that cannot keep up it takes the load off by itself.
   Every animation loop reports each frame to MotionGuard.note(timestamp). A frame is counted once however many pets are on the page (stamps less than 4 ms apart are the same frame). Every 1.5 seconds it looks
   at how long frames really take:
     level 0  full speed
     level 1  30 pictures a second (when frames took longer than about 26 ms, two checks in a row)
     level 2  nearly still: the pets stop breathing, swaying and waving and are redrawn only about 3 times a second, so what happens (a face, a hit, a turn)
              still shows (when even level 1 took longer than about 45 ms, two checks in a row)
   It only ever goes down on its own; the level is remembered on that device for 3 days (then it tries full speed again). Quiet times are not counted: the first
   2.5 seconds, a hidden page, and any frame gap longer than 0.4 s (the phone was asleep or busy with something else).
   For trying it: add ?motion=0, ?motion=1 or ?motion=2 to the page address to force a level (this does not remember anything).
   MotionGuard.level(), MotionGuard.gap(base) = the shortest time between two pictures, in seconds, MotionGuard.force(n), MotionGuard.reset().
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";
  var KEY = "lef_motion_v1",
    TTL = 3 * 24 * 3600 * 1000,
    WINDOW = 1500,
    GRACE = 2500,
    HIGH = [26, 45], // average frame time (ms) that is too slow at level 0 and at level 1
    level = 0,
    forced = null,
    startAt = 0,
    lastTs = 0,
    acc = 0,
    n = 0,
    bad = 0;

  function store(get, val) {
    try {
      if (get) return root.localStorage.getItem(KEY);
      root.localStorage.setItem(KEY, val);
    } catch (e) {}
    return null;
  }
  function load() {
    var m = /[?&]motion=([012])/.exec((root.location && root.location.search) || "");
    if (m) {
      forced = +m[1];
      level = forced;
      return;
    }
    try {
      var o = JSON.parse(store(true) || "null");
      if (o && typeof o.l === "number" && o.l >= 0 && o.l <= 2 && Date.now() - (o.t || 0) < TTL) level = o.l;
    } catch (e) {}
  }
  function drop(to) {
    if (forced !== null || to <= level) return;
    level = to;
    store(false, JSON.stringify({ l: level, t: Date.now() }));
  }
  // one frame of any loop; ts = the time the browser gives to the frame (ms), the same for every loop in that frame
  function note(ts) {
    if (forced !== null || level >= 2) return;
    if (!ts) ts = Date.now();
    if (lastTs && ts >= lastTs && ts - lastTs < 4) return; // the same frame (each loop in a frame gets the same stamp, or one a hair later)
    var dt = ts - lastTs;
    lastTs = ts;
    if (!startAt) startAt = ts;
    if (dt <= 0 || dt > 400 || (root.document && root.document.hidden)) {
      acc = 0;
      n = 0;
      return;
    }
    if (ts - startAt < GRACE) return;
    acc += dt;
    n++;
    if (acc >= WINDOW) {
      var avg = acc / n;
      acc = 0;
      n = 0;
      if (avg > HIGH[level]) {
        bad++;
        if (bad >= 2) {
          bad = 0;
          drop(level + 1);
        }
      } else bad = 0;
    }
  }
  function gap(base) {
    base = base || 0;
    return level >= 2 ? 0.4 : level === 1 ? Math.max(base, 1 / 30 - 0.004) : base;
  }
  load();
  root.MotionGuard = {
    note: note,
    level: function () {
      return level;
    },
    gap: gap,
    force: function (l) {
      forced = l === null || l === undefined ? null : l;
      level = forced === null ? 0 : forced;
    },
    reset: function () {
      forced = null;
      level = 0;
      startAt = lastTs = acc = n = bad = 0;
      store(false, JSON.stringify({ l: 0, t: Date.now() }));
    },
  };
  if (typeof module !== "undefined" && module.exports) module.exports = root.MotionGuard;
})(typeof window !== "undefined" ? window : this);
