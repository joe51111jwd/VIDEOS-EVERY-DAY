# Tutorial Autopilot

Paste any tutorial. It does the steps in your apps, on your files, or teaches you click by click.
Hook: **Stop pausing tutorials.**

- Song: *Technologic*, Daft Punk (Human After All, 2005), the track from Apple's 2005 iPod "Pop-Lock" ad.
  Vocals stay in: every verb the robot says (for example "zoom it" and "paste it") lands on the frame where the app does that action.
  The song is James's own file and is never committed here.
- Type: the brand-reel kit from James's `james-design` skill (warm paper, Geist Mono caps typed letter by letter with an orange accent tail and a glitch cursor, editorial page furniture, construction-view logo), not the stretched Apple caps of the earlier videos.
- Picture: Remotion 4 in `src/`. The Blender donut (the hero tutorial) is real Blender 5.2 output from `src/tools/blender/donut.py` (Workbench viewport frames for each step, Cycles for the final render).

## Build

```bash
cd src && npm install
OUT=/tmp/bl PY=python bash tools/blender/render.sh && ln -s /tmp/bl public/bl
npx remotion render src/index.ts Film out/film.mp4 --muted   # then mux the song with ffmpeg
```

Timing lives in `src/src/film/onsets.json` (each verb's first-consonant onset, measured on the vocal stem); every scene reads it through `at(i)`.
