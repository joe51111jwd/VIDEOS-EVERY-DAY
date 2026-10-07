# resize downloaded generations into film/public/img as jpg
import sys
from PIL import Image
src, out, w = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert('RGB')
h = round(im.height * w / im.width)
im.resize((w, h), Image.LANCZOS).save(out, quality=92, optimize=True, progressive=True)
print(out, w, h)
