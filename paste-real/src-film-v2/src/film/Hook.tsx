import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CmdGlyph, Grab, Keycap, Mark} from '../brand/brand';
import {at} from '../lib/beat';
import {BRAND, BRAND_MONO, clamp01, easeInOut, easeMac, easeOut, FPS, lerp, lerpRect, range, Rect, step, SYS, textW} from '../lib/tokens';
import {Cursor, CursorKind, DESK, MenuBar, Wallpaper, Win} from '../mac/mac';
import {FEED_POST, FeedPage, FeedPost, FIG, FigLayer, FigmaLeft, FigmaRight, FigmaTabs, FigmaToolbar, FigPanel, FigSelect, SAFARI_BAR, SafariChrome} from './apps';
import {AD, adLayout, LullAd} from './LullAd';
import {T} from './T';

// The hook: an ad in a social feed in Safari (top), Figma (bottom), on a portrait 4K display ("looks like"
// 720 x 1280 pt). ⌘C copies the ad, the copy docks in the keystroke pill, ⌘V lands it in Figma as real layers,
// then four quick edits prove it: text, colour, layers, layout.

// ------------------------------------------------------------------ layout (desktop points)
export const SAF: Rect = {x: 12, y: 32, w: 696, h: 470};
const POST = {x: 232, y: 6, w: 296};
const PS = POST.w / FEED_POST.w;
/** the ad on screen, in Safari */
export const SRC: Rect = {x: SAF.x + POST.x, y: SAF.y + SAFARI_BAR + POST.y + FEED_POST.head * PS, w: POST.w, h: POST.w * 1.25};
export const FW: Rect = {x: 12, y: 512, w: 696, h: 756};
const CANVAS: Rect = {x: FW.x + FIG.left, y: FW.y + FIG.tabs, w: FW.w - FIG.left - FIG.right, h: FW.h - FIG.tabs};
const Z0 = 0.3; // Figma zoom: design px -> pt
/** where the paste lands, in Figma */
export const DST: Rect = {x: CANVAS.x + CANVAS.w / 2 - (AD.w * Z0) / 2, y: CANVAS.y + 44, w: AD.w * Z0, h: AD.h * Z0};
const SEAM = (SAF.y + SAF.h + FW.y) / 2;
const STORY_H = 1920;

// ------------------------------------------------------------------ camera (a smooth screen-recording zoom)
type Cam = {cx: number; cy: number; s: number};
const clampCam = (c: Cam): Cam => {
	const hw = 540 / c.s,
		hh = 960 / c.s;
	return {s: c.s, cx: Math.min(DESK.w - hw, Math.max(hw, c.cx)), cy: Math.min(DESK.h - hh, Math.max(hh, c.cy))};
};
const CAM_AD: Cam = {cx: SRC.x + SRC.w / 2, cy: SRC.y + SRC.h / 2, s: 2.8};
const CAM_ALL: Cam = {cx: DESK.w / 2, cy: DESK.h / 2, s: 1.5};
const CAM_FIG: Cam = {cx: DST.x + DST.w / 2, cy: 863, s: 2.3};
const CAM_FILL: Cam = {cx: 418, cy: 800, s: 2.0};
const KEYS: [number, Cam][] = [
	[0, {...CAM_AD, s: 2.45}],
	[T.lift, {...CAM_AD, s: 2.9}],
	[T.lift + 0.62, CAM_ALL],
	[T.land + 0.42, CAM_ALL],
	[T.land + 1.0, CAM_FIG],
	[T.recolorSel - 0.15, CAM_FIG],
	[T.recolorSel + 0.38, CAM_FILL],
	[T.recolor + 0.3, CAM_FILL],
	[T.canSel - 0.06, CAM_FIG],
	[T.DUR, CAM_FIG],
].map(([t, c]) => [t as number, clampCam(c as Cam)]);
export const camAt = (t: number): Cam => {
	if (t <= KEYS[0][0]) return KEYS[0][1];
	for (let i = 0; i < KEYS.length - 1; i++) {
		const [ta, a] = KEYS[i],
			[tb, b] = KEYS[i + 1];
		if (t >= ta && t <= tb) {
			const u = easeInOut(clamp01((t - ta) / (tb - ta)));
			return clampCam({cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), s: lerp(a.s, b.s, u)});
		}
	}
	return KEYS[KEYS.length - 1][1];
};
const toScreen = (c: Cam, r: Rect): Rect => ({x: 540 + (r.x - c.cx) * c.s, y: 960 + (r.y - c.cy) * c.s, w: r.w * c.s, h: r.h * c.s});

