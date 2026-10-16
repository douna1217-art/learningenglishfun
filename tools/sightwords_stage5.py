#!/usr/bin/env python3
"""Sight words, stage 5 (part 2): 140 more Fry words as 30 short lessons on the jungle island.

Same idea as tools/sightwords_stage4.py (it uses the helpers of stages 1 to 4): lessons, one short example sentence per word, a check
that the sentences only use words of the five stages plus a few picture nouns, and a count of how often each word is used in the site's
books (with the best "read it next" book for each lesson). Writes site/sightwords-data5.js, a plain script that sets window.SW_DATA5;
sightwords.js adds it to the data of stages 1 to 4 (lessons 99-128, units 21-25, stage 5 turns "ready").

  python3 tools/sightwords_stage5.py            # check + write site/sightwords-data5.js + print the numbers
  python3 tools/sightwords_stage5.py --check    # only check, write nothing

The words are the next ones of the Fry 1000 Instant Words (the words that Dolch and stages 1 to 4 do not have yet): what was left of the
second to fifth hundred, then the sixth hundred, then a few of the seventh, chosen for being common and easy to show in a picture.
Left out on purpose: names of countries, peoples and God (Europe, Africa, England, French, Japanese, Greek, British, God...) and the
words about grammar and science (noun, verb, vowel, equation, molecules...). The sentences are written for this site.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sightwords_stage1 as S1  # noqa: E402
import sightwords_stage2 as S2  # noqa: E402
import sightwords_stage3 as S3  # noqa: E402
import sightwords_stage4 as S4  # noqa: E402

REPO, SITE = S1.REPO, S1.SITE

# lesson ids go on after stage 4 (69-98), unit ids after its units (16-20); a unit is one world of the jungle island
LESSONS = [
    "edge bottom middle outside beside", "cross rolled pushed jumped", "race speed drive train sail", "wide tall tiny length inches",   # 21 Vine bridge: places and ways to go
    "distance center direction mile end", "north south west wall",
    "lake stone soil ice sky", "moon forest mountains flowers root", "summer winter weather wild bright", "gold iron metal square wheels",  # 22 Waterfall cave: nature and things
    "broken build built machine", "force pattern quiet soft",
    "arms legs fingers hair eyes", "heart eggs wings dance", "exercise count test farmers teacher", "happy love beautiful laughed smiled",   # 23 Monkey treetops: body and feelings
    "cried surprise wonder hope believe", "felt held kept picked sat",
    "clothes dress store paint", "sign list note mark written", "questions third drawing special great", "place point same most",         # 24 Hidden temple: signs, shops and big words
    "something nothing everyone someone everything", "without against among covered",
    "hours minutes months past ago", "ready finished suddenly passed", "brought stood sure miss close", "care free can’t meet",        # 25 Golden river: time and little words
    "village country trip hole drop", "power beat filled gone pair",
]
FIRST_LESSON = 99
FIRST_UNIT = 21
UNITS = [list(range(FIRST_LESSON + 6 * i, FIRST_LESSON + 6 * i + 6)) for i in range(5)]
SIZES = [5, 4, 5, 5, 5, 4, 5, 5, 5, 5, 4, 4, 5, 4, 5, 5, 5, 5, 4, 5, 5, 4, 5, 4, 5, 4, 5, 4, 5, 5]

SENT = {
    # Vine bridge
    "edge": "The cat is at the edge.", "bottom": "The ball is at the bottom.", "middle": "The cat is in the middle.",
    "outside": "We play outside.", "beside": "The dog is beside me.",
    "cross": "We cross the road.", "rolled": "The ball rolled down the hill.", "pushed": "I pushed the big box.",
    "jumped": "The frog jumped into the pond.",
    "race": "We run a race.", "speed": "The car goes at high speed.", "drive": "Dad can drive the car.", "train": "I see a big train.",
    "sail": "We sail on the sea.",
    "wide": "The road is wide.", "tall": "The tree is tall.", "tiny": "I see a tiny bird.", "length": "I measure the length.",
    "inches": "The stick is ten inches long.",
    "distance": "The house is a long distance away.", "center": "The ball is in the center.", "direction": "Go in this direction.",
    "mile": "We walk one mile.", "end": "This is the end.",
    "north": "We go north.", "south": "The birds go south.", "west": "The sun goes down in the west.", "wall": "The cat is on the wall.",
    # Waterfall cave
    "lake": "We play by the lake.", "stone": "I see a big stone.", "soil": "The seed is in the soil.", "ice": "The ice is cold.",
    "sky": "The kite is in the sky.",
    "moon": "I see the moon.", "forest": "We walk in the forest.", "mountains": "I see big mountains.", "flowers": "I see red flowers.",
    "root": "The tree has a root.",
    "summer": "It is hot in summer.", "winter": "It is cold in winter.", "weather": "The weather is good.", "wild": "The wild cat is big.",
    "bright": "The sun is bright.",
    "gold": "I have a gold ring.", "iron": "The door is made of iron.", "metal": "The bell is made of metal.", "square": "I draw a square.",
    "wheels": "The car has four wheels.",
    "broken": "The box is broken.", "build": "We build a house.", "built": "We built a house.", "machine": "The machine is big.",
    "force": "I pull with all my force.", "pattern": "The hat has a pattern.", "quiet": "It is quiet at night.", "soft": "The cat is soft.",
    # Monkey treetops
    "arms": "I have two arms.", "legs": "I have two legs.", "fingers": "I have ten fingers.", "hair": "I wash my hair.",
    "eyes": "I have two eyes.",
    "heart": "My heart is big.", "eggs": "I see five eggs.", "wings": "The bird has two wings.", "dance": "We dance and sing.",
    "exercise": "We exercise every day.", "count": "I count to ten.", "test": "I have a test.", "farmers": "The farmers work on the farm.",
    "teacher": "My teacher is kind.",
    "happy": "I am happy.", "love": "I love my dog.", "beautiful": "The flower is beautiful.", "laughed": "We laughed at the funny dog.",
    "smiled": "Mom smiled at me.",
    "cried": "The baby cried.", "surprise": "I have a surprise for you.", "wonder": "I wonder what it is.",
    "hope": "I hope it will not rain.", "believe": "I believe you.",
    "felt": "I felt happy.", "held": "I held my dog.", "kept": "I kept the ball.", "picked": "I picked a red flower.",
    "sat": "The cat sat on the bed.",
    # Hidden temple
    "clothes": "I put on my clothes.", "dress": "She has a red dress.", "store": "We go to the store.", "paint": "I paint a tree.",
    "sign": "I see a sign.", "list": "I have a long list.", "note": "I write a note.", "mark": "I make a mark on the paper.",
    "written": "The name is written on the box.",
    "questions": "I have two questions.", "third": "I came in third.", "drawing": "I like my drawing.", "special": "This is a special gift.",
    "great": "That is a great hat.",
    "place": "This is a good place.", "point": "I point at the bird.", "same": "We have the same hat.", "most": "I have the most money.",
    "something": "I see something red.", "nothing": "There is nothing in the box.", "everyone": "Everyone can play.",
    "someone": "Someone is at the door.", "everything": "I like everything here.",
    "without": "I can run without shoes.", "against": "The bed is against the wall.", "among": "The cat is among the ducks.",
    "covered": "The hill is covered with snow.",
    # Golden river
    "hours": "I sleep for ten hours.", "minutes": "I wait ten minutes.", "months": "The snow is here for months.",
    "past": "The bus went past me.", "ago": "I came here a long time ago.",
    "ready": "I am ready.", "finished": "I finished my book.", "suddenly": "Suddenly, the rain began.", "passed": "The dog passed the ball.",
    "brought": "Mom brought me a hat.", "stood": "I stood by the door.", "sure": "I am sure it is red.", "miss": "I miss my dog.",
    "close": "Close the door.",
    "care": "I care for my dog.", "free": "The ride is free.", "can’t": "I can’t see the cat.", "meet": "I meet my friends.",
    "village": "I live in a little village.", "country": "I live in a big country.", "trip": "We go on a trip.", "hole": "The dog is in the hole.",
    "drop": "I will drop the ball.",
    "power": "The big car has power.", "beat": "I can beat the drum.", "filled": "The box is filled with apples.", "gone": "The cat is gone.",
    "pair": "I have a pair of shoes.",
}
# picture nouns the stage-5 sentences use besides the nouns of the earlier stages
EXTRA_NOUNS = {"drum", "shoes"}

UNIT_NAMES = ["Vine bridge", "Waterfall cave", "Monkey treetops", "Hidden temple", "Golden river"]
MAX_WORDS = 7
WORDS5 = [w for l in LESSONS for w in l.split()]


def check():
    problems = []
    words = WORDS5
    if len(words) != 140 or len(set(words)) != 140:
        problems.append(("there must be 140 distinct words", len(words), len(set(words))))
    earlier = set(w.lower() for w in S1.PRE_PRIMER + S1.PRIMER + S2.GRADE1 + S2.GRADE2 + S3.GRADE3 + S3.NOUNS3 + S4.WORDS4)
    if earlier & set(words):
        problems.append(("a stage-5 word is already in stages 1 to 4", sorted(earlier & set(words))))
    sizes = [len(l.split()) for l in LESSONS]
    if sizes != SIZES:
        problems.append(("lesson sizes", sizes))
    flat = [i for u in UNITS for i in u]
    if flat != list(range(FIRST_LESSON, FIRST_LESSON + len(LESSONS))):
        problems.append(("units must list every lesson once, in order", flat))
    allowed = ({w.lower().replace("’", "'") for w in words} | {w.lower() for w in S1.PRE_PRIMER + S1.PRIMER}
               | {w.lower().replace("’", "'") for w in S2.GRADE1 + S2.GRADE2} | {w.lower() for w in S3.GRADE3 + S3.NOUNS3}
               | {w.lower().replace("’", "'") for w in S4.WORDS4} | S1.NOUNS | S2.NOUNS2 | EXTRA_NOUNS)
    for w in words:
        s = SENT.get(w)
        if not s:
            problems.append(("missing sentence", w))
            continue
        toks = [t.lower().replace("’", "'") for t in S1.tokens(s)]
        hits = toks.count(w.lower().replace("’", "'"))
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
    keys = [S1.re.sub(r"[^a-z]", "", w.lower()) for w in words + S1.PRE_PRIMER + S1.PRIMER + S2.GRADE1 + S2.GRADE2 + S3.GRADE3 + S3.NOUNS3 + S4.WORDS4]
    if len(set(keys)) != len(keys):
        problems.append(("two words share an audio file name", sorted(k for k in set(keys) if keys.count(k) > 1)))
    return problems


def main():
    problems = check()
    for p in problems:
        print("PROBLEM:", p)
    if problems:
        print("CHECK FAILED")
        return 1
    print("check ok: 140 words, %d lessons, %d sentences" % (len(LESSONS), len(SENT)))
    if "--check" in sys.argv:
        return 0
    words = WORDS5
    books, freq, inbooks, cover = S1.corpus_stats(words)
    print("books read: %d" % len(books))
    for k, label in (("early", "Kindergarten + Grade 1 books"), ("all", "all books")):
        h, t = cover[k]
        print("the 140 words are %.1f%% of all word tokens in %s (%d of %d)" % (100.0 * h / max(1, t), label, h, t))
    stories = [b for b in books if b["sub"] in ("fiction", "sel")]     # the "read it in a story" link should open a story
    lessons = []
    for i, l in enumerate(LESSONS):
        ws = l.split()
        lessons.append({"id": FIRST_LESSON + i, "stage": 5, "list": "f", "words": ws,
                        "books": S1.best_books(stories, ws, ("Grade 3", "Grade 4"))})
    data = {
        "stage": 5, "name": "Stage 5", "source": "Fry words, part 2",
        "lessons": lessons,
        "units": [{"id": FIRST_UNIT + i, "stage": 5, "lessons": u} for i, u in enumerate(UNITS)],
        "words": {w: {"list": "f", "s": SENT[w], "n": freq[w], "b": inbooks[w]} for w in words},
        "nouns": sorted(EXTRA_NOUNS),
    }
    out = os.path.join(SITE, "sightwords-data5.js")
    with open(out, "w", encoding="utf-8") as f:
        f.write("/* made by tools/sightwords_stage5.py; do not edit by hand */\nwindow.SW_DATA5=" + json.dumps(data, ensure_ascii=True, separators=(",", ":")) + ";\n")
    print("wrote", os.path.relpath(out, REPO), os.path.getsize(out), "bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
