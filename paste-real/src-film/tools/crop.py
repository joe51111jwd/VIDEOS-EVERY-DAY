import sys
from PIL import Image
src, out, x0, y0, x1, y1 = sys.argv[1], sys.argv[2], *map(int, sys.argv[3:7])
scale = float(sys.argv[7]) if len(sys.argv) > 7 else 1.0
im = Image.open(src).convert('RGBA')
bg = Image.new('RGBA', im.size, (240, 233, 222, 255)); bg.alpha_composite(im)
c = bg.crop((x0, y0, x1, y1)).convert('RGB')
if scale != 1.0: c = c.resize((int(c.size[0]*scale), int(c.size[1]*scale)), Image.LANCZOS)
c.save(out)
