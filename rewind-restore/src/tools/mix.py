"""Renders the film's music: the song plays, stops like a record when the keys go down, scratches backwards
locked to the Rewind playhead, then drops on Restore. Variable-speed reads with linear interpolation.
usage: python tools/mix.py <instrumental.wav> <plan.json> <out.wav>
plan: {"dur": s, "segments": [{"a","b","type": play|stop|curve|silence, ...}]}"""
import json, sys
import numpy as np, soundfile as sf
src, planp, out = sys.argv[1], sys.argv[2], sys.argv[3]
x, sr = sf.read(src, dtype='float32', always_2d=True)
plan = json.load(open(planp))
N = int(round(plan['dur'] * sr))
y = np.zeros((N, x.shape[1]), np.float32)
idx = np.arange(len(x), dtype=np.float64)

def read(pos):
    pos = np.clip(pos * sr, 0, len(x) - 1)
    return np.stack([np.interp(pos, idx, x[:, c]) for c in range(x.shape[1])], 1).astype(np.float32)

for sg in plan['segments']:
    a, b = int(round(sg['a'] * sr)), min(N, int(round(sg['b'] * sr)))
    if b <= a:
        continue
    t = (np.arange(a, b) / sr) - sg['a']
    ty = sg['type']
    if ty == 'silence':
        continue
    if ty == 'play':
        pos = sg['s'] + t * sg.get('speed', 1.0)
    elif ty == 'stop':  # record stop: speed 1 → 0 over len, pos = integral
        L = sg['len']
        u = np.clip(t / L, 0, 1)
        pos = sg['s'] + np.where(t < L, L * (u - u * u / 2), L / 2)
    elif ty == 'start':  # record start: speed 0 → 1 over len
        L = sg['len']
        u = np.clip(t / L, 0, 1)
        pos = sg['s'] + np.where(t < L, L * u * u / 2, L / 2 + (t - L))
    elif ty == 'curve':
        c = np.array(sg['curve'], np.float64)
        tc = sg['curveA'] + np.arange(len(c)) / sg['curveFs']
        pos = sg['s0'] + np.interp(sg['a'] + t, tc, c)
    seg = read(pos)
    g = np.ones(len(seg), np.float32)
    fi = int(sg.get('fadeIn', 0.004) * sr)
    fo = int(sg.get('fadeOut', 0.004) * sr)
    if fi:
        g[:fi] *= np.linspace(0, 1, fi)
    if fo:
        g[-fo:] *= np.linspace(1, 0, fo)
    if 'gain' in sg:
        g *= sg['gain']
    if ty == 'curve':  # tame the top end while scrubbing fast (vinyl-ish)
        sp = np.abs(np.gradient(pos) * sr)
        g *= np.clip(1.15 - 0.15 * sp, 0.55, 1).astype(np.float32)
    y[a:b] += seg * g[:, None]
peak = np.abs(y).max()
print('peak', peak)
sf.write(out, y, sr, subtype='FLOAT')
