#!/usr/bin/env python3
"""Build, upload and register Kindergarten / Grade 1 Fiction storybooks from
source .docx files (the K-3 humanities format; docx_storybook_pipeline.py
covers the Grade 4+ numbered-section format).

Committed, permanent replacement for build_kf_m.py / upload_kf_m.py /
build_g1.py / upload_g1.py, which only lived in the session scratchpad and
kept being evicted between sessions.

Source docx shape (both grades): 16 non-empty paragraphs = title, subtitle,
then 7 pages x 2 paragraphs, plus 8 embedded images in cover, page1..page7
order.
  kindergarten: each page is ONE paragraph holding two lines joined by a line
                break, followed by a bare page-number marker ("1".."7").
  grade1:       each page is TWO consecutive narrative paragraphs, no marker.

Per-grade metadata (books.js + page chrome): see GRADES below. Both use
subject "Fiction" and the tab label "Reading".

Data module (a .py file you write per batch) must define

    BOOKS = {"<slug>": dict(docx="<Name-Without--Storybook>",
                            focus=[3 words], comprehension=[5 Q],
                            grammar=[3 Q], vocabulary=[3 Q]), ...}

using the Q / T / LOOK / LAST helpers below (`from k1_storybook import Q, T,
LOOK, LAST`; the old `from kf_data import ...` still works). Write every item
as (correct, distractor, distractor); answer positions are assigned by
quiz_balance.rebalance_quizzes, never by hand.

TTS safety rules baked into `audit`: no parentheses or ellipses in anything
voiced, and the English half of a grammar teach must not use a colon before
its example (write ", like <b>word</b>." instead).

Usage (run from anywhere):
  python3 tools/k1_storybook.py audit    --grade grade1 --data batch.py
  python3 tools/k1_storybook.py build    --grade grade1 --data batch.py
  python3 tools/k1_storybook.py upload   --grade grade1 --data batch.py [--dry-run]
  python3 tools/k1_storybook.py register --grade grade1 --data batch.py

`build` refuses to overwrite an existing book (an already-voiced book loses
ALL its audio if re-rendered); pass --force only if you mean it. Source docx
files are read from --docx-dir (default ~/Desktop) as <docx>-Storybook.docx.
"""
import argparse
import copy
import importlib.util
import io
import json
import os
import re
import shutil
import subprocess
import sys

TOOLS = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(TOOLS)
sys.path.insert(0, TOOLS)

GRADES = {
    "kindergarten": dict(grade="Kindergarten", band="Early Reader", minutes="6 min", fmt="marker"),
    "grade1": dict(grade="Grade 1", band="Beginning Reader", minutes="7 min", fmt="paired"),
}
MODULES = ["Listen", "Read", "Reading", "Vocabulary"]
FICTION_DIR = os.path.join(REPO, "site", "books", "fiction")
CREDS_FILE = os.path.join(REPO, ".cos_credentials")


# ---------------------------------------------------------------- quiz helpers
def Q(q, correct, d1, d2, ev, hint, explain, teach=None):
    it = {"q": q, "choices": [correct, d1, d2], "answer": 0,
          "evidencePage": ev, "hint": hint, "explain": explain}
    if teach:
        it["teach"] = teach
    return it


def T(en, cn):
    return f"{en}<span class='cn'>{cn}</span>"


LOOK = lambda n: f"Look at page {n}."
LAST = "Look at the last page."


# ---------------------------------------------------------------- docx parsing
def slugify(title):
    s = title.lower().replace("’", "").replace("'", "")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def read_docx(path, fmt):
    """-> (title, subtitle, page_texts[7], image_blobs[8]) for one docx."""
    import docx
    from docx.oxml.ns import qn
    d = docx.Document(path)
    rels = d.part.rels
    paras, imgs = [], []
    for p in d.paragraphs:
        for b in p._p.findall(".//" + qn("a:blip")):
            rid = b.get(qn("r:embed"))
            if rid and rid in rels:
                imgs.append(rels[rid].target_part.blob)
        if p.text.strip():
            paras.append(p.text)
    name = os.path.basename(path)
    assert len(paras) == 16, (name, "expected 16 paragraphs, got", len(paras))
    assert len(imgs) == 8, (name, "expected 8 images, got", len(imgs))
    pages = []
    for i in range(7):
        a, b = paras[2 + i * 2], paras[3 + i * 2]
        if fmt == "marker":
            assert b.strip() == str(i + 1), (name, i, "bad page marker", b)
            assert a.count("\n") == 1, (name, i, "expected two lines", a)
            pages.append(a)
        else:
            pages.append(a + "\n" + b)
    return paras[0], paras[1], pages, imgs


