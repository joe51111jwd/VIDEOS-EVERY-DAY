# Tab to Finish

Idea from the idea bank (`ideas/tab-to-finish.md`): do any repetitive computer task twice, press Tab, and it does the rest and checks every row.

- `tab-to-finish-9x16.mp4`: the main cut, vertical 1080x1920, 27 s, 60 fps, with sound. Captions, the Tab key and the end card's last line sit above the bottom of the frame that X's player covers.
- `tab-to-finish-16x9.mp4`: the same film laid out for landscape, 1920x1080.
- `src-film/`: Remotion source and the audio pipeline.

## The film

Every shot is built in Remotion (no screen recording): a Mac desktop with a file browser holding 200 generated invoices and a spreadsheet. Frame 0 is the money shot (the "Tab to do the other 198" pill), then it rewinds to the setup: two rows copied by hand, the pill, the Tab key, 198 rows filling while each one gets checked (two flagged), the done pill, and the end card.

## Rebuild

```
cd src-film
npm i
npx remotion render src/index.ts TabToFinish out/ttf_16x9_raw.mp4 --codec=h264 --crf=16 --concurrency=4 --muted
npx remotion render src/index.ts TabToFinish916 out/ttf_9x16_raw.mp4 --codec=h264 --crf=16 --concurrency=4 --muted
```

- All timing lives in `src/ttf/timeline.ts`; the layouts are `L916` (vertical), `L16` and `L45` (a 4:5 layout, composition `TabToFinish45`) there, cameras in `src/ttf/Film.tsx`.
- Stills for checking: `node stills.mjs TabToFinish 0 9.9 16.3` writes `out/s_*.png`.

Audio (python with numpy, scipy, soundfile, pyloudnorm; ffmpeg on PATH):

1. `ELEVENLABS_API_KEY=... python audio/gen.py` makes the SFX and score into `audio/raw/` (already committed as mp3).
2. Convert them: `for f in audio/raw/*.mp3; do ffmpeg -y -i $f -ar 48000 -ac 2 ${f%.mp3}.wav; done`
3. `node audio/dump.mjs` writes `audio/timeline.json` from the film's timeline (click, paste and row times).
4. `python audio/mix.py` then `python audio/master.py audio/mix.wav audio/master.wav` (-14 LUFS, -1 dBTP).
5. `ffmpeg -i out/ttf_9x16_raw.mp4 -i audio/master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest tab-to-finish-9x16.mp4` (same for 16x9; every layout shares one soundtrack)

The score is ElevenLabs music (`music_1`), offset 0.6 s so its first big low hit lands on the Tab press, with a low-pass "held breath" before it.
Never put an API key in this folder.
