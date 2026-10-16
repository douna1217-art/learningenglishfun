#!/usr/bin/env python3
"""Sight words, stage 4 (part 1): 140 of the most common Fry words as 30 short lessons on the space island.

Same idea as tools/sightwords_stage3.py (it uses the helpers of stages 1 to 3): lessons, one short example sentence per word, a check
that the sentences only use words of the four stages plus a few picture nouns, and a count of how often each word is used in the site's
books (with the best "read it next" book for each lesson). Writes site/sightwords-data4.js, a plain script that sets window.SW_DATA4;
sightwords.js adds it to the data of stages 1 to 3 (lessons 69-98, units 16-20, stage 4 turns "ready").

  python3 tools/sightwords_stage4.py            # check + write site/sightwords-data4.js + print the numbers
  python3 tools/sightwords_stage4.py --check    # only check, write nothing

The words come from the second to the fifth hundred of the Fry 1000 Instant Words (the words that Dolch does not already have),
chosen for being common and easy to show in a picture; the rest of the Fry list (about 560 words) can become more islands later.
The sentences are written for this site.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sightwords_stage1 as S1  # noqa: E402
import sightwords_stage2 as S2  # noqa: E402
import sightwords_stage3 as S3  # noqa: E402

REPO, SITE = S1.REPO, S1.SITE

# lesson ids go on after stage 3 (39-68), unit ids after its units (11-15); a unit is one world of the space island
LESSONS = [
    "ship space plane road map", "travel step move turn follow", "across along through toward", "behind front inside near",           # 16 Launch pad: places and ways to go
    "next between above below high", "low left side last second",
    "air land earth sea ocean", "island river field city town", "building room class rock", "plant animal stars waves",              # 17 Moon walk: the world
    "heat dark deep dry clear", "heavy strong large short different",
    "early late during until while", "often sometimes usually slowly quickly", "finally almost few enough", "half hundred less several",  # 18 Comet trail: when and how much
    "whole piece week size shape", "group circle wait rest stay",
    "book story page line music", "sound voice listen hear", "family friends king person", "face body color food life",             # 19 Ringed planet: people, sounds and stories
    "idea problem answer learn study", "spell talk understand remember notice",
    "add begin began change leave", "need feel check measure complete", "become seem plan reached pulled",                           # 20 Alien base: doing and thinking
    "stand took thought knew told", "heard hard easy important", "young true real world",
]
FIRST_LESSON = 69
FIRST_UNIT = 16
UNITS = [list(range(FIRST_LESSON + 6 * i, FIRST_LESSON + 6 * i + 6)) for i in range(5)]
SIZES = [5, 5, 4, 4, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 4, 4, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5, 4, 4]

SENT = {
    # Launch pad
    "ship": "We ride in a big ship.", "space": "The ship is in space.", "plane": "The plane can fly.", "road": "The car is on the road.",
    "map": "I look at the map.",
    "travel": "We travel by boat.", "step": "I take a big step.", "move": "The cat will not move.", "turn": "Turn at the red house.",
    "follow": "The ducks follow the big duck.",
    "across": "The cat ran across the road.", "along": "We walk along the road.", "through": "The dog ran through the door.",
    "toward": "The dog ran toward me.",
    "behind": "The cat is behind the box.", "front": "The dog is in front of me.", "inside": "The cat is inside the box.",
    "near": "The bird is near the tree.",
    "next": "The dog is next to the cat.", "between": "The ball is between two cats.", "above": "The bird is above the tree.",
    "below": "The fish is below the boat.", "high": "The kite is up high.",
    "low": "The sun is low.", "left": "The cat is on the left.", "side": "The dog is at my side.", "last": "The duck came in last.",
    "second": "The cat came in second.",
    # Moon walk
    "air": "The kite is in the air.", "land": "The bird will land.", "earth": "We live on the earth.", "sea": "I see a ship at sea.",
    "ocean": "The fish is in the ocean.",
    "island": "I see an island.", "river": "The boat is on the river.", "field": "We play in the field.", "city": "I live in a big city.",
    "town": "I live in a little town.",
    "building": "I see a big building.", "room": "I sleep in my room.", "class": "We read in class.", "rock": "The frog is on the rock.",
    "plant": "I see a little plant.", "animal": "The dog is an animal.", "stars": "I see five stars.", "waves": "I see big waves.",
    "heat": "I feel the heat.", "dark": "It is dark at night.", "deep": "The pond is deep.", "dry": "The rock is dry.",
    "clear": "The water is clear.",
    "heavy": "The box is heavy.", "strong": "The man is strong.", "large": "I see a large ship.", "short": "The stick is short.",
    "different": "The hats are different.",
    # Comet trail
    "early": "I get up early.", "late": "The bus is late.", "during": "We play during the day.", "until": "I run until I am hot.",
    "while": "I sing while I walk.",
    "often": "I often play with my dog.", "sometimes": "Sometimes I eat cake.", "usually": "I usually eat at home.",
    "slowly": "The cat can walk slowly.", "quickly": "The dog can run quickly.",
    "finally": "Finally, we are home.", "almost": "I am almost done.", "few": "I see a few birds.", "enough": "I have enough money.",
    "half": "I eat half of the cake.", "hundred": "I see one hundred ducks.", "less": "I have less money.", "several": "I see several birds.",
    "whole": "I eat the whole cake.", "piece": "I want a piece of cake.", "week": "We read a book every week.",
    "size": "My hat is the right size.", "shape": "The ball has a round shape.",
    "group": "I see a group of ducks.", "circle": "I draw a circle.", "wait": "Please wait for me.", "rest": "I rest in my bed.",
    "stay": "Stay here with me.",
    # Ringed planet
    "book": "I read a book.", "story": "Mom can read a story.", "page": "Turn the page.", "line": "I draw a line.", "music": "I like the music.",
    "sound": "I hear a sound.", "voice": "I like her voice.", "listen": "Listen to the bird.", "hear": "I hear a bird.",
    "family": "This is my family.", "friends": "I play with my friends.", "king": "The king has a hat.", "person": "I see one person.",
    "face": "I wash my face.", "body": "My body is warm.", "color": "What color is it?", "food": "I eat good food.", "life": "I like my life.",
    "idea": "I have an idea.", "problem": "I have a problem.", "answer": "I know the answer.", "learn": "I learn to read.",
    "study": "I study at school.",
    "spell": "I can spell my name.", "talk": "I talk to Mom.", "understand": "I understand the story.", "remember": "I remember my name.",
    "notice": "Did you notice the bird?",
    # Alien base
    "add": "I add two and two.", "begin": "Let us begin.", "began": "The rain began.", "change": "I change my hat.", "leave": "We leave school.",
    "need": "I need my hat.", "feel": "I feel good.", "check": "I check my bag.", "measure": "I measure the box.",
    "complete": "I complete the book.",
    "become": "The seed will become a tree.", "seem": "You seem hot.", "plan": "We have a plan.", "reached": "I reached the top.",
    "pulled": "I pulled the box.",
    "stand": "I stand by the door.", "took": "I took a gift.", "thought": "I thought about my dog.", "knew": "I knew the answer.",
    "told": "Mom told me a story.",
    "heard": "I heard a bird.", "hard": "The rock is hard.", "easy": "The game is easy.", "important": "Mom is important to me.",
    "young": "The cat is young.", "true": "The story is true.", "real": "This is a real cat.", "world": "I see the world.",
}
# picture nouns the stage-4 sentences use besides the nouns of the earlier stages
EXTRA_NOUNS = set()

UNIT_NAMES = ["Launch pad", "Moon walk", "Comet trail", "Ringed planet", "Alien base"]
MAX_WORDS = 7
WORDS4 = [w for l in LESSONS for w in l.split()]


def check():
    problems = []
    words = WORDS4
    if len(words) != 140 or len(set(words)) != 140:
        problems.append(("there must be 140 distinct words", len(words), len(set(words))))
    earlier = set(w.lower() for w in S1.PRE_PRIMER + S1.PRIMER + S2.GRADE1 + S2.GRADE2 + S3.GRADE3 + S3.NOUNS3)
    if earlier & set(words):
        problems.append(("a stage-4 word is already in stages 1 to 3", sorted(earlier & set(words))))
    sizes = [len(l.split()) for l in LESSONS]
    if sizes != SIZES:
        problems.append(("lesson sizes", sizes))
    flat = [i for u in UNITS for i in u]
    if flat != list(range(FIRST_LESSON, FIRST_LESSON + len(LESSONS))):
        problems.append(("units must list every lesson once, in order", flat))
    allowed = ({w.lower().replace("’", "'") for w in words} | {w.lower() for w in S1.PRE_PRIMER + S1.PRIMER}
               | {w.lower().replace("’", "'") for w in S2.GRADE1 + S2.GRADE2} | {w.lower() for w in S3.GRADE3 + S3.NOUNS3}
               | S1.NOUNS | S2.NOUNS2 | EXTRA_NOUNS)
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
    keys = [S1.re.sub(r"[^a-z]", "", w.lower()) for w in words + S1.PRE_PRIMER + S1.PRIMER + S2.GRADE1 + S2.GRADE2 + S3.GRADE3 + S3.NOUNS3]
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
    words = WORDS4
    books, freq, inbooks, cover = S1.corpus_stats(words)
    print("books read: %d" % len(books))
    for k, label in (("early", "Kindergarten + Grade 1 books"), ("all", "all books")):
        h, t = cover[k]
        print("the 140 words are %.1f%% of all word tokens in %s (%d of %d)" % (100.0 * h / max(1, t), label, h, t))
    stories = [b for b in books if b["sub"] in ("fiction", "sel")]     # the "read it in a story" link should open a story
    lessons = []
    for i, l in enumerate(LESSONS):
        ws = l.split()
        lessons.append({"id": FIRST_LESSON + i, "stage": 4, "list": "f", "words": ws,
                        "books": S1.best_books(stories, ws, ("Grade 3", "Grade 4"))})
    data = {
        "stage": 4, "name": "Stage 4", "source": "Fry words, part 1",
        "lessons": lessons,
        "units": [{"id": FIRST_UNIT + i, "stage": 4, "lessons": u} for i, u in enumerate(UNITS)],
        "words": {w: {"list": "f", "s": SENT[w], "n": freq[w], "b": inbooks[w]} for w in words},
        "nouns": sorted(EXTRA_NOUNS),
    }
    out = os.path.join(SITE, "sightwords-data4.js")
    with open(out, "w", encoding="utf-8") as f:
        f.write("/* made by tools/sightwords_stage4.py; do not edit by hand */\nwindow.SW_DATA4=" + json.dumps(data, ensure_ascii=True, separators=(",", ":")) + ";\n")
    print("wrote", os.path.relpath(out, REPO), os.path.getsize(out), "bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
