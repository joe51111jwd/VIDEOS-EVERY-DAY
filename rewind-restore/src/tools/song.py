"""Instrumental from demucs stems (vocals dropped). Never committed: it is the song.
usage: python tools/song.py <stem dir> <out.wav>   (stems: drums/bass/other.wav from htdemucs_ft)"""
import os, sys
import numpy as np, soundfile as sf
d, out = sys.argv[1], sys.argv[2]
mix = None
for s in ['drums', 'bass', 'other']:
    x, sr = sf.read(os.path.join(d, s + '.wav'), dtype='float32')
    mix = x if mix is None else mix + x
os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
sf.write(out, mix, sr, subtype='FLOAT')
print('instrumental', out, len(mix) / sr, 's @', sr)
