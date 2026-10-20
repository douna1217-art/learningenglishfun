#!/usr/bin/env node
// Tests for site/error-report.js: what is kept of an error message, what is dropped, how many are sent.
//   node tools/error_report_test.js
const path = require("path");
const fs = require("fs");
const vm = require("vm");
const E = require(path.join(__dirname, "..", "site", "error-report.js"));
let passed = 0, failed = 0;
const ok = (c, n, x) => (c ? passed++ : (failed++, console.log("  FAIL:", n, x === undefined ? "" : JSON.stringify(x))));

ok(E.clean("Failed to fetch https://example.com/a?token=abc for kid@mail.com now") === "Failed to fetch [link] for [email] now", "links and e-mail addresses are cut out", E.clean("Failed to fetch https://example.com/a?token=abc for kid@mail.com now"));
ok(E.clean("  a \n\n  b  ") === "a b" && E.clean(null) === "" && E.clean(undefined) === "", "spaces are tidied, nothing becomes empty text");
ok(E.clean("x".repeat(500)).length === 120, "messages are cut at 120 characters");
ok(E.where("https://learning-english-fun.com/js/sightwords.js?v=20261104b", 42) === "sightwords.js:42" && E.where("", 0) === "page" && E.where("a/b/c.js#x", 0) === "c.js", "only the file name and the line are kept");
ok(E.browser("Mozilla/5.0 (iPhone; CPU iPhone OS 17) AppleWebKit/605 Version/17 Mobile Safari/604") === "Safari" && E.browser("Mozilla/5.0 Chrome/120 Safari/537") === "Chrome" && E.browser("Mozilla/5.0 Edg/120 Chrome/120") === "Edge" && E.browser("Mozilla/5.0 Firefox/120") === "Firefox" && E.browser("Mozilla/5.0 MicroMessenger/8") === "WeChat" && E.browser("curl") === "other" && E.browser("") === "other", "browser: only the family is kept");
ok(E.make("error", "Script error.", "", 0, "x") === null && E.make("error", "ResizeObserver loop limit exceeded", "a.js", 1, "x") === null && E.make("error", "boom", "chrome-extension://abc/x.js", 1, "x") === null && E.make("error", "", "a.js", 1, "x") === null, "noise is dropped");
const r = E.make("audio", "play refused NotAllowedError w-go", "", 0, "Mozilla/5.0 Version/17 Safari/604");
ok(r && r.kind === "audio" && r.where === "page · Safari" && r.msg === "play refused NotAllowedError w-go", "an audio error carries its kind, no file, the browser family", r);

// the whole file in a fake window: at most 6 different errors, none twice, queued until stats.js has set __trackEvent
function page(withTrack) {
  const sent = [], listeners = {};
  const win = {
    navigator: { userAgent: "Mozilla/5.0 Version/17 Safari/604" },
    addEventListener: (n, f) => { listeners[n] = f; },
    setInterval: (f) => { win.__tick = f; return 1; },
    clearInterval: () => {},
  };
  if (withTrack) win.__trackEvent = (n, p) => sent.push([n, p]);
  win.window = win;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "site", "error-report.js"), "utf8"), win);
  return { win, sent, listeners };
}
let p = page(true);
p.listeners.error({ message: "boom", filename: "https://x.com/a.js?v=1", lineno: 3 });
p.listeners.error({ message: "boom", filename: "https://x.com/a.js?v=1", lineno: 3 });
ok(p.sent.length === 1 && p.sent[0][0] === "js_error" && p.sent[0][1].book_id === "error" && p.sent[0][1].book_title === "boom" && p.sent[0][1].category === "a.js:3 · Safari", "one event for an error, the same error twice is sent once", p.sent);
for (let i = 0; i < 10; i++) p.listeners.error({ message: "other " + i, filename: "a.js", lineno: i });
ok(p.sent.length === 6, "at most six different errors for each page load", p.sent.length);
p.listeners.error({ target: { tagName: "IMG" }, message: "x" });
ok(p.sent.length === 6, "a picture that did not load is not a code error");
p = page(true);
p.listeners.unhandledrejection({ reason: new Error("nope") });
p.win.__reportError("audio", "play refused NotAllowedError w-me");
ok(p.sent.length === 2 && p.sent[0][1].book_id === "promise" && p.sent[1][1].book_id === "audio", "unhandled rejections and the games' audio reports are sent too", p.sent);
p = page(false);
p.listeners.error({ message: "early", filename: "a.js", lineno: 1 });
ok(p.sent.length === 0, "before stats.js is there nothing is lost: the error waits");
p.win.__trackEvent = (n, q) => p.sent.push([n, q]);
p.win.__tick();
ok(p.sent.length === 1 && p.sent[0][1].book_title === "early", "...and goes out as soon as it is", p.sent);

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
