/* The pets of the sight-words Monster battle as living rigs (sample). pet-art.js draws every pet with invisible part markers (<g data-rg="armL"> and so on),
   so this file can take the very same drawing the pet has everywhere else (its clothes, hat, glasses and scarf included) and move its parts on their own:
   the body breathes, the head bobs, the ears, tail and arms swing a little later than the body, the eyes blink, the face changes (happy, excited, surprised)
   and the pet turns from the front to a three-quarter side view, by sliding the face across the head, narrowing the body and moving the arms, feet and tail
   to where they would be on a pet turned to its side. It can fire (a recoil), get bumped, and cheer.

   PetRig.mount(host, type, eq, opts)   draws the pet into host and animates it until host leaves the page; returns a controller:
      play("fire" | "hit" | "cheer" | "idle", callback, strength)   (fire strength 2 = the long laser)
      turn(true | false, callback)    swing round to the side (toward the monster) or back to the front
      charge(seconds) / calm()        get tense and ready as the monster charges / relax
      muzzle()                        where its shot starts, as fractions of the picture's width and height
      at(T)                           draw the picture for time T (and use T as the clock from now on; the tests use it)
      stop()
   opts: gaze (-1 looks to the left of the drawing), lean (degrees), flip (true: the picture is drawn mirrored, as in the battle, so muzzle() is mirrored too), manual
   The drawing faces left; the battle mirrors it with CSS so the pet faces the monster on its right.
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";

  var NS = "http://www.w3.org/2000/svg",
    TAU = Math.PI * 2,
    LAGS = [0, 0.08, 0.16, 0.26],
    THMAX = 0.5, // radians the pet turns when it is fully side on (about 29 degrees)
    LEAF = ["eyeL", "eyeR", "blush", "mouth"], // parts that change with the mood
    MOODS = ["asleep", "excited", "surprised"]; // the faces taken from other drawings of the pet (asleep = a blink)

  // where things are in each pet (drawing units): z0 = how far the face stands in front of the head's middle, ey = eyes' height, edx = eyes' spacing,
  // mouth, neck = where the head sits, tail / ears / crest = where they hang from, sh = shoulders, ft = feet, ground = where it stands
  var D = {
    cat: { z0: 40, ey: 62, edx: 19, mouth: [60, 83], neck: [60, 100], tail: [88, 150], earL: [36, 44], earR: [84, 44], hat: [60, 40] },
    dog: { z0: 37, ey: 58, edx: 20, mouth: [60, 88], neck: [60, 104], tail: [90, 150], earL: [26, 42], earR: [94, 42], hat: [60, 34] },
    monkey: { z0: 39, ey: 62, edx: 17, mouth: [60, 87], neck: [60, 102], tail: [88, 156], earL: [26, 64], earR: [94, 64], hat: [60, 32] },
    bunny: { z0: 37, ey: 68, edx: 19, mouth: [60, 84], neck: [60, 106], tail: [98, 150], earL: [40, 58], earR: [80, 58], hat: [60, 44] },
    dino: { z0: 40, ey: 56, edx: 21, mouth: [60, 82], neck: [60, 104], tail: [86, 138], earL: [43, 36], earR: [77, 36], crest: [60, 32], hat: [60, 38] },
    duck: { z0: 36, ey: 54, edx: 21, mouth: [60, 78], neck: [60, 100], tail: [90, 138], shL: [30, 110], shR: [90, 110], ftL: [35, 168], ftR: [85, 168], crest: [58, 16], hat: [60, 24], beak: 12 },
    penguin: { z0: 37, ey: 60, edx: 22, mouth: [60, 85], neck: [60, 62], shL: [26, 102], shR: [94, 102], ftL: [38, 168], ftR: [82, 168], crest: [60, 12], hat: [60, 14], beak: 10, whole: true },
    panda: { z0: 37, ey: 62, edx: 16, mouth: [60, 85], neck: [60, 102], tail: [94, 150], earL: [28, 38], earR: [92, 38], hat: [60, 34] },
  };
  function dat(type) {
    var d = D[type] || D.cat;
    return d;
  }

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
  function tform(o, p) {
    if (!p.x && !p.y && !p.r && p.sx === 1 && p.sy === 1) return "";
    var s = "translate(" + n2(o[0] + p.x) + " " + n2(o[1] + p.y) + ")";
    if (p.r) s += " rotate(" + n2(p.r) + ")";
    if (p.sx !== 1 || p.sy !== 1) s += " scale(" + n2(p.sx) + " " + n2(p.sy) + ")";
    return s + " translate(" + -o[0] + " " + -o[1] + ")";
  }

  /* ---------------------------------------------------------------- the pet's motion at time T: a handful of numbers (nothing is kept between frames) */
  function chargeAt(S, T) {
    var c = S.chg;
    if (!c.d) return c.b;
    return c.a + (c.b - c.a) * Math.pow(cl01((T - c.t0) / c.d), c.e);
  }
  function viewAt(S, T) {
    var t = S.turn;
    if (!t) return S.v;
    var u = cl01((T - t.t0) / t.d),
      k = ease(u);
    return t.from + (t.to - t.from) * k + (t.to > t.from ? 0.1 : -0.04) * Math.sin(Math.PI * u) * (t.to > t.from ? 1 : 0);
  }
  function core(S, T) {
    var p = chargeAt(S, T),
      br = Math.sin((2.3 + 2 * p) * T),
      b = {
        rx: 0, ry: 0, rr: S.lean + 0.9 * Math.sin(1.1 * T + S.seed), rsx: 1, rsy: 1, // the whole pet
        sx: 1 - 0.01 * br, sy: 1 + (0.022 + 0.015 * p) * br - 0.04 * p, // body: breathing, a little crouch when tense
        hr: 1.4 * Math.sin(1.3 * T + 0.6), hdx: 0, // head tilt
        arm: 3 * Math.sin(2.1 * T) + 5 * p, reach: 1, flap: 0, // arms raised (degrees); the ears' extra fling
        wag: 1 + 0.8 * p, v: viewAt(S, T), p: p,
        eyes: "happy", mouth: "happy",
      },
      u,
      h;
    if (S.mode === "cheer") {
      var hp = Math.abs(Math.sin(TAU * 0.7 * T));
      b.ry -= 12 * hp;
      b.sy *= 1 + 0.06 * hp - 0.08 * (1 - hp);
      b.sx *= 1 - 0.04 * hp + 0.05 * (1 - hp);
      b.arm = 150 + 14 * Math.sin(TAU * 1.4 * T);
      b.wag = 2.6;
      b.eyes = b.mouth = "excited";
    } else if ((T + S.seed) % 3.3 < 0.12) b.eyes = "asleep";
    if (S.turn) {
      u = (T - S.turn.t0) / S.turn.d;
      if (u >= 0 && u <= 1) {
        var sn = Math.sin(Math.PI * u);
        b.ry -= 4 * sn;
        b.sy *= 1 - 0.05 * Math.sin((Math.PI * Math.min(u, 0.4)) / 0.4);
      }
    }
    if (S.fire) {
      u = T - S.fire.t0;
      var big = S.fire.k > 1;
      if (u >= 0) {
        if (!big) {
          // a quick shot: it gathers (leans in a little), fires at 0.14 s and kicks back
          var wind = seg(u, 0, 0.14) * (1 - seg(u, 0.14, 0.2)),
            kick = u >= 0.14 ? Math.exp(-8 * (u - 0.14)) : 0;
          b.rx += 5 * kick - 2 * wind;
          b.rr += 6 * kick - 4 * wind;
          b.sy *= 1 - 0.06 * wind + 0.04 * kick;
          b.arm = Math.max(b.arm, 70 * kick, 30 * wind);
          b.flap += 20 * kick;
          if (u > 0.04 && u < 0.5) b.eyes = b.mouth = "excited";
        } else {
          // the laser: arms up and lean back while it powers up, hold and shake while the beam runs, then a big kick
          var up = seg(u, 0, 0.3),
            hold = u >= 0.3 && u < 0.9 ? 1 : 0,
            rel = u >= 0.9 ? Math.exp(-6 * (u - 0.9)) : 0,
            fade = 1 - seg(u, 1.0, 1.3);
          b.rx += (4 * up + 0.9 * hold * Math.sin(55 * u)) * (u < 0.9 ? 1 : 0) + 10 * rel;
          b.rr += (-5 * up + 0.8 * hold * Math.sin(47 * u)) * (u < 0.9 ? 1 : 0) + 8 * rel;
          b.sy *= 1 - 0.07 * up * fade + 0.05 * rel;
          b.arm = Math.max(b.arm, (100 * up * (u < 0.9 ? 1 : fade)) + 40 * rel);
          b.flap += 30 * (up + rel);
          if (u > 0.05 && u < 1.2) b.eyes = b.mouth = "excited";
        }
      }
    }
    if (S.hit) {
      h = T - S.hit.t0;
      if (h >= 0 && h < 1.4) {
        var k = S.hit.k,
          dec = Math.exp(-5 * h),
          sq = Math.exp(-6.5 * h) * Math.cos(27 * h);
        b.rx += 10 * k * dec; // pushed away from the monster (the drawing faces left, the battle mirrors it)
        b.rr += 9 * k * dec + 8 * k * Math.exp(-4.5 * h) * Math.sin(21 * h);
        b.sy *= 1 - 0.18 * k * sq;
        b.sx *= 1 + 0.12 * k * sq;
        b.arm = Math.max(b.arm, 60 * dec);
        b.flap += 40 * dec;
        if (h < 0.6) b.eyes = b.mouth = "surprised";
      }
    }
    return b;
  }

  /* a part's pose: x / y / r (degrees) / sx / sy / o (opacity), from the pet's motion c (now) and q (a moment ago) */
  function partPose(m, T, C, d) {
    var c = C[0],
      q = C[m.l] || C[1],
      th = c.v * THMAX,
      sin = Math.sin(th),
      cos = Math.cos(th),
      x = 0,
      y = 0,
      r = 0,
      sx = 1,
      sy = 1,
      o = 1,
      dy;
    switch (m.k) {
      case "root":
        x = c.rx; y = c.ry; r = c.rr; sx = c.rsx; sy = c.rsy;
        break;
      case "shadow":
        y = -c.ry; r = -c.rr; sx = sy = 1 - 0.3 * cl01(-c.ry / 24);
        break;
      case "body": // everything but the head: it breathes (scaled from the feet) and narrows when the pet turns
        sx = c.sx * (1 - 0.14 * c.v); sy = c.sy;
        x = -1.5 * c.v;
        break;
      case "head": // sits on the body: goes up and down with the breathing, tilts, and follows the body's motion a little later
        dy = (c.sy - 1) * (d.neck[1] - 170);
        y = dy; r = c.hr + 0.6 * (q.rr - c.rr);
        x = c.hdx - 1.5 * c.v;
        break;
      case "arm":
        r = -m.s * (c.arm + 2.5 * Math.sin(2.1 * T + (m.s > 0 ? 1.1 : 0))) + 1.2 * (q.rr - c.rr);
        x = -m.z * sin;
        sx = 1 - 0.1 * c.v;
        break;
      case "foot":
        y = -2 * c.p * Math.max(0, Math.sin(6.5 * T + (m.s > 0 ? Math.PI : 0)));
        x = -m.z * sin;
        break;
      case "tail":
        r = m.s * (6 * c.wag * Math.sin(4.1 * T) + 0) + 2.2 * (q.rr - c.rr) + 0.6 * (q.rx - c.rx);
        x = -m.z * sin;
        break;
      case "ear": // follow the head, a moment late and with a bit more swing; squeezed toward the middle when the pet turns
        r = m.g * (2.2 * (q.rr - c.rr) + 0.7 * (q.rx - c.rx)) + m.s * (1.2 * Math.sin(1.7 * T + m.l) + 0.2 * c.flap);
        sx = cos;
        x = (m.o[0] - 60) * (cos - 1) + 1.5 * c.v;
        sy = 1 + 0.8 * (q.sy - c.sy);
        break;
      case "face": // the face is a flat plate that slides across the head and narrows as the head turns
        x = -d.z0 * sin; sx = cos;
        break;
      case "belly": // the pale belly slides toward the front of the body (the body is narrower, so it shows the dark back behind it)
        x = -m.z * sin; sx = cos;
        break;
      case "eye": // the near eye (on the right of the drawing) looks bigger, the far one smaller
        sx = m.s > 0 ? 1 + 0.06 * c.v : 1 - 0.34 * c.v;
        sy = m.s > 0 ? 1 + 0.1 * c.v : 1 - 0.12 * c.v;
        break;
      case "hat":
        x = -2.5 * c.v; r = -2 * c.v + 0.5 * (q.rr - c.rr);
        sx = 1 - 0.05 * c.v;
        break;
      case "neck":
        x = -m.z * sin * 0.5; sx = 1 - 0.1 * c.v;
        break;
    }
    return { x: x, y: y, r: r, sx: sx, sy: sy, o: o };
  }

  /* ---------------------------------------------------------------- building the rig out of the pet's own drawing */
  var DOC = null; // the document the pet is drawn into
  function el(tag, attrs) {
    var e = DOC.createElementNS(NS, tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    return e;
  }
  function kids(node) {
    var a = [];
    for (var i = 0; i < node.childNodes.length; i++) a.push(node.childNodes[i]);
    return a;
  }
  function find(svg, name) {
    return svg.querySelector('[data-rg="' + name + '"]');
  }
  function makeSvg(type, mood, eq, gaze, style) {
    root.__petGaze = gaze || 0;
    var s = root.petSvg(type, mood, eq || {}, "full", style || "width:100%;height:auto;overflow:visible");
    root.__petGaze = 0;
    return s;
  }

  function mount(host, type, eq, opts) {
    if (!host || !root.petSvg || !D[type]) return null;
    opts = opts || {};
    var d = dat(type),
      gaze = opts.gaze == null ? -1 : opts.gaze,
      flip = opts.flip !== false,
      doc = host.ownerDocument || document;
    DOC = doc;
    host.innerHTML = makeSvg(type, "happy", eq, gaze);
    var svg = host.firstChild;
    if (!svg || !svg.querySelector) return null;
    svg.setAttribute("class", "sw-rig");
    // the other faces: the same pet drawn again in each mood, and only the eyes, cheeks and mouth are taken from it (with the gradients they use)
    var defsHold = el("defs", {}),
      i,
      j;
    svg.insertBefore(defsHold, svg.firstChild);
    var tmp = doc.createElement("div"),
      lv = {};
    for (i = 0; i < LEAF.length; i++) lv[LEAF[i]] = { happy: find(svg, LEAF[i]) };
    for (j = 0; j < MOODS.length; j++) {
      tmp.innerHTML = makeSvg(type, MOODS[j], eq, gaze);
      var vs = tmp.firstChild,
        ds = vs.querySelectorAll("defs");
      for (i = 0; i < ds.length; i++) defsHold.appendChild(ds[i].cloneNode(true));
      for (i = 0; i < LEAF.length; i++) {
        var src = find(vs, LEAF[i]);
        if (src && lv[LEAF[i]].happy) lv[LEAF[i]][MOODS[j]] = src;
      }
    }
    var vars = {};
    for (i = 0; i < LEAF.length; i++) {
      var nm = LEAF[i],
        base = lv[nm].happy;
      if (!base) continue;
      vars[nm] = {};
      var order = ["happy"].concat(MOODS);
      var holders = {};
      for (j = 0; j < order.length; j++) {
        var mood = order[j],
          srcEl = lv[nm][mood];
        if (!srcEl) continue;
        var g = el("g", mood === "happy" ? { "data-v": mood } : { "data-v": mood, display: "none" });
        var cs = kids(srcEl);
        for (var q = 0; q < cs.length; q++) g.appendChild(mood === "happy" ? cs[q] : cs[q].cloneNode(true));
        holders[mood] = g;
      }
      for (j = 0; j < order.length; j++) if (holders[order[j]]) {
        base.appendChild(holders[order[j]]);
        vars[nm][order[j]] = holders[order[j]];
      }
    }
    // the structure: root > shadow, body (everything but the head), head
    var torso = svg.querySelector(".torso"),
      headg = svg.querySelector(".headg");
    if (!torso || !headg) return null;
    var rootg = el("g", {}),
      bodyg = el("g", {}),
      shadow = el("ellipse", { cx: 60, cy: 177, rx: 40, ry: 6, fill: "#2B1B52", opacity: ".12" });
    var move = [];
    for (var n = svg.firstChild; n; n = n.nextSibling) if (n !== defsHold) move.push(n);
    for (i = 0; i < move.length; i++) {
      if (move[i] === headg) break;
      bodyg.appendChild(move[i]);
    }
    rootg.appendChild(shadow);
    rootg.appendChild(bodyg);
    rootg.appendChild(headg);
    svg.appendChild(rootg);
    // the parts: kind of motion, which side, how late it follows, where it turns from, how far in front of the middle it stands (z)
    var spec = [
      ["root", rootg, "root", 0, 1, 1, [60, 177], 0],
      ["shadow", shadow, "shadow", 0, 1, 1, [60, 177], 0],
      ["body", bodyg, "body", 0, 1, 1, [60, 177], 0],
      ["head", headg, "head", 0, 1, 1, d.neck, 0],
      ["armL", find(svg, "armL"), "arm", -1, 2, 1, d.shL || [34, 112], 15],
      ["armR", find(svg, "armR"), "arm", 1, 2, 1, d.shR || [86, 112], 15],
      ["sleeveL", find(svg, "sleeveL"), "arm", -1, 2, 1, d.shL || [34, 112], 15],
      ["sleeveR", find(svg, "sleeveR"), "arm", 1, 2, 1, d.shR || [86, 112], 15],
      ["footL", find(svg, "footL"), "foot", -1, 1, 1, d.ftL || [42, 168], 22],
      ["footR", find(svg, "footR"), "foot", 1, 1, 1, d.ftR || [78, 168], 22],
      ["tail", find(svg, "tail"), "tail", 1, 2, 1, d.tail || [90, 150], -30],
      ["earL", find(svg, "earL"), "ear", -1, 3, 1, d.earL || [40, 40], 0],
      ["earR", find(svg, "earR"), "ear", 1, 3, 1, d.earR || [80, 40], 0],
      ["crest", find(svg, "crest"), "ear", 0, 3, 0.8, d.crest || [60, 20], 0],
      ["belly", find(svg, "belly"), "belly", 0, 1, 1, [60, 140], 16],
      ["bw", find(svg, "bw"), "belly", 0, 1, 1, [60, 133], 12],
      ["bs", find(svg, "bs"), "belly", 0, 1, 1, [60, 133], 12],
      ["pw", find(svg, "pw"), "face", 0, 1, 1, [60, d.ey], 0],
      ["ps", find(svg, "ps"), "face", 0, 1, 1, [60, d.ey], 0],
      ["face", find(svg, "face"), "face", 0, 1, 1, [60, d.ey], 0],
      ["iface", find(svg, "iface"), "face", 0, 1, 1, [60, d.ey], 0],
      ["eyeL", find(svg, "eyeL"), "eye", -1, 1, 1, [60 - d.edx, d.ey], 0],
      ["eyeR", find(svg, "eyeR"), "eye", 1, 1, 1, [60 + d.edx, d.ey], 0],
      ["patchL", find(svg, "patchL"), "eye", -1, 1, 1, [60 - d.edx, d.ey], 0],
      ["patchR", find(svg, "patchR"), "eye", 1, 1, 1, [60 + d.edx, d.ey], 0],
      ["ihat", find(svg, "ihat"), "hat", 0, 2, 1, d.hat, 0],
      ["ineck", find(svg, "ineck"), "neck", 0, 1, 1, [60, d.neck[1]], 14],
    ];
    var nodes = [],
      byName = {};
    for (i = 0; i < spec.length; i++) {
      var sp = spec[i];
      if (!sp[1]) continue;
      var nd = { n: sp[0], el: sp[1], tf: null, mo: { k: sp[2], s: sp[3], l: sp[4], g: sp[5], o: sp[6], z: sp[7] }, o: sp[6] };
      nodes.push(nd);
      byName[sp[0]] = nd;
    }
    var S = { mode: opts.mode === "cheer" ? "cheer" : "idle", lean: opts.lean || 0, seed: (type.length * 0.7 + 0.3) % 3.3, v: opts.view === "side" ? 1 : 0, turn: null, fire: null, hit: null, chg: { a: 0, b: 0, t0: 0, d: 0, e: 1 }, cbs: [] };
    var t0 = Date.now(),
      manual = opts.manual ? 0 : null,
      dead = false,
      cur = { eyeL: "happy", eyeR: "happy", blush: "happy", mouth: "happy" },
      behind = false;
    function now() {
      return manual === null ? (Date.now() - t0) / 1000 : manual;
    }
    function setVar(name, mood) {
      var vv = vars[name];
      if (!vv || cur[name] === mood) return;
      if (!vv[mood]) mood = "happy";
      if (cur[name] === mood) return;
      for (var k in vv) if (vv.hasOwnProperty(k)) {
        if (k === mood) vv[k].removeAttribute("display");
        else vv[k].setAttribute("display", "none");
      }
      cur[name] = mood;
    }
    // when the pet is turned far enough, the arm on the far side goes behind the body
    function farArm(on) {
      if (on === behind) return;
      behind = on;
      var names = ["armL", "sleeveL"];
      for (var a = 0; a < names.length; a++) {
        var nd = byName[names[a]];
        if (!nd) continue;
        if (on) torso.parentNode.insertBefore(nd.el, torso);
        else if (nd.home) nd.home.parent.insertBefore(nd.el, nd.home.next);
      }
    }
    for (i = 0; i < nodes.length; i++) if (nodes[i].n === "armL" || nodes[i].n === "sleeveL") nodes[i].home = { parent: nodes[i].el.parentNode, next: nodes[i].el.nextSibling };
    function render(T) {
      var tn = S.turn;
      if (tn && T >= tn.t0 + tn.d) {
        S.v = tn.to;
        S.turn = null;
      }
      var C = [],
        k;
      for (k = 0; k < LAGS.length; k++) C.push(core(S, T - LAGS[k]));
      var b = C[0];
      farArm(b.v > 0.5);
      for (k = 0; k < nodes.length; k++) {
        var nd = nodes[k],
          nm = nd.n,
          m = nd.mo,
          p;
        if (nm === "sleeveL" || nm === "sleeveR") p = partPose(byName[nm === "sleeveL" ? "armL" : "armR"].mo, T, C, d);
        else if (nm === "patchL" || nm === "patchR") p = partPose(byName[nm === "patchL" ? "eyeL" : "eyeR"].mo, T, C, d);
        else p = partPose(m, T, C, d);
        var tf = tform(nd.o, p);
        if (tf !== nd.tf) {
          nd.tf = tf;
          if (tf) nd.el.setAttribute("transform", tf);
          else nd.el.removeAttribute("transform");
        }
      }
      setVar("eyeL", b.eyes);
      setVar("eyeR", b.eyes);
      setVar("blush", b.mouth);
      setVar("mouth", b.mouth);
      for (k = S.cbs.length - 1; k >= 0; k--)
        if (S.cbs[k].at <= T) {
          var f = S.cbs.splice(k, 1)[0].fn;
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
      var dd = host.ownerDocument;
      if (dd && dd.documentElement && !dd.documentElement.contains(host)) {
        dead = true;
        return;
      }
      if (manual === null) render(now());
      rq(loop);
    }
    var ctl = {
      type: type,
      host: host,
      svg: svg,
      state: S,
      nodes: nodes,
      byName: byName,
      view: function () {
        return S.turn ? S.turn.to : S.v;
      },
      play: function (name, cb, k) {
        var T = now(),
          dur = 0;
        if (name === "fire") {
          S.fire = { t0: T, k: k || 1 };
          dur = k > 1 ? 1.3 : 0.5;
        } else if (name === "hit") {
          S.hit = { t0: T, k: k || 1 };
          dur = 0.7;
        } else if (name === "cheer") S.mode = "cheer";
        else if (name === "idle") {
          S.mode = "idle";
          S.fire = S.hit = null;
        }
        if (cb) S.cbs.push({ at: T + dur, fn: cb });
      },
      turn: function (toSide, cb) {
        var T = now(),
          to = toSide ? 1 : 0,
          from = viewAt(S, T);
        S.turn = { t0: T, d: toSide ? 0.32 : 0.28, from: from, to: to };
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
      // where its shot leaves (the mouth when it is side on), as fractions of the picture; the picture is mirrored in the battle
      muzzle: function () {
        var th = THMAX,
          x = 60 - d.z0 * Math.sin(th) - (d.beak || 0) * 0.7,
          vb = svg.getAttribute("viewBox").split(" "),
          vx = parseFloat(vb[0]),
          vy = parseFloat(vb[1]),
          vw = parseFloat(vb[2]),
          vh = parseFloat(vb[3]);
        if (flip) x = 120 - x;
        return { x: (x - vx) / vw, y: (d.mouth[1] - vy) / vh };
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

  root.PetRig = { mount: mount, data: D };
  if (typeof module !== "undefined" && module.exports) module.exports = root.PetRig;
})(typeof window !== "undefined" ? window : this);
