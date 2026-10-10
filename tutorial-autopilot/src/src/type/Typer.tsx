import React from 'react';
import {C, F, E, clamp, prog, rand, spr} from '../lib/theme';

/**
 * Brand-reel typing (james-design motion/brand-reel "accent-tail typer"):
 * characters appear one by one, each drawn in the accent colour for `hold` seconds
 * before it settles to ink, with a glitchy cursor glyph trailing while it types.
 * Lines can carry inline badges (orange tiles with a glyph) that count as one character.
 */
export type Badge = {b: 'pause' | 'play' | 'cursor' | 'check' | 'link' | 'steps' | 'apps' | 'spark'; fill?: string; t0?: number};
export type Txt = {s: string; t0?: number; color?: string};
export type Seg = string | Badge | Txt;
export type Line = {t0: number; segs: Seg[]; cps?: number; color?: string; hold?: number};

const GLYPHS = ['|', ']', '[', '/', '%', '*', '<', '|]', '_'];
export const glitchAt = (t: number, seed = 0) => GLYPHS[Math.floor(rand(Math.floor(t * 15) + seed * 7) * GLYPHS.length)];

const BadgeGlyph: React.FC<{b: Badge['b']; s: number; color: string}> = ({b, s, color}) => {
	const st = {fill: color};
	switch (b) {
		case 'pause':
			return (
				<g>
					<rect x={s * 0.3} y={s * 0.26} width={s * 0.13} height={s * 0.48} rx={s * 0.02} {...st} />
					<rect x={s * 0.57} y={s * 0.26} width={s * 0.13} height={s * 0.48} rx={s * 0.02} {...st} />
				</g>
			);
		case 'play':
			return <path d={`M${s * 0.36} ${s * 0.25} L${s * 0.36} ${s * 0.75} L${s * 0.76} ${s * 0.5} Z`} {...st} />;
		case 'cursor':
			return (
				<path
					transform={`translate(${s * 0.3} ${s * 0.2}) scale(${s / 36})`}
					d="M2 2 L2 23.5 L7.2 18.6 L10.6 26.6 L14.3 25 L10.9 17.2 L18 17.2 Z"
					{...st}
				/>
			);
		case 'check':
			return <path d={`M${s * 0.27} ${s * 0.52} L${s * 0.43} ${s * 0.68} L${s * 0.74} ${s * 0.33}`} fill="none" stroke={color} strokeWidth={s * 0.11} strokeLinecap="square" />;
		case 'link':
			return (
				<g fill="none" stroke={color} strokeWidth={s * 0.08}>
					<rect x={s * 0.2} y={s * 0.38} width={s * 0.36} height={s * 0.24} rx={s * 0.12} />
					<rect x={s * 0.44} y={s * 0.38} width={s * 0.36} height={s * 0.24} rx={s * 0.12} />
				</g>
			);
		case 'steps':
			return (
				<g {...st}>
					{[0, 1, 2].map((i) => (
						<rect key={i} x={s * 0.24} y={s * (0.27 + i * 0.18)} width={s * (0.52 - i * 0.1)} height={s * 0.09} />
					))}
				</g>
			);
		case 'apps':
			return (
				<g {...st}>
					{[0, 1, 2, 3].map((i) => (
						<rect key={i} x={s * (0.25 + (i % 2) * 0.27)} y={s * (0.25 + Math.floor(i / 2) * 0.27)} width={s * 0.21} height={s * 0.21} rx={s * 0.03} />
					))}
				</g>
			);
		default:
			return <circle cx={s / 2} cy={s / 2} r={s * 0.2} {...st} />;
	}
};

/** an inline badge tile; pops in when typed */
export const BadgeTile: React.FC<{b: Badge; size: number; t: number; t0: number}> = ({b, size, t, t0}) => {
	const p = spr(t, t0, 26, 0.55);
	const fresh = t - t0 < 0.25;
	const bg = b.fill ?? (fresh ? C.orange : C.ink);
	return (
		<svg width={size} height={size} style={{display: 'inline-block', verticalAlign: 'baseline', transform: `scale(${0.4 + 0.6 * p})`, transformOrigin: '50% 60%', margin: `0 ${size * 0.12}px`, position: 'relative', top: size * 0.06}}>
			<rect x={0} y={0} width={size} height={size} rx={size * 0.14} fill={bg} />
			<BadgeGlyph b={b.b} s={size} color={fresh ? C.ink : C.paper} />
		</svg>
	);
};

