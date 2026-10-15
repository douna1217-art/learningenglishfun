/* Little sound effects for the pet page: every sound is made from simple tones in the browser (Web Audio), so there are no
   sound files to download and nothing to license. Quiet by design (soft master volume and a limiter), only used on the pet page,
   and the child (or a teacher) can turn it off with the speaker button; the choice is remembered on this device.
   Browsers without Web Audio simply stay silent. Written for old Android WebViews (no optional chaining, no spread). */
(function () {
  var KEY = 'lef_sfx_v1', ctx = null, master = null, on = true, lastVoice = 0, listeners = [];
  try { on = localStorage.getItem(KEY) !== 'off'; } catch (e) {}
  window.__sfxOff = !on;                       // the page's older beeps (stars, munching) read this too

  function Ctor() { return window.AudioContext || window.webkitAudioContext || null; }
  function chain(c) {                          // soft master volume, then a limiter so nothing can ever be loud
    var g = c.createGain(); g.gain.value = .5;
    var lim = c.createDynamicsCompressor();
    try { lim.threshold.value = -14; lim.knee.value = 12; lim.ratio.value = 12; lim.attack.value = .003; lim.release.value = .2; } catch (e) {}
    g.connect(lim); lim.connect(c.destination);
    return g;
  }
  function getCtx() {
    if (ctx) return ctx;
    var C = Ctor(); if (!C) return null;
    try { ctx = new C(); master = chain(ctx); } catch (e) { ctx = null; }
    return ctx;
  }
  function unlock() {                          // browsers only allow sound after a tap or click
    var c = getCtx();
    if (c && c.state === 'suspended' && c.resume) { try { c.resume(); } catch (e) {} }
  }
  ['click', 'touchend', 'keydown'].forEach(function (ev) { document.addEventListener(ev, unlock, true); });

  /* one tone: pitch glide, optional vibrato, low-pass / band-pass colour, soft attack and a fade out */
  function tone(c, dest, o) {
    var t = o.t, dur = o.dur, vol = (o.vol || .3) * (o.k || 1), osc = c.createOscillator(), g = c.createGain(), node = osc;
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
    if (o.vib) { var l = c.createOscillator(), lg = c.createGain(); l.frequency.value = o.vib[0]; lg.gain.value = o.vib[1]; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + .05); }
    if (o.lp) { var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; node.connect(f); node = f; }
    if (o.bp) { var b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = o.bp[0]; b.Q.value = o.bp[1]; node.connect(b); node = b; }
    node.connect(g);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + (o.a || .01)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    g.connect(dest); osc.start(t); osc.stop(t + dur + .05);
  }

  /* ---------- the sounds: (context, destination, start time, volume factor) ---------- */
  var S = {
    poke: function (c, d, t, k) { tone(c, d, { t: t, f: 320, f2: 640, dur: .12, type: 'sine', vol: .5, k: k }); tone(c, d, { t: t + .1, f: 640, f2: 380, dur: .15, type: 'sine', vol: .4, k: k }); },
    boing: function (c, d, t, k) { tone(c, d, { t: t, f: 200, f2: 760, dur: .22, type: 'triangle', vol: .45, vib: [18, 30], k: k }); tone(c, d, { t: t + .2, f: 760, f2: 300, dur: .2, type: 'triangle', vol: .3, k: k }); },
    cheer: function (c, d, t, k) { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(c, d, { t: t + i * .08, f: f, dur: .24, type: 'triangle', vol: .34, k: k }); }); },
    big: function (c, d, t, k) { [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach(function (f, i) { tone(c, d, { t: t + i * .075, f: f, dur: .3, type: 'triangle', vol: .32, k: k }); }); },
    sparkle: function (c, d, t, k) { [1318.5, 1568, 1976, 2349, 1760, 2637].forEach(function (f, i) { tone(c, d, { t: t + i * .07, f: f, dur: .4, type: 'sine', vol: .17, k: k }); }); },
    pop: function (c, d, t, k) { tone(c, d, { t: t, f: 500, f2: 950, dur: .09, type: 'sine', vol: .4, k: k }); tone(c, d, { t: t + .09, f: 1568, dur: .3, type: 'sine', vol: .18, k: k }); tone(c, d, { t: t + .15, f: 2093, dur: .3, type: 'sine', vol: .14, k: k }); },
    yawn: function (c, d, t, k) { tone(c, d, { t: t, f: 420, f2: 240, dur: .55, type: 'triangle', vol: .3, vib: [5, 10], lp: 900, a: .08, k: k }); tone(c, d, { t: t + .6, f: 260, f2: 330, dur: .25, type: 'triangle', vol: .2, lp: 900, k: k }); },
    sleep: function (c, d, t, k) { [659.25, 523.25, 392].forEach(function (f, i) { tone(c, d, { t: t + i * .35, f: f, dur: .9, type: 'sine', vol: .2, k: k }); }); },
    /* a balloon bursting, kept gentle for children: a soft little pop with a whisper of air and two tiny chimes (no sharp crack, no low thump) */
    bang: function (c, d, t, k) {
      var len = Math.floor(c.sampleRate * 0.1), buf = c.createBuffer(1, len, c.sampleRate), data = buf.getChannelData(0), i;
      for (i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
      var src = c.createBufferSource(), g = c.createGain(), lp = c.createBiquadFilter();
      src.buffer = buf; lp.type = 'lowpass'; lp.frequency.value = 1700; g.gain.value = 0.14 * (k || 1);
      src.connect(lp); lp.connect(g); g.connect(d); src.start(t);
      tone(c, d, { t: t, f: 380, f2: 820, dur: .12, type: 'sine', vol: .36, k: k });
      tone(c, d, { t: t + .07, f: 1318.5, dur: .3, type: 'sine', vol: .15, k: k });
      tone(c, d, { t: t + .13, f: 1760, dur: .32, type: 'sine', vol: .11, k: k });
    },
    /* the Monster battle: a cannonball leaving (pew), a soft thud when it lands, and a laser beam sweeping down (all gentle, cartoon-style) */
    pew: function (c, d, t, k) { tone(c, d, { t: t, f: 1100, f2: 380, dur: .14, type: 'triangle', vol: .3, k: k }); },
    thud: function (c, d, t, k) { tone(c, d, { t: t, f: 210, f2: 70, dur: .2, type: 'sine', vol: .5, lp: 500, k: k }); tone(c, d, { t: t + .02, f: 880, f2: 520, dur: .1, type: 'sine', vol: .14, k: k }); },
    zap: function (c, d, t, k) { tone(c, d, { t: t, f: 2200, f2: 260, dur: .5, type: 'sawtooth', vol: .2, lp: 2600, a: .02, k: k }); tone(c, d, { t: t + .05, f: 1100, f2: 130, dur: .5, type: 'sine', vol: .25, k: k }); tone(c, d, { t: t + .35, f: 1568, dur: .3, type: 'sine', vol: .14, k: k }); },
    rumble: function (c, d, t, k) { tone(c, d, { t: t, f: 90, f2: 55, dur: .75, type: 'sawtooth', vol: .3, lp: 220, vib: [11, 9], a: .05, k: k }); },
    /* each pet's own little voice (cartoon-style, not recordings) */
    v_cat: function (c, d, t, k) { tone(c, d, { t: t, f: 520, f2: 900, dur: .26, type: 'sawtooth', vol: .46, bp: [1100, 2.2], a: .04, k: k }); tone(c, d, { t: t + .25, f: 900, f2: 560, dur: .3, type: 'sawtooth', vol: .46, bp: [1100, 2.2], a: .02, k: k }); },
    v_dog: function (c, d, t, k) { [0, .2].forEach(function (o) { tone(c, d, { t: t + o, f: 260, f2: 170, dur: .14, type: 'square', vol: .22, lp: 900, a: .005, k: k }); }); },
    v_monkey: function (c, d, t, k) { tone(c, d, { t: t, f: 640, f2: 820, dur: .17, type: 'triangle', vol: .3, vib: [9, 25], k: k }); tone(c, d, { t: t + .2, f: 900, f2: 560, dur: .24, type: 'triangle', vol: .3, vib: [9, 25], k: k }); },
    v_bunny: function (c, d, t, k) { [0, .12].forEach(function (o) { tone(c, d, { t: t + o, f: 1300, f2: 1750, dur: .08, type: 'sine', vol: .26, k: k }); }); },
    v_dino: function (c, d, t, k) { tone(c, d, { t: t, f: 230, f2: 120, dur: .55, type: 'sawtooth', vol: .3, lp: 700, vib: [18, 12], a: .06, k: k }); },
    v_duck: function (c, d, t, k) { [0, .17].forEach(function (o) { tone(c, d, { t: t + o, f: 430, f2: 310, dur: .1, type: 'square', vol: .44, bp: [1300, 3], a: .005, k: k }); }); },
    v_penguin: function (c, d, t, k) { [0, .18].forEach(function (o) { tone(c, d, { t: t + o, f: 760, f2: 560, dur: .15, type: 'sawtooth', vol: .42, bp: [1500, 2], a: .01, k: k }); }); },
    v_panda: function (c, d, t, k) { tone(c, d, { t: t, f: 300, f2: 360, dur: .32, type: 'triangle', vol: .6, vib: [6, 8], k: k }); }
  };

  function notify() { listeners.forEach(function (fn) { try { fn(on); } catch (e) {} }); }
  window.PetSound = {
    supported: function () { return !!Ctor(); },
    on: function () { return on; },
    set: function (v) {
      on = !!v; window.__sfxOff = !on;
      try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
      notify();
      if (on) { unlock(); this.play('sparkle'); }
    },
    onChange: function (fn) { listeners.push(fn); },
    play: function (name, k) {
      if (!on || !S[name]) return;
      var c = getCtx(); if (!c) return;
      if (c.state === 'suspended' && c.resume) { try { c.resume(); } catch (e) {} }
      try { S[name](c, master, c.currentTime + .02, k || 1); } catch (e) {}
    },
    voice: function (pet) {                    // a pet's own sound, at most once every 2.5 seconds
      var now = Date.now(); if (now - lastVoice < 2500) return; lastVoice = now;
      this.play('v_' + pet);
    },
    names: Object.keys(S),
    // for the sound check page: the same tones rendered into an offline buffer
    _render: function (c, name, t) { var d = chain(c); S[name](c, d, t || 0, 1); }
  };
})();
