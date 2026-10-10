import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, E, prog} from '../lib/theme';
import {Lockup} from '../ap/Brand';
import {glitchAt} from './Typer';

/** paper page with the brand-reel furniture: lockup top-left, mono index top-right, hairline rules */
export const Page: React.FC<{t: number; index?: string; label?: string; children: React.ReactNode; bg?: string; rules?: boolean; lockup?: boolean}> = ({t, index, label, children, bg = C.paper, rules = true, lockup = true}) => (
	<AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
		{rules ? (
			<>
				<div style={{position: 'absolute', left: 96, right: 96, top: 128, height: 1, background: C.hair, transform: `scaleX(${prog(t, 0, 0.4, E.out)})`, transformOrigin: '0 0'}} />
			</>
		) : null}
		{lockup ? <Lockup h={40} style={{position: 'absolute', left: 96, top: 62}} /> : null}
		{index ? (
			<div style={{position: 'absolute', right: 96, top: 70, fontFamily: F.mono, fontSize: 22, color: C.ink, letterSpacing: '0.02em', display: 'flex', gap: 22}}>
				{label ? <span style={{color: C.mute}}>{label}</span> : null}
				<span>
					{index}
					{t < 0.25 ? <span style={{color: C.orange}}>{glitchAt(t, 9)}</span> : null}
				</span>
			</div>
		) : null}
		{children}
	</AbsoluteFill>
);

/** a crop of a 1920x1080 app frame placed into a box on the page */
export const Plate: React.FC<{
	box: {x: number; y: number; w: number; h: number};
	crop?: {x: number; y: number; w: number}; // region of the 1920x1080 child to show (height follows the box aspect)
	children: React.ReactNode;
	radius?: number;
	shadow?: boolean;
	style?: React.CSSProperties;
}> = ({box, crop = {x: 0, y: 0, w: 1920}, children, radius = 14, shadow = true, style}) => {
	const s = box.w / crop.w;
	return (
		<div
			style={{
				position: 'absolute',
				left: box.x,
				top: box.y,
				width: box.w,
				height: box.h,
				borderRadius: radius,
				overflow: 'hidden',
				boxShadow: shadow ? '0 0 0 1px rgba(18,16,16,0.22), 0 30px 70px rgba(18,16,16,0.18), 0 8px 20px rgba(18,16,16,0.10)' : '0 0 0 1px rgba(18,16,16,0.22)',
				background: '#000',
				...style,
			}}
		>
			<div style={{position: 'absolute', left: -crop.x * s, top: -crop.y * s, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '0 0'}}>{children}</div>
		</div>
	);
};
