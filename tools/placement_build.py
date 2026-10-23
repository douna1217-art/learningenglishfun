#!/usr/bin/env python3
"""Build site/placement-data.js (the reading placement test) and check its difficulty.

Why this file exists (2026-10-23): the first version of the test (Aug 2026) was written by
feel, with 50-75 word passages, 3 choices, answers that could be copied from the passage and
grammar items that were almost always so / and / but. A Chinese second grader with a Lexile
measure of 660L (about US Grade 3) came out at Grade 4. This version:
  - passages grow with the grade (about 55 words for Kindergarten up to about 300 for Grade 6),
    alternating stories and nonfiction, and are checked so that sentence length and the
    Flesch-Kincaid grade rise from level to level (`check`);
  - every level has 8 questions with 4 choices: comprehension (literal, inferential, main idea
    or theme, structure or character), 2 vocabulary-in-context and 2 grammar items taken from
    that grade's Common Core language standards, plus 1 tie-breaker;
  - correct answers are written in our own words, not copied from the passage, and the wrong
    choices are plausible;
  - the correct position is assigned here so A/B/C/D are used evenly.
The difficulty check is an estimate (sentence length and syllables), not an official Lexile
measure; the result page therefore shows a range and lets families who know their child's
Lexile measure enter it instead (site/placement.js).

Usage:
  python3 tools/placement_build.py check    # print difficulty per level, stop if not rising
  python3 tools/placement_build.py build    # check, then write site/placement-data.js
"""
import json
import os
import random
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, "site", "placement-data.js")


def Q(kind, q, correct, *wrong):
    assert len(wrong) == 3, (q, wrong)
    return dict(kind=kind, q=q, correct=correct, wrong=list(wrong))


