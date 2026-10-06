import React from 'react';
import {AbsoluteFill, Freeze, interpolate, useCurrentFrame} from 'remotion';
import {Cursor, MenuBar, Wallpaper} from './Mac';
import {Caption, EndCard, Keycap, StatusPill, TabPill} from './Overlays';
import {
	A4_CURSOR,
	activeCell,
	cellCenter,
	colX,
	cursorAt,
	doneAt,
	filesScroll,
	filmTime,
	L16,
	L45,
	L916,
	Layout,
	OP,
	OPEN,
	rowY,
	SH,
	sheetScroll,
	selOf,
	SHIFT,
	T,
	thumbRect,
	TOTAL,
} from './timeline';
import {FilesWindow, PreviewWindow, SheetWindow} from './Windows';
import {clamp01, easeInOut, FPS, lerp, step, useFontsReady} from './tokens';
import {SoundTrack} from './Sound';

export {TOTAL};

export type Fmt = {
	id: '16x9' | '4x5' | '9x16';
	W: number;
	H: number;
	Lo: Layout;
	cap: {size: number; bottom: number};
	key: {scale: number; bottom: number};
	end: number;
	status?: number; // desktop y of the status pill
	endStack?: boolean;
	endFoot?: number;
};
export const F16: Fmt = {id: '16x9', W: 1920, H: 1080, Lo: L16, cap: {size: 44, bottom: 60}, key: {scale: 1.3, bottom: 64}, end: 1};
export const F45: Fmt = {id: '4x5', W: 1080, H: 1350, Lo: L45, cap: {size: 46, bottom: 84}, key: {scale: 1.05, bottom: 120}, end: 0.78};
// vertical: captions, the key and the end card's last line sit above the bottom ~15% that X's player covers
export const F916: Fmt = {id: '9x16', W: 1080, H: 1920, Lo: L916, cap: {size: 54, bottom: 330}, key: {scale: 1.3, bottom: 380}, end: 0.9, status: 92, endStack: true, endFoot: 380};

// ------------------------------------------------------------------ cameras: zoom s around desktop point (x, y)
type Cam = {s: number; x: number; y: number};
type Key = Cam & {t: number};

/** frame a desktop rect (with a margin) */
const fit = (f: Fmt, x0: number, y0: number, x1: number, y1: number, m = 1): Cam => {
	const s = Math.min(f.W / (x1 - x0), f.H / (y1 - y0)) * m;
	return {s, x: (x0 + x1) / 2, y: (y0 + y1) / 2};
};
const clampCam = (f: Fmt, c: Cam): Cam => {
	const hw = f.W / 2 / c.s;
	const hh = f.H / 2 / c.s;
	const {w, h} = f.Lo.desk;
	return {s: c.s, x: hw * 2 >= w ? w / 2 : Math.max(hw, Math.min(w - hw, c.x)), y: hh * 2 >= h ? h / 2 : Math.max(hh, Math.min(h - hh, c.y))};
};

/** smoothed cursor position: follows the hand like a screen-recording zoom, but lags and never jitters */
const follow = (Lo: Layout, t: number, win = 0.5) => {
	let sx = 0;
	let sy = 0;
	let n = 0;
	for (let k = -8; k <= 8; k++) {
		const tt = t + (k / 8) * win;
		const w = Math.cos((k / 8) * (Math.PI / 2)) ** 2;
		const c = cursorAt(Lo, tt);
		sx += c.x * w;
		sy += c.y * w;
		n += w;
	}
	return {x: sx / n, y: sy / n};
};

