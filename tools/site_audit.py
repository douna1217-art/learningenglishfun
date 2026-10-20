#!/usr/bin/env python3
"""A health check of the whole book library, for running every now and then.

Books were made at different times by different routines, so an early book can carry a problem nobody has looked at since.
This reads every book page under site/books and checks, with no network:

  catalog    each book is listed once, its page and cover exist, nothing on disk is unlisted, grade / band / modules look right
  pages      the cover and the text pages, one picture per page (the right folder, not the same picture twice), no empty page
  narration  every page has its audio; the word times (RV_WORD_TIMES) line up with the words on the page, run forward, have no
             long gaps and a believable speed, no runaway tail; the grammar-teaching clips are all there
  quiz       the questions are complete, the right answer is in range, where the right answers sit (a book where nearly all
             are the same letter, or the right answer is nearly always the longest), duplicate choices, pages that exist
  text       double spaces, odd quotes, a word said twice in a row, leftover template marks, very short / very long pages
  level      reading level of each book (Flesch-Kincaid, sentence length, share of hard words) against the grade it is filed under

and, with --online (needs a network that can reach the media server; run it on your own computer or on GitHub):

  media      every picture and every audio file answers, is not tiny, the audio is as long as its word times say (a clip much
             longer than the last word time is a runaway tail)

    python3 tools/site_audit.py                       # the offline checks, report in tools/audit/
    python3 tools/site_audit.py --online              # and the media checks (a few minutes)
    python3 tools/site_audit.py --only slug1 slug2    # just those books
    python3 tools/site_audit.py --fail-on error       # exit 1 if any error (for scripts)

Writes tools/audit/report.md (read this) and tools/audit/report.json (all findings). Python 3.8+, nothing to install.
"""
import argparse
import collections
import concurrent.futures
import glob
import json
import math
import os
import re
import statistics
import struct
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
BOOKS = os.path.join(ROOT, "site", "books")
AUDIT = os.path.join(ROOT, "tools", "audit")
GRADE_NUM = {"Kindergarten": 0, "Grade 1": 1, "Grade 2": 2, "Grade 3": 3, "Grade 4": 4, "Grade 5": 5, "Grade 6": 6}
BAND_OF = {0: "Early Reader", 1: "Beginning Reader", 2: "Growing Reader", 3: "Growing Reader"}  # (grades 4-6: Fluent Reader)
SEV_ORDER = {"error": 0, "warn": 1, "info": 2}

# thresholds (tuned on the library as it is; see the notes in report.md)
MAX_WORD_GAP = 3.0          # seconds between two spoken words
PACE_LOW, PACE_HIGH = 0.9, 4.6   # words a second, one page
PACE_VS_BOOK = (0.6, 1.5)   # a page's pace against the book's median pace
TAIL_MAX = 4.0              # seconds of audio after the last word time (online)
MIN_IMAGE_BYTES = 6000
MIN_AUDIO_BYTES = 3000
ANSWER_SHARE_FLAG = 0.7     # one answer position holds this share of >= 8 questions
LONGEST_SHARE_FLAG = 0.8    # the right answer is the longest choice this often (>= 8 questions)
OK_REPEAT = set("ha no very so bye knock tick tock row oh again ho la yum boom buzz hush splash clap pop chug choo ding dong drip beep thump plop zip zoom go yes never more long far big little tap bang ring ha-ha hip hooray yay woo whoa wow shh sh mm hmm ah ooh la-la rum pat tip step bit by day to one two three four five six seven eight nine ten again.".split())
FK_OFF = 3.0                # grades away from the middle of the grade it is filed under


# ---------------------------------------------------------------- reading a book page
def js_value(text):
    """a JavaScript object / array literal (keys without quotes, trailing commas) read with node; None when node is not there"""
    import subprocess
    try:
        r = subprocess.run(["node", "-e", "console.log(JSON.stringify(eval('(' + require('fs').readFileSync(0, 'utf8') + ')')))"], input=text, capture_output=True, text=True, timeout=30)
        return json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else None
    except Exception:
        return None


def literal_end(t, i):
    """index just after the [...] or {...} literal that starts at t[i] (strings and escapes understood)"""
    depth, q, esc = 0, None, False
    for j in range(i, len(t)):
        c = t[j]
        if q:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == q:
                q = None
        elif c in "\"'`":
            q = c
        elif c in "[{":
            depth += 1
        elif c in "]}":
            depth -= 1
            if depth == 0:
                return j + 1
    return -1


