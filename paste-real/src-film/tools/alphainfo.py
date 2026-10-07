import sys
from PIL import Image
for p in sys.argv[1:]:
    im = Image.open(p).convert('RGBA'); a = im.getchannel('A')
    for th in (5, 30, 128, 250):
        print(p.split('_')[-1][:8], 'th', th, a.point(lambda v: 255 if v > th else 0).getbbox())
