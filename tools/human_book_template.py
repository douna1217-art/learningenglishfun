"""Shared page template for the numbered-section humanities storybook
format: Fiction, SEL, and Social Studies, Grade 4 and up. Renders a full
book HTML page from pages/quizzes data.

This is a committed, permanent copy of the template extraction that has
previously lived only in ephemeral per-session scratchpads and been
reconstructed from a live book many times (see the
gen-book-tpl-reconstruction-checklist and grade456-humanities-book-format
memory files) -- each reconstruction has risked missing a placeholder
substitution. Commit this file and templates/human_book_head.html /
templates/human_book_tail.js instead of re-deriving them next time.

The head/tail were originally extracted from a live SEL book
(both-things-are-true, Grade 4) and cross-verified byte-for-byte
(difflib ratio 1.0) against a live Grade 6 SEL book and a live Grade 5
Social Studies book, confirming the template is genuinely shared across
all three subjects and grades 4-6 -- not just the source book's own
subject.

Usage:
    from human_book_template import render
    html = render(slug, title, subtitle, pages, quizzes, focus_words,
                   grade, subject, tab_label="Story")

`tab_label` defaults to "Story" (the Fiction/SEL convention) -- pass the
subject name explicitly for Social Studies (e.g. tab_label="Social
Studies"), which is a real convention difference, not an oversight.
"""
import json
import os
import re

_DIR = os.path.dirname(os.path.abspath(__file__))
_TEMPLATES = os.path.join(_DIR, "templates")

with open(os.path.join(_TEMPLATES, "human_book_head.html"), encoding="utf-8") as f:
    _HEAD = f.read()
with open(os.path.join(_TEMPLATES, "human_book_tail.js"), encoding="utf-8") as f:
    _TAIL = f.read()

_SUFFIX = "</body>\n</html>\n"


def render(slug, title, subtitle, pages, quizzes, focus_words, grade, subject, tab_label=None):
    if tab_label is None:
        tab_label = "Story"
    focus_re = "|".join(re.escape(w) for w in focus_words if "/" not in w and " " not in w)
    head = (_HEAD.replace("{{TITLE}}", title).replace("{{GRADE}}", grade)
                 .replace("{{SUBJECT}}", subject).replace("{{TAB_LABEL}}", tab_label))
    tail = (_TAIL.replace("{{FOCUS}}", focus_re)
                 .replace("{{SLUG}}", slug)
                 .replace("{{GRADE}}", grade)
                 .replace("{{SUBJECT}}", subject)
                 .replace("{{TAB_LABEL}}", tab_label)
                 .replace("{{TITLE}}", title))
    return (head
            + "const pages=" + json.dumps(pages, ensure_ascii=False)
            + ";\nconst quizzes=" + json.dumps(quizzes, ensure_ascii=False)
            + tail + _SUFFIX)