def raw_after(t, marker):
    i = t.find(marker)
    if i < 0:
        return None
    rest = t[i + len(marker):].lstrip()
    try:
        return json.JSONDecoder().raw_decode(rest)[0]
    except ValueError:
        k = t.find(rest[:1], i + len(marker))
        e = literal_end(t, k)
        v = js_value(t[k:e]) if e > 0 else None
        return v if v is not None else "ERR"


def window_var(t, name):
    m = re.search(r"window\." + name + r"\s*=\s*", t)
    if not m:
        return None
    try:
        return json.JSONDecoder().raw_decode(t[m.end():])[0]
    except ValueError:
        return "ERR"


def load_book(path):
    t = open(path, encoding="utf8", errors="ignore").read()
    return {
        "pages": raw_after(t, "const pages="),
        "quizzes": raw_after(t, "const quizzes="),
        "audio": window_var(t, "RV_AUDIO"),
        "times": window_var(t, "RV_WORD_TIMES"),
        "marks": window_var(t, "RV_AUDIO_MARKS"),
        "teach_audio": window_var(t, "RV_TEACH_AUDIO"),
    }


def load_catalog():
    """slug -> entry (+ topic) from every books.js"""
    out, dup = {}, []
    for f in sorted(glob.glob(os.path.join(BOOKS, "*", "books.js"))):
        topic = os.path.basename(os.path.dirname(f))
        t = open(f, encoding="utf8").read()
        i = t.find("= [", t.find("RV_BOOKS["))
        try:
            arr = json.JSONDecoder().raw_decode(t[i + 2:])[0]
        except ValueError:
            continue
        for e in arr:
            e = dict(e)
            e["topic"] = topic
            if e["slug"] in out:
                dup.append((e["slug"], topic, out[e["slug"]]["topic"]))
            out[e["slug"]] = e
    return out, dup


def words(s):
    return re.findall(r"\S+", s or "")


def page_text(p):
    if p.get("type") == "cover":
        return " ".join(x for x in (p.get("title"), p.get("subtitle")) if x)  # what the cover narration reads
    return p.get("text") or ""


# ---------------------------------------------------------------- findings
class Findings:
    def __init__(self):
        self.items = []

    def add(self, slug, check, sev, msg, topic=""):
        self.items.append({"slug": slug, "topic": topic, "check": check, "sev": sev, "msg": msg})


# ---------------------------------------------------------------- the checks
def check_catalog(F, catalog, dup, files):
    listed = set(catalog)
    for slug, topic, other in dup:
        F.add(slug, "catalog", "error", "listed twice (%s and %s)" % (topic, other), topic)
    bands = collections.defaultdict(collections.Counter)
    for e in catalog.values():
        if e.get("grade") in GRADE_NUM:
            bands[GRADE_NUM[e["grade"]]][e.get("readingBand")] += 1
    on_disk = {}
    for f in files:
        on_disk[os.path.basename(f)[:-5]] = os.path.basename(os.path.dirname(f))
    for slug, e in catalog.items():
        topic = e["topic"]
        page = os.path.join(ROOT, "site", e.get("file", ""))
        if not os.path.isfile(page):
            F.add(slug, "catalog", "error", "its page %s does not exist" % e.get("file"), topic)
        cover = os.path.join(ROOT, "site", e.get("cover", ""))
        if not e.get("cover") or not os.path.isfile(cover):
            F.add(slug, "catalog", "error", "its cover %s does not exist" % e.get("cover"), topic)
        elif os.path.getsize(cover) < 3000 and not cover.endswith(".svg"):
            F.add(slug, "catalog", "warn", "its cover file is only %d bytes" % os.path.getsize(cover), topic)
        g = GRADE_NUM.get(e.get("grade"))
        if g is None:
            F.add(slug, "catalog", "error", "unknown grade %r" % e.get("grade"), topic)
        else:
            share = bands[g][e.get("readingBand")] / max(1, sum(bands[g].values()))
            if share < 0.1:
                F.add(slug, "catalog", "warn", "filed under %s with the band %r, which only %d%% of the %s books have" % (e.get("grade"), e.get("readingBand"), round(100 * share), e.get("grade")), topic)
        if e.get("status") != "ready":
            F.add(slug, "catalog", "warn", "status is %r, not ready" % e.get("status"), topic)
        for k in ("title", "subtitle", "minutes", "modules"):
            if not e.get(k):
                F.add(slug, "catalog", "warn", "no %s" % k, topic)
        if on_disk.get(slug) not in (None, topic):
            F.add(slug, "catalog", "error", "listed under %s but the page is in %s" % (topic, on_disk[slug]), topic)
    for slug, topic in on_disk.items():
        if slug not in listed:
            F.add(slug, "catalog", "warn", "has a page but is not in any books.js, so nobody can find it", topic)


