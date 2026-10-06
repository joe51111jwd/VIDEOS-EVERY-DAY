# Procedural latte-art textures (top view of the coffee surface), 2048px.
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates

N = 2048
rng = np.random.default_rng(7)
y, x = np.mgrid[0:N, 0:N]
u = (x / (N - 1)) * 2 - 1
v = (y / (N - 1)) * 2 - 1  # +v is "down" (toward the handle side / viewer)
r = np.sqrt(u * u + v * v)

def hexc(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)])

def noise(sigma, amp=1.0, seed=None):
    g = np.random.default_rng(seed).standard_normal((N, N))
    g = gaussian_filter(g, sigma)
    g /= g.std() + 1e-9
    return g * amp

def smooth(e0, e1, t):
    t = np.clip((t - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)

def ellipse(cx, cy, rx, ry, uu, vv):
    return ((uu - cx) / rx) ** 2 + ((vv - cy) / ry) ** 2  # <1 inside

def crema(dark=0.0):
    c_center, c_mid, c_edge, c_ring = hexc('#B5804F'), hexc('#8C5833'), hexc('#5A341D'), hexc('#EADBC8')
    t = np.clip(r, 0, 1)
    col = np.where((t < 0.55)[..., None], c_center + (c_mid - c_center) * (t / 0.55)[..., None],
                   c_mid + (c_edge - c_mid) * ((t - 0.55) / 0.45)[..., None])
    ring = smooth(0.955, 0.992, t + 0.004 * noise(3, 1, 5))
    col = col + (c_ring - col) * (ring * 0.6)[..., None]
    ang = np.arctan2(v, u)
    swirl = np.sin(ang * 3 + r * 9 + noise(30, 0.8, 4)) * 0.03
    mott = noise(40, 0.05, 1) + noise(9, 0.02, 2) + noise(1.0, 0.012, 3) + swirl
    col = col * (1 + mott)[..., None]
    col = col * (1 - dark)
    return col

def finish(col, foam, name):
    foam = np.clip(foam, 0, 1)
    foam_s = gaussian_filter(foam, 4.5)
    a = smooth(0.18, 0.82, foam_s)
    halo = np.clip(gaussian_filter(foam, 14) - a, 0, 1)
    base = crema()
    base = base * (1 - 0.35 * halo)[..., None]
    fcol = hexc('#F6EDE0') * (1 + noise(1.0, 0.025, 11) + noise(10, 0.02, 12))[..., None]
    inner = gaussian_filter(foam, 16)
    edge_tint = np.clip(1 - (inner - 0.5) * 2.2, 0, 1) * a
    fcol = fcol + (hexc('#D8B996') - fcol) * (edge_tint * 0.55)[..., None]
    out = base + (fcol - base) * a[..., None]
    # outside the cup rim: fully transparent-ish neutral (not visible)
    out = np.clip(out, 0, 1)
    img = Image.fromarray((out * 255).astype(np.uint8))
    img.save(f'tex/{name}.png')
    print('wrote', name)

def tulip():
    # pull-through drags foam down along the centre line -> heart-shaped layers
    pull = 0.13 * np.exp(-(u / 0.085) ** 2)
    vv = v - pull
    uu = u * (1 + 0.012 * noise(60, 1, 21))
    layers = [  # (cy, rx, ry) from the first (largest, bottom) pour to the last
        (0.30, 0.56, 0.40),
        (0.02, 0.43, 0.27),
        (-0.24, 0.31, 0.19),
        (-0.45, 0.20, 0.12),
    ]
    foam = np.zeros((N, N))
    for i, (cy, rx, ry) in enumerate(layers):
        inside = ellipse(0, cy, rx, ry, uu, vv) < 1
        if i + 1 < len(layers):
            ncy, nrx, nry = layers[i + 1]
            gap = ellipse(0, ncy + 0.03, nrx + 0.022, nry + 0.022, uu, vv) < 1
            inside = inside & ~gap
        foam = np.maximum(foam, inside.astype(float))
    # the white line of the pull-through, tapering toward the bottom
    w = 0.010 + 0.006 * np.clip((0.55 - v), 0, 1)
    line = (np.abs(u) < w) & (v > -0.50) & (v < 0.62)
    foam = np.maximum(foam, line.astype(float))
    finish(None, foam, 'latte_tulip')

def rosetta():
    uu = u + 0.02 * noise(50, 1, 31)
    vv = v
    foam = np.zeros((N, N))
    n = 10
    for k in range(n):
        cy = 0.52 - k * 0.095
        w = 0.62 - k * 0.048
        th = 0.055 - k * 0.0025
        a = ellipse(0, cy, w, w * 0.62, uu, vv) < 1
        b = ellipse(0, cy - th - 0.02, w * 0.97, w * 0.62, uu, vv) < 1
        foam = np.maximum(foam, (a & ~b).astype(float))
    # small heart on top
    foam = np.maximum(foam, (ellipse(0, -0.48, 0.12, 0.08, uu, vv - 0.05 * np.exp(-(uu / 0.05) ** 2)) < 1).astype(float))
    line = (np.abs(uu) < 0.008 + 0.004 * np.clip(v + 0.5, 0, 1)) & (v > -0.45) & (v < 0.66)
    foam = np.maximum(foam, line.astype(float))
    foam *= (r < 0.9)
    finish(None, foam, 'latte_rosetta')

def espresso():
    col = crema(dark=0.05)
    tiger = noise(3, 1, 41)
    tiger = gaussian_filter(np.where(tiger > 1.2, 1.0, 0.0), 2)
    col = col * (1 - 0.25 * tiger)[..., None]
    img = Image.fromarray((np.clip(col, 0, 1) * 255).astype(np.uint8))
    img.save('tex/latte_espresso.png'); print('wrote espresso')

tulip(); rosetta(); espresso()
