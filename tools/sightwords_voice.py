#!/usr/bin/env python3
"""Sight words: the real voice. Replaces the placeholder clips in site/sightwords/audio/ with OpenAI voice clips.

One short clip per word (w-<word>.mp3) and one per example sentence (s-<word>.mp3), the same file names the lessons already play,
so nothing else changes. The voice is the one the story books use for the youngest readers (fable, gpt-4o-mini-tts).
Run it on your own computer: your key stays with you (it is read from OPENAI_API_KEY or asked for, hidden while you type).

  python3 /Users/nadou/Desktop/learningenglishfun/tools/sightwords_voice.py              # voice every clip that is not done yet
  python3 /Users/nadou/Desktop/learningenglishfun/tools/sightwords_voice.py --dry        # only count, no key, no cost
  python3 /Users/nadou/Desktop/learningenglishfun/tools/sightwords_voice.py --only a the # just these words (their word clip and sentence clip)
  python3 /Users/nadou/Desktop/learningenglishfun/tools/sightwords_voice.py --force      # redo everything
  python3 /Users/nadou/Desktop/learningenglishfun/tools/sightwords_voice.py --redo w-the.mp3 s-it.mp3   # redo just these clips (and anything missing)

Hard words ("a", "the", "I"...) can come out as the letter name instead of the word. Try several ways of saying one, listen, and pick:

  python3 /Users/nadou/Desktop/learningenglishfun/tools/sightwords_voice.py --try a the  # makes site/sightwords/audio/_try/a-1.mp3, a-2.mp3 ...
  python3 /Users/nadou/Desktop/learningenglishfun/tools/sightwords_voice.py --use a-2    # the word clip of "a" becomes that one

Afterwards, listen with Whisper (no key, no cost) to catch a dropped word or a long tail:

  python3 /Users/nadou/Desktop/learningenglishfun/tools/sightwords_voice.py --check

A small file, site/sightwords/audio/voice.json, remembers which clips are done (and with which text), so a re-run only voices what is
missing or changed.
"""
import getpass
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(REPO, "site")
OUT = os.path.join(SITE, "sightwords", "audio")
TRY = os.path.join(OUT, "_try")
MANIFEST = os.path.join(OUT, "voice.json")
FFMPEG = os.path.expanduser("~/.local/bin/ffmpeg")

MODEL = "gpt-4o-mini-tts"
VOICE = "fable"
INSTR_WORD = ("You are a kind first-grade teacher saying one word to a child who is learning to read. Say only the text you are given, "
              "exactly once, slowly and clearly, in a calm, friendly voice. Say it as a word, never spell it out letter by letter. "
              "Do not add any other words, sounds or breaths. Use clear American pronunciation.")
INSTR_SENT = ("You are a kind first-grade teacher reading one short sentence to a child who is learning to read. Read it slowly and warmly "
              "with natural American intonation, saying every word clearly. Say only the sentence, nothing before it and nothing after it.")
TIMEOUT = 60
RETRIES = 4
# silence is cut from the start and the end so the clips play right away
TRIM = ("silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.05,"
        "areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.12,areverse")

# ways to say the words that tend to come out wrong on their own (a -> "ay", the -> "thee"): the first one is the normal text,
# the others are what --try also makes so you can listen and choose
ALT = {
    "a": ["a", "uh", "ah"],
    "the": ["the", "thuh", "thee"],
    "I": ["I", "eye"],
    "to": ["to", "too", "tuh"],
    "do": ["do", "doo"],
    "be": ["be", "bee"],
    "so": ["so", "soh"],
    "no": ["no", "noh"],
    "at": ["at", "ahht"],
    "am": ["am", "ahm"],
    "an": ["an", "ann", "uhn"],
    "were": ["were", "wur", "wer"],
    "her": ["her", "hur", "hurr"],
    "tall": ["tall", "tawl", "tahl", "taul"],
    "sharp": ["sharp", "sharpe", "shaarp", "shahrp"],
    "wrote": ["wrote", "rote", "wroat", "roat"],
}
# what the listening check accepts as a right answer for one-word clips (Whisper spells sounds its own way)
HEARD = {
    "a": {"a", "uh", "ah", "ay", "eh"},
    "the": {"the", "thee", "thuh", "duh", "da"},
    "I": {"i", "eye", "ai", "aye"},
    "to": {"to", "too", "two", "tuh"},
    "do": {"do", "doo", "due"},
    "be": {"be", "bee"},
    "so": {"so", "sew", "soh"},
    "no": {"no", "know", "noh"},
    "at": {"at", "ut"},
    "am": {"am", "um"},
}


