#!/usr/bin/env python3
"""Tests for tools/site_audit.py: each check on small made-up books (one thing wrong at a time), the media reading
helpers on made-up files, and the online check against a little local server.   python3 tools/site_audit_test.py"""
import http.server
import os
import struct
import sys
import threading

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import site_audit as A

passed = failed = 0


def ok(cond, name, extra=None):
    global passed, failed
    if cond:
        passed += 1
    else:
        failed += 1
        print("  FAIL:", name, "" if extra is None else extra)


def book(**kw):
    pages = [{"type": "cover", "title": "The Red Kite", "subtitle": "A Kite Goes Up", "image": "https://m.test/books/fiction/red-kite-assets/cover.jpg"}]
    for i in range(1, 8):
        pages.append({"text": "The kite went up and up in the sky. It was a good day for a kite.", "image": "https://m.test/books/fiction/red-kite-assets/page%d.jpg" % i})
    per = "The kite went up and up in the sky. It was a good day for a kite.".split()
    audio = {str(i): "https://m.test/books/fiction/red-kite-audio/page_%d.mp3" % i for i in range(8)}
    times = {"0": [0.0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8]}
    for i in range(1, 8):
        times[str(i)] = [round(j * 0.4, 2) for j in range(len(per))]
    qs = {"comprehension": [], "grammar": [], "vocabulary": []}
    for kind, n in (("comprehension", 5), ("grammar", 3), ("vocabulary", 3)):
        for j in range(n):
            ch = ["It went up", "It sat down on the grass", "It fell"]
            right = (j + len(kind)) % 3
            ch = [("A longer wrong choice here %d" % x) if x != right else "right %d" % x for x in range(3)]
            qs[kind].append({"q": "Question %s %d?" % (kind, j), "choices": ch, "answer": right, "evidencePage": 1, "hint": "h", "explain": "e"})
    b = {"pages": pages, "quizzes": qs, "audio": audio, "times": times, "marks": None, "teach_audio": {}}
    b.update(kw)
    return b


def run(b, slug="red-kite"):
    F = A.Findings()
    r = A.check_book(F, slug, "fiction", b, {"slug": slug})
    A.check_text(F, slug, "fiction", b)
    return F, r


def has(F, check, sev, frag):
    return any(x["check"] == check and x["sev"] == sev and frag in x["msg"] for x in F.items)


F, _ = run(book())
ok(not [x for x in F.items if x["sev"] == "error"], "a clean made-up book has no errors", [x for x in F.items if x["sev"] == "error"])

b = book(); b["audio"]["2"] = b["audio"]["2"] + "?v=2"
ok(not has(run(b)[0], "narration", "error", "mp3 link"), "narration: a cache-busting ?v=2 after .mp3 is fine")
b = book(); b["audio"]["2"] = "https://m.test/books/fiction/red-kite-audio/page_2.wav"
ok(has(run(b)[0], "narration", "error", "mp3 link"), "narration: a link that is not an mp3")
b = book(); del b["audio"]["3"]
ok(has(run(b)[0], "narration", "error", "page 3 has no audio"), "narration: a page without audio")
b = book(); b["times"]["2"] = b["times"]["2"][:-3]
ok(has(run(b)[0], "narration", "error", "page 2 has 17 words but 14 word times"), "narration: fewer word times than words")
b = book(); b["times"]["4"][5] = 0.1
ok(has(run(b)[0], "narration", "error", "go backwards"), "narration: word times that go backwards")
b = book(); b["times"]["5"] = [t + (5 if j > 6 else 0) for j, t in enumerate(b["times"]["5"])]
ok(has(run(b)[0], "narration", "warn", "silence"), "narration: a long silence")
b = book(); b["times"]["6"] = [round(j * 0.1, 2) for j in range(14)]
ok(has(run(b)[0], "narration", "warn", "words a second"), "narration: a page read far too fast")
b = book(); b["pages"][0]["text"] = "A line the cover does not read."
ok(has(run(b)[0], "pages", "warn", "cover narration does not read"), "pages: cover text that is not narrated")
b = book(); b["pages"][2]["image"] = b["pages"][1]["image"]
ok(has(run(b)[0], "pages", "warn", "same picture"), "pages: the same picture twice")
b = book(); b["pages"][3]["image"] = "data:image/svg+xml,%3Csvg%3E"; b["pages"][4]["image"] = "data:image/svg+xml,%3Csvg%3E"
ok(not has(run(b)[0], "pages", "warn", "same picture") and not has(run(b)[0], "pages", "info", "folder"), "pages: pictures drawn inside the page are not flagged")
b = book(); b["pages"][2]["text"] = ""
ok(has(run(b)[0], "pages", "error", "page 2 has no text"), "pages: an empty page")

