#!/usr/bin/env node
// Tests for site/pet-fest.js: festival dates and the week-before/week-after windows, what can be bought when,
// the collection of owned items, and that every festival item can be drawn on every pet.
//   node tools/festival_test.js
const fs = require("fs"), path = require("path");
const SITE = path.join(__dirname, "..", "site");
let pass = 0, fail = 0;
const ok = (c, name, extra) => { if (c) pass++; else { fail++; console.log("  FAIL:", name, extra === undefined ? "" : extra); } };
function load(search) {
  const win = { location: { search: search || "" } };
  new Function("window", fs.readFileSync(path.join(SITE, "pet-art.js"), "utf8"))(win);
  new Function("window", fs.readFileSync(path.join(SITE, "pet-fest.js"), "utf8"))(win);
  return win;
}
const ymd = (d) => d && d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const D = (s) => { const p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); };
const w = load("");
const F = w.FEST;

// ---- dates
const TG = { 2026: "2026-11-26", 2027: "2027-11-25", 2028: "2028-11-23", 2029: "2029-11-22", 2030: "2030-11-28", 2031: "2031-11-27", 2032: "2032-11-25", 2033: "2033-11-24", 2034: "2034-11-23", 2035: "2035-11-22" };
Object.keys(TG).forEach((y) => ok(ymd(F.dateOf("thanksgiving", +y)) === TG[y], "Thanksgiving " + y + " is the 4th Thursday of November", ymd(F.dateOf("thanksgiving", +y))));
const CNY = { 2026: "2026-02-17", 2027: "2027-02-06", 2028: "2028-01-26", 2029: "2029-02-13", 2030: "2030-02-03", 2031: "2031-01-23", 2032: "2032-02-11", 2033: "2033-01-31", 2034: "2034-02-19", 2035: "2035-02-08", 2040: "2040-02-12", 2045: "2045-02-17" };
Object.keys(CNY).forEach((y) => ok(ymd(F.dateOf("newyear", +y)) === CNY[y], "Chinese New Year " + y, ymd(F.dateOf("newyear", +y))));
ok(F.dateOf("newyear", 2060) === null, "no crash and no window after the table ends");
ok(ymd(F.dateOf("halloween", 2026)) === "2026-10-31" && ymd(F.dateOf("christmas", 2026)) === "2026-12-25", "fixed dates");

// ---- windows: seven days either side, inclusive
const act = (s) => load("?festdate=" + s).FEST.active().map((a) => a.id);
ok(act("2026-10-23").length === 0, "Oct 23 is one day too early for Halloween");
ok(act("2026-10-24").join() === "halloween", "Oct 24 opens the Halloween shelf");
ok(act("2026-10-31").join() === "halloween" && act("2026-11-07").join() === "halloween", "Oct 31 and Nov 7 are inside");
ok(act("2026-11-08").length === 0, "Nov 8 is one day too late");
ok(load("?festdate=2026-10-31").FEST.active()[0].ends === "Nov 7", "the shelf says it ends Nov 7");
ok(act("2027-10-26").join() === "halloween", "it comes back the next year");
// year wrap and the other festivals' windows (they have no items yet, so look at the windows themselves)
const win = (id, s) => { const x = load("?festdate=" + s).FEST.windowOf(id); return x ? ymd(x.start) + ".." + ymd(x.end) : null; };
ok(win("christmas", "2026-12-18") === "2026-12-18..2027-01-01", "Christmas window", win("christmas", "2026-12-18"));
ok(win("christmas", "2027-01-01") === "2026-12-18..2027-01-01", "Christmas window still open on Jan 1 (year wrap)", win("christmas", "2027-01-01"));
ok(win("christmas", "2027-01-02") === null && win("christmas", "2026-12-17") === null, "Christmas window edges");
ok(win("thanksgiving", "2026-11-19") === "2026-11-19..2026-12-03", "Thanksgiving window", win("thanksgiving", "2026-11-19"));
ok(win("newyear", "2027-01-30") === "2027-01-30..2027-02-13", "Chinese New Year window 2027", win("newyear", "2027-01-30"));
ok(ymd(F.dateOf("children", 2027)) === "2027-06-01", "Children's Day is June 1");
ok(win("children", "2027-05-25") === "2027-05-25..2027-06-08" && win("children", "2027-06-08") === "2027-05-25..2027-06-08", "Children's Day window (May 25 - Jun 8)", win("children", "2027-05-25"));
ok(win("children", "2027-05-24") === null && win("children", "2027-06-09") === null, "Children's Day window edges");
ok(F.list.length === 5 && F.list.map((f) => f.id).join() === "halloween,thanksgiving,christmas,newyear,children", "five festivals are registered");
// no two festival windows overlap, so only one festival is ever on the shelf
(function () { let overlap = 0; for (let y = 2026; y <= 2040; y++) for (let day = new Date(y, 0, 1); day < new Date(y + 1, 0, 1); day.setDate(day.getDate() + 1)) { let n = 0; F.list.forEach((f) => { const x = F.windowOf(f.id, new Date(day)); if (x) n++; }); if (n > 1) overlap++; } ok(overlap === 0, "festival windows never overlap (2026-2040)", overlap); })();
ok(win("newyear", "2030-01-27") === "2030-01-27..2030-02-10", "Chinese New Year window 2030 (Feb 3)", win("newyear", "2030-01-27"));

