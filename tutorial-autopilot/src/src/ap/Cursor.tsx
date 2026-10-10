import React from 'react';
import {C, F, E, clamp} from '../lib/theme';

export type CK = {t: number; x: number; y: number};

/** eased path through keyframes with a slight arc; holds at the ends */
export const cursorAt = (t: number, keys: CK[]) => {
	if (t <= keys[0].t) return {x: keys[0].x, y: keys[0].y};
	for (let i = 0; i < keys.length - 1; i++) {
		const a = keys[i];
		const b = keys[i + 1];
		if (t <= b.t) {
			const p = E.inOut(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
			const arc = Math.sin(p * Math.PI) * Math.min(40, Math.hypot(b.x - a.x, b.y - a.y) * 0.08);
			return {x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p - arc};
		}
	}
	const l = keys[keys.length - 1];
	return {x: l.x, y: l.y};
};

/** macOS pointer; with `tag` it carries Autopilot's orange name tag (it is the one driving) */
export const Pointer: React.FC<{x: number; y: number; s?: number; press?: number; tag?: boolean; opacity?: number}> = ({x, y, s = 1.4, press = 0, tag = false, opacity = 1}) => (
	<div style={{position: 'absolute', left: x, top: y, transform: `scale(${s * (1 - 0.12 * press)})`, transformOrigin: '0 0', opacity}}>
		<svg width="22" height="30" viewBox="0 0 22 30" style={{display: 'block', marginLeft: -2, marginTop: -2, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.45))'}}>
			<path d="M2 2 L2 23.5 L7.2 18.6 L10.6 26.6 L14.3 25 L10.9 17.2 L18 17.2 Z" fill="#000" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
		</svg>
		{tag ? (
			<div style={{position: 'absolute', left: 16, top: 24, padding: '3px 8px 4px', borderRadius: '2px 9px 9px 9px', background: C.orange, color: '#160C06', fontFamily: F.ui, fontSize: 12, fontWeight: 650, whiteSpace: 'nowrap'}}>Autopilot</div>
		) : null}
	</div>
);

/** click ripple */
export const Click: React.FC<{t: number; t0: number; x: number; y: number; color?: string}> = ({t, t0, x, y, color = C.orange}) => {
	const d = t - t0;
	if (d < 0 || d > 0.45) return null;
	const p = d / 0.45;
	return <div style={{position: 'absolute', left: x - 34 * p, top: y - 34 * p, width: 68 * p, height: 68 * p, borderRadius: '50%', border: `3px solid ${color}`, opacity: 1 - p}} />;
};