def load():
    """the words of every stage (sightwords-data.js is stage 1, sightwords-data2.js stage 2, sightwords-data3.js stage 3)"""
    data = None
    for fn in ("sightwords-data.js", "sightwords-data2.js", "sightwords-data3.js", "sightwords-data4.js", "sightwords-data5.js", "sightwords-data6.js", "sightwords-data7.js"):
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


def jobs(data, only=None):
    """[(file name, kind, text)] for every clip: the word, then its sentence."""
    out = []
    for w, info in data["words"].items():
        if only and w.lower() not in [x.lower() for x in only]:
            continue
        out.append(("w-%s.mp3" % key(w), "w", w))
        out.append(("s-%s.mp3" % key(w), "s", info["s"]))
    return out


def stamp(kind, text):
    """what a finished clip was made from: when this changes the clip is made again"""
    h = hashlib.sha1((MODEL + "|" + VOICE + "|" + (INSTR_WORD if kind == "w" else INSTR_SENT) + "|" + text).encode("utf-8")).hexdigest()[:12]
    return {"text": text, "voice": VOICE, "model": MODEL, "id": h}


def read_manifest():
    try:
        return json.load(open(MANIFEST, encoding="utf-8"))
    except Exception:
        return {}


def write_manifest(m):
    os.makedirs(OUT, exist_ok=True)
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(m, f, indent=1, sort_keys=True, ensure_ascii=False)
        f.write("\n")


def todo(data, manifest, only=None, force=False):
    out = []
    for fn, kind, text in jobs(data, only):
        mine = manifest.get(fn)
        path = os.path.join(OUT, fn)
        if force or not os.path.exists(path) or os.path.getsize(path) < 1500 or not mine or mine.get("id") != stamp(kind, text)["id"]:
            out.append((fn, kind, text))
    return out


def get_key():
    k = os.environ.get("OPENAI_API_KEY")
    if not k:
        print("Paste your OpenAI API key (starts with sk-). It stays hidden while you type.")
        k = getpass.getpass("OpenAI key: ")
    k = (k or "").strip()
    if not k.startswith("sk-"):
        sys.exit("That does not look like a key (it should start with 'sk-').")
    print("Using key %s...%s\n" % (k[:6], k[-4:]))
    return k


def tts(text, kind, api_key):
    data = json.dumps({"model": MODEL, "voice": VOICE, "input": text, "response_format": "mp3",
                       "instructions": INSTR_WORD if kind == "w" else INSTR_SENT}).encode("utf-8")
    last = None
    for attempt in range(1, RETRIES + 1):
        try:
            req = urllib.request.Request("https://api.openai.com/v1/audio/speech", data=data,
                                         headers={"Authorization": "Bearer " + api_key, "Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "ignore")
            if 400 <= e.code < 500 and e.code != 429:
                sys.exit("OpenAI error %d: %s" % (e.code, msg))
            last = "HTTP %d" % e.code
        except Exception as e:
            last = str(e)
        print("      (retry %d/%d: %s)" % (attempt, RETRIES, last))
        time.sleep(3 * attempt)
    raise RuntimeError(str(last))


def save(raw, path):
    """write the clip; when ffmpeg is there, cut the silence at both ends and make it a small mono file"""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if not os.path.exists(FFMPEG):
        with open(path, "wb") as f:
            f.write(raw)
        return
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, "in.mp3")
        with open(src, "wb") as f:
            f.write(raw)
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", src, "-af", TRIM, "-ac", "1", "-ar", "24000",
                        "-codec:a", "libmp3lame", "-q:a", "5", path], check=True)


