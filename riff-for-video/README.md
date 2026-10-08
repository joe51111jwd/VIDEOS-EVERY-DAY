# Riff for Video

Daily X video for **Riff for Video**: you scrub with two fingers and say the edit out loud, and it lands while the clip plays. One take in a dark-mode Mac editor, 15 spoken commands in about 31 seconds, then the vertical cut it made plays full screen.

Lead format 9:16, 1080x1920, 30 fps.

## What it shows

Cut here · lose that · make it moody · play that back · remove that cut · trim two seconds off the end · slow-mo from here… to there · open color, deep teal, little less · go back · find the shot where she smiles (search by what's in the clip) · cut it to the beat · make a vertical one for X (auto-reframe that follows the surfer).

## Source (`src/`)

Remotion 4. `src/Film.tsx` is the film; the editor lives in `src/edit/`:

- `timing.ts`: when each line is spoken (`LINE_AT`) and when each edit lands (`ACT`)
- `model.ts`: the edit as data (timeline states, playhead, looks)
- `Viewer`, `Timeline`, `ColorPage`, `Browser`, `Trackpad`, `HUD` (captions), `Window`, `Finale` (reframe, vertical cut, end card)
- `sfx.ts`: sound cues and the music offset

Audio is mixed outside Remotion so it can be re-cut without re-rendering:

```bash
cd src && npm install
npx remotion render src/index.ts RFV out/silent.mp4 --muted
tools/cues.sh && python3 tools/mix.py [song.wav] [offset_s]   # → out/mix.wav, -14 LUFS / -1 dBTP
tools/encode.sh out/silent.mp4 out/mix.wav out/riff-for-video  # full quality + phone copy
```

Voice: ElevenLabs (via Higgsfield), takes trimmed by `tools/voice.py`.

Footage: free-license surf clips from Mixkit. The extracted frames, sprites and 4K crops (`public/f`, `public/s`, `public/v`) are not committed because the license doesn't allow redistributing the clips on their own; `tools/footage/` rebuilds them (`fetch.sh` downloads the clips, `extract.sh` builds the three looks, `vert.py` the vertical crops). The soundtrack is never committed.
