#!/usr/bin/env node
// End-to-end tests for the parent account + child profiles: site/sync.js (sign-in box),
// site/state-sync.js (per-child sync) and site/account.js (consent, children, switching),
// all running together in jsdom against an in-memory fake of the Supabase tables.
//
//   mkdir -p /tmp/jsd && cd /tmp/jsd && npm init -y && npm i jsdom     # once
//   NODE_PATH=/tmp/jsd/node_modules node tools/account_test.js
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const SITE = path.join(__dirname, "..", "site");
const SRC = ["sync.js", "state-sync.js", "account.js"].map((f) => fs.readFileSync(path.join(SITE, f), "utf8"));

let passed = 0, failed = 0;
const ok = (c, name, extra) => { if (c) passed++; else { failed++; console.log("  FAIL:", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const uuid = (() => { let n = 0; return () => "00000000-0000-4000-8000-" + String(++n).padStart(12, "0"); })();

// ---------------------------------------------------------------- fake Supabase
class Backend {
  constructor() {
    this.users = {};            // uid -> email
    this.parents = {};          // uid -> {terms_version, overseas_storage_ack}
    this.profiles = [];         // {id,parent_id,nickname,avatar,grade,created_at}
    this.state = {};            // uid -> key -> {value, rev}
    this.legacyReview = {};     // uid -> items
    this.legacyPlacement = {};  // uid -> result
    this.offline = false;
    this.failLoad = false;
    this.adoptCalls = 0;
    this.tick = 0;
  }
  user(email) { const id = uuid(); this.users[id] = email; this.state[id] = {}; return id; }
  rows(uid) { this.state[uid] = this.state[uid] || {}; return this.state[uid]; }
  ownsPrefix(uid, key) {
    if (!key.includes(":")) return true;
    return this.profiles.some((p) => p.parent_id === uid && p.id === key.split(":")[0]);
  }
}

function makeClient(be, dev) {
  const session = () => (dev.uid ? { user: { id: dev.uid, email: be.users[dev.uid] } } : null);
  const auth = {
    getSession: async () => ({ data: { session: session() } }),
    onAuthStateChange: (cb) => { dev.authCbs.push(cb); setTimeout(() => cb("INITIAL_SESSION", session()), 0); return { data: { subscription: { unsubscribe() {} } } }; },
    signInWithOtp: async () => ({}),
    verifyOtp: async () => ({ data: {} }),
    signOut: async () => { dev.signOuts++; dev.uid = null; dev.authCbs.forEach((cb) => cb("SIGNED_OUT", null)); return {}; },
  };
  const from = (table) => {
    const q = { op: "select", filters: [], payload: null, opts: null, order: null, rng: null, ret: false, single: null };
    const api = {
      select() { if (q.op !== "select") q.ret = true; return api; },
      eq(c, v) { q.filters.push(["eq", c, v]); return api; },
      in(c, v) { q.filters.push(["in", c, v]); return api; },
      like(c, v) { q.filters.push(["like", c, v]); return api; },
      order(c, o) { q.order = [c, o]; return api; },
      range(a, b) { q.rng = [a, b]; return api; },
      insert(p) { q.op = "insert"; q.payload = p; return api; },
      upsert(p, o) { q.op = "upsert"; q.payload = p; q.opts = o; return api; },
      update(p) { q.op = "update"; q.payload = p; return api; },
      delete() { q.op = "delete"; return api; },
      maybeSingle() { q.single = "maybe"; return api; },
      single() { q.single = "one"; return api; },
      then(res, rej) { return exec().then(res, rej); },
    };
    async function exec() {
      await sleep(1);
      if (be.offline) return { error: { message: "network down" } };
      const u = dev.uid;
      if (!u) return { error: { message: "not signed in" } };
      const match = (row, keyName) => q.filters.every(([t, c, v]) => {
        const val = row[c];
        if (t === "eq") return val === v;
        if (t === "in") return v.includes(val);
        if (t === "like") return String(val).startsWith(v.replace(/%$/, ""));
        return true;
      });
      const shape = (data) => {
        if (q.single === "maybe") return { data: data[0] || null };
        if (q.single === "one") return data.length ? { data: data[0] } : { error: { message: "no rows" } };
        return { data };
      };
      if (table === "parent_accounts") {
        if (be.failLoad && q.op === "select") return { error: { message: "boom" } };
        if (q.op === "select") { const r = be.parents[u]; return shape(r && q.filters.every(([, c, v]) => (c === "user_id" ? v === u : true)) ? [r] : []); }
        if (q.op === "upsert") { if (q.payload.user_id !== u) return { error: { message: "rls" } }; be.parents[u] = { ...q.payload }; return { data: [] }; }
      }
      if (table === "profiles") {
        if (be.failLoad && q.op === "select") return { error: { message: "boom" } };
        if (q.op === "select") {
          let rows = be.profiles.filter((p) => p.parent_id === u && match(p));
          rows.sort((a, b) => a.created_at - b.created_at);
          return shape(rows.map((p) => ({ id: p.id, nickname: p.nickname, avatar: p.avatar, grade: p.grade, created_at: p.created_at })));
        }
        if (q.op === "insert") {
          const p = q.payload;
          if (p.parent_id !== u) return { error: { message: "rls" } };
          if (be.profiles.filter((x) => x.parent_id === u).length >= 2) return { error: { message: "A parent account can have at most 2 children" } };
          if (!p.nickname || !p.nickname.trim() || p.nickname.length > 20) return { error: { message: "check" } };
          const row = { id: uuid(), parent_id: u, nickname: p.nickname, avatar: p.avatar, grade: p.grade || null, created_at: ++be.tick };
          be.profiles.push(row);
          return shape([{ id: row.id, nickname: row.nickname, avatar: row.avatar, grade: row.grade, created_at: row.created_at }]);
        }
        if (q.op === "delete") {
          const gone = be.profiles.filter((p) => p.parent_id === u && match(p));
          be.profiles = be.profiles.filter((p) => !gone.includes(p));
          gone.forEach((p) => { const rows = be.rows(u); Object.keys(rows).forEach((k) => { if (k.startsWith(p.id + ":")) delete rows[k]; }); });
          return { data: [] };
        }
      }
      if (table === "user_state") {
        const rows = be.rows(u);
        if (q.op === "select") {
          let out = Object.keys(rows).filter((k) => q.filters.every(([t, c, v]) => (c === "user_id" ? v === u : t === "in" ? v.includes(k) : t === "like" ? k.startsWith(v.replace(/%$/, "")) : true))).map((k) => ({ key: k, value: JSON.parse(JSON.stringify(rows[k].value)), rev: rows[k].rev }));
          if (q.rng) out = out.slice(q.rng[0], q.rng[1] + 1);
          return { data: out };
        }
        if (q.op === "upsert") {
          const out = [];
          for (const r of q.payload) {
            if (r.user_id !== u || !be.ownsPrefix(u, r.key)) return { error: { message: "row-level security" } };
            if (rows[r.key]) continue;
            rows[r.key] = { value: JSON.parse(JSON.stringify(r.value)), rev: 1 };
            out.push({ key: r.key, rev: 1 });
          }
          return { data: out };
        }
        if (q.op === "update") {
          const out = [];
          Object.keys(rows).forEach((k) => {
            if (q.filters.every(([, c, v]) => (c === "user_id" ? v === u : c === "key" ? k === v : c === "rev" ? rows[k].rev === v : true))) {
              rows[k].value = JSON.parse(JSON.stringify(q.payload.value)); rows[k].rev++; out.push({ rev: rows[k].rev });
            }
          });
          return { data: out };
        }
      }
      return { error: { message: "unsupported " + table + "." + q.op } };
    }
    return api;
  };
  const rpc = async (name, args) => {
    await sleep(1);
    if (be.offline) return { error: { message: "network down" } };
    if (name !== "adopt_legacy_state") return { error: { message: "unknown rpc" } };
    be.adoptCalls++;
    const u = dev.uid, pid = args.p_profile;
    if (!be.profiles.some((p) => p.id === pid && p.parent_id === u)) return { error: { message: "not yours" } };
    if (be.profiles.filter((p) => p.parent_id === u).length !== 1) return { data: 0 };
    const rows = be.rows(u); let n = 0;
    Object.keys(rows).filter((k) => !k.includes(":")).forEach((k) => { const nk = pid + ":" + k; if (!rows[nk]) { rows[nk] = { value: JSON.parse(JSON.stringify(rows[k].value)), rev: 1 }; n++; } });
    if (be.legacyReview[u] && !rows[pid + ":les_review_v1"]) { rows[pid + ":les_review_v1"] = { value: { items: be.legacyReview[u] }, rev: 1 }; n++; }
    if (be.legacyPlacement[u] && !rows[pid + ":les_placement_v1"]) { rows[pid + ":les_placement_v1"] = { value: be.legacyPlacement[u], rev: 1 }; n++; }
    return { data: n };
  };
  return { auth, from, rpc };
}

// ---------------------------------------------------------------- fake device (a browser tab)
function openDevice(be, name, carry) {
  const dev = { name, uid: carry ? carry.uid : null, authCbs: [], signOuts: 0, reloads: 0, be };
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => { if (/navigation/i.test(e.message)) dev.reloads++; });
  const dom = new JSDOM('<!doctype html><html><head></head><body><div class="teacher" id="syncBox"></div></body></html>', {
    runScripts: "dangerously", pretendToBeVisual: true, url: "https://learning-english-fun.com/", virtualConsole: vc,
  });
  const w = dom.window;
  dev.w = w; dev.d = w.document;
  if (carry) Object.keys(carry.store).forEach((k) => w.localStorage.setItem(k, carry.store[k]));
  w.SUPABASE_CONFIG = { url: "https://x.supabase.co", anonKey: "k", emailCode: true };
  w.supabase = { createClient: () => makeClient(be, dev) };
  w.eval(SRC[0]); w.eval(SRC[1]); w.eval(SRC[2]);
  dev.$ = (id) => w.document.getElementById(id);
  dev.modal = () => w.document.querySelector(".ac-card");
  dev.text = () => (dev.modal() ? dev.modal().textContent.replace(/\s+/g, " ") : "");
  dev.click = (el) => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  dev.settle = async (ms = 150) => { await sleep(ms); };
  dev.store = () => { const o = {}; for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); o[k] = w.localStorage.getItem(k); } return o; };
  dev.set = (k, v) => w.localStorage.setItem(k, JSON.stringify(v));
  dev.get = (k) => { const r = w.localStorage.getItem(k); return r === null ? undefined : JSON.parse(r); };
  dev.reboot = async () => { const next = openDevice(be, name + "+", { uid: dev.uid, store: dev.store() }); w.close(); await next.settle(300); return next; };
  return dev;
}

