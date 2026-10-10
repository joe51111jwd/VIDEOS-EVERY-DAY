import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Board, BoardGeom, Ev, boardSize} from './Flap';
import {C, H, W} from '../lib/theme';

/** a full-frame board: housing, soft top light, slow push. cx/cy = board centre on screen */
export const BoardFrame: React.FC<{t: number; evs: Ev[][][]; g: BoardGeom; push?: [number, number, number]; cy?: number; children?: React.ReactNode}> = ({t, evs, g, push, cy = H / 2, children}) => {
	const s = boardSize(g);
	let z = 1;
	if (push) {
		const [t0, t1, amt] = push;
		const p = Math.max(0, Math.min(1, (t - t0) / Math.max(0.01, t1 - t0)));
		z = 1 + amt * p;
	}
	return (
		<AbsoluteFill style={{background: C.housing, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${z})`, transformOrigin: `50% ${(cy / H) * 100}%`}}>
				<div style={{position: 'absolute', left: (W - s.w) / 2, top: cy - s.h / 2}}>
					<Board t={t} evs={evs} g={g} />
				</div>
				{children}
			</div>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 18%, rgba(255,255,255,0.07), rgba(0,0,0,0) 65%)', pointerEvents: 'none'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 120% 90% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55))', pointerEvents: 'none'}} />
		</AbsoluteFill>
	);
};

/** the whole frame flips like one giant flap: A's top half falls away, B's bottom half drops in */
export const FlipWipe: React.FC<{t: number; t0: number; dur?: number; A: React.ReactNode; B: React.ReactNode}> = ({t, t0, dur = 0.36, A, B}) => {
	const p = Math.max(0, Math.min(1, (t - t0) / dur));
	if (p <= 0) return <AbsoluteFill>{A}</AbsoluteFill>;
	if (p >= 1) return <AbsoluteFill>{B}</AbsoluteFill>;
	const half = (node: React.ReactNode, which: 'top' | 'bot', style: React.CSSProperties = {}) => (
		<div style={{position: 'absolute', left: 0, top: which === 'top' ? 0 : H / 2, width: W, height: H / 2, overflow: 'hidden', ...style}}>
			<div style={{position: 'absolute', left: 0, top: which === 'top' ? 0 : -H / 2, width: W, height: H}}>{node}</div>
		</div>
	);
	const q = p < 0.5 ? p / 0.5 : (p - 0.5) / 0.5;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{half(B, 'top')}
			{half(p < 0.5 ? A : B, 'bot', {filter: p < 0.5 ? `brightness(${1 - 0.5 * q})` : `brightness(${0.6 + 0.4 * q})`})}
			{p < 0.5 ? (
				<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H / 2, transformOrigin: '50% 100%', transform: `perspective(2600px) rotateX(${-90 * q * q}deg)`, filter: `brightness(${1 - 0.6 * q})`}}>
					{half(A, 'top', {top: 0})}
				</div>
			) : (
				<div style={{position: 'absolute', left: 0, top: H / 2, width: W, height: H / 2, transformOrigin: '50% 0%', transform: `perspective(2600px) rotateX(${90 * (1 - q * q)}deg)`, filter: `brightness(${1.3 - 0.3 * q})`}}>
					{half(B, 'bot', {top: 0})}
				</div>
			)}
			<div style={{position: 'absolute', left: 0, top: H / 2 - 3, width: W, height: 6, background: '#000'}} />
		</AbsoluteFill>
	);
};
