/* The level picker of the Grade 2 practice games: a row of level buttons on the start and end screens. Every level the child has
   opened can be played again (an easier one to warm up, or the newest one); the crowns won on a level show under its number.
   LevelPick.html(game, max, cur) -> html     LevelPick.wire(onPick)   (onPick(level) when a button is tapped)
   Levels are kept by the games as "day1", "day2"... in GameProgress (the names they always had), shown as Level 1, Level 2...
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";
  var CSS = ".lvlab{font-weight:900;font-size:.85rem;opacity:.92;margin-top:10px}" +
    ".lvpick{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px auto 2px;max-width:420px}" +
    ".lvpick button{border:0;border-radius:12px;min-width:46px;padding:6px 8px 4px;font-family:Fredoka,sans-serif;font-weight:700;font-size:1.1rem;line-height:1.1;" +
    "background:rgba(255,255,255,.92);color:#2b2a3f;cursor:pointer;box-shadow:0 3px 0 rgba(0,0,0,.2);transition:transform .15s}" +
    ".lvpick button.on{background:#f5b301;color:#3b2a00;box-shadow:0 3px 0 #b88a00;transform:scale(1.12)}" +
    ".lvpick button small{display:block;font-size:.6rem;min-height:.8rem;letter-spacing:-1px}";
  function css() {
    if (!root.document || root.document.getElementById("lvCss")) return;
    var s = root.document.createElement("style"); s.id = "lvCss"; s.textContent = CSS; root.document.head.appendChild(s);
  }
  function crowns(game, n) {
    try { return root.GameProgress ? root.GameProgress.crowns(game, "day" + n) : 0; } catch (e) { return 0; }
  }
  // in the preview made for testing (tools/build_preview.py sets LEVEL_TEST) every level of every game can be picked
  var TOP = { "beads": 5, "bundle": 5, "ten-frame": 5, "story": 5, "duck-pond": 5, "shapes2": 5, "clock": 5, "data": 5, "number-line": 5, "length": 6, "equal-groups": 5, "place-value": 5, "shop-day": 4 };
  function testing() { try { return !!(root.LEVEL_TEST || (root.parent && root.parent !== root && root.parent.LEVEL_TEST)); } catch (e) { return !!root.LEVEL_TEST; } }
  function html(game, max, cur) {
    css();
    var test = testing(), opened = max;
    if (test) max = Math.max(max, TOP[game] || 6);
    if (max <= 1) return "";
    var h = '<div class="lvlab">Choose a level 选关' + (test ? ' · 🧪 test: all levels open 测试版：每关都能选' : '') + '</div><div class="lvpick" id="lvpick">';
    for (var n = 1; n <= max; n++) {
      var c = crowns(game, n), cr = "";
      for (var i = 0; i < c; i++) cr += "👑";
      h += '<button type="button" data-l="' + n + '"' + (n === cur ? ' class="on"' : "") + ">" + n + "<small>" + (cr || (n === opened ? "new" : "")) + "</small></button>";
    }
    return h + "</div>";
  }
  function wire(onPick) {
    var box = root.document.getElementById("lvpick");
    if (!box) return;
    [].forEach.call(box.querySelectorAll("button"), function (b) {
      b.onclick = function () {
        [].forEach.call(box.querySelectorAll("button"), function (x) { x.className = ""; });
        b.className = "on";
        onPick(+b.getAttribute("data-l"));
      };
    });
  }
  root.LevelPick = { html: html, wire: wire };
})(window);
