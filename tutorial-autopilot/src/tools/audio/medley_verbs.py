"""Where each of the 64 verbs starts (first consonant), measured on the clean robot-only verse,
then placed in the edit with the per-verb lag of the verse run it comes from. Numbers only."""
import os
import json, numpy as np, soundfile as sf
W = os.environ.get('MUSIC', '/home/user/work/music/')
P, p0 = np.load(W + 'grid.npy'); sr = 44100
B = lambda k: p0 + k * P
voc = sf.read(W + 'stems/htdemucs/technologic/vocals.wav')[0].mean(1)
H = 0.005; Wn = 0.010
def L(t):
    a = int(t * sr); return 20 * np.log10(np.sqrt(np.mean(voc[a:a + int(Wn * sr)] ** 2)) + 1e-9)
def onset(t):
    """first point after the deepest gap where the voice stays up (within 18 dB of the word's peak) for 30 ms"""
    ts = np.arange(-0.22, 0.10, H)
    lv = np.array([L(t + u) for u in ts])
    pk = lv[ts >= -0.06].max()
    v = int(np.argmin(np.where(ts <= 0.0, lv, 99)))
    thr = max(lv[v] + 3, pk - 18)
    for k in range(v, len(ts) - 5):
        if lv[k:k + 5].min() >= thr:
            return ts[k] + 0.003, pk - lv[v]
    return 0.0, 0.0
o = []; rs = []
for k in range(64):
    x, r = onset(B(k)); o.append(round(x * 1000)); rs.append(round(r))
print('run0 onset ms', o)
print('rise dB', rs)
json.dump(o, open(W + 'medley/run0_onsets_ms.json', 'w'))

# ---- place the verbs in the edit ----
E = json.load(open(W + 'medley/edl.json'))
Mg = lambda j: E['p0'] + j * E['P']
seg_of = lambda i: 0 if i < 16 else 1 if i < 32 else 2
mv = sf.read(W + 'medley/medley_vocals.wav')[0].mean(1)
def Lm(t):
    a = int(t * sr); return 20 * np.log10(np.sqrt(np.mean(mv[a:a + int(Wn * sr)] ** 2)) + 1e-9)
def env(fn, t):
    return np.maximum(np.array([fn(t + u) for u in np.arange(-0.20, 0.30, 0.002)]), -45)
def lag(i):
    """how much later this verb sits in the edit than the clean verse predicts (envelope xcorr, 2 ms)"""
    a = env(L, B(i)); best = (0, -2)
    for g in range(-20, 21):
        b = env(Lm, Mg(i) + g * 0.002)
        c = np.corrcoef(a, b)[0, 1]
        if c > best[1]: best = (g * 2, c)
    return best
def onset_m(t):
    ts = np.arange(-0.22, 0.10, H)
    lv = np.array([Lm(t + u) for u in ts])
    pk = lv[ts >= -0.06].max()
    v = int(np.argmin(np.where(ts <= 0.0, lv, 99)))
    thr = max(lv[v] + 3, pk - 18)
    for k in range(v, len(ts) - 5):
        if lv[k:k + 5].min() >= thr:
            return ts[k] + 0.003
    return None
rows = []; verbs = []
for i in range(64):
    g, c = lag(i) if i >= 16 else (0, 1.0)
    pred = o[i] + g
    d = onset_m(Mg(i)); d = None if d is None else round(d * 1000)
    use = d if (d is not None and abs(d - pred) <= 40) else pred
    rows.append((i, pred, d, round(c, 2), use))
    verbs.append({'i': i, 'src': round(Mg(i) + use / 1000, 4)})
print('i pred direct corr use (ms from the edit grid beat)')
for r in rows: print(*r)
json.dump(verbs, open(W + 'medley/verbs_edit.json', 'w'))
