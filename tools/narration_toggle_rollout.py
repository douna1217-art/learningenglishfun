#!/usr/bin/env python3
"""One-tap read-aloud buttons: tap = read, tap again = pause, tap again = continue.

Before: "This Page" and "Full Story" only started reading; pausing and resuming needed a
separate "Pause" button. Now the Pause button is gone and the two read-aloud buttons behave
like the little speaker buttons in the grammar/vocabulary explanations:
    idle      🔊 This Page  /  📖 Full Story   (red)
    reading   ⏸ ...                            (green)
    paused    ▶ ...                            (amber)
Tapping the other read-aloud button while one is reading or paused switches to it. Turning
the page (Next/Back/dots) stops reading and puts both buttons back to idle. A single page that
reads to its end now also puts its button back to idle (it used to stay green).

Edits (exact text, each must occur exactly once per page):
  A  remove the Pause button            (pages + tools/templates/human_book_head.html)
  B  setListenActive -> state + labels  (pages + tools/templates/human_book_tail.js)
  C  old Pause handler -> tap-to-toggle wrapper around the two read-aloud buttons
  D  speakAudio: audio that ends by itself calls endNarration() when nobody else will
  E  goPage: stop reading state when the page changes
  F  CSS: the paused (amber) state; on phones Record takes a whole row so five buttons
     do not leave one alone   (pages + head template)
No book text, picture, quiz, voice file or word-timing data is touched.

Usage:
  python3 tools/narration_toggle_rollout.py check    # dry run (default)
  python3 tools/narration_toggle_rollout.py apply    # patch templates + every page, then verify
  python3 tools/narration_toggle_rollout.py verify   # re-check files on disk against git HEAD

Safety: `apply` first checks EVERY file and writes nothing unless each edit applies exactly
once everywhere. Afterwards each page is verified: (a) it equals git HEAD with the same edits
applied, (b) every window.RV_* audio/timing block is byte-identical, (c) the main script
parses with node. Also run tools/book_load_test.js and tools/legacy_syntax_check.js.
"""
import glob
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

# ---------------------------------------------------------------- the edits
A_OLD = '<button class="audio-btn" id="pauseBtn" disabled>⏸ Pause</button>'
A_NEW = ''

B_OLD = 'function setListenActive(id){["listenPageBtn","listenStoryBtn"].forEach(x=>{var el=document.getElementById(x);if(el)el.classList.toggle("active",x===id);});}'
B_NEW = (
    'var __nOwner=null,__nPaused=false;\n'
    'function narrUI(){[["listenPageBtn","page","🔊","This Page"],["listenStoryBtn","story","📖","Full Story"]].forEach(function(r){'
    'var el=document.getElementById(r[0]);if(!el)return;'
    'var st=__nOwner!==r[1]?"idle":(__nPaused?"paused":"playing");'
    'el.classList.toggle("active",st==="playing");el.classList.toggle("paused",st==="paused");'
    'el.setAttribute("aria-pressed",st==="playing"?"true":"false");'
    'el.title=st==="playing"?"Tap to pause":st==="paused"?"Tap to continue":"";'
    'el.textContent=(st==="playing"?"⏸":st==="paused"?"▶":r[2])+" "+r[3];});}\n'
    'function setListenActive(id){if(__nPaused){try{speechSynthesis.resume();}catch(e){}}'
    '__nOwner=id==="listenPageBtn"?"page":id==="listenStoryBtn"?"story":null;__nPaused=false;narrUI();}'
)

