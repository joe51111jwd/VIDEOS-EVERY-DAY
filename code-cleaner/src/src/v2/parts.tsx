import React from 'react';
import {interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {C, F, L, LF} from '../lib/theme';
import {CODE, Line, Morph} from '../ui/Code';
import {Tree} from '../ui/App';
import {MarkFlat, Obj, ce, easeOut} from './kit';

/* ------------------------------------------------------------------ the codebase as a landscape */
const text = (l: Line) => l.map((t) => t[0]).join('');
export const MESSY = CODE.messy.map(text);
export const CLEAN = CODE.clean.map(text);
// lines that read as AI mess get a red underglow
const isBug = (s: string) => /: any|=== false|=== true|TODO|=== null \|\||else \{|\/\/ (Initialize|Loop|Calculate|Check|Apply)/.test(s);

/**
 * A huge sheet of code: `cols` columns of the messy checkout, offset so they don't repeat side by side.
 * `wave(col, row)` returns 0 (messy) .. 1 (rewritten) for each line.
 */
export const CodeSheet: React.FC<{cols?: number; rows?: number; colW?: number; lh?: number; size?: number; wave?: (c: number, r: number) => number}> = ({
	cols = 9,
	rows = 96,
	colW = 940,
	lh = 40,
	size = 22,
	wave,
}) => {
	const out: React.ReactNode[] = [];
	for (let c = 0; c < cols; c++) {
		const lines: React.ReactNode[] = [];
		for (let r = 0; r < rows; r++) {
			const k = (r + c * 37) % MESSY.length;
			const w = wave ? wave(c, r) : 0;
			const s = w > 0.5 ? CLEAN[(r + c * 11) % CLEAN.length] : MESSY[k];
			const bug = isBug(MESSY[k]);
			const base = bug ? '#C0392F' : '#5A606A';
			const col = w > 0 ? interpolateColors(Math.min(1, w * 1.6), [0, 1], [base, w > 0.5 ? '#2FD39A' : '#7DFFD0']) : base;
			lines.push(
				<div
					key={r}
					style={{
						height: lh,
						lineHeight: `${lh}px`,
						whiteSpace: 'pre',
						overflow: 'hidden',
						color: col,
						textShadow: bug && w < 0.5 ? '0 0 16px rgba(255,69,58,0.8)' : w > 0.5 ? '0 0 14px rgba(61,245,176,0.5)' : undefined,
					}}
				>
					<span style={{color: '#30343B', marginRight: 22}}>{String(r + 1 + c * rows).padStart(5, ' ')}</span>
					{s}
				</div>,
			);
		}
		out.push(
			<div key={c} style={{width: colW, flexShrink: 0}}>
				{lines}
			</div>,
		);
	}
	return <div style={{display: 'flex', gap: 60, fontFamily: F.mono, fontSize: size}}>{out}</div>;
};

/* ------------------------------------------------------------------ app window */
const Lights = () => (
	<div style={{display: 'flex', gap: 9}}>
		{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
			<div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c, opacity: 0.9}} />
		))}
	</div>
);

