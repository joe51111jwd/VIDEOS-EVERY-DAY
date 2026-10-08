// Quick look at a site: screenshots at given times after load, then at scroll fractions.
// usage: node scout.mjs <url> <name> <phone|tall|desk> <times s,comma> <scroll fractions,comma>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const [url, name, kind = 'phone', times = '0.5,1.5,3', fracs = '0,0.2,0.4,0.6,0.8,1'] = process.argv.slice(2);
const V = { phone: { w: 432, h: 768, dpr: 1, mobile: true }, tall: { w: 1080, h: 1920, dpr: 0.5, mobile: false }, desk: { w: 1440, h: 900, dpr: 0.75, mobile: false } }[kind];
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'] });
const ctx = await browser.newContext({ viewport: { width: V.w, height: V.h }, deviceScaleFactor: V.dpr, isMobile: V.mobile, hasTouch: V.mobile,
  userAgent: V.mobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' : undefined });
await ctx.addInitScript(() => { const g = WebGLRenderingContext.prototype.getParameter; const s = 'ANGLE (Apple, ANGLE Metal Renderer: Apple M3 Pro, Unspecified Version)';
  for (const P of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) { const o = P.getParameter; P.getParameter = function (p) { if (p === 0x9246) return s; if (p === 0x9245) return 'Google Inc. (Apple)'; return o.call(this, p); }; } });
const page = await ctx.newPage();
const t0 = Date.now();
await page.goto(url, { waitUntil: 'commit', timeout: 90000 });
let i = 0;
for (const t of times.split(',').map(Number)) {
  const wait = t * 1000 - (Date.now() - t0); if (wait > 0) await page.waitForTimeout(wait);
  await page.screenshot({ path: `/home/user/work/scout/${name}-t${String(i++).padStart(2, '0')}.jpg`, quality: 70 }).catch(() => {});
}
const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
console.log(name, 'scrollable', H);
i = 0;
for (const f of fracs.split(',').map(Number)) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(H * f));
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `/home/user/work/scout/${name}-s${String(i++).padStart(2, '0')}.jpg`, quality: 70 });
}
await browser.close();
