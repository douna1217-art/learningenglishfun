/* The child's pet in a practice game, and the pet prizes a game sells (the Grade 2 games; Potion Lab has its own copy of this).
   In the site's reader frame the home page's pet is used through window.parent.__petBridge; a game opened on its own reads (and dresses)
   the saved pet in localStorage "lef_pet_v1". Needs pet-art.js (petSvg, PETS, ITEMS) and game-prizes.js loaded before it.

   MathPet.get() -> {type, name, eq, hunger} | null       MathPet.name(fallback)       MathPet.pic(pet, mood, size) -> svg html
   MathPet.wear(id) -> true when now worn                  MathPet.feed(n)              MathPet.wearing(id)
   MathPet.shop(game) -> the engine's shop list and hooks (prizes bought with the game's coins are worn at once)
   MathPet.hero(game, line) -> html for the map's banner: the pet (or a word to adopt one)
   Written for old Android WebViews: no optional chaining, no spread, no Object.assign. */
(function (root) {
  "use strict";
  function bridge() { try { if (root.parent && root.parent !== root && root.parent.__petBridge) return root.parent.__petBridge; } catch (e) {} return null; }
  function get() {
    var b = bridge(), p = null;
    if (b) { try { p = b.pet(); } catch (e) {} }
    else { try { var s0 = JSON.parse(root.localStorage.getItem("lef_pet_v1")); if (s0 && s0.type) { if (s0.type === "lizard") s0.type = "dino"; p = { type: s0.type, name: s0.name, eq: s0.eq || {}, hunger: s0.hunger }; } } catch (e) {} }
    if (!p || !p.type || typeof root.petSvg !== "function" || !root.PETS || !root.PETS[p.type]) return null;
    p.name = p.name || "Your pet"; p.eq = p.eq || {}; return p;
  }
  function pic(p, mood, size) { try { return root.petSvg(p.type, mood, p.eq, "icon", "width:" + size + "px;height:" + size + "px;display:block"); } catch (e) { return ""; } }
  function wear(id) {
    var b = bridge();
    if (b) { try { return b.wear(id); } catch (e) { return false; } }
    try { var s0 = JSON.parse(root.localStorage.getItem("lef_pet_v1")), it = root.ITEMS && root.ITEMS[id]; if (!s0 || !s0.type || !it) return false;
      s0.eq = s0.eq || {}; if (s0.eq[it.slot] === id) delete s0.eq[it.slot]; else s0.eq[it.slot] = id; root.localStorage.setItem("lef_pet_v1", JSON.stringify(s0)); return s0.eq[it.slot] === id; } catch (e) { return false; }
  }
  function feed(n) {
    var b = bridge();
    if (b) { try { b.feed(n); } catch (e) {} return; }
    try { var s0 = JSON.parse(root.localStorage.getItem("lef_pet_v1")); if (s0 && s0.type) { s0.hunger = Math.min(100, (+s0.hunger || 0) + n); root.localStorage.setItem("lef_pet_v1", JSON.stringify(s0)); } } catch (e) {}
  }
  function wearing(id) { var p = get(), it = root.ITEMS && root.ITEMS[id]; return !!(p && it && p.eq[it.slot] === id); }
  function shop(game) {
    var list = (root.GamePrizes ? root.GamePrizes.forGame(game) : []).filter(function (p) { return root.ITEMS && root.ITEMS[p.id]; });
    return {
      shop: list.map(function (p) { return { id: p.id, n: p.name, p: p.price, e: "🎁", icon: '<span style="display:block;width:64px;height:44px;margin:0 auto">' + root.GamePrizes.thumb(p.id) + "</span>" }; }),
      isOwned: function (it) { return root.GamePrizes && root.GamePrizes.won(it.id); },
      onBuy: function (it) { root.GamePrizes.win(it.id); if (get()) wear(it.id); },
      useOwned: function (it) { if (!get()) { root.alert("Adopt a pet on the home page first, then it can wear this! 先在首页领养宠物，它才能穿戴。"); return; } wear(it.id); },
      ownedText: function (it) { return wearing(it.id) ? "✓ Wearing" : "Tap to wear"; }
    };
  }
  function hero(fallback, line) {
    var p = get();
    if (!p) return '<div style="font-size:3.2rem;line-height:1">' + fallback + '</div><div style="font-size:.9rem;font-weight:900;margin-top:4px;color:#fff">Adopt a pet on the home page and it will come and help!<br>在首页领养宠物，它就会来帮忙！</div>';
    return '<div style="display:flex;justify-content:center">' + pic(p, "happy", 110) + '</div><div style="font-size:.95rem;font-weight:900;color:#fff">' + line(p.name) + "</div>";
  }
  root.MathPet = { get: get, name: function (fb) { var p = get(); return p ? p.name : fb; }, pic: pic, wear: wear, feed: feed, wearing: wearing, shop: shop, hero: hero };
})(window);
