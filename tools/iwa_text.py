"""Read an Apple Pages (.pages) document without Pages: a pure-Python reader for its .iwa files
(Snappy-compressed protobuf). Only what tools/pages_storybook.py needs: the decompressed bytes
of an .iwa file. No third-party packages."""
import sys, re, struct
def snappy_decompress(buf):
    # raw snappy block format (no framing)
    i = 0; n = 0; shift = 0
    while True:
        b = buf[i]; i += 1; n |= (b & 0x7F) << shift; shift += 7
        if not b & 0x80: break
    out = bytearray()
    while i < len(buf):
        tag = buf[i]; i += 1; t = tag & 3
        if t == 0:
            ln = tag >> 2
            if ln >= 60:
                nb = ln - 59; ln = int.from_bytes(buf[i:i+nb], "little"); i += nb
            ln += 1; out += buf[i:i+ln]; i += ln
        else:
            if t == 1: ln = ((tag >> 2) & 7) + 4; off = ((tag >> 5) << 8) | buf[i]; i += 1
            elif t == 2: ln = (tag >> 2) + 1; off = int.from_bytes(buf[i:i+2], "little"); i += 2
            else: ln = (tag >> 2) + 1; off = int.from_bytes(buf[i:i+4], "little"); i += 4
            for _ in range(ln): out.append(out[-off])
    assert len(out) == n, (len(out), n)
    return bytes(out)
def iwa(path):
    d = open(path, "rb").read(); i = 0; out = b""
    while i < len(d):
        assert d[i] == 0, "bad chunk header"
        ln = int.from_bytes(d[i+1:i+4], "little"); out += snappy_decompress(d[i+4:i+4+ln]); i += 4 + ln
    return out
def varint(b, i):
    n = 0; s = 0
    while True:
        x = b[i]; i += 1; n |= (x & 0x7F) << s; s += 7
        if not x & 0x80: return n, i
def strings(blob, minlen=40):
    """every length-delimited protobuf field that is valid UTF-8 text of at least minlen chars, found by scanning"""
    found = []
    for m in re.finditer(rb"[\x20-\x7e\xc2-\xf4\x80-\xbf\n\t]{%d,}" % minlen, blob):
        try: found.append(m.group(0).decode("utf-8"))
        except UnicodeDecodeError: pass
    return found
