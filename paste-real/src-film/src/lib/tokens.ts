import {useEffect, useState} from 'react';
import {continueRender, delayRender, Easing, interpolate, staticFile} from 'remotion';

// ---- fonts (woff2 in public/fonts, loaded with FontFace; @remotion/google-fonts fails in this Chrome)
const FONTS: string[][] = [
	['Inter', 'normal', '100 900', 'Inter-normal-var.woff2'],
	['Inter', 'italic', '100 900', 'Inter-italic-var.woff2'],
	['Fraunces', 'normal', '100 900', 'Fraunces-normal-var.woff2'],
	['Fraunces', 'italic', '100 900', 'Fraunces-italic-var.woff2'],
	['Archivo', 'normal', '100 900', 'Archivo-normal-var.woff2', '62% 125%'],
	['Instrument Serif', 'normal', '400', 'InstrumentSerif-400-normal.woff2'],
	['Instrument Serif', 'italic', '400', 'InstrumentSerif-400-italic.woff2'],
	['DM Serif Display', 'normal', '400', 'DMSerifDisplay-400-normal.woff2'],
	['JetBrains Mono', 'normal', '500', 'JetBrainsMono-500-normal.woff2'],
	['JetBrains Mono', 'normal', '700', 'JetBrainsMono-700-normal.woff2'],
];
const handle = delayRender('fonts');
export let fontsReady = false;
const fontsPromise = Promise.all(
	FONTS.map(([fam, style, weight, file, stretch]) => {
		const ff = new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {style, weight, ...(stretch ? {stretch} : {})});
		document.fonts.add(ff);
		return ff.load();
	}),
)
	.then(() => {
		fontsReady = true;
		continueRender(handle);
	})
	.catch((e) => {
		console.error(e);
		fontsReady = true;
		continueRender(handle);
	});

/** re-render once the fonts are in, so text measured for layout uses the real font */
export const useFontsReady = () => {
	const [ok, setOk] = useState(fontsReady);
	const [h] = useState(() => (fontsReady ? null : delayRender('measure after fonts')));
	useEffect(() => {
		if (ok) {
			if (h !== null) continueRender(h);
			return;
		}
		fontsPromise.then(() => setOk(true));
	}, [ok, h]);
	return ok;
};

export const SANS = 'Inter';
export const SERIF = 'Fraunces';
export const EDIT = 'Instrument Serif';
export const DISPLAY = 'DM Serif Display';
export const COND = 'Archivo';
export const MONO = 'JetBrains Mono';

export const FPS = 60;
export const fr = (s: number) => Math.round(s * FPS);

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.75, 0);
export const easeSoft = Easing.bezier(0.45, 0, 0.2, 1);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0..1 progress of a step that starts at t0 (s) and lasts dur */
export const step = (t: number, t0: number | undefined, dur = 0.5, e = easeOut) => (t0 === undefined ? 0 : e(clamp01((t - t0) / dur)));
export const range = (t: number, inR: number[], outR: number[], e = easeInOut) =>
	interpolate(t, inR, outR, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
/** damped spring 0..1 (overshoots a little) */
export const spr = (t: number, t0: number, k = 9, z = 0.62) => {
	if (t < t0) return 0;
	const x = t - t0;
	const w = k * Math.PI * 0.5;
	return 1 - Math.exp(-z * w * x) * Math.cos(w * Math.sqrt(1 - z * z) * x);
};

export const BLUE = '#2F6BFF';
export const SELECT = 'rgba(64,128,255,0.30)';
export const AMBER = '#F2A33A';
export const GREEN = '#2DBE6C';

/** seeded PRNG */
export const rng = (seed: number) => {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};
