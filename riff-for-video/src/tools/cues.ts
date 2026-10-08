// prints the sound cues as JSON for tools/mix.py
import {DURATION} from '../src/edit/timing';
import {SFX, MUSIC} from '../src/edit/sfx';
console.log(JSON.stringify({duration: DURATION, voice: [], sfx: SFX, music: MUSIC}));
