/* The shared part of the Grade 3 math practice games (coaster.html, graphs.html, measure.html, shapes.html).
   A game page only describes its own questions and pictures; this file draws the map (levels, a mixed level that opens after 3, a practice
   level for missed questions, a shop, a chart for parents), runs the playing (3 hearts, coins, a fast bonus, streaks), explains every wrong
   answer and waits until the child taps "Got it", and keeps the progress in this browser only (no site stars).

   MathGame.run({
     title, icon, tagline, store,                    // store: the localStorage key
     coin: {e, n}, heart, theme: {brand, dark, bg, line, ink, muted, hero, choice: [4 colours]},
     levels: [{id, n, ic, gen}], boss: {n, ic, gen?, desc}, practice: {n, ic}, levelWord: "ride"|"report"…,
     shop: [{id, e, n, p}], shopTitle, shopCn, kinds: {kind: "what it practises"},
     fromKey(key) -> question, render(q, ui), right(q) -> string, explain(q) -> string,
     teach(q, given) -> {steps: [html], cn, pic}, after(q, ok, given, ui)?, miss(q) -> string, fastMs?,
     wrongText(q, given)?, rightText(q)?                // the line under the question after an answer, if the game has its own
     panel?: {title, cn, html: fn -> html}               // one more panel on the map (above the shop), e.g. a collection
     hero?: fn -> html                                   // drawn in the map's banner instead of the row of things bought
     shop items may have icon (html) instead of e; isOwned(it)?, onBuy(it)?, useOwned(it)?, ownedText(it)? change what the shop does
     gameId?: "potion-lab"                               // the name in the site's event log (game_level_start, game_level_end)
   })
   MathGame.sound() tells a game whether the child has the sound on.
   A question is {kind, key, ...}. render() fills the screen with ui.task(html), ui.stage(html), ui.choices([{html, val}]), ui.words(text),
   ui.hint(text); an interactive question calls ui.answer(val) itself; ui.round() -> {done, total} (questions done in this level). Written for old Android WebViews: no arrow functions, no spread. */
