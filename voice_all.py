#!/usr/bin/env python3
# =====================================================================
#  Readiverse — ONE-CLICK whole-site narration (STABLE v5)
#  - reads every book format (strict JSON + older JS-literal books)
#  - voices story pages (window.RV_AUDIO) AND grammar "Let's learn"
#    explanations, English + Chinese (window.RV_TEACH_AUDIO), each in
#    the SAME voice as that book's own topic (no separate voice picker)
#  - 60s timeout, auto-retry 4x, continue past failures
#  - SKIPS whatever is already voiced (safe + fast to re-run; checking
#    1000+ books takes a fraction of a second)
#  - v5 (2026-10-21): several TTS requests run at once (--workers, default
#    4), the next book's requests start while the current book is being
#    aligned, uploads run in parallel, you can name several books, progress
#    and time left are printed, and word times are aligned with Whisper
#    small.en (more accurate than the old base model)
#  Runs on your Mac. Your key stays on your computer.
#
#  RUN (Terminal):
#    python3  (space)  drag voice_all.py  (space)  drag the "site" folder  Return
#    or drag one or more book .html files instead of the folder (only those
#    are voiced, nothing else is scanned or printed)
#    then paste your key when asked (hidden while typing).
#    Options: --workers N (parallel TTS requests, default 4)
#             --align-model NAME (Whisper model for word times, default small.en)
# =====================================================================
import os, sys, json, base64, glob, getpass, re, time, urllib.request, urllib.error
import difflib, subprocess, tempfile, wave
import argparse, random, threading
from concurrent.futures import ThreadPoolExecutor

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
WORKERS = 4                                   # parallel TTS requests (and uploads)
ALIGN_MODEL = os.environ.get("VOICE_ALIGN_MODEL", "small.en")   # Whisper model for word times


class FatalAPIError(Exception):
    """A request OpenAI will never accept (bad key, bad input, no quota): stop the whole run."""

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
                raise FatalAPIError("OpenAI error " + str(e.code) + ": " + msg)
            last = "HTTP %d" % e.code
            wait = 3 * attempt
            if e.code == 429:       # too many requests at once: back off longer, honour Retry-After
                try:
                    wait = max(wait, min(30, float(e.headers.get("Retry-After", 0))))
                except (TypeError, ValueError):
                    pass
                wait += 5 * attempt + random.uniform(0, 2)
        except Exception as e:
            last = str(e)
            wait = 3 * attempt
        print("      (retry %d/%d: %s)" % (attempt, RETRIES, last))
        time.sleep(wait)
    raise RuntimeError(str(last))

_ABBREV_RE = re.compile(r"\b(Mr|Mrs|Ms|Dr|St|Jr|Sr)\.")
# A section/list enumerator at the start of the text or a line ("2. Title ...").
# Without protecting this, split_sentences() treats the "." after the number as a
# sentence boundary and sends a lone "2." to the TTS as its own chunk; the
# generative model then reads that context-free "2." unpredictably (observed:
# "two dollars"). The (?=\s) lookahead keeps decimals like "2.5 km" untouched.
_ENUM_RE = re.compile(r"(^|\n)(\d{1,3})\.(?=\s)")
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
    protected = _ENUM_RE.sub(lambda m: m.group(1) + m.group(2) + _ABBREV_PLACEHOLDER, protected)
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
    return _combine(sentences, [tts(s, key, voice) for s in sentences])

def _combine(sentences, audios):
    """Join the per-sentence audio of one page and work out the seam marks (see tts_multi)."""
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
_cos_local = threading.local()      # one COS client per thread (uploads run in parallel)
_cos_creds = None

def _get_cos_client():
    """Lazily build a COS client from the gitignored .cos_credentials file
    next to this script. Audio is uploaded straight to COS instead of being
    base64-embedded in the HTML (which used to balloon every book's .html
    to multiple MB and eventually broke the site's EdgeOne deploys) or
    written as a local file (which would re-bloat the git repo)."""
    global _cos_creds
    if _cos_creds is None:
        creds = {}
        for line in open(_COS_CREDS_PATH):
            line = line.strip()
            if line and "=" in line:
                k, v = line.split("=", 1)
                creds[k] = v
        _cos_creds = creds
    client = getattr(_cos_local, "client", None)
    if client is None:
        sys.path.insert(0, "/Users/nadou/Library/Python/3.9/lib/python/site-packages")
        from qcloud_cos import CosConfig, CosS3Client
        config = CosConfig(Region=_cos_creds["COS_REGION"], SecretId=_cos_creds["COS_SECRET_ID"],
                           SecretKey=_cos_creds["COS_SECRET_KEY"])
        client = _cos_local.client = CosS3Client(config)
    return client, _cos_creds

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

