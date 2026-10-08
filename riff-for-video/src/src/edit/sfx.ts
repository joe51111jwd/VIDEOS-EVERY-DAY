// Sound: music only (no voice, no effects). tools/cues.ts exports this for tools/mix.py.
import {ACT, BEAT, PLAN, SONG} from './timing';

export const SFX: [number, string, number][] = [];

/** the song's instrumental (out/music/<song>.wav, built by tools/song.py): which second plays at film 0,
 * and how it ends: the last downbeat hits, the drums stop and the bass rings out */
export const MUSIC = {
	file: SONG,
	// the picture leads the sound by 12 ms so the hits feel locked
	offset: PLAN.start - 0.012,
	gain: 0.9,
	duck: 0,
	drumsOut: [ACT.end + PLAN.drumsOut[0], ACT.end + PLAN.drumsOut[1]],
	fadeOut: [ACT.end + 0.12, ACT.end + 0.6],
	beat: BEAT,
};
