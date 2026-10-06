import React from 'react';
import {interpolate, Easing} from 'remotion';
import {continueRender, delayRender, staticFile} from 'remotion';
import envJson from './env.json';
import fontList from './fonts.json';

const handle = delayRender('fonts');
Promise.all(
	(fontList as Array<[string, string, string, string]>).map(([fam, style, weight, file]) => {
		const ff = new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {style, weight});
		document.fonts.add(ff);
		return ff.load();
	}),
).then(() => continueRender(handle));



export const inter = 'Inter';
export const serif = 'DM Serif Display';
export const mono = 'JetBrains Mono';

export const FPS = 30;
export const DURATION = 46 * FPS;
export const f = (sec: number) => Math.round(sec * FPS);

export const C = {
	bg: '#060609',
	coral: '#FF6A3D',
	pink: '#FF2E88',
	violet: '#7C5CFF',
	white: '#F7F7FA',
	dim: '#8A8A96',
};
export const GRAD = `linear-gradient(100deg, ${C.coral} 0%, ${C.pink} 50%, ${C.violet} 100%)`;

export const env = envJson as {n: number[]; u: number[]; r: number[]};
export const envAt = (k: 'n' | 'u' | 'r', frame: number) => {
	const a = env[k];
	const i = Math.max(0, Math.min(a.length - 1, frame));
	// light smoothing
	const p = a[Math.max(0, i - 1)] ?? 0;
	const q = a[Math.min(a.length - 1, i + 1)] ?? 0;
	return (p + a[i] * 2 + q) / 4;
};

export const ease = Easing.bezier(0.16, 1, 0.3, 1);
// progress 0..1 from t0 over dur seconds (absolute frames)
export const prog = (frame: number, t0: number, dur = 0.5, e = ease) =>
	interpolate(frame, [f(t0), f(t0) + Math.max(1, f(dur))], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: e,
	});
export const fadeWindow = (frame: number, a: number, b: number, fin = 0.35, fout = 0.35) =>
	Math.min(prog(frame, a, fin), 1 - prog(frame, b - fout, fout));

// Frame offset of the enclosing Sequence on the env timeline (env.json is in main-timeline frames).
export const EnvOffset = React.createContext(0);
