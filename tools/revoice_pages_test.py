#!/usr/bin/env python3
"""Tests for tools/revoice_pages.py with a made-up book and made-up voice / upload / alignment functions.   python3 tools/revoice_pages_test.py"""
import json
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import revoice_pages as R
import voice_all as V

passed = failed = 0


def ok(c, n, x=None):
    global passed, failed
    if c:
        passed += 1
    else:
        failed += 1
        print("  FAIL:", n, "" if x is None else x)


PAGES = [{"type": "cover", "title": "The Lamp", "subtitle": "A Glow Story", "image": "i0"}, {"text": "The lamp went dark. Ana smiled.", "image": "i1"}, {"text": "Then it glowed again. Nobody said a word.", "image": "i2"}]
BASE = "https://m.test/books/fiction/lamp-audio/"
HTML = ("<html><body><script>const pages=" + json.dumps(PAGES) + ";</script>"
        "<script>window.RV_AUDIO=" + json.dumps({"0": BASE + "page_0.mp3", "1": BASE + "page_1.mp3?v=2", "2": BASE + "page_2.mp3"}) + ";</script>"
        "<script>window.RV_AUDIO_MARKS=" + json.dumps({"1": [{"cs": 0.5, "cf": 0.5}, {"cs": 1.0, "cf": 1.0}]}) + ";</script>"
        "<script>window.RV_WORD_TIMES=" + json.dumps({"0": [0, 0.5, 1.0, 1.5, 2.0], "1": [0, 0.3, 0.6, 0.9, 1.2, 1.5], "2": [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4]}) + ";</script>"
        "</body></html>")

d = tempfile.mkdtemp()
os.makedirs(os.path.join(d, "books", "fiction"))
path = os.path.join(d, "books", "fiction", "lamp.html")

uploads, takes = [], []


def fake_tts_multi(text, key, voice):
    takes.append((text, voice))
    return b"RAW%d" % len(takes), [{"cs": 0.5, "cf": 0.5}, {"cs": 1.0, "cf": 1.0}]


tails = []  # seconds after the last word, per take


def fake_mp3_seconds(raw):
    n = len(takes[-1][0].split())
    return (n - 1) * 0.4 + tails[len(takes) - 1]  # the last word is at (n-1)*0.4; the clip goes on for `tail` seconds after it


def fake_align(text, raw):
    n = len(text.split())
    return [round(i * 0.4, 2) for i in range(n)]  # last word at (n-1)*0.4


V.tts_multi, V.mp3_seconds, V.align_word_times = fake_tts_multi, fake_mp3_seconds, fake_align
V._write_mp3 = lambda prefix, name, raw: uploads.append((prefix, name, raw)) or "https://m.test/" + prefix + "/" + name + ".mp3"


def reset(t):
    open(path, "w").write(HTML)
    del uploads[:], takes[:]
    tails[:] = t


# a clean second take: the page is voiced, uploaded under the same name, linked with a new ?v, times and marks replaced
reset([1.0])
ch = R.revoice(path, [1], "KEY")
h = open(path).read()
A = R.window_value(h, "RV_AUDIO")[2]
ok(ch == ["1"] and len(takes) == 1 and takes[0][1] == V.VOICES["fiction"], "one take of the right voice for the right page", (ch, takes))
ok(uploads == [("books/fiction/lamp-audio", "page_1", b"RAW1")], "uploaded under the same name in the book's audio folder", uploads)
ok(A["1"] == "https://m.test/books/fiction/lamp-audio/page_1.mp3?v=3" and A["0"].endswith("page_0.mp3") and A["2"].endswith("page_2.mp3"), "page 1 has a new ?v=3 (it was ?v=2); the other pages are untouched", A)
T = R.window_value(h, "RV_WORD_TIMES")[2]
ok(len(T["1"]) == 6 and T["1"][-1] == 2.0 and T["0"] == [0, 0.5, 1.0, 1.5, 2.0] and len(T["2"]) == 7, "word times of that page are the new ones, the others the same", T)
M = R.window_value(h, "RV_AUDIO_MARKS")[2]
ok(M["1"][0]["cs"] == 0.5 and set(M) == {"1"}, "sentence marks kept for the page", M)
ok("const pages=" in h and h.count("window.RV_AUDIO=") == 1, "the rest of the page is intact")

# a runaway take is voiced again, and the take with the short tail is the one used
reset([9.0, 8.0, 1.5])
ch = R.revoice(path, [2], "KEY")
ok(ch == ["2"] and len(takes) == 3 and uploads[0][2] == b"RAW3", "a runaway take is voiced again until the tail is short", (ch, len(takes), uploads))
# every take odd: nothing is changed
reset([9.0, 8.0, 7.0])
before = open(path).read()
ch = R.revoice(path, [2], "KEY")
ok(ch == [] and open(path).read() == before and not uploads, "when every take is odd nothing is uploaded and the page is not changed", (ch, uploads))
# the cover (page 0) and a page without text / without audio
reset([1.0])
ch = R.revoice(path, [0, 9], "KEY")
ok(ch == ["0"] and takes[0][0] == "The Lamp. A Glow Story.", "the cover is voiced as title and subtitle", (ch, takes))
ok(R.next_version("a.mp3") == 2 and R.next_version("a.mp3?v=4") == 5 and R.next_version(None) == 2, "next ?v number")

print("%d passed, %d failed" % (passed, failed))
sys.exit(1 if failed else 0)
