#!/bin/bash
# usage: tools/render.sh <song> <out-name>  → out/<out-name>.mp4 (+ -phone.mp4), music mixed from out/music/<song>.wav
set -e
cd "$(dirname "$0")/.."
S=$1; O=$2
npx remotion render src/index.ts RFV out/$S-silent.mp4 --props="{\"song\":\"$S\"}" --concurrency=4 --gl=swiftshader \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --muted --log=error
SONG=$S tools/cues.sh > /dev/null
python3 tools/mix.py
cp out/mix.wav out/$S-mix.wav
tools/encode.sh out/$S-silent.mp4 out/$S-mix.wav out/$O
