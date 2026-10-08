import React from 'react';
import {interpolate} from 'remotion';
import {C, SANS, clamp01, easeInOut, easeOut, lerp, step, textW} from '../lib/tokens';
import {Cmd, CMDS, FLY, WORD} from './timing';
import {HUD_Y, LANE, PHX, PPS, TL, VIEW, WIN} from './layout';
import {layoutAt, playheadAt} from './model';
import {voiceLevel} from './Window';

// What you say, shown (never heard): the words fill Riff's voice pill, then the line lifts off
// and flies to the spot it changes. The edit happens the instant it lands.
const HUD = {font: 50, h: 100, av: 64, padL: 18, gap: 22, padR: 42};
const textWidth = (text: string) => textW(text, HUD.font, 580, SANS, -0.015);
const pillW = (c: Cmd | null) => (c ? HUD.padL + HUD.av + HUD.gap + textWidth(c.text) + HUD.padR : HUD.padL * 2 + HUD.av);

const Mic: React.FC<{v: number}> = ({v}) => (
	<div
		style={{
			width: HUD.av,
			height: HUD.av,
			borderRadius: HUD.av / 2,
			background: 'linear-gradient(140deg, #FFB37E, #FF6A4D)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			boxShadow: `0 0 0 ${2 + 9 * clamp01(v * 1.4)}px rgba(255,150,100,${0.16 + 0.3 * clamp01(v * 1.4)})`,
		}}
	>
		<svg width={29} height={29} viewBox="0 0 20 20">
			<rect x={7} y={2.5} width={6} height={10} rx={3} fill="#2A1206" />
			<path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5" stroke="#2A1206" strokeWidth={1.8} fill="none" strokeLinecap="round" />
		</svg>
	</div>
);

const Words: React.FC<{c: Cmd; t: number}> = ({c, t}) => {
	const words = c.text.split(' ');
	return (
		<>
			{words.map((wd, k) => {
				const wt = c.a + k * WORD;
				const o = interpolate(t, [wt - 0.04, wt + 0.08], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				return (
					<span key={k} style={{opacity: o, whiteSpace: 'pre', display: 'inline-block', transform: `translateY(${(1 - o) * 8}px)`}}>
						{wd}
						{k < words.length - 1 ? ' ' : ''}
					</span>
				);
			})}
		</>
	);
};

const V1Y = WIN.y + TL.y + LANE.v1.y + LANE.v1.h / 2;
const tlX = (T: number, t: number) => Math.max(WIN.x + 120, Math.min(WIN.x + WIN.w - 40, WIN.x + PHX + (T - playheadAt(t)) * PPS));

/** where each line lands, in screen px */
export const targetOf = (c: Cmd): {x: number; y: number} => {
	const t = c.land;
	switch (c.id) {
		case 'lose': {
			const g = layoutAt(t - 0.01).find((h) => h.id === 'C1');
			return {x: g ? tlX(g.x + g.dur / 2, t) : WIN.x + PHX, y: V1Y};
		}
		case 'undo':
			return {x: tlX(5.5, t), y: V1Y};
		case 'trim':
			return {x: tlX(11.5, t), y: V1Y};
		case 'moody':
		case 'vertical':
			return {x: WIN.x + WIN.w / 2, y: WIN.y + VIEW.y + VIEW.h / 2};
		case 'back':
			return {x: WIN.x + PHX, y: WIN.y + TL.y + 12};
		case 'color':
			return {x: WIN.x + WIN.w / 2, y: WIN.y + TL.y + 40};
		case 'teal':
			return {x: WIN.x + WIN.w / 2, y: WIN.y + TL.y + 114};
		case 'less':
			return {x: WIN.x + 936, y: WIN.y + TL.y + 461};
		case 'smile':
			return {x: WIN.x + WIN.w / 2, y: WIN.y + TL.y + 40};
		case 'beat':
			return {x: WIN.x + PHX, y: WIN.y + TL.y + LANE.a2.y + LANE.a2.h / 2};
		default:
			return {x: WIN.x + PHX, y: V1Y};
	}
};

/** a line in flight at time t (null if it isn't flying) */
const flight = (c: Cmd, t: number) => {
	const t0 = c.land - FLY;
	if (t < t0 || t > c.land) return null;
	const p = (t - t0) / FLY;
	const k = p * p * (1.7 - 0.7 * p); // accelerates into the target
	const sx = WIN.x + WIN.w / 2;
	const sy = HUD_Y;
	const g = targetOf(c);
	// a gentle arc to one side
	const mx = (sx + g.x) / 2 + (g.x >= sx ? 90 : -90);
	const my = (sy + g.y) / 2 + 40;
	const x = (1 - k) * (1 - k) * sx + 2 * (1 - k) * k * mx + k * k * g.x;
	const y = (1 - k) * (1 - k) * sy + 2 * (1 - k) * k * my + k * k * g.y;
	return {x, y, s: lerp(1, 0.4, k), o: 1 - clamp01((p - 0.82) / 0.18)};
};

const Chip: React.FC<{c: Cmd; x: number; y: number; s: number; o: number}> = ({c, x, y, s, o}) => (
	<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, opacity: o, zIndex: 85}}>
		<div
			style={{
				height: 88,
				padding: '0 34px',
				borderRadius: 44,
				display: 'flex',
				alignItems: 'center',
				whiteSpace: 'nowrap',
				fontFamily: SANS,
				fontWeight: 620,
				fontSize: 48,
				letterSpacing: '-0.015em',
				color: '#FFF3E8',
				background: 'linear-gradient(180deg, rgba(92,48,24,0.96), rgba(52,26,12,0.96))',
				boxShadow: `0 0 0 2px ${C.ember}, 0 0 40px rgba(255,140,80,0.65), 0 20px 50px rgba(0,0,0,0.5)`,
			}}
		>
			{c.text}
		</div>
	</div>
);

