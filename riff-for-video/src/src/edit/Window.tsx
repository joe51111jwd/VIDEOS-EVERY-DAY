import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, SANS, clamp01, tc} from '../lib/tokens';
import {RiffIcon} from '../lib/riff';
import {playheadAt} from './model';
import {ACT, CMDS, FLY} from './timing';
import {PHX, TB, TRANS, WIN} from './layout';
import {IPause, IPlay, ISidebar, ISkip, IShare, Toast, Traffic, noise} from './ui';

/** 0..1 "speaking" level while a command's words appear (drives the meters and the mic glow) */
export const voiceLevel = (t: number) => {
	let v = 0;
	for (const c of CMDS) {
		const b = c.land - FLY;
		if (t >= c.a - 0.02 && t <= b) {
			const edge = Math.min(clamp01((t - c.a) / 0.06), clamp01((b - t) / 0.1));
			v = Math.max(v, edge * (0.45 + 0.55 * noise(t * 9.0, 3)));
		}
	}
	return v;
};

const playing = (t: number) => {
	const T0 = playheadAt(t - 1 / 30);
	const T1 = playheadAt(t);
	const d = (T1 - T0) * 30;
	return d > 0.2 && d < 1.6;
};

const TitleBar: React.FC<{t: number}> = ({t}) => (
	<div style={{position: 'absolute', left: 0, top: 0, width: WIN.w, height: TB, background: 'linear-gradient(180deg, #1D1D21, #17171A)', borderBottom: `1px solid ${C.line}`}}>
		<div style={{position: 'absolute', left: 18, top: 19}}>
			<Traffic />
		</div>
		<div style={{position: 'absolute', left: 92, top: 16}}>
			<ISidebar />
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: TB, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: SANS, fontSize: 15, letterSpacing: '-0.01em'}}>
			<span style={{fontWeight: 650, color: '#ECECF0'}}>Salt</span>
			<span style={{color: '#77777F', fontWeight: 500}}>— Edited</span>
		</div>
		<div style={{position: 'absolute', right: 14, top: 9, display: 'flex', gap: 10, alignItems: 'center'}}>
			<div style={{width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)'}}>
				<IShare />
			</div>
			<div style={{height: 34, padding: '0 15px', borderRadius: 9, background: '#ECECF0', color: '#111', fontFamily: SANS, fontWeight: 650, fontSize: 14, display: 'flex', alignItems: 'center'}}>Export</div>
		</div>
	</div>
);

/** Riff's listening indicator, right side of the transport bar */
const Listening: React.FC<{t: number}> = ({t}) => {
	const frame = useCurrentFrame();
	const v = voiceLevel(t);
	const bars = 14;
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 10, height: 40, padding: '0 14px 0 6px', borderRadius: 20, background: v > 0.05 ? 'rgba(255,154,85,0.12)' : 'rgba(255,255,255,0.05)', boxShadow: v > 0.05 ? 'inset 0 0 0 1px rgba(255,154,85,0.4)' : 'inset 0 0 0 1px rgba(255,255,255,0.08)'}}>
			<RiffIcon size={30} level={v} glow={v * 0.8} />
			<div style={{fontFamily: SANS, fontSize: 14, fontWeight: 650, color: v > 0.05 ? '#FFD9BD' : '#B5B5BC', width: 74}}>{v > 0.05 ? 'Listening' : 'Ready'}</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 3, height: 22}}>
				{new Array(bars).fill(0).map((_, i) => {
					const wob = Math.abs(Math.sin(frame * 0.7 + i * 1.3) * Math.sin(frame * 0.23 + i * 0.6));
					const env = Math.sin(((i + 0.5) / bars) * Math.PI);
					const h = Math.max(3, Math.min(22, 3 + v * 26 * (0.35 + 0.65 * wob) * env));
					return <div key={i} style={{width: 3, height: h, borderRadius: 2, background: v > 0.05 ? C.ember : '#56565E'}} />;
				})}
			</div>
		</div>
	);
};

const Transport: React.FC<{t: number}> = ({t}) => {
	const T = playheadAt(t);
	const toasts: [number, string, number, ('riff' | 'cut')?][] = [
		[ACT.rew0 + 0.05, 'Rewind', 0.9],
		[ACT.cut, 'Split at ' + tc(7.5).slice(3), 0.75, 'cut'],
		[ACT.lift, 'Removed 2.0 s', 0.75],
		[ACT.rewind - 0.05, 'Replay', 0.7],
		[ACT.restore, 'Cut undone', 0.8],
		[ACT.trim, 'Trimmed 2.0 s', 0.75],
		[ACT.markIn - 0.02, 'In', 0.5],
		[ACT.markOut - 0.02, 'Out', 0.25],
		[ACT.slow, 'Slow-mo 50%', 0.9],
		[ACT.insert, 'Inserted · smile', 0.9],
		[ACT.beat + 0.1, '9 cuts on the beat', 1.0],
	];
	return (
		<div style={{position: 'absolute', left: 0, top: TRANS.y, width: WIN.w, height: TRANS.h, background: '#121215', borderBottom: `1px solid ${C.line}`}}>
			<div style={{position: 'absolute', left: 18, top: 0, height: TRANS.h, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: 23, fontWeight: 500, color: '#F2F2F5', letterSpacing: '0.01em'}}>{tc(T)}</div>
			<div style={{position: 'absolute', left: 214, top: 0, height: TRANS.h, display: 'flex', alignItems: 'center', gap: 16}}>
				<ISkip back />
				{playing(t) ? <IPause size={22} /> : <IPlay size={22} />}
				<ISkip />
			</div>
			<div style={{position: 'absolute', right: 14, top: 11}}>
				<Listening t={t} />
			</div>
			<div style={{position: 'absolute', left: PHX - 300, width: 600, top: 14, height: 34}}>
				{toasts.map(([at, text, hold, icon], i) => (
					<div key={i} style={{position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center'}}>
						<Toast t={t} at={at} hold={hold} text={text} icon={icon} />
					</div>
				))}
			</div>
		</div>
	);
};

export const WindowChrome: React.FC<{t: number; children: React.ReactNode}> = ({t, children}) => (
	<div
		style={{
			position: 'absolute',
			left: WIN.x,
			top: WIN.y,
			width: WIN.w,
			height: WIN.h,
			borderRadius: WIN.r,
			overflow: 'hidden',
			background: C.win,
			boxShadow: '0 50px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.10)',
		}}
	>
		{children}
		<TitleBar t={t} />
		<Transport t={t} />
		<div style={{position: 'absolute', inset: 0, borderRadius: WIN.r, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.12)', pointerEvents: 'none', zIndex: 50}} />
	</div>
);
