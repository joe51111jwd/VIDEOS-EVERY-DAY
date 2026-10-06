# Turns the ElevenLabs deliveries in /mnt/project-files/riff/voices/ into per-line clips for v5_mix.py.
#   bvenv/bin/python tts/v5_ingest.py maya=take3 riff=take3          -> each speaker from one source
#   bvenv/bin/python tts/v5_ingest.py maya=take3 riff=v2_alt bold=take2   -> plus per-line overrides
# Sources: take1..take3 (eleven_v3 dialogue, split at its voice segments), v2_primary, v2_alt (per-line files).
# Writes public/v5/vo/<id>.wav (mono 44.1 kHz) and tts/v5_words.json (word start offsets inside each clip, seconds).
# Word times come from the dialogue alignment, or from the speech-to-text pass in voices/stt/ for the per-line files.
import json, os, subprocess, sys
import numpy as np, soundfile as sf

ROOT = '/mnt/project-files/riff/voices'
SR = 44100
spec = json.load(open('/mnt/project-files/riff/voice-lines.json'))
LINES = spec['lines']
os.makedirs('public/v5/vo', exist_ok=True)


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def fades(a, fin=0.008, fout=0.025):
    a = a.copy(); i, o = min(len(a), int(fin * SR)), min(len(a), int(fout * SR))
    a[:i] *= np.linspace(0, 1, i); a[len(a) - o:] *= np.linspace(1, 0, o)
    return a


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


_takes = {}
def islands(audio, gap=0.16, thr_db=-40):
    """speech regions of a whole take, split wherever it stays quiet for at least `gap` seconds"""
    h = int(0.01 * SR); n = len(audio) // h
    e = np.sqrt(np.mean(audio[:n * h].reshape(n, h) ** 2, 1))
    on = 20 * np.log10(e / (np.percentile(e, 99) + 1e-12) + 1e-9) > thr_db
    out, k = [], 0
    while k < n:
        if not on[k]: k += 1; continue
        j = k
        while j < n and (on[j] or on[j:j + int(gap / 0.01)].any()): j += 1
        out.append([k * 0.01, j * 0.01]); k = j
    return out


def take(k):
    if k not in _takes:
        audio = decode(f'{ROOT}/dialogue_v3_take{k}.mp3')
        meta = json.load(open(f'{ROOT}/dialogue_v3_take{k}.json'))
        al = meta.get('alignment') or meta.get('normalized_alignment')
        ch, cs = al['characters'], al['character_start_times_seconds']
        by = {}
        for s in meta['voice_segments']:
            g = by.setdefault(s['dialogue_input_index'], {'a': s['start_time_seconds'], 'b': s['end_time_seconds'], 'lo': s['character_start_index'], 'hi': s['character_end_index']})
            g['a'] = min(g['a'], s['start_time_seconds']); g['b'] = max(g['b'], s['end_time_seconds'])
            g['lo'] = min(g['lo'], s['character_start_index']); g['hi'] = max(g['hi'], s['character_end_index'])
        assert len(by) == len(LINES), f'take{k}: {len(by)} segments for {len(LINES)} lines'
        # The returned segments are contiguous and their edges are coarse (a line's tail can spill into the next
        # segment), so cut on the real pauses instead: each speech island goes to the line it overlaps most,
        # where a line spans from its first aligned word to its segment end.
        for g in by.values():
            w = words_from_alignment(ch, cs, g['lo'], g['hi']); g['w0'] = w[0] if w else g['a']; g['isl'] = []
        for isl in islands(audio):
            ov = {i: min(isl[1], g['b']) - max(isl[0], g['w0']) for i, g in by.items()}
            best = max(ov, key=ov.get)
            if ov[best] <= 0: best = min(by, key=lambda i: abs(by[i]['w0'] - isl[0]))
            by[best]['isl'].append(isl)
        _takes[k] = (audio, al, by)
    return _takes[k]


_stt = {}
def stt_words(src, lid):
    if src not in _stt:
        p = f'{ROOT}/stt/{src}.json'
        _stt[src] = json.load(open(p)) if os.path.exists(p) else {}
    w = (_stt[src].get(lid) or {}).get('words') or []
    return [x['start'] for x in w if x.get('type', 'word') == 'word']


