// All timing for the Tab to Finish film (seconds). No React or DOM imports here, except the invoice text measuring
// (canvas), so the audio scripts can't import it; they read timeline.json written by the TimelineDump composition.
import {INVOICES} from './data';
import {Field, FIELDS, PAGE_W, textBox} from './Invoice';
import {clamp01, easeInOut, easeOut, easeSoft, fontsReady} from './tokens';

export const TOTAL = 27.0;
export const T = {
	cut: 1.05, // the story starts here (scene time); in the film it starts at OPEN, after the cold open
	scrollUp: [1.2, 2.55] as [number, number],
	dbl: 3.0,
	prevOpen: 3.12,
	row1: 3.62,
	per1: 0.6,
	next: 6.12,
	row2: 6.36,
	per2: 0.44,
	toA4: 8.2,
	clickA4: 8.48,
	pill: 8.82,
	keyIn: 10.55,
	press: 11.1,
	cascade: 11.25,
	prevClose: 8.12, // space bar closes the preview before clicking into A4
	casEnd: 18.55,
	done: 18.7,
	end: 22.7,
	cap: {
		invoices: [1.25, 2.95] as [number, number],
		once: [3.7, 6.0] as [number, number],
		twice: [6.3, 8.15] as [number, number],
		checks: [15.15, 17.75] as [number, number],
		hours: [19.35, 22.45] as [number, number],
	},
};

// ------------------------------------------------------------------ layout (desktop px). One per format.
export type Rect = {x: number; y: number; w: number; h: number};
export type Layout = {
	desk: {w: number; h: number};
	files: Rect;
	sheet: Rect;
	prev: Rect;
	cols: number; // thumbnail grid columns
	sheetCols: number[]; // widths: row header, A, B, C, D, E, F
	visRows: number;
	slot?: number; // where the row being written sits in the sheet window during the cascade (fraction of visRows)
	chipStack?: boolean; // narrow layouts: the "needs a look" chip wraps onto two lines
};
export const L16: Layout = {
	desk: {w: 1920, h: 1080},
	files: {x: 52, y: 104, w: 828, h: 928},
	sheet: {x: 904, y: 104, w: 964, h: 928},
	prev: {x: 262, y: 126, w: 640, h: 852},
	cols: 5,
	sheetCols: [48, 262, 140, 128, 140, 120, 126],
	visRows: 23,
};
export const L45: Layout = {
	desk: {w: 1440, h: 1800},
	files: {x: 40, y: 82, w: 1360, h: 700},
	sheet: {x: 40, y: 808, w: 1360, h: 950},
	prev: {x: 380, y: 64, w: 640, h: 852},
	cols: 9,
	sheetCols: [48, 300, 150, 140, 150, 280, 292],
	visRows: 24,
};
// vertical 9:16: files on top, the sheet below, the preview opening over the files
export const L916: Layout = {
	desk: {w: 1100, h: 1956},
	files: {x: 36, y: 176, w: 1028, h: 680},
	sheet: {x: 36, y: 880, w: 1028, h: 124 + 26 * 33 + 36},
	prev: {x: 300, y: 150, w: 640, h: 852},
	cols: 7,
	sheetCols: [44, 250, 128, 124, 128, 180, 174],
	visRows: 26,
	slot: 0.55,
	chipStack: true,
};

export const SH = {top: 124, row: 33, bottom: 36}; // sheet: header block height, row height, footer
export const FL = {side: 214, top: 70, cellH: 170, thumbW: 82}; // files window grid
export const PV = {bar: 52, pad: 20};
export const PAGE_K = 1; // preview page scale (page is PAGE_W wide)

