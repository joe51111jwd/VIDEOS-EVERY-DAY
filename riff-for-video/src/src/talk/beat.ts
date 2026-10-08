// The talk cut (N.Y. State of Mind), on the song's beat grid. Film 0 is beat 120 of the song: the two-bar drum
// break before the piano and bass slam back in at beat 128. Every edit lands on a hit of the loop: kick on 0,
// snare on 1, the swung kick on 2.32, snare on 3, plus a kick on 0.5 in every second bar.

/** seconds per beat, measured on the drum stem (84.5 bpm) */
export const BEAT = 0.71029;
/** second of out/music/ny.wav (tools/song.py, the excerpt from 214 s of the song) at film 0 */
export const SONG0 = 221.6147 - 214.0;
/** film seconds of song beat n */
export const at = (n: number) => (n - 120) * BEAT;

export const T = {
	// the hook: drums only
	vertical: at(121),
	cine: at(123),
	slow: at(125),
	slam: at(128),
	// the editor
	pull: at(136),
	freeze: at(139),
	shake: at(141),
	title: at(145),
	push: at(148),
	// the finished edit, then the end card
	stat: at(156),
	brand: at(160),
	end: at(164),
};

/** the hits of the loop from beat a to beat b (film s), kicks and snares */
const hits = (a: number, b: number) => {
	const k: number[] = [];
	const s: number[] = [];
	for (let bar = a; bar < b; bar += 4) {
		k.push(at(bar), at(bar + 2.32));
		if ((bar / 4) % 2 === 1) k.push(at(bar + 0.5));
		s.push(at(bar + 1), at(bar + 3));
	}
	return {kicks: k.sort((x, y) => x - y), snares: s};
};
export const HITS = hits(120, 168);

/** the cuts land on the loop's hits: downbeat, snare, swung kick, snare (+ the extra kick every second bar) */
export const cutBeats = (bar0: number) => [bar0, bar0 + 1, bar0 + 2.32, bar0 + 3, bar0 + 4, bar0 + 4.5, bar0 + 5, bar0 + 6.32, bar0 + 7];

export type Line = {id: string; text: string; land: number; a: number};
/** gap between words appearing, as if spoken */
export const WORD = 0.085;
const LINES: [string, string, number][] = [
	['vertical', 'Make it vertical.', T.vertical],
	['cine', 'Make it cinematic.', T.cine],
	['slow', 'Slow it down.', T.slow],
	['beat', 'Cut it to the beat.', T.slam],
	['freeze', 'Freeze it here.', T.freeze],
	['shake', 'Shake on every kick.', T.shake],
	['title', 'Title it “New York.”', T.title],
];
/** what you say: the words come in as early as reading needs (the first line is up from frame 0), the edit lands on the hit */
export const LINES_AT: Line[] = LINES.map(([id, text, land], i) => {
	const words = text.split(' ').length;
	const want = 0.5 + WORD * (words - 1) + 0.35;
	const room = i > 0 ? land - LINES[i - 1][2] - 0.22 : land;
	return {id, text, land, a: i === 0 ? 0 : land - Math.min(want, room)};
});

export const TAIL = 0.6;
export const DURATION = T.end + TAIL;