def _db(audio, t0, t1):
    h = int(0.01 * SR); a = audio[int(t0 * SR):int(t1 * SR)]; n = len(a) // h
    if n <= 0: return np.array([])
    e = np.sqrt(np.mean(a[:n * h].reshape(n, h) ** 2, 1)); return 20 * np.log10(e / (np.abs(audio).max() + 1e-12) + 1e-9)


def onset(audio, s0, lo):
    """walk back from the transcript's word start while the sound stays up (soft consonants start early)"""
    lo = max(lo, s0 - 0.3); d = _db(audio, lo, s0); k = len(d)
    while k > 0 and d[k - 1] > -42: k -= 1
    return lo + k * 0.01 - 0.03


def tail(audio, s1, hi):
    """let the last word ring out until it falls quiet"""
    hi = min(hi, s1 + 0.45); d = _db(audio, s1, hi); k = 0
    while k < len(d) and d[k] > -46: k += 1
    return s1 + k * 0.01 + 0.06


def take_words(src):
    """transcript words grouped per line, when the speech-to-text pass matches the script word for word"""
    if src not in _stt:
        p = f'{ROOT}/stt/{src}.json'
        _stt[src] = json.load(open(p)) if os.path.exists(p) else {}
    ws = [w for w in _stt[src].get('words', []) if w.get('type', 'word') == 'word']
    if len(ws) != sum(len(l['text'].split()) for l in LINES): return None
    out, k = [], 0
    for l in LINES:
        n = len(l['text'].split()); out.append(ws[k:k + n]); k += n
    return out


def clip(src, i, ln):
    """(audio, word starts relative to the clip) for line i from source src"""
    if src.startswith('take'):
        audio, al, by = take(src[4:])
        sw = take_words(src)
        if sw:  # speech-to-text word times: exact line spans
            ws = sw[i]; s0, s1 = ws[0]['start'], ws[-1]['end']
            prev_end = sw[i - 1][-1]['end'] if i > 0 else 0.0
            next_start = sw[i + 1][0]['start'] if i + 1 < len(sw) else len(audio) / SR
            a0 = max(onset(audio, s0, prev_end), (prev_end + s0) / 2)
            a1 = min(tail(audio, s1, next_start), (s1 + next_start) / 2)
            seg = fades(audio[int(a0 * SR): int(a1 * SR)])
            return seg, [round(max(0.0, w['start'] - a0), 3) for w in ws]
        g = by[i]
        isl = g['isl'] or [[g['w0'], g['b']]]
        prev_end = max([x[1] for j in by if j < i for x in by[j]['isl']] or [0.0])
        next_start = min([x[0] for j in by if j > i for x in by[j]['isl']] or [len(audio) / SR])
        a0 = max(isl[0][0] - 0.05, (prev_end + isl[0][0]) / 2)
        a1 = min(isl[-1][1] + 0.1, (isl[-1][1] + next_start) / 2)
        seg = fades(audio[int(a0 * SR): int(a1 * SR)])
        return seg, [round(max(0.0, w - a0), 3) for w in words_from_alignment(al['characters'], al['character_start_times_seconds'], g['lo'], g['hi'])]
    seg = fades(decode(f"{ROOT}/{src}/{ln['id']}.mp3"), 0.004, 0.02)
    return seg, [round(w, 3) for w in stt_words(src, ln['id'])]


pick = {'Maya': 'take3', 'Riff': 'take3'}; over = {}
for arg in sys.argv[1:]:
    k, v = arg.split('=')
    if k in ('maya', 'riff'): pick[k.capitalize()] = v
    else: over[k] = v

words, used = {}, {}
for i, ln in enumerate(LINES):
    src = over.get(ln['id'], pick[ln['speaker']])
    seg, w = clip(src, i, ln)
    sf.write(f"public/v5/vo/{ln['id']}.wav", seg, SR)
    n = len(ln['text'].split())
    if w and len(w) != n:
        print(f"note: {ln['id']}: {len(w)} timed words vs {n} caption words; captions use even timing")
        w = []
    words[ln['id']] = w; used[ln['id']] = src
json.dump(words, open('tts/v5_words.json', 'w'), indent=1)
json.dump(used, open('tts/v5_sources.json', 'w'), indent=1)
print('sources:', used)
