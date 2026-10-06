# Mixes the Tab to Finish soundtrack from the ElevenLabs score + SFX, timed from audio/timeline.json.
#   avenv/bin/python audio/mix.py  ->  audio/mix.wav (48 kHz stereo, pre-master)
# The story is mixed in story time, then placed after the cold open (film time = story time + SHIFT).
import json, os
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

D = os.path.dirname(os.path.abspath(__file__))
SR = 48000
tl = json.load(open(f'{D}/timeline.json'))
T = tl['T']
TOTAL = tl['TOTAL']
SHIFT = tl['SHIFT']
OPEN = tl['OPEN']
N = int((TOTAL + 0.5) * SR)
mix = np.zeros((N, 2))
NF = int(round((TOTAL + SHIFT) * SR))
film = np.zeros((NF + SR, 2))
db = lambda g: 10 ** (g / 20)


def load(name):
    x, sr = sf.read(f'{D}/raw/{name}.wav', always_2d=True)
    assert sr == SR
    return x


def trim(x, thr=0.003):
    """drop leading silence so the hit lands on its cue"""
    a = np.abs(x).max(1)
    nz = np.where(a > thr)[0]
    return x[nz[0]:] if len(nz) else x


def pitch(x, r):
    """speed/pitch change by ratio r (r > 1 = higher, shorter)"""
    up, down = int(round(100)), int(round(100 * r))
    return np.stack([resample_poly(x[:, c], up, down) for c in range(2)], 1)


def add(x, t, g=0.0, pan=0.0, buf=None):
    buf = mix if buf is None else buf
    n = len(buf)
    o = int(round(t * SR))
    if o >= n:
        return
    if o < 0:
        x = x[-o:]
        o = 0
    e = min(n, o + len(x))
    s = x[: e - o] * db(g)
    buf[o:e, 0] += s[:, 0] * min(1.0, 1 - pan)
    buf[o:e, 1] += s[:, 1] * min(1.0, 1 + pan)


# ------------------------------------------------------------------ score: ElevenLabs music_1, a slow build that is fully up by ~11.75 s
music_raw = load('music_1')
OFF = 0.6  # track 11.75 s (a low hit) lands on the Tab press
music = music_raw[int(OFF * SR):]
t = np.arange(len(music)) / SR
# held breath: from 9.3 s the score sinks under a low-pass and dips, then snaps back exactly on the press
sos = butter(2, 650, 'lowpass', fs=SR, output='sos')
low = np.stack([sosfilt(sos, music[:, c]) for c in range(2)], 1)
press = T['press'] + 0.05
w = np.clip((t - 9.3) / (press - 0.12 - 9.3), 0, 1) ** 1.5
w[t >= press - 0.02] = 0
music = music * (1 - w)[:, None] + low * w[:, None] * db(-3)
# a hard dip in the last beat before the press so the drop hits
dip = np.ones_like(t)
m = (t > press - 0.45) & (t < press - 0.01)
dip[m] = np.interp(t[m], [press - 0.45, press - 0.12, press - 0.01], [1, db(-14), db(-14)])
music *= dip[:, None]
# calmer under the payoff caption, then the tail rings into the end card and fades out
gain = np.interp(t, [0, T['done'], T['done'] + 0.8, T['end'], T['end'] + 1.0, TOTAL - 1.4, TOTAL - 0.1], [db(1.5), db(0), db(-3.5), db(-3.5), db(-2), db(-8), 0])
music *= gain[:, None]
# the track's first seconds are a near-silent fade-in: lift them so the wide shot has a bed
# (after the loud cold open the story's first seconds need a real bed, or the cut feels like a drop-out)
music *= np.interp(t, [0, 1.2, 3.0, 5.5, 8.5], [db(23), db(23), db(18), db(9), db(0)])[:, None]
# the flash-forward (first second) gets only a soft bed
music *= np.interp(t, [0, 0.9, 1.1], [0.0, 0.0, 1.0])[:, None]
add(music, 0, -6)

# ------------------------------------------------------------------ sound effects
click = trim(load('click_2'))
key = trim(load('key_1'))
key2 = trim(load('key_2'))
chime = trim(load('chime_2'))
thock = trim(load('thock_2'))
tick = trim(load('tick_2'))
succ = trim(load('success_1'))
whoosh = trim(load('whoosh_1'))
whoosh_lo = trim(load('whoosh_2'))
riser = trim(load('riser_1'))
boom = trim(load('boom_2'))

