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
