"""Build an episode's soundtrack from James's song upload: instrumental (demucs stems minus vocals),
excerpt aligned to the film, fades, -14 LUFS / -1 dBTP master. Song files never go in git.

usage: python3 song.py <stem dir> <song second at film 0> <film length s> <tail fade start s> <out.wav>
"""
import sys
import numpy as np
import soundfile as sf
import pyloudnorm as pyln

stem_dir, start, length, fade_at, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
parts = []
sr = None
for name in ('drums', 'bass', 'other'):
    x, sr = sf.read(f'{stem_dir}/{name}.wav', always_2d=True)
    parts.append(x)
n = min(len(p) for p in parts)
mix = sum(p[:n] for p in parts)
a = int(round(start * sr))
pad = 0
if a < 0:
    pad, a = -a, 0
seg = mix[a:a + int(round(length * sr)) - pad]
if pad:
    seg = np.concatenate([np.zeros((pad, seg.shape[1])), seg])
seg = seg[: int(round(length * sr))]
if len(seg) < int(round(length * sr)):
    seg = np.concatenate([seg, np.zeros((int(round(length * sr)) - len(seg), seg.shape[1]))])
# 6 ms fade in (the excerpt starts inside a sustained sound)
fi = int(0.006 * sr)
seg[:fi] *= np.linspace(0, 1, fi)[:, None]
# tail: equal-power fade from fade_at to the end
fa = int(fade_at * sr)
if fa < len(seg):
    k = len(seg) - fa
    seg[fa:] *= np.cos(np.linspace(0, np.pi / 2, k))[:, None]
meter = pyln.Meter(sr)
loud = meter.integrated_loudness(seg)
seg = pyln.normalize.loudness(seg, loud, -14.0)
# simple look-ahead peak limiter to -1 dBTP (4x oversampled peak estimate)
ceil = 10 ** (-1.0 / 20)
from scipy.signal import resample_poly
up = resample_poly(seg, 4, 1, axis=0)
peak_env = np.abs(up).max(axis=1).reshape(-1, 4).max(axis=1)[: len(seg)]
gain = np.minimum(1.0, ceil / np.maximum(peak_env, 1e-9))
# look-ahead 3 ms min-filter, then 60 ms release smoothing
la = int(0.003 * sr)
from scipy.ndimage import minimum_filter1d
g = minimum_filter1d(gain, size=2 * la + 1)
rel = np.exp(-1 / (0.06 * sr))
sm = np.empty_like(g)
cur = 1.0
for i in range(len(g)):
    cur = g[i] if g[i] < cur else rel * cur + (1 - rel) * g[i]
    sm[i] = cur
seg = seg * sm[:, None]
print('in loudness', round(loud, 2), 'out', round(meter.integrated_loudness(seg), 2), 'peak dBFS', round(20 * np.log10(np.abs(seg).max()), 2))
sf.write(out, seg.astype(np.float32), sr, subtype='PCM_24')
