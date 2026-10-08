import React from 'react';
import {MONO, SANS, clamp01, easeOut} from '../lib/tokens';
import {RiffIcon} from '../lib/riff';
import {HITS, T} from './beat';
import {CUT_A} from './plan';
import {speaking} from './Pill';

// The count that runs all film long: every edit you said, and the keys you pressed (none).

/** the editor's timeline span (s) and when each kick's shake keyframe pops in after "Shake on every kick." */
export const TL_SPAN = 12;
export const SHAKE_KEYS = HITS.kicks.filter((k) => k < TL_SPAN - 0.05).map((k) => ({k, pop: T.shake + 0.04 + (k / TL_SPAN) * 0.55}));

const EDITS: number[] = [T.vertical, T.cine, T.slow, ...CUT_A.map((c) => c.a), T.freeze, ...SHAKE_KEYS.map((s) => s.pop), T.title].sort((a, b) => a - b);
export const editsAt = (t: number) => EDITS.filter((e) => e <= t).length;
export const EDIT_TOTAL = EDITS.length;
const lastEdit = (t: number) => {
	let l = -9;
	for (const e of EDITS) if (e <= t) l = e;
	return l;
};

const Keys: React.FC = () => (
	<svg width={34} height={24} viewBox="0 0 34 24">
		<rect x={1.5} y={1.5} width={31} height={21} rx={4.5} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={2} />
		{[0, 1, 2, 3, 4].map((i) => (
			<rect key={i} x={6 + i * 5} y={6.5} width={2.6} height={2.6} rx={0.8} fill="rgba(255,255,255,0.75)" />
		))}
		{[0, 1, 2, 3].map((i) => (
			<rect key={i} x={8.5 + i * 5} y={11.5} width={2.6} height={2.6} rx={0.8} fill="rgba(255,255,255,0.75)" />
		))}
		<rect x={10} y={16.5} width={14} height={2.6} rx={1.3} fill="rgba(255,255,255,0.75)" />
	</svg>
);

export const Hud: React.FC<{t: number; y: number; show: number}> = ({t, y, show}) => {
	if (show <= 0.001) return null;
	const n = editsAt(t);
	const bump = 1 - easeOut(clamp01((t - lastEdit(t)) / 0.25));
	const v = speaking(t);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: y - 34, display: 'flex', justifyContent: 'center', zIndex: 82, opacity: show, transform: 'scale(1.3)', transformOrigin: '50% 34px'}}>
			<div style={{height: 68, padding: '0 26px 0 14px', borderRadius: 34, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(16,16,18,0.78)', boxShadow: '0 16px 40px rgba(0,0,0,0.35), inset 0 0 0 1.5px rgba(255,255,255,0.12)'}}>
				<RiffIcon size={46} level={0.2 + v} glow={v * 0.6} />
				<div style={{display: 'flex', alignItems: 'baseline', gap: 10, fontFamily: SANS}}>
					<span style={{fontFamily: MONO, fontWeight: 600, fontSize: 34, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums', display: 'inline-block', transform: `scale(${1 + 0.18 * bump})`, textShadow: bump > 0 ? `0 0 ${18 * bump}px rgba(255,170,120,0.9)` : undefined}}>{n}</span>
					<span style={{fontWeight: 560, fontSize: 28, color: 'rgba(255,255,255,0.72)'}}>{n === 1 ? 'edit' : 'edits'}</span>
				</div>
				<div style={{width: 1.5, height: 30, background: 'rgba(255,255,255,0.16)'}} />
				<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
					<Keys />
					<span style={{fontFamily: MONO, fontWeight: 600, fontSize: 34, color: '#FFFFFF'}}>0</span>
					<span style={{fontFamily: SANS, fontWeight: 560, fontSize: 28, color: 'rgba(255,255,255,0.72)'}}>keystrokes</span>
				</div>
			</div>
		</div>
	);
};
