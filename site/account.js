// Parent account and child profiles (optional, needs Supabase + the SQL in
// supabase/parent_accounts.sql).
//
// What this does:
// - After a parent signs in (email link or 6-digit code, see sync.js):
//     1. first time: agree to the Terms and the Privacy Policy, including that data
//        is stored outside mainland China (the time and the version are recorded);
//     2. add a child: nickname + picture + optional grade (no real name, no birthday);
//     3. up to 2 children per account. With 2 children a "Who is reading?" screen
//        lets the right one in; the header has a switcher.
// - Each child has their own pet, stars, book progress, history and Smart Review
//   records. state-sync.js stores them under the key "<child id>:<name>".
// - Switching children: first make sure the current child's progress is saved to
//   the cloud (state-sync flush); only then clear this device and load the other
//   child. If saving fails (offline), the switch is refused so nothing is lost.
// - Progress this device already had before anybody signed in becomes the first
//   child's. Deleting a child deletes all of that child's progress in the cloud.
// - Without a signed-in parent nothing here runs.
//
// 中文说明：家长登录后：第一次同意条款和隐私政策（记录版本和时间，包括数据存放在中国大陆以外），
// 然后添加孩子（只要昵称、头像、可选年级），每个账号最多 2 个孩子。每个孩子的宠物、星星、进度、
// 复习记录各自独立。切换孩子前会先把当前孩子的进度存到云端，存不上就不切换，保证不丢。
(function (root) {
  "use strict";

  var cfg = root.SUPABASE_CONFIG;
  var configured =
    root.supabase &&
    cfg &&
    cfg.url &&
    cfg.anonKey &&
    cfg.url.indexOf("YOUR-PROJECT") === -1 &&
    cfg.anonKey.indexOf("YOUR-ANON-KEY") === -1;
  if (!configured || !root.localStorage || !root.document) return;

  var sb = root.__lesSupabaseClient || (root.__lesSupabaseClient = root.supabase.createClient(cfg.url, cfg.anonKey));
  var ls = root.localStorage;
  var doc = root.document;

  var TERMS_VERSION = "2026-10-draft-1";
  var MAX_CHILDREN = 2;
  var PROFILE_KEY = "les_profile_v1"; // {uid, id}: which child is active on this device
  var META_KEY = "les_state_sync_meta_v1"; // written by state-sync.js: whose data is on this device
  var AVATARS = [
    { id: "cat", emoji: "🐱", en: "Cat", zh: "猫", bg: "#fde7cf" },
    { id: "dog", emoji: "🐶", en: "Dog", zh: "狗", bg: "#dbeafe" },
    { id: "monkey", emoji: "🐵", en: "Monkey", zh: "猴", bg: "#fef3c7" },
    { id: "bunny", emoji: "🐰", en: "Bunny", zh: "兔", bg: "#fce7f3" },
    { id: "dino", emoji: "🦖", en: "Dino", zh: "恐龙", bg: "#dcfce7" },
    { id: "duck", emoji: "🦆", en: "Duck", zh: "小鸭", bg: "#fef9c3" },
    { id: "penguin", emoji: "🐧", en: "Penguin", zh: "企鹅", bg: "#e0f2fe" },
    { id: "panda", emoji: "🐼", en: "Panda", zh: "大熊猫", bg: "#f1f5f9" },
  ];
  var GRADES = ["K", "1", "2", "3", "4", "5", "6"];

  var st = { session: null, loaded: false, error: false, consent: false, profiles: [], active: null, busy: false };
  var starting = null;

  // ------------------------------------------------------------ helpers
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function avatarOf(id) {
    if (id === "lizard") id = "dino"; // the lizard was replaced by the dino; profiles made earlier still say lizard
    for (var i = 0; i < AVATARS.length; i++) if (AVATARS[i].id === id) return AVATARS[i];
    return AVATARS[0];
  }
  function stateSync() {
    return root.__lesStateSync || null;
  }
  function uid() {
    return st.session ? st.session.user.id : null;
  }
  function readJSON(k) {
    try {
      return JSON.parse(ls.getItem(k) || "null");
    } catch (e) {
      return null;
    }
  }
  function writeProfile(id) {
    try {
      ls.setItem(PROFILE_KEY, JSON.stringify({ uid: uid(), id: id }));
    } catch (e) {}
  }
  function clearProfile() {
    try {
      ls.removeItem(PROFILE_KEY);
    } catch (e) {}
  }
  // whose progress is on this device right now (null = nobody's yet)
  function localOwner() {
    var m = readJSON(META_KEY);
    return m && m.uid === uid() && m.pid ? m.pid : null;
  }
  function reload() {
    try {
      root.location.reload();
    } catch (e) {}
  }
  function byId(id) {
    for (var i = 0; i < st.profiles.length; i++) if (st.profiles[i].id === id) return st.profiles[i];
    return null;
  }
  function friendlyError(err) {
    var m = (err && err.message) || "";
    if (/at most 2 children/i.test(m)) return "Up to 2 children per account. 每个账号最多 2 个孩子。";
    return "Couldn't save. Check your connection and try again. 没保存成功，请检查网络后重试。";
  }

  // ------------------------------------------------------------ styles
  function injectStyle() {
    if (doc.getElementById("acctStyle")) return;
    var s = doc.createElement("style");
    s.id = "acctStyle";
    s.textContent =
      ".ac-back{position:fixed;inset:0;z-index:100000;background:rgba(30,42,74,.45);display:flex;align-items:center;justify-content:center;padding:14px;font-family:inherit;color:#1E2A4A}" +
      ".ac-card{box-sizing:border-box;width:100%;max-width:420px;max-height:92vh;overflow:auto;background:#fff;border-radius:20px;padding:20px 20px 18px;box-shadow:0 20px 50px rgba(30,42,74,.3);position:relative}" +
      ".ac-h{margin:0 0 2px;font-size:20px;font-weight:800;line-height:1.25}" +
      ".ac-hz{margin:0 0 14px;font-size:13px;font-weight:700;color:#4A5878}" +
      ".ac-p{margin:0 0 10px;font-size:14px;line-height:1.5}.ac-p small{display:block;font-size:12px;color:#4A5878;font-weight:600}" +
      ".ac-x{position:absolute;top:10px;right:12px;border:0;background:none;font-size:22px;line-height:1;color:#4A5878;cursor:pointer;padding:4px}" +
      ".ac-chk{display:flex;gap:10px;align-items:flex-start;margin:0 0 12px;font-size:13px;line-height:1.45;cursor:pointer}" +
      ".ac-chk input{flex:none;width:20px;height:20px;margin:1px 0 0;accent-color:#315f47}" +
      ".ac-chk small{display:block;font-size:12px;color:#4A5878;font-weight:600}" +
      ".ac-chk a,.ac-link{color:#315f47;font-weight:800;text-decoration:underline;background:none;border:0;padding:0;font:inherit;cursor:pointer}" +
      ".ac-lab{display:block;margin:12px 0 5px;font-size:12px;font-weight:800;color:#4A5878}" +
      ".ac-in{box-sizing:border-box;width:100%;border:1px solid #dfe8e1;border-radius:12px;padding:11px 12px;font:inherit;font-size:15px;color:#1E2A4A;background:#fff}" +
      ".ac-in:focus{outline:3px solid rgba(49,95,71,.3);border-color:#315f47}" +
      ".ac-av{display:flex;gap:8px;flex-wrap:wrap}" +
      ".ac-avb{width:48px;height:48px;border-radius:50%;border:3px solid transparent;font-size:24px;line-height:1;cursor:pointer;display:grid;place-items:center;padding:0}" +
      ".ac-avb[aria-pressed=true]{border-color:#315f47}" +
      ".ac-chips{display:flex;gap:6px;flex-wrap:wrap}" +
      ".ac-chip{border:1px solid #dfe8e1;background:#fff;border-radius:999px;padding:6px 13px;font:inherit;font-size:13px;font-weight:700;color:#1E2A4A;cursor:pointer}" +
      ".ac-chip[aria-pressed=true]{background:#e7f1ea;border-color:#315f47;color:#1d4631}" +
      ".ac-go{display:block;width:100%;margin-top:16px;border:0;border-radius:14px;padding:11px 14px;background:#315f47;color:#fff;font:inherit;line-height:1.2;cursor:pointer}" +
      ".ac-go b{display:block;font-size:15px;font-weight:800}.ac-go s{display:block;text-decoration:none;font-size:12px;font-weight:700;opacity:.92}" +
      ".ac-go[disabled]{opacity:.5;cursor:default}" +
      ".ac-go.ac-danger{background:#b23b34}" +
      ".ac-sec{display:block;width:100%;margin-top:8px;border:1px solid #dfe8e1;border-radius:14px;padding:9px 14px;background:#fff;color:#1E2A4A;font:inherit;line-height:1.2;cursor:pointer}" +
      ".ac-sec b{display:block;font-size:14px;font-weight:800}.ac-sec s{display:block;text-decoration:none;font-size:12px;font-weight:700;color:#4A5878}" +
      ".ac-msg{margin:10px 0 0;font-size:13px;font-weight:700;color:#b23b34;min-height:1em}" +
      ".ac-kid{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;margin:0 0 9px;border:1px solid #dfe8e1;border-radius:16px;padding:10px 12px;background:#fff;font:inherit;color:inherit;text-align:left;cursor:pointer}" +
      ".ac-kid:hover{border-color:#315f47}" +
      ".ac-face{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:24px;line-height:1}" +
      ".ac-kid b{display:block;font-size:16px;font-weight:800}.ac-kid small{display:block;font-size:12px;color:#4A5878;font-weight:700}" +
      ".ac-row{display:flex;align-items:center;gap:12px;margin:0 0 9px;border:1px solid #dfe8e1;border-radius:16px;padding:10px 12px}" +
      ".ac-row .ac-grow{flex:1;min-width:0}.ac-row b{display:block;font-size:15px;font-weight:800}.ac-row small{display:block;font-size:12px;color:#4A5878;font-weight:700}" +
      ".ac-del{flex:none;border:1px solid #e7c4c1;background:#fff;color:#b23b34;border-radius:10px;padding:6px 10px;font:inherit;font-size:12px;font-weight:800;cursor:pointer}" +
      ".ac-note{margin:12px 0 0;font-size:12px;line-height:1.45;color:#4A5878}" +
      "#syncBox.sync2 .ac-me{position:relative}" +
      "#syncBox.sync2 .ac-face.ac-sm{width:30px;height:30px;font-size:17px}" +
      "#syncBox.sync2 .ac-menu{position:absolute;right:0;top:calc(100% + 8px);z-index:30;box-sizing:border-box;width:290px;max-width:calc(100vw - 28px);padding:8px;background:#fff;border:1px solid var(--line,#dfe8e1);border-radius:15px;box-shadow:0 12px 30px rgba(30,42,74,.14);white-space:normal;font-weight:700}" +
      "#syncBox.sync2 .ac-menu.sy-l{right:auto;left:0}" +
      "#syncBox.sync2 .ac-menu[hidden]{display:none}" +
      ".ac-mi{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;border:0;background:none;border-radius:10px;padding:8px 9px;font:inherit;font-size:14px;color:#1E2A4A;text-align:left;cursor:pointer}" +
      ".ac-mi:hover,.ac-mi.on{background:#e7f1ea}.ac-mi small{display:block;font-size:11px;color:#4A5878;font-weight:700}" +
      ".ac-mi .ac-face{width:30px;height:30px;font-size:17px}" +
      ".ac-hr{height:1px;background:#dfe8e1;margin:6px 4px}" +
      "@media(max-width:620px){#syncBox.sync2 .ac-menu,#syncBox.sync2 .ac-menu.sy-l{position:static;width:auto;max-width:none;margin-top:10px;padding:6px 0 0;border:0;border-top:1px solid var(--line,#dfe8e1);border-radius:0;box-shadow:none}}";
    doc.head.appendChild(s);
  }

  function toast(text) {
    injectStyle();
    var t = doc.createElement("div");
    t.setAttribute("role", "status");
    t.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:100001;max-width:90vw;background:#1E2A4A;color:#fff;border-radius:14px;padding:11px 16px;font:700 13px/1.4 inherit;box-shadow:0 10px 30px rgba(30,42,74,.3)";
    t.textContent = text;
    doc.body.appendChild(t);
    setTimeout(function () {
      if (t.parentNode) t.parentNode.removeChild(t);
    }, 7000);
  }

  // ------------------------------------------------------------ modal shell
  var modalEl = null;
  var modalOnClose = null;
  function closeModal() {
    if (modalEl && modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
    modalEl = null;
    var f = modalOnClose;
    modalOnClose = null;
    if (f) f();
  }
  // dismissible=false: the screen has to be completed (or the parent signs out)
  function openModal(html, dismissible, labelId) {
    injectStyle();
    if (modalEl && modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
    modalEl = doc.createElement("div");
    modalEl.className = "ac-back";
    modalEl.innerHTML =
      '<div class="ac-card" role="dialog" aria-modal="true" aria-labelledby="' + labelId + '">' +
      (dismissible ? '<button type="button" class="ac-x" id="acClose" aria-label="Close 关闭">×</button>' : "") +
      html +
      "</div>";
    doc.body.appendChild(modalEl);
    if (dismissible) {
      modalEl.addEventListener("click", function (e) {
        if (e.target === modalEl) closeModal();
      });
      var x = doc.getElementById("acClose");
      if (x) x.onclick = closeModal;
    }
    modalEl.__dismissible = !!dismissible;
    return modalEl;
  }
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalEl && modalEl.__dismissible) closeModal();
  });
  function setMsg(text) {
    var m = doc.getElementById("acMsg");
    if (m) m.textContent = text || "";
  }
  function busy(on, btnId) {
    st.busy = on;
    var b = btnId && doc.getElementById(btnId);
    if (b) b.disabled = !!on;
  }

  // ------------------------------------------------------------ screens
  function faceHtml(avatarId, cls) {
    var a = avatarOf(avatarId);
    return '<span class="ac-face ' + (cls || "") + '" style="background:' + a.bg + '" aria-hidden="true">' + a.emoji + "</span>";
  }

  function showWelcome() {
    var el = openModal(
      '<h2 class="ac-h" id="acT">Welcome<br><span class="ac-hz" style="display:block;margin:0">欢迎</span></h2>' +
        '<p class="ac-p">Signed in as <b>' + esc(st.session.user.email || "") + '</b><small>已登录：' + esc(st.session.user.email || "") + "</small></p>" +
        '<label class="ac-chk"><input type="checkbox" id="acC1"><span>I am a parent or guardian, and I agree to the <a href="terms.html" target="_blank" rel="noopener">Terms</a> and the <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.<small>我是家长或监护人，同意《用户条款》和《隐私政策》。</small></span></label>' +
        '<label class="ac-chk"><input type="checkbox" id="acC2"><span>I understand that my and my child\'s information is stored on servers outside mainland China (United States).<small>我理解我和孩子的信息存放在中国大陆以外（美国）的服务器上。</small></span></label>' +
        '<button type="button" class="ac-go" id="acGo" disabled><b>Continue</b><s>继续</s></button>' +
        '<p class="ac-msg" id="acMsg" role="status"></p>' +
        '<button type="button" class="ac-link" id="acOut" style="margin-top:6px;font-size:13px">Sign out 退出</button>',
      false,
      "acT"
    );
    var c1 = doc.getElementById("acC1"),
      c2 = doc.getElementById("acC2"),
      go = doc.getElementById("acGo");
    function sync() {
      go.disabled = !(c1.checked && c2.checked) || st.busy;
    }
    c1.onchange = c2.onchange = sync;
    doc.getElementById("acOut").onclick = signOut;
    go.onclick = async function () {
      busy(true, "acGo");
      setMsg("");
      var r = await sb.from("parent_accounts").upsert({ user_id: uid(), terms_version: TERMS_VERSION, overseas_storage_ack: true }, { onConflict: "user_id" });
      busy(false);
      if (r.error) {
        sync();
        setMsg(friendlyError(r.error));
        return;
      }
      st.consent = true;
      route();
    };
    var f = c1;
    try {
      f.focus({ preventScroll: true });
    } catch (e) {}
    return el;
  }

  function avatarPicker(selected) {
    return (
      '<div class="ac-av" role="group" aria-label="Picture 头像">' +
      AVATARS.map(function (a) {
        return '<button type="button" class="ac-avb" data-av="' + a.id + '" style="background:' + a.bg + '" aria-pressed="' + (a.id === selected ? "true" : "false") + '" aria-label="' + a.en + " " + a.zh + '">' + a.emoji + "</button>";
      }).join("") +
      "</div>"
    );
  }
  function gradeChips(selected) {
    return (
      '<div class="ac-chips" role="group" aria-label="Grade 年级">' +
      GRADES.map(function (g) {
        return '<button type="button" class="ac-chip" data-gr="' + g + '" aria-pressed="' + (g === selected ? "true" : "false") + '">' + g + "</button>";
      }).join("") +
      "</div>"
    );
  }

  // first child (cannot be skipped) or an extra child (can be cancelled)
  function showAddChild(canCancel) {
    var n = st.profiles.length;
    var el = openModal(
      '<h2 class="ac-h" id="acT">Add your child</h2><p class="ac-hz">添加孩子' + (n ? " (" + n + " of " + MAX_CHILDREN + " used)" : "") + "</p>" +
        '<label class="ac-lab" for="acNick">Nickname (not a real name) 昵称（不要用真名）</label>' +
        '<input class="ac-in" id="acNick" maxlength="20" autocomplete="off" placeholder="Mochi">' +
        '<span class="ac-lab">Pick a picture 选一个头像</span>' + avatarPicker("cat") +
        '<span class="ac-lab">Grade (optional) 年级（选填）</span>' + gradeChips(null) +
        '<button type="button" class="ac-go" id="acGo"><b>Add child</b><s>添加孩子</s></button>' +
        '<p class="ac-msg" id="acMsg" role="status"></p>' +
        '<p class="ac-note">We only keep a nickname, a picture and learning progress. Please do not use your child\'s real name.<br>我们只保存昵称、头像和学习进度，请不要使用孩子的真实姓名。</p>',
      !!canCancel,
      "acT"
    );
    var av = "cat",
      gr = null;
    el.querySelectorAll("[data-av]").forEach(function (b) {
      b.onclick = function () {
        av = b.getAttribute("data-av");
        el.querySelectorAll("[data-av]").forEach(function (x) {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
      };
    });
    el.querySelectorAll("[data-gr]").forEach(function (b) {
      b.onclick = function () {
        var v = b.getAttribute("data-gr");
        gr = gr === v ? null : v; // tap again to clear
        el.querySelectorAll("[data-gr]").forEach(function (x) {
          x.setAttribute("aria-pressed", x.getAttribute("data-gr") === gr ? "true" : "false");
        });
      };
    });
    doc.getElementById("acGo").onclick = async function () {
      var nick = doc.getElementById("acNick").value.replace(/\s+/g, " ").trim();
      if (!nick) {
        setMsg("Enter a nickname. 请输入昵称。");
        return;
      }
      busy(true, "acGo");
      setMsg("");
      var r = await addChild({ nickname: nick, avatar: av, grade: gr });
      busy(false, "acGo");
      if (!r.ok) setMsg(r.message);
    };
    try {
      doc.getElementById("acNick").focus({ preventScroll: true });
    } catch (e) {}
    return el;
  }

  function showPicker() {
    var kids = st.profiles
      .map(function (p) {
        return (
          '<button type="button" class="ac-kid" data-pick="' + esc(p.id) + '">' + faceHtml(p.avatar) +
          "<span><b>" + esc(p.nickname) + "</b><small>" + (p.grade ? "Grade " + esc(p.grade) : "&nbsp;") + "</small></span></button>"
        );
      })
      .join("");
    var el = openModal(
      '<h2 class="ac-h" id="acT">Who is reading?</h2><p class="ac-hz">谁在读书？</p>' + kids +
        '<p class="ac-msg" id="acMsg" role="status"></p>' +
        '<button type="button" class="ac-link" id="acOut" style="margin-top:6px;font-size:13px">Sign out 退出</button>',
      false,
      "acT"
    );
    el.querySelectorAll("[data-pick]").forEach(function (b) {
      b.onclick = async function () {
        setMsg("Saving… 正在保存…");
        var r = await switchTo(b.getAttribute("data-pick"));
        if (!r.ok) setMsg(r.message);
        else route();
      };
    });
    doc.getElementById("acOut").onclick = signOut;
  }

  function showParent() {
    var email = esc(st.session.user.email || "");
    var rows = st.profiles
      .map(function (p) {
        return (
          '<div class="ac-row">' + faceHtml(p.avatar) + '<div class="ac-grow"><b>' + esc(p.nickname) + "</b><small>" + (p.grade ? "Grade " + esc(p.grade) : "&nbsp;") + (p.id === st.active ? " · reading now 正在读" : "") + "</small></div>" +
          '<button type="button" class="ac-del" data-del="' + esc(p.id) + '">Delete 删除</button></div>'
        );
      })
      .join("");
    var el = openModal(
      '<h2 class="ac-h" id="acT">Parent area</h2><p class="ac-hz">家长区</p>' +
        '<p class="ac-p">' + email + "<small>Terms accepted 已同意条款：" + esc(TERMS_VERSION) + "</small></p>" +
        '<span class="ac-lab">Children 孩子 (' + st.profiles.length + " of " + MAX_CHILDREN + ")</span>" + rows +
        (st.profiles.length < MAX_CHILDREN ? '<button type="button" class="ac-sec" id="acAdd"><b>Add a child</b><s>添加孩子</s></button>' : "") +
        '<p class="ac-note"><a class="ac-link" href="terms.html" target="_blank" rel="noopener">Terms 条款</a> &nbsp;·&nbsp; <a class="ac-link" href="privacy.html" target="_blank" rel="noopener">Privacy 隐私</a></p>' +
        '<button type="button" class="ac-sec" id="acOut"><b>Sign out</b><s>退出</s></button>',
      true,
      "acT"
    );
    var add = doc.getElementById("acAdd");
    if (add) add.onclick = function () { showAddChild(true); };
    doc.getElementById("acOut").onclick = signOut;
    el.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () { showConfirmDelete(b.getAttribute("data-del")); };
    });
  }

  function showConfirmDelete(id) {
    var p = byId(id);
    if (!p) return showParent();
    openModal(
      '<h2 class="ac-h" id="acT">Delete ' + esc(p.nickname) + "?</h2><p class=\"ac-hz\">删除 " + esc(p.nickname) + "？</p>" +
        '<p class="ac-p">All of their progress will be deleted and cannot be restored.<small>他或她的所有进度都会被删除，无法恢复。</small></p>' +
        '<label class="ac-lab" for="acConf">Type the nickname to confirm 输入昵称以确认</label>' +
        '<input class="ac-in" id="acConf" autocomplete="off" placeholder="' + esc(p.nickname) + '">' +
        '<button type="button" class="ac-go ac-danger" id="acGo" disabled><b>Delete</b><s>删除</s></button>' +
        '<button type="button" class="ac-sec" id="acCancel"><b>Cancel</b><s>取消</s></button>' +
        '<p class="ac-msg" id="acMsg" role="status"></p>',
      true,
      "acT"
    );
    var inp = doc.getElementById("acConf"),
      go = doc.getElementById("acGo");
    inp.oninput = function () {
      go.disabled = inp.value.trim().toLowerCase() !== p.nickname.toLowerCase() || st.busy;
    };
    doc.getElementById("acCancel").onclick = showParent;
    go.onclick = async function () {
      busy(true, "acGo");
      var r = await deleteChild(id);
      busy(false);
      if (!r.ok) {
        go.disabled = false;
        setMsg(r.message);
      }
    };
  }

  function showLoadError() {
    var el = openModal(
      '<h2 class="ac-h" id="acT">Couldn\'t load your account</h2><p class="ac-hz">没能加载你的账号</p>' +
        '<p class="ac-p">Check your connection and try again.<small>请检查网络后重试。</small></p>' +
        '<button type="button" class="ac-go" id="acGo"><b>Try again</b><s>重试</s></button>' +
        '<button type="button" class="ac-link" id="acOut" style="margin-top:10px;font-size:13px">Sign out 退出</button>',
      true, // the rest of the site keeps working; "Finish setup" in the header opens this again
      "acT"
    );
    doc.getElementById("acGo").onclick = function () { start(true); };
    doc.getElementById("acOut").onclick = signOut;
    return el;
  }

  // ------------------------------------------------------------ header (the sign-in box when signed in)
  var menuBound = false;
  function closeMenu() {
    var m = doc.getElementById("acMenu"),
      t = doc.getElementById("acMe");
    if (m && !m.hidden) {
      m.hidden = true;
      if (t) t.setAttribute("aria-expanded", "false");
    }
  }
  function renderHeader(box, session) {
    if (!box) return;
    injectStyle();
    var email = esc((session || st.session).user.email || "Signed in");
    var cur = byId(st.active);
    var label, sub, face;
    if (!st.loaded) {
      label = "Loading…";
      sub = email;
      face = '<span class="ac-face ac-sm" style="background:#e7f1ea" aria-hidden="true">☁</span>';
    } else if (!st.consent || !st.profiles.length || !cur) {
      label = "Finish setup";
      sub = "完成设置 · " + email;
      face = '<span class="ac-face ac-sm" style="background:#fef3c7" aria-hidden="true">✨</span>';
    } else {
      label = esc(cur.nickname);
      sub = email + " · 已登录";
      face = faceHtml(cur.avatar, "ac-sm");
    }
    var items = st.profiles
      .map(function (p) {
        return (
          '<button type="button" class="ac-mi' + (p.id === st.active ? " on" : "") + '" data-sw="' + esc(p.id) + '">' + faceHtml(p.avatar) +
          "<span>" + esc(p.nickname) + (p.id === st.active ? "<small>reading now 正在读</small>" : "") + "</span></button>"
        );
      })
      .join("");
    box.classList.add("sync2");
    box.innerHTML =
      '<div class="ac-me">' +
      '<button type="button" class="sy-pill" id="acMe" aria-expanded="false" aria-controls="acMenu">' + face +
      '<span><span class="sy-t">' + label + '</span><span class="sy-c">' + sub + "</span></span>" +
      '<svg class="sy-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
      '<div class="ac-menu" id="acMenu" hidden>' + items +
      (st.loaded && st.consent && st.profiles.length && st.profiles.length < MAX_CHILDREN ? '<button type="button" class="ac-mi" id="acMAdd"><span>Add a child 添加孩子<small>' + st.profiles.length + " of " + MAX_CHILDREN + " used</small></span></button>" : "") +
      (items ? '<div class="ac-hr"></div>' : "") +
      '<button type="button" class="ac-mi" id="acMParent"><span>Parent area 家长区</span></button>' +
      '<button type="button" class="ac-mi" id="acMOut"><span>Sign out 退出</span></button>' +
      '<p class="ac-msg" id="acMenuMsg" role="status" style="margin:4px 9px 2px"></p></div></div>';

    var me = doc.getElementById("acMe"),
      menu = doc.getElementById("acMenu");
    me.onclick = function () {
      if (!st.loaded || !st.consent || !st.profiles.length || !cur) {
        route(); // "Finish setup": show whatever screen is still needed
        return;
      }
      if (!menu.hidden) return closeMenu();
      var r = box.getBoundingClientRect();
      menu.className = "ac-menu" + (r.right < 304 ? " sy-l" : "");
      menu.hidden = false;
      me.setAttribute("aria-expanded", "true");
    };
    box.querySelectorAll("[data-sw]").forEach(function (b) {
      b.onclick = async function () {
        var id = b.getAttribute("data-sw");
        if (id === st.active) return closeMenu();
        var m = doc.getElementById("acMenuMsg");
        if (m) m.textContent = "Saving… 正在保存…";
        var r = await switchTo(id);
        if (!r.ok && m) m.textContent = r.message;
        else closeMenu();
      };
    });
    var a = doc.getElementById("acMAdd");
    if (a) a.onclick = function () { closeMenu(); showAddChild(true); };
    doc.getElementById("acMParent").onclick = function () { closeMenu(); showParent(); };
    doc.getElementById("acMOut").onclick = signOut;
    if (!menuBound) {
      menuBound = true;
      doc.addEventListener("click", function (e) {
        var bx = doc.getElementById("syncBox");
        if (bx && !bx.contains(e.target)) closeMenu();
      });
      doc.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
      });
    }
  }
  function refreshHeader() {
    var box = doc.getElementById("syncBox");
    if (box && st.session) renderHeader(box, st.session);
  }

  // ------------------------------------------------------------ actions
  async function load() {
    var u = uid();
    st.loaded = false;
    st.error = false;
    var res = await Promise.all([
      sb.from("parent_accounts").select("terms_version").eq("user_id", u).maybeSingle(),
      sb.from("profiles").select("id,nickname,avatar,grade,created_at").eq("parent_id", u).order("created_at", { ascending: true }),
    ]);
    if (res[0].error || res[1].error) {
      st.error = true;
      return;
    }
    st.consent = !!res[0].data;
    st.profiles = res[1].data || [];
    // the child this device was set to may have been deleted on another device:
    // their leftover data must not be uploaded or shown to the next child
    var local = readJSON(PROFILE_KEY);
    var owner = localOwner();
    var gone = (local && local.uid === u && local.id && !byId(local.id)) || (owner && !byId(owner));
    if (gone && stateSync()) {
      stateSync().clearLocal();
      clearProfile();
      local = null;
    }
    st.active = local && local.uid === u && byId(local.id) ? local.id : null;
    st.loaded = true;
  }

  // Make a child the active one on this device. If another child's progress is
  // on the device it is saved to the cloud first; if that fails, nothing changes.
  async function switchTo(id) {
    var sync = stateSync();
    var cur = readJSON(PROFILE_KEY);
    var owner = localOwner() || (cur && cur.uid === uid() && cur.id ? cur.id : null);
    if (owner && owner !== id && sync) {
      var saved = await sync.flush();
      if (!saved) {
        return { ok: false, message: "Couldn't save the current progress. Check your connection and try again. 当前进度没保存成功，请检查网络后再试。" };
      }
      sync.clearLocal();
      writeProfile(id);
      st.active = id;
      reload();
      return { ok: true, reloading: true };
    }
    // nobody's data is on the device, or it is already this child's: progress this
    // device already had becomes this child's
    writeProfile(id);
    st.active = id;
    if (sync) sync.syncNow();
    return { ok: true };
  }

  async function addChild(d) {
    if (st.profiles.length >= MAX_CHILDREN) return { ok: false, message: friendlyError({ message: "at most 2 children" }) };
    var r = await sb
      .from("profiles")
      .insert({ parent_id: uid(), nickname: d.nickname, avatar: d.avatar, grade: d.grade || null })
      .select("id,nickname,avatar,grade,created_at")
      .single();
    if (r.error || !r.data) return { ok: false, message: friendlyError(r.error) };
    st.profiles.push(r.data);
    if (st.profiles.length === 1) {
      try {
        await sb.rpc("adopt_legacy_state", { p_profile: r.data.id }); // old account-level progress -> this child
      } catch (e) {}
    }
    var s = await switchTo(r.data.id);
    if (!s.ok) {
      // the child exists; they just are not switched to yet
      closeModal();
      refreshHeader();
      toast("Child added. To switch, " + s.message);
      return { ok: true };
    }
    if (!s.reloading) route();
    return { ok: true };
  }

  async function deleteChild(id) {
    var r = await sb.from("profiles").delete().eq("id", id).eq("parent_id", uid());
    if (r.error) return { ok: false, message: friendlyError(r.error) };
    var wasHere = st.active === id || localOwner() === id;
    st.profiles = st.profiles.filter(function (p) {
      return p.id !== id;
    });
    if (wasHere) {
      // the page still shows the deleted child's pet and stars: wipe the device and start fresh
      var sync = stateSync();
      if (sync) sync.clearLocal();
      clearProfile();
      st.active = null;
      reload();
      return { ok: true };
    }
    showParent();
    refreshHeader();
    return { ok: true };
  }

  async function signOut() {
    var sync = stateSync();
    if (sync) {
      try {
        await sync.flush(); // best effort; whatever is not saved stays on this device
      } catch (e) {}
    }
    try {
      await sb.auth.signOut();
    } catch (e) {}
  }

  // ------------------------------------------------------------ routing
  function route() {
    if (!st.session) return;
    if (st.error) {
      showLoadError();
      refreshHeader();
      return;
    }
    if (!st.loaded) return;
    if (!st.consent) showWelcome();
    else if (!st.profiles.length) showAddChild(false);
    else if (!st.active && st.profiles.length === 1) {
      switchTo(st.profiles[0].id).then(function (r) {
        if (r.ok && !r.reloading) route();
      });
    } else if (!st.active) showPicker();
    else if (modalEl && !modalEl.__dismissible) closeModal();
    refreshHeader();
  }

  async function start(force) {
    if (starting && !force) return starting;
    starting = (async function () {
      try {
        await load();
      } catch (e) {
        st.error = true;
      }
      route();
    })();
    var p = starting;
    p.then(function () {
      if (starting === p) starting = null;
    });
    return p;
  }

  function onSession(session) {
    var wasIn = !!st.session;
    st.session = session || null;
    if (!session) {
      st = { session: null, loaded: false, error: false, consent: false, profiles: [], active: null, busy: false };
      closeModal();
      return;
    }
    if (!wasIn) start();
  }

  root.__lesAccount = {
    renderHeader: renderHeader,
    state: function () {
      return st;
    },
    switchTo: switchTo,
    addChild: addChild,
    deleteChild: deleteChild,
    route: route,
    TERMS_VERSION: TERMS_VERSION,
  };

  sb.auth.onAuthStateChange(function (event, session) {
    if (event === "SIGNED_OUT") return onSession(null);
    if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) onSession(session);
  });
  (async function () {
    try {
      var s = (await sb.auth.getSession()).data.session;
      if (s) onSession(s);
    } catch (e) {}
  })();
})(typeof window !== "undefined" ? window : globalThis);
