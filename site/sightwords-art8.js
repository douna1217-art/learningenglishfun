/* More little pictures for the stage-8 sight words (the polar island): things around us and numbers, people and places, doing words,
   describing words and feelings, and the last little words. It adds new kinds of things and one scene per word to sightwords-art.js (SWArt.extend;
   it also uses the things of sightwords-art3.js to sightwords-art7.js), in the same soft look, all drawn in code.
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

  function at(kind, x, y, s, o) {
    return '<g transform="translate(' + x + "," + y + ") scale(" + s + ')">' + K[kind](o || {}) + "</g>";
  }
  function man(extra) {
    return X({ shirt: "#2E7D9A", pants: "#4A4A5A", hair: "#3A2A22" }, extra);
  }
  function words(list) {
    var o = "", i;
    for (i = 0; i < list.length; i++) o += '<text x="' + list[i][0] + '" y="' + list[i][1] + '" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="' + list[i][2] + '" fill="' + list[i][3] + '">' + list[i][4] + "</text>";
    return o;
  }

  /* ------------------------------------------------------------------ new things: snow hills */
  // a can of oil with a spout (the middle of the bottom is the origin; o.pour draws a thin stream of oil from the spout)
  KITS.oilcan = function (o) {
    var s = '<path d="M-14 0 V-22 Q-14 -26 -10 -26 H8 Q12 -26 12 -22 V0Z" ' + f("#F2C14E", 2.4) + '/><path d="M10 -22 L24 -36 L28 -33 L16 -16Z" ' + f("#F2C14E", 2.2) + '/>';
    s += '<path d="M-14 -22 Q-28 -22 -24 -8 Q-22 -2 -14 -4" fill="none" stroke="#B88A20" stroke-width="3.4" stroke-linecap="round"/><rect x="-9" y="-18" width="15" height="10" rx="2" fill="#FFFFFE"/><path d="M-6 -12 H3" stroke="#5A3A1A" stroke-width="2.6" stroke-linecap="round"/>';
    if (o.pour) s += '<path d="M28 -32 Q29 -22 28 -8" fill="none" stroke="#5A3A1A" stroke-width="3.4" stroke-linecap="round"/><path d="M28 -4 Q24 2 28 5 Q32 2 28 -4Z" fill="#5A3A1A"/>';
    return s;
  };
  // a glass salt shaker (the bottom is the origin); turned upside down with rot: 180 it pours salt when o.pour is set
  KITS.saltshaker = function (o) {
    var s = '<path d="M-9 0 V-22 H9 V0Z" fill="rgba(255,255,255,.75)" stroke="#8A97AD" stroke-width="2.2" stroke-linejoin="round"/><path d="M-9 -8 H9 V0 H-9Z" fill="#FFFFFE"/>';
    s += '<path d="M-10 -22 H10 L8 -30 H-8Z" ' + f("#B9C3D8", 2) + '/><circle cx="-3" cy="-26" r="1" fill="#6A7A94"/><circle cx="3" cy="-26" r="1" fill="#6A7A94"/>';
    if (o.pour) s += '<g fill="#FFFFFE" stroke="#B9C3D8" stroke-width="1"><circle cx="-4" cy="-38" r="1.8"/><circle cx="3" cy="-42" r="1.8"/><circle cx="-2" cy="-48" r="1.8"/><circle cx="5" cy="-52" r="1.8"/><circle cx="-5" cy="-54" r="1.8"/></g>';
    return s;
  };
  // a necktie drawn on the front of a person (draw it at the person's place and scale)
  KITS.neckt = function (o) {
    return '<path d="M-3.4 -42 H3.4 L2.6 -38 L5 -26 L0 -21 L-5 -26 L-2.6 -38Z" ' + f(o.c || "#E5483A", 1.6) + '/><rect x="-3.8" y="-44" width="7.6" height="5.4" rx="1.8" ' + f(dk(o.c || "#E5483A", 0.12), 1.4) + "/>";
  };
  // a jacket with a white shirt and a tie, drawn over the front of a person (at the person's place and scale)
  KITS.suitfront = function (o) {
    var c = o.c || "#33406A";
    return '<rect x="-9.6" y="-43.6" width="19.2" height="23.6" rx="7" ' + f(c, 2.2) + '/><path d="M-4.4 -43 L0 -30 L4.4 -43Z" fill="#FFFFFE"/><path d="M-4.6 -43 L-1.2 -28 M4.6 -43 L1.2 -28" stroke="' + dk(c, 0.3) + '" stroke-width="1.4" stroke-linecap="round"/>' +
      '<path d="M-1.6 -38 H1.6 L2.4 -28 L0 -24.6 L-2.4 -28Z" fill="#E5483A"/><circle cx="0" cy="-22.6" r="1" fill="#FFFFFE"/>';
  };
  // an acoustic guitar standing on the ground (the middle of the bottom is the origin)
  KITS.guitar = function (o) {
    var s = '<rect x="-3.4" y="-84" width="6.8" height="48" rx="2" ' + f("#6B4423", 2) + '/><path d="M-4 -84 H4 L5 -92 H-5Z" ' + f("#4A2F18", 1.8) + '/>';
    s += '<path d="M-10 -38 Q-12 -50 0 -50 Q12 -50 10 -38 Q22 -34 20 -16 Q18 0 0 0 Q-18 0 -20 -16 Q-22 -34 -10 -38Z" ' + f("#D9925F", 2.6) + '/><circle cx="0" cy="-22" r="6" fill="#4A2F18"/><rect x="-8" y="-9" width="16" height="3.4" rx="1.6" fill="#6B4423"/>';
    s += '<path d="M-1.2 -84 V-9 M1.2 -84 V-9" stroke="#F4EAD0" stroke-width="1" opacity=".9"/>';
    return s;
  };
  // a small tent with a flag (the middle of the bottom is the origin)
  KITS.tent = function (o) {
    var s = '<path d="M-36 0 L0 -46 L36 0Z" ' + f("#F2943A", 2.6) + '/><path d="M0 -46 L12 0 H36Z" fill="' + dk("#F2943A", 0.18) + '"/><path d="M-9 0 L0 -26 L9 0Z" fill="#5A3A22"/>';
    s += '<path d="M0 -46 V-58" stroke="#8A5A2B" stroke-width="2.4"/><path d="M0 -58 L12 -54 L0 -50Z" fill="#E5483A"/><path d="M-36 0 L-46 6 M36 0 L46 6" stroke="#8A5A2B" stroke-width="2" stroke-linecap="round"/>';
    return s;
  };
  // three folded cloths in a stack (the middle of the bottom is the origin)
  KITS.cloth = function (o) {
    var s = "", cs = ["#FF8FB1", "#7AB8F5", "#FFD23F"], i, y;
    for (i = 0; i < 3; i++) {
      y = -i * 12;
      s += '<rect x="' + (-24 + i * 2) + '" y="' + (y - 12) + '" width="' + (48 - i * 3) + '" height="12" rx="4" ' + f(cs[i], 2.2) + '/><path d="M' + (-16 + i * 2) + " " + (y - 9) + " V" + (y - 3) + " M" + (-6 + i * 2) + " " + (y - 9) + " V" + (y - 3) + " M" + (4 + i * 2) + " " + (y - 9) + " V" + (y - 3) + '" stroke="#FFFFFE" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>';
    }
    return s;
  };
  // a snowy pine tree (the middle of the bottom is the origin)
  KITS.pinetree = function (o) {
    var g = "#2F7A5C", s = '<rect x="-3.4" y="-10" width="6.8" height="10" fill="#8A5A2B"/>';
    s += '<path d="M-24 -8 L0 -40 L24 -8Z" ' + f(g, 2.4) + '/><path d="M-19 -26 L0 -54 L19 -26Z" ' + f("#3E9A74", 2.4) + '/><path d="M-13 -44 L0 -68 L13 -44Z" ' + f(g, 2.4) + '/>';
    s += '<path d="M-6 -56 L0 -68 L6 -56 L2 -58 L0 -54 L-2 -58Z" fill="#FFFFFE"/><path d="M-12 -34 Q-6 -38 0 -35 L-3 -32Z M12 -34 Q6 -38 0 -35 L3 -32Z" fill="#FFFFFE"/><path d="M-18 -13 Q-10 -18 -2 -14 L-6 -10Z M18 -13 Q10 -18 2 -14 L6 -10Z" fill="#FFFFFE"/>';
    return s;
  };
  // an igloo with a low doorway (the middle of the bottom is the origin)
  KITS.igloo = function (o) {
    var s = '<path d="M-38 0 Q-38 -52 0 -52 Q38 -52 38 0Z" ' + f("#F4F9FF", 2.6) + '/><path d="M-36 -24 H36 M-26 -40 H26 M-12 -52 V-40 M12 -40 V-24 M-24 -24 V0 M24 -24 V0 M0 -24 V-40" stroke="#B9D2EC" stroke-width="2" fill="none"/>';
    s += '<path d="M-12 0 V-12 Q-12 -22 0 -22 Q12 -22 12 -12 V0Z" fill="#5F82AC" stroke="#3A5E8A" stroke-width="2"/>';
    return s;
  };
  // a penguin (the feet are at the origin; it looks to the right, flip: true turns it)
  KITS.penguin = function (o) {
    var s = '<ellipse cx="-5" cy="-1" rx="6" ry="3" fill="#FF9F3D" stroke="#C47A10" stroke-width="1.6"/><ellipse cx="6" cy="-1" rx="6" ry="3" fill="#FF9F3D" stroke="#C47A10" stroke-width="1.6"/>';
    s += '<ellipse cx="0" cy="-16" rx="13" ry="17" fill="#2F3A52" stroke="#1B2236" stroke-width="2.2"/><ellipse cx="2" cy="-13" rx="8.4" ry="13" fill="#FFFFFE"/><path d="M-12 -20 Q-20 -10 -14 -4 Q-10 -10 -10 -20Z" fill="#2F3A52" stroke="#1B2236" stroke-width="1.8" stroke-linejoin="round"/>';
    s += '<circle cx="0" cy="-35" r="10" fill="#2F3A52" stroke="#1B2236" stroke-width="2.2"/><circle cx="-3.4" cy="-37" r="2.4" fill="#FFFFFE"/><circle cx="4.2" cy="-37" r="2.4" fill="#FFFFFE"/><circle cx="-3" cy="-37" r="1.1" fill="#1E2A4A"/><circle cx="4.6" cy="-37" r="1.1" fill="#1E2A4A"/><path d="M-2 -32 L9 -30.6 L-2 -28Z" fill="#FF9F3D" stroke="#C47A10" stroke-width="1.4" stroke-linejoin="round"/>';
    return s;
  };
  // an atom: a nucleus with three orbits and three electrons (the middle is at 0, -34)
  KITS.atom = function (o) {
    var s = "", r, i, el = [[0, -26], [22, -13], [-22, -13]];
    for (i = 0; i < 3; i++) s += '<ellipse cx="0" cy="-34" rx="30" ry="11" fill="none" stroke="#6A48E8" stroke-width="2.4" transform="rotate(' + i * 60 + ' 0 -34)"/>';
    s += '<circle cx="0" cy="-34" r="7" ' + f("#E5483A", 2) + '/><circle cx="-2" cy="-36" r="2" fill="#FFB3A8"/>';
    for (i = 0; i < 3; i++) r = el[i], s += '<circle cx="' + (r[0] * 1.2) + '" cy="' + (-34 + r[1] * 0.5) + '" r="4.2" ' + f("#4FA8F0", 1.8) + "/>";
    return s;
  };
  // an electric plug with a cord (the cord end is at the origin, the plug is on the right)
  KITS.plug = function (o) {
    var s = '<path d="M-40 0 Q-20 -2 -8 -14 T18 -24" fill="none" stroke="#2F3A52" stroke-width="5" stroke-linecap="round"/><path d="M-40 0 Q-20 -2 -8 -14 T18 -24" fill="none" stroke="#6A7A94" stroke-width="2.2" stroke-linecap="round"/>';
    s += '<rect x="16" y="-34" width="22" height="20" rx="5" ' + f("#4FA8F0", 2.4) + '/><path d="M38 -30 H46 M38 -18 H46" stroke="#8A97AD" stroke-width="3.6" stroke-linecap="round"/><path d="M30 -33 L25 -26 H30 L27 -19 L34 -28 H29Z" fill="#FFE066" stroke="#C99A1A" stroke-width="1"/>';
    return s;
  };
  // a modern house: a flat roof, big windows (the middle of the bottom is the origin)
  KITS.modernhouse = function (o) {
    var s = '<rect x="-38" y="-32" width="76" height="32" ' + f("#E9EEF5", 2.4) + '/><rect x="-10" y="-52" width="46" height="22" ' + f("#D5DDEA", 2.4) + '/><rect x="-42" y="-37" width="84" height="6" rx="2" ' + f("#4A4F5C", 2) + '/><rect x="-14" y="-57" width="52" height="6" rx="2" ' + f("#4A4F5C", 2) + '/>';
    s += '<rect x="-32" y="-26" width="34" height="22" rx="2" fill="#9AD4F5" stroke="#4A4F5C" stroke-width="2"/><path d="M-26 -8 L-12 -24 M-14 -8 L0 -22" stroke="#FFFFFE" stroke-width="2.4" stroke-linecap="round" opacity=".7"/><rect x="8" y="-26" width="9" height="26" rx="2" fill="#4A4F5C"/><rect x="21" y="-26" width="12" height="18" rx="2" fill="#9AD4F5" stroke="#4A4F5C" stroke-width="2"/>';
    s += '<rect x="-6" y="-48" width="38" height="14" rx="2" fill="#9AD4F5" stroke="#4A4F5C" stroke-width="2"/><path d="M0 -36 L8 -46 M12 -36 L20 -46" stroke="#FFFFFE" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>';
    return s;
  };
  // a bowl of paint being mixed with a spoon (the middle of the bottom is the origin)
  KITS.mixbowl = function (o) {
    var s = '<path d="M-26 -20 H26 Q24 0 0 0 Q-24 0 -26 -20Z" ' + f("#FFFFFE", 2.4) + '/><ellipse cx="0" cy="-20" rx="26" ry="7" fill="#FFB3C7" stroke="' + dk("#FFB3C7") + '" stroke-width="2"/><path d="M-14 -20 Q-6 -26 0 -20 Q6 -14 14 -20" fill="none" stroke="#4FA8F0" stroke-width="5" stroke-linecap="round"/><path d="M-8 -22 Q0 -17 8 -22" fill="none" stroke="#FFD23F" stroke-width="3.4" stroke-linecap="round"/>';
    if (!o.nostick) s += '<path d="M2 -22 L22 -52" stroke="#8A5A2B" stroke-width="4.6" stroke-linecap="round"/><path d="M2 -22 L22 -52" stroke="#C98B4A" stroke-width="2.2" stroke-linecap="round"/>';
    return s;
  };
  // a pot with a flower vase (the middle of the bottom is the origin)
  KITS.vase = function (o) {
    return '<path d="M-10 0 Q-20 -14 -8 -30 L-6 -38 H6 L8 -30 Q20 -14 10 0Z" ' + f(o.c || "#7AB8F5", 2.4) + '/><path d="M-12 -14 Q0 -8 12 -14" fill="none" stroke="#FFFFFE" stroke-width="2.4" opacity=".7"/>';
  };
  // a round operating lamp on an arm, with a cone of light (the foot of the stand is the origin)
  KITS.oplight = function (o) {
    var s = '<path d="M-3 0 V-48 Q-3 -62 14 -64" fill="none" stroke="#8A97AD" stroke-width="4.4" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="14" ry="4" ' + f("#B9C3D8", 2) + '/>';
    s += '<path d="M6 -62 L-18 -2 H42 L22 -62Z" fill="#FFF3B0" opacity=".45"/><ellipse cx="14" cy="-64" rx="15" ry="6" ' + f("#E9EEF5", 2.2) + '/><ellipse cx="14" cy="-62" rx="10" ry="3.4" fill="#FFE98A"/>';
    return s;
  };
  // a mouse pointer (the tip is at the origin)
  KITS.cursor = function (o) {
    return '<path d="M0 0 L0 -26 L7 -20 L12 -30 L17 -28 L12 -18 L21 -18Z" fill="#FFFFFE" stroke="#1E2A4A" stroke-width="2.4" stroke-linejoin="round"/>';
  };
  // a yellow warning sign on a post (the middle of the bottom is the origin)
  KITS.warnsign = function (o) {
    var s = '<rect x="-2.6" y="-34" width="5.2" height="34" fill="#8A97AD" stroke="#6A7A94" stroke-width="1.4"/><path d="M0 -76 L24 -34 H-24Z" ' + f("#FFD23F", 3) + '/>';
    s += '<path d="M0 -66 V-48" stroke="#1E2A4A" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="-41" r="3.2" fill="#1E2A4A"/>';
    return s;
  };
  // a big cross face: red, with angry eyebrows and steam (the middle of the bottom is the origin)
  KITS.angryface = function (o) {
    var s = '<circle cx="0" cy="-40" r="32" ' + f("#FF6B5A", 3) + '/><path d="M-20 -52 L-6 -44 M20 -52 L6 -44" stroke="#1E2A4A" stroke-width="5" stroke-linecap="round"/><circle cx="-11" cy="-40" r="4" fill="#1E2A4A"/><circle cx="11" cy="-40" r="4" fill="#1E2A4A"/><path d="M-12 -20 Q0 -30 12 -20" fill="none" stroke="#1E2A4A" stroke-width="4.4" stroke-linecap="round"/>';
    s += '<path d="M-26 -68 q-6 -8 0 -14 q6 -6 0 -12 M26 -68 q6 -8 0 -14 q-6 -6 0 -12" fill="none" stroke="#B9C3D8" stroke-width="3.4" stroke-linecap="round"/>';
    return s;
  };
  // a glass broken into pieces on the floor (the middle of the bottom is the origin)
  KITS.brokenglass = function (o) {
    var p = [[-30, -2, -18, -14, -10, -2], [-8, -2, 2, -18, 12, -2], [14, -2, 24, -10, 32, -2], [-20, 4, -14, -4, -6, 4], [10, 4, 18, -3, 26, 4]], s = "", i;
    for (i = 0; i < p.length; i++) s += '<path d="M' + p[i][0] + " " + p[i][1] + " L" + p[i][2] + " " + p[i][3] + " L" + p[i][4] + " " + p[i][5] + 'Z" fill="rgba(160,215,245,.8)" stroke="#5B93C4" stroke-width="2" stroke-linejoin="round"/>';
    s += '<path d="M-16 -8 L-12 -12 M4 -12 L8 -6" stroke="#FFFFFE" stroke-width="2" stroke-linecap="round"/>';
    return s;
  };
  // a pipe organ with a keyboard (the middle of the bottom is the origin)
  KITS.organ = function (o) {
    var s = "", i, hs = [54, 44, 36, 36, 44, 54];
    s += '<rect x="-34" y="-30" width="68" height="30" ' + f("#8A5A2B", 2.4) + '/>';
    for (i = 0; i < 6; i++) s += '<rect x="' + (-32 + i * 11) + '" y="' + (-30 - hs[i]) + '" width="9" height="' + (hs[i] + 2) + '" rx="3" ' + f("#D5DDEA", 2) + '/><ellipse cx="' + (-27.5 + i * 11) + '" cy="-26" rx="2.4" ry="3.4" fill="#4A4F5C"/>';
    s += '<rect x="-30" y="-12" width="60" height="9" rx="1.6" fill="#FFFFFE" stroke="#4A4F5C" stroke-width="1.6"/><path d="M-20 -12 V-3 M-10 -12 V-3 M0 -12 V-3 M10 -12 V-3 M20 -12 V-3" stroke="#4A4F5C" stroke-width="1.4"/><path d="M-23 -12 V-7 M-13 -12 V-7 M7 -12 V-7 M17 -12 V-7" stroke="#2F3A52" stroke-width="3.4"/>';
    return s;
  };
  // a cake burnt black, with smoke (the middle of the bottom is the origin)
  KITS.burntcake = function (o) {
    var s = '<rect x="-24" y="-18" width="48" height="18" rx="5" ' + f("#4A3A32", 2.4) + '/><path d="M-24 -18 Q-12 -28 0 -22 Q12 -28 24 -18Z" ' + f("#3A2C26", 2.2) + '/><path d="M-12 -8 Q-8 -12 -4 -8 M6 -6 Q10 -10 14 -6" fill="none" stroke="#6A5648" stroke-width="2" stroke-linecap="round"/>';
    s += '<path d="M-10 -30 q-7 -8 0 -15 q7 -7 0 -14 M6 -30 q-7 -8 0 -15 q7 -7 0 -14 M20 -28 q-5 -6 0 -11 q5 -5 0 -10" fill="none" stroke="#8A97AD" stroke-width="3.4" stroke-linecap="round"/>';
    return s;
  };
  // a kid lying down on his back, head on the left (the middle of the feet is the origin)
  KITS.kidlying = function (o) {
    return '<g transform="rotate(-90)">' + K.kid(o) + "</g>";
  };
  // a red map pin with a white dot (the point is the origin)
  KITS.mappin = function (o) {
    return '<path d="M0 0 Q-12 -16 -12 -24 A12 12 0 1 1 12 -24 Q12 -16 0 0Z" ' + f("#E5483A", 2.4) + '/><circle cx="0" cy="-24" r="4.4" fill="#FFFFFE"/>';
  };

  // a tall fancy hat with a gold band and a star (the middle of the brim is the origin)
  KITS.chiefhat = function (o) {
    return '<rect x="-15" y="-46" width="30" height="42" rx="4" ' + f("#3D5AA8", 2.4) + '/><rect x="-22" y="-6" width="44" height="8" rx="4" ' + f("#2A3F80", 2.2) + '/><rect x="-15" y="-16" width="30" height="8" fill="#FFD23F" stroke="#C99A1A" stroke-width="1.6"/><path d="M0 -42 l2.4 5 l5.4 .8 l-3.9 3.8 l.9 5.4 l-4.8 -2.6 l-4.8 2.6 l.9 -5.4 l-3.9 -3.8 l5.4 -.8Z" fill="#FFE066" stroke="#C99A1A" stroke-width="1.2" stroke-linejoin="round"/>';
  };

  // a snowy slope going up to the right (picture coordinates), for climbing
  KITS.snowslope = function (o) {
    return '<path d="M0 138 L200 62 H240 V160 H0Z" fill="#FFFFFE" stroke="#B9D2EC" stroke-width="3" stroke-linejoin="round"/><path d="M0 150 L206 74" fill="none" stroke="#E4F0FF" stroke-width="6"/><path d="M30 142 q8 -4 16 0 M80 124 q8 -4 16 0 M130 106 q8 -4 16 0" fill="none" stroke="#C9E1F5" stroke-width="2.4" stroke-linecap="round"/>';
  };

  // a kid seen from behind (draw it with the same pose and options as kid): the head is covered by hair, no face
  KITS.kidback = function (o) {
    var hair = o.hair || "#6B4423", pose = o.pose || "stand", dy = 0, lean = 0;
    var s = K.kid(o);
    if (pose === "jump") dy = -16;
    if (pose === "crouch") dy = 14;
    if (pose === "run") lean = 9;
    return '<g transform="translate(0,' + dy + ") rotate(" + lean + ' 0 -22)">' + s.replace(/^<g transform="[^"]*">/, "").replace(/<\/g>$/, "") + '</g><g transform="translate(0,' + dy + ") rotate(" + lean + ' 0 -22)"><circle cx="0" cy="-53" r="12.4" ' + f(hair, 2.4) + '/><path d="M-6 -62 Q0 -66 6 -62 M-8 -55 Q0 -50 8 -55" fill="none" stroke="' + dk(hair, 0.3) + '" stroke-width="1.6" stroke-linecap="round" opacity=".7"/></g>';
  };

  // a filling-station roof with a sign, over the whole picture (picture coordinates)
  KITS.station = function (o) {
    var s = '<rect x="22" y="40" width="8" height="94" fill="#B9C3D8" stroke="#8A97AD" stroke-width="1.6"/><rect x="210" y="40" width="8" height="94" fill="#B9C3D8" stroke="#8A97AD" stroke-width="1.6"/>';
    s += '<rect x="10" y="22" width="220" height="24" rx="6" ' + f("#FFFFFE", 2.4) + '/><rect x="10" y="36" width="220" height="10" rx="4" fill="#E5483A"/>';
    s += '<text x="120" y="36" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="16" fill="#1E2A4A">OIL</text>';
    s += '<path d="M78 24 Q73 31 78 34 Q83 31 78 24Z M162 24 Q157 31 162 34 Q167 31 162 24Z" fill="#5A3A1A"/>';
    return s;
  };

  // a small plaster wrapped round one finger (the middle of the plaster is the origin; it is as wide as a finger of the big hand)
  KITS.fingerwrap = function (o) {
    return '<rect x="-12" y="-5.4" width="24" height="10.8" rx="3.4" ' + f("#F2C9A0", 2) + '/><rect x="-5" y="-5.4" width="10" height="10.8" fill="#FBE4C8"/><circle cx="-8.4" cy="-1.6" r="0.9" fill="#B98A5A"/><circle cx="-8.4" cy="1.8" r="0.9" fill="#B98A5A"/><circle cx="8.4" cy="-1.6" r="0.9" fill="#B98A5A"/><circle cx="8.4" cy="1.8" r="0.9" fill="#B98A5A"/>';
  };

  // a bandage wrapped round an arm (the middle of the bandage is the origin; it is about as wide as a child's arm, draw it over the arm)
  KITS.armwrap = function (o) {
    return '<rect x="-9" y="-9" width="18" height="18" rx="3.4" ' + f("#FFFFFE", 2.2) + '/><path d="M-9 -4 L9 -9 M-9 2 L9 -3 M-9 8 L9 3" stroke="#C9D4E6" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M-3 -2.4 h6 M0 -5.4 v6" stroke="#E5483A" stroke-width="2.2" stroke-linecap="round"/>';
  };

  // a printer with a page of writing coming out of it (the middle of the bottom is the origin)
  KITS.textprinter = function (o) {
    var s = '<rect x="-18" y="-58" width="36" height="28" rx="2" ' + f("#FFFFFE", 2) + '/><path d="M-12 -50 H12 M-12 -44 H12 M-12 -38 H4" stroke="#9FB3D1" stroke-width="2" stroke-linecap="round"/>';
    s += '<rect x="-36" y="-34" width="72" height="34" rx="6" ' + f("#C9D2E3", 2.4) + '/><rect x="-36" y="-34" width="72" height="11" rx="5" fill="#DDE4F0" stroke="' + dk("#C9D2E3") + '" stroke-width="2.4"/><rect x="-22" y="-16" width="34" height="6" rx="3" fill="#3A4256"/><circle cx="25" cy="-14" r="4" fill="#4FBF7F" stroke="#2F8F55" stroke-width="1.6"/>';
    s += '<g transform="rotate(-5 -6 -4)"><rect x="-26" y="-12" width="38" height="30" rx="2" ' + f("#FFFFFE", 2.2) + '/><path d="M-20 -4 H6 M-20 3 H6 M-20 10 H-2" stroke="#6A7A94" stroke-width="2.4" stroke-linecap="round"/></g>';
    return s;
  };

  // a round dot, like the full stop at the end of a sentence (the middle is the origin)
  KITS.reddot = function (o) {
    return '<circle r="6.4" fill="' + (o.c || "#E5483A") + '"/><circle cx="-1.8" cy="-2" r="1.8" fill="#FFFFFE" opacity=".55"/>';
  };

  // a doorway seen from outside with a warm room inside, and the door standing open on the left (the middle of the bottom is the origin)
  KITS.roomdoor = function (o) {
    var s = '<rect x="-30" y="-100" width="60" height="100" rx="3" ' + f("#8A5A2B", 2.6) + '/><rect x="-24" y="-94" width="48" height="94" fill="#FDEBD0"/><rect x="-24" y="-24" width="48" height="24" fill="#E9C48F"/><path d="M-24 -24 H24" stroke="#C99A5E" stroke-width="2"/>';
    s += '<circle cx="12" cy="-70" r="16" fill="#FFF3B0" opacity=".7"/><path d="M12 -78 V-52" stroke="#8A97AD" stroke-width="2.4"/><path d="M4 -78 H20 L24 -66 H0Z" ' + f("#FFD23F", 1.6) + '/>';
    s += '<rect x="-20" y="-52" width="14" height="14" rx="1.6" fill="#9AD4F5" stroke="#8A5A2B" stroke-width="2"/>';
    s += '<rect x="-16" y="-24" width="22" height="3" fill="#8A5A2B"/><rect x="-16" y="-38" width="5" height="14" rx="2" ' + f("#E5883A", 1.6) + '/><rect x="-16" y="-30" width="22" height="9" rx="3" ' + f("#E5883A", 1.8) + '/><path d="M-12 -21 V-14 M2 -21 V-14" stroke="#8A5A2B" stroke-width="2.4" stroke-linecap="round"/>';
    s += '<path d="M-30 -100 L-48 -92 L-48 8 L-30 0Z" ' + f("#A8713A", 2.4) + '/><circle cx="-42" cy="-46" r="2.2" fill="#FFD23F"/>';
    return s;
  };

  // @@KITS_END

  /* ------------------------------------------------------------------ backgrounds */
  // the polar day: a pale sky, snowy hills and a few fir trees at the back
  function bgPolar() {
    return '<rect width="240" height="160" fill="#D2E9FF"/><circle cx="204" cy="30" r="12" fill="#FFF1A8"/>' + at("cloud", 50, 34, 1) + at("cloud", 150, 24, 0.7) +
      '<path d="M0 104 Q60 84 120 100 T240 90 L240 160 L0 160Z" fill="#EAF3FD"/><path d="M0 120 Q70 108 150 118 T240 112 L240 160 L0 160Z" fill="#FFFFFE"/><path d="M0 138 Q80 130 150 138 T240 134 L240 160 L0 160Z" fill="#F0F6FD"/>' +
      at("pinetree", 20, 112, 0.55) + at("pinetree", 222, 108, 0.5);
  }
  // the polar night: a dark sky with green and violet northern lights and a snowy ground
  function bgAurora() {
    return '<rect width="240" height="160" fill="#1E2A5E"/><path d="M0 40 Q60 6 120 36 T240 24 V62 Q180 82 120 60 T0 74Z" fill="#7CF5C0" opacity=".45"/><path d="M0 62 Q70 30 130 58 T240 46 V80 Q180 98 120 80 T0 94Z" fill="#B58AE8" opacity=".38"/>' +
      '<g fill="#FFFFFF"><circle cx="30" cy="20" r="1.6"/><circle cx="84" cy="12" r="1.2"/><circle cx="150" cy="18" r="1.8"/><circle cx="206" cy="10" r="1.2"/><circle cx="226" cy="40" r="1.4"/><circle cx="14" cy="50" r="1.2"/></g>' +
      '<path d="M0 118 Q70 106 140 116 T240 112 L240 160 L0 160Z" fill="#E4EEFA"/><path d="M0 138 Q80 130 150 138 T240 134 L240 160 L0 160Z" fill="#D5E3F5"/>';
  }
  // the ice sea: pale sky, dark blue water and a white shore
  function bgIceSea() {
    return '<rect width="240" height="160" fill="#D2E9FF"/>' + at("cloud", 60, 30, 1) + '<rect y="84" width="240" height="76" fill="#4FA8F0"/><path d="M0 84 Q20 78 40 84 T80 84 T120 84 T160 84 T200 84 T240 84" fill="none" stroke="#FFFFFE" stroke-width="2.4"/>' +
      '<path d="M0 124 Q60 112 120 122 T240 118 L240 160 L0 160Z" fill="#FFFFFE"/><path d="M0 142 Q80 134 150 142 T240 138 L240 160 L0 160Z" fill="#E4EEFA"/>';
  }

  /* ------------------------------------------------------------------ the scenes */
  var S8 = {
    // ---- Snow hills
    wave: [["boat", 180, 106, 0.9, {}], ["kidback", 64, G, 1.5, kb("wave", {})], ["sparkle", 112, 44, 0.8]],
    planet: [["planet", 120, 108, 2.1, {}], ["star", 40, 36, 0.9], ["star", 204, 46, 0.7], ["star", 30, 112, 0.6], ["sparkle", 182, 30, 0.7]],
    oil: [["station", 0, 0, 1, {}], ["car", 78, G, 1.25, { flip: true }], ["gaspump", 206, G, 1.0, { hx: -16, hy: -30 }], ["curve", 0, 0, 1, { x1: 192, y1: G - 30, cx: 178, cy: G + 14, x2: 142, y2: G - 42, c: "#3A3F4D", w: 3.6 }], ["kid", 164, G, 1.1, kb("reach", { look: -1, flip: true, mouth: "open" })], ["line", 0, 0, 1, { x1: 134, y1: G - 46, x2: 146, y2: G - 40, c: "#8A97AD", w: 6 }]],
    salt: [["table", 142, G, 1.5, {}], ["plate", 134, G - 37, 1.2, {}], ["egg", 134, G - 39, 1.3, {}], ["kid", 56, G, 1.5, kb("wave", { look: 1, mouth: "open", arms: "none" })], ["saltshaker", 86, 54, 1.05, { rot: 125, pour: true }], ["kid", 56, G, 1.5, kb("wave", { arms: "only" })], ["sparkle", 196, 56, 0.8]],
    bone: [["dog", 110, G, 1.9, {}], ["bone", 176, G, 2.2, {}], ["heart", 150, 44, 0.9]],
    wing: [["bird", 120, G - 12, 2.5, {}], ["hl", 118, 90, 1.0, { r: 19 }], ["sparkle", 196, 40, 0.8]],
    bat: [["kid", 80, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["bat", 118, 90, 2.0, { rot: -30 }], ["ball", 178, 62, 1.5, {}], ["whoosh", 152, 78, 1.0, {}]],
    rail: [["rails", 0, G - 6, 1.0, {}], ["train", 150, G - 8, 0.9, {}], ["arrow", 0, 0, 1, { x1: 30, y1: 60, x2: 80, y2: 60 }]],
    clock: [["clockat", 150, 70, 1.5, { h: 10 }], ["kid", 52, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    tie: [["kid", 100, G, 1.7, man({ pose: "stand", mouth: "open" })], ["neckt", 100, G, 1.7, {}], ["heart", 150, 54, 0.9], ["sparkle", 60, 50, 0.8]],
    hat: [["kid", 120, G, 1.5, kb("cheer", { hat: "#E5483A", mouth: "open" })], ["heart", 176, 56, 1.0], ["sparkle", 60, 48, 0.9]],
    suit: [["kid", 110, G, 1.7, man({ pose: "stand", shirt: "#33406A", pants: "#33406A", mouth: "open" })], ["suitfront", 110, G, 1.7, {}], ["sparkle", 164, 54, 0.9], ["sparkle", 56, 70, 0.7]],
    finger: [["bighand", 120, 152, 1.85, {}], ["fingerwrap", 131, 60, 1.1, {}], ["pain", 131, 36, 1.0]],
    ear: [["ear", 120, G + 10, 2.6, {}], ["soundwave", 56, 94, 1.3, {}], ["sounds", 36, 88, 1.0, {}], ["note", 70, 50, 1.1]],
    arm: [["kid", 120, G, 1.6, kb("stand", { mouth: "sad", look: 0 })], ["armwrap", 97, 94, 1.15, {}], ["pain", 70, 92, 1.0], ["sparkle", 188, 50, 0.8]],
    instrument: [["kid", 80, G, 1.5, kb("hold", { look: 1, mouth: "open", arms: "none" })], ["guitar", 92, G, 0.9, { rot: 14 }], ["kid", 80, G, 1.5, kb("hold", { arms: "only" })], ["note", 150, 60, 1.3], ["note", 176, 40, 1.0]],
    dollar: [["table", 150, G, 1.4, {}], ["bear", 150, G - 34, 0.8, {}], ["price", 188, G - 39, 1.1, { t: "$1" }], ["kid", 56, G, 1.5, kb("point", { look: 1, mouth: "open" })]],
    cent: [["table", 150, G, 1.4, {}], ["apple", 150, G - 34, 1.6, {}], ["price", 188, G - 39, 1.1, { t: "1&#162;" }], ["kid", 56, G, 1.5, kb("point", { look: 1, mouth: "open" })]],
    print: [["textprinter", 150, G - 14, 1.9, {}], ["kid", 56, G, 1.45, kb("reach", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 164, y1: 112, x2: 164, y2: 134, c: P }], ["sparkle", 196, 40, 0.8]],
    camp: [["tent", 110, G, 1.6, {}], ["fire", 176, G, 1.1, {}], ["kid", 34, G, 1.2, kb("wave", { look: 1, mouth: "open" })], ["pinetree", 218, G - 4, 0.8]],
    supply: [["crate", 100, G, 1.5, {}], ["crate", 160, G, 1.5, {}], ["crate", 130, G - 52, 1.5, {}], ["apple", 100, G - 36, 0.7], ["loaf", 160, G - 36, 0.8], ["check", 196, 60, 1.0]],
    material: [["cloth", 130, G, 1.9, {}], ["kid", 58, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["sparkle", 186, 48, 0.8]],
    property: [["house", 120, G - 2, 1.5, {}], ["fence", 120, G + 6, 1.8, {}], ["hl", 120, 98, 1.0, { r: 76 }], ["flag", 196, G, 1.0, {}]],
    noon: [["sunbig", 120, 46, 1.0, {}], ["clockat", 120, 112, 1.5, { h: 12 }], ["kid", 40, G, 1.2, kb("look", { look: 1, mouth: "o" })]],
    month: [["txt", 120, 44, 1, { t: "MAY", size: 32, c: "#E5483A" }], ["calpage", 120, 140, 1.25, { today: 15 }]],
    nine: [["num", 120, 34, 1.5, { n: 9 }], ["cat", 70, 90, 0.5, {}], ["cat", 120, 90, 0.5, {}], ["cat", 170, 90, 0.5, {}], ["cat", 70, 118, 0.5, {}], ["cat", 120, 118, 0.5, {}], ["cat", 170, 118, 0.5, {}], ["cat", 70, 146, 0.5, {}], ["cat", 120, 146, 0.5, {}], ["cat", 170, 146, 0.5, {}]],
    twenty: [["num", 120, 34, 1.2, { n: 20 }], ["cat", 46, 76, 0.34, {}], ["cat", 83, 76, 0.34, {}], ["cat", 120, 76, 0.34, {}], ["cat", 157, 76, 0.34, {}], ["cat", 194, 76, 0.34, {}], ["cat", 46, 100, 0.34, {}], ["cat", 83, 100, 0.34, {}], ["cat", 120, 100, 0.34, {}], ["cat", 157, 100, 0.34, {}], ["cat", 194, 100, 0.34, {}], ["cat", 46, 124, 0.34, {}], ["cat", 83, 124, 0.34, {}], ["cat", 120, 124, 0.34, {}], ["cat", 157, 124, 0.34, {}], ["cat", 194, 124, 0.34, {}], ["cat", 46, 148, 0.34, {}], ["cat", 83, 148, 0.34, {}], ["cat", 120, 148, 0.34, {}], ["cat", 157, 148, 0.34, {}], ["cat", 194, 148, 0.34, {}]],
    century: [["txt", 120, 50, 1, { t: "100 YEARS", size: 22, c: "#6A48E8" }], ["line", 0, 0, 1, { x1: 30, y1: 126, x2: 210, y2: 126, c: "#6A48E8", w: 3.4 }], ["house", 56, 120, 0.8, {}], ["modernhouse", 184, 120, 0.8, {}], ["arrow", 0, 0, 1, { x1: 86, y1: 138, x2: 156, y2: 138, c: P }]],
    // ---- Igloo village
    neighbor: [["house", 56, G, 1.3, {}], ["house", 188, G, 1.3, {}], ["fence", 122, G + 4, 1.0, {}], ["kid", 100, G, 1.2, kb("wave", { look: 1, mouth: "open" })], ["kid", 144, G, 1.4, man({ pose: "wave", look: -1, mouth: "open" })], ["dog", 168, G + 2, 0.7, {}]],
    chief: [["kid", 110, G, 1.4, man({ pose: "stand", shirt: "#8B6BE8", mouth: "open" })], ["chiefhat", 110, 43, 0.7, {}], ["medal", 110, G - 40, 0.9, {}], ["sparkle", 164, 52, 0.9]],
    colony: [["penguin", 70, G - 6, 1.0, {}], ["penguin", 110, G - 2, 1.2, {}], ["penguin", 150, G - 8, 0.9, { flip: true }], ["penguin", 188, G, 1.1, { flip: true }], ["penguin", 36, G, 0.9, {}], ["sparkle", 130, 40, 0.8]],
    human: [["kid", 90, G, 1.7, kb("self", { look: 0, mouth: "open" })], ["dog", 168, G, 1.1, {}], ["cat", 206, G, 0.9, {}], ["heart", 128, 40, 0.9]],
    character: [["book", 120, G - 4, 2.3, {}], ["kid", 120, G - 58, 1.0, kg("cheer", { look: 0, mouth: "open" })], ["sparkle", 56, 60, 0.9], ["sparkle", 190, 56, 0.9]],
    region: [["mapk", 120, 114, 1.9, {}], ["hl", 120, 82, 1.0, { r: 34 }], ["flake", 60, 54, 0.9], ["flake", 184, 48, 0.8]],
    continent: [["globe", 120, G + 2, 2.0, {}], ["hl", 108, 78, 1.0, { r: 24 }], ["sparkle", 186, 40, 0.8]],
    capital: [["skyscraper", 80, G, 1.2, {}], ["skyscraper", 154, G, 1.4, {}], ["skyscraper", 196, G, 0.9, {}], ["flagpole", 118, G, 0.9, {}], ["star", 154, 18, 0.8]],
    nation: [["flagpole", 120, G, 1.25, {}], ["kid", 60, G, 1.3, kb("cheer", { look: 1, mouth: "open" })], ["kid", 180, G, 1.3, kg("cheer", { look: -1, mouth: "open" })], ["heart", 146, 24, 0.7]],
    subject: [["blackboard", 150, G - 22, 1.5, {}], ["txt", 150, G - 56, 1, { t: "ART", size: 28, c: "#FFFFFE" }], ["kid", 56, G, 1.5, kb("point", { look: 1, mouth: "open" })], ["heart", 100, 46, 0.8]],
    history: [["kid", 44, G, 1.4, kb("point", { look: 1, mouth: "open", arms: "none" })], ["book", 94, 82, 0.75, {}], ["kid", 44, G, 1.4, kb("point", { arms: "only" })], ["thought", 180, 40, 1.0, { w: 100, h: 68, inner: [["castle", -22, 28, 0.28, {}], ["hourglass", 28, 26, 0.7, {}]] }]],
    period: [["txt", 80, 100, 1, { t: "I see", size: 46, c: "#1E2A4A" }], ["reddot", 150, 96, 1.5, {}], ["circ", 150, 94, 1.0, { r: 20 }], ["arrow", 0, 0, 1, { x1: 190, y1: 56, x2: 164, y2: 82, c: P }]],
    age: [["candlecake", 160, G, 1.6, {}], ["kid", 70, G, 1.5, kb("cheer", { mouth: "open" })], ["qm", 120, 38, 1.1]],
    position: [["dog", 120, 124, 1.6, {}], ["cross", 120, 146, 0.8, {}], ["hl", 120, 142, 1.0, { r: 22 }], ["sparkle", 176, 60, 0.8]],
    general: [["kid", 80, G, 1.6, kb("look", { look: 1, mouth: "open" })], ["thought", 168, 62, 1.0, { w: 88, h: 58, inner: [["bulb", 0, 16, 0.7, {}], ["qm", 22, -4, 0.5]] }]],
    law: [["trafficlight", 150, G, 1.7, {}], ["kid", 70, G, 1.4, kb("stand", { look: 1, mouth: "open" })], ["kid", 104, G, 1.2, kg("stand", { look: 1, mouth: "open" })], ["stopsign", 206, G, 1.1, {}]],
    term: [["calendar", 34, 122, 0.62, {}], ["calendar", 80, 122, 0.62, {}], ["calendar", 126, 122, 0.62, {}], ["school", 200, G, 0.8, {}], ["line", 0, 0, 1, { x1: 14, y1: 142, x2: 146, y2: 142, c: "#6A48E8", w: 3.4 }]],
    symbol: [["heart", 66, 108, 2.2, {}], ["txt", 118, 96, 1, { t: "=", size: 36, c: P }], ["txt", 172, 98, 1, { t: "LOVE", size: 24, c: "#E5483A" }]],
    atom: [["atom", 120, G + 8, 2.0, {}], ["sparkle", 36, 40, 0.8], ["sparkle", 206, 44, 0.8]],
    temperature: [["thermo", 120, G, 1.4, {}], ["flake", 60, 50, 1.0], ["flake", 180, 60, 1.0], ["shiver", 90, 110, 1.0]],
    industry: [["factory", 78, G, 1.05, {}], ["crane", 190, G, 0.6, {}], ["truck", 138, G + 6, 0.5, {}]],
    electric: [["car", 100, G, 1.4, {}], ["plug", 190, G, 1.0, { flip: true }], ["bolt", 150, 70, 1.4, {}], ["sparkle", 60, 56, 0.8]],
    modern: [["modernhouse", 120, G, 1.8, {}], ["sparkle", 196, 44, 0.9], ["sparkle", 40, 60, 0.7]],
    value: [["goldbars", 100, G, 2.0, {}], ["coinstack", 170, G, 2.0, {}], ["star", 136, 36, 1.0], ["sparkle", 62, 60, 0.8]],
    experiment: [["table", 154, G, 1.6, {}], ["flask", 122, G - 39, 1.3, {}], ["microscope", 182, G - 39, 0.9, {}], ["bubbles", 124, 52, 1.0, {}], ["kid", 52, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["sparkle", 206, 44, 0.8]],
    method: [["num", 50, 82, 1.4, { n: 1 }], ["num", 120, 82, 1.4, { n: 2 }], ["num", 190, 82, 1.4, { n: 3 }], ["arrow", 0, 0, 1, { x1: 66, y1: 80, x2: 100, y2: 80 }], ["arrow", 0, 0, 1, { x1: 136, y1: 80, x2: 170, y2: 80 }], ["check", 190, 128, 1.1]],
    process: [["seeds", 48, G, 1.8, {}], ["sprout", 120, G, 2.0, {}], ["flower", 196, G, 1.6, {}], ["arrow", 0, 0, 1, { x1: 66, y1: 110, x2: 98, y2: 110 }], ["arrow", 0, 0, 1, { x1: 140, y1: 110, x2: 172, y2: 110 }]],
    result: [["scoreboard", 120, G, 1.4, { a: 5, b: 2 }], ["check", 186, 44, 1.2], ["heart", 56, 40, 0.9]],
    // ---- Frozen lake
    climb: [["snowslope", 0, 0, 1, {}], ["kid", 70, 112, 0.9, kb("walk", { look: 1, mouth: "open" })], ["kid", 116, 94, 0.8, kg("walk", { look: 1, mouth: "open" })], ["flag", 204, 62, 1.0, {}]],
    catch: [["kid", 100, G, 1.5, kb("cup", { look: 0, mouth: "open", arms: "none" })], ["ball", 100, 108, 1.2, {}], ["kid", 100, G, 1.5, kb("cup", { arms: "only" })], ["curve", 0, 0, 1, { x1: 210, y1: 26, cx: 168, cy: 22, x2: 110, y2: 84, c: "#6A48E8", w: 2.4, dash: true }], ["sparkle", 160, 66, 0.9], ["heart", 56, 46, 0.8]],
    push: [["kid", 50, G, 1.5, kb("push", { look: 1, mouth: "open" })], ["crate", 142, G, 1.4, {}], ["sweat", 48, 52, 0.8], ["arrow", 0, 0, 1, { x1: 176, y1: 60, x2: 214, y2: 60, c: P }]],
    lift: [["kid", 120, G, 1.4, kb("lift", { look: 0, mouth: "open" })], ["box", 120, 46, 1.0, {}], ["sweat", 158, 70, 0.8]],
    throw: [["kid", 56, G, 1.4, kb("throw", { look: 1, mouth: "open", arms: "none" })], ["ball", 91, 38, 1.1, {}], ["kid", 56, G, 1.4, kb("throw", { arms: "only" })], ["curve", 0, 0, 1, { x1: 104, y1: 36, cx: 166, cy: -26, x2: 224, y2: 112, c: "#6A48E8", w: 2.6, dash: true }], ["whoosh", 78, 34, 0.8, {}]],
    gather: [["fire", 120, G, 1.3, {}], ["kid", 56, G, 1.3, kb("hands", { look: 1, mouth: "open" })], ["kid", 188, G, 1.3, kg("hands", { look: -1, mouth: "open" })], ["kid", 90, G + 6, 1.1, ky("hands", { look: 1 })]],
    stretch: [["kid", 120, G, 1.4, kb("lift", { mouth: "o", look: 0 })], ["sunbig", 206, 40, 0.7, {}], ["sparkle", 56, 60, 0.8]],
    roll: [["hill", 110, G, 1.0, {}], ["ball", 80, 88, 2.2, { c: "#FFFFFE" }], ["whoosh", 56, 76, 1.0, {}], ["arrow", 0, 0, 1, { x1: 110, y1: 70, x2: 160, y2: 104, c: P }]],
    burn: [["logs", 120, G, 1.6, {}], ["fire", 120, G - 12, 1.5, {}], ["sparkle", 178, 50, 0.8], ["sparkle", 64, 56, 0.7]],
    mix: [["mixbowl", 152, G, 2.0, { nostick: true }], ["kid", 78, G, 1.5, kb("point", { look: 1, mouth: "open", arms: "none" })], ["line", 0, 0, 1, { x1: 124, y1: 52, x2: 148, y2: 100, c: "#C98B4A", w: 4.6 }], ["kid", 78, G, 1.5, kb("point", { arms: "only" })], ["sparkle", 206, 44, 0.8]],
    shout: [["kid", 78, G, 1.6, kb("cheer", { look: 1, mouth: "open" })], ["dog", 190, G, 1.1, {}], ["bubble", 150, 36, 1.0, { w: 86, h: 40, inner: [["txt", 0, 7, 1, { t: "HEY!", size: 20, c: "#E5483A" }]] }]],
    join: [["kid", 40, G, 1.3, kb("run", { look: 1, mouth: "open" })], ["kid", 140, G, 1.3, kg("hands", { look: 0, mouth: "open" })], ["kid", 182, G, 1.3, ky("hands", { look: 0, mouth: "open" })], ["ball", 160, G, 1.3, {}], ["arrow", 0, 0, 1, { x1: 66, y1: 60, x2: 110, y2: 60, c: P }]],
    enter: [["roomdoor", 198, G, 1.15, {}], ["kid", 26, G, 1.15, kb("walk", { look: 1, mouth: "open" })], ["kid", 72, G, 1.15, kg("walk", { look: 1, mouth: "open" })], ["kid", 118, G, 1.15, ky("walk", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 138, y1: 40, x2: 164, y2: 40, c: P }]],
    search: [["kid", 56, G, 1.5, kb("crouch", { look: 1, mouth: "o", arms: "none" })], ["hat", 168, G + 4, 0.8, {}], ["mag", 116, 114, 1.5, { rot: 145 }], ["kid", 56, G, 1.5, kb("crouch", { arms: "only" })], ["qm", 120, 40, 1.0]],
    hunt: [["cat", 90, G, 1.7, {}], ["bird", 188, G, 1.0, {}], ["arrow", 0, 0, 1, { x1: 120, y1: 100, x2: 166, y2: 100, c: P }]],
    collect: [["rock", 160, 101, 0.42, {}], ["rock", 181, 98, 0.48, {}], ["rock", 201, 101, 0.4, {}], ["bucket", 180, G, 1.8, {}], ["rock", 74, G + 4, 0.42, {}], ["rock", 104, G + 8, 0.36, {}], ["kid", 50, G - 2, 1.4, kb("reach", { look: 1, mouth: "open", arms: "none" })], ["rock", 94, 84, 0.42, {}], ["kid", 50, G - 2, 1.4, kb("reach", { arms: "only" })], ["arrow", 0, 0, 1, { x1: 112, y1: 66, x2: 140, y2: 66, c: P }]],
    settle: [["tree", 130, G, 1.5, {}], ["bird", 150, 62, 0.9, {}], ["bird", 176, 78, 0.8, { flip: true }], ["bird", 96, 44, 0.8, { fly: true }], ["arrow", 0, 0, 1, { x1: 92, y1: 60, x2: 108, y2: 72, c: P }]],
    receive: [["kid", 70, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["kid", 170, G, 1.5, man({ pose: "reach", look: -1, mouth: "open" })], ["letter", 120, 98, 1.0, {}], ["arrow", 0, 0, 1, { x1: 150, y1: 66, x2: 104, y2: 66, c: P }]],
    mount: [["horse", 144, G, 1.35, {}], ["kid", 98, G, 1.4, kb("mount", { look: 1, mouth: "open" })], ["sparkle", 206, 40, 0.8]],
    finish: [["table", 160, G, 1.6], ["cbook", 160, G - 41, 1.3], ["kid", 82, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["check", 200, 44, 1.1], ["heart", 120, 40, 0.8]],
    arrange: [["table", 120, G, 1.5, {}], ["vase", 120, G - 34, 1.2, {}], ["flower", 106, G - 58, 0.9, {}], ["flower", 120, G - 64, 1.0, { c: "#FFD23F" }], ["flower", 134, G - 58, 0.9, { c: "#FF8FB1" }], ["kid", 56, G, 1.5, kb("reach", { look: 1, mouth: "open" })]],
    invent: [["kid", 70, G, 1.5, kb("look", { look: 1, mouth: "open" })], ["bulb", 70, 38, 1.2, {}], ["blueprint", 160, 96, 0.9, {}], ["robot", 196, G, 0.9, {}], ["sparkle", 120, 52, 0.8]],
    operate: [["bed", 150, G, 1.5, {}], ["bear", 150, G - 24, 0.7, {}], ["oplight", 196, G, 1.0, {}], ["kid", 90, G, 1.5, man({ pose: "hands", shirt: "#7AD7C9", look: 1, mouth: "open" })], ["redcross", 56, G, 0.7, {}]],
    select: [["table", 160, G, 1.7], ["hat", 130, G - 43, 0.75, { c: "#3D8BF2" }], ["hat", 162, G - 43, 0.75, { c: "#E5483A" }], ["hat", 194, G - 43, 0.75, { c: "#FFD23F" }], ["hl", 162, G - 54, 1.0, { r: 17 }], ["check", 200, 40, 1.0], ["kid", 60, G, 1.5, kb("point", { look: 1, mouth: "open" })]],
    prepare: [["table", 150, G, 1.5, {}], ["knife", 130, G - 36, 1.0, {}], ["apple", 168, G - 36, 1.3, {}], ["orange", 190, G - 36, 1.3, {}], ["kid", 60, G, 1.5, kb("reach", { look: 1, mouth: "open" })]],
    repeat: [["kid", 60, G, 1.5, kb("wave", { look: 1, mouth: "open" })], ["kid", 180, G, 1.5, kg("wave", { look: -1, mouth: "open" })], ["bubble", 70, 16, 0.75, { w: 64, h: 34, inner: [["txt", 0, 6, 1, { t: "Hi!", size: 18, c: "#3D8BF2" }]] }], ["bubble", 170, 16, 0.75, { w: 64, h: 34, inner: [["txt", 0, 6, 1, { t: "Hi!", size: 18, c: "#FF7FA8" }]] }], ["retry", 120, 100, 1.2, {}]],
    allow: [["mom", 70, G, 1.6, { pose: "stand", look: 1, mouth: "open" }], ["kid", 150, G, 1.4, kb("cheer", { look: -1, mouth: "open" })], ["ball", 196, G, 1.4, {}], ["check", 110, 40, 1.2]],
    // ---- Northern lights
    grand: [["castle", 120, G + 2, 1.45, {}], ["flag", 56, G, 1.0, {}], ["flag", 184, G, 1.0, {}], ["sparkle", 190, 36, 0.9], ["sparkle", 50, 54, 0.8]],
    gentle: [["kid", 66, G, 1.5, kg("reach", { look: 1, mouth: "open" })], ["cat", 150, G, 1.7, {}], ["heart", 112, 40, 1.0], ["sparkle", 190, 56, 0.8]],
    natural: [["tree", 112, G, 1.4, {}], ["bush", 46, G, 0.9, {}], ["flower", 180, G, 1.1, { c: "#FF6FA0" }], ["flower", 204, G, 0.9, { c: "#FFD23F" }], ["bird", 190, 46, 0.8, {}], ["sparkle", 36, 40, 0.8]],
    broad: [["widewater", 120, 98, 1.0, {}], ["pinetree", 36, 62, 0.5, {}], ["pinetree", 204, 62, 0.45, {}], ["pinetree", 176, 60, 0.35, {}], ["arrow", 0, 0, 1, { x1: 120, y1: 98, x2: 120, y2: 62, c: P }], ["arrow", 0, 0, 1, { x1: 120, y1: 98, x2: 120, y2: 134, c: P }]],
    gray: [["cat", 120, G, 1.9, { c: "#9AA3B2", l: "#D5DAE3" }], ["sparkle", 200, 46, 0.8]],
    lone: [["bird", 120, 80, 1.4, { fly: true }], ["cloud", 60, 40, 0.8, {}], ["cloud", 190, 100, 0.8, {}]],
    joy: [["kid", 120, G, 1.5, kg("jump", { mouth: "open" })], ["heart", 66, 56, 1.0], ["heart", 176, 60, 1.0], ["star", 150, 24, 0.9], ["star", 84, 24, 0.8]],
    excite: [["kid", 90, G, 1.4, kb("jump", { mouth: "open" })], ["soccer", 170, G, 1.5, {}], ["star", 56, 36, 1.0], ["star", 196, 46, 0.9], ["exm", 130, 34, 0.9]],
    smile: [["facebig", 120, G + 14, 1.4, {}], ["heart", 196, 48, 0.9], ["sparkle", 44, 52, 0.9]],
    sudden: [["sunbig", 44, 44, 0.7, {}], ["kid", 150, G, 1.5, kb("stand", { mouth: "o", look: 0 })], ["exm", 196, 56, 1.1]],
    noise: [["drum", 160, G, 1.7, {}], ["kid", 70, G, 1.5, kb("ears", { mouth: "o" })], ["sounds", 124, 70, 1.4, {}], ["sounds", 200, 60, 1.1, {}]],
    sight: [["sunbig", 150, 96, 1.3, {}], ["eyebig", 66, 56, 1.4, {}], ["sparkle", 196, 40, 0.9], ["sparkle", 104, 34, 0.7]],
    sense: [["kid", 90, G, 1.7, kb("drink", { look: 1, mouth: "o", arms: "none" })], ["cookie", 117, 66, 0.6, {}], ["smell", 120, 56, 0.8, {}], ["kid", 90, G, 1.7, kb("drink", { look: 1, mouth: "o", arms: "only" })], ["heart", 196, 44, 0.9]],
    tone: [["note", 90, 76, 1.8], ["note", 134, 56, 1.4], ["soundwave", 118, 100, 1.5, {}], ["kid", 196, G, 1.3, kg("self", { mouth: "open" })]],
    shine: [["sunbig", 120, 76, 1.7, {}], ["sparkle", 46, 40, 1.0], ["sparkle", 198, 54, 1.0], ["sparkle", 150, 20, 0.8]],
    fear: [["kid", 110, G, 1.7, kb("hands", { mouth: "o", look: 0 })], ["shiver", 70, 90, 1.2], ["shiver", 150, 90, 1.2], ["exm", 176, 46, 1.0], ["qm", 52, 50, 0.9]],
    danger: [["warnsign", 72, G, 1.5, {}], ["pithole", 150, G + 8, 1.3, {}], ["kid", 204, G, 1.2, kb("stand", { mouth: "o", look: -1 })], ["exm", 120, 40, 1.0]],
    anger: [["angryface", 120, G, 1.9, {}]],
    necessary: [["waterglass", 150, G - 6, 2.2, {}], ["kid", 60, G, 1.5, kb("drink", { look: 0, mouth: "open" })], ["check", 196, 50, 1.2]],
    particular: [["hat", 92, G, 1.2, { c: "#3D8BF2" }], ["hat", 128, G, 1.2, { c: "#FFD23F" }], ["hat", 164, G, 1.2, { c: "#E5483A" }], ["hat", 200, G, 1.2, { c: "#7ED957" }], ["hl", 164, G - 10, 1.0, { r: 22 }], ["kid", 44, G, 1.4, kb("point", { look: 1, mouth: "open" })]],
    exact: [["clock", 96, G, 3.4, {}], ["txt", 186, 92, 1, { t: "4:00", size: 26, c: "#6A48E8" }], ["check", 200, 38, 1.1]],
    major: [["line", 0, 0, 1, { x1: 0, y1: 108, x2: 240, y2: 108, c: "#7B8394", w: 30 }], ["line", 0, 0, 1, { x1: 10, y1: 108, x2: 230, y2: 108, dash: true, c: "#FFE066", w: 3 }], ["car", 56, 112, 0.7, {}], ["truck", 138, 114, 0.6, {}], ["signpost", 208, G, 0.7, {}]],
    probable: [["raincloud", 110, 56, 1.8, {}], ["txt", 110, 98, 1, { t: "80%", size: 34, c: "#3D5AFE" }], ["umbrella", 196, G, 1.0, {}], ["qm", 190, 40, 0.9]],
    vary: [["hat", 40, G, 1.2, { c: "#3D8BF2" }], ["hat", 80, G, 1.2, { c: "#FFD23F" }], ["hat", 120, G, 1.2, { c: "#E5483A" }], ["hat", 160, G, 1.2, { c: "#7ED957" }], ["hat", 200, G, 1.2, { c: "#B58AE8" }], ["sparkle", 120, 60, 1.0]],
    prove: [["kid", 66, G, 1.5, kb("point", { look: 1, mouth: "open", arms: "none" })], ["paper", 121, 90, 0.8, { rot: -8 }], ["kid", 66, G, 1.5, kb("point", { arms: "only" })], ["check", 196, 56, 1.4], ["sparkle", 50, 44, 0.8]],
    represent: [["flagpole", 46, G, 1.3, {}], ["txt", 96, 92, 1, { t: "=", size: 38, c: P }], ["kid", 142, G, 1.2, kr("stand", { mouth: "open" })], ["kid", 178, G, 1.2, kr("cheer", { mouth: "open" })], ["kid", 212, G, 1.2, kr("stand", { mouth: "open" })]],
    indicate: [["signpost", 140, G, 1.8, {}], ["kid", 62, G, 1.5, kb("look", { look: 1, mouth: "open" })], ["sparkle", 196, 40, 0.8]],
    locate: [["mapboard", 160, G, 1.5, {}], ["mappin", 176, 64, 1.0, {}], ["kid", 60, G, 1.5, kb("point", { look: 1, mouth: "open" })], ["qm", 100, 40, 1.0]],
    // ---- Penguin cove
    continue: [["kid", 56, G, 1.3, kb("walk", { look: 1, mouth: "open" })], ["kid", 96, G, 1.2, kg("walk", { look: 1, mouth: "open" })], ["prints", 168, G + 8, 1.6, {}], ["arrow", 0, 0, 1, { x1: 130, y1: 60, x2: 200, y2: 60, c: P }], ["dots", 214, 62, 1.0, {}]],
    suggest: [["kid", 56, G, 1.5, kb("wave", { look: 1, mouth: "open" })], ["kid", 190, G, 1.5, kg("stand", { look: -1, mouth: "open" })], ["bubble", 112, 44, 1.0, { w: 82, h: 54, inner: [["gameboard", 0, 24, 0.5, {}]] }]],
    agree: [["kid", 66, G, 1.5, kb("stand", { look: 1, mouth: "open" })], ["kid", 174, G, 1.5, kg("stand", { look: -1, mouth: "open" })], ["check", 120, 56, 1.8], ["heart", 120, 106, 0.8]],
    provide: [["barn", 52, G, 0.9, {}], ["basketof", 120, G, 1.9, {}], ["kid", 190, G, 1.5, kb("reach", { look: -1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 130, y1: 70, x2: 166, y2: 70, c: P }]],
    imagine: [["kid", 66, G, 1.5, kb("look", { look: 1, mouth: "o" })], ["thought", 166, 56, 1.2, { w: 104, h: 72, inner: [["castle", 0, 28, 0.4, {}]] }], ["sparkle", 206, 100, 0.8]],
    include: [["box", 110, G, 2.1, {}], ["bear", 110, G - 40, 0.7, {}], ["blocks", 150, G - 46, 0.5, {}], ["check", 186, 56, 1.3]],
    divide: [["kid", 44, G, 1.2, kb("stand", { mouth: "open" })], ["kid", 120, G, 1.2, kg("stand", { mouth: "open" })], ["kid", 196, G, 1.2, ky("stand", { mouth: "open" })], ["apple", 38, G + 12, 0.8], ["apple", 56, G + 12, 0.8], ["apple", 114, G + 12, 0.8], ["apple", 132, G + 12, 0.8], ["apple", 190, G + 12, 0.8], ["apple", 208, G + 12, 0.8], ["txt", 120, 36, 1, { t: "6 ÷ 3 = 2", size: 24, c: "#6A48E8" }]],
    depend: [["mom", 92, G, 1.8, { pose: "stand", look: 1 }], ["kid", 146, G, 1.2, kb("stand", { look: -1, mouth: "open" })], ["heart", 120, 38, 1.0]],
    rub: [["kid", 112, G, 1.7, kb("hands", { mouth: "o" })], ["flake", 44, 52, 1.0], ["flake", 196, 66, 0.9], ["steam", 154, 100, 1.2, {}], ["whoosh", 70, 96, 0.8, {}]],
    hurry: [["kid", 100, G, 1.6, kb("run", { look: 1, mouth: "o" })], ["clockat", 190, 76, 1.5, { h: 8 }], ["whoosh", 44, 96, 1.0, {}], ["sweat", 130, 44, 0.9], ["exm", 214, 30, 0.9]],
    determine: [["scales", 150, G, 1.25, { n: 3 }], ["kid", 52, G, 1.5, kb("point", { look: 1, mouth: "open" })], ["check", 204, 44, 1.0]],
    require: [["sprout", 100, G, 2.4, {}], ["bucket", 176, G, 1.5, { rot: -30 }], ["splash", 140, 86, 1.1, {}], ["qm", 60, 52, 0.9]],
    consider: [["kid", 66, G, 1.6, kb("look", { look: 1, mouth: "open" })], ["thought", 168, 58, 1.1, { w: 110, h: 72, inner: [["hat", -24, 26, 0.5, { c: "#E5483A" }], ["hat", 24, 26, 0.5, { c: "#3D8BF2" }], ["qm", 0, -6, 0.6, {}]] }]],
    reason: [["kid", 56, G, 1.3, kb("point", { look: 1, mouth: "open" })], ["kid", 190, G, 1.3, kg("stand", { look: -1, mouth: "open" })], ["bubble", 76, 28, 0.9, { w: 74, h: 38, inner: [["txt", 0, 8, 1, { t: "Why?", size: 20, c: "#E5483A" }]] }], ["bubble", 168, 28, 0.9, { tail: "right", w: 96, h: 38, inner: [["txt", 0, 7, 1, { t: "Because", size: 17, c: "#3D8BF2" }]] }]],
    event: [["balloons", 44, G, 1.3, {}], ["balloons", 198, G, 1.3, {}], ["kid", 100, G, 1.3, kg("cheer", { mouth: "open" })], ["kid", 142, G, 1.3, kb("cheer", { mouth: "open" })], ["gift", 120, G + 8, 1.0, {}], ["txt", 120, 34, 1, { t: "PARTY", size: 26, c: "#E5483A" }]],
    success: [["trophy", 130, G, 2.0, {}], ["kid", 60, G, 1.4, kb("cheer", { mouth: "open" })], ["star", 196, 40, 1.0], ["sparkle", 80, 36, 0.8], ["medal", 196, G, 1.3, {}]],
    effect: [["raincloud", 56, 54, 1.3, {}], ["arrow", 0, 0, 1, { x1: 94, y1: 96, x2: 142, y2: 96, c: P }], ["sprout", 190, G, 2.1, {}], ["flower", 150, G, 1.2, {}]],
    perhaps: [["sunbig", 62, 60, 1.0, {}], ["raincloud", 182, 56, 1.2, {}], ["kid", 120, G, 1.5, kb("hands", { mouth: "o" })], ["qm", 120, 38, 1.2]],
    rather: [["book", 44, G + 2, 1.1, {}], ["cross", 44, 84, 1.0], ["kid", 112, G, 1.5, kb("point", { look: 1, mouth: "open" })], ["ball", 196, G, 1.6, {}], ["check", 196, 72, 1.0], ["sparkle", 160, 40, 0.7]],
    whether: [["sunbig", 52, 72, 0.9, {}], ["txt", 120, 82, 1, { t: "or", size: 22, c: P }], ["flake", 190, 72, 1.7], ["qm", 120, 32, 1.2], ["kid", 120, G, 1.4, kb("look", { mouth: "open" })]],
    thus: [["kid", 50, G, 1.3, kb("run", { look: 1, mouth: "open" })], ["whoosh", 22, 92, 0.9, {}], ["arrow", 0, 0, 1, { x1: 82, y1: 74, x2: 120, y2: 74, c: P }], ["podium", 172, G, 1.1, {}], ["kid", 172, G - 68, 0.85, kb("cheer", { mouth: "open" })]],
    claim: [["chair", 110, G, 2.0, {}], ["tag", 110, G - 76, 0.9, { t: "Me" }], ["kid", 190, G, 1.5, kb("reach", { look: -1, mouth: "open" })], ["sparkle", 56, 56, 0.8]],
    spoke: [["mom", 66, G, 1.6, { pose: "stand", look: 1, mouth: "open" }], ["kid", 164, G, 1.4, kb("stand", { look: -1, mouth: "open" })], ["bubble", 100, 36, 0.8, { w: 66, h: 34, inner: [["txt", 0, 6, 1, { t: "Hi!", size: 16, c: "#8B6BE8" }]] }], ["rewind", 208, 40, 0.9]],
    broke: [["brokenglass", 140, G, 1.7, {}], ["kid", 60, G, 1.5, kb("stand", { mouth: "o", look: 1 })], ["exm", 106, 36, 1.0]],
    clothe: [["mom", 66, G, 1.6, { pose: "reach", look: 1, mouth: "open" }], ["baby", 140, G, 1.7, {}], ["hat", 140, G - 80, 0.7, { c: "#E5483A" }], ["coat", 204, G, 0.9, {}]],
    lie: [["bed", 130, G, 1.7, {}], ["kidlying", 168, G - 48, 0.9, kb("stand", { mouth: "open" })], ["zzz", 74, 70, 1.0, {}]],
    organ: [["organ", 150, G, 1.4, {}], ["kid", 66, G, 1.4, kg("reach", { look: 1, mouth: "open" })], ["note", 108, 50, 1.2], ["note", 200, 40, 1.0]],
    protect: [["kid", 100, G, 1.5, kb("reach", { look: 0, mouth: "open" })], ["umbrella", 138, G - 42, 1.6, {}], ["heart", 196, 52, 0.9]],
    raise: [["flagpole", 160, G, 1.25, {}], ["kid", 100, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["arrow", 0, 0, 1, { x1: 196, y1: 100, x2: 196, y2: 56, c: P }], ["kid", 56, G, 1.3, kg("reach", { look: 1, mouth: "open" })]],
    // @@SCENES_END
  };
  KITS.cbook = function (o) {
    return '<rect x="-24" y="-8" width="48" height="8" rx="2" ' + f("#6A48E8", 2) + '/><rect x="-22" y="-6" width="43" height="4" fill="#fff"/><path d="M-22 -4 H21" stroke="#9FB3D1" stroke-width="1"/>';
  };

  KITS.widewater = function (o) {
    return '<path d="M-130 -40 Q-90 -46 -50 -40 T30 -40 T130 -40 V40 Q90 46 50 40 T-30 40 T-130 40Z" ' + f("#7CC4F0", 2.4) + '/><path d="M-86 -12 Q-74 -17 -62 -12 M-30 22 Q-18 17 -6 22 M44 -16 Q56 -21 68 -16 M56 20 Q68 15 80 20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>';
  };
  var BG8 = {
    wave: "icesea", planet: "space", oil: "plain", salt: "in", bone: "polar", wing: "polar", bat: "polar", rail: "polar", clock: "in", tie: "in",
    hat: "polar", suit: "in", finger: "in", ear: "in", arm: "polar", instrument: "in", dollar: "in", cent: "in", print: "in", camp: "polar",
    supply: "polar", material: "in", property: "polar", noon: "polar", month: "in", nine: "polar", twenty: "polar", century: "polar",
    neighbor: "polar", chief: "in", colony: "icesea", human: "polar", character: "in", region: "in", continent: "in", capital: "polar", nation: "polar", subject: "in",
    history: "in", period: "in", age: "in", position: "polar", general: "polar", law: "polar", term: "in", symbol: "in", atom: "in", temperature: "polar",
    industry: "polar", electric: "polar", modern: "polar", value: "polar", experiment: "in", method: "in", process: "polar", result: "in",
    climb: "polar", catch: "polar", push: "polar", lift: "polar", throw: "polar", gather: "aurora", stretch: "polar", roll: "polar", burn: "polar", mix: "in",
    shout: "polar", join: "polar", enter: "polar", search: "polar", hunt: "polar", collect: "polar", settle: "polar", receive: "polar", mount: "polar", finish: "in",
    arrange: "in", invent: "in", operate: "in", select: "in", prepare: "in", repeat: "polar", allow: "polar",
    grand: "polar", gentle: "in", natural: "plain", broad: "polar", gray: "polar", lone: "polar", joy: "polar", excite: "polar", smile: "polar", sudden: "rain",
    noise: "in", sight: "icesea", sense: "in", tone: "in", shine: "polar", fear: "night", danger: "polar", anger: "in", necessary: "in", particular: "in",
    exact: "in", major: "polar", probable: "polar", vary: "in", prove: "in", represent: "polar", indicate: "polar", locate: "in",
    continue: "polar", suggest: "polar", agree: "polar", provide: "polar", imagine: "polar", include: "in", divide: "polar", depend: "polar", rub: "polar", hurry: "polar",
    determine: "in", require: "polar", consider: "in", reason: "polar", event: "polar", success: "polar", effect: "polar", perhaps: "polar", rather: "in", whether: "polar",
    thus: "polar", claim: "in", spoke: "in", broke: "in", clothe: "in", lie: "in", organ: "in", protect: "rain", raise: "polar",
  };
  A.extend({
    kit: KITS,
    scenes: S8,
    bgk: BG8,
    bg: { polar: bgPolar, aurora: bgAurora, icesea: bgIceSea },
  });
})(typeof window !== "undefined" ? window : this);
