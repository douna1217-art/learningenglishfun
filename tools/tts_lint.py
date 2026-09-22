"""Pre-voicing lint: flag page text / teach strings the TTS is likely to
mangle. Run on every new batch BEFORE telling the user to run voice_all.py.

Committed, permanent copy -- this previously lived only in ephemeral
per-session scratchpads and was rebuilt from scratch multiple times (see
grade456-humanities-book-format memory). Covers the numbered-section
Fiction/SEL/Social-Studies format (const pages=[...];\nconst quizzes={...};
\nlet page=0). For K/Grade-1-3 books with a different template shape, this
silently no-ops -- see tts_lint_k.py in the K-3 humanities format notes
(not yet committed as of 2026-09-21).

Usage: python3 tts_lint.py <book.html> [<book.html> ...]
       python3 tts_lint.py --glob <glob-pattern> [<glob-pattern> ...]
"""
import sys, re, json, glob


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s)


def has_cjk(s):
    return any('一' <= ch <= '鿿' for ch in s)


RISKS = [
    ("punctuation-directive+colon",
     re.compile(r"^\s*(Put|Add|Use|Insert|Place)\s+(a|an|the)?\s*(comma|semicolon|colon|period|dash|apostrophe|hyphen|quotation|question mark|exclamation)[^.!?]{0,50}:\s", re.I),
     "TTS reads the leading punctuation instruction as a directive to itself and skips it (SS fifty-states case) -- reword as declarative"),
    ("number-homophone-start", re.compile(r"^(For|Four|Ate|Eight|Won|One|Too|Two|To)\b\s+(can|means|is|shows|pairs?|matches)\b", re.I),
     "TTS reads a bare leading 'For' as 'four'; don't start a teach with a quoted function word -- rephrase ('The word for ...')"),
    ("spelled-digit-run", re.compile(r"\bdigits?\s+\d(\s+\d){1,3}\b"),
     "TTS collapses '1 2 0' into '120'; digit-by-digit teaching point is lost"),
    ("read-as X are read Y", re.compile(r"are read\b.*\b(one|two|three|four|five|six|seven|eight|nine|ten|twenty|hundred)\b", re.I),
     "if both sides render to the same digits, the sentence becomes circular in audio"),
    ("literal-ellipsis", re.compile(r"\S\.\.\.\s*\S"),
     "'...' is silent; a chant like 'ten, twenty, thirty... one hundred' loses the middle (counting-by-tens case)"),
    ("stage-direction-colon-example", re.compile(r"\b(means|is)\b[^.:!?]{0,40}:\s*[A-Z0-9]"),
     "confirmed real (2026-09-19, K batch): colon-then-example can drop everything after the colon regardless of imperative vs declarative lead-in -- reword as ', like <example>' instead of ': <example>'"),
    ("rule-colon-example-generic", re.compile(r"\b(Add|Use)\b[^.:!?]{0,50}:\s*[A-Z]"),
     "same colon-drop risk as stage-direction-colon-example but without means/is -- e.g. 'Add -ed to show something already happened: Kai covered...' dropped the example at ratio 0.67 -- reword with ', like' instead of ':'"),
    ("parenthetical-aside", re.compile(r"\([^)]+\)"),
     "TTS can silently drop a mid-sentence parenthetical entirely (its/it's case, ratio 0.67) -- rewrite as a plain clause instead of '(...)'"),
]


def lint_text(label, text):
    hits = []
    for name, rx, why in RISKS:
        if rx.search(text):
            hits.append((name, why))
    return hits


def lint_file(path):
    h = open(path, encoding="utf-8").read()
    m = re.search(r'const pages=(\[.*?\]);\nconst quizzes=(\{.*?\});\nlet page=0', h, re.S)
    if not m:
        print(f"{path}: could not parse pages/quizzes")
        return 0
    pages = json.loads(m.group(1))
    quizzes = json.loads(m.group(2))
    n = 0
    for i, p in enumerate(pages):
        t = (p.get("text") or (p.get("title", "") + ". " + p.get("subtitle", "")))
        for name, why in lint_text(f"p{i}", t):
            print(f"  {path}  p{i}  [{name}]  {t[:80]!r}\n      -> {why}")
            n += 1
    for sec in ("grammar", "vocabulary", "comprehension"):
        for j, it in enumerate(quizzes.get(sec, [])):
            for fld in ("teach",):  # only the fields voice_all.py actually voices
                if fld not in it:
                    continue
                t = strip_tags(it[fld].split("<span")[0])
                if has_cjk(t):
                    print(f"  {path}  {sec}[{j}].{fld}  [en-cn-SWAPPED]  {t[:80]!r}\n      -> the voiced (pre-span) half contains Chinese -- TTS will read it as English garbage")
                    n += 1
                cn_m = it[fld].split("<span")
                if len(cn_m) > 1 and not has_cjk(cn_m[1]):
                    print(f"  {path}  {sec}[{j}].{fld}  [cn-span-has-no-chinese]  {cn_m[1][:60]!r}")
                    n += 1
                for name, why in lint_text(f"{sec}-{j}.{fld}", t):
                    print(f"  {path}  {sec}[{j}].{fld}  [{name}]  {t[:80]!r}\n      -> {why}")
                    n += 1
    return n


if __name__ == "__main__":
    args = sys.argv[1:]
    if args and args[0] == "--glob":
        files = []
        for g in args[1:]:
            files += glob.glob(g)
    else:
        files = args
    total = 0
    for f in files:
        total += lint_file(f)
    print(f"\nTTS lint: {len(files)} files, {total} flags")
    sys.exit(1 if total else 0)
