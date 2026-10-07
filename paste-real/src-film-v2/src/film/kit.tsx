import React from 'react';
import {CmdGlyph, Keycap, Mark} from '../brand/brand';
import {BRAND, BRAND_MONO, clamp01, easeInOut, easeMac, easeOut, lerp, lerpRect, range, Rect, step, SYS, textW} from '../lib/tokens';
import {CursorKind, DESK} from '../mac/mac';

// Shared machinery for the screen-recording scenes: camera, cursor, keystroke pill, the copy in flight, captions.

// ------------------------------------------------------------------ camera
export type Cam = {cx: number; cy: number; s: number};
export const clampCam = (c: Cam): Cam => {
	const hw = 540 / c.s,
		hh = 960 / c.s;
	return {s: c.s, cx: Math.min(DESK.w - hw, Math.max(hw, c.cx)), cy: Math.min(DESK.h - hh, Math.max(hh, c.cy))};
};
/** keyframed camera; eases between keys (key times in film seconds) */
export const makeCam = (keys: [number, Cam][], ease = easeInOut) => {
	const K = keys.map(([t, c]) => [t, clampCam(c)] as [number, Cam]);
	return (t: number): Cam => {
		if (t <= K[0][0]) return K[0][1];
		for (let i = 0; i < K.length - 1; i++) {
			const [ta, a] = K[i],
				[tb, b] = K[i + 1];
			if (t >= ta && t <= tb) {
				const u = ease(clamp01((t - ta) / (tb - ta)));
				return clampCam({cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), s: lerp(a.s, b.s, u)});
			}
		}
		return K[K.length - 1][1];
	};
};
export const toScreen = (c: Cam, r: Rect): Rect => ({x: 540 + (r.x - c.cx) * c.s, y: 960 + (r.y - c.cy) * c.s, w: r.w * c.s, h: r.h * c.s});
export const camFor = (r: Rect, s: number, dy = 0): Cam => ({cx: r.x + r.w / 2, cy: r.y + r.h / 2 + dy, s});

/** the desktop, through the camera */
export const DeskView: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
	<div style={{position: 'absolute', left: 0, top: 0, width: DESK.w, height: DESK.h, transformOrigin: '0 0', transform: `translate(${540 - cam.cx * cam.s}px, ${960 - cam.cy * cam.s}px) scale(${cam.s})`}}>{children}</div>
);

// ------------------------------------------------------------------ cursor
export type CK = [number, number, number, CursorKind?];
export const makeCursor = (keys: CK[]) => (t: number) => {
	let i = 0;
	while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
	const a = keys[i],
		b = keys[i + 1];
	const u = easeMac(clamp01((t - a[0]) / (b[0] - a[0] || 1)));
	const dx = b[1] - a[1],
		dy = b[2] - a[2];
	const L = Math.hypot(dx, dy) || 1;
	const bow = Math.sin(u * Math.PI) * Math.min(14, L * 0.05);
	return {x: lerp(a[1], b[1], u) + (-dy / L) * bow, y: lerp(a[2], b[2], u) + (dx / L) * bow, kind: ((u < 0.5 ? a[3] : b[3]) ?? 'arrow') as CursorKind};
};
export const makePress = (iv: [number, number][]) => (t: number) => (iv.some(([a, b]) => t >= a && t < b) ? 1 : 0);

/** text typed at a steady rate from t0 (null before) */
export const typed = (t: number, t0: number, text: string, perChar: number) => (t < t0 ? null : text.slice(0, Math.min(text.length, Math.floor((t - t0) / perChar) + 1)));

export const mixHex = (a: string, b: string, u: number) => {
	const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)),
		pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
	return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], u)).toString(16).padStart(2, '0')).join('');
};

// ------------------------------------------------------------------ keystroke pill (doubles as captions)
export const PILL_H = 104;
const KEYS_W = 64 * 2 + 10;
const TXT = 44;
const tw = (s: string) => textW(s, TXT, 600, BRAND, -0.03);
const doneW = (s: string, detail?: string) => 40 + 14 + tw(s) + (detail ? 16 + textW(detail, 26, 500, BRAND_MONO) : 0);

