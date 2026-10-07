// Every cue in the film, in film seconds, read off the song (src/cues.json, written by music/edit.py).
// at(bar, beat) = a time on the song's grid; E = visuals land 12 ms ahead of the audio.
import {at, BEAT, CUES} from '../lib/beat';

export const E = 0.012;
const O = (CUES as unknown as {outro: {in: number; trumpets: number; high: number; fade: number; beats: number[]}}).outro;

export const T = {
	// ---------------- hook: ⌘C an ad in Safari, ⌘V into Figma, it's real
	hover: 0.0, // Paste Real's outline is already on the ad at frame 0
	copy: at(1) - E, // ⌘C on the drums
	lift: at(1, 2) - E, // the copy lifts off and docks in the keystroke pill (snare)
	focusFig: at(1, 3) - 0.13, // click into Figma
	paste: at(1, 3) - E, // ⌘V
	land: at(1, 3) + BEAT / 4 - E, // lands one sixteenth later, as real layers
	// ---------------- edits (each lands on a snare)
	selHead: at(1, 4) - E,
	dbl1: at(2) - 0.13,
	dbl2: at(2) - 0.02,
	typeA: at(2) - E, // double-click, select all, retype
	recolorSel: at(2, 3) - E,
	fillClick: at(2, 4) - 0.2,
	recolor: at(2, 4) - E,
	canSel: at(3) - 0.2, // click the can
	moveCan: at(3) - E, // rotate it
	moveEnd: at(3, 2) - E,
	resizeSel: at(3, 3) - E,
	resize: at(3, 4) - E,
	scene2: at(4) - E,
	// ---------------- outro
	silence: 27.476,
	outroIn: O.in,
	trumpets: O.trumpets,
	high: O.high,
	fade: O.fade,
	outroBeats: O.beats,
	DUR: CUES.duration,
};
