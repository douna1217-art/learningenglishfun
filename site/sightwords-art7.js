/* More little pictures for the stage-7 sight words (the desert island): places and farm things, people and jobs, school things,
   feelings and music, opposites and the little words. It adds new kinds of things and one scene per word to sightwords-art.js (SWArt.extend;
   it also uses the things of sightwords-art3.js to sightwords-art6.js), in the same soft look, all drawn in code.
   A scene is a list of items [kind, x, y, scale, options] on a 240 x 160 picture; the ground is at about y = 134.
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";
  var A = root.SWArt;
  if (!A && typeof require === "function") {
    try {
      A = require("./sightwords-art.js"); // under Node (the tests) the files do not share a global
    } catch (e) {}
  }
  if (!A || !A.extend || !A.h) return;
  var h = A.h, C = h.C, f = h.f, ln = h.ln, path = h.path, dk = h.dk, INK = h.INK, X = h.X, render = h.render, K = h.K;
  var G = h.G, kb = h.kb, kg = h.kg, ky = h.ky, kr = h.kr;
  var FONT = "Fredoka,Nunito,sans-serif";
  var P = "#6A48E8";
  var KITS = {};

  // a thing of another kind drawn inside a new thing (x, y, scale, options), and the same turned
  function at(kind, x, y, s, o) {
    return '<g transform="translate(' + x + "," + y + ") scale(" + s + ')">' + K[kind](o || {}) + "</g>";
  }
  function atr(kind, x, y, s, rot, o) {
    return '<g transform="translate(' + x + "," + y + ") rotate(" + rot + ") scale(" + s + ')">' + K[kind](o || {}) + "</g>";
  }
  function man(extra) {
    return X({ shirt: "#2E7D9A", pants: "#4A4A5A", hair: "#3A2A22" }, extra);
  }
  function rowOf(kind, n, x0, dx, y, s, opt) {
    var out = [], i;
    for (i = 0; i < n; i++) out.push([kind, x0 + i * dx, y, s, opt && opt.call ? opt(i) : opt || {}]);
    return out;
  }

  /* ------------------------------------------------------------------ new things: sand dunes */
  // a cactus with two arms and a flower on top
  KITS.cactus = function (o) {
    var g = "#4FA06A";
    return '<path d="M-9 0 V-52 Q-9 -62 0 -62 Q9 -62 9 -52 V0Z" ' + f(g, 2.4) + '/><path d="M-9 -26 H-17 Q-23 -26 -23 -32 V-46 Q-23 -52 -17 -52 Q-12 -52 -12 -46 V-34 H-9" ' + f(g, 2.2) + '/><path d="M9 -20 H17 Q23 -20 23 -26 V-40 Q23 -46 17 -46 Q12 -46 12 -40 V-28 H9" ' + f(g, 2.2) + '/>' +
      '<path d="M0 -58 V-4 M-4.6 -56 V-6 M4.6 -56 V-6" stroke="' + dk(g, 0.3) + '" stroke-width="1.2" opacity=".6"/><circle cx="0" cy="-64" r="4.6" ' + f("#FF8FB1", 1.6) + '/><circle cx="0" cy="-64" r="1.8" fill="#FFE066"/>';
  };
  // a plain coloured backdrop over the whole picture (o.c) with a different ground strip at the bottom (o.g from the height o.gy)
  KITS.fillbg = function (o) {
    return '<rect width="240" height="160" fill="' + o.c + '"/><rect y="' + o.gy + '" width="240" height="' + (160 - o.gy) + '" fill="' + o.g + '"/>';
  };
  // a baby lying on its back along an arm: the head (with its face turned to us) on the left, the body going to the right, the feet at the end (the middle of the underside is the origin)
  KITS.cradlebaby = function (o) {
    var skin = "#FFD7B5", c = "#FFD6E4", s = "", hd;
    hd = '<circle cx="-28" cy="-17" r="14" ' + f(skin, 2.4) + '/><path d="M-31 -31 Q-28 -37 -24 -31 Q-28 -32 -31 -31Z" ' + f("#6B4423", 1.4) + '/><ellipse cx="-33" cy="-18" rx="1.8" ry="2.4" fill="' + INK + '"/><ellipse cx="-23" cy="-18" rx="1.8" ry="2.4" fill="' + INK + '"/><circle cx="-36" cy="-12" r="2.6" fill="#FF9DB5" opacity=".6"/><circle cx="-20" cy="-12" r="2.6" fill="#FF9DB5" opacity=".6"/><path d="M-31 -11 Q-28 -8 -25 -11" fill="none" stroke="#B3442F" stroke-width="1.8" stroke-linecap="round"/>';
    if (o.head) return hd; // only the head, drawn again over the arm it lies on
    s += '<ellipse cx="2" cy="-12" rx="26" ry="12" ' + f(c, 2.2) + '/><path d="M-12 -22 Q2 -26 16 -22" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>';
    s += '<circle cx="26" cy="-9" r="4.4" ' + f(skin, 1.6) + '/><circle cx="29" cy="-17" r="4.4" ' + f(skin, 1.6) + '/>' + ln(-4, -18, 6, -20, 4.4, skin) + '<circle cx="7" cy="-20" r="3.4" ' + f(skin, 1.6) + "/>";
    s += hd;
    return s;
  };
  // the word STOP on a white plate, the size of the middle of the stop sign drawn at 1.45 (the middle of the sign is the origin)
  KITS.stopword = function (o) {
    return '<rect x="-21" y="-7.5" width="42" height="15" rx="3" fill="#FFFFFE"/><text x="0" y="4.4" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="12.5" fill="#D6402F">STOP</text>';
  };
  // a map on the wall (the bottom edge is the origin): the north half on top is snowy mountains, the south half below is sun, sand and a palm;
  // o.hl = "north" or "south" circles that half in red
  KITS.weathermap = function (o) {
    var s = '<rect x="-62" y="-92" width="124" height="92" rx="5" ' + f("#E8B66E", 2.6) + '/>';
    s += '<rect x="-56" y="-86" width="112" height="40" fill="#E4F4FF"/><rect x="-56" y="-46" width="112" height="40" fill="#F7E2A6"/><path d="M-56 -46 H56" stroke="#B58A5A" stroke-width="2"/>';
    s += '<path d="M-54 -46 L-38 -70 L-30 -60 L-18 -76 L-2 -46Z" fill="#FFFFFE" stroke="#8FA9CC" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 -46 L18 -64 L32 -46Z" fill="#FFFFFE" stroke="#8FA9CC" stroke-width="1.8" stroke-linejoin="round"/>';
    s += '<g stroke="#7CB6DC" stroke-width="1.8" stroke-linecap="round"><path d="M38 -78 v8 M34 -74 h8 M35 -77 l6 6 M35 -71 l6 -6"/><path d="M-40 -82 v6 M-43 -79 h6"/><path d="M48 -60 v6 M45 -57 h6"/></g>';
    s += '<g stroke="#FFB020" stroke-width="2" stroke-linecap="round"><path d="M-36 -40 v-4 M-36 -12 v4 M-48 -26 h-4 M-24 -26 h4 M-45 -35 l-3 -3 M-27 -35 l3 -3 M-45 -17 l-3 3 M-27 -17 l3 3"/></g><circle cx="-36" cy="-26" r="8" fill="#FFC93C" stroke="#E0A800" stroke-width="1.6"/>';
    s += '<path d="M-56 -6 Q-20 -16 14 -10 T56 -12 V-6Z" fill="#EBCB78"/>' + at("palm", 34, -8, 0.3);
    s += '<text x="-52" y="-52" font-family="' + FONT + '" font-weight="700" font-size="11" fill="#2F6AA8">N</text><text x="-52" y="-9" font-family="' + FONT + '" font-weight="700" font-size="11" fill="#B8860B">S</text>';
    if (o.hl === "north") s += '<rect x="-58" y="-88" width="116" height="44" rx="4" fill="none" stroke="#E5483A" stroke-width="3.4" stroke-dasharray="6 4"/>';
    if (o.hl === "south") s += '<rect x="-58" y="-48" width="116" height="44" rx="4" fill="none" stroke="#E5483A" stroke-width="3.4" stroke-dasharray="6 4"/>';
    return s;
  };
  // a bird's-eye view of the whole picture: green land, a river winding over it and flowing into the sea at the right (draw it at 0,0)
  KITS.rivermouth = function (o) {
    var d = "M-6 36 C26 20 50 58 84 60 C120 62 112 100 144 102 L192 106", sea = "M172 0 Q150 30 174 54 Q194 76 168 104 Q148 130 172 160 L240 160 L240 0Z", s = '<rect width="240" height="160" fill="#BFE5A0"/>';
    s += '<path d="M0 118 Q60 108 120 122 Q170 134 200 160 L0 160Z" fill="#A5D984"/>';
    s += '<path d="' + sea + '" fill="#4FA8F0"/><path d="M172 0 Q150 30 174 54 Q194 76 168 104 Q148 130 172 160" fill="none" stroke="#FFFFFE" stroke-width="3" stroke-linecap="round"/><path d="M198 40 Q208 35 218 40 T238 40 M200 118 Q210 113 220 118 T240 118" fill="none" stroke="#8CC8F5" stroke-width="2.4" stroke-linecap="round"/>';
    s += '<path d="' + d + '" fill="none" stroke="#B58A5A" stroke-width="22" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#5BA9E0" stroke-width="16"/><path d="' + d + '" fill="none" stroke="#8FD0F2" stroke-width="6" opacity=".75"/>';
    s += '<path d="M22 38 l9 5 l-9 5Z M70 58 l9 3 l-9 6Z M110 82 l8 7 l-10 3Z M146 98 l10 4 l-10 5Z" fill="#FFFFFE"/>';
    s += '<g stroke="#2E7D4A" stroke-width="2"><circle cx="36" cy="100" r="10" fill="#5DBB5A"/><circle cx="60" cy="132" r="12" fill="#6CCB5F"/><circle cx="116" cy="28" r="10" fill="#5DBB5A"/><circle cx="20" cy="140" r="8" fill="#6CCB5F"/><circle cx="140" cy="140" r="9" fill="#5DBB5A"/></g>';
    s += '<path d="M200 76 h24 l-5 9 h-14Z" fill="#E5483A" stroke="#9E2F25" stroke-width="1.8" stroke-linejoin="round"/><path d="M212 76 v-16 l10 12Z" fill="#FFFFFE" stroke="#9AA9C4" stroke-width="1.4" stroke-linejoin="round"/>';
    return s;
  };
  // a balloon with a string hanging from it (the knot is the origin; o.len = how long the string is)
  KITS.balloon = function (o) {
    var c = o.c || "#E5483A", len = o.len || 40;
    return '<path d="M0 0 Q-5 ' + len * 0.4 + " 2 " + len * 0.7 + " T0 " + len + '" fill="none" stroke="#6B7285" stroke-width="1.6" stroke-linecap="round"/><path d="M0 0 L-4 5 H4Z" ' + f(c, 1.4) + '/><ellipse cx="0" cy="-26" rx="15" ry="20" ' + f(c, 2.4) + '/><ellipse cx="-6" cy="-34" rx="3.4" ry="6" transform="rotate(20 -6 -34)" fill="#fff" opacity=".55"/>';
  };
  // a petrol pump with a hose ending in a nozzle at (o.hx, o.hy)
  KITS.gaspump = function (o) {
    var hx = o.hx == null ? -50 : o.hx, hy = o.hy == null ? -40 : o.hy;
    var s = '<path d="M-16 -30 Q-30 -30 ' + (hx + 14) + " " + (hy + 6) + " T" + hx + " " + hy + '" fill="none" stroke="#3A3F4D" stroke-width="4.4" stroke-linecap="round"/>';
    s += '<rect x="-18" y="-66" width="36" height="66" rx="5" ' + f("#E5483A", 2.4) + '/><rect x="-12" y="-58" width="24" height="16" rx="3" fill="#2B3350"/><path d="M-8 -50 H8" stroke="#7ED957" stroke-width="3.4" stroke-linecap="round"/><rect x="-22" y="-72" width="44" height="8" rx="3" ' + f("#FFFFFE", 2) + '/><rect x="-18" y="-6" width="36" height="6" fill="#8A97AD"/>';
    s += '<rect x="' + (hx - 7) + '" y="' + (hy - 3) + '" width="12" height="6" rx="2" ' + f("#8A97AD", 1.6) + '/><circle cx="' + hx + '" cy="' + hy + '" r="2.4" fill="#5A6578"/>';
    return s;
  };
  // a steel truss bridge (the middle of the road deck is at the origin, 210 wide)
  KITS.steelbridge = function (o) {
    var st = "#8FA7C8", s = "", i, x;
    s += '<rect x="-105" y="-8" width="210" height="9" ' + f(st, 2.2) + '/><rect x="-96" y="1" width="12" height="40" ' + f("#7B93B8", 1.8) + '/><rect x="84" y="1" width="12" height="40" ' + f("#7B93B8", 1.8) + '/>';
    s += '<path d="M-96 -8 L-76 -52 H76 L96 -8" fill="none" stroke="' + dk(st, 0.4) + '" stroke-width="8" stroke-linejoin="round"/><path d="M-96 -8 L-76 -52 H76 L96 -8" fill="none" stroke="' + st + '" stroke-width="5" stroke-linejoin="round"/>';
    for (i = 0; i < 7; i++) {
      x = -76 + i * 25.4;
      s += '<path d="M' + x + " -8 L" + (x + 12.7) + " -52 L" + (x + 25.4) + ' -8" fill="none" stroke="' + dk(st, 0.4) + '" stroke-width="5"/><path d="M' + x + " -8 L" + (x + 12.7) + " -52 L" + (x + 25.4) + ' -8" fill="none" stroke="' + st + '" stroke-width="2.6"/>';
    }
    for (i = 0; i < 8; i++) s += '<circle cx="' + (-84 + i * 24) + '" cy="-3.5" r="1.6" fill="#DDE6F4"/>';
    return s + '<path d="M-70 -50 H60" stroke="#fff" stroke-width="1.8" opacity=".6" stroke-linecap="round"/>';
  };
  // the two river banks of a bridge, with the road going on over them (picture coordinates; the deck of the bridge is at y 90 to 99)
  KITS.bridgebanks = function (o) {
    var s = "";
    s += '<path d="M0 99 H42 Q48 99 50 110 L54 160 H0Z" ' + f("#B98A5A", 2.4) + '/><path d="M240 99 H198 Q192 99 190 110 L186 160 H240Z" ' + f("#B98A5A", 2.4) + '/>';
    s += '<path d="M0 99 H42 Q48 99 49 106 H0Z" fill="#6CCB5F"/><path d="M240 99 H198 Q192 99 191 106 H240Z" fill="#6CCB5F"/>';
    s += '<rect x="0" y="90" width="16" height="9" fill="#6E7685"/><rect x="224" y="90" width="16" height="9" fill="#6E7685"/><path d="M0 94.5 H12 M228 94.5 H240" stroke="#FFFFFE" stroke-width="1.6" stroke-dasharray="5 4"/>';
    return s;
  };
  // a cotton plant as it really looks: a woody stem, hand-shaped green leaves and bolls that have burst open, a white puff coming out of a brown dry husk
  function cottonLeaf(x, y, rot, sc) {
    var lobe = function (r, k) {
      return '<g transform="rotate(' + r + ") scale(" + k + ')"><path d="M0 0 Q-6 -8 0 -17 Q6 -8 0 0Z" ' + f("#5DBB5A", 1.4) + '/><path d="M0 -2 V-13" stroke="#3E9B5A" stroke-width="1.1"/></g>';
    };
    return '<g transform="translate(' + x + "," + y + ") rotate(" + rot + ") scale(" + sc + ')">' + lobe(-52, 0.82) + lobe(52, 0.82) + lobe(0, 1) + "</g>";
  }
  function cottonBoll(x, y, sc) {
    var hk = f("#8A5A2B", 1.4), s = '<g transform="translate(' + x + "," + y + ") scale(" + sc + ')">';
    s += '<path d="M-5 3 Q0 9 5 3 L3 -1 H-3Z" ' + f("#5DBB5A", 1.4) + "/>";
    s += '<path d="M0 0 Q-9 -3 -14 -14 Q-6 -9 0 -4Z" ' + hk + '/><path d="M0 0 Q9 -3 14 -14 Q6 -9 0 -4Z" ' + hk + '/><path d="M0 0 Q-6 -8 -6 -19 Q-1 -12 0 -4Z" ' + hk + '/><path d="M0 0 Q6 -8 6 -19 Q1 -12 0 -4Z" ' + hk + "/>";
    s += '<g fill="#FFFFFE" stroke="#C9D4E6" stroke-width="1.4"><circle cx="-7" cy="-14" r="6"/><circle cx="7" cy="-14" r="6"/><circle cx="0" cy="-21" r="7.4"/><circle cx="-4" cy="-9" r="5.6"/><circle cx="4" cy="-9" r="5.6"/><circle cx="0" cy="-14" r="6"/></g>';
    s += '<path d="M-12 -18 Q-15 -20 -13 -23 M12 -18 Q15 -20 13 -23 M-4 -28 Q-3 -31 0 -30 M4 -28 Q4 -31 2 -31" fill="none" stroke="#C9D4E6" stroke-width="1.2" stroke-linecap="round"/>';
    s += '<path d="M-9 -3 Q-5 -2 -3 2 Q-8 1 -9 -3Z M9 -3 Q5 -2 3 2 Q8 1 9 -3Z" ' + hk + "/>";
    return s + "</g>";
  }
  KITS.cottonplant = function (o) {
    var s = '<path d="M0 0 Q-2 -22 1 -42" fill="none" stroke="#7A5A33" stroke-width="4.4" stroke-linecap="round"/><path d="M1 -26 Q12 -34 18 -44" fill="none" stroke="#7A5A33" stroke-width="3" stroke-linecap="round"/><path d="M1 -42 Q0 -52 -1 -60" fill="none" stroke="#5DBB5A" stroke-width="3" stroke-linecap="round"/>';
    s += cottonLeaf(-1, -12, -64, 0.9) + cottonLeaf(1, -20, 64, 0.85) + cottonLeaf(-1, -34, -58, 0.8);
    s += '<path d="M-9 -34 Q-12 -40 -9 -44 Q-5 -41 -8 -34Z" ' + f("#8FD07F", 1.4) + "/>";
    s += cottonBoll(-1, -58, 0.95) + cottonBoll(18, -44, 0.7);
    return s;
  };
  // a farm field in picture coordinates: brown soil in the lower part with rows of green plants (draw it at 0,0)
  KITS.cropfield = function (o) {
    var s = '<rect x="0" y="104" width="240" height="56" fill="#B98A5A"/><rect x="0" y="104" width="240" height="4" fill="#9A6F42"/>', r, i, y, x;
    for (r = 0; r < 3; r++) {
      y = 118 + r * 17;
      s += '<path d="M0 ' + (y + 3) + " H240" + '" stroke="#9A6F42" stroke-width="2" opacity=".7"/>';
      for (i = 0; i < 9; i++) {
        x = 14 + i * 26 + (r % 2) * 10;
        s += '<path d="M' + x + " " + (y + 3) + " V" + (y - 14 - r * 2) + " M" + x + " " + (y - 2) + " L" + (x - 8) + " " + (y - 12) + " M" + x + " " + (y - 6) + " L" + (x + 8) + " " + (y - 16) + '" fill="none" stroke="#3E9B5A" stroke-width="3.4" stroke-linecap="round"/>';
      }
    }
    return s;
  };
  // a fig fruit: teardrop-shaped with a little stem (o.half = cut open, showing the red inside with its seeds)
  KITS.figfruit = function (o) {
    var s = '<path d="M0 -34 Q-1 -40 3 -42" fill="none" stroke="#6B8E3A" stroke-width="3.4" stroke-linecap="round"/>';
    if (o.half) {
      s += '<path d="M0 -33 C-5 -30 -19 -24 -19 -12 Q-19 0 0 0 Q19 0 19 -12 C19 -24 5 -30 0 -33Z" ' + f("#7A4B8E", 2.2) + '/><path d="M0 -28 C-4 -26 -14 -21 -14 -12 Q-14 -3 0 -3 Q14 -3 14 -12 C14 -21 4 -26 0 -28Z" fill="#E8466A"/><path d="M0 -26 Q-9 -20 -9 -12 Q-9 -6 0 -6 Q9 -6 9 -12 Q9 -20 0 -26Z" fill="#FFB3C0"/>';
      s += '<circle cx="-4" cy="-14" r="1.3" fill="#FFE98A"/><circle cx="4" cy="-14" r="1.3" fill="#FFE98A"/><circle cx="0" cy="-19" r="1.3" fill="#FFE98A"/><circle cx="-2" cy="-9" r="1.3" fill="#FFE98A"/><circle cx="3" cy="-9.5" r="1.3" fill="#FFE98A"/>';
    } else {
      s += '<path d="M0 -33 C-5 -30 -19 -24 -19 -12 Q-19 0 0 0 Q19 0 19 -12 C19 -24 5 -30 0 -33Z" ' + f("#7A4B8E", 2.4) + '/><path d="M-9 -22 Q-4 -28 2 -29" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>';
    }
    return s;
  };
  // a handful of cotton: one soft white tuft with a little seed in it
  KITS.cottonbunch = function (o) {
    return '<path d="M-15 0 Q-20 -8 -11 -11 Q-11 -20 -2 -18 Q4 -25 11 -17 Q20 -15 16 -7 Q21 0 12 3 Q4 7 -4 3 Q-10 7 -15 0Z" ' + f("#FFFFFE", 1.8) + '/><ellipse cx="-3" cy="-6" rx="2.4" ry="1.6" fill="#8A5A2B"/><path d="M-8 -14 Q-4 -16 -1 -13 M5 -12 Q9 -13 11 -9" fill="none" stroke="#C9D4E6" stroke-width="1.2" stroke-linecap="round"/>';
  };
  // a hoe: the blade is at the origin and the long wooden handle goes straight up (rotate it to lean it)
  KITS.hoe = function (o) {
    return '<rect x="-2.6" y="-78" width="5.2" height="70" rx="2.6" ' + f("#C98B4A", 2) + '/><path d="M-14 0 L6 0 L8 -9 L-1 -13 L-1 -8 L-12 -8Z" ' + f("#9AA6BC", 2) + '/><path d="M-3 -10 H3" stroke="#6A7A94" stroke-width="3"/>';
  };
  // spots for a white dog, drawn on the sitting dog at the dog's own position and scale
  KITS.dspots = function (o) {
    var P2 = [[-8, -12, 3.6], [5, -19, 3.8], [-3, -5, 2.6], [8, -8, 2.8], [-9, -41, 3.2], [10, -37, 2.8], [-16, -34, 4.4], [17, -38, 3.6], [0, -2.5, 2.2]], s = "", i;
    for (i = 0; i < P2.length; i++) s += '<ellipse cx="' + P2[i][0] + '" cy="' + P2[i][1] + '" rx="' + P2[i][2] + '" ry="' + P2[i][2] * 0.86 + '" fill="#2B2B33"/>';
    return s;
  };
  // a tower crane with a block hanging from it (the middle of the foot is the origin)
  KITS.crane = function (o) {
    var s = "", i, y;
    s += '<rect x="-12" y="-6" width="24" height="6" rx="2" ' + f("#8A97AD", 1.6) + '/><rect x="-4" y="-104" width="8" height="98" ' + f("#FFC93C", 2) + "/>";
    for (i = 0; i < 9; i++) {
      y = -10 - i * 10.4;
      s += '<path d="M-4 ' + y + " L4 " + (y - 10.4) + " M4 " + y + " L-4 " + (y - 10.4) + '" stroke="' + dk("#FFC93C", 0.3) + '" stroke-width="1.4"/>';
    }
    s += '<rect x="-44" y="-112" width="110" height="8" ' + f("#FFC93C", 2) + '/><rect x="-52" y="-110" width="12" height="14" ' + f("#8A97AD", 1.6) + '/><rect x="-8" y="-122" width="16" height="12" rx="2" ' + f("#E5483A", 1.8) + '/>';
    s += '<path d="M54 -104 V-56" stroke="#3A3F4D" stroke-width="2"/><path d="M54 -56 L48 -50 H60Z" fill="#3A3F4D"/><rect x="40" y="-50" width="28" height="14" rx="2" ' + f("#C4533F", 2) + '/><path d="M40 -43 H68 M54 -50 V-36" stroke="#8E2A22" stroke-width="1.4"/>';
    return s;
  };
  // a kitchen scale: a base with a round dial and a tray on top (o.n = what the dial shows)
  KITS.kscale = function (o) {
    var n = o.n == null ? "" : o.n;
    return '<rect x="-3" y="-34" width="6" height="14" fill="#8A97AD"/><ellipse cx="0" cy="-36" rx="26" ry="5" ' + f("#C9D4E6", 2.2) + '/><path d="M-26 -20 H26 L30 0 H-30Z" ' + f("#E8EEF8", 2.4) + '/><circle cx="0" cy="-11" r="12" ' + f("#FFFFFE", 2.2) + '/><path d="M0 -11 L7 -17" stroke="#E5483A" stroke-width="2.4" stroke-linecap="round"/><circle cx="0" cy="-11" r="1.8" fill="' + INK + '"/>' +
      (n !== "" ? '<text x="0" y="-1.6" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="7.4" fill="' + INK + '">' + n + "</text>" : "") + '<path d="M-8 -17 L-6 -15 M8 -17 L6 -15 M-12 -11 H-9.6 M12 -11 H9.6" stroke="' + INK + '" stroke-width="1.2" stroke-linecap="round"/>';
  };
  // three sections side by side like a bar (o.c1, o.c2, o.c3 = colours); the middle of the bar is the origin
  KITS.sections = function (o) {
    return '<rect x="-60" y="-18" width="40" height="36" rx="5" ' + f(o.c1 || "#E5483A", 2.4) + '/><rect x="-20" y="-18" width="40" height="36" ' + f(o.c2 || "#3D8BF2", 2.4) + '/><rect x="20" y="-18" width="40" height="36" rx="5" ' + f(o.c3 || "#FFD23F", 2.4) + '/>';
  };

  // a patch of dug soil with furrows, in picture coordinates (draw it at 0,0): x from 112 to 232, near the ground line
  KITS.soilpatch = function (o) {
    return '<path d="M116 126 L226 126 L236 148 L106 148Z" ' + f("#A8713A", 2.4) + '/><path d="M122 134 H222 M118 141 H230" stroke="#8A5A2B" stroke-width="2.4" stroke-linecap="round"/><circle cx="150" cy="130" r="1.8" fill="#6B4423"/><circle cx="190" cy="137" r="1.8" fill="#6B4423"/>';
  };
  // a garden bed seen from the front: one straight row of six seeds lying in a furrow, with a stake and a string at each end (picture coordinates)
  KITS.gardenrow = function (o) {
    var s = '<path d="M72 112 L226 112 L238 148 L60 148Z" ' + f("#B98A5A", 2.4) + '/><path d="M78 128 H220" stroke="#9A6F42" stroke-width="3" stroke-linecap="round"/>', i, x;
    s += '<rect x="74" y="94" width="4" height="36" fill="#C98B4A"/><rect x="220" y="94" width="4" height="36" fill="#C98B4A"/><path d="M76 100 H222" stroke="#E5483A" stroke-width="1.8"/>';
    for (i = 0; i < 6; i++) {
      x = 98 + i * 24;
      s += '<ellipse cx="' + x + '" cy="128" rx="8" ry="5.2" ' + f("#7A4E2A", 2) + '/><path d="M' + (x - 4) + " 126 Q" + x + ' 124 ' + (x + 3) + ' 125.4" stroke="#C9A06B" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    }
    return s;
  };

  // a dashed purple ring around the foot of a tree trunk (picture coordinates): the "base" of the trunk
  KITS.basering = function (o) {
    return '<rect x="128" y="106" width="44" height="30" rx="12" fill="none" stroke="' + P + '" stroke-width="3.4" stroke-dasharray="7 5" stroke-linecap="round"/>';
  };

  /* ------------------------------------------------------------------ new things: oasis town */
  // a scene item for a hat or cap on a child standing at (x, y) at scale s (the child must stand upright; k = how big the hat is next to the head)
  function hatOn(kind, x, y, s, k) {
    return [kind, x, y - 61 * s, s * (k || 0.85)];
  }
  // a single orange brick (the middle is the origin)
  KITS.brick = function (o) {
    return '<rect x="-8" y="-4" width="16" height="8" rx="1.4" ' + f("#D98B6A", 1.8) + '/>';
  };
  // a captain's cap, its bottom edge on the origin: white top, a dark blue band, a gold badge and a black peak
  KITS.captaincap = function (o) {
    return '<path d="M-14 0 Q-16 -15 0 -17 Q16 -15 14 0Z" ' + f("#FFFFFE", 2.2) + '/><rect x="-14" y="-6.4" width="28" height="6.4" ' + f("#27407A", 2) + '/><circle cx="0" cy="-3.2" r="3.2" ' + f("#FFD23F", 1.4) + '/><path d="M-13 0 H13 L17 4.4 Q0 8 -17 4.4Z" ' + f("#2B2F3D", 1.8) + "/>";
  };
  // a yellow hard hat, its bottom edge on the origin
  KITS.hardhat = function (o) {
    return '<path d="M-14 0 Q-14 -17 0 -18 Q14 -17 14 0Z" ' + f("#FFC93C", 2.2) + '/><rect x="-3.5" y="-18" width="7" height="12" rx="2" ' + f("#FFB000", 1.6) + '/><path d="M-17 0 H17 Q17 3.4 13 3.4 H-13 Q-17 3.4 -17 0Z" ' + f("#E0A800", 2) + '/><ellipse cx="-8" cy="-11" rx="2.4" ry="3.6" transform="rotate(20 -8 -11)" fill="#fff" opacity=".5"/>';
  };
  // a long red cape that hangs behind a child (draw it first; the feet are at the origin)
  KITS.cape = function (o) {
    return '<path d="M-12 -45 Q-26 -22 -24 0 H24 Q26 -22 12 -45Z" ' + f("#C93A3A", 2.4) + '/><path d="M-24 -4 H24" stroke="#FFFFFE" stroke-width="3.4" stroke-linecap="round"/>';
  };
  // a factory with a sawtooth roof, two chimneys and smoke (the bottom middle is the origin)
  KITS.factory = function (o) {
    var s = '<rect x="26" y="-84" width="12" height="48" ' + f("#B5543A", 2.2) + '/><rect x="24" y="-88" width="16" height="7" rx="2" ' + f("#8E3E2A", 2) + '/><rect x="-34" y="-72" width="10" height="36" ' + f("#B5543A", 2.2) + '/><rect x="-36" y="-76" width="14" height="6" rx="2" ' + f("#8E3E2A", 2) + "/>", i;
    s += '<circle cx="31" cy="-96" r="6" fill="#EEF1F8" stroke="#B9C3D6" stroke-width="1.6"/><circle cx="38" cy="-104" r="8" fill="#EEF1F8" stroke="#B9C3D6" stroke-width="1.6"/><circle cx="-29" cy="-84" r="5" fill="#EEF1F8" stroke="#B9C3D6" stroke-width="1.6"/><circle cx="-24" cy="-92" r="6.4" fill="#EEF1F8" stroke="#B9C3D6" stroke-width="1.6"/>';
    s += '<rect x="-46" y="-40" width="92" height="40" ' + f("#E8B66E", 2.4) + '/><path d="M-46 -40 V-58 L-23 -40 V-58 L0 -40 V-58 L23 -40 V-58 L46 -40Z" ' + f("#8A97AD", 2.4) + "/>";
    for (i = 0; i < 4; i++) s += '<rect x="' + (-40 + i * 21) + '" y="-30" width="13" height="12" rx="1.6" ' + f("#CFEAFF", 1.6) + "/>";
    s += '<rect x="-9" y="-22" width="18" height="22" rx="2" ' + f("#7A5328", 2) + '/><path d="M-9 -11 H9" stroke="' + dk("#7A5328", 0.35) + '" stroke-width="1.4"/>';
    return s;
  };
  // a school desk seen from the front: a flat top and a front panel (the bottom middle is the origin); a child stands behind it
  KITS.deskk = function (o) {
    return '<rect x="-22" y="-26" width="44" height="26" rx="2" ' + f("#E0AC6A", 2.2) + '/><rect x="-25" y="-31" width="50" height="6" rx="2.4" ' + f("#C48A52", 2.2) + "/>";
  };
  // a shop or library counter (o.w wide): a front with planks and a top board, the bottom middle is the origin
  KITS.counter = function (o) {
    var w = o.w || 100, s = '<rect x="' + -w / 2 + '" y="-30" width="' + w + '" height="30" ' + f("#D9A660", 2.4) + "/>", x;
    for (x = -w / 2 + 14; x < w / 2 - 6; x += 14) s += '<path d="M' + x + " -28 V-2" + '" stroke="' + dk("#D9A660", 0.28) + '" stroke-width="1.4"/>';
    return s + '<rect x="' + (-w / 2 - 4) + '" y="-37" width="' + (w + 8) + '" height="8" rx="2.6" ' + f("#B5793F", 2.4) + "/>";
  };
  // a paper bill with a few lines and a red total at the bottom (o.t = the total); the bottom middle is the origin
  KITS.receipt = function (o) {
    var s = '<path d="M-14 0 V-46 H14 V0 L10 -3 L6 0 L2 -3 L-2 0 L-6 -3 L-10 0Z" ' + f("#FFFEF4", 2) + "/>", i;
    for (i = 0; i < 4; i++) s += '<path d="M-9 ' + (-38 + i * 7) + " H" + (i % 2 ? 4 : 9) + '" stroke="#9FB3D1" stroke-width="1.8" stroke-linecap="round"/>';
    return s + '<text x="0" y="-8" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="9.4" fill="#E5483A">' + (o.t || "$") + "</text>";
  };
  // an exclamation mark in an orange bubble, like the question mark
  KITS.exm = function (o) {
    return '<circle cx="0" cy="0" r="13" ' + f("#FF8A5A", 2.4) + '/><rect x="-2.4" y="-8" width="4.8" height="10.4" rx="2.4" fill="#FFFFFE"/><circle cx="0" cy="6.4" r="2.8" fill="#FFFFFE"/>';
  };
  // a stage in picture coordinates (draw it at 0,0): wooden floor, red curtains at both sides, a valance on top and two spotlights
  KITS.stage = function (o) {
    var s = '<path d="M80 18 L52 126 H106Z M160 18 L134 126 H190Z" fill="#FFF3B0" opacity=".32"/><rect x="0" y="120" width="240" height="40" ' + f("#B5793F", 2.4) + '/>', i;
    for (i = 1; i < 5; i++) s += '<path d="M0 ' + (120 + i * 8) + ' H240" stroke="' + dk("#B5793F", 0.28) + '" stroke-width="1.4"/>';
    s += '<path d="M0 0 H48 Q38 56 54 122 H0Z" ' + f("#C93A3A", 2.4) + '/><path d="M240 0 H192 Q202 56 186 122 H240Z" ' + f("#C93A3A", 2.4) + '/><path d="M14 4 Q20 60 16 120 M32 4 Q36 60 32 120 M226 4 Q220 60 224 120 M208 4 Q204 60 208 120" stroke="' + dk("#C93A3A", 0.3) + '" stroke-width="1.6" fill="none" opacity=".7"/>';
    s += '<rect x="0" y="0" width="240" height="14" ' + f("#A82A2A", 2.4) + "/>";
    for (i = 0; i < 12; i++) s += '<path d="M' + i * 20 + ' 14 a10 8 0 0 0 20 0Z" ' + f("#A82A2A", 1.8) + "/>";
    return s;
  };
  // a bookshelf with three shelves of books, the bottom middle is the origin
  KITS.bookshelf = function (o) {
    var w = o.w || 70, s = '<rect x="' + -w / 2 + '" y="-84" width="' + w + '" height="84" rx="3" ' + f("#B5793F", 2.4) + '/><rect x="' + (-w / 2 + 4) + '" y="-80" width="' + (w - 8) + '" height="76" fill="#8A5A2B"/>', r, x, bh, cols = ["#E5483A", "#3D8BF2", "#FFC93C", "#5DBB5A", "#8B6BE8", "#FF8FB1"], k;
    for (r = 0; r < 3; r++) {
      x = -w / 2 + 6;
      k = r;
      while (x < w / 2 - 12) {
        bh = 16 + ((k * 7) % 9);
        s += '<rect x="' + x + '" y="' + (-4 - r * 26 - bh) + '" width="8" height="' + bh + '" ' + f(cols[k % 6], 1.4) + "/>";
        x += 9.6;
        k += 2;
      }
      s += '<rect x="' + (-w / 2 + 4) + '" y="' + (-4 - r * 26) + '" width="' + (w - 8) + '" height="3" fill="' + dk("#B5793F", 0.2) + '"/>';
    }
    return s;
  };
  // a doorway in a wall with the door swung open and the outside showing (the bottom middle is the origin)
  KITS.doorway = function (o) {
    return '<rect x="-26" y="-78" width="52" height="78" rx="3" ' + f("#E6C79A", 2.4) + '/><rect x="-20" y="-72" width="40" height="72" fill="#CFEAFF"/><rect x="-20" y="-24" width="40" height="24" fill="#9FD98A"/><circle cx="8" cy="-52" r="6" fill="#FFD65A"/><path d="M-20 -72 L-36 -64 V6 L-20 0Z" ' + f("#A8713A", 2.2) + '/><circle cx="-31" cy="-30" r="2" fill="#FFD23F"/>';
  };

  /* ------------------------------------------------------------------ new things: pyramid hall */
  // a flat toy shape sitting on the ground (o.k = "tri", "sq" or "circ", o.c = colour); the bottom middle is the origin
  KITS.shape = function (o) {
    var c = o.c || "#8B6BE8", k = o.k || "tri";
    if (k === "sq") return '<rect x="-20" y="-40" width="40" height="40" rx="3" ' + f(c, 2.6) + '/><rect x="-14" y="-34" width="10" height="6" rx="2" fill="#fff" opacity=".45"/>';
    if (k === "circ") return '<circle cx="0" cy="-20" r="20" ' + f(c, 2.6) + '/><ellipse cx="-8" cy="-28" rx="5" ry="3" transform="rotate(-30 -8 -28)" fill="#fff" opacity=".45"/>';
    return '<path d="M-26 0 L0 -46 L26 0Z" ' + f(c, 2.6) + '/><path d="M-10 -14 L-2 -28" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".45"/>';
  };
  // a sheet of drawing paper with a little house and a sun on it (o.c = the colour of the roof); the bottom middle is the origin
  KITS.drawing = function (o) {
    var roof = o.c || "#E5483A";
    return '<rect x="-24" y="-58" width="48" height="58" rx="3" ' + f("#FFFFFE", 2.4) + '/><circle cx="12" cy="-44" r="6" ' + f("#FFD23F", 1.6) + '/><rect x="-16" y="-24" width="28" height="18" ' + f("#F3DDB0", 1.8) + '/><path d="M-19 -24 L-2 -38 L15 -24Z" ' + f(roof, 1.8) + '/><rect x="-5" y="-17" width="7" height="11" ' + f("#8A5A2B", 1.4) + '/><rect x="3" y="-20" width="6" height="6" ' + f("#BFE3FA", 1.2) + "/>";
  };
  // a printer: a grey box with a paper standing in the back and a printed page sliding out of the front (o.c = the colour of the printed roof)
  KITS.printer = function (o) {
    var s = '<rect x="-18" y="-54" width="36" height="26" rx="2" ' + f("#FFFFFE", 2) + '/><path d="M-12 -46 H8 M-12 -40 H12 M-12 -34 H2" stroke="#9FB3D1" stroke-width="1.8" stroke-linecap="round"/>';
    s += '<rect x="-38" y="-30" width="76" height="30" rx="5" ' + f("#C9D4E6", 2.4) + '/><rect x="-38" y="-30" width="76" height="9" rx="4" ' + f("#E8EEF8", 2.2) + '/><circle cx="28" cy="-12" r="2.6" fill="#35B779"/><rect x="-24" y="-10" width="40" height="5" rx="2" fill="#4A5878"/>';
    return s + '<g transform="translate(6,2) rotate(-5) scale(.6,.52)">' + KITS.drawing({ c: o.c }) + "</g>";
  };
  // a record player: a wooden base, a black record with a red label, and an arm with a needle (the bottom middle is the origin)
  KITS.recordplayer = function (o) {
    return '<rect x="-40" y="-16" width="80" height="16" rx="3" ' + f("#B5793F", 2.4) + '/><ellipse cx="0" cy="-18" rx="36" ry="9" ' + f("#E8EEF8", 2) + '/><ellipse cx="-2" cy="-19" rx="30" ry="7.4" ' + f("#2B2F3D", 1.8) + '/><ellipse cx="-2" cy="-19" rx="22" ry="5.2" fill="none" stroke="#5A6578" stroke-width="1.2"/><ellipse cx="-2" cy="-19" rx="10" ry="2.8" ' + f("#E5483A", 1.2) + '/><circle cx="32" cy="-24" r="3.6" ' + f("#8A97AD", 1.6) + '/><path d="M32 -24 L8 -18" stroke="#8A97AD" stroke-width="3" stroke-linecap="round"/><rect x="3" y="-21" width="8" height="5" rx="1.6" ' + f("#4A5878", 1.4) + "/>";
  };
  // a bar chart on a board with two legs: an axis along the left and bottom, tick marks, four bars (the bottom middle is the origin)
  KITS.barchart = function (o) {
    var s = '<rect x="-32" y="-16" width="5" height="16" fill="#8A5A2B"/><rect x="27" y="-16" width="5" height="16" fill="#8A5A2B"/><rect x="-46" y="-86" width="92" height="72" rx="4" ' + f("#FFFFFE", 2.6) + "/>", i, hs = [16, 34, 24, 44], cs = ["#E5483A", "#3D8BF2", "#FFC93C", "#5DBB5A"];
    for (i = 0; i < 4; i++) s += '<path d="M-34 ' + (-30 - i * 12) + ' H38" stroke="#E1E8F2" stroke-width="1.4"/>';
    for (i = 0; i < 4; i++) s += '<rect x="' + (-26 + i * 18) + '" y="' + (-24 - hs[i]) + '" width="13" height="' + hs[i] + '" ' + f(cs[i], 1.8) + "/>";
    return s + '<path d="M-34 -78 V-24 H40" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
  };
  // a tall stone column with a base and a top (the bottom middle is the origin)
  KITS.column = function (o) {
    var c = "#EADFC9", s = '<rect x="-16" y="-8" width="32" height="8" rx="2" ' + f(c, 2.2) + '/><rect x="-12" y="-14" width="24" height="7" ' + f(c, 2.2) + '/><rect x="-9" y="-96" width="18" height="83" ' + f(c, 2.2) + "/>";
    s += '<path d="M-4.5 -92 V-16 M0 -92 V-16 M4.5 -92 V-16" stroke="' + dk(c, 0.22) + '" stroke-width="1.6" opacity=".7"/>';
    return s + '<rect x="-13" y="-103" width="26" height="8" rx="2" ' + f(c, 2.2) + '/><rect x="-17" y="-110" width="34" height="8" rx="2" ' + f(c, 2.2) + "/>";
  };
  // a pencil case, a soft pouch with a zip along the top, open at one end so that pencils stick out of it (the bottom middle is the origin)
  KITS.pencilcase = function (o) {
    var cs = ["#E5483A", "#3D8BF2", "#FFC93C", "#5DBB5A"], s = "", i, x, a;
    for (i = 0; i < 4; i++) {
      x = 2 + i * 8;
      a = -14 + i * 9;
      s += '<g transform="translate(' + x + ",-14) rotate(" + a + ')"><rect x="-3.4" y="-32" width="6.8" height="30" ' + f(cs[i], 1.6) + '/><path d="M-3.4 -32 L0 -40 L3.4 -32Z" ' + f("#F2D3A8", 1.4) + '/><path d="M-1.2 -36.6 L0 -40 L1.2 -36.6Z" fill="' + INK + '"/></g>';
    }
    return s + '<rect x="-34" y="-20" width="68" height="20" rx="8" ' + f("#3FB6C9", 2.4) + '/><path d="M-30 -14 H-2" stroke="#FFFFFE" stroke-width="2" stroke-dasharray="3 3" stroke-linecap="round"/><rect x="-8" y="-17.4" width="7" height="6" rx="2" ' + f("#FFD23F", 1.2) + '/>' + h.star(18, -6, 3.6, "#FFE066") + h.star(-14, -5, 3, "#FFFFFE");
  };

  // a conical glass flask with coloured liquid and bubbles (o.c = the liquid); the bottom middle is the origin
  KITS.flask = function (o) {
    var c = o.c || "#6CCB5F";
    return '<path d="M-6 -48 L-6 -30 L-24 0 H24 L6 -30 L6 -48Z" fill="#EAF6FF" fill-opacity=".85" stroke="#8FB5D6" stroke-width="2.4" stroke-linejoin="round"/><path d="M-14 -14 L-18 -4 Q-18 -1 -15 -1 H15 Q18 -1 18 -4 L14 -14Q0 -10 -14 -14Z" fill="' + c + '" opacity=".9"/><path d="M-14 -14 Q0 -10 14 -14" fill="none" stroke="#fff" stroke-width="1.6" opacity=".6"/><ellipse cx="0" cy="-48" rx="8" ry="2.4" fill="#fff" stroke="#8FB5D6" stroke-width="2"/><circle cx="-4" cy="-8" r="2" fill="#fff" opacity=".8"/><circle cx="5" cy="-6" r="1.6" fill="#fff" opacity=".8"/><circle cx="1" cy="-20" r="2.4" fill="#fff" fill-opacity=".7" stroke="#8FB5D6" stroke-width="1.2"/><circle cx="-2" cy="-27" r="1.8" fill="#fff" fill-opacity=".7" stroke="#8FB5D6" stroke-width="1.2"/>';
  };
  // a remote control with two sticks, a red button and an aerial (the bottom middle is the origin)
  KITS.remote = function (o) {
    return '<path d="M13 -26 L22 -38" stroke="#8A97AD" stroke-width="2.6" stroke-linecap="round"/><circle cx="22.4" cy="-38.6" r="2.8" ' + f("#E5483A", 1.2) + '/><rect x="-22" y="-28" width="44" height="26" rx="9" ' + f("#4A5878", 2.4) + '/><circle cx="-11" cy="-15" r="6.6" ' + f("#2B2F3D", 1.6) + '/><circle cx="-11" cy="-15" r="3.2" fill="#8A97AD"/><circle cx="11" cy="-15" r="6.6" ' + f("#2B2F3D", 1.6) + '/><circle cx="11" cy="-15" r="3.2" fill="#8A97AD"/><circle cx="0" cy="-20" r="2.4" fill="#E5483A"/><circle cx="0" cy="-12" r="2.1" fill="#35B779"/>';
  };
  // a robot made of cardboard boxes with a face, a control panel and tape (the bottom middle is the origin)
  KITS.boxrobot = function (o) {
    var c = "#DBA860", c2 = "#C98B4A", s = '<path d="M0 -62 V-72" stroke="#8A97AD" stroke-width="2.4"/><circle cx="0" cy="-74" r="3.6" ' + f("#E5483A", 1.4) + "/>";
    s += '<rect x="-12" y="-6" width="9" height="6" rx="1.4" ' + f(c2, 1.8) + '/><rect x="3" y="-6" width="9" height="6" rx="1.4" ' + f(c2, 1.8) + '/><rect x="-26" y="-34" width="9" height="22" rx="2" ' + f(c2, 2) + '/><rect x="17" y="-34" width="9" height="22" rx="2" ' + f(c2, 2) + '/><circle cx="-21.5" cy="-10" r="4" ' + f("#C8CEDB", 1.6) + '/><circle cx="21.5" cy="-10" r="4" ' + f("#C8CEDB", 1.6) + "/>";
    s += '<rect x="-18" y="-36" width="36" height="31" rx="2.4" ' + f(c, 2.4) + '/><path d="M-18 -22 H18" stroke="' + dk(c, 0.28) + '" stroke-width="1.6"/><circle cx="-8" cy="-27" r="3" fill="#E5483A"/><circle cx="0" cy="-27" r="3" fill="#FFD23F"/><circle cx="8" cy="-27" r="3" fill="#35B779"/><rect x="-9" y="-17" width="18" height="6" rx="2" fill="#FFFEF4" stroke="' + INK + '" stroke-width="1.2"/>';
    s += '<rect x="-14" y="-62" width="28" height="25" rx="2.4" ' + f(c, 2.4) + '/><path d="M-3 -62 H3 V-55 H-3Z" fill="#F4E1B6" stroke="' + dk(c) + '" stroke-width="1.2"/>';
    s += '<circle cx="-6" cy="-50" r="4.4" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><circle cx="6" cy="-50" r="4.4" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><circle cx="-5.4" cy="-49.6" r="1.8" fill="' + INK + '"/><circle cx="6.6" cy="-49.6" r="1.8" fill="' + INK + '"/><path d="M-6 -43 Q0 -39 6 -43" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>';
    return s;
  };
  // a bathroom scale: a flat platform with a round dial in the front (o.n = the number the needle points at); the bottom middle is the origin
  KITS.bathscale = function (o) {
    return '<rect x="-30" y="-14" width="60" height="14" rx="5" ' + f("#E8EEF8", 2.4) + '/><rect x="-26" y="-12" width="52" height="3" rx="1.5" fill="#fff" opacity=".7"/><circle cx="0" cy="-5" r="5.4" ' + f("#FFFFFE", 1.6) + '/><path d="M0 -5 L3.6 -8" stroke="#E5483A" stroke-width="1.6" stroke-linecap="round"/><circle cx="0" cy="-5" r="1" fill="' + INK + '"/>' + (o.n != null ? '<text x="19" y="-3" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="7.6" fill="' + INK + '">' + o.n + "</text>" : "");
  };
  // a stick figure drawn in marker, in picture-sized lines around the origin (the middle of its body)
  KITS.stickfig = function (o) {
    return '<g fill="none" stroke="#2B2F3D" stroke-width="2.4" stroke-linecap="round"><circle cx="0" cy="-12" r="5.6"/><path d="M0 -6 V10 M-9 0 L0 -3 L9 0 M0 10 L-7 22 M0 10 L7 22"/></g>';
  };
  // a blue house plan with white lines (the bottom middle is the origin)
  KITS.blueprint = function (o) {
    return '<rect x="-42" y="-56" width="84" height="56" rx="3" ' + f("#2F6FD6", 2.6) + '/><g fill="none" stroke="#FFFFFE" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M-24 -10 V-32 L0 -46 L24 -32 V-10Z"/><rect x="-16" y="-28" width="9" height="9"/><rect x="7" y="-28" width="9" height="9"/><path d="M-4 -10 V-20 H4 V-10"/><path d="M-30 -6 H30 M-30 -9 V-3 M30 -9 V-3" stroke-width="1.4"/></g><circle cx="-38" cy="-52" r="1.8" fill="#FFD23F"/><circle cx="38" cy="-52" r="1.8" fill="#FFD23F"/>';
  };
  // a board game: a checker board with a few round pieces and a die, standing up (the bottom middle is the origin)
  KITS.gameboard = function (o) {
    var s = '<rect x="-34" y="-68" width="68" height="68" rx="4" ' + f("#8A5A2B", 2.6) + "/>", r, c;
    for (r = 0; r < 6; r++) for (c = 0; c < 6; c++) s += '<rect x="' + (-30 + c * 10) + '" y="' + (-64 + r * 10) + '" width="10" height="10" fill="' + ((r + c) % 2 ? "#6B4423" : "#F1D9A8") + '"/>';
    s += '<circle cx="-5" cy="-29" r="3.8" ' + f("#E5483A", 1.4) + '/><circle cx="5" cy="-39" r="3.8" ' + f("#E5483A", 1.4) + '/><circle cx="-15" cy="-49" r="3.8" ' + f("#3D8BF2", 1.4) + '/><circle cx="15" cy="-19" r="3.8" ' + f("#3D8BF2", 1.4) + "/>";
    return s;
  };
  // a white cube die with three dots showing (the bottom middle is the origin)
  KITS.die = function (o) {
    return '<rect x="-9" y="-18" width="18" height="18" rx="3.4" ' + f("#FFFFFE", 2) + '/><circle cx="-4" cy="-13.4" r="1.7" fill="' + INK + '"/><circle cx="0" cy="-9" r="1.7" fill="' + INK + '"/><circle cx="4" cy="-4.6" r="1.7" fill="' + INK + '"/>';
  };

  // a sheet of paper with a folded corner and one line of big writing on it (o.t = the writing); the bottom middle is the origin
  KITS.sheet = function (o) {
    return '<path d="M-24 0 V-60 H12 L24 -48 V0Z" ' + f("#FFFFFE", 2.4) + '/><path d="M12 -60 V-48 H24" fill="#E7EEF8" stroke="' + dk("#FFFFFE", 0.3) + '" stroke-width="1.6" stroke-linejoin="round"/><text x="0" y="-26" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="' + (o.size || 12.5) + '" fill="#2F6AA8">' + (o.t || "") + "</text>";
  };

  /* ------------------------------------------------------------------ new things: starry night */
  // headphones on a child standing at the origin (draw them at the child's place and scale, after the child)
  KITS.headphones = function (o) {
    return '<path d="M-14.5 -55 Q-14.5 -74 0 -74 Q14.5 -74 14.5 -55" fill="none" stroke="' + dk("#3D8BF2", 0.3) + '" stroke-width="6" stroke-linecap="round"/><path d="M-14.5 -55 Q-14.5 -74 0 -74 Q14.5 -74 14.5 -55" fill="none" stroke="#3D8BF2" stroke-width="3.4" stroke-linecap="round"/><rect x="-19" y="-62" width="9" height="15" rx="4.4" ' + f("#E5483A", 2) + '/><rect x="10" y="-62" width="9" height="15" rx="4.4" ' + f("#E5483A", 2) + "/>";
  };
  // a yellow lightning bolt (the middle is the origin)
  KITS.bolt = function (o) {
    return '<path d="M3 -22 L-10 3 H-1 L-5 22 L11 -5 H2Z" ' + f("#FFD23F", 2.2) + '/><path d="M2 -16 L-5 -3" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>';
  };
  // a sky full of little stars, in picture coordinates (draw it at 0,0)
  KITS.starfield = function (o) {
    var s = "", i, x, y, r;
    for (i = 0; i < 70; i++) {
      x = 6 + ((i * 53) % 230);
      y = 6 + ((i * 37) % 104);
      r = 1.5 + (i % 4) * 0.7;
      s += i % 7 === 0 ? h.star(x, y, r * 2.4, "#FFE066") : '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#FFFFFE" opacity="' + (0.65 + (i % 3) * 0.12) + '"/>';
    }
    return s;
  };
  // a sand timer: a glass with sand running through, brown caps at the top and the bottom (the bottom middle is the origin)
  KITS.hourglass = function (o) {
    return '<rect x="-17" y="-58" width="34" height="6" rx="2.4" ' + f("#8A5A2B", 2) + '/><rect x="-17" y="-6" width="34" height="6" rx="2.4" ' + f("#8A5A2B", 2) + '/><path d="M-13 -52 H13 Q13 -34 3 -29 Q3 -27 3 -27 Q13 -22 13 -6 H-13 Q-13 -22 -3 -27 Q-3 -29 -3 -29 Q-13 -34 -13 -52Z" fill="#EAF6FF" fill-opacity=".85" stroke="#8FB5D6" stroke-width="2.2" stroke-linejoin="round"/><path d="M-9 -49 H9 Q8 -38 1.4 -31 H-1.4 Q-8 -38 -9 -49Z" fill="#F2C14E"/><path d="M0 -29 V-14" stroke="#F2C14E" stroke-width="1.8"/><path d="M-11 -6 Q-6 -16 0 -17 Q6 -16 11 -6Z" fill="#F2C14E"/>';
  };
  // a rainbow of six bands with a little cloud at each end, its centre on the ground at the origin
  KITS.rainbow = function (o) {
    var cs = ["#E5483A", "#FF8A3D", "#FFD23F", "#5DBB5A", "#3D8BF2", "#8B6BE8"], s = "", i, r;
    for (i = 0; i < 6; i++) {
      r = 56 - i * 5;
      s += '<path d="M' + -r + " 0 A" + r + " " + r + ' 0 0 1 ' + r + ' 0" fill="none" stroke="' + cs[i] + '" stroke-width="5.4"/>';
    }
    return s + '<g fill="#fff"><ellipse cx="-47" cy="-2" rx="16" ry="7"/><circle cx="-54" cy="-8" r="7"/><circle cx="-42" cy="-10" r="8"/><ellipse cx="47" cy="-2" rx="16" ry="7"/><circle cx="54" cy="-8" r="7"/><circle cx="42" cy="-10" r="8"/></g>';
  };
  // a football goal: white posts and bar with a net (the bottom middle is the origin)
  KITS.goal = function (o) {
    var s = '<rect x="-34" y="-42" width="68" height="42" fill="#FFFFFE" fill-opacity=".35"/>', i;
    for (i = 1; i < 6; i++) s += '<path d="M' + (-34 + i * 11.3) + ' -42 V0" stroke="#C9D4E6" stroke-width="1.2"/>';
    for (i = 1; i < 4; i++) s += '<path d="M-34 ' + (-42 + i * 10.5) + ' H34" stroke="#C9D4E6" stroke-width="1.2"/>';
    return s + '<path d="M-34 0 V-42 H34 V0" fill="none" stroke="#4A5878" stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M-34 0 V-42 H34 V0" fill="none" stroke="#FFFFFE" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>';
  };
  // a drinking glass with water up to o.lv (0 to 1) (the bottom middle is the origin)
  KITS.glasslevel = function (o) {
    var lv = o.lv == null ? 0.5 : o.lv, hh = lv * 30, w = 11 + (3 * hh) / 34;
    return '<path d="M-14 -34 L-11 0 H11 L14 -34Z" fill="#E4F4FF" fill-opacity=".7" stroke="#8FB5D6" stroke-width="2.4" stroke-linejoin="round"/><path d="M' + -w + " " + -hh + " L-11 0 H11 L" + w + " " + -hh + 'Z" fill="#6AB8F0" opacity=".9"/><path d="M' + -w + " " + -hh + " L" + w + " " + -hh + '" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>';
  };
  // a cardboard box seen from the front with its flaps open: this is the back part and the flaps (draw something inside, then boxfront over it)
  KITS.boxback = function (o) {
    return '<path d="M-26 -30 L-34 -50 L-14 -44Z M26 -30 L34 -50 L14 -44Z" ' + f("#C98B4A", 2.2) + '/><rect x="-26" y="-44" width="52" height="14" ' + f("#8A5A2B", 2) + "/>";
  };
  KITS.boxfront = function (o) {
    return '<rect x="-26" y="-34" width="52" height="34" rx="2" ' + f("#DBA860", 2.4) + '/><path d="M-4 -34 H4 V-20 H-4Z" fill="#F4E1B6" stroke="' + dk("#DBA860") + '" stroke-width="1.2"/><path d="M-26 -34 H26" stroke="' + dk("#DBA860", 0.3) + '" stroke-width="2"/>';
  };
  // three wavy lines that rise from a smell (the bottom middle is the origin)
  KITS.smell = function (o) {
    var s = "", i;
    for (i = 0; i < 3; i++) s += '<path d="M' + (i * 7 - 7) + ' 0 q4 -6 0 -12 t0 -12" fill="none" stroke="#9AD0F0" stroke-width="2.6" stroke-linecap="round"/>';
    return s;
  };
  // a flock of little flying birds over the sky, as scene items
  function flock() {
    var out = [], i, row, col, cs = ["#4FA8F0", "#6AA7FF", "#8B6BE8", "#4FA8F0"];
    for (i = 0; i < 28; i++) {
      row = Math.floor(i / 7);
      col = i % 7;
      out.push(["bird", 24 + col * 30 + (row % 2) * 13 + ((i * 7) % 5), 30 + row * 11 + ((i * 3) % 3), 0.3, { fly: true, c: cs[i % 4] }]);
    }
    return out;
  }

  /* ------------------------------------------------------------------ new things: camel caravan */
  // two panels side by side, warm and sandy at the left, cold and snowy at the right, in picture coordinates (draw it at 0,0)
  KITS.splitbg = function (o) {
    return '<rect x="0" y="0" width="120" height="160" fill="#FFE3B0"/><rect x="120" y="0" width="120" height="160" fill="#CFE4F7"/><rect x="0" y="118" width="120" height="42" fill="#EBC27A"/><path d="M120 112 Q150 104 180 112 T240 110 V160 H120Z" fill="#FFFFFE"/><rect x="118" y="0" width="4" height="160" fill="#6A48E8"/>';
  };
  // a half disc with its flat side on the right (draw it again turned around for the other half); the middle of the flat side is the origin
  KITS.halfdisc = function (o) {
    var c = o.c || "#FFA94D", s = '<path d="M0 -24 A24 24 0 0 0 0 24Z" ' + f(c, 2.4) + '/><path d="M0 -19 A19 19 0 0 0 0 19Z" fill="' + dk(c, -0.25) + '" opacity=".5"/>', i, a;
    for (i = 0; i < 4; i++) {
      a = Math.PI / 2 + ((i + 0.5) * Math.PI) / 4;
      s += '<path d="M0 0 L' + (Math.cos(a) * 19).toFixed(1) + " " + (Math.sin(a) * 19).toFixed(1) + '" stroke="' + dk(c, 0.18) + '" stroke-width="1.6"/>';
    }
    return s;
  };
  // a map on a board with two legs: a wide grey main road across, two thin tracks, little houses and trees (the bottom middle is the origin)
  KITS.mapboard = function (o) {
    var s = '<rect x="-34" y="-10" width="5" height="10" fill="#8A5A2B"/><rect x="29" y="-10" width="5" height="10" fill="#8A5A2B"/><rect x="-62" y="-98" width="124" height="90" rx="4" ' + f("#8A5A2B", 2.6) + '/><rect x="-57" y="-93" width="114" height="80" fill="#A8DC8A"/>';
    s += '<path d="M-30 -93 V-13 M26 -93 V-13" stroke="#C9A06B" stroke-width="5"/><rect x="-57" y="-62" width="114" height="17" fill="#7B8394"/><path d="M-54 -53.5 H54" stroke="#FFFFFE" stroke-width="2" stroke-dasharray="7 6"/>';
    s += '<rect x="-48" y="-84" width="10" height="9" ' + f("#E5483A", 1.4) + '/><rect x="-22" y="-30" width="10" height="9" ' + f("#FFC93C", 1.4) + '/><rect x="34" y="-84" width="10" height="9" ' + f("#3D8BF2", 1.4) + '/><rect x="34" y="-30" width="10" height="9" ' + f("#E5483A", 1.4) + '/><circle cx="8" cy="-80" r="5" fill="#4FA06A"/><circle cx="-8" cy="-26" r="5" fill="#4FA06A"/>';
    return s;
  };
  // a pile of o.n coins (the bottom middle is the origin)
  KITS.coinstack = function (o) {
    var s = "", i, n = o.n || 3;
    for (i = 0; i < n; i++) s += '<rect x="-11" y="' + (-5 - i * 4.4) + '" width="22" height="5.4" rx="2.6" ' + f("#FFD23F", 1.8) + '/><path d="M-9 ' + (-3 - i * 4.4) + ' H9" stroke="#E0A800" stroke-width="1" opacity=".7"/>';
    return s;
  };
  // a wicker basket with three round fruits in it (o.c = their colour); the bottom middle is the origin
  KITS.basketof = function (o) {
    var c = o.c || "#E5483A";
    return '<circle cx="-9" cy="-20" r="8" ' + f(c, 2) + '/><circle cx="9" cy="-20" r="8" ' + f(c, 2) + '/><circle cx="0" cy="-27" r="8" ' + f(c, 2) + '/><path d="M-26 -18 H26 L21 0 H-21Z" ' + f("#C98B4A", 2.4) + '/><path d="M-23 -11 H23 M-22 -5 H22" stroke="#A8713A" stroke-width="1.8"/><path d="M-7 -18 V0 M7 -18 V0" stroke="#A8713A" stroke-width="1.8"/>';
  };
  // a cake cut into two halves with a knife standing in the cut (the bottom middle is the origin)
  KITS.cutcake = function (o) {
    return '<rect x="-30" y="-22" width="28" height="22" rx="6" ' + f("#F7C99C", 2.4) + '/><path d="M-30 -16 Q-24 -10 -18 -16 Q-12 -10 -6 -16 L-2 -16 L-2 -22 L-30 -22Z" fill="#fff" stroke="' + dk("#F7C99C") + '" stroke-width="1.4"/><rect x="2" y="-22" width="28" height="22" rx="6" ' + f("#F7C99C", 2.4) + '/><path d="M2 -16 Q8 -10 14 -16 Q20 -10 26 -16 L30 -16 L30 -22 L2 -22Z" fill="#fff" stroke="' + dk("#F7C99C") + '" stroke-width="1.4"/><circle cx="-16" cy="-25" r="3" fill="#E5483A"/><circle cx="16" cy="-25" r="3" fill="#E5483A"/><path d="M-2.4 -30 H2.4 V-3 L0 0 L-2.4 -3Z" ' + f("#C3CCDC", 1.8) + '/><rect x="-3.4" y="-46" width="6.8" height="17" rx="3" ' + f("#8A5A2B", 1.8) + "/>";
  };
  // a hat stand with three hooks (o.hats = three colours, null for an empty hook); the bottom middle is the origin
  KITS.hatrack = function (o) {
    var hs = o.hats || [], s = '<rect x="-3" y="-90" width="6" height="90" rx="2" ' + f("#8A5A2B", 2) + '/><ellipse cx="0" cy="0" rx="16" ry="4" ' + f("#8A5A2B", 2) + '/><path d="M0 -84 L-20 -92 M0 -84 L20 -92 M0 -90 V-98" stroke="#8A5A2B" stroke-width="4" stroke-linecap="round"/>', i, xs = [-20, 0, 20], ys = [-92, -98, -92];
    for (i = 0; i < 3; i++) if (hs[i]) s += at("hat", xs[i], ys[i] + 24 * 0.7, 0.7, { c: hs[i] });
    return s;
  };
  // a gold padlock (the middle is the origin)
  KITS.padlock = function (o) {
    return '<path d="M-6 -8 V-14 Q-6 -22 0 -22 Q6 -22 6 -14 V-8" fill="none" stroke="#8A97AD" stroke-width="4" stroke-linecap="round"/><rect x="-11" y="-9" width="22" height="18" rx="4" ' + f("#FFD23F", 2.2) + '/><circle cx="0" cy="-1" r="2.6" fill="' + INK + '"/><rect x="-1.2" y="-1" width="2.4" height="6" rx="1.2" fill="' + INK + '"/>';
  };
  // a log lying across a stream, in picture coordinates (draw it at 0,0): green banks at both ends, water between, the top of the log at y = 106
  KITS.logbridge = function (o) {
    return '<rect x="0" y="108" width="240" height="52" fill="#4FA8F0"/><path d="M50 128 Q62 124 74 128 T98 128 M142 142 Q154 138 166 142 T190 142" fill="none" stroke="#FFFFFE" stroke-width="2.4" stroke-linecap="round"/><path d="M0 104 H44 Q50 106 52 160 H0Z" fill="#8FD07A"/><path d="M240 104 H196 Q190 106 188 160 H240Z" fill="#8FD07A"/><rect x="26" y="106" width="188" height="14" rx="7" ' + f("#9B6A3C", 2.4) + '/><ellipse cx="30" cy="113" rx="5" ry="6.4" ' + f("#C98B4A", 1.6) + '/><ellipse cx="210" cy="113" rx="5" ry="6.4" ' + f("#C98B4A", 1.6) + '/><path d="M60 111 H110 M130 115 H180" stroke="#7A4E2A" stroke-width="1.6" stroke-linecap="round"/>';
  };
  // a telescope on a tripod, pointing up to the right (the middle of the tripod is the origin)
  KITS.telescope = function (o) {
    return '<path d="M0 -34 L-18 0 M0 -34 L16 0 M0 -34 L2 0" stroke="#8A5A2B" stroke-width="3.6" stroke-linecap="round"/><g transform="translate(0,-34) rotate(-42)"><rect x="-14" y="-7" width="62" height="14" rx="4" ' + f("#4A5878", 2.2) + '/><rect x="42" y="-9" width="12" height="18" rx="3" ' + f("#C9D4E6", 2) + '/><rect x="-20" y="-4.4" width="8" height="8.8" rx="2" ' + f("#8A97AD", 1.8) + '/></g>';
  };
  // a microscope: a heavy foot, a curved arm, a tube with an eyepiece and a little stage (the bottom middle is the origin)
  KITS.microscope = function (o) {
    return '<rect x="-24" y="-6" width="48" height="6" rx="3" ' + f("#4A5878", 2) + '/><path d="M12 -6 Q30 -24 18 -52 L10 -46 Q18 -26 4 -10Z" ' + f("#8A97AD", 2.2) + '/><rect x="-14" y="-24" width="26" height="4" rx="1.6" ' + f("#4A5878", 1.8) + '/><g transform="rotate(-14 -2 -50)"><rect x="-10" y="-72" width="12" height="42" rx="3" ' + f("#C9D4E6", 2.2) + '/><rect x="-8" y="-80" width="8" height="10" rx="2" ' + f("#4A5878", 1.8) + '/><rect x="-8" y="-33" width="8" height="8" rx="2" ' + f("#4A5878", 1.8) + "/></g>";
  };
  // a round view through a microscope, many small cells with a dot in each (the middle is the origin)
  KITS.cellview = function (o) {
    var s = '<circle cx="0" cy="0" r="36" ' + f("#FFF3F5", 3) + "/>", P = [[-16, -16, "#FF9DB5"], [10, -20, "#9ADF8A"], [22, 0, "#FF9DB5"], [-22, 6, "#9ADF8A"], [0, 2, "#FFD27A"], [-4, 24, "#FF9DB5"], [18, 22, "#9ADF8A"], [-26, -4, "#FFD27A"]], i;
    for (i = 0; i < P.length; i++) s += '<circle cx="' + P[i][0] + '" cy="' + P[i][1] + '" r="9" ' + f(P[i][2], 1.6) + '/><circle cx="' + (P[i][0] + 1) + '" cy="' + (P[i][1] + 1) + '" r="3" fill="' + dk(P[i][2], 0.35) + '"/>';
    return s;
  };
  // a board of rules: a title and three lines, each with a green tick (the bottom middle is the origin)
  KITS.rulesboard = function (o) {
    var s = '<rect x="-30" y="-14" width="5" height="14" fill="#8A5A2B"/><rect x="25" y="-14" width="5" height="14" fill="#8A5A2B"/><rect x="-46" y="-98" width="92" height="86" rx="5" ' + f("#FFF6E0", 2.6) + '/><rect x="-46" y="-98" width="92" height="20" rx="5" ' + f("#E5883A", 2.4) + '/><text x="0" y="-83" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="14" fill="#FFFFFE">RULES</text>', i;
    for (i = 0; i < 3; i++) s += '<circle cx="-28" cy="' + (-62 + i * 18) + '" r="6.4" ' + f("#35B779", 1.6) + '/><path d="M-31 ' + (-62 + i * 18) + ' l2.4 2.6 l4.6 -5" fill="none" stroke="#FFFFFE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M-16 ' + (-62 + i * 18) + " H" + (30 - i * 6) + '" stroke="#9FB3D1" stroke-width="3" stroke-linecap="round"/>';
    return s;
  };
  // an upset spill of blue paint: a bucket lying on its side, a puddle and a trail of blue paw prints to the right (the middle of the puddle is the origin)
  KITS.paintspill = function (o) {
    var s = '<ellipse cx="0" cy="-3" rx="34" ry="7" ' + f("#4FA8F0", 2) + '/><ellipse cx="-8" cy="-4" rx="14" ry="2.4" fill="#8FD0F2" opacity=".7"/><g transform="translate(-30,-14) rotate(-80)"><path d="M-14 -24 H14 L11 0 H-11Z" ' + f("#8A97AD", 2.2) + '/><rect x="-15.5" y="-27" width="31" height="6" rx="3" ' + f("#6B7285", 1.8) + '/></g>', i;
    for (i = 0; i < 4; i++) s += '<ellipse cx="' + (44 + i * 16) + '" cy="' + (i % 2 ? -3 : 2) + '" rx="4.2" ry="2.8" fill="#4FA8F0" stroke="#2F7FC0" stroke-width="1.2"/>';
    return s;
  };
  // two blue front paws drawn over a sitting dog at the dog's own place and scale
  KITS.bluepaws = function (o) {
    return '<ellipse cx="-7" cy="-2.5" rx="6.5" ry="3.8" fill="#4FA8F0" stroke="#2F7FC0" stroke-width="1.6"/><ellipse cx="7" cy="-2.5" rx="6.5" ry="3.8" fill="#4FA8F0" stroke="#2F7FC0" stroke-width="1.6"/>';
  };
  // a straight road that runs away to the horizon, in picture coordinates (draw it at 0,0)
  KITS.persproad = function (o) {
    var s = '<path d="M96 160 L112 86 H128 L144 160Z" fill="#7B8394"/><path d="M96 160 L112 86 M144 160 L128 86" stroke="#FFFFFE" stroke-width="2.4"/>', i, y;
    for (i = 0; i < 5; i++) {
      y = 154 - i * 14.5;
      s += '<path d="M120 ' + y + " V" + (y - 7 + i) + '" stroke="#FFE066" stroke-width="' + (3.6 - i * 0.5) + '" stroke-linecap="round"/>';
    }
    return s;
  };

  // @@KITS_END

  /* ------------------------------------------------------------------ backgrounds */
  function bgDesert() {
    return '<rect width="240" height="160" fill="#FFF0CF"/><circle cx="196" cy="34" r="0" fill="#FFD23F"/><path d="M0 104 Q50 84 110 100 T240 92 L240 160 L0 160Z" fill="#F6D58E"/><path d="M0 128 Q70 104 150 126 T240 120 L240 160 L0 160Z" fill="#EBC272"/><path d="M0 146 Q90 132 170 146 T240 142 L240 160 L0 160Z" fill="#E0B05E"/>' +
      '<path d="M30 118 Q50 114 70 118 M150 134 Q170 130 190 134" fill="none" stroke="#D9A94F" stroke-width="2" stroke-linecap="round" opacity=".8"/>';
  }
  function bgPrairie() {
    var o = '<rect width="240" height="160" fill="#C9E8FF"/><ellipse cx="62" cy="36" rx="30" ry="10" fill="#fff"/><circle cx="50" cy="30" r="10" fill="#fff"/><circle cx="70" cy="27" r="12" fill="#fff"/><ellipse cx="182" cy="48" rx="24" ry="8" fill="#fff"/><rect y="92" width="240" height="68" fill="#C8D88A"/><rect y="92" width="240" height="3" fill="#B2C474"/>', i;
    for (i = 0; i < 5; i++) o += '<path d="M0 ' + (106 + i * 12) + ' H240" stroke="#B8CB7C" stroke-width="' + (1.4 + i * 0.5) + '" opacity=".9"/>';
    return o;
  }
  function bgValley() {
    return '<rect width="240" height="160" fill="#CBEAFF"/><circle cx="196" cy="34" r="14" fill="#FFE98A"/><path d="M0 24 Q60 30 112 100 L0 150Z" fill="#6CCB5F"/><path d="M0 24 Q40 34 70 70 Q30 60 0 70Z" fill="#8FD07F" opacity=".6"/><path d="M240 14 Q176 26 130 100 L240 150Z" fill="#5DBB5A"/><path d="M0 142 Q120 100 240 142 L240 160 L0 160Z" fill="#A5D984"/>' +
      '<path d="M122 121 C127 126 112 129 110 134" fill="none" stroke="#9A7A52" stroke-width="9" stroke-linecap="round"/><path d="M122 121 C127 126 112 129 110 134" fill="none" stroke="#5BA9E0" stroke-width="5.4" stroke-linecap="round"/><path d="M110 134 C106 146 134 148 130 160" fill="none" stroke="#9A7A52" stroke-width="18"/><path d="M110 134 C106 146 134 148 130 160" fill="none" stroke="#5BA9E0" stroke-width="12.5"/><path d="M110 134 C106 146 134 148 130 160" fill="none" stroke="#8FD0F2" stroke-width="4.5" opacity=".8"/><path d="M104 146 Q110 143 116 146" fill="none" stroke="#FFFFFE" stroke-width="1.8" stroke-linecap="round" opacity=".8"/><ellipse cx="92" cy="146" rx="6" ry="3.6" fill="#9AA6BC" stroke="#6A7A94" stroke-width="1.6"/><ellipse cx="152" cy="152" rx="7" ry="4" fill="#9AA6BC" stroke="#6A7A94" stroke-width="1.6"/><path d="M96 138 V129 M100 138 V127 M104 138 V130 M144 140 V129 M148 140 V127" stroke="#3E9B5A" stroke-width="2" stroke-linecap="round"/>';
  }

  /* ------------------------------------------------------------------ the scenes */
  var S7 = {
    // ---- Sand dunes
    desert: [["cactus", 56, G, 1.4], ["cactus", 100, G + 6, 0.8], ["kid", 172, G, 1.4, kb("hands", { hat: "#F2C14E", mouth: "o", look: -1 })], ["sweat", 152, 52, 0.8], ["sunbig", 124, 32, 0.85, { c: "#FF9F3D", ray: "#FFB347" }]],
    plains: [["horse", 50, G - 2, 0.85, {}], ["horse", 124, G - 12, 0.62, {}], ["horse", 196, G - 6, 0.75, {}] ],
    valley: [["kid", 44, G, 1.1, kb("point", { look: 1, mouth: "open" })], ["tree", 214, 112, 0.5]],
    east: [["compass", 56, G - 8, 1.4, { hl: "E" }], ["sunbig", 206, 60, 0.9, { c: "#FFC93C" }], ["kid", 118, G, 1.3, kb("walk", { look: 1, mouth: "open" })], ["kid", 156, G, 1.2, kg("walk", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 106, y1: 30, x2: 176, y2: 30, c: P }]],
    northern: [["fillbg", 0, 0, 1, { c: "#D4E7FA", gy: 130, g: "#F4F9FF" }], ["flake", 30, 30, 1.2], ["flake", 100, 22, 0.9], ["flake", 22, 100, 0.8], ["flake", 224, 20, 1.0], ["weathermap", 178, G - 10, 1.0, { hl: "north" }], ["kid", 66, G, 1.4, kb("pointUp", { look: 1, mouth: "o", hat: "#E5483A" })], ["shiver", 36, 92, 1.3], ["shiver", 96, 92, 1.3]],
    southern: [["fillbg", 0, 0, 1, { c: "#FFEBBE", gy: 130, g: "#F3D9A0" }], ["sunbig", 26, 30, 0.7, { c: "#FF9F3D", ray: "#FFB347" }], ["weathermap", 178, G - 10, 1.0, { hl: "south" }], ["kid", 66, G, 1.4, kb("pointDown", { look: 1, mouth: "open" })], ["sweat", 90, 74, 0.9], ["sweat", 38, 84, 0.8]],
    western: [["compass", 40, G - 8, 1.05, { hl: "W" }], ["sunbig", 164, 100, 1.4, { c: "#FF8A5A", ray: "#FFB347" }], ["mound", 164, G + 8, 1.0, { c: "#5A7A4A" }], ["kid", 104, G, 1.3, kb("look", { look: 1, mouth: "o" })]],
    view: [["mountain", 54, 116, 1.2, { w: 60, hh: 70 }], ["mountain", 164, 116, 1.2, { w: 74, hh: 92, c: "#7F94BC" }], ["pond", 156, G + 8, 1.0, { w: 50 }], ["tree", 214, G, 1.1], ["kid", 52, G, 1.3, kb("wide", { mouth: "open" })], ["flower", 124, G + 2, 1.2, { c: C.red }]],
    evening: [["house", 168, G - 8, 1.5, { lit: true }], ["kid", 50, G, 1.2, kb("walk", { look: 1, mouth: "open" })], ["kid", 86, G, 1.1, kg("walk", { look: 1 })], ["arrow", 0, 0, 1, { x1: 40, y1: 40, x2: 110, y2: 40, c: "#FFFFFE" }]],
    spring: [["flower", 38, G, 1.2, { c: C.red }], ["flower", 92, G + 2, 1.45, { c: "#FF6FA0" }], ["flower", 150, G, 1.3, { c: C.yellow }], ["flower", 204, G + 2, 1.15, { c: "#8B6BE8" }], ["bug", 118, 30, 1.2, { t: "butterfly" }], ["bird", 196, 56, 0.6, { fly: true }], ["sprout", 124, G + 6, 1.0, { k: 1 }]],
    flow: [["rivermouth", 0, 0, 1]],
    rise: [["kid", 100, G, 1.3, kb("reach", { look: 0, mouth: "open" })], ["balloon", 138, 58, 1.0, { len: 33 }], ["arrow", 0, 0, 1, { x1: 182, y1: 80, x2: 182, y2: 24, c: P }]],
    rose: [["sunbig", 120, 100, 1.5, { c: "#FFC93C" }], ["mound", 120, G + 10, 1.0, { c: "#6CCB5F" }], ["rewind", 206, 34, 0.8]],
    gas: [["car", 82, G, 1.3, { flip: true }], ["gaspump", 214, G, 1.0, { hx: -16, hy: -30 }], ["curve", 0, 0, 1, { x1: 200, y1: G - 30, cx: 186, cy: G + 14, x2: 146, y2: G - 42, c: "#3A3F4D", w: 3.6 }], ["kid", 172, G, 1.1, kb("reach", { look: -1, flip: true, mouth: "open" })], ["line", 0, 0, 1, { x1: 140, y1: G - 46, x2: 152, y2: G - 40, c: "#8A97AD", w: 6 }]],
    steel: [["bridgebanks", 0, 0, 1], ["steelbridge", 120, 98, 1.0], ["sparkle", 60, 44, 0.8], ["sparkle", 190, 40, 0.7]],
    cotton: [["cottonplant", 54, G, 1.5], ["cottonplant", 188, G + 2, 1.7], ["kid", 118, G, 1.5, kb("hold", { look: 1, mouth: "open", arms: "none" })], ["cottonbunch", 130, G - 44, 1.5], ["kid", 118, G, 1.5, kb("hold", { arms: "only" })], ["heart", 150, 44, 0.8], ["sparkle", 90, 52, 0.7]],
    crops: [["cropfield", 0, 0, 1], ["kid", 120, 132, 1.2, man({ hat: "#F2C14E", pose: "point", look: 1, mouth: "open" })]],
    fig: [["table", 186, G, 1.1], ["plate", 186, G - 28, 0.95], ["figfruit", 186, G - 31, 1.0, {}], ["kid", 78, G, 1.6, kb("drink", { look: 0, mouth: "open", arms: "none" })], ["figfruit", 78 + 9 * 1.6, G - 40 * 1.6, 0.8, { half: true, rot: -10 }], ["kid", 78, G, 1.6, kb("drink", { arms: "only" })], ["heart", 150, 50, 0.8]],
    hoe: [["soilpatch", 0, 0, 1], ["kid", 78, G, 1.4, man({ hat: "#F2C14E", pose: "hold", look: 1, mouth: "open", arms: "none" })], ["hoe", 134, G + 6, 0.8, { rot: -42 }], ["kid", 78, G, 1.4, man({ pose: "hold", arms: "only" })]],
    row: [["gardenrow", 0, 0, 1], ["kid", 34, 142, 1.15, kb("point", { look: 1, mouth: "open" })]],
    spot: [["dog", 120, G, 1.9, { c: "#FFFFFF", l: "#F2F2F6", ear: "#2B2B33", tongue: true }], ["dspots", 120, G, 1.9], ["arrow", 0, 0, 1, { x1: 200, y1: 60, x2: 140, y2: 100, c: P }]],
    area: [["fence", 124, G - 2, 1.0, { w: 200 }], ["woodsign", 50, G, 1.0, { t: "PLAY" }], ["sandcastle", 150, G + 8, 1.0], ["kid", 100, G + 10, 1.1, kb("jump", { mouth: "open" })], ["ball", 196, G + 12, 0.8, { c: C.red }]],
    site: [["crane", 60, G, 1.0], ["wall", 164, G, 1.3, { w: 60, hh: 34 }], ["kid", 120, G, 1.2, kb("point", { look: 1, mouth: "open", hat: "#FFC93C" })]],
    base: [["tree", 150, G, 1.5], ["basering", 0, 0, 1], ["kid", 92, G, 1.4, kb("crouch", { look: 1, mouth: "open" })]],
    surface: [["table", 140, G, 2.0], ["ball", 150, G - 52, 1.0, { c: C.red }], ["kid", 50, G, 1.4, kb("reach", { look: 1, mouth: "open" })], ["sparkle", 100, 66, 0.8]],
    section: [["sections", 156, G - 18, 1.0, {}], ["num", 106, 62, 1.0, { n: 1 }], ["arrow", 0, 0, 1, { x1: 106, y1: 76, x2: 106, y2: 94, c: P }], ["kid", 46, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    scale: [["kscale", 150, G, 1.7, {}], ["apple", 150, G - 59, 0.8], ["kid", 70, G, 1.4, kb("reach", { look: 1, mouth: "open" })]],
    angle: [["blackboard", 150, G - 14, 1.3, {}], ["line", 0, 0, 1, { x1: 120, y1: 100, x2: 190, y2: 100, c: "#FFFFFE", w: 3.4 }], ["line", 0, 0, 1, { x1: 120, y1: 100, x2: 166, y2: 58, c: "#FFFFFE", w: 3.4 }], ["curve", 0, 0, 1, { x1: 140, y1: 100, cx: 142, cy: 90, x2: 132, y2: 82, c: "#FFE066", w: 2.4 }], ["kid", 60, G, 1.4, kb("reach", { look: 1, mouth: "open" })]],
    // ---- Oasis town
    captain: [["boat", 112, 128, 1.55, { part: "hull" }], ["boat", 84, 128, 1.55, { part: "sail" }], ["kid", 140, 106, 1.3, man({ pose: "point", look: -1, mouth: "open" })], hatOn("captaincap", 140, 106, 1.3, 0.85)],
    workers: [["line", 0, 0, 1, { x1: 88, y1: G - 44, x2: 120, y2: 60, c: "#C98B4A", w: 4 }], ["line", 0, 0, 1, { x1: 152, y1: G - 44, x2: 120, y2: 60, c: "#C98B4A", w: 4 }], ["wall", 120, G, 1.0, { w: 70, hh: 44 }], ["brick", 94, 84, 1.0], ["brick", 146, 84, 1.0], ["kid", 58, G, 1.3, man({ pose: "reach", look: 1, mouth: "open" })], hatOn("hardhat", 58, G, 1.3, 0.72), ["kid", 182, G, 1.3, X({ shirt: "#E5883A", pants: "#4A4A5A", hair: "#3A2A22", pose: "reach", look: -1, mouth: "open", flip: true })], hatOn("hardhat", 182, G, 1.3, 0.72)],
    company: [["skyscraper", 186, G, 1.0, { w: 54, h: 112 }], ["star", 186, 42, 1.5, { r: 11 }], ["suitcase", 76, 120, 0.6], ["kid", 100, G, 1.5, man({ pose: "point", look: 1, mouth: "open" })], ["kid", 38, G, 1.2, kb("stand", { look: 1, mouth: "open" })]],
    factories: [["factory", 60, G, 1.0], ["factory", 174, G, 1.05]],
    students: [["blackboard", 120, 82, 1.1, { t: "ABC" }], ["kid", 48, G + 2, 1.1, kb("hands", { look: 0, mouth: "open" })], ["deskk", 48, G + 8, 1.15], ["kid", 120, G + 2, 1.1, kg("wave", { look: 0, mouth: "open" })], ["deskk", 120, G + 8, 1.15], ["kid", 192, G + 2, 1.1, ky("hands", { look: 0, mouth: "open" })], ["deskk", 192, G + 8, 1.15]],
    child: [["kid", 120, G, 1.45, kb("wave", { hat: C.red, mouth: "open", look: 0 })], ["sparkle", 62, 60, 0.9], ["sparkle", 184, 56, 0.8]],
    son: [["kid", 78, G, 1.5, man({ pose: "point", look: 1, mouth: "open" })], ["kid", 164, G, 1.05, kb("wave", { look: -1, mouth: "open" })], ["heart", 164, 48, 1.2]],
    born: [["balloons", 44, G, 1.0], ["mom", 130, G, 1.5, { pose: "cradleB", look: 0, mouth: "open", arms: "none" }], ["cradlebaby", 138, 91, 1.0, {}], ["mom", 130, G, 1.5, { pose: "cradleB", arms: "only" }], ["cradlebaby", 138, 91, 1.0, { head: true }], ["heart", 178, 52, 1.1]],
    job: [["mom", 112, G, 1.4, { pose: "hands", look: 0, mouth: "open" }], ["table", 112, G, 1.7], ["laptop", 150, G - 44, 0.9], ["star", 60, 48, 1.4, { r: 12 }], ["check", 192, 60, 1.0]],
    report: [["paper", 118, 86, 1.0, {}], ["txt", 117, 52, 1, { t: "A+", size: 13, c: "#E5483A" }], ["kid", 62, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["mom", 178, G, 1.3, { pose: "wave", look: -1, mouth: "open" }], ["heart", 178, 18, 0.9]],
    bill: [["coin", 111, 66, 0.9], ["receipt", 146, 68, 0.95, { t: "$12" }], ["kid", 56, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["mom", 190, G, 1.3, { pose: "wave", look: -1, mouth: "open", shirt: "#3FA06A", flip: true }], ["counter", 160, G, 1.3, { w: 100 }]],
    cost: [["table", 176, G, 1.6], ["robot", 200, G - 41, 0.9, {}], ["price", 150, G - 41, 0.85, { t: "?" }], ["kid", 60, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["qm", 62, 20, 1.0]],
    trade: [["hat", 98, 76, 0.75, { c: C.red }], ["hat", 142, 76, 0.75, { c: C.blue }], ["kid", 52, G, 1.3, kb("point", { look: 1, mouth: "open" })], ["kid", 188, G, 1.3, kg("point", { look: -1, mouth: "open", flip: true })], ["arrow", 0, 0, 1, { x1: 104, y1: 44, x2: 136, y2: 44, c: P }], ["arrow", 0, 0, 1, { x1: 136, y1: 56, x2: 104, y2: 56, c: P }]],
    deal: [["kid", 72, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["kid", 168, G, 1.4, kg("point", { look: -1, mouth: "open", flip: true })], ["check", 120, 32, 1.2], ["sparkle", 92, 24, 0.8], ["sparkle", 150, 20, 0.8]],
    pounds: [["kscale", 130, G, 1.7, { n: 10 }], ["cbox", 130, G - 61, 0.9, {}], ["kid", 52, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["txt", 202, 58, 1, { t: "10 lb", size: 20, c: P }]],
    march: [["flag", 72, 114, 1.0, {}], ["kid", 52, G, 1.2, kb("walk", { look: 1, mouth: "open" })], ["kid", 126, G, 1.2, kg("hold", { look: 1, mouth: "open", arms: "none" })], ["drum", 128, 118, 0.62], ["kid", 126, G, 1.2, kg("hold", { arms: "only" })], ["line", 0, 0, 1, { x1: 134, y1: 98, x2: 129, y2: 78, c: "#E8D5A8", w: 3.6 }], ["line", 0, 0, 1, { x1: 143, y1: 98, x2: 150, y2: 78, c: "#E8D5A8", w: 3.6 }], ["kid", 200, G, 1.2, ky("walk", { look: 1, mouth: "open" })]],
    practice: [["weekrow", 120, 56, 0.8, { marks: [0, 1, 2, 3, 4, 5, 6], icon: "soccer", s: 0.5 }], ["kid", 90, G, 1.1, kb("walk", { look: 1, mouth: "open" })], ["soccer", 128, G - 2, 0.9, {}]],
    speak: [["kid", 120, G, 1.2, kb("wave", { look: 0, mouth: "open" })], ["bubble", 150, 28, 1.0, { w: 56, h: 30 }], ["txt", 150, 34, 1, { t: "Hi!", size: 17, c: INK }], ["kid", 46, G, 1.2, kg("stand", { look: 1, mouth: "open" })], ["kid", 196, G, 1.2, ky("stand", { look: -1, mouth: "open" })]],
    act: [["stage", 0, 0, 1], ["cape", 82, G + 2, 1.4], ["kid", 82, G + 2, 1.4, kb("cheer", { look: 0, mouth: "open" })], hatOn("crown", 82, G + 2, 1.4, 0.62), ["kid", 160, G + 2, 1.4, kg("wave", { look: 0, mouth: "open" })], hatOn("crown", 160, G + 2, 1.4, 0.62)],
    lead: [["dog", 168, G, 1.3, { pose: "run", collar: true }], ["kid", 56, G, 1.3, kb("leash", { look: 1, mouth: "open" })], ["curve", 0, 0, 1, { x1: 100, y1: 76, cx: 142, cy: 100, x2: 188, y2: 86, c: "#3A3F4D", w: 2.6 }], ["arrow", 0, 0, 1, { x1: 150, y1: 30, x2: 206, y2: 30, c: P }]],
    serve: [["table", 50, G, 1.0], ["cake", 50, G - 26, 0.9, { flat: true }], ["kid", 104, G, 1.4, kg("point", { look: 1, mouth: "open" })], ["plate", 153, 78, 1.0], ["slice", 153, 76, 0.9, {}], ["kid", 202, G, 1.4, kb("reach", { look: -1, mouth: "open", flip: true })]],
    received: [["mailbox", 192, G, 1.3, {}], ["kid", 98, G, 1.4, kb("grip", { look: 0, mouth: "open", arms: "none" })], ["letter", 98, 100, 0.75, {}], ["kid", 98, G, 1.4, kb("grip", { arms: "only" })], ["heart", 150, 52, 1.0]],
    entered: [["doorway", 56, G, 1.5], ["kid", 118, G, 1.3, kg("walk", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 96, y1: 148, x2: 176, y2: 148, c: P }]],
    return: [["bookshelf", 44, G, 1.2, { w: 60 }], ["counter", 190, G, 1.2, { w: 80 }], ["mom", 198, G, 1.3, { pose: "wave", look: -1, mouth: "open" }], ["counter", 190, G, 1.2, { w: 80 }], ["kid", 88, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["bookflat", 139, 86, 0.65, {}], ["arrow", 0, 0, 1, { x1: 112, y1: 50, x2: 150, y2: 50, c: P }]],
    sent: [["thought", 44, 34, 1.0, { w: 56, h: 46 }], ["mom", 44, 56, 0.5, { pose: "stand", mouth: "open" }], ["kid", 112, G, 1.4, kb("cheer", { look: 1, mouth: "open" })], ["gift", 176, G, 1.3, {}], ["heart", 176, 62, 1.0]],
    continued: [["bench", 38, G, 1.0], ["prints", 24, G + 14, 1.0, { n: 6 }], ["kid", 120, G, 1.3, kb("walk", { look: 1, mouth: "open" })], ["kid", 168, G, 1.3, kg("walk", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 120, y1: 30, x2: 196, y2: 30, c: P }]],
    discovered: [["pond", 176, G + 8, 1.0, { w: 46 }], ["lily", 166, G, 1.2], ["frog", 168, G - 3, 0.6, {}], ["kid", 88, G, 1.3, kb("crouch", { look: 1, mouth: "o" })], ["exm", 176, 54, 1.0]],
    seen: [["kid", 84, G, 1.4, kb("stand", { look: 1, mouth: "open" })], ["thought", 152, 44, 1.0, { w: 76, h: 58 }], ["bear", 152, 62, 0.8, {}], ["check", 208, 30, 0.9]],
    // ---- Pyramid hall
    triangle: [["shape", 118, G, 1.5, { k: "tri", c: "#FFA94D" }], ["shape", 178, G, 0.95, { k: "sq", c: "#3D8BF2" }], ["shape", 212, G, 0.95, { k: "circ", c: "#E5483A" }], ["hl", 118, 98, 1.0, { r: 38 }], ["kid", 52, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    copy: [["drawing", 50, 116, 1.3, {}], ["drawing", 190, 116, 1.3, {}], ["pencil", 168, 80, 1.0], ["kid", 120, G, 1.3, kb("point", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 86, y1: 24, x2: 154, y2: 24, c: P }]],
    type: [["table", 150, G, 1.9], ["laptop", 138, G - 49, 1.5, {}], ["kid", 60, G, 1.4, kb("reach", { look: 1, mouth: "open" })]],
    printed: [["table", 152, G, 1.7], ["printer", 152, G - 44, 1.15, {}], ["kid", 58, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    record: [["table", 150, G, 1.7], ["recordplayer", 150, G - 44, 1.3, {}], ["note", 126, 36, 1.0], ["note", 162, 24, 0.9], ["note", 204, 34, 0.9], ["kid", 60, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    chart: [["barchart", 160, G, 1.15, {}], ["kid", 60, G, 1.4, kb("look", { look: 1, mouth: "open" })]],
    column: [["column", 164, G, 1.0, {}], ["kid", 82, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 214, y1: 118, x2: 214, y2: 34, c: P }]],
    case: [["table", 150, G, 1.9], ["pencilcase", 150, G - 49, 1.3, {}], ["kid", 48, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    seat: [["chair", 176, G, 1.7, { flip: true }], ["mom", 84, G, 1.4, { pose: "point", look: 1, mouth: "open" }], ["sparkle", 168, 90, 0.9]],
    science: [["table", 150, G, 1.7], ["flask", 130, G - 44, 1.0, { c: "#6CCB5F" }], ["flask", 176, G - 44, 0.8, { c: "#B26AF2" }], ["kid", 56, G, 1.4, kb("point", { look: 1, mouth: "open", shirt: "#F4F6FF" })], ["heart", 56, 28, 1.0]],
    art: [["table", 40, G, 0.8], ["palette", 40, G - 21, 1.0], ["brush", 157, 78, 1.0, { c: "#E5483A" }], ["easel", 184, G, 1.9, { drawn: true }], ["kid", 100, G, 1.3, kb("point", { look: 1, mouth: "open" })]],
    design: [["blueprint", 158, 112, 1.7, {}], ["pencil", 104, 79, 1.0], ["kid", 52, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    control: [["remote", 121, 90, 0.9, {}], ["kid", 66, G, 1.3, kb("point", { look: 1, mouth: "open" })], ["car", 192, G, 0.85, {}], ["arrow", 0, 0, 1, { x1: 146, y1: 56, x2: 182, y2: 90, c: P, dash: true }], ["whoosh", 142, G - 14, 0.8]],
    create: [["boxrobot", 160, G, 1.7, {}], ["kid", 66, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["sparkle", 206, 38, 0.9], ["sparkle", 112, 30, 0.8]],
    mine: [["kid", 120, G, 1.5, kb("cradle", { look: 0, mouth: "open", arms: "none" })], ["ball", 123, G - 20, 1.7, { c: C.red }], ["kid", 120, G, 1.5, kb("cradle", { arms: "only" })], ["heart", 178, 56, 1.1]],
    weight: [["bathscale", 120, G, 2.3, { n: "60" }], ["kid", 120, G - 32, 1.25, kb("stand", { look: 0, mouth: "open" })]],
    addition: [["blackboard", 152, 96, 1.4, { t: "2+3=5" }], ["kid", 50, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["heart", 50, 24, 1.0]],
    figure: [["easel", 164, G, 1.9, {}], ["stickfig", 164, 50, 1.3], ["pencil", 120, 80, 1.0], ["kid", 70, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    form: [["table", 150, G, 1.9], ["clipboard", 152, G - 49, 1.15, {}], ["pencil", 138, 84, 0.9], ["kid", 96, G, 1.4, kb("reach", { look: 1, mouth: "open" })]],
    explain: [["table", 120, G, 1.6], ["gameboard", 120, G - 42, 0.8, {}], ["bubble", 78, 26, 1.0, { w: 44, h: 26 }], ["dots", 78, 26, 1.0], ["kid", 44, G, 1.2, kb("point", { look: 1, mouth: "open" })], ["kid", 198, G, 1.2, kg("stand", { look: -1, mouth: "open" })]],
    describe: [["kid", 64, G, 1.3, kb("wave", { look: 1, mouth: "open" })], ["bubble", 126, 34, 1.0, { w: 62, h: 46 }], ["dog", 126, 50, 0.55, {}], ["kid", 182, G, 1.3, kg("stand", { look: -1, mouth: "open" })]],
    observe: [["kid", 64, G, 1.4, kb("look", { look: 1, mouth: "open" })], ["bird", 176, 62, 0.95, { fly: true }], ["arrow", 0, 0, 1, { x1: 96, y1: 70, x2: 148, y2: 62, c: P, dash: true }]],
    correct: [["sheet", 150, 120, 1.7, { t: "2+2=4" }], ["check", 200, 38, 1.2], ["kid", 56, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    example: [["blackboard", 152, 100, 1.3, {}], ["txt", 152, 40, 1, { t: "EXAMPLE", size: 15, c: "#FFFFFE" }], ["txt", 152, 74, 1, { t: "2+2=4", size: 20, c: "#FFFFFE" }], ["kid", 42, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    order: [["toyblock", 100, G, 0.8, { t: "1", c: "#E5483A" }], ["toyblock", 134, G, 0.8, { t: "2", c: "#3D8BF2" }], ["toyblock", 168, G, 0.8, { t: "3", c: "#FFC93C" }], ["toyblock", 202, G, 0.8, { t: "4", c: "#5DBB5A" }], ["arrow", 0, 0, 1, { x1: 96, y1: 64, x2: 206, y2: 64, c: P }], ["kid", 44, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    set: [["table", 150, G, 1.8], ["plate", 114, 89, 1.0], ["plate", 152, 89, 1.0], ["plate", 190, 89, 1.0], ["waterglass", 134, 88, 0.55], ["waterglass", 172, 88, 0.55], ["waterglass", 210, 88, 0.55], ["plate", 76, 92, 1.0], ["kid", 42, G, 1.4, kb("reach", { look: 1, mouth: "open" })]],
    means: [["trafficlight", 66, G, 1.45, { on: 0 }], ["stopsign", 176, G, 1.45, {}], ["stopword", 176, 70, 1, {}], ["txt", 121, 74, 1, { t: "=", size: 40, c: P }]],
    language: [["kid", 52, G, 1.3, kb("wave", { look: 1, mouth: "open" })], ["bubble", 82, 34, 1.0, { w: 56, h: 28 }], ["txt", 82, 40, 1, { t: "Hello", size: 13, c: INK }], ["kid", 188, G, 1.3, kg("wave", { look: -1, mouth: "open", flip: true })], ["bubble", 158, 34, 1.0, { w: 56, h: 28, flip: true }], ["txt", 158, 40, 1, { t: "Hello", size: 13, c: INK }], ["txt", 120, 82, 1, { t: "=", size: 36, c: P }]],
    // ---- Starry night
    fun: [["kid", 56, G, 1.3, kb("jump", { mouth: "open" })], ["kid", 122, G, 1.3, kg("cheer", { mouth: "open" })], ["kid", 188, G, 1.3, ky("jump", { mouth: "open" })], ["ball", 122, 38, 0.9, { c: "#FFC93C" }], ["sparkle", 98, 22, 0.9], ["sparkle", 148, 20, 0.9]],
    enjoy: [["kid", 100, G, 1.5, kb("cheer", { mouth: "open", look: 0 })], ["headphones", 100, G, 1.5], ["note", 160, 70, 1.2], ["note", 190, 46, 1.0], ["note", 212, 78, 1.0], ["heart", 52, 52, 1.0]],
    feeling: [["kid", 120, G, 1.5, kb("self", { mouth: "open", look: 0 })], ["heart", 120, 22, 1.2], ["sparkle", 62, 50, 0.9], ["sparkle", 182, 46, 0.9]],
    interesting: [["kid", 100, G, 1.4, kb("hold", { mouth: "o", look: 0, arms: "none" })], ["book", 104, G - 26, 0.95, {}], ["kid", 100, G, 1.4, kb("hold", { arms: "only" })], ["exm", 164, 48, 1.0], ["sparkle", 56, 40, 0.9], ["sparkle", 150, 26, 0.8]],
    alone: [["dog", 62, G, 1.5, {}], ["tears", 62, 88, 1.1], ["ball", 152, G, 0.6, { c: C.red }], ["dog", 176, G, 0.6, { c: "#E8B66E" }], ["dog", 200, G, 0.6, { c: "#FFFFFF", l: "#F2F2F6", ear: "#2B2F3D" }], ["dog", 222, G, 0.6, { c: "#8A5A2B" }]],
    melody: [["staff", 164, 108, 1.7, {}], ["note", 118, 34, 1.1], ["note", 154, 30, 1.0, {}], ["note", 196, 32, 1.0, {}], ["kid", 52, G, 1.4, kb("wave", { look: 1, mouth: "open" })], ["heart", 52, 24, 1.0]],
    rhythm: [["kid", 112, G, 1.3, kb("hold", { look: 0, mouth: "open", arms: "none" })], ["drum", 113, 118, 0.8], ["kid", 112, G, 1.3, kb("hold", { arms: "only" })], ["line", 0, 0, 1, { x1: 121, y1: 96, x2: 116, y2: 76, c: "#E8D5A8", w: 3.6 }], ["line", 0, 0, 1, { x1: 130, y1: 95, x2: 137, y2: 76, c: "#E8D5A8", w: 3.6 }], ["soundwave", 154, 104, 1.1], ["soundwave", 72, 104, 1.1, { flip: true }]],
    present: [["gift", 112, 92, 0.8, {}], ["kid", 62, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["kid", 188, G, 1.4, kg("reach", { look: -1, mouth: "open", flip: true })], ["heart", 150, 40, 1.0]],
    smell: [["flower", 146, G, 2.0, { c: "#FF6FA0" }], ["kid", 94, G, 1.4, kb("stand", { look: 1, mouth: "o" })], ["smell", 118, 76, 1.0], ["heart", 70, 28, 0.9]],
    energy: [["kid", 120, G, 1.3, kb("jump", { mouth: "open" })], ["bolt", 64, 70, 1.3], ["bolt", 180, 60, 1.1], ["bolt", 200, 104, 0.8], ["sparkle", 50, 112, 0.8], ["sparkle", 150, 24, 0.8]],
    million: [["starfield", 0, 0, 1], ["moon", 206, 30, 1.2], ["kid", 60, G, 1.3, kb("look", { look: 0, mouth: "open" })]],
    thousands: flock().concat([["kid", 120, G, 0.95, kb("look", { look: 0, mouth: "open" })]]),
    certain: [["table", 164, G, 1.5], ["apple", 164, G - 39, 1.4, {}], ["check", 164, 42, 1.2], ["kid", 70, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    decided: [["tree", 206, G, 0.9], ["woodsign", 160, G, 1.1, { t: "PARK" }], ["kid", 30, G, 1.3, kb("point", { look: 1, mouth: "open" })], ["kid", 84, G, 1.3, kg("point", { look: 1, mouth: "open" })], ["check", 160, 24, 1.0]],
    trouble: [["milkspill", 138, G + 4, 1.3], ["dog", 96, G, 1.4, {}], ["sweat", 80, 70, 0.8], ["mom", 196, G, 1.4, { pose: "point", look: -1, mouth: "sad", flip: true }], ["exm", 214, 26, 0.9]],
    guess: [["cbox", 156, G, 1.8, {}], ["qm", 156, 48, 1.5], ["kid", 70, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    choose: [["table", 150, G, 1.8], ["hat", 112, 89, 1.1, { c: C.red }], ["hat", 152, 89, 1.1, { c: C.blue }], ["hat", 192, 89, 1.1, { c: C.yellow }], ["check", 112, 38, 1.0], ["kid", 50, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    solve: [["kid", 100, G, 1.4, kb("wave", { look: 0, mouth: "open" })], ["puzzle", 134, 66, 0.8, { c: "#6A48E8" }], ["bulb", 60, 38, 1.0], ["check", 182, 60, 1.2]],
    oh: [["boxback", 150, G, 1.8], ["cat", 150, G - 24, 1.3, {}], ["boxfront", 150, G, 1.8], ["kid", 66, G, 1.4, kb("wide", { look: 1, mouth: "o" })], ["exm", 150, 24, 1.0]],
    fit: [["shoebig", 176, G, 0.9, {}], ["kid", 90, G, 1.4, kb("foothurt", { look: 1, mouth: "open", barefoot: true })], ["qm", 118, 30, 1.1]],
    match: [["goal", 192, G, 1.2], ["kid", 46, G, 1.3, kr("run", { look: 1, mouth: "open" })], ["ball", 88, G, 0.9, { c: "#FFFFFF" }], ["kid", 130, G, 1.3, kb("run", { look: -1, mouth: "open", flip: true })]],
    belong: [["crate", 184, G, 1.5, {}], ["kid", 84, G, 1.4, kb("cradle", { look: 1, mouth: "open", arms: "none" })], ["bear", 87, G - 20, 0.8, {}], ["kid", 84, G, 1.4, kb("cradle", { arms: "only" })], ["qm", 130, 40, 1.2]],
    amount: [["table", 150, G, 1.7], ["glasslevel", 126, G - 44, 1.5, { lv: 0.2 }], ["glasslevel", 176, G - 44, 1.5, { lv: 0.92 }], ["check", 126, 22, 0.9], ["kid", 56, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    raised: [["blackboard", 192, 84, 0.8, {}], ["kid", 90, G + 2, 1.4, kb("wave", { look: 0, mouth: "open" })], ["deskk", 90, G + 8, 1.3], ["arrow", 0, 0, 1, { x1: 138, y1: 78, x2: 138, y2: 30, c: P }]],
    appear: [["rainbow", 148, 128, 1.45], ["sparkle", 100, 44, 0.9], ["sparkle", 200, 54, 0.9], ["sparkle", 150, 26, 0.8], ["kid", 30, G, 1.3, kb("wave", { look: 1, mouth: "open" })]],
    moment: [["hourglass", 160, G, 1.8], ["kid", 78, G, 1.4, kb("wave", { look: 1, mouth: "open" })], ["sparkle", 196, 46, 0.8]],
    should: [["kid", 108, G, 1.4, kb("hands", { look: 1, mouth: "open" })], ["sink", 136, 102, 1.3, { h: 34 }], ["foam", 108, 94, 0.5], ["bubbles", 186, 92, 0.8]],
    matter: [["kid", 82, G, 1.4, kb("stand", { mouth: "sad", look: 0 })], ["tears", 82, G - 51 * 1.4, 1.4], ["kid", 164, G, 1.4, kg("reach", { look: -1, mouth: "open", flip: true })], ["qm", 164, 28, 1.1]],
    // ---- Camel caravan
    opposite: [["splitbg", 0, 0, 1], ["sunbig", 34, 30, 0.6, { c: "#FF8A3D" }], ["kid", 72, G, 1.1, kb("stand", { look: 0, mouth: "open", hat: C.yellow })], ["sweat", 88, 62, 0.8], ["flake", 168, 34, 2.0], ["flake", 206, 56, 1.6], ["kid", 180, G, 1.2, kg("stand", { look: 0, mouth: "sad" })], ["shiver", 160, 90, 1.0], ["arrow", 0, 0, 1, { x1: 98, y1: 16, x2: 142, y2: 16, c: P }], ["arrow", 0, 0, 1, { x1: 142, y1: 28, x2: 98, y2: 28, c: P }]],
    straight: [["persproad", 0, 0, 1], ["kid", 46, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 120, y1: 150, x2: 120, y2: 92, c: P }]],
    equal: [["halfdisc", 80, G - 36, 1.5, { c: "#FFA94D" }], ["halfdisc", 160, G - 36, 1.5, { c: "#FFA94D", flip: true }], ["txt", 120, G - 26, 1, { t: "=", size: 46, c: P }]],
    main: [["mapboard", 152, G, 1.3, {}], ["kid", 52, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    difference: [["drawing", 46, 112, 1.2, { c: "#E5483A" }], ["drawing", 194, 112, 1.2, { c: "#3D8BF2" }], ["hl", 44, 75, 1.0, { r: 13 }], ["hl", 192, 75, 1.0, { r: 13 }], ["kid", 120, G, 1.3, kb("point", { look: 1, mouth: "open" })]],
    lot: [["apple", 114, G, 0.8, { c: "#E5483A" }], ["apple", 134, G, 0.8, { c: "#E5483A" }], ["apple", 154, G, 0.8, { c: "#E5483A" }], ["apple", 174, G, 0.8, { c: "#E5483A" }], ["apple", 194, G, 0.8, { c: "#E5483A" }], ["apple", 124, G - 17, 0.8, { c: "#E5483A" }], ["apple", 144, G - 17, 0.8, { c: "#E5483A" }], ["apple", 164, G - 17, 0.8, { c: "#E5483A" }], ["apple", 184, G - 17, 0.8, { c: "#E5483A" }], ["apple", 134, G - 34, 0.8, { c: "#E5483A" }], ["apple", 154, G - 34, 0.8, { c: "#E5483A" }], ["apple", 174, G - 34, 0.8, { c: "#E5483A" }], ["apple", 144, G - 51, 0.8, { c: "#E5483A" }], ["apple", 164, G - 51, 0.8, { c: "#E5483A" }], ["apple", 154, G - 68, 0.8, { c: "#E5483A" }], ["kid", 56, G, 1.4, kb("cheer", { look: 1, mouth: "open" })]],
    bit: [["table", 172, G, 1.5], ["cake", 172, G - 39, 1.0, { flat: true }], ["plate", 118, 80, 1.0], ["slice", 124, 77, 0.6, {}], ["kid", 58, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    least: [["kid", 44, G, 1.1, kb("stand", { look: 0, mouth: "open" })], ["coinstack", 78, G, 1, { n: 7 }], ["kid", 112, G, 1.1, ky("stand", { look: 0, mouth: "open" })], ["coinstack", 146, G, 1, { n: 4 }], ["kid", 180, G, 1.1, kg("stand", { look: 0, mouth: "sad" })], ["coinstack", 212, G, 1, { n: 1 }], ["hl", 212, G - 6, 1.0, { r: 16 }]],
    except: [["kid", 36, G, 1.2, kb("wave", { look: 0, mouth: "open" })], ["kid", 80, G, 1.2, kg("wave", { look: 0, mouth: "open" })], ["kid", 124, G, 1.2, ky("wave", { look: 0, mouth: "open" })], ["check", 80, 30, 1.0], ["kid", 204, G, 1.2, kr("walk", { look: 1, mouth: "sad" })], ["cross", 204, 26, 1.0]],
    separate: [["table", 120, G, 1.7], ["basketof", 84, G - 44, 1.2, { c: "#E5483A" }], ["basketof", 156, G - 44, 1.2, { c: "#FF9F2E" }], ["line", 0, 0, 1, { x1: 120, y1: 28, x2: 120, y2: 84, c: P, w: 3, dash: "6 5" }], ["kid", 214, G, 1.4, kg("stand", { look: -1, mouth: "open" })]],
    compare: [["hat", 74, 74, 1.1, { c: C.red }], ["hat", 166, 74, 0.7, { c: C.blue }], ["kid", 120, G, 1.4, kb("wide", { look: 0, mouth: "open" })], ["qm", 120, 20, 1.0]],
    divided: [["table", 150, G, 1.7], ["cutcake", 150, G - 44, 1.3], ["kid", 56, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    mind: [["kid", 66, G, 1.4, kb("stand", { look: 1, mouth: "open" })], ["thought", 150, 48, 1.0, { w: 112, h: 72 }], ["hat", 124, 64, 0.7, { c: C.red }], ["cross", 124, 30, 0.8], ["arrow", 0, 0, 1, { x1: 138, y1: 50, x2: 160, y2: 50, c: P }], ["hat", 184, 64, 0.7, { c: C.blue }], ["check", 184, 30, 0.8]],
    yet: [["clock", 122, 56, 1.4], ["stove", 176, G, 1.4], ["cookpot", 176, G - 73, 1.1], ["kid", 52, G, 1.4, kb("wave", { look: 1, mouth: "open" })]],
    rule: [["rulesboard", 152, G, 1.3], ["kid", 52, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    lets: [["bubble", 112, 28, 1.0, { w: 44, h: 30 }], ["ball", 112, 38, 0.7, { c: C.red }], ["ball", 112, 82, 1.0, { c: C.red }], ["kid", 64, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["kid", 184, G, 1.4, kg("wave", { look: -1, mouth: "open", flip: true })]],
    youre: [["kid", 50, G, 1.4, kb("wave", { look: 1, mouth: "open" })], ["flower", 136, 80, 1.0, { c: "#FF6FA0", rot: -78 }], ["kid", 192, G, 1.4, kg("point", { look: -1, mouth: "open", flip: true })], ["heart", 192, 22, 1.2]],
    isnt: [["ball", 122, G, 2.2, { c: C.blue }], ["ball", 206, G, 1.4, { c: C.red }], ["cross", 206, 66, 1.0], ["kid", 52, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    doesnt: [["table", 168, G, 1.5], ["cake", 168, G - 39, 1.1, {}], ["cross", 168, 36, 1.2], ["kid", 78, G, 1.4, kb("wave", { look: 1, mouth: "sad" })]],
    wasnt: [["paintspill", 134, G + 2, 1.2], ["dog", 208, G, 1.1, {}], ["bluepaws", 208, G, 1.1], ["kid", 62, G, 1.4, kb("wide", { look: 1, mouth: "o" })]],
    wont: [["bus", 190, G, 0.8, {}], ["mom", 122, G, 1.4, { pose: "point", look: 1, mouth: "open" }], ["kid", 56, G, 1.4, kb("hold", { look: -1, mouth: "sad" })], ["cross", 56, 20, 0.9]],
    couldnt: [["hatrack", 190, G, 1.3, { hats: [C.red, null, C.blue] }], ["kid", 90, G, 1.4, kb("look", { look: 1, mouth: "open" })], ["qm", 90, 20, 1.0]],
    wouldnt: [["door", 130, G, 1.5], ["padlock", 150, 88, 1.0], ["kid", 206, G, 1.4, kb("reach", { look: -1, mouth: "o", flip: true })], ["sweat", 192, 56, 0.8]],
    themselves: [["kid", 72, G, 1.4, kb("lift", { look: 0, mouth: "open" })], ["hat", 72, 34, 0.8, { c: C.red }], ["kid", 168, G, 1.4, kg("lift", { look: 0, mouth: "open" })], ["hat", 168, 34, 0.8, { c: C.blue }], ["sparkle", 120, 50, 0.9]],
    carefully: [["logbridge", 0, 0, 1], ["kid", 120, 106, 1.2, kb("wide", { look: 1, mouth: "o" })], ["sweat", 142, 36, 0.8]],
    scientists: [["starfield", 0, 0, 1], ["telescope", 168, G, 1.5], ["kid", 60, G, 1.3, kb("wave", { look: 1, mouth: "open", shirt: "#F4F6FF" })], ["kid", 108, G, 1.3, kg("look", { look: 1, mouth: "open", shirt: "#F4F6FF" })]],
    cattle: [["cow", 66, G, 1.15, {}], ["cow", 172, G + 2, 1.05, {}], ["grass", 66 + 40 * 1.15, G + 6, 1.0, { w: 40 }], ["grass", 172 + 38 * 1.05, G + 8, 1.0, { w: 40 }]],
    cells: [["microscope", 64, G, 1.6], ["cellview", 168, 70, 1.5], ["arrow", 0, 0, 1, { x1: 96, y1: 60, x2: 112, y2: 60, c: P, dash: true }]],
    // @@SCENES_END
  };
  var BG7 = {
    desert: "desert", plains: "prairie", valley: "valley", east: "dawn", northern: "in", southern: "in", western: "dusk", evening: "dusk", steel: "sea", flow: "plain", rose: "dawn", cotton: "plain", crops: "plain", row: "plain",
    captain: "sea", workers: "plain", company: "plain", factories: "plain", students: "in", job: "in", report: "in", bill: "in", cost: "plain", pounds: "plain", march: "plain", serve: "plain", practice: "plain", act: "in", lead: "plain", received: "plain", entered: "in", return: "in", sent: "in", continued: "plain", seen: "plain",
    triangle: "plain", copy: "in", type: "in", printed: "in", record: "in", chart: "in", column: "plain", case: "in", seat: "in", science: "in", art: "in", design: "in", control: "plain", create: "in", mine: "plain", weight: "in", addition: "in", figure: "in", form: "in", explain: "in", describe: "plain", observe: "plain", correct: "in", example: "in", order: "in", set: "in", means: "plain", language: "plain",
    fun: "plain", enjoy: "in", feeling: "plain", interesting: "in", alone: "dusk", melody: "in", rhythm: "in", present: "plain", smell: "plain", energy: "plain", million: "night", thousands: "plain", certain: "in", decided: "plain", trouble: "in", guess: "in", choose: "in", solve: "in", oh: "in", fit: "in", match: "plain", belong: "in", amount: "in", raised: "in", appear: "plain", moment: "in", should: "in", matter: "plain",
    opposite: "plain", straight: "plain", equal: "in", main: "in", difference: "in", lot: "plain", bit: "in", least: "plain", except: "plain", separate: "in", compare: "in", divided: "in", mind: "in", yet: "in", rule: "in", lets: "plain", youre: "plain", isnt: "plain", doesnt: "in", wasnt: "in", wont: "plain", couldnt: "in", wouldnt: "in", themselves: "in", scientists: "night", cattle: "plain", cells: "in",
  };
  // @@BGS_END
  A.extend({
    kit: KITS,
    scenes: S7,
    bgk: BG7,
    bg: { desert: bgDesert, prairie: bgPrairie, valley: bgValley },
  });
})(typeof window !== "undefined" ? window : this);