LEVELS = [
    dict(
        grade="Kindergarten",
        passage="Ben has a small black cat. Her name is Pip. Pip likes to sit in the sun. "
                "One day, Pip did not come home. Ben looked under the bed. He looked in the yard. "
                "Then he heard a soft meow. Pip was in the big box of hats!",
        questions=[
            Q("Literal", "What is the cat's name?", "Pip", "Ben", "Hat", "Sun"),
            Q("Literal", "Where did Ben look first?", "Under the bed", "In the yard", "In the box", "In the sun"),
            Q("Inferential", "How did Ben find Pip?", "He heard her meow", "He saw her in the sun", "His mom told him", "Pip ran to him"),
            Q("Sequence", "What happened last?", "Ben found Pip in a box", "Ben looked in the yard", "Pip did not come home", "Ben looked under the bed"),
            Q("Inferential", "How did Ben feel when Pip did not come home?", "Worried", "Sleepy", "Angry", "Bored"),
            Q("Vocabulary", "In the story, “soft” means ___.", "Quiet", "Wet", "Fast", "Big"),
            Q("Grammar", "“Ben has one cat. Sam has two ___.” Which word belongs in the blank?", "cats", "cat", "cates", "caties"),
            Q("Grammar", "“Pip was ___ the big box.” Which word tells where Pip was?", "in", "and", "is", "the"),
        ],
        tiebreak=Q("Literal", "What was in the box with Pip?", "Hats", "Toys", "Books", "Food"),
    ),
    dict(
        grade="Grade 1",
        passage="Bees are busy all day. They fly from flower to flower. Inside each flower is a sweet juice "
                "called nectar. Bees drink the nectar and carry it home to the hive. In the hive, they turn it "
                "into honey. Bees also carry yellow dust called pollen on their legs. At the next flower, some "
                "pollen falls off. This helps the plant make seeds. So bees help flowers, and flowers "
                "help bees.",
        questions=[
            Q("Literal", "What do bees make in the hive?", "Honey", "Pollen", "Seeds", "Flowers"),
            Q("Literal", "Where do bees carry pollen?", "On their legs", "In their mouths", "On their wings", "In the hive"),
            Q("Inferential", "How does pollen help a plant?", "It lets the plant make seeds for new plants", "It makes the flower taste sweet", "It feeds the baby bees", "It keeps the plant dry"),
            Q("Main idea", "What is this passage mostly about?", "How bees and flowers help each other", "How to make honey at home", "Why bees can sting", "What colors flowers are"),
            Q("Vocabulary", "In the passage, “nectar” is ___.", "A sweet juice inside flowers", "Yellow dust on a bee", "A kind of seed", "The bees' home"),
            Q("Vocabulary", "“Bees are busy all day.” “Busy” means ___.", "Doing a lot of things", "Very sleepy", "Not hungry", "Far away"),
            Q("Grammar", "“Today bees fly to flowers. Yesterday a bee ___ to a red flower.” Which word belongs in the blank?", "flew", "flys", "flied", "flying"),
            Q("Grammar", "“Bees drink the nectar. Then ___ carry it home.” Which word belongs in the blank?", "they", "it", "he", "she"),
        ],
        tiebreak=Q("Inferential", "What does the last sentence mean?", "Bees and flowers both get something they need", "Bees and flowers are the same", "Flowers fly to the bees", "Bees do not like flowers"),
    ),
    dict(
        grade="Grade 2",
        passage="Lily wanted to win the class spelling bee more than anything. Every night she practiced words "
                "with her grandpa at the kitchen table. He read each word slowly, and she spelled it out loud. "
                "On the day of the contest, her hands felt cold and shaky. Her first word was “carrot,” and she "
                "spelled it right. Her second word was “enough.” Lily took a deep breath and remembered Grandpa "
                "saying that the letters g and h can sound like f. She spelled the word carefully, one letter at a "
                "time. The teacher smiled and nodded, and Lily let out her breath. In the end, she did not win "
                "first place that day, because two other children spelled even longer words. She came in third. "
                "Still, when she got home, she ran straight to the kitchen. “Grandpa,” she said, “I spelled "
                "enough!” He laughed and gave her a high five.",
        questions=[
            Q("Literal", "Who helped Lily get ready for the spelling bee?", "Her grandpa", "Her teacher", "Her best friend", "Her older sister"),
            Q("Inferential", "Why did Lily's hands feel cold and shaky?", "She was nervous about the contest", "The room was very cold", "She had been washing dishes", "She was sick that day"),
            Q("Inferential", "How did Grandpa's help matter during the contest?", "She remembered his tip about g and h", "He whispered the answer to her", "He sat next to her on the stage", "He wrote the word on a card"),
            Q("Literal", "What place did Lily get?", "Third", "First", "Second", "Last"),
            Q("Character", "What does the end of the story show about Lily?", "She is proud of what she learned, even without first place", "She is angry that she lost", "She wants to stop spelling", "She did not care about the contest"),
            Q("Vocabulary", "“She spelled the word carefully.” “Carefully” means ___.", "With close attention", "Very loudly", "In a hurry", "Without thinking"),
            Q("Grammar", "“Lily ___ straight to the kitchen.” Which word belongs in the blank?", "ran", "runned", "running", "runs"),
            Q("Grammar", "“Lily did not win first place.” Which is the short form of “did not”?", "didn't", "did'nt", "dont", "didnt"),
        ],
        tiebreak=Q("Inferential", "Why did Lily run to tell Grandpa about the word “enough”?", "His tip had helped her spell it", "It was the word she got wrong", "He was the one giving the words", "He wanted to hear about the prize"),
    ),
    dict(
        grade="Grade 3",
        passage="Most people think of owls as wise birds that stay awake all night. Many owls do hunt at night, "
                "and their bodies are built for the dark. An owl's large eyes collect even a little light, so it "
                "can see when the moon is hidden. However, its eyes cannot move in their sockets the way ours can. "
                "To look to the side, an owl must turn its whole head. Some owls can turn their heads almost all "
                "the way around. Owls also hunt with their ears. A barn owl's face is shaped like a dish, which "
                "guides sounds toward its ears. Its two ears are not at the same height, so a sound reaches one "
                "ear a tiny moment before the other. This helps the owl tell exactly where a mouse is hiding, even "
                "under snow. Finally, the edges of an owl's feathers are soft and fringed. Air passes through them "
                "quietly, so the owl can fly close to its prey without being heard. Each of these features helps "
                "the owl survive as a night hunter.",
        questions=[
            Q("Main idea", "What is the passage mostly about?", "How an owl's body helps it hunt at night", "Why owls are wiser than other birds", "How to build a home for owls", "What owls eat in the winter"),
            Q("Literal", "Why does an owl turn its whole head to look to the side?", "Its eyes stay fixed in one position", "Its neck is very long", "Its ears are on top of its head", "It is looking for the moon"),
            Q("Inferential", "Why is it helpful that an owl's ears are at different heights?", "It can find the exact spot a noise is coming from", "It can hear two songs at once", "It keeps snow out of its ears", "It makes the owl look bigger"),
            Q("Literal", "What does the dish shape of a barn owl's face do?", "It catches sounds and directs them to the ears", "It keeps the owl warm", "It helps the owl see colors", "It helps the owl fly faster"),
            Q("Text structure", "How does the author organize the passage?", "By describing one body part after another", "By telling a story about one owl", "By comparing owls and bats", "By listing events in the order they happened long ago"),
            Q("Vocabulary", "“The owl can fly close to its prey.” “Prey” means ___.", "An animal that is hunted for food", "A place where owls sleep", "A sound in the night", "A feather on a wing"),
            Q("Grammar", "“An owl's eyes are ___ than a mouse's eyes.” Which word belongs in the blank?", "larger", "largest", "more large", "most larger"),
            Q("Grammar", "Which phrase shows feathers that belong to one owl?", "the owl's feathers", "the owls feathers", "the owls' feathers", "the owl feathers's"),
        ],
        tiebreak=Q("Inferential", "Why can an owl get close to a mouse without the mouse hearing it?", "Its special feathers make almost no noise as it flies", "It waits until the mouse is asleep", "It flies high above the trees", "It hunts only when it snows"),
    ),
    dict(
        grade="Grade 4",
        passage="When Marco's family moved to the city, the thing he missed most was the creek behind his old "
                "house. He had spent whole afternoons there, turning over rocks to find crayfish and building dams "
                "that never quite held. His new apartment overlooked a parking lot, and the only water nearby was "
                "a fountain that switched off every evening at six.\n"
                "On his third Saturday in the city, his neighbor, Mrs. Okafor, invited him to help at the community "
                "garden two blocks away. He agreed mostly to be polite. The garden was smaller than his old backyard, "
                "but at its far end, beneath a row of tomato plants, ran a narrow ditch filled with rainwater. Marco "
                "crouched beside it without thinking. Water striders skated across the surface, and a frog the size "
                "of his thumb leaped into the mud.\n"
                "“We are trying to keep that ditch clean,” Mrs. Okafor said, “but nobody here knows much about what "
                "lives in it.” Marco realized that he knew quite a lot. He described the striders, explained that "
                "frogs needed shady edges, and suggested placing flat stones where small animals could hide.\n"
                "By the end of the afternoon, Mrs. Okafor had written his ideas in a notebook labeled Garden Plans. "
                "Walking home past the silent fountain, Marco still missed the creek. But for the first time since "
                "the move, he was already looking forward to next Saturday.",
        questions=[
            Q("Literal", "What did Marco miss most after the move?", "The little stream by his old home", "His friends from his old school", "His big bedroom", "The fountain in the park"),
            Q("Inferential", "Why did Marco agree to go to the garden at first?", "He did not want to be rude to his neighbor", "He loved growing tomatoes", "He wanted to see the fountain", "His parents made him go"),
            Q("Inferential", "Why did Marco crouch beside the ditch “without thinking”?", "The water reminded him of the creek he loved", "He had dropped something into it", "Mrs. Okafor asked him to clean it", "He was tired from working"),
            Q("Character", "What did Marco discover about himself at the garden?", "He knew useful things about animals that live near water", "He was afraid of frogs", "He did not enjoy being outdoors", "He wanted to move back right away"),
            Q("Theme", "Which sentence best states a theme of the story?", "Something you know from your past can help you belong in a new place", "Cities are better places to live than the countryside", "Children should not play near ditches", "Neighbors should not ask children for help"),
            Q("Vocabulary", "“His new apartment overlooked a parking lot.” “Overlooked” means ___.", "Had a view of", "Forgot about", "Took care of", "Was hidden behind"),
            Q("Grammar", "“Mrs. Okafor, ___ lived next door, invited Marco to the garden.” Which word belongs in the blank?", "who", "which", "whose", "whom"),
            Q("Grammar", "“Right now, Mrs. Okafor ___ his ideas in a notebook.” Which words belong in the blank?", "is writing", "was write", "writing", "are writing"),
        ],
        tiebreak=Q("Inferential", "What does the “silent fountain” at the end help show?", "The city still does not feel like home, even though things are getting better", "The fountain is broken for good", "Marco is angry at Mrs. Okafor", "Marco is lost on the way home"),
    ),
    dict(
        grade="Grade 5",
        passage="For centuries, sailors told stories about giant waves that rose without warning in the open ocean. "
                "For a long time, scientists dismissed these accounts as exaggerations. "
                "Their wave models said that such monsters should appear only once in thousands of years. That view changed on New Year's Day in "
                "1995. Instruments on an oil platform in the North Sea recorded a single wave nearly twenty-six meters "
                "tall, more than twice the height of the waves around it. "
                "A wave that size is taller than an eight-story building.\n"
                "Researchers now call these events rogue waves. They have discovered that rogue waves are far "
                "more common than anyone believed. Some form when a fast current flows against incoming waves, "
                "squeezing them together until their energy piles up. Others appear when several smaller waves "
                "overlap at the same moment. Their heights add together, the way many voices can combine into one "
                "sudden shout.\n"
                "Because a rogue wave can strike from any direction, it is extremely difficult to forecast. Satellites "
                "can measure wave heights across wide areas, yet they pass over any single place only occasionally. "
                "To fill these gaps, scientists also use floating buoys and "
                "computer models that test thousands of possible sea conditions. Their goal is not to predict every "
                "single wave, which may never be possible. Instead, they hope to identify the conditions in which "
                "rogue waves become more likely. Even a warning of a few hours could allow ships to change course "
                "and keep their crews safe.",
        questions=[
            Q("Main idea", "What is the main idea of the passage?", "Rogue waves are real and more common than once thought, and scientists are learning when they are likely", "Sailors invented frightening stories about the sea", "Oil platforms cause giant waves to form", "Satellites can already predict every wave"),
            Q("Literal", "What changed scientists' minds about giant waves?", "Instruments measured a huge wave in 1995", "A sailor took a photograph of one", "A large ship sank in a storm", "A new satellite was launched"),
            Q("Inferential", "Why did scientists once doubt the sailors' stories?", "Their calculations said waves that big almost never happen", "Sailors often lied about storms", "No one had ever sailed in the North Sea", "The waves only happened at night"),
            Q("Cause and effect", "According to the passage, how can a current help create a rogue wave?", "By running against waves and pushing their energy together", "By making ships move faster", "By warming the water", "By pulling waves under the surface"),
            Q("Author's craft", "Why does the author compare overlapping waves to voices combining into a sudden shout?", "To show how small parts can add up to something much bigger", "To show that waves make loud noises", "To explain how sailors call for help", "To describe the sound of a storm"),
            Q("Vocabulary", "“For a long time, scientists dismissed these accounts.” “Dismissed” means ___.", "Decided were not worth believing", "Sent home early", "Wrote down carefully", "Proved to be true"),
            Q("Grammar", "“Researchers ___ discovered that rogue waves are more common than people believed.” Which word belongs in the blank?", "have", "has", "is", "was"),
            Q("Grammar", "“Rogue waves can form ___ when currents push against waves ___ when smaller waves overlap.” Which pair of words belongs in the blanks?", "either / or", "neither / or", "both / or", "whether / and"),
        ],
        tiebreak=Q("Inferential", "What is the scientists' realistic goal, according to the last paragraph?", "To find the conditions that make rogue waves more likely", "To predict every single wave", "To stop rogue waves from forming", "To replace ships with satellites"),
    ),
    dict(
        grade="Grade 6",
        passage="Priya had been the fastest runner on her team for two seasons, so when Coach Delgado announced that "
                "the last relay spot would go to Tamsin, the new girl from Ohio, Priya assumed there had been a "
                "mistake. She replayed the time trials in her head and was certain that she had crossed the line "
                "first. Only later, while stretching on the bleachers, did she notice what Coach had recorded on the "
                "clipboard, which was not only finishing times but handoff times.\n"
                "In a relay, each runner carries a baton and must pass it to the next runner within a marked zone. "
                "Priya had always treated the exchange as an annoying pause, a moment when she slowed down and waited "
                "for her teammate to grab it. Tamsin, by contrast, began accelerating before the baton reached her, "
                "holding her hand steady behind her like a target. Over four exchanges, the fractions of a second "
                "she saved added up to more than Priya's advantage in raw speed.\n"
                "For a week, Priya barely spoke to Tamsin at practice. Then, during a drill, Tamsin missed a handoff "
                "and dropped the baton, and Priya heard herself offering advice before she had decided to. She "
                "explained that she watched the other runner's shoulders instead of the baton itself. Tamsin tried "
                "it, and the next exchange was smooth.\n"
                "At the championship, Priya ran the open 400 meters and placed second, which disappointed her "
                "slightly. Twenty minutes later, standing at the edge of the track, she watched the relay team, "
                "Tamsin included, pass the baton cleanly four times and win by a stride. Priya found that she was "
                "cheering herself hoarse, and she did not entirely understand why.",
        questions=[
            Q("Inferential", "Why did Priya first assume the coach had made a mistake?", "She believed she was faster than Tamsin", "She thought Tamsin was injured", "She had missed the time trials", "She wanted to run the 400 meters instead"),
            Q("Literal", "What had the coach recorded that Priya had not thought about?", "How quickly each runner passed the baton", "The weather on race day", "Which runners were new to the team", "How many laps each runner ran"),
            Q("Inferential", "How was Tamsin's way of taking the baton different from Priya's?", "Tamsin started speeding up before the baton arrived", "Tamsin stopped completely to grab it", "Tamsin watched the baton the whole time", "Tamsin used both hands"),
            Q("Theme", "Which sentence best expresses a theme of the story?", "Success can depend on teamwork and skill, not only on individual speed", "The fastest person should always be chosen", "New team members cannot be trusted", "Losing a race is a reason to quit"),
            Q("Vocabulary", "“Tamsin began accelerating before the baton reached her.” “Accelerating” means ___.", "Speeding up", "Slowing down", "Turning around", "Standing still"),
            Q("Vocabulary", "What does “cheering herself hoarse” mean?", "Cheering so much that her voice became rough", "Cheering for a horse race", "Cheering quietly to herself", "Pretending to cheer"),
            Q("Grammar", "Which sentence uses the pronoun “herself” correctly?", "Priya surprised herself by offering advice.", "Herself and Tamsin practiced handoffs.", "Coach handed herself the baton to Priya.", "Tamsin and herself won the relay."),
            Q("Grammar", "Which sentence uses commas correctly to set off extra information?", "Tamsin, the new girl from Ohio, won the last spot.", "Tamsin the new girl, from Ohio won the last spot.", "Tamsin, the new girl from Ohio won the last spot.", "Tamsin the new girl from Ohio, won the last spot."),
        ],
        tiebreak=Q("Character", "What does Priya's advice during the drill suggest about her?", "She was starting to care about the team's success more than her own disappointment", "She wanted Tamsin to drop the baton again", "She was trying to win back the relay spot", "She did not know how to pass a baton"),
    ),
]


