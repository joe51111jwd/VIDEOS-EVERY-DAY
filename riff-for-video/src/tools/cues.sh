#!/bin/bash
# writes out/cues.json from the TS timing (fonts shimmed: the token module loads them at import)
cd "$(dirname "$0")/.." && mkdir -p out && node_modules/.bin/esbuild tools/cues.ts --bundle --platform=node --loader:.json=json --log-level=warning --outfile=out/cues.js \
  --banner:js="globalThis.FontFace=class{load(){return Promise.resolve(this)}};globalThis.document={fonts:{add(){}}};globalThis.window=globalThis;" && node out/cues.js > out/cues.json && echo out/cues.json