const camKeys = (f: Fmt): {keys: Key[]; manual: Cam; pill: Cam; checks: Cam; flash: Cam; wide: Cam} => {
	const Lo = f.Lo;
	const {w: DW, h: DH} = Lo.desk;
	const wide: Cam = f.id === '16x9' ? {s: 1, x: DW / 2, y: DH / 2} : {s: f.W / DW, x: DW / 2, y: DH / 2};
	const a4 = cellCenter(Lo, 4, 0);
	const vert = f.id === '9x16';
	const pill =
		f.id === '16x9'
			? fit(f, colX(Lo, -1) - 30, rowY(Lo, 1) - 46, colX(Lo, 4) + 30, rowY(Lo, 8) + 10, 0.97)
			: fit(f, colX(Lo, -1) - 10, rowY(Lo, 1) - 40, colX(Lo, vert ? 3 : 2) + 10, rowY(Lo, 9), 1);
	const slot = Math.floor(Lo.visRows * (Lo.slot ?? 0.8));
	const ycur = rowY(Lo, slot + 1);
	let checks: Cam;
	if (vert) {
		// row numbers to the end of the two-line chip; the row being written sits at ~68% height, the caption under it
		const cv = fit(f, colX(Lo, -1) + 4, 0, colX(Lo, 4) + 188, 1, 1);
		checks = {s: cv.s, x: cv.x, y: ycur + SH.row / 2 - (f.H * 0.68 - f.H / 2) / cv.s};
	} else {
		const cw = fit(f, colX(Lo, -1) - 20, ycur - 10.5 * SH.row, colX(Lo, 4) + 390, ycur + 2.2 * SH.row, 1);
		// keep the row being written near the bottom of the frame (above the caption), checked rows above it
		checks = {s: cw.s, x: cw.x, y: rowY(Lo, slot) + SH.row * 3.6 - f.H / 2 / cw.s};
	}
	// vertical: the preview (top) and columns A-D (below it) in one frame
	const manual: Cam = f.id === '16x9' ? {s: 1.38, x: 950, y: 520} : vert ? {s: 1.216, x: 510, y: 899} : {s: 1.13, x: 560, y: 600};
	void a4;
	const keys: Key[] = [
		{t: T.cut, ...wide},
		{t: 2.75, s: wide.s * 1.035, x: wide.x, y: wide.y},
		{t: T.prevOpen + 0.45, ...manual},
		{t: T.toA4, ...manual},
		{t: T.pill + 0.75, s: pill.s * 0.96, x: pill.x, y: pill.y},
		{t: T.press, s: pill.s * 1.03, x: pill.x, y: pill.y + 6},
		{t: T.cascade + 0.95, ...wide},
		vert ? {t: 14.55, s: wide.s * 1.1, x: wide.x, y: wide.y - 70} : {t: 14.55, s: wide.s * 1.05, x: wide.x + (f.id === '16x9' ? 140 : 0), y: wide.y + 10},
		{t: 15.3, ...checks},
		{t: 17.45, s: checks.s * 1.03, x: checks.x, y: checks.y},
		{t: 18.3, ...wide},
		vert ? {t: T.end, s: wide.s * 1.05, x: wide.x, y: wide.y + 30} : {t: T.end, s: wide.s * 1.07, x: wide.x + (f.id === '16x9' ? 60 : 0), y: wide.y - 20},
	];
	return {keys, manual, pill, checks, flash: {s: pill.s * 1.04, x: pill.x, y: pill.y + 4}, wide};
};
const KEYS_CACHE = new Map<string, ReturnType<typeof camKeys>>();
const keysFor = (f: Fmt) => {
	if (!KEYS_CACHE.has(f.id)) KEYS_CACHE.set(f.id, camKeys(f));
	return KEYS_CACHE.get(f.id)!;
};

/** cold open: on the pill and the key, a small punch on the press, then pull back to the whole desktop as the rows pour in */
const openCam = (K: ReturnType<typeof camKeys>, t: number): Cam => {
	const a = K.flash;
	const punch = 1 + 0.022 * clamp01(1 - Math.abs(t - 0.2) / 0.16);
	const sa = a.s * (1 + 0.05 * Math.min(t, 0.3)) * punch;
	if (t <= 0.3) return {s: sa, x: a.x, y: a.y};
	const u = easeInOut(clamp01((t - 0.3) / (1.45 - 0.3)));
	const w = K.wide;
	const sw = w.s * (1 + 0.045 * easeInOut(clamp01((t - 1.45) / (OPEN - 1.45))));
	return {s: Math.exp(lerp(Math.log(a.s * 1.015), Math.log(sw), u)), x: lerp(a.x, w.x, u), y: lerp(a.y, w.y, u)};
};

/** camera at film time tf */
export const camAt = (f: Fmt, tf: number): Cam => {
	const K = keysFor(f);
	if (tf < OPEN) return clampCam(f, openCam(K, tf));
	const t = tf - SHIFT;
	const keys = K.keys;
	const ts = keys.map((k) => k.t);
	const g = (fld: 's' | 'x' | 'y') => interpolate(t, ts, keys.map((k) => k[fld]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut});
	let s = g('s');
	let x = g('x');
	let y = g('y');
	// while the person copies by hand, the camera follows their cursor (Screen Studio style)
	const m = K.manual;
	const inManual = clamp01((t - (T.prevOpen - 0.1)) / 0.55) * (1 - clamp01((t - T.toA4) / 0.6));
	if (inManual > 0) {
		const c = follow(f.Lo, t, 0.9);
		const fx = m.x + (c.x - m.x) * 0.06;
		const fy = m.y + (c.y - m.y) * (f.id === '16x9' ? 0 : 0.05);
		const e = easeInOut(inManual);
		x = x * (1 - e) + fx * e;
		y = y * (1 - e) + fy * e;
	}
	return clampCam(f, {s, x, y});
};

