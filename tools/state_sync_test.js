#!/usr/bin/env node
// Tests for site/state-sync.js: pure merge rules plus whole-page scenarios with a
// fake Supabase server and fake devices (two phones, a shared tablet, offline, races,
// two children on one parent account, switching children).
//   node tools/state_sync_test.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SRC = fs.readFileSync(path.join(__dirname, "..", "site", "state-sync.js"), "utf8");
const core = require(path.join(__dirname, "..", "site", "state-sync.js"));

let passed = 0, failed = 0;
function ok(cond, name, extra) {
  if (cond) { passed++; } else { failed++; console.log("  FAIL:", name, extra === undefined ? "" : JSON.stringify(extra)); }
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ------------------------------------------------------------------ pure rules
function pureTests() {
  const pet = (o) => Object.assign({ type: "cat", ci: 0, name: "Mimi", hunger: 50, stars: 0, owned: [], eq: {}, toys: [], last: 1 }, o);

  // first link: the established pet beats a freshly adopted one
  let m = core.mergePet(pet({ stars: 3, last: 900 }), pet({ stars: 40, owned: ["hat", "bow"], last: 100 }));
  ok(m.owned.length === 2 && m.stars === 40, "richer (more items) pet wins on first link", m);
  // fewer items but more stars wins when item counts tie
  m = core.mergePet(pet({ stars: 3 }), pet({ stars: 40 }));
  ok(m.stars === 40, "tie on items -> more stars wins", m);
  // same kind of pet: items from both devices are kept
  m = core.mergePet(pet({ owned: ["hat"], stars: 10 }), pet({ owned: ["bow"], stars: 12 }));
  ok(eq(m.owned.slice().sort(), ["bow", "hat"]), "owned items from both devices kept", m);
  m = core.mergePet(pet({ toys: ["ball"], stars: 5 }), pet({ toys: ["yarn"], stars: 5, last: 9 }));
  ok(eq(m.toys.slice().sort(), ["ball", "yarn"]), "toys from both devices kept", m);
  // different kinds of pet: the richer one only, no mixing
  m = core.mergePet(pet({ type: "dog", owned: ["bone"] }), pet({ type: "cat", owned: ["hat", "bow"] }));
  ok(m.type === "cat" && m.owned.length === 2, "different pets -> richer one wins whole", m);
  // the lizard was replaced by the dino; clothes (eq.body) and decorated homes are kept from both devices
  m = core.mergePet(pet({ type: "lizard", owned: ["hat"], stars: 9 }), pet({ type: "dino", owned: ["bow"], stars: 9 }));
  ok(m.type === "dino" && eq(m.owned.slice().sort(), ["bow", "hat"]), "lizard data is treated as dino and its items are kept", m);
  m = core.mergePet(pet({ type: "lizard", stars: 3 }), pet({ type: "cat", owned: ["hat", "bow"], stars: 50 }));
  ok(m.type === "cat", "a lizard never wins over a richer cat", m);
  m = core.mergePet(pet({ type: "duck", owned: ["d:duck:boat"], home: { duck: ["boat"] }, eq: { body: "cape" }, stars: 5 }),
    pet({ type: "duck", owned: ["d:duck:frog"], home: { duck: ["frog"], panda: ["lanterns"] }, eq: { hat: "party" }, stars: 5, last: 9 }));
  ok(eq(m.home.duck.slice().sort(), ["boat", "frog"]) && eq(m.home.panda, ["lanterns"]), "decorated homes are merged per species", m);
  ok(m.eq.body === "cape" && m.eq.hat === "party", "clothes and hats from both devices are kept", m);
  m = core.mergePet(pet({ type: "cat", owned: ["hw-pumpkin", "hw-d-bats"], home: { fest: ["hw-d-bats"] }, eq: { body: "hw-pumpkin" }, stars: 5 }),
    pet({ type: "cat", owned: ["hw-d-ghost"], home: { fest: ["hw-d-ghost"] }, stars: 5, last: 9 }));
  ok(eq(m.home.fest.slice().sort(), ["hw-d-bats", "hw-d-ghost"]) && m.eq.body === "hw-pumpkin" && m.owned.indexOf("hw-d-ghost") >= 0, "festival decorations and clothes from both devices are kept", m);
  m = core.mergePet(pet({ type: "cat", owned: ["a"], stars: 1 }), pet({ type: "cat", owned: ["a", "b"], stars: 1 }));
  ok(Array.isArray(m.owned) && m.home === undefined || eq(m.home, {}), "a pet without homes stays valid", m);
  ok(core.fingerprint("lef_pet_v1", pet({ ci: 0 })) === core.fingerprint("lef_pet_v1", pet({ ci: 2 })), "the old colour field is not an edit");
  ok(core.fingerprint("lef_pet_v1", pet({ type: "lizard" })) === core.fingerprint("lef_pet_v1", pet({ type: "dino" })), "lizard and dino look the same to dirty detection");
  ok(core.fingerprint("lef_pet_v1", pet({ home: { cat: ["rug"] } })) !== core.fingerprint("lef_pet_v1", pet({ home: { cat: [] } })), "placing a decoration is an edit");
  ok(core.mergePet({ type: null }, pet({ stars: 4 })).stars === 4, "blank local pet -> remote");
  ok(core.mergePet(pet({ stars: 4 }), { type: null }).stars === 4, "blank remote pet -> local");

  // day
  m = core.mergeDay({ date: "2026-10-10", earned: 3, books: ["a"], reviews: 1 }, { date: "2026-10-10", earned: 5, books: ["b"], reviews: 0 });
  ok(m.earned === 5 && eq(m.books, ["a", "b"]) && m.reviews === 1, "same day: larger counters, books unioned", m);
  m = core.mergeDay({ date: "2026-9-30", earned: 9, books: [], reviews: 0 }, { date: "2026-10-1", earned: 1, books: [], reviews: 0 });
  ok(m.date === "2026-10-1", "later day wins (numeric, not string, compare)", m);

  // history: one entry per book, newest wins, known quiz result kept, capped at 30
  m = core.mergeHist(
    [{ slug: "a", t: 5, quiz: null }, { slug: "b", t: 1, quiz: true }],
    [{ slug: "a", t: 3, quiz: true }, { slug: "c", t: 2, quiz: false }]);
  ok(m.length === 3 && m.find((x) => x.slug === "a").quiz === true && m[m.length - 1].slug === "a", "hist: newest first-class, quiz result kept", m);
  const many = Array.from({ length: 40 }, (_, i) => ({ slug: "s" + i, t: i, quiz: null }));
  ok(core.mergeHist(many.slice(0, 20), many.slice(20)).length === 30, "hist capped at 30");
  ok(core.mergeOpens([{ file: "x" }, { file: "y" }], [{ file: "y" }, { file: "z" }]).length === 3, "opens unioned");

  // per-book progress and the books map: keep more
  m = core.mergeValue("les-b-v1",
    { qIndex: { comprehension: 5, grammar: 0, vocabulary: 0 }, completed: { comprehension: true, grammar: false, vocabulary: false }, attempts: { "grammar-0": 1 } },
    { qIndex: { comprehension: 2, grammar: 3, vocabulary: 0 }, completed: { comprehension: false, grammar: true, vocabulary: false }, attempts: { "grammar-0": 2, "grammar-1": 1 } });
  ok(m.completed.comprehension && m.completed.grammar && !m.completed.vocabulary, "progress: finished tabs from both devices stay finished", m);
  ok(m.qIndex.comprehension === 5 && m.qIndex.grammar === 3 && m.attempts["grammar-0"] === 2 && m.attempts["grammar-1"] === 1, "progress: counters take the larger value", m);
  m = core.mergeValue("lef_books_v1", { a: { fin: 1, listen: 0, vocab: 2, quiz: 0 } }, { a: { fin: 0, listen: 3, vocab: 1, quiz: 1 }, b: { fin: 1, listen: 0, vocab: 0, quiz: 0 } });
  ok(eq(m.a, { fin: 1, listen: 3, vocab: 2, quiz: 1 }) && m.b.fin === 1, "books map merged per book per field", m);
  ok(core.mergeValue("lef_gift", 1, 0) === 1, "gift flag: max");

  // what is synced
  ok(core.isSyncKey("les-the-pajama-parade-v1") && core.isSyncKey("lef_pet_v1"), "synced keys accepted");
  ok(!core.isSyncKey("lef_demo_band") && !core.isSyncKey("lef_hseed") && !core.isSyncKey("lef_botd_v1") && !core.isSyncKey("lef_rv_intro_day") && !core.isSyncKey("les_state_sync_meta_v1") && !core.isSyncKey("les_profile_v1") && !core.isSyncKey("evil"), "demo settings, derived caches, sync bookkeeping and unknown keys are NOT synced");

  // volatile pet fields do not count as an edit
  ok(core.fingerprint("lef_pet_v1", pet({ last: 1, hunger: 90 })) === core.fingerprint("lef_pet_v1", pet({ last: 99999, hunger: 10 })), "pet last/hunger ignored for dirty detection");
  ok(core.fingerprint("lef_pet_v1", pet({ stars: 1 })) !== core.fingerprint("lef_pet_v1", pet({ stars: 2 })), "pet stars change is an edit");

  // decide()
  const R = (value, rev) => ({ value, rev });
  ok(core.decide("lef_gift", undefined, null).a === "none", "decide: nothing anywhere");
  ok(core.decide("lef_gift", undefined, R(1, 3)).a === "take", "decide: only cloud has it -> take");
  ok(core.decide("lef_gift", 1, null).a === "insert", "decide: only local has it -> insert");
  ok(core.decide("lef_pet_v1", { type: null }, null).a === "none", "decide: blank pet is not backed up");
  ok(core.decide("lef_pet_v1", { type: null, stars: 3 }, R(pet({ stars: 7 }), 2)).a === "take", "decide: blank local pet takes the cloud pet");
  ok(core.decide("lef_day_v1", { date: "x", earned: 1 }, R({ date: "x", earned: 1 }, 4), 4, "any").a === "same", "decide: identical -> same");
  const fpOld = core.fingerprint("lef_books_v1", { a: { fin: 0 } });
  ok(core.decide("lef_books_v1", { a: { fin: 1 } }, R({ a: { fin: 0 } }, 5), 5, fpOld).a === "push", "decide: only local changed -> push");
  ok(core.decide("lef_books_v1", { a: { fin: 0 } }, R({ a: { fin: 1 } }, 6), 5, fpOld).a === "take", "decide: only cloud changed -> take");
  ok(core.decide("lef_books_v1", { a: { fin: 2 } }, R({ a: { fin: 1 } }, 6), 5, fpOld).a === "merge", "decide: both changed -> merge");
  ok(core.decide("lef_books_v1", { a: { fin: 2 } }, R({ a: { fin: 1 } }, 6), undefined, undefined).a === "merge", "decide: first link with differing data -> merge");
}

// ------------------------------------------------------------------ fake server / devices
function makeServer() {
  return { rows: {}, writes: 0, selects: 0, beforeUpdate: null };
}
function builder(server, getUid) {
  const q = { op: "select", filters: [], payload: null, opts: null, rng: null, returning: false };
  const api = {
    select() { if (q.op !== "select") q.returning = true; return api; },
    eq(c, v) { q.filters.push(["eq", c, v]); return api; },
    in(c, arr) { q.filters.push(["in", c, arr]); return api; },
    like(c, pat) { q.filters.push(["like", c, pat]); return api; },
    range(a, b) { q.rng = [a, b]; return api; },
    upsert(rows, opts) { q.op = "upsert"; q.payload = rows; q.opts = opts; return api; },
    update(v) { q.op = "update"; q.payload = v; return api; },
    then(res, rej) { return exec().then(res, rej); },
  };
  async function exec() {
    await sleep(1);
    const uid = getUid();
    if (!uid) return { error: { message: "not signed in" } };
    server.rows[uid] = server.rows[uid] || {};
    const mine = server.rows[uid];
    const matches = (key, row) => q.filters.every(([t, c, v]) => {
      if (c === "user_id") return v === uid;
      if (c === "key") return t === "eq" ? key === v : t === "like" ? key.startsWith(v.replace(/%$/, "")) : v.includes(key);
      if (c === "rev") return row.rev === v;
      return true;
    });
    if (q.op === "select") {
      server.selects++;
      let out = Object.keys(mine).filter((k) => matches(k, mine[k])).map((k) => ({ key: k, value: JSON.parse(JSON.stringify(mine[k].value)), rev: mine[k].rev }));
      if (q.rng) out = out.slice(q.rng[0], q.rng[1] + 1);
      return { data: out };
    }
    if (q.op === "upsert") {
      const out = [];
      for (const r of q.payload) {
        if (r.user_id !== uid) return { error: { message: "row-level security" } };
        if (mine[r.key]) continue; // ignoreDuplicates
        mine[r.key] = { value: JSON.parse(JSON.stringify(r.value)), rev: 1 };
        server.writes++;
        out.push({ key: r.key, rev: 1 });
      }
      return { data: out };
    }
    if (q.op === "update") {
      if (server.beforeUpdate) { const h = server.beforeUpdate; server.beforeUpdate = null; h(uid); }
      const out = [];
      Object.keys(mine).forEach((k) => {
        if (!matches(k, mine[k])) return;
        mine[k].value = JSON.parse(JSON.stringify(q.payload.value));
        mine[k].rev += 1;
        server.writes++;
        out.push({ rev: mine[k].rev });
      });
      return { data: out };
    }
  }
  return api;
}

function makeDevice(server, name) {
  const store = {};
  const dev = { name, uid: null, profile: P1, reloads: 0, intervals: [], listeners: {}, store };
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    key: (i) => Object.keys(store)[i] ?? null,
    get length() { return Object.keys(store).length; },
  };
  const session = {};
  const sandbox = {
    console, JSON, Object, Array, String, Number, Math, Date, Promise, Error, RegExp, Intl, Symbol, parseInt,
    setTimeout, clearTimeout,
    setInterval: (fn) => { dev.intervals.push(fn); return dev.intervals.length; },
    localStorage,
    sessionStorage: { getItem: (k) => session[k] ?? null, setItem: (k, v) => { session[k] = String(v); } },
    location: { reload: () => { dev.reloads++; } },
    document: { hidden: false, addEventListener: (ev, fn) => { (dev.listeners["doc:" + ev] = dev.listeners["doc:" + ev] || []).push(fn); } },
    addEventListener: (ev, fn) => { (dev.listeners[ev] = dev.listeners[ev] || []).push(fn); },
    SUPABASE_CONFIG: { url: "https://x.supabase.co", anonKey: "k" },
  };
  sandbox.window = sandbox;
  sandbox.supabase = {
    createClient: () => ({
      auth: {
        getSession: async () => ({ data: { session: dev.uid ? { user: { id: dev.uid } } : null } }),
        onAuthStateChange: (cb) => { dev.authCb = cb; setTimeout(() => cb("INITIAL_SESSION", dev.uid ? { user: { id: dev.uid } } : null), 0); },
      },
      from: () => builder(server, () => dev.uid),
    }),
  };
  vm.createContext(sandbox);
  dev.sandbox = sandbox;
  dev.syncProfile = () => { if (dev.uid && dev.profile) store.les_profile_v1 = JSON.stringify({ uid: dev.uid, id: dev.profile }); };
  dev.load = () => { dev.syncProfile(); return vm.runInContext(SRC, sandbox, { filename: "state-sync.js" }); };
  dev.settle = async () => { for (let i = 0; i < 12; i++) await sleep(8); };
  dev.tick = async () => { dev.intervals.forEach((f) => f()); await dev.settle(); };
  dev.set = (k, v) => { store[k] = JSON.stringify(v); };
  dev.get = (k) => (k in store ? JSON.parse(store[k]) : undefined);
  dev.signIn = async (uid) => { dev.uid = uid; dev.syncProfile(); dev.authCb && dev.authCb("SIGNED_IN", { user: { id: uid } }); await dev.settle(); };
  return dev;
}
const P1 = "11111111-1111-1111-1111-111111111111", P2 = "22222222-2222-2222-2222-222222222222";
const cloud = (server, uid, key, pid = P1) => (server.rows[uid] || {})[pid + ":" + key];
const pet = (o) => Object.assign({ type: "cat", ci: 0, name: "Mimi", hunger: 50, stars: 0, owned: [], eq: {}, toys: [], last: 1 }, o);
const prog = (c, g, v) => ({ qIndex: { comprehension: 0, grammar: 0, vocabulary: 0 }, completed: { comprehension: c, grammar: g, vocabulary: v }, attempts: {} });

