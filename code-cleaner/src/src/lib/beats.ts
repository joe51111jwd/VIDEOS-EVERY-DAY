// Timing grid, measured on James's file of "Public Service Announcement" (album version):
// 89.3 BPM, beat 0.672 s, kick grid at song 20.242 + k * 0.672. tools/audio/edit.py cuts the
// song on downbeats and keeps that grid, so beat k of the film is always T0 + k * BEAT:
//   beat 0   the first word of the opening line (film starts 0.1 s before it)
//   beat 4   the drop, on the name       (song bar 1); bars 1-8 play straight through
//   beat 36  one splice into the ending  (song bars 45-48)
//   beat 51.5 the last big hit; the beat stops at 52
export const FPS = 30;
export const BEAT = 0.672;
export const T0 = 0.1; // film time of beat 0
export const LEAD = 2 / FPS; // pictures land a hair before the sound

/** film seconds of beat k (may be fractional) */
export const b = (k: number) => T0 + k * BEAT - LEAD;
/** frame of beat k */
export const fb = (k: number) => Math.max(0, Math.round(b(k) * FPS));
export const fr = (sec: number) => Math.round(sec * FPS);

export const DROP = 4;
export const LAST_HIT = 51.5;
export const END_BEAT = 52;
export const DURATION = Math.round((T0 + END_BEAT * BEAT) * FPS);
