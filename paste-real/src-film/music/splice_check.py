# Scores how seamless a bar-line splice would be: compares the outgoing bar's last beat with the
# last beat of the bar that naturally precedes the incoming bar (chroma + MFCC on the full mix).
import json, sys, numpy as np, librosa
import os
D = os.path.dirname(os.path.abspath(__file__)) + '/'
cues = json.load(open(D + 'cues_src.json'))
down = {int(k): v for k, v in cues['downbeats'].items()}
y, sr = librosa.load(D + 'allcaps_src48.wav', sr=22050, mono=True)
hop = 256
C = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
M = librosa.feature.mfcc(y=y, sr=sr, hop_length=hop, n_mfcc=20)
fps = sr / hop
def lastbeat(bar):  # features of the last beat of `bar`
    a, b = down[bar] + 0.75 * (down[bar + 1] - down[bar]), down[bar + 1]
    i, j = int(a * fps), int(b * fps)
    c = C[:, i:j]; m = M[:, i:j]
    idx = np.linspace(0, c.shape[1] - 1, 24).astype(int)
    return c[:, idx].flatten(), m[:, idx].flatten()
def sim(u, v):
    u = (u - u.mean()) / (u.std() + 1e-9); v = (v - v.mean()) / (v.std() + 1e-9)
    return float((u * v).mean())
def score(out_bar, in_bar):
    """splice: play bar `out_bar` fully, then continue at bar `in_bar`"""
    if in_bar == out_bar + 1: return 1.0, 1.0
    c1, m1 = lastbeat(out_bar); c2, m2 = lastbeat(in_bar - 1)
    return sim(c1, c2), sim(m1, m2)
if __name__ == '__main__':
    pairs = [tuple(map(int, p.split('>'))) for p in sys.argv[1:]]
    for o, i in pairs:
        c, m = score(o, i)
        print(f'bar {o} -> bar {i}: chroma {c:+.2f}  mfcc {m:+.2f}')
