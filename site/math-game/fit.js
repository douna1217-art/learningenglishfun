/* Fits a game to the screen it is played on.
   On a wide screen (a computer, a tablet held sideways: 900 px wide or more) the game is laid out for a design size (wide: [w, h])
   and zoomed so that design size fills the window (never smaller than 1, at most max), and the page's height is set to the
   window's height so the game's main area can stretch down (CSS: the wrap is a flex column and its .fill part has flex: 1).
   On a narrow screen held upright (a tablet) the narrow design size is used the same way; a phone (under 600 px) is left alone.
   FitScreen(wrapElement, {wide: [1000, 700], narrow: [520, 880], max: 1.7})
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";
  root.FitScreen = function (el, o) {
    o = o || {};
    function fit() {
      var w = root.innerWidth, h = root.innerHeight;
      if (w < 600) { el.style.zoom = ""; el.style.height = ""; el.classList.remove("fitted"); return; }
      var d = w >= 900 ? (o.wide || [1000, 700]) : (o.narrow || [520, 880]);
      var z = Math.max(1, Math.min(o.max || 1.7, Math.min(w / d[0], h / d[1])));
      el.style.zoom = z;
      el.style.height = Math.floor(h / z) + "px";   // the whole window, in the zoomed page's pixels
      el.classList.add("fitted");
    }
    root.addEventListener("resize", fit);
    fit();
    return fit;
  };
})(window);
