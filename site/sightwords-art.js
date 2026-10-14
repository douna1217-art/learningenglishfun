/* Little pictures for the sight-word sentences (sample): a small kit of drawn things (kids, animals, toys) and one scene per sentence.
   Everything is drawn in code in the same soft look as the pets (flat shapes that softSvg from pet-art.js shades), so there are
   no picture files to load. SWArt.scene("the") returns an <svg> string for that word's sentence; SWArt.has(word) tells if there is one.
   A scene is a list of items [kind, x, y, scale, options] on a 240 x 160 picture; the ground is at about y = 134.
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";

  function hexMix(h1, h2, t) {
    function v(h, i) {
      return parseInt(h.substr(1 + i * 2, 2), 16);
    }
    var o = "#";
    for (var i = 0; i < 3; i++) {
      var x = Math.round(v(h1, i) * (1 - t) + v(h2, i) * t);
      o += (x < 16 ? "0" : "") + x.toString(16);
    }
    return o;
  }
  function dk(h, t) {
    return hexMix(h, "#2B2250", t == null ? 0.42 : t);
  }
  function lum(h) {
    return (parseInt(h.substr(1, 2), 16) + parseInt(h.substr(3, 2), 16) + parseInt(h.substr(5, 2), 16)) / 3;
  }
  var INK = "#1E2A4A";
  var C = { red: "#E5483A", blue: "#3D8BF2", yellow: "#FFD23F", black: "#3A3F4D", white: "#F8FAFF", brown: "#A8714A", orange: "#FFA94D", green: "#6CCB5F", pink: "#FF8FB1", purple: "#8B6BE8" };

  function X(a, b) {
    var o = {},
      k;
    for (k in a) o[k] = a[k];
    for (k in b || {}) o[k] = b[k];
    return o;
  }
  function f(c, w) {
    return 'fill="' + c + '" stroke="' + dk(c) + '" stroke-width="' + (w || 2.5) + '" stroke-linejoin="round" stroke-linecap="round"';
  }
  function ln(x1, y1, x2, y2, w, c) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + dk(c) + '" stroke-width="' + (w + 3) + '" stroke-linecap="round"/>' +
      '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round"/>';
  }
  function path(d, c, w) {
    return '<path d="' + d + '" ' + f(c, w) + "/>";
  }
  function star(cx, cy, r, c) {
    var p = "";
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + (i * Math.PI) / 5,
        rr = i % 2 ? r * 0.46 : r;
      p += (i ? "L" : "M") + (cx + rr * Math.cos(a)).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return '<path d="' + p + 'Z" ' + f(c || "#FFC93C", 2) + "/>";
  }

  /* ------------------------------------------------------------------ people */
  function kid(o) {
    var shirt = o.shirt || C.blue, pants = o.pants || "#4C5FB8", skin = o.skin || "#FFD7B5", hair = o.hair || "#6B4423",
      girl = !!o.girl, pose = o.pose || "stand", look = o.look || 0;
    var ST = [[-4, -22, -5, -1], [4, -22, 5, -1]], AD = [[-8, -39, -14, -24], [8, -39, 14, -24]];
    var P = {
      stand: { L: ST, A: AD },
      run: { lean: 9, L: [[-3, -22, -16, -5], [3, -22, 14, -10]], A: [[-8, -39, -19, -31], [8, -39, 17, -33]] },
      jump: { dy: -16, L: [[-4, -22, -14, -9], [4, -22, 14, -9]], A: [[-8, -39, -20, -55], [8, -39, 20, -55]] },
      cheer: { L: ST, A: [[-8, -39, -19, -56], [8, -39, 19, -56]] },
      point: { L: ST, A: [[-8, -39, -14, -24], [8, -39, 34, -43]] },
      wave: { L: ST, A: [[-8, -39, -14, -24], [8, -39, 19, -57]] },
      reach: { L: ST, A: [[-8, -39, 24, -35], [8, -39, 26, -32]] },
      hold: { L: ST, A: [[-8, -39, 10, -29], [8, -39, 14, -31]] },
      hands: { L: ST, A: [[-8, -39, -3, -30], [8, -39, 3, -30]] },
      look: { L: ST, A: [[-8, -39, -14, -24], [8, -39, 13, -54]] },
      self: { L: ST, A: [[-8, -39, -14, -24], [8, -39, 3, -37]] },
    };
    var p = P[pose] || P.stand;
    function arm(a) {
      var mx = a[0] + (a[2] - a[0]) * 0.5,
        my = a[1] + (a[3] - a[1]) * 0.5;
      return ln(a[0], a[1], mx, my, 6, shirt) + ln(mx, my, a[2], a[3], 5, skin) + '<circle cx="' + a[2] + '" cy="' + a[3] + '" r="3.4" ' + f(skin, 2) + "/>";
    }
    function leg(a) {
      return ln(a[0], a[1], a[2], a[3], 6.5, pants) + '<ellipse cx="' + (a[2] + (a[2] > a[0] ? 2 : -1)) + '" cy="' + (a[3] + 1.5) + '" rx="5.5" ry="3" ' + f("#E5483A", 1.8) + "/>";
    }
    var s = "";
    if (girl) s += '<ellipse cx="0" cy="-52" rx="14.5" ry="15" ' + f(hair, 2) + "/>";
    s += arm(p.A[0]);
    s += leg(p.L[0]) + leg(p.L[1]);
    if (girl) s += path("M-8 -43 Q0 -46 8 -43 L14 -17 Q0 -12 -14 -17Z", shirt, 2.4) + path("M-9 -31 Q0 -28 9 -31", dk(shirt, 0.12), 1);
    else s += '<rect x="-9" y="-43" width="18" height="22" rx="7" ' + f(shirt, 2.4) + "/>";
    s += arm(p.A[1]);
    s += '<circle cx="0" cy="-53" r="11.5" ' + f(skin, 2.4) + "/>";
    if (girl) {
      s += '<circle cx="-14" cy="-47" r="4.6" ' + f(hair, 1.8) + '/><circle cx="14" cy="-47" r="4.6" ' + f(hair, 1.8) + "/>";
      s += path("M-11.5 -56 Q0 -71 11.5 -56 Q5 -57 0 -62 Q-6 -57 -11.5 -56Z", hair, 1.8);
      s += '<circle cx="-11" cy="-58" r="2.6" fill="#FF6FA0"/><circle cx="11" cy="-58" r="2.6" fill="#FF6FA0"/>';
    } else {
      s += path("M-12 -55 Q-13 -69 0 -69.5 Q13 -69 12 -55 Q6 -61 -1 -60 Q-7 -59.5 -12 -55Z", hair, 2);
    }
    if (o.bun) s += '<circle cx="0" cy="-71" r="6" ' + f(hair, 1.8) + "/>";
    var ex = 4.2,
      sh = look * 2;
    s += '<ellipse cx="' + (-ex + sh) + '" cy="-53" rx="1.8" ry="2.2" fill="' + INK + '"/><ellipse cx="' + (ex + sh) + '" cy="-53" rx="1.8" ry="2.2" fill="' + INK + '"/>';
    s += '<circle cx="-7.8" cy="-49" r="2.2" fill="#FF9DB5" opacity=".6"/><circle cx="7.8" cy="-49" r="2.2" fill="#FF9DB5" opacity=".6"/>';
    s += o.mouth === "open" ? '<path d="M-4.2 -49.6 Q0 -42.2 4.2 -49.6Z" fill="#C0392B"/>' : o.mouth === "o" ? '<ellipse cx="0" cy="-47.5" rx="2" ry="2.6" fill="#C0392B"/>' : '<path d="M-3.6 -49 Q0 -45.6 3.6 -49" fill="none" stroke="#B3442F" stroke-width="1.9" stroke-linecap="round"/>';
    if (o.hat) s += '<g transform="translate(0,-62) scale(.62)">' + hat({ c: o.hat }) + "</g>";
    return '<g transform="translate(0,' + (p.dy || 0) + ") rotate(" + (p.lean || 0) + ' 0 -22)">' + s + "</g>";
  }
  function mom(o) {
    return kid(X({ girl: true, shirt: "#8B6BE8", hair: "#4A3326", bun: true }, o));
  }

  /* ------------------------------------------------------------------ animals */
  function eyeColor(b) {
    return lum(b) < 95 ? "#FFE066" : INK;
  }
  function cat(o) {
    var b = o.c || C.orange, l = o.l || "#FFE2B8";
    if ((o.pose || "sit") !== "sit") return quad(X({ type: "cat", c: b, l: l }, o));
    var ec = eyeColor(b),
      s = path("M12 -6 Q36 -4 31 -32", "none", 1).replace('fill="none"', 'fill="none"');
    s = '<path d="M12 -6 Q36 -4 31 -32" fill="none" stroke="' + dk(b) + '" stroke-width="8.5" stroke-linecap="round"/><path d="M12 -6 Q36 -4 31 -32" fill="none" stroke="' + b + '" stroke-width="5.2" stroke-linecap="round"/>';
    s += '<ellipse cx="0" cy="-15" rx="15" ry="16" ' + f(b) + '/><ellipse cx="0" cy="-12" rx="8" ry="11" fill="' + l + '"/>';
    s += '<ellipse cx="-7" cy="-2.5" rx="6.5" ry="3.8" ' + f(b, 2) + '/><ellipse cx="7" cy="-2.5" rx="6.5" ry="3.8" ' + f(b, 2) + "/>";
    s += path("M-13 -44 L-11.5 -62 L-1.5 -51Z", b) + path("M13 -44 L11.5 -62 L1.5 -51Z", b) + '<path d="M-10.5 -48 L-10 -57 L-5 -51Z" fill="#FF9DB5"/><path d="M10.5 -48 L10 -57 L5 -51Z" fill="#FF9DB5"/>';
    s += '<circle cx="0" cy="-38" r="14.5" ' + f(b) + "/>";
    if (lum(b) > 95) s += '<path d="M-3 -51 L-3 -46 M0 -52 L0 -46.5 M3 -51 L3 -46" stroke="' + dk(b) + '" stroke-width="1.8" stroke-linecap="round"/>';
    s += '<ellipse cx="-5.5" cy="-38.5" rx="2.4" ry="3" fill="' + ec + '"/><ellipse cx="5.5" cy="-38.5" rx="2.4" ry="3" fill="' + ec + '"/>';
    s += '<circle cx="-4.8" cy="-39.6" r="1" fill="#fff"/><circle cx="6.2" cy="-39.6" r="1" fill="#fff"/>';
    s += '<path d="M-1.9 -34 L1.9 -34 L0 -31.8Z" fill="#FF8FB1"/><path d="M0 -31.8 Q-2.5 -28.8 -5 -30.4 M0 -31.8 Q2.5 -28.8 5 -30.4" fill="none" stroke="' + INK + '" stroke-width="1.4" stroke-linecap="round"/>';
    s += '<path d="M-9.5 -33 L-21 -35 M-9.5 -31 L-21 -30 M9.5 -33 L21 -35 M9.5 -31 L21 -30" fill="none" stroke="' + dk(b, 0.55) + '" stroke-width="1.1" stroke-linecap="round" opacity=".75"/>';
    return s;
  }
  function dog(o) {
    var b = o.c || C.brown, l = o.l || "#F1D9BE", e = o.ear || dk(b, 0.28);
    if ((o.pose || "sit") !== "sit") return quad(X({ type: "dog", c: b, l: l }, o));
    var s = '<path d="M13 -8 Q27 -14 25 -28" fill="none" stroke="' + dk(b) + '" stroke-width="8" stroke-linecap="round"/><path d="M13 -8 Q27 -14 25 -28" fill="none" stroke="' + b + '" stroke-width="4.8" stroke-linecap="round"/>';
    s += '<ellipse cx="0" cy="-15" rx="15" ry="16" ' + f(b) + '/><ellipse cx="0" cy="-12" rx="8" ry="11" fill="' + l + '"/>';
    s += '<ellipse cx="-7" cy="-2.5" rx="6.5" ry="3.8" ' + f(b, 2) + '/><ellipse cx="7" cy="-2.5" rx="6.5" ry="3.8" ' + f(b, 2) + "/>";
    s += '<ellipse cx="-14.5" cy="-37" rx="6.2" ry="11.5" transform="rotate(10 -14.5 -37)" ' + f(e) + '/><ellipse cx="14.5" cy="-37" rx="6.2" ry="11.5" transform="rotate(-10 14.5 -37)" ' + f(e) + "/>";
    s += '<circle cx="0" cy="-38" r="14.5" ' + f(b) + '/><ellipse cx="0" cy="-32" rx="9" ry="7" fill="' + l + '"/>';
    s += '<ellipse cx="-5.6" cy="-41" rx="2.2" ry="2.8" fill="' + INK + '"/><ellipse cx="5.6" cy="-41" rx="2.2" ry="2.8" fill="' + INK + '"/><circle cx="-4.9" cy="-42" r="0.9" fill="#fff"/><circle cx="6.3" cy="-42" r="0.9" fill="#fff"/>';
    s += '<ellipse cx="0" cy="-35.5" rx="3.4" ry="2.5" fill="' + INK + '"/><path d="M0 -33 L0 -30.5 M0 -30.5 Q-3 -27.8 -5.5 -30.2 M0 -30.5 Q3 -27.8 5.5 -30.2" fill="none" stroke="' + INK + '" stroke-width="1.4" stroke-linecap="round"/>';
    if (o.tongue) s += '<path d="M-2.2 -29 Q0 -22.5 2.2 -29Z" fill="#FF7A9C"/>';
    return s;
  }
  // side view of a cat or a dog, facing right
  function quad(o) {
    var b = o.c, l = o.l, d = dk(b), pose = o.pose || "stand", isDog = o.type === "dog", ec = eyeColor(b);
    var sets = {
      stand: [[-13, -18, -14, -1], [-7, -18, -7, -1], [9, -18, 9, -1], [15, -18, 15, -1]],
      run: [[-13, -18, -26, -3], [-7, -18, -19, -9], [9, -18, 21, -10], [15, -18, 27, -4]],
      jump: [[-13, -18, -27, -11], [-7, -18, -20, -16], [9, -18, 23, -17], [15, -18, 29, -12]],
    };
    var L = sets[pose] || sets.stand,
      s = "";
    s += ln(L[0][0], L[0][1], L[0][2], L[0][3], 5.5, dk(b, 0.14)) + ln(L[2][0], L[2][1], L[2][2], L[2][3], 5.5, dk(b, 0.14));
    s += isDog ? '<path d="M-21 -28 Q-31 -33 -29 -42" fill="none" stroke="' + d + '" stroke-width="8" stroke-linecap="round"/><path d="M-21 -28 Q-31 -33 -29 -42" fill="none" stroke="' + b + '" stroke-width="4.8" stroke-linecap="round"/>' :
      '<path d="M-21 -27 Q-38 -26 -35 -47" fill="none" stroke="' + d + '" stroke-width="8.5" stroke-linecap="round"/><path d="M-21 -27 Q-38 -26 -35 -47" fill="none" stroke="' + b + '" stroke-width="5.2" stroke-linecap="round"/>';
    s += '<ellipse cx="0" cy="-25" rx="23" ry="12.5" ' + f(b) + '/><ellipse cx="3" cy="-19" rx="14" ry="6" fill="' + l + '" opacity=".85"/>';
    s += ln(L[1][0], L[1][1], L[1][2], L[1][3], 5.5, b) + ln(L[3][0], L[3][1], L[3][2], L[3][3], 5.5, b);
    if (isDog) s += '<ellipse cx="17" cy="-37" rx="5.5" ry="10" transform="rotate(14 17 -37)" ' + f(dk(b, 0.28)) + "/>";
    else s += path("M16 -41 L18 -57 L26 -45Z", b) + '<path d="M18 -44 L19 -52 L23 -46Z" fill="#FF9DB5"/>';
    s += '<circle cx="23" cy="-34" r="11.5" ' + f(b) + "/>";
    if (isDog) s += '<ellipse cx="31.5" cy="-30" rx="6.8" ry="5" fill="' + l + '"/><ellipse cx="35.5" cy="-32" rx="2.7" ry="2.1" fill="' + INK + '"/>';
    else s += '<path d="M32 -34 L35.5 -33 L33 -30.8Z" fill="#FF8FB1"/><path d="M33 -30.8 Q31 -28 28 -29.5" fill="none" stroke="' + INK + '" stroke-width="1.3" stroke-linecap="round"/>';
    s += '<ellipse cx="26" cy="-37" rx="2.1" ry="2.7" fill="' + ec + '"/><circle cx="26.6" cy="-38" r="0.9" fill="#fff"/>';
    if (!isDog) s += '<path d="M33 -34 L42 -37 M33 -32 L42 -31" fill="none" stroke="' + dk(b, 0.55) + '" stroke-width="1" opacity=".7"/>';
    if (pose === "run" && isDog) s += '<path d="M33 -28 Q35 -22 37 -28Z" fill="#FF7A9C"/>';
    return pose === "jump" ? '<g transform="translate(0,-8) rotate(-14 0 -25)">' + s + "</g>" : s;
  }
  function duck(o) {
    var b = o.c || "#FFD93D", wl = dk(b, 0.2);
    var s = '<ellipse cx="0" cy="-17" rx="17.5" ry="15.5" ' + f(b) + '/><path d="M-13 -22 Q-20 -12 -9 -8 Q-3 -13 -5 -22Z" ' + f(wl, 1.8) + "/>";
    s += '<path d="M-9 -2 L-13 1 L-3 1Z M9 -2 L13 1 L3 1Z" ' + f("#FF9F2E", 1.8) + "/>";
    s += '<circle cx="0" cy="-41" r="12.5" ' + f(b) + "/>";
    if (lum(b) < 245) s += '<path d="M-2 -53 Q1 -58 4 -53" fill="none" stroke="' + dk(b) + '" stroke-width="2" stroke-linecap="round"/>';
    s += '<ellipse cx="0" cy="-37" rx="7.5" ry="4.4" ' + f("#FF9F2E", 1.8) + "/>";
    s += '<ellipse cx="-5.4" cy="-44" rx="1.9" ry="2.4" fill="' + INK + '"/><ellipse cx="5.4" cy="-44" rx="1.9" ry="2.4" fill="' + INK + '"/>';
    s += '<circle cx="-9" cy="-39" r="2.2" fill="#FF9DB5" opacity=".55"/><circle cx="9" cy="-39" r="2.2" fill="#FF9DB5" opacity=".55"/>';
    return s;
  }
  function frog(o) {
    var b = o.c || "#7ED957", l = "#E3F7D1", jump = o.pose === "jump";
    var s = "";
    if (jump) {
      s += ln(-10, -16, -30, -2, 6, b) + ln(10, -16, 30, -2, 6, b) + '<ellipse cx="-31" cy="-1" rx="7" ry="3" ' + f(b, 1.8) + '/><ellipse cx="31" cy="-1" rx="7" ry="3" ' + f(b, 1.8) + "/>";
      s += ln(-8, -22, -17, -35, 4.5, b) + ln(8, -22, 17, -35, 4.5, b);
    } else {
      s += '<ellipse cx="-17" cy="-7" rx="8.5" ry="6.5" ' + f(b, 2) + '/><ellipse cx="17" cy="-7" rx="8.5" ry="6.5" ' + f(b, 2) + "/>";
    }
    s += '<ellipse cx="0" cy="-15" rx="19" ry="14" ' + f(b) + '/><ellipse cx="0" cy="-10" rx="11.5" ry="7.5" fill="' + l + '"/>';
    s += '<circle cx="-9.5" cy="-28" r="7.2" ' + f(b, 2.2) + '/><circle cx="9.5" cy="-28" r="7.2" ' + f(b, 2.2) + "/>";
    s += '<circle cx="-9.5" cy="-28.5" r="4.6" fill="#fff"/><circle cx="9.5" cy="-28.5" r="4.6" fill="#fff"/><circle cx="-9" cy="-28.5" r="2.4" fill="' + INK + '"/><circle cx="10" cy="-28.5" r="2.4" fill="' + INK + '"/>';
    s += '<path d="M-11 -19 Q0 -10.5 11 -19" fill="none" stroke="' + dk(b, 0.55) + '" stroke-width="2" stroke-linecap="round"/>';
    s += '<circle cx="-13.5" cy="-17" r="2" fill="#FF9DB5" opacity=".6"/><circle cx="13.5" cy="-17" r="2" fill="#FF9DB5" opacity=".6"/>';
    if (jump) return '<g transform="translate(0,-14) rotate(-16 0 -15)">' + s + "</g>";
    return s;
  }
  function bird(o) {
    var b = o.c || "#4FA8F0", w = o.w || dk(b, 0.22);
    var s = ln(-2, -9, -2, 0, 2.6, "#C98A3A") + ln(4, -9, 5, 0, 2.6, "#C98A3A");
    s += path("M-11 -14 L-21 -20 L-20 -9Z", w, 1.8);
    s += '<ellipse cx="0" cy="-16" rx="13" ry="10" ' + f(b) + '/><ellipse cx="2" cy="-12" rx="7" ry="5" fill="#fff" opacity=".35"/>';
    s += '<ellipse cx="-3" cy="-15.5" rx="7.5" ry="5" ' + f(w, 1.8) + "/>";
    s += '<circle cx="9" cy="-25" r="7.5" ' + f(b) + "/>";
    s += path("M15 -26 L22 -24 L15 -21.5Z", "#FFAA2E", 1.6) + '<circle cx="11" cy="-26.5" r="1.7" fill="' + INK + '"/>';
    if (o.pretty) s += '<path d="M6 -33 L7 -39 M10 -33 L12 -39 M14 -32 L17 -37" stroke="#FF6FA0" stroke-width="2.4" stroke-linecap="round"/>';
    return s;
  }
  function fish(o) {
    var b = o.c || "#FF9B3D";
    var s = path("M-20 -16 L-34 -27 L-34 -5Z", dk(b, 0.12), 1.8);
    s += '<ellipse cx="0" cy="-16" rx="22" ry="12" ' + f(b) + '/><path d="M-4 -27 Q2 -34 8 -27Z" ' + f(dk(b, 0.12), 1.6) + "/>";
    s += '<path d="M2 -10 Q6 -4 10 -10" ' + f(dk(b, 0.1), 1.5) + '/><ellipse cx="3" cy="-12" rx="11" ry="4" fill="#fff" opacity=".28"/>';
    s += '<circle cx="12" cy="-19" r="3.6" fill="#fff"/><circle cx="13" cy="-19" r="2" fill="' + INK + '"/>';
    s += '<path d="M19 -14 Q21 -12 19 -10" fill="none" stroke="' + dk(b, 0.55) + '" stroke-width="1.6" stroke-linecap="round"/>';
    return s;
  }

  /* ------------------------------------------------------------------ things */
  function ball(o) {
    var c = o.c || C.red;
    return '<circle cx="0" cy="-12" r="12" ' + f(c) + '/><path d="M-11.4 -9 Q0 -3.5 11.4 -9 L11.4 -14.5 Q0 -9 -11.4 -14.5Z" fill="#fff" opacity=".92"/><ellipse cx="-5.5" cy="-19" rx="3.4" ry="2" transform="rotate(-35 -5.5 -19)" fill="#fff" opacity=".55"/>';
  }
  function hat(o) {
    var c = o.c || C.red;
    return '<ellipse cx="0" cy="-5" rx="21" ry="6.5" ' + f(c) + "/>" + path("M-13 -7 Q-14 -28 0 -28 Q14 -28 13 -7Q0 -3 -13 -7Z", c) + '<path d="M-13.2 -11.5 Q0 -7 13.2 -11.5 L12.8 -15.5 Q0 -11.5 -12.8 -15.5Z" ' + f(dk(c, 0.28), 1.4) + '/><ellipse cx="-4.5" cy="-22" rx="3.4" ry="2" transform="rotate(-20 -4.5 -22)" fill="#fff" opacity=".45"/>';
  }
  function bag(o) {
    var c = o.c || C.blue;
    return '<path d="M-7 -34 Q0 -48 7 -34" fill="none" stroke="' + dk(c) + '" stroke-width="3.4" stroke-linecap="round"/><rect x="-15" y="-35" width="30" height="35" rx="10" ' + f(c) + "/>" + path("M-15 -24 Q0 -14 15 -24 L15 -29 Q15 -35 9 -35 L-9 -35 Q-15 -35 -15 -29Z", dk(c, 0.18), 2) + '<rect x="-8.5" y="-14" width="17" height="11" rx="4" ' + f(dk(c, 0.18), 2) + '/><circle cx="0" cy="-19" r="2.4" fill="#FFD23F"/>';
  }
  function box(o) {
    var back = '<path d="M-21 -27 L-17 -37 L17 -37 L21 -27Z" ' + f("#7A5628", 1.8) + "/>";
    var s = '<path d="M-21 -27 L-31 -37 L-17 -37Z" ' + f("#E8B66E", 1.8) + '/><path d="M21 -27 L31 -37 L17 -37Z" ' + f("#E8B66E", 1.8) + "/>" + back;
    s += render(o.inner || [], o.uid);
    s += '<rect x="-22" y="-27" width="44" height="27" rx="2.5" ' + f("#DBA860", 2.2) + '/><path d="M-5 -27 L-5 -19 L5 -19 L5 -27" fill="#F4E1B6" stroke="' + dk("#DBA860") + '" stroke-width="1.6"/>';
    return s;
  }
  function bed(o) {
    var c = o.c || "#F59AB7";
    return '<rect x="-34" y="-30" width="7" height="30" rx="2" ' + f("#B27A43", 2) + '/><rect x="27" y="-22" width="7" height="22" rx="2" ' + f("#B27A43", 2) + "/>" +
      '<rect x="-30" y="-14" width="60" height="13" rx="4" ' + f("#FFF3E0", 2) + '/><rect x="-28" y="-8" width="56" height="6" fill="#B27A43"/><rect x="-27" y="-23" width="22" height="10" rx="5" ' + f("#FFFFFE", 2) + "/>" +
      path("M-6 -20 L28 -20 L28 -8 L-6 -8Z", c, 2) + '<path d="M2 -20 L2 -8 M10 -20 L10 -8 M18 -20 L18 -8" stroke="' + dk(c, 0.2) + '" stroke-width="1.2" opacity=".6"/>';
  }
  function bus(o) {
    var c = o.c || "#FFC83D", s = "";
    s += '<rect x="-50" y="-52" width="100" height="42" rx="11" ' + f(c, 2.8) + '/><rect x="-50" y="-22" width="100" height="6" fill="' + dk(c, 0.22) + '" opacity=".55"/>';
    var wx = [-42, -24, -6, 12];
    for (var i = 0; i < wx.length; i++) {
      s += '<rect x="' + wx[i] + '" y="-46" width="15" height="17" rx="4" ' + f("#BFE6FA", 1.8) + "/>";
      if (o.kids && i < o.kids) s += '<circle cx="' + (wx[i] + 7.5) + '" cy="-37" r="5.2" ' + f(i % 2 ? "#FFD7B5" : "#F2C79C", 1.4) + '/><circle cx="' + (wx[i] + 5.7) + '" cy="-37.6" r="0.9" fill="' + INK + '"/><circle cx="' + (wx[i] + 9.3) + '" cy="-37.6" r="0.9" fill="' + INK + '"/><path d="M' + (wx[i] + 5.6) + " -35.3 Q" + (wx[i] + 7.5) + " -33.6 " + (wx[i] + 9.4) + ' -35.3" fill="none" stroke="#B3442F" stroke-width="1" stroke-linecap="round"/>';
    }
    s += '<rect x="32" y="-46" width="14" height="30" rx="3.5" ' + f("#BFE6FA", 1.8) + '/><line x1="39" y1="-46" x2="39" y2="-16" stroke="' + dk("#BFE6FA") + '" stroke-width="1.4"/>';
    s += '<circle cx="-32" cy="-8" r="10" ' + f("#3A3F4D", 2) + '/><circle cx="-32" cy="-8" r="4" fill="#C8CEDB"/><circle cx="30" cy="-8" r="10" ' + f("#3A3F4D", 2) + '/><circle cx="30" cy="-8" r="4" fill="#C8CEDB"/>';
    s += '<circle cx="47" cy="-24" r="2.6" fill="#FFF3B0"/>';
    return s;
  }
  function kite(o) {
    var c = o.c || C.red;
    return '<path d="M0 -62 Q4 -78 0 -90 M0 -62 Q-6 -52 0 -46" fill="none" stroke="#7A6A5A" stroke-width="1" opacity="0"/>' +
      path("M0 -92 L17 -70 L0 -42 L-17 -70Z", c, 2.4) + '<path d="M0 -92 L0 -42 M-17 -70 L17 -70" stroke="' + dk(c, 0.35) + '" stroke-width="1.6" fill="none"/>' +
      '<path d="M0 -42 Q-9 -36 -3 -30 Q5 -24 -1 -17 Q-6 -10 2 -4" fill="none" stroke="#7A6A5A" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M-5 -34 L-11 -37 L-9 -31Z M1 -22 L7 -25 L5 -19Z" fill="#FFD23F" stroke="#B8860B" stroke-width="1"/>';
  }
  function tree(o) {
    var g = o.c || "#5DBB5A";
    var s = '<rect x="-7" y="-34" width="14" height="34" rx="3" ' + f("#9B6A3C", 2.2) + "/>";
    s += '<circle cx="-18" cy="-44" r="17" ' + f(g, 2.4) + '/><circle cx="18" cy="-44" r="17" ' + f(g, 2.4) + '/><circle cx="0" cy="-58" r="21" ' + f(g, 2.4) + '/><circle cx="0" cy="-42" r="19" ' + f(g, 0.1) + "/>";
    if (o.apples) s += '<circle cx="-12" cy="-52" r="3.6" fill="#E5483A"/><circle cx="10" cy="-44" r="3.6" fill="#E5483A"/><circle cx="2" cy="-64" r="3.6" fill="#E5483A"/>';
    return s;
  }
  function cake(o) {
    return '<rect x="-24" y="-22" width="48" height="22" rx="6" ' + f("#F7C99C", 2.4) + '/><path d="M-24 -17 Q-18 -11 -12 -17 Q-6 -11 0 -17 Q6 -11 12 -17 Q18 -11 24 -17 L24 -22 L-24 -22Z" fill="#fff" stroke="' + dk("#F7C99C") + '" stroke-width="1.5"/>' +
      '<rect x="-16" y="-36" width="32" height="15" rx="5" ' + f(o.c || "#FF8FB1", 2.4) + '/><path d="M-16 -30 Q-10 -25 -4 -30 Q2 -25 8 -30 Q12 -26 16 -30 L16 -36 L-16 -36Z" fill="#fff" stroke="' + dk("#FF8FB1") + '" stroke-width="1.4"/>' +
      '<rect x="-2" y="-47" width="4" height="11" rx="1.5" fill="#6AA7FF"/><path d="M0 -55 Q-4.5 -50 0 -47 Q4.5 -50 0 -55Z" fill="#FFB020"/><circle cx="-9" cy="-37" r="2.6" fill="#E5483A"/><circle cx="9" cy="-37" r="2.6" fill="#E5483A"/>';
  }
  function slice(o) {
    return path("M-12 0 L12 0 L12 -11 L-12 -11Z", "#F7C99C", 2) + '<path d="M-12 -11 L12 -11 L12 -18 Q0 -22 -12 -18Z" fill="#fff" stroke="' + dk("#F7C99C") + '" stroke-width="1.4"/><circle cx="0" cy="-20" r="2.6" fill="#E5483A"/>';
  }
  function gift(o) {
    var c = o.c || C.purple;
    return '<rect x="-17" y="-26" width="34" height="26" rx="3" ' + f(c, 2.4) + '/><rect x="-19" y="-33" width="38" height="9" rx="3" ' + f(dk(c, 0.12), 2.2) + '/><rect x="-3.5" y="-33" width="7" height="33" fill="#FFD23F" stroke="' + dk("#FFD23F") + '" stroke-width="1.4"/>' +
      '<path d="M0 -33 Q-14 -48 -9 -34Z M0 -33 Q14 -48 9 -34Z" ' + f("#FFD23F", 1.8) + "/>";
  }
  function house(o) {
    return '<rect x="-24" y="-28" width="48" height="28" ' + f("#D9A66B", 2.4) + "/>" + path("M-30 -26 L0 -52 L30 -26Z", "#C4533F", 2.6) + '<path d="M-8 0 L-8 -12 Q0 -22 8 -12 L8 0Z" fill="#3B2A20" stroke="#1E1410" stroke-width="1.6"/>';
  }
  function clock(o) {
    return '<circle cx="0" cy="-14" r="13" ' + f("#FFFFFE", 2.6) + '/><path d="M-5 -29 L-9 -33 M5 -29 L9 -33" stroke="' + dk("#E5483A") + '" stroke-width="4" stroke-linecap="round"/><path d="M0 -14 L0 -22 M0 -14 L6 -11" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/><circle cx="0" cy="-14" r="1.8" fill="' + INK + '"/>';
  }
  function table(o) {
    return '<rect x="-40" y="-26" width="80" height="8" rx="3" ' + f("#C48A52", 2.2) + '/><rect x="-35" y="-18" width="6" height="18" ' + f("#A8713A", 1.8) + '/><rect x="29" y="-18" width="6" height="18" ' + f("#A8713A", 1.8) + "/>";
  }
  function rock(o) {
    return path("M-20 0 Q-22 -14 -10 -20 Q4 -26 16 -18 Q24 -10 22 0Z", "#B8BFCC", 2.4);
  }
  function stairs(o) {
    var s = "";
    for (var i = 0; i < 4; i++) s += '<rect x="' + (-60 + i * 30) + '" y="' + (-14 - i * 20) + '" width="30" height="' + (14 + i * 20) + '" ' + f(i % 2 ? "#E8C58A" : "#F0D4A0", 2) + "/>";
    return s;
  }
  function pond(o) {
    return '<ellipse cx="0" cy="-6" rx="' + (o.w || 52) + '" ry="12" ' + f("#7CC4F0", 2.4) + '/><path d="M-20 -8 Q-12 -12 -4 -8 M6 -4 Q14 -8 22 -4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>';
  }
  function hill(o) {
    // a slope; o.dir "down" (high on the left) or "up"
    return o.dir === "up" ? path("M-120 0 L120 0 L120 -70 Z", "#9FD98A", 2.4) : path("M-120 -70 L120 0 L-120 0Z", "#9FD98A", 2.4);
  }
  function bush(o) {
    return '<circle cx="-14" cy="-12" r="13" ' + f("#5DBB5A", 2.2) + '/><circle cx="12" cy="-12" r="14" ' + f("#5DBB5A", 2.2) + '/><circle cx="0" cy="-20" r="14" ' + f("#6CCB5F", 2.2) + "/>";
  }
  function sun(o) {
    var s = "";
    for (var i = 0; i < 8; i++) {
      var a = (i * Math.PI) / 4;
      s += '<line x1="' + (Math.cos(a) * 17).toFixed(1) + '" y1="' + (Math.sin(a) * 17).toFixed(1) + '" x2="' + (Math.cos(a) * 23).toFixed(1) + '" y2="' + (Math.sin(a) * 23).toFixed(1) + '" stroke="#FFC93C" stroke-width="3" stroke-linecap="round"/>';
    }
    return s + '<circle r="13" ' + f("#FFD65A", 2.4) + "/>";
  }
  function cloud(o) {
    return '<ellipse cx="0" cy="0" rx="20" ry="9" fill="#fff"/><circle cx="-9" cy="-5" r="9" fill="#fff"/><circle cx="6" cy="-8" r="11" fill="#fff"/>';
  }

  /* ------------------------------------------------------------------ signs */
  function arrow(o) {
    var x1 = o.x1, y1 = o.y1, x2 = o.x2, y2 = o.y2, c = o.c || "#6A48E8", a = Math.atan2(y2 - y1, x2 - x1), hl = 10;
    var bx = x2 - Math.cos(a) * 3, by = y2 - Math.sin(a) * 3;
    var p1 = [x2 - Math.cos(a - 0.5) * hl, y2 - Math.sin(a - 0.5) * hl], p2 = [x2 - Math.cos(a + 0.5) * hl, y2 - Math.sin(a + 0.5) * hl];
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + bx + '" y2="' + by + '" stroke="' + c + '" stroke-width="4.2" stroke-linecap="round"' + (o.dash ? ' stroke-dasharray="1 8"' : "") + '/><path d="M' + x2 + " " + y2 + " L" + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + " L" + p2[0].toFixed(1) + " " + p2[1].toFixed(1) + 'Z" fill="' + c + '" stroke="' + c + '" stroke-width="2" stroke-linejoin="round"/>';
  }
  function line(o) {
    return '<line x1="' + o.x1 + '" y1="' + o.y1 + '" x2="' + o.x2 + '" y2="' + o.y2 + '" stroke="' + (o.c || "#7A6A5A") + '" stroke-width="' + (o.w || 1.6) + '" stroke-linecap="round"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + "/>";
  }
  function qm(o) {
    return '<circle cx="0" cy="0" r="13" ' + f("#FFC93C", 2.4) + '/><text x="0" y="6.5" text-anchor="middle" font-family="Fredoka,Nunito,sans-serif" font-weight="700" font-size="19" fill="' + INK + '">?</text>';
  }
  function num(o) {
    return '<circle cx="0" cy="0" r="12.5" ' + f("#6A48E8", 2.4) + '/><text x="0" y="6.5" text-anchor="middle" font-family="Fredoka,Nunito,sans-serif" font-weight="700" font-size="18" fill="#FFFFFE">' + o.n + "</text>";
  }
  function check(o) {
    return '<circle cx="0" cy="0" r="13" ' + f("#35B779", 2.4) + '/><path d="M-6.5 0.5 L-1.5 5.5 L7 -5" fill="none" stroke="#FFFFFE" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function cross(o) {
    return '<circle cx="0" cy="0" r="13" ' + f("#E5483A", 2.4) + '/><path d="M-5.5 -5.5 L5.5 5.5 M5.5 -5.5 L-5.5 5.5" fill="none" stroke="#FFFFFE" stroke-width="4" stroke-linecap="round"/>';
  }
  function heart(o) {
    return '<path d="M0 8 C-14 -2 -12 -14 -5 -14 C-2 -14 0 -11 0 -11 C0 -11 2 -14 5 -14 C12 -14 14 -2 0 8Z" ' + f("#FF6B8A", 2) + "/>";
  }
  function sparkle(o) {
    return '<path d="M0 -9 Q0 0 9 0 Q0 0 0 9 Q0 0 -9 0 Q0 0 0 -9Z" fill="#FFE066" stroke="#E0A800" stroke-width="1.2" stroke-linejoin="round"/>';
  }
  function starK(o) {
    return star(0, 0, o.r || 11, o.c);
  }
  function whoosh(o) {
    return '<path d="M0 0 L-16 0 M-4 -8 L-20 -8 M-4 8 L-20 8" fill="none" stroke="#B9C7DD" stroke-width="3" stroke-linecap="round"/>';
  }
  function bubble(o) {
    var w = o.w || 56, h = o.h || 40, s = "";
    s += '<path d="M' + (-w / 2 + 12) + " " + (h / 2 - 1) + " L" + (-w / 2 + 6) + " " + (h / 2 + 12) + " L" + (-w / 2 + 24) + " " + (h / 2 - 1) + 'Z" fill="#FFFFFE" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
    s += '<rect x="' + -w / 2 + '" y="' + -h / 2 + '" width="' + w + '" height="' + h + '" rx="14" fill="#FFFFFE" stroke="' + INK + '" stroke-width="2.2"/>';
    s += '<rect x="' + (-w / 2 + 10.5) + '" y="' + (h / 2 - 3) + '" width="14" height="4.5" fill="#FFFFFE"/>';
    return s + render(o.inner || [], o.uid);
  }
  function thought(o) {
    var w = o.w || 56, h = o.h || 40;
    return '<circle cx="' + (-w / 2 + 6) + '" cy="' + (h / 2 + 14) + '" r="3" fill="#FFFFFE" stroke="' + INK + '" stroke-width="1.8"/><circle cx="' + (-w / 2 + 14) + '" cy="' + (h / 2 + 6) + '" r="4.6" fill="#FFFFFE" stroke="' + INK + '" stroke-width="1.8"/><rect x="' + -w / 2 + '" y="' + -h / 2 + '" width="' + w + '" height="' + h + '" rx="18" fill="#FFFFFE" stroke="' + INK + '" stroke-width="2.2"/>' + render(o.inner || [], o.uid);
  }
  function dots(o) {
    return '<circle cx="-9" cy="0" r="2.6" fill="' + INK + '"/><circle cx="0" cy="0" r="2.6" fill="' + INK + '"/><circle cx="9" cy="0" r="2.6" fill="' + INK + '"/>';
  }
  function eyes(o) {
    return '<ellipse cx="-6" cy="0" rx="4" ry="5" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><ellipse cx="6" cy="0" rx="4" ry="5" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><circle cx="-5" cy="0.5" r="2" fill="' + INK + '"/><circle cx="7" cy="0.5" r="2" fill="' + INK + '"/>';
  }
  function medal(o) {
    return '<path d="M-6 -16 L0 -2 L6 -16Z" ' + f("#E8456A", 1.6) + '/><circle cx="0" cy="3" r="7.5" ' + f("#FFD54A", 2) + "/>" + star(0, 3, 4.2, "#FFFFFE");
  }
  function crumbs(o) {
    return '<circle cx="-12" cy="-3" r="1.6" fill="#E8B66E"/><circle cx="-3" cy="-1.6" r="1.4" fill="#E8B66E"/><circle cx="6" cy="-3.4" r="1.7" fill="#E8B66E"/><circle cx="15" cy="-1.8" r="1.3" fill="#E8B66E"/>';
  }
  function plate(o) {
    return '<ellipse cx="0" cy="-3" rx="19" ry="5.5" ' + f("#FFFFFE", 2) + '/><ellipse cx="0" cy="-4" rx="12" ry="3" fill="#E7EEF8"/>';
  }
  function mag(o) {
    return '<circle cx="0" cy="-12" r="9" fill="#BFE6FA" fill-opacity="0.55" stroke="' + dk("#6A48E8") + '" stroke-width="3"/><path d="M6.5 -5.5 L15 3" stroke="' + dk("#6A48E8") + '" stroke-width="4.5" stroke-linecap="round"/>';
  }

  var K = { kid: kid, mom: mom, cat: cat, dog: dog, duck: duck, frog: frog, bird: bird, fish: fish, ball: ball, hat: hat, bag: bag, box: box, bed: bed, bus: bus, kite: kite, tree: tree, cake: cake, slice: slice, gift: gift, house: house, clock: clock, table: table, rock: rock, stairs: stairs, pond: pond, hill: hill, bush: bush, sun: sun, cloud: cloud, arrow: arrow, line: line, qm: qm, num: num, check: check, cross: cross, heart: heart, sparkle: sparkle, star: starK, whoosh: whoosh, bubble: bubble, thought: thought, dots: dots, eyes: eyes, medal: medal, crumbs: crumbs, plate: plate, mag: mag };

  function draw(it, uid) {
    var fn = K[it[0]];
    if (!fn) return "";
    var o = it[4] || {};
    if (!o.uid) o = X(o, { uid: uid });
    var s = it[3] == null ? 1 : it[3],
      tr = "translate(" + it[1] + "," + it[2] + ")" + (o.rot ? " rotate(" + o.rot + ")" : "") + " scale(" + (o.flip ? -s : s) + "," + s + ")";
    return '<g transform="' + tr + '"' + (o.op ? ' opacity="' + o.op + '"' : "") + ">" + fn(o) + "</g>";
  }
  function render(items, uid) {
    var s = "";
    for (var i = 0; i < items.length; i++) s += draw(items[i], uid);
    return s;
  }

  /* ------------------------------------------------------------------ backgrounds */
  function background(kind) {
    if (kind === "in") return '<rect width="240" height="160" fill="#FDEBD0"/><rect y="118" width="240" height="42" fill="#E9C48F"/><rect y="114" width="240" height="6" fill="#C99A5E"/>';
    var s = '<rect width="240" height="160" fill="#D6EEFF"/>' + draw(["sun", 206, 32, 0.9, {}]) + draw(["cloud", 52, 34, 1, {}]) + draw(["cloud", 150, 22, 0.7, {}]);
    s += '<path d="M0 120 Q60 108 120 118 Q180 128 240 114 L240 160 L0 160Z" fill="#B9E49B"/><path d="M0 134 Q80 126 150 134 Q200 140 240 132 L240 160 L0 160Z" fill="#A5D984"/>';
    return s;
  }

  /* ------------------------------------------------------------------ the scenes */
  var G = 134; // the ground
  var KB = { shirt: "#3D8BF2" }, KG = { girl: true, shirt: "#FF7FA8", hair: "#7A4A2A" }, KY = { shirt: "#FFC93C", hair: "#2F2A28" }, KR = { shirt: "#E5483A", hair: "#4A3326" };
  function kb(pose, extra) {
    return X(X(KB, { pose: pose }), extra);
  }
  function kg(pose, extra) {
    return X(X(KG, { pose: pose }), extra);
  }
  function ky(pose, extra) {
    return X(X(KY, { pose: pose }), extra);
  }
  function kr(pose, extra) {
    return X(X(KR, { pose: pose }), extra);
  }
  var CATB = { c: C.black, l: "#6A7288" }, CATW = { c: "#F8F4EC", l: "#FFFFFE" }, DOGW = { c: "#F4EEE6", l: "#FFFFFE", ear: "#C9B7A0" };

  var S = {
    i: [["whoosh", 82, G - 28, 1.3], ["kid", 120, G, 1.45, kb("run", { mouth: "open" })]],
    a: [["kid", 72, G, 1.4, kb("look", { look: 1 })], ["cat", 168, G, 1.5, { flip: true }]],
    the: [["kid", 70, G, 1.4, kg("look", { look: 1 })], ["dog", 168, G, 1.5, { flip: true }]],
    and: [["cat", 66, G, 1.5], ["dog", 170, G, 1.5, { flip: true }], ["ball", 118, G, 1.2], ["heart", 118, 60, 1.3]],
    you: [["kid", 62, G, 1.4, kb("point", { look: 1 })], ["kid", 178, G, 1.4, kg("wave", { look: -1 })], ["arrow", 0, 0, 1, { x1: 92, y1: 66, x2: 138, y2: 66, c: "#6A48E8", dash: true }]],
    see: [["tree", 176, G, 1.1], ["bird", 192, 76, 0.85], ["kid", 70, G, 1.45, kb("look", { look: 1 })]],
    look: [["pond", 168, G + 8, 1.2, { w: 56 }], ["fish", 168, 112, 1.9], ["kid", 56, G, 1.4, kb("point", { look: 1 })]],
    can: [["kid", 120, G, 1.5, kr("jump", { mouth: "open" })], ["sparkle", 82, 54, 1], ["sparkle", 160, 46, 0.8]],
    go: [["stairs", 104, G, 0.9], ["kid", 66, G - 14, 1.15, kb("stand", { look: 1 })], ["kid", 98, G - 34, 1.15, kg("stand", { look: 1 })], ["arrow", 0, 0, 1, { x1: 190, y1: 110, x2: 190, y2: 52 }]],
    up: [["kite", 168, 118, 1.0], ["kid", 78, G, 1.45, kb("hold", { look: 1 })], ["line", 0, 0, 1, { x1: 94, y1: 100, x2: 168, y2: 118 - 42 * 1.0 + 0 }], ["arrow", 0, 0, 1, { x1: 205, y1: 80, x2: 205, y2: 28 }]],
    it: [["ball", 120, G + 6, 2.6], ["sparkle", 70, 56, 1.1], ["sparkle", 176, 70, 0.9]],
    is: [["cat", 100, G, 1.95], ["bird", 196, G, 0.9]],
    in: [["box", 120, G, 2.1, { inner: [["fish", 8, -22, 0.8, { rot: -52 }]] }], ["bubble", 196, 44, 0.7, { w: 40, h: 30, inner: [["fish", 0, 8, 0.45, {}]] }]],
    we: [["kid", 90, G, 1.4, kb("wave", { look: 0 })], ["kid", 148, G, 1.4, kg("wave", { look: 0 })], ["heart", 120, 52, 1.2]],
    me: [["kid", 120, G, 1.6, kb("self", { mouth: "open" })], ["arrow", 0, 0, 1, { x1: 196, y1: 56, x2: 150, y2: 84, c: "#E5483A" }]],
    my: [["kid", 82, G, 1.45, kg("hold", { look: 1 })], ["dog", 160, G, 1.5, { flip: true }], ["heart", 120, 50, 1.3]],
    to: [["kid", 60, G, 1.4, kb("wave", { look: 1 })], ["kid", 182, G, 1.4, kg("stand", { look: -1 })], ["arrow", 0, 0, 1, { x1: 152, y1: 78, x2: 100, y2: 78, c: "#6A48E8", dash: true }]],
    come: [["kid", 62, G, 1.5, kg("wave", { look: 1, mouth: "open" })], ["dog", 168, G, 1.5, { pose: "run" }], ["arrow", 0, 0, 1, { x1: 188, y1: 76, x2: 132, y2: 76, c: "#6A48E8" }]],
    run: [["whoosh", 70, G - 18, 1.5], ["dog", 130, G, 1.7, { pose: "run" }]],
    jump: [["frog", 128, 100, 1.7, { pose: "jump" }], ["arrow", 0, 0, 1, { x1: 60, y1: 120, x2: 100, y2: 70, c: "#6A48E8", dash: true }]],
    big: [["tree", 150, G + 4, 1.65], ["kid", 62, G, 1.0, kr("stand", { look: 1 })]],
    little: [["tree", 70, G + 4, 1.45], ["bird", 160, G, 1.1], ["sparkle", 186, 90, 0.9]],
    red: [["hat", 120, G + 4, 2.7, { c: C.red }], ["sparkle", 62, 56, 1], ["sparkle", 182, 70, 0.8]],
    blue: [["bag", 120, G + 4, 2.4, { c: C.blue }], ["sparkle", 186, 54, 0.9]],
    yellow: [["pond", 120, G + 6, 1.4, { w: 50 }], ["duck", 108, G - 6, 1.7], ["ball", 176, G, 1]],
    play: [["kid", 66, G, 1.4, kb("reach", { look: 1, mouth: "open" })], ["kid", 176, G, 1.4, kg("reach", { look: -1, mouth: "open", flip: true })], ["ball", 120, 96, 1.2]],
    help: [["kid", 76, G, 1.5, kg("reach", { look: 1 })], ["kid", 168, G, 1.2, kb("hold", { look: -1, flip: true })], ["box", 128, G - 22, 0.85, {}], ["heart", 120, 38, 1]],
    here: [["kid", 90, G, 1.5, kb("point", { look: 1, flip: false })], ["cross", 150, G + 12, 0.8, {}], ["arrow", 0, 0, 1, { x1: 150, y1: 58, x2: 150, y2: 112 }]],
    down: [["hill", 120, G + 12, 1.0, {}], ["ball", 78, 98, 1.1], ["arrow", 0, 0, 1, { x1: 118, y1: 78, x2: 172, y2: 112 }]],
    away: [["kid", 52, G, 1.4, kg("wave", { look: 1 })], ["dog", 188, G - 6, 0.8, { pose: "run" }], ["arrow", 0, 0, 1, { x1: 118, y1: 92, x2: 168, y2: 92 }], ["whoosh", 156, G - 18, 0.7]],
    find: [["kid", 118, G, 1.5, kg("cheer", { mouth: "open" })], ["hat", 140, 40, 0.9, { c: C.red }], ["sparkle", 80, 50, 1], ["sparkle", 176, 40, 0.8]],
    make: [["table", 120, G, 1.5], ["cake", 120, G - 28, 1.0], ["kid", 52, G, 1.35, kb("reach", { look: 1 })], ["kid", 188, G, 1.35, kg("reach", { look: -1, flip: true })]],
    for: [["kid", 68, G, 1.5, kg("reach", { look: 1 })], ["gift", 118, G - 24, 0.8, {}], ["kid", 180, G, 1.4, kb("stand", { look: -1 })], ["heart", 150, 52, 1]],
    not: [["cat", 80, G, 1.0], ["dog", 168, G, 2.0, { flip: true }], ["cross", 80, 60, 0.9, {}]],
    where: [["kid", 120, G, 1.55, kb("hands", { look: 1, mouth: "o" })], ["qm", 168, 52, 1.5], ["qm", 70, 68, 1]],
    said: [["frog", 100, G, 1.7], ["bubble", 166, 58, 1, { w: 62, h: 46, inner: [["frog", 0, 16, 0.6, { pose: "jump" }]] }]],
    one: [["dog", 120, G, 1.7], ["num", 188, 56, 1.4, { n: 1 }]],
    two: [["cat", 82, G, 1.5], ["cat", 158, G, 1.5, { flip: true, c: "#B8C0CC", l: "#EEF1F5" }], ["num", 120, 40, 1.4, { n: 2 }]],
    three: [["duck", 60, G, 1.3], ["duck", 120, G, 1.3], ["duck", 180, G, 1.3], ["num", 120, 38, 1.4, { n: 3 }]],
    funny: [["dog", 120, G - 6, 1.7, { pose: "jump", tongue: true }], ["star", 66, 56, 1, {}], ["star", 188, 60, 0.8, {}], ["hat", 140, 30, 0.7, { c: "#FF8FB1" }]],
    he: [["whoosh", 78, G - 24, 1.3], ["kid", 124, G, 1.5, kb("run", { mouth: "open" })]],
    she: [["kid", 120, G, 1.5, kg("jump", { mouth: "open" })], ["sparkle", 76, 54, 1], ["sparkle", 164, 44, 0.8]],
    they: [["kid", 58, G, 1.3, kb("reach", { look: 1 })], ["kid", 182, G, 1.3, kg("reach", { look: -1, flip: true })], ["kid", 120, G, 1.1, ky("jump", {})], ["ball", 120, 54, 1]],
    are: [["kid", 76, G, 1.9, kg("point", { look: 1 })], ["kid", 182, G, 1.1, kb("stand", { look: -1 })]],
    was: [["box", 120, G, 2.0, { inner: [["cat", 0, -2, 1.0, { op: 0.55 }]] }], ["clock", 200, 70, 1.1], ["arrow", 0, 0, 1, { x1: 214, y1: 118, x2: 186, y2: 118, c: "#8B6BE8" }]],
    have: [["kid", 120, G, 1.6, kb("hold", { look: 1 })], ["ball", 150, G - 24, 0.9, { c: C.red }]],
    do: [["kid", 100, G, 1.5, kg("look", { look: 1 })], ["qm", 168, 56, 1.4]],
    did: [["kid", 70, G, 1.5, kb("stand", { look: 1 })], ["thought", 150, 48, 1, { w: 66, h: 46, inner: [["dog", 0, 16, 0.55, {}]] }], ["qm", 196, 90, 1]],
    so: [["cake", 150, G, 2.7], ["kid", 56, G, 1.0, kb("cheer", { mouth: "open" })], ["star", 70, 40, 0.9], ["star", 202, 48, 0.8]],
    no: [["ball", 108, G + 4, 2.3, { c: C.blue }], ["thought", 192, 48, 1, { w: 56, h: 40, inner: [["ball", 0, 14, 0.8, { c: C.red }], ["cross", 12, -8, 0.6, {}]] }]],
    yes: [["kid", 108, G, 1.5, ky("jump", { mouth: "open" })], ["check", 178, 66, 1.7]],
    on: [["bed", 120, G, 1.8, { c: "#7FB8F2" }], ["cat", 120, G - 26, 0.85, { pose: "sit" }]],
    at: [["kid", 80, G, 1.5, kb("look", { look: 1 })], ["bird", 168, 52, 1.2], ["arrow", 0, 0, 1, { x1: 108, y1: 70, x2: 150, y2: 56, dash: true }]],
    be: [["kid", 120, G, 1.6, kg("hands", { look: 0 })], ["star", 120, 34, 1.4, {}], ["sparkle", 76, 56, 0.9], ["sparkle", 166, 56, 0.9]],
    am: [["kid", 112, G, 1.6, kb("self", { look: 0 })], ["arrow", 0, 0, 1, { x1: 188, y1: 56, x2: 148, y2: 84, c: "#E5483A" }]],
    this: [["kid", 100, G, 1.6, kg("hold", { look: 1 })], ["hat", 144, G - 36, 1.0, { c: C.red }], ["arrow", 0, 0, 1, { x1: 184, y1: 70, x2: 158, y2: 94 }]],
    that: [["kid", 56, G, 1.5, kb("point", { look: 1 })], ["bus", 186, G - 4, 0.75]],
    there: [["kid", 56, G, 1.5, kg("point", { look: 1 })], ["pond", 190, G + 4, 0.8, { w: 40 }], ["duck", 190, G - 2, 0.9]],
    what: [["kid", 76, G, 1.5, kb("point", { look: 1 })], ["gift", 168, G, 1.3, { c: "#9AA3B8" }], ["qm", 168, 62, 1.5]],
    who: [["box", 120, G, 2.0, { inner: [["eyes", 0, -30, 0.8, {}]] }], ["qm", 184, 56, 1.5]],
    want: [["kid", 76, G, 1.5, kg("reach", { look: 1 })], ["thought", 168, 52, 1, { w: 66, h: 48, inner: [["cake", 0, 16, 0.5, {}]] }]],
    like: [["kid", 82, G, 1.45, kb("hold", { look: 1 })], ["dog", 160, G, 1.5, { flip: true, tongue: true }], ["heart", 118, 54, 1.4], ["heart", 150, 38, 0.9]],
    get: [["kid", 90, G, 1.5, kg("reach", { look: 1, mouth: "open" })], ["ball", 160, 60, 1.1], ["arrow", 0, 0, 1, { x1: 180, y1: 40, x2: 168, y2: 62, dash: true }]],
    eat: [["kid", 66, G, 1.4, kb("hold", { look: 1, mouth: "open" })], ["slice", 106, G - 44, 0.8, {}], ["kid", 180, G, 1.4, kg("hold", { look: -1, mouth: "open", flip: true })], ["slice", 148, G - 44, 0.8, { flip: true }]],
    ate: [["dog", 100, G, 1.6, { tongue: true }], ["plate", 172, G, 1.2], ["crumbs", 172, G, 1.1]],
    saw: [["kid", 78, G, 1.5, kb("look", { look: 1 })], ["frog", 172, G, 1.3]],
    say: [["kid", 100, G, 1.6, kg("stand", { look: 1, mouth: "open" })], ["bubble", 170, 50, 1, { w: 56, h: 38, inner: [["dots", 0, 0, 1, {}]] }]],
    came: [["mom", 62, G, 1.55, { pose: "wave", look: 1 }], ["kid", 182, G, 1.2, kb("wave", { look: -1 })], ["arrow", 0, 0, 1, { x1: 96, y1: 70, x2: 140, y2: 70, c: "#6A48E8" }]],
    went: [["kid", 52, G, 1.1, kb("run", {})], ["kid", 86, G, 1.1, kg("run", {})], ["bus", 188, G - 4, 0.75], ["arrow", 0, 0, 1, { x1: 56, y1: 56, x2: 126, y2: 56 }]],
    ran: [["dog", 78, G, 1.6, { pose: "run" }], ["kid", 182, G, 1.5, kg("reach", { look: -1, mouth: "open", flip: true })], ["arrow", 0, 0, 1, { x1: 96, y1: 60, x2: 146, y2: 60 }]],
    good: [["dog", 120, G, 1.8, {}], ["medal", 150, 82, 1.5, {}], ["star", 82, 54, 1, {}]],
    new: [["kid", 120, G, 1.6, kg("cheer", { hat: C.red, mouth: "open" })], ["sparkle", 70, 56, 1], ["sparkle", 172, 50, 1], ["sparkle", 176, 92, 0.7]],
    pretty: [["bird", 116, G, 2.3, { c: "#FF8FB1", w: "#8B6BE8", pretty: true }], ["sparkle", 70, 58, 1], ["sparkle", 176, 50, 1.1], ["heart", 188, 96, 0.7]],
    please: [["kid", 90, G, 1.6, kb("hands", { look: 1, mouth: "o" })], ["heart", 150, 62, 1.2], ["kid", 188, G, 1.7, kg("reach", { look: -1, flip: true })]],
    now: [["kid", 76, G, 1.5, kr("wave", { look: 1, mouth: "open" })], ["clock", 168, 100, 1.9], ["whoosh", 140, 60, 0.7]],
    black: [["cat", 120, G, 2.1, CATB]],
    white: [["duck", 120, G, 2.2, { c: "#F8FAFF" }]],
    brown: [["whoosh", 70, G - 18, 1.5], ["dog", 130, G, 1.7, { pose: "run", c: "#A8714A" }]],
    four: [["fish", 66, 52, 0.9], ["fish", 168, 52, 0.9], ["fish", 66, 112, 0.9, { c: "#FF8FB1" }], ["fish", 168, 112, 0.9, { c: "#4FA8F0" }], ["num", 120, 80, 1.5, { n: 4 }]],
    all: [["kid", 34, G, 1.0, kb("wave", {})], ["kid", 78, G, 1.0, kg("cheer", {})], ["kid", 120, G, 1.0, ky("jump", {})], ["kid", 162, G, 1.0, kr("wave", {})], ["kid", 206, G, 1.0, kg("cheer", { shirt: "#8B6BE8" })]],
    but: [["kid", 60, G, 1.3, kb("run", { mouth: "open" })], ["check", 60, 36, 0.9], ["rock", 178, G, 1.0], ["kid", 178, G - 14, 1.3, kg("stand", { look: -1 })], ["cross", 178, 36, 0.9]],
    into: [["box", 150, G, 1.9, {}], ["cat", 96, 74, 1.1, { pose: "jump" }], ["arrow", 0, 0, 1, { x1: 120, y1: 54, x2: 150, y2: 78, c: "#6A48E8" }]],
    must: [["kid", 44, G, 1.1, kb("run", { mouth: "o" })], ["kid", 78, G, 1.1, kg("run", { mouth: "o" })], ["bus", 188, G - 4, 0.7], ["clock", 124, 70, 1.3], ["whoosh", 20, G - 26, 0.7]],
    out: [["house", 150, G, 1.7], ["dog", 84, G, 1.5, { flip: true, pose: "run" }], ["arrow", 0, 0, 1, { x1: 138, y1: 100, x2: 96, y2: 100 }]],
    our: [["bus", 118, G - 4, 1.4], ["kid", 40, G, 1.1, kb("point", { look: 1 })], ["kid", 206, G, 1.1, kg("point", { look: -1, flip: true })]],
    with: [["kid", 76, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["dog", 168, G, 1.5, { flip: true, tongue: true }], ["ball", 122, G, 1]],
    will: [["kid", 66, G, 1.5, kg("reach", { look: 1 })], ["rock", 168, G, 1.3], ["kid", 166, G - 22, 1.2, kb("reach", { look: -1, flip: true })], ["heart", 118, 56, 1]],
    well: [["whoosh", 70, G - 18, 1.4], ["kid", 120, G, 1.5, ky("run", { mouth: "open" })], ["medal", 176, 74, 1.7], ["star", 192, 44, 0.9]],
    soon: [["kid", 48, G, 1.2, kb("stand", { look: 1 })], ["kid", 78, G, 1.2, kg("stand", { look: 1 })], ["bus", 196, G - 4, 0.6], ["clock", 128, 68, 1.4], ["arrow", 0, 0, 1, { x1: 176, y1: 100, x2: 160, y2: 100 }]],
    too: [["kid", 82, G, 1.45, kb("jump", { mouth: "open" })], ["kid", 160, G, 1.45, kg("jump", { mouth: "open" })], ["sparkle", 120, 56, 1]],
    under: [["bed", 120, G, 1.8, { c: "#7FB8F2" }], ["cat", 120, G, 0.62, {}]],
    ride: [["bus", 120, G - 4, 1.5, { kids: 3 }], ["arrow", 0, 0, 1, { x1: 60, y1: 150, x2: 200, y2: 150, c: "#6A48E8" }]],
  };

  var uidN = 0;
  function scene(word, opt) {
    var k = String(word).toLowerCase().replace(/[^a-z]/g, ""),
      items = S[k];
    if (!items) return "";
    var id = "swa" + ++uidN,
      body = render(items, id);
    if (typeof root.softSvg === "function") body = root.softSvg(body); // the soft shading is for the things, not the backdrop
    var inner = background(k === "on" || k === "under" || k === "in" || k === "was" || k === "who" ? "in" : "out") + body;
    return '<svg viewBox="0 0 240 160" aria-hidden="true" ' + (opt && opt.style ? 'style="' + opt.style + '"' : "") + '><defs><clipPath id="' + id + '"><rect width="240" height="160" rx="18"/></clipPath></defs><g clip-path="url(#' + id + ')">' + inner + "</g></svg>";
  }

  root.SWArt = {
    scene: scene,
    has: function (w) {
      return !!S[String(w).toLowerCase().replace(/[^a-z]/g, "")];
    },
    words: function () {
      return Object.keys(S);
    },
    // which kinds of things a word's picture shows (kid, dog, ball...), including what is inside boxes and bubbles
    kinds: function (w) {
      var out = [];
      function walk(items) {
        (items || []).forEach(function (it) {
          if (out.indexOf(it[0]) < 0) out.push(it[0]);
          if (it[4] && it[4].inner) walk(it[4].inner);
        });
      }
      walk(S[String(w).toLowerCase().replace(/[^a-z]/g, "")]);
      return out;
    },
  };
  if (typeof module !== "undefined" && module.exports) module.exports = root.SWArt;
})(typeof window !== "undefined" ? window : this);
