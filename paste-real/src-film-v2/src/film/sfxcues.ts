// The sound-effect cue sheet, computed from the same timing as the picture (run with node; writes JSON).
import {BEAT} from '../lib/beat';
import {E, F, M, O, S2, S3, T} from './timing';

type Ev = [number, string, number]; // time, sound, gain dB
const ev: Ev[] = [];
const add = (t: number, s: string, g = 0) => ev.push([t, s, g]);
const keys = (t: number, g = 0) => {
	add(t - 0.035, 'key_mod', g - 4);
	add(t, 'key', g);
};
const typing = (t0: number, n: number, per: number, g = -6) => {
	for (let i = 0; i < n; i++) add(t0 + i * per, 'tick', g - (i % 3) * 1.5);
};

// ---------------- hook
add(T.hover, 'snap', -4);
keys(T.copy);
add(T.copy + 0.12, 'copied', -2);
add(T.lift, 'whoosh', -6);
add(T.focusFig, 'click');
keys(T.paste);
add(T.land, 'land');
add(T.land + 0.05, 'sweep', -8);
add(T.selHead, 'click');
add(T.dbl1, 'click', -2);
add(T.dbl2, 'click', -2);
typing(T.typeA + 0.16, 11, 0.085);
add(T.recolorSel, 'click');
add(T.fillClick, 'click');
typing(T.fillClick + 0.07, 6, 0.024, -9);
add(T.recolor, 'key', -4);
add(T.canSel, 'click');
add(T.moveCan, 'click', -3);
add(T.moveEnd, 'release', -4);
add(T.resizeSel, 'click', -3);
add(T.resize, 'release', -4);
// ---------------- scene 2
add(S2.hover, 'snap', -4);
keys(S2.copy);
add(S2.copy + 0.12, 'copied', -2);
add(S2.lift, 'whoosh', -6);
add(S2.focus, 'click');
keys(S2.paste);
add(S2.land, 'land');
add(S2.land + 0.05, 'sweep', -10);
add(S2.editBtn, 'click');
add(S2.win, 'window', -6);
add(S2.dbl1, 'click', -2);
add(S2.dbl2, 'click', -2);
typing(S2.type, 2, 0.1, -5);
add(S2.ret, 'key', -3);
add(S2.ret + 0.02, 'grow', -6);
// ---------------- scene 3
add(S3.hover, 'snap', -4);
keys(S3.copy);
add(S3.copy + 0.12, 'copied', -2);
add(S3.lift, 'whoosh', -6);
add(S3.focus, 'click');
keys(S3.paste);
add(S3.land, 'land');
add(S3.land + 0.03, 'code', -8);
add(S3.tab, 'click');
add(S3.hmr, 'sweep', -8);
// ---------------- montage
for (const tp of [M.a, M.b, M.c]) {
	keys(tp, -1);
	add(tp + M.land, 'land', -1);
}
// ---------------- the stop (the song is silent: these are heard alone)
add(F.grab, 'snap', 0);
keys(F.fillAt - 0.02, 2);
add(F.slam, 'boom', -8);
F.cards.forEach((c, i) => add(c - 0.02, 'card', -8 - (i % 2) * 2));
add(F.grid, 'sweep', -6);
add(F.lockup, 'land', -2);
// ---------------- outro
add(O.draw, 'sweep', -12);
O.items.forEach((t) => add(t - 0.04, 'tick_glass', -12));
add(O.trumpets - 2.04, 'riser', -16);
add(O.trumpets, 'boom', -10);
O.keys.forEach((t, i) => add(t, 'key', -10 - (i % 2)));
add(O.high, 'land', -8);

console.log(JSON.stringify({beat: BEAT, E, events: ev.sort((a, b) => a[0] - b[0])}));
