// node stills.mjs <comp> <sec,sec,...> <outdir>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const [comp, secs, outdir = 'out/stills'] = process.argv.slice(2);
fs.mkdirSync(outdir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const composition = await selectComposition({serveUrl, id: comp, browserExecutable, chromiumOptions: {gl: 'swiftshader'}});
for (const s of secs.split(',').map(Number)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
  await renderStill({composition, serveUrl, output: `${outdir}/${comp}-${s.toFixed(2)}.jpg`, frame, imageFormat: 'jpeg', jpegQuality: 85, browserExecutable, chromiumOptions: {gl: 'swiftshader'}, scale: Number(process.env.SCALE || 0.5)});
  console.log('still', s);
}