# ---------------------------------------------------------------------
# Real per-word highlight timing (window.RV_WORD_TIMES), derived from the
# TTS audio itself via local Whisper word-level alignment -- replaces the
# old character-length-proportion *estimate* the reader used to fall back
# on. Zero extra API cost: runs entirely on-device against audio already
# generated in this same pass (no new network calls beyond the TTS calls
# already being made). Added 2026-08-22.
# ---------------------------------------------------------------------
_WHISPER_MODEL = None
_WHISPER_LOCK = threading.Lock()

def _get_whisper_model():
    global _WHISPER_MODEL
    with _WHISPER_LOCK:
        if _WHISPER_MODEL is None:
            import whisper
            print("Loading local Whisper model '%s' for word-timing alignment (one-time, ~1-2 min)..." % ALIGN_MODEL)
            _WHISPER_MODEL = whisper.load_model(ALIGN_MODEL)
    return _WHISPER_MODEL

def _wnorm(w):
    return re.sub(r"[^\w']", "", w.lower())

def align_word_times(text, mp3_bytes):
    """Given a page's original text and its already-generated mp3 bytes,
    return a list of real start-times (seconds), one per whitespace-split
    token in `text`, aligned via local Whisper word-level timestamps.
    Returns [] on any failure (caller should treat that as 'skip', not
    fatal -- the reader falls back to the old estimate automatically)."""
    import numpy as np
    our_tokens = text.split()
    if not our_tokens:
        return []
    try:
        model = _get_whisper_model()
        with tempfile.TemporaryDirectory() as td:
            mp3_path = os.path.join(td, "p.mp3")
            wav_path = os.path.join(td, "p.wav")
            with open(mp3_path, "wb") as f:
                f.write(mp3_bytes)
            subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@16000", mp3_path, wav_path],
                            check=True, capture_output=True)
            with wave.open(wav_path, "rb") as w:
                frames = w.readframes(w.getnframes())
            audio = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
        result = model.transcribe(audio, language="en", word_timestamps=True, fp16=False)
        wh_words = []
        for seg in result.get("segments", []):
            for w in seg.get("words", []):
                wh_words.append((w["word"].strip(), w["start"]))
        if not wh_words:
            return []

        our_norm = [_wnorm(t) for t in our_tokens]
        wh_norm = [_wnorm(w) for w, _ in wh_words]
        sm = difflib.SequenceMatcher(a=our_norm, b=wh_norm, autojunk=False)
        times = [None] * len(our_tokens)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal":
                for k in range(i2 - i1):
                    times[i1 + k] = wh_words[j1 + k][1]
            elif tag == "replace":
                n1, n2 = i2 - i1, j2 - j1
                if n2 > 0:
                    for k in range(n1):
                        jj = j1 + min(n2 - 1, round(k * n2 / max(n1, 1)))
                        times[i1 + k] = wh_words[jj][1]
        for i in range(len(times)):
            if times[i] is None:
                prev_i = next((k for k in range(i - 1, -1, -1) if times[k] is not None), None)
                next_i = next((k for k in range(i + 1, len(times)) if times[k] is not None), None)
                if prev_i is not None and next_i is not None:
                    span = next_i - prev_i
                    times[i] = times[prev_i] + (times[next_i] - times[prev_i]) * (i - prev_i) / span
                elif prev_i is not None:
                    times[i] = times[prev_i]
                elif next_i is not None:
                    times[i] = times[next_i]
                else:
                    times[i] = 0.0
        out = [round(t, 3) for t in times]
        # Whisper often gives two or more adjacent tokens the same (or a
        # slightly decreasing) start time -- common in dense prose and
        # right after a heading number + pause. The reader highlights the
        # last token whose time <= currentTime, so any tied token never
        # gets its own highlight moment (a visible one-word "skip").
        # Spread each tied/decreasing run evenly up to the next real time.
        i = 0
        while i < len(out):
            j = i
            while j + 1 < len(out) and out[j + 1] <= out[j]:
                j += 1
            if j > i:
                lo = out[i]
                hi = out[j + 1] if j + 1 < len(out) else lo + 0.25 * (j - i + 1)
                step = (hi - lo) / (j - i + 1)
                for k in range(i + 1, j + 1):
                    out[k] = round(lo + step * (k - i), 3)
            i = j + 1
        return out
    except Exception as e:
        print("      (word-timing alignment skipped: %s)" % e)
        return []

