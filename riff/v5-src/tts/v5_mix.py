# Lays the voice lines on the timeline, writes public/v5/vo.wav, src/v5/cues.json, src/v5/env5.json
#   ROOM=0 for dry studio voices (ElevenLabs); default adds a touch of room to the placeholder voices.
import json, os, numpy as np, soundfile as sf
from scipy.signal import resample_poly, butter, sosfilt
T = 38.5; SR = 44100; n = int(T * SR); rng = np.random.default_rng(5)
ROOM = float(os.environ.get('ROOM', '0.065'))
lines = json.load(open('tts/v5_lines.json'))
wordsf = 'tts/v5_words.json'
WORDS = json.load(open(wordsf)) if os.path.exists(wordsf) else {}
tr = {'u': np.zeros(n), 'r': np.zeros(n)}
cues = []; prev_end = 0.0
hp = butter(2, 75, 'highpass', fs=SR, output='sos')
def trim(a, sr, thr=0.012):
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
for ln in lines:
    fid = ln['id'].replace('?', '_q')
    a, sr = sf.read(f"public/v5/vo/{fid}.wav")
    if a.ndim > 1: a = a.mean(1)
    a, s0 = trim(a, sr)
    if sr != SR:
        from math import gcd
        g = gcd(SR, sr); a = resample_poly(a, SR // g, sr // g); s0 = s0 * SR / sr
    a = level(sosfilt(hp, a))
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
sf.write('public/v5/vo.wav', mix.astype(np.float32), SR)
F = int(T * 30); env = {}
for k, x in tr.items():
    hop = SR // 30; e = np.array([np.sqrt(np.mean(x[f * hop:(f + 1) * hop] ** 2)) for f in range(F)])
    m = e.max() or 1; env[k] = [round(float(min(1, v / m * 1.6)), 3) for v in e]
json.dump(cues, open('src/v5/cues.json', 'w'), indent=1)
json.dump(env, open('src/v5/env5.json', 'w'))
for c in cues: print(f"{c['id']:8s} {c['a']:6.2f} {c['b']:6.2f}  {c['text']}")
