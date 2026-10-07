import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import path from 'path';
const [comp, ...times] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', chromiumOptions: {gl: 'swiftshader'}});
const composition = await selectComposition({serveUrl, id: comp, puppeteerInstance: browser});
for (const t of times) {
	const frame = Math.round(parseFloat(t) * 60);
	await renderStill({composition, serveUrl, frame, output: `out/s_${comp}_${t}.png`, puppeteerInstance: browser, imageFormat: 'jpeg', jpegQuality: 88});
	console.log('ok', t);
}
await browser.close({silent: true});