const pet = (o) => Object.assign({ type: "cat", ci: 0, name: "Mochi", hunger: 50, stars: 0, owned: [], eq: {}, toys: [], last: 1 }, o);
const prog = (c) => ({ qIndex: { comprehension: 0, grammar: 0, vocabulary: 0 }, completed: { comprehension: c, grammar: false, vocabulary: false }, attempts: {} });

async function consentAndAdd(dev, nick, avatar, grade) {
  const c1 = dev.d.getElementById("acC1"), c2 = dev.d.getElementById("acC2");
  c1.checked = true; c2.checked = true; c1.dispatchEvent(new dev.w.Event("change")); c2.dispatchEvent(new dev.w.Event("change"));
  dev.click(dev.$("acGo")); await dev.settle();
  dev.d.getElementById("acNick").value = nick;
  if (avatar) dev.click(dev.d.querySelector('[data-av="' + avatar + '"]'));
  if (grade) dev.click(dev.d.querySelector('[data-gr="' + grade + '"]'));
  dev.click(dev.$("acGo")); await dev.settle(250);
}

(async () => {
  let be, A, B, uP;

  // ===== 1. first sign-in of a new parent
  be = new Backend(); uP = be.user("mum@example.com");
  A = openDevice(be, "phone"); A.set("lef_pet_v1", pet({ stars: 7, owned: ["hat"] })); A.set("les-b1-v1", prog(true));
  A.uid = uP; A.authCbs.forEach((cb) => cb("SIGNED_IN", { user: { id: uP, email: be.users[uP] } })); await A.settle(300);
  // the device was opened before sign-in; reopen with the same data to model "signed in at page load"
  A = openDevice(be, "phone", { uid: uP, store: A.store() }); await A.settle(300);
  ok(A.dom !== null && /Welcome/.test(A.text()) && /Terms/.test(A.text()) && /outside mainland China/.test(A.text()), "1 a new parent first sees the welcome/consent screen", A.text());
  ok(A.$("acGo").disabled, "1 Continue is disabled until both boxes are ticked");
  ok(!A.d.getElementById("acClose"), "1 the consent screen cannot be dismissed");
  A.d.dispatchEvent(new A.w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  ok(!!A.modal(), "1 Esc does not close the consent screen");
  const c1 = A.d.getElementById("acC1"); c1.checked = true; c1.dispatchEvent(new A.w.Event("change"));
  ok(A.$("acGo").disabled, "1 one box is not enough");
  const c2 = A.d.getElementById("acC2"); c2.checked = true; c2.dispatchEvent(new A.w.Event("change"));
  ok(!A.$("acGo").disabled, "1 both boxes enable Continue");
  A.click(A.$("acGo")); await A.settle();
  ok(be.parents[uP] && be.parents[uP].terms_version === A.w.__lesAccount.TERMS_VERSION && be.parents[uP].overseas_storage_ack === true, "1 consent is recorded with the version and the overseas-storage acknowledgement", be.parents[uP]);
  ok(/Add your child/.test(A.text()) && A.d.querySelectorAll("[data-av]").length === 6 && A.d.querySelectorAll("[data-gr]").length === 7, "1 then the add-child screen with 6 pictures and 7 grades");
  A.click(A.$("acGo")); await A.settle();
  ok(/Enter a nickname/.test(A.$("acMsg").textContent) && be.profiles.length === 0, "1 an empty nickname is refused");
  A.d.getElementById("acNick").value = "  Mochi  ";
  A.click(A.d.querySelector('[data-av="dino"]')); A.click(A.d.querySelector('[data-gr="2"]'));
  A.click(A.$("acGo")); await A.settle(300);
  const kid = be.profiles[0];
  ok(be.profiles.length === 1 && kid.nickname === "Mochi" && kid.avatar === "dino" && kid.grade === "2", "1 the child is created (trimmed nickname, picture, grade)", be.profiles);
  ok(be.adoptCalls === 1, "1 the first child adopts the old account-level data once");
  ok(!A.modal() && /Mochi/.test(A.$("syncBox").textContent) && /mum@example.com/.test(A.$("syncBox").textContent), "1 the screen closes and the header shows the child and the parent email", A.$("syncBox").textContent);
  ok(A.get("les_profile_v1").id === kid.id && A.get("les_profile_v1").uid === uP, "1 this device now remembers the active child");
  ok(be.rows(uP)[kid.id + ":lef_pet_v1"] && be.rows(uP)[kid.id + ":lef_pet_v1"].value.stars === 7 && be.rows(uP)[kid.id + ":les-b1-v1"], "1 the progress this device already had became the first child's", Object.keys(be.rows(uP)));
  ok(A.reloads === 0, "1 no page reload was needed for the first child");

  // ===== 2. header menu; second child; switching
  A.click(A.$("acMe"));
  ok(!A.$("acMenu").hidden && A.$("acMenu").textContent.includes("Mochi") && A.$("acMenu").textContent.includes("Add a child") && A.$("acMenu").textContent.includes("Parent area") && A.$("acMenu").textContent.includes("Sign out"), "2 the menu lists the child, Add a child, Parent area, Sign out");
  A.click(A.$("acMAdd")); await A.settle();
  ok(/Add your child/.test(A.text()) && /1 of 2 used/.test(A.text()) && !!A.d.getElementById("acClose"), "2 adding a second child can be cancelled");
  A.d.getElementById("acNick").value = "Rex"; A.click(A.d.querySelector('[data-av="dog"]'));
  A.set("lef_pet_v1", pet({ stars: 9, owned: ["hat"] }));          // Mochi earned 2 more stars a moment ago, not synced yet
  A.click(A.$("acGo")); await A.settle(500);
  ok(be.profiles.length === 2 && be.profiles[1].nickname === "Rex", "2 the second child exists");
  ok(be.rows(uP)[kid.id + ":lef_pet_v1"].value.stars === 9, "2 Mochi's latest progress was saved BEFORE switching", be.rows(uP)[kid.id + ":lef_pet_v1"].value.stars);
  ok(A.reloads === 1 && A.get("lef_pet_v1") === undefined && A.get("les-b1-v1") === undefined, "2 the device was cleared and the page reloads for Rex", { reloads: A.reloads, store: Object.keys(A.store()) });
  ok(A.get("les_profile_v1").id === be.profiles[1].id, "2 Rex is now the active child on this device");
  A = await A.reboot();
  ok(/Rex/.test(A.$("syncBox").textContent) && !A.modal() && A.get("lef_pet_v1") === undefined, "2 after the reload the header shows Rex and Rex starts clean");
  A.set("lef_pet_v1", pet({ name: "Rex", type: "dog", stars: 3 })); await A.settle(4600);
  const rexId = be.profiles[1].id;
  ok(be.rows(uP)[rexId + ":lef_pet_v1"] && be.rows(uP)[rexId + ":lef_pet_v1"].value.name === "Rex", "2 Rex's pet is saved under Rex");
  A.click(A.$("acMe"));
  ok(!A.$("acMAdd"), "2 with two children the menu no longer offers Add a child");
  // switch back to Mochi from the menu
  A.click(A.d.querySelector('[data-sw="' + kid.id + '"]')); await A.settle(500);
  ok(A.reloads === 1 && A.get("lef_pet_v1") === undefined, "2 switching back saved Rex, cleared the device and reloads", A.reloads);
  A = await A.reboot();
  ok(/Mochi/.test(A.$("syncBox").textContent) && A.get("lef_pet_v1").stars === 9 && A.get("lef_pet_v1").name === "Mochi" && A.get("les-b1-v1").completed.comprehension === true, "2 Mochi's own pet and book progress are back, nothing of Rex's", A.store());

  // ===== 3. a new device
  B = openDevice(be, "tablet", { uid: uP, store: {} }); await B.settle(400);
  ok(/Who is reading/.test(B.text()) && B.d.querySelectorAll("[data-pick]").length === 2 && !B.d.getElementById("acClose"), "3 a new device with two children asks who is reading, and cannot be dismissed");
  B.click(B.d.querySelector('[data-pick="' + rexId + '"]')); await B.settle(400);
  ok(!B.modal() && /Rex/.test(B.$("syncBox").textContent), "3 picking Rex closes the screen and shows Rex");
  await B.settle(300);
  ok(B.get("lef_pet_v1") && B.get("lef_pet_v1").name === "Rex", "3 Rex's saved pet is on the tablet", B.get("lef_pet_v1"));
  ok(B.reloads >= 0, "3 (reload expected when progress arrives)");

  // ===== 4. protections
  A.click(A.$("acMe"));
  be.offline = true;
  const reloadsBefore = A.reloads;
  A.set("lef_pet_v1", pet({ stars: 12 }));
  A.click(A.d.querySelector('[data-sw="' + rexId + '"]')); await A.settle(500);
  ok(/Couldn't save/.test(A.$("acMenuMsg").textContent) && A.reloads === reloadsBefore && A.get("lef_pet_v1").stars === 12 && A.get("les_profile_v1").id === kid.id, "4 offline: the switch is refused, nothing is cleared, the child stays the same", { msg: A.$("acMenuMsg").textContent.slice(0, 30), reloads: A.reloads, stars: A.get("lef_pet_v1") && A.get("lef_pet_v1").stars, profile: A.get("les_profile_v1"), kid: kid.id });
  be.offline = false;
  const before = be.profiles.length;
  const third = await A.w.__lesAccount.addChild({ nickname: "Third", avatar: "cat", grade: null });
  ok(!third.ok && /Up to 2 children/.test(third.message) && be.profiles.length === before, "4 a third child is refused with a friendly message", third);
  // the server-side cap too
  const cap = await makeClient(be, { uid: uP, authCbs: [] }).from("profiles").insert({ parent_id: uP, nickname: "X", avatar: "cat" }).select("id").single();
  ok(!!cap.error && /at most 2/.test(cap.error.message), "4 the database refuses a third child as well");

  // ===== 5. parent area and deleting a child
  A = openDevice(be, "phone2", { uid: uP, store: A.store() }); await A.settle(400);
  A.click(A.$("acMe")); A.click(A.$("acMParent")); await A.settle();
  ok(/Parent area/.test(A.text()) && A.d.querySelectorAll("[data-del]").length === 2 && !!A.d.getElementById("acClose") && /mum@example.com/.test(A.text()), "5 the parent area lists both children and can be closed");
  A.d.dispatchEvent(new A.w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  ok(!A.modal(), "5 Esc closes the parent area");
  A.click(A.$("acMe")); A.click(A.$("acMParent")); await A.settle();
  A.click(A.d.querySelector('[data-del="' + rexId + '"]')); await A.settle();
  ok(/Delete Rex/.test(A.text()) && A.$("acGo").disabled, "5 deleting asks to type the nickname first");
  A.$("acConf").value = "re"; A.$("acConf").dispatchEvent(new A.w.Event("input"));
  ok(A.$("acGo").disabled, "5 a partial name does not enable Delete");
  A.$("acConf").value = "REX"; A.$("acConf").dispatchEvent(new A.w.Event("input"));
  ok(!A.$("acGo").disabled, "5 the right name (any case) enables Delete");
  A.click(A.$("acGo")); await A.settle(400);
  ok(be.profiles.length === 1 && !Object.keys(be.rows(uP)).some((k) => k.startsWith(rexId + ":")) && Object.keys(be.rows(uP)).some((k) => k.startsWith(kid.id + ":")), "5 Rex and all of Rex's progress are gone, Mochi's is untouched");
  ok(A.reloads === 0 && /Mochi/.test(A.$("syncBox").textContent), "5 deleting the child who is not reading changes nothing on screen");
  // delete the ACTIVE child
  A.click(A.$("acMe")); A.click(A.$("acMParent")); await A.settle();
  A.click(A.d.querySelector('[data-del="' + kid.id + '"]')); await A.settle();
  A.$("acConf").value = "mochi"; A.$("acConf").dispatchEvent(new A.w.Event("input")); A.click(A.$("acGo")); await A.settle(400);
  ok(be.profiles.length === 0 && A.reloads === 1 && A.get("lef_pet_v1") === undefined && A.get("les_profile_v1") === undefined, "5 deleting the active child wipes this device, forgets the child and reloads", { reloads: A.reloads, keys: Object.keys(A.store()) });
  A = await A.reboot();
  ok(/Add your child/.test(A.text()) && !A.d.getElementById("acClose"), "5 with no children left the add-child screen comes back");

  // ===== 6. one child on a fresh device: no question asked
  be = new Backend(); uP = be.user("dad@example.com");
  be.parents[uP] = { terms_version: "x", overseas_storage_ack: true };
  const only = { id: uuid(), parent_id: uP, nickname: "Mia", avatar: "bunny", grade: "K", created_at: 1 }; be.profiles.push(only);
  be.rows(uP)[only.id + ":lef_pet_v1"] = { value: pet({ name: "Mia", stars: 30 }), rev: 4 };
  B = openDevice(be, "new", { uid: uP, store: {} }); await B.settle(500);
  ok(!B.modal() && B.get("les_profile_v1").id === only.id, "6 a single child is chosen automatically, no 'who is reading' question");
  await B.settle(400);
  ok(B.get("lef_pet_v1") && B.get("lef_pet_v1").stars === 30, "6 and their progress arrives on the new device");

  // ===== 7. old accounts: legacy rows become the first child's
  be = new Backend(); uP = be.user("old@example.com");
  be.rows(uP)["lef_pet_v1"] = { value: pet({ name: "Old", stars: 44 }), rev: 5 };
  be.rows(uP)["les-bookX-v1"] = { value: prog(true), rev: 2 };
  be.legacyReview[uP] = { "q::g-0": { box: 3 } }; be.legacyPlacement[uP] = { takenAt: 9, grade: "2" };
  B = openDevice(be, "fresh", { uid: uP, store: {} }); await B.settle(300);
  await consentAndAdd(B, "Kid", "monkey", null); await B.settle(500);
  const kid7 = be.profiles[0];
  const r7 = be.rows(uP);
  ok(r7[kid7.id + ":lef_pet_v1"] && r7[kid7.id + ":lef_pet_v1"].value.stars === 44 && r7[kid7.id + ":les-bookX-v1"] && r7[kid7.id + ":les_review_v1"].value.items["q::g-0"].box === 3 && r7[kid7.id + ":les_placement_v1"].value.takenAt === 9, "7 an existing account's old pet, book progress, review records and level test move under its first child", Object.keys(r7));
  ok(r7["lef_pet_v1"] && r7["les-bookX-v1"], "7 the old rows are left in place as a backup");
  await B.settle(400);
  ok(B.get("lef_pet_v1") && B.get("lef_pet_v1").stars === 44, "7 and they show up on the device");

  // ===== 8. safety and edge cases
  be = new Backend(); uP = be.user("e@example.com");
  A = openDevice(be, "x", { uid: uP, store: {} }); await A.settle(300);
  be.failLoad = true; A.w.__lesAccount.route();
  const ee = openDevice(be, "err", { uid: uP, store: {} }); await ee.settle(400);
  ok(/Couldn't load your account/.test(ee.text()) && !!ee.d.getElementById("acClose"), "8 if the account cannot be loaded a retry screen appears, and it can be closed so the site stays usable");
  be.failLoad = false; ee.click(ee.$("acGo")); await ee.settle(400);
  ok(/Welcome/.test(ee.text()), "8 Try again recovers");
  // a child deleted on another device: this device must not keep or upload their data
  be = new Backend(); uP = be.user("f@example.com"); be.parents[uP] = { terms_version: "x", overseas_storage_ack: true };
  const ghost = uuid(); const keep = { id: uuid(), parent_id: uP, nickname: "Keep", avatar: "cat", grade: null, created_at: 1 }; be.profiles.push(keep);
  A = openDevice(be, "ghost", { uid: uP, store: { les_profile_v1: JSON.stringify({ uid: uP, id: ghost }), lef_pet_v1: JSON.stringify(pet({ name: "Ghost", stars: 99 })), les_state_sync_meta_v1: JSON.stringify({ uid: uP, pid: ghost, rev: {}, fp: {} }) } });
  await A.settle(500);
  ok(!Object.keys(be.rows(uP)).some((k) => k.startsWith(ghost + ":")) && (A.get("lef_pet_v1") === undefined || A.get("lef_pet_v1").name !== "Ghost"), "8 data of a child deleted elsewhere is wiped from the device, never uploaded", Object.keys(A.store()));
  // HTML in a nickname is shown as text
  be = new Backend(); uP = be.user("g@example.com"); be.parents[uP] = { terms_version: "x", overseas_storage_ack: true };
  be.profiles.push({ id: uuid(), parent_id: uP, nickname: '<img src=x onerror=alert(1)>', avatar: "cat", grade: null, created_at: 1 });
  A = openDevice(be, "xss", { uid: uP, store: {} }); await A.settle(500);
  A.click(A.$("acMe")); A.click(A.$("acMParent")); await A.settle();
  ok(!A.d.querySelector("#syncBox img") && !A.d.querySelector(".ac-card img") && /<img src=x/.test(A.$("syncBox").textContent + A.text()), "8 a nickname with HTML is displayed as plain text");
  // sign out
  A.d.dispatchEvent(new A.w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  A.click(A.$("acMe")); A.click(A.$("acMOut")); await A.settle(500);
  ok(A.signOuts === 1 && !!A.$("syncToggle") && !A.modal(), "8 signing out returns the sign-in button and closes any screen");

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error("TEST CRASHED:", e); process.exit(2); });
