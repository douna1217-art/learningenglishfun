// Cross-device sync for pets, stars, reading progress and history (optional).
//
// Data is kept PER CHILD: a parent account has up to 2 child profiles (see
// account.js) and every row is stored under the key "<child id>:<name>". Nothing is
// synced until a child profile is active on this device.
//
// What this does:
// - Everything below is ALWAYS kept in localStorage first (the site still works
//   offline and without signing in). When a reader is signed in by email link,
//   these items are additionally backed up to the Supabase `user_state` table
//   (one row per item, readable only by that reader) and pulled back down on
//   any other device signed in with the same email:
//     lef_pet_v1     the pet, its stars, owned items
//     lef_day_v1     stars earned today
//     lef_books_v1   per-book listen / vocab / quiz marks
//     lef_hist_v1    recent reading history
//     lef_stats_v1   learning days (for the streak), stars earned in total, questions reviewed
//     lef_badges_v1  badges earned (id -> time)
//     lef_opens_v1   recently opened books
//     lef_gift       welcome-gift flag
//     les_review_v1  Smart Review records (merge: the higher box of each card wins)
//     les_placement_v1  level-test result (merge: the newer test wins)
//     les-<slug>-v1  one entry per book: which tabs are finished, answers
// - Two devices never silently overwrite each other. Every row has a version
//   number `rev` that the database raises on each change. This device remembers
//   which version it last saw; if the cloud copy changed since and this device
//   also changed, the two copies are MERGED instead of one replacing the other:
//   finished tabs stay finished, owned items from both devices are kept, the
//   richer pet wins on the first link, and so on. The rule is "keep more, never
//   lose".
// - If supabase-config.js still has placeholder values, or nobody is signed in,
//   this file quietly does nothing.
//
// 中文说明：登录后，宠物、星星、每本书的进度、阅读记录会备份到 Supabase 的 user_state
// 表，换设备用同一个邮箱登录就能看到。两台设备都改过同一份数据时不会互相覆盖，而是
// 合并（完成的标签保持完成、两边买到的物品都保留、第一次关联时保留更丰富的那只宠物）。
// 没登录或没配置 Supabase 时，这个文件什么都不做。
(function (root) {
  "use strict";

  // ------------------------------------------------------------------
  // Pure part (no browser APIs): what to sync, how to merge, what to do.
  // Exported for the node tests at the bottom of this section.
  // ------------------------------------------------------------------
  var PET = "lef_pet_v1";
  var DAY = "lef_day_v1";
  var BOOKS = "lef_books_v1";
  var HIST = "lef_hist_v1";
  var OPENS = "lef_opens_v1";
  var GIFT = "lef_gift";
  var REVIEW = "les_review_v1";
  var PLACEMENT = "les_placement_v1";
  var STATS = "lef_stats_v1";
  var BADGES = "lef_badges_v1";
  var HOME_KEYS = [PET, DAY, BOOKS, HIST, OPENS, GIFT, REVIEW, PLACEMENT, STATS, BADGES];
  var BOOK_RE = /^les-.+-v1$/;

  function isHomeKey(k) {
    return HOME_KEYS.indexOf(k) !== -1;
  }
  function isSyncKey(k) {
    return typeof k === "string" && k.length <= 160 && (isHomeKey(k) || BOOK_RE.test(k));
  }
  function isObj(x) {
    return !!x && typeof x === "object" && !Array.isArray(x);
  }
  function clone(x) {
    return x === undefined ? undefined : JSON.parse(JSON.stringify(x));
  }

  // Canonical JSON (sorted keys) so equal data always gives equal text.
  function stable(x) {
    if (x === null || typeof x !== "object") {
      var s = JSON.stringify(x);
      return s === undefined ? "null" : s;
    }
    if (Array.isArray(x)) return "[" + x.map(stable).join(",") + "]";
    return (
      "{" +
      Object.keys(x)
        .sort()
        .map(function (k) {
          return JSON.stringify(k) + ":" + stable(x[k]);
        })
        .join(",") +
      "}"
    );
  }
  function hash(str) {
    var h1 = 5381 | 0,
      h2 = 0x811c9dc5 | 0;
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      h1 = (Math.imul(h1, 33) + c) | 0;
      h2 = Math.imul(h2 ^ c, 16777619) | 0;
    }
    return (h1 >>> 0).toString(16) + "-" + (h2 >>> 0).toString(16) + "-" + str.length;
  }
  // The pet's `last` (touched on every page load) and `hunger` (decays with
  // time) change without the child doing anything, so they do not count as an
  // edit when deciding whether this device has something new to upload.
  function normalize(key, value) {
    if (key === PET && isObj(value)) {
      var c = clone(value);
      delete c.last;
      delete c.hunger;
      delete c.ci; // the colour choice is gone: an old device still writing it is not an edit
      if (c.type === "lizard") c.type = "dino"; // the lizard was replaced by the dino
      return c;
    }
    return value;
  }
  function fingerprint(key, value) {
    return hash(stable(normalize(key, value)));
  }

  function union(a, b) {
    var out = [],
      seen = {};
    [].concat(Array.isArray(a) ? a : [], Array.isArray(b) ? b : []).forEach(function (x) {
      var k = stable(x);
      if (!seen[k]) {
        seen[k] = 1;
        out.push(x);
      }
    });
    return out;
  }

  // Generic "keep more" merge: numbers -> larger, booleans -> OR, objects ->
  // key by key, arrays -> longer one, anything else -> the local value.
  function mergeDeep(a, b) {
    if (a === undefined || a === null) return clone(b);
    if (b === undefined || b === null) return clone(a);
    if (typeof a === "number" && typeof b === "number") return Math.max(a, b);
    if (typeof a === "boolean" && typeof b === "boolean") return a || b;
    if (Array.isArray(a) && Array.isArray(b)) return clone(b.length > a.length ? b : a);
    if (isObj(a) && isObj(b)) {
      var out = {};
      Object.keys(b).forEach(function (k) {
        out[k] = mergeDeep(a[k], b[k]);
      });
      Object.keys(a).forEach(function (k) {
        if (!(k in out)) out[k] = clone(a[k]);
      });
      return out;
    }
    return clone(a);
  }

  function itemCount(p) {
    return (Array.isArray(p.owned) ? p.owned.length : 0) + (Array.isArray(p.toys) ? p.toys.length : 0);
  }
  // Pet: the richer pet wins (more owned items, then more stars, then most
  // recently touched). When both are the same kind of pet, items from both are
  // kept so nothing the child bought is ever lost.
  // Homes: {species: [placed decoration ids]}. Union per species, so a decoration
  // placed on one device never disappears because another device is behind.
  function mergeHome(a, b) {
    var out = {};
    [a, b].forEach(function (h) {
      if (!isObj(h)) return;
      Object.keys(h).forEach(function (k) {
        out[k] = union(out[k], h[k]);
      });
    });
    return out;
  }
  function mergePet(a, b) {
    if (isObj(a) && a.type === "lizard") { a = clone(a); a.type = "dino"; } // old data from before the lizard was replaced
    if (isObj(b) && b.type === "lizard") { b = clone(b); b.type = "dino"; }
    if (!isObj(a) || !a.type) return clone(b);
    if (!isObj(b) || !b.type) return clone(a);
    var richer, other;
    if (itemCount(a) !== itemCount(b)) {
      richer = itemCount(a) > itemCount(b) ? a : b;
    } else if ((a.stars || 0) !== (b.stars || 0)) {
      richer = (a.stars || 0) > (b.stars || 0) ? a : b;
    } else {
      richer = (a.last || 0) >= (b.last || 0) ? a : b;
    }
    other = richer === a ? b : a;
    var out = clone(richer);
    if (other.type === richer.type) {
      out.owned = union(richer.owned, other.owned);
      out.toys = union(richer.toys, other.toys);
      out.eq = Object.assign({}, other.eq || {}, richer.eq || {});
      out.home = mergeHome(other.home, richer.home);
    }
    return out;
  }

  function dateNum(s) {
    var m = /^(\d+)-(\d+)-(\d+)$/.exec(String(s || ""));
    return m ? +m[1] * 10000 + +m[2] * 100 + +m[3] : 0;
  }
  // Stars earned today: the later day wins; the same day keeps the larger
  // counters so the daily cap cannot be dodged by switching device.
  function mergeDay(a, b) {
    if (!isObj(a)) return clone(b);
    if (!isObj(b)) return clone(a);
    if (a.date === b.date) {
      return {
        date: a.date,
        earned: Math.max(a.earned || 0, b.earned || 0),
        books: union(a.books, b.books),
        reviews: Math.max(a.reviews || 0, b.reviews || 0),
      };
    }
    return clone(dateNum(a.date) >= dateNum(b.date) ? a : b);
  }

  // Reading history: one entry per book (newest wins; a known quiz result is
  // kept), most recent 30.
  function mergeHist(a, b) {
    var by = {},
      list = [].concat(Array.isArray(b) ? b : [], Array.isArray(a) ? a : []);
    list.forEach(function (x) {
      if (!isObj(x) || !x.slug) return;
      var cur = by[x.slug];
      if (!cur) {
        by[x.slug] = clone(x);
        return;
      }
      var newer = (x.t || 0) >= (cur.t || 0) ? x : cur;
      var older = newer === x ? cur : x;
      var out = clone(newer);
      if (out.quiz === null || out.quiz === undefined) out.quiz = older.quiz === undefined ? null : older.quiz;
      by[x.slug] = out;
    });
    return Object.keys(by)
      .map(function (k) {
        return by[k];
      })
      .sort(function (x, y) {
        return (x.t || 0) - (y.t || 0);
      })
      .slice(-30);
  }
  function mergeOpens(a, b) {
    return union(b, a).slice(-30);
  }

  // Smart Review: every card (one wrong answer) keeps whichever copy has the
  // higher box; on a tie the local copy stays.
  function mergeReview(a, b) {
    var la = isObj(a) && isObj(a.items) ? a.items : {};
    var lb = isObj(b) && isObj(b.items) ? b.items : {};
    var out = isObj(a) ? clone(a) : isObj(b) ? clone(b) : {};
    var items = {};
    Object.keys(lb).forEach(function (id) {
      items[id] = clone(lb[id]);
    });
    Object.keys(la).forEach(function (id) {
      var l = la[id],
        r = items[id];
      if (!r || ((isObj(l) && l.box) || 1) >= ((isObj(r) && r.box) || 1)) items[id] = clone(l);
    });
    out.items = items;
    return out;
  }
  // Level test: the newer result wins; on a tie the local one stays.
  function mergePlacement(a, b) {
    if (!isObj(a)) return clone(b);
    if (!isObj(b)) return clone(a);
    return clone((b.takenAt || 0) > (a.takenAt || 0) ? b : a);
  }

  // Learning days: every day either device recorded stays (days only ever get added), and the counters keep the
  // larger value, so a streak is never shortened and no star total goes down by syncing.
  function mergeStats(a, b) {
    var days = {},
      out = { days: [], total: 0, reviews: 0 };
    [a, b].forEach(function (s) {
      if (!isObj(s)) return;
      (Array.isArray(s.days) ? s.days : []).forEach(function (d) {
        if (typeof d === "number" && isFinite(d)) days[d] = 1;
      });
      out.total = Math.max(out.total, +s.total || 0);
      out.reviews = Math.max(out.reviews, +s.reviews || 0);
    });
    out.days = Object.keys(days)
      .map(Number)
      .sort(function (x, y) {
        return x - y;
      })
      .slice(-400);
    return out;
  }
  // Badges: every badge either device earned stays, with the earlier time.
  function mergeBadges(a, b) {
    var out = {};
    [a, b].forEach(function (m) {
      if (!isObj(m)) return;
      Object.keys(m).forEach(function (id) {
        var t = +m[id] || 0;
        if (out[id] === undefined || (t && t < out[id])) out[id] = t || out[id] || 1;
      });
    });
    return out;
  }

  function mergeValue(key, local, remote) {
    if (key === STATS) return mergeStats(local, remote);
    if (key === BADGES) return mergeBadges(local, remote);
    if (key === REVIEW) return mergeReview(local, remote);
    if (key === PLACEMENT) return mergePlacement(local, remote);
    if (key === PET) return mergePet(local, remote);
    if (key === DAY) return mergeDay(local, remote);
    if (key === HIST) return mergeHist(local, remote);
    if (key === OPENS) return mergeOpens(local, remote);
    return mergeDeep(local, remote); // books map, gift flag, per-book progress
  }

  // What to do with one key.
  //   local   parsed local value or undefined
  //   remote  {value, rev} or null
  //   base    the cloud `rev` this device last synced for this key (or undefined)
  //   lastFp  fingerprint of the local value at that last sync (or undefined)
  // returns {a: "none" | "same" | "take" | "insert" | "push" | "merge", ...}
  function decide(key, local, remote, base, lastFp) {
    if (key === PET && isObj(local) && !local.type) local = undefined; // blank pet: nothing to back up
    var hasL = local !== undefined && local !== null;
    var hasR = !!remote && remote.value !== undefined && remote.value !== null;
    if (hasR && key === PET && isObj(remote.value) && !remote.value.type) hasR = false;
    if (!hasL && !hasR) return { a: "none" };
    if (!hasL) return { a: "take", value: remote.value, rev: remote.rev };
    var lf = fingerprint(key, local);
    if (!hasR) return { a: "insert", value: local, fp: lf };
    var rf = fingerprint(key, remote.value);
    if (lf === rf) return { a: "same", rev: remote.rev, fp: lf };
    var dirty = lastFp === undefined || lf !== lastFp;
    if (base !== undefined && remote.rev === base) return { a: "push", value: local, rev: remote.rev, fp: lf };
    if (base !== undefined && !dirty) return { a: "take", value: remote.value, rev: remote.rev };
    // both sides changed (or this is the first time this device meets this account)
    return { a: "merge", value: mergeValue(key, local, remote.value), rev: remote.rev };
  }

  var core = {
    HOME_KEYS: HOME_KEYS,
    isSyncKey: isSyncKey,
    isHomeKey: isHomeKey,
    fingerprint: fingerprint,
    mergeValue: mergeValue,
    mergePet: mergePet,
    mergeDay: mergeDay,
    mergeHist: mergeHist,
    mergeOpens: mergeOpens,
    mergeStats: mergeStats,
    mergeBadges: mergeBadges,
    mergeReview: mergeReview,
    mergePlacement: mergePlacement,
    mergeDeep: mergeDeep,
    decide: decide,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = core;
  root.__lesStateSyncCore = core;

  // ------------------------------------------------------------------
  // Browser part
  // ------------------------------------------------------------------
  var cfg = root.SUPABASE_CONFIG;
  var configured =
    root.supabase &&
    cfg &&
    cfg.url &&
    cfg.anonKey &&
    cfg.url.indexOf("YOUR-PROJECT") === -1 &&
    cfg.anonKey.indexOf("YOUR-ANON-KEY") === -1;
  if (!configured || !root.localStorage) return;

  // Shared with sync.js / stats.js so the page only ever creates one client.
  var sb = root.__lesSupabaseClient || (root.__lesSupabaseClient = root.supabase.createClient(cfg.url, cfg.anonKey));
  var ls = root.localStorage;
  var TABLE = "user_state";
  var META_KEY = "les_state_sync_meta_v1";
  var PROFILE_KEY = "les_profile_v1"; // {uid, id}: which child is active on this device (set by account.js)
  var CACHE_KEYS = ["lef_botd_v1"]; // derived caches that must not leak from one child to the next
  var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  var POLL_MS = 4000;
  var uid = null;
  var chain = Promise.resolve();
  var lastFull = 0;
  var lastFullUid = null;
  var backoffUntil = 0;

  function readLocal(k) {
    try {
      var raw = ls.getItem(k);
      return raw === null ? undefined : JSON.parse(raw);
    } catch (e) {
      return undefined;
    }
  }
  function writeLocal(k, v) {
    try {
      ls.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }
  function localSyncKeys() {
    var out = [];
    try {
      for (var i = 0; i < ls.length; i++) {
        var k = ls.key(i);
        if (isSyncKey(k)) out.push(k);
      }
    } catch (e) {}
    return out;
  }
  // the child whose data this device should be syncing (null = nobody yet)
  function activeProfile() {
    try {
      var p = JSON.parse(ls.getItem(PROFILE_KEY) || "null");
      return p && p.uid === uid && typeof p.id === "string" && UUID_RE.test(p.id) ? p.id : null;
    } catch (e) {
      return null;
    }
  }
  function rkey(pid, k) {
    return pid + ":" + k;
  }
  // Meta = what this device last synced for this child (cloud version + a
  // fingerprint of the data). null = this device holds ANOTHER child's data:
  // never mix the two, wait for account.js to switch children properly.
  function loadMeta(forUid, pid) {
    var m = null;
    try {
      m = JSON.parse(ls.getItem(META_KEY) || "null");
    } catch (e) {}
    if (m && m.uid === forUid && m.pid && m.pid !== pid) return null;
    // another account, or a pre-profile meta: the local data is unclaimed, so it
    // is treated as the first link of this child
    if (!m || m.uid !== forUid || m.pid !== pid || !isObj(m.rev) || !isObj(m.fp)) m = { uid: forUid, pid: pid, rev: {}, fp: {} };
    return m;
  }
  function saveMeta(m) {
    try {
      ls.setItem(META_KEY, JSON.stringify(m));
    } catch (e) {}
  }
  function validRemote(k, v) {
    if (!isSyncKey(k) || v === undefined || v === null) return false;
    if (isHomeKey(k) && k !== GIFT && typeof v !== "object") return false;
    return true;
  }
  // a blank pet (not adopted yet) is nothing to back up and never counts as a change
  function nothingToSync(k, v) {
    return v === undefined || (k === PET && isObj(v) && !v.type);
  }
  function dirtyKeys(meta) {
    return localSyncKeys().filter(function (k) {
      var v = readLocal(k);
      if (nothingToSync(k, v)) return false;
      return fingerprint(k, v) !== meta.fp[k];
    });
  }

  async function fetchRemote(pid, keys) {
    var rows = {},
      from = 0,
      page = 500,
      prefix = pid + ":";
    for (;;) {
      var q = sb.from(TABLE).select("key,value,rev").eq("user_id", uid);
      if (keys) {
        q = q.in(
          "key",
          keys.map(function (k) {
            return rkey(pid, k);
          })
        );
      } else {
        q = q.like("key", prefix + "%");
      }
      var res = await q.range(from, from + page - 1);
      if (res.error) throw res.error;
      var data = res.data || [];
      data.forEach(function (r) {
        if (typeof r.key === "string" && r.key.indexOf(prefix) === 0) rows[r.key.slice(prefix.length)] = r;
      });
      if (data.length < page) break;
      from += page;
    }
    return rows;
  }

  // One pass. full=true looks at every row in the cloud (page load / sign in);
  // otherwise only the keys that changed on this device since the last sync.
  async function reconcile(full, opts) {
    opts = opts || {};
    var session = (await sb.auth.getSession()).data.session;
    uid = session ? session.user.id : null;
    if (!uid) return { skipped: "signed-out" };
    var pid = activeProfile();
    if (!pid) return { skipped: "no-child" };
    var meta = loadMeta(uid, pid);
    if (!meta) return { skipped: "other-child" };

    var candidates;
    var remote;
    if (full) {
      remote = await fetchRemote(pid, null);
      var set = {};
      localSyncKeys().forEach(function (k) {
        set[k] = 1;
      });
      Object.keys(remote).forEach(function (k) {
        if (isSyncKey(k)) set[k] = 1;
      });
      candidates = Object.keys(set);
    } else {
      candidates = dirtyKeys(meta);
      if (!candidates.length) return { ok: true };
      remote = {};
      for (var i = 0; i < candidates.length; i += 80) {
        Object.assign(remote, await fetchRemote(pid, candidates.slice(i, i + 80)));
      }
    }

    var inserts = [],
      pushes = [],
      homeChanged = false;

    candidates.forEach(function (k) {
      var r = remote[k] && validRemote(k, remote[k].value) ? remote[k] : null;
      var d = decide(k, readLocal(k), r, meta.rev[k], meta.fp[k]);
      var localFp = readLocal(k) === undefined ? undefined : fingerprint(k, readLocal(k));
      if (d.a === "same") {
        meta.rev[k] = d.rev;
        meta.fp[k] = d.fp;
      } else if (d.a === "take") {
        writeLocal(k, d.value);
        meta.rev[k] = d.rev;
        meta.fp[k] = fingerprint(k, d.value);
        if (isHomeKey(k)) homeChanged = true;
      } else if (d.a === "insert") {
        inserts.push({ key: k, value: d.value, fp: d.fp });
      } else if (d.a === "push") {
        pushes.push({ key: k, value: d.value, rev: d.rev, fp: d.fp });
      } else if (d.a === "merge") {
        var mf = fingerprint(k, d.value);
        var rf = fingerprint(k, r.value);
        if (mf !== localFp) {
          writeLocal(k, d.value);
          if (isHomeKey(k)) homeChanged = true;
        }
        if (mf === rf) {
          meta.rev[k] = d.rev;
          meta.fp[k] = mf; // the cloud already holds the merged result
        } else {
          pushes.push({ key: k, value: d.value, rev: d.rev, fp: mf });
        }
      }
    });

    // new rows, in one request; a row that appeared meanwhile is simply skipped
    // and picked up by the next pass
    for (var j = 0; j < inserts.length; j += 50) {
      var chunk = inserts.slice(j, j + 50);
      var res = await sb
        .from(TABLE)
        .upsert(
          chunk.map(function (x) {
            return { user_id: uid, key: rkey(pid, x.key), value: x.value };
          }),
          { onConflict: "user_id,key", ignoreDuplicates: true }
        )
        .select("key,rev");
      if (res.error) throw res.error;
      (res.data || []).forEach(function (row) {
        var x = chunk.filter(function (c) {
          return rkey(pid, c.key) === row.key;
        })[0];
        if (x) {
          meta.rev[x.key] = row.rev;
          meta.fp[x.key] = x.fp;
        }
      });
    }

    // changes to existing rows: only applied if nobody changed the row since we read it
    for (var n = 0; n < pushes.length; n++) {
      var p = pushes[n];
      var up = await sb
        .from(TABLE)
        .update({ value: p.value })
        .eq("user_id", uid)
        .eq("key", rkey(pid, p.key))
        .eq("rev", p.rev)
        .select("rev");
      if (up.error) throw up.error;
      if (up.data && up.data.length) {
        meta.rev[p.key] = up.data[0].rev;
        meta.fp[p.key] = p.fp;
      }
    }

    saveMeta(meta);

    // The homepage already drew its pet and stars from the OLD local values, so
    // after pulling newer ones, reload once (not while a book is being read).
    if (full && homeChanged && !opts.noReload) reloadOnce();
    return { ok: true };
  }

  function reloadOnce() {
    try {
      var last = +(root.sessionStorage.getItem("les_state_reload_at") || 0);
      if (Date.now() - last < 60000) return;
      root.sessionStorage.setItem("les_state_reload_at", String(Date.now()));
    } catch (e) {
      return;
    }
    try {
      root.location.reload();
    } catch (e) {}
  }

  // all work runs one at a time
  function exclusive(fn) {
    var p = chain.then(fn);
    chain = p.then(
      function () {},
      function () {}
    );
    return p;
  }

  function enqueue(full) {
    return exclusive(function () {
      if (!full && Date.now() < backoffUntil) return;
      return reconcile(full);
    }).catch(function () {
      backoffUntil = Date.now() + 30000; // offline or a temporary error: try again in a while
    });
  }

  function fullSoon() {
    // load + SIGNED_IN fire close together for the same account: do it once.
    // A different account always gets its own pass.
    if (uid === lastFullUid && Date.now() - lastFull < 5000) return;
    lastFull = Date.now();
    lastFullUid = uid;
    enqueue(true);
  }

  // Used by account.js before it switches children: sync everything for the
  // active child right now and say whether the cloud really has all of it.
  // Never reloads the page.
  function flush() {
    return exclusive(async function () {
      var r = await reconcile(true, { noReload: true });
      if (r.skipped === "no-child" || r.skipped === "signed-out") return true; // nothing is being synced, nothing to lose
      if (r.skipped) return false;
      var pid = activeProfile();
      var meta = pid && loadMeta(uid, pid);
      return !!meta && dirtyKeys(meta).length === 0;
    }).then(
      function (v) {
        return v;
      },
      function () {
        return false;
      }
    );
  }

  // Remove the active child's data from this device (after flush() succeeded),
  // so the next child starts from a clean slate. Returns how many items went.
  function clearLocal() {
    var keys = localSyncKeys(),
      n = 0;
    keys.concat(CACHE_KEYS, [META_KEY]).forEach(function (k) {
      try {
        if (ls.getItem(k) !== null) {
          ls.removeItem(k);
          n++;
        }
      } catch (e) {}
    });
    return n;
  }

  sb.auth.onAuthStateChange(function (event, session) {
    uid = session ? session.user.id : null;
    if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) fullSoon();
  });

  // Local changes: noticed by a light check every few seconds, right when a
  // book (iframe) saves, and when the tab is hidden. Nothing is sent unless
  // something actually changed.
  function pollSoon() {
    if (uid) enqueue(false);
  }
  try {
    setInterval(function () {
      if (!root.document.hidden) pollSoon();
    }, POLL_MS);
    root.addEventListener("storage", function (e) {
      if (!e.key || isSyncKey(e.key)) pollSoon();
    });
    root.document.addEventListener("visibilitychange", function () {
      if (root.document.hidden) pollSoon();
    });
    root.addEventListener("pagehide", pollSoon);
  } catch (e) {}

  root.__lesStateSync = {
    syncNow: function () {
      return enqueue(true);
    },
    flush: flush,
    clearLocal: clearLocal,
  };
})(typeof window !== "undefined" ? window : globalThis);
