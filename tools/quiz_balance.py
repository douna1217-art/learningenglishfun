"""Reusable quiz answer-position balancing helper.

Import this from any book-generation script (gen_book.py, human_tpl.py-based
build_*.py, etc.) and call rebalance_quizzes() on the quizzes dict before
serializing it, so every new book ships with answer positions spread evenly
across choices instead of defaulting to (or randomly drifting toward) the
same index for most/all questions.

This file is committed to the repo (unlike the book-generation scripts
themselves, which live only in ephemeral per-session scratchpads and
periodically get evicted and reconstructed from a live book) specifically
so this logic survives across sessions and never has to be re-derived from
memory. See memory: gen-book-tpl-reconstruction-checklist,
quiz-answer-position-variety.
"""
import random


def make_balanced_targets(n, rng):
    """n target indices in {0,1,2}, shuffled, guaranteed within 1 of an
    even split (e.g. 4/4/3 for 11 items) -- NOT independent per-item
    random.choice(), which can by chance skew heavily within a single
    book's ~10-12 items."""
    base = [i % 3 for i in range(n)]
    rng.shuffle(base)
    return base


def rebalance_quizzes(quizzes, seed):
    """Mutates `quizzes` (a dict with comprehension/grammar/vocabulary
    lists of {"choices": [...], "answer": int, ...}) in place, moving each
    item's correct-answer TEXT to a newly balanced position -- not just
    editing the answer integer, since the choices array order is what
    actually determines where the correct answer visually lands.

    3-choice items are balanced together across the whole book (cycling
    0/1/2). 2-choice items (a legacy sub-format) get their own independent
    2-way balance. Returns nothing; call again on the mutated dict if you
    need the resulting distribution."""
    rng = random.Random(seed)

    three_choice_items = []
    two_choice_items = []
    for sec in ("comprehension", "grammar", "vocabulary"):
        for it in quizzes.get(sec, []):
            if "answer" not in it or "choices" not in it:
                continue
            if len(it["choices"]) == 3:
                three_choice_items.append(it)
            elif len(it["choices"]) == 2:
                two_choice_items.append(it)

    targets = make_balanced_targets(len(three_choice_items), rng)
    for it, target in zip(three_choice_items, targets):
        correct_text = it["choices"][it["answer"]]
        distractors = [c for k, c in enumerate(it["choices"]) if k != it["answer"]]
        rng.shuffle(distractors)
        new_choices = [None, None, None]
        new_choices[target] = correct_text
        di = 0
        for k in range(3):
            if new_choices[k] is None:
                new_choices[k] = distractors[di]
                di += 1
        it["choices"] = new_choices
        it["answer"] = target

    for it in two_choice_items:
        correct_text = it["choices"][it["answer"]]
        other_text = [c for k, c in enumerate(it["choices"]) if k != it["answer"]][0]
        target = rng.choice([0, 1])
        new_choices = [None, None]
        new_choices[target] = correct_text
        new_choices[1 - target] = other_text
        it["choices"] = new_choices
        it["answer"] = target
