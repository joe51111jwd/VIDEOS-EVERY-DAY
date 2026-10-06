# Masters the film's audio: loudness to -14 LUFS, true peaks held under -1 dBTP by a look-ahead limiter.
#   bvenv/bin/python tts/v5_master.py in.wav out.wav [target_lufs]
import sys
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import resample_poly

src, dst = sys.argv[1], sys.argv[2]
target = float(sys.argv[3]) if len(sys.argv) > 3 else -14.0
CEIL = 10 ** (-1.0 / 20)
x, sr = sf.read(src, always_2d=True)
meter = pyln.Meter(sr)
before = meter.integrated_loudness(x)


def true_peak_env(y):
    """per-sample peak of the 4x oversampled signal (inter-sample peaks), max over channels"""
    up = np.stack([resample_poly(y[:, c], 4, 1) for c in range(y.shape[1])], 1)
    return np.abs(up).max(1).reshape(-1, 4).max(1)[:len(y)]


def limit(y):
    look = int(0.002 * sr); rel = np.exp(-1 / (0.06 * sr))
    need = np.minimum(1.0, CEIL / (true_peak_env(y) + 1e-12))
    # look-ahead: the gain is already down when a peak arrives
    from scipy.ndimage import minimum_filter1d
    need = minimum_filter1d(need, size=2 * look + 1, origin=0)
    g = np.empty_like(need); c = 1.0
    for i in range(len(need)):
        c = need[i] if need[i] < c else need[i] + (c - need[i]) * rel
        g[i] = c
    # smooth the attack edge a touch so gain changes never click
    from scipy.ndimage import convolve1d
    k = np.hanning(look * 2 + 1); k /= k.sum()
    g = np.minimum(g, convolve1d(g, k, mode='nearest'))
    return y * g[:, None], g


y = x * 10 ** ((target - before) / 20)
for _ in range(3):  # limiting lowers loudness a little; re-aim and limit again
    y, g = limit(y)
    now = meter.integrated_loudness(y)
    if abs(now - target) < 0.15: break
    y = y * 10 ** ((target - now) / 20)
y, g = limit(y)
sf.write(dst, y.astype(np.float32), sr, subtype='PCM_24')
tp = 20 * np.log10(true_peak_env(y).max())
print(f'{src}: {before:.1f} LUFS -> {meter.integrated_loudness(y):.1f} LUFS, true peak {tp:.2f} dBTP, '
      f'max gain reduction {-20 * np.log10(g.min()):.1f} dB, limiting on {np.mean(g < 0.999) * 100:.1f}% of samples')
