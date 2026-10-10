import React from 'react';
import {C, F, E, clamp, prog, spr} from '../lib/theme';
import {Mark} from './Brand';

/** Tutorial Autopilot's floating panel: the tutorial playing along, its steps ticking off, the mode. */
export const AP = {
	bg: '#141211',
	bg2: '#1E1B19',
	line: 'rgba(242,238,232,0.10)',
	text: '#F2EEE8',
	dim: 'rgba(242,238,232,0.55)',
	faint: 'rgba(242,238,232,0.30)',
};

export type Step = {text: string; app?: string};

const fmt = (s: number) => {
	s = Math.max(0, Math.floor(s));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const ss = s % 60;
	return h ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`;
};

/** a video-player frame for the tutorial (our own player design, not YouTube's) */
export const TutorialPlayer: React.FC<{
	w: number;
	children: React.ReactNode; // the tutorial's picture at 1920x1080
	pos: number; // seconds into the tutorial
	dur: number;
	playing?: boolean;
	radius?: number;
}> = ({w, children, pos, dur, playing = true, radius = 12}) => {
	const h = (w * 9) / 16;
	const sc = w / 1920;
	return (
		<div style={{position: 'relative', width: w, height: h, borderRadius: radius, overflow: 'hidden', background: '#000'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${sc})`, transformOrigin: '0 0'}}>{children}</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: h * 0.32, background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.72))'}} />
			<div style={{position: 'absolute', left: w * 0.035, right: w * 0.035, bottom: h * 0.07, display: 'flex', alignItems: 'center', gap: w * 0.03}}>
				<svg width={w * 0.04} height={w * 0.04} viewBox="0 0 20 20">
					{playing ? <path d="M5 3 L17 10 L5 17 Z" fill="#fff" /> : <path d="M5 3 h3.5 v14 h-3.5 Z M11.5 3 h3.5 v14 h-3.5 Z" fill="#fff" />}
				</svg>
				<div style={{flex: 1, height: Math.max(3, w * 0.008), borderRadius: 4, background: 'rgba(255,255,255,0.28)', position: 'relative'}}>
					<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${clamp(pos / dur) * 100}%`, borderRadius: 4, background: C.orange}} />
				</div>
				<div style={{fontFamily: F.mono, fontSize: Math.max(10, w * 0.034), color: '#fff', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
					{fmt(pos)} / {fmt(dur)}
				</div>
			</div>
		</div>
	);
};

/** the panel; `cur` = index of the step being done (fractional = progress), steps before it are ticked */
export const Panel: React.FC<{
	t: number;
	x: number;
	y: number;
	w?: number;
	title: string;
	channel: string;
	player: React.ReactNode;
	steps: Step[];
	cur: number;
	first?: number; // step number of steps[0]
	total: number;
	mode?: 'do' | 'teach';
	modeT?: number; // time of the last mode switch (for the slider)
	status?: string;
	show?: number; // 0..1 entrance
	scale?: number;
}> = ({t, x, y, w = 470, title, channel, player, steps, cur, first = 1, total, mode = 'do', modeT = -9, status, show = 1, scale = 1}) => {
	const rowH = 50;
	const maxRows = 6;
	// keep the current step in view
	const scroll = Math.max(0, Math.min(steps.length - maxRows, Math.floor(cur) - 2));
	const sw = prog(t, modeT, modeT + 0.35, E.inOut);
	const knob = mode === 'teach' ? sw : 1 - sw;
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: w,
				borderRadius: 22,
				background: AP.bg,
				boxShadow: '0 0 0 1px rgba(0,0,0,0.6), 0 30px 80px rgba(0,0,0,0.55), 0 10px 24px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.06)',
				fontFamily: F.ui,
				color: AP.text,
				overflow: 'hidden',
				opacity: show,
				transform: `translateY(${(1 - show) * 30}px) scale(${scale * (0.96 + 0.04 * show)})`,
				transformOrigin: '100% 0',
			}}
		>
			{/* header */}
			<div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px 12px'}}>
				<Mark size={30} ink="#2A2522" />
				<div style={{fontFamily: F.head, fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em'}}>Tutorial Autopilot</div>
				<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.mono, fontSize: 13.5, color: AP.dim, letterSpacing: '0.02em'}}>
					<div style={{width: 8, height: 8, borderRadius: 4, background: C.orange, opacity: 0.55 + 0.45 * Math.abs(Math.sin(t * 4))}} />
					{status ?? (mode === 'do' ? 'DOING IT' : 'TEACHING')}
				</div>
			</div>
			<div style={{padding: '0 14px'}}>{player}</div>
			<div style={{padding: '12px 18px 10px'}}>
				<div style={{fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{title}</div>
				<div style={{fontSize: 14.5, color: AP.dim, marginTop: 3}}>{channel}</div>
			</div>
			{/* steps */}
			<div style={{borderTop: `1px solid ${AP.line}`, height: rowH * maxRows, overflow: 'hidden', position: 'relative'}}>
				<div style={{transform: `translateY(${-scroll * rowH}px)`}}>
					{steps.map((s, i) => {
						const done = i < Math.floor(cur);
						const now = i === Math.floor(cur);
						const pNow = now ? cur - Math.floor(cur) : 0;
						return (
							<div key={i} style={{height: rowH, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', background: now ? 'rgba(255,91,26,0.10)' : 'transparent', position: 'relative'}}>
								{now ? <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pNow * 100}%`, background: 'rgba(255,91,26,0.10)'}} /> : null}
								<div style={{fontFamily: F.mono, fontSize: 14, color: now ? C.orange : AP.faint, width: 26, position: 'relative'}}>{String(first + i).padStart(2, '0')}</div>
								<div style={{flex: 1, fontSize: 17, fontWeight: now ? 600 : 450, color: done ? AP.dim : AP.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', position: 'relative'}}>{s.text}</div>
								<div style={{width: 24, height: 24, borderRadius: 12, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? C.orange : 'transparent', border: done ? 'none' : `1.5px solid ${now ? C.orange : AP.faint}`}}>
									{done ? (
										<svg width="14" height="14" viewBox="0 0 14 14">
											<path d="M3 7.2 L6 10 L11 4" fill="none" stroke={AP.bg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									) : now ? (
										<div style={{width: 8, height: 8, borderRadius: 4, background: C.orange}} />
									) : null}
								</div>
							</div>
						);
					})}
				</div>
			</div>
			{/* footer: progress + mode */}
			<div style={{borderTop: `1px solid ${AP.line}`, padding: '14px 18px 18px'}}>
				<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 13.5, color: AP.dim, marginBottom: 12}}>
					<span>
						STEP {String(Math.min(total, first + Math.floor(cur))).padStart(2, '0')} / {total}
					</span>
					<span>{Math.round(clamp((first - 1 + cur) / total) * 100)}%</span>
				</div>
				<div style={{position: 'relative', display: 'flex', height: 44, borderRadius: 12, background: AP.bg2, padding: 4}}>
					<div style={{position: 'absolute', top: 4, bottom: 4, left: 4, width: 'calc(50% - 4px)', borderRadius: 9, background: C.orange, transform: `translateX(${knob * 100}%)`}} />
					{['Do it for me', 'Teach me'].map((l, i) => {
						const on = (i === 0 ? 1 - knob : knob) > 0.5;
						return (
							<div key={l} style={{flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: on ? '#160C06' : AP.dim}}>
								{l}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

/** spring-in helper for panel entrances */
export const panelIn = (t: number, t0: number) => clamp(spr(t, t0, 20, 0.75));
