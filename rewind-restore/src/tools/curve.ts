// prints the audio plan: which second of the song plays at each film moment (the scratch follows the playhead)
import {worldAt, KEYS, RW, HOOK, MONT, END, DETAIL, B} from '../src/film/plan';
const fs = 1000;
const curve: number[] = [];
for (let i = Math.round(RW.drag0 * fs); i <= Math.round(RW.drag1 * fs); i++) curve.push(+worldAt(i / fs).toFixed(5));
console.log(JSON.stringify({B, keys: KEYS, rw: RW, hook: HOOK, mont: MONT, end: END, detail: DETAIL, curveFs: fs, curveA: RW.drag0, curve}));
