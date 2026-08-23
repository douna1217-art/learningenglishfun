// Cloud sync for the reading placement result (optional).
//
// How it works:
// - The placement result is always kept in localStorage under the key
//   "les_placement_v1" (the site still works fully offline without this file).
// - If supabase-config.js has real project values, signing in with an email
//   link will additionally back up that result to Supabase and pull it back
//   down on any other device signed in with the same email — so the
//   recommendation follows the reader across devices.
// - If supabase-config.js still has placeholder values, this file quietly
//   does nothing (no errors, no UI, no network calls).
//
// 中文说明：登录后会把测评结果（les_placement_v1）同步到 Supabase，换设备用同一个
// 邮箱登录也能看到一样的推荐结果。没配置 Supabase 项目之前，这个文件什么都不做。
(function () {
  var cfg = window.SUPABASE_CONFIG;
  var configured =
    window.supabase &&
    cfg &&
    cfg.url &&
    cfg.anonKey &&
    cfg.url.indexOf("YOUR-PROJECT") === -1 &&
    cfg.anonKey.indexOf("YOUR-ANON-KEY") === -1;

  if (!configured) return;

  // Reuse the same client sync.js/stats.js create, if one already ran.
  var sb = window.__lesSupabaseClient || (window.__lesSupabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey));
  var K = "les_placement_v1";

  function loadLocal() {
    try {
      return JSON.parse(localStorage.getItem(K) || "null");
    } catch (e) {
      return null;
    }
  }
  function saveLocal(result) {
    try {
      localStorage.setItem(K, JSON.stringify(result));
    } catch (e) {}
  }

  async function pushResult(result) {
    var session = (await sb.auth.getSession()).data.session;
    if (!session) return;
    await sb.from("placement_results").upsert({
      user_id: session.user.id,
      result: result,
      updated_at: new Date().toISOString(),
    });
  }

  async function pullResult() {
    var session = (await sb.auth.getSession()).data.session;
    if (!session) return;
    var { data } = await sb
      .from("placement_results")
      .select("result, updated_at")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!data) return;
    var local = loadLocal();
    // Cloud result wins only if there's no local result yet, or the cloud
    // one is newer — never silently overwrite a fresher local retake.
    if (!local || (data.result && (!local.takenAt || data.result.takenAt > local.takenAt))) {
      saveLocal(data.result);
      if (window.__onPlacementSynced) window.__onPlacementSynced(data.result);
    }
  }

  // Called by placement.js right after a student finishes the quiz.
  window.__syncPlacementResult = function (result) {
    pushResult(result).catch(function () {});
  };

  sb.auth.onAuthStateChange(function (event) {
    if (event === "SIGNED_IN") pullResult().catch(function () {});
  });
  pullResult().catch(function () {});
})();
