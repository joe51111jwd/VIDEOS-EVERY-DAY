# Demand Test

Type any idea. By morning, real strangers have tried to pay for it.
It builds the store and the ads, spends the budget you set, and comes back with a verdict: build it or kill it.
Hook: **Stop building things nobody wants.**

- Song: *Money*, Pink Floyd (The Dark Side of the Moon, 1973, album version). The cash register loop is the intro, and every ring lands on a payment coming in on screen.
  The song is James's own file and is never committed here.
- Type: a new style for this video. Every line of text sits on a split-flap board (letters rattle through the drum and land on the beat), counters roll on flaps, and scene changes flip the whole frame like one giant flap. The six colour chips are the Dark Side prism.
- Picture: Remotion 4 in `src/`. The board is `src/src/flap/Flap.tsx` (per-cell flip timelines from messages), the app screens are in `src/src/ui/`, and the cut is `src/src/film/Film.tsx`.
- Product photos of the socks (`public/img/socks_*.jpg`) were generated for the demo store.

## Build

```bash
cd src && npm install
node stills.mjs Film out/f 15 300 900          # check stills first
npx remotion render src/index.ts Film out/film.mp4 --muted   # then mux the song with ffmpeg
```

Timing lives in `src/src/film/beats.ts`: `at(bar, beat)` on a 7/4 grid. Until the song lands it is a placeholder at 122 BPM.
