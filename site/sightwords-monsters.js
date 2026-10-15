/* The five monsters of the sight-words Monster battle (sample): round, friendly little creatures in the style of the kids' classroom monsters (big
   shiny eyes, rosy cheeks, a big smile, tiny arms and feet), drawn in code in the same soft look as the pets (flat shapes that softSvg from
   pet-art.js shades), so there are no picture files.

   Each monster is a small RIG: parts (body, arms, feet, tail, wings, the decoration on its head, eyes, mouth, cheeks, dizzy stars) with a pivot each,
   drawn twice, once from the front and once from the side (a three-quarter profile looking left, at the pet). A small animation engine moves the
   parts over time: it breathes, blinks, sways; it can turn (front to side and back), charge, attack, get hit and be beaten, and the parts follow
   through at different times (the ears, the tail and the curl swing after the body), which is what makes it feel alive.

   SWMonsters.LIST         id, name, Chinese name, hit points, seconds to charge an attack, number of word choices
   SWMonsters.art(id, mood, gaze)    a still picture (front view); mood "idle", "hurt" or "cheer"
   SWMonsters.mount(host, id, opts)  puts a living monster into host; returns a controller (see the end of this file)
   SWMonsters.shot(id), SWMonsters.arena(id)    what it shoots back, and the place it fights in
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";

  var INK = "#3A2A5E";

  function soft(inner) {
    return typeof root.softSvg === "function" ? root.softSvg(inner) : inner;
  }

  /* ------------------------------------------------------------------ face pieces: each returns the variants of one part */
  function f1(n) {
    return Math.round(n * 10) / 10;
  }
  function eyeOpen(x, y, r, g) {
    var px = x + r * 0.12 + (g || 0) * r * 0.3; // the pupil moves toward whoever the monster looks at
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2"/><circle cx="' + f1(px) + '" cy="' + f1(y + r * 0.1) + '" r="' + f1(r * 0.62) + '" fill="' + INK + '"/>' +
      '<circle cx="' + f1(px - r * 0.22) + '" cy="' + f1(y - r * 0.28) + '" r="' + f1(r * 0.27) + '" fill="#FFFFFF"/><circle cx="' + f1(px + r * 0.3) + '" cy="' + f1(y + r * 0.34) + '" r="' + f1(r * 0.13) + '" fill="#FFFFFF"/>';
  }
  function eyeDot(x, y, rx, ry, g) {
    var ex = x + (g || 0) * 2.4;
    return '<ellipse cx="' + ex + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + INK + '"/><circle cx="' + f1(ex - rx * 0.28) + '" cy="' + f1(y - ry * 0.3) + '" r="' + f1(rx * 0.32) + '" fill="#FFFFFF"/><circle cx="' + f1(ex + rx * 0.3) + '" cy="' + f1(y + ry * 0.3) + '" r="' + f1(rx * 0.15) + '" fill="#FFFFFF"/>';
  }
  function eyeShut(x, y, r) {
    return '<path d="M' + f1(x - r * 0.85) + " " + f1(y + r * 0.1) + " Q" + x + " " + f1(y + r * 0.95) + " " + f1(x + r * 0.85) + " " + f1(y + r * 0.1) + '" stroke="' + INK + '" stroke-width="3.6" fill="none" stroke-linecap="round"/>';
  }
  function eyeHurt(x, y, r, side) {
    var d = side < 0 ? 1 : -1;
    return '<path d="M' + f1(x - d * r * 0.7) + " " + f1(y - r * 0.8) + " L" + f1(x + d * r * 0.7) + " " + y + " L" + f1(x - d * r * 0.7) + " " + f1(y + r * 0.8) + '" stroke="' + INK + '" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
  }
  function eyeCheer(x, y, r) {
    return '<path d="M' + f1(x - r * 0.8) + " " + f1(y + r * 0.4) + " Q" + x + " " + f1(y - r * 0.9) + " " + f1(x + r * 0.8) + " " + f1(y + r * 0.4) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" fill="none"/>';
  }
  // eyes: list of [x, y, r, side(-1 left, 1 right)]; dot = true draws the ghost's solid dark eyes (r is then [rx, ry])
  function eyesVar(list, dot) {
    function each(fn) {
      return list.map(fn).join("");
    }
    return {
      open: function (o) {
        var g = (o && o.gaze) || 0;
        return each(function (e) {
          return dot ? eyeDot(e[0], e[1], e[2][0], e[2][1], g) : eyeOpen(e[0], e[1], e[2], g);
        });
      },
      blink: each(function (e) {
        return eyeShut(e[0], e[1], dot ? e[2][0] : e[2]);
      }),
      hurt: each(function (e) {
        return eyeHurt(e[0], e[1], dot ? e[2][0] : e[2], e[3]);
      }),
      cheer: each(function (e) {
        return eyeCheer(e[0], e[1], dot ? e[2][0] : e[2]);
      }),
    };
  }
  // a friendly smile, a big open mouth with a tongue, or a wobbly "oh"; tooth = a little tooth in the smile
  function mouthVar(x, y, w, tooth) {
    return {
      smile: '<path d="M' + f1(x - w * 0.8) + " " + y + " Q" + x + " " + f1(y + w) + " " + f1(x + w * 0.8) + " " + y + '" fill="none" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round"/>' +
        (tooth ? '<path d="M' + (x - 3) + " " + f1(y + w * 0.62) + " L" + (x - 3) + " " + f1(y + w * 0.62 + 7) + " L" + (x + 3) + " " + f1(y + w * 0.62 + 7) + " L" + (x + 3) + " " + f1(y + w * 0.62) + 'Z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>' : ""),
      open: '<path d="M' + f1(x - w) + " " + y + " Q" + x + " " + f1(y + w * 1.5) + " " + f1(x + w) + " " + y + 'Z" fill="' + INK + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="' + x + '" cy="' + f1(y + w * 0.78) + '" rx="' + f1(w * 0.5) + '" ry="' + f1(w * 0.3) + '" fill="#FF8FA8"/>',
      ouch: '<ellipse cx="' + x + '" cy="' + f1(y + 4) + '" rx="' + f1(w * 0.34) + '" ry="' + f1(w * 0.44) + '" fill="' + INK + '"/><ellipse cx="' + x + '" cy="' + f1(y + 7) + '" rx="' + f1(w * 0.2) + '" ry="' + f1(w * 0.2) + '" fill="#FF8FA8"/>',
    };
  }
  function cheeksAt(list) {
    return list.map(function (c) {
      return '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + (c[2] || 7) + '" ry="' + f1((c[2] || 7) * 0.62) + '" fill="#FF7FA8" opacity=".6"/>';
    }).join("");
  }
  function tinyStar(x, y, r) {
    var p = "";
    for (var i = 0; i < 10; i++) {
      var ang = -Math.PI / 2 + (i * Math.PI) / 5,
        rr = i % 2 ? r * 0.46 : r;
      p += (i ? "L" : "M") + f1(x + rr * Math.cos(ang)) + " " + f1(y + rr * Math.sin(ang));
    }
    return '<path d="' + p + 'Z" fill="#FFE066" stroke="#E0A800" stroke-width="1.3" stroke-linejoin="round"/>';
  }
  function starsVar(x, y) {
    return { off: "", on: tinyStar(x, y, 7) + tinyStar(x + 22, y + 10, 5) };
  }
  function ell(cx, cy, rx, ry, fill, stroke, sw, rot) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"' + (rot ? ' transform="rotate(' + rot + " " + cx + " " + cy + ')"' : "") + ' fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (sw || 2.4) + '"/>';
  }
  function gloss(cx, cy, rx, ry, rot, op) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + (rot || -30) + " " + cx + " " + cy + ')" fill="#FFFFFF" opacity="' + (op || 0.5) + '"/>';
  }
  // what a part does when the monster moves: k = kind, s = which side (-1 left / near, 1 right), l = how late it follows the body (1 quick, 3 slow), g = how much
  function M(k, s, l, g) {
    return { k: k, s: s || 0, l: l || 1, g: g == null ? 1 : g };
  }
  // a part: name, parent, draw order inside the parent (below 0 = behind the parent's own picture), pivot, picture, variants, motion
  function P(n, p, z, o, s, v, m) {
    return { n: n, p: p, z: z, o: o, s: s || "", v: v || null, mo: m || M("none") };
  }
  var SHADOW = function (w) {
    return '<ellipse cx="60" cy="112" rx="' + (w + 6) + '" ry="6.5" fill="#2B1B52" opacity=".07"/><ellipse cx="60" cy="112" rx="' + w + '" ry="4.6" fill="#2B1B52" opacity=".1"/>';
  };
  // every rig starts the same way: root (turns, hops) > shadow, and root > spin (the whole body, which spins when it is beaten) > body (breathes)
  function base(w, bodyArt) {
    return [
      P("root", null, 0, [60, 108], "", null, M("root")),
      P("shadow", "root", -5, [60, 112], SHADOW(w), null, M("shadow")),
      P("spin", "root", 0, [60, 66], "", null, M("spin")),
      P("body", "spin", 0, [60, 108], bodyArt, null, M("body")),
    ];
  }
  // the face: cheeks, eyes and mouth are children of the body; eyes and mouth have variants the engine switches between
  function FACE(eyes, dot, mx, my, mw, tooth, cheeks) {
    return [
      P("cheeks", "body", 3, [60, 80], cheeksAt(cheeks)),
      P("eyes", "body", 3, [60, 64], "", eyesVar(eyes, dot), M("face")),
      P("mouth", "body", 3, [mx, my], "", mouthVar(mx, my, mw, tooth), M("face")),
    ];
  }
  var RIGS = {};

  /* ------------------------------------------------------------------ the five rigs
     front = facing us, side = a three-quarter profile looking left (at the pet): the face moves forward, the far eye is smaller, the arms and feet
     are lined up front and back, the tail or the wings show properly. dzf / dzs = where the dizzy stars circle (x, y, wide, high), mz = where its shot starts,
     tr = how it moves (kb: how far a hit pushes it, wob: how much it wobbles afterwards, float: it hovers). */

  /* 1 Gloop: a round green slime with a curl on top */
  var GR = "#7BD65A",
    GD = "#3F9A3A",
    CURL = '<path d="M60 26 Q46 10 58 5 Q72 3 68 16" fill="none" stroke="#3F9A3A" stroke-width="6" stroke-linecap="round"/><path d="M60 26 Q46 10 58 5 Q72 3 68 16" fill="none" stroke="#7BD65A" stroke-width="3" stroke-linecap="round"/>';
  RIGS[1] = {
    tr: { kb: 0.8, wob: 1.5 },
    dzf: [60, 24, 30, 8],
    dzs: [58, 24, 30, 8],
    mz: [30, 86],
    front: base(
      38,
      '<ellipse cx="60" cy="109" rx="47" ry="6" fill="#6FCB50"/><path d="M16 108 Q4 62 34 38 Q60 20 86 38 Q116 62 104 108Z" fill="#7BD65A" stroke="#3F9A3A" stroke-width="2.6" stroke-linejoin="round"/>' +
        gloss(38, 50, 11, 6, -32, 0.55) + '<circle cx="90" cy="50" r="3.6" fill="#C8F5B0"/><circle cx="98" cy="62" r="2.2" fill="#C8F5B0"/>'
    ).concat(
      [
        P("armL", "body", -1, [27, 80], ell(14, 82, 10, 7, GR, GD, 2.4, 25), null, M("arm", -1, 2)),
        P("armR", "body", -1, [93, 80], ell(106, 82, 10, 7, GR, GD, 2.4, -25), null, M("arm", 1, 2)),
        P("curl", "body", -1, [60, 28], CURL, null, M("deco", 0, 3, 1.3)),
        P("footL", "spin", 1, [40, 108], ell(40, 109, 11, 6, "#5FC040", GD, 2.4), null, M("foot", -1)),
        P("footR", "spin", 1, [80, 108], ell(80, 109, 11, 6, "#5FC040", GD, 2.4), null, M("foot", 1)),
      ],
      FACE([[44, 68, 11, -1], [76, 68, 11, 1]], false, 60, 84, 11, true, [[30, 84, 7], [90, 84, 7]])
    ),
    side: base(
      35,
      '<ellipse cx="62" cy="109" rx="44" ry="6" fill="#6FCB50"/><path d="M18 108 Q8 78 24 54 Q42 28 72 28 Q102 32 108 70 Q112 96 104 108Z" fill="#7BD65A" stroke="#3F9A3A" stroke-width="2.6" stroke-linejoin="round"/>' +
        gloss(42, 48, 11, 6, -32, 0.55) + '<circle cx="94" cy="54" r="3.6" fill="#C8F5B0"/><circle cx="100" cy="66" r="2.2" fill="#C8F5B0"/>'
    ).concat(
      [
        P("tail", "body", -2, [100, 98], ell(108, 98, 10, 8, GR, GD, 2.4) + ell(118, 104, 5, 4.6, GR, GD, 2.2), null, M("tail", 1, 2)),
        P("arm2", "body", -1, [34, 76], ell(22, 76, 9, 6.5, "#68C247", GD, 2.4, 20), null, M("arm", -1, 3)),
        P("arm1", "body", 1, [38, 88], ell(24, 90, 11, 7.5, GR, GD, 2.4, 22), null, M("arm", -1, 2)),
        P("curl", "body", -1, [68, 30], '<g transform="translate(8 4)">' + CURL + "</g>", null, M("deco", 0, 3, 1.3)),
        P("foot2", "spin", 1, [80, 108], ell(80, 110, 10, 5.6, "#54B238", GD, 2.4), null, M("foot", 1)),
        P("foot1", "spin", 1, [44, 108], ell(44, 109, 11, 6, "#5FC040", GD, 2.4), null, M("foot", -1)),
      ],
      FACE([[32, 66, 8, -1], [54, 66, 11, 1]], false, 38, 84, 9, true, [[20, 82, 5], [66, 82, 7]])
    ),
  };

  /* 2 Boo: a lilac ghost with a little bow, floating */
  var BG = "#EFE9FF",
    BD = "#8F7BD9";
  RIGS[2] = {
    tr: { kb: 1.3, wob: 1, float: 1 },
    dzf: [60, 18, 30, 8],
    dzs: [56, 18, 28, 8],
    mz: [30, 80],
    front: base(
      32,
      '<path d="M22 106 Q8 62 28 34 Q60 4 92 34 Q112 62 98 106 Q90 96 82 106 Q72 96 64 106 Q56 96 46 106 Q38 96 30 106Z" fill="#EFE9FF" stroke="#8F7BD9" stroke-width="2.6" stroke-linejoin="round"/>' +
        gloss(42, 26, 12, 5.5, -30, 0.75)
    ).concat(
      [
        P("hem", "body", -2, [60, 76], '<path d="M20 104 Q6 62 28 36 Q60 8 92 36 Q114 62 100 104 Q92 114 84 106 Q76 116 66 107 Q58 116 48 107 Q40 116 32 108 Q24 112 20 104Z" fill="#D9CFFF" stroke="#8F7BD9" stroke-width="2.4" stroke-linejoin="round"/>', null, M("hem", 0, 2)),
        P("armL", "body", -1, [30, 74], ell(22, 76, 10, 7, BG, BD, 2.4, 28), null, M("arm", -1, 2)),
        P("armR", "body", -1, [90, 74], ell(98, 76, 10, 7, BG, BD, 2.4, -28), null, M("arm", 1, 2)),
        P("bow", "body", 1, [60, 16], '<path d="M60 14 L44 2 Q40 12 48 18Z M60 14 L76 2 Q80 12 72 18Z" fill="#FF8FB1" stroke="#D9577F" stroke-width="2.2" stroke-linejoin="round"/><circle cx="60" cy="14" r="5" fill="#FF8FB1" stroke="#D9577F" stroke-width="2.2"/>', null, M("deco", 0, 2, 1.2)),
      ],
      FACE([[44, 58, [9, 11], -1], [76, 58, [9, 11], 1]], true, 60, 76, 8, false, [[32, 76, 8], [88, 76, 8]])
    ),
    side: base(
      30,
      '<path d="M30 104 Q12 64 30 36 Q54 8 84 30 Q106 48 110 92 Q102 90 96 104 Q88 94 80 106 Q70 96 62 106 Q54 96 46 106 Q38 98 30 104Z" fill="#EFE9FF" stroke="#8F7BD9" stroke-width="2.6" stroke-linejoin="round"/>' +
        gloss(44, 24, 12, 5.5, -30, 0.75)
    ).concat(
      [
        P("hem", "body", -2, [62, 76], '<path d="M28 102 Q10 64 30 38 Q54 10 84 32 Q108 50 112 92 Q118 104 108 108 Q100 116 92 107 Q84 116 74 107 Q66 114 56 107 Q48 114 40 108 Q32 112 28 102Z" fill="#D9CFFF" stroke="#8F7BD9" stroke-width="2.4" stroke-linejoin="round"/>', null, M("hem", 0, 2)),
        P("tail", "body", -1, [104, 72], '<path d="M106 80 Q126 78 120 54 Q114 66 104 64Z" fill="#EFE9FF" stroke="#8F7BD9" stroke-width="2.4" stroke-linejoin="round"/>', null, M("tail", 1, 2)),
        P("arm2", "body", -1, [34, 78], ell(22, 80, 9, 6.5, "#E1D8FF", BD, 2.4, 20), null, M("arm", -1, 3)),
        P("arm1", "body", 1, [38, 86], ell(28, 88, 10, 7, BG, BD, 2.4, 22), null, M("arm", -1, 2)),
        P("bow", "body", 1, [58, 16], '<path d="M58 14 L40 4 Q37 14 46 19Z M58 14 L71 6 Q75 13 68 19Z" fill="#FF8FB1" stroke="#D9577F" stroke-width="2.2" stroke-linejoin="round"/><circle cx="58" cy="14" r="5" fill="#FF8FB1" stroke="#D9577F" stroke-width="2.2"/>', null, M("deco", 0, 2, 1.2)),
      ],
      FACE([[32, 58, [6.5, 9], -1], [54, 58, [9, 11], 1]], true, 38, 76, 7, false, [[22, 76, 5.5], [64, 76, 8]])
    ),
  };

  /* 3 Rocky: a round rock with a moss tuft and a flower */
  var RK = "#BDB4A8",
    RA = "#A39A8E",
    RD = "#6B6358",
    MOSS = '<path d="M34 28 Q40 12 54 20 Q62 8 74 20 Q88 14 86 28 Q60 36 34 28Z" fill="#7BD65A" stroke="#3F9A3A" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<g transform="translate(62 12)"><circle cx="-6" cy="-3" r="4" fill="#FF8FB1"/><circle cx="6" cy="-3" r="4" fill="#FF8FB1"/><circle cx="0" cy="-9" r="4" fill="#FF8FB1"/><circle cx="0" cy="3" r="4" fill="#FF8FB1"/><circle cx="0" cy="-3" r="3.4" fill="#FFD23F"/></g>';
  RIGS[3] = {
    tr: { kb: 0.5, wob: 0.6 },
    dzf: [60, 22, 30, 8],
    dzs: [60, 22, 30, 8],
    mz: [28, 82],
    front: base(
      40,
      '<path d="M16 108 Q2 66 22 42 Q44 18 78 22 Q112 30 106 72 Q106 100 94 108Z" fill="#BDB4A8" stroke="#6B6358" stroke-width="2.6" stroke-linejoin="round"/>' + gloss(38, 38, 12, 6, -28, 0.45) +
        '<ellipse cx="86" cy="94" rx="8" ry="5" fill="#A39A8E"/><ellipse cx="28" cy="94" rx="6" ry="4" fill="#A39A8E"/><path d="M92 50 L96 58 M88 58 L98 62" stroke="#8D8478" stroke-width="2.4" stroke-linecap="round"/>'
    ).concat(
      [
        P("armL", "body", -1, [26, 80], ell(14, 80, 10, 8, RA, RD, 2.4), null, M("arm", -1, 2, 0.7)),
        P("armR", "body", -1, [94, 80], ell(106, 80, 10, 8, RA, RD, 2.4), null, M("arm", 1, 2, 0.7)),
        P("moss", "body", 1, [60, 30], MOSS, null, M("deco", 0, 3, 0.8)),
        P("footL", "spin", 1, [40, 108], ell(40, 109, 12, 6.5, RA, RD, 2.4), null, M("foot", -1)),
        P("footR", "spin", 1, [80, 108], ell(80, 109, 12, 6.5, RA, RD, 2.4), null, M("foot", 1)),
      ],
      FACE([[44, 62, 10, -1], [76, 62, 10, 1]], false, 60, 80, 11, false, [[30, 78, 7], [90, 78, 7]])
    ),
    side: base(
      38,
      '<path d="M20 108 Q4 70 26 44 Q48 18 82 22 Q112 30 108 72 Q108 100 98 108Z" fill="#BDB4A8" stroke="#6B6358" stroke-width="2.6" stroke-linejoin="round"/>' + gloss(46, 36, 12, 6, -28, 0.45) +
        '<ellipse cx="92" cy="94" rx="8" ry="5" fill="#A39A8E"/><ellipse cx="60" cy="98" rx="6" ry="4" fill="#A39A8E"/><path d="M94 48 L99 57 M90 57 L101 61" stroke="#8D8478" stroke-width="2.4" stroke-linecap="round"/>'
    ).concat(
      [
        P("arm2", "body", -1, [32, 74], ell(20, 74, 10, 8, "#8F867A", RD, 2.4, 10), null, M("arm", -1, 3, 0.7)),
        P("arm1", "body", 1, [36, 88], ell(26, 90, 11, 8.5, RA, RD, 2.4, 14), null, M("arm", -1, 2, 0.7)),
        P("moss", "body", 1, [66, 30], '<g transform="translate(6 -2)">' + MOSS + "</g>", null, M("deco", 0, 3, 0.8)),
        P("foot2", "spin", 1, [82, 108], ell(82, 109, 11, 6, "#8F867A", RD, 2.4), null, M("foot", 1)),
        P("foot1", "spin", 1, [42, 108], ell(42, 109, 12, 6.5, RA, RD, 2.4), null, M("foot", -1)),
      ],
      FACE([[32, 62, 7.5, -1], [54, 60, 10, 1]], false, 38, 80, 9, false, [[22, 76, 5], [64, 78, 7]])
    ),
  };

  /* 4 Blaze: a round orange imp with tiny horns, a flame tuft, small wings and a flame-tipped tail */
  var BZ = "#FF8A4C",
    BZD = "#C4501F",
    PINK = "#FFB0C4",
    PINKD = "#D9577F",
    FLAME = '<path d="M42 36 Q36 20 48 14 Q48 24 54 28 Q56 14 66 8 Q66 22 74 28 Q82 18 80 34 Q62 42 42 36Z" fill="#FFB020" stroke="#E5683A" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<path d="M52 32 Q52 22 59 17 Q60 26 66 28 Q70 24 70 32Z" fill="#FFE066"/>';
  RIGS[4] = {
    tr: { kb: 1, wob: 1 },
    dzf: [60, 14, 32, 8],
    dzs: [60, 14, 30, 8],
    mz: [28, 82],
    front: base(
      36,
      '<ellipse cx="60" cy="74" rx="40" ry="37" fill="#FF8A4C" stroke="#C4501F" stroke-width="2.6"/><ellipse cx="60" cy="88" rx="24" ry="22" fill="#FFD2A6"/>' + gloss(42, 50, 11, 5.5, -28, 0.5)
    ).concat(
      [
        P("tail", "body", -3, [92, 94], '<path d="M92 96 Q116 94 112 70 Q110 62 104 66" stroke="#C4501F" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M92 96 Q116 94 112 70 Q110 62 104 66" stroke="#FF8A4C" stroke-width="4.4" fill="none" stroke-linecap="round"/>' +
          '<path d="M100 62 Q104 48 112 52 Q110 58 114 62 Q106 70 100 62Z" fill="#FFD23F" stroke="#E5683A" stroke-width="2" stroke-linejoin="round"/>', null, M("tail", 1, 2, 1.2)),
        P("wingL", "body", -2, [28, 70], '<path d="M26 76 Q4 62 8 40 Q20 48 28 58Z" fill="#FFB0C4" stroke="#D9577F" stroke-width="2.4" stroke-linejoin="round"/>', null, M("wing", -1, 2)),
        P("wingR", "body", -2, [92, 70], '<path d="M94 76 Q116 62 112 40 Q100 48 92 58Z" fill="#FFB0C4" stroke="#D9577F" stroke-width="2.4" stroke-linejoin="round"/>', null, M("wing", 1, 2)),
        P("armL", "body", -1, [28, 88], ell(19, 90, 9, 6.5, BZ, BZD, 2.4, 25), null, M("arm", -1, 2)),
        P("armR", "body", -1, [92, 88], ell(101, 90, 9, 6.5, BZ, BZD, 2.4, -25), null, M("arm", 1, 2)),
        P("hornL", "body", -1, [40, 42], '<path d="M34 42 Q26 28 32 18 Q42 24 46 38Z" fill="#FFF3D6" stroke="#C4501F" stroke-width="2.2" stroke-linejoin="round"/>', null, M("deco", -1, 2, 0.8)),
        P("hornR", "body", -1, [80, 42], '<path d="M86 42 Q94 28 88 18 Q78 24 74 38Z" fill="#FFF3D6" stroke="#C4501F" stroke-width="2.2" stroke-linejoin="round"/>', null, M("deco", 1, 2, 0.8)),
        P("flame", "body", -1, [60, 40], FLAME, null, M("flame", 0, 2)),
        P("footL", "spin", 1, [40, 108], ell(40, 109, 13, 6.5, "#E5683A", BZD, 2.4), null, M("foot", -1)),
        P("footR", "spin", 1, [80, 108], ell(80, 109, 13, 6.5, "#E5683A", BZD, 2.4), null, M("foot", 1)),
      ],
      FACE([[46, 64, 10.5, -1], [74, 64, 10.5, 1]], false, 60, 80, 12, false, [[30, 78, 7], [90, 78, 7]])
    ),
    side: base(
      34,
      '<ellipse cx="62" cy="74" rx="40" ry="37" fill="#FF8A4C" stroke="#C4501F" stroke-width="2.6"/><ellipse cx="44" cy="90" rx="19" ry="20" fill="#FFD2A6"/>' + gloss(46, 50, 11, 5.5, -28, 0.5)
    ).concat(
      [
        P("tail", "body", -3, [96, 96], '<path d="M96 98 Q124 100 118 70 Q116 58 106 62" stroke="#C4501F" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M96 98 Q124 100 118 70 Q116 58 106 62" stroke="#FF8A4C" stroke-width="4.4" fill="none" stroke-linecap="round"/>' +
          '<path d="M100 58 Q106 42 116 48 Q112 56 118 62 Q108 70 100 58Z" fill="#FFD23F" stroke="#E5683A" stroke-width="2" stroke-linejoin="round"/>', null, M("tail", 1, 2, 1.2)),
        P("wing2", "body", -2, [74, 66], '<path d="M70 58 Q78 32 98 26 Q94 46 90 58Z" fill="#F59BB5" stroke="#D9577F" stroke-width="2.4" stroke-linejoin="round"/>', null, M("wing", 1, 3)),
        P("horn2", "body", -1, [40, 46], '<path d="M36 44 Q30 30 36 22 Q44 28 46 40Z" fill="#F2E3BE" stroke="#C4501F" stroke-width="2.2" stroke-linejoin="round"/>', null, M("deco", -1, 3, 0.8)),
        P("horn1", "body", -1, [58, 42], '<path d="M54 40 Q50 24 58 14 Q66 22 66 38Z" fill="#FFF3D6" stroke="#C4501F" stroke-width="2.2" stroke-linejoin="round"/>', null, M("deco", 1, 2, 0.8)),
        P("flame", "body", -1, [70, 42], '<path d="M52 38 Q46 22 58 16 Q58 26 64 30 Q66 16 76 10 Q76 24 84 30 Q92 20 90 36 Q72 44 52 38Z" fill="#FFB020" stroke="#E5683A" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M62 34 Q62 24 69 19 Q70 28 76 30 Q80 26 80 34Z" fill="#FFE066"/>', null, M("flame", 1, 2)),
        P("arm2", "body", -1, [34, 86], ell(24, 84, 9, 6.5, "#F27A3C", BZD, 2.4, 20), null, M("arm", -1, 3)),
        P("wing1", "body", 1, [78, 68], '<path d="M76 64 Q92 40 112 38 Q108 58 98 74Z" fill="#FFB0C4" stroke="#D9577F" stroke-width="2.4" stroke-linejoin="round"/>', null, M("wing", 1, 2)),
        P("arm1", "body", 1, [38, 94], ell(28, 93, 10, 7, BZ, BZD, 2.4, 22), null, M("arm", -1, 2)),
        P("foot2", "spin", 1, [82, 108], ell(82, 109, 12, 6, "#D45A2A", BZD, 2.4), null, M("foot", 1)),
        P("foot1", "spin", 1, [42, 108], ell(42, 109, 13, 6.5, "#E5683A", BZD, 2.4), null, M("foot", -1)),
      ],
      FACE([[34, 64, 7.5, -1], [56, 64, 10.5, 1]], false, 38, 82, 10, false, [[22, 78, 5], [66, 80, 7]])
    ),
  };

  /* 5 Drako: a round purple baby dragon, the boss */
  var DP = "#9B7BEF",
    DD = "#5B3FC4",
    DB = '<ellipse cx="60" cy="72" rx="40" ry="38" fill="#9B7BEF" stroke="#5B3FC4" stroke-width="2.6"/><ellipse cx="60" cy="88" rx="23" ry="21" fill="#FFE3B3"/><path d="M46 84 H74 M45 92 H75 M48 100 H72" stroke="#F0C47F" stroke-width="2" stroke-linecap="round"/>' + gloss(42, 46, 12, 5.5, -28, 0.45);
  RIGS[5] = {
    tr: { kb: 0.6, wob: 0.8 },
    dzf: [60, 10, 32, 8],
    dzs: [58, 10, 30, 8],
    mz: [10, 80],
    front: base(40, DB).concat(
      [
        P("tail", "body", -3, [92, 94], '<path d="M92 98 Q118 100 114 74 Q112 66 106 70 Q110 88 94 88Z" fill="#9B7BEF" stroke="#5B3FC4" stroke-width="2.6" stroke-linejoin="round"/><polygon points="106,66 119,62 113,77" fill="#FFD23F" stroke="#E0A800" stroke-width="2" stroke-linejoin="round"/>', null, M("tail", 1, 2, 1.1)),
        P("wingL", "body", -2, [32, 62], '<path d="M30 68 Q2 58 4 30 Q16 38 22 36 Q22 50 34 56Z" fill="#FF9EBB" stroke="#D9577F" stroke-width="2.6" stroke-linejoin="round"/>', null, M("wing", -1, 2)),
        P("wingR", "body", -2, [88, 62], '<path d="M90 68 Q118 58 116 30 Q104 38 98 36 Q98 50 86 56Z" fill="#FF9EBB" stroke="#D9577F" stroke-width="2.6" stroke-linejoin="round"/>', null, M("wing", 1, 2)),
        P("armL", "body", -1, [30, 86], ell(20, 88, 9.5, 6.5, DP, DD, 2.4, 25), null, M("arm", -1, 2)),
        P("armR", "body", -1, [90, 86], ell(100, 88, 9.5, 6.5, DP, DD, 2.4, -25), null, M("arm", 1, 2)),
        P("hornL", "body", -1, [42, 30], '<polygon points="38,32 30,10 50,24" fill="#FFF3D6" stroke="#C9A06B" stroke-width="2.2" stroke-linejoin="round"/>', null, M("deco", -1, 2, 0.7)),
        P("hornR", "body", -1, [78, 30], '<polygon points="82,32 90,10 70,24" fill="#FFF3D6" stroke="#C9A06B" stroke-width="2.2" stroke-linejoin="round"/>', null, M("deco", 1, 2, 0.7)),
        P("crest", "body", -1, [60, 28], '<polygon points="52,26 60,10 68,26" fill="#FFD23F" stroke="#E0A800" stroke-width="2.2" stroke-linejoin="round"/>', null, M("deco", 0, 3, 1)),
        P("footL", "spin", 1, [38, 108], ell(38, 110, 12.5, 6.5, "#7A5AE0", DD, 2.4), null, M("foot", -1)),
        P("footR", "spin", 1, [82, 108], ell(82, 110, 12.5, 6.5, "#7A5AE0", DD, 2.4), null, M("foot", 1)),
        P("nose", "body", 3, [60, 68], '<circle cx="55" cy="68" r="1.8" fill="#3A2A5E" opacity=".7"/><circle cx="65" cy="68" r="1.8" fill="#3A2A5E" opacity=".7"/>'),
      ],
      FACE([[46, 60, 10.5, -1], [74, 60, 10.5, 1]], false, 60, 76, 11, false, [[30, 74, 7], [90, 74, 7]])
    ),
    side: base(
      38,
      '<ellipse cx="62" cy="72" rx="40" ry="38" fill="#9B7BEF" stroke="#5B3FC4" stroke-width="2.6"/><ellipse cx="42" cy="90" rx="17" ry="21" fill="#FFE3B3"/><path d="M32 86 H50 M31 94 H51 M34 102 H48" stroke="#F0C47F" stroke-width="2" stroke-linecap="round"/>' + gloss(48, 46, 12, 5.5, -28, 0.45)
    ).concat(
      [
        P("tail", "body", -3, [92, 96], '<path d="M92 100 Q122 104 118 74 Q116 64 108 70 Q112 90 94 90Z" fill="#9B7BEF" stroke="#5B3FC4" stroke-width="2.6" stroke-linejoin="round"/><polygon points="108,66 121,60 116,77" fill="#FFD23F" stroke="#E0A800" stroke-width="2" stroke-linejoin="round"/>', null, M("tail", 1, 2, 1.1)),
        P("wing2", "body", -2, [72, 58], '<path d="M66 56 Q74 26 100 16 Q98 38 92 52Z" fill="#F58AAE" stroke="#D9577F" stroke-width="2.6" stroke-linejoin="round"/>', null, M("wing", 1, 3)),
        P("crest", "body", -1, [84, 40], '<polygon points="72,30 76,16 84,32" fill="#FFD23F" stroke="#E0A800" stroke-width="2.2" stroke-linejoin="round"/><polygon points="86,36 94,24 98,42" fill="#FFD23F" stroke="#E0A800" stroke-width="2.2" stroke-linejoin="round"/><polygon points="96,50 106,42 106,60" fill="#FFD23F" stroke="#E0A800" stroke-width="2.2" stroke-linejoin="round"/>', null, M("deco", 1, 3, 1)),
        P("horn2", "body", -1, [50, 34], '<polygon points="42,34 48,14 60,30" fill="#E8D8B4" stroke="#C9A06B" stroke-width="2.2" stroke-linejoin="round"/>', null, M("deco", -1, 3, 0.7)),
        P("horn1", "body", -1, [62, 32], '<polygon points="54,30 66,6 74,28" fill="#FFF3D6" stroke="#C9A06B" stroke-width="2.2" stroke-linejoin="round"/>', null, M("deco", 1, 2, 0.7)),
        P("arm2", "body", -1, [32, 82], ell(22, 84, 9, 6.5, "#8A69E0", DD, 2.4, 20), null, M("arm", -1, 3)),
        P("wing1", "body", 1, [74, 64], '<path d="M70 62 Q84 32 112 26 Q110 50 98 66Z" fill="#FF9EBB" stroke="#D9577F" stroke-width="2.6" stroke-linejoin="round"/>', null, M("wing", 1, 2)),
        P("arm1", "body", 1, [42, 94], ell(32, 94, 10, 7, DP, DD, 2.4, 22), null, M("arm", -1, 2)),
        P("foot2", "spin", 1, [82, 108], ell(82, 110, 11.5, 6, "#6A4AD0", DD, 2.4), null, M("foot", 1)),
        P("foot1", "spin", 1, [42, 108], ell(42, 110, 12.5, 6.5, "#7A5AE0", DD, 2.4), null, M("foot", -1)),
        P("snout", "body", 2, [30, 72], '<ellipse cx="24" cy="72" rx="17" ry="12.5" fill="#B497F5" stroke="#5B3FC4" stroke-width="2.4"/><ellipse cx="14" cy="66" rx="2.4" ry="1.8" fill="#3A2A5E" opacity=".75"/>' + gloss(24, 65, 7, 3, -10, 0.4)),
      ],
      FACE([[38, 54, 7, -1], [54, 58, 10, 1]], false, 24, 80, 7, false, [[60, 74, 6.5]])
    ),
  };

  /* ------------------------------------------------------------------ the animation engine
     core(S, tr, T) works out, for time T (seconds), how the whole monster is moving (breathing, sway, the turn, a hit, an attack...) as a handful of numbers.
     Every part then follows those numbers in its own way (partPose): arms raise, feet stomp, the decoration on the head and the tail swing a little later than the
     body (they are given the body's motion a moment ago, which is what makes them drag and swing back), wings flap, the flame flickers.
     Nothing is stored between frames, so render(T) draws exactly the same picture for the same T (the tests rely on that). */
  var TAU = Math.PI * 2,
    LAGS = [0, 0.08, 0.16, 0.26],
    DEF = { eyes: "open", mouth: "smile" };
  function cl01(x) {
    return x < 0 ? 0 : x > 1 ? 1 : x;
  }
  function ease(x) {
    x = cl01(x);
    return x * x * (3 - 2 * x);
  }
  function seg(u, a, b) {
    return ease((u - a) / (b - a));
  }
  function n2(v) {
    return Math.round(v * 100) / 100;
  }

  // how worked up the monster is (0 calm .. 1 about to fire); it ramps up while a question is open
  function chargeAt(S, T) {
    var c = S.chg;
    if (!c.d) return c.b;
    return c.a + (c.b - c.a) * Math.pow(cl01((T - c.t0) / c.d), c.e);
  }
  function core(S, tr, T, id) {
    var p = chargeAt(S, T),
      W = 2.4 * (1 + 1.6 * p),
      br = Math.sin(W * T),
      b = {
        rx: 0, ry: 0, rr: S.lean + 1.2 * Math.sin(1.2 * T + id), rsx: 1, rsy: 1, // the whole monster: sideways, up, tilt, squeeze (turning)
        sx: 1 + 0.04 * p - (0.014 + 0.015 * p) * br, sy: 1 - 0.07 * p + (0.028 + 0.03 * p) * br, // the body: breathing, crouching when worked up
        scl: 1, dy: 0, spin: 0, op: 1, // shrinking, rising, spinning and fading away (beaten)
        arm: 32 * p + 3 * p * Math.sin(23 * T), reach: 1, spread: 0, flap: 1 + 2 * p, wag: 1 + 1.4 * p, whip: 0, orb: 0, dz: 0, p: p,
        eyes: "open", mouth: "smile",
      },
      u, a, h, d;
    b.rx = p * p * 0.8 * Math.sin(41 * T);
    if (tr.float) b.ry = -5 - 3 * Math.sin(2.1 * T + 1);
    if ((T + id * 0.7) % 3.7 < 0.13) b.eyes = "blink";
    if (S.mode === "cheer") {
      var hp = Math.abs(Math.sin(TAU * 0.65 * T));
      b.ry += -13 * hp;
      b.sy *= 1 + 0.07 * hp - 0.08 * (1 - hp);
      b.sx *= 1 - 0.05 * hp + 0.06 * (1 - hp);
      b.arm = 150 + 14 * Math.sin(TAU * 1.3 * T);
      b.flap = 3;
      b.wag = 2.5;
      b.eyes = "cheer";
      b.mouth = "open";
    }
    if (S.turn) {
      u = (T - S.turn.t0) / S.turn.d;
      if (u >= 0 && u <= 1) {
        var sn = Math.sin(Math.PI * u);
        b.rsx = 1 - 0.58 * sn;
        b.rsy = 1 + 0.05 * sn - (u < 0.28 ? 0.1 * Math.sin((Math.PI * u) / 0.28) : 0);
        b.ry -= 7 * sn;
        b.rr += (S.turn.to === "side" ? -5 : 4) * sn;
      }
    }
    if (S.atk) {
      a = T - S.atk.t0;
      if (a >= 0) {
        var wind = seg(a, 0, 0.3) * (1 - seg(a, 0.3, 0.4)), // it leans back and gathers its shot
          lunge = seg(a, 0.3, 0.4) * (1 - seg(a, 0.5, 0.85)), // then throws itself forward
          env = seg(a, 0, 0.3) * (1 - 0.5 * seg(a, 0.3, 0.4)) * (1 - seg(a, 0.5, 0.85));
        b.rx += 4 * wind - 11 * lunge;
        b.rr += 7 * wind - 10 * lunge;
        b.sy *= 1 - 0.07 * wind + 0.05 * lunge;
        b.sx *= 1 + 0.05 * wind - 0.04 * lunge;
        b.arm = Math.max(b.arm, 80 * env);
        b.reach = 1 + 0.3 * lunge;
        b.spread += 25 * (wind + lunge);
        b.whip += 30 * lunge;
        b.orb = a < 0.3 ? seg(a, 0, 0.3) : 0;
        if (a > 0.26 && a < 0.62) {
          b.eyes = "cheer";
          b.mouth = "open";
        }
      }
    }
    if (S.hit) {
      h = T - S.hit.t0;
      if (h >= 0 && h < 1.4) {
        var k = S.hit.k,
          dec = Math.exp(-5 * h),
          sq = Math.exp(-6.5 * h) * Math.cos(27 * h);
        b.rx += 8 * k * tr.kb * dec;
        b.rr += 8 * k * tr.kb * dec + 9 * k * tr.wob * Math.exp(-4.5 * h) * Math.sin(21 * h);
        b.sy *= 1 - 0.2 * k * sq;
        b.sx *= 1 + 0.13 * k * sq;
        b.arm = Math.max(b.arm, 50 * dec);
        b.spread += 20 * dec;
        if (h < 0.5) {
          b.eyes = "hurt";
          b.mouth = "ouch";
          b.dz = 1;
        }
      }
    }
    if (S.dead) {
      d = Math.min(T - S.dead.t0, 1);
      if (d >= 0) {
        // it reels like a hit, then spins away: smaller, higher, fainter
        var dd = Math.exp(-5 * d),
          sq2 = Math.exp(-6.5 * d) * Math.cos(27 * d);
        b.rx += 10 * tr.kb * dd;
        b.rr += 10 * dd + 8 * Math.exp(-4 * d) * Math.sin(21 * d);
        b.sy *= 1 - 0.22 * sq2;
        b.sx *= 1 + 0.14 * sq2;
        b.arm = Math.max(b.arm, 60 * dd + 40 * seg(d, 0.3, 0.7));
        b.eyes = "hurt";
        b.mouth = "ouch";
        b.dz = d < 0.8 ? 1 : 1 - seg(d, 0.8, 1);
        b.spin = 720 * seg(d, 0.2, 0.95);
        b.scl = 1 - 0.85 * seg(d, 0.3, 1);
        b.dy = -34 * seg(d, 0.3, 1);
        b.op = 1 - seg(d, 0.55, 1);
      }
    }
    return b;
  }

  // the pose of one part: x / y / r (degrees) / sx / sy / o (opacity), from the monster's motion c (now) and q (a moment ago)
  function partPose(m, T, C) {
    var c = C[0],
      q = C[m.l] || C[1],
      s = m.s,
      g = m.g,
      x = 0,
      y = 0,
      r = 0,
      sx = 1,
      sy = 1,
      o = 1,
      h,
      an;
    switch (m.k) {
      case "root":
        x = c.rx; y = c.ry; r = c.rr; sx = c.rsx; sy = c.rsy;
        break;
      case "shadow":
        h = cl01(-c.ry / 24);
        y = -c.ry; r = -c.rr; sx = sy = c.scl * (1 - 0.4 * h); o = c.op;
        break;
      case "spin":
        r = c.spin; sx = sy = c.scl; y = c.dy; o = c.op;
        break;
      case "body":
        sx = c.sx; sy = c.sy;
        break;
      case "arm":
        r = -s * (c.arm + 2.6 * Math.sin(2.4 * T + m.l * 0.8 + (s > 0 ? 0.9 : 0))) + 1.2 * (q.rr - c.rr);
        sx = c.reach;
        break;
      case "foot":
        y = -2.2 * c.p * Math.max(0, Math.sin(6.5 * T + (s > 0 ? Math.PI : 0)));
        break;
      case "deco":
        r = g * (1.8 * (q.rr - c.rr) + 0.5 * (q.rx - c.rx)) + g * 2.4 * Math.sin(2.4 * T - 1.2 - m.l * 0.5) - s * 0.15 * c.spread;
        sy = 1 + 0.9 * (q.sy - c.sy);
        break;
      case "flame":
        sy = 1 + 0.09 * Math.sin(9 * T + 1) + 0.9 * (q.sy - c.sy);
        sx = 1 - 0.05 * Math.sin(11 * T);
        r = 2.4 * Math.sin(5 * T) + 1.8 * (q.rr - c.rr) + 0.5 * (q.rx - c.rx);
        break;
      case "tail":
        r = s * (7 * c.wag * Math.sin(4.3 * T) + c.whip) * g + 2 * (q.rr - c.rr) + 0.6 * (q.rx - c.rx);
        break;
      case "wing":
        r = s * (3 + 5 * c.flap * Math.sin(5.2 * T + (s > 0 ? 0 : 0.4)) + c.spread) + 1.5 * (q.rr - c.rr);
        break;
      case "hem":
        x = 2.6 * Math.sin(2.4 * T - 1.4) + 1.8 * (q.rx - c.rx);
        sx = 1 + 0.025 * Math.sin(2.4 * T);
        break;
      case "star":
        an = 5 * T + m.i * 2.094;
        x = m.R * Math.cos(an); y = m.q * Math.sin(an); o = c.dz;
        break;
      case "orb":
        sx = sy = c.orb * (1 + 0.08 * Math.sin(30 * T));
        o = c.orb > 0.02 ? 1 : 0;
        break;
    }
    return { x: x, y: y, r: r, sx: sx, sy: sy, o: o };
  }

  function tform(o, p) {
    if (!p.x && !p.y && !p.r && p.sx === 1 && p.sy === 1) return "";
    var s = "translate(" + n2(o[0] + p.x) + " " + n2(o[1] + p.y) + ")";
    if (p.r) s += " rotate(" + n2(p.r) + ")";
    if (p.sx !== 1 || p.sy !== 1) s += " scale(" + n2(p.sx) + " " + n2(p.sy) + ")";
    return s + " translate(" + -o[0] + " " + -o[1] + ")";
  }

  /* ------------------------------------------------------------------ drawing a view
     live: every part is a <g data-p="view:name"> the engine moves, and a part with variants holds all of them (the engine shows one);
     not live: just the picture, with the variant chosen by pick (the still art used on cards) */
  function tree(parts, view, live, pick, gaze) {
    var kids = {},
      i;
    for (i = 0; i < parts.length; i++) {
      parts[i].ix = i;
      var q = parts[i].p || "";
      (kids[q] = kids[q] || []).push(parts[i]);
    }
    function val(x) {
      return typeof x === "function" ? x({ gaze: gaze }) : x;
    }
    function byZ(a, b) {
      return a.z - b.z || a.ix - b.ix;
    }
    function node(pt) {
      var ks = (kids[pt.n] || []).slice().sort(byZ),
        before = "",
        after = "",
        own = "",
        k;
      for (k = 0; k < ks.length; k++) {
        if (ks[k].z < 0) before += node(ks[k]);
        else after += node(ks[k]);
      }
      if (pt.v) {
        var want = pick ? (pt.n === "eyes" ? pick.eyes : pick.mouth) : DEF[pt.n];
        for (var vn in pt.v)
          if (pt.v.hasOwnProperty(vn)) {
            if (live) own += '<g data-v="' + vn + '"' + (vn === DEF[pt.n] ? "" : ' display="none"') + ">" + val(pt.v[vn]) + "</g>";
            else if (vn === want) own += val(pt.v[vn]);
          }
      } else own = val(pt.s);
      return "<g" + (live ? ' data-p="' + view + ":" + pt.n + '"' : "") + ">" + before + own + after + "</g>";
    }
    var top = kids[""] || [];
    return top.length ? node(top[0]) : "";
  }
  // the extra parts every view gets: three dizzy stars that circle the head, and (side view) the glowing ball it gathers before it shoots
  function withAuto(id, view) {
    var rig = RIGS[id],
      dz = view === "front" ? rig.dzf : rig.dzs,
      list = rig[view].slice(),
      sizes = [7, 5, 6];
    for (var i = 0; i < 3; i++) list.push(P("star" + i, "root", 5, [dz[0], dz[1]], tinyStar(dz[0], dz[1], sizes[i]), null, { k: "star", i: i, R: dz[2], q: dz[3], s: 0, l: 1, g: 1 }));
    if (view === "side")
      list.push(P("orb", "root", 6, [rig.mz[0], rig.mz[1]], '<g transform="translate(' + rig.mz[0] + " " + rig.mz[1] + ') scale(.75) translate(-18 -18)">' + (SHOT[id] || SHOT[1]) + "</g>", null, M("orb")));
    return list;
  }
  function starsStatic(dz) {
    return tinyStar(f1(dz[0] - dz[2] * 0.9), f1(dz[1] + 1), 7) + tinyStar(f1(dz[0] + dz[2] * 0.6), f1(dz[1] + dz[3] * 0.8), 5) + tinyStar(f1(dz[0] + dz[2] * 0.05), f1(dz[1] - dz[3]), 6);
  }

  var LIST = [
    { id: 1, name: "Gloop", cn: "黏黏怪", hp: 5, charge: 10, opts: 3, line: "A wobbly green slime." },
    { id: 2, name: "Boo", cn: "困困鬼", hp: 7, charge: 9, opts: 3, line: "A sleepy little ghost." },
    { id: 3, name: "Rocky", cn: "石头怪", hp: 9, charge: 8, opts: 4, line: "A grumpy stone golem." },
    { id: 4, name: "Blaze", cn: "火焰小妖", hp: 11, charge: 7, opts: 4, line: "A hot-headed fire imp." },
    { id: 5, name: "Drako", cn: "小龙王", hp: 14, charge: 6, opts: 4, line: "The baby dragon boss!" },
  ];
  function byId(id) {
    for (var i = 0; i < LIST.length; i++) if (LIST[i].id === id) return LIST[i];
    return null;
  }
  // a still picture (front view): gaze -1 looks to the left, 1 to the right (the pupils move), 0 straight ahead
  function art(id, mood, gaze) {
    var rig = RIGS[id];
    if (!rig) return "";
    mood = mood || "idle";
    var pick = { eyes: mood === "hurt" ? "hurt" : mood === "cheer" ? "cheer" : "open", mouth: mood === "hurt" ? "ouch" : mood === "cheer" ? "open" : "smile" },
      inner = tree(rig.front, "front", false, pick, gaze || 0) + (mood === "hurt" ? starsStatic(rig.dzf) : "");
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' + soft(inner) + "</svg>";
  }

  /* ------------------------------------------------------------------ a living monster
     mount(host, id, opts) draws the monster into host and animates it until host leaves the page.
     opts: gaze (-1 looks left), lean (degrees, negative leans left), view ("front" or "side"), mode ("idle" or "cheer"), manual (true: no clock, drive it with at(T))
     controller:  play("hit" | "attack" | "defeat" | "cheer" | "idle", callback, strength)    the callback runs when the move is over
                  turn(true | false, callback)     swing round to the side view (true) or back to the front
                  charge(seconds) / calm()         get worked up over that many seconds / settle down
                  muzzle()                         where its shot starts, as fractions of its width and height
                  at(T)                            draw the picture for time T (and use T as the clock from now on)
                  stop() */
  function mount(host, id, opts) {
    var rig = RIGS[id];
    if (!rig || !host) return null;
    opts = opts || {};
    var tr = rig.tr,
      gaze = opts.gaze || 0,
      S = { view: opts.view === "side" ? "side" : "front", mode: opts.mode === "cheer" ? "cheer" : "idle", lean: opts.lean || 0, turn: null, atk: null, hit: null, dead: null, chg: { a: 0, b: 0, t0: 0, d: 0, e: 1 }, cbs: [] },
      views = { front: withAuto(id, "front"), side: withAuto(id, "side") },
      inner = '<g data-view="front">' + tree(views.front, "front", true, null, gaze) + '</g><g data-view="side" display="none">' + tree(views.side, "side", true, null, gaze) + "</g>";
    host.innerHTML = '<svg viewBox="0 0 120 120" class="sw-rig" aria-hidden="true">' + soft(inner) + "</svg>";
    var svg = host.firstChild,
      nodes = { front: [], side: [] },
      t0 = Date.now(),
      manual = opts.manual ? 0 : null,
      dead = false;
    ["front", "side"].forEach(function (v) {
      views[v].forEach(function (pt) {
        var el = svg.querySelector('[data-p="' + v + ":" + pt.n + '"]'),
          vs = null;
        if (pt.v) {
          vs = {};
          for (var i = 0; i < el.childNodes.length; i++) {
            var ch = el.childNodes[i];
            if (ch.nodeType === 1 && ch.getAttribute("data-v")) vs[ch.getAttribute("data-v")] = ch;
          }
        }
        nodes[v].push({ pt: pt, el: el, vs: vs, tf: null, op: 1, vis: true, cur: DEF[pt.n] });
      });
    });
    function showView() {
      var gs = svg.querySelectorAll("[data-view]");
      for (var i = 0; i < gs.length; i++) {
        if (gs[i].getAttribute("data-view") === S.view) gs[i].removeAttribute("display");
        else gs[i].setAttribute("display", "none");
      }
    }
    showView();
    function now() {
      return manual === null ? (Date.now() - t0) / 1000 : manual;
    }
    function render(T) {
      var tn = S.turn,
        i;
      if (tn) {
        if (S.view !== tn.to && T >= tn.t0 + tn.d / 2) {
          S.view = tn.to;
          showView();
        }
        if (T >= tn.t0 + tn.d) S.turn = null;
      }
      var C = [];
      for (i = 0; i < LAGS.length; i++) C.push(core(S, tr, T - LAGS[i], id));
      var list = nodes[S.view],
        b = C[0];
      for (i = 0; i < list.length; i++) {
        var nd = list[i],
          p = partPose(nd.pt.mo, T, C),
          tf = tform(nd.pt.o, p),
          el = nd.el;
        if (tf !== nd.tf) {
          nd.tf = tf;
          if (tf) el.setAttribute("transform", tf);
          else el.removeAttribute("transform");
        }
        var vis = p.o > 0.004;
        if (vis !== nd.vis) {
          nd.vis = vis;
          if (vis) el.removeAttribute("display");
          else el.setAttribute("display", "none");
        }
        var op = vis ? n2(p.o) : 1;
        if (op !== nd.op) {
          nd.op = op;
          if (op === 1) el.removeAttribute("opacity");
          else el.setAttribute("opacity", op);
        }
        if (nd.vs) {
          var want = nd.pt.n === "eyes" ? b.eyes : b.mouth;
          if (!nd.vs[want]) want = DEF[nd.pt.n];
          if (nd.cur !== want) {
            for (var vn in nd.vs) if (nd.vs.hasOwnProperty(vn)) {
              if (vn === want) nd.vs[vn].removeAttribute("display");
              else nd.vs[vn].setAttribute("display", "none");
            }
            nd.cur = want;
          }
        }
      }
      for (i = S.cbs.length - 1; i >= 0; i--)
        if (S.cbs[i].at <= T) {
          var f = S.cbs.splice(i, 1)[0].fn;
          try {
            f();
          } catch (e) {}
        }
      return b;
    }
    var rq = root.requestAnimationFrame
      ? function (f) {
          return root.requestAnimationFrame(f);
        }
      : function (f) {
          return setTimeout(f, 33);
        };
    function loop() {
      if (dead) return;
      var d = host.ownerDocument;
      if (d && d.documentElement && !d.documentElement.contains(host)) {
        dead = true; // the battle was left: nothing to draw into any more
        return;
      }
      if (manual === null) render(now());
      rq(loop);
    }
    var ctl = {
      id: id,
      host: host,
      svg: svg,
      state: S,
      nodes: nodes,
      view: function () {
        return S.view;
      },
      play: function (name, cb, k) {
        var T = now(),
          dur = 0;
        if (name === "hit") {
          S.hit = { t0: T, k: k || 1 };
          dur = 0.6;
        } else if (name === "attack") {
          S.atk = { t0: T };
          dur = 0.85;
        } else if (name === "defeat") {
          S.dead = { t0: T };
          dur = 1;
        } else if (name === "cheer") S.mode = "cheer";
        else if (name === "idle") {
          S.mode = "idle";
          S.hit = S.atk = S.dead = null;
        }
        if (cb) S.cbs.push({ at: T + dur, fn: cb });
      },
      turn: function (toSide, cb) {
        var T = now(),
          to = toSide ? "side" : "front";
        if (S.view === to && !S.turn) {
          if (cb) cb();
          return;
        }
        S.turn = { t0: T, d: toSide ? 0.38 : 0.34, to: to };
        if (cb) S.cbs.push({ at: T + S.turn.d, fn: cb });
      },
      charge: function (secs) {
        var T = now();
        S.chg = { a: chargeAt(S, T), b: 1, t0: T, d: secs || 0.001, e: secs > 2 ? 1.6 : 1 };
      },
      calm: function () {
        var T = now();
        S.chg = { a: chargeAt(S, T), b: 0, t0: T, d: 0.25, e: 1 };
      },
      muzzle: function () {
        return { x: rig.mz[0] / 120, y: rig.mz[1] / 120 };
      },
      at: function (T) {
        manual = T;
        return render(T);
      },
      stop: function () {
        dead = true;
      },
    };
    render(now());
    if (!opts.manual) rq(loop);
    return ctl;
  }

  // what each monster shoots back (36 x 36): cartoon balls, never anything scary
  var SHOT = {
    1: '<ellipse cx="18" cy="19" rx="13" ry="12" fill="#7BD65A" stroke="#3F9A3A" stroke-width="2.4"/><ellipse cx="13" cy="13" rx="4.5" ry="2.8" transform="rotate(-30 13 13)" fill="#fff" opacity=".7"/><circle cx="26" cy="29" r="3" fill="#7BD65A" stroke="#3F9A3A" stroke-width="1.6"/>',
    2: '<circle cx="18" cy="18" r="13" fill="#EDE8FF" stroke="#8F7BD9" stroke-width="2.4"/><ellipse cx="13" cy="12" rx="4.5" ry="2.8" transform="rotate(-30 13 12)" fill="#fff"/><circle cx="13.5" cy="19" r="2" fill="#3A2A5E"/><circle cx="22.5" cy="19" r="2" fill="#3A2A5E"/><path d="M14.5 24 Q18 27 21.5 24" stroke="#3A2A5E" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
    3: '<path d="M7 22 L9 11 L19 5 L30 10 L31 23 L22 31 L11 30Z" fill="#BDB4A8" stroke="#6B6358" stroke-width="2.4" stroke-linejoin="round"/><path d="M12 12 L19 10" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/><path d="M20 20 L25 24" stroke="#8D8478" stroke-width="2" stroke-linecap="round"/>',
    4: '<path d="M18 2 Q23 10 28 16 Q34 26 26 31 Q18 36 10 31 Q2 26 8 16 Q12 11 14 6 Q16 11 18 2Z" fill="#FF8A4C" stroke="#C4501F" stroke-width="2.2" stroke-linejoin="round"/><path d="M18 14 Q23 20 22 25 Q20 30 16 29 Q12 27 13 22 Q14 18 18 14Z" fill="#FFE066"/>',
    5: '<path d="M18 2 L22.5 12.5 L34 14 L25.5 21.5 L28 33 L18 27 L8 33 L10.5 21.5 L2 14 L13.5 12.5Z" fill="#B58CFF" stroke="#5B3FC4" stroke-width="2.2" stroke-linejoin="round"/><circle cx="18" cy="19" r="4.2" fill="#FFFFFF" opacity=".85"/><circle cx="12" cy="12" r="2" fill="#fff"/>',
  };
  function shot(id) {
    return '<svg viewBox="0 0 36 36" aria-hidden="true">' + soft(SHOT[id] || SHOT[1]) + "</svg>";
  }
  // the arena behind a fight (360 x 204): a different cheerful place for each monster
  function sunAt(x, y, r, c, g) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r * 1.7 + '" fill="' + g + '" opacity=".55"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '"/>';
  }
  function cloudAt(x, y, k, c) {
    return '<g fill="' + (c || "#FFFFFF") + '"><ellipse cx="' + x + '" cy="' + y + '" rx="' + 26 * k + '" ry="' + 8 * k + '"/><ellipse cx="' + (x + 14 * k) + '" cy="' + (y - 6 * k) + '" rx="' + 14 * k + '" ry="' + 9 * k + '"/></g>';
  }
  function starsAt(list, c) {
    var o = "";
    for (var i = 0; i < list.length; i++) o += '<circle cx="' + list[i][0] + '" cy="' + list[i][1] + '" r="' + list[i][2] + '" fill="' + (c || "#FFFFFF") + '"/>';
    return o;
  }
  var ARENA = {
    1: function () {
      return '<rect width="360" height="204" fill="#A9DCFF"/><rect y="60" width="360" height="80" fill="#D9F2FF"/>' + sunAt(300, 40, 20, "#FFD23F", "#FFF1A8") + cloudAt(60, 40, 1.1) + cloudAt(190, 26, 0.8) +
        '<path d="M0 120 Q80 84 170 112 T360 100 L360 204 L0 204Z" fill="#9ADF8A"/><path d="M0 150 Q120 118 250 146 T360 138 L360 204 L0 204Z" fill="#7FCF74"/><rect y="168" width="360" height="36" fill="#6CBF55"/>' +
        '<circle cx="40" cy="176" r="3.5" fill="#FF8FB1"/><circle cx="62" cy="186" r="3" fill="#FFFFFF"/><circle cx="318" cy="180" r="3.5" fill="#FFD23F"/><circle cx="340" cy="190" r="3" fill="#FF8FB1"/><circle cx="170" cy="190" r="3" fill="#FFFFFF"/>';
    },
    2: function () {
      return '<rect width="360" height="204" fill="#7A63D6"/><rect y="70" width="360" height="90" fill="#B79BEF"/>' + starsAt([[30, 24, 1.8], [80, 50, 1.4], [140, 20, 2], [210, 44, 1.5], [260, 18, 1.8], [330, 56, 1.4], [110, 70, 1.2]]) +
        '<circle cx="292" cy="38" r="22" fill="#FFF1B8"/><circle cx="302" cy="32" r="19" fill="#7A63D6"/><circle cx="290" cy="36" r="15" fill="#FFF1B8" opacity="0"/>' +
        '<path d="M0 132 Q90 100 180 126 T360 112 L360 204 L0 204Z" fill="#6A58BE"/><path d="M0 158 Q120 132 250 156 T360 148 L360 204 L0 204Z" fill="#5A4AAA"/><rect y="174" width="360" height="30" fill="#4D3F96"/>' +
        '<path d="M52 150 l-8 -22 l16 0z M80 156 l-6 -16 l12 0z M300 152 l-8 -22 l16 0z" fill="#4D3F96"/>';
    },
    3: function () {
      return '<rect width="360" height="204" fill="#FFD9A8"/><rect y="40" width="360" height="90" fill="#FFEBCB"/>' + sunAt(60, 44, 18, "#FFF1A8", "#FFE6A0") + cloudAt(240, 36, 1, "#FFF8EC") +
        '<path d="M0 130 L0 92 L38 92 L38 70 L96 70 L96 108 L130 108 L130 130Z" fill="#E59A5A"/><path d="M210 130 L210 84 L250 84 L250 58 L318 58 L318 100 L360 100 L360 130Z" fill="#D98348"/>' +
        '<path d="M44 78 H92 M256 66 H312" stroke="#F2B27A" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M0 126 Q100 108 190 124 T360 118 L360 204 L0 204Z" fill="#F0CD8E"/><path d="M0 160 Q120 142 250 158 T360 152 L360 204 L0 204Z" fill="#E8BF78"/><rect y="176" width="360" height="28" fill="#DDB066"/>' +
        '<path d="M300 166 q4 -14 8 0 M312 166 q4 -10 8 0" stroke="#6CBF55" stroke-width="3" fill="none" stroke-linecap="round"/>';
    },
    4: function () {
      return '<rect width="360" height="204" fill="#FF9B6A"/><rect y="56" width="360" height="80" fill="#FFC48A"/>' + sunAt(180, 70, 30, "#FFE27A", "#FFD08A") + cloudAt(60, 40, 1, "#FFE6D0") + cloudAt(290, 52, 0.9, "#FFE6D0") +
        '<path d="M96 134 L146 74 L180 74 L230 134Z" fill="#B8573A"/><path d="M146 74 Q163 64 180 74 Q172 82 163 78 Q154 84 146 74Z" fill="#FFB020"/><circle cx="170" cy="58" r="7" fill="#FFF3E0" opacity=".85"/><circle cx="182" cy="46" r="9" fill="#FFF3E0" opacity=".7"/>' +
        '<path d="M0 134 Q100 114 190 132 T360 124 L360 204 L0 204Z" fill="#D98A5A"/><path d="M0 164 Q120 146 250 162 T360 156 L360 204 L0 204Z" fill="#C9774A"/><rect y="178" width="360" height="26" fill="#B8663F"/>';
    },
    5: function () {
      return '<rect width="360" height="204" fill="#2E2A78"/><rect y="60" width="360" height="90" fill="#5A4BB5"/>' + starsAt([[24, 22, 1.8], [70, 56, 1.4], [120, 18, 2], [200, 40, 1.5], [250, 16, 1.8], [320, 50, 1.4], [168, 66, 1.2], [344, 20, 1.6]], "#FFF3B0") +
        '<circle cx="80" cy="48" r="24" fill="#FFF1B8"/><circle cx="70" cy="42" r="5" fill="#E9D68F"/><circle cx="90" cy="56" r="4" fill="#E9D68F"/>' + cloudAt(250, 60, 1.1, "#8E80D8") +
        '<path d="M214 134 V92 H226 V82 H238 V92 H250 V82 H262 V92 H274 V134Z" fill="#3B2F8A"/><path d="M228 134 V112 a8 8 0 0 1 16 0 V134Z" fill="#241C5E"/><path d="M226 82 L232 68 L238 82Z M250 82 L256 68 L262 82Z" fill="#3B2F8A"/>' +
        '<path d="M0 138 Q100 116 190 136 T360 128 L360 204 L0 204Z" fill="#46387F"/><path d="M0 164 Q120 148 250 164 T360 158 L360 204 L0 204Z" fill="#3A8C5E"/><rect y="180" width="360" height="24" fill="#2F7A4F"/>';
    },
  };
  function arena(id) {
    var f = ARENA[id] || ARENA[1];
    return '<svg viewBox="0 0 360 204" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' + f() + "</svg>";
  }

  root.SWMonsters = { LIST: LIST, byId: byId, art: art, mount: mount, shot: shot, arena: arena };
  if (typeof module !== "undefined" && module.exports) module.exports = root.SWMonsters;
})(typeof window !== "undefined" ? window : this);
