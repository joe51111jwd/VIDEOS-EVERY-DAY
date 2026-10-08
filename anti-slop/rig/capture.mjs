// Frame-perfect capture of a live website: virtual time + scripted scroll/mouse, piped to ffmpeg.
// usage: node capture.mjs shot.json
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const here = path.dirname(new URL(import.meta.url).pathname);
const shim = fs.readFileSync(path.join(here, 'vt-shim.js'), 'utf8');
const fps = spec.fps || 60;
const dt = 1000 / fps;
const N = Math.round((spec.duration || 5) * fps);
const vw = spec.viewport?.w || 1920, vh = spec.viewport?.h || 1080, dpr = spec.dpr || 1;
const out = spec.out;
fs.mkdirSync(path.dirname(out), { recursive: true });

const ease = {
  linear: (x) => x,
  io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  io2: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
  out: (x) => 1 - Math.pow(1 - x, 3),
  in: (x) => x * x * x,
  sine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
};
// keyframes [{t, ...vals, ease}] -> value at time t (each segment eased by the *destination* key's ease)
function track(keys, field, t) {
  if (!keys || !keys.length) return undefined;
  const ks = keys.filter((k) => k[field] !== undefined);
  if (!ks.length) return undefined;
  if (t <= ks[0].t) return ks[0][field];
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i].t) {
      const a = ks[i - 1], b = ks[i];
      const x = (t - a.t) / Math.max(1e-9, b.t - a.t);
      const e = ease[b.ease || spec.ease || 'io'](Math.min(1, Math.max(0, x)));
      return a[field] + (b[field] - a[field]) * e;
    }
  }
  return ks[ks.length - 1][field];
}

const args = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
  '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows', '--hide-scrollbars', '--force-color-profile=srgb'];
const browser = await chromium.launch({ args, executablePath: spec.full ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined });
const ctx = await browser.newContext({
  viewport: { width: vw, height: vh }, deviceScaleFactor: dpr,
  isMobile: !!spec.mobile, hasTouch: !!spec.mobile, reducedMotion: 'no-preference', colorScheme: spec.colorScheme || 'light',
  userAgent: spec.mobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' : undefined,
});
const cfg = { gpu: spec.gpu === false ? null : (spec.gpu || 'ANGLE (Apple, ANGLE Metal Renderer: Apple M3 Pro, Unspecified Version)'), seekTimeout: 6000 };
await ctx.addInitScript({ content: `window.__VT_CFG=${JSON.stringify(cfg)};\n${shim}` });
// optional: page code to run before any page script, and a stop condition armed from the very first tick
if (spec.initJs) await ctx.addInitScript({ content: spec.initJs });
if (spec.warmup?.earlyStop) await ctx.addInitScript({ content: `window.__vt.stopWhen = new Function(${JSON.stringify('return (' + spec.warmup.earlyStop + ')')});` });
if (spec.routes) {
  // r.url: hand the request to another server (keeps Range requests, so media can seek); r.file: serve a file whole
  for (const r of spec.routes) await ctx.route(new RegExp(r.match), (route) => (r.url ? route.continue({ url: r.url }) : route.fulfill({ path: r.file, contentType: r.type || 'video/webm' })));
}
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error' && !spec.quiet) console.log('[page]', m.text().slice(0, 240)); });
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 240)));
const client = await ctx.newCDPSession(page);
const t0 = Date.now();
await page.goto(spec.url, { waitUntil: 'load', timeout: 120000 });
await page.evaluate(() => document.fonts && document.fonts.ready);
if (spec.warmup?.js) await page.evaluate(spec.warmup.js);
await page.waitForTimeout(spec.warmup?.ms ?? 4000);
if (spec.warmup?.until) {
  const lim = Date.now() + (spec.warmup.untilMs || 180000);
  while (Date.now() < lim && !(await page.evaluate(spec.warmup.until))) await page.waitForTimeout(500);
}
if (spec.warmup?.afterMs) await page.waitForTimeout(spec.warmup.afterMs);
if (spec.warmup?.earlyStop) {
  const lim = Date.now() + (spec.warmup.stopMs || 240000);
  while (Date.now() < lim && !(await page.evaluate(() => window.__vt.stopped))) await page.waitForTimeout(100);
  if (!(await page.evaluate(() => window.__vt.stopped))) console.log('[cap] earlyStop never hit; stopping anyway');
  else console.log('[cap] earlyStop hit at vt', await page.evaluate(() => window.__vt.now.toFixed(0)));
  if (spec.warmup.settleMs) await page.waitForTimeout(spec.warmup.settleMs);
}
if (spec.warmup?.stopWhen) {
  await page.evaluate((src) => { window.__vt.stopWhen = new Function('return (' + src + ')'); }, spec.warmup.stopWhen);
  const lim = Date.now() + (spec.warmup.stopMs || 240000);
  while (Date.now() < lim && !(await page.evaluate(() => window.__vt.stopped))) await page.waitForTimeout(100);
  if (!(await page.evaluate(() => window.__vt.stopped))) console.log('[cap] stopWhen never hit; stopping anyway');
}
await page.evaluate(() => window.__vt.stopFreeRun());
console.log(`[cap] ${spec.name}: loaded + warm in ${((Date.now() - t0) / 1000).toFixed(1)}s, capturing ${N} frames @${fps}`);