const isBadge = (x: Seg): x is Badge => typeof x === 'object' && 'b' in x;
const segText = (x: Seg) => (typeof x === 'string' ? x : isBadge(x) ? null : x.s);
/** birth time of every character / badge in a line */
const births = (l: Line) => {
	const cps = l.cps ?? 34;
	const out: number[] = [];
	let next = l.t0;
	for (const sg of l.segs) {
		const own = typeof sg === 'object' && sg.t0 !== undefined ? sg.t0 : undefined;
		if (own !== undefined) next = own;
		const txt = segText(sg);
		const n = txt === null ? 1 : txt.length;
		for (let i = 0; i < n; i++) {
			out.push(next);
			next += 1 / cps;
		}
	}
	return out;
};
export const lineLen = (l: Line) => births(l).length;
/** time the line finishes typing */
export const lineEnd = (l: Line) => {
	const b = births(l);
	return b[b.length - 1] ?? l.t0;
};

/** one typed line (HTML), mono caps by default */
export const TypeLine: React.FC<{
	t: number;
	line: Line;
	size: number;
	font?: string;
	weight?: number;
	color?: string;
	accent?: string;
	tracking?: number;
	seed?: number;
	cursor?: boolean;
	badgeScale?: number;
	style?: React.CSSProperties;
}> = ({t, line, size, font = F.mono, weight = 560, color = C.ink, accent = C.orange, tracking = -0.035, seed = 0, cursor = true, badgeScale = 0.74, style}) => {
	const hold = line.hold ?? 0.09;
	const bt = births(line);
	const base: React.CSSProperties = {fontFamily: font, fontSize: size, fontWeight: weight, lineHeight: 1.0, letterSpacing: `${tracking}em`, whiteSpace: 'pre', color, minHeight: size, ...style};
	if (t < line.t0 || !bt.length || t < bt[0]) return <div style={base} />;
	let k = 0;
	const out: React.ReactNode[] = [];
	let typing = false;
	line.segs.forEach((sg, si) => {
		const txt = segText(sg);
		const segColor = typeof sg === 'object' && !isBadge(sg) ? sg.color : undefined;
		if (txt !== null) {
			for (let i = 0; i < txt.length; i++, k++) {
				const born = bt[k];
				if (t < born) {
					typing = typing || i === 0 || t >= bt[k - 1];
					continue;
				}
				const fresh = t - born < hold;
				if (fresh) typing = true;
				out.push(
					<span key={`${si}-${i}`} style={{color: fresh ? accent : segColor ?? line.color ?? color}}>
						{txt[i]}
					</span>,
				);
			}
		} else {
			const born = bt[k];
			if (t >= born) out.push(<BadgeTile key={`b${si}`} b={sg as Badge} size={size * badgeScale} t={t} t0={born} />);
			k++;
		}
	});
	const last = bt[bt.length - 1];
	const showCursor = cursor && (t < last + hold * 0.8) && typing;
	return (
		<div style={base}>
			{out}
			{showCursor ? <span style={{color: accent}}>{glitchAt(t, seed)}</span> : null}
		</div>
	);
};

/** stacked typed lines */
export const TypeBlock: React.FC<{
	t: number;
	lines: Line[];
	size: number;
	x: number;
	y: number;
	gap?: number;
	align?: 'left' | 'center' | 'right';
	weight?: number;
	font?: string;
	tracking?: number;
	width?: number;
	style?: React.CSSProperties;
}> = ({t, lines, size, x, y, gap = 0.04, align = 'left', weight, font, tracking, width, style}) => (
	<div style={{position: 'absolute', left: x, top: y, width, textAlign: align, display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center', gap: size * gap, ...style}}>
		{lines.map((l, i) => (
			<TypeLine key={i} t={t} line={l} size={size} seed={i * 3 + 1} weight={weight} font={font} tracking={tracking} />
		))}
	</div>
);

/** "zoom-in typing phase" from the brand reel: the block starts big about a pivot and settles */
export const zoomSettle = (t: number, t0: number, from = 1.45, dur = 0.55) => 1 + (from - 1) * (1 - prog(t, t0, t0 + dur, E.inOut));
export const fadeOut = (t: number, t1: number, d = 0.12) => 1 - clamp((t - t1) / d);
