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

  // one prize per unit of island 1 (the mountain): island, unit, the world it belongs to, the item
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
