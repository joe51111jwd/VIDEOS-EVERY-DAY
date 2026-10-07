"""Sound design for Paste Real v2: synthesizes the UI sounds (keys, clicks, ticks, pops), places every cue from
sfx_cues.json (written from the film's own timing) over the song edit, and writes the mix.

usage: python3 sfx_mix.py <bed.wav> <cues.json> <out.wav>
The song is never committed anywhere; this only reads it.
"""
import json
import subprocess
import sys

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def read_wav(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ar', str(SR), '-ac', '2', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def lib(name):
    a = np.fromfile(f'sfx/{name}.f32', dtype=np.float32).reshape(-1, 2).copy()
    return a / (np.abs(a).max() + 1e-9)


def env(n, attack, decay):
    t = np.arange(n) / SR
    e = np.exp(-t / decay)
    if attack > 0:
        e *= np.clip(t / attack, 0, 1)
    return e


def bp_noise(n, lo, hi):
    x = rng.standard_normal(n)
    f = np.fft.rfft(x)
    fr = np.fft.rfftfreq(n, 1 / SR)
    f[(fr < lo) | (fr > hi)] = 0
    y = np.fft.irfft(f, n)
    return y / (np.abs(y).max() + 1e-9)


def stereo(m, width=0.15):
    d = int(SR * 0.0004)
    r = np.concatenate([np.zeros(d), m[:-d]]) if d else m
    return np.stack([m * (1 - width / 2) + r * width / 2, r * (1 - width / 2) + m * width / 2], 1)


def norm(a):
    return a / (np.abs(a).max() + 1e-9)


def key(variant=0, pitch=1.0):
    """a Mac keyboard key: a crisp top click, the scissor 'thock', a soft bottom-out"""
    n = int(SR * 0.12)
    click = bp_noise(n, 2500, 9000) * env(n, 0.0002, 0.0018)
    body = bp_noise(n, 280 * pitch, 1400 * pitch) * env(n, 0.0005, 0.012)
    t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * 190 * pitch * t) * env(n, 0.001, 0.016)
    up_n = int(SR * 0.045)
    up = np.zeros(n)
    s = int(SR * (0.052 + 0.006 * variant))
    up[s:s + up_n] = bp_noise(up_n, 1800, 7000) * env(up_n, 0.0002, 0.0012) * 0.22
    return stereo(norm(click * 0.55 + body * 0.75 + thump * 0.5 + up))


def click():
    """a Force Touch trackpad click: a low tap plus a crisp tick"""
    n = int(SR * 0.05)
    t = np.arange(n) / SR
    tap = np.sin(2 * np.pi * 150 * t) * env(n, 0.0006, 0.007)
    tick = bp_noise(n, 3000, 12000) * env(n, 0.0001, 0.0009)
    return stereo(norm(tap * 0.9 + tick * 0.6), 0.05)


def release():
    n = int(SR * 0.04)
    t = np.arange(n) / SR
    tap = np.sin(2 * np.pi * 210 * t) * env(n, 0.0005, 0.005)
    tick = bp_noise(n, 3500, 12000) * env(n, 0.0001, 0.0007)
    return stereo(norm(tap * 0.6 + tick * 0.7), 0.05)


def tick():
    n = int(SR * 0.04)
    a = bp_noise(n, 1800, 9000) * env(n, 0.0001, 0.0016)
    b = bp_noise(n, 400, 1800) * env(n, 0.0003, 0.006)
    return stereo(norm(a * 0.7 + b * 0.5), 0.3)


def snap():
    """the selection snapping on: a tiny bright ping"""
    n = int(SR * 0.25)
    t = np.arange(n) / SR
    ping = (np.sin(2 * np.pi * 2350 * t) + 0.4 * np.sin(2 * np.pi * 4700 * t)) * env(n, 0.0008, 0.045)
    tick_ = bp_noise(n, 4000, 14000) * env(n, 0.0001, 0.0012)
    return stereo(norm(ping * 0.5 + tick_ * 0.6), 0.25)