_INTERVAL_RE = re.compile(
    r"if\(dur>0&&spans\.length\)\{var frac=(rvRemapFrac\(a\.currentTime/dur,marks\)|a\.currentTime/dur),idx=0,j;"
    r"for\(j=0;j<starts\.length;j\+\+\)\{if\(frac>=starts\[j\]\)idx=j;else break;\}"
    r"clearHighlight\(\);if\(spans\[idx\]\)spans\[idx\]\.classList\.add\('reading'\);\}"
)
_SPANS_DECL = "var spans=highlight?[].slice.call(document.querySelectorAll('.story-word')):[];"

def patch_speak_audio_for_word_times(html):
    """Make the reader's speakAudio() prefer window.RV_WORD_TIMES (real
    per-word timestamps) over the old character-proportion estimate, when
    present. Idempotent -- no-ops if already patched or if the function
    doesn't match a known shape (in which case RV_WORD_TIMES data is still
    written, just unused until the reader is patched some other way)."""
    i = html.find("function speakAudio(")
    if i < 0:
        return html, False
    j = html.find("function ttsSpeak(", i)
    if j < 0:
        return html, False
    block = html[i:j]
    if "wordTimes" in block or _SPANS_DECL not in block:
        return html, False
    m = _INTERVAL_RE.search(block)
    if not m:
        return html, False
    frac_expr = m.group(1)
    new_interval = (
        "if(dur>0&&spans.length){var idx=0,j;if(wordTimes&&wordTimes.length){"
        "var t=a.currentTime;for(j=0;j<wordTimes.length;j++){if(t>=wordTimes[j])idx=j;else break;}"
        "}else{var frac=" + frac_expr + ";for(j=0;j<starts.length;j++){if(frac>=starts[j])idx=j;else break;}}"
        "clearHighlight();if(spans[idx])spans[idx].classList.add('reading');}"
    )
    new_block = block.replace(_SPANS_DECL, _SPANS_DECL + "var wordTimes=window.RV_WORD_TIMES&&window.RV_WORD_TIMES[page];", 1)
    new_block = _INTERVAL_RE.sub(lambda _m: new_interval, new_block, count=1)
    return html[:i] + new_block + html[j:], True

# ---------------------------------------------------------------------
# One book = plan (what is missing) -> queue every TTS request -> collect,
# upload, align, write. Requests of one book (and of the next book) run in a
# shared pool, so the waiting is spent on several at once.
# ---------------------------------------------------------------------
def _book_plan(path):
    """-> (html, plan, status). status is None when the book needs voicing,
    otherwise 'skip' (already voiced), 'notbook' or 'no-body-tag'."""
    html = open(path, encoding="utf-8").read()
    if "</body>" not in html:
        print("      WARNING: no </body> tag found -- audio blocks would silently fail to "
              "insert (this happened before, see gen-book-tpl-reconstruction-checklist). Skipping.")
        return html, None, "no-body-tag"
    plan = {"story": None, "teach": None}
    if "window.RV_AUDIO=" not in html:
        items = get_narration(html)
        if items:
            plan["story"] = items
    if "window.RV_TEACH_AUDIO=" not in html:
        teach_items = get_teach_items(html)
        if teach_items:
            plan["teach"] = teach_items
    if not plan["story"] and not plan["teach"]:
        looks_like_book = "const pages=" in html or "const quizzes=" in html
        return html, None, ("skip" if looks_like_book else "notbook")
    return html, plan, None

