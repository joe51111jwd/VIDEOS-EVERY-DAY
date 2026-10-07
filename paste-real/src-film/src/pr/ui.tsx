// Shared on-screen pieces: captions, the grab overlay, selection boxes, keycaps, toasts, cursor, app icon.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, easeIn, easeInOut, easeOut, FPS, GREEN, lerp, MONO, SANS, spr, step} from '../lib/tokens';

export const BLUE = '#2F6BFF';
export const SEL = '#2F6BFF';

export const darkGlass: React.CSSProperties = {
	background: 'linear-gradient(180deg, rgba(44,44,50,0.9) 0%, rgba(20,20,24,0.93) 100%)',
	boxShadow: '0 18px 44px rgba(10,15,40,0.32), 0 4px 12px rgba(10,15,40,0.2), inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.16)',
};
export const lightPanel: React.CSSProperties = {
	background: 'rgba(255,255,255,0.97)',
	boxShadow: '0 24px 60px rgba(20,24,40,0.16), 0 6px 18px rgba(20,24,40,0.10), 0 0 0 1px rgba(20,24,40,0.07)',
};

// ------------------------------------------------------------------ captions: ALL CAPS, dark glass, upper third
export const Caption: React.FC<{t: number; a: number; b: number; text: string; top?: number; size?: number; hold?: boolean; instant?: boolean}> = ({t, a, b, text, top = 170, size = 60, hold, instant}) => {
	if (t < a || t >= b) return null;
	const p = instant ? 1 : step(t, a, 0.2, easeOut);
	const out = hold ? 0 : step(t, b - 0.1, 0.1, easeIn);
	const H = size * 1.92;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', zIndex: 300, pointerEvents: 'none'}}>
			<div
				style={{
					height: H,
					borderRadius: H / 2,
					padding: `0 ${size * 0.74}px`,
					...darkGlass,
					display: 'flex',
					alignItems: 'center',
					fontFamily: SANS,
					fontSize: size,
					fontWeight: 800,
					letterSpacing: '-0.012em',
					color: '#F5F5F7',
					whiteSpace: 'nowrap',
					opacity: clamp01(p * 1.6) * (1 - out),
					transform: `translateY(${(1 - p) * -10}px) scale(${1.07 - 0.07 * p})`,
					filter: p < 1 ? `blur(${(1 - p) * 5}px)` : undefined,
				}}
			>
				{text}
			</div>
		</div>
	);
};

// ------------------------------------------------------------------ the grab: dim, crosshair, marquee, flash, scan
export type Rect = {x: number; y: number; w: number; h: number};
export const lerpRect = (a: Rect, b: Rect, u: number): Rect => ({x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u), h: lerp(a.h, b.h, u)});

export const Crosshair: React.FC<{x: number; y: number; o?: number}> = ({x, y, o = 1}) => (
	<svg width={64} height={64} viewBox="-32 -32 64 64" style={{position: 'absolute', left: x - 32, top: y - 32, opacity: o, zIndex: 260, overflow: 'visible'}}>
		<g strokeLinecap="round">
			<path d="M-22 0H-6M6 0H22M0 -22V-6M0 6V22" stroke="#fff" strokeWidth={6} />
			<path d="M-22 0H-6M6 0H22M0 -22V-6M0 6V22" stroke="#111" strokeWidth={2.4} />
			<circle r={2.6} fill="#111" stroke="#fff" strokeWidth={1.6} />
		</g>
	</svg>
);

