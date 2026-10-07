// Every scene's cue times in film seconds, in one pure module (no React) so the sound mix can read them too.
import {at, BEAT} from '../lib/beat';
import {E, T} from './T';

export {E, T};

// scene 2: a chart in a video -> Keynote
export const S2 = {
	start: at(4) - E,
	hover: at(4) + 0.2,
	copy: at(4, 2) - E,
	lift: at(4, 3) - E,
	focus: at(4, 4) - 0.13,
	paste: at(4, 4) - E,
	land: at(4, 4) + BEAT / 4 - E,
	editBtn: at(5) - 0.13,
	win: at(5) - E,
	dbl1: at(5, 2) - 0.14,
	dbl2: at(5, 2) - 0.03,
	type: at(5, 2) + 0.03,
	ret: at(5, 3) - E,
	end: at(6) - E,
};

// scene 3: a website -> VS Code -> localhost
export const S3 = {
	start: at(6) - E,
	hover: at(6) + 0.2,
	copy: at(6, 2) - E,
	lift: at(6, 3) - E,
	focus: at(6, 4) - 0.13,
	paste: at(6, 4) - E,
	land: at(6, 4) + BEAT / 4 - E,
	compiled: at(7) - E,
	tab: at(7, 2) - 0.14,
	hmr: at(7, 2) - E,
	hover2: at(7, 3) - E,
	end: at(8) - E,
};

// montage: Slides, Canva, Sheets
export const M = {
	start: at(8) - E,
	a: at(8) - E,
	b: at(8, 2) - E,
	c: 21.1 - E,
	end: 21.69,
	land: BEAT / 4,
};

// the stop, the slam, the destinations, the name
export const F = {
	stop: 21.69,
	grab: 22.06,
	fillAt: 22.5,
	slam: at(9) - E,
	cards: [at(9, 2) - E, at(9, 2.5) - E, at(9, 3) - E, at(9, 4) - E, at(9, 4.5) - E, at(10) - E],
	grid: at(10, 1.5) - E,
	lockup: 26.76 - E,
	punch: 27.11 - E,
	silence: T.silence,
	end: T.outroIn,
};

// the finale over the song's trumpets: every stab is a paste
export const O = {
	in: T.outroIn,
	stabs: T.stabs,
	noteEnd: T.noteEnd,
	end: T.DUR,
};
