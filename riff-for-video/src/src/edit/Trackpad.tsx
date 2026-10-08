import React from 'react';
import {clamp01, easeOut, pulse} from '../lib/tokens';
import {playheadAt} from './model';
import {ACT} from './timing';
import {PAD} from './layout';

// Two fingers scrubbing the trackpad. Natural scrolling: the fingers move with the filmstrip,
// so sliding left moves the playhead later.
const WINDOWS: [number, number][] = [
	[ACT.rew1 + 0.02, ACT.cut - 0.1],
	[ACT.markIn - 0.72, ACT.markOut],
];
const K = 82; // finger px per timeline second

const fingerAt = (t: number) => {
	for (const [a, b] of WINDOWS) {
		if (t >= a - 0.12 && t <= b + 0.18) {
			const Tm = (playheadAt(Math.max(0, a)) + playheadAt(b)) / 2;
			const dx = Math.max(-210, Math.min(210, -(playheadAt(Math.max(0, Math.min(b, t))) - Tm) * K));
			const on = Math.min(clamp01((t - (a - 0.12)) / 0.12), 1 - clamp01((t - b) / 0.18));
			return {dx, on, a};
		}
	}
	return null;
};
/** between scrubs the fingers rest lightly on the pad */
const restAt = (t: number) => 0.3 * clamp01((t - ACT.rew1 + 0.3) / 0.3) * (1 - clamp01((t - ACT.expand) / 0.2));

const Finger: React.FC<{x: number; y: number; o: number; s: number; ring: number}> = ({x, y, o, s, ring}) => (
	<div style={{position: 'absolute', left: x - 36, top: y - 40, width: 72, height: 80, opacity: o, transform: `scale(${s})`}}>
		{ring > 0 ? (
			<div style={{position: 'absolute', left: 36 - 36 - 22 * ring, top: 40 - 36 - 22 * ring, width: 72 + 44 * ring, height: 72 + 44 * ring, borderRadius: '50%', border: `3px solid rgba(255,170,120,${0.9 * (1 - ring)})`}} />
		) : null}
		<div
			style={{
				position: 'absolute',
				inset: 0,
				borderRadius: '46% 46% 44% 44%',
				background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.42), rgba(255,255,255,0.16) 62%, rgba(255,255,255,0.05) 100%)',
				boxShadow: '0 0 0 1.5px rgba(255,255,255,0.45), 0 0 26px rgba(255,255,255,0.18)',
			}}
		/>
	</div>
);

export const Trackpad: React.FC<{t: number}> = ({t}) => {
	const f = fingerAt(t);
	const cx = PAD.x + PAD.w / 2;
	const cy = PAD.y + PAD.h / 2 + 10;
	const rings = [ACT.markIn, ACT.markOut].map((m) => (t >= m && t < m + 0.45 ? easeOut((t - m) / 0.45) : 0));
	const ring = Math.max(...rings);
	const press = Math.max(pulse(t, ACT.markIn, 0.05, 0.25), pulse(t, ACT.markOut, 0.05, 0.25));
	const fingers = (dx: number, o: number, s: number, ringP: number) => (
		<>
			<Finger x={cx + dx - 44} y={cy + 6} o={o} s={s} ring={ringP} />
			<Finger x={cx + dx + 44} y={cy - 8} o={o} s={s} ring={ringP} />
		</>
	);
	let trail: React.ReactNode = null;
	if (f && f.on > 0.5) {
		const g1 = fingerAt(t - 0.05);
		const g2 = fingerAt(t - 0.1);
		trail = (
			<>
				{g2 && Math.abs(g2.dx - f.dx) > 6 ? fingers(g2.dx, 0.12 * f.on, 1, 0) : null}
				{g1 && Math.abs(g1.dx - f.dx) > 4 ? fingers(g1.dx, 0.22 * f.on, 1, 0) : null}
			</>
		);
	}
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none'}}>
			{/* body */}
			<div style={{position: 'absolute', left: PAD.x, top: PAD.y + 10, width: PAD.w, height: PAD.h, borderRadius: 36, background: '#050506', boxShadow: '0 40px 90px rgba(0,0,0,0.8)'}} />
			<div
				style={{
					position: 'absolute',
					left: PAD.x,
					top: PAD.y,
					width: PAD.w,
					height: PAD.h,
					borderRadius: 36,
					background: 'linear-gradient(165deg, #2A2A2F 0%, #1A1A1E 38%, #121215 100%)',
					boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 1.5px 0 rgba(255,255,255,0.16), inset 0 -10px 30px rgba(0,0,0,0.35)',
					overflow: 'hidden',
				}}
			>
				<div style={{position: 'absolute', left: -PAD.w * 0.2, top: -PAD.h * 0.6, width: PAD.w * 1.1, height: PAD.h * 1.1, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.07), transparent 65%)'}} />
				{press > 0 ? <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at ${50 + ((f?.dx ?? 0) / PAD.w) * 100}% 52%, rgba(255,150,100,${0.18 * press}), transparent 45%)`}} /> : null}
			</div>
			{trail}
			{f ? fingers(f.dx, Math.max(f.on, restAt(t)), 1 + 0.18 * (1 - easeOut(clamp01((t - (f.a - 0.12)) / 0.16))) * f.on - 0.04 * press, ring) : restAt(t) > 0.01 ? fingers(Math.sin(t * 1.3) * 3, restAt(t), 1, 0) : null}
		</div>
	);
};
