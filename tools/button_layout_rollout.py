#!/usr/bin/env python3
"""Put all read-aloud / record buttons in one row beside the story text.

What changes on every book page (and in the generator templates):
  * This Page, Full Story and Record are one row next to "READ THE STORY"; the old toolbar on top is hidden.
  * Record turns into Play once the page has a recording (per page, kept in memory only); a small trash
    can deletes it. Recording stops the narration; narration stops my playback; one sound at a time.
  * Page dots + Back/Next stay at the bottom of the window; keyboard: left/right arrows, Space.
  * Soft colours = you can tap it, solid colours = it is happening now.
  * Phones: the three buttons share one row and the trash can is a small badge on the Play button.
Nothing in the book text, pictures, quizzes, voice files or word timings is touched.

Files that are added:
  tools/templates/button_layout_css.html   one <style> block, inserted right after the page's
                                           "Stacked pages" <style> block (the same anchor the earlier
                                           rollouts used). Every rule hangs on .les-btnrow.
  tools/templates/button_layout_js.html    one <script>, inserted right after the page's main script.
                                           It adds .les-btnrow to <body> only after a successful setup and
                                           puts the original buttons back if anything fails.
Generator templates: the style goes into human_book_head.html, the script into human_book_tail.js
(right after the main script's closing </script>), so newly built books get it too.

Usage:
  python3 tools/button_layout_rollout.py check    # dry run (default)
  python3 tools/button_layout_rollout.py apply    # patch templates + every page, then verify
  python3 tools/button_layout_rollout.py verify   # re-check files on disk against git HEAD

Safety: `apply` first checks EVERY file and writes nothing unless each file takes the insertion
exactly once. Afterwards each page is verified: it equals git HEAD with the same insertions, every
window.RV_* block is byte-identical, and the main script and the new script both parse with node.
"""
import glob
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

def _read_template(name):
    with open(os.path.join(HERE, "templates", name), encoding="utf-8", newline="") as f:
        return f.read()

STYLE = _read_template("button_layout_css.html")
SCRIPT = _read_template("button_layout_js.html")
MARK_CSS = "/*les-button-layout-css*/"
MARK_JS = "/*les-button-layout-js*/"
ANCHOR = "/* Stacked pages: full-width art above the reading text. */"

PAGES = sorted(glob.glob(os.path.join(REPO, "site", "books", "*", "*.html")))
HEAD_TEMPLATE = os.path.join(HERE, "templates", "human_book_head.html")
TAIL_TEMPLATE = os.path.join(HERE, "templates", "human_book_tail.js")
FILES = PAGES + [HEAD_TEMPLATE, TAIL_TEMPLATE]
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


def new_script_ok():
    return node_check(re.search(r"<script>(.*?)</script>", SCRIPT, re.S).group(1))


def put_style(t):
    if t.count(ANCHOR) != 1:
        return None, f"style anchor found {t.count(ANCHOR)} times"
    j = t.find("</style>", t.index(ANCHOR))
    if j < 0:
        return None, "the style block holding the anchor is not closed"
    j += len("</style>")
    return t[:j] + STYLE + t[j:], None


def put_script(t, template):
    """SCRIPT goes right after the main script. In pages the main script starts at 'const pages=';
    the tail template begins inside it, so its first </script> is the end of the main script."""
    if template:
        e = t.find("</script>")
    else:
        if t.count("const pages=") != 1:
            return None, f"'const pages=' found {t.count('const pages=')} times"
        e = t.find("</script>", t.index("const pages="))
    if e < 0:
        return None, "main script is not closed"
    e += len("</script>")
    return t[:e] + "\n" + SCRIPT + t[e:], None


def patched(path, t):
    """Return (new text, problem). Pages get both; the head template only the style; the tail only the script."""
    if path == HEAD_TEMPLATE:
        return put_style(t)
    if path == TAIL_TEMPLATE:
        return put_script(t, True)
    s, problem = put_style(t)
    if problem:
        return None, problem
    return put_script(s, False)


def done_state(path, t):
    n_css, n_js = t.count(MARK_CSS), t.count(MARK_JS)
    want_css = 0 if path == TAIL_TEMPLATE else 1
    want_js = 0 if path == HEAD_TEMPLATE else 1
    return (n_css, n_js) == (want_css, want_js), (n_css, n_js)


def plan():
    todo, done, problems = [], [], []
    for path in FILES:
        t = read(path)
        ok, counts = done_state(path, t)
        if ok:
            done.append(path)
        elif counts != (0, 0):
            problems.append((path, f"partly patched or duplicated (css, js) = {counts}"))
        else:
            new, problem = patched(path, t)
            (problems.append((path, problem)) if problem else todo.append((path, new)))
    return todo, done, problems


def verify_file(path):
    t = read(path)
    errs = []
    ok, counts = done_state(path, t)
    if not ok:
        errs.append(f"markers (css, js) = {counts}")
    head = git_head(path)
    if head is None:
        return errs + ["not tracked in git HEAD"]
    expected, problem = patched(path, head)
    if problem:
        errs.append("git HEAD cannot take the insertion: " + problem)
    elif t != expected:
        errs.append("file is not exactly git HEAD plus the new block(s)")
    if path in PAGES:
        if RV.findall(t) != RV.findall(head):
            errs.append("an audio/timing block changed")
        if main_script_ok(t) is False:
            errs.append("main script does not parse")
    return errs


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "check"
    if mode not in ("check", "apply", "verify"):
        sys.exit(__doc__)
    if not new_script_ok():
        sys.exit("The new button script does not parse; nothing was written.")
    todo, done, problems = plan()
    print(f"files: {len(FILES)} | to patch: {len(todo)} | already patched: {len(done)} | problems: {len(problems)}")
    for path, why in problems[:10]:
        print("  PROBLEM", os.path.relpath(path, REPO), why)
    if mode == "verify":
        bad = 0
        for path in FILES:
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
