import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, MONO, SANS, clamp01, easeInOut, easeOut, lerp, step} from '../lib/tokens';
import {RiffIcon} from '../lib/riff';
import {frameAt, layoutAt, pad4, playheadAt} from './model';
import {ACT, BEAT} from './timing';
import {VIEW, WIN} from './layout';

// "Make a vertical one for X." — a 9:16 box finds the surfer, the camera pushes into it,
// and the finished vertical cut plays full screen on the beat.

/** where the subject sits (0..1 across the 16:9 frame) in the aerial, by source second; matches tools/vert.py */
const TRACK_1076: [number, number][] = [
	[3.0, 0.29],
	[3.5, 0.3],
	[4.0, 0.31],
	[4.5, 0.35],
	[5.0, 0.385],
	[5.5, 0.43],
];
const trackAt = (src: number) => {
	const k = TRACK_1076;
	if (src <= k[0][0]) return k[0][1];
	for (let i = 0; i + 1 < k.length; i++) if (src <= k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], (src - k[i][0]) / (k[i + 1][0] - k[i][0]));
	return k[k.length - 1][1];
};

const BOX_H = VIEW.h;
const BOX_W = (BOX_H * 9) / 16;
const VX = WIN.x;
const VY = WIN.y + VIEW.y;

/** the 9:16 box in screen px at film time t (inside the viewer) */
export const cropBox = (t: number) => {
	const tt = Math.min(t, ACT.expand);
	const f = frameAt(layoutAt(tt), playheadAt(tt));
	const src = 1.5 + (f.idx - 1) / 30; // c1076 starts at 1.5 s
	const cx = Math.max(BOX_W / 2, Math.min(WIN.w - BOX_W / 2, trackAt(src) * WIN.w));
	// the box closes in from the full frame to the subject
	const k = easeOut(clamp01((t - ACT.crop) / 0.32));
	const w = lerp(WIN.w, BOX_W, k);
	const x = lerp(WIN.w / 2, cx, k) - w / 2;
	return {x: VX + x, y: VY, w, h: BOX_H, k};
};

/** 0..1 push into the box */
export const pushAt = (t: number) => easeInOut(clamp01((t - ACT.expand) / (ACT.full - ACT.expand)));

/** the editor's transform during the push: the box grows to fill the 1080x1920 frame */
export const pushTransform = (t: number) => {
	const p = pushAt(t);
	if (p <= 0) return undefined;
	const b = cropBox(ACT.expand);
	const s = lerp(1, 1920 / b.h, p);
	const rx = lerp(b.x, 0, p);
	const ry = lerp(b.y, 0, p);
	return `translate(${rx - b.x * s}px, ${ry - b.y * s}px) scale(${s})`;
};

// the vertical cut: film start times on the beat (two beats a shot), frames in public/v/<shot>/
const B = (n: number) => n * BEAT;
const SHOTS: {id: string; a: number; n: number}[] = [
	{id: 'v1', a: ACT.crop, n: 60},
	{id: 'v2', a: B(48), n: 34},
	{id: 'v3', a: B(50), n: 34},
	{id: 'v4', a: B(52), n: 34},
	{id: 'v5', a: B(54), n: 35},
	{id: 'v6', a: B(56), n: 43},
];
export const END_AT = B(54);

const shotAt = (t: number) => {
	let i = 0;
	while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].a) i++;
	const s = SHOTS[i];
	return {s, i, idx: Math.max(1, Math.min(s.n, Math.floor((t - s.a) * 30) + 1))};
};

const CropOverlay: React.FC<{t: number}> = ({t}) => {
	if (t < ACT.crop || t >= ACT.full) return null;
	const b = cropBox(t);
	const dim = 0.62 * easeOut(clamp01((t - ACT.crop) / 0.3));
	const lab = step(t, ACT.crop + 0.18, 0.3);
	const corner = (l: boolean, top: boolean) => (
		<div
			style={{
				position: 'absolute',
				[l ? 'left' : 'right']: -3,
				[top ? 'top' : 'bottom']: -3,
				width: 30,
				height: 30,
				borderLeft: l ? `5px solid ${C.ember}` : undefined,
				borderRight: l ? undefined : `5px solid ${C.ember}`,
				borderTop: top ? `5px solid ${C.ember}` : undefined,
				borderBottom: top ? undefined : `5px solid ${C.ember}`,
			}}
		/>
	);
	return (
		<div style={{position: 'absolute', left: VX, top: VY, width: WIN.w, height: VIEW.h, overflow: 'hidden', transform: pushTransform(t), transformOrigin: '0 0'}}>
			<div style={{position: 'absolute', left: b.x - VX, top: 0, width: b.w, height: b.h, boxShadow: `0 0 0 2400px rgba(0,0,0,${dim})`, outline: '2px solid rgba(255,255,255,0.9)', outlineOffset: -2}}>
				{corner(true, true)}
				{corner(false, true)}
				{corner(true, false)}
				{corner(false, false)}
				<div style={{position: 'absolute', left: 0, right: 0, top: 14, display: 'flex', justifyContent: 'center', opacity: lab}}>
					<div style={{height: 28, padding: '0 11px', borderRadius: 8, background: C.ember, color: C.emberInk, fontFamily: SANS, fontSize: 14, fontWeight: 750, display: 'flex', alignItems: 'center', gap: 6}}>9:16 · Follows the surfer</div>
				</div>
			</div>
		</div>
	);
};

