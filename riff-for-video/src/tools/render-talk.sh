#!/bin/bash
# usage: tools/render-talk.sh [out-name]  → out/<out-name>.mp4 (+ -phone.mp4): the talk cut, music mixed from out/music/ny.wav
set -e
cd "$(dirname "$0")/.."
O=${1:-riff-for-video-talk}
npx remotion render src/index.ts TALK out/talk-silent.mp4 --concurrency=4 --gl=swiftshader \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --muted --log=error
node_modules/.bin/esbuild tools/cues-talk.ts --bundle --platform=node --loader:.json=json --log-level=warning --outfile=out/cues-talk.js \
  --banner:js="globalThis.FontFace=class{load(){return Promise.resolve(this)}};globalThis.document={fonts:{add(){}}};globalThis.window=globalThis;"
node out/cues-talk.js > out/cues.json
python3 tools/mix.py
cp out/mix.wav out/talk-mix.wav
tools/encode.sh out/talk-silent.mp4 out/talk-mix.wav out/$O