export const Chrome: React.FC<{w: number; h: number; mode?: string; status?: React.ReactNode; children: React.ReactNode; glow?: string}> = ({
	w,
	h,
	mode = 'Upkeep',
	status,
	children,
	glow,
}) => (
	<div
		style={{
			width: w,
			height: h,
			borderRadius: 22,
			background: 'linear-gradient(180deg, rgba(26,28,33,0.96), rgba(14,15,18,0.97))',
			boxShadow: `0 0 0 1px rgba(255,255,255,0.09), inset 0 1px 0 rgba(255,255,255,0.08), 0 50px 140px rgba(0,0,0,0.75)${glow ? `, 0 0 120px ${glow}` : ''}`,
			overflow: 'hidden',
			display: 'flex',
			flexDirection: 'column',
			fontFamily: F.mono,
			color: C.text,
		}}
	>
		<div style={{height: 58, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0}}>
			<Lights />
			<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
				<MarkFlat size={30} />
				<span style={{fontFamily: LF.sans, fontWeight: 600, fontSize: 21, letterSpacing: '-0.02em', color: L.ink}}>Lossless</span>
			</div>
			<div style={{fontSize: 16, color: C.sub, padding: '5px 12px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8}}>northstar-shop · main</div>
			<div style={{flex: 1}} />
			<div style={{display: 'flex', background: 'rgba(0,0,0,0.35)', borderRadius: 9, padding: 3, gap: 3, fontSize: 16}}>
				{['Upkeep', 'Speed', 'Port'].map((m) => (
					<div key={m} style={{padding: '5px 14px', borderRadius: 7, background: m === mode.split(' ')[0] ? 'rgba(255,255,255,0.1)' : undefined, color: m === mode.split(' ')[0] ? L.ink : C.sub}}>
						{m === mode.split(' ')[0] ? mode : m}
					</div>
				))}
			</div>
			<div style={{flex: 1}} />
			<div style={{fontSize: 16, color: C.sub, minWidth: 250, textAlign: 'right'}}>{status}</div>
		</div>
		<div style={{flex: 1, display: 'flex', minHeight: 0}}>{children}</div>
	</div>
);

/** the rewrite, inside the app: tree on the left, the function rewriting itself */
export const RewriteWin: React.FC<{at: number; dur: number; w?: number; h?: number}> = ({at, dur, w = 1360, h = 820}) => {
	const f = useCurrentFrame();
	const lines = Math.round(interpolate(f, [at, at + dur], [220, 57], ce));
	const done = f >= at + dur;
	return (
		<Chrome
			w={w}
			h={h}
			status={done ? <span style={{color: L.mint}}>✓ proven identical</span> : 'rewriting…'}
			glow={done ? 'rgba(61,245,176,0.10)' : undefined}
		>
			<Tree w={300} firstAt={at + dur} rowH={30} size={17} />
			<div style={{flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0}}>
				<div style={{height: 50, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 18}}>
					<span style={{color: C.text}}>lib/checkout.ts</span>
					<span style={{color: C.sub}}>calculateCheckoutTotal()</span>
					<div style={{flex: 1}} />
					<span style={{color: done ? L.mint : C.sub}}>{lines} lines</span>
				</div>
				<div style={{flex: 1, minHeight: 0, padding: '8px 0 0 4px'}}>
					<Morph old={CODE.messy} next={CODE.clean} at={at} dur={dur} size={20} lh={30} height={h - 120} />
				</div>
			</div>
		</Chrome>
	);
};

/* ------------------------------------------------------------------ floating dust (depth cue) */
const rand = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};
export const Dust: React.FC<{n?: number; color?: string; spread?: number; zNear?: number; zFar?: number; drift?: number; size?: number}> = ({
	n = 40,
	color = 'rgba(61,245,176,0.55)',
	spread = 2600,
	zNear = -500,
	zFar = -4200,
	drift = 0.6,
	size = 10,
}) => {
	const f = useCurrentFrame();
	return (
		<>
			{Array.from({length: n}, (_, i) => {
				const x = (rand(i) - 0.5) * spread * 1.6;
				const y = (rand(i + 99) - 0.5) * spread * 0.8 - f * drift * (0.5 + rand(i + 7));
				const z = zNear + (zFar - zNear) * rand(i + 31);
				const s = size * (0.5 + rand(i + 53));
				return (
					<Obj key={i} x={x} y={y} z={z}>
						<div style={{width: s, height: s, borderRadius: s, background: color, boxShadow: `0 0 ${s * 2}px ${color}`}} />
					</Obj>
				);
			})}
		</>
	);
};

/** a pill-shaped glass tag */
export const Pill: React.FC<{children: React.ReactNode; color?: string; size?: number; glow?: number; bg?: string}> = ({children, color = L.ink, size = 30, glow = 0, bg}) => (
	<div
		style={{
			fontFamily: LF.mono,
			fontSize: size,
			color,
			padding: `${size * 0.42}px ${size * 0.8}px`,
			borderRadius: size * 2,
			background: bg ?? 'linear-gradient(180deg, rgba(40,43,49,0.92), rgba(20,22,26,0.94))',
			boxShadow: `0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.1), 0 20px 50px rgba(0,0,0,0.6)${glow ? `, 0 0 ${60 * glow}px ${color}55` : ''}`,
			whiteSpace: 'nowrap',
		}}
	>
		{children}
	</div>
);

export const pop = (f: number, at: number, d = 10) => interpolate(f - at, [0, d], [0, 1], {...ce, easing: easeOut});