export const colX = (Lo: Layout, c: number) => Lo.sheet.x + Lo.sheetCols.slice(0, c + 1).reduce((a, b) => a + b, 0); // left edge of column c (0 = A)
/** desktop y of the top of sheet row r (1 = header row) at sheet scroll s */
export const rowY = (Lo: Layout, r: number, scroll = 0) => Lo.sheet.y + SH.top + (r - 1) * SH.row - scroll;
export const cellCenter = (Lo: Layout, r: number, c: number, scroll = 0) => ({x: colX(Lo, c) + 14, y: rowY(Lo, r, scroll) + SH.row / 2});
/** page px -> desktop px inside the preview window */
export const pageToDesk = (Lo: Layout, x: number, y: number) => ({x: Lo.prev.x + PV.pad + x * PAGE_K, y: Lo.prev.y + PV.bar + y * PAGE_K});
export const thumbRect = (Lo: Layout, i: number, scroll = 0) => {
	const gw = Lo.files.w - FL.side - 16;
	const cw = gw / Lo.cols;
	const col = i % Lo.cols;
	const row = Math.floor(i / Lo.cols);
	const th = (FL.thumbW * 776) / PAGE_W;
	return {
		x: Lo.files.x + FL.side + col * cw + (cw - FL.thumbW) / 2,
		y: Lo.files.y + FL.top + 16 + row * FL.cellH - scroll,
		w: FL.thumbW,
		h: th,
		cw,
	};
};

// ------------------------------------------------------------------ the cascade: how many invoices are done at time t (2..200)
// speed ramp: fast, slow while the camera looks at the checks, fast again, ease out at the end
const VSLOW = 7.5; // rows per second during the close-up
const ramp = (t: number, a: number, b: number) => easeInOut(clamp01((t - a) / (b - a)));
const velShape = (t: number, vf: number) => {
	if (t < T.cascade || t > T.casEnd) return 0;
	const up = ramp(t, T.cascade, T.cascade + 0.7);
	const slow = ramp(t, 14.7, 15.35) * (1 - ramp(t, 17.35, 17.85));
	const out = 1 - ramp(t, T.casEnd - 0.45, T.casEnd);
	return up * out * (vf * (1 - slow) + VSLOW * slow);
};
const DT = 1 / 240;
const integ = (vf: number) => {
	let n = 0;
	for (let t = T.cascade; t <= T.casEnd; t += DT) n += velShape(t, vf) * DT;
	return n;
};
// solve the fast speed so exactly 198 rows get done
let lo = 5;
let hi = 200;
for (let k = 0; k < 40; k++) {
	const mid = (lo + hi) / 2;
	if (integ(mid) < 198) lo = mid;
	else hi = mid;
}
const VFAST = (lo + hi) / 2;
const N0 = Math.ceil(T.cascade / DT);
const N1 = Math.ceil(T.casEnd / DT) + 2;
const TABLE: number[] = [];
{
	let n = 2;
	for (let k = N0; k <= N1; k++) {
		TABLE.push(n);
		n += velShape(k * DT, VFAST) * DT;
	}
}
/** invoices done (continuous), 2 before the cascade, 200 after */
export const doneAt = (t: number) => {
	if (t <= T.cascade) return 2;
	const k = (t - N0 * DT) / DT;
	if (k >= TABLE.length - 1) return 200;
	const i = Math.max(0, Math.floor(k));
	const f = k - i;
	return Math.min(200, TABLE[i] * (1 - f) + TABLE[Math.min(TABLE.length - 1, i + 1)] * f);
};
/** time invoice i (0-based) gets written */
export const FILL_T: number[] = INVOICES.map((_, i) => {
	if (i < 2) return 0;
	for (let k = 0; k < TABLE.length; k++) if (TABLE[k] >= i + 1) return (N0 + k) * DT;
	return T.casEnd;
});
export const CHECK_LAG = 0.28;

// the two rows it flags: one the camera watches in the close-up, one during the final burst
const firstAt = (t: number) => FILL_T.findIndex((x, i) => i >= 2 && x >= t);
export const FLAGGED: {i: number; why: string}[] = [
	{i: firstAt(16.05), why: 'Total ≠ line items'},
	{i: firstAt(18.12), why: 'Date missing'},
];
export const isFlag = (i: number) => FLAGGED.some((f) => f.i === i);
export const SPEEDS = {VFAST, VSLOW};

