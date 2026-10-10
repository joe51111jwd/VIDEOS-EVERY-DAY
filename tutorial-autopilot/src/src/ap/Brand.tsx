import React from 'react';
import {C, F, E, prog} from '../lib/theme';

/** Tutorial Autopilot mark: an ink tile, an orange play triangle (the tutorial)
 *  with a white pointer riding its tip (your computer, doing it). */
export const MARK_PLAY = 'M30 22 L30 78 L76 50 Z';
export const MARK_PTR = 'M0 0 L0 21.5 L5.2 16.6 L8.6 24.6 L12.3 23 L8.9 15.2 L16 15.2 Z';

export const Mark: React.FC<{size: number; t?: number; t0?: number; ink?: string; build?: boolean}> = ({size, t = 99, t0 = 0, ink = C.ink, build = false}) => {
	const pTile = build ? prog(t, t0, t0 + 0.35, E.out) : 1;
	const pPlay = build ? prog(t, t0 + 0.12, t0 + 0.5, E.out) : 1;
	const pPtr = build ? prog(t, t0 + 0.3, t0 + 0.7, E.out) : 1;
	return (
		<svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block', overflow: 'visible'}}>
			<rect x={50 - 50 * pTile} y={50 - 50 * pTile} width={100 * pTile} height={100 * pTile} rx={23 * pTile} fill={ink} />
			<g transform={`translate(50 50) scale(${pPlay}) translate(-50 -50)`}>
				<path d={MARK_PLAY} fill={C.orange} stroke={C.orange} strokeWidth={7} strokeLinejoin="round" />
			</g>
			<g transform={`translate(${58 + (1 - pPtr) * 18} ${48 + (1 - pPtr) * 18}) scale(${1.55})`} opacity={pPtr}>
				<path d={MARK_PTR} fill="#fff" stroke={ink} strokeWidth={2.2} strokeLinejoin="round" />
			</g>
		</svg>
	);
};

export const Wordmark: React.FC<{size: number; color?: string; weight?: number}> = ({size, color = C.ink, weight = 600}) => (
	<div style={{fontFamily: F.head, fontSize: size, fontWeight: weight, letterSpacing: '-0.035em', color, lineHeight: 1, whiteSpace: 'nowrap'}}>
		Tutorial Autopilot
	</div>
);

export const Lockup: React.FC<{h: number; color?: string; style?: React.CSSProperties}> = ({h, color = C.ink, style}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: h * 0.36, ...style}}>
		<Mark size={h} />
		<Wordmark size={h * 0.62} color={color} />
	</div>
);
