import {continueRender, delayRender, Easing, interpolate, staticFile} from 'remotion';

// ---- fonts: woff2 in public/fonts, loaded with FontFace (google-fonts loader fails in this Chrome)
const FONTS: [string, string, string, string][] = [
	['Geist Mono', 'normal', '100 900', 'GeistMono.woff2'],
	['Geist', 'normal', '100 900', 'Geist.woff2'],
	['Stack Sans Headline', 'normal', '200 700', 'StackSansHeadline.woff2'],
	['Stack Sans Text', 'normal', '200 700', 'StackSansText.woff2'],
	['Inter', 'normal', '100 900', 'Inter-normal-var.woff2'],
	['Inter', 'italic', '100 900', 'Inter-italic-var.woff2'],
];
if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
	const h = delayRender('fonts');
	Promise.all(
		FONTS.map(([fam, style, weight, file]) => {
			const ff = new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {style, weight});
			(document.fonts as unknown as {add: (f: FontFace) => void}).add(ff);
			return ff.load();
		}),
	)
		.then(() => continueRender(h))
		.catch((e) => {
			console.error(e);
			continueRender(h);
		});
}

export const W = 1920;
export const H = 1080;
export const FPS = 30;

/** brand-reel palette (james-design motion/brand-reel), with Autopilot's signal orange */
export const C = {
	paper: '#F2EEE8',
	paper2: '#E9E3D9',
	ink: '#121010',
	orange: '#FF5B1A',
	orangeSoft: '#FFB08A',
	hair: 'rgba(18,16,16,0.18)',
	guide: 'rgba(18,16,16,0.35)',
	mute: 'rgba(18,16,16,0.55)',
	white: '#FDFCF8',
};
export const F = {
	mono: '"Geist Mono", ui-monospace, monospace',
	head: '"Stack Sans Headline", "Geist", sans-serif',
	text: '"Stack Sans Text", "Geist", sans-serif',
	ui: '"Geist", sans-serif',
	inter: 'Inter, sans-serif',
};

export const E = {
	out: Easing.bezier(0.16, 1, 0.3, 1),
	inOut: Easing.bezier(0.65, 0, 0.35, 1),
	in: Easing.bezier(0.7, 0, 0.84, 0),
	snap: Easing.bezier(0.2, 0.9, 0.1, 1),
	mac: Easing.bezier(0.25, 0.1, 0.25, 1),
	lin: (x: number) => x,
};
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** eased 0..1 between t0 and t1 */
export const prog = (t: number, t0: number, t1: number, e: (x: number) => number = E.out) => e(clamp((t - t0) / Math.max(1e-6, t1 - t0)));
/** keyframes */
export const kf = (t: number, ts: number[], vs: number[], e: (x: number) => number = E.inOut) =>
	interpolate(t, ts, vs, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
export const rand = (seed: number) => {
	const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};
/** damped spring 0..1 */
export const spr = (t: number, t0: number, k = 18, z = 0.62) => {
	if (t < t0) return 0;
	const x = t - t0;
	const wd = k * Math.sqrt(1 - z * z);
	return 1 - Math.exp(-z * k * x) * (Math.cos(wd * x) + ((z * k) / wd) * Math.sin(wd * x));
};
/** quick rise, slow fall (0..1) */
export const pulse = (t: number, t0: number, rise = 0.05, fall = 0.35) => {
	if (t < t0) return 0;
	const x = t - t0;
	return x < rise ? x / rise : Math.max(0, 1 - (x - rise) / fall);
};
