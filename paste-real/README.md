# Paste Real

Idea from the idea bank (`ideas/paste-real.md`): grab any design you can see on your screen (an ad, a website, a frame of a video) and paste it as a real, editable design: separate layers in Figma, a real slide in Keynote, shapes in Canva, code.

- `paste-real-9x16.mp4`: the film, vertical 1080x1920, 27.7 s, 60 fps, with sound. Captions sit at the top, clear of the part of the frame X's player covers.
- `src-film/`: Remotion source, the beat map and the audio pipeline.

## The film

Cut to MF DOOM's "ALL CAPS" instrumental (Madvillainy, prod. Madlib), no lyrics. The song runs straight from 0.7 s before the drums come in to its own stop, so there is no fade and X's loop restarts on the intro chord. Every move lands on the song's grid (87.4 BPM): grabs and reveals on snares, one paste per beat in the montage, the song's stop as a silent black card.

1. 0 to 4 s: a flat screenshot of a running-shoe ad in Quick Look. The marquee is already being dragged on frame 0, it grabs on the drums at 0.7 s, the ad comes apart into its layers and lands as an editable design with a Layers panel. The headline gets retyped and flipped to ALL CAPS on the snare, the shoe gets dragged and recolored. Captions: "THIS IS A SCREENSHOT." then "NOW IT'S EDITABLE."
2. A website hero (fictional "Northstar Analytics") grabbed from a browser and pasted into a Figma-style tool as named auto-layout layers, then resized from desktop to mobile and back.
3. A chart slide grabbed off a conference talk video, pasted into a Keynote-style app as a real chart; one bar is edited to 41 and grows on the snare, then the slide goes full screen.
4. One app per beat: Google Slides, Canva, code, Sheets, Notion, Photoshop, then all six as a grid: "ANY APP."
5. The song stops: "COPY ANYTHING YOU CAN SEE." on black, the slam back in: "PASTE IT REAL." with everything that was pasted, then the app icon and "Early access ↓".

The shoe, ad background, stage photo and product photos were generated with Higgsfield (GPT Image); everything else is drawn in Remotion. All brands in it (Halden, Northstar, Growth Summit) are made up.

## Retention check

Higgsfield's Virality Predictor (it takes clips up to 16 s, so the first 15.9 s were scored):

| cut | overall | hook (0-3 s) | engagement | viral potential |
| --- | --- | --- | --- | --- |
| first sample | 42 | 27 | 34 | 41 |
| final | 46 | 32 | 39 | 43 |
| Riff v5, for reference | 46 | 26 | 41 | 51 |
| Tab to Finish, for reference | 47 | 28 | 39 | 49 |

What changed between the two: the payoff moved from 1.9 s to 0.7 s (the song now starts closer to the drums and the grab is already moving on frame 0), and the Keynote stretch, the weakest part of the curve, got camera pushes, a dark keynote slide and a full-screen Play beat.

## Rebuild

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