async function scenarios() {
  const U = "user-1";
  let s, A, B, C;

  // 1. first device uploads, a fresh device receives everything and reloads once
  s = makeServer(); A = makeDevice(s, "A"); B = makeDevice(s, "B");
  A.set("lef_pet_v1", pet({ stars: 20, owned: ["hat"] })); A.set("lef_gift", 1);
  A.set("les-book1-v1", prog(true, false, false)); A.set("lef_hist_v1", [{ slug: "book1", t: 1, quiz: null }]);
  A.set("les_review_v1", { items: { x: 1 } }); A.set("lef_demo_band", "Grade 3");
  A.uid = U; A.load(); await A.settle();
  ok(cloud(s, U, "lef_pet_v1") && cloud(s, U, "lef_pet_v1").value.stars === 20, "S1 A uploads pet", s.rows);
  ok(cloud(s, U, "les-book1-v1") && cloud(s, U, "lef_gift") && cloud(s, U, "lef_hist_v1"), "S1 A uploads book progress, gift, history");
  ok(cloud(s, U, "les_review_v1") && !cloud(s, U, "lef_demo_band"), "S1 review records are uploaded, the demo setting is not");
  ok(A.reloads === 0, "S1 A does not reload (nothing came down)");
  B.uid = U; B.load(); await B.settle();
  ok(B.get("lef_pet_v1").stars === 20 && eq(B.get("lef_pet_v1").owned, ["hat"]), "S1 B receives the pet with its items", B.store);
  ok(B.get("les-book1-v1").completed.comprehension === true && B.get("lef_gift") === 1, "S1 B receives book progress and gift flag");
  ok(B.reloads === 1, "S1 B reloads once so the page shows the new data", B.reloads);

  // 2. nothing is sent or reloaded again when nothing changed
  const w0 = s.writes;
  await A.tick(); await B.tick(); await B.tick();
  ok(s.writes === w0 && B.reloads === 1, "S2 idle devices do not write or reload", { w0, w: s.writes, r: B.reloads });
  const sel0 = s.selects;
  await A.tick(); await B.tick();
  ok(s.selects === sel0, "S2 idle poll does not even query the server", { sel0, sel: s.selects });

  // 3. A earns stars -> uploaded; B picks it up on its next page load, no conflict
  A.set("lef_pet_v1", pet({ stars: 30, owned: ["hat"], last: 5000, hunger: 10 }));
  await A.tick();
  ok(cloud(s, U, "lef_pet_v1").value.stars === 30 && cloud(s, U, "lef_pet_v1").rev === 2, "S3 A's new stars uploaded (rev 2)", cloud(s, U, "lef_pet_v1"));
  const B2 = makeDevice(s, "B-reopened"); B2.store = B.store; Object.assign(B2.store, B.store);
  const Bload = makeDevice(s, "B-load"); Object.keys(B.store).forEach((k) => (Bload.store[k] = B.store[k])); Bload.uid = U; Bload.load(); await Bload.settle();
  ok(Bload.get("lef_pet_v1").stars === 30 && Bload.reloads === 1, "S3 B gets A's stars on next open (clean local copy simply takes the cloud copy)", Bload.get("lef_pet_v1"));

  // 4. a fresh adopted pet on a new device must NOT replace an established pet (first link)
  s = makeServer(); A = makeDevice(s, "A"); B = makeDevice(s, "B");
  A.set("lef_pet_v1", pet({ stars: 40, owned: ["hat", "bow"], toys: ["ball"] })); A.uid = U; A.load(); await A.settle();
  B.set("lef_pet_v1", pet({ type: "dog", name: "Rex", stars: 3, last: 999999 })); // adopted a minute ago, newer timestamp
  B.uid = U; B.load(); await B.settle();
  ok(B.get("lef_pet_v1").type === "cat" && B.get("lef_pet_v1").owned.length === 2, "S4 established pet wins over a fresh pet on first link", B.get("lef_pet_v1"));
  ok(cloud(s, U, "lef_pet_v1").value.type === "cat" && cloud(s, U, "lef_pet_v1").value.owned.length === 2, "S4 cloud still has the established pet", cloud(s, U, "lef_pet_v1"));

  // 5. both devices changed the same thing offline: merged, nothing lost
  s = makeServer(); A = makeDevice(s, "A"); B = makeDevice(s, "B");
  A.set("les-bk-v1", prog(false, false, false)); A.set("lef_pet_v1", pet({ stars: 10, owned: ["hat"] })); A.uid = U; A.load(); await A.settle();
  B.uid = U; B.load(); await B.settle();                       // B linked and in sync
  A.set("les-bk-v1", prog(true, false, false)); A.set("lef_pet_v1", pet({ stars: 15, owned: ["hat", "bow"] }));
  B.set("les-bk-v1", prog(false, true, false)); B.set("lef_pet_v1", pet({ stars: 12, owned: ["hat", "cape"] }));
  await A.tick();                                              // A reaches the cloud first
  await B.tick();                                              // B meets A's newer copy and merges
  const bk = cloud(s, U, "les-bk-v1").value, pt = cloud(s, U, "lef_pet_v1").value;
  ok(bk.completed.comprehension && bk.completed.grammar, "S5 both devices' finished tabs survive", bk);
  ok(["hat", "bow", "cape"].every((x) => pt.owned.includes(x)), "S5 items bought on both devices survive", pt);
  ok(eq(B.get("les-bk-v1").completed, bk.completed), "S5 device B now shows the merged progress");

  // 6. reset on one device is not resurrected when the other device did not change
  s = makeServer(); A = makeDevice(s, "A"); B = makeDevice(s, "B");
  A.set("les-bk-v1", prog(true, true, false)); A.uid = U; A.load(); await A.settle();
  B.uid = U; B.load(); await B.settle();
  A.set("les-bk-v1", prog(false, false, false));               // "restart practice"
  await A.tick();
  ok(cloud(s, U, "les-bk-v1").value.completed.comprehension === false, "S6 a deliberate restart on one device reaches the cloud (no merge needed)", cloud(s, U, "les-bk-v1"));

  // 7. race: the cloud row changes between our read and our write -> write refused, retried and merged
  s = makeServer(); A = makeDevice(s, "A"); B = makeDevice(s, "B");
  A.set("les-bk-v1", prog(false, false, false)); A.uid = U; A.load(); await A.settle();
  B.uid = U; B.load(); await B.settle();
  A.set("les-bk-v1", prog(true, false, false)); B.set("les-bk-v1", prog(false, false, true));
  s.beforeUpdate = (uid) => { s.rows[uid][P1 + ":les-bk-v1"] = { value: prog(false, true, false), rev: s.rows[uid][P1 + ":les-bk-v1"].rev + 1 }; };
  await A.tick();                                              // refused by the version check
  const after1 = cloud(s, U, "les-bk-v1").value.completed;
  ok(after1.grammar && !after1.comprehension, "S7 a stale write is refused, the other device's change is not overwritten", after1);
  await A.tick();                                              // retry merges
  const after2 = cloud(s, U, "les-bk-v1").value.completed;
  ok(after2.comprehension && after2.grammar, "S7 retry merges both devices' changes", after2);

  // 8. offline / error: nothing breaks, local data untouched, next success catches up
  s = makeServer(); A = makeDevice(s, "A"); A.set("lef_gift", 1); A.uid = U;
  const realFrom = s; s.fail = true;
  A.load(); await A.settle();
  ok(cloud(s, U, "lef_gift") !== undefined, "S8 baseline uploaded (server was fine)");
  A.set("lef_pet_v1", pet({ stars: 8, owned: ["hat"] }));
  const origRows = s.rows; Object.defineProperty(s, "rows", { get() { throw new Error("offline"); }, configurable: true });
  await A.tick();
  Object.defineProperty(s, "rows", { value: origRows, writable: true, configurable: true });
  ok(A.get("lef_pet_v1").stars === 8, "S8 local data intact while offline");

  // 9. not signed in: nothing happens
  s = makeServer(); A = makeDevice(s, "A"); A.set("lef_pet_v1", pet({ stars: 8 })); A.load(); await A.settle(); await A.tick();
  ok(s.writes === 0 && s.selects === 0 && A.reloads === 0, "S9 signed-out device never touches the server", { w: s.writes, sel: s.selects });

  // 10. a different account on the same browser is treated as a first link, never overwrites blindly
  s = makeServer(); A = makeDevice(s, "A");
  A.set("lef_pet_v1", pet({ stars: 40, owned: ["hat", "bow"] })); A.uid = "user-1"; A.load(); await A.settle();
  s.rows["user-2"] = { [P2 + ":lef_pet_v1"]: { value: pet({ type: "dog", name: "Rex", stars: 2 }), rev: 4 } };
  A.profile = P2;
  await A.signIn("user-2");
  ok(cloud(s, "user-2", "lef_pet_v1", P2).value.type === "cat", "S10 richer pet wins on the first link of another account (documented limitation of shared browsers)", cloud(s, "user-2", "lef_pet_v1", P2));
  ok(cloud(s, "user-1", "lef_pet_v1").value.type === "cat" && cloud(s, "user-1", "lef_pet_v1").rev === 1, "S10 the first account's cloud data was not touched", cloud(s, "user-1", "lef_pet_v1"));

  // 11. hostile / odd cloud data is ignored
  s = makeServer(); A = makeDevice(s, "A");
  s.rows[U] = { [P1 + ":evil"]: { value: { x: 1 }, rev: 1 }, [P1 + ":lef_pet_v1"]: { value: "not-an-object", rev: 1 }, [P1 + ":les-ok-v1"]: { value: prog(true, true, true), rev: 1 }, [P1 + ":lef_hist_v1"]: { value: null, rev: 1 }, "lef_pet_v1": { value: pet({ stars: 99 }), rev: 1 }, [P2 + ":lef_pet_v1"]: { value: pet({ stars: 77 }), rev: 1 } };
  A.uid = U; A.load(); await A.settle();
  ok(A.get("evil") === undefined && A.get("lef_pet_v1") === undefined && A.get("les-ok-v1").completed.vocabulary === true && A.get("lef_hist_v1") === undefined, "S11 unknown keys, wrong shapes and nulls are ignored; valid rows still arrive", A.store);
  ok(A.get("lef_pet_v1") === undefined, "S11 the old account-level pet row and the other child's pet row are not pulled into this child");

  // 12. a blank pet (not adopted yet) is not uploaded and does not block receiving a real one
  s = makeServer(); A = makeDevice(s, "A"); B = makeDevice(s, "B");
  A.set("lef_pet_v1", pet({ stars: 6 })); A.uid = U; A.load(); await A.settle();
  B.set("lef_pet_v1", { type: null, stars: 0, owned: [], toys: [], eq: {} }); B.uid = U; B.load(); await B.settle();
  ok(B.get("lef_pet_v1").type === "cat" && B.get("lef_pet_v1").stars === 6, "S12 blank pet is replaced by the real one", B.get("lef_pet_v1"));
  s = makeServer(); C = makeDevice(s, "C"); C.set("lef_pet_v1", { type: null, stars: 0 }); C.uid = U; C.load(); await C.settle();
  ok(cloud(s, U, "lef_pet_v1") === undefined, "S12 blank pet is not uploaded");

  // 13. reload guard: never more than one reload per minute even if the cloud keeps changing
  s = makeServer(); A = makeDevice(s, "A"); B = makeDevice(s, "B");
  A.set("lef_pet_v1", pet({ stars: 5, owned: ["a"] })); A.uid = U; A.load(); await A.settle();
  B.uid = U; B.load(); await B.settle();
  ok(B.reloads === 1, "S13 first reload happens", B.reloads);
  A.set("lef_pet_v1", pet({ stars: 9, owned: ["a", "b"] })); await A.tick();
  await B.signIn(U);
  ok(B.reloads === 1, "S13 a second reload inside a minute is suppressed", B.reloads);

  // 14. many books at once (first link with 300 books) uploads in a few requests
  s = makeServer(); A = makeDevice(s, "A");
  for (let i = 0; i < 300; i++) A.set("les-book-" + i + "-v1", prog(true, false, false));
  A.uid = U; A.load(); await A.settle();
  ok(Object.keys(s.rows[U] || {}).length === 300, "S14 300 books uploaded", Object.keys(s.rows[U] || {}).length);
  B = makeDevice(s, "B"); B.uid = U; B.load(); await B.settle();
  ok(Object.keys(B.store).filter((k) => /^les-book-/.test(k)).length === 300, "S14 300 books downloaded");
}


