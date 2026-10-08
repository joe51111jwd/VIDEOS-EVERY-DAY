#!/bin/bash
# usage: SONG=skin tools/probe.sh
cd "$(dirname "$0")/.." && mkdir -p out && node_modules/.bin/esbuild tools/probe.ts --bundle --platform=node --loader:.json=json --log-level=warning --outfile=out/probe.js \
  --banner:js="globalThis.FontFace=class{load(){return Promise.resolve(this)}};globalThis.document={fonts:{add(){}}};globalThis.window=globalThis;" && node out/probe.js
