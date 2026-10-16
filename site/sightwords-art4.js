/* More little pictures for the stage-4 sight words (the space island): rockets and planets, places in the world, time and amounts,
   people, sounds and stories, and the words of doing and thinking. It adds new kinds of things and one scene per word to
   sightwords-art.js (SWArt.extend; it also uses the things of sightwords-art3.js), in the same soft look, all drawn in code.
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
  var h = A.h, C = h.C, f = h.f, ln = h.ln, path = h.path, dk = h.dk, INK = h.INK, star = h.star, X = h.X;
  var G = h.G, kb = h.kb, kg = h.kg, ky = h.ky, kr = h.kr;
  var FONT = "Fredoka,Nunito,sans-serif";

  /* ------------------------------------------------------------------ space and travel */
  function rocket(o) {
    var c = o.c || "#E5483A";
    return '<path d="M-14 -10 L-26 6 L-14 -2Z M14 -10 L26 6 L14 -2Z" ' + f(c, 2.2) + '/><path d="M0 -86 Q18 -64 14 -8 H-14 Q-18 -64 0 -86Z" ' + f("#F4F6FF", 2.6) + '/><path d="M0 -86 Q10 -76 12 -62 H-12 Q-10 -76 0 -86Z" ' + f(c, 2.2) + '/><circle cx="0" cy="-44" r="8" ' + f("#8FD0F2", 2.2) + '/><circle cx="-3" cy="-47" r="2.4" fill="#fff" opacity=".7"/><rect x="-11" y="-20" width="22" height="5" fill="' + c + '"/><path d="M-9 -8 Q0 20 9 -8Z" ' + f("#FFB020", 2) + '/><path d="M-4 -8 Q0 8 4 -8Z" fill="#FFF3B0"/>';
  }
  function planet(o) {
    var c = o.c || "#FF9F5A";
    return '<ellipse cx="0" cy="-24" rx="42" ry="9" transform="rotate(-16 0 -24)" fill="none" stroke="' + dk("#E6B5F5", 0.2) + '" stroke-width="9"/><ellipse cx="0" cy="-24" rx="42" ry="9" transform="rotate(-16 0 -24)" fill="none" stroke="#E6B5F5" stroke-width="5.4"/><circle cx="0" cy="-24" r="22" ' + f(c, 2.6) + '/><path d="M-20 -30 Q0 -22 20 -32 M-21 -18 Q0 -10 21 -20" fill="none" stroke="' + dk(c, 0.2) + '" stroke-width="2" opacity=".5"/><ellipse cx="-8" cy="-34" rx="6" ry="3.4" transform="rotate(-30 -8 -34)" fill="#fff" opacity=".45"/><path d="M-40 -14 Q-20 -2 12 -8" fill="none" stroke="#E6B5F5" stroke-width="5.4" stroke-linecap="round" opacity=".0"/>';
  }
  function plane(o) {
    var c = o.c || "#F4F6FF";
    return '<path d="M-44 -30 L-52 -50 L-40 -50 L-26 -32Z" ' + f("#E5483A", 2.2) + '/><path d="M-50 -22 Q-50 -34 -30 -34 H34 Q54 -34 56 -24 Q54 -14 34 -14 H-30 Q-50 -14 -50 -22Z" ' + f(c, 2.6) + '/><path d="M-6 -26 L-24 -2 H-8 L18 -26Z" ' + f("#C9D4E6", 2.2) + '/><path d="M-6 -22 L-22 -44 H-8 L12 -22Z" ' + f("#C9D4E6", 2.2) + '/><circle cx="40" cy="-24" r="3.6" fill="#8FD0F2" stroke="' + dk("#8FD0F2") + '" stroke-width="1.4"/><circle cx="26" cy="-24" r="3.2" fill="#8FD0F2" stroke="' + dk("#8FD0F2") + '" stroke-width="1.4"/><circle cx="12" cy="-24" r="3.2" fill="#8FD0F2" stroke="' + dk("#8FD0F2") + '" stroke-width="1.4"/><circle cx="-2" cy="-24" r="3.2" fill="#8FD0F2" stroke="' + dk("#8FD0F2") + '" stroke-width="1.4"/><path d="M-50 -20 H54" stroke="#E5483A" stroke-width="2.4" opacity=".8"/>';
  }
  function globe(o) {
    return '<path d="M-14 0 H14 L8 -8 H-8Z" ' + f("#8A5A2B", 2) + '/><path d="M0 -8 V-14" stroke="#8A5A2B" stroke-width="4"/><circle cx="0" cy="-40" r="28" ' + f("#4FA8F0", 2.6) + '/><path d="M-18 -50 Q-8 -60 2 -52 Q8 -46 0 -42 Q-6 -36 -14 -40 Q-22 -42 -18 -50Z M6 -30 Q16 -34 20 -26 Q22 -18 12 -18 Q4 -20 6 -30Z M-8 -26 Q-2 -28 0 -20 Q-4 -14 -10 -18Z" fill="#6CCB5F" stroke="#3E9B5A" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="-10" cy="-52" rx="6" ry="3.4" transform="rotate(-30 -10 -52)" fill="#fff" opacity=".45"/>';
  }
  function bigship(o) {
    var c = o.c || "#2F5DA8";
    return '<path d="M-56 -22 H56 L44 0 H-44Z" ' + f(c, 2.6) + '/><path d="M-54 -16 H54" stroke="#fff" stroke-width="2.4" opacity=".7"/><rect x="-36" y="-44" width="72" height="22" rx="3" ' + f("#FFFFFE", 2.4) + '/><rect x="-14" y="-62" width="28" height="18" rx="3" ' + f("#F4F6FF", 2.4) + '/><rect x="-6" y="-78" width="12" height="16" rx="2" ' + f("#E5483A", 2.2) + '/><rect x="-6" y="-72" width="12" height="4" fill="#FFD23F"/>' + (function () {
      var s = "", i;
      for (i = 0; i < 5; i++) s += '<circle cx="' + (-28 + i * 14) + '" cy="-34" r="3.4" fill="#8FD0F2" stroke="' + dk("#8FD0F2") + '" stroke-width="1.4"/>';
      return s;
    })();
  }
  function skyscraper(o) {
    var c = o.c || "#8B9BC4", w = o.w || 34, hh = o.h || 100, s = '<rect x="' + (-w / 2) + '" y="' + -hh + '" width="' + w + '" height="' + hh + '" rx="2" ' + f(c, 2.4) + "/>", r, k, rows = Math.floor(hh / 14), cols = Math.max(2, Math.floor(w / 11));
    for (r = 0; r < rows; r++) for (k = 0; k < cols; k++) s += '<rect x="' + (-w / 2 + 4 + k * ((w - 8) / cols)) + '" y="' + (-hh + 6 + r * 14) + '" width="' + ((w - 8) / cols - 3) + '" height="8" rx="1.4" fill="' + ((r + k) % 3 === 0 ? "#FFE98A" : "#CFE4F7") + '"/>';
    return s;
  }
  function waves(o) {
    var w = o.w || 120, s = '<rect x="' + (-w / 2) + '" y="-30" width="' + w + '" height="30" fill="#4FA8F0"/>', x, i = 0;
    for (x = -w / 2; x < w / 2; x += 24) {
      s += '<path d="M' + x + " " + (-30 + (i % 2) * 8) + " Q" + (x + 6) + " " + (-42 + (i % 2) * 8) + " " + (x + 12) + " " + (-30 + (i % 2) * 8) + " T" + (x + 24) + " " + (-30 + (i % 2) * 8) + '" fill="none" stroke="#FFFFFE" stroke-width="3.4" stroke-linecap="round"/>';
      i++;
    }
    return s;
  }
  function river(o) {
    return '<path d="M-60 0 Q-40 -26 -12 -14 Q14 -4 34 -22 Q50 -34 70 -30 L72 -18 Q54 -18 42 -4 Q22 14 -6 6 Q-30 -4 -48 14Z" ' + f("#7CC4F0", 2.4) + '/><path d="M-30 -10 Q-22 -14 -14 -8 M30 -14 Q40 -20 48 -16" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>';
  }
  function island(o) {
    return '<path d="M-50 0 Q-34 -18 0 -18 Q34 -18 50 0Z" ' + f("#F0DDA8", 2.2) + '/><path d="M6 -16 Q10 -46 2 -64" fill="none" stroke="#8A5A2B" stroke-width="5" stroke-linecap="round"/><path d="M2 -64 Q-18 -76 -30 -62 Q-14 -68 2 -62Z M2 -64 Q18 -78 34 -64 Q18 -68 2 -62Z M2 -64 Q-6 -82 -20 -80 Q-8 -76 2 -62Z M2 -64 Q10 -84 24 -80 Q12 -76 2 -62Z" ' + f("#4FB36B", 2) + '/><ellipse cx="-24" cy="-8" rx="9" ry="3.4" fill="#E8C98A"/>';
  }
  function torch(o) {
    return '<rect x="-6" y="-14" width="12" height="26" rx="3" ' + f("#8A97AD", 2) + '/><path d="M-6 -14 L-12 -26 H12 L6 -14Z" ' + f("#FFD23F", 2) + '/><path d="M-12 -26 L-34 -62 H34 L12 -26Z" fill="#FFF3B0" opacity=".55"/>';
  }
  function ruler(o) {
    var w = o.w || 70, s = '<rect x="' + (-w / 2) + '" y="-12" width="' + w + '" height="12" rx="2" ' + f("#FFD23F", 2) + "/>", x;
    for (x = -w / 2 + 6; x < w / 2 - 2; x += 8) s += '<path d="M' + x + " -12 V" + (((x + w / 2) / 8) % 2 < 1 ? -5 : -8) + '" stroke="' + INK + '" stroke-width="1.2"/>';
    return s;
  }
  function crown(o) {
    return '<path d="M-14 0 L-17 -18 L-8 -9 L0 -22 L8 -9 L17 -18 L14 0Z" ' + f("#FFD23F", 2.2) + '/><circle cx="-17" cy="-19" r="2.4" fill="#E5483A"/><circle cx="0" cy="-23" r="2.6" fill="#3D8BF2"/><circle cx="17" cy="-19" r="2.4" fill="#6CCB5F"/><rect x="-14" y="-4" width="28" height="5" fill="#E5483A" opacity=".85"/>';
  }
  function ear(o) {
    return '<path d="M-10 4 Q-24 -8 -20 -26 Q-14 -44 4 -44 Q22 -42 22 -24 Q22 -10 10 -6 Q4 -4 6 6 Q6 14 -4 14 Q-12 14 -10 4Z" ' + f("#FFD7B5", 2.4) + '/><path d="M-4 -34 Q10 -36 12 -24 Q12 -14 2 -14 Q-2 -22 4 -26" fill="none" stroke="#F2C79C" stroke-width="2.4" stroke-linecap="round"/>';
  }
  function soundwave(o) {
    var s = "", i;
    for (i = 0; i < 3; i++) s += '<path d="M' + (4 + i * 9) + " " + (-8 - i * 4) + " Q" + (12 + i * 9) + " 0 " + (4 + i * 9) + " " + (8 + i * 4) + '" fill="none" stroke="#6A48E8" stroke-width="3.2" stroke-linecap="round" opacity="' + (1 - i * 0.22) + '"/>';
    return s;
  }
  function palette(o) {
    return '<path d="M-26 -12 Q-30 -34 -4 -36 Q26 -38 30 -18 Q32 -6 18 -8 Q8 -10 8 -2 Q8 6 -8 4 Q-22 2 -26 -12Z" ' + f("#E8B66E", 2.4) + '/><circle cx="-14" cy="-22" r="5" fill="#E5483A" stroke="#fff" stroke-width="1"/><circle cx="-2" cy="-28" r="5" fill="#FFD23F" stroke="#fff" stroke-width="1"/><circle cx="12" cy="-26" r="5" fill="#3D8BF2" stroke="#fff" stroke-width="1"/><circle cx="20" cy="-16" r="5" fill="#6CCB5F" stroke="#fff" stroke-width="1"/><ellipse cx="-4" cy="-8" rx="4.4" ry="3" fill="#FFFFFE" stroke="' + dk("#E8B66E") + '" stroke-width="1"/>';
  }
  function tiles(o) {
    var L = o.t || "CAT", s = "", i;
    for (i = 0; i < L.length; i++) s += '<rect x="' + (-L.length * 12 + i * 24 + 1) + '" y="-24" width="22" height="24" rx="4" ' + f("#FFE9A8", 2.2) + '/><text x="' + (-L.length * 12 + i * 24 + 12) + '" y="-6" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="17" fill="#6A48E8">' + L.charAt(i) + "</text>";
    return s;
  }
  function hundreds(o) {
    var s = '<rect x="-52" y="-84" width="104" height="84" rx="8" ' + f("#FFFFFE", 2.2) + "/>", r, c, x, y;
    for (r = 0; r < 10; r++) for (c = 0; c < 10; c++) {
      x = -45 + c * 10;
      y = -75 + r * 8;
      s += '<ellipse cx="' + x + '" cy="' + (y + 1) + '" rx="3.6" ry="2.6" fill="#FFD93D"/><circle cx="' + (x + 2.4) + '" cy="' + (y - 1.6) + '" r="2.2" fill="#FFD93D"/><path d="M' + (x + 4.4) + " " + (y - 2) + " l2.6 .8 l-2.6 .8Z" + '" fill="#FF9F2E"/><circle cx="' + (x + 3) + '" cy="' + (y - 2.2) + '" r=".6" fill="' + INK + '"/>';
    }
    return s;
  }
  function bar(o) {
    var p = o.p == null ? 0.9 : o.p;
    return '<rect x="-46" y="-14" width="92" height="14" rx="7" ' + f("#E7EEF8", 2.2) + '/><rect x="-44" y="-12" width="' + Math.max(8, 88 * p) + '" height="10" rx="5" fill="#35B779"/>';
  }
  function clipboard(o) {
    var s = '<rect x="-24" y="-60" width="48" height="60" rx="5" ' + f("#C98B5A", 2.4) + '/><rect x="-19" y="-54" width="38" height="50" rx="3" fill="#FFFFFE"/><rect x="-9" y="-64" width="18" height="8" rx="3" ' + f("#8A97AD", 1.8) + "/>", i;
    for (i = 0; i < 3; i++) s += '<path d="M-14 ' + (-42 + i * 14) + " l3 3.4 l6 -6.6" + '" fill="none" stroke="#35B779" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M-3 ' + (-42 + i * 14) + ' H14" stroke="#9FB3D1" stroke-width="2.2" stroke-linecap="round"/>';
    return s;
  }
  function hoop(o) {
    return '<ellipse cx="0" cy="-40" rx="14" ry="36" fill="none" stroke="#E5483A" stroke-width="6"/><ellipse cx="0" cy="-40" rx="14" ry="36" fill="none" stroke="#FFC93C" stroke-width="2.4" stroke-dasharray="6 6"/><path d="M-10 0 H10" stroke="#8A97AD" stroke-width="5" stroke-linecap="round"/>';
  }
  function suitcase(o) {
    var c = o.c || "#E5483A";
    return '<path d="M-8 -26 V-32 H8 V-26" fill="none" stroke="' + dk(c) + '" stroke-width="3.4" stroke-linejoin="round"/><rect x="-18" y="-26" width="36" height="26" rx="4" ' + f(c, 2.4) + '/><path d="M-18 -13 H18" stroke="' + dk(c, 0.35) + '" stroke-width="2"/><rect x="-3" y="-16" width="6" height="6" rx="1.4" fill="#FFD23F"/>';
  }
  function blackboard(o) {
    return '<rect x="-52" y="-66" width="104" height="60" rx="4" ' + f("#2F6B4A", 2.8) + '/><rect x="-47" y="-61" width="94" height="50" rx="2" fill="#3F8A60"/><rect x="-52" y="-8" width="104" height="5" rx="2" fill="#8A5A2B"/>' + (o.t ? '<text x="0" y="-32" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="22" fill="#FFFFFE">' + o.t + "</text>" : "");
  }
  function thermo(o) {
    return '<rect x="-6" y="-60" width="12" height="46" rx="6" ' + f("#FFFFFE", 2.2) + '/><circle cx="0" cy="-10" r="10" ' + f("#E5483A", 2.2) + '/><rect x="-2.6" y="-52" width="5.2" height="42" rx="2.6" fill="#E5483A"/>';
  }
  // a barbell: the bar runs through the origin, a heavy plate pair at each end
  function barbell(o) {
    var s = '<rect x="-64" y="-2.4" width="128" height="4.8" rx="2.4" ' + f("#C9D4E6", 2) + "/>", k, x;
    for (k = -1; k <= 1; k += 2) {
      x = k * 56;
      s += '<rect x="' + (x - 7) + '" y="-17" width="14" height="34" rx="4" ' + f("#E5483A", 2.4) + '/><rect x="' + (x + k * 7 - 4) + '" y="-11" width="8" height="22" rx="3" ' + f("#4A5878", 2.2) + "/>";
    }
    return s;
  }
  function pot(o) {
    return '<path d="M-14 -22 H14 L10 0 H-10Z" ' + f("#C4533F", 2.2) + '/><rect x="-16" y="-27" width="32" height="7" rx="2" ' + f("#D96A52", 2) + '/><path d="M0 -27 Q-2 -44 0 -60" fill="none" stroke="#3E9B5A" stroke-width="3.4" stroke-linecap="round"/><path d="M0 -36 Q-16 -40 -18 -52 Q-4 -50 0 -38Z M0 -44 Q14 -48 18 -60 Q4 -58 0 -46Z" ' + f("#5DBB5A", 1.8) + '/>';
  }
  function snail(o) {
    return '<path d="M-24 0 Q-26 -8 -18 -8 H20 Q26 -8 24 0Z" ' + f("#E8C98A", 2) + '/><circle cx="-2" cy="-16" r="14" ' + f("#B98A55", 2.4) + '/><path d="M-2 -16 m-7 0 a7 7 0 1 1 7 7" fill="none" stroke="#7A5328" stroke-width="2" stroke-linecap="round"/><path d="M20 -8 L24 -22 M26 -8 L32 -20" stroke="#E8C98A" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="-23" r="2" fill="' + INK + '"/><circle cx="32" cy="-21" r="2" fill="' + INK + '"/>';
  }
  function puzzle(o) {
    var c = o.c || "#6A48E8";
    return '<path d="M-18 -4 V-36 H-6 Q-10 -44 0 -44 Q10 -44 6 -36 H18 V-24 Q26 -28 26 -18 Q26 -8 18 -12 V-4Z" ' + f(c, 2.4) + '/><path d="M-12 -30 Q-8 -38 -2 -38" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>';
  }
  function cookie(o) {
    var s = '<circle cx="0" cy="-22" r="22" ' + f("#E0A24E", 2.4) + "/>";
    s += '<circle cx="-8" cy="-28" r="3" fill="#6B4423"/><circle cx="6" cy="-18" r="3" fill="#6B4423"/><circle cx="-6" cy="-12" r="2.6" fill="#6B4423"/><circle cx="10" cy="-30" r="2.6" fill="#6B4423"/>';
    return o.half ? '<path d="M0 -44 A22 22 0 0 0 0 0Z" ' + f("#E0A24E", 2.4) + '/><circle cx="-8" cy="-28" r="3" fill="#6B4423"/><circle cx="-6" cy="-12" r="2.6" fill="#6B4423"/>' : s;
  }
  function mapk(o) {
    return '<rect x="-44" y="-52" width="88" height="52" rx="4" ' + f("#F4EBC9", 2.4) + '/><path d="M-44 -40 Q-20 -30 -4 -44 Q14 -56 30 -40 L44 -44" fill="none" stroke="#7CC4F0" stroke-width="5" stroke-linecap="round" opacity=".9"/><path d="M-34 -12 Q-14 -34 8 -20 T34 -34" fill="none" stroke="#E5483A" stroke-width="2.6" stroke-dasharray="1 6" stroke-linecap="round"/><path d="M30 -40 l8 8 M38 -40 l-8 8" stroke="#E5483A" stroke-width="3.4" stroke-linecap="round"/><circle cx="-34" cy="-12" r="3.4" fill="#3D8BF2"/>';
  }
  function podium(o) {
    return '<rect x="-60" y="-44" width="40" height="44" ' + f("#C9D4E6", 2.2) + '/><rect x="-20" y="-60" width="40" height="60" ' + f("#FFD23F", 2.2) + '/><rect x="20" y="-32" width="40" height="32" ' + f("#E8B66E", 2.2) + '/><text x="-40" y="-22" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="20" fill="#4A5878">2</text><text x="0" y="-34" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="22" fill="#B8860B">1</text><text x="40" y="-12" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="18" fill="#8A5A2B">3</text>';
  }
  // three weeks of a calendar with some days marked with a coloured dot (o.marks = the numbers); o.row = a whole row coloured
  function callist(o) {
    var marks = o.marks || [], s = '<rect x="-44" y="-62" width="88" height="62" rx="7" ' + f("#FFFFFE", 2.2) + '/><path d="M-44 -55 Q-44 -62 -37 -62 H37 Q44 -62 44 -55 V-47 H-44Z" ' + f("#3D8BF2", 2.2) + '/><circle cx="-22" cy="-62" r="2.6" fill="#8A97AD"/><circle cx="22" cy="-62" r="2.6" fill="#8A97AD"/>', r, c, n, x, y;
    for (r = 0; r < 3; r++) for (c = 0; c < 7; c++) {
      n = 1 + r * 7 + c;
      x = -33 + c * 11;
      y = -34 + r * 14;
      if (marks.indexOf(n) >= 0 || (o.row != null && r === o.row)) s += '<circle cx="' + x + '" cy="' + (y - 3) + '" r="5" fill="#FFB020" stroke="#C47F00" stroke-width="1.4"/>';
      else s += '<circle cx="' + x + '" cy="' + (y - 3) + '" r="2.4" fill="#C9D4E6"/>';
    }
    return s;
  }
  // a week: seven day boxes (M T W T F S S); the days in o.marks (0-6) show the little picture o.icon of what is done
  function weekrow(o) {
    var days = ["M", "T", "W", "T", "F", "S", "S"], marks = o.marks || [], icon = o.icon == null ? "dog" : o.icon, s = "", i, x, on;
    for (i = 0; i < 7; i++) {
      on = marks.indexOf(i) >= 0;
      x = -90 + i * 30;
      s += '<rect x="' + (x - 13) + '" y="-62" width="26" height="62" rx="6" ' + f(on ? "#FFF3C4" : "#FFFFFE", 2) + '/><path d="M' + (x - 13) + " -62 H" + (x + 13) + ' V-50 H' + (x - 13) + 'Z" fill="' + (on ? "#FFB020" : "#C9D4E6") + '"/><text x="' + x + '" y="-52.4" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="9.4" fill="#FFFFFE">' + days[i] + "</text>";
      if (on && icon) s += h.draw([icon, x, -9, o.s || 0.44, {}], "wk");
    }
    return s;
  }
  function flag(o) {
    var c = o.c || "#E5483A";
    return '<rect x="-2" y="-62" width="4" height="62" rx="2" ' + f("#8A97AD", 1.6) + '/><path d="M2 -62 L32 -52 L2 -42Z" ' + f(c, 2) + '/>';
  }
  function circ(o) {
    return '<circle cx="0" cy="0" r="' + (o.r || 18) + '" fill="none" stroke="' + (o.c || "#E5483A") + '" stroke-width="4.4"/>';
  }
  // a round cake seen from above with only the left half there (the right half is a dashed outline)
  function halfcake(o) {
    return '<circle cx="0" cy="-24" r="24" fill="none" stroke="#C9B6A0" stroke-width="2.4" stroke-dasharray="5 5"/><path d="M0 -48 A24 24 0 0 0 0 0Z" ' + f("#F7C99C", 2.4) + '/><path d="M0 -42 A18 18 0 0 0 0 -6Z" ' + f("#FF8FB1", 1.8) + '/><circle cx="-10" cy="-30" r="3" fill="#E5483A"/><circle cx="-8" cy="-16" r="2.6" fill="#E5483A"/><text x="16" y="-18" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="15" fill="#6A48E8">1/2</text>';
  }
  function mound(o) {
    return '<path d="M-130 0 Q-70 -40 0 -34 T130 0Z" ' + f(o.c || "#6E4F94", 2) + "/>";
  }
  function bgSea() {
    return '<rect width="240" height="160" fill="#D6EEFF"/><circle cx="206" cy="32" r="14" fill="#FFD65A"/><ellipse cx="52" cy="34" rx="20" ry="9" fill="#fff"/><circle cx="43" cy="29" r="9" fill="#fff"/><circle cx="58" cy="26" r="11" fill="#fff"/><rect y="100" width="240" height="60" fill="#4FA8F0"/><path d="M0 100 Q15 94 30 100 T60 100 T90 100 T120 100 T150 100 T180 100 T210 100 T240 100" fill="none" stroke="#FFFFFE" stroke-width="3" stroke-linecap="round"/><path d="M0 128 Q20 122 40 128 T80 128 T120 128 T160 128 T200 128 T240 128" fill="none" stroke="#8CC8F5" stroke-width="2.4" stroke-linecap="round"/>';
  }
  function bgSpace() {
    var s = '<rect width="240" height="160" fill="#1E1B4B"/><rect y="90" width="240" height="70" fill="#2B2670" opacity=".55"/>', P = [[20, 24, 1.6], [60, 56, 1.2], [104, 18, 1.8], [150, 44, 1.2], [210, 26, 1.8], [30, 100, 1.2], [120, 84, 1.4], [200, 96, 1.2], [88, 130, 1.4], [226, 140, 1.6], [166, 120, 1.2]], i;
    for (i = 0; i < P.length; i++) s += '<circle cx="' + P[i][0] + '" cy="' + P[i][1] + '" r="' + P[i][2] + '" fill="#fff" opacity=".85"/>';
    return s;
  }

  /* ------------------------------------------------------------------ the scenes (one for each word of stage 4) */
  function man(extra) {
    return X({ shirt: "#2E7D9A", pants: "#4A4A5A", hair: "#3A2A22" }, extra);
  }
  function rowOf(kind, n, x0, dx, y, s, opt) {
    var out = [], i;
    for (i = 0; i < n; i++) out.push([kind, x0 + i * dx, y, s, opt && opt.call ? opt(i) : opt || {}]);
    return out;
  }
  var CATW = { c: "#F8F4EC", l: "#FFFFFE" };
  var S4 = {
    // ---- Launch pad: places and ways to go
    ship: [["bigship", 120, 130, 1.25], ["waves", 120, 156, 1.0, { w: 240 }]],
    space: [["planet", 176, 134, 0.95], ["rocket", 70, 126, 0.95, { rot: 22 }], ["star", 30, 30, 0.6], ["star", 118, 22, 0.5], ["star", 214, 28, 0.5]],
    plane: [["cloud", 56, 40, 1.2], ["cloud", 196, 118, 1.1], ["plane", 118, 96, 1.2], ["whoosh", 38, 92, 1.1]],
    road: [["road", 0, 0, 1], ["car", 112, G + 8, 1.25], ["tree", 34, G - 12, 0.9], ["tree", 214, G - 12, 0.8]],
    map: [["mapk", 150, 112, 1.5], ["kid", 56, G, 1.5, kg("point", { look: 1, mouth: "open" })]],
    travel: [["pond", 168, G + 8, 1.5, { w: 76 }], ["boat", 176, G + 4, 1.3], ["kid", 50, G, 1.4, kb("walk", { look: 1 })], ["suitcase", 74, G, 1.0], ["kid", 104, G, 1.3, kg("walk", { look: 1 })], ["suitcase", 126, G, 0.8, { c: C.blue }]],
    step: [["prints", 20, G + 8, 1.2, { n: 3 }], ["kid", 128, G, 1.6, kb("walk", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 56, y1: 150, x2: 164, y2: 150, c: "#6A48E8" }]],
    move: [["cat", 86, G, 1.9], ["arrow", 0, 0, 1, { x1: 150, y1: 96, x2: 214, y2: 96, c: "#6B7285" }], ["nosign", 182, 96, 1.1]],
    turn: [["road", 0, 0, 1], ["house", 196, G - 26, 1.0, { c: "#E5604F", rc: "#7A4A2A" }], ["arrow", 0, 0, 1, { x1: 30, y1: 142, x2: 120, y2: 142, c: "#6A48E8" }], ["arrow", 0, 0, 1, { x1: 120, y1: 142, x2: 120, y2: 90, c: "#6A48E8" }], ["kid", 56, G - 20, 1.0, kb("walk", { look: 1 })]],
    follow: [["duck", 56, G, 1.35], ["duck", 120, G, 0.8], ["duck", 156, G, 0.7], ["duck", 188, G, 0.6], ["prints", 100, G + 8, 0.6, { n: 6 }], ["arrow", 0, 0, 1, { x1: 96, y1: 40, x2: 214, y2: 40, c: "#6A48E8" }]],
    across: [["road", 0, 0, 1], ["cat", 118, G + 6, 1.3, { pose: "run" }], ["arrow", 0, 0, 1, { x1: 30, y1: 100, x2: 210, y2: 100, c: "#6A48E8", dash: true }]],
    along: [["road", 0, 0, 1], ["kid", 70, G - 8, 1.1, kb("walk", { look: 1 })], ["kid", 120, G - 8, 1.1, kg("walk", { look: 1 })], ["arrow", 0, 0, 1, { x1: 30, y1: 30, x2: 210, y2: 30, c: "#6A48E8" }]],
    through: [["house", 150, G, 1.9, { open: true }], ["dog", 150, G, 0.9, { pose: "run" }], ["arrow", 0, 0, 1, { x1: 40, y1: 110, x2: 100, y2: 110, c: "#6A48E8" }], ["arrow", 0, 0, 1, { x1: 190, y1: 110, x2: 226, y2: 110, c: "#6A48E8" }]],
    toward: [["dog", 90, G, 1.5, { pose: "run" }], ["kid", 198, G, 1.5, kg("wave", { look: -1, mouth: "open", flip: true })], ["arrow", 0, 0, 1, { x1: 110, y1: 70, x2: 170, y2: 70, c: "#6A48E8" }]],
    behind: [["cat", 150, G, 1.9], ["cbox", 114, G, 2.4]],
    front: [["kid", 122, G - 4, 1.5, kb("stand", { look: 0 })], ["dog", 100, G + 6, 1.9]],
    inside: [["box", 120, G, 2.5, { inner: [["cat", 0, -6, 0.62, {}]] }], ["kid", 40, G, 1.1, kb("point", { look: 1 })]],
    near: [["tree", 150, G, 1.6], ["bird", 100, G, 1.1], ["kid", 46, G, 1.3, kg("point", { look: 1 })]],
    next: [["dog", 94, G, 1.6], ["cat", 150, G, 1.6, { flip: true }], ["heart", 122, 60, 0.9]],
    between: [["cat", 54, G, 1.5], ["cat", 190, G, 1.5, { flip: true }], ["ball", 122, G, 1.3, { c: C.red }], ["arrow", 0, 0, 1, { x1: 76, y1: 60, x2: 100, y2: 60 }], ["arrow", 0, 0, 1, { x1: 170, y1: 60, x2: 146, y2: 60 }]],
    above: [["tree", 120, G, 1.15], ["bird", 118, 46, 1.1, { fly: true }], ["arrow", 0, 0, 1, { x1: 176, y1: 100, x2: 176, y2: 42, c: "#6A48E8" }]],
    below: [["pond", 120, G + 10, 1.8, { w: 86 }], ["boat", 120, 92, 0.9], ["fish", 124, G + 6, 1.1], ["arrow", 0, 0, 1, { x1: 190, y1: 98, x2: 190, y2: 134, c: "#6A48E8" }]],
    high: [["kite", 150, 118, 1.5, { c: C.red }], ["kid", 56, G, 1.3, kb("hold", { look: 1 })], ["arrow", 0, 0, 1, { x1: 214, y1: 120, x2: 214, y2: 26, c: "#6A48E8" }]],
    low: [["sunbig", 120, 106, 1.0], ["mound", 120, 156, 1.0, { c: "#6E4F94" }], ["arrow", 0, 0, 1, { x1: 196, y1: 40, x2: 196, y2: 84, c: "#6A48E8" }]],
    left: [["cat", 54, G, 1.6], ["kid", 150, G, 1.5, kb("point", { look: -1, flip: true })], ["arrow", 0, 0, 1, { x1: 130, y1: 60, x2: 80, y2: 60, c: "#6A48E8" }]],
    side: [["kid", 96, G, 1.6, kb("stand", { look: 1, mouth: "open" })], ["dog", 150, G, 1.5, { flip: true }], ["heart", 126, 44, 0.9]],
    last: [["dog", 188, G, 1.2, { pose: "run" }], ["cat", 132, G, 1.2, { pose: "run" }], ["duck", 64, G, 0.95], ["sweat", 80, 70, 0.9], ["arrow", 0, 0, 1, { x1: 64, y1: 40, x2: 64, y2: 62, c: "#E5483A" }], ["whoosh", 30, G - 20, 0.8]],
    second: [["podium", 120, G, 1.25], ["dog", 120, G - 75, 0.9], ["cat", 82, G - 55, 0.8], ["duck", 160, G - 40, 0.65]],
    // ---- Moon walk: the world
    air: [["cloud", 54, 38, 1.2], ["kite", 160, 126, 1.2, { c: C.red }], ["bird", 100, 82, 1.1, { fly: true }], ["whoosh", 38, 98, 1.2], ["whoosh", 52, 118, 0.9]],
    land: [["rock", 150, G, 1.8], ["bird", 130, 96, 1.3, { fly: true, rot: 20 }], ["arrow", 0, 0, 1, { x1: 96, y1: 66, x2: 96, y2: 112, c: "#6A48E8" }]],
    earth: [["globe", 150, G, 1.7], ["kid", 56, G, 1.5, kb("point", { look: 1, mouth: "open" })], ["sparkle", 210, 30, 0.9]],
    sea: [["boat", 120, 106, 1.0], ["waves", 120, 156, 1.0, { w: 240 }]],
    ocean: [["fish", 118, 144, 1.6, { rot: -6 }], ["waves", 120, 112, 1.0, { w: 240 }], ["bubbles", 70, 150, 0.8]],
    island: [["island", 120, 120, 1.7], ["waves", 120, 158, 1.0, { w: 240 }]],
    river: [["tree", 40, 96, 0.85], ["tree", 196, 84, 0.72], ["river", 112, 152, 1.7], ["boat", 120, 138, 0.8]],
    field: [["grass", 120, G + 8, 3.4, { w: 100 }], ["kid", 70, G, 1.3, kb("jump", { mouth: "open" })], ["kid", 160, G, 1.3, kg("run", { mouth: "open" })], ["ball", 118, G, 1.0, { c: C.red }]],
    city: [["skyscraper", 30, G, 1.0, { w: 34, h: 80, c: "#8B9BC4" }], ["skyscraper", 70, G, 1.0, { w: 36, h: 118, c: "#7A8BB8" }], ["skyscraper", 112, G, 1.0, { w: 40, h: 92, c: "#8B9BC4" }], ["skyscraper", 156, G, 1.0, { w: 34, h: 108, c: "#6F7FAE" }], ["skyscraper", 198, G, 1.0, { w: 40, h: 76, c: "#8B9BC4" }]],
    town: [["road", 0, 0, 1], ["house", 48, G - 22, 1.0], ["house", 112, G - 22, 1.1, { c: "#CFE6F8", rc: "#6A8FD8" }], ["house", 178, G - 22, 1.0, { c: "#F8D6DE", rc: "#8B6BE8" }], ["tree", 214, G - 24, 0.7]],
    building: [["skyscraper", 150, G, 1.2, { w: 42, h: 100 }], ["kid", 60, G, 1.4, kb("look", { look: 1 })]],
    room: [["window", 62, G - 10, 1.3, { sun: true }], ["bed", 166, G, 1.7, { c: "#F59AB7" }], ["chair", 214, G, 0.9]],
    class: [["blackboard", 170, G - 18, 1.0, { t: "ABC" }], ["kid", 40, G, 1.2, kb("hold", { look: 0 })], ["kid", 92, G, 1.2, kg("hold", { look: 0 })], ["table", 44, G + 4, 0.6], ["table", 96, G + 4, 0.6]],
    rock: [["rock", 120, G, 2.5], ["frog", 126, G - 36, 1.2]],
    plant: [["pot", 130, G, 2.0], ["kid", 56, G, 1.4, kg("point", { look: 1 })], ["sparkle", 190, 52, 0.9]],
    animal: [["dog", 54, G, 1.2], ["cat", 100, G, 1.1], ["bird", 144, G, 1.2], ["fish", 196, G - 12, 1.0], ["heart", 120, 40, 0.9]],
    stars: [["moon", 190, 38, 1.4]].concat([["star", 40, 40, 1.0], ["star", 100, 64, 0.8], ["star", 130, 28, 1.1], ["star", 66, 100, 0.7], ["star", 168, 94, 0.9]]),
    waves: [["boat", 118, 112, 0.8, { rot: -8 }], ["waves", 120, 156, 1.0, { w: 240 }], ["waves", 120, 140, 1.0, { w: 240 }]],
    heat: [["sunbig", 196, 40, 0.9, { c: "#FFC93C", ray: "#FFB347" }], ["thermo", 150, G, 1.6], ["kid", 78, G, 1.5, kr("stand")], ["sweat", 100, 66, 1.0]],
    dark: [["moon", 196, 36, 1.3], ["kid", 70, G, 1.5, kb("hold", { look: 1 })], ["torch", 108, G - 42, 0.7, { rot: 68 }]],
    deep: [["tank", 120, G, 1.0, { w: 100, h: 124 }], ["fish", 122, G - 20, 0.7], ["arrow", 0, 0, 1, { x1: 190, y1: 40, x2: 190, y2: 126, c: "#6A48E8" }]],
    dry: [["sunbig", 196, 40, 0.8, { c: "#FFC93C", ray: "#FFB347" }], ["rock", 70, G, 1.8], ["check", 70, 60, 0.9], ["puddle", 168, G + 8, 1.3], ["cross", 168, 96, 0.8]],
    clear: [["glass", 120, G, 2.6], ["sparkle", 76, 60, 1.0], ["sparkle", 170, 48, 0.8], ["bubbles", 190, 120, 0.7]],
    heavy: [["cbox", 160, G, 2.3], ["kid", 78, G, 1.5, kb("reach", { look: 1 })], ["sweat", 100, 60, 1.0], ["arrow", 0, 0, 1, { x1: 130, y1: 120, x2: 130, y2: 134, c: "#6A48E8" }]],
    strong: [["kid", 100, G, 1.3, man({ pose: "lift", mouth: "open" })], ["barbell", 100, 35, 1.0], ["kid", 100, G, 1.3, man({ pose: "lift", arms: "only" })], ["sparkle", 176, 78, 0.9], ["sparkle", 30, 90, 0.7]],
    large: [["bigship", 150, 128, 1.05], ["boat", 46, 126, 0.45], ["waves", 120, 156, 1.0, { w: 240 }]],
    short: [["stick", 70, G - 30, 2.0, { rot: -16 }], ["stick", 150, G - 16, 1.0, { rot: -16 }], ["check", 160, 60, 0.9]],
    different: [["table", 120, G, 2.0], ["hat", 70, G - 52, 1.1, { c: C.red }], ["hat", 120, G - 52, 1.1, { c: C.blue }], ["hat", 170, G - 52, 1.1, { c: "#6CCB5F" }]],
    // ---- Comet trail: when and how much
    early: [["sunbig", 206, 112, 0.8, { c: "#FFC93C", ray: "#FFE099" }], ["clock", 160, G - 26, 1.5], ["kid", 80, G, 1.5, kb("cheer", { mouth: "open" })]],
    late: [["bus", 196, G, 0.9], ["whoosh", 150, G - 36, 1.0], ["kid", 70, G, 1.5, kb("run", { mouth: "open" })], ["clock", 60, 40, 1.1], ["sweat", 94, 62, 0.9]],
    during: [["sunbig", 196, 42, 0.8, { c: "#FFC93C", ray: "#FFE099" }], ["kid", 70, G, 1.4, kb("jump", { mouth: "open" })], ["kid", 130, G, 1.4, kg("jump", { mouth: "open" })], ["clock", 36, 46, 0.9]],
    until: [["kid", 90, G, 1.6, kb("run", { mouth: "open" })], ["sweat", 120, 56, 1.0], ["sunbig", 196, 42, 0.8, { c: "#FFC93C", ray: "#FFB347" }], ["flag", 206, G, 1.0]],
    while: [["kid", 100, G, 1.6, kg("walk", { look: 1, mouth: "open" })], ["note", 134, 52, 1.3], ["note", 154, 38, 1.1, { c: "#FF6FA0" }], ["note", 174, 62, 1.2, { c: "#3D8BF2" }]],
    often: [["weekrow", 120, 112, 1.1, { icon: "dog", marks: [0, 1, 3, 4, 5], s: 0.46 }]],
    sometimes: [["weekrow", 120, 112, 1.1, { icon: "cake", marks: [2, 5], s: 0.42 }]],
    usually: [["weekrow", 120, 112, 1.1, { icon: "house", marks: [0, 1, 2, 3, 4, 6], s: 0.4 }]],
    slowly: [["cat", 84, G, 1.8], ["snail", 178, G, 1.1], ["prints", 100, G + 8, 0.7, { n: 3 }]],
    quickly: [["dog", 128, G, 1.6, { pose: "run" }], ["whoosh", 56, G - 20, 1.3], ["whoosh", 64, G - 40, 1.0], ["clock", 200, 46, 1.0]],
    finally: [["house", 176, G, 1.7], ["kid", 66, G, 1.1, kb("cheer", { mouth: "open" })], ["kid", 108, G, 1.0, kg("cheer", { mouth: "open" })], ["heart", 134, 30, 1.0], ["sweat", 86, 62, 0.8]],
    almost: [["bar", 120, 64, 1.9, { p: 0.9 }], ["kid", 120, G, 1.4, kg("cheer", { mouth: "open" })]],
    few: [["tree", 150, G, 1.5], ["bird", 92, G, 1.1], ["bird", 126, G, 1.0, { flip: true }], ["bird", 62, G, 0.9]],
    enough: [["table", 150, G, 1.6], ["coin", 124, G - 48, 1.3], ["coin", 146, G - 50, 1.3], ["coin", 168, G - 48, 1.3], ["hat", 196, G - 52, 0.9, { c: C.red }], ["kid", 56, G, 1.4, kb("reach", { look: 1 })], ["check", 190, 44, 0.9]],
    half: [["halfcake", 150, G, 2.5], ["kid", 56, G, 1.5, kg("reach", { look: 1, mouth: "open" })], ["sparkle", 210, 40, 0.8]],
    hundred: [["hundreds", 100, 140, 1.5], ["txt", 204, 80, 1, { t: "100", size: 26, c: "#6A48E8" }]],
    less: [["coin", 54, G, 1.4], ["coin", 78, G, 1.4], ["txt", 112, 112, 1, { t: "<", size: 34, c: "#6A48E8" }], ["coin", 148, G, 1.4], ["coin", 172, G, 1.4], ["coin", 196, G, 1.4], ["coin", 160, G - 22, 1.4], ["coin", 184, G - 22, 1.4], ["coin", 172, G - 44, 1.4]],
    several: rowOf("bird", 6, 30, 34, 126, 0.95, function (i) { return { c: ["#4FA8F0", "#FF8FB1", "#FFC93C", "#6CCB5F", "#8B6BE8", "#FF9B3D"][i] }; }).concat([["sparkle", 120, 60, 0.9]]),
    whole: [["cake", 130, G - 4, 2.1], ["kid", 56, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["check", 200, 50, 0.9]],
    piece: [["cake", 160, G - 4, 1.8], ["kid", 56, G, 1.4, kg("reach", { look: 1, mouth: "open" })], ["slice", 106, G - 40, 1.7]],
    week: [["weekrow", 120, 70, 0.98, { icon: "", marks: [0, 1, 2, 3, 4, 5, 6] }], ["num", 208, 112, 1.0, { n: 7 }], ["kid", 64, G, 1.0, kg("hold", { look: 1, mouth: "open" })], ["book", 82, G - 24, 0.5]],
    size: [["kid", 100, G, 1.6, kb("stand", { hat: "#E5483A", mouth: "open" })], ["ruler", 176, G - 20, 1.3, { w: 70 }], ["check", 196, 50, 0.9]],
    shape: [["ball", 70, G, 2.2, { c: C.red }], ["circ", 170, 82, 1.0, { r: 32 }], ["check", 170, 40, 0.8]],
    group: [["duck", 70, G, 0.9], ["duck", 110, G, 0.8], ["duck", 148, G, 0.85], ["duck", 92, G - 28, 0.7], ["duck", 130, G - 26, 0.7], ["hl", 110, 92, 1.0, { r: 66 }]],
    circle: [["paper", 150, G, 2.0], ["circ", 150, 78, 0.75, { r: 18, c: "#3D5AFE" }], ["kid", 64, G, 1.5, kb("hold", { look: 1 })], ["pencil", 96, G - 42, 0.9, { rot: -20 }]],
    wait: [["kid", 70, G, 1.5, kb("wave", { look: 1 })], ["clock", 114, 56, 1.3], ["kid", 196, G, 1.4, kg("run", { look: -1, mouth: "open", flip: true })], ["whoosh", 222, G - 34, 0.8]],
    rest: [["bed", 120, G, 2.1, { c: "#9ADCF5", sleeper: true }], ["zzz", 170, 62, 0.9]],
    stay: [["dog", 130, G, 1.8], ["kid", 56, G, 1.5, kb("point", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 100, y1: 90, x2: 100, y2: 122, c: "#6A48E8" }]],
    // ---- Ringed planet: people, sounds and stories
    book: [["kid", 80, G, 1.6, kg("hold", { look: 0 })], ["book", 100, G - 30, 0.8], ["book", 190, G, 1.4]],
    story: [["mom", 66, G, 1.6, { pose: "hold", look: 1 }], ["book", 88, G - 38, 0.8], ["kid", 140, G, 1.25, kb("look", { look: -1 })], ["thought", 196, 46, 0.9, { w: 62, h: 46, inner: [["castle", 0, 22, 0.28, {}]] }]],
    page: [["book", 120, G, 2.4], ["arrow", 0, 0, 1, { x1: 150, y1: 66, x2: 96, y2: 66, c: "#6A48E8" }], ["kid", 40, G, 1.1, kg("point", { look: 1 })]],
    line: [["paper", 130, G, 2.2], ["line", 0, 0, 1, { x1: 106, y1: 86, x2: 168, y2: 62, c: "#3D5AFE", w: 4 }], ["kid", 56, G, 1.5, kb("hold", { look: 1 })], ["pencil", 84, G - 42, 0.9, { rot: -20 }]],
    music: [["staff", 120, 70, 2.0], ["note", 60, 112, 1.6], ["note", 176, 118, 1.5, { c: "#FF6FA0" }], ["kid", 210, G, 1.0, kg("hands", { mouth: "open" })]],
    sound: [["ear", 80, G - 10, 1.7], ["soundwave", 108, G - 70, 1.4], ["bell", 190, G, 1.3]],
    voice: [["kid", 70, G, 1.6, kg("hands", { mouth: "open" })], ["soundwave", 100, 60, 1.4], ["note", 160, 46, 1.2], ["note", 184, 70, 1.0, { c: "#FF6FA0" }]],
    listen: [["kid", 80, G, 1.6, kb("look", { look: 1 })], ["bird", 176, G - 56, 1.2], ["note", 150, 44, 1.2], ["note", 200, 54, 1.0, { c: "#FF6FA0" }]],
    hear: [["ear", 76, G - 10, 1.7], ["bird", 170, G, 1.4], ["soundwave", 112, G - 60, 1.2], ["note", 206, 56, 1.1]],
    family: [["kid", 60, G, 1.5, man({ pose: "stand" })], ["mom", 112, G, 1.5, { pose: "stand" }], ["kid", 154, G, 1.0, kb("wave", { mouth: "open" })], ["baby", 196, G, 0.85], ["heart", 120, 28, 1.1]],
    friends: [["kid", 90, G, 1.6, kb("hands", { mouth: "open" })], ["kid", 146, G, 1.6, kg("hands", { mouth: "open", look: -1, flip: true })], ["heart", 118, 34, 1.4], ["ball", 196, G, 1.0, { c: C.red }]],
    king: [["kid", 100, G, 1.6, kb("stand", { mouth: "open" })], ["crown", 100, G - 112, 1.0], ["castle", 196, G, 0.55], ["sparkle", 150, 40, 0.9]],
    person: [["kid", 110, G, 1.7, kg("stand", { mouth: "open" })], ["num", 176, 58, 1.5, { n: 1 }]],
    face: [["kid", 100, G, 1.6, kb("look", { mouth: "open" })], ["foam", 124, G - 100, 0.7], ["bubbles", 156, 100, 0.9], ["tub", 200, G, 0.7]],
    body: [["kid", 120, G, 1.7, kg("cheer", { mouth: "open" })], ["arrow", 0, 0, 1, { x1: 40, y1: 38, x2: 98, y2: 40, c: "#6A48E8" }], ["arrow", 0, 0, 1, { x1: 40, y1: 80, x2: 94, y2: 80, c: "#6A48E8" }], ["arrow", 0, 0, 1, { x1: 200, y1: 124, x2: 144, y2: 128, c: "#6A48E8" }]],
    color: [["palette", 150, G, 1.9], ["kid", 56, G, 1.5, kg("hold", { look: 1 })], ["pencil", 82, G - 42, 0.9, { rot: -20 }]],
    food: [["table", 120, G, 2.2], ["apple", 70, G - 56, 1.0], ["loaf", 108, G - 54, 0.9], ["milk", 148, G - 52, 0.9], ["egg", 190, G - 54, 0.9]],
    life: [["kid", 110, G, 1.6, kg("cheer", { mouth: "open" })], ["flower", 50, G, 1.0, { c: "#FF8FB1" }], ["dog", 188, G, 1.1, { flip: true }], ["heart", 110, 28, 1.1], ["sun", 206, 32, 0.8]],
    idea: [["bulb", 120, 60, 2.2], ["kid", 60, G, 1.5, kb("wave", { look: 1, mouth: "open" })]],
    problem: [["kid", 80, G, 1.6, kg("look", { look: 1 })], ["qm", 80, 24, 1.0], ["puzzle", 166, G, 1.7], ["qm", 200, 60, 0.9]],
    answer: [["blackboard", 150, G - 14, 1.1, { t: "4" }], ["check", 200, 34, 1.0], ["kid", 60, G, 1.5, kg("wave", { look: 1, mouth: "open" })]],
    learn: [["kid", 90, G, 1.6, kb("hold", { look: 0 })], ["book", 108, G - 30, 0.8], ["bulb", 170, 60, 1.4]],
    study: [["table", 150, G, 1.8], ["book", 140, G - 48, 0.9], ["laptop", 176, G - 46, 0.9], ["kid", 70, G, 1.5, kg("hold", { look: 1 })], ["pencil", 100, G - 40, 0.8, { rot: 18 }]],
    spell: [["tiles", 150, 96, 1.5, { t: "SAM" }], ["kid", 50, G, 1.5, kb("point", { look: 1, mouth: "open" })]],
    talk: [["kid", 62, G, 1.5, kb("hands", { mouth: "open" })], ["mom", 178, G, 1.5, { pose: "hands", mouth: "open", look: -1, flip: true }], ["bubble", 90, 40, 0.9, { w: 52, h: 32, inner: [["dots", 0, 0, 0.8, {}]] }], ["bubble", 150, 56, 0.9, { w: 52, h: 32, inner: [["heart", 0, 2, 0.8, {}]] }]],
    understand: [["kid", 70, G, 1.6, kg("wave", { look: 1, mouth: "open" })], ["bulb", 150, 56, 1.5], ["book", 190, G, 1.1], ["check", 214, 104, 0.9]],
    remember: [["kid", 76, G, 1.6, kb("look", { look: 1 })], ["thought", 168, 52, 1.0, { w: 80, h: 52, inner: [["tag", 0, 20, 0.6, { t: "Sam" }]] }]],
    notice: [["kid", 70, G, 1.6, kg("point", { look: 1, mouth: "o" })], ["bird", 168, G - 40, 1.3], ["mag", 118, G - 52, 1.3], ["sparkle", 206, 54, 0.9]],
    // ---- Alien base: doing and thinking
    add: [["txt", 120, 70, 1, { t: "2 + 2 = 4", size: 34, c: "#6A48E8" }], ["apple", 70, G, 1.1], ["apple", 100, G, 1.1], ["apple", 150, G, 1.1], ["apple", 180, G, 1.1]],
    begin: [["book", 150, G, 2.2], ["num", 150, 56, 1.4, { n: 1 }], ["kid", 60, G, 1.5, kb("hold", { look: 1 })], ["pencil", 88, G - 40, 0.9, { rot: -20 }]],
    began: [["raincloud", 120, 34, 2.0], ["puddle", 120, G + 8, 1.2], ["kid", 90, G, 1.4, kb("reach", { look: 0, mouth: "o" })]],
    change: [["hat", 56, G - 48, 1.2, { c: C.red }], ["arrow", 0, 0, 1, { x1: 84, y1: 80, x2: 130, y2: 80, c: "#6A48E8" }], ["hat", 168, G - 48, 1.2, { c: C.blue }], ["kid", 112, G, 1.3, kg("wave", { look: 0 })]],
    leave: [["school", 70, G, 0.95], ["kid", 170, G, 1.5, kb("walk", { look: 1 })], ["bag", 188, G - 24, 0.6, { c: C.red }], ["arrow", 0, 0, 1, { x1: 130, y1: 26, x2: 214, y2: 26, c: "#6A48E8" }]],
    need: [["kid", 64, G, 1.5, kg("look", { look: 1 })], ["table", 176, G, 1.4], ["hat", 176, G - 38, 0.9, { c: C.red }], ["qm", 112, 36, 0.9]],
    feel: [["kid", 120, G, 1.6, kb("self", { mouth: "open" })], ["heart", 70, 56, 1.1], ["heart", 176, 70, 0.9], ["sparkle", 196, 36, 0.8]],
    check: [["clipboard", 150, G, 1.8], ["kid", 60, G, 1.5, kb("point", { look: 1, mouth: "open" })]],
    measure: [["cbox", 140, G, 1.6], ["ruler", 140, G - 2, 1.8, { w: 70 }], ["kid", 56, G, 1.5, kg("reach", { look: 1 })]],
    complete: [["kid", 80, G, 1.6, kg("hold", { look: 0, mouth: "open" })], ["book", 100, G - 30, 0.85], ["check", 170, 66, 1.5], ["sparkle", 56, 50, 0.9], ["sparkle", 206, 40, 0.8]],
    become: [["seeds", 36, G, 1.6], ["arrow", 0, 0, 1, { x1: 62, y1: 112, x2: 104, y2: 112, c: "#6A48E8" }], ["tree", 170, G, 1.4]],
    seem: [["kid", 100, G, 1.6, kr("stand", { look: 0 })], ["sweat", 128, 66, 1.0], ["qm", 168, 52, 1.1]],
    plan: [["mapk", 150, 110, 1.4], ["kid", 52, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["kid", 100, G, 1.3, kg("point", { look: 1 })]],
    reached: [["hill", 120, G, 1.0, { dir: "up" }], ["kid", 204, G - 70, 1.0, kb("cheer", { mouth: "open" })], ["flag", 224, G - 70, 0.8]],
    pulled: [["whoosh", 28, G - 20, 1.0], ["wagon", 66, G, 1.4, { hx: 46, hy: -31 }], ["cbox", 66, G - 29, 0.7], ["kid", 170, G, 1.4, kb("pullL", { look: 1, rot: 8 })]],
    stand: [["door", 160, G, 1.7], ["kid", 100, G, 1.6, kb("stand", { look: 0, mouth: "open" })]],
    took: [["table", 160, G, 1.5], ["gift", 176, G - 36, 0.8], ["kid", 90, G, 1.5, kg("reach", { look: 1, mouth: "open" })], ["sparkle", 210, 60, 0.8]],
    thought: [["kid", 76, G, 1.6, kb("look", { look: 1 })], ["thought", 170, 52, 1.0, { w: 78, h: 52, inner: [["dog", 0, 22, 0.42, {}]] }]],
    knew: [["kid", 90, G, 1.6, kg("wave", { look: 0, mouth: "open" })], ["bulb", 160, 56, 1.4], ["check", 210, 60, 0.9]],
    told: [["mom", 66, G, 1.6, { pose: "hold", look: 1 }], ["kid", 170, G, 1.4, kb("look", { look: -1, flip: true })], ["bubble", 120, 42, 1.0, { w: 60, h: 38, inner: [["book", 0, 14, 0.5, {}]] }]],
    heard: [["kid", 82, G, 1.6, kg("look", { look: 1 })], ["bird", 176, G - 50, 1.2], ["soundwave", 134, 70, 1.1], ["note", 208, 54, 1.0]],
    hard: [["rock", 150, G, 2.2], ["kid", 78, G, 1.5, kb("reach", { look: 1, mouth: "o" })], ["pain", 128, G - 40, 0.8, { r: 12 }]],
    easy: [["board", 150, G - 4, 1.8], ["kid", 70, G, 1.6, kg("cheer", { mouth: "open" })], ["check", 214, 50, 1.0]],
    important: [["mom", 120, G, 1.6, { pose: "stand" }], ["kid", 60, G, 1.3, kb("wave", { look: 1, mouth: "open" })], ["star", 120, 30, 1.0, {}], ["heart", 182, 56, 1.1]],
    young: [["cat", 166, G, 1.3, { old: true, c: "#B9BFCC", l: "#EEF1F5" }], ["cat", 70, G, 0.9, { c: "#F5C98A", l: "#FFF0DA" }], ["circ", 76, 104, 1.0, { r: 40 }], ["heart", 72, 54, 0.8]],
    true: [["book", 120, G, 2.4], ["check", 120, 50, 1.6], ["kid", 40, G, 1.1, kb("point", { look: 1 })]],
    real: [["cat", 70, G, 1.6], ["easel", 172, G, 1.3, { drawn: true }], ["check", 70, 40, 0.9], ["cross", 172, 30, 0.8]],
    world: [["globe", 120, G, 1.8], ["kid", 40, G, 1.3, kb("wave", { look: 1, mouth: "open" })], ["kid", 204, G, 1.3, kg("wave", { look: -1, mouth: "open", flip: true })], ["heart", 120, 22, 0.9]],
  };
  var BG4 = { ship: "sea", sea: "sea", ocean: "sea", island: "sea", large: "sea", waves: "sea", below: "out", space: "space", stars: "space", low: "dusk", early: "dawn", dark: "night",
    map: "out", step: "in", move: "in", room: "in", class: "in", food: "in", color: "in", spell: "in", study: "in", book: "in", story: "in", page: "in", line: "in", music: "in", sound: "in", face: "in", important: "in", different: "in", enough: "in",
    half: "in", piece: "in", whole: "in", clear: "in", heavy: "in", clear2: "in", often: "in", sometimes: "in", usually: "in", week: "in", hundred: "in", add: "in", answer: "in", begin: "in", check: "in", measure: "in", complete: "in", need: "in", took: "in", told: "in", true: "in", real: "in", easy: "in",
    problem: "in", idea: "in", learn: "in", understand: "in", remember: "in", thought: "in", knew: "in", rest: "in", stay: "out", almost: "in", change: "in", size: "in", shape: "out", circle: "in", plan: "in", friends: "out", family: "out", life: "out", heat: "outns", during: "outns", until: "outns" };
  A.extend({
    kit: { rocket: rocket, planet: planet, plane: plane, globe: globe, bigship: bigship, skyscraper: skyscraper, waves: waves, river: river, island: island, torch: torch, ruler: ruler, crown: crown, ear: ear, soundwave: soundwave,
      palette: palette, tiles: tiles, hundreds: hundreds, bar: bar, clipboard: clipboard, hoop: hoop, suitcase: suitcase, blackboard: blackboard, thermo: thermo, barbell: barbell, pot: pot, snail: snail, puzzle: puzzle, cookie: cookie, halfcake: halfcake, mound: mound,
      mapk: mapk, podium: podium, callist: callist, weekrow: weekrow, flag: flag, circ: circ },
    scenes: S4,
    bgk: BG4,
    bg: { sea: bgSea, space: bgSpace },
  });
})(typeof window !== "undefined" ? window : this);