/** marquee being dragged / held: dims everything outside r, blue frame with handles, live size label */
export const Marquee: React.FC<{r: Rect; dim: number; frame: number; label?: string; labelO?: number; scale?: number}> = ({r, dim, frame, label, labelO = 1, scale = 1}) => (
	<>
		<div
			style={{
				position: 'absolute',
				left: r.x,
				top: r.y,
				width: Math.max(0, r.w),
				height: Math.max(0, r.h),
				boxShadow: `0 0 0 4000px rgba(8,10,20,${0.42 * dim})`,
				outline: frame > 0 ? `${2.5 * scale}px solid rgba(255,255,255,${0.95 * frame})` : undefined,
				zIndex: 250,
			}}
		>
			{frame > 0
				? [
						[0, 0],
						[1, 0],
						[0, 1],
						[1, 1],
					].map(([u, v], i) => (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: u * r.w - 7 * scale,
								top: v * r.h - 7 * scale,
								width: 14 * scale,
								height: 14 * scale,
								borderRadius: 3 * scale,
								background: '#fff',
								boxShadow: `0 0 0 ${1.5 * scale}px ${SEL}, 0 2px 6px rgba(0,0,0,0.25)`,
								opacity: frame,
							}}
						/>
					))
				: null}
		</div>
		{label ? (
			<div
				style={{
					position: 'absolute',
					left: Math.min(r.x + r.w + 14 * scale, 1080 - 210 * scale),
					top: r.y + r.h + 12 * scale,
					height: 38 * scale,
					padding: `0 ${13 * scale}px`,
					borderRadius: 10 * scale,
					...darkGlass,
					fontFamily: MONO,
					fontWeight: 500,
					fontSize: 19 * scale,
					color: '#fff',
					display: 'flex',
					alignItems: 'center',
					whiteSpace: 'nowrap',
					opacity: labelO,
					zIndex: 261,
				}}
			>
				{label}
			</div>
		) : null}
	</>
);

/** white flash inside the grabbed rect, on the hit */
export const Flash: React.FC<{r: Rect; t: number; a: number; radius?: number}> = ({r, t, a, radius = 0}) => {
	if (t < a || t > a + 0.4) return null;
	const o = Math.exp(-(t - a) / 0.09) * 0.9;
	return <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: radius, background: '#fff', opacity: o, zIndex: 255, mixBlendMode: 'screen'}} />;
};

