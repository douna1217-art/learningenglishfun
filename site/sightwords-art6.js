/* More little pictures for the stage-6 sight words (the deep-sea island): sea things and materials, the body and doing, people, places and tools,
   describing words, and the common little words. It adds new kinds of things and one scene per word to sightwords-art.js (SWArt.extend; it also
   uses the things of sightwords-art3.js, sightwords-art4.js and sightwords-art5.js), in the same soft look, all drawn in code.
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

  // a thing of another kind drawn inside a new thing (x, y, scale, options)
  function at(kind, x, y, s, o) {
    return '<g transform="translate(' + x + "," + y + ") scale(" + s + ')">' + K[kind](o || {}) + "</g>";
  }
  function man(extra) {
    return X({ shirt: "#2E7D9A", pants: "#4A4A5A", hair: "#3A2A22" }, extra);
  }
  function rowOf(kind, n, x0, dx, y, s, opt) {
    var out = [], i;
    for (i = 0; i < n; i++) out.push([kind, x0 + i * dx, y, s, opt && opt.call ? opt(i) : opt || {}]);
    return out;
  }

  /* ------------------------------------------------------------------ new things: coral reef */
  // a little sand castle with a flag
  KITS.sandcastle = function (o) {
    var c = "#EBCB7F";
    return '<path d="M-32 0 L-30 -22 H-21 V-30 H-14 V-22 H-8 V-40 H8 V-22 H14 V-30 H21 V-22 H30 L32 0Z" ' + f(c, 2.2) + '/><path d="M-7 0 V-11 Q0 -19 7 -11 V0Z" fill="' + dk(c, 0.3) + '"/><path d="M0 -40 V-54" stroke="#8A5A2B" stroke-width="2.4" stroke-linecap="round"/><path d="M0 -54 L13 -50 L0 -46Z" ' + f("#E5483A", 1.6) + "/>";
  };
  // a beach bucket
  KITS.bucket = function (o) {
    var c = o.c || "#FF8FB1";
    return '<path d="M-14 -24 H14 L11 0 H-11Z" ' + f(c, 2.2) + '/><rect x="-15.5" y="-27" width="31" height="6" rx="3" ' + f(dk(c, 0.1), 1.8) + '/><path d="M-12 -26 Q0 -44 12 -26" fill="none" stroke="#7B8BA8" stroke-width="2.4" stroke-linecap="round"/><path d="M-8 -18 L-7 -6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>';
  };
  // a palm tree
  KITS.palm = function (o) {
    var s = '<path d="M0 0 Q-8 -30 4 -58" fill="none" stroke="#7A5328" stroke-width="8" stroke-linecap="round"/><path d="M0 0 Q-8 -30 4 -58" fill="none" stroke="#B2793E" stroke-width="4.6" stroke-linecap="round"/>', a = [-165, -125, -85, -45, -5], i;
    for (i = 0; i < a.length; i++) s += '<g transform="translate(4,-58) rotate(' + a[i] + ')"><path d="M0 0 Q18 -18 42 2 Q20 -7 0 0Z" ' + f(i % 2 ? "#4FB36B" : "#3E9B5A", 1.8) + "/></g>";
    return s + '<circle cx="0" cy="-54" r="3.8" ' + f("#8A5A2B", 1.4) + '/><circle cx="8" cy="-54" r="3.8" ' + f("#8A5A2B", 1.4) + "/>";
  };
  // land at the right of the sea, in picture coordinates (draw it at 0,0): green hill, a sand beach and white foam along the water
  KITS.shore = function (o) {
    return '<path d="M150 112 Q160 80 200 76 Q232 72 244 82 V112Z" ' + f("#8FD07A", 2.4) + '/><path d="M138 124 Q146 106 168 104 H244 V130 Q190 136 138 124Z" ' + f("#F3DFA2", 2.4) + '/><path d="M140 126 Q190 138 244 132" fill="none" stroke="#FFFFFE" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="6 5"/>';
  };
  // a stream: a winding strip of water with muddy banks (the middle of the strip is the origin, 280 wide)
  KITS.stream = function (o) {
    var d = "M-140 0 Q-70 -28 0 0 T140 0", w = o.w || 34;
    return '<path d="' + d + '" fill="none" stroke="#B58A5A" stroke-width="' + (w + 9) + '"/><path d="' + d + '" fill="none" stroke="#5BA9E0" stroke-width="' + w + '"/><path d="' + d + '" fill="none" stroke="#8FD0F2" stroke-width="' + w * 0.45 + '" opacity=".75"/><path d="M-96 -16 q6 -3 12 0 M30 -3 q6 -3 12 0 M92 10 q6 -3 12 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>';
  };
  // wavy white arrows that flow to the right, drawn on water (three rows)
  KITS.waveflow = function (o) {
    var s = "", ys = [-16, 0, 16], i, y;
    for (i = 0; i < 3; i++) {
      y = ys[i];
      s += '<path d="M-36 ' + y + " q8 -7 17 0 t17 0 t17 0" + '" fill="none" stroke="#FFFFFE" stroke-width="3.2" stroke-linecap="round"/><path d="M33 ' + (y - 5.5) + " L45 " + y + " L33 " + (y + 5.5) + 'Z" fill="#FFFFFE"/>';
    }
    return s;
  };
  // a rope between two points (o.x1, y1, x2, y2), with twists
  KITS.ropeln = function (o) {
    var s = ln(o.x1, o.y1, o.x2, o.y2, o.w || 5, "#C9A25B"), dx = o.x2 - o.x1, dy = o.y2 - o.y1, L = Math.sqrt(dx * dx + dy * dy), n = Math.floor(L / 7), i, t, x, y;
    for (i = 1; i < n; i++) {
      t = i / n;
      x = o.x1 + dx * t;
      y = o.y1 + dy * t;
      s += '<line x1="' + (x - 1.6) + '" y1="' + (y - 2.2) + '" x2="' + (x + 1.6) + '" y2="' + (y + 2.2) + '" stroke="#8A6A3A" stroke-width="1.4" stroke-linecap="round"/>';
    }
    return s;
  };
  // a small red cloth tied to the middle of a rope
  KITS.ribbon = function (o) {
    return '<path d="M-3 0 L3 0 L8 20 L0 15 L-8 20Z" ' + f("#E5483A", 1.8) + "/>";
  };
  // a curved line from (x1, y1) through the control point (cx, cy) to (x2, y2)
  KITS.curve = function (o) {
    return '<path d="M' + o.x1 + " " + o.y1 + " Q" + o.cx + " " + o.cy + " " + o.x2 + " " + o.y2 + '" fill="none" stroke="' + (o.c || "#8A6A3A") + '" stroke-width="' + (o.w || 1.8) + '" stroke-linecap="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + "/>";
  };
  // a pipe with water in it, in picture coordinates: it comes out of a brick wall at the left, runs along and bends down to end above the floor
  KITS.tubepipe = function (o) {
    var d = "M30 56 H112 Q126 56 126 70 V106", s = '<rect x="-4" y="22" width="36" height="116" ' + f("#C98B6B", 2.4) + "/>", i;
    for (i = 0; i < 5; i++) s += '<path d="M-4 ' + (40 + i * 20) + ' H32" stroke="#A8694A" stroke-width="2"/>';
    s += '<path d="' + d + '" fill="none" stroke="#7B8BA8" stroke-width="16" stroke-linecap="butt"/><path d="' + d + '" fill="none" stroke="#DDE6F4" stroke-width="12"/><path d="' + d + '" fill="none" stroke="#5BA9E0" stroke-width="7"/>';
    s += '<path d="M40 50 H104" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/><rect x="26" y="46" width="8" height="20" rx="2" ' + f("#9AA6BC", 1.6) + '/>';
    s += '<path d="M62 56 L74 56 M66 51 L76 56 L66 61" fill="none" stroke="#FFFFFE" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
    return s;
  };
  // a pole for wires (a tall post with a cross arm); o.h = its height
  KITS.pole = function (o) {
    var hh = o.h || 90;
    return '<rect x="-3.5" y="' + -hh + '" width="7" height="' + hh + '" ' + f("#8A5A2B", 1.8) + '/><rect x="-15" y="' + (-hh + 6) + '" width="30" height="4.4" rx="2" ' + f("#8A5A2B", 1.6) + '/><circle cx="-12" cy="' + (-hh + 5) + '" r="2.4" fill="#DDE6F4"/><circle cx="12" cy="' + (-hh + 5) + '" r="2.4" fill="#DDE6F4"/>';
  };
  // a wire that sags between two points (o.x1, y1, x2, y2; o.sag = how far it hangs in the middle)
  KITS.wirecurve = function (o) {
    var cy = (o.y1 + o.y2) / 2 + 2 * (o.sag || 10);
    return '<path d="M' + o.x1 + " " + o.y1 + " Q" + (o.x1 + o.x2) / 2 + " " + cy + " " + o.x2 + " " + o.y2 + '" fill="none" stroke="#3A3F4D" stroke-width="2" stroke-linecap="round"/>';
  };
  // a flag pole: a tall metal pole with a golden ball and a flag at the top (o.h = height, o.c = flag colour)
  KITS.flagpole = function (o) {
    var hh = o.h || 100, c = o.c || "#E5483A", t = -hh + 4;
    return '<rect x="-2" y="' + -hh + '" width="4" height="' + hh + '" rx="2" ' + f("#B8C0D4", 1.6) + '/><circle cx="0" cy="' + (-hh - 2) + '" r="3.6" ' + f("#FFD23F", 1.4) + '/><path d="M2 ' + t + " Q16 " + (t - 6) + " 32 " + t + " L32 " + (t + 16) + " Q16 " + (t + 10) + " 2 " + (t + 16) + 'Z" ' + f(c, 2) + '/><path d="M2 ' + (t + 8) + " Q16 " + (t + 2) + " 32 " + (t + 8) + '" fill="none" stroke="#FFFFFE" stroke-width="2" opacity=".8"/>';
  };
  // a toy block, a cube with a letter (o.c = colour, o.t = letter)
  KITS.toyblock = function (o) {
    var c = o.c || "#E5483A";
    return '<path d="M-22 0 V-30 L-10 -42 H22 V-12 L10 0Z" ' + f(dk(c, 0.12), 2.2) + '/><path d="M-22 -30 H10 V0 H-22Z" ' + f(c, 2.4) + '/><path d="M-22 -30 L-10 -42 H22 L10 -30Z" ' + f(c, 2.2) + '/><path d="M10 -30 L22 -42 V-12 L10 0Z" fill="' + dk(c, 0.25) + '"/><text x="-6" y="-9" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="21" fill="#FFFFFE">' + (o.t || "A") + "</text>";
  };
  // a bare tree with many branches (o.leaves puts a leaf tuft at the end of each branch)
  KITS.bare = function (o) {
    var c = o.c || "#8A5A2B", s = "", E = [[-34, -76], [-16, -84], [-8, -92], [12, -90], [30, -84], [38, -74]], i;
    s += ln(0, 0, 0, -42, 10, c) + ln(0, -34, -22, -62, 6, c) + ln(0, -42, 2, -70, 6, c) + ln(0, -34, 24, -60, 6, c);
    s += ln(-22, -62, -34, -76, 4, c) + ln(-22, -62, -16, -84, 4, c) + ln(2, -70, -8, -92, 4, c) + ln(2, -70, 12, -90, 4, c) + ln(24, -60, 30, -84, 4, c) + ln(24, -60, 38, -74, 4, c);
    if (o.leaves) for (i = 0; i < E.length; i++) s += '<circle cx="' + E[i][0] + '" cy="' + (E[i][1] - 3) + '" r="8.4" ' + f(i % 2 ? "#4FB36B" : "#5DBB5A", 1.8) + "/>";
    return s;
  };
  // a packet of seeds
  KITS.packet = function (o) {
    return '<path d="M-14 0 V-34 H14 V0Z" ' + f("#FFE9A8", 2) + '/><path d="M-14 -34 L-11 -38 H11 L14 -34" ' + f("#F4D77A", 1.6) + '/><circle cx="0" cy="-21" r="8" ' + f("#BFE6A8", 1.6) + '/><path d="M0 -15 V-26 M0 -21 L-5 -25 M0 -21 L5 -25" stroke="#2F8A4C" stroke-width="1.8" stroke-linecap="round" fill="none"/><text x="0" y="-5" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="6.4" fill="#8A5A2B">SEEDS</text>';
  };
  // fruit: a banana, an orange and a bunch of grapes (bits for the bowl)
  KITS.banana = function (o) {
    return '<path d="M-20 -22 Q-18 -2 8 -4 Q22 -4 28 -18 Q14 -8 -2 -10 Q-12 -12 -20 -22Z" ' + f("#FFD23F", 2.2) + '/><path d="M-20 -22 L-23 -26" stroke="#7A5328" stroke-width="3" stroke-linecap="round"/><path d="M28 -18 L30 -20" stroke="#7A5328" stroke-width="3" stroke-linecap="round"/>';
  };
  KITS.orange = function (o) {
    return '<circle cx="0" cy="-12" r="12" ' + f("#FFA94D", 2.2) + '/><path d="M0 -24 Q6 -30 12 -26 Q6 -22 0 -24Z" ' + f("#5DBB5A", 1.4) + '/><ellipse cx="-4" cy="-17" rx="3" ry="2" fill="#fff" opacity=".5"/>';
  };
  KITS.grapes = function (o) {
    var P2 = [[-8, -8], [0, -6], [8, -8], [-4, -15], [4, -15], [0, -23]], s = "", i;
    for (i = 0; i < P2.length; i++) s += '<circle cx="' + P2[i][0] + '" cy="' + P2[i][1] + '" r="5.6" ' + f("#8B5CD6", 1.6) + '/><circle cx="' + (P2[i][0] - 1.6) + '" cy="' + (P2[i][1] - 1.8) + '" r="1.4" fill="#fff" opacity=".6"/>';
    return s + '<path d="M0 -28 Q4 -32 8 -32" fill="none" stroke="#5E8A3A" stroke-width="2.4" stroke-linecap="round"/>';
  };
  // a bowl of fruit
  KITS.fruitbowl = function (o) {
    return at("banana", 2, -22, 1.0) + at("apple", -13, -20, 0.8, { c: "#E5483A" }) + at("orange", 12, -18, 0.9) + at("grapes", 22, -12, 0.9) +
      '<path d="M-32 -22 H32 Q30 0 0 3 Q-30 0 -32 -22Z" ' + f("#C48A52", 2.4) + '/><path d="M-26 -14 Q0 -8 26 -14" fill="none" stroke="#A8713A" stroke-width="2" stroke-linecap="round"/>';
  };
  // a jar of sugar (white crystals, a lid and a label) with a few cubes next to it
  KITS.sugarjar = function (o) {
    return '<rect x="-15" y="-42" width="30" height="42" rx="7" ' + f("#E4F4FF", 2.2) + '/><rect x="-12" y="-32" width="24" height="29" rx="5" fill="#FFFFFE"/><circle cx="-6" cy="-24" r="1.3" fill="#C9D4E6"/><circle cx="3" cy="-14" r="1.3" fill="#C9D4E6"/><circle cx="7" cy="-26" r="1.2" fill="#C9D4E6"/><circle cx="-4" cy="-8" r="1.2" fill="#C9D4E6"/>' +
      '<rect x="-17" y="-50" width="34" height="9" rx="3" ' + f("#E5483A", 2) + '/><rect x="-10" y="-24" width="20" height="11" rx="2" fill="#FFF6E0" stroke="#C9B6A0" stroke-width="1"/><text x="0" y="-15.5" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="6.4" fill="#E5483A">SUGAR</text>' +
      '<path d="M24 0 V-9 H35 V0Z" ' + f("#FFFFFE", 1.6) + '/><path d="M24 -9 L28 -13 H39 L35 -9Z" ' + f("#FFFFFE", 1.4) + '/><path d="M35 -9 L39 -13 V-4 L35 0Z" fill="#E1E8F2"/>';
  };
  // a drumstick: meat on a bone
  KITS.drumstick = function (o) {
    return ln(8, -10, 24, 2, 5, "#F5E9D2") + '<circle cx="26" cy="-1" r="4.4" ' + f("#F5E9D2", 1.6) + '/><circle cx="26" cy="5" r="4.4" ' + f("#F5E9D2", 1.6) + '/><path d="M-16 -8 Q-24 -28 -4 -32 Q14 -34 18 -20 Q20 -8 8 -4 Q-4 0 -16 -8Z" ' + f("#B5652F", 2.2) + '/><path d="M-10 -22 Q-4 -28 6 -26" fill="none" stroke="#E0A06A" stroke-width="2.4" stroke-linecap="round"/>';
  };
  // a cooking pot with two handles, a lid and steam
  KITS.cookpot = function (o) {
    return '<path d="M-17 -28 H17 L14 0 H-14Z" ' + f("#9AA6BC", 2.2) + '/><rect x="-20" y="-33" width="40" height="6" rx="3" ' + f("#B8C4D8", 2) + '/><path d="M-20 -22 H-26 M20 -22 H26" stroke="#5A6578" stroke-width="4" stroke-linecap="round"/><path d="M-9 -22 L-8 -6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>' +
      '<path d="M-6 -40 Q-10 -48 -6 -56 Q-2 -62 -6 -68 M6 -40 Q2 -48 6 -56 Q10 -62 6 -68" fill="none" stroke="#C9D4E6" stroke-width="3" stroke-linecap="round"/>';
  };
  // a stove: a metal box with burners on top, two knobs and an oven window
  KITS.stove = function (o) {
    return '<rect x="-32" y="-48" width="64" height="48" rx="4" ' + f("#9AA6BC", 2.2) + '/><rect x="-34" y="-52" width="68" height="7" rx="3" ' + f("#5A6578", 2) + '/><ellipse cx="-14" cy="-52" rx="10" ry="2.6" fill="#2B3350"/><ellipse cx="14" cy="-52" rx="10" ry="2.6" fill="#2B3350"/>' +
      '<circle cx="-18" cy="-39" r="3.4" ' + f("#E5483A", 1.4) + '/><circle cx="-6" cy="-39" r="3.4" ' + f("#E5483A", 1.4) + '/><rect x="-24" y="-31" width="48" height="24" rx="4" fill="#2B3350"/><rect x="-21" y="-28" width="42" height="18" rx="3" fill="#3E4A70"/><path d="M-17 -26 L-10 -26 L-14 -13Z" fill="#fff" opacity=".18"/><rect x="-14" y="-33" width="28" height="2.6" rx="1.3" fill="#C9D4E6"/>';
  };
  // an insect (o.t = lady, bee, butterfly or ant), about 20 wide
  KITS.bug = function (o) {
    var t = o.t || "lady", s = "";
    if (t === "lady") {
      s += ln(-7, -2, -11, 4, 1.6, "#3A3F4D") + ln(0, 0, 0, 6, 1.6, "#3A3F4D") + ln(7, -2, 11, 4, 1.6, "#3A3F4D");
      s += '<circle cx="9" cy="-7" r="5.4" ' + f("#3A3F4D", 1.6) + '/><ellipse cx="0" cy="-6" rx="11" ry="9.4" ' + f("#E5483A", 2) + '/><path d="M-1 -15 V3" stroke="#3A3F4D" stroke-width="1.6"/><circle cx="-5" cy="-9" r="1.9" fill="#3A3F4D"/><circle cx="-5" cy="-2" r="1.9" fill="#3A3F4D"/><circle cx="4.4" cy="-10" r="1.9" fill="#3A3F4D"/><circle cx="4.4" cy="-2" r="1.9" fill="#3A3F4D"/>';
    } else if (t === "bee") {
      s += '<ellipse cx="-3" cy="-13" rx="6" ry="9" transform="rotate(-24 -3 -13)" fill="#DFF3FF" stroke="#8FB5D6" stroke-width="1.6"/><ellipse cx="6" cy="-14" rx="6" ry="9" transform="rotate(20 6 -14)" fill="#DFF3FF" stroke="#8FB5D6" stroke-width="1.6"/>';
      s += '<ellipse cx="0" cy="-3" rx="13" ry="8.6" ' + f("#FFD23F", 2) + '/><path d="M-5 -10.6 V4.6 M2 -11.2 V5.2" stroke="#3A3F4D" stroke-width="3.4"/><path d="M-13 -3 L-18 -3" stroke="#3A3F4D" stroke-width="2.6" stroke-linecap="round"/><circle cx="11" cy="-5" r="5.2" ' + f("#3A3F4D", 1.6) + '/><circle cx="12.6" cy="-6.4" r="1.2" fill="#fff"/><path d="M11 -9 L13 -14 M14 -8 L18 -12" stroke="#3A3F4D" stroke-width="1.4" stroke-linecap="round"/>';
    } else if (t === "butterfly") {
      s += '<path d="M0 -4 Q-14 -24 -22 -12 Q-24 -2 0 -4Z" ' + f("#FF8FB1", 1.8) + '/><path d="M0 -4 Q14 -24 22 -12 Q24 -2 0 -4Z" ' + f("#FF8FB1", 1.8) + '/><path d="M0 -3 Q-12 4 -16 12 Q-6 12 0 -3Z" ' + f("#8B6BE8", 1.8) + '/><path d="M0 -3 Q12 4 16 12 Q6 12 0 -3Z" ' + f("#8B6BE8", 1.8) + '/><circle cx="-12" cy="-10" r="2.6" fill="#FFE066"/><circle cx="12" cy="-10" r="2.6" fill="#FFE066"/>';
      s += '<ellipse cx="0" cy="-2" rx="2.6" ry="10" ' + f("#3A3F4D", 1.4) + '/><path d="M-1 -12 Q-4 -18 -7 -18 M1 -12 Q4 -18 7 -18" fill="none" stroke="#3A3F4D" stroke-width="1.4" stroke-linecap="round"/>';
    } else {
      s += ln(-8, -2, -12, 4, 1.4, "#3A2A22") + ln(0, -2, 0, 5, 1.4, "#3A2A22") + ln(7, -2, 11, 4, 1.4, "#3A2A22");
      s += '<circle cx="-9" cy="-5" r="5" ' + f("#5E3A1E", 1.6) + '/><circle cx="-1" cy="-5" r="3.4" ' + f("#5E3A1E", 1.6) + '/><circle cx="8" cy="-6" r="4.4" ' + f("#5E3A1E", 1.6) + '/><path d="M10 -9 L14 -14 M12 -7 L17 -10" stroke="#3A2A22" stroke-width="1.2" stroke-linecap="round"/>';
    }
    return s;
  };
  // a bat for hitting a ball: the grip is at the origin and the bat goes off to the right (rotate it to point it)
  KITS.bat = function (o) {
    return '<path d="M-3 -2.2 L34 -5.4 Q47 -5 47 0 Q47 5 34 5.4 L-3 2.2Z" ' + f("#C98B4A", 2.2) + '/><circle cx="-4" cy="0" r="3.2" ' + f("#8A5A2B", 1.6) + '/><path d="M12 -2.6 H30" stroke="#E6B67E" stroke-width="1.8" stroke-linecap="round"/>';
  };
  // a bubble wand: a stick with a ring on the end, going up from the origin (rotate it to point it)
  KITS.bubblewand = function (o) {
    return '<path d="M0 0 V-26" stroke="#5E3A18" stroke-width="3.6" stroke-linecap="round"/><path d="M0 0 V-26" stroke="#E5483A" stroke-width="2" stroke-linecap="round"/><circle cx="0" cy="-34" r="8.4" fill="rgba(228,244,255,.45)" stroke="#E5483A" stroke-width="3"/>';
  };
  // a piggy bank with a slot on top
  KITS.piggybank = function (o) {
    var b = "#FF9DB5", d = dk(b, 0.12);
    return ln(-14, -14, -14, -2, 7, d) + ln(14, -14, 14, -2, 7, d) + '<path d="M-26 -26 Q-34 -34 -28 -38 Q-22 -34 -26 -30" fill="none" stroke="' + dk(b, 0.3) + '" stroke-width="3" stroke-linecap="round"/><ellipse cx="0" cy="-22" rx="27" ry="19" ' + f(b, 2.4) + '/><path d="M12 -36 L18 -46 L22 -34Z" ' + f(d, 1.8) + '/><ellipse cx="25" cy="-20" rx="8" ry="7" ' + f(dk(b, 0.1), 2) + '/><circle cx="23" cy="-20" r="1.4" fill="' + INK + '"/><circle cx="28" cy="-20" r="1.4" fill="' + INK + '"/><circle cx="14" cy="-27" r="2.2" fill="' + INK + '"/><rect x="-9" y="-42" width="18" height="4.4" rx="2.2" fill="#8E2A4A"/><path d="M-14 -34 Q-6 -37 2 -35" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>';
  };
  // a market stall: striped awning over a table with a striped cloth, a sign (o.t) on the front
  KITS.stall = function (o) {
    var s = "", i, c;
    s += '<rect x="-46" y="-72" width="4" height="72" fill="#8A5A2B"/><rect x="42" y="-72" width="4" height="72" fill="#8A5A2B"/>';
    s += '<rect x="-44" y="-32" width="88" height="8" rx="3" ' + f("#C48A52", 2) + '/>';
    for (i = 0; i < 8; i++) s += '<rect x="' + (-44 + i * 11) + '" y="-24" width="11" height="24" fill="' + (i % 2 ? "#FFFFFE" : "#FF8F6B") + '"/>';
    for (i = 0; i < 8; i++) {
      c = i % 2 ? "#FFFFFE" : "#E5483A";
      s += '<path d="M' + (-48 + i * 12) + " -74 H" + (-36 + i * 12) + " V-58 Q" + (-42 + i * 12) + " -52 " + (-48 + i * 12) + ' -58Z" ' + f(c, 1.6) + "/>";
    }
    if (o.t) s += '<rect x="-34" y="-50" width="68" height="14" rx="3" ' + f("#FFF6E0", 1.8) + '/><text x="0" y="-39.6" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="10" fill="#E5483A">' + o.t + "</text>";
    return s;
  };
  // a red post box on a post, with a slot
  KITS.mailbox = function (o) {
    return '<rect x="-3" y="-24" width="6" height="24" ' + f("#8A97AD", 1.6) + '/><path d="M-15 -26 V-52 Q-15 -68 0 -68 Q15 -68 15 -52 V-26Z" ' + f("#E5483A", 2.4) + '/><rect x="-10" y="-52" width="20" height="4.4" rx="2.2" fill="#8E2A22"/><rect x="-8" y="-38" width="16" height="6" rx="2" ' + f("#FFD23F", 1.4) + '/><path d="M-9 -60 Q-9 -64 -4 -64" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>';
  };
  // a wooden sign on a post with words on it (o.t)
  KITS.woodsign = function (o) {
    return '<rect x="-3" y="-44" width="6" height="44" ' + f("#8A5A2B", 1.8) + '/><rect x="-26" y="-64" width="52" height="24" rx="4" ' + f("#E8B66E", 2.4) + '/><text x="0" y="-47" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="13" fill="#8A3A1E">' + (o.t || "") + "</text>";
  };

  // a big sneaker seen from the side with a bow in the laces (o.c = colour)
  KITS.shoebig = function (o) {
    var c = o.c || "#E5483A";
    return '<path d="M-38 0 H38 Q43 -2 41 -9 H-38 Q-42 -5 -38 0Z" ' + f("#FFFFFE", 2.4) + '/><path d="M-36 -9 L-36 -34 Q-36 -42 -26 -42 L-8 -42 Q2 -30 14 -25 Q32 -22 39 -12 Q41 -9 38 -9Z" ' + f(c, 2.4) + '/><path d="M-36 -22 H-14 Q-10 -14 -2 -9" fill="none" stroke="' + dk(c, 0.3) + '" stroke-width="2"/>' +
      '<path d="M-8 -36 L6 -28 M-4 -41 L12 -30 M2 -39 L16 -29" stroke="#FFFFFE" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="2" cy="-24" rx="9" ry="5" transform="rotate(-30 2 -24)" ' + f("#FFFFFE", 1.8) + '/><ellipse cx="14" cy="-27" rx="9" ry="5" transform="rotate(24 14 -27)" ' + f("#FFFFFE", 1.8) + '/><circle cx="8" cy="-26" r="3.6" ' + f("#E8EEF8", 1.6) + '/><path d="M8 -24 L2 -12 M8 -24 L16 -12" stroke="#FFFFFE" stroke-width="2.6" stroke-linecap="round"/>';
  };


  /* ------------------------------------------------------------------ new things: kelp forest */
  // a thing drawn turned (kind, x, y, scale, angle)
  function atr(kind, x, y, s, rot, o) {
    return '<g transform="translate(' + x + "," + y + ") rotate(" + rot + ") scale(" + s + ')">' + K[kind](o || {}) + "</g>";
  }
  // a big smiling face for the parts of the face (the bottom of the chin is the origin); o.hl = mouth, nose or ears circles that part in red,
  // o.open = the mouth is open
  KITS.facebig = function (o) {
    var skin = "#FFD7B5", hl = o.hl || "", s = "";
    function ring(cx, cy, rx, ry) {
      return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="#E5483A" stroke-width="3.4" stroke-dasharray="6 4"/>';
    }
    s += '<ellipse cx="0" cy="-44" rx="38" ry="40" ' + f("#6B4423", 2) + "/>";
    s += '<ellipse cx="-36" cy="-36" rx="7" ry="10" ' + f(skin, 2.2) + '/><ellipse cx="36" cy="-36" rx="7" ry="10" ' + f(skin, 2.2) + '/><path d="M-37 -40 Q-34 -34 -37 -30 M37 -40 Q34 -34 37 -30" fill="none" stroke="#E0A67C" stroke-width="1.8" stroke-linecap="round"/>';
    s += '<ellipse cx="0" cy="-34" rx="33" ry="36" ' + f(skin, 2.4) + "/>";
    s += path("M-33 -48 Q-30 -76 0 -76 Q30 -76 33 -48 Q16 -60 0 -56 Q-16 -60 -33 -48Z", "#6B4423", 2);
    s += '<ellipse cx="-12" cy="-40" rx="3.6" ry="4.6" fill="' + INK + '"/><ellipse cx="12" cy="-40" rx="3.6" ry="4.6" fill="' + INK + '"/><circle cx="-10.8" cy="-41.6" r="1.4" fill="#fff"/><circle cx="13.2" cy="-41.6" r="1.4" fill="#fff"/>';
    s += '<circle cx="-23" cy="-27" r="5" fill="#FF9DB5" opacity=".6"/><circle cx="23" cy="-27" r="5" fill="#FF9DB5" opacity=".6"/>';
    s += '<ellipse cx="0" cy="-30" rx="6" ry="5" fill="#F2B48C" stroke="#C98A60" stroke-width="1.8"/><circle cx="-2.3" cy="-28.6" r="1.1" fill="#8A5A3A"/><circle cx="2.3" cy="-28.6" r="1.1" fill="#8A5A3A"/>';
    if (o.open) s += '<ellipse cx="0" cy="-14" rx="11" ry="9" fill="#C0392B" stroke="#8E2A22" stroke-width="2"/><path d="M-9 -19 H9 Q9 -16 5 -16 H-5 Q-9 -16 -9 -19Z" fill="#fff"/><ellipse cx="0" cy="-9" rx="6" ry="4" fill="#FF7A9C"/>';
    else s += '<path d="M-9 -16 Q0 -8 9 -16" fill="none" stroke="#B3442F" stroke-width="2.6" stroke-linecap="round"/>';
    if (hl === "mouth") s += ring(0, -14, 18, 14);
    if (hl === "nose") s += ring(0, -30, 12, 10);
    if (hl === "ears") s += ring(-36, -36, 11, 15) + ring(36, -36, 11, 15);
    return s;
  };
  // a bare foot seen from above with a bandage across it and little red marks for "ouch" (the heel is at the origin)
  KITS.bigfoot = function (o) {
    var skin = "#FFD7B5", s = '<path d="M-15 -4 Q-21 -22 -19 -40 Q-17 -52 -4 -54 Q14 -54 19 -40 Q21 -22 15 -4 Q0 6 -15 -4Z" ' + f(skin, 2.4) + "/>", T = [[-14, -57, 5], [-6, -62, 5.4], [3, -63, 5.6], [11, -60, 5], [17, -54, 4.4]], i;
    for (i = 0; i < T.length; i++) s += '<circle cx="' + T[i][0] + '" cy="' + T[i][1] + '" r="' + T[i][2] + '" ' + f(skin, 1.8) + "/>";
    s += atr("bandaid", 0, -30, 1.15, -80);
    s += '<path d="M-30 -48 L-24 -44 M-32 -34 L-25 -34 M-30 -20 L-24 -24 M30 -50 L24 -45 M32 -34 L25 -34 M30 -20 L24 -24" stroke="#E5483A" stroke-width="2.8" stroke-linecap="round"/>';
    return s;
  };
  // a magnifying glass over skin: the lens (with skin and fine lines in it) is at the origin, the handle goes down to the right
  KITS.zoomskin = function (o) {
    return '<path d="M20 20 L38 38" stroke="#6A48E8" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="0" r="30" fill="#FFD7B5" stroke="#6A48E8" stroke-width="5"/>' +
      '<path d="M-18 -10 q5 -3 10 0 M-2 -18 q5 -3 10 0 M8 -6 q5 -3 10 0 M-14 6 q5 -3 10 0 M2 8 q5 -3 10 0 M-6 -4 q4 -2 8 0 M12 10 q5 -3 9 0" fill="none" stroke="#E8B58A" stroke-width="1.8" stroke-linecap="round"/><circle cx="-10" cy="-20" r="1.3" fill="#E0A67C"/><circle cx="14" cy="-14" r="1.3" fill="#E0A67C"/><circle cx="-20" cy="6" r="1.3" fill="#E0A67C"/><circle cx="18" cy="2" r="1.3" fill="#E0A67C"/><circle cx="-2" cy="16" r="1.3" fill="#E0A67C"/>' +
      '<path d="M-22 -12 Q-16 -24 -4 -26" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>';
  };
  // a bone, and a pile of bones
  KITS.bone = function (o) {
    return ln(-13, 0, 13, 0, 6, "#FFFEF2") + '<circle cx="-16" cy="-3.6" r="4.4" ' + f("#FFFEF2", 1.8) + '/><circle cx="-16" cy="3.6" r="4.4" ' + f("#FFFEF2", 1.8) + '/><circle cx="16" cy="-3.6" r="4.4" ' + f("#FFFEF2", 1.8) + '/><circle cx="16" cy="3.6" r="4.4" ' + f("#FFFEF2", 1.8) + "/>";
  };
  KITS.bonepile = function (o) {
    return atr("bone", -6, -6, 1.3, -8) + atr("bone", 12, -7, 1.3, 14) + atr("bone", 0, -19, 1.3, -22) + atr("bone", -22, -14, 1.2, 40);
  };


  /* ------------------------------------------------------------------ new things: sunken ship (people, places and tools) */
  // a poster on a post: "LOST" in red with a hat on it
  KITS.lostposter = function (o) {
    return '<rect x="-3" y="-96" width="6" height="96" ' + f("#8A5A2B", 1.8) + '/><path d="M-27 -92 H27 V-42 H-27Z" ' + f("#FFFFFE", 2.4) + '/><rect x="-9" y="-96" width="18" height="6" rx="2" fill="#FFE066" opacity=".9"/><text x="0" y="-74" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="18" fill="#E5483A">LOST</text>' + at("hat", 0, -48, 0.95, { c: "#3D8BF2" });
  };
  // a gold key with a round head
  KITS.keybig = function (o) {
    var c = "#FFD23F";
    return '<circle cx="-16" cy="-12" r="10" ' + f(c, 2.4) + '/><circle cx="-16" cy="-12" r="4" fill="#fff" stroke="' + dk(c) + '" stroke-width="1.6"/><rect x="-7" y="-15" width="38" height="6" rx="3" ' + f(c, 2) + '/><rect x="21" y="-9" width="5" height="10" rx="1.6" ' + f(c, 1.6) + '/><rect x="12" y="-9" width="4.4" height="7" rx="1.6" ' + f(c, 1.6) + "/>";
  };
  // a radio: a box with a round speaker, a dial, two knobs, a handle and an aerial (o.c = colour)
  KITS.radio = function (o) {
    var c = o.c || "#FF9F5A", s = "", i;
    s += '<path d="M-20 -46 L16 -70" stroke="#5A6578" stroke-width="2.6" stroke-linecap="round"/><circle cx="16" cy="-70" r="2.8" fill="#5A6578"/><path d="M-22 -46 Q-22 -58 -10 -58 H10 Q22 -58 22 -46" fill="none" stroke="#5A6578" stroke-width="3.4" stroke-linecap="round"/>';
    s += '<rect x="-34" y="-46" width="68" height="46" rx="9" ' + f(c, 2.4) + '/><circle cx="-14" cy="-22" r="15" ' + f("#FFF3E0", 2) + '/>';
    for (i = 0; i < 3; i++) s += '<circle cx="-14" cy="-22" r="' + (4 + i * 4) + '" fill="none" stroke="#C9A88A" stroke-width="1.4"/>';
    s += '<rect x="6" y="-38" width="22" height="10" rx="3" fill="#2B3350"/><path d="M10 -33 H24" stroke="#FFD23F" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="-16" r="4.4" ' + f("#E5483A", 1.4) + '/><circle cx="24" cy="-16" r="4.4" ' + f("#FFD23F", 1.4) + "/>";
    return s;
  };
  // a toolbox with a handle and a latch
  KITS.toolbox = function (o) {
    return '<path d="M-16 -30 Q-16 -46 0 -46 Q16 -46 16 -30" fill="none" stroke="#5A6578" stroke-width="4" stroke-linecap="round"/><rect x="-34" y="-30" width="68" height="30" rx="5" ' + f("#E5483A", 2.4) + '/><path d="M-34 -18 H34" stroke="' + dk("#E5483A", 0.3) + '" stroke-width="2.4"/><rect x="-6" y="-24" width="12" height="9" rx="2" ' + f("#FFD23F", 1.6) + '/><path d="M-28 -26 H-18" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>';
  };
  // a wrench (the head with the open jaw is on the right)
  KITS.wrench = function (o) {
    return '<path d="M-26 -3.5 H12 L16 -10 H32 V-3.5 H23 V3.5 H32 V10 H16 L12 3.5 H-26Z" ' + f("#B8C4D8", 2) + '/><circle cx="-22" cy="0" r="1.8" fill="#6A7A94"/>';
  };
  // a saw: a wooden handle on the left and a toothed blade
  KITS.saw = function (o) {
    var s = '<path d="M-4 -7 H38 L38 7 H-4Z" ' + f("#C9D4E6", 2) + '/><path d="M-4 7 L0 11 L4 7 L8 11 L12 7 L16 11 L20 7 L24 11 L28 7 L32 11 L36 7 L38 7Z" fill="#9AA6BC" stroke="#6A7A94" stroke-width="1"/>';
    return s + '<rect x="-26" y="-9" width="22" height="18" rx="6" ' + f("#C98B4A", 2) + '/><rect x="-20" y="-3" width="10" height="6" rx="3" fill="#8A5A2B"/>';
  };
  // a truck: a white box on the back and a coloured cab with a window (o.c = cab colour)
  KITS.truck = function (o) {
    var c = o.c || "#3D8BF2";
    return '<rect x="-50" y="-58" width="64" height="42" rx="4" ' + f("#F2F5FA", 2.4) + '/><path d="M-44 -46 H8 M-44 -36 H8" stroke="' + c + '" stroke-width="3.4" stroke-linecap="round"/><path d="M14 -44 H34 L48 -28 V-16 H14Z" ' + f(c, 2.4) + '/><path d="M20 -39 H32 L41 -29 H20Z" fill="#CFEAFF" stroke="' + dk(c) + '" stroke-width="1.6"/><rect x="-52" y="-18" width="102" height="5" rx="2" ' + f("#5A6578", 1.6) + '/><circle cx="-30" cy="-10" r="10" ' + f("#3A3F4D", 2) + '/><circle cx="-30" cy="-10" r="4" fill="#C9D4E6"/><circle cx="28" cy="-10" r="10" ' + f("#3A3F4D", 2) + '/><circle cx="28" cy="-10" r="4" fill="#C9D4E6"/><rect x="46" y="-26" width="4" height="5" rx="1.4" fill="#FFE066"/>';
  };
  // a railway track in side view: sleepers and a rail (o.w = width, the top of the rail is at -9)
  KITS.rails = function (o) {
    var w = o.w || 240, s = "", x;
    for (x = -w / 2 + 6; x < w / 2; x += 14) s += '<rect x="' + x + '" y="-4" width="8" height="7" rx="1.5" fill="#8A5A2B"/>';
    return s + '<rect x="' + -w / 2 + '" y="-9" width="' + w + '" height="5" rx="1" fill="#9AA6BC" stroke="#5A6578" stroke-width="1.2"/>';
  };
  // a bank: steps, four columns, a name board and a three-cornered top with a coin on it
  KITS.bankb = function (o) {
    var s = '<rect x="-56" y="-6" width="112" height="6" ' + f("#C9D4E6", 2) + '/><rect x="-50" y="-12" width="100" height="6" ' + f("#D8E0EE", 2) + "/>", i;
    s += '<rect x="-46" y="-56" width="92" height="44" fill="#F4EBD8"/><rect x="-9" y="-40" width="18" height="28" rx="2" fill="#5A4A3A"/><circle cx="5" cy="-26" r="1.6" fill="#FFD23F"/>';
    for (i = 0; i < 4; i++) s += '<rect x="' + (-44 + i * 28) + '" y="-56" width="9" height="44" ' + f("#FFFFFE", 1.8) + "/>";
    s += '<rect x="-52" y="-68" width="104" height="14" ' + f("#3A4660", 2) + '/><text x="0" y="-57.4" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="11" fill="#FFFFFE">BANK</text>';
    s += '<path d="M-56 -68 L0 -94 L56 -68Z" ' + f("#E8EEF8", 2.2) + '/><circle cx="0" cy="-76" r="7.4" ' + f("#FFD23F", 1.8) + '/>';
    return s;
  };
  // a little shop: a striped awning, a window with a hat and a cake in it, a door and a sign
  KITS.shopfront = function (o) {
    var s = '<rect x="-50" y="-60" width="100" height="60" ' + f("#F8E7C9", 2.4) + "/>", i;
    for (i = 0; i < 8; i++) s += '<path d="M' + (-52 + i * 13) + " -72 H" + (-39 + i * 13) + " V-56 Q" + (-45.5 + i * 13) + " -48 " + (-52 + i * 13) + ' -56Z" ' + f(i % 2 ? "#FFFFFE" : "#3D8BF2", 1.6) + "/>";
    s += '<rect x="-42" y="-44" width="46" height="36" rx="3" ' + f("#CFEAFF", 2) + '/><rect x="-38" y="-18" width="38" height="4" fill="#C48A52"/>' + at("hat", -26, -18, 0.55, { c: "#E5483A" }) + at("cake", -8, -18, 0.42);
    s += '<rect x="12" y="-46" width="28" height="46" rx="3" ' + f("#A8713A", 2.2) + '/><circle cx="18" cy="-22" r="2.2" fill="#FFD23F"/><rect x="14" y="-40" width="24" height="18" rx="2" fill="#CFEAFF" opacity=".85"/>';
    s += '<rect x="-52" y="-86" width="104" height="14" rx="3" ' + f("#FFD23F", 2) + '/><text x="0" y="-75.6" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="11" fill="#8A3A1E">SHOP</text>';
    return s;
  };
  // a stethoscope worn on a person: draw it with the same x, y and scale as the person, after the person
  KITS.stetho = function (o) {
    return '<path d="M-8 -43 Q-9 -28 0 -26 Q9 -28 8 -43" fill="none" stroke="#3A3F4D" stroke-width="2.6" stroke-linecap="round"/><circle cx="0" cy="-24" r="4.4" ' + f("#B8C4D8", 1.6) + "/>";
  };
  // a white sign with a red cross on it, on a post
  KITS.redcross = function (o) {
    return '<rect x="-2.5" y="-30" width="5" height="30" fill="#8A97AD"/><rect x="-22" y="-74" width="44" height="44" rx="6" ' + f("#FFFFFE", 2.6) + '/><path d="M-5 -66 H5 V-56 H15 V-46 H5 V-36 H-5 V-46 H-15 V-56 H-5Z" ' + f("#E5483A", 1.8) + "/>";
  };
  // a church: a hall with a roof, a tower with a bell in it and a golden cross, a big door and two windows
  KITS.churchb = function (o) {
    var s = '<rect x="-44" y="-40" width="60" height="40" ' + f("#F4EBD8", 2.4) + '/><path d="M-48 -40 L-14 -62 L20 -40Z" ' + f("#B5503D", 2.4) + '/><rect x="8" y="-86" width="30" height="86" ' + f("#E8DDC4", 2.4) + '/>';
    s += '<path d="M6 -86 L23 -112 L40 -86Z" ' + f("#B5503D", 2.4) + '/><path d="M23 -112 V-124 M18 -119 H28" stroke="#FFD23F" stroke-width="3" stroke-linecap="round"/>';
    s += '<path d="M14 -74 V-58 Q14 -66 23 -66 Q32 -66 32 -58 V-74Q32 -82 23 -82 Q14 -82 14 -74Z" fill="#3A3F4D"/><path d="M18 -70 H28 L26 -62 H20Z" ' + f("#FFD23F", 1.2) + '/>';
    s += '<path d="M-6 0 V-20 Q-6 -30 3 -30 Q12 -30 12 -20 V0Z" ' + f("#8A5A2B", 2) + '/><path d="M-36 -18 V-30 Q-36 -36 -30 -36 Q-24 -36 -24 -30 V-18Z" fill="#9AD0F0" stroke="#6A8FD8" stroke-width="1.6"/><path d="M-38 -10 Q-30 -6 -22 -10" fill="none" stroke="#C9B28A" stroke-width="2"/>';
    return s;
  };
  // a shopping mall: a long building with glass fronts, a doorway and a big name board with flags
  KITS.mallb = function (o) {
    var s = '<rect x="-64" y="-54" width="128" height="54" ' + f("#E4E8F4", 2.4) + '/><rect x="-60" y="-46" width="40" height="34" rx="2" ' + f("#9AD0F0", 1.8) + '/><rect x="20" y="-46" width="40" height="34" rx="2" ' + f("#9AD0F0", 1.8) + '/><path d="M-50 -44 L-40 -14 M-36 -44 L-26 -14 M30 -44 L40 -14 M44 -44 L54 -14" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>';
    s += '<rect x="-16" y="-40" width="32" height="40" rx="3" ' + f("#7BB8E8", 2) + '/><path d="M0 -40 V0" stroke="#5A8FC0" stroke-width="2"/><rect x="-46" y="-76" width="92" height="22" rx="4" ' + f("#E5483A", 2.2) + '/><text x="0" y="-60" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="17" fill="#FFFFFE">MALL</text>';
    s += '<path d="M-52 -54 V-84 M52 -54 V-84" stroke="#8A97AD" stroke-width="2.6"/><path d="M-52 -84 L-38 -79 L-52 -74Z" fill="#FFD23F"/><path d="M52 -84 L66 -79 L52 -74Z" fill="#35B779"/>';
    return s;
  };
  // a park bench
  KITS.bench = function (o) {
    return '<rect x="-30" y="-20" width="5" height="20" ' + f("#8A5A2B", 1.6) + '/><rect x="25" y="-20" width="5" height="20" ' + f("#8A5A2B", 1.6) + '/><rect x="-34" y="-28" width="68" height="7" rx="2" ' + f("#C98B4A", 2) + '/><rect x="-34" y="-48" width="68" height="6" rx="2" ' + f("#C98B4A", 2) + '/><rect x="-34" y="-40" width="68" height="6" rx="2" ' + f("#C98B4A", 2) + '/><rect x="-30" y="-48" width="4" height="22" fill="#8A5A2B"/><rect x="26" y="-48" width="4" height="22" fill="#8A5A2B"/>';
  };
  // a score board on two posts: o.a and o.b are the two scores
  KITS.scoreboard = function (o) {
    return '<rect x="-30" y="-40" width="6" height="40" fill="#8A97AD"/><rect x="24" y="-40" width="6" height="40" fill="#8A97AD"/><rect x="-46" y="-86" width="92" height="50" rx="6" ' + f("#2F6B4A", 2.8) + '/><rect x="-40" y="-80" width="80" height="38" rx="3" fill="#1E3A2C"/><text x="-20" y="-64" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="7" fill="#9AD0B0">US</text><text x="20" y="-64" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="7" fill="#9AD0B0">THEM</text><text x="-20" y="-46" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="22" fill="#FFE066">' + o.a + '</text><text x="20" y="-46" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="22" fill="#FF8F6B">' + o.b + "</text>";
  };
  // a crowd of children in two rows, cheering (colours and poses differ)
  function crowdItems() {
    var sh = ["#E5483A", "#3D8BF2", "#35B779", "#FFC93C", "#8B6BE8", "#FF8FB1"], po = ["wave", "cheer", "jump", "stand", "cheer", "wave", "stand"], out = [], i;
    for (i = 0; i < 7; i++) out.push(["kid", 22 + i * 33, G - 12, 0.82, { pose: po[i], shirt: sh[(i + 2) % 6], girl: i % 2 === 1, hair: i % 3 ? "#6B4423" : "#2A1E16", mouth: "open" }]);
    for (i = 0; i < 6; i++) out.push(["kid", 38 + i * 36, G + 6, 0.95, { pose: po[(i + 3) % 7], shirt: sh[i % 6], girl: i % 2 === 0, hair: i % 3 ? "#2A1E16" : "#8A5A2B", mouth: "open" }]);
    return out;
  }
  // an engine inside a round "zoom" frame (the middle of the frame is the origin)
  KITS.engine = function (o) {
    var s = '<circle cx="0" cy="0" r="42" fill="#FFFFFE" stroke="#6A48E8" stroke-width="4"/>', i;
    s += '<path d="M-22 -14 Q-22 -30 -6 -30 H8" fill="none" stroke="#C4533F" stroke-width="5" stroke-linecap="round"/>';
    s += '<rect x="-30" y="-6" width="52" height="28" rx="5" ' + f("#7B8BA8", 2.2) + '/>';
    for (i = 0; i < 4; i++) s += '<rect x="' + (-26 + i * 12.5) + '" y="-17" width="9" height="12" rx="2" ' + f("#B8C4D8", 1.6) + '/><rect x="' + (-23 + i * 12.5) + '" y="-22" width="3" height="5" rx="1" fill="#E5483A"/>';
    s += '<path d="M-24 4 H16 M-24 12 H16" stroke="#5A6578" stroke-width="1.8"/><circle cx="29" cy="10" r="10" ' + f("#5A6578", 2) + '/><circle cx="29" cy="10" r="3.6" fill="#C9D4E6"/><path d="M22 2 L22 18" stroke="#3A3F4D" stroke-width="2"/>';
    s += '<rect x="-30" y="22" width="30" height="6" rx="2" ' + f("#3A3F4D", 1.6) + '/><path d="M-12 -2 L-4 -2 L-9 8Z" fill="#FFD23F"/>';
    return s;
  };

  // a price tag on a little stand (o.t = the price)
  KITS.price = function (o) {
    return '<rect x="-1.6" y="-22" width="3.2" height="22" fill="#8A97AD"/><path d="M-30 -58 H20 L32 -42 L20 -26 H-30Z" ' + f("#FFFEF4", 2.4) + '/><circle cx="-22" cy="-42" r="3.2" fill="#C9D4E6" stroke="#8A97AD" stroke-width="1.4"/><text x="4" y="-36.4" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="17" fill="#E5483A">' + (o.t || "") + "</text>";
  };


  /* ------------------------------------------------------------------ new things: whale song (describing words) */
  // sound waves: three curved lines going out to the left (o.c = colour)
  KITS.sounds = function (o) {
    return '<path d="M0 -14 Q-9 0 0 14 M-10 -22 Q-25 0 -10 22 M-20 -30 Q-41 0 -20 30" fill="none" stroke="' + (o.c || "#E5483A") + '" stroke-width="3.4" stroke-linecap="round"/>';
  };
  // a strange fish: three eyes, spikes, spots, a glowing lantern on a stalk and a jagged mouth (faces right)
  KITS.weirdfish = function (o) {
    var c = "#8B6BE8", s = '<path d="M-26 0 L-46 -18 L-43 0 L-46 18Z" ' + f("#FF8FB1", 2) + "/>";
    s += '<path d="M-12 -17 L-8 -32 L-2 -19 L4 -34 L9 -18 L16 -30 L18 -14Z" ' + f("#FF8FB1", 1.8) + '/><path d="M8 -19 Q20 -44 34 -42" fill="none" stroke="' + dk(c, 0.3) + '" stroke-width="2.4" stroke-linecap="round"/><circle cx="34" cy="-42" r="12" fill="#FFF3A0" opacity=".45"/><circle cx="34" cy="-42" r="6.4" ' + f("#FFE066", 1.8) + "/>";
    s += '<ellipse cx="0" cy="0" rx="31" ry="21" ' + f(c, 2.4) + '/><path d="M-18 8 Q0 20 18 8" fill="none" stroke="' + dk(c, 0.3) + '" stroke-width="2"/><circle cx="-14" cy="-6" r="3.6" fill="#FFE066"/><circle cx="-6" cy="8" r="4" fill="#FFE066"/><circle cx="-18" cy="6" r="2.6" fill="#FFE066"/>';
    s += '<circle cx="14" cy="-8" r="6" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><circle cx="26" cy="-4" r="5" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><circle cx="3" cy="-11" r="4.4" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/>';
    s += '<circle cx="15.4" cy="-8" r="2.6" fill="' + INK + '"/><circle cx="27" cy="-4" r="2.2" fill="' + INK + '"/><circle cx="4" cy="-11" r="2" fill="' + INK + '"/><path d="M16 10 L20 6 L24 11 L28 6 L32 11 L35 7" fill="none" stroke="#FFFFFE" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
    return s;
  };
  // a child hiding under a blanket: only the wide eyes and the hands holding the blanket show (o.c = blanket colour)
  KITS.hider = function (o) {
    var b = o.c || "#7FB8F2", skin = "#FFD7B5";
    return '<circle cx="0" cy="-34" r="12" ' + f(skin, 2.2) + '/><path d="M-13 -39 Q0 -56 13 -39 Q6 -42 0 -47 Q-6 -42 -13 -39Z" fill="#6B4423" stroke="#4A2E16" stroke-width="1.4"/>' +
      '<circle cx="-4.6" cy="-34" r="3.8" fill="#fff" stroke="' + INK + '" stroke-width="1.2"/><circle cx="4.6" cy="-34" r="3.8" fill="#fff" stroke="' + INK + '" stroke-width="1.2"/><circle cx="-4.2" cy="-33.4" r="1.6" fill="' + INK + '"/><circle cx="5" cy="-33.4" r="1.6" fill="' + INK + '"/>' +
      '<path d="M-28 0 V-22 Q-28 -30 -14 -27 Q0 -22 14 -27 Q28 -30 28 -22 V0Z" ' + f(b, 2.4) + '/><circle cx="-14" cy="-26" r="4.4" ' + f(skin, 1.8) + '/><circle cx="14" cy="-26" r="4.4" ' + f(skin, 1.8) + "/>";
  };
  // a scary shadow on the wall: dark, with horns, glowing eyes, arms and a jagged mouth
  KITS.shadowmon = function (o) {
    var c = "#161D40";
    return '<path d="M-22 0 Q-28 -30 -14 -48 L-22 -66 L-8 -54 Q0 -58 8 -54 L22 -66 L14 -48 Q28 -30 22 0Z" fill="' + c + '"/><path d="M-20 -24 Q-38 -30 -42 -46 M20 -24 Q38 -30 42 -46" fill="none" stroke="' + c + '" stroke-width="7" stroke-linecap="round"/><circle cx="-7" cy="-40" r="3.6" fill="#FFE066"/><circle cx="7" cy="-40" r="3.6" fill="#FFE066"/><path d="M-9 -28 L-5 -32 L-1 -28 L3 -32 L7 -28 L10 -31" fill="none" stroke="#FFE066" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  };
  // a book lying flat, seen a little from above and from the front: the cover (with a title and a star) on top, the pages and the two covers
  // along the front and the right-hand side (o.th = how thick it is, o.c = cover colour); o.hl puts a bracket at the right that shows its thickness
  KITS.bookflat = function (o) {
    var th = o.th || 20, c = o.c || "#3D8BF2", w = 52, dx = 14, dy = 8, s = "", i, n = Math.max(1, Math.floor(th / 5));
    // the right-hand side
    s += '<path d="M' + w / 2 + " 0 L" + (w / 2 + dx) + " " + -dy + " L" + (w / 2 + dx) + " " + (-th - dy) + " L" + w / 2 + " " + -th + 'Z" ' + f("#FFF6E0", 1.8) + "/>";
    // the front (the edge of the pages) with a cover at the bottom and one at the top
    s += '<rect x="' + -w / 2 + '" y="' + -th + '" width="' + w + '" height="' + th + '" ' + f("#FFF6E0", 1.8) + "/>";
    for (i = 1; i <= n; i++) s += '<path d="M' + (-w / 2 + 3) + " " + (-th + (i * th) / (n + 1)) + " H" + (w / 2 - 3) + '" stroke="#E0CFA6" stroke-width="1.2"/>';
    s += '<rect x="' + -w / 2 + '" y="-3" width="' + w + '" height="3" fill="' + dk(c, 0.2) + '"/><path d="M' + w / 2 + " -3 L" + (w / 2 + dx) + " " + (-3 - dy) + " L" + (w / 2 + dx) + " " + -dy + " L" + w / 2 + ' 0Z" fill="' + dk(c, 0.3) + '"/>';
    // the cover on top
    s += '<path d="M' + -w / 2 + " " + -th + " L" + (-w / 2 + dx) + " " + (-th - dy) + " L" + (w / 2 + dx) + " " + (-th - dy) + " L" + w / 2 + " " + -th + 'Z" ' + f(c, 2.2) + "/>";
    s += '<path d="M' + (-w / 2 + 5) + " " + (-th - 1.2) + " L" + (-w / 2 + dx + 4) + " " + (-th - dy + 1.4) + " L" + (w / 2 + dx - 4) + " " + (-th - dy + 1.4) + " L" + (w / 2 - 5) + " " + (-th - 1.2) + 'Z" fill="none" stroke="#FFD23F" stroke-width="1.4"/>';
    s += '<rect x="' + (-w / 2 + dx / 2 + 8) + '" y="' + (-th - dy / 2 - 1.6) + '" width="' + (w - 22) + '" height="3.2" rx="1.6" fill="#FFF6E0"/><circle cx="' + (dx / 2 + 1) + '" cy="' + (-th - dy / 2 + 2.4) + '" r="1.6" fill="#FFD23F"/>';
    s += '<path d="M' + -w / 2 + " " + -th + ' V0" stroke="' + dk(c, 0.3) + '" stroke-width="2.4"/>';
    if (o.hl) s += '<path d="M' + (w / 2 + dx + 3) + " " + (-th - dy) + " H" + (w / 2 + dx + 9) + " V" + -dy + " H" + (w / 2 + dx + 3) + '" fill="none" stroke="#6A48E8" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>';
    return s;
  };
  // a dead tree: grey-brown, bare, crooked, with a hollow
  KITS.deadtree = function (o) {
    var c = "#6B5A4A";
    return ln(0, 0, 2, -46, 11, c) + ln(2, -40, -26, -70, 6, c) + ln(2, -46, 6, -80, 6, c) + ln(2, -40, 28, -62, 6, c) + ln(-26, -70, -40, -82, 4, c) + ln(-26, -70, -20, -92, 4, c) + ln(28, -62, 42, -64, 4, c) + ln(28, -62, 34, -84, 4, c) + '<ellipse cx="1" cy="-20" rx="4.8" ry="8" fill="#3A2E24"/>';
  };
  // a bad apple: brown, spotted, with a worm coming out of a hole, green smell lines and two flies
  KITS.badapple = function (o) {
    var s = at("apple", 0, 0, 1.0, { c: "#9A7B45" });
    s += '<circle cx="-9" cy="-12" r="3.4" fill="#5E4426"/><circle cx="-2" cy="-5" r="2.6" fill="#5E4426"/><circle cx="12" cy="-16" r="2.4" fill="#5E4426"/><path d="M-14 -8 Q-8 -4 -12 0" fill="none" stroke="#8BC34A" stroke-width="3" stroke-linecap="round"/>';
    s += '<circle cx="8" cy="-8" r="3.4" fill="#2B1E16"/><path d="M8 -8 Q16 -16 22 -9" fill="none" stroke="#8BC34A" stroke-width="3.6" stroke-linecap="round"/><circle cx="22" cy="-9" r="3" fill="#8BC34A"/><circle cx="23" cy="-10" r="0.9" fill="' + INK + '"/>';
    s += '<path d="M-10 -34 Q-14 -40 -10 -46 M0 -36 Q-4 -42 0 -48 M10 -34 Q6 -40 10 -46" fill="none" stroke="#8BC34A" stroke-width="2.2" stroke-linecap="round"/>';
    s += '<circle cx="-24" cy="-36" r="2.6" fill="#3A3F4D"/><ellipse cx="-27" cy="-39" rx="3" ry="1.6" fill="#DDF1FF" opacity=".8"/><circle cx="28" cy="-30" r="2.6" fill="#3A3F4D"/><ellipse cx="31" cy="-33" rx="3" ry="1.6" fill="#DDF1FF" opacity=".8"/>';
    return s;
  };
  // a camera on a tripod
  KITS.cameratri = function (o) {
    return ln(0, -42, -18, 0, 3, "#5A6578") + ln(0, -42, 18, 0, 3, "#5A6578") + ln(0, -42, 0, 0, 3, "#5A6578") + '<rect x="-18" y="-66" width="36" height="26" rx="4" ' + f("#3A4660", 2.2) + '/><circle cx="0" cy="-53" r="9" ' + f("#8FD0F2", 1.8) + '/><circle cx="0" cy="-53" r="3.6" fill="' + INK + '"/><rect x="-14" y="-72" width="12" height="7" rx="2" ' + f("#FFE066", 1.4) + "/>";
  };
  // steam going up: three wavy lines
  KITS.steam = function (o) {
    return '<path d="M-10 0 Q-16 -8 -10 -16 Q-4 -24 -10 -32 M0 0 Q-6 -8 0 -16 Q6 -24 0 -32 M10 0 Q4 -8 10 -16 Q16 -24 10 -32" fill="none" stroke="#C9D4E6" stroke-width="3.2" stroke-linecap="round"/>';
  };
  // a glass of cold water with three ice cubes and a straw
  KITS.icedrink = function (o) {
    return '<path d="M-14 -34 L-11 0 H11 L14 -34Z" fill="#E4F4FF" fill-opacity=".9" stroke="#8FB5D6" stroke-width="2.4" stroke-linejoin="round"/><path d="M-13 -26 L-11 -2 H11 L13 -26Q0 -22 -13 -26Z" fill="#8FD0F2" opacity=".9"/>' +
      '<path d="M5 -18 L13 -48" stroke="#FFFFFE" stroke-width="4.6" stroke-linecap="round"/><path d="M5 -18 L13 -48" stroke="#E5483A" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 4"/>' +
      '<rect x="-9" y="-24" width="9" height="9" rx="2" transform="rotate(-14 -4 -20)" fill="#F4FBFF" stroke="#9FD0F0" stroke-width="1.6"/><rect x="0" y="-18" width="9" height="9" rx="2" transform="rotate(12 4 -14)" fill="#F4FBFF" stroke="#9FD0F0" stroke-width="1.6"/><rect x="-8" y="-12" width="8" height="8" rx="2" transform="rotate(8 -4 -8)" fill="#F4FBFF" stroke="#9FD0F0" stroke-width="1.6"/>';
  };
  // a balance with two pans, each holding o.n apples, level
  KITS.scales = function (o) {
    var n = o.n || 3, s = '<path d="M-20 0 H20 L9 -9 H-9Z" ' + f("#8A97AD", 2) + '/><rect x="-3" y="-72" width="6" height="64" ' + f("#B8C4D8", 1.8) + '/><rect x="-60" y="-76" width="120" height="6" rx="3" ' + f("#8A97AD", 2) + '/><circle cx="0" cy="-73" r="5.4" ' + f("#FFD23F", 1.6) + "/>", i, side, cx;
    for (side = -1; side <= 1; side += 2) {
      cx = side * 54;
      s += '<path d="M' + cx + " -73 L" + (cx - 14) + " -42 M" + cx + " -73 L" + (cx + 14) + ' -42" stroke="#8A97AD" stroke-width="1.8"/><path d="M' + (cx - 18) + " -42 H" + (cx + 18) + " Q" + (cx + 16) + " -33 " + cx + " -33 Q" + (cx - 16) + " -33 " + (cx - 18) + ' -42Z" ' + f("#FFD23F", 2) + "/>";
      for (i = 0; i < n; i++) s += at("apple", cx + (i - (n - 1) / 2) * 12, -41, 0.48, { c: "#E5483A" });
    }
    return s;
  };
  // a round cake with o.n candles on it
  KITS.candlecake = function (o) {
    var n = o.n || 7, s = '<rect x="-34" y="-26" width="68" height="26" rx="7" ' + f("#F7C99C", 2.4) + '/><path d="M-34 -18 Q-26 -10 -17 -18 Q-8 -10 0 -18 Q8 -10 17 -18 Q26 -10 34 -18 L34 -27 H-34Z" ' + f("#FFFFFE", 1.8) + "/>", i, x;
    for (i = 0; i < n; i++) {
      x = -28 + i * (56 / (n - 1));
      s += '<rect x="' + (x - 2) + '" y="-42" width="4" height="15" rx="1.6" ' + f(["#FF8FB1", "#6BB7FF", "#FFE066"][i % 3], 1.2) + '/><ellipse cx="' + x + '" cy="-46" rx="2.8" ry="4.4" fill="#FFA020"/><ellipse cx="' + x + '" cy="-45.4" rx="1.4" ry="2.6" fill="#FFE98A"/>';
    }
    return s;
  };
  // a round clock showing o.h o'clock (o.m minutes); the origin is below it
  KITS.clockat = function (o) {
    var hr = (o.h || 12) % 12, mn = o.m || 0, ah = (hr + mn / 60) * 30, am = mn * 6, s = '<circle cx="0" cy="-26" r="22" ' + f("#FFFFFE", 3) + "/>", i, a;
    for (i = 0; i < 12; i++) {
      a = (i * Math.PI) / 6;
      s += '<line x1="' + (Math.sin(a) * 17).toFixed(1) + '" y1="' + (-26 - Math.cos(a) * 17).toFixed(1) + '" x2="' + (Math.sin(a) * 20).toFixed(1) + '" y2="' + (-26 - Math.cos(a) * 20).toFixed(1) + '" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>';
    }
    s += '<g transform="rotate(' + ah + ' 0 -26)"><line x1="0" y1="-26" x2="0" y2="-37" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/></g><g transform="rotate(' + am + ' 0 -26)"><line x1="0" y1="-26" x2="0" y2="-43" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/></g><circle cx="0" cy="-26" r="2.4" fill="#E5483A"/>';
    return s;
  };
  // a standing mirror with a wooden frame; o.inner = things drawn in the glass (the reflection)
  KITS.mirror = function (o) {
    return '<rect x="-22" y="-8" width="44" height="8" rx="3" ' + f("#8A5A2B", 2) + '/><rect x="-4" y="-22" width="8" height="16" fill="#8A5A2B"/><path d="M-28 -20 V-88 Q-28 -106 0 -106 Q28 -106 28 -88 V-20Z" ' + f("#C98B4A", 3) + '/><path d="M-21 -26 V-86 Q-21 -98 0 -98 Q21 -98 21 -86 V-26Z" fill="#E4F3FF" stroke="#8FB5D6" stroke-width="1.6"/><path d="M-15 -34 L-4 -70 M-9 -30 L8 -76" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>' + render(o.inner || [], o.uid);
  };
  // a raised paw and a tongue on a sitting cat, drawn at the cat's own position and scale (the cat washes itself)
  KITS.pawup = function (o) {
    return '<ellipse cx="-9" cy="-29" rx="4.8" ry="7.4" transform="rotate(24 -9 -29)" ' + f(C.orange, 1.8) + '/><path d="M-3.4 -29.6 Q-4.6 -24 -1.4 -23.6 Q1.2 -24 0.4 -29.6Z" fill="#FF7A9C"/>';
  };
  // spilled milk on the floor
  KITS.milkspill = function (o) {
    return '<path d="M-36 0 Q-40 -9 -26 -9 Q-14 -15 0 -10 Q16 -14 28 -9 Q42 -8 36 0 Q20 5 0 4 Q-20 5 -36 0Z" ' + f("#FFFFFE", 2) + '/><ellipse cx="-8" cy="-3" rx="14" ry="2.6" fill="#E4EDF8"/><circle cx="-44" cy="-4" r="2.4" fill="#fff" stroke="#C9D4E6" stroke-width="1.2"/><circle cx="46" cy="-6" r="2" fill="#fff" stroke="#C9D4E6" stroke-width="1.2"/>';
  };
  // a big pencil lying on its side, pointing right (o.sharp = a sharp point, otherwise a blunt, rounded one)
  KITS.bigpencil = function (o) {
    var s = '<rect x="-54" y="-9" width="14" height="18" rx="3" ' + f("#FF8FB1", 2) + '/><rect x="-42" y="-9" width="8" height="18" ' + f("#C9D4E6", 1.6) + '/><rect x="-34" y="-9" width="64" height="18" ' + f("#FFD23F", 2.2) + '/><path d="M-34 -3 H30 M-34 3 H30" stroke="' + dk("#FFD23F", 0.25) + '" stroke-width="1.6" opacity=".8"/>';
    if (o.sharp) s += '<path d="M30 -9 L56 0 L30 9Z" ' + f("#F2D2A0", 2) + '/><path d="M47 -3.4 L58 0 L47 3.4Z" fill="#3A3F4D"/>';
    else s += '<path d="M30 -9 L46 -7 Q53 0 46 7 L30 9Z" ' + f("#F2D2A0", 2) + '/><path d="M44 -6 Q51 0 44 6Z" fill="#3A3F4D"/>';
    return s;
  };

  // a wooden desk seen from above, filling the lower part of the picture (in picture coordinates, draw it at 0,0)
  KITS.desktop = function (o) {
    var s = '<rect x="0" y="36" width="240" height="124" fill="#E0B27A"/><rect x="0" y="36" width="240" height="6" fill="#C48A52"/>', i;
    for (i = 0; i < 6; i++) s += '<path d="M0 ' + (62 + i * 18) + " Q60 " + (58 + i * 18) + " 120 " + (62 + i * 18) + " T240 " + (60 + i * 18) + '" fill="none" stroke="#CFA066" stroke-width="1.6" opacity=".7"/>';
    return s;
  };

  // a drinking glass of water: a tapering cup with a round rim, water in it with a surface, a shine and a few bubbles
  KITS.waterglass = function (o) {
    return '<path d="M-14 -36 L-11 -2 Q-11 0 -8 0 H8 Q11 0 11 -2 L14 -36Z" fill="#EAF6FF" fill-opacity=".92" stroke="#8FB5D6" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<path d="M-12.6 -26 L-10.4 -3 Q-10 -1.4 -8 -1.4 H8 Q10 -1.4 10.4 -3 L12.6 -26Z" fill="#6EC0F0"/><ellipse cx="0" cy="-26" rx="12.6" ry="2.8" fill="#9AD8F8" stroke="#5BA9E0" stroke-width="1.2"/>' +
      '<ellipse cx="0" cy="-36" rx="14" ry="3.6" fill="#F4FBFF" stroke="#8FB5D6" stroke-width="2.2"/><path d="M-8 -22 L-7 -7" stroke="#fff" stroke-width="2.8" stroke-linecap="round" opacity=".75"/>' +
      '<circle cx="3" cy="-14" r="1.6" fill="#fff" opacity=".8"/><circle cx="6" cy="-9" r="1.2" fill="#fff" opacity=".8"/><circle cx="1" cy="-6" r="1" fill="#fff" opacity=".8"/>';
  };

  // a small garden shovel (trowel): the top of the wooden handle is at the origin and the blade points down (rotate it to point it)
  KITS.trowel = function (o) {
    return '<rect x="-3" y="0" width="6" height="22" rx="3" ' + f("#C98B4A", 2) + '/><rect x="-1.8" y="22" width="3.6" height="6" fill="#8A97AD"/><path d="M0 28 L-7 38 Q0 46 7 38Z" ' + f("#B8C4D8", 2) + '/><path d="M0 31 V40" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>';
  };

  // a round "zoom" frame (centre at the origin) with a bare foot seen from the side in it: a bandage, a red scrape and a drop of blood on the foot
  KITS.footzoom = function (o) {
    var skin = "#FFD7B5";
    return '<circle cx="0" cy="0" r="34" fill="#FFF8EE" stroke="#6A48E8" stroke-width="4.4"/>' +
      '<path d="M-20 -26 L-20 6 Q-20 15 -9 15 H21 Q32 15 30 6 Q28 0 15 -1 Q4 -3 0 -13 L-4 -26Z" ' + f(skin, 2.2) + '/>' +
      '<circle cx="25" cy="13" r="3.4" ' + f(skin, 1.4) + '/><circle cx="29" cy="9" r="3.2" ' + f(skin, 1.4) + '/><circle cx="30" cy="4" r="3" ' + f(skin, 1.4) + '/>' +
      '<path d="M-3 -1 L7 4 M0 5 L10 2" fill="none" stroke="#D9382A" stroke-width="2.6" stroke-linecap="round"/><circle cx="4" cy="12" r="2.2" fill="#D9382A"/>' + atr("bandaid", 8, 4, 0.55, 12) +
      '<path d="M-27 -2 L-33 -4 M-26 8 L-32 10" stroke="#E5483A" stroke-width="2.4" stroke-linecap="round"/>';
  };

  // @@KITS_END

  /* ------------------------------------------------------------------ backgrounds */
  function bgBeach() {
    return '<rect width="240" height="160" fill="#CFEFFF"/><circle cx="206" cy="30" r="14" fill="#FFE98A"/><ellipse cx="54" cy="34" rx="22" ry="9" fill="#fff"/><circle cx="46" cy="29" r="9" fill="#fff"/><circle cx="62" cy="26" r="11" fill="#fff"/>' +
      '<rect y="92" width="240" height="22" fill="#6EC3F2"/><path d="M0 92 Q15 88 30 92 T60 92 T90 92 T120 92 T150 92 T180 92 T210 92 T240 92" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M0 114 Q60 104 120 112 Q180 120 240 108 L240 160 L0 160Z" fill="#F3DFA2"/><path d="M0 138 Q80 130 150 138 Q200 143 240 136 L240 160 L0 160Z" fill="#EBCB7F"/>';
  }
  function bgDeep() {
    var s = '<rect width="240" height="160" fill="#7FC8EC"/><rect width="240" height="64" fill="#9BD6F3" opacity=".8"/><path d="M40 0 L70 0 L52 120 L24 120Z M130 0 L156 0 L150 130 L124 130Z M196 0 L216 0 L226 120 L208 120Z" fill="#fff" opacity=".13"/>';
    s += '<path d="M0 132 Q60 120 120 130 Q180 140 240 126 L240 160 L0 160Z" fill="#F0DDA8"/><path d="M0 148 Q70 140 150 148 Q200 152 240 146 L240 160 L0 160Z" fill="#E4CB8A"/>';
    s += '<path d="M14 136 Q8 118 16 104 M20 136 Q26 120 20 108" fill="none" stroke="#3FA66B" stroke-width="4.2" stroke-linecap="round"/><path d="M222 138 Q216 122 224 108 M228 138 Q234 124 228 114" fill="none" stroke="#3FA66B" stroke-width="4.2" stroke-linecap="round"/>';
    s += '<circle cx="190" cy="40" r="3.4" fill="#fff" opacity=".55"/><circle cx="198" cy="26" r="2.4" fill="#fff" opacity=".55"/><circle cx="36" cy="60" r="2.8" fill="#fff" opacity=".5"/><circle cx="104" cy="22" r="2" fill="#fff" opacity=".5"/>';
    return s;
  }
  function bgPlain() {
    return '<rect width="240" height="160" fill="#BFE6FF"/><path d="M0 120 Q60 108 120 118 Q180 128 240 114 L240 160 L0 160Z" fill="#B9E49B"/><path d="M0 134 Q80 126 150 134 Q200 140 240 132 L240 160 L0 160Z" fill="#A5D984"/>';
  }
  function bgFlat() {
    var o = '<rect width="240" height="160" fill="#BFE6FF"/><ellipse cx="60" cy="30" rx="26" ry="9" fill="#fff"/><circle cx="50" cy="25" r="9" fill="#fff"/><circle cx="68" cy="22" r="11" fill="#fff"/><ellipse cx="170" cy="44" rx="20" ry="7" fill="#fff"/><circle cx="212" cy="30" r="13" fill="#FFE98A"/><rect y="108" width="240" height="52" fill="#A5D984"/><rect y="108" width="240" height="3" fill="#8FC76F"/>', i;
    for (i = 0; i < 4; i++) o += '<path d="M0 ' + (122 + i * 11) + " H240" + '" stroke="#93CC74" stroke-width="' + (1.4 + i * 0.5) + '" opacity=".8"/>';
    return o;
  }
  function bgCorner() {
    return '<rect width="150" height="160" fill="#F8EEDD"/><path d="M150 0 H240 V160 H150Z" fill="#E8D9BE"/><path d="M0 126 L150 112 L240 126 L240 160 H0Z" fill="#E1B77C"/><path d="M0 126 L150 112 L240 126" fill="none" stroke="#B88A4E" stroke-width="2"/><path d="M150 0 V112" stroke="#C9B28A" stroke-width="3"/><path d="M150 112 L120 160 M150 112 L190 160" stroke="#C99A5E" stroke-width="1.6" opacity=".6"/>';
  }

  function bgBedroom() {
    return '<rect width="240" height="160" fill="#2E3A70"/><rect y="118" width="240" height="42" fill="#222B57"/><rect y="114" width="240" height="5" fill="#1B2347"/><rect x="168" y="22" width="52" height="58" rx="4" fill="#1B2347"/><rect x="172" y="26" width="44" height="50" rx="2" fill="#4A5BA8"/><circle cx="196" cy="46" r="10" fill="#FFF3B0"/><path d="M194 26 V76 M172 51 H216" stroke="#1B2347" stroke-width="2.4"/>';
  }
  function bgDull() {
    return '<rect width="240" height="160" fill="#BDB8AC"/><ellipse cx="60" cy="34" rx="44" ry="14" fill="#A8A398"/><ellipse cx="170" cy="26" rx="52" ry="15" fill="#A8A398"/><path d="M0 120 Q60 112 120 120 Q180 128 240 116 L240 160 L0 160Z" fill="#BBA27A"/><path d="M0 138 Q80 130 150 138 Q200 144 240 136 L240 160 L0 160Z" fill="#A98C62"/><path d="M30 134 L32 124 M36 134 L36 126 M42 134 L40 126 M190 136 L192 126 M196 136 L196 128" stroke="#8A7A4A" stroke-width="2" stroke-linecap="round"/>';
  }
  /* ------------------------------------------------------------------ the scenes */
  var S6 = {
    // ---- Coral reef
    sand: [["sandcastle", 150, G + 6, 1.6], ["bucket", 106, G + 10, 1.0], ["kid", 60, G + 4, 1.4, kb("reach", { look: 1, mouth: "open" })], ["kid", 214, G + 4, 1.2, kg("wave", { look: -1, flip: true, mouth: "open" })]],
    coast: [["shore", 0, 0, 1], ["palm", 206, 104, 0.95], ["boat", 86, 118, 1.05, {}], ["whoosh", 38, 114, 0.8]],
    stream: [["tree", 34, 62, 0.8], ["tree", 212, 88, 0.75], ["stream", 120, 100, 1.0], ["fish", 56, 90, 0.5, { c: "#FF8FB1" }], ["fish", 176, 108, 0.5, { flip: true }], ["rock", 100, G + 8, 0.8, {}], ["rock", 196, G + 10, 0.6, {}]],
    current: [["boat", 96, 122, 1.1, { rot: -7 }], ["whoosh", 38, 116, 0.9], ["waveflow", 66, 144, 1.0], ["waveflow", 174, 140, 1.0]],
    cloud: [["cloud", 150, 54, 3.1], ["kid", 62, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["bird", 206, 96, 0.6, { fly: true }]],
    glass: [["kid", 120, G, 1.8, kb("drink", { look: 0, mouth: "o", arms: "none" })], ["waterglass", 120 + 13 * 1.8, G - 35 * 1.8, 0.5 * 1.8, { rot: -35 }], ["kid", 120, G, 1.8, kb("drink", { arms: "only" })], ["sparkle", 56, 52, 0.9], ["sparkle", 192, 56, 0.9], ["sparkle", 176, 100, 0.6]],
    rope: [["kid", 52, G, 1.3, kb("hold", { look: 1, mouth: "open" })], ["kid", 188, G, 1.3, kg("hold", { look: 1, flip: true, mouth: "open" })], ["ropeln", 0, 0, 1, { x1: 68, y1: G - 38, x2: 172, y2: G - 38, w: 5 }], ["ribbon", 120, G - 36, 0.9], ["sweat", 40, 62, 0.8], ["sweat", 204, 62, 0.8]],
    string: [["kid", 62, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["curve", 0, 0, 1, { x1: 102, y1: G - 51, cx: 150, cy: 138, x2: 180, y2: 94, c: "#6B5A4A", w: 2.4 }], ["kite", 182, 92, 1.0, { rot: 20 }], ["sparkle", 210, 110, 0.8]],
    tube: [["tubepipe", 0, 0, 1], ["bucket", 126, G, 1.5, { c: "#3D8BF2" }], ["splash", 126, G - 33, 0.7], ["kid", 190, G, 1.3, kb("point", { look: -1, flip: true, mouth: "open" })]],
    wire: [["pole", 40, G, 1.0, { h: 100 }], ["pole", 200, G, 1.0, { h: 100 }], ["wirecurve", 0, 0, 1, { x1: 40, y1: G - 94, x2: 200, y2: G - 94, sag: 12 }], ["bird", 120, G - 76, 1.0, {}], ["kid", 80, G, 1.1, kb("point", { look: 1, mouth: "open" })]],
    pole: [["flagpole", 150, G, 1.0, { h: 112 }], ["kid", 70, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["sparkle", 196, 50, 0.8]],
    block: [["kid", 66, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["toyblock", 150, G, 2.0, { c: "#E5483A", t: "A" }], ["num", 150, 36, 1.1, { n: 1 }]],
    board: [["blackboard", 176, G - 14, 1.15, { t: "1 + 1" }], ["kid", 78, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["line", 0, 0, 1, { x1: 114, y1: G - 54, x2: 124, y2: G - 62, c: "#FFFFFE", w: 3.4 }]],
    branches: [["bare", 150, G, 1.35, { leaves: true }], ["kid", 60, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["sparkle", 56, 52, 0.7]],
    seeds: [["groundcut", 120, 160, 1.0], ["seeds", 118, 130, 1.1, {}], ["seeds", 160, 134, 1.1, {}], ["seeds", 200, 130, 1.1, {}], ["kid", 52, 98, 1.25, kb("crouch", { look: 1, mouth: "open", arms: "none" })], ["trowel", 86, 90, 1.0, { rot: -28 }], ["kid", 52, 98, 1.25, kb("crouch", { arms: "only" })], ["packet", 206, 98, 1.0], ["sparkle", 150, 40, 0.8]],
    fruit: [["table", 150, G, 1.5], ["fruitbowl", 150, G - 39, 1.5], ["kid", 66, G, 1.5, kb("point", { look: 1, mouth: "open" })], ["heart", 214, 52, 0.9]],
    sugar: [["table", 150, G, 1.5], ["cake", 126, G - 39, 1.0], ["sugarjar", 176, G - 39, 1.0], ["sparkle", 120, 66, 0.7], ["sparkle", 134, 74, 0.6], ["kid", 56, G, 1.4, kg("point", { look: 1, mouth: "open" })]],
    meat: [["dog", 74, G, 1.7, { tongue: true }], ["plate", 160, G + 2, 1.6], ["drumstick", 160, G - 6, 1.5], ["heart", 118, 54, 0.9]],
    cook: [["stove", 176, G, 1.1], ["cookpot", 176, G - 56, 1.0], ["mom", 94, G, 1.6, { look: 1, mouth: "open", pose: "reach" }], ["ropeln", 0, 0, 1, { x1: 136, y1: G - 56, x2: 172, y2: G - 76, w: 3 }], ["heart", 120, 38, 0.9]],
    corner: [["cat", 150, G + 6, 1.7, { pose: "sit" }], ["arrow", 0, 0, 1, { x1: 62, y1: 36, x2: 144, y2: 36, c: P }]],
    swim: [["fish", 118, 84, 1.5, { c: "#FF9F5A" }], ["whoosh", 56, 84, 1.2], ["bubbles", 176, 120, 0.8], ["arrow", 0, 0, 1, { x1: 160, y1: 56, x2: 206, y2: 56, c: "#FFFFFE" }], ["waves", 120, 24, 1.0, { w: 240 }]],
    climbed: [["tree", 150, G, 2.0], ["line", 0, 0, 1, { x1: 150, y1: G - 62, x2: 196, y2: G - 70, c: "#8A5A2B", w: 6 }], ["cat", 184, G - 68, 0.75, { pose: "sit" }], ["arrow", 0, 0, 1, { x1: 96, y1: G - 10, x2: 96, y2: G - 94, c: P }], ["kid", 56, G, 1.3, kb("look", { look: 1, mouth: "open" })], ["rewind", 214, 36, 0.8]],
    fell: [["table", 170, G, 1.3], ["ball", 108, G, 1.3, { c: C.red }], ["arrow", 0, 0, 1, { x1: 130, y1: 84, x2: 112, y2: 108, c: P, dash: true }], ["whoosh", 112, 80, 0.5, { rot: 90 }], ["rewind", 212, 36, 0.8]],
    grew: [["tree", 50, G, 0.55], ["tree", 178, G, 1.5], ["arrow", 0, 0, 1, { x1: 72, y1: 96, x2: 124, y2: 96, c: P }], ["rewind", 20, 40, 0.8]],
    caught: [["kid", 100, G, 1.8, kb("cradle", { mouth: "open", arms: "none" })], ["ball", 103, G - 40, 1.0, { c: C.red }], ["kid", 100, G, 1.8, kb("cradle", { arms: "only" })], ["arrow", 0, 0, 1, { x1: 36, y1: 30, x2: 82, y2: 74, c: P, dash: true }], ["sparkle", 176, 52, 0.9], ["rewind", 206, 100, 0.8]],
    lifted: [["kid", 106, G, 1.2, kb("lift", { mouth: "open", arms: "none" })], ["box", 106, G - 88, 0.8, {}], ["kid", 106, G, 1.2, kb("lift", { arms: "only" })], ["sweat", 150, 64, 0.8], ["rewind", 206, 40, 0.8]],
    tied: [["shoebig", 126, G, 1.9], ["kid", 40, G, 1.2, kb("point", { look: 1, mouth: "open" })], ["check", 204, 44, 1.0], ["rewind", 206, 100, 0.8]],
    spread: [["kid", 120, G, 1.8, kb("wide", { mouth: "open" })], ["arrow", 0, 0, 1, { x1: 48, y1: 62, x2: 28, y2: 62, c: P }], ["arrow", 0, 0, 1, { x1: 192, y1: 62, x2: 212, y2: 62, c: P }], ["sparkle", 120, 24, 0.9]],

    // ---- Kelp forest
    mouth: [["facebig", 120, 150, 1.55, { hl: "mouth", open: true }], ["arrow", 0, 0, 1, { x1: 218, y1: 108, x2: 172, y2: 124, c: P }], ["sparkle", 28, 46, 0.8]],
    nose: [["facebig", 120, 150, 1.55, { hl: "nose" }], ["arrow", 0, 0, 1, { x1: 218, y1: 70, x2: 146, y2: 100, c: P }], ["sparkle", 28, 46, 0.8]],
    ears: [["facebig", 120, 150, 1.55, { hl: "ears" }], ["arrow", 0, 0, 1, { x1: 26, y1: 40, x2: 52, y2: 76, c: P }], ["arrow", 0, 0, 1, { x1: 214, y1: 40, x2: 188, y2: 76, c: P }]],
    foot: [["kid", 70, G, 1.7, kb("foothurt", { barefoot: true, look: 1, mouth: "sad" })], ["bandaid", 70 + 19.5 * 1.7, G - 6 * 1.7, 0.42, { rot: 10 }], ["sweat", 36, 48, 0.8], ["line", 0, 0, 1, { x1: 108, y1: G - 12, x2: 160, y2: 96, c: P, w: 2.4, dash: "2 5" }], ["footzoom", 192, 68, 1.0], ["txt", 112, 30, 1.0, { t: "Ouch!", size: 16, c: "#E5483A" }]],
    skin: [["baby", 84, G, 2.3, {}], ["zoomskin", 176, 62, 1.0], ["line", 0, 0, 1, { x1: 106, y1: 92, x2: 150, y2: 78, c: P, w: 2.4, dash: "2 5" }], ["heart", 36, 40, 0.9]],
    shoulder: [["kid", 108, G, 1.9, kb("stand", { look: 1, mouth: "open" })], ["bird", 133, 66, 0.75, {}], ["heart", 176, 56, 0.9], ["sparkle", 56, 50, 0.8]],
    bones: [["dog", 84, G, 1.6, { tongue: true }], ["bonepile", 188, G, 1.25], ["heart", 130, 46, 0.9]],
    insects: [["flower", 118, G, 1.5, { c: C.red }], ["flower", 24, G, 1.1, { c: "#FF6FA0" }], ["leaf", 200, G, 3.4, { c: "#5DBB5A" }], ["bug", 204, G - 22, 1.9, { t: "lady" }], ["bug", 88, 40, 1.8, { t: "butterfly" }], ["bug", 160, 36, 1.8, { t: "bee" }], ["bug", 82, G - 4, 1.8, { t: "ant" }]],
    cows: [["fence", 122, G - 2, 1.0, { w: 240 }], ["cow", 38, G + 2, 0.78], ["cow", 112, G + 10, 0.85], ["cow", 188, G + 2, 0.78], ["barn", 228, G - 20, 0.34]],
    touch: [["cat", 140, G, 1.6, { pose: "sit" }], ["kid", 92, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["heart", 150, 36, 0.9], ["heart", 184, 64, 0.7]],
    hit: [["kid", 62, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["bat", 102, G - 51, 1.2, { rot: -35 }], ["sparkle", 158, 54, 0.9], ["ball", 176, 62, 0.9, { c: C.red }], ["arrow", 0, 0, 1, { x1: 190, y1: 50, x2: 224, y2: 36, c: P, dash: true }]],
    break: [["kid", 100, G, 1.7, kb("hands", { look: 0, mouth: "o", arms: "none" })], ["line", 0, 0, 1, { x1: 96, y1: G - 49, x2: 62, y2: G - 26, c: "#9B6A3C", w: 9 }], ["line", 0, 0, 1, { x1: 104, y1: G - 49, x2: 138, y2: G - 26, c: "#9B6A3C", w: 9 }], ["line", 0, 0, 1, { x1: 94, y1: G - 58, x2: 88, y2: G - 66, c: "#9B6A3C", w: 3 }], ["line", 0, 0, 1, { x1: 106, y1: G - 58, x2: 112, y2: G - 66, c: "#9B6A3C", w: 3 }], ["kid", 100, G, 1.7, kb("hands", { arms: "only" })], ["sparkle", 100, G - 62, 0.8], ["sweat", 150, 54, 0.7]],
    blow: [["kid", 62, G, 1.5, kb("reach", { look: 1, mouth: "o" })], ["bubblewand", 102, G - 51, 1.0, { rot: 30 }], ["bubbles", 132, 62, 1.3], ["sparkle", 196, 44, 0.8]],
    visit: [["fence", 188, G - 2, 0.8, { w: 100 }], ["barn", 198, G - 6, 0.85], ["woodsign", 124, G, 1.0, { t: "FARM" }], ["kid", 30, G, 1.2, kb("walk", { look: 1, mouth: "open" })], ["kid", 72, G, 1.1, kg("walk", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 22, y1: 48, x2: 98, y2: 48, c: P }]],
    wear: [["kid", 120, G, 1.8, kb("self", { look: 0, mouth: "open", hat: C.red })], ["sparkle", 64, 54, 0.9], ["sparkle", 182, 46, 0.9], ["heart", 188, 90, 0.8]],
    win: [["trophy", 168, G, 2.6], ["kid", 80, G, 1.7, kb("cheer", { mouth: "open" })], ["star", 40, 36, 0.8, { c: "#FF8FB1" }], ["star", 124, 24, 0.6, { c: "#4FA8F0" }], ["star", 210, 44, 0.7, { c: "#7ED957" }], ["sparkle", 140, 66, 0.8]],
    save: [["kid", 46, G, 1.5, kb("point", { look: 1, mouth: "open" })], ["piggybank", 138, G, 1.7], ["coin", 146, 28, 1.0], ["arrow", 0, 0, 1, { x1: 146, y1: 42, x2: 146, y2: 58, c: P }], ["coins", 218, G, 0.7, { n: 6 }]],
    sell: [["kid", 50, G, 1.3, kb("reach", { look: 1, mouth: "open" })], ["coin", 88, G - 46, 0.6], ["kid", 152, G, 1.15, kg("hold", { look: -1, flip: true, mouth: "open" })], ["stall", 152, G, 1.35, {}], ["apple", 112, G - 43, 0.7], ["apple", 196, G - 43, 0.7]],
    send: [["mailbox", 172, G, 1.2], ["kid", 100, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["letter", 146, G - 47, 0.55], ["sparkle", 206, 46, 0.8]],
    shouted: [["kid", 78, G, 1.6, kb("wave", { look: 1, mouth: "open" })], ["bubble", 170, 52, 1.0, { w: 112, h: 34, inner: [["txt", 0, 5, 1.0, { t: "Look at me!", size: 13, c: INK }]] }], ["rewind", 214, 108, 0.8]],
    wrote: [["table", 146, G, 1.5], ["paper", 146, 96, 1.4], ["kid", 66, G, 1.4, kb("reach", { look: 1, mouth: "open" })], ["pencil", 104, 88, 1.0, { rot: 20 }], ["check", 206, 46, 1.0], ["rewind", 214, 100, 0.8]],
    bought: [["store", 176, G, 1.2], ["mom", 84, G, 1.6, { pose: "cradle", look: 1, mouth: "open", arms: "none" }], ["cake", 87, G - 40, 0.85], ["mom", 84, G, 1.6, { pose: "cradle", arms: "only" }], ["coins", 140, G, 0.6, { n: 4 }], ["rewind", 214, 36, 0.8]],
    arrived: [["whoosh", 28, G - 30, 0.9], ["bus", 92, G, 1.05, {}], ["woodsign", 220, G, 0.9, { t: "BUS" }], ["kid", 178, G, 1.0, kg("wave", { look: -1, flip: true, mouth: "open" })], ["check", 130, 36, 1.0], ["rewind", 214, 40, 0.8]],
    joined: [["kid", 36, G, 1.3, kb("hands", { look: 1, mouth: "open" })], ["kid", 100, G, 1.3, kg("reach", { look: 1, mouth: "open" })], ["ball", 68, G, 0.8, { c: C.red }], ["dog", 188, G - 6, 1.4, { pose: "run", flip: true }], ["arrow", 0, 0, 1, { x1: 190, y1: 58, x2: 138, y2: 58, c: P, dash: true }], ["heart", 120, 40, 0.8], ["rewind", 214, 36, 0.8]],
    lost: [["lostposter", 172, G, 1.2], ["kid", 78, G, 1.5, kb("look", { look: 1, mouth: "sad" })], ["qm", 116, 40, 1.0]],
    agreed: [["kid", 46, G, 1.3, kb("hands", { look: 1, mouth: "open" })], ["kid", 120, G, 1.3, kg("hands", { look: 0, mouth: "open" })], ["kid", 194, G, 1.3, ky("hands", { look: -1, flip: true, mouth: "open" })], ["bubble", 76, 40, 1.0, { w: 34, h: 28, inner: [["check", 0, 0, 0.7, {}]] }], ["bubble", 150, 40, 1.0, { w: 34, h: 28, inner: [["check", 0, 0, 0.7, {}]] }], ["bubble", 224, 40, 1.0, { w: 34, h: 28, inner: [["check", 0, 0, 0.7, {}]] }]],
    expect: [["door", 204, G, 1.4, {}], ["kid", 70, G, 1.5, kb("hands", { look: 1, mouth: "open" })], ["thought", 150, 50, 1.0, { w: 80, h: 50, inner: [["gift", 0, 14, 0.7, { c: C.purple }]] }]],

    // ---- Sunken ship
    engine: [["car", 64, G, 1.0, {}], ["line", 0, 0, 1, { x1: 92, y1: G - 34, x2: 140, y2: 100, c: P, w: 2.4, dash: "3 5" }], ["engine", 176, 84, 1.0]],
    key: [["door", 190, G, 1.4, {}], ["kid", 70, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["keybig", 112, G - 41, 0.9, { rot: -10 }], ["sparkle", 150, 50, 0.8], ["sparkle", 54, 40, 0.7]],
    shoes: [["kid", 66, G, 1.5, kb("point", { look: 1, mouth: "open" })], ["shoe", 148, G, 1.5, {}], ["shoe", 186, G, 1.5, { flip: true }], ["sparkle", 168, 76, 0.8]],
    radio: [["radio", 100, G, 1.5], ["note", 150, 64, 1.2], ["note", 176, 46, 1.0], ["note", 196, 74, 0.9], ["kid", 206, G, 1.2, kg("hands", { look: -1, flip: true, mouth: "open" })]],
    tools: [["toolbox", 158, G, 1.4], ["saw", 204, G - 8, 0.8], ["kid", 56, G, 1.5, man({ pose: "reach", look: 1, mouth: "open" })], ["wrench", 100, G - 52, 0.9, { rot: -30 }]],
    truck: [["truck", 124, G, 1.7], ["whoosh", 26, G - 28, 0.9], ["kid", 34, G, 1.0, kb("wave", { look: 1, mouth: "open" })]],
    track: [["rails", 120, G + 9, 1.0, { w: 260 }], ["train", 152, G, 1.2], ["kid", 36, G, 1.2, kb("point", { look: 1, mouth: "open" })]],
    bank: [["bankb", 150, G, 1.3], ["kid", 56, G, 1.4, kb("hold", { look: 1, mouth: "open" })], ["coin", 78, G - 44, 0.65]],
    shop: [["shopfront", 150, G, 1.3], ["kid", 56, G, 1.4, kg("point", { look: 1, mouth: "open" })], ["heart", 94, 48, 0.8]],
    office: [["kid", 152, G, 1.4, man({ pose: "reach", look: -1, flip: true, mouth: "open" })], ["table", 116, G, 1.6], ["laptop", 100, G - 42, 1.3], ["phone", 138, G - 42, 0.7], ["chair", 214, G, 1.2, {}]],
    doctor: [["redcross", 44, G, 1.1], ["mom", 112, G, 1.5, { shirt: "#FFFFFE", pants: "#7B8BA8", look: 1, mouth: "open" }], ["stetho", 112, G, 1.5], ["kid", 180, G, 1.2, kb("stand", { look: -1, flip: true, mouth: "open" })], ["heart", 150, 38, 0.8]],
    lady: [["mom", 112, G, 1.3, { shirt: "#E5483A", pose: "stand", look: 0, mouth: "open" }], ["hat", 112, G - 73, 1.4, { c: "#FF8FB1" }], ["sparkle", 56, 56, 0.9], ["sparkle", 176, 50, 0.9]],
    woman: [["mom", 100, G, 1.5, { shirt: "#35B779", pose: "hold", look: 1, mouth: "open", arms: "none" }], ["applebag", 112, G - 34, 0.62], ["mom", 100, G, 1.5, { shirt: "#35B779", pose: "hold", arms: "only" }], ["heart", 170, 54, 0.9]],
    women: [["mom", 66, G, 1.4, { pose: "run", look: 1, mouth: "open" }], ["mom", 142, G, 1.4, { pose: "run", look: 1, mouth: "open", shirt: "#35B779", hair: "#8A5A2B" }], ["whoosh", 26, G - 28, 1.0], ["whoosh", 100, G - 28, 0.8]],
    uncle: [["kid", 156, G, 1.8, man({ pose: "wave", look: -1, flip: true, mouth: "open" })], ["kid", 66, G, 1.2, kb("wave", { look: 1, mouth: "open" })], ["bubble", 96, 40, 1.0, { w: 110, h: 32, inner: [["txt", 0, 4, 1.0, { t: "Hi, Uncle Tom!", size: 12, c: INK }]] }], ["heart", 112, 92, 0.8]],
    crowd: crowdItems().concat([["flag", 34, G - 4, 0.5], ["flag", 206, G - 4, 0.5, { c: "#3D8BF2" }]]),
    team: [["kid", 40, G, 1.3, kr("hands", { look: 1, mouth: "open" })], ["kid", 88, G, 1.3, kr("hands", { look: 1, hair: "#2A1E16", mouth: "open" })], ["kid", 152, G, 1.3, kr("hands", { look: -1, flip: true, girl: true, hair: "#8A5A2B", mouth: "open" })], ["kid", 200, G, 1.3, kr("hands", { look: -1, flip: true, hair: "#3A2A22", mouth: "open" })], ["soccer", 120, G - 14, 1.0], ["txt", 120, 34, 1.0, { t: "TEAM", size: 24, c: "#E5483A" }]],
    wife: [["kid", 90, G, 1.6, man({ shirt: "#2B3350", pants: "#2B3350", pose: "stand", look: 1, mouth: "open" })], ["mom", 150, G, 1.6, { shirt: "#FFFFFE", pose: "stand", look: -1, flip: true, mouth: "open" }], ["heart", 120, 34, 1.5], ["sparkle", 54, 56, 0.8], ["sparkle", 192, 50, 0.8]],
    poem: [["kid", 66, G, 1.5, kb("point", { look: 1, mouth: "open" })], ["paper", 152, G, 1.8], ["heart", 150, G - 50, 1.3], ["note", 206, 56, 1.0], ["note", 194, 86, 0.8]],
    planets: [["planet", 46, G - 14, 0.8, { c: "#FF9F5A" }], ["planet", 122, G - 4, 1.05, { c: "#4FA8F0" }], ["planet", 200, G - 18, 0.65, { c: "#E5483A" }], ["star", 30, 30, 0.5, { c: "#FFE066" }], ["star", 108, 22, 0.4, { c: "#FFE066" }], ["star", 214, 40, 0.5, { c: "#FFE066" }]],
    yard: [["house", 58, G - 16, 1.25, {}], ["fence", 120, G - 2, 1.0, { w: 240 }], ["tree", 214, G - 10, 1.0], ["kid", 112, G + 10, 1.2, kb("jump", { mouth: "open" })], ["ball", 150, G + 12, 0.9, { c: C.red }], ["dog", 190, G + 10, 1.0, { tongue: true }]],
    park: [["tree", 26, G, 1.2], ["bench", 76, G, 1.15], ["woodsign", 136, G, 0.95, { t: "PARK" }], ["tree", 216, G, 1.3], ["kid", 186, G + 4, 1.1, kg("walk", { look: -1, flip: true, mouth: "open" })]],
    church: [["churchb", 126, G, 1.0], ["kid", 38, G, 1.2, kb("point", { look: 1, mouth: "open" })], ["tree", 214, G, 1.0]],
    mall: [["mallb", 130, G, 1.2], ["mom", 28, G, 1.1, { pose: "walk", look: 1, mouth: "open" }], ["kid", 226, G, 1.1, kb("walk", { look: -1, flip: true, mouth: "open" })]],
    dollars: [["table", 110, G, 1.5], ["ball", 72, G - 39, 1.2, { c: C.red }], ["price", 120, G - 39, 1.1, { t: "$5" }], ["bills", 152, G - 48, 0.75], ["num", 196, 44, 1.2, { n: 5 }]],
    cents: [["table", 110, G, 1.5], ["apple", 74, G - 39, 1.4], ["price", 124, G - 39, 1.1, { t: "10&#162;" }], ["coins", 152, G - 39, 0.6, { n: 3 }]],
    pay: [["kid", 176, G, 1.25, man({ pose: "hands", look: -1, flip: true, mouth: "open" })], ["table", 160, G, 1.5], ["cake", 140, G - 39, 1.0], ["kid", 62, G, 1.4, kb("reach", { look: 1, mouth: "open" })], ["coin", 100, G - 50, 0.6]],
    score: [["scoreboard", 120, G, 1.3, { a: 10, b: 7 }], ["kid", 34, G, 1.2, kb("cheer", { mouth: "open" })], ["kid", 206, G, 1.2, kg("jump", { mouth: "open" })], ["star", 70, 34, 0.5, { c: "#FF8FB1" }], ["star", 176, 28, 0.5, { c: "#4FA8F0" }]],

    // ---- Whale song
    loud: [["drum", 178, G, 1.9], ["sounds", 128, G - 46, 1.0], ["kid", 66, G, 1.6, kb("ears", { mouth: "o" })], ["txt", 130, 28, 1.0, { t: "BOOM!", size: 20, c: "#E5483A" }]],
    silent: [["radio", 98, G, 1.5], ["sounds", 160, G - 50, 1.0, { c: "#B9C7DD" }], ["cross", 160, G - 50, 1.3], ["cat", 208, G, 0.9, { pose: "sit" }], ["zzz", 208, G - 52, 0.9]],
    strange: [["weirdfish", 112, 88, 1.5], ["qm", 196, 46, 1.1], ["bubbles", 178, 120, 0.8]],
    afraid: [["bed", 92, G, 1.8, { c: "#7FB8F2" }], ["hider", 92, G - 28, 1.5, { c: "#7FB8F2" }], ["shadowmon", 190, 116, 1.5]],
    exciting: [["kid", 50, G, 1.3, kb("cheer", { mouth: "open" })], ["kid", 120, G, 1.3, kg("jump", { mouth: "open" })], ["kid", 190, G, 1.3, ky("cheer", { mouth: "open" })], ["star", 84, 40, 0.7, { c: "#FFE066" }], ["star", 158, 34, 0.6, { c: "#FF8FB1" }], ["star", 214, 62, 0.5, { c: "#4FA8F0" }], ["txt", 120, 24, 1.0, { t: "Go! Go!", size: 16, c: "#E5483A" }]],
    huge: [["bear", 156, G, 2.2], ["kid", 40, G, 0.9, kb("look", { look: 1 })]],
    sharp: [["desktop", 0, 0, 1], ["bigpencil", 104, 78, 1.25, { sharp: false }], ["cross", 212, 78, 1.0], ["bigpencil", 104, 124, 1.25, { sharp: true }], ["check", 212, 124, 1.0], ["sparkle", 186, 114, 0.9], ["sparkle", 194, 132, 0.6]],
    thick: [["kid", 22, G, 1.1, kg("point", { look: 1, mouth: "open" })], ["bookflat", 80, G - 2, 1.15, { th: 28, c: "#3D8BF2", hl: true }], ["bookflat", 178, G - 2, 1.15, { th: 7, c: "#E5483A" }]],
    thin: [["kid", 22, G, 1.1, kg("point", { look: 1, mouth: "open" })], ["bookflat", 80, G - 2, 1.15, { th: 7, c: "#E5483A", hl: true }], ["bookflat", 178, G - 2, 1.15, { th: 28, c: "#3D8BF2" }]],
    flat: [["mountain", 26, 109, 0.8, { w: 40, hh: 46, c: "#8FA3C7" }], ["tree", 176, 112, 0.32], ["tree", 200, 112, 0.26], ["kid", 112, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    rich: [["kid", 84, G, 1.5, man({ shirt: "#8B6BE8", pose: "hands", look: 1, mouth: "open" })], ["crown", 84, G - 98, 0.8], ["coins", 168, G, 1.1, { n: 14 }], ["goldbars", 212, G, 1.0, { n: 3 }], ["sparkle", 140, 56, 0.9], ["sparkle", 196, 60, 0.8]],
    poor: [["cat", 138, G, 1.4, { c: "#B8B0A4" }], ["shiver", 116, G - 52, 1.0], ["kid", 198, G, 1.2, kb("reach", { look: -1, flip: true })], ["umbrella", 166, G - 38, 1.0, { c: "#3D8BF2" }]],
    safe: [["house", 120, G - 10, 1.9, { lit: true, open: true }], ["cat", 120, G - 12, 0.8, { pose: "sit" }], ["heart", 196, 60, 0.9], ["check", 44, 60, 1.0]],
    famous: [["kid", 120, G, 1.5, man({ shirt: "#8B6BE8", pose: "wave", look: 0, mouth: "open" })], ["star", 120, 16, 0.9, {}], ["cameratri", 38, G, 0.9], ["cameratri", 204, G, 0.9, {}], ["sparkle", 62, 56, 1.4], ["sparkle", 184, 60, 1.4], ["sparkle", 170, 100, 0.8]],
    fine: [["kid", 120, G, 1.7, kb("wave", { mouth: "open" })], ["check", 178, 52, 1.2], ["heart", 66, 56, 0.9], ["sparkle", 196, 100, 0.9]],
    fresh: [["table", 140, G, 1.5], ["loaf", 140, G - 39, 1.5], ["steam", 140, G - 82, 1.3], ["kid", 66, G, 1.4, kb("hands", { look: 1, mouth: "open" })], ["sparkle", 196, 60, 0.9], ["heart", 98, 52, 0.8]],
    cool: [["table", 150, G, 1.5], ["icedrink", 150, G - 39, 2.0], ["flake", 108, 50, 0.9], ["flake", 200, 44, 0.8], ["flake", 156, 22, 0.6], ["kid", 66, G, 1.4, kg("hands", { look: 1, mouth: "open" })]],
    burning: [["fire", 150, G, 1.7], ["kid", 64, G, 1.4, kb("hands", { look: 1, mouth: "open" })], ["sparkle", 150, 44, 0.8], ["sparkle", 176, 60, 0.6], ["sparkle", 126, 52, 0.6]],
    dead: [["deadtree", 150, G, 1.3], ["leaf", 94, G + 6, 1.4, { c: "#A8714A" }], ["leaf", 196, G + 8, 1.5, { c: "#9A6A3A" }], ["leaf", 120, G + 12, 1.1, { c: "#B88A5A" }], ["kid", 52, G, 1.3, kb("hands", { look: 1, mouth: "sad" })]],
    bad: [["table", 130, G, 1.5], ["badapple", 130, G - 39, 1.9], ["cross", 204, 50, 1.2], ["kid", 52, G, 1.4, kb("hands", { look: 1, mouth: "sad" })]],
    wrong: [["blackboard", 150, G - 14, 1.25, { t: "2+2=5" }], ["cross", 216, 38, 1.1], ["kid", 56, G, 1.4, kb("hands", { look: 1, mouth: "sad" })], ["qm", 100, 40, 1.0]],
    difficult: [["table", 130, G, 1.5], ["puzzle", 100, G - 40, 0.8, { rot: -25, c: "#FF8FB1" }], ["puzzle", 136, G - 40, 0.8, { rot: 30, c: "#6BB7FF" }], ["puzzle", 168, G - 40, 0.8, { rot: 80, c: "#FFD23F" }], ["kid", 52, G, 1.4, kb("hands", { look: 1, mouth: "sad" })], ["sweat", 80, 50, 0.8], ["qm", 196, 50, 1.0]],
    single: [["flower", 120, G, 2.1, { c: C.red }], ["num", 176, 44, 1.2, { n: 1 }], ["kid", 50, G, 1.3, kb("point", { look: 1, mouth: "open" })]],
    common: [["pond", 120, G + 8, 1.9, { w: 96 }], ["duck", 40, G + 4, 0.8], ["duck", 84, G + 8, 0.8], ["duck", 128, G + 4, 0.8], ["duck", 172, G + 8, 0.8], ["duck", 212, G + 4, 0.8], ["duck", 62, G - 8, 0.7], ["duck", 106, G - 6, 0.7], ["duck", 150, G - 8, 0.7], ["duck", 192, G - 6, 0.7], ["check", 206, 46, 1.0]],
    fair: [["scales", 120, G, 1.3, { n: 3 }], ["kid", 20, G, 1.0, kb("look", { look: 1, mouth: "open" })], ["kid", 220, G, 1.0, kg("look", { look: -1, flip: true, mouth: "open" })], ["check", 120, 20, 0.9]],
    chance: [["table", 130, G, 1.5], ["dice", 118, G - 42, 1.1, { n: 6 }], ["dice", 150, G - 42, 1.1, { n: 3 }], ["kid", 56, G, 1.4, kb("reach", { look: 1, mouth: "open" })], ["thought", 184, 48, 1.0, { w: 66, h: 48, inner: [["trophy", 0, 16, 0.6, {}]] }]],
    level: [["tank", 120, G + 4, 1.2, { w: 130, h: 100 }], ["line", 0, 0, 1, { x1: 42, y1: 34, x2: 198, y2: 34, c: P, w: 2.6, dash: "6 4" }], ["arrow", 0, 0, 1, { x1: 224, y1: 56, x2: 202, y2: 38, c: P }]],
    total: [["blackboard", 120, G - 4, 2.2, {}], ["apple", 40, 84, 0.55], ["apple", 58, 84, 0.55], ["apple", 76, 84, 0.55], ["apple", 40, 106, 0.55], ["apple", 58, 106, 0.55], ["apple", 76, 106, 0.55], ["txt", 96, 102, 1.0, { t: "+", size: 30, c: "#FFFFFE" }], ["apple", 120, 84, 0.55], ["apple", 138, 84, 0.55], ["apple", 120, 106, 0.55], ["apple", 138, 106, 0.55], ["txt", 162, 102, 1.0, { t: "=", size: 30, c: "#FFFFFE" }], ["num", 196, 92, 1.8, { n: 10 }]],

    // ---- Treasure deep
    also: [["cat", 46, G, 1.3, {}], ["txt", 120, 100, 1.0, { t: "+", size: 62, c: P }], ["duck", 192, G, 1.3], ["heart", 46, 36, 0.9], ["heart", 192, 36, 0.9]],
    another: [["kid", 64, G, 1.5, kb("hold", { look: 1, mouth: "open", arms: "none" })], ["apple", 78, G - 40, 0.8], ["kid", 64, G, 1.5, kb("hold", { arms: "only" })], ["table", 176, G, 1.3], ["apple", 156, G - 34, 0.75], ["apple", 186, G - 34, 0.75], ["arrow", 0, 0, 1, { x1: 148, y1: 76, x2: 104, y2: 76, c: P, dash: true }]],
    even: [["txt", 120, 40, 1.0, { t: "2 + 2 = 4", size: 24, c: P }], ["circ", 72, G - 8, 1, { r: 25, c: P }], ["ball", 72, G - 22, 0.9, { c: C.red }], ["ball", 72, G + 6, 0.9, { c: C.red }], ["circ", 150, G - 8, 1, { r: 25, c: P }], ["ball", 150, G - 22, 0.9, { c: C.blue }], ["ball", 150, G + 6, 0.9, { c: C.blue }]],
    still: [["cat", 56, G, 1.7, { pose: "sit" }], ["dog", 190, G, 1.3, { pose: "run", flip: true }], ["whoosh", 232, G - 26, 0.9], ["arrow", 0, 0, 1, { x1: 214, y1: 52, x2: 166, y2: 52, c: P }]],
    such: [["kid", 120, G, 1.5, kb("stand", { look: 0, mouth: "open" })], ["hat", 120, G - 84, 1.8, { c: "#E5483A" }], ["txt", 196, 56, 1.0, { t: "!", size: 44, c: "#E5483A" }]],
    things: [["kid", 62, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["box", 158, G, 1.8, { inner: [["ball", -15, -28, 0.7, { c: C.red }], ["doll", 14, -30, 0.55, {}], ["hat", -2, -40, 0.42, { c: C.blue }]] }], ["sparkle", 110, 40, 0.8], ["sparkle", 206, 50, 0.7]],
    years: [["table", 156, G, 1.4], ["candlecake", 156, G - 36, 1.25, { n: 7 }], ["num", 156, 20, 1.2, { n: 7 }], ["kid", 66, G, 1.5, kb("cheer", { mouth: "open" })]],
    being: [["kid", 62, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["apple", 108, G - 44, 0.7], ["kid", 156, G, 1.2, kg("reach", { look: -1, flip: true, mouth: "open" })], ["heart", 130, 40, 1.1], ["heart", 90, 30, 0.7], ["heart", 176, 36, 0.7]],
    might: [["sunbig", 150, 52, 1.0, { c: "#FFE066", ray: "#FFC93C" }], ["raincloud", 122, 56, 0.95], ["kid", 58, G, 1.5, kb("hands", { look: 1, mouth: "o" })], ["qm", 200, 104, 1.1]],
    since: [["clockat", 54, 112, 1.35, { h: 8 }], ["clockat", 186, 112, 1.35, { h: 3 }], ["txt", 54, 28, 1.0, { t: "morning", size: 14, c: "#3D8BF2" }], ["txt", 186, 28, 1.0, { t: "now", size: 14, c: "#E5483A" }], ["arrow", 0, 0, 1, { x1: 92, y1: 82, x2: 148, y2: 82, c: P }], ["kid", 120, G, 1.1, kb("run", { mouth: "open" })], ["sweat", 148, 80, 0.7]],
    ever: [["kid", 112, G, 1.3, kb("jump", { mouth: "open" })], ["medal", 184, 66, 1.8], ["num", 184, 98, 1.0, { n: 1 }], ["balloons", 40, G, 1.1], ["sparkle", 66, 40, 0.9], ["sparkle", 196, 30, 0.8]],
    happened: [["milk", 134, G - 8, 1.1, { rot: 72 }], ["milkspill", 166, G + 6, 1.0], ["kid", 62, G, 1.4, kb("hands", { look: 1, mouth: "o" })], ["qm", 112, 40, 1.1]],
    himself: [["kid", 100, G, 1.7, kb("hands", { hat: C.red, mouth: "open" })], ["mom", 190, G, 1.4, { pose: "stand", look: -1, flip: true, mouth: "open" }], ["check", 146, 40, 1.2], ["heart", 196, 56, 0.8]],
    yourself: [["kid", 66, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["mirror", 164, G, 1.5, { inner: [["kid", 0, -26, 0.62, kb("point", { look: -1, flip: true, mouth: "open" })]] }], ["sparkle", 112, 44, 0.8]],
    itself: [["cat", 120, G, 2.0, { pose: "sit" }], ["pawup", 120, G, 2.0], ["bubbles", 174, G - 36, 0.8], ["sparkle", 64, 60, 0.9], ["sparkle", 186, 40, 0.8]],
    instead: [["table", 176, G, 1.3], ["cake", 176, G - 34, 0.9], ["cross", 176, 62, 1.0], ["kid", 76, G, 1.5, kb("hold", { look: 1, mouth: "open", arms: "none" })], ["apple", 88, G - 40, 0.8], ["kid", 76, G, 1.5, kb("hold", { arms: "only" })], ["check", 112, 40, 1.0]],
    either: [["kid", 120, G, 1.5, kb("wide", { mouth: "open" })], ["table", 120, G, 1.6], ["hat", 68, G - 42, 1.3, { c: C.red }], ["hat", 172, G - 42, 1.3, { c: C.blue }], ["check", 68, 40, 1.0], ["check", 172, 40, 1.0]],
    quite: [["kid", 110, G, 1.6, kb("hands", { hat: "#E5483A", mouth: "o" })], ["shiver", 80, 70, 1.0], ["txt", 176, 52, 1.0, { t: "Brrr", size: 20, c: "#3D8BF2" }], ["flake", 200, 90, 0.8], ["flake", 40, 40, 0.7]],
    within: [["ring", 120, G - 4, 1, { rx: 64, ry: 18, c: P }], ["ball", 120, G - 4, 1.3, { c: C.red }], ["kid", 38, G, 1.3, kb("point", { look: 1, mouth: "open" })]],
    already: [["plate", 150, G + 4, 1.9], ["crumbs", 150, G + 2, 1.4], ["kid", 66, G, 1.5, kb("hands", { look: 1, mouth: "open" })], ["clock", 206, G - 14, 1.2], ["check", 206, 50, 0.9]],
    although: [["kid", 120, G, 1.5, kb("walk", { hat: "#E5483A", look: 1, mouth: "open" })], ["door", 40, G, 1.3, { c: "#A8713A" }], ["arrow", 0, 0, 1, { x1: 156, y1: 60, x2: 214, y2: 60, c: P }], ["flake", 92, 40, 0.8], ["flake", 190, 100, 0.7]],
    ahead: [["dog", 176, G, 1.3, { pose: "run", tongue: true }], ["kid", 60, G, 1.3, kb("run", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 192, y1: 52, x2: 232, y2: 52, c: P }], ["whoosh", 140, G - 26, 0.8]],
    forward: [["line", 0, 0, 1, { x1: 78, y1: G + 12, x2: 78, y2: G - 6, c: "#FFFFFE", w: 4 }], ["kid", 112, G, 1.5, kb("walk", { look: 1, mouth: "open" })], ["prints", 14, G + 10, 0.9, { n: 4 }], ["arrow", 0, 0, 1, { x1: 150, y1: 60, x2: 214, y2: 60, c: P }]],
    maybe: [["kid", 120, G, 1.35, kb("hands", { look: 0, mouth: "o" })], ["thought", 50, 46, 1.0, { w: 58, h: 46, inner: [["sunbig", 0, 6, 0.26, { c: "#FFC93C" }]] }], ["thought", 192, 46, 1.0, { w: 58, h: 46, inner: [["raincloud", 0, 10, 0.4, {}]] }], ["qm", 120, 18, 1.0]],
    else: [["table", 136, G, 1.5], ["plate", 106, G - 38, 1.2], ["cake", 172, G - 39, 0.9], ["kid", 50, G, 1.4, kb("reach", { look: 1, mouth: "sad" })], ["thought", 88, 30, 1.0, { w: 52, h: 40, inner: [["cake", 0, 12, 0.5, {}]] }]],
    whose: [["hat", 130, G, 1.6, { c: C.red }], ["kid", 50, G, 1.3, kb("point", { look: 1, mouth: "open" })], ["kid", 210, G, 1.3, kg("point", { look: -1, flip: true, mouth: "open" })], ["qm", 130, 50, 1.3]],
    cannot: [["box", 150, G, 2.4, {}], ["kid", 74, G, 1.4, kb("hands", { look: 1, mouth: "sad" })], ["cross", 150, 38, 1.1], ["sweat", 100, 52, 0.8]],
    able: [["line", 0, 0, 1, { x1: 70, y1: G, x2: 70, y2: G - 30, c: "#8A5A2B", w: 5 }], ["line", 0, 0, 1, { x1: 170, y1: G, x2: 170, y2: G - 30, c: "#8A5A2B", w: 5 }], ["line", 0, 0, 1, { x1: 70, y1: G - 28, x2: 170, y2: G - 28, c: "#E5483A", w: 4 }], ["kid", 120, G, 1.5, kb("jump", { mouth: "open" })], ["check", 204, 50, 1.0]],
    became: [["egg", 50, G, 1.7], ["arrow", 0, 0, 1, { x1: 86, y1: 104, x2: 124, y2: 104, c: P }], ["bird", 178, G, 2.0, {}], ["rewind", 214, 26, 0.8]],
  };
  var BG6 = {
    sand: "beach", coast: "sea", current: "sea", cloud: "plain", string: "plain", glass: "in", fruit: "in", sugar: "in", cook: "in", corner: "corner", swim: "deep", board: "in", block: "in", fell: "in", lifted: "out",
    mouth: "in", nose: "in", ears: "in", foot: "in", skin: "in", wrote: "in", expect: "in", bought: "out",
    lostposter: "out", planets: "sky",
    strange: "deep", afraid: "bedroom", sharp: "in", thick: "in", thin: "in", flat: "flat", poor: "rain", safe: "rain", burning: "night", dead: "dull", bad: "in", wrong: "in", difficult: "in", fresh: "in", cool: "in", fair: "in", chance: "in", level: "in", total: "in", silent: "in",
    since: "in", happened: "in", himself: "in", yourself: "in", itself: "in", instead: "in", either: "in", quite: "snow", although: "snow", years: "in", already: "in", else: "in", another: "in", even: "plain", being: "out",
  };
  // @@SCENES_END
  A.extend({
    kit: KITS,
    scenes: S6,
    bgk: BG6,
    bg: { beach: bgBeach, deep: bgDeep, plain: bgPlain, corner: bgCorner, flat: bgFlat, bedroom: bgBedroom, dull: bgDull },
  });
})(typeof window !== "undefined" ? window : this);
