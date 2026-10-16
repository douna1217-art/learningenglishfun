#!/usr/bin/env python3
"""Sight words, stage 3: the Dolch grade 3 words (41) and 95 common nouns as 30 short lessons in the castle kingdom.

Same idea as tools/sightwords_stage2.py (it uses the helpers of stage 1): lessons, one short example sentence per word, a check that the
sentences only use words of the three stages plus a few picture nouns, and a count of how often each word is used in the site's books
(with the best "read it next" book for each lesson). Writes site/sightwords-data3.js, a plain script that sets window.SW_DATA3;
sightwords.js adds it to the data of stages 1 and 2 (lessons 39-68, units 11-15, stage 3 turns "ready").

  python3 tools/sightwords_stage3.py            # check + write site/sightwords-data3.js + print the numbers
  python3 tools/sightwords_stage3.py --check    # only check, write nothing

The 41 grade 3 words and the 95 nouns are the standard Dolch lists, except that "Santa Claus" (two words) is replaced by "castle",
which suits the island. The sentences are written for this site.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sightwords_stage1 as S1  # noqa: E402
import sightwords_stage2 as S2  # noqa: E402

REPO, SITE = S1.REPO, S1.SITE

GRADE3 = ("about better bring carry clean cut done draw drink eight fall far full got grow hold hot hurt if keep kind laugh light long "
          "much myself never only own pick seven shall show six small start ten today together try warm").split()
NOUNS3 = ("apple baby back ball bear bed bell bird birthday boat box boy bread brother cake car castle cat chair chicken children christmas "
          "coat corn cow day dog doll door duck egg eye farm farmer father feet fire fish floor flower game garden girl goodbye grass ground "
          "hand head hill home horse house kitty leg letter man men milk money morning mother name nest night paper party picture pig rabbit "
          "rain ring robin school seed sheep shoe sister snow song squirrel stick street sun table thing time top toy tree watch water way "
          "wind window wood").split()

# lesson ids go on after stage 2 (19-38), unit ids after its units (6-10); a unit is one world of the castle kingdom
LESSONS = [
    "farm farmer cow pig sheep", "horse chicken corn grass seed", "egg milk bread apple drink", "garden flower grow pick got",     # 11 Village green: farm life
    "house home door window", "floor bring carry keep",
    "street car boat way bell", "school letter paper picture", "name goodbye man men", "boy girl children baby",                 # 12 Castle gate: town and people
    "mother father brother sister", "head hand leg feet",
    "fire hill ground stick wood", "rain snow wind sun water", "morning night day time today", "hot warm light far long",         # 13 Dragon hill: weather and time
    "fall hurt clean start try", "thing done never only own",
    "tree nest bird robin squirrel", "rabbit bear cat dog kitty", "fish duck eye back", "small full much better",                 # 14 Royal garden: animals and kind words
    "kind laugh show draw cut", "hold myself together about",
    "castle table chair bed box", "party birthday cake christmas", "game song doll toy top", "ball ring money watch",              # 15 Throne hall: parties, toys, numbers
    "coat shoe eight seven", "six ten shall if",
]
FIRST_LESSON = 39
FIRST_UNIT = 11
UNITS = [list(range(FIRST_LESSON + 6 * i, FIRST_LESSON + 6 * i + 6)) for i in range(5)]

SENT = {
    # Village green
    "farm": "We play on the farm.", "farmer": "The farmer has a big hat.", "cow": "I see a big cow.", "pig": "The pig can run.",
    "sheep": "I see a white sheep.",
    "horse": "I can ride a horse.", "chicken": "I see a little chicken.", "corn": "We eat corn.", "grass": "The dog is on the grass.",
    "seed": "The bird can eat a seed.",
    "egg": "I eat an egg.", "milk": "I like milk.", "bread": "Mom can make bread.", "apple": "I have a red apple.",
    "drink": "The dog can drink.",
    "garden": "We play in the garden.", "flower": "I see a red flower.", "grow": "The tree will grow.", "pick": "I can pick the red ball.",
    "got": "I got a new hat.",
    "house": "I see a red house.", "home": "Mom is at home.", "door": "Open the door.", "window": "I look out the window.",
    "floor": "The cat is on the floor.", "bring": "Bring me the ball.", "carry": "I can carry the bag.", "keep": "I will keep the ball.",
    # Castle gate
    "street": "The bus is on the street.", "car": "We ride in a car.", "boat": "We ride in a boat.", "way": "Go this way.",
    "bell": "I see a big bell.",
    "school": "I go to school.", "letter": "I write a letter.", "paper": "I write on paper.", "picture": "Look at the picture.",
    "name": "My name is Sam.", "goodbye": "Say goodbye to Mom.", "man": "The man has a hat.", "men": "I see two men.",
    "boy": "The boy has a red hat.", "girl": "The girl can sing.", "children": "The children can play.", "baby": "The baby is in the bed.",
    "mother": "This is my mother.", "father": "My father is big.", "brother": "My brother can jump.", "sister": "My sister can sing.",
    "head": "I have a hat on my head.", "hand": "Give me your hand.", "leg": "The duck is on one leg.", "feet": "I wash my feet.",
    # Dragon hill
    "fire": "I see a big fire.", "hill": "I run up the hill.", "ground": "The ball is on the ground.", "stick": "The dog has a big stick.",
    "wood": "The box is made of wood.",
    "rain": "I use an umbrella in the rain.", "snow": "We play in the snow.", "wind": "The kite is up in the wind.",
    "sun": "The sun is big and red.", "water": "The fish is in the water.",
    "morning": "Good morning, Mom.", "night": "I sleep at night.", "day": "I play all day.", "time": "It is time to eat.",
    "today": "We go to school today.",
    "hot": "I am hot.", "warm": "I am warm in my bed.", "light": "I see the light.", "far": "The house is far away.",
    "long": "The bus is long.",
    "fall": "The ball will fall down.", "hurt": "I hurt my hand.", "clean": "The white cat is clean.", "start": "Let us start.",
    "try": "I will try again.",
    "thing": "What is this thing?", "done": "I am done.", "never": "I will never go away.", "only": "I have only one hat.",
    "own": "I have my own bed.",
    # Royal garden
    "tree": "The bird is in the tree.", "nest": "I see a nest in the tree.", "bird": "The bird can sing.", "robin": "The robin can fly.",
    "squirrel": "The squirrel is in the tree.",
    "rabbit": "The rabbit can jump.", "bear": "The bear is big and brown.", "cat": "The cat is on my bed.", "dog": "The dog has a ball.",
    "kitty": "I see a little kitty.",
    "fish": "I see a fish in the pond.", "duck": "The duck is in the pond.", "eye": "Look at my eye.", "back": "I will be back soon.",
    "small": "I see a small bird.", "full": "The box is full.", "much": "I like it very much.", "better": "I am better now.",
    "kind": "You are kind.", "laugh": "We laugh and play.", "show": "I show you my hat.", "draw": "I draw a cat.", "cut": "I cut the cake.",
    "hold": "I hold my cat.", "myself": "I did it myself.", "together": "We play together.", "about": "I read about a frog.",
    # Throne hall
    "castle": "The castle is on the hill.", "table": "The cake is on the table.", "chair": "I sit on the chair.", "bed": "I have a big bed.",
    "box": "What is in the box?",
    "party": "We have a party.", "birthday": "It is my birthday.", "cake": "I made a cake.", "christmas": "I like Christmas.",
    "game": "We play a game.", "song": "We sing a song.", "doll": "I have a new doll.", "toy": "I see a red toy.",
    "top": "The top is on the box.",
    "ball": "The dog got the ball.", "ring": "I have a new ring.", "money": "I have money for a hat.", "watch": "I look at my watch.",
    "coat": "I have a warm coat.", "shoe": "I see a red shoe.", "eight": "I see eight birds.", "seven": "I see seven ducks.",
    "six": "I see six cats.", "ten": "I see ten fish.", "shall": "Shall we play?", "if": "I will help if you ask.",
}
# picture nouns the stage-3 sentences use besides the nouns of the earlier stages
EXTRA_NOUNS = set()

UNIT_NAMES = ["Village green", "Castle gate", "Dragon hill", "Royal garden", "Throne hall"]
MAX_WORDS = 7
SIZES = [5, 5, 5, 5, 4, 4, 5, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 5, 4, 5, 4, 5, 4, 4, 4]


def check():
    words = GRADE3 + NOUNS3
    problems = []
    if len(GRADE3) != 41 or len(set(GRADE3)) != 41:
        problems.append(("grade 3 must be 41 distinct words", len(GRADE3), len(set(GRADE3))))
    if len(NOUNS3) != 95 or len(set(NOUNS3)) != 95:
        problems.append(("there must be 95 distinct nouns", len(NOUNS3), len(set(NOUNS3))))
    if set(GRADE3) & set(NOUNS3):
        problems.append(("lists overlap", sorted(set(GRADE3) & set(NOUNS3))))
    earlier = set(w.lower() for w in S1.PRE_PRIMER + S1.PRIMER + S2.GRADE1 + S2.GRADE2)
    if earlier & set(words):
        problems.append(("a stage-3 word is already in stage 1 or 2", sorted(earlier & set(words))))
    lw = [w for l in LESSONS for w in l.split()]
    if sorted(lw) != sorted(words):
        problems.append(("lessons do not cover the 136 words exactly once",
                         sorted(set(words) - set(lw)), sorted(set(lw) - set(words)), [w for w in set(lw) if lw.count(w) > 1]))
    sizes = [len(l.split()) for l in LESSONS]
    if sizes != SIZES:
        problems.append(("lesson sizes", sizes))
    flat = [i for u in UNITS for i in u]
    if flat != list(range(FIRST_LESSON, FIRST_LESSON + len(LESSONS))):
        problems.append(("units must list every lesson once, in order", flat))
    allowed = ({w.lower().replace("’", "'") for w in words} | {w.lower() for w in S1.PRE_PRIMER + S1.PRIMER}
               | {w.lower().replace("’", "'") for w in S2.GRADE1 + S2.GRADE2} | S1.NOUNS | S2.NOUNS2 | EXTRA_NOUNS)
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
    # no two words (of any stage) share an audio file name
    keys = [S1.re.sub(r"[^a-z]", "", w.lower()) for w in words + S1.PRE_PRIMER + S1.PRIMER + S2.GRADE1 + S2.GRADE2]
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
    print("check ok: 41 + 95 words, %d lessons, %d sentences" % (len(LESSONS), len(SENT)))
    if "--check" in sys.argv:
        return 0
    words = GRADE3 + NOUNS3
    books, freq, inbooks, cover = S1.corpus_stats(words)
    print("books read: %d" % len(books))
    for k, label in (("early", "Kindergarten + Grade 1 books"), ("all", "all books")):
        h, t = cover[k]
        print("the 136 words are %.1f%% of all word tokens in %s (%d of %d)" % (100.0 * h / max(1, t), label, h, t))
    rare = sorted(words, key=lambda w: freq[w])[:10]
    print("least used in our books:", ", ".join("%s=%d" % (w, freq[w]) for w in rare))
    stories = [b for b in books if b["sub"] in ("fiction", "sel")]     # the "read it in a story" link should open a story
    lessons = []
    for i, l in enumerate(LESSONS):
        ws = l.split()
        kinds = set("g3" if w in GRADE3 else "n" for w in ws)
        lessons.append({"id": FIRST_LESSON + i, "stage": 3, "list": kinds.pop() if len(kinds) == 1 else "mix", "words": ws,
                        "books": S1.best_books(stories, ws, ("Grade 2", "Grade 3"))})
    data = {
        "stage": 3, "name": "Stage 3", "source": "Dolch grade 3 and the Dolch nouns",
        "lessons": lessons,
        "units": [{"id": FIRST_UNIT + i, "stage": 3, "lessons": u} for i, u in enumerate(UNITS)],
        "words": {w: {"list": "g3" if w in GRADE3 else "n", "s": SENT[w], "n": freq[w], "b": inbooks[w]} for w in words},
        "nouns": sorted(EXTRA_NOUNS),
    }
    out = os.path.join(SITE, "sightwords-data3.js")
    with open(out, "w", encoding="utf-8") as f:
        f.write("/* made by tools/sightwords_stage3.py; do not edit by hand */\nwindow.SW_DATA3=" + json.dumps(data, ensure_ascii=True, separators=(",", ":")) + ";\n")
    print("wrote", os.path.relpath(out, REPO), os.path.getsize(out), "bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
