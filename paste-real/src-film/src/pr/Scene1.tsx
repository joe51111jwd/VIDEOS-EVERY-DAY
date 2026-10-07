// 1. THIS IS A SCREENSHOT. -> NOW IT'S EDITABLE.
// A flat ad in Quick Look; ⌃⇧2 grab on the drums; it comes apart into layers and lands as a real design in the
// Paste Real canvas on the drop; headline retyped, ALL CAPS on the snare, shoe dragged, recolored on beat 4.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp01, easeIn, easeInOut, easeOut, lerp, MONO, range, SANS, spr, step} from '../lib/tokens';
import {Ad, AD_H, AD_W, CTA, DETAILS, HEAD, LOGO, PRICE, SHOE} from './Ad';
import {AppIcon, Crosshair, Detect, Flash, lightPanel, Marquee, path, Pointer, Rect, RebuildPill, Scan, SEL, SelBox, clickAt, darkGlass} from './ui';
import {T} from './T';

const OLD = 'Every mile, lighter.';
const NEW = 'Built for the long way home.';

// ad placement on screen: Quick Look vs canvas
const QL = {k: 0.8, cx: 540, cy: 968};
const CV = {k: 0.73, cx: 662, cy: 903};
const TITLE_H = 54;

export const adRect = (p: {k: number; cx: number; cy: number}): Rect => ({x: p.cx - (p.k * AD_W) / 2, y: p.cy - (p.k * AD_H) / 2, w: p.k * AD_W, h: p.k * AD_H});
const toScreen = (p: {k: number; cx: number; cy: number}, r: {x: number; y: number; w: number; h: number}): Rect => {
	const a = adRect(p);
	return {x: a.x + r.x * p.k, y: a.y + r.y * p.k, w: r.w * p.k, h: r.h * p.k};
};

const HEAD_R = (caps: boolean) => ({x: HEAD.x - 10, y: HEAD.y - 4, w: HEAD.w + 20, h: caps ? 224 : 222});
const SHOE_R = {x: SHOE.x + 10, y: SHOE.y + 10, w: SHOE.w - 20, h: SHOE.h - 10};

/** camera: scene point (x, y) sits at screen (540, 900), zoom s */
type Cam = {s: number; x: number; y: number};
const camAt = (t: number): Cam => {
	const head = toScreen(CV, HEAD_R(false));
	const hc = {x: head.x + head.w / 2, y: head.y + head.h / 2 + 30};
	const keys: [number, Cam][] = [
		[0, {s: 1, x: 540, y: 900}],
		[T.grab - 0.02, {s: 1.035, x: 540, y: 905}],
		[T.explode, {s: 1.0, x: 540, y: 900}],
		[T.land, {s: 1.0, x: 560, y: 900}],
		[T.selHead + 0.05, {s: 1.0, x: 560, y: 900}],
		[T.selHead + 0.42, {s: 1.3, x: hc.x, y: hc.y + 40}],
		[T.caps + 0.25, {s: 1.33, x: hc.x, y: hc.y + 40}],
		[T.drag2A - 0.12, {s: 1.0, x: 556, y: 925}],
		[T.color + 0.7, {s: 1.04, x: 556, y: 925}],
	];
	let a = keys[0];
	let b = keys[keys.length - 1];
	for (let i = 1; i < keys.length; i++) {
		if (t <= keys[i][0]) {
			a = keys[i - 1];
			b = keys[i];
			break;
		}
		a = keys[i];
		b = keys[i];
	}
	const u = a === b ? 1 : easeInOut(clamp01((t - a[0]) / (b[0] - a[0])));
	return {s: Math.exp(lerp(Math.log(a[1].s), Math.log(b[1].s), u)), x: lerp(a[1].x, b[1].x, u), y: lerp(a[1].y, b[1].y, u)};
};

