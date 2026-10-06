# Photographic finish: gentle S-curve, split-tone, vignette, fine grain. usage: grade.py in.png out.png [strength]
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
src, dst = sys.argv[1], sys.argv[2]
k = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
im = Image.open(src)
alpha = None
if im.mode == 'RGBA':
    alpha = np.asarray(im)[..., 3]
x = np.asarray(im.convert('RGB')).astype(np.float32) / 255
lum = (x * [0.2126, 0.7152, 0.0722]).sum(-1, keepdims=True)
s = lum * lum * (3 - 2 * lum)
x = x + (s - lum) * 0.55 * k
lum = (x * [0.2126, 0.7152, 0.0722]).sum(-1, keepdims=True)
x = x + (1 - lum) * np.array([-0.012, 0.0, 0.018]) * k + lum * np.array([0.018, 0.006, -0.014]) * k
x = lum + (x - lum) * (1 - 0.08 * k)
h, w = x.shape[:2]
yy, xx = np.mgrid[0:h, 0:w]
r2 = ((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2
if alpha is None:
    x = x * (1 - 0.13 * k * np.clip(r2 - 0.15, 0, None))[..., None]
g = gaussian_filter(np.random.default_rng(1).standard_normal((h, w)).astype(np.float32), 0.6)
x = x + g[..., None] * 0.016 * k
x = np.clip(x, 0, 1)
out = Image.fromarray((x * 255 + 0.5).astype(np.uint8))
if alpha is not None:
    out.putalpha(Image.fromarray(alpha))
out.save(dst)
print('graded', dst)
