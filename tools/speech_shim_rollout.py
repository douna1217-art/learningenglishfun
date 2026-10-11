#!/usr/bin/env python3
"""Let book pages load in browsers that have no speech synthesis (some Android browsers).

Problem (found 2026-10-11): the book script calls speechSynthesis while it loads
(pickVoice(), speechSynthesis.cancel.bind(...)). Browsers without it (UC/Quark and other
vendor kernels, older WebViews) throw ReferenceError there, so the script stops before it
draws the story, the page dots and the first question. The quiz still opens because the tab
click handlers were bound earlier, which is exactly what users reported: "no book content,
but I can do the quiz". Next/Back also fail there, because goPage() calls speechSynthesis.cancel().

Fix: put tools/templates/speech_shim.html (a small script) in front of the main script of
every page, and in front of the main script of the page generator's head template. In normal
browsers the shim does nothing; elsewhere it supplies a silent speechSynthesis. It also
writes the reason on the page when the story could not be drawn.

Usage:
  python3 tools/speech_shim_rollout.py check    # dry run (default)
  python3 tools/speech_shim_rollout.py apply    # patch template + every page, then verify
  python3 tools/speech_shim_rollout.py verify   # re-check files on disk against git HEAD

Safety: `apply` first checks EVERY file and writes nothing unless each page has exactly one
main script anchor. Afterwards each page is verified: (a) the shim appears once, (b) every
window.RV_* audio/timing block is byte-identical, (c) undoing the edit gives back exactly
the file in git HEAD, (d) the main script and the shim parse with node.
Also run tools/book_load_test.js (loads pages without speechSynthesis) and
tools/legacy_syntax_check.js (must print 0).
"""
import glob
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

with open(os.path.join(HERE, "templates", "speech_shim.html"), encoding="utf-8", newline="") as _f:
    SHIM = _f.read()
MARK = "/*les-speech-shim*/"
ANCHOR = re.compile(r"<script>(\s*const pages=)")
HEAD_TEMPLATE = os.path.join(HERE, "templates", "human_book_head.html")
HEAD_ANCHOR = "<script>\n\n"

PAGES = sorted(glob.glob(os.path.join(REPO, "site", "books", "*", "*.html")))
RV = re.compile(r"<script>window\.RV_[A-Z_]+=.*?;</script>", re.S)


def read(p):
    return open(p, encoding="utf-8", newline="").read()


def git_head(path):
    rel = os.path.relpath(path, REPO)
    r = subprocess.run(["git", "show", "HEAD:" + rel], cwd=REPO, capture_output=True)
    return r.stdout.decode("utf-8") if r.returncode == 0 else None


def node_check(code):
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(code)
        path = f.name
    try:
        return subprocess.run(["node", "--check", path], capture_output=True).returncode == 0
    finally:
        os.remove(path)


def main_script_ok(html):
    mains = [s for s in re.findall(r"<script>(.*?)</script>", html, re.S) if "const pages=" in s or "let page=" in s]
    return node_check("\n".join(mains)) if mains else None


def patched_page(t):
    return ANCHOR.sub(lambda m: SHIM + "<script>" + m.group(1), t, count=1)


def patched_head(t):
    i = t.rfind(HEAD_ANCHOR)
    return t[:i] + SHIM + t[i:]


def plan():
    todo, done, problems = [], [], []
    for path in PAGES:
        t = read(path)
        n_anchor, n_shim = len(ANCHOR.findall(t)), t.count(MARK)
        if n_shim == 1 and n_anchor == 1:
            done.append(path)
        elif n_shim == 0 and n_anchor == 1:
            todo.append((path, patched_page(t)))
        else:
            problems.append((path, f"main script anchors: {n_anchor}, shims: {n_shim}"))
    t = read(HEAD_TEMPLATE)
    if t.count(MARK) == 1:
        done.append(HEAD_TEMPLATE)
    elif t.count(MARK) == 0 and t.count(HEAD_ANCHOR) == 1 and t.rstrip().endswith("<script>"):
        todo.append((HEAD_TEMPLATE, patched_head(t)))
    else:
        problems.append((HEAD_TEMPLATE, "head template does not end with exactly one main <script>"))
    return todo, done, problems


def verify_file(path):
    t = read(path)
    errs = []
    if t.count(MARK) != 1 or t.count(SHIM) != 1:
        errs.append("shim not present exactly once")
    if path.endswith("human_book_head.html"):
        if not t.endswith(SHIM + HEAD_ANCHOR):
            errs.append("shim is not directly in front of the main script")
    else:
        head = git_head(path)
        if head is None:
            errs.append("not tracked in git HEAD")
        else:
            if t.replace(SHIM, "", 1) != head:
                errs.append("undoing the edit does not give back git HEAD")
            if RV.findall(t) != RV.findall(head):
                errs.append("an audio/timing block changed")
        if main_script_ok(t) is False:
            errs.append("main script does not parse")
        if t.find(MARK) > t.find("const pages="):
            errs.append("shim comes after the main script")
    return errs


def shim_parses():
    body = re.search(r"<script>(.*?)</script>", SHIM, re.S).group(1)
    return node_check(body)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "check"
    if mode not in ("check", "apply", "verify"):
        sys.exit(__doc__)
    if not shim_parses():
        sys.exit("The shim itself does not parse; nothing was written.")
    todo, done, problems = plan()
    print(f"pages: {len(PAGES)} | to patch: {len(todo)} | already patched: {len(done)} | problems: {len(problems)}")
    for path, why in problems[:10]:
        print("  PROBLEM", os.path.relpath(path, REPO), why)
    if mode == "verify":
        bad = 0
        for path in PAGES + [HEAD_TEMPLATE]:
            e = verify_file(path)
            if e:
                bad += 1
                print("  FAIL", os.path.relpath(path, REPO), e)
        print("verify:", "ALL OK" if not bad else f"{bad} file(s) failed")
        sys.exit(1 if bad else 0)
    if problems:
        print("Refusing to continue: fix the problems above first. Nothing was written.")
        sys.exit(1)
    if mode == "check":
        print("dry run only; nothing written. Run with `apply` to write.")
        return
    for path, new_text in todo:
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(new_text)
    print(f"wrote {len(todo)} file(s); verifying every one...")
    bad = 0
    for path, _ in todo:
        e = verify_file(path)
        if e:
            bad += 1
            print("  FAIL", os.path.relpath(path, REPO), e)
    print("apply:", "ALL OK" if not bad else f"{bad} file(s) FAILED verification; restore with `git checkout -- site tools`")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
