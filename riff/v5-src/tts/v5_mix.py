# Lays the voice lines on the timeline, writes public/v5/vo.wav, src/v5/cues.json, src/v5/env5.json
#   ROOM=0 for dry studio voices (ElevenLabs); default adds a touch of room to the placeholder voices.
import json, os, numpy as np, soundfile as sf
from scipy.signal import resample_poly, butter, sosfilt, sosfiltfilt
T = 40.0; SR = 44100; n = int(T * SR); rng = np.random.default_rng(5)
ROOM = float(os.environ.get('ROOM', '0.065'))
lines = json.load(open('tts/v5_lines.json'))
wordsf = 'tts/v5_words.json'
WORDS = json.load(open(wordsf)) if os.path.exists(wordsf) else {}
tr = {'u': np.zeros(n), 'r': np.zeros(n)}
cues = []; prev_end = 0.0
hp = butter(2, 75, 'highpass', fs=SR, output='sos')
def trim(a, sr, rel=0.03):
    thr = max(0.004, rel * float(np.abs(a).max()))
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0: return a, 0
    s = max(0, idx[0] - int(0.02 * sr)); e = min(len(a), idx[-1] + int(0.06 * sr))
    return a[s:e], s
def level(a, target_db=-19.0):
    # RMS over the voiced part only, so short and long lines sit at the same loudness
    fr = 1024; e = np.array([np.sqrt(np.mean(a[i:i + fr] ** 2)) for i in range(0, max(1, len(a) - fr), fr)])
    v = e[e > e.max() * 0.25] if len(e) else e
    rms = float(np.sqrt(np.mean(v ** 2))) if len(v) else 1e-4
    return a * (10 ** (target_db / 20) / max(rms, 1e-5))
HI = butter(4, 4500, 'highpass', fs=SR, output='sos')
def deess(a, thr_db=-28.0, ratio=3.0, max_cut_db=7.0):
    # split-band de-esser: only the band above 4.5 kHz is turned down, only while it is loud (s, sh, t)
    hi = sosfiltfilt(HI, a); lo = a - hi
    w = int(0.004 * SR); env = np.sqrt(np.convolve(hi ** 2, np.ones(w) / w, 'same')) + 1e-9
    over = np.maximum(0.0, 20 * np.log10(env) - thr_db)
    cut = np.minimum(max_cut_db, over * (1 - 1 / ratio))
    g = 10 ** (-cut / 20)
    # fast attack, ~25 ms release
    out = np.empty_like(g); c = 1.0; rel = np.exp(-1 / (0.025 * SR))
    for i in range(len(g)):
        c = g[i] if g[i] < c else g[i] + (c - g[i]) * rel
        out[i] = c
    return lo + hi * out
for ln in lines:
    fid = ln['id'].replace('?', '_q')
    a, sr = sf.read(f"public/v5/vo/{fid}.wav")
    if a.ndim > 1: a = a.mean(1)
    a, s0 = trim(a, sr)
    if sr != SR:
        from math import gcd
        g = gcd(SR, sr); a = resample_poly(a, SR // g, sr // g); s0 = s0 * SR / sr
    a = deess(level(sosfilt(hp, a)))
    start = max(ln['at'], prev_end + ln.get('gap', 0.25))
    dur = len(a) / SR
    o = int(start * SR); k = 'u' if ln['who'] == 'Maya' else 'r'
    tr[k][o:o + len(a)] += a[: max(0, n - o)]
    cue = {'id': ln['id'], 'who': ln['who'], 'text': ln['text'], 'a': round(start, 3), 'b': round(start + dur, 3)}
    w = WORDS.get(fid) or []
    if w: cue['words'] = [round(start + max(0.0, x - s0 / SR), 3) for x in w]
    cues.append(cue)
    prev_end = start + dur
irl = int(0.45 * SR); t = np.arange(irl) / SR; ir = rng.standard_normal(irl) * np.exp(-t * 13)
Lf = 1 << int(np.ceil(np.log2(n + irl)))
def room(x, w):
    if not np.any(x) or w <= 0: return x
    y = np.fft.irfft(np.fft.rfft(x, Lf) * np.fft.rfft(ir, Lf), Lf)[:n]
    y *= np.sqrt(np.mean(x ** 2)) / (np.sqrt(np.mean(y ** 2)) + 1e-9)
    return x + y * w
mix = room(tr['u'], ROOM) + room(tr['r'], ROOM * 1.1)
pk = np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix / pk * 1.15) / np.tanh(1.15) * 0.89  # gentle peak control
sf.write('public/v5/vo.wav', np.repeat(mix[:, None], 2, 1).astype(np.float32), SR)  # stereo: Remotion pans mono files 3 dB down
F = int(T * 30); env = {}
for k, x in tr.items():
    hop = SR // 30; e = np.array([np.sqrt(np.mean(x[f * hop:(f + 1) * hop] ** 2)) for f in range(F)])
    m = e.max() or 1; env[k] = [round(float(min(1, v / m * 1.6)), 3) for v in e]
# music ducking curve: the bed dips while anyone speaks and stays down through short gaps between lines,
# so it only rises in real pauses (title card, reveal, end card) instead of bobbing between quick lines
act = np.maximum(np.array(env['u']), np.array(env['r'])) > 0.08
idx = np.where(act)[0]
for a0, b0 in zip(idx[:-1], idx[1:]):
    if 1 < b0 - a0 <= 24: act[a0:b0] = True          # close gaps up to 0.8 s
act = np.convolve(act, np.ones(5), 'same')[2:].tolist() + [0, 0]  # start the dip ~2 frames before the first word
act = np.array(act[:F]) > 0
first = int(np.argmax(act))
if act.any() and first < 18: act[:first] = True  # the film opens on a line: keep the bed down from frame 0
duck = np.zeros(F); d = 1.0 if act[0] else 0.0
for f in range(F):
    tgt = 1.0 if act[f] else 0.0
    d += (tgt - d) * (0.35 if tgt > d else 0.1)
    duck[f] = d
env['duck'] = [round(float(x), 3) for x in duck]
json.dump(cues, open('src/v5/cues.json', 'w'), indent=1)
json.dump(env, open('src/v5/env5.json', 'w'))
for c in cues: print(f"{c['id']:8s} {c['a']:6.2f} {c['b']:6.2f}  {c['text']}")