def land():
    """the paste landing: a soft round pop with a little weight"""
    n = int(SR * 0.35)
    t = np.arange(n) / SR
    f = 520 * np.exp(-t / 0.03) + 140
    ph = 2 * np.pi * np.cumsum(f) / SR
    pop = np.sin(ph) * env(n, 0.001, 0.05)
    sub = np.sin(2 * np.pi * 62 * t) * env(n, 0.002, 0.09)
    air = bp_noise(n, 2000, 8000) * env(n, 0.0005, 0.006)
    m = norm(pop * 0.8 + sub * 0.55 + air * 0.25)
    lp = lib('pop_soft_1')[:n]
    out = stereo(m, 0.2)
    out[:len(lp)] += lp * 0.35
    return norm(out)


def code_burst():
    """code pouring in: a fast run of soft key ticks"""
    n = int(SR * 0.3)
    out = np.zeros((n, 2))
    k = tick()
    for i in range(14):
        s = int(SR * (i * 0.017 + rng.uniform(0, 0.004)))
        g = 0.5 + 0.5 * (1 - i / 14)
        e = min(n, s + len(k))
        out[s:e] += k[:e - s] * g * rng.uniform(0.6, 1)
    return norm(out)


def card():
    w = lib('whoosh_soft_1')
    s = int(SR * 0.12)
    seg = w[s:s + int(SR * 0.32)].copy()
    seg *= env(len(seg), 0.01, 0.12)[:, None]
    return norm(seg)


def window():
    w = lib('whoosh_soft_2')[int(SR * 0.1):int(SR * 0.5)].copy()
    w *= env(len(w), 0.005, 0.1)[:, None]
    return norm(w)


def trim(a, start, dur):
    s = int(SR * start)
    return a[s:s + int(SR * dur)].copy()


SOUNDS = {
    'key': [key(0, 1.0), key(1, 1.05), key(2, 0.96)],
    'key_mod': [key(1, 0.86)],
    'tick': [key(0, 1.25) * 0.8, key(1, 1.3) * 0.8, key(2, 1.2) * 0.8],
    'click': [click()],
    'release': [release()],
    'snap': [snap()],
    'copied': [norm(lib('pop_soft_1'))],
    'whoosh': [norm(trim(lib('whoosh_soft_1'), 0.1, 0.6))],
    'land': [land()],
    'sweep': [norm(trim(lib('shimmer_1'), 0, 1.0))],
    'window': [window()],
    'grow': [norm(trim(lib('shimmer_2'), 0, 0.8))],
    'code': [code_burst()],
    'boom': [norm(lib('boom_logo_1'))],
    'card': [card()],
    'tick_glass': [snap()],
    'riser': [norm(lib('riser_1'))],
}
# where each sound's hit is inside its sample (so the hit, not the file start, lands on the cue)
ONSET = {'whoosh': 0.06, 'copied': 0.018, 'riser': 0.0}
SFX_GAIN_DB = -10.0


def main():
    bed_p, cues_p, out_p = sys.argv[1:4]
    bed = read_wav(bed_p)
    cues = json.load(open(cues_p))['events']
    sfx = np.zeros_like(bed)
    count = {}
    for t, name, g in cues:
        v = SOUNDS[name]
        i = count.get(name, 0)
        count[name] = i + 1
        a = v[i % len(v)]
        s = int(round((t - ONSET.get(name, 0)) * SR))
        if s < 0:
            a = a[-s:]
            s = 0
        e = min(len(sfx), s + len(a))
        sfx[s:e] += a[:e - s] * 10 ** ((SFX_GAIN_DB + g) / 20)
    mix = bed + sfx
    pk = np.abs(mix).max()
    print('bed peak %.1f dB, sfx peak %.1f dB, mix peak %.1f dB' % (20 * np.log10(np.abs(bed).max()), 20 * np.log10(np.abs(sfx).max() + 1e-9), 20 * np.log10(pk)))
    mix.astype(np.float32).tofile(out_p + '.f32')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', out_p + '.f32', '-c:a', 'pcm_f32le', out_p], check=True)
    sfx.astype(np.float32).tofile(out_p + '.sfx.f32')


if __name__ == '__main__':
    main()