// ------------------------------------------------------------------ the design's layers (design px, feed size)
const LY = adLayout();
const headBox = (text: string, ly = LY): Rect => {
	const w = ly.headSize * 0.365 * text.length;
	return {x: AD.w / 2 - w / 2 - 6, y: ly.headTop - 2, w: w + 12, h: ly.headSize * 0.86};
};
const SWEEP: Rect[] = [
	{x: 58, y: LY.topM, w: 132, h: 58}, // logo
	{x: AD.w - 64 - 304, y: LY.topM + 6, w: 308, h: 40}, // flavor tag
	headBox('Drink slow.'),
	LY.can,
	{x: 58, y: AD.h - LY.botM - 78, w: 404, h: 80}, // subhead
	{x: AD.w - 64 - 338, y: AD.h - LY.botM - 78, w: 340, h: 80}, // button
];
const ad2pt = (x: number, y: number): [number, number] => [DST.x + x * Z0, DST.y + y * Z0];
const adRect = (r: Rect): Rect => ({x: DST.x + r.x * Z0, y: DST.y + r.y * Z0, w: r.w * Z0, h: r.h * Z0});

// ------------------------------------------------------------------ cursor
type CK = [number, number, number, CursorKind?];
const HEAD = ad2pt(560, LY.headTop + LY.headSize * 0.42);
const CANP = ad2pt(LY.can.x + LY.can.w * 0.56, LY.can.y + LY.can.h * 0.52);
const FRAME_LABEL: [number, number] = [DST.x + 34, DST.y - 9];
const FILL: [number, number] = [FW.x + FW.w - FIG.right + 12 + 64, FW.y + FIG.tabs + 275];
const ROT = -11; // degrees the can is turned
const CAN_C = ad2pt(LY.can.x + LY.can.w / 2, LY.can.y + LY.can.h / 2);
const CORNER = ad2pt(LY.can.x + LY.can.w + 14, LY.can.y - 14);
const R_ARM = Math.hypot(CORNER[0] - CAN_C[0], CORNER[1] - CAN_C[1]);
const A0 = Math.atan2(CORNER[1] - CAN_C[1], CORNER[0] - CAN_C[0]);
const rotAt = (t: number) => (t < T.moveCan ? 0 : ROT * easeInOut(clamp01((t - T.moveCan) / (T.moveEnd - T.moveCan))));
const armAt = (deg: number): [number, number] => [CAN_C[0] + R_ARM * Math.cos(A0 + (deg * Math.PI) / 180), CAN_C[1] + R_ARM * Math.sin(A0 + (deg * Math.PI) / 180)];
const ARM_END = armAt(ROT);
const EDGE_X = DST.x + DST.w * 0.8;
const CURSOR: CK[] = [
	[0, SRC.x + SRC.w * 0.9, SRC.y + SRC.h * 0.92],
	[0.44, SRC.x + SRC.w * 0.66, SRC.y + SRC.h * 0.47],
	[T.lift, SRC.x + SRC.w * 0.68, SRC.y + SRC.h * 0.49],
	[T.focusFig - 0.03, CANVAS.x + CANVAS.w * 0.86, CANVAS.y + 575],
	[T.land + 0.12, CANVAS.x + CANVAS.w * 0.86, CANVAS.y + 575],
	[T.selHead - 0.02, HEAD[0], HEAD[1]],
	[T.dbl1 - 0.12, HEAD[0], HEAD[1]],
	[T.typeA + 0.22, HEAD[0], HEAD[1], 'ibeam'],
	[T.typeA + 1.12, HEAD[0] + 3, HEAD[1] + 2, 'ibeam'],
	[T.recolorSel - 0.02, FRAME_LABEL[0], FRAME_LABEL[1]],
	[T.fillClick - 0.03, FILL[0], FILL[1]],
	[T.recolor + 0.22, FILL[0] + 3, FILL[1] + 2],
	[T.canSel - 0.02, CANP[0], CANP[1]],
	[T.canSel + 0.06, CANP[0], CANP[1]],
	[T.moveCan - 0.02, CORNER[0], CORNER[1], 'rotate'],
	[T.moveCan, CORNER[0], CORNER[1], 'rotate'],
	[T.moveEnd, ARM_END[0], ARM_END[1], 'rotate'],
	[T.moveEnd + 0.25, ARM_END[0] + 3, ARM_END[1] + 2, 'rotate'],
	[T.resizeSel - 0.03, EDGE_X, DST.y + DST.h, 'ns'],
	[T.resizeSel + 0.03, EDGE_X, DST.y + DST.h, 'ns'],
	[T.resize, EDGE_X, DST.y + STORY_H * Z0, 'ns'],
	[T.resize + 0.45, EDGE_X + 6, DST.y + STORY_H * Z0 + 9, 'ns'],
	[60, EDGE_X + 6, DST.y + STORY_H * Z0 + 9, 'ns'],
];
const cursorAt = (t: number) => {
	// the rotation drag follows an arc around the can
	if (t >= T.moveCan && t < T.moveEnd) {
		const [x, y] = armAt(rotAt(t));
		return {x, y, kind: 'rotate' as CursorKind};
	}
	let i = 0;
	while (i < CURSOR.length - 2 && t > CURSOR[i + 1][0]) i++;
	const a = CURSOR[i],
		b = CURSOR[i + 1];
	const u = easeMac(clamp01((t - a[0]) / (b[0] - a[0])));
	// a small arc, like a hand moving a mouse
	const dx = b[1] - a[1],
		dy = b[2] - a[2];
	const L = Math.hypot(dx, dy) || 1;
	const bow = Math.sin(u * Math.PI) * Math.min(14, L * 0.05);
	return {x: lerp(a[1], b[1], u) + (-dy / L) * bow, y: lerp(a[2], b[2], u) + (dx / L) * bow, kind: ((u < 0.5 ? a[3] : b[3]) ?? 'arrow') as CursorKind};
};
const PRESS: [number, number][] = [
	[T.focusFig, T.focusFig + 0.08],
	[T.selHead, T.selHead + 0.08],
	[T.dbl1, T.dbl1 + 0.06],
	[T.dbl2, T.dbl2 + 0.06],
	[T.recolorSel, T.recolorSel + 0.08],
	[T.fillClick, T.fillClick + 0.08],
	[T.canSel, T.canSel + 0.08],
	[T.moveCan, T.moveEnd + 0.02],
	[T.resizeSel, T.resize + 0.02],
];
const pressAt = (t: number) => (PRESS.some(([a, b]) => t >= a && t < b) ? 1 : 0);

