// prints the talk cut's sound cues as JSON for tools/mix.py
import {DURATION} from '../src/talk/beat';
import {MUSIC} from '../src/talk/music';
console.log(JSON.stringify({duration: DURATION, voice: [], sfx: [], music: MUSIC}));
