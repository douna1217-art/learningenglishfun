"""Read a Grade 4+ numbered-section storybook straight from an Apple Pages (.pages) file, for the
cases where the docx is not available (Pages can run on the author's Mac but not here).

A .pages file is a zip. Index/Document.iwa holds the text as one run per section ("<heading>",
two body paragraphs, a figure-number marker "1".."7"), plus a first run with the title and a
label line; Data/image1-NN.png ... image8-NN.png are the full-size pictures in document order
(cover, then pages 1 to 7). The picture descriptions ("Story illustration ...") are returned
too, so the order can be checked against the text.

parse_pages(path) -> dict(title, label, sections=[{heading, paras, marker}], alts, images)
read_pages(path)  -> (title, subtitle, page_texts[7], image_blobs[8]) like k1_storybook.read_docx;
                     the Pages label line ("Grade 4 Fiction") is not a subtitle, so the subtitle
                     comes back empty and the batch data must give one (subtitle="...").
"""
import os
import re
import tempfile
import zipfile

from iwa_text import iwa

_RUN = re.compile(rb"[\x20-\x7e\xc2-\xf4\x80-\xbf\n\t]{12,}")


def parse_pages(path):
    z = zipfile.ZipFile(path)
    fd, tmp = tempfile.mkstemp(suffix=".iwa")
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(z.read("Index/Document.iwa"))
        blob = iwa(tmp)
    finally:
        os.remove(tmp)
    runs = [m.group(0).decode("utf-8", "ignore") for m in _RUN.finditer(blob)]
    blocks = [r for r in runs if "￼" in r]               # U+FFFC marks an inline picture: one run per section
    alts = [r for r in runs if "Story illustration" in r]
    names = sorted((x for x in z.namelist() if re.match(r"Data/image\d+-\d+\.png$", x)),
                   key=lambda x: int(re.search(r"image(\d+)-", x).group(1)))

    def lines(s):
        return [l.strip() for l in s.replace("￼", "").split("\n") if l.strip()]

    head = [re.sub(r"^[^A-Za-z]+", "", l) for l in lines(blocks[0])]    # a protobuf byte can stick to a line start
    head = [l for l in head if l]
    sections = []
    for b in blocks[1:]:
        ls = lines(b)
        sections.append(dict(heading=ls[0], paras=ls[1:-1], marker=ls[-1]))
    alt_text = [re.sub(r"^.*?Story illustration\s*", "", a, flags=re.S).rstrip("R").strip() for a in alts]
    return dict(title=head[0], label=head[1] if len(head) > 1 else "", sections=sections,
                alts=alt_text, images=[z.read(x) for x in names])


def read_pages(path):
    d = parse_pages(path)
    name = os.path.basename(path)
    assert len(d["sections"]) == 7, (name, "expected 7 sections, got", len(d["sections"]))
    assert len(d["images"]) == 8, (name, "expected 8 images, got", len(d["images"]))
    texts = []
    for i, s in enumerate(d["sections"], 1):
        assert len(s["paras"]) == 2, (name, i, "expected 2 body paragraphs, got", len(s["paras"]))
        assert re.sub(r"\D", "", s["marker"]) == str(i), (name, i, "bad figure marker", s["marker"])
        texts.append(f"{i}. {s['heading']}\n{s['paras'][0]}\n{s['paras'][1]}")
    return d["title"], "", texts, d["images"]
