// Captures the live Awwwards Site of the Day winners the film uses (tools/aw-sites.txt) into public/aw/.
// The screenshots are third-party work, so they stay out of git (see .gitignore); rerun this to rebuild them.
//   npm i playwright-core && node tools/aw-capture.mjs tools/aw-sites.txt public/aw
// Lines are "name url [clickText]"; clickText is a button to press first (a cookie banner or an enter screen).
// Small copies for the wall: mkdir -p public/aw/s && for f in public/aw/*.jpg; do convert "$f" -resize 640x400^ -gravity center -extent 640x400 -quality 88 "public/aw/s/$(basename "$f")"; done
import {chromium} from 'playwright-core';
import fs from 'fs';

const [list, out] = process.argv.slice(2);
fs.mkdirSync(out, {recursive: true});
const sites = fs.readFileSync(list, 'utf8').trim().split('\n').map((l) => l.trim().split(/\s+/)).filter((x) => x.length >= 2 && !x[0].startsWith('#'));
const browser = await chromium.launch({
	executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
	args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const one = async ([name, url, clickText]) => {
	if (fs.existsSync(`${out}/${name}.jpg`)) return;
	const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: 1.5, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', locale: 'en-US'});
	const page = await ctx.newPage();
	try {
		await page.goto(url, {waitUntil: 'load', timeout: 40000}).catch(() => {});
		await page.waitForTimeout(Number(process.env.WAIT || 9000));
		if (clickText) {
			await page.getByText(new RegExp('^\\s*' + clickText + '\\s*$', 'i')).first().click({timeout: 3000}).catch(() => {});
			await page.waitForTimeout(3000);
		}
		for (const re of [/^(accept|accept all|allow all|agree|i agree|ok|got it|okay|accepter|aceptar|akzeptieren|alle akzeptieren)$/i, /enter|explore|start/i]) {
			const b = page.getByRole('button', {name: re}).first();
			if (await b.isVisible({timeout: 500}).catch(() => false)) {
				await b.click({timeout: 1500}).catch(() => {});
				await page.waitForTimeout(2500);
			}
		}
		await page.mouse.move(720, 450);
		await page.waitForTimeout(1500);
		await page.screenshot({path: `${out}/${name}.jpg`, type: 'jpeg', quality: 90, timeout: 20000});
		console.log('ok', name);
	} catch (e) {
		console.log('fail', name, String(e).slice(0, 120));
	}
	await ctx.close();
};
const q = [...sites];
await Promise.all([0, 1, 2].map(async () => {
	while (q.length) await one(q.shift());
}));
await browser.close();
