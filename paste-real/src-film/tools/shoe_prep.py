# crop the chosen shoe cutout to its alpha bbox (+margin), save orange + recolored blue versions
import sys, numpy as np
from PIL import Image
src, outdir = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
a = np.array(im.getchannel('A'))
a[a < 6] = 0  # drop stray near-transparent pixels
ys, xs = np.where(a > 0)
m = 24
x0, x1, y0, y1 = max(0, xs.min() - m), min(im.width, xs.max() + m), max(0, ys.min() - m), min(im.height, ys.max() + m)
arr = np.array(im).astype(np.float32) / 255
arr[..., 3] = a / 255
arr = arr[y0:y1, x0:x1]
print('crop', x0, y0, x1, y1, '->', arr.shape)
def save(rgba, name, w=1600):
    img = Image.fromarray((np.clip(rgba, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA')
    h = round(img.height * w / img.width)
    img.resize((w, h), Image.LANCZOS).save(f'{outdir}/{name}', optimize=True)
    print(name, w, h)
save(arr, 'shoe-orange.png')
# recolor: hue-shift saturated warm pixels to electric blue, keep neutrals (white foam, black rubber)
rgb = arr[..., :3]
mx, mn = rgb.max(-1), rgb.min(-1)
v = mx; c = mx - mn; s = np.where(mx > 1e-6, c / np.maximum(mx, 1e-6), 0)
r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
h = np.zeros_like(v)
cm = c > 1e-6
rr = cm & (mx == r); gg = cm & (mx == g) & ~rr; bb = cm & ~rr & ~gg
h[rr] = ((g - b)[rr] / c[rr]) % 6
h[gg] = (b - r)[gg] / c[gg] + 2
h[bb] = (r - g)[bb] / c[bb] + 4
h = h / 6  # 0..1
hd = np.abs(((h - 0.04 + 0.5) % 1) - 0.5)  # distance from orange hue (~14 deg)
w = np.clip((s - 0.12) / 0.2, 0, 1) * np.clip(1 - (hd - 0.08) / 0.06, 0, 1)
target = 0.618  # ~222 deg
h2 = (target + (h - 0.04)) % 1
# blue reads darker at the same V; lift value a little and keep saturation slightly lower in highlights
v2 = np.clip(v * 1.04 + 0.02, 0, 1); s2 = np.clip(s * 0.97, 0, 1)
def hsv2rgb(h, s, v):
    i = np.floor(h * 6).astype(int) % 6; f = h * 6 - np.floor(h * 6)
    p, q, t = v * (1 - s), v * (1 - f * s), v * (1 - (1 - f) * s)
    out = np.zeros(h.shape + (3,))
    for k, (R, G, B) in enumerate([(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]):
        mk = i == k; out[mk, 0], out[mk, 1], out[mk, 2] = R[mk], G[mk], B[mk]
    return out
blue = hsv2rgb(h2, s2, v2)
rgb2 = rgb * (1 - w[..., None]) + blue * w[..., None]
save(np.concatenate([rgb2, arr[..., 3:4]], -1), 'shoe-blue.png')