(function (root) {
  "use strict";
  var doc = root.document;
  function $(id) { return doc.getElementById(id); }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function pickOne(a) { return a[rnd(a.length)]; }

  var CSS = ':root{--ink:#22302a;--muted:#6c7a72;--line:#dfe8e1;--brand:#3a7bd5;--dark:#2a5ea8;--bg:#eef3fb;--good:#2f9e5b;--bad:#e0554f;--gold:#f5b301;--shadow:0 14px 34px rgba(0,0,0,.12)}' +
    '*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Nunito,ui-rounded,"Trebuchet MS",Arial,sans-serif;min-height:100vh}' +
    'h1,h2,h3{font-family:Fredoka,ui-rounded,"Trebuchet MS",Arial,sans-serif}button{font:inherit;cursor:pointer;color:inherit}button:focus-visible{outline:3px solid #f5b301;outline-offset:2px}[hidden]{display:none!important}' +
    '.top{max-width:920px;margin:auto;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px}' +
    '.home,.tbtn{background:#fff;border:1px solid var(--line);border-radius:13px;padding:9px 13px;font-weight:900;text-decoration:none;color:var(--ink)}' +
    '.wallet{display:flex;gap:8px;align-items:center}.chip{background:#fff;border:1px solid var(--line);border-radius:999px;padding:7px 12px;font-weight:900;white-space:nowrap}' +
    '.wrap{max-width:920px;margin:auto;padding:0 16px 48px}' +
    '.hero{position:relative;border-radius:28px;padding:22px 14px 16px;color:#fff;text-align:center;box-shadow:var(--shadow);overflow:hidden}' +
    '.hero h1{margin:0;font-size:clamp(1.9rem,7vw,3rem);text-shadow:0 3px 0 rgba(0,0,0,.2)}.hero p{margin:4px 0 0;font-weight:900;text-shadow:0 2px 0 rgba(0,0,0,.25)}' +
    '.owned{font-size:2rem;letter-spacing:6px;min-height:1.3em;margin-top:8px;line-height:1.3}' +
    '.progress{display:inline-block;margin-top:8px;background:rgba(255,255,255,.92);border-radius:999px;padding:6px 14px;font-weight:900;color:var(--ink)}' +
    '.lvls{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}' +
    '.lv{position:relative;border:0;border-radius:22px;padding:12px 6px 10px;background:#fff;box-shadow:0 6px 0 var(--line),var(--shadow);text-align:center;transition:transform .15s}' +
    '.lv:hover{transform:translateY(-4px)}.lv:active{transform:translateY(2px)}' +
    '.lv .ic{font-size:2rem;line-height:1.2;display:block}.lv .tag{font-family:Fredoka,sans-serif;font-weight:700;font-size:1.02rem;display:block;line-height:1.15}' +
    '.lv .stars{font-size:.95rem;letter-spacing:.05em;min-height:1.3em}.lv .num{position:absolute;left:10px;top:8px;background:var(--brand);color:#fff;border-radius:8px;font-weight:900;font-size:.8rem;padding:2px 7px}' +
    '.lv.gold{box-shadow:0 6px 0 #e0b200,0 0 0 3px var(--gold),var(--shadow)}' +
    '.lv.wide{grid-column:1/-1;display:flex;align-items:center;justify-content:center;gap:14px;padding:14px}.lv.wide .txt{text-align:left}.lv.wide .ic{font-size:2.4rem}' +
    '.lv .name{display:block;font-size:.76rem;font-weight:800;color:var(--muted)}' +
    '.lv.boss{background:linear-gradient(135deg,var(--dark),var(--brand));color:#fff;box-shadow:0 6px 0 rgba(0,0,0,.3),var(--shadow)}.lv.boss .name{color:rgba(255,255,255,.85)}' +
    '.lv.boss.locked{filter:grayscale(.85);opacity:.75;cursor:not-allowed}.lv.practice{background:#fff7e3}.lv.practice:disabled{opacity:.6;cursor:default;transform:none}' +
    '.panel{margin-top:22px;background:#fff;border-radius:20px;padding:4px 18px;box-shadow:var(--shadow)}.panel summary{cursor:pointer;font-weight:900;padding:12px 0}.panel summary small{color:var(--muted);font-weight:800}' +
    '.shop{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;padding-bottom:16px}' +
    '.item{border:2px solid var(--line);border-radius:16px;background:#fff;padding:10px 6px;text-align:center;font-weight:900}.item .e{font-size:2rem;display:block}.item .n{display:block;font-size:.85rem}' +
    '.item .p{display:block;font-size:.82rem;color:var(--muted);margin-top:2px}.item.own{border-color:var(--good);background:#effaf2}.item.own .p{color:var(--good)}.item:disabled{opacity:.55;cursor:default}' +
    '.skills{width:100%;border-collapse:collapse;margin-bottom:14px;font-weight:800;font-size:.9rem}.skills td{padding:7px 4px;border-top:1px solid var(--line)}.skills td:last-child{text-align:right;white-space:nowrap}' +
    '.meter{display:inline-block;width:90px;height:10px;border-radius:9px;background:#eef1f5;overflow:hidden;vertical-align:middle;margin-left:6px}.meter i{display:block;height:100%;background:var(--good)}' +
    '.bar-top{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.hearts{font-size:1.4rem;letter-spacing:.06em;font-weight:900}.hearts .lost{filter:grayscale(1);opacity:.3}' +
    '.stage{position:relative;margin-top:12px;border-radius:26px;box-shadow:var(--shadow);overflow:hidden;background:#fff;padding:12px 12px 14px}' +
    '.task{background:var(--bg);border-radius:14px;padding:9px 12px;font-weight:900;font-size:1.08rem;text-align:center;line-height:1.4}.task b{color:var(--dark)}' +
    '.words{font-weight:900;color:var(--muted);font-size:1.08rem;min-height:1.5em;text-align:center;margin-top:8px}' +
    '.msg{text-align:center;font-weight:900;min-height:1.6em;font-size:1.1rem;margin-top:2px}.msg.good{color:var(--good)}.msg.bad{color:var(--bad)}.msg.combo{color:#e07b00}.msg.pop{animation:pop .35s}' +
    '.choices{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px}' +
    '.choice{border:0;border-radius:22px;padding:14px 6px;font-family:Fredoka,sans-serif;font-size:1.8rem;font-weight:700;color:var(--ink);box-shadow:0 6px 0 rgba(0,0,0,.13);transition:transform .06s;min-height:70px}' +
    '.choice.text{font-size:1.1rem;font-family:Nunito,sans-serif;font-weight:900}.choice small{display:block;font-size:.82rem;font-family:Nunito,sans-serif;font-weight:900}' +
    '.choice:active{transform:translateY(4px);box-shadow:0 2px 0 rgba(0,0,0,.13)}.choice.right{background:var(--good)!important;color:#fff}' +
    '.choice.wrong{background:var(--bad)!important;color:#fff;animation:shake .35s}.choice:disabled{cursor:default}' +
    '.hint{text-align:center;color:var(--muted);font-weight:800;font-size:.9rem;margin-top:8px}' +
    '.teach{margin-top:12px;background:#fff;border:3px solid #ffd166;border-radius:20px;padding:12px 14px 14px;box-shadow:0 10px 24px rgba(0,0,0,.1);animation:pop .3s}' +
    '.teach h3{margin:0 0 8px;font-size:1.15rem}.teach h3 small{font-family:Nunito,sans-serif;font-size:.85rem;color:#7a7a7a;font-weight:800}' +
    '.teach ol{margin:0;padding-left:1.4em;font-weight:800;line-height:1.55}.teach li{margin:3px 0}' +
    '.teach .cn{margin-top:8px;padding:8px 10px;border-radius:12px;background:#fff8e1;font-weight:800;font-size:.95rem;line-height:1.5}.teach .pic{text-align:center;margin:2px 0 8px;line-height:1.1}' +
    '.teach .ok{display:block;width:100%;margin-top:12px;border:0;border-radius:14px;padding:13px;font-weight:900;font-size:1.1rem;color:#fff;background:#3a7bd5;box-shadow:0 4px 0 #2a5ea8}.teach .ok small{font-weight:800;opacity:.9}' +
    '.result{background:#fff;border-radius:28px;padding:26px 18px;text-align:center;box-shadow:var(--shadow);margin-top:8px}.result .big{font-size:5.5rem;line-height:1.1;display:inline-block;animation:pop .6s}' +
    '.result h2{margin:6px 0;font-size:1.8rem}.result .stars{font-size:2.6rem;letter-spacing:.1em}.result p{color:var(--muted);font-weight:800;margin:6px 0}' +
    '.reward{display:inline-block;background:#fff6d6;border-radius:999px;padding:8px 16px;font-weight:900;margin:8px 0}' +
    '.mistakes{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0}.mistakes span{background:#fdeeee;color:#9b2c2c;border-radius:12px;padding:7px 11px;font-weight:900}' +
    '.row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:14px}' +
    '.btn{border:0;border-radius:16px;padding:14px 22px;font-weight:900;font-size:1.05rem;background:var(--brand);color:#fff;box-shadow:0 5px 0 var(--dark)}.btn.light{background:#fff;color:var(--ink);border:2px solid var(--line);box-shadow:none}' +
    '#confetti{position:fixed;inset:0;pointer-events:none;z-index:50}' +
    '@keyframes shake{20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}' +
    '@keyframes pop{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}' +
    '@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}' +
    '@media(max-width:620px){.lvls{gap:8px}.lv .tag{font-size:.9rem}.choice{font-size:1.5rem}.choice.text{font-size:1rem}}';

  var HTML = '<div class="top"><a class="home" id="homeLink" href="../index.html">← Home</a><div class="wallet"><span class="chip" id="coinChip"><span id="coinE"></span> <span id="coinTotal">0</span></span>' +
    '<button class="tbtn" type="button" id="soundBtn">🔔 Sound on</button></div></div><div class="wrap">' +
    '<section id="map"><div class="hero" id="hero"><h1 id="gTitle"></h1><p id="gTag"></p><div class="owned" id="owned"></div><div class="progress" id="progress"></div></div>' +
    '<div class="lvls" id="lvls"></div>' +
    '<details class="panel" id="xPanel" hidden open><summary id="xTitle"></summary><div id="xBody" style="padding-bottom:14px"></div></details>' +
    '<details class="panel" open><summary id="shopTitle"></summary><div class="shop" id="shop"></div></details>' +
    '<details class="panel"><summary>📋 For parents: what is going well <small>给家长看：掌握情况</small></summary><table class="skills" id="skills"></table></details></section>' +
    '<section id="play" hidden><div class="bar-top"><button class="tbtn" type="button" id="quitBtn">✕ Leave</button><span class="hearts" id="hearts"></span><span class="chip"><span id="coinE2"></span> +<span id="pCoins">0</span></span></div>' +
    '<div class="stage"><div class="task" id="task"></div><div id="field"></div></div><div class="words" id="words"></div><div class="msg" id="msg"></div>' +
    '<div class="choices" id="choices"></div><div class="teach" id="teach" hidden></div><div class="hint" id="hint"></div></section>' +
    '<section id="result" hidden><div class="result"><div class="big" id="rBig"></div><h2 id="rTitle"></h2><div class="stars" id="rStars"></div><div class="reward" id="rReward"></div><p id="rSub"></p>' +
    '<div id="rMissBox"><p>Practice these again:</p><div class="mistakes" id="rMiss"></div></div>' +
    '<div class="row"><button class="btn" type="button" id="againBtn">Play again</button><button class="btn light" type="button" id="mapBtn">Back to the map</button></div></div></section></div><canvas id="confetti"></canvas>';

  function run(C) {
    var th = C.theme || {};
    var css = CSS + ":root{" + ["brand", "dark", "bg", "line", "ink", "muted"].filter(function (k) { return th[k]; }).map(function (k) { return "--" + k + ":" + th[k]; }).join(";") + "}" +
      ".hero{background:" + (th.hero || "var(--brand)") + "}" +
      (th.choice || ["#d6efc4", "#ffe7a8", "#cfe7ff", "#ffd1e3"]).map(function (c, i) { return ".choice:nth-child(" + (i + 1) + "){background:" + c + "}"; }).join("") + (C.css || "");
    var st = doc.createElement("style"); st.textContent = css; doc.head.appendChild(st);
    var host = doc.createElement("div"); host.innerHTML = HTML; while (host.firstChild) doc.body.appendChild(host.firstChild);
    $("gTitle").textContent = C.icon + " " + C.title; $("gTag").textContent = C.tagline;
    $("coinE").textContent = C.coin.e; $("coinE2").textContent = C.coin.e;
    $("shopTitle").innerHTML = "🛍️ " + C.shopTitle + " <small>" + C.shopCn + "</small>";
    $("quitBtn").textContent = "✕ " + (C.leave || "Leave");

    var BOSS = { id: "boss", n: C.boss.n, ic: C.boss.ic, gen: C.boss.gen || function () { return pickOne(C.levels).gen(); } };
    var PRACTICE = { id: "practice", n: C.practice.n, ic: C.practice.ic };
    var BOSS_NEED = 3, LW = C.levelWord || "level";

    // ---------- saved progress (this browser only) ----------
    var data = { facts: {}, lv: {}, kinds: {}, coins: 0, owned: {}, sound: true };
    try {
      var raw = root.localStorage.getItem(C.store);
      if (raw) { var d0 = JSON.parse(raw); if (d0 && typeof d0 === "object") {
        ["facts", "lv", "kinds", "owned"].forEach(function (k) { if (d0[k] && typeof d0[k] === "object") data[k] = d0[k]; });
        if (typeof d0.coins === "number") data.coins = d0.coins; if (typeof d0.sound === "boolean") data.sound = d0.sound; } }
    } catch (e) {}
    function save() { try { root.localStorage.setItem(C.store, JSON.stringify(data)); } catch (e) {} }
    root.MathGame.sound = function () { return data.sound; };
    function fact(k) { return data.facts[k] || (data.facts[k] = { ok: 0, miss: 0 }); }
    function mastered(k) { var f = data.facts[k]; return f && f.ok >= 2 && f.ok - f.miss * 2 >= 1; }
    function missList() { return Object.keys(data.facts).filter(function (k) { return data.facts[k].miss > 0 && !mastered(k); }); }
    function starsOf(id) { return (data.lv[id] && data.lv[id].stars) || 0; }
    function playedCount() { return C.levels.filter(function (L) { return starsOf(L.id) > 0; }).length; }

    // ---------- sound effects (no voice) ----------
    var actx = null;
    function tone(notes, type, len) {
      if (!data.sound) return;
      try {
        actx = actx || new (root.AudioContext || root.webkitAudioContext)();
        notes.forEach(function (f, i) {
          var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * (len * .6);
          o.type = type; o.frequency.value = f;
          g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.14, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + len);
          o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + len + .02);
        });
      } catch (e) {}
    }
    var SFX = {
      ok: function () { tone([523, 784], "triangle", .14); }, fast: function () { tone([784, 988, 1175], "square", .08); },
      oops: function () { tone([260, 180], "sawtooth", .16); }, buy: function () { tone([659, 880, 1047], "triangle", .12); },
      win: function () { tone([523, 659, 784, 1047], "triangle", .18); }, lose: function () { tone([392, 330, 262], "sine", .25); }
    };
    function show(id) { ["map", "play", "result"].forEach(function (s) { $(s).hidden = (s !== id); }); $("coinChip").hidden = (id !== "map"); root.scrollTo(0, 0); }

    // ---------- map ----------
    function starText(n) { return "⭐".repeat(n) + "☆".repeat(3 - n); }
    function renderMap() {
      $("coinTotal").textContent = data.coins;
      if (C.hero) { $("owned").innerHTML = C.hero(); $("owned").style.letterSpacing = "normal"; $("owned").style.fontSize = "1rem"; }
      else $("owned").textContent = C.shop.filter(function (it) { return owns(it); }).map(function (it) { return it.e; }).join("") || (C.emptyOwned || "");
      $("progress").textContent = (C.doneWord || "Done") + ": " + (playedCount() + (starsOf("boss") ? 1 : 0)) + " / " + (C.levels.length + 1);
      var box = $("lvls"); box.innerHTML = "";
      C.levels.forEach(function (L, i) {
        var s = starsOf(L.id), b = doc.createElement("button");
        b.type = "button"; b.className = "lv" + (s === 3 ? " gold" : "");
        b.innerHTML = '<span class="num">' + (i + 1) + '</span><span class="ic">' + L.ic + '</span><span class="tag">' + L.n + '</span><div class="stars">' + starText(s) + "</div>";
        b.onclick = function () { start(L); };
        box.appendChild(b);
      });
      var bs = starsOf("boss"), open = playedCount() >= BOSS_NEED, left = BOSS_NEED - playedCount(), bb = doc.createElement("button");
      bb.type = "button"; bb.className = "lv wide boss" + (open ? "" : " locked") + (bs === 3 ? " gold" : "");
      bb.innerHTML = '<span class="ic">' + (open ? BOSS.ic : "🔒") + '</span><span class="txt"><span class="tag">' + BOSS.n + '</span><span class="name">' +
        (open ? (bs ? "Everything mixed up " + starText(bs) : C.boss.desc) : "Finish " + left + " more " + (left === 1 ? LW : LW + "s") + " to unlock") + "</span></span>";
      bb.onclick = function () { if (open) start(BOSS); };
      box.appendChild(bb);
      var n = missList().length, pb = doc.createElement("button");
      pb.type = "button"; pb.className = "lv wide practice"; pb.disabled = !n;
      pb.innerHTML = '<span class="ic">' + PRACTICE.ic + '</span><span class="txt"><span class="tag">' + PRACTICE.n + '</span><span class="name">' +
        (n ? ("You missed " + n + " " + (n === 1 ? "question" : "questions") + ". Let's practice! No hearts lost here.") : "Nothing to practice. Great job!") + "</span></span>";
      pb.onclick = function () { if (n) start(PRACTICE); };
      box.appendChild(pb);
      if (C.panel) { $("xPanel").hidden = false; $("xTitle").innerHTML = C.panel.title + " <small>" + C.panel.cn + "</small>"; $("xBody").innerHTML = C.panel.html(); }
      renderShop(); renderSkills();
    }
    function owns(it) { return !!data.owned[it.id] || !!(C.isOwned && C.isOwned(it)); }
    function renderShop() {
      var box = $("shop"); box.innerHTML = "";
      C.shop.forEach(function (it) {
        var own = owns(it), b = doc.createElement("button");
        b.type = "button"; b.className = "item" + (own ? " own" : ""); b.disabled = own ? !C.useOwned : data.coins < it.p;
        b.innerHTML = '<span class="e">' + (it.icon || it.e) + '</span><span class="n">' + it.n + '</span><span class="p">' + (own ? (C.ownedText ? C.ownedText(it) : "✓ " + (C.ownedWord || "Yours")) : C.coin.e + " " + it.p) + "</span>";
        b.onclick = function () {
          if (own) { if (C.useOwned) { C.useOwned(it); renderMap(); } return; }
          if (data.coins < it.p) return;
          data.coins -= it.p; data.owned[it.id] = 1; save(); SFX.buy();
          if (C.onBuy) { try { C.onBuy(it); } catch (e) {} }
          renderMap();
        };
        box.appendChild(b);
      });
    }
    function renderSkills() {
      var h = "";
      Object.keys(C.kinds).forEach(function (k) {
        var s = data.kinds[k] || { ok: 0, miss: 0 }, tot = s.ok + s.miss, pct = tot ? Math.round(100 * s.ok / tot) : 0;
        h += "<tr><td>" + C.kinds[k] + "</td><td>" + (tot ? pct + "% right of " + tot : "not tried yet 还没练") + '<span class="meter"><i style="width:' + pct + '%"></i></span></td></tr>';
      });
      $("skills").innerHTML = h;
    }
    $("soundBtn").onclick = function () { data.sound = !data.sound; save(); renderSound(); };
    function renderSound() { $("soundBtn").textContent = data.sound ? "🔔 Sound on" : "🔕 Sound off"; }

    // ---------- playing ----------
    var G = null, pending = 0;
    function track(name, payload) {
      if (!C.gameId) return;
      try { var w = root.parent && root.parent !== root && root.parent.__trackEvent ? root.parent : root; if (w.__trackEvent) w.__trackEvent(name, payload); } catch (e) {}
    }
    function start(P) {
      var pool = null;
      if (P === PRACTICE) { pool = missList(); if (!pool.length) return; }
      var total = P === BOSS ? 12 : P === PRACTICE ? Math.max(4, Math.min(10, pool.length * 2)) : 8;
      G = { P: P, pool: pool, left: total, total: total, hearts: P === PRACTICE ? Infinity : 3, coins: 0, streak: 0, best: 0, correct: 0, miss: {}, q: null, locked: false, lastKey: "", again: [] };
      $("pCoins").textContent = "0"; renderHearts(); show("play"); next();
      track("game_level_start", { game: C.gameId, level: P.id });
    }
    function renderHearts() {
      if (G.hearts === Infinity) { $("hearts").textContent = "💪 Practice"; return; }
      var h = ""; for (var i = 0; i < 3; i++) h += i < G.hearts ? C.heart : '<span class="lost">' + C.heart + "</span>";
      $("hearts").innerHTML = h + ' <span style="font-size:1rem">' + C.icon + " " + G.left + "</span>";
    }
    function makeQ() {
      var q, tries = 0;
      do {
        if (G.P === PRACTICE) q = C.fromKey(pickOne(G.pool));
        else if (G.again.length && Math.random() < .5) q = C.fromKey(G.again.shift());
        else q = G.P.gen();
        tries++;
      } while (q.key === G.lastKey && tries < 8);
      G.lastKey = q.key; return q;
    }
    var ui = {
      task: function (h) { $("task").innerHTML = h; },
      stage: function (h) { $("field").innerHTML = h; return $("field"); },
      words: function (t) { $("words").textContent = t; },
      hint: function (t) { $("hint").textContent = t; },
      choices: function (list, opts) {
        var ch = $("choices"); ch.innerHTML = "";
        ch.style.gridTemplateColumns = (opts && opts.cols) ? "repeat(" + opts.cols + ",1fr)" : "";
        list.forEach(function (c) {
          var b = doc.createElement("button"); b.type = "button"; b.className = "choice" + (c.cls ? " " + c.cls : ""); b.innerHTML = c.html; b.dataset.v = String(c.val);
          b.onclick = function () { answer(String(c.val), b); }; ch.appendChild(b);
        });
      },
      answer: function (v) { answer(String(v), null); },
      round: function () { return { done: G ? G.total - G.left : 0, total: G ? G.total : 0, correct: G ? G.correct : 0 }; },
      locked: function () { return !G || G.locked; }
    };
    function next() {
      $("teach").hidden = true;
      G.locked = false; var q = G.q = makeQ(); G.t0 = Date.now();
      $("msg").textContent = ""; $("msg").className = "msg"; $("words").textContent = ""; $("hint").textContent = ""; $("choices").innerHTML = ""; $("field").innerHTML = "";
      C.render(q, ui);
    }
    function say(text, cls) { var m = $("msg"); m.className = "msg " + cls; void m.offsetWidth; m.textContent = text; m.classList.add("pop"); }
    function later(fn, ms) { clearTimeout(pending); pending = setTimeout(fn, ms); }
    function teachShow(t, cont) {
      var el = $("teach");
      el.innerHTML = '<h3>💡 Let\'s see why <small>看看为什么</small></h3>' + (t.pic || "") + "<ol><li>" + t.steps.join("</li><li>") + "</li></ol>" +
        (t.cn ? '<div class="cn">' + t.cn + "</div>" : "") + '<button type="button" class="ok" id="teachOk">Got it! Next ➜ <small>明白了</small></button>';
      el.hidden = false;
      $("teachOk").onclick = function () { el.hidden = true; cont(); };
      setTimeout(function () { try { el.scrollIntoView({ behavior: "smooth", block: "nearest" }); $("teachOk").focus({ preventScroll: true }); } catch (e) {} }, 400);
    }
    function answer(val, btn) {
      if (!G || G.locked) return; G.locked = true;
      var q = G.q, right = C.right(q), ok = val === right, f = fact(q.key), ms = Date.now() - G.t0;
      var ks = data.kinds[q.kind] || (data.kinds[q.kind] = { ok: 0, miss: 0 });
      [].forEach.call(doc.querySelectorAll(".choice"), function (x) { x.disabled = true; if (x.dataset.v === right) x.classList.add("right"); });
      if (!ok && btn) btn.classList.add("wrong");
      if (C.after) { try { C.after(q, ok, val, ui); } catch (e) {} }
      $("words").textContent = C.explain(q); $("hint").textContent = "";
      G.left--;
      if (ok) {
        f.ok++; ks.ok++; G.correct++; G.streak++; G.best = Math.max(G.best, G.streak);
        var fast = ms < (C.fastMs || 8000), gain = fast ? 2 : 1; G.coins += gain; $("pCoins").textContent = G.coins;
        if (fast) SFX.fast(); else SFX.ok();
        if (G.streak >= 3) say("🔥 " + G.streak + " right in a row!", "combo");
        else say(C.rightText ? C.rightText(q, fast) : fast ? "⚡ Speedy! Two " + C.coin.n + "!" : pickOne(["Great job!", "You got it!", "Awesome!", "Well done!"]), "good");
      } else {
        f.miss++; ks.miss++; G.streak = 0; G.miss[q.key] = q; G.again.push(q.key);
        SFX.oops(); if (G.hearts !== Infinity) G.hearts--;
        say(C.wrongText ? C.wrongText(q, val) : "Oops! The right answer is green.", "bad");
      }
      save(); renderHearts();
      var cont = G.hearts <= 0 ? function () { finish(false); } : G.left <= 0 ? function () { SFX.win(); finish(true); } : next;
      if (ok) later(cont, 1800); else teachShow(C.teach(q, val), cont);
    }
    function finish(won) {
      clearTimeout(pending);
      var P = G.P, stars = 0, bonus = 0;
      if (won) { if (P === PRACTICE) bonus = 5; else { stars = G.hearts; if (stars > starsOf(P.id)) data.lv[P.id] = { stars: stars }; bonus = stars * 5; } }
      data.coins += G.coins + bonus; save();
      track("game_level_end", { game: C.gameId, level: P.id, won: !!won, stars: stars, correct: G.correct, total: G.total - G.left, best: G.best });
      $("rBig").textContent = won ? (P === PRACTICE ? PRACTICE.ic : C.icon) : "💫";
      $("rTitle").textContent = won ? (P === PRACTICE ? "Practice done!" : "You did it: " + P.n + (/[?!]$/.test(P.n) ? "" : "!")) : "So close! Try again!";
      $("rStars").textContent = (won && P !== PRACTICE) ? starText(stars) : "";
      $("rReward").textContent = C.coin.e + " +" + (G.coins + bonus) + (bonus ? " (bonus +" + bonus + ")" : "");
      $("rSub").textContent = G.correct + " right · best streak " + G.best + (won && P !== PRACTICE && stars < 3 ? " · Keep all your hearts to get 3 stars" : "");
      var miss = Object.keys(G.miss);
      $("rMissBox").hidden = !miss.length;
      $("rMiss").innerHTML = miss.map(function (k) { return "<span>" + C.miss(G.miss[k]) + "</span>"; }).join("");
      show("result");
      if (won) confetti(); else SFX.lose();
    }
    function quit() { clearTimeout(pending); renderMap(); show("map"); }
    $("quitBtn").onclick = function () { G = null; quit(); };
    $("mapBtn").onclick = quit;
    $("againBtn").onclick = function () { var P = G.P; if (P === PRACTICE && !missList().length) { quit(); return; } start(P); };
    doc.addEventListener("keydown", function (e) {
      if ($("play").hidden) return;
      var i = "1234".indexOf(e.key); if (i < 0) return;
      var b = doc.querySelectorAll(".choice")[i]; if (b && !b.disabled) b.click();
    });
    function confetti() {
      if (root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var cv = $("confetti"), ctx = cv.getContext("2d"); cv.width = root.innerWidth; cv.height = root.innerHeight;
      var cols = ["#f5b301", "#2f9e5b", "#3a7bd5", "#e86a9c", "#7cc47f"], ps = [];
      for (var i = 0; i < 150; i++) ps.push({ x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * .5, vx: (Math.random() - .5) * 3, vy: 2 + Math.random() * 3, r: Math.random() * 6.28, c: cols[i % 5], s: 6 + Math.random() * 6 });
      var t0 = root.performance.now();
      (function loop(t) {
        ctx.clearRect(0, 0, cv.width, cv.height);
        ps.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.r += .1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
        if (t - t0 < 3000) root.requestAnimationFrame(loop); else ctx.clearRect(0, 0, cv.width, cv.height);
      })(t0);
    }
    // inside the site's reader window the reader's own close button takes the child back to the shelf
    var framed = true; try { framed = root.self !== root.top; } catch (e) {}
    if (framed) $("homeLink").style.visibility = "hidden";
    // for the tests
    root.__game = { gen: function (i) { return (i === "boss" ? BOSS : C.levels[i]).gen(); }, right: C.right, teach: C.teach, explain: C.explain, cur: function () { return G && G.q; } };
    renderSound(); renderMap();
  }

  // small helpers the games share
  var ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  var TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  function inWords(n) {
    if (n < 20) return ONES[n];
    if (n < 100) { var t = TENS[Math.floor(n / 10)], o = n % 10; return o ? t + "-" + ONES[o] : t; }
    var h = Math.floor(n / 100), r = n % 100;
    if (n >= 1000) return "one thousand";
    return ONES[h] + " hundred" + (r ? " " + inWords(r) : "");
  }
  function numChoices(right, wrongs, min) {
    var out = [right], seen = {}; seen[right] = 1; min = min == null ? 0 : min;
    wrongs.slice().sort(function () { return Math.random() - .5; }).forEach(function (v) { if (out.length < 4 && v >= min && !seen[v]) { seen[v] = 1; out.push(v); } });
    for (var t = 1; out.length < 4; t++) [right + t, right - t].forEach(function (v) { if (out.length < 4 && v >= min && !seen[v]) { seen[v] = 1; out.push(v); } });
    return out.sort(function () { return Math.random() - .5; });
  }
  root.MathGame = { run: run, rnd: rnd, pickOne: pickOne, between: function (a, b) { return a + rnd(b - a + 1); }, inWords: inWords, numChoices: numChoices,
    shuffle: function (a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; } };
})(window);
