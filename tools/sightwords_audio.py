#!/usr/bin/env python3
"""Audio for the sight-word lessons: one short clip per word (w-<word>.mp3) and one per example sentence (s-<word>.mp3).

SAMPLE ENGINE: this Mac's own voice (`say`, Samantha) turned into mp3 with ffmpeg, so the lessons can be tried right now.
The files are small, so they live in site/sightwords/audio/. The final audio should use the same voice as the stories; that
needs the OpenAI key on the owner's own computer, so it is a separate step and writes the SAME file names over these.

  python3 tools/sightwords_audio.py            # make the missing clips
  python3 tools/sightwords_audio.py --force    # remake all of them
  python3 tools/sightwords_audio.py --check    # only list what is missing
"""
import json
import os
import re
import subprocess
import sys
import tempfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(REPO, "site")
OUT = os.path.join(SITE, "sightwords", "audio")
FFMPEG = os.path.expanduser("~/.local/bin/ffmpeg")
VOICE = "Samantha"
TRIM = ("silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.05,"
        "areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.12,areverse")


def load():
    """the words of every stage (sightwords-data.js is stage 1, sightwords-data2.js stage 2, sightwords-data3.js stage 3)"""
    data = None
    for fn in ("sightwords-data.js", "sightwords-data2.js", "sightwords-data3.js"):
        path = os.path.join(SITE, fn)
        if not os.path.exists(path):
            continue
        s = open(path, encoding="utf-8").read()
        d = json.loads(s[s.index("{"): s.rindex("}") + 1])
        if data is None:
            data = d
        else:
            data["words"].update(d["words"])
    return data


def key(w):
    return re.sub(r"[^a-z]", "", w.lower())


def make(text, path, rate):
    with tempfile.TemporaryDirectory() as tmp:
        aiff = os.path.join(tmp, "x.aiff")
        subprocess.run(["say", "-v", VOICE, "-r", str(rate), "-o", aiff, text], check=True)
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", aiff, "-af", TRIM, "-ac", "1", "-ar", "24000",
                        "-codec:a", "libmp3lame", "-q:a", "5", path], check=True)


def main():
    data = load()
    force = "--force" in sys.argv
    jobs = []
    for w, info in data["words"].items():
        jobs.append(("w-%s.mp3" % key(w), w, 140))
        jobs.append(("s-%s.mp3" % key(w), info["s"], 150))
    os.makedirs(OUT, exist_ok=True)
    missing = [j for j in jobs if force or not os.path.exists(os.path.join(OUT, j[0]))]
    print("%d clips in all, %d to make" % (len(jobs), len(missing)))
    if "--check" in sys.argv:
        for j in missing:
            print("missing", j[0])
        return 1 if missing else 0
    for i, (fn, text, rate) in enumerate(missing, 1):
        make(text, os.path.join(OUT, fn), rate)
        if i % 30 == 0:
            print("  made", i)
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT) if f.endswith(".mp3"))
    print("done: %d files, %.1f MB" % (len([f for f in os.listdir(OUT) if f.endswith(".mp3")]), total / 1e6))
    return 0


if __name__ == "__main__":
    sys.exit(main())