/** screen px the picture moves between this frame and the previous one (camera + scrolling content) */
const motion = (f: Fmt, frame: number) => {
	const tf = frame / FPS;
	const a = camAt(f, tf);
	const b = camAt(f, (frame - 1) / FPS);
	let mx = 0;
	for (const [sx, sy] of [[f.W / 2, f.H / 2], [f.W * 0.1, f.H * 0.1], [f.W * 0.9, f.H * 0.1], [f.W * 0.1, f.H * 0.9], [f.W * 0.9, f.H * 0.9]]) {
		const dx = (sx - f.W / 2) / a.s + a.x;
		const dy = (sy - f.H / 2) / a.s + a.y;
		const bx = (dx - b.x) * b.s + f.W / 2;
		const by = (dy - b.y) * b.s + f.H / 2;
		mx = Math.max(mx, Math.hypot(bx - sx, by - sy));
	}
	const A = filmTime(tf);
	const B = filmTime((frame - 1) / FPS);
	if (A.open || A.t > T.cut) {
		const scr = Math.abs(sheetScroll(f.Lo, A.st) - sheetScroll(f.Lo, B.st)) * a.s;
		const fsc = Math.abs(filesScroll(f.Lo, A.st) - filesScroll(f.Lo, B.st)) * a.s;
		mx = Math.max(mx, scr * 0.8, fsc * 0.8);
	}
	return mx;
};