// ---- registry
const K = w.PetKit, ids = {};
const items = [];
F.list.forEach((f) => { f.outfits.forEach((o) => items.push(["outfit", o, f])); f.hats.forEach((h) => items.push(["hat", h, f])); f.decos.forEach((d) => items.push(["deco", d, f])); });
ok(items.length >= 12, "Halloween has outfits, hats and decorations", items.length);
items.forEach(([kind, it, f]) => {
  ok(!ids[it.id], "unique id " + it.id); ids[it.id] = 1;
  ok(it.id.indexOf("hw-") === 0, "id has the festival prefix " + it.id);
  ok(Number.isInteger(it.price) && it.price >= 0 && it.price <= 20, "sensible price " + it.id + " " + it.price);
  ok(it.name && it.cn, "has English and Chinese name " + it.id);
  ok(F.festOf(it.id) === f, "festOf finds " + it.id);
  if (kind === "deco") ok(F.deco(it.id) === it && typeof it.svg({ y0: 0 }) === "string" && typeof it.svg({ y0: 85 }) === "string" && it.icon.length > 40, "deco draws in both picture sizes " + it.id);
});
ok(K.OUTFITS["hw-pumpkin"] && K.ITEMS["hw-witchhat"] && K.OUTFITS["hw-pumpkin"].slot === "body" && K.ITEMS["hw-witchhat"].slot === "hat", "items are registered in the clothes tables");
ok(w.OUTFIT_IDS.every((id) => id.indexOf("hw-") !== 0) && w.ACCS.every((id) => id.indexOf("hw-") !== 0), "festival items are not in the always-on shelves");
ok(items.filter((x) => x[0] === "hat" && x[1].price === 0).length === 1, "exactly one free gift hat");

// ---- collection: owned things from festivals that are not on the shelf
const c1 = load("?festdate=2026-10-31").FEST.collection(["hw-pumpkin", "hw-bat", "hw-d-ghost", "cape"]);
ok(c1.outfits.length + c1.hats.length + c1.decos.length === 0, "during the festival the owned items sit on the festival shelf, not in the collection", JSON.stringify(c1));
const c2 = load("?festdate=2026-12-01").FEST.collection(["hw-pumpkin", "hw-bat", "hw-d-ghost", "cape"]);
ok(c2.outfits.join() === "hw-pumpkin" && c2.hats.join() === "hw-bat" && c2.decos.join() === "hw-d-ghost", "after the festival they move to the collection", JSON.stringify(c2));
ok(load("?festdate=2026-12-01").FEST.isActiveItem("hw-pumpkin") === false && load("?festdate=2026-10-31").FEST.isActiveItem("hw-pumpkin") === true, "isActiveItem follows the window");
ok(F.greet() === null && load("?festdate=2026-10-31").FEST.greet() === "Happy Halloween!", "greeting only inside the window");

// ---- every item draws on every pet and face, and the pictures are well formed
function wellFormed(s) {
  const st = []; const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g; let m;
  while ((m = re.exec(s))) { if (m[4]) continue; if (m[1]) { if (st.pop() !== m[2]) return false; } else st.push(m[2]); }
  return st.length === 0;
}
let drawn = 0, bad = 0;
w.PET_ORDER.forEach((t) => w.FACES.forEach((f) => items.filter((x) => x[0] !== "deco").forEach(([kind, it]) => {
  const eq = kind === "outfit" ? { body: it.id } : { hat: it.id };
  const svg = w.petSvg(t, f, eq); drawn++;
  if (!wellFormed(svg) || /NaN|undefined/.test(svg) || svg.length < 800) bad++;
})));
ok(bad === 0, "every festival outfit and hat draws cleanly on all pets and faces (" + drawn + " pictures)", bad);
w.PET_ORDER.forEach((t) => ok(wellFormed(w.petSvg(t, "happy", { body: "hw-vampire", hat: "hw-witchhat", face: "glasses", neck: "scarf" })), "everything at once on " + t));
items.filter((x) => x[0] === "deco").forEach(([k, d]) => ok(wellFormed("<svg>" + w.softSvg(d.svg({ y0: 85 })) + "</svg>") && !/NaN|undefined/.test(d.svg({ y0: 85 })), "deco is well formed " + d.id));
items.filter((x) => x[0] === "outfit").forEach(([k, o]) => ok(wellFormed("<svg>" + o.icon() + "</svg>"), "shop icon is well formed " + o.id));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
