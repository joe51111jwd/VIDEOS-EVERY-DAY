# Riff hype video v5 (source)

Remotion 4.0.533 project. Composition `RiffV5` (src/v5/Film5.tsx), 1920x1080, 30 fps, 38.5 s.

Setup in a fresh container:
- `npm i` (add `@remotion/motion-blur@4.0.533` is not needed; blur is custom), then render:
  `npx remotion render src/index.ts RiffV5 out/riff_v5.mp4 --codec=h264 --crf=16 --audio-bitrate=320k --concurrency=4`
- remotion.config.ts points at the preinstalled headless Chromium (`/opt/pw-browsers/...`).

Audio pipeline (python with numpy, scipy, soundfile; ffmpeg on PATH):
1. Voices: ElevenLabs deliveries in /mnt/project-files/riff/voices/ (spec: /mnt/project-files/riff/voice-lines.json).
   `python tts/v5_ingest.py dialogue 1` (or `v2_primary`) writes public/v5/vo/<id>.wav + tts/v5_words.json.
2. `ROOM=0 python tts/v5_mix.py` lays lines on the timeline (tts/v5_lines.json `at`/`gap`), writes public/v5/vo.wav,
   src/v5/cues.json (visual cue times derive from these) and src/v5/env5.json (voice levels).
3. `python tts/v5_audio_ingest.py music_a 0` brings ElevenLabs SFX (public/v5/sfx + src/v5/sfx.json) and music (public/v5/music.wav).

Product photos: Blender (pip `bpy` 4.5 in a venv), scenes in blender/ (cup.py, latte.py, grade.py, batch*.sh).
Never put the ElevenLabs key in any file here; read it from the ELEVENLABS_API_KEY environment variable.
