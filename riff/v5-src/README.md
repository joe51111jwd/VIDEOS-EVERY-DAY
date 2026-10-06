# Riff hype video v5 (source)

Remotion 4.0.533 project. Composition `RiffV5` (src/v5/Film5.tsx), 1920x1080, 30 fps, 38.47 s.
Final film: /mnt/project-files/riff/riff-hype-video-v5.mp4 (the silent cut James approved is riff-hype-video-v5-preview.mp4).

Setup in a fresh container:
- `npm i`, then render: `npx remotion render src/index.ts RiffV5 out/riff_v5_raw.mp4 --codec=h264 --crf=16 --audio-bitrate=320k --concurrency=4` (~18 min).
- remotion.config.ts points at the preinstalled headless Chromium (`/opt/pw-browsers/...`).
- Timing data (voice cues, scene times, sound effect cues) lives in src/v5/timeline.ts, which has no React/DOM imports.

Audio pipeline (python with numpy, scipy, soundfile, librosa, pyloudnorm; ffmpeg on PATH):
1. Voices: ElevenLabs deliveries in /mnt/project-files/riff/voices/ (spec: /mnt/project-files/riff/voice-lines.json,
   speech-to-text word times in voices/stt/). The final film uses the eleven_v3 dialogue takes (Maya = Jessica, Riff = Chris):
   `python tts/v5_ingest.py maya=take3 riff=take3 menu=take2 big=take1 perfect=take1 onit=take1 sure=take2 boc=take1`
   writes public/v5/vo/<id>.wav, tts/v5_words.json and tts/v5_sources.json. Lines are cut on the transcript word times.
2. `ROOM=0 python tts/v5_mix.py` de-esses and lays the lines on the timeline (tts/v5_lines.json `at`/`gap`), writes
   public/v5/vo.wav (stereo), src/v5/cues.json (visual cue times derive from these) and src/v5/env5.json (voice levels + music ducking).
3. `python tts/v5_audio_ingest.py music_b title=10.20 jump=15.9:2.141` brings the SFX (public/v5/sfx, src/v5/sfx.json,
   src/v5/sfx_meta.json) and music B, placed so its title hit lands on the title card and, after a one-bar repeat,
   its final hit lands on the end card wordmark.
4. `python tts/v5_preview_mix.py` rebuilds the mix in numpy from the same timeline and prints stem loudness (out/mix/preview.wav).
5. Master and remux: resample preview.wav to 48 kHz, `python tts/v5_master.py in.wav out.wav` (-14 LUFS, -1 dBTP), then
   `ffmpeg -i out/riff_v5_raw.mp4 -i out.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest riff_v5.mp4`.

Product photos: Blender (pip `bpy` 4.5 in a venv), scenes in blender/ (cup.py, latte.py, grade.py, batch*.sh).
Never put the ElevenLabs key in any file here; read it from the ELEVENLABS_API_KEY environment variable.
