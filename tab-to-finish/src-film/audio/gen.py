# Generates the film's sound effects and score with ElevenLabs. Key from ELEVENLABS_API_KEY (or a file path in ELEVENLABS_KEY_FILE).
import json, os, sys, urllib.request, concurrent.futures as cf
KEY = os.environ.get('ELEVENLABS_API_KEY') or open(os.environ['ELEVENLABS_KEY_FILE']).read().strip()
HOST = 'https://api.us.elevenlabs.io'
OUT = os.path.join(os.path.dirname(__file__), 'raw')

def post(path, body, out):
    if os.path.exists(out) and os.path.getsize(out) > 1000:
        return out + ' (kept)'
    req = urllib.request.Request(HOST + path, data=json.dumps(body).encode(), headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=600) as r, open(out, 'wb') as f:
        f.write(r.read())
    return out

SFX = {
    'click': ('a single soft trackpad click, close mic, crisp and quiet, no reverb, isolated', 0.5),
    'key': ('a single soft MacBook keyboard key press, close mic, quiet and crisp, isolated, no reverb', 0.5),
    'chime': ('a soft elegant glassy UI notification chime, single gentle bell note, premium, warm, short natural decay', 1.6),
    'thock': ('one deep satisfying keyboard key press, a low solid creamy thock, single key, close mic, isolated', 0.7),
    'tick': ('a tiny soft clean digital tick, extremely short, UI sound, isolated, then silence', 0.5),
    'success': ('a warm soft success tone, two gentle rising notes, premium software UI, clean, short', 1.6),
    'whoosh': ('a soft airy short whoosh, subtle UI window transition, smooth', 0.8),
    'riser': ('a soft airy cinematic riser that swells and stops abruptly, subtle, tension, no drums', 2.6),
    'boom': ('a deep soft cinematic sub boom with a gentle glassy shimmer tail, logo reveal, elegant', 3.5),
}
PLAN = {
    'positive_global_styles': ['minimal modern electronic', 'Apple product commercial', 'premium', 'clean', 'instrumental', '110 bpm', 'warm analog synths', 'curious then euphoric'],
    'negative_global_styles': ['vocals', 'lyrics', 'aggressive', 'EDM drop wobble', 'lo-fi', 'heavy distortion', 'rock guitars'],
    'sections': [
        {'section_name': 'Intro', 'positive_local_styles': ['sparse soft plucked synth notes', 'quiet', 'curious', 'light ticking pulse', 'lots of space'], 'negative_local_styles': ['drums', 'bass drop', 'loud'], 'duration_ms': 8200, 'lines': []},
        {'section_name': 'Held breath', 'positive_local_styles': ['suspended chord swelling', 'filtered', 'anticipation', 'building tension', 'riser'], 'negative_local_styles': ['drums', 'melody resolution'], 'duration_ms': 3000, 'lines': []},
        {'section_name': 'Drive', 'positive_local_styles': ['sudden full arrival on the downbeat', 'driving pulsing synth arpeggio', 'tight punchy drums', 'bright', 'euphoric momentum', 'fast feeling'], 'negative_local_styles': ['slow intro', 'quiet start'], 'duration_ms': 7400, 'lines': []},
        {'section_name': 'Resolve', 'positive_local_styles': ['warm wide chords', 'satisfied', 'drums drop out', 'gentle'], 'negative_local_styles': ['busy drums'], 'duration_ms': 4100, 'lines': []},
        {'section_name': 'Outro', 'positive_local_styles': ['one final soft chord ringing out', 'elegant ending', 'fade to silence'], 'negative_local_styles': ['new melody', 'drums'], 'duration_ms': 4800, 'lines': []},
    ],
}

jobs = []
with cf.ThreadPoolExecutor(2) as ex:
    which = sys.argv[1:] or ['sfx', 'music']
    if 'sfx' in which:
        for name, (text, dur) in SFX.items():
            for v in (1, 2):
                jobs.append(ex.submit(post, '/v1/sound-generation', {'text': text, 'duration_seconds': dur, 'prompt_influence': 0.6}, f'{OUT}/{name}_{v}.mp3'))
    if 'music' in which:
        for v in (1, 2, 3):
            jobs.append(ex.submit(post, '/v1/music', {'composition_plan': PLAN, 'model_id': 'music_v1'}, f'{OUT}/music_{v}.mp3'))
    for j in cf.as_completed(jobs):
        try:
            print('ok', j.result())
        except Exception as e:
            body = getattr(e, 'read', lambda: b'')()
            print('ERR', e, body[:300])
