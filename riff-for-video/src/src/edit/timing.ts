// The script on the song's beat grid: the cold open, every spoken command (shown, never heard) and the
// moment Riff carries it out (film seconds). One cut per song; pick it with --props='{"song":"nysom"}'
// (or SONG=nysom for the node tools). Film 0 sits on a beat of the song.
import {getInputProps} from 'remotion';

export type SongId = 'skin' | 'nysom';
const pickSong = (): SongId => {
	const env = typeof process !== 'undefined' ? process.env?.SONG : undefined;
	if (env === 'skin' || env === 'nysom') return env;
	try {
		if ((getInputProps() as {song?: string}).song === 'nysom') return 'nysom';
	} catch {
		// node tools without input props
	}
	return 'skin';
};

type Plan = {
	title: string;
	/** seconds per beat, measured on the song's drum stem */
	beat: number;
	/** second of the instrumental excerpt (tools/song.py) that plays at film 0 */
	start: number;
	/** when each event lands, in beats (endCard: the stat comes up; slam: the brand takes over) */
	at: {
		pull0: number; pull1: number; rew0: number; rew1: number;
		cut: number; lose: number; moody: number; back: number; undo: number; trim: number; here: number; there: number;
		color: number; teal: number; less: number; smile: number; insert: number; beat: number; vertical: number; expand: number;
		endCard: number; slam: number; end: number;
	};
	/** seconds: the drop, where the camera finishes pushing into the vertical cut */
	full: number;
	/** seconds after the last downbeat: the drums cut out over this window (before their next hit), the rest rings */
	drumsOut: [number, number];
	/** the vertical cut after the push-in: shot, beat, first frame (public/v/<shot>/) */
	shots: [string, number, number][];
};

const PLANS: Record<SongId, Plan> = {
	// Kanye West, "Black Skinhead": the drums stop under the pull-back and slam back in on "Cut here.";
	// the bass drop lands the push-in, "50% faster" sits in the stop at bar 56, Riff comes in with the drums at 60
	skin: {
		title: 'Black Skinhead',
		beat: 0.4615,
		start: 4.961,
		at: {
			pull0: 4, pull1: 5.1, rew0: 6.5, rew1: 9,
			cut: 12, lose: 14, moody: 16, back: 18, undo: 20, trim: 22, here: 24, there: 25.33,
			color: 27, teal: 28.5, less: 30, smile: 32, insert: 34, beat: 36, vertical: 39, expand: 42,
			endCard: 56, slam: 60, end: 64,
		},
		full: 20.0,
		drumsOut: [0.11, 0.17],
		shots: [
			['v2', 46, 20],
			['v3', 48, 20],
			['v4', 50, 20],
			['v5', 52, 1],
			['v6', 54, 1],
			['v4', 60, 34],
			['v3', 62, 22],
		],
	},
	// Nas, "N.Y. State of Mind": starts on the hook, the bass drops out at bar 16 (on "Trim two seconds.") and comes
	// back at 32 on the push-in. Lands sit on the loop's real hits: downbeats, snares and the swung kick at x.3
	nysom: {
		title: 'N.Y. State of Mind',
		beat: 0.71027,
		start: 2.109,
		at: {
			pull0: 4, pull1: 4.96, rew0: 5.75, rew1: 7.5,
			cut: 9, lose: 10.3, moody: 12, back: 13, undo: 14.3, trim: 16, here: 17, there: 18.3,
			color: 20, teal: 21, less: 22.3, smile: 24, insert: 25.5, beat: 27, vertical: 29, expand: 31,
			endCard: 38, slam: 40, end: 44,
		},
		full: 22.7,
		drumsOut: [0.2, 0.3],
		shots: [
			['v2', 34, 20],
			['v3', 35, 24],
			['v4', 36, 20],
			['v5', 37, 1],
			['v6', 38, 1],
			['v3', 42, 8],
		],
	},
};

export const SONG: SongId = pickSong();
export const PLAN = PLANS[SONG];
export const BEAT = PLAN.beat;
export const BPM = 60 / BEAT;
export const BEAT0 = 0;
const A = PLAN.at;
const b = (n: number) => BEAT0 + n * BEAT;
/** the smile search runs between the browser opening and the insert */
const SG = b(A.insert) - b(A.smile);

export const ACT = {
	// cold open: the finished vertical edit, pull back into Riff, rewind it to raw
	pull0: b(A.pull0),
	pull1: b(A.pull1),
	rew0: b(A.rew0),
	rew1: b(A.rew1),
	// the build
	cut: b(A.cut),
	loseSel: b(A.lose) - 0.12,
	lift: b(A.lose),
	ripple: b(A.lose) + 0.16,
	grade: b(A.moody),
	rewind: b(A.back),
	restore: b(A.undo),
	heal: b(A.undo) + 0.4,
	trim: b(A.trim),
	markIn: b(A.here),
	markOut: b(A.there),
	slow: b(A.there) + 0.27,
	whip: b(A.there) + 0.45,
	colorOpen: b(A.color),
	teal: b(A.teal),
	less: b(A.less),
	colorClose: b(A.smile) - 0.11,
	browserOpen: b(A.smile),
	scan: b(A.smile) + 0.2 * SG,
	match: b(A.smile) + 0.5 * SG,
	fly: b(A.smile) + 0.75 * SG,
	insert: b(A.insert),
	beat: b(A.beat),
	crop: b(A.vertical),
	expand: b(A.expand),
	full: PLAN.full,
	endCard: b(A.endCard),
	slam: b(A.slam),
	end: b(A.end),
};

export type Cmd = {id: string; text: string; a: number; land: number};
/** seconds the line takes to fly from the pill to where it lands */
export const FLY = 0.3;
/** gap between words appearing, as if spoken */
export const WORD = 0.075;

const LINES: [string, string, number][] = [
	['cut', 'Cut here.', ACT.cut],
	['lose', 'Lose that.', ACT.loseSel],
	['moody', 'Make it moody.', ACT.grade],
	['back', 'Play that back.', ACT.rewind],
	['undo', 'Undo that cut.', ACT.restore],
	['trim', 'Trim two seconds.', ACT.trim],
	['here', 'Slow-mo from here…', ACT.markIn],
	['there', '…to there.', ACT.markOut],
	['color', 'Open color.', ACT.colorOpen],
	['teal', 'Deep teal.', ACT.teal],
	['less', 'Little less.', ACT.less],
	['smile', 'Find where she smiles.', ACT.browserOpen],
	['beat', 'Cut it to the beat.', ACT.beat],
	['vertical', 'Make it vertical.', ACT.crop],
];
/** what you say: the words show from `a` (as early as reading needs, after the last line has landed)
 * and the line flies off the pill and lands (the edit) at `land` */
export const CMDS: Cmd[] = LINES.map(([id, text, land], i) => {
	const words = text.split(' ').length;
	const want = FLY + WORD * (words - 1) + 0.42;
	const room = i > 0 ? land - LINES[i - 1][2] - 0.08 : want + 0.2;
	return {id, text, land, a: land - Math.min(want, room)};
});

/** the film ends this long after the final downbeat: the hit plays, the drums stop, the rest rings out (tools/mix.py) */
export const TAIL = 0.6;
export const DURATION = ACT.end + TAIL;
