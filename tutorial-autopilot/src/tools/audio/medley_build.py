"""Condense Technologic to ~34 s: robot-only start, drums, the last verse, the song's own ending.
Verb order stays continuous (1..64, one per beat). Every seam is on a bar line; each stem switches
at its own point (vocals in the gap between words, drums just before the kick, bass/synth at their
note change) with short equal-power crossfades. Prints numbers only."""
import os
import json, sys
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import resample_poly

W = os.environ.get('MUSIC', '/home/user/work/music/')
P, p0 = np.load(W + 'grid.npy')
B = lambda k: p0 + k * P          # source beat k
M = lambda j: p0 + j * P          # medley beat j (seg1 plays the source as is)
sr = 44100
S = lambda t: int(round(t * sr))

mix = sf.read(W + 'technologic.wav')[0]
st = {k: sf.read(W + f'stems/htdemucs/technologic/{k}.wav')[0] for k in ['vocals', 'drums', 'bass', 'other']}
st['resid'] = mix - sum(st.values())
STEMS = list(st)

d3 = -0.00474                 # last verse's drums sit 4.74 ms earlier on the grid than the drum verse
d4 = d3 + 0.0030              # the song's last bar vs the break bar after the last verse (drum xcorr + kick check)
SRC_END = 283.30              # sound has decayed below -78 dB by here

# segments: medley beat where it starts, source offset (src = medley + off)
SEG = [
    dict(name='robot', j=0, off=0.0),
    # the drums come from the song's own drum entrance (bar 16, same loop as bar 20) so they start the way Daft Punk started them
    dict(name='drums', j=16, off=B(80) - M(16), stem_off=dict(drums=B(64) - M(16))),
    dict(name='last_verse', j=32, off=B(464) - M(32) + d3),
    dict(name='ending', j=68, off=B(596) - M(68) + d4),
]
# per seam, per stem crossfade window relative to the medley downbeat (s)
DR = (-0.036, -0.026)
XF = {
    16: dict(vocals=(-0.130, -0.100), drums=(-0.125, -0.115), bass=DR, other=DR, resid=(-0.035, -0.025)),
    32: dict(vocals=(-0.150, -0.095), drums=DR, bass=(-0.017, -0.011), other=(-0.017, -0.011), resid=DR),
    68: dict(vocals=DR, drums=DR, bass=DR, other=DR, resid=DR),
}
end_m = SRC_END - SEG[-1]['off']
N = S(end_m)
m_t = np.arange(N) / sr

def ramp(a, b):
    """0 before a, 1 after b, equal-power in between: returns the incoming gain x in [0,1]"""
    x = np.clip((m_t - a) / (b - a), 0, 1)
    return x

out = {}
for s in STEMS:
    y = np.zeros((N, 2))
    for k, sg in enumerate(SEG):
        g = np.ones(N)
        if k > 0:  # fade in
            a, b = XF[sg['j']][s]; x = ramp(M(sg['j']) + a, M(sg['j']) + b)
            g *= np.sin(x * np.pi / 2)
        if k + 1 < len(SEG):  # fade out
            nj = SEG[k + 1]['j']; a, b = XF[nj][s]; x = ramp(M(nj) + a, M(nj) + b)
            g *= np.cos(x * np.pi / 2)
        idx = np.nonzero(g > 0)[0]
        if len(idx) == 0: continue
        i0, i1 = idx[0], idx[-1] + 1
        o = S(sg.get('stem_off', {}).get(s, sg['off']))
        src = st[s][i0 + o:i1 + o]
        y[i0:i0 + len(src)] += src * g[i0:i0 + len(src), None]
    out[s] = y
med = sum(out.values())
# tail: 30 ms fade at the very end
f = S(0.03); med[-f:] *= np.linspace(1, 0, f)[:, None]

# --- seam checks (numbers only) ---
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print('length_s', round(end_m, 3))
for sg in SEG[1:]:
    j = sg['j']; t = M(j)
    # click: max |2nd difference| within +-6 ms of every switch window vs the 400 ms around it
    mono = med.mean(1)
    d2 = np.abs(np.diff(mono, 2))
    win = []
    for s, (a, b) in XF[j].items():
        win.append(d2[S(t + a - 0.006):S(t + b + 0.006)].max())
    around = np.percentile(d2[S(t - 0.25):S(t + 0.25)], 99.5)
    print(f'seam_beat {j} t {t:.3f} click_ratio {max(win) / around:.2f}')
    # level: 25 ms windows from -150 to +100 ms, medley vs what the original plays on either side
    prev = SEG[SEG.index(sg) - 1]
    row_m, row_o, row_i = [], [], []
    for u in np.arange(-0.15, 0.10, 0.025):
        a = t + u
        row_m.append(round(db(med[S(a):S(a + 0.025)])))
        row_o.append(round(db(mix[S(a + prev['off']):S(a + prev['off'] + 0.025)])))
        row_i.append(round(db(mix[S(a + sg['off']):S(a + sg['off'] + 0.025)])))
    print('  medley', row_m); print('  out   ', row_o); print('  in    ', row_i)
    # what the out side would have played after the seam (lost tails) vs what the in side brings, per stem, 0..150 ms
    lost = {s: round(db(st[s][S(t + prev['off']):S(t + prev['off'] + 0.15)])) for s in STEMS}
    brought = {s: round(db(out[s][S(t):S(t + 0.15)])) for s in STEMS}
    print('  out_after', lost); print('  medley   ', brought)

# loudness to -13 LUFS, true peak <= -1 dBTP
meter = pyln.Meter(sr)
lu = meter.integrated_loudness(med)
g = 10 ** ((-13 - lu) / 20)
med2 = med * g
tp = 20 * np.log10(np.abs(resample_poly(med2, 4, 1, axis=0)).max())
if tp > -1:
    med2 *= 10 ** ((-1 - tp) / 20)
    tp = -1
print('lufs_in', round(lu, 2), 'gain_db', round(20 * np.log10(g), 2), 'lufs_out', round(meter.integrated_loudness(med2), 2), 'true_peak', round(tp, 2))
sf.write(W + 'medley/medley.wav', med2, sr, subtype='PCM_24')
sf.write(W + 'medley/medley_vocals.wav', out['vocals'], sr, subtype='PCM_24')
sf.write(W + 'medley/medley_drums.wav', out['drums'], sr, subtype='PCM_24')
json.dump({'P': P, 'p0': p0, 'segments': [dict(s, start=M(s['j'])) for s in SEG], 'xfade': {str(k): v for k, v in XF.items()}, 'end': end_m}, open(W + 'medley/edl.json', 'w'), indent=1)
print('wrote medley')
