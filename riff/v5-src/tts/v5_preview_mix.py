# Rebuilds the film's audio mix in numpy, from the same timeline Remotion uses (src/v5/timeline.ts),
# so levels can be checked in seconds instead of an 8-minute audio render.
#   bvenv/bin/python tts/v5_preview_mix.py [compare.wav]
# Writes out/mix/preview.wav and prints loudness per stem; with compare.wav, how closely it matches a Remotion render.
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf, pyloudnorm as pyln

SR = 44100; FPS = 30
tl = '/tmp/claude-0/-home-claude/1eae2301-dd86-5442-9c2f-23c87472c9f6/scratchpad/timeline.cjs'
subprocess.run(['npx', 'esbuild', 'src/v5/timeline.ts', '--bundle', '--platform=node', '--format=cjs', '--log-level=warning', f'--outfile={tl}'], check=True)
D = json.loads(subprocess.run(['node', '-e', f"const t=require('{tl}');console.log(JSON.stringify({{d:t.V5_DURATION,T:t.T,SFX:t.SFX}}))"], capture_output=True, text=True, check=True).stdout)
film = open('src/v5/Film5.tsx').read()
MUSIC = float(re.search(r'const MUSIC = ([\d.]+);', film).group(1))
DUCK = float(re.search(r'const DUCK = ([\d.]+);', film).group(1))
N = int(round(D['d'] * FPS)) * SR // FPS


def load(p):
    a, sr = sf.read(p, always_2d=True)
    assert sr == SR, p
    if a.shape[1] == 1: a = np.repeat(a, 2, 1)
    out = np.zeros((N, 2)); k = min(N, len(a)); out[:k] = a[:k]
    return out


vo = load('public/v5/vo.wav')
music = load('public/v5/music.wav')
duck = np.array(json.load(open('src/v5/env5.json'))['duck'])
fv = MUSIC * (1 - DUCK * duck)                       # per-frame volume, as Remotion evaluates it
tt = np.arange(N) / SR
music *= np.interp(tt * FPS, np.arange(len(fv)), fv)[:, None]
sfx = np.zeros((N, 2))
for e in D['SFX']:
    p = f"public/v5/sfx/{e['f']}.wav"
    if not os.path.exists(p): continue
    a, _ = sf.read(p, always_2d=True)
    o = round(max(0, e['t']) * FPS) * SR // FPS
    k = min(len(a), N - o)
    if k > 0: sfx[o:o + k] += a[:k] * e['v']
mix = vo + music + sfx
sf.write('out/mix/preview.wav', mix.astype(np.float32), SR)

meter = pyln.Meter(SR)
def lufs(x):
    try: return meter.integrated_loudness(x)
    except Exception: return float('nan')
def short_term(x, win=3.0, hop=0.5):
    w, h = int(win * SR), int(hop * SR)
    return np.array([lufs(x[i:i + w]) for i in range(0, len(x) - w, h)])
tp = lambda x: 20 * np.log10(np.abs(x).max() + 1e-12)
print(f'film {D["d"]:.2f}s  MUSIC {MUSIC} DUCK {DUCK}')
for name, x in [('voice', vo), ('music', music), ('sfx', sfx), ('mix', mix)]:
    print(f'  {name:6s} integrated {lufs(x):6.1f} LUFS   peak {tp(x):6.1f} dBFS')
# music under speech vs between lines
sp = np.repeat(duck > 0.5, SR // FPS)[:N]
if sp.any() and (~sp).any():
    print(f'  music while speaking {lufs(music[sp]):6.1f} LUFS, between lines {lufs(music[~sp]):6.1f} LUFS, voice while speaking {lufs(vo[sp]):6.1f} LUFS')
# each effect against what plays around it
print('  sfx vs bed (peak 100 ms RMS, dB):')
for e in D['SFX']:
    p = f"public/v5/sfx/{e['f']}.wav"
    if not os.path.exists(p): continue
    o = round(max(0, e['t']) * FPS) * SR // FPS; w = int(0.6 * SR)
    seg = lambda x: x[o:o + w].mean(1)
    def r100(m):
        if len(m) < 4410: return -99
        c = np.cumsum(np.r_[0, m ** 2]); return 10 * np.log10((c[4410:] - c[:-4410]).max() / 4410 + 1e-12)
    print(f'    {e["t"]:6.2f} {e["f"]:14s} v{e["v"]:.2f}  sfx {r100(seg(sfx)):6.1f}  voice {r100(seg(vo)):6.1f}  music {r100(seg(music)):6.1f}')
if len(sys.argv) > 1:
    ref, _ = sf.read(sys.argv[1], always_2d=True); k = min(len(ref), N)
    a, b = ref[:k].mean(1), mix[:k].mean(1)
    print(f'compare with {sys.argv[1]}: correlation {np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)):.4f}, level diff {20 * np.log10(np.linalg.norm(a) / np.linalg.norm(b)):+.2f} dB')
