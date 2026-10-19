/* Scenery for the sight-words pages (sample): the meadow behind today's words, the three game pictures, the word islands, the album book.
   Drawn in code in the same soft look as the pets (flat shapes that softSvg from pet-art.js shades), so there are no picture files.
   SWScenery.hero() / .game("memory"|"balloon"|"feed") / .islands(o) / .book() / .star() return <svg> strings.
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";

  function soft(inner) {
    return typeof root.softSvg === "function" ? root.softSvg(inner) : inner;
  }
  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // the sky, sun, clouds, two hills and flowers behind the pet (the bottom is always kept, the top may be cropped)
  function hero() {
    return '<svg viewBox="0 0 360 340" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      '<rect width="360" height="340" fill="#BFE6FF"/>' +
      '<circle cx="318" cy="46" r="40" fill="#FFF1A8"/><circle cx="318" cy="46" r="28" fill="#FFD23F"/>' +
      '<g class="sw-cl sw-cl1" fill="#FFFFFF"><ellipse cx="60" cy="74" rx="34" ry="12"/><ellipse cx="84" cy="64" rx="20" ry="13"/></g>' +
      '<g class="sw-cl sw-cl2" fill="#FFFFFF"><ellipse cx="232" cy="34" rx="28" ry="10"/><ellipse cx="250" cy="26" rx="16" ry="11"/></g>' +
      '<path d="M0 236 Q95 198 190 230 T360 216 L360 340 L0 340Z" fill="#9ADF8A"/>' +
      '<path d="M0 288 Q130 254 250 284 T360 274 L360 340 L0 340Z" fill="#7FCF74"/>' +
      '<circle cx="26" cy="300" r="5" fill="#FF8FB1"/><circle cx="38" cy="306" r="4" fill="#FFFFFF"/><circle cx="330" cy="288" r="5" fill="#FFFFFF"/>' +
      '<circle cx="343" cy="294" r="4" fill="#FFC93C"/><circle cx="321" cy="300" r="4" fill="#FF8FB1"/><circle cx="296" cy="236" r="4" fill="#FFFFFF"/><circle cx="60" cy="246" r="4" fill="#FFC93C"/>' +
      "</svg>";
  }

  // one letter bubble for the Bubble spell tile
  function bub(cx, cy, r, c, ch) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + c + '"/><ellipse cx="' + (cx - r * 0.38) + '" cy="' + (cy - r * 0.42) + '" rx="' + r * 0.26 + '" ry="' + r * 0.16 + '" transform="rotate(-35 ' + (cx - r * 0.38) + " " + (cy - r * 0.42) + ')" fill="#FFFFFF" opacity=".75"/>' +
      '<text x="' + cx + '" y="' + (cy + r * 0.36) + '" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="' + r * 1.1 + '" fill="#FFFFFF">' + ch + "</text>";
  }

  // the picture on each game tile (100 x 84)
  function game(kind) {
    var inner = "";
    if (kind === "memory") {
      inner = '<g transform="rotate(-10 34 44)"><rect x="14" y="14" width="40" height="54" rx="8" fill="#6A48E8"/><path d="M26 34 q0 -9 8 -9 q8 0 8 8 q0 5 -6 8 v3" fill="none" stroke="#FFE066" stroke-width="4.5" stroke-linecap="round"/><circle cx="36" cy="58" r="2.8" fill="#FFE066"/></g>' +
        '<g transform="rotate(9 68 46)"><rect x="48" y="18" width="40" height="54" rx="8" fill="#FFFFFF" stroke="#C9D7E8" stroke-width="2.5"/><circle cx="68" cy="38" r="9" fill="#FFD23F"/><path d="M50 66 Q68 50 86 66 L86 70 Q68 74 50 70Z" fill="#8FD07F"/></g>';
    } else if (kind === "balloon") {
      inner = '<path d="M26 52 Q22 66 30 76 M50 46 Q52 64 46 78 M74 58 Q78 70 68 78" fill="none" stroke="#8795B4" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M26 8 C10 8 6 26 10 38 C14 48 22 52 26 52 C30 52 38 48 42 38 C46 26 42 8 26 8Z" fill="#E5483A"/><path d="M22 52 L26 47 L30 52Z" fill="#E5483A"/>' +
        '<path d="M52 4 C36 4 32 22 36 34 C40 44 48 48 52 48 C56 48 64 44 68 34 C72 22 68 4 52 4Z" fill="#FFC93C"/><path d="M48 48 L52 43 L56 48Z" fill="#FFC93C"/>' +
        '<path d="M76 18 C62 18 58 34 62 44 C65 52 72 56 76 56 C80 56 87 52 90 44 C94 34 90 18 76 18Z" fill="#3D8BF2"/><path d="M72 56 L76 51 L80 56Z" fill="#3D8BF2"/>' +
        '<ellipse cx="19" cy="22" rx="3.5" ry="8" fill="#FFFFFF" opacity=".5"/><ellipse cx="45" cy="18" rx="3.5" ry="8" fill="#FFFFFF" opacity=".5"/><ellipse cx="69" cy="32" rx="3" ry="7" fill="#FFFFFF" opacity=".5"/>';
    } else if (kind === "spell") {
      inner = bub(26, 50, 19, "#FF8FB1", "A") + bub(56, 30, 21, "#6AA7FF", "B") + bub(78, 58, 17, "#FFC93C", "C") +
        '<path d="M86 14 l2.4 5 5.6 .7 -4.1 3.8 1 5.5 -4.9 -2.7 -4.9 2.7 1 -5.5 -4.1 -3.8 5.6 -.7z" fill="#FFE066"/>';
    } else {
      inner = '<path d="M50 24 C41 12 28 22 36 32 L50 46 L64 32 C72 22 59 12 50 24Z" fill="#FF6B8A"/>' +
        '<ellipse cx="46" cy="58" rx="16" ry="8" fill="#35B2B7"/><polygon points="60,58 74,49 74,67" fill="#35B2B7"/><circle cx="37" cy="56" r="2.4" fill="#1E2A4A"/>' +
        '<path d="M14 62 L86 62 Q86 82 50 82 Q14 82 14 62Z" fill="#FF8A3D"/><ellipse cx="50" cy="62" rx="36" ry="7" fill="#FFB070"/>';
    }
    return '<svg viewBox="0 0 100 84" aria-hidden="true">' + soft(inner) + "</svg>";
  }

  /* ---- small drawing helpers (flat shapes; softSvg shades them afterwards) ---- */
  function sunAt(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + Math.round(r * 1.5) + '" fill="#FFF1A8"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#FFD23F"/>';
  }
  function cloudAt(x, y, k) {
    return '<g fill="#FFFFFF"><ellipse cx="' + x + '" cy="' + y + '" rx="' + 28 * k + '" ry="' + 9 * k + '"/><ellipse cx="' + (x + 16 * k) + '" cy="' + (y - 7 * k) + '" rx="' + 15 * k + '" ry="' + 10 * k + '"/></g>';
  }
  function mount(cx, base, w, h, c, snow) {
    var o = '<path d="M' + (cx - w / 2) + " " + base + " L" + cx + " " + (base - h) + " L" + (cx + w / 2) + " " + base + 'Z" fill="' + c + '"/>';
    if (snow) {
      var sh = h * 0.32;
      o += '<path d="M' + cx + " " + (base - h) + " L" + (cx - w * 0.16) + " " + (base - h + sh) + " L" + (cx - w * 0.06) + " " + (base - h + sh * 0.78) + " L" + cx + " " + (base - h + sh * 1.05) + " L" + (cx + w * 0.07) + " " + (base - h + sh * 0.78) + " L" + (cx + w * 0.16) + " " + (base - h + sh) + 'Z" fill="#FFFFFF"/>';
    }
    return o;
  }
  function pineAt(x, base, h, c1, c2) {
    var w = h * 0.4;
    return '<rect x="' + (x - 2) + '" y="' + (base - h * 0.16) + '" width="4" height="' + h * 0.18 + '" fill="#8A5A2B"/><polygon points="' + (x - w) + "," + (base - h * 0.1) + " " + x + "," + (base - h * 0.68) + " " + (x + w) + "," + (base - h * 0.1) + '" fill="' + c1 + '"/>' +
      '<polygon points="' + (x - w * 0.78) + "," + (base - h * 0.42) + " " + x + "," + (base - h) + " " + (x + w * 0.78) + "," + (base - h * 0.42) + '" fill="' + (c2 || c1) + '"/>';
  }
  function palmAt(x, base, h, c1, c2) {
    var tx = x + 8,
      ty = base - h,
      o = '<path d="M' + x + " " + base + " Q" + (x + 12) + " " + (base - h * 0.5) + " " + tx + " " + ty + '" fill="none" stroke="#9A6A3A" stroke-width="5" stroke-linecap="round"/>';
    [[-26, -6, -20], [-14, -18, -8], [4, -22, 8], [20, -14, 22], [28, 2, 30]].forEach(function (l, i) {
      o += '<path d="M' + tx + " " + ty + " Q" + (tx + l[0] * 0.6) + " " + (ty + l[1] - 6) + " " + (tx + l[0]) + " " + (ty + l[1] + 14) + " Q" + (tx + l[0] * 0.5) + " " + (ty + l[1] + 2) + " " + tx + " " + ty + 'Z" fill="' + (i % 2 ? c2 || c1 : c1) + '"/>';
    });
    return o + '<circle cx="' + (tx - 3) + '" cy="' + (ty + 5) + '" r="3.4" fill="#8A5A2B"/><circle cx="' + (tx + 4) + '" cy="' + (ty + 6) + '" r="3.4" fill="#8A5A2B"/>';
  }
  function sail(x, y, k, hull) {
    return '<path d="M' + (x - 20 * k) + " " + y + " h" + 40 * k + " l" + -7 * k + " " + 9 * k + " h" + -26 * k + 'z" fill="' + (hull || "#E5483A") + '"/><line x1="' + x + '" y1="' + (y - 30 * k) + '" x2="' + x + '" y2="' + y + '" stroke="#6B4A2B" stroke-width="' + 2.5 * k + '"/>' +
      '<polygon points="' + (x + 2 * k) + "," + (y - 28 * k) + " " + (x + 2 * k) + "," + (y - 2 * k) + " " + (x + 22 * k) + "," + (y - 2 * k) + '" fill="#FFFFFF"/><polygon points="' + (x - 2 * k) + "," + (y - 24 * k) + " " + (x - 2 * k) + "," + (y - 2 * k) + " " + (x - 16 * k) + "," + (y - 2 * k) + '" fill="#FFF1C2"/>';
  }
  function twinkle(x, y, r, c) {
    return '<path d="M' + x + " " + (y - r) + " L" + (x + r * 0.3) + " " + (y - r * 0.3) + " L" + (x + r) + " " + y + " L" + (x + r * 0.3) + " " + (y + r * 0.3) + " L" + x + " " + (y + r) + " L" + (x - r * 0.3) + " " + (y + r * 0.3) + " L" + (x - r) + " " + y + " L" + (x - r * 0.3) + " " + (y - r * 0.3) + 'Z" fill="' + c + '"/>';
  }
  function dots(list, r, c) {
    var o = "";
    list.forEach(function (p) {
      o += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (p[2] || r) + '" fill="' + (p[3] || c) + '"/>';
    });
    return o;
  }
  function rocket(x, y, k, rot) {
    return '<g transform="translate(' + x + " " + y + ") rotate(" + (rot || 0) + ") scale(" + k + ')"><path d="M0 -34 Q14 -14 12 14 L-12 14 Q-14 -14 0 -34Z" fill="#FFFFFF"/><path d="M0 -34 Q7 -26 10 -16 L-10 -16 Q-7 -26 0 -34Z" fill="#E5483A"/><circle cx="0" cy="-3" r="6" fill="#3D8BF2"/>' +
      '<polygon points="-12,4 -22,22 -12,14" fill="#E5483A"/><polygon points="12,4 22,22 12,14" fill="#E5483A"/><polygon points="-6,14 0,34 6,14" fill="#FFA94D"/></g>';
  }
  // the jungle: a tree with a round crown, a hanging vine, a big leaf, a monkey and a parrot
  function jtree(x, base, h, c1, c2) {
    return '<rect x="' + (x - h * 0.05) + '" y="' + (base - h * 0.62) + '" width="' + h * 0.1 + '" height="' + h * 0.64 + '" fill="#8A5A2B"/><circle cx="' + (x - h * 0.2) + '" cy="' + (base - h * 0.66) + '" r="' + h * 0.26 + '" fill="' + c1 + '"/><circle cx="' + (x + h * 0.22) + '" cy="' + (base - h * 0.62) + '" r="' + h * 0.24 + '" fill="' + c1 + '"/><circle cx="' + x + '" cy="' + (base - h * 0.82) + '" r="' + h * 0.28 + '" fill="' + (c2 || c1) + '"/>';
  }
  function vineAt(x, y, len, c) {
    var o = '<path d="M' + x + " " + y + " q8 " + len * 0.35 + " -2 " + len * 0.6 + " t4 " + len * 0.4 + '" fill="none" stroke="' + (c || "#2F8A4C") + '" stroke-width="3.4" stroke-linecap="round"/>';
    return o + '<ellipse cx="' + (x + 5) + '" cy="' + (y + len * 0.5) + '" rx="6" ry="3.4" transform="rotate(30 ' + (x + 5) + " " + (y + len * 0.5) + ')" fill="#6CCB5F"/><ellipse cx="' + (x - 3) + '" cy="' + (y + len * 0.85) + '" rx="6" ry="3.4" transform="rotate(-30 ' + (x - 3) + " " + (y + len * 0.85) + ')" fill="#4FB36B"/>';
  }
  function leafAt(x, y, k, rot, c1, c2) {
    return '<g transform="translate(' + x + " " + y + ") rotate(" + (rot || 0) + ") scale(" + k + ')"><path d="M0 0 Q-16 -20 0 -46 Q16 -20 0 0Z" fill="' + (c1 || "#4FB36B") + '"/><path d="M0 0 L0 -40" stroke="' + (c2 || "#2F8A4C") + '" stroke-width="2.4"/></g>';
  }
  function monkeyAt(x, y, k) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + k + ')"><path d="M10 6 Q30 4 28 -14 Q26 -24 18 -22" fill="none" stroke="#8A5A2B" stroke-width="5" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="14" ry="16" fill="#9A6A3A"/><ellipse cx="0" cy="4" rx="8" ry="10" fill="#E8C79A"/>' +
      '<circle cx="-4" cy="-24" r="3" fill="#9A6A3A"/><circle cx="14" cy="-24" r="3" fill="#9A6A3A"/><circle cx="5" cy="-20" r="11" fill="#9A6A3A"/><ellipse cx="6" cy="-17" rx="7.4" ry="6.4" fill="#E8C79A"/><circle cx="3" cy="-22" r="1.6" fill="#1E2A4A"/><circle cx="9" cy="-22" r="1.6" fill="#1E2A4A"/><path d="M3 -15 q3 2 6 0" fill="none" stroke="#1E2A4A" stroke-width="1.4" stroke-linecap="round"/></g>';
  }
  function parrotAt(x, y, k) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + k + ')"><path d="M-6 8 L-16 30 L-8 26 L-2 32 L2 10Z" fill="#3D8BF2"/><ellipse cx="0" cy="0" rx="11" ry="15" fill="#E5483A"/><path d="M-8 -2 Q-18 6 -12 16 Q-4 10 -2 2Z" fill="#FFC93C"/><circle cx="2" cy="-18" r="9" fill="#E5483A"/><path d="M8 -20 Q18 -18 14 -10 Q10 -12 7 -14Z" fill="#FFD23F"/><circle cx="3" cy="-20" r="2.4" fill="#FFFFFF"/><circle cx="3.6" cy="-20" r="1.2" fill="#1E2A4A"/></g>';
  }
  // the deep sea: coral, kelp, a fish, a shell and a whale
  function coralAt(x, y, k, c1, c2) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + k + ')"><path d="M0 0 V-30 M0 -16 L-12 -30 M0 -24 L10 -38 M0 -10 L12 -22" fill="none" stroke="' + c1 + '" stroke-width="7" stroke-linecap="round"/>' +
      '<circle cx="0" cy="-32" r="4" fill="' + c2 + '"/><circle cx="-12" cy="-32" r="3.4" fill="' + c2 + '"/><circle cx="10" cy="-40" r="3.4" fill="' + c2 + '"/><circle cx="12" cy="-24" r="3.4" fill="' + c2 + '"/></g>';
  }
  function kelpAt(x, y, h, c) {
    return '<path d="M' + x + " " + y + " q-10 " + -h * 0.25 + " 0 " + -h * 0.5 + " t0 " + -h * 0.5 + '" fill="none" stroke="' + (c || "#3FA66B") + '" stroke-width="5.4" stroke-linecap="round"/>';
  }
  function fishAt(x, y, k, c, flip) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + (flip ? -k : k) + " " + k + ')"><path d="M-14 0 L-25 -9 L-25 9Z" fill="' + c + '"/><ellipse cx="0" cy="0" rx="16" ry="10" fill="' + c + '"/><path d="M-4 -9 Q1 -16 8 -9Z" fill="' + c + '"/><circle cx="8" cy="-2" r="2.4" fill="#1E2A4A"/></g>';
  }
  function shellAt(x, y, k, c) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + k + ')"><path d="M0 0 L-16 -16 Q0 -30 16 -16Z" fill="' + c + '"/><path d="M0 0 L-8 -17 M0 0 V-21 M0 0 L8 -17" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.6"/><circle cx="0" cy="-5" r="4" fill="#FFFBF2"/></g>';
  }
  function whaleAt(x, y, k) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + k + ')"><path d="M-60 6 Q-60 -30 -20 -34 Q30 -38 56 -14 L72 -30 L78 -6 L62 4 Q30 26 -20 24 Q-56 24 -60 6Z" fill="#4F86D8"/><path d="M-44 8 Q-20 22 30 14 Q10 24 -20 24 Q-44 22 -44 8Z" fill="#CFE2FA"/><circle cx="-40" cy="-8" r="3.4" fill="#1E2A4A"/><path d="M-30 -2 Q-24 4 -16 0" fill="none" stroke="#1E2A4A" stroke-width="2" stroke-linecap="round"/><path d="M-6 -36 Q-6 -52 -14 -58 M-6 -36 Q-2 -52 6 -58" fill="none" stroke="#BFE6FF" stroke-width="3.4" stroke-linecap="round"/></g>';
  }
  function shipAt(x, y, k, rot) {
    return '<g transform="translate(' + x + " " + y + ") rotate(" + (rot || 0) + ") scale(" + k + ')"><path d="M-40 0 L-30 -22 H34 L44 0 Q0 12 -40 0Z" fill="#8A5A2B"/><path d="M-34 -10 H38" stroke="#B98A5A" stroke-width="2.4"/><circle cx="-14" cy="-12" r="3.6" fill="#BFE6FF" stroke="#5A3A18" stroke-width="1.6"/><circle cx="4" cy="-12" r="3.6" fill="#BFE6FF" stroke="#5A3A18" stroke-width="1.6"/><circle cx="22" cy="-12" r="3.6" fill="#BFE6FF" stroke="#5A3A18" stroke-width="1.6"/><path d="M0 -22 V-62" stroke="#6B4423" stroke-width="4" stroke-linecap="round"/><path d="M2 -58 L26 -50 L2 -34Z" fill="#E8DDC4" opacity=".9"/><path d="M-4 -60 L-18 -46 L-4 -36Z" fill="#D9CDB0" opacity=".9"/></g>';
  }
  function chestAt(x, y, k) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + k + ')"><path d="M-30 0 V-26 H30 V0Z" fill="#B9774A"/><path d="M-30 -26 Q-30 -48 0 -50 Q30 -48 30 -26Z" fill="#D9925F" transform="rotate(-14 -30 -26)"/><path d="M-30 -20 H30" stroke="#FFC93C" stroke-width="4"/><circle cx="-12" cy="-30" r="6" fill="#FFD23F"/><circle cx="2" cy="-34" r="6" fill="#FFD23F"/><circle cx="14" cy="-30" r="6" fill="#FFD23F"/><circle cx="-4" cy="-38" r="4" fill="#FF6FA0"/><circle cx="8" cy="-40" r="4" fill="#6BB7FF"/><rect x="-5" y="-22" width="10" height="9" rx="2" fill="#FFD23F"/></g>';
  }
  // the desert: dunes, a cactus, a pyramid, a camel and a moon
  function duneAt(x, base, w, h, c) {
    return '<path d="M' + (x - w / 2) + " " + base + " Q" + (x - w * 0.18) + " " + (base - h * 1.25) + " " + x + " " + (base - h) + " Q" + (x + w * 0.2) + " " + (base - h * 0.7) + " " + (x + w / 2) + " " + base + 'Z" fill="' + c + '"/>';
  }
  function cactusAt(x, base, h, c) {
    var w = h * 0.2, g = c || "#4FA06A";
    return '<path d="M' + (x - w) + " " + base + " V" + (base - h * 0.8) + " Q" + (x - w) + " " + (base - h) + " " + x + " " + (base - h) + " Q" + (x + w) + " " + (base - h) + " " + (x + w) + " " + (base - h * 0.8) + " V" + base + 'Z" fill="' + g + '"/>' +
      '<path d="M' + (x - w) + " " + (base - h * 0.4) + " H" + (x - w * 2.4) + " Q" + (x - w * 3.2) + " " + (base - h * 0.4) + " " + (x - w * 3.2) + " " + (base - h * 0.52) + " V" + (base - h * 0.66) + '" fill="none" stroke="' + g + '" stroke-width="' + w * 1.5 + '" stroke-linecap="round"/>' +
      '<path d="M' + (x + w) + " " + (base - h * 0.3) + " H" + (x + w * 2.4) + " Q" + (x + w * 3.2) + " " + (base - h * 0.3) + " " + (x + w * 3.2) + " " + (base - h * 0.42) + " V" + (base - h * 0.56) + '" fill="none" stroke="' + g + '" stroke-width="' + w * 1.5 + '" stroke-linecap="round"/>';
  }
  function pyramidAt(x, base, w, h, c1, c2) {
    return '<polygon points="' + (x - w / 2) + "," + base + " " + x + "," + (base - h) + " " + (x + w / 2) + "," + base + '" fill="' + c1 + '"/><polygon points="' + x + "," + (base - h) + " " + (x + w / 2) + "," + base + " " + x + "," + base + '" fill="' + c2 + '"/>';
  }
  function camelAt(x, y, k, flip) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + (flip ? -k : k) + " " + k + ')"><path d="M-18 -4 V16 M-8 -2 V18 M10 -2 V18 M20 -4 V16" stroke="#B98A4A" stroke-width="4.4" stroke-linecap="round"/><path d="M-26 -6 Q-28 -24 -14 -26 Q-8 -38 -2 -26 Q6 -38 12 -26 Q26 -24 26 -8 Q10 -2 -10 -2Z" fill="#D8A25E"/><path d="M24 -14 Q32 -26 34 -40 Q42 -40 42 -34 Q44 -28 36 -20 Q30 -12 24 -10Z" fill="#D8A25E"/><circle cx="37" cy="-35" r="1.6" fill="#1E2A4A"/><path d="M-26 -10 Q-34 -4 -32 6" fill="none" stroke="#B98A4A" stroke-width="3" stroke-linecap="round"/></g>';
  }
  function moonAt(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#FFF3B0"/><circle cx="' + (x + r * 0.4) + '" cy="' + (y - r * 0.1) + '" r="' + r * 0.86 + '" fill="#2E3282"/>';
  }
  function domeHouse(x, base, k, c) {
    return '<g transform="translate(' + x + " " + base + ") scale(" + k + ')"><rect x="-14" y="-18" width="28" height="18" fill="' + (c || "#F5E3B8") + '"/><path d="M-16 -18 Q0 -42 16 -18Z" fill="#E5883A"/><rect x="-4" y="-12" width="8" height="12" rx="4" fill="#8A5A2B"/><circle cx="0" cy="-33" r="2" fill="#FFD23F"/></g>';
  }
  // the polar island: igloos, penguins, icebergs and the northern lights
  function iglooAt(x, base, k) {
    return '<g transform="translate(' + x + " " + base + ") scale(" + k + ')"><path d="M-22 0 Q-22 -30 0 -30 Q22 -30 22 0Z" fill="#F4F9FF" stroke="#B9D2EC" stroke-width="2"/><path d="M-20 -14 H20 M-14 -24 H14 M-6 -30 V-24 M6 -24 V-14 M-12 -14 V0 M12 -14 V0" stroke="#CFE0F2" stroke-width="1.6" fill="none"/><path d="M-8 0 V-8 Q-8 -14 0 -14 Q8 -14 8 -8 V0Z" fill="#5F82AC"/></g>';
  }
  function penguinAt(x, y, k, flip) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + (flip ? -k : k) + " " + k + ')"><ellipse cx="-4" cy="0" rx="5" ry="2.4" fill="#FF9F3D"/><ellipse cx="5" cy="0" rx="5" ry="2.4" fill="#FF9F3D"/><ellipse cx="0" cy="-12" rx="10" ry="13" fill="#2F3A52"/><ellipse cx="1.5" cy="-10" rx="6.4" ry="10" fill="#FFFFFF"/><path d="M-9 -14 Q-15 -8 -11 -4 Q-8 -8 -8 -14Z" fill="#2F3A52"/><circle cx="0" cy="-27" r="7.6" fill="#2F3A52"/><circle cx="-2.6" cy="-28" r="1.5" fill="#FFFFFF"/><circle cx="3.2" cy="-28" r="1.5" fill="#FFFFFF"/><path d="M-1.5 -24.6 L7 -23.4 L-1.5 -21.4Z" fill="#FF9F3D"/></g>';
  }
  function icebergAt(x, base, w, h) {
    return '<polygon points="' + (x - w / 2) + "," + base + " " + (x - w * 0.22) + "," + (base - h * 0.7) + " " + (x - w * 0.02) + "," + (base - h) + " " + (x + w * 0.2) + "," + (base - h * 0.6) + " " + (x + w / 2) + "," + base + '" fill="#F4FAFF"/><polygon points="' + (x - w * 0.02) + "," + (base - h) + " " + (x + w * 0.2) + "," + (base - h * 0.6) + " " + (x + w / 2) + "," + base + " " + x + "," + base + '" fill="#C9E1F5"/>';
  }
  function auroraAt(y, h, c1, c2) {
    return '<path d="M0 ' + y + " Q90 " + (y - h) + " 180 " + (y + h * 0.2) + " T360 " + (y - h * 0.3) + " V" + (y + h) + " Q270 " + (y + h * 1.5) + " 180 " + (y + h * 0.9) + " T0 " + (y + h * 1.2) + 'Z" fill="' + c1 + '" opacity=".5"/><path d="M0 ' + (y + h * 0.5) + " Q100 " + (y - h * 0.4) + " 190 " + (y + h * 0.6) + " T360 " + (y + h * 0.3) + " V" + (y + h * 1.3) + " Q260 " + (y + h * 1.6) + " 170 " + (y + h * 1.2) + " T0 " + (y + h * 1.5) + 'Z" fill="' + c2 + '" opacity=".4"/>';
  }
  var SKY = '<rect width="360" height="100" fill="#BFE6FF"/>';

  // each island has five little worlds; a world has a name, a header picture (360 x 100), the colour behind its trail and the colour of the dotted path.
  // Island 1 is a mountain, 2 a seaside holiday, 3 a castle kingdom, 4 outer space and 5 a jungle.
  var WORLDS = {
    1: [
      { name: "Flower foothills", bg: "#EAF7E1", dash: "#A9DB95", art: function () {
        return SKY + sunAt(318, 24, 14) + cloudAt(60, 24, 0.8) + mount(70, 70, 120, 52, "#9DBDE8", true) + mount(250, 70, 150, 62, "#86A9DD", true) +
          '<path d="M0 70 Q90 46 180 68 T360 60 L360 100 L0 100Z" fill="#9ADF8A"/><path d="M0 88 Q120 66 240 86 T360 80 L360 100 L0 100Z" fill="#7FCF74"/>' +
          dots([[40, 84], [60, 92], [120, 88], [150, 94], [210, 90], [262, 84], [300, 94], [330, 86]], 4, "#FF8FB1") + dots([[50, 90], [135, 92], [230, 94], [315, 90]], 3.4, "#FFFFFF") + dots([[100, 92], [180, 86], [285, 90]], 3.4, "#FFC93C");
      } },
      { name: "Pine trail", bg: "#E1F1DA", dash: "#9FCB9A", art: function () {
        var o = '<rect width="360" height="100" fill="#CDEBC0"/><path d="M0 62 Q100 38 200 58 T360 50 L360 100 L0 100Z" fill="#A9D69B"/><path d="M0 86 Q120 74 240 88 T360 84 L360 100 L0 100Z" fill="#8FCB7A"/><path d="M150 104 Q172 86 196 80 T250 62" stroke="#E8C98A" stroke-width="11" fill="none" stroke-linecap="round"/>';
        [[26, 62], [70, 50], [124, 60], [236, 56], [292, 62], [338, 50]].forEach(function (t, i) {
          o += pineAt(t[0], 94, t[1], i % 2 ? "#3E9B5A" : "#2F8A4C", "#4FB36B");
        });
        return o;
      } },
      { name: "Mountain lake", bg: "#E3F2FB", dash: "#A7D3EE", art: function () {
        return '<rect width="360" height="100" fill="#CFEAFF"/>' + mount(80, 58, 180, 52, "#86A9DD", true) + mount(250, 58, 160, 42, "#9DBDE8", true) + '<rect y="58" width="360" height="42" fill="#5BB6E6"/>' +
          '<path d="M30 58 L80 96 L130 58Z" fill="#7FC3EE" opacity=".6"/><path d="M180 58 L250 90 L320 58Z" fill="#7FC3EE" opacity=".6"/><path d="M0 74 Q30 70 60 74 T120 74 T180 74 T240 74 T300 74 T360 74" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity=".7"/>' +
          '<path d="M0 88 Q60 78 90 100 L0 100Z" fill="#8FCB7A"/><path d="M360 86 Q310 80 280 100 L360 100Z" fill="#8FCB7A"/><path d="M20 90 v-12 M26 92 v-16 M34 90 v-10" stroke="#5E9B4A" stroke-width="2.5" stroke-linecap="round"/>';
      } },
      { name: "Snowy peak", bg: "#F0F6FC", dash: "#C4D6EA", art: function () {
        return '<rect width="360" height="100" fill="#DCEBFA"/>' + mount(90, 84, 130, 56, "#B7C8E6", true) + mount(220, 86, 240, 80, "#A9BDE0", true) + '<path d="M0 84 Q120 68 240 86 T360 78 L360 100 L0 100Z" fill="#FFFFFF"/>' +
          dots([[24, 18], [70, 40], [120, 14], [170, 30], [250, 12], [310, 36], [340, 20], [200, 52], [40, 62]], 2.4, "#FFFFFF") + pineAt(310, 96, 34, "#3E9B5A", "#4FB36B") + pineAt(332, 98, 26, "#3E9B5A", "#4FB36B");
      } },
      { name: "Summit sunrise", bg: "#FFEFD9", dash: "#F7C99A", art: function () {
        return '<rect width="360" height="100" fill="#FFD9A8"/><rect width="360" height="26" fill="#FF9E7D"/><rect y="26" width="360" height="24" fill="#FFB88C"/>' + sunAt(250, 62, 17) + '<path d="M0 76 Q120 62 240 78 T360 72 L360 100 L0 100Z" fill="#8E6FC4"/>' +
          mount(150, 100, 210, 72, "#6F5BA8", true) + '<line x1="150" y1="14" x2="150" y2="30" stroke="#3A2F6B" stroke-width="2.5"/><polygon points="150,14 166,19 150,24" fill="#E5483A"/>';
      } },
    ],
    2: [
      { name: "Golden sand", bg: "#FFF3D6", dash: "#F2D49B", art: function () {
        return '<rect width="360" height="100" fill="#CFEFFF"/>' + sunAt(322, 26, 14) + '<path d="M0 54 Q30 46 60 54 T120 54 T180 54 T240 54 T300 54 T360 54 L360 100 L0 100Z" fill="#5BC0EB"/><path d="M0 66 Q30 60 60 66 T120 66 T180 66 T240 66 T300 66 T360 66" fill="none" stroke="#FFFFFF" stroke-width="3" opacity=".7"/>' +
          '<path d="M0 86 Q120 70 240 88 T360 80 L360 100 L0 100Z" fill="#F6DFA4"/>' + sail(112, 56, 1, "#E5483A") + twinkle(262, 92, 8, "#FF8FB1");
      } },
      { name: "Ice cream pier", bg: "#FFEDE6", dash: "#F7C2AE", art: function () {
        var o = '<rect width="360" height="100" fill="#CFEFFF"/>' + sunAt(50, 24, 13) + '<rect y="46" width="360" height="54" fill="#5BC0EB"/><path d="M0 60 Q30 54 60 60 T120 60 T180 60 T240 60 T300 60 T360 60" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity=".7"/>';
        for (var x = 16; x < 360; x += 52) o += '<rect x="' + x + '" y="72" width="7" height="28" fill="#8A5A2B"/>';
        return o + '<rect y="64" width="360" height="10" fill="#C98B5A"/><path d="M0 69 H360" stroke="#A26F42" stroke-width="2"/>' + '<polygon points="270,40 290,40 280,64" fill="#E8B060"/><circle cx="280" cy="34" r="10" fill="#FF8FB1"/><circle cx="288" cy="42" r="6" fill="#FFFFFF"/><circle cx="276" cy="24" r="4" fill="#E5483A"/>';
      } },
      { name: "Coral reef", bg: "#DDF2FB", dash: "#9CD3EC", art: function () {
        return '<rect width="360" height="100" fill="#4FB6E8"/><polygon points="40,0 80,0 120,100 60,100" fill="#7CCBF0" opacity=".5"/><polygon points="200,0 250,0 300,100 230,100" fill="#7CCBF0" opacity=".4"/>' +
          '<path d="M0 90 Q90 80 180 92 T360 88 L360 100 L0 100Z" fill="#F6DFA4"/>' +
          '<path d="M60 92 v-22 M60 80 l-10 -10 M60 74 l10 -10 M120 92 v-18 M120 82 l-8 -8 M120 78 l8 -8" stroke="#FF8FB1" stroke-width="5" stroke-linecap="round" fill="none"/>' +
          '<path d="M250 94 Q236 70 262 62 Q290 70 276 94Z" fill="#FFA94D"/><path d="M310 94 v-20 M310 84 l-9 -9 M310 80 l9 -10" stroke="#E5483A" stroke-width="5" stroke-linecap="round" fill="none"/>' +
          '<ellipse cx="170" cy="40" rx="14" ry="8" fill="#FFA94D"/><polygon points="184,40 198,31 198,49" fill="#FFA94D"/><circle cx="162" cy="38" r="2" fill="#1E2A4A"/><ellipse cx="96" cy="26" rx="10" ry="6" fill="#FFD23F"/><polygon points="106,26 116,19 116,33" fill="#FFD23F"/>' +
          '<g fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".8"><circle cx="200" cy="30" r="4"/><circle cx="206" cy="16" r="3"/><circle cx="150" cy="60" r="3"/></g>';
      } },
      { name: "Lighthouse harbor", bg: "#E6EEFB", dash: "#B2C6EA", art: function () {
        return '<rect width="360" height="100" fill="#CFEFFF"/>' + cloudAt(70, 22, 0.9) + '<rect y="62" width="360" height="38" fill="#5BC0EB"/><path d="M0 76 Q30 70 60 76 T120 76 T180 76 T240 76 T300 76 T360 76" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity=".7"/>' +
          '<polygon points="266,34 360,14 360,48" fill="#FFF1A8" opacity=".6"/><ellipse cx="262" cy="66" rx="34" ry="12" fill="#8E96A8"/><path d="M250 64 L254 28 H270 L274 64Z" fill="#FFFFFF"/><path d="M252 52 L253 44 H271 L272 52Z M251 38 L252 32 H270 L271 38Z" fill="#E5483A"/>' +
          '<rect x="253" y="20" width="18" height="10" fill="#FFD23F"/><polygon points="250,21 262,10 274,21" fill="#E5483A"/>' + sail(90, 72, 0.9, "#3D8BF2");
      } },
      { name: "Sunset sail", bg: "#FFE8D6", dash: "#F5B98F", art: function () {
        return '<rect width="360" height="100" fill="#FFD9A8"/><rect width="360" height="26" fill="#FF9E7D"/><rect y="26" width="360" height="22" fill="#FFB88C"/>' + sunAt(180, 56, 20) + '<rect y="56" width="360" height="44" fill="#7A6BC4"/><rect y="78" width="360" height="22" fill="#5B4FA8"/>' +
          '<path d="M150 62 h60 M160 68 h40" stroke="#FFD9A8" stroke-width="3" stroke-linecap="round" opacity=".8"/>' + sail(262, 60, 1, "#3A2F6B");
      } },
    ],
    3: [
      { name: "Village green", bg: "#E8F5DC", dash: "#B5D99B", art: function () {
        return SKY + sunAt(322, 24, 13) + cloudAt(70, 22, 0.8) + '<path d="M0 66 Q90 44 180 64 T360 58 L360 100 L0 100Z" fill="#9ADF8A"/><path d="M0 88 Q120 70 240 88 T360 82 L360 100 L0 100Z" fill="#7FCF74"/>' +
          '<rect x="60" y="54" width="34" height="28" fill="#FFF1C2"/><polygon points="54,56 77,36 100,56" fill="#E5483A"/><rect x="72" y="66" width="10" height="16" fill="#8A5A2B"/>' +
          '<rect x="140" y="62" width="30" height="24" fill="#D6EEFF"/><polygon points="135,64 155,46 175,64" fill="#8B6BE8"/><rect x="151" y="72" width="9" height="14" fill="#8A5A2B"/>' +
          '<rect x="250" y="64" width="5" height="22" fill="#8A5A2B"/><circle cx="252" cy="54" r="15" fill="#4FB36B"/>';
      } },
      { name: "Castle gate", bg: "#EEE9F7", dash: "#C4B8E3", art: function () {
        return '<rect width="360" height="100" fill="#CFE0FF"/>' + cloudAt(300, 20, 0.8) + '<rect x="70" y="30" width="220" height="52" fill="#C9CEE8"/><rect x="58" y="20" width="26" height="62" fill="#B3B9DA"/><rect x="276" y="20" width="26" height="62" fill="#B3B9DA"/>' +
          '<polygon points="54,22 71,2 88,22" fill="#E5483A"/><polygon points="272,22 289,2 306,22" fill="#E5483A"/><path d="M158 82 V56 a22 22 0 0 1 44 0 V82Z" fill="#5A3A24"/><polygon points="150,100 210,100 202,82 158,82" fill="#C98B5A"/>' +
          '<g fill="#B3B9DA"><rect x="96" y="24" width="10" height="8"/><rect x="118" y="24" width="10" height="8"/><rect x="232" y="24" width="10" height="8"/><rect x="254" y="24" width="10" height="8"/></g><rect y="88" width="360" height="12" fill="#5BC0EB"/><line x1="71" y1="2" x2="71" y2="-6" stroke="#6B4A2B"/>';
      } },
      { name: "Dragon hill", bg: "#EFE3F7", dash: "#CDB0E6", art: function () {
        return '<rect width="360" height="100" fill="#CDBBF2"/>' + twinkle(50, 20, 7, "#FFE98A") + twinkle(150, 34, 5, "#FFFFFF") + twinkle(318, 22, 7, "#FFE98A") + '<path d="M0 74 Q120 50 240 70 T360 62 L360 100 L0 100Z" fill="#8B6BE8"/>' +
          '<path d="M205 70 Q160 62 150 82" stroke="#4FB36B" stroke-width="9" fill="none" stroke-linecap="round"/><ellipse cx="240" cy="66" rx="34" ry="17" fill="#6CCB5F"/><circle cx="280" cy="54" r="12" fill="#6CCB5F"/><ellipse cx="292" cy="58" rx="8" ry="6" fill="#8FDC83"/><circle cx="282" cy="51" r="2.6" fill="#1E2A4A"/>' +
          '<polygon points="225,52 240,26 256,52" fill="#FFB05C"/><polygon points="270,44 274,34 279,44 284,34 287,45" fill="#FFD23F"/><ellipse cx="228" cy="82" rx="8" ry="5" fill="#4FB36B"/>';
      } },
      { name: "Royal garden", bg: "#E3F5E8", dash: "#A9D8B6", art: function () {
        return SKY + cloudAt(80, 22, 0.8) + '<rect y="58" width="360" height="42" fill="#7FCF74"/><rect x="0" y="52" width="120" height="30" rx="8" fill="#3E9B5A"/><rect x="240" y="52" width="120" height="30" rx="8" fill="#3E9B5A"/>' +
          dots([[20, 62], [44, 70], [70, 60], [96, 70], [262, 62], [290, 70], [318, 60], [342, 70]], 4.5, "#E5483A") +
          '<ellipse cx="180" cy="84" rx="40" ry="9" fill="#C9CEE8"/><rect x="176" y="62" width="8" height="22" fill="#B3B9DA"/><ellipse cx="180" cy="62" rx="20" ry="5" fill="#C9CEE8"/><path d="M180 60 Q166 40 160 54 M180 60 Q194 40 200 54 M180 60 V38" stroke="#7CCBF0" stroke-width="3" fill="none" stroke-linecap="round"/>' +
          '<circle cx="150" cy="70" r="9" fill="#3E9B5A"/><circle cx="210" cy="70" r="9" fill="#3E9B5A"/>';
      } },
      { name: "Throne hall", bg: "#F6E4EC", dash: "#E3A9C2", art: function () {
        return '<rect width="360" height="100" fill="#5B3A8C"/><rect y="78" width="360" height="22" fill="#7A55AE"/><polygon points="150,100 210,100 196,62 164,62" fill="#E5483A"/>' +
          '<rect x="60" y="0" width="18" height="86" fill="#E8DCC8"/><rect x="282" y="0" width="18" height="86" fill="#E8DCC8"/><rect x="54" y="82" width="30" height="8" fill="#CBBFA8"/><rect x="276" y="82" width="30" height="8" fill="#CBBFA8"/>' +
          '<rect x="164" y="26" width="32" height="38" rx="6" fill="#FFD23F"/><rect x="156" y="52" width="48" height="12" rx="4" fill="#E0A800"/><polygon points="166,22 172,8 180,18 188,8 194,22" fill="#FFE066"/><circle cx="180" cy="40" r="4" fill="#E5483A"/>' +
          '<path d="M96 0 Q110 30 96 60 L116 60 Q130 30 116 0Z" fill="#E5483A" opacity=".85"/><path d="M244 0 Q230 30 244 60 L264 60 Q250 30 264 0Z" fill="#E5483A" opacity=".85"/>';
      } },
    ],
    4: [
      { name: "Launch pad", bg: "#2B2F6B", dash: "#7F86D6", art: function () {
        return '<rect width="360" height="100" fill="#2E2A6E"/>' + dots([[30, 14], [90, 30], [150, 12], [200, 34], [300, 16], [340, 40]], 1.8, "#FFFFFF") + twinkle(60, 40, 6, "#FFE98A") + twinkle(310, 56, 5, "#FFE98A") +
          '<path d="M0 86 Q100 74 200 84 T360 80 L360 100 L0 100Z" fill="#4B3FA8"/><g stroke="#9AA3D8" stroke-width="3"><line x1="214" y1="30" x2="214" y2="88"/><line x1="226" y1="30" x2="226" y2="88"/><line x1="214" y1="44" x2="226" y2="44"/><line x1="214" y1="60" x2="226" y2="60"/><line x1="214" y1="74" x2="226" y2="74"/><line x1="226" y1="40" x2="244" y2="40"/></g>' + rocket(262, 58, 1.1, 0);
      } },
      { name: "Moon walk", bg: "#2A2D4A", dash: "#8D93C2", art: function () {
        return '<rect width="360" height="100" fill="#1B1B3A"/>' + dots([[40, 12], [120, 24], [190, 10], [260, 26], [330, 14]], 1.8, "#FFFFFF") + '<circle cx="86" cy="30" r="16" fill="#3D8BF2"/><path d="M76 24 q8 -6 14 0 q4 6 -4 10 q-8 2 -10 -10z M92 36 q6 0 6 6 q-6 2 -6 -6z" fill="#6CCB5F"/>' +
          '<path d="M0 74 Q180 44 360 74 L360 100 L0 100Z" fill="#C9C5DD"/><ellipse cx="80" cy="86" rx="22" ry="5" fill="#A9A4C4"/><ellipse cx="200" cy="80" rx="16" ry="4" fill="#A9A4C4"/><ellipse cx="300" cy="88" rx="26" ry="6" fill="#A9A4C4"/>' +
          '<line x1="250" y1="42" x2="250" y2="70" stroke="#E8E4F5" stroke-width="3"/><polygon points="250,42 270,48 250,54" fill="#E5483A"/>';
      } },
      { name: "Comet trail", bg: "#33236B", dash: "#9C84E0", art: function () {
        return '<rect width="360" height="100" fill="#33236B"/>' + dots([[30, 20], [80, 70], [210, 16], [250, 82], [330, 30], [170, 90]], 1.8, "#FFFFFF") + twinkle(120, 22, 6, "#FFE98A") + twinkle(300, 70, 6, "#FFE98A") +
          '<polygon points="268,40 40,64 60,76" fill="#C9B6FF" opacity=".35"/><polygon points="268,42 120,56 130,64" fill="#E4D8FF" opacity=".5"/><circle cx="272" cy="46" r="14" fill="#FFE98A"/><circle cx="268" cy="42" r="6" fill="#FFFFFF" opacity=".8"/>' +
          '<circle cx="60" cy="24" r="10" fill="#FF8FB1"/><ellipse cx="60" cy="24" rx="16" ry="4" fill="none" stroke="#FFC4D6" stroke-width="2.5"/>';
      } },
      { name: "Ringed planet", bg: "#3B2A5E", dash: "#C79BE0", art: function () {
        return '<rect width="360" height="100" fill="#3B2A5E"/>' + dots([[30, 20], [90, 60], [150, 14], [200, 80], [320, 20], [340, 80]], 1.8, "#FFFFFF") + twinkle(110, 40, 6, "#FFE98A") +
          '<ellipse cx="250" cy="52" rx="62" ry="13" fill="none" stroke="#E6B5F5" stroke-width="7" transform="rotate(-14 250 52)"/><circle cx="250" cy="52" r="32" fill="#FF9F5A"/><path d="M222 44 Q250 54 278 40 M220 58 Q250 68 280 56" stroke="#FFC48A" stroke-width="5" fill="none"/>' +
          '<path d="M196 66 Q250 80 304 40" fill="none" stroke="#E6B5F5" stroke-width="7" transform="rotate(-14 250 52)" opacity="0"/><circle cx="318" cy="20" r="6" fill="#C9C5DD"/>';
      } },
      { name: "Alien base", bg: "#1F3A4D", dash: "#6FC2C8", art: function () {
        return '<rect width="360" height="100" fill="#1F3A4D"/>' + dots([[30, 16], [100, 30], [180, 12], [300, 20], [340, 44]], 1.8, "#FFFFFF") + '<path d="M0 82 Q120 66 240 80 T360 74 L360 100 L0 100Z" fill="#3B2A5E"/>' +
          '<path d="M130 82 a40 40 0 0 1 80 0Z" fill="#8FE3F0" opacity=".65"/><rect x="124" y="80" width="92" height="8" rx="4" fill="#9AA3D8"/><line x1="170" y1="30" x2="170" y2="42" stroke="#9AA3D8" stroke-width="3"/><circle cx="170" cy="28" r="4" fill="#FF8FB1"/>' +
          '<ellipse cx="170" cy="72" rx="9" ry="10" fill="#6CCB5F"/><circle cx="166" cy="70" r="2.4" fill="#1E2A4A"/><circle cx="174" cy="70" r="2.4" fill="#1E2A4A"/><path d="M162 62 l-4 -8 M178 62 l4 -8" stroke="#6CCB5F" stroke-width="2.5" stroke-linecap="round"/><circle cx="294" cy="60" r="8" fill="#FF8FB1"/>';
      } },
    ],
    5: [
      { name: "Vine bridge", bg: "#DDF3D3", dash: "#8FCB86", art: function () {
        var o = '<rect width="360" height="100" fill="#CFEFC4"/>' + jtree(30, 92, 70, "#4FB36B", "#3E9B5A") + jtree(330, 94, 76, "#3E9B5A", "#4FB36B") + jtree(100, 90, 40, "#6CCB5F", "#5DBB5A") + jtree(266, 90, 44, "#6CCB5F", "#5DBB5A") +
          vineAt(150, 0, 34) + vineAt(212, 0, 26) + '<rect x="58" y="36" width="8" height="56" fill="#8A5A2B"/><rect x="294" y="36" width="8" height="56" fill="#8A5A2B"/><path d="M62 44 Q180 82 298 44" fill="none" stroke="#8A5A2B" stroke-width="4" stroke-linecap="round"/>';
        for (var t = 0.1; t < 0.95; t += 0.1) o += '<rect x="' + (62 + 236 * t - 8).toFixed(1) + '" y="' + (44 + 76 * t * (1 - t) + 2).toFixed(1) + '" width="16" height="5" rx="1.5" fill="#B98A5A"/>';
        return o + '<path d="M0 94 Q90 84 180 92 T360 90 L360 100 L0 100Z" fill="#3E9B5A"/>';
      } },
      { name: "Waterfall cave", bg: "#D9F0F0", dash: "#8CCFD0", art: function () {
        return '<rect width="360" height="100" fill="#BDE3E8"/><path d="M0 100 L0 30 Q40 6 80 24 L110 100Z" fill="#8F9BAE"/><path d="M360 100 L360 24 Q320 2 280 24 L252 100Z" fill="#7B879C"/><rect x="150" y="0" width="44" height="88" fill="#8FD0F2"/><path d="M158 0 V80 M170 0 V86 M184 0 V76" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".8"/>' +
          '<ellipse cx="172" cy="92" rx="54" ry="9" fill="#6EC3F2"/><g fill="#FFFFFF" opacity=".75"><circle cx="150" cy="88" r="8"/><circle cx="170" cy="84" r="9"/><circle cx="192" cy="88" r="8"/></g><path d="M236 100 V74 Q236 54 258 54 Q280 54 280 74 V100Z" fill="#2B2B3A"/><circle cx="76" cy="20" r="4" fill="#6CCB5F"/>' + vineAt(300, 0, 30) + leafAt(40, 98, 0.8, -20, "#4FB36B");
      } },
      { name: "Monkey treetops", bg: "#E6F4CE", dash: "#A5D17A", art: function () {
        return '<rect width="360" height="100" fill="#D3EFAA"/><circle cx="40" cy="12" r="34" fill="#4FB36B"/><circle cx="110" cy="0" r="40" fill="#3E9B5A"/><circle cx="210" cy="8" r="36" fill="#4FB36B"/><circle cx="300" cy="-2" r="42" fill="#3E9B5A"/><circle cx="350" cy="30" r="30" fill="#6CCB5F"/>' +
          '<path d="M0 62 Q120 52 230 66 T360 58" fill="none" stroke="#8A5A2B" stroke-width="9" stroke-linecap="round"/>' + monkeyAt(206, 82, 1.1) + '<path d="M236 62 q10 -4 16 4 q-8 6 -16 -4z" fill="#FFD23F"/>' + vineAt(70, 40, 36) + vineAt(300, 42, 30) + leafAt(130, 96, 0.9, 20, "#6CCB5F");
      } },
      { name: "Hidden temple", bg: "#EEF0D5", dash: "#C4C77E", art: function () {
        return '<rect width="360" height="100" fill="#E1ECB8"/>' + jtree(40, 96, 60, "#4FB36B", "#3E9B5A") + jtree(322, 96, 64, "#3E9B5A", "#4FB36B") + '<rect x="84" y="80" width="192" height="16" fill="#CFC6A0"/><rect x="106" y="64" width="148" height="16" fill="#C4BA90"/><rect x="130" y="48" width="100" height="16" fill="#CFC6A0"/><rect x="154" y="26" width="52" height="22" fill="#C4BA90"/>' +
          '<path d="M170 48 V36 Q180 28 190 36 V48Z" fill="#2B2B3A"/><circle cx="180" cy="22" r="5" fill="#FFD23F"/><path d="M174 96 V80 H186 V96Z" fill="#9A8F6A"/>' + vineAt(100, 60, 34) + vineAt(262, 62, 30) + leafAt(66, 98, 0.8, -25, "#4FB36B") + leafAt(300, 98, 0.8, 25, "#4FB36B");
      } },
      { name: "Golden river", bg: "#FFF1C9", dash: "#EBCB78", art: function () {
        return '<rect width="360" height="100" fill="#FFF0C2"/>' + sunAt(300, 24, 13) + jtree(36, 62, 58, "#4FB36B", "#3E9B5A") + jtree(108, 58, 38, "#6CCB5F", "#5DBB5A") + '<path d="M0 66 Q80 58 170 70 T360 62 L360 100 L0 100Z" fill="#8FD07A"/><path d="M-10 84 Q90 66 190 82 T370 76 L370 100 L-10 100Z" fill="#F4C542"/><path d="M20 90 Q100 78 190 90 T350 84" fill="none" stroke="#FFE08A" stroke-width="4" stroke-linecap="round"/>' +
          '<path d="M176 74 q22 14 54 0 l-6 10 q-20 6 -42 0z" fill="#C4533F"/><line x1="203" y1="56" x2="203" y2="78" stroke="#6B4A2B" stroke-width="2.4"/>' + parrotAt(300, 52, 0.7);
      } },
    ],
    6: [
      { name: "Pearl reef", bg: "#D8F2FA", dash: "#8CD2E8", art: function () {
        return '<rect width="360" height="100" fill="#BDE9F7"/><path d="M60 0 L90 0 L70 100 L36 100Z M230 0 L262 0 L276 100 L246 100Z" fill="#fff" opacity=".18"/><path d="M0 82 Q90 70 180 80 T360 76 L360 100 L0 100Z" fill="#F0DDA8"/>' + coralAt(40, 92, 1.2, "#FF7A8A", "#FFB3C0") + coralAt(110, 94, 1.0, "#FFA94D", "#FFD08A") + coralAt(260, 92, 1.3, "#B58AE8", "#D8BFF5") + coralAt(322, 94, 1.0, "#FF7A8A", "#FFB3C0") +
          kelpAt(176, 96, 40) + kelpAt(190, 96, 32, "#2F8A4C") + shellAt(214, 90, 0.9, "#FFB3C7") + fishAt(150, 30, 0.9, "#FF9F5A") + fishAt(296, 40, 0.8, "#FFD23F", true) + dots([[96, 40, 3.4], [104, 26, 2.4], [208, 24, 3], [330, 20, 2.6]], 3, "rgba(255,255,255,.7)");
      } },
      { name: "Kelp forest", bg: "#D4EFE3", dash: "#7BCDA7", art: function () {
        return '<rect width="360" height="100" fill="#A9E0E8"/><path d="M110 0 L140 0 L124 100 L92 100Z M250 0 L282 0 L300 100 L268 100Z" fill="#fff" opacity=".2"/><path d="M0 88 Q90 78 180 86 T360 82 L360 100 L0 100Z" fill="#E4CB8A"/>' + kelpAt(24, 96, 70) + kelpAt(70, 96, 84, "#2F8A4C") + kelpAt(118, 96, 62) + kelpAt(176, 96, 90, "#2F8A4C") + kelpAt(238, 96, 70) + kelpAt(292, 96, 88, "#2F8A4C") + kelpAt(336, 96, 64) +
          fishAt(96, 40, 0.7, "#FF9F5A") + fishAt(120, 56, 0.6, "#FF9F5A") + fishAt(210, 30, 0.7, "#6BB7FF", true) + fishAt(232, 48, 0.6, "#6BB7FF", true) + dots([[150, 22, 2.8], [158, 10, 2], [320, 30, 3]], 3, "rgba(255,255,255,.7)");
      } },
      { name: "Sunken ship", bg: "#D5E5F2", dash: "#8AAFD0", art: function () {
        return '<rect width="360" height="100" fill="#8EC4E3"/><path d="M0 100 L0 70 Q60 60 120 70 T240 66 T360 70 L360 100Z" fill="#E4CB8A"/>' + shipAt(180, 82, 1.1, -14) + kelpAt(40, 96, 50, "#2F8A4C") + kelpAt(320, 96, 56, "#2F8A4C") + coralAt(98, 94, 0.9, "#FF7A8A", "#FFB3C0") + coralAt(262, 94, 0.9, "#FFA94D", "#FFD08A") +
          fishAt(70, 36, 0.8, "#FFD23F") + fishAt(300, 30, 0.8, "#FF8FB1", true) + dots([[130, 30, 3.6], [140, 16, 2.6], [250, 40, 3.2], [260, 22, 2.4]], 3, "rgba(255,255,255,.7)");
      } },
      { name: "Whale song", bg: "#D6E4FA", dash: "#93B2E8", art: function () {
        return '<rect width="360" height="100" fill="#9CC6F0"/><path d="M80 0 L112 0 L130 100 L96 100Z M240 0 L270 0 L252 100 L220 100Z" fill="#fff" opacity=".16"/>' + whaleAt(170, 56, 0.9) + '<g fill="#6A48E8"><ellipse cx="268" cy="30" rx="5.8" ry="4.2" transform="rotate(-20 268 30)"/><path d="M273 29 V8 Q278 12 283 12" stroke="#6A48E8" stroke-width="2.4" fill="none"/><ellipse cx="298" cy="52" rx="5" ry="3.6" transform="rotate(-20 298 52)"/><path d="M303 51 V32 Q308 36 313 36" stroke="#6A48E8" stroke-width="2.2" fill="none"/></g>' +
          fishAt(40, 70, 0.7, "#FFD23F") + fishAt(330, 80, 0.7, "#FF9F5A", true) + kelpAt(14, 98, 40, "#2F8A4C") + dots([[60, 24, 3], [320, 20, 2.6]], 3, "rgba(255,255,255,.7)");
      } },
      { name: "Treasure deep", bg: "#E4DEF5", dash: "#B6A5E4", art: function () {
        return '<rect width="360" height="100" fill="#5E8FD0"/><path d="M120 0 L160 0 L190 100 L130 100Z M200 0 L240 0 L260 100 L206 100Z" fill="#FFE98A" opacity=".16"/><path d="M0 86 Q90 76 180 84 T360 80 L360 100 L0 100Z" fill="#C9AE7A"/><circle cx="180" cy="62" r="40" fill="#FFE98A" opacity=".25"/>' + chestAt(180, 90, 1.1) + coralAt(60, 94, 1.1, "#FF7A8A", "#FFB3C0") + coralAt(300, 94, 1.1, "#B58AE8", "#D8BFF5") + kelpAt(20, 96, 50, "#2F8A4C") + kelpAt(344, 96, 50, "#2F8A4C") +
          fishAt(110, 30, 0.7, "#FFD23F") + fishAt(256, 24, 0.7, "#FF9F5A", true) + '<path d="M150 70 L156 64 L162 70 L156 76Z M210 66 L215 61 L220 66 L215 71Z" fill="#fff" opacity=".8"/>';
      } },
    ],
    7: [
      { name: "Sand dunes", bg: "#FBEBC8", dash: "#E8B55A", art: function () {
        return '<rect width="360" height="100" fill="#FFE7BE"/>' + sunAt(300, 26, 14) + duneAt(80, 100, 220, 38, "#F0C878") + duneAt(250, 100, 240, 30, "#E9BB68") + duneAt(160, 100, 200, 18, "#F6D48E") + cactusAt(48, 88, 38) + cactusAt(300, 92, 30, "#3F8F5A") + dots([[130, 40, 2.4, "#E8B55A"], [200, 30, 2, "#E8B55A"]], 2, "#E8B55A");
      } },
      { name: "Oasis town", bg: "#DFF2E4", dash: "#7BCDA7", art: function () {
        return '<rect width="360" height="100" fill="#CFEFFA"/>' + cloudAt(70, 22, 1) + '<path d="M0 84 Q90 74 180 82 T360 78 L360 100 L0 100Z" fill="#F0D89A"/><ellipse cx="180" cy="90" rx="52" ry="8" fill="#6CC4EE"/>' + palmAt(110, 90, 54, "#2F8A4C", "#4FB36B") + palmAt(246, 92, 60, "#2F8A4C", "#4FB36B") + domeHouse(40, 88, 1.3) + domeHouse(320, 90, 1.2, "#FBEFD0") + domeHouse(76, 92, 0.9, "#FBEFD0");
      } },
      { name: "Pyramid hall", bg: "#F6E6C8", dash: "#D9A55A", art: function () {
        return '<rect width="360" height="100" fill="#FFE2B0"/>' + sunAt(60, 28, 12) + pyramidAt(200, 92, 120, 62, "#E8C27A", "#C99A4A") + pyramidAt(290, 92, 70, 38, "#EBCB88", "#CFA458") + pyramidAt(110, 94, 60, 30, "#EBCB88", "#CFA458") + '<path d="M0 90 Q90 82 180 90 T360 86 L360 100 L0 100Z" fill="#F0D089"/>' + camelAt(30, 84, 0.5);
      } },
      { name: "Starry night", bg: "#DAD8F2", dash: "#9A94E0", art: function () {
        return '<rect width="360" height="100" fill="#2E3282"/><rect y="0" width="360" height="40" fill="#3A3F9E" opacity=".55"/>' + moonAt(300, 28, 14) + dots([[40, 20, 1.8], [90, 38, 1.4], [140, 16, 2], [190, 44, 1.4], [230, 22, 1.8], [270, 56, 1.4], [20, 58, 1.4], [330, 70, 1.6]], 1.6, "#FFFFFF") + twinkle(70, 30, 5, "#FFE066") + twinkle(210, 28, 4, "#FFE066") + '<path d="M0 84 Q90 70 180 82 T360 74 L360 100 L0 100Z" fill="#1E2266"/>' + cactusAt(60, 90, 30, "#2F6A4A") + camelAt(250, 86, 0.6);
      } },
      { name: "Camel caravan", bg: "#F8E3C4", dash: "#E0A060", art: function () {
        return '<rect width="360" height="100" fill="#FFCE9A"/><rect width="360" height="36" fill="#FFB27A" opacity=".5"/>' + sunAt(250, 62, 16) + duneAt(300, 100, 220, 34, "#E5A860") + duneAt(60, 100, 240, 28, "#EBB56E") + camelAt(70, 84, 0.7) + camelAt(130, 86, 0.7) + camelAt(192, 84, 0.7) + dots([[300, 24, 2], [40, 20, 2]], 2, "#FFFFFF");
      } },
    ],
    8: [
      { name: "Snow hills", bg: "#E6F3FF", dash: "#9CC4EC", art: function () {
        return '<rect width="360" height="100" fill="#CFE8FF"/>' + sunAt(300, 28, 12) + cloudAt(70, 24, 1) + duneAt(80, 100, 240, 40, "#FFFFFF") + duneAt(260, 100, 260, 34, "#F0F7FF") + duneAt(170, 100, 200, 20, "#E4F0FF") + pineAt(46, 94, 40, "#2F7A5C", "#3E9A74") + pineAt(72, 96, 28, "#2F7A5C", "#3E9A74") + pineAt(312, 94, 38, "#2F7A5C", "#3E9A74") + dots([[130, 30, 2, "#FFFFFF"], [200, 50, 2, "#FFFFFF"], [240, 22, 1.6, "#FFFFFF"]], 2, "#FFFFFF");
      } },
      { name: "Igloo village", bg: "#EAF2FB", dash: "#8FB4DC", art: function () {
        return '<rect width="360" height="100" fill="#D9ECFF"/>' + cloudAt(280, 24, 1) + '<path d="M0 82 Q90 72 180 80 T360 76 L360 100 L0 100Z" fill="#FFFFFF"/>' + iglooAt(100, 90, 1.1) + iglooAt(190, 92, 1.4) + iglooAt(280, 90, 1) + pineAt(34, 92, 36, "#2F7A5C", "#3E9A74") + pineAt(334, 92, 32, "#2F7A5C", "#3E9A74") + dots([[160, 30, 2, "#FFFFFF"], [230, 46, 2, "#FFFFFF"], [60, 40, 1.6, "#FFFFFF"]], 2, "#FFFFFF");
      } },
      { name: "Frozen lake", bg: "#E3F4FA", dash: "#7CC6E0", art: function () {
        return '<rect width="360" height="100" fill="#D6EEFF"/>' + cloudAt(60, 22, 1) + '<path d="M0 70 Q90 62 180 68 T360 64 L360 100 L0 100Z" fill="#FFFFFF"/><ellipse cx="180" cy="82" rx="110" ry="14" fill="#9FDCF2"/><path d="M120 80 Q150 76 180 80 M190 86 Q220 82 246 86 M150 88 L176 84" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>' + pineAt(36, 78, 42, "#2F7A5C", "#3E9A74") + pineAt(62, 80, 30, "#2F7A5C", "#3E9A74") + pineAt(322, 78, 40, "#2F7A5C", "#3E9A74");
      } },
      { name: "Northern lights", bg: "#D9E4F7", dash: "#8AA2E0", art: function () {
        return '<rect width="360" height="100" fill="#1E2A5E"/>' + auroraAt(26, 18, "#7CF5C0", "#B58AE8") + dots([[40, 16, 1.6], [90, 40, 1.2], [150, 12, 1.8], [220, 38, 1.2], [270, 10, 1.6], [330, 44, 1.4], [20, 60, 1.2]], 1.6, "#FFFFFF") + '<path d="M0 82 Q90 72 180 80 T360 76 L360 100 L0 100Z" fill="#E4EEFA"/>' + pineAt(40, 90, 34, "#1B3A4B", "#26566C") + pineAt(320, 90, 36, "#1B3A4B", "#26566C") + iglooAt(180, 92, 0.9);
      } },
      { name: "Penguin cove", bg: "#DDF0FA", dash: "#6FB6E0", art: function () {
        return '<rect width="360" height="100" fill="#CFE8FF"/>' + sunAt(60, 26, 12) + '<rect y="66" width="360" height="34" fill="#4FA8F0"/><path d="M0 66 Q30 60 60 66 T120 66 T180 66 T240 66 T300 66 T360 66" fill="none" stroke="#FFFFFF" stroke-width="2.4"/>' + icebergAt(100, 86, 90, 50) + icebergAt(300, 88, 70, 36) + penguinAt(80, 86, 0.7) + penguinAt(112, 88, 0.6, true) + penguinAt(290, 88, 0.6);
      } },
    ],
  };

  // the big banner at the top of an island's page (360 x 340, the bottom is always kept)
  var BANNERS = {
    1: function () {
      return '<rect width="360" height="340" fill="#BFE6FF"/>' + sunAt(306, 176, 16) + cloudAt(60, 180, 1) + cloudAt(210, 170, 0.8) + mount(62, 292, 170, 120, "#9DBDE8", true) + mount(200, 292, 200, 150, "#86A9DD", true) + mount(318, 292, 150, 100, "#9DBDE8", true) + mount(240, 306, 220, 150, "#6F8FC8", true) +
        '<path d="M0 268 Q90 240 180 266 T360 256 L360 340 L0 340Z" fill="#9ADF8A"/><path d="M0 306 Q120 282 240 304 T360 296 L360 340 L0 340Z" fill="#7FCF74"/>' + pineAt(30, 320, 58, "#3E9B5A", "#4FB36B") + pineAt(60, 328, 44, "#2F8A4C", "#3E9B5A") + pineAt(332, 322, 60, "#3E9B5A", "#4FB36B") + pineAt(304, 330, 42, "#2F8A4C", "#3E9B5A") +
        dots([[120, 316], [150, 324], [200, 318]], 4, "#FF8FB1") + dots([[132, 322], [180, 326]], 3.4, "#FFFFFF");
    },
    2: function () {
      return '<rect width="360" height="340" fill="#CFEFFF"/>' + sunAt(300, 176, 17) + cloudAt(70, 184, 1) + '<rect y="232" width="360" height="108" fill="#5BC0EB"/><path d="M0 252 Q30 244 60 252 T120 252 T180 252 T240 252 T300 252 T360 252" fill="none" stroke="#FFFFFF" stroke-width="3.5" opacity=".7"/><path d="M0 272 Q30 264 60 272 T120 272 T180 272 T240 272 T300 272 T360 272" fill="none" stroke="#FFFFFF" stroke-width="3" opacity=".5"/>' +
        sail(130, 250, 1.3, "#E5483A") + '<path d="M0 304 Q120 276 240 302 T360 290 L360 340 L0 340Z" fill="#F6DFA4"/>' + palmAt(42, 326, 92, "#3E9B5A", "#4FB36B") + palmAt(316, 330, 78, "#4FB36B", "#3E9B5A") +
        '<line x1="236" y1="320" x2="236" y2="280" stroke="#8A5A2B" stroke-width="3.5"/><path d="M206 284 Q236 252 266 284Z" fill="#E5483A"/><path d="M221 270 Q236 258 251 270 L236 284Z" fill="#FFFFFF"/><ellipse cx="272" cy="326" rx="18" ry="5" fill="#FF8FB1"/>';
    },
    3: function () {
      return '<rect width="360" height="340" fill="#CFE0FF"/>' + cloudAt(60, 176, 1) + cloudAt(300, 190, 0.8) + sunAt(320, 168, 14) + '<path d="M0 292 Q180 218 360 292 L360 340 L0 340Z" fill="#9ADF8A"/>' +
        '<g transform="translate(60 0) translate(180 294) scale(.56) translate(-180 -294)"><rect x="132" y="218" width="96" height="76" fill="#C9CEE8"/><rect x="118" y="190" width="30" height="104" fill="#B3B9DA"/><rect x="212" y="190" width="30" height="104" fill="#B3B9DA"/><rect x="160" y="170" width="40" height="124" fill="#C9CEE8"/>' +
        '<polygon points="114,192 133,156 152,192" fill="#E5483A"/><polygon points="208,192 227,156 246,192" fill="#E5483A"/><polygon points="156,172 180,128 204,172" fill="#8B6BE8"/>' +
        '<line x1="180" y1="128" x2="180" y2="112" stroke="#6B4A2B" stroke-width="2.5"/><polygon points="180,112 198,118 180,124" fill="#FFD23F"/><path d="M164 294 V262 a16 16 0 0 1 32 0 V294Z" fill="#5A3A24"/>' +
        '<g fill="#8A97BE"><rect x="124" y="204" width="8" height="12" rx="4"/><rect x="228" y="204" width="8" height="12" rx="4"/><rect x="174" y="190" width="12" height="16" rx="6"/></g><path d="M170 340 Q150 314 180 296 Q214 314 196 340Z" fill="#E8D9B0"/></g>' +
        '<rect x="46" y="296" width="6" height="22" fill="#8A5A2B"/><circle cx="49" cy="284" r="18" fill="#4FB36B"/><rect x="306" y="298" width="6" height="22" fill="#8A5A2B"/><circle cx="309" cy="286" r="16" fill="#3E9B5A"/>';
    },
    4: function () {
      return '<rect width="360" height="340" fill="#1E1B4B"/>' + dots([[30, 170], [80, 250], [140, 160], [190, 214], [250, 168], [330, 200], [350, 270], [20, 290], [300, 150]], 2, "#FFFFFF") + twinkle(110, 190, 7, "#FFE98A") + twinkle(318, 244, 6, "#FFE98A") + twinkle(60, 214, 5, "#FFFFFF") +
        '<ellipse cx="268" cy="232" rx="74" ry="15" fill="none" stroke="#E6B5F5" stroke-width="8" transform="rotate(-14 268 232)"/><circle cx="268" cy="232" r="42" fill="#FF9F5A"/><path d="M232 220 Q268 232 304 216 M230 240 Q268 252 306 238" stroke="#FFC48A" stroke-width="6" fill="none"/>' +
        '<circle cx="62" cy="214" r="26" fill="#E8E4F5"/><ellipse cx="54" cy="208" rx="6" ry="4" fill="#CFCBE6"/><ellipse cx="72" cy="224" rx="8" ry="5" fill="#CFCBE6"/>' + rocket(150, 268, 1.3, 28) +
        '<path d="M0 304 Q180 272 360 302 L360 340 L0 340Z" fill="#4B3FA8"/><ellipse cx="90" cy="320" rx="24" ry="6" fill="#3B2F8A"/><ellipse cx="260" cy="324" rx="30" ry="7" fill="#3B2F8A"/>';
    },
    5: function () {
      return '<rect width="360" height="340" fill="#C9EEC0"/>' + sunAt(312, 176, 15) + cloudAt(70, 182, 0.9) + jtree(40, 300, 150, "#3E9B5A", "#4FB36B") + jtree(326, 304, 160, "#2F8A4C", "#3E9B5A") + jtree(120, 308, 80, "#4FB36B", "#6CCB5F") + jtree(260, 308, 90, "#4FB36B", "#6CCB5F") +
        vineAt(100, 150, 60) + vineAt(190, 150, 46) + vineAt(240, 150, 66) + '<path d="M0 300 Q90 278 180 298 T360 290 L360 340 L0 340Z" fill="#6CCB5F"/><path d="M0 322 Q120 304 240 320 T360 314 L360 340 L0 340Z" fill="#4FB36B"/>' +
        '<rect x="150" y="268" width="62" height="14" fill="#CFC6A0"/><rect x="162" y="254" width="38" height="14" fill="#C4BA90"/><rect x="172" y="238" width="18" height="16" fill="#CFC6A0"/><circle cx="181" cy="232" r="4" fill="#FFD23F"/>' + parrotAt(86, 252, 1.3) + leafAt(280, 336, 1.4, 22, "#4FB36B") + leafAt(40, 338, 1.2, -24, "#6CCB5F");
    },
    6: function () {
      return '<rect width="360" height="340" fill="#BDE9F7"/><rect y="150" width="360" height="190" fill="#8EC4E3"/><rect y="250" width="360" height="90" fill="#6FA8D8"/><path d="M60 140 L100 140 L84 340 L30 340Z M180 140 L224 140 L240 340 L190 340Z M290 140 L322 140 L342 340 L300 340Z" fill="#fff" opacity=".13"/>' +
        whaleAt(110, 214, 0.95) + fishAt(250, 190, 1.0, "#FFD23F") + fishAt(280, 214, 0.8, "#FFD23F") + fishAt(300, 176, 0.8, "#FF9F5A", true) + dots([[40, 170, 4], [52, 154, 3], [316, 240, 4.4], [326, 224, 3], [214, 168, 3.4]], 3, "rgba(255,255,255,.7)") +
        '<path d="M0 304 Q90 290 180 302 T360 296 L360 340 L0 340Z" fill="#E4CB8A"/><path d="M0 322 Q120 312 240 322 T360 318 L360 340 L0 340Z" fill="#D2B672"/>' + shipAt(250, 304, 1.25, -12) + kelpAt(24, 330, 80, "#2F8A4C") + kelpAt(50, 332, 64) + kelpAt(332, 332, 84, "#2F8A4C") +
        coralAt(86, 328, 1.5, "#FF7A8A", "#FFB3C0") + coralAt(150, 332, 1.2, "#FFA94D", "#FFD08A") + coralAt(190, 330, 1.4, "#B58AE8", "#D8BFF5") + shellAt(122, 330, 1.2, "#FFB3C7") + chestAt(292, 336, 0.9);
    },
    8: function () {
      return '<rect width="360" height="340" fill="#BCDDF7"/><rect y="0" width="360" height="140" fill="#7FA6E0" opacity=".55"/>' + auroraAt(40, 26, "#7CF5C0", "#E8A0F0") + dots([[40, 30, 1.8], [110, 70, 1.4], [200, 22, 1.8], [260, 84, 1.4], [330, 40, 1.8]], 1.8, "#FFFFFF") + sunAt(300, 120, 22) + cloudAt(60, 100, 1.1) +
        icebergAt(290, 250, 130, 100) + '<rect y="250" width="360" height="90" fill="#4FA8F0"/><path d="M0 250 Q30 242 60 250 T120 250 T180 250 T240 250 T300 250 T360 250" fill="none" stroke="#FFFFFF" stroke-width="3"/>' + icebergAt(290, 262, 120, 90) +
        '<path d="M0 300 Q90 270 180 292 T360 280 L360 340 L0 340Z" fill="#FFFFFF"/><path d="M0 322 Q120 306 240 320 T360 314 L360 340 L0 340Z" fill="#E4F0FF"/>' + iglooAt(80, 312, 1.8) + iglooAt(180, 322, 1.3) + pineAt(30, 330, 90, "#2F7A5C", "#3E9A74") + pineAt(330, 332, 70, "#2F7A5C", "#3E9A74") + penguinAt(230, 330, 1.3) + penguinAt(268, 334, 1.1, true);
    },
    7: function () {
      return '<rect width="360" height="340" fill="#FFE7BE"/><rect y="0" width="360" height="120" fill="#FFD9A0" opacity=".55"/>' + sunAt(280, 80, 30) + cloudAt(70, 60, 1.1) +
        pyramidAt(150, 262, 150, 92, "#E8C27A", "#C99A4A") + pyramidAt(250, 266, 92, 56, "#EBCB88", "#CFA458") + duneAt(60, 340, 260, 82, "#F0C878") + duneAt(280, 340, 280, 64, "#E9BB68") + '<path d="M0 306 Q120 290 240 306 T360 300 L360 340 L0 340Z" fill="#F6D48E"/>' +
        cactusAt(40, 330, 80) + cactusAt(322, 334, 60, "#3F8F5A") + palmAt(110, 322, 90, "#2F8A4C", "#4FB36B") + camelAt(214, 322, 1.3);
    },
  };

  function worlds(stage) {
    return WORLDS[stage] || WORLDS[1];
  }
  function bannerArt(stage) {
    return '<svg viewBox="0 0 360 340" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' + soft((BANNERS[stage] || BANNERS[1])()) + "</svg>";
  }
  function unitArt(o) {
    var list = worlds(o.s);
    return '<svg viewBox="0 0 360 100" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' + soft(list[o.i % list.length].art()) + "</svg>";
  }
  function unitTheme(o) {
    var list = worlds(o.s),
      w = list[o.i % list.length];
    return { name: w.name, bg: w.bg, dash: w.dash };
  }

  // the treasure chest at the end of a unit: open and full of coins when the unit is finished, grey and shut before. Each island has its own chest.
  var CHESTS = {
    1: { body: "#B9774A", lid: "#D9925F", band: "#FFC93C" },
    2: { body: "#2F86A8", lid: "#4FB0D2", band: "#FFC93C" },
    3: { body: "#7A3FA8", lid: "#9A58C8", band: "#FFD23F" },
    4: { body: "#8E9BB8", lid: "#B3BED6", band: "#5FE0F0" },
    5: { body: "#2F7A4C", lid: "#46A06B", band: "#FFD23F" },
    6: { body: "#2F6F95", lid: "#4A93BD", band: "#FFD23F" },
    7: { body: "#A8682A", lid: "#D79A4A", band: "#FFD23F" },
    8: { body: "#3A7FB0", lid: "#6CB6DE", band: "#FFFFFF" },
  };
  function emblem(stage) {
    if (stage === 2) return '<path d="M40 40 L30 52 Q40 58 50 52Z" fill="#FFD9E6"/><path d="M40 40 L36 54 M40 40 L40 56 M40 40 L44 54" stroke="#E88FB1" stroke-width="1.6"/>';
    if (stage === 3) return '<polygon points="31,44 34,34 38,41 40,32 42,41 46,34 49,44" fill="#FFE066"/><circle cx="26" cy="52" r="3" fill="#FF8FB1"/><circle cx="54" cy="52" r="3" fill="#5FE0F0"/>';
    if (stage === 4) return '<circle cx="40" cy="48" r="9" fill="#5FE0F0" opacity=".35"/>' + twinkle(40, 48, 7, "#FFFFFF");
    if (stage === 5) return '<path d="M40 56 Q28 48 34 36 Q44 38 46 48 Q44 54 40 56Z" fill="#9BE08A"/><path d="M40 56 L38 42" stroke="#2F8A4C" stroke-width="1.6"/>';
    if (stage === 6) return '<path d="M40 58 L28 44 Q40 32 52 44Z" fill="#FFB3C7"/><path d="M40 58 L33 44 M40 58 V38 M40 58 L47 44" stroke="#E88FB1" stroke-width="1.4"/><circle cx="40" cy="52" r="2.6" fill="#FFFBF2"/>';
    if (stage === 7) return '<path d="M40 60 V42 Q40 36 44 36 Q48 36 48 42 V60Z" fill="#7FD07F" transform="translate(-4 0)"/><path d="M36 52 H31 Q28 52 28 48 V44" fill="none" stroke="#7FD07F" stroke-width="4" stroke-linecap="round"/><path d="M48 50 H53 Q56 50 56 46 V42" fill="none" stroke="#7FD07F" stroke-width="4" stroke-linecap="round"/><circle cx="40" cy="35" r="3" fill="#FF8FB1"/>';
    if (stage === 8) return '<g stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M40 34 V62 M28 41 L52 55 M28 55 L52 41"/></g><circle cx="40" cy="48" r="3" fill="#FFFFFF"/>';
    return "";
  }
  function chest(o) {
    // state: "locked" (grey, the unit is not finished), "ready" (finished, coloured and shut: waiting to be opened), "open" (opened, full of coins)
    var state = o && o.state ? o.state : o && o.open ? "open" : "locked",
      st = (o && o.s) || 1,
      c = CHESTS[st] || CHESTS[1],
      inner;
    if (state === "open") {
      inner = '<path d="M12 30 L17 4 Q40 -4 63 4 L68 30z" fill="' + c.lid + '"/><rect x="36" y="2" width="8" height="28" fill="' + c.band + '"/>' +
        '<path d="M10 34 h60 v26 q0 6 -6 6 h-48 q-6 0 -6 -6z" fill="' + c.body + '"/><rect x="34" y="34" width="12" height="32" fill="' + c.band + '"/><ellipse cx="40" cy="34" rx="30" ry="6" fill="#3B2A1E"/>' +
        '<circle cx="26" cy="31" r="6" fill="#FFD23F"/><circle cx="42" cy="28" r="7" fill="#FFC93C"/><circle cx="55" cy="32" r="6" fill="#FFE066"/>' + emblem(st);
    } else if (state === "ready") {
      inner = '<path d="M10 34 h60 v26 q0 6 -6 6 h-48 q-6 0 -6 -6z" fill="' + c.body + '"/><rect x="34" y="34" width="12" height="32" fill="' + c.band + '"/>' +
        '<path d="M10 34 v-8 q0 -16 30 -16 q30 0 30 16 v8z" fill="' + c.lid + '"/><rect x="34" y="10" width="12" height="24" fill="' + c.band + '"/>' +
        '<rect x="33" y="29" width="14" height="14" rx="3" fill="#FFD23F" stroke="#B8860B" stroke-width="1.6"/><circle cx="40" cy="35" r="2.4" fill="#8A5A00"/>' +
        twinkle(12, 6, 6, "#FFE066") + twinkle(68, 2, 5, "#FFFFFF");
    } else {
      inner = '<path d="M10 34 h60 v26 q0 6 -6 6 h-48 q-6 0 -6 -6z" fill="#B3BDD0"/><rect x="34" y="34" width="12" height="32" fill="#98A5BD"/>' +
        '<path d="M10 34 v-8 q0 -16 30 -16 q30 0 30 16 v8z" fill="#C7D0E0"/><rect x="34" y="10" width="12" height="24" fill="#98A5BD"/><rect x="33" y="29" width="14" height="14" rx="3" fill="#8A97AD"/><circle cx="40" cy="35" r="2.4" fill="#FFFFFF"/>';
    }
    return '<svg viewBox="0 -10 80 80" aria-hidden="true">' + soft(inner) + (state === "open" ? '<path d="M40 -8 l2.6 6 l6.4 .8 l-4.8 4.4 l1.4 6.4 l-5.6 -3.4 l-5.6 3.4 l1.4 -6.4 l-4.8 -4.4 l6.4 -.8z" fill="#FFE066" stroke="#E0A800" stroke-width="1.2" stroke-linejoin="round"/>' : "") + "</svg>";
  }

  // the album book: a green cover with "Aa" and a ribbon
  function book() {
    var inner = '<rect x="10" y="6" width="54" height="64" rx="9" fill="#FFFFFF"/><rect x="6" y="2" width="54" height="64" rx="9" fill="#35B779"/><rect x="6" y="2" width="11" height="64" rx="5" fill="#1F8A55"/>' +
      '<path d="M44 2 h8 v22 l-4 -4 l-4 4Z" fill="#FFC93C"/>';
    return '<svg viewBox="0 0 70 74" aria-hidden="true">' + soft(inner) + '<text x="35" y="50" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="22" fill="#FFFFFF">Aa</text></svg>';
  }

  function star() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.8L12 17.6 6 21l1.3-6.8-5-4.7 6.8-.8z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  }

  function lock(cx, cy) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="15" fill="#8A97AD"/><rect x="' + (cx - 7) + '" y="' + cy + '" width="14" height="11" rx="3" fill="#FFFFFF"/><path d="M' + (cx - 4) + " " + cy + ' v-4 a4 4 0 0 1 8 0 v4" fill="none" stroke="#FFFFFF" stroke-width="2.4"/>';
  }

  // one island (drawn around 0,0 = the middle of its top). g = true gives the grey, locked version.
  function islandArt(n, g) {
    function K(real, grey) {
      return g ? grey : real;
    }
    var earth = ["", "#A98B6B", "#D9B77A", "#9AA3C4", "#6B5BC4", "#7A6A3E", "#3F7396", "#B07A3C", "#6E9CC4"][n],
      top = ["", "#8FD07F", "#F6DFA4", "#8FD07F", "#CFC8E8", "#6CCB5F", "#F0DDA8", "#F6E0A4", "#F2F8FF"][n],
      o = '<path d="M-62 0 Q-52 46 0 58 Q52 46 62 0Z" fill="' + K(earth, "#B9C3D8") + '"/><path d="M-40 30 Q-30 46 0 52 Q30 46 40 30" fill="none" stroke="' + K("rgba(0,0,0,.14)", "#A3AEC6") + '" stroke-width="3" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="64" ry="22" fill="' + K(top, "#D5DDEC") + '"/>';
    if (n === 1) {
      o += mount(-2, -2, 70, 66, K("#8FA3C7", "#AEBAD2"), true).replace(/#FFFFFF/g, K("#FFFFFF", "#E6EBF5")) + mount(32, 0, 46, 38, K("#A7B8D6", "#9FACC7"), true).replace(/#FFFFFF/g, K("#FFFFFF", "#E6EBF5")) +
        pineAt(-40, 4, 28, K("#3E9B5A", "#9FACC7"), K("#4FB36B", "#AEBAD2")) + pineAt(-28, 8, 20, K("#2F8A4C", "#9FACC7"), K("#3E9B5A", "#AEBAD2")) + pineAt(46, 8, 20, K("#3E9B5A", "#9FACC7"), K("#4FB36B", "#AEBAD2")) +
        '<line x1="-2" y1="-68" x2="-2" y2="-84" stroke="' + K("#6B4A2B", "#8A97AD") + '" stroke-width="3" stroke-linecap="round"/><polygon points="-2,-84 16,-78 -2,-72" fill="' + K("#E5483A", "#9FACC7") + '"/>';
    } else if (n === 2) {
      o += palmAt(-24, 2, 58, K("#3E9B5A", "#9FACC7"), K("#4FB36B", "#AEBAD2")) + '<line x1="26" y1="6" x2="26" y2="-34" stroke="' + K("#8A5A2B", "#9FACC7") + '" stroke-width="3.5"/><path d="M0 -30 Q26 -58 52 -30Z" fill="' + K("#E5483A", "#AEBAD2") + '"/><path d="M13 -42 Q26 -52 39 -42 L26 -30Z" fill="' + K("#FFFFFF", "#E6EBF5") + '"/>' +
        '<ellipse cx="-4" cy="10" rx="12" ry="4" fill="' + K("#FF8FB1", "#B9C3D8") + '"/><path d="M-50 14 Q-40 8 -30 14 T-10 14" fill="none" stroke="' + K("#5BC0EB", "#C7D0E0") + '" stroke-width="3" stroke-linecap="round"/>';
    } else if (n === 3) {
      o += '<rect x="-26" y="-34" width="52" height="34" fill="' + K("#C9CEE8", "#AEBAD2") + '"/><rect x="-36" y="-50" width="16" height="50" fill="' + K("#B3B9DA", "#9FACC7") + '"/><rect x="20" y="-50" width="16" height="50" fill="' + K("#B3B9DA", "#9FACC7") + '"/><rect x="-10" y="-62" width="20" height="62" fill="' + K("#C9CEE8", "#AEBAD2") + '"/>' +
        '<polygon points="-40,-48 -28,-72 -16,-48" fill="' + K("#E5483A", "#9FACC7") + '"/><polygon points="16,-48 28,-72 40,-48" fill="' + K("#E5483A", "#9FACC7") + '"/><polygon points="-14,-60 0,-88 14,-60" fill="' + K("#8B6BE8", "#8A97AD") + '"/><path d="M-7 0 v-12 a7 7 0 0 1 14 0 v12Z" fill="' + K("#5A3A24", "#8A97AD") + '"/>' +
        '<line x1="0" y1="-88" x2="0" y2="-100" stroke="' + K("#6B4A2B", "#8A97AD") + '" stroke-width="2.5"/><polygon points="0,-100 14,-95 0,-90" fill="' + K("#FFD23F", "#AEBAD2") + '"/>';
    } else if (n === 5) {
      o += '<rect x="-14" y="-18" width="44" height="12" fill="' + K("#CFC6A0", "#AEBAD2") + '"/><rect x="-6" y="-30" width="28" height="12" fill="' + K("#C4BA90", "#9FACC7") + '"/><rect x="0" y="-42" width="16" height="12" fill="' + K("#CFC6A0", "#AEBAD2") + '"/><circle cx="8" cy="-46" r="3.4" fill="' + K("#FFD23F", "#C7D0E0") + '"/>' +
        '<rect x="-46" y="-32" width="6" height="34" fill="' + K("#8A5A2B", "#9FACC7") + '"/><circle cx="-52" cy="-40" r="16" fill="' + K("#3E9B5A", "#9FACC7") + '"/><circle cx="-36" cy="-42" r="14" fill="' + K("#4FB36B", "#AEBAD2") + '"/><circle cx="-44" cy="-54" r="15" fill="' + K("#4FB36B", "#AEBAD2") + '"/>' +
        '<rect x="42" y="-24" width="5" height="28" fill="' + K("#8A5A2B", "#9FACC7") + '"/><circle cx="46" cy="-32" r="14" fill="' + K("#3E9B5A", "#9FACC7") + '"/>' + (g ? "" : parrotAt(-14, -34, 0.42)) +
        '<ellipse cx="8" cy="8" rx="16" ry="4" fill="' + K("#5DBB5A", "#B9C3D8") + '"/>';
    } else if (n === 6) {
      o += '<path d="M-44 6 Q-52 -14 -44 -30 Q-38 -44 -46 -58" fill="none" stroke="' + K("#3FA66B", "#9FACC7") + '" stroke-width="5.4" stroke-linecap="round"/><path d="M-34 6 Q-26 -10 -34 -24 Q-40 -34 -32 -46" fill="none" stroke="' + K("#2F8A4C", "#AEBAD2") + '" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M-6 6 V-24 M-6 -12 L-18 -26 M-6 -20 L4 -34 M6 6 V-16 M6 -8 L18 -20" fill="none" stroke="' + K("#FF7A8A", "#9FACC7") + '" stroke-width="7" stroke-linecap="round"/><circle cx="4" cy="-36" r="3.8" fill="' + K("#FFB3C0", "#C7D0E0") + '"/><circle cx="-18" cy="-28" r="3.4" fill="' + K("#FFB3C0", "#C7D0E0") + '"/><circle cx="18" cy="-22" r="3.4" fill="' + K("#FFB3C0", "#C7D0E0") + '"/>' +
        '<g transform="translate(34 4) rotate(-12)"><path d="M-14 0 L-10 -14 H12 L16 0Z" fill="' + K("#8A5A2B", "#9FACC7") + '"/><path d="M0 -14 V-34" stroke="' + K("#6B4423", "#8A97AD") + '" stroke-width="3" stroke-linecap="round"/><path d="M1 -32 L14 -26 L1 -18Z" fill="' + K("#E8DDC4", "#C7D0E0") + '"/></g>' +
        (g ? "" : '<path d="M-40 -20 L-48 -26 L-48 -14Z" fill="#FF9F5A"/><ellipse cx="-34" cy="-20" rx="9" ry="5.6" fill="#FF9F5A"/><circle cx="-31" cy="-21" r="1.4" fill="#1E2A4A"/><circle cx="22" cy="-52" r="3.4" fill="#fff" opacity=".7"/><circle cx="28" cy="-62" r="2.4" fill="#fff" opacity=".7"/>');
    } else if (n === 7) {
      o += '<polygon points="-6,6 14,-40 34,6" fill="' + K("#E8C27A", "#B9C3D8") + '"/><polygon points="14,-40 34,6 14,6" fill="' + K("#C99A4A", "#9FACC7") + '"/>' +
        '<path d="M-48 6 V-18 Q-48 -26 -42 -26 Q-36 -26 -36 -18 V6Z" fill="' + K("#4FA06A", "#9FACC7") + '"/><path d="M-48 -6 H-56 Q-60 -6 -60 -11 V-18" fill="none" stroke="' + K("#4FA06A", "#9FACC7") + '" stroke-width="5" stroke-linecap="round"/><path d="M-36 -10 H-30 Q-26 -10 -26 -15 V-22" fill="none" stroke="' + K("#4FA06A", "#9FACC7") + '" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M-30 14 Q-12 6 4 14Z" fill="' + K("#E9BB68", "#AEBAD2") + '"/><path d="M30 12 Q46 2 62 12Z" fill="' + K("#E9BB68", "#AEBAD2") + '"/>' +
        (g ? "" : camelAt(46, 2, 0.5) + '<circle cx="-28" cy="-52" r="9" fill="#FFD23F" opacity=".9"/>');
    } else if (n === 8) {
      o += iglooAt(-18, 4, 0.9).replace(/#F4F9FF/g, K("#F4F9FF", "#E6EBF5")).replace(/#5F82AC/g, K("#5F82AC", "#9FACC7")) + pineAt(30, 8, 38, K("#2F7A5C", "#9FACC7"), K("#3E9A74", "#AEBAD2")) + pineAt(-46, 8, 28, K("#2F7A5C", "#9FACC7"), K("#3E9A74", "#AEBAD2")) +
        (g ? "" : penguinAt(8, 10, 0.55) + penguinAt(52, 6, 0.45, true) + twinkle(-40, -44, 5, "#FFFFFF") + '<path d="M-46 -44 Q-20 -60 6 -46 T52 -50" fill="none" stroke="#7CF5C0" stroke-width="5" stroke-linecap="round" opacity=".7"/>');
    } else {
      o += '<ellipse cx="14" cy="-30" rx="46" ry="10" fill="none" stroke="' + K("#E6B5F5", "#9FACC7") + '" stroke-width="6" transform="rotate(-14 14 -30)"/><circle cx="14" cy="-30" r="24" fill="' + K("#FF9F5A", "#AEBAD2") + '"/><path d="M-6 -36 Q14 -28 34 -38" stroke="' + K("#FFC48A", "#C7D0E0") + '" stroke-width="4" fill="none"/>' +
        '<ellipse cx="-34" cy="2" rx="9" ry="3" fill="' + K("#A9A4C4", "#B9C3D8") + '"/><ellipse cx="38" cy="6" rx="8" ry="2.6" fill="' + K("#A9A4C4", "#B9C3D8") + '"/>' + (g ? "" : rocket(-32, -14, 0.7, -12)) + twinkle(-48, -42, 5, K("#FFE98A", "#C7D0E0"));
    }
    return o;
  }

  // the map of word islands (360 x 590): the ready islands are bright and open, the rest are grey and locked.
  // o = { known, total, title, ready: {1: true, 2: true}, stages: {1: {title, known, total, check}, 2: ...} }. Without stages, island 1 shows known and total.
  // check: true puts an orange "Quick check" tag next to "Open" (the group with class sw-isl-qc, data-s = the island, is its click target).
  // The group with class sw-isl-go (data-s = the island) is the click target.
  var POS = { 1: [84, 100], 2: [280, 150], 3: [84, 396], 4: [280, 466], 5: [84, 700], 6: [280, 790], 7: [84, 1030], 8: [280, 1250] };
  function islands(o) {
    var ready = o.ready || { 1: true },
      out = "";
    [1, 2, 3, 4, 5, 6, 7, 8].forEach(function (n) {
      var info = o.stages && o.stages[n] ? o.stages[n] : n === 1 ? { title: o.title || "First words", known: o.known || 0, total: o.total || 1 } : { title: "", known: 0, total: 1 },
        pct = Math.max(0, Math.min(1, info.known / (info.total || 1))),
        x = POS[n][0],
        y = POS[n][1],
        on = !!ready[n],
        label = on
          ? '<text x="' + (n % 2 ? 0 : -24) + '" y="90" text-anchor="middle" font-size="14" fill="#1E2A4A">Stage ' + n + " · " + esc(info.title) + "</text>" +
            '<rect x="-65" y="100" width="130" height="10" rx="5" fill="#FFFFFF"/><rect x="-65" y="100" width="' + Math.round(130 * pct) + '" height="10" rx="5" fill="#35B779"/>' +
            '<text x="0" y="128" text-anchor="middle" font-size="12" fill="#4A5878">' + info.known + " of " + info.total + " words known</text>" +
            '<rect x="' + (n % 2 ? 34 : -96) + '" y="-100" width="62" height="24" rx="12" fill="#6A48E8"/><text x="' + (n % 2 ? 65 : -65) + '" y="-83" text-anchor="middle" font-size="13" fill="#FFFFFF">Open</text>'
          : lock(52, -30) + '<text x="0" y="86" text-anchor="middle" font-size="14" fill="#6B7A99">Stage ' + n + '</text><rect x="-40" y="94" width="80" height="20" rx="10" fill="#FFFFFF"/><text x="0" y="108" text-anchor="middle" font-size="12" fill="#6B7A99">Coming soon</text>';
      var qx = n % 2 ? 102 : -28,
        tag = on && info.check
          ? '<g class="sw-isl-qc" data-s="' + n + '" tabindex="0" role="button" aria-label="Quick check, Stage ' + n + '"><rect x="' + qx + '" y="-100" width="106" height="24" rx="12" fill="#FF8A3D" stroke="#C4501F" stroke-width="2"/>' +
            '<path transform="translate(' + (qx + 15) + ',-88)" d="M2 -9L-6 2H-1L-3 9L6 -2H1Z" fill="#FFE066" stroke="#B26A00" stroke-width="1.2" stroke-linejoin="round"/>' +
            '<text x="' + (qx + 62) + '" y="-83" text-anchor="middle" font-size="12" fill="#FFFFFF">Quick check</text></g>'
          : "";
      if (on)
        out += '<g class="sw-isl-go" data-s="' + n + '" tabindex="0" role="button" aria-label="Open Stage ' + n + '"><rect x="' + (x - 70) + '" y="' + (y - 100) + '" width="140" height="240" fill="#FFFFFF" opacity="0"/><g transform="translate(' + x + "," + y + ')"><g class="sw-ibody">' + soft(islandArt(n, false)) + "</g>" + label + tag + "</g></g>";
      else out += '<g transform="translate(' + x + "," + y + ')">' + soft(islandArt(n, true)) + label + "</g>";
    });
    return '<svg class="sw-isvg" viewBox="0 0 360 1440" role="group" aria-label="Word islands">' +
      '<rect x="0" y="0" width="360" height="1440" rx="28" fill="#DFF1FF"/>' +
      '<g fill="#FFFFFF"><ellipse cx="44" cy="26" rx="26" ry="9"/><ellipse cx="60" cy="20" rx="14" ry="9"/><ellipse cx="52" cy="560" rx="24" ry="8"/><ellipse cx="66" cy="554" rx="12" ry="8"/><ellipse cx="318" cy="36" rx="20" ry="7"/><ellipse cx="300" cy="640" rx="24" ry="8"/><ellipse cx="316" cy="634" rx="12" ry="8"/><ellipse cx="60" cy="800" rx="24" ry="8"/><ellipse cx="74" cy="794" rx="12" ry="8"/><ellipse cx="44" cy="900" rx="24" ry="8"/><ellipse cx="58" cy="894" rx="12" ry="8"/><ellipse cx="320" cy="690" rx="20" ry="7"/><ellipse cx="318" cy="930" rx="24" ry="8"/><ellipse cx="332" cy="924" rx="12" ry="8"/><ellipse cx="40" cy="1170" rx="22" ry="7"/><ellipse cx="60" cy="1300" rx="24" ry="8"/><ellipse cx="74" cy="1294" rx="12" ry="8"/><ellipse cx="320" cy="1390" rx="22" ry="7"/><ellipse cx="334" cy="1384" rx="11" ry="7"/><ellipse cx="54" cy="1164" rx="11" ry="7"/><ellipse cx="300" cy="1120" rx="20" ry="7"/></g>' +
      '<path d="M84 100 C150 70 200 110 280 150 C330 225 110 300 84 396 C130 450 200 410 280 466 C300 540 130 610 84 700 C120 770 240 720 280 790 C300 860 120 940 84 1030 C150 1090 330 1130 280 1250" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 15"/>' + out + "</svg>";
  }

  root.SWScenery = { hero: hero, game: game, book: book, star: star, islands: islands, banner: bannerArt, unitArt: unitArt, unitTheme: unitTheme, chest: chest };
  if (typeof module !== "undefined" && module.exports) module.exports = root.SWScenery;
})(typeof window !== "undefined" ? window : this);