const DoneText: React.FC<{s: string; detail?: string; id: string}> = ({s, detail, id}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
		<Mark size={40} ink="#fff" id={id} />
		<div style={{fontSize: TXT, fontWeight: 600, letterSpacing: '-0.03em', color: '#fff'}}>{s}</div>
		{detail ? <div style={{fontFamily: BRAND_MONO, fontSize: 26, fontWeight: 500, color: '#A9A8AD', marginLeft: 2}}>{detail}</div> : null}
	</div>
);

export type PillTimes = {copy: number; lift: number; paste: number; land: number; out: number; in?: number};
export type PillText = {copy: string; copied: string; copiedDetail?: string; paste: string; pasted: string; pastedDetail?: string};

/** where the docked copy sits inside the pill (screen px) for given pill geometry */
export const pillGeom = (t: number, T: PillTimes, L: PillText, y: number) => {
	const d1 = step(t, T.copy + 0.1, 0.24);
	const sw = step(t, T.lift + 0.12, 0.3);
	const d2 = step(t, T.land, 0.24);
	const dock = range(t, [T.lift + 0.24, T.lift + 0.46], [0, 1], easeOut) * (1 - range(t, [T.paste, T.paste + 0.14], [0, 1], easeOut));
	const contentW = lerp(lerp(tw(L.copy), doneW(L.copied, L.copiedDetail), d1), lerp(tw(L.paste), doneW(L.pasted, L.pastedDetail), d2), sw);
	const padL = lerp(22, 14, dock);
	const dockW = (62 + 14) * dock;
	const w = padL + dockW + KEYS_W + 24 + contentW + 36;
	const x = 540 - w / 2;
	return {d1, sw, d2, dock, padL, dockW, w, x, y, slot: {x: x + padL, y: y + (PILL_H - 77.5) / 2, w: 62, h: 77.5} as Rect};
};

export const KeyPill: React.FC<{t: number; T: PillTimes; L: PillText; y: number; id: string}> = ({t, T, L, y, id}) => {
	const g = pillGeom(t, T, L, y);
	const appear = T.in === undefined ? 1 : step(t, T.in, 0.22);
	const out = step(t, T.out, 0.3);
	const keyDown = (t >= T.copy && t < T.copy + 0.15) || (t >= T.paste && t < T.paste + 0.15) ? 1 : 0;
	const o = appear * (1 - out);
	if (o <= 0.001) return null;
	const items: [React.ReactNode, number, number][] = [
		[<div style={{fontSize: TXT, fontWeight: 600, letterSpacing: '-0.03em', color: '#fff'}}>{L.copy}</div>, (1 - g.d1) * (1 - g.sw), -14 * g.d1],
		[<DoneText s={L.copied} detail={L.copiedDetail} id={`${id}c`} />, g.d1 * (1 - g.sw), 14 * (1 - g.d1) - 14 * g.sw],
		[<div style={{fontSize: TXT, fontWeight: 600, letterSpacing: '-0.03em', color: '#fff'}}>{L.paste}</div>, g.sw * (1 - g.d2), 14 * (1 - g.sw) - 14 * g.d2],
		[<DoneText s={L.pasted} detail={L.pastedDetail} id={`${id}v`} />, g.sw * g.d2, 14 * (1 - g.d2)],
	];
	return (
		<div
			style={{
				position: 'absolute',
				left: g.x,
				top: y,
				width: g.w,
				height: PILL_H,
				borderRadius: PILL_H / 2,
				background: 'rgba(20,20,24,0.9)',
				boxShadow: '0 22px 54px rgba(0,0,0,0.34), inset 0 0 0 1px rgba(255,255,255,0.08)',
				opacity: o,
				transform: `translateY(${-24 * out + 18 * (1 - appear)}px)`,
				fontFamily: BRAND,
				whiteSpace: 'nowrap',
				zIndex: 70,
			}}
		>
			<div style={{position: 'absolute', left: g.padL + g.dockW, top: (PILL_H - 69) / 2, display: 'flex', gap: 10}}>
				<Keycap size={64} down={keyDown} label={<CmdGlyph size={28} />} />
				<Keycap
					size={64}
					down={keyDown}
					label={
						<div style={{position: 'relative', width: 30, height: 34, fontFamily: SYS, fontWeight: 500, fontSize: 29}}>
							<span style={{position: 'absolute', inset: 0, textAlign: 'center', opacity: 1 - g.sw}}>C</span>
							<span style={{position: 'absolute', inset: 0, textAlign: 'center', opacity: g.sw}}>V</span>
						</div>
					}
				/>
			</div>
			{items.map(([node, op, dy], i) =>
				op > 0.001 ? (
					<div key={i} style={{position: 'absolute', left: g.padL + g.dockW + KEYS_W + 24, top: 0, height: PILL_H, display: 'flex', alignItems: 'center', opacity: op, transform: `translateY(${dy}px)`}}>
						{node}
					</div>
				) : null,
			)}
		</div>
	);
};

