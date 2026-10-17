#!/usr/bin/env python3
"""Sight words, stage 1: the Dolch pre-primer (40) and primer (52) words as 18 short lessons.

Source of truth for the sample: lessons, one short example sentence per word, and a check that the
sentences only use stage-1 words plus a few picture nouns. It also reads every book on the site to
count how often each word is used and which books are the best "read it next" match for each lesson,
then writes site/sightwords-data.js (a plain script that sets window.SW_DATA, written for old Android).

  python3 tools/sightwords_stage1.py            # check + write site/sightwords-data.js + print the numbers
  python3 tools/sightwords_stage1.py --check    # only check, write nothing

The Dolch lists are the standard ones (the sizes, 40 and 52, were cross-checked against published
teaching copies). The sentences are written for this site.
"""
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(REPO, "site")

PRE_PRIMER = ("a and away big blue can come down find for funny go help here I in is it jump little look make me my "
              "not one play red run said see the three to two up we where yellow you").split()
PRIMER = ("all am are at ate be black brown but came did do eat four get good have he into like must new no now on our "
          "out please pretty ran ride saw say she so soon that there they this too under want was well went what white "
          "who will with yes").split()

# teaching order: the easiest, most useful words first; pictures for colours and numbers come in the middle
LESSONS = [
    "I a the and you", "see look can go up", "it is in we me", "my to come run jump",
    "big little red blue yellow", "play help here down away", "find make for not where", "said one two three funny",
    "he she they are was", "have do did so no", "yes on at be am", "this that there what who",
    "want like get eat ate", "saw say came went ran", "good new pretty please now", "black white brown four all",
    "but into must out our with", "will well soon too under ride",
]

# a unit = a few lessons (about 20 words); the app shows one unit at a time and gives a small challenge when it is finished
UNITS = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18]]

# the stages the child sees on the first page. Only stage 1 has lessons so far; the others are shown as "coming soon" and
# the sizes are the published list sizes (Dolch grade 1 = 41, grade 2 = 46, grade 3 = 41, 95 nouns; Fry 1000 has about 700
# words that are not already in the Dolch lists).
STAGES = [
    {"id": 1, "title": "First words", "source": "Dolch pre-primer + primer", "grades": "K\u20131", "words": 92, "ready": True},
    {"id": 2, "title": "Growing readers", "source": "Dolch grade 1 + 2", "grades": "1\u20132", "words": 87, "ready": False},
    {"id": 3, "title": "Bigger stories", "source": "Dolch grade 3 + common nouns", "grades": "2\u20133", "words": 136, "ready": False},
    {"id": 4, "title": "Word explorers", "source": "Fry words, part 1", "grades": "3\u20134", "words": 140, "ready": False},
    {"id": 5, "title": "Word adventurers", "source": "Fry words, part 2", "grades": "3\u20134", "words": 140, "ready": False},
    {"id": 6, "title": "Word divers", "source": "Fry words, part 3", "grades": "4\u20135", "words": 140, "ready": False},
]

