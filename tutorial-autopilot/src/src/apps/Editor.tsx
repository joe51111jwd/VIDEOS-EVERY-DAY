import React from 'react';
import {Img, staticFile} from 'remotion';
import {F, E, clamp, kf, prog, pulse} from '../lib/theme';

/** A dark non-linear video editor (Premiere-style layout): bin, program monitor, timeline.
 *  The footage is our own Cycles donut turntable. */
const V = {
	bg: '#1D1D1D',
	panel: '#232323',
	head: '#2B2B2B',
	line: '#121212',
	text: '#D4D4D4',
	dim: '#8A8A8A',
	blue: '#2D8CEB',
	clipV: '#8C7BD8',
	clipV2: '#5FA7C9',
	clipA: '#4FA36B',
};

export type EditorT = {
	cut?: number; // razor at the playhead
	lift?: number; // ripple delete the piece after the cut
	play?: number; // playhead runs
	zoom?: number; // timeline zooms in
	frameSrc: (i: number) => string; // footage frame by index
};

const tc = (s: number) => {
	const f = Math.floor((s % 1) * 24);
	const ss = Math.floor(s) % 60;
	const m = Math.floor(s / 60);
	return `00:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
};

export const EditorApp: React.FC<{t: number; k: EditorT}> = ({t, k}) => {
	const pxPerSec = 52 * (k.zoom !== undefined ? kf(t, [k.zoom, k.zoom + 0.4], [1, 1.6], E.inOut) : 1);
	const x0 = 150;
	const head0 = 9.4;
	const playing = k.play !== undefined && t >= k.play;
	const head = head0 + (playing ? (t - k.play!) * 1.0 : 0);
	const cutAt = 9.4;
	const cutOn = k.cut !== undefined && t >= k.cut;
	const lift = k.lift !== undefined ? prog(t, k.lift, k.lift + 0.3, E.inOut) : 0;
	const gap = 3.2; // seconds removed
	// clips on V1: [start, end, label]
	const v1: [number, number, string][] = [
		[0, 4.6, 'donut_turntable_A.mov'],
		[4.6, cutOn ? cutAt : 14.2, 'donut_turntable_B.mov'],
		...(cutOn ? ([[cutAt, cutAt + gap, 'donut_turntable_B.mov']] as [number, number, string][]) : []),
		...(cutOn ? ([[cutAt + gap, 14.2, 'donut_turntable_B.mov']] as [number, number, string][]) : []),
		[14.2, 21, 'icing_closeup.mov'],
		[21, 30, 'sprinkles_macro.mov'],
	];
	const shift = (s: number) => (cutOn && s >= cutAt + gap - 0.001 ? -gap * lift : 0);
	const flash = k.cut !== undefined ? pulse(t, k.cut, 0.04, 0.4) : 0;
	const frameIdx = Math.floor((head * 24) % 120);
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, background: V.line, fontFamily: F.inter, color: V.text, overflow: 'hidden'}}>
			{/* top bar */}
			<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 40, background: V.bg, display: 'flex', alignItems: 'center', gap: 26, paddingLeft: 22, fontSize: 15, color: V.dim}}>
				{['Import', 'Edit', 'Export'].map((x, i) => (
					<span key={x} style={{color: i === 1 ? '#fff' : V.dim, fontWeight: i === 1 ? 600 : 400, borderBottom: i === 1 ? `2px solid ${V.blue}` : 'none', paddingBottom: 4}}>
						{x}
					</span>
				))}
				<span style={{marginLeft: 'auto', marginRight: 820, color: V.text}}>Donut reel</span>
			</div>
			{/* bin */}
			<div style={{position: 'absolute', left: 6, top: 46, width: 560, height: 520, background: V.panel, borderRadius: 6}}>
				<div style={{height: 36, background: V.head, borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', paddingLeft: 14, fontSize: 14, gap: 18}}>
					<span style={{color: '#fff'}}>Project: Donut reel</span>
					<span style={{color: V.dim}}>Media Browser</span>
				</div>
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, padding: 14}}>
					{['donut_turntable_A.mov', 'donut_turntable_B.mov', 'icing_closeup.mov', 'sprinkles_macro.mov'].map((n, i) => (
						<div key={n}>
							<div style={{width: '100%', height: 148, borderRadius: 4, overflow: 'hidden', background: '#000'}}>
								<Img src={k.frameSrc(20 + i * 25)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
							</div>
							<div style={{fontSize: 13, marginTop: 6, color: V.text}}>{n}</div>
							<div style={{fontSize: 12, color: V.dim}}>{['0:04:14', '0:09:20', '0:06:19', '0:09:00'][i]}</div>
						</div>
					))}
				</div>
			</div>
			{/* program monitor */}
			<div style={{position: 'absolute', left: 572, top: 46, width: 1342, height: 520, background: V.panel, borderRadius: 6}}>
				<div style={{height: 36, background: V.head, borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', paddingLeft: 14, fontSize: 14, color: '#fff'}}>Program: Donut reel</div>
				<div style={{position: 'absolute', left: (1342 - 760) / 2, top: 48, width: 760, height: 428, background: '#000'}}>
					<Img src={k.frameSrc(frameIdx)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
				</div>
				<div style={{position: 'absolute', left: 20, bottom: 12, fontFamily: F.mono, fontSize: 17, color: '#E8C547'}}>{tc(head)}</div>
				<div style={{position: 'absolute', right: 20, bottom: 12, fontFamily: F.mono, fontSize: 15, color: V.dim}}>{tc(30)}</div>
				<div style={{position: 'absolute', left: '50%', bottom: 10, transform: 'translateX(-50%)', display: 'flex', gap: 22, fontSize: 16, color: V.text}}>
					{['⇤', '◁', playing ? '❚❚' : '▶', '▷', '⇥'].map((x) => (
						<span key={x}>{x}</span>
					))}
				</div>
			</div>
			{/* timeline */}
			<div style={{position: 'absolute', left: 6, top: 572, width: 1908, height: 502, background: V.panel, borderRadius: 6, overflow: 'hidden'}}>
				<div style={{height: 36, background: V.head, display: 'flex', alignItems: 'center', paddingLeft: 14, fontSize: 14, gap: 30}}>
					<span style={{color: '#fff'}}>Donut reel</span>
					<span style={{fontFamily: F.mono, color: '#E8C547', fontSize: 16}}>{tc(head)}</span>
				</div>
				{/* ruler */}
				<div style={{position: 'absolute', left: x0, right: 0, top: 36, height: 30, borderBottom: `1px solid ${V.line}`}}>
					{Array.from({length: 40}).map((_, i) => (
						<div key={i} style={{position: 'absolute', left: i * 2 * pxPerSec, top: 6, fontSize: 12, color: V.dim, fontFamily: F.mono}}>
							{tc(i * 2).slice(3, 8)}
						</div>
					))}
				</div>
				{/* track headers */}
				{['V2', 'V1', 'A1', 'A2'].map((n, i) => (
					<div key={n} style={{position: 'absolute', left: 0, top: 70 + i * 96, width: x0 - 6, height: 90, background: V.head, display: 'flex', alignItems: 'center', paddingLeft: 16, fontSize: 15, color: V.text, gap: 14}}>
						<span style={{padding: '3px 8px', borderRadius: 4, background: i === 1 ? V.blue : '#3A3A3A', color: '#fff', fontWeight: 600}}>{n}</span>
						<span style={{color: V.dim, fontSize: 13}}>{i < 2 ? '◉  🔒' : 'M  S'}</span>
					</div>
				))}
				{/* clips */}
				<div style={{position: 'absolute', left: x0, top: 70, right: 0, bottom: 0}}>
					{v1.map(([a, b, n], i) => {
						const removed = cutOn && a === cutAt;
						const dx = shift(a);
						const op = removed ? 1 - lift : 1;
						return (
							<div key={i} style={{position: 'absolute', left: (a + dx) * pxPerSec, top: 96, width: (b - a) * pxPerSec - 2, height: 90, borderRadius: 4, background: removed ? '#B06A6A' : V.clipV, opacity: op, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.35)'}}>
								<div style={{display: 'flex', height: 58}}>
									{Array.from({length: Math.max(1, Math.ceil(((b - a) * pxPerSec) / 104))}).map((_, j) => (
										<Img key={j} src={k.frameSrc((i * 30 + j * 11) % 120)} style={{width: 104, height: 58, objectFit: 'cover', opacity: 0.92}} />
									))}
								</div>
								<div style={{fontSize: 12.5, padding: '6px 8px', color: '#1A1530', fontWeight: 600, whiteSpace: 'nowrap'}}>{n}</div>
							</div>
						);
					})}
					{/* V2 title + audio */}
					<div style={{position: 'absolute', left: 2 * pxPerSec, top: 0, width: 5 * pxPerSec, height: 90, borderRadius: 4, background: V.clipV2, fontSize: 12.5, padding: 8, boxSizing: 'border-box', color: '#0E2430', fontWeight: 600}}>Title: Donut</div>
					{[0, 1].map((r) => (
						<div key={r} style={{position: 'absolute', left: 0, top: 192 + r * 96, width: 30 * pxPerSec - (cutOn ? gap * lift * pxPerSec : 0), height: 90, borderRadius: 4, background: V.clipA, overflow: 'hidden'}}>
							<svg width="100%" height="90" preserveAspectRatio="none" viewBox="0 0 600 90">
								<path d={Array.from({length: 300}).map((_, j) => `${j === 0 ? 'M' : 'L'}${j * 2} ${45 + Math.sin(j * 0.7 + r) * (12 + 18 * Math.abs(Math.sin(j * 0.13)))}`).join(' ')} stroke="#1C4A2A" fill="none" strokeWidth="2" />
							</svg>
						</div>
					))}
					{/* cut flash */}
					{cutOn ? <div style={{position: 'absolute', left: cutAt * pxPerSec - 2, top: 90, width: 4, height: 110, background: '#fff', opacity: flash}} /> : null}
					{/* playhead */}
					<div style={{position: 'absolute', left: head * pxPerSec - 1, top: -34, width: 2, height: 440, background: V.blue}} />
					<div style={{position: 'absolute', left: head * pxPerSec - 9, top: -36, width: 18, height: 16, background: V.blue, clipPath: 'polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)'}} />
				</div>
			</div>
			<div style={{opacity: clamp(0)}} />
		</div>
	);
};
