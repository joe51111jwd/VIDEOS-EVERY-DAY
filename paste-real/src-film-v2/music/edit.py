# Cuts the instrumental to the film: joins source segments at bar lines with short equal-power
# crossfades that end just before the incoming downbeat, so every transient survives.
#   python music/edit.py music/edl.json  ->  music/bed.wav (48 kHz stereo float) + src/cues.json (film time)
# edl.json: {"segments": [[src_from, src_to], ...], "tail": seconds of fade at the end, "gain_db": x,
#            "ending": {"stem": demucs stem aligned with the source, "from": src_t, "to": src_t}}  (optional)
# "ending" fades one stem out of the song between from and to (source time) and keeps it out: used to stop the
# band after the last trumpet stab while the held bass note rings out to its own end.
import json, sys, os
import numpy as np, soundfile as sf
D = os.path.dirname(os.path.abspath(__file__))
edl = json.load(open(sys.argv[1]))
src, SR = sf.read(f'{D}/allcaps_src48.wav', always_2d=True)
cues = json.load(open(f'{D}/cues_src.json'))
end = edl.get('ending')
if end:
    stem, _ = sf.read(f"{D}/{end['stem']}", always_2d=True)
    a, b = int(round(end['from'] * SR)), int(round(end['to'] * SR))
    out_gain = np.zeros(len(src))
    out_gain[a:b] = np.sin(np.linspace(0, 1, b - a) * np.pi / 2) ** 2
    out_gain[b:] = 1.0
    src = src - stem[:len(src)] * out_gain[:, None]
XF = int(0.010 * SR)      # crossfade length
PRE = int(0.004 * SR)     # crossfade ends this long before the join point (incoming transient intact)
segs = edl['segments']
out = []
film_t = 0.0
mapping = []              # (film_from, film_to, src_from)
for i, (a, b) in enumerate(segs):
    ia, ib = int(round(a * SR)), int(round(b * SR))
    piece = src[ia - PRE: ib - PRE].copy() if i > 0 else src[ia: ib - PRE].copy()
    if i == 0:
        out.append(piece); mapping.append((0.0, (ib - ia - PRE) / SR, a)); film_t = (ib - ia - PRE) / SR
        continue
    prev = out[-1]
    # equal-power crossfade: last XF samples of prev (which are the samples just before prev's out point)
    # with the XF samples of the incoming piece that sit before its PRE offset
    inc_pre = src[ia - PRE - XF: ia - PRE]
    w = np.linspace(0, 1, XF)[:, None]
    fo, fi = np.cos(w * np.pi / 2), np.sin(w * np.pi / 2)
    tail = prev[-XF:] * fo + inc_pre * fi
    out[-1] = np.concatenate([prev[:-XF], tail])
    out.append(piece)
    mapping.append((film_t, film_t + len(piece) / SR, a - PRE / SR))
    film_t += len(piece) / SR
y = np.concatenate(out)
tail = edl.get('tail', 0.0)
if tail > 0:
    n = int(tail * SR); y[-n:] *= np.linspace(1, 0, n)[:, None] ** 2
y *= 10 ** (edl.get('gain_db', 0.0) / 20)
sf.write(f'{D}/bed.wav', y.astype(np.float32), SR, subtype='FLOAT')
# ---- map every source cue into film time
def to_film(t):
    for fa, fb, sa in mapping:
        ft = fa + (t - sa)
        if fa - 1e-6 <= ft < fb: return round(ft, 4)
    return None
fc = {'duration': round(len(y) / SR, 4), 'beats': [], 'hits': [], 'stops': [], 'downbeats': [], 'segments': mapping}
for bt in cues['beats']:
    f = to_film(bt['t'])
    if f is not None: fc['beats'].append({**bt, 't': f, 'src': bt['t']})
for h in cues['hits']:
    f = to_film(h['t'])
    if f is not None: fc['hits'].append({**h, 't': f, 'src': h['t']})
for s in cues['stops']:
    fa, fb = to_film(s['from']), to_film(s['to'])
    if fa is not None and fb is not None: fc['stops'].append({'from': fa, 'to': fb, 'slamBar': s['slamBar']})
fc['downbeats'] = [b for b in fc['beats'] if b['beat'] == 1]
for k, v in cues['intro'].items():
    f = to_film(v)
    if f is not None: fc[k] = f
if 'outro' in cues:
    o = cues['outro']
    fc['outro'] = {'in': to_film(o['in']), 'stabs': [to_film(x) for x in o['stabs']], 'noteEnd': to_film(o['noteEnd'])}
os.makedirs(f'{D}/../src', exist_ok=True)
json.dump(fc, open(f'{D}/../src/cues.json', 'w'), indent=0)
print(f"bed {fc['duration']:.3f}s, {len(fc['beats'])} beats, {len(fc['hits'])} hits, stops {fc['stops']}")
print('downbeats (film):', [(b['bar'], b['t']) for b in fc['downbeats']])
