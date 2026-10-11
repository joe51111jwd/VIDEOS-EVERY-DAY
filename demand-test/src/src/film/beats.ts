// Timing for the cut, on James's file of "Money" as condensed by tools/audio/edit.py.
// The tape loop has a fixed period: one 7/4 bar = 3.552 s, so a beat is 0.50743 s and
// film bar i starts at 0.492 + 3.552 i (film 0 = song 4.50). Every scene asks for its
// times through at(bar, beat); the few hits off the grid are named below.
export const FPS = 30;
export const BEAT = 3.552 / 7;
export const PER_BAR = 7;
export const BAR = BEAT * PER_BAR;
export const T0 = 0.492; // first downbeat in film time (the loop's thud)
export const LEAD = 2 / FPS; // pictures land a hair before the sound

/** film time of bar b (0-based), beat k (0-based, may be fractional) */
export const at = (b: number, k = 0) => T0 + b * BAR + k * BEAT - LEAD;
/** a hit off the grid, in film seconds */
export const hit = (t: number) => t - LEAD;

// beat 14 = the bass comes in, beat 28 = the band comes in
export const WORD = 28.726; // the first sung word, its first consonant (vocal stem onset)
export const CLUNK = 30.1; // after the stop: one more pass of the loop's register clunk...
export const DING = 30.616; // ...and its bell
export const END = 32.0; // the bell's tail is gone (below -60 dB) by 31.7
export const DURATION = Math.round(END * FPS);
