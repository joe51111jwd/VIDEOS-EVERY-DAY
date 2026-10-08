// The script: when each spoken edit starts, and when Riff carries it out (film seconds).
// No React/DOM imports, so the audio tools can read it too.
import vo from './vo.json';

type VO = Record<string, {text: string; dur: number; words: [string, number, number][]}>;
export const VOICE = vo as unknown as VO;

/** voice line start times (s) */
export const LINE_AT: Record<string, number> = {
	cut: 0.15,
	lose: 1.0,
	moody: 2.0,
	back: 3.95,
	remove: 5.7,
	trim: 7.75,
	here: 9.85,
	there: 11.15,
	color: 12.35,
	teal: 13.6,
	less: 15.0,
	goback: 16.25,
	smile: 17.95,
	beat: 20.75,
	vertical: 22.2,
};

export type Line = {id: string; text: string; a: number; b: number; words: number[]};
export const LINES: Line[] = Object.entries(LINE_AT).map(([id, a]) => {
	const v = VOICE[id];
	const n = v.text.split(' ').length;
	// caption word times: transcript times when the word counts match, else spread evenly
	const ws = v.words.length === n ? v.words.map((w) => a + w[1]) : new Array(n).fill(0).map((_, k) => a + (k * v.dur * 0.8) / n);
	return {id, text: v.text, a, b: a + v.dur, words: ws};
});

/** what Riff does, and when */
export const ACT = {
	cut: 0.78,
	loseSel: 1.38,
	lift: 1.62,
	ripple: 1.78,
	grade: 2.92,
	rewind: 4.78,
	toCut: 6.15,
	restore: 7.2,
	heal: 7.6,
	trim: 9.62,
	markIn: 10.6,
	markOut: 11.35,
	slow: 11.55,
	whip: 11.95,
	colorOpen: 13.05,
	teal: 14.25,
	less: 15.62,
	colorClose: 17.75,
	browserOpen: 19.35,
	scan: 19.5,
	match: 20.0,
	fly: 20.35,
	insert: 20.6,
	beat: 21.62,
	crop: 23.85,
	expand: 24.35,
	full: 24.95,
	endCard: 28.2,
};

/** temp track tempo; replaced by the song's beat map once James sends the song */
export const BPM = 112;
export const BEAT = 60 / BPM;
export const BEAT0 = 0;

export const DURATION = 31.2;
