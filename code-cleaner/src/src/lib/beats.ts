// Timing grid, measured on James's file of "Public Service Announcement" (album version):
// 89.3 BPM, beat 0.672 s, kick grid at song 20.242 + k * 0.672. tools/audio/edit.py cuts the
// song on downbeats and keeps that grid, so beat k of the film is always T0 + k * BEAT:
//   beat 0   the first word of the opening line (film starts 0.1 s before it)
//   beat 4   the drop, on the name                      (song bar 1)
//   beat 20  the beat drops out, end of the breakdown   (song bars 23-24)
//   beat 28  the beat slams back                        (song bar 25)
//   beat 36  the last two bars                          (song bars 47-48)
//   beat 43.5 the last big hit; the beat stops at 44
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
export const BREAK = 20;
export const SLAM = 28;
export const LAST_HIT = 43.5;
export const END_BEAT = 44;
export const DURATION = Math.round((T0 + END_BEAT * BEAT) * FPS);
