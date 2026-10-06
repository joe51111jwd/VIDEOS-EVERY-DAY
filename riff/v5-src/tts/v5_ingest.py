# Turns the ElevenLabs deliveries in /mnt/project-files/riff/voices/ into per-line clips for v5_mix.py.
#   bvenv/bin/python tts/v5_ingest.py dialogue 1     -> splits dialogue_v3_take1 at its voice segments
#   bvenv/bin/python tts/v5_ingest.py v2_primary     -> uses the per-line files in voices/v2_primary/
# Writes public/v5/vo/<id>.wav (mono 44.1 kHz) and tts/v5_words.json (word start offsets inside each clip, seconds).
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf

ROOT = '/mnt/project-files/riff/voices'
SR = 44100
spec = json.load(open('/mnt/project-files/riff/voice-lines.json'))
LINES = spec['lines']
os.makedirs('public/v5/vo', exist_ok=True)


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def words_from_alignment(chars, starts, lo, hi):
    """start time of each spoken word in chars[lo:hi], skipping [audio tags]"""
    out, inside, prev_space = [], False, True
    for k in range(lo, hi):
        ch = chars[k]
        if ch == '[':
            inside = True
            continue
        if ch == ']':
            inside = False
            prev_space = True
            continue
        if inside:
            continue
        if ch.isspace():
            prev_space = True
            continue
        if prev_space:
            out.append(starts[k])
        prev_space = False
    return out


words = {}
mode = sys.argv[1] if len(sys.argv) > 1 else 'dialogue'
if mode == 'dialogue':
    take = sys.argv[2] if len(sys.argv) > 2 else '1'
    audio = decode(f'{ROOT}/dialogue_v3_take{take}.mp3')
    meta = json.load(open(f'{ROOT}/dialogue_v3_take{take}.json'))
    al = meta.get('alignment') or meta.get('normalized_alignment')
    chars, cs = al['characters'], al['character_start_times_seconds']
    segs = meta['voice_segments']
    # one segment per dialogue input (merge if the API split an input into several)
    by_input = {}
    for sgm in segs:
        i = sgm.get('dialogue_input_index', len(by_input))
        g = by_input.setdefault(i, {'a': sgm['start_time_seconds'], 'b': sgm['end_time_seconds'], 'lo': sgm.get('character_start_index', 0), 'hi': sgm.get('character_end_index', 0)})
        g['a'] = min(g['a'], sgm['start_time_seconds'])
        g['b'] = max(g['b'], sgm['end_time_seconds'])
        g['lo'] = min(g['lo'], sgm.get('character_start_index', g['lo']))
        g['hi'] = max(g['hi'], sgm.get('character_end_index', g['hi']))
    assert len(by_input) == len(LINES), f'{len(by_input)} segments for {len(LINES)} lines'
    for i, ln in enumerate(LINES):
        g = by_input[i]
        a0 = max(0.0, g['a'] - 0.06)
        a1 = g['b'] + 0.12
        seg = audio[int(a0 * SR): int(a1 * SR)]
        sf.write(f"public/v5/vo/{ln['id']}.wav", seg, SR)
        words[ln['id']] = [round(w - a0, 3) for w in words_from_alignment(chars, cs, g['lo'], g['hi'])]
else:
    folder = f'{ROOT}/{mode}'
    for ln in LINES:
        seg = decode(f"{folder}/{ln['id']}.mp3")
        sf.write(f"public/v5/vo/{ln['id']}.wav", seg, SR)
        words[ln['id']] = []  # no alignment from the plain TTS endpoint; captions fall back to even timing

for ln in LINES:
    n = len(ln['text'].split())
    if words.get(ln['id']) and len(words[ln['id']]) != n:
        print(f"note: {ln['id']}: {len(words[ln['id']])} aligned words vs {n} caption words; using even timing")
        words[ln['id']] = []
json.dump(words, open('tts/v5_words.json', 'w'), indent=1)
print('wrote', len(LINES), 'clips from', mode)