// ------------------------------------------------------------------ the cold open: film time 0..OPEN shows the payoff first
// Tab pressed on frame ~10, all 198 rows fill and get checked, the done pill lands. Then the story plays from scene time
// T.cut, shifted later by SHIFT in film time. During the open, scene time runs time-warped (openSt).
export const OPEN = 4.6;
export const SHIFT = OPEN - T.cut;
export const OP = {
	st0: 10.98, // scene time on frame 0: the pill and the Tab key, just before the press
	cas: 0.27, // film time the cascade starts (scene time T.cascade)
	rowsEnd: 3.0, // film time the last row lands
	cap: [3.3, 4.5] as [number, number],
};
/** scene time at which n invoices are done (inverse of doneAt) */
const stForDone = (n: number) => {
	let a = T.cascade;
	let b = T.casEnd;
	for (let k = 0; k < 44; k++) {
		const m = (a + b) / 2;
		if (doneAt(m) < n) a = m;
		else b = m;
	}
	return (a + b) / 2;
};
/** scene time shown at film time t (0 <= t < OPEN) */
export const openSt = (t: number) => {
	if (t <= OP.cas) return OP.st0 + t;
	if (t >= OP.rowsEnd) return T.casEnd + (t - OP.rowsEnd);
	const n = 2 + 198 * easeSoft(clamp01((t - OP.cas) / (OP.rowsEnd - OP.cas)));
	return n <= 2 ? T.cascade : stForDone(Math.min(200, n));
};
/** film time -> {open, st (scene time), t (story time; negative during the open)} */
export const filmTime = (tf: number) => (tf < OPEN ? {open: true, st: openSt(tf), t: tf - SHIFT} : {open: false, st: tf - SHIFT, t: tf - SHIFT});

// ------------------------------------------------------------------ manual entry (rows 2 and 3)
type Pt = {t: number; x: number; y: number};
export type Paste = {t: number; r: number; c: number; inv: number; f: Field};
export type SelK = {inv: number; f: Field; a: number; b: number; off: number};

/** where the cursor rests in A4 while the pill shows: bottom-left of the cell, clear of the ghost text */
export const A4_CURSOR = (Lo: Layout) => ({x: colX(Lo, 0) + 9, y: rowY(Lo, 4) + SH.row - 7});

export const buildManual = (Lo: Layout) => {
	const pts: Pt[] = [];
	const clicks: number[] = [];
	const pastes: Paste[] = [];
	const sels: SelK[] = [];
	const t0 = thumbRect(Lo, 0);
	const startPos = {x: Lo.files.x + Lo.files.w * 0.62, y: Lo.files.y + Lo.files.h * 0.72};
	pts.push({t: 0, ...startPos}, {t: 2.45, ...startPos});
	const onThumb = {x: t0.x + t0.w * 0.55, y: t0.y + t0.h * 0.5};
	pts.push({t: T.dbl - 0.04, ...onThumb});
	clicks.push(T.dbl, T.dbl + 0.13);
	const rowPass = (inv: number, r: number, start: number, P: number, offAt: number) => {
		FIELDS.forEach((f, k) => {
			const a = start + k * P;
			const box = textBox(INVOICES[inv], f);
			const s0 = pageToDesk(Lo, box.x + 1, box.y + box.h * 0.55);
			const s1 = pageToDesk(Lo, box.x + box.w, box.y + box.h * 0.55);
			const cell = cellCenter(Lo, r, k);
			pts.push({t: a + 0.36 * P, ...s0});
			clicks.push(a + 0.38 * P);
			pts.push({t: a + 0.6 * P, ...s1});
			const nextA = k < FIELDS.length - 1 ? start + (k + 1) * P + 0.38 * P : offAt;
			sels.push({inv, f, a: a + 0.38 * P, b: a + 0.6 * P, off: nextA});
			pts.push({t: a + 0.92 * P, x: cell.x + 6, y: cell.y + 2});
			clicks.push(a + 0.93 * P);
			pastes.push({t: a + 0.95 * P, r, c: k, inv, f});
		});
	};
	rowPass(0, 2, T.row1, T.per1, T.next);
	// next invoice: arrow key, the preview flips to the next file
	rowPass(1, 3, T.row2, T.per2, T.cascade);
	const a4 = A4_CURSOR(Lo);
	pts.push({t: T.clickA4 - 0.03, ...a4});
	clicks.push(T.clickA4);
	pts.push({t: T.press, ...a4});
	return {pts, clicks, pastes, sels};
};

