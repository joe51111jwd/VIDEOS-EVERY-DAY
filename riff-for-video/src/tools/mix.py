"""Mix voice, music and SFX from out/cues.json into out/mix.wav (48 kHz stereo, -14 LUFS, -1 dBTP).
usage: python3 tools/mix.py [music.wav] [music_offset_s]"""
import json, subprocess, sys, os
import numpy as np

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

def load(path):
    raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()

def place(buf, x, t, gain=1.0):
    i = int(round(t * SR))
    if i < 0:
        x, i = x[-i:], 0
    n = min(len(x), len(buf) - i)
    if n > 0:
        buf[i:i + n] += x[:n] * gain

def smooth(env, att, rel):
    out = np.zeros_like(env)
    a = np.exp(-1 / (att * SR)); r = np.exp(-1 / (rel * SR)); y = 0.0
    for k in range(0, len(env), 64):  # block-rate follower is plenty for ducking
        v = env[k]
        y = a * y + (1 - a) * v if v > y else r * y + (1 - r) * v
        out[k:k + 64] = y
    return out

cues = json.load(open(P('out', 'cues.json')))
N = int(round((cues['duration'] + 0.4) * SR))
voice = np.zeros((N, 2), np.float32); music = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)
for l in cues['voice']:
    place(voice, load(P('public', 'vo', l['id'] + '.wav')), l['a'])
for t, name, g in cues['sfx']:
    place(sfx, load(P('public', 'sfx', name + '.wav')), t, g)
m = cues['music']
mpath = sys.argv[1] if len(sys.argv) > 1 else P('out', 'music', m['file'] + '.wav')
off = float(sys.argv[2]) if len(sys.argv) > 2 else m['offset']
# with stems (tools/song.py), the drums stop at `drumsOut` while the rest rings out to the end of `fadeOut`
stems = 'drumsOut' in m and len(sys.argv) <= 1 and os.path.exists(P('out', 'music', m['file'] + '-drums.wav'))
drums = np.zeros((N, 2), np.float32)
if stems:
    place(drums, load(P('out', 'music', m['file'] + '-drums.wav')), -off)
    place(music, load(P('out', 'music', m['file'] + '-rest.wav')), -off)
else:
    place(music, load(mpath), -off)
# duck the music under each spoken command
act = np.zeros(N, np.float32)
for l in cues['voice']:
    act[int((l['a'] - 0.08) * SR):int((l['b'] + 0.1) * SR)] = 1
env = smooth(act, 0.06, 0.35)
g = m['gain'] * (1 - m['duck'] * env)
t = np.arange(N) / SR
f0, f1 = m['fadeOut']
g *= np.clip((f1 - t) / (f1 - f0), 0, 1) ** 2  # the last hit rings out rather than fading flat
g *= np.clip(t / 0.005, 0, 1)  # no click on the first downbeat
if stems:
    d0, d1 = m['drumsOut']
    music += drums * np.clip((d1 - t) / (d1 - d0), 0, 1)[:, None]
music *= g[:, None]
mix = voice * 1.0 + music + sfx * 0.8
mix = mix[:int(round(cues['duration'] * SR))]
os.makedirs(P('out'), exist_ok=True)
rawp = P('out', 'mix_raw.wav')
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_f32le', rawp], input=mix.astype(np.float32).tobytes(), check=True)
# two-pass loudnorm to -14 LUFS / -1 dBTP
st = subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-i', rawp, '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(st[st.rindex('{'):st.rindex('}') + 1])
af = 'loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true,aresample=48000' % (j['input_i'], j['input_tp'], j['input_lra'], j['input_thresh'], j['target_offset'])
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', rawp, '-af', af, '-ar', '48000', '-c:a', 'pcm_s16le', P('out', 'mix.wav')], check=True)
print('mix ok', j['input_i'], '->', 'out/mix.wav')
