// Timing for the cut. Until James's file of "Money" lands this is a placeholder grid:
// 7/4 at 122 BPM, the register loop alone for two bars, then the bass. Every scene asks
// for its times through at(bar, beat), so re-timing to the real song only changes this file.
export const FPS = 30;
export const BPM = 122;
export const BEAT = 60 / BPM;
export const PER_BAR = 7;
export const BAR = BEAT * PER_BAR;
export const T0 = 0.06; // first downbeat in film time
export const LEAD = 2 / FPS; // pictures land a hair before the sound

/** film time of bar b (0-based), beat k (0-based, may be fractional) */
export const at = (b: number, k = 0) => T0 + b * BAR + k * BEAT - LEAD;
export const END = at(9, 0) + LEAD + 0.6;
export const DURATION = Math.round(END * FPS);
