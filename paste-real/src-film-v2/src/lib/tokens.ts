import {useEffect, useState} from 'react';
import {continueRender, delayRender, Easing, interpolate, staticFile} from 'remotion';

// ---- fonts (woff2 in public/fonts, loaded with FontFace; @remotion/google-fonts fails in this Chrome)
const FONTS: string[][] = [
	['Inter', 'normal', '100 900', 'Inter-normal-var.woff2'],
	['Inter', 'italic', '100 900', 'Inter-italic-var.woff2'],
	['Geist', 'normal', '100 900', 'Geist-var.woff2'],
	['Geist Mono', 'normal', '100 900', 'GeistMono-var.woff2'],
	['Instrument Serif', 'normal', '400', 'InstrumentSerif-400-normal.woff2'],
	['Instrument Serif', 'italic', '400', 'InstrumentSerif-400-italic.woff2'],
	['Archivo', 'normal', '100 900', 'Archivo-normal-var.woff2', '62% 125%'],
	['Inter Tight', 'normal', '100 900', 'InterTight-var.woff2'],
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

/** macOS system UI stand-in (SF Pro is not redistributable) */
export const SYS = 'Inter';
/** Paste Real brand type */
export const BRAND = 'Geist';
export const BRAND_MONO = 'Geist Mono';
export const SERIF = 'Instrument Serif';
export const COND = 'Archivo';

/** width of a single line of text in px (canvas measure; fonts are loaded before any frame renders) */
let _ctx: CanvasRenderingContext2D | null = null;
export const textW = (text: string, size: number, weight = 600, family = 'Geist', trackingEm = 0) => {
	if (!_ctx) _ctx = document.createElement('canvas').getContext('2d');
	_ctx.font = `${weight} ${size}px "${family}"`;
	return _ctx.measureText(text).width + trackingEm * size * Math.max(0, text.length - 1);
};

export const FPS = 60;
export const fr = (s: number) => Math.round(s * FPS);

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.75, 0);
export const easeSoft = Easing.bezier(0.45, 0, 0.2, 1);
/** fast-out slow-in, the macOS window/sheet curve */
export const easeMac = Easing.bezier(0.25, 0.1, 0.25, 1);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
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

export type Rect = {x: number; y: number; w: number; h: number};
export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t)});

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