def _submit_book(pool, plan, key, voice):
    """Queue every TTS request of one book; nothing blocks here."""
    def queue(text):
        sents = split_sentences(text)
        if len(sents) <= 1:
            return sents, [pool.submit(tts, text, key, voice)]
        return sents, [pool.submit(tts, s, key, voice) for s in sents]
    jobs = {"story": [], "teach": []}
    for k, t in plan["story"] or []:
        jobs["story"].append((k, t) + queue(t))
    for k, en, cn in plan["teach"] or []:
        jobs["teach"].append((k, queue(en) if en else None, pool.submit(tts, cn, key, voice) if cn else None))
    return jobs

def _count_requests(jobs):
    n = sum(len(futs) for _k, _t, _s, futs in jobs["story"])
    for _k, en_job, cn_f in jobs["teach"]:
        n += (len(en_job[1]) if en_job else 0) + (1 if cn_f else 0)
    return n

def _audio_of(sents, futs):
    audios = [f.result() for f in futs]
    return (audios[0], None) if len(sents) <= 1 else _combine(sents, audios)

def _finish_book(path, html, plan, jobs, workers, say):
    """Wait for this book's TTS, upload the clips, align word times, write the html.
    Same result as the old one-request-at-a-time code, just faster."""
    audio_dir, slug = _audio_dir_for(path)
    t0 = time.time()
    story = [(k, t) + _audio_of(sents, futs) for k, t, sents, futs in jobs["story"]]      # (k, text, raw, marks)
    teach = [(k, _audio_of(*en_job)[0] if en_job else None, cn_f.result() if cn_f else None)
             for k, en_job, cn_f in jobs["teach"]]
    say("TTS done (%d requests, waited %.0f s)" % (_count_requests(jobs), time.time() - t0))

    uploads = [("page_" + k, raw) for k, _t, raw, _m in story]
    for k, en, cn in teach:
        if en: uploads.append(("teach_%s_en" % k, en))
        if cn: uploads.append(("teach_%s_cn" % k, cn))
    t1 = time.time()
    with ThreadPoolExecutor(workers) as up:
        urls = dict(zip([n for n, _ in uploads],
                        up.map(lambda nb: _write_mp3(audio_dir, nb[0], nb[1]), uploads)))
    say("uploaded %d clips (%.0f s)" % (len(uploads), time.time() - t1))

    did = []
    if story:
        audio, marks_map, word_times = {}, {}, {}
        t2 = time.time()
        for n, (k, t, raw, marks) in enumerate(story, 1):
            audio[k] = urls["page_" + k]
            if marks: marks_map[k] = marks
            wt = align_word_times(t, raw)
            if wt: word_times[k] = wt
            print("      aligning word times: page %d of %d" % (n, len(story)), end="\r", flush=True)
        say("aligned %d pages (%.0f s)          " % (len(story), time.time() - t2))
        block = "<script>window.RV_AUDIO=" + json.dumps(audio) + ";</script>"
        html = html.replace("</body>", block + "\n</body>", 1)
        if marks_map:
            blockm = "<script>window.RV_AUDIO_MARKS=" + json.dumps(marks_map) + ";</script>"
            html = html.replace("</body>", blockm + "\n</body>", 1)
        if word_times:
            html, _ = patch_speak_audio_for_word_times(html)
            blockw = "<script>window.RV_WORD_TIMES=" + json.dumps(word_times) + ";</script>"
            html = html.replace("</body>", blockw + "\n</body>", 1)
            did.append("word-times")
        did.append("story")
    if teach:
        teach_audio = {}
        for k, en, cn in teach:
            entry = {}
            if en: entry["en"] = urls["teach_%s_en" % k]
            if cn: entry["cn"] = urls["teach_%s_cn" % k]
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

def voice_one(path, key, voice, workers=WORKERS):
    """Voice a single book (kept for anything that calls it directly)."""
    html, plan, status = _book_plan(path)
    if status:
        return status
    with ThreadPoolExecutor(workers) as pool:
        return _finish_book(path, html, plan, _submit_book(pool, plan, key, voice), workers, lambda m: None)

