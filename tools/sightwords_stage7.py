#!/usr/bin/env python3
"""Sight words, stage 7 (part 4): 140 more Fry words as 30 short lessons on the desert island.

Same idea as tools/sightwords_stage7.py (it uses the helpers of stages 1 to 6): lessons, one short example sentence per word, a check
that the sentences only use words of the seven stages plus a few picture nouns, and a count of how often each word is used in the site's
books (with the best "read it next" book for each lesson). Writes site/sightwords-data7.js, a plain script that sets window.SW_DATA7;
sightwords.js adds it to the data of stages 1 to 6 (lessons 159-188, units 31-35, stage 7 turns "ready").

  python3 tools/sightwords_stage7.py            # check + write site/sightwords-data7.js + print the numbers
  python3 tools/sightwords_stage7.py --check    # only check, write nothing

The words are the next ones of the Fry 1000 Instant Words (the words that Dolch and stages 1 to 6 do not have yet): places, directions, people, animals,
things and describing words of the eighth to the tenth hundred, chosen for being common and easy to show in a picture. The sentences are written for this site.
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

REPO, SITE = S1.REPO, S1.SITE

# lesson ids go on after stage 6 (129-158), unit ids after its units (26-30); a unit is one world of the desert island
LESSONS = [
    "desert plains valley east northern", "southern western view evening spring", "flow rise rose gas steel", "cotton crops fig hoe row", "spot area site base", "surface section scale angle",
    "captain workers company factories students", "child son born job report", "bill cost trade deal pounds", "march practice speak act", "lead serve received entered", "return sent continued discovered seen",
    "triangle copy type printed record", "chart column case seat science", "art design control create mine", "weight addition figure form", "explain describe observe correct", "example order set means language",
    "fun enjoy feeling interesting alone", "melody rhythm present smell energy", "million thousands certain decided trouble", "guess choose solve oh", "fit match belong amount", "raised appear moment should matter",
    "opposite straight equal main difference", "lot bit least except separate", "compare divided mind yet rule", "let’s you’re isn’t doesn’t wasn’t", "won’t couldn’t wouldn’t themselves", "carefully scientists cattle cells",
]
FIRST_LESSON = 159
FIRST_UNIT = 31
UNITS = [list(range(FIRST_LESSON + 6 * i, FIRST_LESSON + 6 * i + 6)) for i in range(5)]
SIZES = [5, 5, 5, 5, 4, 4, 5, 5, 5, 4, 4, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 4, 4]

SENT = {
    "desert": "The desert is hot and dry.", "plains": "The plains are wide and flat.", "valley": "The river is in the valley.", "east": "We walk to the east.", "northern": "The northern side is cold.",
    "southern": "The southern side is warm.", "western": "The western sky is red.", "view": "What a pretty view!", "evening": "We go home in the evening.", "spring": "Flowers grow in spring.",
    "flow": "The river will flow to the sea.", "rise": "The balloon will rise.", "rose": "The sun rose over the hill.", "gas": "I put gas in the car.", "steel": "The bridge is made of steel.",
    "cotton": "The cotton is soft.", "crops": "The farmers grow crops.", "fig": "I eat a fig.", "hoe": "The farmer has a hoe.", "row": "The seeds are in a row.",
    "spot": "The dog has a black spot.", "area": "This is a play area.", "site": "The building site is big.", "base": "The tree has a thick base.",
    "surface": "The table has a flat surface.", "section": "The first section is red.", "scale": "I use the scale.", "angle": "I draw an angle.",
    "captain": "The captain is on the ship.", "workers": "The workers build a house.", "company": "My dad has a company.", "factories": "The factories are big.", "students": "The students are in class.",
    "child": "The child has a red hat.", "son": "He is my son.", "born": "The baby was born today.", "job": "Mom has a good job.", "report": "I show Mom my report.",
    "bill": "I pay the bill.", "cost": "How much does it cost?", "trade": "We trade hats.", "deal": "We have a deal.", "pounds": "The box is ten pounds.",
    "march": "We march to the drum.", "practice": "I practice every day.", "speak": "I speak to my friends.", "act": "We act in a play.",
    "lead": "The dog will lead the way.", "serve": "I serve the cake.", "received": "I received a letter.", "entered": "She entered the room.",
    "return": "I return the book.", "sent": "Mom sent me a gift.", "continued": "We continued to walk.", "discovered": "I discovered a frog.", "seen": "I have seen a bear.",
    "triangle": "I see a triangle.", "copy": "I copy the picture.", "type": "I type on the laptop.", "printed": "I printed the picture.", "record": "I play a record.",
    "chart": "I look at the chart.", "column": "The column is tall.", "case": "The pencil is in the case.", "seat": "Take a seat.", "science": "I like science.",
    "art": "We have art today.", "design": "I design a house.", "control": "I control the car.", "create": "I create a robot.", "mine": "That ball is mine.",
    "weight": "I check my weight.", "addition": "I like addition.", "figure": "I draw a stick figure.", "form": "I write on the form.",
    "explain": "I explain the game.", "describe": "I describe my dog.", "observe": "I observe the bird.", "correct": "The answer is correct.",
    "example": "This is an example.", "order": "Put them in order.", "set": "I set the table.", "means": "A red light means stop.", "language": "We speak the same language.",
    "fun": "We have fun.", "enjoy": "I enjoy the music.", "feeling": "I have a good feeling.", "interesting": "The book is interesting.", "alone": "The dog is alone.",
    "melody": "I like the melody.", "rhythm": "I feel the rhythm.", "present": "I have a present for you.", "smell": "I smell the flower.", "energy": "I have a lot of energy.",
    "million": "There are a million stars.", "thousands": "I see thousands of birds.", "certain": "I am certain it is red.", "decided": "We decided to go to the park.", "trouble": "The dog is in trouble.",
    "guess": "Can you guess?", "choose": "I choose the red hat.", "solve": "I can solve it.", "oh": "Oh, it is a cat!",
    "fit": "Does the shoe fit?", "match": "We have a soccer match.", "belong": "Where does the toy belong?", "amount": "I drink a small amount.",
    "raised": "I raised my hand.", "appear": "A rainbow will appear.", "moment": "Wait a moment.", "should": "I should wash my hands.", "matter": "What is the matter?",
    "opposite": "Hot is the opposite of cold.", "straight": "The road is straight.", "equal": "The two halves are equal.", "main": "This is the main road.", "difference": "I see the difference.",
    "lot": "I have a lot of apples.", "bit": "I want a bit of cake.", "least": "She has the least money.", "except": "Everyone is here except Sam.", "separate": "I keep them separate.",
    "compare": "I compare the two hats.", "divided": "I divided the cake in two.", "mind": "I will change my mind.", "yet": "It is not ready yet.", "rule": "That is a good rule.",
    "let\u2019s": "Let’s play ball.", "you\u2019re": "You’re so kind.", "isn\u2019t": "It isn’t red.", "doesn\u2019t": "He doesn’t like cake.", "wasn\u2019t": "It wasn’t me.",
    "won\u2019t": "I won’t go.", "couldn\u2019t": "I couldn’t find my hat.", "wouldn\u2019t": "The door wouldn’t open.", "themselves": "They dress themselves.",
    "carefully": "I walk carefully.", "scientists": "The scientists look at the stars.", "cattle": "The cattle eat grass.", "cells": "The cells are small.",
}
# picture nouns the stage-7 sentences use besides the nouns of the earlier stages
EXTRA_NOUNS = {"balloon", "bridge", "halves", "hands", "laptop", "rainbow", "robot", "soccer"}

UNIT_NAMES = ["Sand dunes", "Oasis town", "Pyramid hall", "Starry night", "Camel caravan"]
MAX_WORDS = 7
WORDS7 = [w for l in LESSONS for w in l.split()]


def check():
    problems = []
    words = WORDS7
    if len(words) != 140 or len(set(words)) != 140:
        problems.append(("there must be 140 distinct words", len(words), len(set(words))))
    earlier = set(w.lower() for w in S1.PRE_PRIMER + S1.PRIMER + S2.GRADE1 + S2.GRADE2 + S3.GRADE3 + S3.NOUNS3 + S4.WORDS4 + S5.WORDS5 + S6.WORDS6)
    if earlier & set(words):
        problems.append(("a stage-7 word is already in stages 1 to 6", sorted(earlier & set(words))))
    sizes = [len(l.split()) for l in LESSONS]
    if sizes != SIZES:
        problems.append(("lesson sizes", sizes))
    flat = [i for u in UNITS for i in u]
    if flat != list(range(FIRST_LESSON, FIRST_LESSON + len(LESSONS))):
        problems.append(("units must list every lesson once, in order", flat))
    allowed = ({w.lower().replace("’", "'") for w in words} | {w.lower() for w in S1.PRE_PRIMER + S1.PRIMER}
               | {w.lower().replace("’", "'") for w in S2.GRADE1 + S2.GRADE2} | {w.lower() for w in S3.GRADE3 + S3.NOUNS3}
               | {w.lower().replace("’", "'") for w in S4.WORDS4 + S5.WORDS5 + S6.WORDS6} | S1.NOUNS | S2.NOUNS2 | S5.EXTRA_NOUNS | S6.EXTRA_NOUNS | EXTRA_NOUNS)
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
    keys = [S1.re.sub(r"[^a-z]", "", w.lower()) for w in words + S1.PRE_PRIMER + S1.PRIMER + S2.GRADE1 + S2.GRADE2 + S3.GRADE3 + S3.NOUNS3 + S4.WORDS4 + S5.WORDS5 + S6.WORDS6]
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
    words = WORDS7
    books, freq, inbooks, cover = S1.corpus_stats(words)
    print("books read: %d" % len(books))
    for k, label in (("early", "Kindergarten + Grade 1 books"), ("all", "all books")):
        h, t = cover[k]
        print("the 140 words are %.1f%% of all word tokens in %s (%d of %d)" % (100.0 * h / max(1, t), label, h, t))
    stories = [b for b in books if b["sub"] in ("fiction", "sel")]     # the "read it in a story" link should open a story
    lessons = []
    for i, l in enumerate(LESSONS):
        ws = l.split()
        lessons.append({"id": FIRST_LESSON + i, "stage": 7, "list": "f", "words": ws,
                        "books": S1.best_books(stories, ws, ("Grade 4", "Grade 5"))})
    data = {
        "stage": 7, "name": "Stage 7", "source": "Fry words, part 4",
        "lessons": lessons,
        "units": [{"id": FIRST_UNIT + i, "stage": 7, "lessons": u} for i, u in enumerate(UNITS)],
        "words": {w: {"list": "f", "s": SENT[w], "n": freq[w], "b": inbooks[w]} for w in words},
        "nouns": sorted(EXTRA_NOUNS),
    }
    out = os.path.join(SITE, "sightwords-data7.js")
    with open(out, "w", encoding="utf-8") as f:
        f.write("/* made by tools/sightwords_stage6.py; do not edit by hand */\nwindow.SW_DATA7=" + json.dumps(data, ensure_ascii=True, separators=(",", ":")) + ";\n")
    print("wrote", os.path.relpath(out, REPO), os.path.getsize(out), "bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
