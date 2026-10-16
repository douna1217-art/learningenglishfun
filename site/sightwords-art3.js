/* More little pictures for the stage-3 sight words (the castle kingdom): farm animals, things at home, in town, in the weather, at parties.
   It adds new kinds of things and one scene per word to sightwords-art.js (SWArt.extend), in the same soft look, all drawn in code.
   A scene is a list of items [kind, x, y, scale, options] on a 240 x 160 picture; the ground is at about y = 134.
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";
  var A = root.SWArt;
  if (!A && typeof require === "function") {
    try {
      A = require("./sightwords-art.js"); // under Node (the tests) the two files do not share a global
    } catch (e) {}
  }
  if (!A || !A.extend || !A.h) return;
  var h = A.h, C = h.C, f = h.f, ln = h.ln, path = h.path, dk = h.dk, INK = h.INK, lum = h.lum, star = h.star, render = h.render, X = h.X;
  var G = h.G, kb = h.kb, kg = h.kg, ky = h.ky, kr = h.kr;
  var FONT = "Fredoka,Nunito,sans-serif";

  /* ------------------------------------------------------------------ animals (side view, facing right, standing on y = 0) */
  function hoof(x, y) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="4.4" ry="2.2" fill="#4A4038" stroke="#2B2420" stroke-width="1"/>';
  }
  function cow(o) {
    var w = "#FFFFFF", sp = "#3A3F4D", s = "", lg = "#EDE8F5";
    s += ln(-16, -20, -17, -3, 6.4, dk(lg, 0.08)) + ln(11, -20, 10, -3, 6.4, dk(lg, 0.08)) + hoof(-17, -1.5) + hoof(10, -1.5);
    s += '<path d="M-27 -34 Q-35 -30 -33 -14" fill="none" stroke="' + dk(w) + '" stroke-width="4.4" stroke-linecap="round"/><path d="M-33 -14 L-36 -8 L-30 -9Z" fill="' + sp + '"/>';
    s += '<ellipse cx="0" cy="-28" rx="27" ry="15" ' + f(w) + '/><path d="M-14 -38 Q-6 -42 -2 -34 Q-8 -28 -15 -32Z M8 -26 Q16 -30 20 -22 Q14 -16 7 -19Z M-20 -24 Q-14 -26 -12 -20 Q-16 -15 -21 -18Z" fill="' + sp + '"/>';
    s += '<ellipse cx="-8" cy="-15" rx="6.4" ry="4.4" ' + f("#FFB3C7", 1.8) + "/>";
    s += ln(-9, -20, -10, -3, 6.4, lg) + ln(17, -20, 17, -3, 6.4, lg) + hoof(-10, -1.5) + hoof(17, -1.5);
    s += '<g transform="translate(29,-40)"><path d="M-6 -9 L-9 -17 L-3 -12Z M2 -10 L5 -18 L8 -11Z" ' + f("#F2E2B8", 1.6) + '/><ellipse cx="-9" cy="-3" rx="6" ry="3.2" transform="rotate(24 -9 -3)" ' + f(w, 1.8) + "/>";
    s += '<ellipse cx="0" cy="0" rx="13" ry="11.5" ' + f(w) + '/><path d="M-12 -4 Q-6 -10 -3 -3 Q-7 3 -12 1Z" fill="' + sp + '"/><ellipse cx="7" cy="6" rx="8.4" ry="6" ' + f("#FFB3C7", 1.8) + '/><ellipse cx="4.6" cy="6" rx="1.3" ry="1.8" fill="#C0577F"/><ellipse cx="10" cy="6" rx="1.3" ry="1.8" fill="#C0577F"/>';
    s += '<ellipse cx="3" cy="-3" rx="2" ry="2.5" fill="' + INK + '"/><circle cx="3.6" cy="-4" r=".8" fill="#fff"/></g>';
    return s;
  }
  function pig(o) {
    var b = "#FFB3C7", s = "", d = dk(b, 0.1);
    s += ln(-13, -14, -14, -2, 6.4, d) + ln(11, -14, 11, -2, 6.4, d);
    s += '<path d="M-22 -26 Q-30 -30 -27 -35 Q-22 -38 -24 -32 Q-20 -33 -23 -28" fill="none" stroke="' + dk(b, 0.3) + '" stroke-width="3" stroke-linecap="round"/>';
    s += '<ellipse cx="0" cy="-24" rx="24" ry="15.5" ' + f(b) + '/><ellipse cx="-4" cy="-17" rx="14" ry="6" fill="#FFD0DE" opacity=".7"/>' + ln(-7, -14, -7, -2, 6.4, b) + ln(17, -14, 17, -2, 6.4, b);
    s += '<g transform="translate(26,-31)"><path d="M-9 -9 Q-14 -17 -5 -16Z" ' + f("#FF8FB1", 1.8) + '/><path d="M2 -11 Q5 -20 11 -14Z" ' + f("#FF8FB1", 1.8) + '/><circle cx="0" cy="0" r="12.5" ' + f(b) + '/>';
    s += '<ellipse cx="9" cy="3" rx="6.8" ry="5.6" ' + f("#FF8FB1", 1.8) + '/><ellipse cx="7.4" cy="3" rx="1.2" ry="1.9" fill="#A83A62"/><ellipse cx="11.2" cy="3" rx="1.2" ry="1.9" fill="#A83A62"/><ellipse cx="1.6" cy="-4" rx="2" ry="2.5" fill="' + INK + '"/><circle cx="2.2" cy="-5" r=".8" fill="#fff"/><circle cx="-3.4" cy="3" r="2.6" fill="#FF8FB1" opacity=".6"/></g>';
    return s;
  }
  function sheep(o) {
    var w = "#FFFFFE", wl = "#B9C2D6", fc = "#5C4A3F", s = "";
    s += ln(-12, -14, -12, -2, 4.4, "#4A3F3A") + ln(10, -14, 10, -2, 4.4, "#4A3F3A") + hoof(-12, -1) + hoof(10, -1);
    var P = [[-17, -26, 11], [-5, -34, 12], [9, -33, 12], [19, -25, 10], [-10, -19, 11], [4, -19, 12], [14, -17, 9]];
    for (var i = 0; i < P.length; i++) s += '<circle cx="' + P[i][0] + '" cy="' + P[i][1] + '" r="' + P[i][2] + '" ' + f(w, 2) + "/>";
    s += '<circle cx="-2" cy="-26" r="14" fill="' + w + '"/>' + ln(-6, -14, -6, -2, 4.4, "#4A3F3A") + ln(16, -14, 16, -2, 4.4, "#4A3F3A") + hoof(-6, -1) + hoof(16, -1);
    s += '<g transform="translate(27,-30)"><ellipse cx="-6" cy="-2" rx="6" ry="3" transform="rotate(30 -6 -2)" ' + f(fc, 1.8) + '/><ellipse cx="0" cy="0" rx="9" ry="10" ' + f(fc, 2) + '/><circle cx="-1" cy="-9" r="5.4" ' + f(w, 1.8) + '/><circle cx="3" cy="-3" r="1.6" fill="#fff"/><circle cx="3.3" cy="-3" r=".9" fill="' + INK + '"/><ellipse cx="6" cy="3" rx="2.6" ry="1.8" fill="#8A7060"/></g>';
    return s;
  }
  function horse(o) {
    var b = o.c || "#B9743A", d = dk(b, 0.22), mane = "#4A2E1A", s = "";
    s += ln(-18, -34, -20, -4, 6, d) + ln(12, -34, 13, -4, 6, d) + hoof(-20, -2) + hoof(13, -2);
    s += '<path d="M-27 -44 Q-40 -42 -38 -22 Q-34 -34 -27 -36Z" ' + f(mane, 1.8) + '/><ellipse cx="-2" cy="-40" rx="28" ry="14" ' + f(b) + "/>";
    s += ln(-10, -34, -11, -4, 6, b) + ln(21, -34, 21, -4, 6, b) + hoof(-11, -2) + hoof(21, -2);
    s += '<path d="M12 -48 Q22 -52 26 -66 L38 -66 Q36 -54 30 -40 Q22 -36 12 -38Z" ' + f(b, 2.4) + '/><path d="M18 -52 Q24 -54 25 -64 Q20 -60 14 -56Z" ' + f(mane, 1.6) + "/>";
    s += '<g transform="translate(36,-69) rotate(-12)"><path d="M-9 -8 L-8 -17 L-3 -9Z" ' + f(b, 1.8) + '/><ellipse cx="0" cy="0" rx="12" ry="7.6" ' + f(b, 2.4) + '/><ellipse cx="8" cy="2" rx="6" ry="5.2" ' + f("#E0B890", 1.8) + '/><ellipse cx="9.6" cy="2" rx="1" ry="1.5" fill="#6B4A2E"/><ellipse cx="-2" cy="-2" rx="1.8" ry="2.2" fill="' + INK + '"/><path d="M-11 -4 Q-14 4 -10 8 Q-6 4 -7 -3Z" ' + f(mane, 1.4) + "/></g>";
    return s;
  }
  function chicken(o) {
    var b = o.c || "#FFFFFE", s = "";
    s += ln(-3, -12, -4, -1, 2.6, "#F5A12E") + ln(5, -12, 6, -1, 2.6, "#F5A12E") + '<path d="M-10 0 L-4 -1 L0 0 M0 0 L6 -1 L11 0" fill="none" stroke="#F5A12E" stroke-width="2.4" stroke-linecap="round"/>';
    s += '<path d="M-14 -22 Q-30 -26 -28 -40 Q-20 -34 -12 -30Z M-14 -18 Q-32 -18 -33 -30 Q-24 -26 -13 -24Z" ' + f(dk(b, 0.12), 1.8) + '/><ellipse cx="0" cy="-22" rx="18" ry="15" ' + f(b) + '/><path d="M-6 -24 Q4 -14 14 -26 Q8 -34 -2 -32Z" ' + f(dk(b, 0.14), 1.8) + "/>";
    s += '<g transform="translate(13,-41)"><circle cx="0" cy="0" r="9.4" ' + f(b) + '/><path d="M-5 -8 Q-4 -15 0 -11 Q2 -17 5 -11 Q9 -13 6 -6Z" ' + f("#E5483A", 1.6) + '/><path d="M8 -2 L16 1 L8 4Z" ' + f("#FFA726", 1.5) + '/><ellipse cx="9" cy="7" rx="2.6" ry="3.6" ' + f("#E5483A", 1.4) + '/><circle cx="3" cy="-2" r="1.8" fill="' + INK + '"/></g>';
    return s;
  }
  function rabbit(o) {
    var b = o.c || "#F7F3EC", d = dk(b, 0.28), s = "";
    s += '<circle cx="15" cy="-8" r="6.6" ' + f("#FFFFFE", 2) + '/><ellipse cx="0" cy="-17" rx="15" ry="16.5" ' + f(b) + '/><ellipse cx="0" cy="-13" rx="8" ry="11" fill="#FFFFFE" opacity=".8"/>';
    s += '<ellipse cx="-7" cy="-3" rx="6.8" ry="4" ' + f(b, 2) + '/><ellipse cx="7" cy="-3" rx="6.8" ry="4" ' + f(b, 2) + "/>";
    s += '<ellipse cx="-7" cy="-48" rx="4.8" ry="15" transform="rotate(-8 -7 -48)" ' + f(b) + '/><ellipse cx="7" cy="-48" rx="4.8" ry="15" transform="rotate(10 7 -48)" ' + f(b) + '/><ellipse cx="-7" cy="-47" rx="2.2" ry="10.5" transform="rotate(-8 -7 -47)" fill="#FFB6C8"/><ellipse cx="7" cy="-47" rx="2.2" ry="10.5" transform="rotate(10 7 -47)" fill="#FFB6C8"/>';
    s += '<circle cx="0" cy="-36" r="13" ' + f(b) + '/><ellipse cx="-5" cy="-37" rx="2" ry="2.6" fill="' + INK + '"/><ellipse cx="5" cy="-37" rx="2" ry="2.6" fill="' + INK + '"/><circle cx="-4.4" cy="-38" r=".8" fill="#fff"/><circle cx="5.6" cy="-38" r=".8" fill="#fff"/>';
    s += '<path d="M-1.8 -33 L1.8 -33 L0 -31Z" fill="#FF8FB1"/><path d="M0 -31 Q-2.5 -28 -5 -29.6 M0 -31 Q2.5 -28 5 -29.6" fill="none" stroke="' + INK + '" stroke-width="1.3" stroke-linecap="round"/><circle cx="-8.6" cy="-31" r="2.4" fill="#FF9DB5" opacity=".55"/><circle cx="8.6" cy="-31" r="2.4" fill="#FF9DB5" opacity=".55"/>';
    s += '<path d="M-9 -32 L-19 -34 M-9 -30 L-19 -29 M9 -32 L19 -34 M9 -30 L19 -29" fill="none" stroke="' + d + '" stroke-width="1" opacity=".7"/>';
    return s;
  }
  function bear(o) {
    var b = o.c || "#A8714A", l = "#E6C39A", s = "";
    s += '<ellipse cx="-13" cy="-3" rx="8" ry="4.4" ' + f(b, 2) + '/><ellipse cx="13" cy="-3" rx="8" ry="4.4" ' + f(b, 2) + '/><ellipse cx="0" cy="-19" rx="18" ry="19" ' + f(b) + '/><ellipse cx="0" cy="-16" rx="10.5" ry="13" fill="' + l + '"/>';
    s += ln(-14, -28, -22, -14, 7, b) + ln(14, -28, 22, -14, 7, b) + '<circle cx="-22" cy="-13" r="4.4" ' + f(b, 1.8) + '/><circle cx="22" cy="-13" r="4.4" ' + f(b, 1.8) + "/>";
    s += '<circle cx="-12" cy="-52" r="6.6" ' + f(b) + '/><circle cx="12" cy="-52" r="6.6" ' + f(b) + '/><circle cx="-12" cy="-52" r="3.2" fill="' + l + '"/><circle cx="12" cy="-52" r="3.2" fill="' + l + '"/><circle cx="0" cy="-42" r="16" ' + f(b) + "/>";
    s += '<ellipse cx="0" cy="-37" rx="8.4" ry="6.6" fill="' + l + '" stroke="' + dk(b) + '" stroke-width="1.6"/><ellipse cx="0" cy="-39.6" rx="3.2" ry="2.2" fill="' + INK + '"/><path d="M0 -37.4 V-34.6 M0 -34.6 Q-2.6 -32 -5 -33.4 M0 -34.6 Q2.6 -32 5 -33.4" fill="none" stroke="' + INK + '" stroke-width="1.4" stroke-linecap="round"/>';
    s += '<ellipse cx="-6.4" cy="-46" rx="2" ry="2.6" fill="' + INK + '"/><ellipse cx="6.4" cy="-46" rx="2" ry="2.6" fill="' + INK + '"/><circle cx="-5.8" cy="-47" r=".8" fill="#fff"/><circle cx="7" cy="-47" r=".8" fill="#fff"/>';
    return s;
  }
  function squirrel(o) {
    var b = "#C9783A", l = "#F2D9B0", s = "";
    s += '<path d="M-6 -4 Q-34 -6 -30 -34 Q-28 -52 -12 -50 Q-22 -42 -18 -30 Q-14 -14 -2 -12Z" ' + f(b, 2.4) + '/><path d="M-26 -34 Q-24 -46 -14 -47" fill="none" stroke="' + l + '" stroke-width="3" stroke-linecap="round" opacity=".7"/>';
    s += '<ellipse cx="2" cy="-20" rx="11" ry="17" ' + f(b) + '/><ellipse cx="6" cy="-18" rx="6.4" ry="11.4" fill="' + l + '"/><ellipse cx="2" cy="-3" rx="8.4" ry="3.6" ' + f(b, 2) + "/>";
    s += '<path d="M4 -48 L2 -57 L9 -50Z M12 -46 L16 -55 L18 -45Z" ' + f(b, 1.8) + '/><circle cx="9" cy="-40" r="10" ' + f(b) + '/><ellipse cx="14" cy="-37" rx="4.6" ry="3.6" fill="' + l + '"/><circle cx="17" cy="-37.6" r="1.5" fill="' + INK + '"/><circle cx="11" cy="-42" r="1.7" fill="' + INK + '"/><circle cx="11.5" cy="-42.6" r=".6" fill="#fff"/>';
    s += '<g transform="translate(14,-24)"><ellipse cx="0" cy="0" rx="5" ry="6.4" ' + f("#9B6A3C", 1.6) + '/><path d="M-5.4 -3 Q0 -9.6 5.4 -3Z" ' + f("#6B4423", 1.6) + '/><path d="M0 -9 V-11" stroke="#6B4423" stroke-width="1.8" stroke-linecap="round"/></g>';
    s += '<circle cx="12" cy="-24" r="2.6" ' + f(b, 1.4) + "/>";
    return s;
  }
  function robin(o) {
    var s = "";
    s += ln(-2, -9, -2, 0, 2.4, "#8A6A4A") + ln(4, -9, 5, 0, 2.4, "#8A6A4A") + path("M-11 -14 L-23 -18 L-21 -8Z", "#7A5B45", 1.8);
    s += '<ellipse cx="0" cy="-16" rx="13" ry="10.4" ' + f("#8D6E57") + '/><ellipse cx="5" cy="-13" rx="8" ry="7.6" fill="#FF7F3F"/><ellipse cx="-3" cy="-16" rx="7" ry="4.6" ' + f("#7A5B45", 1.8) + '/>';
    s += '<circle cx="9" cy="-25" r="7.6" ' + f("#8D6E57") + '/><path d="M5 -22 Q10 -17 15 -22 Q14 -26 10 -27Z" fill="#FF7F3F"/>' + path("M15 -26 L21.5 -24 L15 -22Z", "#FFC53D", 1.5) + '<circle cx="11" cy="-27" r="1.6" fill="' + INK + '"/><circle cx="11.5" cy="-27.6" r=".6" fill="#fff"/>';
    return s;
  }
  /* ------------------------------------------------------------------ farm and home things */
  function barn(o) {
    var r = o.c || "#D9483B";
    return '<rect x="-40" y="-50" width="80" height="50" ' + f(r, 2.6) + '/><path d="M-48 -46 L-32 -74 L32 -74 L48 -46Z" ' + f("#8A6A50", 2.6) + '/><rect x="-14" y="-62" width="28" height="12" rx="2" ' + f("#FFF6E8", 1.8) + '/><path d="M-14 -62 L14 -50 M14 -62 L-14 -50" stroke="' + dk("#FFF6E8", 0.3) + '" stroke-width="1.6"/>' +
      '<rect x="-17" y="-36" width="34" height="36" ' + f("#FFF6E8", 2.2) + '/><path d="M-17 -36 L17 0 M17 -36 L-17 0" stroke="' + r + '" stroke-width="3"/><rect x="-17" y="-36" width="34" height="36" fill="none" stroke="' + r + '" stroke-width="3"/>' +
      '<path d="M-40 -50 V0 M40 -50 V0" stroke="#FFF6E8" stroke-width="3"/>';
  }
  function fence(o) {
    var w = o.w || 120, s = "", n = Math.round(w / 20), i, x;
    s += '<rect x="' + (-w / 2) + '" y="-24" width="' + w + '" height="5" rx="2" ' + f("#D8A86A", 1.8) + '/><rect x="' + (-w / 2) + '" y="-11" width="' + w + '" height="5" rx="2" ' + f("#D8A86A", 1.8) + "/>";
    for (i = 0; i <= n; i++) {
      x = -w / 2 + (w * i) / n;
      s += '<path d="M' + (x - 4) + " 0 V-27 L" + x + " -32 L" + (x + 4) + ' -27 V0Z" ' + f("#E6B87A", 1.8) + "/>";
    }
    return s;
  }
  function corn(o) {
    var s = '<path d="M-2 -2 Q-18 -14 -16 -34 Q-8 -20 0 -14Z" ' + f("#6CCB5F", 1.8) + '/><path d="M2 -2 Q18 -14 16 -34 Q8 -20 0 -14Z" ' + f("#5DBB5A", 1.8) + "/>", r, c;
    s += '<ellipse cx="0" cy="-28" rx="9.6" ry="23" ' + f("#FFD23F", 2.2) + "/>";
    for (r = 0; r < 6; r++) for (c = 0; c < 3; c++) s += '<circle cx="' + (-5 + c * 5) + '" cy="' + (-42 + r * 7.4) + '" r="1.9" fill="#F2B300"/>';
    return s + '<path d="M-3 -4 Q0 -10 3 -4Z" ' + f("#6CCB5F", 1.4) + "/>";
  }
  function grass(o) {
    var w = o.w || 80, s = "", x, i = 0, c = o.c || "#5DBB5A";
    for (x = -w / 2; x <= w / 2; x += 7) {
      var hh = 14 + ((i * 7) % 12);
      s += '<path d="M' + x + " 0 Q" + (x + 2) + " " + -hh / 2 + " " + (x + (i % 2 ? 5 : -3)) + " " + -hh + " Q" + (x + 6) + " " + -hh / 2 + " " + (x + 8) + ' 0Z" ' + f(i % 2 ? c : "#6CCB5F", 1.4) + "/>";
      i++;
    }
    return s;
  }
  function seeds(o) {
    var P = [[-12, -2, 20], [-3, -4, -30], [7, -1, 70], [15, -4, 10], [1, 0, -80]], s = "", i;
    for (i = 0; i < P.length; i++) s += '<g transform="translate(' + P[i][0] + "," + P[i][1] + ") rotate(" + P[i][2] + ')"><path d="M-5 0 Q-1 -6 5 0 Q-1 4 -5 0Z" ' + f("#8A5A2B", 1.4) + '/><path d="M-2 -0.4 H2" stroke="#E8B66E" stroke-width="1"/></g>';
    return s;
  }
  function egg(o) {
    var c = o.c || "#FFFFFE";
    return '<path d="M0 -29 C9 -29 13 -17 13 -10 C13 -3 7 0 0 0 C-7 0 -13 -3 -13 -10 C-13 -17 -9 -29 0 -29Z" ' + f(c, 2.2) + '/><ellipse cx="-5" cy="-18" rx="2.6" ry="5.4" transform="rotate(18 -5 -18)" fill="#fff" opacity=".7"/>';
  }
  function milk(o) {
    var s = '<path d="M14 -2 V-30 L22 -40 H36 L44 -30 V-2Z" ' + f("#FFFFFE", 2.2) + '/><path d="M14 -30 H44" stroke="' + dk("#FFFFFE", 0.2) + '" stroke-width="1.6"/><rect x="20" y="-24" width="18" height="14" rx="3" fill="#6AA7FF" opacity=".85"/><circle cx="29" cy="-17" r="3.4" fill="#FFFFFE"/><path d="M22 -40 V-46 H36 V-40" fill="#6AA7FF" stroke="' + dk("#6AA7FF") + '" stroke-width="1.6"/>';
    s += '<path d="M-17 -34 L-13 0 H11 L15 -34Z" fill="#E4F4FF" fill-opacity=".85" stroke="#8FB5D6" stroke-width="2.4" stroke-linejoin="round"/><path d="M-16 -26 L-13 -2 H11 L14 -26Q0 -22 -16 -26Z" fill="#FFFFFE" stroke="#C9D8E8" stroke-width="1.4"/><path d="M-13 -30 Q-9 -33 -9 -28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>';
    return s;
  }
  function loaf(o) {
    return '<path d="M-26 -2 Q-34 -6 -30 -16 Q-28 -30 -10 -32 Q0 -34 12 -32 Q30 -30 30 -16 Q34 -6 26 -2Z" ' + f("#E0A24E", 2.4) + '/><path d="M-14 -26 L-8 -14 M-2 -29 L4 -15 M10 -27 L16 -14" stroke="#F6D79A" stroke-width="3.4" stroke-linecap="round"/><path d="M-22 -22 Q-16 -28 -8 -28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".5"/>';
  }
  function flower(o) {
    var c = o.c || C.red, s = "", i, a;
    s += '<path d="M0 0 Q-2 -22 0 -40" fill="none" stroke="#3E9B5A" stroke-width="3.6" stroke-linecap="round"/><path d="M0 -14 Q-14 -18 -16 -28 Q-4 -26 0 -16Z" ' + f("#5DBB5A", 1.6) + '/><path d="M0 -10 Q12 -14 15 -22 Q4 -22 0 -12Z" ' + f("#6CCB5F", 1.6) + "/>";
    for (i = 0; i < 6; i++) {
      a = (i * 60 * Math.PI) / 180;
      s += '<circle cx="' + (Math.cos(a) * 8.4).toFixed(1) + '" cy="' + (-48 + Math.sin(a) * 8.4).toFixed(1) + '" r="6.4" ' + f(c, 1.8) + "/>";
    }
    return s + '<circle cx="0" cy="-48" r="5.4" ' + f("#FFD23F", 1.8) + "/>";
  }
  function door(o) {
    var c = o.c || "#A8713A";
    return '<rect x="-23" y="-72" width="46" height="72" rx="3" ' + f("#E6C79A", 2.4) + '/><rect x="-18" y="-68" width="36" height="68" rx="2" ' + f(c, 2.2) + '/><rect x="-13" y="-62" width="12" height="24" rx="2" fill="none" stroke="' + dk(c, 0.3) + '" stroke-width="1.8"/><rect x="2" y="-62" width="12" height="24" rx="2" fill="none" stroke="' + dk(c, 0.3) + '" stroke-width="1.8"/><rect x="-13" y="-32" width="27" height="26" rx="2" fill="none" stroke="' + dk(c, 0.3) + '" stroke-width="1.8"/><circle cx="12" cy="-34" r="3.2" ' + f("#FFD23F", 1.4) + "/>";
  }
  function windowk(o) {
    var s = '<rect x="-30" y="-64" width="60" height="64" rx="5" ' + f("#E6C79A", 2.6) + '/><rect x="-25" y="-59" width="50" height="54" rx="3" fill="#BFE6FA" stroke="' + dk("#E6C79A", 0.4) + '" stroke-width="2"/>';
    if (o.sun) s += '<circle cx="12" cy="-42" r="8" fill="#FFD65A"/><path d="M-22 -24 Q-8 -34 6 -26 Q18 -20 25 -28 V-5 H-25Z" fill="#B9E49B"/>';
    return s + '<path d="M0 -59 V-5 M-25 -32 H25" stroke="#E6C79A" stroke-width="3.6"/><path d="M-22 -54 Q-16 -52 -14 -44" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8" fill="none"/><rect x="-33" y="-4" width="66" height="6" rx="3" ' + f("#D8AE78", 1.8) + "/>";
  }
  function boards(o) {
    var s = "", y, i, x;
    for (i = 0; i < 4; i++) {
      y = 122 + i * 12;
      s += '<line x1="0" y1="' + y + '" x2="240" y2="' + y + '" stroke="#C99A5E" stroke-width="2"/>';
      for (x = (i % 2) * 20 + 10; x < 240; x += 40) s += '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + 12) + '" stroke="#C99A5E" stroke-width="1.8"/>';
    }
    return s;
  }
  function bowl(o) {
    return '<path d="M-17 -12 Q-17 0 -8 0 H8 Q17 0 17 -12Z" ' + f("#E5483A", 2.2) + '/><ellipse cx="0" cy="-12" rx="17" ry="4.6" ' + f("#F26A5C", 2) + '/><ellipse cx="0" cy="-12.4" rx="12.4" ry="2.8" fill="#8FD0F2"/><path d="M-8 -13 Q0 -15 8 -13" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle cx="0" cy="-5" r="2.4" fill="#fff" opacity=".7"/>';
  }
  function sprout(o) {
    var k = o.k || 1, s = '<path d="M-14 0 Q-10 -8 0 -8 Q10 -8 14 0Z" ' + f("#8A6A4A", 2) + "/>";
    if (k === 0) return s + '<ellipse cx="0" cy="-9" rx="4.4" ry="2.8" ' + f("#C9A06A", 1.4) + "/>";
    if (k === 1) return s + '<path d="M0 -8 Q0 -20 0 -26" stroke="#3E9B5A" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M0 -24 Q-12 -26 -14 -34 Q-2 -34 0 -24Z" ' + f("#5DBB5A", 1.6) + '/><path d="M0 -24 Q12 -26 14 -34 Q2 -34 0 -24Z" ' + f("#6CCB5F", 1.6) + "/>";
    return s;
  }
  /* ------------------------------------------------------------------ town and people */
  function car(o) {
    var c = o.c || "#E5483A";
    return '<path fill-rule="evenodd" d="M-42 -8 V-22 Q-42 -28 -35 -28 H-24 L-14 -42 Q-12 -45 -8 -45 H12 Q16 -45 18 -42 L28 -28 H36 Q42 -28 42 -22 V-8Z M-17 -29 L-10 -40 H-2 V-29Z M2 -29 V-40 H12 L20 -29Z" ' + f(c, 2.6) + '/><path d="M-17 -29 L-10 -40 H-2 V-29Z M2 -29 V-40 H12 L20 -29Z" fill="#BFE6FA" fill-opacity=".3" stroke="none"/><circle cx="-24" cy="-8" r="10" ' + f("#3A3F4D", 2) + '/><circle cx="-24" cy="-8" r="4" fill="#C8CEDB"/><circle cx="24" cy="-8" r="10" ' + f("#3A3F4D", 2) + '/><circle cx="24" cy="-8" r="4" fill="#C8CEDB"/>' +
      '<rect x="36" y="-24" width="6" height="6" rx="2" fill="#FFF3B0"/><rect x="-42" y="-22" width="4" height="6" rx="1.6" fill="#FF8A7A"/>';
  }
  function boat(o) {
    var c = o.c || "#E5483A";
    if (o.part === "hull") return '<path d="M-36 -14 H36 L28 0 Q0 4 -28 0Z" ' + f(c, 2.4) + '/><path d="M-33 -9 H33" stroke="#fff" stroke-width="2.4" opacity=".7"/>';
    if (o.part === "sail") return '<path d="M0 -12 V-66" stroke="#7A5328" stroke-width="3.4" stroke-linecap="round"/><path d="M4 -62 Q30 -44 30 -16 H4Z" ' + f("#FFFFFE", 2.2) + '/><path d="M-4 -52 Q-22 -34 -22 -16 H-4Z" ' + f("#FFF3D6", 2.2) + '/><path d="M12 -52 Q22 -40 24 -26" fill="none" stroke="' + c + '" stroke-width="3.4" stroke-linecap="round"/><path d="M0 -66 L12 -62 L0 -58Z" ' + f("#FFD23F", 1.4) + "/>";
    return '<path d="M0 -12 V-66" stroke="#7A5328" stroke-width="3.4" stroke-linecap="round"/><path d="M4 -62 Q30 -44 30 -16 H4Z" ' + f("#FFFFFE", 2.2) + '/><path d="M-4 -52 Q-22 -34 -22 -16 H-4Z" ' + f("#FFF3D6", 2.2) + '/><path d="M12 -52 Q22 -40 24 -26" fill="none" stroke="' + c + '" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M-36 -14 H36 L28 0 Q0 4 -28 0Z" ' + f(c, 2.4) + '/><path d="M-33 -9 H33" stroke="#fff" stroke-width="2.4" opacity=".7"/><path d="M0 -66 L12 -62 L0 -58Z" ' + f("#FFD23F", 1.4) + "/>";
  }
  function bell(o) {
    return '<path d="M-24 -78 H24" stroke="#8A5A2B" stroke-width="6" stroke-linecap="round"/><path d="M0 -78 V-70" stroke="#5E3A18" stroke-width="3"/><path d="M-5 -72 Q0 -80 5 -72Z" ' + f("#B8860B", 1.6) + '/><path d="M-20 -22 Q-18 -38 -12 -52 Q0 -72 12 -52 Q18 -38 20 -22 Q24 -20 24 -14 H-24 Q-24 -20 -20 -22Z" ' + f("#FFD23F", 2.4) + '/><path d="M-12 -24 Q-10 -38 -5 -50" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".6"/><circle cx="0" cy="-8" r="5.6" ' + f("#E0A800", 1.8) + '/><path d="M0 -14 V-10" stroke="' + dk("#E0A800") + '" stroke-width="2"/>';
  }
  function school(o) {
    var r = "#D9604A", s = "";
    s += '<rect x="-52" y="-36" width="104" height="36" ' + f(r, 2.6) + '/><rect x="-18" y="-60" width="36" height="26" ' + f("#E8765F", 2.4) + '/><path d="M-24 -60 L0 -80 L24 -60Z" ' + f("#7A5A8E", 2.4) + '/><circle cx="0" cy="-48" r="8" ' + f("#FFFFFE", 2) + '/><path d="M0 -48 V-53 M0 -48 H4" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>';
    s += '<path d="M-7 0 V-14 Q0 -22 7 -14 V0Z" fill="#5A3A24" stroke="#2F1E12" stroke-width="1.6"/>';
    [-40, -26, 26, 40].forEach(function (x) {
      s += '<rect x="' + (x - 5.6) + '" y="-28" width="11.2" height="14" rx="2" ' + f("#BFE6FA", 1.6) + '/><path d="M' + x + " -28 V-14 M" + (x - 5.6) + " -21 H" + (x + 5.6) + '" stroke="' + dk("#BFE6FA", 0.4) + '" stroke-width="1.2"/>';
    });
    s += '<path d="M0 -80 V-90" stroke="#7A5328" stroke-width="2.4"/><path d="M0 -90 L14 -86 L0 -82Z" ' + f("#3D8BF2", 1.4) + '/><rect x="-14" y="-3" width="28" height="3.6" fill="#D8D8E0" stroke="#9AA3B8" stroke-width="1.2"/>';
    return s;
  }
  function letter(o) {
    return '<rect x="-26" y="-34" width="52" height="34" rx="3" ' + f("#FFF6E0", 2.4) + '/><path d="M-26 -34 L0 -14 L26 -34" fill="none" stroke="' + dk("#FFF6E0", 0.3) + '" stroke-width="2" stroke-linejoin="round"/><path d="M-26 0 L-9 -17 M26 0 L9 -17" stroke="' + dk("#FFF6E0", 0.25) + '" stroke-width="1.6"/><rect x="12" y="-31" width="11" height="13" rx="1.4" ' + f("#FFFFFE", 1.4) + '/><rect x="14" y="-29" width="7" height="9" fill="#6AA7FF"/><path d="M0 -17 C-5 -21 -4 -26 0 -24 C4 -26 5 -21 0 -17Z" fill="#E5483A"/>';
  }
  function paper(o) {
    var s = '<path d="M-20 0 V-52 H10 L20 -42 V0Z" ' + f("#FFFFFE", 2.2) + '/><path d="M10 -52 V-42 H20" fill="#E7EEF8" stroke="' + dk("#FFFFFE", 0.3) + '" stroke-width="1.6" stroke-linejoin="round"/>';
    [-40, -32, -24, -16, -8].forEach(function (y) {
      s += '<path d="M-14 ' + y + " H" + (y === -8 ? 4 : 14) + '" stroke="#9FB3D1" stroke-width="1.8" stroke-linecap="round"/>';
    });
    if (o.write) s += '<path d="M-14 -40 Q-8 -46 -3 -40 T8 -40 M-14 -32 Q-9 -38 -4 -32 T6 -32" fill="none" stroke="#3D5AFE" stroke-width="2" stroke-linecap="round"/>';
    return s;
  }
  function frame(o) {
    return '<rect x="-32" y="-52" width="64" height="52" rx="4" ' + f("#C98B5A", 2.6) + '/><rect x="-26" y="-46" width="52" height="40" rx="2" fill="#CFEFFF" stroke="' + dk("#C98B5A", 0.3) + '" stroke-width="1.8"/><circle cx="12" cy="-34" r="6" fill="#FFD65A"/><path d="M-26 -14 Q-12 -30 2 -18 Q12 -26 26 -14 V-6 H-26Z" fill="#9ADF8A"/><path d="M-26 -9 Q0 -16 26 -9 V-6 H-26Z" fill="#6CCB5F"/>';
  }
  function tag(o) {
    return '<rect x="-30" y="-40" width="60" height="40" rx="5" ' + f("#FFFFFE", 2.4) + '/><path d="M-30 -34 Q-30 -40 -24 -40 H24 Q30 -40 30 -34 V-26 H-30Z" ' + f("#E5483A", 2.2) + '/><text x="0" y="-30.6" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="8" fill="#FFFFFE">HELLO</text><text x="0" y="-7" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="15" fill="#3D5AFE">' + (o.t || "Sam") + "</text>";
  }
  function road(o) {
    return '<rect x="0" y="124" width="240" height="36" fill="#6B7285"/><rect x="0" y="120" width="240" height="6" fill="#B8BFCC"/><path d="M10 142 H40 M70 142 H100 M130 142 H160 M190 142 H220" stroke="#FFE066" stroke-width="3.4" stroke-linecap="round"/>';
  }
  function signpost(o) {
    return '<rect x="-3.5" y="-62" width="7" height="62" ' + f("#8A5A2B", 1.8) + '/><path d="M-26 -58 H18 L30 -48 L18 -38 H-26Z" ' + f("#E8B66E", 2.2) + '/><path d="M-18 -48 H12 M6 -53 L12 -48 L6 -43" fill="none" stroke="#6A48E8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function hl(o) {
    var r = o.r || 18;
    return '<circle cx="0" cy="0" r="' + r + '" fill="none" stroke="#6A48E8" stroke-width="3" stroke-dasharray="6 6" stroke-linecap="round"/>';
  }
  function feet(o) {
    // two bare feet seen sticking up (toes at the top)
    var foot = function (x, r) {
      var toes = "", i;
      for (i = 0; i < 5; i++) toes += '<circle cx="' + (-6.4 + i * 3.2) + '" cy="' + (-32 + (i === 0 ? 1.4 : i === 4 ? 2.6 : i === 1 ? 0 : 0.8)) + '" r="' + (i === 0 ? 2.8 : 2.1) + '" ' + f("#FFD7B5", 1.4) + "/>";
      return '<g transform="translate(' + x + ',0) rotate(' + r + ')"><path d="M-7 0 Q-9 -12 -8.4 -22 Q-8 -31 0 -31 Q8 -31 8 -22 Q9 -12 7 0Z" ' + f("#FFD7B5", 2.2) + "/>" + toes + '<path d="M-5 -14 Q0 -11 5 -14" fill="none" stroke="#F2C79C" stroke-width="1.4" stroke-linecap="round"/></g>';
    };
    return foot(-13, -7) + foot(13, 7);
  }
  // a big open hand, palm to the front, fingers up (the origin is the middle of the wrist)
  function bighand(o) {
    var sk = o.c || "#FFD7B5", d = dk(sk, 0.2), s = "", F = [[-17, 28], [-6, 34], [5, 32], [16, 26]], i;
    s += '<g transform="translate(-26,-18) rotate(-52)"><rect x="-5" y="-26" width="10" height="28" rx="5" ' + f(sk, 2.4) + '/><ellipse cx="0" cy="-22" rx="3.4" ry="2.4" fill="#FFF0E2" opacity=".8"/></g>';
    for (i = 0; i < F.length; i++) s += '<rect x="' + (F[i][0] - 5) + '" y="' + (-44 - F[i][1]) + '" width="10" height="' + (F[i][1] + 8) + '" rx="5" ' + f(sk, 2.4) + '/><ellipse cx="' + F[i][0] + '" cy="' + (-44 - F[i][1] + 5) + '" rx="3.4" ry="2.4" fill="#FFF0E2" opacity=".8"/>';
    s += '<path d="M-22 -34 Q-24 -2 -10 0 H10 Q24 -2 22 -34 Q0 -46 -22 -34Z" ' + f(sk, 2.6) + '/><path d="M-12 -22 Q-2 -16 10 -24 M-14 -12 Q-4 -7 8 -13" fill="none" stroke="' + d + '" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>';
    return s;
  }
  function bandaid(o) {
    return '<g transform="rotate(' + (o.rot == null ? -25 : o.rot) + ')"><rect x="-22" y="-7" width="44" height="14" rx="7" ' + f("#F2C79C", 2) + '/><rect x="-9" y="-7" width="18" height="14" fill="#FFE5C8" stroke="' + dk("#F2C79C") + '" stroke-width="1.4"/><circle cx="-15" cy="-2" r="1" fill="' + dk("#F2C79C") + '"/><circle cx="-15" cy="2" r="1" fill="' + dk("#F2C79C") + '"/><circle cx="15" cy="-2" r="1" fill="' + dk("#F2C79C") + '"/><circle cx="15" cy="2" r="1" fill="' + dk("#F2C79C") + "\"/></g>";
  }
  // a hand wrapped in a white bandage (drawn over the hand of a child)
  function bandhand(o) {
    return '<ellipse cx="0" cy="0" rx="8.6" ry="10.4" ' + f("#FFFFFE", 2) + '/><path d="M-7 -5 L6 -9.4 M-8 0 L8 -4.6 M-7 5 L7.4 0.6" stroke="#C9D4E6" stroke-width="2.4" stroke-linecap="round"/><path d="M-3 -2 H3 M0 -5 V1" stroke="#E5483A" stroke-width="2.4" stroke-linecap="round"/>';
  }
  // short red lines around something that hurts
  function pain(o) {
    var s = "", i, a, r1 = o.r || 14, r2 = r1 + 8;
    for (i = 0; i < 8; i++) {
      a = (i * Math.PI) / 4 + 0.4;
      s += '<line x1="' + (Math.cos(a) * r1).toFixed(1) + '" y1="' + (Math.sin(a) * r1).toFixed(1) + '" x2="' + (Math.cos(a) * r2).toFixed(1) + '" y2="' + (Math.sin(a) * r2).toFixed(1) + '" stroke="#E5483A" stroke-width="3.4" stroke-linecap="round"/>';
    }
    return s;
  }
  // two tears under a child's eyes (the origin is the middle of the eyes)
  function tears(o) {
    var d = '<path d="M0 0 Q-3.4 5 0 9 Q3.4 5 0 0Z" ' + f("#8FD0F2", 1.2) + "/>";
    return '<g transform="translate(-6.4,3)">' + d + '</g><g transform="translate(6.4,5)">' + d + "</g>";
  }
  function baby(o) {
    var skin = "#FFD7B5", c = o.c || "#FFD6E4";
    return '<circle cx="-12" cy="-6" r="5" ' + f(skin, 1.8) + '/><circle cx="12" cy="-6" r="5" ' + f(skin, 1.8) + '/><ellipse cx="0" cy="-16" rx="15" ry="14" ' + f(c, 2.2) + '/>' + ln(-12, -20, -20, -10, 5, c) + ln(12, -20, 20, -10, 5, c) + '<circle cx="-20" cy="-9" r="3.4" ' + f(skin, 1.6) + '/><circle cx="20" cy="-9" r="3.4" ' + f(skin, 1.6) + "/>" +
      '<circle cx="0" cy="-39" r="15" ' + f(skin, 2.4) + '/><path d="M-3 -54 Q0 -60 4 -54 Q0 -55 -3 -54Z" ' + f("#6B4423", 1.4) + '/><ellipse cx="-5.4" cy="-39" rx="2" ry="2.6" fill="' + INK + '"/><ellipse cx="5.4" cy="-39" rx="2" ry="2.6" fill="' + INK + '"/><circle cx="-4.8" cy="-40" r=".8" fill="#fff"/><circle cx="6" cy="-40" r=".8" fill="#fff"/><circle cx="-9.4" cy="-34" r="2.8" fill="#FF9DB5" opacity=".6"/><circle cx="9.4" cy="-34" r="2.8" fill="#FF9DB5" opacity=".6"/><path d="M-3 -33 Q0 -30 3 -33" fill="none" stroke="#B3442F" stroke-width="1.8" stroke-linecap="round"/>';
  }
  /* ------------------------------------------------------------------ nature, weather, time */
  function fire(o) {
    return '<path d="M-26 -2 L22 -16 M26 -2 L-22 -16" stroke="#7A4A22" stroke-width="7" stroke-linecap="round"/><path d="M-26 -2 L22 -16 M26 -2 L-22 -16" stroke="#A8713A" stroke-width="3.6" stroke-linecap="round"/><path d="M0 -14 C-22 -18 -18 -42 -6 -52 C-6 -42 0 -40 2 -46 C6 -56 4 -64 2 -70 C18 -58 26 -38 20 -26 C16 -16 8 -14 0 -14Z" ' + f("#FF8A3D", 2.4) + '/><path d="M0 -14 C-10 -16 -9 -30 -2 -36 C0 -30 4 -30 5 -34 C12 -28 12 -18 6 -15Z" ' + f("#FFD23F", 1.8) + '/><path d="M0 -14 C-4 -15 -3 -22 0 -24 C3 -21 4 -16 0 -14Z" fill="#FFF6C8"/>';
  }
  function stick(o) {
    return '<path d="M-26 -3 L24 -16" stroke="#5E3A18" stroke-width="7" stroke-linecap="round"/><path d="M-26 -3 L24 -16" stroke="#9B6A3C" stroke-width="4" stroke-linecap="round"/><path d="M-4 -9 L2 -22 M10 -13 L20 -22" stroke="#5E3A18" stroke-width="5" stroke-linecap="round"/><path d="M-4 -9 L2 -22 M10 -13 L20 -22" stroke="#9B6A3C" stroke-width="2.6" stroke-linecap="round"/>';
  }
  function crate(o) {
    var c = "#D9A660", s = '<rect x="-26" y="-40" width="52" height="40" rx="2" ' + f(c, 2.4) + "/>";
    [-30, -20, -10].forEach(function (y) {
      s += '<path d="M-26 ' + y + " H26" + '" stroke="' + dk(c, 0.3) + '" stroke-width="1.6"/>';
    });
    s += '<path d="M-26 -40 L26 0 M26 -40 L-26 0" stroke="' + dk(c, 0.24) + '" stroke-width="5"/><path d="M-26 -40 L26 0 M26 -40 L-26 0" stroke="#E8B66E" stroke-width="2.6"/>';
    return s + '<circle cx="-22" cy="-36" r="1.4" fill="#6B4A2B"/><circle cx="22" cy="-36" r="1.4" fill="#6B4A2B"/><circle cx="-22" cy="-4" r="1.4" fill="#6B4A2B"/><circle cx="22" cy="-4" r="1.4" fill="#6B4A2B"/>';
  }
  function logs(o) {
    var s = "", P = [[-18, -9, 0], [6, -9, 1], [-6, -28, 2]], i;
    for (i = 0; i < P.length; i++) s += '<rect x="' + (P[i][0] - 26) + '" y="' + (P[i][1] - 9) + '" width="46" height="18" rx="9" ' + f("#A8713A", 2.2) + '/><ellipse cx="' + (P[i][0] + 20) + '" cy="' + P[i][1] + '" rx="8" ry="9" ' + f("#E6C08A", 2) + '/><ellipse cx="' + (P[i][0] + 20) + '" cy="' + P[i][1] + '" rx="4.4" ry="5" fill="none" stroke="#B8844A" stroke-width="1.4"/>';
    return s;
  }
  function puddle(o) {
    return '<ellipse cx="0" cy="0" rx="' + (o.w || 26) + '" ry="6" ' + f("#8FC4EE", 2) + '/><ellipse cx="0" cy="0" rx="9" ry="2.6" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/><ellipse cx="0" cy="0" rx="16" ry="4.2" fill="none" stroke="#fff" stroke-width="1.2" opacity=".5"/>';
  }
  function raincloud(o) {
    var s = '<ellipse cx="0" cy="0" rx="34" ry="14" fill="#8E9BB4"/><circle cx="-18" cy="-8" r="14" fill="#8E9BB4"/><circle cx="6" cy="-14" r="18" fill="#9AA7BE"/><circle cx="24" cy="-4" r="13" fill="#8E9BB4"/>', i;
    for (i = 0; i < 6; i++) s += '<path d="M' + (-26 + i * 10) + " " + (14 + (i % 2) * 6) + " l-3 9" + '" stroke="#5B8FD0" stroke-width="3" stroke-linecap="round"/>';
    return s;
  }
  function sled(o) {
    return '<path d="M-26 -4 Q-34 -4 -34 -12" fill="none" stroke="#9AA3B8" stroke-width="3.4" stroke-linecap="round"/><path d="M-30 0 H26" stroke="#9AA3B8" stroke-width="3.4" stroke-linecap="round"/><path d="M-24 -4 V-10 M16 -4 V-10" stroke="#8A5A2B" stroke-width="3"/><rect x="-28" y="-18" width="50" height="9" rx="4" ' + f("#E5483A", 2.2) + '/><path d="M22 -12 Q34 -12 36 -4" fill="none" stroke="#7A5328" stroke-width="2" stroke-linecap="round"/>';
  }
  function leaf(o) {
    var c = o.c || "#F2994A";
    return '<path d="M0 0 Q-10 -8 -2 -18 Q8 -14 8 -4 Q6 2 0 0Z" ' + f(c, 1.6) + '/><path d="M0 0 L6 -12" stroke="' + dk(c, 0.4) + '" stroke-width="1.2"/>';
  }
  function nest(o) {
    return '<ellipse cx="0" cy="-5" rx="22" ry="9" ' + f("#B98A55", 2.2) + '/><path d="M-20 -6 Q0 2 20 -6 M-18 -2 Q0 6 18 -2" fill="none" stroke="#8A5A2B" stroke-width="2" stroke-linecap="round"/><ellipse cx="-8" cy="-11" rx="5.4" ry="7" ' + f("#9ADCF5", 1.6) + '/><ellipse cx="4" cy="-12" rx="5.4" ry="7" ' + f("#BFE9FA", 1.6) + '/><ellipse cx="14" cy="-9" rx="5" ry="6.4" ' + f("#9ADCF5", 1.6) + "/>";
  }
  function splash(o) {
    return '<path d="M-14 0 Q-10 -12 -6 -22 M0 0 Q0 -16 0 -30 M14 0 Q10 -12 6 -22" fill="none" stroke="#7CC4F0" stroke-width="3.6" stroke-linecap="round"/><circle cx="-16" cy="-18" r="3" fill="#BFE6FA" stroke="#7CC4F0" stroke-width="1.4"/><circle cx="16" cy="-18" r="3" fill="#BFE6FA" stroke="#7CC4F0" stroke-width="1.4"/><circle cx="0" cy="-36" r="3" fill="#BFE6FA" stroke="#7CC4F0" stroke-width="1.4"/>';
  }
  function lily(o) {
    return '<ellipse cx="0" cy="0" rx="13" ry="4.6" ' + f("#4FB36B", 1.8) + '/><path d="M0 0 L9 -3" stroke="#7CC4F0" stroke-width="3"/><circle cx="-3" cy="-3.6" r="3" fill="#FF8FB1" stroke="#C0577F" stroke-width="1.2"/>';
  }
  function sunbig(o) {
    var c = o.c || "#FF5B3D", s = "", i, a;
    for (i = 0; i < 12; i++) {
      a = (i * Math.PI) / 6;
      s += '<line x1="' + (Math.cos(a) * 33).toFixed(1) + '" y1="' + (Math.sin(a) * 33).toFixed(1) + '" x2="' + (Math.cos(a) * 44).toFixed(1) + '" y2="' + (Math.sin(a) * 44).toFixed(1) + '" stroke="' + (o.ray || "#FFB347") + '" stroke-width="5" stroke-linecap="round"/>';
    }
    return s + '<circle r="28" ' + f(c, 2.6) + '/><ellipse cx="-9" cy="-10" rx="7" ry="4.4" transform="rotate(-30 -9 -10)" fill="#fff" opacity=".4"/>';
  }
  function sweat(o) {
    return '<path d="M0 0 Q-5 -8 0 -14 Q5 -8 0 0Z" ' + f("#8FD0F2", 1.4) + '/><path d="M14 -10 Q9 -18 14 -24 Q19 -18 14 -10Z" ' + f("#8FD0F2", 1.4) + "/>";
  }
  // the park without its sun, for the pictures that draw a big sun of their own (one sun in a picture only)
  function bgParkNoSun() {
    return '<rect width="240" height="160" fill="#D6EEFF"/>' + h.draw(["cloud", 52, 34, 1, {}], "x") + h.draw(["cloud", 150, 22, 0.7, {}], "x") + '<path d="M0 120 Q60 108 120 118 Q180 128 240 114 L240 160 L0 160Z" fill="#B9E49B"/><path d="M0 134 Q80 126 150 134 Q200 140 240 132 L240 160 L0 160Z" fill="#A5D984"/>';
  }
  function bgDawn() {
    return '<rect width="240" height="160" fill="#FFE3C9"/><rect y="0" width="240" height="70" fill="#FFD0DA"/><rect y="60" width="240" height="40" fill="#FFE9C2"/><path d="M0 118 Q60 104 120 116 Q180 128 240 112 L240 160 L0 160Z" fill="#B9E49B"/><path d="M0 134 Q80 126 150 134 Q200 140 240 132 L240 160 L0 160Z" fill="#A5D984"/>';
  }
  function bgDusk() {
    return '<rect width="240" height="160" fill="#FFB470"/><rect width="240" height="64" fill="#FF8F5A"/><rect y="64" width="240" height="36" fill="#FFD08A"/><path d="M0 112 Q50 96 100 108 Q160 120 240 100 L240 160 L0 160Z" fill="#8E6BB0"/><path d="M0 134 Q80 126 150 134 Q200 140 240 132 L240 160 L0 160Z" fill="#6E4F94"/>';
  }
  /* ------------------------------------------------------------------ the castle, parties, toys */
  function castle(o) {
    var s = "";
    s += '<rect x="-40" y="-62" width="80" height="62" ' + f("#C9CEE8", 2.6) + '/><rect x="-56" y="-86" width="28" height="86" ' + f("#B3B9DA", 2.6) + '/><rect x="28" y="-86" width="28" height="86" ' + f("#B3B9DA", 2.6) + '/>';
    s += '<path d="M-60 -84 L-42 -112 L-24 -84Z" ' + f("#E5483A", 2.4) + '/><path d="M24 -84 L42 -112 L60 -84Z" ' + f("#E5483A", 2.4) + '/><path d="M-30 -62 L0 -96 L30 -62Z" ' + f("#8B6BE8", 2.4) + '/>';
    s += '<path d="M-42 -112 V-122 M42 -112 V-122 M0 -96 V-108" stroke="#6B4A2B" stroke-width="2.4"/><path d="M-42 -122 L-32 -118 L-42 -114Z M42 -122 L52 -118 L42 -114Z M0 -108 L10 -104 L0 -100Z" ' + f("#FFD23F", 1.2) + "/>";
    s += '<path d="M-10 0 V-18 Q0 -34 10 -18 V0Z" fill="#5A3A24" stroke="#2F1E12" stroke-width="1.8"/><rect x="-46" y="-70" width="8" height="14" rx="4" fill="#8A97BE"/><rect x="38" y="-70" width="8" height="14" rx="4" fill="#8A97BE"/><rect x="-5" y="-54" width="10" height="14" rx="5" fill="#8A97BE"/>';
    s += '<path d="M-40 -62 V-68 H-32 V-62 M-24 -62 V-68 H-16 V-62 M16 -62 V-68 H24 V-62 M32 -62 V-68 H40 V-62" fill="none" stroke="#B3B9DA" stroke-width="3"/>';
    return s;
  }
  function chair(o) {
    var c = o.c || "#C48A52";
    return '<rect x="-17" y="-52" width="6" height="52" ' + f(dk(c, 0.1), 1.8) + '/><rect x="11" y="-18" width="6" height="18" ' + f(dk(c, 0.1), 1.8) + '/><rect x="-17" y="-52" width="6" height="34" ' + f(c, 1.8) + '/><rect x="-14" y="-48" width="22" height="5" rx="2" ' + f(c, 1.6) + '/><rect x="-14" y="-38" width="22" height="5" rx="2" ' + f(c, 1.6) + '/><rect x="-18" y="-22" width="36" height="8" rx="3" ' + f(c, 2.2) + '/><rect x="-14" y="-14" width="5" height="14" ' + f(dk(c, 0.1), 1.6) + '/><rect x="9" y="-14" width="5" height="14" ' + f(dk(c, 0.1), 1.6) + "/>";
  }
  function partyhat(o) {
    var c = o.c || "#FF6FA0";
    return '<path d="M-12 0 L0 -34 L12 0Z" ' + f(c, 2.2) + '/><path d="M-8 -10 L6 -16 M-4 -4 L9 -7 M-5 -22 L3 -25" stroke="#FFE066" stroke-width="3" stroke-linecap="round"/><circle cx="0" cy="-36" r="5" ' + f("#FFD23F", 1.8) + '/><ellipse cx="0" cy="0" rx="12" ry="3" ' + f(dk(c, 0.15), 1.6) + "/>";
  }
  function balloons(o) {
    var P = [[-18, -60, "#E5483A"], [0, -70, "#3D8BF2"], [18, -60, "#FFC93C"]], s = "", i;
    for (i = 0; i < P.length; i++) s += '<path d="M' + P[i][0] + " " + (P[i][1] + 14) + " Q" + (P[i][0] + (i - 1) * -6) + " " + (P[i][1] + 34) + " " + (i - 1) * 4 + ' 0" fill="none" stroke="#7A6A5A" stroke-width="1.2"/><ellipse cx="' + P[i][0] + '" cy="' + P[i][1] + '" rx="12" ry="14.4" ' + f(P[i][2], 2.2) + '/><path d="M' + (P[i][0] - 2.4) + " " + (P[i][1] + 14) + " h4.8 l-2.4 3.4Z" + '" fill="' + dk(P[i][2], 0.2) + '"/><ellipse cx="' + (P[i][0] - 4.4) + '" cy="' + (P[i][1] - 6) + '" rx="2.6" ry="4.6" transform="rotate(20 ' + (P[i][0] - 4.4) + " " + (P[i][1] - 6) + ')" fill="#fff" opacity=".5"/>';
    return s;
  }
  function xtree(o) {
    var s = '<rect x="-6" y="-10" width="12" height="10" rx="2" ' + f("#9B6A3C", 1.8) + '/><path d="M-26 -10 H26 L10 -36 H20 L4 -62 H12 L0 -88 L-12 -62 H-4 L-20 -36 H-10Z" ' + f("#3FA45E", 2.6) + '/><path d="M-18 -28 Q0 -22 18 -28 M-12 -52 Q0 -46 12 -52" fill="none" stroke="#FFE9A8" stroke-width="2.4" stroke-linecap="round"/>', P = [[-12, -18, "#E5483A"], [10, -26, "#3D8BF2"], [-4, -44, "#FFD23F"], [8, -56, "#E5483A"], [-6, -70, "#3D8BF2"]], i;
    for (i = 0; i < P.length; i++) s += '<circle cx="' + P[i][0] + '" cy="' + P[i][1] + '" r="3.6" fill="' + P[i][2] + '" stroke="#fff" stroke-width="1"/>';
    return s + star(0, -92, 8, "#FFD23F");
  }
  function dice(o) {
    var n = o.n || 5, pips = { 1: [[0, 0]], 2: [[-5, -5], [5, 5]], 3: [[-5, -5], [0, 0], [5, 5]], 4: [[-5, -5], [5, -5], [-5, 5], [5, 5]], 5: [[-5, -5], [5, -5], [0, 0], [-5, 5], [5, 5]], 6: [[-5, -5], [5, -5], [-5, 0], [5, 0], [-5, 5], [5, 5]] }, s = "", i;
    s = '<path d="M-14 -22 L-8 -30 H20 L14 -22Z" ' + f("#F4F6FA", 1.8) + '/><path d="M14 -22 L20 -30 V-8 L14 0Z" ' + f("#D8DEEA", 1.8) + '/><rect x="-14" y="-22" width="28" height="22" rx="3" ' + f("#FFFFFE", 2.2) + "/>";
    for (i = 0; i < pips[n].length; i++) s += '<circle cx="' + pips[n][i][0] + '" cy="' + (-11 + pips[n][i][1]) + '" r="2.3" fill="#E5483A"/>';
    return s;
  }
  function board(o) {
    var s = '<rect x="-34" y="-8" width="68" height="8" rx="2" ' + f("#8A5A2B", 1.8) + '/><path d="M-34 -8 L-24 -34 H24 L34 -8Z" ' + f("#FFF3D6", 2.2) + "/>", r, c, x0, x1, y;
    for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) if ((r + c) % 2 === 0) {
      y = -34 + r * 6.5;
      x0 = -24 - (r * 10) / 4 + c * ((48 + (r * 20) / 4) / 4);
      s += '<path d="M' + x0.toFixed(1) + " " + y + " h" + ((48 + (r * 20) / 4) / 4).toFixed(1) + " l" + (-2.5).toFixed(1) + ' 6.5 h-' + ((48 + (r * 20) / 4) / 4 + 0.5).toFixed(1) + 'Z" fill="#8B6BE8" opacity=".85"/>';
    }
    return s + '<circle cx="-8" cy="-26" r="4.4" ' + f("#E5483A", 1.6) + '/><circle cx="12" cy="-18" r="4.4" ' + f("#3D8BF2", 1.6) + "/>";
  }
  function staff(o) {
    var s = '<rect x="-34" y="-40" width="68" height="40" rx="6" ' + f("#FFFFFE", 2.2) + "/>", i;
    for (i = 0; i < 5; i++) s += '<path d="M-28 ' + (-32 + i * 5.4) + ' H28" stroke="#9FB3D1" stroke-width="1.4"/>';
    s += '<ellipse cx="-16" cy="-15" rx="4" ry="3" transform="rotate(-20 -16 -15)" fill="' + INK + '"/><path d="M-12.4 -16 V-34" stroke="' + INK + '" stroke-width="1.8"/><ellipse cx="0" cy="-20" rx="4" ry="3" transform="rotate(-20 0 -20)" fill="' + INK + '"/><path d="M3.6 -21 V-38" stroke="' + INK + '" stroke-width="1.8"/><ellipse cx="16" cy="-25" rx="4" ry="3" transform="rotate(-20 16 -25)" fill="' + INK + '"/><path d="M19.6 -26 V-40" stroke="' + INK + '" stroke-width="1.8"/>';
    return s;
  }
  function doll(o) {
    var skin = "#FFD7B5", dress = o.c || "#FF7FA8", hair = "#B8662E";
    return ln(-5, -18, -5, -4, 5, skin) + ln(5, -18, 5, -4, 5, skin) + '<ellipse cx="-5" cy="-2" rx="5" ry="2.6" ' + f("#E5483A", 1.4) + '/><ellipse cx="5" cy="-2" rx="5" ry="2.6" ' + f("#E5483A", 1.4) + "/>" +
      ln(-10, -34, -17, -22, 4.4, skin) + ln(10, -34, 17, -22, 4.4, skin) + path("M-9 -38 L9 -38 L16 -14 H-16Z", dress, 2.2) + '<path d="M-14 -18 Q0 -14 14 -18" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>' +
      '<circle cx="-14" cy="-50" r="6.6" ' + f(hair, 1.8) + '/><circle cx="14" cy="-50" r="6.6" ' + f(hair, 1.8) + '/><circle cx="0" cy="-48" r="11" ' + f(skin, 2.2) + '/><path d="M-11 -52 Q0 -64 11 -52 Q4 -55 0 -58 Q-6 -55 -11 -52Z" ' + f(hair, 1.6) + '/><circle cx="-11" cy="-56" r="2.6" fill="#FF6FA0"/><circle cx="11" cy="-56" r="2.6" fill="#FF6FA0"/><circle cx="-4" cy="-48" r="1.5" fill="' + INK + '"/><circle cx="4" cy="-48" r="1.5" fill="' + INK + '"/><circle cx="-7" cy="-44" r="2" fill="#FF9DB5" opacity=".6"/><circle cx="7" cy="-44" r="2" fill="#FF9DB5" opacity=".6"/><path d="M-2.4 -43 Q0 -41 2.4 -43" fill="none" stroke="#B3442F" stroke-width="1.4" stroke-linecap="round"/>';
  }
  function robot(o) {
    var c = o.c || "#E5483A";
    return ln(-8, -12, -8, -2, 5, "#8A97AD") + ln(8, -12, 8, -2, 5, "#8A97AD") + '<rect x="-12" y="-14" width="6" height="3" rx="1.5" fill="#6B7285"/><rect x="6" y="-14" width="6" height="3" rx="1.5" fill="#6B7285"/><rect x="-16" y="-42" width="32" height="30" rx="5" ' + f(c, 2.4) + '/><rect x="-9" y="-36" width="18" height="10" rx="2" ' + f("#FFE066", 1.6) + '/><circle cx="-4" cy="-18" r="2.2" fill="#FFFFFE"/><circle cx="4" cy="-18" r="2.2" fill="#6AA7FF"/>' +
      ln(-17, -36, -26, -26, 4.4, "#8A97AD") + ln(17, -36, 26, -26, 4.4, "#8A97AD") + '<rect x="-12" y="-60" width="24" height="18" rx="4" ' + f("#B8C0D4", 2.2) + '/><circle cx="-5" cy="-52" r="3.2" fill="#FFFFFE" stroke="' + INK + '" stroke-width="1.2"/><circle cx="5" cy="-52" r="3.2" fill="#FFFFFE" stroke="' + INK + '" stroke-width="1.2"/><circle cx="-5" cy="-52" r="1.4" fill="' + INK + '"/><circle cx="5" cy="-52" r="1.4" fill="' + INK + '"/><path d="M0 -60 V-68" stroke="#6B7285" stroke-width="2.4"/><circle cx="0" cy="-70" r="3.4" fill="#E5483A"/>';
  }
  function topk(o) {
    var s = '<path d="M-5 -34 V-42 H5 V-34Z" ' + f("#8A5A2B", 1.6) + '/><path d="M-18 -34 H18 Q18 -16 4 -2 H-4 Q-18 -16 -18 -34Z" ' + f("#E5483A", 2.4) + '/><path d="M-17 -27 H17 M-14 -19 H14" stroke="#FFD23F" stroke-width="3.4"/><path d="M-3 -2 L0 5 L3 -2Z" fill="#6B7285"/>';
    return s + '<path d="M-26 -40 Q-22 -46 -16 -46 M26 -40 Q22 -46 16 -46" fill="none" stroke="#B9C7DD" stroke-width="3" stroke-linecap="round"/>';
  }
  function watchk(o) {
    return '<rect x="-7" y="-52" width="14" height="22" rx="3" ' + f("#E5483A", 1.8) + '/><rect x="-7" y="-8" width="14" height="22" rx="3" ' + f("#E5483A", 1.8) + '/><circle cx="0" cy="-16" r="19" ' + f("#C9CEE8", 2.4) + '/><circle cx="0" cy="-16" r="15" ' + f("#FFFFFE", 1.8) + '/><path d="M0 -16 V-27 M0 -16 L8 -12" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/><circle cx="0" cy="-16" r="1.8" fill="#E5483A"/><path d="M0 -29 V-27 M0 -5 V-3 M-13 -16 H-11 M11 -16 H13" stroke="' + INK + '" stroke-width="1.6"/>';
  }
  function coatk(o) {
    var c = o.c || "#D9483B";
    return '<path d="M0 -76 V-68 M0 -68 Q-8 -66 -22 -58 M0 -68 Q8 -66 22 -58" fill="none" stroke="#8A97AD" stroke-width="3" stroke-linecap="round"/><path d="M-16 -64 H16 L26 -58 L36 -26 L28 -22 L24 -36 L24 0 H-24 L-24 -36 L-28 -22 L-36 -26 L-26 -58Z" ' + f(c, 2.6) + '/><path d="M-16 -64 L0 -42 L16 -64" fill="' + dk(c, 0.18) + '" stroke="' + dk(c) + '" stroke-width="2" stroke-linejoin="round"/><path d="M0 -42 V0" stroke="' + dk(c, 0.4) + '" stroke-width="2"/><circle cx="-5" cy="-30" r="2.6" fill="#FFD23F"/><circle cx="-5" cy="-16" r="2.6" fill="#FFD23F"/><path d="M-20 -8 H-8 M8 -8 H20" stroke="' + dk(c, 0.3) + '" stroke-width="1.6"/>';
  }
  function shoek(o) {
    var c = o.c || "#E5483A";
    return '<path d="M-30 0 V-12 Q-30 -22 -20 -24 L-6 -26 Q2 -34 14 -32 L18 -22 Q34 -20 36 -10 V0Z" ' + f(c, 2.6) + '/><rect x="-32" y="-6" width="70" height="8" rx="4" ' + f("#FFFFFE", 2.2) + '/><path d="M-2 -28 L8 -22 M2 -33 L12 -26" stroke="#FFFFFE" stroke-width="2.6" stroke-linecap="round"/><path d="M-24 -18 Q-12 -22 2 -18" fill="none" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/>';
  }
  function bills(o) {
    return '<g transform="rotate(-8)"><rect x="-22" y="-14" width="44" height="22" rx="3" ' + f("#7FD08A", 2.2) + '/><circle cx="0" cy="-3" r="6.4" fill="none" stroke="' + dk("#7FD08A", 0.35) + '" stroke-width="1.8"/><text x="0" y="1.6" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="8" fill="' + dk("#7FD08A", 0.4) + '">$</text><circle cx="-15" cy="-3" r="2" fill="' + dk("#7FD08A", 0.3) + '"/><circle cx="15" cy="-3" r="2" fill="' + dk("#7FD08A", 0.3) + '"/></g>';
  }
  function knife(o) {
    return '<rect x="-30" y="-6" width="18" height="9" rx="4" ' + f("#8A5A2B", 1.8) + '/><path d="M-12 -6 H32 Q34 -6 30 -1 L-12 3Z" ' + f("#D5DDEB", 1.8) + '/><path d="M-8 -3 H24" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>';
  }
  function blocks(o) {
    var s = "", P = [[-14, -9, "#E5483A"], [4, -9, "#3D8BF2"], [22, -9, "#FFC93C"], [-5, -27, "#6CCB5F"], [13, -27, "#8B6BE8"], [4, -45, "#FF8FB1"]], i;
    for (i = 0; i < P.length; i++) s += '<rect x="' + (P[i][0] - 9) + '" y="' + (P[i][1] - 9) + '" width="18" height="18" rx="2.4" ' + f(P[i][2], 2) + '/><rect x="' + (P[i][0] - 6) + '" y="' + (P[i][1] - 6) + '" width="6" height="4" rx="1" fill="#fff" opacity=".35"/>';
    return s;
  }
  function easel(o) {
    return '<path d="M-24 0 L-10 -62 M24 0 L10 -62 M0 -4 V-40" stroke="#8A5A2B" stroke-width="4.4" stroke-linecap="round"/><rect x="-26" y="-64" width="52" height="40" rx="2" ' + f("#FFFFFE", 2.4) + '/><rect x="-26" y="-26" width="52" height="4" fill="#8A5A2B"/>' + (o.drawn ? '<path d="M-9 -50 L-7 -60 L-1 -52Z M9 -50 L7 -60 L1 -52Z" ' + f("#FFA94D", 1.6) + '/><circle cx="0" cy="-45" r="10.5" ' + f("#FFA94D", 1.8) + '/><circle cx="-4" cy="-47" r="1.4" fill="' + INK + '"/><circle cx="4" cy="-47" r="1.4" fill="' + INK + '"/><path d="M-1.4 -43.4 L1.4 -43.4 L0 -41.8Z" fill="#E5648A"/><path d="M-9 -44 L-16 -45 M-9 -42 L-16 -41 M9 -44 L16 -45 M9 -42 L16 -41" stroke="' + INK + '" stroke-width="1" stroke-linecap="round"/>' : "");
  }
  function txt(o) {
    return '<text x="0" y="0" text-anchor="middle" font-family="' + FONT + '" font-weight="700" font-size="' + (o.size || 16) + '" fill="' + (o.c || "#6A48E8") + '">' + (o.t || "") + "</text>";
  }
  function eyebig(o) {
    return '<path d="M-26 0 Q0 -22 26 0 Q0 22 -26 0Z" ' + f("#FFFFFE", 2.6) + '/><circle cx="0" cy="0" r="11" ' + f("#6AA7FF", 2) + '/><circle cx="0" cy="0" r="5" fill="' + INK + '"/><circle cx="-3.6" cy="-3.6" r="2.6" fill="#fff"/><path d="M-26 0 Q0 -22 26 0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><path d="M-20 -8 L-26 -14 M-8 -14 L-10 -22 M8 -14 L10 -22 M20 -8 L26 -14" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>';
  }
  function glass(o) {
    return '<path d="M-14 -34 L-11 0 H11 L14 -34Z" fill="#E4F4FF" fill-opacity=".85" stroke="#8FB5D6" stroke-width="2.4" stroke-linejoin="round"/><path d="M-13 -24 L-11 -2 H11 L13 -24Q0 -20 -13 -24Z" fill="#8FD0F2" opacity=".85"/>';
  }
  function duck1(o) {
    var b = o.c || "#FFD93D", wl = dk(b, 0.2);
    var s = ln(0, -4, 0, 12, 3.4, "#FF9F2E") + '<path d="M-6 12 L6 12 L10 15 L-10 15Z" ' + f("#FF9F2E", 1.6) + "/>";
    s += '<ellipse cx="0" cy="-17" rx="17.5" ry="15.5" ' + f(b) + '/><path d="M-13 -22 Q-20 -12 -9 -8 Q-3 -13 -5 -22Z" ' + f(wl, 1.8) + "/>";
    s += '<circle cx="0" cy="-41" r="12.5" ' + f(b) + '/><path d="M-2 -53 Q1 -58 4 -53" fill="none" stroke="' + dk(b) + '" stroke-width="2" stroke-linecap="round"/><ellipse cx="0" cy="-37" rx="7.5" ry="4.4" ' + f("#FF9F2E", 1.8) + "/>";
    s += '<ellipse cx="-5.4" cy="-44" rx="1.9" ry="2.4" fill="' + INK + '"/><ellipse cx="5.4" cy="-44" rx="1.9" ry="2.4" fill="' + INK + '"/><circle cx="-9" cy="-39" r="2.2" fill="#FF9DB5" opacity=".55"/><circle cx="9" cy="-39" r="2.2" fill="#FF9DB5" opacity=".55"/>';
    return s;
  }
  function shade(o) {
    return '<ellipse cx="0" cy="0" rx="22" ry="5" fill="#5B7F47" opacity=".35"/>';
  }
  // a box with its lid shut (the same size as the open box of sightwords-art.js, front face 44 x 27)
  function cbox(o) {
    var c = o.c || "#DBA860";
    return '<path d="M-22 -27 L-16 -36 H16 L22 -27Z" ' + f("#E8BE7C", 2.2) + '/><rect x="-22" y="-27" width="44" height="27" rx="2.5" ' + f(c, 2.2) + '/><path d="M-4 -36 H4 L5 -27 H-5Z" fill="#F4E1B6" stroke="' + dk(c) + '" stroke-width="1.4"/><rect x="-5" y="-27" width="10" height="13" fill="#F4E1B6" stroke="' + dk(c) + '" stroke-width="1.4"/><rect x="8" y="-10" width="11" height="6" rx="1.4" fill="#FFFFFE" stroke="' + dk(c) + '" stroke-width="1.2"/>';
  }
  function dirt(o) {
    return '<path d="M-40 0 Q-34 -10 -14 -9 Q0 -14 16 -9 Q36 -10 40 0Z" ' + f("#A8713A", 2) + '/><circle cx="-20" cy="-3" r="2.4" fill="#8A5A2B"/><circle cx="8" cy="-4" r="2" fill="#8A5A2B"/><circle cx="26" cy="-2.4" r="1.8" fill="#C99A5E"/>';
  }
  function jewel(o) {
    return '<path d="M-6 -22 L6 -22 L10 -30 L-10 -30Z" ' + f("#7FD7F0", 1.6) + '/><circle cx="0" cy="-10" r="13" fill="none" stroke="#B8860B" stroke-width="7"/><circle cx="0" cy="-10" r="13" fill="none" stroke="#FFD23F" stroke-width="3.6"/><path d="M-5 -26 L0 -31 L5 -26Z" fill="#FFFFFE" opacity=".7"/>';
  }

  /* ------------------------------------------------------------------ the scenes (one for each word of stage 3) */
  function man(extra) {
    return X({ shirt: "#2E7D9A", pants: "#4A4A5A", hair: "#3A2A22" }, extra);
  }
  function rowOf(kind, n, x0, dx, y, s, opt, per) {
    var out = [], i, r, c;
    for (i = 0; i < n; i++) {
      r = per ? Math.floor(i / per) : 0;
      c = per ? i % per : i;
      out.push([kind, x0 + c * dx + (r % 2 ? dx / 2 : 0), y + r * (s * 30), s, opt && opt.call ? opt(i) : opt || {}]);
    }
    return out;
  }
  var CATW = { c: "#F8F4EC", l: "#FFFFFE" };
  var S3 = {
    // ---- Village green: farm life
    farm: [["fence", 60, G - 6, 0.95, { w: 110 }], ["barn", 176, G, 1.3], ["dog", 128, G, 1.25], ["kid", 84, G, 1.45, kb("jump", { mouth: "open" })]],
    farmer: [["barn", 190, G, 0.95], ["kid", 100, G, 1.65, man({ shirt: "#E5483A", pants: "#3D8BF2", hat: "#F2C14E" })], ["sparkle", 150, 40, 0.9]],
    cow: [["kid", 48, G, 1.3, kb("look", { look: 1 })], ["cow", 140, G, 1.85]],
    pig: [["shade", 126, G + 3, 1.2], ["whoosh", 56, G - 30, 1.3], ["pig", 128, G - 8, 1.9, { rot: -6 }], ["prints", 14, G + 6, 1, { n: 3 }], ["sparkle", 176, 62, 0.9]],
    sheep: [["kid", 52, G, 1.35, kg("point", { look: 1 })], ["sheep", 152, G, 1.9]],
    horse: [["horse", 124, G, 1.4], ["kid", 112, G - 56, 0.95, kb("hold", { mouth: "open" })], ["heart", 50, 44, 0.9]],
    chicken: [["kid", 50, G, 1.3, kg("point", { look: 1 })], ["chicken", 146, G, 1.45], ["crumbs", 100, G, 1.3]],
    corn: [["kid", 66, G, 1.45, kb("hold", { mouth: "open", look: 1 })], ["corn", 80, G - 52, 0.85, { rot: 62 }], ["kid", 172, G, 1.45, kg("hold", { mouth: "open", look: -1 })], ["corn", 186, G - 52, 0.85, { rot: 62 }]],
    grass: [["grass", 120, G + 8, 3.3, { w: 100 }], ["dog", 120, G + 2, 1.6], ["flower", 40, G, 1.0, { c: "#FFFFFE" }], ["flower", 200, G, 1.0, { c: "#FF8FB1" }]],
    seed: [["seeds", 112, G + 2, 2.6], ["bird", 150, G, 2.0, { flip: true }], ["sparkle", 80, 60, 0.9]],
    egg: [["table", 150, G, 1.5], ["plate", 150, G - 40, 1.7], ["egg", 150, G - 42, 1.35], ["kid", 64, G, 1.45, kb("look", { look: 1, mouth: "open" })]],
    milk: [["kid", 66, G, 1.45, kg("hold", { mouth: "open" })], ["milk", 138, G, 1.9], ["heart", 114, 38, 1.0]],
    bread: [["mom", 62, G, 1.55, { pose: "hold", look: 1 }], ["table", 164, G, 1.3], ["loaf", 164, G - 33, 1.15]],
    apple: [["kid", 80, G, 1.5, kb("hold", { mouth: "open" })], ["apple", 98, G - 36, 1.15], ["heart", 168, 60, 1.1]],
    drink: [["dog", 80, G, 1.7, { pose: "stand", flip: false }], ["bowl", 154, G, 1.5], ["splash", 154, G - 20, 0.7]],
    garden: [["fence", 120, G - 2, 1.5, { w: 150 }], ["flower", 40, G + 4, 1.2, { c: C.red }], ["flower", 74, G + 6, 1.0, { c: "#FFC93C" }], ["flower", 206, G + 4, 1.2, { c: C.purple }], ["flower", 174, G + 6, 1.0, { c: "#FF8FB1" }], ["kid", 92, G, 1.35, kg("jump", { mouth: "open" })], ["kid", 152, G, 1.25, kb("cheer", { mouth: "open" })]],
    flower: [["flower", 150, G, 2.1], ["kid", 60, G, 1.45, kg("look", { look: 1 })], ["sparkle", 196, 52, 0.9]],
    grow: [["sprout", 46, G, 1.5, { k: 1 }], ["arrow", 0, 0, 1, { x1: 66, y1: 108, x2: 90, y2: 108 }], ["tree", 118, G, 0.7], ["arrow", 0, 0, 1, { x1: 140, y1: 108, x2: 160, y2: 108 }], ["tree", 190, G, 1.2]],
    pick: [["ball", 100, G, 1.1, { c: C.blue }], ["ball", 134, G, 1.1, { c: C.red }], ["ball", 168, G, 1.1, { c: "#FFC93C" }], ["hl", 134, G - 14, 0.9, { r: 18 }], ["kid", 52, G, 1.45, kg("reach", { look: 1, mouth: "open" })]],
    got: [["kid", 90, G, 1.55, kb("cheer", { mouth: "open", hat: "#E5483A" })], ["gift", 170, G, 1.5, { open: true }]],
    house: [["house", 150, G, 2.1], ["kid", 52, G, 1.45, kb("look", { look: 1 })]],
    home: [["house", 168, G, 2.1], ["mom", 168, G + 1, 0.62, { pose: "wave", look: 0 }], ["kid", 54, G, 1.4, kb("walk", { look: 1 })], ["heart", 168, 34, 1.0]],
    door: [["door", 150, G, 1.9], ["kid", 78, G, 1.5, kg("reach", { look: 1 })], ["sparkle", 204, 60, 0.9]],
    window: [["window", 160, G - 14, 2.0, { sun: true }], ["kid", 68, G, 1.5, kb("look", { look: 1 })]],
    floor: [["boards", 0, 0, 1], ["cat", 112, G + 6, 1.9], ["arrow", 0, 0, 1, { x1: 204, y1: 84, x2: 204, y2: 118 }]],
    bring: [["dog", 108, G, 1.5, { pose: "run" }], ["ball", 150, G - 44, 0.7, { c: C.red }], ["kid", 196, G, 1.4, kg("reach", { look: -1, flip: true })], ["whoosh", 56, G - 18, 1.1]],
    carry: [["kid", 100, G, 1.5, kb("hold", { mouth: "open" })], ["bag", 130, G - 8, 1.3, { c: C.red }], ["sparkle", 186, 56, 0.9]],
    keep: [["kid", 90, G, 1.5, kg("hands", { mouth: "open", arms: "none" })], ["ball", 90, G - 17, 1.45, { c: C.red }], ["kid", 90, G, 1.5, kg("hands", { arms: "only" })], ["heart", 150, 50, 1.1], ["heart", 176, 82, 0.8]],
    // ---- Castle gate: town and people
    street: [["road", 0, 0, 1], ["bus", 112, G + 6, 1.2], ["trafficlight", 214, G - 2, 1.2]],
    car: [["kid", 98, G - 20, 0.8, kb("cheer", { mouth: "open" })], ["kid", 134, G - 20, 0.8, kg("wave", { mouth: "open" })], ["car", 116, G + 2, 1.9]],
    boat: [["pond", 120, G + 8, 1.6, { w: 100 }], ["boat", 126, G + 4, 1.5, { part: "sail" }], ["kid", 108, G - 4, 0.8, kb("wave", { mouth: "open" })], ["kid", 148, G - 4, 0.8, kg("cheer", { mouth: "open" })], ["boat", 126, G + 4, 1.5, { part: "hull" }]],
    way: [["prints", 14, G + 7, 1, { n: 5 }], ["signpost", 150, G, 1.8], ["kid", 70, G, 1.5, kb("walk", { look: 1 })]],
    bell: [["bell", 140, G, 1.9], ["kid", 54, G, 1.4, kg("look", { look: 1 })], ["sparkle", 196, 40, 0.8]],
    school: [["school", 148, G, 1.3], ["kid", 60, G, 1.4, kb("walk", { look: 1 })], ["bag", 46, G - 22, 0.7, { c: C.red }]],
    letter: [["table", 160, G, 1.4], ["letter", 168, G - 36, 1.3], ["pencil", 126, G - 36, 0.9], ["kid", 78, G, 1.5, kg("hold", { look: 1 })]],
    paper: [["table", 160, G, 1.4], ["paper", 170, G - 38, 1.2, { write: true }], ["pencil", 126, G - 38, 0.9, { rot: 18 }], ["kid", 78, G, 1.5, kb("hold", { look: 1 })]],
    picture: [["frame", 160, 122, 2.0], ["kid", 62, G, 1.5, kg("point", { look: 1 })]],
    name: [["tag", 170, 104, 2.1, { t: "Sam" }], ["kid", 66, G, 1.5, kb("self", { look: 0, mouth: "open" })]],
    goodbye: [["kid", 62, G, 1.45, kb("wave", { look: 1, mouth: "open" })], ["mom", 178, G, 1.55, { pose: "wave", look: -1, flip: true }], ["heart", 120, 46, 1.0]],
    man: [["kid", 112, G, 1.75, man({ pose: "stand", hat: "#8A5A2B" })], ["sparkle", 164, 44, 0.9]],
    men: [["kid", 76, G, 1.7, man({ pose: "wave" })], ["kid", 164, G, 1.7, man({ shirt: "#8B6BE8", hair: "#6B4423", pose: "stand" })], ["num", 120, 40, 1.3, { n: 2 }]],
    boy: [["kid", 112, G, 1.6, kb("stand", { hat: "#E5483A", look: 0, mouth: "open" })], ["sparkle", 160, 46, 0.9]],
    girl: [["kid", 100, G, 1.55, kg("hands", { mouth: "open" })], ["note", 154, 60, 1.3], ["note", 172, 42, 1.1, { c: "#FF6FA0" }], ["note", 190, 66, 1.2, { c: "#3D8BF2" }]],
    children: [["kid", 56, G, 1.4, kb("jump", { mouth: "open" })], ["kid", 120, G, 1.4, kg("cheer", { mouth: "open" })], ["kid", 184, G, 1.4, ky("run", { mouth: "open" })], ["ball", 150, G, 1.0, { c: C.red }]],
    baby: [["bed", 124, G, 2.1, { c: "#9ADCF5" }], ["baby", 104, G - 28, 1.0], ["zzz", 176, 56, 0.9]],
    mother: [["mom", 150, G, 1.7, { pose: "stand", look: -1 }], ["kid", 66, G, 1.45, kb("point", { look: 1 })], ["heart", 206, 50, 1.0]],
    father: [["kid", 150, G, 1.75, man({ pose: "stand", look: -1 })], ["kid", 70, G, 1.1, kb("wave", { look: 1, mouth: "open" })]],
    brother: [["kid", 76, G, 1.55, kb("jump", { mouth: "open" })], ["kid", 168, G, 1.3, kb("cheer", { mouth: "open", shirt: "#FFC93C" })], ["heart", 122, 44, 1.0]],
    sister: [["kid", 76, G, 1.5, kg("hands", { mouth: "open" })], ["kid", 168, G, 1.25, kg("cheer", { mouth: "open", shirt: "#8B6BE8" })], ["note", 122, 50, 1.2], ["heart", 132, 30, 0.8]],
    head: [["kid", 120, G, 1.6, kb("look", { mouth: "open", hat: "#E5483A" })], ["sparkle", 176, 40, 0.9]],
    hand: [["bighand", 164, G, 1.48], ["kid", 56, G, 1.5, kg("reach", { look: 1, mouth: "open" })], ["sparkle", 214, 40, 0.9], ["heart", 106, 44, 0.9]],
    leg: [["pond", 120, G + 8, 1.3, { w: 90 }], ["duck1", 120, G - 14, 1.6], ["num", 172, G - 14, 1.3, { n: 1 }]],
    feet: [["feet", 120, G - 58, 1.3], ["tub", 120, G, 1.7], ["foam", 120, G - 58, 1.2], ["bubbles", 190, 104, 1.0], ["bubbles", 50, 100, 0.8]],
    // ---- Dragon hill: weather, time and doing words
    fire: [["fire", 120, G, 2.4], ["sparkle", 70, 56, 0.9], ["sparkle", 176, 46, 0.7], ["kid", 40, G, 1.0, kb("look", { look: 1 })]],
    hill: [["hill", 120, G, 1.0, { dir: "up" }], ["kid", 94, G - 26, 1.35, kb("run", { mouth: "open" })], ["whoosh", 56, G - 52, 1.0]],
    ground: [["dirt", 120, G + 8, 2.4], ["ball", 120, G - 10, 1.4, { c: C.red }], ["arrow", 0, 0, 1, { x1: 120, y1: 38, x2: 120, y2: 70 }]],
    stick: [["dog", 110, G, 1.85], ["stick", 124, G - 50, 1.1, { rot: -8 }], ["sparkle", 186, 54, 0.9]],
    wood: [["crate", 100, G, 2.0], ["logs", 190, G, 1.15]],
    rain: [["raincloud", 120, 36, 2.0], ["puddle", 62, G + 8, 1.2], ["frog", 62, G + 6, 0.9], ["puddle", 204, G + 10, 1.0], ["kid", 140, G, 1.4, kg("hold", { look: 0, mouth: "open" })], ["umbrella", 160, G - 42, 1.0, { c: C.blue }]],
    snow: [["flake", 40, 40, 1.2], ["flake", 150, 26, 1], ["flake", 222, 66, 1.1], ["snowman", 176, G, 1.5], ["sled", 80, G, 1.2], ["kid", 126, G, 1.35, kg("cheer", { mouth: "open", hat: "#E5483A" })]],
    wind: [["whoosh", 40, 54, 1.3], ["whoosh", 56, 84, 1.0], ["kite", 160, G - 6, 1.4, { c: C.red }], ["kid", 100, G, 1.5, kb("hold", { look: 1 })], ["leaf", 46, 112, 1.2], ["leaf", 200, 100, 1.3, { c: "#E5483A" }]],
    sun: [["sunbig", 120, 78, 1.5], ["kid", 60, G, 1.3, kb("point", { look: 1 })]],
    water: [["tank", 120, G, 1.0, { w: 160, h: 106 }], ["fish", 118, G - 50, 1.2], ["bubbles", 70, G - 40, 0.6]],
    morning: [["sunbig", 206, 112, 0.85, { c: "#FFC93C", ray: "#FFE099" }], ["bird", 196, 44, 0.8, { fly: true }], ["kid", 58, G, 1.45, kb("wave", { look: 1, mouth: "open" })], ["mom", 150, G, 1.5, { pose: "wave", look: -1, flip: true }], ["sparkle", 112, 100, 0.8]],
    night: [["house", 120, G, 1.9], ["moon", 190, 38, 1.7], ["zzz", 156, 66, 1.0], ["star", 40, 34, 0.7], ["star", 84, 22, 0.55], ["star", 222, 84, 0.5]],
    day: [["sunbig", 196, 40, 0.8, { c: "#FFC93C", ray: "#FFE099" }], ["kid", 110, G, 1.55, kb("jump", { mouth: "open" })], ["ball", 160, G, 1.1, { c: C.red }], ["sparkle", 60, 60, 0.9]],
    time: [["clock", 62, 84, 2.2], ["table", 172, G, 1.3], ["plate", 172, G - 33, 1.2], ["apple", 172, G - 36, 0.8], ["kid", 124, G, 1.35, kg("cheer", { mouth: "open" })]],
    today: [["calendar", 76, 118, 1.7], ["school", 206, G, 0.7], ["kid", 148, G, 1.3, kb("walk", { look: 1 })]],
    hot: [["sunbig", 196, 42, 0.9, { c: "#FFC93C", ray: "#FFB347" }], ["kid", 100, G, 1.6, kr("stand", { look: 0 })], ["sweat", 128, 70, 1.1], ["sweat", 70, 76, 0.9]],
    warm: [["bed", 120, G, 2.1, { c: "#FF9A5C", sleeper: true }], ["heart", 178, 52, 1.0], ["heart", 66, 76, 0.7], ["sparkle", 52, 46, 0.8]],
    light: [["bulb", 120, 58, 2.2], ["kid", 56, G, 1.4, kb("look", { look: 1 })]],
    far: [["hill", 150, G, 1.0, { dir: "up" }], ["house", 206, G - 56, 0.55], ["kid", 56, G, 1.55, kb("look", { look: 1 })], ["line", 0, 0, 1, { x1: 84, y1: 110, x2: 196, y2: 82, dash: true, c: "#6A48E8", w: 3 }]],
    long: [["bus", 54, G, 0.62, { c: "#FFC83D" }], ["bus", 120, G, 0.62, { c: "#FFC83D" }], ["bus", 186, G, 0.62, { c: "#FFC83D" }], ["arrow", 0, 0, 1, { x1: 114, y1: 150, x2: 22, y2: 150 }], ["arrow", 0, 0, 1, { x1: 126, y1: 150, x2: 218, y2: 150 }]],
    fall: [["ball", 168, 26, 1.0, { c: C.red }], ["arrow", 0, 0, 1, { x1: 168, y1: 48, x2: 168, y2: 92 }], ["kid", 90, G, 1.5, kb("cheer", { mouth: "open", look: 1 })], ["whoosh", 200, 40, 0.8]],
    hurt: [["kid", 88, G, 1.6, kb("wave", { mouth: "sad", look: 0 })], ["tears", 88, G - 85, 1.45], ["pain", 122, 38, 1.0, { r: 16 }], ["bandhand", 122, 40, 1.35], ["bubble", 184, 50, 1.0, { w: 64, h: 36, inner: [["txt", 0, 6, 1, { t: "Ouch!", size: 15, c: "#E5483A" }]] }]],
    clean: [["cat", 120, G, 2.0, CATW], ["sparkle", 76, 60, 1.2], ["sparkle", 172, 52, 1.0], ["sparkle", 180, 96, 0.8], ["bubbles", 56, 104, 0.9]],
    start: [["trafficlight", 214, G, 1.2, { on: 2 }], ["kid", 70, G, 1.45, kb("run", { mouth: "open" })], ["kid", 128, G, 1.45, kg("run", { mouth: "open" })], ["whoosh", 20, G - 26, 1.0]],
    try: [["kid", 56, G, 1.35, kb("run", { op: 0.3 })], ["cbox", 116, G, 1.1], ["kid", 172, G - 4, 1.5, kg("jump", { mouth: "open" })], ["check", 204, 44, 0.9], ["sparkle", 150, 40, 0.8]],
    thing: [["cbox", 120, G, 2.2], ["qm", 76, 56, 1.0], ["qm", 164, 48, 1.2], ["qm", 120, 24, 0.9], ["kid", 40, G, 1.1, kb("point", { look: 1 })]],
    done: [["kid", 100, G, 1.6, kg("cheer", { mouth: "open" })], ["check", 176, 70, 1.6], ["sparkle", 56, 50, 0.9], ["sparkle", 204, 38, 0.7]],
    never: [["kid", 82, G, 1.5, kb("hands", { mouth: "open" })], ["dog", 148, G, 1.5, { flip: true }], ["heart", 116, 42, 1.2], ["arrow", 0, 0, 1, { x1: 182, y1: 92, x2: 232, y2: 92, c: "#6B7285" }], ["nosign", 207, 92, 1.0]],
    only: [["kid", 96, G, 1.55, kg("hold", { mouth: "open" })], ["hat", 114, G - 40, 0.9, { c: C.red }], ["num", 184, 60, 1.7, { n: 1 }]],
    own: [["bed", 138, G, 2.0, { c: "#F59AB7" }], ["tag", 190, 52, 1.0, { t: "Sam" }], ["kid", 56, G, 1.4, kb("point", { look: 1, mouth: "open" })], ["heart", 120, 40, 1.0]],
    // ---- Royal garden: animals and kind words
    tree: [["tree", 120, G, 1.6], ["bird", 112, 58, 0.8]],
    nest: [["tree", 154, G, 1.6], ["nest", 150, 72, 0.9], ["kid", 56, G, 1.4, kg("point", { look: 1 })]],
    bird: [["bird", 120, G, 2.4, {}], ["note", 62, 56, 1.3], ["note", 180, 44, 1.2, { c: "#FF6FA0" }], ["note", 200, 76, 1.0, { c: "#3D8BF2" }]],
    robin: [["cloud", 52, 38, 1.1], ["robin", 120, 108, 2.0, { fly: true }], ["whoosh", 56, 100, 1.0]],
    squirrel: [["tree", 124, G, 1.6], ["squirrel", 150, G - 34, 1.05]],
    rabbit: [["shade", 120, G + 4, 1.0], ["grass", 120, G + 4, 1.1, { w: 120 }], ["rabbit", 120, G - 32, 1.7], ["whoosh", 60, G - 22, 1.0, { rot: 90 }]],
    bear: [["bear", 148, G, 2.1], ["kid", 56, G, 1.0, kg("wave", { look: 1, mouth: "open" })]],
    cat: [["bed", 124, G, 2.1, { c: "#9ADCF5" }], ["cat", 104, G - 28, 1.3], ["heart", 176, 56, 0.9]],
    dog: [["dog", 112, G, 2.0], ["ball", 168, G, 1.2, { c: C.red }], ["sparkle", 176, 50, 0.9]],
    kitty: [["cat", 140, G, 1.25, { c: "#F5C98A", l: "#FFF0DA" }], ["kid", 56, G, 1.4, kb("look", { look: 1 })], ["heart", 196, 70, 0.8]],
    fish: [["pond", 150, G + 8, 1.3, { w: 70 }], ["fish", 150, G - 24, 1.5, { rot: -22 }], ["splash", 150, G - 4, 0.9], ["kid", 52, G, 1.45, kg("point", { look: 1 })]],
    duck: [["duck", 120, G - 6, 1.7], ["pond", 120, G + 8, 1.5, { w: 82 }], ["lily", 52, G + 6, 1.1], ["lily", 196, G + 8, 1.0]],
    eye: [["kid", 66, G, 1.5, kb("point", { look: 1 })], ["bubble", 160, 66, 1.0, { w: 92, h: 62, inner: [["eyebig", 0, 0, 1.2, {}]] }]],
    back: [["house", 184, G, 1.5], ["kid", 62, G, 1.5, kb("wave", { look: 1, mouth: "open" })], ["bubble", 120, 44, 0.95, { w: 78, h: 46, inner: [["clock", -17, 8, 0.58, {}], ["house", 18, 11, 0.44, {}]] }]],
    small: [["bird", 96, G, 0.7, { c: "#4FA8F0" }], ["bird", 184, G, 1.9, { c: "#9AA3B8" }], ["kid", 40, G, 1.4, kg("point", { look: 1 })], ["sparkle", 100, 84, 0.8]],
    full: [["box", 120, G, 2.1, { inner: [["ball", -12, -18, 0.9, { c: C.red }], ["ball", 8, -20, 0.9, { c: C.blue }], ["ball", -2, -28, 0.9, { c: "#FFC93C" }], ["ball", 14, -30, 0.8, { c: "#6CCB5F" }], ["ball", -14, -32, 0.8, { c: "#8B6BE8" }]] }], ["check", 196, 56, 1.0]],
    much: [["kid", 100, G, 1.55, kg("hands", { mouth: "open" })], ["cake", 100, G - 22, 0.9], ["heart", 150, 52, 1.2], ["heart", 176, 82, 0.9], ["heart", 60, 46, 0.9], ["heart", 130, 30, 0.8]],
    better: [["kid", 76, G, 1.55, kb("cheer", { mouth: "open" })], ["thought", 168, 52, 1.0, { w: 84, h: 56, inner: [["bed", 0, 24, 0.7, { sleeper: true, c: "#9ADCF5" }], ["cross", 24, -14, 0.5, {}]] }], ["sparkle", 112, 40, 0.9]],
    kind: [["kid", 80, G, 1.5, kg("reach", { look: 1, mouth: "open" })], ["apple", 120, G - 36, 0.9], ["kid", 174, G, 1.2, kb("reach", { look: -1, flip: true })], ["heart", 126, 38, 1.2]],
    laugh: [["kid", 76, G, 1.45, kb("hands", { mouth: "open" })], ["kid", 164, G, 1.45, kg("hands", { mouth: "open" })], ["txt", 76, 24, 1.0, { t: "ha ha", size: 15 }], ["txt", 164, 24, 1.0, { t: "ha ha", size: 15, c: "#E5483A" }]],
    show: [["kid", 70, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["hat", 114, G - 40, 0.85, { c: C.red }], ["kid", 180, G, 1.5, kg("look", { look: -1 })], ["sparkle", 116, 56, 0.9]],
    draw: [["easel", 164, G, 1.75, { drawn: true }], ["kid", 84, G, 1.5, kb("hold", { look: 1 })], ["pencil", 112, G - 42, 0.9, { rot: -30 }]],
    cut: [["table", 150, G, 1.6], ["cake", 144, G - 40, 1.1], ["knife", 126, 46, 0.75, { rot: 90 }], ["slice", 196, G - 42, 1.1], ["kid", 60, G, 1.5, kg("reach", { look: 1 })]],
    hold: [["kid", 96, G, 1.6, kb("hold", { mouth: "open", arms: "none" })], ["cat", 130, G - 36, 0.95], ["kid", 96, G, 1.6, kb("hold", { arms: "only" })], ["heart", 184, 52, 1.1]],
    myself: [["blocks", 168, G, 1.6], ["kid", 78, G, 1.55, kg("self", { mouth: "open" })], ["check", 204, 44, 0.9]],
    together: [["kid", 90, G, 1.5, kb("hands", { mouth: "open" })], ["kid", 140, G, 1.5, kg("hands", { mouth: "open", look: -1, flip: true })], ["heart", 115, 36, 1.3], ["blocks", 192, G, 1.0]],
    about: [["kid", 74, G, 1.5, kg("hold", { look: 1 })], ["book", 94, G - 30, 0.7], ["thought", 170, 50, 1.0, { w: 80, h: 56, inner: [["frog", 0, 22, 0.8, {}]] }]],
    // ---- Throne hall: parties, toys and numbers
    castle: [["hill", 120, G, 1.0, { dir: "up" }], ["castle", 138, G - 40, 0.75]],
    table: [["table", 120, G, 2.0], ["cake", 120, G - 52, 1.3], ["kid", 40, G, 1.1, kb("look", { look: 1 })]],
    chair: [["chair", 150, G, 1.95], ["kid", 70, G, 1.5, kg("point", { look: 1 })], ["arrow", 0, 0, 1, { x1: 150, y1: 56, x2: 150, y2: 80 }]],
    bed: [["bed", 138, G, 2.5, { c: "#9ADCF5" }], ["kid", 50, G, 1.3, kb("point", { look: 1, mouth: "open" })]],
    box: [["box", 120, G, 2.2], ["qm", 120, 38, 1.2], ["kid", 52, G, 1.35, kg("look", { look: 1 })]],
    party: [["balloons", 60, G, 1.4], ["balloons", 190, G, 1.3], ["kid", 96, G, 1.4, kb("cheer", { mouth: "open" })], ["partyhat", 96, G - 90, 0.9, { c: "#FF6FA0" }], ["kid", 146, G, 1.4, kg("jump", { mouth: "open" })], ["partyhat", 146, G - 106, 0.9, { c: "#3D8BF2" }]],
    birthday: [["cake", 150, G - 4, 2.0], ["kid", 66, G, 1.5, kb("cheer", { mouth: "open" })], ["partyhat", 66, G - 97, 0.95, { c: "#FF6FA0" }], ["gift", 206, G, 0.85, { c: C.blue }]],
    cake: [["table", 150, G, 1.5], ["cake", 150, G - 40, 1.4], ["kid", 70, G, 1.5, kg("cheer", { mouth: "open", hat: "#FFFFFE" })], ["sparkle", 196, 50, 0.9]],
    christmas: [["xtree", 150, G, 1.5], ["gift", 100, G, 0.8, { c: C.red }], ["gift", 204, G, 0.8, { c: C.blue }], ["kid", 56, G, 1.4, kg("cheer", { mouth: "open", hat: "#E5483A" })]],
    game: [["table", 120, G, 1.7], ["board", 120, G - 50, 1.5], ["dice", 150, G - 52, 0.8, { n: 5 }], ["kid", 46, G, 1.35, kb("reach", { look: 1 })], ["kid", 196, G, 1.35, kg("reach", { look: -1, flip: true })]],
    song: [["staff", 120, 64, 1.9], ["kid", 52, G, 1.4, kb("hands", { mouth: "open" })], ["kid", 188, G, 1.4, kg("hands", { mouth: "open" })], ["note", 80, 44, 1.2], ["note", 160, 96, 1.1, { c: "#FF6FA0" }]],
    doll: [["kid", 86, G, 1.6, kg("hold", { mouth: "open", arms: "none" })], ["doll", 118, G - 34, 0.9], ["kid", 86, G, 1.6, kg("hold", { arms: "only" })], ["star", 176, 50, 0.9, {}], ["sparkle", 46, 52, 0.8]],
    toy: [["robot", 150, G, 1.9], ["kid", 56, G, 1.45, kb("look", { look: 1 })], ["sparkle", 204, 50, 0.9]],
    top: [["cbox", 120, G, 1.9], ["top", 120, G - 70, 1.1], ["sparkle", 76, 60, 0.9], ["sparkle", 170, 52, 0.8]],
    ball: [["dog", 112, G, 1.5, { pose: "run" }], ["ball", 158, G - 30, 0.8, { c: C.red }], ["kid", 198, G, 1.4, kb("cheer", { mouth: "open", look: -1 })], ["whoosh", 50, G - 16, 1.0]],
    ring: [["jewel", 120, G, 3.0], ["sparkle", 66, 56, 1.0], ["sparkle", 176, 44, 0.8], ["kid", 40, G, 1.0, kg("look", { look: 1 })]],
    money: [["table", 150, G, 1.7], ["coin", 124, G - 48, 1.5], ["coin", 150, G - 50, 1.5], ["bills", 182, G - 50, 1.4], ["hat", 200, G - 62, 0.8, { c: C.red }], ["kid", 56, G, 1.35, kb("reach", { look: 1 })]],
    watch: [["kid", 70, G, 1.5, kb("look", { look: 1 })], ["bubble", 160, 66, 1.0, { w: 80, h: 66, inner: [["watch", 0, 22, 1.0, {}]] }]],
    coat: [["coat", 150, G - 12, 1.7], ["kid", 62, G, 1.45, kg("point", { look: 1 })], ["heart", 150, 28, 0.9]],
    shoe: [["shoe", 150, G, 2.2], ["kid", 56, G, 1.45, kb("look", { look: 1 })]],
    eight: [["num", 214, 28, 1.3, { n: 8 }]].concat(rowOf("bird", 8, 34, 52, 78, 1.0, {}, 4)),
    seven: [["num", 214, 28, 1.3, { n: 7 }]].concat(rowOf("duck", 7, 30, 44, 76, 0.85, {}, 4)),
    six: [["num", 214, 28, 1.3, { n: 6 }]].concat(rowOf("cat", 6, 44, 62, 78, 1.0, function (i) { return i % 2 ? CATW : {}; }, 3)),
    ten: [["tank", 120, G, 1.0, { w: 190, h: 110 }], ["num", 214, 28, 1.3, { n: 10 }]].concat(rowOf("fish", 10, 52, 34, 80, 0.5, function (i) { return { c: ["#FF9B3D", "#3D8BF2", "#FF6FA0", "#FFC93C", "#6CCB5F"][i % 5] }; }, 5)),
    shall: [["kid", 70, G, 1.5, kb("reach", { look: 1, mouth: "open" })], ["kid", 170, G, 1.5, kg("reach", { look: -1, flip: true })], ["bubble", 120, 36, 0.9, { w: 56, h: 34, inner: [["ball", 0, 14, 0.9, { c: C.red }]] }], ["qm", 200, 54, 0.9]],
    if: [["kid", 66, G, 1.5, kb("wave", { look: 1, mouth: "open" })], ["qm", 66, 22, 0.9], ["kid", 176, G, 1.5, kg("reach", { look: -1, flip: true })], ["arrow", 0, 0, 1, { x1: 150, y1: 96, x2: 100, y2: 96, c: "#6A48E8", dash: true }], ["heart", 130, 60, 0.9]],
  };
  // each scene's backdrop (the default is the park)
  var BG3 = { bread: "in", egg: "in", milk: "in", door: "in", window: "in", floor: "in", letter: "in", paper: "in", picture: "in", name: "in", baby: "in", chair: "in", table: "in", bed: "in", box: "in",
    party: "in", birthday: "in", cake: "in", christmas: "in", game: "in", song: "in", doll: "in", toy: "in", top: "in", money: "in", watch: "in", coat: "in", shoe: "in", done: "in", own: "in", thing: "in", only: "in",
    fire: "night", night: "night", light: "night", rain: "rain", snow: "snow", morning: "dawn", sun: "dusk", time: "in", today: "in", warm: "in", hot: "outns", day: "outns", back: "out", cat: "in", better: "in", draw: "in", cut: "in", much: "in",
    shall: "out", ring: "in", about: "in", together: "out", myself: "in", never: "in", pick: "out", got: "in", apple: "out", keep: "in", ball: "out", water: "in", clean: "in", street: "out" };
  A.extend({
    kit: { cow: cow, pig: pig, sheep: sheep, horse: horse, chicken: chicken, rabbit: rabbit, bear: bear, squirrel: squirrel, robin: robin, barn: barn, fence: fence, corn: corn, grass: grass, seeds: seeds, egg: egg, milk: milk, loaf: loaf,
      flower: flower, door: door, window: windowk, boards: boards, bowl: bowl, sprout: sprout, car: car, boat: boat, bell: bell, school: school, letter: letter, paper: paper, frame: frame, tag: tag, road: road, signpost: signpost,
      hl: hl, bighand: bighand, cbox: cbox, feet: feet, bandaid: bandaid, bandhand: bandhand, pain: pain, tears: tears, baby: baby, fire: fire, stick: stick, crate: crate, logs: logs, puddle: puddle, raincloud: raincloud, sled: sled, leaf: leaf, nest: nest, splash: splash, lily: lily, sunbig: sunbig,
      sweat: sweat, castle: castle, chair: chair, partyhat: partyhat, balloons: balloons, xtree: xtree, dice: dice, board: board, staff: staff, doll: doll, robot: robot, top: topk, watch: watchk, coat: coatk, shoe: shoek,
      bills: bills, knife: knife, blocks: blocks, easel: easel, txt: txt, eyebig: eyebig, glass: glass, duck1: duck1, shade: shade, dirt: dirt, jewel: jewel },
    scenes: S3,
    bgk: BG3,
    bg: { dawn: bgDawn, dusk: bgDusk, outns: bgParkNoSun },
  });
})(typeof window !== "undefined" ? window : this);