def docx_path(spec, docx_dir):
    return os.path.join(os.path.expanduser(docx_dir), f"{spec['docx']}-Storybook.docx")


def load_books(path):
    # old batch files say `from kf_data import Q, T, LOOK, LAST`
    sys.modules.setdefault("kf_data", sys.modules[__name__])
    spec = importlib.util.spec_from_file_location("k1_batch_data", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.BOOKS


def cos_creds():
    creds = {}
    for line in open(CREDS_FILE, encoding="utf-8"):
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            creds[k] = v
    return creds


def balanced_quizzes(slug, spec):
    from quiz_balance import rebalance_quizzes
    quizzes = {k: copy.deepcopy(spec[k]) for k in ("comprehension", "grammar", "vocabulary")}
    rebalance_quizzes(quizzes, seed=sum(map(ord, slug)))
    return quizzes


# ---------------------------------------------------------------- commands
def cmd_audit(args, books):
    """Answer-position balance, correctness listing, TTS-hazard checks."""
    cjk = re.compile(r"[一-鿿]")
    problems = []
    for slug, spec in books.items():
        quizzes = balanced_quizzes(slug, spec)
        counts = {}
        print("=" * 70)
        for cat, n in (("comprehension", 5), ("grammar", 3), ("vocabulary", 3)):
            if len(quizzes[cat]) != n:
                problems.append((slug, cat, f"expected {n} items, got {len(quizzes[cat])}"))
            for it in quizzes[cat]:
                counts[it["answer"]] = counts.get(it["answer"], 0) + 1
                print(f"  [{cat}][{it['answer']}] {it['q']} -> {it['choices'][it['answer']]}")
                if not 1 <= it["evidencePage"] <= 7:
                    problems.append((slug, it["q"], "evidencePage out of range"))
                if len(set(it["choices"])) != 3:
                    problems.append((slug, it["q"], "duplicate choices"))
                for f in ("q", "hint", "explain"):
                    x = it.get(f, "")
                    if re.search(r"[()]|\.\.\.|…", x):
                        problems.append((slug, f, f"paren/ellipsis in {x!r}"))
                t = it.get("teach")
                if t:
                    i = t.find("<span class='cn'>")
                    en = re.sub(r"<[^>]+>", "", t[:i])
                    if i == -1 or cjk.search(t[:i]) or not cjk.search(t[i:]):
                        problems.append((slug, "teach", "en/cn split wrong"))
                    if ":" in en or re.search(r"[()]", en):
                        problems.append((slug, "teach", f"colon/paren in {en!r}"))
        print(slug, "answer positions:", dict(sorted(counts.items())))
        if max(counts.values()) - min(counts.values()) > 1:
            problems.append((slug, "balance", str(counts)))
        if len(spec["focus"]) != 3:
            problems.append((slug, "focus", "expected 3 focus words"))
    for p in problems:
        print("PROBLEM:", p)
    print("AUDIT", "FAILED" if problems else "OK")
    return 1 if problems else 0


def cmd_build(args, books):
    from human_book_template import render
    cfg = GRADES[args.grade]
    out = os.path.abspath(os.path.expanduser(args.out))
    domain = cos_creds()["COS_DOMAIN"]
    todo = []
    for slug, spec in books.items():
        title, subtitle, texts, _ = read_docx(docx_path(spec, args.docx_dir), cfg["fmt"])
        assert slugify(title) == slug, (slugify(title), slug)
        todo.append((slug, spec, title, subtitle, texts))
    clash = [s for s, *_ in todo if os.path.exists(os.path.join(out, s + ".html"))]
    if clash and not args.force:
        for s in clash:
            voiced = "window.RV_AUDIO=" in open(os.path.join(out, s + ".html"), encoding="utf-8").read()
            print(f"REFUSING: {s}.html already exists" + (" and is VOICED (re-render would wipe all audio)" if voiced else ""))
        print("Nothing written. Use --force only if you are sure.")
        return 1
    os.makedirs(out, exist_ok=True)
    for slug, spec, title, subtitle, texts in todo:
        base = f"https://{domain}/books/fiction/{slug}-assets"
        pages = [{"type": "cover", "title": title, "subtitle": subtitle, "image": f"{base}/cover.jpg"}]
        pages += [{"text": t, "image": f"{base}/page{i}.jpg"} for i, t in enumerate(texts, start=1)]
        html = render(slug, title, subtitle, pages, balanced_quizzes(slug, spec),
                      spec["focus"], cfg["grade"], "Fiction", tab_label="Reading")
        with open(os.path.join(out, slug + ".html"), "w", encoding="utf-8") as f:
            f.write(html)
        print("wrote", slug, len(html), "|", title, "|", subtitle)
    return 0


def cmd_upload(args, books):
    from PIL import Image
    cfg = GRADES[args.grade]
    client = None
    creds = cos_creds()
    if not args.dry_run:
        from qcloud_cos import CosConfig, CosS3Client
        client = CosS3Client(CosConfig(Region=creds["COS_REGION"], SecretId=creds["COS_SECRET_ID"],
                                       SecretKey=creds["COS_SECRET_KEY"]))

    def to_jpg(blob, q=88, max_dim=1600):
        im = Image.open(io.BytesIO(blob)).convert("RGB")
        if max(im.size) > max_dim:
            r = max_dim / max(im.size)
            im = im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, format="JPEG", quality=q)
        return im, buf.getvalue()

    n = 0
    for slug, spec in books.items():
        title, _, _, imgs = read_docx(docx_path(spec, args.docx_dir), cfg["fmt"])
        assert slugify(title) == slug, (slugify(title), slug)
        names = ["cover"] + [f"page{k}" for k in range(1, 8)]
        for name, blob in zip(names, imgs):
            im, data = to_jpg(blob)
            if client:
                client.put_object(Bucket=creds["COS_BUCKET"], Body=data,
                                  Key=f"books/fiction/{slug}-assets/{name}.jpg", ContentType="image/jpeg")
            n += 1
        im, data = to_jpg(imgs[0])
        if client:
            with open(os.path.join(FICTION_DIR, slug + ".jpg"), "wb") as f:
                f.write(data)
        print(slug, "dry-run: 8 images converted" if args.dry_run else "uploaded 8 + local cover", im.size)
    print("total", "converted" if args.dry_run else "uploaded", n)
    return 0


