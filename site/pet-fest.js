/* Festival items for the pets: clothes, hats and home decorations that can be bought only in the week before and after a
   festival. Items the child owns stay theirs forever (and can be worn or placed any time); only the shelf in the shop is seasonal.
   Needs pet-art.js (window.PetKit). Written for old Android WebViews (no optional chaining, no spread).
   To try another date: add ?festdate=2026-12-25 to the page address. */
(function () {
  var K = window.PetKit;
  if (!K) return;
  var G = K.G, body = K.body, hw = K.hw, gw = K.gw, sleeves = K.sleeves, strip = K.strip, dot = K.dot, star5 = K.star5, f1 = K.f1, sm = K.sm, OUT = K.OUT;
  var WINDOW_DAYS = 7;
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* ---------- Chinese New Year (lunar): a table, checked against the Hong Kong Observatory tables, 2026-2045 ---------- */
  var CNY = { 2026: '2026-02-17', 2027: '2027-02-06', 2028: '2028-01-26', 2029: '2029-02-13', 2030: '2030-02-03', 2031: '2031-01-23', 2032: '2032-02-11', 2033: '2033-01-31', 2034: '2034-02-19', 2035: '2035-02-08',
    2036: '2036-01-28', 2037: '2037-02-15', 2038: '2038-02-04', 2039: '2039-01-24', 2040: '2040-02-12', 2041: '2041-02-01', 2042: '2042-01-22', 2043: '2043-02-10', 2044: '2044-01-30', 2045: '2045-02-17' };

  /* ---------- little drawing helpers ---------- */
  function bat(x, y, s, delay) {
    return '<g class="flutter" style="animation-delay:' + delay + 's"><g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-4 -2Q-14 -16 -28 -8Q-21 -6 -23 1Q-14 -2 -9 5Z" fill="#2B2340" stroke="#15101F" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 -2Q14 -16 28 -8Q21 -6 23 1Q14 -2 9 5Z" fill="#2B2340" stroke="#15101F" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="0" cy="0" rx="6" ry="8" fill="#2B2340" stroke="#15101F" stroke-width="1.6"/><path d="M-5 -6L-6 -13L-1 -8M5 -6L6 -13L1 -8" fill="#2B2340" stroke="#15101F" stroke-width="1.4" stroke-linejoin="round"/><circle cx="-2.4" cy="-2" r="1.2" fill="#FF5C5C"/><circle cx="2.4" cy="-2" r="1.2" fill="#FF5C5C"/></g></g>';
  }
  function jack(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><ellipse cx="-14" cy="-14" rx="15" ry="14" fill="#F57C12" stroke="#A8480A" stroke-width="2.4"/><ellipse cx="14" cy="-14" rx="15" ry="14" fill="#F57C12" stroke="#A8480A" stroke-width="2.4"/><ellipse cx="0" cy="-15" rx="16" ry="16" fill="#FF8A1F" stroke="#A8480A" stroke-width="2.4"/>'
      + '<path d="M-4 -31Q-4 -39 3 -41" fill="none" stroke="#4E7F25" stroke-width="4" stroke-linecap="round"/><g class="twinkle" fill="#FFE27A"><path d="M-11 -19l5 -8 5 8z"/><path d="M1 -19l5 -8 5 8z"/><path d="M-11 -9l4 4 4 -4 4 4 4 -4 4 4 3 -5-2 -3z"/></g></g>';
  }
  function ghostFloat(x, y) {
    return '<g class="flutter"><g transform="translate(' + x + ',' + y + ')"><path d="M-17 20Q-20 -12 0 -18Q20 -12 17 20Q12 13 8.5 20Q4.5 13 0 20Q-4.5 13 -8.5 20Q-12 13 -17 20Z" fill="#F4F6FF" stroke="#9AA3C8" stroke-width="2.2" stroke-linejoin="round"/><ellipse cx="-6.5" cy="-2" rx="2.4" ry="3.6" fill="#2B2340"/><ellipse cx="6.5" cy="-2" rx="2.4" ry="3.6" fill="#2B2340"/><path d="M-4.5 6Q0 10 4.5 6" fill="none" stroke="#2B2340" stroke-width="2" stroke-linecap="round"/><circle cx="-11" cy="4" r="2.6" fill="#FF9DBB" opacity=".7"/><circle cx="11" cy="4" r="2.6" fill="#FF9DBB" opacity=".7"/></g></g>';
  }
  function web(v) {
    var y0 = v.y0, o = '<g fill="none" stroke="#9AA3C8" stroke-width="1.6" opacity=".8" stroke-linecap="round">', i, j, ang = [0, 30, 60, 90], R = [22, 40, 58, 74];
    ang.forEach(function (a) { var x = 74 * Math.cos(a * Math.PI / 180), y = 74 * Math.sin(a * Math.PI / 180); o += '<path d="M0 ' + y0 + 'L' + f1(x) + ' ' + f1(y0 + y) + '"/>'; });
    R.forEach(function (r) { for (i = 0; i < ang.length - 1; i++) { var a1 = ang[i] * Math.PI / 180, a2 = ang[i + 1] * Math.PI / 180, am = (a1 + a2) / 2, rc = r * .86;
      o += '<path d="M' + f1(r * Math.cos(a1)) + ' ' + f1(y0 + r * Math.sin(a1)) + 'Q' + f1(rc * Math.cos(am)) + ' ' + f1(y0 + rc * Math.sin(am)) + ' ' + f1(r * Math.cos(a2)) + ' ' + f1(y0 + r * Math.sin(a2)) + '"/>'; } });
    o += '</g>';
    o += '<g><path d="M52 ' + y0 + 'V' + (y0 + 40) + '" stroke="#9AA3C8" stroke-width="1.3" opacity=".9"/><g transform="translate(52,' + (y0 + 46) + ')"><path d="M-5 -2L-12 -7M-5 1L-13 2M-4 4L-11 9M5 -2L12 -7M5 1L13 2M4 4L11 9" stroke="#2B2340" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="0" cy="2" rx="5.5" ry="6" fill="#2B2340"/><circle cx="-2" cy="0" r="1.1" fill="#FF5C5C"/><circle cx="2" cy="0" r="1.1" fill="#FF5C5C"/></g></g>';
    return o;
  }
  function candyBowl(x, y) {
    var o = '<g transform="translate(' + x + ',' + y + ')"><g fill="#fff"><circle cx="-12" cy="-19" r="6.5" fill="#FF6B9A"/><circle cx="0" cy="-23" r="6.5" fill="#FFC93C"/><circle cx="12" cy="-19" r="6.5" fill="#6BCB77"/><circle cx="-5" cy="-15" r="6" fill="#4D96FF"/><circle cx="6" cy="-15" r="6" fill="#FF8A1F"/></g>'
      + '<path d="M-27 -14Q-27 7 0 9Q27 7 27 -14Z" fill="#7B4FD1" stroke="#4A2A9A" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="0" cy="-14" rx="27" ry="6" fill="#9770E8" stroke="#4A2A9A" stroke-width="2.4"/>'
      + '<path d="M-14 -6Q0 0 14 -6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>'
      + '<g transform="translate(-40,4)"><path d="M0 0L12 0L6 -14Z" fill="#FFC93C" stroke="#B8860B" stroke-width="1.4" stroke-linejoin="round"/><path d="M1.8 -4L10.2 -4L7.8 -9L4.2 -9Z" fill="#FF8A1F"/><path d="M4.4 -9L7.6 -9L6 -14Z" fill="#fff"/></g></g>';
    return o;
  }

  /* ---------- Halloween ---------- */
  function ghostGown(A, y1, f, s) {
    var t = A.top, L = [], R = [], y, w, wl = gw(A, y1, y1, 3, 9), n = 4, st = 2 * wl / n, hem = '', i;
    for (y = t; y < y1 - 4; y += 6) { w = gw(A, y, y1, 3, 9); L.push([f1(60 - w), y]); R.push([f1(60 + w), y]); }
    L.push([f1(60 - wl), y1 - 4]); R.push([f1(60 + wl), y1 - 4]); R.reverse();
    for (i = 0; i < n; i++) { var xa = 60 - wl + i * st, xb = xa + st; hem += 'Q' + f1((xa + xb) / 2) + ' ' + (y1 + 9) + ' ' + f1(xb) + ' ' + y1; }
    return '<path d="' + sm(L, true) + 'L' + f1(60 - wl) + ' ' + y1 + hem + 'L' + R[0][0] + ' ' + R[0][1] + sm(R, false) + 'Z" fill="' + f + '" stroke="' + s + '" stroke-width="3" stroke-linejoin="round"/>';
  }
  var HALLOWEEN = {
    id: 'halloween', name: 'Halloween', cn: '万圣节', greet: 'Happy Halloween!',
    date: function (y) { return new Date(y, 9, 31); },
    outfits: [
      { id: 'hw-pumpkin', name: 'Pumpkin suit', cn: '南瓜装', price: 10, draw: function (A) { var t = A.top, y1 = A.hem - 2, f = '#FF8A1F', s = '#B85A0A', o = '';
        [-1, 0, 1].forEach(function (k) { var xt = 60 + k * 12, xb = 60 + k * (gw(A, y1, y1, 3, 9) - 4), mid = (t + y1) / 2, xm = 60 + k * (gw(A, mid, y1, 3, 9) - 1);
          o += '<path d="M' + f1(xt) + ' ' + (t + 3) + 'Q' + f1(xm) + ' ' + f1(mid) + ' ' + f1(xb) + ' ' + (y1 - 2) + '" fill="none" stroke="#C96A12" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>'; });
        return { back: '', under: body(A, y1, 3, 9, f, s, 7) + o + '<path d="M44 ' + (t + 3) + 'Q35 ' + (t - 5) + ' 30 ' + (t + 5) + 'Q38 ' + (t + 9) + ' 44 ' + (t + 3) + 'Z" fill="#5DBB4A" stroke="#3F8F2F" stroke-width="2" stroke-linejoin="round"/>', over: '' }; } },
      { id: 'hw-witch', name: 'Witch robe', cn: '女巫袍', price: 10, draw: function (A, m) { var f = '#7B4FD1', s = '#4A2A9A', t = A.top, y1 = A.hem + 2, wy = f1(t + (y1 - t) * .36), o = '';
        [[-15, 18], [13, 28], [-2, 40]].forEach(function (p, i) { o += star5(60 + p[0], wy + p[1], i === 2 ? 4.4 : 5.2, '#FFD54A', '#B8860B'); });
        return { back: '', under: body(A, y1, 2, 10, f, s, 8) + o + strip(A, wy, y1, 2, 10, '#FF8A1F', 5) + '<rect x="54" y="' + (wy - 4) + '" width="12" height="9" rx="2" fill="#FFD54A" stroke="#B8860B" stroke-width="1.6"/>', over: sleeves(A, f, s, m, '#FF8A1F') }; } },
      { id: 'hw-vampire', name: 'Vampire cape', cn: '吸血鬼披风', price: 12, draw: function (A) { var f = '#2B2140', s = '#14101F', t = A.top, tw = f1(hw(A, t) + 4), cw = A.cw, hy = A.hem + 14, mid = f1(t + (hy - t) / 2);
        return { back: '<path d="M' + f1(60 - tw) + ' ' + (t - 2) + 'Q' + f1(60 - tw - 6) + ' ' + mid + ' ' + f1(60 - cw) + ' ' + hy + 'Q' + f1(60 - cw * .5) + ' ' + (hy + 10) + ' 60 ' + (hy + 1) + 'Q' + f1(60 + cw * .5) + ' ' + (hy + 10) + ' ' + f1(60 + cw) + ' ' + hy + 'Q' + f1(60 + tw + 6) + ' ' + mid + ' ' + f1(60 + tw) + ' ' + (t - 2) + 'Z" fill="' + f + '" stroke="' + s + '" stroke-width="3.5" stroke-linejoin="round"/><path d="M' + f1(60 - cw * .62) + ' ' + (hy - 4) + 'Q60 ' + (hy + 7) + ' ' + f1(60 + cw * .62) + ' ' + (hy - 4) + '" fill="none" stroke="#C0183C" stroke-width="3.4" stroke-linecap="round"/>',
          under: '', over: '<path d="M' + f1(60 - tw - 1) + ' ' + (t + 1) + 'Q60 ' + (t + 15) + ' ' + f1(60 + tw + 1) + ' ' + (t + 1) + '" fill="none" stroke="#14101F" stroke-width="6" stroke-linecap="round"/><path d="M' + f1(60 - tw - 1) + ' ' + (t + 1) + 'Q60 ' + (t + 15) + ' ' + f1(60 + tw + 1) + ' ' + (t + 1) + '" fill="none" stroke="#C0183C" stroke-width="2.2" stroke-linecap="round"/><circle cx="60" cy="' + (t + 12) + '" r="4" fill="#C0183C" stroke="#FFD54A" stroke-width="1.8"/>' }; } },
      { id: 'hw-ghost', name: 'Ghost gown', cn: '小幽灵装', price: 10, draw: function (A) { var y1 = A.hem + 4;
        return { back: '', under: ghostGown(A, y1, '#F4F6FF', '#9AA3C8') + '<ellipse cx="53" cy="' + (A.top + 26) + '" rx="3" ry="4.4" fill="#2B2340"/><ellipse cx="67" cy="' + (A.top + 26) + '" rx="3" ry="4.4" fill="#2B2340"/><path d="M55 ' + (A.top + 36) + 'Q60 ' + (A.top + 41) + ' 65 ' + (A.top + 36) + '" fill="none" stroke="#2B2340" stroke-width="2.2" stroke-linecap="round"/>', over: '' }; } }
    ],
    hats: [
      { id: 'hw-witchhat', name: 'Witch hat', cn: '女巫帽', price: 5, vb: '20 -10 80 70', a: { hx: 60, hy: 46, hs: 1 }, draw: function (a) { return G(a, '<ellipse cx="0" cy="4" rx="30" ry="7" fill="#2B2340" stroke="#15101F" stroke-width="2.5"/><path d="M-19 3Q-8 -4 -6 -26Q-4 -42 8 -54Q5 -40 10 -26Q13 -8 19 3Q0 8 -19 3Z" fill="#2B2340" stroke="#15101F" stroke-width="2.5" stroke-linejoin="round"/><path d="M-18 -3Q0 3 18 -3L17 -11Q0 -5 -17 -11Z" fill="#FF8A1F"/><rect x="-5" y="-11" width="10" height="9" rx="2" fill="#FFD54A" stroke="#B8860B" stroke-width="1.5"/>'); } },
      { id: 'hw-pumpkinhat', name: 'Pumpkin hat', cn: '南瓜帽', price: 5, vb: '20 6 80 50', a: { hx: 60, hy: 46, hs: 1 }, draw: function (a) { return G(a, '<ellipse cx="-9" cy="-8" rx="14" ry="12" fill="#F57C12" stroke="#A8480A" stroke-width="2.2"/><ellipse cx="9" cy="-8" rx="14" ry="12" fill="#F57C12" stroke="#A8480A" stroke-width="2.2"/><ellipse cx="0" cy="-8" rx="12" ry="13" fill="#FF8A1F" stroke="#A8480A" stroke-width="2.2"/><path d="M-1 -21Q-2 -28 4 -30" fill="none" stroke="#4E7F25" stroke-width="3.6" stroke-linecap="round"/><path d="M4 -24Q12 -30 17 -24Q11 -20 4 -24Z" fill="#5DBB4A" stroke="#3F8F2F" stroke-width="1.6" stroke-linejoin="round"/><g fill="#6A2B00"><path d="M-8 -11l3.5 -5 3.5 5z"/><path d="M1 -11l3.5 -5 3.5 5z"/><path d="M-7 -4l3 3 3 -3 3 3 3 -3 3 3 -1 -4z"/></g>'); } },
      { id: 'hw-bat', name: 'Little bat', cn: '小蝙蝠', price: 0, vb: '20 12 80 40', a: { hx: 60, hy: 46, hs: 1 }, draw: function (a) { return G(a, '<g transform="translate(0,-4) scale(1.15)"><path d="M-4 -2Q-14 -16 -28 -8Q-21 -6 -23 1Q-14 -2 -9 5Z" fill="#2B2340" stroke="#15101F" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 -2Q14 -16 28 -8Q21 -6 23 1Q14 -2 9 5Z" fill="#2B2340" stroke="#15101F" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="0" cy="0" rx="6" ry="8" fill="#2B2340" stroke="#15101F" stroke-width="1.6"/><path d="M-5 -6L-6 -13L-1 -8M5 -6L6 -13L1 -8" fill="#2B2340" stroke="#15101F" stroke-width="1.4" stroke-linejoin="round"/><circle cx="-2.4" cy="-2" r="1.2" fill="#FF5C5C"/><circle cx="2.4" cy="-2" r="1.2" fill="#FF5C5C"/></g>'); } }
    ],
    decos: [
      { id: 'hw-d-pumpkins', name: 'Jack-o-lanterns', cn: '南瓜灯', price: 6, front: true, icon: '<g transform="translate(30,52) scale(1.1)"><ellipse cx="-14" cy="-14" rx="15" ry="14" fill="#F57C12" stroke="#A8480A" stroke-width="2.4"/><ellipse cx="14" cy="-14" rx="15" ry="14" fill="#F57C12" stroke="#A8480A" stroke-width="2.4"/><ellipse cx="0" cy="-15" rx="16" ry="16" fill="#FF8A1F" stroke="#A8480A" stroke-width="2.4"/><g fill="#FFE27A"><path d="M-11 -19l5 -8 5 8z"/><path d="M1 -19l5 -8 5 8z"/><path d="M-11 -9l4 4 4 -4 4 4 4 -4 4 4 3 -5-2 -3z"/></g></g>',
        svg: function () { return jack(38, 283, 1.15) + jack(338, 286, .8); } },
      { id: 'hw-d-bats', name: 'Flying bats', cn: '飞舞的蝙蝠', price: 4, icon: '<g transform="translate(30,32) scale(.95)"><path d="M-4 -2Q-14 -16 -28 -8Q-21 -6 -23 1Q-14 -2 -9 5Z" fill="#2B2340"/><path d="M4 -2Q14 -16 28 -8Q21 -6 23 1Q14 -2 9 5Z" fill="#2B2340"/><ellipse cx="0" cy="0" rx="6" ry="8" fill="#2B2340"/><circle cx="-2.4" cy="-2" r="1.3" fill="#FF5C5C"/><circle cx="2.4" cy="-2" r="1.3" fill="#FF5C5C"/></g>',
        svg: function () { return bat(52, 128, 1, 0) + bat(318, 118, .9, 1.1) + bat(280, 160, .75, 2.1); } },
      { id: 'hw-d-web', name: 'Spooky web', cn: '蜘蛛网', price: 3, icon: '<g fill="none" stroke="#9AA3C8" stroke-width="2" stroke-linecap="round"><path d="M4 4L52 4M4 4L46 26M4 4L28 46M4 4L4 52"/><path d="M18 4Q15 12 12 18M18 4Q22 14 14 22M30 4Q26 18 20 30M44 4Q36 24 24 42M22 10Q14 12 10 22"/></g><g transform="translate(40,44)"><ellipse cx="0" cy="0" rx="6" ry="7" fill="#2B2340"/><path d="M-6 -2L-12 -6M-6 2L-13 4M6 -2L12 -6M6 2L13 4" stroke="#2B2340" stroke-width="1.6"/></g>',
        svg: function (v) { return web(v || { y0: 0 }); } },
      { id: 'hw-d-candy', name: 'Candy bowl', cn: '糖果碗', price: 5, icon: '<g transform="translate(30,40) scale(1.1)"><g><circle cx="-12" cy="-19" r="6.5" fill="#FF6B9A"/><circle cx="0" cy="-23" r="6.5" fill="#FFC93C"/><circle cx="12" cy="-19" r="6.5" fill="#6BCB77"/><circle cx="-5" cy="-15" r="6" fill="#4D96FF"/></g><path d="M-27 -14Q-27 7 0 9Q27 7 27 -14Z" fill="#7B4FD1" stroke="#4A2A9A" stroke-width="2.4"/><ellipse cx="0" cy="-14" rx="27" ry="6" fill="#9770E8" stroke="#4A2A9A" stroke-width="2.4"/></g>',
        svg: function () { return candyBowl(290, 276); } },
      { id: 'hw-d-ghost', name: 'Friendly ghost', cn: '小幽灵朋友', price: 6, icon: '<g transform="translate(30,32)"><path d="M-17 20Q-20 -12 0 -18Q20 -12 17 20Q12 13 8.5 20Q4.5 13 0 20Q-4.5 13 -8.5 20Q-12 13 -17 20Z" fill="#F4F6FF" stroke="#9AA3C8" stroke-width="2.2"/><ellipse cx="-6.5" cy="-2" rx="2.4" ry="3.6" fill="#2B2340"/><ellipse cx="6.5" cy="-2" rx="2.4" ry="3.6" fill="#2B2340"/><path d="M-4.5 6Q0 10 4.5 6" fill="none" stroke="#2B2340" stroke-width="2" stroke-linecap="round"/></g>',
        svg: function () { return ghostFloat(300, 150); } }
    ]
  };

  /* ---------- the other festivals: dates are ready, the items come later ---------- */
  var THANKSGIVING = { id: 'thanksgiving', name: 'Thanksgiving', cn: '感恩节', greet: 'Happy Thanksgiving!', outfits: [], hats: [], decos: [],
    date: function (y) { var d = new Date(y, 10, 1), first = (4 - d.getDay() + 7) % 7; return new Date(y, 10, 1 + first + 21); } };      // 4th Thursday of November
  var CHRISTMAS = { id: 'christmas', name: 'Christmas', cn: '圣诞节', greet: 'Merry Christmas!', outfits: [], hats: [], decos: [], date: function (y) { return new Date(y, 11, 25); } };
  var NEWYEAR = { id: 'newyear', name: 'Chinese New Year', cn: '中国新年', greet: 'Happy Chinese New Year! 新年快乐！', outfits: [], hats: [], decos: [],
    date: function (y) { var s = CNY[y]; if (!s) return null; var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); } };
  var CHILDREN = { id: 'children', name: "Children's Day", cn: '六一儿童节', greet: "Happy Children's Day! 儿童节快乐！", outfits: [], hats: [], decos: [], date: function (y) { return new Date(y, 5, 1); } };   // June 1
  var LIST = [HALLOWEEN, THANKSGIVING, CHRISTMAS, NEWYEAR, CHILDREN];

  /* ---------- registry ---------- */
  var byItem = {}, decoBy = {}, vbOutfit = '18 90 84 80';
  LIST.forEach(function (f) {
    f.outfits.forEach(function (o) { o.slot = 'body'; o.vb = o.vb || (o.id === 'hw-vampire' ? '8 90 104 96' : vbOutfit); o.icon = function () { var r = this.draw(OUT.def, 'x'); return window.softSvg(r.back + r.under + r.over); }; K.OUTFITS[o.id] = o; byItem[o.id] = f; });
    f.hats.forEach(function (h) { h.slot = 'hat'; K.ITEMS[h.id] = h; byItem[h.id] = f; });
    f.decos.forEach(function (d) { decoBy[d.id] = d; byItem[d.id] = f; });
  });

  /* ---------- dates ---------- */
  function today() {
    var q = /[?&]festdate=(\d{4})-(\d{1,2})-(\d{1,2})/.exec(window.location ? window.location.search : '');
    var n = q ? new Date(+q[1], +q[2] - 1, +q[3]) : new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function windowOf(f, now) {
    for (var y = now.getFullYear() - 1; y <= now.getFullYear() + 1; y++) {
      var d = f.date(y); if (!d) continue;
      if (now >= addDays(d, -WINDOW_DAYS) && now <= addDays(d, WINDOW_DAYS)) return { date: d, start: addDays(d, -WINDOW_DAYS), end: addDays(d, WINDOW_DAYS) };
    }
    return null;
  }
  function hasContent(f) { return f.outfits.length + f.hats.length + f.decos.length > 0; }
  function active(now) {
    now = now || today(); var out = [];
    LIST.forEach(function (f) { if (!hasContent(f)) return; var w = windowOf(f, now); if (w) out.push({ id: f.id, name: f.name, cn: f.cn, greet: f.greet, ends: MONTHS[w.end.getMonth()] + ' ' + w.end.getDate(), end: w.end,
      outfits: f.outfits.map(function (o) { return o.id; }), hats: f.hats.map(function (h) { return h.id; }), decos: f.decos.map(function (d) { return d.id; }) }); });
    return out;
  }
  function isActiveItem(id) { var f = byItem[id]; if (!f) return false; return active().some(function (a) { return a.id === f.id; }); }
  /* what the child owns from festivals that are not on the shelf right now (always wearable / placeable) */
  function collection(owned) {
    var act = {}; active().forEach(function (a) { act[a.id] = 1; });
    var out = { outfits: [], hats: [], decos: [] };
    LIST.forEach(function (f) { if (act[f.id]) return;
      f.outfits.forEach(function (o) { if (owned.indexOf(o.id) >= 0) out.outfits.push(o.id); });
      f.hats.forEach(function (h) { if (owned.indexOf(h.id) >= 0) out.hats.push(h.id); });
      f.decos.forEach(function (d) { if (owned.indexOf(d.id) >= 0) out.decos.push(d.id); }); });
    return out;
  }
  window.FEST = {
    list: LIST, active: active, today: today, collection: collection, isActiveItem: isActiveItem,
    greet: function () { var a = active(); return a.length ? a[0].greet : null; },
    festOf: function (id) { return byItem[id] || null; },
    deco: function (id) { return decoBy[id] || null; },
    windowDays: WINDOW_DAYS,
    windowOf: function (id, now) { for (var i = 0; i < LIST.length; i++) if (LIST[i].id === id) return windowOf(LIST[i], now || today()); return null; },
    dateOf: function (id, year) { for (var i = 0; i < LIST.length; i++) if (LIST[i].id === id) return LIST[i].date(year); return null; }
  };
})();
