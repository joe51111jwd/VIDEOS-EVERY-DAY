import React from 'react';
import {C, F, clamp, prog, E} from '../lib/theme';

/** minimal browser window: traffic lights, url pill, white page */
export const Browser: React.FC<{w: number; h: number; url: string; children: React.ReactNode; dark?: boolean}> = ({w, h, url, children, dark}) => (
	<div
		style={{
			position: 'relative',
			width: w,
			height: h,
			borderRadius: 18,
			overflow: 'hidden',
			background: dark ? '#111' : C.page,
			boxShadow: '0 40px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
		}}
	>
		<div style={{position: 'absolute', left: 0, top: 0, width: w, height: 58, background: dark ? '#1a1a1a' : '#F3F3F1', borderBottom: `1px solid ${dark ? '#2a2a2a' : C.line}`}}>
			{['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
				<div key={i} style={{position: 'absolute', left: 24 + i * 24, top: 22, width: 14, height: 14, borderRadius: 7, background: c}} />
			))}
			<div
				style={{
					position: 'absolute',
					left: w / 2 - 230,
					top: 12,
					width: 460,
					height: 34,
					borderRadius: 10,
					background: dark ? '#262626' : '#E8E8E5',
					fontFamily: F.ui,
					fontSize: 17,
					fontWeight: 500,
					color: dark ? '#bbb' : 'rgba(0,0,0,0.62)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 8,
				}}
			>
				<svg width="12" height="14" viewBox="0 0 12 14">
					<rect x="1" y="6" width="10" height="7.5" rx="2" fill="currentColor" />
					<path d="M3.2 6V4.2a2.8 2.8 0 0 1 5.6 0V6" stroke="currentColor" strokeWidth="1.6" fill="none" />
				</svg>
				{url}
			</div>
		</div>
		<div style={{position: 'absolute', left: 0, top: 58, width: w, height: h - 58, overflow: 'hidden'}}>{children}</div>
	</div>
);

/** typed text with a caret */
export const Typed: React.FC<{text: string; t: number; t0: number; cps?: number; caret?: boolean; style?: React.CSSProperties}> = ({text, t, t0, cps = 26, caret = true, style}) => {
	const n = Math.max(0, Math.min(text.length, Math.floor((t - t0) * cps)));
	const blink = Math.floor(t * 2.2) % 2 === 0 || n < text.length;
	return (
		<span style={style}>
			{text.slice(0, n)}
			{caret && t >= t0 - 0.4 ? <span style={{display: 'inline-block', width: '0.06em', height: '1.05em', background: C.go, verticalAlign: '-0.15em', marginLeft: 2, opacity: blink ? 1 : 0}} /> : null}
		</span>
	);
};

/** pop-in helper: opacity + rise, for UI parts landing on beats */
export const pop = (t: number, t0: number, dur = 0.35, rise = 26) => {
	const p = prog(t, t0, t0 + dur, E.out);
	return {opacity: clamp(p * 1.6), transform: `translateY(${(1 - p) * rise}px)`};
};

/** the Demand Test mark: a black split-flap tile with a green chip */
export const Mark: React.FC<{size: number; t?: number}> = ({size}) => {
	const r = size * 0.24;
	return (
		<div style={{position: 'relative', width: size, height: size, borderRadius: r, background: 'linear-gradient(180deg,#262626 0%,#1c1c1c 49.5%,#151515 50.5%,#101010 100%)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)'}}>
			<div style={{position: 'absolute', left: 0, top: size / 2 - size * 0.012, width: size, height: size * 0.024, background: '#000'}} />
			<div style={{position: 'absolute', left: size * 0.28, top: size * 0.22, width: size * 0.44, height: size * 0.56, borderRadius: size * 0.05, background: C.green}} />
			<div style={{position: 'absolute', left: size * 0.28, top: size / 2 - size * 0.012, width: size * 0.44, height: size * 0.024, background: 'rgba(0,0,0,0.55)'}} />
		</div>
	);
};

/** mouse pointer */
export const Pointer: React.FC<{x: number; y: number; down?: number}> = ({x, y, down = 0}) => (
	<svg style={{position: 'absolute', left: x - 4, top: y - 2, transform: `scale(${1 - down * 0.12})`, transformOrigin: '4px 2px', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))'}} width="34" height="44" viewBox="0 0 17 22">
		<path d="M1 1 L1 17 L5 13.2 L8 20 L10.6 18.8 L7.7 12.2 L13 12.2 Z" fill="#111" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
	</svg>
);
