// Jane & The Boy, "Move": ~102.0 BPM (beat 0.58824 s), song beat n at 0.56018 + 0.58824 n.
// The film plays src 117.57 s (everything slams back in on beat 199) to the song's own dead stop at
// src 151.74 s (beat 257). Bars: 200, 204 … 220; a stop at 222 (instruments out from src 131.05,
// "MOVE" sung alone at 132.20, pickups 132.76 / 132.91 / 133.20), back on 226, bars 226 … 254.
export const SONG_T0 = 117.57;
export const BEAT = 0.5882425;
const B0 = 0.5601768;
/** film seconds of song beat n */
export const bt = (n: number) => B0 + BEAT * n - SONG_T0;
/** film seconds of a song timestamp */
export const st = (s: number) => s - SONG_T0;

export const CUE = {
	slam: bt(199),
	stop: st(131.05),
	pick: [st(132.76), st(132.91), st(133.2)],
	drop: bt(226),
	lastHit: bt(256),
	cut: bt(257),
};
export const DURATION = CUE.cut + 0.1;

/** sung word onsets (film s): vocal-stem attack times (librosa onsets, backtracked), snapped from the word-level transcription.
 *  Every MOVE is re-measured by eye on the vocal-stem spectrogram + pitch track: the onset detector fired on the vowel
 *  or later (r1 was 0.46 s late), but the M is voiced from its first millisecond. Each MOVE is sung right on a beat. */
export const W = {
	ceilings: 2.107,
	are: 2.519,
	gray: 2.937,
	you0: 3.408,
	make: 3.529,
	them: 3.849,
	blue: 4.162,
	ooh1: st(122.38),
	like1: st(123.62),
	summer: st(124.12),
	sky: st(124.56),
	cool: st(125.24),
	lover: st(126.5),
	ice: st(127.04),
	// refrain 1, then "MOVE" alone in the stop
	r1: {i: 10.902, like: 11.767, the: 12.045, way: 12.394, you: 12.684, like2: 12.98, to: 13.317, move: 14.15},
	// refrain 2 (ends "to… ooh", no move)
	r2: {i: 18.425, like: 18.843, the: 19.156, way: 19.574, you: 19.772, like2: 20.149, to: 20.294, ooh: 20.741},
	// refrain 3
	r3: {i: 23.4, like: 23.557, the: 23.829, way: 24.247, you: 24.503, like2: 24.665, to: 25.078, move: 25.35},
	// refrain 4
	r4: {i: 27.818, like: 28.114, the: 28.566, way: 28.92, you: 29.246, like2: 29.559, to: 29.675, move: 31.2},
};
