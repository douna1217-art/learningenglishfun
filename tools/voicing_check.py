#!/usr/bin/env python3
"""Post-voicing verification for books that voice_all.py has just narrated.

Committed, permanent replacement for the throwaway whisper_check scripts that
kept being rewritten (and evicted) between sessions. Two automated checks:

1. GAP SCAN (instant, no audio download). Every page's window.RV_WORD_TIMES
   array should advance a word at a time; a gap above MAX_GAP seconds means the
   narration has a runaway tail. This is how the "the-kite-that-hiccupped"
   defect was caught: gpt-4o-mini-tts finished the real sentence, then kept
   generating ~60s of repeated garbage, and the last word's timestamp landed
   deep inside that tail.

2. WHISPER COMPLETENESS (downloads each clip, local `small.en`). Compares what
   was spoken with the page text / grammar-teach English:
     overlap = share of expected words that were heard   (flag below 0.80)
     extra   = heard word count / expected word count    (flag above 1.5)
   Overlap alone is BLIND to the runaway tail (all expected words are still
   present), which is why `extra` exists. How to read a flag: low overlap with
   extra near 1.0 and a normal duration is usually an ASR mishearing (for
   example "brass latch" heard as "bra slatch"); extra above 1.5 or a very long
   duration is a real runaway tail. Use small.en, not base.en (base.en is far
   noisier).

Not automated here: highlight sync. In a browser, attach a MutationObserver to
every `.story-word` span watching for the `reading` class, click "This Page",
and confirm every word index lights up once, in order, through the last word.

Usage (from anywhere):
  python3 tools/voicing_check.py slug1 slug2 ...            # gap scan + whisper
  python3 tools/voicing_check.py --gaps-only slug1 slug2    # instant scan only
  options: --dir DIR (default site/books/fiction)  --model small.en
Exit code 1 if anything is flagged. Whisper needs ffmpeg on PATH; this Mac has
none, so ~/.local/bin (imageio-ffmpeg symlink) is prepended automatically.
"""
import argparse
import json
import os
import re
import sys
import tempfile
import urllib.request

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DIR = os.path.join(REPO, "site", "books", "fiction")
MAX_GAP = 8.0       # seconds between consecutive word timestamps
MIN_OVERLAP = 0.80  # expected words heard
MAX_EXTRA = 1.5     # heard / expected word count


# ---------------------------------------------------------------- pure helpers
def norm(text):
    return [w for w in re.sub(r"[^a-z0-9' ]", " ", text.lower()).split() if w]


def judge(expected, heard):
    """-> (overlap, extra, flagged) for one clip."""
    ew, hw = norm(expected), norm(heard)
    overlap = len(set(ew) & set(hw)) / len(set(ew)) if ew else 1.0
    extra = len(hw) / len(ew) if ew else 1.0
    return overlap, extra, (overlap < MIN_OVERLAP or extra > MAX_EXTRA)


def gap_problems(word_times):
    """word_times: {page: [seconds...]} -> [(page, max_gap)] above MAX_GAP."""
    out = []
    for page, times in word_times.items():
        if len(times) > 1:
            gap = max(b - a for a, b in zip(times, times[1:]))
            if gap > MAX_GAP:
                out.append((page, round(gap, 2)))
    return out


def load_book(path):
    html = open(path, encoding="utf-8").read()

    def block(name):
        m = re.search(r"window\.%s=(\{.*?\})\s*;" % name, html)
        return json.loads(m.group(1)) if m else None

    m = re.search(r"const pages=(\[.*?\]);\s*\nconst quizzes=(\{.*?\});", html, re.S)
    if not m:
        raise SystemExit(f"{path}: could not find pages/quizzes JSON (unknown template?)")
    return dict(audio=block("RV_AUDIO"), teach=block("RV_TEACH_AUDIO"), times=block("RV_WORD_TIMES"),
                pages=json.loads(m.group(1)), quizzes=json.loads(m.group(2)))


def expected_clips(book):
    """-> [(label, url, expected_text)] for every narrated page and teach clip."""
    clips = []
    pages = book["pages"]
    for key, url in sorted((book["audio"] or {}).items(), key=lambda kv: int(kv[0])):
        p = pages[int(key)]
        text = (p["title"] + " " + p["subtitle"]) if p.get("type") == "cover" else p["text"]
        clips.append((f"page {key}", url, text))
    for key, urls in (book["teach"] or {}).items():
        m = re.match(r"grammar-(\d+)$", key)
        if not m or "en" not in urls:
            continue
        t = book["quizzes"]["grammar"][int(m.group(1))]["teach"]
        clips.append((f"teach {key}", urls["en"], re.sub(r"<[^>]+>", "", t[:t.find("<span")])))
    return clips


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("slugs", nargs="+")
    ap.add_argument("--dir", default=DEFAULT_DIR)
    ap.add_argument("--model", default="small.en")
    ap.add_argument("--gaps-only", action="store_true")
    args = ap.parse_args()

    problems = 0
    books = {}
    print("== gap scan ==")
    for slug in args.slugs:
        path = os.path.join(args.dir, slug + ".html")
        if not os.path.exists(path):
            print(f"{slug}: MISSING {path}")
            problems += 1
            continue
        books[slug] = load_book(path)
        if not books[slug]["audio"] or not books[slug]["times"]:
            print(f"{slug}: NOT VOICED (no RV_AUDIO / RV_WORD_TIMES)")
            problems += 1
            continue
        bad = gap_problems(books[slug]["times"])
        print(f"{slug}: {'OK' if not bad else 'SUSPICIOUS ' + str(bad)}")
        problems += len(bad)

    if not args.gaps_only:
        os.environ["PATH"] = os.path.expanduser("~/.local/bin") + os.pathsep + os.environ.get("PATH", "")
        import whisper
        model = whisper.load_model(args.model)
        total = 0
        print("\n== whisper completeness ==", flush=True)
        for slug, book in books.items():
            if not book["audio"]:
                continue
            print(slug, flush=True)
            for label, url, expected in expected_clips(book):
                fd, tmp = tempfile.mkstemp(suffix=".mp3")
                os.close(fd)
                try:
                    urllib.request.urlretrieve(url, tmp)
                    r = model.transcribe(tmp, language="en", word_timestamps=True)
                finally:
                    os.remove(tmp)
                heard = r["text"]
                dur = r["segments"][-1]["end"] if r.get("segments") else 0.0
                overlap, extra, flagged = judge(expected, heard)
                total += 1
                print(f"  {label}: overlap={overlap:.2f} extra={extra:.2f} dur={dur:.1f}s {'FLAG' if flagged else 'ok'}", flush=True)
                if flagged:
                    problems += 1
                    print(f"    expected: {expected!r}\n    heard:    {heard!r}", flush=True)
        print(f"\nclips checked: {total}")

    print("\nRESULT:", "FLAGGED, see above" if problems else "all clean")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
