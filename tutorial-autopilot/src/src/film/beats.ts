// Timing for the cut. The robot voice in Technologic says one "<verb> it" per beat;
// every action on screen lands on the first consonant of its verb (measured on the vocal stem).
// Until the song file is analysed this is a 127 BPM placeholder grid.
import onsetsJson from './onsets.json';

export const FPS = 30;
export const LEAD = 2 / FPS; // a word's picture is whole slightly before it is heard

type OnsetFile = {beat: number; filmStartSrc: number; verbs: {i: number; src: number}[]; end: number};
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
export const END = O.end - O.filmStartSrc;
export const DURATION = Math.round(END * FPS);
