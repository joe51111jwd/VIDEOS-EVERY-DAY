// node render.mjs page.html out.png [width] [height] [scale]
import {createRequire} from 'module'; const require = createRequire(import.meta.url); const {chromium} = require('playwright');
const [,, page, out, w = '1600', h = '1000', s = '1'] = process.argv;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p = await browser.newPage({viewport: {width: +w, height: +h}, deviceScaleFactor: +s});
await p.goto('file://' + process.cwd() + '/' + page);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(300);
await p.screenshot({path: out, fullPage: true});
await browser.close();