const EndCard: React.FC<{t: number}> = ({t}) => {
	const a = END_AT;
	if (t < a - 0.05) return null;
	const bg = step(t, a, 0.45, easeInOut);
	const icon = step(t, a + 0.08, 0.6);
	const word = step(t, a + 0.22, 0.6);
	const line = step(t, a + 0.55, 0.6);
	const foot = step(t, a + 0.9, 0.6);
	return (
		<div style={{position: 'absolute', inset: 0, zIndex: 95}}>
			<div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.66)', opacity: bg}} />
			<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 34, marginTop: -60}}>
					<div style={{transform: `scale(${0.85 + 0.15 * icon})`, opacity: icon}}>
						<RiffIcon size={140} level={0.45} glow={0.35 * icon} />
					</div>
					<div style={{fontFamily: SANS, fontWeight: 620, fontSize: 158, letterSpacing: '-0.055em', color: '#F5F5F7', opacity: word, transform: `translateX(${(1 - word) * -24}px)`, filter: `blur(${(1 - word) * 8}px)`}}>Riff</div>
				</div>
				<div style={{marginTop: 40, fontFamily: SANS, fontWeight: 560, fontSize: 66, letterSpacing: '-0.03em', color: '#F5F5F7', opacity: line, transform: `translateY(${(1 - line) * 14}px)`}}>Just talk.</div>
				<div style={{position: 'absolute', bottom: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: foot}}>
					<div style={{fontFamily: SANS, fontWeight: 560, fontSize: 32, color: '#C9C9CE', letterSpacing: '-0.01em'}}>Video editing by voice</div>
					<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, color: '#8E8E93', letterSpacing: '-0.005em'}}>Coming soon for Mac</div>
				</div>
			</div>
		</div>
	);
};

export const Finale: React.FC<{t: number}> = ({t}) => {
	if (t < ACT.crop) return null;
	const p = pushAt(t);
	const {s, i, idx} = shotAt(t);
	const b = cropBox(ACT.expand);
	const r = {x: lerp(b.x, 0, p), y: lerp(b.y, 0, p), w: lerp(b.w, 1080, p), h: lerp(b.h, 1920, p)};
	// a small punch on every cut after the first
	const punch = i > 0 ? 1 + 0.05 * (1 - easeOut(clamp01((t - s.a) / 0.4))) : 1;
	const flash = i > 0 ? Math.max(0, 1 - (t - s.a) / 0.12) * 0.25 : 0;
	const chip = step(t, ACT.full - 0.1, 0.3) * (1 - step(t, B(50) - 0.2, 0.3));
	return (
		<>
			<CropOverlay t={t} />
			{t >= ACT.expand ? (
				<div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, overflow: 'hidden', zIndex: 90, background: '#000'}}>
					<Img src={staticFile(`v/${s.id}/${pad4(idx)}.jpg`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${punch})`}} />
					{flash > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${flash})`}} /> : null}
					<div style={{position: 'absolute', left: 0, right: 0, top: 96, display: 'flex', justifyContent: 'center', opacity: chip}}>
						<div style={{height: 46, padding: '0 20px', borderRadius: 23, background: 'rgba(14,14,16,0.6)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS, fontSize: 22, fontWeight: 650, color: '#F2F2F5'}}>
							<RiffIcon size={30} level={0.3} />
							Vertical · 1080×1920 · <span style={{fontFamily: MONO, fontWeight: 500, color: '#FFD9BD'}}>0:31</span>
						</div>
					</div>
				</div>
			) : null}
			<EndCard t={t} />
		</>
	);
};
