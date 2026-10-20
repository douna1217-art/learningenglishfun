#!/usr/bin/env python3
"""Step 1 of the dictionary: the list of words the books use.

Reads the story text of every book page (site/books/*/*.html: the `const pages=[...]` of each), folds word forms into their base word
(ran -> run, bridges -> bridge) and leaves out the names of characters and places. The English-Chinese data (ECDICT, MIT licence,
https://github.com/skywind3000/ECDICT, release 1.0.28 "ecdict-sqlite-28.zip" -> stardict.db) gives the base-word links, the frequency
rank and the Chinese meanings.

    python3 tools/dict_wordlist.py --db /path/to/stardict.db
  -> tools/dict/headwords.json   one entry per base word, most used first
  -> tools/dict/names.txt        what was taken for names (to check by eye)
"""
import argparse, collections, glob, json, os, re, sqlite3, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
WORD = re.compile(r"[A-Za-z]+(?:['’][A-Za-z]+)?")


def story_text(path):
    """Every page text (and the title) of one book page, or [] when the file has no pages."""
    t = open(path, encoding="utf8", errors="ignore").read()
    i = t.find("const pages=")
    if i < 0:
        return []
    j = t.find("[", i)
    try:
        pages, _ = json.JSONDecoder().raw_decode(t[j:])
    except ValueError:
        return []
    out = []
    for p in pages:
        if isinstance(p, dict):
            for k in ("title", "text"):
                if isinstance(p.get(k), str):
                    out.append(p[k])
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", required=True, help="stardict.db from ECDICT")
    ap.add_argument("--books", default=os.path.join(ROOT, "site", "books"))
    ap.add_argument("--out", default=os.path.join(ROOT, "tools", "dict"))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    low, cap, lc, books_of = collections.Counter(), collections.Counter(), collections.Counter(), collections.defaultdict(set)
    files = sorted(glob.glob(os.path.join(a.books, "*", "*.html")))
    nbooks = 0
    for f in files:
        texts = story_text(f)
        if not texts:
            continue
        nbooks += 1
        slug = os.path.basename(f)[:-5]
        for txt in texts:
            for m in WORD.finditer(txt):
                w = m.group(0).replace("’", "'")
                key = w.lower()
                if key.endswith("'s") and len(key) > 3:
                    key = key[:-2]  # earth's -> earth
                # a capital in the middle of a sentence says "name"; one after . ! ? or a quote starts a sentence and says nothing
                before = txt[: m.start()].rstrip(" \t\"“‘'(")
                starts = not before or before[-1] in ".!?\n:"
                if w[0].isupper() and not starts and not w.isupper():
                    cap[key] += 1
                elif not w[0].isupper() or w.isupper() or starts:
                    low[key] += 1
                if not w[0].isupper():
                    lc[key] += 1  # seen with a small first letter at least once: a common word
                books_of[key].add(slug)

    db = sqlite3.connect(a.db)

    def row(w):
        r = db.execute("select word,phonetic,translation,pos,tag,bnc,frq,exchange from stardict where word=? collate nocase limit 1", (w,)).fetchone()
        return None if not r else dict(zip(("word", "phonetic", "translation", "pos", "tag", "bnc", "frq", "exchange"), r))

    def lemma_of(w):
        r = row(w)
        if r and r["exchange"]:
            m = re.search(r"(?:^|/)0:([^/]+)", r["exchange"])
            if m:
                return m.group(1).lower()
        if r and (r["translation"] or "").strip():
            return w
        # not in the data: strip a plain ending and try again
        for suf, rep in (("'s", ""), ("ies", "y"), ("es", ""), ("s", ""), ("ing", ""), ("ing", "e"), ("ed", ""), ("ed", "e"), ("ly", "")):
            if w.endswith(suf) and len(w) - len(suf) >= 3:
                b = w[: -len(suf)] + rep
                rb = row(b)
                if rb and (rb["translation"] or "").strip():
                    return lemma_of(b) if b != w else b
        return None

    names, entries, unknown = {}, {}, {}
    for key in sorted(set(low) | set(cap)):
        c_low, c_cap = low[key], cap[key]
        r = row(key)
        # a name: nearly always capitalised in the middle of sentences (3 times or more), or not a dictionary word at all and capitalised there
        person = bool(r) and "人名" in (r["translation"] or "") and "地名" not in (r["translation"] or "")
        never_small = lc[key] == 0 and c_cap + c_low >= 2 and (not r or person or not (r["frq"] or 0))
        capped = c_cap >= 3 and c_cap / (c_cap + c_low) >= 0.9
        # a name of a person: left out. A place, a day, a language is a word worth looking up: kept (marked as proper)
        if never_small or (capped and (person or not r)) or (not r and c_cap >= 1 and c_low == 0):
            names[key] = c_cap + c_low
            continue
        proper = capped
        lem = lemma_of(key)
        if not lem:
            unknown[key] = c_low + c_cap
            continue
        e = entries.setdefault(lem, {"w": lem, "forms": {}, "n": 0, "books": set(), "proper": proper})
        e["forms"][key] = e["forms"].get(key, 0) + c_low + c_cap
        e["n"] += c_low + c_cap
        e["books"] |= books_of[key]
    out = []
    for lem, e in entries.items():
        r = row(lem) or {}
        out.append({
            "w": lem,
            "n": e["n"],
            "books": len(e["books"]),
            "forms": dict(sorted(e["forms"].items(), key=lambda kv: -kv[1])),
            "phon": r.get("phonetic") or "",
            "pos": r.get("pos") or "",
            "tag": r.get("tag") or "",
            "bnc": r.get("bnc") or 0,
            "frq": r.get("frq") or 0,
            "cn_raw": (r.get("translation") or "").strip(),
            "proper": bool(e["proper"]),
        })
    out.sort(key=lambda x: (-x["n"], x["w"]))
    json.dump(out, open(os.path.join(a.out, "headwords.json"), "w"), ensure_ascii=False)
    open(os.path.join(a.out, "names.txt"), "w").write("\n".join("%s\t%d" % kv for kv in sorted(names.items(), key=lambda kv: -kv[1])) + "\n")
    open(os.path.join(a.out, "unknown.txt"), "w").write("\n".join("%s\t%d" % kv for kv in sorted(unknown.items(), key=lambda kv: -kv[1])) + "\n")
    tot = sum(x["n"] for x in out)
    run, marks = 0, {}
    for i, x in enumerate(out, 1):
        run += x["n"]
        for m in (500, 1000, 2000, 3000, 5000):
            if i == m:
                marks[m] = round(100 * run / tot, 1)
    print("books read:", nbooks)
    print("base words:", len(out), "| names left out:", len(names), "| not in the data:", len(unknown))
    print("share of all words in the stories covered by the most used N base words:", marks)
    print("used in only one book:", sum(1 for x in out if x["books"] == 1))


if __name__ == "__main__":
    main()
