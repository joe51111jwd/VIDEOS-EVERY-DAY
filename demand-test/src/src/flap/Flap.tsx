import React from 'react';
import {C, F, clamp, rand} from '../lib/theme';

// Split-flap board. Every cell keeps a timeline of flips; a flip lasts FLIP seconds:
// the old top half falls (0..-90deg), then the new bottom half drops (90..0deg).
// Lowercase letters are colour chips (the Dark Side prism): r o y g b v, w = white chip.

export const FLIP = 0.1; // one flap, seconds
export const STEP = 0.075; // gap between flips while a cell rattles
export type Ev = {t: number; ch: string};
export type Msg = {
	t: number; // when the whole message is settled and readable
	lines: string[];
	align?: 'center' | 'left';
	top?: number; // first row (default: vertically centred)
	spread?: number; // how long the left-to-right settle wave lasts
	flips?: [number, number]; // min/max flips per changing cell
};

export const CHIP: Record<string, string> = {r: C.red, o: C.orange, y: C.yellow, g: C.green, b: C.blue, v: C.violet, w: C.white};
const DRUM = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$.,!?';
const isChip = (ch: string) => ch in CHIP;

export const layout = (m: Msg, cols: number, rows: number): string[][] => {
	const grid = Array.from({length: rows}, () => Array.from({length: cols}, () => ' '));
	const top = m.top ?? Math.floor((rows - m.lines.length) / 2);
	m.lines.forEach((line, i) => {
		const chars = [...line];
		if (chars.length > cols) throw new Error(`line too long for ${cols} cols: ${line}`);
		const left = m.align === 'left' ? 0 : Math.floor((cols - chars.length) / 2);
		chars.forEach((ch, j) => {
			if (top + i >= 0 && top + i < rows) grid[top + i][left + j] = ch;
		});
	});
	return grid;
};

/** flips for one cell going a -> b, all landing by `land` */
const rattle = (a: string, b: string, land: number, seed: number, flips: [number, number], chips: boolean): Ev[] => {
	if (a === b) return [];
	const n = Math.round(flips[0] + rand(seed) * (flips[1] - flips[0]));
	const evs: Ev[] = [];
	for (let k = 0; k < n; k++) {
		const r = rand(seed * 7.3 + k * 1.91);
		let ch = DRUM[1 + Math.floor(r * (DRUM.length - 1))];
		if (chips && rand(seed * 3.1 + k * 5.7) < 0.16) ch = 'roygbv'[Math.floor(rand(seed + k * 9.2) * 6)];
		evs.push({t: land - FLIP - (n - k) * STEP, ch});
	}
	evs.push({t: land - FLIP, ch: b});
	return evs;
};

/** turn a list of messages into per-cell flip timelines */
export const schedule = (msgs: Msg[], cols: number, rows: number, seed = 1, chips = true): Ev[][][] => {
	const out: Ev[][][] = Array.from({length: rows}, () => Array.from({length: cols}, () => [] as Ev[]));
	let prev = layout({t: 0, lines: []}, cols, rows);
	msgs.forEach((m, mi) => {
		const next = layout(m, cols, rows);
		const spread = m.spread ?? 0.14;
		for (let r = 0; r < rows; r++)
			for (let c = 0; c < cols; c++) {
				const s = seed * 1000 + mi * 97 + r * 31 + c * 7;
				const wave = spread * (1 - c / Math.max(1, cols - 1)) + 0.04 * rand(s + 0.5);
				const land = m.t - wave;
				out[r][c].push(...rattle(prev[r][c], next[r][c], land, s, m.flips ?? [4, 8], chips));
			}
		prev = next;
	});
	return out;
};

/** a flap counter: samples value(t) and flips whenever a digit changes */
export const counter = (value: (t: number) => number, digits: number, t0: number, t1: number, pad = ' '): Ev[][] => {
	const cells: Ev[][] = Array.from({length: digits}, () => []);
	const fmt = (v: number) => String(Math.max(0, Math.round(v))).padStart(digits, pad).slice(-digits);
	let last = ' '.repeat(digits);
	for (let t = t0; t <= t1 + 1e-6; t += STEP) {
		const s = fmt(value(t));
		for (let i = 0; i < digits; i++) if (s[i] !== last[i]) cells[i].push({t, ch: s[i]});
		last = s;
	}
	return cells;
};

const Half: React.FC<{ch: string; w: number; h: number; half: 'top' | 'bot'; shade?: number; size: number}> = ({ch, w, h, half, shade = 1, size}) => {
	const chip = CHIP[ch];
	const bg = chip ?? (half === 'top' ? C.flapTop : C.flapBot);
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				width: w,
				height: h / 2,
				overflow: 'hidden',
				background: bg,
				borderRadius: half === 'top' ? `${h * 0.045}px ${h * 0.045}px 0 0` : `0 0 ${h * 0.045}px ${h * 0.045}px`,
				filter: shade !== 1 ? `brightness(${shade})` : undefined,
			}}
		>
			{!chip && ch !== ' ' ? (
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: half === 'top' ? 0 : -h / 2,
						width: w,
						height: h,
						lineHeight: `${h}px`,
						textAlign: 'center',
						fontFamily: F.flap,
						fontWeight: 660,
						fontStretch: '72%',
						fontSize: size,
						color: C.ink,
						transform: `translateY(${h * 0.04}px)`,
					}}
				>
					{ch}
				</div>
			) : null}
			{/* sheen: lit from above */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background:
						half === 'top'
							? 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0) 60%, rgba(0,0,0,0.18))'
							: 'linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0) 35%, rgba(255,255,255,0.03))',
				}}
			/>
		</div>
	);
};