def check_book(F, slug, topic, b, entry):
    P, Q, A, T, M = b["pages"], b["quizzes"], b["audio"], b["times"], b["marks"]
    if P in (None, "ERR") or not isinstance(P, list):
        F.add(slug, "pages", "error", "the page list (const pages) is missing or cannot be read", topic)
        return
    if Q in (None, "ERR") or not isinstance(Q, dict):
        F.add(slug, "quiz", "error", "the questions (const quizzes) are missing or cannot be read", topic)
        Q = {}
    # ---- pages
    if not P or P[0].get("type") != "cover":
        F.add(slug, "pages", "error", "the first page is not a cover", topic)
    covers = [i for i, p in enumerate(P) if p.get("type") == "cover"]
    if len(covers) != 1:
        F.add(slug, "pages", "error", "%d cover pages" % len(covers), topic)
    imgs = collections.Counter(p.get("image") for p in P if p.get("image") and not p["image"].startswith("data:"))
    for i, p in enumerate(P):
        txt = page_text(p).strip()
        if p.get("type") == "cover" and p.get("text"):
            F.add(slug, "pages", "warn", "the cover shows a line of text (%d words) that the cover narration does not read" % len(words(p["text"])), topic)
        if not txt:
            F.add(slug, "pages", "error", "page %d has no text" % i, topic)
        if not p.get("image"):
            F.add(slug, "pages", "error", "page %d has no picture" % i, topic)
        elif p["image"].startswith("data:"):
            pass  # a picture drawn inside the page
        elif imgs[p["image"]] > 1 and i == next((j for j, q in enumerate(P) if q.get("image") == p["image"]), -1):
            F.add(slug, "pages", "warn", "the same picture is used on %d pages (first on page %d)" % (imgs[p["image"]], i), topic)
        elif slug not in p["image"] and not p["image"].startswith(("http://", "https://")):
            F.add(slug, "pages", "info", "page %d picture is not under the book's own folder: %s" % (i, p["image"]), topic)
    n = len(P)
    if n < 7 or n > 9:
        F.add(slug, "pages", "info", "%d pages (most books have 7-9)" % n, topic)
    # ---- narration (from the data in the page; the clips themselves are checked with --online)
    if not isinstance(A, dict) or not A:
        F.add(slug, "narration", "error", "no audio list (RV_AUDIO)", topic)
        A = {}
    if not isinstance(T, dict) or not T:
        F.add(slug, "narration", "error", "no word times (RV_WORD_TIMES)", topic)
        T = {}
    paces = {}
    for i, p in enumerate(P):
        k = str(i)
        txt = page_text(p).strip()
        if k not in A:
            F.add(slug, "narration", "error", "page %d has no audio" % i, topic)
        elif not isinstance(A[k], str) or not A[k].endswith(".mp3"):
            F.add(slug, "narration", "error", "page %d audio is not an mp3 link: %r" % (i, A[k]), topic)
        elif slug not in A[k]:
            F.add(slug, "narration", "warn", "page %d audio is not in the book's own audio folder" % i, topic)
        tm = T.get(k)
        if tm is None:
            F.add(slug, "narration", "error", "page %d has no word times" % i, topic)
            continue
        w = words(txt)
        if len(tm) != len(w):
            F.add(slug, "narration", "error", "page %d has %d words but %d word times: some words were not spoken or are said twice" % (i, len(w), len(tm)), topic)
        if any(b2 < a2 - 1e-6 for a2, b2 in zip(tm, tm[1:])):
            F.add(slug, "narration", "error", "page %d word times go backwards" % i, topic)
        gaps = [(round(b2 - a2, 2), j) for j, (a2, b2) in enumerate(zip(tm, tm[1:]))]
        if gaps and max(gaps)[0] > MAX_WORD_GAP:
            g, j = max(gaps)
            F.add(slug, "narration", "warn", "page %d: a %.1f s silence after word %d (%r)" % (i, g, j + 1, w[j] if j < len(w) else "?"), topic)
        if len(tm) > 3 and tm[-1] > 0:
            paces[i] = len(tm) / (tm[-1] + 0.4)
            if not PACE_LOW <= paces[i] <= PACE_HIGH:
                F.add(slug, "narration", "warn", "page %d is read at %.1f words a second (most pages are 2-3.5)" % (i, paces[i]), topic)
    if len(paces) >= 4:
        med = statistics.median(paces.values())
        for i, v in paces.items():
            if not PACE_VS_BOOK[0] <= v / med <= PACE_VS_BOOK[1]:
                F.add(slug, "narration", "info", "page %d is read %.1fx the speed of the rest of the book" % (i, v / med), topic)
    # the clips that teach the grammar questions
    ta = b["teach_audio"] if isinstance(b["teach_audio"], dict) else {}
    for qi, it in enumerate(Q.get("grammar", []) if isinstance(Q, dict) else []):
        if it.get("teach") and not ta.get("grammar-%d" % qi):
            F.add(slug, "narration", "warn", "grammar question %d has a teaching text but no teaching audio" % (qi + 1), topic)
        elif ta.get("grammar-%d" % qi):
            d = ta["grammar-%d" % qi]
            if not (isinstance(d, dict) and d.get("en") and d.get("cn")):
                F.add(slug, "narration", "warn", "grammar question %d teaching audio lacks %s" % (qi + 1, "English" if not (isinstance(d, dict) and d.get("en")) else "Chinese"), topic)
    # ---- quiz
    allq = []
    for kind, lst in Q.items():
        if not isinstance(lst, list):
            continue
        seen = set()
        for qi, it in enumerate(lst):
            where = "%s question %d" % (kind, qi + 1)
            ch = it.get("choices") or []
            ans = it.get("answer")
            if not it.get("q"):
                F.add(slug, "quiz", "error", "%s has no question text" % where, topic)
            if len(ch) < 2:
                F.add(slug, "quiz", "error", "%s has %d choices" % (where, len(ch)), topic)
            elif len(ch) == 2:
                F.add(slug, "quiz", "info", "%s has only 2 choices (guessing is right half the time)" % where, topic)
            if not isinstance(ans, int) or not 0 <= ans < len(ch):
                F.add(slug, "quiz", "error", "%s: the answer %r is not one of the %d choices" % (where, ans, len(ch)), topic)
                continue
            if len(set(str(c).strip() for c in ch)) < len(ch):
                F.add(slug, "quiz", "error", "%s has two choices that are the same" % where, topic)
            if any(not str(c).strip() for c in ch):
                F.add(slug, "quiz", "error", "%s has an empty choice" % where, topic)
            if not it.get("explain"):
                F.add(slug, "quiz", "warn", "%s has no explanation" % where, topic)
            if not it.get("hint"):
                F.add(slug, "quiz", "info", "%s has no hint" % where, topic)
            ev = it.get("evidencePage")
            if kind == "comprehension":
                if not isinstance(ev, int) or not 0 <= ev < len(P):
                    F.add(slug, "quiz", "warn", "%s points to page %r, which does not exist" % (where, ev), topic)
            qk = ((it.get("q") or "") + "|" + "|".join(str(c) for c in ch)).strip().lower()
            if qk in seen:
                F.add(slug, "quiz", "warn", "%s repeats an earlier question" % where, topic)
            seen.add(qk)
            allq.append((ans, len(ch), [len(str(c)) for c in ch]))
    counts = {k: len(v) for k, v in Q.items() if isinstance(v, list)}
    if counts and counts != {"comprehension": 5, "grammar": 3, "vocabulary": 3}:
        F.add(slug, "quiz", "info", "questions per section %s (most books: 5 reading, 3 grammar, 3 vocabulary)" % counts, topic)
    if len(allq) >= 8:
        pos = collections.Counter(a for a, _, _ in allq)
        top, share = pos.most_common(1)[0][0], pos.most_common(1)[0][1] / len(allq)
        if share >= ANSWER_SHARE_FLAG:
            F.add(slug, "quiz", "warn", "%d of %d right answers are choice %s: a child can guess by position" % (pos[top], len(allq), "ABC"[top] if top < 3 else top + 1), topic)
        longest = sum(1 for a, _, ln in allq if ln[a] == max(ln) and ln.count(max(ln)) == 1) / len(allq)
        if longest >= LONGEST_SHARE_FLAG:
            F.add(slug, "quiz", "warn", "the right answer is the longest choice in %d%% of the questions: a child can guess by length" % round(100 * longest), topic)
    return {"qpos": collections.Counter(a for a, _, _ in allq), "longest": sum(1 for a, _, ln in allq if ln[a] == max(ln) and ln.count(max(ln)) == 1), "nq": len(allq)}