b = book(); b["quizzes"]["grammar"][0]["answer"] = 5
ok(has(run(b)[0], "quiz", "error", "is not one of the"), "quiz: an answer outside the choices")
b = book(); b["quizzes"]["vocabulary"][1]["choices"] = ["Same.", "same", "Other."]; b["quizzes"]["vocabulary"][1]["answer"] = 2
ok(not has(run(b)[0], "quiz", "error", "the same"), "quiz: choices that differ only by a capital are not the same")
b = book(); b["quizzes"]["vocabulary"][1]["choices"] = ["Same.", "Same.", "Other."]; b["quizzes"]["vocabulary"][1]["answer"] = 2
ok(has(run(b)[0], "quiz", "error", "the same"), "quiz: two identical choices")
b = book()
for kind in b["quizzes"]:
    for it in b["quizzes"][kind]:
        it["answer"] = 1
        it["choices"] = ["Wrong one here", "The right choice", "Wrong two here"]
ok(has(run(b)[0], "quiz", "warn", "choice B"), "quiz: nearly all right answers in the same place")
b = book()
for kind in b["quizzes"]:
    for j, it in enumerate(b["quizzes"][kind]):
        it["answer"] = j % 3
        it["choices"] = ["short", "short", "short"]
        it["choices"][it["answer"]] = "a much much longer right answer"
F, r = run(b)
ok(has(F, "quiz", "warn", "longest choice") and r["longest"] == r["nq"], "quiz: the right answer always the longest")
b = book(); b["quizzes"]["comprehension"][0]["evidencePage"] = 99
ok(has(run(b)[0], "quiz", "warn", "page 99"), "quiz: evidence page that does not exist")

b = book(); b["pages"][1]["text"] = "The the kite went up. It was a good day for a kite and a bird."
ok(has(run(b)[0], "text", "warn", "twice in a row"), "text: a word said twice")
b = book(); b["pages"][1]["text"] = "He said \"hello. It was a good day for a kite and a bird."
ok(has(run(b)[0], "text", "warn", "odd number of quotation"), "text: an odd quote")
b = book(); b["pages"][1]["text"] = "Hello {{name}}, it was a good day for a kite and a bird today."
ok(has(run(b)[0], "text", "error", "template"), "text: leftover template text")
b = book(); b["pages"][1]["text"] = "Grandma makes banana bread and nana naan with the other kids in the sunny kitchen."
ok(not has(run(b)[0], "text", "error", "template"), "text: banana and naan are not NaN")

# a book left out of the catalog on purpose is a note, not a warning
import tempfile
_orig = A.known_unlisted
A.known_unlisted = lambda: {"draft-one"}
F = A.Findings()
A.check_catalog(F, {}, [], ["/x/site/books/fiction/draft-one.html", "/x/site/books/fiction/forgotten.html"])
ok(any(x["slug"] == "draft-one" and x["sev"] == "info" for x in F.items) and any(x["slug"] == "forgotten" and x["sev"] == "warn" for x in F.items), "catalog: an unlisted book on the known list is a note, any other is a warning", F.items)
A.known_unlisted = _orig

# reading level
ok(A.syllables("kite") == 1 and A.syllables("computer") == 3 and A.syllables("the") == 1 and A.syllables("elephant") == 3, "syllables of a few words")
easy = book(); hard = book()
for p in hard["pages"][1:]:
    p["text"] = "The extraordinary circumstances surrounding the government's unprecedented announcement necessitated considerable deliberation among representatives."
