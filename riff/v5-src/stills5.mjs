import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: 'src/index.ts'});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const id = process.env.COMP || 'RiffV5';
const composition = await selectComposition({serveUrl, id, browserExecutable});
const dir = process.env.OUT || 'out/s5';
fs.mkdirSync(dir, {recursive: true});
for (const t of times) {
	const out = `${dir}/${id}_${t}.png`;
	await renderStill({composition, serveUrl, browserExecutable, frame: Math.min(composition.durationInFrames - 1, Math.round(t * 30)), output: out, scale: Number(process.env.SCALE || 0.5), chromiumOptions: {gl: 'swangle'}});
	console.log('ok', out);
}
