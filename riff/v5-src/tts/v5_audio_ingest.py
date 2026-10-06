# Brings the ElevenLabs music + SFX deliveries into the project.
#   bvenv/bin/python tts/v5_audio_ingest.py [music_a|music_b] [music_offset_seconds]
# SFX: /mnt/project-files/riff/sfx/*.mp3 -> public/v5/sfx/*.wav, list in src/v5/sfx.json
# Music: /mnt/project-files/riff/music/riff_music_<a|b>.mp3 -> public/v5/music.wav (38.5 s, faded tail)
import glob, json, os, subprocess, sys
import numpy as np, soundfile as sf

SR = 44100
T = 38.5
os.makedirs('public/v5/sfx', exist_ok=True)


def decode(path, ch=2):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, ch).copy()


names = []
for p in sorted(glob.glob('/mnt/project-files/riff/sfx/*.mp3')):
    name = os.path.splitext(os.path.basename(p))[0]
    a = decode(p)
    # trim leading silence so the hit lands on its cue; normalise peaks
    e = np.abs(a).max(1)
    idx = np.where(e > 0.02 * (e.max() or 1))[0]
    if len(idx):
        a = a[max(0, idx[0] - int(0.005 * SR)):]
    a = a / (np.abs(a).max() + 1e-9) * 0.9
    fade = min(len(a), int(0.08 * SR))
    a[-fade:] *= np.linspace(1, 0, fade)[:, None]
    sf.write(f'public/v5/sfx/{name}.wav', a, SR)
    names.append(name)
json.dump(names, open('src/v5/sfx.json', 'w'))
print('sfx:', names)

which = sys.argv[1] if len(sys.argv) > 1 else 'music_a'
offset = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
mp = f"/mnt/project-files/riff/music/riff_{which}.mp3"
if os.path.exists(mp):
    m = decode(mp)
    n = int(T * SR)
    out = np.zeros((n, 2), dtype=np.float32)
    o = int(offset * SR)
    src = m[max(0, -o):]
    dst0 = max(0, o)
    k = min(len(src), n - dst0)
    out[dst0:dst0 + k] = src[:k]
    # fade the last 1.2 s if the track runs past the end
    f = int(1.2 * SR)
    if len(m) - max(0, -o) + dst0 > n:
        out[-f:] *= np.linspace(1, 0, f)[:, None] ** 1.5
    out = out / (np.abs(out).max() + 1e-9) * 0.89
    sf.write('public/v5/music.wav', out, SR)
    print('music:', mp, f'{len(m) / SR:.1f}s', 'offset', offset)
else:
    print('no music file at', mp)
