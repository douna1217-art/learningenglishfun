/* Book finder: one place to search every book and narrow them down by subject, grade, reading level and reading time.
   Opened from the "Find a book" bar on the homepage; it is a full-screen layer under the reader, so closing a book
   brings the child back to the same results. Nothing is stored and nothing is sent anywhere.
   Input is the homepage's ALL list: {slug,title,subtitle,grade,band,minutes,subject,id,cover,file}.
   The pure part (filterBooks) is also used by the node tests.
   Written for old Android WebViews: no optional chaining, no spread, no let/const needed.
   中文说明：找书页可以按标题搜索，也可以按学科、年级、阅读水平、阅读时长筛选。 */
(function (root) {
  "use strict";

  var PAGE = 36;
  var LEVELS = [
    ["Beginning Reader", "Beginning", "初级"],
    ["Early Reader", "Early", "早期"],
    ["Growing Reader", "Growing", "成长"],
    ["Fluent Reader", "Fluent", "流利"],
  ];
  var GRADES = [
    ["Kindergarten", "K", "幼儿园"],
    ["Grade 1", "1", "一年级"],
    ["Grade 2", "2", "二年级"],
    ["Grade 3", "3", "三年级"],
    ["Grade 4", "4", "四年级"],
    ["Grade 5", "5", "五年级"],
    ["Grade 6", "6", "六年级"],
  ];
  var TIMES = [
    ["short", "Short", "短", 0, 7],
    ["medium", "Medium", "中等", 8, 10],
    ["long", "Long", "较长", 11, 999],
  ];
  var SUBJECT_CN = { Fiction: "故事", Science: "科学", Math: "数学", SEL: "情感", "Social Studies": "社会", "Computer Science": "计算机" };

  function minutesOf(b) {
    return parseInt(String(b.minutes || "").replace(/[^\d]/g, ""), 10) || 0;
  }
  function gradeRank(g) {
    return /kindergarten/i.test(g) ? 0 : parseInt((String(g).match(/\d+/) || [])[0], 10) || 0;
  }

  /* f: {q, subject, grade, band, time, fresh, mine}; ctx: {seen: {slug:1}, myGrade: "Grade 3"} -> sorted list */
  function filterBooks(all, f, ctx) {
    f = f || {};
    ctx = ctx || {};
    var q = String(f.q || "").toLowerCase().replace(/\s+/g, " ").trim(),
      words = q ? q.split(" ") : [],
      tm = null,
      out = [];
    TIMES.forEach(function (t) {
      if (t[0] === f.time) tm = t;
    });
    all.forEach(function (b) {
      if (f.subject && b.subject !== f.subject) return;
      if (f.grade && b.grade !== f.grade) return;
      if (f.band && b.band !== f.band) return;
      if (tm) {
        var m = minutesOf(b);
        if (m < tm[3] || m > tm[4]) return;
      }
      if (f.fresh && ctx.seen && ctx.seen[b.slug]) return;
      if (f.mine && ctx.myGrade && b.grade !== ctx.myGrade) return;
      var score = 0;
      if (words.length) {
        var t = String(b.title || "").toLowerCase(),
          s = String(b.subtitle || "").toLowerCase(),
          sj = String(b.subject || "").toLowerCase();
        for (var i = 0; i < words.length; i++) {
          var w = words[i];
          if (t.indexOf(w) > -1) score += 3;
          else if (s.indexOf(w) > -1) score += 1;
          else if (sj.indexOf(w) > -1) score += 1;
          else return; // every word has to be found somewhere
        }
      }
      out.push({ b: b, score: score, i: out.length });
    });
    out.sort(function (x, y) {
      if (y.score !== x.score) return y.score - x.score;
      var gx = gradeRank(x.b.grade),
        gy = gradeRank(y.b.grade);
      if (gx !== gy) return gx - gy;
      return x.i - y.i;
    });
    return out.map(function (x) {
      return x.b;
    });
  }

  var api = { filterBooks: filterBooks, minutesOf: minutesOf, GRADES: GRADES, LEVELS: LEVELS, TIMES: TIMES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.BookFinder = api;
  if (typeof document === "undefined" || !root.document) return;

  /* ------------------------------------------------------------------ screen */
  var doc = root.document,
    el = null,
    shown = PAGE,
    fOpen = null,
    f = { q: "", subject: "", grade: "", band: "", time: "", fresh: false, mine: false };

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function readJ(k, d) {
    try {
      var v = JSON.parse(root.localStorage.getItem(k));
      return v === null || v === undefined ? d : v;
    } catch (e) {
      return d;
    }
  }
  function ctx() {
    var seen = {},
      B = readJ("lef_books_v1", {}),
      H = readJ("lef_hist_v1", []),
      k,
      P = readJ("les_placement_v1", null);
    for (k in B) if (B[k] && (B[k].fin || B[k].listen || B[k].quiz)) seen[k] = 1;
    (Array.isArray(H) ? H : []).forEach(function (h) {
      if (h && h.slug) seen[h.slug] = 1;
    });
    return { seen: seen, myGrade: P && P.primaryGrade ? P.primaryGrade : "" };
  }
  function css() {
    if (doc.getElementById("bfStyle")) return;
    var s = doc.createElement("style");
    s.id = "bfStyle";
    s.textContent =
      "#bfLayer{position:fixed;inset:0;z-index:1500;background:#F4FAFF;overflow:auto;-webkit-overflow-scrolling:touch;color:#1E2A4A;font-family:Nunito,ui-rounded,'Trebuchet MS',Arial,sans-serif}" +
      "#bfLayer .bfw{max-width:1100px;margin:0 auto;padding:16px max(16px,env(safe-area-inset-left,0px)) 60px}" +
      "#bfLayer .bfh{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}" +
      "#bfLayer h2{margin:0;font-family:Fredoka,ui-rounded,'Trebuchet MS',Arial,sans-serif;font-size:30px;line-height:1.1}" +
      "#bfLayer h2 small{font-size:17px;color:#4A5878;font-weight:800}" +
      "#bfLayer .bfback{border:0;border-radius:999px;background:#fff;box-shadow:0 4px 0 #C9D7E8;padding:9px 16px;font:inherit;font-weight:800;color:inherit;cursor:pointer}" +
      "#bfLayer .bfq{width:100%;box-sizing:border-box;border:3px solid #6AA7FF;border-radius:999px;padding:12px 18px;font:inherit;font-weight:800;font-size:17px;color:inherit;background:#fff;outline:none}" +
      "#bfLayer .bfq:focus{border-color:#2F6FD6}" +
      "#bfLayer .bfd{margin-top:10px}#bfLayer .bfd summary{cursor:pointer;font-weight:900;font-size:15px;padding:6px 2px;color:#2F6FD6;list-style:revert}" +
      "#bfLayer .bfg{margin:12px 0 0}#bfLayer .bfl{font-size:12px;font-weight:800;color:#4A5878;margin:0 0 5px}" +
      "#bfLayer .bfc{display:flex;flex-wrap:wrap;gap:6px}" +
      "#bfLayer .bfc button{border:2px solid #dfe8e1;border-radius:999px;padding:6px 13px;background:#fff;font:inherit;font-weight:800;font-size:14px;color:inherit;cursor:pointer;line-height:1.2}" +
      "#bfLayer .bfc button[aria-pressed=true]{border-color:#35B779;background:#E8F7EE}" +
      "#bfLayer .bfc button small{font-size:11px;color:#4A5878;font-weight:700;margin-left:3px}" +
      "#bfLayer .bfn{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:16px 0 10px;font-weight:800}" +
      "#bfLayer .bfn button{border:0;background:none;font:inherit;font-weight:800;color:#2F6FD6;cursor:pointer;text-decoration:underline}" +
      "#bfLayer .bfgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:16px}" +
      "#bfLayer .bfcard{position:relative;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 7px 0 #C9D7E8;transition:transform .15s;border:0;padding:0;text-align:left;cursor:pointer;font:inherit;color:inherit;display:flex;flex-direction:column}" +
      "#bfLayer .bfcard img,#bfLayer .bfcard .bfnoimg{width:100%;aspect-ratio:700/520;object-fit:cover;display:block;background:#E6EEF7}" +
      "#bfLayer .bfcard:hover{transform:translateY(-5px)}#bfLayer .bfcard .bft{padding:11px 14px 14px;font-family:Fredoka,ui-rounded,'Trebuchet MS',Arial,sans-serif;font-weight:700;font-size:17px;line-height:1.15}" +
      "#bfLayer .bfcard .bft small{display:block;font-family:Nunito,ui-rounded,Arial,sans-serif;font-size:12.5px;color:#4A5878;font-weight:800;margin-top:5px}#bfLayer .bfcard .bfok{position:absolute;right:10px;top:10px;background:#35B779;color:#fff;border-radius:999px;padding:4px 12px;font-weight:800;font-size:12px;box-shadow:0 3px 0 #1F7F50}" +
      "#bfLayer .bfmore{display:block;margin:22px auto 0;border:0;border-radius:999px;background:#6A48E8;color:#fff;box-shadow:0 5px 0 #4A2FB8;padding:12px 26px;font:inherit;font-weight:900;cursor:pointer}" +
      "#bfLayer .bfempty{text-align:center;padding:40px 10px;font-weight:800;color:#4A5878;line-height:1.6}" +
      "@media(max-width:520px){#bfLayer h2{font-size:24px}#bfLayer .bfgrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}}";
    doc.head.appendChild(s);
  }
  function chips(name, opts, cur) {
    // opts: [[value, label, cn]]
    return opts
      .map(function (o) {
        return '<button type="button" data-f="' + name + '" data-v="' + esc(o[0]) + '" aria-pressed="' + (cur === o[0]) + '">' + esc(o[1]) + (o[2] ? "<small>" + esc(o[2]) + "</small>" : "") + "</button>";
      })
      .join("");
  }
  function subjects(all) {
    var seen = {},
      out = [];
    all.forEach(function (b) {
      if (b.subject && !seen[b.subject]) {
        seen[b.subject] = 1;
        out.push(b.subject);
      }
    });
    return out;
  }

  function draw(keepFocus) {
    var all = root.ALL || [],
      c = ctx(),
      list = filterBooks(all, f, c),
      anyFilter = !!(f.q || f.subject || f.grade || f.band || f.time || f.fresh || f.mine);
    var sjOpts = [["", "All 全部", ""]].concat(
      subjects(all).map(function (s) {
        return [s, s, SUBJECT_CN[s] || ""];
      })
    );
    var grOpts = [["", "All 全部", ""]].concat(
      GRADES.map(function (g) {
        return [g[0], g[1], g[2]];
      })
    );
    var lvOpts = [["", "All 全部", ""]].concat(
      LEVELS.map(function (l) {
        return [l[0], l[1], l[2]];
      })
    );
    var tmOpts = [["", "Any 不限", ""]].concat(
      TIMES.map(function (t) {
        return [t[0], t[1], t[2]];
      })
    );
    var quick = '<button type="button" data-t="fresh" aria-pressed="' + f.fresh + '">Not read yet<small>没读过的</small></button>';
    if (c.myGrade) quick += '<button type="button" data-t="mine" aria-pressed="' + f.mine + '">Right for me<small>适合我 · ' + esc(c.myGrade) + "</small></button>";
    var body;
    if (!list.length)
      body = '<div class="bfempty">No books found. Try taking one filter away.<br>没找到书，试试去掉一个筛选。</div>';
    else
      body =
        '<div class="bfgrid">' +
        list
          .slice(0, shown)
          .map(function (b, i) {
            return (
              '<button type="button" class="bfcard" data-i="' + i + '">' +
              (b.cover ? '<img loading="lazy" src="' + esc(b.cover) + '" alt="' + esc(b.title) + ' cover">' : '<div class="bfnoimg"></div>')  +
              '<div class="bft">' + esc(b.title) + "<small>" + esc(b.grade) + " · " + esc(b.minutes) + (c.seen[b.slug] ? ' · <span style="color:#1F7F50">&#10003; Opened 看过</span>' : "") + "</small></div></button>"
            );
          })
          .join("") +
        "</div>" +
        (list.length > shown ? '<button type="button" class="bfmore" id="bfMore">Show more 再看一些</button>' : "");
    if (fOpen === null) fOpen = (root.innerWidth || 1024) > 520;
    var nAct = (f.subject ? 1 : 0) + (f.grade ? 1 : 0) + (f.band ? 1 : 0) + (f.time ? 1 : 0) + (f.fresh ? 1 : 0) + (f.mine ? 1 : 0);
    el.innerHTML =
      '<div class="bfw"><div class="bfh"><button type="button" class="bfback" id="bfBack">&larr; Back 返回</button><h2>Find a book <small>找书</small></h2></div>' +
      '<input class="bfq" id="bfQ" type="search" placeholder="Search by title 按书名搜索" autocomplete="off" value="' + esc(f.q) + '">' +
      '<details class="bfd" id="bfD"' + (fOpen ? " open" : "") + '><summary>Filters 筛选' + (nAct ? " · " + nAct : "") + '</summary>' +
      '<div class="bfg"><p class="bfl">Quick 快速选择</p><div class="bfc">' + quick + "</div></div>" +
      '<div class="bfg"><p class="bfl">Subject 学科</p><div class="bfc">' + chips("subject", sjOpts, f.subject) + "</div></div>" +
      '<div class="bfg"><p class="bfl">Grade 年级</p><div class="bfc">' + chips("grade", grOpts, f.grade) + "</div></div>" +
      '<div class="bfg"><p class="bfl">Reading level 阅读水平</p><div class="bfc">' + chips("band", lvOpts, f.band) + "</div></div>" +
      '<div class="bfg"><p class="bfl">Reading time 阅读时间</p><div class="bfc">' + chips("time", tmOpts, f.time) + "</div></div></details>" +
      '<div class="bfn"><span>' + list.length + " book" + (list.length === 1 ? "" : "s") + " 本书</span>" + (anyFilter ? '<button type="button" id="bfClear">Clear filters 清除筛选</button>' : "") + "</div>" +
      body +
      "</div>";
    bind(list);
    if (keepFocus) {
      var nq = doc.getElementById("bfQ");
      if (nq) {
        nq.focus();
        try {
          nq.setSelectionRange(nq.value.length, nq.value.length);
        } catch (e) {}
      }
    }
  }
  function bind(list) {
    doc.getElementById("bfBack").onclick = close;
    doc.getElementById("bfD").ontoggle = function () {
      fOpen = this.open;
    };
    var q = doc.getElementById("bfQ");
    q.oninput = function () {
      f.q = q.value;
      shown = PAGE;
      draw(true);
    };
    Array.prototype.forEach.call(el.querySelectorAll("[data-f]"), function (b) {
      b.onclick = function () {
        f[b.getAttribute("data-f")] = b.getAttribute("data-v");
        shown = PAGE;
        draw();
      };
    });
    Array.prototype.forEach.call(el.querySelectorAll("[data-t]"), function (b) {
      b.onclick = function () {
        var k = b.getAttribute("data-t");
        f[k] = !f[k];
        shown = PAGE;
        draw();
      };
    });
    var cl = doc.getElementById("bfClear");
    if (cl)
      cl.onclick = function () {
        f = { q: "", subject: "", grade: "", band: "", time: "", fresh: false, mine: false };
        shown = PAGE;
        draw();
      };
    var more = doc.getElementById("bfMore");
    if (more)
      more.onclick = function () {
        var y = el.scrollTop;
        shown += PAGE;
        draw();
        el.scrollTop = y;
      };
    Array.prototype.forEach.call(el.querySelectorAll(".bfcard"), function (b) {
      b.onclick = function () {
        var bk = list[+b.getAttribute("data-i")];
        if (!bk) return;
        if (root.noteOpen) root.noteOpen(bk);
        if (root.openReader) root.openReader(bk);
      };
    });
  }
  function onKey(e) {
    if (e.key === "Escape" && el && doc.getElementById("readerOverlay") && doc.getElementById("readerOverlay").style.display !== "flex") close();
  }
  function open() {
    css();
    if (!el) {
      el = doc.createElement("div");
      el.id = "bfLayer";
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-label", "Find a book");
      doc.body.appendChild(el);
      doc.addEventListener("keydown", onKey);
    }
    el.style.display = "block";
    doc.documentElement.style.overflow = "hidden";
    draw();
    el.scrollTop = 0;
  }
  function close() {
    if (el) el.style.display = "none";
    doc.documentElement.style.overflow = "";
    if (root.renderBotd) root.renderBotd();
  }
  api.open = open;
  api.close = close;

  doc.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-find]") : null;
    if (t) {
      e.preventDefault();
      open();
    }
  });
})(typeof window !== "undefined" ? window : this);
