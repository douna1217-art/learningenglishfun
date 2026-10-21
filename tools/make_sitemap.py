#!/usr/bin/env python3
"""Regenerate site/sitemap.xml and site/sitemap.txt from the shelf registries.

The sitemap lists the home page plus every book that is registered in a
site/books/<topic>/books.js (the same list the shelves show), so a book that is
unlisted from a shelf drops out of the sitemap and a new book appears in it.
Before this script existed the sitemap was written by hand once (2026-09-21) and
went stale: 169 newer books were missing and three unlisted books were still in.

lastmod is the date of the last commit that touched the file; a file that is new
or changed and not committed yet gets today's date.

Usage (from anywhere):   python3 tools/make_sitemap.py
tools/k1_storybook.py `register` runs it after adding books.
"""
import datetime
import json
import os
import subprocess

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(REPO, "site")
BASE = "https://learning-english-fun.com"


def registered_files():
    out = []
    books = os.path.join(SITE, "books")
    for topic in sorted(os.listdir(books)):
        path = os.path.join(books, topic, "books.js")
        if not os.path.exists(path):
            continue
        text = open(path, encoding="utf-8").read()
        entries = json.JSONDecoder().raw_decode(text[text.index("= [") + 2:])[0]
        out += [b["file"] for b in entries]
    return out


def last_commit_dates():
    """-> ({repo-relative path: YYYY-MM-DD of its newest commit}, set of paths changed but not committed)."""
    log = subprocess.run(["git", "log", "--name-only", "--pretty=format:@%cs", "--", "site"],
                         cwd=REPO, capture_output=True, text=True, check=True).stdout
    dates, day = {}, None
    for line in log.splitlines():
        if line.startswith("@"):
            day = line[1:]
        elif line.strip() and line not in dates:
            dates[line.strip()] = day
    status = subprocess.run(["git", "status", "--porcelain", "--", "site"],
                            cwd=REPO, capture_output=True, text=True, check=True).stdout
    dirty = {l[3:].strip().strip('"') for l in status.splitlines() if l.strip()}
    return dates, dirty


def main():
    dates, dirty = last_commit_dates()
    today = datetime.date.today().isoformat()

    def lastmod(rel):
        repo_rel = "site/" + rel
        return today if repo_rel in dirty or repo_rel not in dates else dates[repo_rel]

    files = ["index.html"] + registered_files()
    missing = [f for f in files if not os.path.exists(os.path.join(SITE, f))]
    assert not missing, ("registered files missing on disk", missing[:5])
    urls = [BASE + "/" if f == "index.html" else f"{BASE}/{f}" for f in files]
    assert len(set(urls)) == len(urls), "duplicate URLs"

    xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for f, u in zip(files, urls):
        priority = "1.0" if f == "index.html" else "0.7"
        xml.append(f"  <url><loc>{u}</loc><lastmod>{lastmod(f)}</lastmod><priority>{priority}</priority></url>")
    xml.append("</urlset>")
    with open(os.path.join(SITE, "sitemap.xml"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(xml) + "\n")
    with open(os.path.join(SITE, "sitemap.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(urls) + "\n")
    print(f"sitemap: {len(urls)} URLs ({len(urls) - 1} books + home)")


if __name__ == "__main__":
    main()
