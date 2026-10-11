#!/usr/bin/env node
// Loads book pages in jsdom the way a browser WITHOUT speech synthesis would (some Android
// browsers), and in a normal browser, and checks the story is drawn and the buttons work.
//
//   NODE_PATH=<dir with jsdom> node tools/book_load_test.js [--all [--shard=0/4] | file.html ...]
//
// Default: one page per subject folder. --all: every page under site/books (about a minute).
// Exit code 1 if any check fails.
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const SITE = path.join(__dirname, "..", "site");

function pagesToTest(args) {
  const files = args.filter((a) => a.endsWith(".html"));
  if (files.length) return files.map((f) => path.resolve(f));
  const all = [];
  for (const dir of fs.readdirSync(path.join(SITE, "books")).sort()) {
    const d = path.join(SITE, "books", dir);
    if (!fs.statSync(d).isDirectory()) continue;
    const list = fs.readdirSync(d).filter((f) => f.endsWith(".html")).sort();
    if (args.includes("--all")) list.forEach((f) => all.push(path.join(d, f)));
    else if (list.length) all.push(path.join(d, list[0]));
  }
  return all;
}

// mode: "nospeech" (no speechSynthesis / utterance / MediaRecorder), "normal", "broken"
function open(file, mode, opts) {
  opts = opts || {};
  const html = fs.readFileSync(file, "utf8");
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => {
    const m = (e.detail && e.detail.message) || e.message || String(e);
    if (!/Not implemented/i.test(m)) errors.push(m);
  });
  const dom = new JSDOM(mode === "broken" ? html.replace("pickVoice();", "pickVoice();throw new Error('boom');") : html, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    url: "https://learning-english-fun.com/books/x/" + path.basename(file),
    virtualConsole: vc,
    beforeParse(w) {
      w.__calls = { audioPlay: 0, audioPause: 0, synthPause: 0, synthResume: 0, lastU: null };
      w.HTMLMediaElement.prototype.play = function () { w.__calls.audioPlay++; return Promise.resolve(); };
      w.HTMLMediaElement.prototype.pause = function () { w.__calls.audioPause++; };
      w.Element.prototype.scrollIntoView = function () {};
      w.scrollTo = function () {};
      w.fetch = () => Promise.reject(new Error("offline"));
      if (opts.mic) {
        w.__mic = { stops: 0 };
        Object.defineProperty(w.navigator, "mediaDevices", { configurable: true, value: {
          getUserMedia() { return Promise.resolve({ getTracks() { return [{ stop() { w.__mic.stops++; } }]; } }); } } });
        w.MediaRecorder = function () {
          const self = this; this.state = "inactive"; this.mimeType = "audio/webm";
          this.start = function () { self.state = "recording"; };
          this.stop = function () { self.state = "inactive"; setTimeout(function () {
            self.ondataavailable && self.ondataavailable({ data: new w.Blob(["x"]) }); self.onstop && self.onstop(); }, 5); };
        };
        w.MediaRecorder.isTypeSupported = function () { return false; };
        let n = 0; w.URL.createObjectURL = function () { return "blob:fake-" + (++n); }; w.URL.revokeObjectURL = function () {};
      }
      if (mode === "normal") {
        w.__real = { cancel: 0, speak: 0 };
        w.speechSynthesis = {
          cancel() { w.__real.cancel++; }, speak(u) { w.__real.speak++; w.__calls.lastU = u; }, getVoices() { return []; },
          addEventListener() {}, pause() { w.__calls.synthPause++; }, resume() { w.__calls.synthResume++; }, speaking: false, paused: false,
        };
        w.SpeechSynthesisUtterance = function (t) { this.text = t; };
      }
    },
  });
  return { dom, errors };
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function checkPage(file) {
  const fails = [];
  const rel = path.relative(SITE, file);
  const need = (cond, msg) => { if (!cond) fails.push(msg); };

  for (const mode of ["nospeech", "normal"]) {
    const { dom, errors } = open(file, mode);
    const w = dom.window, d = w.document;
    await wait(40);
    const tag = `[${mode}] `;
    need(errors.length === 0, tag + "load errors: " + errors.slice(0, 2).join(" | "));
    need(!!d.querySelector("#pageView .book-page"), tag + "story page not drawn");
    const total = w.eval("pages.length");
    need(d.querySelectorAll("#progress .dot").length === total, tag + "page dots missing");
    need(d.getElementById("panelContent").innerHTML.length > 50, tag + "first question not drawn");
    need(d.body.classList.contains("les-btnrow"), tag + "button layout script did not finish its setup");
    const inHead = (id) => !!d.querySelector("#pageView .story .story-head #" + id);
    need(inHead("listenPageBtn") && inHead("listenStoryBtn") && inHead("recordPageBtn") && inHead("recStatus"), tag + "buttons are not in the row beside the story text");
    need(!!d.querySelector(".controls .key-hint"), tag + "keyboard hint missing");
    try {
      d.getElementById("nextBtn").click();
      need(w.eval("page") === 1, tag + "Next did not turn the page");
      need(inHead("listenPageBtn") && inHead("recordPageBtn"), tag + "buttons did not follow to the next page");
      d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      need(w.eval("page") === 2, tag + "right arrow key did not turn the page");
      d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
      need(w.eval("page") === 1, tag + "left arrow key did not turn the page back");
      need(!!d.querySelector("#pageView .story-word"), tag + "page 1 has no story text");
      d.getElementById("prevBtn").click();
      need(w.eval("page") === 0, tag + "Back did not turn the page");
      d.getElementById("nextBtn").click();
      const before = d.getElementById("panelContent").innerHTML;
      d.querySelector('.tab[data-tab="grammar"]').click();
      need(d.getElementById("panelContent").innerHTML !== before, tag + "tab did not change the panel");
      need(!d.getElementById("pauseBtn"), tag + "Pause button is still on the page");
      const lp = d.getElementById("listenPageBtn"), ls = d.getElementById("listenStoryBtn");
      const idleP = lp.textContent, idleS = ls.textContent;
      const state = (b) => (b.classList.contains("active") ? "playing" : b.classList.contains("paused") ? "paused" : "idle");
      const sym = (b) => b.textContent.trim().split(" ")[0];
      const c = w.__calls;
      const pauses = () => c.audioPause + c.synthPause, resumes = () => c.audioPlay + c.synthResume;

      lp.click(); await wait(60);
      need(state(lp) === "playing" && sym(lp) === "\u23F8" && lp.getAttribute("aria-pressed") === "true", tag + "1st tap on This Page should start reading");
      need(state(ls) === "idle" && ls.textContent === idleS, tag + "Full Story should stay idle");
      let p0 = pauses(); lp.click();
      need(state(lp) === "paused" && sym(lp) === "\u25B6", tag + "2nd tap should pause");
      if (mode === "normal") need(pauses() > p0, tag + "2nd tap did not pause the sound");
      let r0 = resumes(); lp.click();
      need(state(lp) === "playing" && sym(lp) === "\u23F8", tag + "3rd tap should continue");
      if (mode === "normal") need(resumes() > r0, tag + "3rd tap did not resume the sound");

      ls.click(); await wait(60);
      need(state(ls) === "playing" && state(lp) === "idle" && lp.textContent === idleP, tag + "Full Story should take over from This Page");
      ls.click(); need(state(ls) === "paused", tag + "Full Story 2nd tap should pause");
      lp.click(); await wait(60);
      need(state(lp) === "playing" && state(ls) === "idle" && ls.textContent === idleS, tag + "This Page should take over from a paused Full Story");

      d.getElementById("nextBtn").click();
      need(state(lp) === "idle" && state(ls) === "idle" && lp.textContent === idleP && ls.textContent === idleS, tag + "turning the page should put both buttons back to idle");

      // a page that is read to its end puts its button back to idle
      w.eval("pages[page].text='Hi.'");
      lp.click(); await wait(150);
      if (w.eval("!!(window.RV_AUDIO&&RV_AUDIO[page]!=null)")) w.eval("__rvAudio.onended()");
      else if (mode === "normal") w.__calls.lastU.onend();
      else await wait(900);
      await wait(120);
      need(state(lp) === "idle" && lp.textContent === idleP, tag + "button should go back to idle when the page has been read");

      d.getElementById("recordPageBtn").click();
      await wait(60);
      need(errors.length === 0, tag + "errors after clicking buttons: " + errors.slice(0, 2).join(" | "));
    } catch (e) {
      fails.push(tag + "exception while clicking: " + e.message);
    }
    if (mode === "nospeech") {
      need(typeof w.speechSynthesis === "object" && typeof w.SpeechSynthesisUtterance === "function", tag + "stand-in not installed");
    } else {
      need(w.__real.cancel > 0, tag + "the real speechSynthesis was not used (shim replaced it?)");
      need(!/can't read aloud/.test(d.getElementById("recStatus").textContent), tag + "shim message shown although speech exists");
    }
    w.close();
  }
  return { rel, fails };
}

async function checkRecording(file) {
  const fails = [];
  const need = (cond, msg) => { if (!cond) fails.push("[recording] " + msg); };
  const { dom, errors } = open(file, "normal", { mic: true });
  const w = dom.window, d = w.document;
  await wait(40);
  const lp = d.getElementById("listenPageBtn"), ls = d.getElementById("listenStoryBtn");
  const rec = d.getElementById("recordPageBtn"), del = d.getElementById("deleteRecordingBtn");
  const label = () => rec.textContent.trim();
  const trash = () => del.style.display !== "none";
  try {
    d.getElementById("nextBtn").click();                       // page 1
    need(label() === "\uD83C\uDF99 Record" && !trash(), "idle state wrong: " + label());
    lp.click(); await wait(40);                                // narration running
    need(lp.classList.contains("active"), "narration did not start");
    rec.click(); await wait(40);                               // Record while narration plays
    need(label() === "\u25A0 Stop", "Record did not turn into Stop: " + label());
    need(!lp.classList.contains("active") && !lp.classList.contains("paused"), "starting to record did not stop the narration");
    need(lp.disabled && ls.disabled, "listen buttons should be disabled while recording");
    d.dispatchEvent(new w.KeyboardEvent("keydown", { key: " ", bubbles: true }));
    need(!lp.classList.contains("active"), "Space started narration while recording");
    rec.click(); await wait(40);                               // Stop
    need(label() === "\u25B6 Play" && trash(), "after Stop the button should be Play with the trash can: " + label());
    need(!lp.disabled && !ls.disabled, "listen buttons should be enabled again after recording");
    need(w.__mic.stops >= 1, "microphone was not released");
    rec.click(); await wait(20);                               // Play
    need(label() === "\u23F8 Pause", "Play did not start my recording: " + label());
    lp.click(); await wait(40);                                // narration takes over
    need(label() === "\u25B6 Play" && lp.classList.contains("active"), "narration should stop my recording playback");
    rec.click(); await wait(20);                               // my recording takes over
    need(label() === "\u23F8 Pause" && !lp.classList.contains("active"), "my recording should stop the narration");
    d.getElementById("nextBtn").click();                       // page 2: nothing recorded here
    need(label() === "\uD83C\uDF99 Record" && !trash(), "recording must stay on page 1, page 2 shows: " + label());
    d.getElementById("prevBtn").click();
    need(label() === "\u25B6 Play" && trash(), "page 1 lost its recording: " + label());
    del.click();
    need(label() === "\uD83C\uDF99 Record" && !trash(), "trash can did not delete the recording: " + label());
    rec.click(); await wait(40);                               // record again, turn the page while recording
    d.getElementById("nextBtn").click(); await wait(40);
    need(label() === "\uD83C\uDF99 Record" && !lp.disabled, "turning the page while recording must stop it: " + label());
    d.getElementById("prevBtn").click();
    need(label() === "\u25B6 Play" && trash(), "a recording stopped by turning the page must be kept on its own page: " + label());
    need(errors.length === 0, "errors: " + errors.slice(0, 2).join(" | "));
  } catch (e) { fails.push("[recording] exception: " + e.message); }
  w.close();
  return fails;
}

async function checkBroken(file) {
  const fails = [];
  const { dom } = open(file, "broken");
  const w = dom.window;
  await new Promise((r) => w.addEventListener("load", r));
  await wait(40);
  const box = w.document.getElementById("pageView");
  const text = box.textContent;
  if (!/could not be shown/.test(text) || !/boom/.test(text)) fails.push("page that really breaks did not explain itself: " + JSON.stringify(text.slice(0, 120)));
  w.close();
  return fails;
}

(async () => {
  let files = pagesToTest(process.argv.slice(2));
  const sh = process.argv.find((a) => /^--shard=\d+\/\d+$/.test(a));
  if (sh) { const [i, n] = sh.slice(8).split("/").map(Number); files = files.filter((_, k) => k % n === i); }
  let bad = 0;
  const t0 = Date.now();
  for (let i = 0; i < files.length; i++) {
    const r = await checkPage(files[i]);
    r.fails.push(...await checkRecording(files[i]));
    if (r.fails.length) {
      bad++;
      if (bad <= 12) console.log("FAIL", r.rel, "\n   " + r.fails.slice(0, 3).join("\n   "));
    }
    if (files.length > 50 && (i + 1) % 100 === 0) console.log(`... ${i + 1}/${files.length}`);
  }
  const bf = await checkBroken(files[0]);
  if (bf.length) { bad++; console.log("FAIL broken-page notice:", bf.join("; ")); }
  console.log(`pages tested: ${files.length} (+1 broken-page case) | failed: ${bad} | ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  process.exit(bad ? 1 : 0);
})();
