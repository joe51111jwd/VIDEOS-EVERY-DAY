import {continueRender, delayRender, Easing, interpolate, interpolateColors, spring, staticFile} from 'remotion';
import fonts5 from './fonts5.json';

// ---- fonts (variable woff2 files in public/fonts)
const fontHandle = delayRender('v5 fonts');
const list = [
	...(fonts5 as string[][]),
	['JetBrains Mono', 'normal', '500', 'JetBrainsMono-500-normal.woff2'],
];
Promise.all(
	list.map(([fam, style, weight, file, stretch]) => {
		const ff = new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {
			style,
			weight,
			...(stretch ? {stretch} : {}),
		});
		document.fonts.add(ff);
		return ff.load();
	}),
)
	.then(() => continueRender(fontHandle))
	.catch((e) => {
		console.error(e);
		continueRender(fontHandle);
	});

export const SANS = 'Inter';
export const SERIF = 'Fraunces';
export const EDIT = 'Instrument Serif';
export const COND = 'Archivo';
export const MONO = 'JetBrains Mono';

export const FPS = 30;
export const fr = (s: number) => Math.round(s * FPS);

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.75, 0);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0..1 progress of a step that starts at t0 (seconds) and lasts dur, at time t (seconds). */
export const step = (t: number, t0: number | undefined, dur = 0.5, e = easeOut) => {
	if (t0 === undefined) return 0;
	return e(clamp01((t - t0) / dur));
};
/** spring 0..1 (can overshoot) starting at t0 seconds */
export const spr = (frame: number, t0: number | undefined, damping = 16, mass = 0.8, stiffness = 120) => {
	if (t0 === undefined) return 0;
	return spring({frame: frame - t0 * FPS, fps: FPS, config: {damping, mass, stiffness}});
};
export const mixc = (a: string, b: string, t: number) => interpolateColors(clamp01(t), [0, 1], [a, b]);
export const range = (t: number, inR: number[], outR: number[], e = easeInOut) =>
	interpolate(t, inR, outR, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

// ---- Halfmoon brand palettes (cool = before "warmer", warm = after)
export const COOL = {
	bg: '#F3F2EF',
	paper: '#FFFFFF',
	ink: '#1B1B1D',
	sub: '#6D6D72',
	accent: '#1B1B1D',
	onAccent: '#FFFFFF',
	line: 'rgba(0,0,0,0.09)',
	soft: '#E7E6E2',
};
export const WARM = {
	bg: '#F4EBDD',
	paper: '#FBF6EE',
	ink: '#2A1A10',
	sub: '#76604F',
	accent: '#B4532A',
	onAccent: '#FBF3E8',
	line: 'rgba(70,35,10,0.13)',
	soft: '#EADCC8',
};
export type Pal = typeof WARM;
export const palAt = (w: number): Pal => {
	const o: Record<string, string> = {};
	(Object.keys(WARM) as (keyof Pal)[]).forEach((k) => {
		const a = COOL[k];
		const b = WARM[k];
		o[k] = a.startsWith('rgba') ? (w < 0.5 ? a : b) : mixc(a, b, w);
	});
	return o as Pal;
};
export const TERRA = '#C4552D';
export const ESPRESSO = '#23150D';
export const CREAM = '#F3E7D6';

export const img = (name: string) => staticFile(`v5/${name}`);
