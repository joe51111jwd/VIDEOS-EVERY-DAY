// prints the sound cues as JSON for tools/mix.py
import {LINES, DURATION} from '../src/edit/timing';
import {SFX, MUSIC} from '../src/edit/sfx';
console.log(JSON.stringify({duration: DURATION, voice: LINES.map((l) => ({id: l.id, a: l.a, b: l.b})), sfx: SFX, music: MUSIC}));
