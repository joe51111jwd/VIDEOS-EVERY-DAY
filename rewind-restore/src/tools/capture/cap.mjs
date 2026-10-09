import {chromium} from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const OUT = process.argv[2] || 'out';
fs.mkdirSync(OUT, {recursive: true});
const pages = JSON.parse(fs.readFileSync(process.argv[3] || 'pages.json', 'utf8'));
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--hide-scrollbars']});
for (const p of pages) {
  const ctx = await browser.newContext({viewport: {width: p.w || 1280, height: p.h || 800}, deviceScaleFactor: p.dpr || 2, colorScheme: p.dark ? 'dark' : 'light', locale: 'en-US', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'});
  const page = await ctx.newPage();
  try {
    await page.goto(p.url, {waitUntil: 'networkidle', timeout: 30000}).catch(() => page.waitForTimeout(3000));
    await page.waitForTimeout(p.wait || 2500);
    // hide cookie banners & sticky promos
    await page.addStyleTag({content: `[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],[class*="banner" i][class*="cookie" i],#onetrust-banner-sdk,.cc-window{display:none!important}`}).catch(()=>{});
    if (p.js) await page.evaluate(p.js).catch(e => console.log('js err', e.message));
    await page.waitForTimeout(600);
    const title = await page.title();
    const fav = await page.evaluate(() => { const l = document.querySelector('link[rel~="icon"]'); return l ? l.href : location.origin + '/favicon.ico'; }).catch(()=>null);
    await page.screenshot({path: `${OUT}/${p.id}.png`, fullPage: !!p.full, type: 'png'});
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    console.log(JSON.stringify({id: p.id, title, fav, h}));
  } catch (e) { console.log('FAIL', p.id, e.message.slice(0, 120)); }
  await ctx.close();
}
await browser.close();