const MBlur: React.FC<{samples: number; shutter?: number; children: React.ReactNode}> = ({samples, shutter = 0.75, children}) => {
	const fr = useCurrentFrame();
	if (samples <= 1) return <>{children}</>;
	return (
		<AbsoluteFill>
			{new Array(samples).fill(0).map((_, i) => (
				<AbsoluteFill key={i} style={{opacity: 1 / (i + 1)}}>
					<Freeze frame={fr + (i / (samples - 1) - 0.5) * shutter}>{children}</Freeze>
				</AbsoluteFill>
			))}
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ the desktop scene at scene time st
const Scene: React.FC<{f: Fmt}> = ({f}) => {
	const frame = useCurrentFrame();
	const tf = frame / FPS;
	const Lo = f.Lo;
	const {st} = filmTime(tf); // the cold open shows the payoff, time-warped; then the story
	const cam = camAt(f, tf);
	const fsc = filesScroll(Lo, st);
	const ssc = sheetScroll(Lo, st);
	const cur = cursorAt(Lo, st);
	const cascading = st >= T.cascade;
	const open = step(st, T.prevOpen, 0.36) * (1 - step(st, T.prevClose, 0.32, easeInOut));
	const curPage = st >= T.next ? 1 : 0;
	const from = thumbRect(Lo, curPage, fsc);
	const sheetFront = st >= T.row1 + T.per1 * 0.9;
	const inPreview = cur.x < Lo.sheet.x - 10 && open > 0.5;
	const app = st < T.prevOpen ? 'Files' : cascading ? 'Sheets' : inPreview ? 'Preview' : sheetFront ? 'Sheets' : 'Preview';
	const menus = app === 'Sheets' ? ['File', 'Edit', 'View', 'Insert', 'Format', 'Data', 'Window', 'Help'] : app === 'Preview' ? ['File', 'Edit', 'View', 'Go', 'Tools', 'Window', 'Help'] : ['File', 'Edit', 'View', 'Go', 'Window', 'Help'];
	const pillP = step(st, T.pill, 0.42);
	const pillGo = step(st, T.cascade, 0.22, easeInOut);
	const pillPress = clamp01(1 - Math.abs(st - T.press - 0.05) / 0.14);
	const ghost = step(st, T.pill + 0.15, 0.5) * (st < T.cascade + 0.2 ? 1 : 0);
	const a4c = A4_CURSOR(Lo);
	const n = doneAt(st);
	const statusP = step(st, T.cascade + 0.15, 0.4);
	const doneP = step(st, T.done, 0.55, easeInOut);
	const cursorVis = 1 - step(st, T.cascade, 0.25);
	const vx0 = cam.x - f.W / 2 / cam.s;
	const vx1 = cam.x + f.W / 2 / cam.s;
	const vy0 = cam.y - f.H / 2 / cam.s;
	const showFiles = vx0 < Lo.files.x + Lo.files.w && vy0 < Lo.files.y + Lo.files.h;
	const showSheet = vx1 > Lo.sheet.x && cam.y + f.H / 2 / cam.s > Lo.sheet.y;
	return (
		<AbsoluteFill style={{transform: `translate(${f.W / 2 - cam.x * cam.s}px, ${f.H / 2 - cam.y * cam.s}px) scale(${cam.s})`, transformOrigin: '0 0'}}>
			<Wallpaper w={Lo.desk.w} h={Lo.desk.h} />
			{vy0 < 40 ? <MenuBar app={app} menus={menus} w={Lo.desk.w} working={cascading ? statusP * (1 - doneP) : 0} /> : null}
			{showFiles ? <FilesWindow Lo={Lo} t={st} scroll={fsc} selected={st >= T.dbl && st < T.cascade ? curPage : -1} front={!sheetFront && !cascading} /> : null}
			{showSheet ? <SheetWindow Lo={Lo} s={{t: st, scroll: ssc, active: activeCell(Lo, st), ghost, front: sheetFront || cascading}} /> : null}
			<PreviewWindow Lo={Lo} t={st} open={open} from={from} page={st >= T.next ? 1 : 0} flip={step(st, T.next, 0.26)} sel={{0: selOf(Lo, 0, st), 1: selOf(Lo, 1, st)}} />
			<TabPill x={a4c.x + 16} y={a4c.y + 14} p={pillP} press={pillPress} go={pillGo} />
			<StatusPill cx={Lo.desk.w / 2} y={f.status ?? 46} p={statusP} n={n} done={doneP} flagged={2} elapsed={41} />
			{cursorVis > 0.01 ? (
				<div style={{opacity: cursorVis}}>
					<Cursor x={cur.x} y={cur.y} press={cur.press} scale={1.15} />
				</div>
			) : null}
		</AbsoluteFill>
	);
};

export const Film: React.FC<{f: Fmt}> = ({f}) => {
	useFontsReady();
	const frame = useCurrentFrame();
	const tf = frame / FPS;
	const {st, t} = filmTime(tf); // t: story time (negative during the cold open)
	const mv = frame === 0 || Math.abs(tf - OPEN) < 1.5 / FPS ? 0 : motion(f, frame);
	const samples = mv < 4 ? 1 : Math.min(9, Math.max(3, Math.round(mv / 4)));
	const C = f.cap;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<MBlur samples={samples}>
				<Scene f={f} />
			</MBlur>
			<Keycap t={st} a={T.keyIn} press={T.press} scale={f.key.scale} bottom={f.key.bottom} />
			<Caption t={tf} a={OP.cap[0]} b={OP.cap[1]} text="One key. 41 seconds." size={C.size} bottom={C.bottom} />
			<Caption t={t} a={T.cap.invoices[0]} b={T.cap.invoices[1]} text="200 invoices. Every month." size={C.size} bottom={C.bottom} />
			<Caption t={t} a={T.cap.once[0]} b={T.cap.once[1]} text="Once…" size={C.size} bottom={C.bottom} />
			<Caption t={t} a={T.cap.twice[0]} b={T.cap.twice[1]} text="Twice…" size={C.size} bottom={C.bottom} />
			<Caption t={t} a={T.cap.checks[0]} b={T.cap.checks[1]} text="It checks every row." size={C.size} bottom={C.bottom} />
			<Caption
				t={t}
				a={T.cap.hours[0]}
				b={T.cap.hours[1]}
				text={
					<span>
						<span style={{color: 'rgba(245,245,247,0.5)'}}>3 hours</span>
						<span style={{margin: '0 0.35em', color: 'rgba(245,245,247,0.5)'}}>→</span>41 seconds
					</span>
				}
				size={C.size}
				bottom={C.bottom}
			/>
			<EndCard t={t} a={T.end} scale={f.end} stack={f.endStack} footBottom={f.endFoot} />
			<SoundTrack />
		</AbsoluteFill>
	);
};

export const Film16: React.FC = () => <Film f={F16} />;
export const Film45: React.FC = () => <Film f={F45} />;
export const Film916: React.FC = () => <Film f={F916} />;
export const DURATION = Math.round((TOTAL + SHIFT) * FPS);
