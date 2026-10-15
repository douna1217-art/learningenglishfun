#!/usr/bin/env python3
"""Sight words, stage 2: the Dolch grade 1 (41) and grade 2 (46) words as 20 short lessons on the beach island.

Same idea as tools/sightwords_stage1.py (it uses its helpers): lessons, one short example sentence per word, a check that the
sentences only use words of the two stages plus a few picture nouns, and a count of how often each word is used in the site's books
(with the best "read it next" book for each lesson). Writes site/sightwords-data2.js, a plain script that sets window.SW_DATA2;
sightwords.js adds it to the stage-1 data (lessons 19-38, units 6-10, stage 2 turns "ready").

  python3 tools/sightwords_stage2.py            # check + write site/sightwords-data2.js + print the numbers
  python3 tools/sightwords_stage2.py --check    # only check, write nothing

The Dolch lists are the standard ones (41 and 46 words). The sentences are written for this site.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sightwords_stage1 as S1  # noqa: E402

REPO, SITE = S1.REPO, S1.SITE

GRADE1 = ("after again an any as ask by could every fly from give going had has her him his how just know let live may of old once "
          "open over put round some stop take thank them then think walk were when").split()
GRADE2 = ("always around because been before best both buy call cold does don't fast first five found gave goes green its made many "
          "off or pull read right sing sit sleep tell their these those upon us use very wash which why wish work would write your").split()

# lesson ids go on after stage 1 (1-18), unit ids after its units (1-5); a unit is one world of the beach island
LESSONS = [
    "walk stop open sit", "fly sing sleep wash", "write read work use give", "take put pull buy",                  # 6 Golden sand: things we do
    "call old cold round fast", "green five first best", "many both very right", "made gave found goes",           # 7 Ice cream pier: describing
    "how why which wish", "think know ask tell may", "thank live let going", "had has does don't",                   # 8 Coral reef: asking and thinking
    "after again then when were", "over around off by", "from upon of an", "any as could would just",                # 9 Lighthouse harbor: little words
    "her him his them", "their your its us or", "these those every some", "once because before been always",         # 10 Sunset sail: people and joining words
]
FIRST_LESSON = 19
FIRST_UNIT = 6
UNITS = [[19, 20, 21, 22], [23, 24, 25, 26], [27, 28, 29, 30], [31, 32, 33, 34], [35, 36, 37, 38]]

SENT = {
    "walk": "I walk with my dog.", "stop": "The bus must stop.", "open": "Open the gift.", "sit": "The dog can sit.",
    "fly": "The bird can fly.", "sing": "We can sing.", "sleep": "I sleep in my bed.", "wash": "I wash my dog.",
    "write": "I write in my book.", "read": "Mom will read to me.", "work": "Mom is at work.", "use": "I use an umbrella.",
    "give": "I give Mom a gift.",
    "take": "I take my bag.", "put": "Put the ball in the box.", "pull": "We pull the box.", "buy": "Mom will buy a hat.",
    "call": "I call Mom.", "old": "My cat is old.", "cold": "I am cold.", "round": "The ball is round.", "fast": "The cat can run fast.",
    "green": "I see a green frog.", "five": "I see five ducks.", "first": "I came in first.", "best": "You are the best.",
    "many": "I see many fish.", "both": "I have both hats.", "very": "The dog is very big.", "right": "Go to the right.",
    "made": "I made a kite.", "gave": "Mom gave me a hat.", "found": "We found a frog.", "goes": "The bus goes up the hill.",
    "how": "How big is the tree?", "why": "Why is the cat up there?", "which": "Which hat is red?", "wish": "I wish for a kite.",
    "think": "I think it is a cat.", "know": "I know it is a duck.", "ask": "I ask Mom for help.", "tell": "I can tell Mom.",
    "may": "May I play?",
    "thank": "Thank you, Mom.", "live": "I live in a house.", "let": "Let me in, please.", "going": "I am going to jump.",
    "had": "The cat had a fish.", "has": "Mom has a cake.", "does": "Does the dog like cake?", "don't": "Don’t jump on the bed.",
    "after": "We play after we eat.", "again": "The frog can jump again.", "then": "I run, then I jump.", "when": "Go when it is green.",
    "were": "The ducks were in the pond.",
    "over": "I can jump over the pond.", "around": "We run around the tree.", "off": "Jump off the rock.", "by": "The cat is by the box.",
    "from": "The gift is from Mom.", "upon": "The frog is upon the rock.", "of": "I see a bag of apples.", "an": "I see an apple.",
    "any": "Do you see any birds?", "as": "Look as I jump.", "could": "Could you help me?", "would": "Would you like a cake?",
    "just": "Just one, please.",
    "her": "I see her hat.", "him": "Look at him jump.", "his": "This is his dog.", "them": "I see them play.",
    "their": "This is their house.", "your": "Is this your hat?", "its": "The dog has its ball.", "us": "Come with us.",
    "or": "Do you like red or blue?",
    "these": "These are my cats.", "those": "Those are big trees.", "every": "Every cat has a hat.", "some": "Some cats are black.",
    "once": "I saw a frog once.", "because": "I ran because I saw a dog.", "before": "We wash before we eat.",
    "been": "Have you been to the pond?", "always": "I always say please.",
}
# picture nouns the stage-2 sentences use besides the nouns of stage 1
NOUNS2 = set("gift umbrella pond apples birds trees hill rock house hats".split())

UNIT_NAMES = ["Golden sand", "Ice cream pier", "Coral reef", "Lighthouse harbor", "Sunset sail"]
MAX_WORDS = 7


def check():
    words = GRADE1 + GRADE2
    problems = []
    if len(GRADE1) != 41 or len(set(GRADE1)) != 41:
        problems.append(("grade 1 must be 41 distinct words", len(GRADE1), len(set(GRADE1))))
    if len(GRADE2) != 46 or len(set(GRADE2)) != 46:
        problems.append(("grade 2 must be 46 distinct words", len(GRADE2), len(set(GRADE2))))
    if set(GRADE1) & set(GRADE2):
        problems.append(("lists overlap", sorted(set(GRADE1) & set(GRADE2))))
    stage1 = set(w.lower() for w in S1.PRE_PRIMER + S1.PRIMER)
    if stage1 & set(words):
        problems.append(("a stage-2 word is already in stage 1", sorted(stage1 & set(words))))
    lw = [w for l in LESSONS for w in l.split()]
    if sorted(lw) != sorted(words):
        problems.append(("lessons do not cover the 87 words exactly once",
                         sorted(set(words) - set(lw)), sorted(set(lw) - set(words)), [w for w in set(lw) if lw.count(w) > 1]))
    sizes = [len(l.split()) for l in LESSONS]
    if sizes != [4, 4, 5, 4, 5, 4, 4, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 5, 4, 5]:
        problems.append(("lesson sizes", sizes))
    flat = [i for u in UNITS for i in u]
    if flat != list(range(FIRST_LESSON, FIRST_LESSON + len(LESSONS))):
        problems.append(("units must list every lesson once, in order", flat))
    allowed = {w.lower().replace("’", "'") for w in words} | {w.lower() for w in S1.PRE_PRIMER + S1.PRIMER} | S1.NOUNS | NOUNS2
    for w in words:
        s = SENT.get(w)
        if not s:
            problems.append(("missing sentence", w))
            continue
        toks = [t.lower().replace("’", "'") for t in S1.tokens(s)]
        hits = toks.count(w.lower())
        if hits != 1:
            problems.append(("target word must appear exactly once", w, s, hits))
        bad = [t for t in toks if t not in allowed]
        if bad:
            problems.append(("sentence uses other words", w, s, bad))
        if len(toks) > MAX_WORDS:
            problems.append(("sentence longer than %d words" % MAX_WORDS, w, s))
    extra = set(SENT) - set(words)
    if extra:
        problems.append(("sentences for words that are not in the lists", sorted(extra)))
    # a word and its sentence never share an audio file name with another word
    keys = [S1.re.sub(r"[^a-z]", "", w.lower()) for w in words + S1.PRE_PRIMER + S1.PRIMER]
    if len(set(keys)) != len(keys):
        problems.append(("two words share an audio file name",))
    return problems


def main():
    problems = check()
    for p in problems:
        print("PROBLEM:", p)
    if problems:
        print("CHECK FAILED")
        return 1
    print("check ok: 41 + 46 words, %d lessons, %d sentences" % (len(LESSONS), len(SENT)))
    if "--check" in sys.argv:
        return 0
    words = GRADE1 + GRADE2
    books, freq, inbooks, cover = S1.corpus_stats(words)
    print("books read: %d" % len(books))
    for k, label in (("early", "Kindergarten + Grade 1 books"), ("all", "all books")):
        h, t = cover[k]
        print("the 87 words are %.1f%% of all word tokens in %s (%d of %d)" % (100.0 * h / max(1, t), label, h, t))
    rare = sorted(words, key=lambda w: freq[w])[:8]
    print("least used in our books:", ", ".join("%s=%d" % (w, freq[w]) for w in rare))
    stories = [b for b in books if b["sub"] in ("fiction", "sel")]     # the "read it in a story" link should open a story
    lessons = []
    for i, l in enumerate(LESSONS):
        ws = l.split()
        kinds = set("g1" if w in GRADE1 else "g2" for w in ws)
        lessons.append({"id": FIRST_LESSON + i, "stage": 2, "list": kinds.pop() if len(kinds) == 1 else "mix", "words": ws,
                        "books": S1.best_books(stories, ws, ("Grade 1", "Grade 2"))})
    data = {
        "stage": 2, "name": "Stage 2", "source": "Dolch grade 1 and 2",
        "lessons": lessons,
        "units": [{"id": FIRST_UNIT + i, "stage": 2, "lessons": u} for i, u in enumerate(UNITS)],
        "words": {w: {"list": "g1" if w in GRADE1 else "g2", "s": SENT[w], "n": freq[w], "b": inbooks[w]} for w in words},
        "nouns": sorted(NOUNS2),
    }
    out = os.path.join(SITE, "sightwords-data2.js")
    with open(out, "w", encoding="utf-8") as f:
        f.write("/* made by tools/sightwords_stage2.py; do not edit by hand */\nwindow.SW_DATA2=" + json.dumps(data, ensure_ascii=True, separators=(",", ":")) + ";\n")
    print("wrote", os.path.relpath(out, REPO), os.path.getsize(out), "bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
