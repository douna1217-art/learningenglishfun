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
  /* ---------- Thanksgiving: harvest colours, no pilgrim or feather-headdress costumes ---------- */
  // a leaf with a stalk (a maple-like leaf: five points), pointing up, about 22 wide
  function mapleLeaf(fill, stroke) {
    return '<path d="M0 12L0 4M0 4L-4 5L-3 0L-9 -1L-5 -5L-7 -10L-1 -8L0 -15L1 -8L7 -10L5 -5L9 -1L3 0L4 5Z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M0 11L0 -8" stroke="' + stroke + '" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>';
  }
  function fallingLeaf(x, y, s, rot, fill, stroke, delay) {
    return '<g class="flutter" style="animation-delay:' + delay + 's"><g transform="translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')">' + mapleLeaf(fill, stroke) + '</g></g>';
  }
  // a plain pumpkin (three lobes, a stalk and a curly leaf): no face, this is the harvest one
  function pumpkin(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><ellipse cx="-14" cy="-13" rx="14" ry="13" fill="#F28A1E" stroke="#A8520A" stroke-width="2.4"/><ellipse cx="14" cy="-13" rx="14" ry="13" fill="#F28A1E" stroke="#A8520A" stroke-width="2.4"/><ellipse cx="0" cy="-14" rx="14" ry="15" fill="#FF9A2E" stroke="#A8520A" stroke-width="2.4"/>'
      + '<path d="M-6 -26Q-8 -14 -6 -2M6 -26Q8 -14 6 -2" fill="none" stroke="#C96A12" stroke-width="2" stroke-linecap="round" opacity=".7"/>'
      + '<path d="M-2 -29Q-3 -36 2 -38" fill="none" stroke="#5B7A2A" stroke-width="4.4" stroke-linecap="round"/><path d="M3 -31Q12 -38 17 -31Q11 -29 6 -30Z" fill="#6DB33F" stroke="#3F7A22" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 -32Q16 -27 13 -24" fill="none" stroke="#3F7A22" stroke-width="1.4" stroke-linecap="round"/></g>';
  }
  function hayBale(x, y, s) {
    var o = '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><rect x="-26" y="-30" width="52" height="30" rx="5" fill="#EBC45A" stroke="#A8801C" stroke-width="2.4"/>', i;
    for (i = -18; i <= 18; i += 9) o += '<path d="M' + i + ' -28L' + (i + 3) + ' -2" stroke="#C99A2E" stroke-width="2" stroke-linecap="round" opacity=".8"/>';
    o += '<path d="M-26 -20H26M-26 -10H26" stroke="#B8862A" stroke-width="2.4" opacity=".75"/><path d="M-30 -30l6 -5M-24 -30l2 -7M24 -30l5 -6M18 -30l2 -8" stroke="#D8AE40" stroke-width="2" stroke-linecap="round"/></g>';
    return o;
  }
  // a string of little flags across the top of the picture (y0 = the top of what can be seen)
  function bunting(v) {
    var y0 = v.y0, cols = ['#E8603A', '#F6B52E', '#B8531E', '#7DB33F', '#E8603A', '#F6B52E', '#B8531E', '#7DB33F', '#E8603A'], i, o, ax = 4, ay = y0 + 8, bx = 356, by = y0 + 8, cx = 180, cy = y0 + 44;
    o = '<path d="M' + ax + ' ' + ay + 'Q' + cx + ' ' + cy + ' ' + bx + ' ' + by + '" fill="none" stroke="#6B4A2A" stroke-width="2.4" stroke-linecap="round"/>';
    for (i = 0; i < cols.length; i++) {
      var t = (i + 0.7) / (cols.length + 0.4), u = 1 - t, x = u * u * ax + 2 * u * t * cx + t * t * bx, y = u * u * ay + 2 * u * t * cy + t * t * by, ang = (t - 0.5) * 24;
      o += '<g transform="translate(' + f1(x) + ',' + f1(y) + ') rotate(' + f1(ang) + ')"><path d="M-15 0L15 0L0 30Z" fill="' + cols[i] + '" stroke="#6B4A2A" stroke-width="1.8" stroke-linejoin="round"/><g transform="translate(0,11) scale(.5)"><path d="M0 12L0 4M0 4L-4 5L-3 0L-9 -1L-5 -5L-7 -10L-1 -8L0 -15L1 -8L7 -10L5 -5L9 -1L3 0L4 5Z" fill="#FFF3D6" opacity=".9"/></g></g>';
    }
    return o;
  }
  // a small table with a roast turkey, a pie and two ears of corn
  function feastTable(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')"><path d="M-44 -22Q-48 -2 -44 0L-34 0L-34 -22Z" fill="#B8531E" opacity="0"/>'
      + '<path d="M-40 -24L-44 0M40 -24L44 0" stroke="#7A4A22" stroke-width="5" stroke-linecap="round"/>'
      + '<path d="M-50 -26L50 -26L56 -18Q0 -12 -56 -18Z" fill="#E8603A" stroke="#A8381A" stroke-width="2.4" stroke-linejoin="round"/><path d="M-30 -24L-32 -15M-12 -24L-13 -14M6 -24L6 -13M24 -24L26 -14" stroke="#FFF3D6" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>'
      + '<g transform="translate(-22,-26)"><ellipse cx="0" cy="-9" rx="15" ry="10" fill="#B8742E" stroke="#6B3E12" stroke-width="2.2"/><ellipse cx="-4" cy="-12" rx="6" ry="3.6" fill="#D9974A" opacity=".8"/><path d="M-13 -12L-24 -20" stroke="#E8D9B8" stroke-width="5" stroke-linecap="round"/><circle cx="-25" cy="-21" r="3.6" fill="#F3E9CF" stroke="#B8A57C" stroke-width="1.4"/><path d="M13 -12L24 -20" stroke="#E8D9B8" stroke-width="5" stroke-linecap="round"/><circle cx="25" cy="-21" r="3.6" fill="#F3E9CF" stroke="#B8A57C" stroke-width="1.4"/></g>'
      + '<g transform="translate(18,-26)"><ellipse cx="0" cy="-5" rx="15" ry="6" fill="#D9974A" stroke="#8E5A1E" stroke-width="2.2"/><ellipse cx="0" cy="-8" rx="13" ry="4.6" fill="#F0A93A" stroke="#8E5A1E" stroke-width="1.6"/><path d="M-9 -9L9 -7M-9 -7L9 -9" stroke="#C97A18" stroke-width="1.6" stroke-linecap="round"/></g>'
      + '<g transform="translate(40,-26)"><path d="M-3 0Q-7 -10 -3 -22Q3 -24 6 -14Q6 -4 3 0Z" fill="#F6C531" stroke="#B8860B" stroke-width="2" stroke-linejoin="round"/><path d="M-2 -4H4M-2 -9H5M-2 -14H4" stroke="#D9A21A" stroke-width="1.4" stroke-linecap="round"/><path d="M-5 0Q-12 -8 -9 -20" fill="none" stroke="#6DB33F" stroke-width="3" stroke-linecap="round"/></g></g>';
  }
  // a friendly scarecrow on a pole: a patched shirt, straw sticking out of the cuffs, a straw hat, two arms with straw hands
  function scarecrow(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')"><path d="M0 -118L0 0" stroke="#7A4A22" stroke-width="6" stroke-linecap="round"/><path d="M-46 -74L46 -74" stroke="#7A4A22" stroke-width="6" stroke-linecap="round"/>'
      + '<path d="M-16 -88L16 -88L22 -40L-22 -40Z" fill="#D9453B" stroke="#8E2A22" stroke-width="2.6" stroke-linejoin="round"/><path d="M-10 -80L10 -80M-12 -64L12 -64M-14 -50L14 -50" stroke="#F6E2B3" stroke-width="2" opacity=".7"/><rect x="-7" y="-74" width="10" height="10" rx="2" fill="#6DB33F" stroke="#3F7A22" stroke-width="1.6"/>'
      + '<path d="M-46 -74L-30 -80L-28 -68Z" fill="#D9453B" stroke="#8E2A22" stroke-width="2" stroke-linejoin="round"/><path d="M46 -74L30 -80L28 -68Z" fill="#D9453B" stroke="#8E2A22" stroke-width="2" stroke-linejoin="round"/>'
      + '<path d="M-46 -74l-7 -6M-46 -74l-9 1M-46 -74l-6 6M-46 -74l-3 -8M46 -74l7 -6M46 -74l9 1M46 -74l6 6M46 -74l3 -8" stroke="#E0B03A" stroke-width="3" stroke-linecap="round"/>'
      + '<path d="M-14 -40l-3 8M-6 -40l-1 9M2 -40l1 9M10 -40l3 8" stroke="#E0B03A" stroke-width="3" stroke-linecap="round"/>'
      + '<path d="M-10 -90l-3 -6M0 -90l0 -7M10 -90l3 -6" stroke="#E0B03A" stroke-width="3" stroke-linecap="round"/>'
      + '<circle cx="0" cy="-106" r="15" fill="#EBD3A0" stroke="#A8801C" stroke-width="2.4"/><circle cx="-5.5" cy="-108" r="2.4" fill="#3A2A1E"/><circle cx="5.5" cy="-108" r="2.4" fill="#3A2A1E"/><path d="M-6 -100Q0 -95 6 -100" fill="none" stroke="#3A2A1E" stroke-width="2" stroke-linecap="round"/><circle cx="-9.5" cy="-102" r="2.6" fill="#F0A0A0" opacity=".7"/><circle cx="9.5" cy="-102" r="2.6" fill="#F0A0A0" opacity=".7"/>'
      + '<path d="M-24 -116Q-24 -122 0 -122Q24 -122 24 -116L30 -113Q0 -108 -30 -113Z" fill="#E8C060" stroke="#A8801C" stroke-width="2.4" stroke-linejoin="round"/><path d="M-14 -122Q-14 -138 0 -138Q14 -138 14 -122Z" fill="#E8C060" stroke="#A8801C" stroke-width="2.4" stroke-linejoin="round"/><path d="M-14 -123H14" stroke="#B8531E" stroke-width="4"/>'
      + '<path d="M-22 -113l-6 6M-27 -113l-2 7M22 -113l6 6M27 -113l2 7" stroke="#E0B03A" stroke-width="2.6" stroke-linecap="round"/></g>';
  }
  var AUTUMN = [['#D9453B', '#8E2A22'], ['#F28A1E', '#A8520A'], ['#F6C531', '#B8860B'], ['#B8531E', '#6B3A12']];
  var THANKSGIVING = { id: 'thanksgiving', name: 'Thanksgiving', cn: '感恩节', greet: "Happy Thanksgiving! I'm thankful for you!",
    date: function (y) { var d = new Date(y, 10, 1), first = (4 - d.getDay() + 7) % 7; return new Date(y, 10, 1 + first + 21); },      // 4th Thursday of November
    outfits: [
      { id: 'tg-turkey', name: 'Turkey suit', cn: '火鸡装', price: 10, vb: '-8 52 136 126', draw: function (A, m) { var t = A.top, y1 = A.hem - 2, f = '#A8742E', s = '#5B3A12', fan = '', i, ang;
        for (i = 0; i < 9; i++) { ang = -96 + i * 24; var c = AUTUMN[i % 4];
          fan += '<g transform="translate(60,' + (t + 24) + ') rotate(' + ang + ')"><path d="M0 -26C-13 -42 -14 -62 0 -78C14 -62 13 -42 0 -26Z" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="2.6" stroke-linejoin="round"/><path d="M0 -34C-6 -44 -6 -56 0 -66C6 -56 6 -44 0 -34Z" fill="#FFE9A8" opacity=".75"/></g>'; }
        return { back: fan, under: body(A, y1, 3, 8, f, s, 7) + '<ellipse cx="60" cy="' + f1(t + 34) + '" rx="19" ry="23" fill="#F3D9A8"/><path d="M50 ' + (t + 28) + 'Q60 ' + (t + 22) + ' 70 ' + (t + 28) + 'M48 ' + (t + 38) + 'Q60 ' + (t + 32) + ' 72 ' + (t + 38) + 'M50 ' + (t + 48) + 'Q60 ' + (t + 42) + ' 70 ' + (t + 48) + '" fill="none" stroke="#C9A06B" stroke-width="2.2" stroke-linecap="round"/>'
          + '<path d="M55 ' + (t + 2) + 'Q60 ' + (t + 17) + ' 65 ' + (t + 2) + 'Q60 ' + (t + 6) + ' 55 ' + (t + 2) + 'Z" fill="#E8453C" stroke="#A82A20" stroke-width="2" stroke-linejoin="round"/>', over: sleeves(A, f, s, m, '#F6C531') }; } },
      { id: 'tg-sweater', name: 'Cozy sweater', cn: '暖暖毛衣', price: 10, draw: function (A, m) { var f = '#E0762B', s = '#9A4510', t = A.top, y1 = A.hem - 3, o = '', i;
        for (i = 0; i < 5; i++) o += '<path d="M' + (38 + i * 11) + ' ' + (t + 12) + 'l0 6M' + (38 + i * 11) + ' ' + (t + 30) + 'l0 6M' + (38 + i * 11) + ' ' + (t + 48) + 'l0 6" stroke="#F3A25C" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>';
        return { back: '', under: body(A, y1, 2.4, 5, f, s, 6) + o + strip(A, t + 22, y1, 2.4, 5, '#FFE9C7', 9, 1) + '<g transform="translate(60,' + (t + 26) + ')"><g transform="translate(-14,0) rotate(-12) scale(.5)">' + mapleLeaf('#C8431E', '#8E2A10') + '</g><g transform="translate(0,1) scale(.55)">' + mapleLeaf('#F6C531', '#B8860B') + '</g><g transform="translate(14,0) rotate(12) scale(.5)">' + mapleLeaf('#C8431E', '#8E2A10') + '</g></g>'
          + '<ellipse cx="60" cy="' + (t + 1) + '" rx="' + f1(hw(A, t) + 5) + '" ry="9" fill="#F3A25C" stroke="' + s + '" stroke-width="3"/>', over: sleeves(A, f, s, m, '#F3A25C') }; } },
      { id: 'tg-farmer', name: 'Harvest overalls', cn: '丰收背带裤', price: 10, draw: function (A, m) { var t = A.top, y1 = A.hem - 2, f = '#7A5B3A', s = '#4A3520', sh = '#D9453B';
        return { back: '', under: body(A, y1, 2.4, 4, f, s, 6) + '<path d="M44 ' + t + 'L44 ' + (t + 14) + 'L76 ' + (t + 14) + 'L76 ' + t + '" fill="none" stroke="' + sh + '" stroke-width="0"/>'
          + '<path d="M46 ' + (t + 3) + 'L47 ' + (t + 18) + 'L73 ' + (t + 18) + 'L74 ' + (t + 3)  + 'Q60 ' + (t + 12) + ' 46 ' + (t + 3) + 'Z" fill="' + sh + '" stroke="#8E2A22" stroke-width="2.2" stroke-linejoin="round"/><path d="M52 ' + (t + 4) + 'L53 ' + (t + 16) + 'M60 ' + (t + 8) + 'L60 ' + (t + 17) + 'M68 ' + (t + 4) + 'L67 ' + (t + 16) + '" stroke="#F6E2B3" stroke-width="1.8" opacity=".7"/>'
          + '<path d="M47 ' + (t + 14) + 'L47 ' + (t + 1) + 'M73 ' + (t + 14) + 'L73 ' + (t + 1) + '" stroke="' + f + '" stroke-width="6" stroke-linecap="round"/><rect x="48" y="' + (t + 22) + '" width="24" height="20" rx="4" fill="#8E6B44" stroke="' + s + '" stroke-width="2.2"/><path d="M53 ' + (t + 26) + 'L60 ' + (t + 38) + 'L67 ' + (t + 26)  + 'Z" fill="#F28A1E" stroke="#A8520A" stroke-width="1.6" stroke-linejoin="round"/><path d="M60 ' + (t + 26) + 'L60 ' + (t + 22) + 'M57 ' + (t + 25) + 'L55 ' + (t + 21) + 'M63 ' + (t + 25) + 'L65 ' + (t + 21) + '" stroke="#5DBB4A" stroke-width="2" stroke-linecap="round"/>'
          + '<circle cx="47" cy="' + (t + 16) + '" r="3.2" fill="#F6C531" stroke="#B8860B" stroke-width="1.4"/><circle cx="73" cy="' + (t + 16) + '" r="3.2" fill="#F6C531" stroke="#B8860B" stroke-width="1.4"/>', over: sleeves(A, sh, '#8E2A22', m, '#F6E2B3') }; } },
      { id: 'tg-leafcape', name: 'Leaf cape', cn: '落叶披风', price: 12, vb: '8 90 104 96', draw: function (A) { var f = '#B8531E', s = '#6B3A12', t = A.top, tw = f1(hw(A, t) + 4), cw = A.cw, hy = A.hem + 12, mid = f1(t + (hy - t) / 2), lv = '', i, c;
        var P = [[-42, 16], [-47, 32], [-41, 46], [-49, 58], [-34, 62], [42, 16], [47, 32], [41, 46], [49, 58], [34, 62], [-18, 64], [0, 68], [18, 64]];
        for (i = 0; i < P.length; i++) { c = AUTUMN[(i + 1) % 4]; lv += '<g transform="translate(' + f1(60 + P[i][0]) + ',' + f1(t + P[i][1]) + ') rotate(' + (i * 47 % 120 - 60) + ') scale(.62)">' + mapleLeaf(c[0], c[1]) + '</g>'; }
        return { back: '<path d="M' + f1(60 - tw) + ' ' + (t - 2) + 'Q' + f1(60 - tw - 6) + ' ' + mid + ' ' + f1(60 - cw) + ' ' + hy + 'Q' + f1(60 - cw * .5) + ' ' + (hy + 10) + ' 60 ' + (hy + 1) + 'Q' + f1(60 + cw * .5) + ' ' + (hy + 10) + ' ' + f1(60 + cw) + ' ' + hy + 'Q' + f1(60 + tw + 6) + ' ' + mid + ' ' + f1(60 + tw) + ' ' + (t - 2) + 'Z" fill="' + f + '" stroke="' + s + '" stroke-width="3.5" stroke-linejoin="round"/>' + lv,
          under: '', over: '<path d="M' + f1(60 - tw - 1) + ' ' + (t + 1) + 'Q60 ' + (t + 15) + ' ' + f1(60 + tw + 1) + ' ' + (t + 1) + '" fill="none" stroke="#8E3A10" stroke-width="5" stroke-linecap="round"/><g transform="translate(60,' + (t + 11) + ')"><g transform="rotate(-30) scale(.62)">' + mapleLeaf('#F6C531', '#B8860B') + '</g><g transform="rotate(30) scale(.62)">' + mapleLeaf('#D9453B', '#8E2A22') + '</g><circle r="3.4" fill="#F6C531" stroke="#B8860B" stroke-width="1.4"/></g>' }; } }
    ],
    hats: [
      { id: 'tg-acorn', name: 'Acorn cap', cn: '橡果帽', price: 5, vb: '20 -10 80 60', a: { hx: 60, hy: 46, hs: 1 }, draw: function (a) { return G(a, '<path d="M-24 5Q-27 -17 0 -23Q27 -17 24 5Q0 12 -24 5Z" fill="#9A6428" stroke="#5B3A12" stroke-width="2.6" stroke-linejoin="round"/><path d="M-17 -2L-9 -17M-6 0L1 -21M7 0L14 -17M18 -2L21 -10M-22 -9L-13 -3M-9 -11L1 -2M7 -12L16 -3" stroke="#6B4418" stroke-width="1.8" stroke-linecap="round" opacity=".7"/><path d="M0 -23Q-1 -31 3 -35" fill="none" stroke="#5B3A12" stroke-width="5" stroke-linecap="round"/><path d="M-18 -9Q-10 -18 -2 -19" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".45"/>'); } },
      { id: 'tg-chefhat', name: 'Chef hat', cn: '厨师帽', price: 5, vb: '14 -42 92 90', a: { hx: 60, hy: 46, hs: 1 }, draw: function (a) { return G(a, '<g transform="scale(1.3)"><path d="M-17 6L-17 -4Q-30 -6 -27 -20Q-25 -33 -11 -31Q-6 -43 6 -37Q20 -42 24 -27Q33 -15 17 -4L17 6Z" fill="#FFFFFF" stroke="#AEB8CE" stroke-width="2.6" stroke-linejoin="round"/><path d="M-9 -4L-10 -24M0 -4L0 -30M9 -4L10 -24" stroke="#D5DCEB" stroke-width="2" stroke-linecap="round"/><rect x="-18" y="-3" width="36" height="10" rx="3" fill="#F2F5FB" stroke="#AEB8CE" stroke-width="2.4"/></g>'); } },
      { id: 'tg-leaf', name: 'Autumn leaf', cn: '红叶', price: 0, vb: '34 -22 72 72', a: { hx: 36, hy: 38, hs: 1.2 }, draw: function (a) { var x = a.hx + 30 * a.hs, y = a.hy - 9 * a.hs;
        return '<g transform="translate(' + x + ',' + y + ') rotate(24) scale(' + f1(a.hs * 1.5) + ')">' + mapleLeaf('#E8603A', '#A8381A') + '<path d="M0 12Q3 15 7 14" fill="none" stroke="#6B4A2A" stroke-width="2" stroke-linecap="round"/><circle cx="7" cy="14" r="2" fill="#B8531E" stroke="#6B3A12" stroke-width="1"/></g>'; } }
    ],
    decos: [
      { id: 'tg-d-pumpkins', name: 'Pumpkin patch', cn: '南瓜堆', price: 6, front: true, icon: '<g transform="translate(26,54) scale(.95)"><ellipse cx="-14" cy="-13" rx="14" ry="13" fill="#F28A1E" stroke="#A8520A" stroke-width="2.4"/><ellipse cx="14" cy="-13" rx="14" ry="13" fill="#F28A1E" stroke="#A8520A" stroke-width="2.4"/><ellipse cx="0" cy="-14" rx="14" ry="15" fill="#FF9A2E" stroke="#A8520A" stroke-width="2.4"/><path d="M-2 -29Q-3 -36 2 -38" fill="none" stroke="#5B7A2A" stroke-width="4.4" stroke-linecap="round"/><path d="M3 -31Q12 -38 17 -31Q11 -29 6 -30Z" fill="#6DB33F" stroke="#3F7A22" stroke-width="1.6"/></g>',
        svg: function () { return hayBale(326, 288, 1) + pumpkin(36, 284, 1.15) + pumpkin(74, 289, .75) + pumpkin(300, 289, .6); } },
      { id: 'tg-d-leaves', name: 'Falling leaves', cn: '飘落的树叶', price: 4, icon: '<g transform="translate(22,24) rotate(-20) scale(1.3)">' + mapleLeaf('#E8603A', '#A8381A') + '</g><g transform="translate(40,44) rotate(25) scale(1.1)">' + mapleLeaf('#F6C531', '#B8860B') + '</g><g transform="translate(14,48) rotate(10) scale(.9)">' + mapleLeaf('#B8531E', '#6B3A12') + '</g>',
        svg: function () { return fallingLeaf(50, 126, 1.25, -20, '#E8603A', '#A8381A', 0) + fallingLeaf(316, 112, 1.1, 25, '#F6C531', '#B8860B', 1.1) + fallingLeaf(282, 170, .95, -10, '#B8531E', '#6B3A12', 2.1) + fallingLeaf(86, 176, .85, 30, '#D9453B', '#8E2A22', 1.6) + fallingLeaf(176, 120, .8, 15, '#F28A1E', '#A8520A', 2.7); } },
      { id: 'tg-d-banner', name: 'Thankful banner', cn: '感恩彩旗', price: 3, icon: '<path d="M2 12Q30 34 58 12" fill="none" stroke="#6B4A2A" stroke-width="2.4"/><path d="M8 18L22 18L15 36Z" fill="#E8603A" stroke="#6B4A2A" stroke-width="1.8" stroke-linejoin="round"/><path d="M23 24L37 24L30 42Z" fill="#F6B52E" stroke="#6B4A2A" stroke-width="1.8" stroke-linejoin="round"/><path d="M38 18L52 18L45 36Z" fill="#B8531E" stroke="#6B4A2A" stroke-width="1.8" stroke-linejoin="round"/>',
        svg: function (v) { return bunting(v || { y0: 0 }); } },
      { id: 'tg-d-table', name: 'Feast table', cn: '感恩大餐', price: 6, icon: '<g transform="translate(30,48) scale(.55)">' + feastTable(0, 0) + '</g>',
        svg: function () { return feastTable(292, 280); } },
      { id: 'tg-d-scarecrow', name: 'Friendly scarecrow', cn: '稻草人朋友', price: 6, icon: '<g transform="translate(30,56) scale(.42)">' + scarecrow(0, 0) + '</g>',
        svg: function () { return scarecrow(44, 284); } }
    ] };
  /* ---------- Christmas: Santa, elves, gingerbread, snowmen and a tree (no religious scenes) ---------- */
  var XRED = '#D9382F', XRED_D = '#8E2A22', XGREEN = '#2F8F4E', XGREEN_D = '#1B5E34', XGOLD = '#F6C531', XGOLD_D = '#B8860B';
  function flake(x, y, r, col, w) {
    var o = '<g transform="translate(' + x + ',' + y + ')" stroke="' + col + '" stroke-width="' + (w || 1.8) + '" stroke-linecap="round" fill="none">', i, a;
    for (i = 0; i < 3; i++) { a = i * 60 * Math.PI / 180; var dx = f1(r * Math.cos(a)), dy = f1(r * Math.sin(a)); o += '<path d="M' + (-dx) + ' ' + (-dy) + 'L' + dx + ' ' + dy + '"/>'; }
    return o + '</g>';
  }
  function snowFall(x, y, r, delay) {
    return '<g class="flutter" style="animation-delay:' + delay + 's">' + flake(x, y, r, '#FFFFFF', 2) + '<circle cx="' + x + '" cy="' + y + '" r="' + f1(r * 0.28) + '" fill="#FFFFFF"/><g opacity=".55">' + flake(x, y, r + 1.2, '#9CC6EE', 1) + '</g></g>';
  }
  function xmasTree(x, y, s) {
    var o = '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><rect x="-8" y="-14" width="16" height="16" rx="3" fill="#8B5A2B" stroke="#5B3A12" stroke-width="2.4"/>',
      tiers = [[-46, -62, 46, -14, 1], [-38, -100, 38, -50, 1], [-28, -134, 28, -88, 1]], i, c;
    for (i = 0; i < tiers.length; i++) { var t = tiers[i]; o += '<path d="M' + t[0] + ' ' + t[3] + 'Q0 ' + (t[3] + 6) + ' ' + t[2] + ' ' + t[3] + 'L0 ' + t[1] + 'Z" fill="' + (i % 2 ? '#3FA45E' : XGREEN) + '" stroke="' + XGREEN_D + '" stroke-width="2.6" stroke-linejoin="round"/>'; }
    o += '<path d="M-30 -22Q0 -8 30 -22M-24 -58Q0 -44 24 -58M-17 -96Q0 -84 17 -96" fill="none" stroke="#FFE9A8" stroke-width="3" stroke-linecap="round" opacity=".9"/>';
    [[-20, -24, XRED], [14, -30, '#4D96FF'], [-4, -60, XGOLD], [22, -52, XRED], [-16, -94, '#4D96FF'], [10, -100, XRED]].forEach(function (b, k) { o += '<g class="twinkle" style="animation-delay:' + (k * 0.4) + 's"><circle cx="' + b[0] + '" cy="' + b[1] + '" r="5.4" fill="' + b[2] + '" stroke="#fff" stroke-width="1.4"/><circle cx="' + (b[0] - 1.6) + '" cy="' + (b[1] - 1.8) + '" r="1.5" fill="#fff"/></g>'; });
    o += '<g class="twinkle">' + star5(0, -142, 12, XGOLD, XGOLD_D) + '</g></g>';
    return o;
  }
  function present(x, y, w, h, box, rib) {
    return '<g transform="translate(' + x + ',' + y + ')"><rect x="' + (-w / 2) + '" y="' + (-h) + '" width="' + w + '" height="' + h + '" rx="3" fill="' + box + '" stroke="#00000033" stroke-width="2"/><rect x="' + (-w / 2 + 1) + '" y="' + (-h * 0.62) + '" width="' + (w - 2) + '" height="' + f1(h * 0.18) + '" fill="#FFFFFF" opacity=".16"/>'
      + '<rect x="-3.5" y="' + (-h) + '" width="7" height="' + h + '" fill="' + rib + '"/><path d="M0 ' + (-h) + 'Q-12 ' + (-h - 12) + ' -10 ' + (-h - 3) + 'Q-4 ' + (-h) + ' 0 ' + (-h) + 'Q4 ' + (-h) + ' 10 ' + (-h - 3) + 'Q12 ' + (-h - 12) + ' 0 ' + (-h) + 'Z" fill="' + rib + '" stroke="#00000033" stroke-width="1.6" stroke-linejoin="round"/></g>';
  }
  function snowman(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-18 -52L-38 -64M-38 -64L-44 -73M-38 -64L-47 -62M18 -52L38 -64M38 -64L44 -73M38 -64L47 -62" stroke="#6B4A2A" stroke-width="4" stroke-linecap="round" fill="none"/>'
      + '<ellipse cx="0" cy="-22" rx="26" ry="23" fill="#FFFFFF" stroke="#9CB6D8" stroke-width="2.6"/><ellipse cx="0" cy="-58" rx="20" ry="18" fill="#FFFFFF" stroke="#9CB6D8" stroke-width="2.6"/><circle cx="0" cy="-90" r="15" fill="#FFFFFF" stroke="#9CB6D8" stroke-width="2.6"/>'
      + '<circle cx="-5" cy="-93" r="2.2" fill="#2B2B33"/><circle cx="5" cy="-93" r="2.2" fill="#2B2B33"/><path d="M0 -89L13 -86L0 -84Z" fill="#F28A1E" stroke="#A8520A" stroke-width="1.4" stroke-linejoin="round"/><path d="M-6 -82Q0 -78 6 -82" fill="none" stroke="#2B2B33" stroke-width="1.8" stroke-linecap="round"/><circle cx="-9" cy="-85" r="2.4" fill="#F0A0A0" opacity=".6"/><circle cx="9" cy="-85" r="2.4" fill="#F0A0A0" opacity=".6"/>'
      + '<circle cx="0" cy="-60" r="2.4" fill="#2B2B33"/><circle cx="0" cy="-48" r="2.4" fill="#2B2B33"/><circle cx="0" cy="-30" r="2.6" fill="#2B2B33"/><circle cx="0" cy="-18" r="2.6" fill="#2B2B33"/>'
      + '<path d="M-16 -76Q0 -70 16 -76L16 -70Q0 -64 -16 -70Z" fill="' + XRED + '" stroke="' + XRED_D + '" stroke-width="2" stroke-linejoin="round"/><path d="M8 -70L12 -52L20 -54L16 -70Z" fill="' + XRED + '" stroke="' + XRED_D + '" stroke-width="2" stroke-linejoin="round"/>'
      + '<rect x="-14" y="-118" width="28" height="22" rx="3" fill="#2B2B33" stroke="#15151A" stroke-width="2"/><rect x="-14" y="-104" width="28" height="6" fill="' + XRED + '"/><ellipse cx="0" cy="-97" rx="22" ry="5" fill="#2B2B33" stroke="#15151A" stroke-width="2"/></g>';
  }
  function lightsString(v) {
    var y0 = v.y0, cols = [XRED, XGOLD, '#4D96FF', '#6BCB77'], ax = 4, ay = y0 + 6, bx = 356, by = y0 + 6, cx = 180, cy = y0 + 40, i, o = '<path d="M' + ax + ' ' + ay + 'Q' + cx + ' ' + cy + ' ' + bx + ' ' + by + '" fill="none" stroke="#3B6B4A" stroke-width="2.6" stroke-linecap="round"/>';
    for (i = 0; i < 12; i++) {
      var t = (i + 0.6) / 12.4, u = 1 - t, x = u * u * ax + 2 * u * t * cx + t * t * bx, y = u * u * ay + 2 * u * t * cy + t * t * by, c = cols[i % 4];
      o += '<g class="twinkle" style="animation-delay:' + f1((i % 4) * 0.5) + 's"><g transform="translate(' + f1(x) + ',' + f1(y) + ')"><rect x="-2.6" y="-2" width="5.2" height="5" rx="1" fill="#3B6B4A"/><ellipse cx="0" cy="8" rx="5.2" ry="7.4" fill="' + c + '" stroke="#00000033" stroke-width="1.4"/><ellipse cx="-1.8" cy="5.5" rx="1.4" ry="2.4" fill="#fff" opacity=".7"/></g></g>';
    }
    return o;
  }
  var CHRISTMAS = { id: 'christmas', name: 'Christmas', cn: '圣诞节', greet: 'Merry Christmas! Ho ho ho!', date: function (y) { return new Date(y, 11, 25); },
    outfits: [
      { id: 'xm-santa', name: 'Santa suit', cn: '圣诞老人装', price: 12, draw: function (A, m) { var t = A.top, y1 = A.hem, f = XRED, s = XRED_D;
        return { back: '', under: body(A, y1, 3, 8, f, s, 7) + '<path d="M60 ' + (t + 8) + 'L60 ' + (y1 - 2) + '" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round"/>' + strip(A, y1 - 7, y1, 3, 8, '#FFFFFF', 11, 1) + strip(A, t + 30, y1, 3, 8, '#2B2B33', 8, 1) + '<rect x="53" y="' + (t + 25) + '" width="14" height="11" rx="2" fill="' + XGOLD + '" stroke="' + XGOLD_D + '" stroke-width="2"/><rect x="57" y="' + (t + 28) + '" width="6" height="5" rx="1" fill="#2B2B33"/>'
          + '<ellipse cx="60" cy="' + (t + 1) + '" rx="' + f1(hw(A, t) + 5) + '" ry="9" fill="#FFFFFF" stroke="#B9C2D6" stroke-width="2.4"/>', over: sleeves(A, f, s, m, '#FFFFFF') }; } },
      { id: 'xm-sweater', name: 'Snowflake sweater', cn: '雪花毛衣', price: 10, draw: function (A, m) { var t = A.top, y1 = A.hem - 3, f = XGREEN, s = XGREEN_D, fl = '', i;
        for (i = 0; i < 3; i++) fl += flake(44 + i * 16, t + 31, 5.2, '#FFFFFF', 1.8);
        for (i = 0; i < 2; i++) fl += flake(52 + i * 16, t + 50, 4.6, '#FFFFFF', 1.6);
        return { back: '', under: body(A, y1, 2.4, 5, f, s, 6) + strip(A, t + 31, y1, 2.4, 5, XRED, 15, 1) + fl + '<ellipse cx="60" cy="' + (t + 1) + '" rx="' + f1(hw(A, t) + 5) + '" ry="9" fill="#3FA45E" stroke="' + s + '" stroke-width="3"/>', over: sleeves(A, f, s, m, XRED) }; } },
      { id: 'xm-elf', name: 'Elf outfit', cn: '小精灵装', price: 10, draw: function (A, m) { var t = A.top, y1 = A.hem - 6, f = '#3DAA5C', s = '#1E6E36', zig = '', i, wl = gw(A, y1, y1, 3, 8), st = (2 * wl) / 6;
        for (i = 0; i < 6; i++) zig += (i ? 'L' : 'M') + f1(60 - wl + i * st) + ' ' + y1 + 'L' + f1(60 - wl + i * st + st / 2) + ' ' + (y1 + 9) + 'L' + f1(60 - wl + (i + 1) * st) + ' ' + y1;
        return { back: '', under: body(A, y1, 3, 8, f, s, 4) + '<path d="' + zig + 'Z" fill="' + XRED + '" stroke="' + XRED_D + '" stroke-width="2" stroke-linejoin="round"/>' + strip(A, t + 32, y1, 3, 8, '#7A4A22', 7, 1) + '<rect x="54" y="' + (t + 27) + '" width="12" height="10" rx="2" fill="' + XGOLD + '" stroke="' + XGOLD_D + '" stroke-width="2"/>'
          + dot(60, t + 12, 2.6, XGOLD) + dot(60, t + 20, 2.6, XGOLD) + '<path d="M40 ' + (t + 1) + 'L47 ' + (t + 10) + 'L54 ' + (t + 1) + 'L60 ' + (t + 10) + 'L66 ' + (t + 1) + 'L73 ' + (t + 10) + 'L80 ' + (t + 1) + 'Q60 ' + (t + 12) + ' 40 ' + (t + 1) + 'Z" fill="' + XRED + '" stroke="' + XRED_D + '" stroke-width="2" stroke-linejoin="round"/>', over: sleeves(A, f, s, m, XRED) }; } },
      { id: 'xm-gingerbread', name: 'Gingerbread suit', cn: '姜饼装', price: 12, draw: function (A, m) { var t = A.top, y1 = A.hem - 2, f = '#C98A4B', s = '#8A5A2B', ic = '', i, wl = gw(A, y1, y1, 3, 8), st = (2 * wl) / 7;
        for (i = 0; i < 7; i++) ic += (i ? 'L' : 'M') + f1(60 - wl + i * st) + ' ' + (y1 - 5) + 'Q' + f1(60 - wl + i * st + st / 2) + ' ' + (y1 + 5) + ' ' + f1(60 - wl + (i + 1) * st) + ' ' + (y1 - 5);
        return { back: '', under: body(A, y1, 3, 8, f, s, 6) + '<path d="' + ic + '" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 ' + (t + 8) + 'Q51 ' + (t + 14) + ' 60 ' + (t + 8) + 'Q69 ' + (t + 2) + ' 78 ' + (t + 8) + '" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>'
          + dot(60, t + 24, 5, XRED) + dot(60, t + 38, 5, '#4D96FF') + dot(60, t + 52, 5, '#6BCB77') + '<circle cx="58.4" cy="' + (t + 22.4) + '" r="1.6" fill="#fff" opacity=".8"/><circle cx="58.4" cy="' + (t + 36.4) + '" r="1.6" fill="#fff" opacity=".8"/><circle cx="58.4" cy="' + (t + 50.4) + '" r="1.6" fill="#fff" opacity=".8"/>', over: sleeves(A, f, s, m, '#FFFFFF') }; } }
    ],
    hats: [
      { id: 'xm-santahat', name: 'Santa hat', cn: '圣诞帽', price: 5, vb: '14 -24 92 72', a: { hx: 60, hy: 46, hs: 1 }, draw: function (a) { return G(a, '<path d="M-22 3Q-23 -18 -7 -32Q8 -45 25 -35Q32 -30 29 -23Q17 -34 7 -22Q11 -6 22 3Z" fill="' + XRED + '" stroke="' + XRED_D + '" stroke-width="2.6" stroke-linejoin="round"/><path d="M-14 -8Q-6 -22 4 -26" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".4"/><rect x="-27" y="-3" width="54" height="12" rx="6" fill="#FFFFFF" stroke="#B9C2D6" stroke-width="2.4"/><circle cx="29" cy="-27" r="7.5" fill="#FFFFFF" stroke="#B9C2D6" stroke-width="2.4"/>'); } },
      { id: 'xm-antlers', name: 'Reindeer antlers', cn: '驯鹿角', price: 5, vb: '14 -28 92 70', a: { hx: 60, hy: 46, hs: 1 }, draw: function (a) { var br = '<path d="M-12 4Q-19 -10 -14 -24M-16 -12Q-24 -14 -27 -22M-15 -19Q-9 -24 -8 -31" fill="none" stroke="#6B4418" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M-12 4Q-19 -10 -14 -24M-16 -12Q-24 -14 -27 -22M-15 -19Q-9 -24 -8 -31" fill="none" stroke="#B07A3A" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>';
        return G(a, '<g>' + br + '</g><g transform="scale(-1,1)">' + br + '</g><circle cx="-8" cy="-31" r="3.4" fill="' + XRED + '"/><circle cx="8" cy="-31" r="3.4" fill="' + XRED + '"/><path d="M-16 5Q0 -2 16 5" fill="none" stroke="' + XRED + '" stroke-width="5" stroke-linecap="round"/>'); } },
      { id: 'xm-elfhat', name: 'Elf hat', cn: '小精灵帽', price: 5, vb: '14 -30 92 78', a: { hx: 60, hy: 46, hs: 1 }, draw: function (a) { return G(a, '<path d="M-21 3Q-22 -20 -4 -34Q10 -46 24 -34Q28 -28 24 -22Q14 -32 6 -20Q10 -6 21 3Z" fill="#3DAA5C" stroke="#1E6E36" stroke-width="2.6" stroke-linejoin="round"/><path d="M-12 -8Q-6 -20 2 -26" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".4"/><path d="M-24 3L-18 -5L-12 3L-6 -5L0 3L6 -5L12 3L18 -5L24 3Q0 9 -24 3Z" fill="' + XRED + '" stroke="' + XRED_D + '" stroke-width="2.2" stroke-linejoin="round"/><circle cx="25" cy="-26" r="5.4" fill="' + XGOLD + '" stroke="' + XGOLD_D + '" stroke-width="2"/><circle cx="23.6" cy="-27.4" r="1.5" fill="#fff" opacity=".8"/>'); } },
      { id: 'xm-holly', name: 'Holly sprig', cn: '冬青叶', price: 0, vb: '34 -22 72 72', a: { hx: 36, hy: 38, hs: 1.2 }, draw: function (a) { var x = a.hx + 30 * a.hs, y = a.hy - 8 * a.hs, lf = '<path d="M0 0Q-4 -8 -2 -12L-6 -12L-5 -17L-9 -18L-6 -22Q2 -26 8 -20Q12 -14 8 -8Q6 -4 0 0Z" fill="#2F8F4E" stroke="#1B5E34" stroke-width="1.6" stroke-linejoin="round"/>';
        return '<g transform="translate(' + x + ',' + y + ') scale(' + f1(a.hs * 1.4) + ')"><g transform="rotate(-50)">' + lf + '</g><g transform="rotate(30)">' + lf + '</g><circle cx="-2" cy="4" r="4.4" fill="' + XRED + '" stroke="' + XRED_D + '" stroke-width="1.4"/><circle cx="5" cy="2" r="4.4" fill="' + XRED + '" stroke="' + XRED_D + '" stroke-width="1.4"/><circle cx="1" cy="9" r="4.4" fill="' + XRED + '" stroke="' + XRED_D + '" stroke-width="1.4"/><circle cx="-3.2" cy="2.6" r="1.2" fill="#fff" opacity=".8"/><circle cx="3.8" cy=".6" r="1.2" fill="#fff" opacity=".8"/></g>'; } }
    ],
    decos: [
      { id: 'xm-d-tree', name: 'Christmas tree', cn: '圣诞树', price: 8, icon: '<g transform="translate(30,56) scale(.28)">' + xmasTree(0, 0, 1) + '</g>',
        svg: function () { return xmasTree(54, 284, 1); } },
      { id: 'xm-d-gifts', name: 'Present pile', cn: '礼物堆', price: 5, front: true, icon: '<g transform="translate(30,54)">' + present(-8, 0, 28, 22, XRED, XGOLD) + present(14, 0, 20, 15, '#4D96FF', '#FFFFFF') + present(2, -22, 18, 14, XGREEN, XRED) + '</g>',
        svg: function () { return present(98, 289, 30, 22, XRED, XGOLD) + present(124, 289, 22, 16, '#4D96FF', '#FFFFFF') + present(108, 267, 20, 14, XGREEN, XRED); } },
      { id: 'xm-d-lights', name: 'String lights', cn: '彩灯', price: 4, icon: '<path d="M2 12Q30 32 58 12" fill="none" stroke="#3B6B4A" stroke-width="2.4"/><ellipse cx="14" cy="26" rx="4.6" ry="6.6" fill="' + XRED + '" stroke="#00000033" stroke-width="1.2"/><ellipse cx="30" cy="30" rx="4.6" ry="6.6" fill="' + XGOLD + '" stroke="#00000033" stroke-width="1.2"/><ellipse cx="46" cy="26" rx="4.6" ry="6.6" fill="#4D96FF" stroke="#00000033" stroke-width="1.2"/>',
        svg: function (v) { return lightsString(v || { y0: 0 }); } },
      { id: 'xm-d-snowman', name: 'Snowman friend', cn: '雪人朋友', price: 6, icon: '<g transform="translate(30,56) scale(.42)">' + snowman(0, 0, 1) + '</g>',
        svg: function () { return snowman(308, 284, 1); } },
      { id: 'xm-d-snow', name: 'Snowfall', cn: '飘雪', price: 4, icon: '<g>' + flake(18, 18, 9, '#6FA8DC', 2.4) + flake(40, 30, 7, '#6FA8DC', 2) + flake(22, 44, 6, '#6FA8DC', 2) + '</g>',
        svg: function () { return snowFall(52, 112, 7, 0) + snowFall(318, 108, 8, 0.9) + snowFall(96, 168, 6, 1.7) + snowFall(268, 160, 7, 2.3) + snowFall(188, 122, 6, 0.4) + snowFall(24, 210, 5.5, 1.3) + snowFall(340, 214, 6, 2.8) + snowFall(150, 196, 5, 3.4); } }
    ] };
  /* ---------- Chinese New Year: red and gold, lanterns, lion dance, Tang suits, red envelopes, dumplings ---------- */
  var CRED = '#D92B2B', CRED_D = '#8A1717', CRED_L = '#F0584B', CGOLD = '#F6C531', CGOLD_D = '#B8860B', CJK_FONT = 'PingFang SC, Microsoft YaHei, Noto Sans CJK SC, sans-serif';
  // an old Chinese coin: a round coin with a square hole
  function coin(x, y, r, fill, stroke, hole) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.4"/><rect x="' + f1(x - r * 0.32) + '" y="' + f1(y - r * 0.32) + '" width="' + f1(r * 0.64) + '" height="' + f1(r * 0.64) + '" fill="' + hole + '" stroke="' + stroke + '" stroke-width="1"/>';
  }
  // a gold frog button (盘扣) of a Tang suit
  function knot(x, y) {
    var l = 'M' + (x - 3) + ' ' + y + 'Q' + (x - 9) + ' ' + (y - 4) + ' ' + (x - 9) + ' ' + y + 'Q' + (x - 9) + ' ' + (y + 4) + ' ' + (x - 3) + ' ' + y,
      r = 'M' + (x + 3) + ' ' + y + 'Q' + (x + 9) + ' ' + (y - 4) + ' ' + (x + 9) + ' ' + y + 'Q' + (x + 9) + ' ' + (y + 4) + ' ' + (x + 3) + ' ' + y;
    return '<path d="' + l + r + '" fill="none" stroke="' + CGOLD + '" stroke-width="2.2" stroke-linecap="round"/><circle cx="' + x + '" cy="' + y + '" r="3" fill="' + CGOLD + '" stroke="' + CGOLD_D + '" stroke-width="1"/>';
  }
  function lantern(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><ellipse cx="0" cy="0" rx="21" ry="17" fill="' + CRED + '" stroke="' + CRED_D + '" stroke-width="2.4"/>'
      + '<path d="M-9 -16Q-15 0 -9 16M0 -17V17M9 -16Q15 0 9 16" fill="none" stroke="' + CRED_D + '" stroke-width="1.6" opacity=".55"/><ellipse cx="-9" cy="-6" rx="3.6" ry="7" fill="#FFFFFF" opacity=".28"/>'
      + '<rect x="-9" y="-22" width="18" height="6" rx="2" fill="' + CGOLD + '" stroke="' + CGOLD_D + '" stroke-width="1.8"/><rect x="-9" y="16" width="18" height="6" rx="2" fill="' + CGOLD + '" stroke="' + CGOLD_D + '" stroke-width="1.8"/>'
      + '<circle cx="0" cy="29" r="2.8" fill="' + CGOLD + '" stroke="' + CGOLD_D + '" stroke-width="1.2"/><path d="M-4 32L-6 45M0 32V47M4 32L6 45" stroke="' + CRED + '" stroke-width="2.4" stroke-linecap="round" fill="none"/></g>';
  }
  function lanternHung(x, top, drop, s, delay) {
    var cy = top + drop;
    return '<path d="M' + x + ' ' + top + 'V' + f1(cy - 22 * s) + '" stroke="' + CRED_D + '" stroke-width="2" fill="none"/><g class="twinkle" style="animation-delay:' + delay + 's"><circle cx="' + x + '" cy="' + f1(cy) + '" r="' + f1(34 * s) + '" fill="#FFB347" opacity=".22"/></g>' + lantern(x, cy, s);
  }
  // the 福 diamond hung upside down; plain = no character (shop icons lose their Chinese text), a coin instead
  function fuDiamond(x, y, s, plain) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M0 -27L27 0L0 27L-27 0Z" fill="' + CRED + '" stroke="' + CGOLD + '" stroke-width="3.2" stroke-linejoin="round"/><path d="M0 -20L20 0L0 20L-20 0Z" fill="none" stroke="' + CGOLD + '" stroke-width="1.2" opacity=".75"/>'
      + (plain ? coin(0, 0, 9, CGOLD, CGOLD_D, CRED) : '<text x="0" y="8" text-anchor="middle" font-size="23" font-weight="700" fill="' + CGOLD + '" font-family="' + CJK_FONT + '">福</text>')
      + '<path d="M0 27V33M-4 33L-5 48M0 33V50M4 33L5 48" stroke="' + CRED + '" stroke-width="2.4" stroke-linecap="round" fill="none"/></g>';
  }
  function couplet(x, y, chars, plain) {
    var o = '<g><rect x="' + (x - 13) + '" y="' + y + '" width="26" height="104" rx="3" fill="' + CRED + '" stroke="' + CRED_D + '" stroke-width="2.4"/><rect x="' + (x - 10) + '" y="' + (y + 3) + '" width="20" height="98" rx="2" fill="none" stroke="' + CGOLD + '" stroke-width="1.2" opacity=".85"/>', i;
    for (i = 0; i < 4; i++) {
      if (plain) o += '<rect x="' + (x - 5) + '" y="' + (y + 12 + i * 22) + '" width="10" height="12" rx="2" fill="' + CGOLD + '" opacity=".9"/>';
      else o += '<text x="' + x + '" y="' + (y + 24 + i * 22) + '" text-anchor="middle" font-size="18" font-weight="700" fill="' + CGOLD + '" font-family="' + CJK_FONT + '">' + chars.charAt(i) + '</text>';
    }
    return o + '</g>';
  }
  function burst(x, y, r, col, col2, delay) {
    var o = '<g class="twinkle" style="animation-delay:' + delay + 's"><g transform="translate(' + x + ',' + y + ')">', i, a, c, s;
    for (i = 0; i < 10; i++) {
      a = i * 36 * Math.PI / 180; c = Math.cos(a); s = Math.sin(a);
      o += '<path d="M' + f1(c * r * 0.35) + ' ' + f1(s * r * 0.35) + 'L' + f1(c * r * 0.78) + ' ' + f1(s * r * 0.78) + '" fill="none" stroke="' + (i % 2 ? col : col2) + '" stroke-width="3" stroke-linecap="round"/><circle cx="' + f1(c * r) + '" cy="' + f1(s * r) + '" r="2.6" fill="' + (i % 2 ? col2 : col) + '"/>';
    }
    return o + '<circle r="3.4" fill="' + col2 + '"/></g></g>';
  }
  // a gold ingot (元宝)
  function ingot(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-20 -6Q-22 -15 -12 -13Q0 -5 12 -13Q22 -15 20 -6Q18 8 10 8L-10 8Q-18 8 -20 -6Z" fill="' + CGOLD + '" stroke="' + CGOLD_D + '" stroke-width="2.2" stroke-linejoin="round"/>'
      + '<ellipse cx="0" cy="-8" rx="9" ry="5.5" fill="#FFE27A" stroke="' + CGOLD_D + '" stroke-width="1.8"/><path d="M-12 1Q0 5 12 1" fill="none" stroke="' + CGOLD_D + '" stroke-width="1.4" opacity=".6"/></g>';
  }
  function redEnvelope(x, y, w, h, rot) {
    return '<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ')"><rect x="' + (-w / 2) + '" y="' + (-h) + '" width="' + w + '" height="' + h + '" rx="3" fill="' + CRED + '" stroke="' + CRED_D + '" stroke-width="2"/>'
      + '<path d="M' + (-w / 2) + ' ' + (-h) + 'L0 ' + f1(-h + h * 0.42) + 'L' + (w / 2) + ' ' + (-h) + 'Z" fill="' + CRED_L + '" stroke="' + CRED_D + '" stroke-width="1.6" stroke-linejoin="round"/>'
      + '<rect x="' + f1(-w / 2 + 2.4) + '" y="' + f1(-h + 2.4) + '" width="' + f1(w - 4.8) + '" height="' + f1(h - 4.8) + '" rx="2" fill="none" stroke="' + CGOLD + '" stroke-width="1" opacity=".8"/>'
      + '<circle cx="0" cy="' + f1(-h + h * 0.42) + '" r="' + f1(w * 0.2) + '" fill="' + CGOLD + '" stroke="' + CGOLD_D + '" stroke-width="1.4"/></g>';
  }
  function dumpling(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-12 4Q-12 -10 0 -10Q12 -10 12 4Q0 9 -12 4Z" fill="#FFFDF4" stroke="#C9B98C" stroke-width="1.8" stroke-linejoin="round"/><path d="M-8 -7Q-6 -3 -8 1M-3 -9Q-1 -4 -3 0M2 -9Q4 -4 2 0M7 -7Q9 -3 7 1" fill="none" stroke="#C9B98C" stroke-width="1.2" stroke-linecap="round"/></g>';
  }
  function tangerine(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#FF9A1F" stroke="#C25F00" stroke-width="1.8"/><path d="M' + x + ' ' + f1(y - r) + 'q4 -5 8 -3q-3 5 -8 3z" fill="#4E9B3A" stroke="#2F6E22" stroke-width="1"/><ellipse cx="' + f1(x - r * 0.35) + '" cy="' + f1(y - r * 0.3) + '" rx="' + f1(r * 0.22) + '" ry="' + f1(r * 0.34) + '" fill="#FFFFFF" opacity=".4"/>';
  }
  function feastTable(x, y) {
    return '<g transform="translate(' + x + ',' + y + ')"><path d="M-34 -28L-38 0M34 -28L38 0" stroke="#7A4A22" stroke-width="5" stroke-linecap="round" fill="none"/>'
      + '<path d="M-46 -32Q-46 -21 -40 -19Q-20 -14 0 -14Q20 -14 40 -19Q46 -21 46 -32Z" fill="' + CRED + '" stroke="' + CRED_D + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M-38 -22Q0 -15 38 -22" fill="none" stroke="' + CGOLD + '" stroke-width="2.4" stroke-linecap="round"/>'
      + '<ellipse cx="0" cy="-32" rx="46" ry="10" fill="#E24A3C" stroke="' + CRED_D + '" stroke-width="2.4"/>'
      + '<ellipse cx="-15" cy="-34" rx="20" ry="5.6" fill="#FFFFFF" stroke="#C9B98C" stroke-width="1.8"/>' + dumpling(-26, -36, 0.62) + dumpling(-14, -39, 0.62) + dumpling(-3, -36, 0.62)
      + '<path d="M13 -38Q13 -28 24 -27Q35 -28 35 -38Z" fill="' + CGOLD + '" stroke="' + CGOLD_D + '" stroke-width="2" stroke-linejoin="round"/>' + tangerine(19, -43, 6) + tangerine(30, -43, 6) + tangerine(24.5, -50, 6) + '</g>';
  }
  function luckyPile(x, y) {
    return redEnvelope(x - 38, y, 18, 28, -12) + redEnvelope(x + 36, y, 18, 28, 12) + ingot(x - 14, y - 2, 1) + ingot(x + 16, y - 2, 1) + ingot(x, y - 16, 0.9)
      + '<g>' + coin(x - 30, y - 3, 5.5, CGOLD, CGOLD_D, '#FFE27A') + coin(x + 34, y - 4, 5.5, CGOLD, CGOLD_D, '#FFE27A') + '</g>';
  }
  var NEWYEAR = { id: 'newyear', name: 'Chinese New Year', cn: '春节', greet: 'Happy Chinese New Year! 新年快乐！',
    date: function (y) { var s = CNY[y]; if (!s) return null; var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); },
    outfits: [
      { id: 'cn-tang', name: 'Tang suit', cn: '唐装', price: 12, draw: function (A, m) { var t = A.top, y1 = A.hem - 2, f = CRED, s = CRED_D, kn = '', i;
        for (i = 0; i < 3; i++) kn += knot(60, t + 14 + i * 12);
        return { back: '', under: body(A, y1, 3, 8, f, s, 7) + '<path d="M60 ' + (t + 7) + 'V' + (y1 - 2) + '" stroke="' + s + '" stroke-width="2" opacity=".6"/>' + strip(A, y1 - 3, y1, 3, 8, CGOLD, 5, 1)
          + '<circle cx="41" cy="' + (t + 34) + '" r="7" fill="none" stroke="' + CGOLD + '" stroke-width="2.2"/><circle cx="41" cy="' + (t + 34) + '" r="2.4" fill="' + CGOLD + '"/><circle cx="79" cy="' + (t + 34) + '" r="7" fill="none" stroke="' + CGOLD + '" stroke-width="2.2"/><circle cx="79" cy="' + (t + 34) + '" r="2.4" fill="' + CGOLD + '"/>'
          + kn + '<ellipse cx="60" cy="' + (t + 1) + '" rx="' + f1(hw(A, t) + 5) + '" ry="9" fill="' + CRED + '" stroke="' + CGOLD + '" stroke-width="3"/>', over: sleeves(A, f, s, m, CGOLD) }; } },
      { id: 'cn-lion', name: 'Lion dance suit', cn: '舞狮装', price: 12, draw: function (A, m) { var t = A.top, y1 = A.hem - 5, f = '#E8412F', s = '#9A2418', fur = '', mane = '', i, a, wl = gw(A, y1, y1, 3, 8), st = (2 * wl) / 7, rx = hw(A, t) + 5;
        for (i = 0; i < 7; i++) fur += (i ? 'L' : 'M') + f1(60 - wl + i * st) + ' ' + y1 + 'L' + f1(60 - wl + i * st + st / 2) + ' ' + (y1 + 10) + 'L' + f1(60 - wl + (i + 1) * st) + ' ' + y1;
        for (i = 0; i < 7; i++) { a = i * Math.PI / 6; mane += '<circle cx="' + f1(60 - rx + (rx * 2) * (i / 6)) + '" cy="' + f1(t + 2 + 7 * Math.sin(a)) + '" r="7.4" fill="#F28A1E" stroke="#B85A0A" stroke-width="2"/>'; }
        return { back: '', under: body(A, y1, 3, 8, f, s, 4) + '<path d="' + fur + 'Z" fill="#F6C531" stroke="#B8860B" stroke-width="2" stroke-linejoin="round"/>'
          + '<path d="M44 ' + (t + 22) + 'L50 ' + (t + 28) + 'L56 ' + (t + 22) + 'L62 ' + (t + 28) + 'L68 ' + (t + 22) + 'L74 ' + (t + 28) + 'M44 ' + (t + 34) + 'L50 ' + (t + 40) + 'L56 ' + (t + 34) + 'L62 ' + (t + 40) + 'L68 ' + (t + 34) + 'L74 ' + (t + 40) + '" fill="none" stroke="#F6C531" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'
          + mane + '<circle cx="60" cy="' + (t + 14) + '" r="4.6" fill="' + CGOLD + '" stroke="' + CGOLD_D + '" stroke-width="1.6"/><path d="M60 ' + (t + 10) + 'V' + (t + 18) + '" stroke="' + CGOLD_D + '" stroke-width="1.2"/>', over: sleeves(A, f, s, m, CGOLD) }; } },
      { id: 'cn-vest', name: 'Lucky vest', cn: '福气背心', price: 10, draw: function (A, m) { var t = A.top, y1 = A.hem - 2, f = '#F4C23A', s = '#B8860B', o = '', pts = [[46, 24], [74, 24], [60, 35], [46, 46], [74, 46]], i;
        for (i = 0; i < pts.length; i++) o += coin(pts[i][0], t + pts[i][1], 6.2, CRED, CRED_D, '#F4C23A');
        return { back: '', under: body(A, y1, 3, 8, f, s, 6) + strip(A, y1 - 3, y1, 3, 8, CRED, 5, 1) + '<path d="M60 ' + (t + 8) + 'V' + (y1 - 2) + '" stroke="' + s + '" stroke-width="2" opacity=".5"/>' + o + '<ellipse cx="60" cy="' + (t + 1) + '" rx="' + f1(hw(A, t) + 5) + '" ry="9" fill="' + CRED + '" stroke="' + CRED_D + '" stroke-width="3"/>', over: sleeves(A, CRED, CRED_D, m, CGOLD) }; } },
      { id: 'cn-envelope', name: 'Red envelope suit', cn: '红包装', price: 12, draw: function (A, m) { var t = A.top, y1 = A.hem - 2, f = '#CC2323', s = '#7E1212', xl = hw(A, t) + 2;
        return { back: '', under: body(A, y1, 3, 8, f, s, 6) + strip(A, y1 - 4, y1, 3, 8, CGOLD, 2.4, 1) + strip(A, y1 - 9, y1, 3, 8, CGOLD, 1.6, .8)
          + '<path d="M' + f1(60 - xl) + ' ' + (t + 2) + 'L60 ' + (t + 26) + 'L' + f1(60 + xl) + ' ' + (t + 2) + 'Z" fill="' + CRED_L + '" stroke="' + CGOLD + '" stroke-width="2.4" stroke-linejoin="round"/>'
          + '<circle cx="60" cy="' + (t + 26) + '" r="7.2" fill="' + CGOLD + '" stroke="' + CGOLD_D + '" stroke-width="1.8"/><path d="M60 ' + (t + 21) + 'L65 ' + (t + 26) + 'L60 ' + (t + 31) + 'L55 ' + (t + 26) + 'Z" fill="' + CRED + '"/>'
          + '<path d="M49 ' + (t + 42) + 'Q60 ' + (t + 36) + ' 71 ' + (t + 42) + '" fill="none" stroke="' + CGOLD + '" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>', over: sleeves(A, f, s, m, CGOLD) }; } }
    ],
    hats: [
      { id: 'cn-cap', name: 'Lucky cap', cn: '瓜皮帽', price: 5, vb: '22 6 76 52', a: { hx: 60, hy: 46, hs: 1 }, draw: function (a) { return G(a, '<path d="M-22 5Q-23 -22 0 -24Q23 -22 22 5Q0 10 -22 5Z" fill="#2B2230" stroke="#120C16" stroke-width="2.6" stroke-linejoin="round"/>'
        + '<path d="M-11 7Q-13 -11 -6 -22M0 8V-24M11 7Q13 -11 6 -22" fill="none" stroke="' + CGOLD + '" stroke-width="1.5" opacity=".75"/><path d="M-15 -6Q-12 -16 -5 -20" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity=".28"/>'
        + '<rect x="-24" y="-1" width="48" height="10" rx="5" fill="' + CRED + '" stroke="' + CRED_D + '" stroke-width="2.4"/><circle cx="-13" cy="4" r="1.8" fill="' + CGOLD + '"/><circle cx="0" cy="4" r="1.8" fill="' + CGOLD + '"/><circle cx="13" cy="4" r="1.8" fill="' + CGOLD + '"/>'
        + '<circle cx="0" cy="-29" r="5.6" fill="' + CRED + '" stroke="' + CRED_D + '" stroke-width="2"/><circle cx="-1.6" cy="-30.8" r="1.6" fill="#FFFFFF" opacity=".75"/>'); } },
      { id: 'cn-tiger', name: 'Tiger hat', cn: '虎头帽', price: 5, vb: '22 6 76 54', a: { hx: 60, hy: 46, hs: 1 }, draw: function (a) { return G(a, '<circle cx="-17" cy="-19" r="8.5" fill="#F5A623" stroke="#B3700F" stroke-width="2.4"/><circle cx="-17" cy="-19" r="4.2" fill="#FFB6C8"/><circle cx="17" cy="-19" r="8.5" fill="#F5A623" stroke="#B3700F" stroke-width="2.4"/><circle cx="17" cy="-19" r="4.2" fill="#FFB6C8"/>'
        + '<path d="M-23 6Q-25 -24 0 -27Q25 -24 23 6Q0 12 -23 6Z" fill="#F5A623" stroke="#B3700F" stroke-width="2.6" stroke-linejoin="round"/>'
        + '<path d="M-8 -19H8M-6 -12H6M-9 -5H9M0 -21V-3" fill="none" stroke="#2B2230" stroke-width="3" stroke-linecap="round"/><path d="M-23 -8L-16 -6M-23 -1L-16 -1M23 -8L16 -6M23 -1L16 -1" fill="none" stroke="#2B2230" stroke-width="2.4" stroke-linecap="round"/>'
        + '<path d="M-25 4Q-12 12 0 6Q12 12 25 4L25 9Q12 16 0 11Q-12 16 -25 9Z" fill="#FFF3D6" stroke="#B3700F" stroke-width="2" stroke-linejoin="round"/>'); } },
      { id: 'cn-lantern', name: 'Lantern hat', cn: '灯笼帽', price: 5, vb: '26 0 68 66', a: { hx: 60, hy: 46, hs: 1 }, draw: function (a) { return G(a, '<path d="M-13 4L-15 14M13 4L15 14" stroke="' + CRED + '" stroke-width="2.4" stroke-linecap="round" fill="none"/><circle cx="-15" cy="15" r="2.6" fill="' + CGOLD + '" stroke="' + CGOLD_D + '" stroke-width="1"/><circle cx="15" cy="15" r="2.6" fill="' + CGOLD + '" stroke="' + CGOLD_D + '" stroke-width="1"/>'
        + '<rect x="-12" y="-3" width="24" height="7" rx="2.4" fill="' + CGOLD + '" stroke="' + CGOLD_D + '" stroke-width="2"/><ellipse cx="0" cy="-16" rx="19" ry="14" fill="' + CRED + '" stroke="' + CRED_D + '" stroke-width="2.6"/>'
        + '<path d="M-8 -28Q-14 -16 -8 -4M0 -30V-2M8 -28Q14 -16 8 -4" fill="none" stroke="' + CRED_D + '" stroke-width="1.6" opacity=".55"/><ellipse cx="-8" cy="-20" rx="3.4" ry="6" fill="#FFFFFF" opacity=".3"/>'
        + '<rect x="-8" y="-33" width="16" height="6" rx="2" fill="' + CGOLD + '" stroke="' + CGOLD_D + '" stroke-width="1.8"/><path d="M0 -33V-38" stroke="' + CGOLD_D + '" stroke-width="2" stroke-linecap="round"/><circle cx="0" cy="-40" r="3" fill="' + CGOLD + '" stroke="' + CGOLD_D + '" stroke-width="1.4"/>'); } },
      { id: 'cn-plum', name: 'Plum blossom', cn: '梅花', price: 0, vb: '40 2 68 60', a: { hx: 36, hy: 38, hs: 1.2 }, draw: function (a) { var x = a.hx + 30 * a.hs, y = a.hy - 6 * a.hs, bl = function (cx, cy, r) { var o = '', i, an; for (i = 0; i < 5; i++) { an = (i * 72 - 90) * Math.PI / 180; o += '<circle cx="' + f1(cx + Math.cos(an) * r * 0.62) + '" cy="' + f1(cy + Math.sin(an) * r * 0.62) + '" r="' + f1(r * 0.52) + '" fill="#F9A9C4" stroke="#D95E8C" stroke-width="1.1"/>'; } return o + '<circle cx="' + cx + '" cy="' + cy + '" r="' + f1(r * 0.34) + '" fill="#F6C531" stroke="#B8860B" stroke-width="0.9"/>'; };
        return '<g transform="translate(' + x + ',' + y + ') scale(' + f1(a.hs * 1.3) + ')"><path d="M-14 16Q-8 6 -2 4Q4 2 12 -6M-2 4Q-4 -4 -10 -8" fill="none" stroke="#7A4A22" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' + bl(-9, -7, 6) + bl(12, -7, 7.4) + bl(2, 5, 6.4) + '<circle cx="-14" cy="12" r="2.4" fill="#F9A9C4" stroke="#D95E8C" stroke-width="1"/></g>'; } }
    ],
    decos: [
      { id: 'cn-d-lanterns', name: 'Red lanterns', cn: '红灯笼', price: 6, icon: '<g transform="translate(30,19) scale(.78)">' + lantern(0, 0, 1) + '</g><path d="M30 0V-3" stroke="' + CRED_D + '" stroke-width="2"/>',
        svg: function (v) { var y = v.y0; return lanternHung(66, y, 58, 1, 0) + lanternHung(294, y, 58, 1, 0.8) + lanternHung(104, y, 30, 0.6, 1.6) + lanternHung(256, y, 30, 0.6, 2.2); } },
      { id: 'cn-d-couplets', name: 'Spring couplets', cn: '春联', price: 6, icon: '<rect x="5" y="6" width="15" height="42" rx="2.4" fill="' + CRED + '" stroke="' + CRED_D + '" stroke-width="2"/><rect x="40" y="6" width="15" height="42" rx="2.4" fill="' + CRED + '" stroke="' + CRED_D + '" stroke-width="2"/><g fill="' + CGOLD + '"><rect x="9.5" y="11" width="6" height="7" rx="1.4"/><rect x="9.5" y="22" width="6" height="7" rx="1.4"/><rect x="9.5" y="33" width="6" height="7" rx="1.4"/><rect x="44.5" y="11" width="6" height="7" rx="1.4"/><rect x="44.5" y="22" width="6" height="7" rx="1.4"/><rect x="44.5" y="33" width="6" height="7" rx="1.4"/></g>' + fuDiamond(30, 16, 0.5, true),
        svg: function (v) { var y = v.y0; return '<path d="M180 ' + y + 'V' + (y + 6) + '" stroke="' + CRED_D + '" stroke-width="2" fill="none"/>' + fuDiamond(180, y + 33, 1, false) + couplet(19, y + 46, '万事如意', false) + couplet(341, y + 46, '心想事成', false); } },
      { id: 'cn-d-fireworks', name: 'Fireworks', cn: '烟花', price: 5, icon: '<g transform="translate(30,30)">' + burst(0, 0, 22, CGOLD, CRED_L, 0) + '</g>',
        svg: function (v) { var y = v.y0; return burst(104, y + 104, 26, CGOLD, CRED_L, 0) + burst(262, y + 98, 24, '#FF8FB1', CGOLD, 0.9) + '<g class="twinkle" style="animation-delay:1.6s">' + star5(146, y + 62, 6, '#FFE27A', CGOLD_D) + star5(222, y + 70, 5, '#FFFFFF', CGOLD_D) + star5(60, y + 150, 4.4, '#FFE27A', CGOLD_D) + star5(304, y + 156, 4.4, '#FFFFFF', CGOLD_D) + '</g>'; } },
      { id: 'cn-d-feast', name: 'Dumpling table', cn: '饺子桌', price: 8, icon: '<g transform="translate(30,56) scale(.6)">' + feastTable(0, 0) + '</g>',
        svg: function () { return feastTable(68, 282); } },
      { id: 'cn-d-lucky', name: 'Lucky pile', cn: '红包和元宝', price: 6, front: true, icon: '<g transform="translate(30,44) scale(.52)">' + luckyPile(0, 8) + '</g>',
        svg: function () { return luckyPile(298, 292); } }
    ] };
  /* ---------- Easter: eggs, bunnies, chicks and spring flowers in pastels (no religious scenes) ---------- */
  var EP = { pink: '#F8A5C8', pinkD: '#D86B9A', lav: '#C9B6F2', lavD: '#8E6FD0', mint: '#9EE0C2', mintD: '#4FB38A', yel: '#FFE27A', yelD: '#D9A900', sky: '#9ED8F5', skyD: '#4F9BD0', ink: '#6B5B7B' };
  var EGGP = 'M0 -16C9 -16 14 -4 14 4C14 12 8 17 0 17C-8 17 -14 12 -14 4C-14 -4 -9 -16 0 -16Z';
  function egg(x, y, s, pat, c1, c2, ink) {
    var o = '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="' + EGGP + '" fill="' + c1 + '"/>';
    if (pat === 'zig') o += '<path d="M-13 0L-9 5L-4.5 0L0 5L4.5 0L9 5L13 0" fill="none" stroke="' + c2 + '" stroke-width="3" stroke-linejoin="round"/>';
    else if (pat === 'stripe') o += '<path d="M-11 -6H11M-13.5 3H13.5M-11 11H11" fill="none" stroke="' + c2 + '" stroke-width="2.8"/>';
    else if (pat === 'dots') o += '<circle cx="-5" cy="-6" r="2.4" fill="' + c2 + '"/><circle cx="5" cy="-4" r="2.4" fill="' + c2 + '"/><circle cx="0" cy="4" r="2.6" fill="' + c2 + '"/><circle cx="-8" cy="8" r="2.2" fill="' + c2 + '"/><circle cx="8" cy="9" r="2.2" fill="' + c2 + '"/>';
    else if (pat === 'wave') o += '<path d="M-13 -2Q-9 -6 -4.5 -2Q0 2 4.5 -2Q9 -6 13 -2M-13 8Q-9 4 -4.5 8Q0 12 4.5 8Q9 4 13 8" fill="none" stroke="' + c2 + '" stroke-width="2.6" stroke-linecap="round"/>';
    else if (pat === 'band') o += '<path d="M-13.5 0H13.5" fill="none" stroke="' + c2 + '" stroke-width="6"/><circle cx="-7" cy="0" r="1.8" fill="#FFFFFF"/><circle cx="0" cy="0" r="1.8" fill="#FFFFFF"/><circle cx="7" cy="0" r="1.8" fill="#FFFFFF"/>';
    return o + '<path d="' + EGGP + '" fill="none" stroke="' + ink + '" stroke-width="2.2"/><ellipse cx="-5" cy="-7" rx="2.6" ry="4.6" fill="#FFFFFF" opacity=".5" transform="rotate(18 -5 -7)"/></g>';
  }
  var EGGSET = [['zig', EP.pink, '#FFFFFF', EP.pinkD], ['dots', EP.yel, EP.pink, EP.yelD], ['stripe', EP.sky, '#FFFFFF', EP.skyD], ['wave', EP.mint, '#FFFFFF', EP.mintD], ['band', EP.lav, EP.pink, EP.lavD]];
  function eggN(x, y, s, k) { var e = EGGSET[k % EGGSET.length]; return egg(x, y, s, e[0], e[1], e[2], e[3]); }
  function flower(x, y, r, c1, c2, cc) {
    var o = '<g transform="translate(' + x + ',' + y + ')">', i, a;
    for (i = 0; i < 5; i++) { a = (i * 72 - 90) * Math.PI / 180; o += '<circle cx="' + f1(Math.cos(a) * r * 0.58) + '" cy="' + f1(Math.sin(a) * r * 0.58) + '" r="' + f1(r * 0.5) + '" fill="' + c1 + '" stroke="' + c2 + '" stroke-width="1.2"/>'; }
    return o + '<circle r="' + f1(r * 0.34) + '" fill="' + cc + '" stroke="' + c2 + '" stroke-width="1"/></g>';
  }
  function tulip(x, y, h, c1, c2) {
    return '<g transform="translate(' + x + ',' + y + ')"><path d="M0 0V' + (-h) + '" stroke="#3FA45E" stroke-width="3.4" stroke-linecap="round" fill="none"/><path d="M0 -4Q-13 -8 -14 ' + f1(-h * 0.7) + 'Q-5 ' + f1(-h * 0.5) + ' 0 -5Z" fill="#4DB86C" stroke="#2F8F4E" stroke-width="1.6" stroke-linejoin="round"/>'
      + '<g transform="translate(0,' + (-h) + ')"><path d="M-7 -1L-7 -12L-3.5 -7.5L0 -14L3.5 -7.5L7 -12L7 -1Q7 7 0 7Q-7 7 -7 -1Z" fill="' + c1 + '" stroke="' + c2 + '" stroke-width="1.8" stroke-linejoin="round"/><ellipse cx="-2.6" cy="-1" rx="1.6" ry="4" fill="#FFFFFF" opacity=".4"/></g></g>';
  }
  function butterfly(x, y, s, c1, c2, delay) {
    return '<g class="flutter" style="animation-delay:' + delay + 's"><g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M0 0Q-12 -16 -18 -8Q-20 2 0 2Z" fill="' + c1 + '" stroke="' + c2 + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M0 0Q12 -16 18 -8Q20 2 0 2Z" fill="' + c1 + '" stroke="' + c2 + '" stroke-width="1.6" stroke-linejoin="round"/>'
      + '<path d="M0 2Q-10 4 -12 12Q-4 14 0 4Z" fill="' + c1 + '" stroke="' + c2 + '" stroke-width="1.4" stroke-linejoin="round"/><path d="M0 2Q10 4 12 12Q4 14 0 4Z" fill="' + c1 + '" stroke="' + c2 + '" stroke-width="1.4" stroke-linejoin="round"/><path d="M0 -3V10" stroke="' + EP.ink + '" stroke-width="2" stroke-linecap="round"/><circle cx="-7" cy="-5" r="2" fill="#FFFFFF" opacity=".7"/><circle cx="7" cy="-5" r="2" fill="#FFFFFF" opacity=".7"/></g></g>';
  }
  function chick(x, y, s, shell) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' + (shell ? '' : '<ellipse cx="-5" cy="0" rx="3.6" ry="2" fill="#F28A1E"/><ellipse cx="5" cy="0" rx="3.6" ry="2" fill="#F28A1E"/>')
      + '<circle cx="0" cy="-14" r="14" fill="#FFD84D" stroke="#D9A100" stroke-width="2.4"/><ellipse cx="-13" cy="-12" rx="4.4" ry="7" transform="rotate(18 -13 -12)" fill="#FFC93C" stroke="#D9A100" stroke-width="1.8"/><ellipse cx="13" cy="-12" rx="4.4" ry="7" transform="rotate(-18 13 -12)" fill="#FFC93C" stroke="#D9A100" stroke-width="1.8"/>'
      + '<path d="M-1 -28Q-4 -35 -7 -32M1 -28Q3 -36 6 -33" fill="none" stroke="#D9A100" stroke-width="2" stroke-linecap="round"/><circle cx="-5" cy="-17" r="2" fill="#2B2B33"/><circle cx="5" cy="-17" r="2" fill="#2B2B33"/><circle cx="-4.4" cy="-17.7" r=".7" fill="#FFFFFF"/><circle cx="5.6" cy="-17.7" r=".7" fill="#FFFFFF"/>'
      + '<path d="M-3.4 -12.4L0 -8L3.4 -12.4Z" fill="#F28A1E" stroke="#B85A0A" stroke-width="1.2" stroke-linejoin="round"/><circle cx="-9" cy="-12" r="2.6" fill="#FFB6C8" opacity=".7"/><circle cx="9" cy="-12" r="2.6" fill="#FFB6C8" opacity=".7"/>'
      + (shell ? '<path d="M-16 -7L-11 -13L-5.5 -7L0 -13L5.5 -7L11 -13L16 -7L16 0Q16 8 0 8Q-16 8 -16 0Z" fill="#FFF8EA" stroke="#C9B58A" stroke-width="1.8" stroke-linejoin="round"/><path d="M-9 1H9" stroke="' + EP.pink + '" stroke-width="2.6" stroke-linecap="round"/>' : '') + '</g>';
  }
  function basket(x, y, s) {
    var o = '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><path d="M-25 -14Q0 -52 25 -14" fill="none" stroke="#8A5A22" stroke-width="6" stroke-linecap="round"/><path d="M-25 -14Q0 -52 25 -14" fill="none" stroke="#E8B873" stroke-width="3" stroke-linecap="round"/>'
      + '<ellipse cx="0" cy="-16" rx="24" ry="7" fill="#7FD08A" stroke="#3FA45E" stroke-width="2"/><path d="M-20 -16L-16 -26L-12 -17L-7 -28L-3 -17L2 -27L6 -17L11 -26L14 -17L19 -24L21 -16Z" fill="#7FD08A" stroke="#3FA45E" stroke-width="1.6" stroke-linejoin="round"/>';
    o += eggN(-10, -24, 0.82, 0) + eggN(9, -26, 0.82, 2) + eggN(0, -30, 0.74, 4);
    return o + '<path d="M-28 -15L28 -15L22 14Q0 19 -22 14Z" fill="#D9A25B" stroke="#8A5A22" stroke-width="2.6" stroke-linejoin="round"/><path d="M-26 -6Q0 -1 26 -6M-24 3Q0 8 24 3" fill="none" stroke="#B07A38" stroke-width="2" stroke-linecap="round"/><path d="M-14 -13L-12 15M0 -13V17M14 -13L12 15" stroke="#B07A38" stroke-width="1.6" fill="none" opacity=".7"/>'
      + '<ellipse cx="0" cy="-15" rx="28" ry="5.4" fill="#E8B873" stroke="#8A5A22" stroke-width="2.4"/><g transform="translate(-24,-15)"><path d="M0 0L-9 -7L-9 7Z M0 0L9 -7L9 7Z" fill="' + EP.pink + '" stroke="' + EP.pinkD + '" stroke-width="1.6" stroke-linejoin="round"/><circle r="3" fill="' + EP.pink + '" stroke="' + EP.pinkD + '" stroke-width="1.4"/></g></g>';
  }
  function eggGarland(v) {
    var y0 = v.y0, ax = 4, ay = y0 + 8, bx = 356, by = y0 + 8, cx = 180, cy = y0 + 40, i, o = '<path d="M' + ax + ' ' + ay + 'Q' + cx + ' ' + cy + ' ' + bx + ' ' + by + '" fill="none" stroke="#7FB88F" stroke-width="2.4" stroke-linecap="round"/>';
    for (i = 0; i < 9; i++) {
      var t = (i + 0.7) / 9.4, u = 1 - t, x = u * u * ax + 2 * u * t * cx + t * t * bx, y = u * u * ay + 2 * u * t * cy + t * t * by;
      o += '<g class="twinkle" style="animation-delay:' + f1((i % 3) * 0.6) + 's"><path d="M' + f1(x) + ' ' + f1(y) + 'V' + f1(y + 8) + '" stroke="#7FB88F" stroke-width="1.6"/>' + eggN(f1(x), f1(y + 20), 0.78, i) + '</g>';
    }
    return o;
  }
  var EASTER = { id: 'easter', name: 'Easter', cn: '复活节', greet: 'Happy Easter! Hop, hop, hop!',
    date: function (y) { // the Sunday after the first full moon of spring (the usual computus)
      var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
      return new Date(y, mo - 1, da); },
    outfits: [
      { id: 'es-bunny', name: 'Bunny suit', cn: '兔子装', price: 12, draw: function (A, m) { var t = A.top, y1 = A.hem - 3, f = '#FFFFFF', s = '#C4C8E0', px = 60 + gw(A, y1 - 8, y1, 3, 7) + 1;
        return { back: '<circle cx="' + f1(px) + '" cy="' + (y1 - 5) + '" r="8.4" fill="#FFFFFF" stroke="' + s + '" stroke-width="2.4"/><path d="M' + f1(px - 3) + ' ' + (y1 - 9) + 'Q' + f1(px) + ' ' + (y1 - 11) + ' ' + f1(px + 3) + ' ' + (y1 - 9) + '" fill="none" stroke="' + s + '" stroke-width="1.4" opacity=".7"/>',
          under: body(A, y1, 3, 7, f, s, 6) + '<ellipse cx="60" cy="' + (t + 30) + '" rx="15" ry="19" fill="#FFD0E2" stroke="#F5A9C6" stroke-width="2"/><path d="M52 ' + (t + 28) + 'Q60 ' + (t + 33) + ' 68 ' + (t + 28) + '" fill="none" stroke="#F5A9C6" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>'
            + '<g transform="translate(60,' + (t + 5) + ')"><path d="M0 0L-10 -6L-10 6Z M0 0L10 -6L10 6Z" fill="' + EP.pink + '" stroke="' + EP.pinkD + '" stroke-width="1.8" stroke-linejoin="round"/><circle r="3.2" fill="' + EP.pink + '" stroke="' + EP.pinkD + '" stroke-width="1.4"/></g>', over: sleeves(A, f, s, m, '#FFB6D0') }; } },
      { id: 'es-chick', name: 'Hatching chick suit', cn: '破壳小鸡装', price: 12, draw: function (A, m) { var t = A.top, y1 = A.hem - 3, f = '#FFD84D', s = '#C99A00', zig = '', i, xl = function (y) { return 60 - gw(A, y, y1, 3, 7) - 1; }, xr = function (y) { return 60 + gw(A, y, y1, 3, 7) + 1; }, fl = '', ya = t + 31, yb = t + 24, n = 7, x0 = xl(ya), st = (xr(ya) - x0) / n;
        for (i = 0; i < n; i++) zig += 'L' + f1(x0 + i * st + st / 2) + ' ' + yb + 'L' + f1(x0 + (i + 1) * st) + ' ' + ya;
        for (i = 0; i < 4; i++) fl += '<path d="M' + f1(46 + i * 9.4) + ' ' + (t + 10) + 'q4.7 5 9.4 0" fill="none" stroke="#E5B800" stroke-width="2" stroke-linecap="round"/>';
        for (i = 0; i < 3; i++) fl += '<path d="M' + f1(51 + i * 9.4) + ' ' + (t + 17) + 'q4.7 5 9.4 0" fill="none" stroke="#E5B800" stroke-width="2" stroke-linecap="round"/>';
        return { back: '', under: body(A, y1, 3, 7, f, s, 6) + fl + '<path d="M' + f1(x0) + ' ' + ya + zig + 'L' + f1(xr(y1)) + ' ' + y1 + 'Q60 ' + (y1 + 7) + ' ' + f1(xl(y1)) + ' ' + y1 + 'Z" fill="#FFF8EA" stroke="#C9B58A" stroke-width="2.4" stroke-linejoin="round"/>'
          + '<path d="M' + f1(xl(t + 42) + 3) + ' ' + (t + 42) + 'L' + f1(xr(t + 42) - 3) + ' ' + (t + 42) + '" stroke="' + EP.pink + '" stroke-width="3.4" stroke-linecap="round"/>' + dot(48, t + 36, 2, EP.sky) + dot(60, t + 36, 2, EP.yel) + dot(72, t + 36, 2, EP.mint), over: sleeves(A, f, s, m, '#FFF8EA') }; } },
      { id: 'es-overalls', name: 'Spring overalls', cn: '春日背带裤', price: 10, draw: function (A, m) { var t = A.top, y1 = A.hem - 2, pk = '#F7A8C8', pkd = '#D86B9A', yb = t + 15, L = [], R = [], y, w, w1, i, fl = '';
        for (y = yb; y < y1; y += 6) { w = gw(A, y, y1, 3, 8); L.push([f1(60 - w), y]); R.push([f1(60 + w), y]); }
        w1 = hw(A, y1) + 8; L.push([f1(60 - w1), y1]); R.push([f1(60 + w1), y1]); R.reverse();
        fl = flower(60, t + 33, 7.6, '#FFFFFF', '#E0A8C0', '#FFE27A');
        return { back: '', under: body(A, y1, 3, 8, '#FFF1B8', '#D9B84A', 6) + '<path d="' + sm(L, true) + 'Q60 ' + (y1 + 6) + ' ' + R[0][0] + ' ' + R[0][1] + sm(R, false) + 'Z" fill="' + pk + '" stroke="' + pkd + '" stroke-width="3" stroke-linejoin="round"/>'
          + '<path d="M44 ' + yb + 'L41 ' + (t + 2) + 'M76 ' + yb + 'L79 ' + (t + 2) + '" stroke="' + pkd + '" stroke-width="7" stroke-linecap="round"/><path d="M44 ' + yb + 'L41 ' + (t + 2) + 'M76 ' + yb + 'L79 ' + (t + 2) + '" stroke="' + pk + '" stroke-width="3.6" stroke-linecap="round"/>'
          + '<rect x="49" y="' + (t + 24) + '" width="22" height="18" rx="4" fill="#FFD0E2" stroke="' + pkd + '" stroke-width="2"/>' + fl + dot(44, yb + 1, 2.6, '#FFE27A') + dot(76, yb + 1, 2.6, '#FFE27A'), over: sleeves(A, '#FFF1B8', '#D9B84A', m, pk) }; } },
      { id: 'es-sweater', name: 'Easter egg sweater', cn: '彩蛋毛衣', price: 10, draw: function (A, m) { var t = A.top, y1 = A.hem - 3, f = EP.lav, s = EP.lavD, zg = '', i;
        for (i = 0; i < 8; i++) zg += (i ? 'L' : 'M') + f1(36 + i * 6.8) + ' ' + (t + (i % 2 ? 12 : 17));
        return { back: '', under: body(A, y1, 2.4, 5, f, s, 6) + '<path d="' + zg + '" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" opacity=".9"/>' + strip(A, y1 - 3, y1, 2.4, 5, EP.pink, 5, 1)
          + eggN(43, t + 36, 0.62, 0) + eggN(60, t + 33, 0.62, 1) + eggN(77, t + 36, 0.62, 3) + '<ellipse cx="60" cy="' + (t + 1) + '" rx="' + f1(hw(A, t) + 5) + '" ry="9" fill="#DCCDF7" stroke="' + s + '" stroke-width="3"/>', over: sleeves(A, f, s, m, EP.pink) }; } }
    ],
    hats: [
      { id: 'es-ears', name: 'Bunny ears', cn: '兔耳朵', price: 5, vb: '24 -14 72 66', a: { hx: 60, hy: 46, hs: 1 }, draw: function (a) { var ear = '<path d="M-6 4Q-17 -18 -13 -42Q-8 -52 -3 -44Q2 -22 0 4Z" fill="#FFFFFF" stroke="#C4C8E0" stroke-width="2.4" stroke-linejoin="round"/><path d="M-6 -2Q-13 -18 -10 -38Q-7 -42 -5 -36Q-1 -18 -2 -2Z" fill="#FFC0D8"/>';
        return G(a, '<g transform="translate(-9,0) rotate(-8)">' + ear + '</g><g transform="translate(9,0) rotate(14 0 4) scale(-1,1)">' + ear + '</g><path d="M-19 5Q0 -3 19 5" fill="none" stroke="' + EP.pinkD + '" stroke-width="6.4" stroke-linecap="round"/><path d="M-19 5Q0 -3 19 5" fill="none" stroke="' + EP.pink + '" stroke-width="3.4" stroke-linecap="round"/>'); } },
      { id: 'es-crown', name: 'Flower crown', cn: '花环', price: 5, vb: '26 22 68 38', a: { hx: 60, hy: 46, hs: 1 }, draw: function (a) { var o = '<path d="M-27 6Q0 -12 27 6" fill="none" stroke="#3FA45E" stroke-width="4.4" stroke-linecap="round"/>', pts = [[-25, 3], [-17, -4], [-8.5, -8], [0, -9], [8.5, -8], [17, -4], [25, 3]], cl = [[EP.pink, EP.pinkD, '#FFE27A'], ['#FFFFFF', '#C9B0D0', EP.yel], [EP.yel, EP.yelD, '#FFFFFF'], [EP.lav, EP.lavD, '#FFE27A']], i;
        for (i = 0; i < pts.length; i++) o += '<path d="M' + pts[i][0] + ' ' + (pts[i][1] + 1) + 'l' + (i % 2 ? 5 : -5) + ' 4l' + (i % 2 ? -1 : 1) + ' -7z" fill="#4DB86C" stroke="#2F8F4E" stroke-width="1"/>';
        for (i = 0; i < pts.length; i++) o += flower(pts[i][0], pts[i][1], 7.6, cl[i % 4][0], cl[i % 4][1], cl[i % 4][2]);
        return G(a, o); } },
      { id: 'es-bonnet', name: 'Easter bonnet', cn: '复活节帽', price: 5, vb: '24 18 72 42', a: { hx: 60, hy: 46, hs: 1 }, draw: function (a) { return G(a, '<ellipse cx="0" cy="3" rx="31" ry="7.4" fill="#F3D68A" stroke="#B8902F" stroke-width="2.4"/><path d="M-18 3Q-19 -19 0 -21Q19 -19 18 3Q0 8 -18 3Z" fill="#F3D68A" stroke="#B8902F" stroke-width="2.4" stroke-linejoin="round"/>'
        + '<path d="M-14 -4Q0 0 14 -4M-12 -11Q0 -7 12 -11" fill="none" stroke="#D4B15F" stroke-width="1.6" stroke-linecap="round" opacity=".8"/><path d="M-18.4 -2Q0 4 18.4 -2L18.2 4Q0 9 -18.2 4Z" fill="' + EP.pink + '" stroke="' + EP.pinkD + '" stroke-width="2" stroke-linejoin="round"/>'
        + '<g transform="translate(18,1)"><path d="M0 0L9 -7L9 7Z M0 0L-3 8L-8 4Z" fill="' + EP.pink + '" stroke="' + EP.pinkD + '" stroke-width="1.6" stroke-linejoin="round"/></g>' + flower(-14, -13, 6.4, '#FFFFFF', '#C9B0D0', EP.yel) + flower(-6, -18, 5.4, EP.lav, EP.lavD, '#FFE27A') + '<path d="M-20 -8l-5 -3l1 6z" fill="#4DB86C" stroke="#2F8F4E" stroke-width="1"/>'); } },
      { id: 'es-tulip', name: 'Tulip', cn: '郁金香', price: 0, vb: '34 -22 72 72', a: { hx: 36, hy: 38, hs: 1.2 }, draw: function (a) { var x = a.hx + 30 * a.hs, y = a.hy - 6 * a.hs;
        return '<g transform="translate(' + x + ',' + y + ') scale(' + f1(a.hs * 1.5) + ')"><path d="M0 14Q-1 6 0 -2" stroke="#3FA45E" stroke-width="3.2" stroke-linecap="round" fill="none"/><path d="M0 12Q-12 8 -13 -2Q-4 0 0 9Z" fill="#4DB86C" stroke="#2F8F4E" stroke-width="1.4" stroke-linejoin="round"/><path d="M0 11Q10 6 11 -3Q4 0 0 8Z" fill="#4DB86C" stroke="#2F8F4E" stroke-width="1.4" stroke-linejoin="round"/>'
          + '<path d="M-7 -3L-7 -14L-3.5 -9.5L0 -16L3.5 -9.5L7 -14L7 -3Q7 6 0 6Q-7 6 -7 -3Z" fill="#F26BA4" stroke="#B83A74" stroke-width="1.8" stroke-linejoin="round"/><ellipse cx="-2.6" cy="-4" rx="1.6" ry="4.2" fill="#FFFFFF" opacity=".4"/></g>'; } }
    ],
    decos: [
      { id: 'es-d-basket', name: 'Egg basket', cn: '彩蛋篮', price: 6, front: true, icon: '<g transform="translate(30,48) scale(.8)">' + basket(0, 0, 1) + '</g>',
        svg: function () { return basket(112, 277, 1); } },
      { id: 'es-d-eggs', name: 'Hidden eggs', cn: '草里的彩蛋', price: 4, icon: '<g>' + eggN(18, 36, 0.9, 0) + eggN(36, 40, 0.8, 2) + eggN(26, 24, 0.7, 4) + '</g><path d="M6 50Q12 40 14 50M40 52Q44 42 48 52" fill="none" stroke="#3FA45E" stroke-width="2.6" stroke-linecap="round"/>',
        svg: function () { var g = function (x, y) { return '<path d="M' + (x - 8) + ' ' + y + 'L' + (x - 6) + ' ' + (y - 9) + 'L' + (x - 2) + ' ' + y + 'L' + x + ' ' + (y - 11) + 'L' + (x + 3) + ' ' + y + 'L' + (x + 7) + ' ' + (y - 9) + 'L' + (x + 9) + ' ' + y + 'Z" fill="#7FD08A" stroke="#3FA45E" stroke-width="1.6" stroke-linejoin="round"/>'; };
          return g(76, 287) + eggN(76, 278, 0.8, 1) + g(332, 289) + eggN(332, 280, 0.82, 3) + g(208, 292) + eggN(208, 284, 0.62, 4); } },
      { id: 'es-d-garland', name: 'Egg garland', cn: '彩蛋彩旗', price: 4, icon: '<path d="M2 10Q30 30 58 10" fill="none" stroke="#7FB88F" stroke-width="2.4"/>' + eggN(14, 30, 0.6, 0) + eggN(30, 36, 0.6, 2) + eggN(46, 30, 0.6, 4),
        svg: function (v) { return eggGarland(v); } },
      { id: 'es-d-tulips', name: 'Spring flowers', cn: '春天的花', price: 5, icon: '<g transform="translate(30,54)">' + tulip(-12, 0, 24, '#F26BA4', '#B83A74') + tulip(2, 0, 32, '#FFD84D', '#C99A00') + tulip(15, 0, 22, '#B79CF0', '#7A58C8') + '</g>',
        svg: function (v) { var y = v.y0; return tulip(16, 284, 46, '#F26BA4', '#B83A74') + tulip(32, 286, 60, '#FFD84D', '#C99A00') + tulip(48, 284, 38, '#B79CF0', '#7A58C8') + tulip(350, 284, 52, '#F26BA4', '#B83A74') + butterfly(86, y + 120, 1, '#F8A5C8', '#D86B9A', 0) + butterfly(300, y + 100, 0.9, '#9ED8F5', '#4F9BD0', 1.4); } },
      { id: 'es-d-chicks', name: 'Little chicks', cn: '小鸡', price: 6, icon: '<g transform="translate(18,50)">' + chick(0, 0, 0.8, false) + '</g><g transform="translate(42,50)">' + chick(0, 0, 0.8, true) + '</g>',
        svg: function () { return chick(262, 281, 1, false) + chick(294, 283, 1, true) + chick(236, 284, 0.7, false); } }
    ] };
  var CHILDREN = { id: 'children', name: "Children's Day", cn: '六一儿童节', greet: "Happy Children's Day! 儿童节快乐！", outfits: [], hats: [], decos: [], date: function (y) { return new Date(y, 5, 1); } };   // June 1
  var LIST = [HALLOWEEN, THANKSGIVING, CHRISTMAS, NEWYEAR, EASTER, CHILDREN];

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
