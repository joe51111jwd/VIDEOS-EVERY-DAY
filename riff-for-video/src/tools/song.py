"""Builds the instrumental for one song from its separated stems (vocals dropped) and the A2 waveform envelope.
usage: python3 tools/song.py <song> <stem dir> <film0 second in the excerpt>
writes out/music/<song>.wav plus its drums and the rest (bass + other) separately, so the ending can stop the drums
and let the rest ring (never committed: it is the song), and src/edit/env/<song>.json (30 values/s, 0..1)"""
import json, os, sys
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
song, d, start = sys.argv[1], sys.argv[2], float(sys.argv[3])
st = {}
for s in ['drums', 'bass', 'other']:
    st[s], sr = sf.read(os.path.join(d, s + '.wav'), dtype='float32')
mix = st['drums'] + st['bass'] + st['other']
out = os.path.join(ROOT, 'out', 'music')
os.makedirs(out, exist_ok=True)
sf.write(os.path.join(out, song + '.wav'), mix, sr, subtype='FLOAT')
sf.write(os.path.join(out, song + '-drums.wav'), st['drums'], sr, subtype='FLOAT')
sf.write(os.path.join(out, song + '-rest.wav'), st['bass'] + st['other'], sr, subtype='FLOAT')
# envelope from film 0: RMS per 1/30 s in dB, 36 dB of range under the peak
m = mix.mean(1)[int(start * sr):]
h = sr // 30
n = len(m) // h
rms = np.sqrt((m[:n * h].reshape(n, h) ** 2).mean(1)) + 1e-6
db = 20 * np.log10(rms / rms.max())
env = np.clip((db + 36) / 36, 0, 1)
env = np.convolve(env, [0.25, 0.5, 0.25], mode='same')
json.dump([round(float(v), 3) for v in env], open(os.path.join(ROOT, 'src', 'edit', 'env', song + '.json'), 'w'))
print(song, 'ok', len(mix) / sr, 's,', n, 'env values')
