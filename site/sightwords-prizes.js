/* Prizes of the sight words: each unit of an island has a treasure chest; opening it the first time gives 5 stars and one pet item
   that cannot be bought; each monster of the Monster battle drops one more when it is beaten for the first time (rev["mon<id>"]). The items are drawn here in the same way as the badge rewards (see badges.js) and registered in ITEMS, so the pet
   picture and the shop thumbnails draw them like any other accessory. A prize counts as won when the chest of its unit was opened:
   lef_words_v1.rev["chest<island>-<unit>"] is set (that key is also synced with the rest of the sight-words progress).
   SWPrizes.forUnit(island, unit), .unlocked(id), .ids(), .isPrize(id), .get(id), .thumb(id), .key(island, unit), .STARS.
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";

  var STARS = 5,
    STORE = "lef_words_v1";

  function flower(x, y, color, r) {
    var o = "";
    for (var i = 0; i < 5; i++) {
      var a = ((i * 72 - 90) * Math.PI) / 180;
      o += '<circle cx="' + (x + Math.cos(a) * r).toFixed(1) + '" cy="' + (y + Math.sin(a) * r).toFixed(1) + '" r="' + (r * 0.66).toFixed(1) + '" fill="' + color + '"/>';
    }
    return o + '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.5).toFixed(1) + '" fill="#FFD23F" stroke="#E0A800" stroke-width="0.8"/>';
  }

  // one prize per unit: island 1 (the mountain, units 1-5), island 2 (the beach, units 6-10), island 3 (the castle kingdom, units 11-15) and island 4 (outer space, units 16-20) and island 5 (the jungle, units 21-25) and island 6 (the deep sea, units 26-30) and island 7 (the desert, units 31-35) and island 8 (the polar island, units 36-40); each has the island, the unit, the world it belongs to, the item
  var LIST = [
    {
      id: "ch-flower", island: 1, unit: 1, world: "Flower foothills", slot: "hat", name: "Flower crown", cn: "花环", vb: "12 26 96 40", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        var o = '<path d="M-27 5 Q0 -12 27 5" fill="none" stroke="#3E9B5A" stroke-width="5" stroke-linecap="round"/>';
        [[-16, -1.6, -35], [-5.5, -4, -10], [5.5, -4, 10], [16, -1.6, 35]].forEach(function (l) {
          o += '<ellipse cx="' + l[0] + '" cy="' + l[1] + '" rx="5" ry="2.4" fill="#5CC27A" stroke="#2F7D48" stroke-width="1" transform="rotate(' + l[2] + " " + l[0] + " " + l[1] + ')"/>';
        });
        o += flower(-21.6, 1.9, "#FF8FB1", 4.6) + flower(-10.8, -2.2, "#FFFFFF", 4.6) + flower(0, -3.5, "#FFC93C", 5) + flower(10.8, -2.2, "#FFFFFF", 4.6) + flower(21.6, 1.9, "#FF8FB1", 4.6);
        return G(a, '<g transform="scale(1.5)">' + o + "</g>");
      },
    },
    {
      id: "ch-pine", island: 1, unit: 2, world: "Pine trail", slot: "hat", name: "Pine tree hat", cn: "松树帽", vb: "34 -22 52 76", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<g transform="scale(1.4)">' +
          '<rect x="-13" y="-2" width="26" height="7" rx="3.5" fill="#8A5A2B" stroke="#5E3A18" stroke-width="2"/>' +
            '<polygon points="-15,-1 0,-17 15,-1" fill="#3E9B5A" stroke="#1F6A3A" stroke-width="2" stroke-linejoin="round"/>' +
            '<polygon points="-12,-11 0,-26 12,-11" fill="#4FB36B" stroke="#1F6A3A" stroke-width="2" stroke-linejoin="round"/>' +
            '<polygon points="-9,-21 0,-34 9,-21" fill="#5CC27A" stroke="#1F6A3A" stroke-width="2" stroke-linejoin="round"/>' +
            '<path d="M0 -42 l1.8 4.2 4.4 .4 -3.3 3 1 4.4 -3.9 -2.3 -3.9 2.3 1 -4.4 -3.3 -3 4.4 -.4z" fill="#FFD23F" stroke="#E0A800" stroke-width="1"/>' +
            '<circle cx="-5" cy="-8" r="1.6" fill="#E5483A"/><circle cx="6" cy="-14" r="1.6" fill="#FFC93C"/><circle cx="-2" cy="-21" r="1.4" fill="#FF8FB1"/>' +
          "</g>"
        );
      },
    },
    {
      id: "ch-goggles", island: 1, unit: 3, world: "Mountain lake", slot: "face", name: "Lake goggles", cn: "泳镜", vb: "12 22 96 36", a: { ey: 40, edx: 20, er: 10 },
      draw: function (a) {
        var x1 = 60 - a.edx,
          x2 = 60 + a.edx,
          r = a.er + 5.5,
          y = a.ey;
        return '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M' + (x1 - r) + " " + y + " L" + (x1 - r - 14) + " " + (y - 2) + " M" + (x2 + r) + " " + y + " L" + (x2 + r + 14) + " " + (y - 2) + '" fill="none" stroke="#2F7FD1" stroke-width="4.6"/>' +
          '<path d="M' + (x1 + r) + " " + y + " H" + (x2 - r) + '" fill="none" stroke="#2F7FD1" stroke-width="4.4"/>' +
          '<circle cx="' + x1 + '" cy="' + y + '" r="' + r + '" fill="rgba(150,210,255,.55)" stroke="#2F7FD1" stroke-width="3.6"/>' +
          '<circle cx="' + x2 + '" cy="' + y + '" r="' + r + '" fill="rgba(150,210,255,.55)" stroke="#2F7FD1" stroke-width="3.6"/>' +
          '<path d="M' + (x1 - r * 0.55) + " " + (y - r * 0.2) + " Q" + (x1 - r * 0.35) + " " + (y - r * 0.6) + " " + (x1 + r * 0.05) + " " + (y - r * 0.62) + '" fill="none" stroke="#fff" stroke-width="2.2" opacity=".9"/>' +
          '<path d="M' + (x2 - r * 0.55) + " " + (y - r * 0.2) + " Q" + (x2 - r * 0.35) + " " + (y - r * 0.6) + " " + (x2 + r * 0.05) + " " + (y - r * 0.62) + '" fill="none" stroke="#fff" stroke-width="2.2" opacity=".9"/></g>';
      },
    },
    {
      id: "ch-beanie", island: 1, unit: 4, world: "Snowy peak", slot: "hat", name: "Snow beanie", cn: "雪帽", vb: "28 2 64 58", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<g transform="scale(1.25)">' +
          '<path d="M-20 5 Q-20 -20 0 -22 Q20 -20 20 5Z" fill="#CFE6FF" stroke="#5B8FD0" stroke-width="2.6" stroke-linejoin="round"/>' +
            '<path d="M-10 -18 L-10 3 M0 -21 V3 M10 -18 L10 3" fill="none" stroke="#9CC4F2" stroke-width="2.2" stroke-linecap="round"/>' +
            '<rect x="-23" y="-3" width="46" height="11" rx="5.5" fill="#FFFFFF" stroke="#5B8FD0" stroke-width="2.6"/>' +
            '<path d="M-15 -1 V6 M-8 -1 V6 M-1 -1 V6 M6 -1 V6 M13 -1 V6" fill="none" stroke="#C8DDF6" stroke-width="2" stroke-linecap="round"/>' +
            '<circle cx="0" cy="-27" r="6.5" fill="#fff" stroke="#5B8FD0" stroke-width="2.4"/>' +
            '<path d="M0 -12 v7 M-3.4 -9 l6.8 4 M3.4 -9 l-6.8 4" fill="none" stroke="#6FA8F0" stroke-width="1.8" stroke-linecap="round"/>' +
          "</g>"
        );
      },
    },
    {
      id: "ch-sunglasses", island: 1, unit: 5, world: "Summit sunrise", slot: "face", name: "Sunrise shades", cn: "日出墨镜", vb: "14 22 92 36", a: { ey: 40, edx: 20, er: 10 },
      draw: function (a) {
        var x1 = 60 - a.edx,
          x2 = 60 + a.edx,
          rx = a.er + 6.5,
          ry = a.er + 4.5,
          y = a.ey;
        return '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M' + (x1 - rx) + " " + y + " L" + (x1 - rx - 12) + " " + (y - 3) + " M" + (x2 + rx) + " " + y + " L" + (x2 + rx + 12) + " " + (y - 3) + '" fill="none" stroke="#7A3E00" stroke-width="3.4"/>' +
          '<ellipse cx="' + x1 + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#FF9E5E" opacity=".92" stroke="#7A3E00" stroke-width="3"/>' +
          '<ellipse cx="' + x2 + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#FF9E5E" opacity=".92" stroke="#7A3E00" stroke-width="3"/>' +
          '<path d="M' + (x1 - rx + 2) + " " + (y - 1) + " Q" + x1 + " " + (y - ry - 1) + " " + (x1 + rx - 2) + " " + (y - 1) + 'Z" fill="#FF6B8A" opacity=".55"/>' +
          '<path d="M' + (x2 - rx + 2) + " " + (y - 1) + " Q" + x2 + " " + (y - ry - 1) + " " + (x2 + rx - 2) + " " + (y - 1) + 'Z" fill="#FF6B8A" opacity=".55"/>' +
          '<path d="M' + (x1 + rx) + " " + (y - 1) + " Q60 " + (y - 5) + " " + (x2 - rx) + " " + (y - 1) + '" fill="none" stroke="#7A3E00" stroke-width="3.2"/>' +
          '<circle cx="' + (x1 - rx * 0.4) + '" cy="' + (y - ry * 0.35) + '" r="1.8" fill="#fff"/><circle cx="' + (x2 - rx * 0.4) + '" cy="' + (y - ry * 0.35) + '" r="1.8" fill="#fff"/></g>';
      },
    },

    // island 2 (the beach): units 6-10
    {
      id: "ch-sunhat", island: 2, unit: 6, world: "Golden sand", slot: "hat", name: "Straw sun hat", cn: "草编遮阳帽", vb: "18 8 84 48", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<ellipse cx="0" cy="-1" rx="37" ry="9.5" fill="#F6DFA4" stroke="#B8893A" stroke-width="2.6"/>' +
          '<path d="M-26 -1 Q0 6 26 -1 M-18 3 Q0 8 18 3" fill="none" stroke="#DDBB6A" stroke-width="1.6" stroke-linecap="round"/>' +
          '<path d="M-19 -3 Q-21 -29 0 -30 Q21 -29 19 -3 Q0 3 -19 -3Z" fill="#F9E7B3" stroke="#B8893A" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M-19.6 -9 Q0 -3 19.6 -9 L19.2 -15.5 Q0 -9.5 -19.2 -15.5Z" fill="#FF8FB1" stroke="#C0577F" stroke-width="2" stroke-linejoin="round"/>' +
          flower(13, -13, "#FFFFFF", 4.4) + '<path d="M-8 -26 Q-3 -29 2 -27" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>'
        );
      },
    },
    {
      id: "ch-icecream", island: 2, unit: 7, world: "Ice cream pier", slot: "hat", name: "Ice cream hat", cn: "冰淇淋帽", vb: "30 0 60 52", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<g transform="scale(.8)">' +
          '<path d="M-17 -3 Q-20 -22 0 -24 Q20 -22 17 -3 Q14 4 9 0 Q5 6 0 1 Q-5 6 -9 0 Q-14 4 -17 -3Z" fill="#FFB6D1" stroke="#D9577F" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M-12 -30 Q-13 -43 0 -43 Q13 -43 12 -30 Q8 -24 0 -24 Q-8 -24 -12 -30Z" fill="#FFF3D6" stroke="#D9A55A" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M0 -44 Q2 -52 8 -53" fill="none" stroke="#5E3A18" stroke-width="2.2" stroke-linecap="round"/><circle cx="0" cy="-47" r="5.2" fill="#E5483A" stroke="#9E1F3E" stroke-width="2"/>' +
          '<path d="M-9 -14 l3 -2 M2 -16 l3 2 M9 -10 l3 -2 M-3 -8 l3 -1 M-6 -36 l3 -1 M4 -33 l3 1" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/><path d="M-12 -18 l-1 -3 M10 -17 l2 -2" stroke="#7ED957" stroke-width="2.2" stroke-linecap="round"/>' +
          "</g>"
        );
      },
    },
    {
      id: "ch-snorkel", island: 2, unit: 8, world: "Coral reef", slot: "face", name: "Reef mask", cn: "潜水镜", vb: "4 2 114 56", a: { ey: 40, edx: 20, er: 10 },
      draw: function (a) {
        var x1 = 60 - a.edx,
          x2 = 60 + a.edx,
          r = a.er + 6,
          y = a.ey,
          l = x1 - r,
          rr = x2 + r;
        return '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M' + (rr - 2) + " " + (y - 4) + " Q" + (rr + 14) + " " + (y - 26) + " " + (rr + 6) + " " + (y - 38) + '" fill="none" stroke="#FF8A3D" stroke-width="5.6"/>' +
          '<path d="M' + (rr + 6) + " " + (y - 38) + " L" + (rr + 12) + " " + (y - 44) + '" fill="none" stroke="#FFC93C" stroke-width="5.6"/>' +
          '<path d="M' + (l + 2) + " " + y + " L" + (l - 14) + " " + (y - 2) + " M" + (rr - 2) + " " + y + " L" + (rr + 12) + " " + (y - 2) + '" fill="none" stroke="#1F8A8F" stroke-width="4.6"/>' +
          '<rect x="' + l + '" y="' + (y - r + 1) + '" width="' + (rr - l) + '" height="' + (r * 2 - 2) + '" rx="' + (r * 0.8) + '" fill="rgba(150,225,240,.5)" stroke="#1F8A8F" stroke-width="3.8"/>' +
          '<path d="M60 ' + (y - 2) + " Q60 " + (y + r + 3) + " " + (60 + 4) + " " + (y + 3) + " M60 " + (y - 2) + " Q60 " + (y + r + 3) + " " + (60 - 4) + " " + (y + 3) + '" fill="none" stroke="#1F8A8F" stroke-width="2.4"/>' +
          '<path d="M' + (l + 5) + " " + (y - 3) + " Q" + (l + 8) + " " + (y - r * 0.7) + " " + (l + r * 0.9) + " " + (y - r * 0.72) + '" fill="none" stroke="#fff" stroke-width="2.4" opacity=".9"/></g>';
      },
    },
    {
      id: "ch-sailor", island: 2, unit: 9, world: "Lighthouse harbor", slot: "hat", name: "Sailor cap", cn: "水手帽", vb: "22 12 76 42", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M-27 -2 Q-29 -22 -14 -27 Q0 -31 14 -27 Q29 -22 27 -2 Q0 6 -27 -2Z" fill="#FFFFFE" stroke="#4A6FA5" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M-27.4 -6.5 Q0 1.5 27.4 -6.5 L27 -2 Q0 6 -27 -2Z" fill="#2F5DA8" stroke="#1F3F73" stroke-width="2" stroke-linejoin="round"/>' +
          '<path d="M-26 -4 Q0 4 26 -4" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 5" stroke-linecap="round"/>' +
          '<circle cx="0" cy="-17" r="3.2" fill="none" stroke="#2F5DA8" stroke-width="1.8"/><path d="M0 -14 V-7 M-4 -9 H4 M-5 -9 Q-5 -6 0 -6 Q5 -6 5 -9" fill="none" stroke="#2F5DA8" stroke-width="1.8" stroke-linecap="round"/>' +
          '<path d="M-14 -25 Q-8 -28 -2 -27" fill="none" stroke="#C9DAF0" stroke-width="2.4" stroke-linecap="round"/>'
        );
      },
    },
    {
      id: "ch-shells", island: 2, unit: 10, world: "Sunset sail", slot: "neck", name: "Shell necklace", cn: "贝壳项链", vb: "18 92 84 52", a: { ny: 104 },
      draw: function (a) {
        var y = a.ny - 104,
          o = "";
        [[30, 101], [37, 108], [46, 113.5], [60, 116], [74, 113.5], [83, 108], [90, 101]].forEach(function (c, i) {
          o += '<circle cx="' + c[0] + '" cy="' + (c[1] + 0) + '" r="4.3" fill="' + (i % 2 ? "#FFE3EC" : "#FFFFFE") + '" stroke="#D98AA6" stroke-width="1.8"/>';
        });
        o += '<path d="M60 121 L47 133 Q44 125 49 120 Q52 117 56 118Z M60 121 L73 133 Q76 125 71 120 Q68 117 64 118Z M60 121 L52 136 Q60 140 68 136Z" fill="#FFB38A" stroke="#C45A2C" stroke-width="2.2" stroke-linejoin="round"/>' +
          '<path d="M60 122 L56 134 M60 122 L64 134" stroke="#C45A2C" stroke-width="1.6" stroke-linecap="round"/>';
        return '<g transform="translate(0,' + y + ')">' + o + "</g>";
      },
    },

    // island 3 (the castle kingdom): units 11-15
    {
      id: "ch-woolhat", island: 3, unit: 11, world: "Village green", slot: "hat", name: "Woolly hat", cn: "羊毛帽", vb: "24 2 72 50", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<ellipse cx="-24" cy="-4" rx="8" ry="4.4" transform="rotate(-24 -24 -4)" fill="#E7CDB8" stroke="#A8826A" stroke-width="2.2"/><ellipse cx="24" cy="-4" rx="8" ry="4.4" transform="rotate(24 24 -4)" fill="#E7CDB8" stroke="#A8826A" stroke-width="2.2"/>' +
          '<path d="M-22 -1 Q0 6 22 -1 L21 4 Q0 10 -21 4Z" fill="#EEF1F8" stroke="#B9C2D6" stroke-width="2.2" stroke-linejoin="round"/>' +
          '<circle cx="-15" cy="-8" r="9" fill="#FFFFFE" stroke="#B9C2D6" stroke-width="2.2"/><circle cx="15" cy="-8" r="9" fill="#FFFFFE" stroke="#B9C2D6" stroke-width="2.2"/>' +
          '<circle cx="-7" cy="-17" r="10" fill="#FFFFFE" stroke="#B9C2D6" stroke-width="2.2"/><circle cx="8" cy="-17" r="10" fill="#FFFFFE" stroke="#B9C2D6" stroke-width="2.2"/><circle cx="0" cy="-9" r="11" fill="#FFFFFE" stroke="#B9C2D6" stroke-width="2.2"/>' +
          '<path d="M-13 -22 Q-9 -26 -4 -25 M3 -11 Q7 -13 11 -11" fill="none" stroke="#DDE3F0" stroke-width="2" stroke-linecap="round"/>'
        );
      },
    },
    {
      id: "ch-knight", island: 3, unit: 12, world: "Castle gate", slot: "hat", name: "Knight helmet", cn: "骑士头盔", vb: "22 -6 76 60", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M0 -26 Q16 -42 27 -36 Q18 -30 10 -26Z" fill="#E5483A" stroke="#A52A22" stroke-width="2.2" stroke-linejoin="round"/>' +
          '<path d="M-23 3 Q-26 -24 0 -27 Q26 -24 23 3 Q0 8 -23 3Z" fill="#D5DDEB" stroke="#6B7A99" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M-23.4 -1 Q0 5 23.4 -1 L23 4 Q0 9 -23 4Z" fill="#F6C531" stroke="#B8860B" stroke-width="2" stroke-linejoin="round"/>' +
          '<rect x="-15" y="-13" width="30" height="5.4" rx="2.7" fill="#4A5670" stroke="#2F3850" stroke-width="1.6"/><path d="M0 -26 V-14" stroke="#6B7A99" stroke-width="2"/>' +
          '<circle cx="-18" cy="-6" r="1.6" fill="#F6C531"/><circle cx="18" cy="-6" r="1.6" fill="#F6C531"/><path d="M-14 -22 Q-9 -25 -4 -24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>'
        );
      },
    },
    {
      id: "ch-dragoneyes", island: 3, unit: 13, world: "Dragon hill", slot: "face", name: "Dragon goggles", cn: "龙眼镜", vb: "10 20 100 40", a: { ey: 40, edx: 20, er: 10 },
      draw: function (a) {
        var x1 = 60 - a.edx,
          x2 = 60 + a.edx,
          r = a.er + 5.5,
          y = a.ey;
        function lens(x) {
          return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgba(255,196,80,.62)" stroke="#2F8A4C" stroke-width="3.8"/>' +
            '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r * 0.2).toFixed(1) + '" ry="' + (r * 0.68).toFixed(1) + '" fill="#2B1B0E"/>' +
            '<polygon points="' + (x - r * 0.5) + "," + (y - r - 1.5) + " " + x + "," + (y - r - 7) + " " + (x + r * 0.5) + "," + (y - r - 1.5) + '" fill="#4FB36B" stroke="#1F6A3A" stroke-width="1.8" stroke-linejoin="round"/>' +
            '<path d="M' + (x - r * 0.55) + " " + (y - r * 0.2) + " Q" + (x - r * 0.35) + " " + (y - r * 0.6) + " " + (x + r * 0.05) + " " + (y - r * 0.62) + '" fill="none" stroke="#fff" stroke-width="2.2" opacity=".9"/>';
        }
        return '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M' + (x1 - r) + " " + y + " L" + (x1 - r - 14) + " " + (y - 2) + " M" + (x2 + r) + " " + y + " L" + (x2 + r + 14) + " " + (y - 2) + '" fill="none" stroke="#2F8A4C" stroke-width="4.6"/>' +
          '<path d="M' + (x1 + r) + " " + y + " H" + (x2 - r) + '" fill="none" stroke="#2F8A4C" stroke-width="4.4"/>' + lens(x1) + lens(x2) + "</g>";
      },
    },
    {
      id: "ch-rosegarland", island: 3, unit: 14, world: "Royal garden", slot: "neck", name: "Rose garland", cn: "玫瑰花环", vb: "18 92 84 52", a: { ny: 104 },
      draw: function (a) {
        var y = a.ny - 104,
          o = "";
        function rose(x, yy, r, c, d) {
          return '<circle cx="' + x + '" cy="' + yy + '" r="' + r + '" fill="' + c + '" stroke="' + d + '" stroke-width="1.8"/><path d="M' + (x - r * 0.5) + " " + yy + " Q" + x + " " + (yy - r * 0.7) + " " + (x + r * 0.5) + " " + yy + " Q" + x + " " + (yy + r * 0.6) + " " + (x - r * 0.2) + " " + (yy + r * 0.1) + '" fill="none" stroke="' + d + '" stroke-width="1.4" stroke-linecap="round"/>';
        }
        [[30, 101], [38, 109], [48, 114.5], [72, 114.5], [82, 109], [90, 101]].forEach(function (c) {
          o += '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="6.4" ry="3" transform="rotate(' + (c[0] < 60 ? 28 : -28) + " " + c[0] + " " + c[1] + ')" fill="#5CC27A" stroke="#2F7D48" stroke-width="1.6"/>';
        });
        o += rose(32, 101, 4.4, "#FF8FB1", "#C0577F") + rose(46, 112, 4.6, "#FFFFFE", "#C9B0C0") + rose(74, 112, 4.6, "#FFC93C", "#B8860B") + rose(88, 101, 4.4, "#FF8FB1", "#C0577F") +
          '<ellipse cx="53" cy="117" rx="6" ry="2.8" transform="rotate(20 53 117)" fill="#5CC27A" stroke="#2F7D48" stroke-width="1.6"/><ellipse cx="67" cy="117" rx="6" ry="2.8" transform="rotate(-20 67 117)" fill="#5CC27A" stroke="#2F7D48" stroke-width="1.6"/>' +
          rose(60, 119, 7.4, "#E5483A", "#8E2A22") + '<circle cx="58" cy="117" r="1.4" fill="#fff" opacity=".7"/>';
        return '<g transform="translate(0,' + y + ')">' + o + "</g>";
      },
    },
    {
      id: "ch-crown", island: 3, unit: 15, world: "Throne hall", slot: "hat", name: "Royal crown", cn: "皇冠", vb: "26 -4 68 52", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M-21 3 L-24 -20 L-12 -9 L0 -26 L12 -9 L24 -20 L21 3 Q0 8 -21 3Z" fill="#F6C531" stroke="#B8860B" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M-21.4 -1 Q0 5 21.4 -1 L21 3.4 Q0 8.6 -21 3.4Z" fill="#E5483A" stroke="#8E2A22" stroke-width="2" stroke-linejoin="round"/>' +
          '<circle cx="-24" cy="-21" r="3.2" fill="#8B6BE8" stroke="#4A3A9A" stroke-width="1.6"/><circle cx="0" cy="-27" r="3.6" fill="#E5483A" stroke="#8E2A22" stroke-width="1.6"/><circle cx="24" cy="-21" r="3.2" fill="#3D8BF2" stroke="#1F4F9A" stroke-width="1.6"/>' +
          '<circle cx="-9" cy="-3" r="2.2" fill="#3D8BF2"/><circle cx="0" cy="-2" r="2.4" fill="#FFFFFF"/><circle cx="9" cy="-3" r="2.2" fill="#6CCB5F"/><path d="M-14 -10 L-10 -14" stroke="#FFF2B8" stroke-width="2.2" stroke-linecap="round"/>'
        );
      },
    },

    // island 4 (outer space): units 16-20
    {
      id: "ch-helmet", island: 4, unit: 16, world: "Launch pad", slot: "hat", name: "Space helmet", cn: "太空头盔", vb: "20 -4 80 62", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M-25 6 Q-30 -26 0 -29 Q30 -26 25 6 Q0 12 -25 6Z" fill="#F4F6FF" stroke="#8A97AD" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M-17 -2 Q-18 -20 0 -21 Q18 -20 17 -2 Q0 4 -17 -2Z" fill="rgba(120,190,255,.55)" stroke="#4F8FD0" stroke-width="2.2" stroke-linejoin="round"/>' +
          '<path d="M-11 -14 Q-6 -19 -1 -18" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>' +
          '<rect x="-26" y="1" width="52" height="7" rx="3.5" fill="#E5483A" stroke="#8E2A22" stroke-width="2"/><circle cx="-14" cy="4.6" r="1.6" fill="#fff"/><circle cx="0" cy="4.6" r="1.6" fill="#fff"/><circle cx="14" cy="4.6" r="1.6" fill="#fff"/>' +
          '<path d="M24 -14 L36 -24 M36 -24 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0" fill="none" stroke="#8A97AD" stroke-width="2.4" stroke-linecap="round"/>'
        );
      },
    },
    {
      id: "ch-moonneck", island: 4, unit: 17, world: "Moon walk", slot: "neck", name: "Moon medal", cn: "月亮奖牌", vb: "18 92 84 52", a: { ny: 104 },
      draw: function (a) {
        var y = a.ny - 104,
          o = "";
        [[30, 101], [37, 108], [46, 113.5], [60, 116], [74, 113.5], [83, 108], [90, 101]].forEach(function (c, i) {
          o += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3.2" fill="' + (i % 2 ? "#E6B5F5" : "#C9B6F2") + '" stroke="#7A58C8" stroke-width="1.6"/>';
        });
        o += '<path d="M60 118 L60 122" stroke="#7A58C8" stroke-width="2"/><circle cx="60" cy="132" r="13" fill="#2B2670" stroke="#FFD23F" stroke-width="3"/>' +
          '<path d="M64 122 A10 10 0 1 0 64 142 A7.4 7.4 0 0 1 64 122Z" fill="#FFE58A" stroke="#B8860B" stroke-width="1.4" stroke-linejoin="round"/>' +
          '<circle cx="66" cy="128" r="1.4" fill="#fff"/><circle cx="55" cy="139" r="1.1" fill="#fff"/>';
        return '<g transform="translate(0,' + y + ')">' + o + "</g>";
      },
    },
    {
      id: "ch-cometband", island: 4, unit: 18, world: "Comet trail", slot: "hat", name: "Comet headband", cn: "彗星发带", vb: "16 -6 88 58", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M-24 4 Q0 -8 24 4" fill="none" stroke="#7A58C8" stroke-width="6.4" stroke-linecap="round"/><path d="M-24 4 Q0 -8 24 4" fill="none" stroke="#B79CF0" stroke-width="3.4" stroke-linecap="round"/>' +
          '<path d="M10 -6 L-18 -26 M12 -4 L-14 -16 M8 -8 L-8 -30" stroke="#E6D8FF" stroke-width="4" stroke-linecap="round" opacity=".8"/>' +
          '<path d="M14 -2 l2.6 -9 l2.6 9 l9 2.6 l-9 2.6 l-2.6 9 l-2.6 -9 l-9 -2.6z" fill="#FFE066" stroke="#B8860B" stroke-width="1.6" stroke-linejoin="round" transform="translate(4,-14) scale(1.1)"/>' +
          '<circle cx="-20" cy="-26" r="2" fill="#fff"/><circle cx="-8" cy="-31" r="1.6" fill="#fff"/>'
        );
      },
    },
    {
      id: "ch-planetglasses", island: 4, unit: 19, world: "Ringed planet", slot: "face", name: "Planet glasses", cn: "星球眼镜", vb: "6 14 108 48", a: { ey: 40, edx: 20, er: 10 },
      draw: function (a) {
        var x1 = 60 - a.edx,
          x2 = 60 + a.edx,
          r = a.er + 5.5,
          y = a.ey;
        function lens(x) {
          return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgba(186,150,255,.45)" stroke="#7A58C8" stroke-width="3.8"/>' +
            '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r + 6) + '" ry="' + (r * 0.34).toFixed(1) + '" transform="rotate(-16 ' + x + " " + y + ')" fill="none" stroke="#FFB05C" stroke-width="3"/>' +
            '<path d="M' + (x - r * 0.55) + " " + (y - r * 0.2) + " Q" + (x - r * 0.35) + " " + (y - r * 0.6) + " " + (x + r * 0.05) + " " + (y - r * 0.62) + '" fill="none" stroke="#fff" stroke-width="2.2" opacity=".9"/>';
        }
        return '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M' + (x1 - r) + " " + y + " L" + (x1 - r - 14) + " " + (y - 2) + " M" + (x2 + r) + " " + y + " L" + (x2 + r + 14) + " " + (y - 2) + '" fill="none" stroke="#7A58C8" stroke-width="4.6"/>' +
          '<path d="M' + (x1 + r) + " " + y + " H" + (x2 - r) + '" fill="none" stroke="#7A58C8" stroke-width="4.4"/>' + lens(x1) + lens(x2) + "</g>";
      },
    },
    {
      id: "ch-alien", island: 4, unit: 20, world: "Alien base", slot: "hat", name: "Alien antennas", cn: "外星触角", vb: "20 -8 80 62", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M-20 4 Q0 -6 20 4" fill="none" stroke="#2F8A4C" stroke-width="6.4" stroke-linecap="round"/><path d="M-20 4 Q0 -6 20 4" fill="none" stroke="#6CCB5F" stroke-width="3.4" stroke-linecap="round"/>' +
          '<path d="M-12 -2 Q-22 -16 -18 -30" fill="none" stroke="#2F8A4C" stroke-width="3.4" stroke-linecap="round"/><path d="M12 -2 Q22 -16 18 -30" fill="none" stroke="#2F8A4C" stroke-width="3.4" stroke-linecap="round"/>' +
          '<circle cx="-18" cy="-33" r="6.4" fill="#FF6FA0" stroke="#B8305F" stroke-width="2.2"/><circle cx="18" cy="-33" r="6.4" fill="#FFD23F" stroke="#B8860B" stroke-width="2.2"/><circle cx="-20" cy="-35" r="1.8" fill="#fff" opacity=".8"/><circle cx="16" cy="-35" r="1.8" fill="#fff" opacity=".8"/>'
        );
      },
    },

    // island 5 (the jungle): units 21-25
    {
      id: "ch-vinecrown", island: 5, unit: 21, world: "Vine bridge", slot: "hat", name: "Vine crown", cn: "藤蔓王冠", vb: "18 -8 84 60", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M-25 5 Q0 -8 25 5" fill="none" stroke="#2F8A4C" stroke-width="6.6" stroke-linecap="round"/><path d="M-25 5 Q0 -8 25 5" fill="none" stroke="#5DBB5A" stroke-width="3.4" stroke-linecap="round"/>' +
          '<ellipse cx="-18" cy="-4" rx="8" ry="4" transform="rotate(-50 -18 -4)" fill="#6CCB5F" stroke="#2F8A4C" stroke-width="1.8"/><ellipse cx="18" cy="-4" rx="8" ry="4" transform="rotate(50 18 -4)" fill="#6CCB5F" stroke="#2F8A4C" stroke-width="1.8"/>' +
          '<ellipse cx="-8" cy="-9" rx="7" ry="3.6" transform="rotate(-24 -8 -9)" fill="#4FB36B" stroke="#2F8A4C" stroke-width="1.8"/><ellipse cx="9" cy="-9" rx="7" ry="3.6" transform="rotate(24 9 -9)" fill="#4FB36B" stroke="#2F8A4C" stroke-width="1.8"/>' +
          '<circle cx="0" cy="-10" r="3.4" fill="#FF6FA0" stroke="#B8305F" stroke-width="1.4"/><circle cx="-4" cy="-14" r="3.4" fill="#FF6FA0" stroke="#B8305F" stroke-width="1.4"/><circle cx="4" cy="-14" r="3.4" fill="#FF6FA0" stroke="#B8305F" stroke-width="1.4"/><circle cx="0" cy="-14" r="2.6" fill="#FFD23F" stroke="#B8860B" stroke-width="1.2"/>'
        );
      },
    },
    {
      id: "ch-crystalneck", island: 5, unit: 22, world: "Waterfall cave", slot: "neck", name: "Crystal necklace", cn: "水晶项链", vb: "18 92 84 62", a: { ny: 104 },
      draw: function (a) {
        var y = a.ny - 104,
          o = "";
        [[30, 101], [37, 108], [46, 113.5], [60, 116], [74, 113.5], [83, 108], [90, 101]].forEach(function (c, i) {
          o += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3.2" fill="' + (i % 2 ? "#E4F6FF" : "#9ADCF5") + '" stroke="#3D8BF2" stroke-width="1.6"/>';
        });
        o += '<path d="M60 118 L60 122" stroke="#3D8BF2" stroke-width="2"/><path d="M60 122 L70 134 L60 150 L50 134Z" fill="#8FD0F2" stroke="#2A66C9" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M50 134 H70 M60 122 L56 134 L60 150 M60 122 L64 134 L60 150" fill="none" stroke="#E4F6FF" stroke-width="1.4" opacity=".9"/><path d="M54 130 L58 126" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>';
        return '<g transform="translate(0,' + y + ')">' + o + "</g>";
      },
    },
    {
      id: "ch-monkeyears", island: 5, unit: 23, world: "Monkey treetops", slot: "hat", name: "Monkey ears", cn: "猴子耳朵", vb: "14 -12 92 62", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M-24 6 Q0 -8 24 6" fill="none" stroke="#6B4423" stroke-width="6.4" stroke-linecap="round"/><path d="M-24 6 Q0 -8 24 6" fill="none" stroke="#9A6A3A" stroke-width="3.4" stroke-linecap="round"/>' +
          '<circle cx="-26" cy="-4" r="10" fill="#9A6A3A" stroke="#6B4423" stroke-width="2.4"/><circle cx="-26" cy="-4" r="5.4" fill="#E8C79A"/><circle cx="26" cy="-4" r="10" fill="#9A6A3A" stroke="#6B4423" stroke-width="2.4"/><circle cx="26" cy="-4" r="5.4" fill="#E8C79A"/>' +
          '<path d="M2 -6 Q14 -16 22 -8 Q12 -8 2 -6Z" fill="#FFD23F" stroke="#B8860B" stroke-width="2" stroke-linejoin="round"/>'
        );
      },
    },
    {
      id: "ch-explorer", island: 5, unit: 24, world: "Hidden temple", slot: "face", name: "Explorer goggles", cn: "探险护目镜", vb: "6 14 108 48", a: { ey: 40, edx: 20, er: 10 },
      draw: function (a) {
        var x1 = 60 - a.edx,
          x2 = 60 + a.edx,
          r = a.er + 5.5,
          y = a.ey;
        function lens(x) {
          return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgba(150,215,255,.5)" stroke="#8A5A00" stroke-width="4"/><circle cx="' + x + '" cy="' + y + '" r="' + (r + 1.6) + '" fill="none" stroke="#E0A93B" stroke-width="1.8"/>' +
            '<path d="M' + (x - r * 0.55) + " " + (y - r * 0.2) + " Q" + (x - r * 0.35) + " " + (y - r * 0.6) + " " + (x + r * 0.05) + " " + (y - r * 0.62) + '" fill="none" stroke="#fff" stroke-width="2.2" opacity=".9"/><circle cx="' + (x + r * 0.7) + '" cy="' + (y - r * 0.7) + '" r="1.6" fill="#E0A93B"/>';
        }
        return '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M' + (x1 - r) + " " + y + " L" + (x1 - r - 14) + " " + (y - 2) + " M" + (x2 + r) + " " + y + " L" + (x2 + r + 14) + " " + (y - 2) + '" fill="none" stroke="#6B4423" stroke-width="4.6"/>' +
          '<path d="M' + (x1 + r) + " " + y + " H" + (x2 - r) + '" fill="none" stroke="#8A5A00" stroke-width="4.4"/>' + lens(x1) + lens(x2) + "</g>";
      },
    },
    {
      id: "ch-safarihat", island: 5, unit: 25, world: "Golden river", slot: "hat", name: "Explorer hat", cn: "探险帽", vb: "10 -12 100 64", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<ellipse cx="0" cy="3" rx="36" ry="9" fill="#D9B77A" stroke="#8A6A3A" stroke-width="2.6"/><path d="M-21 3 Q-22 -22 0 -24 Q22 -22 21 3 Q0 10 -21 3Z" fill="#E8C98A" stroke="#8A6A3A" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M-21 -3 Q0 4 21 -3 L21.4 -8 Q0 -1 -21.4 -8Z" fill="#FFD23F" stroke="#B8860B" stroke-width="1.8" stroke-linejoin="round"/>' +
          '<path d="M14 -6 Q26 -22 32 -26 Q28 -12 18 -4Z" fill="#E5483A" stroke="#8E2A22" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 -6 Q24 -16 30 -24" fill="none" stroke="#FFC93C" stroke-width="1.4"/>'
        );
      },
    },

    // island 6 (the deep sea): units 26-30
    {
      id: "ch-coralcrown", island: 6, unit: 26, world: "Pearl reef", slot: "hat", name: "Coral crown", cn: "珊瑚王冠", vb: "14 -14 92 64", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M-27 5 Q0 -6 27 5" fill="none" stroke="#C84A6A" stroke-width="6.8" stroke-linecap="round"/><path d="M-27 5 Q0 -6 27 5" fill="none" stroke="#FF7A9A" stroke-width="3.6" stroke-linecap="round"/>' +
          '<path d="M-19 0 V-15 M-19 -8 L-26 -16 M-19 -11 L-13 -21" fill="none" stroke="#FF8A5A" stroke-width="4.6" stroke-linecap="round"/><path d="M0 -4 V-24 M0 -13 L-8 -23 M0 -18 L8 -28" fill="none" stroke="#FF7A9A" stroke-width="5.2" stroke-linecap="round"/><path d="M19 0 V-15 M19 -8 L26 -16 M19 -11 L13 -21" fill="none" stroke="#B58AE8" stroke-width="4.6" stroke-linecap="round"/>' +
          '<circle cx="-26" cy="-17" r="2.8" fill="#FFF3E6"/><circle cx="-13" cy="-22" r="2.8" fill="#FFF3E6"/><circle cx="-8" cy="-24" r="3" fill="#FFF3E6"/><circle cx="8" cy="-29" r="3" fill="#FFF3E6"/><circle cx="13" cy="-22" r="2.8" fill="#FFF3E6"/><circle cx="26" cy="-17" r="2.8" fill="#FFF3E6"/><circle cx="0" cy="-26" r="3.2" fill="#FFF3E6"/>'
        );
      },
    },
    {
      id: "ch-pearlneck", island: 6, unit: 27, world: "Kelp forest", slot: "neck", name: "Pearl necklace", cn: "珍珠项链", vb: "18 92 84 62", a: { ny: 104 },
      draw: function (a) {
        var y = a.ny - 104,
          o = "";
        [[30, 101], [37, 108], [46, 113.5], [60, 116], [74, 113.5], [83, 108], [90, 101]].forEach(function (c) {
          o += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3.6" fill="#FFF9F2" stroke="#C9B8A8" stroke-width="1.6"/><circle cx="' + (c[0] - 1) + '" cy="' + (c[1] - 1.2) + '" r="1.2" fill="#fff"/>';
        });
        o += '<path d="M60 119 L60 123" stroke="#C9B8A8" stroke-width="2"/><path d="M60 148 L46 132 Q60 120 74 132Z" fill="#FFB3C7" stroke="#C45A7A" stroke-width="2.2" stroke-linejoin="round"/>' +
          '<path d="M60 148 L53 132 M60 148 V127 M60 148 L67 132" fill="none" stroke="#E88FB1" stroke-width="1.6" stroke-linecap="round"/><circle cx="60" cy="140" r="4" fill="#FFF9F2" stroke="#C9B8A8" stroke-width="1.6"/>';
        return '<g transform="translate(0,' + y + ')">' + o + "</g>";
      },
    },
    {
      id: "ch-captainhat", island: 6, unit: 28, world: "Sunken ship", slot: "hat", name: "Captain hat", cn: "船长帽", vb: "12 -10 96 58", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M-33 6 Q-31 -4 -18 -7 Q-14 -25 0 -25 Q14 -25 18 -7 Q31 -4 33 6 Q0 14 -33 6Z" fill="#2B3A6B" stroke="#161D40" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M-19 -6 Q0 0 19 -6 L19.6 -11 Q0 -5 -19.6 -11Z" fill="#FFD23F" stroke="#B8860B" stroke-width="1.6" stroke-linejoin="round"/>' +
          '<circle cx="0" cy="-17" r="6.4" fill="#FFD23F" stroke="#B8860B" stroke-width="1.6"/><path d="M0 -21 V-13 M-3 -15 Q0 -11 3 -15 M-2.4 -19.4 H2.4" fill="none" stroke="#2B3A6B" stroke-width="1.6" stroke-linecap="round"/>' +
          '<path d="M-26 4 Q0 12 26 4" fill="none" stroke="#fff" stroke-width="1.6" opacity=".35"/>'
        );
      },
    },
    {
      id: "ch-divemask", island: 6, unit: 29, world: "Whale song", slot: "face", name: "Diving mask", cn: "潜水面罩", vb: "4 4 116 60", a: { ey: 40, edx: 20, er: 10 },
      draw: function (a) {
        var x1 = 60 - a.edx,
          x2 = 60 + a.edx,
          r = a.er + 5.5,
          y = a.ey;
        function lens(x) {
          return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgba(150,225,255,.55)" stroke="#1F5FBF" stroke-width="4"/><circle cx="' + x + '" cy="' + y + '" r="' + (r + 1.6) + '" fill="none" stroke="#8FD0F2" stroke-width="1.8"/>' +
            '<path d="M' + (x - r * 0.55) + " " + (y - r * 0.2) + " Q" + (x - r * 0.35) + " " + (y - r * 0.6) + " " + (x + r * 0.05) + " " + (y - r * 0.62) + '" fill="none" stroke="#fff" stroke-width="2.2" opacity=".9"/>';
        }
        return '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M' + (x1 - r) + " " + y + " L" + (x1 - r - 14) + " " + (y - 2) + " M" + (x2 + r) + " " + y + " L" + (x2 + r + 14) + " " + (y - 2) + '" fill="none" stroke="#1B3E8A" stroke-width="4.6"/>' +
          '<path d="M' + (x1 + r) + " " + y + " H" + (x2 - r) + '" fill="none" stroke="#1F5FBF" stroke-width="4.4"/>' + lens(x1) + lens(x2) +
          '<path d="M' + (x2 + r + 12) + " " + (y - 2) + " V" + (y - 34) + " H" + (x2 + r + 20) + '" fill="none" stroke="#E5483A" stroke-width="5"/><circle cx="' + (x2 + r + 20) + '" cy="' + (y - 34) + '" r="2.6" fill="#FFC93C" stroke="none"/></g>';
      },
    },
    {
      id: "ch-treasurecrown", island: 6, unit: 30, world: "Treasure deep", slot: "hat", name: "Treasure crown", cn: "宝藏王冠", vb: "20 -12 80 58", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M-24 8 L-28 -14 L-14 -4 L0 -22 L14 -4 L28 -14 L24 8Q0 14 -24 8Z" fill="#FFD23F" stroke="#B8860B" stroke-width="2.6" stroke-linejoin="round"/><path d="M-23 3 Q0 9 23 3" fill="none" stroke="#B8860B" stroke-width="1.8"/>' +
          '<circle cx="-28" cy="-16" r="3.4" fill="#FFF9F2" stroke="#C9B8A8" stroke-width="1.4"/><circle cx="0" cy="-24" r="3.6" fill="#FFF9F2" stroke="#C9B8A8" stroke-width="1.4"/><circle cx="28" cy="-16" r="3.4" fill="#FFF9F2" stroke="#C9B8A8" stroke-width="1.4"/>' +
          '<circle cx="-12" cy="-1" r="3.6" fill="#E5483A" stroke="#8E2A22" stroke-width="1.4"/><circle cx="0" cy="-8" r="4.2" fill="#6BB7FF" stroke="#2A66C9" stroke-width="1.4"/><circle cx="12" cy="-1" r="3.6" fill="#35B779" stroke="#1F7A4C" stroke-width="1.4"/>' +
          '<path d="M-18 -10 L-14 -14" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>'
        );
      },
    },

    // island 7 (the desert): units 31-35
    {
      id: "ch-cactushat", island: 7, unit: 31, world: "Sand dunes", slot: "hat", name: "Cactus hat", cn: "仙人掌帽", vb: "20 2 80 60", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<ellipse cx="0" cy="5" rx="29" ry="7" fill="#E8C27A" stroke="#A8782A" stroke-width="2.6"/><path d="M-22 5 Q0 11 22 5" fill="none" stroke="#C99A44" stroke-width="2" opacity=".8"/>' +
          '<path d="M-8 4 V-18 Q-8 -27 0 -27 Q8 -27 8 -18 V4Z" fill="#4FA06A" stroke="#2E6E48" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M-8 -6 H-15 Q-19 -6 -19 -11 V-19 Q-19 -23 -15 -23 Q-12 -23 -12 -19 V-12 H-8" fill="#4FA06A" stroke="#2E6E48" stroke-width="2.2" stroke-linejoin="round"/>' +
          '<path d="M8 -10 H15 Q19 -10 19 -15 V-22 Q19 -26 15 -26 Q12 -26 12 -22 V-16 H8" fill="#4FA06A" stroke="#2E6E48" stroke-width="2.2" stroke-linejoin="round"/>' +
          '<path d="M-3 2 V-20 M3 2 V-20" stroke="#2E6E48" stroke-width="1.2" opacity=".55"/><circle cx="0" cy="-30" r="4.6" fill="#FF8FB1" stroke="#C0577F" stroke-width="1.6"/><circle cx="0" cy="-30" r="1.8" fill="#FFE066"/>'
        );
      },
    },
    {
      id: "ch-amberneck", island: 7, unit: 32, world: "Oasis town", slot: "neck", name: "Amber necklace", cn: "琥珀项链", vb: "18 92 84 62", a: { ny: 104 },
      draw: function (a) {
        var y = a.ny - 104,
          o = "";
        [[30, 101], [37, 108], [46, 113.5], [60, 116], [74, 113.5], [83, 108], [90, 101]].forEach(function (c, i) {
          o += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3.9" fill="' + (i % 2 ? "#E58A1F" : "#F2A93B") + '" stroke="#9A5A12" stroke-width="1.6"/><circle cx="' + (c[0] - 1.1) + '" cy="' + (c[1] - 1.3) + '" r="1.2" fill="#FFE9B8"/>';
        });
        o += '<path d="M60 119 L60 123" stroke="#9A5A12" stroke-width="2"/><path d="M60 151 Q47 138 52 129 Q56 123 60 123 Q64 123 68 129 Q73 138 60 151Z" fill="#F2A93B" stroke="#9A5A12" stroke-width="2.2" stroke-linejoin="round"/>' +
          '<path d="M55 135 Q54 130 58 128" fill="none" stroke="#FFE9B8" stroke-width="2.2" stroke-linecap="round"/><circle cx="62" cy="139" r="1.6" fill="#7A4208" opacity=".5"/>';
        return '<g transform="translate(0,' + y + ')">' + o + "</g>";
      },
    },
    {
      id: "ch-desertgoggles", island: 7, unit: 33, world: "Pyramid hall", slot: "face", name: "Desert goggles", cn: "沙漠护目镜", vb: "4 4 116 60", a: { ey: 40, edx: 20, er: 10 },
      draw: function (a) {
        var x1 = 60 - a.edx,
          x2 = 60 + a.edx,
          r = a.er + 5.5,
          y = a.ey;
        function lens(x) {
          return '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 1.6) + '" fill="#C98B3A" stroke="#7A4E12" stroke-width="2"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgba(255,205,110,.6)" stroke="#8A5A1A" stroke-width="2.4"/>' +
            '<path d="M' + (x - r * 0.55) + " " + (y - r * 0.2) + " Q" + (x - r * 0.35) + " " + (y - r * 0.6) + " " + (x + r * 0.05) + " " + (y - r * 0.62) + '" fill="none" stroke="#fff" stroke-width="2.2" opacity=".9"/>' +
            '<circle cx="' + (x - r - 0.6) + '" cy="' + y + '" r="1.4" fill="#FFE9B8"/><circle cx="' + (x + r + 0.6) + '" cy="' + y + '" r="1.4" fill="#FFE9B8"/>';
        }
        return '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M' + (x1 - r - 2) + " " + y + " L" + (x1 - r - 16) + " " + (y - 2) + " M" + (x2 + r + 2) + " " + y + " L" + (x2 + r + 16) + " " + (y - 2) + '" fill="none" stroke="#7A4E2A" stroke-width="5.4"/>' +
          '<path d="M' + (x1 + r) + " " + y + " H" + (x2 - r) + '" fill="none" stroke="#9A6A22" stroke-width="4.4"/>' + lens(x1) + lens(x2) + "</g>";
      },
    },
    {
      id: "ch-moonhat", island: 7, unit: 34, world: "Starry night", slot: "hat", name: "Moon-star hat", cn: "月星帽", vb: "20 -6 80 66", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M-20 4 Q-14 -14 -8 -30 Q-4 -40 8 -44 Q10 -38 14 -28 Q20 -12 22 4Z" fill="#3A3F9E" stroke="#1E2266" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M8 -44 Q14 -46 17 -41 Q12 -40 8 -44Z" fill="#3A3F9E" stroke="#1E2266" stroke-width="2" stroke-linejoin="round"/>' +
          '<ellipse cx="0" cy="5" rx="30" ry="7" fill="#2E3282" stroke="#1E2266" stroke-width="2.6"/>' +
          '<path d="M-6 -12 A9 9 0 1 0 4 -2 A7 7 0 0 1 -6 -12Z" fill="#FFE58A" stroke="#C99A1A" stroke-width="1.6" stroke-linejoin="round"/>' +
          '<path d="M10 -20 l1.8 3.8 l4.2 0.6 l-3 3 l0.8 4.2 l-3.8 -2 l-3.8 2 l0.8 -4.2 l-3 -3 l4.2 -0.6Z" fill="#FFE066" stroke="#C99A1A" stroke-width="1"/>' +
          '<circle cx="-12" cy="-3" r="1.8" fill="#FFE066"/><circle cx="14" cy="-4" r="1.5" fill="#FFFFFF"/><circle cx="2" cy="-30" r="1.4" fill="#FFFFFF"/>'
        );
      },
    },
    {
      id: "ch-camelears", island: 7, unit: 35, world: "Camel caravan", slot: "hat", name: "Camel ears", cn: "骆驼耳朵", vb: "20 14 80 48", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M-24 6 Q0 -6 24 6" fill="none" stroke="#7A4E2A" stroke-width="6.4" stroke-linecap="round"/><path d="M-24 6 Q0 -6 24 6" fill="none" stroke="#A8713A" stroke-width="3.4" stroke-linecap="round"/>' +
          '<g transform="translate(-20 -6) rotate(-16)"><ellipse cx="0" cy="-9" rx="8.4" ry="14" fill="#D8A25E" stroke="#8A5A22" stroke-width="2.4"/><ellipse cx="0" cy="-8" rx="4.4" ry="9" fill="#F4C9A0"/></g>' +
          '<g transform="translate(20 -6) rotate(16)"><ellipse cx="0" cy="-9" rx="8.4" ry="14" fill="#D8A25E" stroke="#8A5A22" stroke-width="2.4"/><ellipse cx="0" cy="-8" rx="4.4" ry="9" fill="#F4C9A0"/></g>'
        );
      },
    },

    // island 8 (the polar island): units 36-40
    {
      id: "ch-snowcap", island: 8, unit: 36, world: "Snow hills", slot: "hat", name: "Pom-pom cap", cn: "绒球雪帽", vb: "20 2 80 60", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M-21 4 Q-24 -20 0 -24 Q24 -20 21 4Z" fill="#4FA8F0" stroke="#2A66C9" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M-13 -14 Q0 -20 13 -14 M-17 -6 Q0 -12 17 -6" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".85"/>' +
          '<rect x="-25" y="-2" width="50" height="11" rx="5.5" fill="#FFFFFF" stroke="#BFD6EE" stroke-width="2.4"/><path d="M-14 1 V7 M-4 1 V7 M6 1 V7 M16 1 V7" stroke="#D5E4F5" stroke-width="2" stroke-linecap="round"/>' +
          '<circle cx="0" cy="-29" r="6.6" fill="#FFFFFF" stroke="#BFD6EE" stroke-width="2.2"/><circle cx="-2" cy="-31" r="1.8" fill="#EAF3FC"/>'
        );
      },
    },
    {
      id: "ch-snowflakeneck", island: 8, unit: 37, world: "Igloo village", slot: "neck", name: "Snowflake necklace", cn: "雪花项链", vb: "18 92 84 62", a: { ny: 104 },
      draw: function (a) {
        var y = a.ny - 104,
          o = "";
        [[30, 101], [37, 108], [46, 113.5], [60, 116], [74, 113.5], [83, 108], [90, 101]].forEach(function (c, i) {
          o += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3.9" fill="' + (i % 2 ? "#FFFFFF" : "#BFE6FF") + '" stroke="#5B93C4" stroke-width="1.6"/><circle cx="' + (c[0] - 1.1) + '" cy="' + (c[1] - 1.3) + '" r="1.2" fill="#FFFFFF"/>';
        });
        o += '<path d="M60 119 L60 123" stroke="#5B93C4" stroke-width="2"/><g transform="translate(60 138)" stroke="#5B93C4" stroke-width="2.4" stroke-linecap="round" fill="none"><path d="M0 -14 V14 M-12 -7 L12 7 M-12 7 L12 -7"/><path d="M-4 -12 L0 -8 L4 -12 M-4 12 L0 8 L4 12" stroke-width="1.8"/></g><circle cx="60" cy="138" r="3.4" fill="#FFFFFF" stroke="#5B93C4" stroke-width="1.8"/>';
        return '<g transform="translate(0,' + y + ')">' + o + "</g>";
      },
    },
    {
      id: "ch-icegoggles", island: 8, unit: 38, world: "Frozen lake", slot: "face", name: "Snow goggles", cn: "雪地护目镜", vb: "4 4 116 60", a: { ey: 40, edx: 20, er: 10 },
      draw: function (a) {
        var x1 = 60 - a.edx,
          x2 = 60 + a.edx,
          r = a.er + 5.5,
          y = a.ey;
        function lens(x) {
          return '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 1.6) + '" fill="#FFFFFF" stroke="#2A66C9" stroke-width="2"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgba(140,215,255,.65)" stroke="#3C8BD6" stroke-width="2.4"/>' +
            '<path d="M' + (x - r * 0.55) + " " + (y - r * 0.2) + " Q" + (x - r * 0.35) + " " + (y - r * 0.6) + " " + (x + r * 0.05) + " " + (y - r * 0.62) + '" fill="none" stroke="#fff" stroke-width="2.2" opacity=".9"/>' +
            '<circle cx="' + (x - r - 0.6) + '" cy="' + y + '" r="1.4" fill="#FFFFFF"/><circle cx="' + (x + r + 0.6) + '" cy="' + y + '" r="1.4" fill="#FFFFFF"/>';
        }
        return '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M' + (x1 - r - 2) + " " + y + " L" + (x1 - r - 16) + " " + (y - 2) + " M" + (x2 + r + 2) + " " + y + " L" + (x2 + r + 16) + " " + (y - 2) + '" fill="none" stroke="#E5483A" stroke-width="5.4"/>' +
          '<path d="M' + (x1 + r) + " " + y + " H" + (x2 - r) + '" fill="none" stroke="#2A66C9" stroke-width="4.4"/>' + lens(x1) + lens(x2) + "</g>";
      },
    },
    {
      id: "ch-auroracrown", island: 8, unit: 39, world: "Northern lights", slot: "hat", name: "Aurora crown", cn: "极光王冠", vb: "20 -4 80 64", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<path d="M-26 -26 Q-13 -40 0 -28 T26 -30" fill="none" stroke="#7CF5C0" stroke-width="5.4" stroke-linecap="round" opacity=".9"/><path d="M-24 -20 Q-12 -32 0 -22 T24 -24" fill="none" stroke="#B58AE8" stroke-width="4" stroke-linecap="round" opacity=".85"/>' +
          '<path d="M-24 4 L-24 -14 L-14 -4 L-7 -22 L0 -6 L7 -22 L14 -4 L24 -14 L24 4Z" fill="#CFF1FF" stroke="#4F9CD6" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M-24 0 H24" stroke="#4F9CD6" stroke-width="2.2"/><circle cx="-14" cy="-3" r="2.4" fill="#B58AE8"/><circle cx="0" cy="-2" r="2.6" fill="#7CF5C0"/><circle cx="14" cy="-3" r="2.4" fill="#B58AE8"/>' +
          '<path d="M-7 -26 l1.2 2.6 l2.8 .4 l-2 2 l.5 2.8 l-2.5 -1.4 l-2.5 1.4 l.5 -2.8 l-2 -2 l2.8 -.4Z" fill="#FFFFFF"/>'
        );
      },
    },
    {
      id: "ch-penguinhat", island: 8, unit: 40, world: "Penguin cove", slot: "hat", name: "Penguin hat", cn: "企鹅帽", vb: "20 8 80 52", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<ellipse cx="-24" cy="-4" rx="5" ry="9" fill="#2F3A52" stroke="#1B2236" stroke-width="2" transform="rotate(14 -24 -4)"/><ellipse cx="24" cy="-4" rx="5" ry="9" fill="#2F3A52" stroke="#1B2236" stroke-width="2" transform="rotate(-14 24 -4)"/>' +
          '<path d="M-23 6 Q-26 -24 0 -26 Q26 -24 23 6Z" fill="#2F3A52" stroke="#1B2236" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<ellipse cx="0" cy="-8" rx="15" ry="13" fill="#FFFFFF"/><circle cx="-6" cy="-12" r="2.4" fill="#1E2A4A"/><circle cx="6" cy="-12" r="2.4" fill="#1E2A4A"/><circle cx="-5.4" cy="-12.8" r=".8" fill="#fff"/><circle cx="6.6" cy="-12.8" r=".8" fill="#fff"/>' +
          '<path d="M-5 -6 L5 -6 L0 1Z" fill="#FF9F3D" stroke="#C47A10" stroke-width="1.6" stroke-linejoin="round"/>'
        );
      },
    },

    // the monsters of the Monster battle each drop one item the first time they are beaten (rev["mon<id>"] is set)
    {
      id: "mn-jelly", monster: 1, rk: "mon1", world: "Gloop", label: "Beat Gloop", slot: "hat", name: "Jelly crown", cn: "果冻王冠", vb: "22 4 76 50", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<g transform="scale(1.2)">' +
          '<path d="M-17 5 Q-19 -19 0 -21 Q19 -19 17 5Z" fill="#6CCB5F" fill-opacity=".92" stroke="#2F7D3F" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<ellipse cx="-7" cy="-12" rx="5" ry="2.8" transform="rotate(-30 -7 -12)" fill="#FFFFFF" opacity=".6"/><circle cx="5" cy="-6" r="2.6" fill="#B7F0A8"/><circle cx="-2" cy="-2" r="1.8" fill="#B7F0A8"/><circle cx="9" cy="-12" r="1.6" fill="#B7F0A8"/>' +
          '<path d="M-10 -20 L-8 -29 L-3 -23 L0 -31 L3 -23 L8 -29 L10 -20Z" fill="#FFD23F" stroke="#B8860B" stroke-width="2" stroke-linejoin="round"/>' +
          '<circle cx="0" cy="-26" r="1.8" fill="#E5483A"/></g>'
        );
      },
    },
    {
      id: "mn-nightcap", monster: 2, rk: "mon2", world: "Boo", label: "Beat Boo", slot: "hat", name: "Night cap", cn: "睡帽", vb: "20 2 86 54", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<g transform="scale(1.15)">' +
          '<path d="M-19 5 Q-18 -20 3 -29 Q19 -33 29 -17 L24 -13 Q16 -22 8 -13 Q12 -4 19 5Z" fill="#6A48E8" stroke="#3B2A8A" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<rect x="-21" y="-3" width="42" height="10" rx="5" fill="#EDE8FF" stroke="#3B2A8A" stroke-width="2.4"/>' +
          '<circle cx="29" cy="-15" r="6" fill="#FFE066" stroke="#B8860B" stroke-width="2"/>' +
          '<path d="M-6 -12 l1.6 3.4 3.6 .4 -2.7 2.4 .8 3.6 -3.3 -1.9 -3.3 1.9 .8 -3.6 -2.7 -2.4 3.6 -.4z" fill="#FFE066"/><circle cx="6" cy="-20" r="1.6" fill="#FFE066"/><circle cx="0" cy="-23" r="1.2" fill="#FFFFFF"/></g>'
        );
      },
    },
    {
      id: "mn-visor", monster: 3, rk: "mon3", world: "Rocky", label: "Beat Rocky", slot: "face", name: "Golem visor", cn: "石头面罩", vb: "10 20 100 40", a: { ey: 40, edx: 20, er: 10 },
      draw: function (a) {
        var x1 = 60 - a.edx,
          x2 = 60 + a.edx,
          w = a.er * 2 + 9,
          h = a.er * 1.7 + 6,
          y = a.ey;
        return '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M' + (x1 - w / 2) + " " + y + " L" + (x1 - w / 2 - 12) + " " + (y - 3) + " M" + (x2 + w / 2) + " " + y + " L" + (x2 + w / 2 + 12) + " " + (y - 3) + '" fill="none" stroke="#3E4660" stroke-width="4"/>' +
          '<path d="M' + (x1 + w / 2) + " " + (y - 1) + " H" + (x2 - w / 2) + '" fill="none" stroke="#3E4660" stroke-width="4.6"/>' +
          '<rect x="' + (x1 - w / 2) + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h + '" rx="4" fill="#A9B3C9" stroke="#3E4660" stroke-width="3"/>' +
          '<rect x="' + (x2 - w / 2) + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h + '" rx="4" fill="#A9B3C9" stroke="#3E4660" stroke-width="3"/>' +
          '<rect x="' + (x1 - w / 2 + 3.5) + '" y="' + (y - h / 2 + 3.5) + '" width="' + (w - 7) + '" height="' + (h - 7) + '" rx="2" fill="#FFE066" opacity=".95"/>' +
          '<rect x="' + (x2 - w / 2 + 3.5) + '" y="' + (y - h / 2 + 3.5) + '" width="' + (w - 7) + '" height="' + (h - 7) + '" rx="2" fill="#FFE066" opacity=".95"/>' +
          '<path d="M' + (x1 - w / 2 + 6) + " " + (y - 1) + " h5 M" + (x2 - w / 2 + 6) + " " + (y - 1) + 'h5" stroke="#fff" stroke-width="2.2" opacity=".8"/></g>';
      },
    },
    {
      id: "mn-horns", monster: 4, rk: "mon4", world: "Blaze", label: "Beat Blaze", slot: "hat", name: "Imp horns", cn: "小恶魔角", vb: "18 8 84 46", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<g transform="scale(1.15)">' +
          '<path d="M-26 5 Q0 -9 26 5" fill="none" stroke="#7A1B14" stroke-width="5.4" stroke-linecap="round"/>' +
          '<path d="M-24 2 Q-34 -12 -26 -26 Q-14 -18 -14 -2Z" fill="#E5483A" stroke="#7A1B14" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M24 2 Q34 -12 26 -26 Q14 -18 14 -2Z" fill="#E5483A" stroke="#7A1B14" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M-26 -12 Q-24 -18 -22 -20" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".6" fill="none"/>' +
          '<path d="M-6 -4 Q-9 -14 -2 -20 Q-1 -12 3 -10 Q6 -16 8 -22 Q12 -12 6 -4Z" fill="#FFB020" stroke="#B3261E" stroke-width="2" stroke-linejoin="round"/></g>'
        );
      },
    },
    {
      id: "mn-fang", monster: 5, rk: "mon5", world: "Drako", label: "Beat Drako", slot: "neck", name: "Dragon fang necklace", cn: "龙牙项链", vb: "20 92 80 54", a: { ny: 104 },
      draw: function (a) {
        var y = a.ny - 104,
          o = '<path d="M28 100 Q60 130 92 100" fill="none" stroke="#B8860B" stroke-width="5.4" stroke-linecap="round"/><path d="M28 100 Q60 130 92 100" fill="none" stroke="#FFD23F" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 6"/>';
        o += '<path d="M60 117 Q50 120 52 130 Q56 142 60 148 Q64 142 68 130 Q70 120 60 117Z" fill="#FFF3D6" stroke="#7A5A2B" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M57 124 Q55 132 58 140" fill="none" stroke="#E8D3A8" stroke-width="2" stroke-linecap="round"/>' +
          '<circle cx="60" cy="115" r="5.4" fill="#8B6BE8" stroke="#3B2A8A" stroke-width="2.2"/><circle cx="58.6" cy="113.6" r="1.6" fill="#FFFFFF"/>';
        return '<g transform="translate(0,' + y + ')">' + o + "</g>";
      },
    },

    // each stage's challenge gives one item the first time the challenge is finished (rev["chal<challenge>"] is set)
    {
      id: "cc-bubble", challenge: "spell", rk: "chalspell", world: "Bubble spell", label: "Finish the Bubble spell", slot: "hat", name: "Bubble crown", cn: "泡泡王冠", vb: "20 2 80 52", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<g transform="scale(1.2)">' +
          '<path d="M-19 6 Q0 -2 19 6" fill="none" stroke="#6AA7FF" stroke-width="4" stroke-linecap="round"/>' +
          '<circle cx="-14" cy="-5" r="7" fill="#BFE7FF" fill-opacity=".85" stroke="#3D8BF2" stroke-width="2"/>' +
          '<circle cx="0" cy="-13" r="9" fill="#FFD1EA" fill-opacity=".85" stroke="#E86AA6" stroke-width="2"/>' +
          '<circle cx="14" cy="-5" r="7" fill="#D9F5C8" fill-opacity=".85" stroke="#5CC27A" stroke-width="2"/>' +
          '<ellipse cx="-16" cy="-8" rx="2.2" ry="1.2" fill="#fff" opacity=".8"/><ellipse cx="-3" cy="-17" rx="2.8" ry="1.5" fill="#fff" opacity=".8"/><ellipse cx="12" cy="-8" rx="2.2" ry="1.2" fill="#fff" opacity=".8"/></g>'
        );
      },
    },
    {
      id: "cc-knight", challenge: "siege", rk: "chalsiege", world: "Castle siege", label: "Bring a castle down", slot: "hat", name: "Knight helmet", cn: "骑士头盔", vb: "20 -2 82 56", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<g transform="scale(1.2)">' +
          '<path d="M-18 6 Q-19 -22 0 -24 Q19 -22 18 6Z" fill="#C5CEDB" stroke="#6B7A90" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<rect x="-16" y="-9" width="32" height="6" rx="3" fill="#2B3A55"/>' +
          '<path d="M0 -24 Q8 -38 22 -31 Q15 -28 9 -22Z" fill="#E5483A" stroke="#A82A20" stroke-width="1.6" stroke-linejoin="round"/>' +
          '<ellipse cx="-8" cy="-16" rx="4" ry="2" transform="rotate(-30 -8 -16)" fill="#fff" opacity=".6"/></g>'
        );
      },
    },
    {
      id: "cc-astro", challenge: "space", rk: "chalspace", world: "Space shooter", label: "Finish the Space shooter", slot: "hat", name: "Astronaut helmet", cn: "宇航员头盔", vb: "18 -4 84 58", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<g transform="scale(1.2)">' +
          '<path d="M-20 6 Q-22 -26 0 -28 Q22 -26 20 6Z" fill="#E8F3FF" fill-opacity=".88" stroke="#8795B4" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M-16 -6 Q0 -20 16 -6" fill="none" stroke="#6AA7FF" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M-3 -20 l1.4 3 3.2 .3 -2.4 2.2 .7 3.2 -2.9 -1.7 -2.9 1.7 .7 -3.2 -2.4 -2.2 3.2 -.3z" fill="#FFD23F" stroke="#E0A800" stroke-width=".8"/>' +
          '<path d="M12 -24 L18 -34" stroke="#8795B4" stroke-width="2.4" stroke-linecap="round"/><circle cx="18.5" cy="-35" r="2.8" fill="#E5483A"/></g>'
        );
      },
    },
    {
      id: "cc-torch", challenge: "dungeon", rk: "chaldungeon", world: "Word dungeon", label: "Finish the Word dungeon", slot: "hat", name: "Explorer cap", cn: "探险帽", vb: "18 4 86 50", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<g transform="scale(1.2)">' +
          '<path d="M-19 5 Q-19 -18 0 -19 Q19 -18 19 5Z" fill="#A9732F" stroke="#5E3A18" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M-22 5 H22" stroke="#5E3A18" stroke-width="4" stroke-linecap="round"/>' +
          '<path d="M6 -10 L26 -17 L26 -3Z" fill="#FFF3A8" fill-opacity=".75"/>' +
          '<circle cx="0" cy="-10" r="6" fill="#FFE066" stroke="#B8860B" stroke-width="2"/><circle cx="-1.5" cy="-11.5" r="2" fill="#fff" opacity=".8"/></g>'
        );
      },
    },
    {
      id: "cc-snorkel", challenge: "deep", rk: "chaldeep", world: "Deep sea treasure", label: "Finish the Deep sea treasure", slot: "face", name: "Snorkel mask", cn: "潜水镜", vb: "6 2 118 58", a: { ey: 40, edx: 20, er: 10 },
      draw: function (a) {
        var x1 = 60 - a.edx,
          x2 = 60 + a.edx,
          r = a.er + 5.5,
          y = a.ey;
        return '<g stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M' + (x1 - r) + " " + y + " L" + (x1 - r - 14) + " " + (y - 2) + " M" + (x2 + r) + " " + y + " L" + (x2 + r + 14) + " " + (y - 2) + '" fill="none" stroke="#1FA8A0" stroke-width="4.6"/>' +
          '<path d="M' + (x1 + r) + " " + y + " H" + (x2 - r) + '" fill="none" stroke="#1FA8A0" stroke-width="4.4"/>' +
          '<circle cx="' + x1 + '" cy="' + y + '" r="' + r + '" fill="rgba(160,230,235,.55)" stroke="#1FA8A0" stroke-width="3.6"/>' +
          '<circle cx="' + x2 + '" cy="' + y + '" r="' + r + '" fill="rgba(160,230,235,.55)" stroke="#1FA8A0" stroke-width="3.6"/>' +
          '<path d="M' + (x2 + r + 12) + " " + (y - 2) + " L" + (x2 + r + 16) + " " + (y - 26) + " Q" + (x2 + r + 16) + " " + (y - 30) + " " + (x2 + r + 11) + " " + (y - 30) + '" fill="none" stroke="#FF8A3D" stroke-width="5"/>' +
          "</g>";
      },
    },
    {
      id: "cc-pharaoh", challenge: "pyramid", rk: "chalpyramid", world: "Pyramid code", label: "Finish the Pyramid code", slot: "hat", name: "Pharaoh headdress", cn: "法老头饰", vb: "20 4 80 50", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<g transform="scale(1.2)">' +
          '<path d="M-19 5 Q-19 -20 0 -21 Q19 -20 19 5Z" fill="#F4C04A" stroke="#B8862B" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M-13 -15 H13 M-16 -8 H16 M-18 -2 H18" stroke="#3D8BF2" stroke-width="3"/>' +
          '<rect x="-20" y="-4" width="40" height="8" rx="3" fill="#FFD23F" stroke="#B8862B" stroke-width="2"/>' +
          '<path d="M0 -3 Q-5 -12 0 -19 Q5 -12 0 -3Z" fill="#35B779" stroke="#1F6A3A" stroke-width="1.6"/><circle cx="0" cy="0" r="2.6" fill="#E5483A"/></g>'
        );
      },
    },
    {
      id: "cc-beanie", challenge: "sled", rk: "chalsled", world: "Sled race", label: "Finish the Sled race", slot: "hat", name: "Pom-pom beanie", cn: "毛线帽", vb: "20 -4 80 58", a: { hx: 60, hy: 46, hs: 1 },
      draw: function (a, G) {
        return G(a,
          '<g transform="scale(1.2)">' +
          '<path d="M-19 4 Q-19 -20 0 -22 Q19 -20 19 4Z" fill="#E5483A" stroke="#A82A20" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M-17 -9 Q0 -15 17 -9 M-18 -3 Q0 -9 18 -3" stroke="#fff" stroke-width="3" fill="none"/>' +
          '<rect x="-21" y="1" width="42" height="9" rx="4.5" fill="#FFFFFF" stroke="#A82A20" stroke-width="2.4"/>' +
          '<circle cx="0" cy="-27" r="6.4" fill="#fff" stroke="#C9D7E8" stroke-width="2"/></g>'
        );
      },
    },
  ];

  var BY_ID = {};
  LIST.forEach(function (p) {
    BY_ID[p.id] = p;
  });

  function key(island, unit) {
    return "chest" + island + "-" + unit;
  }
  function readRev() {
    try {
      var s = JSON.parse(root.localStorage.getItem(STORE));
      return s && s.rev && typeof s.rev === "object" ? s.rev : {};
    } catch (e) {
      return {};
    }
  }
  // won = the chest of the prize's unit has been opened (rev is lef_words_v1.rev)
  function wonIn(rev, id) {
    var p = BY_ID[id];
    return !!p && !!rev && !!rev[p.rk || key(p.island, p.unit)];
  }
  function unlocked(id) {
    return wonIn(readRev(), id);
  }
  function forUnit(island, unit) {
    for (var i = 0; i < LIST.length; i++) if (LIST[i].island === island && LIST[i].unit === unit) return LIST[i];
    return null;
  }
  // the prize a monster drops the first time it is beaten
  function forMonster(id) {
    for (var i = 0; i < LIST.length; i++) if (LIST[i].monster === id) return LIST[i];
    return null;
  }
  // the prize a stage's challenge gives the first time it is finished
  function forChallenge(id) {
    for (var i = 0; i < LIST.length; i++) if (LIST[i].challenge === id) return LIST[i];
    return null;
  }
  function thumb(id) {
    var it = root.ITEMS && root.ITEMS[id];
    if (!it || !it.draw) return "";
    var inner = it.draw(it.a);
    return '<svg viewBox="' + it.vb + '" aria-hidden="true">' + (typeof root.softSvg === "function" ? root.softSvg(inner) : inner) + "</svg>";
  }
  // registered in ITEMS (once pet-art.js has made PetKit and ITEMS), like the badge rewards
  function register() {
    var K = root.PetKit;
    if (!K || !root.ITEMS || !K.G) return false;
    LIST.forEach(function (p) {
      root.ITEMS[p.id] = {
        id: p.id, slot: p.slot, name: p.name, cn: p.cn, vb: p.vb, a: p.a, price: 0, prize: true,
        draw: function (a) {
          return p.draw(a, K.G);
        },
      };
    });
    return true;
  }
  register();

  root.SWPrizes = {
    STARS: STARS,
    key: key,
    forUnit: forUnit,
    forMonster: forMonster,
    forChallenge: forChallenge,
    unlocked: unlocked,
    wonIn: wonIn,
    isPrize: function (id) {
      return !!BY_ID[id];
    },
    get: function (id) {
      return BY_ID[id] || null;
    },
    ids: function () {
      return LIST.map(function (p) {
        return p.id;
      });
    },
    thumb: thumb,
    register: register,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = root.SWPrizes;
})(typeof window !== "undefined" ? window : this);

