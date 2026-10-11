#!/usr/bin/env node
// Regression check for older Android browsers: parse every inline script of every book
// page and of the site's own pages and scripts at the ES2017 level (Chrome 55 / Android 7
// WebView). Anything newer (optional chaining ?., ??, object spread, optional catch binding,
// ...) makes an old browser skip the WHOLE script, and the page shows only its static shell.
// Run it after building or changing ANY book page, template or site script:
//   NODE_PATH=<dir containing node_modules/acorn> node tools/legacy_syntax_check.js
const fs = require("fs"), path = require("path");
const acorn = require("acorn");
const SITE = path.join(__dirname, "..", "site");
const ECMA = 2017;

function inlineScripts(html) {
  const out = []; const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g; let m;
  while ((m = re.exec(html))) if (m[1].trim()) out.push(m[1]);
  return out;
}
function firstError(code) {
  try { acorn.parse(code, { ecmaVersion: ECMA, sourceType: "script", allowHashBang: true }); return null; }
  catch (e) { return `${e.message} near: ${code.slice(Math.max(0, e.pos - 40), e.pos + 30).replace(/\s+/g, " ")}`; }
}
const targets = [];
for (const d of fs.readdirSync(path.join(SITE, "books"))) {
  const dir = path.join(SITE, "books", d);
  if (fs.statSync(dir).isDirectory()) for (const f of fs.readdirSync(dir)) if (f.endsWith(".html") || f === "books.js") targets.push(path.join(dir, f));
}
for (const f of fs.readdirSync(SITE)) if (f.endsWith(".html") || f.endsWith(".js")) targets.push(path.join(SITE, f));

let bad = 0; const reasons = {};
for (const f of targets) {
  const text = fs.readFileSync(f, "utf8");
  const codes = f.endsWith(".html") ? inlineScripts(text) : [text];
  for (const c of codes) {
    const err = firstError(c);
    if (err) { bad++; const k = err.replace(/\(\d+:\d+\)/, ""); (reasons[k] = reasons[k] || []).push(path.relative(SITE, f)); break; }
  }
}
console.log(`checked ${targets.length} files at ES${ECMA}: ${bad} cannot be read by an older Android browser`);
Object.entries(reasons).sort((a, b) => b[1].length - a[1].length).slice(0, 8).forEach(([k, v]) => console.log(`  ${String(v.length).padStart(4)} x ${k}\n        e.g. ${v[0]}`));
process.exit(bad ? 1 : 0);