def probe(path):
    """(seconds, loudest level in dB) of a clip, None when it cannot be read; needs ffmpeg"""
    if not os.path.exists(FFMPEG) or not os.path.exists(path):
        return None, None
    r = subprocess.run([FFMPEG, "-i", path, "-af", "volumedetect", "-f", "null", "-"], stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    d = re.search(r"Duration: (\d+):(\d+):([\d.]+)", r.stderr)
    v = re.search(r"max_volume: (-?[\d.]+) dB", r.stderr)
    return (int(d.group(1)) * 3600 + int(d.group(2)) * 60 + float(d.group(3)) if d else None), (float(v.group(1)) if v else None)


def speaks(path):
    """True when the clip has real speech in it (without ffmpeg we cannot tell, so we trust it)"""
    if not os.path.exists(FFMPEG):
        return os.path.getsize(path) > 1500
    secs, level = probe(path)
    return secs is not None and secs >= 0.2 and level is not None and level > -45


def fine(path, kind, text):
    """real speech, and not much longer than the words need (a stray 'uh' after the word makes a clip long)"""
    if not speaks(path):
        return False
    secs, _ = probe(path)
    if secs is None:
        return True
    n = max(1, len(tokens(text)))
    return secs <= 1.7 if kind == "w" else secs <= 1.2 + 0.75 * n + 1.0


def run_voice(only=None, force=False, dry=False, redo=None):
    data = load()
    manifest = read_manifest()
    todo_list = todo(data, manifest, only, force)
    if redo:
        have = [fn for fn, _, _ in todo_list]
        for fn, kind, text in jobs(data):
            if fn in redo and fn not in have:
                todo_list.append((fn, kind, text))
    secs = sum(1.2 if k == "w" else 2.6 for _, k, _ in todo_list)  # a word is about a second of speech, a sentence about two and a half
    print("%d clips in all, %d to voice (about %.1f minutes of speech, roughly %d cents)" % (len(jobs(data, only)), len(todo_list), secs / 60.0, max(1, round(secs / 60.0 * 1.5))))
    if dry or not todo_list:
        for fn, kind, text in todo_list[:12]:
            print("   would make %-12s %s" % (fn, text))
        if len(todo_list) > 12:
            print("   ...")
        return 0
    api_key = get_key()
    failed = []
    for i, (fn, kind, text) in enumerate(todo_list, 1):
        path = os.path.join(OUT, fn)
        # the voice now and then says nothing for a one-word input: try again, with a full stop and then an exclamation mark
        for attempt, spoken in enumerate([text, text + ".", text + "!"] if kind == "w" else [text, text, text], 1):
            save(tts(spoken, kind, api_key), path)
            if fine(path, kind, text):
                manifest[fn] = stamp(kind, text)
                break
            print("      (%s came out silent or too long, try %d/3)" % (fn, attempt))
        else:
            failed.append(fn)
            manifest.pop(fn, None)
        if i % 10 == 0 or i == len(todo_list):
            write_manifest(manifest)
            print("  %d / %d" % (i, len(todo_list)))
    write_manifest(manifest)
    if failed:
        print("\nThese would not come out right, run the same command again to retry them: " + ", ".join(failed))
        return 1
    print("\nDone. Listen to a few, especially a, the, I, to. For any that sound wrong, use --try and --use, then --check.")
    print("Then tell Claude: the clips changed, so the app's AUDIO_V (in site/sightwords.js) must be bumped before pushing.")
    return 0


def run_try(words):
    data = load()
    api_key = get_key()
    for w in words:
        if w not in data["words"] and w.lower() not in [x.lower() for x in data["words"]]:
            print("not a sight word:", w)
            continue
        base = next(x for x in data["words"] if x.lower() == w.lower())
        for n, text in enumerate(ALT.get(base, [base, base + "."]), 1):
            fn = "%s-%d.mp3" % (key(base), n)
            save(tts(text, "w", api_key), os.path.join(TRY, fn))
            print("  made _try/%s  (says: %s)" % (fn, text))
    print("\nListen to the files in site/sightwords/audio/_try/, then:  --use a-2   (for example)")
    return 0


def run_use(picks):
    manifest = read_manifest()
    data = load()
    for p in picks:
        m = re.match(r"^([A-Za-z]+)-(\d+)$", p)
        if not m:
            print("use it like  a-2:", p)
            continue
        base = next((x for x in data["words"] if x.lower() == m.group(1).lower()), None)
        src = os.path.join(TRY, "%s-%s.mp3" % (key(m.group(1)), m.group(2)))
        if not base or not os.path.exists(src):
            print("no such clip:", p)
            continue
        fn = "w-%s.mp3" % key(base)
        with open(src, "rb") as a, open(os.path.join(OUT, fn), "wb") as b:
            b.write(a.read())
        ent = stamp("w", base)
        ent["pick"] = p
        manifest[fn] = ent
        print("  %s now uses %s" % (fn, p))
    write_manifest(manifest)
    return 0


# ------------------------------------------------------------------ the listening check (Whisper)
def duration(path):
    if not os.path.exists(FFMPEG):
        return None
    r = subprocess.run([FFMPEG, "-i", path], stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", r.stderr)
    return int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3)) if m else None


