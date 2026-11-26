#!/usr/bin/env python3
"""Builds ONE self-contained HTML file of the home page, to look at in a file preview (for example the Claude app), where only the one file is
opened and nothing next to it can be loaded.

Everything the page loads from the site is put inside it: every script (book lists, pets, badges ...), the fonts, the covers of the Math books
(drawn as SVG files) and the practice games, which open in the reader window as they do on the site. Book pages themselves are not included
(they would make the file huge), and nothing that needs the network works (sign-in, sync, the sight-words lessons).

    python3 tools/build_preview.py OUT.html

The file is only for looking; it is not part of the site and is not committed.
"""
import base64
import json
import os
import re
import sys

SITE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site")


def read(rel):
    with open(os.path.join(SITE, rel), encoding="utf-8") as f:
        return f.read()


def script_safe(js):
    return js.replace("</script", "<\\/script")


def fonts_css():
    css = read("fonts/fonts.css")

    def inline(m):
        url = m.group(1).strip("'\"")
        path = os.path.join(SITE, url.lstrip("/")) if url.startswith("/") else os.path.join(SITE, "fonts", url)
        if not os.path.isfile(path):
            return m.group(0)
        with open(path, "rb") as f:
            return "url(data:font/woff2;base64," + base64.b64encode(f.read()).decode() + ")"
    return re.sub(r"url\(([^)]+)\)", inline, css)


def with_fonts(html):
    return re.sub(r'<link href="/fonts/fonts\.css" rel="stylesheet">', lambda m: "<style>" + FONTS + "</style>", html)


def inline_scripts(html):
    def one(m):
        src = m.group(1).split("?")[0]
        if src.startswith(("http:", "https:", "//", "/")) or not os.path.isfile(os.path.join(SITE, src)):
            return ""  # from the network, or not in this checkout: left out
        js = read(src)
        if src == "books/math-stories/books.js":
            # the Math covers are SVG files next to the books: put them in as data
            def cover(c):
                p = os.path.join(SITE, c.group(1))
                if not os.path.isfile(p):
                    return c.group(0)
                with open(p, "rb") as f:
                    return '"cover":"data:image/svg+xml;base64,' + base64.b64encode(f.read()).decode() + '"'
            js = re.sub(r'"cover":"(books/math-stories/[^"]+\.svg)"', cover, js)
        return "<script>/* " + src + " */\n" + script_safe(js) + "\n</script>"
    return re.sub(r'<script src="([^"]+)"></script>', one, html)


def game_files(html):
    files = sorted(set(re.findall(r"file:'(math-game/[^']+\.html)'", html)))

    def one(f):
        g = read(f)
        base = os.path.dirname(f)
        # a game's own scripts (math-game/engine.js) go inside it too
        g = re.sub(r'<script src="([^":/?]+\.js)"></script>',
                   lambda m: "<script>" + script_safe(read(os.path.join(base, m.group(1)))) + "</script>" if os.path.isfile(os.path.join(SITE, base, m.group(1))) else m.group(0), g)
        return with_fonts(g)
    return {f: one(f) for f in files if os.path.isfile(os.path.join(SITE, f))}


def build():
    html = read("index.html")
    games = game_files(html)
    html = with_fonts(inline_scripts(html))
    # the games open in the reader window from inside this file
    hook = ("<script>/* preview: the practice games are inside this file */\n"
            "window.__PREVIEW_FILES=" + script_safe(json.dumps(games)) + ";\n"
            "(function(){ if(typeof openGame!=='function') return;\n"
            " var og=openGame, cb=closeBook, fr=function(){ return document.getElementById('readerFrame'); };\n"
            " openGame=function(x){ og(x); var t=window.__PREVIEW_FILES[x.file]; if(t){ fr().srcdoc=t; } };\n"
            " closeBook=function(){ fr().removeAttribute('srcdoc'); return cb.apply(this,arguments); };\n"
            "})();\n</script>")
    html = html.replace("</body>", hook + "\n</body>") if "</body>" in html else html + hook
    banner = ('<div style="background:#1E2A4A;color:#FFD84A;font:700 13px/1.4 sans-serif;padding:6px 12px;text-align:center">'
              'Preview 预览 · only for looking: book pages, sign-in and sight words do not open here 书本页面、登录和单词课在预览里打不开</div>')
    html = re.sub(r"(<body[^>]*>)", lambda m: m.group(1) + banner, html, count=1)
    return html


FONTS = fonts_css()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    out = build()
    with open(sys.argv[1], "w", encoding="utf-8") as f:
        f.write(out)
    print("%s: %.1f MB" % (sys.argv[1], len(out.encode()) / 1e6))
