#!/usr/bin/env python3
"""Roll the new "Let's learn" speaker button out to every book page and to the shared
templates. The exact old/new code lives in teach_speaker_patch.py (single source of truth).

What changes in a book page (nothing else is touched, audio blocks included):
  1. the CSS rules for the button (added after `.teach .cn{...}`)
  2. playTeachAudio + renderTeach (old one-shot player replaced by a pause/resume player)
  3. the speechSynthesis.cancel wrapper (starting story narration also stops a teach clip)

Usage:
  python3 tools/teach_speaker_rollout.py check    # dry run, writes nothing (default)
  python3 tools/teach_speaker_rollout.py apply    # patch templates + all pages, then verify
  python3 tools/teach_speaker_rollout.py verify   # re-check files on disk against git HEAD

Safety: `apply` first checks EVERY file and writes NOTHING if any file does not match
exactly. After writing it verifies each page: (a) the main script still parses with
node, (b) every window.RV_* audio/timing block is byte-identical, (c) undoing the three
edits gives back exactly the file that is in git HEAD.
"""
import glob
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import teach_speaker_patch as P

PAGES = sorted(glob.glob(os.path.join(REPO, "site", "books", "*", "*.html")))
SKIP = {"speaker-preview.html"}          # the preview page is handled separately
PAGES = [p for p in PAGES if os.path.basename(p) not in SKIP]
TEMPLATES = [
    (os.path.join(REPO, "tools", "templates", "human_book_tail.js"), P.EDITS[:2]),
    (os.path.join(REPO, "tools", "templates", "human_book_head.html"), P.EDITS[2:]),
]
RV = re.compile(r"<script>window\.RV_[A-Z_]+=.*?;</script>", re.S)


def read(p):
    return open(p, encoding="utf-8", newline="").read()


def undo(html, edits):
    for _label, old, new in reversed(edits):
        if html.count(new) != 1:
            return None
        html = html.replace(new, old, 1)
    return html


def node_ok(html):
    mains = [s for s in re.findall(r"<script>(.*?)</script>", html, re.S) if "const pages=" in s]
    if len(mains) != 1:
        return False
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(mains[0])
        path = f.name
    try:
        return subprocess.run(["node", "--check", path], capture_output=True).returncode == 0
    finally:
        os.remove(path)


def git_head(path):
    rel = os.path.relpath(path, REPO)
    r = subprocess.run(["git", "show", "HEAD:" + rel], cwd=REPO, capture_output=True)
    return r.stdout.decode("utf-8") if r.returncode == 0 else None


def plan():
    """-> (todo[(path, new_text, edits)], already_done[path], problems[(path, details)])"""
    todo, done, problems = [], [], []
    targets = [(p, P.EDITS) for p in PAGES] + TEMPLATES
    for path, edits in targets:
        html = read(path)
        if all(new in html for _l, _o, new in edits) and not any(old in html for _l, old, new in edits if old not in new):
            done.append(path)
            continue
        new_html, probs = P.patch_text(html, edits)
        if probs:
            problems.append((path, probs))
        else:
            todo.append((path, new_html, edits))
    return todo, done, problems


def verify_page(path, edits):
    html = read(path)
    errs = []
    for label, old, new in edits:
        if html.count(new) != 1:
            errs.append(f"new code for '{label}' not present exactly once")
        if old not in new and old in html:
            errs.append(f"old code for '{label}' still present")
    if path.endswith(".html") and "/site/books/" in path:
        if not node_ok(html):
            errs.append("main script does not parse")
        head = git_head(path)
        if head is None:
            errs.append("not tracked in git HEAD, cannot compare")
        else:
            back = undo(html, edits)
            if back != head:
                errs.append("undoing the three edits does not give back git HEAD")
            if RV.findall(html) != RV.findall(head):
                errs.append("an audio/timing block changed")
    return errs


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "check"
    if mode not in ("check", "apply", "verify"):
        sys.exit(__doc__)
    todo, done, problems = plan()
    print(f"pages: {len(PAGES)} | templates: {len(TEMPLATES)} | to patch: {len(todo)} | already patched: {len(done)} | problems: {len(problems)}")
    for path, probs in problems[:10]:
        print("  PROBLEM", os.path.relpath(path, REPO), probs)
    if mode == "verify":
        bad = 0
        for path, edits in [(p, P.EDITS) for p in PAGES] + TEMPLATES:
            e = verify_page(path, edits)
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
    for path, new_html, _edits in todo:
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(new_html)
    print(f"wrote {len(todo)} file(s); verifying every one...")
    bad = 0
    for path, _new, edits in todo:
        e = verify_page(path, edits)
        if e:
            bad += 1
            print("  FAIL", os.path.relpath(path, REPO), e)
    print("apply:", "ALL OK" if not bad else f"{bad} file(s) FAILED verification; restore with `git checkout -- site tools`")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
