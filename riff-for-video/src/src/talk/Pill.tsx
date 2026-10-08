import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {SANS, clamp01, easeInOut, lerp, textW} from '../lib/tokens';
import {Line, LINES_AT, WORD} from './beat';

// Riff's voice pill: what you say shows up word by word (never heard: the film is music only). When the line is
// done the edit lands on the hit, the pill flashes ember and clears for the next one.
const P = {font: 50, h: 104, av: 68, padL: 18, gap: 22, padR: 44};
const textWidth = (text: string) => textW(text, P.font, 590, SANS, -0.015);
const IDLE = P.padL + P.av + 20 + 56 + P.padR - 8; // mic + meter
const pillW = (l: Line | null) => (l ? P.padL + P.av + P.gap + textWidth(l.text) + P.padR : IDLE);

/** 0..1 how much you're speaking at t (drives the mic glow and the meters) */
export const speaking = (t: number) => {
	let v = 0;
	for (const l of LINES_AT) {
		const end = l.a + WORD * l.text.split(' ').length + 0.12;
		if (t >= l.a - 0.02 && t <= end) {
			const edge = Math.min(clamp01((t - l.a) / 0.06), clamp01((end - t) / 0.1));
			v = Math.max(v, edge * (0.55 + 0.45 * Math.abs(Math.sin(t * 23) * Math.sin(t * 9.7 + 1))));
		}
	}
	return v;
};

const Mic: React.FC<{v: number; hot: number}> = ({v, hot}) => (
	<div
		style={{
			width: P.av,
			height: P.av,
			borderRadius: P.av / 2,
			background: 'linear-gradient(140deg, #FFB37E, #FF6A4D)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			boxShadow: `0 0 0 ${2 + 10 * clamp01(v * 1.3) + 8 * hot}px rgba(255,150,100,${0.14 + 0.3 * clamp01(v * 1.3) + 0.3 * hot})`,
		}}
	>
		<svg width={31} height={31} viewBox="0 0 20 20">
			<rect x={7} y={2.5} width={6} height={10} rx={3} fill="#2A1206" />
			<path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5" stroke="#2A1206" strokeWidth={1.8} fill="none" strokeLinecap="round" />
		</svg>
	</div>
);

/** live meter bars when the pill is just listening */
const Meter: React.FC<{v: number}> = ({v}) => {
	const frame = useCurrentFrame();
	return (
		<div style={{display: 'flex', gap: 5, alignItems: 'center', height: 40}}>
			{[0, 1, 2, 3, 4].map((i) => {
				const wob = Math.abs(Math.sin(frame * 0.6 + i * 1.4));
				return <div key={i} style={{width: 6, height: 8 + 26 * v * wob * Math.sin(((i + 0.5) / 5) * Math.PI), borderRadius: 3, background: 'rgba(255,255,255,0.55)'}} />;
			})}
		</div>
	);
};

/** the pill at film t; `y` is its centre, `show` 0..1 */
export const Pill: React.FC<{t: number; y: number; show: number}> = ({t, y, show}) => {
	if (show <= 0.001) return null;
	// the line on the pill: from just before its first word until it has landed and cleared
	let cur: Line | null = null;
	for (const l of LINES_AT) if (t >= l.a - 0.12 && t < l.land + 0.3) cur = l;
	const v = speaking(t);
	let w = pillW(null);
	let text: React.ReactNode = null;
	let hot = 0;
	let meter = 1;
	if (cur) {
		const c = cur;
		const grow = easeInOut(clamp01((t - c.a + 0.12) / 0.2));
		const clear = easeInOut(clamp01((t - c.land - 0.12) / 0.18));
		w = lerp(lerp(pillW(null), pillW(c), grow), pillW(null), clear);
		meter = Math.max(1 - grow, clear);
		hot = t >= c.land ? 1 - clamp01((t - c.land) / 0.3) : 0;
		const words = c.text.split(' ');
		text = (
			<div style={{position: 'absolute', left: P.padL + P.av + P.gap, top: 0, height: P.h, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 590, fontSize: P.font, letterSpacing: '-0.015em', color: hot > 0 ? '#FFD2B0' : '#F5F5F7', opacity: 1 - clear, transform: `translateY(${-clear * 14}px)`}}>
				{words.map((wd, k) => {
					const wt = c.a + k * WORD;
					const o = interpolate(t, [wt - 0.04, wt + 0.07], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
					return (
						<span key={k} style={{opacity: o, whiteSpace: 'pre', display: 'inline-block', transform: `translateY(${(1 - o) * 8}px)`}}>
							{wd}
							{k < words.length - 1 ? ' ' : ''}
						</span>
					);
				})}
			</div>
		);
	}
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: y - P.h / 2, display: 'flex', justifyContent: 'center', zIndex: 80, opacity: show, transform: `translateY(${(1 - show) * 20}px)`}}>
			<div
				style={{
					position: 'relative',
					width: w,
					height: P.h,
					borderRadius: P.h / 2,
					background: 'linear-gradient(180deg, rgba(44,40,38,0.94) 0%, rgba(18,16,15,0.96) 100%)',
					boxShadow: `0 24px 60px rgba(0,0,0,0.5), inset 0 0 0 ${1 + 1.5 * hot}px ${hot > 0 ? `rgba(255,154,85,${0.4 + 0.6 * hot})` : 'rgba(255,255,255,0.12)'}, inset 0 1px 0 rgba(255,255,255,0.16), 0 0 ${40 * hot}px rgba(255,140,80,${0.55 * hot})`,
					overflow: 'hidden',
				}}
			>
				<div style={{position: 'absolute', left: P.padL, top: (P.h - P.av) / 2}}>
					<Mic v={v} hot={hot} />
				</div>
				{text}
				{meter > 0.01 ? (
					<div style={{position: 'absolute', left: P.padL + P.av + 20, top: (P.h - 40) / 2, opacity: meter}}>
						<Meter v={0.25} />
					</div>
				) : null}
			</div>
		</div>
	);
};

