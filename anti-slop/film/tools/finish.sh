#!/bin/bash
# Render an episode, mux its soundtrack, and make the two deliverables.
# usage: tools/finish.sh <comp id> <soundtrack.wav> <out basename, e.g. out/ep01-perihelion>
#   <base>.mp4        full quality for posting: 1080x1920 60 fps H.264, AAC 256k
#   <base>-phone.mp4  light 30 fps copy that previews in the Claude app on a phone
set -euo pipefail
cd "$(dirname "$0")/.."
COMP=$1; WAV=$2; BASE=$3
mkdir -p "$(dirname "$BASE")"
npx remotion render src/index.ts "$COMP" "$BASE.picture.mp4" --codec h264 --crf 12 --muted --log error
ffmpeg -y -v error -i "$BASE.picture.mp4" -i "$WAV" -map 0:v -map 1:a -shortest \
  -c:v libx264 -preset slow -profile:v high -level:v 4.2 -crf 16 -pix_fmt yuv420p \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$BASE.mp4"
ffmpeg -y -v error -i "$BASE.mp4" -vf fps=30 -c:v libx264 -preset slow -profile:v high -level:v 4.1 -refs 3 \
  -crf 23 -maxrate 3500k -bufsize 7000k -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 160k -ar 48000 -movflags +faststart "$BASE-phone.mp4"
rm -f "$BASE.picture.mp4"
ls -la "$BASE.mp4" "$BASE-phone.mp4"