def check_text(F, slug, topic, b):
    P = b["pages"]
    if not isinstance(P, list):
        return
    for i, p in enumerate(P):
        txt = page_text(p)
        w = words(txt)
        if "  " in txt.replace("\n", " ").strip():
            F.add(slug, "text", "info", "page %d has a double space" % i, topic)
        for m in re.finditer(r"\b(\w+)\s+\1\b", txt, re.I):
            if m.group(1).lower() not in OK_REPEAT:
                F.add(slug, "text", "warn", "page %d says %r twice in a row" % (i, m.group(0)), topic)
                break
        if txt.count('"') % 2:
            F.add(slug, "text", "warn", "page %d has an odd number of quotation marks" % i, topic)
        if txt.count("“") != txt.count("”"):
            F.add(slug, "text", "warn", "page %d has unmatched curly quotes" % i, topic)
        mark = re.search(r"\{\{|\}\}|\bTODO\b|lorem ipsum|\[\[|<[a-z]+>|\bundefined\b|\bNaN\b|\bnull\b", txt)
        if mark:
            F.add(slug, "text", "error", "page %d has leftover template text: %r" % (i, mark.group(0)), topic)
        if p.get("type") != "cover":
            if len(w) < 12:
                F.add(slug, "text", "info", "page %d has only %d words" % (i, len(w)), topic)
            if len(w) > 130:
                F.add(slug, "text", "info", "page %d has %d words" % (i, len(w)), topic)
            if txt.strip() and txt.strip()[-1] not in '.!?"”’)…':
                F.add(slug, "text", "info", "page %d does not end with a full stop" % i, topic)
        if re.search(r"[^\x00-\x7F“”‘’—–…éèñüöäçàâêîôûÉíóúÁ·°×÷½¼¾€£¢•−²³≥≤±≈≠→←πθ]", txt):
            c = re.search(r"[^\x00-\x7F“”‘’—–…éèñüöäçàâêîôûÉíóúÁ·°×÷½¼¾€£¢•−²³≥≤±≈≠→←πθ]", txt).group(0)
            F.add(slug, "text", "info", "page %d has an unusual character %r (U+%04X)" % (i, c, ord(c)), topic)