# ---------------------------------------------------------------- difficulty estimate
def syllables(word):
    w = re.sub(r"[^a-z]", "", word.lower())
    if not w:
        return 0
    if len(w) <= 3:
        return 1
    w = re.sub(r"(?:[^laeiouy]es|ed|[^laeiouy]e)$", "", w)
    w = re.sub(r"^y", "", w)
    return max(1, len(re.findall(r"[aeiouy]{1,2}", w)))


def stats(text):
    words = re.findall(r"[A-Za-z0-9’']+", text)
    sentences = [s for s in re.split(r"[.!?]+[”\"]?(?:\s+|$)", text) if re.search(r"[A-Za-z]", s)]
    syl = sum(syllables(w) for w in words)
    wps = len(words) / len(sentences)
    fk = 0.39 * wps + 11.8 * syl / len(words) - 15.59
    long_words = sum(1 for w in words if syllables(w) >= 3) / len(words)
    return dict(words=len(words), sentences=len(sentences), wps=wps, fk=fk, long=long_words)


def check():
    ok = True
    prev = None
    print(f"{'level':13} {'words':>5} {'sent':>4} {'w/sent':>6} {'FK':>5} {'3+syl':>6}")
    for lvl in LEVELS:
        s = stats(lvl["passage"])
        print(f"{lvl['grade']:13} {s['words']:5} {s['sentences']:4} {s['wps']:6.1f} {s['fk']:5.1f} {s['long']*100:5.1f}%")
        if prev and not (s["fk"] > prev["fk"] and s["words"] > prev["words"]):
            print("   ^ not harder and longer than the level before")
            ok = False
        prev = s
        for q in lvl["questions"] + [lvl["tiebreak"]]:
            choices = [q["correct"]] + q["wrong"]
            assert len(set(c.lower() for c in choices)) == 4, ("duplicate choice", q["q"])
        assert len(lvl["questions"]) == 8, lvl["grade"]
        assert sum(1 for q in lvl["questions"] if q["kind"] == "Grammar") == 2, lvl["grade"]
        assert sum(1 for q in lvl["questions"] if q["kind"] == "Vocabulary") in (1, 2), lvl["grade"]
    return ok


