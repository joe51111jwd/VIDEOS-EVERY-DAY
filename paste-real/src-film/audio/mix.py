# Mixes the Paste Real soundtrack: the ALL CAPS bed (music/bed.wav, already cut to the film) + a few UI sounds
# placed on the same beat cues the picture uses (mirrors src/pr/T.ts).
#   python3 -I audio/mix.py [end_seconds]  ->  audio/mix.wav (48 kHz stereo float, pre-master)
import json, os, sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

D = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(D, '..')
SR = 48000
cues = json.load(open(f'{R}/src/cues.json'))
BEAT = 60 / 87.435
DB = {d['bar']: d['t'] for d in cues['downbeats']}
at = lambda bar, beat=1: DB[bar] + (beat - 1) * BEAT
E = 0.012
bed, sr = sf.read(f'{R}/music/bed.wav', always_2d=True)
assert sr == SR
end = float(sys.argv[1]) if len(sys.argv) > 1 else len(bed) / SR
N = int(round(end * SR))
mix = np.zeros((N, 2))
mix[: min(N, len(bed))] += bed[:N]
db = lambda g: 10 ** (g / 20)


def load(name):
    x, s = sf.read(f'{D}/raw/{name}.wav', always_2d=True)
    assert s == SR
    a = np.abs(x).max(1)
    nz = np.where(a > 0.004)[0]
    return x[nz[0]:] if len(nz) else x


def add(x, t, g=0.0, pan=0.0):
    o = int(round(t * SR))
    if o >= N:
        return
    e = min(N, o + len(x))
    s = x[: e - o] * db(g)
    mix[o:e, 0] += s[:, 0] * min(1.0, 1 - pan)
    mix[o:e, 1] += s[:, 1] * min(1.0, 1 + pan)


def shutter(seed=1):
    """the grab: a crisp two-blade shutter 'shk' with a small body thump"""
    r = np.random.default_rng(seed)
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for t0, amp, dec in ((0.0, 1.0, 0.012), (0.028, 0.7, 0.018)):
        o = int(t0 * SR)
        m = n - o
        tt = np.arange(m) / SR
        noise = r.standard_normal(m)
        sos = butter(2, [2200, 9000], 'bandpass', fs=SR, output='sos')
        out[o:] += sosfilt(sos, noise) * amp * np.exp(-tt / dec) * (1 - np.exp(-tt / 0.0008))
    out += 0.5 * np.sin(2 * np.pi * 140 * t) * np.exp(-t / 0.025) * (1 - np.exp(-t / 0.002))
    out /= np.abs(out).max()
    return np.stack([out, out], 1) * 0.9


raw = {n: load(n) for n in ['pop_soft_1', 'tap_glass_1', 'whoosh_1', 'key_1', 'click_1', 'tick_1', 'thock_1', 'shimmer_1', 'boom_logo_1']}
shk = shutter()

# ---- 1. the ad
add(shk, at(1) - 0.004, -12)
add(raw['whoosh_1'], at(1) + 0.12, -16)
add(raw['shimmer_1'], at(1) + 0.02, -24)
add(raw['thock_1'], at(1, 2.5) - 0.01, -14)  # lands in the canvas
for i in range(7):  # typing, a few soft keys under the beat
    add(raw['key_1'], at(1, 3) + 0.06 + i * 0.18, -24 - (i % 2) * 2, pan=-0.1 + 0.05 * (i % 3))
add(raw['click_1'], at(2, 2) - 0.006, -15)  # AA
add(raw['tick_1'], at(2, 3) - 0.006, -18)  # pick up the shoe
add(raw['click_1'], at(2, 4) - 0.006, -15)  # recolor
# ---- 2. figma
add(shk, at(3, 2) - 0.004, -12)
add(raw['pop_soft_1'], at(3, 3) - 0.004, -12)  # paste
add(raw['tick_1'], at(4) - 0.006, -19)
add(raw['tick_1'], at(4, 3) - 0.006, -19)
# ---- 3. keynote
add(shk, at(5, 2) - 0.004, -12)
add(raw['pop_soft_1'], at(5, 3) - 0.004, -12)
add(raw['click_1'], at(6) - 0.006, -15)
add(raw['key_1'], at(6) + 0.34, -22)
add(raw['key_1'], at(6) + 0.50, -22)
add(raw['tap_glass_1'], at(6, 2) - 0.006, -14)  # the bar grows
add(raw['whoosh_1'], at(6, 4) - 0.05, -20)  # Play: the slide goes full screen
# ---- 4. montage: a soft pop on each paste
for i, (bar, beat) in enumerate([(7, 1), (7, 2), (7, 3), (7, 4), (8, 1), (8, 2), (8, 3)]):
    if at(bar, beat) < end:
        add(raw['pop_soft_1'], at(bar, beat) - 0.004, -17, pan=(-0.25, 0.25)[i % 2])

# the film starts inside the ringing intro chord: a 25 ms fade-in keeps it from clicking
n0 = int(0.025 * SR)
mix[:n0] *= np.linspace(0, 1, n0)[:, None]
if end < len(bed) / SR - 0.05:  # a sample cut ends early: fade the last 0.35 s
    n = int(0.35 * SR)
    mix[-n:] *= np.linspace(1, 0, n)[:, None] ** 2
sf.write(f'{D}/mix.wav', mix.astype(np.float32), SR, subtype='FLOAT')
print('mix', end, 's peak', 20 * np.log10(np.abs(mix).max()))