/** one cell at time t */
export const Cell: React.FC<{evs: Ev[]; t: number; w: number; h: number; x: number; y: number; init?: string}> = ({evs, t, w, h, x, y, init = ' '}) => {
	let k = -1;
	for (let i = 0; i < evs.length; i++) if (evs[i].t <= t) k = i;
	const size = h * 0.98;
	const next = k >= 0 ? evs[k].ch : init;
	const prev = k >= 1 ? evs[k - 1].ch : init;
	const p = k >= 0 ? clamp((t - evs[k].t) / FLIP) : 1;
	const moving = p < 1;
	const gap = Math.max(1.5, h * 0.016);
	const top = (child: React.ReactNode) => <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h / 2}}>{child}</div>;
	const bot = (child: React.ReactNode) => <div style={{position: 'absolute', left: 0, top: h / 2, width: w, height: h / 2}}>{child}</div>;
	let flapNode: React.ReactNode = null;
	let botShade = 1;
	if (moving) {
		if (p < 0.5) {
			const q = p / 0.5;
			const ang = -90 * q * q; // gravity
			botShade = 1 - 0.25 * Math.sin(q * Math.PI * 0.5);
			flapNode = (
				<div style={{position: 'absolute', left: 0, top: 0, width: w, height: h / 2, transformOrigin: '50% 100%', transform: `perspective(${h * 5}px) rotateX(${-ang}deg)`, backfaceVisibility: 'hidden'}}>
					<Half ch={prev} w={w} h={h} half="top" size={size} shade={1 - 0.55 * q} />
				</div>
			);
		} else {
			const q = (p - 0.5) / 0.5;
			const ang = 90 * (1 - q * q);
			botShade = 0.75 + 0.25 * q;
			flapNode = (
				<div style={{position: 'absolute', left: 0, top: h / 2, width: w, height: h / 2, transformOrigin: '50% 0%', transform: `perspective(${h * 5}px) rotateX(${ang}deg)`, backfaceVisibility: 'hidden'}}>
					<Half ch={next} w={w} h={h} half="bot" size={size} shade={1.35 - 0.35 * q} />
				</div>
			);
		}
	}
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
			{top(<Half ch={next} w={w} h={h} half="top" size={size} />)}
			{bot(<Half ch={moving ? prev : next} w={w} h={h} half="bot" size={size} shade={botShade} />)}
			{/* hinge */}
			<div style={{position: 'absolute', left: 0, top: h / 2 - gap / 2, width: w, height: gap, background: C.hinge}} />
			<div style={{position: 'absolute', left: -1, top: h / 2 - gap * 1.6, width: gap * 1.2, height: gap * 3.2, background: '#3a3a3a', borderRadius: 1}} />
			<div style={{position: 'absolute', right: -1, top: h / 2 - gap * 1.6, width: gap * 1.2, height: gap * 3.2, background: '#3a3a3a', borderRadius: 1}} />
			{flapNode}
		</div>
	);
};

export type BoardGeom = {cols: number; rows: number; cw: number; ch: number; gx: number; gy: number};
export const geom = (cols: number, rows: number, width: number, cellAspect = 0.66, gapRatio = 0.1): BoardGeom => {
	// width = cols*cw + (cols-1)*gx
	const cw = width / (cols + (cols - 1) * gapRatio);
	const gx = cw * gapRatio;
	const ch = cw / cellAspect;
	return {cols, rows, cw, ch, gx, gy: gx * 1.15};
};

/** the board face: cells only (no housing), positioned from (0,0) */
export const Board: React.FC<{t: number; evs: Ev[][][]; g: BoardGeom; init?: string[][]}> = ({t, evs, g, init}) => {
	const cells: React.ReactNode[] = [];
	for (let r = 0; r < g.rows; r++)
		for (let c = 0; c < g.cols; c++)
			cells.push(<Cell key={`${r}-${c}`} evs={evs[r][c]} t={t} w={g.cw} h={g.ch} x={c * (g.cw + g.gx)} y={r * (g.ch + g.gy)} init={init?.[r]?.[c]} />);
	return <div style={{position: 'absolute', left: 0, top: 0, width: g.cols * (g.cw + g.gx) - g.gx, height: g.rows * (g.ch + g.gy) - g.gy}}>{cells}</div>;
};
export const boardSize = (g: BoardGeom) => ({w: g.cols * (g.cw + g.gx) - g.gx, h: g.rows * (g.ch + g.gy) - g.gy});
