import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, SANS, clamp01, easeInOut, easeOut, lerp, step} from '../lib/tokens';
import {RiffIcon} from '../lib/riff';
import {OPEN_V1, pad4, v1Src} from './model';
import {ACT, BEAT, BEAT0, PLAN} from './timing';
import {VIEW, WIN} from './layout';

// The vertical cut, twice: the cold open plays it full screen and pulls back into the 9:16 box in Riff,
// and "Make it vertical." finds the surfer again, pushes into the box and plays it on the beat.

/** where the subject sits (0..1 across the 16:9 frame) in the aerial, by source second; matches tools/footage/vert.py */
const TRACK_1076: [number, number][] = [
	[3.0, 0.29],
	[3.5, 0.3],
	[4.0, 0.31],
	[4.5, 0.35],
	[5.0, 0.385],
	[5.5, 0.43],
	[6.0, 0.49],
	[6.4, 0.53],
	[6.8, 0.575],
	[7.2, 0.585],
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
const B = (n: number) => BEAT0 + n * BEAT;

/** the 9:16 box in screen px at film time t (inside the viewer); k = 0 is the whole frame, 1 the box */
export const cropBox = (t: number) => {
	// cold open: the box the vertical cut came from, released by the rewind; then "Make it vertical."
	const src = v1Src(Math.min(t, ACT.expand));
	const k = t < ACT.crop ? 1 - easeInOut(clamp01((t - ACT.rew0) / 0.35)) : easeOut(clamp01((t - ACT.crop) / 0.32));
	const cx = Math.max(BOX_W / 2, Math.min(WIN.w - BOX_W / 2, trackAt(src) * WIN.w));
	const w = lerp(WIN.w, BOX_W, k);
	const x = lerp(WIN.w / 2, cx, k) - w / 2;
	return {x: VX + x, y: VY, w, h: BOX_H, k};
};

/** how far the camera is pushed into the box (1 = the box fills the 1080x1920 frame), and which box */
const zoomAt = (t: number) => {
	if (t < ACT.pull1) return {p: 1 - easeInOut(clamp01((t - ACT.pull0) / (ACT.pull1 - ACT.pull0))), b: cropBox(ACT.pull1)};
	return {p: easeInOut(clamp01((t - ACT.expand) / (ACT.full - ACT.expand))), b: cropBox(ACT.expand)};
};

/** the editor's transform while the camera is inside or moving through the box */
export const pushTransform = (t: number) => {
	const {p, b} = zoomAt(t);
	if (p <= 0) return undefined;
	const s = lerp(1, 1920 / b.h, p);
	return `translate(${lerp(b.x, 0, p) - b.x * s}px, ${lerp(b.y, 0, p) - b.y * s}px) scale(${s})`;
};

// the vertical cut: shot, film start, first frame (public/v/<shot>/, frame counts from tools/footage/vert.py)
type Shot = {id: string; a: number; f0: number};
const FRAMES: Record<string, number> = {v1: 120, v2: 69, v3: 69, v4: 69, v5: 36, v6: 138};
const OPEN: Shot[] = [
	{id: 'v4', a: B(0), f0: 1},
	{id: 'v2', a: B(1), f0: 1},
	{id: 'v3', a: B(2), f0: 1},
	{id: 'v1', a: OPEN_V1, f0: 1},
];
const CUT: Shot[] = [{id: 'v1', a: ACT.crop, f0: 1}, ...PLAN.shots.map(([id, n, f0]) => ({id, a: B(n), f0}))];
export const END_AT = ACT.endCard;

const shotAt = (list: Shot[], t: number) => {
	let i = 0;
	while (i + 1 < list.length && t >= list[i + 1].a) i++;
	const s = list[i];
	return {s, i, idx: Math.max(1, Math.min(FRAMES[s.id], s.f0 + Math.floor((t - s.a) * 30)))};
};

const CropOverlay: React.FC<{t: number}> = ({t}) => {
	const open = t >= ACT.pull0 && t < ACT.rew0 + 0.4;
	const cut = t >= ACT.crop && t < ACT.full;
	if (!open && !cut) return null;
	const b = cropBox(t);
	const dim = 0.62 * b.k;
	const lab = cut ? step(t, ACT.crop + 0.18, 0.3) : 0;
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
		<div style={{position: 'absolute', left: VX, top: VY, width: WIN.w, height: VIEW.h, overflow: 'hidden', transform: pushTransform(t), transformOrigin: '0 0', opacity: Math.min(1, b.k * 3)}}>
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

/** the end card's punch: a big one when the drums slam back in, then a small one on every beat */
const kick = (t: number) => {
	if (ACT.slam < 0 || t < ACT.slam) return 0;
	const big = 1 - easeOut(clamp01((t - ACT.slam) / 0.4));
	const n = Math.floor((t - ACT.slam) / BEAT);
	const small = n >= 1 ? 0.3 * (1 - easeOut(clamp01((t - ACT.slam - n * BEAT) / 0.25))) : 0;
	return Math.max(big, small);
};

const EndCard: React.FC<{t: number}> = ({t}) => {
	const a = END_AT;
	if (t < a - 0.05) return null;
	const kk = kick(t);
	const flash = ACT.slam >= 0 && t >= ACT.slam ? Math.max(0, 1 - (t - ACT.slam) / 0.14) * 0.2 : 0;
	const bg = step(t, a, 0.45, easeInOut);
	const icon = step(t, a + 0.08, 0.6);
	const word = step(t, a + 0.22, 0.6);
	const line = step(t, a + 0.55, 0.6);
	const foot = step(t, a + 0.9, 0.6);
	return (
		<div style={{position: 'absolute', inset: 0, zIndex: 95}}>
			<div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.66)', opacity: bg}} />
			<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 34, marginTop: -60, transform: `scale(${1 + 0.07 * kk})`}}>
					<div style={{transform: `scale(${0.85 + 0.15 * icon})`, opacity: icon}}>
						<RiffIcon size={140} level={0.45 + 0.4 * kk} glow={0.35 * icon + 0.5 * kk} />
					</div>
					<div style={{fontFamily: SANS, fontWeight: 620, fontSize: 158, letterSpacing: '-0.055em', color: '#F5F5F7', opacity: word, transform: `translateX(${(1 - word) * -24}px)`, filter: `blur(${(1 - word) * 8}px)`}}>Riff</div>
				</div>
				<div style={{marginTop: 40, fontFamily: SANS, fontWeight: 560, fontSize: 66, letterSpacing: '-0.03em', color: '#F5F5F7', opacity: line, transform: `translateY(${(1 - line) * 14}px)`}}>Just talk.</div>
				<div style={{position: 'absolute', bottom: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: foot}}>
					<div style={{fontFamily: SANS, fontWeight: 560, fontSize: 32, color: '#C9C9CE', letterSpacing: '-0.01em'}}>Video editing by voice</div>
					<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, color: '#8E8E93', letterSpacing: '-0.005em'}}>Coming soon for Mac</div>
				</div>
			</div>
			{flash > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${flash})`}} /> : null}
		</div>
	);
};

/** the full-screen vertical picture, shrinking to (or growing from) the box in the viewer */
const Vertical: React.FC<{t: number; list: Shot[]}> = ({t, list}) => {
	const {p, b} = zoomAt(t);
	const {s, i, idx} = shotAt(list, t);
	const r = {x: lerp(b.x, 0, p), y: lerp(b.y, 0, p), w: lerp(b.w, 1080, p), h: lerp(b.h, 1920, p)};
	// a small punch on every cut
	const punch = i > 0 || list === OPEN ? 1 + 0.05 * (1 - easeOut(clamp01((t - s.a) / 0.4))) : 1;
	const flash = i > 0 ? Math.max(0, 1 - (t - s.a) / 0.12) * 0.22 : 0;
	return (
		<div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, overflow: 'hidden', zIndex: 90, background: '#000'}}>
			<Img src={staticFile(`v/${s.id}/${pad4(idx)}.jpg`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${punch})`}} />
			{flash > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${flash})`}} /> : null}
		</div>
	);
};

export const Finale: React.FC<{t: number}> = ({t}) => (
	<>
		<CropOverlay t={t} />
		{t < ACT.pull1 ? <Vertical t={t} list={OPEN} /> : null}
		{t >= ACT.expand ? <Vertical t={t} list={CUT} /> : null}
		<EndCard t={t} />
	</>
);
