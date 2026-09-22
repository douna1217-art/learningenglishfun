"""Extract text + images from numbered-section storybook .docx files
(Fiction/SEL/Social Studies, Grade 4+ source format).

Committed, permanent copy -- see human_book_template.py for why. Source
docx shape: a title paragraph, a subtitle paragraph, then 7 numbered
sections, each = a heading paragraph "N. Section Title", two body
paragraphs, and a bare-number marker paragraph (a figure marker,
stripped), plus one embedded image per section and a cover image
(8 images total, in cover/page1..page7 order).
"""
import os
import re

import docx
from docx.oxml.ns import qn

DESK = "/Users/nadou/Desktop"


def extract(path):
    d = docx.Document(path)
    rels = d.part.rels
    imgs = []
    paras = []
    for p in d.paragraphs:
        t = p.text.strip()
        blips = p._p.findall('.//' + qn('a:blip'))
        for b in blips:
            rid = b.get(qn('r:embed'))
            if rid and rid in rels:
                imgs.append(rels[rid].target_part.blob)
        if t:
            paras.append(t)
    return paras, imgs


def parse_book(paras, imgs):
    title = paras[0]
    subtitle = paras[1]
    rest = paras[2:]
    pages = []
    i = 0
    sec = 1
    while sec <= 7:
        head = rest[i]
        p1 = rest[i + 1]
        p2 = rest[i + 2]
        marker = rest[i + 3] if i + 3 < len(rest) else ""
        assert re.match(rf'^{sec}\b', head), f"section {sec} head mismatch: {head!r}"
        assert marker.strip() == str(sec), f"section {sec} marker mismatch: {marker!r} (head={head!r})"
        htext = re.sub(rf'^{sec}\s+', f'{sec}. ', head)
        pages.append({"head": htext, "p1": p1, "p2": p2})
        i += 4
        sec += 1
    return title, subtitle, pages


if __name__ == "__main__":
    import sys
    for fn in sys.argv[1:]:
        paras, imgs = extract(os.path.join(DESK, fn) if not os.path.isabs(fn) else fn)
        title, subtitle, pages = parse_book(paras, imgs)
        print(f"\n===== {fn} =====")
        print("TITLE:", title)
        print("SUBTITLE:", subtitle)
        print("images:", len(imgs))
        for pg in pages:
            print()
            print(pg["head"])
            print("  P1:", pg["p1"])
            print("  P2:", pg["p2"])
