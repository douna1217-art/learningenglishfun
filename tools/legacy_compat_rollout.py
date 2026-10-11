#!/usr/bin/env python3
"""Make every book page readable by older Android in-app browsers.

Problem (found 2026-10-11): all 945 book pages contained
    document.getElementById("evidenceBanner")?.remove()
Optional chaining (`?.`) needs Chrome 80 (2020). Older Android WebViews (common in
mainland China: WeChat/QQ/vendor browsers on phones without Google services) fail to
PARSE the whole page script, so the page shows its static shell and no story.

Fix: replace that one expression with plain ES5 code. Nothing else changes.

Usage:
  python3 tools/legacy_compat_rollout.py check    # dry run (default)
  python3 tools/legacy_compat_rollout.py apply    # patch template + every page, then verify
  python3 tools/legacy_compat_rollout.py verify   # re-check files on disk against git HEAD

Safety: `apply` first checks EVERY file and writes nothing if any file does not contain
the old text exactly once. Afterwards each page is verified: (a) the new code appears
once and the old code is gone, (b) every window.RV_* audio/timing block is byte-identical,
(c) undoing the edit gives back exactly the file in git HEAD, (d) the main script still
parses with node.
Also run tools/legacy_syntax_check.js, which parses everything at the ES2017 level.
"""
import glob
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

OLD = 'document.getElementById("evidenceBanner")?.remove()'
NEW = '(function(){var b=document.getElementById("evidenceBanner");if(b&&b.parentNode)b.parentNode.removeChild(b);})()'

PAGES = sorted(glob.glob(os.path.join(REPO, "site", "books", "*", "*.html")))
TEMPLATES = [os.path.join(REPO, "tools", "templates", "human_book_tail.js")]
RV = re.compile(r"<script>window\.RV_[A-Z_]+=.*?;</script>", re.S)


def read(p):
    return open(p, encoding="utf-8", newline="").read()


def git_head(path):
    rel = os.path.relpath(path, REPO)
    r = subprocess.run(["git", "show", "HEAD:" + rel], cwd=REPO, capture_output=True)
    return r.stdout.decode("utf-8") if r.returncode == 0 else None


def node_ok(html):
    mains = [s for s in re.findall(r"<script>(.*?)</script>", html, re.S) if "const pages=" in s or "let page=" in s]
    if not mains:
        return None
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write("\n".join(mains))
        path = f.name
    try:
        return subprocess.run(["node", "--check", path], capture_output=True).returncode == 0
    finally:
        os.remove(path)


def plan():
    todo, done, problems = [], [], []
    for path in PAGES + TEMPLATES:
        t = read(path)
        n_old, n_new = t.count(OLD), t.count(NEW)
        if n_old == 0 and n_new >= 1:
            done.append(path)
        elif n_old == 1:
            todo.append((path, t.replace(OLD, NEW, 1)))
        else:
            problems.append((path, f"old text found {n_old} times"))
    return todo, done, problems


def verify_file(path):
    t = read(path)
    errs = []
    if t.count(NEW) != 1:
        errs.append("new code not present exactly once")
    if OLD in t:
        errs.append("old code still present")
    if path.endswith(".html"):
        head = git_head(path)
        if head is None:
            errs.append("not tracked in git HEAD")
        else:
            if t.replace(NEW, OLD, 1) != head:
                errs.append("undoing the edit does not give back git HEAD")
            if RV.findall(t) != RV.findall(head):
                errs.append("an audio/timing block changed")
        ok = node_ok(t)
        if ok is False:
            errs.append("main script does not parse")
    return errs


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "check"
    if mode not in ("check", "apply", "verify"):
        sys.exit(__doc__)
    todo, done, problems = plan()
    print(f"pages: {len(PAGES)} | templates: {len(TEMPLATES)} | to patch: {len(todo)} | already patched: {len(done)} | problems: {len(problems)}")
    for path, why in problems[:10]:
        print("  PROBLEM", os.path.relpath(path, REPO), why)
    if mode == "verify":
        bad = 0
        for path in PAGES + TEMPLATES:
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
