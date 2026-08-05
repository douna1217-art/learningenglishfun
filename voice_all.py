#!/usr/bin/env python3
# =====================================================================
#  Readiverse — ONE-CLICK whole-site narration (STABLE v3)
#  - reads every book format (strict JSON + older JS-literal books)
#  - 60s timeout, auto-retry 4x, continue past failures
#  - SKIPS books already voiced (safe + fast to re-run)
#  Runs on your Mac. Your key stays on your computer.
#
#  RUN (Terminal):
#    python3  (space)  drag voice_all.py  (space)  drag the "site" folder  Return
#    then paste your key when asked (hidden while typing).
# =====================================================================
import os, sys, json, base64, glob, getpass, re, time, urllib.request, urllib.error

VOICES = {
    "fiction":        "fable",
    "sel":            "nova",
    "science":        "shimmer",
    "social-studies": "verse",
    "math-stories":   "alloy",
    "cs":             "ash",
}
DEFAULT_VOICE = "fable"
MODEL = "gpt-4o-mini-tts"
INSTRUCTIONS = ("Read as a friendly first-grade teacher. Speak warmly and naturally. "
                "Smile through your voice. Pause naturally between sentences. "
                "Make dialogue expressive but not exaggerated. Use clear American "
                "pronunciation. Sound encouraging and patient.")
TIMEOUT = 60
RETRIES = 4

def get_key():
    k = os.environ.get("OPENAI_API_KEY")
    if not k:
        print("Paste your OpenAI API key (starts with sk-). It stays hidden while typing.")
        k = getpass.getpass("OpenAI key: ")
    k = (k or "").strip()
    if not k.startswith("sk-"):
        sys.exit("That doesn't look like a key (should start with 'sk-'). Try again.")
    print("Using key %s...%s  (%d characters)\n" % (k[:6], k[-4:], len(k)))
    return k

def tts(text, key, voice):
    data = json.dumps({"model": MODEL, "voice": voice, "input": text,
                       "response_format": "mp3", "instructions": INSTRUCTIONS}).encode("utf-8")
    last = None
    for attempt in range(1, RETRIES + 1):
        try:
            req = urllib.request.Request("https://api.openai.com/v1/audio/speech", data=data,
                headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "ignore")
            if 400 <= e.code < 500 and e.code != 429:
                sys.exit("OpenAI error " + str(e.code) + ": " + msg)
            last = "HTTP %d" % e.code
        except Exception as e:
            last = str(e)
        print("      (retry %d/%d: %s)" % (attempt, RETRIES, last))
        time.sleep(3 * attempt)
    raise RuntimeError(str(last))

def _split_objects(arr):
    objs = []; i = arr.find("{")
    while i != -1:
        d = 0
        for k in range(i, len(arr)):
            if arr[k] == "{": d += 1
            elif arr[k] == "}":
                d -= 1
                if d == 0: objs.append(arr[i:k+1]); i = arr.find("{", k+1); break
        else: break
    return objs

def _dec(raw):
    return json.loads('"' + raw + '"')

def get_narration(html):
    """Returns [(pageIndexStr, text), ...], index '0' = cover title+subtitle. Handles both formats."""
    i = html.find("const pages=[")
    if i < 0: return None
    b = html.index("[", i); d = 0; arr = None
    for k in range(b, len(html)):
        if html[k] == "[": d += 1
        elif html[k] == "]":
            d -= 1
            if d == 0: arr = html[b:k+1]; break
    if arr is None: return None
    try:
        pages = json.loads(arr)
        items = [("0", (pages[0].get("title","") + ". " + pages[0].get("subtitle","") + ".").strip())]
        for idx in range(1, len(pages)):
            t = pages[idx].get("text", "")
            if t: items.append((str(idx), t))
        return items
    except Exception:
        items = []
        for idx, o in enumerate(_split_objects(arr)):
            if idx == 0:
                mt = re.search(r'["\']?title["\']?\s*:\s*"((?:[^"\\]|\\.)*)"', o)
                ms = re.search(r'["\']?subtitle["\']?\s*:\s*"((?:[^"\\]|\\.)*)"', o)
                items.append(("0", ((_dec(mt.group(1)) if mt else "") + ". " +
                                     (_dec(ms.group(1)) if ms else "") + ".").strip()))
            else:
                m = re.search(r'["\']?text["\']?\s*:\s*"((?:[^"\\]|\\.)*)"', o)
                if m and m.group(1).strip():
                    items.append((str(idx), _dec(m.group(1))))
        return items

def voice_one(path, key, voice):
    html = open(path, encoding="utf-8").read()
    if "window.RV_AUDIO=" in html:
        return "skip"
    items = get_narration(html)
    if not items:
        return "notbook"
    audio = {}
    for k, t in items:
        audio[k] = "data:audio/mpeg;base64," + base64.b64encode(tts(t, key, voice)).decode()
    block = "<script>window.RV_AUDIO=" + json.dumps(audio) + ";</script>"
    html = html.replace("</body>", block + "\n</body>", 1)
    open(path, "w", encoding="utf-8").write(html)
    return "done"

def collect(target):
    if os.path.isfile(target) and target.endswith(".html"):
        return [target]
    if os.path.isdir(target):
        f = glob.glob(os.path.join(target, "books", "*", "*.html"))   # a site folder
        if not f:
            f = glob.glob(os.path.join(target, "**", "*.html"), recursive=True)  # any folder
        return sorted(x for x in f if not x.endswith("-voiced.html"))
    return []

def main(site):
    key = get_key()
    books = collect(site)
    if not books:
        sys.exit("No .html books found there. Drag the 'site' folder, OR a single book .html.")
    print("Found %d book(s). Already-voiced are skipped.\n" % len(books))
    done = skipped = 0; failed = []
    for i, f in enumerate(books, 1):
        topic = os.path.basename(os.path.dirname(f))
        voice = VOICES.get(topic, DEFAULT_VOICE)
        try:
            r = voice_one(f, key, voice)
        except Exception as e:
            print("[%d/%d] %-15s FAILED (%s)" % (i, len(books), topic, e))
            failed.append(os.path.basename(f)); continue
        tag = {"done": voice, "skip": "already ok", "notbook": "(not a book)"}.get(r, voice)
        print("[%d/%d] %-15s %-11s %s" % (i, len(books), topic, tag, os.path.basename(f)))
        if r == "done": done += 1
        elif r == "skip": skipped += 1
    print("\nNewly voiced: %d | already done: %d | failed: %d" % (done, skipped, len(failed)))
    if failed:
        print("Not finished yet — run again to complete:")
        for x in failed: print("   -", x)
    else:
        print("All 72 books are voiced! Now deploy the 'site' folder to Netlify.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Drag the 'site' folder onto this script.")
    main(sys.argv[1])
