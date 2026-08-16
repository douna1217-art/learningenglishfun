#!/usr/bin/env python3
# =====================================================================
#  Readiverse — ONE-CLICK whole-site narration (STABLE v4)
#  - reads every book format (strict JSON + older JS-literal books)
#  - voices story pages (window.RV_AUDIO) AND grammar "Let's learn"
#    explanations, English + Chinese (window.RV_TEACH_AUDIO), each in
#    the SAME voice as that book's own topic (no separate voice picker)
#  - 60s timeout, auto-retry 4x, continue past failures
#  - SKIPS whatever is already voiced (safe + fast to re-run)
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

_ABBREV_RE = re.compile(r"\b(Mr|Mrs|Ms|Dr|St|Jr|Sr)\.")
_SENT_BOUNDARY_RE = re.compile(r"([.!?][\u2019\u201d'\"]?)\s+")
_DIALOGUE_TAG_RE = re.compile(r"([,][\u2019\u201d'\"])\s+")
_ABBREV_PLACEHOLDER = chr(0)   # stands in for the period in "Ms." while splitting
_SPLIT_MARK = chr(1)           # marks a real sentence boundary

def split_sentences(text):
    """Split English text into sentence-sized chunks for TTS.
    gpt-4o-mini-tts (a generative, autoregressive model) occasionally stops
    early on long multi-sentence input and silently drops the tail. Feeding
    it one sentence at a time removes that risk almost entirely; common
    abbreviations like 'Ms.' are protected so they don't get split mid-name.

    A second boundary also splits after a quoted-dialogue comma, e.g.
    "'We need a basket,' Malik explained." -> "'We need a basket,'" +
    "Malik explained." (and likewise "'...,' she said." -> two pieces).
    Without this, the whole thing is one "sentence" by the period-only
    rule, and the short trailing attribution clause ("Malik explained",
    "she said") was observed getting silently dropped by the TTS engine
    the same way a trailing sentence can be."""
    text = (text or "").strip()
    if not text:
        return []
    protected = _ABBREV_RE.sub(lambda m: m.group(1) + _ABBREV_PLACEHOLDER, text)
    marked = _SENT_BOUNDARY_RE.sub(lambda m: m.group(1) + _SPLIT_MARK, protected)
    marked = _DIALOGUE_TAG_RE.sub(lambda m: m.group(1) + _SPLIT_MARK, marked)
    parts = [p.replace(_ABBREV_PLACEHOLDER, ".").strip() for p in marked.split(_SPLIT_MARK) if p.strip()]
    return parts if parts else [text]

def tts_multi(text, key, voice):
    """TTS a full page/teach text by splitting into sentences and concatenating
    each sentence's audio, instead of sending the whole multi-sentence text in
    one request (see split_sentences for why).

    Returns (audio_bytes, marks). marks is None for single-sentence text
    (nothing to correct for). For multi-sentence text, marks is a list of
    {"cs": cumulative_char_fraction, "cf": cumulative_byte_fraction}, one per
    sentence boundary — the reader's word-highlighter uses these checkpoints
    to correct for the small silence gaps at each concatenation seam, instead
    of assuming one smooth, evenly-paced audio clip for the whole page."""
    sentences = split_sentences(text)
    if len(sentences) <= 1:
        return tts(text, key, voice), None
    audios = [tts(s, key, voice) for s in sentences]
    combined = b"".join(audios)
    char_lens = [len(s) + 1 for s in sentences]
    byte_lens = [len(a) for a in audios]
    total_chars = sum(char_lens) or 1
    total_bytes = sum(byte_lens) or 1
    marks = []
    cc = cb = 0
    for cl, bl in zip(char_lens, byte_lens):
        cc += cl; cb += bl
        marks.append({"cs": round(cc / total_chars, 4), "cf": round(cb / total_bytes, 4)})
    return combined, marks

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

def _extract_braced(html, marker, open_ch, close_ch):
    """Find `marker` then return the balanced open_ch..close_ch block right after it."""
    i = html.find(marker)
    if i < 0: return None
    b = html.index(open_ch, i); d = 0
    for k in range(b, len(html)):
        if html[k] == open_ch: d += 1
        elif html[k] == close_ch:
            d -= 1
            if d == 0: return html[b:k+1]
    return None

def _split_teach(teach_html):
    """Split one 'teach' string into (english_text, chinese_text), tags stripped."""
    m = re.search(r"<span class=['\"]cn['\"]>(.*?)</span>", teach_html, re.S)
    cn_html = m.group(1) if m else ""
    en_html = teach_html[:m.start()] if m else teach_html
    strip = lambda s: re.sub(r"<[^>]+>", "", s).strip()
    return strip(en_html), strip(cn_html)

def get_teach_items(html):
    """Returns [(key, english_text, chinese_text), ...] for each grammar question
    that has a non-empty 'teach' field. key looks like 'grammar-0', 'grammar-1', ...
    matching the reader's activeTab+'-'+qi convention. Handles both formats."""
    obj_text = _extract_braced(html, "const quizzes=", "{", "}")
    if obj_text is None:
        return []
    try:
        quizzes = json.loads(obj_text)
        items = []
        for idx, g in enumerate(quizzes.get("grammar", [])):
            teach = g.get("teach", "")
            if not teach: continue
            en, cn = _split_teach(teach)
            if en or cn: items.append(("grammar-%d" % idx, en, cn))
        return items
    except Exception:
        pass
    # Fallback for older JS-literal books: pull out the "grammar" array by hand.
    gi = obj_text.find('"grammar"')
    if gi < 0: gi = obj_text.find("grammar:")
    if gi < 0: return []
    arr = _extract_braced(obj_text[gi:], "", "[", "]")
    if arr is None: return []
    items = []
    for idx, o in enumerate(_split_objects(arr)):
        m = re.search(r'["\']?teach["\']?\s*:\s*"((?:[^"\\]|\\.)*)"', o)
        if not m: continue
        en, cn = _split_teach(_dec(m.group(1)))
        if en or cn: items.append(("grammar-%d" % idx, en, cn))
    return items