# ---------------------------------------------------------------- reading level
def syllables(w):
    w = w.lower()
    w = re.sub(r"[^a-z]", "", w)
    if not w:
        return 0
    if len(w) <= 3:
        return 1
    w = re.sub(r"(?:[^laeiouy]es|ed|[^laeiouy]e)$", "", w)
    w = re.sub(r"^y", "", w)
    return max(1, len(re.findall(r"[aeiouy]{1,2}", w)))


def load_rank():
    """word form -> frequency rank from the dictionary word list (tools/dict/headwords.json), if it is there"""
    f = os.path.join(ROOT, "tools", "dict", "headwords.json")
    if not os.path.isfile(f):
        return {}
    rank = {}
    for e in json.load(open(f, encoding="utf8")):
        r = e.get("frq") or 0
        for form in e.get("forms", {}):
            rank[form] = r
        rank[e["w"]] = r
    return rank


def level_of(b, rank):
    P = b["pages"]
    txt = " ".join(page_text(p) for p in P if p.get("type") != "cover")
    sents = [s for s in re.split(r"(?<=[.!?])\s+", txt) if re.search(r"[A-Za-z]", s)]
    toks = re.findall(r"[A-Za-z]+(?:'[a-z]+)?", txt)
    if len(toks) < 30 or not sents:
        return None
    syl = sum(syllables(t) for t in toks)
    wps = len(toks) / len(sents)
    fk = 0.39 * wps + 11.8 * syl / len(toks) - 15.59
    known = [rank[t.lower()] for t in toks if t.lower() in rank]
    hard = (sum(1 for r in known if r == 0 or r > 5000) / len(known)) if known else None
    return {"fk": round(fk, 1), "sent": round(wps, 1), "wlen": round(sum(len(t) for t in toks) / len(toks), 2), "hard": None if hard is None else round(100 * hard, 1), "words": len(toks)}


def check_levels(F, levels, catalog):
    by_grade = collections.defaultdict(list)
    for slug, lv in levels.items():
        g = GRADE_NUM.get(catalog.get(slug, {}).get("grade"))
        if g is not None:
            by_grade[g].append(lv["fk"])
    mid = {g: statistics.median(v) for g, v in by_grade.items()}
    spread = {g: (statistics.pstdev(v) if len(v) > 1 else 1.0) for g, v in by_grade.items()}
    for slug, lv in sorted(levels.items()):
        e = catalog.get(slug)
        if not e:
            continue
        g = GRADE_NUM.get(e.get("grade"))
        if g is None:
            continue
        off = lv["fk"] - mid[g]
        if abs(off) >= FK_OFF and abs(off) >= 2.2 * spread[g]:
            F.add(slug, "level", "warn", "reads like grade %.1f (sentences %.1f words, %.0f%% hard words) but is filed under %s, where books read like grade %.1f" % (lv["fk"] + 0, lv["sent"], lv["hard"] or 0, e["grade"], mid[g]), e["topic"])
    return mid, spread


