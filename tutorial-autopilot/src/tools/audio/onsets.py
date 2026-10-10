"""Find the verb onsets of Technologic's verse on the vocal stem.

usage: python3 onsets.py <vocals.wav> <mix.wav> <t0> <t1> [first_verb_time] [--write onsets.json --start S --end E]

Prints beats (from the mix) and vocal onsets (backtracked to the start of the consonant) between t0 and t1.
With first_verb_time, it walks the beat grid from there and takes, for each of the 64 verbs, the vocal onset
nearest its beat (the robot says one "<verb> it" per beat), then writes src times for src/film/onsets.json.
"""
import sys, json
import numpy as np
import librosa

N_VERBS = 64  # one verb per beat in a verse run

args = [a for a in sys.argv[1:]]
opts = {}
for k in ('--write', '--start', '--end'):
    if k in args:
        i = args.index(k); opts[k] = args[i + 1]; del args[i:i + 2]
voc_p, mix_p, t0, t1 = args[0], args[1], float(args[2]), float(args[3])
first = float(args[4]) if len(args) > 4 else None

sr = 44100
hop = 128
mix, _ = librosa.load(mix_p, sr=sr, mono=True)
voc, _ = librosa.load(voc_p, sr=sr, mono=True)

tempo, beats = librosa.beat.beat_track(y=mix, sr=sr, hop_length=512, start_bpm=127, units='time')
tempo = float(np.atleast_1d(tempo)[0])
print(f'tempo {tempo:.2f} BPM  beat {60 / tempo:.4f}s')

env = librosa.onset.onset_strength(y=voc, sr=sr, hop_length=hop, n_mels=128, fmax=12000)
on = librosa.onset.onset_detect(onset_envelope=env, sr=sr, hop_length=hop, backtrack=True, units='time', delta=0.04, wait=3)
rms = librosa.feature.rms(y=voc, frame_length=1024, hop_length=hop)[0]
rt = librosa.times_like(rms, sr=sr, hop_length=hop)


def lvl(t):
    i = np.searchsorted(rt, t)
    return float(rms[min(i + 4, len(rms) - 1)])


bs = [b for b in beats if t0 <= b <= t1]
os_ = [o for o in on if t0 <= o <= t1]
print('beats:', ' '.join(f'{b:.3f}' for b in bs))
print('vocal onsets (time, rms after):')
print('  '.join(f'{o:.3f}({lvl(o):.3f})' for o in os_))

if first is not None:
    beat = 60 / tempo
    # refine the grid on the mix beats near each expected verb time
    out = []
    t = first
    for i in range(N_VERBS):
        cand = [o for o in on if abs(o - t) < 0.16]
        pick = min(cand, key=lambda o: abs(o - t)) if cand else None
        src = pick if pick is not None else t
        out.append({'i': i, 'src': round(float(src), 4), 'found': pick is not None})
        print(f'verb_{i + 1:02d} expect {t:8.3f}  onset {src:8.3f}  {"" if pick is not None else "(grid)"}')
        # next verb: one beat after this one, re-anchored on what we found (but never drifting more than 60 ms)
        t = (src if pick is not None and abs(src - t) < 0.06 else t) + beat
    if '--write' in opts:
        start = float(opts.get('--start', out[0]['src'] - 0.30))
        end = float(opts.get('--end', out[-1]['src'] + 0.9))
        json.dump({'beat': beat, 'filmStartSrc': start, 'verbs': [{k: v for k, v in o.items() if k != 'found'} for o in out], 'end': end}, open(opts['--write'], 'w'), indent=1)
        print('wrote', opts['--write'])