/** a diagonal band of light sweeping across r (the rebuild scan) */
export const Scan: React.FC<{r: Rect; p: number; radius?: number; strength?: number}> = ({r, p, radius = 0, strength = 1}) => {
	if (p <= 0 || p >= 1) return null;
	const pos = lerp(-40, 140, p);
	return (
		<div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: radius, overflow: 'hidden', zIndex: 254, pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: `linear-gradient(115deg, rgba(120,170,255,0) ${pos - 22}%, rgba(140,185,255,${0.34 * strength}) ${pos - 6}%, rgba(255,255,255,${0.75 * strength}) ${pos}%, rgba(140,185,255,${0.34 * strength}) ${pos + 6}%, rgba(120,170,255,0) ${pos + 22}%)`,
					mixBlendMode: 'screen',
				}}
			/>
			<div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 ${3}px rgba(90,150,255,${0.8 * Math.sin(p * Math.PI)})`, borderRadius: radius}} />
		</div>
	);
};

/** "Rebuilding…" pill with progress */
export const RebuildPill: React.FC<{cx: number; y: number; t: number; a: number; b: number; scale?: number; text?: string}> = ({cx, y, t, a, b, scale = 1, text = 'Rebuilding'}) => {
	if (t < a || t > b + 0.25) return null;
	const inP = step(t, a, 0.25);
	const out = step(t, b, 0.22, easeInOut);
	const prog = easeInOut(clamp01((t - a) / (b - a - 0.06)));
	const Hh = 56 * scale;
	const w = 300 * scale;
	const fr = useCurrentFrame();
	return (
		<div
			style={{
				position: 'absolute',
				left: cx - w / 2,
				top: y,
				width: w,
				height: Hh,
				borderRadius: Hh / 2,
				...darkGlass,
				display: 'flex',
				alignItems: 'center',
				gap: 12 * scale,
				padding: `0 ${22 * scale}px 0 ${16 * scale}px`,
				boxSizing: 'border-box',
				fontFamily: SANS,
				fontWeight: 600,
				fontSize: 21 * scale,
				color: '#F5F5F7',
				opacity: clamp01(inP * 1.5) * (1 - out),
				transform: `translateY(${(1 - inP) * 10 - out * 6}px) scale(${0.94 + 0.06 * inP})`,
				overflow: 'hidden',
				zIndex: 262,
				whiteSpace: 'nowrap',
			}}
		>
			<svg width={26 * scale} height={26 * scale} viewBox="0 0 24 24" style={{transform: `rotate(${(fr / FPS) * 420}deg)`, flexShrink: 0}}>
				<circle cx={12} cy={12} r={9} stroke="rgba(255,255,255,0.2)" strokeWidth={2.6} fill="none" />
				<path d="M12 3a9 9 0 0 1 9 9" stroke="#8DB2FF" strokeWidth={2.6} fill="none" strokeLinecap="round" />
			</svg>
			<span>{text}…</span>
			<span style={{marginLeft: 'auto', fontFamily: MONO, fontSize: 18 * scale, color: 'rgba(245,245,247,0.6)'}}>{Math.round(prog * 100)}%</span>
			<div style={{position: 'absolute', left: 0, bottom: 0, height: 3 * scale, width: `${prog * 100}%`, background: 'linear-gradient(90deg, #6E9BFF, #B8CCFF)'}} />
		</div>
	);
};

/** detected element: blue outline + type tag */
export const Detect: React.FC<{r: Rect; p: number; label: string; scale?: number; radius?: number; out?: number}> = ({r, p, label, scale = 1, radius = 6, out = 0}) => {
	if (p <= 0 || out >= 1) return null;
	const o = clamp01(p * 2) * (1 - out);
	const g = 1 + 0.04 * (1 - p);
	return (
		<div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, opacity: o, transform: `scale(${g})`, zIndex: 256, pointerEvents: 'none'}}>
			<div style={{position: 'absolute', inset: 0, borderRadius: radius * scale, boxShadow: `0 0 0 ${2.5 * scale}px ${SEL}, 0 0 ${18 * scale}px rgba(47,107,255,0.45)`, background: 'rgba(47,107,255,0.07)'}} />
			<div
				style={{
					position: 'absolute',
					left: -1.25 * scale,
					top: -34 * scale,
					height: 30 * scale,
					padding: `0 ${10 * scale}px`,
					borderRadius: 7 * scale,
					background: SEL,
					color: '#fff',
					fontFamily: SANS,
					fontWeight: 600,
					fontSize: 17 * scale,
					display: 'flex',
					alignItems: 'center',
					whiteSpace: 'nowrap',
				}}
			>
				{label}
			</div>
		</div>
	);
};

/** design-tool selection: blue frame, 8 handles, optional name tag above and size tag below */
export const SelBox: React.FC<{r: Rect; o?: number; scale?: number; name?: string; size?: string; handles?: boolean; dashed?: boolean}> = ({r, o = 1, scale = 1, name, size, handles = true, dashed}) => {
	if (o <= 0) return null;
	const hs = 13 * scale;
	const pts = [
		[0, 0],
		[0.5, 0],
		[1, 0],
		[0, 0.5],
		[1, 0.5],
		[0, 1],
		[0.5, 1],
		[1, 1],
	];
	return (
		<div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, opacity: o, zIndex: 240, pointerEvents: 'none'}}>
			<div style={{position: 'absolute', inset: 0, border: `${2 * scale}px ${dashed ? 'dashed' : 'solid'} ${SEL}`, margin: -1 * scale}} />
			{handles
				? pts.map(([u, v], i) => (
						<div key={i} style={{position: 'absolute', left: u * r.w - hs / 2, top: v * r.h - hs / 2, width: hs, height: hs, background: '#fff', border: `${2 * scale}px solid ${SEL}`, boxSizing: 'border-box', borderRadius: 2 * scale}} />
					))
				: null}
			{name ? (
				<div style={{position: 'absolute', left: -2 * scale, top: -32 * scale, fontFamily: SANS, fontWeight: 600, fontSize: 17 * scale, color: SEL, whiteSpace: 'nowrap'}}>{name}</div>
			) : null}
			{size ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: r.h + 12 * scale, display: 'flex', justifyContent: 'center'}}>
					<div style={{height: 30 * scale, padding: `0 ${10 * scale}px`, borderRadius: 7 * scale, background: SEL, color: '#fff', fontFamily: SANS, fontWeight: 600, fontSize: 17 * scale, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>{size}</div>
				</div>
			) : null}
		</div>
	);
};

// ------------------------------------------------------------------ keys
const KeyCap: React.FC<{label: React.ReactNode; w: number; h: number; down: number; scale: number}> = ({label, w, h, down, scale}) => (
	<div style={{position: 'relative', width: w, height: h}}>
		<div style={{position: 'absolute', left: 6 * scale, right: 6 * scale, top: 14 * scale, bottom: -10 * scale, borderRadius: 26 * scale, background: 'rgba(0,0,0,0.45)', filter: `blur(${(20 - 10 * down) * scale}px)`}} />
		<div style={{position: 'absolute', inset: 0, top: (9 + 6 * down) * scale, borderRadius: 24 * scale, background: 'linear-gradient(180deg, #CFCFD4, #A9A9B0)'}} />
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				top: down * 6 * scale,
				height: h - 9 * scale,
				borderRadius: 24 * scale,
				background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F1F4 60%, #E6E6EA 100%)',
				boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,1), inset 0 -2px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.08)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: SANS,
				fontWeight: 500,
				fontSize: 64 * scale,
				color: '#2A2A2E',
			}}
		>
			{label}
		</div>
	</div>
);

/** physical keycaps (e.g. ⌘ V), pressed together at `press` */
export const Keys: React.FC<{t: number; a: number; press: number; keys: React.ReactNode[]; y: number; scale?: number; cx?: number; holdUntil?: number}> = ({t, a, press, keys, y, scale = 1, cx = 540, holdUntil}) => {
	const inP = spr(t, a, 5, 0.7);
	const outP = holdUntil !== undefined ? step(t, holdUntil, 0.12, easeInOut) : step(t, press + 0.26, 0.24, easeInOut);
	if (t < a || outP >= 1) return null;
	const down = clamp01(1 - Math.abs(t - press - 0.04) / 0.1) ** 0.7 * (t > press - 0.06 ? 1 : 0);
	const s = 150 * scale;
	const gap = 22 * scale;
	const tw = keys.length * s + (keys.length - 1) * gap;
	return (
		<div
			style={{
				position: 'absolute',
				left: cx - tw / 2,
				top: y,
				display: 'flex',
				gap,
				zIndex: 280,
				opacity: clamp01(inP * 1.5) * (1 - outP),
				transform: `translateY(${(1 - inP) * 50 * scale}px) scale(${(0.9 + 0.1 * inP) * (1 - 0.08 * outP)})`,
			}}
		>
			{keys.map((k, i) => (
				<KeyCap key={i} label={k} w={s} h={s} down={down} scale={scale} />
			))}
		</div>
	);
};

/** glass toast: "Pasted as … ✓" */
export const Toast: React.FC<{t: number; a: number; b: number; text: React.ReactNode; cx?: number; y: number; scale?: number}> = ({t, a, b, text, cx = 540, y, scale = 1}) => {
	if (t < a || t > b) return null;
	const p = spr(t, a, 6, 0.75);
	const out = step(t, b - 0.25, 0.25, easeInOut);
	const Hh = 60 * scale;
	return (
		<div style={{position: 'absolute', left: 0, width: cx * 2, top: y, display: 'flex', justifyContent: 'center', zIndex: 270, pointerEvents: 'none'}}>
			<div
				style={{
					height: Hh,
					borderRadius: Hh / 2,
					...darkGlass,
					padding: `0 ${24 * scale}px 0 ${12 * scale}px`,
					display: 'flex',
					alignItems: 'center',
					gap: 12 * scale,
					fontFamily: SANS,
					fontWeight: 600,
					fontSize: 23 * scale,
					color: '#F5F5F7',
					whiteSpace: 'nowrap',
					opacity: clamp01(p * 1.4) * (1 - out),
					transform: `translateY(${(1 - Math.min(1, p)) * 16}px) scale(${0.92 + 0.08 * Math.min(1.04, p)})`,
				}}
			>
				<div style={{width: 36 * scale, height: 36 * scale, borderRadius: 18 * scale, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<svg width={20 * scale} height={20 * scale} viewBox="0 0 12 12">
						<path d="M2.6 6.3 5 8.6l4.5-5" stroke="#fff" strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</div>
				{text}
			</div>
		</div>
	);
};

// ------------------------------------------------------------------ pointer
export const Pointer: React.FC<{x: number; y: number; press?: number; scale?: number; o?: number}> = ({x, y, press = 0, scale = 1.3, o = 1}) => (
	<div style={{position: 'absolute', left: x, top: y, zIndex: 290, opacity: o, transform: `scale(${scale * (1 - 0.1 * press)})`, transformOrigin: '0 0', pointerEvents: 'none'}}>
		<svg width={28} height={40} viewBox="0 0 28 40" style={{overflow: 'visible', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))'}}>
			<path d="M2 1.5 L2 30 L9.2 23.4 L14 34.6 L19 32.5 L14.3 21.6 L24 21.4 Z" fill="#111" stroke="#fff" strokeWidth={2.2} strokeLinejoin="round" />
		</svg>
	</div>
);

/** pointer path through keyframes [t, x, y] with eased moves */
export const path = (t: number, keys: [number, number, number][]) => {
	if (t <= keys[0][0]) return {x: keys[0][1], y: keys[0][2]};
	for (let i = 1; i < keys.length; i++) {
		const [t1, x1, y1] = keys[i];
		const [t0, x0, y0] = keys[i - 1];
		if (t <= t1) {
			const u = easeInOut(clamp01((t - t0) / Math.max(1e-6, t1 - t0)));
			return {x: lerp(x0, x1, u), y: lerp(y0, y1, u)};
		}
	}
	const k = keys[keys.length - 1];
	return {x: k[1], y: k[2]};
};
export const clickAt = (t: number, ts: number[]) => {
	let p = 0;
	for (const c of ts) p = Math.max(p, clamp01(1 - Math.abs(t - c) / 0.09));
	return p;
};

// ------------------------------------------------------------------ Paste Real app icon: marquee corners around a solid layer
export const AppIcon: React.FC<{size: number; glow?: number}> = ({size, glow = 0}) => {
	const s = size;
	return (
		<div style={{width: s, height: s, position: 'relative', flexShrink: 0}}>
			{glow > 0 ? <div style={{position: 'absolute', inset: -s * 0.45, borderRadius: '50%', background: 'radial-gradient(circle, rgba(90,130,255,0.55) 0%, rgba(90,130,255,0) 66%)', opacity: glow, filter: `blur(${s * 0.1}px)`}} /> : null}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: s * 0.235,
					background: 'linear-gradient(150deg, #6F9BFF 0%, #2F6BFF 46%, #3F3BEA 100%)',
					boxShadow: `0 ${s * 0.06}px ${s * 0.16}px rgba(30,50,140,0.45), inset 0 0 0 ${Math.max(1, s * 0.008)}px rgba(255,255,255,0.25), inset 0 ${s * 0.014}px 0 rgba(255,255,255,0.35)`,
					overflow: 'hidden',
				}}
			>
				<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(120% 70% at 30% 0%, rgba(255,255,255,0.35), rgba(255,255,255,0) 60%)'}} />
				<svg width={s} height={s} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0}}>
					<g stroke="#fff" strokeWidth={6.2} fill="none" strokeLinecap="round" strokeLinejoin="round">
						<path d="M22 36V24a2 2 0 0 1 2-2h12" />
						<path d="M64 22h12a2 2 0 0 1 2 2v12" />
						<path d="M78 64v12a2 2 0 0 1-2 2H64" />
						<path d="M36 78H24a2 2 0 0 1-2-2V64" />
					</g>
					<rect x={33} y={33} width={26} height={26} rx={5} fill="rgba(255,255,255,0.38)" />
					<rect x={42} y={42} width={26} height={26} rx={5} fill="#fff" />
				</svg>
			</div>
		</div>
	);
};

export const Full: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => <AbsoluteFill style={style}>{children}</AbsoluteFill>;
