// Evaluate an expression on a page after load: node probe.mjs <url> <phone|tall> <wait ms> '<js expr>'
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const [url, kind = 'phone', wait = '4000', expr = 'document.title'] = process.argv.slice(2);
const V = { phone: { w: 432, h: 768, dpr: 1, mobile: true }, tall: { w: 1080, h: 1920, dpr: 0.5, mobile: false } }[kind];
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'] });
const ctx = await browser.newContext({ viewport: { width: V.w, height: V.h }, deviceScaleFactor: V.dpr, isMobile: V.mobile, hasTouch: V.mobile,
  userAgent: V.mobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' : undefined });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(+wait);
console.log(JSON.stringify(await page.evaluate(expr), null, 1));
await browser.close();
