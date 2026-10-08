// prints the timeline around the vertical crop, to check the viewer shows the aerial (c1076) there
import {ACT, CMDS, DURATION, SONG} from '../src/edit/timing';
import {layoutAt, playheadAt, viewFrame} from '../src/edit/model';
const r = (x: number) => Math.round(x * 100) / 100;
console.log(SONG, 'duration', r(DURATION));
console.log(Object.entries(ACT).map(([k, v]) => `${k}=${r(v)}`).join(' '));
console.log(CMDS.map((c) => `${c.id}:${r(c.a)}->${r(c.land)}`).join(' '));
console.log(layoutAt(ACT.crop).map((g) => `${g.id}/${g.clip} x=${r(g.x)} d=${r(g.dur)} s=${r(g.s)}`).join('\n'));
for (let t = ACT.beat; t < ACT.full + 0.5; t += 0.25) {
	const f = viewFrame(t);
	console.log(r(t), 'T', r(playheadAt(t)), f.clip, f.idx, f.clip === 'c1076' ? `src ${r(1.5 + (f.idx - 1) / 30)}` : '');
}