// ------------------------------------------------------------------ edits
const OLD_HEAD = 'Drink slow.';
const NEW_HEAD = 'Sip slower.';
const typedAt = (t: number) => {
	const t0 = T.typeA + 0.16;
	if (t < t0) return null;
	return NEW_HEAD.slice(0, Math.min(NEW_HEAD.length, Math.floor((t - t0) / 0.085) + 1));
};
const NEW_HEX = 'D8F24A';
const hexAt = (t: number) => {
	const t0 = T.fillClick + 0.07;
	if (t < t0) return null;
	return NEW_HEX.slice(0, Math.min(6, Math.floor((t - t0) / 0.024) + 1));
};
const mix = (a: string, b: string, u: number) => {
	const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)),
		pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
	return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], u)).toString(16).padStart(2, '0')).join('');
};

// ------------------------------------------------------------------ the keystroke pill (doubles as captions)
const PILL_H = 104;
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

export const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const cam = camAt(t);
	const cur = cursorAt(t);
	const focusFigma = t >= T.focusFig;

	// ---- the grab in Safari
	const grabShow = step(t, T.hover - 0.16, 0.16) * (1 - step(t, T.lift + 0.08, 0.25));
	const fill = step(t, T.copy, 0.26, easeInOut);
	const flash = step(t, T.copy + 0.2, 0.05) * (1 - step(t, T.copy + 0.27, 0.3));

	// ---- keystroke pill
	const d1 = step(t, T.copy + 0.1, 0.24);
	const sw = step(t, T.lift + 0.12, 0.3);
	const d2 = step(t, T.land, 0.24);
	const keyDown = (t >= T.copy && t < T.copy + 0.15) || (t >= T.paste && t < T.paste + 0.15) ? 1 : 0;
	const dock = range(t, [T.lift + 0.24, T.lift + 0.46], [0, 1], easeOut) * (1 - range(t, [T.paste, T.paste + 0.14], [0, 1], easeOut));
	const contentW = lerp(lerp(tw('Copy the ad'), doneW('Copied as a design', '8 layers'), d1), lerp(tw('Paste in Figma'), doneW('Pasted as Figma layers'), d2), sw);
	const padL = lerp(22, 14, dock);
	const dockW = (62 + 14) * dock;
	const pillW = padL + dockW + KEYS_W + 24 + contentW + 36;
	const pillX = 540 - pillW / 2;
	const seamY = 960 + (SEAM - cam.cy) * cam.s;
	const pillY = Math.min(1500, seamY + 8);
	const pillOut = step(t, T.selHead - 0.18, 0.3);
	const slot: Rect = {x: pillX + padL, y: pillY + (PILL_H - 77.5) / 2, w: 62, h: 77.5};

	// ---- the copy itself: lifts off the page, docks in the pill, lands in Figma
	const srcS = toScreen(cam, SRC);
	const dstS = toScreen(cam, DST);
	const liftP = step(t, T.copy + 0.22, 0.25);
	let ghost: Rect | null = null;
	let ghostK = 0; // 0 = on the page, 1 = a card in flight / in the pill
	if (t >= T.copy + 0.22 && t < T.land) {
		if (t < T.lift) {
			const k = 0.035 * liftP;
			ghost = {x: srcS.x - (srcS.w * k) / 2, y: srcS.y - (srcS.h * k) / 2 - 10 * liftP, w: srcS.w * (1 + k), h: srcS.h * (1 + k)};
			ghostK = liftP;
		} else if (t < T.paste) {
			ghost = lerpRect(srcS, slot, easeInOut(clamp01((t - T.lift) / 0.46)));
			ghostK = 1;
		} else {
			const u = easeOut(clamp01((t - T.paste) / (T.land - T.paste)));
			ghost = lerpRect(slot, dstS, u);
			ghostK = 1 - u;
		}
	}

	// ---- the pasted design
	const landed = t >= T.land;
	const typed = typedAt(t);
	const headline = typed === null ? OLD_HEAD : typed;
	const selAll = t >= T.typeA + 0.06 && typed === null ? 1 : 0;
	const editing = t >= T.dbl2 && t < T.recolorSel;
	const typing = typed !== null && typed.length < NEW_HEAD.length;
	const caret = editing ? (typing || Math.floor((t - T.dbl2) / 0.5) % 2 === 0 ? 1 : 0) : -1;
	const rc = step(t, T.recolor, 0.16, easeOut);
	const bg = mix('#ECE6DA', '#D8F24A', rc);
	const ink = '#2340FF';
	const canRot = rotAt(t);
	const adH = t < T.resizeSel ? AD.h : t < T.resize ? AD.h + Math.max(0, cursorAt(t).y - (DST.y + DST.h)) / Z0 : STORY_H;
	const ly = adLayout(AD.w, adH);

	// ---- Figma state
	type Sel = 'none' | 'frame' | 'head' | 'can';
	const sel: Sel = t < T.land ? 'none' : t < T.selHead ? 'frame' : t < T.recolorSel ? 'head' : t < T.canSel ? 'frame' : t < T.resizeSel ? 'can' : 'frame';
	const selIdx = {none: -1, frame: 0, can: 5, head: 6}[sel];
	const hb = headBox(typed === null || typed.length === 0 ? OLD_HEAD : typed, ly);
	const headR = adRect(hb);
	const canR = adRect(ly.can);
	const panel: FigPanel =
		sel === 'head'
			? {kind: 'text', font: 'Archivo', style: 'Black Condensed', size: 236, fill: ink}
			: sel === 'can'
				? {kind: 'image', w: Math.round(ly.can.w), h: Math.round(ly.can.h), rot: canRot}
				: sel === 'frame'
					? {kind: 'frame', w: 1080, h: Math.round(adH), fill: bg}
					: {kind: 'none'};
	const hex = hexAt(t);
	const fillEditing = t >= T.fillClick && t < T.recolor;
	const hiFill = t >= T.fillClick && t < T.recolor + 0.35 ? 1 - step(t, T.recolor + 0.05, 0.3) : 0;
	const layers: FigLayer[] = [
		['Feed ad — LULL', 'frame', 0],
		['Button', 'group', 1],
		['Subhead', 'text', 1],
		['Flavor tag', 'text', 1],
		['Logo', 'text', 1],
		['Can — yuzu & salt', 'image', 1],
		['Headline', 'text', 1],
		['Background', 'rect', 1],
	].map(([name, kind, depth], i) => ({name: name as string, kind: kind as FigLayer['kind'], depth: depth as number, show: step(t, T.land + 0.03 + i * 0.045, 0.22)}));

	// ---- captions for the edits
	const caps: [number, number, string][] = [
		[T.typeA + 0.3, T.recolor - 0.12, 'Real text.'],
		[T.recolor + 0.02, T.canSel + 0.05, 'Real colors.'],
		[T.canSel + 0.14, T.resize - 0.08, 'Real layers.'],
		[T.resize, 99, 'Real layout.'],
	];

	return (
		<AbsoluteFill style={{background: '#000'}}>
			{/* ------------------------------------------------ the desktop, through the camera */}
			<div style={{position: 'absolute', left: 0, top: 0, width: DESK.w, height: DESK.h, transformOrigin: '0 0', transform: `translate(${540 - cam.cx * cam.s}px, ${960 - cam.cy * cam.s}px) scale(${cam.s})`}}>
				<Wallpaper />
				<MenuBar
					app={focusFigma ? 'Figma' : 'Safari'}
					menus={focusFigma ? ['File', 'Edit', 'View', 'Object', 'Text', 'Arrange'] : ['File', 'Edit', 'View', 'History', 'Bookmarks', 'Window']}
					pr={t >= T.hover && t < T.lift + 0.1 ? 1 : 0}
				/>
				{/* Safari */}
				<Win x={SAF.x} y={SAF.y} w={SAF.w} h={SAF.h} front={!focusFigma} z={focusFigma ? 1 : 2}>
					<SafariChrome w={SAF.w} url="feed.social/lull.water" front={!focusFigma} />
					<FeedPage w={SAF.w} h={SAF.h} postX={POST.x} postY={POST.y}>
						<div style={{transform: `scale(${PS})`, transformOrigin: '0 0'}}>
							<FeedPost
								media={
									<div style={{transform: `scale(${FEED_POST.w / AD.w})`, transformOrigin: '0 0'}}>
										<LullAd />
									</div>
								}
							/>
						</div>
					</FeedPage>
					<div style={{position: 'absolute', left: SRC.x - SAF.x, top: SRC.y - SAF.y, zIndex: 30}}>
						<Grab w={SRC.w} h={SRC.h} show={grabShow} march={t * 1.6} fill={fill} flash={flash} tag="Design · 8 layers" tagIn radius={2} scale={0.5} />
					</div>
				</Win>
				{/* Figma */}
				<Win x={FW.x} y={FW.y} w={FW.w} h={FW.h} front={focusFigma} z={focusFigma ? 2 : 1} bg="#F5F5F5">
					<FigmaTabs w={FW.w} file="LULL — Q4 social" front={focusFigma} />
					<FigmaLeft h={FW.h} file="LULL — Q4 social" layers={layers} selected={selIdx} />
					<FigmaRight
						x={FW.w - FIG.right}
						h={FW.h}
						panel={panel}
						zoom={Z0}
						hiFill={hiFill}
						fillText={fillEditing ? (hex === null ? 'ECE6DA' : hex) : undefined}
						fillSel={fillEditing && hex === null ? 1 : 0}
						fillCaret={fillEditing && hex !== null}
					/>
					<FigmaToolbar cx={FIG.left + CANVAS.w / 2} bottom={12} tool={0} />
					{landed ? (
						<div style={{position: 'absolute', left: DST.x - FW.x, top: DST.y - FW.y - 14, fontFamily: SYS, fontSize: 9.5, color: sel === 'frame' ? '#0D99FF' : '#7A7A7A', whiteSpace: 'nowrap'}}>Feed ad — LULL</div>
					) : null}
					{landed ? (
						<div style={{position: 'absolute', left: DST.x - FW.x, top: DST.y - FW.y, width: DST.w, height: adH * Z0, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.12)'}}>
							<div style={{transform: `scale(${Z0})`, transformOrigin: '0 0'}}>
								<LullAd h={adH} headline={headline} caret={caret} selectAll={selAll} bg={bg} ink={ink} canRot={canRot} />
							</div>
						</div>
					) : null}
					{/* every element lights up as its own layer as it lands */}
					{SWEEP.map((r, i) => {
						const a = T.land + 0.05 + i * 0.055;
						const o = step(t, a, 0.06) * (1 - step(t, a + 0.3, 0.22));
						if (o <= 0) return null;
						const rr = adRect(r);
						return <FigSelect key={i} x={rr.x - FW.x} y={rr.y - FW.y} w={rr.w} h={rr.h} show={o} handles={false} hover />;
					})}
					{sel === 'frame' ? <FigSelect x={DST.x - FW.x} y={DST.y - FW.y} w={DST.w} h={adH * Z0} tag={`1080 × ${Math.round(adH)}`} /> : null}
					{sel === 'head' ? <FigSelect x={headR.x - FW.x} y={headR.y - FW.y} w={headR.w} h={headR.h} handles={t < T.dbl2} /> : null}
					{sel === 'can' ? <FigSelect x={canR.x - FW.x} y={canR.y - FW.y} w={canR.w} h={canR.h} rot={canRot} tag={`${Math.round(ly.can.w)} × ${Math.round(ly.can.h)}`} /> : null}
					{t >= T.moveCan && t < T.moveEnd + 0.3 ? (
						<div style={{position: 'absolute', left: cur.x - FW.x + 12, top: cur.y - FW.y - 26, height: 17, padding: '0 6px', borderRadius: 4, background: '#1E1E1E', color: '#fff', fontFamily: SYS, fontSize: 10, fontWeight: 500, display: 'flex', alignItems: 'center', opacity: 1 - step(t, T.moveEnd + 0.12, 0.15), zIndex: 30}}>
							{Math.round(canRot)}°
						</div>
					) : null}
				</Win>
				<Cursor x={cur.x} y={cur.y} kind={cur.kind} press={pressAt(t)} size={1} angle={90 + canRot} />
			</div>

			{/* ------------------------------------------------ keystroke pill */}
			<div
				style={{
					position: 'absolute',
					left: pillX,
					top: pillY,
					width: pillW,
					height: PILL_H,
					borderRadius: PILL_H / 2,
					background: 'rgba(20,20,24,0.9)',
					boxShadow: '0 22px 54px rgba(0,0,0,0.34), inset 0 0 0 1px rgba(255,255,255,0.08)',
					opacity: 1 - pillOut,
					transform: `translateY(${-24 * pillOut}px)`,
					fontFamily: BRAND,
					whiteSpace: 'nowrap',
					zIndex: 70,
				}}
			>
				<div style={{position: 'absolute', left: padL + dockW, top: (PILL_H - 69) / 2, display: 'flex', gap: 10}}>
					<Keycap size={64} down={keyDown} label={<CmdGlyph size={28} />} />
					<Keycap
						size={64}
						down={keyDown}
						label={
							<div style={{position: 'relative', width: 30, height: 34, fontFamily: SYS, fontWeight: 500, fontSize: 29}}>
								<span style={{position: 'absolute', inset: 0, textAlign: 'center', opacity: 1 - sw}}>C</span>
								<span style={{position: 'absolute', inset: 0, textAlign: 'center', opacity: sw}}>V</span>
							</div>
						}
					/>
				</div>
				{(
					[
						[<div style={{fontSize: TXT, fontWeight: 600, letterSpacing: '-0.03em', color: '#fff'}}>Copy the ad</div>, (1 - d1) * (1 - sw), -14 * d1],
						[<DoneText s="Copied as a design" detail="8 layers" id="pc" />, d1 * (1 - sw), 14 * (1 - d1) - 14 * sw],
						[<div style={{fontSize: TXT, fontWeight: 600, letterSpacing: '-0.03em', color: '#fff'}}>Paste in Figma</div>, sw * (1 - d2), 14 * (1 - sw) - 14 * d2],
						[<DoneText s="Pasted as Figma layers" id="pv" />, sw * d2, 14 * (1 - d2)],
					] as [React.ReactNode, number, number][]
				).map(([node, o, dy], i) =>
					o > 0.001 ? (
						<div key={i} style={{position: 'absolute', left: padL + dockW + KEYS_W + 24, top: 0, height: PILL_H, display: 'flex', alignItems: 'center', opacity: o, transform: `translateY(${dy}px)`}}>
							{node}
						</div>
					) : null,
				)}
			</div>

			{/* ------------------------------------------------ the copy in flight */}
			{ghost ? (
				<div
					style={{
						position: 'absolute',
						left: ghost.x,
						top: ghost.y,
						width: ghost.w,
						height: ghost.h,
						borderRadius: lerp(2, 7, ghostK),
						overflow: 'hidden',
						boxShadow: `0 ${lerp(26, 8, ghostK)}px ${lerp(60, 20, ghostK)}px rgba(0,0,0,${0.32 * Math.min(1, liftP)}), 0 0 0 ${2.5 * ghostK}px rgba(255,255,255,0.95)`,
						zIndex: 80,
					}}
				>
					<div style={{transform: `scale(${ghost.w / AD.w})`, transformOrigin: '0 0'}}>
						<LullAd />
					</div>
				</div>
			) : null}

			{/* ------------------------------------------------ the opening line, before anything is pasted */}
			{(() => {
				const p = 1 - step(t, T.lift - 0.1, 0.16);
				if (p <= 0) return null;
				return (
					<div style={{position: 'absolute', left: 0, right: 0, top: 186, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * -14}px)`, zIndex: 90}}>
						<div style={{display: 'flex', alignItems: 'center', height: 100, padding: '0 40px', borderRadius: 50, background: 'rgba(20,20,24,0.95)', boxShadow: '0 22px 54px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.08)'}}>
							<div style={{fontFamily: BRAND, fontWeight: 600, fontSize: 54, letterSpacing: '-0.035em', color: '#fff'}}>This ad is just pixels.</div>
						</div>
					</div>
				);
			})()}

			{/* ------------------------------------------------ "Real text." … */}
			{caps.map(([a, b, txt]) => {
				const p = step(t, a, 0.2) * (1 - step(t, b, 0.14));
				if (p <= 0) return null;
				return (
					<div key={txt} style={{position: 'absolute', left: 0, right: 0, top: 186, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 14}px)`, zIndex: 90}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 18, height: 100, padding: '0 40px 0 30px', borderRadius: 50, background: 'rgba(20,20,24,0.95)', boxShadow: '0 22px 54px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.08)'}}>
							<Mark size={46} ink="#fff" id={`cap${txt.length}${txt[5]}`} />
							<div style={{fontFamily: BRAND, fontWeight: 600, fontSize: 54, letterSpacing: '-0.035em', color: '#fff'}}>{txt}</div>
						</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

export const HOOK_DUR = at(4);
