#!/usr/bin/env python3
"""Shorten the long silences inside a page's narration, without voicing it again.

The library audit (tools/site_audit.py --online) listens to every page whose word times have a gap of more than 3 s and lists those where the
audio really is silent there (tools/audit/pauses.json, "fix": "trim"): a child hears nothing for several seconds and thinks the book is stuck.
This downloads such a page's audio, cuts every silence of 2 s or more in the middle of it down to 1 s (the voice itself is untouched), moves the
word times and the sentence marks of the page by the time that was cut, uploads the new clip to the same place with a new ?v=N (so browsers do not
keep the old one) and updates the page. No OpenAI key is needed and Whisper is not run: the new word times are the old ones, shifted.

Run it on your own Mac, where voice_all.py already uploads (the Tencent COS login is read from .cos_credentials). It needs ffmpeg.

    python3 tools/fix_pauses.py a-birthday-between-two-worlds:3 the-second-clarinet:1
    python3 tools/fix_pauses.py --dry-run a-birthday-between-two-worlds:3     # only say what would be cut

Each argument is  book-slug:page  (page 0 is the cover). Afterwards: look at the change (git diff), listen to the pages, commit, and run the
library audit again.
"""
import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, ".."))
import revoice_pages as R  # noqa: E402  (window_value, set_window_value, next_version, find_book)
import site_audit as A  # noqa: E402  (silences)

LONG = 2.0   # a silence this long or longer (in the middle of the clip) is shortened
KEEP = 1.0   # ... to this
EDGE = 0.3   # silence at the very start or end of the clip is left alone


def download(url):
    try:
        with urllib.request.urlopen(url, timeout=40) as r:
            return r.read()
    except Exception as e:  # e.g. a Mac Python without certificates: requests (installed for voice_all.py) has its own
        try:
            import requests
            r = requests.get(url, timeout=40)
            r.raise_for_status()
            return r.content
        except Exception:
            raise e


def cuts_for(sil, dur):
    """[(from, to)] stretches to remove: the middle of each long silence, leaving KEEP seconds of it"""
    out = []
    for a, b in sil:
        if a > EDGE and b < dur - EDGE and b - a >= LONG:
            out.append((round(a + KEEP / 2, 3), round(b - KEEP / 2, 3)))
    return out


def shift(t, cuts, clamp=False):
    """a time in the old clip -> the same moment in the new clip; inside a removed stretch: None (or, with clamp, where the cut is)"""
    gone = 0.0
    for a, b in cuts:
        if t >= b:
            gone += b - a
        elif t > a:
            return round(a - gone, 2) if clamp else None
    return round(t - gone, 2)


def bitrate(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=bit_rate,sample_rate,channels",
                        "-of", "default=nw=1", path], capture_output=True, text=True)
    info = dict(l.split("=", 1) for l in r.stdout.split() if "=" in l)
    br = int(info["bit_rate"]) if info.get("bit_rate", "").isdigit() else 64000
    return max(32, min(192, round(br / 1000 / 8) * 8)), info.get("sample_rate"), info.get("channels")


