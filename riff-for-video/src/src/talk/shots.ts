import {staticFile} from 'remotion';
import SHOTS from './shots.json';

// The footage: vertical 1080x1920 frames of each shot at its own frame rate (tools/footage/talk.py), in the final
// grade ("neon"); the opening shot also has its raw look ("flat") and full 16:9 frames ("wide") for the reframe.
export type ShotId = keyof typeof SHOTS;
type Info = {clip: string; src0: number; fps: number; n: number; looks: string[]; wide: number; keys: [number, number][]; W: number; H: number};
export const shot = (id: ShotId): Info => SHOTS[id] as unknown as Info;

const pad4 = (n: number) => String(n).padStart(4, '0');

/** the frame(s) of a shot at `s` seconds into it: index a, the next one b and how far between them (for slow motion) */
export const frameAt = (id: ShotId, s: number, look = 'neon', blend = false) => {
	const info = shot(id);
	const n = look === 'wide' ? info.wide : info.n;
	const x = Math.max(0, Math.min(n - 1, s * info.fps));
	const a = blend ? Math.floor(x) : Math.round(x);
	const b = Math.min(n - 1, a + 1);
	return {a: staticFile(`n/${id}/${look}/${pad4(a + 1)}.jpg`), b: staticFile(`n/${id}/${look}/${pad4(b + 1)}.jpg`), f: blend ? x - Math.floor(x) : 0};
};

/** where the vertical crop of a shot is centred at s seconds into it (0..1 of the 16:9 frame), as in talk.py */
export const cropX = (id: ShotId, s: number) => {
	const info = shot(id);
	const k = info.keys;
	const T = info.src0 + s;
	if (T <= k[0][0]) return k[0][1];
	for (let i = 0; i < k.length - 1; i++) {
		if (T <= k[i + 1][0]) return k[i][1] + ((k[i + 1][1] - k[i][1]) * (T - k[i][0])) / (k[i + 1][0] - k[i][0]);
	}
	return k[k.length - 1][1];
};

/** thumbnail of a shot (its frame at s) for the timeline */
export const thumb = (id: ShotId, s = 0.3) => frameAt(id, s).a;
