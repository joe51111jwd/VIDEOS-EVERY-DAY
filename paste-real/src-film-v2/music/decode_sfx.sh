#!/bin/bash
# decode_sfx.sh: decodes the Riff video's ElevenLabs sound effects (riff/sfx/*.mp3 in this repo) into the raw
# 48 kHz stereo float files sfx_mix.py reads from music/sfx/.
set -e
cd "$(dirname "$0")"
mkdir -p sfx
for f in ../../../riff/sfx/*.mp3; do
  ffmpeg -v error -y -i "$f" -ar 48000 -ac 2 -f f32le "sfx/$(basename "$f" .mp3).f32"
done
ls sfx
