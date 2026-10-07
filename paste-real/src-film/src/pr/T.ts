// Every cue in the film, in film seconds, pinned to the ALL CAPS grid (src/cues.json, made by music/edit.py).
// at(bar, beat) is the downbeat of `bar` plus (beat - 1) beats. Visual hits lead the audio by about a frame (E),
// because a cue lands on the next frame boundary.
import {at, BEAT, CUES} from '../lib/beat';

export const E = 0.012;
export const W = 1080;
export const H = 1920;
export const DUR = CUES.duration; // 27.696 s: song from src 4.10 (0.7 s before the drums) to its own stop (src 31.58)

export const T = {
	// ---- 1. THIS IS A SCREENSHOT. (Quick Look) -> NOW IT'S EDITABLE. (Paste Real canvas)
	// frame 0 is mid-drag: the marquee is already moving, and it releases on the drums at 0.7 s
	hud: -0.3, // ⌃⇧2 hud pill
	grabOn: -0.3, // dim + crosshair
	dragA: -0.4,
	dragB: at(1) - 0.14,
	grab: at(1) - E, // release on the drums (0.685)
	scan: at(1), // shimmer sweep
	detect: [at(1, 1.25), at(1, 1.5), at(1, 1.75), at(1, 2)], // outline: headline, shoe, details, cta
	explode: at(1) + 0.15, // layers lift apart through the kick on the and of 1
	peak: at(1, 2) - E, // fully apart on the snare
	land: at(1, 2.5) - E, // flat again, canvas chrome in: the loop drops in (1.726)
	selHead: at(1, 3) - E, // double-click the headline (2.056)
	typeA: at(1, 3) + 0.06,
	typeB: at(2) - 0.12, // typed by 3.320
	capsBtn: at(2) + 0.1, // cursor heads for the AA button
	caps: at(2, 2) - E, // ALL CAPS on the snare (4.111)
	shoeDown: at(2, 2.5), // press on the shoe
	drag2A: at(2, 3) - E, // drag on the kick (4.798)
	drag2B: at(2, 3) + 0.48,
	color: at(2, 4) - E, // recolor on beat 4 (5.484)
	// ---- 2. FIGMA
	s2: at(3) - E, // 6.173
	grab2On: at(3) + 0.05,
	drag3A: at(3) + 0.14,
	drag3B: at(3, 2) - 0.08,
	grab2: at(3, 2) - E, // snare (6.859)
	keys2: at(3, 2) + 0.3,
	paste2: at(3, 3) - E, // ⌘V on the kick (7.546)
	resizeA: at(4) - E, // drag the frame edge on bar 4 (8.919)
	resizeB: at(4) + 0.75,
	resize2A: at(4, 3) - E,
	resize2B: at(4, 3) + 0.5,
	// ---- 3. KEYNOTE
	s3: at(5) - E, // 11.663
	grab3On: at(5) + 0.06,
	drag4A: at(5) + 0.14,
	drag4B: at(5, 2) - 0.08,
	grab3: at(5, 2) - E, // snare (12.349)
	keys3: at(5, 2) + 0.28,
	paste3: at(5, 3) - E, // ⌘V (13.035)
	barClick: at(6) - E, // click the bar on bar 6 (14.409)
	retypeA: at(6) + 0.18,
	grow: at(6, 2) - E, // the bar grows on the snare (15.095)
	play: at(6, 4) - E, // Play: the edited slide goes full screen on beat 4
	// ---- 4. ANY APP (one paste per beat)
	s4: at(7) - E, // 17.154
	cuts: [at(7, 1), at(7, 2), at(7, 3), at(7, 4), at(8, 1), at(8, 2), at(8, 3)].map((t) => t - E),
	stop: CUES.stops[0].from - E, // 21.678: the song stops dead
	slam: CUES.stops[0].to - E, // 22.637: back in on bar 9
	end: at(10) - E, // 25.388: end card
	out: DUR - 0.2, // the song's second stop: silence to the end
};

export {at, BEAT};
