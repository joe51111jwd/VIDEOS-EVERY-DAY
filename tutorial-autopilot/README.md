# Tutorial Autopilot

Paste any tutorial. It does the steps in your apps, on your files, or teaches you click by click.
Hook: **Stop pausing tutorials.**

- Song: *Technologic*, Daft Punk (Human After All, 2005), the track from Apple's 2005 iPod "Pop-Lock" ad.
  Vocals stay in: every verb the robot says lands on the frame where the app does that action (measured on the vocal stem).
  The song is James's own file and is never committed here.
- Type: the brand-reel kit from James's `james-design` skill (warm paper, Geist Mono caps typed letter by letter with an orange accent tail and a glitch cursor, editorial page furniture, construction-view logo), not the stretched Apple caps of the earlier videos.
- Picture: Remotion 4 in `src/`. The Blender donut (the hero tutorial) is real Blender 5.2 output from `src/tools/blender/donut.py` (Workbench viewport frames for each step, Cycles for the final render).

## Build

```bash
cd src && npm install
OUT=/tmp/bl PY=python bash tools/blender/render.sh && ln -s /tmp/bl public/bl
npx remotion render src/index.ts Film out/film.mp4 --muted   # then mux the song with ffmpeg
```

Timing lives in `src/src/film/onsets.json` (each verb's first-consonant onset, measured on the vocal stem); every scene reads it through `at(i)`, and the end card through `hit()`.

## Song edit

The film runs on a 34 s condensed cut of the song, built from demucs stems so each stem can switch at its own point on a bar line:
robot-only start (source beats 0-15), the drum verse (80-95, drums from the song's own entrance at 64), the end of the last verse into the break (464-499), then the song's real last bar (596-600).
Verbs stay in order, one per beat, so every action still lands on its verb.

```bash
MUSIC=/path/to/work/ python tools/audio/medley_build.py     # needs technologic.wav, grid.npy and stems/htdemucs/technologic/*.wav there
MUSIC=/path/to/work/ python tools/audio/medley_verbs.py
MUSIC=/path/to/work/ python tools/audio/medley_onsets.py src/film/onsets.json
```