# ---------------------------------------------------------------- the media (online)
def fetch(url, rng=None, method="GET", timeout=25):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": "site-audit/1.0"})
    if rng:
        req.add_header("Range", "bytes=%d-%d" % rng)
    last = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                data = r.read() if method == "GET" else b""
                cr = r.headers.get("Content-Range")
                size = int(cr.split("/")[-1]) if cr and "/" in cr and cr.split("/")[-1].isdigit() else int(r.headers.get("Content-Length") or len(data))
                return r.status, size, data, r.headers.get("Content-Type", "")
        except urllib.error.HTTPError as e:
            return e.code, 0, b"", ""
        except Exception as e:  # timeout, reset...
            last = e
            time.sleep(0.5 * (attempt + 1))
    return 0, 0, b"", str(last)


BITRATES = {1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0], 2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0]}
RATES = {3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000]}


def mp3_seconds(head, size):
    """length of an mp3 from its first bytes (the VBR header when there is one, otherwise the bit rate) and its size; None if unreadable"""
    i = 0
    if head[:3] == b"ID3" and len(head) > 10:
        i = 10 + ((head[6] & 0x7F) << 21 | (head[7] & 0x7F) << 14 | (head[8] & 0x7F) << 7 | (head[9] & 0x7F))
    while i + 4 < len(head):
        if head[i] == 0xFF and (head[i + 1] & 0xE0) == 0xE0:
            ver = (head[i + 1] >> 3) & 3
            layer = (head[i + 1] >> 1) & 3
            br_i = head[i + 2] >> 4
            sr_i = (head[i + 2] >> 2) & 3
            if ver == 1 or layer != 1 or br_i in (0, 15) or sr_i == 3:
                i += 1
                continue
            mpeg1 = ver == 3
            br = BITRATES[1 if mpeg1 else 2][br_i] * 1000
            sr = RATES[ver][sr_i]
            spf = 1152 if mpeg1 else 576
            chans = 1 if (head[i + 3] >> 6) == 3 else 2
            off = i + 4 + (17 if mpeg1 and chans == 1 else 32 if mpeg1 else 9 if chans == 1 else 17)
            tag = head[off:off + 4]
            if tag in (b"Xing", b"Info") and len(head) >= off + 12 and head[off + 7] & 1:
                frames = struct.unpack(">I", head[off + 8:off + 12])[0]
                return frames * spf / sr
            return size * 8 / br if br else None
        i += 1
    return None


def jpeg_png_size(head):
    if head[:8] == b"\x89PNG\r\n\x1a\n" and len(head) >= 24:
        return struct.unpack(">II", head[16:24])
    if head[:2] == b"\xff\xd8":
        i = 2
        while i + 9 < len(head):
            if head[i] != 0xFF:
                i += 1
                continue
            mk = head[i + 1]
            if mk in (0xC0, 0xC1, 0xC2):
                h, w = struct.unpack(">HH", head[i + 5:i + 9])
                return w, h
            ln = struct.unpack(">H", head[i + 2:i + 4])[0]
            i += 2 + ln
    return None


