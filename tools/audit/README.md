# Library health check

`python3 tools/site_audit.py` reads every book and writes `report.md` here (the thing to read) and `report.json` (every finding).
Add `--online` to also ask the media server about every picture and audio file (needs a network that reaches it; GitHub does this by itself on
the 1st of each month, see `.github/workflows/audit.yml`).

`report.md` in this folder is the first run (offline checks only), kept as a starting point to compare with. The files that change on every
run (`report.json`, `levels.json`, `media_cache.json`, `pauses.json`) are not kept in the repository.

`pauses.json` (online run, needs ffmpeg) lists every page whose word times have a gap of more than 3 s, after listening to the audio there:
`"fix": "trim"` means the audio really is silent (the silence can be cut out), `"fix": "realign"` means the audio is fine and only the word times
(used to highlight the words) are off.