def tokens(s):
    return re.findall(r"[a-z']+", s.lower().replace("’", "'"))


def judge(kind, word, text, heard, secs):
    """None when the clip is fine, otherwise a short reason"""
    n = max(1, len(tokens(text)))
    if secs is not None:
        if kind == "w" and secs > 2.2:
            return "long (%.1fs): a tail after the word?" % secs
        if kind == "s" and secs > 1.2 + 0.75 * n + 1.5:
            return "long (%.1fs for %d words): a repeated tail?" % (secs, n)
        if secs < 0.15:
            return "almost empty"
    h = tokens(heard)
    if kind == "w":
        ok = set(tokens(text)) | HEARD.get(word, set()) | HEARD.get(word.lower(), set())
        return None if h and h[0] in ok and len(h) <= 2 else "heard '%s'" % heard.strip()
    want = tokens(text)
    return None if h == want else "heard '%s'" % heard.strip()


def run_check():
    try:
        import whisper
    except Exception:
        sys.exit("Whisper is not installed here (pip install openai-whisper); ask Claude to run --check instead.")
    os.environ["PATH"] = os.path.dirname(FFMPEG) + os.pathsep + os.environ.get("PATH", "")
    data = load()
    manifest = read_manifest()
    model = whisper.load_model("base.en")
    bad = 0
    done = 0
    for fn, kind, text in jobs(data):
        if fn not in manifest:
            continue
        path = os.path.join(OUT, fn)
        if not os.path.exists(path):
            continue
        done += 1
        word = text if kind == "w" else ""
        if not speaks(path):
            bad += 1
            print("CHECK %-14s wanted '%s'  silent or unreadable" % (fn, text))
            continue
        try:
            heard = model.transcribe(path, language="en", fp16=False)["text"]
        except Exception as e:
            bad += 1
            print("CHECK %-14s wanted '%s'  could not be read (%s)" % (fn, text, str(e)[:60]))
            continue
        why = judge(kind, word, text, heard, duration(path))
        if why:
            bad += 1
            print("CHECK %-14s wanted '%s'  %s" % (fn, text, why))
    print("\nchecked %d clips, %d to listen to" % (done, bad))
    return 0


def main(argv):
    if "--check" in argv:
        return run_check()
    if "--try" in argv:
        i = argv.index("--try")
        return run_try([a for a in argv[i + 1:] if not a.startswith("--")])
    if "--use" in argv:
        i = argv.index("--use")
        return run_use([a for a in argv[i + 1:] if not a.startswith("--")])
    redo = None
    if "--redo" in argv:
        i = argv.index("--redo")
        redo = [a for a in argv[i + 1:] if not a.startswith("--")]
    only = None
    if "--only" in argv:
        i = argv.index("--only")
        only = [a for a in argv[i + 1:] if not a.startswith("--")]
    return run_voice(only, "--force" in argv, "--dry" in argv, redo)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
