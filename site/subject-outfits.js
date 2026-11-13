/* Reading outfits: while a child reads a book, their pet dresses up for the subject (lab goggles for science, a wizard hat for stories ...).
   An outfit is unlocked once the child has finished one book of that subject. It is only worn in the reader and in the "book finished" screen,
   it never replaces what the child chose in the wardrobe at home, and nothing is stored: unlocked = a finished book of that subject exists.
   The items use the same anchors as the shop's hats and glasses (PetKit.ITEMS), so they fit all 8 pets.
   Written for old Android WebViews: no optional chaining, no spread, no let/const needed.
   中文说明：孩子读某个学科的书时，宠物会换上对应的装扮（科学是护目镜，故事是巫师帽）。读完该学科的第一本书后解锁，只在阅读时穿，不影响衣柜里的搭配。 */
(function (root) {
  "use strict";

  var OUTFITS = [
    { subject: "Science", id: "so-goggles", slot: "face", name: "Lab goggles", cn: "实验护目镜", vb: "14 20 92 44", a: { ey: 40, edx: 20, er: 10 } },
    { subject: "Fiction", id: "so-wizard", slot: "hat", name: "Story wizard hat", cn: "故事巫师帽", vb: "20 -6 80 60", a: { hx: 60, hy: 46, hs: 1 } },
    { subject: "Math", id: "so-mathcap", slot: "hat", name: "Math cap", cn: "数学帽", vb: "20 6 90 50", a: { hx: 60, hy: 46, hs: 1 } },
    { subject: "SEL", id: "so-heart", slot: "hat", name: "Heart headband", cn: "爱心发箍", vb: "20 0 80 56", a: { hx: 60, hy: 46, hs: 1 } },
    { subject: "Social Studies", id: "so-explorer", slot: "hat", name: "Explorer helmet", cn: "探险帽", vb: "16 8 88 48", a: { hx: 60, hy: 46, hs: 1 } },
    { subject: "Computer Science", id: "so-pixel", slot: "face", name: "Pixel glasses", cn: "像素眼镜", vb: "14 20 92 44", a: { ey: 40, edx: 20, er: 10 } },
  ];

  function sparkle(x, y, s, fill) {
    return '<path transform="translate(' + x + ',' + y + ') scale(' + s + ')" d="M0 -4L1.4 -1.4L4 0L1.4 1.4L0 4L-1.4 1.4L-4 0L-1.4 -1.4Z" fill="' + fill + '"/>';
  }
  var DRAW = {
    "so-goggles": function (a) {
      var x1 = 60 - a.edx,
        x2 = 60 + a.edx,
        r = a.er + 4,
        y = a.ey;
      return (
        '<g stroke-linejoin="round" stroke-linecap="round">' +
        '<path d="M' + (x1 - r) + " " + y + "H" + (x1 - r - 12) + "M" + (x2 + r) + " " + y + "H" + (x2 + r + 12) + '" stroke="#2F4F6B" stroke-width="6" fill="none"/>' +
        '<rect x="' + (60 - 5) + '" y="' + (y - 3) + '" width="10" height="6" rx="3" fill="#2F8FB0" stroke="#1B5A75" stroke-width="2"/>' +
        '<circle cx="' + x1 + '" cy="' + y + '" r="' + r + '" fill="rgba(140,225,255,.5)" stroke="#1F7F9B" stroke-width="4"/>' +
        '<circle cx="' + x2 + '" cy="' + y + '" r="' + r + '" fill="rgba(140,225,255,.5)" stroke="#1F7F9B" stroke-width="4"/>' +
        '<path d="M' + (x1 - r * 0.5) + " " + (y - r * 0.2) + "Q" + (x1 - r * 0.35) + " " + (y - r * 0.6) + " " + (x1 + r * 0.05) + " " + (y - r * 0.62) + "M" + (x2 - r * 0.5) + " " + (y - r * 0.2) + "Q" + (x2 - r * 0.35) + " " + (y - r * 0.6) + " " + (x2 + r * 0.05) + " " + (y - r * 0.62) + '" stroke="#fff" stroke-width="2.4" fill="none" opacity=".85"/>' +
        "</g>"
      );
    },
    "so-wizard": function (a) {
      return G(
        a,
        '<path d="M-16 2L-3 -34Q2 -46 13 -39L17 2Z" fill="#7B4FD6" stroke="#3E2490" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M-15 -6Q0 -1 16 -6L17 2Q0 7 -16 2Z" fill="#FFC93C" stroke="#B26A00" stroke-width="2" stroke-linejoin="round"/>' +
          '<ellipse cx="0" cy="3" rx="23" ry="5.5" fill="#6A3FC4" stroke="#3E2490" stroke-width="3"/>' +
          sparkle(-5, -18, 1.5, "#FFE066") + sparkle(6, -26, 1.1, "#FFE066") + sparkle(8, -12, 0.9, "#fff")
      );
    },
    "so-mathcap": function (a) {
      return G(
        a,
        '<path d="M-17 2Q-17 -20 0 -20Q17 -20 17 2Z" fill="#34C28A" stroke="#1F7F50" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M10 1Q27 -2 29 5Q18 8 8 5Z" fill="#25A06D" stroke="#1F7F50" stroke-width="3" stroke-linejoin="round"/>' +
          '<circle cx="0" cy="-9" r="7.4" fill="#fff" stroke="#1F7F50" stroke-width="2"/>' +
          '<path d="M-4 -9H4M0 -13V-5" stroke="#1F7F50" stroke-width="2.6" stroke-linecap="round"/>' +
          '<circle cx="0" cy="-21" r="2.8" fill="#FFC93C" stroke="#B26A00" stroke-width="2"/>'
      );
    },
    "so-heart": function (a) {
      var heart = "M0 5C-10 -2 -8 -10 0 -6C8 -10 10 -2 0 5Z";
      return G(
        a,
        '<path d="M-17 1Q0 -13 17 1" fill="none" stroke="#FF7AA8" stroke-width="4.5" stroke-linecap="round"/>' +
          '<path d="M-10 -6L-14 -19M10 -6L14 -19" stroke="#FF7AA8" stroke-width="3" stroke-linecap="round" fill="none"/>' +
          '<path transform="translate(-14,-24) scale(1.05)" d="' + heart + '" fill="#FF4F86" stroke="#B02A5A" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path transform="translate(14,-24) scale(1.05)" d="' + heart + '" fill="#FF4F86" stroke="#B02A5A" stroke-width="2.4" stroke-linejoin="round"/>' +
          sparkle(-17, -28, 0.8, "#fff") + sparkle(11, -28, 0.8, "#fff")
      );
    },
    "so-explorer": function (a) {
      return G(
        a,
        '<path d="M-17 2Q-17 -24 0 -24Q17 -24 17 2Z" fill="#E3C08A" stroke="#8A6430" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M-17 -4Q0 1 17 -4L17 1Q0 6 -17 1Z" fill="#8A5A2B" stroke="#5C3A18" stroke-width="2" stroke-linejoin="round"/>' +
          '<ellipse cx="0" cy="3" rx="25" ry="5.5" fill="#D4A964" stroke="#8A6430" stroke-width="3"/>' +
          '<circle cx="0" cy="-25" r="2.8" fill="#8A6430"/>' +
          '<path d="M-6 -17Q0 -21 6 -17" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>'
      );
    },
    "so-pixel": function (a) {
      var x1 = 60 - a.edx,
        x2 = 60 + a.edx,
        w = (a.er + 4) * 2,
        h = w * 0.78,
        y = a.ey,
        px = function (cx, dx, dy) {
          return '<rect x="' + (cx + dx) + '" y="' + (y + dy) + '" width="3.4" height="3.4" fill="#3DFFB0"/>';
        };
      return (
        '<g stroke-linejoin="round">' +
        '<path d="M' + (x1 - w / 2) + " " + y + "H" + (x1 - w / 2 - 9) + "M" + (x2 + w / 2) + " " + y + "H" + (x2 + w / 2 + 9) + '" stroke="#0B1530" stroke-width="3.4" fill="none"/>' +
        '<rect x="' + (x1 - w / 2) + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h + '" rx="2.5" fill="#1E2A4A" stroke="#0B1530" stroke-width="3"/>' +
        '<rect x="' + (x2 - w / 2) + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h + '" rx="2.5" fill="#1E2A4A" stroke="#0B1530" stroke-width="3"/>' +
        '<path d="M' + (x1 + w / 2) + " " + y + "H" + (x2 - w / 2) + '" stroke="#0B1530" stroke-width="3.4"/>' +
        px(x1, -5, -3.5) + px(x1, 0, 1) + px(x1, 5, -3.5) + px(x2, -5, -3.5) + px(x2, 0, 1) + px(x2, 5, -3.5) +
        "</g>"
      );
    },
  };
  var G = function (a, inner) {
    return '<g transform="translate(' + a.hx + "," + a.hy + ") scale(" + a.hs + ')">' + inner + "</g>";
  };

  function byId(id) {
    var i;
    for (i = 0; i < OUTFITS.length; i++) if (OUTFITS[i].id === id) return OUTFITS[i];
    return null;
  }
  function forSubject(subject) {
    var i;
    for (i = 0; i < OUTFITS.length; i++) if (OUTFITS[i].subject === subject) return OUTFITS[i];
    return null;
  }
  // the outfit's slot replaces what is in that slot of the child's own wardrobe; nothing is saved
  function eqWith(eq, subject) {
    var o = forSubject(subject),
      out = {},
      k;
    for (k in eq || {}) out[k] = eq[k];
    if (o) out[o.slot] = o.id;
    return out;
  }
  // finished: function(subject) -> true when the child finished a book of it
  function unlocked(subject, finished) {
    return !!forSubject(subject) && !!finished(subject);
  }

  function register() {
    var K = root.PetKit;
    if (!K || !root.ITEMS) return false;
    G = K.G || G;
    OUTFITS.forEach(function (o) {
      root.ITEMS[o.id] = { slot: o.slot, name: o.name, cn: o.cn, vb: o.vb, a: o.a, reading: true, draw: DRAW[o.id] };
    });
    return true;
  }

  var api = { OUTFITS: OUTFITS, forSubject: forSubject, byId: byId, eqWith: eqWith, unlocked: unlocked, register: register, _draw: DRAW };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.SubjectOutfits = api;
  if (typeof document !== "undefined") register();
})(typeof window !== "undefined" ? window : this);
