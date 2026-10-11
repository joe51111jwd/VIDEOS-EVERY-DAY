# python3 tools/sheet.py <dir> <prefix> <cols> <tilew>  -> <dir>/sheet_N.jpg (9 per sheet)
import sys, glob
from PIL import Image, ImageDraw
d, prefix, cols, tw = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
fs = sorted(glob.glob(f'{d}/{prefix}_*.jpg'), key=lambda p: int(p.rsplit('_', 1)[1][:-4]))
th = tw * 9 // 16
per = cols * 3
for s in range(0, len(fs), per):
    chunk = fs[s:s + per]
    rows = (len(chunk) + cols - 1) // cols
    im = Image.new('RGB', (cols * tw + (cols + 1) * 6, rows * th + (rows + 1) * 6), (60, 60, 60))
    for i, p in enumerate(chunk):
        t = Image.open(p).resize((tw, th))
        x, y = 6 + (i % cols) * (tw + 6), 6 + (i // cols) * (th + 6)
        im.paste(t, (x, y))
        ImageDraw.Draw(im).text((x + 6, y + 4), p.rsplit('_', 1)[1][:-4], fill=(255, 255, 0))
    im.save(f'{d}/sheet_{s // per}.jpg', quality=88)
    print(f'{d}/sheet_{s // per}.jpg')