const LayerRow: React.FC<{icon: 'T' | 'img' | 'btn' | 'logo'; name: string; sel: number; o: number; dx: number}> = ({icon, name, sel, o, dx}) => (
	<div
		style={{
			height: 50,
			margin: '0 10px',
			borderRadius: 10,
			display: 'flex',
			alignItems: 'center',
			gap: 13,
			padding: '0 12px',
			background: sel > 0 ? `rgba(47,107,255,${0.13 * sel})` : undefined,
			color: '#1C1C1E',
			fontFamily: SANS,
			fontWeight: 520,
			fontSize: 21,
			opacity: o,
			transform: `translateX(${dx}px)`,
		}}
	>
		<div style={{width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sel > 0.5 ? SEL : '#6E6E73'}}>
			{icon === 'T' ? (
				<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 21}}>T</span>
			) : icon === 'img' ? (
				<svg width={22} height={22} viewBox="0 0 22 22">
					<rect x={2} y={3.5} width={18} height={15} rx={3} fill="none" stroke="currentColor" strokeWidth={1.9} />
					<circle cx={8} cy={9} r={1.8} fill="currentColor" />
					<path d="M3.5 16.5l5-4.5 3.5 3 3-2.5 4 3.5" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinejoin="round" />
				</svg>
			) : icon === 'btn' ? (
				<svg width={22} height={22} viewBox="0 0 22 22">
					<rect x={1.5} y={6} width={19} height={10} rx={5} fill="none" stroke="currentColor" strokeWidth={1.9} />
				</svg>
			) : (
				<svg width={22} height={22} viewBox="0 0 22 22">
					<circle cx={11} cy={11} r={8.5} fill="none" stroke="currentColor" strokeWidth={1.9} />
					<path d="M5.5 13a5.5 5.5 0 0 1 11 0Z" fill="currentColor" />
				</svg>
			)}
		</div>
		<span style={{color: sel > 0.5 ? SEL : '#1C1C1E', fontWeight: sel > 0.5 ? 620 : 520}}>{name}</span>
	</div>
);

const LayersPanel: React.FC<{t: number; selHead: number; selShoe: number; away: number}> = ({t, selHead, selShoe, away}) => {
	const p = step(t, T.land, 0.42);
	if (p <= 0) return null;
	const rows: {icon: 'T' | 'img' | 'btn' | 'logo'; name: string; sel: number}[] = [
		{icon: 'T', name: 'Headline', sel: selHead},
		{icon: 'img', name: 'Shoe', sel: selShoe},
		{icon: 'btn', name: 'Shop now', sel: 0},
		{icon: 'T', name: '$160', sel: 0},
		{icon: 'T', name: 'Drift 3', sel: 0},
		{icon: 'logo', name: 'Halden logo', sel: 0},
		{icon: 'img', name: 'Background', sel: 0},
	];
	return (
		<div style={{position: 'absolute', left: 24, top: 380, width: 252, borderRadius: 22, ...lightPanel, paddingBottom: 10, opacity: clamp01(p * 1.4) * (1 - 0.4 * away), transform: `translateX(${(1 - p) * -60 - away * 330}px)`, zIndex: 120}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px 12px'}}>
				<AppIcon size={34} />
				<div style={{fontFamily: SANS, fontWeight: 650, fontSize: 21, color: '#1C1C1E', letterSpacing: '-0.01em'}}>Paste Real</div>
			</div>
			<div style={{height: 1, background: 'rgba(0,0,0,0.07)', margin: '0 16px 8px'}} />
			<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 16, color: '#8E8E93', letterSpacing: '0.04em', padding: '6px 22px 6px'}}>LAYERS</div>
			{rows.map((r, i) => {
				const q = step(t, T.land + 0.05 + i * 0.045, 0.3);
				return <LayerRow key={i} {...r} o={q} dx={(1 - q) * -14} />;
			})}
		</div>
	);
};

/** floating text toolbar under the headline */
const TextBar: React.FC<{r: Rect; o: number; capsOn: number; press: number}> = ({r, o, capsOn, press}) => {
	if (o <= 0) return null;
	return (
		<div
			style={{
				position: 'absolute',
				left: r.x + 4,
				top: r.y + r.h + 22,
				height: 62,
				borderRadius: 16,
				...lightPanel,
				display: 'flex',
				alignItems: 'center',
				gap: 6,
				padding: '0 10px',
				fontFamily: SANS,
				fontSize: 21,
				color: '#1C1C1E',
				opacity: o,
				transform: `translateY(${(1 - o) * 10}px)`,
				zIndex: 200,
				whiteSpace: 'nowrap',
			}}
		>
			<div style={{padding: '0 12px', fontWeight: 560}}>Inter Display</div>
			<div style={{width: 1, height: 30, background: 'rgba(0,0,0,0.1)'}} />
			<div style={{padding: '0 12px', fontWeight: 560, fontVariantNumeric: 'tabular-nums'}}>108</div>
			<div style={{width: 1, height: 30, background: 'rgba(0,0,0,0.1)'}} />
			<div style={{display: 'flex', borderRadius: 11, background: '#F0F0F2', padding: 4, gap: 4}}>
				<div style={{width: 58, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 650, background: capsOn < 0.5 ? '#fff' : undefined, boxShadow: capsOn < 0.5 ? '0 1px 3px rgba(0,0,0,0.12)' : undefined}}>Aa</div>
				<div
					style={{
						width: 58,
						height: 40,
						borderRadius: 8,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontWeight: 750,
						background: capsOn >= 0.5 ? SEL : undefined,
						color: capsOn >= 0.5 ? '#fff' : '#1C1C1E',
						transform: `scale(${1 - 0.08 * press})`,
					}}
				>
					AA
				</div>
			</div>
		</div>
	);
};