const Impact: React.FC<{c: Cmd; t: number}> = ({c, t}) => {
	const d = t - c.land;
	if (d < 0 || d > 0.45) return null;
	const g = targetOf(c);
	const p = easeOut(d / 0.45);
	const r = lerp(12, 84, p);
	return (
		<div style={{position: 'absolute', left: g.x - r, top: g.y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `3px solid rgba(255,170,120,${0.95 * (1 - p)})`, boxShadow: `0 0 ${30 * (1 - p)}px rgba(255,140,80,${0.8 * (1 - p)}), inset 0 0 ${20 * (1 - p)}px rgba(255,170,120,${0.6 * (1 - p)})`, zIndex: 85}} />
	);
};

export const VoiceHUD: React.FC<{t: number; hide?: number}> = ({t, hide = 0}) => {
	const PRE = 0.18;
	const POST = 0.32;
	// the pill shows from just before the first word until shortly after the line flies off
	let i = -1;
	CMDS.forEach((c, k) => {
		if (t >= c.a - PRE) i = k;
	});
	const nodes: React.ReactNode[] = [];
	for (const c of CMDS) {
		const f = flight(c, t);
		if (f) nodes.push(<Chip key={c.id} c={c} x={f.x} y={f.y} s={f.s} o={f.o} />);
		nodes.push(<Impact key={`i${c.id}`} c={c} t={t} />);
	}
	let pill: React.ReactNode = null;
	if (i >= 0) {
		const c = CMDS[i];
		const next = CMDS[i + 1];
		const launch = c.land - FLY;
		const sent = clamp01((t - launch) / 0.1); // the text leaves the pill
		const linked = !!next && next.a - PRE - (launch + POST) < 0.35;
		const prev = i > 0 ? CMDS[i - 1] : null;
		const prevLinked = !!prev && c.a - PRE - (prev.land - FLY + POST) < 0.35;
		const vis = (prevLinked ? 1 : step(t, c.a - PRE, 0.2)) * (linked ? 1 : 1 - clamp01((t - launch - POST) / 0.2)) * (1 - hide);
		if (vis > 0.001) {
			// width: grows to fit the words, shrinks to the mic once they're sent
			const wIn = prevLinked ? lerp(pillW(null), pillW(c), easeInOut(clamp01((t - c.a + PRE) / 0.22))) : pillW(c);
			const w = lerp(wIn, pillW(null), easeInOut(sent));
			const enter = prevLinked ? 1 : step(t, c.a - PRE, 0.3);
			pill = (
				<div style={{position: 'absolute', left: 0, right: 0, top: HUD_Y - HUD.h / 2, display: 'flex', justifyContent: 'center', zIndex: 80}}>
					<div
						style={{
							position: 'relative',
							width: w,
							height: HUD.h,
							borderRadius: HUD.h / 2,
							background: 'linear-gradient(180deg, rgba(46,42,40,0.96) 0%, rgba(20,18,17,0.97) 100%)',
							boxShadow: '0 24px 60px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.16)',
							opacity: vis,
							transform: `translateY(${(1 - enter) * 16}px) scale(${0.94 + 0.06 * enter})`,
							overflow: 'hidden',
						}}
					>
						<div style={{position: 'absolute', left: HUD.padL, top: (HUD.h - HUD.av) / 2}}>
							<Mic v={voiceLevel(t)} />
						</div>
						<div
							style={{
								position: 'absolute',
								left: HUD.padL + HUD.av + HUD.gap,
								top: 0,
								height: HUD.h,
								display: 'flex',
								alignItems: 'center',
								whiteSpace: 'nowrap',
								fontFamily: SANS,
								fontWeight: 580,
								fontSize: HUD.font,
								letterSpacing: '-0.015em',
								color: '#F5F5F7',
								opacity: 1 - sent,
								transform: `translateY(${-sent * 14}px)`,
							}}
						>
							<Words c={c} t={t} />
						</div>
					</div>
				</div>
			);
		}
	}
	return (
		<>
			{pill}
			{nodes}
		</>
	);
};
