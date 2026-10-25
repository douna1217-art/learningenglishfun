/* The reading buddy: while a book is open on the homepage the child's pet sits in the reader bar, hops when the page turns and cheers when a part is done,
   and when the whole journey (reading, grammar and vocabulary) is finished a small ceremony opens: the pet cheers, the book's cover becomes a card,
   the stars just earned are listed, and the child sees how close the next book badge is and can go straight on to a next book.

   The book runs in an iframe of the same site, so its page number and progress are read from it (the same way settleReading() already reads its answers).
   Nothing is added to the books themselves.

   ReadingBuddy.init({ pet: fn -> {type, eq, name} or null, all: [books], bookState: fn(slug), settle: fn -> {got, lines, fresh}, openReader: fn(book), close: fn, sfx: fn })
   ReadingBuddy.open(book)    a book was opened          ReadingBuddy.stop()   the reader was closed
   ReadingBuddy.finishNow()   (tests) run the ceremony as if the last part had just been completed
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";

  var cfg = null,
    cur = null,
    timer = null,
    rig = null,
    bigRig = null,
    bigTimer = null,
    bubbleTimer = null,
    last = null,
    flips = 0,
    lastLine = -1,
    celebrated = false;

  var LINES = {
    Fiction: ["What happens next?", "Ooh, I love stories!", "I can't wait to see!", "That was a good part!"],
    Science: ["Let's explore!", "Look closely!", "Science is amazing!", "I wonder why!"],
    Math: ["Let's count!", "Numbers are fun!", "Let's work it out!", "I see a pattern!"],
    SEL: ["Feelings matter.", "Kind hearts win!", "I get how they feel.", "Good thinking!"],
    "Social Studies": ["Let's visit the world!", "History is cool!", "So many people!", "I'm learning a lot!"],
    "Computer Science": ["Beep boop, thinking!", "Let's crack the code!", "Smart machines!", "Step by step!"],
  };
  var PART = { comprehension: "Great reading!", grammar: "Grammar star!" };

  function $(id) {
    return document.getElementById(id);
  }
  function reduced() {
    try {
      return matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function petInfo() {
    var p = null;
    try {
      p = cfg && cfg.pet ? cfg.pet() : null;
    } catch (e) {}
    return p && p.type ? p : null;
  }
  function mount(host, size, opts) {
    var p = petInfo();
    if (!p || !root.PetRig || !host) return null;
    host.style.width = size + "px";
    host.style.height = size + "px";
    try {
      return root.PetRig.mount(host, p.type, p.eq || {}, opts);
    } catch (e) {
      return null;
    }
  }
  function readFrame() {
    try {
      return JSON.parse($("readerFrame").contentWindow.eval("JSON.stringify({p:page,c:completed,n:pages.length})"));
    } catch (e) {
      return null;
    }
  }

  /* ---- the little buddy in the reader bar ---- */
  function style() {
    if ($("rbStyle")) return;
    var s = document.createElement("style");
    s.id = "rbStyle";
    s.textContent =
      "#rbBuddy{margin-left:auto;display:flex;align-items:center;gap:8px;min-width:0}" +
      "#rbBubble{background:#fff;color:#3A2E6B;font-weight:800;font-size:.82rem;padding:5px 11px;border-radius:14px;position:relative;opacity:0;transform:translateY(3px);transition:opacity .25s,transform .25s;max-width:44vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      "#rbBubble.on{opacity:1;transform:none}" +
      "#rbPet{width:44px;height:44px;flex:none}" +
      "#rbDone{position:absolute;left:0;right:0;bottom:0;z-index:5;background:rgba(40,28,90,.55);display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto}" +
      "#rbDone .rbc{background:#fff;border:4px solid #FFC93C;border-radius:28px;max-width:430px;width:100%;padding:18px 20px 20px;text-align:center;color:#2D2250;box-shadow:0 14px 40px rgba(0,0,0,.3);animation:rbPop .45s cubic-bezier(.2,1.4,.4,1)}" +
      "@keyframes rbPop{from{transform:scale(.7);opacity:0}to{transform:none;opacity:1}}" +
      "#rbDone h2{margin:2px 0 0;font-family:Fredoka,ui-rounded,'Trebuchet MS',Arial,sans-serif;font-size:1.7rem;line-height:1.1}" +
      "#rbDone .rbcn{font-weight:700;opacity:.65;font-size:.95rem}" +
      "#rbDone .rbpet{margin:0 auto;height:110px;display:flex;justify-content:center}" +
      "#rbDone .rbcard{display:flex;gap:12px;align-items:center;background:#F4F0FF;border-radius:18px;padding:10px;margin:10px 0;text-align:left}" +
      "#rbDone .rbcard img{width:78px;height:78px;object-fit:cover;border-radius:12px;background:#fff;flex:none}" +
      "#rbDone .rbcard b{display:block;font-size:1rem;line-height:1.2}" +
      "#rbDone .rbcard small{display:block;margin-top:4px;font-weight:800;color:#6B4FD0}" +
      "#rbDone .rbstars{font-weight:800;margin:6px 0}" +
      "#rbDone .rbstars span{display:inline-block;background:#FFF3C4;border-radius:999px;padding:3px 11px;margin:2px}" +
      "#rbDone .rbnext{font-weight:800;font-size:.95rem;margin:8px 0 12px}" +
      "#rbDone .rbbar{height:10px;border-radius:99px;background:#E4DCFA;overflow:hidden;margin:6px 6px 0}" +
      "#rbDone .rbbar i{display:block;height:100%;background:linear-gradient(90deg,#FFC93C,#FF8A3C);border-radius:99px}" +
      "#rbDone .rbbtn{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}" +
      "#rbDone button{border:0;border-radius:999px;font-weight:900;font-size:1rem;padding:12px 20px;cursor:pointer}" +
      "#rbDone .rbgo{background:#D93B1E;color:#fff;box-shadow:0 4px 0 #9E2810}" +
      "#rbDone .rbno{background:#EFEAFB;color:#3A2E6B}";
    document.head.appendChild(s);
  }

  function say(text) {
    var b = $("rbBubble");
    if (!b) return;
    b.textContent = text;
    b.className = "on";
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () {
      b.className = "";
    }, 2800);
  }
  function hop(face) {
    if (!rig) return;
    try {
      rig.play("hello");
      if (face) {
        rig.setFace(face);
        setTimeout(function () {
          try {
            rig.setFace("happy");
          } catch (e) {}
        }, 1600);
      }
    } catch (e) {}
  }
  function pickLine() {
    var list = LINES[cur.subject] || LINES.Fiction,
      i = Math.floor(Math.random() * list.length);
    if (i === lastLine) i = (i + 1) % list.length;
    lastLine = i;
    return list[i];
  }

  function tick() {
    var s = readFrame();
    if (!s || !cur) return;
    if (last) {
      if (s.p !== last.p && !celebrated) {
        flips++;
        hop("happy");
        if (s.p > 0 && flips % 3 === 1) say(pickLine());
      }
      var t;
      for (t in PART) {
        if (s.c && s.c[t] && !(last.c && last.c[t])) {
          hop("excited");
          say(PART[t]);
        }
      }
      if (s.c && s.c.vocabulary && !(last.c && last.c.vocabulary) && !celebrated) finish();
    }
    last = s;
  }

  /* ---- the ceremony ---- */
  function nextBadge() {
    var B = root.Badges;
    if (!B || !B.DEFS) return null;
    var books = 0,
      have = {},
      best = null;
    try {
      books = B.context().books || 0;
      have = B.earned() || {};
    } catch (e) {
      return null;
    }
    B.DEFS.forEach(function (d) {
      if (d.metric !== "books" || have[d.id] || books >= d.need) return;
      if (!best || d.need < best.need) best = d;
    });
    return best ? { def: best, books: books } : { done: true, books: books };
  }
  function nextBook() {
    var all = (cfg && cfg.all) || [],
      i,
      b,
      pool = [];
    for (i = 0; i < all.length; i++) {
      b = all[i];
      if (b.slug === cur.slug || (cfg.bookState(b.slug) || {}).fin) continue;
      if (b.subject === cur.subject && b.band === cur.band) pool.unshift(b);
      else if (b.band === cur.band) pool.push(b);
    }
    if (!pool.length) return null;
    // the next one in the same subject and band if there is one, in the order they are on the shelf
    var same = pool.filter(function (x) {
      return x.subject === cur.subject;
    });
    return same.length ? same[0] : pool[0];
  }
  function finish() {
    if (celebrated) return;
    celebrated = true;
    var res = null;
    try {
      res = cfg.settle ? cfg.settle() : null;
    } catch (e) {}
    // only the first time a book is finished gets the ceremony; doing it again just goes quietly on
    if (!res || !res.fresh) return;
    show(res);
  }

  function show(res) {
    var ov = $("readerOverlay"),
      bar = ov && ov.firstElementChild,
      old = $("rbDone");
    if (!ov) return;
    if (old) old.parentNode.removeChild(old);
    var toast = $("toast");
    if (toast) toast.classList.remove("on"); // the ceremony lists the same stars itself
    var nb = nextBadge(),
      nx = nextBook(),
      n = nb ? nb.books : 0,
      sj = cur.subject || "",
      lines = (res.lines || [])
        .map(function (l) {
          return "<span>+" + l[0] + " ★ " + esc(l[1]) + "</span>";
        })
        .join(""),
      prog = "";
    if (nb && nb.def) {
      var left = nb.def.need - nb.books;
      prog =
        '<div class="rbnext">' +
        left +
        (left === 1 ? " more book" : " more books") +
        " to earn " +
        esc(nb.def.name) +
        '<br><span style="opacity:.7">再读 ' +
        left +
        " 本得「" +
        esc(nb.def.cn) +
        "」</span>" +
        '<div class="rbbar"><i style="width:' +
        Math.round((100 * nb.books) / nb.def.need) +
        '%"></i></div></div>';
    } else if (nb && nb.done) {
      prog = '<div class="rbnext">You have every book badge! 所有读书徽章都拿到啦！</div>';
    }
    var wrap = document.createElement("div");
    wrap.id = "rbDone";
    wrap.style.top = (bar ? bar.offsetHeight : 0) + "px";
    wrap.innerHTML =
      '<div class="rbc" role="dialog" aria-label="Book finished">' +
      '<div class="rbpet" id="rbBig">' +
      (petInfo() ? "" : '<div style="font-size:64px">🏆</div>') +
      "</div>" +
      "<h2>Book finished!</h2><div class=\"rbcn\">读完啦，太棒了！</div>" +
      '<div class="rbcard"><img alt="" src="' +
      esc(cur.cover || "") +
      '"><div><b>' +
      esc(cur.title) +
      "</b><small>" +
      esc(sj) +
      " · your book #" +
      n +
      "</small></div></div>" +
      (lines ? '<div class="rbstars">' + lines + "</div>" : "") +
      prog +
      '<div class="rbbtn">' +
      (nx ? '<button class="rbgo" id="rbNext">Read next 下一本</button>' : "") +
      '<button class="rbno" id="rbHome">Back to books 回书架</button>' +
      '<button class="rbno" id="rbStay">Stay here</button></div></div>';
    ov.appendChild(wrap);
    $("rbHome").onclick = function () {
      cfg.close();
    };
    $("rbStay").onclick = function () {
      hideDone();
    };
    if (nx)
      $("rbNext").onclick = function () {
        hideDone();
        cfg.close();
        cfg.openReader(nx);
      };
    bigRig = mount($("rbBig"), 110, { face: "excited", still: reduced(), fps: 30 });
    if (bigRig) {
      var cheer = function () {
        try {
          bigRig.play("cheer");
        } catch (e) {}
      };
      setTimeout(cheer, 250);
      bigTimer = setInterval(cheer, 2400);
    }
    hop("excited");
    try {
      cfg.sfx();
    } catch (e) {}
  }
  function hideDone() {
    clearInterval(bigTimer);
    bigTimer = null;
    if (bigRig) {
      try {
        bigRig.stop();
      } catch (e) {}
      bigRig = null;
    }
    var d = $("rbDone");
    if (d && d.parentNode) d.parentNode.removeChild(d);
  }

  /* ---- start / stop ---- */
  function open(book) {
    stop();
    if (!cfg || !book) return;
    cur = book;
    celebrated = false;
    last = null;
    flips = 0;
    style();
    var bar = $("readerOverlay") && $("readerOverlay").firstElementChild;
    if (bar && petInfo()) {
      var w = document.createElement("span");
      w.id = "rbBuddy";
      w.innerHTML = '<span id="rbBubble"></span><span id="rbPet"></span>';
      bar.appendChild(w);
      rig = mount($("rbPet"), 44, { face: "happy", still: reduced(), fps: 30, hello: { first: 6, every: 11 } });
    }
    timer = setInterval(tick, 800);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
    clearTimeout(bubbleTimer);
    hideDone();
    if (rig) {
      try {
        rig.stop();
      } catch (e) {}
      rig = null;
    }
    var w = $("rbBuddy");
    if (w && w.parentNode) w.parentNode.removeChild(w);
    cur = null;
  }

  root.ReadingBuddy = {
    init: function (c) {
      cfg = c;
    },
    open: open,
    stop: stop,
    finishNow: finish,
    _tick: tick,
  };
})(typeof window !== "undefined" ? window : this);