# one short sentence per word. The word appears exactly once; "{w}" marks nothing, the app finds it by itself.
SENT = {
    "I": "I can run.", "a": "I see a cat.", "the": "I see the dog.", "and": "The cat and the dog play.", "you": "I see you.",
    "see": "I can see a bird.", "look": "Look at the big fish.", "can": "I can jump.", "go": "We go up.", "up": "The kite is up.",
    "it": "It is a red ball.", "is": "The cat is big.", "in": "The fish is in the box.", "we": "We can play.", "me": "Look at me.",
    "my": "I see my dog.", "to": "Come to me.", "come": "Come and see.", "run": "The dog can run.", "jump": "The frog can jump.",
    "big": "I see a big tree.", "little": "I see a little bird.", "red": "I see a red hat.", "blue": "The blue bag is big.",
    "yellow": "The yellow duck can play.",
    "play": "We can play with the ball.", "help": "Can you help me?", "here": "Come here, Sam.", "down": "The ball can go down.",
    "away": "The dog can run away.",
    "find": "I can find my hat.", "make": "We can make a cake.", "for": "This is for you.", "not": "The cat is not big.",
    "where": "Where is my hat?",
    "said": "“I can jump,” said the frog.", "one": "I see one dog.", "two": "I see two cats.", "three": "I see three ducks.",
    "funny": "The funny dog can jump.",
    "he": "He can run.", "she": "She can jump.", "they": "They can play.", "are": "You are big.", "was": "The cat was in the box.",
    "have": "I have a red ball.", "do": "What do you see?", "did": "Did you see the dog?", "so": "It is so big!", "no": "No, it is not red.",
    "yes": "Yes, I can jump.", "on": "The cat is on the bed.", "at": "Look at the bird.", "be": "I will be good.", "am": "I am a boy.",
    "this": "This is my hat.", "that": "That is a big bus.", "there": "There is a duck.", "what": "What is that?", "who": "Who is in the box?",
    "want": "I want a cake.", "like": "I like my dog.", "get": "I can get the ball.", "eat": "We eat cake.", "ate": "The dog ate the cake.",
    "saw": "I saw a frog.", "say": "What do you say?", "came": "Mom came to see me.", "went": "We went to the bus.", "ran": "The dog ran to me.",
    "good": "The dog is good.", "new": "I have a new hat.", "pretty": "I see a pretty bird.", "please": "Help me, please.", "now": "Come here now.",
    "black": "I see a black cat.", "white": "I see a white duck.", "brown": "The brown dog can run.", "four": "I see four fish.",
    "all": "We can all play.",
    "but": "I can run but not jump.", "into": "The cat ran into the box.", "must": "We must go now.", "out": "The dog ran out.",
    "our": "This is our bus.", "with": "I play with my dog.",
    "will": "I will help you.", "well": "You can run well.", "soon": "We will go soon.", "too": "I can jump too.",
    "under": "The cat is under the bed.", "ride": "We ride the bus.",
}
# picture nouns and a name the sentences may use besides the stage-1 words themselves
NOUNS = set(("cat cats dog ball hat bed bag fish bird frog duck ducks sun mom dad boy girl baby cake tree car bus book apple "
             "kite box sam").split())


def tokens(s):
    # a word may hold an apostrophe inside it ("don't"); quotes around a sentence are not part of a word
    return re.findall(r"[A-Za-z]+(?:['\u2019][A-Za-z]+)*", s)


def check():
    words = PRE_PRIMER + PRIMER
    problems = []
    if len(PRE_PRIMER) != 40 or len(set(PRE_PRIMER)) != 40:
        problems.append(("pre-primer must be 40 distinct words", len(PRE_PRIMER)))
    if len(PRIMER) != 52 or len(set(PRIMER)) != 52:
        problems.append(("primer must be 52 distinct words", len(PRIMER)))
    if set(PRE_PRIMER) & set(PRIMER):
        problems.append(("lists overlap", sorted(set(PRE_PRIMER) & set(PRIMER))))
    lw = [w for l in LESSONS for w in l.split()]
    if sorted(lw) != sorted(words):
        problems.append(("lessons do not cover the 92 words exactly once",
                         sorted(set(words) - set(lw)), sorted(set(lw) - set(words)), [w for w in set(lw) if lw.count(w) > 1]))
    if [len(l.split()) for l in LESSONS] != [5] * 16 + [6, 6]:
        problems.append(("lesson sizes", [len(l.split()) for l in LESSONS]))
    flat = [i for u in UNITS for i in u]
    if flat != list(range(1, len(LESSONS) + 1)):
        problems.append(("units must list every lesson once, in order", flat))
    if STAGES[0]["words"] != len(words):
        problems.append(("stage 1 size does not match the word lists", STAGES[0]["words"], len(words)))
    allowed = {w.lower() for w in words} | NOUNS
    for w in words:
        s = SENT.get(w)
        if not s:
            problems.append(("missing sentence", w))
            continue
        toks = [t.lower() for t in tokens(s)]
        hits = toks.count(w.lower())
        if hits != 1:
            problems.append(("target word must appear exactly once", w, s, hits))
        bad = [t for t in toks if t not in allowed]
        if bad:
            problems.append(("sentence uses other words", w, s, bad))
        if len(toks) > 6:
            problems.append(("sentence longer than 6 words", w, s))
    extra = set(SENT) - set(words)
    if extra:
        problems.append(("sentences for words that are not in the lists", sorted(extra)))
    return problems


# ------------------------------------------------------------------ the corpus
PAGES_RE = re.compile(r"const pages=(\[.*?\]);\s*\nconst quizzes=", re.S)
GRADE_RE = re.compile(r"· (Kindergarten|Grade [1-6]) ([A-Za-z &-]+?)(?:<|\")")


