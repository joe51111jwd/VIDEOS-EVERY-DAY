# Code Cleaner

Rewrites your codebase. Proves nothing broke.
Any AI can rewrite code. Code Cleaner runs the old and the new version of every function on the same 1,000+ generated inputs, keeps a rewrite only when every output matches, and leaves alone anything it can't prove (a function that reads the clock, say). The same proof lets it port code to another language.

- Song: *Public Service Announcement*, Jay-Z (The Black Album, 2003, album version). The opening line plays over the hook and the beat drops on the name, which is where the app first appears. James's own file; never committed here.
- Type: a new style for this video. Every line of text is a line of a git diff blown up to billboard size: red minus lines get struck through, green plus lines wipe in, amber `!` lines are the ones it won't touch. Bricolage Grotesque (condensed, 800) for the type, JetBrains Mono for the app.
- Picture: Remotion 4 in `src/`. Diff rows are `src/src/type/Diff.tsx`, the app screens are `src/src/ui/`, the cut is `src/src/film/Film.tsx`.

## The demo is real

`rig/` holds the code the film shows, and the numbers on screen come from running it:

- `checkout.messy.ts` (220 lines, AI-style) and `checkout.clean.ts` (57 lines, the rewrite).
- `prove.ts` runs both on generated carts with fast-check and fails on the first output that differs: `npx tsx prove.ts 100000 7` passes, and the "attempt 1" rewrite with the New York tax rounded from 887.5 to 888 basis points fails on input #5, 2 cents off.
- `checkout.rs` is the Rust port; `port_prove.ts` checks it against the TypeScript on 50,000 inputs and `bench.ts` times both (Rust 99 ns vs 368 ns for the original, "3.7×").
- `dump.ts` writes the 1,000 rows the proof table streams (`src/src/data/harness.json`).

## Build

```bash
cd src && npm install
node tools/highlight.mjs && node tools/repo.mjs      # code.json and the fictional repo (northstar-shop)
python3 tools/audio/edit.py <demucs stems dir> public/music/psa-edit.wav
node stills.mjs CC out/f 0 100 300 600 880           # check stills first
npx remotion render src/index.ts CC out/cc.mp4       # then mux the song with ffmpeg
```

Timing lives in `src/src/lib/beats.ts`: beat `k` of the film is `0.1 + k * 0.672` s, on the song's own kick grid.

## Sound

`src/tools/audio/edit.py` cuts the song to 29.7 s from James's file and its demucs two-stem split (kept outside the repo):
the opening line over the quiet intro, the drop (bars 1-4), the last two bars of the breakdown with the rap taken out (the beat drops out right as the proof catches the bad rewrite), the beat slamming back (bars 25-26), then the song's last two bars, where the beat stops on its own.
Every splice is on a downbeat, keeps the 4-bar loop in phase, and crossfades for 26 ms ending just before the incoming kick.
