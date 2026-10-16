/* More little pictures for the stage-5 sight words (the jungle island): places and ways to go, nature and things, the body and feelings,
   signs, shops and big little words, time. It adds new kinds of things and one scene per word to sightwords-art.js (SWArt.extend; it also
   uses the things of sightwords-art3.js and sightwords-art4.js), in the same soft look, all drawn in code.
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
  var h = A.h, C = h.C, f = h.f, ln = h.ln, path = h.path, dk = h.dk, INK = h.INK, X = h.X, render = h.render;
  var G = h.G, kb = h.kb, kg = h.kg, ky = h.ky, kr = h.kr;
  var FONT = "Fredoka,Nunito,sans-serif";
  var P = "#6A48E8";

  /* ------------------------------------------------------------------ new things */
  // a compass: o.hl = N, E, S or W turns the needle that way and colours the letter
  function compass(o) {
    var hl = o.hl || "N", ang = { N: 0, E: 90, S: 180, W: 270 }[hl] || 0, s = '<circle cx="0" cy="-30" r="29" ' + f("#FFF8E0", 2.6) + '/><circle cx="0" cy="-30" r="23" fill="none" stroke="#E0C98A" stroke-width="1.6"/>', L = [["N", 0, -49], ["E", 19, -26], ["S", 0, -7], ["W", -19, -26]], i;
    for (i = 0; i < 4; i++) s += '<text x="' + L[i][1] + '" y="' + L[i][2] + '" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="11" fill="' + (L[i][0] === hl ? "#E5483A" : "#8A7A5A") + '">' + L[i][0] + "</text>";
    s += '<g transform="rotate(' + ang + ' 0 -30)"><path d="M-4 -30 L4 -30 L0 -46Z" fill="#E5483A" stroke="#8E2A22" stroke-width="1.2" stroke-linejoin="round"/><path d="M-4 -30 L4 -30 L0 -16Z" fill="#9AA6BC" stroke="#5A6578" stroke-width="1.2" stroke-linejoin="round"/></g><circle cx="0" cy="-30" r="2.2" fill="' + INK + '"/>';
    return s;
  }
  // a block of ice
  function iceblock(o) {
    return '<path d="M-22 0 L-24 -30 Q-24 -40 -14 -40 H14 Q24 -40 24 -30 L22 0Z" fill="#CFEFFF" stroke="#7CB6DC" stroke-width="2.4" stroke-linejoin="round"/><path d="M-16 -8 L-17 -28 M-8 -34 H8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/><path d="M6 -6 L12 -20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="M26 0 L26 -12 Q26 -16 30 -16 H38 Q42 -16 42 -12 L42 0Z" fill="#DFF5FF" stroke="#7CB6DC" stroke-width="2"/>';
  }
  function mountain(o) {
    var c = o.c || "#8FA3C7", w = o.w || 56, hh = o.hh || 74;
    return '<path d="M' + -w + ' 0 L0 ' + -hh + " L" + w + ' 0Z" ' + f(c, 2.4) + '/><path d="M' + -w * 0.26 + " " + (-hh * 0.66) + " L0 " + -hh + " L" + w * 0.26 + " " + (-hh * 0.66) + " L" + w * 0.12 + " " + (-hh * 0.72) + " L0 " + (-hh * 0.62) + " L" + -w * 0.12 + " " + (-hh * 0.72) + 'Z" fill="#FFFFFE" stroke="' + dk("#FFFFFE", 0.2) + '" stroke-width="1.4" stroke-linejoin="round"/>';
  }
  // soil cut open: soil all round, grass on top; things can be put inside with o.inner (items drawn inside it)
  function soilcut(o) {
    var hh = o.hh || 44;
    return '<rect x="-50" y="' + -hh + '" width="100" height="' + hh + '" rx="6" ' + f("#B98A5A", 2.4) + '/><rect x="-52" y="' + (-hh - 4) + '" width="104" height="9" rx="4.5" ' + f("#8FD07A", 2.2) + '/><circle cx="-34" cy="' + (-hh + 12) + '" r="2.4" fill="#8A5A2B"/><circle cx="30" cy="' + (-hh + 18) + '" r="2" fill="#8A5A2B"/><circle cx="-8" cy="-6" r="2.6" fill="#C99A5E"/>' + render(o.inner || [], o.uid);
  }
  // a tree seen with its roots under the ground
  function rootsoil(o) {
    var s = '<rect x="-150" y="-46" width="300" height="46" ' + f("#B98A5A", 2.4) + '/><rect x="-150" y="-51" width="300" height="10" rx="4" ' + f("#8FD07A", 2.2) + "/>";
    s += '<path d="M0 -44 Q0 -30 -6 -22 Q-14 -14 -30 -10 M0 -36 Q4 -24 14 -18 Q26 -12 36 -14 M-6 -22 Q-4 -12 -8 -4 M14 -18 Q16 -8 10 -2" fill="none" stroke="#6B4A2B" stroke-width="4.2" stroke-linecap="round"/><path d="M0 -44 Q0 -30 -6 -22 Q-14 -14 -30 -10 M0 -36 Q4 -24 14 -18 Q26 -12 36 -14" fill="none" stroke="#9A6A3A" stroke-width="1.8" stroke-linecap="round"/>';
    s += '<rect x="-6" y="-92" width="12" height="46" ' + f("#9A6A3A", 2.2) + '/><circle cx="-18" cy="-98" r="16" ' + f("#4FB36B", 2.2) + '/><circle cx="18" cy="-98" r="16" ' + f("#4FB36B", 2.2) + '/><circle cx="0" cy="-112" r="18" ' + f("#5DBB5A", 2.2) + "/>";
    return s;
  }
  // the ground cut open across the whole picture: grass on top, soil below it (the bottom of the soil is the origin; o.inner = things inside the soil)
  function groundcut(o) {
    var hh = o.hh || 62;
    return '<rect x="-150" y="' + -hh + '" width="300" height="' + hh + '" ' + f("#B98A5A", 2.4) + '/><rect x="-150" y="' + (-hh - 5) + '" width="300" height="10" rx="4" ' + f("#8FD07A", 2.2) + '/><circle cx="-90" cy="' + (-hh + 16) + '" r="2.6" fill="#8A5A2B"/><circle cx="70" cy="' + (-hh + 22) + '" r="2.2" fill="#8A5A2B"/><circle cx="-30" cy="-8" r="2.8" fill="#C99A5E"/><circle cx="110" cy="-12" r="2.4" fill="#C99A5E"/><circle cx="-120" cy="-14" r="2.2" fill="#8A5A2B"/>' + render(o.inner || [], o.uid);
  }
  // a map of one big country: sea all round, a big green land with mountains, a river, forests, cities and a flag (about 190 x 92)
  function countrymap(o) {
    var s = '<rect x="-96" y="-96" width="192" height="96" rx="8" ' + f("#9ADCF5", 2.8) + '/><rect x="-92" y="-92" width="184" height="88" rx="6" fill="none" stroke="#FFFFFE" stroke-width="2" opacity=".7"/>';
    s += '<path d="M-78 -44 Q-72 -78 -30 -76 Q0 -90 40 -74 Q82 -66 78 -34 Q82 -8 40 -10 Q8 4 -28 -10 Q-70 -6 -78 -44Z" ' + f("#8FD07A", 2.6) + "/>";
    s += '<path d="M-60 -52 L-50 -68 L-40 -52Z M-44 -50 L-34 -64 L-24 -50Z" ' + f("#8FA3C7", 1.8) + '/><path d="M-50 -68 L-47 -63 L-53 -63Z M-34 -64 L-31 -60 L-37 -60Z" fill="#FFFFFE"/>';
    s += '<path d="M-36 -50 Q-20 -38 -30 -26 Q-40 -16 -22 -8" fill="none" stroke="#5BA9E0" stroke-width="3.6" stroke-linecap="round"/>';
    s += '<circle cx="20" cy="-30" r="7" fill="#4FB36B" stroke="#2F8A4C" stroke-width="1.6"/><circle cx="32" cy="-24" r="6" fill="#4FB36B" stroke="#2F8A4C" stroke-width="1.6"/><circle cx="48" cy="-42" r="7" fill="#4FB36B" stroke="#2F8A4C" stroke-width="1.6"/><circle cx="58" cy="-34" r="6" fill="#4FB36B" stroke="#2F8A4C" stroke-width="1.6"/>';
    s += '<circle cx="-8" cy="-52" r="3.4" fill="#E5483A" stroke="#8E2A22" stroke-width="1.2"/><circle cx="14" cy="-60" r="3.4" fill="#E5483A" stroke="#8E2A22" stroke-width="1.2"/><circle cx="-14" cy="-24" r="3.4" fill="#E5483A" stroke="#8E2A22" stroke-width="1.2"/>';
    s += '<rect x="30" y="-76" width="2.6" height="26" fill="#8A97AD"/><path d="M32.6 -76 L50 -70 L32.6 -64Z" ' + f("#E5483A", 1.8) + "/>";
    return s;
  }
  // a hole dug down into the cut-open ground (origin = the middle of the ground line, o.w wide, o.d deep): it cuts through the grass and the soil
  function holecut(o) {
    var w = (o.w || 62) / 2, d = o.d || 44;
    return '<path d="M' + -w + " -7 V" + (d - 12) + " Q" + -w + " " + d + " " + (-w + 12) + " " + d + " H" + (w - 12) + " Q" + w + " " + d + " " + w + " " + (d - 12) + " V-7Z" + '" ' + f("#6B4A2B", 2.6) + '/><path d="M' + (-w + 5) + " -4 V" + (d - 14) + " Q" + (-w + 5) + " " + (d - 5) + " " + (-w + 14) + " " + (d - 5) + " H" + (w - 14) + " Q" + (w - 5) + " " + (d - 5) + " " + (w - 5) + " " + (d - 14) + " V-4Z" + '" fill="#8A5E38"/>';
  }
  // a football (soccer ball): a white ball with black patches, the same size and origin as the plain ball (round, radius 12)
  function soccer(o) {
    var s = '<circle cx="0" cy="-12" r="12" ' + f("#FFFFFE", 2.2) + "/>", i, a, x, y, px, py, pts;
    pts = function (cx, cy, r, rot) {
      var q = "", k, t;
      for (k = 0; k < 5; k++) {
        t = ((rot + k * 72) * Math.PI) / 180;
        q += (k ? " " : "") + (cx + Math.cos(t) * r).toFixed(1) + "," + (cy + Math.sin(t) * r).toFixed(1);
      }
      return q;
    };
    s += '<polygon points="' + pts(0, -12, 4.6, -90) + '" fill="#2B2F3A" stroke="#2B2F3A" stroke-width="1" stroke-linejoin="round"/>';
    for (i = 0; i < 5; i++) {
      a = ((-90 + i * 72) * Math.PI) / 180;
      x = Math.cos(a);
      y = Math.sin(a);
      s += '<path d="M' + (x * 4.6).toFixed(1) + " " + (-12 + y * 4.6).toFixed(1) + " L" + (x * 8.2).toFixed(1) + " " + (-12 + y * 8.2).toFixed(1) + '" stroke="#2B2F3A" stroke-width="1.4" stroke-linecap="round"/>';
      px = Math.cos(a + (36 * Math.PI) / 180) * 9.6;
      py = -12 + Math.sin(a + (36 * Math.PI) / 180) * 9.6;
      s += '<polygon points="' + pts(px, py, 3.1, -54 + i * 72 + 18) + '" fill="#2B2F3A"/>';
    }
    return s + '<ellipse cx="-5.4" cy="-19" rx="3" ry="1.8" transform="rotate(-35 -5.4 -19)" fill="#fff" opacity=".7"/>';
  }
  // a child's hand (a round skin-coloured hand), to put on the side of something that is held
  function handc(o) {
    return '<circle cx="0" cy="0" r="6.2" ' + f(o.c || "#FFD7B5", 2.2) + '/><path d="M-2.4 -3 Q0 -4.6 2.4 -3" fill="none" stroke="#FFF0E2" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>';
  }
  function wall(o) {
    var w = o.w || 100, hh = o.hh || 40, s = '<rect x="' + -w / 2 + '" y="' + -hh + '" width="' + w + '" height="' + hh + '" ' + f("#D98B6A", 2.4) + "/>", y, x, r;
    for (y = -hh + 10, r = 0; y < 0; y += 10, r++) {
      s += '<path d="M' + -w / 2 + " " + y + " H" + w / 2 + '" stroke="#A8573A" stroke-width="1.6"/>';
      for (x = -w / 2 + (r % 2 ? 10 : 20); x < w / 2; x += 20) s += '<path d="M' + x + " " + (y - 10) + " V" + y + '" stroke="#A8573A" stroke-width="1.6"/>';
    }
    return s;
  }
  // a train: an engine and two carriages, facing right, about 190 units long
  function train(o) {
    var s = "", i, xs = [-64, -16, 40];
    for (i = 0; i < 2; i++) s += '<rect x="' + (-92 + i * 50) + '" y="-34" width="46" height="26" rx="4" ' + f(i ? "#3D8BF2" : "#FFC93C", 2.4) + '/><rect x="' + (-86 + i * 50) + '" y="-29" width="12" height="11" rx="2" fill="#BFE6FA" stroke="' + INK + '" stroke-width="1.2"/><rect x="' + (-70 + i * 50) + '" y="-29" width="12" height="11" rx="2" fill="#BFE6FA" stroke="' + INK + '" stroke-width="1.2"/>';
    s += '<path d="M-46 -20 H-42 M4 -20 H8" stroke="#5A6578" stroke-width="3.4"/><rect x="8" y="-30" width="46" height="22" rx="5" ' + f("#E5483A", 2.4) + '/><rect x="8" y="-46" width="24" height="18" rx="3" ' + f("#C93A2E", 2.2) + '/><rect x="14" y="-42" width="12" height="9" rx="2" fill="#BFE6FA" stroke="' + INK + '" stroke-width="1.2"/><rect x="40" y="-44" width="9" height="16" rx="2" ' + f("#4A4F5E", 2) + "/>";
    s += '<circle cx="40" cy="-52" r="6" fill="#fff" opacity=".9"/><circle cx="48" cy="-60" r="8" fill="#fff" opacity=".75"/><path d="M54 -8 L64 0 H54Z" ' + f("#8A97AD", 1.8) + "/>";
    for (i = 0; i < 3; i++) s += '<circle cx="' + xs[i] + '" cy="-6" r="6.4" ' + f("#3A3F4D", 1.8) + '/><circle cx="' + xs[i] + '" cy="-6" r="2.4" fill="#C8CEDB"/>';
    s += '<circle cx="30" cy="-6" r="7" ' + f("#3A3F4D", 1.8) + '/><circle cx="30" cy="-6" r="2.6" fill="#C8CEDB"/><circle cx="52" cy="-6" r="5.4" ' + f("#3A3F4D", 1.8) + "/>";
    return s + '<path d="M-100 0 H70" stroke="#8A6A4A" stroke-width="3"/>';
  }
  function wheel(o) {
    return '<circle cx="0" cy="-12" r="12" ' + f("#3A3F4D", 2.2) + '/><circle cx="0" cy="-12" r="5" fill="#C8CEDB" stroke="' + INK + '" stroke-width="1.2"/><path d="M0 -12 V-22 M0 -12 V-2 M-10 -12 H10" stroke="#8A97AD" stroke-width="1.6"/>';
  }
  // a hammer, handle on the left (hold it there), head on the right
  function hammer(o) {
    return '<rect x="-30" y="-3" width="46" height="6" rx="3" ' + f("#B27A43", 1.8) + '/><rect x="10" y="-10" width="13" height="20" rx="2.4" ' + f("#8A97AD", 2) + '/><rect x="12" y="-8" width="3" height="16" fill="#fff" opacity=".4"/>';
  }
  // a paint brush, handle on the left, a coloured tip on the right
  function brush(o) {
    var c = o.c || "#E5483A";
    return '<rect x="-30" y="-2.4" width="30" height="4.8" rx="2.4" ' + f("#C48A52", 1.6) + '/><rect x="-1" y="-3.4" width="9" height="6.8" fill="#C8CEDB" stroke="' + INK + '" stroke-width="1.2"/><path d="M8 -4 Q18 -6 20 0 Q18 6 8 4Z" ' + f(c, 1.6) + "/>";
  }
  function drum(o) {
    return '<path d="M-24 -26 V-4 Q-24 2 0 2 Q24 2 24 -4 V-26Z" ' + f("#E5483A", 2.4) + '/><ellipse cx="0" cy="-26" rx="24" ry="7" ' + f("#FFF3D6", 2.2) + '/><path d="M-24 -26 L-10 2 L0 -26 L10 2 L24 -26" fill="none" stroke="#FFC93C" stroke-width="2.4" stroke-linejoin="round"/>';
  }
  function store(o) {
    var s = '<rect x="-44" y="-46" width="88" height="46" ' + f("#FFE0A0", 2.4) + "/>", i;
    for (i = 0; i < 6; i++) s += '<rect x="' + (-46 + i * 15.4) + '" y="-60" width="15.4" height="18" ' + f(i % 2 ? "#FFFFFE" : "#E5483A", 1.8) + "/>";
    s += '<rect x="-34" y="-32" width="30" height="22" rx="2" fill="#BFE6FA" stroke="' + INK + '" stroke-width="1.8"/><rect x="10" y="-36" width="22" height="36" rx="2" ' + f("#8A5A2B", 2) + '/><circle cx="14" cy="-18" r="1.8" fill="#FFD23F"/>';
    s += '<rect x="-20" y="-72" width="40" height="13" rx="3" ' + f("#FFFFFE", 2) + '/><text x="0" y="-62" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="9.4" fill="#E5483A">SHOP</text>';
    return s;
  }
  // a long list on a paper that hangs down, with ticks
  function scroll(o) {
    var s = '<rect x="-16" y="-84" width="32" height="84" rx="3" ' + f("#FFFFFE", 2.2) + '/><ellipse cx="0" cy="-84" rx="18" ry="4.4" ' + f("#F4E1B6", 1.8) + "/>", i;
    for (i = 0; i < 6; i++) s += '<path d="M-10 ' + (-72 + i * 12) + " l3 3.4 l5 -6" + '" fill="none" stroke="#35B779" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M0 ' + (-72 + i * 12) + ' H11" stroke="#9FB3D1" stroke-width="2" stroke-linecap="round"/>';
    return s;
  }
  function cone(o) {
    return '<path d="M-10 -22 L0 0 L10 -22Z" ' + f("#E8B66E", 2) + '/><path d="M-8 -18 L6 -4 M0 -22 L0 -4 M8 -18 L-4 -4" stroke="#C48A52" stroke-width="1.2"/><circle cx="0" cy="-27" r="11" ' + f("#FF8FB1", 2) + '/><circle cx="0" cy="-40" r="9" ' + f("#FFFFFE", 2) + "/>";
  }
  function machine(o) {
    function gear(cx, cy, r) {
      var g = "", i;
      for (i = 0; i < 8; i++) g += '<rect x="' + (cx - 2.4) + '" y="' + (cy - r - 3) + '" width="4.8" height="6.4" rx="1" fill="#6A7A94" transform="rotate(' + i * 45 + " " + cx + " " + cy + ')"/>';
      return g + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" ' + f("#9AA6BC", 2) + '/><circle cx="' + cx + '" cy="' + cy + '" r="' + r * 0.38 + '" fill="#5A6578"/>';
    }
    return '<rect x="-36" y="-44" width="72" height="44" rx="4" ' + f("#7B8BA8", 2.4) + '/><rect x="-26" y="-66" width="52" height="24" rx="4" ' + f("#9AA6BC", 2.4) + '/><rect x="14" y="-92" width="12" height="28" ' + f("#5A6578", 2) + '/><circle cx="22" cy="-98" r="7" fill="#fff" opacity=".85"/><circle cx="30" cy="-108" r="9" fill="#fff" opacity=".7"/>' + gear(-14, -22, 12) + gear(14, -28, 8) +
      '<circle cx="-14" cy="-56" r="4" fill="#E5483A" stroke="' + INK + '" stroke-width="1.4"/><circle cx="-2" cy="-56" r="4" fill="#35B779" stroke="' + INK + '" stroke-width="1.4"/><path d="M36 -30 L52 -46" stroke="#8A5A2B" stroke-width="4" stroke-linecap="round"/><circle cx="53" cy="-47" r="4" fill="#E5483A"/>';
  }
  function clothesline(o) {
    var s = '<rect x="-60" y="-70" width="4" height="70" fill="#8A5A2B"/><rect x="56" y="-70" width="4" height="70" fill="#8A5A2B"/><path d="M-58 -66 Q0 -58 58 -66" fill="none" stroke="#8A97AD" stroke-width="2.4"/>';
    s += '<path d="M-44 -62 L-30 -62 L-26 -56 L-22 -62 L-8 -62 L-12 -44 L-18 -46 L-18 -30 L-34 -30 L-34 -46 L-40 -44Z" ' + f("#3D8BF2", 2) + '/>';
    s += '<path d="M2 -63 L24 -63 L26 -34 L16 -34 L13 -48 L10 -34 L0 -34Z" ' + f("#6A48E8", 2) + '/><path d="M36 -62 L46 -62 L46 -44 Q46 -36 40 -36 Q34 -36 34 -44Z" ' + f("#FFC93C", 2) + "/>";
    return s;
  }
  function bullseye(o) {
    return '<circle cx="0" cy="-34" r="34" ' + f("#E5483A", 2.4) + '/><circle cx="0" cy="-34" r="25" ' + f("#FFFFFE", 2) + '/><circle cx="0" cy="-34" r="16" ' + f("#E5483A", 2) + '/><circle cx="0" cy="-34" r="7" ' + f("#FFFFFE", 1.8) + "/>";
  }
  function irondoor(o) {
    var s = '<rect x="-24" y="-74" width="48" height="74" rx="3" ' + f("#6F7A8E", 2.6) + '/><rect x="-18" y="-68" width="36" height="62" rx="2" ' + f("#8794AB", 2.2) + "/>", i;
    for (i = 0; i < 3; i++) s += '<path d="M' + (-9 + i * 9) + ' -66 V-8" stroke="#5A6578" stroke-width="3"/>';
    for (i = 0; i < 4; i++) s += '<circle cx="' + (i % 2 ? 14 : -14) + '" cy="' + (-58 + (i >> 1) * 44) + '" r="2.2" fill="#C8D2E4" stroke="#4A5468" stroke-width="1"/>';
    return s + '<circle cx="14" cy="-34" r="3.4" fill="#FFD23F" stroke="#B8860B" stroke-width="1.4"/><path d="M-12 -62 L-8 -50" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>';
  }
  // a hat with a zig-zag and dots as its pattern
  function patternhat(o) {
    var c = o.c || "#3D8BF2";
    return h.K.hat({ c: c }) + '<path d="M-12.6 -12 l4.2 -6 l4.2 6 l4.2 -6 l4.2 6 l4.2 -6 l4.2 6" fill="none" stroke="#FFD23F" stroke-width="2.4" stroke-linejoin="round"/><circle cx="-6" cy="-23" r="1.8" fill="#FFD23F"/><circle cx="3" cy="-24" r="1.8" fill="#FFD23F"/><circle cx="9" cy="-21" r="1.6" fill="#FFD23F"/><path d="M-19 -5 l3 -2 l3 2 l3 -2 l3 2" fill="none" stroke="#FFD23F" stroke-width="1.8" stroke-linejoin="round" opacity="0"/>';
  }
  // a bell of metal (the gold bell, but silver-blue)
  function metalbell(o) {
    return h.K.bell(o).replace(/#FFD23F/g, "#B8C4D8").replace(/#E0A800/g, "#8A97AD").replace(/#B8860B/g, "#6A7A94");
  }
  // a pile of coins (o.n coins, in a pile)
  function coins(o) {
    var n = o.n || 6, s = "", i, row = 0, left = n, per, x0, k;
    while (left > 0) {
      per = Math.min(left, Math.max(1, 5 - row));
      if (row > 6) per = left;
      x0 = -(per - 1) * 8;
      for (k = 0; k < per; k++) s += '<circle cx="' + (x0 + k * 16) + '" cy="' + (-9 - row * 11) + '" r="9" ' + f("#FFD23F", 2.2) + '/><circle cx="' + (x0 + k * 16) + '" cy="' + (-9 - row * 11) + '" r="5.2" fill="none" stroke="' + dk("#FFD23F", 0.3) + '" stroke-width="1.4"/>';
      left -= per;
      row++;
    }
    return s;
  }
  // a gold bar (o.n bars stacked)
  function goldbars(o) {
    var s = "", n = o.n || 3, i;
    for (i = 0; i < n; i++) s += '<path d="M' + (-20 + (i % 2) * 8) + " " + (-i * 12) + " h40 l-6 -11 h-28z" + '" ' + f("#FFD23F", 2) + '/><path d="M' + (-14 + (i % 2) * 8) + " " + (-i * 12 - 3) + ' h26" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>';
    return s;
  }
  // a zebra crossing across a road that runs up the picture (grey band with white stripes)
  function vroad(o) {
    var s = '<rect x="-34" y="-50" width="68" height="50" ' + f("#7B8394", 2.2) + "/>", i;
    for (i = 0; i < 5; i++) s += '<rect x="' + (-30 + i * 13) + '" y="-44" width="8" height="38" rx="1.6" fill="#FFFFFE"/>';
    return s;
  }
  // a hill covered with snow (the slope goes up to the right)
  function snowhill(o) {
    return '<path d="M-120 0 L120 0 L120 -70Z" ' + f("#FFFFFE", 2.4) + '/><path d="M-120 -8 Q-60 -22 0 -16 Q60 -10 120 -34" fill="none" stroke="#CFE4F7" stroke-width="3" stroke-linecap="round"/><ellipse cx="-30" cy="-6" rx="14" ry="3" fill="#E4F1FC"/><ellipse cx="50" cy="-22" rx="12" ry="3" fill="#E4F1FC"/>';
  }
  // a pit in the ground: part "back" is the dark hole, part "front" is the lip of earth that hides the lower part of whatever sits in it
  function pithole(o) {
    if (o.part === "front") return '<path d="M-44 -2 Q-44 12 0 14 Q44 12 44 -2 Q44 -12 28 -10 Q0 -2 -28 -10 Q-44 -12 -44 -2Z" ' + f("#A8713A", 2.4) + '/><circle cx="-26" cy="4" r="2.2" fill="#8A5A2B"/><circle cx="20" cy="6" r="2" fill="#C99A5E"/>';
    return '<ellipse cx="0" cy="-4" rx="44" ry="13" ' + f("#4A3326", 2.4) + '/><ellipse cx="0" cy="-2" rx="34" ry="8" fill="#2B1E16"/>';
  }
  // a wide road with four lanes (grey band 80 high, dashed lane lines), the bottom of the road is the origin
  function wideroad(o) {
    return '<rect x="-130" y="-80" width="260" height="80" fill="#7B8394"/><path d="M-130 -80 H130" stroke="#FFFFFE" stroke-width="3"/><path d="M-130 -60 H130 M-130 -40 H130 M-130 -20 H130" fill="none" stroke="#FFFFFE" stroke-width="2.4" stroke-dasharray="14 10"/>';
  }
  function man(extra) {
    return X({ shirt: "#2E7D9A", pants: "#4A4A5A", hair: "#3A2A22" }, extra);
  }
  function rowOf(kind, n, x0, dx, y, s, opt) {
    var out = [], i;
    for (i = 0; i < n; i++) out.push([kind, x0 + i * dx, y, s, opt && opt.call ? opt(i) : opt || {}]);
    return out;
  }
  function bgJungle() {
    var s = '<rect width="240" height="160" fill="#CDEFC4"/><circle cx="200" cy="30" r="14" fill="#FFE98A"/>', T = [[20, 120, 60], [70, 124, 46], [150, 122, 52], [214, 126, 66]], i, t;
    for (i = 0; i < T.length; i++) {
      t = T[i];
      s += '<rect x="' + (t[0] - 3) + '" y="' + (t[1] - t[2] * 0.62) + '" width="6" height="' + t[2] * 0.66 + '" fill="#8A5A2B"/><circle cx="' + (t[0] - 10) + '" cy="' + (t[1] - t[2] * 0.66) + '" r="' + t[2] * 0.26 + '" fill="#4FB36B"/><circle cx="' + (t[0] + 10) + '" cy="' + (t[1] - t[2] * 0.6) + '" r="' + t[2] * 0.24 + '" fill="#4FB36B"/><circle cx="' + t[0] + '" cy="' + (t[1] - t[2] * 0.84) + '" r="' + t[2] * 0.28 + '" fill="#3E9B5A"/>';
    }
    return s + '<path d="M0 124 Q60 112 120 122 Q180 132 240 118 L240 160 L0 160Z" fill="#7FCF74"/><path d="M0 142 Q80 134 160 142 Q210 146 240 138 L240 160 L0 160Z" fill="#6CCB5F"/>';
  }

  /* ------------------------------------------------------------------ the scenes */
  var S5 = {
    // ---- Vine bridge
    edge: [["table", 112, G, 1.8], ["cat", 166, 87, 0.9, { pose: "sit" }], ["arrow", 0, 0, 1, { x1: 212, y1: 66, x2: 190, y2: 86, c: P }]],
    bottom: [["hill", 120, G, 1.0, { dir: "down" }], ["kid", 44, G - 56, 0.9, kb("look", { look: 1 })], ["ball", 204, G - 6, 1.0, { c: C.red }], ["arrow", 0, 0, 1, { x1: 182, y1: 60, x2: 204, y2: 96, c: P }]],
    middle: [["dog", 46, G, 1.2, {}], ["cat", 120, G, 1.3, {}], ["dog", 194, G, 1.2, { c: "#E8B66E" }], ["circ", 120, 100, 1.0, { r: 38 }]],
    outside: [["house", 50, G, 1.5, { open: true }], ["kid", 140, G, 1.25, kb("jump", { mouth: "open" })], ["kid", 196, G, 1.25, kg("reach", { look: -1, flip: true })], ["ball", 168, G, 0.9, { c: C.red }], ["arrow", 0, 0, 1, { x1: 78, y1: 112, x2: 108, y2: 112, c: P }]],
    beside: [["kid", 90, G, 1.5, kb("stand", { look: 1, mouth: "open" })], ["dog", 154, G, 1.4, { pose: "stand" }], ["heart", 122, 36, 1.1]],
    cross: [["vroad", 120, G + 24, 1.5], ["kid", 40, G, 1.2, kb("walk", { look: 1, mouth: "open" })], ["kid", 72, G, 1.2, kg("walk", { look: 1 })], ["arrow", 0, 0, 1, { x1: 52, y1: 54, x2: 196, y2: 54, c: P }], ["trafficlight", 206, G, 1.1]],
    rolled: [["hill", 120, G, 1.0, { dir: "down" }], ["ball", 118, G - 24, 1.3, { c: C.red, rot: 40 }], ["whoosh", 88, G - 60, 0.9], ["arrow", 0, 0, 1, { x1: 56, y1: 54, x2: 150, y2: 92, c: P, dash: true }]],
    pushed: [["whoosh", 188, G - 22, 0.9], ["box", 160, G, 1.8, {}], ["kid", 94, G, 1.4, kb("reach", { look: 1, mouth: "o" })], ["sweat", 74, 56, 0.8], ["arrow", 0, 0, 1, { x1: 130, y1: 44, x2: 190, y2: 44, c: P }]],
    jumped: [["pond", 170, G + 8, 1.5, { w: 52 }], ["frog", 100, 76, 1.4, { pose: "jump" }], ["arrow", 0, 0, 1, { x1: 56, y1: 118, x2: 138, y2: 108, c: P, dash: true }], ["splash", 176, G - 4, 0.9]],
    race: [["flag", 204, G, 0.9], ["whoosh", 20, G - 30, 0.9], ["kid", 52, G, 1.2, kb("run", { mouth: "open" })], ["kid", 104, G, 1.2, kg("run", { mouth: "open" })], ["kid", 154, G, 1.2, ky("run", { mouth: "open" })]],
    speed: [["whoosh", 56, G - 24, 1.4], ["whoosh", 50, G - 44, 1.0], ["car", 136, G, 1.5, {}], ["star", 52, 40, 0.7], ["arrow", 0, 0, 1, { x1: 110, y1: 36, x2: 196, y2: 36, c: P }]],
    drive: [["kid", 118, G - 22, 0.8, man({ pose: "hold", look: 1, mouth: "open" })], ["car", 124, G + 2, 1.8, { c: "#3D8BF2" }], ["heart", 176, 52, 0.9]],
    train: [["train", 144, G, 1.4], ["kid", 34, G + 2, 0.8, kb("point", { look: 1, mouth: "open" })]],
    sail: [["boat", 120, 114, 1.6, { part: "sail" }], ["kid", 100, 108, 0.8, kb("wave", { mouth: "open" })], ["kid", 140, 108, 0.8, kg("cheer", { mouth: "open" })], ["boat", 120, 114, 1.6, { part: "hull" }], ["waves", 120, 156, 1.0, { w: 240 }]],
    wide: [["wideroad", 120, 160, 1.0], ["car", 64, 99, 0.4, {}], ["bus", 150, 119, 0.36], ["car", 106, 139, 0.4, { c: "#3D8BF2" }], ["car", 182, 159, 0.4, { c: "#35B779" }], ["line", 0, 0, 1, { x1: 224, y1: 80, x2: 224, y2: 160, c: "#6A48E8", w: 3.4 }], ["line", 0, 0, 1, { x1: 216, y1: 80, x2: 232, y2: 80, c: "#6A48E8", w: 3.4 }], ["line", 0, 0, 1, { x1: 216, y1: 160, x2: 232, y2: 160, c: "#6A48E8", w: 3.4 }]],
    tall: [["tree", 150, G, 2.5], ["kid", 70, G, 1.0, kb("look", { look: 1 })], ["arrow", 0, 0, 1, { x1: 204, y1: 118, x2: 204, y2: 22, c: P }]],
    tiny: [["tree", 178, G + 2, 1.6], ["line", 0, 0, 1, { x1: 170, y1: 104, x2: 118, y2: 98, c: "#8A5A2B", w: 6 }], ["bird", 130, 98, 0.34, {}], ["circ", 130, 90, 1.0, { r: 12 }], ["kid", 44, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    length: [["table", 120, G, 1.9], ["stick", 120, 84, 1.6, {}], ["ruler", 124, 90, 1.0, {}], ["kid", 40, G, 1.3, kb("point", { look: 1, mouth: "open" })]],
    inches: [["table", 120, G, 1.9], ["stick", 124, 84, 1.3, {}], ["ruler", 124, 90, 1.0, {}], ["num", 200, 54, 1.3, { n: 10 }]],
    distance: [["road", 0, 0, 1], ["kid", 30, G - 6, 1.1, kb("look", { look: 1 })], ["house", 206, G - 34, 0.5], ["line", 0, 0, 1, { x1: 58, y1: 98, x2: 188, y2: 98, c: P, w: 3, dash: "2 6" }], ["line", 0, 0, 1, { x1: 58, y1: 90, x2: 58, y2: 106, c: P, w: 3 }], ["line", 0, 0, 1, { x1: 188, y1: 90, x2: 188, y2: 106, c: P, w: 3 }]],
    center: [["bullseye", 120, G + 4, 1.5], ["ball", 120, 100, 0.8, { c: C.blue }]],
    direction: [["signpost", 150, G, 1.6], ["kid", 78, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    mile: [["road", 0, 0, 1], ["kid", 46, G - 4, 1.0, kb("walk", { look: 1 })], ["kid", 82, G - 4, 1.0, kg("walk", { look: 1 })], ["rock", 180, G - 6, 1.9, {}], ["txt", 180, 98, 1.0, { t: "1 mile", size: 13, c: "#3A4660" }]],
    end: [["blackboard", 120, G - 14, 1.5, { t: "THE END" }], ["kid", 34, G, 1.2, kg("wave", { look: 1, mouth: "open" })]],
    north: [["compass", 170, G - 10, 1.5, { hl: "N" }], ["kid", 70, G, 1.4, kb("walk", { look: 0 })], ["arrow", 0, 0, 1, { x1: 70, y1: 52, x2: 70, y2: 14, c: P }]],
    south: [["compass", 170, G - 10, 1.5, { hl: "S" }], ["bird", 44, 52, 0.9, { fly: true, rot: 82 }], ["bird", 96, 76, 0.8, { fly: true, rot: 82 }], ["arrow", 0, 0, 1, { x1: 70, y1: 22, x2: 70, y2: 112, c: "#6A48E8" }]],
    west: [["compass", 170, G - 10, 1.5, { hl: "W" }], ["sun", 44, 96, 1.6, {}], ["arrow", 0, 0, 1, { x1: 130, y1: 40, x2: 78, y2: 40, c: P }]],
    wall: [["wall", 120, G, 1.8, { w: 100, hh: 40 }], ["cat", 120, G - 72, 1.0, { pose: "sit" }]],

    // ---- Waterfall cave
    lake: [["mountain", 60, 104, 1.0, { w: 50, hh: 60 }], ["mountain", 168, 104, 1.0, { c: "#9DBDE8", w: 60, hh: 70 }], ["pond", 120, G + 8, 1.6, { w: 80 }], ["boat", 130, G + 2, 1.0, {}], ["tree", 24, G - 2, 0.9], ["tree", 214, G - 2, 0.9]],
    stone: [["rock", 150, G, 3.0, {}], ["kid", 70, G, 1.3, kb("look", { look: 1 })], ["sparkle", 196, 70, 0.8]],
    soil: [["groundcut", 120, 160, 1.0], ["seeds", 124, 128, 0.9, {}], ["kid", 50, 100, 1.1, kb("point", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 92, y1: 90, x2: 112, y2: 116, c: P }]],
    ice: [["iceblock", 120, G, 2.4], ["shiver", 70, G - 56, 1.0], ["flake", 192, 50, 1.0], ["flake", 52, 36, 0.8]],
    sky: [["kid", 56, G, 1.4, kb("reach", { look: 1 })], ["line", 0, 0, 1, { x1: 96, y1: 86, x2: 164, y2: 64, c: "#8A6A3A", w: 1.8 }], ["kite", 170, 52, 1.0, { rot: 20 }], ["cloud", 60, 36, 1.3], ["cloud", 206, 100, 1.0], ["bird", 120, 40, 0.7, { fly: true }]],
    moon: [["moon", 150, 66, 2.4], ["kid", 60, G, 1.5, kb("look", { look: 1 })], ["star", 40, 30, 0.7], ["star", 206, 120, 0.5]],
    forest: [["tree", 24, G - 4, 1.2], ["tree", 84, G - 8, 1.5], ["tree", 160, G - 6, 1.4], ["tree", 218, G - 4, 1.3], ["kid", 118, G + 4, 1.0, kb("walk", { look: 1 })], ["kid", 140, G + 4, 1.0, kg("walk", { look: 1 })], ["prints", 40, G + 8, 0.8, { n: 3 }]],
    mountains: [["mountain", 50, 120, 1.0, { w: 54, hh: 72 }], ["mountain", 124, 120, 1.0, { c: "#7F94BC", w: 68, hh: 94 }], ["mountain", 196, 120, 1.0, { w: 50, hh: 64 }], ["kid", 40, G, 1.2, kb("look", { look: 1 })]],
    flowers: [["flower", 70, G, 1.7, { c: C.red }], ["flower", 112, G + 2, 2.0, { c: C.red }], ["flower", 156, G, 1.7, { c: C.red }], ["flower", 196, G + 2, 1.5, { c: C.red }], ["kid", 26, G, 1.1, kg("look", { look: 1 })]],
    root: [["rootsoil", 120, 160, 0.9], ["arrow", 0, 0, 1, { x1: 30, y1: 120, x2: 72, y2: 144, c: P }]],
    summer: [["sunbig", 196, 44, 1.0, { c: "#FFC93C", ray: "#FFB347" }], ["kid", 90, G, 1.5, kr("stand", { mouth: "open" })], ["sweat", 112, 66, 0.9], ["cone", 140, G, 1.1]],
    winter: [["snowman", 176, G, 1.5], ["kid", 90, G, 1.5, kb("hands", { mouth: "o", hat: "#E5483A" })], ["shiver", 66, G - 56, 1.0]],
    weather: [["sunbig", 60, 54, 0.8, { c: "#FFC93C", ray: "#FFB347" }], ["cloud", 144, 52, 1.4], ["kid", 100, G, 1.5, kg("cheer", { mouth: "open" })], ["check", 196, 44, 1.0]],
    wild: [["cat", 126, G, 2.3, {}], ["leaf", 40, 120, 2.0, { c: "#4FB36B" }], ["leaf", 214, 116, 1.8, { c: "#3E9B5A" }]],
    bright: [["sunbig", 130, 56, 1.5, { c: "#FFE066", ray: "#FFC93C" }], ["kid", 60, G, 1.4, kb("look", { look: 1, mouth: "o" })], ["sparkle", 190, 100, 0.9], ["sparkle", 40, 40, 0.8]],
    gold: [["goldbars", 176, G, 1.5, { n: 3 }], ["coins", 78, G, 0.9, { n: 6 }], ["kid", 126, G, 1.3, kg("reach", { look: 1, mouth: "open" })], ["jewel", 156, 82, 0.7]],
    iron: [["irondoor", 120, G, 1.7], ["sparkle", 176, 50, 0.9], ["kid", 50, G, 1.3, kb("point", { look: 1 })]],
    metal: [["metalbell", 120, G, 1.5], ["sparkle", 76, 58, 0.9], ["sparkle", 170, 70, 0.8]],
    square: [["blackboard", 172, G - 14, 1.2, {}], ["line", 0, 0, 1, { x1: 154, y1: 66, x2: 192, y2: 66, c: "#FFFFFE", w: 3.4 }], ["line", 0, 0, 1, { x1: 192, y1: 66, x2: 192, y2: 104, c: "#FFFFFE", w: 3.4 }], ["line", 0, 0, 1, { x1: 192, y1: 104, x2: 154, y2: 104, c: "#FFFFFE", w: 3.4 }], ["line", 0, 0, 1, { x1: 154, y1: 104, x2: 154, y2: 66, c: "#FFFFFE", w: 3.4 }], ["kid", 62, G, 1.4, kb("reach", { look: 1, mouth: "open" })], ["pencil", 106, 88, 0.9, { rot: 18 }]],
    wheels: [["car", 84, G, 1.4, {}], ["num", 34, 58, 1.2, { n: 4 }], ["wheel", 164, 118, 1.0, {}], ["wheel", 200, 118, 1.0, {}], ["wheel", 164, 152, 1.0, {}], ["wheel", 200, 152, 1.0, {}]],
    broken: [["crate", 110, G, 1.7, { rot: -8 }], ["line", 0, 0, 1, { x1: 94, y1: 78, x2: 112, y2: 100, c: "#3A2A1E", w: 2.4 }], ["line", 0, 0, 1, { x1: 112, y1: 100, x2: 102, y2: 118, c: "#3A2A1E", w: 2.4 }], ["line", 0, 0, 1, { x1: 150, y1: 126, x2: 184, y2: 116, c: "#C98B4A", w: 7 }], ["line", 0, 0, 1, { x1: 158, y1: 133, x2: 196, y2: 133, c: "#B27A43", w: 7 }], ["kid", 214, G, 1.1, kb("look", { look: -1, mouth: "sad", flip: true })]],
    build: [["house", 150, G, 1.6, { open: true }], ["kid", 70, G, 1.4, kb("hold", { look: 1, mouth: "open" })], ["hammer", 100, 82, 0.9, { rot: -50 }], ["kid", 40, G, 1.0, kg("walk", { look: 1 })]],
    built: [["house", 176, G, 1.9], ["kid", 80, G, 1.3, kb("cheer", { mouth: "open" })], ["kid", 116, G, 1.1, kg("cheer", { mouth: "open" })], ["rewind", 26, 56, 0.8]],
    machine: [["machine", 150, G, 1.7], ["kid", 62, G, 1.0, kb("look", { look: 1, mouth: "o" })]],
    force: [["wagon", 66, G, 1.4, { hx: 46, hy: -31 }], ["rock", 66, G - 30, 0.9, {}], ["kid", 170, G, 1.4, kb("pullL", { look: 1, rot: 8, mouth: "open" })], ["sweat", 146, 50, 0.8]],
    pattern: [["patternhat", 120, G - 30, 3.2, { c: "#3D8BF2" }], ["sparkle", 56, 50, 0.9], ["sparkle", 192, 56, 0.8]],
    quiet: [["house", 150, G, 1.5, { lit: false }], ["moon", 56, 50, 1.4], ["txt", 176, 40, 1.0, { t: "Shh...", size: 17, c: "#FFFFFF" }], ["zzz", 204, 96, 1.0]],
    soft: [["cat", 150, G, 1.6, { pose: "sit" }], ["kid", 78, G, 1.4, kg("reach", { look: 1, mouth: "open" })], ["heart", 124, 58, 0.9], ["heart", 176, 56, 0.7]],

    // ---- Monkey treetops
    arms: [["kid", 120, G, 1.7, kg("cheer", { mouth: "open" })], ["num", 178, 44, 1.3, { n: 2 }], ["sparkle", 60, 50, 0.9]],
    legs: [["kid", 120, G, 1.7, kb("walk", { look: 1, mouth: "open" })], ["num", 178, 100, 1.3, { n: 2 }], ["prints", 30, G + 8, 0.9, { n: 3 }]],
    fingers: [["bighand", 70, G + 6, 1.1], ["bighand", 168, G + 6, 1.1, { flip: true }], ["num", 120, 40, 1.5, { n: 10 }]],
    hair: [["kid", 100, G, 1.45, kb("look", { look: 1, mouth: "open" })], ["foam", 106, G - 98, 0.6], ["sink", 100, 96, 1.0], ["bubbles", 150, 90, 0.7]],
    eyes: [["eyebig", 80, 78, 1.4], ["eyebig", 160, 78, 1.4], ["num", 120, 36, 1.3, { n: 2 }]],
    heart: [["kid", 90, G, 1.6, kg("self", { mouth: "open" })], ["heart", 170, 74, 3.0], ["sparkle", 206, 40, 0.8]],
    eggs: [["nest", 120, G, 2.2], ["egg", 96, G - 16, 0.7], ["egg", 120, G - 18, 0.7], ["egg", 144, G - 16, 0.7], ["egg", 108, G - 34, 0.7], ["egg", 132, G - 34, 0.7], ["num", 200, 52, 1.3, { n: 5 }]],
    wings: [["bird", 120, 100, 2.0, { fly: true }], ["num", 196, 50, 1.3, { n: 2 }], ["cloud", 50, 40, 1.0]],
    dance: [["kid", 80, G, 1.4, kb("jump", { mouth: "open" })], ["kid", 156, G, 1.4, kg("jump", { mouth: "open" })], ["note", 118, 40, 1.4], ["note", 190, 56, 1.0]],
    exercise: [["kid", 70, G, 1.35, kb("cheer", { mouth: "open" })], ["kid", 140, G, 1.35, kg("jump", { mouth: "open" })], ["weekrow", 120, 40, 0.72, { icon: "heart", marks: [0, 1, 2, 3, 4, 5, 6], s: 0.5 }]],
    count: [["kid", 52, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["num", 196, 40, 1.4, { n: 10 }]].concat(rowOf("ball", 5, 100, 20, 108, 0.7, { c: C.red }), rowOf("ball", 5, 100, 20, 128, 0.7, { c: C.blue })),
    test: [["table", 140, G, 1.5], ["paper", 140, 96, 1.7], ["kid", 70, G, 1.4, kb("hold", { look: 1, mouth: "o" })], ["qm", 200, 54, 1.2], ["pencil", 112, 84, 0.9, { rot: 18 }]],
    farmers: [["barn", 190, G, 0.95], ["kid", 60, G, 1.5, man({ shirt: "#E5483A", pants: "#3D8BF2", hat: "#F2C14E" })], ["kid", 116, G, 1.4, kg("hold", { hat: "#F2C14E", shirt: "#6CCB5F" })], ["corn", 134, G - 40, 0.8, { rot: 62 }]],
    teacher: [["blackboard", 170, G - 14, 1.0, { t: "ABC" }], ["mom", 100, G, 1.55, { pose: "reach", look: 1, mouth: "open" }], ["heart", 120, 38, 1.0], ["kid", 40, G, 1.1, kb("wave", { mouth: "open" })]],
    happy: [["kid", 120, G, 1.6, ky("jump", { mouth: "open" })], ["heart", 66, 50, 1.0], ["heart", 176, 40, 0.8], ["sparkle", 200, 90, 0.8]],
    love: [["dog", 138, G, 1.6, { pose: "stand" }], ["kid", 78, G, 1.5, kb("hold", { look: 1, mouth: "open" })], ["heart", 110, 40, 1.2], ["heart", 150, 26, 0.9], ["heart", 66, 34, 0.7]],
    beautiful: [["flower", 120, G, 2.5, { c: "#FF6FA0" }], ["sparkle", 60, 56, 1.0], ["sparkle", 186, 46, 0.9], ["kid", 40, G, 1.1, kg("look", { look: 1, mouth: "open" })]],
    laughed: [["kid", 56, G, 1.35, kb("hands", { mouth: "open" })], ["kid", 112, G, 1.35, kg("hands", { mouth: "open" })], ["dog", 192, G - 8, 1.4, { pose: "jump", tongue: true }], ["hat", 196, 56, 0.8, { c: "#FF8FB1" }], ["txt", 84, 22, 1.0, { t: "ha ha", size: 14 }]],
    smiled: [["mom", 66, G, 1.6, { pose: "stand", look: 1, mouth: "open" }], ["kid", 174, G, 1.3, kb("stand", { look: -1, flip: true, mouth: "open" })], ["heart", 120, 52, 1.1], ["rewind", 218, 98, 0.8]],
    cried: [["baby", 120, G, 2.4, {}], ["tears", 112, 96, 1.2], ["tears", 130, 96, 1.2], ["rewind", 208, 40, 0.9]],
    surprise: [["kid", 70, G, 1.5, kb("hold", { look: 1, mouth: "open" })], ["gift", 128, G - 30, 1.1, { c: C.purple }], ["kid", 186, G, 1.3, kg("cheer", { mouth: "o", flip: true })], ["sparkle", 130, 46, 1.0], ["sparkle", 100, 36, 0.8]],
    wonder: [["kid", 70, G, 1.5, kb("look", { look: 1, mouth: "o" })], ["thought", 170, 52, 1.0, { w: 70, h: 50, inner: [["qm", 0, 8, 1.0, {}]] }], ["cbox", 190, G, 1.3]],
    hope: [["kid", 70, G, 1.5, kg("hands", { look: 1, mouth: "o" })], ["thought", 168, 54, 1.0, { w: 80, h: 56, inner: [["raincloud", 0, 26, 0.55, {}], ["cross", 22, 8, 0.7, {}]] }], ["sparkle", 100, 44, 0.8]],
    believe: [["kid", 80, G, 1.5, kb("self", { look: 1, mouth: "open" })], ["kid", 172, G, 1.5, kg("stand", { look: -1, flip: true, mouth: "open" })], ["check", 126, 52, 1.1], ["heart", 126, 86, 0.8]],
    felt: [["kid", 100, G, 1.6, kb("cheer", { mouth: "open" })], ["heart", 168, 54, 1.0], ["heart", 56, 70, 0.7], ["rewind", 206, 100, 0.9]],
    held: [["kid", 100, G, 1.8, kb("cradle", { mouth: "open", arms: "none" })], ["dog", 103, G - 24, 0.7], ["kid", 100, G, 1.8, kb("cradle", { arms: "only" })], ["heart", 178, 52, 1.1], ["rewind", 214, 100, 0.8]],
    kept: [["kid", 100, G, 1.6, kg("cradle", { mouth: "open", arms: "none" })], ["soccer", 103, G - 40, 1.15], ["kid", 100, G, 1.6, kg("cradle", { arms: "only" })], ["heart", 168, 50, 1.1], ["rewind", 206, 96, 0.8]],
    picked: [["kid", 90, G, 1.5, kb("hold", { look: 1, mouth: "open" })], ["flower", 106, G - 40, 1.0, { c: C.red, rot: 20 }], ["flower", 170, G, 1.2, { c: C.yellow || "#FFC93C" }], ["flower", 200, G, 1.2, { c: "#FF6FA0" }], ["dirt", 150, G + 2, 0.6, {}], ["sparkle", 70, 36, 0.8]],
    sat: [["bed", 120, G, 1.8, { c: "#7FB8F2" }], ["cat", 120, G - 26, 0.85, { pose: "sit" }], ["rewind", 204, 54, 0.9]],

    // ---- Hidden temple
    clothes: [["clothesline", 120, G, 1.5], ["kid", 40, G, 1.1, kg("point", { look: 1, mouth: "open" })]],
    dress: [["kid", 120, G, 1.7, kg("stand", { look: 0, mouth: "open", shirt: "#E5483A" })], ["sparkle", 60, 60, 0.9], ["sparkle", 186, 50, 0.9], ["heart", 176, 96, 0.8]],
    store: [["store", 156, G, 1.5], ["kid", 56, G, 1.3, kb("walk", { look: 1, mouth: "open" })], ["kid", 92, G, 1.2, kg("walk", { look: 1 })], ["arrow", 0, 0, 1, { x1: 44, y1: 54, x2: 104, y2: 54, c: P }]],
    paint: [["easel", 150, G, 1.5, {}], ["tree", 150, G - 56, 0.45], ["kid", 70, G, 1.4, kb("reach", { look: 1, mouth: "open" })], ["brush", 100, 86, 0.9, { rot: 0 }], ["palette", 40, 70, 0.8]],
    sign: [["stopsign", 150, G, 1.5], ["kid", 70, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    list: [["scroll", 120, G, 1.1], ["kid", 56, G, 1.4, kg("hold", { look: 1 })], ["sparkle", 170, 56, 0.8]],
    note: [["table", 150, G, 1.5], ["pad", 160, G - 40, 0.0, {}], ["paper", 150, 92, 0.9], ["kid", 80, G, 1.4, kb("hold", { look: 1 })], ["pencil", 112, 94, 0.9, { rot: 14 }]],
    mark: [["paper", 150, 120, 2.3], ["kid", 70, G, 1.4, kb("reach", { look: 1, mouth: "open" })], ["cross", 150, 76, 0.9], ["pencil", 112, 88, 1.0, { rot: 20 }]],
    written: [["cbox", 150, G, 1.9], ["tag", 150, G - 24, 0.9, { t: "Sam" }], ["kid", 66, G, 1.4, kg("reach", { look: 1 })], ["pencil", 100, 94, 0.9, { rot: 20 }]],
    questions: [["kid", 100, G, 1.6, kb("wave", { mouth: "o" })], ["qm", 160, 50, 1.6], ["qm", 196, 82, 1.2], ["num", 40, 54, 1.2, { n: 2 }]],
    third: [["podium", 120, G, 1.3], ["kid", 168, G - 38, 0.9, kb("cheer", { mouth: "open" })], ["kid", 120, G - 78, 0.8, kg("stand", {})], ["kid", 72, G - 56, 0.8, ky("stand", {})], ["sparkle", 196, 50, 0.9]],
    drawing: [["kid", 76, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["paper", 132, 126, 1.4, {}], ["heart", 190, 50, 1.1], ["sparkle", 40, 50, 0.8]],
    special: [["gift", 120, G, 2.2, { c: C.purple }], ["star", 120, 38, 1.3], ["sparkle", 56, 60, 1.0], ["sparkle", 186, 70, 0.9], ["kid", 40, G, 1.1, kg("point", { look: 1 })]],
    great: [["hat", 150, G - 16, 3.0, { c: C.red }], ["star", 150, 28, 0.9], ["kid", 56, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["check", 200, 54, 1.0]],
    place: [["tree", 62, G, 1.5], ["pond", 168, G + 8, 1.3, { w: 44 }], ["flag", 120, G, 0.9, { c: "#35B779" }], ["heart", 150, 40, 1.0], ["kid", 100, G, 1.1, kg("point", { look: 1, mouth: "open" })]],
    point: [["kid", 62, G, 1.5, kb("point", { look: 1, mouth: "open" })], ["bird", 190, 62, 1.2, {}], ["arrow", 0, 0, 1, { x1: 108, y1: 84, x2: 164, y2: 68, c: P, dash: true }]],
    same: [["kid", 70, G, 1.5, kb("hands", { hat: C.red, mouth: "open" })], ["kid", 170, G, 1.5, kg("hands", { hat: C.red, mouth: "open" })], ["txt", 120, 82, 1.0, { t: "=", size: 40 }]],
    most: [["coins", 50, G, 0.8, { n: 3 }], ["coins", 108, G, 0.8, { n: 2 }], ["coins", 176, G, 1.1, { n: 15 }], ["crown", 176, 54, 0.5, {}], ["kid", 220, G, 0.9, kb("cheer", { flip: true, mouth: "open" })]],
    something: [["bush", 150, G, 2.0], ["ball", 156, G - 24, 0.6, { c: C.red }], ["qm", 190, 54, 1.3], ["kid", 66, G, 1.4, kb("look", { look: 1, mouth: "o" })]],
    nothing: [["box", 120, G, 2.4, {}], ["num", 120, 90, 1.0, { n: 0 }], ["qm", 196, 56, 1.0], ["kid", 46, G, 1.2, kb("reach", { look: 1, mouth: "o" })]],
    everyone: rowOf("kid", 5, 34, 43, G, 1.0, function (i) { return [kb("wave", {}), kg("cheer", {}), ky("jump", {}), kr("wave", {}), kg("cheer", { shirt: "#8B6BE8" })][i]; }).concat([["ball", 120, G - 2, 0.8, { c: C.red }], ["heart", 120, 30, 1.0]]),
    someone: [["door", 120, G, 1.6, {}], ["kid", 190, G, 1.5, X(kb("stand", { look: -1, flip: true }), { shirt: "#5A6578", pants: "#4A4F5E", skin: "#6A7488", hair: "#3A3F4D" })], ["qm", 190, 40, 1.1], ["sparkle", 60, 50, 0.6, { op: 0 }]],
    everything: [["ball", 50, G, 1.0, { c: C.red }], ["doll", 84, G, 1.0, {}], ["book", 118, G, 1.0], ["kite", 156, 106, 0.6], ["hat", 196, G - 4, 1.0, { c: C.blue }], ["kid", 130, G - 36, 0.0, {}], ["heart", 66, 56, 0.9], ["heart", 150, 40, 0.9], ["heart", 200, 66, 0.8]],
    without: [["kid", 120, G, 1.6, X(kb("run", { mouth: "open" }), { barefoot: true })], ["shoe", 190, G - 4, 0.8, {}], ["cross", 190, 90, 0.9], ["whoosh", 70, G - 22, 1.3]],
    against: [["wall", 226, G, 1.8, { w: 24, hh: 80 }], ["bed", 150, G, 1.7, { c: "#7FB8F2" }], ["arrow", 0, 0, 1, { x1: 130, y1: 56, x2: 196, y2: 74, c: P }]],
    among: [["duck", 50, G, 0.9], ["duck", 92, G - 6, 0.9], ["cat", 130, G, 1.1, {}], ["duck", 176, G, 0.9], ["duck", 214, G - 6, 0.9], ["duck", 100, G + 6, 0.9], ["duck", 160, G + 6, 0.9]],
    covered: [["snowhill", 120, G, 1.0], ["flake", 60, 40, 1.0], ["flake", 150, 28, 0.8], ["flake", 200, 52, 0.9], ["snowman", 52, G, 1.0]],

    // ---- Golden river
    hours: [["bed", 100, G, 1.8, { c: "#7FB8F2", sleeper: true }], ["clock", 188, 104, 2.0], ["num", 188, 40, 1.3, { n: 10 }], ["zzz", 126, 70, 1.0]],
    minutes: [["kid", 70, G, 1.5, kb("hold", { look: 1 })], ["clock", 160, 110, 2.0], ["num", 160, 36, 1.3, { n: 10 }]],
    months: [["snowman", 66, G, 1.5], ["calendar", 150, G - 6, 1.1], ["calendar", 178, G - 6, 1.1], ["calendar", 206, G - 6, 1.1]],
    past: [["whoosh", 130, G - 24, 1.2], ["bus", 176, G, 1.1], ["kid", 56, G, 1.4, kb("wave", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 120, y1: 40, x2: 206, y2: 40, c: P }]],
    ago: [["kid", 150, G, 1.5, kb("look", { look: -1, flip: true })], ["prints", 30, G + 8, 0.9, { n: 4 }], ["rewind", 70, 66, 1.6], ["tree", 24, G - 6, 0.8]],
    ready: [["flag", 190, G, 0.9, { c: "#35B779" }], ["kid", 80, G, 1.6, kb("cheer", { mouth: "open" })], ["check", 140, 50, 1.3], ["bag", 34, G, 0.6, { c: C.blue }]],
    finished: [["kid", 100, G, 1.6, kg("hold", { look: 0, mouth: "open" })], ["book", 110, G - 40, 0.8], ["check", 176, 56, 1.3], ["sparkle", 54, 54, 0.9]],
    suddenly: [["raincloud", 120, 56, 1.8], ["kid", 120, G, 1.5, kb("wave", { mouth: "o" })], ["txt", 186, 100, 1.0, { t: "!", size: 34, c: "#E5483A" }]],
    passed: [["dog", 60, G - 6, 1.3, { pose: "jump" }], ["ball", 110, 60, 0.9, { c: C.red }], ["arrow", 0, 0, 1, { x1: 126, y1: 56, x2: 160, y2: 76, c: P, dash: true }], ["kid", 190, G, 1.4, kg("reach", { look: -1, flip: true, mouth: "open" })]],
    gone: [["box", 100, G, 2.0, {}], ["qm", 100, 50, 1.2], ["prints", 128, G + 8, 0.8, { n: 3 }], ["cat", 214, G, 0.6, { pose: "run" }], ["kid", 46, G, 1.2, kb("look", { look: 1, mouth: "sad" })]],
    brought: [["mom", 62, G, 1.55, { pose: "reach", look: 1 }], ["hat", 114, G - 52, 0.8, { c: C.red }], ["kid", 176, G, 1.2, kb("reach", { look: -1, flip: true })], ["heart", 120, 38, 1], ["rewind", 214, 40, 0.8]],
    stood: [["door", 150, G, 1.6, {}], ["kid", 90, G, 1.5, kb("stand", { look: 1, mouth: "open" })], ["rewind", 210, 36, 0.8]],
    sure: [["ball", 150, G, 1.6, { c: C.red }], ["kid", 80, G, 1.5, kb("point", { look: 1, mouth: "open" })], ["check", 150, 50, 1.5]],
    miss: [["kid", 70, G, 1.5, kg("look", { look: 1, mouth: "sad" })], ["thought", 170, 52, 1.0, { w: 80, h: 56, inner: [["dog", 0, 24, 0.5, {}], ["heart", 26, 8, 0.7, {}]] }]],
    close: [["door", 150, G, 1.6, {}], ["kid", 86, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 124, y1: 52, x2: 150, y2: 52, c: P }]],
    care: [["dog", 150, G, 1.5, { pose: "stand" }], ["kid", 80, G, 1.5, kg("reach", { look: 1, mouth: "open" })], ["bowl", 124, G, 0.8, {}], ["heart", 150, 40, 1.0]],
    free: [["bus", 120, G, 1.4], ["tag", 120, 56, 1.2, { t: "FREE" }], ["sparkle", 196, 60, 0.9]],
    cant: [["wall", 130, G, 1.8, { w: 70, hh: 50 }], ["cat", 190, G, 0.8, {}], ["kid", 56, G, 1.5, kb("look", { look: 1, mouth: "sad" })], ["qm", 100, 48, 1.1]],
    meet: [["kid", 56, G, 1.3, kb("run", { mouth: "open" })], ["kid", 150, G, 1.3, kg("wave", { look: -1, flip: true, mouth: "open" })], ["kid", 196, G, 1.3, ky("wave", { look: -1, flip: true, mouth: "open" })], ["heart", 120, 38, 1.0]],
    village: [["house", 56, G - 6, 1.1], ["house", 124, G - 6, 1.2, { c: "#CFE6F8", rc: "#6A8FD8" }], ["house", 192, G - 6, 1.1, { c: "#F8D6DE", rc: "#8B6BE8" }], ["tree", 94, G, 0.8], ["kid", 30, G, 0.9, kb("wave", { mouth: "open" })]],
    country: [["countrymap", 136, 150, 1.04], ["kid", 20, G, 1.2, kb("point", { look: 1, mouth: "open" })]],
    trip: [["car", 170, G, 1.4, { c: "#3D8BF2" }], ["suitcase", 110, G, 0.9, {}], ["kid", 50, G, 1.2, kb("walk", { look: 1, mouth: "open" })], ["kid", 80, G, 1.1, kg("walk", { look: 1 })], ["arrow", 0, 0, 1, { x1: 40, y1: 40, x2: 110, y2: 40, c: P }]],
    hole: [["groundcut", 120, 160, 1.0], ["holecut", 120, 98, 1.0, { w: 66, d: 44 }], ["dog", 120, 138, 1.05, {}], ["arrow", 0, 0, 1, { x1: 62, y1: 60, x2: 84, y2: 92, c: P }]],
    drop: [["kid", 90, G, 1.5, kb("reach", { look: 1, mouth: "o" })], ["ball", 138, 64, 1.0, { c: C.red }], ["arrow", 0, 0, 1, { x1: 138, y1: 78, x2: 138, y2: 118, c: P }]],
    power: [["car", 120, G, 1.7, { c: "#E5483A" }], ["bulb", 190, 70, 1.2], ["sparkle", 56, 60, 0.9], ["whoosh", 40, G - 24, 1.1]],
    beat: [["drum", 120, G, 2.2], ["kid", 56, G, 1.4, kb("reach", { look: 1, mouth: "open" })], ["note", 190, 54, 1.0], ["note", 168, 38, 0.8], ["line", 0, 0, 1, { x1: 96, y1: 88, x2: 120, y2: 78, c: "#B27A43", w: 3.4 }]],
    filled: [["box", 120, G, 2.2, { inner: [["apple", -12, -26, 0.8, {}], ["apple", 10, -28, 0.8, {}], ["apple", 0, -36, 0.8, {}]] }], ["sparkle", 56, 60, 0.9]],
    pair: [["shoe", 78, G, 0.9, {}], ["shoe", 170, G, 0.9, { flip: true }], ["num", 120, 60, 1.3, { n: 2 }], ["kid", 210, G, 0.8, kg("point", { look: -1, flip: true })]],
  };
  var BG5 = {
    cross: "out", moon: "night", quiet: "night", winter: "snow", covered: "snow", months: "snow", ice: "snow", summer: "outns", west: "dusk", sail: "sea",
    wild: "jungle", pushed: "out", length: "in", inches: "in", test: "in", paint: "in", clothes: "out", broken: "in", note: "in", written: "in", mark: "in", list: "in", drawing: "in", special: "in",
    hair: "in", hours: "in", minutes: "in", close: "out", against: "in", nothing: "in", wheels: "out", end: "in", teacher: "in", surprise: "in", sat: "in", wonder: "in", stood: "out", gone: "in", care: "out", eyes: "in", fingers: "in",
    heart: "out", soft: "in", edge: "in", iron: "out", metal: "in", gold: "in", machine: "in", pattern: "in", sure: "out", someone: "out", something: "out", everything: "in", hole: "out", soil: "out", root: "out", wall: "out", filled: "in", pair: "in", free: "out", force: "out",
  };
  A.extend({
    kit: { compass: compass, iceblock: iceblock, mountain: mountain, soilcut: soilcut, groundcut: groundcut, rootsoil: rootsoil, wall: wall, train: train, wheel: wheel, handc: handc, soccer: soccer, holecut: holecut, countrymap: countrymap, wideroad: wideroad, snowhill: snowhill, pithole: pithole, hammer: hammer, brush: brush, drum: drum, store: store, scroll: scroll, cone: cone, machine: machine,
      clothesline: clothesline, bullseye: bullseye, irondoor: irondoor, patternhat: patternhat, metalbell: metalbell, coins: coins, goldbars: goldbars, vroad: vroad },
    scenes: S5,
    bgk: BG5,
    bg: { jungle: bgJungle },
  });
})(typeof window !== "undefined" ? window : this);
