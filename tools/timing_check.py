#!/usr/bin/env python3
"""Check that each page's word-highlight times (window.RV_WORD_TIMES) line up with
its narration, and optionally re-align the pages that do not.

Why: voice_all.py stamps the times with Whisper `base`, which now and then puts a
whole paragraph seconds early or late. tools/voicing_check.py's gap scan only sees
gaps above 8s, so a smaller slip passes it (found 2026-10-21: 2 of 40 pages in a new
Grade 4 batch, and 7 of 8081 pages across the older books; see the memory note
voicing-sync-check).

How: for each page the mp3 is downloaded and ffmpeg finds where speech is and where
it is silent. The stored times are compared with where each word *should* start if
the words were spoken at a steady rate by character count; the largest miss, in
seconds of speech, is the page's score. Pages normally score 0.4 to 1.5.
A page above FLAG (2.2) is suspicious. With --realign it is re-timed with Whisper
`small.en`, and the new times are used only when they score clearly better (below 1.6
and below 0.6 x the old score); with --patch they are written into the book (that
line only, by a JSON round trip; the book is never re-rendered, so no audio is lost).
Number-heavy math pages score high whichever times they carry (the numbers are spoken
as longer words than they are written), so a flag there is only acted on when the
re-timing is a clear improvement.

Usage (from anywhere; ffmpeg must be on PATH, ~/.local/bin is added automatically):
  python3 tools/timing_check.py slug1 slug2 ...                    # score only
  python3 tools/timing_check.py --realign slug1 slug2 ...          # also show the better times
  python3 tools/timing_check.py --realign --patch slug1 slug2 ...  # and write them
  options: --dir DIR (default site/books/fiction), --all (every book in DIR)
Exit code 1 if a page is flagged and not fixed.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, REPO)
os.environ["PATH"] = os.path.expanduser("~/.local/bin") + ":" + os.environ["PATH"]
FLAG = 2.2


def load_after(s, marker):
    i = s.find(marker)
    if i < 0:
        return None
    try:
        return json.JSONDecoder().raw_decode(s[i + len(marker):])[0]
    except ValueError:
        return None


def page_text(pages, pg):
    p = pages[pg]
    return p.get("text") or (p.get("title", "") + " " + p.get("subtitle", "")).strip()


def speech_segments(mp3_path):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", mp3_path, "-af", "silencedetect=noise=-38dB:d=0.3",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    d = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out)
    total = int(d.group(1)) * 3600 + int(d.group(2)) * 60 + float(d.group(3))
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    segs, cur = [], 0.0
    for k, a in enumerate(starts):
        b = ends[k] if k < len(ends) else total
        if a > cur:
            segs.append((cur, a))
        cur = b
    if cur < total:
        segs.append((cur, total))
    return segs


def speech_pos(t, segs):
    acc = 0.0
    for a, b in segs:
        if t >= b:
            acc += b - a
        elif t > a:
            acc += t - a
    return acc


def score(times, text, segs):
    toks = text.split()
    assert len(toks) == len(times), (len(toks), len(times))
    total_speech = sum(b - a for a, b in segs)
    chars = [len(t) + 1 for t in toks]
    tot, before, worst = sum(chars), 0, 0.0
    for k, t in enumerate(times):
        worst = max(worst, abs(speech_pos(t, segs) - total_speech * before / tot))
        before += chars[k]
    return worst


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("slugs", nargs="*")
    ap.add_argument("--dir", default=os.path.join(REPO, "site", "books", "fiction"))
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--realign", action="store_true")
    ap.add_argument("--patch", action="store_true")
    args = ap.parse_args()
    slugs = args.slugs
    if args.all:
        slugs = sorted(f[:-5] for f in os.listdir(args.dir) if f.endswith(".html"))
    model = None
    unfixed = 0
    for slug in slugs:
        path = os.path.join(args.dir, slug + ".html")
        s = open(path, encoding="utf-8").read()
        pages = load_after(s, "const pages=")
        marker = "window.RV_WORD_TIMES="
        times = load_after(s, marker)
        audio = load_after(s, "window.RV_AUDIO=")
        if not (isinstance(pages, list) and isinstance(times, (dict, list)) and isinstance(audio, (dict, list))):
            print(f"{slug}: not voiced or not readable, skipped")
            continue
        results, patched = [], False
        for pg in range(len(pages)):
            key = str(pg)
            old = times.get(key) if isinstance(times, dict) else (times[pg] if pg < len(times) else None)
            url = audio.get(key) if isinstance(audio, dict) else (audio[pg] if pg < len(audio) else None)
            if not old or not url:
                continue
            text = page_text(pages, pg)
            if len(text.split()) != len(old):
                results.append((pg, None, "token count differs, skipped"))
                continue
            with tempfile.TemporaryDirectory() as td:
                mp3 = os.path.join(td, "p.mp3")
                with open(mp3, "wb") as f:
                    f.write(urllib.request.urlopen(url, timeout=60).read())
                segs = speech_segments(mp3)
                old_score = score([float(e) for e in old], text, segs)
                note = "ok"
                if old_score > FLAG and args.realign:
                    import voice_all
                    import whisper
                    if model is None:
                        model = whisper.load_model("small.en")
                    voice_all._WHISPER_MODEL = model
                    new = voice_all.align_word_times(text, open(mp3, "rb").read())
                    new_score = score(new, text, segs) if len(new) == len(old) else None
                    if new_score is not None and new_score <= max(1.6, 0.6 * old_score):
                        note = f"re-timed {old_score:.2f} -> {new_score:.2f}"
                        if args.patch:
                            if isinstance(times, dict):
                                times[key] = new
                            else:
                                times[pg] = new
                            patched = True
                            note += " (written)"
                    else:
                        note = "flagged, re-timing is no better" + ("" if new_score is None else f" ({new_score:.2f})")
                        unfixed += 1
                elif old_score > FLAG:
                    note = "FLAGGED"
                    unfixed += 1
            results.append((pg, old_score, note))
        if patched:
            i = s.index(marker) + len(marker)
            parsed, end = json.JSONDecoder().raw_decode(s[i:])
            assert json.dumps(parsed) == s[i:i + end], "RV_WORD_TIMES is not in json.dumps form; not patching"
            with open(path, "w", encoding="utf-8") as f:
                f.write(s[:i] + json.dumps(times) + s[i + end:])
        bad = [r for r in results if r[1] is not None and r[1] > FLAG]
        print(f"{slug}: " + ("all pages aligned, worst %.2f" % max((r[1] for r in results if r[1] is not None), default=0)
                             if not bad else "; ".join(f"page {p} {sc:.2f} {n}" for p, sc, n in bad)))
    sys.exit(1 if unfixed else 0)


if __name__ == "__main__":
    main()
