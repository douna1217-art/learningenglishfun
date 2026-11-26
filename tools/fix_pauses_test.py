#!/usr/bin/env python3
"""Tests for tools/fix_pauses.py on a real little mp3 made with ffmpeg (no network, nothing uploaded).   python3 tools/fix_pauses_test.py"""
import json
import os
import shutil
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fix_pauses as FP

passed = failed = 0


def ok(cond, name, extra=None):
    global passed, failed
    if cond:
        passed += 1
    else:
        failed += 1
        print("  FAIL:", name, "" if extra is None else extra)


if not (shutil.which("ffmpeg") and shutil.which("ffprobe")):
    print("fix_pauses_test: skipped (ffmpeg not installed)")
    sys.exit(0)


def mp3(spec):
    return subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", spec, "-ac", "1", "-ar", "24000", "-b:a", "64k", "-f", "mp3", "pipe:1"],
                          capture_output=True, check=True).stdout


# the pure helpers
ok(FP.cuts_for([(0.0, 0.25), (2.0, 6.0), (7.0, 8.0), (9.0, 12.0)], 12.0) == [(2.5, 5.5)], "only a long silence in the middle is cut, to 1 s; short ones and the end are left")
ok(FP.shift(1.0, [(2.5, 5.5)]) == 1.0 and FP.shift(6.0, [(2.5, 5.5)]) == 3.0 and FP.shift(3.0, [(2.5, 5.5)]) is None, "times after a cut move back by its length; a time inside it is None")
ok(FP.shift(3.0, [(2.5, 5.5)], clamp=True) == 2.5, "with clamp, a time inside a cut goes to where the cut is")
ok(FP.shift(10.0, [(1.0, 2.0), (4.0, 7.0)]) == 6.0, "two cuts add up")

# a page: 2 s of voice, 4.5 s of silence, 2 s of voice; words at 0, 0.8, 1.6 and then 6.5, 7.3
raw = mp3("sine=f=300:d=2,apad=pad_dur=4.5[a];sine=f=300:d=2[b];[a][b]concat=n=2:v=0:a=1")
html = ('<script>window.RV_AUDIO={"0": "https://m.test/books/fiction/kite-audio/page_0.mp3", "3": "https://m.test/books/fiction/kite-audio/page_3.mp3"};</script>'
        '<script>window.RV_AUDIO_MARKS={"3": [{"cs": 0.5, "cf": 0.75}, {"cs": 1.0, "cf": 1.0}]};</script>'
        '<script>window.RV_WORD_TIMES={"0": [0.0, 0.5], "3": [0.0, 0.8, 1.6, 6.5, 7.3]};</script>')
uploads = []
FP.download = lambda url: raw


def upload(folder, name, data):
    uploads.append((folder, name, data))
    return "https://m.test/%s/%s.mp3" % (folder, name)


same, msg = FP.fix_page(html, "3", dry_run=True)
ok(same == html and msg.startswith("would cut page 3") and not uploads, "dry run: says what it would cut and changes nothing", msg)

new, msg = FP.fix_page(html, "3", upload=upload, audio_dir="books/fiction/kite-audio")
R = FP.R
t = R.window_value(new, "RV_WORD_TIMES")[2]
a = R.window_value(new, "RV_AUDIO")[2]
m = R.window_value(new, "RV_AUDIO_MARKS")[2]
ok(len(uploads) == 1 and uploads[0][1] == "page_3", "the new clip is uploaded as the same page", [u[:2] for u in uploads])
ok(a["3"].endswith("page_3.mp3?v=2") and a["0"].endswith("page_0.mp3"), "the page gets a new ?v=2; other pages keep their link", a)
cut = 6.5 - t["3"][3]
ok(t["3"][:3] == [0.0, 0.8, 1.6] and 3.0 < cut < 4.0 and abs((t["3"][4] - t["3"][3]) - 0.8) < 0.01, "word times before the silence stay, after it move back by what was cut", (t["3"], cut))
ok(t["0"] == [0.0, 0.5], "other pages' word times are untouched", t["0"])
new_sil, new_dur = FP.A.silences(uploads[0][2])
ok(new_dur and abs(new_dur - (8.5 - cut)) < 0.25, "the new clip is shorter by exactly the cut", (new_dur, cut))
ok(all(b - x < FP.LONG for x, b in new_sil), "no long silence left in the new clip", new_sil)
ok(abs(t["3"][3] - (2.0 + FP.KEEP)) < 0.3, "the voice comes back about 1 s after it stopped", t["3"])
ok(m["3"][1]["cf"] == 1.0 and m["3"][0]["cs"] == 0.5 and 0 < m["3"][0]["cf"] < 1, "the sentence marks are moved too, the end stays the end", m["3"])
ok(json.loads(json.dumps(m)) == m, "the marks are still plain JSON")

# a page whose word times do not fit the audio (a word inside the silence) is left alone
bad = html.replace("[0.0, 0.8, 1.6, 6.5, 7.3]", "[0.0, 0.8, 4.0, 6.5, 7.3]")
same, msg = FP.fix_page(bad, "3", upload=upload, audio_dir="x")
ok(same == bad and "NOT changed" in msg and len(uploads) == 1, "word times that do not match the audio: nothing is cut or uploaded", msg)

# a page with no long silence
FP.download = lambda url: mp3("sine=f=300:d=4")
same, msg = FP.fix_page(html, "3", upload=upload, audio_dir="x")
ok(same == html and "nothing to cut" in msg, "no long silence: nothing to do", msg)

print("%d passed, %d failed" % (passed, failed))
sys.exit(1 if failed else 0)
