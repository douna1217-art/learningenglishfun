"""python3 tools/length_bias_test.py
Checks the answer-length audit (k1_storybook.length_problems): synthetic cases first, then how many of the already built batches would pass it
(the report is information, not a pass/fail; those books are live)."""
import glob, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import k1_storybook as K

def item(correct, d1, d2):
    return {"q": "q", "choices": [correct, d1, d2], "answer": 0}

def quiz(c, g, v):
    return {"comprehension": c, "grammar": g, "vocabulary": v}

n = 0
def t(name, cond):
    global n
    assert cond, name
    n += 1

long_right = item("She stayed at home because it was raining heavily outside", "She went out", "She was tired")
t("flags a long right choice", K.length_problems("s", quiz([long_right], [], [])))
even = item("She stayed home because it rained", "She went out to play with a friend", "She was too tired to do anything")
t("passes an even question", not K.length_problems("s", quiz([even], [], [])))
many = quiz([even] * 3, [], [])
t("too many unique-longest in one category", any("unique longest" in p[2] for p in K.length_problems("s", quiz([item("aaaaaaaaaaaa", "bbbbbbbbb", "cccccccccc")] * 3, [], []))))
t("lopsided stub is flagged", any("lopsided" in p[2] for p in K.length_problems("s", quiz([item("a fairly long right answer here", "ok", "another long wrong answer here")], [], []))))
short_right = item("no", "aaaaaaaaaaaaa", "bbbbbbbbbbbbb")
t("always-shortest is flagged", any("shortest" in p[2] for p in K.length_problems("s", quiz([short_right] * 5, [short_right] * 3, [short_right] * 3))))
mid = item("She stayed home because it was raining", "She went out because the sun was shining", "She went to bed because she was sleepy")
short = item("She stayed home", "She went outside", "She went to bed")
long2 = item("She went out to play with Mia", "She stayed home all day long", "She went to bed very early")
book = quiz([mid, long2, short, mid, long2], [mid, short, long2], [short, mid, long2])
t("a balanced book passes", not K.length_problems("s", book))

bad = tot = 0
for f in sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), "batches", "*.py"))):
    try:
        books = K.load_books(f)
    except Exception:
        continue
    for slug, spec in books.items():
        try:
            qz = K.balanced_quizzes(slug, spec)
        except Exception:
            continue
        tot += 1
        if K.length_problems(slug, qz):
            bad += 1
print(f"{n} checks passed. Of {tot} built batch books, {bad} would be refused by the new rule today.")