def check_media(F, books, catalog, workers, cache):
    jobs = []
    for slug, b in books.items():
        P, A, T = b["pages"], b["audio"], b["times"]
        topic = catalog.get(slug, {}).get("topic", "")
        if isinstance(P, list):
            for i, p in enumerate(P):
                if p.get("image"):
                    jobs.append(("img", slug, topic, i, p["image"], None))
        if isinstance(A, dict):
            for k, u in A.items():
                last = None
                if isinstance(T, dict) and T.get(k):
                    last = T[k][-1]
                if isinstance(u, str):
                    jobs.append(("aud", slug, topic, k, u, last))

    def one(job):
        kind, slug, topic, key, url, last = job
        ck = "%s|%s" % (kind, url)
        if ck in cache and cache[ck].get("t", 0) > time.time() - 7 * 86400 and cache[ck].get("ok"):
            return job, cache[ck]
        if kind == "img":
            st, size, head, ct = fetch(url, (0, 65535))
            res = {"st": st, "size": size, "ct": ct, "dim": jpeg_png_size(head) if st in (200, 206) else None}
        else:
            st, size, head, ct = fetch(url, (0, 8191))
            res = {"st": st, "size": size, "ct": ct, "sec": mp3_seconds(head, size) if st in (200, 206) else None}
        res["ok"] = st in (200, 206)
        res["t"] = time.time()
        return job, res

    done = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as ex:
        for job, res in ex.map(one, jobs):
            done += 1
            kind, slug, topic, key, url, last = job
            cache["%s|%s" % (kind, url)] = res
            if done % 500 == 0:
                print("  media checked: %d / %d" % (done, len(jobs)), file=sys.stderr)
            if not res["ok"]:
                F.add(slug, "media", "error", "%s %s does not answer (%s)" % ("picture of page" if kind == "img" else "audio of page", key, res["st"] or res["ct"] or "no answer"), topic)
                continue
            if kind == "img":
                if res["size"] < MIN_IMAGE_BYTES:
                    F.add(slug, "media", "warn", "the picture of page %s is only %d bytes" % (key, res["size"]), topic)
                if res["ct"] and not res["ct"].startswith("image/"):
                    F.add(slug, "media", "error", "the picture of page %s is not an image (%s)" % (key, res["ct"]), topic)
                d = res.get("dim")
                if d and (d[0] < 400 or d[1] < 300):
                    F.add(slug, "media", "warn", "the picture of page %s is small: %dx%d" % (key, d[0], d[1]), topic)
            else:
                if res["size"] < MIN_AUDIO_BYTES:
                    F.add(slug, "media", "error", "the audio of page %s is only %d bytes" % (key, res["size"]), topic)
                    continue
                sec = res.get("sec")
                if sec is None:
                    F.add(slug, "media", "info", "could not read the length of the audio of page %s" % key, topic)
                elif last is not None:
                    if sec - last > TAIL_MAX:
                        F.add(slug, "media", "error", "the audio of page %s runs %.1f s but the last word is at %.1f s: a runaway tail" % (key, sec, last), topic)
                    elif sec < last - 0.5:
                        F.add(slug, "media", "error", "the audio of page %s is %.1f s, shorter than its last word time %.1f s: it is cut off" % (key, sec, last), topic)
    return len(jobs)


