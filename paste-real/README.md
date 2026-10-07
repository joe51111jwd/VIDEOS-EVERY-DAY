# Paste Real

Idea from the idea bank (`ideas/paste-real.md`): grab any design you can see on your screen (an ad, a website, a frame of a video) and paste it as a real, editable design: separate layers in Figma, a real chart in Keynote, working code, a real table.

- `paste-real-v2-9x16.mp4`: **the current cut**, vertical 1080x1920, 56.3 s, 60 fps, with sound.
- `brand/`: the brand boards (identity, icon/colour/type, the product's UI language).
- `src-film-v2/`: its Remotion source, the song edit, the sound design and the Blender scenes.
- `paste-real-9x16.mp4` and `src-film/`: the first cut (27.7 s), kept for reference; notes at the bottom.

## v2: the film

Cut to MF DOOM's "ALL CAPS" instrumental (Madvillainy, prod. Madlib), no lyrics. The song plays from just before the drums to its first stop, then jumps to the pause at 1:43 and plays the ending through the trumpets to the last note (`music/edl_jump.json`). Every move is on the song's grid (87.4 BPM).

The demos happen on one realistic Mac desktop (portrait, two windows stacked), with the keystroke shown in a pill at the seam: ⌘C "Copied as a design · 8 layers", ⌘V "Pasted as Figma layers".

1. 0 to 8.9 s: an ad for a sparkling water (LULL, made up) in a social feed in Safari. Paste Real's selection is on it from the first frame, "This ad is just pixels." ⌘C on the first drum hit, the copy lifts off the page and docks in the pill, ⌘V lands it in Figma as eight real layers. Then four edits on the beat: the headline retyped ("Drink slow." to "Sip slower."), the background recoloured, the can rotated, the frame dragged from feed size to story size. Captions: "Real text.", "Real colors.", "Real layers.", "Real layout."
2. 8.9 to 14.4 s: a chart copied out of a paused conference talk on a website, pasted into Keynote as a native chart; Edit Chart Data, 52 becomes 68 and the bar grows. "Real data."
3. 14.4 to 19.9 s: a landing page's hero copied in Safari, pasted into VS Code as a React + Tailwind component, it compiles and runs on localhost. "Real code."
4. 19.9 to 21.7 s: three quick pastes: a quote slide into Google Slides, a poster into Canva, a table into Sheets.
5. The song stops: "Copy anything you can see." on black, and it gets selected. The beat slams back on orange: "Paste it real.", one finished paste after another (in Figma, Keynote, VS Code, Google Slides, Canva, Sheets), all six at once ("Wherever you work."), then the name.
6. The ending: the selection draws itself and every copy plays inside it. On the trumpets it lights up on paper: the app icon, "Paste Real", "Copy anything you can see. Paste it real.", ⌘C ⌘V on the beat, then "Get early access" and "Coming to Mac", and a fade on the last note.

Nothing in it is AI-generated. The cans and the app icon are Blender renders (`blender/`), the apps and websites are drawn in Remotion, and the sounds are synthesized UI sounds (`music/sfx_mix.py`) plus a few ElevenLabs effects from the Riff video. All brands and people in it (LULL, Signal Summit, Northwind, Northstar, Acme, Brightline) are made up.

## v2: the brand

- Name: Paste Real. Line: "Copy anything you can see. Paste it real."
- The mark: a dashed selection the moment it becomes a real object; one corner stays a selection, because what you grabbed is still yours to change.
- Colour: Signal `#FF5A1F` (the paste; used once per screen), Ink `#0C0C0E`, Paper `#F4F2ED`, Graphite `#5C5B61`, Tint `#FFE6DA`, Mist `#A9A8AD`.
- Type: Geist for everything, Geist Mono for data (layer counts, sizes).
- Boards in `brand/` are rendered from `src-film-v2/src/board/Board.tsx` (`node boards.mjs Board1 Board2 Board3`).

## v2: retention check

Higgsfield's Virality Predictor scores clips up to 16 s, so each 15.9 s window was scored on its own (same model and method as v1, numbers are comparable):

| cut, window | overall | hook (0-3 s) | engagement | viral potential |
| --- | --- | --- | --- | --- |
| v2 rough cut, 0 to 15.9 s | 44 | 27 | 37 | 45 |
| v2 final, 0 to 15.9 s | 44 | 27 | 37 | 44 |
| v2 rough cut, 15.9 to 31.8 s | 52 | 37 | 48 | 49 |
| v1 final, 0 to 15.9 s | 46 | 32 | 39 | 43 |
| Riff v5, for reference | 46 | 26 | 41 | 51 |

The opening stays at hook 27 whatever was tried: the selection on the ad from the first frame plus the "This ad is just pixels." caption, starting the clip on the first drum hit, and a full-screen opening on the ad that pulls back to the Mac. The scorer rates light, UI-heavy seconds lower (the curve sits at 0.33 through the Safari and Figma opening and climbs to 0.40 to 0.42 from the dark conference video on), so the realistic-Mac opening costs a few hook points against v1's full-screen ad. For scale, Riff v5, the quality reference for these videos, scores hook 26.

## v2: rebuild

The song is not in this repo. Put the instrumental at `src-film-v2/music/allcaps_src48.wav` (48 kHz stereo WAV), then:

```
cd src-film-v2
npm i
python3 music/edit.py music/edl_jump.json     # cuts the song: music/bed.wav + src/cues.json (film-time cues)
npx remotion render src/index.ts Film out/film.mp4 --codec=h264 --crf=18 --concurrency=4 --muted
music/decode_sfx.sh                           # the Riff sound effects (../../riff/sfx) as raw audio for the mix
npx esbuild src/film/sfxcues.ts --bundle --platform=node --format=cjs --outfile=out/sfxcues.cjs && node out/sfxcues.cjs > music/sfx_cues.json
cd music && python3 sfx_mix.py bed.wav sfx_cues.json mix.wav && ./master.sh mix.wav master.wav && cd ..
./mux.sh out/film.mp4 music/master.wav paste-real-v2-9x16.mp4 18
```

- Every cue is on the song's grid: `at(bar, beat)` in `src/lib/beat.ts`. The opening's cues are in `src/film/T.ts`, every later scene's in `src/film/timing.ts`; the sound mix reads the same module (`sfxcues.ts`), so a sound can't drift off its picture.
- Scenes: `Hook.tsx` (the ad into Figma), `Scene2.tsx` (chart into Keynote), `Scene3.tsx` (website into VS Code), `Montage.tsx`, `Finale.tsx` (the stop and the slam), `Outro.tsx` (the trumpets). Shared machinery (camera, cursor, the keystroke pill, the flying copy, captions) is in `kit.tsx`; the Mac (menu bar, windows, cursor) in `src/mac/mac.tsx`; the brand (mark, wordmark, keycaps, the selection) in `src/brand/brand.tsx`.
- `blender/can.py` renders the cans in Cycles on a shadow catcher (the label is `label.html`, screenshotted by `render.mjs`), `blender/icon3d.py` the app icon; `tools/feather_can.py` fades the catcher's floor so only a soft contact shadow stays.
- Stills for checking: `node stills.mjs Film 0.3 9.5 22.7` writes `out/s_Film_*.png`. The brand boards: `node boards.mjs Board1 Board2 Board3`.
- `remotion.config.ts` points at the Chromium that the cloud container ships; change it or remove the line elsewhere.
- `mux.sh` encodes for X: H.264 in limited-range BT.709 (Remotion writes full range), AAC 256k, faststart. `master.sh` sets -13 LUFS, -1 dBTP.

## v1: the first cut

`paste-real-9x16.mp4`, vertical 1080x1920, 27.7 s, 60 fps, source in `src-film/`.

### The film

Cut to MF DOOM's "ALL CAPS" instrumental (Madvillainy, prod. Madlib), no lyrics. The song runs straight from 0.7 s before the drums come in to its own stop, so there is no fade and X's loop restarts on the intro chord. Every move lands on the song's grid (87.4 BPM): grabs and reveals on snares, one paste per beat in the montage, the song's stop as a silent black card.

1. 0 to 4 s: a flat screenshot of a running-shoe ad in Quick Look. The marquee is already being dragged on frame 0, it grabs on the drums at 0.7 s, the ad comes apart into its layers and lands as an editable design with a Layers panel. The headline gets retyped and flipped to ALL CAPS on the snare, the shoe gets dragged and recolored. Captions: "THIS IS A SCREENSHOT." then "NOW IT'S EDITABLE."
2. A website hero (fictional "Northstar Analytics") grabbed from a browser and pasted into a Figma-style tool as named auto-layout layers, then resized from desktop to mobile and back.
3. A chart slide grabbed off a conference talk video, pasted into a Keynote-style app as a real chart; one bar is edited to 41 and grows on the snare, then the slide goes full screen.
4. One app per beat: Google Slides, Canva, code, Sheets, Notion, Photoshop, then all six as a grid: "ANY APP."
5. The song stops: "COPY ANYTHING YOU CAN SEE." on black, the slam back in: "PASTE IT REAL." with everything that was pasted, then the app icon and "Early access ↓".

The shoe, ad background, stage photo and product photos were generated with Higgsfield (GPT Image); everything else is drawn in Remotion. All brands in it (Halden, Northstar, Growth Summit) are made up.

### Retention check

Higgsfield's Virality Predictor (it takes clips up to 16 s, so the first 15.9 s were scored):

| cut | overall | hook (0-3 s) | engagement | viral potential |
| --- | --- | --- | --- | --- |
| first sample | 42 | 27 | 34 | 41 |
| final | 46 | 32 | 39 | 43 |
| Riff v5, for reference | 46 | 26 | 41 | 51 |
| Tab to Finish, for reference | 47 | 28 | 39 | 49 |

What changed between the two: the payoff moved from 1.9 s to 0.7 s (the song now starts closer to the drums and the grab is already moving on frame 0), and the Keynote stretch, the weakest part of the curve, got camera pushes, a dark keynote slide and a full-screen Play beat.

### Rebuild

The song is not in this repo. Put the instrumental at `src-film/music/allcaps_src48.wav` (48 kHz stereo WAV), then:

```
cd src-film
npm i
python3 music/edit.py music/edl_hook2.json      # cuts the song: music/bed.wav + src/cues.json (film-time cues)
npx remotion render src/index.ts Film out/film_silent.mp4 --codec=h264 --crf=16 --concurrency=4 --muted
python3 audio/mix.py                            # song bed + UI sounds on the same cues: audio/mix.wav
python3 audio/master.py audio/mix.wav audio/master.wav -13   # -13 LUFS, -1 dBTP
./mux.sh out/film_silent.mp4 audio/master.wav paste-real-9x16.mp4 18
```

- Every cue is in `src/pr/T.ts`, read off `src/cues.json`: `at(bar, beat)` is a time on the song's grid, so a different excerpt (another EDL in `music/`) moves the whole film with it.
- `music/cues_src.json` is the beat map of the full track (bars, beats, kick/snare hits, the stops), built by `music/cues_src.py` from the analysis in `music/analysis/`.
- Stills for checking: `node stills.mjs Film 0.7 15.1 22.7` writes `out/s_Film_*.png`.
- `remotion.config.ts` points at the Chromium that the cloud container ships; change it or remove the line elsewhere.
- `mux.sh` encodes for X: H.264 in limited-range BT.709 (Remotion writes full range), AAC 256k, faststart.

UI sounds in `audio/raw/` are ElevenLabs sound effects from the Riff and Tab to Finish videos, plus a synthesized shutter for each grab (`mix.py`).
