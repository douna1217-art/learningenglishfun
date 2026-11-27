/* Prizes from the math practice games: pet accessories that cannot be bought with stars, only won in a game (Potion Lab sells them for
   the crystals the child earns there). They are drawn like the other accessories and registered in ITEMS once pet-art.js has made
   PetKit and ITEMS, so the pet wears them on the home page, in the shop and in every game.
   Which ones are won is kept in localStorage "lef_gameprizes_v1" = {won: {id: time}} (synced with the account like the games).
   Sweet Shop (Grade 2) sells its own four for the candies earned there.
   GamePrizes.ids(), .forGame(game), .get(id), .isPrize(id), .won(id), .win(id), .thumb(id)
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";
  var STORE = "lef_gameprizes_v1";
  var INK = "#3A2C6B";
  function star(x, y, r, fill) {
    var p = [];
    for (var i = 0; i < 10; i++) {
      var a = (i * 36 - 90) * Math.PI / 180, rr = i % 2 ? r * .45 : r;
      p.push((x + Math.cos(a) * rr).toFixed(1) + "," + (y + Math.sin(a) * rr).toFixed(1));
    }
    return '<polygon points="' + p.join(" ") + '" fill="' + (fill || "#FFD84A") + '" stroke="#B88A00" stroke-width="1.2" stroke-linejoin="round"/>';
  }
  // game: which game gives it; price: crystals in that game
  var LIST = [
    { id: "gp-wizard", game: "potion", price: 15, slot: "hat", name: "Wizard hat", cn: "巫师帽", vb: "14 -16 92 72", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a, '<path d="M-26 3Q0 -7 26 3Q28 9 20 9H-20Q-28 9 -26 3Z" fill="#4A3394" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M-15 1Q-6 -26 2 -50Q8 -40 6 -34Q12 -20 15 1Z" fill="#6A4FC4" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M-13 -4Q0 -9 13 -4" fill="none" stroke="#FFD84A" stroke-width="4"/>' + star(-3, -20, 5) + star(5, -36, 3.5) + star(-8, -10, 2.6, "#fff"));
      } },
    { id: "gp-goggles", game: "potion", price: 20, slot: "face", name: "Lab goggles", cn: "实验护目镜", vb: "14 18 92 44", a: { ey: 40, edx: 20, er: 10 },
      draw: function (a) {
        var x1 = 60 - a.edx, x2 = 60 + a.edx, r = a.er + 5;
        return '<g><path d="M' + (x1 - r - 9) + ' ' + a.ey + 'H' + (x1 - r) + 'M' + (x2 + r) + ' ' + a.ey + 'H' + (x2 + r + 9) + '" stroke="#5A4A9A" stroke-width="5" stroke-linecap="round"/>' +
          '<circle cx="' + x1 + '" cy="' + a.ey + '" r="' + r + '" fill="rgba(140,210,255,.45)" stroke="#2F7FC8" stroke-width="4.5"/><circle cx="' + x2 + '" cy="' + a.ey + '" r="' + r + '" fill="rgba(140,210,255,.45)" stroke="#2F7FC8" stroke-width="4.5"/>' +
          '<path d="M' + (x1 + r) + ' ' + a.ey + 'Q60 ' + (a.ey - 6) + ' ' + (x2 - r) + ' ' + a.ey + '" fill="none" stroke="#2F7FC8" stroke-width="4"/>' +
          '<path d="M' + (x1 - r * .5) + ' ' + (a.ey - r * .4) + 'q3 -4 8 -4M' + (x2 - r * .5) + ' ' + (a.ey - r * .4) + 'q3 -4 8 -4" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>';
      } },
    { id: "gp-necklace", game: "potion", price: 25, slot: "neck", name: "Potion necklace", cn: "药水项链", vb: "26 94 68 46", a: { ny: 104 },
      draw: function (a) {
        var y = a.ny;
        return '<g><path d="M32 ' + (y - 4) + 'Q60 ' + (y + 14) + ' 88 ' + (y - 4) + '" fill="none" stroke="#C9A227" stroke-width="2.6"/>' +
          '<g transform="translate(60,' + (y + 9) + ')"><rect x="-3.5" y="0" width="7" height="5" fill="#C9A227"/><path d="M-4 5h8l8 13a4 4 0 0 1-3.5 6h-17a4 4 0 0 1-3.5-6z" fill="#B678FF" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
          '<circle cx="-3" cy="16" r="1.8" fill="#fff"/><circle cx="3" cy="19" r="1.2" fill="#fff"/></g></g>';
      } },
    { id: "gp-crown", game: "potion", price: 35, slot: "hat", name: "Crystal crown", cn: "水晶王冠", vb: "20 4 80 50", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a, '<path d="M-20 2L-22 -24L-10 -13L0 -32L10 -13L22 -24L20 2Z" fill="#E4DAFF" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M0 -24L5 -16L0 -8L-5 -16Z" fill="#B678FF" stroke="' + INK + '" stroke-width="1.6"/><path d="M-14 -10L-10 -5L-14 0L-18 -5Z" fill="#6AB8FF" stroke="' + INK + '" stroke-width="1.4"/>' +
          '<path d="M14 -10L18 -5L14 0L10 -5Z" fill="#7CD67C" stroke="' + INK + '" stroke-width="1.4"/><path d="M-18 -2H18" stroke="#B678FF" stroke-width="3"/>');
      } },
    { id: "gp-starglasses", game: "potion", price: 45, slot: "face", name: "Star glasses", cn: "星星眼镜", vb: "16 16 88 48", a: { ey: 40, edx: 20, er: 10 },
      draw: function (a) {
        var x1 = 60 - a.edx, x2 = 60 + a.edx, r = a.er + 8;
        return '<g>' + star(x1, a.ey, r, "rgba(255,216,74,.75)") + star(x2, a.ey, r, "rgba(255,216,74,.75)") +
          '<path d="M' + (x1 + r * .55) + ' ' + (a.ey - 2) + 'Q60 ' + (a.ey - 8) + ' ' + (x2 - r * .55) + ' ' + (a.ey - 2) + '" fill="none" stroke="#E0A800" stroke-width="3"/></g>';
      } },
    { id: "gp-starbow", game: "potion", price: 60, slot: "neck", name: "Starry bow tie", cn: "星星领结", vb: "26 98 68 36", a: { ny: 104 },
      draw: function (a) {
        return '<g transform="translate(60,' + (a.ny + 8) + ')"><path d="M0 0L-22 -12V12Z M0 0L22 -12V12Z" fill="#4A3394" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
          star(-12, -1, 3.2) + star(12, 2, 3.2) + '<circle r="5.5" fill="#FFD84A" stroke="#B88A00" stroke-width="2.5"/></g>';
      } }
,
    // Sweet Shop (Grade 2, money): bought with the candies earned there
    { id: "gp-cupcake", game: "candy", price: 15, slot: "hat", name: "Cupcake hat", cn: "纸杯蛋糕帽", vb: "18 -14 84 70", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a, '<path d="M-20 2L-15 -16H15L20 2Z" fill="#FF9EC4" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M-9 -16V0M0 -16V0M9 -16V0" stroke="#E0679A" stroke-width="2"/>' +
          '<path d="M-19 -15Q-22 -30 -8 -31Q-6 -44 6 -40Q20 -38 18 -26Q24 -20 19 -15Z" fill="#FFF3E6" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<circle cx="3" cy="-44" r="6" fill="#E53950" stroke="' + INK + '" stroke-width="2.5"/><path d="M3 -50q3 -6 8 -7" fill="none" stroke="#3E8E41" stroke-width="2.5" stroke-linecap="round"/>' +
          '<circle cx="-8" cy="-24" r="1.8" fill="#6AB8FF"/><circle cx="7" cy="-28" r="1.8" fill="#FFD84A"/><circle cx="12" cy="-21" r="1.8" fill="#7CD67C"/>');
      } },
    { id: "gp-heartglasses", game: "candy", price: 25, slot: "face", name: "Heart glasses", cn: "爱心眼镜", vb: "16 16 88 48", a: { ey: 40, edx: 20, er: 10 },
      draw: function (a) {
        var x1 = 60 - a.edx, x2 = 60 + a.edx, y = a.ey, r = a.er + 7;
        function heart(x) { return '<path d="M' + x + ' ' + (y + r * .9) + 'C' + (x - r * 1.5) + ' ' + (y - r * .1) + ' ' + (x - r * .9) + ' ' + (y - r * 1.2) + ' ' + x + ' ' + (y - r * .45) + 'C' + (x + r * .9) + ' ' + (y - r * 1.2) + ' ' + (x + r * 1.5) + ' ' + (y - r * .1) + ' ' + x + ' ' + (y + r * .9) + 'Z" fill="rgba(255,90,140,.75)" stroke="#C2185B" stroke-width="3" stroke-linejoin="round"/>'; }
        return '<g>' + heart(x1) + heart(x2) + '<path d="M' + (x1 + r * .7) + ' ' + (y - 4) + 'Q60 ' + (y - 9) + ' ' + (x2 - r * .7) + ' ' + (y - 4) + '" fill="none" stroke="#C2185B" stroke-width="3"/></g>';
      } },
    { id: "gp-candybeads", game: "candy", price: 35, slot: "neck", name: "Candy necklace", cn: "糖果项链", vb: "26 94 68 40", a: { ny: 104 },
      draw: function (a) {
        var y = a.ny, cols = ["#FF8FB8", "#FFD84A", "#7CD67C", "#6AB8FF", "#B678FF"], h = '<g><path d="M32 ' + (y - 4) + 'Q60 ' + (y + 16) + ' 88 ' + (y - 4) + '" fill="none" stroke="#fff" stroke-width="2"/>';
        for (var i = 0; i <= 8; i++) { var t = i / 8, x = 32 + 56 * t, yy = (1 - t) * (1 - t) * (y - 4) + 2 * (1 - t) * t * (y + 16) + t * t * (y - 4); h += '<circle cx="' + x.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="4.2" fill="' + cols[i % 5] + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
        return h + '</g>';
      } },
    { id: "gp-gumcrown", game: "candy", price: 50, slot: "hat", name: "Gumdrop crown", cn: "软糖王冠", vb: "20 2 80 52", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a, '<path d="M-21 2L-23 -20L-12 -11L0 -27L12 -11L23 -20L21 2Z" fill="#FFE8A3" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M-27 -20a5 6 0 0 1 9 0z" fill="#E53950" stroke="' + INK + '" stroke-width="1.8"/><path d="M-5 -28a5 6 0 0 1 10 0z" fill="#7CD67C" stroke="' + INK + '" stroke-width="1.8"/><path d="M18 -20a5 6 0 0 1 9 0z" fill="#B678FF" stroke="' + INK + '" stroke-width="1.8"/>' +
          '<circle cx="-11" cy="-4" r="3" fill="#FF8FB8"/><circle cx="0" cy="-6" r="3" fill="#6AB8FF"/><circle cx="11" cy="-4" r="3" fill="#FFD84A"/>');
      } }
  ];
  var BY_ID = {};
  LIST.forEach(function (p) { BY_ID[p.id] = p; });

  function read() {
    try { var s = JSON.parse(root.localStorage.getItem(STORE)); return s && typeof s.won === "object" && s.won ? s : { won: {} }; } catch (e) { return { won: {} }; }
  }
  function won(id) { return !!read().won[id]; }
  function win(id) {
    if (!BY_ID[id]) return false;
    var s = read(); if (!s.won[id]) { s.won[id] = Date.now(); try { root.localStorage.setItem(STORE, JSON.stringify(s)); } catch (e) {} }
    return true;
  }
  function thumb(id) {
    var it = root.ITEMS && root.ITEMS[id];
    if (!it || !it.draw) return "";
    var inner = it.draw(it.a);
    return '<svg viewBox="' + it.vb + '" aria-hidden="true">' + (typeof root.softSvg === "function" ? root.softSvg(inner) : inner) + "</svg>";
  }
  function register() {
    var K = root.PetKit;
    if (!K || !root.ITEMS || !K.G) return false;
    LIST.forEach(function (p) {
      root.ITEMS[p.id] = { id: p.id, slot: p.slot, name: p.name, cn: p.cn, vb: p.vb, a: p.a, price: 0, prize: true, draw: function (a) { return p.draw(a, K.G); } };
    });
    return true;
  }
  register();

  root.GamePrizes = {
    STORE: STORE,
    ids: function () { return LIST.map(function (p) { return p.id; }); },
    forGame: function (g) { return LIST.filter(function (p) { return p.game === g; }); },
    get: function (id) { return BY_ID[id] || null; },
    isPrize: function (id) { return !!BY_ID[id]; },
    won: won,
    win: win,
    thumb: thumb
  };
})(window);