_COS_CREDS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cos_credentials")
_cos_client = None
_cos_creds = None

def _get_cos_client():
    """Lazily build a COS client from the gitignored .cos_credentials file
    next to this script. Audio is uploaded straight to COS instead of being
    base64-embedded in the HTML (which used to balloon every book's .html
    to multiple MB and eventually broke the site's EdgeOne deploys) or
    written as a local file (which would re-bloat the git repo)."""
    global _cos_client, _cos_creds
    if _cos_client is None:
        sys.path.insert(0, "/Users/nadou/Library/Python/3.9/lib/python/site-packages")
        from qcloud_cos import CosConfig, CosS3Client
        creds = {}
        for line in open(_COS_CREDS_PATH):
            line = line.strip()
            if line and "=" in line:
                k, v = line.split("=", 1)
                creds[k] = v
        config = CosConfig(Region=creds["COS_REGION"], SecretId=creds["COS_SECRET_ID"], SecretKey=creds["COS_SECRET_KEY"])
        _cos_client = CosS3Client(config)
        _cos_creds = creds
    return _cos_client, _cos_creds

def _audio_dir_for(path):
    """COS key prefix for a book's audio, derived from its path, e.g.
    books/social-studies/the-crosswalk-rule.html ->
    'books/social-studies/the-crosswalk-rule-audio'"""
    slug = os.path.splitext(os.path.basename(path))[0]
    subject_dir = os.path.basename(os.path.dirname(path))
    return f"books/{subject_dir}/{slug}-audio", slug

def _write_mp3(audio_prefix, name, raw_bytes):
    """Upload mp3 bytes to COS under <audio_prefix>/<name>.mp3 and return
    the absolute URL for window.RV_AUDIO / window.RV_TEACH_AUDIO to use."""
    client, creds = _get_cos_client()
    key = f"{audio_prefix}/{name}.mp3"
    client.put_object(Bucket=creds["COS_BUCKET"], Body=raw_bytes, Key=key, ContentType="audio/mpeg")
    return f"https://{creds['COS_DOMAIN']}/{key}"

def voice_one(path, key, voice):
    html = open(path, encoding="utf-8").read()
    did = []
    audio_dir = None

    if "window.RV_AUDIO=" not in html:
        items = get_narration(html)
        if items:
            if audio_dir is None: audio_dir, slug = _audio_dir_for(path)
            audio = {}
            marks_map = {}
            for k, t in items:
                raw, marks = tts_multi(t, key, voice)
                audio[k] = _write_mp3(audio_dir, "page_" + k, raw)
                if marks: marks_map[k] = marks
            block = "<script>window.RV_AUDIO=" + json.dumps(audio) + ";</script>"
            html = html.replace("</body>", block + "\n</body>", 1)
            if marks_map:
                blockm = "<script>window.RV_AUDIO_MARKS=" + json.dumps(marks_map) + ";</script>"
                html = html.replace("</body>", blockm + "\n</body>", 1)
            did.append("story")

    if "window.RV_TEACH_AUDIO=" not in html:
        teach_items = get_teach_items(html)
        if teach_items:
            if audio_dir is None: audio_dir, slug = _audio_dir_for(path)
            teach_audio = {}
            for k, en, cn in teach_items:
                entry = {}
                if en: entry["en"] = _write_mp3(audio_dir, "teach_" + k + "_en", tts_multi(en, key, voice)[0])
                if cn: entry["cn"] = _write_mp3(audio_dir, "teach_" + k + "_cn", tts(cn, key, voice))
                if entry: teach_audio[k] = entry
            if teach_audio:
                block2 = "<script>window.RV_TEACH_AUDIO=" + json.dumps(teach_audio) + ";</script>"
                html = html.replace("</body>", block2 + "\n</body>", 1)
                did.append("teach")

    if not did:
        looks_like_book = "const pages=" in html or "const quizzes=" in html
        return "skip" if looks_like_book else "notbook"

    open(path, "w", encoding="utf-8").write(html)
    return "+".join(did)

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
    print("Found %d book(s). Already-voiced parts are skipped.\n" % len(books))
    done = skipped = 0; failed = []
    for i, f in enumerate(books, 1):
        topic = os.path.basename(os.path.dirname(f))
        voice = VOICES.get(topic, DEFAULT_VOICE)
        try:
            r = voice_one(f, key, voice)
        except Exception as e:
            print("[%d/%d] %-15s FAILED (%s)" % (i, len(books), topic, e))
            failed.append(os.path.basename(f)); continue
        tag = {"skip": "already ok", "notbook": "(not a book)"}.get(r, "%s (%s)" % (voice, r))
        print("[%d/%d] %-15s %-22s %s" % (i, len(books), topic, tag, os.path.basename(f)))
        if r == "skip": skipped += 1
        else: done += 1
    print("\nNewly voiced (story and/or teach audio): %d | already done: %d | failed: %d" % (done, skipped, len(failed)))
    if failed:
        print("Not finished yet — run again to complete:")
        for x in failed: print("   -", x)
    else:
        print("Everything is voiced! Now deploy the 'site' folder to Netlify.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Drag the 'site' folder onto this script.")
    main(sys.argv[1])
