from PIL import Image, ImageFilter
import numpy as np
from scipy.ndimage import median_filter, gaussian_filter
im=Image.open('wall16.jpg').convert('RGB')
sm=im.resize((960,540),Image.LANCZOS)
def edges(img, blur):
  g=np.asarray(img.convert('L').filter(ImageFilter.GaussianBlur(blur))).astype(float)
  return np.abs(np.diff(g,axis=1,append=g[:,-1:]))+np.abs(np.diff(g,axis=0,append=g[-1:,:]))
G=edges(sm,1.2); H,W=G.shape
sky=np.full(W,H)
for x in range(W):
  for y in range(70,H):
    if G[y,x]>7: sky[x]=y; break
sky=median_filter(sky,size=9).astype(float)
rm=median_filter(sky,size=61)
sky[790:]=np.maximum(sky[790:], rm[790:]-6)
# full res refine
GF=edges(im,2.0); HF,WF=GF.shape
lo=np.interp(np.arange(WF), np.arange(W)*4+2, sky*4)
sk=np.zeros(WF)
for x in range(WF):
  a=int(max(0,lo[x]-14)); b=int(min(HF,lo[x]+14))
  col=GF[a:b,x]
  idx=np.where(col>5)[0]
  sk[x]=a+idx[0] if len(idx) else lo[x]
sk=median_filter(sk,size=7)
yy=np.arange(HF)[:,None]
m=np.clip((sk[None,:]-yy+1.0)/2.0,0,1)  # 1 = sky, soft 2px edge
Image.fromarray((m*255).astype(np.uint8)).save('sky_mask.png')
# foreground (mountains) as RGBA cut-out for layering in front of the type
rgba=np.dstack([np.asarray(im), ((1-m)*255).astype(np.uint8)])
Image.fromarray(rgba).save('fg.png')
ov=np.asarray(im).astype(float); ov=ov*(1-m[...,None]*0.6)+np.array([0,255,0])*m[...,None]*0.6
Image.fromarray(ov.astype(np.uint8)).resize((1920,1080)).crop((0,200,1920,700)).save('sky_ov2.jpg')
# --- fix right-side cloud notches: in x_full 2900..3700 take a large-window median as the floor
from scipy.ndimage import median_filter as mf
big=mf(sk,size=401)
seg=slice(2900,3700)
sk2=sk.copy(); sk2[seg]=np.maximum(sk[seg], big[seg]-3)
m=np.clip((sk2[None,:]-yy+1.0)/2.0,0,1)
Image.fromarray((m*255).astype(np.uint8)).save('sky_mask.png')
rgba=np.dstack([np.asarray(im), ((1-m)*255).astype(np.uint8)])
Image.fromarray(rgba).resize((2880,1620),Image.LANCZOS).save('fg.png')
ov=np.asarray(im).astype(float); ov=ov*(1-m[...,None]*0.6)+np.array([0,255,0])*m[...,None]*0.6
Image.fromarray(ov.astype(np.uint8)).crop((2600,400,3840,700)).save('sky_ov3.jpg')
a,b=3430,3720
sk3=sk2.copy(); sk3[a:b]=np.linspace(sk2[a],sk2[b],b-a)
m=np.clip((sk3[None,:]-yy+1.0)/2.0,0,1)
Image.fromarray((m*255).astype(np.uint8)).save('sky_mask.png')
rgba=np.dstack([np.asarray(im), ((1-m)*255).astype(np.uint8)])
Image.fromarray(rgba).resize((2880,1620),Image.LANCZOS).save('fg.png')
ov=np.asarray(im).astype(float); ov=ov*(1-m[...,None]*0.6)+np.array([0,255,0])*m[...,None]*0.6
Image.fromarray(ov.astype(np.uint8)).crop((2500,780,3840,1080)).save('sky_ov3.jpg')
np.save('skyline.npy', sk3)
L=np.asarray(im.convert('L').filter(ImageFilter.GaussianBlur(1.5))).astype(float)
sk4=sk2.copy()
for x in range(3000,3840):
  ref=L[700,x]
  col=L[700:1150,x]
  idx=np.where(col<ref-22)[0]
  if len(idx): sk4[x]=700+idx[0]
sk4[3000:]=mf(sk4[3000:],size=5)
# blend into the left part smoothly at 3000
m=np.clip((sk4[None,:]-yy+1.0)/2.0,0,1)
Image.fromarray((m*255).astype(np.uint8)).save('sky_mask.png')
rgba=np.dstack([np.asarray(im), ((1-m)*255).astype(np.uint8)])
Image.fromarray(rgba).resize((2880,1620),Image.LANCZOS).save('fg.png')
ov=np.asarray(im).astype(float); ov=ov*(1-m[...,None]*0.6)+np.array([0,255,0])*m[...,None]*0.6
Image.fromarray(ov.astype(np.uint8)).crop((2500,780,3840,1080)).save('sky_ov3.jpg')
np.save('skyline.npy', sk4)
print(sk4[2990:3010])
