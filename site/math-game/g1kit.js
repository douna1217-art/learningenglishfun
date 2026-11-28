/* The shared frame of the Grade 1 practice games: the page (top bar, score, the stage, the panel below), sound, the pet's words,
   confetti and coins, number buttons (0..20) and a two-digit pad, levels (any opened level can be played again), the shop, the start,
   help and end screens, GameProgress, fitting the screen. A game gives its own look and its rounds:

     var K = G1Kit({
       id: "eggs", store: "eggFarm.v1", title: "🥚 Egg Farm", name: "Egg Farm", sub: "Tens &amp; Ones Practice 十位和个位",
       how: "<div>…</div>", score: ["Carts", "车"], goal: 6, need: 5, top: 5,
       colors: { bg: "#fff8e6", line: "#f0dcb0", accent: "#2f8a4a", stage: "linear-gradient(...)" },
       shop: [{ id: "hen", e: "🐔", p: 5 }, …], shopName: "Farm shop 农场商店", decor: function (owned) { … draw them … },
       round: function (K) { … set up one round; call K.done(true|false) when it is over … },
       resize: function () { … the room changed: draw again … }
     });
     K.L (the level), K.D (n, ok, miss, streak, bad, first: this level's rounds), K.S (saved: day, coins, deco, tut, sound),
     K.easy(), K.hard(), K.say(html), K.tone(freqs, len, type), K.burst(x, y), K.float(text), K.task(html),
     K.nums(max, onPick) / K.hideNums(), K.pad2(onEnter) / K.hidePad(), K.btns(html) / K.hideBtns(), K.later(f, ms), K.busy
     K.done(good, tries) – the round is over (coins, confetti, the next round after a pause)
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";
  var CSS = "*{box-sizing:border-box}html,body{margin:0}body{background:var(--bg);color:var(--ink);font-family:Nunito,ui-rounded,'Trebuchet MS',Arial,sans-serif;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}" +
    ".wrap{max-width:560px;margin:0 auto;padding:10px 12px 20px;position:relative}" +
    ".top{display:flex;align-items:center;gap:8px;justify-content:space-between}.top .ttl{font-family:Fredoka,sans-serif;font-size:1.25rem}" +
    ".tbtn{background:#fff;border:1px solid var(--line);border-radius:13px;padding:8px 12px;color:var(--ink);text-decoration:none;font:inherit;font-weight:900;cursor:pointer}" +
    ".hud{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}.hud div{background:#fff;border-radius:14px;text-align:center;padding:4px;box-shadow:0 3px 0 var(--line)}" +
    ".hud small{display:block;font-weight:800;color:var(--muted);font-size:.7rem}.hud b{font-family:Fredoka,sans-serif;font-size:1.35rem}" +
    ".stage{position:relative;height:max(380px,calc(100vh - 420px));border-radius:22px;overflow:hidden;background:var(--stage);touch-action:none}" +
    ".helper{position:absolute;left:8px;top:6px;display:flex;align-items:flex-start;gap:5px;z-index:8;max-width:70%;pointer-events:none}" +
    ".pet{width:44px;height:44px;flex:none;display:flex;align-items:center;justify-content:center;font-size:2rem}.pet.cheer{animation:kbob .5s 2}@keyframes kbob{50%{transform:translateY(-8px)}}" +
    ".bub{background:#fff;border-radius:12px;padding:4px 8px;font-weight:900;font-size:.76rem;line-height:1.2;box-shadow:0 3px 0 rgba(0,0,0,.08)}" +
    ".decor{position:absolute;font-size:1.5rem;line-height:1;pointer-events:none;z-index:1}" +
    ".task{background:#fff;border-radius:18px;padding:9px 12px;margin-top:8px;text-align:center;font-weight:900;font-size:1.1rem;box-shadow:0 3px 0 var(--line)}" +
    ".task .cn{display:block;font-size:.8rem;color:var(--muted);font-weight:800;margin-top:2px}.task b{font-family:Fredoka,sans-serif;font-size:1.3em;color:var(--accent)}" +
    ".eqbig{font-family:Fredoka,sans-serif;font-size:1.8rem;color:#2f9e5b}" +
    ".nums{display:none;grid-template-columns:repeat(7,1fr);gap:5px;margin-top:8px}" +
    ".nums button,.pad2 button{border:0;border-radius:12px;background:#fff;font-family:Fredoka,sans-serif;font-weight:700;font-size:1.4rem;padding:7px 0;box-shadow:0 4px 0 var(--line);cursor:pointer;color:var(--ink)}" +
    ".nums button.bad,.btns button.bad{background:#ffd6d0;animation:kshake .4s}" +
    ".pad2{display:none;margin-top:8px}.pad2 .show{display:flex;justify-content:center;gap:10px;margin-bottom:6px}" +
    ".pad2 .slot{width:64px;height:56px;border-radius:14px;background:#fff;box-shadow:0 3px 0 var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Fredoka,sans-serif;font-size:1.8rem;line-height:1}" +
    ".pad2 .slot small{font-family:Nunito,sans-serif;font-size:.6rem;font-weight:900;color:var(--muted)}.pad2 .slot.on{outline:4px solid #ffd84a}.pad2 .slot.bad{animation:kshake .4s;background:#ffd6d0}" +
    ".pad2 .keys{display:grid;grid-template-columns:repeat(6,1fr);gap:5px}.pad2 .ok{background:#f5b301;color:#3b2a00;box-shadow:0 4px 0 #b88a00;font-size:1.1rem}" +
    ".btns{display:none;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}" +
    ".btns button{border:0;border-radius:16px;background:#fff;font:inherit;font-weight:900;font-size:1.1rem;padding:11px 4px;box-shadow:0 5px 0 var(--line);cursor:pointer;color:var(--ink)}" +
    ".btns button.main{background:#f5b301;color:#3b2a00;box-shadow:0 5px 0 #b88a00}.btns button.big{font-family:Fredoka,sans-serif;font-size:1.8rem}" +
    "@keyframes kshake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}" +
    ".kfloat{position:absolute;font-family:Fredoka,sans-serif;font-weight:700;font-size:1.5rem;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.35);pointer-events:none;animation:kup 1.1s forwards;z-index:9}@keyframes kup{to{transform:translateY(-50px);opacity:0}}" +
    ".over{position:absolute;inset:0;background:rgba(30,40,60,.86);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center;padding:16px;z-index:10}" +
    ".over h2{font-family:Fredoka,sans-serif;margin:0 0 6px;font-size:1.9rem}.over p{margin:4px 0;font-weight:800}" +
    ".go{border:0;border-radius:999px;padding:13px 28px;font:inherit;font-weight:900;font-size:1.15rem;background:#f5b301;color:#3b2a00;box-shadow:0 5px 0 #b88a00;cursor:pointer;margin-top:12px}" +
    ".how{background:#fff;color:var(--ink);border-radius:16px;padding:10px 12px;font-weight:800;font-size:.92rem;text-align:left;margin-top:8px;max-width:420px}.how div{margin:4px 0}" +
    ".shop{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;max-width:380px;margin-top:10px}" +
    ".shop button{border:0;border-radius:14px;background:#fff;padding:6px 2px;font:inherit;font-weight:900;font-size:.75rem;color:var(--ink);cursor:pointer}.shop button i{display:block;font-style:normal;font-size:1.8rem}" +
    ".shop button.own{background:#d6f5e6}.shop button:disabled{opacity:.45;cursor:default}" +
    "canvas#fx{position:fixed;inset:0;pointer-events:none;z-index:20}" +
    ".wrap.fitted{max-width:none;display:flex;flex-direction:column;overflow:hidden}.wrap.fitted .stage{flex:1;height:auto;min-height:320px}" +
    ".wrap.fitted .pet{width:60px;height:60px}.wrap.fitted .bub{font-size:.95rem}.wrap.fitted .decor{font-size:2rem}" +
    "@media(min-width:900px){.wrap.fitted .top,.wrap.fitted .hud,.wrap.fitted .bottom{width:100%;max-width:820px;margin-left:auto;margin-right:auto}.wrap.fitted .nums{grid-template-columns:repeat(11,1fr)}.wrap.fitted .pad2 .keys{grid-template-columns:repeat(12,1fr)}}";

  root.G1Kit = function (cfg) {
    var d = root.document, $ = function (id) { return d.getElementById(id); };
    var c = cfg.colors || {};
    var st = d.createElement("style");
    st.textContent = ":root{--ink:" + (c.ink || "#2b2a3f") + ";--muted:" + (c.muted || "#6f6a86") + ";--bg:" + (c.bg || "#f4f1ff") + ";--line:" + (c.line || "#dcd6f5") + ";--accent:" + (c.accent || "#d6453a") + ";--stage:" + (c.stage || "#bfe6ff") + "}" + CSS + (cfg.css || "");
    d.head.appendChild(st);
    var sc = cfg.score || ["Stars", "星星"];
    d.body.insertAdjacentHTML("afterbegin",
      '<div class="wrap" id="wrap"><div class="top"><a class="tbtn" href="../index.html" id="home">← Home</a><b class="ttl">' + cfg.title + '</b><span><button class="tbtn" type="button" id="helpBtn" aria-label="How to play">?</button> <button class="tbtn" type="button" id="soundBtn">🔔</button></span></div>' +
      '<div class="hud"><div><small>' + sc[0] + " " + sc[1] + '</small><b id="score">0</b></div><div><small>Level 关</small><b id="day">1</b></div><div><small>Coins 金币</small><b id="coins">0</b></div></div>' +
      '<div class="stage" id="stage"><div id="decor"></div><div id="scene"></div><div class="helper"><div class="pet" id="pet"></div><div class="bub" id="bub"></div></div></div>' +
      '<div class="bottom" id="bottom"><div class="task" id="task"></div><div class="btns" id="btns"></div><div class="nums" id="nums"></div><div class="pad2" id="pad2"></div></div></div><canvas id="fx"></canvas>');
    var K = { busy: false, D: null };
    var S = { day: 1, coins: 0, deco: {}, tut: 0, sound: true };
    try { var s0 = JSON.parse(root.localStorage.getItem(cfg.store)); if (s0) for (var k in s0) S[k] = s0[k]; } catch (e) {}
    K.S = S; K.L = S.day;
    K.save = function () { try { root.localStorage.setItem(cfg.store, JSON.stringify(S)); } catch (e) {} };
    var GOAL = cfg.goal || 6, NEED = cfg.need || 5, timers = [];
    K.later = function (f, ms) { var t = setTimeout(f, ms); timers.push(t); return t; };
    K.stop = function () { timers.forEach(clearTimeout); timers = []; };
    function rnd(n) { return Math.floor(Math.random() * n); }
    K.rnd = rnd;
    K.shuffle = function (a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    // ---------- sound, the pet, confetti ----------
    var actx = null;
    // a struck metal bell, like a kitchen-timer ding: a short hammer click, then ringing partials that fade slowly
    K.bell = function (f0, vol) { if (!S.sound) return; try { actx = actx || new (root.AudioContext || root.webkitAudioContext)(); if (actx.resume) actx.resume(); f0 = f0 || 1760; vol = vol || .22;
      var t = actx.currentTime + .01, out = actx.createGain(); out.gain.value = vol; out.connect(actx.destination);
      [[1, 1, 2.2], [2.76, .5, 1.1], [5.4, .25, .5], [8.93, .12, .25]].forEach(function (p) { [0, .11].forEach(function (d, k) { var o = actx.createOscillator(), g = actx.createGain(), s = t + d, a = p[1] * (k ? .35 : 1); o.type = "sine"; o.frequency.value = f0 * p[0]; g.gain.setValueAtTime(.0001, s); g.gain.exponentialRampToValueAtTime(a, s + .004); g.gain.exponentialRampToValueAtTime(.0001, s + p[2]); o.connect(g); g.connect(out); o.start(s); o.stop(s + p[2] + .05); }); });
      var n = actx.createBuffer(1, Math.floor(actx.sampleRate * .03), actx.sampleRate), dd = n.getChannelData(0); for (var i = 0; i < dd.length; i++) dd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / dd.length, 3);
      var src = actx.createBufferSource(), ng = actx.createGain(); src.buffer = n; ng.gain.value = .5; src.connect(ng); ng.connect(out); src.start(t); } catch (e) {} };
    K.tone = function (fs, len, type) { if (!S.sound) return; try { actx = actx || new (root.AudioContext || root.webkitAudioContext)(); fs.forEach(function (f, i) { var t = actx.currentTime + i * len * .7, o = actx.createOscillator(), g = actx.createGain(); o.type = type || "triangle"; o.frequency.value = f; g.gain.setValueAtTime(.13, t); g.gain.exponentialRampToValueAtTime(.001, t + len); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + len + .02); }); } catch (e) {} };
    $("soundBtn").onclick = function () { S.sound = !S.sound; $("soundBtn").textContent = S.sound ? "🔔" : "🔕"; K.save(); };
    $("soundBtn").textContent = S.sound ? "🔔" : "🔕";
    try { if (root.self !== root.top) $("home").style.visibility = "hidden"; } catch (e) {}
    var pet = root.MathPet ? root.MathPet.get() : null;
    $("pet").innerHTML = pet ? root.MathPet.pic(pet, "happy", 60) : "🐣";
    K.say = function (t) { $("bub").innerHTML = t; var p = $("pet"); p.classList.remove("cheer"); void p.offsetWidth; p.classList.add("cheer"); };
    K.task = function (h) { $("task").innerHTML = h; };
    K.zoom = function () { return parseFloat($("wrap").style.zoom) || 1; };
    K.fitted = function () { return $("wrap").classList.contains("fitted"); };
    var cv = $("fx"), cx = cv.getContext("2d"), parts = [], anim = 0;
    K.burst = function (x, y) { cv.width = root.innerWidth; cv.height = root.innerHeight; for (var i = 0; i < 18; i++) parts.push({ x: x, y: y, vx: (Math.random() - .5) * 7, vy: -Math.random() * 6 - 1, l: 34, c: ["#f5b301", "#ff7a8a", "#7cc47f", "#4aa3ff", "#a46bff"][i % 5] }); if (!anim) anim = requestAnimationFrame(fx); };
    function fx() { cx.clearRect(0, 0, cv.width, cv.height); parts = parts.filter(function (p) { p.x += p.vx; p.y += p.vy; p.vy += .3; p.l--; cx.fillStyle = p.c; cx.fillRect(p.x, p.y, 6, 6); return p.l > 0; }); anim = parts.length ? requestAnimationFrame(fx) : 0; if (!anim) cx.clearRect(0, 0, cv.width, cv.height); }
    K.float = function (t) { var f = d.createElement("span"); f.className = "kfloat"; f.textContent = t; f.style.left = "45%"; f.style.top = "30%"; $("stage").appendChild(f); setTimeout(function () { f.remove(); }, 1100); };
    // ---------- answers: number buttons, a two-digit pad, buttons ----------
    var onNum = null;
    K.nums = function (max, cb) { var n = $("nums"), h = ""; onNum = cb; for (var i = 0; i <= max; i++) h += '<button type="button" data-v="' + i + '">' + i + "</button>"; n.innerHTML = h; n.style.display = "grid"; };
    $("nums").addEventListener("click", function (e) { var b = e.target.closest ? e.target.closest("button") : null; if (!b || K.busy || !onNum) return; onNum(+b.getAttribute("data-v"), b); });
    K.hideNums = function () { $("nums").style.display = "none"; onNum = null; };
    K.bad = function (b) { if (!b) return; b.classList.remove("bad"); void b.offsetWidth; b.classList.add("bad"); b.disabled = true; };
    var pad = { t: null, o: null, at: "t", cb: null };
    function drawPad() {
      var h = '<div class="show"><div class="slot' + (pad.at === "t" ? " on" : "") + '" id="ps_t">' + (pad.t == null ? "?" : pad.t) + '<small>tens 十位</small></div><div class="slot' + (pad.at === "o" ? " on" : "") + '" id="ps_o">' + (pad.o == null ? "?" : pad.o) + '<small>ones 个位</small></div></div><div class="keys">';
      for (var i = 1; i <= 9; i++) h += '<button type="button" data-k="' + i + '">' + i + "</button>";
      $("pad2").innerHTML = h + '<button type="button" data-k="0">0</button><button type="button" data-k="x">⌫</button><button type="button" class="ok" data-k="ok">✓</button></div>';
    }
    K.pad2 = function (cb) { pad = { t: null, o: null, at: "t", cb: cb }; drawPad(); $("pad2").style.display = "block"; };
    K.hidePad = function () { $("pad2").style.display = "none"; pad.cb = null; };
    K.padBad = function () { ["ps_t", "ps_o"].forEach(function (id) { var e = $(id); if (e) { e.classList.remove("bad"); void e.offsetWidth; e.classList.add("bad"); } }); pad.t = null; pad.o = null; pad.at = "t"; setTimeout(drawPad, 420); };
    $("pad2").addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("button") : null, s = e.target.closest ? e.target.closest(".slot") : null;
      if (K.busy || !pad.cb) return;
      if (s) { pad.at = s.id === "ps_t" ? "t" : "o"; drawPad(); return; }
      if (!b) return; var k = b.getAttribute("data-k");
      if (k === "ok") { if (pad.t == null && pad.o == null) return; pad.cb((pad.t || 0) * 10 + (pad.o || 0)); return; }
      if (k === "x") { if (pad.at === "o" && pad.o == null) pad.at = "t"; pad[pad.at] = null; drawPad(); return; }
      pad[pad.at] = +k; K.tone([600], .04); if (pad.at === "t") pad.at = "o"; drawPad();
    });
    K.btns = function (html, cols) { var b = $("btns"); b.innerHTML = html; b.style.display = "grid"; b.style.gridTemplateColumns = "repeat(" + (cols || 3) + ",1fr)"; return b; };
    K.hideBtns = function () { $("btns").style.display = "none"; };
    K.hideAll = function () { K.hideNums(); K.hidePad(); K.hideBtns(); };
    // ---------- rounds and levels ----------
    K.easy = function () { return K.D.n <= 2 || K.D.bad; };
    K.hard = function () { return !K.easy() && K.D.streak >= 3; };
    // cfg.score(K) may give its own text for the first box (a board game shows how far along the board it is)
    function hud() { $("score").textContent = cfg.scoreText && K.D ? cfg.scoreText(K) : (K.D ? K.D.ok : 0) + "/" + GOAL; $("day").textContent = K.L; $("coins").textContent = S.coins; }
    K.hud = hud;
    // a game whose level ends on its own (the treasure is reached): the next K.done ends the level
    K.finish = function () { if (K.D) K.D.n = GOAL; };
    K.done = function (good, tries) {
      K.busy = true; var D = K.D;
      if (good) { var coins = tries ? 1 : 3; D.ok++; D.coins += coins; S.coins += coins; D.streak = tries ? 0 : D.streak + 1; D.bad = !!tries; K.save();
        K.tone([660, 880, 1100], .08); var r = $("stage").getBoundingClientRect(); K.burst(r.left + r.width / 2, r.top + r.height / 3); K.float("+" + coins + " 🪙"); if (pet) root.MathPet.feed(1); }
      else { D.miss++; D.bad = true; D.streak = 0; }
      if (!S.tut && K.L === 1) { S.tut = 1; K.save(); }
      hud(); K.later(next, cfg.pause || 2200);
    };
    function next() {
      K.stop(); K.busy = false; K.hideAll();
      if (K.D.n >= GOAL) return endLevel();
      K.D.n++; hud(); cfg.round(K); K.D.first = false;
    }
    K.next = next;
    function startLevel() { K.D = { n: 0, ok: 0, miss: 0, coins: 0, streak: 0, bad: false, first: true, tut: !S.tut && K.L === 1 }; if (root.GameProgress) root.GameProgress.start(cfg.id, "day" + K.L); closeOver(); next(); }
    function endLevel() {
      var D = K.D, won = D.ok >= NEED, lv = K.L;
      if (root.GameProgress) root.GameProgress.report({ game: cfg.id, level: "day" + lv, name: cfg.name + " Level " + lv, won: won, stars: won ? (D.miss ? 2 : 3) : 0, correct: D.ok, total: cfg.scoreText ? D.ok + D.miss : GOAL, best: D.ok });
      if (won) { if (K.L === S.day) S.day++; K.L++; K.save(); }
      K.tone(won ? [523, 659, 784, 1047] : [392, 330, 262], .2);
      over("<h2>" + (won ? "🎉 Level " + lv + " done!" : "Level " + lv) + "</h2><p>" + (won ? "第 " + lv + " 关完成啦！" : "再试一次，做对 " + NEED + " 个就过关！") + '</p><p style="font-size:1.3rem">⭐ ' + D.ok + (cfg.scoreText ? " right 答对" : " / " + GOAL) + " · +" + D.coins + " 🪙</p>" + shopHtml() + levelPick() + '<button type="button" class="go" id="nextDay">' + playLabel() + "</button>");
      wireShop(); wirePick(); $("nextDay").onclick = startLevel;
    }
    function shopHtml() { if (!cfg.shop) return ""; return '<p style="margin-top:10px">🛒 ' + (cfg.shopName || "Shop 商店") + " · 🪙 " + S.coins + '</p><div class="shop" id="shop">' + cfg.shop.map(function (x) { var own = S.deco[x.id]; return '<button type="button" data-id="' + x.id + '" class="' + (own ? "own" : "") + '"' + (!own && S.coins < x.p ? " disabled" : "") + "><i>" + x.e + "</i>" + (own ? "✓" : x.p + " 🪙") + "</button>"; }).join("") + "</div>"; }
    function wireShop() { [].forEach.call(d.querySelectorAll("#shop button"), function (b) { b.onclick = function () { var x = cfg.shop.filter(function (y) { return y.id === b.getAttribute("data-id"); })[0]; if (!x || S.deco[x.id] || S.coins < x.p) return; S.coins -= x.p; S.deco[x.id] = 1; K.save(); drawDecor(); $("coins").textContent = S.coins; K.tone([660, 880, 1100], .08); $("shop").outerHTML = shopHtml().replace(/^<p[^>]*>.*?<\/p>/, ""); wireShop(); }; }); }
    function drawDecor() { if (cfg.decor) cfg.decor(S.deco); else if (cfg.shop) $("decor").innerHTML = cfg.shop.filter(function (x) { return S.deco[x.id]; }).map(function (x, i) { return '<span class="decor" style="left:' + (x.x || (8 + i * 10) + "%") + ";top:" + (x.y || "70%") + '">' + x.e + "</span>"; }).join(""); }
    function levelPick() { return root.LevelPick ? root.LevelPick.html(cfg.id, S.day, K.L) : ""; }
    function playLabel() { return S.day > 1 || K.L > 1 ? "Level " + K.L + " ▶ 开始第 " + K.L + " 关" : "Play! 开始"; }
    function wirePick() { if (root.LevelPick) root.LevelPick.wire(function (n) { K.L = n; $("day").textContent = n; var b = $("play") || $("nextDay"); if (b) b.textContent = playLabel(); }); }
    function over(h) { closeOver(); var o = d.createElement("div"); o.className = "over"; o.id = "over"; o.innerHTML = h; $("wrap").appendChild(o); }
    function closeOver() { var o = $("over"); if (o) o.remove(); }
    var HOW = '<div class="how">' + (cfg.how || "") + "</div>";
    function intro() { over("<h2>" + cfg.title + "</h2><p>" + (cfg.sub || "") + "</p>" + HOW + levelPick() + '<button type="button" class="go" id="play">' + playLabel() + "</button>"); wirePick(); $("play").onclick = startLevel; }
    $("helpBtn").onclick = function () { var o = d.createElement("div"); o.className = "over"; o.innerHTML = "<h2>❓ How to play</h2>" + HOW + '<button type="button" class="go">Got it! 明白了</button>'; $("wrap").appendChild(o); o.querySelector(".go").onclick = function () { o.remove(); }; };
    // ---------- fitting the screen: the room changes (the window, the panel below): the game draws again ----------
    K.start = function () {
      if (root.FitScreen) root.FitScreen($("wrap"), { wide: [1000, 680], narrow: [520, 900], max: 1.7 });
      var rt = 0;
      function rs() { clearTimeout(rt); rt = setTimeout(function () { if (cfg.resize && K.D) cfg.resize(); }, 120); }
      root.addEventListener("resize", rs);
      if (root.MutationObserver) new root.MutationObserver(rs).observe($("bottom"), { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
      drawDecor(); hud(); K.task(cfg.welcome || cfg.title); K.say(cfg.hello || "Let's play! 一起玩吧！");
      intro();
    };
    return K;
  };
})(window);
