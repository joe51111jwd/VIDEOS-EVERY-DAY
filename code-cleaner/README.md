# Lossless (the Code Cleaner video)

Rewrite everything. Lose nothing.
Any AI can rewrite code. Lossless runs the old and the new version of every function on the same 1,000+ generated inputs, keeps a rewrite only when every output matches, and leaves alone anything it can't prove (a function that reads the clock, say). The same proof lets it port code to another language.

- Name: lossless compression shrinks a file and gets every bit back; Lossless shrinks your code and keeps every behavior. Working title was Code Cleaner.
- Mark: two identical halves that lock along a stepped seam (the indent of a line of code). Old and new are the same shape and fit with nothing lost; the seam glows when they lock. A real 3D model (`src/src/v2/Logo3D.tsx`, three.js), not a flat icon.
- Song: *Public Service Announcement*, Jay-Z (The Black Album, 2003, album version). James's own file; never committed here.
- Look (rough 2): a black 3D stage with a camera that never stops moving, depth of field, floating bokeh, film grain. Geist type with lit gradient fills, the code itself as a landscape you fly over. Every number on screen comes from `rig/`.

## Cut (rough 2, 35 s, 16:9)

The song plays straight through. Only its opening words are kept; the beat drops on the name and the logo locks right there.

| beats | shot |
| --- | --- |
| 0-4 | flying low over the codebase: "Your AI wrote 48,213 lines." |
| 4-6 | the halves lock on the drop: **Lossless** |
| 6-10 | the app rewrites a 220-line function to 57, "Rewrites every function. Proves nothing broke." |
| 10-12 | pull back over every file: 1,839 functions rewritten, every one proven |
| 12-16 | "Other tools refactor and hope." gets sliced; "Lossless rewrites and proves." |
| 16-22.5 | old vs new on the same inputs, one per beat; input #5 is 2¢ off, macro on the cent, "Off by 2¢. Rewrite rejected." |
| 22.5-28 | it rewrites again: 1,000 of 1,000 identical |
| 28-32 | 1,000 tiles flip green: "Rewrite kept." |
| 32-36 | `Date.now()`: "Can't prove it? Won't touch it." |
| 36-40 | the card flips from TypeScript to Rust: 3.7× faster, still identical |
| 40-44 | the whole codebase turns over: "Zero behavior changed." |
| 44-48 | "Rewrite everything. Lose nothing." |
| 48-52 | end card; the seam and the codebase light up on the last hit |

## The demo is real

`rig/` holds the code the film shows, and the numbers on screen come from running it:

- `checkout.messy.ts` (220 lines, AI-style) and `checkout.clean.ts` (57 lines, the rewrite).
- `prove.ts` runs both on generated carts with fast-check and fails on the first output that differs: `npx tsx prove.ts 100000 7` passes, and the "attempt 1" rewrite with the New York tax rounded from 887.5 to 888 basis points fails on input #5, 2 cents off.
- `checkout.rs` is the Rust port; `port_prove.ts` checks it against the TypeScript on 50,000 inputs and `bench.ts` times both (Rust 99 ns vs 368 ns for the original, "3.7×").
- `dump.ts` writes the 1,000 rows the proof streams (`src/src/data/harness.json`).

## Build

```bash
cd src && npm install
node tools/highlight.mjs && node tools/repo.mjs      # code.json and the fictional repo (northstar-shop)
python3 tools/audio/edit.py <demucs stems dir> public/music/psa-edit.wav
node stills.mjs LL out/f 0 100 300 600 1040          # check stills first
npx remotion render src/index.ts LL out/ll.mp4       # then mux the song with ffmpeg
```

- `src/src/v2/` is rough 2: `Film2.tsx` (the cut), `shots1.tsx` / `shots2.tsx` (one component per shot), `kit.tsx` (the CSS 3D stage, depth of field, type, grain), `parts.tsx` (code landscape, app window), `Logo3D.tsx`.
- Rough 1 (giant diff-style type) is still in `src/src/film/` and `src/src/type/`.
- Timing lives in `src/src/lib/beats.ts`: beat `k` of the film is `0.1 + k * 0.672` s, on the song's own kick grid.

## Sound

`src/tools/audio/edit.py` cuts the song to 35.0 s from James's file and its demucs two-stem split (kept outside the repo): the opening line, then bars 1-8 straight through from the drop (vocals out after the opening words, so the beat carries it), one splice into the song's last four bars, where the beat stops on its own.
The splice is on a downbeat, keeps the 4-bar loop in phase, and crossfades for 26 ms ending just before the incoming kick. Mastered to -14 LUFS.
