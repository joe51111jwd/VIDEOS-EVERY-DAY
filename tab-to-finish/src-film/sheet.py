import sys
from PIL import Image
comp=sys.argv[1]; out=sys.argv[2]; ts=sys.argv[3:]
ims=[Image.open(f'/home/user/ttf/out/s_{comp}_{t}.png') for t in ts]
w,h=ims[0].size; k=960/w; W,H=960,int(h*k)
ims=[im.resize((W,H)) for im in ims]
rows=(len(ims)+1)//2
c=Image.new('RGB',(W*2,H*rows),'white')
for i,im in enumerate(ims): c.paste(im,((i%2)*W,(i//2)*H))
c.save(out,quality=85)