ok(A.level_of(hard, {})["fk"] > A.level_of(easy, {})["fk"] + 4, "level: a hard page reads much higher than an easy one")

# --- the media helpers
def frame_header(bitrate_index=9):  # MPEG-1 layer 3, 44.1 kHz, stereo
    return bytes([0xFF, 0xFB, bitrate_index << 4, 0x64])


cbr = frame_header(9) + b"\x00" * 100  # 128 kbit/s
ok(abs(A.mp3_seconds(cbr, 16000) - 1.0) < 0.001, "mp3: 16000 bytes at 128 kbit/s is one second")
xing = frame_header(9) + b"\x00" * 32 + b"Xing" + struct.pack(">I", 1) + struct.pack(">I", 100) + b"\x00" * 50
ok(abs(A.mp3_seconds(xing, 999999) - 100 * 1152 / 44100) < 0.001, "mp3: the frame count of a VBR header gives the length")
id3 = b"ID3\x03\x00\x00\x00\x00\x00\x0a" + b"\x00" * 10 + cbr
ok(abs(A.mp3_seconds(id3, 32000) - 2.0) < 0.001, "mp3: an ID3 tag in front is skipped")
ok(A.mp3_seconds(b"not an mp3 at all, just text", 1000) is None, "mp3: not an mp3 gives None")
png = b"\x89PNG\r\n\x1a\n" + struct.pack(">I", 13) + b"IHDR" + struct.pack(">II", 800, 600)
ok(A.jpeg_png_size(png) == (800, 600), "image size from a PNG")
jpg = b"\xff\xd8\xff\xe0" + struct.pack(">H", 16) + b"JFIF\x00" + b"\x00" * 9 + b"\xff\xc0" + struct.pack(">HBHH", 17, 8, 600, 900) + b"\x00" * 20
ok(A.jpeg_png_size(jpg) == (900, 600), "image size from a JPEG", A.jpeg_png_size(jpg))

# --- the online check against a local server
FILES = {
    "/ok.jpg": (b"\xff\xd8" + b"\x00" * 20000, "image/jpeg"),
    "/tiny.jpg": (b"\xff\xd8" + b"\x00" * 100, "image/jpeg"),
    "/ok.mp3": (frame_header(9) + b"\x00" * 15996 * 2, "audio/mpeg"),   # 2.0 s
    "/long.mp3": (frame_header(9) + b"\x00" * 15996 * 20, "audio/mpeg"),  # 20 s
    "/short.mp3": (frame_header(9) + b"\x00" * 7996, "audio/mpeg"),      # 0.5 s but 3 s of words
}
# real sound for the pause check (needs ffmpeg): 2 s of tone, 4 s of silence, 2 s of tone; and 8 s of tone
HAS_FFMPEG = bool(A.ffmpeg_exe())
def tone_mp3(spec):
    r = A.subprocess.run([A.ffmpeg_exe(), "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", spec, "-f", "mp3", "pipe:1"], capture_output=True)
    return r.stdout
if HAS_FFMPEG:
    FILES["/pause.mp3"] = (tone_mp3("sine=f=440:d=2,apad=pad_dur=4[a];sine=f=440:d=2[b];[a][b]concat=n=2:v=0:a=1"), "audio/mpeg")
    FILES["/steady.mp3"] = (tone_mp3("sine=f=440:d=8"), "audio/mpeg")


class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_GET(self):
        if self.path not in FILES:
            self.send_response(404); self.end_headers(); return
        data, ct = FILES[self.path]
        rng = self.headers.get("Range")
        if rng:
            a, b2 = [int(x) for x in rng.split("=")[1].split("-")]
            chunk = data[a:b2 + 1]
            self.send_response(206)
            self.send_header("Content-Range", "bytes %d-%d/%d" % (a, a + len(chunk) - 1, len(data)))
        else:
            chunk = data
            self.send_response(200)
        self.send_header("Content-Type", ct)
        self.send_header("Content-Length", str(len(chunk)))
        self.end_headers()
        self.wfile.write(chunk)


srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()
base = "http://127.0.0.1:%d" % srv.server_address[1]
pages = [{"type": "cover", "title": "t", "image": base + "/ok.jpg"}, {"text": "x", "image": base + "/tiny.jpg"}, {"text": "x", "image": base + "/gone.jpg"}, {"text": "x", "image": "data:image/svg+xml,%3Csvg%3E"}]
bk = {"pages": pages, "audio": {"0": base + "/ok.mp3", "1": base + "/long.mp3", "2": base + "/short.mp3", "3": base + "/gone.mp3"},
      "times": {"0": [0, 1.0, 1.8], "1": [0, 1.0, 2.0], "2": [0, 1.0, 3.0], "3": [0, 1.0]}}
F = A.Findings()
n = A.check_media(F, {"red-kite": bk}, {"red-kite": {"topic": "fiction"}}, 4, {})
msgs = [x["msg"] for x in F.items]
ok(n == 7 and not any("svg" in m for m in msgs), "online: every picture and audio file on the server was asked about; a drawn-in picture was not", (n, msgs))
ok(any("page 2" in m and "does not answer" in m and "picture" in m for m in msgs), "online: a missing picture", msgs)
ok(any("page 1" in m and "only 102 bytes" in m for m in msgs), "online: a tiny picture", msgs)
ok(any("audio of page 1" in m and "runaway tail" in m for m in msgs), "online: audio far longer than its last word (a runaway tail)", msgs)
ok(any("audio of page 2" in m and "cut off" in m for m in msgs), "online: audio shorter than its word times", msgs)
ok(any("audio of page 3" in m and "does not answer" in m for m in msgs), "online: a missing audio file", msgs)
ok(not any("audio of page 0" in m for m in msgs), "online: a good clip raises nothing", msgs)

# --- the long pauses, listened to (ffmpeg)
if HAS_FFMPEG:
    sil, dur = A.silences(FILES["/pause.mp3"][0])
    ok(dur and 7.5 < dur < 8.6 and len(sil) == 1 and 1.8 < sil[0][0] < 2.3 and 5.7 < sil[0][1] < 6.3, "pause: ffmpeg finds the 4 s of silence in the middle", (sil, dur))
    ok(A.silences(FILES["/steady.mp3"][0])[0] == [], "pause: a steady sound has no silence")
    ok(A.silence_at([(2.0, 6.0)], 1.9, 6.0)[0] >= 3.9 and A.silence_at([(2.0, 6.0)], 6.5, 7.0)[0] == 0, "pause: only the silence between the two words counts")
    tm = [0.0, 0.8, 1.6, 6.0, 7.0]
    bk2 = {"pages": [{"type": "cover", "title": "t"}, {"text": "one two three four five"}, {"text": "one two three four five"}],
           "audio": {"1": base + "/pause.mp3", "2": base + "/steady.mp3"}, "times": {"1": tm, "2": tm}}
    F = A.Findings()
    rows = []
    A.check_media(F, {"red-kite": bk2}, {"red-kite": {"topic": "fiction"}}, 2, {}, rows)
    msgs = [x["msg"] for x in F.items]
    ok(any(m.startswith("page 1: the audio really is silent") and "'three'" in m and "trim" in m for m in msgs), "pause: a real silence in the audio is to be trimmed", msgs)
    ok(any(m.startswith("page 2: the word times jump 4.4 s") and "only the word times" in m for m in msgs), "pause: no silence in the audio, only the word times are off", msgs)
    ok([(r["page"], r["fix"], r["after_word"]) for r in rows] == [(2, "realign", 3), (1, "trim", 3)] and 3.5 < rows[1]["real_silence"] < 4.5, "pause: the list for the fixing tool", rows)
else:
    print("  (ffmpeg not installed: the pause checks are skipped)")
srv.shutdown()

print("%d passed, %d failed" % (passed, failed))
sys.exit(1 if failed else 0)
