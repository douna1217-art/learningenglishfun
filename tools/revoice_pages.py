#!/usr/bin/env python3
"""Voice single pages of a book again.

voice_all.py voices a whole book and then leaves it alone, so a page whose audio went wrong (the library audit calls it a "runaway tail": the clip
runs on long after the last word) cannot be redone with it. This voices just the pages you name, in the same voice as the book's subject, checks
that the new clip ends soon after its last word (voicing it again up to 3 times if not), uploads it to the same place and updates the page's
audio link (a new ?v=N, so browsers do not keep playing the old file), its word times and its sentence marks. Run it on your own Mac, where
voice_all.py already works (the OpenAI key is asked for, hidden; the Tencent COS login is read from .cos_credentials; Whisper is used for the word times).

    python3 tools/revoice_pages.py the-lantern-that-lost-its-glow:4 the-sock-puppet-swap:3 building-a-map-of-north-america:5

Each argument is  book-slug:page  (page 0 is the cover). Afterwards: look at the change (git diff), try the pages in the browser, commit, and run the
library audit again.  python3 tools/revoice_pages.py --help
"""
import argparse
import glob
import json
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, ROOT)
import voice_all as V  # noqa: E402

TAIL_OK = 2.5  # seconds of sound allowed after the last word


def window_value(html, name):
    """(start, end, value) of the JSON after `window.NAME=`, or None"""
    m = re.search(r"window\." + name + r"\s*=\s*", html)
    if not m:
        return None
    try:
        val, n = json.JSONDecoder().raw_decode(html[m.end():])
    except ValueError:
        return None
    return m.end(), m.end() + n, val


def set_window_value(html, name, value):
    w = window_value(html, name)
    if w is None:
        return html
    return html[:w[0]] + json.dumps(value) + html[w[1]:]


def next_version(url):
    m = re.search(r"[?&]v=(\d+)", url or "")
    return (int(m.group(1)) + 1) if m else 2


def find_book(slug):
    f = sorted(glob.glob(os.path.join(ROOT, "site", "books", "*", slug + ".html")))
    if not f:
        sys.exit("No book called %r under site/books." % slug)
    return f[0]


def voice_page(text, key, voice, tries=3):
    """(mp3 bytes, marks, word times, seconds, tail) of the best of up to `tries` takes; a take whose tail is short is taken at once"""
    best = None
    for n in range(1, tries + 1):
        raw, marks = V.tts_multi(text, key, voice)
        secs = V.mp3_seconds(raw)
        wt = V.align_word_times(text, raw)
        tail = (secs - wt[-1]) if (secs is not None and wt) else None
        print("      take %d: %s s long, last word at %s s%s" % (n, "?" if secs is None else "%.1f" % secs, "?" if not wt else "%.1f" % wt[-1], "" if tail is None else ", %.1f s after it" % tail))
        take = (raw, marks, wt, secs, tail)
        if best is None or (tail is not None and (best[4] is None or tail < best[4])):
            best = take
        if tail is not None and tail <= TAIL_OK:
            return take, True
    return best, False


def revoice(path, pages, key):
    html = open(path, encoding="utf-8").read()
    topic = os.path.basename(os.path.dirname(path))
    voice = V.VOICES.get(topic, V.DEFAULT_VOICE)
    slug = os.path.splitext(os.path.basename(path))[0]
    audio_dir, _ = V._audio_dir_for(path)
    texts = dict(V.get_narration(html) or [])
    changed = []
    for k in pages:
        k = str(k)
        if k not in texts:
            print("   page %s of %s has no text to voice: skipped" % (k, slug))
            continue
        a, m, t = window_value(html, "RV_AUDIO"), window_value(html, "RV_AUDIO_MARKS"), window_value(html, "RV_WORD_TIMES")
        if a is None or k not in a[2]:
            print("   page %s of %s has no audio yet: use voice_all.py for a book that is not voiced" % (k, slug))
            continue
        print("   %s page %s (%s voice): %s" % (slug, k, voice, texts[k][:70].replace("\n", " ")))
        (raw, marks, wt, secs, tail), good = voice_page(texts[k], key, voice)
        if not good:
            print("      still odd after 3 takes: NOT changed (listen to the page, or try again)")
            continue
        url = V._write_mp3(audio_dir, "page_" + k, raw).split("?")[0] + "?v=%d" % next_version(a[2][k])
        audio = dict(a[2])
        audio[k] = url
        html = set_window_value(html, "RV_AUDIO", audio)
        if m is not None:
            marks_map = dict(m[2])
            if marks:
                marks_map[k] = marks
            else:
                marks_map.pop(k, None)
            html = set_window_value(html, "RV_AUDIO_MARKS", marks_map)
        elif marks:
            print("      (this book has no sentence marks block; the marks of this page are left out)")
        if t is not None and wt:
            times = dict(t[2])
            times[k] = wt
            html = set_window_value(html, "RV_WORD_TIMES", times)
        changed.append(k)
        print("      done: %s" % url)
    if changed:
        open(path, "w", encoding="utf-8").write(html)
    return changed


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pages", nargs="+", help="book-slug:page, for example the-lantern-that-lost-its-glow:4")
    args = ap.parse_args(argv)
    want = {}
    for a in args.pages:
        slug, _, page = a.partition(":")
        if not page.isdigit():
            sys.exit("%r is not book-slug:page" % a)
        want.setdefault(slug, []).append(int(page))
    key = V.get_key()
    done = 0
    for slug, pages in want.items():
        done += len(revoice(find_book(slug), pages, key))
    print("\n%d page(s) voiced again. Check them in the browser, then commit and run the library audit again." % done)


if __name__ == "__main__":
    main()
