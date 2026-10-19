#!/usr/bin/env python3
"""Sight words, stage 8 (part 5): 140 more Fry words as 30 short lessons on the polar island.

Same idea as tools/sightwords_stage8.py (it uses the helpers of stages 1 to 7): lessons, one short example sentence per word, a check
that the sentences only use words of the eight stages plus a few picture nouns, and a count of how often each word is used in the site's
books (with the best "read it next" book for each lesson). Writes site/sightwords-data8.js, a plain script that sets window.SW_DATA8;
sightwords.js adds it to the data of stages 1 to 7 (lessons 189-218, units 36-40, stage 8 turns "ready").

  python3 tools/sightwords_stage8.py            # check + write site/sightwords-data8.js + print the numbers
  python3 tools/sightwords_stage8.py --check    # only check, write nothing

The words are the last ones of the Fry 1000 Instant Words (the words that Dolch and stages 1 to 7 do not have yet): what was left of the sixth to the tenth
hundred, chosen for being common and easy to show in a picture. Left out on purpose: words about fighting and hurting (gun, kill, die, fight, soldier, blood),
and the names of countries and peoples. This is the last island: with it the Fry list is used up. The sentences are written for this site.
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
import sightwords_stage6 as S6  # noqa: E402
import sightwords_stage7 as S7  # noqa: E402

REPO, SITE = S1.REPO, S1.SITE

# lesson ids go on after stage 7 (159-188), unit ids after its units (31-35); a unit is one world of the polar island
LESSONS = [
    "wave planet oil salt bone", "wing bat rail clock tie", "hat suit finger ear arm", "instrument dollar cent print camp", "supply material property noon", "month nine twenty century",
    "neighbor chief colony human character", "region continent capital nation subject", "history period age position general", "law term symbol atom", "temperature industry electric modern", "value experiment method process result",
    "climb catch push lift throw", "gather stretch roll burn mix", "shout join enter search hunt", "collect settle receive mount", "finish arrange invent operate", "select prepare repeat allow",
    "grand gentle natural broad gray", "lone joy excite smile sudden", "noise sight sense tone shine", "fear danger anger necessary particular", "exact major probable vary", "prove represent indicate locate",
    "continue suggest agree provide imagine", "include divide depend rub hurry", "determine require consider reason event", "success effect perhaps rather whether", "thus claim spoke broke clothe", "lie organ protect raise",
]
FIRST_LESSON = 189
FIRST_UNIT = 36
UNITS = [list(range(FIRST_LESSON + 6 * i, FIRST_LESSON + 6 * i + 6)) for i in range(5)]
SIZES = [5, 5, 5, 5, 4, 4, 5, 5, 5, 4, 4, 5, 5, 5, 5, 4, 4, 4, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 4]

SENT = {
    "wave": "I wave to the ship.", "planet": "The planet is big.", "oil": "I need oil for the car.", "salt": "I put salt on the egg.", "bone": "The dog has a bone.",
    "wing": "The bird has one big wing.", "bat": "I hit the ball with a bat.", "rail": "The train is on the rail.", "clock": "The clock is on the wall.", "tie": "Dad has a red tie.",
    "hat": "I wear a red hat.", "suit": "He has a blue suit.", "finger": "I hurt my finger.", "ear": "I hear with my ear.", "arm": "I hurt my arm.",
    "instrument": "I play an instrument.", "dollar": "The toy is one dollar.", "cent": "The apple is one cent.", "print": "Please print this page.", "camp": "We camp near the lake.",
    "supply": "We need a supply of food.", "material": "This is a soft material.", "property": "The house is on my property.", "noon": "We eat at noon.",
    "month": "May is a month.", "nine": "I have nine cats.", "twenty": "We have twenty cats.", "century": "A century is a hundred years.",
    "neighbor": "My neighbor has a dog.", "chief": "The chief has a big hat.", "colony": "The colony is by the sea.", "human": "I am a human.", "character": "She is a character in the story.",
    "region": "This region is cold.", "continent": "A continent is very big.", "capital": "The capital is a big city.", "nation": "Our nation has a flag.", "subject": "Art is my best subject.",
    "history": "I read a history book.", "period": "Put a period at the end.", "age": "What is your age?", "position": "The dog is in a good position.", "general": "I know the general idea.",
    "law": "We follow the law.", "term": "This is a new term.", "symbol": "A heart is a symbol of love.", "atom": "An atom is very small.",
    "temperature": "The temperature is low.", "industry": "Many men work in industry.", "electric": "The car is electric.", "modern": "This is a modern house.",
    "value": "Gold has a high value.", "experiment": "We do an experiment.", "method": "This is a good method.", "process": "We follow the process.", "result": "The result is good.",
    "climb": "We climb the hill.", "catch": "I catch the ball.", "push": "I push the box.", "lift": "I lift the box.", "throw": "I throw the ball.",
    "gather": "We gather by the fire.", "stretch": "I stretch my arms.", "roll": "The ball can roll.", "burn": "Fire will burn the wood.", "mix": "I mix the paint.",
    "shout": "I shout to my dog.", "join": "Please join our game.", "enter": "We enter the room.", "search": "I search for my hat.", "hunt": "The cat will hunt a bird.",
    "collect": "I collect a rock.", "settle": "The birds settle in the tree.", "receive": "I receive a letter.", "mount": "I mount the horse.",
    "finish": "I finish my book.", "arrange": "I arrange the flowers.", "invent": "I want to invent a robot.", "operate": "The doctor will operate.",
    "select": "Select a red hat.", "prepare": "We prepare the food.", "repeat": "Please repeat it.", "allow": "Mom will allow me to play.",
    "grand": "The castle is grand.", "gentle": "The cat is gentle.", "natural": "A tree is a natural thing.", "broad": "The river is broad.", "gray": "The cat is gray.",
    "lone": "A lone bird is in the sky.", "joy": "She cried for joy.", "excite": "The game will excite me.", "smile": "I smile at my mom.", "sudden": "A sudden rain fell.",
    "noise": "I hear a loud noise.", "sight": "The sea is a pretty sight.", "sense": "Smell is a sense.", "tone": "Use a soft tone.", "shine": "The sun will shine.",
    "fear": "I have no fear.", "danger": "A red sign means danger.", "anger": "I feel anger.", "necessary": "Water is necessary.", "particular": "I want this particular hat.",
    "exact": "I need the exact time.", "major": "This is a major road.", "probable": "Rain is probable today.", "vary": "The hats vary in color.",
    "prove": "I can prove it.", "represent": "A flag can represent a team.", "indicate": "The sign will indicate the way.", "locate": "I locate the city on the map.",
    "continue": "We continue to walk.", "suggest": "I suggest a game.", "agree": "We all agree.", "provide": "The farm will provide food.", "imagine": "I imagine a big castle.",
    "include": "The box will include a toy.", "divide": "I divide the apples.", "depend": "I depend on my mom.", "rub": "I rub my hands.", "hurry": "We must hurry.",
    "determine": "I will determine the weight.", "require": "A plant will require water.", "consider": "I consider the plan.", "reason": "I have a good reason.", "event": "The party is a big event.",
    "success": "The team had great success.", "effect": "Rain has an effect on the plant.", "perhaps": "Perhaps it will rain.", "rather": "I would rather play.", "whether": "Ask whether it is hot.",
    "thus": "He ran fast, thus he was first.", "claim": "I claim this seat.", "spoke": "Mom spoke to me.", "broke": "The glass broke.", "clothe": "Mom will clothe the baby.",
    "lie": "I lie on the bed.", "organ": "I play the organ.", "protect": "A hat will protect me.", "raise": "We raise the flag.",
}
# picture nouns the stage-8 sentences use besides the nouns of the earlier stages
EXTRA_NOUNS = {"flag"}

UNIT_NAMES = ["Snow hills", "Igloo village", "Frozen lake", "Northern lights", "Penguin cove"]
MAX_WORDS = 7
WORDS8 = [w for l in LESSONS for w in l.split()]


def check():
    problems = []
    words = WORDS8
    if len(words) != 140 or len(set(words)) != 140:
        problems.append(("there must be 140 distinct words", len(words), len(set(words))))
    earlier = set(w.lower() for w in S1.PRE_PRIMER + S1.PRIMER + S2.GRADE1 + S2.GRADE2 + S3.GRADE3 + S3.NOUNS3 + S4.WORDS4 + S5.WORDS5 + S6.WORDS6 + S7.WORDS7)
    if earlier & set(words):
        problems.append(("a stage-8 word is already in stages 1 to 7", sorted(earlier & set(words))))
    sizes = [len(l.split()) for l in LESSONS]
    if sizes != SIZES:
        problems.append(("lesson sizes", sizes))
    flat = [i for u in UNITS for i in u]
    if flat != list(range(FIRST_LESSON, FIRST_LESSON + len(LESSONS))):
        problems.append(("units must list every lesson once, in order", flat))
    allowed = ({w.lower().replace("’", "'") for w in words} | {w.lower() for w in S1.PRE_PRIMER + S1.PRIMER}
               | {w.lower().replace("’", "'") for w in S2.GRADE1 + S2.GRADE2} | {w.lower() for w in S3.GRADE3 + S3.NOUNS3}
               | {w.lower().replace("’", "'") for w in S4.WORDS4 + S5.WORDS5 + S6.WORDS6 + S7.WORDS7} | S1.NOUNS | S2.NOUNS2 | S5.EXTRA_NOUNS | S6.EXTRA_NOUNS | S7.EXTRA_NOUNS | EXTRA_NOUNS)
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
    keys = [S1.re.sub(r"[^a-z]", "", w.lower()) for w in words + S1.PRE_PRIMER + S1.PRIMER + S2.GRADE1 + S2.GRADE2 + S3.GRADE3 + S3.NOUNS3 + S4.WORDS4 + S5.WORDS5 + S6.WORDS6 + S7.WORDS7]
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
    words = WORDS8
    books, freq, inbooks, cover = S1.corpus_stats(words)
    print("books read: %d" % len(books))
    for k, label in (("early", "Kindergarten + Grade 1 books"), ("all", "all books")):
        h, t = cover[k]
        print("the 140 words are %.1f%% of all word tokens in %s (%d of %d)" % (100.0 * h / max(1, t), label, h, t))
    stories = [b for b in books if b["sub"] in ("fiction", "sel")]     # the "read it in a story" link should open a story
    lessons = []
    for i, l in enumerate(LESSONS):
        ws = l.split()
        lessons.append({"id": FIRST_LESSON + i, "stage": 8, "list": "f", "words": ws,
                        "books": S1.best_books(stories, ws, ("Grade 5", "Grade 6"))})
    data = {
        "stage": 8, "name": "Stage 8", "source": "Fry words, part 5",
        "lessons": lessons,
        "units": [{"id": FIRST_UNIT + i, "stage": 8, "lessons": u} for i, u in enumerate(UNITS)],
        "words": {w: {"list": "f", "s": SENT[w], "n": freq[w], "b": inbooks[w]} for w in words},
        "nouns": sorted(EXTRA_NOUNS),
    }
    out = os.path.join(SITE, "sightwords-data8.js")
    with open(out, "w", encoding="utf-8") as f:
        f.write("/* made by tools/sightwords_stage6.py; do not edit by hand */\nwindow.SW_DATA8=" + json.dumps(data, ensure_ascii=True, separators=(",", ":")) + ";\n")
    print("wrote", os.path.relpath(out, REPO), os.path.getsize(out), "bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
