# contact sheet: composite RGBA images over cream bg, label index, alpha stats
import sys
from PIL import Image, ImageDraw
paths = sys.argv[2:]; out = sys.argv[1]
W = 600
tiles = []
for i, p in enumerate(paths):
    im = Image.open(p).convert('RGBA')
    a = im.getchannel('A')
    hist = a.histogram()
    tot = sum(hist); opaque = sum(hist[250:]); clear = sum(hist[:5])
    bbox = a.getbbox()
    print(i, p.split('/')[-1][:40], im.size, 'opaque%.2f clear%.2f partial%.3f' % (opaque/tot, clear/tot, 1-(opaque+clear)/tot), 'bbox', bbox)
    bg = Image.new('RGBA', im.size, (240, 233, 222, 255))
    bg.alpha_composite(im)
    t = bg.convert('RGB').resize((W, int(W * im.size[1] / im.size[0])))
    d = ImageDraw.Draw(t); d.text((10, 10), str(i), fill=(0, 0, 0))
    tiles.append(t)
h = max(t.size[1] for t in tiles)
sheet = Image.new('RGB', (W * len(tiles), h), 'white')
for i, t in enumerate(tiles): sheet.paste(t, (i * W, 0))
sheet.save(out)
