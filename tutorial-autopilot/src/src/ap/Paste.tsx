import React from 'react';
import {C, F, E, clamp, prog, spr, pulse} from '../lib/theme';
import {Mark} from './Brand';
import {AP} from './Panel';

/** The launcher: paste a tutorial link, it resolves into the tutorial, then the steps it found. */
export const PasteBar: React.FC<{
	t: number;
	paste: number; // link appears (⌘V)
	resolve: number; // tutorial card resolves
	go?: number; // "Do it for me" pressed
	thumb: React.ReactNode; // 1920x1080 tutorial frame
	w?: number;
}> = ({t, paste, resolve, go, thumb, w = 1240}) => {
	const url = 'youtube.com/watch?v=Ug8sBr4Yf2Q';
	const pasted = t >= paste;
	const flash = pulse(t, paste, 0.03, 0.35);
	const card = prog(t, resolve, resolve + 0.45, E.out);
	const press = go !== undefined ? pulse(t, go, 0.05, 0.25) : 0;
	const thumbW = 400;
	return (
		<div style={{width: w, borderRadius: 26, background: AP.bg, color: AP.text, fontFamily: F.ui, boxShadow: '0 40px 100px rgba(18,16,16,0.35), 0 10px 30px rgba(18,16,16,0.25)', overflow: 'hidden'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '26px 30px'}}>
				<Mark size={56} ink="#2A2522" />
				<div style={{flex: 1, fontSize: 34, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', position: 'relative'}}>
					{pasted ? (
						<span style={{background: `rgba(255,91,26,${0.35 * flash})`, borderRadius: 6}}>
							<span style={{color: AP.dim}}>https://</span>
							{url}
						</span>
					) : (
						<span style={{color: AP.faint}}>Paste any tutorial…</span>
					)}
					<span style={{display: 'inline-block', width: 3, height: 38, background: C.orange, marginLeft: 4, verticalAlign: 'middle', opacity: Math.floor(t * 2.2) % 2 ? 1 : 0.15}} />
				</div>
				<div style={{fontFamily: F.mono, fontSize: 19, color: AP.faint, border: `1px solid ${AP.line}`, borderRadius: 8, padding: '6px 10px'}}>⌘V</div>
			</div>
			<div style={{height: card * 270, overflow: 'hidden', borderTop: card > 0 ? `1px solid ${AP.line}` : 'none'}}>
				<div style={{display: 'flex', gap: 28, padding: '28px 30px', opacity: card, transform: `translateY(${(1 - card) * 14}px)`}}>
					<div style={{width: thumbW, height: (thumbW * 9) / 16, borderRadius: 14, overflow: 'hidden', position: 'relative', background: '#000', flexShrink: 0}}>
						<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${thumbW / 1920})`, transformOrigin: '0 0'}}>{thumb}</div>
						<div style={{position: 'absolute', right: 10, bottom: 10, padding: '3px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.8)', fontFamily: F.mono, fontSize: 17, color: '#fff'}}>2:03:11</div>
					</div>
					<div style={{flex: 1, minWidth: 0}}>
						<div style={{fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.12}}>Blender for Beginners: Make a Donut (Part 1)</div>
						<div style={{fontSize: 20, color: AP.dim, marginTop: 10}}>Low Poly Club · 2.1M views</div>
						<div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 30}}>
							<div style={{padding: '14px 26px', borderRadius: 14, background: C.orange, color: '#160C06', fontSize: 22, fontWeight: 650, transform: `scale(${1 - 0.06 * press})`}}>Do it for me</div>
							<div style={{padding: '14px 26px', borderRadius: 14, background: '#2A2522', color: AP.text, fontSize: 22, fontWeight: 600}}>Teach me</div>
							<div style={{marginLeft: 'auto', fontFamily: F.mono, fontSize: 18, color: AP.dim}}>41 STEPS · BLENDER 5.2</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

/** Teach me: a ghost pointer shows the move, a ring marks the target */
export const GhostRing: React.FC<{t: number; x: number; y: number; w: number; h: number; t0: number; done?: number}> = ({t, x, y, w, h, t0, done}) => {
	if (t < t0) return null;
	const p = spr(t, t0, 22, 0.6);
	const breathe = 1 + 0.06 * Math.sin((t - t0) * 7);
	const ok = done !== undefined && t >= done;
	const okp = ok ? prog(t, done!, done! + 0.3) : 0;
	return (
		<div style={{position: 'absolute', left: x - 10, top: y - 10, width: w + 20, height: h + 20, borderRadius: 14, border: `3px solid ${C.orange}`, boxShadow: `0 0 0 ${6 + 6 * Math.sin((t - t0) * 7)}px rgba(255,91,26,0.18), 0 0 24px rgba(255,91,26,0.45)`, transform: `scale(${(0.6 + 0.4 * p) * (ok ? 1 + 0.08 * okp : breathe)})`, opacity: ok ? 1 - okp : clamp(p * 1.4)}}>
			{ok ? (
				<div style={{position: 'absolute', right: -18, top: -18, width: 36, height: 36, borderRadius: 18, background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1}}>
					<svg width="20" height="20" viewBox="0 0 14 14">
						<path d="M3 7.2 L6 10 L11 4" fill="none" stroke="#160C06" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</div>
			) : null}
		</div>
	);
};

export const GhostPointer: React.FC<{x: number; y: number; opacity?: number; s?: number}> = ({x, y, opacity = 0.75, s = 1.6}) => (
	<div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 0', opacity}}>
		<svg width="22" height="30" viewBox="0 0 22 30" style={{display: 'block', marginLeft: -2, marginTop: -2, filter: 'drop-shadow(0 0 6px rgba(255,91,26,0.6))'}}>
			<path d="M2 2 L2 23.5 L7.2 18.6 L10.6 26.6 L14.3 25 L10.9 17.2 L18 17.2 Z" fill={C.orange} stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
		</svg>
	</div>
);