# ---------------------------------------------------------------- output
HEADER = """/* Reading placement quiz: level content. GENERATED by tools/placement_build.py; edit there.
   Each level: one original passage (not from any book on the site), 8 questions with 4 choices
   (comprehension, vocabulary in context, and 2 grammar items from that grade's Common Core
   language standards) and 1 tie-breaker used only when a student scores 5 or 6 out of 8.
   Passages get longer and harder level by level (checked by the build tool). Correct-choice
   positions are spread evenly over A/B/C/D. See placement.js for the adaptive logic. */
"""

FOOTER = """
/* Rough reading-band label per recommended grade, for display only
   (books.js readingBand tags vary a little by subject, so this is a
   simple, consistent mapping just for the placement result card). */
window.PLACEMENT_BAND_FOR_GRADE = function(grade){
  if (/kindergarten/i.test(grade)) return "Early Reader";
  if (/grade\\s*1/i.test(grade)) return "Beginning Reader";
  if (/grade\\s*2/i.test(grade) || /grade\\s*3/i.test(grade)) return "Growing Reader";
  return "Fluent Reader";
};
"""


def place(q, pos):
    choices = list(q["wrong"])
    choices.insert(pos, q["correct"])
    return {"kind": q["kind"], "q": q["q"], "choices": choices, "answer": pos}


def build():
    out = []
    counts = [0, 0, 0, 0]
    for li, lvl in enumerate(LEVELS):
        items = lvl["questions"] + [lvl["tiebreak"]]
        # each level uses A, B, C and D twice each, in a fixed shuffled order (no visible pattern);
        # the tiebreak rotates by level
        base = [0, 1, 2, 3, 0, 1, 2, 3]
        random.Random(1000 + li).shuffle(base)
        pattern = base + [li % 4]
        placed = [place(q, p) for q, p in zip(items, pattern)]
        for p in pattern:
            counts[p] += 1
        out.append({"grade": lvl["grade"], "passage": lvl["passage"], "questions": placed[:-1], "tiebreak": placed[-1]})
    js = HEADER + "window.PLACEMENT_LEVELS = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n" + FOOTER
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(js)
    print("wrote", OUT, "| correct positions A/B/C/D:", counts)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "check"
    good = check()
    if cmd == "build":
        if not good:
            sys.exit("difficulty does not rise from level to level; not writing")
        build()
    elif not good:
        sys.exit(1)
