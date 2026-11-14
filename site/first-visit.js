/* First screen for a brand-new visitor: one big action ("read today's story") instead of four tiles plus a search bar.
   A visitor counts as new when this browser holds no pet, no opened or finished book and no sight-word progress.
   The moment they open a book the normal home (pet, sight words, review, search) comes back by itself.
   Written for old Android WebViews: no optional chaining, no spread, no let/const.
   中文说明：第一次来的访客首屏只放一个大按钮"马上读一本"；读过书、领养过宠物后就恢复完整首页。 */
(function (root) {
  "use strict";

  function readJ(k, d) {
    try {
      var v = JSON.parse(root.localStorage.getItem(k));
      return v == null ? d : v;
    } catch (e) {
      return d;
    }
  }
  function hasKeys(o) {
    var k;
    if (o && typeof o === "object") for (k in o) return true;
    return false;
  }
  // read(key, fallback) -> parsed value; injectable for the node test
  function isNew(read) {
    var pet = read("lef_pet_v1", null),
      opens = read("lef_opens_v1", []),
      books = read("lef_books_v1", {}),
      words = read("lef_words_v1", null),
      hist = read("lef_hist_v1", []),
      k;
    if (pet && pet.type) return false;
    if (opens && opens.length) return false;
    if (hist && hist.length) return false;
    if (hasKeys(books)) for (k in books) if (books[k] && (books[k].fin || books[k].listen || books[k].vocab || books[k].quiz)) return false;
    if (words && hasKeys(words.words)) return false;
    return true;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function css() {
    var d = root.document;
    if (d.getElementById("fvStyle")) return;
    var s = d.createElement("style");
    s.id = "fvStyle";
    s.textContent =
      "#top.fv .hbtns,#top.fv #findBar{display:none}" +
      "#fvCta{display:flex;flex-direction:column;align-items:flex-start;gap:14px;max-width:560px;width:100%}" +
      "#fvGo{display:flex;align-items:center;justify-content:center;gap:12px;border:0;cursor:pointer;font:inherit;background:#D93B1E;color:#fff;font-weight:900;font-size:24px;line-height:1.1;padding:20px 38px;border-radius:999px;box-shadow:0 7px 0 #9E2810;transition:transform .12s,box-shadow .12s}" +
      "#fvGo:hover{transform:translateY(2px);box-shadow:0 5px 0 #9E2810}#fvGo:active{transform:translateY(6px);box-shadow:0 1px 0 #9E2810}" +
      "#fvGo small{display:block;font-size:15px;font-weight:800;opacity:.92}" +
      "#fvBook{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.78);border-radius:20px;padding:8px 16px 8px 8px;font-weight:800;color:#1E2A4A;max-width:100%;box-sizing:border-box}" +
      "#fvBook img{width:76px;height:56px;object-fit:cover;border-radius:12px;flex:none;border:3px solid #fff}" +
      "#fvBook b{display:block;font-size:16px;line-height:1.2}#fvBook span{display:block;font-size:13px;color:#4A5878;font-weight:700}" +
      "#fvMore{font-weight:800;font-size:15px;color:#33415F;line-height:1.7}#fvMore a{color:#2F4FD0;text-decoration:underline;white-space:nowrap}" +
      "@media(max-width:720px){#fvGo{width:100%;box-sizing:border-box;font-size:21px;padding:18px 20px}}";
    d.head.appendChild(s);
  }

  function render() {
    var d = root.document,
      top = d && d.getElementById("top");
    if (!top || d.getElementById("fvCta") || !isNew(readJ)) return false;
    var t = null,
      b = null;
    try {
      t = root.todayBook ? root.todayBook() : null;
      b = t && t.book;
    } catch (e) {}
    if (!b || !b.file || !root.openReader) return false;
    css();
    var host = top.querySelector(".hbtns");
    if (!host || !host.parentNode) return false;
    var box = d.createElement("div");
    box.id = "fvCta";
    box.innerHTML =
      '<button type="button" id="fvGo"><span>Read a story now<small>马上读一本</small></span><span aria-hidden="true">→</span></button>' +
      '<div id="fvBook">' + (b.cover ? '<img alt="" src="' + esc(b.cover) + '">' : "") + "<div><b>" + esc(b.title) + "</b><span>" +
      esc([t.subject, b.grade, b.minutes].filter(Boolean).join(" · ")) + " · read-aloud 朗读</span></div></div>" +
      '<div id="fvMore">Not sure where to start? <a data-level href="#level">Find my level 测阅读水平</a> · <a data-find href="#find">Find a book 找书</a> · <a href="#topics">Browse shelves 看书架</a></div>';
    host.parentNode.insertBefore(box, host);
    top.className = (top.className ? top.className + " " : "") + "fv";
    d.getElementById("fvGo").onclick = function () {
      // the normal home comes back as soon as they start a book
      top.className = top.className.replace(/\s*\bfv\b/, "");
      if (box.parentNode) box.parentNode.removeChild(box);
      root.openReader(b);
    };
    return true;
  }

  function start() {
    // wait until the page's own scripts have built the book list and the hero
    var tries = 0,
      h = root.setInterval(function () {
        tries++;
        if (render() || tries > 40) root.clearInterval(h);
      }, 150);
  }

  var api = { isNew: isNew, render: render };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.FirstVisit = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})(typeof window !== "undefined" ? window : this);
