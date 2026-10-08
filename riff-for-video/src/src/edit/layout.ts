// Geometry of the vertical frame (1080x1920) and the Riff editor window inside it.
export const WIN = {x: 24, y: 64, w: 1032, h: 1180, r: 26};
export const TB = 52; // title bar
export const VIEW = {y: 52, h: 580};
export const TRANS = {y: 632, h: 62};
export const TL = {y: 694, h: 486};
export const HEAD_W = 96;
export const TL_W = WIN.w - HEAD_W;
/** the playhead stays fixed at the centre of the timeline area; the edit scrolls under it */
export const PHX = HEAD_W + TL_W / 2;
export const PPS = 92; // timeline px per second
// lanes, relative to TL.y
export const LANE = {
	ruler: {y: 0, h: 34},
	v3: {y: 40, h: 38},
	v2: {y: 82, h: 38},
	v1: {y: 124, h: 120},
	a1: {y: 248, h: 54},
	a2: {y: 306, h: 96},
	foot: {y: 410, h: 76},
};
export const HUD_Y = 1306; // centre of the caption pill
export const PAD = {x: 540 - 306, y: 1392, w: 612, h: 440}; // the trackpad
