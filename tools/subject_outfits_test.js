// node tools/subject_outfits_test.js
var S = require("../site/subject-outfits.js"), n = 0, bad = 0;
function ok(c, m) { n++; if (!c) { bad++; console.log("FAIL: " + m); } }
ok(S.OUTFITS.length === 6, "six outfits");
["Science", "Fiction", "Math", "SEL", "Social Studies", "Computer Science"].forEach(function (s) {
  var o = S.forSubject(s);
  ok(o && S.byId(o.id) === o, s + " has an outfit");
  var eq = { hat: "crown", face: "glasses", neck: "scarf" }, w = S.eqWith(eq, s);
  ok(w[o.slot] === o.id, s + " replaces its slot");
  for (var k in eq) if (k !== o.slot) ok(w[k] === eq[k], s + " keeps other slots");
  ok(eq[o.slot] !== o.id, s + " does not change the original eq");
  ok(typeof S._draw[o.id] === "function", s + " draws");
  ok(S._draw[o.id]({ hx: 60, hy: 46, hs: 1, ey: 40, edx: 20, er: 10 }).indexOf("<") === 0, s + " svg");
});
ok(S.eqWith(null, "Science").face === "so-goggles", "null eq");
ok(JSON.stringify(S.eqWith({ hat: "x" }, "Unknown")) === '{"hat":"x"}', "unknown subject unchanged");
ok(S.unlocked("Science", function (s) { return s === "Science"; }), "unlocked");
ok(!S.unlocked("Math", function () { return false; }), "locked");
ok(!S.unlocked("Nope", function () { return true; }), "no outfit");
console.log(n + " checks, " + bad + " failed"); process.exit(bad ? 1 : 0);
