import React from 'react';
import {C, SANS, clamp01, easeInOut, easeOut, step} from '../lib/tokens';
import {RiffIcon} from '../lib/riff';
import {at, HITS, T} from './beat';
import {EDIT_TOTAL} from './Hud';
import {Pic} from './Pic';

// The end: the skyline the finished cut ends on drifts on, slowed and out of focus, under the number; when the
// scratch hook comes in (beat 160) Riff takes over.

const STAT = 50;
/** the last shot of the finished cut (the skyline, from beat 155) carries on at half speed */
const skyTime = (t: number) => 0.2 + (T.stat - at(155)) + (t - T.stat) * 0.5;

/** the brand's punch: a big one when it lands, then a small one on every kick */
const punch = (t: number) => {
	let v = 0;
	for (const k of HITS.kicks) {
		if (k < T.brand - 0.01 || t < k) continue;
		const d = t - k;
		v = Math.max(v, k < T.brand + 0.01 ? 1 - easeOut(clamp01(d / 0.4)) : 0.3 * (1 - easeOut(clamp01(d / 0.25))));
	}
	return v;
};

export const End: React.FC<{t: number}> = ({t}) => {
	if (t < T.stat) return null;
	const b = T.brand;
	const brand = t >= b;
	// the shot goes soft and dark under the number, darker still under the brand
	const soft = step(t, T.stat, 0.45, easeInOut);
	const dim = brand ? 0.74 : 0.6 * soft;
	const blur = brand ? 22 : 14 * soft;
	// "50% faster": the number runs up from 0; hard cut away on the scratch
	const stat = brand ? 0 : step(t, T.stat, 0.3);
	const n = Math.round(STAT * easeOut(clamp01((t - T.stat) / 0.6)));
	const label = step(t, T.stat + 0.28, 0.4);
	const sub = step(t, at(158), 0.45);
	// the brand
	const kk = punch(t);
	const flash = brand ? Math.max(0, 1 - (t - b) / 0.14) * 0.22 : 0;
	const icon = step(t, b, 0.5);
	const word = step(t, b + 0.1, 0.5);
	const line = step(t, b + 0.3, 0.5);
	const foot = step(t, b + 0.6, 0.6);
	return (
		<div style={{position: 'absolute', inset: 0, zIndex: 90, background: '#000', overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: -60, filter: `blur(${blur}px)`}}>
				<div style={{position: 'absolute', left: 60, top: 60, width: 1080, height: 1920, transform: `scale(${1 + 0.04 * soft})`}}>
					<Pic id="sky" s={skyTime(t)} />
				</div>
			</div>
			<div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${dim})`}} />
			{stat > 0 ? (
				<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: stat, transform: `scale(${0.92 + 0.08 * stat})`, filter: `blur(${(1 - stat) * 10}px)`}}>
					<div style={{marginTop: -80, fontFamily: SANS, fontWeight: 720, fontSize: 340, lineHeight: 1, letterSpacing: '-0.06em', color: '#F5F5F7', fontVariantNumeric: 'tabular-nums', textShadow: '0 0 60px rgba(255,255,255,0.18)'}}>
						{n}
						<span style={{fontSize: 220, letterSpacing: '-0.04em'}}>%</span>
					</div>
					<div style={{marginTop: 10, fontFamily: SANS, fontWeight: 620, fontSize: 110, letterSpacing: '-0.04em', color: C.ember, opacity: label, transform: `translateY(${(1 - label) * 16}px)`}}>faster</div>
					<div style={{marginTop: 70, fontFamily: SANS, fontWeight: 560, fontSize: 46, letterSpacing: '-0.02em', color: '#D6D6DB', opacity: sub, transform: `translateY(${(1 - sub) * 12}px)`}}>
						{EDIT_TOTAL} edits. Not one keystroke.
					</div>
				</div>
			) : null}
			{brand ? (
				<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 34, marginTop: -60, transform: `scale(${1 + 0.07 * kk})`}}>
						<div style={{transform: `scale(${0.85 + 0.15 * icon})`, opacity: icon}}>
							<RiffIcon size={140} level={0.45 + 0.4 * kk} glow={0.35 * icon + 0.5 * kk} />
						</div>
						<div style={{fontFamily: SANS, fontWeight: 620, fontSize: 158, letterSpacing: '-0.055em', color: '#F5F5F7', opacity: word, transform: `translateX(${(1 - word) * -24}px)`, filter: `blur(${(1 - word) * 8}px)`}}>Riff</div>
					</div>
					<div style={{marginTop: 40, fontFamily: SANS, fontWeight: 560, fontSize: 66, letterSpacing: '-0.03em', color: '#F5F5F7', opacity: line, transform: `translateY(${(1 - line) * 14}px)`}}>No keyboard. Just speak.</div>
					<div style={{position: 'absolute', bottom: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: foot}}>
						<div style={{fontFamily: SANS, fontWeight: 560, fontSize: 32, color: '#C9C9CE', letterSpacing: '-0.01em'}}>Video editing by voice</div>
						<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, color: '#8E8E93', letterSpacing: '-0.005em'}}>Coming soon for Mac</div>
					</div>
				</div>
			) : null}
			{flash > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${flash})`}} /> : null}
		</div>
	);
};
