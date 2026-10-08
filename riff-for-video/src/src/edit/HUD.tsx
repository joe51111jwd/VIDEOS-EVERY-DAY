import React from 'react';
import {interpolate} from 'remotion';
import {SANS, clamp01, easeInOut, lerp, step, textW} from '../lib/tokens';
import {Line, LINES} from './timing';
import {HUD_Y} from './layout';
import {voiceLevel} from './Window';

// The floating transcript pill: what you say, word by word. It doubles as the captions.
const HUD = {font: 44, h: 90, av: 58, padL: 16, gap: 20, padR: 38};
const pillW = (l: Line) => HUD.padL + HUD.av + HUD.gap + textW(l.text, HUD.font, 580, SANS, -0.015) + HUD.padR;

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
		<svg width={26} height={26} viewBox="0 0 20 20">
			<rect x={7} y={2.5} width={6} height={10} rx={3} fill="#2A1206" />
			<path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5" stroke="#2A1206" strokeWidth={1.8} fill="none" strokeLinecap="round" />
		</svg>
	</div>
);

const Words: React.FC<{l: Line; t: number}> = ({l, t}) => {
	const words = l.text.split(' ');
	return (
		<>
			{words.map((wd, k) => {
				const wt = l.words[k] ?? l.a;
				const o = interpolate(t, [wt - 0.05, wt + 0.1], [0.3, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				return (
					<span key={k} style={{opacity: o, whiteSpace: 'pre'}}>
						{wd}
						{k < words.length - 1 ? ' ' : ''}
					</span>
				);
			})}
		</>
	);
};

export const VoiceHUD: React.FC<{t: number; hide?: number}> = ({t, hide = 0}) => {
	const PRE = 0.12;
	const POST = 0.5;
	const FADE = 0.18;
	let vis = 0;
	for (const l of LINES) vis = Math.max(vis, Math.min(clamp01((t - (l.a - PRE - FADE)) / FADE), 1 - clamp01((t - (l.b + POST)) / FADE)));
	vis *= 1 - hide;
	if (vis <= 0.001) return null;
	let i = -1;
	LINES.forEach((l, k) => {
		if (t >= l.a - PRE - FADE) i = k;
	});
	if (i < 0) return null;
	const c = LINES[i];
	const prev = i > 0 ? LINES[i - 1] : undefined;
	const s0 = c.a - PRE - FADE;
	const linked = !!prev && prev.b + POST + FADE > s0;
	const m = easeInOut(clamp01((t - s0) / 0.24));
	const w = linked ? lerp(pillW(prev!), pillW(c), m) : pillW(c);
	const oldTxt = linked ? 1 - clamp01((t - s0) / 0.12) : 0;
	const txt = step(t, s0 + (linked ? 0.08 : 0.06), 0.26);
	const entering = linked ? 1 : vis;
	const textBox = (l: Line, o: number, dy: number) => (
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
				opacity: o,
				transform: `translateY(${dy}px)`,
			}}
		>
			<Words l={l} t={t} />
		</div>
	);
	return (
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
					transform: `translateY(${(1 - entering) * 16}px) scale(${0.94 + 0.06 * entering})`,
					overflow: 'hidden',
				}}
			>
				<div style={{position: 'absolute', left: HUD.padL, top: (HUD.h - HUD.av) / 2}}>
					<Mic v={voiceLevel(t)} />
				</div>
				{oldTxt > 0 ? textBox(prev!, oldTxt, -(1 - oldTxt) * 8) : null}
				{textBox(c, txt, (1 - txt) * 10)}
			</div>
		</div>
	);
};
