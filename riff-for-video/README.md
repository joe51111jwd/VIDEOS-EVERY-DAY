# Riff for Video

Daily X video for **Riff for Video**: you scrub with two fingers and say the edit, and it lands. No voiceover and no sound effects: the only sound is the song, and the picture tells the story on mute. Every line you say shows up as words in Riff's voice pill, flies into the timeline or the viewer, and the edit happens the moment it lands, on the beat.

**The final: the talk cut** (`riff-for-video-talk.mp4`, N.Y. State of Mind, about 34.7 s, 9:16 1080x1920 at 30 fps). It opens on "No keyboard. Just speak." over the last bar of the groove. The song drops to its drum break and a letterboxed street-court dancer clip is said into shape on the hits: "Make it vertical." (the 16:9 frame fills the phone, following her), "Make it cinematic." (the grade wipes on), "Slow it down." (35%), "Cut it to the beat." The piano slams back in on a New York montage cut to the loop (Times Square, the 6 train, the dancers, the skyline) while a counter runs up edits and stays at 0 keystrokes. The camera then pulls back: the picture was Riff's viewer all along. Two fingers scrub the timeline, "Freeze it here." freezes the kick, "Shake on every kick." drops a shake keyframe on every kick, and "Title it “New York.”" adds the title. The camera dives back in and the finished cut plays, then "50% faster" and Riff: "No keyboard. Just speak." Source: `src/src/talk/` (composition `TALK`), rendered by `tools/render-talk.sh`; footage crops come from `tools/footage/talk.py` (Mixkit New York clips, not committed).

The first concept, "Say it, it lands", has two cuts, one per song, 9:16 1080x1920 at 30 fps:

- **Black Skinhead** (about 30 s): the drums stop as the camera pulls back into Riff and slam back in on "Cut here."; the bass drop lands the push into the vertical cut.
- **N.Y. State of Mind** (about 31.7 s): starts on the hook, the bass drops out mid-build and comes back on the push-in.

## What the first concept shows

Cold open: the finished vertical edit plays, the camera pulls back into Riff and rewinds it to the raw clips. Then: cut here · lose that · make it moody · play that back · undo that cut · trim two seconds · slow-mo from here… to there · open color, deep teal, little less · find where she smiles (search by what's in the clip) · cut it to the beat · make it vertical (a 9:16 crop that follows the surfer), and the vertical cut plays full screen. The end card counts up to "50% faster", then Riff: "No keyboard. Just speak."

## Source (`src/`)

Remotion 4. `src/Film.tsx` is the film; the editor lives in `src/edit/`:

- `timing.ts`: one plan per song (beat length, where each edit lands in beats, the drop, the vertical montage) and the words of each line
- `model.ts`: the edit as data (timeline states, playhead, looks)
- `Viewer`, `Timeline`, `ColorPage`, `Browser`, `Trackpad`, `HUD` (the voice pill and the flying words), `Window`, `Finale` (reframe, vertical cut, end card)
- `env/<song>.json`: the song's loudness, drawn as the music track's waveform
- `sfx.ts`: which second of the song plays at film 0

The song is picked with input props. Audio is mixed outside Remotion:

```bash
cd src && npm install
# the instrumental: separate the song (demucs htdemucs_ft), then keep drums + bass + other
python3 tools/song.py skin <stem dir> <excerpt second at film 0>      # → out/music/skin.wav, src/edit/env/skin.json
npx remotion render src/index.ts RFV out/skin-silent.mp4 --props='{"song":"skin"}' --muted
SONG=skin tools/cues.sh && python3 tools/mix.py                        # → out/mix.wav, -14 LUFS / -1 dBTP
tools/encode.sh out/skin-silent.mp4 out/mix.wav out/riff-for-video-skin  # full quality + phone copy
```

`SONG=nysom` / `{"song":"nysom"}` for the other cut. `SONG=skin tools/probe.sh` prints every event time and the timeline under the crop.

Footage: free-license surf clips from Mixkit. The extracted frames, sprites and 4K crops (`public/f`, `public/s`, `public/v`) are not committed because the license doesn't allow redistributing the clips on their own; `tools/footage/` rebuilds them (`fetch.sh` downloads the clips, `extract.sh` builds the three looks, `vert.py` the vertical crops). The songs, their stems and the instrumentals are never committed.
