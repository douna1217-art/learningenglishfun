/* Adapting to the child inside a level, for the games that do not use engine.js (the same rule as engine.js):
   after 2 misses in a row the next question is a warm-up (easier), and after 4 right in a row a challenge question may come (harder):
   it is worth 3 more coins, and a wrong answer to it costs no heart and is not put in the practice list. At most 2 challenges a round,
   and never on the last question. Practice rounds and the mixed boss level are left alone (the game passes normal: false).

   X is the game's round state (it keeps streak and left; Adapt adds slump, sinceHard, hardDone, mode).
   Adapt.pick(X, {normal, easy: fn -> question | null, hard: fn -> question | null}) -> a question, or null for the usual one
   Adapt.tag(beforeEl, X)       shows "🌱 Warm-up question" or "⚡ Challenge question!" over the question (nothing otherwise)
   Adapt.right(X) -> extra coins (3 for a challenge)      Adapt.wrong(X) -> true when it was a challenge (no heart lost)
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";
  function css() {
    if (!root.document || root.document.getElementById("adaptStyle")) return;
    var s = root.document.createElement("style");
    s.id = "adaptStyle";
    s.textContent = ".qtag{display:table;margin:0 auto 8px;padding:4px 12px;border-radius:999px;font-weight:900;font-size:.85rem;text-align:center}.qtag small{font-weight:800;opacity:.75}" +
      ".qtag.hard{background:#FFE9A8;color:#7A4A00}.qtag.easy{background:#E3F6E8;color:#1F6B3A}.qtag.none{display:none}";
    root.document.head.appendChild(s);
  }
  function pick(X, o) {
    X.mode = ""; X.sinceHard = (X.sinceHard || 0) + 1;
    if (!o || !o.normal) return null;
    var q = null;
    if ((X.slump || 0) >= 2) {
      X.slump = 0;
      q = o.easy ? o.easy() : null;
      if (q) X.mode = "easy";
    } else if ((X.streak || 0) >= 4 && X.sinceHard >= 3 && (X.hardDone || 0) < 2 && X.left > 1) {
      q = o.hard ? o.hard() : null;
      if (q) { X.mode = "hard"; X.sinceHard = 0; X.hardDone = (X.hardDone || 0) + 1; }
    }
    return q;
  }
  function tag(before, X) {
    if (!before || !before.parentNode) return;
    css();
    var t = root.document.getElementById("qtag");
    if (!t) { t = root.document.createElement("div"); t.id = "qtag"; before.parentNode.insertBefore(t, before); }
    t.className = "qtag " + (X.mode || "none");
    t.innerHTML = X.mode === "hard" ? "⚡ Challenge question! +3 <small>挑战题：答错也不扣心</small>" : X.mode === "easy" ? "🌱 Warm-up question <small>热身题</small>" : "";
  }
  root.Adapt = {
    pick: pick,
    tag: tag,
    right: function (X) { X.slump = 0; return X.mode === "hard" ? 3 : 0; },
    wrong: function (X) { if (X.mode === "hard") return true; X.slump = (X.slump || 0) + 1; return false; }
  };
})(window);
