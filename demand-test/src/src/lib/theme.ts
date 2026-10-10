import {continueRender, delayRender, Easing, interpolate, staticFile} from 'remotion';

// ---- fonts: woff2 in public/fonts, loaded with FontFace (the google-fonts loader fails in this Chrome)
const FONTS: [string, string, string, string, string?][] = [
	['Archivo', 'normal', '100 900', 'Archivo.woff2', '62% 125%'],
	['Geist Mono', 'normal', '100 900', 'GeistMono.woff2'],
	['Geist', 'normal', '100 900', 'Geist.woff2'],
	['Inter', 'normal', '100 900', 'Inter-normal-var.woff2'],
	['Inter', 'italic', '100 900', 'Inter-italic-var.woff2'],
];
if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
	const h = delayRender('fonts');
	Promise.all(
		FONTS.map(([fam, style, weight, file, stretch]) => {
			const ff = new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {style, weight, ...(stretch ? {stretch} : {})});
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

/** the board: black housing, charcoal flaps, warm white letters; the six chips are the Dark Side prism */
export const C = {
	housing: '#070707',
	flapTop: '#232323',
	flapBot: '#1A1A1A',
	hinge: '#020202',
	ink: '#F3F0E8',
	red: '#E5402F',
	orange: '#F08A24',
	yellow: '#F4CF3E',
	green: '#2DBE5C',
	blue: '#2E78E6',
	violet: '#8A58D6',
	white: '#F3F0E8',
	// product UI
	page: '#FFFFFF',
	ui: '#F6F6F4',
	line: 'rgba(10,10,10,0.09)',
	text: '#0B0B0B',
	sub: 'rgba(11,11,11,0.56)',
	go: '#14A44D',
	stop: '#E0362C',
};
export const F = {
	flap: 'Archivo, "Geist", sans-serif',
	mono: '"Geist Mono", ui-monospace, monospace',
	ui: '"Geist", Inter, sans-serif',
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
