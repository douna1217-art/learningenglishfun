/* The pets as living rigs (sample). pet-art.js draws every pet with invisible part markers (<g data-rg="armL"> and so on), so this file can take the very same
   drawing the pet has everywhere else (its clothes, hat, glasses and scarf included) and move its parts on their own: the body breathes, the head bobs, the ears,
   tail and arms swing a little later than the body, the eyes blink, the face changes (any of the ten faces), and the pet turns from the front to a three-quarter
   side view (to either side) by sliding the face across the head, narrowing the body and moving the arms, feet and tail to where they would be on a pet turned to
   its side. It walks, sleeps, eats, stretches, looks around, hops, twirls, fires (a recoil), gets bumped and cheers.

   Used in three places: the sight-words Monster battle (PetRig.mount), the adoption page (PetRig.mount, one small rig per card) and the pet's home scene
   (PetRig.mountGroup: the pet is a <g> inside the scene's picture).

   PetRig.mount(host, type, eq, opts)        draws the pet into host (an element; the picture is an <svg> made here)
   PetRig.mountGroup(g, type, eq, opts)      draws the pet into g (an SVG group of a bigger picture)
   Both return a controller, or null if the pet cannot be drawn:
      setFace(name)               the face it wears (happy, excited, surprised, asleep, sleepy, bored, yawn, hungry, eat, love)
      setAct(name, opts)          what it is doing: idle, walk (opts.dir: 1 = to the right, -1 = to the left), bored, sleep, wake, eat, cheer (opts.small), twirl
      setFlags({hungry, rumble})  a little droop, a shaking tummy
      look(v)                     face the side: v from -1 (to the right) to 1 (to the left), 0 = straight ahead
      hover(on)                   excited, hopping and waving (the adoption page, when it is pointed at)
      play("fire" | "hit" | "cheer" | "idle" | "hello", callback, strength)   (fire strength 2 = the long laser)
      turn(true | false, callback)    swing round to the side (toward the monster) or back to the front
      charge(seconds) / calm()        get tense and ready as the monster charges / relax
      muzzle()                        where its shot starts, as fractions of the picture's width and height
      at(T)                           draw the picture for time T (and use T as the clock from now on; the tests use it)
      stop()
   opts: gaze (-1 looks to the left of the drawing), lean (degrees), flip (true: the picture is drawn mirrored, as in the battle, so muzzle() is mirrored too),
         face (the face it starts with), faces (other faces to prepare now), defer (ms: prepare them a little later), noShadow, still (draw once, no clock),
         hello ({first, every}: a little hop now and then), fps, manual
   The drawing faces left; the battle mirrors it with CSS so the pet faces the monster on its right.
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";

  var NS = "http://www.w3.org/2000/svg",
    TAU = Math.PI * 2,
    LAGS = [0, 0.08, 0.16, 0.26],
    THMAX = 0.5, // radians the pet turns when it is fully side on (about 29 degrees)
    LEAF = ["eyeL", "eyeR", "blush", "mouth"], // parts that change with the face
    OPEN = { happy: 1, excited: 1, surprised: 1, hungry: 1, love: 1, okay: 1 }, // faces with open eyes: these blink
    DROOP = { sleepy: 1, asleep: 1, bored: 1, yawn: 1, hungry: 1 }; // faces where a bunny's ears flop

  // where things are in each pet (drawing units): z0 = how far the face stands in front of the head's middle, ey = eyes' height, edx = eyes' spacing,
  // mouth, neck = where the head sits, tail / ears / crest = where they hang from, sh = shoulders, ft = feet, droop = ears that flop when it is sleepy
  var D = {
    cat: { z0: 40, ey: 62, edx: 19, mouth: [60, 83], neck: [60, 100], tail: [88, 150], earL: [36, 44], earR: [84, 44], hat: [60, 40] },
    dog: { z0: 37, ey: 58, edx: 20, mouth: [60, 88], neck: [60, 104], tail: [90, 150], earL: [26, 42], earR: [94, 42], hat: [60, 34] },
    monkey: { z0: 39, ey: 62, edx: 17, mouth: [60, 87], neck: [60, 102], tail: [88, 156], earL: [26, 64], earR: [94, 64], hat: [60, 32] },
    bunny: { z0: 37, ey: 68, edx: 19, mouth: [60, 84], neck: [60, 106], tail: [90, 150], earL: [40, 58], earR: [80, 58], hat: [60, 44], droop: 97 },
    dino: { z0: 40, ey: 56, edx: 21, mouth: [60, 82], neck: [60, 104], tail: [88, 136], earL: [43, 36], earR: [77, 36], crest: [60, 32], hat: [60, 38] },
    duck: { z0: 36, ey: 54, edx: 21, mouth: [60, 78], neck: [60, 100], tail: [90, 138], shL: [30, 110], shR: [90, 110], ftL: [35, 168], ftR: [85, 168], crest: [58, 16], hat: [60, 24], beak: 12 },
    penguin: { z0: 37, ey: 60, edx: 22, mouth: [60, 85], neck: [60, 62], shL: [26, 102], shR: [94, 102], ftL: [38, 168], ftR: [82, 168], crest: [60, 12], hat: [60, 14], beak: 10, whole: true },
    panda: { z0: 37, ey: 62, edx: 16, mouth: [60, 85], neck: [60, 102], tail: [94, 150], earL: [28, 38], earR: [92, 38], hat: [60, 34] },
  };
  function dat(type) {
    return D[type] || D.cat;
  }
  // how far a pet's arms (the penguin's wings) swing out with each face: the drawing has them for its own face, so the rig only adds the difference
  function moodArm(type, f) {
    if (type === "penguin") return { happy: 46, love: 40, surprised: 50, excited: 64, eat: 14 }[f] || 22;
    var u = { happy: -8, love: -8, surprised: -10, excited: -16 }[f] || 0;
    return type === "duck" ? u * 1.25 : u;
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
  // a hop: how high it is (negative = up) and how squashed or stretched, for u from 0 (crouch) through the jump (0.18 - 0.8) to the landing
  function hop(u, h) {
    var y = 0,
      sy = 0;
    if (u >= 0 && u <= 1) {
      if (u < 0.18) sy = -0.1 * Math.sin((Math.PI * u) / 0.18);
      else if (u < 0.8) {
        var k = (u - 0.18) / 0.62;
        y = -h * Math.sin(Math.PI * k);
        sy = 0.05 * Math.sin(Math.PI * k);
      } else sy = -0.08 * Math.sin((Math.PI * (u - 0.8)) / 0.2);
    }
    return { y: y, sy: sy };
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
    var u = cl01((T - t.t0) / t.d);
    return t.from + (t.to - t.from) * ease(u) + (t.os && t.to > t.from ? t.os * Math.sin(Math.PI * u) : 0);
  }
  function droopAt(S, T) {
    return S.dprev + (S.dnow - S.dprev) * ease((T - S.dT) / 0.35);
  }
  var KEYS = ["rx", "ry", "rr", "hr", "hx", "hy", "arm", "swing", "step", "sy", "sx", "v", "wag", "flap"];
  // what each thing the pet is doing adds to its pose (u = seconds since it started)
  function actDelta(S, act, u, T) {
    var a = { rx: 0, ry: 0, rr: 0, hr: 0, hx: 0, hy: 0, arm: 0, swing: 0, step: 0, sy: 0, sx: 0, v: 0, wag: 0, flap: 0 },
      s,
      k;
    if (act === "walk") {
      s = Math.sin((TAU * T) / 0.5); // a waddle: it rocks from side to side, bobs, swings its arms and lifts its feet one after the other
      a.rr = 4 * s; a.ry = -3 * Math.abs(s); a.hr = -3 * s; a.swing = 22 * s; a.step = s; a.wag = 0.6;
      a.v = -0.42 * (S.dir || 0);
    } else if (act === "bored") {
      a.v = 0.55 * Math.sin(0.8 * T); a.hr = 3 * Math.sin(0.8 * T + 1); a.sy = -0.03; a.arm = -4;
    } else if (act === "sleep") {
      k = ease(u);
      a.hr = 9 * k; a.hx = 4 * k; a.hy = 4 * k; a.ry = 2 * k; a.sy = 0.03 * Math.sin((TAU * T) / 3.6); a.arm = -6 * k; a.wag = -0.8;
    } else if (act === "wake") {
      s = Math.sin(Math.PI * cl01(u / 1.3));
      a.sy = 0.08 * s; a.arm = 100 * s; a.hr = -7 * s; a.hy = -3 * s;
    } else if (act === "eat") {
      s = Math.sin(TAU * 2.5 * T);
      a.hy = 2.2 * s; a.hr = 3 * Math.sin(TAU * 2.5 * T + 1); a.rr = 1.2 * s;
    } else if (act === "cheer") {
      var per = 0.62,
        n = S.small ? 1 : 3;
      if (u >= 0 && u < n * per) {
        var ph = (u % per) / per,
          hp = hop(ph, S.small ? 16 : 26);
        a.ry = hp.y; a.sy = hp.sy; a.arm = (S.small ? 50 : 120) * Math.sin(Math.PI * ph); a.wag = 1.5; a.flap = 30;
      }
    } else if (act === "twirl") {
      k = cl01(u / 1.9);
      a.ry = -12 * Math.sin(Math.PI * k); a.v = Math.sin(TAU * 2 * k); a.arm = 70 * Math.sin(Math.PI * k); a.wag = 1.5;
    }
    return a;
  }
  function blendAct(S, T) {
    var cur = actDelta(S, S.act, T - S.at0, T),
      w = ease((T - S.at0) / 0.25);
    if (S.prev && w < 1) {
      var pv = actDelta(S.prev, S.prev.act, T - S.prev.at0, T);
      for (var i = 0; i < KEYS.length; i++) cur[KEYS[i]] = pv[KEYS[i]] * (1 - w) + cur[KEYS[i]] * w;
    }
    return cur;
  }
  function core(S, T) {
    var p = chargeAt(S, T),
      br = Math.sin((2.3 + 2 * p) * T),
      ad = blendAct(S, T),
      b = {
        rx: 0, ry: 0, rr: S.lean + 0.9 * Math.sin(1.1 * T + S.seed), rsx: 1, rsy: 1, // the whole pet
        sx: 1 - 0.01 * br, sy: 1 + (0.022 + 0.015 * p) * br - 0.04 * p, // body: breathing, a little crouch when tense
        hr: 1.4 * Math.sin(1.3 * T + 0.6), hx: 0, hy: 0, // head: tilt and where it sits
        arm: 3 * Math.sin(2.1 * T) + 5 * p, swing: 0, step: 0, reach: 1, flap: 0, // arms raised (degrees); the ears' extra fling
        wag: 1 + 0.8 * p, v: viewAt(S, T), p: p, droop: S.droopOn ? droopAt(S, T) : 0,
        eyes: S.face, mouth: S.face,
      },
      u,
      h,
      i;
    for (i = 0; i < KEYS.length; i++) {
      var k = KEYS[i];
      if (k === "sy" || k === "sx") b[k] += ad[k];
      else b[k] += ad[k];
    }
    if (S.hungry) b.sy -= 0.015;
    if (S.rumble) b.rx += 0.9 * Math.sin(110 * T);
    if (S.mode === "cheer") {
      var hp = Math.abs(Math.sin(TAU * 0.7 * T));
      b.ry -= 12 * hp;
      b.sy *= 1 + 0.06 * hp - 0.08 * (1 - hp);
      b.sx *= 1 - 0.04 * hp + 0.05 * (1 - hp);
      b.arm = 150 + 14 * Math.sin(TAU * 1.4 * T);
      b.wag = 2.6;
      b.eyes = b.mouth = "excited";
    } else if (S.mode === "hover") {
      // pointed at: it hops on the spot and waves, looking pleased
      var hh = hop((T * 1.8) % 1, 9);
      b.ry += hh.y; b.sy += hh.sy; b.arm = 45 + 25 * Math.sin(TAU * 2.2 * T); b.wag = 2.4; b.rr += 4 * Math.sin(TAU * 1.8 * T); b.flap += 15;
      b.eyes = b.mouth = "excited";
    } else if (OPEN[S.face] && (T + S.seed) % 3.3 < 0.12) b.eyes = "asleep";
    var hl = S.hello && T >= S.hello.first ? hop(((T - S.hello.first) % S.hello.every) / 0.8, 16) : null, // the little hello hop of the adoption page
      ho = S.hop ? hop((T - S.hop.t0) / 0.8, 16) : null;
    if (!hl || hl.y === 0 && hl.sy === 0) hl = ho; // (a hop that was asked for wins over the repeating one when it is the only one going)
    if (hl) {
      b.ry += hl.y; b.sy += hl.sy;
      if (hl.y !== 0) b.arm = Math.max(b.arm, 45);
    }
    if (S.turn && S.turn.fx) {
      u = (T - S.turn.t0) / S.turn.d;
      if (u >= 0 && u <= 1) {
        b.ry -= 4 * Math.sin(Math.PI * u);
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
          b.arm = Math.max(b.arm, 100 * up * (u < 0.9 ? 1 : fade) + 40 * rel);
          b.flap += 30 * (up + rel);
          if (u > 0.05 && u < 1.2) b.eyes = b.mouth = "excited";
        }
      }
    }
    if (S.hit) {
      h = T - S.hit.t0;
      if (h >= 0 && h < 1.4) {
        var kk = S.hit.k,
          dec = Math.exp(-5 * h),
          sq = Math.exp(-6.5 * h) * Math.cos(27 * h);
        b.rx += 10 * kk * dec; // pushed away from the monster (the drawing faces left, the battle mirrors it)
        b.rr += 9 * kk * dec + 8 * kk * Math.exp(-4.5 * h) * Math.sin(21 * h);
        b.sy *= 1 - 0.18 * kk * sq;
        b.sx *= 1 + 0.12 * kk * sq;
        b.arm = Math.max(b.arm, 60 * dec);
        b.flap += 40 * dec;
        if (h < 0.6) b.eyes = b.mouth = "surprised";
      }
    }
    b.arm += moodArm(S.type, b.mouth) - moodArm(S.type, S.base); // the arms follow the face (an excited pet holds them higher)
    return b;
  }

  /* a part's pose: x / y / r (degrees) / sx / sy / o (opacity), from the pet's motion c (now) and q (a moment ago); v < 0 = turned to the other side */
  function partPose(m, T, C, d) {
    var c = C[0],
      q = C[m.l] || C[1],
      th = c.v * THMAX,
      sin = Math.sin(th),
      cos = Math.cos(th),
      av = Math.abs(c.v),
      x = 0,
      y = 0,
      r = 0,
      sx = 1,
      sy = 1,
      o = 1;
    switch (m.k) {
      case "root":
        x = c.rx; y = c.ry; r = c.rr; sx = c.rsx; sy = c.rsy;
        break;
      case "shadow":
        y = -c.ry; r = -c.rr; sx = sy = 1 - 0.3 * cl01(-c.ry / 24);
        break;
      case "body": // everything but the head: it breathes (scaled from the feet) and narrows when the pet turns
        sx = c.sx * (1 - 0.14 * av); sy = c.sy;
        x = -1.5 * c.v;
        break;
      case "head": // sits on the body: goes up and down with the breathing, tilts, and follows the body's motion a little later
        y = (c.sy - 1) * (d.neck[1] - 170) + c.hy;
        r = c.hr + 0.6 * (q.rr - c.rr);
        x = c.hx - 1.5 * c.v;
        break;
      case "arm":
        r = -m.s * (c.arm + 2.5 * Math.sin(2.1 * T + (m.s > 0 ? 1.1 : 0))) + m.s * c.swing + 1.2 * (q.rr - c.rr);
        x = -m.z * sin;
        sx = 1 - 0.1 * av;
        break;
      case "foot":
        y = -2 * c.p * Math.max(0, Math.sin(6.5 * T + (m.s > 0 ? Math.PI : 0))) - 5 * Math.max(0, -m.s * c.step);
        x = -m.z * sin;
        break;
      case "tail": // it hangs from the body, so it only swings from its root; turned, it is stretched outward from there (it never slides off the body)
        r = m.s * 6 * c.wag * Math.sin(4.1 * T) + 2.2 * (q.rr - c.rr) + 0.6 * (q.rx - c.rx);
        x = -m.z * sin;
        sx = 1 + 0.25 * c.v;
        break;
      case "ear": // follow the head, a moment late and with a bit more swing; squeezed toward the middle when the pet turns
        r = m.g * (2.2 * (q.rr - c.rr) + 0.7 * (q.rx - c.rx)) + m.s * (1.2 * Math.sin(1.7 * T + m.l) + 0.2 * c.flap) + (d.droop ? m.s * d.droop * c.droop : 0);
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
      case "eye": // the near eye looks bigger, the far one smaller
        if (m.s * c.v > 0) {
          sx = 1 + 0.06 * av; sy = 1 + 0.1 * av;
        } else {
          sx = 1 - 0.34 * av; sy = 1 - 0.12 * av;
        }
        break;
      case "hat":
        x = -2.5 * c.v; r = -2 * c.v + 0.5 * (q.rr - c.rr);
        sx = 1 - 0.05 * av;
        break;
      case "neck":
        x = -m.z * sin * 0.5; sx = 1 - 0.1 * av;
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
  function find(c, name) {
    return c.querySelector('[data-rg="' + name + '"]');
  }
  function renamed(c, cls) {
    // the page's own pet animations (CSS on .torso, .headg and .blink) must not fight the rig, so those classes are taken off
    var list = c.querySelectorAll("." + cls);
    for (var i = 0; i < list.length; i++) list[i].setAttribute("class", "rg-" + cls);
  }

  function make(target, type, eq, opts) {
    if (!root.petSvg || !D[type]) return null;
    opts = opts || {};
    var group = !!target.group,
      host = group ? target.group : target.host,
      d = dat(type),
      gaze = opts.gaze == null ? -1 : opts.gaze,
      flip = opts.flip !== false,
      doc = host.ownerDocument || document,
      base = opts.face || "happy";
    DOC = doc;
    function markup(mood) {
      root.__petGaze = gaze;
      var s = group ? root.petGroup(type, mood, eq || {}) : root.petSvg(type, mood, eq || {}, "full", "width:100%;height:auto;overflow:visible");
      root.__petGaze = 0;
      return s;
    }
    var tmp = doc.createElement("div");
    function parse(mood) {
      tmp.innerHTML = group ? '<svg xmlns="' + NS + '">' + markup(mood) + "</svg>" : markup(mood);
      return tmp.firstChild;
    }
    var box, svg, i, j;
    if (group) {
      var first = parse(base);
      while (host.firstChild) host.removeChild(host.firstChild);
      while (first.firstChild) host.appendChild(first.firstChild);
      box = host;
      svg = host.ownerSVGElement;
    } else {
      host.innerHTML = markup(base);
      svg = box = host.firstChild;
      if (!svg || !svg.querySelector) return null;
      svg.setAttribute("class", "sw-rig");
    }
    var defsHold = el("defs", {});
    box.insertBefore(defsHold, box.firstChild);
    // the faces: the base face is the pet as drawn; any other face is the same pet drawn again in that mood, and only the eyes, cheeks and mouth are taken from it
    // (with the gradients they use)
    var vars = {},
      built = {};
    for (i = 0; i < LEAF.length; i++) {
      var leaf = find(box, LEAF[i]);
      if (!leaf) continue;
      var g0 = el("g", { "data-v": base });
      var cs = kids(leaf);
      for (j = 0; j < cs.length; j++) g0.appendChild(cs[j]);
      leaf.appendChild(g0);
      vars[LEAF[i]] = {};
      vars[LEAF[i]][base] = g0;
    }
    built[base] = true;
    function addFace(mood) {
      if (built[mood]) return;
      built[mood] = true;
      var vs = parse(mood),
        ds = vs.querySelectorAll("defs");
      for (var a = 0; a < ds.length; a++) defsHold.appendChild(ds[a].cloneNode(true));
      for (var b2 = 0; b2 < LEAF.length; b2++) {
        var nm = LEAF[b2],
          src = find(vs, nm);
        if (!src || !vars[nm]) continue;
        var g = el("g", { "data-v": mood, display: "none" }),
          ch = kids(src);
        for (var q = 0; q < ch.length; q++) g.appendChild(ch[q].cloneNode(true));
        find(box, nm).appendChild(g);
        vars[nm][mood] = g;
      }
    }
    var prep = opts.faces || [];
    function prepare() {
      for (var a = 0; a < prep.length; a++) addFace(prep[a]);
    }
    if (opts.defer > 0) setTimeout(prepare, opts.defer);
    else prepare();
    // the structure: root > shadow, body (everything but the head), head
    var torso = box.querySelector(".torso"),
      headg = box.querySelector(".headg");
    if (!torso || !headg) return null;
    renamed(box, "torso");
    renamed(box, "headg");
    renamed(box, "blink");
    var rootg = el("g", {}),
      bodyg = el("g", {}),
      shadow = opts.noShadow ? null : el("ellipse", { cx: 60, cy: 177, rx: 40, ry: 6, fill: "#2B1B52", opacity: ".12" }),
      move = [];
    for (var n = box.firstChild; n; n = n.nextSibling) if (n !== defsHold) move.push(n);
    for (i = 0; i < move.length; i++) {
      if (move[i] === headg) break;
      bodyg.appendChild(move[i]);
    }
    if (shadow) rootg.appendChild(shadow);
    rootg.appendChild(bodyg);
    rootg.appendChild(headg);
    box.appendChild(rootg);
    // the parts: kind of motion, which side, how late it follows, where it turns from, how far in front of the middle it stands (z)
    var spec = [
      ["root", rootg, "root", 0, 1, 1, [60, 177], 0],
      ["shadow", shadow, "shadow", 0, 1, 1, [60, 177], 0],
      ["body", bodyg, "body", 0, 1, 1, [60, 177], 0],
      ["head", headg, "head", 0, 1, 1, d.neck, 0],
      ["armL", find(box, "armL"), "arm", -1, 2, 1, d.shL || [34, 112], 15],
      ["armR", find(box, "armR"), "arm", 1, 2, 1, d.shR || [86, 112], 15],
      ["sleeveL", find(box, "sleeveL"), "arm", -1, 2, 1, d.shL || [34, 112], 15],
      ["sleeveR", find(box, "sleeveR"), "arm", 1, 2, 1, d.shR || [86, 112], 15],
      ["footL", find(box, "footL"), "foot", -1, 1, 1, d.ftL || [42, 168], 22],
      ["footR", find(box, "footR"), "foot", 1, 1, 1, d.ftR || [78, 168], 22],
      ["spikes", find(box, "spikes"), "none", 0, 1, 1, [60, 120], 0], // the ridge on a dino's back is part of the back: it stays where the body is
      ["tail", find(box, "tail"), "tail", 1, 2, 1, d.tail || [90, 150], -3],
      ["earL", find(box, "earL"), "ear", -1, 3, 1, d.earL || [40, 40], 0],
      ["earR", find(box, "earR"), "ear", 1, 3, 1, d.earR || [80, 40], 0],
      ["crest", find(box, "crest"), "ear", 0, 3, 0.8, d.crest || [60, 20], 0],
      ["belly", find(box, "belly"), "belly", 0, 1, 1, [60, 140], 16],
      ["bw", find(box, "bw"), "belly", 0, 1, 1, [60, 133], 12],
      ["bs", find(box, "bs"), "belly", 0, 1, 1, [60, 133], 12],
      ["pw", find(box, "pw"), "face", 0, 1, 1, [60, d.ey], 0],
      ["ps", find(box, "ps"), "face", 0, 1, 1, [60, d.ey], 0],
      ["face", find(box, "face"), "face", 0, 1, 1, [60, d.ey], 0],
      ["iface", find(box, "iface"), "face", 0, 1, 1, [60, d.ey], 0],
      ["eyeL", find(box, "eyeL"), "eye", -1, 1, 1, [60 - d.edx, d.ey], 0],
      ["eyeR", find(box, "eyeR"), "eye", 1, 1, 1, [60 + d.edx, d.ey], 0],
      ["patchL", find(box, "patchL"), "eye", -1, 1, 1, [60 - d.edx, d.ey], 0],
      ["patchR", find(box, "patchR"), "eye", 1, 1, 1, [60 + d.edx, d.ey], 0],
      ["ihat", find(box, "ihat"), "hat", 0, 2, 1, d.hat, 0],
      ["ineck", find(box, "ineck"), "neck", 0, 1, 1, [60, d.neck[1]], 14],
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
    var S = {
      type: type, base: base, face: base, mode: opts.mode === "cheer" ? "cheer" : "idle", lean: opts.lean || 0, seed: (type.length * 0.7 + 0.3) % 3.3,
      v: opts.view === "side" ? 1 : 0, turn: null, fire: null, hit: null, hop: null, hello: opts.hello || null, chg: { a: 0, b: 0, t0: 0, d: 0, e: 1 },
      act: "idle", at0: -10, prev: null, dir: 0, small: false, hungry: false, rumble: false,
      droopOn: !!d.droop, dprev: 0, dnow: d.droop && DROOP[base] ? 1 : 0, dT: -10, cbs: [],
    };
    S.dprev = S.dnow;
    var t0 = Date.now(),
      manual = opts.manual || opts.still ? 0 : null,
      dead = false,
      lastDraw = -1,
      cur = {},
      farSide = 0;
    var arms = { "-1": ["armL", "sleeveL"], "1": ["armR", "sleeveR"] };
    function now() {
      return manual === null ? (Date.now() - t0) / 1000 : manual;
    }
    function setVar(name, mood) {
      var vv = vars[name];
      if (!vv) return;
      if (!vv[mood]) {
        addFace(mood);
        if (!vv[mood]) mood = base;
      }
      if (cur[name] === mood) return;
      for (var k in vv) if (vv.hasOwnProperty(k)) {
        if (k === mood) vv[k].removeAttribute("display");
        else vv[k].setAttribute("display", "none");
      }
      cur[name] = mood;
    }
    // when the pet is turned far enough, the arm on the far side goes behind the body (the far side is the one opposite to where it looks)
    function farArm(side) {
      if (side === farSide) return;
      var a, nd, list;
      if (farSide) {
        list = arms[String(farSide)];
        for (a = 0; a < list.length; a++) {
          nd = byName[list[a]];
          if (nd && nd.home) nd.home.parent.insertBefore(nd.el, nd.home.next);
        }
      }
      farSide = side;
      if (side) {
        list = arms[String(side)];
        for (a = 0; a < list.length; a++) {
          nd = byName[list[a]];
          if (nd) torso.parentNode.insertBefore(nd.el, torso);
        }
      }
    }
    var names = ["armL", "sleeveL", "armR", "sleeveR"];
    for (i = 0; i < names.length; i++) {
      var hn = byName[names[i]];
      if (hn) hn.home = { parent: hn.el.parentNode, next: hn.el.nextSibling };
    }
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
      farArm(Math.abs(b.v) > 0.5 ? (b.v > 0 ? -1 : 1) : 0);
      for (k = 0; k < nodes.length; k++) {
        var nd = nodes[k],
          nm = nd.n,
          p;
        if (nm === "sleeveL" || nm === "sleeveR") p = partPose(byName[nm === "sleeveL" ? "armL" : "armR"].mo, T, C, d);
        else if (nm === "patchL" || nm === "patchR") p = partPose(byName[nm === "patchL" ? "eyeL" : "eyeR"].mo, T, C, d);
        else p = partPose(nd.mo, T, C, d);
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
    var watch = group ? svg : host,
      gap = opts.fps ? 1 / opts.fps - 0.004 : 0;
    function loop() {
      if (dead) return;
      var dd = host.ownerDocument;
      if (dd && dd.documentElement && !dd.documentElement.contains(host)) {
        dead = true;
        return;
      }
      if (manual === null) {
        var T = now();
        // not drawn while it cannot be seen (page hidden, or a screen that is switched off), and at a lower rate when asked to
        var seen = !dd.hidden && (!watch || !watch.getClientRects || watch.getClientRects().length > 0);
        if (seen && T - lastDraw >= gap) {
          lastDraw = T;
          render(T);
        }
      }
      rq(loop);
    }
    function sched(secs, cb) {
      if (cb) S.cbs.push({ at: now() + secs, fn: cb });
    }
    function setLook(v, dur, os, fx) {
      var T = now();
      S.turn = { t0: T, d: dur, from: viewAt(S, T), to: v, os: os || 0, fx: !!fx };
      return T;
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
      setFace: function (name) {
        if (!name || name === S.face) return;
        var T = now();
        S.face = name;
        if (S.droopOn) {
          S.dprev = droopAt(S, T);
          S.dnow = DROOP[name] ? 1 : 0;
          S.dT = T;
        }
        if (manual === 0 && opts.still) render(0);
      },
      setAct: function (name, o) {
        o = o || {};
        var T = now();
        if (name === S.act && !o.restart && (o.dir || 0) === S.dir && !!o.small === S.small) return;
        S.prev = { act: S.act, at0: S.at0, small: S.small, dir: S.dir };
        S.act = name;
        S.at0 = T;
        S.dir = o.dir || 0;
        S.small = !!o.small;
      },
      setFlags: function (f) {
        S.hungry = !!f.hungry;
        S.rumble = !!f.rumble;
      },
      look: function (v) {
        var cur2 = S.turn ? S.turn.to : S.v;
        if (Math.abs(v - cur2) < 0.06) return;
        setLook(v, 0.2, 0, false);
      },
      hover: function (on) {
        S.mode = on ? "hover" : "idle";
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
        } else if (name === "hello") {
          S.hop = { t0: T };
          dur = 0.8;
        } else if (name === "cheer") S.mode = "cheer";
        else if (name === "idle") {
          S.mode = "idle";
          S.fire = S.hit = S.hop = null;
        }
        if (cb) S.cbs.push({ at: T + dur, fn: cb });
      },
      turn: function (toSide, cb) {
        var T = setLook(toSide ? 1 : 0, toSide ? 0.32 : 0.28, toSide ? 0.1 : 0, true);
        sched(S.turn.d, cb);
        return T;
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
        var vb = svg && svg.getAttribute && svg.getAttribute("viewBox") ? svg.getAttribute("viewBox").split(" ") : ["-12", "-24", "144", "214"],
          x = 60 - d.z0 * Math.sin(THMAX) - (d.beak || 0) * 0.7,
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
    if (!opts.manual && !opts.still) rq(loop);
    return ctl;
  }
  function mount(host, type, eq, opts) {
    return host ? make({ host: host }, type, eq, opts) : null;
  }
  function mountGroup(g, type, eq, opts) {
    return g && root.petGroup ? make({ group: g }, type, eq, opts) : null;
  }

  root.PetRig = { mount: mount, mountGroup: mountGroup, data: D };
  if (typeof module !== "undefined" && module.exports) module.exports = root.PetRig;
})(typeof window !== "undefined" ? window : this);
