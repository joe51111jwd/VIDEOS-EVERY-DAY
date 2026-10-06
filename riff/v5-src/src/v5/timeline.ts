// Pure timing data for the v5 film (no React, no DOM), so scripts can read it too: npx esbuild ... | node
import cues from './cues.json';
import sfxMeta from './sfx_meta.json';

// ------------------------------------------------------------------ voice cue sheet (start/end seconds per line)
export type Line = {id: string; who: 'Maya' | 'Riff'; text: string; a: number; b: number; words?: number[]};
export const LINES = cues as Line[];
export const L = (id: string) => LINES.find((l) => l.id === id)!;
// end card lands 0.6 s after the last line; its type is all in ~3.2 s later, then a short hold
export const V5_DURATION = Math.min(40, Math.round((L('love').b + 0.6 + 4.7) * 30) / 30);

// ------------------------------------------------------------------ when things happen
export const T = {
	site: {
		image: -0.15, // already developing on frame 0, so the very first frame is a design being made
		nav: 0.1,
		eyebrow: 0.4,
		head: 0.5,
		body: 0.9,
		ctas: 1.05,
		card: 1.25,
		pill: 1.4,
		warm: L('warm').a + 0.3,
		big: L('big').a + 0.4,
		menu: L('menu').a + 0.45,
	},
	pullback: [L('app?').a + 0.25, L('app?').a + 1.65] as [number, number],
	title: [L('app?').b + 0.15, L('yes').a - 0.25] as [number, number],
	home: L('onit').a + 0.15,
	menuS: L('onit').a + 0.55,
	order: L('onit').a + 0.95,
	usual: L('sure').a + 0.35,
	poster: L('bold').a + 0.3,
	cup: L('cup').a + 0.55,
	story: L('yes2').a + 0.15,
	extras: L('extras').a + 0.3,
	end: L('love').b + 0.6,
};

// ------------------------------------------------------------------ sound design
// ElevenLabs SFX in public/v5/sfx/<name>.wav, all levelled to the same loudness at ingest, so v compares across effects.
// Whooshes are placed so their loudest point meets the middle of the camera move they ride.
export const META = sfxMeta as Record<string, {dur: number; peak_t: number}>;
const pk = (f: string) => META[f]?.peak_t ?? 0;
export type Sfx = {t: number; f: string; v: number};
const whoosh = (mid: number, big: boolean, v: number): Sfx => {
	const f = big ? 'whoosh_soft_1' : 'whoosh_soft_2';
	return {t: mid - pk(f), f, v};
};
export const SFX: Sfx[] = [
	{t: 0.0, f: 'shimmer_2', v: 0.2},
	{t: T.site.nav, f: 'tap_glass_2', v: 0.2},
	{t: T.site.head, f: 'tap_glass_2', v: 0.22},
	{t: T.site.card, f: 'pop_soft_1', v: 0.55},
	{t: T.site.warm, f: 'shimmer_1', v: 0.24},
	{t: T.site.big, f: 'pop_soft_2', v: 0.65},
	whoosh(T.site.menu + 0.1, false, 0.22),
	whoosh((T.pullback[0] + T.pullback[1]) / 2, true, 0.32),
	{t: T.title[0] - pk('riser_2'), f: 'riser_2', v: 0.3}, // swells into the cut to the title card
	{t: T.title[0], f: 'boom_logo_2', v: 0.55},
	whoosh(T.home - 0.15, true, 0.3),
	{t: T.home, f: 'pop_soft_1', v: 0.5},
	{t: T.menuS, f: 'pop_soft_2', v: 0.55},
	{t: T.order, f: 'pop_soft_1', v: 0.5},
	whoosh(T.usual - 0.5, false, 0.24),
	{t: T.usual + 0.16, f: 'pop_soft_1', v: 0.65},
	whoosh(L('perfect').b + 0.58, false, 0.22),
	whoosh(T.poster - 0.3, true, 0.3),
	{t: T.poster, f: 'paper_1', v: 0.3},
	{t: T.poster + 0.6, f: 'pop_soft_2', v: 0.55},
	whoosh(T.cup - 0.25, false, 0.2),
	{t: T.cup, f: 'cup_down_1', v: 0.32},
	{t: T.story, f: 'paper_2', v: 0.28},
	whoosh(T.extras + 0.15, true, 0.3),
	{t: T.extras + 0.1, f: 'paper_1', v: 0.24},
	{t: T.extras + 0.35, f: 'pop_soft_1', v: 0.45},
	{t: T.extras + 0.6, f: 'paper_2', v: 0.22},
	{t: T.extras + 0.85, f: 'pop_soft_2', v: 0.5},
	{t: T.end + 0.77, f: 'boom_logo_2', v: 0.45}, // with the music's last hit, as the wordmark lands
	{t: T.end + 1.5, f: 'shimmer_1', v: 0.18},
];
