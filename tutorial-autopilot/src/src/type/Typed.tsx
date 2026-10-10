import React from 'react';
import {C, F} from '../lib/theme';
import {Badge, BadgeTile, glitchAt} from './Typer';

/**
 * Brand-reel "accent-tail typer" driven by keys: each key is the whole text at that moment.
 * A new key keeps the common prefix of the previous one, backspaces the rest, then types on.
 * By default the backspacing finishes exactly at the key time, so the new letters start on the beat.
 * `~` toggles permanent accent colour; ⏸ ▶ ✓ ↖ are inline badge tiles; `\n` breaks the line.
 */
export type Key = {t: number; text: string; cps?: number; pre?: boolean};

type Tok = {ch: string; o: boolean};
const BADGES: Record<string, Badge['b']> = {'⏸': 'pause', '▶': 'play', '✓': 'check', '↖': 'cursor'};

const tokens = (s: string): Tok[] => {
	const out: Tok[] = [];
	let o = false;
	for (const ch of Array.from(s)) {
		if (ch === '~') {
			o = !o;
			continue;
		}
		out.push({ch, o});
	}
	return out;
};

type Plan = {toks: Tok[]; born: number[]; p: number; delStart: number; delDur: number};

const plan = (keys: Key[], delCps: number, cpsDef: number): Plan[] => {
	const out: Plan[] = [];
	keys.forEach((k, i) => {
		const toks = tokens(k.text);
		const cps = k.cps ?? cpsDef;
		const prev = out[i - 1];
		let p = 0;
		if (prev) while (p < prev.toks.length && p < toks.length && prev.toks[p].ch === toks[p].ch && prev.toks[p].o === toks[p].o) p++;
		const n = prev ? prev.toks.length - p : 0;
		const delDur = n / delCps;
		const pre = k.pre ?? true;
		const delStart = pre ? k.t - delDur : k.t;
		const typeStart = pre ? k.t : k.t + delDur;
		const born = toks.map((_, j) => (j < p && prev ? prev.born[j] : typeStart + (j - p) / cps));
		out.push({toks, born, p, delStart, delDur});
	});
	return out;
};

export const Typed: React.FC<{
	t: number;
	keys: Key[];
	size: number;
	x?: number;
	y?: number;
	font?: string;
	weight?: number;
	tracking?: number;
	color?: string;
	accent?: string;
	hold?: number;
	cps?: number;
	delCps?: number;
	lineHeight?: number;
	align?: 'left' | 'center' | 'right';
	width?: number;
	flip?: number; // pause badges turn into play badges at this time
	cursor?: boolean;
	seed?: number;
	style?: React.CSSProperties;
}> = ({t, keys, size, x = 0, y = 0, font = F.mono, weight = 560, tracking = -0.035, color = C.ink, accent = C.orange, hold = 0.09, cps = 34, delCps = 80, lineHeight = 1.04, align = 'left', width, flip, cursor = true, seed = 0, style}) => {
	const P = plan(keys, delCps, cps);
	let k = -1;
	for (let i = 0; i < P.length; i++) if (t >= P[i].delStart) k = i;
	const box: React.CSSProperties = {position: 'absolute', left: x, top: y, width, textAlign: align, fontFamily: font, fontSize: size, fontWeight: weight, letterSpacing: `${tracking}em`, lineHeight, whiteSpace: 'pre', color, ...style};
	if (k < 0) return <div style={box} />;
	const cur = P[k];
	const deleting = k > 0 && t < cur.delStart + cur.delDur;
	// visible tokens with their birth times
	let vis: {tok: Tok; born: number}[] = [];
	let busy = false;
	if (deleting) {
		const prev = P[k - 1];
		const L = prev.toks.length;
		prev.toks.forEach((tok, j) => {
			if (t < prev.born[j]) return;
			if (j >= cur.p && t >= cur.delStart + (L - j) / delCps) return;
			vis.push({tok, born: prev.born[j]});
		});
		busy = true;
	} else {
		cur.toks.forEach((tok, j) => {
			if (t >= cur.born[j]) vis.push({tok, born: cur.born[j]});
		});
		const last = cur.born[cur.born.length - 1] ?? cur.delStart;
		busy = t < last + hold * 0.8;
	}
	// lines
	const lines: React.ReactNode[][] = [[]];
	vis.forEach(({tok, born}, i) => {
		if (tok.ch === '\n') {
			lines.push([]);
			return;
		}
		const fresh = t - born < hold;
		const b = BADGES[tok.ch];
		if (b) {
			const flipped = b === 'pause' && flip !== undefined && t >= flip;
			lines[lines.length - 1].push(<BadgeTile key={i} b={{b: flipped ? 'play' : b}} size={size * 0.74} t={t} t0={flipped ? flip! : born} />);
			return;
		}
		lines[lines.length - 1].push(
			<span key={i} style={{color: fresh || tok.o ? accent : color}}>
				{tok.ch}
			</span>,
		);
	});
	if (cursor && busy) lines[lines.length - 1].push(<span key="cur" style={{color: accent}}>{glitchAt(t, seed)}</span>);
	return (
		<div style={box}>
			{lines.map((l, i) => (
				<div key={i} style={{minHeight: size * lineHeight}}>
					{l}
				</div>
			))}
		</div>
	);
};