const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', String(spec.crf ?? 12), '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });

const scrollKeys = spec.scroll || [];
const mouseKeys = spec.mouse || [];
const events = (spec.events || []).slice().sort((a, b) => a.t - b.t);
let ei = 0, mouseDown = false, lastMouse = null;
const log = [];
// resolve symbolic scroll targets once
for (const k of scrollKeys) {
  if (typeof k.y === 'string') k.y = await page.evaluate((s) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (s.startsWith('f:')) return Math.round(max * parseFloat(s.slice(2)));
    const [sel, off] = s.split('|');
    const el = document.querySelector(sel);
    return el ? Math.min(max, Math.round(el.getBoundingClientRect().top + scrollY + (parseFloat(off) || 0))) : 0;
  }, k.y);
}
const pre = Math.round((spec.preroll || 0) * fps);
const tStart = Date.now();
for (let f = -pre; f < N; f++) {
  const t = f / fps;
  while (ei < events.length && events[ei].t <= t) {
    const e = events[ei++];
    if (e.js) await page.evaluate(e.js).catch((x) => console.log('[event err]', String(x).slice(0, 200)));
    if (e.click) { await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: e.click[0], y: e.click[1], button: 'left', clickCount: 1 }); await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: e.click[0], y: e.click[1], button: 'left', clickCount: 1 }); }
    if (e.key) await page.keyboard.press(e.key);
    if (e.tap) await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: e.tap[0], y: e.tap[1] }] }).then(() => client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }));
  }
  const y = track(scrollKeys, 'y', Math.max(0, t));
  const mx = track(mouseKeys, 'x', Math.max(0, t)), my = track(mouseKeys, 'y', Math.max(0, t));
  if (mx !== undefined) {
    const k = mouseKeys.filter((k) => k.t <= t).pop();
    const wantDown = !!(k && k.down);
    if (!lastMouse || Math.abs(lastMouse[0] - mx) > 0.01 || Math.abs(lastMouse[1] - my) > 0.01) {
      await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: mx, y: my, button: mouseDown ? 'left' : 'none', buttons: mouseDown ? 1 : 0 });
      lastMouse = [mx, my];
    }
    if (wantDown !== mouseDown) {
      await client.send('Input.dispatchMouseEvent', { type: wantDown ? 'mousePressed' : 'mouseReleased', x: mx, y: my, button: 'left', buttons: wantDown ? 1 : 0, clickCount: 1 });
      mouseDown = wantDown;
    }
  }
  const sy = await page.evaluate(async ({ y, dt }) => {
    if (y !== undefined && y !== null) window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    await window.__vt.nativeFrame(1);
    await window.__vt.step(dt);
    await window.__vt.nativeFrame(1);
    return window.scrollY;
  }, { y, dt });
  if (f < 0) continue;
  const shot = await page.screenshot({ type: 'jpeg', quality: spec.quality ?? 93, scale: 'device', caret: 'initial', timeout: 120000 });
  if (!ff.stdin.write(shot)) await new Promise((r) => ff.stdin.once('drain', r));
  log.push({ f, t: +t.toFixed(4), scrollY: sy, mouse: lastMouse, down: mouseDown });
  if (f % 60 === 0) console.log(`[cap] ${spec.name} frame ${f}/${N}  ${((Date.now() - tStart) / Math.max(1, f + pre + 1)).toFixed(0)} ms/frame`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
fs.writeFileSync(out.replace(/\.mp4$/, '.frames.json'), JSON.stringify({ spec, frames: log }, null, 0));
console.log(`[cap] ${spec.name} done -> ${out} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
await browser.close();