def collect(target):
    if os.path.isfile(target) and target.endswith(".html"):
        return [target]
    if os.path.isdir(target):
        f = glob.glob(os.path.join(target, "books", "*", "*.html"))   # a site folder
        if not f:
            f = glob.glob(os.path.join(target, "**", "*.html"), recursive=True)  # any folder
        return sorted(x for x in f if not x.endswith("-voiced.html"))
    return []

def collect_all(targets):
    seen, out = set(), []
    for t in targets:
        for f in collect(t):
            r = os.path.realpath(f)
            if r not in seen:
                seen.add(r); out.append(f)
    return out

def _fmt(sec):
    sec = int(round(sec))
    return "%d min %02d s" % (sec // 60, sec % 60) if sec >= 60 else "%d s" % sec

def main(argv=None):
    global ALIGN_MODEL
    ap = argparse.ArgumentParser(description="Voice the books that are not voiced yet.")
    ap.add_argument("paths", nargs="+", help="the 'site' folder, or one or more book .html files")
    ap.add_argument("--workers", type=int, default=WORKERS, help="parallel TTS requests (default %d)" % WORKERS)
    ap.add_argument("--align-model", default=None, help="Whisper model for word times (default %s)" % ALIGN_MODEL)
    args = ap.parse_args(argv)
    if args.align_model:
        ALIGN_MODEL = args.align_model
    workers = max(1, min(args.workers, 16))
    books = collect_all(args.paths)
    if not books:
        sys.exit("No .html books found there. Drag the 'site' folder, OR one or more book .html files.")
    key = get_key()

    plans, skipped, failed = [], 0, []
    for f in books:
        html, plan, status = _book_plan(f)
        if plan:
            plans.append((f, html, plan))
        elif status == "skip":
            skipped += 1
            if len(books) <= 5:
                print("%-22s %s" % ("already ok", os.path.basename(f)))
        elif status == "no-body-tag":
            failed.append(os.path.basename(f))
    print("Found %d file(s): %d need voicing, %d already voiced (skipped).\n" % (len(books), len(plans), skipped))

    if any(plan["story"] for _f, _h, plan in plans):
        def preload():
            try:
                _get_whisper_model()
            except Exception as e:
                print("      (could not load the Whisper model yet: %s)" % e)
        threading.Thread(target=preload, daemon=True).start()   # load it while the first requests run

    done = 0
    pool = ThreadPoolExecutor(workers)
    queued = {}
    def ensure(i):
        if i < len(plans) and i not in queued:
            f, _html, plan = plans[i]
            queued[i] = _submit_book(pool, plan, key, VOICES.get(os.path.basename(os.path.dirname(f)), DEFAULT_VOICE))
    started = time.time()
    try:
        for i, (f, html, plan) in enumerate(plans):
            ensure(i); ensure(i + 1)            # the next book's requests start while this one is aligned
            topic = os.path.basename(os.path.dirname(f))
            voice = VOICES.get(topic, DEFAULT_VOICE)
            jobs = queued.pop(i)
            print("[%d/%d] %-15s %-8s %s  (%d TTS requests, %d at a time)" %
                  (i + 1, len(plans), topic, voice, os.path.basename(f), _count_requests(jobs), workers))
            t_book = time.time()
            try:
                r = _finish_book(f, html, plan, jobs, workers, lambda m: print("      " + m))
            except FatalAPIError as e:
                sys.exit(str(e))
            except Exception as e:
                print("      FAILED (%s)" % e)
                failed.append(os.path.basename(f)); continue
            done += 1
            left = len(plans) - i - 1
            msg = "      done: %s in %s" % (r, _fmt(time.time() - t_book))
            if left:
                msg += " | about %s left for %d more book(s)" % (_fmt((time.time() - started) / (i + 1) * left), left)
            print(msg)
    finally:
        pool.shutdown(wait=False, cancel_futures=True)
    print("\nNewly voiced (story and/or teach audio): %d | already done: %d | failed: %d | total time %s" %
          (done, skipped, len(failed), _fmt(time.time() - started)))
    if failed:
        print("Not finished yet — run again to complete:")
        for x in failed: print("   -", x)
    else:
        print("Everything is voiced. Next: check it (tools/voicing_check.py, tools/timing_check.py), then push.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Drag the 'site' folder (or one or more book .html files) onto this script.")
    main()
