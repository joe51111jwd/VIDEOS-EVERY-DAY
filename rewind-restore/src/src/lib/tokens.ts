import {continueRender, delayRender, Easing, interpolate, staticFile} from 'remotion';

// ---- fonts (woff2 in public/fonts, loaded with FontFace; @remotion/google-fonts fails in this Chrome)
const FONTS: [string, string, string, string, string?][] = [
	['Inter', 'normal', '100 900', 'Inter-normal-var.woff2'],
	['Inter', 'italic', '100 900', 'Inter-italic-var.woff2'],
	['Inter Tight', 'normal', '100 900', 'InterTight-var.woff2'],
	['Geist Mono', 'normal', '100 900', 'GeistMono-var.woff2'],
	['Archivo', 'normal', '100 900', 'Archivo-normal-var.woff2', '62% 125%'],
	['Instrument Serif', 'normal', '400', 'InstrumentSerif-400-normal.woff2'],
	['Instrument Serif', 'italic', '400', 'InstrumentSerif-400-italic.woff2'],
];
if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
	const handle = delayRender('fonts');
	Promise.all(
		FONTS.map(([fam, style, weight, file, stretch]) => {
			const ff = new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {style, weight, ...(stretch ? {stretch} : {})});
			document.fonts.add(ff);
			return ff.load();
		}),
	)
		.then(() => continueRender(handle))
		.catch((e) => {
			console.error(e);
			continueRender(handle);
		});
}

/** macOS system UI stand-in (SF Pro is not redistributable) */
export const SANS = 'Inter';
export const TIGHT = 'Inter Tight';
export const MONO = 'Geist Mono';
export const DISPLAY = 'Archivo';
export const SERIF = 'Instrument Serif';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.75, 0);
export const easeMac = Easing.bezier(0.25, 0.1, 0.25, 1);
export const easeSnap = Easing.bezier(0.2, 0.9, 0.1, 1);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const step = (t: number, t0: number, dur = 0.5, e: (x: number) => number = easeOut) => e(clamp01((t - t0) / dur));
export const range = (t: number, inR: number[], outR: number[], e: (x: number) => number = easeInOut) =>
	interpolate(t, inR, outR, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
/** damped spring 0..1 with a little overshoot */
export const spr = (t: number, t0: number, k = 16, z = 0.6) => {
	if (t < t0) return 0;
	const x = t - t0;
	const wd = k * Math.sqrt(1 - z * z);
	return 1 - Math.exp(-z * k * x) * (Math.cos(wd * x) + ((z * k) / wd) * Math.sin(wd * x));
};
export const pulse = (t: number, t0: number, rise = 0.06, fall = 0.4) => {
	if (t < t0) return 0;
	const x = t - t0;
	return x < rise ? easeOut(x / rise) : Math.max(0, 1 - easeInOut(clamp01((x - rise) / fall)));
};
/** deterministic hash noise 0..1 */
export const hash = (n: number) => {
	const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return s - Math.floor(s);
};

/** macOS dark-mode palette + the Rewind brand */
export const C = {
	text: '#F5F5F7',
	sub: '#A1A1A8',
	dim: '#6E6E76',
	win: '#1E1E21',
	win2: '#262629',
	bar: '#2A2A2D',
	sidebar: '#232326',
	line: 'rgba(255,255,255,0.08)',
	line2: 'rgba(255,255,255,0.14)',
	sel: '#0A64D6',
	blue: '#0A84FF',
	green: '#30D158',
	red: '#FF453A',
	yellow: '#FFD60A',
	// Rewind amber
	amber: '#FFB23E',
	amber2: '#FF7A2F',
	amberInk: '#2A1600',
};

let _ctx: CanvasRenderingContext2D | null = null;
export const textW = (text: string, size: number, weight = 500, family = SANS, stretch = '100%') => {
	if (!_ctx) _ctx = document.createElement('canvas').getContext('2d');
	if (!_ctx) return text.length * size * 0.55;
	_ctx.font = `${weight} ${stretch === '100%' ? '' : ''}${size}px "${family}"`;
	// canvas can't do font-stretch reliably: callers measure with DOM when they need wdth
	return _ctx.measureText(text).width;
};
