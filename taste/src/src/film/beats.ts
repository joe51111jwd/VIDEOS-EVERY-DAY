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

/** sung word onsets (film s), from word-level transcription of the vocal stem */
export const W = {
	ceilings: st(119.7),
	are: st(120.08),
	gray: st(120.52),
	you0: st(120.98),
	make: st(121.12),
	them: st(121.42),
	blue: st(121.76),
	ooh1: st(122.38),
	like1: st(123.62),
	summer: st(124.12),
	sky: st(124.56),
	cool: st(125.24),
	lover: st(126.5),
	ice: st(127.04),
	// refrain 1
	r1: {i: st(128.5), like: st(129.4), the: st(129.64), way: st(129.96), you: st(130.22), like2: st(130.54), to: st(130.8), move: st(132.2)},
	// refrain 2 (ends "to… ooh", no move)
	r2: {i: st(135.92), like: st(136.4), the: st(136.8), way: st(137.04), you: st(137.34), like2: st(137.68), to: st(137.98), ooh: st(138.34)},
	// refrain 3
	r3: {i: st(140.9), like: st(141.16), the: st(141.48), way: st(141.78), you: st(142.04), like2: st(142.32), to: st(142.7), move: st(143.02)},
	// refrain 4
	r4: {i: st(145.42), like: st(145.76), the: st(146.2), way: st(146.48), you: st(146.82), like2: st(147.04), to: st(147.4), move: st(148.92)},
};
