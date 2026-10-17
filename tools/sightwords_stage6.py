#!/usr/bin/env python3
"""Sight words, stage 6 (part 3): 140 more Fry words as 30 short lessons on the deep-sea island.

Same idea as tools/sightwords_stage5.py (it uses the helpers of stages 1 to 5): lessons, one short example sentence per word, a check
that the sentences only use words of the six stages plus a few picture nouns, and a count of how often each word is used in the site's
books (with the best "read it next" book for each lesson). Writes site/sightwords-data6.js, a plain script that sets window.SW_DATA6;
sightwords.js adds it to the data of stages 1 to 5 (lessons 129-158, units 26-30, stage 6 turns "ready").

  python3 tools/sightwords_stage6.py            # check + write site/sightwords-data6.js + print the numbers
  python3 tools/sightwords_stage6.py --check    # only check, write nothing

The words are the next ones of the Fry 1000 Instant Words (the words that Dolch and stages 1 to 5 do not have yet). They are the common
little words that were left over (also, another, even, still, such, might, since...) and the easy things, people, places and describing
words of the seventh to the tenth hundred, chosen for being common and easy to show in a picture.
Left out on purpose (kept for the next islands or never used): names of countries, peoples and God (Europe, Africa, England, French,
Japanese, Greek, British, God...) and the words about grammar and science (noun, verb, vowel, equation, molecules...). The sentences
are written for this site.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sightwords_stage1 as S1  # noqa: E402
import sightwords_stage2 as S2  # noqa: E402
import sightwords_stage3 as S3  # noqa: E402
import sightwords_stage4 as S4  # noqa: E402
import sightwords_stage5 as S5  # noqa: E402

REPO, SITE = S1.REPO, S1.SITE

# lesson ids go on after stage 5 (99-128), unit ids after its units (21-25); a unit is one world of the deep-sea island
LESSONS = [
    "sand coast stream current cloud", "glass rope string tube wire", "pole block board branches seeds", "fruit sugar meat cook corner",   # 26 Pearl reef: sea things and materials
    "swim climbed fell grew", "caught lifted tied spread",
    "mouth nose ears foot skin", "shoulder bones insects cows", "touch hit break blow visit", "wear win save sell send",                   # 27 Kelp forest: body, animals and doing
    "shouted wrote bought arrived", "joined lost agreed expect",
    "engine key shoes radio tools", "truck track bank shop office", "doctor lady woman women uncle", "crowd team wife poem planets",       # 28 Sunken ship: people, places and tools
    "yard park church mall", "dollars cents pay score",
    "loud silent strange afraid exciting", "huge sharp thick thin flat", "rich poor safe famous fine", "fresh cool burning dead bad",      # 29 Whale song: describing words
    "wrong difficult single common", "fair chance level total",
    "also another even still such", "things years being might since", "ever happened himself yourself itself", "instead either quite within already",  # 30 Treasure deep: little words
    "although ahead forward maybe else", "whose cannot able became",
]
FIRST_LESSON = 129
FIRST_UNIT = 26
UNITS = [list(range(FIRST_LESSON + 6 * i, FIRST_LESSON + 6 * i + 6)) for i in range(5)]
SIZES = [5, 5, 5, 5, 4, 4, 5, 4, 5, 5, 4, 4, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 4]

SENT = {
    # Pearl reef
    "sand": "We play in the sand.", "coast": "The boat is near the coast.", "stream": "The fish is in the stream.",
    "current": "The current is strong.", "cloud": "I see a white cloud.",
    "glass": "I drink water from a glass.", "rope": "I pull the rope.", "string": "The kite has a long string.",
    "tube": "Water goes through the tube.", "wire": "The bird is on the wire.",
    "pole": "The flag is on the pole.", "block": "I have one red block.", "board": "I write on the board.",
    "branches": "The tree has many branches.", "seeds": "I plant the seeds.",
    "fruit": "I like fruit.", "sugar": "The cake has sugar.", "meat": "The dog ate the meat.", "cook": "Mom will cook for us.",
    "corner": "The cat is in the corner.",
    "swim": "The fish can swim.", "climbed": "The cat climbed the tree.", "fell": "The ball fell down.", "grew": "The tree grew big.",
    "caught": "I caught the ball.", "lifted": "I lifted the box.", "tied": "I tied my shoes.", "spread": "I spread my arms.",
    # Kelp forest
    "mouth": "Open your mouth.", "nose": "I have a small nose.", "ears": "I have two ears.", "foot": "I hurt my foot.",
    "skin": "The baby has soft skin.",
    "shoulder": "The bird is on my shoulder.", "bones": "The dog has many bones.", "insects": "I see many insects.",
    "cows": "The cows are on the farm.",
    "touch": "I touch the soft cat.", "hit": "I hit the ball.", "break": "I break the stick.", "blow": "I blow bubbles.",
    "visit": "We visit the farm.",
    "wear": "I wear a hat.", "win": "We win the game.", "save": "I save my money.", "sell": "We sell apples.", "send": "I send a letter.",
    "shouted": "I shouted, “Look at me!”", "wrote": "I wrote a note.", "bought": "Mom bought a cake.", "arrived": "The bus arrived.",
    "joined": "The dog joined our game.", "lost": "I lost my hat.", "agreed": "We all agreed.", "expect": "I expect a big gift.",
    # Sunken ship
    "engine": "The car has a big engine.", "key": "I have a key.", "shoes": "I have red shoes.", "radio": "I hear the radio.",
    "tools": "Dad has many tools.",
    "truck": "I see a big truck.", "track": "The train is on the track.", "bank": "I put money in the bank.",
    "shop": "We go to the shop.", "office": "Dad is at the office.",
    "doctor": "I see the doctor.", "lady": "The lady has a big hat.", "woman": "The woman has a bag.", "women": "The women are running.",
    "uncle": "My uncle is tall.",
    "crowd": "I see a big crowd.", "team": "We are a team.", "wife": "I love my wife.", "poem": "I read a poem.",
    "planets": "I see the planets.",
    "yard": "We play in the yard.", "park": "We go to the park.", "church": "I see a church.", "mall": "We go to the mall.",
    "dollars": "The ball is five dollars.", "cents": "The apple is ten cents.", "pay": "I pay for the cake.",
    "score": "We have a high score.",
    # Whale song
    "loud": "The drum is loud.", "silent": "The room is silent.", "strange": "I see a strange fish.", "afraid": "I am afraid of the dark.",
    "exciting": "The game is exciting.",
    "huge": "The bear is huge.", "sharp": "The pencil is sharp.", "thick": "The book is thick.", "thin": "The book is thin.",
    "flat": "The field is flat.",
    "rich": "The king is rich.", "poor": "The poor cat is cold.", "safe": "The cat is safe.", "famous": "He is famous.",
    "fine": "I am fine.",
    "fresh": "The bread is fresh.", "cool": "The water is cool.", "burning": "The fire is burning.", "dead": "The tree is dead.",
    "bad": "The apple is bad.",
    "wrong": "The answer is wrong.", "difficult": "The puzzle is difficult.", "single": "I see a single flower.",
    "common": "Ducks are common here.",
    "fair": "The game is fair.", "chance": "I have a chance to win.", "level": "The water level is high.", "total": "The total is ten.",
    # Treasure deep
    "also": "I like cats and also ducks.", "another": "I want another apple.", "even": "Four is even.", "still": "The cat sat still.",
    "such": "It is such a big hat!",
    "things": "I have many things.", "years": "I am seven years old.", "being": "Being kind is good.", "might": "It might rain.",
    "since": "I have run since morning.",
    "ever": "It is the best day ever.", "happened": "What happened here?", "himself": "He can dress himself.",
    "yourself": "Look at yourself.", "itself": "The cat can wash itself.",
    "instead": "Eat an apple instead of cake.", "either": "Either hat is good.", "quite": "It is quite cold.",
    "within": "The ball is within the circle.", "already": "The cake is already gone.",
    "although": "We go out although it is cold.", "ahead": "The dog is ahead of me.", "forward": "I step forward.",
    "maybe": "Maybe it will rain.", "else": "I want something else.",
    "whose": "Whose hat is this?", "cannot": "I cannot carry this box.", "able": "I am able to jump high.",
    "became": "The egg became a bird.",
}
# picture nouns the stage-6 sentences use besides the nouns of the earlier stages (and "running", the one word that is not in any stage, for "The women are running.")
EXTRA_NOUNS = {"drum", "flag", "pencil", "puzzle", "bubbles", "running"}

UNIT_NAMES = ["Pearl reef", "Kelp forest", "Sunken ship", "Whale song", "Treasure deep"]
MAX_WORDS = 7
WORDS6 = [w for l in LESSONS for w in l.split()]


def check():
    problems = []
    words = WORDS6
    if len(words) != 140 or len(set(words)) != 140:
        problems.append(("there must be 140 distinct words", len(words), len(set(words))))
    earlier = set(w.lower() for w in S1.PRE_PRIMER + S1.PRIMER + S2.GRADE1 + S2.GRADE2 + S3.GRADE3 + S3.NOUNS3 + S4.WORDS4 + S5.WORDS5)
    if earlier & set(words):
        problems.append(("a stage-6 word is already in stages 1 to 5", sorted(earlier & set(words))))
    sizes = [len(l.split()) for l in LESSONS]
    if sizes != SIZES:
        problems.append(("lesson sizes", sizes))
    flat = [i for u in UNITS for i in u]
    if flat != list(range(FIRST_LESSON, FIRST_LESSON + len(LESSONS))):
        problems.append(("units must list every lesson once, in order", flat))
    allowed = ({w.lower().replace("’", "'") for w in words} | {w.lower() for w in S1.PRE_PRIMER + S1.PRIMER}
               | {w.lower().replace("’", "'") for w in S2.GRADE1 + S2.GRADE2} | {w.lower() for w in S3.GRADE3 + S3.NOUNS3}
               | {w.lower().replace("’", "'") for w in S4.WORDS4 + S5.WORDS5} | S1.NOUNS | S2.NOUNS2 | S5.EXTRA_NOUNS | EXTRA_NOUNS)
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
    keys = [S1.re.sub(r"[^a-z]", "", w.lower()) for w in words + S1.PRE_PRIMER + S1.PRIMER + S2.GRADE1 + S2.GRADE2 + S3.GRADE3 + S3.NOUNS3 + S4.WORDS4 + S5.WORDS5]
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
    words = WORDS6
    books, freq, inbooks, cover = S1.corpus_stats(words)
    print("books read: %d" % len(books))
    for k, label in (("early", "Kindergarten + Grade 1 books"), ("all", "all books")):
        h, t = cover[k]
        print("the 140 words are %.1f%% of all word tokens in %s (%d of %d)" % (100.0 * h / max(1, t), label, h, t))
    stories = [b for b in books if b["sub"] in ("fiction", "sel")]     # the "read it in a story" link should open a story
    lessons = []
    for i, l in enumerate(LESSONS):
        ws = l.split()
        lessons.append({"id": FIRST_LESSON + i, "stage": 6, "list": "f", "words": ws,
                        "books": S1.best_books(stories, ws, ("Grade 3", "Grade 4"))})
    data = {
        "stage": 6, "name": "Stage 6", "source": "Fry words, part 3",
        "lessons": lessons,
        "units": [{"id": FIRST_UNIT + i, "stage": 6, "lessons": u} for i, u in enumerate(UNITS)],
        "words": {w: {"list": "f", "s": SENT[w], "n": freq[w], "b": inbooks[w]} for w in words},
        "nouns": sorted(EXTRA_NOUNS),
    }
    out = os.path.join(SITE, "sightwords-data6.js")
    with open(out, "w", encoding="utf-8") as f:
        f.write("/* made by tools/sightwords_stage6.py; do not edit by hand */\nwindow.SW_DATA6=" + json.dumps(data, ensure_ascii=True, separators=(",", ":")) + ";\n")
    print("wrote", os.path.relpath(out, REPO), os.path.getsize(out), "bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
