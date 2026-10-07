import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import path from 'path';
const [comp] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', chromiumOptions: {gl: 'swangle'}});
const composition = await selectComposition({serveUrl, id: comp, puppeteerInstance: browser});
await renderStill({composition, serveUrl, frame: 0, output: `out/measure.png`, puppeteerInstance: browser, onBrowserLog: (l) => { if (l.text.includes('HEIGHTS')) console.log(l.text); }});
await browser.close({silent: true});
