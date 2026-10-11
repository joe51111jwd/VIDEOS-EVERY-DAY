"""Condense Money (James's file, never committed) to the film's ~32 s soundtrack.

MUSIC=/path/to/work python tools/audio/edit.py
  needs money44.wav (the MP3 decoded at 44.1 kHz) and stems/htdemucs/money/*.wav there;
  writes edit.wav (44.1 kHz) and edit48.wav (for the mux).

Money opens on a tape loop of register sounds in 7/4 with a fixed period (one bar = 3.552 s),
so every bar line in the first 41 s sits on D(k) = 4.992 + 3.552 k (song seconds).
  A  song 4.50 -> bar 3   : loop pickup, two bars of loop alone, the bass comes in
  B  bar 5 -> 41.46       : the same riff two bars later, the band's pickup, the band, the first sung word
  stop                    : the music stops after that word
  C  song 10.045 -> 11.09 : one more pass of the loop's register clunk and bell, alone
A and B are joined one stem at a time (demucs stems + the residual), each just before its own
next attack, so the bass never plays a note twice and the loop's clunk lands clean.
"""
import os, numpy as np, soundfile as sf
import pyloudnorm as pyln

W = os.environ.get('MUSIC', '/home/user/work/music')
x, sr = sf.read(os.path.join(W, 'money44.wav'))
names = ['vocals', 'drums', 'bass', 'other']
stems = {n: sf.read(os.path.join(W, 'stems/htdemucs/money', n + '.wav'))[0] for n in names}
n0 = min(len(x), *(len(v) for v in stems.values()))
x = x[:n0]
stems = {k: v[:n0] for k, v in stems.items()}
stems['resid'] = x - sum(stems[n] for n in names)

D = lambda k: 4.992 + 3.552 * k
s = lambda t: int(round(t * sr))
db = lambda g: 10 ** (g / 20)

def ramp(n, kind):
    t = np.linspace(0, 1, n)[:, None]
    return np.sin(t * np.pi / 2) if kind == 'in' else np.cos(t * np.pi / 2)

OFF = 2 * 3.552           # two bars of the bass groove come out
A0 = 4.50                 # film 0 = song 4.50 (loop pickup)
XF = 0.010
# where each track leaves A for B (song time in A); B picks up at the same + OFF
SEAM = {
    'bass': 17.141,       # just before bar 5's beat-4 bass note (24.249) in B
    'drums': 17.166,      # just before the loop's clunk on beat 4 (24.276 in B)
    'other': 17.166,
    'vocals': 17.166,
    'resid': 17.166,
}
WORD_END, STOP = 41.34, 0.12   # first sung word over (vocal stem below -36 dB), then the stop
B_END = WORD_END + STOP
C0, C_CLUNK, C1 = 10.045, 10.064, 11.088
FILM_CLUNK = 30.10

film_len = s(B_END - OFF - A0)
film = np.zeros((film_len, 2))
for k, y in stems.items():
    a1 = SEAM[k]
    n = s(XF)
    ia = s(a1 - A0)                       # film sample where the crossfade ends
    tr = np.zeros((film_len, 2))
    tr[: ia - n] = y[s(A0): s(A0) + ia - n]
    xa = y[s(A0) + ia - n: s(A0) + ia]
    xb = y[s(A0 + OFF) + ia - n: s(A0 + OFF) + ia]
    tr[ia - n: ia] = xa * ramp(n, 'out') + xb * ramp(n, 'in')
    rest = y[s(A0 + OFF) + ia: s(A0 + OFF) + film_len]
    tr[ia: ia + len(rest)] = rest
    film += tr
fi = s(0.006); film[:fi] *= ramp(fi, 'in')
fo = s(STOP); film[-fo:] *= ramp(fo, 'out')
# the loop alone sits +6 dB, the loop with the bass +3 dB, back to the song's own level just before the band's pickup (film 14.15)
t = np.arange(film_len) / sr
gdb = np.interp(t, [0, 7.40, 7.60, 13.70, 14.10, 1e9], [6, 6, 3, 3, 0, 0])
film *= db(gdb)[:, None]

c = x[s(C0): s(C1)].copy() * db(12)
ci = s(0.004); c[:ci] *= ramp(ci, 'in')
co = s(0.03); c[-co:] *= ramp(co, 'out')
# a short room tail so the last bell does not just stop where the tape loop cut it
ir_n = s(1.4)
ir = np.random.default_rng(7).standard_normal(ir_n) * np.exp(-np.linspace(0, 7, ir_n))
ir /= np.sqrt((ir ** 2).sum())
wet = np.stack([np.convolve(c[:, ch], ir)[: len(c) + ir_n] for ch in range(2)], 1) * 0.22
c_start = s(FILM_CLUNK - (C_CLUNK - C0))
total = max(film_len, c_start + len(wet)) + s(0.05)
mix = np.zeros((total, 2))
mix[:film_len] += film
mix[c_start: c_start + len(c)] += c
mix[c_start: c_start + len(wet)] += wet

meter = pyln.Meter(sr)
g = -14 - meter.integrated_loudness(mix)
mix *= db(g)
ceil = db(-1.0)
if np.abs(mix).max() > ceil:  # soft ceiling for the few peaks above -1 dBFS
    k = 0.75 * ceil
    over = np.abs(mix) > k
    mix[over] = np.sign(mix[over]) * (k + (ceil - k) * np.tanh((np.abs(mix[over]) - k) / (ceil - k)))
sf.write(os.path.join(W, 'edit.wav'), mix, sr, subtype='PCM_24')
os.system(f"ffmpeg -v error -y -i {os.path.join(W, 'edit.wav')} -ar 48000 -c:a pcm_s24le {os.path.join(W, 'edit48.wav')}")
film_t = lambda song: song - A0 - OFF
print(f"length {len(mix)/sr:.3f} s, gain {g:+.1f} dB, seam at film {SEAM['bass'] - A0:.3f}, band line at film {film_t(D(6)):.3f}, "
      f"word onset film {film_t(40.33):.3f}, word end film {film_t(WORD_END):.3f}, clunk {FILM_CLUNK:.3f}, "
      f"ding {FILM_CLUNK + (10.58 - C_CLUNK):.3f}, peak {20*np.log10(np.abs(mix).max()):.2f} dBFS, LUFS {meter.integrated_loudness(mix):.1f}")