/** floating recolor bar under the shoe */
const SWATCHES = ['#F8663C', '#437DFF', '#2DBE6C', '#1C1C1E', '#F2F2F2'];
const FillBar: React.FC<{x: number; y: number; o: number; pick: number; press: number}> = ({x, y, o, pick, press}) => {
	if (o <= 0) return null;
	return (
		<div style={{position: 'absolute', left: x, top: y, height: 66, borderRadius: 33, ...lightPanel, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 0 22px', opacity: o, transform: `translateY(${(1 - o) * 10}px)`, zIndex: 200}}>
			<span style={{fontFamily: SANS, fontWeight: 600, fontSize: 20, color: '#1C1C1E', marginRight: 4}}>Recolor</span>
			{SWATCHES.map((c, i) => {
				const on = i === 1 ? pick : i === 0 ? 1 - pick : 0;
				return (
					<div key={i} style={{width: 40, height: 40, borderRadius: 20, background: c, boxShadow: `0 0 0 ${on > 0.5 ? 3 : 0}px #fff, 0 0 0 ${on > 0.5 ? 5.5 : 1}px ${on > 0.5 ? SEL : 'rgba(0,0,0,0.12)'}`, transform: i === 1 ? `scale(${1 - 0.12 * press})` : undefined}} />
				);
			})}
		</div>
	);
};

export const Scene1: React.FC<{t: number}> = ({t}) => {
	// ---------- placement: Quick Look -> (explode) -> canvas
	const move = range(t, [T.explode, T.land], [0, 1], easeInOut);
	const pl = {k: lerp(QL.k, CV.k, move), cx: lerp(QL.cx, CV.cx, move), cy: lerp(QL.cy, CV.cy, move)};
	const ar = adRect(pl);
	const exUp = step(t, T.explode, T.peak - T.explode, easeInOut);
	const exDn = step(t, T.peak + 0.07, T.land - T.peak - 0.07, easeIn);
	const ex = t < T.explode ? 0 : t >= T.land ? 0 : exUp * (1 - exDn);
	const landed = t >= T.land;
	const thump = landed ? 1 + 0.014 * Math.exp(-(t - T.land) / 0.08) * Math.cos((t - T.land) * 40) : 1;

	// ---------- grab (Quick Look)
	const qlChrome = 1 - step(t, T.explode - 0.05, 0.22, easeInOut);
	const wallO = 1 - step(t, T.explode, 0.3, easeInOut);
	const grabOn = step(t, T.grabOn, 0.16) * (1 - step(t, T.grab, 0.12));
	const c0 = {x: ar.x, y: ar.y};
	const c1 = {x: ar.x + ar.w, y: ar.y + ar.h};
	const du = range(t, [T.dragA, T.dragB], [0, 1], easeInOut);
	const cross = t < T.dragA ? path(t, [[T.grabOn, c0.x - 70, c0.y - 60], [T.dragA, c0.x, c0.y]]) : {x: lerp(c0.x, c1.x, du), y: lerp(c0.y, c1.y, du)};
	const dragging = t >= T.dragA && t < T.grab + 0.02;
	const mq: Rect = {x: c0.x, y: c0.y, w: cross.x - c0.x, h: cross.y - c0.y};
	const held = t >= T.grab && t < T.explode + 0.1;
	const heldO = held ? 1 - step(t, T.explode - 0.08, 0.16) : 0;
	const grabRect: Rect = {x: ar.x, y: ar.y, w: ar.w, h: ar.h};
	const hud = step(t, T.hud, 0.25) * (1 - step(t, T.grab - 0.25, 0.25, easeInOut));

	// ---------- canvas edits
	const selHeadO = t >= T.selHead && t < T.drag2A - 0.2 ? 1 : 0;
	const typing = clamp01((t - T.typeA) / (T.typeB - T.typeA));
	const n = Math.round(NEW.length * typing);
	const headline = t < T.typeA ? OLD : NEW.slice(0, n);
	const hl = t >= T.selHead && t < T.typeA ? 1 : 0;
	const caretBlink = t > T.typeB ? (Math.floor((t - T.typeB) / 0.35) % 2 === 0 ? 1 : 0.15) : 1;
	const caret = t >= T.typeA && t < T.caps + 0.25 ? caretBlink : 0;
	const caps = step(t, T.caps, 0.17, easeOut);
	const barO = step(t, T.typeB - 0.1, 0.25) * (1 - step(t, T.drag2A - 0.3, 0.2));
	const capsPress = clickAt(t, [T.caps]);
	const shoeSel = t >= T.shoeDown ? 1 : 0;
	const dragU = range(t, [T.drag2A, T.drag2B], [0, 1], easeInOut);
	const shoeDx = -34 * dragU;
	const shoeDy = 92 * dragU;
	const lift = step(t, T.drag2A - 0.04, 0.12) * (1 - step(t, T.drag2B, 0.18, easeInOut));
	const fill = range(t, [T.drag2A + 0.05, T.drag2B + 0.25], [0, 1], (x) => x);
	const col = step(t, T.color, 0.22, easeOut);
	const fillO = step(t, T.drag2B + 0.02, 0.2) * (1 - step(t, T.color + 0.45, 0.2));
	const pickPress = clickAt(t, [T.color]);

	// screen rects (canvas placement)
	const headR = toScreen(CV, HEAD_R(caps > 0.5));
	const shoeR = toScreen(CV, {x: SHOE_R.x + shoeDx, y: SHOE_R.y + shoeDy, w: SHOE_R.w, h: SHOE_R.h});
	const fillBarPos = {x: CV.cx - 205, y: adRect(CV).y + adRect(CV).h + 30};
	const aaBtn = {x: headR.x + 4 + 10 + 168 + 13 + 74 + 13 + 4 + 62 + 4 + 29, y: headR.y + headR.h + 22 + 31};
	const swatch = {x: fillBarPos.x + 22 + 92 + 16 + 52 + 20, y: fillBarPos.y + 33};
	const ptr = path(t, [
		[T.land + 0.05, CV.cx + 160, CV.cy + 120],
		[T.selHead - 0.02, headR.x + headR.w * 0.62, headR.y + headR.h * 0.7],
		[T.typeA + 0.3, headR.x + headR.w * 0.62, headR.y + headR.h * 0.7],
		[T.typeB, headR.x + headR.w * 0.7, headR.y + headR.h + 140],
		[T.caps - 0.06, aaBtn.x, aaBtn.y],
		[T.caps + 0.12, aaBtn.x, aaBtn.y],
		[T.shoeDown - 0.04, shoeR.x + shoeR.w * 0.52 - shoeDx * 0.74, shoeR.y + shoeR.h * 0.42 - shoeDy * 0.74],
		[T.drag2A, shoeR.x + shoeR.w * 0.52 - shoeDx * 0.74, shoeR.y + shoeR.h * 0.42 - shoeDy * 0.74],
	]);
	const ptrDrag = t >= T.drag2A ? {x: toScreen(CV, SHOE_R).x + toScreen(CV, SHOE_R).w * 0.52 + shoeDx * CV.k, y: toScreen(CV, SHOE_R).y + toScreen(CV, SHOE_R).h * 0.42 + shoeDy * CV.k} : ptr;
	const ptrSw = t >= T.drag2B + 0.05 ? path(t, [[T.drag2B + 0.05, ptrDrag.x, ptrDrag.y], [T.color - 0.05, swatch.x, swatch.y]]) : ptrDrag;
	const ptrO = step(t, T.land + 0.1, 0.2) * (t > T.typeA + 0.25 && t < T.typeB - 0.05 ? 0.0 : 1);
	const press = clickAt(t, [T.selHead, T.selHead + 0.12, T.caps, T.color]) + (t >= T.shoeDown && t < T.drag2B + 0.03 ? 1 : 0);

	const cam = camAt(t);
	return (
		<AbsoluteFill style={{background: '#ECECEF', overflow: 'hidden'}}>
			{/* canvas: dot grid */}
			<AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(0,0,0,0.11) 1.4px, transparent 1.6px)', backgroundSize: '26px 26px', opacity: 1 - wallO * 0.0}} />
			{/* desktop wallpaper behind Quick Look */}
			{wallO > 0 ? (
				<AbsoluteFill style={{opacity: wallO}}>
					<Img src={staticFile('wall.jpg')} style={{position: 'absolute', left: -1166, top: 0, width: 3413, height: 1920, objectFit: 'cover', filter: 'saturate(1.05) brightness(0.92)'}} />
				</AbsoluteFill>
			) : null}
			<AbsoluteFill style={{transform: `translate(${540 - cam.x * cam.s}px, ${900 - cam.y * cam.s}px) scale(${cam.s})`, transformOrigin: '0 0'}}>
				{/* Quick Look window chrome */}
				{qlChrome > 0 ? (
					<div style={{position: 'absolute', left: ar.x, top: ar.y - TITLE_H, width: ar.w, height: ar.h + TITLE_H, borderRadius: 18, background: '#F6F6F8', boxShadow: '0 40px 90px rgba(10,20,60,0.45), 0 10px 26px rgba(10,20,60,0.25), 0 0 0 1px rgba(0,0,0,0.12)', opacity: qlChrome}}>
						<div style={{height: TITLE_H, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 9, position: 'relative'}}>
							{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
								<div key={c} style={{width: 15, height: 15, borderRadius: 8, background: c, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.15)'}} />
							))}
							<div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 19, color: '#3A3A3C', letterSpacing: '-0.005em'}}>Screenshot 2026-10-07 at 9.41.12 AM.png</div>
						</div>
					</div>
				) : null}
				{/* the ad (3D while it comes apart) */}
				<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, perspective: 2600, perspectiveOrigin: `${pl.cx}px ${pl.cy}px`}}>
					<div
						style={{
							position: 'absolute',
							left: pl.cx - AD_W / 2,
							top: pl.cy - AD_H / 2,
							width: AD_W,
							height: AD_H,
							transformOrigin: '50% 50%',
							transformStyle: 'preserve-3d',
							transform: `translateY(${30 * ex}px) scale(${pl.k * thump * (1 - 0.24 * ex)}) rotateX(${46 * ex}deg) rotateZ(${(-30 - 6 * clamp01((t - T.explode) / (T.land - T.explode))) * ex}deg)`,
							borderRadius: 0,
							boxShadow: landed ? '0 30px 70px rgba(20,24,40,0.18), 0 6px 18px rgba(20,24,40,0.10)' : undefined,
						}}
					>
						<Ad
							radius={landed ? 6 : 0}
							clip={landed}
							s={{headline, caps, caret, hl, shoeDx, shoeDy, shoeLift: lift, fill, color: col, explode: ex, gap: 215}}
						/>
					</div>
				</div>
				{/* rebuild: flash, scan, detected parts */}
				<Flash r={grabRect} t={t} a={T.grab} />
				<Scan r={grabRect} p={range(t, [T.scan, T.explode + 0.12], [0, 1], (x) => x)} />
				<RebuildPill cx={540} y={toScreen(QL, {x: 0, y: AD_H, w: 0, h: 0}).y + 34} t={t} a={T.scan + 0.02} b={T.land - 0.05} />
				{/* canvas chrome + edits */}
				<LayersPanel t={t} selHead={selHeadO} selShoe={shoeSel} away={clamp01((cam.s - 1.02) / 0.2)} />
				<SelBox r={headR} o={selHeadO} name="Headline" />
				<TextBar r={headR} o={barO} capsOn={caps} press={capsPress} />
				<SelBox r={shoeR} o={shoeSel} name="Shoe" />
				<FillBar x={fillBarPos.x} y={fillBarPos.y} o={fillO} pick={col} press={pickPress} />
				{ptrO > 0 ? <Pointer x={ptrSw.x} y={ptrSw.y} press={clamp01(press)} o={ptrO} /> : null}
				{/* grab overlay */}
				{grabOn > 0 || held ? (
					<>
						{dragging || held ? (
							<Marquee r={held ? grabRect : mq} dim={grabOn} frame={held ? heldO : 1} label={dragging ? `${Math.round(AD_W * du)} × ${Math.round(AD_H * du)}` : undefined} labelO={grabOn} />
						) : (
							<div style={{position: 'absolute', left: -2000, top: -2000, width: 6000, height: 6000, background: `rgba(8,10,20,${0.42 * grabOn})`, zIndex: 250}} />
						)}
						{t < T.grab + 0.02 ? <Crosshair x={cross.x} y={cross.y} o={grabOn} /> : null}
					</>
				) : null}
			</AbsoluteFill>
			{hud > 0 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 316, display: 'flex', justifyContent: 'center', zIndex: 265}}>
					<div style={{height: 52, borderRadius: 26, ...darkGlass, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px 0 10px', opacity: hud, transform: `translateY(${(1 - hud) * -8}px)`, fontFamily: SANS, fontWeight: 600, fontSize: 20, color: '#F5F5F7'}}>
						<AppIcon size={34} />
						<span>Grab</span>
						<span style={{fontFamily: MONO, fontSize: 19, color: 'rgba(245,245,247,0.65)', marginLeft: 4}}>⌃⇧2</span>
					</div>
				</div>
			) : null}
		</AbsoluteFill>
	);
};
