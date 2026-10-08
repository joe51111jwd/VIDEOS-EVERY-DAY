// Sound cues (film seconds). tools/cues.ts exports these with the voice lines for tools/mix.py.
import {ACT, BEAT} from './timing';
import {END_AT} from './Finale';

export const SFX: [number, string, number][] = [
	[ACT.cut, 'click_1', 0.9],
	[ACT.cut + 0.02, 'tick_1', 0.5],
	[ACT.lift, 'whoosh_soft_1', 0.35],
	[ACT.ripple + 0.3, 'thock_1', 0.45],
	[ACT.grade, 'shimmer_1', 0.45],
	[ACT.rewind, 'whoosh_1', 0.5],
	[ACT.restore + 0.05, 'pop_soft_1', 0.55],
	[ACT.trim + 0.05, 'click_1', 0.6],
	[ACT.markIn, 'tick_1', 0.7],
	[ACT.markOut, 'tick_1', 0.7],
	[ACT.slow, 'whoosh_soft_2', 0.4],
	[ACT.colorOpen, 'paper_1', 0.35],
	[ACT.teal, 'shimmer_1', 0.4],
	[ACT.less, 'tick_1', 0.45],
	[ACT.colorClose, 'whoosh_soft_1', 0.3],
	[ACT.browserOpen, 'paper_1', 0.3],
	[ACT.match, 'tap_glass_1', 0.6],
	[ACT.fly, 'whoosh_soft_2', 0.35],
	[ACT.insert, 'thock_1', 0.6],
	// the cuts snapping to the beat
	...[0, 1, 2, 3, 4, 5].map((k): [number, string, number] => [ACT.beat + 0.06 * k, 'tick_1', 0.35]),
	[ACT.crop, 'click_1', 0.6],
	[ACT.expand - 1.6, 'riser_1', 0.35],
	[ACT.expand, 'whoosh_1', 0.55],
	[END_AT, 'boom_logo_1', 0.5],
];

/** temp music (James is sending the real song): which second of temp.wav plays at film 0 */
export const MUSIC = {file: 'temp', offset: 1.65, gain: 0.55, duck: 0.45, fadeOut: [30.4, 31.2], beat: BEAT};
