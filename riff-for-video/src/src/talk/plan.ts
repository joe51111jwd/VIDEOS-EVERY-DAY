import {at, BEAT, HITS, T} from './beat';
import {ShotId} from './shots';

// The edit itself. The hook is one shot (the dancer) that gets reframed, graded and slowed down by voice; on the
// slam it is cut to the beat; in the editor the kick gets a freeze, every kick a shake and the drop a title; then the
// finished cut plays back from the drop.

export type Cut = {id: ShotId; a: number; off: number};
/** the cut to the beat: [shot, song beat it starts on, seconds into the shot] */
const CUTS: [ShotId, number, number][] = [
	['ts', 0, 0.2],
	['kick', 1, 0.11],
	['sub', 3, 0.0],
	['grid', 4, 0.2],
	['face', 4.5, 0.95],
	['low', 5, 0.3],
	['umb', 6.32, 0.3],
	['sky', 7, 0.2],
];
const cutsFrom = (bar0: number): Cut[] => CUTS.map(([id, n, off]) => ({id, a: at(bar0 + n), off}));
/** the cut as first made ("Cut it to the beat."), and as played back at the end */
export const CUT_A = cutsFrom(128);
export const CUT_B = cutsFrom(148);

/** the freeze ("Freeze it here."): on the kick shot, from the swung kick to the next snare */
export const FREEZE = {from: 2.32, to: 3};

/** the opening shot's time: 1x, then a ramp down to 35% from "Slow it down." */
export const SLOW = 0.35;
const RAMP = 0.28;
export const hookTime = (t: number) => {
	const s0 = T.slow;
	if (t <= s0) return t;
	const d = t - s0;
	// speed falls linearly from 1 to SLOW over RAMP s, then holds
	if (d < RAMP) return s0 + d - ((1 - SLOW) * d * d) / (2 * RAMP);
	return s0 + RAMP - ((1 - SLOW) * RAMP) / 2 + (d - RAMP) * SLOW;
};

/** the shot on screen at film t in one of the cuts, and how far into it */
export const cutAt = (cuts: Cut[], t: number) => {
	let i = 0;
	for (let k = 0; k < cuts.length; k++) if (t >= cuts[k].a) i = k;
	const c = cuts[i];
	return {c, i, s: c.off + (t - c.a)};
};

/** in the edit (timeline seconds, 0 = film 0): which shot and where, before or after the voice edits in the editor */
export const editPicture = (T_: number, edited: {freeze: boolean}) => {
	if (T_ < T.slam) return {id: 'hk' as ShotId, s: hookTime(T_), look: 'neon', slow: T_ > T.slow};
	const {c, i, s} = cutAt(CUT_A, T_);
	if (edited.freeze && c.id === 'kick') {
		const f0 = at(128 + FREEZE.from);
		if (T_ >= f0) return {id: c.id, s: c.off + (f0 - c.a), look: 'neon', slow: false, frozen: true, i};
	}
	return {id: c.id, s, look: 'neon', slow: false, i};
};

/** the shake on a kick: 0..1 that decays fast */
export const kickShake = (t: number, from: number, to: number) => {
	let v = 0;
	for (const k of HITS.kicks) {
		if (k < from || k > to || t < k) continue;
		const d = t - k;
		if (d < 0.3) v = Math.max(v, Math.exp(-d * 16));
	}
	return v;
};
export const snareFlash = (t: number, from: number, to: number) => {
	let v = 0;
	for (const s of HITS.snares) {
		if (s < from || s > to || t < s) continue;
		const d = t - s;
		if (d < 0.16) v = Math.max(v, 1 - d / 0.16);
	}
	return v;
};

export {BEAT};
