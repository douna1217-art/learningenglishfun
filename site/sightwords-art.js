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
    var ST = [[-4, -22, -5, -1], [4, -22, 5, -1]];
    var ST_RAISED = [[-4, -22, -5, -1], [4, -22, 19, -9]];
    // Each arm is [elbow x, elbow y, hand x, hand y]; the left one starts at the shoulder (-9, -40), the right one at (9, -40), so every child
    // shows two arms, one on each side. A hanging arm reaches down to the hip; an arm that crosses the body (hold, hands) is drawn over it.
    var HL = [-13.5, -30, -14.5, -20], HR = [13.5, -30, 14.5, -20];
    var P = {
      stand: { L: ST, A: [HL, HR] },
      run: { lean: 9, L: [[-3, -22, -16, -5], [3, -22, 14, -10]], A: [[-16, -36, -21, -29], [17, -34, 20, -45]] },
      jump: { dy: -16, L: [[-4, -22, -14, -9], [4, -22, 14, -9]], A: [[-17, -48, -22, -57], [17, -48, 22, -57]] },
      cheer: { L: ST, A: [[-15, -47, -19, -57], [15, -47, 19, -57]] },
      point: { L: ST, A: [HL, [22, -42, 35, -43]] },
      wave: { L: ST, A: [HL, [19, -47, 21, -58]] },
      reach: { L: ST, A: [[-14, -32, -16, -23], [18, -38, 27, -34]] },
      hold: { L: ST, A: [[-13, -31, 7, -29], [17, -33, 14, -30]] },
      hands: { L: ST, A: [[-13, -32, -3, -29], [13, -32, 3, -29]] },
      look: { L: ST, over: true, A: [HL, [18, -47, 12, -55]] },
      self: { L: ST, A: [HL, [14, -35, 3, -36]] },
      wide: { L: ST, A: [[-19, -41, -33, -41], [19, -41, 33, -41]] }, // both arms straight out to the sides
      drink: { L: ST, A: [HL, [19, -35, 11, -44]] }, // the right hand raised in front of the chin, holding something to the mouth
      foothurt: { L: ST_RAISED, A: [HL, [16, -33, 19, -14]] }, // standing on one leg, the other foot lifted and the right hand reaching down to it
      crouch: { dy: 14, lean: 6, L: [[-4, -22, -16, -14], [4, -22, 14, -14]], A: [[-13, -30, -11, -22], [20, -31, 26, -23]] }, // squatting down, the right hand reaching forward and down
      ears: { L: ST, over: true, A: [[-18, -46, -12.5, -55], [18, -46, 12.5, -55]] }, // both hands over the ears
      walk: { L: [[-3, -22, -11, -3], [3, -22, 10, -3]], A: [[-13, -30, -10, -20], [14, -31, 17, -22]] },
      // both arms curve in front and meet low down, like a cradle under something held against the chest (draw it with arms: "only" over the thing)
      cradle: { L: ST, A: [[-16, -28, 10, -23], [17, -30, -6, -23]] },
      grip: { L: ST, A: [[-18, -37, -13, -34], [18, -37, 13, -34]] }, // both hands on the two sides of something held up in front of the chest (a letter, a card)
      cradleB: { L: ST, A: [[-17, -27, 6, -22], [18, -33, -2, -29]] }, // holding a baby lying across the arms: one forearm under it, the other around it
      cradleR: { L: ST, A: [[-14, -28, 27, -24], [25, -31, 3, -23]] }, // the same, with the thing held on the right side
      // walking to the right while the left arm reaches back and down to the handle of something pulled behind (draw the wagon first, the child over it)
      // both arms straight up with the hands above the head, gripping a bar lifted overhead (draw the bar, then the arms again over it with arms: "only")
      lift: { L: ST, A: [[-15, -57, -15, -76], [15, -57, 15, -76]] },
      // walking to the right with the right arm held out in front, holding a leash
      leash: { L: [[-3, -22, -11, -3], [3, -22, 10, -3]], A: [[-13, -30, -10, -20], [19, -44, 33, -45]] },
      // the same, with the left hand lower (a smaller child holding the bar lower down)
      pullLow: { L: [[-3, -22, -11, -3], [3, -22, 10, -3]], A: [[-20, -30, -33, -20], [14, -31, 17, -22]] },
      pullL: { L: [[-3, -22, -11, -3], [3, -22, 10, -3]], A: [[-21, -34, -35, -27], [14, -31, 17, -22]] },
    };
    var p = P[pose] || P.stand;
    function arm(sx, a) {
      return ln(sx, -40, a[0], a[1], 6.8, shirt) + ln(a[0], a[1], a[2], a[3], 5.4, skin) + '<circle cx="' + a[2] + '" cy="' + a[3] + '" r="3.6" ' + f(skin, 2) + "/>";
    }
    function arms() {
      return arm(-9, p.A[0]) + arm(9, p.A[1]);
    }
    function leg(a) {
      return ln(a[0], a[1], a[2], a[3], 6.5, pants) + '<ellipse cx="' + (a[2] + (a[2] > a[0] ? 2 : -1)) + '" cy="' + (a[3] + 1.5) + '" rx="5.5" ry="3" ' + f(o.barefoot ? skin : "#E5483A", 1.8) + "/>";
    }
    // arms: "none" leaves the arms out, "only" draws just the arms (drawn again over something the child holds against the body)
    if (o.arms === "only") return '<g transform="translate(0,' + (p.dy || 0) + ") rotate(" + (p.lean || 0) + ' 0 -22)">' + arms() + "</g>";
    var s = "";
    if (girl) s += '<ellipse cx="0" cy="-52" rx="14.5" ry="15" ' + f(hair, 2) + "/>";
    s += leg(p.L[0]) + leg(p.L[1]);
    if (girl) s += path("M-8 -43 Q0 -46 8 -43 L14 -17 Q0 -12 -14 -17Z", shirt, 2.4) + path("M-9 -31 Q0 -28 9 -31", dk(shirt, 0.12), 1);
    else s += '<rect x="-9" y="-43" width="18" height="22" rx="7" ' + f(shirt, 2.4) + "/>";
    if (!p.over && o.arms !== "none") s += arms();
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
    s += o.mouth === "open" ? '<path d="M-4.2 -49.6 Q0 -42.2 4.2 -49.6Z" fill="#C0392B"/>' : o.mouth === "sad" ? '<path d="M-4 -45.4 Q0 -49.6 4 -45.4" fill="none" stroke="#B3442F" stroke-width="1.9" stroke-linecap="round"/>' : o.mouth === "o" ? '<ellipse cx="0" cy="-47.5" rx="2" ry="2.6" fill="#C0392B"/>' : '<path d="M-3.6 -49 Q0 -45.6 3.6 -49" fill="none" stroke="#B3442F" stroke-width="1.9" stroke-linecap="round"/>';
    if (o.hat) s += '<g transform="translate(0,-62) scale(.62)">' + hat({ c: o.hat }) + "</g>";
    if (p.over && o.arms !== "none") s += arms();
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
    if (o.old) {
      s += '<circle cx="-5.5" cy="-38.5" r="5.6" fill="#fff" fill-opacity=".35" stroke="#5A4A3A" stroke-width="1.6"/><circle cx="5.5" cy="-38.5" r="5.6" fill="#fff" fill-opacity=".35" stroke="#5A4A3A" stroke-width="1.6"/><path d="M-0.2 -39 H0.2 M-11 -39.5 L-14.5 -41 M11 -39.5 L14.5 -41" stroke="#5A4A3A" stroke-width="1.6" stroke-linecap="round"/>';
      s += '<path d="M-3 -52 Q0 -55 3 -52" fill="none" stroke="#F4F6FA" stroke-width="2.4" stroke-linecap="round"/>';
      s += '<path d="M27 -2 V-24 Q27 -31 33 -31 Q38 -31 38 -26" fill="none" stroke="#7A4A22" stroke-width="3.6" stroke-linecap="round"/>';
    }
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
    if (isDog && o.collar) s += '<path d="M12.6 -43 Q15.6 -33 11.8 -24" fill="none" stroke="#9E2A20" stroke-width="5.4" stroke-linecap="round"/><path d="M12.6 -43 Q15.6 -33 11.8 -24" fill="none" stroke="#E5483A" stroke-width="3.2" stroke-linecap="round"/>';
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
    if (o.fly) {
      var t = path("M-12 -14 L-27 -17 L-24 -9Z", w, 1.8);
      t += path("M-4 -20 Q-12 -46 -26 -52 Q-20 -36 -18 -20Z", w, 1.8) + '<ellipse cx="0" cy="-16" rx="14" ry="9.5" ' + f(b) + "/>";
      t += path("M2 -14 Q12 -38 28 -42 Q22 -30 14 -14Z", dk(b, 0.12), 1.8) + '<circle cx="12" cy="-22" r="7.2" ' + f(b) + "/>";
      return t + path("M18 -23 L25 -21 L18 -18.5Z", "#FFAA2E", 1.6) + '<circle cx="14" cy="-23.5" r="1.6" fill="' + INK + '"/>';
    }
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
    var c = o.c || "#F59AB7", up = o.lift || 0;
    // o.lift raises the mattress on longer legs so there is room under the bed
    return '<rect x="-34" y="' + (-30 - up) + '" width="7" height="' + (30 + up) + '" rx="2" ' + f("#B27A43", 2) + '/><rect x="27" y="' + (-22 - up) + '" width="7" height="' + (22 + up) + '" rx="2" ' + f("#B27A43", 2) + '/><g transform="translate(0,' + -up + ')">' +
      '<rect x="-30" y="-14" width="60" height="13" rx="4" ' + f("#FFF3E0", 2) + '/><rect x="-28" y="-8" width="56" height="6" fill="#B27A43"/><rect x="-27" y="-23" width="22" height="10" rx="5" ' + f("#FFFFFE", 2) + "/>" +
      // a sleeper lies on the pillow: the head is sunk into it and tilted, and the blanket has a hump for the body
      (o.sleeper ? '<g transform="translate(0,6) rotate(-10 -16 -26)"><circle cx="-16" cy="-26" r="9" ' + f("#FFD7B5", 2) + '/><path d="M-25 -28 Q-24 -37 -15 -36 Q-7 -35 -7 -28 Q-12 -32 -18 -31 Q-22 -30 -25 -28Z" ' + f("#6B4423", 1.6) + '/><path d="M-20.5 -25 Q-18.5 -22.8 -16.5 -25 M-14 -25 Q-12 -22.8 -10 -25" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/><circle cx="-21" cy="-21.5" r="2" fill="#FF9DB5" opacity=".6"/></g>' : "") +
      (o.sleeper ? path("M-9 -16 Q-3 -21 8 -22 Q20 -23 25 -19 Q28 -18 28 -14 L28 -8 L-9 -8Z", c, 2) + '<path d="M4 -20 L4 -9 M12 -21 L12 -9 M20 -20 L20 -9" stroke="' + dk(c, 0.2) + '" stroke-width="1.2" opacity=".6"/>' : path("M-6 -20 L28 -20 L28 -8 L-6 -8Z", c, 2) + '<path d="M2 -20 L2 -8 M10 -20 L10 -8 M18 -20 L18 -8" stroke="' + dk(c, 0.2) + '" stroke-width="1.2" opacity=".6"/>') + "</g>";
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
    // o.flat = one wide layer with a few berries on top and no candle (a cake to cut, seen from the side)
    if (o.flat) return '<rect x="-26" y="-24" width="52" height="24" rx="6" ' + f("#F7C99C", 2.4) + '/><path d="M-26 -18 Q-19 -11 -13 -18 Q-6 -11 0 -18 Q7 -11 13 -18 Q20 -11 26 -18 L26 -24 L-26 -24Z" fill="#fff" stroke="' + dk("#F7C99C") + '" stroke-width="1.5"/><circle cx="6" cy="-27" r="3" fill="#E5483A"/><circle cx="15" cy="-26.5" r="3" fill="#E5483A"/><circle cx="22" cy="-26" r="2.6" fill="#E5483A"/>';
    return '<rect x="-24" y="-22" width="48" height="22" rx="6" ' + f("#F7C99C", 2.4) + '/><path d="M-24 -17 Q-18 -11 -12 -17 Q-6 -11 0 -17 Q6 -11 12 -17 Q18 -11 24 -17 L24 -22 L-24 -22Z" fill="#fff" stroke="' + dk("#F7C99C") + '" stroke-width="1.5"/>' +
      '<rect x="-16" y="-36" width="32" height="15" rx="5" ' + f(o.c || "#FF8FB1", 2.4) + '/><path d="M-16 -30 Q-10 -25 -4 -30 Q2 -25 8 -30 Q12 -26 16 -30 L16 -36 L-16 -36Z" fill="#fff" stroke="' + dk("#FF8FB1") + '" stroke-width="1.4"/>' +
      '<rect x="-2" y="-47" width="4" height="11" rx="1.5" fill="#6AA7FF"/><path d="M0 -55 Q-4.5 -50 0 -47 Q4.5 -50 0 -55Z" fill="#FFB020"/><circle cx="-9" cy="-37" r="2.6" fill="#E5483A"/><circle cx="9" cy="-37" r="2.6" fill="#E5483A"/>';
  }
  function slice(o) {
    return path("M-12 0 L12 0 L12 -11 L-12 -11Z", "#F7C99C", 2) + '<path d="M-12 -11 L12 -11 L12 -18 Q0 -22 -12 -18Z" fill="#fff" stroke="' + dk("#F7C99C") + '" stroke-width="1.4"/><circle cx="0" cy="-20" r="2.6" fill="#E5483A"/>';
  }
  function gift(o) {
    var c = o.c || C.purple;
    if (o.open) {
      return '<path d="M-6 -30 L-13 -56 M6 -30 L14 -54 M0 -30 L0 -60" stroke="#FFE066" stroke-width="3.4" stroke-linecap="round"/><rect x="-17" y="-26" width="34" height="26" rx="3" ' + f(c, 2.4) + '/><rect x="-3.5" y="-26" width="7" height="26" fill="#FFD23F" stroke="' + dk("#FFD23F") + '" stroke-width="1.4"/><rect x="-15" y="-30" width="30" height="6" rx="2" fill="' + dk(c, 0.5) + '"/>' +
        '<g transform="translate(27,-44) rotate(28)"><rect x="-19" y="-5" width="38" height="9" rx="3" ' + f(dk(c, 0.12), 2.2) + '/><rect x="-3.5" y="-5" width="7" height="9" fill="#FFD23F"/></g>' + star(0, -66, 7, "#FFD23F") + star(-18, -58, 4.4, "#FF8FB1") + star(8, -74, 4.4, "#6AA7FF");
    }
    return '<rect x="-17" y="-26" width="34" height="26" rx="3" ' + f(c, 2.4) + '/><rect x="-19" y="-33" width="38" height="9" rx="3" ' + f(dk(c, 0.12), 2.2) + '/><rect x="-3.5" y="-33" width="7" height="33" fill="#FFD23F" stroke="' + dk("#FFD23F") + '" stroke-width="1.4"/>' +
      '<path d="M0 -33 Q-14 -48 -9 -34Z M0 -33 Q14 -48 9 -34Z" ' + f("#FFD23F", 1.8) + "/>";
  }
  // a house with a door as tall as a child, two windows and a chimney; o.c = wall colour, o.rc = roof colour, o.open = the doorway is open (dark), o.lit = lit windows
  function house(o) {
    var wall = o.c || "#F3DDB0", roof = o.rc || "#C4533F", glass = o.lit ? "#FFE58A" : "#BFE3FA", s = "";
    s += '<rect x="12" y="-70" width="8" height="22" ' + f(dk(roof, 0.1), 2) + "/>";
    s += '<rect x="-24" y="-40" width="48" height="40" ' + f(wall, 2.4) + "/>";
    s += path("M-32 -38 L0 -67 L32 -38Z", roof, 2.6) + '<path d="M-22 -41 L0 -61 L22 -41" fill="none" stroke="' + dk(roof, 0.3) + '" stroke-width="1.4" opacity=".5"/>';
    s += '<rect x="-21" y="-32" width="11" height="11" ' + f(glass, 2) + '/><path d="M-15.5 -32 V-21 M-21 -26.5 H-10" stroke="#fff" stroke-width="1.4"/>';
    s += '<rect x="10" y="-32" width="11" height="11" ' + f(glass, 2) + '/><path d="M15.5 -32 V-21 M10 -26.5 H21" stroke="#fff" stroke-width="1.4"/>';
    if (o.open) s += '<rect x="-6.5" y="-31" width="13" height="31" rx="2.5" fill="#3B2A20" stroke="#1E1410" stroke-width="1.8"/>';
    else s += '<rect x="-6.5" y="-31" width="13" height="31" rx="2.5" ' + f("#9A6A38", 2) + '/><circle cx="3" cy="-14" r="1.5" fill="#FFD23F"/>';
    return s;
  }
  // a small kennel (the old, low house with an arched doorway) for a dog
  function doghouse(o) {
    return '<rect x="-24" y="-28" width="48" height="28" ' + f("#D9A66B", 2.4) + "/>" + path("M-30 -26 L0 -52 L30 -26Z", "#C4533F", 2.6) + '<path d="M-8 0 L-8 -12 Q0 -22 8 -12 L8 0Z" fill="#3B2A20" stroke="#1E1410" stroke-width="1.6"/>';
  }
  function clock(o) {
    return '<circle cx="0" cy="-14" r="13" ' + f("#FFFFFE", 2.6) + '/><path d="M-5 -29 L-9 -33 M5 -29 L9 -33" stroke="' + dk("#E5483A") + '" stroke-width="4" stroke-linecap="round"/><path d="M0 -14 L0 -22 M0 -14 L6 -11" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/><circle cx="0" cy="-14" r="1.8" fill="' + INK + '"/>';
  }
  // a clock with an arrow going round it backwards: "a while ago"
  function rewind(o) {
    return clock(o) + '<path d="M17 -31 A24 24 0 0 0 -17 3" fill="none" stroke="#8B6BE8" stroke-width="3.4" stroke-linecap="round"/><path d="M-13.5 -0.5 L-12.1 7.9 L-20.5 6.5Z" fill="#8B6BE8" stroke="#8B6BE8" stroke-width="1.6" stroke-linejoin="round"/>';
  }
  // a paper shopping bag (rolled top, side fold, two handles) with apples looking out of the top
  function applebag(o) {
    var s = '<path d="M-14 -40 Q-14 -66 0 -66 Q14 -66 14 -40" fill="none" stroke="#8A5A2B" stroke-width="3.2" stroke-linecap="round"/>', k, ax = [-12, 2, 15], ay = [-45, -49, -44];
    for (k = 0; k < 3; k++) s += '<circle cx="' + ax[k] + '" cy="' + ay[k] + '" r="9.4" ' + f("#E5483A", 2) + '/><ellipse cx="' + (ax[k] - 3.4) + '" cy="' + (ay[k] - 3) + '" rx="2.2" ry="3.4" fill="#fff" opacity=".5"/>';
    s += '<path d="M-22 0 L-24 -36 L24 -36 L22 0Z" ' + f("#D9A86C", 2.4) + '/><path d="M9 -36 L24 -36 L22 0 L7 0Z" fill="' + dk("#D9A86C", 0.12) + '" stroke="none"/><path d="M-24 -36 H24 M9 -36 L7 0" fill="none" stroke="' + dk("#D9A86C", 0.35) + '" stroke-width="1.8"/><rect x="-24" y="-41" width="48" height="6" rx="2" ' + f("#E8C089", 2) + '/><circle cx="-8" cy="-17" r="6.4" fill="#E5483A" stroke="' + dk("#E5483A", 0.3) + '" stroke-width="1.4"/><path d="M-8 -23 q1 -4 5 -4 q0 4 -5 4Z" fill="#5DBB5A"/>';
    return s;
  }
  function wagon(o) {
    return '<rect x="-22" y="-22" width="44" height="14" rx="3" ' + f("#E5483A", 2.2) + '/><circle cx="-14" cy="-4" r="6.4" ' + f("#3A3F4D", 1.8) + '/><circle cx="14" cy="-4" r="6.4" ' + f("#3A3F4D", 1.8) + '/><path d="M22 -14 L' + (o.hx || 48) + " " + (o.hy || -6) + '" stroke="#8A5A2B" stroke-width="3.2" stroke-linecap="round"/>';
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

  /* ------------------------------------------------------------------ stage 2: more things for the new sentences */
  function apple(o) {
    var c = o.c || "#E5483A";
    return '<path d="M0 -21 Q-2 -28 -6 -30" fill="none" stroke="#7A5328" stroke-width="2.6" stroke-linecap="round"/><path d="M2 -24 Q10 -33 18 -27 Q12 -20 2 -24Z" ' + f("#5DBB5A", 1.8) + "/>" +
      '<path d="M0 -21 C-8 -26 -20 -21 -19 -9 C-18 2 -9 5 -5 3 Q0 5 5 3 C9 5 18 2 19 -9 C20 -21 8 -26 0 -21Z" ' + f(c) + '/><ellipse cx="-9" cy="-14" rx="3" ry="5" transform="rotate(25 -9 -14)" fill="#fff" opacity=".5"/>';
  }
  function note(o) {
    var c = o.c || "#6A48E8";
    return '<ellipse cx="0" cy="0" rx="5.8" ry="4.2" transform="rotate(-20)" fill="' + c + '" stroke="' + dk(c) + '" stroke-width="1.6"/><path d="M5 -1.5 L5 -23 Q9 -19 13 -18" fill="none" stroke="' + dk(c) + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function moon(o) {
    return '<path d="M4 -17 A16 16 0 1 0 4 15 A20 20 0 0 1 4 -17Z" ' + f("#FFE58A", 2.2) + "/>";
  }
  function zzz(o) {
    function zed(x, y, k) {
      return '<path d="M' + x + " " + y + " h" + 9 * k + " l-" + 9 * k + " " + 10 * k + " h" + 9 * k + '" fill="none" stroke="#8B6BE8" stroke-width="' + 2.6 * k + '" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    return zed(-14, 8, 0.7) + zed(-4, -4, 1) + zed(8, -20, 1.35);
  }
  function tub(o) {
    return '<path d="M-40 -36 L40 -36 L35 -8 Q33 0 25 0 L-25 0 Q-33 0 -35 -8Z" ' + f("#8FD0F2", 2.4) + '/><rect x="-43" y="-40" width="86" height="8" rx="4" ' + f("#CBE9FA", 2.2) + '/><ellipse cx="-24" cy="2" rx="6" ry="3" ' + f("#8FA3C7", 1.6) + '/><ellipse cx="24" cy="2" rx="6" ry="3" ' + f("#8FA3C7", 1.6) + "/>";
  }
  // a wash stand: a basin on two legs with a tap running; the origin is the middle of the rim (o.h = how far down the floor is), so a child can wash hands in it
  function sink(o) {
    var h = o.h || 40, s = '<path d="M-21 14 L-32 ' + h + ' M21 14 L32 ' + h + ' M-27 ' + (h - 14) + ' L27 ' + (h - 14) + '" fill="none" stroke="' + dk("#8A97AD", 0.3) + '" stroke-width="6" stroke-linecap="round"/><path d="M-21 14 L-32 ' + h + ' M21 14 L32 ' + h + ' M-27 ' + (h - 14) + ' L27 ' + (h - 14) + '" fill="none" stroke="#B8C4D8" stroke-width="3.2" stroke-linecap="round"/>';
    s += '<path d="M-30 0 L30 0 Q28 20 0 22 Q-28 20 -30 0Z" ' + f("#F4F9FF", 2.4) + '/><rect x="-32" y="-4" width="64" height="7" rx="3" ' + f("#DCE8F5", 2.2) + "/>";
    s += '<path d="M0 -3 V-19 Q0 -26 8 -26 H14 V-19" fill="none" stroke="' + dk("#8A97AD", 0.3) + '" stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M0 -3 V-19 Q0 -26 8 -26 H14 V-19" fill="none" stroke="#B8C4D8" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<path d="M14 -17 V-3" fill="none" stroke="#6EC3F2" stroke-width="3.4" stroke-linecap="round"/><path d="M11 -9 V-5 M17 -12 V-8" fill="none" stroke="#BDE6FA" stroke-width="1.8" stroke-linecap="round"/>';
    return s;
  }
  function foam(o) {
    var s = "", P = [[-26, 0, 8], [-12, -5, 9], [4, -1, 8], [18, -6, 10], [30, 0, 7], [-4, -11, 7], [10, -12, 6]];
    for (var i = 0; i < P.length; i++) s += '<circle cx="' + P[i][0] + '" cy="' + P[i][1] + '" r="' + P[i][2] + '" fill="#FFFFFE" stroke="#BFE0F5" stroke-width="1.6"/>';
    return s;
  }
  function bubbles(o) {
    var s = "", P = [[0, 0, 7], [16, -14, 5], [-10, -20, 4], [8, -32, 6], [-6, -44, 3.6]];
    for (var i = 0; i < P.length; i++) s += '<circle cx="' + P[i][0] + '" cy="' + P[i][1] + '" r="' + P[i][2] + '" fill="#E4F4FF" fill-opacity=".7" stroke="#8FD0F2" stroke-width="1.8"/><circle cx="' + (P[i][0] - P[i][2] * 0.3) + '" cy="' + (P[i][1] - P[i][2] * 0.3) + '" r="' + P[i][2] * 0.22 + '" fill="#fff"/>';
    return s;
  }
  function book(o) {
    var c = o.c || "#FFFFFE";
    return '<path d="M-32 -3 Q-16 -9 0 -1 Q16 -9 32 -3 L32 2 Q16 -4 0 3 Q-16 -4 -32 2Z" ' + f("#6A48E8", 1.6) + '/><path d="M0 -3 Q-14 -10 -30 -6 L-30 -28 Q-14 -32 0 -26Z" ' + f(c, 2) + '/><path d="M0 -3 Q14 -10 30 -6 L30 -28 Q14 -32 0 -26Z" ' + f(c, 2) +
      '/><path d="M-25 -21 Q-14 -24 -5 -20 M-25 -14 Q-14 -17 -5 -13 M25 -21 Q14 -24 5 -20 M25 -14 Q14 -17 5 -13" fill="none" stroke="#9FB3D1" stroke-width="1.6" stroke-linecap="round"/>';
  }
  function pencil(o) {
    return '<rect x="-18" y="-3" width="6" height="6" rx="2" ' + f("#FF8FB1", 1.4) + '/><rect x="-13" y="-3" width="26" height="6" ' + f("#FFD23F", 1.6) + '/><path d="M13 -3 L22 0 L13 3Z" ' + f("#F2D3A8", 1.4) + '/><path d="M19.5 -1 L22 0 L19.5 1Z" fill="' + INK + '"/>';
  }
  function laptop(o) {
    return '<rect x="-24" y="-3" width="48" height="5" rx="2.5" ' + f("#B8C0D4", 1.8) + '/><rect x="-19" y="-31" width="38" height="29" rx="3.5" ' + f("#4A5878", 2) + '/><rect x="-15.5" y="-27.5" width="31" height="22" rx="2" fill="#BFE6FA"/><path d="M-10 -20 H6 M-10 -14 H12" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>';
  }
  function umbrella(o) {
    var c = o.c || C.red;
    return '<path d="M0 -40 V-4 Q0 3 -6 3" fill="none" stroke="#5A4A3A" stroke-width="3" stroke-linecap="round"/><path d="M-36 -40 Q-36 -66 0 -66 Q36 -66 36 -40 Q27 -46 18 -40 Q9 -46 0 -40 Q-9 -46 -18 -40 Q-27 -46 -36 -40Z" ' + f(c, 2.4) + '/><path d="M0 -66 Q-10 -56 -9 -43 M0 -66 Q10 -56 9 -43" fill="none" stroke="' + dk(c, 0.3) + '" stroke-width="1.6"/><circle cx="0" cy="-67" r="2.4" fill="' + dk(c, 0.4) + '"/>';
  }
  function coin(o) {
    return '<circle cx="0" cy="0" r="9" ' + f("#FFD23F", 2.2) + '/><circle cx="0" cy="0" r="5.6" fill="none" stroke="' + dk("#FFD23F", 0.3) + '" stroke-width="1.6"/><path d="M-3 -4 Q-5 -1 -1 0 Q3 1 1 4" fill="none" stroke="' + dk("#FFD23F", 0.5) + '" stroke-width="1.4" stroke-linecap="round" opacity=".0"/>';
  }
  function phone(o) {
    return '<rect x="-7" y="-13" width="14" height="26" rx="4" ' + f("#4A5878", 2) + '/><rect x="-4.6" y="-9.5" width="9.2" height="16" rx="1.6" fill="#BFE6FA"/><circle cx="0" cy="10" r="1.3" fill="#B8C0D4"/>';
  }
  function snowman(o) {
    var s = '<circle cx="0" cy="-15" r="15" ' + f("#FFFFFE", 2.2) + '/><circle cx="0" cy="-38" r="11" ' + f("#FFFFFE", 2.2) + "/>";
    s += '<path d="M-14 -36 L-27 -48 M14 -36 L26 -45" stroke="#7A4A22" stroke-width="2.6" stroke-linecap="round"/><path d="M0 -38 L11 -36 L0 -34Z" ' + f("#FF9F2E", 1.2) + '/><circle cx="-4" cy="-41" r="1.6" fill="' + INK + '"/><circle cx="4" cy="-41" r="1.6" fill="' + INK + '"/>';
    s += '<circle cx="0" cy="-19" r="1.8" fill="' + INK + '"/><circle cx="0" cy="-11" r="1.8" fill="' + INK + '"/><rect x="-9" y="-54" width="18" height="6" rx="1.5" ' + f("#3A3F4D", 1.4) + '/><rect x="-6" y="-61" width="12" height="9" rx="2" ' + f("#3A3F4D", 1.4) + "/>";
    return s;
  }
  function flake(o) {
    var s = "";
    for (var i = 0; i < 3; i++) {
      var a = (i * Math.PI) / 3;
      s += '<line x1="' + (Math.cos(a) * 6).toFixed(1) + '" y1="' + (Math.sin(a) * 6).toFixed(1) + '" x2="' + (-Math.cos(a) * 6).toFixed(1) + '" y2="' + (-Math.sin(a) * 6).toFixed(1) + '" stroke="#FFFFFE" stroke-width="2" stroke-linecap="round"/>';
    }
    return s;
  }
  function shiver(o) {
    return '<path d="M-6 0 l3 -3 l3 3 l3 -3 l3 3 M-6 8 l3 -3 l3 3 l3 -3 l3 3" fill="none" stroke="#3D8BF2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function trophy(o) {
    var g = "#FFD23F";
    return '<rect x="-14" y="-6" width="28" height="6" rx="2" ' + f("#B27A43", 1.8) + '/><rect x="-5" y="-16" width="10" height="11" ' + f(g, 1.8) + '/><path d="M-17 -30 Q-24 -30 -22 -22 Q-20 -15 -12 -15" fill="none" stroke="' + dk(g) + '" stroke-width="3.4" stroke-linecap="round"/><path d="M17 -30 Q24 -30 22 -22 Q20 -15 12 -15" fill="none" stroke="' + dk(g) + '" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M-17 -44 H17 V-34 Q17 -18 0 -18 Q-17 -18 -17 -34Z" ' + f(g, 2.2) + "/>" + star(0, -31, 6, "#FFFFFE") + '<path d="M-11 -42 V-32" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>';
  }
  function tank(o) {
    var w = o.w || 150, h = o.h || 100, l = -w / 2, r = w / 2;
    return '<rect x="' + l + '" y="' + -h + '" width="' + w + '" height="' + h + '" rx="12" ' + f("#BFE6FA", 2.6) + '/>' +
      '<rect x="' + (l + 3) + '" y="' + (-h + 12) + '" width="' + (w - 6) + '" height="' + (h - 14) + '" rx="9" fill="#8FD0F2" opacity=".75"/>' +
      '<path d="M' + (l + 3) + ' -9 Q0 -15 ' + (r - 3) + ' -9 L' + (r - 3) + ' -5 Q' + (r - 3) + ' -3 ' + (r - 8) + ' -3 L' + (l + 8) + ' -3 Q' + (l + 3) + ' -3 ' + (l + 3) + ' -5Z" fill="#F0DDA8"/>' +
      '<path d="M' + (l + 14) + ' -8 Q' + (l + 8) + ' -26 ' + (l + 16) + ' -36 M' + (l + 20) + ' -8 Q' + (l + 26) + ' -22 ' + (l + 20) + ' -32" fill="none" stroke="#5DBB5A" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M' + (l + 12) + ' ' + (-h + 6) + ' H' + (r - 12) + '" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>';
  }
  function tape(o) {
    return '<rect x="-30" y="-58" width="5" height="58" rx="2" ' + f("#8A97AD", 1.6) + '/><rect x="25" y="-58" width="5" height="58" rx="2" ' + f("#8A97AD", 1.6) + '/><path d="M-27 -50 Q0 -42 28 -50" fill="none" stroke="#E5483A" stroke-width="6" stroke-linecap="round"/><path d="M-27 -50 Q0 -42 28 -50" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="butt" stroke-dasharray="7 9" opacity=".95"/>';
  }
  function bulb(o) {
    var s = "";
    for (var i = 0; i < 7; i++) {
      var a = -Math.PI + (i * Math.PI) / 6;
      s += '<line x1="' + (Math.cos(a) * 18).toFixed(1) + '" y1="' + (Math.sin(a) * 18 - 6).toFixed(1) + '" x2="' + (Math.cos(a) * 25).toFixed(1) + '" y2="' + (Math.sin(a) * 25 - 6).toFixed(1) + '" stroke="#FFC93C" stroke-width="3" stroke-linecap="round"/>';
    }
    return s + '<circle cx="0" cy="-8" r="12" ' + f("#FFE066", 2.2) + '/><rect x="-5" y="3" width="10" height="7" rx="2" ' + f("#B8C0D4", 1.6) + '/><path d="M-4 -12 Q-6 -8 -3 -4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>';
  }
  function nosign(o) {
    return '<circle cx="0" cy="0" r="17" fill="#FFFFFE" fill-opacity=".85" stroke="#E5483A" stroke-width="5"/><path d="M-12 -12 L12 12" stroke="#E5483A" stroke-width="5" stroke-linecap="round"/>';
  }
  function ring(o) {
    var rx = o.rx || 40, ry = o.ry || 12, c = o.c || "#6A48E8";
    return '<ellipse cx="0" cy="0" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + c + '" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="2 9"/><path d="M' + (rx - 5) + " " + (-ry * 0.5) + " L" + (rx + 3) + " " + ry * 0.15 + " L" + (rx - 9) + " " + ry * 0.45 + 'Z" fill="' + c + '" stroke="' + c + '" stroke-width="2" stroke-linejoin="round"/>';
  }
  function calendar(o) {
    var s = '<rect x="-38" y="-52" width="76" height="52" rx="7" ' + f("#FFFFFE", 2.2) + '/><path d="M-38 -45 Q-38 -52 -31 -52 H31 Q38 -52 38 -45 V-38 H-38Z" ' + f("#E5483A", 2.2) + '/><circle cx="-20" cy="-52" r="2.8" fill="' + INK + '"/><circle cx="20" cy="-52" r="2.8" fill="' + INK + '"/>';
    for (var i = 0; i < 7; i++) {
      var x = -27 + (i % 4) * 18, y = i < 4 ? -27 : -11;
      s += '<path d="M' + (x - 4.5) + " " + y + " l3.4 3.8 l6.6 -7.6" + '" fill="none" stroke="#35B779" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    return s;
  }
  function trafficlight(o) {
    var on = o.on == null ? 2 : o.on, cs = ["#E5483A", "#FFD23F", "#4CC76A"], s = '<rect x="-3" y="-30" width="6" height="30" fill="#8A97AD" stroke="' + dk("#8A97AD") + '" stroke-width="1.6"/><rect x="-12" y="-76" width="24" height="48" rx="8" ' + f("#4A5878", 2.2) + "/>";
    for (var i = 0; i < 3; i++) s += '<circle cx="0" cy="' + (-65 + i * 14.5) + '" r="5.6" fill="' + (i === on ? cs[i] : dk(cs[i], 0.72)) + '"/>' + (i === on ? '<circle cx="0" cy="' + (-65 + i * 14.5) + '" r="9" fill="' + cs[i] + '" opacity=".28"/>' : "");
    return s;
  }
  function prints(o) {
    var n = o.n || 5, s = "";
    for (var i = 0; i < n; i++) s += '<ellipse cx="' + i * 14 + '" cy="' + (i % 2 ? -3 : 3) + '" rx="3.6" ry="2.4" fill="#B08A5A" opacity=".85"/>';
    return s;
  }
  function stopsign(o) {
    var p = "";
    for (var i = 0; i < 8; i++) {
      var a = (Math.PI / 8) + (i * Math.PI) / 4;
      p += (i ? "L" : "M") + (Math.cos(a) * 17).toFixed(1) + " " + (Math.sin(a) * 17 - 44).toFixed(1);
    }
    return '<rect x="-2.5" y="-28" width="5" height="28" fill="#8A97AD" stroke="' + dk("#8A97AD") + '" stroke-width="1.4"/><path d="' + p + 'Z" ' + f("#E5483A", 2.4) + '/><rect x="-10" y="-47" width="20" height="5.4" rx="2" fill="#FFFFFE"/>';
  }
  function pad(o) {
    return '<path d="M0 0 L-4 -10 A26 9 0 1 0 4 -10Z" ' + f("#6CCB5F", 2.2) + '/><path d="M-14 -4 Q-4 -9 8 -5" fill="none" stroke="#8FE07F" stroke-width="2" stroke-linecap="round"/>';
  }
  function star2(o) {
    return star(0, 0, o.r || 9, o.c || "#FFE066") + '<path d="M0 0 L-16 -3 M0 0 L-24 -1" stroke="#FFFFFE" stroke-width="3" stroke-linecap="round" opacity=".0"/>';
  }
  function comet(o) {
    return '<path d="M-6 -4 L-46 -18 M-6 0 L-52 -6 M-6 4 L-44 4" stroke="#FFF3B0" stroke-width="3.4" stroke-linecap="round" opacity=".75"/>' + star(0, 0, 11, "#FFE066");
  }
  function sandy(o) { // a small mound that kids and animals can sit in
    return '<path d="M-26 0 Q-20 -12 0 -12 Q20 -12 26 0Z" ' + f("#F0DDA8", 1.8) + "/>";
  }

  var K = { kid: kid, mom: mom, cat: cat, dog: dog, duck: duck, frog: frog, bird: bird, fish: fish, ball: ball, hat: hat, bag: bag, box: box, bed: bed, bus: bus, kite: kite, tree: tree, cake: cake, slice: slice, gift: gift, house: house, doghouse: doghouse, clock: clock, rewind: rewind, sink: sink, applebag: applebag, wagon: wagon, table: table, rock: rock, stairs: stairs, pond: pond, hill: hill, bush: bush, sun: sun, cloud: cloud, arrow: arrow, line: line, qm: qm, num: num, check: check, cross: cross, heart: heart, sparkle: sparkle, star: starK, whoosh: whoosh, bubble: bubble, thought: thought, dots: dots, eyes: eyes, medal: medal, crumbs: crumbs, plate: plate, mag: mag,
    apple: apple, note: note, moon: moon, zzz: zzz, tub: tub, foam: foam, bubbles: bubbles, book: book, pencil: pencil, laptop: laptop, umbrella: umbrella, coin: coin, phone: phone, snowman: snowman, flake: flake, shiver: shiver, trophy: trophy, tank: tank, tape: tape, bulb: bulb, nosign: nosign, ring: ring, calendar: calendar, trafficlight: trafficlight, prints: prints, stopsign: stopsign, pad: pad, comet: comet, sandy: sandy };

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
  var BGX = {}; // backgrounds added by sightwords-art3.js (stage 3)
  function background(kind) {
    if (BGX[kind]) return BGX[kind]();
    if (kind === "night") return '<rect width="240" height="160" fill="#3A3F86"/><rect y="118" width="240" height="42" fill="#2B2F6B"/><rect y="114" width="240" height="6" fill="#23275A"/><circle cx="30" cy="30" r="1.8" fill="#fff" opacity=".8"/><circle cx="96" cy="46" r="1.4" fill="#fff" opacity=".7"/><circle cx="214" cy="20" r="1.8" fill="#fff" opacity=".8"/><circle cx="62" cy="76" r="1.4" fill="#fff" opacity=".6"/>';
    if (kind === "sky") return '<rect width="240" height="160" fill="#2B2F6B"/><circle cx="26" cy="26" r="1.8" fill="#fff"/><circle cx="70" cy="50" r="1.4" fill="#fff" opacity=".8"/><circle cx="118" cy="18" r="1.8" fill="#fff"/><circle cx="168" cy="60" r="1.4" fill="#fff" opacity=".8"/><circle cx="226" cy="22" r="1.6" fill="#fff"/><circle cx="42" cy="86" r="1.2" fill="#fff" opacity=".7"/><circle cx="148" cy="96" r="1.2" fill="#fff" opacity=".7"/><path d="M0 124 Q60 112 120 122 Q180 132 240 118 L240 160 L0 160Z" fill="#2F5D4A"/><path d="M0 138 Q80 130 150 138 Q200 144 240 136 L240 160 L0 160Z" fill="#27503F"/>';
    if (kind === "snow") return '<rect width="240" height="160" fill="#CFE4F7"/>' + draw(["cloud", 52, 34, 1, {}]) + draw(["cloud", 170, 24, 0.8, {}]) + '<path d="M0 120 Q60 108 120 118 Q180 128 240 114 L240 160 L0 160Z" fill="#FFFFFE"/><path d="M0 136 Q80 128 150 136 Q200 142 240 134 L240 160 L0 160Z" fill="#E6F0FA"/>';
    if (kind === "rain") {
      var r = '<rect width="240" height="160" fill="#B7C6DA"/><ellipse cx="60" cy="30" rx="44" ry="16" fill="#8E9BB4"/><ellipse cx="170" cy="22" rx="52" ry="17" fill="#8E9BB4"/><ellipse cx="120" cy="40" rx="50" ry="14" fill="#9AA7BE"/><path d="M0 120 Q60 108 120 118 Q180 128 240 114 L240 160 L0 160Z" fill="#93C47F"/><path d="M0 134 Q80 126 150 134 Q200 140 240 132 L240 160 L0 160Z" fill="#82B76E"/>';
      for (var i = 0; i < 26; i++) {
        var rx = (i * 37) % 240, ry = 50 + ((i * 53) % 90);
        r += '<line x1="' + rx + '" y1="' + ry + '" x2="' + (rx - 4) + '" y2="' + (ry + 11) + '" stroke="#5B8FD0" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>';
      }
      return r;
    }
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
    look: [["tank", 170, G, 1.0, { w: 112, h: 96 }], ["fish", 174, G - 26, 1.35], ["kid", 56, G, 1.4, kb("point", { look: 1 })]],
    can: [["kid", 120, G, 1.5, kr("jump", { mouth: "open" })], ["sparkle", 82, 54, 1], ["sparkle", 160, 46, 0.8]],
    go: [["stairs", 104, G, 0.9], ["kid", 66, G - 14, 1.15, kb("stand", { look: 1 })], ["kid", 98, G - 34, 1.15, kg("stand", { look: 1 })], ["arrow", 0, 0, 1, { x1: 190, y1: 110, x2: 190, y2: 52 }]],
    up: [["kite", 168, 118, 1.0], ["kid", 78, G, 1.45, kb("hold", { look: 1 })], ["line", 0, 0, 1, { x1: 94, y1: 100, x2: 168, y2: 118 - 42 * 1.0 + 0 }], ["arrow", 0, 0, 1, { x1: 205, y1: 80, x2: 205, y2: 28 }]],
    it: [["ball", 120, G + 6, 2.6], ["sparkle", 70, 56, 1.1], ["sparkle", 176, 70, 0.9]],
    is: [["cat", 100, G, 1.95], ["bird", 196, G, 0.9]],
    in: [["box", 120, G, 2.1, { inner: [["fish", 8, -22, 0.8, { rot: -52 }]] }], ["bubble", 196, 44, 0.7, { w: 40, h: 30, inner: [["fish", 0, 8, 0.45, {}]] }]],
    we: [["kid", 82, G, 1.4, kb("wave", { look: 0 })], ["kid", 158, G, 1.4, kg("wave", { look: 0 })], ["ball", 120, G, 1.0], ["heart", 120, 52, 1.2]],
    me: [["kid", 120, G, 1.6, kb("self", { mouth: "open" })], ["arrow", 0, 0, 1, { x1: 196, y1: 56, x2: 150, y2: 84, c: "#E5483A" }]],
    my: [["kid", 82, G, 1.45, kg("hold", { look: 1 })], ["dog", 160, G, 1.5, { flip: true }], ["heart", 120, 50, 1.3]],
    to: [["kid", 60, G, 1.4, kb("wave", { look: 1 })], ["kid", 182, G, 1.4, kg("stand", { look: -1 })], ["arrow", 0, 0, 1, { x1: 152, y1: 78, x2: 100, y2: 78, c: "#6A48E8", dash: true }]],
    come: [["kid", 62, G, 1.5, kg("wave", { look: 1, mouth: "open" })], ["dog", 168, G, 1.5, { pose: "run", flip: true }], ["arrow", 0, 0, 1, { x1: 188, y1: 58, x2: 132, y2: 58, c: "#6A48E8" }]],
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
    make: [["table", 120, G, 1.5], ["cake", 120, G - 28, 1.0], ["kid", 66, G, 1.35, kb("reach", { look: 1 })], ["kid", 174, G, 1.35, kg("reach", { look: -1, flip: true })]],
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
    are: [["kid", 58, G, 1.1, kb("point", { look: 1 })], ["kid", 168, G, 1.9, kg("stand", { look: -1 })]],
    was: [["box", 104, G, 2.0, { inner: [["cat", 0, -3, 0.9, {}]] }], ["rewind", 208, 72, 1.2]],
    have: [["kid", 120, G, 1.6, kb("hold", { look: 1 })], ["ball", 146, G - 40, 0.9, { c: C.red }]],
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
    four: [["fish", 52, 128, 0.8], ["fish", 152, 128, 0.8, { c: "#FF8FB1" }], ["fish", 100, 154, 0.8, { c: "#4FA8F0" }], ["fish", 196, 154, 0.8], ["num", 120, 52, 1.5, { n: 4 }]],
    all: [["kid", 34, G, 1.0, kb("wave", {})], ["kid", 78, G, 1.0, kg("cheer", {})], ["kid", 120, G, 1.0, ky("jump", {})], ["kid", 162, G, 1.0, kr("wave", {})], ["kid", 206, G, 1.0, kg("cheer", { shirt: "#8B6BE8" })]],
    but: [["kid", 56, G, 1.3, kb("run", { mouth: "open" })], ["check", 56, 36, 0.9], ["kid", 186, G, 1.3, kb("stand", { look: -1 })], ["arrow", 0, 0, 1, { x1: 148, y1: 124, x2: 148, y2: 64, c: "#6A48E8", dash: true }], ["cross", 148, 92, 0.9]],
    into: [["box", 150, G, 1.9, {}], ["cat", 96, 74, 1.1, { pose: "jump" }], ["arrow", 0, 0, 1, { x1: 120, y1: 54, x2: 150, y2: 78, c: "#6A48E8" }]],
    must: [["kid", 44, G, 1.1, kb("run", { mouth: "o" })], ["kid", 78, G, 1.1, kg("run", { mouth: "o" })], ["bus", 188, G - 4, 0.7], ["clock", 124, 70, 1.3], ["whoosh", 20, G - 26, 0.7]],
    out: [["doghouse", 176, G, 1.7], ["dog", 70, G, 1.5, { flip: true, pose: "run" }], ["arrow", 0, 0, 1, { x1: 172, y1: 112, x2: 118, y2: 112 }]],
    our: [["bus", 118, G - 4, 1.4], ["kid", 40, G, 1.1, kb("point", { look: 1 })], ["kid", 206, G, 1.1, kg("point", { look: -1, flip: true })]],
    with: [["kid", 76, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["dog", 168, G, 1.5, { flip: true, tongue: true }], ["ball", 122, G, 1]],
    will: [["kid", 66, G, 1.5, kg("reach", { look: 1 })], ["rock", 168, G, 1.3], ["kid", 166, G - 22, 1.2, kb("reach", { look: -1, flip: true })], ["heart", 118, 56, 1]],
    well: [["whoosh", 70, G - 18, 1.4], ["kid", 120, G, 1.5, ky("run", { mouth: "open" })], ["medal", 176, 74, 1.7], ["star", 192, 44, 0.9]],
    soon: [["kid", 48, G, 1.2, kb("stand", { look: 1 })], ["kid", 78, G, 1.2, kg("stand", { look: 1 })], ["bus", 196, G - 4, 0.6], ["clock", 128, 68, 1.4], ["arrow", 0, 0, 1, { x1: 176, y1: 100, x2: 160, y2: 100 }]],
    too: [["kid", 82, G, 1.45, kb("jump", { mouth: "open" })], ["kid", 160, G, 1.45, kg("jump", { mouth: "open" })], ["sparkle", 120, 56, 1]],
    under: [["bed", 120, G, 1.8, { c: "#7FB8F2", lift: 26 }], ["cat", 120, G, 0.62, {}]],
    ride: [["bus", 120, G - 4, 1.5, { kids: 3 }], ["arrow", 0, 0, 1, { x1: 60, y1: 150, x2: 200, y2: 150, c: "#6A48E8" }]],
  };

  /* ------------------------------------------------------------------ stage 2 scenes (Dolch grade 1 and 2) */
  var S2 = {
    walk: [["prints", 14, G + 7, 1, { n: 4 }], ["dog", 178, G, 1.5, { pose: "stand", collar: true }], ["line", 0, 0, 1, { x1: 136, y1: 66, x2: 197, y2: 75, c: "#8A5A2B", w: 2.6 }], ["kid", 88, G, 1.5, kb("leash", { look: 1 })], ["heart", 120, 38, 0.9]],
    stop: [["bus", 88, G - 4, 1.15], ["stopsign", 178, G, 1.5], ["kid", 206, G, 1.0, kg("wave", { look: -1 })]],
    open: [["kid", 62, G, 1.45, kg("reach", { look: 1, mouth: "open" })], ["gift", 130, G, 1.55, { open: true }]],
    sit: [["dog", 100, G, 1.9], ["kid", 206, G, 1.35, kg("point", { look: -1, flip: true, mouth: "open" })], ["sparkle", 164, 44, 0.9]],
    fly: [["cloud", 52, 40, 1.2], ["cloud", 192, 112, 0.9], ["whoosh", 50, 98, 1.1], ["bird", 122, 108, 1.9, { fly: true, rot: -10 }]],
    sing: [["kid", 74, G, 1.45, kb("hands", { look: 0, mouth: "open" })], ["kid", 166, G, 1.45, kg("hands", { look: 0, mouth: "open" })], ["note", 98, 56, 1.3, {}], ["note", 118, 38, 1.1, { c: "#FF6FA0" }], ["note", 134, 62, 1.2, { c: "#3D8BF2" }]],
    sleep: [["bed", 112, G, 2.0, { c: "#7FB8F2", sleeper: true }], ["moon", 188, 44, 1.9], ["zzz", 156, 74, 1.0], ["star", 40, 34, 0.7], ["star", 84, 22, 0.55], ["star", 222, 84, 0.5]],
    wash: [["dog", 152, G - 10, 1.5], ["tub", 152, G, 1.2], ["foam", 152, G - 46, 1.0], ["kid", 60, G, 1.45, kg("reach", { look: 1, mouth: "open" })], ["bubbles", 200, 96, 1.0]],
    write: [["table", 170, G, 1.6], ["book", 170, G - 41, 1.0], ["kid", 82, G, 1.5, kb("hold", { look: 1 })], ["pencil", 112, G - 48, 0.9, { rot: 18 }]],
    read: [["mom", 66, G, 1.6, { pose: "hold", look: 1 }], ["book", 118, G - 46, 0.95], ["kid", 180, G, 1.25, kg("stand", { look: -1 })], ["heart", 150, 54, 0.9]],
    work: [["clock", 198, 44, 1.2], ["mom", 92, G, 1.55, { pose: "hands", look: 1 }], ["table", 126, G, 1.4], ["laptop", 146, G - 36, 0.95]],
    use: [["kid", 112, G, 1.5, kb("hold", { look: 0 })], ["umbrella", 133, G - 46, 1.15]],
    give: [["kid", 62, G, 1.5, kb("reach", { look: 1 })], ["gift", 118, G - 52, 0.75], ["mom", 178, G, 1.6, { pose: "reach", look: -1, flip: true }], ["heart", 120, 38, 1.0]],
    take: [["table", 168, G, 1.2], ["bag", 164, G - 31, 1.0, { c: C.blue }], ["kid", 108, G, 1.5, kg("reach", { look: 1 })], ["sparkle", 200, 70, 0.9]],
    put: [["box", 184, G, 1.7], ["ball", 184, 58, 1.2, { c: C.red }], ["arrow", 0, 0, 1, { x1: 184, y1: 80, x2: 184, y2: 98, c: "#6A48E8" }], ["kid", 112, G, 1.5, kb("reach", { look: 1 })]],
    pull: [["whoosh", 26, G - 20, 1.0], ["wagon", 60, G, 1.3, { hx: 85, hy: -28 }], ["box", 60, G - 27, 0.8], ["kid", 148, G, 1.0, kg("pullLow", { look: 1, rot: 8 })], ["kid", 206, G, 1.15, kb("pullL", { look: 1, rot: 8 })]],
    buy: [["table", 178, G, 1.3], ["hat", 158, G - 34, 0.8, { c: C.red }], ["hat", 198, G - 34, 0.8, { c: C.blue }], ["mom", 82, G, 1.55, { pose: "reach", look: 1 }], ["coin", 124, G - 56, 1.0]],
    call: [["kid", 80, G, 1.5, kb("look", { look: 0, mouth: "open" })], ["phone", 100, G - 86, 1.0, { rot: 8 }], ["thought", 170, 54, 1.0, { w: 66, h: 48, inner: [["mom", 0, 20, 0.52, {}]] }]],
    old: [["cat", 120, G, 2.1, { old: true, c: "#B9BFCC", l: "#EEF1F5" }]],
    cold: [["flake", 40, 40, 1.2], ["flake", 150, 26, 1], ["flake", 224, 62, 1.1], ["flake", 70, 92, 0.9], ["snowman", 194, G, 1.3], ["kid", 100, G, 1.6, kb("hands", { look: 0, hat: "#E5483A" })], ["shiver", 62, G - 74, 1.0], ["shiver", 132, G - 74, 1.0]],
    round: [["ball", 82, G + 2, 2.5], ["check", 82, 40, 0.9], ["gift", 172, G, 1.3, { c: "#9AA3B8" }], ["cross", 172, 56, 0.9]],
    fast: [["whoosh", 40, G - 40, 1.2], ["whoosh", 54, G - 20, 1.0], ["cat", 140, G, 2.0, { pose: "run" }], ["star", 52, 40, 0.8]],
    green: [["pond", 120, G + 8, 1.5, { w: 56 }], ["pad", 120, G + 2, 1.3], ["frog", 120, G - 4, 1.7], ["sparkle", 60, 50, 1], ["sparkle", 186, 62, 0.9]],
    five: [["duck", 32, G, 1.15], ["duck", 76, G, 1.15], ["duck", 120, G, 1.15], ["duck", 164, G, 1.15], ["duck", 208, G, 1.15], ["num", 120, 38, 1.5, { n: 5 }]],
    first: [["tape", 170, G, 1.35], ["kid", 112, G, 1.1, kb("run", {})], ["kid", 60, G, 1.0, kg("run", {})], ["kid", 170, G, 1.4, kr("cheer", { mouth: "open" })], ["num", 170, 18, 1.1, { n: 1 }]],
    best: [["table", 168, G, 1.0], ["trophy", 168, G - 26, 1.5], ["kid", 70, G, 1.45, kb("point", { look: 1, mouth: "open" })], ["star", 130, 34, 0.8], ["star", 206, 30, 0.9], ["star", 150, 16, 0.6]],
    many: [["tank", 120, G + 4, 1.0, { w: 170, h: 110 }], ["fish", 72, 66, 0.4], ["fish", 112, 56, 0.4, { c: "#FF8FB1", flip: true }], ["fish", 154, 72, 0.4, { c: "#4FA8F0" }], ["fish", 182, 58, 0.4, { c: "#FFD23F", flip: true }], ["fish", 88, 92, 0.4, { c: "#7ED957" }], ["fish", 132, 98, 0.4, { flip: true }], ["fish", 172, 100, 0.4, { c: "#FF8FB1" }], ["fish", 64, 112, 0.4, { c: "#4FA8F0", flip: true }], ["fish", 110, 118, 0.4, { c: "#FFD23F" }]],
    both: [["kid", 120, G, 1.55, kg("cheer", { mouth: "open" })], ["hat", 90, G - 88, 0.9, { c: C.red }], ["hat", 150, G - 88, 0.9, { c: C.blue }], ["sparkle", 52, 56, 1], ["sparkle", 192, 52, 1]],
    very: [["kid", 52, G, 0.95, kb("stand", { look: 1 })], ["sparkle", 100, 46, 0.9], ["dog", 156, G + 2, 2.3, { flip: true, tongue: true }]],
    right: [["kid", 70, G, 1.5, kb("point", { look: 1 })], ["arrow", 0, 0, 1, { x1: 112, y1: 54, x2: 176, y2: 54, c: "#6A48E8" }], ["tree", 204, G + 2, 0.9], ["sparkle", 150, 96, 0.9]],
    made: [["kite", 158, G + 4, 0.9], ["kid", 92, G, 1.5, kb("hold", { look: 1, mouth: "open" })], ["sparkle", 56, 50, 1], ["sparkle", 198, 42, 0.9], ["heart", 120, 38, 0.9]],
    gave: [["mom", 60, G, 1.55, { pose: "reach", look: 1 }], ["hat", 118, G - 52, 0.8, { c: C.red }], ["kid", 180, G, 1.2, kb("reach", { look: -1, flip: true })], ["heart", 120, 38, 1]],
    found: [["bush", 194, G, 1.0], ["frog", 180, G, 1.15], ["kid", 52, G, 1.4, kb("stand", { look: 1, mouth: "open" })], ["kid", 102, G, 1.25, kg("stand", { look: 1, mouth: "open" })], ["sparkle", 150, 72, 1.1], ["sparkle", 178, 58, 0.8]],
    goes: [["hill", 120, G + 12, 1.0, { dir: "up" }], ["bus", 112, 112, 0.7, { rot: -16 }], ["arrow", 0, 0, 1, { x1: 150, y1: 80, x2: 194, y2: 62 }]],
    how: [["tree", 138, G + 4, 1.5], ["arrow", 0, 0, 1, { x1: 208, y1: 78, x2: 208, y2: 24, c: "#6A48E8" }], ["arrow", 0, 0, 1, { x1: 208, y1: 78, x2: 208, y2: 132, c: "#6A48E8" }], ["kid", 46, G, 1.3, kb("hands", { look: 1, mouth: "o" })], ["qm", 208, 78, 1.1]],
    why: [["tree", 168, G + 4, 1.5], ["cat", 168, 76, 0.8], ["kid", 60, G, 1.5, kb("look", { look: 1, mouth: "o" })], ["qm", 106, 36, 1.4]],
    which: [["hat", 66, G + 2, 1.5, { c: C.red }], ["hat", 116, G + 2, 1.5, { c: C.blue }], ["hat", 166, G + 2, 1.5, { c: C.yellow }], ["kid", 214, G, 1.0, kg("point", { look: -1, flip: true })], ["qm", 116, 56, 1.5]],
    wish: [["kid", 66, G, 1.5, kb("look", { look: 1 })], ["comet", 196, 36, 1.0], ["thought", 132, 70, 1.0, { w: 60, h: 46, inner: [["kite", 0, 14, 0.3, {}]] }]],
    think: [["kid", 76, G, 1.5, kb("hands", { look: 1 })], ["thought", 164, 54, 1.0, { w: 68, h: 48, inner: [["cat", 0, 18, 0.55, {}]] }], ["qm", 210, 102, 0.8]],
    know: [["kid", 62, G, 1.5, kb("point", { look: 1, mouth: "open" })], ["bulb", 100, 40, 0.9], ["duck", 178, G, 1.5], ["check", 208, 62, 0.9]],
    ask: [["kid", 62, G, 1.45, kb("hands", { look: 1, mouth: "o" })], ["bubble", 118, 46, 1.0, { w: 46, h: 34, inner: [["qm", 0, 0, 0.7, {}]] }], ["mom", 182, G, 1.6, { pose: "stand", look: -1 }]],
    tell: [["kid", 62, G, 1.45, kb("point", { look: 1, mouth: "open" })], ["bubble", 120, 46, 1.0, { w: 58, h: 42, inner: [["cat", 0, 15, 0.45, {}]] }], ["mom", 184, G, 1.6, { pose: "hands", look: -1 }], ["heart", 158, 92, 0.8]],
    may: [["kid", 88, G, 1.55, kb("wave", { look: 1, mouth: "o" })], ["bubble", 162, 54, 1.0, { w: 60, h: 44, inner: [["ball", 0, 14, 0.9, {}]] }], ["qm", 206, 100, 1.0]],
    thank: [["kid", 60, G, 1.45, kg("hold", { look: 1, mouth: "open" })], ["gift", 86, G - 44, 0.65], ["bubble", 120, 42, 1.0, { w: 46, h: 34, inner: [["heart", 0, 2, 0.9, {}]] }], ["mom", 184, G, 1.6, { pose: "stand", look: -1 }]],
    live: [["house", 150, G, 1.9], ["kid", 68, G, 1.1, kb("self", { look: 1, mouth: "open" })], ["heart", 110, 66, 0.8]],
    let: [["house", 156, G, 1.9], ["kid", 98, G, 1.1, kg("reach", { look: 1, mouth: "o" })], ["bubble", 58, 44, 1.0, { w: 46, h: 34, inner: [["heart", 0, 2, 0.9, {}]] }]],
    going: [["rock", 56, G, 1.3], ["kid", 56, G - 30, 1.35, kb("stand", { look: 1, mouth: "open" })], ["pond", 188, G + 8, 1.0, { w: 46 }], ["arrow", 0, 0, 1, { x1: 94, y1: 78, x2: 166, y2: 106, dash: true }]],
    had: [["cat", 88, G, 1.8], ["plate", 168, G, 1.3], ["fish", 168, G - 12, 0.85], ["rewind", 208, 98, 1.05]],
    has: [["mom", 82, G, 1.6, { pose: "hold", look: 1 }], ["cake", 112, G - 46, 0.7], ["sparkle", 160, 56, 1], ["sparkle", 36, 84, 0.9]],
    does: [["dog", 80, G, 1.8, { tongue: true }], ["table", 170, G, 1.1], ["cake", 170, G - 28, 1.0], ["qm", 120, 44, 1.5]],
    dont: [["bed", 100, G, 1.8, { c: "#7FB8F2" }], ["kid", 100, G - 24, 1.1, kb("jump", { mouth: "open" })], ["nosign", 196, 54, 1.7]],
    after: [["num", 38, 36, 0.9, { n: 1 }], ["kid", 44, G, 1.2, kb("hold", { look: 1, mouth: "open" })], ["slice", 64, G - 46, 0.6], ["arrow", 0, 0, 1, { x1: 92, y1: 82, x2: 126, y2: 82 }], ["num", 188, 36, 0.9, { n: 2 }], ["kid", 160, G, 1.2, kg("reach", { look: 1, mouth: "open" })], ["kid", 216, G, 1.2, ky("reach", { look: -1, flip: true, mouth: "open" })], ["ball", 188, 96, 0.9]],
    again: [["frog", 62, 108, 1.2, { pose: "jump" }], ["frog", 178, 108, 1.2, { pose: "jump" }], ["ring", 120, 56, 1, { rx: 18, ry: 18 }], ["sparkle", 120, 100, 0.8]],
    then: [["num", 46, 34, 0.9, { n: 1 }], ["kid", 56, G, 1.25, kb("run", { mouth: "open" })], ["arrow", 0, 0, 1, { x1: 96, y1: 78, x2: 134, y2: 78 }], ["num", 128, 36, 0.9, { n: 2 }], ["kid", 180, G, 1.35, kb("jump", { mouth: "open" })]],
    when: [["trafficlight", 48, G, 1.5, { on: 2 }], ["kid", 124, G, 1.25, kb("run", { mouth: "open" })], ["kid", 180, G, 1.25, kg("run", { mouth: "open" })], ["arrow", 0, 0, 1, { x1: 96, y1: 40, x2: 150, y2: 40, c: "#4CC76A" }]],
    were: [["pond", 112, G + 6, 1.5, { w: 56 }], ["duck", 84, G - 4, 1.2], ["duck", 140, G - 4, 1.2], ["rewind", 208, 92, 1.05]],
    over: [["pond", 120, G + 8, 1.1, { w: 50 }], ["kid", 120, G - 14, 1.35, kg("jump", { mouth: "open" })], ["arrow", 0, 0, 1, { x1: 36, y1: 112, x2: 76, y2: 80, dash: true }], ["arrow", 0, 0, 1, { x1: 164, y1: 76, x2: 206, y2: 112, dash: true }]],
    around: [["tree", 120, G + 4, 1.4], ["ring", 120, G - 6, 1, { rx: 76, ry: 16 }], ["kid", 40, G, 1.0, kb("run", {})], ["kid", 204, G + 4, 1.0, kg("run", {})]],
    off: [["rock", 78, G, 1.6], ["kid", 134, G - 12, 1.25, ky("jump", { mouth: "open" })], ["arrow", 0, 0, 1, { x1: 160, y1: 62, x2: 184, y2: 112, dash: true }]],
    by: [["cat", 92, G, 1.8], ["box", 172, G, 1.7], ["sparkle", 132, 60, 0.9]],
    from: [["mom", 50, G, 1.5, { pose: "reach", look: 1 }], ["arrow", 0, 0, 1, { x1: 88, y1: 56, x2: 148, y2: 56, c: "#6A48E8", dash: true }], ["kid", 182, G, 1.4, kb("hold", { look: -1, flip: true })], ["gift", 164, G - 42, 0.7]],
    upon: [["rock", 120, G, 1.9], ["frog", 120, G - 40, 1.3], ["sparkle", 66, 56, 1], ["sparkle", 176, 50, 0.9]],
    of: [["applebag", 120, G, 2.0], ["sparkle", 196, 60, 0.9]],
    an: [["table", 160, G, 1.2], ["apple", 160, G - 31, 2.0], ["kid", 78, G, 1.5, kg("point", { look: 1 })]],
    any: [["tree", 160, G + 4, 1.5], ["kid", 70, G, 1.5, kb("look", { look: 1, mouth: "o" })], ["qm", 118, 40, 1.4]],
    as: [["kid", 56, G, 1.4, kg("point", { look: 1 })], ["kid", 170, G + 4, 1.4, kb("jump", { mouth: "open" })], ["arrow", 0, 0, 1, { x1: 100, y1: 62, x2: 136, y2: 62, c: "#6A48E8", dash: true }]],
    could: [["tree", 178, G + 4, 1.4], ["kite", 190, 62, 0.55, { rot: 24 }], ["kid", 90, G, 1.4, kb("wave", { look: 1, mouth: "o" })], ["qm", 126, 52, 1.2]],
    would: [["kid", 60, G, 1.45, kb("hold", { look: 1, mouth: "open" })], ["cake", 100, G - 46, 0.62], ["kid", 178, G, 1.4, kg("stand", { look: -1 })], ["qm", 138, 46, 1.3]],
    just: [["table", 168, G, 1.2], ["plate", 168, G - 29, 1.1], ["slice", 168, G - 33, 0.9], ["kid", 78, G, 1.5, kg("wave", { look: 1, mouth: "open" })], ["num", 120, 44, 1.2, { n: 1 }]],
    her: [["kid", 56, G, 1.4, kb("point", { look: 1 })], ["kid", 158, G, 1.6, kg("stand", { look: -1, hat: "#FF6FA0" })]],
    him: [["kid", 56, G, 1.4, kg("point", { look: 1 })], ["kid", 170, G + 4, 1.4, kb("jump", { mouth: "open" })]],
    his: [["kid", 46, G, 1.3, kg("point", { look: 1 })], ["kid", 124, G, 1.4, kb("stand", { look: 0 })], ["dog", 196, G, 1.4, { flip: true, tongue: true }], ["heart", 160, 56, 0.9]],
    them: [["kid", 46, G, 1.35, kb("look", { look: 1 })], ["kid", 152, G, 1.2, kg("reach", { look: 1, mouth: "open" })], ["kid", 208, G, 1.2, ky("reach", { look: -1, flip: true, mouth: "open" })], ["ball", 180, 92, 0.9]],
    their: [["house", 186, G, 1.5], ["kid", 100, G, 0.95, kb("stand", { look: 1 })], ["kid", 128, G, 0.95, kg("stand", { look: 1 })], ["kid", 40, G, 1.1, kr("point", { look: 1 })]],
    your: [["kid", 60, G, 1.4, kg("hold", { look: 1 })], ["hat", 90, G - 48, 0.75, { c: C.red }], ["kid", 180, G, 1.4, kb("stand", { look: -1, mouth: "o" })], ["qm", 136, 46, 1.3]],
    its: [["dog", 100, G, 1.8, { tongue: true }], ["ball", 160, G, 1.0, { c: C.blue }], ["heart", 150, 52, 0.9]],
    us: [["kid", 52, G, 1.3, kb("wave", { look: 1, mouth: "open" })], ["kid", 94, G, 1.3, kg("wave", { look: 1, mouth: "open" })], ["dog", 192, G, 1.4, { pose: "run", flip: true }], ["arrow", 0, 0, 1, { x1: 168, y1: 70, x2: 128, y2: 70, c: "#6A48E8" }]],
    or: [["bag", 66, G, 2.0, { c: C.red }], ["bag", 174, G, 2.0, { c: C.blue }], ["kid", 120, G, 1.1, kb("hands", { look: 0, mouth: "o" })], ["qm", 120, 38, 1.3]],
    these: [["cat", 76, G, 1.4], ["cat", 126, G, 1.4, CATB], ["kid", 188, G, 1.5, kg("hold", { look: -1 })], ["heart", 100, 40, 1]],
    those: [["kid", 52, G, 1.5, kb("point", { look: 1 })], ["tree", 166, G + 2, 1.1], ["tree", 208, G - 2, 0.9], ["arrow", 0, 0, 1, { x1: 104, y1: 72, x2: 142, y2: 72, c: "#6A48E8", dash: true }]],
    every: [["cat", 46, G, 1.3], ["hat", 46, G - 70, 0.55, { c: C.red }], ["cat", 120, G, 1.3, CATW], ["hat", 120, G - 70, 0.55, { c: C.blue }], ["cat", 194, G, 1.3, CATB], ["hat", 194, G - 70, 0.55, { c: C.yellow }]],
    some: [["cat", 40, G, 1.15], ["cat", 94, G, 1.15, CATB], ["cat", 148, G, 1.15], ["cat", 202, G, 1.15, CATB]],
    once: [["kid", 70, G, 1.5, kb("hands", { look: 1 })], ["thought", 158, 54, 1.0, { w: 72, h: 50, inner: [["frog", 0, 17, 0.55, {}]] }], ["num", 210, 112, 1.3, { n: 1 }]],
    because: [["dog", 52, G, 1.5, { tongue: true }], ["kid", 172, G, 1.5, kb("run", { mouth: "open" })], ["arrow", 0, 0, 1, { x1: 98, y1: 70, x2: 134, y2: 70 }], ["whoosh", 146, G - 20, 0.8]],
    before: [["num", 38, 26, 0.9, { n: 1 }], ["kid", 60, G, 1.45, kg("hands", { look: 0, mouth: "open" })], ["sink", 46, 94, 1.0], ["foam", 61, 91, 0.45], ["arrow", 0, 0, 1, { x1: 112, y1: 84, x2: 148, y2: 84 }], ["num", 204, 26, 0.9, { n: 2 }], ["kid", 196, G, 1.2, kb("hold", { look: -1, mouth: "open", flip: true })], ["slice", 176, G - 46, 0.6, { flip: true }]],
    been: [["kid", 62, G, 1.5, kb("look", { look: 1 })], ["prints", 94, G + 6, 1, { n: 5 }], ["pond", 198, G + 6, 0.95, { w: 42 }], ["qm", 118, 50, 1.3]],
    always: [["calendar", 176, 112, 1.2], ["kid", 70, G, 1.5, kg("hands", { look: 1, mouth: "o" })], ["bubble", 112, 44, 1.0, { w: 46, h: 34, inner: [["heart", 0, 2, 0.9, {}]] }]],
  };
  for (var k2 in S2) S[k2] = S2[k2];
  // pictures that are not out in the park
  var BGK = { four: "sea", look: "in", before: "in", on: "in", under: "in", in: "in", was: "in", who: "in", sleep: "night", wish: "sky", cold: "snow", use: "rain", wash: "in", write: "in", read: "in", work: "in", call: "in", old: "in", always: "in", open: "in", dont: "in" };

  var uidN = 0;
  function scene(word, opt) {
    var k = String(word).toLowerCase().replace(/[^a-z]/g, ""),
      items = S[k];
    if (!items) return "";
    var id = "swa" + ++uidN,
      body = render(items, id);
    if (typeof root.softSvg === "function") body = root.softSvg(body); // the soft shading is for the things, not the backdrop
    var inner = background(BGK[k] || "out") + body;
    return '<svg viewBox="0 0 240 160" aria-hidden="true" ' + (opt && opt.style ? 'style="' + opt.style + '"' : "") + '><defs><clipPath id="' + id + '"><rect width="240" height="160" rx="18"/></clipPath></defs><g clip-path="url(#' + id + ')">' + inner + "</g></svg>";
  }

  root.SWArt = {
    // more things, scenes and backgrounds from another file (sightwords-art3.js): { kit: {name: fn(o)}, scenes: {word: [items]}, bgk: {word: backgroundKind}, bg: {kind: fn()} }
    extend: function (spec) {
      var k;
      for (k in spec.kit || {}) K[k] = spec.kit[k];
      for (k in spec.scenes || {}) S[k] = spec.scenes[k];
      for (k in spec.bgk || {}) BGK[k] = spec.bgk[k];
      for (k in spec.bg || {}) BGX[k] = spec.bg[k];
    },
    h: { C: C, X: X, f: f, ln: ln, path: path, star: star, dk: dk, hexMix: hexMix, lum: lum, INK: INK, G: G, draw: draw, render: render, K: K, kb: kb, kg: kg, ky: ky, kr: kr, background: background },
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