def cmd_register(args, books):
    cfg = GRADES[args.grade]
    path = os.path.join(FICTION_DIR, "books.js")
    content = open(path, encoding="utf-8").read()
    last = None
    for m in re.finditer(r'\{"slug":"[a-z0-9-]+"[^}]*?"grade":"%s"[^}]*?\}' % re.escape(cfg["grade"]), content):
        last = m
    if last is None:
        print("No existing", cfg["grade"], "entry found in books.js")
        return 1
    entries = []
    for slug, spec in books.items():
        if f'"slug":"{slug}"' in content:
            print("already registered, skipping:", slug)
            continue
        title, subtitle, _, _ = read_docx(docx_path(spec, args.docx_dir), cfg["fmt"])
        assert slugify(title) == slug, (slugify(title), slug)
        entries.append(json.dumps({
            "slug": slug, "title": title, "subtitle": subtitle, "grade": cfg["grade"],
            "readingBand": cfg["band"], "minutes": cfg["minutes"], "modules": MODULES, "status": "ready",
            "cover": f"books/fiction/{slug}.jpg", "file": f"books/fiction/{slug}.html"},
            ensure_ascii=False, separators=(",", ":")))
    if not entries:
        print("nothing to register")
        return 0
    new = content[:last.end()] + ",\n  " + ",\n  ".join(entries) + content[last.end():]
    slugs = re.findall(r'"slug":"([a-z0-9-]+)"', new)
    dups = sorted({s for s in slugs if slugs.count(s) > 1})
    assert not dups, ("duplicate slugs", dups)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new)
    if shutil.which("node"):
        subprocess.run(["node", "--check", path], check=True)
    print(f"registered {len(entries)} book(s) after the last {cfg['grade']} entry;",
          sum(1 for _ in re.finditer(re.escape('"grade":"%s"' % cfg["grade"]), new)), cfg["grade"], "books,",
          len(slugs), "Fiction books total")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("command", choices=["audit", "build", "upload", "register"])
    ap.add_argument("--grade", required=True, choices=sorted(GRADES))
    ap.add_argument("--data", required=True, help="batch data .py defining BOOKS")
    ap.add_argument("--docx-dir", default="~/Desktop")
    ap.add_argument("--out", default=FICTION_DIR, help="build output folder")
    ap.add_argument("--force", action="store_true", help="build: overwrite existing books")
    ap.add_argument("--dry-run", action="store_true", help="upload: convert only, no network/disk writes")
    args = ap.parse_args()
    books = load_books(os.path.abspath(args.data))
    sys.exit({"audit": cmd_audit, "build": cmd_build, "upload": cmd_upload, "register": cmd_register}[args.command](args, books))


if __name__ == "__main__":
    main()
