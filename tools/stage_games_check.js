#!/usr/bin/env node
// Browser check of the games inside the stages (needs Playwright with Chromium installed):
//   PLAYWRIGHT=/path/to/node_modules/playwright node tools/stage_games_check.js
// It serves site/ itself, opens Sight words and checks: the home page lists no games; a new child's stage page has locked games and a locked
// challenge; one finished lesson opens the games; a finished unit opens the stage challenge; the how-to card and Back lead to the stage page.
const http = require("http"), fs = require("fs"), path = require("path");
const SITE = path.join(__dirname, "..", "site");
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".mp3": "audio/mpeg", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  const f = path.join(SITE, decodeURIComponent(req.url.split("?")[0]).replace(/^\/+$/, "/index.html"));
  if (!f.startsWith(SITE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
let passed = 0, failed = 0;
const ok = (c, n, x) => (c ? passed++ : (failed++, console.log("  FAIL:", n, x === undefined ? "" : JSON.stringify(x))));
(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://localhost:" + server.address().port;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 420, height: 1000 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  const open = async (state) => {
    await page.goto(base + "/index.html?swtest=1");
    await page.evaluate((st) => { localStorage.clear(); if (st) localStorage.setItem("lef_words_v1", JSON.stringify(st)); }, state || null);
    await page.goto(base + "/index.html?swtest=1");
    await page.waitForTimeout(700);
    await page.evaluate(() => { const b = [...document.querySelectorAll("button,a")].find((x) => /sight/i.test(x.textContent) && x.offsetParent); b && b.click(); });
    await page.waitForTimeout(800);
  };
  const stagePage = async (n) => {
    await page.evaluate((i) => { const e = document.querySelectorAll("#swOverlay .sw-isl-go")[i]; e && e.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, n - 1);
    await page.waitForTimeout(700);
  };
  const count = (sel) => page.evaluate((s) => document.querySelectorAll("#swOverlay " + s).length, sel);

  await open();
  ok((await count(".sw-gt")) === 0 && (await count(".sw-ct")) === 0, "home page: no games or challenges listed");
  await stagePage(1);
  ok((await count(".sw-gt")) === 10 && (await count(".sw-gt.sw-locked")) === 10 && (await count(".sw-ct.sw-locked")) === 1, "new child: stage page shows the games and the challenge, all locked");
  const g1 = await page.evaluate(() => [...document.querySelectorAll("#swOverlay .sw-games.sw-g2c .sw-gt")].map((x) => x.getAttribute("data-g")));
  ok(g1.join() === "bal,fish", "stage 1 games: balloon pop and word fishing", g1);

  // one lesson done: the games open, the challenge does not
  await open({ words: {}, lessons: { 1: { t: 1, acc: 90 } }, rev: {} });
  await stagePage(1);
  ok((await count(".sw-gt.sw-locked")) === 0 && (await count(".sw-ct.sw-locked")) === 1, "one lesson done: games open, challenge still locked");
  await page.evaluate(() => { document.getElementById("swBal").click(); });
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => /HOW TO PLAY/i.test(document.getElementById("swOverlay").innerText)), "first time: the how-to card shows before the game");
  await page.evaluate(() => document.getElementById("swQuit").click());
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => /Stage 1/.test(document.getElementById("swOverlay").innerText)), "Back from the how-to card leads to the stage page");
  // every lesson of stage 1 done: the stage challenge opens
  const all = {};
  for (let i = 1; i <= 18; i++) all[i] = { t: 1, acc: 90 };
  await open({ words: {}, lessons: all, rev: {} });
  await stagePage(1);
  ok((await count(".sw-ct")) === 1 && (await count(".sw-ct.sw-locked")) === 0, "stage finished: the challenge is open");
  // the end of a lesson (through the ?swtest=1 door): stage 3's games, and the challenges when the first unit has just been finished
  const tiles = () => page.evaluate(() => [...document.querySelectorAll("#swOverlay .sw-acts > *")].map((e) => e.getAttribute("data-g") || e.id));
  await open();
  const l3 = await page.evaluate(() => window.__swTest.stageLessons(3)), u3 = await page.evaluate(() => window.__swTest.unitLessons(3));
  await page.evaluate((id) => window.__swTest.lessonDone(id), l3[0]);
  await page.waitForTimeout(700);
  let t = await tiles();
  ok(t.join() === "swNextL,mole,feed", "end of a lesson in stage 3: next lesson, whack-a-word, feed a pet", t);
  const first = u3[0], lastOfUnit = first[first.length - 1], done = {};
  first.slice(0, -1).forEach((i) => (done[i] = { t: 1, acc: 90 }));
  await open({ words: {}, lessons: done, rev: {} });
  await page.evaluate((id) => window.__swTest.lessonDone(id), lastOfUnit);
  await page.waitForTimeout(700);
  t = await tiles();
  ok(t[0] === "swStageCh" && t[1] === "swUnit" && t.slice(-2).join() === "mole,feed", "finishing a unit: the stage challenge and the unit challenge come first", t);
  await page.evaluate(() => document.querySelector("#swOverlay .sw-acts .sw-gt").click());
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => /HOW TO PLAY/i.test(document.getElementById("swOverlay").innerText)), "end of a lesson: a game opens with its how-to card");
  await page.evaluate(() => document.getElementById("swQuit").click());
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => /Stage 3/.test(document.getElementById("swOverlay").innerText)), "Back from there leads to the stage page");
  ok(errs.length === 0, "no page errors", errs);
  await browser.close();
  server.close();
  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
