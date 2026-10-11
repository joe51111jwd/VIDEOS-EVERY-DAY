"""Cut James's PSA upload to a ~30 s soundtrack for the Code Cleaner film.

Needs the demucs two-stem split of his file (never committed):
  python3 -m demucs --two-stems=vocals -n htdemucs psa.wav -o stems
Usage:
  python3 edit.py <stems/htdemucs/psa dir> <out.wav>

Edit (song bars, bar n = beats 4n..4n+4, beat k = B0 + k*P):
  film 0.0   the opening line over the quiet intro (full mix), vocal out after the name
  film 2.788 the drop, on the name       bars 1-8, the beat plays straight through
  film 24.29 one splice into the end     bars 45-48, the beat stops on its own
The splice sits on a downbeat, keeps the 4-bar loop phase, and uses a 26 ms equal-power
crossfade that ends just before the incoming kick so the transient stays whole.
"""
import sys
import numpy as np
import soundfile as sf
import pyloudnorm as pyln

stems, out = sys.argv[1], sys.argv[2]
inst, sr = sf.read(f'{stems}/no_vocals.wav')
voc, _ = sf.read(f'{stems}/vocals.wav')

B0, P = 20.242, 0.672          # beat 0 = the measured kick grid (onsets sit 17 ms before the librosa grid)
PRE = 0.1                      # film starts 0.1 s before beat 0, just before the first word
beat = lambda k: B0 + k * P
S = lambda t: int(round(t * sr))

# vocal kept for the opening line only: out in the breath after the name (song 23.50-23.58)
g = np.zeros(len(voc))
a, b = S(23.50), S(23.58)
g[:a] = 1
g[a:b] = np.cos(np.linspace(0, np.pi / 2, b - a)) ** 2
mix = inst + voc * g[:, None]


segs = [  # (song start, song end) — end is the next downbeat
    (beat(0) - PRE, beat(36)),
    (beat(180), beat(196)),
]
XF = S(0.026)      # crossfade length
LEAD = S(0.004)    # crossfade ends this long before the incoming downbeat

out_sig = mix[S(segs[0][0]):S(segs[0][1]) - LEAD].copy()
for i in range(1, len(segs)):
    pe = S(segs[i - 1][1]) - LEAD                 # where the previous segment was cut
    ns = S(segs[i][0]) - LEAD                     # incoming starts at the same offset before its downbeat
    tail = mix[pe - XF:pe]                        # already in out_sig: last XF samples
    head = mix[ns - XF:ns]                        # the incoming audio leading into its own cut point
    t = np.linspace(0, np.pi / 2, XF)[:, None]
    out_sig[-XF:] = tail * np.cos(t) + head * np.sin(t)
    out_sig = np.concatenate([out_sig, mix[ns:S(segs[i][1]) - (LEAD if i < len(segs) - 1 else 0)]])

# head fade (15 ms) and tail fade (beat stops before beat 196; fade the last 60 ms)
fi = S(0.015); out_sig[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = S(0.06); out_sig[-fo:] *= np.cos(np.linspace(0, np.pi / 2, fo))[:, None] ** 2

# master: -14 LUFS integrated, then hold true peak under -1 dBTP (4x oversampled check)
meter = pyln.Meter(sr)
lufs = meter.integrated_loudness(out_sig)
out_sig = out_sig * 10 ** ((-14 - lufs) / 20)
from scipy.signal import resample_poly
tp = 20 * np.log10(np.max(np.abs(resample_poly(out_sig, 4, 1, axis=0))) + 1e-12)
if tp > -1:
    # gentle look-ahead limiter on the peaks above -1.5 dBFS
    thr = 10 ** (-1.5 / 20)
    env = np.max(np.abs(out_sig), axis=1)
    w = S(0.005)
    from scipy.ndimage import maximum_filter1d, uniform_filter1d
    pk = maximum_filter1d(env, size=2 * w + 1)
    gain = np.minimum(1, thr / np.maximum(pk, 1e-9))
    gain = uniform_filter1d(gain, size=w)
    out_sig = out_sig * gain[:, None]
tp2 = 20 * np.log10(np.max(np.abs(resample_poly(out_sig, 4, 1, axis=0))) + 1e-12)
sf.write(out, out_sig.astype(np.float32), sr, subtype='PCM_24')

film = lambda k: PRE + k * P
print(f'length {len(out_sig) / sr:.3f} s  lufs_in {lufs:.1f}  -> {meter.integrated_loudness(out_sig):.1f} LUFS  tp {tp:.1f} -> {tp2:.1f} dBTP')
print('film beats: drop 4 =', round(film(4), 3), '| splice 36 =', round(film(36), 3), '| end 52 =', round(film(52), 3))