async function profileScenarios() {
  const U = "parent-1";
  let s, A, B;
  const review = (items) => ({ items });
  const card = (box) => ({ book: "b", box, due: "2026-10-10", lastResult: box > 1 ? "correct" : "wrong" });

  // 15. two children on one parent account stay completely separate, on one device
  s = makeServer(); A = makeDevice(s, "A");
  A.set("lef_pet_v1", pet({ name: "Mochi", stars: 20, owned: ["hat"] })); A.set("les-b1-v1", prog(true, false, false)); A.set("les_review_v1", review({ x: card(3) }));
  A.uid = U; A.profile = P1; A.load(); await A.settle();
  ok(cloud(s, U, "lef_pet_v1", P1) && !cloud(s, U, "lef_pet_v1", P2), "S15 first child's data is stored under the first child's id");
  ok(s.rows[U][P1 + ":les_review_v1"] && s.rows[U][P1 + ":les_review_v1"].value.items.x.box === 3, "S15 review records are stored per child too");
  ok(!Object.keys(s.rows[U]).some((k) => !k.includes(":")), "S15 nothing is written without a child id");
  // switch to the second child exactly as account.js does: flush, clear, activate, reload
  const flushed = await A.sandbox.window.__lesStateSync.flush();
  ok(flushed === true, "S15 flush says the cloud has everything");
  const cleared = A.sandbox.window.__lesStateSync.clearLocal();
  ok(cleared >= 4 && A.get("lef_pet_v1") === undefined && A.get("les-b1-v1") === undefined && A.get("les_review_v1") === undefined && A.store.les_state_sync_meta_v1 === undefined, "S15 clearing wipes the first child's data and the sync bookkeeping from this device", { cleared, keys: Object.keys(A.store) });
  A.profile = P2; A.syncProfile();
  const A2 = makeDevice(s, "A-reloaded"); Object.assign(A2.store, A.store); A2.uid = U; A2.profile = P2; A2.load(); await A2.settle();
  ok(A2.get("lef_pet_v1") === undefined, "S15 second child starts with a clean slate (no pet from the first child)");
  A2.set("lef_pet_v1", pet({ name: "Rex", type: "dog", stars: 4 })); A2.set("les_review_v1", review({ y: card(2) }));
  await A2.tick();
  ok(cloud(s, U, "lef_pet_v1", P2).value.name === "Rex" && cloud(s, U, "lef_pet_v1", P1).value.name === "Mochi", "S15 each child's pet is saved under their own id", { p1: cloud(s, U, "lef_pet_v1", P1), p2: cloud(s, U, "lef_pet_v1", P2) });
  // switch back
  ok(await A2.sandbox.window.__lesStateSync.flush() === true, "S15 flush before switching back");
  A2.sandbox.window.__lesStateSync.clearLocal();
  const A3 = makeDevice(s, "A-back"); Object.assign(A3.store, A2.store); A3.uid = U; A3.profile = P1; A3.load(); await A3.settle();
  ok(A3.get("lef_pet_v1").name === "Mochi" && A3.get("les_review_v1").items.x.box === 3 && !A3.get("les_review_v1").items.y && A3.get("les-b1-v1").completed.comprehension === true, "S15 switching back restores the first child's pet, review records and book progress, with nothing from the second child", A3.store);
  ok(A3.reloads === 1, "S15 the page reloads once after loading the other child's data", A3.reloads);

  // 16. a device never mixes two children's data by accident
  s = makeServer(); A = makeDevice(s, "A");
  A.set("lef_pet_v1", pet({ stars: 20, owned: ["hat"] })); A.uid = U; A.profile = P1; A.load(); await A.settle();
  const w0 = s.writes;
  A.profile = P2; A.syncProfile();                      // somebody flips the active child WITHOUT flush + clear
  A.set("lef_pet_v1", pet({ stars: 21, owned: ["hat"] }));
  await A.tick(); await A.sandbox.window.__lesStateSync.syncNow(); await A.settle();
  ok(s.writes === w0 && !cloud(s, U, "lef_pet_v1", P2), "S16 data that belongs to the first child is NOT written into the second child's rows", { w0, w: s.writes });
  ok(await A.sandbox.window.__lesStateSync.flush() === false, "S16 flush refuses to claim success when the device holds another child's data");

  // 17. review records and the level test merge sensibly
  s = makeServer(); A = makeDevice(s, "A"); B = makeDevice(s, "B");
  A.set("les_review_v1", review({ q1: card(2), q2: card(4) })); A.set("les_placement_v1", { takenAt: 100, grade: "2" });
  A.uid = U; A.profile = P1; A.load(); await A.settle();
  B.set("les_review_v1", review({ q1: card(5), q3: card(1) })); B.set("les_placement_v1", { takenAt: 200, grade: "3" });
  B.uid = U; B.profile = P1; B.load(); await B.settle();
  const mr = B.get("les_review_v1").items;
  ok(mr.q1.box === 5 && mr.q2.box === 4 && mr.q3.box === 1, "S17 first link: every review card keeps its higher box and no card is lost", mr);
  ok(B.get("les_placement_v1").takenAt === 200 && B.get("les_placement_v1").grade === "3", "S17 the newer level-test result wins");
  ok(core.mergeReview(review({ a: card(2) }), review({ a: card(2) })).items.a.box === 2, "S17 equal boxes: local stays");
  ok(core.isSyncKey("les_review_v1") && core.isSyncKey("les_placement_v1"), "S17 review and placement are now synced keys");
  // the sight-word games: best scores, castles, the aquarium
  ok(core.GAME_KEYS.every(core.isSyncKey) && !core.isHomeKey("lef_fish_v1"), "game keys are synced but are not home keys (no page reload)");
  let g = core.mergeValue("lef_space_v1", { best: 120, boom: 9, lvl: 3.2 }, { best: 90, boom: 14, lvl: 2 });
  ok(g.best === 120 && g.boom === 14 && g.lvl === 3.2, "game numbers: the larger one wins", g);
  g = core.mergeValue("lef_sling_v1", { done: { 1: true }, best: { 1: 50 }, lvl: 1 }, { done: { 2: true }, best: { 1: 80, 2: 30 }, lvl: 2 });
  ok(g.done[1] && g.done[2] && g.best[1] === 80 && g.best[2] === 30, "castles won on either device stay won", g);
  g = core.mergeValue("lef_fish_v1", { a: 2, b: 1 }, { b: 3, c: 1 });
  ok(g.a === 2 && g.b === 3 && g.c === 1, "fish collection: every species either device caught stays", g);
  g = core.mergeValue("lef_fishlist_v1", [{ s: "a", w: "go" }, { s: "b", w: "me" }], [{ s: "b", w: "me" }, { s: "c", w: "up" }]);
  ok(g.length === 3 && g.some((x) => x.s === "c") && g.some((x) => x.s === "a"), "tank: catches from both devices, no duplicates", g);
  const many = Array.from({ length: 20 }, (_, i) => ({ s: "x" + i, w: "w" + i }));
  ok(core.mergeValue("lef_fishlist_v1", many, []).length === 12, "tank keeps the newest 12");


  // 18. a child who has not adopted a pet yet does not make the page poll the server
  s = makeServer(); A = makeDevice(s, "A");
  A.set("lef_pet_v1", { type: null, stars: 0, owned: [], toys: [], eq: {} });
  A.uid = U; A.profile = P1; A.load(); await A.settle();
  const sel0 = s.selects;
  for (let i = 0; i < 4; i++) await A.tick();
  ok(s.selects === sel0 && s.writes === 0, "S18 a blank pet causes no server requests while idle", { sel0, sel: s.selects });

  // 19. nothing syncs until a child is chosen; local data stays untouched
  s = makeServer(); A = makeDevice(s, "A");
  A.set("lef_pet_v1", pet({ stars: 9 })); A.uid = U; A.profile = null; A.load(); await A.settle(); await A.tick();
  ok(s.writes === 0 && s.selects === 0 && A.get("lef_pet_v1").stars === 9 && A.reloads === 0, "S19 signed in but no child chosen yet: no requests, local data untouched");
  A.profile = P1; A.syncProfile(); await A.sandbox.window.__lesStateSync.syncNow(); await A.settle();
  ok(cloud(s, U, "lef_pet_v1", P1) && cloud(s, U, "lef_pet_v1", P1).value.stars === 9, "S19 once the first child exists, the progress this device already had becomes that child's");

  // 20. flush reports failure honestly when the server is unreachable
  s = makeServer(); A = makeDevice(s, "A");
  A.set("lef_pet_v1", pet({ stars: 5, owned: ["a"] })); A.uid = U; A.profile = P1; A.load(); await A.settle();
  A.set("lef_pet_v1", pet({ stars: 6, owned: ["a"] }));
  const origRows = s.rows; Object.defineProperty(s, "rows", { get() { throw new Error("offline"); }, configurable: true });
  ok(await A.sandbox.window.__lesStateSync.flush() === false, "S20 offline: flush returns false so the child switch is refused");
  Object.defineProperty(s, "rows", { value: origRows, writable: true, configurable: true });
  ok(A.get("lef_pet_v1").stars === 6, "S20 the unsaved progress is still on the device");
  ok(await A.sandbox.window.__lesStateSync.flush() === true && cloud(s, U, "lef_pet_v1", P1).value.stars === 6, "S20 back online: flush uploads it and returns true");
}

(async () => {
  console.log("pure merge rules ...");
  pureTests();
  console.log("device scenarios ...");
  await scenarios();
  console.log("child profile scenarios ...");
  await profileScenarios();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
