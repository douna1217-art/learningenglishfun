/* Treasure-chest prizes for the sight-word units: each unit of an island has a chest; opening it the first time gives 5 stars and one pet item
   that cannot be bought. The items are drawn here in the same way as the badge rewards (see badges.js) and registered in ITEMS, so the pet
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

  // one prize per unit: island 1 (the mountain, units 1-5) and island 2 (the beach, units 6-10); each has the island, the unit, the world it belongs to, the item
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
    return !!p && !!rev && !!rev[key(p.island, p.unit)];
  }
  function unlocked(id) {
    return wonIn(readRev(), id);
  }
  function forUnit(island, unit) {
    for (var i = 0; i < LIST.length; i++) if (LIST[i].island === island && LIST[i].unit === unit) return LIST[i];
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
