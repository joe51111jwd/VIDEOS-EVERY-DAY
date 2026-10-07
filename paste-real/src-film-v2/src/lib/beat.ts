// Music cues in film time (seconds), written by music/edit.py from the measured beat grid of the instrumental.
import cues from '../cues.json';

export type Hit = {t: number; kind: 'kick' | 'snare' | 'hat'; s: number; src: number};
export type Beat = {t: number; bar: number; beat: number; src: number};
export const CUES = cues as unknown as {
	duration: number;
	beats: Beat[];
	hits: Hit[];
	stops: {from: number; to: number; slamBar: number}[];
	downbeats: Beat[];
	chordB?: number;
	drumsIn?: number;
	loopIn?: number;
};
export const BEAT = 60 / 87.435;
export const BAR = 4 * BEAT;

/** film time of bar `bar` (1-based, as numbered in the source track), beat `beat` (1..4, fractional ok) */
export const at = (bar: number, beat = 1) => {
	const d = CUES.downbeats.find((b) => b.bar === bar);
	if (!d) throw new Error(`bar ${bar} is not in the edit`);
	return d.t + (beat - 1) * BEAT;
};

/** time since the most recent hit of a kind (Infinity if none yet) */
export const sinceHit = (t: number, kind?: Hit['kind'], minS = 0) => {
	let best = Infinity;
	for (const h of CUES.hits) {
		if (h.t > t) break;
		if ((!kind || h.kind === kind) && h.s >= minS) best = t - h.t;
	}
	return best;
};

/** exponential pulse that jumps to 1 on each hit and decays with time constant tau */
export const pulse = (t: number, kind?: Hit['kind'], tau = 0.12, minS = 0) => {
	const d = sinceHit(t, kind, minS);
	return d === Infinity ? 0 : Math.exp(-d / tau);
};

/** is t inside a stop (the beat cut to silence)? returns 0..1 progress through it, or -1 */
export const inStop = (t: number) => {
	for (const s of CUES.stops) if (t >= s.from && t < s.to) return (t - s.from) / (s.to - s.from);
	return -1;
};
