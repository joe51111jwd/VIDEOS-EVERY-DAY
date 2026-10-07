import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import path from 'path';
const ids = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', chromiumOptions: {gl: 'swiftshader'}});
for (const id of ids) {
	const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser});
	await renderStill({composition, serveUrl, frame: 0, output: `out/${id}.png`, puppeteerInstance: browser, imageFormat: 'png'});
	console.log('ok', id);
}
await browser.close({silent: true});
