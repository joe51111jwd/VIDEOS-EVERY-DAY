import React from 'react';
import {SANS, TIGHT} from '../lib/tokens';

// an arc on a circle (degrees clockwise from 12 o'clock)
const pt = (cx: number, cy: number, r: number, deg: number) => {
	const a = ((deg - 90) * Math.PI) / 180;
	return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
	const [x0, y0] = pt(cx, cy, r, a0);
	const [x1, y1] = pt(cx, cy, r, a1);
	const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
	return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

/** mono menu-bar glyph: a counter-clockwise arrow around a clock reading 10:42 */
export const RewindGlyph: React.FC<{s?: number; c?: string}> = ({s = 18, c = '#fff'}) => {
	const [ax, ay] = pt(12, 12, 8.4, 330);
	return (
		<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
			<path d={arc(12, 12, 8.4, 30, 330)} />
			<path d={`M${ax - 3.4} ${ay - 2.2} L${ax + 0.3} ${ay + 0.2} L${ax - 1.2} ${ay + 3.9}`} />
			<path d="M12 12V7.8M12 12l-2.8 1.6" />
		</svg>
	);
};

/** the app icon: graphite squircle, amber arrow ring, clock hands at 10:42 */
export const AppIcon: React.FC<{s?: number; spin?: number; glow?: number}> = ({s = 128, spin = 0, glow = 0}) => {
	const id = 'rr' + Math.round(s);
	const r = 31;
	const [ax, ay] = pt(50, 50, r, 318);
	// hands: hour at 10:42 (≈ 321°), minute at 42 min (252°)
	const [hx, hy] = pt(50, 50, 15, 321 - spin * 0.08);
	const [mx, my] = pt(50, 50, 22, 252 - spin);
	return (
		<svg width={s} height={s} viewBox="0 0 100 100" style={{display: 'block', overflow: 'visible', filter: glow ? `drop-shadow(0 0 ${18 * glow}px rgba(255,160,60,${0.55 * glow}))` : undefined}}>
			<defs>
				<linearGradient id={id + 'bg'} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#36363C" />
					<stop offset="1" stopColor="#0C0C0E" />
				</linearGradient>
				<linearGradient id={id + 'ring'} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#FFD27A" />
					<stop offset="0.55" stopColor="#FFA23A" />
					<stop offset="1" stopColor="#FF5E2B" />
				</linearGradient>
				<linearGradient id={id + 'hi'} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="rgba(255,255,255,0.22)" />
					<stop offset="0.5" stopColor="rgba(255,255,255,0)" />
				</linearGradient>
			</defs>
			<path d="M50 0C88 0 100 12 100 50S88 100 50 100 0 88 0 50 12 0 50 0z" fill={`url(#${id}bg)`} />
			<path d="M50 0C88 0 100 12 100 50S88 100 50 100 0 88 0 50 12 0 50 0z" fill={`url(#${id}hi)`} />
			<path d="M50 .6C87.6.6 99.4 12.4 99.4 50S87.6 99.4 50 99.4.6 87.6.6 50 12.4.6 50 .6z" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
			<g transform={`rotate(${-spin} 50 50)`}>
				<path d={arc(50, 50, r, 30, 318)} fill="none" stroke={`url(#${id}ring)`} strokeWidth="8.5" strokeLinecap="round" />
				<path d={`M${ax - 9} ${ay - 5.5} L${ax + 1.6} ${ay + 0.4} L${ax - 2.6} ${ay + 10.5} Z`} fill="#FFC765" stroke="#FFC765" strokeWidth="2.4" strokeLinejoin="round" />
			</g>
			<path d={`M50 50 L${hx} ${hy}`} stroke="#fff" strokeWidth="5.2" strokeLinecap="round" />
			<path d={`M50 50 L${mx} ${my}`} stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />
			<circle cx="50" cy="50" r="4" fill="#fff" />
		</svg>
	);
};

export const Wordmark: React.FC<{size?: number; color?: string}> = ({size = 64, color = '#F5F5F7'}) => (
	<div style={{fontFamily: TIGHT, fontWeight: 650, fontSize: size, letterSpacing: '-0.035em', color, lineHeight: 1, whiteSpace: 'nowrap'}}>Rewind Restore</div>
);

export const Tagline: React.FC<{size?: number}> = ({size = 30}) => (
	<div style={{fontFamily: SANS, fontWeight: 500, fontSize: size, color: '#A1A1A8', letterSpacing: '-0.01em'}}>Undo for your whole Mac.</div>
);
