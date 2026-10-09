import {Easing} from 'remotion';
import {clamp01} from '../lib/tokens';

// ---- the beat grid (HUMBLE. is ~150 BPM; retimed from the measured grid once the song is in)
export const BPM = 150;
export const B = 60 / BPM;
export const BAR = 4 * B;
/** film seconds of bar `bar` (1-based), beat `beat` (1-based, fractional ok) */
export const at = (bar: number, beat = 1) => ((bar - 1) * 4 + (beat - 1)) * B;

// ---- act 1: the day piles on, it's gone, rewind, Restore
export const HOOK = {
	chaos0: 0.2, // first window of the afternoon (world seconds)
	chaosStep: 0.1, // one window per 16th
	banners: [0.5, 0.7, 0.9],
	clock0: 0.2, // clock starts moving
	clock1: 1.15, // reaches 4:17 PM
	blink: 1.22, // everything closes
	blinkDur: 0.12,
	end: 1.6, // world time when we freeze
};
export const KEYS = {t0: at(2, 1), ctrl: at(2, 1), cmd: at(2, 1) + 0.05, z: at(2, 1.5), t1: at(2, 2)};
export const RW = {
	open: at(2, 2), // timeline rises, desktop recedes
	grab: at(2, 2.5) - 0.04,
	drag0: at(2, 2.5),
	drag1: at(3, 3.75),
	restore: at(4, 1), // click lands the drop
};

const dragEase = Easing.bezier(0.42, 0, 0.22, 1);
/** the rewind starts right after the blink-out, so the first thing the scrub shows is everything coming back */
const W_DRAG = 1.36;
/** lands where the clock first reads 10:42 */
const W_LAND = 0.2;
/** world time (seconds into the hook) for film time t */
export const worldAt = (t: number) => {
	if (t < KEYS.t0) return t;
	if (t < RW.drag0) return HOOK.end;
	if (t < RW.drag1) return W_DRAG + (W_LAND - W_DRAG) * dragEase(clamp01((t - RW.drag0) / (RW.drag1 - RW.drag0)));
	return W_LAND;
};

// ---- clock: world time → minutes since midnight
const M0 = 10 * 60 + 42; // 10:42 AM
const M1 = 16 * 60 + 17; // 4:17 PM
export const clockAt = (w: number) => {
	if (w <= HOOK.clock0) return M0;
	if (w >= HOOK.clock1) return M1;
	const u = (w - HOOK.clock0) / (HOOK.clock1 - HOOK.clock0);
	return M0 + (M1 - M0) * u;
};
export const fmtClock = (min: number, withDay = true) => {
	const m = Math.floor(min);
	let h = Math.floor(m / 60);
	const mm = m % 60;
	const pm = h >= 12;
	h = h % 12 || 12;
	return `${withDay ? 'Thu Oct 9  ' : ''}${h}:${String(mm).padStart(2, '0')} ${pm ? 'PM' : 'AM'}`;
};
export const hhmm = (min: number) => {
	const m = Math.floor(min);
	const h = Math.floor(m / 60) % 12 || 12;
	return `${h}:${String(m % 60).padStart(2, '0')}`;
};
/** the Rewind strip covers 9:00 AM → 4:30 PM */
export const STRIP0 = 9 * 60;
export const STRIP1 = 16 * 60 + 30;
export const stripP = (min: number) => (min - STRIP0) / (STRIP1 - STRIP0);
/** inverse of clockAt inside the afternoon (for thumbnails) */
export const worldForClock = (min: number) => {
	if (min <= M0) return 0;
	if (min >= M1) return HOOK.end;
	return HOOK.clock0 + ((min - M0) / (M1 - M0)) * (HOOK.clock1 - HOOK.clock0);
};

// ---- act 2: exactly as it was (macro details after the restore)
export const DETAIL = {
	tabs: at(4, 2), // tab bar macro: tabs pour in
	scroll: at(4, 4), // page scrolls back to the highlighted line
	scrollLand: at(5, 1),
	term: at(5, 2), // terminal macro: same folder, server back up
	wide: at(5, 4), // pull back to the whole desk
	end: at(6, 2),
};
// ---- act 3: any moment (scrub back through days)
export const MONT = {
	open: at(6, 2),
	steps: [at(6, 3), at(7, 1), at(7, 3), at(8, 1), at(8, 3)],
	restore: at(9, 1),
	end: at(10, 1),
};
// ---- act 4: the line and the lockup
export const END = {
	w1: at(10, 1),
	w2: at(10, 2),
	w3: at(10, 3),
	lock: at(11, 1),
	end: at(13, 1),
};
