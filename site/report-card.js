/* Weekly report card: draws the parent report (ParentReport.summarize output) as one picture a parent can send to family or post.
   Nothing is uploaded: the picture is drawn on a canvas in the browser, then shown for saving / sharing.
   model() is pure (used by the node test); draw() paints that model on a canvas context.
   Written for old Android WebViews: no optional chaining, no spread, no let/const, no ctx.roundRect.
   中文说明：把家长报告画成一张可转发的图片，只在本机绘制，不上传任何数据。 */
(function (root) {
  "use strict";

  var W = 1080,
    H = 1350,
    DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function clean(s) {
    return String(s == null ? "" : s).replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  }

  // s = ParentReport.summarize(...); now = a Date (default: today)
  function model(name, s, now) {
    now = now || new Date();
    name = clean(name).slice(0, 24);
    var end = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6),
      range = MONTHS[start.getMonth()] + " " + start.getDate() + " – " + MONTHS[end.getMonth()] + " " + end.getDate(),
      week = [],
      i,
      d;
    for (i = 0; i < 7; i++) {
      d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (6 - i));
      week.push({ label: DAYS[(d.getDay() + 6) % 7], on: !!(s.week && s.week[i]) });
    }
    var quiz = s.quizPct === null || s.quizPct === undefined ? "–" : s.quizPct + "%";
    return {
      title: name ? name + "’s week" : "This week",
      titleCn: "本周战报",
      range: range,
      week: week,
      tiles: [
        { num: s.weekDays + " / 7", en: "days learned", zh: "学习天数" },
        { num: String(s.booksWeek), en: "books read", zh: "读的书" },
        { num: String(s.streak), en: "day streak", zh: "连续天数" },
        { num: quiz, en: "right first time", zh: "一次答对" },
      ],
      total: s.booksFinished + " books finished · " + s.stars + " stars earned",
      totalCn: "累计读完 " + s.booksFinished + " 本书 · 获得 " + s.stars + " 颗星",
      recent: (s.recent || []).slice(0, 3).map(function (r) {
        return clean(r.title);
      }),
      empty: !!s.empty,
    };
  }

  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function fit(c, text, max) {
    var t = text;
    if (c.measureText(t).width <= max) return t;
    while (t.length > 1 && c.measureText(t + "…").width > max) t = t.slice(0, -1);
    return t + "…";
  }

  function draw(c, m) {
    var SANS = "'Fredoka','Nunito',ui-rounded,'Trebuchet MS',Arial,'PingFang SC','Microsoft YaHei',sans-serif",
      TXT = "'Nunito',-apple-system,'PingFang SC','Microsoft YaHei',Arial,sans-serif",
      i,
      g;
    g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#BFE6FF");
    g.addColorStop(1, "#FFE9B0");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.fillStyle = "#FFD96B";
    c.beginPath();
    c.arc(W - 40, 40, 230, 0, Math.PI * 2);
    c.fill();

    // brand
    c.save();
    c.translate(110, 105);
    c.rotate(-0.1);
    c.fillStyle = "#E0A800";
    rr(c, -40, -34, 80, 80, 26);
    c.fill();
    c.fillStyle = "#FFC93C";
    rr(c, -40, -40, 80, 80, 26);
    c.fill();
    c.fillStyle = "#1E2A4A";
    c.font = "700 50px " + SANS;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("L", 0, 3);
    c.restore();
    c.textAlign = "left";
    c.textBaseline = "alphabetic";
    c.fillStyle = "#1E2A4A";
    c.font = "700 36px " + SANS;
    c.fillText("learning-english-fun.com", 172, 108);
    c.font = "800 22px " + TXT;
    c.fillStyle = "#4A5878";
    c.fillText("Read · Think · Discover", 172, 140);

    // card
    c.fillStyle = "rgba(30,42,74,.12)";
    rr(c, 60, 206, W - 120, 1075, 56);
    c.fill();
    c.fillStyle = "#FFFFFF";
    rr(c, 60, 190, W - 120, 1075, 56);
    c.fill();

    c.fillStyle = "#1E2A4A";
    c.font = "700 76px " + SANS;
    c.fillText(fit(c, m.title, W - 240), 110, 300);
    c.font = "800 32px " + TXT;
    c.fillStyle = "#4A5878";
    c.fillText(m.titleCn + " · " + m.range, 110, 352);

    // week dots
    var gap = (W - 220) / 7;
    for (i = 0; i < 7; i++) {
      var cx = 110 + gap * i + gap / 2;
      c.fillStyle = m.week[i].on ? "#35B779" : "#E6EEF7";
      c.beginPath();
      c.arc(cx, 440, 36, 0, Math.PI * 2);
      c.fill();
      if (m.week[i].on) {
        c.strokeStyle = "#fff";
        c.lineWidth = 8;
        c.lineCap = "round";
        c.lineJoin = "round";
        c.beginPath();
        c.moveTo(cx - 14, 441);
        c.lineTo(cx - 3, 453);
        c.lineTo(cx + 16, 428);
        c.stroke();
      }
      c.fillStyle = "#4A5878";
      c.font = "800 24px " + TXT;
      c.textAlign = "center";
      c.fillText(m.week[i].label, cx, 505);
    }

    // four tiles
    var tw = (W - 220 - 24) / 2,
      th = 190,
      tx,
      ty;
    for (i = 0; i < 4; i++) {
      tx = 110 + (i % 2) * (tw + 24);
      ty = 550 + Math.floor(i / 2) * (th + 24);
      c.fillStyle = "#F3F8F4";
      rr(c, tx, ty, tw, th, 36);
      c.fill();
      c.textAlign = "center";
      c.fillStyle = "#1E2A4A";
      c.font = "700 84px " + SANS;
      c.fillText(m.tiles[i].num, tx + tw / 2, ty + 95);
      c.fillStyle = "#4A5878";
      c.font = "800 26px " + TXT;
      c.fillText(m.tiles[i].en + " · " + m.tiles[i].zh, tx + tw / 2, ty + 148);
    }

    // totals + recent
    c.textAlign = "left";
    c.fillStyle = "#1E2A4A";
    c.font = "800 30px " + TXT;
    c.fillText(m.total, 110, 1005);
    c.fillStyle = "#4A5878";
    c.font = "700 26px " + TXT;
    c.fillText(m.totalCn, 110, 1044);
    if (m.recent.length) {
      c.fillStyle = "#35B779";
      c.font = "800 24px " + TXT;
      c.fillText("RECENT BOOKS 最近读的书", 110, 1100);
      c.fillStyle = "#1E2A4A";
      c.font = "700 30px " + TXT;
      for (i = 0; i < m.recent.length; i++) c.fillText(fit(c, "• " + m.recent[i], W - 240), 110, 1144 + i * 40);
    }

    // footer
    c.textAlign = "center";
    c.fillStyle = "#1E2A4A";
    c.font = "800 30px " + TXT;
    c.fillText("Read with us 一起来读书 · learning-english-fun.com", W / 2, 1322);
  }

  // returns a canvas, or null when canvas is not available
  function render(name, s, now) {
    if (typeof document === "undefined") return null;
    var cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    var c = cv.getContext && cv.getContext("2d");
    if (!c) return null;
    draw(c, model(name, s, now));
    return cv;
  }

  var api = { model: model, draw: draw, render: render, W: W, H: H };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ReportCard = api;
})(typeof window !== "undefined" ? window : this);
