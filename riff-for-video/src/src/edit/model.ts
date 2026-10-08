// The edit as data: which clips sit where on the timeline at any film time, where the playhead is,
// and which look the footage has. Pure functions of film time t (seconds).
import {ACT, BEAT, BEAT0} from './timing';
import {clamp01, easeInOut, easeOut, easeSnap, lerp} from '../lib/tokens';

/** extracted frame ranges (source seconds) — must match tools/clips.json */
export const CLIPS: Record<string, {a: number; b: number; name: string; frames: number}> = {
	c1002: {a: 1.0, b: 7.0, name: 'walk_out', frames: 180},
	c1032: {a: 5.0, b: 11.0, name: 'run_board', frames: 180},
	c1128: {a: 0.0, b: 9.0, name: 'carve_A', frames: 270},
	c1076: {a: 1.5, b: 9.5, name: 'aerial_02', frames: 240},
	c1127: {a: 7.5, b: 14.5, name: 'ride_B', frames: 210},
	c1114: {a: 17.5, b: 25.0, name: 'splash', frames: 225},
	c1116: {a: 0.5, b: 7.0, name: 'sun_sil', frames: 195},
	c1045: {a: 4.5, b: 10.5, name: 'walk_home', frames: 180},
	c1213: {a: 0.5, b: 6.0, name: 'smile', frames: 165},
};

export type Seg = {id: string; clip: string; x: number; dur: number; s: number; speed?: number};
export type LSeg = Seg & {y: number; o: number};

const S0: Seg[] = [
	{id: 'A', clip: 'c1002', x: 0, dur: 3.0, s: 2.0},
	{id: 'B', clip: 'c1032', x: 3.0, dur: 2.5, s: 6.5},
	{id: 'C', clip: 'c1128', x: 5.5, dur: 6.0, s: 1.5},
	{id: 'D', clip: 'c1076', x: 11.5, dur: 4.0, s: 3.0},
	{id: 'E', clip: 'c1127', x: 15.5, dur: 3.5, s: 9.0},
	{id: 'F', clip: 'c1114', x: 19.0, dur: 3.5, s: 19.0},
	{id: 'G', clip: 'c1116', x: 22.5, dur: 3.5, s: 1.5},
	{id: 'H', clip: 'c1045', x: 26.0, dur: 3.0, s: 6.0},
];
const shift = (segs: Seg[], from: number, by: number) => segs.map((g) => (g.x >= from - 1e-6 ? {...g, x: g.x + by} : g));
const without = (segs: Seg[], id: string) => segs.filter((g) => g.id !== id);
const replace = (segs: Seg[], id: string, add: Seg[]) => segs.flatMap((g) => (g.id === id ? add : [g]));

// "Cut here." at T 7.5 splits the carve
const S1 = replace(S0, 'C', [
	{id: 'C1', clip: 'c1128', x: 5.5, dur: 2.0, s: 1.5},
	{id: 'C2', clip: 'c1128', x: 7.5, dur: 4.0, s: 3.5},
]);
// "Lose that." removes the piece before the cut and the gap closes
const S2 = shift(without(S1, 'C1'), 7.5, -2);
// "Remove that cut." brings the piece back (S1), then the seam heals (S0)
const S3 = S1;
const S4 = S0;
// "Trim two seconds off the end."
const S5 = shift(S0.map((g) => (g.id === 'C' ? {...g, dur: 4.0} : g)), 11.5, -2);
// "Slow-mo from here… to there." T 8.0 → 9.0 at 50%
const S6 = replace(shift(S5, 9.5, 1), 'C', [
	{id: 'Ca', clip: 'c1128', x: 5.5, dur: 2.5, s: 1.5},
	{id: 'Cs', clip: 'c1128', x: 8.0, dur: 2.0, s: 4.0, speed: 0.5},
	{id: 'Cb', clip: 'c1128', x: 10.0, dur: 0.5, s: 5.0},
]);
// the slow-mo stretch animates from 1 s to 2 s; this is its first frame
const S6pre = replace(S5, 'C', [
	{id: 'Ca', clip: 'c1128', x: 5.5, dur: 2.5, s: 1.5},
	{id: 'Cs', clip: 'c1128', x: 8.0, dur: 1.0, s: 4.0, speed: 1},
	{id: 'Cb', clip: 'c1128', x: 9.0, dur: 0.5, s: 5.0},
]);
// "Find the shot where she smiles." drops the smile in at T 10.0
const S7 = [...shift(S6, 10.0, 2), {id: 'M', clip: 'c1213', x: 10.0, dur: 2.0, s: 2.2}].sort((a, b) => a.x - b.x);
// "Cut it to the beat.": every cut lands on a beat, the tail becomes a two-beat montage
const q = (x: number) => BEAT0 + Math.round((x - BEAT0) / BEAT) * BEAT;
const S8 = (() => {
	const out: Seg[] = [];
	let x = 0;
	for (const g of S7) {
		const tail = g.x >= 12.0;
		const end = tail ? x + 2 * BEAT : q(g.x + g.dur);
		const dur = Math.max(BEAT, end - x);
		out.push({...g, x, dur});
		x += dur;
	}
	return out;
})();

