# Brings the ElevenLabs music + SFX deliveries into the project.
#   bvenv/bin/python tts/v5_audio_ingest.py music_b title=10.20 jump=15.9:2.141
# SFX:   /mnt/project-files/riff/sfx/*.mp3 -> public/v5/sfx/*.wav, names in src/v5/sfx.json, timing notes in src/v5/sfx_meta.json
# Music: /mnt/project-files/riff/music/riff_<which>.mp3 -> public/v5/music.wav, the length of the film.
#   title=S   music time of the track's title hit; it is placed on the film's title card (cut after "...go with it?")
#   offset=S  or place the track by hand (film time of music time 0; negative skips the start)
#   jump=A:D  at music time A jump back D seconds (one bar), repeating that bar so later sections land later
import glob, json, os, subprocess, sys
import numpy as np, soundfile as sf, pyloudnorm as pyln

SR = 44100
# film length follows the voice timeline (same rule as Film5.tsx V5_DURATION)
_cues = json.load(open('src/v5/cues.json'))
T = min(40.0, round((next(c for c in _cues if c['id'] == 'love')['b'] + 0.6 + 4.7) * 30) / 30)
os.makedirs('public/v5/sfx', exist_ok=True)


def decode(path, ch=2):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, ch).copy()


def rms100(a):
    m = a.mean(1); w = int(0.1 * SR)
    if len(m) <= w: return float(np.sqrt(np.mean(m ** 2)))
    c = np.cumsum(np.r_[0, m ** 2]); return float(np.sqrt((c[w:] - c[:-w]).max() / w))


SKIP = {'tap_glass_1'}          # near silence with a hiss floor only 21 dB down
KEEP = {'pop_soft_2': 0.2}      # second transient at 0.32 s, keep the first pop only
GATE = {'tap_glass_2': 0.07}    # short tap, then close the gate over the hiss
NO_TRIM = ('riser',)            # risers keep their quiet start; the film aligns their peak instead
names, meta = [], {}
for p in sorted(glob.glob('/mnt/project-files/riff/sfx/*.mp3')):
    name = os.path.splitext(os.path.basename(p))[0]
    if name in SKIP: continue
    a = decode(p)
    e = np.abs(a).max(1)
    if not name.startswith(NO_TRIM):
        idx = np.where(e > 0.02 * (e.max() or 1))[0]   # trim leading silence so the hit lands on its cue
        if len(idx): a = a[max(0, idx[0] - int(0.004 * SR)):]
    if name in KEEP: a = a[:int(KEEP[name] * SR)]
    if name in GATE:
        g0 = int(GATE[name] * SR); k = len(a) - g0
        if k > 0: a[g0:] *= np.exp(-np.arange(k) / (0.025 * SR))[:, None]
    # same loudness for every effect (loudest 100 ms at -16 dBFS RMS), peaks capped, so cue volumes compare directly
    s = min(10 ** (-16 / 20) / max(rms100(a), 1e-6), 0.95 / (np.abs(a).max() + 1e-9))
    a = a * s
    fade = min(len(a), int(0.06 * SR)); a[-fade:] *= np.linspace(1, 0, fade)[:, None]
    sf.write(f'public/v5/sfx/{name}.wav', a, SR)
    pk = float(np.argmax(np.convolve(np.abs(a).max(1), np.ones(441) / 441, 'same')) / SR)
    meta[name] = {'dur': round(len(a) / SR, 3), 'peak_t': round(pk, 3), 'rms100_db': round(20 * np.log10(rms100(a) + 1e-9), 1)}
    names.append(name)
json.dump(names, open('src/v5/sfx.json', 'w'))
json.dump(meta, open('src/v5/sfx_meta.json', 'w'), indent=1)
for k, v in meta.items(): print(f'sfx {k:16s} {v}')

args = dict(a.split('=') for a in sys.argv[2:] if '=' in a)
which = sys.argv[1] if len(sys.argv) > 1 else 'music_b'
L = {c['id']: c for c in _cues}
title_film = L['app?']['b'] + 0.15   # Film5.tsx T.title[0]
end_film = L['love']['b'] + 0.6      # Film5.tsx T.end
offset = title_film - float(args['title']) if 'title' in args else float(args.get('offset', 0))
mp = f'/mnt/project-files/riff/music/riff_{which}.mp3'
m = decode(mp)
jump = None
if 'jump' in args:
    ja, jd = map(float, args['jump'].split(':')); jump = (ja, jd)
    a, b, x = int(ja * SR), int((ja - jd) * SR), int(0.03 * SR)
    ramp = np.sqrt(np.linspace(0, 1, x))[:, None]
    m = np.concatenate([m[:a], m[a:a + x] * ramp[::-1] + m[b:b + x] * ramp, m[b + x:]])
n = int(T * SR)
out = np.zeros((n, 2), dtype=np.float32)
o = int(offset * SR)
src = m[max(0, -o):]
dst0 = max(0, o)
k = min(len(src), n - dst0)
out[dst0:dst0 + k] = src[:k]
fi = int(0.2 * SR)
if o < 0: out[:fi] *= np.linspace(0, 1, fi)[:, None]  # joining mid-phrase: short fade in
f = int(1.2 * SR)
if len(src) > n - dst0:  # the track runs past the end: fade its last 1.2 s
    out[-f:] *= np.linspace(1, 0, f)[:, None] ** 1.5
# loudness-normalise the bed (the film sets its level and ducking under the voices)
lufs = pyln.Meter(SR).integrated_loudness(out[dst0:dst0 + k])
out *= 10 ** ((-16 - lufs) / 20)
pk = np.abs(out).max()
if pk > 0.95: out *= 0.95 / pk
sf.write('public/v5/music.wav', out, SR)
print(f'music: {mp} {len(m) / SR:.1f}s offset {offset:+.3f} jump {jump} film {T}s, was {lufs:.1f} LUFS')
if which == 'music_b':  # where the track's landmarks fall on the film
    sh = lambda t: t + (jump[1] if jump and t > jump[0] else 0) + offset
    print(f'  title hit {sh(10.20):.2f} (title card {title_film:.2f}) | final hit {sh(34.85):.2f} (end card {end_film:.2f}, wordmark {end_film + 0.75:.2f}) | ring-out ends {sh(38.5):.2f} (film {T})')
