/* Fits a game to the screen it is played on.
   On a wide screen (a computer, a tablet held sideways: 900 px wide or more) the game is laid out for a design size (wide: [w, h])
   and zoomed so that design size fills the window (never smaller than 1, at most max), and the page's height is set to the
   window's height so the game's main area can stretch down (CSS: the wrap is a flex column and its .fill part has flex: 1).
   On a narrow screen held upright (a tablet) the narrow design size is used the same way; a phone (under 600 px) is left alone.
   FitScreen(wrapElement, {wide: [1000, 700], narrow: [520, 880], max: 1.7})
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";
  /* FitPlay(wrap, section, {max, min}): for the level games. Each time a question is drawn, the playing screen (section) is measured at
     its natural size and the page (wrap) is zoomed so the question fills the window below its top: larger on a big screen (up to max),
     a little smaller on a short one (down to min) so it fits without scrolling. fit() is returned; call it after drawing a question.
     fit.reset() takes the zoom off (for the map and the result screens). */
  root.FitPlay = function (wrap, section, o) {
    o = o || {};
    function fit() {
      if (!section || section.hidden) { wrap.style.zoom = ""; return; }
      wrap.style.zoom = 1; wrap.style.paddingTop = "";
      var H = wrap.getBoundingClientRect().bottom + (root.pageYOffset || 0), w = section.offsetWidth;   // the bottom of the game, its margin included
      if (!H || !w) return;
      var z = Math.min((root.innerHeight - 4) / H, (root.innerWidth - 24) / w);
      z = Math.max(o.min || 0.85, Math.min(o.max || 1.6, z));
      wrap.style.zoom = z;
      // a short question (or a tall, narrow screen): the question sits in the middle of the window, not at the top
      var spare = root.innerHeight - H * z;
      if (spare > 60) wrap.style.paddingTop = Math.floor(spare / 2 / z) + "px";   // padding, not a margin: a margin would collapse through the page
    }
    fit.reset = function () { wrap.style.zoom = ""; wrap.style.paddingTop = ""; };
    var t = 0;
    root.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(fit, 120); });
    return fit;
  };
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