type Step = {t: number; d: number; to: Seg[]; e?: (x: number) => number};
const STEPS: Step[] = [
	{t: -1, d: 0, to: S0},
	{t: ACT.cut, d: 0, to: S1},
	{t: ACT.ripple, d: 0.34, to: S2, e: easeInOut},
	{t: ACT.restore, d: 0.4, to: S3, e: easeOut},
	{t: ACT.heal + 0.3, d: 0, to: S4},
	{t: ACT.trim, d: 0.38, to: S5, e: easeInOut},
	{t: ACT.slow, d: 0, to: S6pre},
	{t: ACT.slow, d: 0.4, to: S6, e: easeInOut},
	{t: ACT.insert, d: 0.3, to: S7, e: easeOut},
	{t: ACT.beat, d: 0.55, to: S8, e: easeSnap},
];

/** the V1 track at film time t; y/o animate removed and inserted clips */
export const layoutAt = (t: number): LSeg[] => {
	let i = 0;
	while (i + 1 < STEPS.length && STEPS[i + 1].t <= t) i++;
	const cur = STEPS[i];
	const prev = i > 0 ? STEPS[i - 1].to : cur.to;
	const p = cur.d > 0 ? (cur.e ?? easeInOut)(clamp01((t - cur.t) / cur.d)) : 1;
	const out: LSeg[] = [];
	for (const g of cur.to) {
		const a = prev.find((h) => h.id === g.id);
		if (a) out.push({...g, x: lerp(a.x, g.x, p), dur: lerp(a.dur, g.dur, p), y: 0, o: 1});
		else out.push({...g, y: -46 * (1 - p), o: p});
	}
	// "Lose that." — the removed piece lifts off before the gap closes
	if (t >= ACT.lift && t < ACT.restore) {
		const c1 = S1.find((g) => g.id === 'C1')!;
		const lp = easeOut(clamp01((t - ACT.lift) / 0.28));
		if (lp < 1) out.push({...c1, y: -40 * lp, o: 1 - lp});
	}
	return out.filter((g) => !(g.id === 'C1' && t >= ACT.lift && t < ACT.restore && g.y === 0));
};

// ---- playhead: timeline seconds under the fixed centre playhead
type PK = [number, number, 'lin' | 'io' | 'out'];
const PH: PK[] = [
	[0.0, 8.1, 'io'],
	[0.22, 7.3, 'io'],
	[0.45, 7.75, 'io'],
	[0.64, 7.5, 'io'],
	[ACT.ripple, 7.5, 'io'],
	[ACT.ripple + 0.34, 5.5, 'lin'],
	[ACT.rewind, 5.5 + (ACT.rewind - ACT.ripple - 0.34), 'out'],
	[ACT.rewind + 0.28, 4.55, 'lin'],
	[ACT.toCut, 4.55 + (ACT.toCut - ACT.rewind - 0.28), 'io'],
	[ACT.toCut + 0.45, 5.5, 'io'],
	[ACT.heal + 0.3, 5.5, 'lin'],
	[9.85, 5.5 + (9.85 - ACT.heal - 0.3), 'io'],
	[ACT.markIn, 8.0, 'io'],
	[ACT.markOut - 0.05, 9.0, 'io'],
	[ACT.whip, 9.0, 'out'],
	[ACT.whip + 0.2, 7.6, 'lin'],
	[ACT.colorOpen, 7.6 + (ACT.colorOpen - ACT.whip - 0.2), 'lin'],
	[ACT.colorClose, 9.85, 'lin'],
	[ACT.browserOpen, 10.0, 'io'],
	[ACT.insert + 0.3, 10.0, 'lin'],
	[40, 10.0 + (40 - ACT.insert - 0.3), 'lin'],
];
export const playheadAt = (t: number) => {
	if (t <= PH[0][0]) return PH[0][1];
	for (let i = 0; i + 1 < PH.length; i++) {
		const [t0, v0, e] = PH[i];
		const [t1, v1] = PH[i + 1];
		if (t >= t0 && t <= t1) {
			const x = clamp01((t - t0) / (t1 - t0));
			const k = e === 'lin' ? x : e === 'out' ? easeOut(x) : easeInOut(x);
			return lerp(v0, v1, k);
		}
	}
	return PH[PH.length - 1][1];
};

/** the frame under timeline time T: clip id + 1-based frame index into public/f/<clip>/<look>/ */
export const frameAt = (segs: LSeg[], T: number): {clip: string; idx: number; seg?: LSeg} => {
	const live = segs.filter((g) => g.y === 0);
	const hit = (h: LSeg) => T >= h.x - 1e-6 && T < h.x + h.dur;
	// a clip that is still dropping in counts too, so a gap never shows the wrong shot
	let g = live.find(hit) ?? segs.find((h) => h.o > 0.01 && hit(h));
	if (!g) g = live.reduce((a, h) => (Math.min(Math.abs(T - h.x), Math.abs(T - h.x - h.dur)) < Math.min(Math.abs(T - a.x), Math.abs(T - a.x - a.dur)) ? h : a), live[0]);
	const src = g.s + (T - g.x) * (g.speed ?? 1);
	const c = CLIPS[g.clip];
	const idx = Math.max(1, Math.min(c.frames, Math.round((src - c.a) * 30) + 1));
	return {clip: g.clip, idx, seg: g};
};

// ---- looks: flat → moody (wipe) → deep teal → 60%
export const lookAt = (t: number) => {
	const wipe = clamp01((t - ACT.grade) / 0.5);
	let teal = easeInOut(clamp01((t - ACT.teal) / 0.6));
	teal = lerp(teal, 0.6, easeInOut(clamp01((t - ACT.less) / 0.45)));
	return {wipe, teal, intensity: Math.round(t < ACT.less ? 100 : lerp(100, 60, easeInOut(clamp01((t - ACT.less) / 0.45))))};
};

export const pad4 = (n: number) => String(n).padStart(4, '0');