C_OLD = (
    '(function(){var pb=document.getElementById("pauseBtn");if(pb){pb.onclick=function(){if(__rvAudio){if(__rvAudio.paused){var _p=__rvAudio.play();'
    'if(_p&&_p.catch)_p.catch(function(){});pb.textContent=\'⏸ Pause\';pb.classList.remove(\'active\');}else{__rvAudio.pause();'
    'pb.textContent=\'▶ Resume\';pb.classList.add(\'active\');}return;}if(speechSynthesis.paused){speechSynthesis.resume();'
    'pb.textContent="⏸ Pause";pb.classList.remove("active");}else if(speechSynthesis.speaking){speechSynthesis.pause();'
    'pb.textContent="▶ Resume";pb.classList.add("active");}};}})();'
)
C_NEW = (
    '(function(){function toggle(){if(__nPaused){'
    'if(__rvAudio){var p=__rvAudio.play();if(p&&p.catch)p.catch(function(){});}else{try{speechSynthesis.resume();}catch(e){}}'
    '__nPaused=false;}else{'
    'if(__rvAudio){try{__rvAudio.pause();}catch(e){}}else{try{speechSynthesis.pause();}catch(e){}}'
    '__nPaused=true;}narrUI();}'
    '[["listenPageBtn","page"],["listenStoryBtn","story"]].forEach(function(r){'
    'var b=document.getElementById(r[0]);if(!b)return;var orig=b.onclick;'
    'b.onclick=function(ev){if(__nOwner===r[1]){toggle();return;}'
    'try{speechSynthesis.cancel();speechSynthesis.resume();}catch(e){}'
    'if(orig)return orig.call(this,ev);};});})();'
)

D_OLD = 'a.onended=function(){stopRvAudio();clearHighlight();if(onEnd)onEnd();};'
D_NEW = 'a.onended=function(){stopRvAudio();clearHighlight();if(onEnd)onEnd();else endNarration();};'

E_OLD = 'function goPage(i){window.__readToken=(window.__readToken||0)+1;speechSynthesis.cancel();cancelFallback();clearHighlight();'
E_NEW = E_OLD + 'setListenActive(null);'

F_OLD = '.audio-btn.primary.active{background:#1f8f4d}'
F_NEW = (F_OLD + '\n.audio-btn.paused{background:#e69500;color:#fff}'
         '\n@media(max-width:680px){.audio-actions .audio-btn.record{grid-column:1/-1}}')

PATCHES = {"A": (A_OLD, A_NEW), "B": (B_OLD, B_NEW), "C": (C_OLD, C_NEW),
           "D": (D_OLD, D_NEW), "E": (E_OLD, E_NEW), "F": (F_OLD, F_NEW)}

PAGES = sorted(glob.glob(os.path.join(REPO, "site", "books", "*", "*.html")))
HEAD_TEMPLATE = os.path.join(HERE, "templates", "human_book_head.html")
TAIL_TEMPLATE = os.path.join(HERE, "templates", "human_book_tail.js")
SCOPE = {p: "ABCDEF" for p in PAGES}
SCOPE[HEAD_TEMPLATE] = "AF"
SCOPE[TAIL_TEMPLATE] = "BCDE"
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


def apply_edits(t, letters):
    """Return (new text, problem or None). Every edit must apply exactly once."""
    for k in letters:
        old, new = PATCHES[k]
        if t.count(old) != 1:
            return None, f"edit {k}: old text found {t.count(old)} times"
        t = t.replace(old, new, 1)
    return t, None


def plan():
    todo, done, problems = [], [], []
    for path, letters in SCOPE.items():
        t = read(path)
        marker = ".audio-btn.paused" if path == HEAD_TEMPLATE else "function narrUI("
        if marker in t:
            done.append(path)
            continue
        new, problem = apply_edits(t, letters)
        if problem:
            problems.append((path, problem))
        else:
            todo.append((path, new))
    return todo, done, problems


def verify_file(path):
    t = read(path)
    letters = SCOPE[path]
    errs = []
    head = git_head(path)
    if head is None:
        return ["not tracked in git HEAD"]
    expected, problem = apply_edits(head, letters)
    if problem:
        errs.append("git HEAD cannot take the edits: " + problem)
    elif t != expected:
        errs.append("file is not exactly git HEAD plus the edits")
    if path.endswith(".html") and "/site/books/" in path:
        if 'id="pauseBtn"' in t:
            errs.append("Pause button still present")
        if RV.findall(t) != RV.findall(head):
            errs.append("an audio/timing block changed")
        if main_script_ok(t) is False:
            errs.append("main script does not parse")
    return errs


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "check"
    if mode not in ("check", "apply", "verify"):
        sys.exit(__doc__)
    todo, done, problems = plan()
    print(f"files: {len(SCOPE)} | to patch: {len(todo)} | already patched: {len(done)} | problems: {len(problems)}")
    for path, why in problems[:10]:
        print("  PROBLEM", os.path.relpath(path, REPO), why)
    if mode == "verify":
        bad = 0
        for path in SCOPE:
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