// ------------------------------------------------------------------ the copy in flight
/**
 * The copied thing: lifts off the source (screen rect src), flies into the pill's slot, then from the slot to the
 * destination (screen rect dst) on paste. `render(w, h)` draws the copied content at a given size.
 */
export const Ghost: React.FC<{t: number; T: PillTimes; src: Rect; dst: Rect; slot: Rect; render: (w: number, h: number) => React.ReactNode; radius?: number}> = ({t, T, src, dst, slot, render, radius = 2}) => {
	if (t < T.copy + 0.22 || t >= T.land) return null;
	const liftP = step(t, T.copy + 0.22, 0.25);
	let g: Rect;
	let k: number;
	// the slot keeps the source's aspect inside the pill
	const asp = src.w / src.h;
	const sl: Rect = asp > slot.w / slot.h ? {x: slot.x, y: slot.y + (slot.h - slot.w / asp) / 2, w: slot.w, h: slot.w / asp} : {x: slot.x + (slot.w - slot.h * asp) / 2, y: slot.y, w: slot.h * asp, h: slot.h};
	if (t < T.lift) {
		const s = 0.035 * liftP;
		g = {x: src.x - (src.w * s) / 2, y: src.y - (src.h * s) / 2 - 10 * liftP, w: src.w * (1 + s), h: src.h * (1 + s)};
		k = liftP;
	} else if (t < T.paste) {
		g = lerpRect(src, sl, easeInOut(clamp01((t - T.lift) / 0.46)));
		k = 1;
	} else {
		const u = easeOut(clamp01((t - T.paste) / (T.land - T.paste)));
		g = lerpRect(sl, dst, u);
		k = 1 - u;
	}
	return (
		<div
			style={{
				position: 'absolute',
				left: g.x,
				top: g.y,
				width: g.w,
				height: g.h,
				borderRadius: lerp(radius, 7, k),
				overflow: 'hidden',
				boxShadow: `0 ${lerp(26, 8, k)}px ${lerp(60, 20, k)}px rgba(0,0,0,${0.32 * Math.min(1, liftP)}), 0 0 0 ${2.5 * k}px rgba(255,255,255,0.95)`,
				zIndex: 80,
			}}
		>
			{render(g.w, g.h)}
		</div>
	);
};

// ------------------------------------------------------------------ captions ("Real data.")
export const Captions: React.FC<{t: number; caps: [number, number, string][]; top?: number}> = ({t, caps, top = 186}) => (
	<>
		{caps.map(([a, b, txt]) => {
			const p = step(t, a, 0.2) * (1 - step(t, b, 0.14));
			if (p <= 0) return null;
			return (
				<div key={txt + a} style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 14}px)`, zIndex: 90}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 18, height: 100, padding: '0 40px 0 30px', borderRadius: 50, background: 'rgba(20,20,24,0.95)', boxShadow: '0 22px 54px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.08)'}}>
						<Mark size={46} ink="#fff" id={`cap${Math.round(a * 100)}`} />
						<div style={{fontFamily: BRAND, fontWeight: 600, fontSize: 54, letterSpacing: '-0.035em', color: '#fff'}}>{txt}</div>
					</div>
				</div>
			);
		})}
	</>
);

/** a short white flash-free "whip" between scenes: motion-blurred vertical slide of the whole frame */
export const whip = (t: number, at: number, dur = 0.16) => {
	const u = clamp01((t - at) / dur);
	return u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI);
};