def read_books():
    books = []
    root = os.path.join(SITE, "books")
    for sub in sorted(os.listdir(root)):
        d = os.path.join(root, sub)
        if not os.path.isdir(d):
            continue
        for fn in sorted(os.listdir(d)):
            if not fn.endswith(".html"):
                continue
            h = open(os.path.join(d, fn), encoding="utf-8").read()
            m = PAGES_RE.search(h)
            if not m:
                continue
            try:
                pages = json.loads(m.group(1))
            except Exception:
                continue
            g = GRADE_RE.search(h)
            text = " ".join((p.get("text") or "") for p in pages)
            t = re.search(r"<title>(.*?)</title>", h)
            books.append({"file": "books/%s/%s" % (sub, fn), "sub": sub, "grade": g.group(1) if g else "", "text": text,
                          "title": (pages[0].get("title") if pages and pages[0].get("title") else (t.group(1) if t else fn))})
    return books


def corpus_stats(words):
    books = read_books()
    low = {w.lower(): w for w in words}
    freq = {w: 0 for w in words}
    inbooks = {w: 0 for w in words}
    total = 0
    cover = {"all": [0, 0], "early": [0, 0]}      # [tokens that are stage-1 words, all tokens]
    for b in books:
        toks = [t.lower() for t in tokens(b["text"])]
        b["n"] = len(toks)
        c = {}
        for t in toks:
            if t in low:
                c[low[t]] = c.get(low[t], 0) + 1
        b["counts"] = c
        for w, k in c.items():
            freq[w] += k
            inbooks[w] += 1
        hit = sum(c.values())
        total += len(toks)
        cover["all"][0] += hit
        cover["all"][1] += len(toks)
        if b["grade"] in ("Kindergarten", "Grade 1"):
            cover["early"][0] += hit
            cover["early"][1] += len(toks)
    return books, freq, inbooks, cover


def best_books(books, lesson_words, grades=("Kindergarten", "Grade 1")):
    """Early books (Kindergarten, Grade 1 by default) that use the most of this lesson's words, per 100 words of text."""
    best = []
    for b in books:
        if b["grade"] not in grades or b["n"] < 60:
            continue
        have = [w for w in lesson_words if b["counts"].get(w)]
        if len(have) < 3:
            continue
        dens = 100.0 * sum(b["counts"].get(w, 0) for w in lesson_words) / b["n"]
        best.append((len(have), dens, b))
    best.sort(key=lambda x: (-x[0], -x[1]))
    out = []
    for n, dens, b in best[:2]:
        out.append({"file": b["file"], "title": b["title"], "sub": b["sub"], "has": n})
    return out


def main():
    problems = check()
    for p in problems:
        print("PROBLEM:", p)
    if problems:
        print("CHECK FAILED")
        return 1
    print("check ok: 40 + 52 words, 18 lessons, 92 sentences")
    if "--check" in sys.argv:
        return 0
    words = PRE_PRIMER + PRIMER
    books, freq, inbooks, cover = corpus_stats(words)
    print("books read: %d" % len(books))
    for k, label in (("early", "Kindergarten + Grade 1 books"), ("all", "all books")):
        h, t = cover[k]
        print("the 92 words are %.1f%% of all word tokens in %s (%d of %d)" % (100.0 * h / max(1, t), label, h, t))
    rare = sorted(words, key=lambda w: freq[w])[:8]
    print("least used in our books:", ", ".join("%s=%d" % (w, freq[w]) for w in rare))
    lessons = []
    for i, l in enumerate(LESSONS, 1):
        ws = l.split()
        lessons.append({"id": i, "list": "pp" if i <= 8 else "p", "words": ws, "books": best_books(books, ws)})
    data = {
        "stage": 1, "name": "Stage 1", "source": "Dolch pre-primer and primer",
        "lessons": lessons,
        "units": [{"id": i, "stage": 1, "lessons": u} for i, u in enumerate(UNITS, 1)],
        "stages": STAGES,
        "words": {w: {"list": "pp" if w in PRE_PRIMER else "p", "s": SENT[w], "n": freq[w], "b": inbooks[w]} for w in words},
        "nouns": sorted(NOUNS),
    }
    out = os.path.join(SITE, "sightwords-data.js")
    with open(out, "w", encoding="utf-8") as f:
        f.write("/* made by tools/sightwords_stage1.py; do not edit by hand */\nwindow.SW_DATA=" + json.dumps(data, ensure_ascii=True, separators=(",", ":")) + ";\n")
    print("wrote", os.path.relpath(out, REPO), os.path.getsize(out), "bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
