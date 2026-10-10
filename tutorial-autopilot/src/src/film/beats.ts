// Timing for the cut, measured on the 34 s edit of Technologic (tools/audio/medley_*.py).
// The robot voice says one verb per beat; every action on screen lands on the first consonant
// of its verb (measured on the vocal stem). `hits` are the beats after the verse: the break's
// first kick and the two closing chants.
import onsetsJson from './onsets.json';

export const FPS = 30;
export const LEAD = 2 / FPS; // a word's picture is whole slightly before it is heard

type OnsetFile = {beat: number; filmStartSrc: number; verbs: {i: number; src: number}[]; hits: Record<'lock' | 'chant1' | 'chant2', number>; end: number};
const O = onsetsJson as OnsetFile;
export const BEAT = O.beat;
/** film time of verb i's first consonant */
export const v = (i: number) => {
	const vs = O.verbs;
	if (i < vs.length && vs[i]) return vs[i].src - O.filmStartSrc;
	const last = vs[vs.length - 1];
	return last.src - O.filmStartSrc + (i - last.i) * BEAT;
};
/** when the picture for verb i should be in place */
export const at = (i: number) => v(i) - LEAD;
/** when the picture for one of the closing hits should be in place */
export const hit = (k: keyof OnsetFile['hits']) => O.hits[k] - O.filmStartSrc - LEAD;
export const END = O.end - O.filmStartSrc;
export const DURATION = Math.round(END * FPS);