const cache = new Map<Layout, ReturnType<typeof buildManual>>();
export const manual = (Lo: Layout) => {
	if (!fontsReady) return buildManual(Lo);
	if (!cache.has(Lo)) cache.set(Lo, buildManual(Lo));
	return cache.get(Lo)!;
};

export const cursorAt = (Lo: Layout, t: number) => {
	const {pts, clicks} = manual(Lo);
	let x = pts[0].x;
	let y = pts[0].y;
	for (let k = 1; k < pts.length; k++) {
		const a = pts[k - 1];
		const b = pts[k];
		if (t <= a.t) break;
		const u = clamp01((t - a.t) / Math.max(0.001, b.t - a.t));
		const e = easeInOut(u);
		// a slight arc, like a hand moving a mouse
		const arc = Math.sin(u * Math.PI) * Math.min(18, Math.hypot(b.x - a.x, b.y - a.y) * 0.05);
		x = a.x + (b.x - a.x) * e;
		y = a.y + (b.y - a.y) * e - arc;
	}
	let press = 0;
	for (const c of clicks) press = Math.max(press, 1 - clamp01(Math.abs(t - c - 0.03) / 0.07));
	return {x, y, press};
};

/** sheet text of a manual cell at time t (or '' if not pasted yet) */
export const pastedAt = (Lo: Layout, r: number, c: number, t: number) => {
	const p = manual(Lo).pastes.find((q) => q.r === r && q.c === c);
	if (!p || t < p.t) return undefined;
	return p;
};

/** current active cell (row, col) */
export const activeCell = (Lo: Layout, t: number) => {
	if (t >= T.cascade) return undefined;
	if (t >= T.clickA4) return {r: 4, c: 0};
	let cur = {r: 2, c: 0};
	for (const p of manual(Lo).pastes) if (t >= p.t - 0.02) cur = {r: p.r, c: p.c};
	return cur;
};

export const selOf = (Lo: Layout, inv: number, t: number): Partial<Record<Field, number>> => {
	const o: Partial<Record<Field, number>> = {};
	for (const s of manual(Lo).sels) {
		if (s.inv !== inv || t < s.a || t >= s.off) continue;
		o[s.f] = easeOut(clamp01((t - s.a) / (s.b - s.a)));
	}
	return o;
};

/** files grid scroll (px) */
export const filesScroll = (Lo: Layout, t: number) => {
	const rows = Math.ceil(200 / Lo.cols);
	const vis = (Lo.files.h - FL.top - 40) / FL.cellH;
	const max = (rows - vis) * FL.cellH + 30;
	if (t < T.cut) return 0;
	if (t < T.cascade) {
		const u = easeInOut(clamp01((t - T.scrollUp[0]) / (T.scrollUp[1] - T.scrollUp[0])));
		return 1700 * (1 - u);
	}
	const cur = doneAt(t + 0.15) / Lo.cols;
	return Math.max(0, Math.min(max, (cur - vis * 0.55) * FL.cellH));
};

/** sheet scroll (px): keeps the row being written about 2/3 down the window */
export const sheetScroll = (Lo: Layout, t: number) => {
	const n = doneAt(t + 0.1);
	const target = Math.floor(Lo.visRows * (Lo.slot ?? 0.8));
	const s = (n + 1 - target) * SH.row;
	// layouts with a slot stop with the last row at the slot, so the empty rows below it hold the caption
	const max = Lo.slot ? (201 - target) * SH.row : (201 - Lo.visRows + 2) * SH.row;
	return Math.max(0, Math.min(max, s));
};