# a whoosh out of the cold open into the story's wide shot
add(whoosh, T['cut'] - 0.12, -13)
# double-click the first invoice, preview opens
add(click, T['dbl'], -2)
add(click, T['dbl'] + 0.13, -3)
add(whoosh_lo, T['prevOpen'], -12)
# copying by hand: ⌘C after each selection, click into the cell, ⌘V
for k, s in enumerate(tl['sels']):
    add(key, s['b'] + 0.03, -9, pan=-0.2)
    add(key2 if k % 2 else key, s['b'] + 0.09, -11, pan=-0.2)
for p in tl['pastes']:
    add(click, p - 0.03, -6, pan=0.2)
    add(key, p + 0.005, -10, pan=0.2)
add(key2, T['next'], -9)  # next file
add(key, T['prevClose'] - 0.02, -10)  # space closes the preview
add(whoosh_lo, T['prevClose'], -15)
add(click, T['clickA4'], -5)
# the pill: chime, then a riser into the press
add(chime, T['pill'] + 0.02, -6)
add(riser, press - len(riser) / SR + 0.02, -9)
add(whoosh_lo, T['keyIn'], -14)
add(thock, press - 0.012, 0)
add(boom, press, -12)
# the cascade: a soft tick per row (thinned when rows come faster than 16 a second), rising in pitch
last = -1
fill = tl['FILL_T']
flags = {f['i'] for f in tl['FLAGGED']}
for i in range(2, 200):
    ft = fill[i]
    if ft - last < 1 / 16 and i not in flags:
        continue
    last = ft
    u = (i - 2) / 198
    add(pitch(tick, 1.0 + 0.45 * u), ft, -17 + 3 * u, pan=0.25 * np.sin(i * 1.7))
for i in flags:
    add(pitch(chime, 0.79), fill[i] + 0.28, -13)  # a low "look at this" note on the flagged rows
add(succ, T['done'], -6)
# end card
add(whoosh, T['end'] + 0.25, -16)
add(boom, T['end'] + 0.45, -4)
add(pitch(chime, 0.5), T['end'] + 0.5, -16)

# ------------------------------------------------------------------ the cold open (film time): the Tab press and all 198 rows, time-warped
ost = np.array(tl['openSt'])  # scene time shown at each 60 fps frame of the open
oft = np.arange(len(ost)) / 60
open_t = lambda st: float(np.interp(st, ost, oft))  # film time a scene moment shows up in the open
p_open = open_t(T['press'] + 0.05)  # the key is fully down
# the score's drop (track 11.75 s) on the press, fading out into the cut
seg = music_raw[int((11.75 - p_open) * SR): int((11.75 - p_open + OPEN + 0.1) * SR)].copy()
ts = np.arange(len(seg)) / SR
seg *= np.interp(ts, [0, p_open - 0.03, p_open, OPEN - 0.4, OPEN + 0.02], [0, 0, 1, 1, 0])[:, None]
add(seg, 0, -4.5, buf=film)
add(riser[-int(0.45 * SR):], p_open + 0.02 - 0.45, -11, buf=film)  # the riser's last breath into the press
add(thock, p_open - 0.012, 0, buf=film)
add(boom, p_open, -10, buf=film)
last = -1
for i in range(2, 200):
    ft = open_t(fill[i])
    if ft - last < 1 / 22 and i not in flags:
        continue
    last = ft
    u = (i - 2) / 198
    add(pitch(tick, 1.0 + 0.45 * u), ft, -18 + 3 * u, pan=0.25 * np.sin(i * 1.7), buf=film)
for i in flags:
    add(pitch(chime, 0.79), open_t(fill[i] + 0.28), -15, buf=film)
add(succ, open_t(T['done']), -6, buf=film)

# the story after the open
o = int(round(SHIFT * SR))
film[o: o + len(mix)] += mix
film = film[:NF]
peak = np.abs(film).max()
sf.write(f'{D}/mix.wav', (film / max(1.0, peak / 0.95)).astype(np.float32), SR, subtype='FLOAT')
print(f'mix peak {20 * np.log10(peak):.1f} dBFS, {len(film) / SR:.2f} s, press in the open at {p_open:.3f} s')
