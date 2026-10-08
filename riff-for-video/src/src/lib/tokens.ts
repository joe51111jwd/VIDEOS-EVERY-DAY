import {continueRender, delayRender, Easing, interpolate, staticFile} from 'remotion';

// ---- fonts (woff2 in public/fonts, loaded with FontFace; @remotion/google-fonts fails in this Chrome)
const FONTS: string[][] = [
	['Inter', 'normal', '100 900', 'Inter-normal-var.woff2'],
	['Inter', 'italic', '100 900', 'Inter-italic-var.woff2'],
	['Geist Mono', 'normal', '100 900', 'GeistMono-var.woff2'],
	['Inter Tight', 'normal', '100 900', 'InterTight-var.woff2'],
];
const handle = delayRender('fonts');
Promise.all(
	FONTS.map(([fam, style, weight, file]) => {
		const ff = new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {style, weight});
		document.fonts.add(ff);
		return ff.load();
	}),
)
	.then(() => continueRender(handle))
	.catch((e) => {
		console.error(e);
		continueRender(handle);
	});

/** macOS system UI stand-in (SF Pro is not redistributable) */
export const SANS = 'Inter';
export const MONO = 'Geist Mono';
export const TIGHT = 'Inter Tight';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.75, 0);
/** fast-out slow-in, the macOS window/sheet curve */
export const easeMac = Easing.bezier(0.25, 0.1, 0.25, 1);
export const easeSnap = Easing.bezier(0.2, 0.9, 0.1, 1);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0..1 progress of a step that starts at t0 (s) and lasts dur */
export const step = (t: number, t0: number, dur = 0.5, e = easeOut) => e(clamp01((t - t0) / dur));
export const range = (t: number, inR: number[], outR: number[], e = easeInOut) =>
	interpolate(t, inR, outR, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
/** damped spring 0..1 that overshoots a little; k = stiffness-ish, z = damping ratio */
export const spr = (t: number, t0: number, k = 14, z = 0.55) => {
	if (t < t0) return 0;
	const x = t - t0;
	const wd = k * Math.sqrt(1 - z * z);
	return 1 - Math.exp(-z * k * x) * (Math.cos(wd * x) + ((z * k) / wd) * Math.sin(wd * x));
};
/** a quick 0→1→0 pulse peaking `peak` s after t0 */
export const pulse = (t: number, t0: number, rise = 0.08, fall = 0.45) => {
	if (t < t0) return 0;
	const x = t - t0;
	return x < rise ? easeOut(x / rise) : Math.max(0, 1 - easeInOut(clamp01((x - rise) / fall)));
};

// ---- the Riff video editor palette (dark mode)
export const C = {
	stage: '#000000',
	win: '#0D0D0F',
	panel: '#141417',
	panel2: '#1B1B1F',
	lane: '#111114',
	line: 'rgba(255,255,255,0.07)',
	line2: 'rgba(255,255,255,0.12)',
	text: '#F2F2F5',
	sub: '#9A9AA3',
	dim: '#5E5E66',
	ember: '#FF9A55',
	ember2: '#FF6A4D',
	emberInk: '#1D0F06',
	video: '#3E5BC2',
	videoTop: '#5876E0',
	audio: '#1E5E4D',
	audioWave: '#5ED9AE',
	music: '#47377A',
	musicWave: '#B49CFF',
	look: '#9A5B1C',
	lookTop: '#E3963F',
};

/** width of a single line of text in px (canvas measure; fonts are loaded before any frame renders) */
let _ctx: CanvasRenderingContext2D | null = null;
export const textW = (text: string, size: number, weight = 560, family = SANS, trackingEm = 0) => {
	if (!_ctx) _ctx = document.createElement('canvas').getContext('2d');
	if (!_ctx) return text.length * size * 0.5;
	_ctx.font = `${weight} ${size}px "${family}"`;
	return _ctx.measureText(text).width + trackingEm * size * Math.max(0, text.length - 1);
};

/** timeline seconds → "00:00:07:15" at 24 fps (the footage's rate) */
export const tc = (s: number) => {
	const f = Math.max(0, Math.round(s * 24));
	const ff = f % 24;
	const ss = Math.floor(f / 24) % 60;
	const mm = Math.floor(f / 24 / 60);
	const p = (n: number) => String(n).padStart(2, '0');
	return `00:${p(mm)}:${p(ss)}:${p(ff)}`;
};
