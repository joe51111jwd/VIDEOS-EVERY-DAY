// Sound for the talk cut: music only (no voice, no effects). tools/cues-talk.ts exports this for tools/mix.py.
import {BEAT, PRE, SONG0, T} from './beat';

/** N.Y. State of Mind's instrumental (out/music/ny.wav, built by tools/song.py): which second plays at the start (the
 * opening bar, PRE before film 0), and how it ends: the downbeat of beat 164 hits, the drums stop and the piano rings out.
 * Times here are composition seconds (film t + PRE). */
export const MUSIC = {
	file: 'ny',
	// the picture leads the sound by 12 ms so the hits feel locked
	offset: SONG0 - PRE - 0.012,
	gain: 0.9,
	duck: 0,
	drumsOut: [PRE + T.end + 0.2, PRE + T.end + 0.3],
	fadeOut: [PRE + T.end + 0.12, PRE + T.end + 0.6],
	beat: BEAT,
};
