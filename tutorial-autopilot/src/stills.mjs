// node stills.mjs <comp> <outPrefix> <frame...>   (bundles once)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const [comp, prefix, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const chromiumOptions = {gl: 'swiftshader'};
const composition = await selectComposition({serveUrl, id: comp, browserExecutable, chromiumOptions});
for (const f of frames) {
  const out = `${prefix}_${f}.jpg`;
  try { await renderStill({composition, serveUrl, output: out, frame: Number(f), imageFormat: "jpeg", jpegQuality: 90, browserExecutable, chromiumOptions}); } catch (e) { console.log("FAIL", f, String(e).slice(0, 200)); continue; }
  console.log(out);
}