def cut_audio(raw, cuts, dur):
    """the mp3 with the given stretches removed"""
    tmp = tempfile.mkdtemp()
    try:
        src, dst = os.path.join(tmp, "in.mp3"), os.path.join(tmp, "out.mp3")
        open(src, "wb").write(raw)
        keep, at = [], 0.0
        for a, b in cuts:
            keep.append((at, a))
            at = b
        keep.append((at, dur + 1))
        parts = "".join("[0:a]atrim=start=%.3f:end=%.3f,asetpts=PTS-STARTPTS[p%d];" % (a, b, i) for i, (a, b) in enumerate(keep))
        fc = parts + "".join("[p%d]" % i for i in range(len(keep))) + "concat=n=%d:v=0:a=1[out]" % len(keep)
        kbps, rate, ch = bitrate(src)
        cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-filter_complex", fc, "-map", "[out]",
               "-c:a", "libmp3lame", "-b:a", "%dk" % kbps]
        if rate:
            cmd += ["-ar", rate]
        if ch:
            cmd += ["-ac", ch]
        subprocess.run(cmd + [dst], check=True)
        return open(dst, "rb").read()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def fix_page(html, k, dry_run=False, upload=None, audio_dir=None, slug=""):
    """(new html, message) for page k; the html is unchanged when nothing was cut"""
    a, m, t = R.window_value(html, "RV_AUDIO"), R.window_value(html, "RV_AUDIO_MARKS"), R.window_value(html, "RV_WORD_TIMES")
    if a is None or k not in a[2]:
        return html, "page %s has no audio" % k
    if t is None or not t[2].get(k):
        return html, "page %s has no word times" % k
    url, times = a[2][k], t[2][k]
    raw = download(url)
    sil, dur = A.silences(raw)
    if not dur:
        return html, "could not read the audio of page %s" % k
    cuts = cuts_for(sil, dur)
    if not cuts:
        return html, "page %s: no silence of %.0f s or more in the middle of the audio, nothing to cut" % (k, LONG)
    new_times = [shift(x, cuts) for x in times]
    if any(x is None for x in new_times):
        return html, "page %s: a word time falls inside a silence, so the word times do not match this audio: NOT changed (voice the page again)" % k
    removed = sum(b - a2 for a2, b in cuts)
    plan = "page %s: %s -> %.1f s shorter (%.1f s -> %.1f s)" % (
        k, ", ".join("%.1f s silence at %.1f s cut to %.1f s" % (b - a2 + KEEP, a2 - KEEP / 2, KEEP) for a2, b in cuts), removed, dur, dur - removed)
    if dry_run:
        return html, "would cut " + plan
    new = cut_audio(raw, cuts, dur)
    new_url = upload(audio_dir, "page_" + k, new).split("?")[0] + "?v=%d" % R.next_version(url)
    audio = dict(a[2])
    audio[k] = new_url
    html = R.set_window_value(html, "RV_AUDIO", audio)
    if m is not None and isinstance(m[2].get(k), list):
        # a mark's "cf" is a share of the whole clip: the same moment, measured in the shorter clip
        marks = dict(m[2])
        nd = dur - removed
        marks[k] = [dict(x, cf=round(min(1.0, shift(x["cf"] * dur, cuts, clamp=True) / nd), 4)) if isinstance(x, dict) and "cf" in x else x for x in m[2][k]]
        html = R.set_window_value(html, "RV_AUDIO_MARKS", marks)
    t = R.window_value(html, "RV_WORD_TIMES")
    wt = dict(t[2])
    wt[k] = new_times
    html = R.set_window_value(html, "RV_WORD_TIMES", wt)
    return html, "cut " + plan + "\n      uploaded: " + new_url


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pages", nargs="+", help="book-slug:page, for example a-birthday-between-two-worlds:3")
    ap.add_argument("--dry-run", action="store_true", help="only say what would be cut; nothing is uploaded or changed")
    args = ap.parse_args(argv)
    if not (shutil.which("ffmpeg") and shutil.which("ffprobe")):
        sys.exit("ffmpeg is needed: brew install ffmpeg")
    want = {}
    for x in args.pages:
        slug, _, page = x.partition(":")
        if not page.isdigit():
            sys.exit("%r is not book-slug:page" % x)
        want.setdefault(slug, []).append(page)
    upload = None
    if not args.dry_run:
        import voice_all as V
        upload = V._write_mp3
    done = 0
    for slug, pages in want.items():
        path = R.find_book(slug)
        html = open(path, encoding="utf-8").read()
        audio_dir = None
        if not args.dry_run:
            import voice_all as V
            audio_dir, _ = V._audio_dir_for(path)
        before = html
        for k in pages:
            html, msg = fix_page(html, k, args.dry_run, upload, audio_dir, slug)
            print("   %s %s" % (slug, msg))
        if html != before:
            open(path, "w", encoding="utf-8").write(html)
            done += 1
    print("\n%s" % ("Dry run: nothing was changed." if args.dry_run else
                    "%d book(s) changed. Listen to the pages, look at git diff, commit, and run the library audit again." % done))


if __name__ == "__main__":
    main()
