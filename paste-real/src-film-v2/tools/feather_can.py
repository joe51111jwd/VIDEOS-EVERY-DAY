# Fade the shadow-catcher floor in a Blender can render so it ends inside the image (no visible box),
# keeping the can untouched and a soft contact shadow around its base.
import sys
import numpy as np
from PIL import Image, ImageFilter
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
a = np.array(im).astype(np.float32)
al = a[..., 3] / 255.0
H, W = al.shape
core = (al > 0.985).astype(np.uint8) * 255
ys, xs = np.nonzero(al > 0.985)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
cw = x1 - x0
# keep the can (and its anti-aliased edge)
prot = np.array(Image.fromarray(core).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32) / 255.0
# soft halo around the silhouette: ~1 at the edge, gone ~120 px out
halo = np.array(Image.fromarray(core).filter(ImageFilter.GaussianBlur(55))).astype(np.float32) / 255.0
halo = np.clip(halo / 0.45, 0, 1)
# contact shadow on the floor: an ellipse at the base, reaching forward a little
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
cx = (x0 + x1) / 2
d = np.sqrt(((xx - cx) / (cw * 0.85)) ** 2 + ((yy - (y1 + 10)) / 95.0) ** 2)
ell = np.clip(1.25 - d, 0, 1)
ell = ell * ell * (3 - 2 * ell)
f = np.maximum(halo * np.clip((yy - (y0 + (y1 - y0) * 0.55)) / ((y1 - y0) * 0.3), 0, 1), ell)
f = f * f * (3 - 2 * f)
newa = np.maximum(al * prot, al * f * 1.15)
a[..., 3] = np.clip(newa * 255, 0, 255)
Image.fromarray(a.astype(np.uint8)).save(dst)
print('wrote', dst, 'bbox', x0, y0, x1, y1, 'edge alpha max', round(a[-1, :, 3].max(), 2), round(a[:, 0, 3].max(), 2), round(a[:, -1, 3].max(), 2))
