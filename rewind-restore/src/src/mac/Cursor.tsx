import React from 'react';
import {easeInOut, clamp01} from '../lib/tokens';

export type CK = {t: number; x: number; y: number};

/** eased path through keyframes; holds at the ends */
export const cursorAt = (t: number, keys: CK[]) => {
	if (t <= keys[0].t) return {x: keys[0].x, y: keys[0].y};
	for (let i = 0; i < keys.length - 1; i++) {
		const a = keys[i];
		const b = keys[i + 1];
		if (t <= b.t) {
			const p = easeInOut(clamp01((t - a.t) / Math.max(1e-6, b.t - a.t)));
			// slight arc so moves don't look robotic
			const arc = Math.sin(p * Math.PI) * Math.min(40, Math.hypot(b.x - a.x, b.y - a.y) * 0.08);
			return {x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p - arc};
		}
	}
	const l = keys[keys.length - 1];
	return {x: l.x, y: l.y};
};

/** macOS arrow pointer; (x, y) is the hotspot */
export const Cursor: React.FC<{x: number; y: number; s?: number; press?: number; opacity?: number}> = ({x, y, s = 1.35, press = 0, opacity = 1}) => (
	<div style={{position: 'absolute', left: x, top: y, transform: `scale(${s * (1 - 0.12 * press)})`, transformOrigin: '0 0', opacity, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.45))'}}>
		<svg width="22" height="30" viewBox="0 0 22 30" style={{display: 'block', marginLeft: -2, marginTop: -2}}>
			<path d="M2 2 L2 23.5 L7.2 18.6 L10.6 26.6 L14.3 25 L10.9 17.2 L18 17.2 Z" fill="#000" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
		</svg>
	</div>
);
