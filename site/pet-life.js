/* The daily life of the pet on the pet page: it walks around its home, gets bored when nobody is there, falls asleep,
   and jumps for joy when the child comes back. Faces are never chosen by the child; the pet picks them (see face()).
   Needs pet-art.js (PETS, HOMES, FOOD, ITEMS, petGroup). Reads the page's pet state object but never saves it.
   Everything is private to this function; the page talks to it through window.PetLife.
   Old Android WebViews: no optional chaining; SVG pieces are built through a <div> parse instead of SVG innerHTML;
   pivot-based motion is only switched on in browsers that support transform-box (see the CSS in index.html). */
(function () {
  var RM = false;
  try { RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var T = { bored: 30, sleep: 90, away: 25 };          // seconds nobody has touched the page; seconds away that deserve a welcome
  var S = null, host = null, active = false;
  var tickT = null, wT = null, wkT = null, bT = null;
  var L = fresh();
  var lastStop = 0, lastStars = null, hidAt = 0, pageAway = null, pageAwayAt = 0;

  function fresh() { return { act: 'idle', px: 0, idle: 0, busy: false, yawn: false, drowsy: false, cf: null, fc: null, small: false, rumble: false, hc: 0, eating: null, bought: null, timers: [] }; }
  function $(id) { return document.getElementById(id); }
  function sfx(name, k) { if (window.PetSound) PetSound.play(name, k); }       // sound effects are optional: no PetSound, no sound
  function voice() { if (window.PetSound && S && S.type) PetSound.voice(S.type); }
  function later(fn, ms) {
    var id = setTimeout(function () { var k = L.timers.indexOf(id); if (k >= 0) L.timers.splice(k, 1); if (active) fn(); }, ms);
    L.timers.push(id); return id;
  }
  function clearLater() { L.timers.forEach(clearTimeout); L.timers = []; }
  function svgSet(el, markup, append) {          // works where SVG innerHTML does not
    var d = document.createElement('div');
    d.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + markup + '</svg>';
    var src = d.firstChild;
    if (!append) while (el.firstChild) el.removeChild(el.firstChild);
    while (src.firstChild) el.appendChild(src.firstChild);
  }

  /* ---------- what face the pet makes (ten faces, never picked by the child) ---------- */
  function face() {
    if (L.eating) return 'eat';
    if (L.fc) return L.fc;                                  // short reaction, e.g. surprised when poked
    if (L.act === 'sleep') return 'asleep';
    if (L.yawn) return 'yawn';
    if (L.act === 'bored') return L.drowsy ? 'sleepy' : 'bored';
    if (L.act === 'wake') return 'sleepy';
    if (L.act === 'cheer') return L.cf || 'excited';
    if (L.act === 'twirl') return 'love';
    if (S.hunger < 50) return 'hungry';
    return 'happy';
  }

  /* ---------- the picture ---------- */
  var HEART = '<path d="M0 6C-9 -2 -5 -10 0 -5C5 -10 9 -2 0 6Z" fill="#FF6F9C" stroke="#D2456F" stroke-width="1" stroke-linejoin="round"/>';
  var SPARK = '<path d="M0 -7l2 4.6 5 .5-3.8 3.3 1.2 4.9L0 4.5-4.4 7.3l1.2-4.9L-7 -1.9l5-.5z" fill="#FFC93C" stroke="#B26A00" stroke-width="1" stroke-linejoin="round"/>';
  var PILLOW = '<g transform="rotate(14 104 102)"><rect x="82" y="88" width="48" height="32" rx="14" fill="#FFE29A" stroke="#C99A2E" stroke-width="3"/><path d="M92 97Q106 92 121 97" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/></g>';
  var BLANKET = '<path d="M12 146Q22 136 34 142Q47 134 60 142Q73 134 86 142Q98 136 108 146L110 170Q60 184 10 170Z" fill="#B7A6FF" stroke="#6A56C8" stroke-width="3.5" stroke-linejoin="round"/><g fill="#fff" opacity=".85"><circle cx="30" cy="156" r="3"/><circle cx="52" cy="164" r="3"/><circle cx="74" cy="156" r="3"/><circle cx="94" cy="164" r="3"/><circle cx="40" cy="170" r="2.2"/><circle cx="84" cy="172" r="2.2"/></g>';

  /* two sizes of the same picture: the normal one, and a wide one (used when the picture is big, i.e. on a desktop) that
     crops the empty sky, draws the pet a little smaller and lets it walk much farther */
  var WIDE = false;
  function geo() {
    var s = WIDE ? .8 : 1.05;
    return { s: s, k: s / 1.05, tx: 185 - 60 * s, ty: 281 - 178 * s, vb: WIDE ? '0 85 360 215' : '0 0 360 300', range: WIDE ? 110 : 56, bub: WIDE ? 118 : 62, top: WIDE ? 90 : 6, wrap: WIDE ? 40 : 27 };
  }
  function measure() { var r = host && host.getBoundingClientRect ? host.getBoundingClientRect() : null; return !!r && r.width >= 720; }
  function placed() { return (S.home && S.home[S.type]) || []; }
  function sceneSVG() {
    var H = HOMES[S.type], on = placed(), s = '<defs>' + H.defs + '</defs>' + H.base();
    var view = { y0: WIDE ? 85 : 0 }, fest = [];
    if (typeof FEST !== 'undefined' && S.home && S.home.fest) S.home.fest.forEach(function (id) { var d = FEST.deco(id); if (d) fest.push(d); });
    H.decos.forEach(function (d) { if (on.indexOf(d.id) >= 0 && !d.front) s += '<g' + (L.bought === d.id ? ' class="pop"' : '') + '>' + softSvg(d.svg()) + '</g>'; });
    fest.forEach(function (d) { if (!d.front) s += '<g' + (L.bought === d.id ? ' class="pop"' : '') + '>' + softSvg(d.svg(view)) + '</g>'; });
    s += '<g id="psPos" transform="translate(' + L.px + ' 0)" style="transform:translate(' + L.px + 'px,0px)">';
    var g = geo();
    s += '<ellipse cx="185" cy="281" rx="' + Math.round(54 * g.k) + '" ry="8" fill="#1E2A4A" opacity=".14"/>';
    s += '<g transform="translate(' + g.tx.toFixed(1) + ',' + g.ty.toFixed(1) + ') scale(' + g.s + ')"><g class="slp">' + PILLOW + '</g><g id="psG"><g class="waddle"><g class="pbob" id="psIn">' + petGroup(S.type, face(), S.eq) + '</g></g></g><g class="slp">' + BLANKET + '</g></g>';
    s += '<g transform="translate(185,' + (g.ty + 50 * g.s).toFixed(1) + ') scale(' + g.k.toFixed(3) + ') translate(-185,-145.5)"><g fill="#6A48E8" font-family="Fredoka,Nunito,sans-serif" font-weight="700" class="zzg"><text class="zz" x="248" y="112" font-size="22">z</text><text class="zz" style="animation-delay:.9s" x="260" y="98" font-size="16">z</text><text class="zz" style="animation-delay:1.7s" x="270" y="86" font-size="12">z</text></g></g>';
    s += '</g>';
    H.decos.forEach(function (d) { if (on.indexOf(d.id) >= 0 && d.front) s += '<g' + (L.bought === d.id ? ' class="pop"' : '') + '>' + softSvg(d.svg()) + '</g>'; });
    fest.forEach(function (d) { if (d.front) s += '<g' + (L.bought === d.id ? ' class="pop"' : '') + '>' + softSvg(d.svg(view)) + '</g>'; });
    var pos = [[86, 238], [226, 238]];
    (S.toys || []).slice(0, 2).forEach(function (id, i) { var it = ITEMS[id]; if (it && it.toy) s += '<g class="toyg" data-toy="' + id + '" transform="translate(' + pos[i][0] + ',' + pos[i][1] + ') scale(.8)" style="cursor:pointer"><g>' + softSvg(it.toy) + '</g></g>'; });
    if (L.eating) s += '<g transform="translate(' + (WIDE ? '216,236) scale(.9' : '222,224) scale(1.05') + ')"><g class="pop">' + softSvg(FOOD[L.eating]) + '</g></g>';
    s += '<rect class="night" x="0" y="0" width="360" height="300" fill="#1B2350"/><g id="psFx" style="pointer-events:none"></g>';
    return s;
  }
  function sceneClass() { return 'a-' + L.act + (L.act === 'cheer' && L.small ? ' small' : '') + (S.hunger < 50 ? ' hungry' : '') + (L.rumble ? ' rumble' : '') + (L.act === 'sleep' ? ' sleeping' : ''); }
  function applyClasses() { var sc = $('petScene'); if (sc) sc.setAttribute('class', sceneClass()); }
  function render() {
    if (!active || !S || !S.type || !HOMES[S.type]) return;
    host.innerHTML = '<svg id="petScene" viewBox="' + geo().vb + '" role="img" aria-label="' + (S.name || 'Your pet').replace(/[<>"&]/g, '') + ' at home">' + sceneSVG() + '</svg>';
    applyClasses();
    Array.prototype.forEach.call(host.querySelectorAll('.toyg'), function (g) { g.onclick = function () { react('toy'); }; });
    var p = $('psPos'); if (p) p.onclick = function () { react('poke'); };
  }
  function refreshPet() { var e = $('psIn'); if (e) svgSet(e, petGroup(S.type, face(), S.eq)); applyClasses(); }

  /* ---------- moving, bubbles, little effects ---------- */
  function setPx(x, dur) {
    var e = $('psPos'); L.px = x; if (!e) return;
    e.style.transition = (dur > 0 && !RM) ? 'transform ' + dur + 's linear' : 'none';
    e.style.transform = 'translate(' + x + 'px,0px)';
    e.setAttribute('transform', 'translate(' + x + ' 0)');
  }
  function walkTo(x, done) {
    var d = Math.abs(x - L.px);
    if (d < 4 || RM) { setPx(x, 0); if (done) done(); return; }
    var dur = d / 26; L.act = 'walk'; applyClasses(); setPx(x, dur);
    clearTimeout(wkT);
    wkT = setTimeout(function () { if (!active) return; if (L.act === 'walk') L.act = 'idle'; applyClasses(); if (done) done(); }, dur * 1000 + 80);
  }
  function wander() {
    clearTimeout(wT);
    wT = setTimeout(function () {
      if (!active) return;
      if (!document.hidden && !RM && L.act === 'idle' && !L.busy && !L.eating) { var x, n = 0; do { var R = geo().range; x = Math.round(-R + Math.random() * 2 * R); } while (Math.abs(x - L.px) < R / 2 && n++ < 6); walkTo(x); }
      wander();
    }, 3500 + Math.random() * 3500);
  }
  function addFx(html, ms) {
    var fx = $('psFx'); if (!fx) return; var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svgSet(g, html); fx.appendChild(g);
    setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, ms);
  }
  function burst(kind, n) {
    var cx = 185 + L.px, s = '';
    for (var i = 0; i < n; i++) { var g = geo(), x = cx - 46 * g.k + Math.random() * 92 * g.k, y = g.ty + 3 * g.s + Math.random() * 58 * g.k;
      s += '<g transform="translate(' + Math.round(x) + ',' + Math.round(y) + ')"><g class="fl" style="animation-delay:' + (i * .1).toFixed(2) + 's">' + (kind === 'star' ? SPARK : HEART) + '</g></g>'; }
    addFx(s, 2300);
  }
  function rain(n) {
    var s = ''; for (var i = 0; i < n; i++) s += '<g transform="translate(' + Math.round(14 + Math.random() * 332) + ',' + Math.round(Math.random() * 40) + ')"><g class="fall" style="animation-delay:' + (Math.random() * .9).toFixed(2) + 's">' + SPARK + '</g></g>';
    addFx(s, 3200);
  }
  function mark() {
    var cx = 185 + L.px;
    var g = geo(); addFx('<g transform="translate(' + Math.round(cx + 44 * g.k) + ',' + Math.round(g.ty + 10 * g.s) + ')"><g class="fl"><text text-anchor="middle" font-size="28" font-weight="900" fill="#E8456A" stroke="#fff" stroke-width="3" paint-order="stroke" font-family="Fredoka,Nunito,Arial,sans-serif">!</text></g></g>', 1900);
  }
  function wrapText(msg, max) {
    var words = String(msg).split(/\s+/), lines = [], cur = '';
    words.forEach(function (w) { if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; });
    if (cur) lines.push(cur);
    return lines;
  }
  /* a comic speech bubble inside the picture, pointing at the pet; long text wraps onto up to three lines */
  function bubble(msg, ms) {
    var fx = $('psFx'); if (!fx) return; var old = $('psBub'); if (old && old.parentNode) old.parentNode.removeChild(old);
    var G = geo(), lines = wrapText(String(msg).replace(/[<>&]/g, ''), G.wrap).slice(0, 3), longest = 0;
    lines.forEach(function (t) { if (t.length > longest) longest = t.length; });
    var fs = WIDE ? 11.5 : 14, lh = Math.round(fs * 1.3), w = Math.round(Math.min(318, Math.max(58, longest * fs * .6 + 30))), h = lines.length * lh + 14, cx = 185 + L.px;
    var x = Math.round(Math.max(6, Math.min(354 - w, cx - w / 2))), y = Math.max(G.top, G.bub - h), tx = Math.round(Math.max(x + 18, Math.min(x + w - 18, cx)));
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('id', 'psBub'); g.setAttribute('class', 'bub');
    var txt = ''; lines.forEach(function (t, i) { txt += '<text x="' + (x + w / 2) + '" y="' + (y + 5 + fs + i * lh) + '" text-anchor="middle" font-size="' + fs + '" font-weight="800" fill="#1E2A4A" font-family="Nunito,Arial,sans-serif">' + t + '</text>'; });
    svgSet(g, '<path d="M' + (tx - 8) + ' ' + (y + h - 2) + 'L' + (tx + 2) + ' ' + (y + h + 14) + 'L' + (tx + 9) + ' ' + (y + h - 2) + 'Z" fill="#fff" stroke="#1E2A4A" stroke-width="2.5" stroke-linejoin="round"/><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="16" fill="#fff" stroke="#1E2A4A" stroke-width="2.5"/><path d="M' + (tx - 6) + ' ' + (y + h - 1) + 'L' + (tx + 7) + ' ' + (y + h - 1)+ '" stroke="#fff" stroke-width="4.5"/>' + txt);
    fx.appendChild(g);
    clearTimeout(bT); bT = setTimeout(function () { var e = $('psBub'); if (e && e.parentNode) e.parentNode.removeChild(e); }, ms || 2400);
  }

  /* ---------- what the pet does ---------- */
  function settle() { L.act = 'idle'; L.busy = false; L.idle = 0; L.yawn = false; L.cf = null; L.fc = null; L.drowsy = false; refreshPet(); }
  function cheer(msg, big, kind, fc) {
    clearLater(); L.busy = true; L.act = 'cheer'; L.small = !big; L.cf = fc || (big ? 'excited' : 'happy'); L.fc = null; refreshPet();
    burst(kind || 'heart', big ? 9 : 5); if (msg) bubble(msg, big ? 3000 : 1800); later(settle, big ? 2300 : 1100);
    if (big) { sfx('big'); voice(); }          // small reactions (poke, toy, decoration) have their own sounds
  }
  function twirl(msg) {
    clearLater(); L.busy = true; L.act = 'twirl'; refreshPet(); burst('star', 7); bubble(msg || 'I love it!', 2000); later(settle, 1900);
    setTimeout(function () { sfx('sparkle'); }, 280);
  }
  function wakeUp(why, msg, withStars) {
    clearLater(); L.busy = true; L.act = 'wake'; L.drowsy = false; L.fc = null; sfx('yawn');
    if (why === 'return') {
      L.yawn = true; refreshPet();
      later(function () { L.yawn = false; cheer(msg || "You're back! I missed you!", true, withStars ? 'star' : 'heart', 'excited'); if (withStars) rain(10); }, 1300);
    } else {
      L.yawn = false; L.fc = 'surprised'; refreshPet(); mark();
      later(function () { L.fc = null; L.yawn = true; refreshPet(); later(function () { L.yawn = false; cheer('Oh, hello!', false, 'heart', 'happy'); }, 800); }, 650);
    }
  }
  function goBored() { L.act = 'bored'; L.drowsy = false; refreshPet(); later(function () { bubble('...', 2600); }, 700); later(yawnLoop, 6500); }
  function yawnLoop() {
    if (L.act !== 'bored') return;
    L.yawn = true; refreshPet(); sfx('yawn', .5);
    later(function () { L.yawn = false; if (L.act === 'bored') { refreshPet(); later(yawnLoop, 6500); } }, 1300);
  }
  function goSleep() { clearLater(); L.act = 'sleep'; L.busy = false; L.yawn = false; L.drowsy = false; refreshPet(); sfx('sleep'); }
  function eat(key, done) {
    clearLater(); L.busy = true;
    walkTo(0, function () {
      L.eating = key; L.act = 'eat'; render();
      later(function () {
        L.eating = null; L.act = 'idle'; L.busy = false; L.idle = 0; L.fc = 'love'; render(); burst('heart', 4); bubble('Yum!', 1400);
        later(function () { L.fc = null; refreshPet(); }, 1200);
        if (done) done();
      }, 1800);
    });
  }
  function react(kind) {
    if (L.busy || L.act === 'sleep' || L.act === 'wake') return;
    if (kind === 'toy') { cheer('Wheee!', false, 'star', 'excited'); sfx('boing'); return; }
    var m = ['Hee hee!', 'That tickles!', 'Hello!', 'Hi hi!'];
    cheer(m[Math.floor(Math.random() * m.length)], false, 'heart', 'surprised'); mark(); sfx('poke'); voice();
    later(function () { if (L.act === 'cheer') { L.cf = 'love'; refreshPet(); } }, 500);
  }
  function welcome(away, gain) {
    var msg = gain > 0 ? 'Great reading! +' + gain + (gain === 1 ? ' star!' : ' stars!') : "You're back! I missed you!";
    if (away >= T.sleep) {                 // it had time to fall asleep: show it asleep, then wake it up
      L.act = 'sleep'; L.busy = true; L.px = 0; render();
      later(function () { wakeUp('return', msg, gain > 0); }, 1700);
    } else if (away >= T.away || gain > 0) {
      later(function () { cheer(gain > 0 ? msg : "You're back!", true, gain > 0 ? 'star' : 'heart', 'excited'); if (gain > 0) rain(10); }, 500);
    }
  }
  function touch() {
    if (!active) return;
    L.idle = 0;
    if (L.act === 'sleep') wakeUp('poke');
    else if (L.act === 'bored') { clearLater(); L.yawn = false; L.drowsy = false; L.act = 'idle'; refreshPet(); }
  }
  function onVis() {
    if (!active) return;
    if (document.hidden) { hidAt = Date.now(); return; }
    var away = (Date.now() - (hidAt || Date.now())) / 1000;
    if (away >= T.bored && !L.busy) { clearLater(); L.idle = 0; welcome(away, 0); }
  }
  /* the quiet clock: nobody has touched the page for a while */
  function tick() {
    if (!active || document.hidden || L.busy || L.act === 'sleep' || L.act === 'cheer' || L.act === 'twirl' || L.act === 'wake') return;
    L.idle += 1;
    if (L.act !== 'walk' && L.idle >= T.sleep) { goSleep(); return; }
    if (L.act === 'idle' && L.idle >= T.bored) { goBored(); return; }
    if (L.act === 'bored' && !L.drowsy && !L.yawn && L.idle >= (T.bored + T.sleep) / 2) { L.drowsy = true; refreshPet(); }
    if (S.hunger < 50 && (L.act === 'idle' || L.act === 'bored') && ++L.hc >= 9) {
      L.hc = 0; L.rumble = true; applyClasses(); bubble('My tummy is rumbling...', 2200); sfx('rumble');
      setTimeout(function () { L.rumble = false; applyClasses(); }, 1100);
    }
  }

  /* ---------- public ---------- */
  var rzT = null;
  function relayout() {
    if (!active) return; var nw = measure();
    if (nw !== WIDE) { WIDE = nw; var R = geo().range; L.px = Math.max(-R, Math.min(R, L.px)); render(); }
  }
  function onResize() { clearTimeout(rzT); rzT = setTimeout(relayout, 150); }
  function halt() {
    window.removeEventListener('resize', onResize); clearTimeout(rzT);
    clearInterval(tickT); clearTimeout(wT); clearTimeout(wkT); clearTimeout(bT); clearLater();
    document.removeEventListener('click', touch, true); document.removeEventListener('keydown', touch, true);
    document.removeEventListener('touchstart', touch, true); document.removeEventListener('visibilitychange', onVis);
  }
  function start(hostEl, st) {
    if (active) halt();
    host = hostEl; S = st; var prevStars = lastStars;
    if (!S || !S.type || !window.HOMES || !HOMES[S.type]) { active = false; return; }
    active = true; L = fresh(); WIDE = measure(); render(); wander(); window.addEventListener('resize', onResize);
    tickT = setInterval(tick, 1000);
    document.addEventListener('click', touch, true); document.addEventListener('keydown', touch, true);
    document.addEventListener('touchstart', touch, true); document.addEventListener('visibilitychange', onVis);
    var away = pageAway != null ? pageAway + (Date.now() - pageAwayAt) / 1000 : (lastStop ? (Date.now() - lastStop) / 1000 : 0); pageAway = null;   // away at page load + time on the page since
    var gain = (prevStars != null && S.stars > prevStars) ? S.stars - prevStars : 0;
    welcome(away, gain);
  }
  function stop() { if (!active) return; active = false; halt(); lastStop = Date.now(); lastStars = S ? S.stars : null; }

  window.PetLife = {
    start: start, stop: stop,
    render: function () { if (active) render(); },                // redraw everything (new pet, home, clothes, toys)
    refresh: function () { if (active) refreshPet(); },           // only the pet (face, outfit)
    eat: function (key, done) { if (active) eat(key, done); else if (done) done(); },
    twirl: function (msg) { if (active) twirl(msg); },
    cheer: function (msg, big, kind, fc) { if (active) cheer(msg, big, kind, fc); },
    decorated: function (id) { if (!active) return; L.bought = id; render(); cheer('So pretty!', false, 'star', 'excited'); setTimeout(function () { sfx('pop'); }, 120); },
    placed: function () { if (active) { L.bought = null; render(); } },
    setAway: function (sec) { pageAway = sec; pageAwayAt = Date.now(); },                  // seconds since the page was last used, read when the page loads
    say: function (msg) { if (active) setTimeout(function () { if (active) bubble(msg, 4800); }, 300); },       /* the page's messages appear as a speech bubble in the picture */
    relayout: relayout,
    faceNow: function () { return active && S ? face() : 'happy'; },
    isActive: function () { return active; }
  };
})();