# ---------------------------------------------------------------- the report
def write_report(F, summary, levels, mid, catalog, qpos_total, args, media_jobs, longest=None):
    os.makedirs(AUDIT, exist_ok=True)
    items = sorted(F.items, key=lambda x: (SEV_ORDER[x["sev"]], x["check"], x["slug"], x["msg"]))
    json.dump({"made": time.strftime("%Y-%m-%d %H:%M"), "summary": summary, "findings": items}, open(os.path.join(AUDIT, "report.json"), "w"), indent=1, ensure_ascii=False)
    by = collections.defaultdict(lambda: collections.Counter())
    for x in items:
        by[x["check"]][x["sev"]] += 1
    L = ["# Library health check", "", "Made %s · %d books read%s" % (time.strftime("%Y-%m-%d %H:%M"), summary["books"], (" · %d picture and audio files asked about" % media_jobs) if args.online else " · media files not checked (run with --online)"), ""]
    L += ["## Summary", "", "| Check | Errors | Warnings | Notes |", "|---|---|---|---|"]
    for ck in ("catalog", "pages", "narration", "quiz", "text", "level", "media"):
        if ck == "media" and not args.online:
            continue
        c = by.get(ck, collections.Counter())
        L.append("| %s | %d | %d | %d |" % (ck, c["error"], c["warn"], c["info"]))
    tot = collections.Counter(x["sev"] for x in items)
    L += ["", "**%d errors, %d warnings, %d notes.** Errors are things a child would notice (a page with no sound, an answer that is not one of the choices). Warnings are probably wrong. Notes are worth a look.  " % (tot["error"], tot["warn"], tot["info"]), ""]
    if qpos_total:
        n = sum(qpos_total.values())
        L += ["Right-answer positions in all %d questions: %s" % (n, ", ".join("%s %d%%" % ("ABC"[k] if k < 3 else k + 1, round(100 * v / n)) for k, v in sorted(qpos_total.items()))), ""]
    if longest:
        n = sum(v[1] for v in longest.values())
        a = sum(v[0] for v in longest.values())
        L += ["The right answer is the longest of the choices in **%d%%** of the %d questions (guessing the longest would be right a third of the time by chance). By topic: %s." % (round(100 * a / max(1, n)), n, ", ".join("%s %d%%" % (t, round(100 * v[0] / max(1, v[1]))) for t, v in sorted(longest.items()))), ""]
    if levels:
        per = collections.defaultdict(list)
        for slug, lv in levels.items():
            g = GRADE_NUM.get(catalog.get(slug, {}).get("grade"))
            if g is not None:
                per[g].append(lv)
        L += ["## Reading level by grade", "", "How hard the books read, for the grade they are filed under. If the grades were well spread out, each row would be a step up from the one before.", "",
              "| Grade | Books | Reading level (Flesch-Kincaid, middle) | Middle half | Words in a sentence | Hard words |", "|---|---|---|---|---|---|"]
        for g in sorted(per):
            fk = sorted(v["fk"] for v in per[g])
            hard = [v["hard"] for v in per[g] if v["hard"] is not None]
            L.append("| %s | %d | %.1f | %.1f - %.1f | %.1f | %s |" % ("K" if g == 0 else "G%d" % g, len(fk), statistics.median(fk), fk[len(fk) // 4], fk[(3 * len(fk)) // 4], statistics.median(v["sent"] for v in per[g]), ("%.1f%%" % statistics.median(hard)) if hard else "-"))
        L.append("")
    L += ["## Books to look at first", "", "Books with the most errors, then warnings:", ""]
    perbook = collections.defaultdict(collections.Counter)
    for x in items:
        perbook[(x["topic"], x["slug"])][x["sev"]] += 1
    worst = sorted(perbook.items(), key=lambda kv: (-kv[1]["error"], -kv[1]["warn"], kv[0]))[:25]
    L += ["| Book | Errors | Warnings | Notes |", "|---|---|---|---|"] + ["| %s/%s | %d | %d | %d |" % (t, s, c["error"], c["warn"], c["info"]) for (t, s), c in worst if c["error"] or c["warn"]]
    for sev, title in (("error", "Errors"), ("warn", "Warnings")):
        sel = [x for x in items if x["sev"] == sev]
        L += ["", "## %s (%d)" % (title, len(sel)), ""]
        cur, shown = None, 0
        for x in sel:
            if x["check"] != cur:
                cur, shown = x["check"], 0
                L += ["", "### %s (%d)" % (cur, sum(1 for y in sel if y["check"] == cur)), ""]
            shown += 1
            if shown <= 80:
                L.append("- `%s/%s` %s" % (x["topic"], x["slug"], x["msg"]))
            elif shown == 81:
                L.append("- ... and more: all of them are in report.json")
    L += ["", "## Notes", "", "Notes are in report.json (%d of them); they are not listed here to keep this page short." % tot["info"], ""]
    open(os.path.join(AUDIT, "report.md"), "w", encoding="utf8").write("\n".join(L))
    return tot


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--online", action="store_true", help="also ask the media server about every picture and audio file")
    ap.add_argument("--only", nargs="*", help="check just these books (slugs)")
    ap.add_argument("--workers", type=int, default=16)
    ap.add_argument("--fail-on", choices=["error", "warn", "none"], default="none")
    args = ap.parse_args()

    catalog, dup = load_catalog()
    files = sorted(glob.glob(os.path.join(BOOKS, "*", "*.html")))
    F = Findings()
    check_catalog(F, catalog, dup, files)
    books, levels, qpos_total = {}, {}, collections.Counter()
    longest = collections.defaultdict(lambda: [0, 0])
    rank = load_rank()
    for f in files:
        slug, topic = os.path.basename(f)[:-5], os.path.basename(os.path.dirname(f))
        if args.only and slug not in args.only:
            continue
        b = load_book(f)
        books[slug] = b
        r = check_book(F, slug, topic, b, catalog.get(slug))
        if r:
            qpos_total.update(r["qpos"])
            longest[topic][0] += r["longest"]
            longest[topic][1] += r["nq"]
        check_text(F, slug, topic, b)
        if isinstance(b["pages"], list):
            lv = level_of(b, rank)
            if lv:
                levels[slug] = lv
    mid, spread = check_levels(F, levels, catalog)
    media_jobs = 0
    if args.online:
        cf = os.path.join(AUDIT, "media_cache.json")
        os.makedirs(AUDIT, exist_ok=True)
        cache = json.load(open(cf)) if os.path.isfile(cf) else {}
        media_jobs = check_media(F, books, catalog, args.workers, cache)
        json.dump(cache, open(cf, "w"))
    summary = {"books": len(books), "levels": levels}
    tot = write_report(F, {"books": len(books)}, levels, mid, catalog, qpos_total, args, media_jobs, longest)
    json.dump(levels, open(os.path.join(AUDIT, "levels.json"), "w"))
    print("books: %d | errors: %d | warnings: %d | notes: %d" % (len(books), tot["error"], tot["warn"], tot["info"]))
    print("report: tools/audit/report.md")
    if (args.fail_on == "error" and tot["error"]) or (args.fail_on == "warn" and (tot["error"] or tot["warn"])):
        sys.exit(1)


if __name__ == "__main__":
    main()
