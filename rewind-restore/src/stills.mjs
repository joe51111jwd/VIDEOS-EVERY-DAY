// node stills.mjs 0.5 3 7.2 ...  → out/stills/RR_<t>.jpg   (COMP=THUMB PROPS='{"min":700}' ...)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
const times = process.argv.slice(2).map(Number);
const comp = process.env.COMP || 'RR';
const inputProps = JSON.parse(process.env.PROPS || '{}');
const serveUrl = await bundle({entryPoint: 'src/index.ts'});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const composition = await selectComposition({serveUrl, id: comp, browserExecutable, inputProps, chromiumOptions: {gl: 'swiftshader'}});
const dir = process.env.OUT || 'out/stills';
fs.mkdirSync(dir, {recursive: true});
for (const t of times) {
	const out = `${dir}/${comp}_${t}.jpg`;
	await renderStill({composition, serveUrl, browserExecutable, inputProps, frame: Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps)), output: out, imageFormat: 'jpeg', jpegQuality: 88, scale: Number(process.env.SCALE || 0.5), chromiumOptions: {gl: 'swiftshader'}});
	console.log('ok', out);
}
